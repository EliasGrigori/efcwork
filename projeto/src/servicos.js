/* EFCwork · servicos.js — pessoas, auditoria, avisos (sino) e pedidos ao superior. Prefixo: sv (mais os objetos Audit, Notif e Aprov).
   Copiados do EFClaudian v2.102.59 com o mesmo formato de gravação (sv2_audit, sv2_notifs, sv2_aprov), para os dois apps
   enxergarem a mesma coisa: um aviso lançado aqui aparece no sino do EFClaudian e vice-versa. */
Object.assign(S, { users: [], notifs: [], aprov: [], cfgAlm: null, _notifPartes: {}, _notifUn: [], _notifChaves: '', _notifModo: '' });

/* ---------- pessoas ---------- */
const isSup = u => !!u && (isPrincipal(u) || (u.perfil === 'secundario' && u.estrela === true));
const podeLancar = u => !!u && u.perfil !== 'visitante';
const userById = id => S.users.find(u => u.id === id) || null;
const nomeDe = id => { const u = userById(id); return u ? u.nome : '(usuário removido)'; };
const svStatus = u => !u ? 'ativo' : u.bloqueado ? 'inativo' : (u.status || 'ativo');
function supsOf(u) {
  const ids = (u && Array.isArray(u.superiores) ? u.superiores : []).filter(id => { const x = userById(id); return x && !x.bloqueado && isSup(x); });
  if (ids.length) return ids;
  return S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== (u && u.id)).map(x => x.id);
}
function semAusentes(ids) {
  const presentes = ids.filter(id => svStatus(userById(id)) !== 'ausente');
  if (presentes.length === ids.length) return ids;
  const pri = S.users.filter(x => isPrincipal(x) && !x.bloqueado && svStatus(x) !== 'ausente').map(x => x.id);
  return Array.from(new Set(ids.concat(pri)));
}
function validaData(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return 'Informe a data.';
  if (v > hojeISO()) return 'A data não pode ser no futuro.';
  if (v < '2000-01-01') return 'Data inválida.';
  return '';
}
const fmtDT = iso => iso ? fmtD(iso) + ' ' + String(new Date(iso).toTimeString()).slice(0, 5) : '—';
const svErro = e => /permission/i.test((e && (e.code || e.message)) || '') ? 'O Firebase não deixou gravar (permissão).' : (e && e.code === 'unavailable') ? 'Sem conexão: tente de novo.' : 'Não foi possível gravar: ' + ((e && (e.message || e.code)) || 'erro');

/* ---------- auditoria (o histórico de cada registro) ---------- */
const Audit = {
  log(rec) {
    const u = S.user; if (!u) return Promise.resolve();
    const o = { ts: nowISO(), userId: u.id, userName: u.nome, perfil: u.perfil, acao: rec.acao, entidade: rec.entidade || '', entidadeId: rec.entidadeId || '', resumo: rec.resumo || '',
      antes: rec.antes || null, depois: rec.depois || null, autorizadoPor: rec.autorizadoPor || null, versao: APP_NOME + ' ' + VERSAO };
    return Data.col('sv2_audit').add(o).catch(e => { console.error('audit', e); });
  }
};

/* ---------- avisos (sino) ---------- */
function notifDest(para) {
  if (Array.isArray(para)) return para.filter(Boolean).map(String);
  if (para === 'superiores') return ['sup'];
  if (para === 'principal') return ['principal'];
  return [String(para || 'todos')];
}
const notifChaves = u => !u ? [] : ['todos', u.id].concat(isSup(u) ? ['sup'] : []).concat(isPrincipal(u) ? ['principal'] : []);
function notifChegou() {
  const m = {}; Object.keys(S._notifPartes || {}).forEach(k => (S._notifPartes[k] || []).forEach(n => { m[n.id] = n; }));
  S.notifs = Object.keys(m).map(id => m[id]).filter(n => n.refTipo !== 'cnq').sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')));
  snAtualiza();
}
function notifDesligar() { (S._notifUn || []).forEach(f => { try { f(); } catch {} }); S._notifUn = []; S._notifChaves = ''; }
function notifLigar() {
  if (!S.user) return;
  const ch = notifChaves(S.user), chave = S._notifModo === 'antigo' ? 'antigo' : ch.join('|');
  if (S._notifChaves === chave && S._notifUn.length) return;
  notifDesligar(); S._notifChaves = chave; S._notifPartes = {};
  const antigo = () => { /* sem o índice no Firebase: escuta as últimas 300 e filtra aqui */
    if (S._notifModo === 'antigo') return; S._notifModo = 'antigo'; notifDesligar(); S._notifChaves = 'antigo'; S._notifPartes = {};
    S._notifUn.push(Data.col('sv2_notifs').watch(list => { S._notifPartes = { antigo: list }; notifChegou(); }, { order: 'ts', limit: 300 }));
  };
  if (S._notifModo === 'antigo') { S._notifModo = ''; antigo(); return; }
  ch.forEach(k => S._notifUn.push(Data.col('sv2_notifs').watch(list => { S._notifPartes[k] = list; notifChegou(); },
    { contem: ['dest', k], order: 'ts', limit: 300, onError: e => { console.warn('avisos (' + k + '):', e && e.code); if (e && e.code === 'failed-precondition') antigo(); } })));
}
const Notif = {
  send(n) {
    const o = { ts: nowISO(), nivel: n.nivel || 'info', titulo: n.titulo, texto: n.texto || '', para: n.para || 'todos', dest: notifDest(n.para || 'todos'),
      origem: S.user ? S.user.nome : 'Sistema', refTipo: n.refTipo || '', refId: n.refId || '', lidaPor: {}, confirmadaPor: {} };
    return Data.col('sv2_notifs').add(o);
  },
  visible(n) {
    const u = S.user; if (!u) return false;
    if (Array.isArray(n.para)) return n.para.indexOf(u.id) >= 0;
    return n.para === 'todos' || n.para === u.id || (n.para === 'superiores' && isSup(u)) || (n.para === 'principal' && isPrincipal(u));
  },
  mine() { return S.notifs.filter(n => Notif.visible(n)); },
  isRead(n) { return !!(n.lidaPor && n.lidaPor[S.user.id]); },
  isConfirmed(n) { return !!(n.confirmadaPor && n.confirmadaPor[S.user.id]); },
  unread() { return Notif.mine().filter(n => !Notif.isRead(n)); },
  read(id) { const n = S.notifs.find(x => x.id === id); if (!n || Notif.isRead(n)) return; Data.col('sv2_notifs').update(id, { ['lidaPor.' + S.user.id]: true }).catch(e => console.error(e)); },
  readAll() { Notif.unread().forEach(n => Notif.read(n.id)); },
  confirm(id) {
    const n = S.notifs.find(x => x.id === id); if (!n) return;
    Data.col('sv2_notifs').update(id, { ['confirmadaPor.' + S.user.id]: { ts: nowISO(), nome: S.user.nome }, ['lidaPor.' + S.user.id]: true }).catch(e => { console.error(e); aviso('Não foi possível confirmar.', 'erro'); });
    Audit.log({ acao: 'confirmar_alerta', entidade: 'notificacao', entidadeId: id, resumo: 'Confirmou ciência do alerta: ' + n.titulo });
  }
};

/* ---------- pedidos ao superior (autorizações) ---------- */
const APROV_APLICA = {}; /* APROV_APLICA[tipo] = async (payload, pedido) => … ; só os tipos com tela refeita aqui podem ser decididos no EFCwork */
const Aprov = {
  async pedir(p) {
    const u = S.user; if (!u) return null;
    const para = semAusentes((Array.isArray(p.para) && p.para.length) ? p.para : supsOf(u));
    if (!para.length) { aviso('Você ainda não tem superior cadastrado. Fale com o Administrador.', 'erro'); return null; }
    const o = { ts: nowISO(), tipo: p.tipo || 'geral', titulo: p.titulo, descricao: p.descricao || '', solicitanteId: u.id, solicitanteNome: u.nome, solicitantePerfil: u.perfil,
      paraIds: para, paraNomes: para.map(nomeDe), status: 'pendente', decisao: null, refTipo: p.refTipo || '', refId: p.refId || '', payload: p.payload || null };
    const id = await Data.col('sv2_aprov').add(o);
    await Notif.send({ nivel: 'aviso', titulo: 'Autorização pedida', texto: u.nome + ' pediu: ' + p.titulo, para: para, refTipo: 'aprovacao', refId: id });
    if (o.tipo === 'almox') {
      const cp = S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== u.id && para.indexOf(x.id) < 0).map(x => x.id);
      if (cp.length) await Notif.send({ nivel: 'info', titulo: 'Pedido do almoxarifado', texto: u.nome + ' pediu: ' + p.titulo + ' · aguarda ' + para.map(nomeDe).join(', '), para: cp, refTipo: 'aprovacao', refId: id }).catch(() => {});
    }
    Audit.log({ acao: 'pedir_autorizacao', entidade: 'aprovacao', entidadeId: id, resumo: 'Pediu autorização: ' + p.titulo + ' — para ' + para.map(nomeDe).join(', '), depois: { titulo: p.titulo, descricao: p.descricao || '', para: para.map(nomeDe).join(', ') } });
    return id;
  },
  podeDecidir(a) { const u = S.user; return !!u && a.status === 'pendente' && ((isSup(u) && (a.paraIds || []).indexOf(u.id) >= 0) || isPrincipal(u)); },
  pendentesParaMim() {
    const u = S.user; if (!u) return [];
    return S.aprov.filter(a => a.status === 'pendente' && ((a.paraIds || []).indexOf(u.id) >= 0 || (isPrincipal(u) && !(a.paraIds || []).some(id => { const x = userById(id); return x && !x.bloqueado && x.id !== a.solicitanteId; }))));
  },
  meusPendentes() { const u = S.user; return u ? S.aprov.filter(a => a.status === 'pendente' && a.solicitanteId === u.id) : []; },
  async decidir(id, ok, motivo) {
    const a = S.aprov.find(x => x.id === id); if (!a) return false;
    if (a.status !== 'pendente') { aviso('Esse pedido já foi decidido por ' + ((a.decisao && a.decisao.nome) || 'outra pessoa') + '.'); return false; }
    if (!Aprov.podeDecidir(a)) { aviso('Só quem foi indicado como superior (ou o Administrador) pode decidir.', 'erro'); return false; }
    if (!APROV_APLICA[a.tipo]) { aviso('Este pedido ainda é decidido no EFClaudian.', 'erro'); return false; }
    if (!ok && !motivo) { aviso('Escreva o motivo da reprovação.', 'erro'); return false; }
    const dec = { por: S.user.id, nome: S.user.nome, perfil: S.user.perfil, ts: nowISO(), motivo: motivo || '' };
    try { await Data.col('sv2_aprov').update(id, { status: ok ? 'aprovado' : 'reprovado', decisao: dec }); } catch (e) { aviso(svErro(e), 'erro'); return false; }
    if (ok && a.payload) { try { await APROV_APLICA[a.tipo](a.payload, Object.assign({ id: id }, a)); } catch (e) { aviso('Aprovado, mas não foi aplicado: ' + (e.message || svErro(e)), 'erro'); } }
    Notif.send({ nivel: ok ? 'info' : 'aviso', titulo: ok ? 'Autorização aprovada' : 'Autorização reprovada', texto: S.user.nome + (ok ? ' aprovou: ' : ' reprovou: ') + a.titulo + (motivo ? ' — ' + motivo : ''), para: [a.solicitanteId], refTipo: 'aprovacao', refId: id }).catch(() => {});
    Audit.log({ acao: ok ? 'aprovar' : 'reprovar', entidade: 'aprovacao', entidadeId: id, resumo: (ok ? 'Aprovou' : 'Reprovou') + ' o pedido de ' + a.solicitanteNome + ': ' + a.titulo + (motivo ? ' — motivo: ' + motivo : ''), antes: { status: 'pendente' }, depois: { status: ok ? 'aprovado' : 'reprovado', decidido_por: S.user.nome, motivo: motivo || '' }, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
    aviso(ok ? 'Aprovado.' : 'Reprovação registrada.');
    return true;
  }
};

/* ---------- carregar (todo mundo logado) ---------- */
CS_CARGAS.push(() => {
  S._notifModo = ''; notifLigar(); S._desl.push(notifDesligar);
  csOuve('sv2_users', l => {
    S.users = l; const me = l.find(x => x.id === S.user.id); if (!me) return;
    if (me.bloqueado || me.ativo === false) { csSair(); return; }
    const mudou = me.perfil !== S.user.perfil || !!me.estrela !== !!S.user.estrela || JSON.stringify(me.atrib || null) !== JSON.stringify(S.user.atrib || null);
    S.user = Object.assign({ id: S.user.id }, me); if (mudou) { notifLigar(); render(); }
  });
  csOuve('sv2_aprov', l => { S.aprov = l; snAtualiza(); }, { order: 'ts', limit: 400 });
});
