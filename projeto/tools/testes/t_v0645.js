/* EFCwork v0.6.45 + Vértice v0.6.80 · fichas e cadeias com todos os dados (dicionário 2): uma folha por material + análise,
   cada uma só com as amostras dela, e a folha abre preenchida para escrever à mão. Modelo de TESTE com marca d'água.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0645.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const AM = path.join(RAIZ, 'tools/visual/v0645/amostras') /* modelos de TESTE com marca d'água; nenhum documento inventado */, T = process.env.TELAS || '';
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
const foto = async (p, nome) => { if (T) { fs.mkdirSync(T, { recursive: true }); await esp(p, 250); await p.screenshot({ path: path.join(T, nome + '.png') }); } };
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await esp(p, 200); };
/* auditoria do Método Sabiá: campos lado a lado alinhados (mesma linha, altura, rótulos; no celular, mesma largura) */
const alinha = p => p.evaluate(() => { const ruins = [];
  document.querySelectorAll('#gv .fm-g').forEach(g => { const cs = [...g.children].filter(c => c.classList.contains('fm-c')); if (cs.length < 2) return;
    const cx = cs.map(c => c.querySelector('.fm-i, .dd-b, .fm-passo')).filter(Boolean).map(e => e.getBoundingClientRect()); if (cx.length < 2) return;
    const alt = cx.every(b => Math.abs(b.height - cx[0].height) < 1.5), lin = cx.filter(b => Math.abs(b.top - cx[0].top) < 1.5), larg = innerWidth > 600 || lin.every(b => Math.abs(b.width - lin[0].width) < 2);
    const rot = cs.map(c => c.querySelector('.fm-r')).filter(Boolean).map(e => Math.round(e.getBoundingClientRect().height));
    if (!(alt && lin.length === cx.length || innerWidth <= 600) || !larg || !rot.every(h => h === rot[0])) ruins.push(cs.map(c => (c.querySelector('.fm-r') || {}).textContent).join(' | ')); });
  return ruins; });

async function abre(b, base, vp, extra) {
  const ctx = await b.newContext(Object.assign({ viewport: vp, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true }, extra || {})), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  /* dados fictícios (modo demonstração) */
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), h = hojeISO(), d = n => addDias(h, n);
    await C('sv2_cfg').set('coletas', { etiqueta: { empresa: 'Empresa (exemplo)', local: 'Local (exemplo)' }, labs: ['LAB SOLO (exemplo)', 'LAB FRUTA (exemplo)'], fazendas: [{ prefixo: 'RU', nome: 'Fazenda (exemplo)', unidade: 'matriz' }], tipos: [{ nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4 }] });
    const Tl = (id, o) => C('sv2_talhoes').set(id, Object.assign({ pivo: 'Pivô 2', cultura: 'MAMÃO', variedade: 'FORMOSA', ativo: true, hectares: 4 }, o));
    await Tl('t1', { codigo: 'RU11FOR24' }); await Tl('t2', { codigo: 'RU12FOR24' }); await Tl('t3', { codigo: 'RU13FOR24' });
    const K = (id, o) => C('sv2_coletas').set(id, Object.assign({ situacao: 'ativa', analiseNome: 'SOLO COMPLETO', lab: 'LAB SOLO (exemplo)', coletor: 'Equipe A (exemplo)', criadoEm: nowISO(), criadoPor: S.user.id }, o));
    for (let i = 0; i < 13; i++) await K('s' + i, { tipo: 'SOLO', data: d(-2), talhao: ['RU11FOR24', 'RU12FOR24', 'RU13FOR24'][i % 3], prof: i % 2 ? '20-40' : '0-20', estadio: 'FLORAÇÃO' });
    await K('f1', { tipo: 'FOLHA', data: d(-3), talhao: 'RU11FOR24', analiseNome: 'FOLIAR' });
    await K('r1', { tipo: 'FRUTA', data: d(-1), talhao: 'RU12FOR24', analiseNome: 'RESÍDUOS', lab: 'LAB FRUTA (exemplo)', maturacao: 'MADURO', hora: '08:30', rastreabilidade: 'LT-0042', os: '0457' });
    await K('r2', { tipo: 'FRUTA', data: d(-1), talhao: 'RU13FOR24', analiseNome: 'RESÍDUOS', lab: 'LAB FRUTA (exemplo)', maturacao: 'MADURO', hora: '09:10', rastreabilidade: 'LT-0043', os: '0457' });
    await K('v1', { tipo: 'SOLO', data: d(-40), talhao: 'RU13FOR24', enviado: true, envio: d(-4), os: '1234' });
    await K('v2', { tipo: 'SOLO', data: d(-39), talhao: 'RU11FOR24', enviado: true, envio: d(-4), os: '1234' });
  });
  await esp(p, 400);
  return p;
}
const vertFrs = p => p.frames().filter(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
/* põe um modelo no Vértice (caixa do aparelho), na pasta Etiquetas, e na nuvem do Cwork (como a etapa 1 faz sozinha) */
async function poeModelo(p, arquivo, nome, docId) {
  const b64 = fs.readFileSync(path.join(AM, arquivo)).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: a.nome + '.xlsx', docId: a.docId }); jnAbrir('docs', '#/abrir/' + pid, true); }, { b64, nome, docId });
  let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); for (const f of vertFrs(p)) if (f.url().includes('#/documento/' + docId) && await f.$('[data-modo-documento="pronto"]').catch(() => null)) fr = f; }
  if (!fr) return false;
  if (docId === 'detqfruta01') { await esp(p, 2500); await foto(p, 'pc-imagem-impressa'); }
  const rec = await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const r = g.result; r.ficha.pastaNome = 'Fichas e custódias'; r.ficha.nome = a.nome; st.put(r).onsuccess = () => ok2(r); }; }; }), { id: docId, nome });
  const r = await p.evaluate(a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.ficha, pacote: a.pacote }, 0), rec);
  /* o aparelho fica sabendo que esta versão já está na nuvem (como depois da sincronia da etapa 1) e a aba de preparo sai */
  await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const x = g.result; x.ficha.nuvem = { versao: a.v }; st.put(x).onsuccess = () => ok2(1); }; }; }), { id: docId, v: r && r.versao });
  await p.evaluate(a => { const id = S.jnAbertas.find(x => { const f = jnFr(x); return f && f.contentWindow.location.href.includes(a); }); if (id) jnTira(id); jnIr('efcwork'); }, docId); await esp(p, 300);
  return !!(r && r.ok);
}
async function abaEtiquetas(p, antes) {
  for (let i = 0; i < 80; i++) { await esp(p, 250); const f = vertFrs(p).find(x => /#\/pedido\/et/.test(x.url()) && !antes.includes(x)); if (f && await f.$('[data-etiquetas="pronto"], [data-etiquetas="vazio"], [data-etiquetas="sem-pedido"]').catch(() => null)) { await esp(p, 400); return f; } }
  return null;
}
/* auditoria visual (skill auditoria-visual-efc) da tela das etiquetas no Vértice: botões, tamanhos de letra, nada rola para o lado */
const medeVt = (fr, cel) => fr.evaluate(c => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const bts = [...document.querySelectorAll('.md-et button, .md-et input:not([type=checkbox]), .md-et .et-am')].filter(vis).map(e => Math.round(e.getBoundingClientRect().height)).filter(h => h < (c ? 44 : 36));
  const tams = new Set(); document.querySelectorAll('.md-et *:not(svg *)').forEach(e => { if (!vis(e) || e.closest('.md-svg')) return; if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) tams.add(getComputedStyle(e).fontSize); });
  return { baixos: bts, tams: [...tams], rolaX: document.documentElement.scrollWidth - innerWidth }; }, cel);
const svgTxt = fr => fr.evaluate(() => [...document.querySelectorAll('.md-svg text')].map(x => x.textContent));
const quadro = fr => fr.evaluate(() => ({ folhas: document.querySelectorAll('.md-folha').length, conta: (document.querySelector('[data-et-conta]') || {}).textContent, grupos: [...document.querySelectorAll('[data-et-grupo] .et-gcab b')].map(x => x.textContent),
  bts: [...document.querySelectorAll('.md-barra button')].filter(x => x.offsetParent).map(x => x.getAttribute('aria-label') || x.textContent.trim()), menus: document.querySelectorAll('.menu, .rb, nav').length, rolaX: document.documentElement.scrollWidth - innerWidth }));

(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, base, { width: 1280, height: 860 });
  const LAB = 'LAB SOLO (exemplo)';
  await p.evaluate(async l => {
    const cf = S.cfgCol, d = n => addDias(hojeISO(), n);
    await Data.col('sv2_cfg').set('coletas', Object.assign({}, cf, { labInfo: { [l]: { nome: l, end: 'Rua (exemplo), 1', cidade: 'Cidade', uf: 'CE' } } }));
    const K = (id, o) => Data.col('sv2_coletas').set(id, Object.assign({ situacao: 'ativa', lab: l, coletor: 'Equipe A (exemplo)', criadoEm: nowISO(), criadoPor: S.user.id, tipo: 'SOLO', data: d(-8), enviado: true, envio: d(-6), os: '0457' }, o));
    for (let i = 0; i < 4; i++) await K('g' + i, { talhao: 'RU6' + i, analiseNome: 'FISICOQUIMICA - (QUÍMICA + TEXTURA)', prof: '0-20' });
    for (let i = 0; i < 2; i++) await K('h' + i, { talhao: 'RU42' + i, analiseNome: 'QUÍMICA + CLORO', prof: '20-40', hora: '09:1' + i });
  }, LAB); await esp(p, 400);
  console.log('— O papel no Vértice (modelo de TESTE com marca d\'água) e no kit');
  conf(await poeModelo(p, 'teste-grupos.xlsx', 'Teste de grupos (exemplo)', 'dtestegrp01'), 'o papel na nuvem do Vértice');
  await p.evaluate(async l => { await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: 'Teste de grupos (exemplo)', docId: 'dtestegrp01', lab: l, papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '', fonte: 'vertice', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome }); }, LAB); await esp(p, 500);
  if (T) { /* foto do painel Campos do Cwork com o modelo de teste */
    await p.evaluate(() => jnAbrir('docs', '#/arq/dtestegrp01', true)); await esp(p, 3000);
    const fa = vertFrs(p).find(f => f.url().includes('#/arq/dtestegrp01'));
    if (fa) { await fa.evaluate(() => { const t = [...document.querySelectorAll('[role=tab], button')].find(x => x.textContent.trim() === 'Arquivo'); if (t) t.click(); }); await esp(p, 300);
      await fa.evaluate(() => { const b2 = document.querySelector('[data-cmd="arquivo.camposCwork"]'); if (b2) b2.click(); }); await esp(p, 800);
      await fa.evaluate(() => { const g = [...document.querySelectorAll('.pc-grupo')].find(x => /Análise da folha/.test(x.textContent)); if (g) g.scrollIntoView({ block: 'start' }); }); await esp(p, 300);
      await foto(p, 'pc-campos-grupo'); }
    await p.evaluate(() => { const id = S.jnAbertas.find(x => { const f = jnFr(x); return f && f.contentWindow.location.href.includes('#/arq/dtestegrp01'); }); if (id) jnTira(id); jnIr('efcwork'); }); await esp(p, 400);
  }
  console.log('— Os dados que o Cwork manda');
  const k = await p.evaluate(() => coLoteK(S.coletas.find(c => c.id === 'g0')));
  const rs = await p.evaluate(kk => { const o = ptResumoEnvio(kk, { caixas: '1', amostras: '6', unid: 'matriz' }, null); return { fl: (o._folhas || []).map(f => [f['grupo.material'], f['grupo.analise'], f['grupo.quantidade'], f['grupo.xsolo'], f['amostras[]'].length, f['amostras[]'][0].profundidade, f['amostras[]'][0].n]), linha: o['amostras[]'][0], erros: EFD.pedido({ v: 1, pid: 'p00000001', docId: 'dtestegrp01', de: 'efcwork', copias: 1, criadoEm: '2026-01-01T00:00:00.000Z', dados: o, folhas: o._folhas }) }; }, k);
  conf(rs.fl.length === 2 && rs.fl[0][1] === 'FISICOQUIMICA - (QUÍMICA + TEXTURA)' && rs.fl[0][2] === 4 && rs.fl[0][3] === 'X' && rs.fl[0][4] === 4 && rs.fl[1][2] === 2 && rs.fl[1][4] === 2 && rs.fl[1][5] === '20-40' && rs.fl[1][6] === 1, 'dois grupos (material + análise), cada um com a quantidade, o X do material e só as amostras dele, numeradas de novo (' + JSON.stringify(rs.fl) + ')');
  conf(rs.linha.material === 'Solo' && rs.linha.profundidade === '0-20' && rs.linha.coletor === 'Equipe A (exemplo)' && rs.linha.os === '0457' && !('_id' in rs.linha), 'cada amostra leva material, profundidade, coletor e O.S (' + JSON.stringify(rs.linha) + ')');
  conf(rs.erros.length === 0, 'o pedido com as folhas passa no conferente do contrato (' + rs.erros.join('; ') + ')');
  console.log('— Papéis do envio → Vértice: uma folha por análise');
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 500);
  await p.evaluate(kk => ktPapAbre([kk]), k); await esp(p, 600);
  await p.evaluate(() => { S.fm.sel['__rotulo'] = false; gvDesenha(true); }); await esp(p, 300);
  conf(await p.evaluate(() => !!document.querySelector('#gv [data-dd="kt:modo"]') && /Uma ficha por análise \(2 fichas\)/.test(document.querySelector('#gv [data-dd="kt:modo"]').textContent)), 'ITEM 285: com 2 análises a janela pergunta "Como preencher" (padrão: uma ficha por análise)');
  await foto(p, 'pc-como-preencher');
  const uni = await p.evaluate(kk => { const o = ptResumoEnvio(kk, { caixas: '1', amostras: '6', unid: 'matriz' }, null); return [o['grupo.quantidade'], o['grupo.analise'], o['grupo.xsolo']]; }, k);
  conf(uni[0] === 6 && uni[1] === 'FISICOQUIMICA - (QUÍMICA + TEXTURA) + QUÍMICA + CLORO' && uni[2] === 'X', '"Tudo numa ficha só" leva a quantidade total e as análises juntas (' + uni.join(' | ') + ')');
  const antes = vertFrs(p); await p.click('[data-act="kt-imprimir"]'); let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); fr = vertFrs(p).find(x => !antes.includes(x) && /#\/pedido\/p/.test(x.url())) || null; if (fr && !(await fr.$('[data-pedido="pronto"], [data-pedido="erro"]').catch(() => null))) fr = null; }
  conf(!!fr, 'abre o pedido no Vértice');
  if (fr) {
    const st = await fr.evaluate(() => ({ s: document.querySelector('[data-pedido]').dataset.pedido, fl: [...document.querySelectorAll('.pd-fcab span')].map(x => x.textContent), bt: document.querySelectorAll('[data-pedido-escrever]').length, sub: (document.querySelector('.pd-sub') || {}).textContent, t: document.body.textContent.slice(0, 300) }));
    conf(st.s === 'pronto' && st.fl.join(' | ') === 'Solo · FISICOQUIMICA - (QUÍMICA + TEXTURA) | Solo · QUÍMICA + CLORO' && st.bt === 2, 'duas folhas, cada uma com o título do grupo e "Escrever nesta folha" (' + st.fl.join(' | ') + ' · ' + st.sub + (st.s === 'erro' ? ' · ' + st.t : '') + ')');
    await esp(p, 2500); await foto(p, 'pc-pedido-folhas');
    const txt = await fr.evaluate(() => [...document.querySelectorAll('.pd-folha')].map(f => [...f.querySelectorAll('svg text')].map(x => x.textContent)));
    conf(txt[1] && txt[1].includes('QUÍMICA + CLORO') && txt[1].includes('20-40') && !txt[1].includes('RU62') && txt[0].includes('RU63'), 'a segunda folha só tem as amostras de QUÍMICA + CLORO');
    console.log('— Escrever à mão na folha 2');
    await fr.click('[data-pedido-escrever="1"]'); let doc = null;
    for (let i = 0; i < 40 && !doc; i++) { await esp(p, 250); doc = await fr.$('[data-modo-documento="pronto"]').catch(() => null); }
    conf(!!doc, 'abre a folha no modo documento');
    if (doc) {
      const m = await fr.evaluate(() => ({ svg: [...document.querySelectorAll('.md-svg text')].map(x => x.textContent), campos: document.querySelectorAll('.md-campo').length }));
      conf(m.svg.includes('QUÍMICA + CLORO') && m.svg.includes('2') && m.campos >= 1, 'a folha vem preenchida (grupo 2) e tem a célula liberada para escrever (' + m.campos + ')');
      await fr.click('.md-campo'); await fr.page().keyboard.type('Frasco 14431103 (exemplo)'); await fr.page().keyboard.press('Enter'); await esp(p, 400);
      conf((await fr.evaluate(() => [...document.querySelectorAll('.md-svg text')].map(x => x.textContent))).includes('Frasco 14431103 (exemplo)'), 'o que se escreve à mão entra na folha preenchida');
      await foto(p, 'pc-folha-escrever');
      const g = await fr.evaluate(() => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readonly').objectStore('arquivos').get('dtestegrp01'); t.onsuccess = () => ok2(JSON.stringify(t.result.conteudo || t.result.pacote || '')); }; }));
      conf(!/QUÍMICA \+ CLORO|Frasco 14431103/.test(g), 'o modelo guardado não muda');
    }
  }
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ' (' + p._er.slice(0, 3).join(' | ') + ')' : ''));
  await b.close(); srv.close();
  console.log(`\n${ok} ok, ${falhas} falha(s)`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
