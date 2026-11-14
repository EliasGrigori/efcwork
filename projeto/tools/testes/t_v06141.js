/* EFCwork · suíte da v0.6.14.1 — os 6 "não" do Grok (v0.6.1 a v0.6.5) e 3 observações. ?demo=1, fuso America/Fortaleza.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v06141.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 800; c.height = 600; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 800, 600); g.addColorStop(0, '#9aa7b4'); g.addColorStop(1, '#5f6b77'); x.fillStyle = g; x.fillRect(0, 0, 800, 600); x.fillStyle = '#c9b48a'; x.fillRect(300, 200, 200, 160); window._FOTO = c.toDataURL('image/jpeg', 0.85); });
  return p;
}
const vai = async (p, h) => { await p.evaluate(x => { location.hash = x; }, h); await esp(p, 450); };
const fecha = async p => { for (let i = 0; i < 4 && await p.$('#gv'); i++) { await p.keyboard.press('Escape'); await esp(p, 300); } };
const MARCAS = [{ t: 's', cor: '#FF3B30', esp: 'm', x1: 0.2, y1: 0.2, x2: 0.5, y2: 0.5 }, { t: 'c', cor: '#FF3B30', esp: 'm', x1: 0.5, y1: 0.5, x2: 0.7, y2: 0.7 }];

/* lança um apontamento pela gaveta (como o usuário), com foto e 2 marcas se pedido */
async function novoAp(p, o) {
  await p.click('[data-act="ap-novo"]'); await esp(p, 500);
  await p.evaluate(o => { S.fm.cat = 'acidente'; S.fm.setor = 'Campo'; S.fm.grav = o.grav; S.fm.com = 'sim'; S.fm.obs = o.obs;
    if (o.foto) { S.fm.fotos = [window._FOTO]; S.fm.mk = [{ base: window._FOTO, marcas: window._MK, por: 'Joana Silva', em: new Date().toISOString() }]; } gvDesenha(true); }, o); await esp(p, 300);
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p, 900);
}

(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);
  await p.evaluate(m => { window._MK = m; }, MARCAS);

  console.log('v0.6.1 1.3 — traço colorido só em Grave e Urgente:');
  await vai(p, '#/inspecoes/apontamentos');
  await novoAp(p, { grav: 'media', obs: 'esteira com ruído média' });
  await novoAp(p, { grav: 'grave', obs: 'esteira sem proteção grave' });
  await novoAp(p, { grav: 'baixa', obs: 'piso molhado baixa' });
  const cor = await p.evaluate(() => { const f = g => { const e = document.querySelector('.ap-card.g-' + g); return e ? getComputedStyle(e).borderLeftColor + '|' + getComputedStyle(e).borderTopColor : ''; };
    return { media: f('media'), grave: f('grave'), baixa: f('baixa') }; });
  const igual = s => { const [l, t] = s.split('|'); return l === t; };
  conf(igual(cor.media), 'a gravidade Média fica sem traço colorido (' + cor.media + ')');
  conf(igual(cor.baixa), 'a Baixa também fica sem traço');
  conf(!!cor.grave && !igual(cor.grave), 'a Grave continua com o traço vermelho');

  console.log('v0.6.1 3.4 — rodapé do detalhe sem texto cortado (PC):');
  await p.evaluate(() => { const a = S.apont.find(x => x.grav === 'grave'); apAbre(a.id); }); await esp(p, 600);
  const pe = await p.evaluate(() => { const l = [...document.querySelectorAll('#gv .ap-pe .bt')].map(b => ({ w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), t: Math.round(b.getBoundingClientRect().top), cort: b.scrollWidth > b.clientWidth + 1, txt: b.textContent.trim() })); return l; });
  conf(pe.length === 4 && pe.some(x => /Mudar gravidade/.test(x.txt)), '4 botões no rodapé (Não procede, Mudar gravidade, Abrir NC, Resolver)');
  conf(pe.every(x => !x.cort), 'nenhum texto cortado: ' + pe.map(x => x.txt + ' ' + x.w + 'px' + (x.cort ? ' CORTADO' : '')).join(' · '));
  conf(pe.every(x => x.w === pe[0].w && x.h === pe[0].h), 'mesma largura e mesma altura nos 4 (opção A: duas linhas de dois)');
  await fecha(p);

  console.log('v0.6.1 9.2 — busca de outra tela abre o detalhe:');
  const buscaAbre = async (q, rota, vis) => {
    await vai(p, rota); await p.evaluate(() => bgAbrir()); await esp(p, 300); await p.fill('#bg-q', q); await esp(p, 400);
    const k = await p.evaluate(() => [...document.querySelectorAll('#bg-res .bg-it')].findIndex(x => x.closest('#bg-res') && true)); 
    await p.click('#bg-res .bg-it'); await esp(p, 900); return vis ? await p.evaluate(() => !!document.querySelector('#gv h2') && document.querySelector('#gv h2').textContent) : '';
  };
  const t1 = await buscaAbre('esteira com ruído', '#/inicio', true);
  conf(/Acidente|Campo|Apontamento/i.test(t1 || '') && !!(await p.$('#gv')), 'do Início: o apontamento abre na aba Apontamentos COM o detalhe (' + (t1 || '').slice(0, 40) + ')');
  conf((await p.evaluate(() => location.hash)).indexOf('apontamentos') >= 0, 'e a tela de trás é Inspeções › Apontamentos');
  await fecha(p);
  await vai(p, '#/qualidade/treinos');
  await p.evaluate(async () => { await Data.col('sv2_treinos').add({ titulo: 'Higiene das mãos', data: '2026-11-20', horas: 1, instrutor: 'Ana', situacao: 'programado', parts: [], criadoEm: new Date().toISOString(), criadoPor: S.user.id, criadoPorNome: S.user.nome }); }); await esp(p, 500);
  await vai(p, '#/inicio'); await p.evaluate(() => bgAbrir()); await esp(p, 300); await p.fill('#bg-q', 'Higiene das mãos'); await esp(p, 400);
  await p.click('#bg-res .bg-it'); await esp(p, 900);
  conf(!!(await p.$('#gv')) && /Higiene das mãos/.test(await p.textContent('#gv')), 'do Início: um treinamento também abre com o detalhe');
  await fecha(p);

  console.log('v0.6.4 3.1 — foto grande do apontamento logo depois de enviar:');
  await vai(p, '#/inspecoes/apontamentos');
  await novoAp(p, { grav: 'grave', obs: 'foto marcada logo depois', foto: true });
  const fx = await p.evaluate(() => { const a = S.apont.find(x => x.obs === 'foto marcada logo depois'); return a && a.fotos[0] ? { id: a.fotos[0], ap: a.id } : null; });
  conf(!!fx, 'o apontamento com foto foi lançado');
  await p.evaluate(x => apAbre(x.ap), fx); await esp(p, 700);
  await p.evaluate(x => apFotoVer(x.id), fx); await esp(p, 400);
  conf(!!(await p.$('#fed-v')) && /2 marcas/.test(await p.textContent('#fed-v .fed-rod')), 'logo depois de enviar, a foto grande já diz "2 marcas" (sem recarregar)');
  conf(!!(await p.$('#fed-v [data-fv="o"]')), 'e a chave "Original" aparece');
  await p.click('#fed-v [data-fv="o"]'); await esp(p, 200);
  conf(await p.evaluate(() => document.querySelector('#fed-v img').src === window._FOTO), 'a chave Original mostra a foto sem as marcas');
  await p.keyboard.press('Escape'); await esp(p, 300); await fecha(p);

  console.log('v0.6.4 3.2 — foto grande do Cloro logo depois de lançar:');
  await vai(p, '#/inspecoes/cloro');
  await p.evaluate(async () => { const a = new Date(Date.now() - 20 * 864e5).toISOString(); await Data.col('sv2_bebs').set('bx', { codigo: 'BR 50', local: 'Teste', situacao: 'ativo', ativoDesde: a, criadoEm: a, criadoPor: 'x' }); }); await esp(p, 300);
  await p.click('[data-act="cl-nova"]'); await esp(p, 500);
  await p.evaluate(() => { S.fm.ponto = 'beb:bx'; S.fm.valor = '1,0'; S.fm.foto = window._FOTO; S.fm.fotoMk = { base: window._FOTO, marcas: window._MK, por: 'Joana Silva', em: new Date().toISOString() }; gvDesenha(true); }); await esp(p, 250);
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 900);
  const cid = await p.evaluate(() => { const r = S.cloro.find(x => x.pontoId === 'bx'); return r ? r.id : ''; });
  conf(!!cid, 'a verificação de cloro com foto foi lançada');
  await p.evaluate(id => clFotoVer(id), cid); await esp(p, 400);
  conf(!!(await p.$('#fed-v')) && /2 marcas/.test(await p.textContent('#fed-v .fed-rod')) && !!(await p.$('#fed-v [data-fv="o"]')), 'logo depois de lançar, a foto grande tem as marcas e a chave Original');
  await p.keyboard.press('Escape'); await esp(p, 300); await fecha(p);

  console.log('v0.6.5 1.4 — bebedouro novo entra no rodízio:');
  const rod = await p.evaluate(async () => {
    const velho = new Date(Date.now() - 40 * 864e5).toISOString(), ontem = new Date(Date.now() - 864e5).toISOString();
    await Data.col('sv2_bebs').set('b1', { codigo: 'BR 01', local: 'Oficina', situacao: 'ativo', criadoEm: velho, criadoPor: 'x' });
    await Data.col('sv2_bebs').set('b2', { codigo: 'BR 06', local: 'Refeitório', situacao: 'ativo', criadoEm: velho, criadoPor: 'x' });
    await Data.col('sv2_bebs').set('b3', { codigo: 'BR 11', local: 'Antigo fora do projeto', situacao: 'ativo', criadoEm: velho, criadoPor: 'x' });
    await Data.col('sv2_aguaproj').set('legado', { legado: true, nome: 'Rodízio dos bebedouros', pontos: ['beb:b1', 'beb:b2'], porVez: 2, mesclada: true, cadaSemanas: 2, dia: 4, hora: '08:00', inicio: '2026-10-01', confirmadas: {}, remarcadas: {}, puladas: {}, ativo: true, criadoEm: velho });
    await new Promise(r => setTimeout(r, 400));
    const antes = agBebs().map(x => x.codigo);
    await Data.col('sv2_bebs').set('b4', { codigo: 'BR 20', local: 'Pátio', situacao: 'ativo', rodizioAuto: true, criadoEm: ontem, criadoPor: S.user.id });
    await new Promise(r => setTimeout(r, 400));
    const depois = agBebs().map(x => x.codigo), sug = agSugeridos().map(x => x.codigo);
    return { antes, depois, sug, pontos: pjLegadoSalvo().pontos.length };
  });
  conf(rod.antes.join() === 'BR 01,BR 06', 'antes: o rodízio tem só BR 01 e BR 06 (' + rod.antes.join(', ') + ')');
  conf(rod.depois.indexOf('BR 20') >= 0, 'depois de cadastrar o BR 20 pela verificação de cloro, ele entra no rodízio (' + rod.depois.join(', ') + ')');
  conf(rod.depois.indexOf('BR 11') < 0, 'um bebedouro antigo que ficou fora do projeto continua fora');
  conf(rod.sug[0] === 'BR 20' || rod.sug.indexOf('BR 20') >= 0, 'sem coleta nenhuma, o BR 20 vem entre os sugeridos (' + rod.sug.join(', ') + ')');
  await vai(p, '#/coletas/agua'); await p.click('[data-act="ag-nova"]'); await esp(p, 600);
  conf(/BR 20/.test(await p.textContent('#gv')), 'na Nova coleta o BR 20 aparece para marcar');
  await fecha(p);
  const salvo = await p.evaluate(async () => { await Data.col('sv2_aguaproj').update('legado', { pontos: ['beb:b1', 'beb:b2'], atualizadoEm: new Date().toISOString() }); await new Promise(r => setTimeout(r, 400)); return agBebs().map(x => x.codigo).join(); });
  conf(salvo === 'BR 01,BR 06', 'se o líder salva o projeto sem o BR 20, ele sai (a escolha do líder vale): ' + salvo);

  console.log('Observações:');
  conf(await p.evaluate(() => !/lançar coleta nova/.test(csArea('coletas').parcial) && /fichas, etiquetas/.test(csArea('coletas').parcial)), 'Áreas › Coletas não diz mais que "lançar coleta nova" fica no EFClaudian');
  const kv = await p.evaluate(() => { const c = { analiseNome: 'Potabilidade', lab: '' }; return [c.analiseNome, c.lab].filter(Boolean).join(' · ') || '—'; });
  conf(kv === 'Potabilidade', 'PDF da ação: análise sem laboratório não mostra "· —" (' + kv + ')');
  const src = await p.evaluate(() => acPdf.toString());
  conf(/filter\(Boolean\)\.join\(' · '\) \|\| '—'/.test(src), 'a montagem do PDF usa essa regra');

  console.log('Celular 390 — rodapé do apontamento:');
  const c = await abre(b, 390, 800); await c.evaluate(m => { window._MK = m; }, MARCAS);
  await vai(c, '#/inspecoes/apontamentos'); await novoAp(c, { grav: 'grave', obs: 'celular grave' });
  await c.evaluate(() => { const a = S.apont.find(x => x.obs === 'celular grave'); apAbre(a.id); }); await esp(c, 700);
  const pc = await c.evaluate(() => [...document.querySelectorAll('#gv .ap-pe .bt')].map(b => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), cort: b.scrollWidth > b.clientWidth + 1 }; }));
  conf(pc.length === 4 && pc.every(x => !x.cort && x.h >= 44 && x.w === pc[0].w), 'celular: 4 botões, 44 px de altura, mesma largura, nada cortado');
  conf(await c.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular: nada arrasta para o lado');

  conf(p._er.length === 0 && c._er.length === 0, 'nenhum erro no console' + (p._er.concat(c._er).length ? ': ' + p._er.concat(c._er).join(' | ').slice(0, 300) : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
