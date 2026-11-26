/* EFCwork · v0.6.33 · Documentos da remessa (cadeia de custódia e ficha de envio preenchidas, via assinada na nuvem).
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /EFCdocs/ (clone só de leitura em VERTICE_DIR), no mesmo endereço, como no
   GitHub Pages: o pedido e a resposta passam pela caixa de troca de verdade. ?demo=1, dados inventados (planilha de exemplo do Vértice).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0633.js [--fotos] */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..', '..'), HOJE = process.argv.includes('--hoje') ? process.argv[process.argv.indexOf('--hoje') + 1] : '', VD = process.env.VERTICE_DIR || '/home/claude/eliasgrigori/efcdocs', FOTOS = process.argv.includes('--fotos');
const XLSX = path.join(VD, 'fonte/testes/amostras/amostra-v0617.xlsx'), OUT = path.join(RAIZ, 'tools/testes/telas');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(HOJE || path.join(RAIZ, 'dist'), u.slice(9)) : u.startsWith('/EFCdocs/') ? path.join(VD, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const PDF = t => '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>\nendobj\n% ' + t + '\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n';
const CAMPOS = [['lab.nome', 'Laboratório', 'texto'], ['coleta.os', 'OS', 'texto'], ['coleta.data', 'Data da coleta', 'data'], ['envio.amostras', 'Amostras', 'numero'], ['coleta.coletor', 'Coletor', 'texto'], ['envio.caixas', 'Caixas', 'numero'],
  ['amostras[].n', 'Nº', 'numero'], ['amostras[].identificacao', 'Identificação', 'texto'], ['amostras[].data', 'Data', 'data'], ['amostras[].hora', 'Hora', 'hora'], ['amostras[].analise', 'Análise', 'texto']].map(([chave, rotulo, tipo]) => ({ chave, rotulo, tipo }));

async function abre(b, base, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  await p.evaluate(() => { window._av = []; const a0 = window.aviso; window.aviso = function (t) { window._av.push(t); return a0.apply(this, arguments); }; window._pr = 0; window._prS = []; window.print = () => { window._pr++; window._prS.push(new Error().stack.split('\n').slice(1, 5).join(' | ')); }; window._ab = []; window.open = u => { window._ab.push(u); return {}; }; });
  return p;
}
async function semente(p) {
  const xl = Array.from(fs.readFileSync(XLSX));
  await p.evaluate(async () => {
    const C = n => Data.col(n);
    await C('sv2_cfg').set('coletas', { labs: ['Laboratório A', 'Laboratório B', 'Laboratório C'] });
    await C('sv2_cfg').set('empresa', Object.assign({}, S.empresa || {}, { nome: 'Fazenda Norte', razao: 'Fazenda Norte Agrícola Ltda', unid: { matriz: { nome: 'Sede', end: 'Rodovia Exemplo, km 10', bairro: 'Zona Rural', cep: '00000-000', mun: 'Cidade Exemplo', uf: 'UF' } } }));
    const env = addDias(hojeISO(), -1), c = (id, o) => C('sv2_coletas').set(id, Object.assign({ data: addDias(hojeISO(), -2), situacao: 'ativa', criadoEm: nowISO(), enviado: true, envio: env, coletor: 'Paulo Lima' }, o));
    await c('a1', { tipo: 'SOLO', talhao: 'T01A', analiseNome: 'Solo completo', lab: 'Laboratório A', identificacao: 'Solo T01A', os: 'OS-88' });
    await c('a2', { tipo: 'SOLO', talhao: 'T02A', analiseNome: 'Solo completo', lab: 'Laboratório A', identificacao: 'Solo T02A', os: 'OS-88' });
    await c('b1', { tipo: 'FOLHA', talhao: 'T09B', analiseNome: 'Foliar', lab: 'Laboratório B' });
    await c('c1', { tipo: 'FRUTA', talhao: 'T03A', analiseNome: 'Resíduos', lab: 'Laboratório C' });
  });
  await p.evaluate(async ([xl, pdfT, pdfF]) => {
    const enc = t => new TextEncoder().encode(t).buffer, x = new Uint8Array(xl).buffer;
    lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: 'Cadeia de custódia · Laboratório A', codigo: 'CUS-01', pasta: 'Fichas e custódias', arq: { buf: x, nome: 'custodia.xlsx', bytes: x.byteLength, fmt: 'xlsx' }, pdf: { buf: enc(pdfT), nome: 'c.pdf', bytes: enc(pdfT).byteLength, paginas: 1, orient: 'retrato' } }); await ipOk();
  }, [xl, PDF('CUS'), PDF('FIC')]);
  await esp(p, 400);
  await p.evaluate(async ([xl, pdfT, pdfF]) => {
    const enc = t => new TextEncoder().encode(t).buffer;
    lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: 'Rótulo · Laboratório B', codigo: 'ROT-B', pasta: 'Fichas e custódias', arq: { buf: enc(pdfF), nome: 'FIC-01.pdf', bytes: enc(pdfF).byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' }, pdf: null }); await ipOk();
  }, [xl, PDF('CUS'), PDF('FIC')]);
  await esp(p, 400);
  await p.evaluate(async xl => { const x = new Uint8Array(xl).buffer; lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: 'Rótulo · Laboratório A', codigo: 'ROT-A', pasta: 'Etiquetas', arq: { buf: x, nome: 'rotulo-a.xlsx', bytes: x.byteLength, fmt: 'xlsx' }, pdf: null }); await ipOk(); }, xl);
  await esp(p, 500);
  await p.evaluate(async campos => {
    const cus = S.ipDocs.find(d => d.codigo === 'CUS-01'), fic = S.ipDocs.find(d => d.codigo === 'ROT-B');
    await Data.col('efd_docs').update(cus.id, { pub: Object.assign({}, cus.pub, { preenche: 'docs', campos: campos }) });
    await ktCfgGrava({ 'Laboratório A': { nome: 'Laboratório A Análises Ltda', end: 'Rua das Acácias, 100', cidade: 'Cidade Exemplo', uf: 'UX', cep: '12345-678' } });
    await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: cus.nome, docId: cus.id, lab: 'Laboratório A', papel: 'doc', copias: 'uma', ordem: 2, ativo: true, quando: 'sempre', analise: '' });
    await Data.col('sv2_impressos').add({ v: 1, ponto: 'coletas.envio', nome: fic.nome, docId: fic.id, lab: 'Laboratório B', papel: 'rotulo', copias: 'porCaixa', ordem: 1, ativo: true, quando: 'sempre', analise: '' });
  }, CAMPOS);
  await esp(p, 500);
}
const kA = p => p.evaluate(() => S.coletas.find(c => c.id === 'a1').envio + '|Laboratório A');
const secao = p => p.evaluate(() => { const r = document.querySelector('#gv .dr'); return r ? { t: r.innerText + ' ' + [...r.querySelectorAll('[data-sit]')].map(x => x.getAttribute('title')).join(' | '), itens: [...r.querySelectorAll('.dr-i, tr, .dr-c')].length } : null; });
const vertFr = p => p.frames().find(f => /\/EFCdocs\//.test(f.url()));

(async () => {
  if (!fs.existsSync(path.join(VD, 'index.html')) || !fs.existsSync(XLSX)) { console.log('Falta o Vértice em ' + VD + ' (git clone https://github.com/EliasGrigori/efcdocs)'); process.exit(1); }
  console.log('— Regras do Firestore (arquivo para colar)');
  { const A = fs.readFileSync(path.join(RAIZ, 'docs/REGRAS-FIRESTORE-EFCwork-v0.6.32-PROPOSTA.txt'), 'utf8'), B = fs.readFileSync(path.join(RAIZ, 'docs/REGRAS-FIRESTORE-EFCwork-v0.6.33-PROPOSTA.txt'), 'utf8');
    const semR6 = B.replace(/\/\/ EFCwork v0\.6\.33[\s\S]*?(?=\/\/ EFCwork v0\.6\.32)/, '').replace(/ {4}\/\/ \[R6\] sv2_rem_docs[\s\S]*?(?= {4}\/\/ sv2_treinos)/, '');
    conf(semR6 === A, 'o arquivo da v0.6.33 é o da v0.6.32 mais o bloco [R6] (nada mais mudou)');
    const cont = c => (B.match(new RegExp('\\' + c, 'g')) || []).length; conf(cont('{') === cont('}') && cont('(') === cont(')'), 'chaves e parênteses fechados (' + cont('{') + ' chaves)');
    const r6 = B.slice(B.indexOf('match /sv2_rem_docs/'), B.indexOf('// sv2_treinos'));
    conf(/allow delete: if false;[\s\S]*allow delete: if false;/.test(r6) && /meu\('porId'\)/.test(r6) && /soMuda\(\['removido', 'removidoEm', 'removidoPor', 'removidoPorId', 'srv'\]\)/.test(r6) && /size\(\) <= 900000/.test(r6), 'R6: nada se apaga, grava só em nome de quem lança, tirar muda só "removido", arquivo até 900 mil letras');
    conf(/keys\(\)\.hasOnly/.test(r6) && /in \['impresso', 'aberto', 'preenchido', 'foto', 'pdf'\]/.test(r6) && /porNome', ''\) == eu\(\)/.test(r6) && /resource\.data\.get\('removido', false\) == false/.test(r6) && /removidoPorId', ''\) == request\.auth\.uid/.test(r6) && /sv2_rem_arq[\s\S]*allow read: if lanca\(\)/.test(r6), 'R6 endurecida (revisor): só os campos combinados, tipo da lista, nome de quem grava conferido, tirar uma vez só com a conta de quem tirou, arquivo lido só por quem lança'); }
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch(), p = await abre(b, base, 1280, 860);
  await semente(p);
  const k = await kA(p), kB = k.split('|')[0] + '|Laboratório B';
  if (HOJE) { /* só as fotos de HOJE (versão publicada), com os mesmos dados */
    fs.mkdirSync(OUT, { recursive: true });
    await p.evaluate(k => coAbreLote(k), k); await esp(p, 700); await p.screenshot({ path: path.join(OUT, 'v0633-hoje-gaveta.png') });
    await p.evaluate(k => ktPapAbre([k]), k); await esp(p, 600); await p.screenshot({ path: path.join(OUT, 'v0633-hoje-papeis.png') });
    const c = await abre(b, base, 390, 844); await semente(c); await c.evaluate(k => coAbreLote(k), k); await esp(c, 700); await c.screenshot({ path: path.join(OUT, 'v0633-hoje-cel.png') });
    console.log('fotos de hoje: ' + (await p.evaluate(() => VERSAO))); await b.close(); srv.close(); process.exit(0); }
  console.log('— A seção na remessa');
  await p.evaluate(k => coAbreLote(k), k); await esp(p, 600);
  let s = await secao(p); const foto = async n => { if (FOTOS) { fs.mkdirSync(OUT, { recursive: true }); await p.screenshot({ path: path.join(OUT, 'v0633-pc-' + n + '.png') }); } };
  await foto('gaveta-antes');
  conf(s && /Documentos da remessa/.test(s.t) && /0 de 2 prontos/.test(s.t), 'a remessa do Laboratório A tem "Documentos da remessa · 0 de 2 prontos" (rótulo e custódia exigidos)');
  conf(s && /Rótulo destinatário e remetente/.test(s.t) && /Cadeia de custódia/.test(s.t) && !/Ficha/.test(s.t), 'lista os papéis do laboratório: o rótulo do sistema (sem modelo) e a cadeia de custódia');
  conf(s && (s.t.match(/Falta/g) || []).length === 2, 'os dois aparecem como "Falta"');
  conf(await p.evaluate(() => !!document.querySelector('#gv [data-act="dr-imp"][title*="Vértice"]')), 'a custódia (planilha) tem o botão "Abrir no Vértice com os dados da remessa"');
  await p.evaluate(k => coAbreLote(k), kB); await esp(p, 500); s = await secao(p);
  await foto('gaveta-labB');
  conf(s && /Rótulo · Laboratório B/.test(s.t) && !/destinatário e remetente/.test(s.t) && /0 de 1/.test(s.t), 'o Laboratório B usa o modelo de rótulo dele (no lugar do rótulo do sistema) e não tem custódia nem ficha');
  console.log('— Imprimir o rótulo');
  await p.evaluate(k => coAbreLote(k), k); await esp(p, 500);
  await p.click('#gv [data-act="dr-imp"][data-id="__rotulo"]'); await esp(p, 900);
  { const n = await p.evaluate(() => window._pr); conf(n === 1, 'o rótulo foi para a impressão uma vez (' + n + ')'); if (n !== 1) console.log(await p.evaluate(() => window._prS.join('\n'))); }
  s = await secao(p);
  conf(/1 de 2 prontos/.test(s.t) && /Impresso/.test(s.t) && /Joana Silva/.test(s.t), 'o rótulo fica "Impresso", com a hora e quem imprimiu; 1 de 2 prontos');
  conf(await p.evaluate(() => S.drDocs.some(x => x.tipo === 'impresso' && x.item === '__rotulo' && x.porId === S.user.id)), 'o registro foi para a nuvem (sv2_rem_docs), em nome de quem imprimiu');
  console.log('— Preencher a custódia no Vértice de verdade');
  const cusId = await p.evaluate(() => S.ipDocs.find(d => d.codigo === 'CUS-01').id);
  await p.click('#gv [data-act="dr-imp"][data-id]:not([data-id="__rotulo"])'); await esp(p, 400);
  conf(await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('efcwork-dr-pedidos') || '{}')).length === 1), 'o pedido ficou anotado neste aparelho, esperando a resposta');
  /* o Vértice ainda não tem o modelo: responde sem-documento; o EFCwork leva o original e pede de novo */
  await p.waitForFunction(() => Object.values(JSON.parse(localStorage.getItem('efcwork-dr-pedidos') || '{}')).some(x => x.tent === 1), null, { timeout: 25000 }).then(() => conf(true, 'sem o modelo no Vértice deste aparelho: o EFCwork levou o original e pediu de novo, sozinho'), () => conf(false, 'sem o modelo no Vértice deste aparelho: o EFCwork levou o original e pediu de novo, sozinho'));
  let vf = null; for (let i = 0; i < 40 && !(vf = vertFr(p)); i++) await esp(p, 250);
  conf(!!vf, 'o Vértice abriu na janela de dentro');
  const temNoV = await p.waitForFunction(id => { const f = document.querySelector('#vt-fr iframe') || document.querySelector('.jn-fr iframe[data-j="docs"]'); try { return /#\/arq\//.test(f.contentWindow.location.hash) && f.contentWindow.location.hash.indexOf(id) > 0; } catch (e) { return false; } }, cusId, { timeout: 25000 }).then(() => true, () => false);
  conf(temNoV, 'o Vértice guardou o modelo que veio do Cwork e abriu');
  const pid2 = await p.evaluate(() => Object.entries(JSON.parse(localStorage.getItem('efcwork-dr-pedidos') || '{}')).find(([, x]) => x.tent === 1)[0]);
  vf = vertFr(p); await vf.evaluate(pid => { location.hash = '#/pedido/' + pid; }, pid2); /* = tocar em "Ver e imprimir" no aviso do Vértice */
  const pronto = await vf.waitForSelector('[data-pedido="pronto"]', { timeout: 25000 }).then(() => true, () => false);
  conf(pronto, 'o Vértice montou a cópia preenchida e mostra a prévia');
  if (pronto) {
    const txt = await vf.evaluate(() => document.querySelector('.pd-paginas').textContent);
    conf(/OS-88/.test(txt) && /Solo T01A/.test(txt) && /Solo T02A/.test(txt) && /Laboratório A/.test(txt), 'na prévia: O.S, laboratório e as duas amostras da remessa (' + txt.replace(/\s+/g, ' ').slice(0, 90) + '…)');
    await vf.evaluate(() => { window.print = () => { window._pr = (window._pr || 0) + 1; }; document.querySelectorAll('iframe').forEach(f => { try { f.contentWindow.print = () => {}; } catch (e) {} }); });
    if (FOTOS) { fs.mkdirSync(OUT, { recursive: true }); await p.screenshot({ path: path.join(OUT, 'v0633-pc-vertice-previa.png') }); }
    await vf.click('[data-pedido-imprimir]');
    const feito = await p.waitForFunction(() => S.drDocs.some(x => x.tipo === 'preenchido'), null, { timeout: 20000 }).then(() => true, () => false);
    conf(feito, 'Imprimir no Vértice → a resposta volta e o EFCwork grava "Preenchido no Vértice" na nuvem');
    const r = await p.evaluate(() => S.drDocs.find(x => x.tipo === 'preenchido'));
    const dj = r && JSON.parse(r.dadosJson || '{}');
    conf(r && r.docId === cusId && r.rev === 1 && r.paginas >= 1 && dj['coleta.os'] === 'OS-88' && dj['amostras[]'].length === 2, 'o registro guarda o modelo, a versão, as páginas e os dados usados (para imprimir de novo igual em outro aparelho)');
    conf(r && !('unidade.nome' in dj) && !('usuario.nome' in dj), 'no pedido foram só as chaves que a custódia tem marcadas (o Vértice recusa as outras)');
    conf(await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('efcwork-dr-pedidos') || '{}')).length === 0, null, { timeout: 8000 }).then(() => true, () => false), 'a resposta foi lida e apagada da caixa, depois de gravada');
  }
  await p.evaluate(() => { if (typeof jnFechar === 'function') try { jnFechar('docs'); } catch (e) {} }); await esp(p, 300);
  { const bt = await p.$('#cf.is-open button:has-text("Fechar")'); if (bt) { await bt.click(); await esp(p, 400); } }
  await p.evaluate(k => { if (!S.gv) coAbreLote(k); else gvDesenha(true); }, k); await esp(p, 500); s = await secao(p);
  await foto('gaveta-preenchido');
  conf(/2 de 2 prontos/.test(s.t) && /Preenchido no Vértice/.test(s.t), 'a custódia fica "Preenchido no Vértice"; 2 de 2 prontos');
  console.log('— Via assinada');
  const png = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 1600; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1200, 1600); g.fillStyle = '#000'; g.font = '60px sans-serif'; g.fillText('CADEIA DE CUSTODIA - assinada', 60, 200); for (let i = 0; i < 400; i++) g.fillRect(Math.random() * 1200, 300 + Math.random() * 1200, 3, 3); return c.toDataURL('image/png'); });
  const inp = await p.$('#gv input[data-drfile]:not([data-id="__rotulo"])');
  await inp.setInputFiles({ name: 'custodia-assinada.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') });
  const anexou = await p.waitForFunction(() => S.drDocs.some(x => x.tipo === 'foto'), null, { timeout: 10000 }).then(() => true, () => false);
  conf(anexou, 'a foto da via assinada foi para a nuvem');
  const ax = await p.evaluate(async () => { const r = S.drDocs.find(x => x.tipo === 'foto'); const a = await Data.col('sv2_rem_arq').get(r.arqId); return { len: a.b64.length, jpg: /^data:image\/jpeg/.test(a.b64), por: a.porId === S.user.id && r.porId === S.user.id }; });
  conf(ax.jpg && ax.len < 900000 && ax.por, 'a foto foi reduzida (JPEG, ' + Math.round(ax.len / 1000) + ' mil letras, limite 900 mil) e gravada em nome de quem anexou');
  await esp(p, 300); s = await secao(p);
  conf(/Via assinada anexada/.test(s.t) && !!(await p.$('#gv [data-act="dr-ver"]')), 'a custódia fica "Via assinada anexada", com o anexo para abrir');
  await p.click('#gv [data-act="dr-ver"]'); await esp(p, 500);
  conf(!!(await p.$('#co-fv img')) && !!(await p.$('#co-fv .dr-fva [data-act="dr-tira"]')), 'abrir o anexo mostra a foto, com a lixeira no canto de cima');
  if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0633-pc-via-assinada.png') });
  await p.click('#co-fv [data-act="dr-tira"]'); await esp(p, 600);
  conf(!(await p.$('#co-fv')) && await p.evaluate(() => S.drDocs.some(x => x.tipo === 'foto' && x.removido === true && x.removidoPor === 'Joana Silva' && x.removidoPorId === S.user.id)), 'a lixeira tira da remessa (fica marcado "removido", nada se apaga)');
  s = await secao(p); conf(/Preenchido no Vértice/.test(s.t) && !/Via assinada anexada/.test(s.t), 'sem a foto, volta a "Preenchido no Vértice"');
  const big = Buffer.concat([Buffer.from(PDF('x')), Buffer.alloc(700000, 32)]);
  await (await p.$('#gv input[data-drfile]:not([data-id="__rotulo"])')).setInputFiles({ name: 'grande.pdf', mimeType: 'application/pdf', buffer: big }); await esp(p, 600);
  conf(await p.evaluate(() => /limite é/.test((document.querySelector('.aviso, #avisos, .toast') || document.body).innerText) && !S.drDocs.some(x => x.tipo === 'pdf')), 'PDF acima de 650 KB não entra, com aviso do que fazer');
  await (await p.$('#gv input[data-drfile]:not([data-id="__rotulo"])')).setInputFiles({ name: 'ficha.pdf', mimeType: 'application/pdf', buffer: Buffer.from(PDF('ok')) });
  conf(await p.waitForFunction(() => S.drDocs.some(x => x.tipo === 'pdf' && !x.removido), null, { timeout: 8000 }).then(() => true, () => false), 'PDF pequeno entra como anexo da remessa');
  console.log('— Papéis deste envio (depois de Enviar)');
  await p.evaluate(k => ktPapAbre([k]), k); await esp(p, 500);
  await foto('papeis-envio');
  { const t = await p.textContent('#gv'); conf(/abre no Vértice já preenchido/.test(t) && /imprime aqui/.test(t) && !!(await p.$('#gv [data-act="kt-anexar-aqui"]')), 'na janela: o rótulo "imprime aqui", a custódia "abre no Vértice já preenchido" e o botão "Anexar papel deste laboratório"');
    conf(await p.evaluate(() => Object.values(S.fm.sel).filter(Boolean).length === 2), 'os dois vêm marcados'); }
  await p.evaluate(() => { const id = Object.keys(S.fm.sel).find(x => x !== '__rotulo'); S.fm.sel[id] = false; gvDesenha(true); });
  { const n0 = await p.evaluate(() => window._pr); await p.click('#gv [data-act="kt-imprimir"]'); await esp(p, 900); const n1 = await p.evaluate(() => window._pr);
    conf(n1 === n0 + 1 && !(await p.$('#gv [data-act="kt-imprimir"]')), 'desmarcar a custódia: sai só o rótulo, e a janela fecha'); }
  console.log('— Anexar o rótulo do Vértice pela própria janela e abrir um por vez');
  await p.evaluate(k => ktPapAbre([k]), k); await esp(p, 500);
  await p.click('#gv [data-act="kt-anexar-aqui"]'); await esp(p, 400);
  await p.click('[data-dd="kt:papel"] .dd-b'); await p.click('[data-dd="kt:papel"] [data-v="rotulo"]'); await esp(p, 200);
  { const rid = await p.evaluate(() => S.ipDocs.find(d => d.codigo === 'ROT-A').id); await p.click('[data-dd="kt:doc"] .dd-b'); await p.click('[data-dd="kt:doc"] [data-v="' + rid + '"]'); await esp(p, 200); }
  await p.click('[data-act="kt-anexar-ok"]'); await esp(p, 700);
  { const t = await p.textContent('#gv'); conf(/Papéis deste envio/.test(t) && /Rótulo · Laboratório A/.test(t) && !/destinatário e remetente/.test(t), 'anexou e voltou para a janela: o modelo de rótulo entra no lugar do rótulo do sistema'); }
  await p.click('#gv [data-act="kt-imprimir"]'); await esp(p, 900);
  if (FOTOS) { await p.evaluate(() => { const a = document.querySelector('.jn-ab'); if (a) a.click(); }); await esp(p, 300); await p.screenshot({ path: path.join(OUT, 'v0633-pc-papeis-proximo.png') }); }
  conf(/Abrir o próximo no Vértice/.test(await p.textContent('#gv')), 'dois papéis do Vértice: abre o primeiro e o botão vira "Abrir o próximo no Vértice"');
  await p.evaluate(() => { const a = document.querySelector('.jn-ab'); if (a) a.click(); }); await esp(p, 300);
  await p.click('#gv [data-act="kt-imprimir"]'); await esp(p, 900);
  conf(!(await p.$('#gv [data-act="kt-imprimir"]')) && await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('efcwork-dr-pedidos') || '{}')).some(x => x.nome.indexOf('Cadeia') === 0)), 'o segundo (a custódia) foi como pedido de preencher, e a janela fechou');
  await p.evaluate(() => { if (typeof jnFechar === 'function') try { jnFechar('docs'); } catch (e) {} }); await esp(p, 300);
  { const bt = await p.$('#cf.is-open button:has-text("Fechar")'); if (bt) { await bt.click(); await esp(p, 400); } }
  console.log('— Laboratório sem endereço e sem kit');
  { const kC = k.split('|')[0] + '|Laboratório C'; await p.evaluate(k => ktPapAbre([k]), kC); await esp(p, 500); const t = await p.textContent('#gv');
    if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0633-pc-papeis-semend.png') });
    conf(/falta o endereço do laboratório/.test(t) && !!(await p.$('#gv [data-act="kt-end-aqui"]')) && !(await p.$('#gv .fm-av.cr')), 'sem endereço: a linha do rótulo traz "Cadastrar endereço", sem faixa vermelha');
    conf(await p.evaluate(() => !S.fm.sel.__rotulo), 'e o rótulo vem desmarcado');
    await p.click('#gv [data-act="kt-imprimir"]'); await esp(p, 300); conf(/Marque pelo menos um papel/.test(await p.textContent('#gv')), 'Imprimir sem nada marcado pede para marcar');
    await p.keyboard.press('Escape'); await esp(p, 300); }
  console.log('— Quem pode');
  conf(await p.evaluate(() => { const u = S.user, pf = u.perfil; u.perfil = 'visitante'; const v = coPode(); u.perfil = pf; return v === false; }), 'visitante não lança: não vê os botões (coPode)');
  console.log('— Os cinco modelos (PC e celular)');
  const fotos = async (pg, nome) => { for (const m of [1, 2, 3, 4, 5]) { await pg.evaluate(([m, k]) => { S.drModelo = m; S._rdAberto = ''; if (S.gv) gvDesenha(true); else coAbreLote(k); }, [m, k]); await esp(pg, 350);
    const o = await pg.evaluate(() => ({ lado: document.documentElement.scrollWidth > innerWidth, tem: !!document.querySelector('#gv .dr .dr-et') }));
    conf(o.tem && !o.lado, nome + ' · OPÇÃO 2 (etapas por papel) desenha sem rolar para o lado');
    if (FOTOS) { const el = await pg.$('#gv .dr'); if (el) await el.screenshot({ path: path.join(OUT, 'v0633-' + nome + '-m' + m + '.png') }); } } };
  await p.evaluate(() => { while (S.camadas && S.camadas.length) { const c = S.camadas.pop(); try { c.fechar(); } catch (e) {} } }); await p.keyboard.press('Escape'); await esp(p, 300);
  await p.evaluate(k => coAbreLote(k), k); await esp(p, 500);
  await fotos(p, 'pc');
  conf(p._er.length === 0, 'console sem erro no PC (' + p._er.slice(0, 2).join(' | ') + ')');
  const c = await abre(b, base, 390, 844); await semente(c);
  await c.evaluate(k => coAbreLote(k), k); await esp(c, 600);
  const alt = await c.evaluate(() => [...document.querySelectorAll('#gv .dr-ac .bt')].map(x => Math.round(x.getBoundingClientRect().height)));
  conf(alt.length && alt.every(h => h >= 44), 'no celular os botões da seção têm 44 px (' + Array.from(new Set(alt)).join(', ') + ')');
  await fotos(c, 'cel');
  conf(c._er.length === 0, 'console sem erro no celular (' + c._er.slice(0, 2).join(' | ') + ')');
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok · ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
