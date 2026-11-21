#!/usr/bin/env python3
"""EFCwork v0.6.33 · página de aprovação "Documentos da remessa" (ITENS 170 a 184).
Fotos: tools/testes/telas/v0633-*.png (t_v0633.js --fotos e --hoje). Saída: docs/aprovacao-efcwork-v0.6.33-remessa.html"""
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
def par(a, b, la='HOJE (v0.6.32, no ar)', lb='PROPOSTA (v0.6.33)', cel=False):
    return '<div class="%s"><div class="lado"><div><p class="leg">%s</p>%s</div><div><p class="leg">%s</p>%s</div></div></div>' % ('par-cel' if cel else 'par', la, z(a[0], a[1]), lb, z(b[0], b[1]))
def um(a, leg): return '<div><p class="leg">%s</p>%s</div>' % (leg, z(a[0], a[1]))

ITENS = []
def it(n, t, p, ref, corpo, opcoes=None):
    ITENS.append(dict(n=n, t=t, p=p, ref=ref, corpo=corpo, opcoes=opcoes))

# imagens
hoje_g, prop_g = img('v0633-hoje-gaveta.png'), img('v0633-pc-gaveta-antes.png')
hoje_c, prop_c = img('v0633-hoje-cel.png', 420), img('v0633-cel-m1.png', 420)
labB = img('v0633-pc-gaveta-labB.png')
prev, preen = img('v0633-pc-vertice-previa.png'), img('v0633-pc-gaveta-preenchido.png')
via = img('v0633-pc-via-assinada.png')
J = (850, 0, 1280, 860)
hoje_p, prop_p = img('v0633-hoje-papeis.png', 430, J), img('v0633-pc-papeis-envio.png', 430, J)
semend, prox = img('v0633-pc-papeis-semend.png', 430, J), img('v0633-pc-papeis-proximo.png', 430, J)
mod = {m: (img('v0633-pc-m%d.png' % m, 520), img('v0633-cel-m%d.png' % m, 420)) for m in range(1, 6)}
P = ('Seus pedidos, 20/11 23:44 e 23:52', '"vou poder escolher quais documentos imprimir"; "cadeia de custódia ou ficha, nunca os dois"; "tudo pelo Vértice fica mais fácil"; "endereço vou fazer o modelo no Vértice e anexar padrão para cada laboratório"')

it(170, 'Papéis deste envio: você marca o que sai',
   'HOJE a janela mostra o que o kit manda e só tira o rótulo se você desmarcar. PROPOSTA: cada papel do laboratório é uma linha com caixa de marcar: o rótulo do endereço e a cadeia de custódia ou a ficha. Os dois vêm marcados; você desmarca o que não quer e toca em Imprimir. Embaixo de cada papel, como ele sai ("imprime aqui", "abre no Vértice já preenchido", "abre no Vértice com os dados ao lado"). "Quer acrescentar algo na ficha?" virou "Dados que vão para o papel".',
   [P], par((hoje_p, 'Papéis deste envio hoje'), (prop_p, 'Papéis deste envio na proposta'), cel=True))

it(171, 'Cadeia de custódia OU ficha, uma por laboratório',
   'Cada laboratório tem um documento só no kit: a custódia ou a ficha. Anexar um novo no lugar substitui o anterior (o antigo sai do kit, nada se apaga). Escolher o documento certo para cada material e análise fica com você, no Vértice: o EFCwork não filtra por material.',
   [P], '')

it(172, 'Rótulo do endereço: o seu modelo do Vértice, por laboratório',
   'Você faz no Vértice o rótulo padrão de cada laboratório e anexa como "Rótulo do endereço (modelo)". Ele entra no lugar do rótulo do sistema e abre no Vértice com os dados da remessa. O rótulo do sistema (uma folha por caixa, com remetente e destinatário do cadastro) continua para o laboratório que ainda não tem modelo.',
   [P], '<div class="lado">' + um((labB, 'Laboratório B com o modelo de rótulo'), 'PROPOSTA · a remessa do Laboratório B usa o modelo dele') + '</div>')

it(173, 'Anexar o papel na própria janela',
   'Para quem cuida do kit (Administrador e Líder), a janela tem "Anexar papel deste laboratório": escolhe o tipo (custódia ou ficha, ou rótulo do endereço) e o papel que veio do Vértice (Documentos › Impressos). Depois de anexar, volta para a mesma janela com o papel já marcado. Anexa uma vez e vale para os envios seguintes.',
   [P, ('Antes', 'Só dava para anexar em Envio › Laboratórios, por isso a sua janela da remessa da IBRA só mostrava o rótulo.')], '')

it(174, 'Sem endereço: sem a faixa vermelha',
   'HOJE, sem o endereço do laboratório, a janela abre com uma faixa vermelha e o rótulo marcado. PROPOSTA: o rótulo do sistema vem desmarcado, a linha diz "falta o endereço do laboratório" e tem "Cadastrar endereço" ali mesmo (depois de salvar, volta marcado). A mensagem vermelha só aparece se você tentar imprimir esse rótulo sem endereço.',
   [('Sua tela, 20/11 23:40', 'Papéis deste envio com "Falta o endereço do laboratório para o rótulo" no alto.')], '<div class="lado par-cel">' + um((semend, 'Laboratório sem endereço e sem papel'), 'PROPOSTA · laboratório sem endereço e sem papel') + '</div>')

it(175, 'Planilha abre no Vértice com os dados da remessa',
   'No Imprimir, a planilha (custódia, ficha ou rótulo modelo) abre no Vértice, na janela de dentro. Se ela tiver as células marcadas (efc_…), o Vértice já monta a cópia preenchida e mostra a prévia; se não, abre o arquivo com o resumo do envio ao lado para você preencher. Você confere e imprime de lá. PDF fixo imprime direto; Word baixa (o Vértice ainda não edita Word). Provado com o Vértice de verdade (v0.6.42) e dados inventados.',
   [('O que já existia', 'Vértice v0.6.17 (Ponte 2): preencher pelas células efc_… e avisar o Cwork. O lado do EFCwork faltava.')],
   '<div class="filme" data-filme><div class="fq">' + ''.join('<figure class="%s"><img src="%s" alt="%s"><figcaption>%s</figcaption></figure>' % ('on' if i == 0 else '', s, html.escape(c), html.escape(c)) for i, (s, c) in enumerate([(prop_g, '1 · Remessa: a custódia "Falta"'), (prev, '2 · O Vértice abre com a cópia preenchida: confira e imprima'), (preen, '3 · Volta "Preenchido no Vértice" · 2 de 2 prontos')])) +
   '</div><div class="fbar"><button type="button" class="bt" data-f="ant" aria-label="Anterior">‹</button><span data-f="n">1 de 3</span><button type="button" class="bt" data-f="pro" aria-label="Próximo">›</button><button type="button" class="bt" data-f="play">Pausar</button></div></div>')

it(176, 'Dois papéis no Vértice: um de cada vez',
   'A janela do Vértice mostra um documento por vez. Com o rótulo modelo e a custódia marcados, o Imprimir abre o primeiro no Vértice e a janela fica com o botão "Abrir o próximo no Vértice". Imprima, volte para a aba do EFCwork e toque nele.',
   [('Achado no teste', 'Sem isso, o segundo documento apagava o primeiro na janela do Vértice.')], '<div class="lado par-cel">' + um((prox, 'Abrir o próximo no Vértice'), 'PROPOSTA · depois de abrir o primeiro') + '</div>')

it(177, 'Documentos da remessa, na gaveta: em que pé está cada papel',
   'HOJE a remessa mostra só "Papéis impressos" depois que alguém imprime. PROPOSTA: a seção lista os papéis do laboratório com a situação de cada um (Falta, Impresso, Aberto no Vértice, Preenchido no Vértice, Via assinada anexada), a hora e quem fez, e "1 de 2 prontos". A impressora ou a caneta de cada linha faz o mesmo que a janela, só para aquele papel. Fica na nuvem: o mesmo em qualquer aparelho.',
   [('Sua pergunta, 20/11 22:28', '"cada aparelho que uso não compartilha o histórico"')],
   par((hoje_g, 'Gaveta da remessa hoje'), (prop_g, 'Gaveta com Documentos da remessa')) + par((hoje_c, 'Celular hoje'), (prop_c, 'Celular com a seção'), cel=True))
op = ''.join('<div class="op"><p class="opn">OPÇÃO %d</p><p class="opt">%s</p><div class="lado">%s%s</div></div>' % (m, t, um((mod[m][0], 'Opção %d no computador' % m), 'Computador (gaveta)'), um((mod[m][1], 'Opção %d no celular' % m), 'Celular'))
             for m, t in [(1, 'Lista de conferência: um círculo que fica verde quando o papel está pronto; a situação em letra pequena.'), (2, 'Etapas por papel: Preencher, Imprimir, Via assinada; a etapa feita fica verde.'),
                          (3, 'Tabela: Documento, Situação (com a hora embaixo) e os botões.'), (4, 'Resumo que abre: uma linha com a barra "2 de 2"; tocar abre a lista.'), (5, 'Cartões lado a lado, um por papel.')])
it(178, 'Visual da seção: escolha uma das 5 opções',
   'As cinco mostram a mesma remessa: no computador, depois de imprimir o rótulo e anexar a via assinada da custódia; no celular, antes de tudo (o que falta em âmbar). Os mesmos botões em todas: impressora (rótulo e PDF), caneta (preencher no Vértice) e clipe (anexar a via assinada). Botões de 36 px no computador e 44 px no celular. Responda com o número da opção; no comentário, o que mudar nela.',
   [('Padrões do Elias', 'Sem cartões de contagem como filtro, ícones desenhados, situação em letra pequena; cor só quando indica problema (Falta em âmbar).')], op, opcoes=5)

it(180, 'Aparelho sem o modelo no Vértice: o EFCwork leva sozinho',
   'Cada aparelho tem o seu Vértice. Se o deste aparelho ainda não tem o modelo da custódia, ele responde "sem documento". O EFCwork então leva o arquivo original que está na nuvem, guarda no Vértice e pede de novo, sem você fazer nada. Fica o aviso: "levei o modelo. Toque em Ver e imprimir quando ele avisar". Na foto do item 175 (passo 2), o aviso aparece embaixo.',
   [('Provado', 'No teste, o Vértice começou vazio: recusou, recebeu o modelo e imprimiu preenchido.')], '')

it(181, 'O que fica guardado na nuvem (vale em qualquer aparelho)',
   'Cada papel impresso, preenchido ou anexado vira um registro da remessa (coleção nova sv2_rem_docs): o papel, quem, quando, a versão do modelo e, no preenchido, os dados que foram para o Vértice e o número de páginas. Assim, abrindo a remessa em outro aparelho, você vê a mesma situação, e a caneta imprime de novo com os dados da remessa. O documento preenchido em si (o PDF) não volta do Vértice: só a confirmação. Para guardar o PDF preenchido, veja o item 184.',
   [('Sua pergunta, 20/11 22:28', '"cada aparelho que uso não compartilha o histórico"')], '<table class="tb"><tr><th>Campo</th><th>Exemplo</th></tr>' + ''.join('<tr><td>%s</td><td>%s</td></tr>' % r for r in [('Papel', 'Cadeia de custódia · Laboratório A'), ('O que', 'Preenchido no Vértice'), ('Quem e quando', 'Joana Silva · 20/11/2026 23:34'), ('Modelo', 'CUS-01, versão 1, 1 página'), ('Dados usados', 'Laboratório, O.S, data, coletor, 2 amostras')]) + '</table>')

it(179, 'Via assinada: foto ou PDF anexado à remessa',
   'O clipe de cada papel abre a câmera ou os arquivos. A foto é reduzida no aparelho (fica legível, até 900 mil letras, perto de 650 KB) e o PDF entra até 650 KB. Vai para a nuvem (coleção nova sv2_rem_arq) e só é baixado quando alguém abre. O papel fica "Via assinada anexada" com o anexo para tocar. Na foto aberta, a lixeira fica no canto de cima: tirar não apaga, marca "removido" (quem anexou, o líder ★ ou o Principal).',
   [('Referência', 'Órgãos ambientais (NC DEQ): tirar foto ou cópia da custódia preenchida e assinada para o registro; o original vai na caixa.')],
   '<div class="lado">' + um((via, 'Foto da via assinada aberta'), 'PROPOSTA · a via aberta, com a lixeira') + um((mod[1][0], 'Seção com o anexo'), 'PROPOSTA · o anexo na lista (data)') + '</div>')

it(182, 'Quem pode e a regra nova [R6]',
   'Como você disse: todos que têm acesso às Coletas e lançam podem imprimir, preencher e anexar a via assinada (o visitante não vê os botões nem as vias). Montar o kit (anexar papel, endereço) continua com o Administrador e o Líder. Na nuvem, a regra [R6] deixa gravar só em nome de quem está logado, confere o nome, aceita só os campos combinados, não deixa apagar nada e, para tirar um anexo, guarda a conta de quem tirou (uma vez só). Ela foi acrescentada ao arquivo de regras da v0.6.32: o arquivo REGRAS-FIRESTORE-EFCwork-v0.6.33-PROPOSTA.txt substitui o da v0.6.32, para você colar uma vez só. Sem colar a regra, o EFCwork mostra a seção, mas a nuvem recusa o registro (permissão negada).',
   [('Sua resposta, 20/11 23:05', '"todos que tem autorização ao campo pode fazer o preenchimento dos dados para envio"')], '')

it(183, 'Revisor de fora: o que foi corrigido',
   'Um revisor que não viu a conversa leu a regra e o módulo e achou 7 pontos importantes, todos corrigidos e testados: a confirmação do Vértice só sai da caixa depois de gravada na nuvem; sem internet nada trava (vai quando a rede volta); o anexo e o registro vão juntos (ou os dois, ou nenhum); duas abas abertas não apagam o pedido uma da outra; o pedido leva a versão do modelo (o Vértice recusa outra versão); e os dois pontos da regra (item 182). Dos detalhes, entraram: visitante não lê as vias, PDF com defeito avisa, pedido esquecido sai depois de 30 dias, "Baixar PDF" no Vértice vira "Preenchido no Vértice" (não "impresso").',
   [('Método Sabiá', 'Versão que toca dados e acesso passa por revisor novo.')], '')

it(184, 'Próxima etapa (decisão): o Vértice devolver o PDF preenchido',
   'Hoje o Vértice só avisa "imprimiu" (o contrato não leva o arquivo de volta). Se ele mandar junto o PDF da cópia preenchida (ele já sabe gerar: "Baixar PDF"), o EFCwork guarda o próprio documento preenchido na remessa, e qualquer aparelho abre sem passar pelo Vértice. Isso muda o Vértice e o contrato (v2) e é feito na conversa do Vértice, que eu não mexo daqui. Aprovado = eu escrevo a nota para a IA do Vértice com o pedido.',
   [('Contrato EFD v1', '"resposta" leva ok, erro e páginas; o arquivo só vai no "documento".')], '')

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
  var $ = function (s, r) { return (r || document).querySelector(s); }, its = [].slice.call(document.querySelectorAll('.it')), K = 'efcwork-v0633-respostas';
  function texto() { return ['Respostas EFCwork v0.6.33 · Documentos da remessa'].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
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

pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.33 · Documentos da remessa</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.33</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Documentos da remessa</h1><p class="sub">Na janela Papéis deste envio você marca o que sai: o rótulo do endereço (seu modelo do Vértice) e a cadeia de custódia ou a ficha. A planilha abre no Vértice com os dados da remessa, e o que foi feito (com a via assinada) fica na nuvem, igual em todos os aparelhos. Nada foi publicado: HOJE é a v0.6.32 no ar; PROPOSTA é o protótipo no app, com dados inventados.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada item, Aprovado ou Reprovado; no ITEM 178, o número da opção.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in sorted(ITENS, key=lambda x: x['n'])) +
       '<div class="fim"><h2>Depois da sua resposta</h2><ul><li>Fica só o modelo escolhido no ITEM 178 e o que for aprovado; entrego o ZIP, o arquivo de regras para colar uma vez só (v0.32 + R6) e publico só com o seu "pode publicar".</li><li>Para conferir depois de publicar, no celular e no PC: preencher uma custódia de verdade (com os campos marcados no Vértice) e anexar a foto da via assinada; abrir a mesma remessa no outro aparelho.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + FILME_JS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.33-remessa.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
