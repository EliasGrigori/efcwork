/* Fotos da página de aprovação da v0.6.48 (documentos só no Vértice, 2ª parte): o mesmo roteiro no que está no ar (HOJE) e na proposta.
   Uso: NODE_PATH=$(npm root -g) EFC_DIST=<pasta do Cwork> VERTICE_DIR=<pasta do Vértice> node tools/visual/v0648/telas.js <saída>
   PDFs de TESTE gerados aqui, com a marca "MODELO NAO OFICIAL - SO PARA TESTE"; a planilha de TESTE é tools/visual/v0645/amostras/teste-grupos.xlsx. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const DIST = process.env.EFC_DIST, VD = process.env.VERTICE_DIR, OUT = process.argv[2];
const RAIZ = path.resolve(__dirname, '..', '..', '..'), XL = fs.readFileSync(path.join(RAIZ, 'tools', 'visual', 'v0645', 'amostras', 'teste-grupos.xlsx'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]); let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html'); if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
function pdf(txt) {
  const s = 'BT /F1 22 Tf 50 760 Td (' + txt + ') Tj ET BT /F1 30 Tf 60 420 Td (MODELO NAO OFICIAL - SO PARA TESTE) Tj ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 3 0 R >> >> >>', '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream'];
  let o = '%PDF-1.4\n'; const pos = []; objs.forEach((x, k) => { pos.push(o.length); o += (k + 1) + ' 0 obj\n' + x + '\nendobj\n'; });
  const xr = o.length; o += 'xref\n0 6\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n';
  return Buffer.from(o, 'latin1');
}
const esp = (p, ms) => p.waitForTimeout(ms || 400), N = (p, fn, ...a) => p.evaluate(fn, ...a), foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
async function abre(b, base, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel, serviceWorkers: 'block', timezoneId: 'America/Fortaleza' }), p = await ctx.newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800); return p;
}
async function antigo(p, o) {
  await N(p, async o => { const u8 = s => new Uint8Array(s.split(',').map(Number)).buffer, pdfb = u8(o.pdf);
    const arq = o.xlsx ? { buf: u8(o.xlsx), nome: 'teste.xlsx', bytes: o.xlsx.split(',').length, fmt: 'xlsx' } : { buf: pdfb, nome: o.cod + '.pdf', bytes: pdfb.byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' };
    lcAbrir({ k: 'ipEd', antigo: true, id: '', modo: 'arq', nome: o.nome, codigo: o.cod, pasta: o.pasta, arq: arq, pdf: o.xlsx ? { buf: pdfb, nome: o.cod + '.pdf', bytes: pdfb.byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' } : null }); await ipOk(); },
  { nome: o.nome, cod: o.cod, pasta: o.pasta, pdf: Array.from(o.pdf).join(','), xlsx: o.xlsx ? Array.from(o.xlsx).join(',') : '' });
  await esp(p, 500); return N(p, n => (S.ipDocs.find(d => d.nome === n) || {}).id, o.nome);
}
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port, b = await chromium.launch();
  const p = await abre(b, base, 1280, 820);
  const idPdf = await antigo(p, { nome: 'Formulário antigo de teste', cod: 'FOR-91', pasta: 'Formulários', pdf: pdf('PDF ANTIGO DE TESTE') });
  const idXl = await antigo(p, { nome: 'Ficha antiga de teste', cod: 'FIC-91', pasta: 'Fichas e custódias', pdf: pdf('COPIA DA PLANILHA DE TESTE'), xlsx: XL });
  const pd = pdf('PDF DO VERTICE DE TESTE');
  await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'dpdfvt01', nome: 'POP de teste no Vértice', codigo: 'POP-90', tipo: 'pdf', status: 'rascunho', pastaNome: 'POPs e procedimentos' }, pacote: { fmt: 'json', dados: JSON.stringify({ pdf: a, bytes: 1, sha256: '', paginas: 1, orient: 'retrato', origem: 'pdf' }), bytesOriginal: 1, bytesFinal: 1 } }, 0), pd.toString('base64'));
  await N(p, async () => { await Data.col('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol || {}, { labs: ['Laboratório A'] })); });
  await N(p, () => { location.hash = '#/documentos/impressos'; }); await esp(p, 600); await N(p, () => typeof ivLer === 'function' && ivLer(true)); await esp(p, 800);
  await foto(p, 'pc-lista');
  await p.click('tr[data-id="' + idPdf + '"]'); await esp(p, 800); await foto(p, 'pc-gaveta-pdf'); await p.keyboard.press('Escape'); await esp(p, 500);
  await p.click('tr[data-id="' + idXl + '"]'); await esp(p, 800); await foto(p, 'pc-gaveta-excel'); await p.keyboard.press('Escape'); await esp(p, 500);
  await N(p, async () => { if (typeof ktLerVt === 'function') { S.ktVt = null; await ktLerVt(); } lcAbrir({ k: 'ktAnexar', lab: 'Laboratório A', papel: 'doc', docId: '' }); }); await esp(p, 900);
  const dd = await p.$('[data-dd="kt:doc"] .dd-b'); if (dd) { await dd.click(); await esp(p, 400); } await foto(p, 'pc-kit-anexar');
  await N(p, () => { if (S.fm) S.fm.sujo = false; gvFechar(true); }); await esp(p, 600);
  await N(p, () => { location.hash = '#/qualidade/treinamentos'; }); await esp(p, 600);
  await N(p, () => trNovo()); await esp(p, 700); const dp = await p.$('[data-dd="tr:pop"] .dd-b'); if (dp) { await dp.click(); await esp(p, 400); } await foto(p, 'pc-treino-pop');
  await b.close(); srv.close(); console.log('fotos em', OUT);
})().catch(e => { console.error(e); process.exit(1); });
