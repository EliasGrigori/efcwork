/* Vértice v0.6.76 · etapa 2 (modo documento): o arquivo aberto pelo Cwork é só a folha, na orientação do modelo, escreve só nas
   células liberadas, imprime, e NADA é gravado. Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /efcwork/vertice/
   (VERTICE_DIR = a pasta montada). Planilhas de exemplo inventadas em tools/visual/v0642/amostras.
   Uso: python3 tools/montar.py && VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0642.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const AM = path.join(RAIZ, 'tools/visual/v0642/amostras'), T = process.env.TELAS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, base, vp, extra) {
  const ctx = await b.newContext(Object.assign({ viewport: vp, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true }, extra || {})), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  return p;
}
const vertFr = p => p.frames().find(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame());
/* o mesmo caminho do Cwork: põe o arquivo na caixa de troca e abre o Vértice na janela de dentro */
async function mandaAbrir(p, arquivo, nome, docId) {
  const b64 = fs.readFileSync(path.join(AM, arquivo)).toString('base64');
  await p.evaluate(async a => { const u = Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)); const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: u.buffer, nomeArquivo: a.nome, docId: a.docId }); jnAbrir('docs', '#/abrir/' + pid, true); }, { b64, nome, docId });
  let fr = null;
  for (let i = 0; i < 80 && !fr; i++) { await esp(p, 250); for (const f of p.frames()) { if (f !== p.mainFrame() && f.url().includes('#/documento/' + docId) && await f.$('[data-modo-documento="pronto"] .md-folha').catch(() => null)) fr = f; } }
  if (fr) await esp(p, 500);
  return fr;
}
const guardado = (fr, id) => fr.evaluate(id2 => new Promise(ok2 => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readonly').objectStore('arquivos').get(id2); t.onsuccess = () => ok2(JSON.stringify(t.result || null)); }; }), id);
const campo = (fr, l, c) => fr.locator(`.md-campo[data-campo="${l},${c}"]`);
const folhaTxt = fr => fr.evaluate(() => [...document.querySelectorAll('.md-svg')].map(x => x.textContent).join(' '));
const medidas = fr => fr.evaluate(() => { const f = document.querySelector('.md-folha').getBoundingClientRect(); return { w: f.width, h: f.height, vw: innerWidth, rolaX: document.documentElement.scrollWidth - innerWidth }; });
const foto = async (p, nome) => { if (T) { fs.mkdirSync(T, { recursive: true }); await p.screenshot({ path: path.join(T, nome + '.png') }); } };
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const p = await abre(b, base, { width: 1280, height: 860 });

  console.log('— Ficha (retrato) aberta pelo Cwork');
  let fr = await mandaAbrir(p, 'ficha.xlsx', 'Cadeia de custodia.xlsx', 'docficha1');
  conf(!!fr, 'abriu em modo documento (#/documento/<id>)');
  if (!fr) { console.log(p.frames().map(f => f.url())); await b.close(); srv.close(); process.exit(1); }
  const tela = await fr.evaluate(() => ({ orient: document.querySelector('.md').dataset.orient, bts: [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.getAttribute('aria-label') || x.textContent.trim()), campos: document.querySelectorAll('.md-campo').length, folhas: document.querySelectorAll('.md-folha').length, nome: document.querySelector('.md-nome').textContent }));
  conf(tela.orient === 'retrato', 'orientação do modelo: retrato');
  conf(tela.bts.join('|') === 'Imprimir|Mais opções', 'na tela só há a impressora e os três pontos (' + tela.bts.join('|') + ')');
  conf(tela.campos === 4 + 10 * 4, 'só as células liberadas viram campo (' + tela.campos + ' de 44)');
  conf(tela.folhas === 1 && tela.nome === 'Cadeia de custodia', 'uma folha, com o nome do documento');
  let m = await medidas(fr);
  conf(m.h > m.w * 1.35 && m.rolaX <= 0, 'a folha é vertical e cabe na largura (' + Math.round(m.w) + '×' + Math.round(m.h) + ')');
  conf((await folhaTxt(fr)).indexOf('Instruções') < 0 && (await folhaTxt(fr)).indexOf('Esta aba não aparece') < 0, 'só a aba pedida aparece');
  conf(await p.evaluate(() => document.body.textContent.includes('Cadeia de custodia')), 'a aba de cima do Cwork mostra o nome do arquivo');
  await foto(p, 'pc-ficha-vazia');
  const antes = await guardado(fr, 'docficha1');
  conf(antes !== 'null', 'o modelo está guardado no aparelho');

  console.log('— Escrever');
  await campo(fr, 2, 2).click(); await fr.page().keyboard.type('Fazenda Exemplo'); await fr.page().keyboard.press('Enter');
  conf(await fr.evaluate(() => document.activeElement.dataset.campo === '3,2'), 'Enter confirma e passa ao próximo campo');
  await fr.page().keyboard.type('007'); await fr.page().keyboard.press('Enter');
  await fr.page().keyboard.type('27/11/2026'); await fr.page().keyboard.press('Enter');
  await campo(fr, 8, 2).selectOption('Solo');
  await campo(fr, 8, 3).fill('2'); await campo(fr, 8, 3).press('Enter');
  await campo(fr, 9, 3).fill('40'); await campo(fr, 9, 3).press('Enter');
  await campo(fr, 2, 2).click(); await fr.page().keyboard.type(' APAGAR'); await fr.page().keyboard.press('Escape');
  await esp(p, 500);
  conf(await campo(fr, 2, 2).inputValue() === 'Fazenda Exemplo', 'Esc desiste do que estava sendo digitado');
  conf(await campo(fr, 3, 2).inputValue() === '007', '"007" continua com os zeros');
  conf(await campo(fr, 4, 2).inputValue() === '27/11/2026', 'a data fica como data');
  let txt = await folhaTxt(fr);
  conf(/Fazenda Exemplo/.test(txt) && /27\/11\/2026/.test(txt) && /Solo/.test(txt), 'o escrito entra na folha que vai para o papel');
  const total = await fr.evaluate(() => [...document.querySelectorAll('.md-svg text')].map(x => x.textContent));
  conf(total.includes('42'), 'a conta do modelo (Total) se refaz: 2 + 40 = 42');
  const rola = await fr.evaluate(() => { const e = document.querySelector('.md-folhas'); e.scrollTop = 9999; const r = { pode: e.scrollHeight > e.clientHeight, foi: e.scrollTop > 0, barra: document.querySelector('.md-barra').getBoundingClientRect().top }; e.scrollTop = 0; return r; });
  conf(rola.pode && rola.foi && rola.barra === 0, 'a folha rola até o fim e a barra com a impressora fica parada no topo');
  await foto(p, 'pc-ficha-escrita');
  conf(await guardado(fr, 'docficha1') === antes, 'NADA foi gravado no documento (o guardado é o mesmo)');

  console.log('— Imprimir e PDF');
  await fr.evaluate(() => { window._imp = []; const cria = document.createElement.bind(document); document.createElement = function (t, o) { const el = cria(t, o); if (String(t).toLowerCase() === 'iframe') el.addEventListener('load', () => {}); return el; }; const ap = document.body.appendChild.bind(document.body); document.body.appendChild = function (el) { const r = ap(el); if (el.tagName === 'IFRAME') el.contentWindow.print = () => window._imp.push(el.contentDocument.documentElement.outerHTML); return r; }; });
  await fr.click('[data-md-imprimir]'); await esp(p, 1200);
  const imp = await fr.evaluate(() => window._imp);
  conf(imp.length === 1 && /Fazenda Exemplo/.test(imp[0]) && /@page\{size:595/.test(imp[0]), 'a impressora manda a folha em retrato, com o que foi escrito');
  await fr.click('[data-md-mais]'); await esp(p, 250);
  const itens = await fr.evaluate(() => [...document.querySelectorAll('[data-md-item]')].map(x => x.textContent.trim()));
  conf(itens.join('|') === 'Atualizar documento|Baixar PDF', 'três pontos: Atualizar documento e Baixar PDF (Administrador)');
  conf(await fr.evaluate(() => [...document.querySelectorAll('.md-menu svg')].every(x => x.getBoundingClientRect().width <= 20) && document.querySelector('.md-menu').getBoundingClientRect().height < 120), 'o menu é compacto, com ícones pequenos');
  await foto(p, 'pc-ficha-menu');
  await fr.page().keyboard.press('Escape'); await esp(p, 250);
  conf(!(await fr.$('.md-menu')), 'Esc fecha o menu');
  await fr.click('[data-md-mais]');
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), fr.click('[data-md-item="pdf"]')]);
  const pdf = dl ? fs.readFileSync(await dl.path()) : Buffer.alloc(0);
  conf(!!dl && dl.suggestedFilename() === 'Cadeia de custodia.pdf' && pdf.slice(0, 4).toString() === '%PDF', 'Baixar PDF entrega o arquivo');

  console.log('— Atualizar documento abre o Vértice inteiro');
  await fr.click('[data-md-mais]'); await fr.click('[data-md-item="atualizar"]'); await esp(p, 400);
  conf(/se perde/.test(await fr.evaluate(() => document.body.textContent)), 'com algo escrito, avisa antes que vai se perder');
  await foto(p, 'pc-ficha-confirma');
  await fr.page().keyboard.press('Escape'); await esp(p, 300);
  conf(fr.url().includes('#/documento/docficha1') && await campo(fr, 2, 2).inputValue() === 'Fazenda Exemplo', 'Esc volta ao documento sem perder nada');
  await fr.click('[data-md-mais]'); await fr.click('[data-md-item="atualizar"]'); await esp(p, 300);
  await fr.getByRole('button', { name: 'Abrir', exact: true }).click(); await esp(p, 2500);
  const inteiro = await fr.evaluate(() => ({ h: location.hash, md: !!document.querySelector('[data-modo-documento]'), bts: [...document.querySelectorAll('button')].filter(x => x.offsetParent).length }));
  conf(inteiro.h === '#/arq/docficha1' && !inteiro.md && inteiro.bts > 20, 'abre o editor completo, com os menus (' + inteiro.bts + ' botões)');
  await foto(p, 'pc-editor-completo');

  console.log('— O modelo que o Líder mudou continua o dele');
  await fr.evaluate(() => new Promise(ok => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'); const g = st.get('docficha1'); g.onsuccess = () => { const r = g.result; r.ficha.nome = 'Cadeia de custodia rev 2'; st.put(r).onsuccess = () => ok(); }; }; }));
  let fr2 = await mandaAbrir(p, 'ficha.xlsx', 'Cadeia de custodia.xlsx', 'docficha1');
  conf(fr2 && await fr2.evaluate(() => document.querySelector('.md-nome').textContent) === 'Cadeia de custodia rev 2', 'abrir de novo pelo Cwork mostra o modelo do Vértice, não o arquivo antigo do Cwork');
  if (fr2) {
    await campo(fr2, 2, 2).fill('Só para imprimir'); await campo(fr2, 2, 2).press('Tab'); await esp(p, 300);
    const salvaOutra = () => fr2.evaluate(() => new Promise(ok => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const st = q.result.transaction('arquivos', 'readwrite').objectStore('arquivos'); const g = st.get('docficha1'); g.onsuccess = () => { const r = g.result; r.ficha.nome = 'Cadeia de custodia rev 3'; st.put(r).onsuccess = () => { ['efcdocs-abas', 'efcdocs-abas-demo'].forEach(n => { const c = new BroadcastChannel(n); c.postMessage({ t: 'salvou', arq: 'docficha1', de: 'outra' }); c.close(); }); ok(); }; }; }; }));
    await salvaOutra(); await esp(p, 800);
    conf(await fr2.$('[data-md-nova]') && await campo(fr2, 2, 2).inputValue() === 'Só para imprimir', 'o Vértice gravou em outra aba: com algo escrito, avisa "Há uma versão nova" e não troca sozinho');
    await foto(p, 'pc-versao-nova');
    await fr2.click('[data-md-nova]'); await esp(p, 300); await fr2.getByRole('dialog').getByRole('button', { name: 'Carregar', exact: true }).click(); await esp(p, 1200);
    conf(await fr2.evaluate(() => document.querySelector('.md-nome').textContent) === 'Cadeia de custodia rev 3' && !(await fr2.$('[data-md-nova]')), '"Carregar" traz a versão nova');
    await salvaOutra(); await esp(p, 1200);
    conf(!(await fr2.$('[data-md-nova]')), 'sem nada escrito, a versão nova entra sozinha');
    /* versão nova vinda de outro aparelho: alguém grava na nuvem; o Vértice traz (aqui, ao voltar a internet) e a folha troca sozinha */
    const rec = await fr2.evaluate(() => new Promise(ok => { const q = indexedDB.open('efcdocs'); q.onsuccess = () => { const g = q.result.transaction('arquivos').objectStore('arquivos').get('docficha1'); g.onsuccess = () => ok({ ficha: g.result.ficha, pacote: g.result.pacote }); }; }));
    const gr = await p.evaluate(r => window.CworkPonteVertice.nuvem.gravar({ ficha: Object.assign({}, r.ficha, { nome: 'Cadeia de custodia da nuvem', pastaNome: 'Fichas e custódias' }), pacote: r.pacote }, 0), rec);
    await fr2.evaluate(() => dispatchEvent(new Event('online'))); await esp(p, 3000);
    conf(gr && gr.ok && await fr2.evaluate(() => document.querySelector('.md-nome').textContent) === 'Cadeia de custodia da nuvem' && !(await fr2.$('[data-md-nova]')), 'versão nova gravada na nuvem por outro aparelho: a folha troca sozinha');
  }

  console.log('— Pedido do Cwork (Preencher e imprimir) também sem menus');
  await p.evaluate(async () => { const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'pedido', docId: 'docficha1', copias: 1, dados: {} }); jnAbrir('docs', '#/pedido/' + pid, true); });
  let fp = null; for (let i = 0; i < 40 && !fp; i++) { await esp(p, 250); fp = p.frames().find(f => f !== p.mainFrame() && /#\/pedido\//.test(f.url())); }
  if (fp) await fp.waitForSelector('[data-pedido="pronto"], [data-pedido="erro"]', { timeout: 8000 }).catch(() => null);
  conf(fp && await fp.evaluate(() => !!document.querySelector('.md-app [data-pedido]') && !document.querySelector('.menu, nav, .faixa')), 'o pedido abre sem os menus do Vértice');
  await esp(p, 2500); await foto(p, 'pc-pedido');
  if (fp) { await fp.click('[data-pedido-sair]'); await esp(p, 1500); }
  conf(fp && /#\/documento\/docficha1$/.test(fp.url()) && await fp.$('[data-modo-documento="pronto"]'), '"Agora não" leva ao documento, não ao Vértice inteiro');

  console.log('— Etiquetas (paisagem) e modelo sem célula liberada');
  fr = await mandaAbrir(p, 'etiquetas.xlsx', 'Etiquetas de amostra.xlsx', 'docetiq1');
  conf(fr && await fr.evaluate(() => document.querySelector('.md').dataset.orient) === 'paisagem', 'etiquetas: orientação paisagem');
  if (fr) {
    m = await medidas(fr);
    conf(m.w > m.h * 1.35 && m.rolaX <= 0, 'a folha é deitada e cabe na largura (' + Math.round(m.w) + '×' + Math.round(m.h) + ')');
    conf(await fr.evaluate(() => document.querySelectorAll('.md-campo').length) === 24, '24 campos (6 etiquetas × 4)');
    await fr.locator('.md-campo').first().fill('T-12'); await fr.locator('.md-campo').first().press('Enter'); await esp(p, 400);
    await foto(p, 'pc-etiquetas');
  }
  fr = await mandaAbrir(p, 'pop.xlsx', 'POP de coleta.xlsx', 'docpop001');
  conf(fr && await fr.evaluate(() => document.querySelectorAll('.md-campo').length === 0 && !!document.querySelector('[data-md-sem-campos]') && !!document.querySelector('[data-md-imprimir]')), 'modelo sem célula liberada: só impressão, com a explicação');
  await foto(p, 'pc-sem-campos');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 3).join(' | ') : ''));

  console.log('— Colaborador (entra só pelo documento ligado)');
  const q = await abre(b, base, { width: 390, height: 780 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await q.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); }); await esp(q, 800);
  fr = await mandaAbrir(q, 'ficha.xlsx', 'Cadeia de custodia.xlsx', 'docficha1');
  conf(!!fr, 'no celular o documento abre');
  if (fr) {
    m = await medidas(fr);
    conf(m.rolaX <= 0 && m.w <= m.vw, 'a folha cabe na largura do telefone (' + Math.round(m.w) + ' de ' + m.vw + ')');
    await campo(fr, 2, 2).tap(); await esp(q, 300);
    const foco = await fr.evaluate(() => { const e = document.activeElement; return { c: e.dataset.campo, tam: parseFloat(getComputedStyle(e).fontSize) }; });
    conf(foco.c === '2,2' && foco.tam >= 16, 'ao tocar, a letra do campo fica com 16 px ou mais (o telefone não dá zoom sozinho): ' + foco.tam);
    await q.keyboard.type('Sítio Exemplo'); await foto(q, 'cel-ficha-digitando'); await q.keyboard.press('Enter'); await q.keyboard.press('Escape'); await esp(q, 400);
    await foto(q, 'cel-ficha');
    await fr.click('[data-md-mais]');
    const it2 = await fr.evaluate(() => [...document.querySelectorAll('[data-md-item]')].map(x => x.textContent.trim()));
    conf(it2.join('|') === 'Baixar PDF', 'Colaborador não tem "Atualizar documento" (' + it2.join('|') + ')');
    await foto(q, 'cel-menu');
    await fr.evaluate(() => { location.hash = '#/arq/docficha1'; }); await esp(q, 1200);
    conf(await fr.evaluate(() => !!document.querySelector('[data-modo-documento="pronto"]')), 'pelo endereço do editor, continua vendo só o documento');
    await fr.evaluate(() => { location.hash = '#/'; }); await esp(q, 800);
    conf(await fr.evaluate(() => !!document.querySelector('[data-md-so-documento]') && document.querySelectorAll('button').length === 0), 'fora do documento não há navegação nenhuma');
  }
  console.log('— Com o resumo do envio (o kit manda os dados junto)');
  for (const [nomeTela, pg2] of [['pc', p], ['cel', q]]) {
    await pg2.evaluate(async () => { await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'resumo', docId: 'docresu1', dados: { 'lab.nome': 'Laboratório Exemplo', 'envio.amostras': 4 } }); });
    const f3 = await mandaAbrir(pg2, 'ficha.xlsx', 'Ficha com envio.xlsx', 'docresu1');
    conf(!!f3 && await f3.waitForSelector('[data-resumo]', { timeout: 5000 }).then(() => true, () => false), nomeTela + ': o resumo do envio aparece junto do documento');
    if (f3) {
      const r3 = await f3.evaluate(() => { const a = document.querySelector('[data-resumo]').getBoundingClientRect(), f = document.querySelector('.md-folhas').getBoundingClientRect(); return { lado: a.left >= f.right - 1, baixo: a.top >= f.bottom - 1, rolaX: document.documentElement.scrollWidth - innerWidth, w: f.width }; });
      conf(nomeTela === 'pc' ? r3.lado : r3.baixo && r3.rolaX <= 0, nomeTela + ': ' + (nomeTela === 'pc' ? 'ao lado da folha' : 'embaixo da folha, sem rolar de lado'));
      await foto(pg2, nomeTela + '-resumo');
    }
  }
  conf(q._er.length === 0, 'sem erro de JavaScript no celular' + (q._er.length ? ': ' + q._er.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
