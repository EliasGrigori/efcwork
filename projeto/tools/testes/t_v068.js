/* EFCwork · suíte da v0.6.8 — correções da varredura de 12/11/2026: dia local dos carimbos, pedido de autorização que falha, textos do Início,
   alturas de toque no celular. ?demo=1, fuso America/Fortaleza. Uso: node tools/testes/t_v068.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Não deu para enviar|simulada/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  return p;
}
(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);
  console.log('Dia local dos carimbos (registro feito às 22h em Russas = 01h UTC do dia seguinte):');
  const r = await p.evaluate(() => { const ts = '2026-11-13T01:10:00.000Z'; return { d: diaLocal(ts), f: fmtD(ts), pura: diaLocal('2026-11-12'), vazia: diaLocal('') }; });
  conf(r.d === '2026-11-12' && r.f === '12/11/2026', 'diaLocal e fmtD dão 12/11 (antes davam 13/11)');
  conf(r.pura === '2026-11-12' && r.vazia === '', 'data pura e vazia voltam iguais');
  const src = await p.evaluate(() => [lcTravar, Aprov.pedir].map(String).join(''));
  conf(/_pedir/.test(src), 'Aprov.pedir passou a ter proteção');
  console.log('Pedido de autorização que falha:');
  const res = await p.evaluate(async () => {
    const col = Data.col; Data.col = n => { const c = col.call(Data, n); if (n === 'sv2_aprov') return Object.assign({}, c, { add: async () => { throw new Error('falha simulada'); } }); return c; };
    const u = S.users.find(x => x.id === S.user.id); const sup0 = S.user.superiorIds;
    let r; try { r = await Aprov.pedir({ tipo: 'geral', titulo: 'Teste', para: [S.user.id] }); } catch (e) { r = 'LANÇOU: ' + e.message; }
    Data.col = col; return r;
  });
  await esp(p, 300);
  conf(res === null, 'devolve vazio em vez de quebrar (' + res + ')');
  conf(/Não deu para enviar o pedido/.test(await p.textContent('body')), 'mostra o aviso "Não deu para enviar o pedido"');
  console.log('Início:');
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 400);
  const ini = await p.evaluate(() => [...document.querySelectorAll('.ini-li small')].map(x => x.textContent).join(' | '));
  conf(!/chega na v0\.4/.test(ini) && !/chega na v0\.6/.test(ini) && /amostras, água, programação/.test(ini) && /cloro, apontamentos e auditoria interna/.test(ini), 'Coletas e Inspeções com o texto de hoje (não mais "chega na v0.4/v0.6")');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await p.context().close();
  console.log('Celular (390):');
  const m = await abre(b, 390, 800);
  const hb = await m.evaluate(() => { const e = document.querySelector('.cs-busca'); return e ? Math.round(e.getBoundingClientRect().height) : 0; });
  conf(hb >= 44, 'busca do topo com 44 px (' + hb + ')');
  await m.evaluate(() => { location.hash = '#/adm/empresa'; }); await esp(m, 400);
  const hi = await m.evaluate(() => [...document.querySelectorAll('.cp input, .cp select')].filter(e => e.offsetWidth).map(e => Math.round(e.getBoundingClientRect().height)));
  conf(hi.length > 0 && hi.every(h => h >= 44), 'campos da Empresa com 44 px (' + hi.join(', ') + ')');
  conf(m._er.length === 0, 'sem erros no console (celular)');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
