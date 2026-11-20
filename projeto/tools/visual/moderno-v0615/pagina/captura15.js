/* Página v0.6.23 · Relatórios › Documentos e a faixa das janelas refeita. HOJE = v0.6.22 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Servidor no mesmo endereço com o Vértice de verdade em /EFCdocs/. Uso: NODE_PATH=$(npm root -g) node captura15.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), VD = process.env.VERTICE_DIR || '/home/claude/eliasgrigori/efcdocs';
const SEM = require(path.join(RAIZ, 'tools/visual/reldocs-v0623/semente.js'));
const OUT = path.join(__dirname, 'out', 'img15'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : u.startsWith('/antes/') ? path.join(RAIZ, 'dist', u.slice(7) === '' ? 'index-antes.html' : u.slice(7)) : u.startsWith('/EFCdocs/') ? path.join(VD, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, nome + '.webp'), o); const mm = await sharp(o).metadata(); IMG[nome] = { w: mm.width, h: mm.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const sec = (p, s) => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: Math.min(innerWidth, r.width + 12), height: r.height + 12 }; }, s);
const vert = p => p.waitForFunction(() => { const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); try { const d = f.contentDocument; return d.readyState === 'complete' && !d.querySelector('#abertura:not(.sai)') && d.body.children.length > 1; } catch (e) { return false; } }, null, { timeout: 20000 }).catch(() => {});
/* quadros: dispara, congela as transições e anda o relógio delas */
async function quadros(p, nome, disparo, tempos, clip, larg) {
  await p.evaluate(async d => { (new Function(d))(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} }); }, disparo);
  for (let k = 0; k < tempos.length; k++) {
    await p.evaluate(t => document.getAnimations().forEach(a => { try { a.currentTime = Math.min(t, a.effect.getComputedTiming().endTime); } catch (e) {} }), tempos[k]);
    await esp(p, 50); await grava(p, nome + '-q' + k, clip, larg);
  }
  await p.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} })); await esp(p, 300);
}
const T = [0, 100, 200, 300, 400, 550];
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch();
  for (const [suf, url] of [['hoje', base + '/antes/'], ['prop', base + '/efcwork/']]) {
    const novo = suf === 'prop', CT = { x: 240, y: 0, width: 1040, height: 520 };
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 860 }); await p.evaluate(SEM); await esp(p, 500);
    /* Relatórios › Documentos (HOJE: a área Relatórios sem a aba; o relatório ficava no EFClaudian) */
    await ir(p, novo ? 'relatorios/documentos' : 'relatorios/almox', 1500);
    await grava(p, 'i123-aba-' + suf, CT, 1040);
    if (novo) {
      await p.click('[data-act="rd-filtro"]'); await esp(p, 400); await p.click('.rd-fp .dd [data-act="dd-abre"]'); await esp(p, 400);
      await grava(p, 'i124-fil-prop', { x: 240, y: 60, width: 1040, height: 360 }, 1040); await p.keyboard.press('Escape'); await esp(p, 200); await p.keyboard.press('Escape'); await esp(p, 300);
      await p.setViewportSize({ width: 1280, height: 2600 }); await esp(p, 500);
      for (const [id, s] of [['i126-resp', '[data-parte="resp"]'], ['i127-sem', '[data-parte="semanas"]'], ['i128-cx', '[data-parte="caixas"]'], ['i129-lis', '[data-parte="lista"]']]) await grava(p, id + '-prop', await sec(p, '.cs-ct ' + s), 1040);
      { const a = await sec(p, '.cs-ct .rl-res'), b = await sec(p, '.cs-ct [data-parte="leitura"]'); await grava(p, 'i125-res-prop', { x: a.x, y: a.y, width: b.width, height: b.y + b.height - a.y }, 1040); }
      await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 300);
      await p.click('.rd-t tbody tr'); await esp(p, 900); await grava(p, 'i129-gv-prop', { x: 640, y: 0, width: 640, height: 600 }, 640); await p.keyboard.press('Escape'); await esp(p, 400);
      await p.evaluate(() => { window.print = () => {}; rdImprimir(); document.body.classList.add('imprimindo'); }); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 1120, height: 1500 }); await esp(p, 500);
      await grava(p, 'i130-imp-prop', { x: 0, y: 0, width: 1120, height: 1500 }, 1120); await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => document.body.classList.remove('imprimindo')); await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 300);
    } else { ['i124-fil', 'i125-res', 'i126-resp', 'i127-sem', 'i128-cx', 'i129-lis', 'i129-gv', 'i130-imp'].forEach(x => copia('i123-aba-hoje', x + '-hoje')); }
    /* a faixa das janelas */
    await ir(p, 'documentos/impressos', 900); await p.evaluate(() => jnAbrir('docs')); await vert(p); await esp(p, 1500); await p.mouse.move(640, 500); await esp(p, 1200);
    const TOPO = { x: 0, y: 0, width: 1280, height: 120 };
    await grava(p, 'i132-fio-' + suf, TOPO, 1280);
    await quadros(p, 'i133-abre-' + suf, 'jnMostra(true)', T, TOPO, 1280);
    await grava(p, 'i134-rel-' + suf, { x: 0, y: 0, width: 640, height: 70 }, 640);
    await quadros(p, 'i135-troca-' + suf, 'jnIr("efcwork")', [0, 60, 120, 180, 250], TOPO, 1280);
    await p.mouse.move(640, 500); await esp(p, 1200);
    console.log(suf, 'pc erros', p._er); await p.context().close();
    /* celular */
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2 }); await p.evaluate(SEM); await esp(p, 400);
    await ir(p, novo ? 'relatorios/documentos' : 'relatorios/almox', 1300); await grava(p, 'i131-cel-' + suf, null, 780);
    await p.evaluate(() => jnAbrir('docs')); await vert(p); await esp(p, 1800); await p.evaluate(() => jnMostra(true)); await esp(p, 900);
    await grava(p, 'i132-cel-' + suf, { x: 0, y: 0, width: 390, height: 160 }, 780);
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img15.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
