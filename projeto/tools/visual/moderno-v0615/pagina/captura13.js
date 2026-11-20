/* Página v0.6.21 · barra de cima e Relatórios › Almoxarifado do mês. HOJE = v0.6.20 publicada, PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura13.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img13'); fs.mkdirSync(OUT, { recursive: true });
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, nome + '.webp'), o); const mm = await sharp(o).metadata(); IMG[nome] = { w: mm.width, h: mm.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const sec = (p, s) => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x - 6, y: r.y + scrollY - 6, width: r.width + 12, height: r.height + 12 }; }, s);
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    const novo = suf === 'prop';
    let p = await abre(br, { raiz: RAIZ, arq, w: 1280, h: 860 }); await esp(p, 600);
    const TOPO = { x: 240, y: 0, width: 1040, height: 330 };
    await ir(p, 'coletas/amostras', 1200); await grava(p, 'i99-cab-' + suf, TOPO, 1040);
    if (novo) { await p.evaluate(() => { document.documentElement.setAttribute('data-fer', '2'); }); await esp(p, 300); await grava(p, 'i101-op2-prop', TOPO, 1040); await p.evaluate(() => document.documentElement.removeAttribute('data-fer')); await esp(p, 200); copia('i99-cab-prop', 'i100-op1-prop'); }
    else { copia('i99-cab-hoje', 'i100-op1-hoje'); copia('i99-cab-hoje', 'i101-op2-hoje'); }
    await ir(p, 'inicio', 1200); await grava(p, 'i99-ini-' + suf, TOPO, 1040);
    await ir(p, 'coletas/amostras', 1000); await p.click('tr[data-id]'); await esp(p, 900); await grava(p, 'i102-gv-' + suf, { x: 640, y: 0, width: 640, height: 420 }, 640); await p.keyboard.press('Escape'); await esp(p, 300);
    await ir(p, novo ? 'relatorios/almox' : 'relatorios/semana', 1500);
    await grava(p, 'i104-aba-' + suf, { x: 240, y: 0, width: 1040, height: 520 }, 1040);
    if (novo) {
      await p.setViewportSize({ width: 1280, height: 2400 }); await esp(p, 500);
      for (const [id, s] of [['i105-lei', '[data-parte="leitura"]'], ['i107-mat', '[data-parte="material"]'], ['i108-lab', '[data-parte="lab"]']]) await grava(p, id + '-prop', await sec(p, '.cs-ct ' + s), 1040);
      { const a = await sec(p, '.cs-ct [data-parte="serie"]'), b = await sec(p, '.cs-ct [data-parte="motivo"]'); await grava(p, 'i106-gr-prop', { x: a.x, y: a.y, width: a.width, height: b.y + b.height - a.y }, 1040); }
      { const a = await sec(p, '.cs-ct [data-parte="atencao"]'), b = await sec(p, '.cs-ct [data-parte="sol"]'); await grava(p, 'i109-at-prop', { x: a.x, y: a.y, width: a.width, height: b.y + b.height - a.y }, 1040); }
      await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 300);
      await p.evaluate(() => { window.print = () => {}; amImprimir(); document.body.classList.add('imprimindo'); }); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 1120, height: 1500 }); await esp(p, 600);
      await grava(p, 'i110-imp-prop', { x: 0, y: 0, width: 1120, height: 1500 }, 1120);
    } else ['i105-lei', 'i106-gr', 'i107-mat', 'i108-lab', 'i109-at', 'i110-imp'].forEach(x => copia('i104-aba-hoje', x + '-hoje'));
    console.log(suf, 'pc erros', p._er); await p.context().close();
    p = await abre(br, { raiz: RAIZ, arq, w: 390, h: 844, dsf: 2 }); await esp(p, 600);
    await ir(p, 'coletas/amostras', 1200); await grava(p, 'i103-cel-' + suf, { x: 0, y: 0, width: 390, height: 420 }, 780);
    await ir(p, novo ? 'relatorios/almox' : 'relatorios/semana', 1300); await grava(p, 'i111-cel-' + suf, { x: 0, y: 0, width: 390, height: 844 }, 780);
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img13.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
