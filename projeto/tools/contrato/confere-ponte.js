/* Prova da PONTE EFD v1 num navegador de verdade: duas páginas no mesmo endereço (o EFCwork real em demonstração e um "Docs" de mentira)
   trocam documento, arquivo e dados pela caixa de troca, sem nuvem. Uso: NODE_PATH=$(npm root -g) node tools/contrato/confere-ponte.js */
const http = require('http'), fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..', '..'), ex = require('./exemplos-efd-v1.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const DOCS = '<!doctype html><meta charset="utf-8"><title>Docs de mentira</title><script src="/contrato/efd-v1.js"></script><script src="/contrato/efd-ponte.js"></script><body>docs';
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/EFCdocs/' || u === '/EFCdocs/index.html') { r.writeHead(200, { 'content-type': MIME['.html'] }); return r.end(DOCS); }
  let f = u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9) || 'index.html') : u.startsWith('/contrato/') ? path.join(__dirname, u.slice(10)) : '';
  if (f && f.endsWith(path.sep)) f += 'index.html';
  if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const b64buf = `b => { const s = atob(b), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }`;
const sha = `async buf => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf))).map(x => x.toString(16).padStart(2, '0')).join('')`;
(async () => {
  await new Promise(r => srv.listen(0, r)); const porta = srv.address().port, base = 'http://localhost:' + porta;
  const nav = await chromium.launch(), ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } });
  const erros = []; const abreWork = async () => { const p = await ctx.newPage(); p.on('pageerror', e => erros.push(String(e)));
    await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(base + '/efcwork/?demo=1'); await p.waitForTimeout(600);
    if (await p.$('#en-nome')) { await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700); }
    await p.addScriptTag({ url: base + '/contrato/efd-v1.js' }); await p.addScriptTag({ url: base + '/contrato/efd-ponte.js' }); return p; };
  const D = await ctx.newPage(); await D.goto(base + '/EFCdocs/');
  let W = await abreWork();
  const f = ex.validos.fichas[1], partes = ex.validos.copias[f.id]; /* a cadeia de custódia, em 3 pedaços */
  console.log('Docs -> EFCwork, com o EFCwork aberto:');
  await W.evaluate(() => { window._chegou = []; window._para = EFDPonte.ouvir('efcwork', m => window._chegou.push(m)); });
  const pid = await D.evaluate(async ([f, partes, b64buf]) => { const buf = eval(b64buf)(EFD.juntar(f.pub, partes)); return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: f, pdf: buf }); }, [f, partes, b64buf]);
  await W.waitForFunction(() => window._chegou.length > 0, null, { timeout: 5000 }).catch(() => {});
  const r1 = await W.evaluate(async ([sha]) => { const m = window._chegou[0]; if (!m) return null; const i = await EFDPonte.pegar(m.pid); return { pid: m.pid, oQue: m.oQue, erros: EFD.ficha(i.ficha), bytes: i.pdf.byteLength, sha: await eval(sha)(i.pdf), espera: i.ficha.pub.sha256, pdf: new TextDecoder('latin1').decode(i.pdf.slice(0, 5)) }; }, [sha]);
  conf(r1 && r1.pid === pid && r1.oQue === 'documento', 'o EFCwork foi avisado na hora');
  conf(r1 && !r1.erros.length, 'a ficha recebida segue o contrato');
  conf(r1 && r1.bytes === f.pub.bytes && r1.sha === r1.espera && r1.pdf === '%PDF-', 'o PDF chegou inteiro (tamanho e SHA-256 conferem)');
  await W.evaluate(p => EFDPonte.apagar(p), pid);
  conf((await D.evaluate(() => EFDPonte.esperando('efcwork'))).length === 0, 'depois de guardado, o item sai da caixa');
  console.log('Docs -> EFCwork, com o EFCwork fechado:');
  await W.close();
  const pid2 = await D.evaluate(async ([f, partes, b64buf]) => EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: f, pdf: eval(b64buf)(EFD.juntar(f.pub, partes)) }), [f, partes, b64buf]);
  W = await abreWork();
  const esp = await W.evaluate(() => EFDPonte.esperando('efcwork').then(l => l.map(i => ({ pid: i.pid, n: i.ficha.nome, b: i.pdf.byteLength }))));
  conf(esp.length === 1 && esp[0].pid === pid2 && esp[0].b === f.pub.bytes, 'o documento esperou na caixa e foi achado ao abrir o EFCwork');
  await W.evaluate(p => EFDPonte.apagar(p), pid2);
  console.log('EFCwork -> Docs:');
  const ped = ex.validos.pedidos[1];
  const pid3 = await W.evaluate(d => EFDPonte.por({ de: 'efcwork', para: 'docs', tipo: 'resumo', docId: d.docId, dados: d.dados }), ped);
  const r3 = await D.evaluate(async p => { const i = await EFDPonte.pegar(p); return i && { tipo: i.tipo, erros: EFD.pedido({ v: 1, pid: 'p00000001', docId: i.docId, de: 'efcwork', copias: 1, criadoEm: i.criadoEm.replace(/\.\d+Z$/, '.000Z'), dados: i.dados }), amostras: i.dados['amostras[]'].length }; }, pid3);
  conf(r3 && r3.tipo === 'resumo' && !r3.erros.length && r3.amostras === 2, 'os dados do envio chegaram ao Docs (janela de resumo) e seguem o dicionário');
  const pid4 = await W.evaluate(() => { const a = new Uint8Array(70000); for (let i = 0; i < a.length; i++) a[i] = i % 251; return EFDPonte.por({ de: 'efcwork', para: 'docs', tipo: 'abrir', nomeArquivo: 'ficha-cotacao.xlsx', original: a.buffer }); });
  const r4 = await D.evaluate(async p => { const i = await EFDPonte.pegar(p), a = new Uint8Array(i.original); let igual = a.length === 70000; for (let k = 0; k < a.length && igual; k++) igual = a[k] === k % 251; return { n: i.nomeArquivo, igual }; }, pid4);
  conf(r4.n === 'ficha-cotacao.xlsx' && r4.igual, 'o arquivo do Excel para editar chegou ao Docs byte a byte');
  console.log('Sabiá -> EFCwork:');
  const pid5 = await D.evaluate(t => EFDPonte.por({ de: 'sabia', para: 'efcwork', tipo: 'treino', treino: t }), ex.validos.treinos[0]);
  const r5 = await W.evaluate(async p => { const i = await EFDPonte.pegar(p); return EFD.treino(i.treino); }, pid5);
  conf(r5.length === 0, 'o resumo do treinamento chegou e segue o contrato');
  const r6 = await W.evaluate(t => EFD.treino(Object.assign({}, t, { teste: true })), ex.validos.treinos[0]);
  conf(r6.length > 0, 'treinamento de teste é recusado');
  console.log('Limites:');
  const r7 = await D.evaluate(() => EFDPonte.por({ de: 'docs', para: 'docs', tipo: 'resumo' }).then(() => 'passou', e => 'recusou'));
  conf(r7 === 'recusou', 'item fora do combinado não entra na caixa');
  const O = await ctx.newPage(); await O.goto('http://127.0.0.1:' + porta + '/EFCdocs/');
  const r8 = await O.evaluate(() => EFDPonte.esperando('efcwork').then(l => l.length));
  conf(r8 === 0, 'outro endereço não enxerga a caixa (só funciona no mesmo endereço e navegador)');
  const r9 = await W.evaluate(() => ({ app: !!document.querySelector('.cs-app'), sw: navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(l => l.map(x => new URL(x.scope).pathname)) : [] }));
  conf(r9.app && erros.length === 0, 'o EFCwork continua funcionando com a ponte carregada, sem erro de JavaScript' + (erros.length ? ': ' + erros[0] : ''));
  const sw = await W.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(l => l.map(x => new URL(x.scope).pathname)) : []);
  conf(sw.every(s => s.startsWith('/efcwork/')), 'o cache do EFCwork fica só na pasta dele (' + (sw.join(', ') || 'sem registro') + ')');
  await nav.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); srv.close(); process.exit(1); });
