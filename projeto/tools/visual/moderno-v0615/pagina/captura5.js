/* Página do celular (Tarefa 2, 14/11): HOJE = v0.6.15 como publicada (dist/index-antes.html), PROPOSTA = dist de agora. */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img5'); fs.mkdirSync(OUT, { recursive: true });
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
const CL = h => ({ x: 0, y: 56, width: 390, height: h });
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    const p = await abre(br, { raiz: RAIZ, arq: arq, w: 390, h: 800, dsf: 2 });
    await ir(p, 'almox/materiais', 900); await grava(p, 'i39-cel-' + suf, CL(300), 780);
    await ir(p, 'coletas/agua', 900); await grava(p, 'i39-cel2-' + suf, CL(250), 780);
    await p.evaluate(() => csTrocaTema('escuro')); await esp(p, 300);
    await ir(p, 'almox/materiais', 900); await grava(p, 'i39-cel3-' + suf, CL(300), 780);
    await p.evaluate(() => csTrocaTema('claro')); await esp(p, 300);
    await ir(p, 'inspecoes/apontamentos', 900); await grava(p, 'i40-cel-' + suf, CL(250), 780);
    await ir(p, 'coletas/envio', 900); await grava(p, 'i40-cel2-' + suf, CL(250), 780);
    await ir(p, 'almox/equipamentos', 900); await grava(p, 'i40-cel3-' + suf, CL(300), 780);
    console.log(suf, p._er); await p.context().close();
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img5.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
