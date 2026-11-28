#!/usr/bin/env python3
"""EFCwork — monta o app de arquivo único (Método Sabiá).
Junta src/index.html com os módulos na ordem de MODULOS e grava dist/index.html.
Também copia sw.js (com a versão), manifest e ícones para dist/.
Uso: python3 tools/montar.py
"""
import base64, hashlib, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DIST = os.path.join(RAIZ, 'src'), os.path.join(RAIZ, 'dist')
# ordem importa: base primeiro (ajudantes, dados), depois a casca e as telas
MODULOS = ['movimento', 'base', 'casca', 'servicos', 'planilha', 'tabela', 'almox', 'lanca', 'almcad', 'contagem', 'calibracao', 'lugares', 'nota', 'sino', 'busca', 'coletas', 'agua', 'aguarem', 'aguaac', 'aguapj', 'cadcol', 'documentos', 'efd', 'efdponte', 'impressos', 'impvt', 'ponte', 'janelas', 'vertice', 'etiquetas', 'kit', 'remdocs', 'fotoed', 'inspecoes', 'apont', 'auditoria', 'auapres', 'analise', 'anp', 'treino', 'nc', 'bugs', 'aprovar', 'programacao', 'plano', 'rateio', 'relatorios', 'semana', 'almmes', 'reldocs', 'relapont', 'entrar', 'inicio', 'tarefas', 'areas', 'atividade', 'adm', 'pessoas', 'sover', 'backup', 'foto', 'vertpastas', 'fluidez', 'moderno', 'versao']

# módulos que moram fora de src/ (arquivo comum da família, não duplicar)
DE_FORA = {'efd': os.path.join('tools', 'contrato', 'efd-v1.js'), 'efdponte': os.path.join('tools', 'contrato', 'efd-ponte.js'), 'movimento': os.path.join('tools', 'visual', 'efc-movimento.js')}
# v0.6.14: a escala de movimento também tem o CSS fora de src/ (arquivo comum da família)
DE_FORA_CSS = {'movimento': os.path.join('tools', 'visual', 'efc-movimento.css')}

# v0.6.38: versão do SDK do Firebase (bibliotecas "compat", as mesmas chamadas de antes), num lugar só: index.html, sw.js e a CSP
SDK = '13.4.0'

# v0.6.38 (varredura S4): regra de segurança (CSP) que o navegador aplica antes de rodar qualquer script.
# Só roda o script do próprio app (pelo hash calculado aqui, a cada montagem), o SDK do Firebase e o reCAPTCHA do App Check.
# Um script posto na página por um ataque (texto com <script> ou onerror=) não roda.
def csp(h):
    return '; '.join([
        "default-src 'self'",
        "script-src '" + h + "' https://www.gstatic.com/firebasejs/" + SDK + "/ https://www.google.com/recaptcha/enterprise.js https://www.gstatic.com/recaptcha/releases/",  # revisor 26/11: a pasta inteira do reCAPTCHA tem arquivo que serve de atalho para rodar script
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' data: blob: https://*.googleapis.com https://www.google.com/recaptcha/",
        "frame-src 'self' https://eliasgrigori.github.io blob: https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://docseliasflorencio.firebaseapp.com",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "media-src 'self' data: blob:",
        "object-src 'self' blob:",
        "base-uri 'none'",
        "form-action 'self'",
    ])

def ler(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def main():
    html = ler(os.path.join(SRC, 'index.html'))
    css, js = [], []
    for m in MODULOS:
        pc, pj = os.path.join(SRC, m + '.css'), os.path.join(SRC, m + '.js')
        if m in DE_FORA: pj = os.path.join(RAIZ, DE_FORA[m])  # v0.6.9: o conferente do contrato é o mesmo arquivo do Vértice Docs
        if m in DE_FORA_CSS: pc = os.path.join(RAIZ, DE_FORA_CSS[m])
        if os.path.exists(pc): css.append('/* ===== ' + m + '.css ===== */\n' + ler(pc))
        if os.path.exists(pj): js.append('/* ===== ' + m + '.js ===== */\n' + ler(pj))
    ver = re.search(r"const VERSAO = '([0-9.]+)'", ler(os.path.join(SRC, 'base.js')))
    if not ver: sys.exit('VERSAO não encontrada em src/base.js')
    ver = ver.group(1)
    assert html.count('/*__CSS__*/') == 1 and html.count('/*__JS__*/') == 1
    html = html.replace('/*__CSS__*/', '\n'.join(css)).replace('/*__JS__*/', '\n'.join(js)).replace('__SDK__', SDK)
    # o hash vale para o texto exato entre <script> e </script> (sem src); um só bloco assim no arquivo
    blocos = re.findall(r'<script>(.*?)</script>', html, re.S)
    assert len(blocos) == 1 and '<script>' not in blocos[0], 'esperava um só script sem src'
    h = 'sha256-' + base64.b64encode(hashlib.sha256(blocos[0].encode('utf-8')).digest()).decode()
    assert html.count('<!--__CSP__-->') == 1
    html = html.replace('<!--__CSP__-->', '<meta http-equiv="Content-Security-Policy" content="' + csp(h) + '">')
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    sw = ler(os.path.join(SRC, 'sw.js')).replace('__VERSAO__', 'efcwork-' + ver).replace('__SDK__', SDK)
    with open(os.path.join(DIST, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(sw)
    for a in ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']:
        p = os.path.join(SRC, 'estaticos', a)
        if os.path.exists(p): shutil.copy(p, os.path.join(DIST, a))
    print('dist/index.html montado · versão', ver, '· SDK', SDK, '·', len(html) // 1024, 'KB')

if __name__ == '__main__':
    main()
