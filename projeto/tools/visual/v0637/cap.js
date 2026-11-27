/* Capturas e filmagens do app de verdade para a página de aprovação do aviso de versão nova (v0.6.37).
   Uso: NODE_PATH=$(npm root -g) node cap.js <dist v0.6.36> <dist v0.6.37> <pasta de saída>
   A "versão publicada por cima" é de mentira: o mesmo app com o número seguinte, servido como no GitHub Pages (max-age=600). */
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { chromium } = require('playwright');
const [,, HOJE, NOVO, OUT] = process.argv.map(a => path.resolve(a));
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'efc-cap-'));
const ver = d => fs.readFileSync(path.join(d, 'index.html'), 'utf8').match(/const VERSAO = '([0-9.]+)'/)[1];
function proxima(fonte) {
  const a = ver(fonte), p = a.split('.').map(Number); p[2]++; const n = p.join('.'), d = path.join(TMP, a + '-' + n); fs.cpSync(fonte, d, { recursive: true });
  for (const f of ['index.html', 'sw.js']) fs.writeFileSync(path.join(d, f), fs.readFileSync(path.join(d, f), 'utf8').split("VERSAO = '" + a + "'").join("VERSAO = '" + n + "'").split("'efcwork-" + a + "'").join("'efcwork-" + n + "'"));
  return d;
}
let dir = NOVO;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => {
  const u = q.url.split('?')[0], f = path.join(dir, u.slice(9) || 'index.html');
  if (!u.startsWith('/efcwork/') || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' }); fs.createReadStream(f).pipe(r);
});
const esp = ms => new Promise(r => setTimeout(r, ms));
const PC = [1280, 760], CEL = [390, 780];
const ITENS = ['Água desmineralizada 1L', 'Alcalino clorado', 'Bureta âmbar 25 mL', 'Caixa térmica isopor 08L', 'Caneta azul', 'Pilha alcalina AAA', 'Reagente calibração pH4', 'Reagente calibração pH7'];
let b, base;
async function entra(fonte, [w, h], op, video) {
  dir = fonte;
  const cel = w < 600, o = { viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, deviceScaleFactor: cel ? 2 : 1.5 };
  if (video) o.recordVideo = { dir: path.join(TMP, 'v'), size: { width: w, height: h } };
  const ctx = await b.newContext(o); await ctx.route(/gstatic|fonts\.g/, r => r.abort());
  const t0 = Date.now(), p = await ctx.newPage();
  await p.goto(base + '?demo=1'); await esp(700);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(700);
  await p.evaluate(async l => {
    const h = hojeISO(), me = S.user.id;
    for (let i = 0; i < l.length; i++) await Data.col('sv2_alm_itens').set('i' + i, { nome: l[i].toUpperCase(), codigo: String(100 + i), un: 'Un', min: 1, local: 'Porta 0' + (i % 5 + 1), ativo: true });
    for (const [i, t] of ['Conferir o cloro dos bebedouros', 'Atualizar a planilha de calibração', 'Separar as amostras de folha'].entries())
      await Data.col('sv2_tarefas').set('a' + i, { titulo: t, respId: me, porId: me, prazo: h, status: 'todo' });
  }, ITENS);
  if (op) await p.evaluate(v => Store.set('cw-vn-op', v), op);
  await p.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; }); await esp(1200);
  await p.reload(); await esp(2500);
  return { ctx, p, t0, cel };
}
const rota = async (p, h) => { await p.evaluate(x => { location.hash = x; }, h); await esp(900); };
const publica = async (p, fonte) => { dir = proxima(fonte); await p.evaluate(() => { if (typeof S !== 'undefined' && S.vn) S.vn.ult = 0; document.dispatchEvent(new Event('visibilitychange')); }); };
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const alvo = op => ({ 1: '.vn-1 [data-act="vn-atualiza"]', 2: '.vn-2 [data-act="vn-atualiza"]', 3: '.vn-pe', 4: '.vn-topo', 5: '.vn-5 [data-act="vn-atualiza"]' })[op];
/* mostra onde o dedo/mouse tocou, só na filmagem */
const marca = async (p, sel) => { const q = await p.locator(sel).first().boundingBox(); await p.evaluate(([x, y]) => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:2px solid #b4862f;background:rgba(180,134,47,.25);left:' + x + 'px;top:' + y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 700); }, [q.x + q.width / 2, q.y + q.height / 2]); await esp(600); };
const toca = async (p, sel) => { await marca(p, sel); await p.locator(sel).first().click(); };
const abreMenu = p => toca(p, '.cs-so-cel');
(async () => {
  await new Promise(r => srv.listen(0, r)); base = 'http://localhost:' + srv.address().port + '/efcwork/'; b = await chromium.launch();
  const so = process.env.SO || '';
  /* HOJE: publica por cima da v0.6.36 */
  if (!so || so === 'hoje') for (const [t, s] of [[PC, 'pc'], [CEL, 'cel']]) {
    const { ctx, p } = await entra(HOJE, t); await rota(p, '#/inicio'); await publica(p, HOJE); await esp(4500); await foto(p, 'hoje-' + s); await ctx.close(); console.log('hoje', s);
  }
  /* as 5 formas: foto e filme */
  if (!so || so === 'op') for (const op of ['1', '2', '3', '4', '5']) for (const [t, s] of [[PC, 'pc'], [CEL, 'cel']]) {
    const { ctx, p, t0 } = await entra(NOVO, t, op, true); await rota(p, '#/inicio');
    const ini = (Date.now() - t0) / 1000; await esp(900);
    await publica(p, NOVO);
    await p.waitForFunction(() => S.vn.nova, null, { timeout: 15000 }); await esp(1600);
    await foto(p, 'op' + op + '-' + s);
    if (op === '3' && s === 'cel') { await abreMenu(p); await esp(900); await foto(p, 'op3-cel-menu'); }
    await esp(700); await toca(p, alvo(op)); await esp(3600);
    const fim = (Date.now() - t0) / 1000, v = p.video(); await ctx.close();
    const bruto = await v.path(), sai = path.join(OUT, 'op' + op + '-' + s + '.mp4');
    cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, ini)), '-t', String(fim - ini), '-i', bruto, '-vf', s === 'pc' ? 'scale=960:-2' : 'scale=390:-2', '-r', '20', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', sai]);
    console.log('op', op, s, (fim - ini).toFixed(1) + 's', fs.statSync(sai).size);
  }
  /* volta para a mesma tela, perguntas e o X */
  if (!so || so === 'resto') for (const [t, s] of [[PC, 'pc'], [CEL, 'cel']]) {
    let x = await entra(NOVO, t, '2'), p = x.p;
    await rota(p, '#/almox/materiais'); await publica(p, NOVO); await p.waitForFunction(() => S.vn.nova); await esp(900); await foto(p, 'mesma-antes-' + s);
    await p.click(alvo(2)); await esp(4000); await foto(p, 'mesma-depois-' + s); await x.ctx.close();
    x = await entra(NOVO, t, '2'); p = x.p; await rota(p, '#/inicio'); await publica(p, NOVO); await p.waitForFunction(() => S.vn.nova); await esp(900);
    await p.evaluate(() => { S.fm = { k: 'teste', sujo: true }; vnAtualizar(); }); await esp(900); await foto(p, 'pergunta-form-' + s);
    await p.click('[data-act="cf-nao"]'); await p.evaluate(() => { S.fm = null; }); await esp(500);
    await p.evaluate(() => { jnAbrir('docs', '', true); }); await esp(900); await p.evaluate(() => { jnIr('efcwork'); }); await esp(900);
    await p.evaluate(() => { vnAtualizar(); }); await esp(900); await foto(p, 'pergunta-abas-' + s);
    await x.ctx.close();
    x = await entra(NOVO, t, '2'); p = x.p; await rota(p, '#/inicio'); await publica(p, NOVO); await p.waitForFunction(() => S.vn.nova); await esp(900);
    await p.click('.vn-2 [data-act="vn-fecha"]'); await esp(900); await foto(p, 'x-' + s);
    if (s === 'cel') { await p.click('.cs-so-cel'); await esp(900); await foto(p, 'x-cel-menu'); }
    await x.ctx.close(); console.log('resto', s);
  }
  await b.close(); srv.close(); fs.rmSync(TMP, { recursive: true, force: true });
})().catch(e => { console.error(e); process.exit(1); });
