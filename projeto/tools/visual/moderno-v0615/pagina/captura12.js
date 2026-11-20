/* Página v0.6.20 · Bugs e sugestões 2 (itens 23, 25, 29 e 49). HOJE = v0.6.19 publicada, PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura12.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img12'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/bugs-v0620/semente.js')).toString();
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, nome + '.webp'), o); const mm = await sharp(o).metadata(); IMG[nome] = { w: mm.width, h: mm.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, innerWidth - Math.max(0, r.x)), height: Math.min(r.height, innerHeight - Math.max(0, r.y)) }; }, sel);
const gv = async (p, nome) => { await grava(p, nome, await caixa(p, '#gv'), 760); };
const marcar = async p => { await p.waitForSelector('#fed canvas'); await p.evaluate(() => { const W = S.fed.W, H = S.fed.H; S.fed.l.push({ t: 'c', cor: '#E53935', esp: 'media', x1: W * .28, y1: H * .3, x2: W * .72, y2: H * .72 }); fedPronto(); }); await esp(p, 900); };
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    const novo = suf === 'prop';
    /* PC */
    let p = await abre(br, { raiz: RAIZ, arq, w: 1280, h: 980 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 900);
    await ir(p, 'qualidade/bugs', 1200);
    await grava(p, 'i89-tab-' + suf, { x: 240, y: 0, width: 1040, height: 520 }, 1040);
    await p.click('[data-act="bs-novo"]'); await esp(p, 800); await gv(p, 'i90-form-' + suf);
    await p.click('#gv [data-dd="bs:area"] .dd-b'); await esp(p, 500); await gv(p, 'i91-area-' + suf);
    await p.keyboard.press('Escape'); await esp(p, 300); await p.evaluate(() => { if (S.fm) S.fm.sujo = false; }); await p.keyboard.press('Escape'); await esp(p, 600);
    await p.click('tr[data-id="b2"]'); await esp(p, 1100); await gv(p, 'i92-gvpri-' + suf);
    if (novo) {
      const b = await caixa(p, '#gv .bs-com-h'), g = await caixa(p, '#gv'), fim = await caixa(p, '#gv .bs-com');
      await grava(p, 'i93-com-prop', { x: g.x, y: Math.max(0, b.y - 12), width: g.width, height: Math.min(fim.y + fim.height - b.y + 24, 980 - b.y) }, 760);
      await p.click('#gv [data-act="bs-com"]'); await esp(p, 600);
      await p.evaluate(() => { S.fm.txt = 'Consegue mandar um print da tela da remessa?'; gvDesenha(true); }); await esp(p, 300);
      await p.setInputFiles('#gv input[data-bsfoto-in]', { name: 'p.webp', mimeType: 'image/webp', buffer: fs.readFileSync(path.join(OUT, 'i89-tab-hoje.webp')) }).catch(() => {}); await esp(p, 900);
      await gv(p, 'i94-comjan-prop');
      await p.evaluate(() => { if (S.fm) S.fm.sujo = false; }); await p.keyboard.press('Escape'); await esp(p, 800);
      if (!(await p.$('#gv [data-act="bs-foto-ver"]'))) { await p.click('tr[data-id="b2"]'); await esp(p, 900); }
    } else { copia('i92-gvpri-hoje', 'i93-com-hoje'); copia('i92-gvpri-hoje', 'i94-comjan-hoje'); }
    await p.click('#gv [data-act="bs-foto-ver"]'); await esp(p, 700); await grava(p, 'i95-ver-' + suf, { x: 0, y: 0, width: 1280, height: 720 }, 1040);
    if (novo) { await p.click('#fed-v [data-fv="marcar"]'); await marcar(p); await esp(p, 500); await gv(p, 'i96-mk-prop'); }
    else copia('i92-gvpri-hoje', 'i96-mk-hoje');
    console.log(suf, 'pc', 'erros', p._er); await p.context().close();
    /* como Colaborador */
    p = await abre(br, { raiz: RAIZ, arq, w: 1280, h: 860 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 900);
    await p.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', atrib: { qualidade: true } }); await csCarregaUsuario(S.user.id); }); await esp(p, 900);
    await ir(p, 'qualidade/bugs', 1200); await grava(p, 'i97-colab-' + suf, { x: 240, y: 0, width: 1040, height: 520 }, 1040);
    console.log(suf, 'colab', 'erros', p._er); await p.context().close();
    /* celular */
    p = await abre(br, { raiz: RAIZ, arq, w: 390, h: 860, dsf: 2 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 900);
    await ir(p, 'qualidade/bugs', 1200); await p.click('tr[data-id="b2"]'); await esp(p, 1100);
    if (novo) { await p.evaluate(() => { const g = document.querySelector('#gv .gv-c, #gv .gv-corpo, #gv'); const h = document.querySelector('#gv .bs-pri'); if (h) h.scrollIntoView({ block: 'start' }); }); await esp(p, 400); }
    await grava(p, 'i98-cel-' + suf, { x: 0, y: 0, width: 390, height: 860 }, 780);
    console.log(suf, 'cel', 'erros', p._er); await p.context().close();
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img12.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
