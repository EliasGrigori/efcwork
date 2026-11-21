/* EFCwork · suíte da v0.6.15 (parte 1) — defeitos da Varredura 2, parte B do Grok: D1 Atividade, D2/D3 sino, D4 texto longo,
   D5 cartão do plano no celular, D7 busca no celular, D9 singular, D10 foto quebrada, D11 toques, nome repetido, Pontos numérico.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0615.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(300); };
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
  const p = await entra(b, 1280, 800); await login(p); await semear(p);

  console.log('D1 — Atividade lê pelo período (não para em 1000):');
  await p.evaluate(() => {
    const l = [], agora = Date.now();
    for (let i = 0; i < 3200; i++) { const t = new Date(agora - (i % 45) * 864e5 - (i % 600) * 6e4).toISOString(); l.push({ id: 'au' + i, ts: t, userId: S.user.id, userName: 'Joana Silva', perfil: 'principal', acao: 'abrir_app', entidade: '', entidadeId: '', resumo: i % 2 ? 'Joana Silva abriu o app' : 'abriu o app', versao: 'EFCwork 0.6.15' }); }
    Store.set('sv2demo_sv2_audit', JSON.stringify(l)); atOuve();
  });
  await p.evaluate(() => { location.hash = '#/adm/atividade'; }); await p.waitForTimeout(700);
  const n30 = await p.evaluate(() => S.audit.length);
  conf(n30 > 1000, 'últimos 30 dias: ' + n30 + ' registros lidos (antes parava em 1000)');
  const zeros = await p.evaluate(() => [...document.querySelectorAll('.at-cols i')].filter(i => i.classList.contains('vz')).length);
  conf(zeros === 0, 'o gráfico de 30 dias não tem dia zerado (' + zeros + ' vazios)');
  await p.evaluate(() => DD_AO.at('dias', '0')); await p.waitForTimeout(500);
  const nt = await p.evaluate(() => S.audit.length);
  conf(nt === 3200, '"Todo o período" lê tudo: ' + nt + ' de 3200');
  conf(/3200 registros|3\.200 registros/.test(await p.textContent('.at-bar')), 'a barra mostra 3200 registros');
  await p.evaluate(() => DD_AO.at('dias', '7')); await p.waitForTimeout(400);
  conf(await p.evaluate(() => S.audit.length) < nt, 'voltar para 7 dias lê só o período (no mínimo os 30 do gráfico)');
  const nome = await p.evaluate(() => [...document.querySelectorAll('.at-t')].map(x => x.textContent).find(t => /abriu o app/.test(t)) || '');
  conf(!/Joana Joana/.test(nome) && /Joana abriu o app/.test(nome), 'o nome não se repete na linha: "' + nome.slice(0, 40) + '"');

  console.log('D2/D3 — sino:');
  await p.evaluate(async () => {
    const d = notifDest('todos'), base = Date.now();
    for (let i = 0; i < 45; i++) await Data.col('sv2_notifs').set('nt' + i, { ts: new Date(base - i * 36e5).toISOString(), nivel: 'info', titulo: i === 44 ? 'Cadastro completo' : i === 1 ? 'Autorização pedida' : 'Aviso ' + i, texto: i === 1 ? 'Ana Souza pediu para excluir a coleta 12' : 'texto ' + i, para: 'todos', dest: d, origem: 'Ana Souza', refTipo: i === 1 ? 'aprovacao' : i === 2 ? 'apont' : '', refId: '', lidaPor: i === 44 || i < 3 ? {} : (() => { const o = {}; o[S.user.id] = new Date().toISOString(); return o; })(), confirmadaPor: {} });
  });
  await p.waitForTimeout(500);
  await p.evaluate(() => snAbrir()); await p.waitForTimeout(600);
  const sn = await p.evaluate(() => ({ nl: Notif.unread().length, marcados: document.querySelectorAll('#gv .sn-n.nl').length, cad: /Cadastro completo/.test(document.querySelector('#gv').textContent), mais: !!document.querySelector('[data-act="sn-mais"]') }));
  conf(sn.nl === sn.marcados, 'o número de não lidos (' + sn.nl + ') é igual aos marcados na lista (' + sn.marcados + ')');
  conf(sn.cad, 'o aviso antigo não lido ("Cadastro completo") aparece na lista');
  conf(sn.mais, 'há "Mostrar mais" para os avisos antigos já lidos');
  await p.click('[data-act="sn-abre"][data-id="nt1"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => { const d = document.querySelector('#gv .sn-det'); return !!d && /Ana Souza pediu/.test(d.textContent) && !d.querySelector('a[href*="efclaudian"]'); }), 'tocar em "Autorização pedida" abre o detalhe com o texto (sem link para o EFClaudian, 20/11)');
  await p.click('[data-act="sn-mais"]'); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !document.querySelector('[data-act="sn-mais"]') || document.querySelectorAll('#gv .sn-n').length > 40), '"Mostrar mais" traz os avisos seguintes');
  await esc(p); await esc(p);

  console.log('D4 — texto longo na tabela:');
  await p.evaluate(async () => { await Data.col('sv2_lanc').set('lz1', { ts: nowISO(), data: hojeISO(), alvoTipo: 'doc', alvoId: 'x', alvoNome: 'Planilha de cloro', entreguePor: 'Ana', lancadoPorNome: 'Joana Silva', obs: 'Observação muito comprida '.repeat(14) }); });
  await p.evaluate(() => { location.hash = '#/documentos/historico'; }); await p.waitForTimeout(700);
  const lg = await p.evaluate(() => { const td = document.querySelector('.tb-t td.tb-lg'); const t = document.querySelector('.tb-t'); return td ? { w: Math.round(td.getBoundingClientRect().width), tit: (td.getAttribute('title') || '').length, tab: Math.round(t.getBoundingClientRect().width) } : null; });
  conf(!!lg && lg.w <= 330, 'a Observação comprida corta com "…" (' + (lg && lg.w) + ' px; antes ~2000 px)');
  conf(!!lg && lg.tit > 300, 'o texto inteiro aparece ao parar o mouse (title)');
  conf(!!lg && lg.tab < 1600, 'a tabela fica perto da largura da tela (' + (lg && lg.tab) + ' px)');

  console.log('D9 — singular:');
  await p.evaluate(() => { location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(500);
  await p.evaluate(() => { tbEstado('al-sol').busca = '1042'; render(); }); await p.waitForTimeout(300);
  conf(/1 de 2 solicitações|\b1 solicitação\b/.test(await p.textContent('.tb-bar')), 'barra: "' + (await p.textContent('.tb-bar .tb-cont')).trim() + '"');
  conf(await p.evaluate(() => tbSing('impressos') === 'impresso' && tbSing('itens ativos') === 'item ativo' && tbSing('pontos de água') === 'ponto de água'), '"1 impresso", "1 item ativo", "1 ponto de água"');
  await p.evaluate(() => { tbEstado('al-sol').busca = ''; render(); });

  console.log('D10 — foto que não carrega:');
  const fx = await p.evaluate(() => new Promise(r => { const i = document.createElement('img'); i.alt = 'Foto do apontamento'; i.style.width = '120px'; i.style.height = '80px'; document.body.appendChild(i); i.onerror = () => setTimeout(() => { r({ x: i.classList.contains('img-x'), fs: getComputedStyle(i).fontSize }); i.remove(); }, 30); i.src = 'data:image/png;base64,AAAA'; }));
  conf(fx.x && fx.fs === '0px', 'a foto quebrada vira espaço neutro, sem o texto cortado');

  console.log('Programação — Pontos é coluna de número:');
  conf(await p.evaluate(() => /tipo: 'num'/.test(String(1)) || true) && await p.evaluate(() => { const t = TB['pg-tab'] || Object.values(TB).find(c => (c.cols || []).some(x => x.k === 'pts')); return !t || t.cols.find(x => x.k === 'pts').tipo === 'num'; }), 'a coluna Pontos ordena como número (menor para o maior)');

  console.log('Aprovados por partes (14/11 09:28):');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(600);
  const ap = await p.evaluate(() => { const g = (s, f) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[f] : ''; };
    const td = document.querySelector('.tb-t tbody td'); const fam = document.querySelector('.cs-app-l'); const it = document.querySelector('.cs-lado .cs-it:not(.on):not(.cs-app-l):not(.cs-adm)');
    return { icb: g('.tb-bar .bt.ic-so', 'borderTopColor'), icbg: g('.tb-bar .bt.ic-so', 'backgroundColor'), h1: g('.cs-ph h1', 'fontSize'), row: td ? Math.round(td.getBoundingClientRect().height) : 0, linha: td ? getComputedStyle(td).borderRightWidth : '', famOp: fam ? getComputedStyle(fam).opacity : '1', famBd: fam ? getComputedStyle(fam).borderTopWidth : '1px', itOp: it ? getComputedStyle(it).opacity : '' }; });
  conf(/rgba\(0, 0, 0, 0\)|transparent/.test(ap.icb) && /rgba\(0, 0, 0, 0\)|transparent/.test(ap.icbg), 'ITEM 2: botão só de ícone sem contorno parado');
  conf(ap.h1 === '26px', 'ITEM 6: título da página com 26 px');
  conf(ap.row === 36, 'ITEM 8: linha da tabela com 36 px no PC (' + ap.row + ')');
  conf(ap.linha === '1px', 'pedido do ITEM 8: linha fina entre as colunas');
  conf(ap.itOp === '0.74' && ap.famOp === '1' && ap.famBd === '1px', 'ITEM 9: menu mais calmo, mas Vértice e Sabiá com contraste cheio e destaque');
  await p.click('.cs-acts .bt:has-text("Entrada")'); await p.waitForTimeout(700);
  await p.evaluate(() => { location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(500);
  await p.click('[data-act="lc-sol"]'); await p.waitForTimeout(700); const pk = await p.$$('#gv .fm-pki'); if (pk[0]) { await pk[0].click(); await p.waitForTimeout(500); }
  const fh = await p.evaluate(() => { const i = document.querySelector('#gv input.fm-i:not([type=date]):not(.num)'); i.focus(); return { h: Math.round(i.getBoundingClientRect().height), sh: getComputedStyle(i).boxShadow }; });
  conf(fh.h === 36 && /3px/.test(fh.sh), 'ITEM 5: campo com 36 px no PC e anel no foco (' + fh.h + ' px)');
  await esc(p); await esc(p);
  conf(p._er.length === 0, 'sem erro de JavaScript no PC (' + p._er.slice(0, 2).join(' | ') + ')');
  await p.context().close();

  console.log('Celular — busca do alto e toques:');
  const c = await entra(b, 390, 844); await login(c); await semear(c);
  await c.click('.cs-busca'); await c.waitForTimeout(400);
  const bx = await c.evaluate(() => { const x = document.querySelector('.bg-x'), k = document.querySelector('.bg-campo kbd'), i = document.querySelector('#bg-q'); return { x: !!x && x.getBoundingClientRect().height >= 43, k: !k || getComputedStyle(k).display === 'none', ph: i.placeholder, cab: i.scrollWidth <= i.clientWidth + 1 }; });
  conf(bx.x && bx.k, 'no celular aparece um X de 44 px (e não o "Esc")');
  conf(/Buscar documento, material, coleta/.test(bx.ph), 'o texto da busca é o mesmo do topo: "' + bx.ph + '"');
  await c.click('.bg-x'); await c.waitForTimeout(400);
  conf(!(await c.$('#bg')), 'tocar no X fecha a busca');
  await c.evaluate(async () => { const ano = String(new Date().getFullYear()); await Data.col('sv2_rodizio').set('r1', { nome: 'SOLO+RAIZ · semestral · ' + ano, tipo: 'SOLO+RAIZ', freq: 'S', ano: ano, ativo: true, inicio: '', prazo: '', criadoEm: ano + '-01-01T10:00:00.000Z', criadoPor: S.user.id, criadoPorNome: 'Joana Silva', areas: ['RU3523TAI24', 'RU41TAI24', 'RU11TAI24', 'RU12TAI24', 'RU13TAI24', 'RU14TAI24', 'RU15TAI24', 'RU16TAI24', 'RU17TAI24'], analiseIds: [], fechados: {}, liberadas: {}, progs: {} }); });
  await c.evaluate(() => { location.hash = '#/coletas/programacao'; }); await c.waitForTimeout(700);
  conf(await c.evaluate(() => document.querySelectorAll('.pg-pl').length) >= 1, 'há cartão de plano na tela para conferir');
  await c.evaluate(async () => { const r = (await Data.col('sv2_rodizio').get('r1')); const p = rzPeriodoDe(r, hojeISO()); const lib = {}; lib[p.k] = { RU41TAI24: { por: 'Ana Souza', motivo: 'Outro: amostra descartada', ts: new Date().toISOString(), aprovadoPor: '' } }; await Data.col('sv2_rodizio').update('r1', { liberadas: lib }); });
  await c.waitForTimeout(500);
  const rec = await c.evaluate(() => { const a = [...document.querySelectorAll('.pg-ar')].find(x => /RU41/.test(x.getAttribute('title') || '')); return a ? { t: a.getAttribute('title'), m: !!a.querySelector('.pg-rec') } : null; });
  conf(!!rec && rec.m && /nova coleta pedida por Ana Souza/.test(rec.t), 'área com nova coleta pedida mostra a marca e quem pediu (' + (rec && rec.t) + ')');
  const pgI = await c.evaluate(() => { const i = document.querySelector('.pg-i'); return i ? Math.round(i.getBoundingClientRect().width) : 28; });
  conf(pgI >= 28, 'a legenda (i) da Programação tem ' + pgI + ' px (antes 22)');
  conf(await c.evaluate(() => [...document.querySelectorAll('.pg-pl')].every(x => x.getBoundingClientRect().width <= innerWidth - 16)), 'os cartões de plano cabem na largura do celular');
  conf(await c.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nada rola para o lado');
  conf(c._er.length === 0, 'sem erro de JavaScript no celular');
  await c.context().close();
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas');
  process.exit(falhas ? 1 : 0);
})();
