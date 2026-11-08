/* EFCwork · suíte da v0.4.1 — total em cima e célula vazia em branco; lançamentos em remessa com "todas ou escolher quais"
   (várias O.S na mesma remessa, laudo, NF/cupom/rastreio; de novo só as que faltam); confirmação rápida no aviso do sino;
   notinha da solicitação para imprimir; mensagens da tela de entrar. Modo demonstração. Uso: node tools/testes/t_v041.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
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
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
async function semear(p) {
  await p.evaluate(async () => {
    const h = hojeISO(), d = n => addDias(h, n), C = Data.col.bind(Data), me = S.user;
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], labPrazo: { IBRA: 10 } });
    await C('sv2_prog').set('p1', { data: d(-5), talhao: 'RU11TAI24', tipo: 'SOLO+RAIZ', coletor: 'Equipe A', situacao: 'pendente', criadoPorNome: 'Joana Silva' });
    const base = { situacao: 'ativa', criadoEm: nowISO(), criadoPor: me.id, criadoPorNome: 'Joana Silva', valor: 120 };
    const col = (id, o) => C('sv2_coletas').set(id, Object.assign({}, base, o));
    await col('c1', { tipo: 'SOLO', data: d(-3), talhao: 'RU11TAI24', analiseNome: 'Solo completo', sigla: 'SC', lab: 'IBRA', pontos: 20, prof: '0-20', coletor: 'Equipe A', progId: 'p1' });
    await col('c2', { tipo: 'NEMATOIDE', data: d(-3), talhao: 'RU11TAI24', analiseNome: 'Nematoide', sigla: 'NEM', lab: 'BIOAGRI', progId: 'p1' });
    await col('c3', { tipo: 'FOLHA', data: d(-22), talhao: 'RU12TAI24', analiseNome: 'Foliar', sigla: 'FOL', lab: 'IBRA', enviado: true, envio: d(-20) });
    await col('c4', { tipo: 'FOLHA', data: d(-22), talhao: 'RU13TAI24', analiseNome: 'Foliar', sigla: 'FOL', lab: 'IBRA', enviado: true, envio: d(-20), laudo: true, laudoEm: d(-6) + 'T10:00:00.000Z', laudoPor: 'Joana Silva' });
    await col('c5', { tipo: 'FRUTA', data: d(-3), talhao: 'RU14TAI25', identificacao: 'Lote 7', analiseNome: 'Resíduos', sigla: 'RES', lab: 'BIOAGRI', enviado: true, envio: d(-2), os: 'OS-55' });
    await col('c6', { tipo: 'COMPOSTO', data: d(-60), loteComp: 'LC-01', analiseNome: 'Composto', sigla: 'CMP', lab: 'IBRA', enviado: true, envio: d(-58), os: 'OS-10', laudo: true, laudoEm: d(-30) + 'T10:00:00.000Z', laudoPor: 'Joana Silva', compra: 'solicitado', pedidoSankhya: '4471', dataSolicitacao: d(-40), solicitadoPorNome: 'Joana Silva' });
    await col('c7', { tipo: 'SOLO', data: d(-10), talhao: 'RU17TAI25', analiseNome: 'Solo completo', lab: 'IBRA', situacao: 'cancelada', canceladaMotivo: 'área replantada' });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [me.id], atrib: { coletas: true } });
  });
  await p.waitForTimeout(300);
}
async function primeiro(p) { await p.goto(URL); await p.waitForTimeout(400); await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600); await semear(p); await semearAlm(p); }
const col = (p, id) => p.evaluate(i => JSON.parse(JSON.stringify(S.coletas.find(x => x.id === i))), id);
const etapas = p => p.$$eval('#gv .cb-tl > li', l => l.map(x => (x.classList.contains('ok') ? '+' : x.classList.contains('at') ? '>' : '-') + x.querySelector('b').firstChild.textContent.trim()).join('|'));
const abre = async (p, id) => { await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(150); await p.click('.tb-t tbody tr[data-id="' + id + '"]'); await p.waitForTimeout(300); };
async function semearAlm(p) {
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



const alvo = async (p, v) => { await dd(p, 'lc:coalvo', v); await p.waitForTimeout(120); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);
  await p.evaluate(async () => { await Data.col('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] }); }); await p.waitForTimeout(150);

  console.log('— Tabelas');
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(250);
  conf(await p.evaluate(() => { const t = document.querySelector('.tb-tots'); return !!t && !document.querySelector('.tb-t .tb-tot') && !document.querySelector('.tb-t tfoot') && /Total/.test(t.textContent) && t.nextElementSibling && t.nextElementSibling.classList.contains('tb-w'); }), 'o total fica acima da tabela, fora dela (v0.4.7)');
  const tt0 = await p.evaluate(() => document.querySelector('.tb-tots .tb-tv b').textContent);
  await p.fill('[data-tbbusca]', 'zzzz-nada'); await p.waitForTimeout(250);
  const tt1 = await p.evaluate(() => (document.querySelector('.tb-tots .tb-tv b') || {}).textContent || '');
  await p.fill('[data-tbbusca]', 'c1'); await p.waitForTimeout(250);
  const tt2 = await p.evaluate(() => (document.querySelector('.tb-tots') || {}).textContent || '');
  await p.fill('[data-tbbusca]', ''); await p.waitForTimeout(250);
  console.log('    total:', tt0, '| busca sem resultado:', tt1, '| busca:', tt2);
  conf(/R\$/.test(tt0) && /R\$\s?0,00/.test(tt1) && /do filtro/.test(tt2), 'o total segue a busca e o filtro ("Total do filtro")');
  conf(await p.evaluate(() => !Array.from(document.querySelectorAll('.tb-t tbody td')).some(td => td.textContent.trim() === '—')), 'nenhuma célula com "—": sem dado = em branco');

  console.log('— O.S: todas ou escolher quais (Aquasollus)');
  const k3 = await p.evaluate(() => coLoteK(S.coletas.find(x => x.id === 'c3')));
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await p.waitForTimeout(250);
  await p.click('.tb-t tbody tr[data-id="' + k3 + '"]'); await p.waitForTimeout(300); await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  conf(/Todas as 2 sem O.S/.test(await p.textContent('[data-dd="lc:coalvo"]')), 'sugere: "Todas as 2 sem O.S"');
  await alvo(p, 'Escolher quais');
  conf((await p.$$('#gv [data-act="co-ck"]')).length === 2, '"Escolher quais" mostra a lista para marcar');
  await p.click('#gv [data-act="co-ck"][data-id="c3"]'); await p.fill('#gv [data-fm="os"]', 'AQ-100'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c3')).os === 'AQ-100' && !(await col(p, 'c4')).os, 'só a marcada recebe a O.S AQ-100');
  await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  conf(/1 amostra\(s\) já com O.S \(AQ-100\)/.test(await p.textContent('#gv .fm-av')) && /Vale para: RU13TAI24/.test(await p.textContent('#gv')), 'de novo: só a que falta (RU13TAI24), avisando a que já tem');
  await p.fill('#gv [data-fm="os"]', 'AQ-200'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c4')).os === 'AQ-200' && /AQ-100, AQ-200/.test(await p.textContent('#gv dl.gv-fl')), 'duas O.S na mesma remessa (AQ-100, AQ-200)');
  await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  conf(/Corrigir O.S/.test(await titulo(p)) && (await p.$$('#gv [data-act="co-ck"]')).length === 2, 'todas com O.S: abre "Corrigir O.S" escolhendo qual');
  await p.click('#gv [data-act="co-ck"][data-id="c4"]'); await p.fill('#gv [data-fm="os"]', 'AQ-201'); await p.fill('#gv [data-fm="motivo"]', 'número trocado'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c4')).os === 'AQ-201' && (await col(p, 'c3')).os === 'AQ-100', 'corrige só a escolhida');

  console.log('— Laudo e anexos com a mesma regra');
  await p.click('#gv [data-act="co-laudo"]'); await p.waitForTimeout(150);
  conf(!(await p.$('[data-dd="lc:coalvo"]')) && /Vale para: RU12TAI24/.test(await p.textContent('#gv')), 'laudo: só 1 sem laudo → "Vale para" direto');
  await esc(p); await p.waitForTimeout(100);
  await p.click('#gv [data-act="co-anx"]'); await p.waitForTimeout(150);
  await alvo(p, 'Escolher quais'); await p.click('#gv [data-act="co-ck"][data-id="c3"]'); await p.fill('#gv [data-fm="rastreio"]', 'AA111111111BR'); await p.click('[data-act="co-anx-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c3')).rastreio === 'AA111111111BR' && !(await col(p, 'c4')).rastreio, 'rastreio só na escolhida');
  await p.click('#gv [data-act="co-anx"]'); await p.waitForTimeout(150);
  conf(/1 de 2 amostra\(s\) ainda sem/.test(await p.textContent('#gv .fm-av')) && /Vale para: RU13TAI24/.test(await p.textContent('#gv')), 'de novo: só a que ainda está sem anexo');
  await p.fill('#gv [data-fm="rastreio"]', 'BB222222222BR'); await p.click('[data-act="co-anx-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c4')).rastreio === 'BB222222222BR' && (await col(p, 'c3')).rastreio === 'AA111111111BR', 'cada amostra com o seu rastreio');
  await p.screenshot({ path: path.join(SHOTS, 'v041-pc-claro-remessa-2os.png') });

  console.log('— Confirmação rápida no aviso');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; });
  conf(!(await p.$('#sn-toast')), 'pedidos que já esperavam não pulam na tela');
  await p.evaluate(async () => { const ana = S.users.find(u => u.login === 'ana.lima'); await Data.col('sv2_aprov').add({ tipo: 'corrigir_os', titulo: 'Corrigir O.S: remessa de teste', descricao: 'O.S OS-55 → OS-57\nMotivo: o laboratório reenviou', status: 'pendente', solicitanteId: ana.id, solicitanteNome: ana.nome, paraIds: [S.user.id], paraNomes: [S.user.nome], ts: nowISO(), payload: { ids: ['c5'], agua: false, os: 'OS-57', antes: 'OS-55', motivo: 'o laboratório reenviou', rotulo: 'teste' } }); });
  await p.waitForTimeout(400);
  conf(/Pedido para você confirmar/.test(await p.textContent('#sn-toast')) && /o laboratório reenviou/.test(await p.textContent('#sn-toast')), 'pedido novo aparece num aviso no canto, com o que é e o porquê');
  await p.screenshot({ path: path.join(SHOTS, 'v041-pc-claro-aviso-pedido.png') });
  await p.click('#sn-toast [data-act="sn-apr"]'); await p.waitForTimeout(500);
  conf((await col(p, 'c5')).os === 'OS-57' && !(await p.$('#sn-toast')), 'Confirmar ali mesmo aplica e o aviso some');
  await p.click('[data-act="cs-sino"]').catch(() => {}); await p.waitForTimeout(200);
  conf(await p.evaluate(() => getComputedStyle(document.querySelector('.sn-pd') || document.body).borderLeftWidth !== '3px'), 'cartão do pedido no sino sem a faixa lateral colorida');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; });

  console.log('— Notinha');
  await p.evaluate(() => { window.__print = 0; window.print = () => { window.__print++; }; location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(250);
  await p.click('.tb-t tbody tr[data-id="s1"]'); await p.waitForTimeout(300);
  await p.click('#gv [data-act="nt-sol"]'); await p.waitForTimeout(200);
  const nt = await p.evaluate(() => { const n = document.querySelector('#tb-imp .nt'); return n && { t: n.textContent, linhas: n.querySelectorAll('.nt-it .nt-l').length }; });
  conf(nt && /Empresa Teste/.test(nt.t) && /Nº 1042/.test(nt.t) && nt.linhas === 2, 'notinha: empresa da configuração, número 1042 e os 2 itens');
  conf(/Solicitante: Joana/.test(nt.t) && /Atendente/.test(nt.t) && /Impresso em/.test(nt.t) && /Itens: 2/.test(nt.t), 'com total de itens, assinaturas (atendente e solicitante) e "impresso em"');
  conf(await p.evaluate(() => window.__print === 1), 'manda imprimir');
  await p.evaluate(() => document.body.classList.add('imprimindo')); await p.emulateMedia({ media: 'print' });
  conf(await p.evaluate(() => Math.round(document.querySelector('#tb-imp .nt').getBoundingClientRect().width * 25.4 / 96) === 74), 'estilo cupom: faixa de 80 mm (74 mm de texto) que cresce com os itens');
  await p.screenshot({ path: path.join(SHOTS, 'v041-notinha.png'), clip: { x: 0, y: 0, width: 330, height: 560 } }); await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => document.body.classList.remove('imprimindo'));

  console.log('— Tela de entrar');
  await p.evaluate(async () => { await Data.auth.createAccount('semperfil', 'senha1234'); });
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.fill('#en-login', 'fulano2099gmail.com'); await p.fill('#en-senha', 'x123'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(300);
  conf(/e-mail sem o @/.test(await p.textContent('.en-msg, #en-msg, form')), 'e-mail digitado sem o @: avisa depois de falhar (não bloqueia logins antigos)');
  await p.fill('#en-login', 'semperfil'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700);
  conf(/senha está certa, mas este acesso não tem perfil/.test(await p.textContent('body')), 'conta sem perfil: diz que a senha está certa e o que conferir');
  conf(erros.length === 0, 'nenhum erro de JavaScript' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(() => { location.hash = '#/coletas/envio'; }); await q.waitForTimeout(300);
  const kq = await q.evaluate(() => coLoteK(S.coletas.find(x => x.id === 'c3')));
  await q.click('.tb-t tbody tr[data-id="' + kq + '"]'); await q.waitForTimeout(300); await q.click('#gv [data-act="co-os"]'); await q.waitForTimeout(150); await dd(q, 'lc:coalvo', 'Escolher quais'); await q.waitForTimeout(150);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: escolher quais sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v041-cel-claro-escolher.png') });
  await q.evaluate(async () => { gvFecharSo(); S.camadas = []; await Data.col('sv2_aprov').add({ tipo: 'corrigir_os', titulo: 'Corrigir O.S: teste', descricao: 'teste', status: 'pendente', solicitanteId: 'x', solicitanteNome: 'Ana Lima', paraIds: [S.user.id], ts: nowISO(), payload: { ids: ['c5'], agua: false, os: 'X', antes: '', motivo: 'teste', rotulo: 't' } }); }); await q.waitForTimeout(400);
  conf(await q.evaluate(() => { const t = document.getElementById('sn-toast'); if (!t) return false; const r = t.getBoundingClientRect(); return r.right <= innerWidth && r.bottom < innerHeight - 50; }), 'celular: o aviso fica acima da barra de baixo');
  await q.screenshot({ path: path.join(SHOTS, 'v041-cel-claro-aviso.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v041: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
