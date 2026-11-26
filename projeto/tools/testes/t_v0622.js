/* EFCwork · v0.6.22 · janela do Vértice com abas (refeita na v0.6.35: tela inteira, OPÇÃO 2, faixa sempre à vista com um app na frente) e Ponte 1 (receber do Vértice, Abrir no Vértice com resumo).
   Sobe um servidor com o EFCwork em /efcwork/ e o Vértice DE VERDADE em /EFCdocs/ (clone só de leitura em VERTICE_DIR), no mesmo endereço,
   como no GitHub Pages. Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0622.js */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = process.env.VERTICE_DIR || '/home/claude/eliasgrigori/efcdocs';
const ex = require('../contrato/exemplos-efd-v1.json'), EFD = require('../contrato/efd-v1.js');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : u.startsWith('/EFCdocs/') ? path.join(VD, u.slice(9)) : u.startsWith('/contrato/') ? path.join(RAIZ, 'tools/contrato', u.slice(10)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const est = p => p.evaluate(() => { const j = document.querySelector('#jn'), fr = document.querySelector('.jn-fr'), r = j && j.getBoundingClientRect();
  return { tem: !!j, aberta: !!(j && j.classList.contains('aberta')), vis: r ? Math.round(r.bottom) : 0, ativa: S.jnAtiva, frOn: !!(fr && fr.classList.contains('on')), ifr: [...document.querySelectorAll('.jn-fr iframe')].map(f => f.getAttribute('data-j')),
    abas: [...document.querySelectorAll('.jn-ab')].map(b => b.textContent), on: (document.querySelector('.jn-aw.on .jn-ab') || {}).textContent, bg: j ? getComputedStyle(j).backgroundColor : '', cam: S.camadas.map(c => c.nome) }; });
const meio = p => p.evaluate(() => { const r = document.querySelector('#jn .jn-abas').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), l: Math.round(r.left), r: Math.round(r.right) }; });
const noFio = async p => { const m = await meio(p); await p.mouse.move(m.x, 3); };
const vertPronto = (p, ms) => p.waitForFunction(() => { const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); try { const d = f && f.contentDocument; return !!(d && d.body && d.readyState === 'complete' && !d.querySelector('#abertura:not(.sai)') && d.body.children.length > 1); } catch (e) { return false; } }, null, { timeout: ms || 20000 }).then(() => true, () => false);

(async () => {
  if (!fs.existsSync(path.join(VD, 'index.html'))) { console.log('Falta o Vértice em ' + VD + ' (git clone https://github.com/EliasGrigori/efcdocs)'); process.exit(1); }
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, url: base + '/efcwork/', w: 1280, h: 820 });
  console.log('— PC: abrir o Vértice pelo menu');
  conf(!(await est(p)).tem, 'antes de abrir um app, não existe faixa de abas');
  await ir(p, 'documentos/impressos', 900);
  await p.evaluate(() => jnAbrir('docs')); const pronto = await vertPronto(p); await p.waitForTimeout(500);
  let e = await est(p);
  conf(pronto, 'o Vértice de verdade carregou dentro da janela');
  conf(e.tem && e.ativa === 'docs' && e.frOn && e.ifr.join() === 'docs', 'a janela do Vértice ficou na frente');
  conf(e.aberta && e.vis === 32, 'com o Vértice na frente, a faixa fica sempre à vista: 32 px (OPÇÃO 2) (' + e.vis + ' px)');
  conf(e.cam.indexOf('janela') >= 0, 'abrir um app conta como uma camada (Esc e voltar)');
  await p.mouse.move(640, 400); await p.waitForTimeout(900); conf((await est(p)).aberta, 'tirar o mouse não recolhe a faixa (o app está na frente)');
  const tr0 = await p.evaluate(() => { const i = document.querySelector('.jn-ind').getBoundingClientRect(), b = document.querySelector('.jn-aw.on').getBoundingClientRect(); return i.left >= b.left && i.right <= b.right; });
  conf(tr0, 'o traço fica embaixo da aba da frente');
  const rel = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('#jn')); return { g: /gradient/.test(s.backgroundImage), sh: (s.boxShadow.match(/rgba?\(/g) || []).length }; });
  conf(!rel.g && rel.sh <= 1, 'sem degradê e sem relevo (só a linha fina embaixo)');
  conf(e.abas.join('|') === 'EFCwork|Vértice Docs' && e.on === 'Vértice Docs', 'abas: EFCwork e Vértice Docs, com o Vértice marcado');
  const corW = await p.evaluate(() => getComputedStyle(document.body).getPropertyValue('--bg1').trim());
  conf(/255, 254, 251/.test(e.bg) && corW === '#fffefb', 'a faixa tem as cores do Cwork, qualquer que seja o tema do Vértice (' + e.bg + ')');
  /* o Vértice guarda algo na tela dele: ao alternar, nada se perde */
  await p.evaluate(() => { document.querySelector('.jn-fr iframe').contentWindow._marca = 'vivo'; });
  const xi0 = await p.evaluate(() => document.querySelector('.jn-ind').getBoundingClientRect().left);
  await p.click('.jn-ab[data-j="efcwork"]'); await p.waitForTimeout(400); e = await est(p);
  const xi1 = await p.evaluate(() => { const i = document.querySelector('.jn-ind').getBoundingClientRect(), b = document.querySelector('.jn-aw[data-j="efcwork"]').getBoundingClientRect(); return { l: i.left, ok: i.left >= b.left && i.right <= b.right, el: !!document.querySelector('#jn .jn-ind') }; });
  conf(xi1.el && xi1.l < xi0 && xi1.ok, 'o traço desliza para a aba EFCwork (o mesmo traço, não um novo)');
  conf(e.ativa === 'efcwork' && !e.frOn && e.ifr.length === 1 && e.cam.indexOf('janela') < 0, 'aba EFCwork: o EFCwork volta para a frente, o Vértice continua aberto atrás e a camada sai');
  await p.mouse.move(640, 400); await p.waitForTimeout(900); e = await est(p);
  conf(!e.aberta && e.vis === 6, 'com o EFCwork na frente, a faixa recolhe no fio de 6 px (' + e.vis + ')');
  { const m = await meio(p); conf(m.l <= 6 && m.r < 400, 'a área que reage é só a das abas (até ' + m.r + ' px)');
    await p.mouse.move(1150, 3); await p.waitForTimeout(500); conf(!(await est(p)).aberta, 'mouse no alto fora das abas: nada abre');
    await p.mouse.move(m.x, 3); await p.waitForTimeout(40); await p.mouse.move(m.x, 300); await p.waitForTimeout(400); conf(!(await est(p)).aberta, 'passar de raspão pelo fio não abre (espera o mouse parar)'); }
  await noFio(p); await p.waitForTimeout(700); e = await est(p);
  conf(e.aberta && e.vis === 32, 'parar o mouse no fio abre a faixa (' + e.vis + ')');
  conf(await p.evaluate(() => { const x = document.elementFromPoint(1150, 12); return !x || !x.closest('#jn'); }), 'com a faixa aberta sobre o EFCwork, o canto direito do alto continua sendo do EFCwork (o clique passa)');
  await p.click('.jn-ab[data-j="docs"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => document.querySelector('.jn-fr iframe').contentWindow._marca === 'vivo'), 'voltar ao Vértice: a mesma janela, sem recarregar (o que estava aberto continua)');
  await p.evaluate(() => document.querySelector('.jn-ab[data-j="docs"]').focus()); await p.keyboard.press('Escape'); await p.waitForTimeout(500); e = await est(p);
  conf(e.ativa === 'efcwork', 'Esc (com o foco no EFCwork) volta do Vértice para o EFCwork');
  const lado = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  conf(!lado, 'nada rola para o lado');

  console.log('— Ponte 1: Vértice → EFCwork (Compartilhar com o Cwork)');
  await p.evaluate(() => jnIr('docs')); await p.waitForTimeout(300);
  const fr = p.frames().find(f => /\/EFCdocs\//.test(f.url()));
  await fr.addScriptTag({ url: base + '/contrato/efd-v1.js' }); await fr.addScriptTag({ url: base + '/contrato/efd-ponte.js' });
  const f1 = ex.validos.fichas[1], partes = ex.validos.copias[f1.id];
  const xlsx = fs.readFileSync(path.join(__dirname, 'vertice', 'ficha-teste.xlsx')).toString('base64');
  const pid = await fr.evaluate(async ([f, partes, xlsx]) => { const b = s => { const t = atob(s), a = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a.buffer; };
    const g = JSON.parse(JSON.stringify(f)); g.tipo = 'planilha'; g.origem = 'docs'; g.pastaNome = 'Fichas e custódias'; g.criadoPorId = g.alteradoPorId = 'vertice-docs'; g.pub.porId = 'vertice-docs';
    return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: g, pdf: b(EFD.juntar(f.pub, partes)), original: b(xlsx), nomeArquivo: 'ficha-teste.xlsx' }); }, [f1, partes, xlsx]);
  await p.waitForFunction(id => S.ipDocs.some(d => d.id === id), f1.id, { timeout: 8000 }).catch(() => {});
  const rec = await p.evaluate(async ([id, pid]) => { const d = S.ipDocs.find(x => x.id === id); const caixa = await EFDPonte.pegar(pid); const av = [...document.querySelectorAll('.av')].map(x => x.textContent);
    return d && { nome: d.nome, origem: d.origem, por: d.alteradoPor, porId: d.alteradoPorId, pub: d.pub && d.pub.porId, orig: d.orig && d.orig.nomeArquivo, pasta: d.pastaNome, erros: EFD.ficha(d), naCaixa: !!caixa, av: av, rev: d.rev }; }, [f1.id, pid]);
  conf(rec && rec.origem === 'docs' && !rec.erros.length, 'o documento entrou em Impressos e segue o contrato');
  conf(rec && rec.por === 'Joana Silva' && rec.porId !== 'vertice-docs' && rec.pub !== 'vertice-docs', 'gravado com o login de quem está no EFCwork (não "vertice-docs")');
  conf(rec && rec.orig === 'ficha-teste.xlsx' && rec.pasta === 'Fichas e custódias', 'o Excel original e a pasta vieram junto');
  conf(rec && !rec.naCaixa, 'depois de gravar, o item sai da caixa (o Vértice mostra "Recebido pelo Cwork")');
  conf(rec && rec.av.some(x => /Recebido do Vértice: .*versão/.test(x)), 'aviso "Recebido do Vértice" aparece mesmo com o Vértice na frente');
  const avZ = await p.evaluate(() => Number(getComputedStyle(document.querySelector('.av-pilha')).zIndex) > Number(getComputedStyle(document.querySelector('.jn-fr')).zIndex));
  conf(avZ, 'os avisos ficam por cima da janela do Vértice');
  /* manda de novo (o Vértice sobe rev a cada envio): vira versão nova */
  await fr.evaluate(async ([f, partes]) => { const b = s => { const t = atob(s), a = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a.buffer; };
    const g = JSON.parse(JSON.stringify(f)); g.tipo = 'planilha'; g.rev = 2; g.pub.rev = 2; g.pastaNome = 'Fichas e custódias'; return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: g, pdf: b(EFD.juntar(f.pub, partes)) }); }, [f1, partes]);
  await p.waitForFunction(id => (S.ipDocs.find(d => d.id === id) || {}).rev >= 2, f1.id, { timeout: 8000 }).catch(() => {});
  const r2 = await p.evaluate(id => { const d = S.ipDocs.find(x => x.id === id); return { rev: d.rev, orig: !!d.orig, n: S.ipDocs.filter(x => x.id === id).length }; }, f1.id);
  conf(r2.rev === 2 && r2.n === 1 && !r2.orig, 'segundo envio do mesmo documento = versão 2 (sem o Excel, que não veio)');
  /* ficha fora do contrato: não entra, avisa e fica na caixa */
  const pRuim = await fr.evaluate(async () => { return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: { v: 1, id: 'dzzzzzzz1', nome: 'Ruim' }, pdf: new Uint8Array([37, 80, 68, 70, 45]).buffer }); });
  await p.waitForTimeout(1200);
  const ru = await p.evaluate(async pid => ({ caixa: !!(await EFDPonte.pegar(pid)), doc: S.ipDocs.some(d => d.id === 'dzzzzzzz1'), av: [...document.querySelectorAll('.av.erro')].map(x => x.textContent).join(' | ') }), pRuim);
  conf(ru.caixa && !ru.doc && /fora do combinado/.test(ru.av), 'documento fora do combinado não entra, avisa e fica esperando na caixa');
  await p.evaluate(pid => EFDPonte.apagar(pid), pRuim);

  console.log('— Ponte 1: EFCwork → Vértice (Abrir no Vértice)');
  await p.evaluate(() => jnIr('efcwork')); await p.waitForTimeout(300);
  /* a versão 1 com o Excel volta a ser a da frente para abrir no Vértice */
  await fr.evaluate(async ([f, partes, xlsx]) => { const b = s => { const t = atob(s), a = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a.buffer; };
    const g = JSON.parse(JSON.stringify(f)); g.tipo = 'planilha'; g.rev = 3; g.pub.rev = 3; g.pastaNome = 'Fichas e custódias'; return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: g, pdf: b(EFD.juntar(f.pub, partes)), original: b(xlsx), nomeArquivo: 'ficha-teste.xlsx' }); }, [f1, partes, xlsx]);
  await p.waitForFunction(id => (S.ipDocs.find(d => d.id === id) || {}).rev >= 3, f1.id, { timeout: 8000 }).catch(() => {});
  await ir(p, 'documentos/impressos', 700); await p.evaluate(id => ipAbre(id), f1.id); await p.waitForTimeout(700);
  conf(!!(await p.$('#gv [data-act="ip-no-vertice"]')), 'a gaveta do impresso mostra "Abrir no Vértice"');
  await p.evaluate(() => { window._pts = []; const o = EFDPonte.por; EFDPonte.por = async i => { const pid = await o(i); window._pts.push({ t: i.tipo, pid: pid, doc: i.docId, n: i.nomeArquivo, b: i.original ? i.original.byteLength : 0, dados: i.dados }); return pid; }; });
  await p.click('#gv [data-act="ip-no-vertice"]'); await p.waitForTimeout(900);
  const ab = await p.evaluate(async () => { const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); let h = ''; try { h = f.contentWindow.location.hash; } catch (e) {} return { ativa: S.jnAtiva, hash: h, itens: window._pts }; });
  const it = ab.itens.find(i => i.t === 'abrir');
  conf(ab.ativa === 'docs' && it && (ab.hash === '#/abrir/' + it.pid || !/abrir/.test(ab.hash)), 'o Vértice vai para a frente pelo endereço #/abrir/<pid> (' + ab.hash + ')');
  conf(it && it.doc === f1.id && it.n === 'ficha-teste.xlsx' && it.b === fs.statSync(path.join(__dirname, 'vertice', 'ficha-teste.xlsx')).size, 'na caixa: o Excel inteiro, com o nome e o docId');
  const sumiu = it ? await p.waitForFunction(pid => EFDPonte.pegar(pid).then(x => !x), it.pid, { timeout: 15000, polling: 500 }).then(() => true, () => false) : false;
  const abriu = await fr.waitForFunction(() => /ficha-teste|Ficha de cotação/.test(document.body.innerText), null, { timeout: 15000 }).then(() => true, () => false);
  conf(abriu, 'a ficha aparece aberta na tela do Vértice');
  conf(sumiu, 'o Vértice de verdade pegou o arquivo e apagou da caixa (abriu a ficha)');

  console.log('— Resumo do envio (kit)');
  const rs = await p.evaluate(id => { const c = coAtivas().find(x => x.enviado && x.envio && x.lab); if (!c) return null; const k = coLoteK(c), d = S.ipDocs.find(x => x.id === id);
    const o = ptResumoEnvio(k, { amostras: '3', caixas: '2', analise: 'Solo completo', pontos: 'RU11', unid: 'matriz' }, d);
    return { o: o, erros: EFD.pedido({ v: 1, pid: 'p00000001', docId: d.id, de: 'efcwork', copias: 1, criadoEm: '2026-01-01T00:00:00.000Z', dados: o }) }; }, f1.id);
  conf(rs && !rs.erros.length, 'o resumo do envio segue o dicionário do contrato' + (rs && rs.erros.length ? ': ' + rs.erros[0] : ''));
  conf(rs && rs.o['lab.nome'] && rs.o['envio.caixas'] === 2 && rs.o['envio.amostras'] === 3 && Array.isArray(rs.o['amostras[]']) && rs.o['amostras[]'].length > 0 && rs.o['usuario.nome'] === 'Joana Silva', JSON.stringify(rs && rs.o).slice(0, 300) + ' · resumo com laboratório, caixas, amostras, a lista das amostras e quem está imprimindo');

  console.log('— Fechar');
  await p.evaluate(() => jnIr('docs')); await p.waitForTimeout(300); await p.click('.jn-x[data-j="docs"]'); await p.waitForTimeout(300);
  conf(!!(await p.$('#cf')), 'o X pede confirmação antes de fechar');
  await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(400); e = await est(p);
  conf(!e.tem && e.ifr.length === 0 && e.ativa === 'efcwork', 'fechado: some a janela e a faixa');
  await p.click('a.cs-app-l[data-app="sabia"]', { modifiers: ['Control'] }).catch(() => {}); await p.waitForTimeout(500);
  conf(!(await est(p)).tem, 'Ctrl + clique no menu não abre a janela (vai para uma aba do navegador)');
  for (const pg of p.context().pages()) if (pg !== p) await pg.close();
  conf(p._er.length === 0, 'sem erro de JavaScript no EFCwork' + (p._er.length ? ': ' + p._er[0] : ''));

  console.log('— Celular (390 px)');
  let c = await abre(br, { raiz: RAIZ, url: base + '/efcwork/', w: 390, h: 820 });
  await c.evaluate(() => jnAbrir('docs')); await vertPronto(c); await c.waitForTimeout(1500); e = await est(c);
  conf(e.ativa === 'docs' && e.aberta && e.vis === 40, 'no celular: o Vértice em tela inteira, faixa de 40 px à vista (' + e.vis + ')');
  const btA = await c.evaluate(() => [...document.querySelectorAll('.jn-ab,.jn-x,.jn-mais:not([hidden])')].map(b => Math.round(b.getBoundingClientRect().height)).filter(h => h > 0));
  conf(btA.every(h => h >= 36), 'no toque, abas e botões da faixa com 36 px ou mais (' + btA.join(', ') + ')');
  const alt = await c.evaluate(() => [...document.querySelectorAll('.jn-ab')].map(b => Math.round(b.getBoundingClientRect().height)));
  conf(alt.every(h => h === alt[0]), 'abas com a mesma altura');
  await c.tap('.jn-ab[data-j="efcwork"]'); await c.waitForTimeout(1200); e = await est(c);
  conf(e.ativa === 'efcwork' && !e.aberta && e.vis === 6, 'tocar na aba EFCwork volta e a faixa recolhe no fio');
  const zona = await c.evaluate(() => getComputedStyle(document.querySelector('#jn .jn-zona')).height);
  conf(zona === '12px', 'no toque, o fio tem 12 px a mais de área invisível para acertar o dedo');
  { const m = await meio(c); await c.touchscreen.tap(Math.min(m.x, 60), 8); } await c.waitForTimeout(600); e = await est(c);
  conf(e.aberta && e.vis === 40, 'tocar o fio abre a faixa (40 px no toque: ' + e.vis + ')');
  await c.evaluate(() => jnIr('docs')); await c.waitForTimeout(300);
  await c.goBack().catch(() => {}); await c.waitForTimeout(600); e = await est(c);
  conf(e.ativa === 'efcwork' && e.ifr.length === 1, 'voltar do celular sai do Vértice para o EFCwork (e o Vértice continua aberto)');
  conf(!(await c.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'celular: nada rola para o lado');
  conf(c._er.length === 0, 'celular sem erro de JavaScript' + (c._er.length ? ': ' + c._er[0] : ''));

  console.log('— Tema escuro');
  await c.evaluate(() => csTrocaTema('escuro')); await c.waitForTimeout(300);
  const esc = await c.evaluate(() => ({ bg: getComputedStyle(document.querySelector('#jn')).backgroundColor }));
  conf(/18, 21, 36/.test(esc.bg), 'trocar o tema do EFCwork muda a cor da faixa junto (escuro: ' + esc.bg + ')');

  await br.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
