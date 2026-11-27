/* EFCwork v0.6.44 + Vértice v0.6.79 · etapa 4: o kit do laboratório com papéis direto do Vértice, até 2 de custódia ou ficha.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0644.js */
/* (helpers copiados do t_v0643) EFCwork v0.6.43 + Vértice v0.6.78 · etapa 3: etiquetas das amostras automáticas, feitas no Vértice.
   Os modelos são planilhas da pasta Etiquetas do Vértice (dois modelos de TESTE em tools/visual/v0643/amostras, copiados do
   desenho do EFClaudian e marcados "(exemplo)", com autorização do Elias). O Cwork liga material (+ laboratório) ao modelo
   e manda os dados de cada amostra pela porta; o Vértice repete a etiqueta na folha. Nada é gravado.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0643.js
   TELAS=pasta tira as fotos da página de aprovação. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const AM = path.join(RAIZ, 'tools/visual/v0643/amostras') /* modelos de TESTE com marca d'água; nenhum documento inventado */, T = process.env.TELAS || '';
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
  const rec = await fr.evaluate(a => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'), g = st.get(a.id); g.onsuccess = () => { const r = g.result; r.ficha.pastaNome = 'Etiquetas'; r.ficha.nome = a.nome; st.put(r).onsuccess = () => ok2(r); }; }; }), { id: docId, nome });
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
  await p.evaluate(async () => { const cf = S.cfgCol; await Data.col('sv2_cfg').set('coletas', Object.assign({}, cf, { labInfo: { 'LAB SOLO (exemplo)': { nome: 'LAB SOLO (exemplo)', end: 'Rua (exemplo), 1', cidade: 'Cidade', uf: 'CE' } } })); });
  console.log('— Os papéis no Vértice (modelos de TESTE, com marca d\'água)');
  conf(await poeModelo(p, 'etiqueta-fruta.xlsx', 'Etiqueta Fruta completa (exemplo)', 'detqfruta01'), 'um papel na nuvem do Vértice');
  conf(await poeModelo(p, 'etiqueta-solo.xlsx', 'Etiqueta Solo (exemplo)', 'detqsolo01'), 'outro papel na nuvem do Vértice');
  const LAB = 'LAB SOLO (exemplo)';
  console.log('— Kit: anexar do Vértice, até 2');
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await esp(p, 600);
  await p.evaluate(l => ktAbreLab(l), LAB); await esp(p, 1200);
  await foto(p, 'pc-kit-antes');
  await p.click('#gv [data-act="kt-anexar"]'); await esp(p, 900);
  const ops = await p.evaluate(() => [...document.querySelectorAll('[data-dd="kt:doc"] li')].map(x => x.textContent));
  conf(ops.some(x => /^Vértice · Etiquetas · Etiqueta Fruta completa/.test(x)) && ops.some(x => /^Vértice · Etiquetas · Etiqueta Solo/.test(x)), 'a lista mostra os papéis do Vértice com a pasta (' + ops.slice(1).join(' | ') + ')');
  conf((await alinha(p)).length === 0, 'formulário alinhado');
  await dd(p, 'kt:doc', 'Etiqueta Fruta completa (exemplo)'); await foto(p, 'pc-kit-anexar');
  await p.click('[data-act="kt-anexar-ok"]'); await esp(p, 900);
  let kit = await p.evaluate(l => S.ktKit.filter(x => x.lab === l && x.ativo !== false).map(x => x.docId + '|' + (x.fonte || '') + '|' + x.papel), LAB);
  conf(kit.join() === 'detqfruta01|vertice|doc', 'grava só a ligação, com fonte "vertice" (' + kit.join() + ')');
  await p.evaluate(l => ktAbreLab(l), LAB); await esp(p, 600);
  await p.click('#gv [data-act="kt-anexar"]'); await esp(p, 700);
  conf(/Fica junto de/.test(await p.evaluate(() => document.querySelector('#gv').textContent)), 'o segundo papel avisa que fica junto do primeiro');
  await dd(p, 'kt:doc', 'Etiqueta Solo (exemplo)'); await p.click('[data-act="kt-anexar-ok"]'); await esp(p, 900);
  kit = await p.evaluate(l => S.ktKit.filter(x => x.lab === l && x.ativo !== false && x.papel === 'doc').length, LAB);
  conf(kit === 2, 'dois papéis de custódia ou ficha no mesmo laboratório');
  await p.evaluate(l => ktAbreLab(l), LAB); await esp(p, 700);
  const gv = await p.evaluate(() => ({ t: document.querySelector('#gv').textContent, anexar: !!document.querySelector('#gv [data-act="kt-anexar"]') }));
  conf(/Vértice · Etiquetas/.test(gv.t), 'a gaveta do laboratório diz que o papel vem do Vértice');
  await foto(p, 'pc-kit-dois');
  await p.evaluate(l => lcAbrir({ k: 'ktAnexar', lab: l, docId: 'detqsolo01', papel: 'doc' }), LAB); await esp(p, 500);
  conf(/já tem 2/.test(await p.evaluate(() => document.querySelector('#gv').textContent)), 'um terceiro: avisa que já tem 2 e pede para tirar um');
  await p.click('[data-act="kt-anexar-ok"]').catch(() => {}); await esp(p, 400);
  conf(await p.evaluate(l => S.ktKit.filter(x => x.lab === l && x.ativo !== false && x.papel === 'doc').length, LAB) === 2, 'e não grava o terceiro');
  await p.keyboard.press('Escape'); await esp(p, 300); if (await p.$('#cf')) { await p.click('#cf .bt.pr').catch(() => {}); await esp(p, 300); }
  console.log('— Papéis deste envio: abre no Vértice');
  const k = await p.evaluate(() => coLoteK(S.coletas.find(c => c.id === 'v1')));
  await p.evaluate(kk => ktPapAbre([kk]), k); await esp(p, 600);
  const pap = await p.evaluate(() => [...document.querySelectorAll('#gv .kt-pr small')].map(x => x.textContent));
  conf(pap.filter(x => /abre no Vértice já preenchido/.test(x)).length === 2, 'os dois papéis do Vértice: "abre no Vértice já preenchido" (' + pap.join(' | ') + ')');
  await foto(p, 'pc-papeis-envio');
  await p.evaluate(() => { S.fm.sel['__rotulo'] = false; const d = S.fm; const id2 = ktPapItens(d.kRem).find(x => x.docId === 'detqsolo01').id; d.sel[id2] = false; gvDesenha(true); }); await esp(p, 300);
  const antes = vertFrs(p);
  await p.click('[data-act="kt-imprimir"]'); let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); fr = vertFrs(p).find(x => !antes.includes(x) && /#\/pedido\/p/.test(x.url())) || null; if (fr && !(await fr.$('[data-pedido="pronto"], [data-pedido="erro"]').catch(() => null))) fr = null; }
  conf(!!fr, 'abre o pedido no Vértice');
  if (fr) { const st = await fr.evaluate(() => ({ s: document.querySelector('[data-pedido]').dataset.pedido, t: document.body.textContent }));
    conf(st.s === 'pronto', 'o Vértice aceitou o pedido (só os campos que o documento marca) e montou a folha (' + st.s + (st.s === 'erro' ? ': ' + st.t.slice(0, 160) : '') + ')');
    await foto(p, 'pc-pedido-vertice'); }
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ' (' + p._er.slice(0, 3).join(' | ') + ')' : ''));
  await b.close(); srv.close();
  console.log(`\n${ok} ok, ${falhas} falha(s)`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
