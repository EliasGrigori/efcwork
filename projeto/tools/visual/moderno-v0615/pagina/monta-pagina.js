/* Monta docs/aprovacao-efcwork-v0.6.15-moderno.html: 15 itens, HOJE × PROPOSTA do app de verdade,
   quadros de movimento, o app funcionando dentro da página e as respostas (Aprovado/Reprovado + comentário + Copiar). */
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');

let IMGD, IMG;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const uri = n => { if (!IMG[n]) throw new Error('imagem faltando: ' + n); return 'data:image/webp;base64,' + fs.readFileSync(path.join(IMGD, n + '.webp')).toString('base64'); };

const CFG = require(process.argv[2] ? require('path').resolve(process.argv[2]) : './itens-p1'), { R, GRUPOS, ITENS } = CFG;
IMGD = path.join(__dirname, 'out', CFG.img); IMG = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', CFG.img + '.json'), 'utf8'));

function figura(n, id, suf, leg, cel) {
  const nome = 'i' + n + '-' + id + '-' + suf, m = IMG[nome];
  return '<figure class="' + suf + (cel ? ' cel' : '') + '"><figcaption>' + (suf === 'hoje' ? 'HOJE' : 'PROPOSTA') + '</figcaption><button type="button" class="zoom" data-par="' + n + '-' + id + '" data-lado="' + suf + '" aria-label="Ampliar: ' + (suf === 'hoje' ? 'hoje' : 'proposta') + ' · ' + esc(leg) + '"><img loading="lazy" width="' + m.w + '" height="' + m.h + '" src="' + uri(nome) + '" alt="' + (suf === 'hoje' ? 'Como está hoje' : 'Proposta') + ': ' + esc(leg) + '"></button></figure>';
}
function parHTML(it, pr) {
  const [id, leg, cel] = pr;
  return '<div class="par' + (cel ? ' par-cel' : '') + '"><p class="leg">' + esc(leg) + '</p><div class="lado">' + figura(it.n, id, 'hoje', leg, cel) + figura(it.n, id, 'prop', leg, cel) + '</div></div>';
}
function filmeHTML(it) {
  const f = it.filme, lin = suf => '<div class="tira"><b>' + (suf === 'hoje' ? 'HOJE' : 'PROPOSTA') + '</b><div class="qs">' + f.tempos.map((t, k) => { const nome = 'i' + it.n + '-' + f.id + '-' + suf + '-q' + k, m = IMG[nome]; return '<figure><img loading="lazy" width="' + m.w + '" height="' + m.h + '" src="' + uri(nome) + '" alt="' + (suf === 'hoje' ? 'Hoje' : 'Proposta') + ' aos ' + t + ' ms"><figcaption>' + t + ' ms</figcaption></figure>'; }).join('') + '</div></div>';
  return '<div class="filme"><p class="leg">' + esc(f.leg) + '</p>' + lin('hoje') + lin('prop') + '</div>';
}
function tempoHTML(it) {
  const t = it.tempo, max = Math.max(t.hoje, t.prop), seg = ms => (ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' s';
  const lin = (k, ms) => '<div class="tp-l"><b>' + (k === 'hoje' ? 'HOJE' : 'PROPOSTA') + '</b><span class="tp-b"><i class="' + k + '" style="width:' + (ms / max * 100).toFixed(1) + '%"></i></span><span class="tp-v">' + seg(ms) + '</span></div>';
  return '<div class="tempo"><p class="leg">' + esc(t.leg) + '</p>' + lin('hoje', t.hoje) + lin('prop', t.prop) + '<p class="tp-n">A régua começa quando a tela abre. Para ver o movimento, use “Ver funcionando no app”.</p></div>';
}
function refHTML(it) {
  const r = it.ref, a = x => /^https?:/.test(x[1]) ? '<a href="' + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a>' : esc(x[0]) + ' (' + esc(x[1]) + ', no pacote)';
  return '<p class="ref"><b>Referência</b> ' + a(r[0]) + (r[2] ? ' e ' + a(r[2]) : '') + '. ' + esc(r[1]) + '</p>';
}
function vivoHTML(it) {
  const v = it.vivo;
  return '<div class="vivo" data-n="' + it.n + '"><div class="vbar"><button type="button" class="bt pr" data-v="abre">Ver funcionando no app</button>' +
    '<span class="vctl" hidden>' + (v.feito ? '<span class="vjafeito">' + esc(CFG.jaFeito || 'Já está no app (v0.6.15, não publicada)') + '</span>' : '<span class="seg" role="group" aria-label="Versão"><button type="button" data-v="hoje" aria-pressed="false">HOJE</button><button type="button" data-v="prop" aria-pressed="true">PROPOSTA</button></span>') +
    (v.passos ? '<button type="button" class="bt" data-v="denovo">Ver de novo</button>' : '') +
    (v.so ? '' : '<button type="button" class="bt" data-v="ap" data-ap="pc">PC</button><button type="button" class="bt" data-v="ap" data-ap="cel">Celular</button>') +
    '<button type="button" class="bt" data-v="cheia">Tela cheia</button><button type="button" class="bt" data-v="fecha">Fechar o app</button></span></div>' +
    (v.so === 'pc' ? '<p class="vnota so-cel">Esta mudança é do PC. No celular o app abre em tamanho reduzido; use “Tela cheia” e gire o aparelho.</p>' : '') +
    '<p class="vdica" hidden>' + esc(v.dica || 'O app está solto: pode clicar e navegar à vontade.') + '</p><div class="vpal" hidden></div></div>';
}
function itemHTML(it) {
  return (GRUPOS[it.n] ? '<h2 class="grupo">' + esc(GRUPOS[it.n]) + '</h2>' : '') +
    '<article class="it" id="item-' + it.n + '" data-n="' + it.n + '" data-t="' + esc(it.t) + '"><header><div class="num">ITEM <span>' + it.n + '</span></div><div class="cab"><h3>' + esc(it.t) + '</h3><p>' + esc(it.p) + '</p>' + refHTML(it) + '</div></header>' +
    (it.pares || []).map(p => parHTML(it, p)).join('') + (it.filme ? filmeHTML(it) : '') + (it.tempo ? tempoHTML(it) : '') + vivoHTML(it) +
    '<div class="resp"><div class="voto" role="radiogroup" aria-label="Resposta do item ' + it.n + '"><input type="radio" name="r' + it.n + '" id="r' + it.n + '-a" value="Aprovado"><label for="r' + it.n + '-a" class="ok">Aprovado</label><input type="radio" name="r' + it.n + '" id="r' + it.n + '-r" value="Reprovado"><label for="r' + it.n + '-r" class="no">Reprovado</label></div>' +
    '<label class="com" for="c' + it.n + '">Comentário<textarea id="c' + it.n + '" rows="2" placeholder="O que mudar, se quiser (opcional)"></textarea></label></div></article>';
}

const APP = require('./monta-app')(RAIZ, CFG.semente || '');
const VIVOS = {}; ITENS.forEach(it => { VIVOS[it.n] = { rota: it.vivo.rota, passos: it.vivo.passos || [], so: it.vivo.so || '', feito: !!it.vivo.feito }; });
const jsStr = s => JSON.stringify(s).replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const CSS = fs.readFileSync(path.join(__dirname, 'pagina.css'), 'utf8'), JS = fs.readFileSync(path.join(__dirname, 'pagina.js'), 'utf8');
const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(CFG.titulo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="topo"><div class="topo-in"><b>${esc(CFG.topo || 'EFCwork v0.6.15')}</b><span id="cont">0 de ${ITENS.length} respondidos</span><span class="sp"></span><button type="button" class="bt pr" id="copiar">Copiar respostas</button></div></div>
<main>
<h1>${esc(CFG.h1)}</h1>
<p class="sub">${CFG.sub || ''}São ${ITENS.length} mudanças. Cada uma mostra o app de verdade em <b>HOJE</b> e <b>PROPOSTA</b>, a referência de onde veio a ideia e um botão para ver funcionando dentro do app. Marque <b>Aprovado</b> ou <b>Reprovado</b> em cada item; no comentário, diga o que mudar. Só entra no app o que for aprovado.</p>
<ul class="como"><li>Toque numa imagem para ampliar. Na imagem ampliada, toque de novo para alternar entre HOJE e PROPOSTA no mesmo lugar.</li><li>“Ver funcionando no app” abre o EFCwork em demonstração, com dados inventados (Joana Silva, Fazenda Exemplo). Nada é gravado; baixar planilha, imprimir e abrir outros apps ficam desligados na demonstração.</li><li>As cores, as fontes e o que você já aprovou continuam como estão.</li></ul>
${ITENS.map(itemHTML).join('\n')}
<section class="fim"><h2>Enviar as respostas</h2><p>Aperte o botão, cole o texto na conversa e eu aplico só o que foi aprovado.</p><button type="button" class="bt pr gr" id="copiar2">Copiar respostas</button><p id="copiado" role="status" aria-live="polite"></p><textarea id="saida" rows="8" readonly hidden aria-label="Respostas para copiar"></textarea>
<h2>Fica para depois</h2><ul>${CFG.fila.map(x => '<li>' + esc(x) + '</li>').join('')}</ul></section>
</main>
<div id="lb" hidden role="dialog" aria-modal="true" aria-label="Imagem ampliada"><div class="lb-bar"><span id="lb-t"></span><span class="seg" role="group" aria-label="Versão"><button type="button" data-lb="hoje">HOJE</button><button type="button" data-lb="prop">PROPOSTA</button></span><button type="button" class="bt" data-lb="x">Fechar</button></div><div class="lb-pal"><img id="lb-img" alt=""></div></div>
<script>const APP_SRC=${jsStr(APP)};const VIVOS=${jsStr(VIVOS)};const PAG=${jsStr({ chave: CFG.chave, copia: CFG.copia })};</script>
<script>${JS}</script>
</body></html>`;
const dest = path.join(RAIZ, CFG.saida);
fs.writeFileSync(dest, html);
console.log('página', Math.round(html.length / 1024), 'KB ·', ITENS.length, 'itens ·', dest);
