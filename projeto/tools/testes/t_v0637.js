/* EFCwork · v0.6.37 · aviso de versão nova (janela no meio; "Depois" deixa no pé do menu). Publica de mentira uma versão por cima da outra, com o mesmo cabeçalho do GitHub Pages
   (cache-control: max-age=600), e confere o aviso, o botão Atualizar, o que fica guardado no aparelho e as perguntas antes de recarregar.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0637.js [--hoje <dist da versão anterior>] */
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..', '..');
const HOJE = process.argv.includes('--hoje') ? path.resolve(process.argv[process.argv.indexOf('--hoje') + 1]) : '';
const FONTE = HOJE || path.join(RAIZ, 'dist');
const BASE_V = fs.readFileSync(path.join(FONTE, 'index.html'), 'utf8').match(/const VERSAO = '([0-9.]+)'/)[1];
const prox = n => { const p = BASE_V.split('.').map(Number); p[2] += n; return p.join('.'); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'efc-vn-'));
function faz(v) {
  const d = path.join(TMP, v); fs.cpSync(FONTE, d, { recursive: true });
  for (const f of ['index.html', 'sw.js']) {
    const s = fs.readFileSync(path.join(d, f), 'utf8').split("VERSAO = '" + BASE_V + "'").join("VERSAO = '" + v + "'").split("'efcwork-" + BASE_V + "'").join("'efcwork-" + v + "'");
    fs.writeFileSync(path.join(d, f), s);
  }
  return d;
}
const V = [BASE_V, prox(1), prox(2)], DIR = V.map(faz);
let dir = DIR[0];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => {
  if (q.url === '/efcwork/pasta') { r.writeHead(301, { location: '/efcwork/pasta/' }); return r.end(); }
  if (q.url === '/efcwork/pasta/') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('OUTRA PAGINA'); }
  const u = q.url.split('?')[0], f = path.join(dir, u.slice(9) || 'index.html');
  if (!u.startsWith('/efcwork/') || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
const er = [];
let b, base;
async function instala(w, h) {
  dir = DIR[0];
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 800 }, hasTouch: cel, isMobile: cel }); await ctx.route(/gstatic|fonts\.g/, r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => er.push(String(e)));
  await p.goto(base + '?demo=1'); await esp(700);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(700);
  await p.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; }); await esp(1200);
  await p.reload(); await esp(2500);
  return { ctx, p };
}
const volta = p => p.evaluate(() => { if (S.vn) S.vn.ult = 0; document.dispatchEvent(new Event('visibilitychange')); });
const est = p => p.evaluate(async JAN => {
  const r = await navigator.serviceWorker.getRegistration(), c = {};
  for (const k of await caches.keys()) { const x = await (await caches.open(k)).match('./index.html'); c[k] = x ? ((await x.text()).match(/const VERSAO = '([0-9.]+)'/) || [])[1] : '-'; }
  const vis = s => { const e = document.querySelector(s); if (!e) return false; const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0; };
  return { tela: VERSAO, esperando: !!(r && r.waiting), caches: c, aviso: vis(JAN), avisoTxt: (document.querySelector(JAN) || {}).textContent || '', pe: !!document.querySelector('.vn-pe'), marca: window._marca || 0, pergunta: (document.querySelector('#cf') || {}).textContent || '', hash: location.hash, rol: document.documentElement.scrollWidth > innerWidth, gv: !!document.querySelector('#gv'), cam: (S.camadas || []).map(c => c.nome).join() };
}, JAN);
const JAN = '.vn-jan';
const naJanela = a => '.vn-jan [data-act="' + a + '"]';
(async () => {
  await new Promise(r => srv.listen(0, r)); base = 'http://localhost:' + srv.address().port + '/efcwork/'; b = await chromium.launch();

  console.log('— App aberto, publicam uma versão nova (PC)');
  let { ctx, p } = await instala(1280);
  await p.evaluate(() => { location.hash = '#/coletas'; window._marca = 1; }); await esp(500);
  dir = DIR[1]; await volta(p); await esp(3500);
  let e = await est(p);
  conf(e.aviso && e.avisoTxt.includes('v' + V[1]), 'ao voltar para o app, o aviso aparece com o número da versão (' + (e.avisoTxt || 'nenhum aviso') + ')');
  conf(e.marca === 1 && e.tela === V[0], 'nada recarregou sozinho (continua na v' + e.tela + ')');
  conf(e.caches['efcwork-' + V[1]] === V[1], 'a versão nova guarda a tela NOVA para usar sem internet (' + JSON.stringify(e.caches) + ')');
  if (!HOJE) {
    await p.click(naJanela('vn-atualiza')); await esp(4000); e = await est(p);
    conf(e.tela === V[1] && !e.marca && e.hash === '#/coletas', 'o toque em Atualizar recarrega na versão nova e na mesma tela (v' + e.tela + ' ' + e.hash + ')');
    conf(Object.keys(e.caches).join() === 'efcwork-' + V[1] && !e.esperando && !e.aviso, 'a versão antiga sai do aparelho e o aviso some');

    console.log('— "Depois": fica no pé do menu');
    dir = DIR[2]; await volta(p); await esp(3500);
    await p.click(naJanela('vn-fecha')); await esp(600); e = await est(p);
    conf(!e.aviso && e.pe, '"Depois" fecha a janela e deixa "Atualizar o app" no pé do menu');
    await p.evaluate(() => { location.hash = '#/documentos'; }); await esp(600); await volta(p); await esp(1500); e = await est(p);
    conf(!e.aviso && e.pe, 'trocar de tela e voltar ao app não traz o aviso de novo');
    await p.click('.vn-pe'); await esp(4000); e = await est(p);
    conf(e.tela === V[2] && !e.pe, 'o item do pé do menu atualiza (v' + e.tela + ')');
  }
  await ctx.close();

  if (!HOJE) {
    console.log('— Pergunta antes de recarregar');
    ({ ctx, p } = await instala(1280)); dir = DIR[1]; await volta(p); await esp(3500);
    await p.evaluate(() => { window._marca = 1; location.hash = '#/adm/perfil'; }); await esp(600);
    const campo = await p.evaluate(() => { const i = Array.from(document.querySelectorAll('.cs-ct input')).find(x => ['text', 'email', ''].includes(x.getAttribute('type') || '')); if (!i) return false; i.value = (i.value || '') + ' x'; return true; });
    await p.click(naJanela('vn-atualiza')); await esp(800); e = await est(p);
    conf(campo && /Atualizar agora\?/.test(e.pergunta) && /preenchido/.test(e.pergunta), 'com um campo digitado e não gravado, pergunta antes');
    await p.click('[data-act="cf-nao"]'); await esp(600); e = await est(p);
    conf(!e.pergunta && e.marca === 1 && !e.aviso && e.pe, '"Depois" na pergunta não recarrega e o aviso passa para o pé do menu');
    await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(600);
    await p.evaluate(() => { S.fm = { k: 'teste', sujo: true }; vnAtualizar(); }); await esp(300);
    conf(/preenchido/.test((await est(p)).pergunta), 'com um formulário preenchido, pergunta antes');
    await p.click('[data-act="cf-nao"]'); await p.evaluate(() => { S.fm = null; }); await esp(300);
    await p.evaluate(() => { jnAbrir('docs', '', true); }); await esp(900); await p.evaluate(() => { jnIr('efcwork'); }); await esp(900);
    await p.click('.vn-pe'); await esp(800); e = await est(p);
    conf(/aba aberta/.test(e.pergunta) && /Vértice/.test(e.pergunta), 'com o Vértice aberto numa aba, pergunta antes (' + e.pergunta.slice(0, 110) + ')');
    await p.click('[data-act="cf-sim"]'); await esp(4000); e = await est(p);
    conf(e.tela === V[1] && !e.marca, 'confirmando, atualiza');
    await p.evaluate(() => { window._marca = 1; });
    dir = DIR[2]; await volta(p); await esp(3500);
    await p.evaluate(() => { jnAbrir('docs', '', true); }); await esp(900);
    const some = !(await est(p)).aviso;
    conf(some, 'com o Vértice na frente, o aviso não aparece por cima dele');
    await ctx.close();

    console.log('— Outras situações');
    ({ ctx, p } = await instala(1280));
    dir = DIR[1]; await p.reload(); await esp(5000); e = await est(p);
    conf(e.tela === V[1] && !e.aviso && !e.pe && !e.esperando, 'quem recarregou e já está na versão nova não vê aviso, e o sw novo assume calado (v' + e.tela + ', esperando ' + e.esperando + ')');
    await ctx.close();
    ({ ctx, p } = await instala(1280));
    await p.evaluate(() => { window._marca = 1; }); dir = DIR[1];
    await p.evaluate(() => dispatchEvent(new Event('online'))); await esp(3500); e = await est(p);
    conf(e.aviso, 'quando a internet volta, o app procura de novo');
    const p2 = await ctx.newPage(); p2.on('pageerror', x => er.push(String(x)));
    dir = DIR[0]; /* a segunda aba abre o que está guardado/publicado antes do toque */
    dir = DIR[1]; await p2.goto(base + '?demo=1'); await esp(2500);
    await p.evaluate(() => { vnAtualizar(); }); await esp(4000);
    const e1 = await est(p), e2 = await est(p2);
    conf(e1.tela === V[1] && e2.tela === V[1] && !e2.aviso, 'duas abas: a que tocou recarrega; a outra, já nova, fica sem aviso (' + e1.tela + ' / ' + e2.tela + ')');
    await ctx.close();
    ({ ctx, p } = await instala(1280));
    const q = await ctx.newPage(); q.on('pageerror', x => er.push(String(x))); await q.goto(base + '?demo=1'); await esp(2000); await q.evaluate(() => { window._marca = 1; });
    dir = DIR[1]; await volta(p); await esp(3500); await p.evaluate(() => { vnAtualizar(); }); await esp(4000);
    const q1 = await est(q);
    conf(q1.marca === 1 && q1.tela === V[0] && q1.aviso, 'duas abas antigas: a outra não recarrega sozinha e passa a mostrar o aviso (marca ' + q1.marca + ', v' + q1.tela + ')');
    await ctx.close();

    console.log('— Achados do revisor');
    ({ ctx, p } = await instala(1280));
    const risco = fn => p.evaluate(fn);
    let r1 = await risco(() => { S._anVolta = { sujo: true }; S.fm = { k: 'anAc', sujo: false, volta: anVoltaCancela }; const r = vnRisco(); S.fm = null; S._anVolta = null; return r; });
    conf(/preenchido/.test(r1), 'análise escrita e não salva, com a ficha da ação por cima: pergunta');
    r1 = await risco(() => { S._anVolta = { sujo: true }; S.fm = null; const r = vnRisco(); S._anVolta = null; return r; });
    conf(!r1, 'análise já fechada não faz perguntar (' + r1 + ')');
    r1 = await risco(() => { S.fm = { k: 'ktPap', sujo: true, kRem: 'a|Lab Teste', sel: {} }; const bt = document.createElement('button'); bt.setAttribute('data-act', 'kt-end-aqui'); document.body.appendChild(bt); bt.click(); bt.remove(); return { k: S.fm.k, sujo: S.fm.sujo, r: vnRisco() }; });
    conf(r1.k === 'ktEnd' && /preenchido/.test(r1.r), 'papéis do envio mexidos, com o endereço por cima: pergunta (' + r1.k + ')');
    await p.reload(); await esp(2500);
    await p.evaluate(async () => { await Data.col('sv2_rodizio').set('r1', { nome: 'Plano teste', tipo: 'Foliar', freq: 'mensal', ano: new Date().getFullYear(), analiseIds: [], areas: ['T1', 'T2'] }); }); await esp(800);
    await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await esp(900);
    await p.evaluate(() => { const l = document.querySelectorAll('[data-act="pp-aba"]'); (document.querySelector('[data-act="pp-aba"][data-v="ajustes"]') || l[l.length - 1]).click(); }); await esp(700);
    await p.fill('[data-pp-busca]', 'T');
    r1 = await risco(() => vnRisco());
    conf(!r1, 'só procurar uma área não faz perguntar (' + r1 + ')');
    await p.fill('[data-pp-busca]', ''); await p.click('[data-pp-ar]:not([disabled])');
    r1 = await risco(() => vnRisco());
    conf(/preenchido/.test(r1), 'áreas do plano marcadas e não salvas: pergunta');
    await p.click('[data-pp-ar]:not([disabled])');
    r1 = await risco(() => vnRisco());
    conf(!r1, 'desfeita a marcação, não pergunta (' + r1 + ')');
    r1 = await risco(() => { S.auAp = { ed: { v: {} } }; const a = vnRisco(); S.auAp = null; S.fed = { l: [1], l0: '[]' }; const b = vnRisco(); S.fed = null; S.cgRasc = { x: { l1: '' } }; const c = vnRisco(); S.cgRasc = { x: { l1: '3' } }; const d = vnRisco(); S.cgRasc = {}; return { a: a, b: b, c: c, d: d }; });
    conf(/preenchido/.test(r1.a) && /preenchido/.test(r1.b), 'correção na apresentação da auditoria e marcas na foto: pergunta');
    conf(!r1.c && /preenchido/.test(r1.d), 'contagem digitada e apagada não pergunta; com número, pergunta');
    await p.evaluate(() => { window._marca = 1; window._sp = Data.semPendentes; Data.semPendentes = async () => false; S.vn.nova = '9.9.9'; vnDesenha(); });
    await p.evaluate(() => { vnAtualizar(); }); await esp(900); let e9 = await est(p);
    conf(e9.marca === 1 && /nuvem/.test(e9.pergunta), 'com gravação que ainda não chegou à nuvem, pergunta antes (' + e9.pergunta.slice(0, 120) + ')');
    await p.click('[data-act="cf-nao"]').catch(() => {}); await esp(500);
    await p.reload(); await esp(2500);
    r1 = await p.evaluate(async () => { S.vn.nova = ''; await vnExamina({ state: 'redundant', postMessage() {} }, true); return S.vn.nova; });
    conf(!r1, 'um sw antigo já descartado não liga aviso falso (' + r1 + ')');
    const tela = () => p.evaluate(async () => { const k = (await caches.keys())[0], x = await (await caches.open(k)).match('./index.html'); return x ? (await x.text()).slice(0, 15) : '-'; });
    const q9 = await ctx.newPage(); await q9.goto(base + 'manifest.webmanifest'); await esp(1500); await q9.goto(base + 'pasta').catch(() => {}); await esp(1500);
    const url9 = q9.url(), t9 = await tela();
    conf(/<!doctype html>/i.test(t9), 'abrir outro arquivo ou pasta pelo endereço não troca a tela guardada (' + t9.replace(/\n/g, ' ') + ')');
    conf(url9.endsWith('/pasta/'), 'endereço sem a barra final é redirecionado normalmente (' + url9.slice(-20) + ')');
    await ctx.close();

    console.log('— Janela no meio: Esc, voltar, toque fora (ITEM 226)');
    const comAviso = async (w, h) => { const x = await instala(w, h); await x.p.evaluate(() => { location.hash = '#/inicio'; }); await esp(500); await x.p.evaluate(() => { location.hash = '#/coletas'; window._marca = 1; }); await esp(600); dir = DIR[1]; await volta(x.p); await esp(3500); return x; };
    for (const [nome, fecha] of [['Esc', q => q.keyboard.press('Escape')], ['o voltar do celular/navegador', q => q.evaluate(() => history.back())], ['o toque fora da janela', q => q.mouse.click(8, 8)]]) {
      ({ ctx, p } = await comAviso(1280));
      await fecha(p); await esp(800); e = await est(p);
      conf(!e.aviso && e.pe && e.marca === 1 && e.hash === '#/coletas' && !e.cam, nome + ' vale como "Depois": fecha só a janela e fica no pé do menu (' + e.hash + ' ' + e.cam + ')');
      await p.evaluate(() => history.back()); await esp(900); e = await est(p);
      conf(e.hash === '#/inicio' && e.marca === 1, 'e o voltar seguinte já volta de tela, sem passo sobrando (' + e.hash + ')');
      await ctx.close();
    }
    ({ ctx, p } = await instala(1280));
    await p.evaluate(() => { window._marca = 1; lcAbrir({ k: 'ktEnd', lab: 'Lab', nome: '', end: '', bairro: '', cidade: '', uf: '', cep: '', contato: '', conteudo: '' }); }); await esp(900);
    await p.focus('#gv [data-fm="nome"]'); dir = DIR[1]; await volta(p); await esp(3500);
    const foco = await p.evaluate(() => !!(document.activeElement && document.activeElement.closest(".vn-jan")));
    await p.keyboard.press('Enter'); await esp(2500); e = await est(p);
    conf(foco && e.marca === 1 && e.aviso && e.gv, 'a janela pega o foco, e um Enter de quem estava digitando não atualiza');
    await p.keyboard.press('Escape'); await esp(900); e = await est(p);
    const voltouFoco = await p.evaluate(() => !!(document.activeElement && document.activeElement.getAttribute('data-fm') === 'nome'));
    conf(!e.aviso && e.gv && e.pe && voltouFoco, 'com uma ficha aberta, o 1º Esc fecha só o aviso e o cursor volta para o campo');
    await p.keyboard.press('Escape'); await esp(900); e = await est(p);
    conf(!e.gv, 'o 2º Esc fecha a ficha');
    await ctx.close();
    ({ ctx, p } = await comAviso(1280));
    await p.evaluate(() => { S.fm = { k: 'teste', sujo: true }; }); await p.click(naJanela('vn-atualiza')); await esp(800);
    await p.keyboard.press('Escape'); await esp(600); e = await est(p);
    conf(!e.pergunta && !e.aviso && e.pe && e.marca === 1, 'Esc na pergunta também deixa no pé do menu, sem recarregar');
    await p.evaluate(() => { S.fm = null; }); await ctx.close();
    ({ ctx, p } = await comAviso(1280));
    await p.evaluate(() => { Data.semPendentes = () => new Promise(r => setTimeout(() => r(true), 1500)); });
    await p.click(naJanela('vn-atualiza')); await esp(500);
    await p.click(naJanela('vn-fecha'), { timeout: 3000 }); await esp(3500); e = await est(p);
    conf(e.marca === 1 && e.tela === V[0] && e.pe, '"Depois" enquanto ainda está conferindo cancela a atualização');
    await p.evaluate(() => { location.hash = '#/documentos'; }); await esp(500); await p.reload(); await esp(5000); e = await est(p);
    conf(e.tela === V[1], 'quem fecha e reabre já abre na versão nova (v' + e.tela + ')');
    await ctx.close();
    ({ ctx, p } = await comAviso(1280));
    await p.evaluate(() => { location.hash = '#/documentos'; }); await esp(800); await p.evaluate(() => history.back()); await esp(900); e = await est(p);
    conf(e.hash === '#/documentos' && !e.aviso && e.pe, 'se a tela mudar por baixo, o voltar continua fechando primeiro o aviso (' + e.hash + ')');
    await ctx.close();
    ({ ctx, p } = await instala(1280));
    await p.evaluate(() => { window._marca = 1; jnAbrir('docs', '', true); }); await esp(900); dir = DIR[1]; await volta(p); await esp(3500); e = await est(p);
    conf(!e.aviso && e.cam === 'janela', 'com o Vértice na frente quando a versão chega, o aviso não entra na fila do voltar (' + e.cam + ')');
    await p.evaluate(() => { jnIr('efcwork'); }); await esp(1500); e = await est(p);
    conf(e.aviso && e.cam === 'vn', 'ao voltar para o Cwork, a janela aparece (' + e.cam + ')');
    await p.evaluate(() => history.back()); await esp(900); e = await est(p);
    conf(!e.aviso && e.pe && e.marca === 1, 'e o voltar fecha a janela');
    await ctx.close();

    console.log('— Tamanhos (PC e celular)');
    for (const w of [1280, 390]) {
      ({ ctx, p } = await comAviso(w, w < 600 ? 780 : 800));
      const med = () => p.evaluate(sel => Array.from(document.querySelectorAll(sel)).map(y => Math.round(y.getBoundingClientRect().height)), '.vn-jan button, .vn-pe');
      const bts = await med(), min = w < 600 ? 44 : 32; e = await est(p);
      conf(e.aviso && !e.rol && bts.length === 2 && bts[0] === bts[1] && bts[0] >= min, w + ' px: janela sem rolar para o lado, dois botões de mesma altura (' + bts + ')');
      await p.click(naJanela('vn-fecha')); await esp(700);
      if (w < 600) { const ponto = await p.evaluate(() => !!document.querySelector('.cs-so-cel.vn-ponto')); await p.click('.cs-so-cel'); await esp(700); const h = await med(); conf(ponto && h[0] >= 44, 'celular: bolinha no botão do menu e item de 44 px ou mais no pé (' + h + ')'); }
      else { const h = await med(); conf(h.length === 1 && h[0] >= 32, 'PC: item no pé do menu (' + h + ')'); }
      await ctx.close();
    }
  }
  conf(!er.length, 'sem erro de JavaScript' + (er.length ? ': ' + er[0] : ''));
  await b.close(); srv.close(); fs.rmSync(TMP, { recursive: true, force: true });
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(x => { console.error(x); process.exit(1); });
