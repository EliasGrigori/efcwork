/* EFCwork · suíte da v0.6.14.2 — rodapé do apontamento (opção A), traço no tema escuro, menu da coluna (Limpar no alto, sem setas,
   lista que rola inteira), Solicitações sem texto de itens, lista retrátil que encolhe, pólen que para, linha do celular sem cobrir a foto.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v06142.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
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

const abreCol = async (p, k) => { await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="' + k + '"] .tb-hm'); await p.waitForTimeout(200); };
const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(250); };
async function entra(b, w, h, tema) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::|Failed to load/i.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await p.waitForTimeout(500); return p;
}
async function login(p) {
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
}
(async () => {
  const b = await chromium.launch();

  console.log('Tela de entrar no celular — a linha não cobre a foto:');
  const c = await entra(b, 390, 844);
  const r = await c.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom }; }; return { diz: q('.en-diz'), ft: q('.en-arco') }; });
  conf(r.diz && r.ft && r.diz.b <= r.ft.t + 20, 'a linha "Coletas, inspeções…" termina em ' + Math.round(r.diz && r.diz.b) + ' px e a foto começa em ' + Math.round(r.ft && r.ft.t) + ' px');
  conf(await c.evaluate(() => getComputedStyle(document.querySelector('.en-diz')).backgroundColor === 'rgba(0, 0, 0, 0)'), 'a linha é texto simples, sem caixa por cima da foto');
  conf(await c.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nada rola para o lado');
  await c.context().close();

  console.log('Pólen da tela de entrar para sozinho:');
  const pl = await entra(b, 1280, 800);
  const q1 = await pl.evaluate(() => new Promise(res => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = f => { n++; return o.call(window, f); }; setTimeout(() => res(n), 1000); }));
  conf(q1 > 5, 'nos primeiros segundos o pólen anima (' + q1 + ' quadros pedidos em 1 s)');
  await pl.waitForTimeout(11500);
  const q2 = await pl.evaluate(() => new Promise(res => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = f => { n++; return o.call(window, f); }; setTimeout(() => res(n), 1000); }));
  conf(q2 <= 3, 'depois de 10 s sem mexer o pólen parou (' + q2 + ' quadros pedidos em 1 s)');
  await pl.mouse.move(300, 300); await pl.mouse.move(420, 360); await pl.waitForTimeout(300);
  const q3 = await pl.evaluate(() => new Promise(res => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = f => { n++; return o.call(window, f); }; setTimeout(() => res(n), 600); }));
  conf(q3 > 3, 'mexer o mouse faz o pólen voltar (' + q3 + ')');
  await pl.context().close();

  console.log('Menu da coluna (PC):');
  const p = await entra(b, 1366, 820); await login(p); await semear(p);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(400);
  await abreCol(p, 'loc');
  conf(!(await p.$('.tb-mn-pe')) && !(await p.$('[data-act="tb-mvesq"]')) && !(await p.$('[data-act="tb-mvdir"]')), 'sem rodapé e sem setas esquerda/direita');
  conf(await p.evaluate(() => { const l = document.querySelector('.tb-mn [data-act="tb-mnlimpa"]'), o = document.querySelector('.tb-mn-ci'); return !!l && !!o && l.getBoundingClientRect().top < document.querySelector('.tb-mn-l').getBoundingClientRect().top; }), '"Limpar esta coluna" está no alto, acima da lista');
  conf(await p.evaluate(() => document.querySelector('[data-act="tb-mnlimpa"]').disabled), '"Limpar" desligado enquanto a coluna não tem filtro');
  conf(await p.evaluate(() => [...document.querySelectorAll('.tb-mn-cab, .tb-mn-g')].every(e => parseFloat(getComputedStyle(e).borderBottomWidth) === 0)), 'sem linhas divisórias entre as partes do menu (pedido de 14/11 08:17)');
  await p.click('[data-tbmnall]'); await p.waitForTimeout(250); // desmarca tudo
  conf(await p.evaluate(() => !document.querySelector('[data-act="tb-mnlimpa"]').disabled), 'com filtro, "Limpar" liga');
  const rol = await p.evaluate(() => { const m = document.querySelector('.tb-mn'), l = m.querySelector('.tb-mn-l'); const rolam = [...m.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1; }).length; l.scrollTop = l.scrollHeight; const it = [...l.querySelectorAll('.tb-mn-li')], u = it[it.length - 1], r = u.getBoundingClientRect(), lr = l.getBoundingClientRect(), mr = m.getBoundingClientRect(); return { rolam, visivel: r.bottom <= lr.bottom + 1 && r.top >= lr.top - 1, dentro: r.bottom <= mr.bottom + 1, n: it.length }; });
  conf(rol.rolam <= 1, 'só uma região rola dentro do menu (' + rol.rolam + ')');
  conf(rol.visivel && rol.dentro, 'o último item da lista aparece inteiro ao rolar até o fim (' + rol.n + ' itens)');
  await p.click('.tb-mn-li:last-child input'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => { const i = [...document.querySelectorAll('.tb-mn-li:not(.tb-mn-all) input')]; return i[i.length - 1].checked; }), 'depois de tirar tudo, dá para marcar de volta o item de baixo');
  await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(250);
  conf(!(await p.$('.tb-cab th[data-tbk="loc"] .tb-mf')), '"Limpar esta coluna" tira o filtro');
  await esc(p);

  console.log('Lista retrátil encolhe de verdade ao fechar (cópia visível):');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(400);
  await abreCol(p, 'loc');
  const dd = await p.evaluate(async () => {
    const bt = document.querySelector('.tb-mn .dd-b'); if (!bt) return { sem: true };
    bt.click(); await new Promise(r => setTimeout(r, 400));
    const aberta = !!document.querySelector('.dd-l:not([hidden])'); ddFecha(); await new Promise(r => setTimeout(r, 40));
    const fant = document.querySelector('.dd-fant'); const vis = !!fant && getComputedStyle(fant).display !== 'none' && !fant.hidden && fant.getBoundingClientRect().height > 10;
    await new Promise(r => setTimeout(r, 450)); return { aberta, vis, sumiu: !document.querySelector('.dd-fant'), fechada: !document.querySelector('.dd-l:not([hidden])') };
  });
  conf(!dd.sem, 'há uma lista retrátil no menu da coluna para testar');
  conf(dd.aberta, 'a lista abre');
  conf(dd.vis, 'logo depois de fechar, a cópia que encolhe está visível (antes sumia seca)');
  conf(dd.sumiu && dd.fechada, 'a cópia some sozinha em 150 ms e a lista fica fechada');
  await esc(p);

  console.log('Solicitações — itens só na janela:');
  await p.evaluate(() => { location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(500);
  const cabs = await p.$$eval('.tb[data-tb="al-sol"] .tb-cab th', l => l.map(x => x.textContent.trim()));
  const celulas = await p.$$eval('.tb[data-tb="al-sol"] .tb-t tbody tr[data-id="s1"] td', l => l.map(x => x.textContent.trim())), txtLinha = celulas.join(' | ');
  conf(!/Luva nitrílica|Ponteira/.test(txtLinha), 'a linha da tabela não traz o texto dos itens');
  conf(celulas.includes('2'), 'a coluna Itens mostra só a quantidade de itens (2) · linha: ' + txtLinha.slice(0, 90));
  await p.evaluate(() => { tbEstado('al-sol').busca = 'Ponteira'; render(); }); await p.waitForTimeout(450);
  conf(await p.$('.tb[data-tb="al-sol"] .tb-t tbody tr[data-id="s1"]') !== null, 'a busca ainda acha a solicitação pelo nome do item');
  await p.evaluate(() => { tbEstado('al-sol').busca = ''; render(); }); await p.waitForTimeout(400);
  await p.click('.tb[data-tb="al-sol"] .tb-t tbody tr[data-id="s1"]'); await p.waitForTimeout(600);
  conf(await p.evaluate(() => { const g = document.querySelector('#gv'); return !!g && /Luva nitrílica/.test(g.textContent) && /Ponteira/.test(g.textContent); }), 'a janela (gaveta) lista os itens com a quantidade');
  await esc(p);

  console.log('Apontamentos — rodapé opção A e traço no tema escuro:');
  await p.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await p.waitForTimeout(500);
  await p.evaluate(async () => { for (const [i, g] of [['a1', 'grave'], ['a2', 'urgente'], ['a3', 'media']]) await Data.col('sv2_apont').set(i, { cat: 'acidente', setor: 'Campo', grav: g, com: 'sim', obs: 'teste ' + g, sit: 'aberto', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: 'Joana Silva', data: hojeISO(), fotos: [] }); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { document.documentElement.dataset.tema = 'escuro'; }); await p.waitForTimeout(200);
  const tr = await p.evaluate(() => { const f = g => { const e = document.querySelector('.ap-card.g-' + g); if (!e) return null; const s = getComputedStyle(e); return s.borderLeftColor !== s.borderTopColor; }; return { grave: f('grave'), urgente: f('urgente') }; });
  conf(tr.grave !== null || tr.urgente !== null, 'há cartões Grave/Urgente na lista para conferir');
  conf((tr.grave === null || tr.grave) && (tr.urgente === null || tr.urgente), 'no tema escuro Grave e Urgente têm o traço colorido');
  await p.evaluate(() => { document.documentElement.dataset.tema = 'claro'; });
  await p.evaluate(() => { const a = S.apont.find(x => x.grav === 'grave'); if (a) apAbre(a.id); }); await p.waitForTimeout(700);
  const pe = await p.evaluate(() => [...document.querySelectorAll('#gv .ap-pe .bt')].map(x => { const r = x.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), txt: x.textContent.trim(), cort: x.scrollWidth > x.clientWidth + 1 }; }));
  conf(pe.length === 4 && pe.some(x => /Mudar gravidade/.test(x.txt)), '4 botões, um deles "Mudar gravidade" completo');
  conf(pe.every(x => !x.cort) && pe.every(x => x.w === pe[0].w && x.h === pe[0].h), 'nenhum texto cortado e os 4 do mesmo tamanho (' + pe.map(x => x.w + '×' + x.h).join(' ') + ')');
  conf(new Set(pe.map(x => x.t)).size === 2, 'duas linhas de dois botões');
  await esc(p);

  conf(p._er.length === 0, 'sem erro de JavaScript (' + p._er.slice(0, 2).join(' | ') + ')');
  await p.context().close();

  console.log('Menu da coluna (celular, folha de baixo):');
  const m = await entra(b, 390, 844); await login(m); await semear(m);
  await m.evaluate(() => { location.hash = '#/almox/materiais'; }); await m.waitForTimeout(500);
  await m.tap('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-hm').catch(() => m.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="loc"] .tb-hm')); await m.waitForTimeout(400);
  conf(!!(await m.$('.tb-mn')) && !(await m.$('.tb-mn-pe')), 'a folha abre sem rodapé de setas');
  conf(await m.evaluate(() => document.querySelector('[data-act="tb-mnlimpa"]').getBoundingClientRect().height >= 44 - 1), '"Limpar esta coluna" tem 44 px no toque');
  await m.waitForTimeout(500); await m.click('[data-tbmnall]'); await m.waitForTimeout(400);
  const rm = await m.evaluate(() => { const mn = document.querySelector('.tb-mn'), l = mn.querySelector('.tb-mn-l'); l.scrollTop = l.scrollHeight; const it = [...l.querySelectorAll('.tb-mn-li')], u = it[it.length - 1].getBoundingClientRect(), mr = mn.getBoundingClientRect(); return { dentro: u.bottom <= mr.bottom + 1 && u.bottom <= innerHeight + 1, sem: document.documentElement.scrollWidth <= innerWidth }; });
  conf(rm.dentro, 'no celular o último item também fica à vista');
  conf(rm.sem, 'nada rola para o lado');
  conf(m._er.length === 0, 'sem erro de JavaScript no celular');
  await m.context().close();

  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas');
  process.exit(falhas ? 1 : 0);
})();
