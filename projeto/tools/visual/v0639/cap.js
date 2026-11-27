/* Capturas do app de verdade (modo demonstração, dados inventados) para a página de aprovação da limpeza visual (v0.6.39).
   Uso: NODE_PATH=$(npm root -g) node cap.js <pasta com um dist por proposta (variantes.py montar)> <saída> */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');
const [,, V, OUT] = process.argv.map(a => path.resolve(a)); fs.mkdirSync(OUT, { recursive: true });
const esp = ms => new Promise(r => setTimeout(r, ms));
const ITENS = ['Água desmineralizada 1L', 'Alcalino clorado', 'Bureta âmbar 25 mL', 'Caixa térmica isopor 08L', 'Caneta azul', 'Pilha alcalina AAA', 'Reagente calibração pH4', 'Reagente calibração pH7'];
const DOCS = [['POP-LAB-001', 'Coleta de amostras de solo'], ['POP-LAB-002', 'Calibração do pHmetro'], ['FOR-QUA-010', 'Registro de cloro residual'], ['MAN-SST-003', 'Uso de EPI no campo'], ['POP-PH-004', 'Higienização da packing house']];
let b;
async function abre(v, { tema = 'light', w = 1280, h = 760, video = false } = {}) {
  const cel = w < 600, o = { viewport: { width: w, height: h }, colorScheme: tema, isMobile: cel, hasTouch: cel, deviceScaleFactor: 2 };
  if (video) Object.assign(o, { deviceScaleFactor: 1, recordVideo: { dir: path.join(OUT, '_v'), size: { width: w, height: h } } });
  const ctx = await b.newContext(o); await ctx.route(/^https:/, r => r.abort());
  const p = await ctx.newPage(); const t0 = Date.now();
  await p.goto('file://' + path.join(V, v, 'index.html') + '?demo=1'); await esp(600);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
  await p.evaluate(async ([l, d]) => {
    for (let i = 0; i < l.length; i++) await Data.col('sv2_alm_itens').set('i' + i, { nome: l[i].toUpperCase(), codigo: String(100 + i), un: 'Un', min: 1, local: 'Porta 0' + (i % 5 + 1), ativo: true });
    for (let i = 0; i < d.length; i++) await Data.col('efd_docs').set('d' + i, { codigo: d[i][0], titulo: d[i][1], tipo: 'POP', status: 'vigente', versao: 'Rev. 0' + (i % 3 + 1), validade: '2027-0' + (i % 9 + 1) + '-15', respId: S.user.id });
  }, [ITENS, DOCS]);
  return { ctx, p, t0 };
}
const ir = async (p, h) => { await p.evaluate(x => { location.hash = x; }, h); await esp(900); };
const foto = (p, n, sel, pad = 14) => sel ? p.locator(sel).first().boundingBox().then(q => p.screenshot({ path: path.join(OUT, n + '.png'), clip: { x: Math.max(0, q.x - pad), y: Math.max(0, q.y - pad), width: q.width + pad * 2, height: q.height + pad * 2 } })) : p.screenshot({ path: path.join(OUT, n + '.png') });
const tamanhos = p => p.evaluate(() => { const s = new Set(); for (const e of document.querySelectorAll('body *')) { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; s.add(parseFloat(getComputedStyle(e).fontSize)); } return [...s].sort((a, b) => a - b); });
(async () => {
  b = await chromium.launch(); const so = process.env.SO || '', med = {};
  if (!so || so === 'bt') for (const v of ['hoje', 'bt1', 'bt2', 'bt3', 'bt4', 'bt5']) {
    for (const tema of ['light', 'dark']) {
      const { ctx, p } = await abre(v, { tema }); await ir(p, '#/almox/materiais'); await p.evaluate(() => mcNovo()); await esp(900);
      const n = 'bt-' + v + '-' + (tema === 'light' ? 'claro' : 'escuro');
      await p.evaluate(() => { document.querySelectorAll('.bt.pr').forEach(e => { e.getAnimations && e.getAnimations({ subtree: true }).forEach(a => { a.currentTime = 0; a.pause(); }); }); });
      if (tema === 'light') await foto(p, n + '-tela');
      await foto(p, n, '#gv .bt.pr', 40);
      if (v === 'bt5' && tema === 'light') { await p.hover('#gv .bt.pr'); await esp(260); await foto(p, n + '-mouse', '#gv .bt.pr', 40); }
      await ctx.close();
    }
    console.log('botão', v);
  }
  if (!so || so === 'btv') for (const v of ['hoje', 'bt5']) {  /* movimento: hoje o brilho passa sozinho; na OPÇÃO 5 só quando o mouse chega */
    const { ctx, p, t0 } = await abre(v, { video: true, w: 900, h: 560 }); await ir(p, '#/almox/materiais'); await p.evaluate(() => mcNovo()); await esp(900);
    const ini = (Date.now() - t0) / 1000;
    if (v === 'bt5') { await esp(1500); await p.mouse.move(200, 300); await esp(600); await p.hover('#gv .bt.pr'); await esp(1500); await p.mouse.move(200, 300); await esp(1200); await p.hover('#gv .bt.pr'); await esp(1800); } else await esp(8000);
    const fim = (Date.now() - t0) / 1000, vd = p.video(); await ctx.close();
    cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(ini), '-t', String(fim - ini), '-i', await vd.path(), '-vf', 'scale=720:-2', '-r', '24', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, 'bt-' + v + '.mp4')]);
    console.log('vídeo', v);
  }
  if (!so || so === 'esc') for (const v of ['hoje', 't234', 't235', 't236', 't237']) {
    for (const [w, h, s] of [[1280, 760, 'pc'], [390, 780, 'cel']]) {
      const { ctx, p } = await abre(v, { tema: 'dark', w, h }); await ir(p, '#/almox/materiais');
      await foto(p, 'esc-' + v + '-' + s);
      if (s === 'pc') await p.screenshot({ path: path.join(OUT, 'esc-' + v + '-canto.png'), clip: { x: 0, y: h - 330, width: 560, height: 330 } });
      if (s === 'pc') { await foto(p, 'esc-' + v + '-titulo', '.cs-ph h1', 18); await foto(p, 'esc-' + v + '-abas', '.cs-abas', 8); await foto(p, 'esc-' + v + '-menu', '.cs-it.on', 12); }
      await ctx.close();
    }
    console.log('escuro', v);
  }
  if (!so || so === 'e') for (const v of ['hoje', 'e1', 'e2', 'e3', 'e4', 'e5']) {
    med[v] = {};
    for (const [nome, w, h, passos] of [['mat-pc', 1280, 760, ['#/almox/materiais']], ['gaveta-pc', 1280, 760, ['#/almox/materiais', 'mcNovo']], ['inicio-pc', 1280, 760, ['#/inicio']], ['mat-cel', 390, 780, ['#/almox/materiais']]]) {
      const { ctx, p } = await abre(v, { w, h });
      for (const x of passos) if (x.startsWith('#')) await ir(p, x); else { await p.evaluate(f => window[f](), x); await esp(900); }
      await foto(p, 'e-' + v + '-' + nome); med[v][nome] = await tamanhos(p); await ctx.close();
    }
    console.log('escala', v, JSON.stringify(med[v]));
  }
  if (Object.keys(med).length) fs.writeFileSync(path.join(OUT, 'tamanhos.json'), JSON.stringify(med, null, 1));
  fs.rmSync(path.join(OUT, '_v'), { recursive: true, force: true }); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
