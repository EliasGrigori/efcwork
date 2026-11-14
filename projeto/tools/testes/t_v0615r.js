/* EFCwork · suíte da v0.6.15 (rodízio) — regra do Elias de 14/11/2026: "a nova coleta precisa da aprovação do Líder ou do Principal".
   Liberação feita por quem não é Líder ★ nem Principal (o EFClaudian deixa o secundário liberar direto) fica pendente:
   a coleta já feita continua valendo até aprovar; aprovar/recusar no plano de coleta e no sino; nada é apagado.
   Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0615r.js */
const { chromium } = require('playwright');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
async function entra(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza' });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::|Failed to load/i.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await p.waitForTimeout(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => {
    const C = Data.col.bind(Data), ano = hojeISO().slice(0, 4), h = hojeISO();
    await C('sv2_users').set('giovane', { nome: 'Giovane Lima', login: 'giovane', perfil: 'secundario', estrela: false, atribuicoes: ['coletas'], superiorId: S.user.id });
    await C('sv2_users').set('marcos', { nome: 'Marcos Líder', login: 'marcos', perfil: 'secundario', estrela: true, atribuicoes: ['coletas'] });
    await C('sv2_cfg').set('coletas', { labs: ['IBRA'], fazendas: [{ prefixo: 'JD', numero: '01', nome: 'Fazenda Jardim' }] });
    for (const a of ['JD06', 'JD07', 'JD08']) await C('sv2_talhoes').set(a, { codigo: a, hectares: 3, cultura: 'MAMÃO', ativo: true });
    await C('sv2_rodizio').set('r1', { nome: 'FOLHA · anual · ' + ano, tipo: 'FOLHA', freq: 'A', ano: ano, ativo: true, inicio: '', prazo: '', criadoEm: ano + '-01-01T10:00:00.000Z', criadoPor: S.user.id, criadoPorNome: 'Joana Silva', areas: ['JD06', 'JD07', 'JD08'], analiseIds: [], fechados: {}, liberadas: {}, progs: {} });
    for (const [id, a] of [['c6', 'JD06'], ['c7', 'JD07'], ['c8', 'JD08']]) await C('sv2_coletas').set(id, { tipo: 'FOLHA', data: addDias(h, -10), talhao: a, analiseNome: 'Foliar', lab: 'IBRA', situacao: 'ativa', coletor: 'Equipe A', criadoEm: new Date(Date.now() - 10 * 864e5).toISOString() });
    const r = await C('sv2_rodizio').get('r1'), p = rzPeriodoDe(r, h), lib = {}, ts = n => new Date(Date.now() - n * 864e5).toISOString();
    lib[p.k] = { JD08: { por: 'Giovane Lima', motivo: 'Outro: amostra descartada', ts: ts(3), aprovadoPor: '' }, JD07: { por: 'Giovane Lima', motivo: 'Erro de envio', ts: ts(2), aprovadoPor: '' }, JD06: { por: 'Marcos Líder', motivo: 'Amostra perdida ou danificada', ts: ts(1), aprovadoPor: '' } };
    await C('sv2_rodizio').update('r1', { liberadas: lib });
  });
  await p.waitForTimeout(400);
  return p;
}
const estado = p => p.evaluate(() => { const r = S.rodizios.find(x => x.id === 'r1'), pr = rzPeriodoDe(r, hojeISO()), o = {}; ['JD06', 'JD07', 'JD08'].forEach(a => { o[a] = { sit: rzLibSit(rzLibBruta(r, pr, a)), cols: rzColetasDe(r, pr, a).length, vale: !!rzLib(r, pr, a) }; }); return o; });

(async () => {
  const b = await chromium.launch();
  console.log('Regra: quem liberou decide se vale');
  const p = await entra(b, 1280, 860);
  let e = await estado(p);
  conf(e.JD08.sit === 'pendente' && !e.JD08.vale && e.JD08.cols === 1, 'JD08 pedida por secundário sem ★: pendente, a coleta anterior continua valendo');
  conf(e.JD07.sit === 'pendente' && e.JD07.cols === 1, 'JD07 também pendente');
  conf(e.JD06.sit === 'valida' && e.JD06.vale && e.JD06.cols === 0, 'JD06 liberada por Líder ★: vale na hora, a coleta anterior deixa de contar');
  conf(/ainda espera a aprovação do Líder ★ ou do Principal/.test(await p.evaluate(() => rzBarrar('FOLHA', 'JD08', hojeISO()))), 'lançar coleta em JD08 é barrado com o aviso de que espera aprovação');
  conf(await p.evaluate(() => rzBarrar('FOLHA', 'JD06', hojeISO())) === '', 'em JD06 (aprovada) a nova coleta pode ser lançada');

  console.log('Programação e plano mostram o pendente');
  await p.evaluate(() => { location.hash = '#/coletas/programacao'; }); await p.waitForTimeout(700);
  const pg = await p.evaluate(() => { const a = [...document.querySelectorAll('.pg-ar')].find(x => /JD08/.test(x.getAttribute('title') || '')); return a ? { t: a.getAttribute('title'), pend: !!a.querySelector('.pg-rec.pend') } : null; });
  conf(!!pg && pg.pend && /aguardando a aprovação/.test(pg.t) && /Giovane Lima/.test(pg.t), 'cartão do plano: JD08 com a marca de espera e quem pediu');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(700);
  conf(await p.evaluate(() => !!document.querySelector('.pp-rc.pend')), 'página do plano: área com a marca de espera');
  await p.click('[data-act="pp-aba"][data-v="aj"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => document.querySelectorAll('.pp-lp').length) === 2, 'Ajustes › Recoletas lista as 2 pendentes');
  const bts = await p.evaluate(() => { const l = document.querySelectorAll('.pp-lp')[0].querySelectorAll('.pp-lpb .bt'); return [...l].map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)]; }); });
  conf(bts.length === 2 && bts[0][0] === bts[1][0] && bts[0][1] === bts[1][1] && bts[0][1] >= 32, 'Recusar e Aprovar na mesma linha e altura (' + JSON.stringify(bts) + ')');

  console.log('Sino do Principal');
  const n0 = await p.evaluate(() => snConta());
  await p.click('[data-act="cs-sino"]'); await p.waitForTimeout(500);
  conf(/Novas coletas para aprovar · 2/.test(await p.textContent('#gv')), 'o sino mostra "Novas coletas para aprovar · 2"');
  await p.click('#gv [data-act="sn-lib-ok"]'); await p.waitForTimeout(600);
  e = await estado(p);
  conf(e.JD08.sit === 'valida' && e.JD08.vale && e.JD08.cols === 0, 'aprovar no sino: JD08 vale e a coleta anterior deixa de contar');
  const l8 = await p.evaluate(() => { const r = S.rodizios.find(x => x.id === 'r1'), pr = rzPeriodoDe(r, hojeISO()); return rzLibBruta(r, pr, 'JD08'); });
  conf(l8.aprovadoPor === 'Joana Silva' && !!l8.aprovadoEm && l8.motivo === 'Outro: amostra descartada' && l8.por === 'Giovane Lima', 'grava quem aprovou e quando; pedido original intacto');
  conf(await p.evaluate(n0 => snConta() === n0 - 1, n0), 'o número do sino baixa 1');
  const nt = await p.evaluate(async () => JSON.parse(Store.get('sv2demo_sv2_notifs') || '[]').filter(n => Array.isArray(n.para) && n.para.indexOf('giovane') >= 0 && /JD08 aprovada/.test(n.titulo)).length);
  conf(nt === 1, 'quem pediu recebe o aviso "Nova coleta de JD08 aprovada"');
  conf(await p.evaluate(async () => JSON.parse(Store.get('sv2demo_sv2_audit') || '[]').some(x => x.acao === 'aprovar_recoleta_rodizio')), 'fica no registro de atividade');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);

  console.log('Recusar no plano');
  await p.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await p.waitForTimeout(500);
  await p.click('.pp-lp [data-act="pp-lib-rep"]'); await p.waitForTimeout(300);
  await p.click('.pp-lp [data-act="pp-lib-rep-ok"]'); await p.waitForTimeout(400);
  conf((await estado(p)).JD07.sit === 'pendente', 'sem motivo não recusa');
  await p.fill('#pp-lp-mot', 'Coleta de JD07 está boa'); await p.click('.pp-lp [data-act="pp-lib-rep-ok"]'); await p.waitForTimeout(600);
  e = await estado(p);
  conf(e.JD07.sit === 'recusada' && !e.JD07.vale && e.JD07.cols === 1, 'recusada: não vale e a coleta anterior continua contando');
  conf(await p.evaluate(() => !document.querySelector('.pp-lp') && /recusada: Coleta de JD07 está boa/.test(document.querySelector('.pp-tb').textContent)), 'some dos pendentes e fica no histórico como recusada, com o motivo');
  conf(await p.evaluate(() => snLibP().length === 0), 'o sino não tem mais nada para aprovar');

  console.log('Liberar direto (Principal) grava quem liberou');
  await p.evaluate(async () => { const r = S.rodizios.find(x => x.id === 'r1'), pr = rzPeriodoDe(r, hojeISO()); await ppRecGrava({ rid: 'r1', pk: pr.k, area: 'JD07', motivo: 'Laudo com resultado estranho' }, null); });
  await p.waitForTimeout(400);
  const l7 = await p.evaluate(() => { const r = S.rodizios.find(x => x.id === 'r1'), pr = rzPeriodoDe(r, hojeISO()); const l = rzLibBruta(r, pr, 'JD07'); return Object.assign({ sit: rzLibSit(l), eu: S.user.id }, l); });
  conf(l7.porSup === true && l7.porId === l7.eu && l7.sit === 'valida', 'liberação do Principal grava porId e porSup e vale na hora');

  console.log('Colaborador vê a espera, sem os botões');
  await p.evaluate(async () => { const r = S.rodizios.find(x => x.id === 'r1'), pr = rzPeriodoDe(r, hojeISO()); const up = {}; up['liberadas.' + pr.k + '.JD06'] = { por: 'Giovane Lima', motivo: 'Erro de envio', ts: new Date().toISOString(), aprovadoPor: '' }; await Data.col('sv2_rodizio').update('r1', up); });
  await p.evaluate(() => { S.user.perfil = 'secundario'; S.user.estrela = false; render(); }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => document.querySelectorAll('.pp-lp').length === 1 && !document.querySelector('.pp-lp .bt')), 'o pedido aparece, mas sem Aprovar/Recusar');
  conf(await p.evaluate(() => snLibP().length === 0), 'e não entra no sino dele');
  conf(p._er.length === 0, 'sem erro de JavaScript no PC' + (p._er.length ? ': ' + p._er[0] : ''));
  await p.context().close();

  console.log('Celular');
  const c = await entra(b, 390, 844);
  await c.evaluate(() => { location.hash = '#/coletas/plano/r1'; }); await c.waitForTimeout(600);
  await c.click('[data-act="pp-aba"][data-v="aj"]'); await c.waitForTimeout(400);
  const cb = await c.evaluate(() => [...document.querySelectorAll('.pp-lp')[0].querySelectorAll('.pp-lpb .bt')].map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), Math.round(r.width)]; }));
  conf(cb.length === 2 && cb[0][0] === cb[1][0] && cb[0][1] >= 44 && Math.abs(cb[0][2] - cb[1][2]) <= 1, 'Recusar e Aprovar: mesma linha, 44 px e mesma largura (' + JSON.stringify(cb) + ')');
  conf(await c.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nada rola para o lado');
  conf(c._er.length === 0, 'sem erro de JavaScript no celular');
  await c.context().close();
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas');
  process.exit(falhas ? 1 : 0);
})();
