/* Página v0.6.19 · Relatórios › Semana. HOJE = v0.6.18 publicada (Relatórios só tem a aba Rateio), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura11.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img11'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/semana-v0619/semente.js')).toString();
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; }, sel);
const ISOLA = () => { S.apont = S.apont.filter(a => /^sa/.test(a.id)); S.cloro = S.cloro.filter(a => /^sc/.test(a.id)); S.coletas = S.coletas.filter(a => /^sk/.test(a.id)); S.aguacol = S.aguacol.filter(a => /^sw/.test(a.id)); S.almMov = S.almMov.filter(a => /^sm/.test(a.id)); S.audit = S.audit.filter(a => /^sx/.test(a.id)); render(); };
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w] of [['pc', 1280], ['cel', 390]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h: 860, dsf: dev === 'cel' ? 2 : 1 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 1200);
      const PC = { x: 240, y: 0, width: 1040, height: 640 }, CEL = { x: 0, y: 0, width: 390, height: 760 };
      if (suf === 'hoje') {
        await ir(p, 'relatorios', 1500); await grava(p, 'i79-' + dev + '-hoje', dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
        if (dev === 'pc') ['i80-fil', 'i81-res', 'i82-ap', 'i83-cl', 'i84-co', 'i85-ativ', 'i86-imp', 'i87-sino', 'i88-cel'].forEach(x => copia('i79-pc-hoje', x + '-hoje'));
        await p.context().close(); continue;
      }
      await ir(p, 'relatorios/semana', 1200); await p.evaluate(ISOLA); await esp(p, 600);
      await grava(p, 'i79-' + dev + '-prop', dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      if (dev === 'pc') {
        await p.setViewportSize({ width: 1280, height: 2400 }); await esp(p, 500);
        await p.click('[data-act="sm-filtro"]'); await esp(p, 600); await grava(p, 'i80-fil-prop', { x: 240, y: 0, width: 1040, height: 400 }, 1040); await p.click('[data-act="sm-filtro"]'); await esp(p, 400);
        await grava(p, 'i81-res-prop', { x: 240, y: 190, width: 1040, height: 150 }, 1040);
        const c = s => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; }, s);
        for (const [id, parte] of [['i82-ap', 'apont'], ['i84-co', 'coletas']]) { const b = await c('.sm-sec[data-parte="' + parte + '"]'); await grava(p, id + '-prop', { x: b.x - 6, y: b.y - 6, width: b.width + 12, height: b.height + 12 }, 1040); }
        const b1 = await c('.sm-sec[data-parte="cloro"]'), b2 = await c('.sm-sec[data-parte="almox"]'); await grava(p, 'i83-cl-prop', { x: b1.x - 6, y: b1.y - 6, width: b1.width + 12, height: b2.y + b2.height - b1.y + 12 }, 1040);
        await p.setViewportSize({ width: 1280, height: 860 }); await p.evaluate(() => { S.sm.ver = 'ativ'; S.sm.aberto = true; render(); }); await esp(p, 700); await grava(p, 'i85-ativ-prop', { x: 240, y: 0, width: 1040, height: 700 }, 1040);
        await p.evaluate(() => { S.sm.ver = 'rel'; S.sm.aberto = false; render(); smAviso(new Date('2026-11-20T14:00:00')); }); await esp(p, 1200); await p.evaluate(() => snAbrir()); await esp(p, 900);
        await grava(p, 'i87-sino-prop', { x: 640, y: 0, width: 640, height: 520 }, 640);
        await p.evaluate(() => { if (typeof gvFecharSo === 'function') gvFecharSo(); S.sm.ver = 'rel'; window.print = () => {}; smImprimir(); }); await esp(p, 400);
        await p.evaluate(() => document.body.classList.add('imprimindo')); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 1120, height: 800 }); await esp(p, 500);
        await grava(p, 'i86-imp-prop', { x: 0, y: 0, width: 1120, height: 800 }, 1120);
      } else {
        await p.evaluate(() => window.scrollTo(0, 360)); await esp(p, 300); await grava(p, 'i88-cel-prop', { x: 0, y: 0, width: 390, height: 860 }, 780);
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img11.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
