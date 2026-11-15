/* EFCwork · suíte da v0.6.15 (respostas do Elias de 14/11 13:54, partes 1 e 3):
   tela parada do cabeçalho para cima e só a tabela rolando (sem "Mostrando X de Y" nem rodapé), tabela até o fundo,
   total no selo do cabeçalho ("total filtrado" quando filtra), ícones da tabela na linha das abas, cabeçalhos com a mesma medida,
   mais linhas carregam sozinhas, gota na linha do tempo da gaveta do material, setas e X acima do título da gaveta,
   pílulas com bolinha + texto (cor forte só no vermelho), busca com o mesmo texto do topo.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0615d.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
/* a mesma semente do almoxarifado da suíte v0.4.8 */
const t48 = fs.readFileSync(path.join(__dirname, 't_v048.js'), 'utf8'), ia = t48.indexOf('await p.evaluate(async () => {') + 'await p.evaluate('.length, SEM_AL = t48.slice(ia, t48.indexOf('});\n  await p.waitForTimeout(300);', ia) + 1);
async function entra(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await p.waitForTimeout(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(eval(SEM_AL)); await p.waitForTimeout(300);
  await p.evaluate(async () => { const C = Data.col.bind(Data), h = hojeISO(); await C('sv2_cfg').set('coletas', { labs: ['IBRA'] });
    for (let i = 0; i < 160; i++) await C('sv2_coletas').set('c' + i, { tipo: i % 2 ? 'SOLO' : 'FOLHA', data: addDias(h, -i), talhao: 'RU' + (10 + i % 9) + 'TAI24', analiseNome: 'Análise ' + i, lab: 'IBRA', valor: 100, situacao: 'ativa', coletor: 'Equipe A', criadoEm: nowISO() }); });
  await p.waitForTimeout(400); return p;
}
const vai = async (p, h, t) => { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(t || 600); };
(async () => {
  const b = await chromium.launch();
  const p = await entra(b, 1280, 800);

  console.log('Tela parada, só a tabela rola (ITEM 5 e 22)');
  await vai(p, '#/almox/materiais');
  let m = await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w').getBoundingClientRect(); return { fixa: document.documentElement.classList.contains('pag-fixa'), fundo: w.bottom, pag: document.documentElement.scrollHeight - innerHeight, rod: getComputedStyle(document.querySelector('.cs-rod') || document.body).display, most: /Mostrando \d+ de/.test(document.body.innerText) }; });
  conf(m.fixa && m.pag <= 0, 'Materiais: a página não rola (' + m.pag + ' px)');
  conf(m.fundo >= 800 - 24 && m.fundo <= 800, 'a tabela desce até o fundo da janela (' + Math.round(m.fundo) + ' de 800)');
  conf(!m.most && m.rod === 'none', 'sem "Mostrando X de Y" e sem o rodapé "Cwork Quality · Fazenda"');
  await p.mouse.move(700, 120); await p.mouse.wheel(0, 600); await p.waitForTimeout(250);
  conf(await p.evaluate(() => scrollY === 0), 'a rodinha em cima do cabeçalho não mexe a tela');

  console.log('Total no selo do cabeçalho (ITEM 10 e 23)');
  let s = await p.evaluate(() => { const m = document.querySelector('.cs-meta .tb-tp'); return { txt: m ? m.textContent : '', fl: !!(m && m.classList.contains('fl')), velho: !!document.querySelector('.tb-tots') }; });
  conf(/R\$ 303,80 em estoque/.test(s.txt) && !s.fl && !s.velho, 'sem filtro: o selo "R$ 303,80 em estoque" é o total (' + s.txt + ')');
  await p.click('.tb-cab th[data-tbk="loc"] .tb-hm'); await p.waitForTimeout(250); await p.click('.tb-mn-li:has-text("Porta 02") input'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  s = await p.evaluate(() => { const m = document.querySelector('.cs-meta .tb-tp'); return { txt: m ? m.textContent : '', fl: !!(m && m.classList.contains('fl')) }; });
  conf(s.fl && /total filtrado/.test(s.txt) && !/303,80/.test(s.txt), 'filtrando, o selo vira "total filtrado" e segue o filtro (' + s.txt + ')');
  await p.evaluate(() => Object.keys(TB).forEach(id => tbMuda(id, s => { s.busca = ''; s.cf = {}; s.filtros = {}; }))); await p.waitForTimeout(250);

  console.log('Ícones na linha das abas e cabeçalhos com a mesma medida (ITEM 23)');
  const med = {};
  for (const r of ['#/almox/materiais', '#/almox/movimentacoes', '#/coletas/amostras', '#/almox/equipamentos']) { await vai(p, r);
    med[r] = await p.evaluate(() => { const ab = document.querySelector('.cs-abas').getBoundingClientRect(), ic = document.querySelector('.cs-abas-l .tb-bar-sobe .ic-so'), i = ic && ic.getBoundingClientRect(); return { abas: Math.round(ab.top), linha: !!i && i.top >= ab.top - 2 && i.bottom <= ab.bottom + 2, fixa: document.documentElement.classList.contains('pag-fixa') }; }); }
  const ys = Object.values(med).map(x => x.abas);
  conf(Object.values(med).every(x => x.linha), 'imprimir, planilha e colunas ficam na linha das abas em todas as tabelas');
  conf(Math.max.apply(null, ys) - Math.min.apply(null, ys) <= 1, 'as abas começam na mesma altura em todas as telas (' + ys.join(', ') + ')');
  conf(Object.values(med).every(x => x.fixa), 'todas essas telas ficam paradas (só a tabela rola)');

  console.log('Mais linhas carregam sozinhas');
  await vai(p, '#/coletas/amostras', 800);
  const l0 = await p.evaluate(() => document.querySelectorAll('.tb-t tbody tr[data-act]').length);
  await p.evaluate(() => { const w = document.querySelector('.cs-ct .tb-w'); w.scrollTop = w.scrollHeight; }); await p.waitForTimeout(800);
  const l1 = await p.evaluate(() => ({ n: document.querySelectorAll('.tb-t tbody tr[data-act]').length, top: document.querySelector('.cs-ct .tb-w').scrollTop }));
  conf(l0 === 100 && l1.n > 100 && l1.top > 0, 'chegando ao fim aparecem mais linhas sem botão e a tabela não volta ao topo (' + l0 + ' → ' + l1.n + ')');

  console.log('Gaveta do material (ITEM 5 e 9)');
  await vai(p, '#/almox/materiais');
  await p.click('.tb-t tbody tr:has-text("Luva")'); await p.waitForTimeout(900);
  const g = await p.evaluate(() => { const gv = document.querySelector('.gv'), h2 = gv.querySelector('h2').getBoundingClientRect(), x = gv.querySelector('[data-act="gv-fecha"]'), xr = x && x.getBoundingClientRect(), it = [...gv.querySelectorAll('.cb-tl li b')].map(e => e.textContent);
    return { tl: !!gv.querySelector('.cb-tlw .cb-fluido'), itens: it, h2: h2.height, acima: !!xr && xr.bottom <= h2.top + 1 }; });
  conf(g.tl && g.itens.length === 2, '"Últimas movimentações" virou a linha do tempo com a gota (' + g.itens.length + ' itens)');
  conf(/Conferência inicial/.test(g.itens[0]) && /Saída/.test(g.itens[1]), 'em ordem do tempo: a mais nova embaixo, onde a gota chega');
  conf(g.acima && g.h2 < 34, 'setas e X acima do título; o título não quebra (' + Math.round(g.h2) + ' px)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);

  console.log('Pílulas: bolinha + texto, cor forte só no vermelho (ITEM 7 e 9)');
  const pl = await p.evaluate(() => { const ws = [...document.querySelectorAll('.cs-ct .tb-t .pill')], ok = ws.filter(x => !x.classList.contains('cr')), cr = ws.filter(x => x.classList.contains('cr'));
    return { n: ok.length, bola: ok.every(x => getComputedStyle(x, '::before').content !== 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(x).backgroundColor)), forte: cr.length > 0 && cr.every(x => !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(x).backgroundColor)) }; });
  conf(pl.n > 0 && pl.bola, 'situações comuns: bolinha e texto, sem caixa colorida (' + pl.n + ')');
  conf(pl.forte, 'vermelho continua com o fundo forte');

  console.log('Busca');
  await p.click('.cs-busca'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => /Buscar documento, material, coleta/.test(document.querySelector('#bg-q').placeholder)), 'a busca tem o mesmo começo do texto do topo');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(!p._er.length, 'nenhum erro no PC ' + p._er.join(' | '));

  console.log('Celular (390)');
  const c = await entra(b, 390, 800);
  await vai(c, '#/almox/materiais');
  const cm = await c.evaluate(() => ({ fixa: document.documentElement.classList.contains('pag-fixa'), lado: document.documentElement.scrollWidth > innerWidth + 1, selo: !!document.querySelector('.cs-meta .tb-tp'), most: /Mostrando \d+ de/.test(document.body.innerText) }));
  conf(!cm.fixa && !cm.lado, 'no celular a página rola normalmente e nada vai para o lado');
  conf(cm.selo && !cm.most, 'no celular também: total no selo e sem "Mostrando"');
  conf(!c._er.length, 'nenhum erro no celular ' + c._er.join(' | '));

  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})();
