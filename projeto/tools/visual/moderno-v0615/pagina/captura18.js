/* Página v0.6.30 · Backup. HOJE = v0.6.28 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura18.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const OUT = path.join(__dirname, 'out', 'img18'); fs.mkdirSync(OUT, { recursive: true });
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
  for (const [suf, url] of [['hoje', base + '/antes/'], ['prop', base + '/efcwork/']]) {
    const novo = suf === 'prop';
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 860, semente: true }); await esp(p, 300);
    /* 153 aba Backup (HOJE não existe: o endereço cai em Empresa) */
    await ir(p, 'adm/backup', 900); if (novo) await p.evaluate(() => { S._bkPasta = ''; S._bkMsg = null; Store.del('cw-bk-ultimo'); render(); }); await esp(p, 300);
    await grava(p, 'i153-pc-' + suf, null, 1280);
    /* 154 pasta fixa escolhida e backup salvo */
    if (novo) await p.evaluate(() => { S._bkPasta = 'Backups EFCwork'; Store.set('cw-bk-ultimo', JSON.stringify({ em: new Date().toISOString(), nome: 'efcwork-backup-2026-11-20-1830.json', docs: 1234, tam: 845000, onde: 'na pasta "Backups EFCwork"' })); S._bkMsg = ['Pronto: efcwork-backup-2026-11-20-1830.json (1234 registros, 825 KB) salvo na pasta "Backups EFCwork".', true]; render(); });
    await esp(p, 300); await grava(p, 'i154-pasta-' + suf, null, 1280);
    console.log(suf, 'pc erros', p._er); await p.context().close();
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2, semente: true }); await esp(p, 300);
    /* 155 celular: o navegador não deixa guardar pasta; vai para Downloads */
    await ir(p, 'adm/backup', 900); if (novo) await p.evaluate(() => { delete window.showDirectoryPicker; Store.set('cw-bk-ultimo', JSON.stringify({ em: new Date().toISOString(), nome: 'efcwork-backup-2026-11-20-1830.json', docs: 1234, tam: 845000, onde: 'em Downloads' })); S._bkMsg = ['Pronto: efcwork-backup-2026-11-20-1830.json (1234 registros, 825 KB) salvo em Downloads.', true]; render(); }); await esp(p, 400);
    await grava(p, 'i155-cel-' + suf, null, 780);
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img18.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
