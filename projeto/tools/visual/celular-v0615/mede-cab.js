/* mede a 390 px quais cabeçalhos têm o ícone de ação sozinho numa linha. NODE_PATH=$(npm root -g) node mede-cab.js [dist] */
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..', '..'), DIST = process.argv[2] || path.join(RAIZ, 'dist', 'index.html'), URL = 'file://' + DIST + '?demo=1';
const t48 = fs.readFileSync(path.join(RAIZ, 'tools/testes/t_v048.js'), 'utf8'), ia = t48.indexOf('await p.evaluate(async () => {') + 'await p.evaluate('.length, SEM_AL = t48.slice(ia, t48.indexOf('});\n  await p.waitForTimeout(300);', ia) + 1);
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true, timezoneId: 'America/Fortaleza' })).newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(URL); await p.waitForTimeout(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(eval(SEM_AL)); await p.waitForTimeout(300);
  await p.evaluate(async () => { const C = Data.col.bind(Data), h = hojeISO(); await C('sv2_cfg').set('coletas', { labs: ['IBRA'] });
    for (let i = 0; i < 20; i++) await C('sv2_coletas').set('c' + i, { tipo: i % 2 ? 'SOLO' : 'FOLHA', data: addDias(h, -i), talhao: 'RU' + (10 + i % 9) + 'TAI24', analiseNome: 'Análise ' + i, lab: 'IBRA', valor: 100, situacao: 'ativa', coletor: 'Equipe A', criadoEm: nowISO() }); });
  const rotas = (await p.evaluate(() => (S && typeof CS_AREAS !== 'undefined' ? CS_AREAS : []).flatMap(a => (a.abas || []).map(t => '/' + a.id + '/' + t.id)))) || [];
  const ls = rotas.length ? rotas : ['/inicio', '/coletas/envio', '/coletas/coletas', '/almox/materiais', '/almox/equipamentos', '/almox/painel', '/documentos/impressos', '/agua/coletas'];
  const out = [];
  for (const r of ls) { await p.evaluate(x => { location.hash = '#' + x; }, r); await p.waitForTimeout(500);
    const m = await p.evaluate(() => { const a = document.querySelector('.cs-acts'); if (!a) return null; const f = [...a.children].filter(e => e.offsetParent !== null); if (!f.length) return null;
      const lin = new Set(f.map(e => Math.round(e.getBoundingClientRect().top))); const ult = f[f.length - 1].getBoundingClientRect(), tit = document.querySelector('.cs-pht').getBoundingClientRect();
      return { n: f.length, linhas: lin.size, tops: [...lin], ultimoLargura: Math.round(ult.width), ultimoTexto: (f[f.length - 1].getAttribute('aria-label') || f[f.length - 1].textContent || '').trim().slice(0, 28), acts: Math.round(a.getBoundingClientRect().height), titH: Math.round(tit.height), sobra: document.documentElement.scrollWidth > innerWidth }; });
    if (m) out.push(Object.assign({ rota: r }, m)); }
  console.log(JSON.stringify(out, null, 1).replace(/\n\s+/g, ' ').replace(/\},/g, '},\n'));
  await b.close();
})();
