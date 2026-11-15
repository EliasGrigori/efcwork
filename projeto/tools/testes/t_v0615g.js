/* EFCwork · v0.6.15.3 · ITENS 6 e 7 da varredura v0.6.8:
   - Coletas carregam as 3.000 e Água as 1.000 mais recentes pela data; sem texto de aviso, só o botão "Carregar todas";
   - nº de amostra nova não sobrescreve uma amostra antiga que ficou fora das 3.000;
   - fotos da ação corretiva somem da tela e do PDF para todos no dia do vencimento, mesmo antes de um Líder ★/Administrador eliminá-las.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0615g.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const FOTO = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#8fa5b4"/></svg>').toString('base64');
async function abre(b, w, antes) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: 860 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g|firebase/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  if (antes) await p.evaluate(antes);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 900);
  await p.evaluate(() => { window.print = () => {}; });
  return p;
}
/* grava direto no armazenamento da demonstração (milhares de registros de uma vez) e recarrega */
const enche = (col, n, fab) => `(() => { const a = []; const d0 = new Date('2026-11-01T12:00:00'); for (let i = 0; i < ${n}; i++) { const d = new Date(d0 - i * 864e5 / 4); const iso = d.toISOString().slice(0, 10); a.push((${fab})(i, iso)); } localStorage.setItem('sv2demo_${col}', JSON.stringify(a)); })()`;
const COL = `(i, iso) => ({ id: 'c' + i, tipo: ['SOLO', 'FOLHA', 'FRUTA'][i % 3], data: iso, talhao: 'RU' + (11 + i % 8) + 'TAI24', analiseNome: 'Solo completo', lab: 'IBRA', valor: 100, situacao: 'ativa', coletor: 'Equipe A', enviado: true, laudo: true, envio: iso, os: 'OS-' + i, criadoEm: iso + 'T10:00:00.000Z' })`;
const AGU = `(i, iso) => ({ id: 'w' + i, data: iso, hora: '07:30', tipoColeta: 'avulsa', pontoRef: 'ponto:p1', pontoNome: 'Poço 01', bebIds: [], analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, lab: 'Aqualab', resultado: 'CONFORME', situacao: 'ativa', envio: iso, laudoEm: iso, criadoEm: iso + 'T10:00:00.000Z' })`;

(async () => {
  const b = await chromium.launch();

  console.log('— Coletas: teto de 3.000');
  let p = await abre(b, 1280);
  const chave = await p.evaluate(() => Object.keys(localStorage).filter(k => /sv2demo_sv2_users/.test(k)).length);
  conf(chave === 1, 'armazenamento da demonstração encontrado');
  await p.evaluate(enche('sv2_coletas', 3010, COL)); await p.reload(); await esp(p, 1500);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 1200);
  let r = await p.evaluate(() => ({ n: S.coletas.length, temVelha: S.coletas.some(c => c.id === 'c3009'), temNova: S.coletas.some(c => c.id === 'c0'), teto: document.querySelectorAll('.tb-teto').length, bt: !!document.querySelector('[data-act="co-tudo"]') }));
  conf(r.n === 3000 && r.temNova && !r.temVelha, 'carrega as 3.000 mais recentes (' + r.n + '), sem as 10 mais antigas');
  conf(r.teto === 0 && r.bt, 'a barra só mostra “Carregar todas”, sem texto de aviso (ITEM 50)');
  const alt = await p.evaluate(() => { const bar = document.querySelector('.tb-bar'), h = [...bar.querySelectorAll('.bt')].map(e => Math.round(e.getBoundingClientRect().height)); return { h: h, sobra: document.documentElement.scrollWidth > innerWidth }; });
  conf(new Set(alt.h).size === 1 && !alt.sobra, '“Carregar todas” com a mesma altura dos botões da barra (' + alt.h.join('/') + ') e nada rola para o lado');
  /* nº seguro: amostra nova com o mesmo nº de uma antiga fora das 3.000 */
  r = await p.evaluate(async () => {
    const ops = [{ col: 'sv2_coletas', tipo: 'set', id: 'c3009', dados: { data: '2020-01-01' } }, { col: 'sv2_coletas', tipo: 'set', id: 'novo1', dados: { data: '2020-01-01' } }, { col: 'sv2_prog', tipo: 'update', id: 'x', dados: {} }];
    await coIdsSeguros(ops); return ops.map(o => o.id);
  });
  conf(r[0] === 'c3009_2' && r[1] === 'novo1' && r[2] === 'x', 'nº de amostra nova igual a uma antiga fora das 3.000 vira outro nº (' + r.join(', ') + ')');
  await p.click('[data-act="co-tudo"]'); await esp(p, 1500);
  r = await p.evaluate(() => ({ n: S.coletas.length, bt: !!document.querySelector('[data-act="co-tudo"]') }));
  conf(r.n === 3010 && !r.bt, '“Carregar todas” lê as 3.010 e o botão some');
  r = await p.evaluate(async () => { const ops = [{ col: 'sv2_coletas', tipo: 'set', id: 'c3009', dados: { data: '2020-01-01' } }]; await coIdsSeguros(ops); return ops[0].id; });
  conf(r === 'c3009', 'com tudo carregado, a conferência no servidor não roda (o nº já é conferido na lista)');
  conf(p._er.length === 0, 'sem erro de JavaScript ' + p._er.join(' | ').slice(0, 200)); await p.context().close();

  console.log('— Coletas: abaixo do teto nada muda');
  p = await abre(b, 1280);
  await p.evaluate(enche('sv2_coletas', 40, COL)); await p.reload(); await esp(p, 1500);
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await esp(p, 1000);
  r = await p.evaluate(() => ({ n: S.coletas.length, bt: !!document.querySelector('.tb-tetob') }));
  conf(r.n === 40 && !r.bt, '40 amostras: todas carregadas, sem botão');
  await p.context().close();

  console.log('— Água: teto de 1.000 (celular)');
  p = await abre(b, 390);
  await p.evaluate(enche('sv2_aguacol', 3004, AGU)); await p.reload(); await esp(p, 1500);
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 1300);
  r = await p.evaluate(() => ({ n: S.aguacol.length, teto: document.querySelectorAll('.tb-teto').length, bt: !!document.querySelector('[data-act="ag-tudo"]'), sobra: document.documentElement.scrollWidth > innerWidth }));
  conf(r.n === 1000 && r.teto === 0 && r.bt, 'água: 1.000 mais recentes (ITEM 51) e só o botão na barra (' + r.n + ')');
  conf(!r.sobra, 'celular: nada rola para o lado com o aviso');
  const toque = await p.evaluate(() => Math.round(document.querySelector('[data-act="ag-tudo"]').getBoundingClientRect().height));
  conf(toque >= 44, 'celular: “Carregar todas” com toque de 44 px (' + toque + ')');
  await p.click('[data-act="ag-tudo"]'); await esp(p, 1500);
  r = await p.evaluate(() => ({ n: S.aguacol.length, bt: !!document.querySelector('[data-act="ag-tudo"]') }));
  conf(r.n === 3004 && !r.bt, 'água: “Carregar todas” lê as 3.004');
  conf(p._er.length === 0, 'sem erro de JavaScript no celular ' + p._er.join(' | ').slice(0, 200)); await p.context().close();

  console.log('— Fotos vencidas somem para todos no dia');
  p = await abre(b, 1280);
  await p.evaluate(async F => {
    S._acLimpou = true; /* ninguém eliminou ainda: simula o aparelho de quem não é Líder ★/Administrador */
    const C = Data.col.bind(Data), ag = n => new Date(Date.now() - n * 864e5).toISOString(), d = n => addDias(hojeISO(), n);
    await C('sv2_users').set('u2', { nome: 'Marcelo Bruno', login: 'marcelo.bruno', perfil: 'secundario', bloqueado: false, criadoEm: ag(0) });
    for (const f of ['f1', 'f2', 'f3']) await C('sv2_agua_foto').set(f, { coletaId: 'x', dataUrl: F, criadoEm: ag(0), porId: 'u2' });
    const base = { hora: '07:30', analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, lab: 'Aqualab', situacao: 'ativa', tipoColeta: 'avulsa', pontoRef: 'ponto:p1', bebIds: [], resultado: 'NÃO CONFORME', agente: ['ecoli'], gravidade: 'leve', criadoEm: ag(0) };
    const ac = (dias, fotos) => ({ responsavelId: 'u2', responsavelNome: 'Marcelo Bruno', prazo: d(-dias), orientacao: 'Clorar', abertaPor: 'x', abertaPorNome: 'Joana Silva', abertaEm: ag(dias + 2), etapas: [{ ts: ag(dias), porId: 'u2', porNome: 'Marcelo Bruno', texto: 'Clorado', fotos: fotos, final: true }], concluida: true, concluidaEm: ag(dias), concluidaPor: 'u2', concluidaPorNome: 'Marcelo Bruno' });
    await C('sv2_aguacol').set('v8', Object.assign({}, base, { data: d(-12), pontoNome: 'Poço vencido', acao: ac(8, ['f1', 'f2']) }));
    await C('sv2_aguacol').set('v3', Object.assign({}, base, { data: d(-6), pontoNome: 'Poço recente', acao: ac(3, ['f3']) }));
  }, FOTO);
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 900);
  await p.evaluate(() => acAbre('v8')); await esp(p, 900);
  r = await p.evaluate(() => { const g = document.querySelector('#gv'); return { th: g.querySelectorAll('.ac-th').length, txt: (g.querySelector('.ac-apag') || {}).textContent || '', aviso: /Fotos até/.test(g.textContent) }; });
  conf(r.th === 0 && /2 foto\(s\) vencida\(s\) em/.test(r.txt) && !r.aviso, 'passou o prazo: sem miniaturas, “2 foto(s) vencida(s) em …” e sem o aviso “Fotos até” (' + r.txt + ')');
  await p.evaluate(() => acPdf('v8')); await esp(p, 500);
  r = await p.evaluate(() => { const el = document.getElementById('au-imp'); return { img: el ? el.querySelectorAll('img').length : -1, txt: el ? /eliminada\(s\) depois da conclusão/.test(el.textContent) : false }; });
  conf(r.img === 0 && r.txt, 'PDF da ação sem as fotos vencidas');
  await p.keyboard.press('Escape'); await esp(p, 500);
  await p.evaluate(() => acAbre('v3')); await esp(p, 1100);
  r = await p.evaluate(() => { const g = document.querySelector('#gv'), m = g.textContent.match(/Fotos até (\d\d\/\d\d\/\d{4})/); return { th: g.querySelectorAll('.ac-th').length, ate: m ? m[1] : '', esperado: fmtD(addDias(addDias(agDia(S.aguacol.find(x => x.id === 'v3').acao.concluidaEm), AC_FOTO_DIAS), -1)) }; });
  conf(r.th === 1 && r.ate === r.esperado, 'dentro do prazo: a foto aparece e “Fotos até” mostra o último dia com foto (' + r.ate + ')');
  await p.keyboard.press('Escape'); await esp(p, 400);
  const n = await p.evaluate(async () => { S._acLimpou = false; return acFotoLimpar(); }); await esp(p, 600);
  r = await p.evaluate(async () => ({ f1: (await Data.col('sv2_agua_foto').get('f1')).dataUrl, f3: (await Data.col('sv2_agua_foto').get('f3')).dataUrl.length > 0 }));
  conf(n === 2 && r.f1 === '' && r.f3, 'Líder ★/Administrador continua eliminando de vez só as vencidas (' + n + ')');
  await p.evaluate(() => acAbre('v8')); await esp(p, 900);
  r = await p.evaluate(() => (document.querySelector('#gv .ac-apag') || {}).textContent || '');
  conf(/eliminada\(s\) em/.test(r), 'depois de eliminadas: “eliminada(s) em …” (' + r + ')');
  conf(p._er.length === 0, 'sem erro de JavaScript ' + p._er.join(' | ').slice(0, 200)); await p.context().close();

  await b.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
