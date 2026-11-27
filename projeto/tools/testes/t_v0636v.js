/* EFCwork · v0.6.36 · P5: o Vértice mora em efcwork/vertice/ e o endereço antigo /EFCdocs/ leva ao novo.
   1) o site do Vértice em vertice/ (a versão da pasta) instala o sw.js dele no endereço novo; o do Cwork não guarda nada de lá;
   2) com o Vértice ANTIGO (v0.6.73, clone de leitura) instalado em /EFCdocs/ e um banco no aparelho, o endereço antigo passa a ter a
      página e o sw.js de tools/p5/EFCdocs-raiz: quem abre /EFCdocs/?em=cwork#/x vai para /efcwork/vertice/?em=cwork#/x, o sw antigo
      sai e os arquivos do aparelho continuam. Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0636v.js */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const V_ATUAL = require('../../../vertice/fonte/package.json').version, RAIZ = path.resolve(__dirname, '..', '..'), REPO = path.resolve(RAIZ, '..'), NOVO = path.join(REPO, 'vertice'), VELHO = process.env.VERTICE_ANTIGO || '/home/claude/eliasgrigori/efcdocs', P5 = path.join(RAIZ, 'tools/p5/EFCdocs-raiz');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
let fase = 1;
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = '';
  if (u.startsWith('/efcwork/vertice/')) f = path.join(NOVO, u.slice(17));
  else if (u.startsWith('/efcwork/')) f = path.join(RAIZ, 'dist', u.slice(9));
  else if (u.startsWith('/EFCdocs/')) { const resto = u.slice(9); f = fase === 2 && (resto === '' || resto === 'index.html' || resto === 'sw.js') ? path.join(P5, resto || 'index.html') : path.join(VELHO, resto); }
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms);
(async () => {
  console.log('— O site do Vértice em vertice/');
  const sw = fs.readFileSync(path.join(NOVO, 'sw.js'), 'utf8'), lista = JSON.parse(sw.match(/const ARQUIVOS = (\[[\s\S]*?\]);/)[1]);
  conf(sw.includes("const VERSAO = 'vertice-v" + require(path.join(NOVO, 'fonte', 'package.json')).version + "'") && /const PREFIXO = 'vertice-'/.test(sw), 'sw.js do Vértice na versão do package.json, com prefixo próprio (vertice-; o antigo usa efcdocs-, um não apaga o do outro)');
  const falta = lista.filter(a => !fs.existsSync(path.join(NOVO, a === './' ? 'index.html' : a)));
  conf(!falta.length, 'todos os arquivos que o sw.js guarda existem em vertice/' + (falta.length ? ': ' + falta.join(', ') : ' (' + lista.length + ')'));
  conf(fs.existsSync(path.join(NOVO, 'fonte/package.json')) && fs.existsSync(path.join(NOVO, 'fonte/src/App.jsx')), 'o código do Vértice está em vertice/fonte/ (como no repositório EFCdocs)');
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage(); const er = []; p.on('pageerror', e => er.push(String(e)));
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/vertice/'); await esp(p, 3500);
  let reg = await p.evaluate(async () => { const rs = await navigator.serviceWorker.getRegistrations(); return rs.map(r => new URL(r.scope).pathname + (r.active ? ':ativo' : ':' + (r.installing ? 'instalando' : 'esperando'))); });
  conf(reg.some(x => /^\/efcwork\/vertice\/:ativo/.test(x)), 'abrindo o endereço novo, o sw.js do Vértice se instala lá (' + reg.join(', ') + ')');
  const cx = await p.evaluate(async () => (await caches.keys()).join(','));
  conf(cx.includes('vertice-v' + V_ATUAL) && !/efcwork-/.test(cx), 'a tela do Vértice fica guardada no cache dele (' + cx + ')');
  await ctx.close();
  console.log('— O endereço antigo leva ao novo');
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage(); p.on('pageerror', e => er.push(String(e)));
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/EFCdocs/'); await esp(p, 3500); /* o Vértice antigo, como está hoje no aparelho de quem já usou */
  await p.evaluate(() => new Promise((ok, no) => { const q = indexedDB.open('teste-p5', 1); q.onupgradeneeded = () => q.result.createObjectStore('a'); q.onsuccess = () => { const t = q.result.transaction('a', 'readwrite'); t.objectStore('a').put('meu arquivo', 'x'); t.oncomplete = () => ok(); }; q.onerror = no; }));
  reg = await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => new URL(r.scope).pathname));
  conf(reg.indexOf('/EFCdocs/') >= 0, 'antes: o sw.js antigo está instalado em /EFCdocs/ (' + reg.join(', ') + ')');
  fase = 2; /* publicado o endereço antigo novo */
  const navs = []; p.on('framenavigated', f => { if (f === p.mainFrame()) navs.push(f.url().replace(base, '')); });
  await p.goto(base + '/EFCdocs/?em=cwork#/abrir/p123'); await esp(p, 4000);
  conf(navs.indexOf('/efcwork/vertice/?em=cwork#/abrir/p123') >= 0 && /\/efcwork\/vertice\//.test(p.url()), 'abrir o endereço antigo leva ao novo com o mesmo pedido (' + navs.join(' → ') + '; o Vértice depois trata o #/abrir)');
  reg = await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => new URL(r.scope).pathname));
  conf(reg.indexOf('/EFCdocs/') < 0, 'o sw.js do endereço antigo se desligou (' + reg.join(', ') + ')');
  const ainda = await p.evaluate(() => new Promise(ok => { const q = indexedDB.open('teste-p5', 1); q.onsuccess = () => { const g = q.result.transaction('a').objectStore('a').get('x'); g.onsuccess = () => ok(g.result); }; q.onerror = () => ok(null); }));
  conf(ainda === 'meu arquivo', 'os arquivos do aparelho continuam (o banco é do site, não da pasta)');
  const cxs = await p.evaluate(async () => (await caches.keys()).join(','));
  conf(/efcdocs-v0\.6\.73/.test(cxs) && cxs.includes('vertice-v' + V_ATUAL), 'o cache antigo e o novo convivem (nenhum apaga o outro) (' + cxs + ')');
  navs.length = 0; await p.goto(base + '/EFCdocs/#/arq/abc'); await esp(p, 2500);
  conf(navs.indexOf('/efcwork/#/vertice') >= 0, 'ícone ou favorito antigo, fora do Cwork: vai para o Cwork, que abre o Vértice em tela inteira (revisor) (' + navs.join(' → ') + ')');
  await ctx.close();
  console.log('— Primeira vez dentro do Cwork, com o sw do Cwork no controle (revisor)');
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage(); p.on('pageerror', e => er.push(String(e)));
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 600);
  await p.evaluate(async () => { await navigator.serviceWorker.register('/efcwork/sw.js'); await navigator.serviceWorker.ready; }); await esp(p, 1500);
  await p.reload(); await esp(p, 1200);
  conf(await p.evaluate(() => !!navigator.serviceWorker.controller && /\/efcwork\/sw\.js$/.test(navigator.serviceWorker.controller.scriptURL)), 'o Cwork está sob o sw dele (como no aparelho)');
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  let nv = 0; p.on('framenavigated', f => { if (f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url())) nv++; });
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 9000);
  const fr = p.frames().find(f => /\/efcwork\/vertice\//.test(f.url()));
  const vt = fr ? await fr.evaluate(() => ({ txt: /Versão nova/i.test(document.body.innerText), ctl: navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : '' })) : {};
  conf(fr && nv === 1 && !vt.txt, 'o Vértice abre uma vez só, sem recarregar e sem aviso falso de "Versão nova" (' + nv + ' navegação; ' + JSON.stringify(vt) + ')');
  conf(!er.length, 'sem erro de JavaScript' + (er.length ? ': ' + er[0] : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
