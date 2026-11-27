#!/usr/bin/env python3
"""EFCwork v0.6.39 · página de aprovação da limpeza visual (ITENS 233 a 238).
Fotos e filmes do app de verdade: tools/testes/telas/v0639/ (tirados por cap.js nesta pasta).
Saída: docs/aprovacao-efcwork-v0.6.39-limpeza-visual.html"""
import base64, io, os, re, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/testes/telas/v0639')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()
# reaproveita o estilo extra e o script de respostas da página da v0.6.35
ANT = open(os.path.join(R, 'tools/visual/v0635b/monta.py')).read()
EXTRA = re.search(r'EXTRA = """(.*?)"""', ANT, re.S).group(1)
JS = re.search(r'\nJS = r"""(.*?)"""', ANT, re.S).group(1).replace("'efcwork-v0635b-respostas'", "'efcwork-v0639-respostas'").replace('Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro', 'Respostas EFCwork v0.6.39 · limpeza visual')
assert 'efcwork-v0639-respostas' in JS

def img(n, larg=1100, crop=None):
    im = Image.open(os.path.join(T, n + '.png')).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def z(n, alt, larg=None):
    larg = larg or (560 if '-cel' in n else 1200)
    return '<button type="button" class="zoom" aria-label="Ampliar: %s"><img src="%s" alt="%s"></button>' % (html.escape(alt), img(n, larg), html.escape(alt))
def um(n, leg): return '<div><p class="leg">%s</p>%s</div>' % (html.escape(leg), z(n, leg))
def filme(n, leg):
    v = base64.b64encode(open(os.path.join(T, n + '.mp4'), 'rb').read()).decode()
    return '<div><p class="leg">%s</p><video class="vd" muted loop playsinline controls preload="metadata" aria-label="%s" poster="%s" src="data:video/mp4;base64,%s"></video></div>' % (html.escape(leg), html.escape(leg), img(n, 390 if '-cel' in n else 960), v)
def lado(*a, cls='lado'): return '<div class="%s">%s</div>' % (cls, ''.join(a))


ITENS = []
def it(n, t, p, corpo, opcoes=None): ITENS.append(dict(n=n, t=t, p=p, corpo=corpo, opcoes=opcoes))
def ops(lista, fig):
    return ''.join('<div class="opb"><p class="opn">OPÇÃO %s</p><b>%s</b><p class="opd">%s</p>%s</div>' % (n, html.escape(t), html.escape(d), fig(n)) for n, t, d in lista)

# ITEM 233 · botão dourado
BT = [('1', 'Sem o brilho', 'Tira só o brilho que passa sozinho. Degradê, borda fina e sombra ficam.'),
      ('2', 'Sem brilho e sem sombra (minha sugestão)', 'Fica o degradê dourado com a borda fina. Segue a sua regra "sombra ou borda, nunca as duas".'),
      ('3', 'Sem brilho e sem borda', 'Fica o degradê com a sombra curta embaixo.'),
      ('4', 'Cor lisa', 'Dourado liso com borda fina, sem degradê, sem sombra e sem brilho. O mais simples.'),
      ('5', 'Brilho só quando o mouse chega', 'Parado, igual à OPÇÃO 2. No PC, o brilho passa uma vez quando o mouse chega no botão. No celular não aparece.')]
fig = lambda n: lado(um('bt-bt%s-claro' % n, 'Claro'), um('bt-bt%s-escuro' % n, 'Escuro'), cls='lado bts') + (lado(filme('bt-bt5', 'Movimento no PC: o brilho só passa quando o mouse chega'), um('bt-bt5-claro-mouse', 'Com o mouse em cima'), cls='lado vids') if n == '5' else '')
corpo = '<div class="hj2">' + lado(filme('bt-hoje', 'HOJE em movimento: o brilho passa sozinho a cada 6 segundos, sem parar'), um('bt-hoje-claro-tela', 'HOJE: a ficha inteira'), cls='lado vids') + lado(um('bt-hoje-claro', 'HOJE · Claro'), um('bt-hoje-escuro', 'HOJE · Escuro'), cls='lado bts') + '</div>' + ops(BT, fig)
it(233, 'Botão dourado: o brilho que passa a cada 6 segundos', 'É o maior enfeite que sobrou no app: animação que não para e não informa nada, mais degradê, borda e sombra juntos. Foi uma exceção aprovada antes; a varredura pediu para você rever. Escolha uma forma.', corpo, opcoes=5)

# ITEM 234 a 237 · Escuro
it(234, 'Escuro: título da tela em dourado liso', 'Hoje o título é escrito com degradê (claro à esquerda, escuro à direita). Texto em degradê é um dos sinais mais conhecidos de "cara de IA". Proposta: dourado liso, da cor do tema, e o traço embaixo também liso.',
   lado(um('esc-hoje-titulo', 'HOJE'), um('esc-t234-titulo', 'PROPOSTA')))
it(235, 'Escuro: linha da aba escolhida lisa', 'Hoje a linha embaixo da aba escolhida (Painel, Materiais…) é um degradê. Proposta: dourado liso, igual ao tema Claro.',
   lado(um('esc-hoje-abas', 'HOJE'), um('esc-t235-abas', 'PROPOSTA')))
it(236, 'Escuro: item escolhido do menu liso', 'Hoje o fundo do item escolhido no menu desbota da esquerda para a direita, e a barrinha ao lado é um degradê. Proposta: fundo dourado bem leve e barrinha lisa, iguais ao tema Claro.',
   lado(um('esc-hoje-menu', 'HOJE'), um('esc-t236-menu', 'PROPOSTA')))
it(237, 'Escuro: fundo sem o brilho roxo', 'No canto de baixo, à esquerda, o fundo tem um brilho roxo fraco. Roxo é o sinal mais famoso de "cara de IA" e não é cor do app. Fica o brilho dourado no alto e a trama.',
   lado(um('esc-hoje-canto', 'HOJE: canto de baixo'), um('esc-t237-canto', 'PROPOSTA: canto de baixo')) + lado(um('esc-hoje-pc', 'HOJE: tela inteira'), um('esc-t237-pc', 'PROPOSTA: tela inteira')) + lado(um('esc-hoje-cel', 'HOJE: celular'), um('esc-t237-cel', 'PROPOSTA: celular'), cls='lado cels'))

# ITEM 238 · escala de letras
import json
TAM = json.load(open(os.path.join(T, 'tamanhos.json')))
ES = [('1', '9 tamanhos: 11 · 12 · 13 · 14 · 15 · 16 · 18 · 22 · 28', 'Só tira os meios-tamanhos (12,5 e 13,5) e os tamanhos soltos. Quase nada muda à vista.'),
      ('2', '8 tamanhos: 12 · 13 · 14 · 15 · 16 · 18 · 22 · 28', 'Como a OPÇÃO 1, e o 11 vira 12 (as letras mais miúdas ficam um pouco maiores).'),
      ('3', '7 tamanhos: 12 · 13 · 14 · 15 · 18 · 22 · 28 (minha sugestão)', 'Como a OPÇÃO 2, e o 16 vira 15. O texto continua do tamanho de hoje; bate a meta de até 7.'),
      ('4', '7 tamanhos: 12 · 13 · 14 · 16 · 18 · 22 · 28', 'O texto normal e os campos passam de 15 para 16: um pouco maiores, e o iPhone deixa de aumentar a tela quando você toca num campo.'),
      ('5', '6 tamanhos: 12 · 14 · 16 · 18 · 22 · 28', 'Letras maiores em quase tudo (13 vira 14, 15 vira 16). Mais fácil de ler no campo; cabe menos na tela (veja a tabela no celular).')]
fig = lambda n: lado(um('e-e%s-mat-pc' % n, 'PC: Materiais'), um('e-e%s-gaveta-pc' % n, 'PC: Novo material'), um('e-e%s-mat-cel' % n, 'Celular'), cls='lado tri')
corpo = '<div class="hj2">' + lado(um('e-hoje-mat-pc', 'HOJE · PC: Materiais'), um('e-hoje-gaveta-pc', 'HOJE · PC: Novo material'), um('e-hoje-mat-cel', 'HOJE · Celular'), cls='lado tri') + '</div>' + ops(ES, fig)
it(238, 'Escala de letras: de 19 tamanhos para poucos', 'Hoje o CSS do app usa 19 tamanhos de letra diferentes (fora a tela de entrar, que fica como foi aprovada, e a impressão), com meios-tamanhos como 12,5 e 13,5. Diferença pequena demais para o olho perceber, só deixa o visual menos firme. Escolha uma escala. Toque nas fotos para comparar de perto.', corpo, opcoes=5)
REFS = [('https://github.com/heydamir/unslop', 'Unslop (Damir Sokolovsky)', 'Lista de sinais de interface feita por IA; base da auditoria visual da família: degradê roxo, brilho atrás de botão.'),
        ('https://github.com/Laith0003/ux-skill/wiki/Anti-AI-slop-ban-list', 'Anti AI slop ban list', 'Texto de título em degradê: usar uma cor só. Fundo com degradê roxo: usar cor lisa.'),
        ('https://designsystem.shoptet.cz/Accessibility/ForDesigners/Typography', 'Shoptet Design System: tipografia', 'Evitar diferenças pequenas de tamanho (15 contra 16): a pessoa não percebe.'),
        ('https://dev.to/7twilight/why-many-design-systems-only-need-4-text-sizes-and-why-thats-totally-fine-3oj2', 'Por que poucos tamanhos de letra bastam', 'Com tamanhos demais, cada tela escolhe um ao acaso.')]

def item_html(x):
    if x['opcoes']:
        voto = '<div class="voto">' + ''.join('<input type="radio" id="r%d_%d" name="r%d" value="OPÇÃO %d"><label for="r%d_%d" class="ok">OPÇÃO %d</label>' % (x['n'], m, x['n'], m, x['n'], m, m) for m in range(1, x['opcoes'] + 1)) + '<input type="radio" id="r%d_n" name="r%d" value="Reprovado (nenhuma)"><label for="r%d_n" class="no">Nenhuma</label></div>' % (x['n'], x['n'], x['n'])
    else:
        voto = '<div class="voto"><input type="radio" id="r%d_a" name="r%d" value="Aprovado"><label for="r%d_a" class="ok">Aprovado</label><input type="radio" id="r%d_r" name="r%d" value="Reprovado"><label for="r%d_r" class="no">Reprovado</label></div>' % ((x['n'],) * 6)
    return ('<section class="it" data-n="%d" data-t="%s"><div class="seg"><div class="num">ITEM<span>%d</span></div><div class="cab"><h3>%s</h3><p>%s</p></div></div>%s'
            '<div class="resp">%s<label class="com">Comentário (opcional)<textarea id="c%d" rows="2"></textarea></label></div></section>') % (
        x['n'], html.escape(x['t']), x['n'], html.escape(x['t']), html.escape(x['p']), x['corpo'], voto, x['n'])

EXTRA += """
.cels{grid-template-columns:repeat(2,minmax(0,300px))!important}
.hj{grid-template-columns:minmax(0,3.4fr) minmax(0,1fr)!important}
.opb{border:1px solid var(--bd);border-radius:var(--rs);padding:12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.opb .opn{font-size:40px}.opb b{font-size:17px}
.vids{display:grid;grid-template-columns:minmax(0,3.3fr) minmax(0,1fr);gap:12px;align-items:start}
.vd{display:block;width:100%;border:1px solid var(--bd);border-radius:var(--rs);background:var(--c2)}
.paradas{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start;padding-top:10px}
summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}
.resp .voto{flex-wrap:wrap}.resp .voto label{white-space:nowrap;min-width:96px;padding:0 12px}
.rf{margin:0;padding-left:20px}.rf li{margin-bottom:6px}.rf a{color:var(--aTx)}
.tb{max-width:860px}
@media (max-width:760px){.vids,.hj{grid-template-columns:1fr!important}.vids>div+div{max-width:280px}.paradas{grid-template-columns:1fr 1fr}.paradas>div:first-child{grid-column:1/-1}.tb{font-size:14px}.tb thead{display:none}.tb tr,.tb td{display:block}.tb td{border:0;padding:4px 0}.tb tr{border-bottom:1px solid var(--bd);padding:6px 0}.resp .voto label{flex:1 1 28%}.tb td:first-child{font-weight:700}.tb td:nth-child(2)::before{content:"HOJE: ";font-weight:700;color:var(--tx3)}.tb td:nth-child(3)::before{content:"PROPOSTA: ";font-weight:700;color:var(--aTx)}}
"""

EXTRA += """
.bts{grid-template-columns:repeat(2,minmax(0,340px))!important}
.tri{grid-template-columns:minmax(0,2.2fr) minmax(0,2.2fr) minmax(0,1fr)!important;align-items:start}
.hj2{display:flex;flex-direction:column;gap:12px;padding:10px;border:1px dashed var(--bd);border-radius:var(--rs)}
@media (max-width:760px){.bts{grid-template-columns:1fr 1fr!important}.tri{grid-template-columns:1fr!important}.tri>div:last-child{max-width:280px}}
"""

VJS = r"""
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var v = [].slice.call(document.querySelectorAll('video'));
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var x = e.target; if (e.isIntersecting) { var p = x.play(); if (p && p.catch) p.catch(function () {}); } else x.pause(); }); }, { threshold: .4 });
  v.forEach(function (x) { io.observe(x); });
})();
"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.39 · limpeza visual</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.39</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Limpeza visual</h1><p class="sub">Itens C1, C2 e C3 da varredura de 20/11, mais o brilho roxo do Escuro. Fotos e vídeos do app de verdade (v0.6.38 no ar) com dados inventados. Nada aplicado ainda.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha). Os vídeos tocam sozinhos.</li><li>Nos ITENS 233 e 238 escolha uma OPÇÃO; nos outros, Aprovado ou Reprovado.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in ITENS) +
       '<div class="fim"><h2>Referências que olhei</h2><ul class="rf">' + ''.join('<li><a href="%s" target="_blank" rel="noopener">%s</a>: %s</li>' % (u, html.escape(t), html.escape(d)) for u, t, d in REFS) + '</ul>'
       '<h2>Vai junto, sem mudar a tela</h2><ul><li>O medidor visual passa a conferir também Programação, Plano de coleta, o sino aberto e a busca (varredura C5).</li></ul>'
       '<h2>O que não deu para provar</h2><ul><li>iPhone e Safari.</li><li>A mudança de letras em todas as telas: fotografei três; o medidor confere as outras depois da sua escolha.</li></ul>'
       '<h2>Depois da sua resposta</h2><ul><li>Aplico só o aprovado, testo tudo de novo e publico.</li><li>Firebase: nada a configurar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + VJS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.39-limpeza-visual.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
