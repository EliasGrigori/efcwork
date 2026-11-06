/* EFCwork · suíte da v0.3.0 — lançamentos do Almoxarifado (saída, lote vencido, motivos, produto crítico, frasco, entrada, embalagem,
   ajuste, corrigir, anular, solicitação nova/atender/cancelar), pedido do secundário decidido no sino, avisos, celular.
   Tudo no modo demonstração (nada vai ao Firebase real). Uso: node tools/testes/t_v030.js */
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
const movs = (p, f) => p.evaluate(f => S.almMov.filter(new Function('m', 'return ' + f)).length, f);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  await semear(p);
  await p.evaluate(async () => { await Data.col('sv2_alm_itens').update('gelo', { critico: true }); await Data.col('sv2_alm_itens').update('fita', { porFrasco: true, prazoAberto: 30 }); });
  await p.evaluate(async () => { await Data.col('sv2_alm_mov').set('m7', { tipo: 'entrada', itemId: 'fita', itemNome: 'Fita dupla face 19 mm', qtd: 3, preco: 5, lote: 'FT1', validade: '', data: hojeISO(), criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva' }); });
  await p.waitForTimeout(200);

  console.log('— Cabeçalho');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  conf(/Saída/.test(await p.textContent('.cs-acts .bt.pr')) && /Entrada/.test(await p.textContent('.cs-acts')), 'Materiais: botões Saída (principal) e Entrada no cabeçalho');
  conf((await p.$$('.cs-acts a[href*="efclaudian"]')).length === 1, 'atalho só com ícone para o EFClaudian (cadastro, kits, fotos, inventário)');

  console.log('— Saída');
  await p.click('.cs-acts [data-act="lc-sai"]'); await p.waitForTimeout(150);
  conf((await p.$$('#gv .fm-pki')).length === 5, 'Saída abre na gaveta com a lista dos 5 materiais ativos');
  await p.fill('#gv [data-pk]', 'agua des'); await p.waitForTimeout(80);
  conf((await p.$$('#gv .fm-pki:not([hidden])')).length === 1, 'busca na lista (sem acento, por palavras): 1 material');
  await p.click('#gv .fm-pki:not([hidden])'); await p.waitForTimeout(100);
  conf(/Água desmineralizada/.test(await p.textContent('#gv h2')), 'material escolhido vira o título do formulário');
  await p.fill('#gv [data-fm="qtd"]', '40'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(80);
  conf(/Escolha o motivo/.test(await msg(p)), 'sem motivo: "Escolha o motivo"');
  const ops = await p.$$eval('[data-dd="lc:motivo"] li', l => l.map(x => x.textContent));
  conf(ops.indexOf('Envio de água p/ Bioagri') < 0 && ops.indexOf('Uso no expediente') >= 0, 'motivos: os usados pela equipe em 90 dias (saída anulada não conta) e a lista simples; nada fixo de empresa');
  await dd(p, 'lc:motivo', 'Uso no expediente');
  await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(80);
  conf(/Só há 34 disponível/.test(await msg(p)), 'saldo não fica negativo: "Só há 34 disponível"');
  conf(await p.inputValue('#gv [data-fm="qtd"]') === '40', 'o que foi digitado continua no campo depois do erro');
  await p.click('[data-act="lc-q"][data-d="-1"]');
  conf(await p.inputValue('#gv [data-fm="qtd"]') === '39', 'botão − diminui a quantidade');
  await p.fill('#gv [data-fm="qtd"]', '20'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(250);
  const s1 = await p.evaluate(() => { const m = S.almMov.filter(x => x.tipo === 'saida' && x.itemId === 'agua' && !x.anulada); return { n: m.length, q: m[0] && m[0].qtd, lot: m[0] && m[0].lotRef, pr: m[0] && m[0].preco, mot: m[0] && m[0].motivo, por: m[0] && m[0].porNome, disp: alDisp('agua') }; });
  conf(s1.n === 1 && s1.q === 20 && s1.lot === 'm4' && s1.pr === 2.13 && s1.mot === 'Uso no expediente' && s1.por === 'Joana Silva', 'saída gravada como no EFClaudian (lotRef, preço do lote, motivo, quem)');
  conf(s1.disp === 14, 'saldo utilizável da água: 34 − 20 = 14');
  conf(await p.evaluate(() => !S.gv), 'ao registrar, a gaveta fecha (saiu do cabeçalho)');
  const nmin = await p.evaluate(() => S.notifs.filter(n => /abaixo do mínimo: Água/.test(n.titulo)).length);
  conf(nmin === 1, 'passou do mínimo (15) para baixo: aviso no sino de quem cuida do almoxarifado');
  conf(await p.evaluate(() => S.almPref && S.almPref.uso && S.almPref.uso['item:agua'] && S.almPref.uso['item:agua']['Uso no expediente'] === 1), 'motivo usado fica na ordem da pessoa (sv2_alm_pref)');
  conf(await p.evaluate(async () => (await Data.col('sv2_audit').all()).some(a => a.acao === 'saida_almox' && /20 Lt de Água/.test(a.resumo))), 'auditoria registrada (sv2_audit, como no EFClaudian)');
  /* lote vencido */
  await p.click('.tb-t tbody tr:has-text("Fenolftaleína")'); await p.waitForTimeout(150);
  await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(120);
  await dd(p, 'lc:motivo', 'Uso no expediente'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(80);
  conf(/fora de lote vencido/.test(await msg(p)), 'só lote vencido: avisa e pede para escolher o lote vencido');
  await dd(p, 'lc:lotId', 'VENCIDO'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(80);
  conf(/motivo para usar o lote vencido/.test(await msg(p)), 'lote vencido escolhido: pede o motivo para usar');
  await p.fill('#gv [data-fm="vencMot"]', 'Teste de bancada'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => S.almMov.some(m => m.itemId === 'fenol' && m.tipo === 'saida' && m.vencidoMotivo === 'Teste de bancada')), 'saída do lote vencido grava o motivo (vencidoMotivo)');
  conf(await p.evaluate(() => S.gv && /Fenolftaleína/.test(document.querySelector('#gv h2').textContent) && !S.gvForm), 'saiu do material: depois de registrar, volta para o detalhe dele');
  await p.click('[data-act="gv-fecha"]');
  /* outro motivo guardado */
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(120); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(100);
  await dd(p, 'lc:motivo', 'Escrever outro motivo'); await p.fill('#gv [data-fm="motivoTxt"]', 'Visita técnica'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => (S.almPref.motivos || []).indexOf('Visita técnica') >= 0 && alMotivos('item:luva').indexOf('Visita técnica') === 0), 'outro motivo escrito fica guardado na lista da pessoa e vem primeiro naquele material');
  await p.click('[data-act="gv-fecha"]');
  /* produto crítico */
  await p.click('.tb-t tbody tr:has-text("Gelo")'); await p.waitForTimeout(120); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(100);
  conf(/Produto crítico/.test(await p.textContent('#gv .gv-corpo')), 'produto crítico: aviso no formulário');
  await p.fill('#gv [data-fm="qtd"]', '2'); await dd(p, 'lc:motivo', 'Uso no expediente'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(250);
  const cid = await p.evaluate(() => { const m = S.almMov.find(x => x.itemId === 'gelo' && x.tipo === 'saida'); return m && m.critico && m.critico.st === 'pendente' ? m.id : ''; });
  conf(!!cid, 'saída de produto crítico fica "aguardando confirmação"');
  await p.evaluate(() => { location.hash = '#/almox/painel'; }); await p.waitForTimeout(200);
  conf(/Produto crítico: confirmar saída/.test(await p.textContent('.cs-ct')), 'Painel mostra a saída crítica para quem confirma');
  await p.click('.pn:has-text("Produto crítico") .al-li'); await p.waitForTimeout(200);
  await p.click('#gv [data-act="lc-crit-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(id => { const m = S.almMov.find(x => x.id === id); return m.critico.st === 'confirmada' && m.critico.proprio === true; }, cid), 'líder confirma; fica marcado que foi quem lançou');
  await p.click('[data-act="gv-fecha"]').catch(() => {});

  console.log('— Frasco');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(150);
  await p.click('.tb-t tbody tr:has-text("Fita")'); await p.waitForTimeout(120);
  conf(/Abrir frasco/.test(await p.textContent('#gv .gv-pe .bt.pr')), 'item por frasco: botão principal é Abrir frasco');
  await p.click('#gv [data-act="lc-abrir"]'); await p.waitForTimeout(100); await p.click('[data-act="lc-abrir-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => alAbertos('fita').length === 1 && alSaldo('fita') === 2), 'abrir frasco: 1 em uso, 2 lacrados');
  conf(/Acabou/.test(await p.textContent('#gv .gv-corpo')), 'o detalhe mostra o frasco em uso com o botão Acabou');
  await p.click('#gv [data-act="lc-fim"]'); await p.waitForTimeout(100); await p.click('[data-act="lc-fim-ok"]:not([data-id])'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => alAbertos('fita').length === 0 && S.almMov.some(m => m.tipo === 'fim' && m.itemId === 'fita')), 'frasco que acabou: registro "Frasco terminou"');
  await p.click('[data-act="gv-fecha"]');

  console.log('— Entrada');
  await p.click('.cs-acts [data-act="lc-ent"]'); await p.waitForTimeout(120);
  await p.click('#gv .fm-pki:has-text("Luva")'); await p.waitForTimeout(80);
  await p.click('[data-act="lc-ent-add"]'); await p.click('#gv .fm-pki:has-text("Fenolftaleína")'); await p.waitForTimeout(80);
  conf((await p.$$('#gv .fm-ln')).length === 2, 'entrada com 2 materiais (linhas)');
  await p.fill('#gv [data-fm="linhas.0.qtd"]', '10'); await p.fill('#gv [data-fm="linhas.0.preco"]', '31,50'); await p.fill('#gv [data-fm="linhas.0.lote"]', 'L2');
  await p.fill('#gv [data-fm="linhas.1.qtd"]', '1');
  await p.evaluate(async () => { await Data.col('sv2_alm_itens').update('fenol', { controlaVal: true }); });
  await p.click('[data-act="lc-ent-ok"]'); await p.waitForTimeout(80);
  conf(/controla validade/.test(await msg(p)), 'item que controla validade: pede lote e validade');
  conf(await p.inputValue('#gv [data-fm="linhas.0.preco"]') === '31,50', 'dados digitados continuam depois de os dados mudarem no Firebase');
  await p.fill('#gv [data-fm="linhas.1.lote"]', 'F2'); await p.fill('#gv [data-fm="linhas.1.validade"]', '2027-12-31'); await p.fill('#gv [data-fm="doc"]', 'NF 555');
  await p.click('[data-act="lc-ent-ok"]'); await p.waitForTimeout(250);
  const en = await p.evaluate(() => { const l = S.almMov.filter(m => m.tipo === 'entrada' && m.doc === 'NF 555'); return { n: l.length, g: l[0] && l[0].grupo === l[1].grupo, luva: alDisp('luva'), preco: alItem('luva').preco }; });
  conf(en.n === 2 && en.g, 'entrada grava uma movimentação por material, no mesmo grupo, com o documento');
  conf(en.luva === 10 && en.preco === 31.5, 'luva: 10 disponíveis; último valor do item atualizado para 31,50');
  await p.evaluate(async () => { await Data.col('sv2_alm_itens').update('agua', { fator: 12, unCompra: 'Fardo' }); });
  await p.click('.cs-acts [data-act="lc-ent"]'); await p.waitForTimeout(100); await p.click('#gv .fm-pki:has-text("Água")'); await p.waitForTimeout(80);
  await p.fill('#gv [data-fm="linhas.0.qtd"]', '2'); await p.fill('#gv [data-fm="linhas.0.preco"]', '24'); await p.click('[data-act="lc-ent-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => { const m = S.almMov.filter(x => x.tipo === 'entrada' && x.itemId === 'agua').pop(); return m.qtd === 24 && m.preco === 2; }), 'embalagem: 2 fardos de 12 = 24 Lt a R$ 2,00 cada');
  conf(await p.evaluate(() => lcPrecoSug({ preco: 2, fator: 12, un: 'Lt' }, 'compra') === '24,00' && lcPrecoSug({ preco: 2, fator: 12 }, 'uso') === '2,00'), 'valor sugerido na unidade escolhida: Fardo R$ 24,00 · Lt R$ 2,00');

  console.log('— Ajuste, corrigir e anular');
  await p.click('.tb-t tbody tr:has-text("Gelo")'); await p.waitForTimeout(120); await p.click('#gv [data-act="lc-aj"]'); await p.waitForTimeout(100);
  await p.click('[data-act="lc-aj-ok"]'); await p.waitForTimeout(80);
  conf(/Nada mudou/.test(await msg(p)), 'ajuste sem mudança: "Nada mudou"');
  await p.fill('#gv .fm-lt [data-fm^="aj."]', '18'); await p.fill('#gv [data-fm="motivoG"]', 'Contagem de hoje'); await p.click('[data-act="lc-aj-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => alSaldo('gelo') === 18 && S.almMov.some(m => m.tipo === 'ajuste' && m.itemId === 'gelo' && m.qtd === -2 && m.motivo === 'Contagem de hoje')), 'Principal ajusta na hora: 20 → 18 (ajuste −2 com motivo)');
  await p.click('[data-act="gv-fecha"]').catch(() => {});
  await p.evaluate(() => { location.hash = '#/almox/movimentacoes'; }); await p.waitForTimeout(150);
  const said = await p.evaluate(() => S.almMov.find(m => m.tipo === 'saida' && m.itemId === 'agua' && !m.anulada).id);
  await p.click('.tb-t tbody tr[data-id="' + said + '"]'); await p.waitForTimeout(120);
  await p.click('#gv [data-act="lc-corr"]'); await p.waitForTimeout(100); await p.fill('#gv [data-fm="qtd"]', '18'); await p.click('[data-act="lc-corr-ok"]'); await p.waitForTimeout(80);
  conf(/por que está corrigindo/.test(await msg(p)), 'corrigir pede o porquê');
  await p.fill('#gv [data-fm="motivoG"]', 'Contei errado'); await p.click('[data-act="lc-corr-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(id => { const m = S.almMov.find(x => x.id === id); return m.qtd === 18 && m.historico.length === 1 && m.historico[0].antes.qtd === 20; }, said), 'correção guarda o antes no histórico (20 → 18)');
  conf(/20 → 18/.test(await p.textContent('#gv .gv-corpo')), 'o detalhe mostra a correção (20 → 18)');
  await p.click('#gv .gv-lx'); await p.waitForTimeout(100); await p.fill('#gv [data-fm="motivoG"]', 'Lançado em dobro'); await p.click('[data-act="lc-anular-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(id => { const m = S.almMov.find(x => x.id === id); return m.anulada && m.anuladaMotivo === 'Lançado em dobro'; }, said), 'anular pela lixeira do canto: fica anulada com o motivo, nada se apaga');
  await p.click('[data-act="gv-fecha"]').catch(() => {});
  await p.click('.tb-t tbody tr[data-id="m1"]'); await p.waitForTimeout(120);
  conf((await p.$$('#gv .gv-lx')).length === 0, 'entrada com saída depois dela não mostra a lixeira (corrigir em vez de anular)');
  await p.click('[data-act="gv-fecha"]');

  console.log('— Solicitação');
  await p.evaluate(() => { location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(150);
  conf(/Nova solicitação/.test(await p.textContent('.cs-acts .bt.pr')), 'Solicitações: botão Nova solicitação');
  await p.click('.cs-acts [data-act="lc-sol"]'); await p.waitForTimeout(100); await p.click('#gv .fm-pki:has-text("Gelo")'); await p.waitForTimeout(80);
  await p.fill('#gv [data-fm="linhas.0.qtd"]', '6'); await p.click('[data-act="lc-sol-ok"]'); await p.waitForTimeout(80);
  conf(/Nº do documento/.test(await msg(p)), 'solicitação sem número: pede o Nº do documento');
  await p.fill('#gv [data-fm="numero"]', '2001'); await p.click('[data-act="lc-sol-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => S.almSol.some(x => x.numero === '2001' && x.situacao === 'pendente' && x.linhas[0].qtd === 6 && x.solicitante === 'Joana Silva')), 'solicitação gravada pendente');
  await p.click('.tb-t tbody tr[data-id="s1"]'); await p.waitForTimeout(120); await p.click('#gv [data-act="lc-sol-atender"]'); await p.waitForTimeout(120);
  conf((await p.$$('#gv .fm-ln')).length === 1 && await p.inputValue('#gv [data-fm="doc"]') === '1042' && await p.inputValue('#gv [data-fm="linhas.0.qtd"]') === '10', 'Atender: entrada já preenchida com o que estava cadastrado (10 luvas, doc 1042)');
  await p.click('[data-act="lc-ent-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => { const s = S.almSol.find(x => x.id === 's1'); return s.situacao === 'atendida' && !!s.entradaGrupo && alDisp('luva') === 20; }), 'solicitação Atendida e entrada lançada (luva 20)');
  await p.click('[data-act="gv-fecha"]').catch(() => {});
  const s2001 = await p.evaluate(() => S.almSol.find(x => x.numero === '2001').id);
  await p.click('.tb-t tbody tr[data-id="' + s2001 + '"]'); await p.waitForTimeout(120); await p.click('#gv .gv-lx'); await p.waitForTimeout(100);
  await p.fill('#gv [data-fm="motivoG"]', 'Pedido duplicado'); await p.click('[data-act="lc-solcanc-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(id => { const s = S.almSol.find(x => x.id === id); return s.situacao === 'cancelada' && s.canceladaMotivo === 'Pedido duplicado'; }, s2001), 'cancelar pela lixeira: Cancelada com o motivo');
  await p.click('[data-act="gv-fecha"]').catch(() => {});
  await p.screenshot({ path: path.join(SHOTS, 'v030-pc-claro-solicitacoes.png') });

  console.log('— Secundário pede, superior decide no sino');
  const sec = await p.evaluate(async () => { const id = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(id, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: { almox: true } }); return id; });
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.fill('#en-login', 'ana.lima'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  await p.click('.tb-t tbody tr:has-text("Gelo")'); await p.waitForTimeout(120); await p.click('#gv [data-act="lc-aj"]'); await p.waitForTimeout(100);
  conf(/vai como pedido/.test(await p.textContent('#gv .gv-corpo')) && /Pedir ajuste/.test(await p.textContent('#gv .gv-pe')), 'secundário: o ajuste avisa que vai como pedido');
  await p.fill('#gv .fm-lt [data-fm^="aj."]', '17'); await p.fill('#gv [data-fm="motivoG"]', 'Quebrou um'); await p.click('[data-act="lc-aj-ok"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => alSaldo('gelo') === 18 && S.aprov.some(a => a.status === 'pendente' && a.payload.acao === 'ajuste')), 'secundário: saldo não muda; vira pedido pendente ao superior');
  /* saída da própria pessoa: corrige direto */
  await p.click('[data-act="gv-fecha"]').catch(() => {});
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(120); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(100);
  await dd(p, 'lc:motivo', 'Uso no expediente'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => S.almMov.some(m => m.tipo === 'saida' && m.porNome === 'Ana Lima')), 'secundário lança saída normalmente');
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700);
  const bdg = await p.evaluate(() => { const b = document.getElementById('sn-n'); return b && !b.hidden ? b.textContent : ''; });
  conf(Number(bdg) >= 1, 'superior: número no sino (' + bdg + ')');
  await p.click('[data-act="cs-sino"]'); await p.waitForTimeout(200);
  conf(/Para você decidir/.test(await p.textContent('#gv')) && /Ajustar o saldo de Gelo/.test(await p.textContent('#gv')), 'sino: pedido do almoxarifado para decidir');
  await p.screenshot({ path: path.join(SHOTS, 'v030-pc-claro-sino.png') });
  await p.click('#gv [data-act="sn-apr"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => alSaldo('gelo') === 17 && S.aprov.some(a => a.payload && a.payload.acao === 'ajuste' && a.status === 'aprovado')), 'aprovar aplica o ajuste (18 → 17) e grava a decisão');
  conf(await p.evaluate(() => S.almMov.some(m => m.tipo === 'ajuste' && m.porNome === 'Ana Lima' && m.aprovadoPor === 'Joana Silva')), 'o ajuste fica no nome de quem pediu, com quem aprovou');
  conf(await p.evaluate(() => S.notifs.length > 0), 'avisos listados no sino');
  await p.click('[data-act="sn-todas"]').catch(() => {}); await p.waitForTimeout(250);
  conf(await p.evaluate(() => Notif.unread().length === 0), 'marcar todas como lidas');
  await p.click('[data-act="gv-fecha"]');
  /* tema escuro: prints */
  await p.click('[data-act="cs-tema"]'); await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(150);
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(120); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(120);
  await p.screenshot({ path: path.join(SHOTS, 'v030-pc-escuro-saida.png') });
  await p.click('[data-act="gv-fecha"]'); await p.click('[data-act="gv-fecha"]'); await p.click('[data-act="cs-tema"]'); await p.waitForTimeout(100);
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(120); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(120);
  await dd(p, 'lc:motivo', 'Escrever outro motivo').catch(() => {});
  await p.screenshot({ path: path.join(SHOTS, 'v030-pc-claro-saida.png') });
  await p.click('[data-act="gv-fecha"]'); await p.click('[data-act="gv-fecha"]').catch(() => {});
  await p.click('.cs-acts [data-act="lc-ent"]'); await p.waitForTimeout(100); await p.click('#gv .fm-pki:has-text("Luva")'); await p.click('[data-act="lc-ent-add"]'); await p.click('#gv .fm-pki:has-text("Água")'); await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(SHOTS, 'v030-pc-claro-entrada.png') });
  await p.click('[data-act="gv-fecha"]');
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400); await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600); await semear(q);
  await q.evaluate(() => { location.hash = '#/almox/materiais'; }); await q.waitForTimeout(150);
  await q.click('.cs-acts [data-act="lc-sai"]'); await q.waitForTimeout(150); await q.click('#gv .fm-pki:has-text("Luva")'); await q.waitForTimeout(100);
  conf(await q.evaluate(() => Math.round(document.getElementById('gv').getBoundingClientRect().width) === innerWidth && document.documentElement.scrollWidth <= innerWidth + 1), 'celular: formulário em tela cheia, sem rolar para o lado');
  const alt = await q.$$eval('#gv .gv-pe .bt', l => l.map(x => Math.round(x.getBoundingClientRect().height)));
  conf(alt.every(h => h >= 44), 'celular: botões do formulário com 44 px (' + alt.join(',') + ')');
  await q.screenshot({ path: path.join(SHOTS, 'v030-cel-claro-saida.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v030: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
