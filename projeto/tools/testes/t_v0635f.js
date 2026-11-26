/* EFCwork · v0.6.35 · filtro da coluna (pedido do Elias 26/11 14:24): a janela fica parada ao marcar um item (antes "tremia", fechando e abrindo),
   e dá para escolher itens de várias buscas ("isopor 5l" marca, "ph10" marca, "caneta" marca; ao fechar, os três ficam escolhidos).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0635f.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0; const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
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
const linhas = p => p.$$eval('.tb[data-tb="al-mat"] .tb-t tbody tr[data-id]', l => l.map(x => x.getAttribute('data-id')));
const abre = async (p, k) => { await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="' + k + '"] .tb-hm'); await p.waitForTimeout(400); };
const marcados = p => p.$$eval('.tb-mn-li:not(.tb-mn-all) input', l => l.filter(i => i.checked).map(i => i.value));
const lista = p => p.$$eval('.tb-mn-li:not(.tb-mn-all) input', l => l.map(i => i.value));
async function teste(b, w, h, nome) {
  console.log('— ' + nome);
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  await semear(p);
  await p.evaluate(async () => { const C = Data.col.bind(Data);
    for (const [id, n] of [['iso5', 'Caixa térmica isopor 05L'], ['iso8', 'Caixa térmica isopor 08L'], ['ph10', 'Reagente calibração pH10'], ['iso15', 'Caixa térmica isopor 15L'], ['ph4', 'Reagente calibração pH4'], ['can1', 'Caneta azul'], ['can2', 'Caneta permanente preta']])
      await C('sv2_alm_itens').set(id, { nome: n, codigo: id, un: 'Un', min: 1, local: 'Porta 05', ativo: true }); });
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(500);
  const total = (await linhas(p)).length;
  await abre(p, 'nome');
  /* a janela parada: o mesmo elemento continua, sem animação de entrar, no mesmo lugar */
  await p.evaluate(() => { const m = document.querySelector('.tb-mn'); window._r0 = m.getBoundingClientRect().toJSON(); window._an = 0;
    new MutationObserver(() => { const n = document.querySelector('.tb-mn'); if (n && getComputedStyle(n).animationName !== 'none') window._an++; }).observe(document.body, { childList: true, subtree: true }); });
  await p.fill('[data-tbmnbusca]', 'isopor 5'); await p.waitForTimeout(450);
  let v = await lista(p), m = await marcados(p);
  conf(v.length === 1 && /05L/.test(v[0]) && m.length === 0, 'buscando sem nada escolhido: a lista mostra o encontrado desmarcado, pronto para escolher (' + v.join() + ')');
  await p.evaluate(() => { window._r0 = document.querySelector('.tb-mn').getBoundingClientRect().toJSON(); }); /* onde estava logo antes do toque */
  await p.click('.tb-mn-li:not(.tb-mn-all) input'); await p.waitForTimeout(400);
  const fixo = await p.evaluate(() => { const m = document.querySelector('.tb-mn'), r = m.getBoundingClientRect(); return { an: window._an, cls: m.className, d: Math.abs(r.top - window._r0.top) + Math.abs(r.left - window._r0.left), ani: getComputedStyle(m).animationName }; });
  conf(fixo.an === 0 && fixo.ani === 'none' && fixo.d < 1, 'marcou um item: a janela fica parada (sem fechar e abrir, no mesmo lugar) (' + JSON.stringify(fixo) + ')');
  conf((await linhas(p)).join() === 'iso5', 'a tabela já mostra só o escolhido');
  await p.fill('[data-tbmnbusca]', 'ph10'); await p.waitForTimeout(450);
  conf((await linhas(p)).join() === 'iso5', 'buscar outra coisa não tira o que já foi escolhido da tabela');
  await p.click('.tb-mn-li:not(.tb-mn-all) input'); await p.waitForTimeout(350);
  await p.fill('[data-tbmnbusca]', 'caneta'); await p.waitForTimeout(450);
  v = await lista(p); m = await marcados(p);
  conf(v.length === 2 && m.length === 0, 'busca "caneta": as duas canetas aparecem desmarcadas (ainda não escolhidas)');
  await p.click('.tb-mn-li.tb-mn-all input'); await p.waitForTimeout(350);
  conf((await marcados(p)).length === 2, '"Marcar os encontrados" escolhe as duas canetas');
  await p.fill('[data-tbmnbusca]', ''); await p.waitForTimeout(450);
  m = await marcados(p);
  conf(m.length === 4 && m.some(x => /05L/.test(x)) && m.some(x => /pH10/.test(x)) && m.filter(x => /Caneta/.test(x)).length === 2, 'sem busca: a lista mostra marcados os escolhidos das três buscas (' + m.join(' | ') + ')');
  conf(await p.evaluate(() => window._an === 0), 'em nenhum momento a janela entrou de novo');
  if (cel) { await p.click('.tb-mn-fundo', { position: { x: 20, y: 20 } }).catch(() => {}); await p.waitForTimeout(400); if (await p.$('.tb-mn')) { await p.goBack(); await p.waitForTimeout(400); } }
  else { await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  const l = await linhas(p);
  conf(!(await p.$('.tb-mn')) && l.length === 4 && ['iso5', 'ph10', 'can1', 'can2'].every(x => l.indexOf(x) >= 0), 'fechou: os itens escolhidos nas três buscas ficam na tabela (' + l.join() + ')');
  await abre(p, 'nome');
  conf(!(await p.inputValue('[data-tbmnbusca]')) && (await marcados(p)).length === 4, 'reabrir: a busca vem limpa e os escolhidos marcados');
  await p.fill('[data-tbmnbusca]', 'ph'); await p.waitForTimeout(450);
  m = await marcados(p); conf(m.length === 1 && /pH10/.test(m[0]), 'buscar com itens escolhidos: mostra quem já está escolhido (pH10 marcado, pH4 não)');
  await p.click('.tb-mn-li:not(.tb-mn-all) input:not(:checked)'); await p.waitForTimeout(350);
  conf((await linhas(p)).length === 5, 'e acrescenta o pH4');
  await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(400);
  conf((await linhas(p)).length === total, '"Limpar esta coluna" volta a mostrar tudo');
  /* revisor: desmarcar o último buscando não volta a filtrar pela busca; busca só de espaços não conta */
  await p.fill('[data-tbmnbusca]', 'ph10'); await p.waitForTimeout(450); await p.click('.tb-mn-li:not(.tb-mn-all) input'); await p.waitForTimeout(350);
  await p.click('.tb-mn-li:not(.tb-mn-all) input'); await p.waitForTimeout(350);
  conf((await linhas(p)).length === 0, 'buscando, desmarcar o último escolhido deixa nada escolhido (não volta a mostrar os encontrados)');
  await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(300);
  await p.fill('[data-tbmnbusca]', '   '); await p.waitForTimeout(450);
  conf((await marcados(p)).length === (await lista(p)).length && (await linhas(p)).length === total, 'busca só com espaços não conta: lista marcada e tabela inteira');
  await p.fill('[data-tbmnbusca]', ''); await p.waitForTimeout(300);
  /* sem escolher nada, a busca continua filtrando a tabela pelo texto (como antes) */
  await p.fill('[data-tbmnbusca]', 'isopor'); await p.waitForTimeout(450);
  conf((await linhas(p)).length === 3, 'sem escolher nada, a busca filtra a tabela pelo texto, como antes');
  await p.fill('[data-tbmnbusca]', 'isopor 5l'); await p.waitForTimeout(450);
  conf((await lista(p)).join() === 'Caixa térmica isopor 05L', '"isopor 5l" acha o 05L e não o 15L (o número casa inteiro, revisor)');
  await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(300);
  conf(erros.length === 0, 'sem erro de JavaScript' + (erros.length ? ': ' + erros[0] : ''));
  await ctx.close();
}
(async () => {
  const b = await chromium.launch();
  await teste(b, 1366, 820, 'PC (1366)');
  await teste(b, 390, 820, 'Celular (390)');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
