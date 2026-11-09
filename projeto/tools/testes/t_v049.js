/* EFCwork · suíte da v0.4.9 — desprogramar / reprogramar / novo plano (rodízio) e os ajustes da tabela de 09/11: A-Z em um botão,
   lista do menu que não trava, 1º toque ao trocar de aba, total que não estoura nem leva texto embaixo, Coletores alinhado com a Data.
   Uso: node tools/testes/t_v049.js */
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
async function semearMat(p) {
  await p.evaluate(async () => {
    const h = hojeISO(), mais = n => addDias(h, n), C = Data.col.bind(Data);
    const it = [
      ['luva', { nome: 'Luva nitrílica M', codigo: '7320', un: 'Cx', min: 3, local: 'Porta 12', ativo: true }],
      ['fita', { nome: 'Fita dupla face 19 mm', codigo: '6332', un: 'Un', min: 1, local: 'Porta 11', ativo: true }],
      ['fenol', { nome: 'Fenolftaleína 1%', codigo: '21466', un: 'Un', min: 1, local: 'Geladeira', ativo: true }],
      ['agua', { nome: 'Água desmineralizada 1 L', codigo: '185', un: 'Lt', min: 15, local: 'Porta 02', ativo: true }],
      ['gelo', { nome: 'Gelo em gel 500 g', codigo: '15560', un: 'Un', min: 4, local: 'Geladeira', ativo: true }],
      ['velho', { nome: 'Reagente antigo', codigo: '999', un: 'Un', min: 0, local: 'Porta 02', ativo: false }]];
    for (const [id, o] of it) await C('sv2_alm_itens').set(id, o);
    const mv = (id, o) => C('sv2_alm_mov').set(id, Object.assign({ data: h, criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva', lote: '', validade: '', preco: 0 }, o));
    await mv('m1', { tipo: 'inicial', itemId: 'luva', itemNome: 'Luva nitrílica M', qtd: 5, preco: 29, lote: 'L1', validade: mais(400) });
    await mv('m2', { tipo: 'saida', itemId: 'luva', itemNome: 'Luva nitrílica M', qtd: 4, preco: 29, lotRef: 'm1', motivo: 'Uso no expediente' });
    await mv('m3', { tipo: 'inicial', itemId: 'fenol', itemNome: 'Fenolftaleína 1%', qtd: 2, preco: 10, lote: 'F1', validade: mais(-5) });
    await mv('m4', { tipo: 'inicial', itemId: 'agua', itemNome: 'Água desmineralizada 1 L', qtd: 34, preco: 2.13 });
    await mv('m5', { tipo: 'entrada', itemId: 'gelo', itemNome: 'Gelo em gel 500 g', qtd: 22, preco: 8.29, lote: 'G1', validade: mais(20), doc: 'NF 18342' });
    await mv('m6', { tipo: 'saida', itemId: 'agua', itemNome: 'Água desmineralizada 1 L', qtd: 4, preco: 2.13, lotRef: 'm4', motivo: 'Envio de água p/ Bioagri', anulada: true });
    await C('sv2_alm_sol').set('s1', { numero: '1042', data: h, solicitante: 'Joana', liberador: 'Marcos', situacao: 'pendente', criadoEm: nowISO(), linhas: [{ itemId: 'luva', nome: 'Luva nitrílica M', qtd: 10 }, { itemId: '', nome: 'Ponteira 200 µL', qtd: 5 }] });
    await C('sv2_alm_sol').set('s2', { numero: '1031', data: mais(-30), solicitante: 'Ana', situacao: 'atendida', criadoEm: nowISO(), linhas: [{ itemId: 'agua', nome: 'Água desmineralizada 1 L', qtd: 20 }] });
    await C('sv2_alm_equip').set('e1', { nome: 'pHmetro de bancada', tag: 'PHM-02', marca: 'Hanna', situacao: 'ativo', precisaCal: true, cal: { ultima: addDias(h, -400), freqMeses: 12 }, local: 'Laboratório', posicao: 'Bancada 1' });
    await C('sv2_alm_equip').set('e2', { nome: 'Balança analítica', tag: 'BAL-01', situacao: 'ativo', precisaCal: true, cal: { ultima: addDias(h, -340), freqMeses: 12, resultado: 'aprovado' }, local: 'Laboratório' });
    await C('sv2_alm_equip').set('e3', { nome: 'Termômetro digital', tag: 'TER-05', situacao: 'ativo', precisaCal: true, cal: { ultima: addDias(h, -30), freqMeses: 12 }, local: 'Laboratório' });
    await C('sv2_alm_equip').set('e4', { nome: 'Béquer 250 mL', tipo: 'qtd', situacao: 'ativo', precisaCal: false, qtdLocal: { 'Laboratório': 12 } });
  });
  await p.waitForTimeout(300);
}

async function maisMat(p) {
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), h = hojeISO();
    for (let n = 1; n <= 40; n++) { const id = 'x' + n, loc = 'Prateleira ' + String(n).padStart(2, '0'); await C('sv2_alm_itens').set(id, { nome: 'Item de teste ' + n, codigo: String(5000 + n), un: 'Un', min: 0, local: loc, ativo: true }); }
    await C('sv2_alm_itens').set('caro', { nome: 'Equipamento caro', codigo: '8888', un: 'Un', min: 0, local: 'Porta 02', ativo: true });
    await C('sv2_alm_mov').set('mc', { tipo: 'inicial', itemId: 'caro', itemNome: 'Equipamento caro', qtd: 1000, preco: 2748.8, data: h, criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva', lote: '', validade: '' });
  });
  await p.waitForTimeout(300);
}
const linhas = p => p.$$eval('.tb[data-tb="al-mat"] .tb-t tbody tr[data-id]', l => l.map(x => x.getAttribute('data-id')));
const abre = async (p, k) => { await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="' + k + '"] .tb-hm'); await p.waitForTimeout(150); };
const fecha = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(250); };

const cfOk = async p => { await p.waitForSelector('#cf [data-act="cf-sim"]', { timeout: 3000 }); await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(700); };
const marcadas = p => p.evaluate(() => Array.from(document.querySelectorAll('.pp-ar')).map(e => e.className.split(' ')[1] + ':' + e.querySelector('b').textContent).join(' '));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Desprogramar no plano');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(500);
  conf(/x:RU11/.test(await marcadas(p)) && /p:RU12/.test(await marcadas(p)) && /f:RU14/.test(await marcadas(p)), 'ponto de partida: RU11 atrasada, RU12 programada, RU14 falta');
  await p.click('.pp-ar[data-id="RU12TAI24"]'); await p.waitForTimeout(150);
  conf(await p.isVisible('.pp-bar [data-act="pp-desprog"]') && /Desprogramar 1/.test(await p.textContent('.pp-bar')), 'marcar uma área programada mostra "Desprogramar 1" na barra');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-desprogramar.png') });
  await p.click('.pp-bar [data-act="pp-desprog"]'); await p.waitForTimeout(250);
  conf(/Desprogramar RU12TAI24/.test(await p.textContent('#cf')), 'pede confirmação antes de desprogramar');
  await cfOk(p);
  const r1a = await rz(p, 'r1'), pk = Object.keys(r1a.progs)[0];
  conf(!r1a.progs[pk].RU12TAI24 && !!r1a.progs[pk].RU11TAI24 && !!r1a.progs[pk].RU16TAI24, 'RU12 saiu das programações do plano e as outras ficaram');
  conf(/f:RU12/.test(await marcadas(p)), 'RU12 voltou para "Faltam" e pode ser programada de novo');
  conf((await audit(p, 'desprogramar_plano')).length === 1, 'auditoria desprogramar_plano');

  console.log('— Reprogramar');
  await p.click('.pp-ar[data-id="RU11TAI24"]'); await p.waitForTimeout(150);
  conf(/Reprogramar/.test(await p.textContent('.pp-bar')) && !/>Programar</.test(await p.$eval('.pp-bar', e => e.innerHTML.replace(/\s+/g, ''))), 'só áreas já programadas marcadas: o botão vira "Reprogramar"');
  await p.click('.pp-bar [data-act="pp-prog"]'); await p.waitForTimeout(400);
  const gt = await p.textContent('#gv'); console.log('   gaveta:', gt.replace(/\s+/g, ' ').slice(0, 160));
  conf(/Reprogramar/.test(gt) && /RU11/.test(gt), 'gaveta "Reprogramar" mostra a área');
  const nova = await p.evaluate(() => addDias(hojeISO(), 6));
  await p.evaluate(n => { S.fm.data = n; S.fm.col = 'Marcos'; gvDesenha(true); }, nova);
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-reprogramar.png') });
  await p.click('#gv [data-act="pp-prog-ok"]'); await p.waitForTimeout(700);
  const r1b = await rz(p, 'r1');
  conf(r1b.progs[pk].RU11TAI24.data === nova && r1b.progs[pk].RU11TAI24.coletor === 'Marcos', 'RU11 reprogramada: novo dia e novo coletor gravados no plano');
  conf(/p:RU11/.test(await marcadas(p)), 'RU11 deixou de estar atrasada (agora programada)');

  await p.click('.pp-ar[data-id="RU14TAI24"]'); await p.click('.pp-ar[data-id="RU16TAI24"]'); await p.waitForTimeout(150);
  conf(!/Reprogramar/.test(await p.textContent('.pp-bar')) && /Programar/.test(await p.textContent('.pp-bar')), 'misturar área que falta com programada: o botão fica "Programar"');
  await p.click('.pp-bar [data-act="pp-prog"]'); await p.waitForTimeout(400);
  await p.evaluate(n => { S.fm.data = n; gvDesenha(true); }, nova);
  await p.click('#gv [data-act="pp-prog-ok"]'); await p.waitForTimeout(700);
  const r1m = await rz(p, 'r1');
  conf(r1m.progs[pk].RU14TAI24 && r1m.progs[pk].RU14TAI24.data === nova && r1m.progs[pk].RU16TAI24.data === nova, 'as duas áreas ficaram programadas no mesmo dia (a que já tinha programação recebeu o novo dia)');

  console.log('— Desprogramar na Programação');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  await p.click('[data-tb="pg"] tbody tr:has-text("RU11TAI24")'); await p.waitForTimeout(500);
  conf(await p.isVisible('#gv [data-act="pg-desprog"]'), 'a gaveta da programação tem a lixeira "Desprogramar" no canto de cima');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-gaveta-lixeira.png') });
  await p.click('#gv [data-act="pg-desprog"]'); await p.waitForTimeout(250);
  await cfOk(p);
  const r1c = await rz(p, 'r1');
  conf(!r1c.progs[pk].RU11TAI24 && !(await p.$('#gv')) , 'desprogramar pela gaveta tira do plano e fecha a gaveta');

  console.log('— Novo plano (novo rodízio)');
  conf(await p.isVisible('[data-act="pp-novo"]'), 'botão "Novo plano" na Programação (Líder★/Administrador)');
  await p.click('[data-act="pp-novo"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-novo-plano.png') });
  conf(/Novo plano de coleta/.test(await p.textContent('#gv')), 'gaveta "Novo plano de coleta" abre');
  await p.click('#gv [data-act="pp-novo-ok"]'); await p.waitForTimeout(300);
  conf(/Já existe/.test(await gmsg(p)), 'mesmo tipo + frequência + ano já existente: avisa e não cria');
  await dd(p, 'lc:ppnvtipo', 'FOLHA'); await p.waitForTimeout(150);
  await dd(p, 'lc:ppnvfreq', 'Trimestral'); await p.waitForTimeout(150);
  await p.evaluate(() => { S.fm.areas = []; gvDesenha(true); });
  await p.click('#gv [data-act="pp-novo-ok"]'); await p.waitForTimeout(250);
  conf(/pelo menos uma área/.test(await gmsg(p)), 'sem áreas: pede para marcar');
  await p.click('#gv .pp-nv[data-id="RU11TAI24"]'); await p.click('#gv .pp-nv[data-id="RU12TAI24"]'); await p.waitForTimeout(150);
  await p.evaluate(() => { S.fm.ans = []; gvDesenha(true); });
  await p.click('#gv [data-act="pp-novo-ok"]'); await p.waitForTimeout(250);
  conf(/pelo menos uma análise/.test(await gmsg(p)), 'sem análises: pede para marcar');
  await p.click('#gv .pp-nv[data-act="pp-nvan"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:ppnvfreq', 'Quinzenal'); await p.waitForTimeout(150);
  await p.click('#gv [data-act="pp-novo-ok"]'); await p.waitForTimeout(250);
  conf(/segunda-feira/.test(await gmsg(p)), 'quinzenal sem a primeira segunda-feira: pede a data');
  await dd(p, 'lc:ppnvfreq', 'Trimestral'); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-novo-plano-pronto.png') });
  await p.click('#gv [data-act="pp-novo-ok"]'); await p.waitForTimeout(900);
  const novos = await p.evaluate(() => JSON.parse(JSON.stringify(S.rodizios.filter(r => r.tipo === 'FOLHA' && r.id !== 'r9'))));
  conf(novos.length === 1 && novos[0].freq === 'T' && novos[0].areas.join() === 'RU11TAI24,RU12TAI24' && novos[0].analiseIds.length === 1 && novos[0].ativo === true && novos[0].progs && Object.keys(novos[0].progs).length === 0, 'plano FOLHA trimestral criado com 2 áreas, 1 análise, sem programações');
  conf(await p.evaluate(() => location.hash.indexOf('#/coletas/plano/') === 0 && location.hash.indexOf('r1') < 0), 'abre a página do plano novo logo depois de criar');
  conf((await audit(p, 'criar_rodizio')).length === 1, 'auditoria criar_rodizio');
  conf(await p.evaluate(() => document.querySelectorAll('.pp-ar.f').length === 2), 'as 2 áreas aparecem em "Faltam" no plano novo');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-plano-novo.png') });

  console.log('— Permissão');
  await entra(p, 'ana.lima');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  conf(!(await p.$('[data-act="pp-novo"]')), 'Colaborador não vê "Novo plano"');
  await entra(p, 'joana.silva');

  console.log('— Coletado: Coletores alinhado com a Data');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  await p.click('[data-act="pg-cd"]'); await p.waitForTimeout(400);
  const al = await p.evaluate(() => { const cs = Array.from(document.querySelectorAll('#gv .fm-c')), d = cs.find(c => /Data da coleta/.test(c.textContent) && /Coletores/.test(c.parentElement.textContent)), c = cs.find(x => /^Coletores/.test(x.textContent.trim())); if (!d || !c) return null; const rd = d.querySelector('.fm-r').getBoundingClientRect(), rc = c.querySelector('.fm-r').getBoundingClientRect(), fd = d.children[1].getBoundingClientRect(), fc = c.children[1].getBoundingClientRect(); return { rot: Math.abs(rd.top - rc.top), campo: Math.abs(fd.top - fc.top) }; });
  console.log('   alinhamento:', JSON.stringify(al));
  conf(al && al.rot < 1.5 && al.campo < 1.5, 'Data da coleta e Coletores começam na mesma altura (rótulo e campo)');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-coletado.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  console.log('— Tabela: lista do menu não trava');
  await semearMat(p); await maisMat(p);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(500);
  await abre(p, 'loc');
  const info = await p.evaluate(() => { const l = document.querySelector('.tb-mn-l'); return { alt: l.clientHeight, tot: l.scrollHeight }; });
  conf(info.tot > info.alt + 100, 'a lista de valores tem rolagem própria (' + info.tot + ' > ' + info.alt + ')');
  await p.evaluate(() => { document.querySelector('.tb-mn-l').scrollTop = 300; }); await p.waitForTimeout(200);
  await p.click('.tb-mn-li:has-text("Prateleira 10") input'); await p.waitForTimeout(300);
  const s1 = await p.evaluate(() => document.querySelector('.tb-mn-l').scrollTop);
  conf(s1 > 200, 'ao desmarcar, a lista continua onde estava (rolagem ' + Math.round(s1) + ')');
  await p.evaluate(() => { document.querySelector('.tb-mn-l').scrollTop = 80; }); await p.waitForTimeout(400);
  const s2 = await p.evaluate(() => document.querySelector('.tb-mn-l').scrollTop);
  conf(Math.abs(s2 - 80) < 3, 'depois de desmarcar a lista rola livre (não volta ao ponto antigo): ' + Math.round(s2));
  const bx = await (await p.$('.tb-mn-l')).boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.wheel(0, 120); await p.waitForTimeout(300);
  const s3 = await p.evaluate(() => document.querySelector('.tb-mn-l').scrollTop);
  conf(s3 > s2 + 40, 'a roda do mouse continua rolando a lista: ' + Math.round(s3));
  await p.click('.tb-mn-li:has-text("Prateleira 11") input'); await p.waitForTimeout(300);
  conf((await p.$$('.tb-mn-li:not(.tb-mn-all) input:not(:checked)')).length === 2, 'dá para desmarcar um segundo valor em seguida');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-menu-lista.png') });

  console.log('— Tabela: trocar de aba com o menu aberto');
  const h0 = await p.evaluate(() => location.hash);
  await p.click('a[href^="#/almox/"]:not([href="#/almox/materiais"]) >> nth=0'); await p.waitForTimeout(500);
  const h1 = await p.evaluate(() => location.hash);
  conf(h1 !== h0 && !(await p.$('.tb-mn')), 'um único toque na outra aba: a tela muda e o menu some (antes travava no 1º toque)');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(400);
  conf(!(await p.$('.tb-mn')), 'voltando para a tabela o menu não reaparece');
  await abre(p, 'loc'); await p.click('.tb-cab th[data-tbk="nome"] .tb-thr', { position: { x: 4, y: 4 } }).catch(() => {}); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !!document.querySelector('.tb-mn') && document.querySelector('.tb-mn').getAttribute('data-k') === 'nome'), 'tocar noutra coluna com o menu aberto abre o menu dela (1 toque)');
  await fecha(p);

  console.log('— Tabela: total e A-Z');
  const tt = await p.evaluate(() => { const tb = document.querySelector('.tb[data-tb="al-mat"]'), t = tb.querySelector('.tb-tots'), tv = t.querySelector('.tb-tv'), lb = t.querySelector('.tb-tl'), b = tv.querySelector('b'), r = tv.getBoundingClientRect(), l = lb.getBoundingClientRect(), th = tb.querySelector('.tb-cab th[data-tbk="val"]').getBoundingClientRect(); return { txt: b.textContent, cabe: b.scrollWidth <= tv.clientWidth + 1, semSobrepor: l.right <= r.left, direita: Math.abs(r.right - th.right) < 2, texto: t.innerText.replace(/\s+/g, ' '), small: !!t.querySelector('small') , larg: Math.round(r.width), col: Math.round(th.width) }; });
  console.log('   total:', JSON.stringify(tt));
  conf(tt.cabe && tt.semSobrepor && tt.direita, 'valor grande cabe na caixa, não passa por cima de "Total" e fica alinhado à direita da coluna');
  conf(!tt.small && /^Total R\$/.test(tt.texto), 'sem texto embaixo de "Total"');
  const tg = await p.evaluate(() => { const tb = document.querySelector('.tb[data-tb="al-mat"]'), t = tb.querySelector('.tb-tots'), tv = t.querySelector('.tb-tv'), b = tv.querySelector('b'), lb = t.querySelector('.tb-tl'), th = tb.querySelector('.tb-cab th[data-tbk="val"]'); b.textContent = 'R$ 12.345.678.901,80'; tbAlinhaTot(); const r = tv.getBoundingClientRect(), l = lb.getBoundingClientRect(), c = th.getBoundingClientRect(); return { cabe: b.scrollWidth <= tv.clientWidth + 1, semSobrepor: l.right <= r.left + 0.5 || t.classList.contains('tb-tots-fluxo'), direita: Math.abs(r.right - c.right) < 2 || t.classList.contains('tb-tots-fluxo'), cresceu: r.width > c.width }; });
  conf(tg.cabe && tg.semSobrepor && tg.direita, 'número bem maior que a coluna: caixa cresce para a esquerda sem tocar em "Total"' + JSON.stringify(tg));
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-total.png') });
  await p.evaluate(() => render());  await p.waitForTimeout(300);
  await abre(p, 'nome');
  const t0 = await p.textContent('.tb-mn-ci');
  await p.click('.tb-mn-ci'); await p.click('.tb-mn-ci'); await p.click('.tb-mn-ci'); await p.waitForTimeout(150);
  conf(/Ordem padrão/.test(t0) && /Ordem padrão/.test(await p.textContent('.tb-mn-ci')) && (await p.$$('.tb-mn-o')).length <= 2, 'A-Z é um botão só: três toques voltam ao padrão');
  await p.screenshot({ path: path.join(SHOTS, 'v049-pc-menu-ordenar.png') });
  await fecha(p);

  console.log('— Celular');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(400);
  await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-thr'); await p.waitForTimeout(350);
  conf(await p.isVisible('.tb-mn') && await p.isVisible('.tb-mn-fundo'), 'celular: menu em folha com fundo escuro');
  await p.screenshot({ path: path.join(SHOTS, 'v049-cel-menu.png') });
  await p.mouse.click(195, 40); await p.waitForTimeout(500);
  conf(!(await p.$('.tb-mn')), 'celular: tocar no fundo fecha o menu');
  await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-thr'); await p.waitForTimeout(300);
  await p.goBack(); await p.waitForTimeout(500);
  conf(!(await p.$('.tb-mn')), 'celular: botão voltar fecha o menu');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);
  await p.click('[data-act="pp-novo"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHOTS, 'v049-cel-novo-plano.png') });
  conf(/Novo plano de coleta/.test(await p.textContent('#gv')) && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: "Novo plano" abre sem rolagem lateral');

  conf(erros.length === 0, 'sem erros no console' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
