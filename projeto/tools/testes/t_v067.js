/* EFCwork · suíte da v0.6.7 — Coletas › Água: projetos de coleta (detalhe, confirmar, remarcar, realinhar, não vai ter, lançar, criar/editar,
   desativar, avisos, frequências com nome, várias análises) e Cadastros › Pontos de água. ?demo=1
   Uso: node tools/testes/t_v067.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const semear = require('./ag_semente.js');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const TELAS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 300);
  await semear(p);
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), ts = new Date().toISOString();
    await C('sv2_aguaponto').set('pt2', { nome: 'Canal 01', local: 'Fazenda Russas', tipo: 'outro', ativo: true, criadoEm: ts });
    await C('sv2_analises').set('an3', { tipo: 'AGUA', nome: 'METAIS PESADOS', sigla: 'MET', lab: 'Hidrolab', valor: 320, rev: 0, ativo: true });
    let ini = addDias(hojeISO(), -40); while (pjDow(ini) !== 3) ini = addDias(ini, 1);
    await C('sv2_aguaproj').set('pc1', { nome: 'Canal — mensal', pontos: ['ponto:pt2', 'ponto:pt1'], porVez: 0, mesclada: false, analiseId: 'an1', analiseIds: ['an1', 'an3'], lab: '', cadaSemanas: 4, dia: 3, hora: '07:00', inicio: ini, ativo: true, confirmadas: {}, remarcadas: {}, puladas: {}, criadoEm: ts });
    let d = addDias(hojeISO(), 1); while (pjDow(d) === 0 || pjDow(d) === 6) d = addDias(d, 1);
    await C('sv2_aguaproj').set('pc2', { nome: 'Caixas — semanal', pontos: ['caixa:cx1'], porVez: 0, analiseId: 'an1', lab: '', cadaSemanas: 1, dia: pjDow(d), hora: '09:00', inicio: d, ativo: true, confirmadas: {}, remarcadas: {}, puladas: {}, criadoEm: ts });
  });
  await esp(p, 800);
  return p;
}
const proj = (p, id) => p.evaluate(async id => await Data.col('sv2_aguaproj').get(id), id);
const fechaTudo = async p => { for (let i = 0; i < 4; i++) { if (await p.$('[data-act="cf-sim"]')) { await p.click('[data-act="cf-sim"]'); await esp(p, 250); } if (!(await p.$('#gv'))) break; await p.keyboard.press('Escape'); await esp(p, 300); } };

(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);

  console.log('Caixas dos projetos:');
  const nb = await p.$$('.ag-box[data-act="pj-abre"]');
  conf(nb.length === 3 && !!(await p.$('.ag-novo[data-act="pj-novo"]')), 'três caixas (rodízio, canal, caixas) e a caixa Novo projeto');
  const cx = await p.textContent('.ag-box[data-id="pc1"]');
  conf(/mensal \(a cada 4 semanas\), quarta/.test(cx) && /MICROBIOLÓGICA, METAIS PESADOS/.test(cx), 'a caixa mostra a frequência com nome e as duas análises');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-agua.png') });

  console.log('Detalhe do projeto (OPÇÃO 1) e ações:');
  await p.click('.ag-box[data-id="pc1"] .ag-bq'); await esp(p, 500);
  conf(/Canal — mensal/.test(await p.textContent('#gv')) && !!(await p.$('#gv .pj-cal')) && /Atrasada/.test(await p.textContent('#gv')), 'abre o projeto no calendário do mês (OPÇÃO 2), na data atrasada');
  conf(!!(await p.$('#gv [data-act="pj-rem"]')) && !!(await p.$('#gv [data-act="pj-pul"]')) && !!(await p.$('#gv [data-act="ag-nova"][data-pid="pc1"]')), 'ações da primeira data: Remarcar, Não vai ter, Lançar');
  conf(!!(await p.$('#gv [data-act="pj-des"]')) && !!(await p.$('#gv [data-act="pj-ed"]')), 'lixeira (desativar) no canto e Editar no rodapé');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-proj1.png') });
  const oc1 = await p.evaluate(() => pjProxima(pjDe('pc1')).oc);
  await p.click('#gv [data-act="pj-pul"]'); await esp(p, 400);
  await p.fill('#gv [data-fm="motivo"]', 'abc'); await p.click('#gv [data-act="pj-pul-ok"]'); await esp(p, 300);
  conf(/motivo/.test(await p.textContent('#gv .fm-msg')), 'Não vai ter sem motivo é recusado');
  await p.fill('#gv [data-fm="motivo"]', 'Canal seco nessa semana'); await p.click('#gv [data-act="pj-pul-ok"]'); await esp(p, 600);
  const pc1a = await proj(p, 'pc1');
  conf(pc1a.puladas && pc1a.puladas[oc1] && /seco/.test(pc1a.puladas[oc1].motivo), 'registrou "não houve" com o motivo na ocorrência');
  conf(await p.evaluate(oc => pjProxima(pjDe('pc1')).oc !== oc, oc1), 'a próxima passa a ser a data seguinte');
  const oc2 = await p.evaluate(() => pjProxima(pjDe('pc1')).oc);
  const temConf = await p.$('#gv [data-act="pj-conf"]');
  if (temConf) { await temConf.click(); await esp(p, 600); conf(!!(await proj(p, 'pc1')).confirmadas[oc2], 'Confirmar grava quem confirmou'); }
  else conf(true, '(a próxima não pede confirmação agora)');
  await p.click('#gv [data-act="pj-rem"]'); await esp(p, 400);
  await p.evaluate(() => { S.fm.data = addDias(hojeISO(), -2); gvDesenha(true); }); await p.fill('#gv [data-fm="motivo"]', 'Laboratório fechado'); await p.click('#gv [data-act="pj-rem-ok"]'); await esp(p, 300);
  conf(/hoje em diante/.test(await p.textContent('#gv .fm-msg')), 'remarcar para o passado é recusado');
  await p.evaluate(() => { S.fm.data = addDias(hojeISO(), 10); S.fm.hora = '10:30'; gvDesenha(true); }); await p.fill('#gv [data-fm="motivo"]', 'Laboratório fechado'); await p.click('#gv [data-act="pj-rem-ok"]'); await esp(p, 600);
  const pc1b = await proj(p, 'pc1');
  conf(pc1b.remarcadas[oc2] && pc1b.remarcadas[oc2].hora === '10:30' && !pc1b.realinhos, 'remarcou só esta data (projeto sem rodízio não realinha)');
  conf(/era /.test(await p.textContent('#gv')) && /Remarcada/.test(await p.textContent('#gv')), 'o detalhe mostra "era …" e Remarcada');

  console.log('Lançar a coleta do projeto (2 pontos × 2 análises):');
  await p.click('#gv [data-act="ag-nova"][data-pid="pc1"]'); await esp(p, 500);
  const gvn = await p.textContent('#gv');
  conf(/1 · Projeto/.test(gvn) && /Canal — mensal/.test(gvn) && /e por análise/.test(gvn), 'Nova coleta vem como Projeto, com o nome e a data');
  conf((await p.$$('#gv [data-g="ppt"].on')).length === 2 && (await p.$$('#gv [data-g="pan"].on')).length === 2, 'os 2 pontos e as 2 análises já vêm marcados');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-lancar.png') });
  const antes = await p.evaluate(async () => (await Data.col('sv2_aguacol').all()).length);
  await p.click('#gv [data-act="ag-nova-ok"]'); await esp(p, 900);
  const novas = await p.evaluate(async () => (await Data.col('sv2_aguacol').all()).filter(c => c.projetoId === 'pc1'));
  conf(novas.length === 4 && (await p.evaluate(async () => (await Data.col('sv2_aguacol').all()).length)) === antes + 4, 'lançou 4 coletas (uma por ponto e por análise)');
  conf(novas.every(c => c.tipoColeta === 'projeto' && c.ocorrencia === oc2 && c.rodada) && novas.filter(c => c.analiseId === 'an3').every(c => c.lab === 'Hidrolab'), 'tipo Projeto, mesma ocorrência e rodada; cada análise com o seu laboratório');
  conf(await p.evaluate(oc => pjSit(pjDe('pc1'), oc) === 'lancada', oc2), 'a data ficou Lançada no calendário do projeto');
  await fechaTudo(p);

  console.log('Rodízio (legado): remarcar realinha as seguintes:');
  await p.click('.ag-box[data-id="legado"] .ag-bq'); await esp(p, 500);
  const ocL = await p.evaluate(() => pjProxima(pjDe('legado')).oc);
  await p.click('#gv [data-act="pj-rem"]'); await esp(p, 400);
  conf(/rodízio → mesclada → rodízio/.test(await p.textContent('#gv')), 'avisa que as seguintes contam da nova data');
  await p.evaluate(() => { S.fm.data = addDias(hojeISO(), 3); gvDesenha(true); }); await p.fill('#gv [data-fm="motivo"]', 'Feriado municipal'); await p.click('#gv [data-act="pj-rem-ok"]'); await esp(p, 800);
  const L = await proj(p, 'legado');
  conf(L && L.legado && L.remarcadas[ocL] && (L.realinhos || []).length === 1 && L.realinhos[0].passo === 15, 'o rodízio virou documento, remarcou e realinhou a cada 15 dias');
  await fechaTudo(p);

  console.log('Novo projeto, aviso de repetido, editar e desativar:');
  await p.click('.ag-novo'); await esp(p, 500);
  conf(/Novo projeto de coleta de água/.test(await p.textContent('#gv')), 'abre o editor');
  await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 300);
  conf(/nome/.test(await p.textContent('#gv .fm-msg')), 'sem nome: pede o nome');
  await p.fill('#gv [data-fm="nome"]', 'Bebedouros do campo'); await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 300);
  conf(/ponto/.test(await p.textContent('#gv .fm-msg')), 'sem pontos: pede os pontos');
  for (const r of ['beb:b1', 'beb:b2', 'beb:b3']) { await p.click('#gv [data-act="ag-ck"][data-g="pt"][data-id="' + r + '"]'); await esp(p, 150); }
  await p.evaluate(() => { S.fm.modo = 'rodizio'; S.fm.porVez = '5'; S.fm.cada = '2'; gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 300);
  conf(/de 1 até 3/.test(await p.textContent('#gv .fm-msg')), 'pontos por vez maior que os pontos é recusado');
  await p.fill('#gv [data-fm="porVez"]', '1'); await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 400);
  conf(/Mesmo ponto, análise e laboratório/.test(await p.textContent('#gv')) && /Salvar mesmo assim/.test(await p.textContent('#gv')), 'avisa que os bebedouros já estão no rodízio com a mesma análise');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-editor.png') });
  await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 800);
  const novo = await p.evaluate(async () => (await Data.col('sv2_aguaproj').all()).find(x => x.nome === 'Bebedouros do campo'));
  conf(novo && novo.porVez === 1 && novo.cadaSemanas === 2 && novo.pontos.length === 3 && novo.analiseIds.length === 1 && novo.analiseId === novo.analiseIds[0], 'gravou: 3 pontos, 1 por vez, quinzenal, analiseIds e analiseId (para o EFClaudian)');
  conf(/Bebedouros do campo/.test(await p.textContent('#gv')) && /quinzenal/.test(await p.textContent('#gv')), 'depois de salvar abre o projeto (quinzenal)');
  const avs = await p.evaluate(async () => (await Data.col('sv2_notifs').all()).filter(n => n.titulo === 'Projetos de água com o mesmo ponto'));
  conf(avs.length === 1, 'mandou o aviso de pontos repetidos');
  await p.click('#gv [data-act="pj-ed"]'); await esp(p, 400);
  await p.evaluate(() => { S.fm.cada = '13'; gvDesenha(true); }); await esp(p, 200);
  conf(/trimestral/.test(await p.textContent('#gv .pj-res')), 'o resumo do editor mostra "trimestral"');
  await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 400);
  if (/Salvar mesmo assim/.test(await p.textContent('#gv'))) { await p.click('#gv [data-act="pj-ed-ok"]'); await esp(p, 700); }
  conf((await p.evaluate(async id => (await Data.col('sv2_aguaproj').get(id)).cadaSemanas, novo.id)) === 13, 'editou para trimestral (13 semanas)');
  await p.click('#gv [data-act="pj-des"]'); await esp(p, 400);
  await p.fill('#gv [data-fm="motivo"]', 'Projeto de teste encerrado'); await p.click('#gv [data-act="pj-des-ok"]'); await esp(p, 700);
  const des = await p.evaluate(async id => await Data.col('sv2_aguaproj').get(id), novo.id);
  conf(des.ativo === false && /encerrado/.test(des.motivoInativo), 'desativou com motivo (nada apagado)');
  conf(!(await p.$('.ag-box[data-id="' + novo.id + '"]')), 'a caixa do projeto desativado sumiu');
  await fechaTudo(p);

  console.log('Aviso para confirmar (dia útil anterior):');
  await p.evaluate(() => { S._pjAvisou = false; }); const n = await p.evaluate(() => pjAviso()); await esp(p, 500);
  const avc = await p.evaluate(async () => (await Data.col('sv2_notifs').all()).filter(x => x.refTipo === 'agua_proj' && /Confirmar coleta de água: Caixas — semanal/.test(x.titulo)));
  conf(avc.length === 1, 'avisou para confirmar a coleta do dia útil seguinte (sozinho ao entrar ou agora: ' + n + ')');
  await p.evaluate(() => { S._pjAvisou = false; }); await p.evaluate(() => pjAviso()); await esp(p, 400);
  conf((await p.evaluate(async () => (await Data.col('sv2_notifs').all()).filter(x => x.refTipo === 'agua_proj' && /Caixas — semanal/.test(x.titulo)).length)) === 1, 'não repete o mesmo aviso');

  console.log('Calendário do mês:');
  await p.evaluate(() => { S._pjMes = ''; S._pjSel = ''; }); await p.click('.ag-box[data-id="pc2"] .ag-bq'); await esp(p, 500);
  conf((await p.$$('#gv .pj-dia')).length >= 2 && !!(await p.$('#gv .pj-dia.on')), 'as datas do mês aparecem marcadas; a próxima vem selecionada');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-cal.png') });
  const mes0 = await p.textContent('#gv .pj-calh b');
  await p.click('#gv [data-act="pj-mes"][data-d="1"]'); await esp(p, 300);
  conf((await p.textContent('#gv .pj-calh b')) !== mes0, 'a seta troca de mês');
  const d2 = await p.$('#gv .pj-dia'); if (d2) { await d2.click(); await esp(p, 300); }
  conf(!!(await p.$('#gv .pj-dia.on')) && !!(await p.$('#gv .pj-sel')), 'tocar numa data mostra ela embaixo com os botões');
  await fechaTudo(p);

  console.log('Cadastros › Pontos de água:');
  await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(p, 500);
  conf(/Pontos de água/.test(await p.textContent('main, .cs-main, body')) && /Canal 01/.test(await p.textContent('body')), 'a aba Cadastros lista os pontos de água');
  await p.screenshot({ path: path.join(TELAS, 'v067-pc-pontos.png') });
  await p.click('[data-act="pa-ed"][data-id=""]'); await esp(p, 400);
  await p.fill('#gv [data-fm="nome"]', 'canal 01'); await p.click('#gv [data-act="pa-ok"]'); await esp(p, 300);
  conf(/Já existe/.test(await p.textContent('#gv .fm-msg')), 'nome repetido é recusado');
  await p.fill('#gv [data-fm="nome"]', 'Açude 01'); await p.fill('#gv [data-fm="local"]', 'Fazenda Jardim'); await p.evaluate(() => { S.fm.tipo = 'reservatorio'; gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="pa-ok"]'); await esp(p, 700);
  const ac = await p.evaluate(async () => (await Data.col('sv2_aguaponto').all()).find(x => x.nome === 'Açude 01'));
  conf(ac && ac.tipo === 'reservatorio' && ac.ativo === true && ac.local === 'Fazenda Jardim', 'cadastrou o açude');
  await p.click('.pa-li[data-id="' + ac.id + '"]'); await esp(p, 400); await p.click('#gv [data-act="pa-ativo"]'); await esp(p, 700);
  conf((await p.evaluate(async id => (await Data.col('sv2_aguaponto').get(id)).ativo, ac.id)) === false && /Inativo/.test(await p.textContent('.pa-li[data-id="' + ac.id + '"]')), 'desativou o ponto (aparece Inativo)');
  conf(await p.evaluate(() => pjPontos().some(x => x.nome.indexOf('Canal 01') === 0) && !pjPontos().some(x => x.nome.indexOf('Açude 01') === 0)), 'ponto inativo sai das listas de projeto e da avulsa');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await p.context().close();

  console.log('Celular (390):');
  const m = await abre(b, 390, 800);
  conf(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'a aba Água não arrasta para o lado');
  for (const v of [2]) {
    await m.evaluate(() => { S._pjMes = ''; }); await m.click('.ag-box[data-id="pc1"] .ag-bq'); await esp(m, 500);
    const r = await m.evaluate(() => ({ s: document.documentElement.scrollWidth <= innerWidth, h: [...document.querySelectorAll('#gv .pj-ac .bt')].map(x => Math.round(x.getBoundingClientRect().height)) }));
    conf(r.s && r.h.every(h => h >= 44), 'calendário no celular: sem rolar para o lado, botões 44 px');
    await m.screenshot({ path: path.join(TELAS, 'v067-cel-cal.png') });
    await fechaTudo(m);
  }
  await m.click('.ag-novo'); await esp(m, 500);
  conf(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'o editor no celular não arrasta para o lado');
  await m.screenshot({ path: path.join(TELAS, 'v067-cel-editor.png') });
  conf(m._er.length === 0, 'sem erros no console (celular)' + (m._er.length ? ': ' + m._er.slice(0, 2).join(' | ') : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
