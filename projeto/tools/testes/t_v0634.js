/* EFCwork · v0.6.34 · P3a, refeito na v0.6.35: o Vértice Docs em tela inteira com abas no alto (ITEM 200 = OPÇÃO 2, ITEM 201,
   decisão de 26/11 13:18: o menu abre direto a tela inteira) + a porta CworkPonteVertice, mensagens e sw.js.
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

const vertFr = (p, id) => p.frames().find(f => /\/EFCdocs\//.test(f.url()) && f.parentFrame() === p.mainFrame() && (!id || f.name() === id || true) && f !== p.mainFrame());
const frDe = async (p, id) => { const h = await p.$('.jn-fr iframe[data-j="' + id + '"]'); return h ? h.contentFrame() : null; };
const est = p => p.evaluate(() => { const j = document.querySelector('#jn'), fr = document.querySelector('.jn-fr');
  const r = j ? j.getBoundingClientRect() : null, ifr = [...document.querySelectorAll('.jn-fr iframe')];
  const on = ifr.find(f => f.classList.contains('on')), ro = on ? on.getBoundingClientRect() : null;
  return { tem: !!j, fixa: !!j && j.classList.contains('fixa'), aberta: !!j && j.classList.contains('aberta'), vis: r ? Math.round(r.bottom) : 0, h: r ? Math.round(r.height) : 0,
    abas: j ? [...j.querySelectorAll('.jn-ab')].map(b => b.textContent) : [], on: j && j.querySelector('.jn-aw.on .jn-ab') ? j.querySelector('.jn-aw.on .jn-ab').textContent : '',
    ifr: ifr.map(f => f.getAttribute('data-j')), ativa: S.jnAtiva, frOn: !!fr && fr.classList.contains('on'), cam: S.camadas.map(c => c.nome),
    fq: ro ? [ro.left, ro.top, ro.width, ro.height].map(Math.round) : null, iw: innerWidth, ih: innerHeight, rol: document.documentElement.scrollWidth > innerWidth, area: S.rota.area, hash: location.hash }; });
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  console.log('PC (1280):');
  let p = await abre(b, base, 1280, 860);
  await p.evaluate(() => { window._ev = 0; addEventListener('cwork:usuario', () => window._ev++); });
  let m = await p.evaluate(() => ({ areas: [...document.querySelectorAll('.cs-nav a.cs-it')].map(a => a.getAttribute('href')), apps: [...document.querySelectorAll('.cs-app-l')].map(a => a.getAttribute('data-app')) }));
  const iD = m.areas.indexOf('#/documentos'), iV = m.areas.indexOf('#/vertice');
  conf(iV >= 0 && iV === iD + 1, 'o Vértice Docs fica no menu, logo depois de Documentos (' + m.areas.join(' ') + ')');
  conf(m.apps.indexOf('docs') < 0 && m.apps.indexOf('sabia') >= 0, 'em "Apps da família" fica só o Sabiá (' + m.apps.join(',') + ')');
  const u = await p.evaluate(() => { const x = window.CworkPonteVertice; let troca = false; try { window.CworkPonteVertice = null; } catch (e) {} troca = window.CworkPonteVertice === null; return { v: x.versao, rec: x.recursos.join(','), u: x.usuario(), past: x.pastas(), troca, cong: Object.isFrozen(x) }; });
  conf(u.v === 1 && u.u && u.u.uid && u.u.nome === 'Joana Silva' && u.u.perfil === 'principal' && u.u.estrela === false && u.u.acesso === 'completo' && u.u.salvar === true && !('contaTeste' in u.u), 'a porta devolve quem entrou, com o nome e o perfil do cadastro do Cwork (' + JSON.stringify(u.u) + ')');
  conf(!u.troca && u.cong && Array.isArray(u.past) && u.past.length === 5, 'a porta não pode ser trocada por outro código do Cwork, e pastas() traz as 5 pastas (P3b)');
  await p.evaluate(() => { location.hash = '#/coletas'; }); await esp(p, 500);
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 2500);
  let e = await est(p);
  conf(e.hash === '#/coletas' && e.area === 'coletas', 'o menu não troca de tela no Cwork: a tela de baixo continua a mesma (' + e.hash + ')');
  conf(e.ativa === 'docs' && e.frOn && e.fixa && e.aberta, 'o menu abre direto o Vértice em tela inteira, com a faixa sempre à vista (decisão de 26/11 13:18)');
  conf(e.h === 32 && e.fq && e.fq[0] === 0 && e.fq[1] === 32 && e.fq[2] === 1280 && e.fq[3] === 860 - 32 && !e.rol, 'faixa de 32 px; o Vértice ocupa todo o resto da tela, por cima também do menu do Cwork (' + JSON.stringify(e.fq) + ')');
  conf(e.abas.join('|') === 'EFCwork|Vértice Docs' && e.on === 'Vértice Docs', 'abas: EFCwork e Vértice Docs, com o Vértice marcado (' + e.abas.join('|') + ')');
  conf(e.cam.indexOf('janela') >= 0, 'abrir o Vértice conta como uma camada (Esc e voltar)');
  let fr = await frDe(p, 'docs');
  conf(!!fr && /\/EFCdocs\/\?em=cwork/.test(fr.url()), 'o Vértice de verdade abre com ?em=cwork (' + (fr && fr.url()) + ')');
  const vis2 = await p.evaluate(() => { const j = document.querySelector('#jn'), cs = getComputedStyle(j), ab = getComputedStyle(j.querySelector('.jn-aw.on .jn-ab')), ind = getComputedStyle(j.querySelector('.jn-ind'));
    return { bg: cs.backgroundImage, sh: cs.boxShadow, bgc: cs.backgroundColor, bg1: getComputedStyle(document.body).getPropertyValue('--bg1'), fs: ab.fontSize, fw: ab.fontWeight, ih: ind.height, ic: ind.backgroundColor, a: getComputedStyle(document.documentElement).getPropertyValue('--a').trim() }; });
  conf(vis2.bg === 'none' && /^rgb\([^)]*\) 0px -1px 0px 0px inset$/.test(vis2.sh), 'sem degradê e sem relevo: só a linha fina de 1 px embaixo (OPÇÃO 2) (' + vis2.sh + ')');
  conf(vis2.fs === '12px' && vis2.fw === '600', 'letra da aba menor: 12 px no PC (ITEM 201); a aba aberta em negrito');
  conf(vis2.ih === '2px' && /^rgb\(154, 113, 40\)$/.test(vis2.ic), 'o traço da aba aberta: 2 px, dourado do Cwork (' + vis2.ic + ')');
  await esp(p, 2500); fr = await frDe(p, 'docs');
  const dentro = fr ? await fr.evaluate(() => ({ cls: document.documentElement.className, txt: document.body.innerText.slice(0, 3000) })) : {};
  conf(/em-cwork/.test(dentro.cls || ''), 'o Vértice entra no modo do Cwork (esconde a marca e o cartão do perfil)');
  const deDentro = await fr.evaluate(() => { try { return parent.CworkPonteVertice.usuario().nome; } catch (e) { return 'erro ' + e; } });
  conf(deDentro === 'Joana Silva' && !/Entre no Cwork|abre pelo Cwork/.test(dentro.txt || ''), 'de dentro do quadro, o Vértice lê quem entrou no Cwork e não pede login (' + deDentro + ')');
  const ver = await p.evaluate(() => S.vtVer);
  conf(/^v?0\.6\.\d+/.test(ver), 'o Cwork recebeu o "pronto" do Vértice (' + ver + ')');
  await fr.evaluate(() => parent.postMessage({ de: 'vertice', tipo: 'arquivo', nome: 'Custódia Laboratório A.xlsx', tipoArquivo: 'planilha' }, location.origin)); await esp(p, 300);
  conf(/^Custódia Laboratório A\.xlsx · Vértice Docs/.test(await p.title()), 'o título da janela do navegador mostra o arquivo aberto no Vértice (' + await p.title() + ')');
  e = await est(p); conf(e.on === 'Custódia Laboratório A.xlsx', 'a aba mostra o nome do arquivo aberto nela (' + e.on + ')');
  await p.evaluate(() => { postMessage({ de: 'vertice', tipo: 'arquivo', nome: 'Falso.xlsx' }, location.origin); postMessage({ de: 'outro', tipo: 'arquivo', nome: 'Falso2' }, '*'); }); await esp(p, 300);
  conf(!/Falso/.test(await p.title() + (await est(p)).abas.join()), 'mensagem que não vem de um quadro do Vértice é ignorada');
  await fr.evaluate(() => parent.postMessage({ de: 'vertice', tipo: 'arquivo', nome: null, tipoArquivo: null }, location.origin)); await esp(p, 300);
  conf(/^Vértice Docs · /.test(await p.title()) && (await est(p)).on === 'Vértice Docs', 'fechou o arquivo: a aba e o título voltam a "Vértice Docs"');
  await fr.evaluate(() => parent.postMessage({ de: 'vertice', tipo: 'arquivo', nome: 'Custódia Laboratório A.xlsx', tipoArquivo: 'planilha' }, location.origin)); await esp(p, 200);
  await p.evaluate(() => { document.querySelector('.jn-fr iframe[data-j="docs"]')._marca = 7; });
  /* várias abas do Vértice (ITEM 201) */
  await p.click('#jn [data-act="jn-mais"]'); await esp(p, 2500);
  e = await est(p);
  conf(e.ifr.length === 2 && e.ativa !== 'docs' && /^docs~/.test(e.ativa) && e.abas.length === 3, 'o "+" abre outra aba do Vértice, que vai para a frente (' + e.abas.join('|') + ')');
  const fr2 = await frDe(p, e.ativa);
  conf(!!fr2 && /em=cwork/.test(fr2.url()), 'a segunda aba é outro Vértice, também no modo do Cwork');
  await p.click('#jn .jn-aw[data-j="docs"] .jn-ab'); await esp(p, 400);
  e = await est(p);
  conf(e.ativa === 'docs' && await p.evaluate(() => document.querySelector('.jn-fr iframe[data-j="docs"]')._marca === 7) && /^Custódia/.test(await p.title()), 'trocar de aba: o mesmo Vértice, sem recarregar; o título segue a aba da frente');
  for (let k = 0; k < 6; k++) await p.evaluate(() => jnAbrir('docs', '', true));
  await esp(p, 1500);
  const muitas = await p.evaluate(() => { const ws = [...document.querySelectorAll('#jn .jn-aw:not(.jn-cw)')].map(w => Math.round(w.getBoundingClientRect().width)), a = document.querySelector('#jn .jn-abas'), mais = document.querySelector('#jn .jn-mais').getBoundingClientRect();
    return { n: ws.length, ws, cabe: a.scrollWidth <= a.clientWidth + 1, mais: Math.round(mais.right), w: innerWidth }; });
  conf(muitas.n === 8, 'abre bem mais que 3 abas do Vértice (' + muitas.n + ')');
  await p.evaluate(() => { for (let k = 0; k < 8; k++) S.jnNome[S.jnAbertas[k]] = 'Planilha de controle de amostras número ' + (k + 1) + '.xlsx'; jnDesenha(); }); await esp(p, 400);
  const enc = await p.evaluate(() => { const ws = [...document.querySelectorAll('#jn .jn-aw:not(.jn-cw)')], ab = ws.map(w => w.querySelector('.jn-ab')), a = document.querySelector('#jn .jn-abas');
    return { ws: ws.map(w => Math.round(w.getBoundingClientRect().width)), corta: ab.every(x => x.scrollWidth > x.clientWidth && getComputedStyle(x).textOverflow === 'ellipsis'), cabe: a.scrollWidth <= a.clientWidth + 1, x: ws.every(w => w.querySelector('.jn-x').getBoundingClientRect().width > 0) }; });
  conf(enc.ws.every(w => w < 200 && w >= 76) && enc.corta && enc.cabe && enc.x, 'com muitas abas e nomes longos, as abas encolhem por igual e o nome termina em "…" (' + enc.ws.join(',') + ')');
  await p.evaluate(() => { for (let k = 0; k < 4; k++) jnAbrir('docs', '', true); }); await esp(p, 600);
  const lim = await p.evaluate(() => ({ n: S.jnAbertas.length, av: window._av.slice(-1)[0] || '' }));
  conf(lim.n === 10 && /Feche uma/.test(lim.av), 'no limite de 10 abas do Vértice, avisa para fechar uma (' + lim.n + ')');
  const rolou = await p.evaluate(() => { const a = document.querySelector('#jn .jn-abas'), on = a.querySelector('.jn-aw.on').getBoundingClientRect(), r = a.getBoundingClientRect(); return { lado: a.scrollWidth > a.clientWidth, vis: on.left >= r.left - 1 && on.right <= r.right + 1, pg: document.documentElement.scrollWidth > innerWidth }; });
  conf(rolou.vis && !rolou.pg, 'a aba da frente fica à vista e a página não rola para o lado (' + JSON.stringify(rolou) + ')');
  /* fechar: pergunta antes, vai para a aba ao lado */
  const ids0 = await p.evaluate(() => S.jnAbertas.slice());
  await p.evaluate(() => jnIr(S.jnAbertas[3])); await esp(p, 300);
  await p.click('#jn .jn-aw.on .jn-x'); await esp(p, 200);
  conf(await p.evaluate(() => !!document.querySelector('#cf') && /Fechar/.test(document.querySelector('#cf').innerText)), 'o X pergunta antes de fechar');
  await p.click('#cf [data-act="cf-sim"]'); await esp(p, 300);
  e = await est(p);
  conf(e.ifr.length === 9 && e.ativa === ids0[2], 'fechada, vai para a aba ao lado (como no navegador)');
  await p.evaluate(() => { [...S.jnAbertas].filter(x => x !== 'docs').forEach(jnTira); }); await esp(p, 300);
  /* aba EFCwork: volta ao Cwork sem fechar o Vértice */
  await p.click('#jn .jn-cw .jn-ab'); await esp(p, 600);
  e = await est(p);
  conf(e.ativa === 'efcwork' && !e.frOn && e.ifr.length === 1 && !e.fixa && e.cam.indexOf('janela') < 0, 'aba EFCwork: o Cwork volta para a frente, o Vértice continua aberto atrás e a camada sai');
  await p.mouse.move(640, 500); await esp(p, 700);
  e = await est(p);
  conf(!e.aberta && e.vis === 6, 'com o Cwork na frente, a faixa recolhe num fio de 6 px (' + e.vis + ')');
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 500);
  e = await est(p);
  conf(e.ativa === 'docs' && e.ifr.length === 1 && await p.evaluate(() => document.querySelector('.jn-fr iframe[data-j="docs"]')._marca === 7), 'o menu de novo: volta para a mesma aba do Vértice, sem recarregar');
  await p.focus('#jn .jn-aw.on .jn-ab'); await p.keyboard.press('Escape'); await esp(p, 400);
  conf((await est(p)).ativa === 'efcwork', 'Esc (foco na faixa do Cwork; dentro do Vértice o Esc é dele) volta do Vértice para o Cwork');
  await p.evaluate(() => jnAbrir('docs')); await esp(p, 300); await p.evaluate(() => { location.hash = '#/almox'; }); await esp(p, 400);
  e = await est(p); conf(e.ativa === 'efcwork' && e.area === 'almox' && e.ifr.length === 1, 'o Cwork mudou de tela por baixo (aviso, link): o Cwork vem para a frente e o Vértice fica aberto na aba');
  const ev0 = await p.evaluate(() => window._ev);
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { nome: 'Joana Silva Souza' }); render(); }); await esp(p, 300);
  conf(await p.evaluate(e0 => window._ev > e0 && window.CworkPonteVertice.usuario().nome === 'Joana Silva Souza', ev0), 'mudou o cadastro: o Cwork avisa o Vértice (cwork:usuario)');
  /* pedidos (Impressos, Ponte, remessa) */
  const ped = await p.evaluate(() => { jnAbrir('docs', '#/abrir/teste123'); const f = document.querySelector('.jn-fr iframe.on'); return { id: S.jnAtiva, n: S.jnAbertas.length, h: f.src }; }); await esp(p, 800);
  conf(ped.n === 2 && ped.id !== 'docs' && /em=cwork#\/abrir\/teste123/.test(ped.h), 'documento pedido pelo Cwork abre numa aba nova (a aba com arquivo continua) (' + ped.h + ')');
  const ped2 = await p.evaluate(() => { jnAbrir('docs', '#/abrir/teste456'); return { n: S.jnAbertas.length }; }); await esp(p, 500);
  conf(ped2.n === 3, 'a aba que já recebeu um documento não recebe outro por cima, mesmo antes de o Vértice dizer o nome (revisor) (' + ped2.n + ')');
  const ped3 = await p.evaluate(() => { jnAbrir('docs', '', true); const n0 = S.jnAbertas.length; jnAbrir('docs', '#/abrir/teste789'); return { n0, n: S.jnAbertas.length }; }); await esp(p, 300);
  ped3.h = await p.evaluate(() => document.querySelector('.jn-fr iframe.on').src); /* o Vértice consome o #/abrir/<pid> (sem pedido na caixa, volta ao início) */
  conf(ped3.n === ped3.n0 && /#\/abrir\/teste789/.test(ped3.h), 'numa aba do Vértice vazia (aberta pelo "+"), o pedido entra nela (não abre aba à toa) (' + JSON.stringify(ped3) + ')');
  const ped4 = await p.evaluate(() => { const a = jnAbaDaRota('#/abrir/teste123'), n0 = S.jnAbertas.length; jnAbrir('docs', '#/pedido/novo1', false, a); return { a, ok: S.jnAtiva === a, n: S.jnAbertas.length === n0 }; }); await esp(p, 300);
  conf(ped4.a && ped4.ok && ped4.n, 'o mesmo documento pedido de novo volta para a aba dele (' + ped4.a + ')');
  await p.evaluate(() => { S.jnAbertas.filter(x => x !== 'docs').forEach(jnTira); });
  /* gaveta aberta: a gaveta fica embaixo e volta com Esc */
  await p.evaluate(() => { jnIr('efcwork'); location.hash = '#/documentos'; }); await esp(p, 600);
  const gav = await p.evaluate(() => { S.gv = { k: 'teste' }; jnAbrir('docs', '#/abrir/g1'); return { area: S.rota.area, jan: S.jnAtiva !== 'efcwork', gv: !!S.gv }; }).catch(e => ({ erro: String(e) }));
  conf(gav.jan && gav.gv && gav.area === 'documentos', 'com gaveta aberta, "Abrir no Vértice" vai para a tela inteira e a gaveta não se perde (' + JSON.stringify(gav) + ')');
  await p.evaluate(() => { S.gv = null; jnIr('efcwork'); }); await esp(p, 300);
  /* endereço #/vertice */
  await p.evaluate(() => { location.hash = '#/rateios'; }); await esp(p, 400);
  await p.evaluate(() => { location.hash = '#/vertice'; }); await esp(p, 600);
  e = await est(p);
  conf(e.hash === '#/rateios' && e.ativa !== 'efcwork', 'pelo endereço #/vertice: volta para a tela de antes e abre o Vértice em tela inteira (' + e.hash + ')');
  await p.evaluate(() => jnIr('efcwork')); await esp(p, 300);
  const vde = await p.evaluate(async () => { S.jnAbertas.forEach(jnTira); history.replaceState(null, '', '#/vertice'); S.rota = csLeRota(); vtDe = '#/vertice'; render(); await new Promise(r => setTimeout(r, 300)); const h = location.hash; jnIr('efcwork'); render(); await new Promise(r => setTimeout(r, 300)); return { h, h2: location.hash, ab: S.jnAbertas.length }; });
  conf(vde.h !== '#/vertice' && vde.h2 !== '#/vertice', 'o endereço guardado nunca volta para o próprio #/vertice (revisor) (' + JSON.stringify(vde) + ')');
  await p.evaluate(() => { S.jnAbertas.forEach(jnTira); location.hash = '#/inicio'; }); await esp(p, 300);
  /* troca de conta */
  const uid0 = await p.evaluate(() => S.user.id);
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { id: 'outra-conta' }); render(); }); await esp(p, 500);
  conf(await p.evaluate(() => !document.querySelector('.jn-fr iframe[data-j^="docs"]') && S.jnAbertas.length === 0), 'trocou de conta: as abas do Vértice fecham (nada da pessoa anterior fica aberto)');
  await p.evaluate(u => { S.user = Object.assign({}, S.user, { id: u }); render(); }, uid0); await esp(p, 800);
  /* tela sem permissão some */
  await p.evaluate(() => jnAbrir('docs')); await esp(p, 600); await p.evaluate(() => jnIr('efcwork'));
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: false }); render(); }); await esp(p, 500);
  m = await p.evaluate(() => ({ areas: [...document.querySelectorAll('.cs-nav a.cs-it')].map(a => a.getAttribute('href')), fr: !!document.querySelector('.jn-fr iframe[data-j^="docs"]') }));
  conf(m.areas.indexOf('#/vertice') < 0 && !m.fr, 'Secundário sem ★: o Vértice some do menu e a aba aberta no modo do Cwork fecha');
  const us = await p.evaluate(() => window.CworkPonteVertice.usuario());
  conf(us && us.acesso === 'documento' && us.salvar === false, 'Secundário sem ★: a porta diz ao Vértice "só o documento, sem salvar" (ITENS 195 e 196)');
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 300); await p.evaluate(() => { location.hash = '#/vertice'; }); await esp(p, 500);
  conf(await p.evaluate(() => S.rota.area !== 'vertice' && !document.querySelector('.jn-fr iframe')), 'pelo endereço #/vertice também não abre');
  const doc = await p.evaluate(() => { jnAbrir('docs', '#/abrir/d1'); const f = document.querySelector('.jn-fr iframe.on'); return { src: f && f.src, mais: document.querySelector('#jn .jn-mais').hidden }; }); await esp(p, 400);
  conf(doc.src && !/em=cwork/.test(doc.src) && doc.mais, 'Secundário pelo documento ligado: abre como antes, sem o "+" de aba nova');
  await p.evaluate(() => { jnTira(S.jnAtiva); S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: true }); render(); }); await esp(p, 300);
  conf(await p.evaluate(() => !!document.querySelector('.cs-nav a[href="#/vertice"]')), 'Líder ★ vê o Vértice no menu');
  const ev1 = await p.evaluate(() => window._ev);
  await p.evaluate(() => csSair()); await esp(p, 1200);
  conf(await p.evaluate(e1 => window._ev > e1 && window.CworkPonteVertice && window.CworkPonteVertice.usuario() === null, ev1), 'saiu da conta: a porta continua e usuario() devolve null, com aviso ao Vértice');
  conf(p._er.length === 0, 'sem erros no console (' + p._er.slice(0, 3).join(' | ') + ')');
  await p.context().close();
  console.log('Celular (390):');
  p = await abre(b, base, 390, 800);
  await p.click('[data-act="cs-menu"]'); await esp(p, 500);
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 3000);
  e = await est(p);
  conf(e.ativa === 'docs' && e.h === 40 && e.fq && e.fq[1] === 40 && e.fq[3] === 800 - 40 && e.fq[2] === 390 && !e.rol, 'no celular: o Vértice em tela inteira abaixo da faixa de 40 px, sem rolagem lateral (' + JSON.stringify(e.fq) + ')');
  conf(await p.evaluate(() => !document.querySelector('.cs-app.menu-aberto') && S.camadas.map(c => c.nome).join() === 'janela'), 'o menu do celular fecha ao abrir o Vértice e sai da pilha do voltar (revisor) (' + await p.evaluate(() => S.camadas.map(c => c.nome).join()) + ')');
  const toq = await p.evaluate(() => { const j = document.querySelector('#jn'), r = s => [...j.querySelectorAll(s)].map(x => Math.round(x.getBoundingClientRect().height)).filter(h => h > 0); return { ab: r('.jn-ab'), x: r('.jn-x'), mais: r('.jn-mais:not([hidden])'), fs: getComputedStyle(j.querySelector('.jn-ab')).fontSize }; });
  conf(toq.ab.every(h => h >= 40) && toq.x.every(h => h >= 36) && toq.mais.every(h => h >= 36) && toq.fs === '13px', 'no toque: abas de 40 px, X e "+" com 36 px, letra de 13 px (' + JSON.stringify(toq) + ')');
  if (FOTOS) { await esp(p, 1200); await p.screenshot({ path: path.join(OUT, 'v0635-tela-cel.png') }); }
  await p.goBack(); await esp(p, 500);
  e = await est(p);
  conf(e.ativa === 'efcwork' && e.ifr.length === 1, 'voltar do celular sai do Vértice para o Cwork (o Vértice continua aberto)');
  conf(p._er.length === 0, 'sem erros no console (celular)');
  await p.context().close();
  const sw = fs.readFileSync(path.join(RAIZ, 'dist/sw.js'), 'utf8');
  conf(/indexOf\('\/efcwork\/vertice\/'\) === 0\) return/.test(sw), 'sw.js do Cwork não guarda nada de /efcwork/vertice/ (P5 item 1)');
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok · ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
