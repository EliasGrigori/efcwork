/* EFCwork v0.6.41 + Vértice v0.6.75 · P4: o Vértice na nuvem pela porta do Cwork (recurso 'nuvem': listar, ler, gravar).
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /efcwork/vertice/ (VERTICE_DIR = a pasta montada; padrão: a pasta vertice/ do repositório).
   Modo demonstração (o banco do Cwork fica no aparelho; as regras do Firestore só no site). Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0641.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice');
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
async function abre(b, base) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'America/Fortaleza', serviceWorkers: 'block' }), p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  return p;
}
const N = (p, fn, ...a) => p.evaluate(fn, ...a);
const vertFr = p => p.frames().find(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame());
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  let p = await abre(b, base);
  console.log('— A porta do Cwork: recurso nuvem');
  const r0 = await N(p, () => { const x = window.CworkPonteVertice; return { rec: x.recursos.join(','), tem: !!x.nuvem && ['listar', 'ler', 'gravar'].every(k => typeof x.nuvem[k] === 'function'), cong: Object.isFrozen(x.nuvem) }; });
  conf(/nuvem/.test(r0.rec) && r0.tem && r0.cong, 'a porta tem o recurso "nuvem" (listar, ler, gravar), congelado (' + r0.rec + ')');
  const pac = { fmt: 'texto', dados: 'conteúdo de teste', bytesOriginal: 17, bytesFinal: 17 };
  const ficha = (id, o) => Object.assign({ id: id, nome: 'Etiqueta de teste', tipo: 'planilha', status: 'rascunho', pastaNome: 'Etiquetas', nuvem: { versao: 9 } }, o || {});
  let r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 0), { f: ficha('arq1'), p: pac });
  conf(r && r.ok && r.versao === 1, 'gravar um arquivo novo (versão esperada 0): versão 1');
  const d1 = await N(p, async () => ({ a: await Data.col('vtd_arquivos').get('arq1'), ps: (await Data.col('vtd_partes').all()).filter(x => x.arq === 'arq1') }));
  conf(d1.a && d1.a.v === 1 && d1.a.versao === 1 && d1.a.versaoPartes === 1 && d1.a.pasta === 'Etiquetas' && d1.a.partes === 1 && d1.a.partesDe === d1.a.porId && d1.a.porNome === 'Joana Silva' && !('nuvem' in d1.a.ficha), 'a ficha na nuvem no formato das regras [R7a] (versão, pasta, partes, quem gravou; sem a marca "nuvem")');
  const campos = Object.keys(d1.a).filter(k => ['id', 'v', 'ficha', 'versao', 'versaoPartes', 'pasta', 'partes', 'partesDe', 'bytes', 'porId', 'porNome', 'em', 'srv', 'testeConta'].indexOf(k) < 0);
  conf(!campos.length, 'nenhum campo fora da lista que as regras aceitam' + (campos.length ? ': ' + campos.join(',') : ''));
  conf(d1.ps.length === 1 && d1.ps[0].id === 'arq1_1_' + d1.a.porId + '_0' && d1.ps[0].versao === 1 && d1.ps[0].n === 0 && typeof d1.ps[0].b64 === 'string', 'o pedaço com o id <arquivo>_<versão>_<quem>_<n> [R7b]');
  r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 0), { f: ficha('arq1'), p: pac });
  conf(r && r.conflito === true, 'gravar com a versão errada (alguém gravou no meio): conflito, nada muda');
  const grande = { fmt: 'gzip', dados: 'x'.repeat(2100000), bytesOriginal: 1, bytesFinal: 1 };
  r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 1), { f: ficha('arq1', { nome: 'Etiqueta grande' }), p: grande });
  const d2 = await N(p, () => Data.col('vtd_arquivos').get('arq1'));
  conf(r.ok && r.versao === 2 && d2.partes === 3 && d2.versaoPartes === 2, 'arquivo de 2 MB vai em 3 pedaços de até 900 mil letras (versão 2)');
  const lido = await N(p, () => window.CworkPonteVertice.nuvem.ler('arq1'));
  conf(lido && lido.versao === 2 && lido.ficha.nome === 'Etiqueta grande' && lido.pacote.dados.length === 2100000, 'ler junta os pedaços e devolve o conteúdo inteiro');
  r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 0).then(x => x, e => ({ erro: e.message })), { f: ficha('arq2', { pastaNome: '' }), p: pac });
  conf(r.erro && /5 pastas/.test(r.erro), 'arquivo sem uma das 5 pastas não sobe');
  r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 0).then(x => x, e => ({ erro: e.message })), { f: ficha('a_b'), p: pac });
  conf(r.erro, 'id com "_" ou "/" é recusado (o id do pedaço usa "_")');
  const l1 = await N(p, () => window.CworkPonteVertice.nuvem.listar());
  conf(l1.length === 1 && l1[0].id === 'arq1' && l1[0].versao === 2 && l1[0].pasta === 'Etiquetas', 'listar devolve o resumo (id, versão, pasta)');
  conf(await N(p, async () => (await Data.col('sv2_audit').all()).some(x => x.acao === 'vertice_nuvem')), 'cada subida vai para a Atividade do Cwork');

  console.log('— Quem não é Líder ★ nem Administrador');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); });
  await esp(p, 600);
  r = await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 2).then(x => x, e => ({ erro: e.message })), { f: ficha('arq1'), p: pac });
  conf(r.erro && /Administrador e o Líder/.test(r.erro), 'Colaborador não grava na nuvem (ITEM 196 e decisão de 27/11)');
  const fechaPastas = libera => N(p, async lib => { const ps = IP_PASTAS.map(nome => ({ nome: nome, todos: false, leitores: lib.indexOf(nome) >= 0 ? [S.user.id] : [] })); await Data.col('sv2_cfg').set('vertice_pastas', { pastas: ps, acesso: vtAcesso(ps) }); }, libera);
  await fechaPastas([]); await esp(p, 600);
  let l2 = await N(p, () => window.CworkPonteVertice.nuvem.listar());
  conf(l2.length === 0, 'Colaborador sem pasta liberada não vê nada');
  await fechaPastas(['Etiquetas']);
  await esp(p, 600);
  const pst = await N(p, () => window.CworkPonteVertice.pastas().filter(x => x.ler).map(x => x.nome));
  l2 = await N(p, () => window.CworkPonteVertice.nuvem.listar());
  conf(pst.join() === 'Etiquetas' && l2.length === 1 && l2[0].id === 'arq1', 'com a pasta Etiquetas liberada, ele vê o arquivo dela (' + pst.join(',') + ')');
  conf((await N(p, () => window.CworkPonteVertice.nuvem.ler('arq1'))).versao === 2, 'e lê o conteúdo');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'principal' }); }); await esp(p, 600);

  console.log('— O Vértice de verdade dentro do Cwork');
  await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: a.f, pacote: a.p }, 2), { f: ficha('arq1', { nome: 'Etiqueta do Vértice' }), p: { fmt: 'texto', dados: JSON.stringify({ abas: [{ nome: 'Folha 1', celulas: { A1: { v: 'Olá da nuvem' } } }] }), bytesOriginal: 10, bytesFinal: 10 } });
  await N(p, () => { window._chamadas = []; const n = window.CworkPonteVertice.nuvem; ['listar', 'ler', 'gravar'].forEach(k => { const f0 = n[k]; window['_' + k] = f0; }); });
  await p.click('.cs-nav a[href="#/vertice"]'); await esp(p, 4000);
  let fr = vertFr(p);
  conf(!!fr, 'o Vértice abriu na aba');
  const idb = async (fr2, id) => fr2.evaluate(id2 => new Promise(ok2 => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { try { const t = q.result.transaction('arquivos', 'readonly').objectStore('arquivos').get(id2); t.onsuccess = () => ok2(t.result || null); t.onerror = () => ok2(null); } catch (e) { ok2(null); } }; q.onerror = () => ok2(null); }), id);
  let rec = fr && await idb(fr, 'arq1');
  conf(rec && rec.ficha.nome === 'Etiqueta do Vértice' && rec.ficha.nuvem && rec.ficha.nuvem.versao === 3 && rec.ficha.pastaNome === 'Etiquetas', 'ao abrir, o Vértice trouxe da nuvem o arquivo da pasta Etiquetas (versão 3) para o aparelho');
  /* um arquivo do aparelho, já em Documentos internos e nunca enviado: sobe sozinho ao abrir de novo */
  if (fr) await fr.evaluate(r2 => new Promise(ok2 => { const q = indexedDB.open('efcdocs', 1); q.onsuccess = () => { const t = q.result.transaction('arquivos', 'readwrite'); t.objectStore('arquivos').put(r2); t.oncomplete = () => ok2(1); }; }), { id: 'loc1', marca: 'm1', pacote: rec.pacote, ficha: Object.assign({}, rec.ficha, { id: 'loc1', nome: 'Formulário do aparelho', pastaNome: 'Formulários', nuvem: undefined, gravacao: 1 }) });
  await N(p, () => { const f = document.querySelector('.jn-fr iframe[data-j="docs"]') || document.querySelector('.jn-fr iframe'); f.contentWindow.location.reload(); }); await esp(p, 4500);
  const sub = await N(p, async () => Data.col('vtd_arquivos').get('loc1'));
  conf(sub && sub.versao === 1 && sub.pasta === 'Formulários' && sub.ficha.nome === 'Formulário do aparelho', 'arquivo do aparelho em Documentos internos (Formulários) subiu sozinho para a nuvem');
  fr = vertFr(p); rec = fr && await idb(fr, 'loc1');
  conf(rec && rec.ficha.nuvem && rec.ficha.nuvem.versao === 1, 'e o aparelho guardou a versão da nuvem (o próximo salvar não dá conflito)');
  /* a coluna Nuvem em Documentos internos (página de aprovação) */
  const T = path.join(RAIZ, 'tools/visual/v0641/telas'); fs.mkdirSync(T, { recursive: true });
  fr = vertFr(p); if (fr) { await fr.evaluate(() => { location.hash = '#/internos'; }); await esp(p, 1500); }
  const col = fr && await fr.evaluate(() => [...document.querySelectorAll('td, .c-nuvem')].map(x => x.textContent).filter(x => /nuvem|aparelho/i.test(x)));
  conf(col && col.some(x => /Na nuvem · versão 3/.test(x)), 'Documentos internos mostra a coluna Nuvem ("Na nuvem · versão 3" na aba Etiquetas)' + (col ? ' (' + col.slice(0, 3).join(' | ') + ')' : ''));
  await p.screenshot({ path: path.join(T, 'pc-internos-nuvem.png') });
  if (fr) { await fr.evaluate(() => { const b2 = [...document.querySelectorAll('[data-int-sub]')].find(x => x.getAttribute('data-int-sub') === 'Etiquetas'); if (b2) b2.click(); }); await esp(p, 600); }
  await p.screenshot({ path: path.join(T, 'pc-internos-etiquetas.png') });
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
