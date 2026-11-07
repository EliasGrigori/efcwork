/* EFCwork · suíte da v0.4.4 — Coletas › Programação: tabela, detalhe, "Coletado" (uma ou várias programações) e coleta avulsa,
   com as regras do EFClaudian (SOLO+RAIZ gera Solo e Nematoide, profundidade, travas dos planos, etiqueta da fruta). Modo demonstração.
   Uso: node tools/testes/t_v044.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(100); };
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const gv = p => p.evaluate(() => { const g = document.querySelector('#gv'); return g ? g.textContent : ''; });
async function primeiro(p) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => {
    const h = hojeISO(), d = n => addDias(h, n), C = Data.col.bind(Data), me = S.user, ano = h.slice(0, 4);
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], labModelo: { IBRA: 'completa' }, fazendas: [{ prefixo: 'RU', numero: '18', nome: 'Fazenda Teste' }],
      tipos: [{ nome: 'SOLO+RAIZ', gera: ['SOLO', 'NEMATOIDE'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }, { nome: 'FOLHA', gera: ['FOLHA'], pontosPorHa: 5 }, { nome: 'SOLO', gera: ['SOLO'], pontosPorHa: 4, profundidades: ['0-20', '20-40'] }] });
    await C('sv2_talhoes').set('t1', { codigo: 'RU11TAI24', pivo: 'Pivô 2', hectares: 4.5, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    await C('sv2_talhoes').set('t2', { codigo: 'RU12TAI24', pivo: 'Pivô 2', hectares: 4.5, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    await C('sv2_talhoes').set('t3', { codigo: 'RU13TAI24', pivo: 'Pivô 2', hectares: 4.0, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
    const A = (id, o) => C('sv2_analises').set(id, Object.assign({ ativo: true, criadoEm: '2026-01-0' + id.slice(1) + 'T10:00:00.000Z' }, o));
    await A('a1', { nome: 'Solo completo', tipo: 'SOLO', lab: 'IBRA', sigla: 'SC', valor: 120 });
    await A('a2', { nome: 'Nematoide', tipo: 'NEMATOIDE', lab: 'BIOAGRI', sigla: 'NEM', valor: 80 });
    await A('a3', { nome: 'Foliar', tipo: 'FOLHA', lab: 'IBRA', sigla: 'FOL', valor: 90 });
    await A('a4', { nome: 'Resíduos', tipo: 'FRUTA', lab: 'IBRA', sigla: 'RES', valor: 300 });
    await A('a5', { nome: 'Composto', tipo: 'COMPOSTO', lab: 'IBRA', sigla: 'CMP', valor: 150 });
    await A('a6', { nome: 'Micronutrientes', tipo: 'SOLO', lab: 'IBRA', sigla: 'MIC', valor: 60 });
    const P = (id, o) => C('sv2_prog').set(id, Object.assign({ situacao: 'ativa', criadoEm: nowISO(), criadoPor: me.id, criadoPorNome: 'Joana Silva' }, o));
    await P('p1', { data: d(-2), semana: 1, talhao: 'RU11TAI24', tipo: 'SOLO+RAIZ', pontos: 18, coletor: 'Equipe A', prazo: d(5), analiseIds: ['a1', 'a2'] });
    await P('p2', { data: d(-1), talhao: 'RU13TAI24', tipo: 'FOLHA', pontos: 20, coletor: 'Equipe A' });
    await P('p3', { data: d(-30), talhao: 'RU12TAI24', tipo: 'FOLHA', pontos: 22, coletor: 'Equipe B', coletadaEm: d(-29) });
    await P('p4', { data: d(-10), talhao: 'RU12TAI24', tipo: 'FOLHA', situacao: 'cancelada', canceladaMotivo: 'replantio' });
    await P('p5', { talhao: 'RU11TAI24', tipo: 'FOLHA', coletor: 'Equipe A' }); /* sem dia definido: não entra na tabela */
    await C('sv2_coletas').set('c0', { tipo: 'SOLO', data: ano + '-01-15', talhao: 'RU12TAI24', analiseNome: 'Solo completo', sigla: 'SC', lab: 'IBRA', situacao: 'ativa', coletor: 'Equipe B', criadoEm: nowISO() });
    await C('sv2_rodizio').set('r1', { nome: 'Solo anual', tipo: 'SOLO', freq: 'A', ano: Number(ano), areas: ['RU12TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z' });
    await C('sv2_rodizio').set('r2', { nome: 'Folha anual', tipo: 'FOLHA', freq: 'A', ano: Number(ano), areas: ['RU13TAI24'], ativo: true, criadoEm: ano + '-01-01T10:00:00.000Z', fechados: { [ano + '-A']: { por: 'x' } } });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'visitante', superiores: [me.id], atrib: { coletas: true } });
  });
  await p.waitForTimeout(300);
}
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Aba Programação');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => !!document.querySelector('[data-tb="pg"]') && /2 programadas a coletar/.test(document.querySelector('.cs-meta').textContent)), 'tabela da Programação aparece, com "2 programadas a coletar" no cabeçalho (sem dia não conta)');
  const linhas = await p.evaluate(() => Array.from(document.querySelectorAll('[data-tb="pg"] tbody tr')).map(tr => tr.textContent));
  const datas = await p.evaluate(() => Array.from(document.querySelectorAll('[data-tb="pg"] tbody tr')).map(tr => tr.getAttribute('data-id')));
  conf(await p.evaluate(ids => { const ds = ids.map(id => { const r = pgLinhas().find(x => x.id === id); return r.data; }); return ds.every((d, i) => !i || ds[i - 1] >= d); }, datas), 'ordem pela data definida, mais nova em cima (situação não muda a ordem)');
  conf(datas.indexOf('p|p5') < 0, 'programação sem dia definido não aparece na tabela');
  conf(await p.evaluate(() => { const r = pgQuando, h = hojeISO(); return r({ data: addDias(h, -3) }).k === 'atrasada' && r({ data: addDias(h, -3), prazo: addDias(h, 2) }).k !== 'atrasada' && r({ data: pgFimSemana() }).k === 'semana' && r({ data: addDias(pgFimSemana(), 1) }).k === 'proximos' && r({ data: addDias(h, 30) }).k === 'depois'; }), 'marcador: Atrasada / Esta semana / Próximos dias / Programada');
  conf(await p.evaluate(() => !document.querySelector('.pg-kp') && Array.from(document.querySelectorAll('[data-tb="pg"] thead th')).map(t => t.textContent.trim()).join('|').indexOf('Área|Tipo|Quem|Quando|Etapas') === 0), 'tabela do modelo 5: Área · Tipo · Quem · Quando · Etapas, sem caixas de números');
  conf(await p.evaluate(() => { const tr = document.querySelector('[data-tb="pg"] tr[data-id="p|p3"]'); return tr && tr.querySelectorAll('.pg-et span.on').length === 2; }), 'etapas: coletada mostra Programada → Coletada preenchidas');
  conf(await p.evaluate(() => { const c = Array.from(document.querySelectorAll('.pg-pl')); const solo = c.find(x => /SOLO · anual/.test(x.textContent)), fol = c.find(x => /FOLHA · anual/.test(x.textContent)); return c.length === 2 && solo && solo.querySelector('.pg-ar.c') && solo.querySelector('.pg-ar.c').textContent === 'RU12' && /100%/.test(solo.textContent) && fol && fol.querySelector('.pg-ar.x') && /Encerrado/.test(fol.textContent); }), 'cartões dos planos: RU12 coletada (100%), RU13 programada e atrasada (contorno), plano encerrado');
  conf(await p.evaluate(() => { const r = pgRotulos(['RU3523520', 'RU3530920', 'JD0130923']); return r.RU3523520 === 'RU3523' && r.RU3530920 === 'RU3530' && r.JD0130923 === 'JD01'; }), 'rótulo curto da área: JD01; quando dois iguais (RU35), mostra mais dígitos');
  conf(linhas.some(x => /RU12TAI24/.test(x) && /Coletada/.test(x)) && linhas.some(x => /Cancelada/.test(x)) && linhas.length >= 5, 'coletadas, canceladas e coletas sem programação também aparecem');
  conf(await p.evaluate(() => !!document.querySelector('[data-act="pg-cd"]') && !!document.querySelector('[data-act="pg-av"]')), 'botões Coletado e Coleta avulsa no cabeçalho');
  await p.screenshot({ path: path.join(SHOTS, 'v044-pc-programacao.png') });

  console.log('— Detalhe e Coletado');
  await p.click('[data-tb="pg"] tbody tr[data-id="p|p1"]'); await p.waitForTimeout(300);
  conf(/SOLO\+RAIZ · RU11TAI24/.test(await gv(p)) && /Solo completo · Nematoide/.test(await gv(p)), 'detalhe mostra tipo, talhão e as análises');
  await p.click('#gv [data-act="pg-cd"]'); await p.waitForTimeout(300);
  conf(/Vai gravar 2 amostra\(s\): Solo 1 · Nematoide 1/.test(await gv(p)), 'Coletado já vem com a área marcada: vai gravar Solo e Nematoide');
  await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(250);
  conf(/profundidade/i.test(await msg(p)), 'sem profundidade: pede a profundidade');
  await dd(p, 'lc:pgprof', '0-20');
  await p.fill('#gv [data-fm="data"]', '2099-01-01'); await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(250);
  conf(/futuro/.test(await msg(p)), 'data no futuro: não deixa');
  await p.fill('#gv [data-fm="data"]', await p.evaluate(() => addDias(hojeISO(), -1)));
  await p.screenshot({ path: path.join(SHOTS, 'v044-pc-coletado.png') });
  await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(500);
  const r1 = await p.evaluate(() => { const cs = S.coletas.filter(c => c.progId === 'p1'); const pr = S.prog.find(x => x.id === 'p1'); return { n: cs.length, tipos: cs.map(c => c.tipo).sort().join(), lote: cs.length === 2 && cs[0].loteId && cs[0].loteId === cs[1].loteId, prof: cs.map(c => c.prof).sort().join(), col: cs[0] && cs[0].coletor, pts: cs.map(c => c.pontos).join(), lab: cs.map(c => c.lab).sort().join(), sem: cs[0] && cs[0].semana, coletada: pr.coletadaEm, por: pr.coletadaPor, crp: cs[0] && cs[0].criadoPor === S.user.id }; });
  conf(r1.n === 2 && r1.tipos === 'NEMATOIDE,SOLO' && r1.lote, '2 amostras gravadas (Solo e Nematoide), no mesmo lote');
  conf(r1.prof === '0-20,0-20' && r1.col === 'Equipe A' && r1.pts === '18,18' && r1.lab === 'BIOAGRI,IBRA' && r1.sem > 0, 'profundidade, coletor, pontos, laboratório de cada análise e semana preenchidos');
  conf(!!r1.coletada && r1.por === 'Joana Silva' && r1.crp, 'programação fica como coletada (data e quem lançou); criadoPor = quem lança (regra do Firebase)');
  conf(await p.evaluate(async () => (await Data.col('sv2_audit').all()).some(a => a.acao === 'coletado_programacao' && a.entidadeId === 'p1')), 'histórico (auditoria) registrado');
  const mt = await p.evaluate(() => document.querySelector('.cs-meta').textContent); conf(/1 programada a coletar/.test(mt), 'cabeçalho passa para "1 programada a coletar" (' + mt + ')');

  console.log('— Travas dos planos');
  await p.click('[data-act="pg-cd"]'); await p.waitForTimeout(300);
  await p.click('#gv [data-act="pg-ck"][data-id="p2"]'); await p.waitForTimeout(150);
  await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(250);
  conf(/foi encerrado/.test(await msg(p)), 'plano encerrado: não aceita coleta da área (igual ao EFClaudian)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(250); if (await p.$('#cf')) await p.click('#cf [data-act="cf-sim"]'); await p.waitForTimeout(250);

  console.log('— Coleta avulsa');
  await p.click('[data-act="pg-av"]'); await p.waitForTimeout(300);
  conf(/Coleta avulsa · Solo/.test(await gv(p)) && await p.evaluate(() => S.fm.ans.a1 && !S.fm.ans.a6), 'abre em Solo com a primeira análise marcada');
  await dd(p, 'lc:pgtal', 'RU12TAI24'); await dd(p, 'lc:pgprof', '0-20');
  await p.click('#gv [data-act="pg-av-ok"]'); await p.waitForTimeout(250);
  conf(/já tem solo no Ano/.test(await msg(p)), 'área do plano que já tem solo no período: barra e explica (recoleta no EFClaudian)');
  await dd(p, 'lc:pgtal', 'RU11TAI24'); await p.click('#gv [data-act="pg-an"][data-id="a6"]'); await p.waitForTimeout(100);
  await p.click('#gv [data-act="pg-av-ok"]'); await p.waitForTimeout(400);
  const r2 = await p.evaluate(() => { const cs = S.coletas.filter(c => !c.progId && c.talhao === 'RU11TAI24' && c.tipo === 'SOLO'); return { n: cs.length, lote: cs.length === 2 && cs[0].loteId === cs[1].loteId && !!cs[0].loteId, sig: cs.map(c => c.sigla).sort().join(), prof: cs.map(c => c.prof).join() }; });
  conf(r2.n === 2 && r2.lote && r2.sig === 'MIC,SC' && r2.prof === '0-20,0-20', 'duas análises marcadas = 2 amostras no mesmo lote');

  await p.click('[data-act="pg-av"]'); await p.waitForTimeout(300); await dd(p, 'lc:pgmat', 'Fruta'); await dd(p, 'lc:pgtal', 'RU11TAI24'); await p.waitForTimeout(150);
  const id0 = await p.evaluate(() => [document.querySelector('#gv [data-fm="ident"]').value, document.querySelector('#gv [data-fm="rast"]').value]);
  const esp = await p.evaluate(() => hojeISO().replace(/-/g, '') + '18' + '11');
  conf(id0[0] === 'MAMÃO RU11' && id0[1] === esp, 'fruta: identificação e rastreabilidade preenchidas pelo talhão (' + id0.join(' / ') + ')');
  conf(await p.evaluate(() => !document.querySelector('#gv [data-dd="lc:pgprof"]') && !document.querySelector('#gv [data-dd="lc:pgest"]')), 'fruta não pede profundidade nem estádio');
  await p.click('#gv [data-act="pg-av-ok"]'); await p.waitForTimeout(400);
  const r3 = await p.evaluate(() => S.coletas.find(c => c.tipo === 'FRUTA'));
  conf(r3 && r3.identificacao === 'MAMÃO RU11 RES' && r3.rastreabilidade === esp && r3.maturacao === 'FRUTA VERDE' && r3.prof === 'N/A', 'fruta gravada com a sigla no fim (etiqueta completa do IBRA)');

  await p.click('[data-act="pg-av"]'); await p.waitForTimeout(300); await dd(p, 'lc:pgmat', 'Composto');
  conf(await p.evaluate(() => !document.querySelector('#gv [data-dd="lc:pgtal"]') && S.fm.ans.a5), 'composto: sem talhão, análise marcada');
  await p.click('#gv [data-act="pg-av-ok"]'); await p.waitForTimeout(250);
  conf(/pilha/.test(await msg(p)), 'composto sem pilha / lote: avisa');
  await p.fill('#gv [data-fm="lote"]', 'com-071-25'); await p.click('#gv [data-act="pg-av-ok"]'); await p.waitForTimeout(400);
  const r4 = await p.evaluate(() => S.coletas.find(c => c.tipo === 'COMPOSTO'));
  conf(r4 && r4.loteComp === 'COM-071-25' && r4.identif === 'COMPOSTO' && r4.fertilizante === 'COMPOSTO ORGANICO' && !r4.talhao, 'composto gravado (lote em maiúsculas, identificação e fertilizante padrão)');
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.querySelectorAll('[data-tb="co-am"] tbody tr').length >= 7), 'as amostras novas aparecem em Amostras');

  console.log('— Quem não lança');
  await p.evaluate(() => csSair()); await p.waitForTimeout(300); await p.fill('#en-login', 'ana.lima'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => !!document.querySelector('[data-tb="pg"]') && !document.querySelector('[data-act="pg-cd"]') && !document.querySelector('[data-act="pg-av"]')), 'visitante vê a tabela, sem Coletado nem Coleta avulsa');

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(() => { location.hash = '#/coletas/programacao'; }); await q.waitForTimeout(400);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular: tabela sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v044-cel-programacao.png') });
  await q.evaluate(() => document.querySelector('[data-act="pg-cd"]').click()); await q.waitForTimeout(400);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth && !!document.querySelector('#gv [data-act="pg-cd-ok"]')), 'celular: Coletado abre em tela cheia, sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v044-cel-coletado.png') });
  await q.keyboard.press('Escape'); await q.waitForTimeout(250);
  await q.evaluate(() => document.querySelector('[data-act="pg-av"]').click()); await q.waitForTimeout(400);
  await q.screenshot({ path: path.join(SHOTS, 'v044-cel-avulsa.png') });

  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v044: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
