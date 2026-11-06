/* EFCwork · suíte da v0.3.6 — fluido Gota na linha do tempo; Colaborador guarda / põe em uso / muda lugares com o porquê e fica
   aguardando confirmação (o líder confirma ou recusa pela gaveta ou pelo sino); recontagem sem apagar marcas (quem conta só grava
   `contagens`); o modo demonstração imita as regras do Firestore. Uso: node tools/testes/t_v036.js */
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
async function primeiro(p) { await p.goto(URL); await p.waitForTimeout(400); await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600); await semear(p);
  await p.evaluate(async () => { const C = Data.col.bind(Data), h = hojeISO();
    await C('sv2_alm_equip').set('mp1', { nome: 'Micropipeta 100-1000 µL', tag: 'MP-01', marca: 'Eppendorf', situacao: 'ativo', precisaCal: true, cal: { ultima: addDias(h, -100), freqMeses: 12 }, local: 'Laboratório', posicao: 'Bancada 1' });
    await C('sv2_alm_equip').set('mp2', { nome: 'Micropipeta 100-1000 µL', tag: 'MP-02', marca: 'Eppendorf', situacao: 'armazenado', guardadoEm: addDias(h, -20), precisaCal: true, cal: { ultima: addDias(h, -90), freqMeses: 12 }, local: 'Laboratório', posicao: 'Gaveta 02' });
    await C('sv2_alm_equip').set('mp3', { nome: 'Micropipeta 100-1000 µL', tag: 'MP-03', situacao: 'armazenado', precisaCal: true, cal: { ultima: addDias(h, -500), freqMeses: 12 }, local: 'Laboratório', posicao: 'Porta 05' });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: { almox: true } });
  }); await p.waitForTimeout(200); }
const abreEq = async (p, id) => { await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(150); await p.click('.tb-t tbody tr[data-id="' + id + '"]'); await p.waitForTimeout(350); };
const eq = (p, id) => p.evaluate(i => JSON.parse(JSON.stringify(S.almEq.find(x => x.id === i))), id);
const estado = p => p.evaluate(() => { const w = document.querySelector('#gv .cb-tlw'); if (!w) return null; const lis = Array.from(w.querySelectorAll('.cb-tl > li')); return { esp: lis.map((l, n) => l.classList.contains('esp') ? n + 1 : 0).filter(Boolean).join(','), nivel: S._cbNivel[w.getAttribute('data-cbtl')], gota: !!w.querySelector('.cb-gota'), onda: !!w.querySelector('.cb-onda'), fill: lis.map(l => Math.round(l.querySelector('.cb-in').getBoundingClientRect().height)).join(',') }; });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Fluido Gota');
  await p.evaluate(async () => { await Data.col('sv2_alm_cal').set('c1', { numero: 'CAL-2026-01', prestador: 'LABOR', itens: [{ equipId: 'e1', tag: 'PHM-02', nome: 'pHmetro', valor: 180 }], situacao: 'ativa', cotacaoEm: hojeISO(), agenda: { data: addDias(hojeISO(), 3) }, criadoEm: nowISO(), criadoPorNome: 'Joana Silva' }); location.hash = '#/almox/calibracao'; });
  await p.waitForTimeout(300); await p.click('.cb-card'); await p.waitForTimeout(60);
  let s = await estado(p);
  conf(s.esp === '2,3' && /^\d+,0,0,0,0$/.test(s.fill) && Number(s.fill.split(',')[0]) >= 26, 'começa com só a 1ª bolinha cheia (' + s.fill + ')');
  let viuGota = false, viuOnda = false; const t0 = Date.now();
  while (Date.now() - t0 < 1400) { const x = await estado(p); if (x.gota) viuGota = true; if (x.onda) viuOnda = true; await p.waitForTimeout(30); }
  conf(viuGota, 'o fluido para na borda e cai uma gota na bolinha');
  conf(viuOnda, 'a bolinha solta uma onda quando a gota chega');
  await p.waitForTimeout(250); s = await estado(p);
  const f2 = Number(s.fill.split(',')[1]);
  conf(s.nivel === 2 && f2 >= 26, 'a 2ª bolinha encheu de baixo para cima (' + s.fill + ')');
  await p.waitForTimeout(1500); s = await estado(p);
  conf(s.nivel === 3 && s.esp === '' && /^\d+,\d+,\d+,0,0$/.test(s.fill), 'depois de 0,4 s, a mesma coisa na 3ª (' + s.fill + ')');
  const top = await p.evaluate(() => { const w = document.querySelector('#gv .cb-tlw'), f = w.querySelector('.cb-fluido').getBoundingClientRect(), n = w.querySelectorAll('.cb-tl > li')[2].querySelector('.cb-n').getBoundingClientRect(); return Math.round(n.top - f.bottom); });
  conf(top >= -2 && top <= 4, 'o fluido termina na borda de cima da bolinha, não no meio (' + top + ' px)');
  await p.screenshot({ path: path.join(SHOTS, 'v036-pc-claro-gota.png') });
  await esc(p);

  console.log('— Colaborador pede (aguarda confirmação)');
  await entra(p, 'ana.lima'); await abreEq(p, 'mp2');
  await p.click('#gv [data-act="lg-usar"]'); await p.waitForTimeout(150);
  conf(/aguardando a confirmação/.test(await p.textContent('#gv .fm-av.wa')) && /Joana Silva/.test(await p.textContent('#gv .fm-av.wa')), 'o formulário avisa: fica aguardando a confirmação de Joana Silva; pode usar normalmente');
  conf(/Pedir para pôr em uso/.test(await p.textContent('#gv .gv-pe')), 'botão "Pedir para pôr em uso"');
  await dd(p, 'lc:lg~lugar', 'Bancada 1'); await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(100);
  conf(/porquê/.test(await msg(p)), 'sem o porquê: "Diga o porquê: quem confirma precisa saber"');
  await p.fill('#gv [data-fm="motivo"]', 'a MP-01 está vazando'); await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(400);
  let a = await p.evaluate(() => { const x = S.aprov.find(y => y.payload && y.payload.acao === 'lg_usar'); return x && { st: x.status, para: x.paraNomes.join(), mot: x.payload.motivo, l: x.payload.lugar, ref: x.payload.refId }; });
  conf(a && a.st === 'pendente' && a.para === 'Joana Silva' && a.mot === 'a MP-01 está vazando' && a.l === 'Bancada 1' && a.ref === 'mp2', 'pedido criado para o superior, com o lugar e o porquê');
  conf((await eq(p, 'mp2')).situacao === 'armazenado', 'o equipamento ainda não mudou (espera a confirmação)');
  conf(/Aguardando confirmação: Pôr em uso · Bancada 1/.test(await p.textContent('#gv .lg-pend')) && /a MP-01 está vazando/.test(await p.textContent('#gv .lg-pend')) && !(await p.$('#gv .lg-pend [data-act="lg-apr"]')), 'a gaveta mostra "Aguardando confirmação…" com quem e o porquê (sem botão de confirmar para ela)');
  await p.screenshot({ path: path.join(SHOTS, 'v036-pc-claro-aguardando.png') });
  await p.click('#gv [data-act="lg-usar"]'); await p.waitForTimeout(150);
  conf(/Já tem um pedido/.test(await p.textContent('#gv .fm-av.cr')), 'abrindo de novo, o formulário já avisa que tem pedido esperando');
  await dd(p, 'lc:lg~lugar', 'Bancada 1'); await p.fill('#gv [data-fm="motivo"]', 'teste de segundo pedido'); await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(150);
  conf(/Já tem um pedido/.test(await msg(p)), 'não deixa um segundo pedido do mesmo equipamento enquanto o primeiro espera');
  await esc(p); await p.waitForTimeout(100); if (await p.$('[data-act="cf-sim"]')) { await p.click('[data-act="cf-sim"]'); await p.waitForTimeout(200); }
  await abreEq(p, 'mp1'); await p.click('#gv [data-act="lg-guardar"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:lg~lugar', 'Outro lugar'); await p.fill('#gv [data-fm="lugarTxt"]', 'Gaveta 09'); await p.fill('#gv [data-fm="motivo"]', 'está vazando, vai para manutenção');
  await p.click('[data-act="lg-guardar-ok"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => S.aprov.filter(x => x.status === 'pendente' && x.payload && /^lg_/.test(x.payload.acao)).length === 2), 'segundo equipamento: outro pedido (Guardar na Gaveta 09)');

  console.log('— Líder confirma e recusa');
  await entra(p, 'joana.silva'); await abreEq(p, 'mp2');
  conf((await p.$$('#gv .lg-pend [data-act="lg-apr"]')).length === 1, 'para o líder, a gaveta tem Confirmar e Recusar');
  await p.screenshot({ path: path.join(SHOTS, 'v036-pc-claro-confirmar.png') });
  await p.click('#gv [data-act="lg-apr"]'); await p.waitForTimeout(500);
  let m2 = await eq(p, 'mp2'); const h = m2.hist.slice(-1)[0];
  conf(m2.situacao === 'ativo' && m2.posicao === 'Bancada 1' && m2.posGuarda === 'Gaveta 02', 'confirmado: a MP-02 fica em uso na Bancada 1 (quem gravou foi o líder)');
  conf(/a MP-01 está vazando/.test(h.texto) && /pedido de Ana Lima/.test(h.texto) && h.porNome === 'Ana Lima' && h.confirmadoPor === 'Joana Silva', 'histórico: o porquê, "pedido de Ana Lima" e "confirmado por Joana Silva"');
  conf(!(await p.$('#gv .lg-pend')), 'o aviso de "aguardando" sai da gaveta');
  await abreEq(p, 'mp1'); await p.click('#gv [data-act="lg-rep"]'); await p.waitForTimeout(150);
  await p.click('[data-act="lg-rep-ok"]'); await p.waitForTimeout(100);
  conf(/Escreva o motivo/.test(await msg(p)), 'recusar pede o motivo');
  await p.fill('#gv [data-fm="motivoR"]', 'a MP-01 fica na bancada; a manutenção é amanhã'); await p.click('[data-act="lg-rep-ok"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => { const x = S.aprov.find(y => y.payload && y.payload.refId === 'mp1'); return x.status === 'reprovado' && /amanhã/.test(x.decisao.motivo); }) && (await eq(p, 'mp1')).situacao === 'ativo', 'recusado com o motivo; a MP-01 não muda');

  console.log('— Regras do Firestore imitadas no demo');
  await entra(p, 'ana.lima'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => S.notifs.some(n => /reprovou/.test(n.texto) && /amanhã/.test(n.texto))), 'Ana recebe a recusa no sino, com o motivo');
  const neg = await p.evaluate(async () => { try { await Data.col('sv2_alm_equip').update('mp1', { posGuarda: 'X' }); return 'gravou'; } catch (e) { return svErro(e); } });
  conf(/permissão/.test(neg), 'Colaborador gravando posGuarda direto: "O Firebase não deixou gravar (permissão)", como no Firestore real');

  console.log('— Recontagem: quem conta só grava "contagens"');
  await entra(p, 'joana.silva');
  await p.evaluate(async () => { const ana = S.users.find(u => u.login === 'ana.lima'); await Data.col('sv2_alm_inv').add({ numero: 'CNT-2026-01', tipo: 'contagem', local: 'Almoxarifado', partes: { mat: true }, situacao: 'aberto', contagens: {}, recontar: {}, resolucoes: {}, abertoEm: nowISO(), porId: S.user.id, porNome: S.user.nome, contadorId: ana.id, contadorNome: ana.nome }); });
  await entra(p, 'ana.lima'); await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(300);
  await p.evaluate(async () => { const inv = cgAberta(); for (const a of cgAlvos(inv)) { document.querySelectorAll('[data-cgk="' + a.k + '"]').forEach(x => { const l = x.getAttribute('data-cgl'); x.value = a.k === 'm:luva' ? '0' : String(l ? (alLotes(a.i.id).find(y => y.id === l) || { saldo: 0 }).saldo : alSaldo(a.i.id)); }); await cgSalvar(a.k); await new Promise(r => setTimeout(r, 30)); } });
  await p.waitForTimeout(300);
  await entra(p, 'joana.silva'); await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(300);
  await dd(p, 'cg:vista', 'conferência'); await p.waitForTimeout(150); await p.click('[data-act="cg-recontar"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => { const inv = cgAberta(); return inv.recontar.m_luva === 1 && cgRc(inv, 'm:luva'); }), 'pedir recontagem grava o nº da contagem (1), não um sim/não');
  await entra(p, 'ana.lima'); await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(300);
  conf((await p.$$('.cg-rec .cg-it[data-k="m:luva"]')).length === 1, 'Ana vê a fita em "Recontar"');
  const antes = await p.evaluate(() => JSON.stringify(cgAberta().recontar));
  await p.fill('.cg-rec [data-cgk="m:luva"]', '0'); await p.click('.cg-rec .cg-it[data-k="m:luva"] [data-act="cg-salva"]'); await p.waitForTimeout(300);
  const dep = await p.evaluate(() => { const inv = cgAberta(); return { rc: JSON.stringify(inv.recontar), pend: cgRc(inv, 'm:luva'), n: cgContagens(inv)['m:luva'].ant.length }; });
  conf(dep.rc === antes && !dep.pend && dep.n === 1, 'Ana reconta sem erro de permissão: a marca fica como estava e a recontagem conta como feita');
  conf(erros.length === 0, 'nenhum erro de JavaScript' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  await entra(p, 'joana.silva'); await p.evaluate(() => { location.hash = '#/almox/contagem'; }); await p.waitForTimeout(300);
  await dd(p, 'cg:vista', 'conferência'); await p.waitForTimeout(150);
  await p.click('.tb-t tbody tr[data-id="m:luva"]'); await p.waitForTimeout(150); await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:cgtipo', 'Perda'); await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300); await esc(p);
  conf(await p.evaluate(() => { const inv = cgAberta(); return inv.resolucoes.m_luva.nCont === 1 && !!cgRs(inv, 'm:luva'); }), 'a decisão guarda em qual contagem foi tomada');
  await p.evaluate(async () => { const inv = cgAberta(); await Data.col('sv2_alm_inv').update(inv.id, { 'contagens.m_luva': Object.assign({}, inv.contagens.m_luva, { ant: inv.contagens.m_luva.ant.concat([{ cont: 0 }]) }) }); });
  await p.waitForTimeout(200);
  conf(await p.evaluate(() => !cgRs(cgAberta(), 'm:luva')), 'se o item for contado de novo, a decisão antiga deixa de valer (precisa decidir de novo)');

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(() => document.querySelector('[data-act="cs-sair"]').click()); await q.waitForTimeout(300); await q.fill('#en-login', 'ana.lima'); await q.fill('#en-senha', 'senha1234'); await q.click('[data-form="en-entrar"] button[type=submit]'); await q.waitForTimeout(700); await abreEq(q, 'mp2'); await q.click('#gv [data-act="lg-usar"]'); await q.waitForTimeout(200);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: pedido sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v036-cel-claro-pedir.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v036: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
