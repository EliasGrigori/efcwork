/* EFCwork v0.6.42 + Vértice v0.6.77 · o que não sobe para a nuvem diz por quê (defeito de 27/11: FLUX 0002 "Subindo" sem fim).
   Base: t_v0641 · P4: o Vértice na nuvem pela porta do Cwork (recurso 'nuvem': listar, ler, gravar).
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /efcwork/vertice/ (VERTICE_DIR = a pasta montada; padrão: a pasta vertice/ do repositório).
   Modo demonstração (o banco do Cwork fica no aparelho; as regras do Firestore só no site). Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0642n.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, base) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  return p;
}
const N = (p, fn, ...a) => p.evaluate(fn, ...a);
const vertFr = p => p.frames().find(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame());
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, base);
  console.log('— A porta lê a lista do servidor e tem prazo');
  conf(await N(p, () => typeof Data.col('vtd_arquivos').frescos === 'function' && /vtPrazo/.test(String(vtNuvemGravar))), 'Data.frescos existe e a gravação usa o prazo');
  /* a "nuvem" recusa o quadro flux2 (como uma regra negando), o resto passa */
  await N(p, () => { const orig = Data.col; window._negar = new Set(['flux2']); Data.col = function (n) { const c = orig.call(Data, n); if (n !== 'vtd_partes' && n !== 'vtd_arquivos') return c; const set0 = c.set; return Object.assign({}, c, { set(id, o) { const arq = n === 'vtd_arquivos' ? id : o.arq; if (window._negar.has(arq)) return Promise.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })); return set0.call(c, id, o); }, get: c.get, fresco: c.fresco, frescos: c.frescos }); }; });
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4000);
  let fr = vertFr(p);
  conf(!!fr, 'o Vértice abriu na aba');
  const pacote = { fmt: 'texto', dados: JSON.stringify({ notas: [] }), bytesOriginal: 10, bytesFinal: 10 };
  const ficha = (id, nome) => ({ id, nome, tipo: 'postits', status: 'rascunho', pastaNome: 'Fluxogramas', codigo: id.toUpperCase(), criadoEm: '2026-11-27T10:00:00.000Z', alteradoEm: '2026-11-27T10:08:00.000Z', gravacao: 1 });
  /* dois quadros do aparelho, nunca enviados: o recusado vem PRIMEIRO na fila (antes, ele segurava o outro) */
  await fr.evaluate(rs => new Promise(ok => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readwrite'); rs.forEach(r => t.objectStore('arquivos').put(r)); t.oncomplete = () => ok(1); }; }), [{ id: 'flux2', marca: 'm2', pacote, ficha: ficha('flux2', 'Mapa do envio (exemplo) 2') }, { id: 'flux1', marca: 'm1', pacote, ficha: ficha('flux1', 'Mapa do envio (exemplo) 1') }]);
  await N(p, () => { const f = document.querySelector('.jn-fr iframe'); f.contentWindow.location.reload(); }); await esp(p, 5000);
  fr = vertFr(p); await fr.evaluate(() => { location.hash = '#/internos'; }); await esp(p, 1200);
  await fr.evaluate(() => { const b2 = document.querySelector('[data-int-sub="Fluxogramas"]'); if (b2) b2.click(); }); await esp(p, 800);
  const nuvemDe = id => fr.evaluate(i => { const e = document.querySelector('[data-int-nuvem="' + i + '"]'); return e ? e.textContent : ''; }, id);
  const n1 = await N(p, () => Data.col('vtd_arquivos').get('flux1')), n2 = await N(p, () => Data.col('vtd_arquivos').get('flux2'));
  conf(n1 && n1.versao === 1 && !n2, 'o quadro recusado NÃO segura o outro: flux1 subiu, flux2 não');
  conf(/Na nuvem · versão 1/.test(await nuvemDe('flux1')), 'flux1: "Na nuvem · versão 1"');
  conf(/Não subiu: sem permissão na nuvem/.test(await nuvemDe('flux2')), 'flux2 diz por quê: "' + await nuvemDe('flux2') + '"');
  conf(await fr.$('[data-int-tentar="flux2"]') && !(await fr.$('[data-int-tentar="flux1"]')), '"Tentar de novo" só no que não subiu');
  const T = path.join(RAIZ, 'tools/visual/v0642n'); fs.mkdirSync(T, { recursive: true });
  await p.screenshot({ path: path.join(T, 'pc-nao-subiu.png') });
  await N(p, () => window._negar.clear());
  await fr.click('[data-int-tentar="flux2"]'); await esp(p, 2500);
  conf(/Na nuvem · versão 1/.test(await nuvemDe('flux2')) && !(await fr.$('[data-int-tentar="flux2"]')), 'resolvido na nuvem, "Tentar de novo" sobe: "' + await nuvemDe('flux2') + '"');
  await p.screenshot({ path: path.join(T, 'pc-subiu.png') });
  conf(p._er.filter(x => !/insufficient permissions/i.test(x)).length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
