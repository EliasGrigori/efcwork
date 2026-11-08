/* EFCwork · suíte da v0.4.6 — página do plano (áreas, seleção, Programar, Lançar coletadas, folha de campo),
   com as regras do EFClaudian (SOLO+RAIZ gera Solo e Nematoide, profundidade, travas dos planos, etiqueta da fruta). Modo demonstração.
   Uso: node tools/testes/t_v046.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(100); };
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const gv = p => p.evaluate(() => { const g = document.querySelector('#gv'); return g ? g.textContent : ''; });
async function primeiro(p) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => {
    const h = hojeISO(), d = n => addDias(h, n), C = Data.col.bind(Data), me = S.user, ano = h.slice(0, 4);
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], labModelo: { IBRA: 'completa' }, fazendas: [{ prefixo: 'RU', numero: '18', nome: 'Fazenda Teste' }],
      tipos: [{ nome: 'SOLO+RAIZ', gera: ['SOLO', 'NEMATOIDE'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FOLHA', gera: ['FOLHA'], pontosPorHa: 5 }, { nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }] });
    await C('sv2_talhoes').set('t1', { codigo: 'RU11TAI24', pivo: 'Pivô 2', hectares: 4.5, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    await C('sv2_talhoes').set('t2', { codigo: 'RU12TAI24', pivo: 'Pivô 2', hectares: 4.5, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    await C('sv2_talhoes').set('t3', { codigo: 'RU13TAI24', pivo: 'Pivô 2', hectares: 4.0, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    const A = (id, o) => C('sv2_analises').set(id, Object.assign({ ativo: true, criadoEm: '2026-01-0' + id.slice(1) + 'T10:00:00.000Z' }, o));
    await A('a1', { nome: 'Solo completo', tipo: 'SOLO', lab: 'IBRA', sigla: 'SC', valor: 120 });
    await A('a2', { nome: 'Nematoide', tipo: 'NEMATOIDE', lab: 'BIOAGRI', sigla: 'NEM', valor: 80 });
    await A('a3', { nome: 'Foliar', tipo: 'FOLHA', lab: 'IBRA', sigla: 'FOL', valor: 90 });
    await A('a4', { nome: 'Resíduos', tipo: 'FRUTA', lab: 'IBRA', sigla: 'RES', valor: 300 });
    await A('a5', { nome: 'Composto', tipo: 'COMPOSTO', lab: 'IBRA', sigla: 'CMP', valor: 150 });
    await A('a6', { nome: 'Micronutrientes', tipo: 'SOLO', lab: 'IBRA', sigla: 'MIC', valor: 60 });
    const P = (id, o) => C('sv2_prog').set(id, Object.assign({ situacao: 'ativa', criadoEm: nowISO(), criadoPor: me.id, criadoPorNome: 'Joana Silva' }, o));
    await P('p1', { data: d(-2), semana: 1, talhao: 'RU11TAI24', tipo: 'SOLO+RAIZ', pontos: 18, coletor: 'Equipe A', prazo: d(5), analiseIds: ['a1', 'a2'] });
    await P('p2', { data: d(-1), talhao: 'RU13TAI24', tipo: 'FOLHA', pontos: 20, coletor: 'Equipe A' });
    await P('p3', { data: d(-30), talhao: 'RU12TAI24', tipo: 'FOLHA', pontos: 22, coletor: 'Equipe B', coletadaEm: d(-29) });
    await P('p4', { data: d(-10), talhao: 'RU12TAI24', tipo: 'FOLHA', situacao: 'cancelada', canceladaMotivo: 'replantio' });
    await P('p5', { talhao: 'RU11TAI24', tipo: 'FOLHA', coletor: 'Equipe A' }); /* sem dia definido: não entra na tabela */
    await C('sv2_coletas').set('c0', { tipo: 'SOLO', data: ano + '-01-15', talhao: 'RU12TAI24', analiseNome: 'Solo completo', sigla: 'SC', lab: 'IBRA', situacao: 'ativa', coletor: 'Equipe B', criadoEm: nowISO() });
    await C('sv2_rodizio').set('r1', { nome: 'Solo anual', tipo: 'SOLO', freq: 'A', ano: Number(ano), areas: ['RU12TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z' });
    await C('sv2_rodizio').set('r2', { nome: 'Folha anual', tipo: 'FOLHA', freq: 'A', ano: Number(ano), areas: ['RU13TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z', fechados: { [ano + '-A']: { por: 'x' } } });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'visitante', superiores: [me.id], atrib: { coletas: true } });
  });
  await p.waitForTimeout(300);
}
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);
  /* plano SOLO+RAIZ semestral com 6 áreas (RU11 tem programação pendente p1) */
  await p.evaluate(async () => { const C = Data.col.bind(Data), ano = hojeISO().slice(0, 4);
    for (const n of [14, 15, 16]) await C('sv2_talhoes').set('t' + n, { codigo: 'RU' + n + 'TAI24', pivo: 'Pivô 3', hectares: 3, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    await C('sv2_rodizio').set('r3', { nome: 'Solo e raiz', tipo: 'SOLO+RAIZ', freq: 'S', ano: Number(ano), areas: ['RU11TAI24', 'RU12TAI24', 'RU13TAI24', 'RU14TAI24', 'RU15TAI24', 'RU16TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z' }); });
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);

  console.log('— Cartão abre a página do plano');
  conf(await p.evaluate(() => !!document.querySelector('a.pg-pl[href="#/coletas/plano/r3"]')), 'o cartão do plano é um link para a página dele');
  await p.click('a.pg-pl[href="#/coletas/plano/r3"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => location.hash === '#/coletas/plano/r3' && /SOLO\+RAIZ · semestral · 20\d\d/.test(document.querySelector('.cs-ph h1').textContent)), 'abre #/coletas/plano/r3 com o título "SOLO+RAIZ · semestral · ano"');
  conf(await p.evaluate(() => /Programação/.test(document.querySelector('.cs-abas a.on').textContent) && /Coletas/.test(document.querySelector('.cs-ph').textContent)), 'a aba Programação continua marcada e o caminho mostra Coletas / Programação');
  conf(await p.evaluate(() => /Em andamento/.test(document.querySelector('.cs-ph').textContent) && /01\/07 a 31\/12/.test(document.querySelector('.cs-ph').textContent)), 'status e período (01/07 a 31/12) no cabeçalho');
  conf(await p.evaluate(() => !document.querySelector('.cs-abas a[href*="calend"], .cs-abas a[href*="hist"]') && !/Calendário|Histórico/.test(document.querySelector('.pp').textContent)), 'sem Calendário e sem Histórico (decisão de 07/11)');
  const est = await p.evaluate(() => Array.from(document.querySelectorAll('.pp-ar')).map(e => e.className.split(' ')[1] + ':' + e.querySelector('b').textContent).join(' '));
  console.log('   áreas:', est);
  conf(/p:RU11/.test(est) && /f:RU12/.test(est) && /Faltam \(6\)/.test(await p.textContent('.pp')) && /Coletadas \(0\)/.test(await p.textContent('.pp')), 'Faltam (6) com RU11 programada; Coletadas (0)');
  conf(await p.evaluate(() => /\d\d\/\d\d/.test(document.querySelector('.pp-ar.p small').textContent)), 'a programada mostra o dia dentro do chip');
  conf(await p.evaluate(() => /0% · 0 de 6 áreas coletadas/.test(document.querySelector('.pp-prog').textContent)), 'barra: "0% · 0 de 6 áreas coletadas"');

  console.log('— Cores: o que não terminou é discreto, coletada forte');
  const cor = await p.evaluate(() => { const g = s => { const e = document.querySelector('.pp-ar.' + s); const c = getComputedStyle(e); return [c.borderTopWidth, c.borderTopColor, c.backgroundColor, c.color].join('|'); }; return { f: g('f'), p: g('p') }; });
  console.log('   falta:', cor.f, '| programada:', cor.p);
  conf(/^1px\|rgb\(233, 227, 213\)/.test(cor.f) && /^1px\|rgb\(188, 220, 200\)\|rgb\(242, 248, 244\)/.test(cor.p), 'claro: falta e programada com linha fina (1 px) e tom claro');

  console.log('— Marcar áreas e barra flutuante');
  await p.click('.pp-ar[data-id="RU13TAI24"]'); await p.click('.pp-ar[data-id="RU14TAI24"]'); await p.waitForTimeout(200);
  conf(await p.evaluate(() => { const b = document.querySelector('.pp-bar'); return b && /2 marcadas/.test(b.textContent) && /Programar/.test(b.textContent) && /Lançar coletadas/.test(b.textContent); }), 'barra flutuante: "2 marcadas · Programar · Lançar coletadas"');
  conf(await p.evaluate(() => document.querySelectorAll('.pp-ar.sel .pp-ok').length === 2), 'marcada ganha o ✓ no canto');
  conf(await p.evaluate(() => { const r = document.querySelector('.pp-bar').getBoundingClientRect(); return r.bottom <= innerHeight && r.top > innerHeight - 120; }), 'a barra fica embaixo, dentro da tela');
  await p.screenshot({ path: path.join(SHOTS, 'v046-pc-plano.png') });

  console.log('— Programar');
  await p.click('.pp-bar [data-act="pp-prog"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => /Programar/.test(document.querySelector('#gv').textContent) && document.querySelectorAll('#gv .pp-ar.sel').length === 2), 'Programar abre na gaveta com as 2 áreas marcadas');
  conf(await p.evaluate(() => getComputedStyle(document.querySelector('.pp-bar')).display === 'none'), 'com a gaveta aberta a barra de seleção some');
  conf(await p.evaluate(() => /RU11 \d\d\/\d\d/.test(document.querySelector('#gv .pp-ja').textContent)), 'mostra a já programada (RU11) fora da escolha');
  await p.fill('#gv [data-fm="data"]', (new Date().getFullYear() + 1) + '-01-10'); await p.click('#gv [data-act="pp-prog-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /dentro do período/.test(document.querySelector('#gv .fm-msg').textContent)), 'dia fora do período: avisa e não grava');
  const dia = await p.evaluate(() => addDias(hojeISO(), 3) <= hojeISO().slice(0, 4) + '-12-31' ? addDias(hojeISO(), 3) : hojeISO());
  await p.fill('#gv [data-fm="data"]', dia); await p.fill('#gv [data-fm="prazo"]', await p.evaluate(d => addDias(d, -1), dia)); await p.click('#gv [data-act="pp-prog-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /prazo não pode ser antes/.test(document.querySelector('#gv .fm-msg').textContent)), 'prazo antes do dia: avisa');
  await p.fill('#gv [data-fm="prazo"]', ''); await p.click('#gv [data-act="pp-prog-ok"]'); await p.waitForTimeout(700);
  /* v0.4.7: a programação do plano vai para dentro do plano (sv2_rodizio.progs[período][área]), igual ao EFClaudian */
  const pr = await p.evaluate(() => { const r = S.rodizios.find(x => x.id === 'r3'), g = r.progs || {}, pk = Object.keys(g)[0] || ''; return Object.keys(g[pk] || {}).sort().map(a => [a, g[pk][a].data ? 'dia' : '', g[pk][a].pontos, g[pk][a].por].join('/')).concat([pk]); });
  console.log('   ', pr.join(' | '));
  conf(pr.length === 3 && /^\d{4}-S[12]$/.test(pr[2]) && /^RU13TAI24\/dia\/16\/Joana Silva$/.test(pr[0]) && /^RU14TAI24\/dia\/12\/Joana Silva$/.test(pr[1]) && !(S => S)(0), 'gravou 2 programações dentro do plano, no formato do EFClaudian (dia, pontos = ha × 4, quem)');
  conf(await p.evaluate(() => !document.querySelector('#gv') && document.querySelectorAll('.pp-ar.p').length === 3 && !document.querySelector('.pp-bar')), 'as 2 viram programadas, a gaveta fecha e a seleção limpa');
  conf(await p.evaluate(async () => (await Data.col('sv2_audit').all()).filter(a => a.acao === 'programar_plano' && /programou 2 área/.test(a.resumo)).length === 1), 'auditoria registrada (programar_plano, igual ao EFClaudian)');

  console.log('— Lançar coletadas (com e sem programação)');
  await p.click('.pp-ar[data-id="RU11TAI24"]'); await p.click('.pp-ar[data-id="RU15TAI24"]'); await p.waitForTimeout(150);
  await p.click('.pp-bar [data-act="pp-lanc"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => /Vai gravar 4 amostra\(s\): Solo 2, Nematoide 2/.test(document.querySelector('#gv').textContent)), 'resumo: "Vai gravar 4 amostra(s): Solo 2, Nematoide 2"');
  await p.click('#gv [data-act="pp-lanc-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /profundidade/.test(document.querySelector('#gv .fm-msg').textContent)), 'sem profundidade: pede');
  await dd(p, 'lc:pgprof', '0-20'); await p.click('#gv [data-act="pp-lanc-ok"]'); await p.waitForTimeout(800);
  const cs = await p.evaluate(() => S.coletas.filter(c => (c.talhao === 'RU11TAI24' || c.talhao === 'RU15TAI24') && c.criadoEm > new Date(Date.now() - 60000).toISOString()).map(c => c.talhao + ':' + c.tipo + ':' + (c.progId || '-') + ':' + c.prof).sort());
  console.log('   ', cs.join(' | '));
  conf(cs.length === 4 && cs.filter(x => /RU11TAI24:.*:p1:0-20/.test(x)).length === 2 && cs.filter(x => /RU15TAI24:.*:-:0-20/.test(x)).length === 2, 'RU11 usa a programação p1; RU15 é coleta direta do plano (sem programação)');
  conf(await p.evaluate(() => !!(S.prog.find(x => x.id === 'p1') || {}).coletadaEm), 'a programação p1 fica marcada como coletada');
  conf(await p.evaluate(async () => { const l = await Data.col('sv2_audit').all(); return l.some(a => a.acao === 'coletado_programacao' && a.entidadeId === 'p1') && l.some(a => a.acao === 'coletado_plano' && a.entidadeId === 'RU15TAI24'); }), 'auditoria: coletado_programacao (RU11) e coletado_plano (RU15), como no EFClaudian');
  conf(await p.evaluate(() => /Coletadas \(2\)/.test(document.querySelector('.pp').textContent) && document.querySelectorAll('.pp-ar.c').length === 2 && /33% · 2 de 6/.test(document.querySelector('.pp-prog').textContent)), 'as 2 vão para Coletadas e a barra sobe para 33%');
  conf(await p.evaluate(() => document.querySelectorAll('.pp-ar.c').length === document.querySelectorAll('span.pp-ar.c').length), 'coletada não se marca (não é botão)');
  const corC = await p.evaluate(() => getComputedStyle(document.querySelector('.pp-ar.c')).backgroundColor);
  conf(corC === 'rgb(47, 125, 79)', 'claro: coletada em verde cheio');

  console.log('— Folha de campo');
  await p.evaluate(() => { window.print = () => { window._imp = document.querySelector('#tb-imp').textContent; window._linhas = document.querySelectorAll('#tb-imp tbody tr').length; }; });
  await p.click('[data-act="pp-folha"]'); await p.waitForTimeout(200);
  const imp = await p.evaluate(() => [window._imp || '', window._linhas]);
  conf(/Folha de campo · SOLO\+RAIZ/.test(imp[0]) && imp[1] === 4, 'folha de campo com as 4 áreas que faltam');

  console.log('— Tema escuro');
  await p.evaluate(() => { document.documentElement.setAttribute('data-tema', 'escuro'); }); await p.waitForTimeout(150);
  const esc = await p.evaluate(() => [getComputedStyle(document.querySelector('.pp-ar.c')).backgroundColor, getComputedStyle(document.querySelector('.pp-ar.f')).borderTopColor, getComputedStyle(document.querySelector('.pp-ar.f')).borderTopWidth]);
  console.log('   ', esc.join(' | '));
  conf(esc[0] === 'rgb(43, 110, 72)' && esc[1] === 'rgb(38, 40, 57)' && esc[2] === '1px', 'escuro: coletada em verde mais fechado; falta com linha fina escura');
  await p.click('.pp-ar[data-id="RU16TAI24"]'); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(SHOTS, 'v046-pc-plano-escuro.png') });
  await p.click('[data-act="pp-limpa"]'); await p.evaluate(() => { document.documentElement.setAttribute('data-tema', 'claro'); });

  console.log('— Voltar');
  await p.goBack(); await p.waitForTimeout(400);
  conf(await p.evaluate(() => location.hash === '#/coletas/programacao'), 'voltar do navegador leva de volta para a Programação');
  conf(await p.evaluate(() => { const c = document.querySelector('a.pg-pl[href="#/coletas/plano/r3"]'); return c && c.querySelectorAll('.pg-ar.c').length === 2; }), 'o cartão do plano já mostra as 2 coletadas');
  conf(await p.evaluate(() => { const e = document.querySelector('.pg-ar.f'); return e && getComputedStyle(e).borderTopColor === 'rgb(233, 227, 213)'; }), 'cartões da Programação com as mesmas cores (falta discreta)');

  console.log('— Plano que não existe');
  await p.evaluate(() => { location.hash = '#/coletas/plano/nada'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /Plano não encontrado/.test(document.body.innerText)), 'endereço de plano que não existe: "Plano não encontrado"');

  console.log('— Celular');
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const q = await c2.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(async () => { const C = Data.col.bind(Data), ano = hojeISO().slice(0, 4); for (const n of [14, 15, 16]) await C('sv2_talhoes').set('t' + n, { codigo: 'RU' + n + 'TAI24', hectares: 3, cultura: 'MAMÃO', ativo: true }); await C('sv2_rodizio').set('r3', { nome: 'Solo e raiz', tipo: 'SOLO+RAIZ', freq: 'S', ano: Number(ano), areas: ['RU11TAI24', 'RU12TAI24', 'RU13TAI24', 'RU14TAI24', 'RU15TAI24', 'RU16TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z' }); });
  await q.evaluate(() => { location.hash = '#/coletas/plano/r3'; }); await q.waitForTimeout(500);
  await q.tap('.pp-ar[data-id="RU13TAI24"]'); await q.waitForTimeout(200);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular: nada rola para o lado');
  conf(await q.evaluate(() => { const b = document.querySelector('.pp-bar').getBoundingClientRect(), n = document.querySelector('.cs-bb, .cs-baixo, nav.cs-mb'); const nb = n ? n.getBoundingClientRect().top : innerHeight; return b.bottom <= nb + 1 && b.left >= 0 && b.right <= innerWidth; }), 'celular: a barra fica acima da barra de baixo, dentro da tela');
  await q.screenshot({ path: path.join(SHOTS, 'v046-cel-plano.png') });
  await q.tap('.pp-bar [data-act="pp-lanc"]'); await q.waitForTimeout(400);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth && /Lançar coletadas/.test(document.querySelector('#gv').textContent)), 'celular: Lançar coletadas abre em tela cheia sem rolar de lado');
  await q.screenshot({ path: path.join(SHOTS, 'v046-cel-lancar.png') });

  console.log('— Visitante só vê');
  await p.evaluate(() => csSair()); await p.waitForTimeout(300); await p.fill('#en-login', 'ana.lima'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(() => { location.hash = '#/coletas/plano/r3'; }); await p.waitForTimeout(500);
  conf(await p.evaluate(() => document.querySelectorAll('.pp-ar').length === 6 && !document.querySelector('button.pp-ar') && !document.querySelector('[data-act="pp-prog"]') && !!document.querySelector('[data-act="pp-folha"]')), 'visitante vê as áreas e a folha, sem marcar nem Programar');

  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 2).join(' | ') : ''));
  await b.close();
  console.log('\nt_v046: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
