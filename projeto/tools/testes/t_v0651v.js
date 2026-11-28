/* EFCwork v0.6.51 + Vértice v0.6.85 · Conversas, decisão 3: o comentário do Kanban/post-it, aberto pelo Cwork, leva a conta de
   quem escreveu, vira mensagem da conversa do cartão no Cwork, o responsável e quem participa recebem o aviso no sino, e tocar na
   conversa abre o cartão no Vértice. Modo demonstração, quadro de TESTE com nomes inventados (nenhum documento do Elias).
   Uso: python3 tools/montar.py && (cd ../vertice/fonte && node scripts/build.mjs) &&
        VERTICE_DIR=../vertice/fonte/dist NODE_PATH=$(npm root -g) node tools/testes/t_v0651v.js   (TELAS=pasta tira as fotos) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = path.resolve(process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'));
const DIST = path.resolve(process.env.EFC_DIST || path.join(RAIZ, 'dist')), T = process.env.TELAS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const foto = async (p, nome) => { if (T) { fs.mkdirSync(T, { recursive: true }); await esp(p, 300); await p.screenshot({ path: path.join(T, nome + '.png') }); } };
const vertFr = p => p.frames().find(f => f !== p.mainFrame() && /\/efcwork\/vertice\//.test(f.url()));
const N = (p, f, a) => p.evaluate(f, a);

/* quadro de TESTE (inventado): 3 colunas e 2 post-its, um com responsável */
const conteudo = { v: 1, setas: {}, seq: 2, colunas: [{ id: 'c1', nome: 'A fazer' }, { id: 'c2', nome: 'Fazendo' }, { id: 'c3', nome: 'Feito' }],
  itens: { pi1: { id: 'pi1', tipo: 'postit', x: 40, y: 40, w: 180, h: 140, z: 1, texto: 'Trocar o filtro da caixa (exemplo)', cor: 'amarelo', cod: 'Q-001', col: 'c1', ko: 1, resp: 'Carlos Lima' },
    pi2: { id: 'pi2', tipo: 'postit', x: 260, y: 40, w: 180, h: 140, z: 2, texto: 'Revisar a escala (exemplo)', cor: 'azul', cod: 'Q-002', col: 'c2', ko: 1 } } };
const ficha = { id: 'kbteste1', nome: 'Quadro de teste (exemplo)', tipo: 'postits', status: 'rascunho', pastaNome: 'Fluxogramas', codigo: 'KB-TESTE', criadoEm: '2026-11-28T10:00:00.000Z', alteradoEm: '2026-11-28T10:05:00.000Z', gravacao: 1 };

(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 860 }, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  await N(p, async () => { const C = Data.col.bind(Data);
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_users').set('u_lider', { nome: 'Carlos Lima', login: 'carlos.lima', perfil: 'secundario', estrela: true, status: 'ativo', atrib: { qualidade: true } });
    await C('sv2_users').set('u_rita', { nome: 'Rita Alves', login: 'rita.alves', perfil: 'secundario', status: 'ativo', atrib: { qualidade: true } }); });
  await esp(p, 300);
  console.log('— A porta tem o recurso "conversas"');
  conf(await N(p, () => CworkPonteVertice.recursos.indexOf('conversas') >= 0 && typeof CworkPonteVertice.conversas.avisar === 'function' && Object.isFrozen(CworkPonteVertice.conversas)), 'CworkPonteVertice.conversas.avisar existe (congelado)');
  conf((await N(p, () => CworkPonteVertice.conversas.avisar({ arq: 'a/b', item: 'x', texto: 'oi' }))).ok === false, 'arquivo com "/" é recusado');

  console.log('— Comentário no Kanban, aberto pelo Cwork');
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4000);
  let fr = vertFr(p); conf(!!fr, 'o Vértice abriu na aba');
  await fr.evaluate(r => new Promise(ok => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readwrite'); t.objectStore('arquivos').put(r); t.oncomplete = () => ok(1); }; }),
    { id: ficha.id, marca: 'm1', ficha: ficha, pacote: { fmt: 'json', dados: JSON.stringify(conteudo), bytesOriginal: 10, bytesFinal: 10 } });
  await fr.evaluate(() => { localStorage.setItem('efcdocs:prefs', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('efcdocs:prefs') || '{}'), { 'vista:kbteste1': 'kanban' }))); });
  await N(p, () => { const f = document.querySelector('.jn-fr iframe'); f.contentWindow.location.hash = '#/arq/kbteste1'; f.contentWindow.location.reload(); }); await esp(p, 5000);
  fr = vertFr(p);
  if (!(await fr.$('.qd-vistas'))) { await fr.evaluate(() => { location.hash = '#/postits'; }); await esp(p, 1200); const ab = await fr.$('.tb-arq tr.arq .abre'); if (ab) { await ab.click(); await esp(p, 1500); } }
  if (!(await fr.$('.kb-col'))) { const v = await fr.$('.qd-vistas button:has-text("Kanban")'); if (v) { await v.click(); await esp(p, 800); } }
  conf(!!(await fr.$('.kb-col')) && !!(await fr.$('.kb-card[data-item="pi1"]')), 'o quadro de teste abre no Kanban');
  await fr.click('[data-kb-comentar="pi1"]', { force: true }); await esp(p, 500);
  conf(/Comentando como Joana Silva/.test(await fr.evaluate(() => (document.querySelector('[data-kb-gaveta="pi1"]') || {}).textContent || '')), 'a gaveta diz "Comentando como Joana Silva" (conta do Cwork)');
  await fr.fill('[data-kb-gaveta="pi1"] textarea', 'Quem compra o filtro?'); await fr.click('[data-kb-gaveta="pi1"] button[type=submit]'); await esp(p, 1200);
  const m = await N(p, () => S.chat.filter(x => x.chave === 'vtq:kbteste1|pi1'));
  conf(m.length === 1 && m[0].refTipo === 'vtq' && m[0].porNome === 'Joana Silva' && m[0].texto === 'Quem compra o filtro?' && m[0].vt && m[0].vt.cod === 'Q-001' && m[0].vt.nome === 'Quadro de teste (exemplo)',
    'o Cwork gravou a mensagem na conversa do cartão: ' + JSON.stringify(m[0] && { refTitulo: m[0].refTitulo, vt: m[0].vt }));
  const ns = await N(p, () => JSON.parse(localStorage.getItem('sv2demo_sv2_notifs') || '[]').filter(n => n.refTipo === 'chat'));
  conf(ns.length === 1 && JSON.stringify(ns[0].para) === '["u_lider"]' && /Vértice/.test(ns[0].titulo), 'aviso no sino para o responsável do cartão (Carlos Lima, pelo nome): ' + JSON.stringify(ns.map(n => [n.titulo, n.para])));
  await foto(p, 'v1-kanban-comentario');
  /* a resposta pelo Cwork leva a conta (ai) no arquivo; quem respondeu entra na conversa */
  await fr.fill('[data-kb-gaveta="pi1"] textarea', 'Eu compro.'); await fr.click('[data-kb-gaveta="pi1"] button[type=submit]'); await esp(p, 1500);
  const dado = await fr.evaluate(() => new Promise(ok => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const g = q.result.transaction('arquivos').objectStore('arquivos').get('kbteste1'); g.onsuccess = async () => { const pc = g.result && g.result.pacote; if (!pc) return ok(null);
    if (pc.fmt === 'json') return ok(JSON.parse(pc.dados)); const u = Uint8Array.from(atob(pc.dados), c => c.charCodeAt(0)); const t = await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); ok(JSON.parse(t)); }; }; }));
  const pi1 = dado && dado.itens && dado.itens.pi1;
  conf(pi1 && pi1.notaAi && pi1.notaR && pi1.notaR[0] && pi1.notaR[0].ai === pi1.notaAi && pi1.notaA === 'Joana Silva', 'no arquivo: notaAi no comentário e ai na resposta (a conta do Cwork) ' + JSON.stringify(pi1 && { notaA: pi1.notaA, notaAi: pi1.notaAi, r: pi1.notaR }));
  conf((await N(p, () => S.chat.filter(x => x.chave === 'vtq:kbteste1|pi1').length)) === 2, 'a resposta também entrou na conversa do Cwork');

  console.log('— Qualidade › Conversas abre o cartão no Vértice');
  await fr.evaluate(() => { const b2 = document.querySelector('[data-kb-gaveta] [aria-label^="Fechar"], [data-kb-gaveta] .gv-x'); if (b2) b2.click(); });
  await N(p, () => { if (typeof jnAbrir === 'function') jnAbrir('efcwork'); }); await esp(p, 500);
  await N(p, () => { location.hash = '#/qualidade/conversas'; }); await esp(p, 900);
  const lin = await N(p, () => [...document.querySelectorAll('.tb[data-tb="cv-lista"] tr[data-act="tb-lin"]')].map(r => r.textContent.replace(/\s+/g, ' ')));
  conf(lin.length === 1 && /Vértice · cartão/.test(lin[0]) && /Quadro de teste \(exemplo\) · Q-001/.test(lin[0]), 'a conversa do cartão aparece na lista: ' + lin.join(' / '));
  await foto(p, 'v2-conversas-vertice');
  await N(p, () => { const f = document.querySelector('.jn-fr iframe'); f.contentWindow.location.hash = '#/postits'; }); await esp(p, 800);
  await p.click('.tb[data-tb="cv-lista"] tr[data-act="tb-lin"]'); await esp(p, 2500);
  fr = vertFr(p);
  conf(/#\/arq\/kbteste1$/.test(await fr.evaluate(() => location.hash)), 'o Vértice abre o arquivo (o /c/pi1 sai do endereço depois de abrir o cartão)');
  conf(!!(await fr.$('[data-kb-gaveta="pi1"]')), 'e abre a gaveta de comentários do cartão Q-001');
  conf(/Quem compra o filtro\?/.test(await fr.evaluate(() => (document.querySelector('[data-kb-gaveta="pi1"]') || {}).textContent || '')), 'com a conversa dentro');
  await foto(p, 'v3-cartao-aberto');
  /* no quadro livre (não no Kanban), o mesmo endereço abre o cartão do comentário no post-it */
  await fr.evaluate(() => { const x = document.querySelector('[data-kb-gaveta] button[aria-label^="Fechar"]'); if (x) x.click(); }); await esp(p, 300);
  await fr.click('.qd-vistas button:has-text("Quadro")'); await esp(p, 800);
  await fr.evaluate(() => { location.hash = '#/arq/kbteste1'; }); await esp(p, 500); await fr.evaluate(() => { location.hash = '#/arq/kbteste1/c/pi1'; }); await esp(p, 900);
  conf(!!(await fr.$('[data-com-cartao="pi1"]')) && /Eu compro\./.test(await fr.evaluate(() => (document.querySelector('[data-com-cartao="pi1"]') || {}).textContent || '')), 'no quadro livre, abre o cartão do comentário do post-it');
  await foto(p, 'v4-quadro-livre');
  /* revisor 3 e 9: tocar de novo usa a mesma aba do Vértice e abre de novo (o /c/ sai do endereço depois de abrir) */
  conf(/^#\/arq\/kbteste1$/.test(await fr.evaluate(() => location.hash)), 'depois de abrir, o endereço volta a #/arq/kbteste1');
  await fr.evaluate(() => { const x = document.querySelector('[data-com-cartao] [aria-label^="Fechar"]'); if (x) x.click(); }); await fr.click('.qd-vistas button:has-text("Kanban")'); await esp(p, 800);
  const abas0 = await N(p, () => vtAbas().length);
  await p.click('.jn-ab[data-act="jn-ir"] >> nth=0'); await esp(p, 500);
  await N(p, () => { location.hash = '#/qualidade/conversas'; }); await esp(p, 800);
  await p.click('.tb[data-tb="cv-lista"] tr[data-act="tb-lin"]'); await esp(p, 1800); fr = vertFr(p);
  conf((await N(p, () => vtAbas().length)) === abas0 && !!(await fr.$('[data-kb-gaveta="pi1"]')), 'segundo toque: a mesma aba (' + abas0 + ') e a gaveta abre de novo');
  /* revisor 1: em outro aparelho o arquivo ainda não está guardado; o aviso abre e o Vértice espera a nuvem trazer */
  const naNuvem = await N(p, () => Data.col('vtd_arquivos').get('kbteste1'));
  conf(!!naNuvem, 'o quadro de teste subiu para a nuvem (pasta Fluxogramas): versão ' + (naNuvem && naNuvem.versao));
  await fr.evaluate(() => new Promise(ok => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readwrite'); t.objectStore('arquivos').delete('kbteste1'); t.oncomplete = () => ok(1); }; }));
  await N(p, () => { const f = document.querySelector('.jn-fr iframe'); f.contentWindow.location.hash = '#/arq/kbteste1/c/pi1'; f.contentWindow.location.reload(); }); await esp(p, 9000); fr = vertFr(p);
  conf(!!(await fr.$('[data-kb-gaveta="pi1"]')), 'sem o arquivo no aparelho, o Vértice espera a nuvem e abre o cartão (não diz "não está mais neste aparelho")');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
