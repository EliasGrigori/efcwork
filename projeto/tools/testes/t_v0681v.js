/* Vértice v0.6.81 visto pelo Cwork (o Cwork não muda: segue v0.6.46) · as sobras da integração (decisões do Elias de 27/11 19:0x):
   (1) o pedido do Cwork imprime só a aba com campos; (2) "Recebidos do Cwork" com aviso e Mover; (3) o Vértice segue o tema do Cwork
   e, no Escuro, a área de preencher fica branca (Aparência › Área de trabalho escura); (4) imprimir pela folha aberta marca "Preenchido".
   Modelos de TESTE com marca d'água. Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0681v.js
   EFC_DIST=<pasta do Cwork> e VERTICE_DIR=<pasta do Vértice> publicados tiram as fotos HOJE (sem as conferências). */
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
  console.log('— (1) O pedido imprime só a aba com campos');
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 600);
  conf(await poeModelo(p, 'v0681/amostras/teste-duas-abas.xlsx', 'Teste duas abas (exemplo)', 'dduasabas01', 'Fichas e custódias'), 'o modelo de teste (aba de instruções + aba dos campos) na nuvem do Vértice');
  await p.evaluate(async l => { await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: 'Teste duas abas (exemplo)', docId: 'dduasabas01', lab: l, papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '', fonte: 'vertice', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome }); }, LAB); await esp(p, 500);
  const k = await p.evaluate(() => coLoteK(S.coletas.find(c => c.id === 'g0')));
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 500);
  await p.evaluate(kk => ktPapAbre([kk]), k); await esp(p, 600);
  await p.evaluate(() => { S.fm.sel['__rotulo'] = false; gvDesenha(true); }); await esp(p, 300);
  let antes = vertFrs(p); await p.click('[data-act="kt-imprimir"]');
  let fr = await espFr(p, async f => !antes.includes(f) && /#\/pedido\/p/.test(f.url()) && !!(await f.$('[data-pedido="pronto"], [data-pedido="erro"]')));
  conf(!!fr, 'abre o pedido no Vértice');
  if (fr) {
    await esp(p, 2000);
    const pg = await fr.evaluate(() => ({ sub: (document.querySelector('.pd-sub') || document.body).textContent.slice(0, 160), n: document.querySelectorAll('.pd-folha svg, .pd-pag svg, .md-svg').length }));
    conf(/1 página/.test(pg.sub), 'sai 1 página: a aba "Instruções (exemplo)" não sai (' + pg.sub + ')');
    await foto(p, 'pc-pedido-abas');
    console.log('— (4) Imprimir pela folha aberta marca "Preenchido no Vértice"');
    await fr.click('[data-pedido-escrever]'); let doc = null;
    for (let i = 0; i < 40 && !doc; i++) { await esp(p, 250); doc = await fr.$('[data-modo-documento="pronto"]').catch(() => null); }
    conf(!!doc, '"Escrever" abre a folha');
    if (doc) {
      const tx = await fr.evaluate(() => [...document.querySelectorAll('.md-svg text')].map(x => x.textContent));
      conf(!tx.some(x => /Aba de instruções/.test(x)), 'a folha aberta é a aba dos campos (não a de instruções)');
      await fr.click('[data-md-imprimir]'); await esp(p, 2500);
      const sit = await p.evaluate(kk => { const x = drItens(kk).find(y => y.docId === 'dduasabas01'); return x ? drSit(kk, x).t : ''; }, k);
      conf(sit === 'Preenchido no Vértice', 'o papel da remessa fica "Preenchido no Vértice" (' + sit + ')');
      conf(await p.evaluate(async () => (await EFDPonte.esperando('docs')).filter(i => i.tipo === 'pedido').length === 0), 'pedido de uma folha sai da caixa depois de imprimir (o Vértice não fica dizendo "O Cwork pediu para imprimir")');
    }
    await fechaVertices(p); await esp(p, 300);
    await p.evaluate(kk => coAbreLote(kk), k); await esp(p, 600); await foto(p, 'pc-remessa-preenchido');
    await p.evaluate(() => history.back()); await esp(p, 300);
  }
  console.log('— (2) Recebidos do Cwork: aviso e Mover');
  await poeModelo(p, 'v0645/amostras/teste-grupos.xlsx', 'Teste recebido (exemplo)', 'drecebido01', '');
  await p.evaluate(() => jnAbrir('docs', '#/internos', true));
  fr = await espFr(p, async f => /#\/internos/.test(f.url()) && !!(await f.$('[data-int-sub]')));
  conf(!!fr, 'abre Documentos internos no Vértice');
  if (fr) {
    await fr.click('[data-int-sub="Recebidos do Cwork"]'); await esp(p, 500);
    const r = await fr.evaluate(() => ({ aviso: (document.querySelector('[data-int-receb]') || {}).textContent || '', mover: document.querySelectorAll('[data-int-mover]').length }));
    conf(/Mova cada um para uma das 5 pastas/.test(r.aviso) && r.mover >= 1, 'aviso e botão Mover em Recebidos do Cwork (' + r.mover + ' botões)');
    await foto(p, 'pc-recebidos');
    if (r.mover) {
      await fr.click('[data-int-mover="drecebido01"]'); await esp(p, 500);
      const sel = await fr.evaluate(() => (document.querySelector('[data-int-subaba]') || {}).value);
      conf(sel === 'Fichas e custódias', 'a janela começa numa das 5 pastas (' + sel + ')');
      await foto(p, 'pc-mover');
      await fr.click('[data-int-salvar]'); await esp(p, 1000);
      const pasta = await fr.evaluate(() => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const g = q.result.transaction('arquivos', 'readonly').objectStore('arquivos').get('drecebido01'); g.onsuccess = () => ok2(g.result.ficha.pastaNome); }; }));
      conf(pasta === 'Fichas e custódias', 'movido para Fichas e custódias (sobe para a nuvem com as outras)');
    }
    await fechaVertices(p); await esp(p, 300);
  }
  console.log('— (3) Tema: o Vértice segue o Cwork; no Escuro a planilha fica branca');
  await p.evaluate(() => csTrocaTema('escuro')); await esp(p, 300);
  await p.evaluate(() => jnAbrir('docs', '#/arq/dduasabas01', true));
  fr = await espFr(p, async f => /#\/arq\/dduasabas01/.test(f.url()) && !!(await f.$('.sup-planilha')));
  conf(!!fr, 'abre a planilha no Vértice (tela inteira)');
  if (fr) {
    await esp(p, 1500);
    const t1 = await fr.evaluate(() => ({ tema: document.body.dataset.theme, clara: !!document.querySelector('.sup-planilha.clara') }));
    conf(t1.tema === 'dark' && t1.clara, 'Cwork no Escuro: o Vértice fica Escuro e a planilha branca como no Excel (' + JSON.stringify(t1) + ')');
    await foto(p, 'pc-tema-escuro');
    await p.evaluate(() => csTrocaTema('claro')); await esp(p, 800);
    conf(await fr.evaluate(() => document.body.dataset.theme) === 'papel', 'trocar o tema no Cwork troca o Vértice junto');
    await p.evaluate(() => csTrocaTema('escuro')); await esp(p, 800);
    /* Opções (engrenagem) › Tema › Área de trabalho escura no tema escuro */
    await fr.evaluate(() => { const g = [...document.querySelectorAll('button')].find(x => /Opções/.test(x.getAttribute('aria-label') || x.title || '')); if (g) g.click(); }); await esp(p, 600);
    await fr.evaluate(() => { const s2 = document.querySelector('[data-op-area-escura]'); if (!s2) { const t = [...document.querySelectorAll('button')].find(x => /^Tema/.test(x.textContent.trim())); if (t) t.click(); } }); await esp(p, 400);
    await foto(p, 'pc-opcoes-area');
    const liga = await fr.evaluate(() => { const s2 = document.querySelector('[data-op-area-escura]'); if (s2) { s2.click(); return true; } return false; });
    await esp(p, 800);
    const t2 = await fr.evaluate(() => ({ escura: document.body.classList.contains('area-escura'), clara: !!document.querySelector('.sup-planilha.clara') }));
    conf(liga && t2.escura && !t2.clara, 'Aparência › Área de trabalho escura deixa a planilha escura (' + JSON.stringify(t2) + ')');
    await foto(p, 'pc-tema-area-escura');
    await fr.evaluate(() => { const s2 = document.querySelector('[data-op-area-escura]'); if (s2) s2.click(); }); await esp(p, 500);
    await fr.page().keyboard.press('Escape'); await esp(p, 300);
    /* o quadro no tema escuro: área clara */
    await fr.evaluate(() => { const b2 = [...document.querySelectorAll('button, [role=button], input')].find(x => /O que você quer fazer/.test(x.textContent || x.placeholder || x.getAttribute('aria-label') || '')); if (b2) { b2.click(); b2.focus(); } }); await esp(p, 400);
    await fr.page().keyboard.type('Novo quadro de post-its'); await esp(p, 600); await fr.page().keyboard.press('Enter'); await esp(p, 600);
    if (await fr.$('.janela input, [role=dialog] input').catch(() => null)) await fr.page().keyboard.press('Enter'); /* nome do quadro: o padrão */
    let q = null; for (let i = 0; i < 30 && !q; i++) { await esp(p, 300); q = await fr.$('.qd-area').catch(() => null); }
    if (q) { await esp(p, 800); const qa = await fr.evaluate(() => getComputedStyle(document.querySelector('.qd-area')).backgroundColor); conf(/255, 255, 255/.test(qa), 'o quadro no tema escuro fica com a área branca (' + qa + ')'); await foto(p, 'pc-quadro-escuro'); }
    else conf(HOJE, 'abre um quadro novo no Vértice');
    await fechaVertices(p);
  }
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ' (' + p._er.slice(0, 3).join(' | ') + ')' : ''));
  await b.close(); srv.close();
  if (HOJE) console.log('fotos HOJE prontas');
  console.log(`\n${ok} ok, ${falhas} falha(s)`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
