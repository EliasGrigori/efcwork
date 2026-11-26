#!/usr/bin/env python3
"""EFCwork v0.6.35 · segunda página de aprovação: tela inteira com abas (feita), conferência das tarefas e filtro da coluna (ITENS 207 a 214).
Fotos: tools/testes/telas/v0635b/*.png (tiradas por cap.js e cap2.js nesta pasta). Saída: docs/aprovacao-efcwork-v0.6.35-tela-inteira.html"""
import base64, io, json, os, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/testes/telas/v0635b')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()

def img(n, larg=1100, crop=None):
    im = Image.open(os.path.join(T, n)).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=82); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def z(src, alt): return '<button type="button" class="zoom" aria-label="Ampliar: %s"><img src="%s" alt="%s" loading="lazy"></button>' % (html.escape(alt), src, html.escape(alt))
def par(a, b, la='HOJE (v0.6.34, no ar)', lb='PROPOSTA (v0.6.35)', cel=False):
    return '<div class="%s"><div class="lado"><div><p class="leg">%s</p>%s</div><div><p class="leg">%s</p>%s</div></div></div>' % ('par-cel' if cel else 'par', la, z(a[0], a[1]), lb, z(b[0], b[1]))
def um(a, leg): return '<div><p class="leg">%s</p>%s</div>' % (leg, z(a[0], a[1]))

ITENS = []
def it(n, t, p, ref, corpo, opcoes=None):
    ITENS.append(dict(n=n, t=t, p=p, ref=ref, corpo=corpo, opcoes=opcoes))



REF = ('Referências', 'abas do Chrome e do Edge (aba ativa colada no conteúdo); abas de arquivo do VS Code e do Figma (nome do arquivo e X); barra fina do Arc e do Linear (pílulas discretas, sem enfeite).')

def filme(lst, asp='1280/760'):
    return ('<div class="filme" data-filme><div class="fq" style="aspect-ratio:%s">' % asp + ''.join('<figure class="%s"><img src="%s" alt="%s"><figcaption>%s</figcaption></figure>' % ('on' if i == 0 else '', s, html.escape(c), html.escape(c)) for i, (s, c) in enumerate(lst)) +
            '</div><div class="fbar"><button type="button" class="bt" data-f="ant" aria-label="Anterior">‹</button><span data-f="n">1 de %d</span><button type="button" class="bt" data-f="pro" aria-label="Próximo">›</button><button type="button" class="bt" data-f="play">Pausar</button></div></div>' % len(lst))
P1 = ('Seu pedido de 26/11', 'ITEM 200 = OPÇÃO 2 ("Perfeito"); ITEM 201: letra menor, bem mais abas, que vão se comprimindo; 13:18: o menu abre direto a tela inteira.')
hj, p1, p3 = img('hoje-pc.png'), img('pc-1aba.png'), img('pc-3abas.png')
it(207, 'O menu "Vértice Docs" abre o Vértice em tela inteira',
   'Como decidido às 13:18: a área ao lado do menu saiu. O Vértice cobre a tela toda, por cima também do menu do Cwork, com a faixa fina sublinhada da OPÇÃO 2 no alto (32 px, só texto, traço dourado de 2 px na aba aberta, sem relevo nem degradê). O ícone "Abrir em janela" do menu (ITEM 198) saiu junto: agora só existe um jeito de abrir.',
   [P1], par((hj, 'v0.6.34: área ao lado do menu'), (p1, 'Proposta: tela inteira com a faixa')))
it(208, 'Várias abas do Vértice, com o nome do arquivo e o "+"',
   'Cada aba é um Vértice aberto, com o nome do arquivo daquela aba (o mesmo nome vai para o título da janela do navegador). O "+" abre outra aba. O X pergunta antes de fechar; fechada, você vai para a aba ao lado. Documento que o Cwork manda abrir (Impressos, remessa) vai para uma aba nova, ou para a aba do Vértice que ainda está sem arquivo. Limite de 10 abas, para não pesar o aparelho.',
   [P1, REF], um((p3, 'Três abas: EFCwork, dois arquivos e um Vértice novo'), 'Três abas abertas'))
mt, mf = img('pc-muitas.png'), img('pc-muitas-faixa.png')
it(209, 'Com muitas abas, elas encolhem por igual (letra menor)',
   'Letra de 12 px no PC e 13 px no celular. Com poucas abas, cada uma tem o tamanho do nome; com muitas, todas encolhem por igual e o nome termina em "…" (o nome inteiro aparece ao parar o mouse). A aba aberta fica sempre à vista.',
   [P1], um((mf, 'Nove abas do Vértice'), 'Nove abas do Vértice'))
fio, fa, esc_ = img('pc-cwork-fio.png'), img('pc-cwork-aberta.png'), img('pc-escuro.png')
it(210, 'A aba EFCwork volta ao Cwork sem fechar o Vértice',
   'Tocando em EFCwork, o Cwork vem para a frente e os Vértices continuam abertos atrás. A faixa recolhe num fio de 6 px no alto (como hoje) e abre ao parar o mouse ou tocar. Tocar de novo no menu "Vértice Docs" volta para a última aba usada, sem recarregar. Se um aviso ou link mudar a tela do Cwork, o Cwork vem para a frente. Esc e o voltar do celular saem uma camada por vez.',
   [], '<div class="filme-wrap">' + filme([(fio, '1 · Cwork na frente: só o fio dourado no alto'), (fa, '2 · Mouse parado no fio: a faixa abre'), (esc_, '3 · Tema escuro do Cwork: a faixa acompanha')]) + '</div>')
c1, c3 = img('cel-1aba.png', 600), img('cel-3abas.png', 600)
it(211, 'No celular: faixa de 40 px e o X só na aba aberta',
   'No celular a faixa tem 40 px (dedo), a letra 13 px, e o X aparece só na aba aberta, para sobrar lugar ao nome. Para fechar outra, toque nela antes. A barra de baixo do Vértice continua sendo a dele.',
   [], par((c1, 'Uma aba'), (c3, 'Três abas'), la='PROPOSTA · uma aba', lb='PROPOSTA · três abas', cel=True))
PT = ('Seu pedido de 26/11 14:18', '"achei esse erro no claudian, com certeza temos no cwork, corrigiremos no cwork". Causa: "Conferir quando terminar" (v2.102.60) ligado sozinho ao passar a tarefa, mesmo para o Principal.')
ta2h, ta1, ta2 = img('hoje-t-a2.png', 700), img('novo-t-a1.png', 700), img('novo-t-a2.png', 700)
it(212, 'Tarefa: o Principal conclui direto, mesmo com "Conferir quando terminar"',
   'No Cwork, quem é Principal conclui a tarefa direto, sem ir para "Para conferir", também nas tarefas que já existem. A tarefa já parada em "Para conferir" aparece com esse nome (hoje o Cwork mostrava "A fazer") e ganha "Concluir" para o Principal. Quem passou a tarefa vê "Conferido". Para os outros perfis, a regra do EFClaudian continua: com a conferência ligada, o botão é "Terminei, conferir" e a tarefa vai para quem passou, com aviso no sino. Nada muda no Firebase.',
   [PT], '<div class="lado3">' + um((ta2h, 'HOJE: parada em Para conferir aparece "A fazer"'), 'HOJE · parada aparece "A fazer"') + um((ta1, 'Principal com a conferência ligada: Concluir'), 'PROPOSTA · Principal: Concluir') + um((ta2, 'Parada em Para conferir: Concluir'), 'PROPOSTA · parada: "Para conferir" e Concluir') + '</div>')
PF = ('Seu pedido de 26/11 14:24', '"quando toco no ícone de escolher item a ser filtrado toda a janela do filtro treme…"; "buscar isopor 5l aí seleciono, depois reagente calibração ph10, depois as canetas… quando eu fechar vou ter esses 3 itens selecionados".')
REFF = ('Referências', 'filtro do Excel e do Google Planilhas (busca na lista de valores sem perder o que já foi marcado); Sankhya (menu da coluna).')
it(213, 'Filtro da coluna: a janela fica parada ao marcar',
   'Antes, cada item marcado redesenhava a janela com o movimento de abrir, por isso ela "tremia". Agora a janela continua parada, no mesmo lugar, e só a caixinha e a tabela mudam. Provado no teste: em várias marcações seguidas, a janela não entrou de novo nenhuma vez.',
   [PF], '')
f1h = img('hoje-f1-pc.png', 520); f1, f2, f3, f4, f5 = [img('novo-%s-pc.png' % k, 520) for k in ('f1', 'f2', 'f3', 'f4')] + [img('novo-f5-pc.png')]
it(214, 'Filtro da coluna: escolher itens de várias buscas',
   'Busque, marque, busque outra coisa, marque de novo: o que já foi escolhido fica. Com nada escolhido, a busca traz a lista desmarcada para você escolher. Ao fechar, a tabela mostra só os escolhidos, e a busca do menu volta limpa. A busca também ficou mais esperta: palavras em qualquer ordem e número sem o zero ("isopor 5l" acha "ISOPOR 05L"; hoje ela não acha nada). Sem escolher nenhum item, a busca continua filtrando a tabela pelo texto, como hoje.',
   [PF, REFF], par((f1h, 'HOJE: "isopor 5l" não acha nada'), (f2, 'PROPOSTA: acha e você marca')) + filme([(f1, '1 · Busca "isopor 5l": a lista vem desmarcada'), (f2, '2 · Marcou: a tabela mostra só ele; a janela não treme'), (f3, '3 · Buscou "ph10" e marcou; buscou "caneta" e marcou as duas'), (f4, '4 · Sem busca: os escolhidos das três buscas marcados'), (f5, '5 · Fechou: a tabela com os itens escolhidos')], '1100/700'))
FILME_JS = r"""
document.querySelectorAll('[data-filme]').forEach(function (f) {
  var q = f.querySelectorAll('figure'), i = 0, t = null, n = f.querySelector('[data-f="n"]'), pl = f.querySelector('[data-f="play"]');
  var red = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vai(k) { q[i].classList.remove('on'); i = (k + q.length) % q.length; q[i].classList.add('on'); n.textContent = (i + 1) + ' de ' + q.length; }
  function roda() { t = setInterval(function () { vai(i + 1); }, 2600); pl.textContent = 'Pausar'; }
  function para() { clearInterval(t); t = null; pl.textContent = 'Animar'; }
  f.querySelector('[data-f="ant"]').onclick = function () { para(); vai(i - 1); };
  f.querySelector('[data-f="pro"]').onclick = function () { para(); vai(i + 1); };
  pl.onclick = function () { t ? para() : roda(); };
  if (red) para(); else roda();
});
"""

def item_html(x):
    ref = ''.join('<p class="ref"><b>%s:</b>%s</p>' % (html.escape(a), html.escape(b)) for a, b in x['ref'])
    if x['opcoes']:
        voto = '<div class="voto">' + ''.join('<input type="radio" id="r%d_%d" name="r%d" value="OPÇÃO %d"><label for="r%d_%d" class="ok">%d</label>' % (x['n'], m, x['n'], m, x['n'], m, m) for m in range(1, x['opcoes'] + 1)) + '<input type="radio" id="r%d_n" name="r%d" value="Reprovado (nenhuma)"><label for="r%d_n" class="no">Nenhuma</label></div>' % (x['n'], x['n'], x['n'])
    else:
        voto = '<div class="voto"><input type="radio" id="r%d_a" name="r%d" value="Aprovado"><label for="r%d_a" class="ok">Aprovado</label><input type="radio" id="r%d_r" name="r%d" value="Reprovado"><label for="r%d_r" class="no">Reprovado</label></div>' % ((x['n'],) * 6)
    return ('<section class="it" data-n="%d" data-t="%s"><div class="seg"><div class="num">ITEM<span>%d</span></div><div class="cab"><h3>%s</h3><p>%s</p>%s</div></div>%s'
            '<div class="resp">%s<label class="com">Comentário (opcional)<textarea id="c%d" rows="2"></textarea></label></div></section>') % (
        x['n'], html.escape(x['t']), x['n'], html.escape(x['t']), html.escape(x['p']), ref, x['corpo'], voto, x['n'])

EXTRA = """
.ops5{grid-template-columns:1fr}
.op b{font-size:16px}.opd{margin:0;color:var(--tx2)}
.fx{position:relative;border:1px solid var(--bd);border-radius:8px;overflow:hidden;background:#f6f3ec}
.fx img{display:block;width:100%}
.fx-bar{display:flex;align-items:center;gap:2px;font:500 13px/1 system-ui,sans-serif;color:#3b3524}
.fx-t{display:flex;align-items:center;gap:6px;padding:0 10px;height:28px;border-radius:6px;white-space:nowrap;max-width:200px}
.fx-n{overflow:hidden;text-overflow:ellipsis}
.fx-x{font-weight:400;opacity:.55;margin-left:4px}
.fx-ic{width:14px;height:14px;border-radius:4px;flex:none;background:#22a896}.fx-cw{background:linear-gradient(135deg,#f7df9e,#b4862f)}
.fx-mais{padding:0 10px;font-size:16px;opacity:.7}.fx-sp{flex:1}.fx-li{font-size:12px;opacity:.6;padding-right:10px}
.fx1 .fx-bar{height:36px;padding:4px 6px 0;background:#e7e1d3;align-items:flex-end}.fx1 .fx-t{border-radius:8px 8px 0 0;height:32px}.fx1 .fx-t.on{background:#fffefb;box-shadow:0 -1px 0 #d8cdb2}
.fx2 .fx-bar{height:32px;padding:0 8px;background:#fffefb;border-bottom:1px solid #e6dfcf;gap:6px}.fx2 .fx-t{border-radius:0;height:32px;border-bottom:2px solid transparent}.fx2 .fx-t.on{border-bottom-color:#b4862f;color:#1e1b14;font-weight:600}
.fx3 .fx-bar{height:34px;padding:0 8px;background:#121524;color:#d8d2c2;gap:4px}.fx3 .fx-t{height:24px;border-radius:12px;font-size:12px}.fx3 .fx-t.on{background:#d9b46a;color:#1c1406}.fx3 .fx-li,.fx3 .fx-mais{color:#d8d2c2}
.fx4{display:grid;grid-template-columns:44px 1fr}.fx4 .fx-bar{flex-direction:column;justify-content:flex-start;padding:8px 0;gap:8px;background:#121524}.fx4 .fx-t{width:30px;height:30px;padding:0;justify-content:center;border-radius:8px}.fx4 .fx-t .fx-n,.fx4 .fx-x,.fx4 .fx-li{display:none}.fx4 .fx-t.on{background:#2a2e45;box-shadow:inset 2px 0 0 #d9b46a}.fx4 .fx-mais{color:#d8d2c2}.fx4 .fx-sp{display:none}
.fx5 .fx-bar{position:absolute;top:6px;left:50%;transform:translateX(-50%);height:30px;padding:0 4px;background:rgba(18,21,36,.88);color:#e8e2d2;border-radius:15px;box-shadow:0 4px 14px rgba(0,0,0,.25);z-index:2}.fx5 .fx-t{height:22px;border-radius:11px;font-size:12px}.fx5 .fx-t.on{background:#d9b46a;color:#1c1406}.fx5 .fx-sp,.fx5 .fx-li{display:none}.fx5 .fx-mais{color:#e8e2d2}
@media (prefers-reduced-motion:no-preference){.fx5 .fx-bar{transition:opacity .25s}.fx5:not(:hover) .fx-bar{opacity:.55}}
.ops{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:12px}
.seg{display:flex;gap:16px;border:0;padding:0}
.op{border:1px solid var(--bd);border-radius:var(--rs);padding:12px;display:flex;flex-direction:column;gap:8px}
.opn{margin:0;font:600 34px/1 var(--fd);color:var(--a)}
.opt{margin:0;color:var(--tx2)}
.voto{flex-wrap:wrap}
.voto label{min-width:64px}
.com textarea{font:inherit;font-weight:400;color:var(--tx);background:var(--c);border:1px solid var(--bd);border-radius:var(--rs);padding:8px;resize:vertical;min-height:44px}
.fq{position:relative;border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden;background:var(--c2);aspect-ratio:1280/860}
.fq figure{position:absolute;inset:0;margin:0;opacity:0;transition:opacity 350ms ease}
.fq figure.on{opacity:1}
.fq img{width:100%;height:100%;object-fit:contain;display:block}
.fq figcaption{position:absolute;left:0;right:0;bottom:0;padding:8px 12px;background:var(--c);border-top:1px solid var(--bd);font-weight:600}
.fbar{display:flex;align-items:center;gap:8px}.fbar span{color:var(--tx3);min-width:56px;text-align:center}
.tb{border-collapse:collapse;width:100%;max-width:640px}.tb th,.tb td{border-bottom:1px solid var(--bd);padding:8px 10px;text-align:left}.tb th{color:var(--tx2);font-size:14px}
.lb{position:fixed;inset:0;z-index:50;background:rgba(10,8,4,.86);display:grid;place-items:center;padding:16px;cursor:zoom-out}
.lb img{max-width:100%;max-height:100%;border-radius:var(--rs)}
@media (max-width:760px){.lado{grid-template-columns:1fr}.seg{flex-direction:column}.resp{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.fq figure{transition:none}}
"""

JS = r"""
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, its = [].slice.call(document.querySelectorAll('.it')), K = 'efcwork-v0635b-respostas';
  function texto() { return ['Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro'].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
  function guarda() { try { var o = {}; its.forEach(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a); o[n] = { r: r ? r.id : '', c: $('#c' + n).value }; }); localStorage.setItem(K, JSON.stringify(o)); } catch (e) {} conta(); }
  function conta() { var f = its.filter(function (a) { return $('input[name="r' + a.dataset.n + '"]:checked', a); }).length; $('#cont').textContent = f + ' de ' + its.length + ' respondidos'; its.forEach(function (a) { var r = $('input[name="r' + a.dataset.n + '"]:checked', a); a.classList.toggle('ok', !!r && !/Reprovado/.test(r.value)); a.classList.toggle('no', !!r && /Reprovado/.test(r.value)); }); }
  try { var o = JSON.parse(localStorage.getItem(K) || '{}'); Object.keys(o).forEach(function (n) { if (o[n].r && document.getElementById(o[n].r)) document.getElementById(o[n].r).checked = true; if ($('#c' + n)) $('#c' + n).value = o[n].c || ''; }); } catch (e) {}
  document.addEventListener('change', guarda); document.addEventListener('input', guarda); conta();
  function copia() { var t = texto(), s = $('#saida'), ok = $('#copiado');
    function manual() { s.hidden = false; s.value = t; s.focus(); s.select(); var deu = false; try { deu = document.execCommand('copy'); } catch (e) {} ok.textContent = deu ? 'Copiado. Agora cole na conversa.' : 'Não deu para copiar sozinho: o texto está selecionado abaixo, copie e cole na conversa.'; }
    try { navigator.clipboard.writeText(t).then(function () { ok.textContent = 'Copiado. Agora cole na conversa.'; }, manual); } catch (e) { manual(); } }
  document.querySelectorAll('[data-copiar]').forEach(function (b) { b.onclick = copia; });
  document.addEventListener('click', function (e) { var z = e.target.closest('.zoom'); if (!z) return; var d = document.createElement('div'); d.className = 'lb'; d.innerHTML = '<img alt="">'; d.firstChild.src = z.querySelector('img').src; d.onclick = function () { d.remove(); }; document.body.appendChild(d); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = document.querySelector('.lb'); if (l) l.remove(); } });
})();
"""


EXTRA += ".lado3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media (max-width:760px){.lado3{grid-template-columns:1fr}}.filme-wrap{max-width:900px}"
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.35 · tela inteira, tarefas e filtro</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.35</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Tela inteira, tarefas e filtro</h1><p class="sub">Três coisas prontas e testadas, nada publicado: o Vértice em tela inteira com abas (OPÇÃO 2, como você escolheu), a conferência das tarefas corrigida no Cwork e o filtro da coluna. HOJE é a v0.6.34 no ar; PROPOSTA é o app de verdade com dados inventados.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada item, Aprovado ou Reprovado, com comentário se quiser.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in sorted(ITENS, key=lambda x: x['n'])) +
       '<div class="fim"><h2>Depois da sua resposta</h2><ul><li>Aplico só o aprovado, rodo a bateria de novo e publico a v0.6.35 só com o seu "pode publicar".</li><li>Para conferir depois de publicar: abrir o Vértice pelo menu no PC e no celular com dois arquivos; numa tabela, buscar e marcar itens de três buscas; uma tarefa passada para você (Principal) concluir direto.</li><li>Firebase: nada a configurar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + FILME_JS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.35-tela-inteira.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
