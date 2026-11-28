/* EFCwork v0.6.49 + Vértice v0.6.84 · PDF preenchido de volta (ITEM 184, aprovado em 21/11; contrato autorizado em 27/11 17:22).
   O Vértice responde o pedido do Cwork com o PDF da cópia preenchida (até 650 KB) e diz como saiu (imprimir ou PDF baixado);
   o Cwork guarda o PDF na remessa (sv2_rem_arq + sv2_rem_docs "preenchido" com arqId) e qualquer aparelho abre sem o Vértice.
   Modelo de TESTE com marca d'água (tools/visual/v0681/amostras/teste-duas-abas.xlsx).
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0649.js
   EFC_DIST=<Cwork publicado> VERTICE_DIR=<Vértice publicado> TELAS=<pasta> tira as fotos HOJE (sem as conferências). */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const DIST = path.resolve(process.env.EFC_DIST || path.join(RAIZ, 'dist')), HOJE = !!process.env.EFC_DIST;
const AM = path.join(RAIZ, 'tools/visual'), T = process.env.TELAS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (HOJE) return; if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const foto = async (p, nome) => { if (T) { fs.mkdirSync(T, { recursive: true }); await esp(p, 300); await p.screenshot({ path: path.join(T, nome + '.png') }); } };
const LAB = 'LAB SOLO (exemplo)';

async function abre(b, base, vp) {
  const ctx = await b.newContext({ viewport: vp, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  await p.evaluate(async l => {
    const C = Data.col.bind(Data), d = n => addDias(hojeISO(), n);
    await C('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol, { labs: [l], labInfo: { [l]: { nome: l, end: 'Rua (exemplo), 1', cidade: 'Cidade', uf: 'CE' } } }));
    const K = (id, o) => C('sv2_coletas').set(id, Object.assign({ situacao: 'ativa', lab: l, coletor: 'Equipe A (exemplo)', criadoEm: nowISO(), criadoPor: S.user.id, tipo: 'SOLO', data: d(-8), enviado: true, envio: d(-6), os: '0457', analiseNome: 'QUÍMICA (exemplo)', prof: '0-20' }, o));
    for (let i = 0; i < 3; i++) await K('g' + i, { talhao: 'RU6' + i });
  }, LAB);
  await esp(p, 400);
  return p;
}
const vertFrs = p => p.frames().filter(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
const espFr = async (p, teste, n) => { for (let i = 0; i < (n || 80); i++) { await esp(p, 250); for (const f of vertFrs(p)) if (await teste(f).catch(() => false)) return f; } return null; };
/* põe um modelo de TESTE no Vértice; com pasta, também na nuvem do Cwork (como a etapa 1 faz sozinha) */
async function poeModelo(p, arquivo, nome, docId, pasta) {
  const b64 = fs.readFileSync(path.join(AM, arquivo)).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: a.nome + '.xlsx', docId: a.docId }); jnAbrir('docs', '#/abrir/' + pid, true); }, { b64, nome, docId });
  const fr = await espFr(p, async f => f.url().includes('#/documento/' + docId) && !!(await f.$('[data-modo-documento="pronto"]')));
  if (!fr) { console.log('    (frames: ' + vertFrs(p).map(f => f.url().replace(/^.*vertice\//, '')).join(' | ') + ')'); return false; }
  if (pasta) {
    const rec = await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const r = g.result; r.ficha.pastaNome = a.pasta; r.ficha.nome = a.nome; st.put(r).onsuccess = () => ok2(r); }; }; }), { id: docId, nome, pasta });
    const r = await p.evaluate(a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.ficha, pacote: a.pacote }, 0), rec);
    await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const x = g.result; x.ficha.nuvem = { versao: a.v }; st.put(x).onsuccess = () => ok2(1); }; }; }), { id: docId, v: r && r.versao });
  }
  await p.evaluate(a => { const id = S.jnAbertas.find(x => { const f = jnFr(x); return f && f.contentWindow.location.href.includes(a); }); if (id) jnTira(id); jnIr('efcwork'); }, docId); await esp(p, 300);
  return true;
}
const fechaVertices = p => p.evaluate(() => { S.jnAbertas.slice().forEach(id => { if (id !== 'efcwork') jnTira(id); }); jnIr('efcwork'); });

(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, base, { width: 1280, height: 860 });
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 600);
  conf(await poeModelo(p, 'v0681/amostras/teste-duas-abas.xlsx', 'Teste duas abas (exemplo)', 'dduasabas01', 'Fichas e custódias'), 'modelo de TESTE na nuvem do Vértice');
  await p.evaluate(async l => { await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: 'Teste duas abas (exemplo)', docId: 'dduasabas01', lab: l, papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '', fonte: 'vertice', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome }); }, LAB); await esp(p, 500);
  const k = await p.evaluate(() => coLoteK(S.coletas.find(c => c.id === 'g0')));
  const reg = () => p.evaluate(async kk => { const l = (await Data.col('sv2_rem_docs').all()).filter(x => x.k === kk && x.tipo === 'preenchido').sort((a, b) => String(b.em).localeCompare(String(a.em))); const r = l[0];
    const a = r && r.arqId ? await Data.col('sv2_rem_arq').get(r.arqId) : null; return r ? { n: l.length, arqId: r.arqId || '', copias: r.copias, bytes: r.bytes || 0, b64: a ? a.b64.slice(0, 40) : '', tam: a ? a.b64.length : 0, ver: (await Data.col('sv2_audit').all()).filter(x => x.acao === 'remessa_doc').map(x => x.resumo).join(' | ') } : null; }, k);
  /* pede e espera o pedido abrir no Vértice */
  const pede = async () => {
    await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 500);
    await p.evaluate(kk => ktPapAbre([kk]), k); await esp(p, 600);
    await p.evaluate(() => { S.fm.sel['__rotulo'] = false; gvDesenha(true); }); await esp(p, 300);
    const antes = vertFrs(p); await p.click('[data-act="kt-imprimir"]');
    const fr = await espFr(p, async f => !antes.includes(f) && /#\/pedido\/p/.test(f.url()) && !!(await f.$('[data-pedido="pronto"], [data-pedido="erro"]')));
    if (fr) await esp(p, 1500);
    return fr;
  };

  console.log('— Imprimir no Vértice: o PDF preenchido volta para a remessa');
  let fr = await pede();
  conf(!!fr, 'abre o pedido no Vértice');
  if (fr) {
    await fr.evaluate(() => { window.print = () => {}; });
    await fr.click('[data-pedido-imprimir]'); await esp(p, 3500);
    await p.evaluate(() => drRespostas()); await esp(p, 1500);
    const r = await reg();
    conf(r && r.arqId && /^data:application\/pdf;base64,/.test(r.b64) && r.tam > 1000, 'o registro "Preenchido no Vértice" tem o PDF guardado na nuvem (' + (r ? r.tam + ' letras' : 'sem registro') + ')');
    conf(r && r.copias > 0, 'imprimiu: conta as cópias (' + (r && r.copias) + ')');
    await fechaVertices(p); await esp(p, 300);
    await p.evaluate(kk => coAbreLote(kk), k); await esp(p, 700);
    conf(!!(await p.$('#gv [data-act="dr-ver"]')), 'na gaveta da remessa aparece o botão para ver o PDF preenchido');
    await p.evaluate(() => { const d = document.querySelector('#gv .dr'); if (d) d.scrollIntoView({ block: 'center' }); }); await foto(p, 'pc-remessa-preenchido');
    await p.evaluate(() => history.back()); await esp(p, 300);
  }

  console.log('— Baixar o PDF no Vértice (sem imprimir)');
  fr = await pede();
  if (fr) {
    await fr.click('[data-pedido-pdf]'); await esp(p, 3500);
    await p.evaluate(() => drRespostas()); await esp(p, 1500);
    const r = await reg();
    conf(r && r.n === 2 && r.arqId && r.copias === 0, 'só baixou o PDF: guarda o PDF e anota 0 cópias impressas (' + (r && r.copias) + ')');
    const sit = await p.evaluate(kk => { const x = drItens(kk).find(y => y.docId === 'dduasabas01'); return x ? drSit(kk, x).t : ''; }, k);
    conf(sit === 'PDF preenchido no Vértice', 'a situação diz que só saiu o PDF (' + sit + ')');
    await fechaVertices(p); await esp(p, 300);
    await p.evaluate(kk => coAbreLote(kk), k); await esp(p, 700);
    await p.evaluate(() => { const d = document.querySelector('#gv .dr'); if (d) d.scrollIntoView({ block: 'center' }); }); await foto(p, 'pc-remessa-so-pdf');
    await p.setViewportSize({ width: 390, height: 844 }); await esp(p, 600);
    await p.evaluate(() => { const d = document.querySelector('#gv .dr'); if (d) d.scrollIntoView({ block: 'center' }); }); await foto(p, 'cel-remessa-so-pdf');
    await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 400);
    await p.evaluate(() => history.back()); await esp(p, 300);
  } else conf(false, 'abre o segundo pedido no Vértice');

  console.log('— Outro aparelho abre o PDF sem o Vértice');
  const outro = await p.evaluate(async kk => { const r = S.drDocs.filter(x => x.k === kk && x.tipo === 'preenchido' && x.arqId)[0]; if (!r) return null; delete DR_ARQ[r.arqId]; let url = ''; const f0 = window.ipAbrirFora; window.ipAbrirFora = u => { url = u; }; await drVer(r.id); window.ipAbrirFora = f0; return url; }, k);
  conf(outro && /^blob:/.test(outro), 'o PDF preenchido abre a partir da nuvem do Cwork');
  const fb = await p.evaluate(async () => { const l0 = Data.lote, a0 = window.aviso; Data.lote = () => Promise.reject(Object.assign(new Error('negado'), { code: 'permission-denied' })); window.aviso = () => {};
    const ok = await drGravaComPdf({ k: 'x|y', item: 'i1', nome: 'Teste', tipo: 'preenchido', docId: 'd1', rev: 1, paginas: 1, copias: 1, dadosJson: '' }, 'pre_teste1', new Uint8Array([37, 80, 68, 70]).buffer);
    Data.lote = l0; window.aviso = a0; const r = await Data.col('sv2_rem_docs').get('pre_teste1'); return { ok: ok, tem: !!r, arq: r && r.arqId }; });
  conf(fb.ok && fb.tem && !fb.arq, 'se a nuvem recusar o PDF, o registro "Preenchido" entra sem ele (a resposta não fica presa)');
  conf(!p._er.length, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await b.close(); srv.close();
  if (!HOJE) console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})();
