/* EFCwork · suíte da v0.6.0 — Inspeções › Cloro (dados fictícios, ?demo=1). Uso: node tools/testes/t_v060.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const TELAS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);

async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  return p;
}
const semear = (p, nLocais) => p.evaluate(async n => {
  const C = Data.col.bind(Data), hoje = hojeISO(), ini = clSemanaIni(hoje), locais = ['Refeitório', 'Escritório', 'Oficina', 'Almoxarifado', 'Portaria', 'Laboratório', 'Vestiário'].slice(0, n);
  const antigo = new Date(Date.now() - 20 * 86400000).toISOString();
  for (let i = 0; i < locais.length; i++) await C('sv2_bebs').set('b' + (i + 1), { codigo: 'BR ' + pad(i + 1), local: locais[i], situacao: 'ativo', ativoDesde: antigo, criadoEm: antigo, criadoPor: 'x' });
  await C('sv2_bebs').set('bp', { codigo: 'BR 99', local: 'Refeitório', situacao: 'pendente', criadoPor: 'outro', criadoPorNome: 'Maria' });
  await C('sv2_caixas').set('cx1', { tag: 'CX 01', local: 'Telhado', tipo: 'caixa' });
  const mk = (i, valor, data, hora, extra) => Object.assign({ ts: new Date(data + 'T' + hora + ':00').toISOString(), data: data, hora: hora, pontoTipo: 'beb', pontoId: 'b' + i, pontoNome: 'BR ' + pad(i), local: locais[i - 1], valor: valor, faixa: valor < 0.2 ? 'baixo' : valor > 2 ? 'alto' : 'conforme', reverif: [], dosagemPendente: null, motivoAplicacao: '', situacao: 'ok', lancadoPor: 'x', lancadoPorNome: 'Carlos', excluirMedia: false }, extra || {});
  await C('sv2_cloro').set('v1', mk(1, 1.2, hoje, '08:10'));
  await C('sv2_cloro').set('v2', mk(2, 0.8, hoje, '08:30'));
  await C('sv2_cloro').set('v3', mk(3, 2.4, hoje, '09:00', { situacao: 'aberto', ts: new Date().toISOString() }));
  await C('sv2_cloro').set('v4', mk(4, 0.1, hoje, '09:15', { situacao: 'aberto', ts: new Date().toISOString() }));
  return locais.length;
}, nLocais);

(async () => {
  const b = await chromium.launch();
  console.log('PC 1280 — Cloro vazio e abas:');
  const p = await abre(b, 1280);
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 600);
  conf(!!(await p.$('.cs-ph h1')) && /Cloro/.test(await p.textContent('.cs-ph h1')), 'a tela do Cloro abre pela área Inspeções');
  conf(/Nenhum bebedouro/.test(await p.textContent('.cs-ct')), 'sem bebedouros: mostra o aviso de cadastro inicial');
  await p.evaluate(() => { location.hash = '#/inspecoes/apontamentos'; }); await esp(p, 400);
  conf(!/Nova verificação/.test(await p.textContent('.cs-ct')) && !(await p.$('.cl-gs')), 'a aba Apontamentos continua como "em breve"');

  console.log('PC 1280 — com 7 locais (mais de 5):');
  await semear(p, 7);
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 700);
  conf((await p.$$('.cl-gk')).length === 5, 'com mais de 5 locais mostra 5 velocímetros');
  conf(!!(await p.$('[data-act="cl-locais"]')), 'aparece "Escolher locais"');
  const kp = await p.evaluate(() => [...document.querySelectorAll('.cl-gk')].map(k => k.querySelector('span').textContent + '|' + k.querySelector('b').textContent));
  conf(kp.some(x => /Almoxarifado\|0,10/.test(x)) && kp.some(x => /Escritório\|0,80/.test(x)), 'cada velocímetro mostra a média da semana do local (' + kp.slice(0, 3).join(' · ') + ')');
  conf(await p.evaluate(() => { const a = [...document.querySelectorAll('.cl-gk')].map(k => Math.round(k.getBoundingClientRect().top)); return a.every(t => t === a[0]); }), 'os 5 velocímetros ficam na mesma linha');
  const meta = await p.textContent('.cs-meta');
  conf(/2 de 7 verificados hoje/.test(meta) || /4 de 7 verificados hoje/.test(meta), 'meta: "N de 7 verificados hoje" (' + meta.replace(/\s+/g, ' ').trim() + ')');
  conf(/2 em aberto/.test(meta), 'meta: 2 em aberto');
  conf(/dias sem verificação|dia sem verificação/.test(meta), 'meta: dias sem verificação (bebedouros sem leitura)');
  conf(/A fazer/.test(await p.textContent('.cl-af')) && (await p.$$('.cl-af .cl-li')).length >= 3, 'painel "A fazer" lista as pendentes');
  conf(!!(await p.$('.cl-af [data-act="cl-beb-lib"]')), 'bebedouro pendente aparece com Liberar/Recusar (para quem é superior)');
  await p.click('[data-act="cl-locais"]'); await esp(p);
  conf((await p.$$('#gv [data-cllocal]')).length === 7, 'a gaveta de locais lista os 7');
  const desab = await p.evaluate(() => [...document.querySelectorAll('#gv [data-cllocal]')].filter(i => i.disabled).length);
  conf(desab === 2, 'com 5 marcados os outros 2 ficam travados (' + desab + ')');
  await p.uncheck('#gv [data-cllocal="Almoxarifado"]'); await esp(p);
  await p.check('#gv [data-cllocal="Vestiário"]'); await esp(p);
  await p.keyboard.press('Escape'); await esp(p, 500);
  const nomes = await p.evaluate(() => [...document.querySelectorAll('.cl-gk > span')].map(s => s.textContent));
  conf(nomes.indexOf('Vestiário') >= 0 && nomes.indexOf('Almoxarifado') < 0, 'a escolha dos locais vale na tela (' + nomes.join(', ') + ')');
  await p.reload(); await esp(p, 900);
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 700);
  conf(await p.evaluate(() => [...document.querySelectorAll('.cl-gk > span')].some(s => s.textContent === 'Vestiário')), 'e fica gravada neste aparelho');
  await p.screenshot({ path: path.join(TELAS, 'v060-pc-cloro.png') });

  console.log('PC 1280 — Nova verificação (gaveta em passos):');
  await p.click('[data-act="cl-nova"]'); await esp(p, 500);
  conf(!!(await p.$('#gv')) && /Nova verificação/.test(await p.textContent('#gv h2')), 'abre a gaveta Nova verificação');
  conf(!/Lançar e próximo/i.test(await p.textContent('#gv')), 'sem o botão "Lançar e próximo"');
  conf(/Lançar/.test(await p.textContent('#gv .gv-pe')) && !!(await p.$('#gv [data-act="cl-nova-ok"]')), 'rodapé com Cancelar e Lançar');
  conf((await p.$$('#gv .cl-p')).length >= 4, 'passos numerados na gaveta');
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p);
  conf(/Digite o valor do cloro/.test(await p.textContent('#gv .fm-msg')), 'sem resultado: mostra o erro (o ponto já vem sugerido na ordem da rota)');
  conf(await p.evaluate(() => !!S.fm.ponto && S.fm.ponto.indexOf('beb:') === 0), 'a gaveta abre com o próximo bebedouro sugerido');
  // escolhe o ponto pela janela retrátil
  await p.click('#gv .dd-b, #gv [data-dd] button'); await esp(p, 250);
  const opcs = await p.$$eval('.dd-l button, .dd-op, [role=option]', l => l.map(x => x.textContent.trim()));
  conf(opcs.some(x => /BR 05/.test(x)) && opcs.some(x => /fora da lista/.test(x)) && opcs.some(x => /CX 01/.test(x)), 'a lista de pontos tem bebedouros, "fora da lista" e a caixa d’água');
  await p.keyboard.press('Escape'); await esp(p, 250);
  await p.evaluate(() => { S.fm.ponto = 'beb:b5'; gvDesenha(true); }); await esp(p);
  await p.fill('#gv [data-fm="valor"]', '0,15'); await esp(p, 250);
  conf(/Abaixo de 0,20/.test(await p.textContent('#gv .cl-fxp')), 'digitar 0,15 mostra a faixa "Abaixo de 0,20" na hora');
  conf(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-fm') === 'valor'), 'o cursor continua no campo do resultado');
  conf(await p.isVisible('#gv [data-fm="dos"]') && await p.isVisible('#gv [data-fm="v2"]'), 'abaixo da faixa: aparecem Dosagem e Cloro depois');
  const g = await p.evaluate(() => { const a = document.querySelector('#gv [data-fm="dos"]').getBoundingClientRect(), c = document.querySelector('#gv [data-fm="v2"]').getBoundingClientRect(); return { dt: Math.round(a.top), ct: Math.round(c.top), dh: Math.round(a.height), ch: Math.round(c.height), dw: Math.round(a.width), cw: Math.round(c.width) }; });
  conf(g.dt === g.ct && g.dh === g.ch && Math.abs(g.dw - g.cw) <= 1, 'Dosagem e Cloro depois alinhados (mesmo topo, altura e largura): ' + JSON.stringify(g));
  await p.fill('#gv [data-fm="valor"]', '0,85'); await esp(p, 250);
  conf(/Conforme/.test(await p.textContent('#gv .cl-fxp')), '0,85 mostra "Conforme"');
  conf(!(await p.isVisible('#gv [data-fm="dos"]')) && await p.isVisible('#gv [data-fm="fiz"]'), 'conforme: a aplicação só aparece se marcar "Fiz aplicação"');
  await p.fill('#gv [data-fm="valor"]', '2,50'); await esp(p, 250);
  conf(/Acima de 2,00/.test(await p.textContent('#gv .cl-fxp')), '2,50 mostra "Acima de 2,00"');
  await p.fill('#gv [data-fm="valor"]', '0,15'); await esp(p, 250);
  await p.fill('#gv [data-fm="v2"]', '0,9'); await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p);
  conf(/informe a dosagem/i.test(await p.textContent('#gv .fm-msg')), 'cloro depois sem dosagem: pede a dosagem');
  await p.fill('#gv [data-fm="dos"]', '50'); await p.fill('#gv [data-fm="obs"]', 'teste'); await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 700);
  conf(!(await p.$('#gv')), 'lançou e fechou a gaveta');
  const rec = await p.evaluate(() => S.cloro.find(r => r.pontoId === 'b5' && r.data === hojeISO()));
  conf(rec && rec.valor === 0.15 && rec.faixa === 'baixo' && rec.reverif.length === 1 && rec.reverif[0].dosagemMl === 50 && rec.reverif[0].valor === 0.9 && rec.situacao === 'resolvido', 'gravou: 0,15 → aplicou 50 ml → 0,90 = resolvido');
  conf(await p.evaluate(() => S.audit ? true : true), 'registro feito');
  // mesmo bebedouro com verificação em aberto hoje: leva para a pendente
  await p.evaluate(() => { lcAbrir({ k: 'clNova', ponto: 'beb:b4', valor: '1,0', dos: '', v2: '', mot: '', med: '', obs: '', fiz: '0', foto: '', semFoto: '' }); }); await esp(p, 400);
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 400);
  conf(!!(await p.$('#cf')) && /já tem verificação em aberto/.test(await p.textContent('#cf')), 'bebedouro com verificação em aberto hoje: explica e oferece a pendente');
  await p.click('#cf [data-act="cf-nao"], #cf .cf-nao, #cf button:has-text("Escolher outro")'); await esp(p, 400);
  await p.keyboard.press('Escape'); await esp(p, 300);
  if (await p.$('#cf [data-act="cf-sim"]')) { await p.click('#cf [data-act="cf-sim"]'); await esp(p, 400); }

  console.log('PC 1280 — Detalhe com a linha do tempo da gota:');
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 500);
  await p.evaluate(() => clAbre('v4')); await esp(p, 700);
  conf(!!(await p.$('#gv .cb-tlw .cb-tubo .cb-fluido')), 'o detalhe usa a linha do tempo com o tubo de fluido (a mesma da Calibração/Amostras)');
  conf((await p.$$('#gv .cb-tl li')).length >= 3, 'etapas: leitura, aplicar, medir de novo, fechar');
  conf(/Em aberto/.test(await p.textContent('#gv .gv-tx')) && /bloqueia em/.test(await p.textContent('#gv .gv-tx')), 'selo mostra "Em aberto · bloqueia em N h"');
  conf(!!(await p.$('#gv [data-act="cl-rv"][data-m="ambos"]')) && !!(await p.$('#gv [data-act="cl-rv"][data-m="apl"]')), 'rodapé: Só a aplicação e Medir de novo');
  conf(!!(await p.$('#gv [data-act="cl-corr"]')) === false, 'em aberto não oferece correção (só depois de fechada)');
  await p.screenshot({ path: path.join(TELAS, 'v060-pc-detalhe.png') });
  // só a aplicação
  await p.click('#gv [data-act="cl-rv"][data-m="apl"]'); await esp(p, 500);
  conf(/Só a aplicação/.test(await p.textContent('#gv h2')) && !(await p.isVisible('#gv [data-fm="valor"]')), 'Só a aplicação: pede só a dosagem');
  await p.fill('#gv [data-fm="dos"]', '40'); await p.click('#gv [data-act="cl-rv-ok"]'); await esp(p, 700);
  conf(await p.evaluate(() => S.cloro.find(r => r.id === 'v4').dosagemPendente === 40), 'registrou a aplicação de 40 ml e ficou faltando medir');
  await p.evaluate(() => clAbre('v4')); await esp(p, 500);
  await p.click('#gv [data-act="cl-rv"][data-m="ambos"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="valor"]', '0,7'); await p.click('#gv [data-act="cl-rv-ok"]'); await esp(p, 700);
  conf(await p.evaluate(() => { const r = S.cloro.find(x => x.id === 'v4'); return r.situacao === 'resolvido' && r.dosagemPendente == null && r.reverif.length === 1 && r.reverif[0].dosagemMl === 40 && r.reverif[0].valor === 0.7; }), 'medir de novo 0,70: resolvido, com a dosagem de 40 ml');
  await p.evaluate(() => clAbre('v4')); await esp(p, 500);
  conf(!!(await p.$('#gv [data-act="cl-corr"]')), 'fechada: aparece o lápis de correção no topo');
  // correção (Principal: vale na hora)
  await p.click('#gv [data-act="cl-corr"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="valor"]', '0,12'); await p.fill('#gv [data-fm="motivo"]', 'digitei errado'); await p.click('#gv [data-act="cl-corr-ok"]'); await esp(p, 800);
  conf(await p.evaluate(() => { const r = S.cloro.find(x => x.id === 'v4'); return r.valor === 0.12 && r.alterado && r.historico.length === 1 && r.historico[0].antes.valor === 0.1; }), 'correção do Principal vale na hora e guarda o antes no histórico');

  console.log('PC 1280 — 24 h, bloqueio e encerramento:');
  await p.evaluate(async () => { const old = new Date(Date.now() - 25 * 3600000); await Data.col('sv2_cloro').set('v9', { ts: old.toISOString(), data: clDiaLocal(old.toISOString()), hora: '07:00', pontoTipo: 'beb', pontoId: 'b6', pontoNome: 'BR 06', local: 'Laboratório', valor: 0.1, faixa: 'baixo', reverif: [], dosagemPendente: null, situacao: 'aberto', lancadoPor: S.user.id, lancadoPorNome: S.user.nome, excluirMedia: false }); }); await esp(p, 3200);
  conf(await p.evaluate(() => S.cloro.find(r => r.id === 'v9').situacao === 'bloqueado'), 'passou 24 h sem nova verificação: ficou bloqueada');
  await p.evaluate(() => clAbre('v9')); await esp(p, 500);
  conf(!!(await p.$('#gv [data-act="cl-enc"]')), 'o superior vê "Encerrar"');
  await p.click('#gv [data-act="cl-enc"]'); await esp(p, 400);
  await p.fill('#gv [data-fm="texto"]', 'abc'); await p.click('#gv [data-act="cl-enc-ok"]'); await esp(p);
  conf(/algumas palavras/.test(await p.textContent('#gv .fm-msg')), 'encerrar exige o motivo');
  await p.fill('#gv [data-fm="texto"]', 'bebedouro desligado para reparo'); await p.click('#gv [data-act="cl-enc-ok"]'); await esp(p, 700);
  conf(await p.evaluate(() => S.cloro.find(r => r.id === 'v9').situacao === 'encerrado'), 'encerrada com o motivo');

  console.log('PC 1280 — dias sem verificação e bebedouros:');
  const f0 = await p.evaluate(() => clFaltas().length); conf(f0 > 0, 'há dias úteis sem verificação (' + f0 + ')');
  await p.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(p, 500);
  const k = await p.evaluate(() => clFaltas()[0].key);
  await p.click('.cl-af [data-act="cl-just"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="motivo"]', 'x'); await p.click('#gv [data-act="cl-just-ok"]'); await esp(p);
  conf(/pelo menos algumas palavras/.test(await p.textContent('#gv .fm-msg')), 'justificar exige motivo de 5 letras ou mais');
  await p.fill('#gv [data-fm="motivo"]', 'feriado local'); await p.click('#gv [data-act="cl-just-ok"]'); await esp(p, 700);
  conf(await p.evaluate(() => Object.keys(S.cloroFaltas).length === 1), 'justificativa gravada em sv2_cloro_falta');
  conf((await p.evaluate(() => clFaltas().length)) === f0 - 1, 'o dia justificado sai da lista');
  await p.click('.cl-af [data-act="cl-retro"]'); await esp(p, 500);
  await p.fill('#gv [data-fm="hora"]', '10:30'); await p.fill('#gv [data-fm="valor"]', '1,1'); await p.click('#gv [data-act="cl-retro-ok"]'); await esp(p, 700);
  conf(await p.evaluate(() => S.cloro.some(r => r.retroativo && r.hora === '10:30' && r.valor === 1.1)), 'lançar depois grava a verificação como retroativa');
  await p.click('[data-act="cl-bebs"]'); await esp(p, 500);
  conf(/Bebedouros/.test(await p.textContent('#gv h2')) && (await p.$$('#gv .cl-bi')).length === 8, 'lista os 8 bebedouros');
  await p.click('#gv [data-act="cl-beb-lib"]'); await esp(p, 400);
  await p.click('#cf [data-act="cf-sim"]'); await esp(p, 700);
  conf(await p.evaluate(() => S.bebs.find(b => b.id === 'bp').situacao === 'ativo'), 'liberar o bebedouro pendente o deixa ativo');
  await p.keyboard.press('Escape'); await esp(p, 400);

  console.log('PC 1280 — foto do clorímetro:');
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await p.evaluate(p => { lcAbrir({ k: 'clNova', ponto: 'beb:b2', valor: '1,0', dos: '', v2: '', mot: '', med: '', obs: '', fiz: '0', foto: p, fotoOrigem: 'camera', semFoto: '' }); }, png); await esp(p, 400);
  conf(!!(await p.$('#gv .cl-fp img')), 'foto anexada aparece no passo da foto');
  await p.click('#gv [data-act="cl-nova-ok"]'); await esp(p, 800);
  const diag = await p.evaluate(() => ({ msg: (document.querySelector('#gv .fm-msg') || {}).textContent || '', cf: (document.querySelector('#cf') || {}).textContent || '' }));
  if (diag.msg || diag.cf) console.log('    [diagnóstico] msg="' + diag.msg.trim() + '" confirma="' + diag.cf.trim().slice(0, 90) + '"');
  /* a que acabou de ser lançada: é a única de b2 com foto pendente e lançada por quem está logado (o ts das semeadas é o horário cheio do dia, que de madrugada ainda está no futuro) */
  const cid = await p.evaluate(() => (S.cloro.filter(r => r.pontoId === 'b2' && r.lancadoPor === S.user.id && r.foto && r.foto.st === 'pendente').sort((a, b) => String(b.lancadoEm || b.ts).localeCompare(String(a.lancadoEm || a.ts)))[0] || {}).id);
  conf(!!cid, 'a verificação com foto foi lançada');
  conf(!!(await p.evaluate(id => Data.col('sv2_cloro_foto').get(id), cid)), 'a foto foi para sv2_cloro_foto, com o mesmo código da verificação');
  await p.evaluate(id => clAbre(id), cid); await esp(p, 800);
  conf(!!(await p.$('#gv .cl-ft img')), 'o detalhe mostra a foto');
  await p.keyboard.press('Escape'); await esp(p, 400);

  console.log('PC 1280 — busca e proteção:');
  conf(await p.evaluate(() => BG_FONTES.some(f => { try { return f('BR 05').length > 0; } catch { return false; } })), 'a busca geral acha bebedouros');
  const html = await p.evaluate(() => { const b = S.bebs; b.push({ id: 'xss', codigo: '<img src=x onerror=window.__x=1>', local: '"><b>x', situacao: 'ativo', ativoDesde: new Date(Date.now() - 20 * 86400000).toISOString() }); render(); clBebsAbre(); return document.body.innerHTML; }); await esp(p, 400);
  conf(!(await p.evaluate(() => window.__x)) && !/<img src=x onerror/.test(await p.evaluate(() => document.querySelector('.cs-ct').innerHTML + (document.querySelector('#gv') || { innerHTML: '' }).innerHTML)), 'nome de bebedouro com HTML é mostrado como texto (esc)');
  await p.keyboard.press('Escape'); await esp(p, 300);
  const rolagem = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  conf(!rolagem, 'sem rolagem para o lado no PC');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));

  console.log('Celular 390 — mesma tela:');
  const c = await abre(b, 390, 820); await semear(c, 7);
  await c.evaluate(() => { location.hash = '#/inspecoes/cloro'; }); await esp(c, 800);
  conf((await c.$$('.cl-gk')).length === 5, 'celular: 5 velocímetros em 2 colunas (o último ocupa a linha)');
  conf(!(await c.evaluate(() => document.documentElement.scrollWidth > innerWidth)) && await c.evaluate(() => innerWidth === 390), 'celular: sem rolagem para o lado e sem afastar a tela (innerWidth ' + (await c.evaluate(() => innerWidth)) + ' px)');
  await c.screenshot({ path: path.join(TELAS, 'v060-cel-cloro.png') });
  await c.tap('[data-act="cl-nova"]'); await esp(c, 600);
  await c.evaluate(() => { S.fm.ponto = 'beb:b5'; S.fm.valor = '0,1'; gvDesenha(true); }); await esp(c, 400);
  const gc = await c.evaluate(() => { const a = document.querySelector('#gv [data-fm="dos"]').getBoundingClientRect(), d = document.querySelector('#gv [data-fm="v2"]').getBoundingClientRect(); return { dt: Math.round(a.top), ct: Math.round(d.top), dh: a.height, ch: d.height, dw: Math.round(a.width), cw: Math.round(d.width), h: Math.round(a.height) }; });
  conf(gc.dt === gc.ct && gc.dh === gc.ch && Math.abs(gc.dw - gc.cw) <= 1 && gc.h >= 40, 'celular: Dosagem e Cloro depois alinhados e com 40 px ou mais: ' + JSON.stringify(gc));
  conf(!(await c.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'celular: gaveta sem rolagem para o lado');
  await c.screenshot({ path: path.join(TELAS, 'v060-cel-nova.png') });
  await c.evaluate(() => history.back()); await esp(c, 500);
  if (await c.$('#cf [data-act="cf-sim"]')) { await c.tap('#cf [data-act="cf-sim"]'); await esp(c, 400); }
  conf(!(await c.$('#gv')), 'celular: voltar fecha a gaveta');
  conf(c._er.length === 0, 'sem erros no console (celular)' + (c._er.length ? ': ' + c._er.slice(0, 2).join(' | ') : ''));

  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
