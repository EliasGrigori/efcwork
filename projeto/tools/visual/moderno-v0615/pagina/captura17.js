/* Página v0.6.29 · Acesso e senha. HOJE = v0.6.28 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura17.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const OUT = path.join(__dirname, 'out', 'img17'); fs.mkdirSync(OUT, { recursive: true });
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
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 860, semente: false }); await esp(p, 300);
    /* 150 Nova pessoa */
    await ir(p, 'adm/pessoas', 900); await p.evaluate(() => pesNovo()); await esp(p, 500);
    await p.evaluate(() => { const i = document.querySelector('#gv [data-fm="senha"]'); i.value = 'inicio2026'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await esp(p, 200);
    await grava(p, 'i150-gv-' + suf, GV, 640); await p.keyboard.press('Escape'); await esp(p, 300); if (await p.$('#cf')) { await p.click('[data-act="cf-sim"]'); await esp(p, 300); }
    /* 149 Meu perfil */
    await ir(p, 'adm/perfil', 900); await grava(p, 'i149-mp-' + suf, { x: 240, y: 0, width: 1040, height: 700 }, 1040);
    /* 151 Impresso com endereço javascript: */
    await p.evaluate(() => Data.col('efd_docs').set('ipx', { v: 1, tipo: 'link', nome: 'Norma do cliente', codigo: 'NOR-04', link: 'javascript:alert(document.domain)', pasta: 'Geral', status: 'vigente', alteradoEm: nowISO(), alteradoPor: 'Carlos Dias' }));
    await ir(p, 'documentos/impressos', 900); await p.evaluate(() => ipAbre('ipx')); await esp(p, 700); await grava(p, 'i151-gv-' + suf, GV, 640); await p.keyboard.press('Escape'); await esp(p, 300);
    /* 148 pessoa nova entrando */
    await ir(p, 'inicio', 800); await p.evaluate(() => { S.user.nome = 'Marta Rocha'; S.user.precisaCompletar = true; render(); }); await esp(p, 900);
    await grava(p, 'i148-pc-' + suf, null, 1280);
    await p.evaluate(() => { S.user.nome = 'Joana Silva'; S.user.precisaCompletar = false; }); 
    /* 147 Esqueci a senha */
    await p.evaluate(() => Data.auth.signOut()); await esp(p, 800); await p.fill('#en-login', 'joana.silva');
    await grava(p, 'i153-ol-' + suf, await caixa(p), 700);
    await p.click('[data-act="en-esqueci"]'); await esp(p, 500);
    if (novo) { await p.evaluate(() => { const a = JSON.parse(localStorage.getItem('sv2demo_auth')); a['joana.silva'].email = 'joana@exemplo.com'; localStorage.setItem('sv2demo_auth', JSON.stringify(a)); }); await p.click('[data-form="en-recup"] button[type=submit]'); await esp(p, 600); }
    await grava(p, 'i147-pc-' + suf, null, 1280);
    console.log(suf, 'pc erros', p._er); await p.context().close();
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2, semente: false }); await esp(p, 300);
    await p.evaluate(() => { S.user.nome = 'Marta Rocha'; S.user.precisaCompletar = true; render(); }); await esp(p, 900); await grava(p, 'i148-cel-' + suf, null, 780);
    await p.evaluate(() => { S.user.precisaCompletar = false; Data.auth.signOut(); }); await esp(p, 800);
    await p.click('[data-act="en-esqueci"]'); await esp(p, 600); await grava(p, 'i147-cel-' + suf, null, 780);
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img17.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
