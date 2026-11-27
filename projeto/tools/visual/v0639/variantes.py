#!/usr/bin/env python3
"""EFCwork v0.6.39 · limpeza visual (varredura C1, C2, C3 e o brilho roxo do Escuro).
Cada proposta é uma mudança no CSS de src/. Uso:
  python3 variantes.py montar <pasta>   monta um dist para cada proposta em <pasta>/<nome>/ (para as capturas)
  python3 variantes.py aplicar <nome>…  aplica as propostas aprovadas no src/ de verdade"""
import os, re, shutil, subprocess, sys, tempfile
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

def troca(src, arq, a, b):
    p = os.path.join(src, arq); s = open(p, encoding='utf-8').read()
    assert s.count(a) == 1, (arq, a[:60], s.count(a)); open(p, 'w', encoding='utf-8').write(s.replace(a, b))

# ITEM 233 · botão dourado (C1): cinco formas
BRILHO = '@media (prefers-reduced-motion:no-preference){.bt.pr::after{animation:ouroBrilho 6s ease-in-out infinite}} /* mov:ok — reflexo do botão dourado, exceção aprovada */'
SOMBRA = '.bt.pr{background:var(--ouro);border-color:#c99d48;color:#1c1406;position:relative;overflow:hidden;box-shadow:0 4px 14px rgba(217,180,106,.25),inset 0 1px 0 rgba(255,255,255,.35)}'
SOMBRA_H = '.bt.pr:hover:not([disabled]){transform:translateY(-1px);box-shadow:0 8px 20px rgba(217,180,106,.34),inset 0 1px 0 rgba(255,255,255,.4)}'
MOD = '.bt.pr{box-shadow:0 1px 0 rgba(255,255,255,.4) inset,0 0 0 1px rgba(122,86,20,.18),0 1px 2px rgba(60,42,8,.28)}'
MOD_H = '.bt.pr:hover:not([disabled]){box-shadow:0 1px 0 rgba(255,255,255,.45) inset,0 0 0 1px rgba(122,86,20,.26),0 2px 4px rgba(60,42,8,.24),0 6px 12px -4px rgba(60,42,8,.3)}'
def bt1(s): troca(s, 'base.css', BRILHO, '/* v0.6.39 (ITEM 233): sem o brilho que passava a cada 6 s */')
def bt2(s):
    bt1(s); troca(s, 'base.css', SOMBRA, SOMBRA.replace('box-shadow:0 4px 14px rgba(217,180,106,.25),inset 0 1px 0 rgba(255,255,255,.35)', 'box-shadow:none'))
    troca(s, 'base.css', SOMBRA_H, '.bt.pr:hover:not([disabled]){transform:translateY(-1px)}')
    troca(s, 'moderno.css', MOD, '.bt.pr{box-shadow:none}'); troca(s, 'moderno.css', MOD_H, '.bt.pr:hover:not([disabled]){box-shadow:none}')
def bt3(s):
    bt1(s); troca(s, 'base.css', SOMBRA, SOMBRA.replace('border-color:#c99d48', 'border-color:transparent'))
    troca(s, 'moderno.css', MOD, MOD.replace('0 0 0 1px rgba(122,86,20,.18),', '')); troca(s, 'moderno.css', MOD_H, MOD_H.replace('0 0 0 1px rgba(122,86,20,.26),', ''))
def bt4(s):
    bt2(s); troca(s, 'base.css', '.bt.pr{background:var(--ouro);border-color:#c99d48', '.bt.pr{background:#d9b46a;border-color:#c99d48')
def bt5(s):
    bt2(s); troca(s, 'base.css', '/* v0.6.39 (ITEM 233): sem o brilho que passava a cada 6 s */',
        '/* v0.6.39 (ITEM 233): o brilho passa uma vez quando o mouse chega no botão */\n@media (prefers-reduced-motion:no-preference) and (hover:hover){.bt.pr:hover:not([disabled])::after{animation:ouroPassa var(--duration-very-slow) var(--ease-smooth-out) 1}}\n@keyframes ouroPassa{from{left:-60%}to{left:130%}}')

def bt5o(s):  # aprovado em 27/11 03:25: "OPÇÃO 5 — Original": visual de hoje (degradê, borda e sombra); o brilho só passa quando o mouse chega
    troca(s, 'base.css', BRILHO, '/* v0.6.39 (ITEM 233, OPÇÃO 5 com o visual original): o brilho passa uma vez quando o mouse chega no botão; parado, não se mexe */\n@media (prefers-reduced-motion:no-preference) and (hover:hover){.bt.pr:hover:not([disabled])::after{animation:ouroPassa var(--duration-very-slow) var(--ease-smooth-out) 1}}\n@keyframes ouroPassa{from{left:-60%}to{left:130%}}')

# ITEM 234 a 236 · degradês dentro do app no Escuro (C2): passam a usar a cor lisa do tema
def t234(s):
    troca(s, 'casca.css', ':root[data-tema="escuro"] .cs-ph h1{background:linear-gradient(90deg,#f7e2a8,#d9b46a 60%,#c29640);-webkit-background-clip:text;background-clip:text;color:transparent}\n', '')
    troca(s, 'casca.css', ':root[data-tema="escuro"] .cs-ph h1::after{background:linear-gradient(90deg,#f7df9e,#b4862f)}\n', '')
def t235(s):
    troca(s, 'casca.css', ':root[data-tema="escuro"] .cs-abas a.on{border-image:linear-gradient(90deg,#f7df9e,#b4862f) 1}\n', '')
    troca(s, 'fluidez.css', ':root[data-tema="escuro"] .fz-linha{background:linear-gradient(90deg,#f7df9e,#b4862f)}\n', '')
def t236(s):
    troca(s, 'casca.css', ':root[data-tema="escuro"] .cs-it.on{background:linear-gradient(90deg,rgba(217,180,106,.18),rgba(217,180,106,.04));color:#f0d48f}\n', '')
    troca(s, 'casca.css', ':root[data-tema="escuro"] .cs-it.on::before{background:linear-gradient(180deg,#f7df9e,#b4862f)}\n', '')
# ITEM 237 · fundo do Escuro: tira o brilho roxo do canto de baixo (fica o dourado do alto e a trama)
def t237(s): troca(s, 'base.css', 'radial-gradient(42% 36% at -6% 104%,rgba(120,96,200,.16),transparent 72%),', '')

# ITEM 238 · escala de letras (C3): cinco escalas. Só tamanhos em px do app; a tela de entrar (modelo aprovado) e a impressão (pt) ficam.
BASE = {10: 11, 11.5: 12, 12.5: 13, 13.5: 14, 17: 16, 19: 18, 20: 18, 21: 22, 23: 22, 24: 22, 26: 28, 30: 28}
ESCALAS = {
    'e1': dict(BASE),                                        # 11 12 13 14 15 16 18 22 28 (9)
    'e2': {**BASE, 11: 12},                            # 12 13 14 15 16 18 22 28 (8)
    'e3': {**BASE, 11: 12, 16: 15},                    # 12 13 14 15 18 22 28 (7, corpo 15)
    'e4': {**BASE, 11: 12, 15: 16},                    # 12 13 14 16 18 22 28 (7, corpo 16)
    'e5': {**BASE, 11: 12, 13: 14, 15: 16, 12.5: 14},  # 12 14 16 18 22 28 (6, letras maiores)
}
FORA = {'entrar.css'}
def escala(nome):
    m = ESCALAS[nome]
    def fim(v):  # 10 → 11 → 12: segue até um tamanho da escala
        v = float(v)
        while v in m and m[v] != v: v = float(m[v])
        return v
    def f(s):
        for a in sorted(os.listdir(s)):
            if not a.endswith('.css') or a in FORA: continue
            p = os.path.join(s, a); t = open(p, encoding='utf-8').read()
            n = re.sub(r'(font-size:|font:(?:[1-9]00 )?)(\d+(?:\.\d+)?)px', lambda x: x.group(1) + '%spx' % fmt(fim(x.group(2))), t)
            if n != t: open(p, 'w', encoding='utf-8').write(n)
    return f
fmt = lambda v: str(int(v)) if float(v).is_integer() else str(v)

PROPOSTAS = dict(bt5o=bt5o, bt1=bt1, bt2=bt2, bt3=bt3, bt4=bt4, bt5=bt5, t234=t234, t235=t235, t236=t236, t237=t237, **{k: escala(k) for k in ESCALAS})

def montar(saida):
    os.makedirs(saida, exist_ok=True)
    for nome, f in [('hoje', None)] + list(PROPOSTAS.items()):
        d = tempfile.mkdtemp(); shutil.copytree(os.path.join(R, 'src'), os.path.join(d, 'src')); shutil.copytree(os.path.join(R, 'tools'), os.path.join(d, 'tools'), ignore=shutil.ignore_patterns('telas', 'testes', '*.png', '*.mp4', '*.webm', 'node_modules'))
        if f: f(os.path.join(d, 'src'))
        subprocess.run([sys.executable, '-I', os.path.join(d, 'tools', 'montar.py')], cwd=d, check=True, capture_output=True)
        dst = os.path.join(saida, nome)
        if os.path.exists(dst): shutil.rmtree(dst)
        shutil.copytree(os.path.join(d, 'dist'), dst); shutil.rmtree(d)
        print('montado', nome)

if __name__ == '__main__':
    if sys.argv[1] == 'montar': montar(os.path.abspath(sys.argv[2]))
    elif sys.argv[1] == 'aplicar':
        for n in sys.argv[2:]: PROPOSTAS[n](os.path.join(R, 'src')); print('aplicado', n)
