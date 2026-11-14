/* Captura HOJE × PROPOSTA de cada item, no app de verdade (dist-proposta em demonstração). Saída: out/img/*.webp + out/img.json */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = require('path').resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img');
fs.mkdirSync(OUT, { recursive: true });
const IMG = {};
const liga = (p, l) => p.evaluate(x => moLiga(x), l);
const esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) {
  const buf = await p.screenshot(clip ? { clip } : {});
  let s = sharp(buf); const m = await s.metadata();
  if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 86 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data);
  IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) };
}
/* par HOJE × PROPOSTA: roda a mesma receita com a proposta desligada e ligada */
async function par(p, n, id, receita, clip, larg) {
  for (const [suf, l] of [['hoje', []], ['prop', [n]]]) { await liga(p, l); await receita(p); await grava(p, 'i' + n + '-' + id + '-' + suf, typeof clip === 'function' ? await clip(p) : clip, larg); }
  await liga(p, []);
}
/* quadros de um movimento: dispara, congela as animações e avança o relógio delas */
async function quadros(p, n, id, prep, disparo, tempos, clip, larg) {
  for (const [suf, l] of [['hoje', []], ['prop', [n]]]) {
    await liga(p, l); await prep(p); await p.evaluate(() => { window.__moCongela = true; });
    await p.evaluate(async d => { await (new Function('return (async()=>{' + d + '})()'))(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} }); }, disparo);
    for (let k = 0; k < tempos.length; k++) {
      await p.evaluate(t => document.getAnimations().forEach(a => { try { const fim = a.effect.getComputedTiming().endTime; a.currentTime = Math.min(t, fim); } catch (e) {} }), tempos[k]);
      await esp(p, 60); await grava(p, 'i' + n + '-' + id + '-' + suf + '-q' + k, typeof clip === 'function' ? await clip(p) : clip, larg);
    }
    await p.evaluate(() => { window.__moCongela = false; document.querySelectorAll('.mo-fant').forEach(x => x.remove()); document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); }); await esp(p, 250);
  }
  await liga(p, []);
}
const caixa = async (p, sel, m) => { const b = await p.locator(sel).first().boundingBox(); m = m || 0; return { x: Math.max(0, b.x - m), y: Math.max(0, b.y - m), width: b.width + 2 * m, height: b.height + 2 * m }; };
const fecha = async p => { for (let i = 0; i < 3; i++) { if (await p.$('#gv, #bg, #fed-v, .tb-mn')) { await p.keyboard.press('Escape'); await esp(p, 450); } } };

(async () => {
  const br = await chromium.launch();
  /* ---------------- PC ---------------- */
  let p = await abre(br, { raiz: RAIZ, arq: 'dist-proposta/index.html', w: 1280, h: 800, dsf: 1.5 });
  const V = { x: 0, y: 0, width: 1280, height: 800 };
  await par(p, 1, 'pc', async p => { await ir(p, 'inicio', 700); }, V, 1500);
  await par(p, 2, 'pc', async p => { await ir(p, 'inicio', 700); }, V, 1500);
  await par(p, 3, 'pc', async p => { await ir(p, 'almox/materiais', 900); }, { x: 240, y: 0, width: 1040, height: 330 }, 1560);
  await par(p, 4, 'pc', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); await p.keyboard.press('Control+k'); await esp(p, 600); }, V, 1500);
  await par(p, 4, 'pc2', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); await p.keyboard.press('Control+k'); await esp(p, 400); await p.keyboard.type('nov'); await esp(p, 400); }, V, 1500);
  await fecha(p);
  await par(p, 5, 'pc', async p => { await ir(p, 'coletas/amostras', 800); }, { x: 240, y: 56, width: 1040, height: 170 }, 1560);
  await par(p, 5, 'pc2', async p => { await ir(p, 'almox/materiais', 800); }, { x: 240, y: 56, width: 1040, height: 170 }, 1560);
  await par(p, 7, 'pc', async p => { await ir(p, 'almox/materiais', 800); }, { x: 240, y: 205, width: 1040, height: 340 }, 1560);
  await par(p, 7, 'pc2', async p => { await ir(p, 'coletas/amostras', 800); }, { x: 240, y: 205, width: 1040, height: 420 }, 1560);
  await par(p, 8, 'pc', async p => { await p.evaluate(() => { tbEstado('al-mat').busca = 'zzz'; }); await ir(p, 'almox/materiais', 800); }, { x: 240, y: 205, width: 1040, height: 380 }, 1560);
  await p.evaluate(() => { tbEstado('al-mat').busca = ''; });
  await par(p, 8, 'pc2', async p => { await ir(p, 'documentos/documentos', 800); }, { x: 240, y: 300, width: 1040, height: 300 }, 1560);
  await par(p, 9, 'pc', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); await p.click('.tb tbody tr:nth-child(3)'); await esp(p, 800); }, V, 1500);
  await fecha(p);
  await par(p, 10, 'pc', async p => { await ir(p, 'almox/materiais', 700); await p.mouse.move(5, 5); await p.hover('[data-act="tb-xlsx"]'); await esp(p, 900); }, { x: 880, y: 180, width: 400, height: 130 }, 1200);
  await p.mouse.move(5, 5);
  await par(p, 11, 'pc', async p => { await ir(p, 'almox/materiais', 700); await p.mouse.move(5, 5); await esp(p, 300); }, { x: 860, y: 105, width: 420, height: 72 }, 1260);
  await par(p, 11, 'pc2', async p => { await ir(p, 'inspecoes/apontamentos', 700); await p.mouse.move(5, 5); await esp(p, 300); }, { x: 860, y: 105, width: 420, height: 72 }, 1260);
  /* movimento em quadros */
  await quadros(p, 4, 'mov', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); }, `bgAbrir();`, [0, 80, 160, 250], { x: 240, y: 56, width: 800, height: 420 }, 800);
  await fecha(p);
  await quadros(p, 12, 'mov', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); await p.click('.tb-thr >> nth=1'); await esp(p, 600); }, `document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await new Promise(r=>setTimeout(r,120));`, [0, 50, 100, 150], { x: 240, y: 270, width: 560, height: 450 }, 620);
  await fecha(p);
  await quadros(p, 13, 'mov', async p => { await ir(p, 'inspecoes/apontamentos', 700); await p.evaluate(() => { S.apF = 'semana'; render(); }); await esp(p, 300); }, `S.apF = 'todos'; render();`, [0, 120, 240, 520], { x: 240, y: 215, width: 1040, height: 560 }, 900);
  await quadros(p, 14, 'mov', async p => { await fecha(p); await ir(p, 'inspecoes/apontamentos', 700); await p.evaluate(() => { S.apF = 'todos'; render(); }); await esp(p, 300); await p.click('.ap-card[data-id="ap1"]'); await esp(p, 900); }, `document.querySelector('[data-act="ap-foto-ver"]').click();`, [0, 80, 160, 250], V, 760);
  await fecha(p);
  await quadros(p, 15, 'mov', async p => { await fecha(p); await ir(p, 'almox/materiais', 900); }, `location.hash = '#/inspecoes/apontamentos'; await new Promise(r=>setTimeout(r,60));`, [0, 150, 300, 450], { x: 240, y: 56, width: 520, height: 110 }, 780);
  console.log('erros pc', p._er); await p.context().close();

  /* ---------------- celular ---------------- */
  p = await abre(br, { raiz: RAIZ, arq: 'dist-proposta/index.html', w: 390, h: 800, dsf: 2 });
  const C = { x: 0, y: 0, width: 390, height: 800 };
  await par(p, 1, 'cel', async p => { await ir(p, 'inicio', 700); }, C, 560);
  await par(p, 4, 'cel', async p => { await fecha(p); await ir(p, 'inicio', 600); await p.click('[data-act="cs-busca"]'); await esp(p, 600); }, C, 560);
  await fecha(p);
  await par(p, 5, 'cel', async p => { await ir(p, 'coletas/amostras', 800); }, { x: 0, y: 56, width: 390, height: 260 }, 780);
  await par(p, 6, 'cel', async p => { await ir(p, 'inicio', 500); await ir(p, 'coletas/amostras', 800); }, { x: 0, y: 640, width: 390, height: 160 }, 780);
  await par(p, 8, 'cel', async p => { await p.evaluate(() => { tbEstado('al-mat').busca = 'zzz'; }); await ir(p, 'almox/materiais', 800); await p.evaluate(() => { const t = document.querySelector('.tb-w'); if (t) t.scrollIntoView({ block: 'center' }); }); await esp(p, 200); }, C, 560);
  await p.evaluate(() => { tbEstado('al-mat').busca = ''; });
  await par(p, 9, 'cel', async p => { await fecha(p); await ir(p, 'almox/materiais', 700); await p.evaluate(() => document.querySelector('.tb tbody tr:nth-child(3)').click()); await esp(p, 900); }, { x: 0, y: 0, width: 390, height: 420 }, 780);
  await fecha(p);
  await quadros(p, 6, 'mov', async p => { await ir(p, 'inicio', 600); }, `location.hash = '#/documentos'; await new Promise(r=>setTimeout(r,80));`, [0, 80, 160, 250], { x: 0, y: 720, width: 390, height: 80 }, 780);
  console.log('erros cel', p._er);
  await br.close();
  fs.writeFileSync(path.join(__dirname, 'out', 'img.json'), JSON.stringify(IMG, null, 1));
  const tot = Object.values(IMG).reduce((s, x) => s + x.kb, 0); console.log(Object.keys(IMG).length, 'imagens', tot, 'KB');
})().catch(e => { console.error(e); process.exit(1); });
