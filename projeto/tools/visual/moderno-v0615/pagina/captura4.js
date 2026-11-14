/* Captura da página FINAL da v0.6.15 (pedidos de 14/11 13:54): HOJE = pacote de hoje cedo (EFC_ANTES), PROPOSTA = dist de agora. */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), ANTES = process.env.EFC_ANTES, OUT = path.join(__dirname, 'out', 'img4');
const SEM4 = require('./semente-p4.js').toString();
fs.mkdirSync(OUT, { recursive: true });
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 86 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
const V = { x: 0, y: 0, width: 1280, height: 800 }, CAB = { x: 240, y: 56, width: 1040, height: 250 }, GV = { x: 860, y: 56, width: 420, height: 600 }, GVC = { x: 860, y: 56, width: 420, height: 120 };
(async () => {
  if (!ANTES) throw new Error('defina EFC_ANTES');
  const br = await chromium.launch();
  for (const [suf, raiz] of [['hoje', ANTES], ['prop', RAIZ]]) {
    const p = await abre(br, { raiz: raiz, w: 1280, h: 800, dsf: 1.5 }); await p.evaluate('(' + SEM4 + ')()'); await esp(p, 600);
    /* 25 · busca */
    await ir(p, 'almox/materiais', 900); await p.evaluate(() => bgAbrir()); await esp(p, 600); await p.type('#bg-q', 'luva', { delay: 60 }); await esp(p, 700);
    await grava(p, 'i25-pc-' + suf, { x: 240, y: 0, width: 1040, height: 520 }, 1560); await p.keyboard.press('Escape'); await esp(p, 400);
    /* 27 · tela inteira de Materiais (sem "Mostrando" e sem rodapé) */
    await grava(p, 'i27-pc-' + suf, V, 1500);
    /* 29 · total no selo */
    await grava(p, 'i29-pc-' + suf, CAB, 1560);
    /* 30 · total filtrado */
    await p.click('.tb-t th[data-tbk="loc"] .tb-hm'); await esp(p, 300); await p.click('.tb-mn-li:has-text("Porta 02") input'); await esp(p, 300); await p.keyboard.press('Escape'); await esp(p, 400);
    await grava(p, 'i30-pc-' + suf, CAB, 1560);
    await p.click('[data-act="tb-limpa"]').catch(() => {}); await esp(p, 300);
    /* 33, 35 · gaveta do material */
    await p.click('.tb-t tbody tr:has-text("Luva")'); await esp(p, 3200);
    await grava(p, 'i33-pc-' + suf, GV, 630); await grava(p, 'i35-pc-' + suf, GVC, 630);
    /* 38 · gaveta aberta: abas inteiras */
    await grava(p, 'i38-pc-' + suf, { x: 240, y: 56, width: 620, height: 330 }, 930);
    await p.keyboard.press('Escape'); await esp(p, 500);
    /* 26 · rolagem */
    await ir(p, 'coletas/amostras', 900);
    await grava(p, 'i31-pc-' + suf, CAB, 1560);
    await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w'); if (w && (w.style.height || w.style.maxHeight)) w.scrollTop = 900; else scrollTo(0, 900); }); await esp(p, 500);
    await grava(p, 'i26-pc-' + suf, V, 1500);
    /* 28 · fim da lista */
    await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w'); if (w && (w.style.height || w.style.maxHeight)) w.scrollTop = 100 * 36 - 300; else scrollTo(0, document.documentElement.scrollHeight); }); await esp(p, 900);
    await grava(p, 'i28-pc-' + suf, V, 1500);
    /* 32 · cabeçalhos com a mesma medida */
    await ir(p, 'almox/movimentacoes', 900); await grava(p, 'i32-pc-' + suf, CAB, 1560);
    await ir(p, 'inspecoes/apontamentos', 900); await grava(p, 'i32-pc2-' + suf, CAB, 1560);
    /* 37 · cartões */
    await grava(p, 'i37-pc-' + suf, { x: 240, y: 250, width: 1040, height: 360 }, 1560);
    /* 34 · pílulas */
    await ir(p, 'almox/equipamentos', 900); await grava(p, 'i34-pc-' + suf, { x: 240, y: 56, width: 1040, height: 400 }, 1560);
    console.log(suf, p._er); await p.context().close();
  }
  await br.close();
  fs.writeFileSync(path.join(__dirname, 'out', 'img4.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
