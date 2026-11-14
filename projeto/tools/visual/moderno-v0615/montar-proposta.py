#!/usr/bin/env python3
"""Monta dist-proposta/index.html: o app de verdade (dist/index.html) + as PROPOSTAS de modernização da v0.6.15
(moderno.css e moderno.js). Sem classe mo* no <html> o app fica igual ao de hoje; cada classe liga uma proposta.
Uso: python3 tools/montar.py && python3 tools/visual/moderno-v0615/montar-proposta.py"""
import pathlib
R = pathlib.Path(__file__).resolve().parents[3]
M = R / 'tools/visual/moderno-v0615'
app = (R / 'dist/index.html').read_text(encoding='utf-8')
assert app.count('</body>') == 1
extra = '<style id="moderno-v0615">\n' + (M / 'moderno.css').read_text(encoding='utf-8') + '\n</style>\n<script id="moderno-v0615-js">\n' + (M / 'moderno.js').read_text(encoding='utf-8') + '\n</script>\n'
out = app.replace('</body>', extra + '</body>')
d = R / 'dist-proposta'; d.mkdir(exist_ok=True)
(d / 'index.html').write_text(out, encoding='utf-8')
print('dist-proposta/index.html montado ·', len(out) // 1024, 'KB')
