/* Captura da parte 3 (ITENS 22 a 24, pedidos do Elias nos comentários da parte 2): HOJE = versão anterior (EFC_ANTES), PROPOSTA = dist de agora. */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), ANTES = process.env.EFC_ANTES, OUT = path.join(__dirname, 'out', 'img3');
const SEM3 = require('./semente-p3.js').toString();
fs.mkdirSync(OUT, { recursive: true });
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 86 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
(async () => {
  if (!ANTES) throw new Error('defina EFC_ANTES');
  const br = await chromium.launch(), V = { x: 0, y: 0, width: 1280, height: 800 };
  for (const [suf, raiz] of [['hoje', ANTES], ['prop', RAIZ]]) {
    const p = await abre(br, { raiz: raiz, w: 1280, h: 800, dsf: 1.5 }); await p.evaluate('(' + SEM3 + ')()'); await esp(p, 500);
    await ir(p, 'coletas/amostras', 900);
    await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w'); if (w && w.style.maxHeight) w.scrollTop = 520; else scrollTo(0, 520); }); await esp(p, 400);
    await grava(p, 'i22-pc-' + suf, V, 1500);
    await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w'); if (w) w.scrollTop = 0; scrollTo(0, 0); }); await esp(p, 300);
    await grava(p, 'i23-pc-' + suf, { x: 240, y: 56, width: 1040, height: 260 }, 1560);
    await ir(p, 'almox/materiais', 900); await grava(p, 'i23-pc2-' + suf, { x: 240, y: 56, width: 1040, height: 260 }, 1560);
    console.log(suf, p._er); await p.context().close();
    const c = await abre(br, { raiz: raiz, w: 390, h: 800, dsf: 2 }); await c.evaluate('(' + SEM3 + ')()'); await esp(c, 400);
    await ir(c, 'coletas/amostras', 900); await c.evaluate(() => { const t = document.querySelector('.tb-bar'); if (t) t.scrollIntoView({ block: 'start' }); scrollBy(0, -70); }); await esp(c, 300);
    await grava(c, 'i23-cel-' + suf, { x: 0, y: 56, width: 390, height: 300 }, 780); await c.context().close();
  }
  await br.close();
  fs.writeFileSync(path.join(__dirname, 'out', 'img3.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
