/* EFCwork v0.6.46 · o kit e os papéis do envio também nas coletas de água (parte 2 das decisões de 27/11 17:22).
   Remessa de água = coletas de água enviadas no mesmo dia para o mesmo laboratório. Modelo de TESTE com marca d'água.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0646.js
   EFC_DIST=<pasta com index.html> troca o app servido (fotos HOJE da página de aprovação; sem as conferências novas). */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const DIST = path.resolve(process.env.EFC_DIST || path.join(RAIZ, 'dist')), HOJE = !!process.env.EFC_DIST;
const AM = path.join(RAIZ, 'tools/visual/v0646/amostras') /* modelo de TESTE com marca d'água; nenhum documento inventado */, T = process.env.TELAS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (HOJE) return; if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const foto = async (p, nome) => { if (T) { fs.mkdirSync(T, { recursive: true }); await esp(p, 250); await p.screenshot({ path: path.join(T, nome + '.png') }); } };
/* auditoria do Método Sabiá: campos lado a lado alinhados (mesma linha, altura, rótulos; no celular, mesma largura) */
const alinha = p => p.evaluate(() => { const ruins = [];
  document.querySelectorAll('#gv .fm-g').forEach(g => { const cs = [...g.children].filter(c => c.classList.contains('fm-c')); if (cs.length < 2) return;
    const cx = cs.map(c => c.querySelector('.fm-i, .dd-b, .fm-passo')).filter(Boolean).map(e => e.getBoundingClientRect()); if (cx.length < 2) return;
    const alt = cx.every(b => Math.abs(b.height - cx[0].height) < 1.5), lin = cx.filter(b => Math.abs(b.top - cx[0].top) < 1.5), larg = innerWidth > 600 || lin.every(b => Math.abs(b.width - lin[0].width) < 2);
    const rot = cs.map(c => c.querySelector('.fm-r')).filter(Boolean).map(e => Math.round(e.getBoundingClientRect().height));
    if (!(alt && lin.length === cx.length || innerWidth <= 600) || !larg || !rot.every(h => h === rot[0])) ruins.push(cs.map(c => (c.querySelector('.fm-r') || {}).textContent).join(' | ')); });
  return ruins; });
/* auditoria visual da gaveta: botões, tamanhos de letra, nada rola para o lado */
const medeGv = (p, cel) => p.evaluate(c => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const g = document.querySelector('#gv'); if (!g) return null;
  const bts = [...g.querySelectorAll('button, label.bt')].filter(vis).filter(e => !e.closest('.dr-et')).map(e => [Math.round(e.getBoundingClientRect().height), (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 30)]).filter(x => x[0] < (c ? 36 : 28)); /* no celular, o mesmo padrão da gaveta da remessa do campo (ícones do topo 36 px, linhas 39 px) */
  const tams = new Set(); g.querySelectorAll('*:not(svg *)').forEach(e => { if (!vis(e)) return; if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) tams.add(getComputedStyle(e).fontSize); });
  return { baixos: bts, tams: [...tams], rolaX: document.documentElement.scrollWidth - innerWidth, larg: Math.round(g.scrollWidth - g.clientWidth) }; }, cel);

const LAB = 'LAB ÁGUA (exemplo)';
async function abre(b, base, vp) {
  const ctx = await b.newContext({ viewport: vp, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  /* dados fictícios (modo demonstração) */
  await p.evaluate(async l => {
    const C = Data.col.bind(Data), d = n => addDias(hojeISO(), n);
    await C('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol, { labs: [l, 'LAB SOLO (exemplo)'], labInfo: { [l]: { nome: l, end: 'Rua (exemplo), 1', cidade: 'Cidade', uf: 'CE' } } }));
    await C('sv2_analises').set('anmic', { tipo: 'AGUA', nome: 'MICROBIOLÓGICA (exemplo)', lab: l, valor: 80, ativo: true });
    await C('sv2_analises').set('anmet', { tipo: 'AGUA', nome: 'METAIS (exemplo)', lab: l, valor: 150, ativo: true });
    const W = (id, o) => C('sv2_aguacol').set(id, Object.assign({ data: d(-3), hora: '07:40', analiseId: 'anmic', analiseNome: 'MICROBIOLÓGICA (exemplo)', qtd: 1, coletor: 'Equipe B (exemplo)', lab: l, envio: d(-2), os: '7781', numSolicitacao: '', resultado: 'PENDENTE', obs: '', situacao: 'ativa', tipoColeta: 'avulsa', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome }, o));
    await W('w1', { pontoRef: 'x:1', pontoNome: 'Ponto A (exemplo)', hora: '07:40', obs: 'torneira da frente' });
    await W('w2', { pontoRef: 'x:2', pontoNome: 'Ponto B (exemplo)', hora: '07:55' });
    await W('w3', { pontoRef: 'x:3', pontoNome: 'Ponto C (exemplo)', hora: '08:10', resultado: 'CONFORME', laudoEm: d(-1) });
    await W('w4', { pontoRef: 'x:4', pontoNome: 'Ponto D (exemplo)', hora: '08:30', analiseId: 'anmet', analiseNome: 'METAIS (exemplo)' });
    await W('w5', { pontoRef: 'x:5', pontoNome: 'Ponto E (exemplo)', situacao: 'cancelada', canceladaMotivo: 'teste' });
    await W('w6', { pontoRef: 'x:6', pontoNome: 'Ponto F (exemplo)', envio: d(-9), data: d(-10) });
    await W('w7', { pontoRef: 'x:7', pontoNome: 'Ponto G (exemplo)', envio: '', os: '', data: d(-1) });
  }, LAB);
  await esp(p, 500);
  return p;
}
const vertFrs = p => p.frames().filter(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
/* põe o modelo de teste no Vértice e na nuvem do Cwork (como a etapa 1 faz sozinha) */
async function poeModelo(p, arquivo, nome, docId) {
  const b64 = fs.readFileSync(path.join(AM, arquivo)).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: a.nome + '.xlsx', docId: a.docId }); jnAbrir('docs', '#/abrir/' + pid, true); }, { b64, nome, docId });
  let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); for (const f of vertFrs(p)) if (f.url().includes('#/documento/' + docId) && await f.$('[data-modo-documento="pronto"]').catch(() => null)) fr = f; }
  if (!fr) return false;
  const rec = await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const r = g.result; r.ficha.pastaNome = 'Fichas e custódias'; r.ficha.nome = a.nome; st.put(r).onsuccess = () => ok2(r); }; }; }), { id: docId, nome });
  const r = await p.evaluate(a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.ficha, pacote: a.pacote }, 0), rec);
  await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const x = g.result; x.ficha.nuvem = { versao: a.v }; st.put(x).onsuccess = () => ok2(1); }; }; }), { id: docId, v: r && r.versao });
  await p.evaluate(a => { const id = S.jnAbertas.find(x => { const f = jnFr(x); return f && f.contentWindow.location.href.includes(a); }); if (id) jnTira(id); jnIr('efcwork'); }, docId); await esp(p, 300);
  return !!(r && r.ok);
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, base, { width: 1280, height: 860 });
  console.log('— A remessa de água');
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 700);
  await p.evaluate(() => agAbre('w1')); await esp(p, 600);
  await foto(p, 'pc-detalhe');
  if (HOJE) { /* foto do aviso depois de informar o envio (HOJE) */
    await p.evaluate(() => agAbre('w7')); await esp(p, 400); await p.click('#gv [data-act="ag-env"]'); await esp(p, 400);
    await p.evaluate(l => { S.fm.envio = addDias(hojeISO(), -1); S.fm.lab = l; }, LAB); await p.click('#gv [data-act="ag-env-ok"]'); await esp(p, 300); await foto(p, 'pc-aviso');
    await b.close(); srv.close(); console.log('fotos HOJE prontas'); process.exit(0);
  }
  const k = await p.evaluate(() => arLoteK(S.aguacol.find(c => c.id === 'w1')));
  const lote = await p.evaluate(kk => arColetas(kk).map(c => c.id).sort(), k);
  conf(/^agua:\d{4}-\d{2}-\d{2}\|LAB ÁGUA \(exemplo\)$/.test(k) && lote.join(',') === 'w1,w2,w3,w4', 'remessa = coletas de água do mesmo envio e laboratório, sem a cancelada e sem as de outro dia (' + k + ' → ' + lote.join(',') + ')');
  const bt = await p.evaluate(() => { const x = document.querySelector('#gv [data-act="ar-lote"]'); return x ? x.textContent.trim() : ''; });
  conf(bt === 'Ver a remessa (4 coletas)', 'o detalhe da coleta mostra "Ver a remessa (4 coletas)" (' + bt + ')');
  conf(await p.evaluate(() => { agAbre('w7'); return !document.querySelector('#gv [data-act="ar-lote"]'); }), 'coleta sem envio não mostra a remessa');
  await p.evaluate(() => agAbre('w1')); await esp(p, 400);
  await p.click('#gv [data-act="ar-lote"]'); await esp(p, 600);
  const gv = await p.evaluate(() => ({ t: (document.querySelector('#gv .gv-t, #gv h2') || {}).textContent, sub: document.querySelector('#gv').textContent.includes('Remessa de água'), kt: !!document.querySelector('#gv [data-act="kt-pap"]'), dr: !!document.querySelector('#gv .dr'), am: document.querySelectorAll('#gv .gv-lotes [data-act="ag-abre"]').length }));
  conf(gv.sub && gv.kt && gv.dr && gv.am === 4, 'a gaveta da remessa de água tem o ícone dos papéis, os Documentos da remessa e as 4 coletas (' + JSON.stringify(gv) + ')');
  await foto(p, 'pc-remessa');
  const m1 = await medeGv(p, false);
  conf(m1 && m1.rolaX <= 0 && m1.larg <= 0 && m1.baixos.length === 0 && m1.tams.length <= 6, 'gaveta no PC: nada rola para o lado, botões ≥ 28 px, até 6 tamanhos de letra (' + JSON.stringify(m1) + ')');
  console.log('— Os dados que o Cwork manda');
  const rs = await p.evaluate(kk => { const o = ptResumoEnvio(kk, { caixas: '1', amostras: '4', unid: 'matriz' }, null); return { env: o['envio.data'], lab: o['lab.nome'], fl: (o._folhas || []).map(f => [f['grupo.material'], f['grupo.analise'], f['grupo.quantidade'], f['grupo.xagua'], f['grupo.xsolo'], f['amostras[]'].length]), linha: o['amostras[]'][0], erros: EFD.pedido({ v: 1, pid: 'p00000001', docId: 'dtesteagua1', de: 'efcwork', copias: 1, criadoEm: '2026-01-01T00:00:00.000Z', dados: o, folhas: o._folhas }) }; }, k);
  conf(rs.env === k.slice(5, 15) && rs.lab === LAB, 'data do envio e laboratório da remessa de água (' + rs.env + ' · ' + rs.lab + ')');
  conf(rs.fl.length === 2 && rs.fl[0][0] === 'Água' && rs.fl[0][3] === 'X' && rs.fl[0][4] === '' && rs.fl.map(x => x[1] + ':' + x[2]).sort().join(',') === 'METAIS (exemplo):1,MICROBIOLÓGICA (exemplo):3', 'um grupo por análise, material Água com X em grupo.xagua (' + JSON.stringify(rs.fl) + ')');
  const L = rs.linha;
  conf(L && L.material === 'Água' && /^Ponto [A-D] \(exemplo\)$/.test(L.identificacao) && L.ponto === L.identificacao && /^\d{2}:\d{2}$/.test(L.hora) && L.coletor === 'Equipe B (exemplo)' && L.os === '7781' && L.analise && L.data, 'cada amostra leva data, hora, ponto, análise, coletor, O.S e material (' + JSON.stringify(L) + ')');
  conf(rs.erros.length === 0, 'o pedido com as folhas passa no conferente do contrato (' + rs.erros.join('; ') + ')');
  console.log('— Papéis deste envio (o mesmo kit do laboratório)');
  conf(await poeModelo(p, 'teste-agua.xlsx', 'Teste da água (exemplo)', 'dtesteagua1'), 'o papel de teste na nuvem do Vértice');
  await p.evaluate(async l => { await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: 'Teste da água (exemplo)', docId: 'dtesteagua1', lab: l, papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '', fonte: 'vertice', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome }); }, LAB); await esp(p, 500);
  await p.evaluate(kk => arAbreLote(kk), k); await esp(p, 400);
  await p.click('#gv [data-act="kt-pap"]'); await esp(p, 700);
  const pap = await p.evaluate(() => ({ k: S.fm && S.fm.k, sub: document.querySelector('#gv').textContent.includes('Remessa · Água · '), papeis: [...document.querySelectorAll('#gv .kt-pr b')].map(x => x.textContent), modo: !!document.querySelector('#gv [data-dd="kt:modo"]'), am: S.fm && S.fm.amostras, an: S.fm && S.fm.analise, pts: S.fm && S.fm.pontos }));
  conf(pap.k === 'ktPap' && pap.sub && pap.papeis.includes('Teste da água (exemplo)') && pap.papeis.includes('Rótulo destinatário e remetente'), 'o ícone abre "Papéis deste envio" da remessa de água com o kit do laboratório (' + JSON.stringify(pap.papeis) + ')');
  conf(pap.modo && pap.am === '4' && /MICROBIOLÓGICA/.test(pap.an) && /METAIS/.test(pap.an) && /Ponto A \(exemplo\)/.test(pap.pts), 'com 2 análises pergunta "Como preencher"; amostras, análises e pontos sugeridos (' + [pap.am, pap.an, pap.pts].join(' | ') + ')');
  conf((await alinha(p)).length === 0, 'campos lado a lado alinhados na janela (Método Sabiá)');
  await foto(p, 'pc-papeis');
  await p.evaluate(() => { S.fm.sel['__rotulo'] = false; gvDesenha(true); }); await esp(p, 300);
  const antes = vertFrs(p); await p.click('[data-act="kt-imprimir"]'); let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); fr = vertFrs(p).find(x => !antes.includes(x) && /#\/pedido\/p/.test(x.url())) || null; if (fr && !(await fr.$('[data-pedido="pronto"], [data-pedido="erro"]').catch(() => null))) fr = null; }
  conf(!!fr, 'abre o pedido no Vértice');
  if (fr) {
    const st = await fr.evaluate(() => ({ s: document.querySelector('[data-pedido]').dataset.pedido, fl: [...document.querySelectorAll('.pd-fcab span')].map(x => x.textContent), bt: document.querySelectorAll('[data-pedido-escrever]').length, t: document.body.textContent.slice(0, 300) }));
    conf(st.s === 'pronto' && st.fl.length === 2 && st.fl.every(x => /^Água · /.test(x)) && st.bt === 2, 'duas folhas de Água, uma por análise, com "Escrever nesta folha" (' + st.fl.join(' | ') + (st.s === 'erro' ? ' · ' + st.t : '') + ')');
    await esp(p, 2500); await foto(p, 'pc-pedido');
    const txt = await fr.evaluate(() => [...document.querySelectorAll('.pd-folha')].map(f => [...f.querySelectorAll('svg text')].map(x => x.textContent)));
    const iMic = st.fl.findIndex(x => /MICRO/.test(x)), mic = txt[iMic] || [];
    conf(mic.includes('Ponto A (exemplo)') && mic.includes('Equipe B (exemplo)') && mic.includes('7781') && mic.includes('torneira da frente') && mic.includes('X') && !mic.includes('Ponto D (exemplo)'), 'a folha da MICROBIOLÓGICA tem os pontos, a hora, o coletor, a O.S, a observação e o X da água, sem o ponto da outra análise');
    await fr.click('[data-pedido-escrever="' + iMic + '"]'); let doc = null;
    for (let i = 0; i < 40 && !doc; i++) { await esp(p, 250); doc = await fr.$('[data-modo-documento="pronto"]').catch(() => null); }
    conf(!!doc, '"Escrever nesta folha" abre a folha no modo documento');
    if (doc) {
      const n = await fr.evaluate(() => document.querySelectorAll('.md-campo').length);
      conf(n >= 2, 'as colunas liberadas do modelo (frasco, preservação…) ficam para escrever à mão (' + n + ' células)');
      await fr.click('.md-campo'); await fr.page().keyboard.type('Frasco 0001 (exemplo)'); await fr.page().keyboard.press('Enter'); await esp(p, 400);
      conf((await fr.evaluate(() => [...document.querySelectorAll('.md-svg text')].map(x => x.textContent))).includes('Frasco 0001 (exemplo)'), 'o que se escreve à mão entra na folha');
      await foto(p, 'pc-escrever');
    }
    await p.evaluate(() => { S.jnAbertas.slice().forEach(id => { if (id !== 'efcwork') jnTira(id); }); jnIr('efcwork'); }); await esp(p, 400);
  }
  const reg = await p.evaluate(kk => { const r = S.ktImp.find(x => x.k === kk); return r ? { id: r.id, envio: r.envio } : null; }, k);
  conf(reg && /_agua$/.test(reg.id) && reg.envio === k.slice(5, 15), 'o que saiu fica registrado na remessa de água, separado do campo (' + JSON.stringify(reg) + ')');
  conf(await p.evaluate(() => ktImpId('2026-11-20|LAB SOLO (exemplo)') === '2026-11-20_' + slugLogin('LAB SOLO (exemplo)').replace(/\./g, '-').slice(0, 60) && ktRemNome('2026-11-20|X') === '20/11/2026 · X' && remLote('2026-11-20|X').length === 0), 'a remessa do campo continua com a mesma chave e o mesmo nome');
  console.log('— Depois de informar o envio');
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 400);
  await p.evaluate(() => agAbre('w7')); await esp(p, 400);
  await p.click('#gv [data-act="ag-env"]'); await esp(p, 400);
  await p.evaluate(l => { S.fm.envio = addDias(hojeISO(), -1); S.fm.lab = l; }, LAB);
  await p.click('#gv [data-act="ag-env-ok"]'); await esp(p, 300);
  const av = await p.evaluate(() => [...document.querySelectorAll('#avisos .av')].map(x => x.textContent));
  conf(av.some(x => /Envio salvo\.Papéis/.test(x)), 'o aviso "Envio salvo." traz o botão "Papéis" (' + av.join(' | ') + ')');
  await foto(p, 'pc-aviso');
  await p.click('#avisos .av-df'); await esp(p, 600);
  conf(await p.evaluate(() => S.fm && S.fm.k === 'ktPap' && S.fm.kRem === arLoteK(S.aguacol.find(c => c.id === 'w7'))), '"Papéis" abre os papéis da remessa daquela coleta');
  await p.evaluate(() => history.back()); await esp(p, 400);
  conf(p._er.length === 0, 'sem erro de JavaScript (PC)' + (p._er.length ? ' (' + p._er.slice(0, 3).join(' | ') + ')' : ''));
  console.log('— Celular 390');
  const c = await abre(b, base, { width: 390, height: 844 });
  await c.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(c, 700);
  await c.evaluate(() => agAbre('w1')); await esp(c, 600); await foto(c, 'cel-detalhe');
  await c.click('#gv [data-act="ar-lote"]'); await esp(c, 600); await foto(c, 'cel-remessa');
  const m2 = await medeGv(c, true);
  conf(m2 && m2.rolaX <= 0 && m2.larg <= 0 && m2.baixos.length === 0 && m2.tams.length <= 6, 'gaveta no celular: nada rola para o lado, toques iguais aos da remessa do campo (≥ 36 px), até 6 tamanhos de letra (' + JSON.stringify(m2) + ')');
  await c.click('#gv [data-act="kt-pap"]'); await esp(c, 700);
  conf((await alinha(c)).length === 0, 'janela dos papéis alinhada no celular');
  await foto(c, 'cel-papeis');
  /* tema Escuro (auditoria visual): a gaveta da remessa no PC */
  await p.evaluate(kk => { csTrocaTema('escuro'); arAbreLote(kk); }, k); await esp(p, 600); await foto(p, 'pc-remessa-escuro');
  const m3 = await medeGv(p, false);
  conf(m3 && m3.rolaX <= 0 && m3.baixos.length === 0, 'gaveta no tema Escuro sem rolagem lateral e com os botões do tamanho certo');
  conf(c._er.length === 0, 'sem erro de JavaScript (celular)' + (c._er.length ? ' (' + c._er.slice(0, 3).join(' | ') + ')' : ''));
  await b.close(); srv.close();
  console.log(`\n${ok} ok, ${falhas} falha(s)`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
