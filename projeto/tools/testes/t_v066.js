/* EFCwork · suíte da v0.6.6 — Coletas › Água: ação corretiva (abrir, etapas com fotos, concluir, fotos eliminadas em 7 dias, PDF) e relatório por local. ?demo=1
   Uso: node tools/testes/t_v066.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const semear = require('./ag_semente.js');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const TELAS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const FOTO = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#8fa5b4"/><circle cx="160" cy="120" r="60" fill="#5f6b77"/></svg>').toString('base64');
async function abre(b, w, h) {
  const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel })).newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  await p.evaluate(() => { window.print = () => { window._imprimiu = (window._imprimiu || 0) + 1; }; location.hash = '#/coletas/agua'; }); await esp(p, 300);
  await semear(p);
  await p.evaluate(async F => {
    const C = Data.col.bind(Data), ts = new Date().toISOString(), d = n => addDias(hojeISO(), n);
    await C('sv2_users').set('u2', { nome: 'Marcelo Bruno', login: 'marcelo.bruno', perfil: 'secundario', cargo: 'Encarregado', bloqueado: false, criadoEm: ts });
    const base = { hora: '07:30', semana: 44, analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, coletor: 'Joana Silva', lab: 'Aqualab', os: '', numSolicitacao: '', obs: '', situacao: 'ativa', canceladaMotivo: '', valor: 85, compra: 'pendente', criadoEm: ts, criadoPor: 'x', criadoPorNome: 'Joana Silva' };
    await C('sv2_aguacol').set('g8', Object.assign({}, base, { data: d(-6), tipoColeta: 'rodizio', rodada: 'R3', pontoRef: 'beb:b2', pontoNome: 'BR 02 — Packing House', bebIds: ['b2'], envio: d(-5), resultado: 'NÃO CONFORME', agente: ['ecoli'], gravidade: 'leve', laudoEm: d(-3) }));
    await C('sv2_agua_foto').set('af1', { coletaId: 'g9', dataUrl: F, criadoEm: ts, porId: 'x' });
    await C('sv2_agua_foto').set('af2', { coletaId: 'g9', dataUrl: F, criadoEm: ts, porId: 'x' });
    const conc = new Date(Date.now() - 10 * 864e5).toISOString();
    await C('sv2_aguacol').set('g9', Object.assign({}, base, { data: d(-30), tipoColeta: 'avulsa', pontoRef: 'ponto:pt1', pontoNome: 'Poço 01 — Fazenda Jardim', bebIds: [], envio: d(-29), resultado: 'NÃO CONFORME', agente: ['coliformes'], gravidade: 'grave', laudoEm: d(-25),
      acao: { responsavelId: 'u2', responsavelNome: 'Marcelo Bruno', prazo: d(-15), orientacao: 'Clorar o poço e trocar a tampa', abertaPor: 'x', abertaPorNome: 'Joana Silva', abertaEm: conc, etapas: [{ ts: conc, porId: 'u2', porNome: 'Marcelo Bruno', texto: 'Poço clorado e tampa trocada', fotos: ['af1', 'af2'], final: true }], concluida: true, concluidaEm: conc, concluidaPor: 'u2', concluidaPorNome: 'Marcelo Bruno' } }));
  }, FOTO);
  await esp(p, 900);
  return p;
}

(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);

  console.log('Fotos vencidas (7 dias depois da conclusão):');
  await esp(p, 3200);
  const g9 = await p.evaluate(async () => (await Data.col('sv2_aguacol').get('g9')).acao);
  const f1 = await p.evaluate(async () => await Data.col('sv2_agua_foto').get('af1'));
  conf(!!g9.fotosApagadas && f1.dataUrl === '' && !!f1.apagadaEm, 'ação concluída há 10 dias: fotos eliminadas (dataUrl vazio) e marcado fotosApagadas');
  conf(g9.etapas[0].texto === 'Poço clorado e tampa trocada', 'o texto da etapa continua');
  const lg = await p.evaluate(async () => (await Data.col('sv2_audit').all()).some(a => a.acao === 'eliminar_fotos_acao_agua'));
  conf(lg, 'fica registrado no histórico');

  console.log('Abrir ação corretiva (coleta não conforme sem ação):');
  await p.click('.tb-t tbody tr[data-id="g8"]'); await esp(p, 500);
  conf(!!(await p.$('#gv .ac-abrir[data-act="ac-nova"]')), 'detalhe mostra, na seção Ação corretiva, o botão Abrir ação corretiva');
await p.screenshot({ path: path.join(TELAS, 'v066-pc-coleta.png') }); 
  await p.click('#gv [data-act="ac-nova"]'); await esp(p, 500);
  conf(/Abrir ação corretiva/.test(await p.textContent('#gv')) && /E\. coli/.test(await p.textContent('#gv')), 'formulário com o agente encontrado');
  await p.click('#gv [data-act="ac-nova-ok"]'); await esp(p, 300);
  conf(/responsável/.test(await p.textContent('#gv .fm-msg')), 'sem responsável: pede o responsável');
  await p.evaluate(() => { S.fm.resp = 'u2'; S.fm.prazo = addDias(hojeISO(), -1); gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="ac-nova-ok"]'); await esp(p, 300);
  conf(/prazo/.test(await p.textContent('#gv .fm-msg')), 'prazo no passado é recusado');
  await p.evaluate(() => { S.fm.prazo = addDias(hojeISO(), 5); gvDesenha(true); }); await esp(p, 200);
  await p.fill('#gv [data-fm="orient"]', 'abc'); await p.click('#gv [data-act="ac-nova-ok"]'); await esp(p, 300);
  conf(/precisa ser feito/.test(await p.textContent('#gv .fm-msg')), 'sem o que fazer: pede o texto');
  await p.fill('#gv [data-fm="orient"]', 'Desativar o BR 02, higienizar e trocar o filtro'); await p.evaluate(() => { S.fm.orient = 'Desativar o BR 02, higienizar e trocar o filtro'; gvDesenha(true); }); await esp(p, 200); await p.screenshot({ path: path.join(TELAS, 'v066-pc-abrir.png') }); await p.click('#gv [data-act="ac-nova-ok"]'); await esp(p, 700);
  const a8 = await p.evaluate(async () => (await Data.col('sv2_aguacol').get('g8')).acao);
  conf(a8 && a8.responsavelId === 'u2' && a8.responsavelNome === 'Marcelo Bruno' && a8.prazo && /filtro/.test(a8.orientacao) && a8.concluida === false && a8.etapas.length === 0 && a8.abertaPorNome === 'Joana Silva', 'gravou a ação na coleta (mesmo formato do EFClaudian)');
  const n8 = await p.evaluate(async () => (await Data.col('sv2_notifs').all()).filter(n => n.refTipo === 'agua_acao' && n.refId === 'g8'));
  conf(n8.length === 1 && (n8[0].para || []).indexOf('u2') >= 0, 'avisou o responsável');
  conf(/Ação corretiva/.test(await p.textContent('#gv')) && /Tratativas \(0\)/.test(await p.textContent('#gv')) && /Ação aberta/.test(await p.textContent('#gv')), 'depois de abrir, mostra a ação (Tratativas 0, Ação aberta)');

  console.log('Etapas com fotos e concluir:');
  await p.click('#gv [data-act="ac-etapa"]'); await esp(p, 400);
  conf(/Registrar a etapa 1/.test(await p.textContent('#gv')), 'formulário Registrar a etapa 1');
  await p.click('#gv [data-act="ac-et-ok"]'); await esp(p, 300);
  conf(/O que foi feito|5 letras/.test(await p.textContent('#gv .fm-msg')), 'etapa sem texto é recusada');
  await p.evaluate(F => { S.fm.fotos = [F, F]; S.fm.mk = [{ base: F, marcas: [{ t: 'c', cor: '#E53935', esp: 6, x1: 10, y1: 10, x2: 90, y2: 90 }], por: 'Joana Silva', em: new Date().toISOString() }, null]; gvDesenha(true); }, FOTO); await esp(p, 300);
  conf((await p.$$('#gv .ap-ft')).length === 2 && /Marcas · 1/.test(await p.textContent('#gv')), 'duas fotos, a primeira com marca (Marcas · 1)');
  await p.fill('#gv [data-fm="texto"]', 'Bebedouro desativado e higienizado'); await p.screenshot({ path: path.join(TELAS, 'v066-pc-etapa.png') }); await p.click('#gv [data-act="ac-et-ok"]'); await esp(p, 800);
  const a8b = await p.evaluate(async () => (await Data.col('sv2_aguacol').get('g8')).acao);
  conf(a8b.etapas.length === 1 && a8b.etapas[0].fotos.length === 2 && a8b.etapas[0].porNome === 'Joana Silva' && !a8b.etapas[0].final, 'gravou a etapa com 2 fotos');
  const ff = await p.evaluate(async id => await Data.col('sv2_agua_foto').get(id), a8b.etapas[0].fotos[0]);
  conf(ff && ff.coletaId === 'g8' && ff.dataUrl && ff.base && ff.marcas.length === 1 && ff.marcadoPor === 'Joana Silva', 'a foto marcada guarda a original e as marcas (sv2_agua_foto)');
  conf((await p.$$('#gv .ac-th')).length === 2 && /Tratativas \(1\)/.test(await p.textContent('#gv')), 'a gaveta mostra a etapa com as 2 miniaturas');
await p.screenshot({ path: path.join(TELAS, 'v066-pc-acao.png') }); 
  await p.click('#gv .ac-th'); await esp(p, 500);
  conf(!!(await p.$('#fed-v')), 'tocar na foto abre a foto grande');
  await p.keyboard.press('Escape'); await esp(p, 400);
  conf(!(await p.$('#fed-v')) && !!(await p.$('#gv')), 'Esc fecha só a foto grande');
  await p.click('#gv [data-act="ac-concluir"]'); await esp(p, 400);
  conf(/Concluir a ação/.test(await p.textContent('#gv')), 'formulário Concluir a ação');
  await p.fill('#gv [data-fm="texto"]', 'Recoleta conforme, bebedouro liberado'); await p.click('#gv [data-act="ac-et-ok"]'); await esp(p, 800);
  const a8c = await p.evaluate(async () => (await Data.col('sv2_aguacol').get('g8')).acao);
  conf(a8c.concluida && a8c.concluidaPorNome === 'Joana Silva' && a8c.etapas.length === 2 && a8c.etapas[1].final, 'concluiu com a etapa final (Conclusão)');
  const gvt = await p.textContent('#gv');
  conf(/Ação concluída/.test(gvt) && /Fotos até/.test(gvt) && !(await p.$('#gv [data-act="ac-etapa"]')), 'mostra Ação concluída, o aviso "Fotos até" e some Registrar etapa');
  conf(!(await p.evaluate(() => agAcAbertas().some(c => c.id === 'g8'))), 'a ação concluída sai do acompanhamento');
  await p.screenshot({ path: path.join(TELAS, 'v066-pc-concluida.png') }); 

  console.log('PDF da ação:');
  await p.click('#gv [data-act="ac-pdf"]'); await esp(p, 600);
  const imp = await p.evaluate(() => ({ h: (document.querySelector('#au-imp') || {}).innerHTML || '', n: window._imprimiu || 0 }));
  conf(imp.n >= 1 && /Ação corretiva · água/.test(imp.h) && /Tratativas/.test(imp.h) && /Conclusão/.test(imp.h) && (imp.h.match(/<img /g) || []).length === 2, 'imprime a ação com as tratativas e as 2 fotos');
  conf(!(await p.$('#ag-page')), 'o A4 deitado vale só durante a impressão');
  await p.keyboard.press('Escape'); await esp(p, 400);

  console.log('Detalhe da coleta mostra a ação; sino abre a ação:');
  await p.click('.tb-t tbody tr[data-id="g9"]'); await esp(p, 500);
  conf(!!(await p.$('#gv .ac-res')) && /Marcelo Bruno/.test(await p.textContent('#gv .ac-res')), 'a coleta mostra o cartão da ação');
  await p.click('#gv .ac-res'); await esp(p, 500);
  conf(/foto\(s\) eliminada\(s\)/.test(await p.textContent('#gv')), 'na ação antiga aparece "2 foto(s) eliminada(s)"');
  await p.keyboard.press('Escape'); await esp(p, 300); await p.keyboard.press('Escape'); await esp(p, 300);
  await p.evaluate(() => Notif.send({ nivel: 'aviso', titulo: 'Ação corretiva para você: teste', texto: 't', para: [S.user.id], refTipo: 'agua_acao', refId: 'g9' })); await esp(p, 600);
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 300);
  await p.evaluate(() => snAbrir()); await esp(p, 500);
  const nb = await p.$('[data-act="sn-abre"]');
  if (nb) { await nb.click(); await esp(p, 600); }
  conf(!!(await p.$('#gv')) && /Ação corretiva/.test(await p.textContent('#gv')), 'o aviso do sino abre a ação direto, de qualquer tela');
  await p.keyboard.press('Escape'); await esp(p, 300);

  console.log('Relatório de água por local:');
  await p.evaluate(() => { location.hash = '#/coletas/agua'; }); await esp(p, 500);
  await p.click('[data-act="agr-abre"]'); await esp(p, 400);
  await p.screenshot({ path: path.join(TELAS, 'v066-pc-relform.png') }); 
  conf(/Relatório de água por local/.test(await p.textContent('#gv')) && /coleta\(s\) no período/.test(await p.textContent('#gv')), 'formulário com período e a contagem');
  await p.evaluate(() => { S.fm.de = hojeISO(); S.fm.ate = addDias(hojeISO(), -5); gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="agr-ok"]'); await esp(p, 300);
  conf(/Confira o período/.test(await p.textContent('#gv .fm-msg')), 'período invertido é recusado');
  await p.evaluate(() => { S.fm.de = addDias(hojeISO(), -60); S.fm.ate = hojeISO(); gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="agr-ok"]'); await esp(p, 600);
  const rel = await p.evaluate(() => (document.querySelector('#au-imp') || {}).innerHTML || '');
  conf(/Água por local/.test(rel) && /Resumo por local/.test(rel) && /Total/.test(rel) && /Mesclada \(todos os bebedouros\)/.test(rel) && /CX 01/.test(rel), 'gera o relatório com o resumo por local, o total e cada local');
  conf(!/Lançada por engano/.test(rel) && !/BR 05 — Almoxarifado<\/h3>/.test(rel), 'coleta cancelada fica fora');
  await p.click('[data-act="agr-abre"]'); await esp(p, 400);
  await p.evaluate(() => { S.fm.de = addDias(hojeISO(), -60); S.fm.ate = hojeISO(); S.fm.av = '0'; gvDesenha(true); }); await esp(p, 200);
  await p.click('#gv [data-act="agr-ok"]'); await esp(p, 600);
  const rel2 = await p.evaluate(() => (document.querySelector('#au-imp') || {}).innerHTML || '');
  conf(!/CX 01/.test(rel2) && !/Poço 01/.test(rel2) && /sem as avulsas/.test(rel2), 'sem as avulsas: caixas e poços ficam fora');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  await p.context().close();

  console.log('Celular (390):');
  const m = await abre(b, 390, 800);
  await m.click('.tb-t tbody tr[data-id="g8"]'); await esp(m, 500);
  const rod = await m.evaluate(() => { const r = document.querySelector('#gv .gv-pe, #gv footer, #gv .gv-rod'); const bs = [...document.querySelectorAll('#gv [data-act^="ag-"].bt, #gv [data-act^="ac-"].bt')].filter(x => x.offsetParent && x.closest('.gv-pe, footer, .gv-rod')); return { h: bs.map(x => Math.round(x.getBoundingClientRect().height)), dentro: bs.every(x => x.getBoundingClientRect().right <= innerWidth + 1 && x.getBoundingClientRect().left >= -1) }; });
  conf(rod.h.length === 2 && rod.h.every(h => h >= 44) && rod.dentro, 'detalhe da coleta: 2 botões no rodapé numa linha, 44 px (' + rod.h.join(', ') + ')');
  conf(await m.evaluate(() => { const b = document.querySelector('#gv .ac-abrir'); return b && b.getBoundingClientRect().height >= 44; }), 'Abrir ação corretiva fica na seção da ação, com 44 px');
  await m.screenshot({ path: path.join(TELAS, 'v066-cel-coleta.png') });
  await m.click('#gv [data-act="ac-nova"]'); await esp(m, 500);
  conf(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'formulário Abrir ação não arrasta para o lado');
  await m.screenshot({ path: path.join(TELAS, 'v066-cel-abrir.png') });
  await m.keyboard.press('Escape'); await esp(m, 300); await m.keyboard.press('Escape'); await esp(m, 300);
  await m.click('.tb-t tbody tr[data-id="g9"]'); await esp(m, 500); await m.click('#gv .ac-res'); await esp(m, 500);
  conf(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'a ação no celular não arrasta para o lado');
  await m.screenshot({ path: path.join(TELAS, 'v066-cel-acao.png') });
  conf(m._er.length === 0, 'sem erros no console (celular)');
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
