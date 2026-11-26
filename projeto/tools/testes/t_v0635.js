/* EFCwork · v0.6.35 · P3b: Administração › Pastas do Vértice (quem lê cada pasta; só Principal e Líder ★ salvam).
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /EFCdocs/ (clone só de leitura em VERTICE_DIR), no mesmo endereço, como no
   GitHub Pages: o pedido e a resposta passam pela caixa de troca de verdade. ?demo=1, dados inventados (planilha de exemplo do Vértice).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0635.js [--fotos] */
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


const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(80); };
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  console.log('PC (1280):');
  let p = await abre(b, base, 1280, 860);
  await p.evaluate(async () => { const C = Data.col('sv2_users'), t = nowISO();
    await C.set('u-sec1', { nome: 'Paulo Lima', login: 'paulo.lima', perfil: 'secundario', estrela: false, status: 'presente', criadoEm: t });
    await C.set('u-sec2', { nome: 'Rita Souza', login: 'rita.souza', perfil: 'secundario', estrela: false, status: 'presente', criadoEm: t });
    await C.set('u-vis', { nome: 'Vera Dias', login: 'vera.dias', perfil: 'visitante', estrela: false, status: 'presente', criadoEm: t });
    await C.set('u-lid', { nome: 'Lucas Prado', login: 'lucas.prado', perfil: 'secundario', estrela: true, status: 'presente', criadoEm: t }); });
  await esp(p, 600);
  await p.evaluate(() => { window._ev = 0; addEventListener('cwork:usuario', () => window._ev++); location.hash = '#/adm/vertice'; }); await esp(p, 700);
  let t = await p.textContent('.cs-ct');
  conf(/Pastas do Vértice/.test(t) && await p.evaluate(() => !!document.querySelector('.cs-abas a[href="#/adm/vertice"]')), 'Administração tem a aba "Pastas do Vértice" para o Principal');
  const ls = await p.evaluate(() => [...document.querySelectorAll('.vt-ps li')].map(l => l.innerText.replace(/\s+/g, ' ').trim()));
  conf(ls.length === 5 && ls.every(x => /Todos que entram no Cwork/.test(x)) && /Etiquetas/.test(ls[0]) && /POPs e procedimentos/.test(ls[4]), 'as 5 pastas dos Impressos; padrão: todos leem (' + ls.length + ')');
  conf(/só eles salvam|únicos que salvam/.test(t), 'a tela diz a regra: só Principal e Líder ★ salvam');
  let pp = await p.evaluate(() => window.CworkPonteVertice.pastas());
  conf(pp.length === 5 && pp.every(x => x.ler && x.editar && x.salvar), 'Principal: lê, edita e salva em todas (' + JSON.stringify(pp[0]) + ')');
  await p.click('[data-act="vt-pasta"][data-p="Fichas e custódias"]'); await esp(p, 400);
  conf(/Fichas e custódias/.test(await p.textContent('#gv')), 'o lápis abre a gaveta da pasta');
  await dd(p, 'vt:quem', 'Só as pessoas marcadas'); await esp(p, 300);
  const pes = await p.evaluate(() => [...document.querySelectorAll('#gv [data-vtck]')].map(x => x.getAttribute('data-vtck')).join(','));
  conf(/u-sec1/.test(pes) && /u-vis/.test(pes) && !/u-lid/.test(pes), 'na lista entram Secundários e Visitantes; o Líder ★ e o Principal já leem (' + pes + ')');
  await p.check('#gv [data-vtck="u-sec1"]'); if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0635-pc-gaveta.png') }); const ev0 = await p.evaluate(() => window._ev);
  await p.click('[data-act="vt-pasta-ok"]'); await esp(p, 700);
  const cfg = await p.evaluate(() => Data.col('sv2_cfg').get('vertice_pastas'));
  const fc = cfg && cfg.pastas.find(x => x.nome === 'Fichas e custódias');
  conf(fc && fc.todos === false && fc.leitores.join() === 'u-sec1' && cfg.pastas.length === 5 && cfg.alteradoPor === 'Joana Silva', 'salvou em sv2_cfg/vertice_pastas: Fichas e custódias só para Paulo Lima');
  if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0635-pc.png') });
  conf(/1 pessoa marcada/.test(await p.textContent('.vt-ps')), 'a lista mostra "1 pessoa marcada"');
  conf(await p.evaluate(e0 => window._ev > e0, ev0), 'mudou a pasta: o Cwork avisa o Vértice (cwork:usuario)');
  conf(await p.evaluate(() => Data.col('sv2_audit').all().then(l => l.some(x => x.acao === 'vertice_pastas'))), 'vai para o histórico (Atividade)');
  const como = (id, perfil, estrela) => p.evaluate(([id, perfil, estrela]) => { S.user = Object.assign({}, S.user, { id, perfil, estrela }); return window.CworkPonteVertice.pastas(); }, [id, perfil, estrela]);
  const fic = l => l.find(x => x.nome === 'Fichas e custódias');
  pp = await como('u-sec1', 'secundario', false);
  conf(fic(pp).ler && fic(pp).editar && !fic(pp).salvar && pp.every(x => !x.salvar), 'Paulo (Secundário marcado): lê e edita Fichas, não salva nada (ITEM 196)');
  pp = await como('u-sec2', 'secundario', false);
  conf(!fic(pp).ler && !fic(pp).editar && pp.filter(x => x.ler).length === 4, 'Rita (Secundário não marcada): não lê Fichas; lê as outras 4');
  pp = await como('u-vis', 'visitante', false);
  conf(pp.filter(x => x.ler).every(x => x.editar && !x.salvar), 'Visitante: edita sem salvar no que lê');
  pp = await como('u-lid', 'secundario', true);
  conf(pp.every(x => x.ler && x.salvar), 'Líder ★: lê e salva em todas');
  await p.evaluate(() => render()); await esp(p, 400);
  conf(await p.evaluate(() => !document.querySelector('.cs-abas a[href="#/adm/vertice"]')), 'Líder ★ não vê a aba (só o Principal muda as pastas)');
  conf(p._er.length === 0, 'sem erros no console (' + p._er.slice(0, 2).join(' | ') + ')');
  await p.context().close();
  console.log('Celular (390):');
  p = await abre(b, base, 390, 800);
  await p.evaluate(() => { location.hash = '#/adm/vertice'; }); await esp(p, 700);
  const m = await p.evaluate(() => ({ rol: document.documentElement.scrollWidth > innerWidth, bts: [...document.querySelectorAll('.vt-ps .bt')].map(x => Math.round(x.getBoundingClientRect().height)) }));
  conf(!m.rol && m.bts.length === 5 && m.bts.every(h => h >= 44), 'no celular: sem rolagem lateral, botões de 44 px (' + m.bts.join(',') + ')');
  if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0635-cel.png') });
  await p.click('[data-act="vt-pasta"][data-p="Formulários"]'); await esp(p, 400); await dd(p, 'vt:quem', 'Só as pessoas marcadas'); await esp(p, 300);
  if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0635-cel-gaveta.png') });
  conf(p._er.length === 0, 'sem erros no console (celular)');
  await p.context().close();
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok · ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
