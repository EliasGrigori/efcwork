/* EFCwork · v0.6.21 · sem a barra de cima no PC (ferramentas na linha do título) e Relatórios › Almoxarifado do mês.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0621.js */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const caixa = (p, s) => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), c: Math.round((r.top + r.bottom) / 2), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height) }; }, s);
(async () => { const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, w: 1280, h: 860 });
  console.log('— Cabeçalho no PC');
  for (const r of ['inicio', 'coletas/amostras', 'qualidade/bugs', 'almox/materiais']) {
    await ir(p, r, 900);
    const m = await p.evaluate(() => ({ topo: !!document.querySelector('.cs-topo'), bc: !!document.querySelector('.cs-bc, .mo-bc'), fer: document.querySelectorAll('.cs-fer').length, busca: !!document.querySelector('.cs-fer .cs-busca'), sino: !!document.querySelector('.cs-fer .cs-sino #sn-n'), tema: !!document.querySelector('.cs-fer [data-act="cs-tema"]') }));
    const h1 = await caixa(p, '.cs-ph h1'), fe = await caixa(p, '.cs-fer'), ac = await caixa(p, '.cs-acts'), me = await caixa(p, '.cs-meta');
    conf(!m.topo && !m.bc, r + ': sem a barra de cima e sem o caminho');
    conf(m.fer === 1 && m.busca && m.sino && m.tema, r + ': busca, nuvem, tema e sino na linha do título (uma vez só)');
    conf(h1 && fe && Math.abs((h1.t + h1.b - 6) / 2 - fe.c) <= 6 && h1.t < 40, r + ': ferramentas na altura do título, no alto da tela (título ' + (h1 && h1.t) + ', ferramentas ' + (fe && fe.c) + ')');
    if (ac && me) conf(ac.t > fe.b - 2 && ac.r === fe.r, r + ': botões da tela na linha de baixo, alinhados à direita com as ferramentas');
  }
  await ir(p, 'coletas/amostras', 800); await p.click('.cs-fer [data-act="cs-sino"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => !!document.querySelector('.sn, #sn, [class*="sn-"]')), 'o sino da linha do título abre os avisos'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.cs-fer .cs-busca'); await p.waitForTimeout(400); conf(!!(await p.$('#bg')), 'a busca da linha do título abre'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.evaluate(() => { const r = document.querySelector('.cs-fer [data-act="cs-tema"]'); r.click(); }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => document.documentElement.getAttribute('data-tema') === 'escuro' && !!document.querySelector('.cs-fer')), 'tema troca e as ferramentas continuam no título');
  await p.evaluate(() => csTrocaTema('claro')); await p.waitForTimeout(200);
  await p.click('tr[data-id]'); await p.waitForTimeout(700);
  conf(await p.evaluate(() => { const g = document.querySelector('#gv'); return !!g && Math.round(g.getBoundingClientRect().top) === 0; }), 'a gaveta vai até o alto da tela (sem a barra, sem faixa vazia em cima)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));

  console.log('— Relatórios › Almoxarifado do mês');
  await ir(p, 'relatorios/almox', 1200);
  const a = await p.evaluate(() => ({ abas: [...document.querySelectorAll('.cs-abas a')].map(e => e.textContent.trim()), t: document.querySelector('.cs-ph h1').textContent, res: [...document.querySelectorAll('.am .rl-res li')].map(e => e.textContent),
    sec: [...document.querySelectorAll('.am .sm-sec h2')].map(e => e.firstChild.textContent), lado: document.documentElement.scrollWidth > innerWidth, imp: !!document.querySelector('.cs-abas-l [data-act="am-imp"]'), fil: document.querySelector('[data-act="am-filtro"]').textContent }));
  conf(a.abas.slice(0, 3).join() === 'Rateio,Semana,Almoxarifado' && a.t === 'Almoxarifado do mês', 'aba Almoxarifado ao lado de Rateio e Semana');
  conf(a.res.length === 5 && /R\$ 116,00consumo do mês1 saída/.test(a.res[0]) && /em compras1 entrada/.test(a.res[1]) && /pontos de atenção1 vencido · 2 abaixo/.test(a.res[4]), 'resumo: consumo, compras, estoque, movimentados e atenção (' + a.res[0] + ' | ' + a.res[4] + ')');
  conf(a.sec.join('|') === 'Como ler este mês|Consumo mês a mês|Para que foi usado|Material a material|Por laboratório e por pessoa|O que pede atenção|Solicitações e equipamentos', 'as sete partes: ' + a.sec.join(', '));
  conf(a.imp && /Novembro de 2026/.test(a.fil) && !a.lado, 'impressora na linha das abas (ITEM 130), filtro com o mês, sem rolar para o lado');
  const lei = await p.evaluate(() => [...document.querySelectorAll('.am-lei li')].map(e => e.textContent));
  conf(lei.some(x => /Luva nitrílica M \(4 Cx, R\$ 116,00\)/.test(x)) && lei.some(x => /1 lote vencido ainda com saldo/.test(x)) && !lei.some(x => /\(s\)|\(ões\)/.test(x)), 'Como ler: frases com unidade e singular/plural certos');
  const al = await p.evaluate(() => [...document.querySelectorAll('.am-t')].every(t => [...t.querySelectorAll('thead th')].every((th, k) => { const td = t.querySelector('tbody tr td:nth-child(' + (k + 1) + ')'); const n = x => x === 'start' ? 'left' : x === 'end' ? 'right' : x; return !td || n(getComputedStyle(th).textAlign) === n(getComputedStyle(td).textAlign); })));
  conf(al, 'cada coluna com o cabeçalho alinhado como os valores (números à direita)');
  await p.click('[data-act="am-filtro"]'); await p.waitForTimeout(400);
  const op = await p.evaluate(() => [...document.querySelectorAll('[data-dd="am:mes"] li')].map(e => e.dataset.v));
  conf(op.length === 12 && op[0] === '2026-11', '12 meses no filtro, do atual para trás');
  await p.evaluate(() => DD_AO.am('mes', '2026-10')); await p.waitForTimeout(500);
  const ou = await p.evaluate(() => ({ f: document.querySelector('[data-act="am-filtro"]').textContent, r0: document.querySelector('.am .rl-res li').textContent, lei: document.querySelector('.am-lei li').textContent }));
  conf(/Outubro de 2026/.test(ou.f) && /R\$ 0,00/.test(ou.r0), 'outro mês: o filtro e os números mudam (' + ou.r0 + ')');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(!(await p.$('.am-fp:not([hidden])')), 'Esc fecha o painel do filtro');
  await p.evaluate(() => DD_AO.am('mes', hojeISO().slice(0, 7))); await p.waitForTimeout(300);
  await p.evaluate(() => { window.print = () => { window._imp = document.querySelector('#tb-imp').innerHTML; }; }); await p.click('[data-act="am-imp"]'); await p.waitForTimeout(400);
  const imp = await p.evaluate(() => window._imp || '');
  conf(/Almoxarifado do mês · Novembro de 2026/.test(imp) && (imp.match(/class="sm-sec"/g) || []).length === 7 && /Fenolftaleína/.test(imp), 'impressão com o título do mês e as sete partes');
  conf(await p.evaluate(() => JSON.parse(Store.get('sv2demo_sv2_audit') || '[]').some(x => x.entidade === 'relatorio_almox')), 'a impressão fica no registro de atividade');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  console.log('— Quem não vê');
  await p.evaluate(async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false, atrib: { coletas: true } }); await csCarregaUsuario(S.user.id); }); await p.waitForTimeout(700);
  await ir(p, 'relatorios/almox', 800);
  const nv = await p.evaluate(() => ({ h: location.hash, am: !!document.querySelector('.cs-ct .sm.am'), ab: [...document.querySelectorAll('.cs-abas a')].map(e => e.textContent.trim()).join(), ve: amVe() }));
  conf(!nv.am && !nv.ve && !/Almoxarifado/.test(nv.ab) && nv.h.indexOf('relatorios/almox') < 0, 'Colaborador sem o Almoxarifado: a aba some (' + JSON.stringify(nv) + ')');
  await p.context().close();

  console.log('— Celular (390 px)');
  p = await abre(br, { raiz: RAIZ, w: 390, h: 844 });
  await ir(p, 'coletas/amostras', 900);
  conf(await p.evaluate(() => !!document.querySelector('.cs-topo [data-act="cs-menu"]') && !document.querySelector('.cs-fer')), 'no celular a barra de cima continua (com o menu) e nada vai para o título');
  await ir(p, 'relatorios/almox', 1100);
  const c = await p.evaluate(() => ({ lado: document.documentElement.scrollWidth > innerWidth, f: Math.round(document.querySelector('[data-act="am-filtro"]').getBoundingClientRect().height), sec: document.querySelectorAll('.am .sm-sec').length }));
  conf(!c.lado && c.sec === 7 && c.f >= 44, 'Almoxarifado do mês no celular: sem rolar para o lado, filtro com ' + c.f + ' px');
  await p.setViewportSize({ width: 1280, height: 860 }); await p.waitForTimeout(600);
  conf(await p.evaluate(() => !document.querySelector('.cs-topo') && !!document.querySelector('.cs-fer')), 'ao alargar a janela para PC, a barra sai e as ferramentas vão para o título');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  await br.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0); })();
