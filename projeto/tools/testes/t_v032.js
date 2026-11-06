/* EFCwork · suíte da v0.3.2 — contagem às cegas: abrir escolhendo quem conta, contar por lugar (portas, gavetas) sem o saldo,
   conferir, recontar o que não bateu, decidir (saída esquecida = erro de lançamento com reclamação), concluir, histórico, celular.
   Tudo no modo demonstração. Uso: node tools/testes/t_v032.js */
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
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), h = hojeISO();
    await C('sv2_alm_itens').set('pano', { nome: 'Pano multiuso', codigo: '800', un: 'Un', min: 2, local: 'GAVETA 07', ativo: true });
    await C('sv2_alm_mov').set('p1', { tipo: 'inicial', itemId: 'pano', itemNome: 'Pano multiuso', qtd: 10, preco: 1.5, lote: '', validade: '', data: h, criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva' });
    await C('sv2_alm_mov').set('l2', { tipo: 'entrada', itemId: 'luva', itemNome: 'Luva nitrílica M', qtd: 3, preco: 30, lote: 'L2', validade: addDias(h, 500), data: h, criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva' });
    await C('sv2_alm_mov').set('f1', { tipo: 'entrada', itemId: 'fita', itemNome: 'Fita dupla face 19 mm', qtd: 3, preco: 5, lote: 'FT1', validade: '', data: h, criadoEm: nowISO(), por: S.user.id, porNome: 'Joana Silva' });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: { almox: true } });
    const v = await Data.auth.createAccount('vera.luz', 'senha1234'); await C('sv2_users').set(v, { nome: 'Vera Luz', login: 'vera.luz', perfil: 'secundario', atrib: { coletas: true } });
  });
  await p.waitForTimeout(200);

  console.log('— Abrir');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(150);
  conf(/Contagem/.test(await p.textContent('.cs-acts')), 'Materiais: botão Contagem no cabeçalho');
  await p.click('.cs-acts a[href="#/almox/contagem"]'); await p.waitForTimeout(200);
  conf(/Nenhuma contagem aberta/.test(await p.textContent('.cs-ct')) && /Materiais/.test(await p.textContent('.cs-abas .on')), 'Contagem vazia; a aba Materiais fica marcada (a contagem é uma ação dela)');
  await p.click('[data-act="cg-nova"]'); await p.waitForTimeout(150);
  const pes = await p.$$eval('[data-dd="lc:cgcont"] li', l => l.map(x => x.textContent));
  conf(pes.some(x => /Ana Lima/.test(x)) && pes.some(x => /Joana Silva \(você\)/.test(x)) && !pes.some(x => /Vera/.test(x)), 'quem vai contar: só aparece quem tem o Almoxarifado (Ana e você; Vera não)');
  await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(100);
  conf(/Escolha quem vai contar/.test(await msg(p)), 'sem escolher: "Escolha quem vai contar"');
  await dd(p, 'lc:cgcont', 'Ana Lima'); await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(300);
  const inv = await p.evaluate(() => { const x = cgAberta(); return x && { n: x.numero, c: x.contadorNome, t: x.tipo, m: x.partes.mat }; });
  conf(inv && /^CNT-\d{4}-01$/.test(inv.n) && inv.c === 'Ana Lima' && inv.t === 'contagem' && inv.m, 'contagem aberta (' + (inv && inv.n) + '), formato do EFClaudian (tipo contagem, materiais), quem conta: Ana');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-aberta.png') });

  console.log('— Contar às cegas (Ana)');
  await entra(p, 'ana.lima');
  conf(/Contagem para você/.test(await p.textContent('.cs-ct')), 'Início da Ana: "Contagem para você" com o progresso');
  conf(await p.evaluate(() => S.notifs.some(n => /Contagem para você/.test(n.titulo))), 'Ana recebeu o aviso no sino');
  await p.click('.ini-cg'); await p.waitForTimeout(250);
  const grupos = await p.$$eval('.cg-grp .hd h3', l => l.map(x => x.textContent));
  conf(grupos.join('|') === 'Porta 02|Porta 11|Porta 12|Gaveta 07|Geladeira', 'ordem do lugar: portas em sequência, depois gavetas, depois o resto (' + grupos.join(', ') + ')');
  const txt = await p.textContent('.cs-ct');
  conf(!/sistema/i.test(txt.replace(/saldo do sistema não aparece|não vê o saldo do sistema/gi, '')) && (await p.$$('input[data-cgk]')).length >= 6, 'às cegas: nenhum saldo na tela, só os campos para digitar');
  conf((await p.$$('[data-cgk="m:luva"]')).length === 2, 'material com 2 lotes: um campo por lote');
  await p.fill('[data-cgk="m:luva"][data-cgl="m1"]', '1'); await p.click('.cg-it[data-k="m:luva"] [data-act="cg-salva"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => !cgContagens(cgAberta())['m:luva']) && await p.inputValue('[data-cgk="m:luva"][data-cgl="m1"]') === '1', 'lote sem número: não salva e o que foi digitado continua');
  await p.fill('[data-cgk="m:luva"][data-cgl="l2"]', '3'); await p.press('[data-cgk="m:luva"][data-cgl="l2"]', 'Enter'); await p.waitForTimeout(300);
  const lv = await p.evaluate(() => { const c = cgContagens(cgAberta())['m:luva']; return c && c.cont === 4 && c.lotes.m1 === 1 && c.lotes.l2 === 3 && c.esp.total === 4 && c.porNome === 'Ana Lima'; });
  conf(lv, 'Enter no último lote salva: contado 4 (1 + 3), com o que o sistema esperava guardado junto (às escondidas)');
  conf(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-cgk') && document.activeElement.getAttribute('data-cgk') !== 'm:luva'), 'depois de salvar, o cursor vai para o próximo que falta');
  /* foco e rascunho seguram quando chega dado novo */
  await p.fill('[data-cgk="m:agua"]', '3'); await p.focus('[data-cgk="m:agua"]');
  await p.evaluate(async () => { await Data.col('sv2_alm_itens').update('velho', { obs: 'x' }); }); await p.waitForTimeout(200);
  conf(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-cgk') === 'm:agua' && document.activeElement.value === '3'), 'chegou dado novo enquanto digitava: o campo continua com o foco e o número');
  const conta = async (k, v) => { await p.fill('[data-cgk="' + k + '"]', v); await p.click('.cg-it[data-k="' + k + '"] [data-act="cg-salva"]'); await p.waitForTimeout(220); };
  await conta('m:agua', '30'); await conta('m:fita', '4'); await conta('m:gelo', '22'); await conta('m:pano', '7'); await conta('m:fenol', '2');
  conf(await p.evaluate(() => { const pr = cgProgresso(cgAberta()); return pr.feitos === pr.total && pr.total === 6; }), 'todos os 6 materiais contados (100%)');
  conf(/Tudo contado/.test(await p.textContent('.cs-ct')), 'mensagem "Tudo contado"');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-contando.png'), fullPage: false });

  console.log('— Conferir e recontar (Joana)');
  await entra(p, 'joana.silva');
  await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(200);
  await dd(p, 'cg:vista', 'Mostrar: conferência');
  const kp = await p.$$eval('.cg-kps .kp b', l => l.map(x => x.textContent));
  conf(kp.join(',') === '6,3,3,0', 'conferência: 6 contados, 3 bateram, 3 não bateram, 0 em recontagem (' + kp.join(',') + ')');
  conf(/Sugestão: recontar os 3 que não bateram/.test(await p.textContent('.cs-ct')), 'o app sugere recontar os que não bateram');
  conf(await p.$eval('[data-act="cg-concluir"]', e => e.disabled), 'Concluir fica travado enquanto falta decidir');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-conferencia.png') });
  await p.click('[data-act="cg-recontar"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => Object.keys(cgAberta().recontar).filter(k => cgAberta().recontar[k]).length === 3), 'recontagem pedida para os 3');
  await entra(p, 'ana.lima');
  conf(await p.evaluate(() => S.notifs.some(n => /Recontar 3/.test(n.titulo))), 'Ana avisada: "Recontar 3 material(is)"');
  await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(200);
  conf(/Recontar/.test(await p.textContent('.cg-rec h3')) && (await p.$$('.cg-rec .cg-it')).length === 3, 'Ana vê a seção "Recontar" no topo com os 3, campos vazios (às cegas de novo)');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-recontar.png') });
  await conta('m:agua', '34'); await conta('m:fita', '4'); await conta('m:pano', '7');
  await entra(p, 'joana.silva');
  await p.evaluate(() => { location.hash = '#/almox/contagem'; S.cgVista = 'conf'; }); await p.waitForTimeout(250);
  const sit = await p.evaluate(() => { const inv = cgAberta(), ct = cgContagens(inv); return cgAlvos(inv).filter(a => ['agua', 'fita', 'pano'].indexOf(a.i.id) >= 0).map(a => a.i.id + ':' + cgSitItem(inv, a, ct).id).join(','); });
  conf(sit === 'agua:bateu2,fita:difere,pano:difere', 'depois da recontagem: água bateu (foi erro de contagem); fita e pano não bateram de novo (' + sit + ')');
  conf(!/Sugestão: recontar/.test(await p.textContent('.cs-ct')), 'não sugere recontar de novo o que já foi recontado');

  console.log('— Decidir e concluir');
  await p.click('.tb-t tbody tr[data-id="m:pano"]'); await p.waitForTimeout(200);
  conf(/1ª contagem: 7/.test(await p.textContent('#gv')) && /Recontagem: 7/.test(await p.textContent('#gv')), 'gaveta mostra a 1ª contagem e a recontagem');
  await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(150);
  const ops = await p.$$eval('[data-dd="lc:cgtipo"] li', l => l.map(x => x.textContent));
  conf(ops.some(x => /Saída esquecida/.test(x)) && ops.some(x => /Perda/.test(x)), 'falta: opções Saída esquecida, Perda, Quebra, Erro de lançamento, Outro');
  await dd(p, 'lc:cgtipo', 'Saída esquecida');
  conf(/erro de lançamento/.test(await p.textContent('#gv')) && (await p.$$('[data-dd="lc:cgresp"]')).length === 1, 'saída esquecida: data, quem esqueceu, motivo e reclamação');
  await esc(p);
  conf(await p.evaluate(() => !!document.getElementById('cf')), 'formulário com algo escolhido: voltar pergunta antes de descartar');
  await p.click('[data-act="cf-nao"]'); await p.waitForTimeout(100);
  const ontem = await p.evaluate(() => addDias(hojeISO(), -1));
  await p.fill('#gv [data-fm="data"]', ontem); await dd(p, 'lc:cgresp', 'Ana Lima'); await dd(p, 'lc:motivo', 'Uso no expediente');
  await p.fill('#gv [data-fm="reclamacao"]', 'Usou na limpeza de quarta e não lançou');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-decidir.png') });
  await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => { const r = (cgAberta().resolucoes || {}).m_pano; return r && r.tipo === 'saida_retro' && r.respNome === 'Ana Lima' && r.reclamacao; }), 'decisão guardada (ainda não lançada)');
  await esc(p);
  await p.click('.tb-t tbody tr[data-id="m:fita"]'); await p.waitForTimeout(150); await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(120);
  const ops2 = await p.$$eval('[data-dd="lc:cgtipo"] li', l => l.map(x => x.textContent));
  conf(ops2.some(x => /Entrada não lançada/.test(x)) && !ops2.some(x => /Saída esquecida/.test(x)), 'sobra: opções Entrada não lançada, Achado… (sem saída esquecida)');
  await dd(p, 'lc:cgtipo', 'Achado'); await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300); await esc(p);
  conf(!(await p.$eval('[data-act="cg-concluir"]', e => e.disabled)), 'tudo decidido: Concluir liberado');
  await p.click('[data-act="cg-concluir"]'); await p.waitForTimeout(800);
  const fim = await p.evaluate(() => { const x = S.almInv.find(y => y.tipo === 'contagem'); const sr = S.almMov.filter(m => m.itemId === 'pano' && m.retroativa); const aj = S.almMov.filter(m => m.itemId === 'fita' && m.tipo === 'ajuste'); return { sit: x.situacao, r: x.resumo, sr: sr.map(m => [m.qtd, m.data, m.erro.responsavelNome, m.erro.reclamacao, m.motivo].join('|')), aj: aj.map(m => m.qtd + '|' + m.motivo), pano: alSaldo('pano'), fita: alSaldo('fita'), agua: alSaldo('agua') }; });
  conf(fim.sit === 'concluido' && fim.r.erros === 1 && fim.r.difs === 2 && fim.r.bateramNaRecontagem === 1, 'contagem concluída: 2 diferenças, 1 erro de lançamento, 1 bateu na recontagem');
  conf(fim.sr.length === 1 && fim.sr[0] === '3|' + ontem + '|Ana Lima|Usou na limpeza de quarta e não lançou|Uso no expediente', 'saída esquecida lançada com a data certa (ontem), 3 Un, marcada como erro da Ana, com a reclamação');
  conf(fim.aj.length === 1 && /^1\|Contagem CNT-\d{4}-01: Achado/.test(fim.aj[0]), 'sobra virou ajuste +1 com o motivo da contagem');
  conf(fim.pano === 7 && fim.fita === 4 && fim.agua === 34, 'estoque igual ao contado (pano 7, fita 4); água sem mudança (foi erro de contagem)');
  conf(await p.evaluate(() => S.notifs.length >= 0) && await p.evaluate(async () => (await Data.col('sv2_notifs').all()).some(n => /Saída não lançada: Pano/.test(n.titulo) && (n.para || []).length === 1)), 'quem esqueceu é avisado no sino ("Saída não lançada", com a reclamação)');

  console.log('— Depois: painel, movimentações e histórico');
  await p.evaluate(() => { location.hash = '#/almox/painel'; }); await p.waitForTimeout(200);
  conf(/Erros de lançamento/.test(await p.textContent('.cs-ct')), 'Painel: "Erros de lançamento" (últimos 90 dias) para o Líder/Administrador');
  await p.evaluate(() => { location.hash = '#/almox/movimentacoes'; const st = tbEstado('al-mov'); st.filtros = { tipo: 'erro' }; }); await p.waitForTimeout(200);
  conf((await p.$$('.tb-t tbody tr[data-id]')).length === 1 && /Erro de lançamento/.test(await p.textContent('.tb-t tbody')), 'Movimentações: filtro "Erros de lançamento" acha a saída');
  await p.click('.tb-t tbody tr[data-id]'); await p.waitForTimeout(150);
  conf(/Reclamação/.test(await p.textContent('#gv')) && /Lançada depois/.test(await p.textContent('#gv')), 'detalhe da saída: "Lançada depois" e a reclamação');
  await esc(p);
  await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(200);
  conf(/Nenhuma contagem aberta/.test(await p.textContent('.cs-ct')) && (await p.$$('.tb-t tbody tr[data-id]')).length === 1, 'histórico: a contagem aparece concluída');
  await p.click('.tb-t tbody tr[data-id]'); await p.waitForTimeout(150);
  conf(/Erros de lançamento/.test(await p.textContent('#gv')) && /Ana Lima/.test(await p.textContent('#gv')), 'resumo da contagem com o erro de lançamento e quem esqueceu');
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-claro-historico.png') });
  await esc(p);
  /* cancelar uma nova */
  await p.click('[data-act="cg-nova"]'); await p.waitForTimeout(120); await dd(p, 'lc:cgcont', 'Joana Silva'); await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /-02$/.test(cgAberta().numero)), 'segunda contagem do ano: número seguinte (-02)');
  await p.click('[data-act="cg-folha"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => { const t = document.getElementById('tb-imp').textContent; return /às cegas/.test(t) && /Porta 02/.test(t) && !/sistema \d/.test(t); }), 'folha impressa: por lugar, às cegas (sem saldo)');
  await p.evaluate(() => csTrocaTema('escuro')); await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(SHOTS, 'v032-pc-escuro-contar.png') });
  await p.evaluate(() => csTrocaTema('claro'));
  await p.click('[data-act="cg-cancelar"]'); await p.waitForTimeout(120); await p.fill('#gv [data-fm="motivoG"]', 'Teste de cancelamento'); await p.click('[data-act="cg-canc-ok"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !cgAberta() && S.almInv.some(x => x.situacao === 'cancelado')), 'cancelar pela lixeira: fica no histórico como cancelada');
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400); await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600); await semear(q);
  await q.evaluate(async () => { await Data.col('sv2_alm_inv').add({ numero: 'CNT-2026-01', tipo: 'contagem', local: 'Almoxarifado', partes: { mat: true }, situacao: 'aberto', contagens: {}, recontar: {}, resolucoes: {}, abertoEm: nowISO(), porId: S.user.id, porNome: 'Joana Silva', contadorId: S.user.id, contadorNome: 'Joana Silva' }); location.hash = '#/almox/contagem'; });
  await q.waitForTimeout(300);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: a contagem não rola para o lado');
  const bt = await q.$$eval('.cg-it [data-act="cg-salva"]', l => l.map(x => Math.round(x.getBoundingClientRect().height)));
  conf(bt.length && bt.every(h => h >= 44), 'celular: botão "Contado" com 44 px');
  await q.screenshot({ path: path.join(SHOTS, 'v032-cel-claro-contar.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v032: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
