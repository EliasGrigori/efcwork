/* EFCwork · v0.6.25 · Relatórios › Apontamentos. Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0625.js */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..'), SEM = require('../visual/relapont-v0625/semente.js');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const ver = p => p.evaluate(() => ({ abas: [...document.querySelectorAll('.cs-abas a')].map(e => e.textContent.trim()), t: (document.querySelector('.cs-ph h1') || {}).textContent,
  res: [...document.querySelectorAll('.rp .rl-res li')].map(e => e.textContent), sec: [...document.querySelectorAll('.rp .sm-sec h2')].map(e => e.firstChild.textContent),
  lei: [...document.querySelectorAll('.rp .am-lei li')].map(e => e.textContent), fil: (document.querySelector('[data-act="rp-filtro"]') || {}).textContent,
  setor: [...document.querySelectorAll('[data-parte="setor"] tbody tr')].map(r => [...r.cells].map(c => c.textContent).join('|')),
  par: [...document.querySelectorAll('[data-parte="pareto"] tbody tr')].map(r => r.cells[0].textContent + (r.cells[0].querySelector('b') ? '*' : '') + '|' + r.cells[2].textContent),
  rein: [...document.querySelectorAll('[data-parte="rein"] tbody tr')].map(r => r.cells[0].textContent + '|' + r.cells[1].textContent + '|' + r.cells[2].textContent),
  nc: [...document.querySelectorAll('[data-parte="nc"] tbody tr')].map(r => r.cells[2].textContent + '|' + r.cells[5].textContent),
  grupos: [...document.querySelectorAll('[data-parte="lista"] .sm-h3')].map(e => e.textContent), aps: [...document.querySelectorAll('.rp-ap')].map(e => e.getAttribute('data-id')),
  lado: document.documentElement.scrollWidth > innerWidth }));
(async () => { const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, w: 1280, h: 860 }); await p.evaluate(SEM); await p.waitForTimeout(400);
  console.log('— Aba, resumo e partes');
  await ir(p, 'relatorios/apontamentos', 1200); let v = await ver(p);
  conf(v.abas.join() === 'Rateio,Semana,Almoxarifado,Documentos,Apontamentos' && v.t === 'Relatório de apontamentos', 'aba Apontamentos depois de Documentos (' + v.abas.join() + ')');
  conf(v.res.length === 5 && /^7apontamentos1 não procede/.test(v.res[0]) && /^4em aberto2 graves ou urgentes/.test(v.res[1]) && /^3resolvidosem média/.test(v.res[2]) && /^2NCs abertas1 vencida/.test(v.res[3]) && /^2reincidências/.test(v.res[4]), 'resumo: ' + v.res.join(' | '));
  conf(v.sec.join('|') === 'Como ler|Por setor|O que mais se repete|Mês a mês|Reincidências|NCs e plano de ação|Apontamentos por setor', 'as sete partes: ' + v.sec.join(', '));
  conf(v.lei.some(x => /^7 apontamentos no período \(e 1 marcado como não procede, fora das contas\); 3 resolvidos, em média em/.test(x)) && v.lei.some(x => /Setor com mais apontamentos: Packing House \(3 de 7\)/.test(x)) && !v.lei.some(x => / — /.test(x)), 'Como ler com singular e plural certos e sem travessão');
  conf(v.setor[0] === 'Packing House||3|2|1|1' && v.setor.length === 4 && !v.setor.some(x => /^Almoxarifado/.test(x)), 'por setor (o não procede fica fora): ' + v.setor.join(' / '));
  conf(v.par[v.par.length - 1] === 'Outro|1' && v.par[0] === 'EPI*|2' && v.par[1] === 'Resíduos sólidos*|2', 'Pareto com os vitais em negrito e Outro no fim: ' + v.par.join(' / '));
  conf(v.rein.join(' / ') === 'Packing House|Resíduos sólidos|2 / Campo|EPI|2', 'reincidências: ' + v.rein.join(' / '));
  conf(v.nc.length === 3 && /^Marcos\|NC vencida/.test(v.nc[0]) && /^Giovane\|NC aberta/.test(v.nc[1]) && /fechada/.test(v.nc[2]), 'NCs: vencida, aberta, fechada (' + v.nc.join(' / ') + ')');
  conf(v.grupos[0] === 'Packing House · 3' && v.aps[0] === 'a3' && v.aps.indexOf('a9') < 0 && v.aps.indexOf('a7') >= 0, 'reunião por setor, em aberto e mais grave primeiro, só o período');
  const meses = await p.evaluate(() => [...document.querySelectorAll('[data-parte="meses"] tbody tr')].length);
  conf(meses === 6, 'mês a mês com 6 meses');
  await p.waitForTimeout(600);
  const ft = await p.evaluate(() => ({ n: document.querySelectorAll('.rp-ft').length, c: [...document.querySelectorAll('.rp-ft img')].filter(i => i.complete && i.naturalWidth > 0).length, cap: [...document.querySelectorAll('.rp-ft figcaption')].map(e => e.textContent).join() }));
  conf(ft.n === 3 && ft.c === 3 && ft.cap === 'Antes,Antes,Depois', 'fotos de antes e depois carregadas (' + ft.n + '/' + ft.c + ')');
  const al = await p.evaluate(() => [...document.querySelectorAll('.rp .am-t')].every(t => [...t.querySelectorAll('thead th')].every((th, k) => { const td = t.querySelector('tbody tr td:nth-child(' + (k + 1) + ')'); const n = x => x === 'start' ? 'left' : x === 'end' ? 'right' : x; return !td || n(getComputedStyle(th).textAlign) === n(getComputedStyle(td).textAlign); })));
  conf(al, 'cabeçalhos alinhados com as colunas (números à direita)');
  conf(!v.lado, 'nada rola para o lado no PC');
  conf(await p.evaluate(() => !!document.querySelector('.cs-abas-l [data-act="rp-imp"], [data-ic-aba][data-act="rp-imp"]')), 'impressora na linha das abas');
  console.log('— Filtro único');
  await p.click('[data-act="rp-filtro"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !document.querySelector('.rp-fp').hidden && document.querySelectorAll('.rp-fp .dd').length === 5), 'um botão Filtro abre Período, Setor, Situação, Gravidade e Fotos');
  await p.evaluate(() => DD_AO.rp('setor', 'Campo')); await p.waitForTimeout(300); v = await ver(p);
  conf(/Campo/.test(v.fil) && v.aps.join() === 'a4,a5' && v.setor.length === 4 && /^2apontamentos/.test(v.res[0]), 'Setor = Campo: lista e resumo do Campo; a comparação continua com todos');
  conf(await p.evaluate(() => !!document.querySelector('.rp.sm-ent')), 'troca do filtro entra com movimento');
  await p.evaluate(() => { DD_AO.rp('setor', ''); DD_AO.rp('grav', 'gu'); }); await p.waitForTimeout(300); v = await ver(p);
  conf(v.aps.sort().join() === 'a3,a4', 'Gravidade = grave e urgente');
  await p.evaluate(() => { DD_AO.rp('grav', ''); DD_AO.rp('per', '90'); }); await p.waitForTimeout(300); v = await ver(p);
  conf(v.aps.indexOf('a9') >= 0 && /^8apontamentos/.test(v.res[0]), 'Período = 90 dias traz o de 60 dias atrás');
  await p.evaluate(() => { DD_AO.rp('per', '30'); DD_AO.rp('fotos', 'nao'); }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.querySelectorAll('.rp-ft').length === 0), 'Fotos = Não mostrar tira as fotos');
  await p.evaluate(() => DD_AO.rp('fotos', 'sim')); await p.waitForTimeout(300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.querySelector('.rp-fp').hidden), 'Esc fecha o filtro');
  console.log('— Gaveta, imprimir');
  await p.click('.rp-ap[data-id="a3"]'); await p.waitForTimeout(700);
  conf(await p.evaluate(() => !!document.querySelector('#gv') && /Piso molhado sem placa/.test(document.querySelector('#gv').textContent)), 'tocar num apontamento abre a gaveta dele');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => !document.querySelector('#gv') || !document.querySelector('#gv.on, #gv[open]')) && await p.evaluate(() => S.rota.aba === 'apontamentos'), 'Esc fecha a gaveta e fica no relatório');
  await p.click('[data-parte="nc"] tbody tr'); await p.waitForTimeout(700);
  conf(await p.evaluate(() => /Piso molhado/.test((document.querySelector('#gv') || {}).textContent || '')), 'linha da NC abre o apontamento');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.evaluate(() => { window.print = () => {}; }); await p.click('[data-act="rp-imp"]'); await p.waitForTimeout(600);
  const imp = await p.evaluate(() => { const x = document.querySelector('#tb-imp'); return x && { t: x.querySelector('.imp-cab b').textContent, sec: x.querySelectorAll('.sm-sec').length, ft: [...x.querySelectorAll('.rp-ft img')].filter(i => /^data:|^blob:/.test(i.getAttribute('src') || '')).length }; });
  conf(imp && /Relatório de apontamentos/.test(imp.t) && imp.sec === 7 && imp.ft === 3, 'imprimir monta o papel com as sete partes e as fotos já carregadas (' + JSON.stringify(imp) + ')');
  conf(await p.evaluate(() => JSON.stringify(localStorage).indexOf('relatorio_apont') >= 0), 'impressão vai para o registro de atividade (relatorio_apont)');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  console.log('— Reage aos dados');
  await p.evaluate(() => Data.col('sv2_apont').update('a2', { status: 'resolvido', resolucao: { texto: 'ok', porNome: 'x', ts: nowISO() } })); await p.waitForTimeout(500); v = await ver(p);
  conf(/^3em aberto/.test(v.res[1]), 'resolver um apontamento atualiza o relatório aberto');
  await p.context().close();
  console.log('— Celular');
  p = await abre(br, { raiz: RAIZ, w: 390, h: 844 }); await p.evaluate(SEM); await ir(p, 'relatorios/apontamentos', 1200); v = await ver(p);
  conf(!v.lado && v.res.length === 5, 'celular: nada rola para o lado');
  const bt = await p.evaluate(() => Math.round(document.querySelector('[data-act="rp-filtro"]').getBoundingClientRect().height));
  conf(bt >= 36, 'celular: botão Filtro com ' + bt + ' px');
  conf(p._er.length === 0, 'celular sem erro de JavaScript');
  await p.context().close();
  console.log('— Quem vê');
  p = await abre(br, { raiz: RAIZ, w: 1280, h: 860 }); await p.evaluate(SEM);
  const col = await p.evaluate(() => { const u = Object.assign({}, S.user); S.user.perfil = 'secundario'; S.user.estrela = false; const ar = AREAS.find(a => a.id === 'relatorios'), aba = ar.abas.find(a => a.id === 'apontamentos');
    const r = [isSup(S.user), TELAS.relatorios('apontamentos'), aba.negada]; S.user.perfil = u.perfil; S.user.estrela = u.estrela; return r; });
  conf(col[0] === false && col[1] === '' && col[2] === true, 'colaborador (secundário sem ★): a aba some e a tela não desenha');
  await br.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
