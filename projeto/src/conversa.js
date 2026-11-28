/* EFCwork · conversa.js — v0.6.51 Conversas (prefixo cv). Plano do Elias (28/11 10:4x, questionário):
   (1) OPÇÃO 3 · as duas: a conversa dentro de cada registro (no fim da gaveta) + a aba Qualidade › Conversas, que junta todas
       (tocar abre o registro, ou o cartão no Vértice, na conversa);
   (2) aviso no sino para quem já participa da conversa + o responsável do registro (ou do cartão do Kanban);
   (3) Vértice pela conta do Cwork: o comentário do Kanban/post-it chega aqui pela porta (recurso 'conversas'), vira mensagem
       da conversa do cartão e o Cwork manda o aviso; tocar abre o cartão no Vértice.
   Dados: sv2_chat, o MESMO formato do EFClaudian (v2.51.0): { chave: 'tipo:id', refTipo, refId, refTitulo, texto, porId, porNome,
   ts, mencoes }. Assim as conversas antigas do EFClaudian aparecem aqui e as daqui aparecem lá (nos tipos que os dois têm).
   Avisos: sv2_notifs com refTipo 'chat' e refId = chave (também como no EFClaudian). Regra do Firebase: a de sempre
   (cria quem lança, em nome dele, texto de 1 a 1000 letras; ninguém muda nem apaga) — nada muda no Firebase.
   "Não lidas" ficam no aparelho (chave 'sv2-chat-lido-<conta>', a mesma do EFClaudian). Mensagem não se edita nem se apaga. */
const CV_MAX = 1000;
Object.assign(S, { chat: [], cvRasc: {} });
Object.assign(ICS, { conversa: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.2 3.4c-.3.3-.8 0-.8-.4V16h0A1.5 1.5 0 0 1 4 14.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' });

/* ---------- os tipos de registro (os 8 primeiros com a mesma chave do EFClaudian) ---------- */
const cvVeA = a => () => !!S.user && temAtrib(S.user, a);
const cvColeta = () => !!S.user && typeof coVe === 'function' && coVe();
const cvIds = l => Array.from(new Set((l || []).filter(x => typeof x === 'string' && x)));
const cvNorm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const cvIdsDoNome = nome => { const n = cvNorm(nome); return n ? (S.users || []).filter(u => !u.bloqueado && cvNorm(u.nome) === n).map(u => u.id) : []; };
const CV_TIPOS = {
  apont: { nome: 'Apontamento', ve: cvVeA('apont'), de: id => (S.apont || []).find(x => x.id === id), tit: a => apCat(a.categoria)[1] + ' · ' + (a.setor || '') + ' · ' + fmtD(a.data), donos: a => [a.porId], abrir: id => (cvVai('inspecoes', 'apontamentos'), apAbre(id)) },
  rnc: { nome: 'Auditoria interna', ve: cvVeA('apont'), de: id => (S.rnc || []).find(x => x.id === id), tit: r => r.numero + (r.tipo ? ' · ' + r.tipo : ''), donos: r => [r.auditorId].concat(((r && r.ncs) || []).map(n => n.respId)), abrir: id => (cvVai('inspecoes', 'auditoria'), S.auRid = id, auRncAbre(id)) },
  coleta: { nome: 'Coleta', ve: cvColeta, de: id => (S.coletas || []).find(x => x.id === id), tit: c => (CO_TXT[c.tipo] || c.tipo || '') + ' · ' + coNome(c) + ' · ' + fmtD(c.data), donos: c => [c.criadoPor, c.porId], abrir: id => (cvVai('coletas', 'amostras'), coAbre(id)) },
  agua: { nome: 'Coleta de água', ve: cvColeta, de: id => (S.aguacol || []).find(x => x.id === id), tit: c => (c.pontoNome || '') + ' · ' + fmtD(c.data), donos: c => [c.criadoPor, c.acao && c.acao.responsavelId], abrir: id => (cvVai('coletas', 'agua'), agAbre(id)) },
  cloro: { nome: 'Cloro', ve: cvVeA('cloro'), de: id => (S.cloro || []).find(x => x.id === id), tit: c => (c.pontoNome || '') + ' · ' + fmtD(c.data), donos: c => [c.lancadoPor], abrir: id => (cvVai('inspecoes', 'cloro'), clAbre(id)) },
  eq: { nome: 'Equipamento', ve: () => !!S.user && alVe(), de: id => (S.almEq || []).find(x => x.id === id), tit: e => eqNomeC(e), donos: () => [], abrir: id => (cvVai('almox', 'equipamentos'), alAbreEq(id)) },
  doc: { nome: 'Documento', ve: cvVeA('docs'), de: id => (S.docs || []).find(x => x.id === id), tit: d => (d.codigo ? d.codigo + ' · ' : '') + (d.titulo || ''), donos: d => cvIdsDoNome(d.responsavel), abrir: id => (cvVai('documentos', 'documentos'), dcAbreDoc(id)) },
  trf: { nome: 'Transferência', ve: () => !!S.user && alVe(), de: () => null, tit: () => '', donos: () => [], abrir: null }, /* do EFClaudian; aqui abre só a conversa */
  /* novos no Cwork (o EFClaudian não mostra estes) */
  caixa: { nome: 'Caixa d’água', ve: cvVeA('docs'), de: id => (S.caixas || []).find(x => x.id === id), tit: c => (c.tag || '') + (c.local ? ' · ' + c.local : ''), donos: () => [], abrir: id => (cvVai('documentos', 'caixas'), dcAbreCaixa(id)) },
  remessa: { nome: 'Remessa', ve: cvColeta, de: k => cvRemessa(k), tit: r => r.titulo, donos: r => r.donos, abrir: k => /^agua:/.test(k) ? (cvVai('coletas', 'agua'), arAbreLote(k)) : (cvVai('coletas', 'envio'), coAbreLote(k)) },
  treino: { nome: 'Treinamento', ve: cvVeA('qualidade'), de: id => (S.trn || []).find(x => x.id === id), tit: t => (t.titulo || 'Treinamento') + ' · ' + fmtD(t.data), donos: t => [t.criadoPorId, t.instrutorId], abrir: id => (cvVai('qualidade', 'treinos'), trAbre(id)) },
  vtq: { nome: 'Vértice · cartão', ve: () => !!S.user && typeof vtLiga === 'function' && vtLiga(), de: id => cvVtDe(id), tit: v => v.titulo, donos: v => v.donos, abrir: id => cvVtAbrir(id) }
};
const cvVai = (ar, ab) => { if (S.rota.area !== ar || S.rota.aba !== ab) { S._gvNav = true; ir(ar, ab); } };
function cvRemessa(k) {
  const l = /^agua:/.test(k) ? (typeof arColetas === 'function' ? arColetas(k) : []) : (typeof coLote === 'function' ? coLote(k) : []); if (!l.length) return null;
  const c0 = l[0], agua = /^agua:/.test(k);
  return { titulo: (agua ? 'Água · ' : '') + (c0.lab || 'Sem laboratório') + ' · ' + fmtD(c0.envio) + ' · ' + l.length + (l.length === 1 ? ' amostra' : ' amostras'), donos: l.map(c => c.criadoPor || c.porId) };
}
const cvSep = ch => { const s = String(ch || ''), i = s.indexOf(':'); return i < 0 ? ['', ''] : [s.slice(0, i), s.slice(i + 1)]; };
const cvTipo = ch => CV_TIPOS[cvSep(ch)[0]] || null;

/* ---------- dados ---------- */
CS_CARGAS.push(() => {
  csOuve('sv2_chat', l => {
    S.chat = (l || []).filter(m => m && typeof m.chave === 'string' && m.chave.indexOf(':') > 0 && typeof m.texto === 'string');
    if (S.rota.area === 'qualidade' && S.rota.aba === 'conversas') render(); else if (S.gv) gvDesenha();
  }, { order: 'ts', limit: 3000 });
});
const cvMsgs = ch => S.chat.filter(m => m.chave === ch).sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
const cvLidoK = () => 'sv2-chat-lido-' + (S.user ? S.user.id : '');
function cvLidos() { try { return JSON.parse(Store.get(cvLidoK()) || '{}') || {}; } catch (e) { return {}; } }
const cvNaoLidas = (ch, ms) => { const lt = cvLidos()[ch] || ''; return (ms || cvMsgs(ch)).filter(m => m.ts > lt && m.porId !== (S.user || {}).id).length; };
function cvMarcaLido(ch) {
  const m = cvMsgs(ch).slice(-1)[0], u = S.user; if (!m || !u) return;
  const l = cvLidos(); if (l[ch] !== m.ts) { l[ch] = m.ts; try { Store.set(cvLidoK(), JSON.stringify(l)); } catch (e) {} }
  (S.notifs || []).forEach(n => { if (n.refTipo === 'chat' && n.refId === ch && Notif.visible(n) && !Notif.isRead(n)) Notif.read(n.id); }); /* o aviso desta conversa sai do sino */
}
/* quem conversa: quem lança (o perfil Consulta só lê, como a regra do Firebase). Conversar não altera o registro, então quem
   "só vê" a área também conversa (ITEM da página de aprovação). */
const cvPode = () => !!S.user && S.user.perfil !== 'visitante' && !S.user.bloqueado && !S.user.precisaCompletar;
/* quem vê a conversa: quem vê a área do registro, ou quem já está nela */
function cvVe(ch) {
  const T = cvTipo(ch), u = S.user; if (!u) return false;
  try { if (T && T.ve()) return true; } catch (e) {}
  return S.chat.some(m => m.chave === ch && m.porId === u.id) || cvDonos(ch).indexOf(u.id) >= 0;
}
function cvReg(ch) { const T = cvTipo(ch); if (!T) return null; try { return T.de(cvSep(ch)[1]) || null; } catch (e) { return null; } }
function cvDonos(ch) { const T = cvTipo(ch), r = cvReg(ch); if (!T || !r) return []; try { return cvIds(T.donos(r)); } catch (e) { return []; } }
function cvTitulo(ch) { const T = cvTipo(ch), r = cvReg(ch); if (T && r) { try { const t = T.tit(r); if (t) return t; } catch (e) {} } const m = cvMsgs(ch).slice(-1)[0]; return (m && m.refTitulo) || 'Registro'; }

/* ---------- a conversa no fim da gaveta ---------- */
const cvMsgHTML = m => { const eu = S.user && m.porId === S.user.id;
  return '<li class="cv-m' + (eu ? ' eu' : '') + '"><div class="cv-q"><b>' + esc(eu ? 'Você' : (m.porNome || '')) + '</b>' + (m.vt ? '<span class="cv-org">no Vértice</span>' : '') + '<small>' + esc(fmtDT(m.ts)) + '</small></div>' +
    '<p>' + esc(m.texto).replace(/(@[\wÀ-ÿ_-]{2,}(?:\.[\wÀ-ÿ_-]+)*)/g, '<b>$1</b>') + '</p></li>'; };
function cvQuemRecebe(ch) { const u = S.user, l = cvIds(cvMsgs(ch).map(m => m.porId).concat(cvDonos(ch))).filter(x => x !== (u && u.id) && (S.users || []).some(v => v.id === x && !v.bloqueado)); return l.map(nomeDe); }
function cvBloco(ch) {
  if (!cvVe(ch)) return '';
  const l = cvMsgs(ch), vt = cvSep(ch)[0] === 'vtq', pode = cvPode() && !vt, rec = cvQuemRecebe(ch);
  setTimeout(() => cvMarcaLido(ch), 0);
  return '<section class="cv" data-cv="' + esc(ch) + '" aria-label="Conversa"><p class="gv-h">Conversa' + (l.length ? ' · ' + l.length : '') + '</p>' +
    (l.length ? '<ol class="cv-l">' + l.map(cvMsgHTML).join('') + '</ol>' : '<p class="cl-nt cv-vz">Nenhuma mensagem ainda.' + (pode ? ' Pergunte ou combine algo sobre este registro aqui.' : '') + '</p>') +
    (pode ? '<div class="cv-in"><textarea class="fm-i" id="cv-tx" data-cv-tx="' + esc(ch) + '" rows="2" maxlength="' + esc(CV_MAX) + '" placeholder="Escrever uma mensagem" aria-label="Mensagem">' + esc(S.cvRasc[ch] || '') + '</textarea>' +
      '<button type="button" class="bt pr" data-act="cv-env" data-k="' + esc(ch) + '">Enviar</button></div>' +
      '<small class="cv-av">' + (rec.length ? 'Avisa no sino: ' + esc(rec.join(', ')) : 'Ninguém mais está nesta conversa ainda.') + '</small>'
      : vt ? (typeof vtLiga === 'function' && vtLiga() ? '<div class="cv-in"><button type="button" class="bt pr" data-act="cv-vt" data-k="' + esc(ch) + '">Responder no cartão do Vértice</button></div>' : '<small class="cv-av">A resposta se escreve no cartão, no Vértice.</small>') : '') + '</section>';
}
/* liga a conversa na gaveta de cada registro, sem mexer em cada tela: a gaveta aberta ganha o bloco no fim */
function cvLiga(nome, chaveDe) {
  const orig = window[nome]; if (typeof orig !== 'function') { console.warn('conversa: falta', nome); return; }
  window[nome] = function () {
    const r = orig.apply(this, arguments), ch = chaveDe.apply(null, arguments), fn = S.gv;
    if (ch && fn && !S.gvForm && !fn._cv) {
      const w = function () { const o = fn.apply(this, arguments); if (o && cvVe(ch)) o.corpo = (o.corpo || '') + cvBloco(ch); return o; };
      w._cv = ch; S.gv = w; gvDesenha(true);
    }
    return r;
  };
}
cvLiga('apAbre', id => 'apont:' + id);
cvLiga('auRncAbre', rid => 'rnc:' + rid);
cvLiga('auNcAbre', rid => 'rnc:' + rid); /* a NC da auditoria mostra a conversa da auditoria (a mesma chave do EFClaudian) */
cvLiga('coAbre', id => 'coleta:' + id);
cvLiga('coAbreLote', k => 'remessa:' + k);
cvLiga('agAbre', id => 'agua:' + id);
cvLiga('arAbreLote', k => 'remessa:' + k);
cvLiga('clAbre', id => 'cloro:' + id);
cvLiga('alAbreEq', id => 'eq:' + id);
cvLiga('dcAbreDoc', id => 'doc:' + id);
cvLiga('dcAbreCaixa', id => 'caixa:' + id);
cvLiga('trAbre', id => 'treino:' + id);
/* o texto que está sendo escrito fica quando a gaveta se redesenha (chegou dado novo) e o foco volta para o mesmo lugar */
function cvSoLista(ch) { /* chegou dado novo enquanto a pessoa escreve: troca só as mensagens (o teclado do celular não é cortado) */
  const s = $('#gv .cv'), tmp = document.createElement('div'); if (!s) return; tmp.innerHTML = cvBloco(ch); const n = tmp.firstElementChild, inN = s.querySelector('.cv-in'); if (!n || !inN) return;
  [...s.children].filter(e => !e.classList.contains('cv-in')).forEach(e => e.remove());
  [...n.children].forEach(e => { if (e.classList.contains('cv-in')) return; if (e.classList.contains('cv-av')) s.appendChild(e); else s.insertBefore(e, inN); });
}
{ const cvGvOrig = gvDesenha;
  gvDesenha = function (forca) {
    const a = document.activeElement, f = a && a.id === 'cv-tx' ? [a.selectionStart, a.selectionEnd] : null;
    if (f && !forca && S.gv && S.gv._cv && S.gv._cv === a.getAttribute('data-cv-tx') && a.closest('#gv')) { cvSoLista(S.gv._cv); S._cvDepois = true; return; } /* o resto da gaveta se redesenha ao sair do campo */
    const r = cvGvOrig.apply(this, arguments);
    if (f) { const t = $('#cv-tx'); if (t) { try { t.focus({ preventScroll: true }); t.setSelectionRange(f[0], f[1]); } catch (e) {} } }
    return r;
  }; }
document.addEventListener('focusout', e => { const t = e.target; if (!t || t.id !== 'cv-tx' || !S._cvDepois) return; const r = e.relatedTarget; if (r && r.getAttribute && r.getAttribute('data-act') === 'cv-env') return; S._cvDepois = false; setTimeout(() => { if (S.gv && !(document.activeElement && document.activeElement.id === 'cv-tx')) gvDesenha(); }, 0); });
document.addEventListener('input', e => { const t = e.target; if (t && t.id === 'cv-tx') { const ch = t.getAttribute('data-cv-tx'); if (t.value) S.cvRasc[ch] = t.value; else delete S.cvRasc[ch]; } });
document.addEventListener('keydown', e => { const t = e.target; if (t && t.id === 'cv-tx' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); cvEnviar(t.getAttribute('data-cv-tx')); } });
/* rascunho de mensagem conta como "preenchido" antes de atualizar o app (regra do CONTINUAR, seção 3) */
{ const cvVnOrig = vnPreenchido; vnPreenchido = function () { return cvVnOrig.apply(this, arguments) || Object.values(S.cvRasc).some(v => String(v).trim()); }; }

{ const cvSairOrig = csSair; csSair = function () { S.cvRasc = {}; S.chat = []; S._cvDepois = false; return cvSairOrig.apply(this, arguments); }; } /* revisor: o rascunho não passa para a próxima conta */

/* ---------- enviar e avisar ---------- */
async function cvEnviar(ch) {
  if (S._cvEnv) return; const u = S.user, T = cvTipo(ch), [tipo, id] = cvSep(ch);
  if (!u || !T || !cvPode() || !cvVe(ch)) { aviso('Você não pode escrever nesta conversa.', 'erro'); return; }
  const box = $('#cv-tx'), txt = String(box ? box.value : S.cvRasc[ch] || '').trim();
  if (!txt) { aviso('Escreva a mensagem.', 'erro'); if (box) box.focus(); return; }
  if (txt.length > CV_MAX) { aviso('Mensagem longa demais (até ' + CV_MAX + ' letras).', 'erro'); return; }
  const m = { chave: ch, refTipo: tipo, refId: id, refTitulo: cvTitulo(ch), texto: txt, porId: u.id, porNome: u.nome, ts: nowISO(), mencoes: [] };
  if (u.contaTeste) m.testeConta = true;
  /* a trava é só contra o duplo toque: sem internet o Firestore guarda no aparelho e envia depois, então não se espera a nuvem (revisor) */
  S._cvEnv = true; const falhou = e => { console.error(e); S.chat = S.chat.filter(x => !(x.ts === m.ts && x.porId === m.porId && x.chave === ch)); if (!S.cvRasc[ch]) S.cvRasc[ch] = txt;
    if (S.gv) gvDesenha(true); aviso('Não deu para enviar a mensagem: ' + svErro(e), 'erro'); };
  try {
    const p = Data.col('sv2_chat').add(m), nid = p.docId;
    delete S.cvRasc[ch]; if (box) box.value = '';
    if (nid && !S.chat.some(x => x.id === nid)) S.chat = S.chat.concat([Object.assign({ id: nid }, m)]); /* aparece na hora (sem internet também) */
    S._cvDepois = false; if (S.gv) gvDesenha(true);
    p.then(() => cvAvisa(ch, m), falhou);
  } catch (e) { falhou(e); } finally { S._cvEnv = false; }
}
/* aviso no sino: quem já participa + o responsável (sem quem escreveu e sem conta bloqueada), como no EFClaudian */
function cvAvisa(ch, m, extra) {
  const u = S.user, T = cvTipo(ch); if (!u || !T) return;
  const para = cvIds(cvMsgs(ch).map(x => x.porId).concat(cvDonos(ch), extra || [])).filter(x => x !== u.id && (S.users || []).some(v => v.id === x && !v.bloqueado));
  if (!para.length) return;
  const curto = m.texto.length > 140 ? m.texto.slice(0, 140) + '…' : m.texto;
  Notif.send({ nivel: 'info', titulo: 'Mensagem nova · ' + T.nome, texto: m.refTitulo + ' — ' + u.nome + ': "' + curto + '"', para: para, refTipo: 'chat', refId: ch }).catch(e => console.warn('conversa: aviso', e));
}

/* ---------- abrir a conversa (sino e aba Conversas) ---------- */
function cvAbrir(ch) {
  const T = cvTipo(ch), id = cvSep(ch)[1];
  if (T && T.abrir && cvReg(ch) && (() => { try { return T.ve(); } catch (e) { return false; } })()) {
    try { T.abrir(id); setTimeout(cvRolaAte, 80); return true; } catch (e) { console.warn('conversa: abrir', e); }
  }
  if (!cvVe(ch)) { aviso('Esta conversa é de uma área que você não vê.', 'erro'); return false; }
  gvAbrir(() => cvGaveta(ch)); setTimeout(cvRolaAte, 80); return true; /* registro que o Cwork não abre (ou que saiu): só a conversa */
}
function cvRolaAte() { const s = $('#gv .cv'); if (!s) return; try { s.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
function cvGaveta(ch) {
  const T = cvTipo(ch), r = cvReg(ch);
  return { ico: 'conversa', sub: 'Conversa · ' + ((T && T.nome) || 'Registro'), titulo: cvTitulo(ch),
    corpo: (r ? '' : '<p class="cl-nt">' + (T && !T.abrir ? 'Este registro ainda não abre no ' + esc(APP_NOME) + '; a conversa fica aqui.' : 'O registro não está mais na lista (pode ter sido arquivado); a conversa fica guardada.') + '</p>') + cvBloco(ch) };
}
/* do sino: o aviso de conversa (daqui e do EFClaudian) abre a conversa */
{ const cvSnOrig = snAbreRef; snAbreRef = function (n) { if (n && n.refTipo === 'chat' && n.refId) return cvAbrir(n.refId); return cvSnOrig.apply(this, arguments); }; }

/* ---------- Qualidade › Conversas ---------- */
{ const q = AREAS.find(a => a.id === 'qualidade');
  if (q) { const i = q.abas.findIndex(t => t.id === 'bugs'); q.abas.splice(i < 0 ? q.abas.length : i, 0, { id: 'conversas', nome: 'Conversas', get negada() { return !!S.user && !temAtrib(S.user, 'qualidade'); } }); } }
const CV_GRUPOS = [['nl', 'Não lidas'], ['li', 'Lidas']];
function cvConversas() {
  const g = {}; S.chat.forEach(m => { (g[m.chave] = g[m.chave] || []).push(m); });
  const u = S.user;
  return Object.keys(g).filter(cvVe).map(ch => {
    const ms = g[ch].sort((a, b) => String(a.ts).localeCompare(String(b.ts))), ult = ms[ms.length - 1], T = cvTipo(ch);
    const pes = cvIds(ms.map(m => m.porId)), nl = cvNaoLidas(ch, ms);
    return { id: ch, titulo: cvTitulo(ch), tipo: (T && T.nome) || 'Registro', ult: ult, nl: nl, n: ms.length, pes: pes.map(x => (ms.find(m => m.porId === x) || {}).porNome || nomeDe(x)), eu: pes.indexOf(u.id) >= 0 || cvDonos(ch).indexOf(u.id) >= 0 };
  }).sort((a, b) => String(b.ult.ts).localeCompare(String(a.ult.ts)));
}
function cvTela() {
  const l = cvConversas(), nl = l.filter(x => x.nl).length, curto = t => t.length > 90 ? t.slice(0, 90) + '…' : t;
  const meta = [nl ? metaPl(nl + (nl === 1 ? ' com mensagem não lida' : ' com mensagens não lidas'), 'wa', 'conversa') : ''];
  const c = cabecalho({ titulo: 'Conversas', abaNome: 'Conversas', meta: meta.filter(Boolean) });
  if (!l.length) return c + '<section class="pn"><div class="vazio">' + ic('conversa') + '<b>Nenhuma conversa ainda.</b><span>A conversa fica no fim do detalhe de cada registro (apontamento, auditoria, coleta, remessa, documento, treinamento…) e nos cartões do Vértice. Quem participa e o responsável recebem o aviso no sino.</span></div></section>';
  return c + tbHTML({ id: 'cv-lista', titulo: 'Conversas', unidade: 'conversas', linhas: l, aoClicar: id => cvAbrir(id), selecionado: S._cvSel,
    grupos: { v: x => x.nl ? 'nl' : 'li', ordem: CV_GRUPOS }, busca: x => [x.titulo, x.tipo, x.pes.join(' '), x.ult.texto].join(' '), vazio: 'Nenhuma conversa com este filtro.',
    cols: [{ k: 'qd', rot: 'Quando', tipo: 'data', v: x => x.ult.ts, html: x => esc(fmtDT(x.ult.ts)) }, { k: 'rg', rot: 'Registro', v: x => x.titulo, cls: 'forte', longo: true }, { k: 'tp', rot: 'Tipo', v: x => x.tipo },
      { k: 'um', rot: 'Última mensagem', v: x => (x.ult.porNome || '') + ': ' + curto(x.ult.texto), longo: true }, { k: 'nl', rot: 'Não lidas', tipo: 'num', v: x => x.nl || null },
      { k: 'n', rot: 'Mensagens', tipo: 'num', v: x => x.n }, { k: 'ps', rot: 'Pessoas', v: x => x.pes.join(', '), longo: true }, { k: 'eu', rot: 'Com você', v: x => x.eu ? 'Sim' : 'Não' }] });
}
TB_OCULTAS_PADRAO['cv-lista'] = ['ps', 'eu']; /* Pessoas e Com você começam escondidas (estão em Colunas) */
{ const cvQualOrig = TELAS.qualidade; TELAS.qualidade = aba => aba === 'conversas' ? cvTela() : cvQualOrig(aba); }
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="cv-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'cv-env') cvEnviar(t.getAttribute('data-k'));
  else if (a === 'cv-vt') cvVtAbrir(cvSep(t.getAttribute('data-k'))[1]);
});

/* ---------- Vértice (plano, decisão 3): comentários do Kanban e do post-it pela conta do Cwork ----------
   O Vértice chama CworkPonteVertice.conversas.avisar({ arq, arqNome, item, cod, titulo, texto, resp, ids }) depois de gravar o
   comentário (ou a resposta) no arquivo. O Cwork grava a mensagem na conversa do cartão (chave 'vtq:<arquivo>|<cartão>',
   com vt = { arq, item, cod, nome, titulo, resp }) e avisa quem participa + o responsável do cartão (o nome dele no Cwork). */
const cvLimpa = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
function cvVtDe(id) {
  const ms = S.chat.filter(m => m.chave === 'vtq:' + id && m.vt), v = ms.length ? ms.sort((a, b) => String(b.ts).localeCompare(String(a.ts)))[0].vt : null; if (!v) return null;
  return { titulo: (v.nome || 'Arquivo do Vértice') + ' · ' + (v.cod ? v.cod + (v.titulo ? ' ' + v.titulo : '') : (v.titulo || 'cartão')), donos: cvIds([].concat(...ms.map(m => (m.vt && m.vt.respIds) || []))), vt: v };
}
function cvVtAbrir(id) {
  const v = cvVtDe(id); if (!v || typeof jnAbrir !== 'function' || !vtLiga()) { gvAbrir(() => cvGaveta('vtq:' + id)); return; }
  const arq = encodeURIComponent(v.vt.arq), re = new RegExp('^#/arq/' + arq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(/|$)');
  const aba = (typeof vtAbas === 'function' ? vtAbas() : []).find(x => { try { const f = jnFr(x); return f && re.test(f.contentWindow.location.hash); } catch (e) { return false; } }) || ''; /* revisor: a aba que já tem o arquivo, sem abrir outra */
  if (S.gv) gvFechar(); jnAbrir('docs', '#/arq/' + arq + '/c/' + encodeURIComponent(v.vt.item), false, aba);
}
async function cvVtAvisar(d) {
  const u = S.user, vu = typeof vtUsuario === 'function' ? vtUsuario() : null; if (!u || !vu || !cvPode()) return { ok: false, motivo: 'sem conta' };
  const arq = cvLimpa(d && d.arq, 120), item = cvLimpa(d && d.item, 120), texto = cvLimpa(d && d.texto, CV_MAX);
  if (!arq || !item || !texto || /[|/]/.test(arq) || /[|/]/.test(item)) return { ok: false, motivo: 'dados' };
  const respIds = cvIds([].concat(...[].concat(d.resp || []).map(n => cvIdsDoNome(cvLimpa(n, 60)))));
  const vt = { arq: arq, item: item, cod: cvLimpa(d.cod, 20), nome: cvLimpa(d.arqNome, 120), titulo: cvLimpa(d.titulo, 120), respIds: respIds };
  const ch = 'vtq:' + arq + '|' + item, extra = cvIds([].concat(d.ids || []).map(x => cvLimpa(x, 128))).filter(x => (S.users || []).some(v => v.id === x));
  const m = { chave: ch, refTipo: 'vtq', refId: arq + '|' + item, refTitulo: '', texto: texto, porId: u.id, porNome: u.nome, ts: nowISO(), mencoes: [], vt: vt };
  m.refTitulo = vt.nome + ' · ' + (vt.cod ? vt.cod + (vt.titulo ? ' ' + vt.titulo : '') : (vt.titulo || 'cartão'));
  if (u.contaTeste) m.testeConta = true;
  try {
    const p = Data.col('sv2_chat').add(m); if (p.docId && !S.chat.some(x => x.id === p.docId)) S.chat = S.chat.concat([Object.assign({ id: p.docId }, m)]);
    await p; cvAvisa(ch, m, extra.concat(respIds)); return { ok: true };
  } catch (e) { console.error(e); return { ok: false, motivo: svErro(e) }; }
}
