#!/usr/bin/env python3
"""EFCwork v0.6.36 · P3c, regras do Firestore do Vértice (ITENS 215 a 220). Saída: docs/aprovacao-efcwork-v0.6.36-regras-vertice.html"""
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



REF = ('Referências', 'abas do Chrome e do Edge (aba ativa colada no conteúdo); abas de arquivo do VS Code e do Figma (nome do arquivo e X); barra fina do Arc e do Linear (pílulas discretas, sem enfeite).')

def tab(linhas, cab=('Quem', 'Lê', 'Grava')):
    return '<table class="tb"><thead><tr>' + ''.join('<th>%s</th>' % html.escape(c) for c in cab) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>%s</td>' % html.escape(c) for c in l) + '</tr>' for l in linhas) + '</tbody></table>'
P = ('Seus pedidos', 'ITEM 196 (26/11): só Principal e Líder ★ salvam; Secundário e Visitante editam sem salvar. P3b: quem lê cada pasta em Administração › Pastas do Vértice. Combinado com o Vértice: versão sobe exatamente 1, nada se apaga, pedaços só criam.')
REV = ('Revisor novo', 'leu as regras sem a conversa: nada bloqueante; 4 pontos importantes corrigidos antes desta página (este item inclui a correção).')
it(215, 'Quem lê os documentos do Vértice na nuvem',
   'O Principal e o Líder ★ leem tudo. Os outros leem as pastas de "todos" e aquelas em que você os marcou em Pastas do Vértice. Pasta que você nunca mexeu = todos leem, como mostra a tela hoje. O pedaço do arquivo segue a pasta do arquivo. Quem não pode ler recebe "negado" do próprio Firebase, mesmo que alguém tente por fora do app.',
   [P], tab([('Principal', 'tudo', 'sim'), ('Líder ★', 'tudo', 'sim'), ('Secundário / Visitante', 'pastas de todos + as marcadas', 'não (edita e imprime sem salvar)')]))
it(216, 'Quem grava, e duas pessoas salvando ao mesmo tempo',
   'Só o Principal e o Líder ★ gravam. Arquivo novo começa na versão 1, e cada gravação sobe exatamente 1. Se duas pessoas salvarem o mesmo arquivo ao mesmo tempo, o Firebase aceita a primeira e recusa a segunda; o Vértice guarda o trabalho da segunda como "cópia em conflito" (nada se perde). A ficha guarda o nome de quem gravou, conferido com o cadastro.',
   [P], '')
it(217, 'O conteúdo em pedaços: só nascem, nunca mudam nem se apagam',
   'Cada versão do arquivo vai em pedaços de até 900 mil letras (como os Impressos). Um pedaço nunca muda e nunca é apagado; o nome dele leva o arquivo, a versão e a conta de quem gravou, então ninguém atrapalha o envio de outra pessoa. A ficha só pode apontar para pedaços que existem. As versões antigas ocupam espaço no Firebase; se pesar, você decide depois um jeito de esvaziar.',
   [P], '')
it(218, 'Renomear, mudar de pasta ou mandar para a lixeira sem reenviar o arquivo',
   'Achado do revisor: do jeito da primeira proposta, qualquer mudança na ficha (nome, pasta, lixeira) obrigaria a mandar o arquivo inteiro de novo. Agora a ficha pode continuar apontando para os mesmos pedaços de antes; a versão sobe 1 e nada é reenviado.',
   [REV], '')
it(219, 'Pastas do Vértice: só o Principal muda, sempre com o mapa de acesso',
   'Hoje a regra geral deixaria o Líder ★ mudar quem lê as pastas pelo Firebase (a tela já é só do Principal). Passa a ser só o Principal. O Cwork v0.6.36 grava junto um mapa "pasta → quem lê", que é o que a regra consulta (a regra não procura dentro de lista). Quem ainda estiver com o app antigo não consegue salvar as pastas, para não abrir todas sem querer.',
   [P, REV], '')
it(220, 'Ordem para ligar (você faz no Firebase)',
   '1) Eu publico o app v0.6.36. 2) Você abre o app uma vez como Administrador (ele grava o mapa das pastas). 3) No Simulador do Firebase, cola as regras novas sem publicar e roda os 17 testes do roteiro (GUIA-SIMULADOR-v0.6.36.md), com 2 documentos de teste criados à mão. 4) Tudo como esperado: publica as regras. O resto das regras (EFClaudian e Cwork) fica exatamente igual; conferido linha a linha com as que você colou hoje.',
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
  var $ = function (s, r) { return (r || document).querySelector(s); }, its = [].slice.call(document.querySelectorAll('.it')), K = 'efcwork-v0636-respostas';
  function texto() { return ['Respostas EFCwork v0.6.36 · regras do Vértice'].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
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
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.36 · regras do Vértice</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.36</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Regras do Vértice na nuvem (P3c)</h1><p class="sub">Quem lê e quem grava os documentos do Vértice no Firebase. Nada publicado: as regras só valem depois que você colar no Firebase, testar no Simulador e publicar. Fora destes blocos, as regras ficam exatamente como as que você colou hoje.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada item, Aprovado ou Reprovado, com comentário se quiser.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in sorted(ITENS, key=lambda x: x['n'])) +
       '<div class="fim"><h2>Depois da sua resposta</h2><ul><li>Aplico só o aprovado e publico o app v0.6.36 só com o seu "pode publicar".</li><li>Entrego o arquivo de regras para colar uma vez só e o roteiro do Simulador.</li><li>A nota para a conversa do Vértice (formato que as regras aceitam) vai junto para você levar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + FILME_JS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.36-regras-vertice.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
