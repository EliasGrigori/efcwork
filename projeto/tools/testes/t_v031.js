/* EFCwork · suíte da v0.3.1 — tabelas mais largas e gaveta por cima, voltar UMA camada (Esc, X, voltar do navegador) com aviso antes de
   descartar, nomes dos perfis, favoritos (saída de vários materiais) e tirar item das listas segurando 1,5 s e arrastando para a lixeira.
   Tudo no modo demonstração (nada vai ao Firebase real). Uso: node tools/testes/t_v031.js */
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
  await p.evaluate(async () => { await Data.col('sv2_cfg').set('almox', { kits: [{ id: 'env', nome: 'Envio de água', motivo: 'Envio de amostras', itens: [{ itemId: 'agua', qtd: 3 }, { itemId: 'gelo', qtd: 2 }] }] }); });
  await p.waitForTimeout(150);

  console.log('— Tabelas mais largas; a tabela recua quando a gaveta abre');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  const w0 = await p.$eval('.tb-w', e => Math.round(e.getBoundingClientRect().width));
  conf(w0 >= 1366 - 240 - 44, 'tabela usa a largura toda (' + w0 + ' px de ' + (1366 - 240) + ' disponíveis)');
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(150);
  { const r = await p.evaluate(() => { const t = document.querySelector('.tb-w').getBoundingClientRect(), g = document.getElementById('gv').getBoundingClientRect(); return { fim: Math.round(t.right), gv: Math.round(g.left) }; });
    conf(r.gv - r.fim === 20, 'com a gaveta aberta a tabela recua e fica a 20 px dela, a mesma margem da esquerda (pedido de 06/11) (' + (r.gv - r.fim) + ' px)'); }
  await p.setViewportSize({ width: 1920, height: 900 }); await p.waitForTimeout(150);
  const w1 = await p.$eval('.tb-w', e => Math.round(e.getBoundingClientRect().width));
  conf(w1 >= 1920 - 240 - 40 - 440 - 4, 'tela larga (1920), com a gaveta: tabela sem limite de largura, só recua o espaço da gaveta (' + w1 + ' px)');
  await p.setViewportSize({ width: 1366, height: 820 }); await p.waitForTimeout(100);

  console.log('— Voltar uma camada');
  conf(await p.evaluate(() => S.camadas.map(c => c.nome).join(',')) === 'gv', 'detail aberto = 1 camada');
  await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => S.camadas.map(c => c.nome).join(',')) === 'gv,fm', 'saída por cima do detalhe = 2 camadas');
  await esc(p);
  conf(/Luva/.test(await titulo(p)) && await p.evaluate(() => !S.fm && !!S.gv), 'Esc volta só uma camada: do formulário para o detalhe');
  await esc(p);
  conf(await p.evaluate(() => !S.gv && !document.getElementById('gv') && S.camadas.length === 0), 'Esc de novo fecha o detalhe');
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(150); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(150);
  await volta(p);
  conf(/Luva/.test(await titulo(p)) && await p.evaluate(() => !S.fm), 'voltar do navegador/celular: também uma camada (formulário → detalhe)');
  await volta(p);
  conf(await p.evaluate(() => !S.gv), 'voltar de novo fecha o detalhe');
  conf(await p.evaluate(() => location.hash) === '#/almox/materiais', 'continua na mesma tela (não voltou de tela)');
  /* com algo preenchido */
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(150); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => !S.fm.sujo), 'formulário recém-aberto não conta como preenchido');
  await p.fill('#gv [data-fm="obs"]', 'teste de descarte');
  await esc(p);
  conf(/Descartar o que você preencheu/.test(await p.evaluate(() => (document.getElementById('cf') || {}).textContent || '')), 'preenchido: Esc pergunta "Descartar o que você preencheu?"');
  await p.click('[data-act="cf-nao"]'); await p.waitForTimeout(150);
  conf(await p.inputValue('#gv [data-fm="obs"]') === 'teste de descarte' && await p.evaluate(() => S.camadas.length === 2), '"Continuar preenchendo": o que foi digitado continua');
  await volta(p);
  conf(await p.evaluate(() => !!document.getElementById('cf')), 'voltar do celular com algo preenchido também pergunta');
  await volta(p);
  conf(await p.evaluate(() => !document.getElementById('cf') && !!S.fm), 'voltar com a pergunta aberta = continuar preenchendo');
  await esc(p); await p.click('[data-act="cf-sim"]'); await p.waitForTimeout(250);
  conf(/Luva/.test(await titulo(p)) && await p.evaluate(() => !S.fm && S.camadas.length === 1), '"Descartar": volta para o detalhe');
  /* entrada: lista de escolher é camada */
  await esc(p);
  await p.click('.cs-acts [data-act="lc-ent"]'); await p.waitForTimeout(120); await p.click('#gv .fm-pki:has-text("Luva")'); await p.waitForTimeout(80);
  await p.click('[data-act="lc-ent-add"]'); await p.waitForTimeout(80);
  conf(await p.evaluate(() => S.camadas.map(c => c.nome).join(',')) === 'fm,pk', 'entrada: "Adicionar outro material" abre a lista como camada');
  await esc(p);
  conf((await p.$$('#gv .fm-ln')).length === 1 && await p.evaluate(() => !S.fm.pk), 'Esc na lista volta para as linhas da entrada');
  await esc(p);
  conf(await p.evaluate(() => !!document.getElementById('cf')), 'entrada com material escolhido: pergunta antes de descartar');
  await p.click('[data-act="cf-sim"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => !S.gv && S.camadas.length === 0), 'descartou: gaveta fechada (abriu pelo cabeçalho, não havia detalhe)');
  /* gravar devolve o histórico */
  await p.click('.tb-t tbody tr:has-text("Água")'); await p.waitForTimeout(150); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(120);
  await dd(p, 'lc:motivo', 'Uso no expediente'); await p.click('[data-act="lc-sai-ok"]'); await p.waitForTimeout(500);
  conf(/Água/.test(await titulo(p)) && await p.evaluate(() => S.camadas.length === 1), 'depois de gravar: volta ao detalhe com 1 camada');
  await volta(p);
  conf(await p.evaluate(() => !S.gv && location.hash === '#/almox/materiais'), 'e um voltar fecha o detalhe (o histórico ficou certo)');
  /* busca */
  await p.keyboard.press('/'); await p.waitForTimeout(120);
  conf(await p.evaluate(() => !!document.getElementById('bg') && S.camadas.map(c => c.nome).join(',') === 'bg'), 'busca geral é uma camada');
  await volta(p);
  conf(await p.evaluate(() => !document.getElementById('bg')), 'voltar fecha a busca');

  console.log('— Nomes dos perfis');
  conf(/Administrador/.test(await p.textContent('.cs-us')), 'Principal aparece como "Administrador"');
  await p.evaluate(async () => {
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: { almox: true } });
    const c = await Data.auth.createAccount('caio.reis', 'senha1234'); await Data.col('sv2_users').set(c, { nome: 'Caio Reis', login: 'caio.reis', perfil: 'secundario', estrela: true, atrib: { almox: true } });
    const v = await Data.auth.createAccount('vera.luz', 'senha1234'); await Data.col('sv2_users').set(v, { nome: 'Vera Luz', login: 'vera.luz', perfil: 'visitante' });
  });
  conf(await p.evaluate(() => [perfilLabel({ perfil: 'secundario' }), perfilLabel({ perfil: 'secundario', estrela: true }), perfilLabel({ perfil: 'visitante' }), perfilLabel({ perfil: 'principal_temp' })].join('|')) === 'Colaborador|Líder|Consulta|Administrador temporário', 'Secundário = Colaborador · Secundário ★ = Líder · Visitante = Consulta');
  await entra(p, 'ana.lima');
  conf(/Colaborador/.test(await p.textContent('.cs-us')), 'Colaborador vê o próprio perfil com o nome novo');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(150);
  await p.click('.tb-t tbody tr:has-text("Gelo")'); await p.waitForTimeout(120); await p.click('#gv [data-act="lc-aj"]'); await p.waitForTimeout(120);
  conf(/Como Colaborador, o ajuste vai como pedido/.test(await p.textContent('#gv')), 'textos usam o nome novo ("Como Colaborador…")');
  await esc(p); await esc(p);
  conf(await p.evaluate(async () => { const u = (await Data.col('sv2_users').all()).find(x => x.login === 'ana.lima'); return u.perfil === 'secundario'; }), 'no cadastro continua gravado "secundario" (o EFClaudian lê igual)');
  await entra(p, 'joana.silva');

  console.log('— Favoritos');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(150);
  await p.click('.cs-acts [data-act="lc-sai"]'); await p.waitForTimeout(150);
  conf(/Favoritos/.test(await p.textContent('#gv')) && (await p.$$('[data-dd="lc:fav"] li[data-v="k:env"]')).length === 1, 'Saída: lista suspensa de favoritos (vem da configuração do almoxarifado)');
  await dd(p, 'lc:fav', 'Envio de água');
  const fl = await p.evaluate(() => ({ k: S.fm.k, n: S.fm.linhas.length, q: S.fm.linhas.map(l => l.qtd).join(','), m: S.fm.motivo }));
  conf(fl.k === 'multi' && fl.n === 2 && fl.q === '3,2' && fl.m === 'Envio de amostras', 'escolher o favorito já traz os materiais, as quantidades e o motivo');
  await p.fill('#gv [data-fm="linhas.1.qtd"]', '1'); await p.click('[data-act="lc-multi-ok"]'); await p.waitForTimeout(400);
  const fv = await p.evaluate(() => { const l = S.almMov.filter(m => m.tipo === 'saida' && m.kit === 'Envio de água' && !m.anulada); return { n: l.length, g: l.length === 2 && l[0].grupo === l[1].grupo, gelo: (l.find(m => m.itemId === 'gelo') || {}).qtd }; });
  conf(fv.n === 2 && fv.g && fv.gelo === 1, 'saída do favorito: 2 movimentações no mesmo grupo, com o nome do favorito; quantidade mudada respeitada (gelo 1)');
  await p.click('.cs-acts [data-act="lc-sai"]'); await p.waitForTimeout(150); await p.click('[data-act="lc-multi"]'); await p.waitForTimeout(100);
  await p.click('#gv .fm-pki:has-text("Luva")'); await p.waitForTimeout(80); await p.click('[data-act="lc-multi-add"]'); await p.click('#gv .fm-pki:has-text("Água")'); await p.waitForTimeout(80);
  await dd(p, 'lc:motivo', 'Limpeza'); await p.check('#gv [data-fm="salvarFav"]'); await p.waitForTimeout(100);
  await p.click('[data-act="lc-multi-ok"]'); await p.waitForTimeout(100);
  conf(/Dê um nome ao favorito/.test(await msg(p)), '"Guardar como favorito" pede o nome');
  await p.fill('#gv [data-fm="nomeFav"]', 'Limpeza da bancada'); await p.click('[data-act="lc-multi-ok"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => (S.almPref.favs || []).some(f => f.nome === 'Limpeza da bancada' && f.itens.length === 2)), 'favorito guardado na lista da pessoa (2 materiais)');
  await p.click('.cs-acts [data-act="lc-sai"]'); await p.waitForTimeout(150);
  conf((await p.$$('[data-dd="lc:fav"] li[data-rm]')).length === 2, 'a lista mostra os 2 favoritos');
  await p.screenshot({ path: path.join(SHOTS, 'v031-pc-claro-favoritos.png') });

  console.log('— Tirar da lista segurando 1,5 s e arrastando');
  const r1 = await arrasta(p, 'lc:fav', 'Limpeza da bancada');
  conf(!!r1, 'segurando 1,5 s aparece a lixeira ao lado da lista');
  conf(await p.evaluate(() => !(S.almPref.favs || []).length) && (await p.$$('[data-dd="lc:fav"] li[data-rm]')).length === 1, 'soltou na lixeira: o favorito saiu da lista');
  conf(await p.evaluate(() => !![...document.querySelectorAll('.av')].find(x => /saiu da sua lista/.test(x.textContent) && x.querySelector('.av-df'))), 'aviso com "Desfazer"');
  await p.click('.av:has-text("Limpeza da bancada") .av-df'); await p.waitForTimeout(200);
  conf(await p.evaluate(() => (S.almPref.favs || []).length === 1), 'Desfazer devolve o favorito');
  await arrasta(p, 'lc:fav', 'Envio de água');
  conf(await p.evaluate(() => (S.almPref.kitsOcultos || []).indexOf('env') >= 0 && S.cfgAlm.kits.length === 1), 'favorito da configuração: some só da lista da pessoa (a configuração continua)');
  await p.click('#gv .fm-pki:has-text("Luva")'); await p.waitForTimeout(100);
  const r2 = await arrasta(p, 'lc:motivo', 'Limpeza');
  conf(!!r2 && await p.evaluate(() => alMotivos('item:luva').indexOf('Limpeza') < 0), 'motivo também sai da lista segurando e arrastando');
  /* soltar fora da lixeira não tira */
  await p.click('[data-dd="lc:motivo"] .dd-b'); await p.waitForTimeout(80);
  { const li = await p.$('[data-dd="lc:motivo"] li:has-text("Envio de amostras")'), bx = await li.boundingBox(); await p.mouse.move(bx.x + 20, bx.y + 10); await p.mouse.down(); await p.waitForTimeout(1650); await p.mouse.move(600, 400, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(150); }
  conf(await p.evaluate(() => alMotivos('item:luva').indexOf('Envio de amostras') >= 0 && S.fm.motivo !== 'Envio de amostras'), 'soltar fora da lixeira: nada sai e nada é escolhido');
  await dd(p, 'lc:motivo', 'Envio de amostras');
  conf(await p.evaluate(() => S.fm.motivo === 'Envio de amostras'), 'toque normal na opção continua escolhendo');
  await p.click('[data-dd="lc:motivo"] .dd-b'); await p.waitForTimeout(80);
  { const li = await p.$('[data-dd="lc:motivo"] li:has-text("Uso no expediente")'), bx = await li.boundingBox(); await p.mouse.move(bx.x + 20, bx.y + 10); await p.mouse.down(); await p.waitForTimeout(1650); await p.screenshot({ path: path.join(SHOTS, 'v031-pc-claro-lixeira.png') }); await p.mouse.up(); await p.waitForTimeout(100); }
  await p.evaluate(() => { ddFecha(); if (document.getElementById('cf')) csConfirmaFecha(false); gvFecharSo(); S.camadas = []; }); await p.waitForTimeout(200);
  /* prints */
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(150); await p.click('#gv .gv-pe [data-act="lc-sai"]'); await p.waitForTimeout(120); await p.fill('#gv [data-fm="obs"]', 'x'); await esc(p);
  await p.screenshot({ path: path.join(SHOTS, 'v031-pc-claro-descartar.png') });
  await p.click('[data-act="cf-sim"]'); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(SHOTS, 'v031-pc-claro-tabela-gaveta.png') });
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; csTrocaTema('escuro'); }); await p.waitForTimeout(100);
  await p.click('.cs-acts [data-act="lc-sai"]'); await p.waitForTimeout(150); await dd(p, 'lc:fav', 'Limpeza da bancada');
  await p.screenshot({ path: path.join(SHOTS, 'v031-pc-escuro-favorito.png') });
  await p.evaluate(() => csTrocaTema('claro'));
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 } }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400); await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600); await semear(q);
  await q.evaluate(() => { location.hash = '#/almox/materiais'; }); await q.waitForTimeout(150);
  await q.click('[data-act="cs-menu"]'); await q.waitForTimeout(150);
  conf(await q.evaluate(() => document.querySelector('.cs-app').classList.contains('menu-aberto') && S.camadas.map(c => c.nome).join(',') === 'menu'), 'celular: menu aberto é uma camada');
  await volta(q);
  conf(await q.evaluate(() => !document.querySelector('.cs-app').classList.contains('menu-aberto') && location.hash === '#/almox/materiais'), 'voltar do celular fecha o menu e fica na tela');
  await q.click('.cs-acts [data-act="lc-sai"]'); await q.waitForTimeout(150); await q.click('#gv .fm-pki:has-text("Luva")'); await q.waitForTimeout(100);
  const r3 = await arrasta(q, 'lc:motivo', 'Limpeza');
  conf(!!r3 && r3.x >= 0 && r3.x + r3.width <= 390 && r3.y >= 0 && r3.y + r3.height <= 844, 'celular: a lixeira aparece dentro da tela, perto da lista');
  await q.fill('#gv [data-fm="obs"]', 'x'); await volta(q);
  await q.screenshot({ path: path.join(SHOTS, 'v031-cel-claro-descartar.png') });
  conf(await q.evaluate(() => !!document.getElementById('cf')), 'celular: voltar com algo preenchido pergunta antes');
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v031: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
