/* EFCwork · suíte da v0.6.1.1 — velocímetro travado, passos numerados, aviso de resolvido. Uso: node tools/testes/t_v0611.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const TELAS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  return p;
}
const semear = (p, n) => p.evaluate(async n => {
  const C = Data.col.bind(Data), a = new Date(Date.now() - 20 * 864e5).toISOString();
  for (let i = 1; i <= n; i++) await C('sv2_bebs').set('b' + i, { codigo: 'BR ' + pad(i), local: 'Local ' + i, situacao: 'ativo', ativoDesde: a, criadoEm: a, criadoPor: 'x' });
}, n);
const larg = p => p.evaluate(() => [...document.querySelectorAll('.cl-gk')].map(k => Math.round(k.getBoundingClientRect().width)));
const nums = p => p.evaluate(() => [...document.querySelectorAll('#gv .cl-p')].filter(x => x.offsetParent).map(x => x.querySelector('i').textContent + ' ' + x.textContent.replace(/^\d+/, '').trim()));
(async () => {
  const b = await chromium.launch();
  console.log('Velocímetro com tamanho travado:');
  const refer = {};
  for (const w of [900, 1280, 1600]) for (const n of [2, 5]) {
    const p = await abre(b, w); await semear(p, n); await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 700);
    const L = await larg(p); refer[w + '/' + n] = L;
    conf(L.length === n && L.every(x => x === 114), w + ' px com ' + n + ' locais: todos com 114 px (' + L.join(',') + ')');
    if (n === 2) {
      const esq = await p.evaluate(() => { const g = document.querySelector('.cl-gs').getBoundingClientRect(), k = document.querySelectorAll('.cl-gk'); return Math.abs(k[0].getBoundingClientRect().left - g.left) < 2 && k[1].getBoundingClientRect().right < g.right - 100; });
      conf(esq, w + ' px com 2 locais: alinhados à esquerda, sem esticar');
    } else conf(await p.evaluate(() => { const a = [...document.querySelectorAll('.cl-gk')].map(k => Math.round(k.getBoundingClientRect().top)); return a.every(t => t === a[0]); }), w + ' px com 5 locais: na mesma linha');
    if (w === 1280 && n === 2) await p.screenshot({ path: path.join(TELAS, 'v0611-pc-2locais.png') });
    if (w === 1280 && n === 5) await p.screenshot({ path: path.join(TELAS, 'v0611-pc-5locais.png') });
    conf(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), w + ' px: sem rolagem para o lado');
    conf(p._er.length === 0, w + ' px/' + n + ': sem erros no console'); await p.context().close();
  }
  const c = await abre(b, 390, 820); await semear(c, 2); await c.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(c, 700);
  const Lc = await larg(c);
  conf(Lc.every(x => x === 114) && await c.evaluate(() => innerWidth === 390 && document.documentElement.scrollWidth <= innerWidth), 'celular com 2 locais: 114 px, sem esticar e sem rolagem (' + Lc.join(',') + ')');
  await c.screenshot({ path: path.join(TELAS, 'v0611-cel-2locais.png') }); await c.context().close();

  console.log('Passos numerados e aviso de resolvido:');
  const p = await abre(b, 1280); await semear(p, 3); await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 700);
  await p.click('[data-act="cl-nova"]'); await esp(p, 500);
  let n = await nums(p); conf(n.map(x => x.split(' ')[0]).join(',') === '1,2,3,4', 'sem resultado: passos 1,2,3,4 (' + n.join(' | ') + ')');
  await p.fill('#gv [data-fm="valor"]', '0,15'); await esp(p, 400);
  n = await nums(p); conf(n.map(x => x.split(' ')[0]).join(',') === '1,2,3,4,5' && /^5 Registro/.test(n[4]), 'com 0,15: passos 1 a 5, Registro é o 5 (' + n.join(' | ') + ')');
  await p.fill('#gv [data-fm="valor"]', ''); await esp(p, 400);
  n = await nums(p); conf(n.map(x => x.split(' ')[0]).join(',') === '1,2,3,4' && /^4 Registro/.test(n[3]), 'apagando o valor: volta a 1 a 4, sem pular o 4 (' + n.join(' | ') + ')');
  await p.fill('#gv [data-fm="valor"]', '1,2'); await esp(p, 400);
  n = await nums(p); conf(/^5 Registro/.test(n[n.length - 1]) && n.length === 5, 'dentro da faixa: Aplicação aparece e Registro vira 5');
  await p.evaluate(() => { S.fm.ponto = 'caixa:' + (S.caixas[0] ? S.caixas[0].id : ''); });
  await p.fill('#gv [data-fm="valor"]', '0,15'); await esp(p, 300);
  console.log('  ... aviso:');
  await p.evaluate(() => { S.fm.ponto = 'beb:b1'; S.fm.valor = '0,1'; S.fm.dos = '30'; S.fm.v2 = '1,0'; gvDesenha(true); }); await esp(p, 300);
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 400);
  const t1 = await p.evaluate(() => document.body.innerText);
  conf(/Resolvido: dentro da faixa/.test(t1), 'lançar com cloro depois dentro da faixa avisa "Resolvido: dentro da faixa."');
  await p.click('[data-act="cl-nova"]'); await esp(p, 500);
  await p.evaluate(() => { S.fm.ponto = 'beb:b2'; S.fm.valor = '0,1'; S.fm.dos = '30'; gvDesenha(true); }); await esp(p, 300);
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 400);
  conf(/Falta a nova verificação/.test(await p.evaluate(() => document.body.innerText)), 'lançar sem o cloro depois continua avisando que falta a nova verificação');
  conf(p._er.length === 0, 'sem erros no console');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})();
