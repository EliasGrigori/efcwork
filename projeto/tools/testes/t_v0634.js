/* EFCwork · v0.6.34 · P3a: o Vértice Docs vira uma aba do Cwork (porta CworkPonteVertice, mensagens, sw.js).
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /EFCdocs/ (clone só de leitura em VERTICE_DIR), no mesmo endereço, como no
   GitHub Pages: o pedido e a resposta passam pela caixa de troca de verdade. ?demo=1, dados inventados (planilha de exemplo do Vértice).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0634.js [--fotos] */
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

const vertFr = p => p.frames().find(f => /\/EFCdocs\//.test(f.url()) && f.parentFrame() && !f.parentFrame().parentFrame() && f !== p.mainFrame());
const caixa = p => p.evaluate(() => { const b = document.querySelector('#vt-fr'), l = document.querySelector('#vt-lugar'); if (!b) return null; const r = b.getBoundingClientRect(), q = l ? l.getBoundingClientRect() : null;
  return { hidden: b.hidden, r: [r.left, r.top, r.width, r.height].map(Math.round), l: q ? [q.left, q.top, q.width, q.height].map(Math.round) : null, rol: document.documentElement.scrollWidth > innerWidth, bottom: Math.round(r.bottom), ih: innerHeight }; });
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  console.log('PC (1280):');
  let p = await abre(b, base, 1280, 860);
  await p.evaluate(() => { window._ev = 0; addEventListener('cwork:usuario', () => window._ev++); });
  let m = await p.evaluate(() => ({ areas: [...document.querySelectorAll('.cs-nav a.cs-it')].map(a => a.getAttribute('href')), apps: [...document.querySelectorAll('.cs-app-l')].map(a => a.getAttribute('data-app')) }));
  const iD = m.areas.indexOf('#/documentos'), iV = m.areas.indexOf('#/vertice');
  conf(iV >= 0 && iV === iD + 1, 'o Vértice Docs é uma área do menu, logo depois de Documentos (' + m.areas.join(' ') + ')');
  conf(m.apps.indexOf('docs') < 0 && m.apps.indexOf('sabia') >= 0, 'em "Apps da família" fica só o Sabiá (' + m.apps.join(',') + ')');
  const u = await p.evaluate(() => { const x = window.CworkPonteVertice; let troca = false; try { window.CworkPonteVertice = null; } catch (e) {} troca = window.CworkPonteVertice === null; return { v: x.versao, rec: x.recursos.join(','), u: x.usuario(), past: x.pastas(), troca, cong: Object.isFrozen(x) }; });
  conf(u.v === 1 && u.u && u.u.uid && u.u.nome === 'Joana Silva' && u.u.perfil === 'principal' && u.u.estrela === false && u.u.acesso === 'completo' && u.u.salvar === true && !('contaTeste' in u.u), 'a porta devolve quem entrou, com o nome e o perfil do cadastro do Cwork (' + JSON.stringify(u.u) + ')');
  conf(!u.troca && u.cong && Array.isArray(u.past) && u.past.length === 0, 'a porta não pode ser trocada por outro código do Cwork, e pastas() fica vazia até a P3b');
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 2500);
  let fr = vertFr(p);
  conf(!!fr && /\/EFCdocs\/\?em=cwork/.test(fr.url()), 'a área abre o Vértice de verdade no quadro, com ?em=cwork (' + (fr && fr.url()) + ')');
  let c = await caixa(p);
  conf(c && !c.hidden && c.l && c.r.every((v, k) => Math.abs(v - c.l[k]) <= 1) && c.bottom <= c.ih && !c.rol, 'o quadro fica por cima do lugar da área, dentro da tela, sem rolagem lateral (' + JSON.stringify(c) + ')');
  await esp(p, 2500); fr = vertFr(p);
  const dentro = fr ? await fr.evaluate(() => ({ cls: document.documentElement.className, txt: document.body.innerText.slice(0, 3000) })) : {};
  conf(/em-cwork/.test(dentro.cls || ''), 'o Vértice entra no modo aba (esconde a marca e o cartão do perfil)');
  const deDentro = await fr.evaluate(() => { try { return parent.CworkPonteVertice.usuario().nome; } catch (e) { return 'erro ' + e; } });
  conf(deDentro === 'Joana Silva' && !/Entre no Cwork|abre pelo Cwork/.test(dentro.txt || ''), 'de dentro do quadro, o Vértice lê quem entrou no Cwork e não pede login (' + deDentro + ')');
  const ver = await p.evaluate(() => S.vtVer);
  conf(/^v?0\.6\.\d+/.test(ver), 'o Cwork recebeu o "pronto" do Vértice (' + ver + ')');
  await fr.evaluate(() => parent.postMessage({ de: 'vertice', tipo: 'arquivo', nome: 'Custódia Laboratório A.xlsx', tipoArquivo: 'planilha' }, location.origin)); await esp(p, 300);
  conf(/Custódia Laboratório A\.xlsx/.test(await p.textContent('#vt-arq')), 'o cabeçalho mostra o nome do arquivo aberto no Vértice');
  await p.evaluate(() => { postMessage({ de: 'vertice', tipo: 'arquivo', nome: 'Falso.xlsx' }, location.origin); postMessage({ de: 'outro', tipo: 'arquivo', nome: 'Falso2' }, '*'); }); await esp(p, 300);
  conf(!/Falso/.test(await p.textContent('#vt-arq')), 'mensagem que não vem do quadro do Vértice é ignorada');
  await fr.evaluate(() => parent.postMessage({ de: 'vertice', tipo: 'arquivo', nome: null, tipoArquivo: null }, location.origin)); await esp(p, 300);
  conf(/Nenhum arquivo aberto/.test(await p.textContent('#vt-arq')), 'fechou o arquivo: "Nenhum arquivo aberto"');
  await p.evaluate(() => { document.querySelector('#vt-fr iframe')._marca = 7; });
  await p.click('.cs-nav a[href="#/inicio"]'); await esp(p, 600);
  c = await caixa(p); conf(c && c.hidden, 'fora da área, o quadro some da frente (continua vivo)');
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 600);
  c = await caixa(p);
  conf(await p.evaluate(() => document.querySelector('#vt-fr iframe')._marca === 7) && c && !c.hidden, 'ao voltar, é o mesmo Vértice, sem recarregar (nada se perde ao trocar de área)');
  const ev0 = await p.evaluate(() => window._ev);
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { nome: 'Joana Silva Souza' }); render(); }); await esp(p, 300);
  conf(await p.evaluate(e0 => window._ev > e0 && window.CworkPonteVertice.usuario().nome === 'Joana Silva Souza', ev0), 'mudou o cadastro: o Cwork avisa o Vértice (cwork:usuario)');
  const ped = await p.evaluate(() => { jnAbrir('docs', '#/abrir/teste123'); return document.querySelector('#vt-fr iframe').contentWindow.location.href; }); await esp(p, 800);
  conf(await p.evaluate(() => !document.querySelector('.jn-fr iframe[data-j="docs"]') && S.rota.area === 'vertice') && /#\/abrir\/teste123/.test(ped), 'quem já abria o Vértice (Impressos, Ponte, remessa) passa a abrir a aba, com o pedido (' + ped + ')');
  await p.click('[data-act="vt-janela"]'); await esp(p, 1200);
  conf(await p.evaluate(() => !document.querySelector('#vt-fr') && !!document.querySelector('.jn-fr iframe[data-j="docs"]')), 'volta: o botão do cabeçalho abre a janela por cima de antes, e a aba fecha o quadro dela (nunca os dois vivos)');
  if (FOTOS) await p.screenshot({ path: path.join(OUT, 'v0634-janela.png') });
  const naJan = await p.evaluate(() => { jnAbrir('docs', '#/abrir/z9'); const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); let h = ''; try { h = f.contentWindow.location.href; } catch (e) {} return { vt: !!document.querySelector('#vt-fr'), h }; }); await esp(p, 600);
  conf(!naJan.vt && /#\/abrir\/z9/.test(naJan.h), 'com a janela por cima aberta, o pedido vai para ela (sem pergunta no meio do trabalho)');
  await p.evaluate(() => { if (typeof jnIr === 'function') jnIr('efcwork'); }); await esp(p, 400);
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 400);
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 600);
  await p.evaluate(() => { render(); render(); }); await esp(p, 400);
  conf(await p.evaluate(() => !document.querySelector('#cf') && !document.querySelector('#vt-fr') && /aberto na janela por cima/.test(document.querySelector('#vt-lugar').innerText)), 'com a janela por cima aberta, a área avisa e não pergunta sozinha a cada desenho');
  await p.click('[data-act="vt-trazer"]'); await esp(p, 400);
  const pergunta = await p.evaluate(() => !!document.querySelector('#cf') && /Trazer o Vértice para a aba/.test(document.querySelector('#cf').innerText));
  await p.click('#cf [data-act="cf-sim"]'); await esp(p, 1500);
  conf(pergunta && await p.evaluate(() => !!document.querySelector('#vt-fr iframe') && !document.querySelector('.jn-fr iframe[data-j="docs"]')), '"Trazer para a aba" pergunta antes e troca a janela pela aba');
  /* gaveta aberta (fila de papéis): o pedido vai para a janela por cima e a gaveta fica */
  await p.evaluate(() => { location.hash = '#/documentos'; }); await esp(p, 600);
  const gav = await p.evaluate(() => { S.gv = { k: 'teste' }; jnAbrir('docs', '#/abrir/g1'); return { area: S.rota.area, jan: !!document.querySelector('.jn-fr iframe[data-j="docs"]'), gv: !!S.gv }; }).catch(e => ({ erro: String(e) }));
  conf(gav.jan && gav.gv && gav.area === 'documentos', 'com gaveta aberta, "Abrir no Vértice" usa a janela por cima e a gaveta não se perde (' + JSON.stringify(gav) + ')');
  await p.evaluate(() => { S.gv = null; const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); if (f) f.remove(); S.jnAbertas = []; S.jnAtiva = 'efcwork'; jnDesenha(); location.hash = '#/vertice'; }); await esp(p, 1500);
  const uid0 = await p.evaluate(() => S.user.id);
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { id: 'outra-conta' }); render(); }); await esp(p, 500);
  conf(await p.evaluate(() => !document.querySelector('#vt-fr') || document.querySelector('#vt-fr iframe')._marca !== 7), 'trocou de conta: o Vértice recomeça, sem o arquivo da pessoa anterior');
  await p.evaluate(u => { S.user = Object.assign({}, S.user, { id: u }); render(); }, uid0); await esp(p, 800);
  if (FOTOS) { await esp(p, 1500); await p.screenshot({ path: path.join(OUT, 'v0634-aba-pc.png') }); }
  /* tela sem permissão some */
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: false }); render(); }); await esp(p, 500);
  m = await p.evaluate(() => ({ areas: [...document.querySelectorAll('.cs-nav a.cs-it')].map(a => a.getAttribute('href')), fr: !!document.querySelector('#vt-fr'), rota: S.rota.area }));
  conf(m.areas.indexOf('#/vertice') < 0 && !m.fr, 'Secundário sem ★: a área some do menu e o quadro fecha');
  const us = await p.evaluate(() => window.CworkPonteVertice.usuario());
  conf(us && us.acesso === 'documento' && us.salvar === false, 'Secundário sem ★: a porta diz ao Vértice "só o documento, sem salvar" (ITENS 195 e 196)');
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 300); await p.evaluate(() => { location.hash = '#/vertice'; }); await esp(p, 500);
  conf(await p.evaluate(() => S.rota.area !== 'vertice' && !document.querySelector('#vt-fr')), 'pelo endereço #/vertice também não abre (cai na primeira tela liberada)');
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: true }); render(); }); await esp(p, 300);
  conf(await p.evaluate(() => !!document.querySelector('.cs-nav a[href="#/vertice"]')), 'Líder ★ vê a área');
  const ev1 = await p.evaluate(() => window._ev);
  await p.evaluate(() => csSair()); await esp(p, 1200);
  conf(await p.evaluate(e1 => window._ev > e1 && window.CworkPonteVertice && window.CworkPonteVertice.usuario() === null, ev1), 'saiu da conta: a porta continua e usuario() devolve null, com aviso ao Vértice');
  conf(p._er.length === 0, 'sem erros no console (' + p._er.slice(0, 3).join(' | ') + ')');
  await p.context().close();
  console.log('Celular (390):');
  p = await abre(b, base, 390, 800);
  await p.evaluate(() => { location.hash = '#/vertice'; }); await esp(p, 3000);
  c = await caixa(p);
  const cel = await p.evaluate(() => { const t = document.querySelector('.cs-topo'), bx = document.querySelector('.cs-baixo'), r = document.querySelector('#vt-fr').getBoundingClientRect(); return { topo: t ? Math.round(t.getBoundingClientRect().bottom) : 0, baixo: bx && getComputedStyle(bx).display !== 'none' ? Math.round(bx.getBoundingClientRect().top) : innerHeight, t: Math.round(r.top), b: Math.round(r.bottom) }; });
  conf(await p.evaluate(() => getComputedStyle(document.querySelector('.cs-baixo')).display === 'none'), 'no celular, na área Vértice, a barra de baixo do Cwork sai (ITEM 190, OPÇÃO 2)');
  conf(c && !c.hidden && !c.rol && cel.t >= cel.topo && cel.b <= cel.baixo, 'no celular o quadro fica entre a barra de cima e a de baixo, sem rolagem lateral (' + JSON.stringify(cel) + ')');
  await p.mouse.wheel(0, 600); await p.evaluate(() => scrollTo(0, 500)); await esp(p, 400);
  const rol = await p.evaluate(() => { const t = document.querySelector('.cs-topo').getBoundingClientRect().bottom, r = document.querySelector('#vt-fr').getBoundingClientRect(); return { sy: scrollY, t: Math.round(t), top: Math.round(r.top) }; });
  conf(rol.sy === 0 && rol.top >= rol.t, 'a página da área não rola: o quadro nunca sobe por cima da barra de cima (' + JSON.stringify(rol) + ')');
  if (FOTOS) { await esp(p, 1200); await p.screenshot({ path: path.join(OUT, 'v0634-aba-cel.png') }); }
  await p.click('[data-act="cs-menu"]'); await esp(p, 500);
  conf(await p.evaluate(() => { const l = document.querySelector('.cs-lado').getBoundingClientRect(), x = document.elementFromPoint(l.left + 40, l.top + 200); return !!(x && x.closest('.cs-lado')); }), 'o menu do celular abre por cima do quadro');
  conf(p._er.length === 0, 'sem erros no console (celular)');
  await p.context().close();
  const sw = fs.readFileSync(path.join(RAIZ, 'dist/sw.js'), 'utf8');
  conf(/indexOf\('\/efcwork\/vertice\/'\) === 0\) return/.test(sw), 'sw.js do Cwork não guarda nada de /efcwork/vertice/ (P5 item 1)');
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok · ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
