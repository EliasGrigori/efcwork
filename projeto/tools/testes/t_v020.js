/* EFCwork · suíte da v0.2.0 — Almoxarifado (consulta), tabela padrão, gaveta, planilha, impressão, busca geral e números do Início.
   Dados de exemplo gravados no modo demonstração (nada vai ao Firebase real). Uso: node tools/testes/t_v020.js */
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
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 }, acceptDownloads: true });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  await semear(p);
  /* cálculos iguais aos do EFClaudian */
  const c = await p.evaluate(() => ({ luva: alDisp('luva'), fenol: alDisp('fenol'), fenolSaldo: alSaldo('fenol'), agua: alDisp('agua'), gelo: alDisp('gelo'), sit: ['luva', 'fita', 'fenol', 'agua', 'gelo', 'velho'].map(id => alSit(alItem(id)).id).join(',') }));
  conf(c.luva === 1 && c.agua === 34 && c.gelo === 22, 'saldo por lote: luva 5−4 = 1; saída anulada não conta (água 34); gelo 22');
  conf(c.fenol === 0 && c.fenolSaldo === 2, 'lote vencido não é utilizável (fenolftaleína: saldo 2, utilizável 0)');
  conf(c.sit === 'min,zero,vencido,ok,avencer,inativo', 'situações: abaixo do mínimo, sem saldo, lote vencido, em dia, vence em 30 dias, inativo (' + c.sit + ')');
  /* Início */
  await p.evaluate(() => { location.hash = '#/inicio'; }); await p.waitForTimeout(200);
  const kpi = await p.$$eval('.kps .kp b', l => l.map(x => x.textContent));
  conf(kpi[0] === '4' && kpi[1] === '2' && kpi[2] === '1', 'Início: 4 materiais pedem atenção, 2 calibrações vencidas/a vencer, 1 solicitação pendente (' + kpi.join(',') + ')');
  await p.click('.kps a[data-f="atencao"]'); await p.waitForTimeout(250);
  conf(await p.evaluate(() => location.hash) === '#/almox/materiais' && (await p.$$('.tb-t tbody tr')).length === 4, 'número do Início abre Materiais já filtrado (4 linhas)');
  /* Painel */
  await p.evaluate(() => { location.hash = '#/almox/painel'; }); await p.waitForTimeout(200);
  const pk = await p.$$eval('.al-kps .kp b', l => l.map(x => x.textContent));
  conf(pk[0] === '5' && pk[1] === '4' && /R\$/.test(pk[2]), 'Painel: 5 itens ativos, 4 pedem atenção, valor em estoque (' + pk.join(' | ') + ')');
  conf(await p.evaluate(() => { const v = alAtivos().reduce((s, i) => s + alValorEst(i.id), 0); return Math.abs(v - (29 + 20 + 34 * 2.13 + 22 * 8.29)) < 0.01; }), 'valor em estoque = soma de saldo × preço de cada lote');
  conf(/lote vencendo/.test(await p.textContent('.al-aviso')) && /1 solicitação pendente/.test(await p.textContent('.al-aviso')), 'aviso numa linha só (lote vencendo + solicitação pendente)');
  conf((await p.$$('.cs-acts .bt.pr')).length === 0 && /Consulta/.test(await p.textContent('.cs-acts')), 'consulta: nenhum botão de lançar nesta versão; aviso de que lançar continua no EFClaudian');
  await p.screenshot({ path: path.join(SHOTS, 'v020-pc-claro-painel.png') });
  /* Materiais: tabela padrão */
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  await p.click('[data-act="tb-limpa"]').catch(() => {}); await p.waitForTimeout(150);
  conf((await p.$$('.tb-t tbody tr')).length === 6, 'Materiais lista os 6 itens (inclui o inativo)');
  const ths = await p.$$eval('.tb-t thead th', l => l.map(x => x.textContent.replace(/[▲▼]/g, '')));
  conf(ths.join('|') === 'Código|Item|Local|Un|Utilizável|Mínimo|Valor|Situação', 'colunas: ' + ths.join(', '));
  conf(await p.$eval('.tb-t thead th:nth-child(5)', e => e.classList.contains('n')) && await p.$eval('.tb-t tbody td:nth-child(5)', e => getComputedStyle(e).textAlign === 'right'), 'números alinhados à direita');
  conf(/Total/.test(await p.textContent('.tb-t tfoot')), 'linha de total no rodapé');
  await p.click('[data-act="tb-painel"]'); await p.waitForTimeout(120);
  conf(await p.isVisible('.tb-painel [data-dd="tbf:al-mat:sit"]') && await p.isVisible('.tb-painel [data-dd="tbf:al-mat:loc"]'), 'um único filtro recolhível com Situação e Local em janelas retráteis');
  await p.click('[data-dd="tbf:al-mat:sit"] .dd-b'); await p.click('[data-dd="tbf:al-mat:sit"] li[data-v="atencao"]'); await p.waitForTimeout(150);
  conf((await p.$$('.tb-t tbody tr')).length === 4 && /Pedem atenção/.test(await p.textContent('.tb-flt')), 'filtro "Pedem atenção": 4 linhas e o resumo aparece no botão');
  await p.click('[data-dd="tbf:al-mat:loc"] .dd-b'); await p.click('[data-dd="tbf:al-mat:loc"] li[data-v="Geladeira"]'); await p.waitForTimeout(150);
  conf((await p.$$('.tb-t tbody tr')).length === 2, 'dois filtros juntos (Pedem atenção + Geladeira): 2 linhas');
  await p.click('[data-act="tb-limpa"]'); await p.waitForTimeout(150);
  await p.fill('[data-tbbusca="al-mat"]', 'agua'); await p.waitForTimeout(400);
  conf((await p.$$('.tb-t tbody tr')).length === 1 && /Água/.test(await p.textContent('.tb-t tbody')), 'busca sem acento acha "Água desmineralizada"');
  await p.fill('[data-tbbusca="al-mat"]', ''); await p.waitForTimeout(400);
  await p.click('.tb-t thead th:nth-child(5) button'); await p.waitForTimeout(120); await p.click('.tb-t thead th:nth-child(5) button'); await p.waitForTimeout(150);
  conf((await p.textContent('.tb-t tbody tr:first-child td:nth-child(2)')).trim() === 'Água desmineralizada 1 L' && await p.$eval('.tb-t thead th:nth-child(5)', e => e.getAttribute('aria-sort')) === 'descending', 'ordenar por Utilizável (maior primeiro) pelo cabeçalho');
  await p.click('[data-act="tb-cols"]'); await p.waitForTimeout(100);
  await p.click('[data-tbcol="al-mat"][value="cod"]'); await p.waitForTimeout(150);
  conf((await p.$$('.tb-t thead th')).length === 7 && await p.evaluate(() => localStorage.getItem('cw-tbcol-al-mat')) === '["cod"]', 'esconder a coluna Código (lembrado no aparelho)');
  await p.click('[data-tbcol="al-mat"][value="cod"]'); await p.waitForTimeout(150); await p.click('[data-act="tb-cols"]'); await p.waitForTimeout(100);
  await p.click('[data-act="tb-xlsx"]'); await p.waitForTimeout(300);
  const pl = await p.evaluate(() => { const u = S._plUltimo; const sh = u.arqs.find(a => a.nome === 'xl/worksheets/sheet1.xml').dados; return { nome: u.nome, cab: /Utilizável/.test(sh) && /Situação/.test(sh), luva: /Luva nitr/.test(sh), n: (sh.match(/<row /g) || []).length, num: /<c r="E\d+"><v>34<\/v><\/c>/.test(sh), aba: /name="Materiais"/.test(u.arqs.find(a => a.nome === 'xl/workbook.xml').dados) }; });
  conf(/^EFCwork-materiais-\d{4}-\d{2}-\d{2}\.xlsx$/.test(pl.nome) && pl.cab && pl.luva && pl.n === 7 && pl.aba, 'planilha .xlsx: aba Materiais, cabeçalho + 6 linhas (' + pl.nome + ')');
  conf(pl.num, 'na planilha o número sai como número (Utilizável 34)');
  await p.evaluate(() => { window.print = () => { window.__imp = document.getElementById('tb-imp').innerHTML; }; });
  await p.click('[data-act="tb-imp"]'); await p.waitForTimeout(200);
  conf(await p.evaluate(() => /Materiais/.test(window.__imp || '') && (window.__imp.match(/<tr>/g) || []).length === 7), 'impressora: monta a folha com título e as 6 linhas');
  /* gaveta */
  await p.click('.tb-t tbody tr:has-text("Luva nitrílica M")'); await p.waitForTimeout(250);
  conf(await p.isVisible('#gv') && /Luva nitrílica M/.test(await p.textContent('#gv h2')), 'clicar na linha abre a gaveta do item');
  const gv = await p.textContent('#gv');
  conf(/Abaixo do mínimo/.test(gv) && /L1/.test(gv) && /Saída de 4/.test(gv) && /Uso no expediente/.test(gv), 'gaveta: situação, lote L1 e a última saída com motivo');
  conf(await p.evaluate(() => document.querySelector('.tb-t tr.sel') !== null), 'linha aberta fica marcada na tabela');
  await p.screenshot({ path: path.join(SHOTS, 'v020-pc-claro-materiais-gaveta.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  conf(!(await p.isVisible('#gv')), 'Esc fecha a gaveta');
  /* Movimentações */
  await p.evaluate(() => { location.hash = '#/almox/movimentacoes'; }); await p.waitForTimeout(200);
  conf((await p.$$('.tb-t tbody tr')).length === 6, 'Movimentações: 6 lançamentos');
  conf(/Anulada/.test(await p.textContent('.tb-t tbody')), 'saída anulada aparece com a situação "Anulada"');
  await p.click('[data-act="tb-painel"]'); await p.click('[data-dd="tbf:al-mov:tipo"] .dd-b'); await p.click('[data-dd="tbf:al-mov:tipo"] li[data-v="saida"]'); await p.waitForTimeout(150);
  conf((await p.$$('.tb-t tbody tr')).length === 2 && /Saídas/.test(await p.textContent('.tb-pe')), 'filtro Tipo = Saídas: 2 linhas; rodapé com entradas e saídas em R$');
  /* Solicitações */
  await p.evaluate(() => { location.hash = '#/almox/solicitacoes'; }); await p.waitForTimeout(200);
  conf((await p.$$('.tb-t tbody tr')).length === 2 && /1 pendentes/.test(await p.textContent('.cs-meta')), 'Solicitações: 2 linhas e "1 pendentes" no cabeçalho');
  await p.click('.tb-t tbody tr:has-text("1042")'); await p.waitForTimeout(200);
  conf(/Ponteira 200/.test(await p.textContent('#gv')) && /ainda não cadastrado/.test(await p.textContent('#gv')), 'gaveta da solicitação: itens, inclusive o ainda não cadastrado');
  await p.click('[data-act="gv-fecha"]'); await p.waitForTimeout(150);
  /* Equipamentos */
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(200);
  const eqs = await p.evaluate(() => ['e1', 'e2', 'e3', 'e4'].map(id => eqCalSit(S.almEq.find(e => e.id === id))).join(','));
  conf(eqs === 'vencida,avencer,ok,', 'calibração: vencida (400 dias), a vencer (340 dias), em dia (30 dias), não calibra (' + eqs + ')');
  await p.click('.tb-t tbody tr:has-text("PHM-02")'); await p.waitForTimeout(200);
  conf(/Vencida/.test(await p.textContent('#gv')) && /Bancada 1/.test(await p.textContent('#gv')), 'gaveta do equipamento: calibração e local');
  await p.screenshot({ path: path.join(SHOTS, 'v020-pc-claro-equip-gaveta.png') });
  await p.click('[data-act="gv-fecha"]');
  /* busca geral */
  await p.keyboard.press('/'); await p.waitForTimeout(150);
  conf(await p.isVisible('#bg-q'), 'tecla / abre a busca geral');
  conf(/Voltar para/.test(await p.textContent('#bg-res')), 'busca vazia mostra "Voltar para"');
  await p.fill('#bg-q', 'luva'); await p.waitForTimeout(150);
  conf(/Materiais/.test(await p.textContent('#bg-res')) && /Luva nitrílica M/.test(await p.textContent('.bg-it.on')), 'busca acha o material');
  await p.keyboard.press('Enter'); await p.waitForTimeout(350);
  conf(await p.evaluate(() => location.hash) === '#/almox/materiais' && await p.isVisible('#gv') && /Luva/.test(await p.textContent('#gv h2')), 'Enter vai para Materiais com a gaveta do item aberta');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(150); await p.fill('#bg-q', 'phm'); await p.waitForTimeout(150);
  conf(/PHM-02/.test(await p.textContent('#bg-res')), 'Ctrl+K abre; acha equipamento pela TAG');
  await p.fill('#bg-q', 'movimenta'); await p.waitForTimeout(150);
  conf(/Telas/.test(await p.textContent('#bg-res')) && /Movimentações/.test(await p.textContent('#bg-res')), 'acha telas pelo nome');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  conf(!(await p.isVisible('#bg')), 'Esc fecha a busca');
  await p.click('[data-act="cs-tema"]'); await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  await p.click('.tb-t tbody tr:has-text("Gelo")'); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(SHOTS, 'v020-pc-escuro-materiais-gaveta.png') });
  await p.click('[data-act="gv-fecha"]'); await p.click('[data-act="cs-busca"]'); await p.fill('#bg-q', 'gel'); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(SHOTS, 'v020-pc-escuro-busca.png') });
  await p.keyboard.press('Escape'); await p.click('[data-act="cs-tema"]');
  /* sem atribuição do Almoxarifado */
  const sec = await p.evaluate(async () => { const id = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(id, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', atrib: { coletas: true, almox: false } }); return id; });
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.fill('#en-login', 'ana.lima'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(600);
  conf(await p.evaluate(() => S.user && S.user.login === 'ana.lima'), 'entra como Secundário sem a atribuição do Almoxarifado');
  conf((await p.$$('.kps .kp')).length === 0, 'Início sem os números do Almoxarifado para quem não tem acesso');
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(200);
  conf(/não tem acesso ao Almoxarifado/.test(await p.textContent('.cs-ct')) && (await p.$$('.tb-t')).length === 0, 'Almoxarifado: mensagem "Você não tem acesso", sem tabela');
  await p.keyboard.press('/'); await p.fill('#bg-q', 'luva'); await p.waitForTimeout(150);
  conf(!/Luva/.test(await p.textContent('#bg-res')), 'busca geral não mostra materiais para quem não tem acesso');
  await p.keyboard.press('Escape');
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  /* celular */
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400); await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600); await semear(q);
  const largo = [];
  for (const a of ['painel', 'materiais', 'movimentacoes', 'solicitacoes', 'equipamentos']) { await q.evaluate(h => { location.hash = h; }, '#/almox/' + a); await q.waitForTimeout(150); if (await q.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) largo.push(a); }
  conf(!largo.length, 'celular: nenhuma aba do Almoxarifado rola a página para o lado (a tabela rola dentro dela)' + (largo.length ? ' (' + largo.join(',') + ')' : ''));
  await q.evaluate(() => { location.hash = '#/almox/materiais'; }); await q.waitForTimeout(150);
  await q.screenshot({ path: path.join(SHOTS, 'v020-cel-claro-materiais.png') });
  await q.click('.tb-t tbody tr:has-text("Luva")'); await q.waitForTimeout(200);
  conf(await q.evaluate(() => Math.round(document.getElementById('gv').getBoundingClientRect().width) === innerWidth), 'celular: a gaveta abre em tela cheia');
  await q.screenshot({ path: path.join(SHOTS, 'v020-cel-claro-gaveta.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v020: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
