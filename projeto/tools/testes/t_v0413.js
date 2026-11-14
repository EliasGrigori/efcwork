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
/* v0.6.15 (Elias, 14/11, ITEM 23 refeito): o total saiu da barra da tabela e virou o selo do cabeçalho, em todas as larguras */
const mede = p => p.evaluate(() => { const m = document.querySelector('.cs-meta .tb-tp'); return { selo: !!m && /R\$/.test(m.textContent), inteiro: !!m && m.scrollWidth <= m.clientWidth + 1, velho: !!document.querySelector('.tb-tots'), lado: document.documentElement.scrollWidth > innerWidth + 1 }; });
(async () => {
  const b = await chromium.launch();
  for (const [w, lg] of [[1024, false], [1280, false], [1366, true], [1600, true], [390, false]]) {
    const p = await abre(b, w, lg), m = await mede(p);
    conf(m.selo && m.inteiro && !m.velho && !m.lado, w + ' px' + (lg ? ' (colunas largas)' : '') + ': total inteiro no selo do cabeçalho, sem a caixa antiga e sem rolar de lado');
    if (w === 1280) await p.screenshot({ path: path.join(RAIZ, 'tools', 'testes', 'telas', 'v0413-1280.png'), clip: { x: 240, y: 60, width: 1040, height: 200 } });
  }
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})();
