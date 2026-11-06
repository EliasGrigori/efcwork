/* EFCwork · suíte da v0.3.5 — onde cada coisa fica: lugar de guarda e de uso do equipamento (Guardar, Pôr em uso, reservas iguais),
   vidraria distribuída por lugar dentro do laboratório, inventário por lugar, coluna Local curta, caminho do Firestore sem '~'.
   Modo demonstração. Uso: node tools/testes/t_v035.js */
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
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Coluna Local curta');
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(200);
  const loc = await p.evaluate(() => { const th = Array.from(document.querySelectorAll('.tb-t thead th')).findIndex(x => /Local/.test(x.textContent)); const td = document.querySelector('.tb-t tbody tr[data-id="mp1"]').children[th]; return [td.textContent, td.title]; });
  conf(loc[0] === 'Bancada 1' && /Laboratório · Bancada 1/.test(loc[1]), 'tabela mostra só o lugar ("Bancada 1"); o completo fica no passar o mouse e na gaveta (' + loc.join(' | ') + ')');

  console.log('— Onde está o equipamento');
  await abreEq(p, 'mp1');
  conf(/Em uso · Laboratório/.test(await p.textContent('#gv .lg-agora')) && /Bancada 1/.test(await p.textContent('#gv .lg-agora b')), 'gaveta: "Onde está" = Em uso · Laboratório · Bancada 1, em destaque');
  const ig = await p.$$eval('#gv .lg-ig', l => l.map(x => x.textContent));
  conf(ig.length === 2 && ig.some(t => /MP-02/.test(t) && /reserva guardada/.test(t) && /Gaveta 02/.test(t)), '"Iguais a este": as outras micropipetas, com a reserva guardada e onde está (' + ig.join(' / ') + ')');
  await p.screenshot({ path: path.join(SHOTS, 'v035-pc-claro-onde-esta.png') });
  await p.click('#gv .lg-ig:has-text("MP-02")'); await p.waitForTimeout(250);
  conf(/MP-02/.test(await p.textContent('#gv .gv-cab, #gv header').catch(() => '')) || /Micropipeta/.test(await titulo(p)) && /Guardado/.test(await p.textContent('#gv .lg-agora')), 'tocar na reserva abre ela (Guardado · Gaveta 02)');
  conf((await p.$$('#gv [data-act="lg-usar"]')).length === 1 && !(await p.$('#gv [data-act="lg-guardar"]')), 'guardado: botão "Pôr em uso" (e não "Guardar")');

  console.log('— Pôr em uso a reserva');
  await p.click('#gv [data-act="lg-usar"]'); await p.waitForTimeout(150);
  const opUso = await p.$$eval('[data-dd="lc:lg~lugar"] li[data-v]', l => l.map(x => x.getAttribute('data-v')));
  conf(opUso.indexOf('Bancada 1') >= 0 && !opUso.some(v => /^(Gaveta|Porta)/.test(v)), 'a lista de lugares de uso não mostra gavetas nem portas (' + opUso.join(', ') + ')');
  await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(80);
  conf(/Diga onde/.test(await msg(p)), 'sem lugar: "Diga onde ele vai ficar em uso"');
  await dd(p, 'lc:lg~lugar', 'Bancada 1'); await p.fill('#gv [data-fm="motivo"]', 'substitui a MP-01, que deu problema');
  await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(350);
  let m2 = await eq(p, 'mp2');
  conf(m2.situacao === 'ativo' && m2.posicao === 'Bancada 1' && m2.posUso === 'Bancada 1' && m2.posGuarda === 'Gaveta 02' && !m2.guardadoEm, 'em uso na Bancada 1; o lugar de guarda (Gaveta 02) fica lembrado');
  conf(/Posto em uso em Bancada 1 — substitui/.test(m2.hist.slice(-1)[0].texto) && m2.hist.slice(-1)[0].tipo === 'usar', 'histórico: "Posto em uso em Bancada 1 — substitui a MP-01…"');
  conf(/Micropipeta/.test(await titulo(p)) && /Em uso/.test(await p.textContent('#gv .lg-agora')), 'volta para a gaveta do equipamento, já atualizada');

  console.log('— Guardar');
  await abreEq(p, 'mp1'); await p.click('#gv [data-act="lg-guardar"]'); await p.waitForTimeout(150);
  const opG = await p.$$eval('[data-dd="lc:lg~lugar"] li[data-v]', l => l.map(x => x.getAttribute('data-v')));
  conf(opG.indexOf('Gaveta 02') >= 0 && opG.indexOf('Bancada 1') < 0, 'a lista de guarda mostra gavetas e portas, sem bancada (' + opG.join(', ') + ')');
  await dd(p, 'lc:lg~lugar', 'Outro lugar'); await p.fill('#gv [data-fm="lugarTxt"]', '  porta   07 ');
  await p.click('[data-act="lg-guardar-ok"]'); await p.waitForTimeout(350);
  let m1 = await eq(p, 'mp1');
  conf(m1.situacao === 'armazenado' && m1.posicao === 'Porta 07' && m1.posGuarda === 'Porta 07' && m1.posUso === 'Bancada 1' && m1.guardadoEm === await p.evaluate(() => hojeISO()), 'guardado na "Porta 07" (nome arrumado); o lugar de uso (Bancada 1) fica lembrado; calibração pausa como no EFClaudian');
  conf(await p.evaluate(() => eqCalSit(S.almEq.find(x => x.id === 'mp1')) === 'pausada'), 'calibração "Pausada (guardado)"');
  await p.click('#gv [data-act="lg-usar"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => S.fm.lugar === 'Bancada 1'), 'Pôr em uso de novo já vem com a Bancada 1');
  await esc(p); await esc(p);

  console.log('— Calibração vencida ao pôr em uso');
  await abreEq(p, 'mp3'); await p.click('#gv [data-act="lg-usar"]'); await p.waitForTimeout(150);
  conf(/calibração vencida/.test(await p.textContent('#gv .fm-av.cr')) && /Uso com restrição/.test(await p.textContent('#gv .fm-av.cr')), 'avisa: calibração vencida → vai entrar como "Uso com restrição"');
  await dd(p, 'lc:lg~lugar', 'Bancada 1'); await p.click('[data-act="lg-usar-ok"]'); await p.waitForTimeout(350);
  conf((await eq(p, 'mp3')).situacao === 'restricao', 'entrou como "Uso com restrição"');

  console.log('— Lugares de referência (pino)');
  await abreEq(p, 'mp3'); await p.click('#gv [data-act="lg-ref"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => S.fm.pu === 'Bancada 1' && S.fm.pg === 'Porta 05'), 'o pino abre os dois lugares (a guarda ficou lembrada ao pôr em uso)');
  await dd(p, 'lc:lg~pg', 'Gaveta 02'); await p.click('[data-act="lg-ref-ok"]'); await p.waitForTimeout(350);
  conf((await eq(p, 'mp3')).posGuarda === 'Gaveta 02', 'lugar de guarda trocado para a Gaveta 02');

  console.log('— Vidraria por lugar');
  await abreEq(p, 'e4');
  conf(/Sem lugar definido/.test(await p.textContent('#gv')) && /12/.test(await p.textContent('#gv .lg-lab')), 'béquer sem lugares: "Sem lugar definido 12"');
  await p.click('#gv [data-act="lg-dist"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:lg~d.0.l', 'Suporte de vidrarias'); await p.fill('#gv [data-fm="d.0.q"]', '4');
  await p.click('#gv [data-act="lg-dist-add"]'); await p.waitForTimeout(80);
  await dd(p, 'lc:lg~d.1.l', 'Outro lugar'); await p.fill('#gv [data-fm="d.1.lTxt"]', 'Gaveta 03'); await p.fill('#gv [data-fm="d.1.q"]', '9');
  await p.click('[data-act="lg-dist-ok"]'); await p.waitForTimeout(150);
  conf(/Passou do total/.test(await msg(p)), 'passou do total (13 de 12): não deixa e manda usar o Inventário');
  await p.fill('#gv [data-fm="d.1.q"]', '8'); await p.dispatchEvent('#gv [data-fm="d.1.q"]', 'change'); await p.waitForTimeout(80);
  await p.screenshot({ path: path.join(SHOTS, 'v035-pc-claro-vidraria-lugares.png') });
  await p.click('[data-act="lg-dist-ok"]'); await p.waitForTimeout(350);
  let v = await eq(p, 'e4');
  conf(JSON.stringify(v.qtdPos) === JSON.stringify({ 'Laboratório': { 'Suporte de vidrarias': 4, 'Gaveta 03': 8 } }) && v.qtdGuard['Laboratório'] === 8 && v.qtdLocal['Laboratório'] === 12, 'grava 4 no suporte (em uso) e 8 na Gaveta 03 (guardadas = 8, compatível com o EFClaudian)');
  const ld = await p.$$eval('#gv .lg-l', l => l.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  conf(ld.length === 2 && /Gaveta 03\s*guardadas\s*8/.test(ld[0]) && /Suporte de vidrarias\s*em uso\s*4/.test(ld[1]), 'gaveta do béquer: "Onde ficam" com cada lugar, guardadas / em uso (' + ld.join(' | ') + ')');
  await p.screenshot({ path: path.join(SHOTS, 'v035-pc-claro-vidraria-onde.png') });
  await esc(p);
  const lb = await p.evaluate(() => { const th = Array.from(document.querySelectorAll('.tb-t thead th')).findIndex(x => /Local/.test(x.textContent)); return document.querySelector('.tb-t tbody tr[data-id="e4"]').children[th].textContent; });
  conf(lb === '2 lugares', 'na tabela: "2 lugares" (' + lb + ')');

  console.log('— Tirar um lugar da lista (segurar e arrastar)');
  await abreEq(p, 'mp1'); await p.click('#gv [data-act="lg-ref"]'); await p.waitForTimeout(150);
  const r = await arrasta(p, 'lc:lg~pu', 'Suporte de vidrarias');
  conf(r && await p.evaluate(() => (S.almPref.lugOcultos || []).indexOf('Suporte de vidrarias') >= 0), 'segurar 1,5 s e arrastar para a lixeira tira o lugar da lista');
  await p.evaluate(() => alPrefGravar({ lugOcultos: [] })); await esc(p); await p.waitForTimeout(100); await esc(p);

  console.log('— Inventário por lugar');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(300);
  await p.click('.cs-acts a[data-inv]'); await p.waitForTimeout(250); await p.click('[data-act="cg-nova"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:cgcont', 'Joana Silva'); await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(400);
  const ks = await p.evaluate(() => cgAlvos(cgAberta()).filter(a => a.e && /^(e4|mp)/.test(a.e.id)).map(a => a.k + '=' + a.local).join(' '));
  conf(/v:e4__laboratorio__suporte-de-vidrarias=Suporte de vidrarias/.test(ks) && /v:e4__laboratorio__gaveta-03=Gaveta 03/.test(ks) && /e:mp1=Porta 07/.test(ks), 'o béquer é contado em cada lugar; a micropipeta guardada aparece na Porta 07 (' + ks + ')');
  await p.evaluate(() => { const e = document.querySelector('.cg-it[data-k^="v:e4__"]'); if (e) e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(100); await p.screenshot({ path: path.join(SHOTS, 'v035-pc-claro-inventario-lugares.png') });
  conf(!/[~*\/\[\]]/.test(ks), 'chaves sem ~ * / [ ] (o Firestore recusa esses no caminho)');
  await p.fill('[data-cgk="v:e4__laboratorio__suporte-de-vidrarias"]', '3'); await p.click('.cg-it[data-k="v:e4__laboratorio__suporte-de-vidrarias"] [data-act="cg-salva"]'); await p.waitForTimeout(220);
  await p.fill('[data-cgk="v:e4__laboratorio__gaveta-03"]', '8'); await p.click('.cg-it[data-k="v:e4__laboratorio__gaveta-03"] [data-act="cg-salva"]'); await p.waitForTimeout(220);
  conf(await p.evaluate(() => { const c = cgContagens(cgAberta()); return c['v:e4__laboratorio__suporte-de-vidrarias'].esp.total === 4 && c['v:e4__laboratorio__gaveta-03'].esp.total === 8; }), 'o esperado de cada lugar é o daquele lugar (4 e 8), às cegas');
  await p.evaluate(async () => { const inv = cgAberta(); for (const a of cgAlvos(inv)) if (!cgContagens(inv)[a.k]) await cgSalvar(a.k, true); }); await p.waitForTimeout(300);
  await dd(p, 'cg:vista', 'conferência'); await p.waitForTimeout(200);
  const lug = await p.evaluate(() => { const th = Array.from(document.querySelectorAll('.tb-t thead th')).findIndex(x => /Lugar/.test(x.textContent)); return Array.from(document.querySelectorAll('.tb-t tbody tr[data-id]')).map(tr => tr.children[th].textContent).join(','); });
  conf(lug === 'Suporte de vidrarias', 'conferência: coluna Lugar curta, só o que não bateu (' + lug + ')');
  await p.click('.tb-t tbody tr[data-id="v:e4__laboratorio__suporte-de-vidrarias"]'); await p.waitForTimeout(150); await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:cgtipo', 'Quebra'); await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300); await esc(p);
  await p.click('[data-act="cg-concluir"]'); await p.waitForTimeout(900);
  v = await eq(p, 'e4');
  conf(v.qtdLocal['Laboratório'] === 11 && v.qtdPos['Laboratório']['Suporte de vidrarias'] === 3 && v.qtdPos['Laboratório']['Gaveta 03'] === 8 && v.qtdGuard['Laboratório'] === 8, 'concluir: total 12 → 11, suporte 4 → 3, gaveta continua 8');
  conf(/Laboratório › Suporte de vidrarias 4 → 3/.test(v.hist.slice(-1)[0].texto), 'histórico: "Laboratório › Suporte de vidrarias 4 → 3"');
  conf(await p.evaluate(async () => { try { await Data.col('sv2_alm_inv').update(S.almInv[0].id, { 'contagens.v_x~y': 1 }); return false; } catch (e) { return /Invalid field path/.test(e.message); } }), 'demonstração recusa "~" no caminho, como o Firestore (o erro da v0.3.4 não volta)');
  await p.evaluate(() => { csTrocaTema('escuro'); gvFecharSo(); S.camadas = []; }); await abreEq(p, 'mp2'); await p.screenshot({ path: path.join(SHOTS, 'v035-pc-escuro-onde-esta.png') }); await p.evaluate(() => csTrocaTema('claro')); await esc(p);
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Colaborador e celular');
  await entra(p, 'ana.lima'); await abreEq(p, 'mp2');
  conf((await p.$$('#gv [data-act="lg-guardar"]')).length === 1, 'Colaborador também guarda e põe em uso (é quem usa a bancada)');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await abreEq(q, 'mp1');
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && Math.round(document.getElementById('gv').getBoundingClientRect().width) === innerWidth), 'celular: gaveta em tela cheia, sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v035-cel-claro-onde-esta.png') });
  await q.click('#gv [data-act="lg-guardar"]'); await q.waitForTimeout(200);
  await q.screenshot({ path: path.join(SHOTS, 'v035-cel-claro-guardar.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v035: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
