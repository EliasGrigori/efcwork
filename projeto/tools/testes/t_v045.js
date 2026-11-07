/* EFCwork · suíte da v0.4.5 — Programação: ajustes de visual (cartões, legenda, formulários, gaveta),
   com as regras do EFClaudian (SOLO+RAIZ gera Solo e Nematoide, profundidade, travas dos planos, etiqueta da fruta). Modo demonstração.
   Uso: node tools/testes/t_v045.js */
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
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(500);

  console.log('— Cabeçalho');
  conf(await p.evaluate(() => { const h = document.querySelector('.cs-ht'); return h && h.querySelector('h1') && h.querySelector('.pg-i'); }), 'ícone "!" ao lado do título Programação');
  conf(await p.evaluate(() => !/programadas a coletar/.test(document.querySelector('.cs-ph').textContent)), 'saiu "N programadas a coletar"');
  conf(await p.evaluate(() => { const h = document.querySelector('.cs-ph h1').getBoundingClientRect(), a = document.querySelector('.cs-acts').getBoundingClientRect(); return a.top < h.bottom && a.bottom > h.top; }), 'botões na linha do título (PC)');
  console.log('— Cartões dos planos');
  const rects = () => p.evaluate(() => Array.from(document.querySelectorAll('.pg-pl')).map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); }).join('|'));
  const antes = await rects();
  conf(antes.split('|').length >= 2, 'há cartões de plano (' + antes.split('|').length + ')');
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('.pg-pl')).every(c => c.getBoundingClientRect().height < 200)), 'cartão compacto (menos de 200 px de altura)');
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('.pg-pl header')).every(h => { const t = h.querySelector('h3'); return t.getBoundingClientRect().height < 24 && h.querySelector('.pg-dt') && h.querySelector('.pill'); })), 'cabeçalho do cartão numa linha: título, "01/01 a 31/12" e status');
  conf(await p.evaluate(() => !/Ano 20|Folha anual|Solo anual/.test(Array.from(document.querySelectorAll('.pg-pl')).map(c => c.textContent).join(' '))), 'sem "Ano 2026" nem o nome repetido no cartão');
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('.pg-pl')).every(c => getComputedStyle(c).boxShadow === 'none')), 'cartão só com borda (sem sombra)');
  conf(await p.evaluate(() => /1 de 1 área coletada\b/.test(document.body.innerText) && !/1 de 1 áreas/.test(document.body.innerText)), 'plural certo: "1 de 1 área coletada"');
  const cor = await p.evaluate(() => { const g = s => { const e = document.querySelector('.pg-ar.' + s); return e ? getComputedStyle(e).borderTopColor + '|' + getComputedStyle(e).borderTopWidth + '|' + getComputedStyle(e).boxShadow : ''; }; return { p: g('p'), x: g('x'), ok: getComputedStyle(document.documentElement).getPropertyValue('--ok').trim(), wa: getComputedStyle(document.documentElement).getPropertyValue('--wa').trim() }; });
  console.log('   programada:', cor.p, '| atrasada:', cor.x);
  conf(/1px/.test(cor.p || '1px') && /none$/.test(cor.p || 'none') && /none$/.test(cor.x || 'none'), 'contornos finos (1 px), sem anel de brilho');
  const lg = await p.evaluate(() => { const i = document.querySelector('.pg-i'); const l = document.querySelector('.pg-leg'); return { tem: !!i, vis: l ? getComputedStyle(l).display : '', frase: /Nova programação e planos de coleta: no EFClaudian/.test(document.body.innerText) }; });
  conf(lg.tem && lg.vis === 'none' && !lg.frase, 'legenda virou o ícone "!" (escondida) e a frase do EFClaudian saiu do subtítulo');
  await p.hover('.pg-i'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => getComputedStyle(document.querySelector('.pg-leg')).display !== 'none' && /coletada/.test(document.querySelector('.pg-leg').textContent) && /atrasada/.test(document.querySelector('.pg-leg').textContent)), 'ao passar o mouse no "!" aparece a legenda das cores');
  await p.screenshot({ path: path.join(SHOTS, 'v045-pc-legenda.png') });
  await p.mouse.move(700, 600);
  conf(await p.evaluate(() => !document.querySelector('.pg-av') && !document.querySelector('.pg-quem')), 'Quem sem bolinha de iniciais');

  console.log('— Gaveta aberta: cartões e barra não mudam');
  await p.click('[data-tb="pg"] tbody tr[data-id="p|p1"]'); await p.waitForTimeout(500);
  const depois = await rects();
  conf(depois === antes, 'cartões com a mesma forma e lugar com a gaveta aberta');
  conf(await p.evaluate(() => { const b = document.querySelector('[data-tb="pg"] .tb-bar, [data-tb="pg"] .tb-top') || document.querySelector('.tb-bar'); return !b || b.getBoundingClientRect().height < 60; }), 'barra da tabela em uma linha com a gaveta aberta');
  await p.screenshot({ path: path.join(SHOTS, 'v045-pc-gaveta.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);

  console.log('— Avulsa fica só na tabela de baixo');
  await p.evaluate(async () => { const C = Data.col.bind(Data); await C('sv2_prog').set('pav', { situacao: 'ativa', data: addDias(hojeISO(), 1), talhao: 'RU11TAI24', tipo: 'FOLHA', coletor: 'Equipe A', criadoEm: nowISO(), criadoPorNome: 'Joana Silva' }); });
  await p.waitForTimeout(400);
  conf(await p.evaluate(() => pgOrigem((S.prog || []).find(x => x.id === 'pav')) === 'Avulsa' && !Array.from(document.querySelectorAll('.pg-ar.p,.pg-ar.x')).some(e => /RU11/.test(e.textContent) && /FOLHA/i.test(e.title))), 'programação avulsa não marca área no cartão do plano');
  conf(await p.evaluate(() => !!document.querySelector('[data-tb="pg"] tbody tr[data-id="p|pav"]')), 'a avulsa aparece na tabela de baixo');

  console.log('— Formulário: listas menores, 2 por linha');
  await p.click('[data-act="pg-av"]'); await p.waitForTimeout(350);
  conf(await p.evaluate(() => { const b = document.querySelector('#gv [data-act="pg-ans-abre"]'); return b && /Solo completo/.test(b.textContent) && !document.querySelector('#gv .pg-ans'); }), 'Análises em lista suspensa fechada, com o resumo da escolha');
  await p.click('#gv [data-act="pg-ans-abre"]'); await p.waitForTimeout(150);
  await p.click('#gv [data-act="pg-an"][data-id="a6"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => /Solo completo \+ 1/.test(document.querySelector('#gv [data-act="pg-ans-abre"]').textContent)), 'marcar mais uma: o botão mostra "Solo completo + 1"');
  conf(await p.evaluate(() => { const g = Array.from(document.querySelectorAll('#gv .fm-g')); return g.length >= 3 && g.every(x => getComputedStyle(x).gridTemplateColumns.split(' ').length === 2); }), 'campos em 2 colunas no PC');
  conf(await p.evaluate(() => document.querySelector('#gv .fm-c .dd-b').getBoundingClientRect().height <= 34), 'janela retrátil do formulário com 34 px');
  await p.click('#gv [data-dd="lc:pgtal"] .dd-b'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => document.querySelector('#gv [data-dd="lc:pgtal"] .dd-l li').getBoundingClientRect().height <= 34), 'itens da lista com no máximo 34 px');
  await p.keyboard.press('Escape'); await p.evaluate(() => { if (S.fm) S.fm.sujo = false; }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.evaluate(() => { const b = document.querySelector('.cs-confirma button, [data-act="cs-conf-sim"]'); if (b) b.click(); }); await p.waitForTimeout(200);

  console.log('— Tabela como a do EFClaudian, etapas na gaveta');
  conf(await p.evaluate(() => Array.from(document.querySelectorAll('[data-tb="pg"] thead th')).map(t => t.textContent.trim()).join('|').indexOf('Data|Sem|Talhão|Tipo|Origem|Pontos|Coletor|Prof|Estádio|Prazo|Situação') === 0), 'colunas iguais às do EFClaudian: Data · Sem · Talhão · Tipo · Origem · Pontos · Coletor · Prof · Estádio · Prazo · Situação');
  conf(await p.evaluate(() => !document.querySelector('[data-tb="pg"] .pg-et') && !document.querySelector('[data-tb="pg"] .cb-tlw')), 'nenhuma bolinha de etapa na tabela');
  conf(await p.evaluate(() => { const ps = Array.from(document.querySelectorAll('[data-tb="pg"] tbody .pill')); return ps.length >= 1 && ps.every(x => /Atrasada/.test(x.textContent)); }), 'cor só para problema: só "Atrasada" é pílula colorida');
  await p.click('[data-tb="pg"] tbody tr[data-id="p|p1"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => { const t = document.querySelector('#gv .cb-tlw'); return t && /Programada/.test(t.textContent) && /Coletada/.test(t.textContent) && /Enviada/.test(t.textContent) && /Laudo/.test(t.textContent); }), 'ao clicar: gaveta com a linha do tempo Programada → Coletada → Enviada → Laudo');
  console.log('— Solo + Raiz em linhas separadas depois da coleta');
  await p.click('#gv [data-act="pg-cd"]'); await p.waitForTimeout(300);
  await dd(p, 'lc:pgprof', '0-20'); await p.fill('#gv [data-fm="data"]', await p.evaluate(() => addDias(hojeISO(), -1)));
  await p.click('#gv [data-act="pg-cd-ok"]'); await p.waitForTimeout(600);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  const ids = await p.evaluate(() => Array.from(document.querySelectorAll('[data-tb="pg"] tbody tr')).map(tr => tr.getAttribute('data-id') + '=' + tr.textContent));
  const so = ids.filter(x => x.indexOf('p|p1|') === 0);
  console.log('   ', so.join(' || '));
  conf(so.length === 2 && so.some(x => /p\|p1\|SOLO=.*SOLO/.test(x)) && so.some(x => /p\|p1\|NEMATOIDE=.*NEMATOIDE/.test(x)) && !ids.some(x => x.indexOf('p|p1=') === 0), 'SOLO+RAIZ coletada vira 2 linhas: SOLO e NEMATOIDE');
  await p.click('[data-tb="pg"] tbody tr[data-id="p|p1|NEMATOIDE"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => { const g = document.querySelector('#gv').textContent; return /NEMATOIDE · RU11TAI24/.test(g) && /Nematoide/.test(g) && !/Solo completo/.test(Array.from(document.querySelectorAll('#gv .co-am')).map(x => x.textContent).join(' ')); }), 'gaveta da linha Nematoide mostra só a amostra de nematoide');
  conf(await p.evaluate(() => { const l = document.querySelectorAll('#gv .cb-tl li'); return l.length === 4 && l[1].classList.contains('ok') && !l[2].classList.contains('ok'); }), 'linha do tempo: Coletada feita, Enviada pendente');
  await p.screenshot({ path: path.join(SHOTS, 'v045-pc-etapas-gaveta.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  console.log('— Tamanhos de letra e cantos (Programação, gaveta fechada)');
  await p.evaluate(() => { document.querySelector('#gv') && document.querySelector('#gv').remove(); });
  const med = await p.evaluate(() => { const fs = new Set(), rd = new Set(); document.querySelectorAll('.cs-ct *').forEach(e => { if (!e.offsetParent && e.tagName !== 'BODY') return; const c = getComputedStyle(e); if (Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) fs.add(c.fontSize); ['borderTopLeftRadius'].forEach(k => { if (parseFloat(c.borderTopWidth) > 0 || c.backgroundColor !== 'rgba(0, 0, 0, 0)') rd.add(c[k]); }); }); return { fs: Array.from(fs).sort((a, b) => parseFloat(a) - parseFloat(b)), rd: Array.from(rd) }; });
  console.log('   letras:', med.fs.join(' '), '| cantos:', med.rd.join(' '));
  conf(med.fs.length <= 7, 'no máximo 7 tamanhos de letra (' + med.fs.length + ')');
  conf(med.rd.filter(r => r !== '0px' && parseFloat(r) < 50).length <= 3, 'no máximo 3 raios de canto, fora círculos (' + med.rd.join(' ') + ')');

  await p.evaluate(() => { document.documentElement.setAttribute('data-tema', 'escuro'); }); await p.waitForTimeout(200);
  await p.click('[data-tb="pg"] tbody tr[data-id="p|p1|SOLO"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHOTS, 'v045-pc-escuro.png') });
  conf(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'tema Escuro: sem rolar para o lado');
  console.log('— Celular');
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const q = await c2.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(() => { location.hash = '#/coletas/programacao'; }); await q.waitForTimeout(500);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular: sem rolar para o lado');
  conf(await q.evaluate(() => { const t = document.querySelector('[data-tb="pg"]'); return t && t.getBoundingClientRect().top < innerHeight - 120; }), 'celular: a tabela já aparece na primeira tela (cartões compactos)');
  await q.screenshot({ path: path.join(SHOTS, 'v045-cel-programacao.png') });
  await q.evaluate(() => document.querySelector('[data-act="pg-av"]').click()); await q.waitForTimeout(400);
  conf(await q.evaluate(() => { const g = Array.from(document.querySelectorAll('#gv .fm-g')); return g.length >= 3 && g.every(x => getComputedStyle(x).gridTemplateColumns.split(' ').length === 2); }), 'celular: listas também 2 lado a lado');
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular: formulário sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v045-cel-avulsa.png') });

  console.log('— Primeiro acesso em 800 px de altura');
  const c3 = await b.newContext({ viewport: { width: 1280, height: 800 } }); const r = await c3.newPage();
  await r.goto(URL); await r.waitForTimeout(500);
  conf(await r.evaluate(() => { const bt = document.querySelector('[data-form="en-primeiro"] button[type=submit]'); return !!bt && bt.getBoundingClientRect().bottom <= innerHeight; }), 'botão do primeiro acesso inteiro na tela (1280×800)');
  await r.screenshot({ path: path.join(SHOTS, 'v045-pc-primeiro.png') });

  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular');
  await b.close();
  console.log('\nt_v045: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
