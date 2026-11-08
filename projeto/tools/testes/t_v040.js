/* EFCwork · suíte da v0.4.0 — Coletas: amostras numa tabela só (material no filtro), ciclo da amostra com o fluido Gota
   (Programada → Coletada → Enviada → O.S → Laudo/Compra na ordem em que aconteceram), prazo do laboratório com atraso, Enviar (remessa)
   com NF, cupom (foto) e rastreio, data retroativa pedida ao líder, remessas, O.S (informar e corrigir), laudo recebido, busca geral,
   celular. Modo demonstração. Uso: node tools/testes/t_v040.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const dd = async (p, nome, txt) => { await p.click('[data-dd="' + nome + '"] .dd-b'); await p.click('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); await p.waitForTimeout(80); };
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const titulo = p => p.evaluate(() => { const h = document.querySelector('#gv h2'); return h ? h.textContent : ''; });
const volta = async p => { await p.evaluate(() => history.back()); await p.waitForTimeout(250); };
const esc = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(250); };
async function arrasta(p, nome, txt) {
  await p.click('[data-dd="' + nome + '"] .dd-b'); await p.waitForTimeout(80);
  const li = await p.$('[data-dd="' + nome + '"] li:has-text("' + txt + '")'); const b = await li.boundingBox();
  await p.mouse.move(b.x + 20, b.y + b.height / 2); await p.mouse.down(); await p.waitForTimeout(1650);
  const lx = await p.$('.dd-lixo'); if (!lx) { await p.mouse.up(); return false; }
  const r = await lx.boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(200); return r;
}
async function entra(p, login) { await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300); await p.fill('#en-login', login); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700); }
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
async function semear(p) {
  await p.evaluate(async () => {
    const h = hojeISO(), d = n => addDias(h, n), C = Data.col.bind(Data), me = S.user;
    await C('sv2_cfg').set('coletas', { labs: ['IBRA', 'BIOAGRI'], labPrazo: { IBRA: 10 } });
    await C('sv2_prog').set('p1', { data: d(-5), talhao: 'RU11TAI24', tipo: 'SOLO+RAIZ', coletor: 'Equipe A', situacao: 'pendente', criadoPorNome: 'Joana Silva' });
    const base = { situacao: 'ativa', criadoEm: nowISO(), criadoPor: me.id, criadoPorNome: 'Joana Silva', valor: 120 };
    const col = (id, o) => C('sv2_coletas').set(id, Object.assign({}, base, o));
    await col('c1', { tipo: 'SOLO', data: d(-3), talhao: 'RU11TAI24', analiseNome: 'Solo completo', sigla: 'SC', lab: 'IBRA', pontos: 20, prof: '0-20', coletor: 'Equipe A', progId: 'p1' });
    await col('c2', { tipo: 'NEMATOIDE', data: d(-3), talhao: 'RU11TAI24', analiseNome: 'Nematoide', sigla: 'NEM', lab: 'BIOAGRI', progId: 'p1' });
    await col('c3', { tipo: 'FOLHA', data: d(-22), talhao: 'RU12TAI24', analiseNome: 'Foliar', sigla: 'FOL', lab: 'IBRA', enviado: true, envio: d(-20) });
    await col('c4', { tipo: 'FOLHA', data: d(-22), talhao: 'RU13TAI24', analiseNome: 'Foliar', sigla: 'FOL', lab: 'IBRA', enviado: true, envio: d(-20), laudo: true, laudoEm: d(-6) + 'T10:00:00.000Z', laudoPor: 'Joana Silva' });
    await col('c5', { tipo: 'FRUTA', data: d(-3), talhao: 'RU14TAI25', identificacao: 'Lote 7', analiseNome: 'Resíduos', sigla: 'RES', lab: 'BIOAGRI', enviado: true, envio: d(-2), os: 'OS-55' });
    await col('c6', { tipo: 'COMPOSTO', data: d(-60), loteComp: 'LC-01', analiseNome: 'Composto', sigla: 'CMP', lab: 'IBRA', enviado: true, envio: d(-58), os: 'OS-10', laudo: true, laudoEm: d(-30) + 'T10:00:00.000Z', laudoPor: 'Joana Silva', compra: 'solicitado', pedidoSankhya: '4471', dataSolicitacao: d(-40), solicitadoPorNome: 'Joana Silva' });
    await col('c7', { tipo: 'SOLO', data: d(-10), talhao: 'RU17TAI25', analiseNome: 'Solo completo', lab: 'IBRA', situacao: 'cancelada', canceladaMotivo: 'área replantada' });
    const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await C('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [me.id], atrib: { coletas: true } });
  });
  await p.waitForTimeout(300);
}
async function primeiro(p) { await p.goto(URL); await p.waitForTimeout(400); await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600); await semear(p); }
const col = (p, id) => p.evaluate(i => JSON.parse(JSON.stringify(S.coletas.find(x => x.id === i))), id);
const etapas = p => p.$$eval('#gv .cb-tl > li', l => l.map(x => (x.classList.contains('ok') ? '+' : x.classList.contains('at') ? '>' : '-') + x.querySelector('b').firstChild.textContent.trim()).join('|'));
const abre = async (p, id) => { await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(150); await p.click('.tb-t tbody tr[data-id="' + id + '"]'); await p.waitForTimeout(300); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await primeiro(p);

  console.log('— Amostras');
  await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(250);
  conf((await p.$$('.tb-t tbody tr[data-id]')).length === 7, 'uma tabela só com as 7 amostras de campo (todos os materiais)');
  const meta = await p.textContent('.cs-meta');
  conf(/2 não enviadas/.test(meta) && /1 aguardando laudo/.test(meta) && /1 laudo atrasado/.test(meta), 'cabeçalho: 2 não enviadas, 1 aguardando laudo, 1 laudo atrasado (' + meta + ')');
  const sit = await p.evaluate(() => ['c1', 'c3', 'c4', 'c5', 'c6', 'c7'].map(i => coSit(S.coletas.find(x => x.id === i)).txt).join(','));
  conf(sit === 'Não enviada,Laudo atrasado,Laudo baixado,Aguardando laudo,Encerrada,Cancelada', 'situações calculadas como no EFClaudian (' + sit + ')');
  conf(await p.evaluate(() => coLaudoLimite(S.coletas.find(x => x.id === 'c3')) === 15 && coLaudoLimite(S.coletas.find(x => x.id === 'c5')) === 12), 'prazo do laboratório da configuração (IBRA 10 dias) + 5 de folga; sem prazo = 7 + 5');
  await p.click('[data-tb="co-am"] .tb-cab th[data-tbk="mat"] .tb-hm'); await p.waitForTimeout(120); await dd(p, 'tbf:co-am:mat', 'Folha'); await p.waitForTimeout(150); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  conf((await p.$$('.tb-t tbody tr[data-id]')).length === 2, 'filtro único: Material = Folha → 2');
  await p.click('[data-act="tb-limpa"]'); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-amostras.png') });

  console.log('— Ciclo da amostra');
  await abre(p, 'c1');
  conf(await etapas(p) === '+Programada|+Coletada|>Enviada|-O.S|-Laudo|-Compra do serviço', 'ciclo: Programada → Coletada → Enviada (próxima) → O.S → Laudo → Compra (' + await etapas(p) + ')');
  conf(/Equipe A/.test(await p.textContent('#gv .cb-tl li:nth-child(1)')) && /20 pontos/.test(await p.textContent('#gv .cb-tl li:nth-child(2)')), 'a programação mostra o coletor; a coleta mostra pontos, profundidade e coletor');
  conf(await p.evaluate(() => !!document.querySelector('#gv .cb-tlw[data-cbtl="col-c1"]')), 'mesma linha do tempo com fluido Gota da calibração (guarda até onde cada um viu)');
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-ciclo.png') });
  await abre(p, 'c6');
  conf(await etapas(p) === '+Coletada|+Enviada|+O.S|+Compra do serviço|+Laudo', 'encerrada: a compra (antes) aparece antes do laudo — na ordem em que aconteceram');
  await abre(p, 'c3');
  conf(/atrasado/.test(await p.textContent('#gv .cb-alerta')) && /previsto até/.test(await p.textContent('#gv .cb-tl')), 'laudo atrasado: "previsto até …" e o aviso em vermelho');
  await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-atrasado.png') });

  console.log('— Enviar');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(250);
  await p.click('.cs-acts [data-act="co-env"]'); await p.waitForTimeout(200);
  conf((await p.$$('#gv [data-act="co-ck"]')).length === 2, 'Enviar lista as 2 não enviadas (sem as canceladas e as já enviadas)');
  await p.click('[data-act="co-env-ok"]'); await p.waitForTimeout(100);
  conf(/Marque pelo menos/.test(await msg(p)), 'sem marcar: "Marque pelo menos uma amostra"');
  await p.click('#gv [data-act="co-todas"]'); await p.waitForTimeout(100);
  conf(/2 marcada/.test(await p.textContent('#co-n')) && /BIOAGRI: 1 · IBRA: 1 — cada laboratório vira uma remessa/.test(await p.textContent('#gv')), 'marcar todas: 2, e avisa que cada laboratório vira uma remessa');
  const ontem4 = await p.evaluate(() => addDias(hojeISO(), -4));
  await p.fill('#gv [data-fm="data"]', ontem4); await p.dispatchEvent('#gv [data-fm="data"]', 'change'); await p.waitForTimeout(100); await p.click('[data-act="co-env-ok"]'); await p.waitForTimeout(100);
  conf(/antes da coleta/.test(await msg(p)), 'envio antes da data da coleta: recusado');
  await p.fill('#gv [data-fm="data"]', await p.evaluate(() => addDias(hojeISO(), 31))); await p.dispatchEvent('#gv [data-fm="data"]', 'change'); await p.waitForTimeout(100); await p.click('[data-act="co-env-ok"]'); await p.waitForTimeout(100);
  conf(/30 dias à frente/.test(await msg(p)), 'mais de 30 dias à frente: recusado (regra do EFClaudian)');
  await p.fill('#gv [data-fm="data"]', await p.evaluate(() => hojeISO())); await p.dispatchEvent('#gv [data-fm="data"]', 'change'); await p.waitForTimeout(100);
  await p.fill('#gv [data-fm="nf"]', '18342'); await p.fill('#gv [data-fm="rastreio"]', 'ab 123456789 br');
  await p.setInputFiles('#gv [data-cofile]', { name: 'cupom.png', mimeType: 'image/png', buffer: PNG }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => /^data:image\/jpeg/.test(S.fm.cupom) && !!document.querySelector('#gv .co-cupf img')), 'a foto do cupom entra reduzida (JPEG) e aparece no formulário');
  await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-enviar.png') });
  await p.click('[data-act="co-env-ok"]'); await p.waitForTimeout(600);
  const c1 = await col(p, 'c1'), c2 = await col(p, 'c2'), hoje = await p.evaluate(() => hojeISO());
  conf(c1.enviado && c1.envio === hoje && c1.lab === 'IBRA' && c2.lab === 'BIOAGRI' && c1.nfEnvio === '18342' && c1.rastreio === 'AB123456789BR', 'enviadas: data, laboratório de cada uma, NF e rastreio (arrumado em maiúsculas)');
  const foto = await p.evaluate(async id => { const d = await Data.col('sv2_fotos').get(id); return d && d.refTipo + '|' + d.papel + '|' + d.refIds.slice().sort().join(',') + '|' + (d.dataUrl.length < 400000); }, c1.cupomFoto);
  conf(c1.cupomFoto && c1.cupomFoto === c2.cupomFoto && foto === 'coleta_envio|cupom|c1,c2|true', 'o cupom vai para sv2_fotos (como as fotos do EFClaudian) e as duas amostras apontam para ele');
  await abre(p, 'c1');
  conf(/AB123456789BR/.test(await p.textContent('#gv .co-anx')) && (await p.$$('#gv .co-cup img')).length === 1, 'a gaveta mostra NF, rastreio e a miniatura do cupom');
  await p.waitForTimeout(400);
  conf(await p.evaluate(() => /^data:image/.test(document.querySelector('#gv .co-cup img').src)), 'a miniatura carrega a foto');
  await p.evaluate(() => { window.__aberto = ''; window.open = u => { window.__aberto = u; return null; }; });
  await p.click('#gv [data-act="co-ras"]'); await p.waitForTimeout(150);
  conf(await p.evaluate(() => window.__aberto === CO_RASTREIO_URL), '"Abrir nos Correios" abre a página oficial de rastreamento');
  conf(/copiado/.test(await p.evaluate(() => (document.querySelector('.cs-aviso, .aviso, [role=status]') || document.body).textContent)), 'e avisa que o código foi copiado para colar lá');
  await p.click('#gv [data-act="co-foto"]'); await p.waitForTimeout(400);
  conf(!!(await p.$('#co-fv img')), 'tocar no cupom abre a foto grande');
  await esc(p); conf(!(await p.$('#co-fv')), 'Esc fecha só a foto (uma camada)');
  await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-enviada.png') });

  console.log('— Remessas, O.S e laudo');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; location.hash = '#/coletas/envio'; }); await p.waitForTimeout(250);
  const rem = await p.$$eval('.tb-t tbody tr[data-id]', l => l.length);
  conf(rem === 5, 'aba Envio: uma linha por remessa (dia + laboratório) — ' + rem);
  const k3 = await p.evaluate(() => coLoteK(S.coletas.find(x => x.id === 'c3')));
  await p.click('.tb-t tbody tr[data-id="' + k3 + '"]'); await p.waitForTimeout(300);
  conf(/1\/2/.test(await p.textContent('#gv .gv-kv')) && (await p.$$('#gv .co-am')).length === 2, 'gaveta da remessa: 2 amostras, 1/2 laudos, a lista das amostras');
  await p.screenshot({ path: path.join(SHOTS, 'v040-pc-claro-remessa.png') });
  await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(80); conf(/Informe a O.S/.test(await msg(p)), 'O.S vazia: pede');
  await p.fill('#gv [data-fm="os"]', 'OS-77'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(400);
  conf((await col(p, 'c3')).os === 'OS-77' && (await col(p, 'c4')).os === 'OS-77', 'O.S vale para a remessa inteira');
  await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  conf(/Corrigir O.S/.test(await titulo(p)), 'com O.S, o botão vira "Corrigir O.S"');
  await p.click('#gv [data-act="co-ck"][data-id="c3"]'); await p.click('#gv [data-act="co-ck"][data-id="c4"]'); /* v0.4.1: corrigir escolhe quais */
  await p.fill('#gv [data-fm="os"]', 'OS-78'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(80);
  conf(/motivo/.test(await msg(p)), 'corrigir pede o motivo');
  await p.fill('#gv [data-fm="motivo"]', 'número digitado errado'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(400);
  const c3 = await col(p, 'c3');
  conf(c3.os === 'OS-78' && c3.alterado && /digitado errado/.test(c3.historico.slice(-1)[0].motivo), 'Administrador corrige direto; o histórico guarda antes, depois e o motivo (formato do EFClaudian)');
  await p.click('#gv [data-act="co-laudo"]'); await p.waitForTimeout(150);
  conf(/Vale para: RU12TAI24/.test(await p.textContent('#gv')), 'Laudos recebidos: só a que falta (v0.4.1: com 1, vai direto)');
  await p.click('[data-act="co-laudo-ok"]'); await p.waitForTimeout(400);
  const c3b = await col(p, 'c3');
  conf(c3b.laudo && c3b.laudoPor === 'Joana Silva' && /^\d{4}-/.test(c3b.laudoEm), 'laudo marcado com quem e quando');
  const k5 = await p.evaluate(() => coLoteK(S.coletas.find(x => x.id === 'c5')));
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; }); await p.waitForTimeout(250); await p.click('.tb-t tbody tr[data-id="' + k5 + '"]'); await p.waitForTimeout(300);
  await p.click('#gv [data-act="co-anx"]'); await p.waitForTimeout(150);
  await p.fill('#gv [data-fm="rastreio"]', 'QB998877665BR'); await p.fill('#gv [data-fm="nf"]', '9001'); await p.click('[data-act="co-anx-ok"]'); await p.waitForTimeout(400);
  const c5 = await col(p, 'c5');
  conf(c5.rastreio === 'QB998877665BR' && c5.nfEnvio === '9001', 'NF e rastreio anexados depois do envio, a qualquer momento');

  console.log('— Colaborador: data retroativa e correção viram pedido');
  await p.evaluate(async () => { await Data.col('sv2_coletas').set('c8', { tipo: 'SOLO', data: addDias(hojeISO(), -5), talhao: 'RU23TAI25', analiseNome: 'Solo completo', lab: 'IBRA', situacao: 'ativa', criadoEm: nowISO() }); gvFecharSo(); S.camadas = []; });
  await entra(p, 'ana.lima'); await p.evaluate(() => { location.hash = '#/coletas/amostras'; }); await p.waitForTimeout(300);
  await p.click('.tb-t tbody tr[data-id="c8"]'); await p.waitForTimeout(300); await p.click('#gv [data-act="co-env"]'); await p.waitForTimeout(200);
  conf((await p.$$('#gv [data-act="co-ck"].on')).length === 1, 'Enviar pela gaveta já vem com a amostra marcada');
  await p.fill('#gv [data-fm="data"]', await p.evaluate(() => addDias(hojeISO(), -1))); await p.dispatchEvent('#gv [data-fm="data"]', 'change'); await p.waitForTimeout(120);
  conf(/aguardando a confirmação/.test(await p.textContent('#gv .fm-av.wa')), 'data de ontem: avisa que vai aguardar a confirmação do líder');
  await p.click('[data-act="co-env-ok"]'); await p.waitForTimeout(500);
  conf(!(await col(p, 'c8')).enviado && await p.evaluate(() => S.aprov.some(a => a.tipo === 'envio_retro' && a.status === 'pendente' && a.payload.itens[0].id === 'c8')), 'virou pedido envio_retro (o mesmo do EFClaudian); a amostra continua não enviada');
  conf(/aguardando confirmação/.test(await p.evaluate(() => coSit(S.coletas.find(x => x.id === 'c8')).txt)), 'situação: "Envio aguardando confirmação"');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; location.hash = '#/coletas/envio'; }); await p.waitForTimeout(250);
  await p.click('.tb-t tbody tr[data-id="' + k5 + '"]'); await p.waitForTimeout(300); await p.click('#gv [data-act="co-os"]'); await p.waitForTimeout(150);
  await p.fill('#gv [data-fm="os"]', 'OS-56'); await p.fill('#gv [data-fm="motivo"]', 'o laboratório mandou outra'); await p.click('[data-act="co-os-ok"]'); await p.waitForTimeout(500);
  conf((await col(p, 'c5')).os === 'OS-55' && await p.evaluate(() => S.aprov.some(a => a.tipo === 'corrigir_os' && a.status === 'pendente')), 'Colaborador corrigindo O.S: vira pedido corrigir_os (formato do EFClaudian)');
  await p.evaluate(() => { gvFecharSo(); S.camadas = []; });
  await entra(p, 'joana.silva'); await p.waitForTimeout(300);
  await p.evaluate(async () => { for (const a of S.aprov.filter(x => x.status === 'pendente')) await Aprov.decidir(a.id, true); }); await p.waitForTimeout(500);
  const c8 = await col(p, 'c8');
  conf(c8.enviado && c8.envio === await p.evaluate(() => addDias(hojeISO(), -1)) && (await col(p, 'c5')).os === 'OS-56', 'o líder confirma aqui no EFCwork: envio retroativo e O.S aplicados');

  console.log('— Busca e celular');
  await p.keyboard.press('Control+k'); await p.waitForTimeout(150); await p.fill('#bg-q', 'RU11'); await p.waitForTimeout(150);
  conf(/Amostras/.test(await p.textContent('#bg-res')) && /RU11TAI24/.test(await p.textContent('#bg-res')), 'busca geral acha as amostras pelo talhão');
  await esc(p);
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await primeiro(q); await q.evaluate(() => { location.hash = '#/coletas/amostras'; }); await q.waitForTimeout(300);
  conf(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'celular: amostras sem rolar para o lado');
  await q.screenshot({ path: path.join(SHOTS, 'v040-cel-claro-amostras.png') });
  await q.click('.tb-t tbody tr[data-id="c3"]'); await q.waitForTimeout(1500);
  conf(await q.evaluate(() => Math.round(document.getElementById('gv').getBoundingClientRect().width) === innerWidth && document.documentElement.scrollWidth <= innerWidth + 1), 'celular: ciclo em tela cheia');
  await q.screenshot({ path: path.join(SHOTS, 'v040-cel-claro-ciclo.png') });
  await q.evaluate(() => { csTrocaTema('escuro'); }); await q.waitForTimeout(150); await q.screenshot({ path: path.join(SHOTS, 'v040-cel-escuro-ciclo.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v040: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
