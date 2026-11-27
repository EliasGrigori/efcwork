/* EFCwork v0.6.43 + Vértice v0.6.78 · etapa 3: etiquetas das amostras automáticas, feitas no Vértice.
   Os modelos são planilhas da pasta Etiquetas do Vértice (dois modelos de TESTE em tools/visual/v0643/amostras, copiados do
   desenho do EFClaudian e marcados "(exemplo)", com autorização do Elias). O Cwork liga material (+ laboratório) ao modelo
   e manda os dados de cada amostra pela porta; o Vértice repete a etiqueta na folha. Nada é gravado.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0643.js
   TELAS=pasta tira as fotos da página de aprovação. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const AM = path.join(RAIZ, 'tools/visual/v0643/amostras'), T = process.env.TELAS || '';
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

  console.log('— Os modelos (pasta Etiquetas do Vértice)');
  conf(await poeModelo(p, 'etiqueta-solo.xlsx', 'Etiqueta Solo (exemplo)', 'detqsolo01'), 'modelo de Solo no Vértice, pasta Etiquetas, e na nuvem');
  conf(await poeModelo(p, 'etiqueta-fruta.xlsx', 'Etiqueta Fruta completa (exemplo)', 'detqfruta01'), 'modelo de Fruta no Vértice, pasta Etiquetas, e na nuvem');

  console.log('— O Vértice: Campos do Cwork › Etiqueta da amostra');
  { await p.evaluate(() => jnAbrir('docs', '#/arq/detqsolo01', true)); await esp(p, 2500);
    const fr = vertFrs(p).find(f => f.url().includes('detqsolo01'));
    await fr.evaluate(() => { const t = [...document.querySelectorAll('[role=tab], .rb-aba, button')].find(x => x.textContent.trim() === 'Arquivo'); if (t) t.click(); }); await esp(p, 300);
    const tem = await fr.evaluate(() => ({ cmd: !!document.querySelector('[data-cmd="arquivo.camposCwork"]'), url: location.hash, abas: [...document.querySelectorAll('[role=tab]')].map(x => x.textContent.trim()).slice(0, 8) }));
    if (!tem.cmd) console.log('    (faixa)', JSON.stringify(tem));
    await fr.evaluate(() => document.querySelector('[data-cmd="arquivo.camposCwork"]').click()); await esp(p, 600);
    const pc = await fr.evaluate(() => ({ grupo: !!document.querySelector('[data-campos-etiqueta]'), on: [...document.querySelectorAll('[data-campo-et].on')].map(x => x.getAttribute('data-campo-et')), fora: !!document.querySelector('[data-campos-fora]') }));
    conf(pc.grupo && pc.on.join() === 'material,analise,cultura,variedade,talhao,profundidade,data,responsavel,estadio,obs', 'o painel mostra o grupo "Etiqueta da amostra" com os 10 campos marcados do modelo de Solo do EFClaudian (' + pc.on.join() + ')');
    conf(!pc.fora, 'os nomes efc_et_ não aparecem como "fora do Cwork"');
    const pr = await fr.evaluate(() => ({ conta: document.querySelector('[data-campos-conta]').textContent, primeiro: !!document.querySelector('.re-linhas > [data-campos-etiqueta]:first-child') }));
    conf(pr.primeiro && pr.conta === '10 campos da etiqueta marcados', 'modelo da pasta Etiquetas: a etiqueta vem primeiro no painel (' + pr.conta + ')');
    await fr.click('.grade, canvas, [data-grade]').catch(() => {});
    await foto(p, 'pc-vertice-campos-etiqueta');
    await p.evaluate(() => { const id = S.jnAbertas.find(x => { const f = jnFr(x); return f && f.contentWindow.location.href.includes('detqsolo01'); }); if (id) jnTira(id); jnIr('efcwork'); }); await esp(p, 400); }

  console.log('— Cwork: Coletas › Cadastros › Modelos de etiqueta');
  await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(p, 700);
  await p.click('[data-dd="cc:vista"] .dd-b'); await esp(p, 300); await foto(p, 'pc-cadastros-lista'); await p.keyboard.press('Escape'); await esp(p, 200);
  await dd(p, 'cc:vista', 'Modelos de etiqueta'); await esp(p, 900);
  conf(await p.evaluate(() => !!document.querySelector('[data-act="et-lig-novo"]') && (S.etDocs || []).map(d => d.nome).sort().join('|') === 'Etiqueta Fruta completa (exemplo)|Etiqueta Solo (exemplo)'), 'a lista mostra "Ligar modelo" e lê as planilhas da pasta Etiquetas do Vértice');
  await foto(p, 'pc-cadastros-vazio');
  await p.click('[data-act="et-lig-novo"]'); await esp(p, 500);
  await dd(p, 'et:doc', 'Etiqueta Solo (exemplo)');
  conf((await alinha(p)).length === 0, 'formulário: Material e Laboratório lado a lado alinhados (' + (await alinha(p)).join('; ') + ')');
  await foto(p, 'pc-ligar-modelo');
  await p.click('[data-act="et-lig-ok"]'); await esp(p, 700);
  await p.click('[data-act="et-lig-novo"]').catch(async () => { await p.keyboard.press('Escape'); await esp(p, 300); await p.click('[data-act="et-lig-novo"]'); }); await esp(p, 500);
  if (!(await p.$('[data-dd="et:tipo"]'))) { await p.keyboard.press('Escape'); await esp(p, 300); await p.click('[data-act="et-lig-novo"]'); await esp(p, 500); }
  await dd(p, 'et:tipo', 'Fruta'); await dd(p, 'et:lab', 'LAB FRUTA (exemplo)'); await dd(p, 'et:doc', 'Etiqueta Fruta completa (exemplo)');
  await p.click('[data-act="et-lig-ok"]'); await esp(p, 700);
  const lig = await p.evaluate(() => (S.cfgCol.etqVertice || []).map(x => x.tipo + '|' + (x.lab || '*') + '|' + x.docId).join(' ; '));
  conf(lig === 'SOLO|*|detqsolo01 ; FRUTA|LAB FRUTA (exemplo)|detqfruta01', 'grava as ligações em sv2_cfg/coletas.etqVertice (' + lig + ')');
  await p.click('[data-act="et-lig-novo"]').catch(() => {}); await esp(p, 400);
  if (!(await p.$('[data-dd="et:tipo"]'))) { await p.keyboard.press('Escape'); await esp(p, 300); await p.click('[data-act="et-lig-novo"]'); await esp(p, 500); }
  await dd(p, 'et:doc', 'Etiqueta Fruta completa (exemplo)'); await p.click('[data-act="et-lig-ok"]'); await esp(p, 400);
  conf(/já tem modelo ligado/.test(await p.evaluate(() => (document.querySelector('#gv .fm-msg') || {}).textContent || '')), 'Solo + qualquer laboratório de novo: recusa (um modelo por material e laboratório)');
  await p.keyboard.press('Escape'); await esp(p, 400); if (await p.$('#cf')) { await p.click('#cf button:has-text("Descartar"), #cf .bt.pr').catch(() => {}); await esp(p, 300); }
  while (await p.evaluate(() => !!document.querySelector('#gv.on, #gv[open], .gv.on'))) { await p.keyboard.press('Escape'); await esp(p, 300); if (await p.$('#cf')) await p.click('#cf .bt.pr').catch(() => {}); }
  await foto(p, 'pc-cadastros');

  console.log('— Amostras: o ícone imprime as da lista (filtradas)');
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 700);
  conf(await p.evaluate(() => !!document.querySelector('[data-act="et-am"]')), 'Amostras tem o ícone de etiqueta na barra da tabela');
  await foto(p, 'pc-amostras-icone');
  let antes = vertFrs(p);
  await p.click('[data-act="et-am"]'); let fr = await abaEtiquetas(p, antes);
  conf(!!fr, 'abre uma aba do Vértice em #/pedido/et…');
  if (!fr) { console.log(p.frames().map(f => f.url())); await b.close(); srv.close(); process.exit(1); }
  const av = await p.evaluate(() => [...document.querySelectorAll('.av, #av *')].map(x => x.textContent).join(' '));
  conf(/Sem modelo de etiqueta para Folha/.test(av), 'a Folha (sem modelo ligado) fica de fora com aviso claro');
  let q = await quadro(fr), t = await svgTxt(fr);
  conf(q.grupos.join('|') === 'Etiqueta Fruta completa (exemplo)|Etiqueta Solo (exemplo)', 'dois tipos de etiqueta na mesma impressão, cada amostra com o modelo dela (' + q.grupos.join(' | ') + ')');
  conf(q.folhas === 3 && /17 etiquetas · 3 folhas/.test(q.conta), 'Solo 15 (12 + 3) e Fruta 2 = 3 folhas (' + q.conta + ')');
  conf(q.bts.join('|') === 'Imprimir|Mais opções' && q.menus === 0, 'sem menus: só a impressora e os três pontos (' + q.bts.join('|') + ')');
  conf(t.filter(x => /^RU1\dFOR24$/.test(x)).length === 17 && t.includes('MAMÃO') && t.includes('FORMOSA') && t.includes('FLORAÇÃO') && t.includes('20-40') && t.includes('SOLO COMPLETO'), 'cada etiqueta sai com os dados da amostra (talhão, cultura e variedade do cadastro, estádio, profundidade, análise)');
  conf(t.includes('LT-0042') && t.includes('08:30') && t.includes('MAMÃO MADURO') && !t.includes('LABORATÓRIO:') && !t.includes('O.S:'), 'a Fruta completa sai com identificação, rastreabilidade e hora, sem Laboratório nem O.S (igual ao EFClaudian)');
  conf(t.includes('-') && t.filter(x => x === 'ESTÁDIO FENOLÓGICO:').length === 15, 'valor que falta sai "-", como no EFClaudian');
  conf(await fr.evaluate(() => document.querySelectorAll('.md-svg image').length) >= 17 && !(await svgTxt(fr)).includes('Picture'), 'cada etiqueta de teste sai com a marca d\'água "MODELO NÃO OFICIAL · SÓ PARA TESTE"');
  conf(t.filter(x => x === 'Empresa (exemplo)').length === 17 && t.filter(x => x === 'Local (exemplo)').length === 17, 'o cabeçalho escrito no modelo (ITEM 277) sai nas 17');
  const dt = await p.evaluate(() => fmtD(addDias(hojeISO(), -2)));
  conf(t.includes(dt), 'a data da coleta em dd/mm/aaaa (' + dt + ')');
  const orient = await fr.evaluate(() => { const f = document.querySelector('.md-folha').getBoundingClientRect(); return f.width > f.height; });
  conf(orient, 'a folha sai deitada, como o modelo (A4 paisagem)');
  conf(await p.evaluate(() => Object.values(S.jnNome).includes('Etiquetas das amostras')), 'a aba de cima do Cwork mostra "Etiquetas das amostras"');
  await foto(p, 'pc-etiquetas');
  let mv = await medeVt(fr, false);
  conf(!mv.baixos.length && mv.tams.length <= 7 && mv.rolaX <= 0, 'auditoria PC claro: botões ≥ 36 px, ' + mv.tams.length + ' tamanhos de letra (' + mv.tams.join(' ') + '), nada rola para o lado');
  console.log('— Tirar uma etiqueta');
  conf((await fr.$$('.md-et input:not([type=checkbox]), .md-et textarea')).length === 0, 'nada se escreve na hora de imprimir (ITEM 279): a observação vem da amostra')
  await fr.click('[data-et-amostra="s0"]'); await esp(p, 400); q = await quadro(fr);
  conf(/16 etiquetas · 3 folhas/.test(q.conta) && (await svgTxt(fr)).filter(x => /^RU1\dFOR24$/.test(x)).length === 16, 'tirar uma amostra: sai da folha, 16 etiquetas (' + q.conta + ')');
  await fr.click('[data-et-amostra="s0"]'); await esp(p, 300);
  await foto(p, 'pc-etiquetas-preencher');
  console.log('— Baixar PDF e nada gravado');
  await fr.click('[data-md-mais]'); await esp(p, 200);
  const [dl] = await Promise.all([fr.page().waitForEvent('download', { timeout: 15000 }).catch(() => null), fr.click('[data-md-item="pdf"]')]);
  conf(!!dl && /Etiquetas das amostras\.pdf$/.test(dl.suggestedFilename()), 'três pontos › Baixar PDF (' + (dl ? dl.suggestedFilename() : 'nada') + ')');
  if (dl) { const f = await dl.path(); conf(fs.statSync(f).size > 5000 && fs.readFileSync(f).slice(0, 5).toString() === '%PDF-', 'o PDF tem conteúdo'); }
  const modeloDepois = await fr.evaluate(() => new Promise(ok2 => { const q2 = indexedDB.open('efcdocs'); q2.onsuccess = () => { const g = q2.result.transaction('arquivos', 'readonly').objectStore('arquivos').get('detqfruta01'); g.onsuccess = () => ok2(JSON.stringify(g.result.pacote || g.result.conteudo || '')); }; }));
  conf(!/LT-0042|RU12FOR24/.test(modeloDepois), 'o modelo guardado continua vazio (nada é gravado)');
  conf(await p.evaluate(() => !Object.keys(localStorage).some(k => /etiq/i.test(k))) , 'o pedido não fica no aparelho (só na memória da tela)');

  console.log('— Remessa e depois de "Coletado"');
  await p.evaluate(() => jnIr('efcwork')); await esp(p, 400);
  await p.evaluate(() => coAbreLote(coLoteK(S.coletas.find(c => c.id === 'v1')))); await esp(p, 500);
  conf(await p.evaluate(() => !!document.querySelector('#gv [data-act="et-rem"]')), 'a gaveta da remessa tem o ícone de etiqueta no alto');
  await foto(p, 'pc-remessa');
  antes = vertFrs(p); await p.click('#gv [data-act="et-rem"]'); fr = await abaEtiquetas(p, antes);
  q = fr ? await quadro(fr) : {};
  conf(fr && /2 etiquetas · 1 folha/.test(q.conta), 'as 2 amostras da remessa (' + q.conta + ')');
  await p.evaluate(() => jnIr('efcwork')); await esp(p, 300); await p.keyboard.press('Escape'); await esp(p, 300);
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await esp(p, 600);
  await p.evaluate(() => etDepoisColetado(['s1', 's2', 's3'], '3 área(s) coletada(s) · 3 amostra(s) em Amostras.')); await esp(p, 300);
  await p.evaluate(() => jnIr('efcwork')); await esp(p, 200);
  const bt = await p.$('.av .av-df'); conf(!!bt && (await bt.textContent()) === 'Etiquetas', 'o aviso depois de "Coletado" oferece "Etiquetas"');
  await foto(p, 'pc-coletado-aviso');
  antes = vertFrs(p); if (bt) await bt.click(); fr = await abaEtiquetas(p, antes); q = fr ? await quadro(fr) : {};
  conf(fr && /3 etiquetas · 1 folha/.test(q.conta), 'só as 3 que acabaram de entrar (' + q.conta + ')');
  console.log('— Tema escuro');
  await p.evaluate(() => { jnIr('efcwork'); csTrocaTema('escuro'); for (const k of ['efcdocs:prefs', 'efcdocs-demo:prefs', 'efcdocs:demo:prefs']) localStorage.setItem(k, JSON.stringify({ tema: 'dark' })); }); await esp(p, 600);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 900);
  antes = vertFrs(p); await p.evaluate(() => etDasFiltradas()); fr = await abaEtiquetas(p, antes);
  conf(!!fr, 'no escuro também abre');
  if (fr) { const me = await medeVt(fr, false), bg = await fr.evaluate(() => getComputedStyle(document.querySelector('.md')).backgroundColor);
    conf(!me.baixos.length && me.tams.length <= 7 && /rgb\((\d{1,2}), (\d{1,2}), (\d{1,2})\)/.test(bg), 'auditoria PC escuro: fundo escuro (' + bg + '), botões e letras dentro das metas'); }
  await foto(p, 'pc-etiquetas-escuro');
  await p.evaluate(() => { jnIr('efcwork'); csTrocaTema('claro'); });
  conf(p._er.length === 0, 'sem erro de JavaScript no PC' + (p._er.length ? ' (' + p._er.slice(0, 3).join(' | ') + ')' : ''));

  console.log('— Pedido que não existe mais');
  { const f2 = vertFrs(p).find(x => /#\/pedido\/et/.test(x.url()));
    await f2.evaluate(() => { location.hash = '#/pedido/etzzzzzz'; }); await esp(p, 800);
    conf(await f2.evaluate(() => /não está mais no Cwork/.test(document.body.textContent)), 'endereço velho: "Este pedido de etiquetas não está mais no Cwork"'); }

  console.log('— Celular 390 (Colaborador: vê Coletas, não cadastra)');
  const c = await abre(b, base, { width: 390, height: 780 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await poeModelo(c, 'etiqueta-solo.xlsx', 'Etiqueta Solo (exemplo)', 'detqsolo01');
  await c.evaluate(async () => { const cf = S.cfgCol; await Data.col('sv2_cfg').set('coletas', Object.assign({}, cf, { etqVertice: [{ id: 'et1', tipo: 'SOLO', lab: '', docId: 'detqsolo01', nome: 'Etiqueta Solo (exemplo)' }] })); });
  await c.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); }); await esp(c, 800);
  await c.evaluate(() => { jnFechaTudo && jnFechaTudo(); }).catch(() => {});
  await c.evaluate(() => { vtFechaAbas(false); location.hash = '#/coletas/cadastros'; S.ccVista = 'etiquetas'; render(); }); await esp(c, 800);
  conf(await c.evaluate(() => !document.querySelector('[data-act="et-lig-novo"]')), 'Colaborador vê a lista dos modelos, sem "Ligar modelo"');
  await c.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(c, 700);
  antes = vertFrs(c); await c.click('[data-act="et-am"]'); fr = await abaEtiquetas(c, antes); q = fr ? await quadro(fr) : {};
  conf(fr && /15 etiquetas · 2 folhas/.test(q.conta) && q.rolaX <= 0, 'no celular: 15 de Solo em 2 folhas, nada rola para o lado (' + q.conta + ')');
  if (fr) { const pn = await fr.evaluate(() => { const a = document.querySelector('[data-et-painel]').getBoundingClientRect(), f = document.querySelector('.md-folhas').getBoundingClientRect(); return a.top >= f.bottom - 1; }); conf(pn, 'o painel fica embaixo das folhas'); }
  await foto(c, 'cel-etiquetas');
  if (fr) { const mc = await medeVt(fr, true); conf(!mc.baixos.length && mc.tams.length <= 7, 'auditoria celular: toque ≥ 44 px (' + (mc.baixos.join(',') || 'nenhum baixo') + '), ' + mc.tams.length + ' tamanhos de letra'); }
  conf(c._er.length === 0, 'sem erro de JavaScript no celular' + (c._er.length ? ' (' + c._er.slice(0, 3).join(' | ') + ')' : ''));

  await b.close(); srv.close();
  console.log(`\n${ok} ok, ${falhas} falha(s)`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
