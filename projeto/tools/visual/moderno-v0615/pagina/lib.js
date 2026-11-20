/* EFCwork · página de aprovação da modernização (v0.6.15) — ferramentas de captura.
   Ordem: python3 tools/montar.py && python3 tools/visual/moderno-v0615/montar-proposta.py && node captura.js && node monta-pagina.js
   (NODE_PATH=$(npm root -g) para o playwright e o sharp). */
/* ferramentas de captura do EFCwork (app de verdade em demonstração) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const NM = process.env.EFC_FONTES || path.join(__dirname, 'node_modules'); /* npm i @fontsource-variable/fraunces @fontsource/source-sans-3 (nesta pasta) para os prints saírem com as fontes do app */
const FR = path.join(NM, '@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2');
const SS = w => path.join(NM, '@fontsource/source-sans-3/files/source-sans-3-latin-' + w + '-normal.woff2');
const CSSF = `@font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;src:url(https://fonts.gstatic.com/l/fraunces.woff2) format('woff2')}` +
  [400, 500, 600, 700].map(w => `@font-face{font-family:'Source Sans 3';font-style:normal;font-weight:${w};src:url(https://fonts.gstatic.com/l/ss${w}.woff2) format('woff2')}`).join('');
async function fontes(ctx) {
  if (!fs.existsSync(FR)) { await ctx.route(/gstatic|fonts\.g|firebase/, r => r.abort()); return; }
  await ctx.route(/fonts\.googleapis\.com/, r => r.fulfill({ contentType: 'text/css', body: CSSF }));
  await ctx.route(/fonts\.gstatic\.com\/l\//, r => { const u = r.request().url(); const m = u.match(/ss(\d+)\.woff2/); r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(m ? SS(m[1]) : FR) }); });
  await ctx.route(/www\.gstatic\.com|firebase/, r => r.abort());
}
function sementeAlmox(RAIZ) {
  const t48 = fs.readFileSync(path.join(RAIZ, 'tools/testes/t_v048.js'), 'utf8');
  const a = t48.indexOf('await p.evaluate(async () => {') + 'await p.evaluate('.length;
  const b = t48.indexOf('});\n  await p.waitForTimeout(300);', a) + 1;
  return t48.slice(a, b);
}
const PNGF = (c1, c2) => 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="' + c1 + '"/><path d="M0 180 L100 100 L180 170 L240 130 L320 190 V240 H0Z" fill="' + c2 + '"/></svg>').toString('base64');
const SEM_EXTRA = async png => {
    const C = Data.col.bind(Data), hoje = hojeISO(), d = n => addDias(hoje, n);
    await C('sv2_fotos').set('f1', { refTipo: 'apont', refId: 'ap1', papel: 'antes', dataUrl: png, criadoEm: nowISO(), porId: 'x' });
    const mk = (id, dd, hora, cat, setor, grav, st, obs, extra) => C('sv2_apont').set(id, Object.assign({
      data: dd, hora: hora, criadoEm: new Date(dd + 'T' + hora + ':00').toISOString(), porId: 'outro', porNome: 'Carlos Dias', origem: 'rotina', auditoria: '',
      categoria: cat, setor: setor, grav: grav, gravOrig: grav, gravHist: [], comunicado: true, obs: obs, risco: '', recom: '',
      fotos: [], fotosDepois: [], fotosOff: {}, status: st, resolucao: null, nc: null, hist: [{ ts: nowISO(), porNome: 'Carlos Dias', txt: 'Registrou' }] }, extra || {}));
    await mk('ap1', hoje, '07:40', 'acidente', 'Packing House', 'urgente', 'aberto', 'Piso molhado na saída da câmara fria', { fotos: ['f1'] });
    await mk('ap2', hoje, '09:05', 'epi', 'Campo', 'grave', 'andamento', 'Dois colaboradores sem luva', { nc: { responsavel: 'Ana Souza', prazo: d(3), acao: 'Repor luvas', abertaPor: 'x', abertaPorNome: 'Joana Silva', ts: nowISO(), fechada: false } });
    await mk('ap3', hoje, '10:20', 'residuos', 'Oficina', 'media', 'aberto', 'Óleo usado sem identificação');
    await mk('ap4', hoje, '11:10', 'higiene', 'Refeitório', 'media', 'aberto', 'Dispenser vazio', { nc: { responsavel: 'Ana Souza', prazo: d(-1), acao: 'Repor papel', abertaPor: 'x', abertaPorNome: 'Joana Silva', ts: nowISO(), fechada: false } });
    await mk('ap5', hoje, '08:00', 'estrutura', 'Packing House', 'baixa', 'resolvido', 'Placa solta', { resolucao: { texto: 'Placa recolocada', porId: 'x', porNome: 'Joana Silva', ts: nowISO() } });
    await mk('ap6', hoje, '06:30', 'acidente', 'Packing House', 'media', 'resolvido', 'Extensão no corredor', { resolucao: { texto: 'Recolhida', porId: 'x', porNome: 'Joana Silva', ts: nowISO() } });
    await C('sv2_cfg').set('empresa', { nome: 'Fazenda Exemplo', unidades: [] });
    const cc = (await C('sv2_cfg').get('coletas')) || {};
    await C('sv2_cfg').set('coletas', Object.assign({}, cc, { labs: ['Aqualab', 'Hidrolab', 'IBRA', 'BIOAGRI'], fazendas: [{ prefixo: 'RU', numero: '18', nome: 'Fazenda Norte' }] }));
    for (let n = 11; n <= 18; n++) await C('sv2_talhoes').set('t' + n, { codigo: 'RU' + n + 'TAI24', pivo: 'Pivô ' + (n % 3 + 1), hectares: 4, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    const L = [['SOLO', 'Solo completo', 'IBRA', 185], ['FOLHA', 'Foliar completa', 'IBRA', 96], ['NEMATOIDE', 'Nematoide', 'BIOAGRI', 140], ['FRUTA', 'Resíduos multi', 'BIOAGRI', 620], ['SOLO+RAIZ', 'Solo + raiz', 'IBRA', 240]];
    for (let i = 0; i < 14; i++) { const l = L[i % 5], env = i > 3, os = i > 6, laudo = i > 9;
      await C('sv2_coletas').set('c' + i, { tipo: l[0], data: d(-2 - i * 3), talhao: 'RU' + (11 + i % 8) + 'TAI24', analiseNome: l[1], lab: l[2], valor: l[3], situacao: 'ativa', coletor: i % 2 ? 'Equipe A' : 'Juraci', enviado: env, laudo: laudo, envio: env ? d(-1 - i * 3) : '', os: os ? 'OS-' + (2100 + i) : '', laudoEm: laudo ? d(-i) : '', resultado: laudo ? 'CONFORME' : '', criadoEm: nowISO() }); }
    for (let i = 0; i < 5; i++) await C('sv2_prog').set('pg' + i, { situacao: 'ativa', data: d(i + 1), talhao: 'RU' + (11 + i) + 'TAI24', tipo: L[i][0], coletor: 'Equipe A', criadoEm: nowISO(), criadoPorNome: 'Joana Silva' });
  };
async function semear(p, RAIZ) {
  await p.evaluate('(' + sementeAlmox(RAIZ) + ')()');
  await require(path.join(RAIZ, 'tools/testes/ag_semente.js'))(p, {});
  await require(path.join(RAIZ, 'tools/testes/au_semente.js'))(p, {});
  await p.evaluate(SEM_EXTRA, PNGF('#b9a88a', '#8c7a5c'));
  await p.waitForTimeout(500);
}
async function abre(br, o) {
  o = Object.assign({ w: 1280, h: 800, tema: 'claro', semente: true }, o);
  const cel = o.w < 600;
  const ctx = await br.newContext({ viewport: { width: o.w, height: o.h }, hasTouch: cel, isMobile: cel, deviceScaleFactor: o.dsf || (cel ? 2 : 1), timezoneId: 'America/Fortaleza', locale: 'pt-BR', reducedMotion: o.reduz ? 'reduce' : 'no-preference' });
  await fontes(ctx);
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e).slice(0, 300)));
  await p.goto(o.url ? o.url + '?demo=1' : 'file://' + path.join(o.raiz, o.arq || 'dist/index.html') + '?demo=1'); /* v0.6.22: o.url para abrir por um servidor (janelas no mesmo endereço) */ await p.waitForTimeout(700);
  if (await p.$('#en-senha2')) {
    await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
    await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(900);
  }
  if (o.semente) await semear(p, o.raiz);
  if (o.tema === 'escuro') { await p.evaluate(() => csTrocaTema('escuro')); await p.waitForTimeout(300); }
  return p;
}
const ir = async (p, r, ms) => { await p.evaluate(x => { location.hash = '#/' + x; }, r); await p.waitForTimeout(ms || 900); };
module.exports = { chromium, abre, ir, semear, fontes, sementeAlmox, PNGF, SEM_EXTRA };
