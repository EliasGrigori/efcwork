/* EFCwork · suíte da v0.4.13 — total de Amostras em cima da coluna também em 1280–1366 px (linha própria quando a coluna fica embaixo dos ícones). v0.5.3: a linha própria acabou; o total fica na linha dos ícones.
   Uso: node tools/testes/t_v0413.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
async function abre(b, w, longo) {
  const p = await (await b.newContext({ viewport: { width: w, height: 860 } })).newPage();
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async lg => { const C = Data.col.bind(Data); await C('sv2_cfg').set('coletas', { labs: ['IBRA'] });
    for (let i = 0; i < 6; i++) await C('sv2_coletas').set('c' + i, { tipo: 'SOLO', data: addDias(hojeISO(), -i), talhao: 'RU1' + i + 'TAI24', analiseNome: lg ? 'Solo completo ' + i : 'SOLO', lab: 'IBRA', situacao: 'ativa', coletor: 'Juraci', valor: 120 + i, os: lg ? 'OS-2026-00' + i : '', criadoEm: nowISO() }); }, longo);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(600);
  return p;
}
const mede = p => p.evaluate(() => { const t = document.querySelector('.tb-tots'), tv = t.querySelector('.tb-tv').getBoundingClientRect(), lb = t.querySelector('.tb-tl').getBoundingClientRect(), th = document.querySelector('.tb-cab th[data-tbk="val"]').getBoundingClientRect(), cab = document.querySelector('.tb-cab').getBoundingClientRect(), ics = [...document.querySelectorAll('.tb-bar .ic-so')].map(x => x.getBoundingClientRect());
  const cruza = ics.some(i => !(tv.right <= i.left || tv.left >= i.right || tv.bottom <= i.top || tv.top >= i.bottom));
  return { fluxo: t.classList.contains('tb-tots-fluxo'), linha: t.classList.contains('tb-tots-linha'), direita: Math.abs(tv.right - th.right) < 2, semIcone: !cruza, acimaCab: tv.bottom <= cab.top + 0.5, rotulo: lb.right <= tv.left + 0.5, mesmaLinhaIcones: Math.abs(tv.top - ics[0].top) < 2 }; });
(async () => {
  const b = await chromium.launch();
  console.log('1366 px, colunas largas (caso do Grok):');
  let p = await abre(b, 1366, true), m = await mede(p);
  /* v0.5.3 (Elias, 10/11): sem linha própria; a coluna Valor fica embaixo dos ícones, então o total fica na linha dos ícones, antes deles */
  conf(!m.linha, 'não existe mais a linha própria do total (decisão de 10/11)');
  conf(m.fluxo && m.semIcone && m.mesmaLinhaIcones, 'o total fica na mesma linha dos ícones, logo antes deles, sem encostar');
  conf(m.acimaCab, 'continua acima do cabeçalho');
  await p.screenshot({ path: path.join(RAIZ, 'tools', 'testes', 'telas', 'v0413-1366-largo.png'), clip: { x: 240, y: 230, width: 1126, height: 140 } });
  console.log('1366 px, colunas normais:');
  p = await abre(b, 1366, false); m = await mede(p);
  conf(!m.fluxo && !m.linha && m.direita && m.mesmaLinhaIcones, 'cabe na linha dos ícones: continua como antes');
  console.log('1280 px:');
  p = await abre(b, 1280, false); m = await mede(p);
  conf(!m.linha && m.semIcone && m.mesmaLinhaIcones, 'em 1280 px o total fica na linha dos ícones (sem linha própria)');
  await p.screenshot({ path: path.join(RAIZ, 'tools', 'testes', 'telas', 'v0413-1280.png'), clip: { x: 240, y: 230, width: 1040, height: 140 } });
  console.log('1600 px:');
  p = await abre(b, 1600, true); m = await mede(p);
  conf(!m.fluxo && m.direita, 'em 1600 px continua alinhado');
  console.log('1024 px (coluna fora da tela):');
  p = await abre(b, 1024, false); m = await mede(p);
  conf(m.fluxo && !m.linha, 'quando a coluna nem aparece, o total fica em sequência (não some para fora da tela)');
  console.log('Celular 390 px:');
  p = await abre(b, 390, false);
  conf(await p.evaluate(() => { const t = document.querySelector('.tb-tots'), bar = t.parentElement; return !t.classList.contains('tb-tots-linha') && !bar.style.paddingBottom && getComputedStyle(t).position === 'static'; }), 'no celular nada muda');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})();
