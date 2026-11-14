/* Captura da parte 2 (ITENS 16 a 21): HOJE × PROPOSTA no app de verdade. 16–18 ligam as propostas (mo16–mo18) no dist-proposta;
   19–21 já estão no app: HOJE = versão anterior (EFC_ANTES, a dist do pacote de antes), PROPOSTA = dist de agora.
   Uso: EFC_ANTES=/caminho/da/efcwork-anterior node captura2.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), ANTES = process.env.EFC_ANTES, OUT = path.join(__dirname, 'out', 'img2');
const SEM2 = require('./semente-p2.js').toString();
fs.mkdirSync(OUT, { recursive: true });
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) {
  const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata();
  if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 86 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) };
}
const liga = (p, l) => p.evaluate(x => { if (typeof moLiga === 'function') moLiga(x); }, l);
async function abre2(br, o) { const p = await abre(br, o); await p.evaluate('(' + SEM2 + ')()'); await esp(p, 500); return p; }
const fecha = async p => { for (let i = 0; i < 4; i++) { if (await p.$('#gv, #bg, #fed-v, .tb-mn')) { await p.keyboard.press('Escape'); await esp(p, 450); } } };
async function quadros(p, n, id, suf, prep, disparo, tempos, clip, larg) {
  await prep(p); await p.evaluate(() => { window.__moCongela = true; });
  await p.evaluate(async d => { await (new Function('return (async()=>{' + d + '})()'))(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} }); }, disparo);
  for (let k = 0; k < tempos.length; k++) {
    await p.evaluate(t => document.getAnimations().forEach(a => { try { const fim = a.effect.getComputedTiming().endTime; a.currentTime = Math.min(t, fim === Infinity ? t : fim); } catch (e) {} }), tempos[k]);
    await esp(p, 60); await grava(p, 'i' + n + '-' + id + '-' + suf + '-q' + k, typeof clip === 'function' ? await clip(p) : clip, larg);
  }
  await p.evaluate(() => { window.__moCongela = false; document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); }); await esp(p, 300);
}
const caixa = async (p, sel, m, minH) => { const b = await p.locator(sel).first().boundingBox(); m = m || 0; return { x: Math.max(0, b.x - m), y: Math.max(0, b.y - m), width: b.width + 2 * m, height: Math.max(minH || 0, b.height + 2 * m) }; };

(async () => {
  if (!ANTES) throw new Error('defina EFC_ANTES');
  const br = await chromium.launch(), V = { x: 0, y: 0, width: 1280, height: 800 };
  /* ---------- 16–18: propostas no dist-proposta ---------- */
  let p = await abre2(br, { raiz: RAIZ, arq: 'dist-proposta/index.html', w: 1280, h: 800, dsf: 1.5 });
  for (const [suf, l] of [['hoje', []], ['prop', [16]]]) { await liga(p, l); await ir(p, 'coletas/amostras', 700); await p.evaluate(() => moSimulaCarga(60000, 'coletas')); await esp(p, 400); await grava(p, 'i16-pc-' + suf, { x: 240, y: 56, width: 1040, height: 560 }, 1560); await p.evaluate(() => { S._moPend = 0; }); }
  await liga(p, []); await ir(p, 'inicio', 300); await p.reload(); await esp(p, 900); await p.evaluate('(' + SEM2 + ')()').catch(() => {}); await esp(p, 400);
  /* gota: abre o detalhe de uma amostra enviada */
  for (const [suf, l] of [['hoje', []], ['prop', [17]]]) {
    await liga(p, l);
    await quadros(p, 17, 'mov', suf, async p => { await fecha(p); await ir(p, 'coletas/amostras', 700); await p.evaluate(() => { try { Object.keys(localStorage).filter(k => /cbvisto/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {} S._cbNivel = {}; }); },
      `document.querySelector('.tb tbody tr[data-act="tb-lin"]').click(); await new Promise(r=>setTimeout(r,700));`, [0, 500, 1500, 2600],
      async p => { const b = await caixa(p, '#gv .cb-tlw', 10, 120); return { x: b.x, y: b.y, width: Math.min(420, b.width), height: Math.min(300, b.height) }; }, 640);
    await fecha(p);
  }
  for (const [suf, l] of [['hoje', []], ['prop', [18]]]) {
    await liga(p, l);
    await quadros(p, 18, 'mov', suf, async p => { await fecha(p); await ir(p, 'inicio', 500); }, `document.querySelector('[data-act="cs-sino"]').click(); await new Promise(r=>setTimeout(r,30));`, [0, 250, 450, 900], { x: 860, y: 56, width: 420, height: 744 }, 520);
    await fecha(p);
  }
  console.log('erros propostas', p._er); await p.context().close();
  /* ---------- 19–21: antes × agora ---------- */
  for (const [suf, raiz] of [['hoje', ANTES], ['prop', RAIZ]]) {
    p = await abre2(br, { raiz: raiz, arq: 'dist/index.html', w: 1280, h: 800, dsf: 1.5 });
    await ir(p, 'coletas/programacao', 800);
    await grava(p, 'i19-pc-' + suf, await caixa(p, '.pg-pl', 12), 900);
    await ir(p, 'coletas/plano/rz1', 800); await p.click('[data-act="pp-aba"][data-v="aj"]'); await esp(p, 500);
    await p.evaluate(() => { const x = [...document.querySelectorAll('.pp-aj > *')].pop(); if (x) x.scrollIntoView({ block: 'center' }); }); await esp(p, 300);
    await grava(p, 'i19-pc2-' + suf, await caixa(p, '.pp-aj > :last-child', 8), 1000);
    await p.evaluate(() => bgAbrir()); await esp(p, 300); await p.fill('#bg-q', 'desemcapado'); await esp(p, 400);
    await grava(p, 'i20-pc-' + suf, await caixa(p, '.bg-caixa', 10), 960);
    await p.fill('#bg-q', 'jd08'); await esp(p, 400); await grava(p, 'i20-pc2-' + suf, await caixa(p, '.bg-caixa', 10), 960); await fecha(p);
    await ir(p, 'inspecoes/apontamentos', 700); await p.click('[data-act="ap-pareto"]'); await esp(p, 800);
    await grava(p, 'i21-pc-' + suf, await caixa(p, '#gv', 0), 680);
    console.log('erros', suf, p._er); await p.context().close();
  }
  await br.close();
  fs.writeFileSync(path.join(__dirname, 'out', 'img2.json'), JSON.stringify(IMG, null, 1));
  console.log(Object.keys(IMG).length, 'imagens', Object.values(IMG).reduce((s, x) => s + x.kb, 0), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
