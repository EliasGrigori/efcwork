/* EFCwork · v0.6.39 · limpeza visual aprovada em 27/11 (ITENS 233, 234, 235, 237 e 238; o 236 foi reprovado e fica como era).
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0639.js   (EFC_DIST=<pasta> prova numa versão já publicada) */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const DIST = process.env.EFC_DIST ? path.resolve(process.env.EFC_DIST) : path.resolve(__dirname, '..', '..', 'dist');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), er = [];
  const abre = async (tema, w = 1280, h = 800) => {
    const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema, isMobile: cel, hasTouch: cel }); await ctx.route(/^https:/, r => r.abort());
    const p = await ctx.newPage(); p.on('pageerror', e => er.push(e.message));
    await p.goto('file://' + path.join(DIST, 'index.html') + '?demo=1'); await esp(600);
    await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
    await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
    await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await esp(900); return { ctx, p };
  };
  console.log('— ITEM 233 · botão dourado: parado não se mexe; o brilho passa uma vez quando o mouse chega');
  let { ctx, p } = await abre('light');
  const bt = '.cs-ph .bt.pr';
  const anim = () => p.evaluate(s => { const e = document.querySelector(s), a = getComputedStyle(e, '::after'); return { nome: a.animationName, vezes: a.animationIterationCount, sombra: getComputedStyle(e).boxShadow !== 'none', borda: getComputedStyle(e).borderTopWidth, fundo: /gradient/.test(getComputedStyle(e).backgroundImage) }; }, bt);
  let a = await anim();
  conf(a.nome === 'none', 'parado, sem animação (' + a.nome + ' ' + a.vezes + ')');
  conf(a.sombra && a.fundo && a.borda === '1px', 'visual original: degradê, borda e sombra (ITEM 233 "Original")');
  await p.hover(bt); await esp(60); a = await anim();
  conf(a.nome === 'ouroPassa' && a.vezes === '1', 'com o mouse em cima, o brilho passa uma vez (' + a.nome + ' ' + a.vezes + ')');
  const dur = await p.evaluate(s => getComputedStyle(document.querySelector(s), '::after').animationDuration, bt);
  conf(dur === '0.5s', 'duração da escala de movimento: 500 ms (' + dur + ')');
  console.log('— ITEM 238 · escala de letras: 12 · 14 · 16 · 18 · 22 · 28');
  const tam = await p.evaluate(() => { const s = new Set(); for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch (e) { continue; } const vai = l => { for (const r of l) { if (r.cssRules) vai(r.cssRules); if (r.style && r.style.fontSize && /px$/.test(r.style.fontSize) && !/^\.en-|#en-|\.en /.test(r.selectorText || '')) s.add(parseFloat(r.style.fontSize)); } }; vai(rs); } return [...s].sort((x, y) => x - y); });
  const fora = tam.filter(x => x && ![12, 14, 16, 18, 22, 28].includes(x)); /* 0 = texto escondido de propósito */
  conf(!fora.length, 'tamanhos em px no CSS do app (fora a tela de entrar): ' + tam.join(' ') + (fora.length ? ' · fora da escala: ' + fora.join(' ') : ''));
  const corpo = await p.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
  conf(corpo === 16, 'texto normal com 16 px (' + corpo + ')');
  await ctx.close();
  console.log('— Tema Escuro');
  ({ ctx, p } = await abre('dark'));
  const esc = await p.evaluate(() => { const h = document.querySelector('.cs-ph h1'), hh = getComputedStyle(h), tr = getComputedStyle(h, '::after'), ab = getComputedStyle(document.querySelector('.cs-abas a.on')), fz = document.querySelector('.fz-linha'), it = getComputedStyle(document.querySelector('.cs-it.on')), fu = getComputedStyle(document.body, '::before');
    return { h1: hh.backgroundClip + ' ' + hh.color, traco: tr.backgroundImage, aba: ab.borderImageSource, fz: fz ? getComputedStyle(fz).backgroundImage : 'none', menu: it.backgroundImage, fundo: fu.backgroundImage }; });
  conf(!/text/.test(esc.h1) && !/rgba\(0, 0, 0, 0\)/.test(esc.h1) && esc.traco === 'none', 'ITEM 234: título e traço em cor lisa (' + esc.h1 + ')');
  conf(esc.aba === 'none' && !/gradient/.test(esc.fz), 'ITEM 235: linha da aba escolhida lisa');
  conf(/gradient/.test(esc.menu), 'ITEM 236 reprovado: o item escolhido do menu continua como era');
  conf(!/120, 96, 200/.test(esc.fundo) && /gradient/.test(esc.fundo), 'ITEM 237: fundo sem o brilho roxo (fica o dourado e a trama)');
  await ctx.close();
  console.log('— Celular: busca e tabela');
  ({ ctx, p } = await abre('light', 390, 780));
  conf(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'com as letras maiores, nada rola para o lado');
  await p.evaluate(() => bgAbrir()); await esp(500);
  const bs = await p.evaluate(() => [document.querySelector('.bg-campo input').getBoundingClientRect().height, document.querySelector('.bg-x').getBoundingClientRect().height]);
  conf(bs[0] === bs[1] && bs[0] >= 44, 'campo da busca e o X com a mesma altura (' + bs + ')');
  await ctx.close();
  conf(!er.length, 'sem erro de JavaScript (' + er.slice(0, 2) + ')');
  await b.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(x => { console.error(x); process.exit(1); });
