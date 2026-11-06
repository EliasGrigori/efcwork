/* EFCwork · suíte da v0.3.4 — gaveta deslizando da lateral; linha do tempo da calibração com fluido (sobe da última etapa vista,
   0,4 s entre etapas, sobe na hora com a gaveta aberta, reduzir movimento = sem animação); inventário de equipamentos e vidrarias
   na contagem (achei / não achei, quantidade por lugar, "não encontrado" no equipamento). Modo demonstração. Uso: node tools/testes/t_v034.js */
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
const CAL = (n, extra) => Object.assign({ numero: 'CAL-2026-0' + n, prestador: 'LABOR', itens: [{ equipId: 'e1', tag: 'PHM-02', nome: 'pHmetro de bancada', valor: 180, aplicado: false }], situacao: 'ativa', criadoEm: new Date().toISOString(), criadoPorNome: 'Joana Silva' }, extra || {});
async function primeiro(p) { await p.goto(URL); await p.waitForTimeout(400); await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600); await semear(p); }
const estado = p => p.evaluate(() => { const ol = document.querySelector('#gv .cb-tlw'); if (!ol) return null; const lis = Array.from(ol.querySelectorAll('li')); return { esp: lis.map((l, n) => l.classList.contains('esp') ? n + 1 : 0).filter(Boolean).join(','), acesas: lis.filter(l => l.classList.contains('ok') && !l.classList.contains('esp')).length, h: Math.round(ol.querySelector('.cb-fluido').getBoundingClientRect().height), nivel: S._cbNivel[ol.getAttribute('data-cbtl')] }; });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Gaveta deslizando');
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(200);
  await p.click('.tb-t tbody tr[data-id="e1"]'); await p.waitForTimeout(40);
  conf(await p.evaluate(() => document.getElementById('gv').classList.contains('gv-entra')), 'ao abrir, a gaveta entra deslizando da lateral (gv-entra)');
  const tr = await p.evaluate(() => getComputedStyle(document.getElementById('gv')).animationName);
  conf(tr === 'gvEntra', 'animação gvEntra ativa (' + tr + ')');
  await p.waitForTimeout(400);
  conf(await p.evaluate(() => !document.getElementById('gv').classList.contains('gv-entra')), 'depois de 0,3 s a classe sai (a gaveta fica parada)');
  await p.click('.tb-t tbody tr[data-id="e2"]'); await p.waitForTimeout(40);
  conf(await p.evaluate(() => !document.getElementById('gv').classList.contains('gv-entra')), 'trocar de equipamento com a gaveta aberta não repete a entrada');
  await esc(p); 
  conf(await p.evaluate(() => !document.getElementById('gv')), 'Esc fecha (o #gv some na hora para o app)');
  await p.waitForTimeout(400);
  conf(await p.evaluate(() => !document.querySelector('.gv-sai') && !document.querySelector('aside.gv')), 'a gaveta sai deslizando e é removida depois');
  await p.click('.tb-t tbody tr[data-id="e1"]'); await p.waitForTimeout(30); await esc(p); await p.waitForTimeout(20);
  await p.click('.tb-t tbody tr[data-id="e3"]'); await p.waitForTimeout(80);
  conf(await p.evaluate(() => document.querySelectorAll('#gv').length === 1 && /Termômetro/.test(document.querySelector('#gv h2').textContent)), 'abrir outra enquanto a anterior ainda sai: sem duas gavetas com o mesmo id');
  await esc(p); await p.waitForTimeout(300);

  console.log('— Fluido da linha do tempo');
  await p.evaluate(async c => { await Data.col('sv2_alm_cal').set('c1', c); location.hash = '#/almox/calibracao'; }, CAL(1, { cotacaoEm: await p.evaluate(() => hojeISO()), agenda: { data: await p.evaluate(() => addDias(hojeISO(), 3)) } }));
  await p.waitForTimeout(300);
  await p.click('.cb-card'); await p.waitForTimeout(60);
  let s = await estado(p);
  conf(s && s.esp === '2,3' && s.acesas === 1 && s.h <= 2, 'nunca vista: começa só com "Solicitada" acesa e o fluido no início (' + JSON.stringify(s) + ')');
  await p.waitForTimeout(1250); s = await estado(p);
  conf(s.nivel === 2 && s.esp === '3' && s.acesas === 2, 'sobe até a 2ª etapa (Cotação) e acende');
  const h2 = s.h;
  await p.waitForTimeout(250); s = await estado(p);
  conf(s.nivel === 2 && s.esp === '3', 'espera 0,4 s antes de subir para a próxima');
  conf(await p.evaluate(() => document.querySelector('#gv .cb-tl li:nth-child(2)').classList.contains('acende')), 'a etapa que acende ganha o "pulo" (acende)');
  await p.waitForTimeout(1250); s = await estado(p);
  conf(s.nivel === 3 && s.esp === '' && s.acesas === 3 && s.h > h2, 'sobe até a 3ª (Agendada): fluido mais alto (' + h2 + ' → ' + s.h + ' px)');
  conf(await p.evaluate(() => Number(Store.get('cw-cbvisto-' + S.user.id + '-c1')) === 3), 'guarda até onde esta pessoa viu (por pessoa e por solicitação)');
  conf(await p.evaluate(() => { const a = getComputedStyle(document.querySelector('#gv .cb-fluido'), '::after'); return a.animationName === 'cbBrilho'; }), 'brilho correndo no fluido (cbBrilho)');
  await p.screenshot({ path: path.join(SHOTS, 'v034-pc-claro-fluido.png') });
  await esc(p); await p.waitForTimeout(300);
  await p.click('.cb-card'); await p.waitForTimeout(60); s = await estado(p);
  conf(s.esp === '' && s.acesas === 3 && s.h > 0, 'abrir de novo sem novidade: já aparece cheio, sem animar');
  console.log('— Mudou com a gaveta aberta');
  await p.evaluate(async () => { const c = S.almCal.find(x => x.id === 'c1'); await Data.col('sv2_alm_cal').update('c1', { itens: c.itens.map(i => Object.assign({}, i, { aplicado: true, data: hojeISO(), tecnico: 'Carlos', certificado: 'RBC-1', resultado: 'aprovado' })) }); });
  await p.waitForTimeout(60); s = await estado(p);
  conf(s.esp === '4' && s.nivel === 3, 'calibrada com a gaveta aberta: a 4ª etapa aparece apagada…');
  await p.waitForTimeout(1100); s = await estado(p);
  conf(s.nivel === 4 && s.esp === '' && s.acesas === 4, '…e o fluido sobe na hora até ela');
  await esc(p); await p.waitForTimeout(300);
  console.log('— Duas novidades antes de abrir (outra pessoa)');
  await p.evaluate(async () => { await Data.col('sv2_alm_cal').set('c2', { numero: 'CAL-2026-02', prestador: 'LABOR', itens: [{ equipId: 'e2', tag: 'BAL-01', nome: 'Balança', valor: 0, aplicado: false }], situacao: 'ativa', criadoEm: nowISO(), criadoPorNome: 'Joana Silva' }); });
  await p.waitForTimeout(200); await p.click('.cb-card:has-text("CAL-2026-02")'); await p.waitForTimeout(400); await esc(p); await p.waitForTimeout(300);
  await p.evaluate(async () => { await Data.col('sv2_alm_cal').update('c2', { cotacaoEm: hojeISO(), itens: [{ equipId: 'e2', tag: 'BAL-01', nome: 'Balança', valor: 90, aplicado: false }], agenda: { data: addDias(hojeISO(), 2) } }); });
  await p.waitForTimeout(200); await p.click('.cb-card:has-text("CAL-2026-02")'); await p.waitForTimeout(60); s = await estado(p);
  conf(s.esp === '2,3' && s.nivel === 1, 'viu na etapa 1; agora tem cotação e agenda: começa da 1, não do zero');
  const t0 = Date.now(); let t2 = 0, t3 = 0;
  while (Date.now() - t0 < 3000 && !t3) { const n = await p.evaluate(() => S._cbNivel.c2); if (n >= 2 && !t2) t2 = Date.now() - t0; if (n >= 3) t3 = Date.now() - t0; await p.waitForTimeout(25); }
  conf(t2 > 300 && t2 < 1400 && t3 - t2 >= 1200 && t3 - t2 < 1600, 'sobe uma etapa (0,6 s + gota 0,3 s), espera 0,4 s e sobe a próxima (2ª em ' + t2 + ' ms, 3ª ' + (t3 - t2) + ' ms depois)');
  await esc(p); await p.waitForTimeout(300);
  conf(erros.length === 0, 'nenhum erro de JavaScript (gaveta e fluido)' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Reduzir movimento');
  const rm = await b.newContext({ viewport: { width: 1366, height: 820 }, reducedMotion: 'reduce' }); const r = await rm.newPage(); const e3 = []; r.on('pageerror', e => e3.push(String(e)));
  await primeiro(r);
  await r.evaluate(async c => { await Data.col('sv2_alm_cal').set('c1', c); location.hash = '#/almox/calibracao'; }, CAL(1, { cotacaoEm: await r.evaluate(() => hojeISO()), agenda: { data: await r.evaluate(() => addDias(hojeISO(), 3)) } }));
  await r.waitForTimeout(300); await r.click('.cb-card'); await r.waitForTimeout(40); s = await estado(r);
  conf(s.esp === '' && s.acesas === 3, 'com "reduzir movimento" no aparelho: aparece pronto, sem subir');
  conf(await r.evaluate(() => getComputedStyle(document.getElementById('gv')).animationName === 'none'), 'e a gaveta abre sem deslizar');
  await r.keyboard.press('Escape'); await r.waitForTimeout(30);
  conf(await r.evaluate(() => !document.querySelector('aside.gv')), 'e fecha na hora');
  conf(e3.length === 0, 'nenhum erro de JavaScript com movimento reduzido');
  await rm.close();

  console.log('— Inventário de equipamentos e vidrarias');
  await p.evaluate(async () => { await Data.col('sv2_alm_equip').set('e5', { nome: 'Pipeta volumétrica 10 mL', tipo: 'qtd', situacao: 'ativo', precisaCal: false, qtdLocal: { 'Laboratório': 6, 'Gaveta 03': 4 } }); location.hash = '#/almox/equipamentos'; });
  await p.waitForTimeout(250);
  conf(/Inventário/.test(await p.textContent('.cs-acts')), 'Equipamentos: botão Inventário no cabeçalho');
  await p.click('.cs-acts a[data-inv]'); await p.waitForTimeout(250);
  await p.click('[data-act="cg-nova"]'); await p.waitForTimeout(150);
  const pt = await p.$$eval('#gv [data-act="cg-parte"]', l => l.map(x => x.getAttribute('data-id') + ':' + x.getAttribute('aria-pressed')).join());
  conf(pt === 'mat:false,equip:true,vid:true', 'vindo de Equipamentos: já marca Equipamentos e Vidrarias (' + pt + ')');
  const nums = await p.$$eval('#gv [data-act="cg-parte"] .num', l => l.map(x => x.textContent).join());
  conf(nums === '5,3,2', 'mostra quantos tem em cada parte: 5 materiais ativos, 3 equipamentos, 2 vidrarias (' + nums + ')');
  conf(await p.$eval('#gv .gv-kv b', e => e.textContent) === '6', 'itens para contar: 3 equipamentos + béquer + pipeta em 2 lugares = 6');
  await p.click('#gv [data-act="cg-parte"][data-id="equip"]'); await p.click('#gv [data-act="cg-parte"][data-id="vid"]'); await p.waitForTimeout(80);
  await dd(p, 'lc:cgcont', 'Joana Silva'); await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(150);
  conf(/Marque o que vai ser contado/.test(await msg(p)), 'nada marcado: "Marque o que vai ser contado"');
  await p.click('#gv [data-act="cg-parte"][data-id="equip"]'); await p.click('#gv [data-act="cg-parte"][data-id="vid"]'); await p.waitForTimeout(80);
  await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(400);
  const inv = await p.evaluate(() => { const i = cgAberta(); return i && { p: i.partes, t: i.tipo2, k: cgAlvos(i).map(a => a.k).join() }; });
  conf(inv && inv.p.mat === false && inv.p.equip && inv.p.vid && inv.t === 'inventario', 'inventário aberto com equipamentos e vidrarias (sem materiais)');
  conf(inv && /e:e1/.test(inv.k) && /e:e2/.test(inv.k) && /e:e3/.test(inv.k) && /v:e4(,|$)/.test(inv.k) && /v:e5__laboratorio/.test(inv.k) && /v:e5__gaveta-03/.test(inv.k), 'na lista: os 3 equipamentos, o béquer e a pipeta em cada lugar (' + (inv && inv.k) + ')');
  conf(!/\b12\b/.test(await p.textContent('.cg-it[data-k="v:e4"]')), 'às cegas também para vidraria (o 12 do béquer não aparece)');
  conf((await p.$$('.cg-it [data-act="cg-achei"]')).length === 6, 'cada equipamento tem "Não achei" e "Achei"');
  conf(/^Inventário CNT-/.test(await p.textContent('.cs-ph h1')) && /Equipamentos/.test(await p.textContent('.cs-abas .on')) && /Equipamentos/.test(await p.textContent('.cs-acts')), 'o título vira "Inventário CNT-…", debaixo de Equipamentos (aba marcada e botão de voltar)');
  await p.evaluate(() => { const e = document.querySelector('.cg-it[data-k="e:e1"]'); if (e) e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(SHOTS, 'v034-pc-claro-inventario.png') });
  const achei = async (k, v) => { await p.click('.cg-it[data-k="' + k + '"] [data-act="cg-achei"][data-v="' + v + '"]'); await p.waitForTimeout(220); };
  await achei('e:e1', 1); await achei('e:e2', 0); await achei('e:e3', 1);
  conf(await p.evaluate(() => { const c = cgContagens(cgAberta()); return c['e:e1'].cont === 1 && c['e:e2'].cont === 0 && c['e:e2'].esp.total === 1; }), 'Achei = 1, Não achei = 0 (o sistema espera 1)');
  conf(/Não achei/.test(await p.textContent('.cg-it[data-k="e:e2"]')) && (await p.$$('.cg-it[data-k="e:e2"] .cg-ach.nao')).length === 1, 'o contado mostra "Não achei" em vermelho');
  const vid = async (k, v) => { await p.fill('[data-cgk="' + k + '"]', v); await p.click('.cg-it[data-k="' + k + '"] [data-act="cg-salva"]'); await p.waitForTimeout(220); };
  await vid('v:e4', '10'); await vid('v:e5__laboratorio', '6'); await vid('v:e5__gaveta-03', '4');
  await dd(p, 'cg:vista', 'conferência'); await p.waitForTimeout(200);
  const tipos = await p.$$eval('.tb-t tbody tr[data-id]', l => l.map(x => x.getAttribute('data-id')).join());
  conf(tipos.split(',').length === 2 && /e:e2/.test(tipos) && /v:e4/.test(tipos), 'conferência: só o que não bateu (balança e béquer) (' + tipos + ')');
  conf(/Tipo/.test(await p.textContent('.tb-t thead')), 'conferência com a coluna Tipo');
  await p.click('.tb-t tbody tr[data-id="e:e2"]'); await p.waitForTimeout(150); await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(150);
  const ops = await p.$$eval('[data-dd="lc:cgtipo"] li', l => l.map(x => x.textContent).join('|'));
  conf(/Não encontrado/.test(ops) && !/Saída esquecida/.test(ops), 'equipamento: opções próprias (Não encontrado, Em outro lugar…), sem "saída esquecida"');
  await dd(p, 'lc:cgtipo', 'Não encontrado'); await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300); await esc(p);
  await p.click('.tb-t tbody tr[data-id="v:e4"]'); await p.waitForTimeout(150); await p.click('#gv [data-act="cg-decidir"]'); await p.waitForTimeout(150);
  await dd(p, 'lc:cgtipo', 'Quebra'); await p.fill('#gv [data-fm="obs"]', '2 quebrados na lavagem'); await p.click('[data-act="cg-res-ok"]'); await p.waitForTimeout(300); await esc(p);
  await p.click('[data-act="cg-concluir"]'); await p.waitForTimeout(900);
  const fim = await p.evaluate(() => { const e2 = S.almEq.find(x => x.id === 'e2'), e4 = S.almEq.find(x => x.id === 'e4'); return { na: e2.naoAchado, h2: (e2.hist || []).filter(h => h.tipo === 'inventario').length, q: e4.qtdLocal['Laboratório'], h4: (e4.hist || []).filter(h => h.tipo === 'quantidade').map(h => h.texto).join(), sit: S.almInv[0] && S.almInv.find(x => x.situacao === 'concluido') ? 1 : 0 }; });
  conf(/^CNT-\d{4}-01$/.test(fim.na) && fim.h2 === 1, 'concluir: a balança fica marcada "não encontrado" (' + fim.na + ') com o registro no histórico');
  conf(fim.q === 10 && /Quebra/.test(fim.h4) && /12 → 10/.test(fim.h4), 'o béquer passa a 10 no Laboratório, com "Quebra 12 → 10" no histórico');
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(200);
  await p.click('.tb-t tbody tr[data-id="e2"]'); await p.waitForTimeout(200);
  conf(/Não encontrado/.test(await p.textContent('#gv')), 'a gaveta do equipamento avisa "Não encontrado na contagem CNT-…"');
  await p.screenshot({ path: path.join(SHOTS, 'v034-pc-claro-nao-encontrado.png') });
  await esc(p); await p.waitForTimeout(300);
  console.log('— Achado numa próxima contagem');
  await p.click('.cs-acts a[data-inv]'); await p.waitForTimeout(200); await p.click('[data-act="cg-nova"]'); await p.waitForTimeout(150);
  await p.click('#gv [data-act="cg-parte"][data-id="vid"]'); await dd(p, 'lc:cgcont', 'Joana Silva'); await p.click('[data-act="cg-nova-ok"]'); await p.waitForTimeout(400);
  await achei('e:e1', 1); await achei('e:e2', 1); await achei('e:e3', 1);
  await dd(p, 'cg:vista', 'conferência'); await p.waitForTimeout(150); await p.click('[data-act="cg-concluir"]'); await p.waitForTimeout(900);
  conf(await p.evaluate(() => !S.almEq.find(x => x.id === 'e2').naoAchado), 'achou a balança na contagem seguinte: a marca "não encontrado" sai sozinha');
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q);
  await q.evaluate(async () => { const u = S.user; await Data.col('sv2_alm_inv').add({ numero: 'CNT-2026-01', tipo: 'contagem', tipo2: 'inventario', local: 'Almoxarifado', partes: { mat: false, equip: true, vid: true }, situacao: 'aberto', contagens: {}, recontar: {}, resolucoes: {}, abertoEm: nowISO(), porId: u.id, porNome: u.nome, contadorId: u.id, contadorNome: u.nome }); location.hash = '#/almox/contagem'; });
  await q.waitForTimeout(400);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: o inventário não rola para o lado');
  const bh = await q.$$eval('.cg-it [data-act="cg-achei"]', l => Math.min.apply(null, l.map(x => x.getBoundingClientRect().height)));
  conf(bh >= 44, 'celular: botões Achei / Não achei com altura de toque (' + bh + ' px)');
  await q.screenshot({ path: path.join(SHOTS, 'v034-cel-claro-inventario.png') });
  await q.evaluate(async c => { await Data.col('sv2_alm_cal').set('c1', c); location.hash = '#/almox/calibracao'; }, CAL(1, { cotacaoEm: await q.evaluate(() => hojeISO()) }));
  await q.waitForTimeout(300); await q.click('.cb-card'); await q.waitForTimeout(1400);
  s = await estado(q);
  conf(s && s.acesas === 2 && s.esp === '', 'celular: o fluido também sobe na tela cheia');
  await q.screenshot({ path: path.join(SHOTS, 'v034-cel-claro-fluido.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v034: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
