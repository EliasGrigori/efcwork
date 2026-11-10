/* EFCwork · suíte da v0.5.1 — retorno do Grok v0.4.11:
   A2 celular: com o menu da coluna aberto (folha de baixo), 1 toque num botão da página fecha o menu e já faz a ação;
   toque numa linha só fecha (como no PC); B1: se a leitura do "setup" falhar (App Check/permissão), aparece o Entrar,
   nunca o "Primeiro acesso". Dados fictícios. Uso: node tools/testes/t_v051.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), BASE = 'file://' + path.join(RAIZ, 'dist', 'index.html'), URL = BASE + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
/* Firebase simulado: o documento sv2_meta/setup responde com erro (como o App Check 403 do Grok) ou "não existe" */
const mock = modo => `window.firebase=(function(){const log=window.__fb=[];
function mkApp(c,n){const a={name:n,appCheck(){return {activate(){}}},firestore(){return {enablePersistence:async()=>{},collection(){return {doc(){return {get:async(o)=>{if(o&&o.source==='cache')throw new Error('cache vazio');${modo === 'erro' ? "const e=new Error('Missing or insufficient permissions.');e.code='permission-denied';throw e" : 'return {exists:false}'}},onSnapshot(){return ()=>{}}}},onSnapshot(){return ()=>{}},where(){return this}}},terminate:async()=>{},clearPersistence:async()=>{}}},auth(){return {setPersistence:async()=>{},onAuthStateChanged(cb){setTimeout(()=>cb(null),10);return ()=>{}},currentUser:null}}};return a}
const f={apps:[],initializeApp(c,n){return mkApp(c,n)}};f.auth={Auth:{Persistence:{LOCAL:'l',SESSION:'s'}}};f.firestore={FieldValue:{serverTimestamp(){return 0}}};f.appCheck=function(){return {activate(){}}};f.appCheck.ReCaptchaEnterpriseProvider=function(){};return f})();`;

async function abreCel(b) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true })).newPage(); const er = []; p._er = er;
  p.on('pageerror', e => er.push(String(e)));
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.tap('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => { const C = Data.col.bind(Data); for (const [id, n, l] of [['u1', 'Luva M', 'Porta 12'], ['u2', 'Fita dupla', 'Porta 11'], ['u3', 'Gelo gel', 'Geladeira'], ['u4', 'Água 1 L', 'Porta 02']]) await C('sv2_alm_itens').set(id, { nome: n, codigo: id, un: 'Un', min: 1, local: l, ativo: true }); });
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(600);
  return p;
}
const abreMenu = async p => { await p.tap('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="nome"] .tb-hm'); await p.waitForTimeout(350); };
const centro = async (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);

(async () => {
  const b = await chromium.launch();
  console.log('Celular — menu da coluna aberto e 1 toque na página (Grok v0.4.11 A2):');
  const p = await abreCel(b);
  for (const [sel, nome, prova] of [['[data-act="lc-sai"]', 'Saída', () => !!document.querySelector('#gv [data-act="gv-fecha"]') && /Saída/.test(document.querySelector('#gv').textContent)],
                                     ['[data-act="lc-ent"]', 'Entrada', () => !!document.querySelector('#gv [data-act="gv-fecha"]')]]) {
    await abreMenu(p);
    conf(!!(await p.$('.tb-mn.tb-mn-folha')) && !!(await p.$('.tb-mn-fundo')), nome + ': menu aberto como folha de baixo, com o fundo escuro');
    const c = await centro(p, sel);
    const coberto = await p.evaluate(({ x, y }) => document.elementFromPoint(x, y).classList.contains('tb-mn-fundo'), c);
    conf(coberto, nome + ': o botão está embaixo do fundo escuro (o toque cai no fundo)');
    await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(700);
    conf(!(await p.$('.tb-mn')), nome + ': o menu fechou');
    conf(await p.evaluate(prova), nome + ': o mesmo toque já abriu a ação (sem precisar de 2º toque)');
    await p.evaluate(() => history.back()); await p.waitForTimeout(500);
    if (await p.$('#cf [data-act="cf-sim"]')) { await p.tap('#cf [data-act="cf-sim"]'); await p.waitForTimeout(400); }
    conf(!(await p.$('#gv [data-act="gv-fecha"]')) && /#\/almox\/materiais/.test(await p.evaluate(() => location.hash)), nome + ': voltar fecha só a gaveta e fica em Materiais');
  }
  console.log('Celular — toque numa linha com o menu aberto só fecha:');
  await p.evaluate(async () => { for (let n = 5; n <= 18; n++) await Data.col('sv2_alm_itens').set('u' + n, { nome: 'Material ' + n, codigo: 'u' + n, un: 'Un', min: 1, local: 'Porta ' + n, ativo: true }); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const th = document.querySelector('.tb[data-tb="al-mat"] .tb-cab'); scrollBy(0, th.getBoundingClientRect().top - 70); }); await p.waitForTimeout(300);
  await abreMenu(p);
  const lin = await p.evaluate(() => { for (const t of document.querySelectorAll('.tb[data-tb="al-mat"] tbody tr[data-id]')) { const r = t.getBoundingClientRect(), x = r.left + 20, y = r.top + r.height / 2; const el = document.elementFromPoint(x, y); if (el && el.classList.contains('tb-mn-fundo')) { el.style.pointerEvents = 'none'; const em = document.elementFromPoint(x, y); el.style.pointerEvents = ''; if (em && em.closest('tr') === t) return { x, y }; } } return null; });
  if (lin) {
    await p.touchscreen.tap(lin.x, lin.y); await p.waitForTimeout(700);
    conf(!(await p.$('.tb-mn')) && !(await p.$('#gv [data-act="gv-fecha"]')), 'toque numa linha: fecha o menu e a gaveta da linha não abre');
    await p.touchscreen.tap(lin.x, lin.y); await p.waitForTimeout(600);
    conf(!!(await p.$('#gv [data-act="gv-fecha"]')), 'toque de novo na linha: abre a gaveta');
    await p.evaluate(() => history.back()); await p.waitForTimeout(500);
  } else conf(false, 'linha visível acima da folha do menu');
  console.log('Celular — toque no fundo sobre a barra de cima só fecha (não abre a busca):');
  await abreMenu(p); await p.touchscreen.tap(195, 40); await p.waitForTimeout(600);
  conf(!(await p.$('.tb-mn')) && !(await p.$('#bg')), 'toque no fundo em cima da busca: fecha o menu e a busca não abre');
  console.log('Celular — X do menu e voltar continuam fechando uma camada só:');
  await abreMenu(p); await p.evaluate(() => history.back()); await p.waitForTimeout(500);
  conf(!(await p.$('.tb-mn')) && /#\/almox\/materiais/.test(await p.evaluate(() => location.hash)), 'voltar fecha só o menu');
  conf(p._er.length === 0, 'sem erros no console (celular)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await p.screenshot({ path: path.join(RAIZ, 'tools', 'testes', 'telas', 'v051-cel-materiais.png') });

  console.log('PC — clicar fora do menu continua igual (v0.4.11):');
  { const q = await (await b.newContext({ viewport: { width: 1366, height: 860 } })).newPage(); await q.route(/gstatic|fonts\.g/, r => r.abort());
    await q.goto(URL); await q.waitForTimeout(400);
    await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
    await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(700);
    await q.evaluate(async () => { await Data.col('sv2_alm_itens').set('u1', { nome: 'Luva M', codigo: 'u1', un: 'Un', min: 1, local: 'Porta 12', ativo: true }); });
    await q.evaluate(() => { location.hash = '#/almox/materiais'; }); await q.waitForTimeout(500);
    await q.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="nome"] .tb-hm'); await q.waitForTimeout(200);
    conf(!(await q.$('.tb-mn-fundo')), 'no PC não há fundo escuro');
    await q.click('[data-act="lc-sai"]'); await q.waitForTimeout(500);
    conf(!(await q.$('.tb-mn')) && !!(await q.$('#gv [data-act="gv-fecha"]')), 'no PC 1 clique em Saída fecha o menu e abre a Saída');
    await q.close(); }

  console.log('Tela de entrar quando a nuvem não responde (Grok v0.4.11 B1):');
  for (const [modo, espera, txt] of [['erro', 'entrar', 'leitura recusada (App Check/permissão) → mostra o Entrar, não o Primeiro acesso'],
                                     ['vazio', 'primeiro', 'nuvem respondeu que não há Administrador → Primeiro acesso (projeto novo)']]) {
    for (const w of [1366, 390]) {
      const q = await (await b.newContext({ viewport: { width: w, height: 820 }, hasTouch: w < 600, isMobile: w < 600 })).newPage(); const er = [];
      q.on('pageerror', e => er.push(String(e)));
      await q.route(/gstatic\.com/, r => r.fulfill({ contentType: 'text/javascript', body: mock(modo) })); await q.route(/fonts\.g/, r => r.abort());
      await q.goto(BASE); await q.waitForTimeout(1600);
      const st = await q.evaluate(() => ({ prim: !!document.querySelector('[data-form="en-primeiro"]'), entrar: !!document.querySelector('.en-form:not([data-form="en-primeiro"])') && !!document.querySelector('input[type=password]'), h: (document.querySelector('.en-form') ? document.querySelector('.en-form').closest('section').querySelector('h2') || {} : {}).textContent || '' }));
      conf(espera === 'entrar' ? (!st.prim && st.entrar) : st.prim, (w < 600 ? 'celular' : 'PC') + ': ' + txt);
      conf(er.length === 0, (w < 600 ? 'celular' : 'PC') + ': sem erros (' + modo + ')' + (er.length ? ': ' + er[0] : ''));
      if (modo === 'erro') await q.screenshot({ path: path.join(RAIZ, 'tools', 'testes', 'telas', 'v051-' + (w < 600 ? 'cel' : 'pc') + '-entrar-sem-nuvem.png') });
      await q.close();
    }
  }
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
