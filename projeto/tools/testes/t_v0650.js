/* EFCwork · v0.6.50 · Só ver por área (Administração › Pessoas: Não vê · Só ver · Ver e alterar; o que altera some; [R8] nas regras).
   Modo demonstração, dados fictícios. Uso: python3 tools/montar.py && NODE_PATH=$(npm root -g) node tools/testes/t_v0650.js
   EFC_DIST=<pasta> testa outro app (ex.: o publicado, para provar o antes). TELAS=<pasta> tira as fotos. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), DIST = path.resolve(process.env.EFC_DIST || path.join(RAIZ, 'dist'));
const URL = 'file://' + path.join(DIST, 'index.html') + '?demo=1', TELAS = process.env.TELAS || '';
if (TELAS) fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
const foto = async (p, n) => { if (!TELAS) return; await esp(250); await p.screenshot({ path: path.join(TELAS, n + '.png') }); };
const vai = async (p, h, ms) => { await p.evaluate(x => { location.hash = x; }, h); await esp(ms || 700); };
const tem = (p, sel) => p.evaluate(s => !!document.querySelector(s), sel);
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel }); await ctx.route(/^https:/, r => r.abort());
  const p = await ctx.newPage(), er = []; p._er = er; p.on('pageerror', e => er.push(String(e)));
  await p.goto(URL); await esp(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
  await p.evaluate(async () => { const C = Data.col.bind(Data);
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA'], fazendas: [], tipos: [] });
    await C('sv2_users').set('u_lider', { nome: 'Carlos Lima', login: 'carlos.lima', perfil: 'secundario', estrela: true, status: 'ativo', atrib: { coletas: true, almox: true } });
  });
  return p;
}
/* a própria conta vira Líder ★ com áreas escolhidas (o Administrador sempre vê e altera tudo) */
const comoLider = (p, atrib, soVer) => p.evaluate(([a, s]) => Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: true, atrib: a, soVer: s }), [atrib, soVer]).then(() => esp(400));

(async () => { const b = await chromium.launch();
  let p = await abre(b, 1280, 860);

  console.log('— Pessoas: cada área com Não vê · Só ver · Ver e alterar');
  await vai(p, '#/adm/pessoas'); await p.click('[data-act="pes-novo"]'); await esp(500);
  const f = await p.evaluate(() => [...document.querySelectorAll('#gv .pes-ar')].map(r => ({ t: r.querySelector('span').textContent, v: r.querySelector('.dd-b').textContent.trim(), n: r.querySelectorAll('li[role=option]').length })));
  conf(f.length === 7 && f.every(x => x.v === 'Não vê' && x.n === 3), 'as 7 áreas com a janela retrátil de 3 escolhas, começando em "Não vê": ' + f.map(x => x.t + '=' + x.v + '/' + x.n).join(', '));
  await p.evaluate(() => { const s = (c, v) => { const i = document.querySelector('#gv [data-fm="' + c + '"]'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };
    s('nome', 'Maria Souza'); s('login', 'maria.souza'); s('senha', 'segredo12'); });
  await p.click('[data-act="pes-ed-ok"]'); await esp(200);
  conf(/pelo menos uma área/.test(await p.evaluate(() => (document.querySelector('#gv .fm-msg') || {}).textContent || '')), 'sem nenhuma área não cadastra');
  await p.click('[data-dd="pes:at.coletas"] .dd-b'); await p.click('[data-dd="pes:at.coletas"] li:has-text("Ver e alterar")'); await esp(150);
  await p.click('[data-dd="pes:at.almox"] .dd-b'); await p.click('[data-dd="pes:at.almox"] li:has-text("Só ver")'); await esp(150);
  /* alinhamento (regra de 11/11): as janelas lado a lado com a mesma altura e a mesma largura */
  const al = await p.evaluate(() => { const r = [...document.querySelectorAll('#gv .pes-ar .dd-b')].map(e => e.getBoundingClientRect()); return { h: [...new Set(r.map(x => Math.round(x.height)))], w: [...new Set(r.map(x => Math.round(x.width)))] }; });
  conf(al.h.length === 1 && al.w.length === 1, 'janelas das áreas com a mesma altura e largura (' + al.h + ' × ' + al.w + ' px)');
  await foto(p, 'p1-pessoas-pc');
  await p.click('[data-act="pes-ed-ok"]'); await esp(900);
  const m = await p.evaluate(() => { const u = S.users.find(x => x.login === 'maria.souza'); return u && { atrib: u.atrib, soVer: u.soVer }; });
  conf(m && m.atrib.coletas === true && m.atrib.almox === true && m.atrib.cloro === false && m.soVer && m.soVer.almox === true && !m.soVer.coletas, 'grava atrib (vê) e soVer (só vê): ' + JSON.stringify(m));
  const mid = await p.evaluate(() => S.users.find(x => x.login === 'maria.souza').id);
  await p.evaluate(i => pesAbre(i), mid); await esp(400);
  conf(await p.evaluate(() => /Coletas, Almoxarifado \(só ver\)/.test(document.getElementById('gv').textContent)), 'o detalhe diz "Coletas, Almoxarifado (só ver)"');
  await p.click('[data-act="pes-editar"]'); await esp(400);
  conf(await p.evaluate(() => document.querySelector('[data-dd="pes:at.almox"] .dd-b').textContent.trim() === 'Só ver' && document.querySelector('[data-dd="pes:at.cloro"] .dd-b').textContent.trim() === 'Não vê'), 'editar abre com o que estava gravado');
  await p.evaluate(() => DD_AO.pes('perfil', 'visitante')); await esp(200);
  conf(await p.evaluate(() => [...document.querySelectorAll('#gv .pes-ar')].every(r => r.querySelectorAll('li[role=option]').length === 2)), 'perfil Consulta: só "Não vê" e "Só ver"');
  await p.keyboard.press('Escape'); await esp(200); if (await tem(p, '[data-act="cf-sim"]')) { await p.click('[data-act="cf-sim"]'); await esp(200); } await p.keyboard.press('Escape'); await esp(300);

  console.log('— Líder ★ com Almoxarifado e Apontamentos "Só ver", Coletas "Ver e alterar", o resto "Não vê"');
  await comoLider(p, { coletas: true, almox: true, apont: true, cloro: false, docs: false, qualidade: false, rateios: false }, { almox: true, apont: true });
  await vai(p, '#/inicio');
  const menu = await p.evaluate(() => [...document.querySelectorAll('.cs-nav a')].map(a => a.getAttribute('href') || ''));
  conf(!menu.includes('#/documentos') && menu.includes('#/coletas') && menu.includes('#/almox'), 'menu sem Documentos ("Não vê"), com Coletas e Almoxarifado: ' + menu.join(' '));
  await vai(p, '#/inspecoes');
  const abas = await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].map(a => a.textContent.trim()));
  conf(!abas.some(t => /Cloro/.test(t)) && abas.some(t => /Apontamentos/.test(t)), 'Inspeções sem a aba Cloro ("Não vê"): ' + abas.join(', '));
  await vai(p, '#/inspecoes/apontamentos');
  conf(!(await tem(p, '[data-act="ap-novo"]')), 'Apontamentos "Só ver": sem "Novo apontamento"');
  await foto(p, 'p2-apont-sover');
  await vai(p, '#/inspecoes/auditoria');
  conf(!(await tem(p, '[data-act^="au-nova"]')), 'Auditoria "Só ver": sem "Nova auditoria"');
  await vai(p, '#/qualidade');
  const qab = await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].map(a => a.textContent.trim()));
  conf(qab.length <= 1 && (!qab.length || /Bugs/.test(qab[0])), 'Qualidade "Não vê": fica só Bugs e sugestões (' + (qab.join(', ') || 'sem abas') + ')');
  await vai(p, '#/almox/materiais', 900);
  const alm = await p.evaluate(() => [...document.querySelectorAll('[data-act="lc-abrir"], [data-act="lc-ent"], [data-act="lc-multi"], [data-act^="mc-"]')].length);
  conf(alm === 0, 'Almoxarifado "Só ver": sem Entrada, Saída nem cadastro (' + alm + ' botões)');
  await foto(p, 'p3-almox-sover');
  await vai(p, '#/coletas/agua', 900);
  conf(await tem(p, '[data-act="ag-nova"]'), 'Coletas "Ver e alterar": "Nova coleta" de água continua');
  await vai(p, '#/coletas/cadastros', 900);
  conf(await tem(p, '[data-act="cc-novo"]'), 'Coletas › Cadastros do Líder ★ continua com "Novo"');

  console.log('— Gravar e decidir (como a regra [R8])');
  const g = await p.evaluate(async () => { const r = {}; try { await Data.col('sv2_alm_mov').add({ teste: 1 }); r.mov = 'gravou'; } catch (e) { r.mov = e.code || String(e); }
    try { await Data.col('sv2_aguacol').add({ teste: 1, criadoPor: S.user.id }); r.agua = 'gravou'; } catch (e) { r.agua = e.code || String(e); }
    const ped = t => ({ tipo: t, status: 'pendente', paraIds: [S.user.id], payload: {} }); r.decAlm = Aprov.podeDecidir(ped('almox')); r.decCol = Aprov.podeDecidir(ped('cancelar_coleta')); return r; });
  conf(g.mov === 'permission-denied', 'gravar no Almoxarifado ("Só ver") é recusado (' + g.mov + ')');
  conf(g.agua === 'gravou', 'gravar em Coletas ("Ver e alterar") continua (' + g.agua + ')');
  conf(g.decAlm === false && g.decCol === true, 'pedido do Almoxarifado não se decide; o de Coletas sim (' + g.decAlm + '/' + g.decCol + ')');

  console.log('— A mesma conta com o Almoxarifado em "Ver e alterar"');
  await comoLider(p, { coletas: true, almox: true, apont: true }, { apont: true });
  await vai(p, '#/almox/materiais', 900);
  conf(await p.evaluate(() => document.querySelectorAll('[data-act="lc-abrir"], [data-act="lc-ent"], [data-act="lc-multi"]').length > 0), 'os botões de lançar voltam');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  await p.close();

  console.log('— Celular 390');
  p = await abre(b, 390, 844);
  await vai(p, '#/adm/pessoas'); await p.click('[data-act="pes-novo"]'); await esp(500);
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll('#gv .pes-ar .dd-b')].map(e => e.getBoundingClientRect()); return { h: [...new Set(r.map(x => Math.round(x.height)))], w: [...new Set(r.map(x => Math.round(x.width)))], lado: document.documentElement.scrollWidth > innerWidth + 1 }; });
  conf(c.h.length === 1 && c.h[0] >= 44 && c.w.length === 1 && !c.lado, 'celular: janelas com 44 px, mesma largura, nada rola de lado (' + c.h + ' × ' + c.w + ')');
  await foto(p, 'p4-pessoas-cel');
  conf(p._er.length === 0, 'sem erro de JavaScript no celular' + (p._er.length ? ': ' + p._er[0] : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
