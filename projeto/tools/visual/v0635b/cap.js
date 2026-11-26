// capturas da v0.6.35 (tela inteira com abas) para a página de aprovação
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const RAIZ = process.argv[2], VD = '/home/claude/eliasgrigori/efcdocs', OUT = process.argv[3], HOJE = process.argv[4] || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(HOJE || path.join(RAIZ, 'dist'), u.slice(9)) : u.startsWith('/EFCdocs/') ? path.join(VD, u.slice(9)) : '';
  if (f && (f.endsWith('/') || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const esp = (p, ms) => p.waitForTimeout(ms);
async function abre(b, base, w, h) { const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, deviceScaleFactor: 2, serviceWorkers: 'block' }), p = await ctx.newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(base + '/efcwork/?demo=1'); await esp(p, 600);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 900); return p; }
const nome = (p, id, n) => p.evaluate(([id, n]) => { S.jnNome[id] = n; jnDesenha(); }, [id, n]);
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port, b = await chromium.launch();
  let p = await abre(b, base, 1280, 760);
  if (HOJE) { await p.evaluate(() => { location.hash = '#/vertice'; }); await esp(p, 4500); await p.screenshot({ path: OUT + '/hoje-pc.png' }); await b.close(); srv.close(); return; }
  await p.evaluate(() => { location.hash = '#/coletas'; }); await esp(p, 500);
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4500);
  await p.screenshot({ path: OUT + '/pc-1aba.png' });
  await nome(p, 'docs', 'Cadeia de custódia · Lab A.xlsx');
  await p.evaluate(() => jnAbrir('docs', '', true)); await esp(p, 3500); await nome(p, await p.evaluate(() => S.jnAtiva), 'Rótulo do endereço · Lab B.xlsx');
  await p.evaluate(() => jnAbrir('docs', '', true)); await esp(p, 3500);
  await p.screenshot({ path: OUT + '/pc-3abas.png' });
  const nomes = ['Ficha de campo · Solo T01.xlsx', 'POP-12 Calibração do pHmetro.docx', 'Controle de vidraria quebrada.xlsx', 'Plano de rodízio de coletas 2026.xlsx', 'Lista de presença · treinamento NR-31.xlsx', 'Planilha de controle de amostras de água.xlsx'];
  for (const n of nomes) { await p.evaluate(() => jnAbrir('docs', '', true)); await esp(p, 200); await nome(p, await p.evaluate(() => S.jnAtiva), n); }
  await esp(p, 3000); await p.evaluate(() => jnIr(S.jnAbertas[2])); await esp(p, 600);
  await p.screenshot({ path: OUT + '/pc-muitas.png' });
  await p.screenshot({ path: OUT + '/pc-muitas-faixa.png', clip: { x: 0, y: 0, width: 1280, height: 120 } });
  await p.hover('#jn .jn-aw:nth-child(4) .jn-ab'); await esp(p, 300);
  await p.screenshot({ path: OUT + '/pc-hover-faixa.png', clip: { x: 0, y: 0, width: 900, height: 60 } });
  await p.click('#jn .jn-cw .jn-ab'); await p.mouse.move(640, 500); await esp(p, 1200);
  await p.screenshot({ path: OUT + '/pc-cwork-fio.png' });
  await p.mouse.move(40, 3); await esp(p, 900);
  await p.screenshot({ path: OUT + '/pc-cwork-aberta.png', clip: { x: 0, y: 0, width: 1280, height: 160 } });
  await p.evaluate(() => { jnIr(S.jnAbertas[0]); }); await esp(p, 400);
  await p.evaluate(() => csTrocaTema('escuro')); await esp(p, 1500);
  await p.screenshot({ path: OUT + '/pc-escuro.png' });
  await p.context().close();
  p = await abre(b, base, 390, 800);
  await p.click('[data-act="cs-menu"]'); await esp(p, 500); await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4500);
  await p.screenshot({ path: OUT + '/cel-1aba.png' });
  await nome(p, 'docs', 'Cadeia de custódia · Lab A.xlsx');
  for (const n of ['Rótulo · Lab B.xlsx', 'Ficha de campo T01.xlsx']) { await p.evaluate(() => jnAbrir('docs', '', true)); await esp(p, 2500); await nome(p, await p.evaluate(() => S.jnAtiva), n); }
  await esp(p, 1500); await p.screenshot({ path: OUT + '/cel-3abas.png' });
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
