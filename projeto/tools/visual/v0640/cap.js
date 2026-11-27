/* EFCwork v0.6.40 · filme da página de aprovação: trocar de cadastro pela lista retrátil e abrir o formulário.
   Uso: NODE_PATH=$(npm root -g) node tools/visual/v0640/cap.js   (depois de montar) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), cp = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const OUT = path.join(__dirname, 'telas'); fs.mkdirSync(OUT, { recursive: true });
const esp = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), w = 1366, h = 820;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: path.join(OUT, '_v'), size: { width: w, height: h } } }); await ctx.route(/^https:/, r => r.abort());
  const p = await ctx.newPage(), t0 = Date.now();
  await p.goto(URL); await esp(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
  await p.evaluate(async () => { const C = Data.col.bind(Data);
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], labModelo: { IBRA: 'completa' }, fazendas: [{ prefixo: 'RU', nome: 'Fazenda Russas', unidade: 'matriz' }, { prefixo: 'JD', nome: 'Fazenda Jardim', unidade: 'matriz' }],
      tipos: [{ nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FOLHA', gera: ['FOLHA'], pontosPorHa: 5 }] });
    const T = (id, o) => C('sv2_talhoes').set(id, Object.assign({ pivo: 'Pivô 2', cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true }, o));
    await T('t1', { codigo: 'RU11TAI24', hectares: 4.5 }); await T('t2', { codigo: 'RU12TAI24', hectares: 4.5 }); await T('t3', { codigo: 'JD03FOR25', variedade: 'FORMOSA', hectares: 6.2 });
    const A = (id, o) => C('sv2_analises').set(id, Object.assign({ ativo: true, rev: 0 }, o));
    await A('a1', { nome: 'SOLO COMPLETO', tipo: 'SOLO', lab: 'IBRA', sigla: 'SC', valor: 120 }); await A('a2', { nome: 'FOLIAR', tipo: 'FOLHA', lab: 'IBRA', sigla: 'FOL', valor: 90 }); await A('a3', { nome: 'NEMATOIDE', tipo: 'NEMATOIDE', lab: 'BIOAGRI', sigla: 'NEM', valor: 80 });
  });
  await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(1000);
  const ini = (Date.now() - t0) / 1000;
  await p.mouse.move(900, 300); await esp(700);
  await p.hover('[data-dd="cc:vista"] .dd-b'); await esp(400); await p.click('[data-dd="cc:vista"] .dd-b'); await esp(1100);
  await p.hover('[data-dd="cc:vista"] li:has-text("Análises")'); await esp(500); await p.click('[data-dd="cc:vista"] li:has-text("Análises")'); await esp(1300);
  await p.hover('.tb tbody tr:has-text("FOLIAR")'); await esp(400); await p.click('.tb tbody tr:has-text("FOLIAR")'); await esp(1300);
  await p.hover('#gv [data-act="cc-editar"]'); await esp(400); await p.click('#gv [data-act="cc-editar"]'); await esp(1500);
  await p.keyboard.press('Escape'); await esp(700); await p.keyboard.press('Escape'); await esp(700);
  await p.click('[data-dd="cc:vista"] .dd-b'); await esp(700); await p.click('[data-dd="cc:vista"] li:has-text("Talhões")'); await esp(1300);
  const fim = (Date.now() - t0) / 1000, vd = p.video(); await ctx.close();
  cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(ini), '-t', String(fim - ini), '-i', await vd.path(), '-vf', 'scale=960:-2', '-r', '24', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, 'filme-trocar.mp4')]);
  cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2.5', '-i', path.join(OUT, 'filme-trocar.mp4'), '-frames:v', '1', path.join(OUT, 'filme-trocar.png')]);
  fs.rmSync(path.join(OUT, '_v'), { recursive: true, force: true }); await b.close();
  console.log('filme', (fim - ini).toFixed(1) + ' s', Math.round(fs.statSync(path.join(OUT, 'filme-trocar.mp4')).size / 1024) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
