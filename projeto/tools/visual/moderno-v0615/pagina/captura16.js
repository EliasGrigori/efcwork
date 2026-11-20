/* Página v0.6.25 · Relatórios › Apontamentos. HOJE = v0.6.24 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura16.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const SEM = require(path.join(RAIZ, 'tools/visual/relapont-v0625/semente.js'));
const OUT = path.join(__dirname, 'out', 'img16'); fs.mkdirSync(OUT, { recursive: true });
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
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const sec = (p, s) => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: Math.min(innerWidth, r.width + 12), height: r.height + 12 }; }, s);
const PARTES = [['i139-set', 'setor'], ['i140-par', 'pareto'], ['i141-mes', 'meses'], ['i142-rei', 'rein'], ['i143-nc', 'nc'], ['i144-lis', 'lista']];
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch();
  for (const [suf, url] of [['hoje', base + '/antes/'], ['prop', base + '/efcwork/']]) {
    const novo = suf === 'prop', CT = { x: 240, y: 0, width: 1040, height: 560 };
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 860 }); await p.evaluate(SEM); await esp(p, 500);
    await ir(p, novo ? 'relatorios/apontamentos' : 'relatorios/documentos', 1500); await esp(p, 600);
    await grava(p, 'i136-aba-' + suf, CT, 1040);
    if (novo) {
      await p.click('[data-act="rp-filtro"]'); await esp(p, 400);
      await grava(p, 'i137-fil-prop', { x: 240, y: 60, width: 1040, height: 300 }, 1040); await p.keyboard.press('Escape'); await esp(p, 300);
      await p.setViewportSize({ width: 1280, height: 3400 }); await esp(p, 700);
      for (const [id, s] of PARTES) await grava(p, id + '-prop', await sec(p, '.cs-ct [data-parte="' + s + '"]'), 1040);
      { const a = await sec(p, '.cs-ct .rl-res'), b = await sec(p, '.cs-ct [data-parte="leitura"]'); await grava(p, 'i138-res-prop', { x: a.x, y: a.y, width: b.width, height: b.y + b.height - a.y }, 1040); }
      await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 300);
      await p.evaluate(() => document.querySelector('.rp-ap[data-id="a3"]').scrollIntoView({ block: 'center' })); await esp(p, 300);
      await p.click('.rp-ap[data-id="a3"]'); await esp(p, 900); await grava(p, 'i144-gv-prop', { x: 640, y: 0, width: 640, height: 640 }, 640); await p.keyboard.press('Escape'); await esp(p, 400);
      /* a folha impressa: PDF A4 de verdade, páginas 1 e 3 viram imagem */
      await p.evaluate(async () => { window.print = () => {}; await rpImprimir(); }); await esp(p, 300); await p.evaluate(() => document.body.classList.add('imprimindo'));
      const pdf = path.join(OUT, 'folha.pdf'); await p.pdf({ path: pdf, format: 'A4', printBackground: true }); await p.evaluate(() => document.body.classList.remove('imprimindo'));
      require('child_process').execSync('pdftoppm -r 110 -png "' + pdf + '" "' + path.join(OUT, 'folha') + '"');
      for (const [k, n] of [[1, 'i145-imp-prop'], [3, 'i145-im2-prop']]) { const o = await sharp(path.join(OUT, 'folha-' + k + '.png')).webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, n + '.webp'), o); const mm = await sharp(o).metadata(); IMG[n] = { w: mm.width, h: mm.height }; }
    } else { ['i137-fil', 'i138-res', 'i139-set', 'i140-par', 'i141-mes', 'i142-rei', 'i143-nc', 'i144-lis', 'i144-gv', 'i145-imp', 'i145-im2'].forEach(x => copia('i136-aba-hoje', x + '-hoje')); }
    console.log(suf, 'pc erros', p._er); await p.context().close();
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2 }); await p.evaluate(SEM); await esp(p, 400);
    await ir(p, novo ? 'relatorios/apontamentos' : 'relatorios/documentos', 1300); await esp(p, 500); await grava(p, 'i146-cel-' + suf, null, 780);
    if (novo) { await p.evaluate(() => document.querySelector('[data-parte="lista"]').scrollIntoView()); await esp(p, 500); await grava(p, 'i146-cl2-prop', null, 780); } else copia('i146-cel-hoje', 'i146-cl2-hoje');
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img16.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
