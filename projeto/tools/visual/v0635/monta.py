#!/usr/bin/env python3
"""EFCwork v0.6.35 · página de aprovação "Vértice em tela inteira e Pastas do Vértice" (ITENS 197 a 206).
Fotos: tools/testes/telas/v0634/v0635-*.png. Saída: docs/aprovacao-efcwork-v0.6.35-vertice-pastas.html"""
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
def par(a, b, la='HOJE (v0.6.34, no ar)', lb='PROPOSTA (v0.6.35)', cel=False):
    return '<div class="%s"><div class="lado"><div><p class="leg">%s</p>%s</div><div><p class="leg">%s</p>%s</div></div></div>' % ('par-cel' if cel else 'par', la, z(a[0], a[1]), lb, z(b[0], b[1]))
def um(a, leg): return '<div><p class="leg">%s</p>%s</div>' % (leg, z(a[0], a[1]))

ITENS = []
def it(n, t, p, ref, corpo, opcoes=None):
    ITENS.append(dict(n=n, t=t, p=p, ref=ref, corpo=corpo, opcoes=opcoes))



import base64 as _b
hj, pr = img('v0634-aba-pc.png'), img('v0635-aba-pc.png')
mn = img('v0635-aba-pc.png', 520, (0, 300, 240, 420))
pa, pg = img('v0635-pc.png'), img('v0635-pc-gaveta.png')
vt = img('v0635-vt-cheio.png', 900)
P = ('Seus pedidos de 26/11', '12:01: "a aba do Vértice tem que cobrir toda tela do Cwork"; 12:40: "podemos aproveitar o mecanismo das janelas em cima, porém otimizar"; "podemos abrir 2 ou 3 abas somente do Vértice"; ITEM 196: só Principal e Líder ★ salvam.')
REF = ('Referências', 'abas do Chrome e do Edge (aba ativa colada no conteúdo); abas de arquivo do VS Code e do Figma (nome do arquivo e X); barra fina do Arc e do Linear (pílulas discretas, sem enfeite).')

def faixa(k):
    tabs = [('cw', 'Cwork', False), ('v', 'Planilha sem título', True), ('v', 'Cadeia de custódia · Lab A', False)]
    def tab(t):
        ic = '<i class="fx-ic fx-' + t[0] + '"></i>'
        x = '' if t[0] == 'cw' else '<b class="fx-x">×</b>'
        return '<span class="fx-t' + (' on' if t[2] else '') + (' cw' if t[0] == 'cw' else '') + '">' + ic + '<span class="fx-n">' + t[1] + '</span>' + x + '</span>'
    corpo = ''.join(tab(t) for t in tabs) + '<span class="fx-mais">+</span><span class="fx-sp"></span><span class="fx-li">2 de 3 abas</span>'
    return '<div class="fx fx%d"><div class="fx-bar">%s</div><img src="%s" alt="Vértice em tela inteira"></div>' % (k, corpo, vt)

NOMES = {1: 'Abas de navegador', 2: 'Linha fina sublinhada (a de hoje, refeita)', 3: 'Pílulas discretas', 4: 'Trilho de ícones à esquerda', 5: 'Cápsula flutuante que recolhe'}
DESC = {1: 'Faixa de 36 px. A aba ativa fica clara e colada no Vértice; as outras ficam no fundo. Cwork é a primeira aba, com o ícone do app.',
        2: 'Faixa de 32 px, só texto e um traço dourado de 2 px embaixo da aba aberta. Sem relevo nem degradê (o que não ficou bom na de hoje).',
        3: 'Faixa escura de 34 px; cada aba é uma pílula pequena; a aberta fica dourada. Bom contraste com qualquer tema do Vértice.',
        4: 'Sem faixa no alto: um trilho de 44 px à esquerda com o Cwork e um quadradinho por aba do Vértice (o nome aparece ao passar o mouse). Ganha altura para a planilha.',
        5: 'A faixa some sozinha e vira uma cápsula pequena no alto, no meio; abre ao passar o mouse ou tocar. Máximo de espaço para o Vértice.'}
ops = ''.join('<div class="op"><p class="opn">OPÇÃO %d</p><b>%s</b><p class="opd">%s</p>%s</div>' % (k, NOMES[k], DESC[k], faixa(k)) for k in range(1, 6))

it(197, 'A aba cobre toda a área ao lado do menu (feito às 12:01)',
   'Como você pediu: sem o cabeçalho "Vértice Docs", sem margem e sem a dica que aparecia por cima. O Vértice vai do alto ao pé da tela, ao lado do menu do Cwork.',
   [P], par((hj, 'v0.6.34 com cabeçalho'), (pr, 'Proposta: cobre a área inteira')))
it(198, 'O ícone "Abrir em janela" mudou para o menu',
   'Sem o cabeçalho, o ícone da janela (a volta, ITEM 188) aparece ao lado de "Vértice Docs" no menu, ao passar o mouse ou quando a área está aberta. No celular fica sempre à vista.',
   [], um((mn, 'Ícone ao lado de Vértice Docs'), 'Ícone ao lado de Vértice Docs'))
it(199, 'O nome do arquivo aberto vai para o título da janela do navegador',
   'Sem o cabeçalho, o nome do arquivo aberto no Vértice aparece no título da aba do navegador e da janela do app instalado (por exemplo, "Planilha sem título · Vértice Docs · EFCwork").',
   [], '')
it(200, 'Tela inteira com abas no alto: escolha o modelo da faixa',
   'Ao abrir, o Vértice ocupa a tela toda (também por cima do menu do Cwork), usando o mecanismo das janelas no alto, refeito. A primeira aba sempre volta ao Cwork. Os cinco modelos usam a mesma tela do Vértice; escolha um. Você também pode pedir uma mistura no comentário.',
   [P, REF], '<div class="ops ops5" style="grid-template-columns:1fr">' + ops + '</div>', opcoes=5)
it(201, 'Até 3 abas do Vértice ao mesmo tempo',
   'O "+" abre outra aba do Vértice (no máximo 3); cada aba mostra o nome do arquivo aberto nela e tem o X para fechar (pergunta antes, se houver algo sem salvar). Precisa de uma conferência na conversa do Vértice: dois Vértices abertos no mesmo aparelho não podem gravar o mesmo arquivo ao mesmo tempo (vai na lista de pendências).',
   [P], '')
it(202, 'Pastas do Vértice: aba nova na Administração',
   'Só o Principal vê. As 5 pastas dos Impressos (Etiquetas, Fichas e custódias, Formulários, Fluxogramas, POPs e procedimentos), cada uma com quem lê. Padrão: todos que entram no Cwork. A regra de salvar fica escrita embaixo.',
   [('ITEM 196', 'Secundário e Visitante editam sem salvar; só Principal e Líder ★ salvam.')], um((pa, 'Administração › Pastas do Vértice'), 'Administração › Pastas do Vértice'))
it(203, 'Mudar quem lê uma pasta',
   'O lápis abre a gaveta da pasta: "Quem lê" numa janela retrátil (Todos que entram no Cwork, ou Só as pessoas marcadas) e a lista de Secundários e Visitantes para marcar. Principal e Líder ★ não aparecem na lista porque já leem tudo. Fica no histórico (Atividade).',
   [], um((pg, 'Gaveta da pasta'), 'Gaveta da pasta'))
it(204, 'O que a porta diz ao Vértice sobre as pastas (parte técnica)',
   'pastas() devolve, para quem entrou, cada pasta com ler, editar e salvar: Principal e Líder ★ leem e salvam em todas; Secundário e Visitante editam o que leem, sem salvar. Quando a pasta muda, o Cwork avisa o Vértice na hora (cwork:usuario). A planilha protegida e o "Desproteger" só para ★ ficam com a conversa do Vértice.',
   [], '')
it(205, 'A alça dourada que atrapalha as linhas da planilha',
   'Conferido no código do Vértice: a alça dourada da esquerda é dele (aparece quando o menu do Vértice está escondido) e fica em cima dos números das linhas. O conserto é na conversa do Vértice; sugestão escrita na lista de pendências: dentro do Cwork, a alça só aparece numa faixa de 6 px na borda ao passar o mouse, ou some e o menu abre pelo botão do alto.',
   [], '')
it(206, 'Próxima etapa: P3c (regras do Firestore do Vértice)',
   'Blocos novos para vtd_arquivos, vtd_partes e sv2_cfg/vertice_pastas (só o Principal muda), no mesmo arquivo da v0.6.33, para colar uma vez só. Depois, a P5 (o Vértice dentro do repositório efcwork), que você autorizou fazer aqui.',
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
  var $ = function (s, r) { return (r || document).querySelector(s); }, its = [].slice.call(document.querySelectorAll('.it')), K = 'efcwork-v0635-respostas';
  function texto() { return ['Respostas EFCwork v0.6.35 · Vértice em tela inteira e Pastas'].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
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

pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.35 · Vértice em tela inteira e Pastas</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.35</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Vértice em tela inteira e Pastas</h1><p class="sub">Na janela Papéis deste envio você marca o que sai: o rótulo do endereço (seu modelo do Vértice) e a cadeia de custódia ou a ficha. A planilha abre no Vértice com os dados da remessa, e o que foi feito (com a via assinada) fica na nuvem, igual em todos os aparelhos. Nada foi publicado: HOJE é a v0.6.32 no ar; PROPOSTA é o protótipo no app, com dados inventados.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada item, Aprovado ou Reprovado; no ITEM 178, o número da opção.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in sorted(ITENS, key=lambda x: x['n'])) +
       '<div class="fim"><h2>Depois da sua resposta</h2><ul><li>Fica só o modelo escolhido no ITEM 178 e o que for aprovado; entrego o ZIP, o arquivo de regras para colar uma vez só (v0.32 + R6) e publico só com o seu "pode publicar".</li><li>Para conferir depois de publicar, no celular e no PC: preencher uma custódia de verdade (com os campos marcados no Vértice) e anexar a foto da via assinada; abrir a mesma remessa no outro aparelho.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + FILME_JS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.35-vertice-pastas.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
