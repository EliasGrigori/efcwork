/* EFCwork · suíte da v0.4.10 — ajustes da auditoria visual aprovados em 09/11 (item 10 da v0.4.9):
   campos das gavetas com 44 px no celular e títulos Faltam/Coletadas sem maiúsculas espaçadas.
   Uso: node tools/testes/t_v0410.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + (process.env.APP || path.join(RAIZ, 'dist', 'index.html')) + '?demo=1', PRE = process.env.PRE || 'v0410';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(150); };
const gmsg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const audit = (p, acao) => p.evaluate(async a => (await Data.col('sv2_audit').all()).filter(x => x.acao === a).map(x => x.resumo), acao);
const rz = (p, id) => p.evaluate(i => JSON.parse(JSON.stringify(S.rodizios.find(x => x.id === i) || null)), id);
async function entra(p, login) { await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300); await p.fill('#en-login', login); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(800); }
async function primeiro(p) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => {
    const h = hojeISO(), d = n => addDias(h, n), C = Data.col.bind(Data), me = S.user, ano = h.slice(0, 4), sem = h.slice(5, 7) <= '06' ? 'S1' : 'S2';
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], fazendas: [{ prefixo: 'RU', numero: '18', nome: 'Fazenda Teste' }],
      tipos: [{ nome: 'SOLO+RAIZ', gera: ['SOLO', 'NEMATOIDE'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FOLHA', gera: ['FOLHA'], pontosPorHa: 5 }] });
    for (let n = 11; n <= 18; n++) await C('sv2_talhoes').set('t' + n, { codigo: 'RU' + n + 'TAI24', pivo: 'Pivô ' + (n % 3 + 1), hectares: 4, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    const A = (id, o) => C('sv2_analises').set(id, Object.assign({ ativo: true, criadoEm: '2026-01-0' + id.slice(1) + 'T10:00:00.000Z' }, o));
    await A('a1', { nome: 'Solo completo', tipo: 'SOLO', lab: 'IBRA', sigla: 'SC', valor: 120 });
    await A('a2', { nome: 'Nematoide', tipo: 'NEMATOIDE', lab: 'BIOAGRI', sigla: 'NEM', valor: 80 });
    await A('a6', { nome: 'Micronutrientes', tipo: 'SOLO', lab: 'IBRA', sigla: 'MIC', valor: 60 });
    await A('a3', { nome: 'Foliar', tipo: 'FOLHA', lab: 'IBRA', sigla: 'FOL', valor: 90 });
    /* plano no formato do EFClaudian: programações DENTRO do plano (progs), sv2_prog vazio */
    const pk = ano + '-' + sem;
    await C('sv2_rodizio').set('r1', { nome: 'SOLO+RAIZ · semestral · ' + ano, tipo: 'SOLO+RAIZ', freq: 'S', ano: ano, ativo: true, inicio: '', prazo: '', criadoEm: ano + '-01-01T10:00:00.000Z', criadoPor: me.id, criadoPorNome: 'Joana Silva',
      areas: ['RU11TAI24', 'RU12TAI24', 'RU13TAI24', 'RU14TAI24', 'RU15TAI24', 'RU16TAI24'], analiseIds: ['a1', 'a2'], fechados: {}, liberadas: {},
      progs: { [pk]: { RU11TAI24: { data: d(-3), coletor: 'Juraci', pontos: '16', prof: '00-30', estadio: 'VEGETATIVO', por: 'Joana Silva', em: nowISO() },
        RU12TAI24: { data: d(4), coletor: 'Juraci', pontos: '16', prof: '00-30', estadio: 'VEGETATIVO', por: 'Joana Silva', em: nowISO() },
        RU16TAI24: { data: '', coletor: '', pontos: '16', prof: '', estadio: '', por: 'Joana Silva', em: nowISO() } } } });
    /* RU13 já coletada (Solo + Nematoide) dentro do período */
    for (const [id, t, an] of [['c1', 'SOLO', 'a1'], ['c2', 'NEMATOIDE', 'a2']]) await C('sv2_coletas').set(id, { tipo: t, data: d(-1), talhao: 'RU13TAI24', analiseId: an, analiseNome: t, lab: 'IBRA', situacao: 'ativa', coletor: 'Juraci', progId: '', loteId: 'L1', criadoEm: new Date(Date.now() - 86400000).toISOString() });
    /* plano do ano passado: o sino sugere renovar */
    await C('sv2_rodizio').set('r9', { nome: 'FOLHA · trimestral · ' + (Number(ano) - 1), tipo: 'FOLHA', freq: 'T', ano: String(Number(ano) - 1), ativo: true, areas: ['RU17TAI24', 'RU18TAI24'], analiseIds: ['a3'], criadoEm: (Number(ano) - 1) + '-01-01T10:00:00.000Z' });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [me.id], atrib: { coletas: true } });
  });
  await p.waitForTimeout(400);
}

const mock = `window.firebase=window.firebase||(function(){const apps=[];const log=window.__fb=[];
function mkApp(c,n){const a={name:n||'[DEFAULT]',appCheck(){log.push('appcheck:'+a.name);return {activate(p,t){log.push('activate:'+a.name)}}},firestore(){log.push('firestore:'+a.name);return {enablePersistence:async()=>{log.push('persist:'+a.name)},collection(){return {doc(){return {get:async()=>({exists:false}),onSnapshot(){return ()=>{}}}},onSnapshot(){return ()=>{}},where(){return this}}},terminate:async()=>{},clearPersistence:async()=>{}}},auth(){log.push('auth:'+a.name);return {setPersistence:async()=>{},onAuthStateChanged(cb){setTimeout(()=>cb(null),10);return ()=>{}},currentUser:null}}};apps.push(a);return a}
const f={apps,initializeApp(c,n){log.push('init:'+(n||'[DEFAULT]'));return mkApp(c,n)},firestore(){log.push('firestore:DEFAULT!');return mkApp().firestore()},auth(){log.push('auth:DEFAULT!');return mkApp().auth()}};
f.auth.Auth={Persistence:{LOCAL:'l',SESSION:'s'}};f.firestore.FieldValue={serverTimestamp(){return 0}};f.appCheck=function(){return {activate(){}}};f.appCheck.ReCaptchaEnterpriseProvider=function(k){log.push('appcheck-key:'+k)};return f})();`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  await primeiro(p);
  console.log('— Títulos do plano');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(500);
  const gh = await p.evaluate(() => Array.from(document.querySelectorAll('.pp-gh')).map(e => { const c = getComputedStyle(e); return c.textTransform + '|' + c.letterSpacing; }));
  conf(gh.length && gh.every(x => /^none\|(normal|0px)$/.test(x)), 'Faltam / Coletadas sem maiúsculas e sem espaçamento: ' + gh.join(', '));
  await p.screenshot({ path: path.join(SHOTS, PRE + '-pc-plano.png') });
  console.log('— Celular: campos das gavetas');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  await p.click('[data-act="pp-novo"]'); await p.waitForTimeout(500);
  const h1 = await p.evaluate(() => Array.from(document.querySelectorAll('#gv .fm-c .dd-b')).map(e => e.offsetHeight));
  conf(h1.length >= 4 && h1.every(x => x >= 44), 'Novo plano: listas com 44 px (' + h1.join(', ') + ')');
  await p.screenshot({ path: path.join(SHOTS, PRE + '-cel-novo-plano.png') });
  await p.click('#gv [data-dd="lc:ppnvfreq"] .dd-b'); await p.waitForTimeout(250);
  const li = await p.evaluate(() => Array.from(document.querySelectorAll('#gv [data-dd="lc:ppnvfreq"] .dd-l li:not(.dd-dica)')).map(e => e.offsetHeight));
  conf(li.length && li.every(x => x >= 44), 'itens da lista aberta com 44 px (' + li.slice(0, 3).join(', ') + '…)');
  await p.screenshot({ path: path.join(SHOTS, PRE + '-cel-lista-aberta.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  if (await p.$('#cf [data-act="cf-sim"]')) { await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(300); }
  await p.click('[data-act="pg-cd"]'); await p.waitForTimeout(500);
  const h2 = await p.evaluate(() => Array.from(document.querySelectorAll('#gv .fm-c .dd-b, #gv .fm-c input[type=date], #gv .fm-c input[type=text], #gv .fm-c input:not([type])')).filter(e => e.offsetWidth).map(e => e.offsetHeight));
  conf(h2.length >= 2 && h2.every(x => x >= 44), 'Coletado: data, coletores e campos com 44 px (' + h2.join(', ') + ')');
  conf(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'nada rola para o lado');
  await p.screenshot({ path: path.join(SHOTS, PRE + '-cel-coletado.png') });
  await p.setViewportSize({ width: 1366, height: 860 }); await p.waitForTimeout(300);
  const h3 = await p.evaluate(() => Array.from(document.querySelectorAll('#gv .fm-c .dd-b')).map(e => e.offsetHeight));
  conf(h3.every(x => x === 34), 'no PC os campos continuam com 34 px');
  console.log('— Menu da coluna: clicar fora numa linha só fecha o menu (retorno do Grok B7)');
  await p.evaluate(async () => { const C = Data.col.bind(Data); for (const [id, n, l] of [['u1', 'Luva M', 'Porta 12'], ['u2', 'Fita dupla', 'Porta 11'], ['u3', 'Gelo gel', 'Geladeira'], ['u4', 'Água 1 L', 'Porta 02']]) await C('sv2_alm_itens').set(id, { nome: n, codigo: id, un: 'Un', min: 1, local: l, ativo: true }); });
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(500);
  await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-hm'); await p.waitForTimeout(200);
  await p.click('.tb[data-tb="al-mat"] tbody tr[data-id] >> nth=2', { position: { x: 5, y: 10 } }); await p.waitForTimeout(400);
  conf(!(await p.$('.tb-mn')) && !(await p.$('#gv .gv-c, #gv [data-act="gv-fecha"]')), 'clicar numa linha com o menu aberto fecha o menu e não abre a gaveta da linha');
  await p.click('.tb[data-tb="al-mat"] tbody tr[data-id] >> nth=2', { position: { x: 5, y: 10 } }); await p.waitForTimeout(400);
  conf(!!(await p.$('#gv [data-act="gv-fecha"]')), 'sem menu aberto, a linha abre a gaveta normalmente');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log('— v0.4.12: cantos do menu iguais e mensagem de leitura');
  await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-hm'); await p.waitForTimeout(250);
  const rd = await p.evaluate(() => ['.tb-mn-tr', '.tb-mn-o', '.tb-mn-li:not(.tb-mn-all)'].map(q => getComputedStyle(document.querySelector(q)).borderTopLeftRadius));
  conf(rd.every(x => x === '8px'), 'Travar, ordenar e itens do menu com o mesmo canto de 8 px (' + rd.join(', ') + ')');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log('— Login e cache separados do EFClaudian (Firebase simulado)');
  { const q = await b.newPage(); const er2 = [];
    q.on('pageerror', e => er2.push(String(e)));
    await q.route(/gstatic\.com/, r => r.fulfill({ contentType: 'text/javascript', body: mock })); await q.route(/fonts\.g/, r => r.abort());
    await q.goto(URL.replace('?demo=1', '')); await q.waitForTimeout(1500);
    const lg = await q.evaluate(() => window.__fb || []);
    console.log('   ', lg.join(' '));
    conf(lg.indexOf('init:efcwork') >= 0 && lg.indexOf('init:[DEFAULT]') < 0 && !lg.some(x => /DEFAULT!/.test(x)) && lg.indexOf('persist:efcwork') >= 0, 'o EFCwork usa um app do Firebase só dele (login e cache não se misturam com o EFClaudian)');
    conf(lg.indexOf('activate:efcwork') >= 0 && lg.indexOf('activate:efcwork') < lg.indexOf('firestore:efcwork') && lg.some(x => /^appcheck-key:6Ld/.test(x)), 'App Check ligado no app do EFCwork antes do Firestore (o Firebase exige)');
    conf(er2.length === 0, 'sem erros com o Firebase simulado'); await q.close(); }
  conf(erros.length === 0, 'sem erros no console' + (erros.length ? ': ' + erros.slice(0, 2).join(' | ') : ''));
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
