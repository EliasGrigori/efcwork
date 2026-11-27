#!/usr/bin/env python3
"""EFCwork v0.6.37 · página de aprovação do aviso de versão nova (ITENS 226 a 232).
Fotos e filmes do app de verdade: tools/testes/telas/v0637/ (tirados por cap.js nesta pasta).
Saída: docs/aprovacao-efcwork-v0.6.37-aviso-versao.html"""
import base64, io, os, re, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/testes/telas/v0637')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()
# reaproveita o estilo extra e o script de respostas da página da v0.6.35
ANT = open(os.path.join(R, 'tools/visual/v0635b/monta.py')).read()
EXTRA = re.search(r'EXTRA = """(.*?)"""', ANT, re.S).group(1)
JS = re.search(r'\nJS = r"""(.*?)"""', ANT, re.S).group(1).replace("'efcwork-v0635b-respostas'", "'efcwork-v0637-respostas'").replace('Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro', 'Respostas EFCwork v0.6.37 · aviso de versão nova')
assert 'efcwork-v0637-respostas' in JS

def img(n, larg=1100, crop=None):
    im = Image.open(os.path.join(T, n + '.png')).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def z(n, alt, larg=None):
    return '<button type="button" class="zoom" aria-label="Ampliar: %s"><img src="%s" alt="%s"></button>' % (html.escape(alt), img(n, larg or (560 if '-cel' in n else 1200)), html.escape(alt))
def um(n, leg): return '<div><p class="leg">%s</p>%s</div>' % (html.escape(leg), z(n, leg))
def filme(n, leg):
    v = base64.b64encode(open(os.path.join(T, n + '.mp4'), 'rb').read()).decode()
    return '<div><p class="leg">%s</p><video class="vd" muted loop playsinline controls preload="metadata" aria-label="%s" poster="%s" src="data:video/mp4;base64,%s"></video></div>' % (html.escape(leg), html.escape(leg), img(n, 390 if '-cel' in n else 960), v)
def lado(*a, cls='lado'): return '<div class="%s">%s</div>' % (cls, ''.join(a))

ITENS = []
def it(n, t, p, corpo, opcoes=None): ITENS.append(dict(n=n, t=t, p=p, corpo=corpo, opcoes=opcoes))

OPS = [
 ('1', 'Faixa no alto', 'Como o Vértice faz hoje. Fica à vista, mas empurra a tela para baixo.'),
 ('2', 'Sobe de baixo e fica (minha sugestão)', 'Segue a sua regra de aviso que sobe de baixo. Não empurra a tela e não cobre a barra de baixo do celular. Cobre um pedaço do fim da tela até você tocar em Atualizar ou no X.'),
 ('3', 'Só no pé do menu', 'A mais discreta. No celular aparece uma bolinha no botão do menu. Risco: passar dias sem perceber.'),
 ('4', 'Botão ao lado do sino', 'Sempre visível sem cobrir nada. No celular vira só um ícone com bolinha, e a busca fica um pouco menor.'),
 ('5', 'Janela no meio', 'Ninguém deixa de ver, mas interrompe o que você está fazendo.'),
]
corpo = lado(um('hoje-pc', 'HOJE: publicaram versão nova e nada aparece (PC)'), um('hoje-cel', 'HOJE: o mesmo no celular'), cls='lado hj')
for n, nome, txt in OPS:
    extra = um('op3-cel-menu', 'Celular com o menu aberto') if n == '3' else ''
    corpo += ('<div class="opb"><p class="opn">OPÇÃO %s</p><b>%s</b><p class="opd">%s</p><div class="vids">%s%s</div><details><summary>Ver parado (toque para ampliar)</summary><div class="paradas">%s%s%s</div></details></div>') % (
        n, html.escape(nome), html.escape(txt), filme('op%s-pc' % n, 'PC, em movimento'), filme('op%s-cel' % n, 'Celular, em movimento'),
        um('op%s-pc' % n, 'PC'), um('op%s-cel' % n, 'Celular'), extra)
it(226, 'Onde o aviso de versão nova aparece', 'Cinco formas, todas do app de verdade. Nos vídeos o aviso chega, o círculo dourado mostra onde se toca em Atualizar, o app recarrega e volta. O número "v0.6.38" é de mentira, só para o teste.', corpo, opcoes=5)

it(227, 'Quando o app procura versão nova', 'Ao abrir; ao voltar para o app (no máximo uma vez a cada 5 minutos); quando a internet volta; e a cada 30 minutos com o app à vista. Procurar não gasta quase nada: só confere se o arquivo mudou. Hoje o app só descobre quando é aberto de novo, e não avisa.', '')

it(228, 'Nada recarrega sozinho; Atualizar volta para a mesma tela', 'O app só recarrega no seu toque, e volta na tela em que você estava. Se houver outra aba do navegador aberta com o app, ela também não recarrega sozinha: passa a mostrar o aviso.',
   lado(um('mesma-antes-pc', 'Antes do toque (PC, Materiais)'), um('mesma-depois-pc', 'Depois: mesma tela, já na versão nova')) + lado(um('mesma-antes-cel', 'Antes (celular)'), um('mesma-depois-cel', 'Depois (celular)'), cls='lado cels'))

it(229, 'Pergunta antes de recarregar quando há algo a perder', 'Pergunta se houver: ficha ou campo preenchido e não gravado (inclusive análise, plano de coleta, contagem, apresentação da auditoria e marcas na foto), gravação que ainda não chegou à nuvem, ou abas do Vértice e do Sabiá abertas. Sem nada disso, atualiza direto. Com o Vértice ou o Sabiá na frente, o aviso fica escondido.',
   lado(um('pergunta-form-pc', 'Algo preenchido (PC)'), um('pergunta-abas-pc', 'Aba do Vértice aberta (PC)')) + lado(um('pergunta-form-cel', 'Algo preenchido (celular)'), um('pergunta-abas-cel', 'Aba do Vértice aberta (celular)'), cls='lado cels'))

it(230, 'O X esconde o aviso, que continua no pé do menu', 'Fechado, o aviso não volta a incomodar. Fica "Atualizar o app" no pé do menu (no celular, bolinha no botão do menu). Volta a aparecer se o app for reaberto sem atualizar ou se sair uma versão ainda mais nova. Vale para as OPÇÕES 1, 2 e 5; a 3 e a 4 não têm X.',
   um('x-pc', 'Depois do X (PC)') + lado(um('x-cel', 'Depois do X (celular): bolinha no menu'), um('x-cel-menu', 'Menu aberto'), cls='lado cels'))

TAB = '<table class="tb"><thead><tr><th>Situação provada no teste</th><th>HOJE</th><th>PROPOSTA</th></tr></thead><tbody>%s</tbody></table>'
lin = lambda l: ''.join('<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % tuple(html.escape(c) for c in x) for x in l)
it(231, 'Conserto: a versão nova podia guardar a tela velha', 'Defeito reproduzido: com o prazo de 10 minutos que o GitHub costuma dar aos arquivos, a versão nova instalava e guardava a tela da versão anterior. Sem internet, abriria a velha. Agora a tela é buscada direto no servidor. Quem recarrega e já está na versão nova não vê aviso.',
   TAB % lin([('O que a versão nova guarda para abrir sem internet', 'A tela da versão anterior', 'A tela da versão nova')]))
it(232, 'Conserto: abrir outro arquivo pelo endereço trocava a tela guardada', 'Defeito que já existia, achado pelo revisor: abrir, por exemplo, o arquivo manifest do app numa aba gravava esse arquivo no lugar da tela. A próxima abertura sem internet mostraria texto solto. Agora só a tela do app é guardada.',
   TAB % lin([('Abrir /efcwork/manifest.webmanifest e depois ficar sem internet', 'A tela guardada vira o texto do arquivo', 'A tela do app continua guardada'), ('Endereço de outra pasta sem a barra no fim', 'Podia dar erro de página', 'Redireciona normalmente')]))

REFS = [('https://developer.chrome.com/docs/workbox/handling-service-worker-updates', 'Chrome / Workbox: como tratar atualização do service worker', 'Avisar e deixar a pessoa decidir quando há versão esperando.'),
        ('https://dev.to/thepassle/on-pwa-update-patterns-4fgm', 'On PWA Update Patterns', 'Critica recarregar calado; prefere um sinal discreto (base das OPÇÕES 3 e 4).'),
        ('https://support.google.com/chrome/a/answer/7679871', 'Ajuda do Chrome', 'O navegador só muda um ícone no botão do menu; a pessoa reinicia quando puder.')]

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
VJS = r"""
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var v = [].slice.call(document.querySelectorAll('video'));
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var x = e.target; if (e.isIntersecting) { var p = x.play(); if (p && p.catch) p.catch(function () {}); } else x.pause(); }); }, { threshold: .4 });
  v.forEach(function (x) { io.observe(x); });
})();
"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.37 · aviso de versão nova</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.37</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Aviso de versão nova</h1><p class="sub">Pronto e testado, nada publicado. HOJE é a v0.6.36 no ar; PROPOSTA é o app de verdade com dados inventados.</p>'
       '<ol class="como"><li>Os vídeos tocam sozinhos; toque numa foto para ampliar (Esc fecha).</li><li>No item 226 escolha uma das cinco OPÇÕES; nos outros, Aprovado ou Reprovado.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="sub"><b>Atenção:</b> quando você publicar a v0.6.37, quem está na v0.6.36 não vê aviso, porque a v0.6.36 não tem essa função. O aviso aparece a partir da versão seguinte.</p>'
       + ''.join(item_html(x) for x in ITENS) +
       '<div class="fim"><h2>Referências que olhei</h2><ul class="rf">' + ''.join('<li><a href="%s" target="_blank" rel="noopener">%s</a>: %s</li>' % (u, html.escape(t), html.escape(d)) for u, t, d in REFS) + '<li>Na própria família: o Vértice mostra uma faixa no alto com "Versão nova pronta" (base da OPÇÃO 1).</li></ul>'
       '<h2>O que não deu para provar</h2><ul><li>App instalado num celular ou PC de verdade, e o site publicado (testei com um servidor aqui que imita o GitHub).</li><li>A procura a cada 30 minutos, esperando o tempo passar.</li><li>iPhone e Safari.</li></ul>'
       '<h2>Depois da sua resposta</h2><ul><li>Deixo só a opção escolhida, aplico só o aprovado, testo tudo de novo e publico apenas com o seu "pode publicar".</li><li>Firebase: nada a configurar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + VJS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.37-aviso-versao.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
