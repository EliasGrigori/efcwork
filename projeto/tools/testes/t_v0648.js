/* EFCwork v0.6.48 + Vértice v0.6.83 · documentos só no Vértice, 2ª parte (respostas do Elias de 28/11 06:1x).
   - "Levar para o Vértice" em cada impresso antigo: PDF vai como PDF; Excel abre no Vértice como planilha, já na pasta; o antigo sai da lista e fica guardado.
   - Kit e Treinamentos seguem o levado e enxergam o PDF do Vértice; backup e Reserva levam os do Vértice; o espaço conta a nuvem do Vértice;
     a cópia em conflito não aparece como vigente no Cwork.
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /efcwork/vertice/ (VERTICE_DIR = a pasta montada). Modo demonstração.
   PDFs de TESTE gerados aqui ("MODELO NAO OFICIAL - SO PARA TESTE"); a planilha de TESTE é tools/visual/v0645/amostras/teste-grupos.xlsx (com marca d'água).
   Uso: NODE_PATH=$(npm root -g) VERTICE_DIR=../vertice/fonte/dist node tools/testes/t_v0648.js  (EFC_DIST=<pasta> testa outra montagem; EFC_FOTOS=<pasta> guarda fotos) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'), DIST = process.env.EFC_DIST || path.join(RAIZ, 'dist'), FOTOS = process.env.EFC_FOTOS || '';
const XLSX = path.join(RAIZ, 'tools', 'visual', 'v0645', 'amostras', 'teste-grupos.xlsx');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
function pdf(txt) {
  const s = 'BT /F1 22 Tf 50 760 Td (' + txt + ') Tj ET BT /F1 30 Tf 60 420 Td (MODELO NAO OFICIAL - SO PARA TESTE) Tj ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 3 0 R >> >> >>', '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream'];
  let o = '%PDF-1.4\n'; const pos = []; objs.forEach((x, k) => { pos.push(o.length); o += (k + 1) + ' 0 obj\n' + x + '\nendobj\n'; });
  const xr = o.length; o += 'xref\n0 6\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n';
  return Buffer.from(o, 'latin1');
}
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
let base = '';
const N = (p, fn, ...a) => p.evaluate(fn, ...a);
const vai = async (p, h) => { await N(p, x => { location.hash = x; }, h); await esp(p, 500); };
const vertFr = p => p.frames().filter(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame()).pop();
const foto = async (p, n) => { if (FOTOS) { fs.mkdirSync(FOTOS, { recursive: true }); await p.screenshot({ path: path.join(FOTOS, n + '.png') }); } };
const linhas = p => N(p, () => [...document.querySelectorAll('tr[data-act="tb-lin"]')].map(t => ({ id: t.getAttribute('data-id'), tx: t.textContent })));
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  return p;
}
/* impresso antigo (guardado no Cwork), como antes da v0.6.47 */
async function antigo(p, o) {
  await N(p, async o => {
    const u8 = s => new Uint8Array(s.split(',').map(Number)).buffer;
    const pdfb = u8(o.pdf), arq = o.xlsx ? { buf: u8(o.xlsx), nome: 'teste.xlsx', bytes: o.xlsx.split(',').length, fmt: 'xlsx' } : { buf: pdfb, nome: o.cod + '.pdf', bytes: pdfb.byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' };
    lcAbrir({ k: 'ipEd', antigo: true, id: '', modo: 'arq', nome: o.nome, codigo: o.cod, pasta: o.pasta, arq: arq, pdf: o.xlsx ? { buf: pdfb, nome: o.cod + '.pdf', bytes: pdfb.byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' } : null });
    await ipOk();
  }, { nome: o.nome, cod: o.cod, pasta: o.pasta, pdf: Array.from(o.pdf).join(','), xlsx: o.xlsx ? Array.from(o.xlsx).join(',') : '' });
  await esp(p, 500);
  return N(p, n => (S.ipDocs.find(d => d.nome === n) || {}).id, o.nome);
}
(async () => {
  await new Promise(r => srv.listen(0, r)); base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, 1280);
  const PDF1 = pdf('PDF ANTIGO DE TESTE'), XL = fs.readFileSync(XLSX), PDFX = pdf('COPIA DA PLANILHA DE TESTE');
  await N(p, async () => {
    await Data.col('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol || {}, { labs: ['Laboratório A'] }));
    await Data.col('sv2_coletas').set('ca1', { data: addDias(hojeISO(), -2), situacao: 'ativa', criadoEm: nowISO(), enviado: true, envio: addDias(hojeISO(), -1), coletor: 'Teste', tipo: 'SOLO', talhao: 'T01A', analiseNome: 'Solo completo', lab: 'Laboratório A' });
  });
  const idPdf = await antigo(p, { nome: 'Formulário antigo de teste', cod: 'FOR-91', pasta: 'Formulários', pdf: PDF1 });
  const idXl = await antigo(p, { nome: 'Ficha antiga de teste', cod: 'FIC-91', pasta: 'Fichas e custódias', pdf: PDFX, xlsx: XL });
  conf(idPdf && idXl, 'dois impressos antigos de teste no Cwork (PDF e Excel)');
  /* o kit e um treinamento apontam para o PDF antigo */
  await N(p, async id => {
    await Data.col('sv2_impressos').set('kittest1', { v: 1, ponto: 'coletas.envio', nome: 'Formulário antigo de teste', docId: id, lab: 'Laboratório A', papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome });
    await Data.col('sv2_treinos').set('trtest1', { v: 1, titulo: 'Treinamento de teste', data: hojeISO(), situacao: 'programado', origem: 'efcwork', instrutorNome: 'Teste', docs: [{ docId: id, papel: 'pop' }], participantes: [], criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome });
  }, idPdf);
  await esp(p, 600);

  console.log('— Levar um PDF antigo');
  await vai(p, '#/documentos/impressos'); await esp(p, 400);
  await p.click('tr[data-id="' + idPdf + '"]'); await esp(p, 700);
  conf(!!(await p.$('#gv [data-act="iv-levar"]')), 'a gaveta do antigo tem "Levar para o Vértice"');
  await foto(p, 'proposta-gaveta-antigo');
  await p.click('#gv [data-act="iv-levar"]'); await esp(p, 500);
  const fm = await N(p, () => ({ k: S.fm && S.fm.k, pasta: S.fm && S.fm.pasta, tx: document.querySelector('#gv').textContent }));
  conf(fm.k === 'ivLevar' && fm.pasta === 'Formulários' && /Vai como PDF/.test(fm.tx), 'o formulário diz o que acontece e já traz a pasta do antigo');
  await foto(p, 'proposta-levar-pdf');
  await p.click('[data-act="iv-levar-ok"]'); await esp(p, 1500);
  let d = await N(p, async id => ({ a: await Data.col('vtd_arquivos').all(), ps: await Data.col('vtd_partes').all(), old: await Data.col('efd_docs').get(id) }), idPdf);
  const vt = d.a.find(x => x.ficha && x.ficha.nome === 'Formulário antigo de teste' && x.ficha.tipo === 'pdf');
  const cont = vt ? JSON.parse(JSON.parse(d.ps.filter(x => x.arq === vt.id).sort((x, y) => x.n - y.n).map(x => x.b64).join('')).dados) : null;
  conf(vt && vt.pasta === 'Formulários' && vt.ficha.codigo === 'FOR-91' && cont && cont.sha256 === sha(PDF1), 'no Vértice: PDF com o mesmo nome, código e pasta, e o mesmo arquivo (SHA-256)');
  conf(d.old && d.old.levadoPara === (vt && vt.id) && d.old.levadoPor === 'Joana Silva' && d.old.status === 'vigente', 'o antigo continua guardado, com a ligação para o do Vértice');
  await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await N(p, () => ivLer(true)); await esp(p, 800);
  let ls = await linhas(p);
  conf(!ls.some(x => x.id === idPdf) && ls.some(x => x.id === 'vt:' + (vt && vt.id)), 'na tabela: o antigo saiu da lista e o do Vértice está lá');

  console.log('— Kit e Treinamento seguem o levado');
  const kd = await N(p, async id => { await ktLerVt(); const d = ktDoc(id); return d ? { vtPdf: !!d.vtPdf, id: d.id } : null; }, idPdf);
  conf(kd && kd.vtPdf && kd.id === (vt && vt.id), 'o papel do kit que apontava para o antigo agora é o PDF do Vértice');
  await N(p, async () => { window._jn = []; window._jn0 = window.jnAbrir; window.jnAbrir = (...a) => window._jn.push(a); const k = (S.coletas.find(c => c.id === 'ca1') || {}); const x = { id: 'kittest1', nome: 'Formulário antigo de teste', copias: 'uma', d: ktDoc(S.ktKit.find(y => y.id === 'kittest1').docId) };
    await ktSaiUm(k.envio + '|' + k.lab, x, { caixas: 1, amostras: '' }); window.jnAbrir = window._jn0; });
  await esp(p, 900);
  const kl = await N(p, async () => (await Data.col('sv2_audit').all()).some(x => x.acao === 'imprimir_impresso' && /Vértice, versão 1/.test(x.resumo)) && !window._jn.length);
  conf(kl, 'o kit imprime o PDF do Vértice aqui mesmo (sem abrir o Vértice)');
  const anx = await N(p, () => { lcAbrir({ k: 'ktAnexar', lab: 'Laboratório Novo', papel: 'doc', docId: '' }); const t = [...document.querySelectorAll('[data-dd="kt:doc"] [data-v]')].map(x => x.textContent); return t; });
  conf(anx.some(t => /^Vértice · FOR-91 · Formulário antigo de teste \(PDF\)$/.test(t)), 'em "Anexar papel" aparece o PDF do Vértice (' + anx.length + ' opções)');
  await N(p, () => { if (S.fm) S.fm.sujo = false; gvFechar(true); }); await esp(p, 500);
  const tr = await N(p, id => { const d = trDocDe(id); return d ? d.nome + '|' + (d._vtId || '') : ''; }, idPdf);
  conf(new RegExp('^Formulário antigo de teste\\|' + (vt && vt.id) + '$').test(tr), 'o Treinamento mostra o documento do Vértice (' + tr + ')');
  const op = await N(p, () => trDocsOpc().map(x => x[1]));
  conf(op.some(t => /^Vértice · FOR-91 · Formulário antigo de teste$/.test(t)) && !op.some(t => /^FOR-91 · /.test(t)), 'na lista do Treinamento entra o do Vértice (o antigo não repete)');

  console.log('— Levar um Excel antigo: vira planilha no Vértice');
  await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await esp(p, 400);
  await p.click('tr[data-id="' + idXl + '"]'); await esp(p, 700);
  await p.click('#gv [data-act="iv-levar"]'); await esp(p, 500);
  conf(/como <b>planilha<\/b>|como planilha/.test(await N(p, () => document.querySelector('#gv').innerHTML)), 'para o Excel, o formulário diz que vai como planilha');
  await foto(p, 'proposta-levar-excel');
  await p.click('[data-act="iv-levar-ok"]'); await esp(p, 6000);
  const fr = vertFr(p);
  conf(fr && new RegExp('#/arq/' + idXl).test(fr.url()), 'o Vértice abre a planilha inteira (#/arq/<id>) (' + (fr ? fr.url().replace(/^.*#/, '#') : 'sem quadro') + ')');
  if (FOTOS && fr) await foto(p, 'proposta-vertice-planilha');
  const vtx = fr ? await fr.evaluate(async id => { await new Promise(r => setTimeout(r, 1500)); return document.body.textContent.indexOf('Fichas e custódias') >= 0; }, idXl) : false;
  await esp(p, 2500);
  d = await N(p, async id => ({ a: await Data.col('vtd_arquivos').get(id), old: await Data.col('efd_docs').get(id) }), idXl);
  conf(d.a && d.a.ficha.tipo === 'planilha' && d.a.pasta === 'Fichas e custódias' && d.a.ficha.codigo === 'FIC-91', 'a planilha subiu para a nuvem do Vértice, na pasta escolhida, com o código (' + (d.a ? d.a.pasta : 'não subiu') + ')');
  conf(d.old && d.old.levando && !d.old.levadoPara, 'até a planilha chegar, o antigo fica "levando" (não some antes da hora)');
  await N(p, () => { if (typeof jnIr === 'function') jnIr('efcwork'); }); await esp(p, 400);
  await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await N(p, () => ivLer(true)); await esp(p, 1200);
  d = await N(p, async id => ({ old: await Data.col('efd_docs').get(id) }), idXl);
  ls = await linhas(p);
  conf(d.old && d.old.levadoPara === idXl && ls.filter(x => x.id === idXl || x.id === 'vt:' + idXl).length === 1, 'quando a planilha chega à nuvem, o antigo conta como levado e a tabela mostra só a do Vértice');

  console.log('— Backup, Reserva, espaço e cópia em conflito');
  const bk = await N(p, async () => { const r = await bkLer(false); const a = r.cols.vtd_arquivos || [], pt = r.cols.vtd_partes || [], todas = await Data.col('vtd_partes').all();
    const atuais = new Set(); a.forEach(x => { for (let i = 0; i < (Number(x.partes) || 0); i++) atuais.add(x.id + '_' + x.versaoPartes + '_' + x.partesDe + '_' + i); });
    return { a: a.length, pt: pt.length, todas: todas.length, soAtuais: pt.every(x => atuais.has(x.id)) && pt.length === atuais.size, falha: Object.keys(r.falhas) }; });
  conf(bk.a > 0 && bk.pt > 0 && bk.soAtuais && bk.falha.indexOf('vtd_partes') < 0, 'o backup leva vtd_arquivos e os pedaços da versão atual de cada um (' + bk.a + ' arquivos, ' + bk.pt + ' de ' + bk.todas + ' pedaços)');
  const z = await N(p, async () => { let nomes = null; const z0 = ipZip, s0 = ipSalvar; ipZip = a => { nomes = a.map(x => x.nome); return new Blob(['x']); }; ipSalvar = () => {};
    try { const pr = ipReserva(); await new Promise(r => setTimeout(r, 400)); const bt = [...document.querySelectorAll('button')].find(x => /^Baixar$|^Baixar a reserva$|^Sim/.test(x.textContent.trim()) && x.offsetParent); if (bt) bt.click(); await new Promise(r => setTimeout(r, 2500)); await pr; } finally { ipZip = z0; ipSalvar = s0; }
    return nomes; });
  conf(z && z.some(n => /^Vértice\/Formulários\/FOR-91 Formulario antigo de teste v1\.pdf$/.test(n)), 'a Reserva (ZIP) leva os PDFs do Vértice numa pasta Vértice/<pasta> (' + (z ? z.filter(n => /^Vértice/.test(n)).length : 0) + ')');
  const espv = await N(p, () => ({ vt: ivEspaco(), tela: ipEspacoTela(), teto: ipEspaco() }));
  conf(espv.vt > 0 && espv.tela === espv.teto + espv.vt, 'o espaço da tela conta também a nuvem do Vértice; o teto que barra conta só o Cwork (revisor)');
  await N(p, async () => { await window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'dconfl01', nome: 'Formulário (cópia em conflito de Bia)', tipo: 'pdf', status: 'rascunho', pastaNome: 'Formulários', conflitoDe: 'dx' }, pacote: { fmt: 'json', dados: '{}', bytesOriginal: 2, bytesFinal: 2 } }, 0); await ivLer(true); await ktLerVt(); });
  await esp(p, 500);
  conf(await N(p, () => !S.ivDocs.some(x => x.id === 'dconfl01') && !S.ktVt.some(x => x.id === 'dconfl01')), 'a cópia em conflito fica só no Vértice (fora dos Impressos e do kit)');

  console.log('— Correções do revisor');
  const old1 = await N(p, id => Data.col('efd_docs').get(id), idPdf);
  conf(vt && vt.id === idPdf && old1 && old1.pub && old1.nome === 'Formulário antigo de teste' && old1.levadoPara === idPdf, 'o PDF levado tem o mesmo id no Vértice; a marca só acrescenta campos (a ficha antiga fica inteira)');
  const PDF3 = pdf('POP ANTIGO DE TESTE');
  const id3 = await antigo(p, { nome: 'POP antigo de teste', cod: 'POP-91', pasta: 'POPs e procedimentos', pdf: PDF3 });
  const dup = await N(p, async id => { gvFechar(); lcAbrir({ k: 'ivLevar', id: id, pasta: 'POPs e procedimentos' }); const a1 = ivLevarOk(); S.fm && (S.fm._trava = 0); const a2 = ivLevarOk(); await Promise.all([a1, a2]); await new Promise(r => setTimeout(r, 600));
    const l = (await Data.col('vtd_arquivos').all()).filter(x => x.ficha && x.ficha.nome === 'POP antigo de teste'); return { n: l.length, gv: S._ivGv, mark: (await Data.col('efd_docs').get(id)).levadoPara }; }, id3);
  conf(dup.n === 1 && dup.mark === id3, 'dois cliques em "Levar" criam um documento só no Vértice (' + dup.n + ')');
  conf(dup.gv === id3, 'depois de levar, abre a gaveta do documento no Vértice (não volta para o antigo)');
  const re = await N(p, async id => { const n0 = (await Data.col('vtd_arquivos').all()).length; const u8 = new Uint8Array([37, 80, 68, 70]).buffer;
    const r = await ivNovo({ buf: u8, nome: 'x.pdf', fmt: 'pdf', paginas: 1, orient: 'retrato' }, 'POP antigo de teste', 'POP-91', 'POPs e procedimentos', { id: id, rev: 0 });
    return { r: r, mais: (await Data.col('vtd_arquivos').all()).length - n0, versao: (await Data.col('vtd_arquivos').get(id)).versao }; }, id3);
  conf(re.r === id3 && re.mais === 0 && re.versao === 1, 'tentar de novo (já tinha subido) não cria outro nem muda a versão');
  const PDF4 = pdf('OBSOLETO DE TESTE');
  const id4 = await antigo(p, { nome: 'Obsoleto antigo de teste', cod: 'FOR-92', pasta: 'Formulários', pdf: PDF4 });
  conf(await N(p, async id => { await Data.col('efd_docs').update(id, { status: 'obsoleto' }); const x = S.ipDocs.find(y => y.id === id); x.status = 'obsoleto'; return !ivPodeLevar(x); }, id4), 'impresso obsoleto não vai para o Vértice');
  const fb = await N(p, async id => { const g = S.ivDocs, k = S.ktVt; S.ivDocs = []; S.ktVt = []; const d = ktDoc(id); const r = { vtPdf: !!(d && d.vtPdf), antigo: !!(d && d.pub && d.id === id) }; S.ivDocs = g; S.ktVt = k; return r; }, idPdf);
  conf(fb.antigo && !fb.vtPdf, 'sem a lista do Vértice (Colaborador sem a pasta, sem internet), o kit usa o antigo guardado, que imprime como antes');
  const sem = await N(p, async () => { let n = 0; const g0 = window.drGrava, a0 = window.aviso; window.drGrava = () => { n++; }; window.aviso = () => {};
    const r = await ivImprimir('naoexiste'); await ktSaiUm('x|Laboratório A', { id: 'kx', nome: 'Papel sumido', copias: 'uma', d: { id: 'naoexiste', vtPdf: true, nome: 'Papel sumido', rev: 1 } }, { caixas: 1 });
    window.drGrava = g0; window.aviso = a0; return { r: r, n: n }; });
  conf(sem.r === false && sem.n === 0, 'PDF do Vértice que não chega: o kit não anota "impresso"');
  const so = await N(p, async () => { const u8 = new Uint8Array([37, 80, 68, 70]).buffer; const id = await ivNovo({ buf: u8, nome: 's.pdf', fmt: 'pdf', paginas: 1, orient: 'retrato' }, 'POP só no Vértice de teste', 'POP-93', 'POPs e procedimentos');
    await Data.col('sv2_treinos').set('trtest2', { v: 1, titulo: 'Treinamento 2 de teste', data: hojeISO(), situacao: 'programado', origem: 'efcwork', instrutorNome: 'Teste', docs: [{ docId: id, papel: 'pop' }], participantes: [], criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome });
    return id; });
  await esp(p, 600);
  await N(p, () => gvFechar()); await esp(p, 500); await vai(p, '#/qualidade/treinamentos'); await esp(p, 400);
  await N(p, () => { S.ivDocs = []; S._ivLido = 0; try { localStorage.removeItem(ivChaveLista()); } catch (e) { /* nada */ } trAbre('trtest2'); });
  await esp(p, 1500);
  const trx = await N(p, () => document.querySelector('#gv') ? document.querySelector('#gv').textContent : '');
  conf(/POP só no Vértice de teste/.test(trx) && !/não encontrado/.test(trx), 'Treinamento aberto sem passar pelos Impressos: lê a lista do Vértice e mostra o documento');
  await N(p, () => gvFechar()); await esp(p, 300);
  conf(await N(p, () => ipEspaco() === S.ipDocs.reduce((s, d) => s + ipOcupa(d), 0)), 'o teto de 150 MB (trocar aqui, receber do Vértice) não conta o Vértice');

  console.log('— Colaborador não leva');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); }); await esp(p, 600);
  const idOutro = await N(p, () => (S.ipDocs.find(d => !d.levadoPara && !d.levando && d.tipo !== 'link') || {}).id || '');
  conf(await N(p, id => !ivPodeLevar(S.ipDocs.find(d => d.id === id) || { tipo: 'externo', pub: {} }), idOutro), 'Colaborador não tem "Levar para o Vértice"');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'principal' }); }); await esp(p, 400);
  conf(!p._er.length, 'sem erro de JavaScript no PC' + (p._er.length ? ': ' + p._er.slice(0, 3).join(' | ') : ''));

  console.log('— Celular 390');
  const c = await abre(b, 390, 844);
  const idc = await antigo(c, { nome: 'Formulário antigo no celular', cod: 'FOR-92', pasta: 'Formulários', pdf: PDF1 });
  await vai(c, '#/documentos/impressos'); await esp(c, 500);
  await c.click('tr[data-id="' + idc + '"]'); await esp(c, 800);
  const h = await N(c, () => { const x = document.querySelector('#gv [data-act="iv-levar"]'); return { h: x ? Math.round(x.getBoundingClientRect().height) : 0, lado: document.documentElement.scrollWidth > innerWidth }; });
  conf(h.h >= 44 && !h.lado, 'celular: "Levar para o Vértice" com 44 px e nada rola para o lado (' + h.h + ')');
  await foto(c, 'proposta-celular-gaveta-antigo');
  await c.click('#gv [data-act="iv-levar"]'); await esp(c, 500); await foto(c, 'proposta-celular-levar');
  conf(!c._er.length, 'sem erro de JavaScript no celular' + (c._er.length ? ': ' + c._er.slice(0, 2).join(' | ') : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
