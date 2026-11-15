/* Página v0.6.17 · Rateios (Campo, Água e Calibração numa tela só + emitir a solicitação de compra), portada do EFClaudian.
   HOJE = v0.6.16 publicada (dist/index-antes.html: a área mostra "Esta área está sendo refeita"), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura9.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img9'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/rateio-v0617/semente.js')).toString();
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const caixa = (p, sel, alt) => p.evaluate(([s, a]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, (a || 860) - r.y) }; }, [sel, alt]);
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w] of [['pc', 1280], ['cel', 390]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h: 860, dsf: dev === 'cel' ? 2 : 1 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 1200);
      const PC = { x: 240, y: 0, width: 1040, height: 640 }, CEL = { x: 0, y: 0, width: 390, height: 760 };
      await ir(p, 'rateios', 1500); await grava(p, 'i61-' + dev + '-' + suf, dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      if (suf === 'hoje') {
        if (dev === 'pc') {
          ['i62-menu', 'i63-fil', 'i65-gav', 'i66-esc', 'i67-cal', 'i68-gav', 'i69-col'].forEach(x => copia('i61-pc-hoje', x + '-hoje'));
          await p.setViewportSize({ width: 1280, height: 1200 }); await ir(p, 'inicio', 1300); await grava(p, 'i64-ini-hoje', await caixa(p, '.mo-at', 1200), 900);
        } else copia('i61-cel-hoje', 'i65-cel-hoje');
      }
      if (suf === 'prop' && dev === 'pc') {
        /* 62: menu da coluna Situação com os filtros prontos */
        await p.click('th[data-tbk="si"] .tb-hm'); await esp(p, 700); await grava(p, 'i62-menu-prop', PC, 1040); await p.keyboard.press('Escape'); await esp(p, 400);
        /* 63: só as pendentes, total filtrado */
        await p.evaluate(() => { tbEstado('rt-lista').filtros.si = 'pend'; render(); }); await esp(p, 900); await grava(p, 'i63-fil-prop', PC, 1040);
        await p.evaluate(() => { tbEstado('rt-lista').filtros = {}; render(); }); await esp(p, 500);
        /* 68: a linha abre a amostra */
        await p.click('tr[data-id="c:rc4"]'); await esp(p, 1400); await grava(p, 'i68-gav-prop', await caixa(p, '#gv'), 900); await p.keyboard.press('Escape'); await esp(p, 600);
        /* 65: gaveta emitir */
        await p.click('[data-act="rt-emitir"]'); await esp(p, 1000); await grava(p, 'i65-gav-prop', await caixa(p, '#gv'), 900);
        /* 66: escolher quais */
        await p.evaluate(() => { S.fm.alvo = 'escolher'; gvDesenha(true); }); await esp(p, 500);
        for (const id of ['c:rc4', 'c:rc5', 'a:ra1']) await p.click('[data-act="rt-ck"][data-id="' + id + '"]');
        await esp(p, 400); await grava(p, 'i66-esc-prop', await caixa(p, '#gv'), 900);
        /* 67: calibração */
        await p.evaluate(() => { S.fm.de = 'cal'; S.fm.alvo = 'todas'; S.fm.sel = {}; gvDesenha(true); }); await esp(p, 600); await grava(p, 'i67-cal-prop', await caixa(p, '#gv'), 900);
        await p.keyboard.press('Escape'); await esp(p, 500); if (await p.$('#gv')) { await p.keyboard.press('Escape'); await esp(p, 400); }
        /* 69: colaborador (sem ★): emite campo e água, sem calibração */
        await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: false, atrib: { rateios: true, coletas: true } }); render(); }); await esp(p, 500);
        await p.click('[data-act="rt-emitir"]'); await esp(p, 900); await grava(p, 'i69-col-prop', await caixa(p, '#gv'), 900);
        await p.keyboard.press('Escape'); await esp(p, 500);
        await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'principal', estrela: true, atrib: null }); }); await esp(p, 200);
        await p.setViewportSize({ width: 1280, height: 1200 }); await ir(p, 'inicio', 1300); await grava(p, 'i64-ini-prop', await caixa(p, '.mo-at', 1200), 900);
      }
      if (suf === 'prop' && dev === 'cel') {
        await p.click('[data-act="rt-emitir"]'); await esp(p, 1100); await grava(p, 'i65-cel-prop', CEL, 780);
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img9.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
