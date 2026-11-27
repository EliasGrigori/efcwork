/* EFCwork · v0.6.40 · Coletas › Cadastros (talhões, análises, laboratórios, tipos de coleta, fazendas e pontos de água).
   Modo demonstração, dados fictícios. Tira as telas da página de aprovação em tools/visual/v0640/telas.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0640.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'visual', 'v0640', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await esp(150); };
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const foto = async (p, n) => { await esp(250); await p.screenshot({ path: path.join(SHOTS, n + '.png') }); };
async function abre(b, w, h, perfil) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel }); await ctx.route(/^https:/, r => r.abort());
  const p = await ctx.newPage(), er = []; p._er = er; p.on('pageerror', e => er.push(String(e)));
  await p.goto(URL); await esp(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
  await p.evaluate(async () => {
    const C = Data.col.bind(Data);
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI', 'AQUALAB'], labModelo: { IBRA: 'completa' }, labPrazo: { IBRA: 10 }, labInfo: { IBRA: { cidade: 'Araras' }, BIOAGRI: { cidade: 'Piracicaba' } },
      fazendas: [{ prefixo: 'RU', numero: '18', nome: 'Fazenda Russas', unidade: 'matriz' }, { prefixo: 'JD', numero: '01', nome: 'Fazenda Jardim', unidade: 'matriz' }, { prefixo: 'JG', nome: 'Fazenda Jaguaruana', unidade: 'filial' }],
      tipos: [{ nome: 'SOLO+RAIZ', gera: ['SOLO', 'NEMATOIDE'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FOLHA', gera: ['FOLHA'], pontosPorHa: 5 }, { nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FRUTA VERDE', gera: ['FRUTA'], pontosPorHa: 2 }] });
    const T = (id, o) => C('sv2_talhoes').set(id, Object.assign({ pivo: 'Pivô 2', cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true }, o));
    await T('t1', { codigo: 'RU11TAI24', hectares: 4.5 }); await T('t2', { codigo: 'RU12TAI24', hectares: 4.5 }); await T('t3', { codigo: 'RU13TAI24', hectares: 4, ptsFolha: 6 });
    await T('t4', { codigo: 'JD03FOR25', pivo: 'Pivô 1', variedade: 'FORMOSA', hectares: 6.2 }); await T('t5', { codigo: 'JG01ACE23', pivo: 'Setor A', cultura: 'ACEROLA', variedade: 'BRS 366', hectares: 3.1 });
    await T('t6', { codigo: 'RU09TAI21', hectares: 3, ativo: false, motivoInativo: 'erradicado em 2025' });
    const A = (id, o) => C('sv2_analises').set(id, Object.assign({ ativo: true, rev: 0, criadoEm: '2026-01-0' + id.slice(1) + 'T10:00:00.000Z' }, o));
    await A('a1', { nome: 'SOLO COMPLETO', tipo: 'SOLO', lab: 'IBRA', sigla: 'SC', valor: 120 }); await A('a2', { nome: 'NEMATOIDE', tipo: 'NEMATOIDE', lab: 'BIOAGRI', sigla: 'NEM', valor: 80 });
    await A('a3', { nome: 'FOLIAR', tipo: 'FOLHA', lab: 'IBRA', sigla: 'FOL', valor: 90 }); await A('a4', { nome: 'RESÍDUOS', tipo: 'FRUTA', lab: 'IBRA', sigla: 'RES', valor: 300 });
    await A('a5', { nome: 'MICROBIOLÓGICA', tipo: 'AGUA', lab: 'AQUALAB', sigla: 'MIC', valor: 85 }); await A('a6', { nome: 'MICRONUTRIENTES', tipo: 'SOLO', lab: 'IBRA', sigla: 'MICR', valor: 60 });
    await C('sv2_aguaponto').set('p1', { nome: 'Canal 01', tipo: 'canal', local: 'Fazenda Russas', ativo: true });
    await C('sv2_rodizio').set('r1', { nome: 'Solo anual', tipo: 'SOLO', freq: 'A', ano: 2026, areas: ['RU12TAI24'], ativo: true, criadoEm: '2026-01-01T10:00:00.000Z' });
    if (window.__perfil) await C('sv2_users').update(S.user.id, window.__perfil);
  });
  if (perfil) { await p.evaluate(o => Data.col('sv2_users').update(S.user.id, o), perfil); await esp(300); }
  await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(900);
  return p;
}
/* auditoria (Método Sabiá, skill auditoria-visual-efc): campos lado a lado na mesma linha, mesma altura; no celular, mesma largura */
const alinha = p => p.evaluate(() => { const ruins = [];
  document.querySelectorAll('#gv .fm-g').forEach(g => { const cs = [...g.children].filter(c => c.classList.contains('fm-c')); if (cs.length < 2) return;
    const cx = cs.map(c => c.querySelector('.fm-i, .dd-b, .fm-passo')).filter(Boolean).map(e => e.getBoundingClientRect()); if (cx.length < 2) return;
    const lin = cx.every(b => Math.abs(b.top - cx[0].top) < 1.5 || cx.some(o => o !== b && Math.abs(o.top - b.top) < 1.5)), alt = cx.every(b => Math.abs(b.height - cx[0].height) < 1.5);
    const mesmaLinha = cx.filter(b => Math.abs(b.top - cx[0].top) < 1.5), larg = innerWidth > 600 || mesmaLinha.every(b => Math.abs(b.width - mesmaLinha[0].width) < 2);
    const rot = cs.map(c => c.querySelector('.fm-r')).filter(Boolean).map(e => Math.round(e.getBoundingClientRect().height)), rotOk = rot.every(h => h === rot[0]);
    if (!(lin && alt && larg && rotOk)) ruins.push(cs.map(c => (c.querySelector('.fm-r') || {}).textContent).join(' | ') + (rotOk ? '' : ' (rótulos ' + rot.join('/') + ' px)')); });
  return ruins; });
const linhas = p => p.evaluate(() => [...document.querySelectorAll('.tb tbody tr:not(.tb-gr)')].map(t => t.children[0].textContent.trim()));
(async () => {
  const b = await chromium.launch();
  /* HOJE (v0.6.39 publicada): só Pontos de água */
  const HOJE = process.env.EFC_HOJE_DIST;
  if (HOJE) { const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } }); await ctx.route(/^https:/, r => r.abort()); const p = await ctx.newPage();
    await p.goto('file://' + path.join(path.resolve(HOJE), 'index.html') + '?demo=1'); await esp(500);
    await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
    await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
    await p.evaluate(() => Data.col('sv2_aguaponto').set('p1', { nome: 'Canal 01', tipo: 'canal', local: 'Fazenda Russas', ativo: true })); await p.evaluate(() => { location.hash = '#/coletas/cadastros'; }); await esp(900);
    await foto(p, 'hoje-pc'); await ctx.close(); }

  let p = await abre(b, 1366, 820);
  console.log('— a tela: lista retrátil escolhe o cadastro');
  conf(await p.evaluate(() => !!document.querySelector('.cs-ph [data-dd="cc:vista"]') && /Novo talhão/.test(document.querySelector('.cs-ph').textContent)), 'no alto: a lista retrátil (Talhões) e "Novo talhão"');
  conf((await linhas(p)).join(',') === 'JD03FOR25,JG01ACE23,RU09TAI21,RU11TAI24,RU12TAI24,RU13TAI24', 'ITEM 240: desativado junto dos ativos, na ordem do código: ' + (await linhas(p)).join(','));
  conf(await p.evaluate(() => !document.querySelector('.tb tr.tb-gr')), 'ITEM 240: sem a faixa Ativos/Desativados');
  conf(await p.evaluate(() => /5 talhões ativos/.test(document.querySelector('.cs-ph').textContent)), 'o cabeçalho diz quantos estão ativos');
  conf(!/EFClaudian/.test(await p.evaluate(() => document.querySelector('main') ? document.querySelector('main').innerText : document.body.innerText)), 'a tela não manda mais para o EFClaudian');
  await foto(p, 'pc-talhoes');
  await p.click('[data-dd="cc:vista"] .dd-b'); await esp(200); await foto(p, 'pc-lista-aberta'); await p.keyboard.press('Escape'); await esp(150);
  for (const [v, txt, n] of [['analises', 'Análises', 'pc-analises'], ['labs', 'Laboratórios', 'pc-labs'], ['tipos', 'Tipos de coleta', 'pc-tipos'], ['fazendas', 'Fazendas', 'pc-fazendas'], ['pontos', 'Pontos de água', 'pc-pontos']]) {
    await dd(p, 'cc:vista', txt); await esp(300);
    conf(await p.evaluate(x => S.ccVista === x && !!document.querySelector('.cs-ph [data-dd="cc:vista"]') && !document.querySelector('.tb tr.tb-gr'), v), txt + ': lista retrátil no alto, sem faixa de grupo');
    if (v === 'analises') conf(await p.evaluate(() => ![...document.querySelectorAll('.tb thead th')].some(th => /Sigla/.test(th.textContent))), 'ITEM 242: sem a coluna Sigla');
    if (v === 'tipos') conf(await p.evaluate(() => ![...document.querySelectorAll('.tb thead th')].some(th => /Profundidade/.test(th.textContent))), 'ITEM 245: sem a coluna Profundidades');
    if (v === 'fazendas') conf(await p.evaluate(() => ![...document.querySelectorAll('.tb thead th')].some(th => /Prefixo/.test(th.textContent)) && !/\bRU\b|\bJD\b|\bJG\b/.test(document.querySelector('.tb tbody').textContent)), 'ITEM 246: fazendas sem prefixo à vista');
    await foto(p, n);
  }
  conf(await p.evaluate(() => /Canal 01/.test(document.body.innerText) && /Novo ponto de água/.test(document.querySelector('.cs-ph').textContent)), 'Pontos de água continua igual, dentro da mesma lista');

  console.log('— talhão: novo, código não muda, desativar e reativar');
  await dd(p, 'cc:vista', 'Talhões'); await p.click('[data-act="cc-novo"]'); await esp(250); await foto(p, 'pc-talhao-novo');
  { const a = await alinha(p); conf(!a.length, 'ITEM 241: Novo talhão com campos lado a lado alinhados' + (a.length ? ': ' + a.join('; ') : '')); }
  await p.fill('#gv [data-fm="codigo"]', 'xx01tai26'); await p.fill('#gv [data-fm="hectares"]', '3,5'); await p.click('#gv [data-act="cc-ok"]'); await esp(200);
  conf(/Não há fazenda com o prefixo XX/.test(await msg(p)), 'prefixo sem fazenda é barrado: ' + await msg(p));
  await p.fill('#gv [data-fm="codigo"]', 'ru11tai24'); await p.click('#gv [data-act="cc-ok"]'); await esp(200);
  conf(/Já existe o talhão RU11TAI24/.test(await msg(p)), 'código repetido é barrado');
  await p.fill('#gv [data-fm="codigo"]', 'ru14tai26'); await p.fill('#gv [data-fm="cultura"]', 'mamão'); await p.fill('#gv [data-fm="pivo"]', 'Pivô 3'); await p.click('#gv [data-act="cc-ok"]'); await esp(600);
  conf(await p.evaluate(() => { const t = S.talhoes.find(x => x.codigo === 'RU14TAI26'); return !!t && t.hectares === 3.5 && t.cultura === 'MAMÃO' && t.ativo === true && t.ptsSolo === 0; }), 'gravou RU14TAI26 com 3,5 ha, cultura em maiúsculas, pontos do tipo');
  conf(await p.evaluate(() => !!document.getElementById('gv') && /RU14TAI26/.test(document.querySelector('#gv h2').textContent)), 'depois de gravar abre a gaveta do talhão');
  await foto(p, 'pc-talhao-gaveta');
  await p.click('#gv [data-act="cc-editar"]'); await esp(250);
  conf(await p.evaluate(() => { const i = document.querySelector('#gv input[disabled]'); return !!i && i.value === 'RU14TAI26' && !document.querySelector('#gv [data-fm="codigo"]'); }), 'ao editar, o código aparece travado');
  await foto(p, 'pc-talhao-editar');
  { const a = await alinha(p); conf(!a.length, 'ITEM 241: Editar talhão (código travado) alinhado' + (a.length ? ': ' + a.join('; ') : '')); }
  await p.fill('#gv [data-fm="ptsFolha"]', '7'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => S.talhoes.find(x => x.codigo === 'RU14TAI26').ptsFolha === 7), 'pontos por ha só deste talhão (folha 7)');
  await p.keyboard.press('Escape'); await esp(200);
  await p.click('.tb tbody tr:has-text("RU12TAI24")'); await esp(250); await p.click('#gv .gv-lx'); await esp(250);
  conf(/1 plano de coleta ativo/.test(await p.evaluate(() => document.querySelector('#gv').textContent)), 'desativar avisa que o talhão está num plano ativo');
  await foto(p, 'pc-desativar');
  await p.click('#gv [data-act="cc-desat-ok"]'); await esp(200); conf(/motivo/.test(await msg(p)), 'desativar pede o motivo');
  await p.fill('#gv [data-fm="motivo"]', 'replantio'); await p.click('#gv [data-act="cc-desat-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const t = S.talhoes.find(x => x.id === 't2'); return t.ativo === false && t.motivoInativo === 'replantio'; }), 'desativou com o motivo (nada apagado)');
  conf(await p.evaluate(() => !!document.querySelector('#gv [data-act="cc-reativar"]') && !document.querySelector('#gv .gv-lx')), 'desativado: Reativar no lugar da lixeira');
  await p.click('#gv [data-act="cc-reativar"]'); await esp(500);
  conf(await p.evaluate(() => S.talhoes.find(x => x.id === 't2').ativo === true), 'reativou');
  await p.keyboard.press('Escape'); await esp(200);

  console.log('— análise: nova, preço novo sobe a revisão, reajuste');
  await dd(p, 'cc:vista', 'Análises'); await p.click('[data-act="cc-novo"]'); await esp(250);
  await dd(p, 'cc:tipo', 'Folha'); await dd(p, 'cc:lab', 'IBRA'); await p.fill('#gv [data-fm="nome"]', 'foliar completa'); await p.fill('#gv [data-fm="sigla"]', 'fc'); await p.fill('#gv [data-fm="valor"]', '110,50');
  await foto(p, 'pc-analise-nova');
  { const a = await alinha(p); conf(!a.length, 'Nova análise alinhada' + (a.length ? ': ' + a.join('; ') : '')); }
  await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const a = S.analises.find(x => x.nome === 'FOLIAR COMPLETA'); return !!a && a.tipo === 'FOLHA' && a.lab === 'IBRA' && a.sigla === 'FC' && a.valor === 110.5 && a.rev === 0; }), 'gravou a análise no formato de sempre (maiúsculas, valor 110,50, rev 0)');
  await p.click('#gv [data-act="cc-editar"]'); await esp(200); await p.fill('#gv [data-fm="valor"]', '120'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const a = S.analises.find(x => x.nome === 'FOLIAR COMPLETA'); return a.valor === 120 && a.rev === 1; }), 'preço novo: valor 120 e revisão 1');
  await p.keyboard.press('Escape'); await esp(200);
  await p.click('[data-act="cc-reaj"]'); await esp(250); await dd(p, 'cc:rlab', 'IBRA'); await p.fill('#gv [data-fm="pct"]', '10'); await esp(600);
  conf(await p.evaluate(() => /R\$ 120,00 → R\$ 132,00/.test(document.querySelector('#gv').textContent) && /Reajustar 5 análises/.test(document.querySelector('#gv').textContent)), 'reajuste mostra antes e depois, só do IBRA (5 análises)');
  await foto(p, 'pc-reajuste');
  await p.click('#gv [data-act="cc-reaj-ok"]'); await esp(600);
  conf(await p.evaluate(() => S.analises.find(x => x.id === 'a1').valor === 132 && S.analises.find(x => x.id === 'a1').rev === 1 && S.analises.find(x => x.id === 'a2').valor === 80), 'reajustou só o IBRA (120 → 132), o BIOAGRI ficou igual');

  console.log('— laboratório, tipo e fazenda');
  await dd(p, 'cc:vista', 'Laboratórios'); await p.click('[data-act="cc-novo"]'); await esp(250);
  await p.fill('#gv [data-fm="nome"]', 'Solo Análise'); await p.fill('#gv [data-fm="prazo"]', '12'); await p.fill('#gv [data-fm="razao"]', 'Solo Análise Laboratório Ltda'); await p.fill('#gv [data-fm="cnpj"]', '1234567800019');
  await p.fill('#gv [data-fm="end"]', 'Rua das Flores, 100'); await p.fill('#gv [data-fm="bairro"]', 'Centro'); await p.fill('#gv [data-fm="cep"]', '13600000'); await p.fill('#gv [data-fm="cidade"]', 'Araras'); await p.fill('#gv [data-fm="uf"]', 'sp'); await p.fill('#gv [data-fm="contato"]', '(19) 3333-0000');
  { const a = await alinha(p); conf(!a.length, 'ITEM 244: Novo laboratório (cadastro completo) alinhado' + (a.length ? ': ' + a.join('; ') : '')); }
  await foto(p, 'pc-lab-novo'); await p.click('#gv [data-act="cc-ok"]'); await esp(300);
  conf(/CNPJ tem 14 números/.test(await msg(p)), 'CNPJ com 13 números é barrado');
  await p.fill('#gv [data-fm="cnpj"]', '12345678000190'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const i = S.cfgCol.labInfo['Solo Análise']; return S.cfgCol.labs.indexOf('Solo Análise') >= 0 && S.cfgCol.labPrazo['Solo Análise'] === 12 && i.nome === 'Solo Análise Laboratório Ltda' && i.cnpj === '12.345.678/0001-90' && i.cep === '13600-000' && i.uf === 'SP' && i.end === 'Rua das Flores, 100' && S.cfgCol.labInfo.IBRA.cidade === 'Araras'; }), 'ITEM 244: grava razão social, CNPJ e CEP formatados, UF em maiúsculas, no mesmo lugar do rótulo (labInfo); os outros continuam');
  await foto(p, 'pc-lab-gaveta');
  await p.keyboard.press('Escape'); await esp(200);
  await dd(p, 'cc:vista', 'Tipos de coleta'); await p.click('[data-act="cc-novo"]'); await esp(250);
  conf(await p.evaluate(() => !document.querySelector('#gv [data-fm="profs"]')), 'ITEM 245: o formulário do tipo não pede profundidade');
  await p.fill('#gv [data-fm="nome"]', 'raiz'); await p.click('#gv [data-fm="gera.SOLO"]'); await p.click('#gv [data-fm="gera.NEMATOIDE"]'); await p.fill('#gv [data-fm="pontosPorHa"]', '3');
  { const a = await alinha(p); conf(!a.length, 'Novo tipo alinhado' + (a.length ? ': ' + a.join('; ') : '')); }
  await foto(p, 'pc-tipo-novo'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const t = S.cfgCol.tipos.find(x => x.nome === 'RAIZ'); return !!t && t.gera.join() === 'NEMATOIDE' && t.pontosPorHa === 3 && S.cfgCol.tipos.length === 5; }), 'tipo RAIZ: gera Nematoide e pontos; os outros tipos continuam');
  await p.keyboard.press('Escape'); await esp(200); await p.click('.tb tbody tr:has-text("SOLO+RAIZ")'); await esp(250); await p.click('#gv [data-act="cc-editar"]'); await esp(250); await p.fill('#gv [data-fm="pontosPorHa"]', '5'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const t = S.cfgCol.tipos.find(x => x.nome === 'SOLO+RAIZ'); return t.pontosPorHa === 5 && t.profundidades.join('|') === '0-20|20-40'; }), 'editar o tipo guarda as profundidades antigas como estavam (a programação ainda sugere)');
  await p.keyboard.press('Escape'); await esp(200);
  await dd(p, 'cc:vista', 'Fazendas'); await p.click('[data-act="cc-novo"]'); await esp(250);
  await p.fill('#gv [data-fm="prefixo"]', 'lm'); await p.fill('#gv [data-fm="nome"]', 'Fazenda Limoeiro'); await dd(p, 'cc:unidade', 'Filial');
  await p.fill('#gv [data-fm="cnpj"]', '98765432000110'); await p.fill('#gv [data-fm="end"]', 'Sítio Bom Jesus, s/n'); await p.fill('#gv [data-fm="bairro"]', 'Zona rural'); await p.fill('#gv [data-fm="cidade"]', 'Limoeiro do Norte'); await p.fill('#gv [data-fm="uf"]', 'CE'); await p.fill('#gv [data-fm="cep"]', '62930-000');
  { const a = await alinha(p); conf(!a.length, 'ITEM 246: Nova fazenda (cadastro completo) alinhada' + (a.length ? ': ' + a.join('; ') : '')); }
  await foto(p, 'pc-fazenda-nova'); await p.click('#gv [data-act="cc-ok"]'); await esp(500);
  conf(await p.evaluate(() => { const f = S.cfgCol.fazendas.find(x => x.prefixo === 'LM'); return !!f && f.unidade === 'filial' && f.ativo === true && f.cnpj === '98.765.432/0001-10' && f.cidade === 'Limoeiro do Norte' && S.cfgCol.fazendas.length === 4; }), 'fazenda gravada com o cadastro completo; as outras continuam');
  conf(await p.evaluate(() => /Fazenda Limoeiro/.test(document.querySelector('#gv h2').textContent) && !/\bLM\b/.test(document.getElementById('gv').textContent)), 'ITEM 246: a gaveta não mostra o prefixo');
  await foto(p, 'pc-fazenda-gaveta');
  await p.click('#gv [data-act="cc-editar"]'); await esp(250);
  conf(await p.evaluate(() => !document.querySelector('#gv [data-fm="prefixo"]') && !/Letras do código/.test(document.getElementById('gv').textContent)), 'ITEM 246: editar a fazenda não mostra as letras do código');
  { const a = await alinha(p); conf(!a.length, 'Editar fazenda alinhado' + (a.length ? ': ' + a.join('; ') : '')); }
  await p.keyboard.press('Escape'); await esp(200); await p.keyboard.press('Escape'); await esp(200);
  await p.click('.tb tbody tr:has-text("Jaguaruana")'); await esp(250); await p.click('#gv .gv-lx'); await esp(250); await p.fill('#gv [data-fm="motivo"]', 'teste de desativar'); await p.click('#gv [data-act="cc-desat-ok"]'); await esp(500);
  conf(await p.evaluate(() => S.cfgCol.fazendas.find(x => x.prefixo === 'JG').ativo === false && S.cfgCol.fazendas.find(x => x.prefixo === 'JG').motivoInativo === 'teste de desativar'), 'desativar fazenda grava no mesmo formato do pedido desativar_cadastro');
  console.log('— Envio › Laboratórios: o lápis abre o cadastro do laboratório');
  await p.evaluate(() => { S.coEnvVista = 'lab'; location.hash = '#/coletas/envio'; }); await esp(700);
  await p.click('[data-tb="kt-labs"] tbody tr:has-text("Solo Análise")'); await esp(300);
  conf(await p.evaluate(() => /Solo Análise Laboratório Ltda/.test(document.getElementById('gv').textContent) && /12\.345\.678\/0001-90|Rua das Flores/.test(document.getElementById('gv').textContent)), 'o Envio lê o endereço do cadastro');
  await p.click('#gv [data-act="kt-end"]'); await esp(300);
  conf(await p.evaluate(() => S.fm && S.fm.k === 'ccEd' && S.fm.v === 'labs' && document.querySelector('#gv [data-fm="cnpj"]').value === '12.345.678/0001-90'), 'o lápis do Envio abre o mesmo cadastro do laboratório');
  await p.keyboard.press('Escape'); await esp(250);
  conf(await p.evaluate(() => !S.fm && /Papéis do envio/.test(document.getElementById('gv').textContent)), 'Esc volta uma camada: para a gaveta do Envio');
  await p.keyboard.press('Escape'); await esp(200); await p.evaluate(() => { S.coEnvVista = 'rem'; location.hash = '#/coletas/cadastros'; }); await esp(500);
  conf(await p.evaluate(async () => { const l = await new Promise(r => Data.col('sv2_audit').watch(x => r(x), { order: 'ts', limit: 80 })); return ['criar_cadastro', 'editar_cadastro', 'desativar_cadastro', 'ativar_cadastro', 'reajustar_precos'].every(a => l.some(x => x.acao === a)); }), 'tudo vai para a atividade');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  await p.close();

  console.log('— quem não é Líder ★ só vê');
  p = await abre(b, 1366, 820, { perfil: 'secundario', estrela: false });
  conf(await p.evaluate(() => !!document.querySelector('.tb') && !document.querySelector('[data-act="cc-novo"]')), 'Colaborador vê a tabela, sem "Novo"');
  await p.click('.tb tbody tr:has-text("RU11TAI24")'); await esp(250);
  conf(await p.evaluate(() => !!document.getElementById('gv') && !document.querySelector('#gv [data-act="cc-editar"]') && !document.querySelector('#gv .gv-lx')), 'gaveta sem lápis e sem lixeira');
  await p.close();

  console.log('— celular 390 px');
  p = await abre(b, 390, 844);
  const m = await p.evaluate(() => ({ rola: document.documentElement.scrollWidth > innerWidth + 1, dd: Math.round(document.querySelector('.cs-ph [data-dd="cc:vista"] .dd-b').getBoundingClientRect().height) }));
  conf(!m.rola && m.dd >= 40, 'não rola para o lado; a lista retrátil tem ' + m.dd + ' px');
  await foto(p, 'cel-talhoes');
  await p.click('[data-act="cc-novo"]'); await esp(300);
  conf(await p.evaluate(() => document.getElementById('gv').getBoundingClientRect().width >= innerWidth - 1 && document.documentElement.scrollWidth <= innerWidth + 1), 'formulário em tela cheia, sem rolar para o lado');
  await foto(p, 'cel-talhao-novo');
  { const a = await alinha(p); conf(!a.length, 'celular: Novo talhão alinhado (mesma linha, altura e largura)' + (a.length ? ': ' + a.join('; ') : '')); }
  for (const [v, txt, n] of [['labs', 'Laboratórios', 'cel-lab-novo'], ['fazendas', 'Fazendas', 'cel-fazenda-nova'], ['analises', 'Análises', 'cel-analise-nova'], ['tipos', 'Tipos de coleta', 'cel-tipo-novo']]) {
    await p.keyboard.press('Escape'); await esp(250); await dd(p, 'cc:vista', txt); await p.click('[data-act="cc-novo"]'); await esp(300);
    const a = await alinha(p); conf(!a.length, 'celular: ' + txt + ' (novo) alinhado' + (a.length ? ': ' + a.join('; ') : '')); await foto(p, n);
  }
  conf(p._er.length === 0, 'sem erro de JavaScript no celular' + (p._er.length ? ': ' + p._er[0] : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
