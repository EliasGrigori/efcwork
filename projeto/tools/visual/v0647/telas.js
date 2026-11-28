/* Fotos da página de aprovação da v0.6.47 (documentos só no Vértice, 1ª parte): o mesmo roteiro no que está no ar (HOJE) e na proposta.
   Uso: NODE_PATH=$(npm root -g) EFC_DIST=<pasta do Cwork> VERTICE_DIR=<pasta do Vértice> node tools/visual/v0647/telas.js <saída> <hoje|proposta>
   PDFs de TESTE gerados aqui, com a marca "MODELO NAO OFICIAL - SO PARA TESTE". */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), http = require('http');
const DIST = process.env.EFC_DIST, VD = process.env.VERTICE_DIR, OUT = process.argv[2], MODO = process.argv[3] || 'proposta', PROP = MODO === 'proposta';
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'v0647t-')), PDF = path.join(TMP, 'teste-formulario.pdf'), PDF2 = path.join(TMP, 'teste-pop.pdf');
fs.writeFileSync(PDF, pdf('PDF DE TESTE')); fs.writeFileSync(PDF2, pdf('PDF DE TESTE - POP'));
const esp = (p, ms) => p.waitForTimeout(ms || 400);
const vertFr = p => p.frames().filter(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame()).pop();
async function abre(b, base, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel, serviceWorkers: 'block', timezoneId: 'America/Fortaleza' }), p = await ctx.newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800); return p;
}
async function importa(p, arq, nome, pasta) {
  await p.click('[data-act="ip-importar"]'); await esp(p, 300); await p.setInputFiles('[data-ip-arq="arq"]', arq); await esp(p, 500); await p.fill('[data-fm="nome"]', nome);
  await p.click('[data-dd="ip:pasta"] .dd-b'); await p.click('[data-dd="ip:pasta"] [data-v="' + pasta + '"]'); await esp(p, 200); await p.click('[data-act="ip-ok"]'); await esp(p, 1300);
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port, b = await chromium.launch();
  const p = await abre(b, base, 1280, 820);
  await p.evaluate(() => { location.hash = '#/documentos/impressos'; }); await esp(p, 600);
  await p.click('[data-act="ip-importar"]'); await esp(p, 400); await p.click('[data-dd="ip:pasta"] .dd-b'); await esp(p, 300); await foto(p, 'pc-importar');
  await p.keyboard.press('Escape'); await esp(p, 200); await p.keyboard.press('Escape'); await esp(p, 500);
  await importa(p, PDF, 'Formulário de teste', 'Formulários');
  if (PROP) { await p.evaluate(() => window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'dplteste01', nome: 'Ficha de teste (planilha)', codigo: 'FIC-90', tipo: 'planilha', status: 'rascunho', pastaNome: 'Fichas e custódias' }, pacote: { fmt: 'json', dados: '{"abas":{}}', bytesOriginal: 1, bytesFinal: 1 } }, 0)); await p.evaluate(() => ivLer(true)); }
  await esp(p, 900); await foto(p, 'pc-lista');
  const linha = await p.evaluate(() => { const t = [...document.querySelectorAll('tr[data-act="tb-lin"]')].find(x => /Formulário de teste/.test(x.textContent)); return t ? t.getAttribute('data-id') : ''; });
  if (linha) { await p.click('tr[data-id="' + linha + '"]'); await esp(p, 900); await foto(p, 'pc-gaveta'); await p.keyboard.press('Escape'); await esp(p, 500); }
  if (PROP) {
    await p.click('tr[data-id="vt:dplteste01"]'); await esp(p, 800); await foto(p, 'pc-planilha-gaveta');
    await p.keyboard.press('Escape'); await esp(p, 500);
    await p.click('[data-act="ip-importar"]'); await esp(p, 300); await p.click('[data-dd="ip:modo"] .dd-b'); await p.click('[data-dd="ip:modo"] [data-v="link"]'); await esp(p, 200);
    await p.fill('[data-fm="link"]', 'https://exemplo.com/teste'); await p.fill('[data-fm="nome"]', 'Link de teste (antigo)'); await p.click('[data-act="ip-ok"]'); await esp(p, 900);
    await foto(p, 'pc-antigo-cwork');
  }
  await p.evaluate(() => jnAbrir('docs', '#/externos')); await esp(p, 5500);
  let v = vertFr(p); if (v) { const ab = await v.$('[data-ext-sub="Formulários"]'); if (ab) { await ab.click(); await esp(p, 300); } }
  await foto(p, 'pc-vertice-externos');
  if (PROP && v) {
    await v.click('[data-ext-importar]'); await esp(p, 300); await v.setInputFiles('[data-ext-arq]', PDF2); await esp(p, 400); await v.fill('[data-ext-nome]', 'POP de teste'); await v.selectOption('[data-ext-pasta]', 'POPs e procedimentos'); await esp(p, 200);
    await foto(p, 'pc-vertice-importar');
    await v.click('[data-ext-ok]'); await esp(p, 2500);
    const id = await v.evaluate(() => { const b = document.querySelector('[data-ext-ver]'); return b ? b.getAttribute('data-ext-ver') : ''; });
    if (id) { await v.click('[data-ext-ver="' + id + '"]'); await esp(p, 1200); await foto(p, 'pc-vertice-ver'); await v.press('body', 'Escape'); await esp(p, 300); }
    await p.evaluate(() => jnIr('efcwork')); await esp(p, 600);
    await p.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); const ps = IP_PASTAS.map(n => ({ nome: n, todos: false, leitores: n === 'Formulários' ? [S.user.id] : [] })), ac = {}; ps.forEach(x => { ac[x.nome] = { todos: false, leitores: x.leitores }; }); await Data.col('sv2_cfg').set('vertice_pastas', { pastas: ps, acesso: ac }); });
    await esp(p, 700); await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 300); await p.evaluate(() => { location.hash = '#/documentos/impressos'; ivLer(true); }); await esp(p, 1200);
    const l2 = await p.evaluate(() => { const t = [...document.querySelectorAll('tr[data-act="tb-lin"]')].find(x => /^vt:/.test(x.getAttribute('data-id'))); return t ? t.getAttribute('data-id') : ''; });
    if (l2) { await p.click('tr[data-id="' + l2 + '"]'); await esp(p, 800); } await foto(p, 'pc-colaborador');
  }
  const c = await abre(b, base, 390, 844);
  await c.evaluate(() => { location.hash = '#/documentos/impressos'; }); await esp(c, 600);
  await importa(c, PDF, 'Formulário de teste', 'Formulários'); await foto(c, 'cel-lista');
  const lc = await c.evaluate(() => { const t = [...document.querySelectorAll('tr[data-act="tb-lin"]')].find(x => /Formulário de teste/.test(x.textContent)); return t ? t.getAttribute('data-id') : ''; });
  if (lc) { await c.click('tr[data-id="' + lc + '"]'); await esp(c, 900); await foto(c, 'cel-gaveta'); }
  await b.close(); srv.close(); console.log('fotos em', OUT);
})().catch(e => { console.error(e); process.exit(1); });
