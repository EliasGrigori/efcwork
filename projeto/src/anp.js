/* EFCwork · anp.js — Qualidade › Análise de problemas (v0.6.3). Prefixo: anp.
   Mesmo dado do EFClaudian v2.102.20: sv2_analise (um documento por análise, número ANP-ano-NN). Abre a partir de um apontamento de
   campo ou de uma reclamação de cliente; o líder ★ abre e escolhe o responsável; só o responsável escreve a análise e as ações
   (as mesmas ferramentas da análise da NC, em analise.js); o líder registra a eficácia: eficaz conclui, não eficaz deixa aberta.
   Nada se apaga: a análise só é cancelada, com motivo. As outras abas da Qualidade continuam no EFClaudian (v0.7). */
const ANP_ORIG = { apont: 'Apontamento de campo', recl: 'Reclamação de cliente' };
const ANP_SIT = { aberta: ['Aberta', 'wa'], concluida: ['Concluída', 'ok'], cancelada: ['Cancelada', ''] };
const ANP_FILTROS = [['aberta', 'Em aberto'], ['concluida', 'Concluídas'], ['cancelada', 'Canceladas'], ['todas', 'Todas']];
const anpOrigTxt = x => ANP_ORIG[x.origem] + (x.origemTxt ? ' · ' + x.origemTxt : '') + (x.cliente && x.cliente.nome ? ' · ' + x.cliente.nome + (x.cliente.lote ? ' · ' + x.cliente.lote : '') : '');
const anpSitPill = x => { const s = ANP_SIT[x.situacao] || ANP_SIT.aberta; return '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>'; };
const anpVencida = x => x.situacao === 'aberta' && x.prazo && x.prazo < hojeISO();
function anpNovoNumero() { const a = hojeISO().slice(0, 4), n = S.anl.filter(x => String(x.numero || '').indexOf('ANP-' + a + '-') === 0).length + 1; return 'ANP-' + a + '-' + pad(n); }
const anpDoApont = apId => S.anl.find(x => x.origem === 'apont' && x.origemId === apId && x.situacao !== 'cancelada') || null;

TELAS.qualidade = function (aba) {
  if (aba !== 'analise') return arEmBreve(csArea('qualidade'));
  const u = S.user, f = S.anpF || 'aberta', todas = S.anl.slice().sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)));
  const lst = todas.filter(x => f === 'todas' || x.situacao === f), ab = todas.filter(x => x.situacao === 'aberta'), venc = ab.filter(anpVencida).length;
  const meta = ['<span>' + ab.length + ' em aberto de ' + todas.length + '</span>', venc ? metaPl(venc + (venc === 1 ? ' com prazo vencido' : ' com prazo vencido'), 'cr', 'alerta') : ''];
  let h = cabecalho({ titulo: 'Análise de problemas', abaNome: 'Análise de problemas', meta: meta.filter(Boolean), acoes: isSup(u) ? '<button type="button" class="bt pr" data-act="anp-nova">' + ic('mais') + 'Nova análise</button>' : '' });
  h += '<div class="au-bar">' + ddHTML('anp:f', f, ANP_FILTROS.map(x => [x[0], x[1] + ' · ' + todas.filter(y => x[0] === 'todas' || y.situacao === x[0]).length])) + '</div>';
  if (!lst.length) return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>' + (f === 'aberta' ? 'Nenhuma análise em aberto.' : 'Nada por aqui.') + '</b><span>A análise nasce de um apontamento de campo ou de uma reclamação de cliente: causa, 5 Porquês, Ishikawa, plano de ação e eficácia.</span></div></section>';
  return h + '<section class="pn anp-l">' + lst.map(x => { const I = anInfo({ t: 'anp', id: x.id }), fa = I ? anFalta(I) : [], l = anAtivas(x.acoes), fe = l.filter(a => a.st === 'feita').length;
    return '<button type="button" class="anp-li" data-act="anp-abre" data-id="' + esc(x.id) + '"><span class="au-nn">' + esc(String(x.numero || '').replace(/^ANP-\d{4}-/, 'ANP ')) + '</span><span class="tx"><b>' + esc(x.titulo) + '</b><small>' + esc(ANP_ORIG[x.origem] + ' · ' + (x.respNome || '') + ' · prazo ' + fmtD(x.prazo)) + '</small></span><span class="au-pl">' +
      anpSitPill(x) + (x.situacao === 'aberta' ? '<span class="pill ' + (fa.length ? (anComecado(x) ? 'wa' : '') : 'ok') + '">' + (fa.length ? (anComecado(x) ? 'Análise incompleta' : 'Sem análise') : 'Análise completa') + '</span>' : '') +
      (l.length ? '<span class="pill">' + fe + ' de ' + l.length + (l.length > 1 ? ' ações' : ' ação') + '</span>' : '') + (anpVencida(x) ? '<span class="pill cr">prazo vencido</span>' : '') + '</span></button>'; }).join('') + '</section>';
};
DD_AO.anp = (k, v) => { if (k === 'f') { S.anpF = v; render(); } else if (S.fm) { S.fm[k] = v; if (k === 'apId') { const a = S.apont.find(y => y.id === v); if (a) Object.assign(S.fm, { titulo: apCat(a.categoria)[1] + ' · ' + a.setor, desc: a.obs || '', local: a.setor || '', data: a.data }); } S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); } };

/* ---------- nova análise ---------- */
LC_FORM.anpNova = f => {
  const us = S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').sort((a, b) => cmpTxt(a.nome, b.nome)), lim = addDias(hojeISO(), -120);
  const aps = S.apont.filter(a => a.status !== 'nao_procede' && a.data >= lim && !anpDoApont(a.id)).sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm))).slice(0, 60);
  const ap = f.origem === 'apont';
  const c = lcMsg() + apPasso(1, 'De onde veio') + '<div class="fm-g cl-fm2">' + lcBl('Origem', ddHTML('anp:origem', f.origem, [['recl', 'Reclamação de cliente'], ['apont', 'Apontamento de campo']])) +
      (ap ? lcBl('Qual apontamento', ddHTML('anp:apId', f.apId, [['', aps.length ? 'Escolha…' : 'Nenhum apontamento recente']].concat(aps.map(a => [a.id, fmtD(a.data) + ' · ' + apCat(a.categoria)[1] + ' · ' + a.setor])))) : lcBl('Cliente', lcIn('cli', f.cli, ' placeholder="quem reclamou"'))) + '</div>' +
    (ap ? '' : '<div class="fm-g cl-fm2">' + lcBl('Lote / produto', lcIn('lote', f.lote, ' placeholder="ex.: lote 2026-10-14 · mamão formosa"')) + lcBl('Como chegou', lcIn('canal', f.canal, ' list="anp-dl-canal" placeholder="e-mail, telefone, visita…"') + auDl('anp-dl-canal', ['E-mail', 'Telefone', 'WhatsApp', 'Visita', 'Auditoria do cliente'])) + '</div>') +
    apPasso(2, 'O problema') + lcBl('Problema em uma frase', lcIn('titulo', f.titulo, ' maxlength="200" placeholder="ex.: mamão chegou com manchas de látex"')) + lcBl('O que aconteceu', lcTx('desc', f.desc, 'o que, quando, quanto, como foi percebido')) +
    '<div class="fm-g cl-fm2">' + lcBl('Local', lcIn('local', f.local, '')) + lcBl('Data do problema', lcData('data', f.data)) + '</div>' +
    apPasso(3, 'Quem responde') + '<div class="fm-g cl-fm2">' + lcBl('Responsável pela resposta', ddHTML('anp:resp', f.resp, [['', 'Escolha…']].concat(us.map(u => [u.id, u.nome])))) + lcBl('Prazo da análise', lcData('prazo', f.prazo, true)) + '</div>' +
    lcAv('Só o responsável escreve a análise e as ações; todos veem. O responsável recebe o aviso no sino.');
  return { ico: 'lista', sub: anpNovoNumero() + ' · ' + S.user.nome, titulo: 'Nova análise de problema', corpo: c, rodape: lcPe('anp-nova-ok', 'Abrir a análise') };
};
function anpNovaOk() {
  const f = S.fm; if (!f || !isSup(S.user)) return lcErro('Só o Líder ★ ou o Administrador abre análise.');
  const ap = f.origem === 'apont', a = ap ? S.apont.find(y => y.id === f.apId) : null, o = { titulo: String(f.titulo || '').trim(), descricao: String(f.desc || '').trim(), local: String(f.local || '').trim(), data: f.data, respId: f.resp, prazo: f.prazo };
  if (ap && !a) return lcErro('Escolha o apontamento.');
  if (!ap && String(f.cli || '').trim().length < 2) return lcErro('Diga quem reclamou.');
  if (o.titulo.length < 5) return lcErro('Escreva o problema em uma frase.');
  const er = validaData(o.data); if (er) return lcErro(er);
  if (!o.respId) return lcErro('Escolha o responsável pela resposta.');
  if (!dataOk(o.prazo) || o.prazo < hojeISO()) return lcErro('O prazo não pode ser antes de hoje.');
  if (a && anpDoApont(a.id)) return lcErro('Este apontamento já tem análise: ' + anpDoApont(a.id).numero + '.');
  if (!lcTravar()) return;
  const ts = nowISO(), u = S.user;
  const doc = Object.assign(o, { numero: anpNovoNumero(), origem: ap ? 'apont' : 'recl', origemId: a ? a.id : '', origemTxt: a ? apCat(a.categoria)[1] + ' · ' + a.setor + ' · ' + fmtD(a.data) + ' · ' + (a.porNome || '') : '',
    cliente: ap ? null : { nome: String(f.cli).trim(), lote: String(f.lote || '').trim(), canal: String(f.canal || '').trim() }, respNome: nomeDe(o.respId), respHist: [], abertoPorId: u.id, abertoPorNome: u.nome, criadoEm: ts,
    situacao: 'aberta', contencao: null, porques: ['', '', '', '', ''], ishi: [], ishiPri: '', ishiV: 1, causa: '', m6: '', acoes: [], efic: null, eficHist: [], rev: 1, em: ts, porId: u.id, porNome: u.nome, hist: [{ ts: ts, porNome: u.nome, rev: 1, o: 'abriu' }] });
  const p = Data.col('sv2_analise').add(doc);
  p.then(id => { if (!S.anl.some(x => x.id === id)) S.anl.push(Object.assign({ id: id }, doc));
    Audit.log({ acao: 'anl_abrir', entidade: 'analise', entidadeId: id, resumo: 'Abriu a ' + doc.numero + ' (' + ANP_ORIG[doc.origem] + '): ' + doc.titulo + ' · responsável ' + doc.respNome + ' até ' + fmtD(doc.prazo) });
    if (doc.respId !== u.id) Notif.send({ nivel: 'aviso', titulo: 'Análise de problema para você', texto: doc.numero + ': ' + doc.titulo + ' — prazo ' + fmtD(doc.prazo) + '. Aberta por ' + u.nome + '.', para: [doc.respId], refTipo: 'analise', refId: id }).catch(() => {}); });
  lcGrava([p], doc.numero + ' aberta.', () => p.then(id => anAbrir({ t: 'anp', id: id }))); /* abre por cima da tela em que a pessoa está (vindo do apontamento, fica nele) */
}
LC_FORM.anpCanc = f => { const x = anpDe(f.id); if (!x) return null;
  return { ico: 'x', sub: x.numero + ' · ' + x.titulo, titulo: 'Cancelar a análise', corpo: lcMsg() + lcAv('Nada é apagado: a análise fica como cancelada, com o motivo.', 'cr') + lcBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('anp-canc-ok', 'Cancelar a análise') }; };
function anpCancOk() {
  const f = S.fm, I = f && anInfo({ t: 'anp', id: f.id }); if (!I || !I.podeLider) return lcErro('Só o líder ★ cancela a análise.');
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  S.fm.volta = null; lcGrava([anGravar(I, { t: 'anp', id: f.id }, { situacao: 'cancelada', cancEm: hojeISO(), cancPor: S.user.nome, cancMotivo: m }, 'cancelada — ' + m, null)], I.x.numero + ' cancelada.', () => { if (S.gv) gvFechar(); });
}
/* do apontamento: abre a análise que já existe ou começa uma nova com os dados dele */
function anpDoApontAbre(apId) { const x = anpDoApont(apId); if (x) { anAbrir({ t: 'anp', id: x.id }); return; }
  if (!isSup(S.user)) return; const a = S.apont.find(y => y.id === apId); if (!a) return;
  lcAbrir({ k: 'anpNova', origem: 'apont', apId: a.id, titulo: apCat(a.categoria)[1] + ' · ' + a.setor, desc: a.obs || '', local: a.setor || '', data: a.data, resp: '', prazo: addDias(hojeISO(), 15), cli: '', lote: '', canal: '' }); }

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="anp-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'anp-abre') anAbrir({ t: 'anp', id: id });
  else if (a === 'anp-nova') { if (isSup(S.user)) lcAbrir({ k: 'anpNova', origem: 'recl', apId: '', titulo: '', desc: '', local: '', data: hojeISO(), resp: '', prazo: addDias(hojeISO(), 15), cli: '', lote: '', canal: '' }); }
  else if (a === 'anp-nova-ok') anpNovaOk();
  else if (a === 'anp-ap') anpDoApontAbre(id);
  else if (a === 'anp-canc') { const c = S._anCtx; if (c && c.t === 'anp') lcAbrir({ k: 'anpCanc', id: c.id, motivo: '' }, () => anVer(c)); }
  else if (a === 'anp-canc-ok') anpCancOk();
});
BG_FONTES.push(q => S.anl.filter(x => bgCasa(q, [x.numero, x.titulo, x.descricao, x.local, x.respNome, x.causa].join(' '))).slice(0, 6).map(x => ({ grupo: 'Análise de problemas', nome: x.numero + ' · ' + x.titulo, sub: (ANP_SIT[x.situacao] || ANP_SIT.aberta)[0] + ' · ' + (x.respNome || ''), ico: 'lista',
  abrir: () => { if (S.rota.area !== 'qualidade' || S.rota.aba !== 'analise') { S._gvNav = true; ir('qualidade', 'analise'); } anAbrir({ t: 'anp', id: x.id }); } })));
