/* EFCwork · v0.6.23 · Relatórios › Documentos. Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0623.js */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..'), SEM = require('../visual/reldocs-v0623/semente.js');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const ver = p => p.evaluate(() => ({ abas: [...document.querySelectorAll('.cs-abas a')].map(e => e.textContent.trim()), t: (document.querySelector('.cs-ph h1') || {}).textContent,
  res: [...document.querySelectorAll('.rd .rl-res li')].map(e => e.textContent), sec: [...document.querySelectorAll('.rd .sm-sec h2')].map(e => e.firstChild.textContent),
  lei: [...document.querySelectorAll('.rd .am-lei li')].map(e => e.textContent), lin: [...document.querySelectorAll('.rd-t tbody tr')].map(r => r.cells[0].textContent),
  resp: [...document.querySelectorAll('[data-parte="resp"] tbody tr')].map(r => [...r.cells].map(c => c.textContent).join('|')), fil: (document.querySelector('[data-act="rd-filtro"]') || {}).textContent,
  lado: document.documentElement.scrollWidth > innerWidth }));
(async () => { const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, w: 1280, h: 860 }); await p.evaluate(SEM); await p.waitForTimeout(400);
  console.log('— Aba e resumo');
  await ir(p, 'relatorios/documentos', 1200); let v = await ver(p);
  conf(v.abas.join() === 'Rateio,Semana,Almoxarifado,Documentos' && v.t === 'Relatório de documentos', 'aba Documentos depois do Almoxarifado (' + v.abas.join() + ')');
  conf(v.res.length === 5 && /^3vencidosde 9 ativos/.test(v.res[0]) && /^2vencem logo/.test(v.res[1]) && /^3em dia/.test(v.res[2]) && /^1sem data/.test(v.res[3]) && /^1caixa vencidade 5 caixas/.test(v.res[4]), 'resumo: ' + v.res.join(' | '));
  conf(v.sec.join('|') === 'Como ler|Vencidos por responsável|O que vence nas próximas semanas|Caixas d’água · limpeza|Documentos', 'as cinco partes: ' + v.sec.join(', '));
  conf(v.lei.some(x => /3 documentos vencidos de 9 ativos \(2 formulários, 1 regulatório\)/.test(x)) && v.lei.some(x => /primeiro é VERIFICAÇÃO DE LIMPEZA PACKING HOUSE \(faltam 4 d\)/.test(x)) && v.lei.some(x => /1 documento está sem data: precisa do primeiro/.test(x)) && !v.lei.some(x => / — /.test(x)), 'Como ler com singular e plural certos e sem travessão');
  conf(v.resp.join(' / ') === 'ELIAS||1|1|2 / ALEX||1|0|1', 'vencidos por responsável, com Formulários e Regulatórios: ' + v.resp.join(' / '));
  conf(v.lin[0] === 'FOR 0010 · LIMPEZA PULVERIZADORES' && v.lin[3] === 'FOR 0084 · VERIFICAÇÃO DE LIMPEZA PACKING HOUSE' && v.lin.length === 9 && v.lin.indexOf('FOR 0099 · ANTIGO CONTROLE') < 0, 'lista do mais urgente para o em dia, sem os desativados');
  const sm = await p.evaluate(() => [...document.querySelectorAll('[data-parte="semanas"] tbody tr')].map(r => r.cells[0].textContent));
  conf(sm.length === 8 && sm[0] === 'Esta semana', 'oito semanas, a primeira é "Esta semana"');
  const cx = await p.evaluate(() => [...document.querySelectorAll('[data-parte="caixas"] table')].map(t => t.tBodies[0].rows.length));
  conf(cx[0] === 4 && cx[1] >= 1, 'caixas por situação e a lista das vencidas e perto de vencer');
  const al = await p.evaluate(() => [...document.querySelectorAll('.rd .am-t')].every(t => [...t.querySelectorAll('thead th')].every((th, k) => { const td = t.querySelector('tbody tr td:nth-child(' + (k + 1) + ')'); const n = x => x === 'start' ? 'left' : x === 'end' ? 'right' : x; return !td || n(getComputedStyle(th).textAlign) === n(getComputedStyle(td).textAlign); })));
  conf(al, 'cabeçalhos alinhados com as colunas (números à direita)');
  conf(!v.lado, 'nada rola para o lado no PC');
  console.log('— Filtro único');
  await p.click('[data-act="rd-filtro"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !document.querySelector('.rd-fp').hidden && document.querySelectorAll('.rd-fp .dd').length === 3), 'um botão Filtro abre Tipo, Situação e Responsável');
  await p.evaluate(() => DD_AO.rd('tipo', 'R')); await p.waitForTimeout(300); v = await ver(p);
  conf(/Regulatórios/.test(v.fil) && v.lin.length === 3 && v.resp.join() === 'ELIAS||1', 'Tipo = Regulatórios: lista e responsáveis só com regulatórios (' + v.resp.join() + ')');
  await p.evaluate(() => { DD_AO.rd('tipo', ''); DD_AO.rd('sit', 'venc'); }); await p.waitForTimeout(300); v = await ver(p);
  conf(v.lin.length === 3 && /Vencidos/.test(v.fil), 'Situação = Vencidos: só os 3 vencidos');
  await p.evaluate(() => { DD_AO.rd('sit', ''); DD_AO.rd('resp', 'ELIAS'); }); await p.waitForTimeout(300); v = await ver(p);
  conf(v.lin.length === 3 && v.resp.length === 2 && /ELIAS/.test(v.fil) && /^2vencidos/.test(v.res[0]), 'Responsável = ELIAS: a lista e o resumo dele; a comparação continua com todos');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.querySelector('.rd-fp').hidden), 'Esc fecha o filtro');
  await p.evaluate(() => DD_AO.rd('resp', '')); await p.waitForTimeout(300);
  console.log('— Gaveta, imprimir');
  await p.click('.rd-t tbody tr'); await p.waitForTimeout(700);
  conf(await p.evaluate(() => !!document.querySelector('#gv') && /LIMPEZA PULVERIZADORES/.test(document.querySelector('#gv').textContent) && !!document.querySelector('#gv [data-act="dc-lancar"], #gv [data-act^="dc-lan"]')), 'tocar num documento abre a gaveta dele (de lá se lança)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.evaluate(() => { window.print = () => {}; }); await p.click('[data-act="rd-imp"]'); await p.waitForTimeout(300);
  const imp = await p.evaluate(() => { const x = document.querySelector('#tb-imp'); return x && { t: x.querySelector('.imp-cab b').textContent, sec: x.querySelectorAll('.sm-sec').length }; });
  conf(imp && /Relatório de documentos/.test(imp.t) && imp.sec === 5, 'imprimir monta o papel com o resumo e as cinco partes');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  await p.context().close();
  console.log('— Celular');
  p = await abre(br, { raiz: RAIZ, w: 390, h: 844 }); await p.evaluate(SEM); await ir(p, 'relatorios/documentos', 1200); v = await ver(p);
  conf(!v.lado && v.res.length === 5, 'celular: nada rola para o lado');
  const bt = await p.evaluate(() => Math.round(document.querySelector('[data-act="rd-filtro"]').getBoundingClientRect().height));
  conf(bt >= 36, 'celular: botão Filtro com ' + bt + ' px');
  conf(p._er.length === 0, 'celular sem erro de JavaScript');
  await br.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
