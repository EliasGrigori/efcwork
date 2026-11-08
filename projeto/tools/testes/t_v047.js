/* EFCwork · suíte da v0.4.7 — programações do plano no formato do EFClaudian (sv2_rodizio.progs), aba Ajustes
   (análises, áreas, encerrar período com cancelamento das programações abertas, recoleta direta e por pedido),
   sugestão de renovar no sino e as correções do retorno do Grok (login sem @, linha Total). Modo demonstração.
   Uso: node tools/testes/t_v047.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
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
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Programações do plano gravadas pelo EFClaudian (dentro do plano)');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(500);
  const est = await p.evaluate(() => Array.from(document.querySelectorAll('.pp-ar')).map(e => e.className.split(' ')[1] + ':' + e.querySelector('b').textContent).join(' '));
  console.log('   áreas:', est);
  conf(/x:RU11/.test(est) && /p:RU12/.test(est) && /p:RU16/.test(est) && /c:RU13/.test(est) && /f:RU14/.test(est), 'a página do plano lê as programações de dentro do plano: RU11 atrasada, RU12 e RU16 (sem dia) programadas, RU13 coletada');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  const tab = await p.evaluate(() => Array.from(document.querySelectorAll('[data-tb="pg"] tbody tr')).map(t => t.textContent).join(' || '));
  conf(/RU11TAI24.*Plano.*Atrasada/.test(tab) && /RU12TAI24.*Plano/.test(tab), 'a tabela da Programação mostra as programações do plano (origem Plano, situação)');
  conf(!/RU16TAI24/.test(tab), 'programação sem dia fica só no plano (igual às outras)');
  conf(await p.evaluate(() => /SOLO\+RAIZ/.test(document.querySelector('a.pg-pl[href="#/coletas/plano/r1"]').textContent) && document.querySelectorAll('a.pg-pl[href="#/coletas/plano/r1"] .pg-ar.x').length === 1), 'o cartão do plano também mostra a atrasada');
  /* Coletado pela Programação numa programação do plano: amostra sem progId e nada em sv2_prog */
  await p.click('[data-act="pg-cd"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { const b = Array.from(document.querySelectorAll('#gv [data-act="pg-ck"], #gv [data-act="pg-cdck"], #gv .pp-ar, #gv button')).find(x => /RU11/.test(x.textContent) && x.getAttribute('data-act')); if (b) b.click(); });
  await p.waitForTimeout(200);
  const marcou = await p.evaluate(() => Object.keys(S.fm && S.fm.sel || {}).filter(k => S.fm.sel[k]));
  console.log('   marcadas no Coletado:', marcou.join(', '));
  if (!marcou.length) await p.evaluate(() => { const id = pgPendentes().find(x => x.talhao === 'RU11TAI24').id; S.fm.sel[id] = true; gvDesenha(true); });
  await p.evaluate(() => { S.fm.prof = '0-20'; S.fm.data = hojeISO(); gvDesenha(true); });
  await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(800);
  const am = await p.evaluate(() => S.coletas.filter(c => c.talhao === 'RU11TAI24').map(c => c.tipo + '/' + (c.progId || 'sem progId')).sort().join(' '));
  console.log('   amostras RU11:', am, '| sv2_prog:', await p.evaluate(() => (S.prog || []).length));
  conf(am === 'NEMATOIDE/sem progId SOLO/sem progId' && await p.evaluate(() => (S.prog || []).length === 0), 'Coletado numa programação do plano: Solo + Nematoide sem progId e nada gravado em sv2_prog (igual ao EFClaudian)');
  conf((await audit(p, 'coletado_plano')).length === 1, 'auditoria coletado_plano');

  console.log('— Aba Ajustes');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(500);
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('.pp-abas button')).map(b => b.textContent).join('|') === 'Áreas|Ajustes'), 'abas "Áreas · Ajustes" na página do plano');
  await p.click('.pp-abas [data-v="aj"]'); await p.waitForTimeout(300);
  const blocos = await p.evaluate(() => Array.from(document.querySelectorAll('.pp-bl h3')).map(h => h.firstChild.textContent.trim()).join('|'));
  conf(blocos === 'Plano|Áreas|Período|Recoletas', 'quatro blocos separados: Plano, Áreas, Período, Recoletas');
  conf(await p.evaluate(() => !document.querySelector('.pp-bar') && !/Renovar/.test(document.querySelector('.pp-aj').textContent)), 'sem barra de seleção e sem botão Renovar (renovar fica no sino)');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-ajustes.png'), fullPage: true });

  console.log('— Plano: análises');
  conf(await p.evaluate(() => document.querySelector('[data-act="pp-an-ok"]').disabled), 'Salvar análises começa desligado');
  await p.click('.pp-li:has([data-pp-an="a6"])'); await p.waitForTimeout(100);
  conf(await p.evaluate(() => !document.querySelector('[data-act="pp-an-ok"]').disabled), 'marcar "Micronutrientes" liga o Salvar');
  await p.click('[data-act="pp-an-ok"]'); await p.waitForTimeout(500);
  conf(((await rz(p, 'r1')).analiseIds || []).join() === 'a1,a2,a6', 'análises salvas no plano (a1, a2, a6)');
  conf((await audit(p, 'alterar_rodizio')).some(x => /análises: Solo completo, Nematoide, Micronutrientes/.test(x)), 'auditoria alterar_rodizio (formato do EFClaudian)');

  console.log('— Áreas');
  conf(await p.evaluate(() => document.querySelector('[data-pp-ar="RU13TAI24"]').disabled && /não sai/.test(document.querySelector('.pp-li:has([data-pp-ar="RU13TAI24"])').textContent)), 'área coletada no período: caixinha travada ("não sai")');
  await p.fill('[data-pp-busca]', 'RU17'); await p.waitForTimeout(100);
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('.pp-lim .pp-li')).filter(l => !l.hidden).map(l => l.querySelector('b').textContent).join() === 'RU17TAI24'), 'busca filtra a lista de áreas');
  await p.click('.pp-li:has([data-pp-ar="RU17TAI24"])'); await p.fill('[data-pp-busca]', ''); await p.waitForTimeout(100);
  await p.click('.pp-li:has([data-pp-ar="RU12TAI24"])'); await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-areas-marcadas.png') });
  conf(await p.evaluate(() => /a programação é cancelada/.test(document.querySelector('.pp-li:has([data-pp-ar="RU12TAI24"])').textContent) && /7 no plano/.test(document.querySelector('.pp-bl:nth-child(2) h3').textContent) === false), 'tirar área programada avisa que a programação é cancelada');
  await p.click('[data-act="pp-ar-ok"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-areas-confirma.png') });
  conf(await p.evaluate(() => /Tirar 1 área/.test(document.querySelector('#cf').textContent) && /1 tem programação/.test(document.querySelector('#cf').textContent)), 'confirmação: "Tirar 1 área(s) do plano?" com a programação');
  await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(600);
  const r1 = await rz(p, 'r1'), pk1 = Object.keys(r1.progs)[0];
  conf(r1.areas.indexOf('RU17TAI24') >= 0 && r1.areas.indexOf('RU12TAI24') < 0 && !r1.progs[pk1].RU12TAI24 && !!r1.progs[pk1].RU16TAI24, 'RU17 entrou, RU12 saiu e a programação dela foi tirada do plano');
  conf((await audit(p, 'alterar_rodizio')).some(x => /entrou: RU17TAI24; saiu: RU12TAI24; 1 programação/.test(x)), 'auditoria das áreas (entrou, saiu, programação cancelada)');

  console.log('— Recoleta (Líder/Administrador: direto)');
  await dd(p, 'pp:rec:r1', 'RU13TAI24');
  conf(await p.evaluate(() => /Liberar recoleta/.test(document.querySelector('#gv h2, #gv .gv-t, #gv').textContent) && /2 amostra/.test(document.querySelector('#gv').textContent)), 'escolher a área abre a gaveta "Liberar recoleta" com as amostras da coleta');
  await p.click('#gv [data-act="pp-rec-ok"]'); await p.waitForTimeout(200);
  conf(/Escolha o motivo/.test(await gmsg(p)), 'sem motivo: avisa');
  await dd(p, 'lc:ppmot', 'Outro (escrever)'); await p.click('#gv [data-act="pp-rec-ok"]'); await p.waitForTimeout(200);
  conf(/Escreva o motivo/.test(await gmsg(p)), '"Outro" pede o motivo escrito');
  await dd(p, 'lc:ppmot', 'Amostra perdida ou danificada'); await p.fill('#gv [data-fm="det"]', 'chegou aberta');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-recoleta-gaveta.png') }); await p.click('#gv [data-act="pp-rec-ok"]'); await p.waitForTimeout(600);
  const lib = (await rz(p, 'r1')).liberadas;
  const lk = Object.keys(lib)[0];
  conf(lk && lib[lk].RU13TAI24 && lib[lk].RU13TAI24.motivo === 'Amostra perdida ou danificada: chegou aberta' && lib[lk].RU13TAI24.por === 'Joana Silva' && lib[lk].RU13TAI24.aprovadoPor === '', 'gravou liberadas[período][área] no formato do EFClaudian');
  conf((await audit(p, 'recoleta_rodizio')).some(x => /Recoleta liberada: RU13TAI24 no \d{4}-S\d .*Amostra perdida/.test(x)), 'auditoria recoleta_rodizio');
  conf(await p.evaluate(() => /RU13TAI24/.test(document.querySelector('.pp-tb').textContent) && /chegou aberta/.test(document.querySelector('.pp-tb').textContent)), 'a recoleta aparece na tabela do bloco Recoletas');
  await p.click('.pp-abas [data-v="areas"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-recoleta-area.png') });
  conf(await p.evaluate(() => { const e = document.querySelector('.pp-ar[data-id="RU13TAI24"]'); return e && e.classList.contains('f') && !!e.querySelector('.pp-rc'); }), 'RU13 volta para Faltam com o sinal de recoleta');
  conf(await p.evaluate(() => S.coletas.filter(c => c.talhao === 'RU13TAI24').length === 2), 'a coleta anterior não é apagada');
  conf(await p.evaluate(() => rzBarrar('SOLO', 'RU13TAI24', hojeISO()) === ''), 'a trava libera nova coleta da área');

  console.log('— Recoleta (Colaborador: pedido)');
  await entra(p, 'ana.lima');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; S._ppAba = { r1: 'aj' }; render(); }); await p.waitForTimeout(500);
  conf(await p.evaluate(() => !document.querySelector('[data-act="pp-an-ok"]') && !document.querySelector('[data-act="pp-enc"]') && document.querySelector('[data-pp-ar="RU14TAI24"]').disabled), 'colaborador vê os ajustes, mas não salva plano nem encerra');
  await dd(p, 'pp:rec:r1', 'RU11TAI24');
  conf(await p.evaluate(() => /Pedir recoleta/.test(document.querySelector('#gv').textContent)), 'colaborador: a gaveta vira "Pedir recoleta"');
  await dd(p, 'lc:ppmot', 'Erro de envio');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-recoleta-pedido.png') }); await p.click('#gv [data-act="pp-rec-ok"]'); await p.waitForTimeout(700);
  const ped = await p.evaluate(() => S.aprov.filter(a => a.tipo === 'recoleta_plano').map(a => a.status + '|' + a.refId + '|' + a.titulo));
  console.log('   pedido:', ped.join(' '));
  conf(ped.length === 1 && /^pendente\|r1:\d{4}-S\d:RU11TAI24\|Recoleta de RU11TAI24/.test(ped[0]), 'virou pedido (sv2_aprov tipo recoleta_plano) para o superior');
  conf(await p.evaluate(() => /aguardando confirmação/.test(document.querySelector('.pp-tb').textContent) && !Array.from(document.querySelectorAll('[data-dd="pp:rec:r1"] li')).some(l => /RU11/.test(l.textContent))), 'o pedido aparece como "aguardando confirmação" e a área sai da lista');
  await entra(p, 'joana.silva');
  await p.evaluate(() => snAbrir()); await p.waitForTimeout(400);
  conf(await p.evaluate(() => /Recoleta de RU11TAI24/.test(document.querySelector('#gv').textContent)), 'o pedido chega no sino de quem confirma');
  await p.evaluate(() => { const b = Array.from(document.querySelectorAll('#gv .sn-pd')).find(x => /Recoleta de RU11/.test(x.textContent)).querySelector('[data-act="sn-apr"]'); b.click(); }); await p.waitForTimeout(800);
  const l2 = (await rz(p, 'r1')).liberadas[lk].RU11TAI24;
  conf(l2 && l2.motivo === 'Erro de envio' && l2.por === 'Ana Lima' && l2.aprovadoPor === 'Joana Silva', 'confirmado no sino: grava a recoleta com quem pediu e quem confirmou');

  console.log('— Renovar: sugestão no sino');
  conf(await p.evaluate(() => /Sugestões/.test(document.querySelector('#gv').textContent) && /Renovar FOLHA · trimestral · \d{4} para \d{4}\?/.test(document.querySelector('#gv').textContent)), 'o sino sugere renovar o plano do ano que acabou');
  conf(await p.evaluate(() => !/Renovar SOLO\+RAIZ/.test(document.querySelector('#gv').textContent)), 'o plano deste ano só é sugerido a partir de 1º de dezembro');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-sino-renovar.png') });
  await p.click('#gv [data-act="sn-ren"]'); await p.waitForTimeout(700);
  const novo = await p.evaluate(() => { const r9 = S.rodizios.find(x => x.id === 'r9'); const n = S.rodizios.find(x => x.renovadoDe === 'r9'); return n ? [n.nome, n.ano, n.tipo, n.freq, n.areas.join(','), n.analiseIds.join(','), n.ativo, String(Number(r9.ano) + 1)].join('|') : ''; });
  console.log('   novo plano:', novo);
  conf(/^FOLHA · trimestral · (\d{4})\|\1\|FOLHA\|T\|RU17TAI24,RU18TAI24\|a3\|true\|\1$/.test(novo), 'Renovar cria a cópia para o ano seguinte (mesmas áreas, análises e frequência)');
  conf(await p.evaluate(() => !/Renovar FOLHA/.test(document.querySelector('#gv').textContent)), 'depois de renovar, a sugestão some');
  conf((await audit(p, 'criar_rodizio')).some(x => /renovação de FOLHA/.test(x)), 'auditoria criar_rodizio (renovação)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  console.log('— Encerrar período');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; S._ppAba = { r1: 'aj' }; render(); }); await p.waitForTimeout(500);
  await p.click('[data-act="pp-enc"]'); await p.waitForTimeout(400);
  const ge = await p.evaluate(() => document.querySelector('#gv').textContent);
  conf(/Encerrar \d+º semestre/.test(ge) && /Por que cada área ficou sem coleta/.test(ge), 'gaveta "Encerrar Nº semestre" pede o motivo de cada área que faltou');
  await p.click('#gv [data-act="pp-enc-ok"]'); await p.waitForTimeout(200);
  conf(/Escreva o motivo de/.test(await gmsg(p)), 'sem motivo: avisa quais áreas faltam');
  const faltam = await p.evaluate(() => Array.from(document.querySelectorAll('#gv [data-fm^="m_"]')).map(i => i.getAttribute('data-fm')));
  for (const f of faltam) await p.fill('#gv [data-fm="' + f + '"]', 'chuva no período');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-encerrar-gaveta.png') });
  await p.click('#gv [data-act="pp-enc-ok"]'); await p.waitForTimeout(300);
  const cf = await p.evaluate(() => (document.querySelector('#cf') || {}).textContent || '');
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-encerrar-confirma.png') });
  console.log('   confirmação:', cf.replace(/\s+/g, ' ').slice(0, 170));
  conf(/Cancelar a programação aberta/.test(cf) && /Cancelar todas e encerrar/.test(cf) && /RU16TAI24/.test(cf) && !/RU11/.test(cf), 'com programação aberta, abre o aviso pedindo para cancelar todas (a de antes da recoleta não conta)');
  await p.click('#cf [data-act="cf-nao"]'); await p.waitForTimeout(200);
  conf(!((await rz(p, 'r1')).fechados || {})[lk] && await p.evaluate(() => !!document.querySelector('#gv')), '"Voltar" não encerra e mantém a gaveta');
  await p.click('#gv [data-act="pp-enc-ok"]'); await p.waitForTimeout(300); await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(800);
  const fc = (await rz(p, 'r1')).fechados[lk];
  conf(fc && fc.porNome === 'Joana Silva' && fc.snap.length === 6 && fc.snap.every(s => s.st === 'falta' || s.st === 'coletada') && fc.snap.some(s => s.area === 'RU11TAI24' && s.st === 'falta') && Object.keys(fc.motivos).length === faltam.length && Object.values(fc.motivos).every(m => m === 'CHUVA NO PERÍODO'), 'gravou fechados[período] = {ts, porNome, snap, motivos} (formato do EFClaudian)');
  conf((await audit(p, 'encerrar_rodizio')).some(x => /Encerrou o \d+º semestre \d{4} do plano de coleta SOLO\+RAIZ.*% coletado · sem coleta: .*CHUVA NO PERÍODO.*1 programação/.test(x)), 'auditoria encerrar_rodizio');
  conf(await p.evaluate(() => /Encerrado em/.test(document.querySelector('.pp-aj').textContent) && !document.querySelector('[data-act="pp-enc"]') && !document.querySelector('[data-dd="pp:rec:r1"]')), 'o bloco Período mostra "Encerrado em…" e some o Encerrar e a recoleta');
  conf(await p.evaluate(() => { const r = S.rodizios.find(x => x.id === 'r1'); return /foi encerrado/.test(rzBarrar('SOLO', 'RU14TAI24', hojeISO())); }), 'período encerrado: a trava não aceita mais coleta');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => pgTodas().some(x => x._rz && x.talhao === 'RU16TAI24' && x.situacao === 'cancelada' && x.canceladaMotivo === 'Período encerrado') && !pgPendentes().some(x => x._rz && x._rz.r.id === 'r1')), 'as programações abertas do período ficam canceladas ("Período encerrado")');

  console.log('— Retorno do Grok');
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.fill('#en-login', 'fulano2099gmail.com'); await p.fill('#en-senha', 'x123'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-login-sem-arroba.png') });
  conf(await p.evaluate(() => /sem o @/.test(document.body.textContent) && /incorretos/.test(document.body.textContent)), 'login sem @ não é barrado antes: tenta, e só depois de falhar avisa do @');

  console.log('— Celular e tema escuro');
  await entra(p, 'joana.silva').catch(() => {});
  if (!(await p.evaluate(() => !!S.user))) { await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(800); }
  await p.evaluate(() => { const r = S.rodizios.find(x => x.renovadoDe === 'r9'); location.hash = '#/coletas/plano/r1'; S._ppAba = { r1: 'aj' }; render(); }); await p.waitForTimeout(400);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: sem rolagem para o lado');
  conf(await p.evaluate(() => { const l = document.querySelectorAll('.pp-bl'); return l.length === 4 && l[0].getBoundingClientRect().width === l[1].getBoundingClientRect().width && l[1].getBoundingClientRect().top > l[0].getBoundingClientRect().bottom - 1; }), 'celular: os blocos ficam um embaixo do outro');
  await p.screenshot({ path: path.join(SHOTS, 'v047-cel-ajustes.png'), fullPage: true });
  await p.evaluate(() => { document.documentElement.setAttribute('data-tema', 'escuro'); }); await p.setViewportSize({ width: 1366, height: 860 }); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(SHOTS, 'v047-pc-ajustes-escuro.png'), fullPage: true });

  conf(!erros.length, 'sem erro de JavaScript' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  console.log('t_v047: ' + ok + ' ok · ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
