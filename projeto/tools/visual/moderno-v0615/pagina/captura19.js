/* Página v0.6.31 · Administração e foto. HOJE = v0.6.28 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura19.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const OUT = path.join(__dirname, 'out', 'img19'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : u.startsWith('/antes/') ? path.join(RAIZ, 'dist', u.slice(7) === '' ? 'index-antes.html' : u.slice(7)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, nome + '.webp'), o); const mm = await sharp(o).metadata(); IMG[nome] = { w: mm.width, h: mm.height }; }
const caixa = p => p.evaluate(() => { const e = document.querySelector('.en-caixa'); const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: Math.min(innerWidth - Math.max(0, r.x - 10), r.width + 20), height: Math.min(innerHeight - Math.max(0, r.y - 10), r.height + 20) }; });
const GV = { x: 640, y: 0, width: 640, height: 860 };
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch();
  const FOTO = () => { const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#8a6d3b'; g.fillRect(0, 0, 160, 160); g.fillStyle = '#f1dcae'; g.beginPath(); g.arc(80, 64, 32, 0, 7); g.fill(); g.beginPath(); g.arc(80, 160, 58, 0, 7); g.fill(); return c.toDataURL('image/jpeg', .9); };
  for (const [suf, url] of [['hoje', base + '/antes/'], ['prop', base + '/efcwork/']]) {
    const novo = suf === 'prop';
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 860, semente: true }); await esp(p, 300);
    await ir(p, 'inicio', 800); await grava(p, 'i157-menu-' + suf, { x: 0, y: 0, width: 240, height: 860 }, 240);
    await ir(p, 'adm/empresa', 900); await grava(p, 'i158-emp-' + suf, null, 1280);
    await grava(p, 'i159-abas-' + suf, { x: 240, y: 0, width: 1040, height: 150 }, 1040);
    if (novo) await p.evaluate(f => { S._ftFoto = { uid: S.user.id, img: f }; render(); }, await p.evaluate('(' + FOTO + ')()'));
    await ir(p, 'adm/perfil', 900); await grava(p, 'i160-mp-' + suf, null, 1280);
    await grava(p, 'i161-pe-' + suf, { x: 0, y: 740, width: 240, height: 120 }, 240);
    console.log(suf, 'pc erros', p._er); await p.context().close();
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2, semente: true, tema: 'escuro' }); await esp(p, 300);
    await ir(p, 'inicio', 800); await p.click('nav [data-act="cs-menu"]'); await esp(p, 1200); await grava(p, 'i157-cel-' + suf, null, 780);
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img19.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
