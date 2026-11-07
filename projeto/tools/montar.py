#!/usr/bin/env python3
"""EFCwork — monta o app de arquivo único (Método Sabiá).
Junta src/index.html com os módulos na ordem de MODULOS e grava dist/index.html.
Também copia sw.js (com a versão), manifest e ícones para dist/.
Uso: python3 tools/montar.py
"""
import os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DIST = os.path.join(RAIZ, 'src'), os.path.join(RAIZ, 'dist')
# ordem importa: base primeiro (ajudantes, dados), depois a casca e as telas
MODULOS = ['base', 'casca', 'servicos', 'planilha', 'tabela', 'almox', 'lanca', 'contagem', 'calibracao', 'lugares', 'nota', 'sino', 'busca', 'coletas', 'entrar', 'inicio', 'areas', 'adm']

def ler(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def main():
    html = ler(os.path.join(SRC, 'index.html'))
    css, js = [], []
    for m in MODULOS:
        pc, pj = os.path.join(SRC, m + '.css'), os.path.join(SRC, m + '.js')
        if os.path.exists(pc): css.append('/* ===== ' + m + '.css ===== */\n' + ler(pc))
        if os.path.exists(pj): js.append('/* ===== ' + m + '.js ===== */\n' + ler(pj))
    ver = re.search(r"const VERSAO = '([0-9.]+)'", ler(os.path.join(SRC, 'base.js')))
    if not ver: sys.exit('VERSAO não encontrada em src/base.js')
    ver = ver.group(1)
    assert html.count('/*__CSS__*/') == 1 and html.count('/*__JS__*/') == 1
    html = html.replace('/*__CSS__*/', '\n'.join(css)).replace('/*__JS__*/', '\n'.join(js))
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    sw = ler(os.path.join(SRC, 'sw.js')).replace('__VERSAO__', 'efcwork-' + ver)
    with open(os.path.join(DIST, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(sw)
    for a in ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']:
        p = os.path.join(SRC, 'estaticos', a)
        if os.path.exists(p): shutil.copy(p, os.path.join(DIST, a))
    print('dist/index.html montado · versão', ver, '·', len(html) // 1024, 'KB')

if __name__ == '__main__':
    main()
