/* EFCwork · suíte da v0.3.3 — calibração com histórico: nova solicitação (marcar equipamentos, prestador), cotação, agendar e
   reagendar, calibrado (quem calibrou, código do certificado, validade, resultado), compra que encerra, histórico só do equipamento,
   cancelar, celular. Tudo no modo demonstração. Uso: node tools/testes/t_v033.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
async function semear(p) {
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


const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(80); };
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const titulo = p => p.evaluate(() => { const h = document.querySelector('#gv h2'); return h ? h.textContent : ''; });
const volta = async p => { await p.evaluate(() => history.back()); await p.waitForTimeout(250); };
const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(250); };
async function arrasta(p, nome, txt) {
  await p.click('[data-dd="' + nome + '"] .dd-b'); await p.waitForTimeout(80);
  const li = await p.$('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); const b = await li.boundingBox();
  await p.mouse.move(b.x + 20, b.y + b.height / 2); await p.mouse.down(); await p.waitForTimeout(1650);
  const lx = await p.$('.dd-lixo'); if (!lx) { await p.mouse.up(); return false; }
  const r = await lx.boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(200); return r;
}
async function entra(p, login) { await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300); await p.fill('#en-login', login); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700); }
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  await semear(p);
  await p.evaluate(async () => { const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: { almox: true } }); });
  await p.waitForTimeout(150);

  console.log('— Abrir a solicitação');
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(150);
  conf(/Calibração/.test(await p.textContent('.cs-acts')), 'Equipamentos: botão Calibração no cabeçalho');
  await p.click('.cs-acts a[href="#/almox/calibracao"]'); await p.waitForTimeout(200);
  const kp = await p.$$eval('.kps .kp b', l => l.map(x => x.textContent));
  conf(kp.join(',') === '1,1,0,2', 'números: 1 vencida, 1 a vencer, 0 em andamento, 2 precisam e não estão em solicitação (' + kp.join(',') + ')');
  conf(/Equipamentos/.test(await p.textContent('.cs-abas .on')), 'a aba Equipamentos fica marcada (calibração é uma ação dela)');
  await p.click('[data-act="cb-nova"]'); await p.waitForTimeout(150);
  const lst = await p.$$eval('#gv .cb-ck', l => l.map(x => x.textContent));
  conf(lst.length === 3 && /PHM-02/.test(lst[0]) && /BAL-01/.test(lst[1]), 'lista: vencidas primeiro, depois a vencer; vidraria fora do plano não aparece (' + lst.length + ')');
  await p.click('[data-act="cb-nova-ok"]'); await p.waitForTimeout(80);
  conf(/Marque pelo menos um/.test(await msg(p)), 'sem marcar: "Marque pelo menos um equipamento"');
  await p.click('[data-act="cb-marca-venc"]'); await p.waitForTimeout(100);
  conf(await p.evaluate(() => Object.keys(S.fm.sel).filter(k => S.fm.sel[k]).sort().join() === 'e1,e2'), '"Marcar vencidos e a vencer" marca PHM-02 e BAL-01');
  await p.fill('#gv [data-fm="prestTxt"]', 'Labor Metrologia'); await p.fill('#gv [data-fm="obs"]', 'Urgente: pHmetro vencido');
  await p.click('[data-act="cb-nova-ok"]'); await p.waitForTimeout(400);
  const c1 = await p.evaluate(() => { const c = S.almCal[0]; return c && { n: c.numero, p: c.prestador, it: c.itens.map(i => i.tag).join(), sit: cbSit(c), q: c.criadoPorNome }; });
  conf(c1 && /^CAL-\d{4}-01$/.test(c1.n) && c1.p === 'LABOR METROLOGIA' && c1.it === 'PHM-02,BAL-01' && c1.sit === 'aberta', 'solicitação ' + (c1 && c1.n) + ' aberta no formato do EFClaudian (prestador, itens, aguardando cotação)');
  conf(await p.evaluate(() => S.gv && /CAL-/.test(document.querySelector('#gv h2').textContent) && !S.gvForm), 'depois de abrir, mostra o detalhe da solicitação');
  const et = await p.$$eval('#gv .cb-tl li', l => l.map(x => x.className.trim() + ':' + x.querySelector('b').firstChild.textContent.trim()));
  conf(et.join('|') === 'ok:Solicitada|at:Cotação recebida|:Agendada|:Calibrada|:Compra do serviço', 'as 5 etapas: Solicitada (feita) → Cotação recebida (próxima) → Agendada → Calibrada → Compra');
  conf(/Joana Silva/.test(await p.textContent('#gv .cb-tl li:first-child')), 'Solicitada mostra a data, o número e quem pediu');
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-claro-aberta.png') });

  console.log('— Cotação e agenda');
  await p.click('#gv [data-act="cb-cot"]'); await p.waitForTimeout(150);
  await p.fill('#gv [data-fm="v.0"]', '180,00'); await p.fill('#gv [data-fm="v.1"]', '250'); await p.fill('#gv [data-fm="ref"]', 'ORC-778');
  await p.click('[data-act="cb-cot-ok"]'); await p.waitForTimeout(350);
  conf(await p.evaluate(() => { const c = S.almCal[0]; return c.cotacaoEm === hojeISO() && c.cotacaoRef === 'ORC-778' && c.itens[0].valor === 180 && c.itens[1].valor === 250 && cbSit(c) === 'cotada'; }), 'cotação: data, referência e valor de cada um (R$ 430,00) → "Cotada · falta agendar"');
  conf(/R\$ 430,00/.test(await p.textContent('#gv .cb-tl')), 'a etapa mostra o valor total e volta para o detalhe');
  await p.click('#gv [data-act="cb-ag"]'); await p.waitForTimeout(150);
  const d1 = await p.evaluate(() => addDias(hojeISO(), 5)), d2 = await p.evaluate(() => addDias(hojeISO(), 7));
  await p.fill('#gv [data-fm="data"]', d1); await p.fill('#gv [data-fm="obs"]', 'Técnico vem às 8h'); await p.click('[data-act="cb-ag-ok"]'); await p.waitForTimeout(350);
  conf(await p.evaluate(d => { const c = S.almCal[0]; return c.agenda.data === d && cbSit(c) === 'agendada'; }, d1), 'agendada (data futura permitida) → "Agendada para …"');
  await p.click('#gv [data-act="cb-ag"]'); await p.waitForTimeout(150); await p.fill('#gv [data-fm="data"]', d2); await p.click('[data-act="cb-ag-ok"]'); await p.waitForTimeout(350);
  conf(await p.evaluate(([a, b2]) => { const c = S.almCal[0]; return c.agenda.data === b2 && c.agendaHist.length === 1 && c.agendaHist[0].data === a; }, [d1, d2]), 'reagendar guarda a data antiga no histórico');
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-claro-agendada.png') });

  console.log('— Calibrado');
  await p.click('#gv [data-act="cb-real"]'); await p.waitForTimeout(150);
  await p.click('[data-act="cb-real-ok"]'); await p.waitForTimeout(80);
  conf(/quem calibrou/.test(await msg(p)), 'pede quem calibrou');
  await p.fill('#gv [data-fm="tecnico"]', 'Carlos Mendes');
  await p.click('[data-act="cb-real-ok"]'); await p.waitForTimeout(80);
  conf(/código do certificado/.test(await msg(p)), 'sem nenhum certificado: pede o código');
  const ontem = await p.evaluate(() => addDias(hojeISO(), -1));
  await p.fill('#gv [data-fm="data"]', ontem); await p.dispatchEvent('#gv [data-fm="data"]', 'change'); await p.waitForTimeout(120);
  const valSug = await p.inputValue('#gv [data-fm="it.0.validade"]');
  conf(valSug === await p.evaluate(d => eqAddMeses(d, 12), ontem), 'validade sugerida = data da calibração + 12 meses (' + valSug + ')');
  await p.fill('#gv [data-fm="it.0.cert"]', 'RBC-2026-4471');
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-claro-calibrado.png') });
  await p.click('[data-act="cb-real-ok"]'); await p.waitForTimeout(500);
  const r1 = await p.evaluate(() => { const c = S.almCal[0], i = c.itens[0], e = S.almEq.find(x => x.id === 'e1'); return { sit: cbSit(c), i: [i.aplicado, i.tecnico, i.certificado, i.resultado].join('|'), e: [e.cal.ultima, e.cal.certificado, e.cal.tecnico, e.cal.validade, e.cal.campanha, eqCalSit(e)].join('|'), h: (e.hist || []).filter(x => x.tipo === 'calibracao').length }; });
  conf(r1.sit === 'parcial' && r1.i === 'true|Carlos Mendes|RBC-2026-4471|aprovado', 'só o pHmetro com certificado: "Calibração em andamento"; a balança fica para depois');
  conf(r1.e === [ontem, 'RBC-2026-4471', 'Carlos Mendes', valSug, 'CAL-' + new Date().getFullYear() + '-01', 'ok'].join('|') && r1.h === 1, 'o equipamento recebe a calibração (data, código, quem calibrou, validade, número da solicitação) e fica "Em dia"');
  await p.click('#gv [data-act="cb-real"]'); await p.waitForTimeout(150);
  conf((await p.$$('#gv .fm-ln')).length === 1, 'segunda vez: só a balança aparece para calibrar');
  await p.fill('#gv [data-fm="tecnico"]', 'Carlos Mendes'); await p.fill('#gv [data-fm="it.1.cert"]', 'RBC-2026-4472');
  await dd(p, 'lc:cbres:1', 'Reprovado'); await p.click('[data-act="cb-real-ok"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => { const c = S.almCal[0], e = S.almEq.find(x => x.id === 'e2'); return cbSit(c) === 'realizada' && e.situacao === 'restricao' && e.cal.resultado === 'reprovado'; }), 'balança reprovada: fica "Uso com restrição"; solicitação "Calibrada · falta a compra"');
  conf(await p.evaluate(async () => (await Data.col('sv2_notifs').all()).some(n => /Calibração reprovada: BAL-01/.test(n.titulo))), 'reprovação avisa no sino dos superiores');

  console.log('— Compra e encerramento');
  await p.click('#gv [data-act="cb-compra"]'); await p.waitForTimeout(150);
  await p.click('[data-act="cb-compra-ok"]'); await p.waitForTimeout(80);
  conf(/Nº da solicitação de compras/.test(await msg(p)), 'pede o Nº da solicitação de compras');
  await p.fill('#gv [data-fm="numero"]', 'SC-9912'); await p.click('[data-act="cb-compra-ok"]'); await p.waitForTimeout(80);
  conf(/Informe a NF/.test(await msg(p)), 'pede a NF');
  await p.fill('#gv [data-fm="nf"]', '55120'); await p.click('[data-act="cb-compra-ok"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => { const c = S.almCal[0]; return cbSit(c) === 'encerrada' && c.itens.every(i => i.compra.numero === 'SC-9912' && i.compra.data === hojeISO() && i.compra.nf === '55120'); }), 'compra com data de hoje e NF: "Encerrada" (igual ao EFClaudian)');
  conf((await p.$$('#gv .cb-tl li.ok')).length === 5 && !(await p.$('#gv .gv-lx')), 'as 5 etapas feitas; sem lixeira depois de calibrado');
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-claro-encerrada.png') });

  console.log('— Histórico só do equipamento');
  await p.click('#gv .cb-it:has-text("PHM-02")'); await p.waitForTimeout(250);
  const eqTxt = await p.textContent('#gv');
  conf(/Calibrações deste equipamento/.test(eqTxt) && /RBC-2026-4471/.test(eqTxt) && /Carlos Mendes/.test(eqTxt) && /Validade/.test(eqTxt) && /SC-9912/.test(eqTxt), 'detalhe do pHmetro: solicitada, cotação, agendada, calibrada por quem, código do certificado, validade e compra');
  conf(!/RBC-2026-4472/.test(eqTxt), 'mostra só as calibrações dele (não a da balança)');
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-claro-equip-historico.png') });
  await esc(p);
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(200);
  await p.click('.tb-t tbody tr:has-text("TER-05")'); await p.waitForTimeout(150);
  conf(/Pedir calibração/.test(await p.textContent('#gv .gv-pe')), 'equipamento fora de solicitação: botão "Pedir calibração"');
  await p.click('#gv [data-act="cb-pedir"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => S.fm && S.fm.sel.e3 === true), 'Pedir calibração já vem com ele marcado');
  await p.fill('#gv [data-fm="obs"]', 'teste'); await esc(p);
  conf(await p.evaluate(() => !!document.getElementById('cf')), 'formulário mexido: voltar pergunta antes de descartar');
  await p.click('[data-act="cf-nao"]'); await p.click('[data-act="cb-nova-ok"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => S.almCal.length === 2 && /-02$/.test(S.almCal.find(c => c.itens[0].equipId === 'e3').numero)), 'segunda solicitação do ano (-02) com o prestador já escolhido');
  await p.click('#gv .gv-lx'); await p.waitForTimeout(150); await p.fill('#gv [data-fm="motivoG"]', 'Pedido em dobro'); await p.click('[data-act="cb-canc-ok"]'); await p.waitForTimeout(350);
  conf(await p.evaluate(() => cbSit(S.almCal.find(c => c.itens[0].equipId === 'e3')) === 'cancelada'), 'cancelar pela lixeira (antes de calibrar), com motivo');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; location.hash = '#/almox/calibracao'; }); await p.waitForTimeout(250);
  conf((await p.$$('.tb-t tbody tr[data-id]')).length === 2, 'histórico com as 2 solicitações');
  await p.evaluate(() => csTrocaTema('escuro')); await p.click('.tb-t tbody tr[data-id]:has-text("Encerrada")'); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(SHOTS, 'v033-pc-escuro-encerrada.png') });
  await p.evaluate(() => csTrocaTema('claro'));
  /* colaborador só vê */
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; });
  await entra(p, 'ana.lima');
  await p.evaluate(() => { location.hash = '#/almox/calibracao'; }); await p.waitForTimeout(200);
  conf(!(await p.$('[data-act="cb-nova"]')), 'Colaborador vê a calibração mas não abre solicitação');
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400); await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600); await semear(q);
  await q.evaluate(async () => { await Data.col('sv2_alm_cal').add({ numero: 'CAL-2026-01', prestador: 'LABOR', itens: [{ equipId: 'e1', tag: 'PHM-02', nome: 'pHmetro de bancada', valor: 180, aplicado: false }], situacao: 'ativa', cotacaoEm: hojeISO(), agenda: { data: addDias(hojeISO(), 3) }, criadoEm: nowISO(), criadoPorNome: 'Joana Silva' }); location.hash = '#/almox/calibracao'; });
  await q.waitForTimeout(300);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: a calibração não rola para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v033-cel-claro-calibracao.png') });
  await q.click('.cb-card'); await q.waitForTimeout(200);
  await q.screenshot({ path: path.join(SHOTS, 'v033-cel-claro-detalhe.png') });
  conf(await q.evaluate(() => Math.round(document.getElementById('gv').getBoundingClientRect().width) === innerWidth), 'celular: detalhe em tela cheia');
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v033: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
