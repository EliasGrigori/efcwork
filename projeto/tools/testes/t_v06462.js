/* EFCwork v0.6.46.2 · etiqueta sem modelo ligado (pedido do Elias, 27/11 23:06: "quando não tem o documento, dê a opção de vincular um").
   Antes: aviso vermelho mandando ir em Coletas › Cadastros › Modelos de etiqueta. Agora: abre ali mesmo "Ligar modelo de etiqueta"
   com o material da amostra; "Salvar e imprimir" liga e segue para o Vértice. Quem não cuida dos cadastros continua só com o aviso.
   Planilha de TESTE (só o nome, nenhum documento do Elias). Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v06462.js (EFC_DIST=<pasta> testa outra montagem) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), DIST = process.env.EFC_DIST || path.join(RAIZ, 'dist'), FOTOS = process.env.EFC_FOTOS || '';
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto('file://' + path.join(DIST, 'index.html') + '?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  await p.evaluate(async () => {
    await Data.col('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol || {}, { labs: ['Laboratório A'], etqVertice: [] }));
    const c = (id, o) => Data.col('sv2_coletas').set(id, Object.assign({ data: addDias(hojeISO(), -1), situacao: 'ativa', criadoEm: nowISO(), coletor: 'Teste', lab: 'Laboratório A', analiseNome: 'Teste' }, o));
    await c('et1', { tipo: 'SOLO', talhao: 'T01A' }); await c('et2', { tipo: 'FOLHA', talhao: 'T02A' });
    await window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'detqteste1', nome: 'Etiqueta de teste', tipo: 'planilha', status: 'rascunho', pastaNome: 'Etiquetas' }, pacote: { fmt: 'json', dados: '{}', bytesOriginal: 2, bytesFinal: 2 } }, 0);
    window._jn = []; window.jnAbrir = (...a) => { window._jn.push(a); };
  });
  await esp(p, 500);
  return p;
}
const foto = async (p, n) => { if (FOTOS) { fs.mkdirSync(FOTOS, { recursive: true }); await p.screenshot({ path: path.join(FOTOS, n + '.png') }); } };
(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 600);
  console.log('— Amostra de Solo sem modelo ligado');
  await p.evaluate(() => etImprimir(['et1'], 'teste')); await esp(p, 900);
  const f = await p.evaluate(() => ({ k: S.fm && S.fm.k, tipo: S.fm && S.fm.tipo, lab: S.fm && S.fm.lab, tx: (document.querySelector('#gv') || {}).textContent || '' }));
  conf(f.k === 'etLig' && f.tipo === 'SOLO' && f.lab === 'Laboratório A', 'abre "Ligar modelo de etiqueta" já com Solo e o laboratório da amostra');
  conf(/Sem modelo de etiqueta para Solo/.test(f.tx) && /Salvar e imprimir/.test(f.tx), 'diz o que falta e o botão é "Salvar e imprimir"');
  await foto(p, 'proposta-ligar');
  await p.click('[data-dd="et:doc"] .dd-b'); await p.click('[data-dd="et:doc"] [data-v="detqteste1"]'); await esp(p, 200);
  await p.click('[data-act="et-lig-ok"]'); await esp(p, 900);
  const r = await p.evaluate(() => ({ lig: (S.cfgCol.etqVertice || []).map(x => x.tipo + '|' + x.lab + '|' + x.docId), jn: window._jn.map(x => x[1]) }));
  conf(r.lig.join() === 'SOLO|Laboratório A|detqteste1', 'a ligação ficou gravada (Solo · Laboratório A · a planilha escolhida)');
  conf(r.jn.length === 1 && /^#\/pedido\/et/.test(r.jn[0]), 'e a impressão seguiu sozinha para o Vértice (' + r.jn.join() + ')');

  console.log('— Duas amostras, uma com modelo e outra sem');
  await p.evaluate(() => { window._jn = []; etImprimir(['et1', 'et2'], 'teste'); }); await esp(p, 800);
  const m = await p.evaluate(() => ({ tipo: S.fm && S.fm.tipo, pular: !!document.querySelector('#gv [data-act="et-pular"]') }));
  conf(m.tipo === 'FOLHA' && m.pular, 'pede a ligação da Folha e oferece "Imprimir só as outras"');
  await p.click('#gv [data-act="et-pular"]'); await esp(p, 600);
  conf(await p.evaluate(() => window._jn.length === 1 && !S.fm), '"Imprimir só as outras" imprime a de Solo sem ligar a Folha');

  console.log('— Etiqueta que já está nos Impressos (vinda do Vértice) entra na lista');
  await p.evaluate(async () => { await Data.col('efd_docs').set('detqcwork1', { v: 1, id: 'detqcwork1', tipo: 'planilha', origem: 'docs', nome: 'Etiqueta de teste no Cwork', codigo: 'ETI 900', pastaNome: 'Etiquetas', status: 'vigente', rev: 1 });
    await Data.col('efd_docs').set('detqcwork2', { v: 1, id: 'detqcwork2', tipo: 'planilha', origem: 'efcwork', nome: 'Excel importado aqui', pastaNome: 'Etiquetas', status: 'vigente', rev: 1 }); });
  await esp(p, 500);
  await p.evaluate(() => { window._jn = []; etImprimir(['et2'], 'teste'); }); await esp(p, 700);
  const ops = await p.evaluate(() => [...document.querySelectorAll('[data-dd="et:doc"] [data-v]')].map(x => x.getAttribute('data-v') + '=' + x.textContent));
  conf(ops.some(x => /^detqcwork1=ETI 900 · Etiqueta de teste no Cwork/.test(x)) && ops.some(x => /^detqteste1=/.test(x)), 'a lista traz a etiqueta dos Impressos (com o código) e a da nuvem do Vértice (' + ops.length + ' opções)');
  conf(!ops.some(x => /detqcwork2/.test(x)), 'o Excel importado direto no Cwork não entra (o Vértice não tem esse arquivo)');
  await p.click('[data-dd="et:doc"] .dd-b'); await esp(p, 300); await foto(p, 'proposta-lista-etiquetas'); await p.click('[data-dd="et:doc"] [data-v="detqcwork1"]'); await esp(p, 200);
  await p.click('[data-act="et-lig-ok"]'); await esp(p, 900);
  conf(await p.evaluate(() => (S.cfgCol.etqVertice || []).some(x => x.tipo === 'FOLHA' && x.docId === 'detqcwork1' && x.nome === 'ETI 900 · Etiqueta de teste no Cwork') && window._jn.length === 1), 'escolher a dos Impressos liga a Folha a ela e imprime');
  await p.evaluate(async () => { await Data.col('sv2_cfg').set('coletas', Object.assign({}, S.cfgCol, { etqVertice: (S.cfgCol.etqVertice || []).filter(x => x.tipo !== 'FOLHA') })); }); await esp(p, 400);

  console.log('— Pasta Etiquetas vazia');
  await p.evaluate(async () => { S.etDocs = []; S.ipDocs = []; window._jn = []; etImprimir(['et2'], 'teste'); }); await esp(p, 600);
  conf(!!(await p.$('#gv [data-act="et-vertice"]')), 'sem planilha na pasta Etiquetas, oferece "Abrir o Vértice"');
  await p.click('#gv [data-act="et-vertice"]'); await esp(p, 500);
  conf(await p.evaluate(() => window._jn.length === 1 && window._jn[0][1] === '#/internos'), 'e abre o Vértice em Documentos internos');

  console.log('— Colaborador');
  await p.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); }); await esp(p, 600);
  await p.evaluate(() => { window._jn = []; etImprimir(['et2'], 'teste'); }); await esp(p, 600);
  const col = await p.evaluate(() => ({ fm: !!S.fm, av: [...document.querySelectorAll('.av, .aviso, [role=status]')].map(x => x.textContent).join(' ') }));
  conf(!col.fm, 'Colaborador não liga modelo (fica só o aviso, como antes)');
  conf(!p._er.length, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));

  console.log('— Celular 390');
  const c = await abre(b, 390, 844);
  await c.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(c, 600);
  await c.evaluate(() => etImprimir(['et1'], 'teste')); await esp(c, 900);
  const al = await c.evaluate(() => { const r = [...document.querySelectorAll('#gv .gv-pe .bt')].map(e => e.getBoundingClientRect()); return { h: r.map(x => Math.round(x.height)), lado: document.documentElement.scrollWidth > innerWidth }; });
  conf(al.h.length && al.h.every(h => h >= 44) && !al.lado, 'celular: botões com 44 px e nada rola para o lado (' + al.h.join(',') + ')');
  await foto(c, 'proposta-ligar-celular');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
