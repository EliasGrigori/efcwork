/* EFCwork · v0.6.15 · celular: ícone "Abrir o EFClaudian" na linha do caminho e botões da fileira com a mesma largura (ITENS 39 e 40).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0615e.js */
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const t48 = fs.readFileSync(path.join(__dirname, 't_v048.js'), 'utf8'), ia = t48.indexOf('await p.evaluate(async () => {') + 'await p.evaluate('.length, SEM_AL = t48.slice(ia, t48.indexOf('});\n  await p.waitForTimeout(300);', ia) + 1);
async function entra(b, w) { const cel = w < 900, p = await (await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto(URL); await p.waitForTimeout(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700); await p.evaluate(eval(SEM_AL)); await p.waitForTimeout(300);
  await p.evaluate(async () => { const C = Data.col.bind(Data), h = hojeISO(); for (let i = 0; i < 6; i++) await C('sv2_coletas').set('c' + i, { tipo: 'SOLO', data: addDias(h, -i), talhao: 'RU1', analiseNome: 'A', lab: 'IBRA', valor: 1, situacao: 'ativa', coletor: 'E', criadoEm: nowISO() }); }); return p; }
const vai = async (p, r) => { await p.evaluate(x => { location.hash = '#' + x; }, r); await p.waitForTimeout(600); };
const mede = p => p.evaluate(() => { const a = document.querySelector('.cs-acts'), ext = a && a.querySelector('.cs-ext'), bc = document.querySelector('.cs-bc'), q = e => e.getBoundingClientRect();
  const f = a ? [...a.children].filter(e => e.offsetParent !== null && !e.classList.contains('cs-ext')) : [];
  return { ext: !!ext, extTop: ext ? q(ext).top : 0, extRight: ext ? q(ext).right : 0, extAlt: ext ? q(ext).height : 0, bcTop: bc ? q(bc).top : 0, bcBot: bc ? q(bc).bottom : 0, linhas: new Set(f.map(e => Math.round(q(e).top))).size, alturas: new Set(f.map(e => Math.round(q(e).height))).size,
    lar: f.map(e => Math.round(q(e).width)), corta: [...(a ? a.querySelectorAll('.bt') : [])].filter(e => e.scrollWidth > e.clientWidth + 1).length, sobra: document.documentElement.scrollWidth > innerWidth, viewW: innerWidth }; });
(async () => { const b = await chromium.launch();
  let p = await entra(b, 390);
  console.log('— Celular 390 px: Almoxarifado › Materiais (3 botões + ícone)'); await vai(p, '/almox/materiais'); let m = await mede(p);
  conf(m.ext, 'o ícone do EFClaudian existe no cabeçalho'); conf(Math.abs((m.extTop + m.extAlt / 2) - (m.bcTop + m.bcBot) / 2) <= 6, 'o ícone fica na linha do caminho (centro a ' + Math.round(Math.abs((m.extTop + m.extAlt / 2) - (m.bcTop + m.bcBot) / 2)) + ' px)');
  conf(m.extRight <= m.viewW, 'o ícone não passa da borda da tela'); conf(m.extAlt >= 44, 'área de toque do ícone com 44 px ou mais');
  conf(m.linhas === 1 && m.alturas === 1, 'os 3 botões na mesma linha e com a mesma altura'); conf(m.lar.length === 3 && Math.max.apply(null, m.lar) - Math.min.apply(null, m.lar) <= 1, 'os 3 botões com a mesma largura (' + m.lar.join(' / ') + ')');
  conf(!m.corta && !m.sobra, 'nada cortado e sem rolagem lateral');
  console.log('— Coletas › Envio (lista retrátil + botão)'); await vai(p, '/coletas/envio'); m = await mede(p);
  conf(m.linhas === 1 && m.lar.length === 2 && Math.abs(m.lar[0] - m.lar[1]) <= 1, 'lista e botão com a mesma largura (' + m.lar.join(' / ') + ')'); conf(m.ext && m.extTop < m.bcBot + 8, 'ícone também na linha do caminho');
  console.log('— Coletas › Água (botão com ícones soltos não vira grade)'); await vai(p, '/coletas/agua'); m = await mede(p);
  conf(m.linhas === 1 && !m.corta, 'o botão “Nova coleta de água” e os ícones seguem numa linha, sem corte'); conf(m.lar[0] > 120, 'o botão principal mantém o tamanho do texto (' + m.lar[0] + ' px)');
  console.log('— Inspeções › Apontamentos (texto grande passa para a linha de baixo)'); await vai(p, '/inspecoes/apontamentos'); m = await mede(p);
  conf(!m.corta && !m.sobra, 'nenhum botão cortado');
  conf(p._er.length === 0, 'sem erro de JavaScript'); await p.context().close();
  console.log('— PC 1280 px: nada muda'); p = await entra(b, 1280); await vai(p, '/almox/materiais'); m = await mede(p);
  conf(m.linhas === 1 && m.extTop > m.bcBot, 'no PC o ícone continua na fileira de ações (abaixo do caminho)'); await p.context().close();
  await b.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0); })();
