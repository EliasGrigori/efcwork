/* auditoria visual da v0.6.15 final: 1280 e 390, Claro e Escuro, telas tocadas */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'aud');
const TELAS = ['inicio', 'coletas/amostras', 'almox/materiais', 'almox/movimentacoes', 'inspecoes/apontamentos', 'almox/equipamentos'];
(async () => {
  const br = await chromium.launch(), med = [];
  for (const [w, h] of [[1280, 800], [390, 800]]) for (const tema of ['claro', 'escuro']) {
    const p = await abre(br, { raiz: RAIZ, w, h, tema, dsf: 1 });
    const fotos = [];
    for (const r of TELAS) { await ir(p, r, 900);
      const m = await p.evaluate(() => { const bts = [...document.querySelectorAll('.cs-ct .bt, .cs-ct button')].filter(b => b.offsetParent).map(b => Math.round(b.getBoundingClientRect().height)); const fs = new Set([...document.querySelectorAll('.cs-ct *')].filter(e => e.offsetParent && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => getComputedStyle(e).fontSize));
        return { lado: document.documentElement.scrollWidth > innerWidth + 1, btMin: Math.min.apply(null, bts.length ? bts : [0]), letras: fs.size, fixa: document.documentElement.classList.contains('pag-fixa') }; });
      med.push([w, tema, r, m]); const f = path.join(OUT, w + '-' + tema + '-' + r.replace('/', '_') + '.png'); await p.screenshot({ path: f }); fotos.push(f); }
    await ir(p, 'almox/materiais', 900); await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(2800);
    const f = path.join(OUT, w + '-' + tema + '-gaveta.png'); await p.screenshot({ path: f }); fotos.push(f);
    const fw = w === 1280 ? 640 : 260, fh = w === 1280 ? 400 : 533, cols = w === 1280 ? 4 : 7;
    const comp = await Promise.all(fotos.map(async (x, i) => ({ input: await sharp(x).resize(fw, fh).toBuffer(), left: (i % cols) * fw, top: Math.floor(i / cols) * fh })));
    await sharp({ create: { width: fw * cols, height: fh * Math.ceil(fotos.length / cols), channels: 3, background: '#888' } }).composite(comp).png().toFile(path.join(OUT, 'mosaico-' + w + '-' + tema + '.png'));
    console.log(w, tema, 'erros:', p._er); await p.context().close();
  }
  med.forEach(x => console.log(x[0], x[1], x[2], JSON.stringify(x[3])));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
