/* Telas HOJE (Vértice publicado) × PROPOSTA (Vértice novo) do arquivo aberto pelo Cwork, e as medidas da auditoria visual.
   Uso: VERTICE_DIR=<pasta montada> SAIDA=<pasta> NODE_PATH=$(npm root -g) node tools/visual/v0642/telas.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..', '..'), VD = path.resolve(process.env.VERTICE_DIR), S = path.resolve(process.env.SAIDA), AM = path.join(__dirname, 'amostras');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const vf = p => p.frames().filter(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame()).pop();
async function abre(b, base, cel, tema) {
  const ctx = await b.newContext(Object.assign({ viewport: cel ? { width: 390, height: 780 } : { width: 1280, height: 800 }, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', colorScheme: tema }, cel ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {})), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e)));
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  if (tema === 'dark') { await p.evaluate(() => { csTrocaTema('escuro'); for (const k of ['efcdocs:prefs', 'efcdocs-demo:prefs', 'efcdocs:demo:prefs']) localStorage.setItem(k, JSON.stringify({ tema: 'dark' })); }); await esp(p, 400); }
  return p;
}
async function manda(p, arquivo, nome, docId) {
  const b64 = fs.readFileSync(path.join(AM, arquivo)).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: a.nome, docId: a.docId }); jnAbrir('docs', '#/abrir/' + pid, true); }, { b64, nome, docId });
  await esp(p, 6500);
  return vf(p);
}
const medir = fr => fr.evaluate(() => {
  const vis = x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== 'hidden'; };
  const bts = [...document.querySelectorAll('button')].filter(vis);
  return { rolaX: document.documentElement.scrollWidth - innerWidth, botoes: bts.length, alturas: [...new Set(bts.map(x => Math.round(x.getBoundingClientRect().height)))].sort((a, b) => a - b),
    letras: [...new Set([...document.querySelectorAll('body *:not(svg *)')].filter(x => vis(x) && [...x.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(x => getComputedStyle(x).fontSize))],
    fundo: getComputedStyle(document.querySelector('.md') || document.body).backgroundColor, tema: document.body.dataset.theme, botoesMd: [...document.querySelectorAll('.md-barra button')].map(x => Math.round(x.getBoundingClientRect().height)), emoji: /\p{Extended_Pictographic}/u.test(document.body.innerText) };
});
(async () => {
  fs.mkdirSync(S, { recursive: true });
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch(), med = {};
  for (const tema of ['light', 'dark']) for (const cel of [false, true]) {
    const id = (cel ? 'cel' : 'pc') + (tema === 'dark' ? '-escuro' : '');
    const p = await abre(b, base, cel, tema);
    let fr = await manda(p, 'ficha.xlsx', 'Cadeia de custodia.xlsx', 'docficha1');
    await p.screenshot({ path: path.join(S, id + '-ficha.png') }); med[id + '-ficha'] = await medir(fr);
    fr = await manda(p, 'etiquetas.xlsx', 'Etiquetas de amostra.xlsx', 'docetiq1');
    await p.screenshot({ path: path.join(S, id + '-etiquetas.png') });
    if (!cel && tema === 'light') {
      await p.evaluate(async () => { const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'pedido', docId: 'docficha1', copias: 1, dados: {} }); jnAbrir('docs', '#/pedido/' + pid, true); });
      await esp(p, 7000); await p.screenshot({ path: path.join(S, id + '-pedido.png') });
      await p.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); }); await esp(p, 900);
      fr = await manda(p, 'ficha.xlsx', 'Ficha do colaborador.xlsx', 'doccolab1');
      await p.screenshot({ path: path.join(S, id + '-colaborador.png') });
    }
    med[id + '-erros'] = p._er.slice(0, 3);
    await p.context().close();
  }
  fs.writeFileSync(path.join(S, 'medidas.json'), JSON.stringify(med, null, 1));
  console.log(JSON.stringify(med));
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
