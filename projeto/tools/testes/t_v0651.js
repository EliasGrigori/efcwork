/* EFCwork · v0.6.51 · Conversas (plano do Elias de 28/11 10:4x): a conversa no fim do detalhe de cada registro, a aba
   Qualidade › Conversas e o aviso no sino para quem participa + o responsável. Modo demonstração, dados fictícios.
   Uso: python3 tools/montar.py && NODE_PATH=$(npm root -g) node tools/testes/t_v0651.js
   EFC_DIST=<pasta> testa outro app (o publicado, para provar o antes: tem de falhar logo). TELAS=<pasta> tira as fotos. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), DIST = path.resolve(process.env.EFC_DIST || path.join(RAIZ, 'dist'));
const URL = 'file://' + path.join(DIST, 'index.html') + '?demo=1', TELAS = process.env.TELAS || '';
if (TELAS) fs.mkdirSync(TELAS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = ms => new Promise(r => setTimeout(r, ms));
const foto = async (p, n) => { if (!TELAS) return; await esp(250); await p.screenshot({ path: path.join(TELAS, n + '.png') }); };
const vai = async (p, h, ms) => { await p.evaluate(x => { location.hash = x; }, h); await esp(ms || 700); };
const tem = (p, sel) => p.evaluate(s => !!document.querySelector(s), sel);
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
const notifs = p => p.evaluate(() => JSON.parse(localStorage.getItem('sv2demo_sv2_notifs') || '[]').filter(n => n.refTipo === 'chat'));
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel, timezoneId: 'America/Fortaleza' }); await ctx.route(/^https:/, r => r.abort());
  const p = await ctx.newPage(), er = []; p._er = er; p.on('pageerror', e => er.push(String(e)));
  await p.goto(URL); await esp(500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(800);
  await p.evaluate(async () => { const C = Data.col.bind(Data), h = hojeISO();
    await C('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] });
    await C('sv2_users').set('u_lider', { nome: 'Carlos Lima', login: 'carlos.lima', perfil: 'secundario', estrela: true, status: 'ativo', atrib: { apont: true, coletas: true, docs: true, qualidade: true } });
    await C('sv2_users').set('u_col', { nome: 'Rita Alves', login: 'rita.alves', perfil: 'secundario', status: 'ativo', atrib: { apont: true } });
    await C('sv2_users').set('u_blq', { nome: 'Pedro Bloqueado', login: 'pedro.b', perfil: 'secundario', status: 'ativo', bloqueado: true, atrib: { apont: true } });
    await C('sv2_apont').set('ap1', { categoria: AP_CATS[0][0], setor: 'Packing (exemplo)', data: h, hora: '08:00', porId: 'u_col', porNome: 'Rita Alves', status: 'aberto', criadoEm: nowISO(), fotos: [] });
    await C('sv2_docs').set('d1', { codigo: 'FOR-01', titulo: 'Controle de limpeza (exemplo)', tipo: 'FORMULARIO', setor: 'Packing', responsavel: 'Carlos Lima', periodo: 'mensal' });
    /* uma conversa antiga feita no EFClaudian (mesmo formato), num tipo que o Cwork ainda não abre (transferência) */
    await C('sv2_chat').set('m_efc', { chave: 'trf:t9', refTipo: 'trf', refId: 't9', refTitulo: 'TRF-0009 · Matriz → Filial (exemplo)', texto: 'Chegou só metade.', porId: 'u_lider', porNome: 'Carlos Lima', ts: '2026-11-20T12:00:00.000Z', mencoes: [] });
  });
  await esp(400); return p;
}
const comoEu = (p, o) => p.evaluate(x => Data.col('sv2_users').update(S.user.id, x), o).then(() => esp(400));

(async () => { const b = await chromium.launch();
  let p = await abre(b, 1280, 860);

  console.log('— A conversa no fim do detalhe do apontamento');
  await vai(p, '#/inspecoes/apontamentos'); await p.evaluate(() => apAbre('ap1')); await esp(500);
  conf(await tem(p, '#gv .cv'), 'o detalhe do apontamento tem a seção Conversa');
  conf(/Nenhuma mensagem ainda/.test(await txt(p, '#gv .cv')) && /Avisa no sino: Rita Alves/.test(await txt(p, '#gv .cv')), 'vazia, e diz quem recebe o aviso (a responsável): "' + await txt(p, '#gv .cv-av') + '"');
  await foto(p, 'c1-apont-vazia');
  /* o texto que está sendo escrito fica quando a gaveta se redesenha (chegou dado novo) */
  await p.click('#cv-tx'); await p.keyboard.type('Quem vai trocar a lâmpada?');
  await p.evaluate(() => Data.col('sv2_apont').update('ap1', { obs: 'mudou enquanto escrevia' })); await esp(500);
  conf(await p.evaluate(() => document.activeElement && document.activeElement.id === 'cv-tx' && document.activeElement.value === 'Quem vai trocar a lâmpada?'), 'dado novo redesenha a gaveta e o texto e o cursor ficam');
  await p.click('[data-act="cv-env"]'); await esp(700);
  const m1 = await p.evaluate(() => S.chat.filter(m => m.chave === 'apont:ap1'));
  conf(m1.length === 1 && m1[0].refTipo === 'apont' && m1[0].refId === 'ap1' && m1[0].porNome === 'Joana Silva' && /Packing/.test(m1[0].refTitulo) && Array.isArray(m1[0].mencoes), 'grava em sv2_chat no formato do EFClaudian: ' + JSON.stringify(m1[0] && { chave: m1[0].chave, refTitulo: m1[0].refTitulo }));
  let ns = await notifs(p);
  conf(ns.length === 1 && JSON.stringify(ns[0].para) === '["u_col"]' && ns[0].refId === 'apont:ap1' && /Mensagem nova · Apontamento/.test(ns[0].titulo), 'aviso no sino só para a responsável (sem quem escreveu): ' + JSON.stringify(ns.map(n => n.para)));
  conf(/Você/.test(await txt(p, '#gv .cv-l')) && !(await p.evaluate(() => document.getElementById('cv-tx').value)), 'a mensagem aparece na hora, como "Você", e o campo limpa');
  await foto(p, 'c2-apont-enviada');
  /* outra pessoa responde (como se fosse do aparelho dela) e eu respondo de novo: avisa as duas, nunca a bloqueada */
  await p.evaluate(() => Data.col('sv2_chat').add({ chave: 'apont:ap1', refTipo: 'apont', refId: 'ap1', refTitulo: 'x', texto: 'Eu troco amanhã.', porId: 'u_col', porNome: 'Rita Alves', ts: nowISO(), mencoes: [] }));
  await p.evaluate(() => Data.col('sv2_chat').add({ chave: 'apont:ap1', refTipo: 'apont', refId: 'ap1', refTitulo: 'x', texto: 'ok', porId: 'u_blq', porNome: 'Pedro Bloqueado', ts: nowISO(), mencoes: [] }));
  await esp(500); await p.fill('#cv-tx', 'Combinado.'); await p.keyboard.press('Control+Enter'); await esp(700);
  ns = await notifs(p);
  conf(ns.length === 2 && JSON.stringify(ns[1].para) === '["u_col"]', 'Ctrl+Enter envia; quem participa recebe (a conta bloqueada não): ' + JSON.stringify(ns[1] && ns[1].para));
  conf(await p.evaluate(() => [...document.querySelectorAll('#gv .cv-m')].length) === 4, 'as 4 mensagens na ordem em que foram escritas');
  /* revisor 5: chegou mensagem enquanto escrevo: só a lista muda (o campo é o mesmo, o teclado do celular não é cortado) */
  await p.click('#cv-tx'); await p.keyboard.type('Escrevendo'); await p.evaluate(() => { document.getElementById('cv-tx')._marca = 1; });
  await p.evaluate(() => Data.col('sv2_chat').add({ chave: 'apont:ap1', refTipo: 'apont', refId: 'ap1', refTitulo: 'x', texto: 'Chegou agora.', porId: 'u_col', porNome: 'Rita Alves', ts: nowISO(), mencoes: [] })); await esp(500);
  conf(await p.evaluate(() => document.getElementById('cv-tx')._marca === 1 && document.getElementById('cv-tx').value === 'Escrevendo' && /Chegou agora/.test(document.querySelector('#gv .cv-l').textContent)), 'mensagem nova enquanto escrevo: a lista atualiza e o campo é o mesmo');
  /* revisor 4: sem internet a gravação não confirma; a segunda mensagem sai do mesmo jeito */
  await p.evaluate(() => { const o = Data.col; window._colOrig = o; Data.col = function (n) { const c = o.call(Data, n); if (n !== 'sv2_chat') return c; return Object.assign({}, c, { add(x) { const id = 'off' + Math.random().toString(36).slice(2, 7), pr = new Promise(() => {}); pr.docId = id; return pr; } }); }; });
  await p.fill('#cv-tx', 'Sem internet 1'); await p.click('[data-act="cv-env"]'); await esp(300); await p.fill('#cv-tx', 'Sem internet 2'); await p.click('[data-act="cv-env"]'); await esp(300);
  conf(await p.evaluate(() => S.chat.filter(m => /Sem internet/.test(m.texto)).length === 2 && !S._cvEnv), 'sem internet: as duas mensagens aparecem e o Enviar não trava');
  await p.evaluate(() => { Data.col = window._colOrig; S.chat = S.chat.filter(m => !/Sem internet/.test(m.texto)); }); await esp(200);
  await p.keyboard.press('Escape'); await esp(400);

  console.log('— Qualidade › Conversas');
  await vai(p, '#/qualidade/conversas', 900);
  const abas = await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].map(a => a.textContent.trim()));
  conf(abas.join('|') === 'Não conformidades|Análise de problemas|Treinamentos|Conversas|Bugs e sugestões', 'a aba Conversas entra antes de Bugs e sugestões: ' + abas.join(', '));
  const linhas = await p.evaluate(() => [...document.querySelectorAll('[data-tb="cv-lista"] tr[data-act="tb-lin"]')].map(r => r.textContent.replace(/\s+/g, ' ')));
  conf(linhas.length === 2 && /Transferência/.test(linhas[0]) && /Apontamento/.test(linhas[1]), 'junta as conversas; as não lidas no grupo de cima (a do EFClaudian também): ' + linhas.join(' / '));
  const _tl = await p.evaluate(() => document.querySelector('.tb[data-tb="cv-lista"]').innerText); conf(/Não lidas/.test(_tl) && /1 com mensagem não lida/.test(await p.evaluate(() => document.body.innerText)), 'a antiga do EFClaudian conta como não lida (grupo e pílula)');
  await foto(p, 'c3-conversas-pc');
  await p.click('[data-tb="cv-lista"] tr[data-act="tb-lin"]:has-text("Transferência")'); await esp(600);
  conf(await tem(p, '#gv .cv') && /ainda não abre/.test(await txt(p, '#gv')), 'tipo que o Cwork ainda não abre: a conversa abre sozinha, com o aviso');
  await p.keyboard.press('Escape'); await esp(400);
  conf(!/com mensagem não lida/.test(await p.evaluate(() => document.body.innerText)), 'depois de abrir, deixa de ser não lida');
  await p.click('[data-tb="cv-lista"] tr[data-act="tb-lin"]:has-text("Apontamento")'); await esp(900);
  conf(await p.evaluate(() => location.hash === '#/inspecoes/apontamentos' && !!document.querySelector('#gv .cv')), 'tocar na conversa do apontamento abre o registro, na conversa');
  await p.keyboard.press('Escape'); await esp(400);

  /* revisor 6: a conversa de um cartão do Vértice não tem caixa de escrever no Cwork (a resposta vai no cartão) */
  await p.evaluate(() => Data.col('sv2_chat').add({ chave: 'vtq:arqx|pix', refTipo: 'vtq', refId: 'arqx|pix', refTitulo: 'Quadro (exemplo) · Q-009', texto: 'oi', porId: 'u_lider', porNome: 'Carlos Lima', ts: nowISO(), mencoes: [], vt: { arq: 'arqx', item: 'pix', cod: 'Q-009', nome: 'Quadro (exemplo)', titulo: '', respIds: [] } })); await esp(400);
  await p.evaluate(() => gvAbrir(() => cvGaveta('vtq:arqx|pix'))); await esp(400);
  conf(!(await tem(p, '#gv #cv-tx')) && await tem(p, '#gv [data-act="cv-vt"]'), 'conversa do cartão no Cwork: sem campo, com "Responder no cartão do Vértice"');
  await foto(p, 'c7-vtq');
  await p.keyboard.press('Escape'); await esp(300);
  console.log('— Sino: o aviso da conversa abre o registro');
  await p.evaluate(() => Notif.send({ nivel: 'info', titulo: 'Mensagem nova · Documento', texto: 'FOR-01 — Carlos Lima: "ok"', para: [S.user.id], refTipo: 'chat', refId: 'doc:d1' })); await esp(500);
  await p.evaluate(() => snAbrir()); await esp(400);
  await foto(p, 'c6-sino');
  await p.click('#gv [data-act="sn-abre"]:has-text("Mensagem nova · Documento")'); await esp(900);
  conf(await p.evaluate(() => location.hash === '#/documentos/documentos' && /Controle de limpeza/.test(document.getElementById('gv').textContent) && !!document.querySelector('#gv .cv')), 'abre o documento com a conversa');
  conf(/Avisa no sino: Carlos Lima/.test(await txt(p, '#gv .cv-av')), 'o responsável do documento (pelo nome do cadastro) recebe o aviso');
  conf(await p.evaluate(() => Notif.unread().every(n => n.refId !== 'doc:d1')), 'o aviso dessa conversa sai do sino (lido)');
  await p.keyboard.press('Escape'); await esp(400);

  console.log('— Quem conversa');
  await comoEu(p, { perfil: 'secundario', estrela: false, atrib: { apont: true, qualidade: true }, soVer: { apont: true } });
  await vai(p, '#/inspecoes/apontamentos'); await p.evaluate(() => apAbre('ap1')); await esp(500);
  conf(await tem(p, '#gv #cv-tx') && !(await tem(p, '#gv [data-act="ap-res"]')), 'Apontamentos "Só ver": não resolve, mas conversa');
  await p.keyboard.press('Escape'); await esp(300);
  await comoEu(p, { perfil: 'visitante', atrib: { apont: true, qualidade: true }, soVer: {} });
  await p.evaluate(() => apAbre('ap1')); await esp(500);
  conf(await tem(p, '#gv .cv-l') && !(await tem(p, '#gv #cv-tx')), 'perfil Consulta: lê a conversa e não escreve (como a regra do Firebase)');
  await p.keyboard.press('Escape'); await esp(300);
  await comoEu(p, { perfil: 'secundario', atrib: { qualidade: true, apont: false }, soVer: {} });
  await vai(p, '#/qualidade/conversas', 800);
  const vis = await p.evaluate(() => [...document.querySelectorAll('[data-tb="cv-lista"] tr[data-act="tb-lin"]')].map(r => r.textContent));
  conf(vis.length === 1 && /Apontamento/.test(vis[0]), 'Apontamentos "Não vê": continua vendo só a conversa em que já escreveu (' + vis.length + ')');
  await comoEu(p, { perfil: 'secundario', atrib: { apont: true, qualidade: false }, soVer: {} });
  await vai(p, '#/qualidade', 700);
  conf(!(await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].some(a => /Conversas/.test(a.textContent)))), 'Qualidade "Não vê": a aba Conversas some (a conversa continua no detalhe do registro)');
  await comoEu(p, { perfil: 'principal', estrela: false, atrib: {}, soVer: {} });

  console.log('— Rascunho antes de atualizar o app');
  await p.evaluate(() => apAbre('ap1')); await esp(400); await p.fill('#cv-tx', 'meio escrito'); await p.keyboard.press('Escape'); await esp(300);
  conf(await p.evaluate(() => vnPreenchido() === true), 'mensagem pela metade conta como "preenchido" (o Atualizar pergunta antes)');
  await p.evaluate(() => apAbre('ap1')); await esp(400);
  conf(await p.evaluate(() => document.getElementById('cv-tx').value === 'meio escrito'), 'voltando ao registro, o rascunho está lá');
  await p.fill('#cv-tx', ''); await p.keyboard.press('Escape'); await esp(300);

  conf(await p.evaluate(async () => { S.cvRasc = { 'apont:ap1': 'x' }; const f = csSair; await f(); return Object.keys(S.cvRasc).length === 0 && !S.user; }), 'sair da conta apaga o rascunho (não passa para a próxima conta)');
  console.log('— Celular');
  const c = await abre(b, 390, 844);
  await c.evaluate(() => Data.col('sv2_chat').add({ chave: 'apont:ap1', refTipo: 'apont', refId: 'ap1', refTitulo: 'x', texto: 'Foto do depois já está no app.', porId: 'u_col', porNome: 'Rita Alves', ts: nowISO(), mencoes: [] }));
  await vai(c, '#/inspecoes/apontamentos'); await c.evaluate(() => apAbre('ap1')); await esp(500);
  await c.evaluate(() => { const s = document.querySelector('#gv .cv'); if (s) s.scrollIntoView(); }); await esp(200);
  const bt = await c.evaluate(() => { const e = document.querySelector('#gv [data-act="cv-env"]'), t = document.getElementById('cv-tx'); if (!e || !t) return null; const r = e.getBoundingClientRect(), q = t.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), tw: Math.round(q.width) }; });
  conf(bt && bt.h >= 44 && Math.abs(bt.w - bt.tw) <= 2, 'no celular, Enviar com 44 px e a mesma largura do campo: ' + JSON.stringify(bt));
  await foto(c, 'c4-apont-cel');
  await vai(c, '#/qualidade/conversas', 900); await foto(c, 'c5-conversas-cel');
  conf(c._er.length === 0 && p._er.length === 0, 'sem erro de JavaScript' + (p._er.concat(c._er).length ? ': ' + p._er.concat(c._er).slice(0, 2).join(' | ') : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
