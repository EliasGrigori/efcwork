/* EFCwork · suíte da v0.4.8 — tabelas com menu em cada coluna (pedido de 08/11 14:12 e 14:30): sem botão Filtro, "Limpar filtro" no lugar dele,
   ordenar A→Z/Z→A/padrão, busca e lista de valores com caixinhas, mínimo e máximo, símbolos no cabeçalho, travar (fica mesmo ao reabrir),
   arrastar e mover colunas, faixa do total alinhada às colunas e seguindo o filtro, celular com menu de baixo. Uso: node tools/testes/t_v048.js */
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
const linhas = p => p.$$eval('.tb[data-tb="al-mat"] .tb-t tbody tr[data-id]', l => l.map(x => x.getAttribute('data-id')));
const abre = async (p, k) => { await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="' + k + '"] .tb-hm'); await p.waitForTimeout(150); };
const fecha = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(250); };
const cab = p => p.$$eval('.tb[data-tb="al-mat"] .tb-cab th', l => l.map(x => x.getAttribute('data-tbk')).join(','));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  await semear(p);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(300);

  console.log('— Barra e cabeçalho');
  conf(!(await p.$('.tb-flt')) && !(await p.$('[data-act="tb-limpa"]')), 'sem botão Filtro; "Limpar filtro" só aparece com filtro');
  const op0 = await p.$eval('.tb-cab th[data-tbk="loc"] .tb-hm', e => getComputedStyle(e).opacity);
  await p.hover('.tb-cab th[data-tbk="loc"]'); await p.waitForTimeout(250);
  const op1 = await p.$eval('.tb-cab th[data-tbk="loc"] .tb-hm', e => getComputedStyle(e).opacity);
  conf(op0 === '0' && op1 === '1', 'o botão do menu fica oculto e aparece ao passar o mouse');
  await p.screenshot({ path: path.join(SHOTS, 'v048-pc-hover.png') });

  console.log('— Ordenar');
  await abre(p, 'nome');
  conf(await p.isVisible('.tb-mn') && await p.isVisible('[data-act="tb-ociclo"]') && /Ordem padrão/.test(await p.textContent('.tb-mn')), 'menu abre com um botão único de ordenar (Ordem padrão)');
  conf(await p.evaluate(() => !Array.from(document.querySelectorAll('.tb-mn *')).some(e => getComputedStyle(e).textTransform === 'uppercase') && parseFloat(getComputedStyle(document.querySelector('.tb-mn-tr')).borderRadius) <= 10 && document.querySelector('.tb-mn-tr').offsetHeight >= 32), 'auditoria: sem maiúsculas de enfeite, Travar com cantos de 8 px e 34 px de altura');
  const ci = async () => { await p.click('[data-act="tb-ociclo"]'); await p.waitForTimeout(150); };
  await ci();
  conf((await linhas(p))[0] === 'agua' && /De A a Z/.test(await p.textContent('.tb-mn-ci')), '1º toque: De A a Z, "Água…" primeiro');
  await ci();
  conf((await linhas(p))[0] === 'velho' && /De Z a A/.test(await p.textContent('.tb-mn-ci')) && await p.isVisible('.tb-cab th[data-tbk="nome"] .tb-mo'), '2º toque: De Z a A, "Reagente antigo" primeiro e símbolo no cabeçalho');
  await ci();
  conf(!(await p.$('.tb-cab th[data-tbk="nome"] .tb-mo')) && /Ordem padrão/.test(await p.textContent('.tb-mn-ci')), '3º toque: volta à ordem padrão e tira o símbolo');
  await fecha(p);
  conf(!(await p.$('.tb-mn')), 'Esc fecha o menu (uma camada)');
  await abre(p, 'min'); conf(/menor para o maior/.test(await p.getAttribute('.tb-mn-ci', 'title')), 'coluna de número: o botão único diz "menor para o maior"'); await fecha(p);

  console.log('— Filtrar');
  await abre(p, 'loc');
  conf((await p.$$('.tb-mn-li:not(.tb-mn-all)')).length === 4 && /Geladeira\s*2/.test(await p.textContent('.tb-mn-l')), 'lista de valores com a contagem (Geladeira 2)');
  await p.fill('[data-tbmnbusca]', 'porta'); await p.waitForTimeout(450);
  conf((await linhas(p)).length === 4 && (await p.$$('.tb-mn-li:not(.tb-mn-all)')).length === 3 && await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-tbmnbusca')), 'busca por texto filtra a tabela e a lista; o cursor fica na busca');
  await p.fill('[data-tbmnbusca]', ''); await p.waitForTimeout(450);
  await p.click('.tb-mn-li:has-text("Geladeira") input'); await p.waitForTimeout(200);
  conf((await linhas(p)).length === 4 && !(await linhas(p)).includes('fenol') && await p.isVisible('.tb-mn'), 'desmarcar Geladeira tira as 2 linhas e o menu continua aberto');
  conf(await p.$eval('[data-tbmnall]', e => e.indeterminate), '"Marcar todos" fica pela metade');
  await p.click('[data-tbmnall]'); await p.waitForTimeout(200);
  conf((await linhas(p)).length === 6 && !(await p.$('.tb-cab th[data-tbk="loc"] .tb-mf')), 'marcar todos volta tudo e tira o símbolo');
  await p.click('[data-tbmnall]'); await p.waitForTimeout(200);
  conf((await linhas(p)).length === 0, 'desmarcar todos: nenhuma linha');
  await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(200);
  conf((await linhas(p)).length === 6, 'Limpar esta coluna');
  await fecha(p);
  await abre(p, 'min'); await p.fill('[data-tbmnmin]', '3'); await p.waitForTimeout(450);
  conf(JSON.stringify((await linhas(p)).sort()) === '["agua","gelo","luva"]', 'Mínimo de 3 em diante: 3 itens');
  await fecha(p);
  conf(await p.isVisible('.tb-cab th[data-tbk="min"] .tb-mf') && await p.$eval('.tb-cab th[data-tbk="min"]', e => e.classList.contains('tb-at')), 'símbolo de filtro e sublinhado no cabeçalho da coluna filtrada');
  conf(await p.isVisible('[data-act="tb-limpa"]') && /Limpar filtro/.test(await p.textContent('[data-act="tb-limpa"]')), '"Limpar filtro" aparece no lugar do antigo Filtro');
  const tbar = await p.$$eval('.tb[data-tb="al-mat"] .tb-bar > *', l => l.map(x => x.className.split(' ')[0]).join(','));
  conf(tbar.indexOf('tb-limpa,tb-cont') === 0 && !(await p.$('[data-tbbusca]')), 'barra: Limpar filtro · contagem (sem caixa de busca da tabela)');
  await p.click('[data-act="tb-limpa"]'); await p.waitForTimeout(200);
  conf((await linhas(p)).length === 6 && !(await p.$('[data-act="tb-limpa"]')), 'Limpar filtro limpa tudo e some');

  console.log('— Total');
  const tot = async () => p.evaluate(() => { const tb = document.querySelector('.tb[data-tb="al-mat"]'), t = tb.querySelector('.tb-bar .tb-tots'), tv = t.querySelector('.tb-tv'), lb = t.querySelector('.tb-tl'), th = tb.querySelector('.tb-cab th[data-tbk="' + tv.getAttribute('data-k') + '"]'), a = tv.getBoundingClientRect(), c = th.getBoundingClientRect(), l = lb.getBoundingClientRect(), ic = tb.querySelector('[data-act="tb-cols"]').getBoundingClientRect(); return { txt: t.innerText.replace(/\s+/g, ' '), col: th.getAttribute('data-tbk'), alinhado: Math.abs(a.left - c.left) < 2 && Math.abs(a.right - c.right) < 2, rotulo: l.right <= a.left && a.left - l.right < 12, linha: Math.abs(a.top - ic.top) < 2, faixa: !!document.querySelector('.tb-totr') }; });
  let t0 = await tot();
  conf(t0.col === 'val' && t0.alinhado && t0.linha && !t0.faixa, 'total na barra dos ícones, exatamente acima da coluna Valor, sem faixa: ' + t0.txt);
  conf(t0.rotulo && /Total/.test(t0.txt) && !(await p.$('.tb-tl small')) && !/itens/.test(t0.txt) && /6 itens/.test(await p.$eval('.tb-tl', e => e.title)) && /R\$ 303,80/.test(t0.txt), 'quadradinho "Total" logo à esquerda do valor, sem texto embaixo (a contagem fica na dica)');
  await abre(p, 'loc'); await p.click('.tb-mn-li:has-text("Porta 02") input'); await p.waitForTimeout(200); await fecha(p);
  t0 = await tot();
  conf(/4 itens/.test(await p.$eval('.tb-tl', e => e.title)) && /filtrado/.test(await p.$eval('.tb-tl', e => e.title)) && !/303,80/.test(t0.txt) && t0.alinhado, 'total segue o filtro da coluna e continua alinhado: ' + t0.txt);
  await abre(p, 'cod'); await p.click('[data-act="tb-mvdir"]'); await p.waitForTimeout(200); await fecha(p);
  t0 = await tot(); conf(t0.alinhado, 'mudando colunas de lugar, o total acompanha a coluna Valor');
  await abre(p, 'sit'); await p.click('[data-act="tb-mvesq"]'); await p.waitForTimeout(200); await fecha(p);
  /* v0.4.13: antes ia para a sequência; agora desce para uma linha própria, ainda em cima da coluna */
  const fl = await p.evaluate(() => { const tb = document.querySelector('.tb[data-tb="al-mat"]'), t = tb.querySelector('.tb-tots'), v = t.querySelector('.tb-tv').getBoundingClientRect(), th = tb.querySelector('.tb-cab th[data-tbk="val"]').getBoundingClientRect(), ic = tb.querySelector('[data-act="tb-cols"]').getBoundingClientRect();
    return t.classList.contains('tb-tots-fluxo') ? v.right <= ic.left : (t.classList.contains('tb-tots-linha') && Math.abs(v.right - th.right) < 2 && v.top >= ic.bottom); });
  conf(fl, 'Valor na última coluna (embaixo dos ícones): o total desce para uma linha própria em cima da coluna (ou, se nem assim couber, fica em sequência)');
  await p.evaluate(() => { localStorage.removeItem('cw-tbord-al-mat'); S.tb['al-mat'].colOrd = []; render(); }); await p.waitForTimeout(200);

  console.log('— Menu nasce da coluna');
  const pos = async k => { await abre(p, k); const r = await p.evaluate(k => { const m = document.querySelector('.tb-mn').getBoundingClientRect(), th = document.querySelector('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="' + k + '"]').getBoundingClientRect(), pt = document.querySelector('.tb-mn-pt').getBoundingClientRect(), cx = pt.left + pt.width / 2; return { colado: Math.abs(m.top - th.bottom - 8) < 2 || Math.abs(th.top - m.bottom - 8) < 2, aponta: cx >= th.left - 2 && cx <= th.right + 2, cabe: m.bottom <= innerHeight && m.top >= 0 }; }, k); await fecha(p); return r; };
  for (const k of ['cod', 'loc', 'sit']) { const r = await pos(k); conf(r.colado && r.aponta && r.cabe, 'menu da coluna ' + k + ': colado na coluna, pontinha apontando para ela e inteiro na tela'); }
  console.log('— Travar');
  await abre(p, 'loc'); await p.click('[data-act="tb-trava"]'); await p.waitForTimeout(150);
  conf(await p.isVisible('.tb-mn-av') && await p.$eval('[data-tbmnbusca]', e => e.disabled) && await p.$eval('[data-act="tb-ociclo"]', e => e.disabled), 'travada: aviso e controles bloqueados');
  await fecha(p);
  conf(await p.isVisible('.tb-cab th[data-tbk="loc"] .tb-mt') && !(await p.$('[data-act="tb-limpa"]')), 'cadeado no cabeçalho; filtro travado não conta para o Limpar filtro');
  await abre(p, 'nome'); await p.fill('[data-tbmnbusca]', 'luva'); await p.waitForTimeout(400); await fecha(p); await p.click('[data-act="tb-limpa"]'); await p.waitForTimeout(400);
  conf((await linhas(p)).length === 4, 'Limpar filtro limpa a coluna solta e mantém o filtro travado');
  await p.reload(); await p.waitForTimeout(900); await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(400);
  conf((await linhas(p)).length === 4 && await p.isVisible('.tb-cab th[data-tbk="loc"] .tb-mt'), 'travado continua depois de reabrir o app');
  await abre(p, 'loc'); await p.click('[data-act="tb-trava"]'); await p.waitForTimeout(150); await p.click('[data-act="tb-mnlimpa"]'); await p.waitForTimeout(150); await fecha(p);
  conf((await linhas(p)).length === 6 && await p.evaluate(() => localStorage.getItem('cw-tbtrava-al-mat') == null), 'destravar e limpar volta ao normal');
  await abre(p, 'val'); await p.click('[data-act="tb-ociclo"]'); await p.waitForTimeout(100); await p.click('[data-act="tb-ociclo"]'); await p.waitForTimeout(150); await p.click('[data-act="tb-trava"]'); await p.waitForTimeout(150); await fecha(p);
  await abre(p, 'nome'); await p.click('[data-act="tb-ociclo"]'); await p.waitForTimeout(250);
  conf((await linhas(p))[0] === 'gelo' && /travada na coluna Valor/.test(await p.textContent('body')), 'ordem travada em Valor: outra coluna avisa e não reordena');
  await fecha(p);
  await p.screenshot({ path: path.join(SHOTS, 'v048-pc-travada.png') });
  await abre(p, 'val'); await p.click('[data-act="tb-trava"]'); await p.click('[data-act="tb-ociclo"]'); await p.waitForTimeout(150); await fecha(p);

  console.log('— Colunas');
  const c0 = await cab(p);
  await abre(p, 'loc'); await p.click('[data-act="tb-mvdir"]'); await p.waitForTimeout(150);
  conf((await cab(p)) === 'cod,nome,un,loc,disp,min,val,sit' && await p.isVisible('.tb-mn'), 'mover para a direita pelo menu');
  await p.click('[data-act="tb-mvesq"]'); await p.waitForTimeout(150); await fecha(p);
  conf((await cab(p)) === c0, 'mover para a esquerda volta');
  const a = await p.$('.tb-cab th[data-tbk="sit"] .tb-thr'), alvo = await p.$('.tb-cab th[data-tbk="nome"]');
  const ra = await a.boundingBox(), rb = await alvo.boundingBox();
  await p.mouse.move(ra.x + 10, ra.y + ra.height / 2); await p.mouse.down(); await p.mouse.move(ra.x - 40, ra.y + 5, { steps: 4 });
  await p.mouse.move(rb.x + 8, rb.y + rb.height / 2, { steps: 8 }); await p.waitForTimeout(100);
  conf(await p.isVisible('.tb-fant') && await p.$eval('.tb-cab th[data-tbk="nome"]', e => e.classList.contains('tb-alvo-e')), 'arrastando: etiqueta da coluna e marca de onde vai cair');
  await p.screenshot({ path: path.join(SHOTS, 'v048-pc-arrastando.png') });
  await p.mouse.up(); await p.waitForTimeout(250);
  conf((await cab(p)) === 'cod,sit,nome,loc,un,disp,min,val' && !(await p.$('.tb-mn')), 'soltar: Situação foi para antes de Item (sem abrir o menu)');
  conf(await p.evaluate(() => localStorage.getItem('cw-tbord-al-mat')) != null, 'a ordem das colunas fica lembrada no aparelho');
  const xl = await p.evaluate(() => tbLinhasTexto(TB['al-mat']).cab.join('|'));
  conf(/^Código\|Situação\|Item/.test(xl), 'planilha e impressão seguem a nova ordem');
  await p.click('[data-act="tb-cols"]'); await p.click('[data-act="tb-ordpad"]'); await p.waitForTimeout(150);
  conf((await cab(p)) === c0, '"Voltar à ordem original das colunas"');
  await p.click('[data-act="tb-cols"]');

  console.log('— Outras tabelas');
  await p.evaluate(() => { location.hash = '#/almox/movimentacoes'; }); await p.waitForTimeout(300);
  await p.click('.tb[data-tb="al-mov"] .tb-cab th[data-tbk="data"] .tb-hm'); await p.waitForTimeout(150);
  conf(/mais recente primeiro/.test(await p.getAttribute('.tb-mn-ci', 'title')) && await p.isVisible('.tb-mn [data-dd="tbf:al-mov:per"]'), 'coluna de data: botão único com "mais recente primeiro"; o filtro pronto Período mora nela');
  await fecha(p);

  console.log('— Celular');
  const cx2 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const m = await cx2.newPage();
  await m.goto(URL); await m.waitForTimeout(400); await m.fill('#en-nome', 'Joana Silva'); await m.fill('#en-login', 'joana.silva'); await m.fill('#en-senha', 'senha1234'); await m.fill('#en-senha2', 'senha1234'); await m.click('[data-form="en-primeiro"] button[type=submit]'); await m.waitForTimeout(600); await semear(m);
  await m.goto(URL); await m.waitForTimeout(600); await m.evaluate(() => { location.hash = '#/almox/materiais'; }); await m.waitForTimeout(400);
  conf(Number(await m.$eval('.tb-cab th[data-tbk="nome"] .tb-hm', e => getComputedStyle(e).opacity)) > 0, 'botão do menu visível no celular (toque)');
  await m.click('.tb-cab th[data-tbk="nome"] .tb-thr'); await m.waitForTimeout(500); /* v0.6.14: a folha sobe em 400 ms */
  const fol = await m.evaluate(() => { const e = document.querySelector('.tb-mn'); const r = e.getBoundingClientRect(); return e.classList.contains('tb-mn-folha') && Math.abs(r.bottom - innerHeight) < 2 && r.width >= innerWidth - 2; });
  conf(fol, 'no celular o menu abre de baixo, na largura da tela');
  await m.screenshot({ path: path.join(SHOTS, 'v048-cel-menu.png') });
  await m.goBack(); await m.waitForTimeout(300);
  conf(!(await m.$('.tb-mn')) && /materiais/.test(m.url()), 'voltar do celular fecha só o menu');
  await m.evaluate(() => document.documentElement.setAttribute('data-tema', 'escuro'));
  await m.click('.tb-cab th[data-tbk="val"] .tb-thr'); await m.waitForTimeout(300); await m.screenshot({ path: path.join(SHOTS, 'v048-cel-escuro.png') });

  conf(!erros.length, 'sem erros no console' + (erros.length ? ': ' + erros.join(' | ') : ''));
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
