/* EFCwork v0.6.51 · fotos HOJE (o app publicado v0.6.50 + Vértice v0.6.84) para a página de aprovação. Dados fictícios.
   Uso: EFC_DIST=<app v0.6.50> VERTICE_DIR=<vertice publicado> NODE_PATH=$(npm root -g) node tools/visual/v0651/hoje.js <pasta> */
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), http = require('http');
const DIST = path.resolve(process.env.EFC_DIST), VD = path.resolve(process.env.VERTICE_DIR), OUT = path.resolve(process.argv[2] || 'fotos'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html'); if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const esp = (p, ms) => p.waitForTimeout(ms || 400);
const conteudo = { v: 1, setas: {}, seq: 2, colunas: [{ id: 'c1', nome: 'A fazer' }, { id: 'c2', nome: 'Fazendo' }, { id: 'c3', nome: 'Feito' }],
  itens: { pi1: { id: 'pi1', tipo: 'postit', x: 40, y: 40, w: 180, h: 140, z: 1, texto: 'Trocar o filtro da caixa (exemplo)', cor: 'amarelo', cod: 'Q-001', col: 'c1', ko: 1, resp: 'Carlos Lima' },
    pi2: { id: 'pi2', tipo: 'postit', x: 260, y: 40, w: 180, h: 140, z: 2, texto: 'Revisar a escala (exemplo)', cor: 'azul', cod: 'Q-002', col: 'c2', ko: 1 } } };
const ficha = { id: 'kbteste1', nome: 'Quadro de teste (exemplo)', tipo: 'postits', status: 'rascunho', pastaNome: 'Fluxogramas', codigo: 'KB-TESTE', criadoEm: '2026-11-28T10:00:00.000Z', alteradoEm: '2026-11-28T10:05:00.000Z', gravacao: 1 };
async function entra(b, base, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage(); await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  await p.evaluate(async () => { const C = Data.col.bind(Data); await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_users').set('u_lider', { nome: 'Carlos Lima', login: 'carlos.lima', perfil: 'secundario', estrela: true, status: 'ativo', atrib: { apont: true, qualidade: true } });
    await C('sv2_users').set('u_col', { nome: 'Rita Alves', login: 'rita.alves', perfil: 'secundario', status: 'ativo', atrib: { apont: true } });
    await C('sv2_apont').set('ap1', { categoria: AP_CATS[0][0], setor: 'Packing (exemplo)', data: hojeISO(), hora: '08:00', porId: 'u_col', porNome: 'Rita Alves', status: 'aberto', criadoEm: nowISO(), fotos: [] }); });
  await esp(p, 400); return p;
}
(async () => { await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port, b = await chromium.launch();
  let p = await entra(b, base, 1280, 860);
  await p.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(p, 700); await p.evaluate(() => apAbre('ap1')); await esp(p, 600);
  await p.screenshot({ path: path.join(OUT, 'h1-apont-pc.png') }); await p.keyboard.press('Escape'); await esp(p);
  await p.evaluate(() => { location.hash = '#/qualidade'; }); await esp(p, 800); await p.screenshot({ path: path.join(OUT, 'h3-qualidade-pc.png') });
  /* Vértice: comentar no Kanban; o Cwork não fica sabendo (sino vazio) */
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4000);
  let fr = p.frames().find(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
  await fr.evaluate(r => new Promise(ok => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readwrite'); t.objectStore('arquivos').put(r); t.oncomplete = () => ok(1); }; }), { id: ficha.id, marca: 'm1', ficha: ficha, pacote: { fmt: 'json', dados: JSON.stringify(conteudo), bytesOriginal: 10, bytesFinal: 10 } });
  await fr.evaluate(() => { localStorage.setItem('efcdocs:prefs', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('efcdocs:prefs') || '{}'), { 'vista:kbteste1': 'kanban' }))); });
  await p.evaluate(() => { const f = document.querySelector('.jn-fr iframe'); f.contentWindow.location.hash = '#/postits'; f.contentWindow.location.reload(); }); await esp(p, 5000);
  fr = p.frames().find(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
  const ab = await fr.$('.tb-arq tr.arq .abre'); if (ab) { await ab.click(); await esp(p, 1500); }
  if (!(await fr.$('.kb-col'))) { const v = await fr.$('.qd-vistas button:has-text("Kanban")'); if (v) { await v.click(); await esp(p, 800); } }
  await fr.click('[data-kb-comentar="pi1"]', { force: true }); await esp(p, 500);
  await fr.fill('[data-kb-gaveta="pi1"] textarea', 'Quem compra o filtro?'); await fr.click('[data-kb-gaveta="pi1"] button[type=submit]'); await esp(p, 1200);
  await p.screenshot({ path: path.join(OUT, 'h5-kanban-pc.png') });
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem('sv2demo_sv2_notifs') || '[]').map(x => x.titulo));
  console.log('HOJE: avisos depois do comentário no Kanban = ' + JSON.stringify(n));
  await p.click('.jn-ab[data-act="jn-ir"] >> nth=0'); await esp(p, 500); await p.evaluate(() => snAbrir()); await esp(p, 900); await p.screenshot({ path: path.join(OUT, 'h6-sino-pc.png') });
  const c = await entra(b, base, 390, 844);
  await c.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(c, 700); await c.evaluate(() => apAbre('ap1')); await esp(c, 600); await c.screenshot({ path: path.join(OUT, 'h4-apont-cel.png') });
  await b.close(); srv.close(); })().catch(e => { console.error(e); process.exit(1); });
