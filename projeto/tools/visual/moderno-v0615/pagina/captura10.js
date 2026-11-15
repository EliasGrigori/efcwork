/* Página v0.6.18 · Relatórios › Rateio (painel de água e de campo). HOJE = v0.6.17 publicada (Relatórios mostra "Esta área está sendo refeita"), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura10.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img10'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/relatorios-v0618/semente.js')).toString();
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; }, sel);
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w] of [['pc', 1280], ['cel', 390]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h: 860, dsf: dev === 'cel' ? 2 : 1 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 1200);
      const PC = { x: 240, y: 0, width: 1040, height: 640 }, CEL = { x: 0, y: 0, width: 390, height: 760 };
      await ir(p, 'relatorios', 1500); await grava(p, 'i70-' + dev + '-' + suf, dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      if (suf === 'hoje' && dev === 'pc') ['i71-fil', 'i72-res', 'i73-a', 'i73-b', 'i74-a', 'i74-b', 'i76-imp', 'i77-teto'].forEach(x => copia('i70-pc-hoje', x + '-hoje'));
      if (suf === 'prop' && dev === 'pc') {
        await p.click('[data-act="rl-filtro"]'); await esp(p, 600); await grava(p, 'i71-fil-prop', { x: 240, y: 0, width: 1040, height: 300 }, 1040); await p.click('[data-act="rl-filtro"]'); await esp(p, 400);
        await grava(p, 'i72-res-prop', { x: 240, y: 0, width: 1040, height: 250 }, 1040);
        await p.setViewportSize({ width: 1280, height: 2200 }); await esp(p, 600);
        const g = await caixa(p, '.rl-grade'); await grava(p, 'i73-a-prop', { x: 240, y: g.y, width: 1040, height: 720 }, 1040); await grava(p, 'i73-b-prop', { x: 240, y: g.y + 720, width: 1040, height: Math.min(900, g.height - 720 + 12) }, 1040);
        await p.evaluate(() => { S.rl.tipo = 'campo'; render(); }); await esp(p, 700);
        const g2 = await caixa(p, '.rl-grade'); await grava(p, 'i74-a-prop', { x: 240, y: g2.y, width: 1040, height: 760 }, 1040); await grava(p, 'i74-b-prop', { x: 240, y: g2.y + 760, width: 1040, height: Math.min(700, g2.height - 760 + 12) }, 1040);
        /* 77: aviso do limite de carga (texto do app, inserido à mão porque os dados de teste são poucos) */
        await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 400);
        await p.evaluate(() => { document.querySelector('.rl-bar').insertAdjacentHTML('afterend', '<p class="rl-teto">Só as 3.000 amostras mais recentes estão carregadas; períodos antigos podem estar incompletos. <button type="button" class="bt lk" data-act="rl-tudo">Carregar tudo</button></p>'); }); await esp(p, 300);
        await grava(p, 'i77-teto-prop', { x: 240, y: 0, width: 1040, height: 330 }, 1040);
        /* 76: folha impressa (mídia de impressão) */
        await p.evaluate(() => { S.rl.tipo = 'agua'; render(); window.print = () => {}; rlImprimir(); }); await esp(p, 400);
        await p.evaluate(() => document.body.classList.add('imprimindo')); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 1000, height: 1400 }); await esp(p, 500);
        await grava(p, 'i76-imp-prop', { x: 0, y: 0, width: 1000, height: 1100 }, 1000);
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img10.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
