#!/usr/bin/env python3
"""EFCwork v0.6.34 · página de aprovação "Vértice como aba do Cwork" (P3a, ITENS 185 a 196).
Fotos: tools/testes/telas/v0634-*.png (t_v0634.js --fotos). Saída: docs/aprovacao-efcwork-v0.6.34-vertice-aba.html"""
import base64, io, json, os, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/testes/telas')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()

def img(n, larg=1100, crop=None):
    im = Image.open(os.path.join(T, n)).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=82); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def z(src, alt): return '<button type="button" class="zoom" aria-label="Ampliar: %s"><img src="%s" alt="%s" loading="lazy"></button>' % (html.escape(alt), src, html.escape(alt))
def par(a, b, la='HOJE (v0.6.33, no ar)', lb='PROPOSTA (v0.6.34)', cel=False):
    return '<div class="%s"><div class="lado"><div><p class="leg">%s</p>%s</div><div><p class="leg">%s</p>%s</div></div></div>' % ('par-cel' if cel else 'par', la, z(a[0], a[1]), lb, z(b[0], b[1]))
def um(a, leg): return '<div><p class="leg">%s</p>%s</div>' % (leg, z(a[0], a[1]))

ITENS = []
def it(n, t, p, ref, corpo, opcoes=None):
    ITENS.append(dict(n=n, t=t, p=p, ref=ref, corpo=corpo, opcoes=opcoes))


# imagens
hm, pm = img('v0634-hoje-menu.png', 260), img('v0634-prop-menu.png', 260)
hj, ab = img('v0634-hoje-janela.png'), img('v0634-aba-pc.png')
vz = img('v0634-prop-vazio.png')
arq, jan, troca = img('v0634-prop-arquivo.png'), img('v0634-janela.png'), img('v0634-prop-troca.png')
hc, c1, c2, cm = img('v0634-hoje-cel.png', 390), img('v0634-aba-cel.png', 390), img('v0634-op2-cel.png', 390), img('v0634-prop-cel-menu.png', 390)
P = ('Seu pedido (P3, 25 e 26/11)', '"o Vértice Docs vira uma aba do Cwork"; "mesmo login"; "quem pode ou não acessar é decidido dentro do Cwork"; 26/11 10:12: "temos janela superior, podemos melhorar ela mais na frente"; "o nome e dados pessoais do perfil vão ser de acordo com o cadastro Cwork".')
REV = open('/tmp/rev34.txt', encoding='utf-8').read().strip() if os.path.exists('/tmp/rev34.txt') else 'Revisor novo: ver o dossiê.'

it(185, 'Vértice Docs vira uma área do menu',
   'HOJE o Vértice fica em "Apps da família" e abre numa janela por cima. PROPOSTA: ele é uma área do menu, logo depois de Documentos, com ícone próprio. Em "Apps da família" fica só o Sabiá.',
   [P], par((hm, 'Menu hoje'), (pm, 'Menu na proposta'), cel=True))
it(186, 'A aba ocupa a tela, e o Vértice continua vivo ao trocar de área',
   'O Vértice abre dentro da área, abaixo do cabeçalho do Cwork, até o pé da tela. Ao ir para outra área e voltar, é o mesmo Vértice: nada recarrega e nada se perde. Ele entra no "modo aba" (esconde a marca e o cartão do perfil, que o Cwork já mostra).',
   [P], par((hj, 'Hoje: janela por cima'), (ab, 'Proposta: área do Cwork')))
it(187, 'O cabeçalho mostra o arquivo aberto no Vértice',
   'Quando você abre um arquivo no Vértice, o nome aparece na pílula embaixo do título. Sem arquivo: "Nenhum arquivo aberto". O Cwork só aceita esse aviso se vier do próprio quadro do Vértice.',
   [], um((arq, 'Cabeçalho com o arquivo aberto'), 'Cabeçalho com o arquivo aberto'))
it(188, 'Volta: o ícone da janela abre o Vértice por cima, como antes',
   'Como você pediu, a janela por cima continua como saída. O ícone no canto do cabeçalho fecha a aba e abre a janela de antes. Nunca ficam os dois vivos ao mesmo tempo. Com a janela aberta, ou com uma gaveta aberta (por exemplo a fila "Abrir o próximo no Vértice" dos Papéis deste envio), os pedidos do Cwork vão para a janela, e a gaveta não se perde.',
   [P], um((jan, 'Janela por cima aberta pelo ícone'), 'Janela por cima aberta pelo ícone'))
it(189, 'Com a janela aberta, a área avisa; "Trazer para a aba" pergunta antes',
   'Se a janela por cima estiver aberta, a área Vértice Docs mostra "O Vértice está aberto na janela por cima" e o botão "Trazer para a aba". O botão pergunta antes de fechar a janela (o que estiver sem salvar lá pode se perder); o botão em destaque é o seguro, "Deixar a janela".',
   [], '<div class="ops">' + ''.join('<div class="op">%s</div>' % z(i[0], i[1]) for i in [(vz, 'Área com a janela aberta'), (troca, 'Pergunta ao trazer')]) + '</div>')
it(190, 'Celular: as duas barras de baixo',
   'No celular, o Vértice tem a barra de baixo dele (Início, Planilhas, Documentos, Quadros, Mais) e o Cwork tem a dele. OPÇÃO 1: deixar as duas (como está). OPÇÃO 2: na área Vértice, esconder a barra do Cwork; o menu do Cwork continua no botão do canto de cima. A tela ganha uns 60 px.',
   [], '<div class="ops">' + ''.join('<div class="op"><p class="opn">OPÇÃO %d</p>%s</div>' % (k, z(i[0], i[1])) for k, i in [(1, (c1, 'Duas barras')), (2, (c2, 'Só a barra do Vértice'))]) + '</div>' + par((hc, 'Hoje: janela no celular'), (cm, 'Proposta: menu do celular com a área'), cel=True), opcoes=2)
it(191, 'Quem vê a área: Administrador e Líder ★',
   'É a mesma regra do botão do Vértice de hoje. Secundário sem estrela e Visitante não veem: a área some do menu e o endereço #/vertice cai na primeira tela. Se perder a permissão com a aba aberta, ela fecha sozinha. Quer liberar para mais alguém (por exemplo, Secundário só lendo)? Escreva no comentário. As pastas por pessoa entram na P3b.',
   [P], '')
it(192, 'A porta para o Vértice (parte técnica)',
   'O Cwork cria window.CworkPonteVertice (versão 1), que não pode ser trocada por outro código. usuario() devolve uid, nome, perfil e estrela do cadastro do Cwork, ou nada quando ninguém entrou (a porta continua existindo). Sem campo de conta de teste, como você decidiu; o modo de teste sem login fica com a conversa do Vértice (nota entregue). pastas() devolve lista vazia até a P3b. O aviso cwork:usuario sai no login, na saída e quando o cadastro muda.',
   [('Pedido P3, seção 3', 'nomes combinados entre as duas conversas; mudança só passando pelo Elias.')], '')
it(193, 'O sw.js do Cwork deixa a pasta do Vértice em paz (P5, item 1)',
   'O service worker do Cwork passa a ignorar /efcwork/vertice/, do mesmo jeito que já ignora o EFCquiz. Hoje não muda nada (o Vértice ainda está em /EFCdocs/); é o que permite, mais tarde, o Vértice morar dentro do repositório sem o Cwork abrir a tela do Vértice sem internet.',
   [('Pedido P3, seção 7', 'item 1, antes de mudar o Vértice de lugar.')], '')
it(194, 'Revisor novo (agente que não viu a conversa)', REV, [], '')
it(195, 'Decisão: a porta para quem não vê a área',
   'Quem não é Administrador nem Líder ★ não vê a área, mas ainda consegue abrir o Vértice pela janela por cima em alguns lugares (Impressos, "Abrir no Vértice"). Hoje a porta diz ao Vértice quem é essa pessoa, e o Vértice a trata como Operador (Secundário) ou só leitura (Visitante). OPÇÃO 1: manter assim (quem abre pela janela usa a própria conta, com o perfil do Cwork). OPÇÃO 2: a porta não diz quem é (o Vértice mostra "Entre no Cwork" para essa pessoa) até a P3b decidir as pastas.',
   [('Pedido P3, item 1.4', '"quem pode ou não acessar é decidido dentro do Cwork".')], '', opcoes=2)
it(196, 'Próxima etapa: P3b · Administração › Pastas do Vértice',
   'As 5 pastas dos Impressos, e para cada uma quem lê e quem edita (padrão: Principal e Líder ★ editam tudo, Secundário edita as liberadas, Visitante só lê), guardadas em sv2_cfg/vertice_pastas; pastas() passa a devolver isso. Depois, P3c (proposta de regras do Firestore, no mesmo arquivo da v0.6.33) e a P5 (mudança de endereço).',
   [], '')

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
  var $ = function (s, r) { return (r || document).querySelector(s); }, its = [].slice.call(document.querySelectorAll('.it')), K = 'efcwork-v0634-respostas';
  function texto() { return ['Respostas EFCwork v0.6.34 · Vértice como aba (P3a)'].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
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

pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.34 · Vértice como aba (P3a)</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.34</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Vértice como aba (P3a)</h1><p class="sub">Na janela Papéis deste envio você marca o que sai: o rótulo do endereço (seu modelo do Vértice) e a cadeia de custódia ou a ficha. A planilha abre no Vértice com os dados da remessa, e o que foi feito (com a via assinada) fica na nuvem, igual em todos os aparelhos. Nada foi publicado: HOJE é a v0.6.32 no ar; PROPOSTA é o protótipo no app, com dados inventados.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada item, Aprovado ou Reprovado; no ITEM 178, o número da opção.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in sorted(ITENS, key=lambda x: x['n'])) +
       '<div class="fim"><h2>Depois da sua resposta</h2><ul><li>Fica só o modelo escolhido no ITEM 178 e o que for aprovado; entrego o ZIP, o arquivo de regras para colar uma vez só (v0.32 + R6) e publico só com o seu "pode publicar".</li><li>Para conferir depois de publicar, no celular e no PC: preencher uma custódia de verdade (com os campos marcados no Vértice) e anexar a foto da via assinada; abrir a mesma remessa no outro aparelho.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + FILME_JS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.34-vertice-aba.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
