/* EFCwork · v0.6.38 · regra de segurança (CSP) e SDK do Firebase.
   Serve o app como no GitHub Pages e entrega o SDK pelos arquivos do pacote npm (o teste baixa com "npm pack" se faltar),
   sem internet para o Google: confere que o app abre com a regra ligada, que nada do uso normal é barrado,
   que um script posto por um ataque não roda e que o SDK novo convive com o antigo no mesmo aparelho.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0638.js [--hoje <dist da versão anterior>] [--vertice <pasta vertice/ do site>] */
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..', '..'), DIST = process.env.EFC_DIST ? path.resolve(process.env.EFC_DIST) : path.join(RAIZ, 'dist'); /* EFC_DIST: provar o antes numa versão já publicada */
const arg = n => process.argv.includes(n) ? path.resolve(process.argv[process.argv.indexOf(n) + 1]) : '';
const HOJE = arg('--hoje'), VERT = arg('--vertice') || path.resolve(RAIZ, '..', 'vertice');
const SDK = fs.readFileSync(path.join(RAIZ, 'tools', 'montar.py'), 'utf8').match(/^SDK = '([0-9.]+)'/m)[1];
const HTML = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
/* o SDK de cada versão, do pacote npm (os mesmos arquivos do gstatic) */
const PACOTES = path.join(os.tmpdir(), 'efc-firebase-npm');
function sdkDe(v) {
  const d = path.join(PACOTES, v);
  if (!fs.existsSync(path.join(d, 'package', 'firebase-app-compat.js'))) {
    fs.mkdirSync(d, { recursive: true });
    const tgz = cp.execSync('npm pack firebase@' + v + ' -q', { cwd: d }).toString().trim().split('\n').pop();
    cp.execSync('tar xzf ' + tgz, { cwd: d });
  }
  return path.join(d, 'package');
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml' };
const RAIZES = { '/efcwork/vertice/': VERT, '/efcwork/': DIST };
if (HOJE) RAIZES['/hoje/efcwork/'] = HOJE;
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  for (const [pre, dir] of Object.entries(RAIZES)) if (u.startsWith(pre)) {
    let f = path.join(dir, u.slice(pre.length) || 'index.html'); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) break;
    r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' }); return fs.createReadStream(f).pipe(r);
  }
  r.writeHead(404); r.end('nada');
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
let b, base;
async function contexto(o) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 800 } }, o || {})), rede = [];
  await ctx.route(/^https:\/\//, r => {
    const u = r.request().url(), m = u.match(/^https:\/\/www\.gstatic\.com\/firebasejs\/([0-9.]+)\/([a-z-]+\.js)$/);
    if (m) { rede.push('sdk ' + m[1]); return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(sdkDe(m[1]), m[2])) }); }
    rede.push(u); return r.abort('internetdisconnected');  /* sem internet para o Google: o pedido chegou aqui, então a regra deixou */
  });
  ctx._rede = rede; return ctx;
}
const pagina = async (ctx, er) => { const p = await ctx.newPage(); p.on('pageerror', e => er.push(e.message)); p.on('console', m => { if (/Refused|Content Security Policy|CSP barrou/.test(m.text())) er.push('CSP: ' + m.text().slice(0, 200)); }); return p; };
const barrados = p => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('cw-csp') || '[]'); } catch (e) { return ['?']; } });
const entraDemo = async p => {
  await p.goto(base + '/efcwork/?demo=1'); await esp(700);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(900);
};
(async () => {
  await new Promise(r => srv.listen(0, r)); base = 'http://localhost:' + srv.address().port; b = await chromium.launch();

  console.log('— A regra no arquivo montado');
  const cab = HTML.slice(0, HTML.indexOf('</head>')), meta = (cab.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/) || [])[1] || '';
  const bloco = (HTML.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
  const h = 'sha256-' + crypto.createHash('sha256').update(bloco, 'utf8').digest('base64');
  conf(meta && cab.indexOf('Content-Security-Policy') < cab.indexOf('<script'), 'a regra vem no alto, antes de qualquer script');
  conf(meta.includes("'" + h + "'"), 'o hash da regra é o do script do app (montagem e arquivo batem)');
  conf(!!meta && !/unsafe-inline[^;]*;/.test((meta.split('script-src')[1] || '').split(';')[0] + ';') && !/unsafe-eval/.test(meta), 'script sem "unsafe-inline" nem "unsafe-eval"');
  conf(/object-src[^;]*;/.test(meta) && /base-uri 'none'/.test(meta), 'plugins de fora e troca do endereço base fechados');
  conf(!/frame-src[^;]*data:/.test(meta) && !/script-src[^;]*recaptcha\/ /.test(meta), 'sem quadros data: e sem a pasta inteira do reCAPTCHA');
  conf(/<div id="app"[^>]*><p class="cs-pre">Abrindo o EFCwork/.test(HTML), 'antes de o script rodar, a tela já diz "Abrindo o EFCwork…" e o que fazer se não sair');
  conf((HTML.match(/firebasejs\/([0-9.]+)\//g) || []).every(x => x === 'firebasejs/' + SDK + '/') && fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').split('firebasejs/' + SDK + '/').length === 5, 'SDK ' + SDK + ' no index.html, no sw.js e na regra');

  console.log('— Abrir com o Firebase (sem internet para o Google)');
  let er = [], ctx = await contexto(), p = await pagina(ctx, er);
  await p.goto(base + '/efcwork/'); await p.waitForSelector('#en-senha', { timeout: 30000 }).catch(() => {}); await esp(500);
  let e = await p.evaluate(async () => ({ sdk: typeof firebase !== 'undefined' && firebase.SDK_VERSION, cache: S._semCache || 'ligado', appCheck: S._appCheck, login: !!document.querySelector('#en-login, #en-senha'), bancos: (await indexedDB.databases()).map(d => d.name + '@' + d.version) }));
  conf(e.sdk === SDK, 'o SDK carregado é o ' + SDK + ' (' + e.sdk + ')');
  conf(e.cache === 'ligado' && e.appCheck === 'ligado', 'cache do aparelho e App Check ligados (' + e.cache + ', ' + e.appCheck + ')');
  conf(e.login, 'a tela de entrar aparece (sem internet, pela cópia do aparelho)');
  conf(e.bancos.some(x => /^firestore\/efcwork\/.*@18$/.test(x)), 'banco do aparelho no formato do SDK novo (18; o SDK 10.12.0 usava 16) (' + e.bancos.filter(x => /firestore/.test(x)) + ')');
  conf(ctx._rede.some(u => /google\.com\/recaptcha\/enterprise\.js/.test(u)) && ctx._rede.some(u => /fonts\.googleapis\.com/.test(u)), 'o reCAPTCHA do App Check e as letras passaram pela regra (chegaram à rede)');
  let bar = await barrados(p);
  conf(!bar.length && !er.length, 'nada barrado e sem erro ao abrir (' + JSON.stringify(bar.concat(er)).slice(0, 200) + ')');

  console.log('— Um script posto por um ataque');
  const x = await p.evaluate(async () => { window._x = 0; window._x2 = 0; const d = document.createElement('div'); d.innerHTML = '<img src="nao-existe.png" onerror="window._x=1">'; document.body.appendChild(d);
    const s = document.createElement('script'); s.textContent = 'window._x2=1'; document.body.appendChild(s);
    const s2 = document.createElement('script'); s2.src = 'https://exemplo.invalid/ataque.js'; document.body.appendChild(s2);
    const s3 = document.createElement('script'); s3.src = 'https://www.google.com/recaptcha/about/js/main.min.js'; document.body.appendChild(s3); /* atalho conhecido (AngularJS) dentro da pasta do reCAPTCHA */
    await new Promise(r => setTimeout(r, 600)); return { onerror: window._x, inline: window._x2 }; });
  bar = await barrados(p);
  conf(!x.onerror && !x.inline, 'onerror= e <script> no meio da página não rodam (' + JSON.stringify(x) + ')');
  conf(!ctx._rede.some(u => /exemplo\.invalid/.test(u)), 'script de outro endereço nem é pedido à rede');
  conf(!ctx._rede.some(u => /recaptcha\/about\//.test(u)), 'o atalho dentro da pasta do reCAPTCHA também é barrado (só passa o enterprise.js)');
  conf(bar.length >= 3 && bar.every(r => /script-src/.test(r.regra)), 'os bloqueios ficam anotados no aparelho (' + bar.length + ')');
  await ctx.close();

  console.log('— Uso normal (demonstração): nada barrado em nenhuma tela');
  er = []; ctx = await contexto(); p = await pagina(ctx, er); await entraDemo(p);
  await p.evaluate(() => { location.hash = '#/adm/sobre'; }); await esp(700);
  const sob = await p.evaluate(() => (document.querySelector('.adm-dl') || {}).innerText || '');
  conf(sob.includes(SDK) && /ligada · nada barrado/.test(sob), 'Administração › Sobre mostra o SDK e a regra ligada (' + sob.replace(/\s+/g, ' ').slice(0, 120) + ')');
  const CFG = JSON.parse(fs.readFileSync(path.join(RAIZ, 'tools', 'auditoria', 'efcwork.json'), 'utf8'));
  let n = 0;
  for (const t of CFG.telas) {
    for (const s of t.passos || []) { try { if (s.eval) await p.evaluate(s.eval); else if (s.click) await p.click(s.click, { timeout: 2000 }); else if (s.fill) await p.fill(s.fill[0], s.fill[1]); } catch (x) {} await esp(s.espera || 350); }
    n++;
  }
  bar = await barrados(p);
  conf(n > 30 && !bar.length && !er.filter(x => /CSP/.test(x)).length, n + ' telas do medidor abertas sem nada barrado (' + JSON.stringify(bar).slice(0, 220) + ')');
  /* PDF e impressão abrem num quadro de blob:; fotos e logo são data:; o service worker */
  const q = await p.evaluate(async () => {
    const pdf = new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), u = URL.createObjectURL(pdf), f = document.createElement('iframe'); f.src = u; document.body.appendChild(f);
    const im = new Image(); im.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imOk = await new Promise(r => { im.onload = () => r(true); im.onerror = () => r(false); });
    const dados = await (await fetch('data:text/plain,ok')).text();
    let sw = ''; try { await navigator.serviceWorker.register('sw.js'); sw = (await navigator.serviceWorker.ready).active ? 'ativo' : ''; } catch (x) { sw = String(x); }
    await new Promise(r => setTimeout(r, 500)); f.remove(); return { imOk, dados, sw };
  });
  bar = await barrados(p);
  conf(q.imOk && q.dados === 'ok' && q.sw === 'ativo' && !bar.length, 'quadro de PDF (blob:), imagem data:, leitura de data: e service worker sem bloqueio (' + JSON.stringify(q) + ' ' + JSON.stringify(bar).slice(0, 160) + ')');
  if (fs.existsSync(path.join(VERT, 'index.html'))) {
    await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(500);
    await p.evaluate(() => jnAbrir('docs', '', true)); await esp(3500);
    const v = await p.evaluate(() => { const f = document.querySelector('.jn-fr iframe.on'); let ok = false; try { ok = !!(f && f.contentDocument && f.contentDocument.body && f.contentDocument.body.children.length); } catch (x) {} return { tem: !!f, ok }; });
    bar = await barrados(p);
    conf(v.tem && v.ok && !bar.length, 'o Vértice abre na aba de dentro do Cwork (' + JSON.stringify(v) + ')');
  } else console.log('  (Vértice não encontrado em ' + VERT + ': prova da aba pulada)');
  await ctx.close();

  console.log('— Dentro de um quadro de outro endereço');
  { const c2 = await contexto(), p2 = await c2.newPage(), outro = base.replace('localhost', '127.0.0.1');
    await p2.goto(outro + '/nada'); await p2.setContent('<iframe id="f" src="' + base + '/efcwork/?demo=1" style="width:900px;height:600px"></iframe>'); await esp(2500);
    const fr = p2.frames().find(f => f.url().includes('/efcwork/')), r = fr ? await fr.evaluate(() => ({ t: document.querySelector('#app').innerText, login: !!document.querySelector('#en-senha, #en-nome') })) : null;
    conf(r && !r.login && /endereço próprio/.test(r.t), 'posto dentro de outro site, o app não abre e manda para o endereço próprio (' + (r ? r.t.slice(0, 60) : 'sem quadro') + ')');
    await c2.close(); }

  if (HOJE) {
    console.log('— Aba da versão anterior aberta enquanto a nova abre (o banco do aparelho muda de formato)');
    er = []; ctx = await contexto(); const a = await pagina(ctx, er);
    await a.goto(base + '/hoje/efcwork/'); await esp(4000);
    const va = await a.evaluate(() => [VERSAO, firebase.SDK_VERSION]);
    await a.evaluate(async () => { firebase.app('efcwork').firestore().collection('zz_teste').doc('velha').set({ v: 1 }).catch(() => {}); await new Promise(r => setTimeout(r, 800)); });
    const nb = await pagina(ctx, er); await nb.goto(base + '/efcwork/'); await esp(3000);
    await esp(6000);
    const vb = await nb.evaluate(() => ({ preso: !!S._bancoPreso, aviso: ((document.querySelector('.cs-preso') || {}).innerText || ''), pronto: S.pronto }));
    conf(vb.preso && /versão anterior/.test(vb.aviso) && !vb.pronto, 'com a aba ' + va.join(' / SDK ') + ' aberta, a nova espera e avisa o que fazer (' + vb.aviso.replace(/\s+/g, ' ').slice(0, 90) + ')');
    await a.close();
    await nb.waitForSelector('#en-senha', { timeout: 30000 }).catch(() => {});
    const vc = await nb.evaluate(async () => ({ preso: !!S._bancoPreso, login: !!document.querySelector('#en-senha'), aviso: (document.querySelector('#avisos') || {}).innerText || '', velha: await firebase.app('efcwork').firestore().collection('zz_teste').doc('velha').get({ source: 'cache' }).then(d => d.exists, x => x.code) }));
    conf(!vc.preso && vc.login, 'fechada a aba antiga, a nova termina de abrir sozinha');
    conf(vc.velha === true, 'o que a aba antiga gravou sem internet continua no aparelho depois da mudança de formato');
    await ctx.close();
  }

  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(x => { console.error(x); process.exit(1); });
