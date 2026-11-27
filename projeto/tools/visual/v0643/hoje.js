/* Fotos HOJE (o que está no ar: Cwork v0.6.42 na raiz do repositório e Vértice v0.6.77 em vertice/) para a página da etapa 3.
   Uso: SAIDA=<pasta> NODE_PATH=$(npm root -g) node tools/visual/v0643/hoje.js  (antes de copiar a versão nova para a raiz) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const REPO = path.resolve(__dirname, '..', '..', '..', '..'), S = path.resolve(process.env.SAIDA), AM = path.join(__dirname, 'amostras');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(REPO, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f) || /\/fonte\/|\/projeto\//.test(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const foto = async (p, n) => { fs.mkdirSync(S, { recursive: true }); await esp(p, 300); await p.screenshot({ path: path.join(S, n + '.png') }); };
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  console.log('versão', await p.evaluate(() => VERSAO));
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), h = hojeISO(), d = n => addDias(h, n);
    await C('sv2_cfg').set('coletas', { etiqueta: { empresa: 'Empresa (exemplo)', local: 'Local (exemplo)' }, labs: ['LAB SOLO (exemplo)', 'LAB FRUTA (exemplo)'], fazendas: [{ prefixo: 'RU', nome: 'Fazenda (exemplo)', unidade: 'matriz' }], tipos: [{ nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4 }] });
    const Tl = (id, o) => C('sv2_talhoes').set(id, Object.assign({ pivo: 'Pivô 2', cultura: 'MAMÃO', variedade: 'FORMOSA', ativo: true, hectares: 4 }, o));
    await Tl('t1', { codigo: 'RU11FOR24' }); await Tl('t2', { codigo: 'RU12FOR24' }); await Tl('t3', { codigo: 'RU13FOR24' });
    const K = (id, o) => C('sv2_coletas').set(id, Object.assign({ situacao: 'ativa', analiseNome: 'SOLO COMPLETO', lab: 'LAB SOLO (exemplo)', coletor: 'Equipe A (exemplo)', criadoEm: nowISO(), criadoPor: S.user.id }, o));
    for (let i = 0; i < 13; i++) await K('s' + i, { tipo: 'SOLO', data: d(-2), talhao: ['RU11FOR24', 'RU12FOR24', 'RU13FOR24'][i % 3], prof: i % 2 ? '20-40' : '0-20', estadio: 'FLORAÇÃO' });
    await K('r1', { tipo: 'FRUTA', data: d(-1), talhao: 'RU12FOR24', analiseNome: 'RESÍDUOS', lab: 'LAB FRUTA (exemplo)', maturacao: 'MADURO', hora: '08:30', rastreabilidade: 'LT-0042' });
    await K('v1', { tipo: 'SOLO', data: d(-40), talhao: 'RU13FOR24', enviado: true, envio: d(-4), os: '1234' });
    await K('v2', { tipo: 'SOLO', data: d(-39), talhao: 'RU11FOR24', enviado: true, envio: d(-4), os: '1234' });
  }); await esp(p, 500);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 800); await foto(p, 'hoje-amostras');
  await p.evaluate(() => coAbreLote(coLoteK(S.coletas.find(c => c.id === 'v1')))); await esp(p, 600); await foto(p, 'hoje-remessa');
  await p.keyboard.press('Escape'); await esp(p, 400);
  await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(p, 700);
  await p.click('[data-dd="cc:vista"] .dd-b'); await esp(p, 300); await foto(p, 'hoje-cadastros-lista'); await p.keyboard.press('Escape');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await esp(p, 600);
  await p.evaluate(() => aviso('3 área(s) coletada(s) · 3 amostra(s) em Amostras.')); await esp(p, 300); await foto(p, 'hoje-coletado-aviso');
  /* o modelo de teste no Vértice publicado: a imagem (marca d'água) sai como linha de assinatura com "Picture" */
  const b64 = fs.readFileSync(path.join(AM, 'etiqueta-fruta.xlsx')).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: 'Etiqueta Fruta completa (exemplo).xlsx', docId: 'detqfruta01' }); jnAbrir('docs', '#/abrir/' + pid, true); }, b64);
  await esp(p, 7000); await foto(p, 'hoje-imagem-impressa');
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
