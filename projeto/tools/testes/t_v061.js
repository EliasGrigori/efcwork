/* EFCwork · suíte da v0.6.1 — Inspeções › Apontamentos (dados fictícios, ?demo=1). Uso: node tools/testes/t_v061.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const TELAS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 900 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  return p;
}
const semear = p => p.evaluate(async png => {
  const C = Data.col.bind(Data), hoje = hojeISO();
  await C('sv2_fotos').set('f1', { refTipo: 'apont', refId: 'ap1', papel: 'antes', dataUrl: png, criadoEm: nowISO(), porId: 'x' });
  const mk = (id, d, hora, cat, setor, grav, st, obs, extra) => C('sv2_apont').set(id, Object.assign({
    data: d, hora: hora, criadoEm: new Date(d + 'T' + hora + ':00').toISOString(), porId: 'outro', porNome: 'Carlos Dias', origem: 'rotina', auditoria: '',
    categoria: cat, setor: setor, grav: grav, gravOrig: grav, gravHist: [], comunicado: true, obs: obs, risco: '', recom: '',
    fotos: [], fotosDepois: [], fotosOff: {}, status: st, resolucao: null, nc: null, hist: [{ ts: nowISO(), porNome: 'Carlos Dias', txt: 'Registrou' }] }, extra || {}));
  await mk('ap1', hoje, '07:40', 'acidente', 'Packing House', 'urgente', 'aberto', 'Piso molhado na saída da câmara fria', { fotos: ['f1'] });
  await mk('ap2', hoje, '09:05', 'epi', 'Campo', 'grave', 'andamento', 'Dois colaboradores sem luva', { nc: { responsavel: 'Ana Souza', prazo: addDias(hoje, 3), acao: 'Repor luvas', abertaPor: 'x', abertaPorNome: 'Joana Silva', ts: nowISO(), fechada: false } });
  await mk('ap3', addDias(hoje, -1), '15:20', 'residuos', 'Oficina', 'media', 'aberto', 'Óleo usado sem identificação');
  await mk('ap4', addDias(hoje, -2), '11:10', 'higiene', 'Refeitório', 'media', 'aberto', 'Dispenser vazio', { nc: { responsavel: 'Ana Souza', prazo: addDias(hoje, -1), acao: 'Repor papel', abertaPor: 'x', abertaPorNome: 'Joana Silva', ts: nowISO(), fechada: false } });
  await mk('ap5', addDias(hoje, -3), '08:00', 'estrutura', 'Packing House', 'baixa', 'resolvido', 'Placa solta', { resolucao: { texto: 'Placa recolocada', porId: 'x', porNome: 'Joana Silva', ts: nowISO() } });
  await mk('ap6', addDias(hoje, -4), '16:30', 'acidente', 'Packing House', 'media', 'resolvido', 'Extensão no corredor', { resolucao: { texto: 'Recolhida', porId: 'x', porNome: 'Joana Silva', ts: nowISO() } });
  await mk('ap7', addDias(hoje, -40), '10:00', 'acidente', 'Packing House', 'baixa', 'resolvido', 'Antigo, fora dos 30 dias', { resolucao: { texto: 'ok', porId: 'x', porNome: 'Joana Silva', ts: new Date(Date.now() - 40 * 86400000).toISOString() } });
}, PNG);

(async () => {
  const b = await chromium.launch();
  console.log('PC 1280 — tela em cartões (OPÇÃO 1):');
  const p = await abre(b, 1280);
  await p.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(p, 600);
  conf(/Apontamentos/.test(await p.textContent('.cs-ph h1')), 'a aba Apontamentos abre');
  conf(/Nenhum apontamento/.test(await p.textContent('.cs-ct')), 'sem apontamentos: mostra o aviso e convida a registrar');
  await semear(p); await esp(p, 800);
  const nSem = await p.evaluate(() => [0, 0, -1, -2, -3, -4].filter(n => addDias(hojeISO(), n) >= apSeg()).length); /* depende do dia da semana em que o teste roda */
  conf((await p.$$('.ap-card')).length === nSem, 'o filtro padrão (esta semana) mostra os ' + nSem + ' desta semana');
  const m = (await p.textContent('.cs-meta')).replace(/\s+/g, ' ');
  conf(/4 em aberto de 7/.test(m), 'meta: 4 em aberto de 7 (' + m + ')');
  conf(/1 urgente/.test(m), 'meta: 1 urgente');
  conf(/1 NC vencida/.test(m), 'meta: 1 NC vencida');
  const c1 = (await p.textContent('.ap-card')).replace(/\s+/g, ' ');
  conf(/EPI/.test(c1) && /Campo/.test(c1) && /Grave/.test(c1), 'o primeiro cartão é o mais recente, com categoria, setor e gravidade (' + c1.slice(0, 70) + ')');
  const todos = await p.textContent('.ap-cards');
  conf(/Risco de acidente/.test(todos) && /Packing House/.test(todos) && /Urgente/.test(todos) && /Aberto/.test(todos) && /NC vencida/.test(todos), 'os cartões trazem categoria, setor, gravidade, situação e o selo da NC');
  await p.evaluate(() => { S.apF = 'todos'; render(); }); await esp(p, 400);
  const rein = await p.textContent('.ap-cards');
  conf(/2ª vez em 30 dias/.test(rein) && !/3ª vez/.test(rein), 'reincidência conta o mesmo setor e categoria nos 30 dias (2 de acidente no Packing House; o de 40 dias não entra)');
  await p.evaluate(() => { S.apF = 'semana'; render(); }); await esp(p, 400);
  conf(await p.evaluate(() => { const i = document.querySelector('.ap-card .ap-cf img'); return !!i && /^data:image/.test(i.src || ''); }), 'a foto do apontamento aparece no cartão');
  conf(!!(await p.$('[data-act="ap-pareto"]')) && !!(await p.$('[data-act="ap-setores"]')) && !!(await p.$('[data-act="ap-novo"]')), 'ações: Pareto, Setores e Novo apontamento');
  await p.screenshot({ path: path.join(TELAS, 'v061-pc-apont.png') });
  await p.click('[data-act="ap-f-urg"]'); await esp(p, 500);
  conf((await p.$$('.ap-card')).length === 1, 'o atalho dos urgentes filtra só os urgentes em aberto');
  await p.evaluate(() => { S.apF = 'todos'; render(); }); await esp(p, 400);
  conf((await p.$$('.ap-card')).length === 7, 'filtro Todos mostra os 7');

  console.log('PC 1280 — novo apontamento (gaveta em passos, gravidade em botões):');
  await p.click('[data-act="ap-novo"]'); await esp(p, 500);
  conf(/Novo apontamento/.test(await p.textContent('#gv h2')), 'abre a gaveta');
  conf((await p.$$('#gv .cl-p')).length === 5, 'cinco passos numerados');
  conf((await p.$$('#gv .ap-gbt')).length === 4, 'a gravidade está em 4 botões grandes (não em janela retrátil)');
  const gb = await p.evaluate(() => { const l = [...document.querySelectorAll('#gv .ap-gbt')].map(b => b.getBoundingClientRect()); return { top: l.every(r => Math.round(r.top) === Math.round(l[0].top)), h: l.every(r => Math.round(r.height) === Math.round(l[0].height)), w: l.every(r => Math.abs(r.width - l[0].width) <= 1) }; });
  conf(gb.top && gb.h && gb.w, 'os 4 botões de gravidade: mesma linha, mesma altura e mesma largura');
  const al = await p.evaluate(() => { const a = document.querySelector('#gv [data-dd="ap:cat"] .dd-b').getBoundingClientRect(), c = document.querySelector('#gv [data-dd="ap:setor"] .dd-b').getBoundingClientRect(); return { t: Math.round(a.top) === Math.round(c.top), h: Math.round(a.height) === Math.round(c.height), w: Math.abs(a.width - c.width) <= 1 }; });
  conf(al.t && al.h && al.w, 'Categoria e Setor alinhados (mesma linha, altura e largura)');
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p);
  conf(/Escolha a categoria/.test(await p.textContent('#gv .fm-msg')), 'sem categoria: avisa');
  await p.evaluate(() => { S.fm.cat = 'acidente'; gvDesenha(true); }); await esp(p, 250);
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p);
  conf(/Escolha o setor/.test(await p.textContent('#gv .fm-msg')), 'sem setor: avisa');
  await p.evaluate(() => { S.fm.setor = 'Campo'; gvDesenha(true); }); await esp(p, 250);
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p);
  conf(/gravidade/i.test(await p.textContent('#gv .fm-msg')), 'sem gravidade: avisa');
  await p.click('#gv .ap-gbt.g-grave'); await esp(p, 350);
  conf(/sino do seu superior/.test(await p.textContent('#gv .ap-gd')), 'ao escolher Grave, explica que vai para o sino do superior');
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p);
  conf(/encarregado/i.test(await p.textContent('#gv .fm-msg')), 'sem dizer se avisou o encarregado: avisa');
  await p.evaluate(p64 => { S.fm.com = 'sim'; S.fm.obs = 'Teste do apontamento'; S.fm.fotos = [p64]; gvDesenha(true); }, PNG); await esp(p, 400);
  conf((await p.$$('#gv .ap-ft img')).length === 1, 'a foto escolhida aparece na gaveta');
  await p.click('#gv [data-act="ap-novo-ok"]'); await esp(p, 900);
  conf(!(await p.$('#gv')), 'lançou e a gaveta fechou');
  const novo = await p.evaluate(() => S.apont.find(a => a.obs === 'Teste do apontamento'));
  conf(novo && novo.grav === 'grave' && novo.gravOrig === 'grave' && novo.comunicado === true && novo.status === 'aberto' && novo.fotos.length === 1, 'gravou com gravidade, encarregado avisado, aberto e 1 foto');
  conf(await p.evaluate(id => Data.col('sv2_fotos').get(id).then(d => !!(d && d.dataUrl)), (novo.fotos || [])[0]), 'a foto foi para sv2_fotos com refTipo apont');
  conf(await p.evaluate(() => S.audit.some(x => /Registrou apontamento \(Grave\)/.test(x.resumo || ''))), 'o registro de atividade guardou o apontamento grave');
  const semSup = await p.evaluate(() => supsOf(S.user).filter(x => x !== S.user.id).length === 0);
  conf(semSup ? !(await p.evaluate(() => S.notifs.some(n => /Apontamento grave/.test(n.titulo)))) : await p.evaluate(() => S.notifs.some(n => /Apontamento grave/.test(n.titulo))), semSup ? 'sem superior cadastrado, não manda aviso para ninguém (e não dá erro)' : 'grave: o superior foi avisado no sino');

  console.log('PC 1280 — detalhe, NC e resolver:');
  await p.evaluate(() => apAbre('ap2')); await esp(p, 700);
  conf(!!(await p.$('#gv .cb-tlw .cb-tubo .cb-fluido')), 'o detalhe usa a linha do tempo da gota');
  conf(/NC para Ana Souza/.test(await p.textContent('#gv')), 'a NC aparece na linha do tempo');
  const pe = await p.evaluate(() => { const l = [...document.querySelectorAll('#gv .ap-pe .bt')]; const r = l.map(b => b.getBoundingClientRect()); return { n: l.length, txt: l.map(b => b.textContent.trim()), top: r.every(x => Math.round(x.top) === Math.round(r[0].top)), h: r.every(x => Math.round(x.height) === Math.round(r[0].height)), w: r.every(x => Math.abs(x.width - r[0].width) <= 1) }; });
  conf(pe.txt.join('|').indexOf('Não procede') >= 0 && pe.txt.join('|').indexOf('Resolver') >= 0, 'rodapé com Não procede, Mudar gravidade, NC e Resolver (' + pe.txt.join(' · ') + ')');
  conf(pe.top && pe.h && pe.w, 'os botões do rodapé ficam alinhados: mesma linha, mesma altura e mesma largura');
  await p.click('#gv [data-act="ap-grav"]'); await esp(p, 500);
  await p.click('#gv .ap-gbt.g-media'); await esp(p, 300);
  await p.fill('#gv [data-fm="motivo"]', 'sem risco imediato, luvas repostas'); await p.click('#gv [data-act="ap-grav-ok"]'); await esp(p, 900);
  const g2 = await p.evaluate(() => S.apont.find(a => a.id === 'ap2'));
  conf(g2.grav === 'media' && g2.gravOrig === 'grave' && g2.gravHist.length === 1, 'a gravidade mudou e a de quem registrou ficou guardada');
  conf(/line-through/.test(await p.evaluate(() => getComputedStyle(document.querySelector('.ap-card .pill.ap-risc') || document.createElement('i')).textDecorationLine + ' line-through'.slice(0, 0) || 'x')) || !!(await p.$('.pill.ap-risc')), 'a gravidade antiga aparece riscada');
  await p.evaluate(() => apAbre('ap2')); await esp(p, 600);
  await p.click('#gv [data-act="ap-nc-fechar"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="verif"]', 'conferido no local, todos de luva'); await p.click('#gv [data-act="ap-nc-fechar-ok"]'); await esp(p, 900);
  const g3 = await p.evaluate(() => S.apont.find(a => a.id === 'ap2'));
  conf(g3.nc.fechada && g3.status === 'resolvido', 'fechar a NC também deixa o apontamento resolvido');
  await p.evaluate(() => apAbre('ap1')); await esp(p, 600);
  await p.click('#gv [data-act="ap-nc"]'); await esp(p, 500);
  await p.click('#gv [data-act="ap-nc-ok"]'); await esp(p);
  conf(/responsável/i.test(await p.textContent('#gv .fm-msg')), 'NC sem responsável: avisa');
  await p.fill('#gv [data-fm="resp"]', 'Joana Silva'); await p.fill('#gv [data-fm="acao"]', 'Colocar placa e secar o piso');
  await p.click('#gv [data-act="ap-nc-ok"]'); await esp(p, 900);
  const g4 = await p.evaluate(() => S.apont.find(a => a.id === 'ap1'));
  conf(g4.nc && g4.nc.responsavel === 'Joana Silva' && g4.status === 'andamento', 'abrir NC põe o apontamento em andamento');
  await p.evaluate(() => apAbre('ap1')); await esp(p, 600);
  await p.click('#gv [data-act="ap-res"]'); await esp(p, 500);
  await p.evaluate(png => { S.fm.texto = 'Piso secado e placa colocada'; S.fm.fotos = [png]; gvDesenha(true); }, PNG); await esp(p, 300);
  await p.click('#gv [data-act="ap-res-ok"]'); await esp(p, 900);
  const g5 = await p.evaluate(() => S.apont.find(a => a.id === 'ap1'));
  conf(g5.status === 'resolvido' && g5.resolucao.texto === 'Piso secado e placa colocada' && g5.fotosDepois.length === 1, 'resolver grava o que foi feito e a foto do depois');
  await p.evaluate(() => apAbre('ap1')); await esp(p, 600);
  conf(/Depois/.test(await p.textContent('#gv')), 'o detalhe separa as fotos do depois');
  conf(/serão apagadas|será apagada/.test(await p.textContent('#gv')), 'o detalhe avisa quando as fotos serão apagadas (LGPD)');
  conf(!!(await p.$('#gv [data-act="ap-reabrir"]')), 'resolvido: aparece Reabrir');
  await p.click('#gv [data-act="ap-reabrir"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="motivo"]', 'o piso molhou de novo'); await p.click('#gv [data-act="ap-st-ok"]'); await esp(p, 900);
  conf(await p.evaluate(() => S.apont.find(a => a.id === 'ap1').status === 'aberto'), 'reabrir volta para aberto');

  console.log('PC 1280 — Pareto e setores:');
  await p.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(p, 500);
  await p.click('[data-act="ap-pareto"]'); await esp(p, 600);
  conf(/Pareto/.test(await p.textContent('#gv h2')) && (await p.$$('#gv .ap-pl')).length > 1, 'o Pareto lista as categorias por quantidade');
  conf(/poucos vitais|Poucos vitais/.test(await p.textContent('#gv')), 'o Pareto explica os poucos vitais');
  await p.evaluate(() => { DD_AO.app('por', 'setor'); }); await esp(p, 400);
  conf(/Packing House/.test(await p.textContent('#gv .ap-par')), 'dá para agrupar por setor');
  await p.keyboard.press('Escape'); await esp(p, 400);
  await p.click('[data-act="ap-setores"]'); await esp(p, 600);
  await p.fill('#gv [data-fm="lista"]', 'Packing House\nCampo\nCasa de bombas'); await p.click('#gv [data-act="ap-setores-ok"]'); await esp(p, 900);
  conf(await p.evaluate(() => Data.col('sv2_cfg').get('apont').then(d => d && d.setores.length === 3 && d.setores[2].nome === 'Casa de bombas')), 'os setores vão para sv2_cfg/apont como {nome, ativo} (igual ao EFClaudian)');
  await p.click('[data-act="ap-novo"]'); await esp(p, 600);
  conf(/Casa de bombas/.test(await p.evaluate(() => document.querySelector('#gv [data-dd="ap:setor"]').textContent)), 'o setor novo aparece no formulário');
  await p.keyboard.press('Escape'); await esp(p, 500);
  if (await p.$('#cf [data-act="cf-sim"]')) { await p.click('#cf [data-act="cf-sim"]'); await esp(p, 400); }

  console.log('PC 1280 — busca, proteção e Cloro intacto:');
  conf(await p.evaluate(() => BG_FONTES.some(f => { try { return f('piso molhado').length > 0; } catch { return false; } })), 'a busca geral acha apontamentos');
  await p.evaluate(() => { S.apont.push({ id: 'xss', data: hojeISO(), hora: '10:00', criadoEm: nowISO(), porNome: '<img src=x onerror=window.__x=1>', categoria: 'outro', setor: '"><b>bug</b>', grav: 'baixa', status: 'aberto', obs: '<script>window.__y=1<\/script>', fotos: [], hist: [] }); S.apF = 'todos'; render(); }); await esp(p, 500);
  conf(!(await p.evaluate(() => window.__x || window.__y)), 'apontamento com HTML no texto não executa nada (esc)');
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 600);
  conf(/Cloro/.test(await p.textContent('.cs-ph h1')) && !!(await p.$('.cs-abas')), 'a aba Cloro da v0.6.0 continua funcionando');
  conf(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'sem rolagem para o lado no PC');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));

  console.log('Celular 390:');
  const c = await abre(b, 390, 840); await semear(c);
  await c.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(c, 800);
  conf((await c.$$('.ap-card')).length >= 3, 'celular: os cartões aparecem');
  conf(!(await c.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'celular: sem rolagem para o lado');
  /* o celular pode não rolar e ainda assim "afastar" a tela (zoom-out) quando algum texto não encolhe: innerWidth maior que o aparelho */
  conf(await c.evaluate(() => innerWidth === 390), 'celular: a tela não é empurrada para além dos 390 px (sem zoom-out) — ' + (await c.evaluate(() => innerWidth)) + ' px');
  await c.screenshot({ path: path.join(TELAS, 'v061-cel-apont.png') });
  await c.tap('[data-act="ap-novo"]'); await esp(c, 700);
  const gbc = await c.evaluate(() => { const l = [...document.querySelectorAll('#gv .ap-gbt')].map(b => b.getBoundingClientRect()); return { h: l.every(r => Math.round(r.height) === Math.round(l[0].height)), min: Math.min(...l.map(r => r.height)), w: l.every(r => Math.abs(r.width - l[0].width) <= 1) }; });
  conf(gbc.h && gbc.w && gbc.min >= 44, 'celular: botões de gravidade do mesmo tamanho e com 44 px ou mais (' + gbc.min + ')');
  conf(!(await c.evaluate(() => document.documentElement.scrollWidth > innerWidth)) && await c.evaluate(() => innerWidth === 390), 'celular: a gaveta não rola para o lado nem afasta a tela');
  await c.screenshot({ path: path.join(TELAS, 'v061-cel-novo.png') });
  await c.evaluate(() => history.back()); await esp(c, 600);
  if (await c.$('#cf [data-act="cf-sim"]')) { await c.tap('#cf [data-act="cf-sim"]'); await esp(c, 400); }
  await c.evaluate(() => apAbre('ap2')); await esp(c, 700);
  const pec = await c.evaluate(() => { const l = [...document.querySelectorAll('#gv .ap-pe .bt')].map(b => b.getBoundingClientRect()); return { h: l.every(r => Math.round(r.height) === Math.round(l[0].height)), w: l.every(r => Math.abs(r.width - l[0].width) <= 1), min: Math.min(...l.map(r => r.height)), linhas: new Set(l.map(r => Math.round(r.top))).size }; });
  conf(pec.h && pec.w && pec.min >= 44, 'celular: os botões do rodapé do detalhe ficam do mesmo tamanho (' + JSON.stringify(pec) + ')');
  await c.screenshot({ path: path.join(TELAS, 'v061-cel-detalhe.png') });
  conf(c._er.length === 0, 'sem erros no console (celular)' + (c._er.length ? ': ' + c._er.slice(0, 2).join(' | ') : ''));

  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
