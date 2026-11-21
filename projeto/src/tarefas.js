/* EFCwork · tarefas.js — Meu dia: as tarefas na Início (v0.6.28). Prefixo: tf.
   Antes o EFCwork só lia as tarefas do EFClaudian. Agora cria, atribui, anda e conclui aqui, no mesmo sv2_tarefas:
   titulo, descricao, respId, respNome, prazo, hora, status (todo | doing | done | cancelada), criadoPor, criadoPorNome, criadoEm,
   concluidaEm, concluidaPorNome, canceladaMotivo, hist[]. v0.6.32: + porId (quem gravou), que a regra do Firestore exige para passar tarefa a outra pessoa
   (sem ele, o Líder ★ e o Administrador eram barrados ao criar para um liderado e quem passou não conseguia editar nem cancelar). Os campos que a Início já lia (titulo, respId, prazo, hora, status, excluida) não mudam.
   Quem passa tarefa para outra pessoa: Líder ★ e Administrador (para os liderados e para quem quiser); o Colaborador cria só para si.
   Quem mexe: o responsável (andar, concluir), quem criou e o Administrador (editar, cancelar). Aviso no sino para quem recebe e, ao concluir, para quem passou. */
/* v0.6.28 (pedido do Elias 20/11 14:39): tarefas que se repetem e agenda. Campo repete: util (seg a sex) | diaria | semanal | quinzenal | mensal | anual,
   serieId (a mesma em todas as vezes). Ao concluir ou cancelar "só esta vez", a próxima nasce sozinha com o prazo seguinte (dias perdidos não se acumulam:
   a próxima é a primeira data a partir de hoje). Quem programa para outra pessoa: o Administrador para todos; o Líder ★ para os liderados dele. */
const TF_REP = [['', 'Não repete'], ['util', 'Todo dia útil (seg a sex)'], ['diaria', 'Todo dia'], ['semanal', 'Toda semana'], ['quinzenal', 'A cada 15 dias'], ['mensal', 'Todo mês'], ['anual', 'Todo ano']];
const TF_REP_CURTO = { util: 'todo dia útil', diaria: 'todo dia', semanal: 'toda semana', quinzenal: 'a cada 15 dias', mensal: 'todo mês', anual: 'todo ano' };
function tfPasso(iso, rep) {
  if (rep === 'diaria') return addDias(iso, 1); if (rep === 'semanal') return addDias(iso, 7); if (rep === 'quinzenal') return addDias(iso, 14);
  if (rep === 'mensal') return eqAddMeses(iso, 1); if (rep === 'anual') return eqAddMeses(iso, 12);
  let d = addDias(iso, 1); while ([0, 6].indexOf(new Date(d + 'T12:00:00').getDay()) >= 0) d = addDias(d, 1); return d; /* util */
}
function tfProxima(t) { const h = hojeISO(); let d = tfPasso(t.prazo || h, t.repete), n = 0; while (d < h && n++ < 4000) d = tfPasso(d, t.repete); return d; }
const TF_ST = { todo: ['A fazer', ''], doing: ['Em andamento', 'wa'], done: ['Concluída', 'ok'], cancelada: ['Cancelada', ''] };
Object.assign(S, { tfVer: 'minhas', tfTodas: false });
const tfAberta = t => t.status !== 'done' && t.status !== 'cancelada' && !t.excluida;
const tfDe = id => (S.tarefas || []).find(t => t.id === id) || null;
const tfPodeDar = () => !!S.user && isSup(S.user);
const tfPodeEditar = t => !!S.user && (t.criadoPor === S.user.id || isPrincipal(S.user));
const tfPodeAndar = t => !!S.user && (t.respId === S.user.id || tfPodeEditar(t)) && podeLancar(S.user);
const tfOrd = (a, b) => String(a.prazo || '9999').localeCompare(String(b.prazo || '9999')) || String(a.hora || '').localeCompare(String(b.hora || '')) || String(a.criadoEm || '').localeCompare(String(b.criadoEm || ''));
const tfHist = (t, txt) => (Array.isArray(t.hist) ? t.hist : []).concat([{ ts: nowISO(), porNome: S.user.nome, txt }]);
const tfRepTxt = t => t.repete && TF_REP_CURTO[t.repete] ? 'repete ' + TF_REP_CURTO[t.repete] : '';
function tfLista() {
  const me = S.user.id, l = (S.tarefas || []).filter(tfAberta);
  return (S.tfVer === 'passei' ? l.filter(t => t.criadoPor === me && t.respId !== me) : l.filter(t => t.respId === me)).sort(tfOrd);
}
/* agenda: Atrasadas · Hoje · Próximos 7 dias · Mais adiante · Sem prazo */
function tfGrupo(t) { const h = hojeISO(); if (!t.prazo) return 'sem'; if (t.prazo < h) return 'atr'; if (t.prazo === h) return 'hoje'; return t.prazo <= addDias(h, 7) ? 'sem7' : 'depois'; }
const TF_GR = [['atr', 'Atrasadas'], ['hoje', 'Hoje'], ['sem7', 'Próximos 7 dias'], ['depois', 'Mais adiante'], ['sem', 'Sem prazo']];
function tfLinha(t) {
  const g = tfGrupo(t), quem = S.tfVer === 'passei' ? 'para ' + (t.respNome || nomeDe(t.respId)) : (t.criadoPor && t.criadoPor !== S.user.id ? 'de ' + (t.criadoPorNome || nomeDe(t.criadoPor)) : '');
  const quando = t.prazo ? (g === 'hoje' ? 'hoje' : fmtD(t.prazo)) + (t.hora ? ' às ' + t.hora : '') : 'sem prazo';
  const pill = g === 'atr' ? ['vencida', 'cr'] : t.status === 'doing' ? ['em andamento', 'wa'] : g === 'hoje' ? ['hoje', 'wa'] : ['no prazo', 'ok'];
  return '<button type="button" class="li tf-li" data-act="tf-abre" data-id="' + esc(t.id) + '"><span class="ico' + (g === 'atr' ? ' ini-cr' : g === 'hoje' ? ' ini-wa' : '') + '">' + ic(t.repete ? 'recontar' : g === 'atr' ? 'alerta' : 'relogio') + '</span><span class="tx"><b>' + esc(t.titulo || '(sem título)') + '</b><small>' +
    esc([quem, quando, tfRepTxt(t)].filter(Boolean).join(' · ')) + '</small></span><span class="pill ' + esc(pill[1]) + '">' + esc(pill[0]) + '</span></button>';
}
function tfPainel() {
  const l = tfLista(), lim = S.tfTodas ? 1e9 : 10; let n = 0, corpo = '';
  TF_GR.forEach(gr => { const g = l.filter(t => tfGrupo(t) === gr[0]); if (!g.length) return; const urg = gr[0] === 'atr' || gr[0] === 'hoje', v = urg ? g : g.slice(0, Math.max(0, lim - n)); if (!v.length) return; n += v.length;
    corpo += '<p class="tf-gh">' + esc(gr[1]) + ' <em>' + esc(String(g.length)) + '</em></p>' + v.map(tfLinha).join(''); });
  const resto = l.length - n;
  return '<section class="pn tf-pn"><div class="hd">' + (tfPodeDar() ? ddHTML('tf:ver', S.tfVer, [['minhas', 'Minhas tarefas'], ['passei', 'Que eu passei']]) : '<h3>Minhas tarefas</h3>') + '<em>' + esc(String(l.length)) + '</em><span class="sp"></span>' +
    (podeLancar(S.user) ? '<button type="button" class="bt ic-so" data-act="tf-nova" title="Nova tarefa ou rotina" aria-label="Nova tarefa ou rotina">' + ic('mais') + '</button>' : '') + '</div>' +
    (l.length ? corpo + (resto > 0 ? '<button type="button" class="li tf-mais" data-act="tf-todas"><span class="tx"><small>Mostrar as outras ' + esc(String(resto)) + '</small></span></button>' : '')
      : '<div class="vazio">' + ic('ok') + '<b>' + (S.tfVer === 'passei' ? 'Nenhuma tarefa sua com outra pessoa.' : 'Nada pendente com o seu nome.') + '</b><span>Toque no + para anotar uma tarefa ou criar uma rotina' + (tfPodeDar() ? ', para você ou para a sua equipe' : '') + '.</span></div>') + '</section>';
}

/* ---------- detalhe ---------- */
function tfAbre(id) { gvAbrir(() => tfGaveta(id)); }
function tfGaveta(id) {
  const t = tfDe(id); if (!t) return null; const s = TF_ST[t.status] || TF_ST.todo, ab = tfAberta(t);
  let c = (t.descricao ? '<p class="tf-ds">' + esc(t.descricao) + '</p>' : '') + gvCampos([['Responsável', t.respNome || nomeDe(t.respId)], ['Prazo', t.prazo ? fmtD(t.prazo) + (t.hora ? ' às ' + t.hora : '') : 'sem prazo'],
    ['Repete', t.repete ? (TF_REP.find(r => r[0] === t.repete) || ['', ''])[1] + (ab ? ' · a próxima será em ' + fmtD(tfProxima(t)) : '') : ''], ['Criada por', (t.criadoPorNome || nomeDe(t.criadoPor)) + (t.criadoEm ? ' · ' + fmtD(diaLocal(t.criadoEm)) : '')],
    ['Concluída', t.status === 'done' ? (t.concluidaPorNome || '') + (t.concluidaEm ? ' · ' + fmtD(diaLocal(t.concluidaEm)) : '') : ''], ['Cancelada', t.status === 'cancelada' ? (t.canceladaMotivo || '') : '']]);
  const hs = (Array.isArray(t.hist) ? t.hist : []).slice(-6);
  if (hs.length) c += '<p class="gv-h">Andamento</p>' + tlFluido('tf-' + t.id, hs.map(x => ({ nome: x.txt, feito: true, data: diaLocal(x.ts), quem: x.porNome })));
  const pe = ab && tfPodeAndar(t) ? (t.status !== 'doing' ? '<button type="button" class="bt" data-act="tf-andar" data-id="' + esc(t.id) + '">' + ic('relogio') + 'Comecei</button>' : '') + '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="tf-ok" data-id="' + esc(t.id) + '">' + ic('ok') + 'Concluir</button>' : '';
  return { ico: t.repete ? 'recontar' : 'relogio', sub: 'Meu dia' + (t.repete ? ' · rotina' : ''), titulo: t.titulo || '(sem título)', pill: '<span class="pill ' + esc(s[1]) + '">' + esc(s[0]) + '</span>',
    cabAcoes: ab && tfPodeEditar(t) ? '<button type="button" class="bt ic-so" data-act="tf-editar" data-id="' + esc(t.id) + '" title="Editar" aria-label="Editar">' + ic('lapis') + '</button>' : '',
    lixeira: ab && tfPodeEditar(t) ? { act: 'tf-canc', id: t.id, titulo: 'Cancelar a tarefa' } : null, corpo: c, rodape: pe };
}

/* ---------- nova e editar ---------- */
const tfPessoas = () => S.users.filter(u => !u.bloqueado && u.ativo !== false && u.perfil !== 'visitante' && (isPrincipal(S.user) || u.id === S.user.id || (u.superiores || []).indexOf(S.user.id) >= 0)).sort((a, b) => (a.id !== S.user.id) - (b.id !== S.user.id) || cmpTxt(a.nome, b.nome));
function tfNova() { if (!podeLancar(S.user)) return; lcAbrir({ k: 'tfEd', id: '', titulo: '', descricao: '', resp: S.user.id, prazo: hojeISO(), hora: '', repete: '' }); }
function tfEditar(id) { const t = tfDe(id); if (!t || !tfPodeEditar(t)) return; lcAbrir({ k: 'tfEd', id: t.id, titulo: t.titulo || '', descricao: t.descricao || '', resp: t.respId, prazo: t.prazo || '', hora: t.hora || '', repete: t.repete || '' }, () => tfAbre(t.id)); }
LC_FORM.tfEd = f => {
  const ps = tfPessoas(), dica = f.repete && f.prazo ? 'Depois de ' + fmtD(f.prazo) + ', a próxima será em ' + fmtD(tfPasso(f.prazo, f.repete)) + (f.repete === 'semanal' || f.repete === 'quinzenal' ? ' (' + DIAS[new Date(f.prazo + 'T12:00:00').getDay()] + ')' : '') + '. Ao concluir uma, a seguinte aparece sozinha.' : '';
  const c = lcMsg() + lcBl('O que fazer', lcIn('titulo', f.titulo, ' maxlength="120" placeholder="ex.: Conferir o cloro dos bebedouros"')) + lcBl('Detalhes', lcTx('descricao', f.descricao, 'opcional')) +
    (tfPodeDar() && ps.length > 1 ? lcBl('Para quem', ddHTML('tf:resp', f.resp, ps.map(u => [u.id, u.nome + (u.id === S.user.id ? ' (eu)' : '')])), isPrincipal(S.user) ? '' : 'você e os seus liderados') : '') +
    '<div class="fm-g cl-fm2">' + lcBl(f.repete ? 'Primeira vez' : 'Prazo', lcData('prazo', f.prazo, true)) + lcBl('Hora', '<input class="fm-i" type="time" data-fm="hora" value="' + esc(f.hora || '') + '">', 'opcional') + '</div>' +
    lcBl('Repete', ddHTML('tf:repete', f.repete, TF_REP)) + (dica ? lcAv(esc(dica)) : '');
  return { ico: 'relogio', sub: 'Meu dia', titulo: f.id ? 'Editar a tarefa' : 'Nova tarefa ou rotina', corpo: c, rodape: lcPe('tf-ed-ok', f.id ? 'Salvar' : 'Criar') };
};
function tfEdOk() {
  const f = S.fm; if (!f) return; const titulo = String(f.titulo || '').replace(/\s+/g, ' ').trim(), resp = tfPodeDar() ? f.resp : S.user.id, ru = userById(resp);
  if (titulo.length < 3) return lcErro('Escreva o que precisa ser feito.');
  if (!ru || !tfPessoas().some(u => u.id === ru.id)) return lcErro('Escolha para quem é a tarefa (você ou um liderado seu).');
  if (f.prazo && !dataOk(f.prazo)) return lcErro('Data do prazo inválida.');
  if (f.repete && !f.prazo) return lcErro('Uma rotina precisa da data da primeira vez.');
  if (!f.id && f.prazo && f.prazo < hojeISO()) return lcErro('O prazo não pode ser antes de hoje.');
  if (!lcTravar()) return;
  const x = f.id ? tfDe(f.id) : null, o = { titulo, descricao: String(f.descricao || '').trim(), respId: ru.id, respNome: ru.nome, prazo: f.prazo || '', hora: f.hora || '', repete: f.repete || '', alteradoEm: nowISO() };
  const avisa = id => { if (ru.id !== S.user.id && (!x || x.respId !== ru.id)) Notif.send({ nivel: 'aviso', titulo: (o.repete ? 'Rotina para você: ' : 'Tarefa para você: ') + titulo, texto: (o.prazo ? (o.repete ? 'Começa em ' : 'Prazo ') + fmtD(o.prazo) + (o.hora ? ' às ' + o.hora : '') + '. ' : '') + (o.repete ? 'Repete ' + TF_REP_CURTO[o.repete] + '. ' : '') + 'Passada por ' + S.user.nome + '.', para: [ru.id], refTipo: 'tarefa', refId: id }).catch(() => {}); };
  if (x) {
    o.hist = tfHist(x, x.respId !== ru.id ? 'Passou para ' + ru.nome : 'Editou a tarefa'); if (o.repete && !x.serieId) o.serieId = x.id;
    if (!x.porId && x.criadoPor && isPrincipal(S.user)) o.porId = x.criadoPor; /* v0.6.32: tarefa antiga sem porId (a regra só deixa quem passou mexer se o porId for dele) */
    Audit.log({ acao: 'editar_tarefa', entidade: 'tarefa', entidadeId: x.id, resumo: 'Editou a tarefa ' + titulo });
    avisa(x.id); f.volta = null; lcGrava([Data.col('sv2_tarefas').update(x.id, o)], 'Tarefa salva.', () => tfAbre(x.id));
  } else {
    const id = Data.novoId('sv2_tarefas'); Object.assign(o, { status: 'todo', serieId: o.repete ? id : '', porId: S.user.id, criadoPor: S.user.id, criadoPorNome: S.user.nome, criadoEm: nowISO(), hist: [{ ts: nowISO(), porNome: S.user.nome, txt: (o.repete ? 'Criou a rotina (' + TF_REP_CURTO[o.repete] + ')' : 'Anotou a tarefa') + (ru.id === S.user.id ? '' : ' para ' + ru.nome) }] });
    Audit.log({ acao: 'criar_tarefa', entidade: 'tarefa', entidadeId: id, resumo: 'Criou ' + (o.repete ? 'a rotina ' : 'a tarefa ') + titulo + (ru.id !== S.user.id ? ' para ' + ru.nome : '') + (o.repete ? ' (' + TF_REP_CURTO[o.repete] + ')' : '') });
    avisa(id); lcGrava([Data.col('sv2_tarefas').set(id, o)], (o.repete ? 'Rotina criada' : 'Tarefa anotada') + (ru.id === S.user.id ? '.' : ' para ' + ru.nome + '.'), () => { if (!S.tarefas.some(t => t.id === id)) S.tarefas.push(Object.assign({ id }, o)); if (S.gv) gvFecharSo(); render(); });
  }
}

/* ---------- andar, concluir, cancelar; a rotina gera a próxima ---------- */
function tfGrava(t, patch, msg, depois) { return Data.col('sv2_tarefas').update(t.id, patch).then(() => { Object.assign(t, patch); aviso(msg); if (depois) depois(); }).catch(e => aviso(svErro(e), 'erro')); }
function tfSeguinte(t) {
  if (!t.repete) return null; const id = Data.novoId('sv2_tarefas'), pz = tfProxima(t);
  const o = { titulo: t.titulo, descricao: t.descricao || '', respId: t.respId, respNome: t.respNome || nomeDe(t.respId), prazo: pz, hora: t.hora || '', repete: t.repete, serieId: t.serieId || t.id, status: 'todo', porId: S.user.id,
    criadoPor: t.criadoPor || S.user.id, criadoPorNome: t.criadoPorNome || S.user.nome, criadoEm: nowISO(), hist: [{ ts: nowISO(), porNome: S.user.nome, txt: 'Rotina: próxima vez' }] };
  Data.col('sv2_tarefas').set(id, o).then(() => { if (!S.tarefas.some(x => x.id === id)) S.tarefas.push(Object.assign({ id }, o)); render(); }).catch(e => aviso(svErro(e), 'erro'));
  return pz;
}
function tfAndar(id) { const t = tfDe(id); if (!t || !tfPodeAndar(t)) return; tfGrava(t, { status: 'doing', hist: tfHist(t, 'Começou') }, 'Marcada como em andamento.', () => { if (S.gv) gvDesenha(); render(); }); }
function tfConcluir(id) {
  const t = tfDe(id); if (!t || !tfPodeAndar(t)) return;
  tfGrava(t, { status: 'done', concluidaEm: nowISO(), concluidaPor: S.user.id, concluidaPorNome: S.user.nome, hist: tfHist(t, 'Concluiu') }, 'Tarefa concluída.', () => {
    const pz = tfSeguinte(t); if (pz) aviso('Concluída. A próxima fica para ' + fmtD(pz) + '.');
    Audit.log({ acao: 'concluir_tarefa', entidade: 'tarefa', entidadeId: t.id, resumo: 'Concluiu a tarefa ' + t.titulo });
    if (t.criadoPor && t.criadoPor !== S.user.id && !t.repete) Notif.send({ nivel: 'info', titulo: 'Tarefa concluída: ' + t.titulo, texto: 'Concluída por ' + S.user.nome + '.', para: [t.criadoPor], refTipo: 'tarefa', refId: t.id }).catch(() => {});
    if (S.gv) gvFecharSo(); render(); });
}
function tfCanc(id) { const t = tfDe(id); if (!t || !tfPodeEditar(t)) return; lcAbrir({ k: 'tfCanc', id: t.id, motivo: '', alcance: t.repete ? 'esta' : '' }, () => tfAbre(t.id)); }
LC_FORM.tfCanc = f => { const t = tfDe(f.id); if (!t) return null;
  return { ico: 'relogio', sub: t.titulo, titulo: 'Cancelar a tarefa', corpo: lcMsg() + (t.repete ? lcBl('O que cancelar', ddHTML('tf:alcance', f.alcance, [['esta', 'Só esta vez (a rotina continua)'], ['todas', 'Esta e as próximas (a rotina para)']])) : '') +
    lcAv('Nada se apaga.') + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: não precisa mais')), rodape: lcPe('tf-canc-ok', 'Cancelar') }; };
function tfCancOk() {
  const f = S.fm, t = f && tfDe(f.id); if (!t) return; const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.'); if (!lcTravar()) return;
  const para = t.repete && f.alcance === 'todas';
  Audit.log({ acao: 'cancelar_tarefa', entidade: 'tarefa', entidadeId: t.id, resumo: (para ? 'Parou a rotina ' : 'Cancelou a tarefa ') + t.titulo + ': ' + m });
  if (t.respId !== S.user.id) Notif.send({ nivel: 'info', titulo: (para ? 'Rotina parada: ' : 'Tarefa cancelada: ') + t.titulo, texto: 'Por ' + S.user.nome + ': ' + m, para: [t.respId], refTipo: 'tarefa', refId: t.id }).catch(() => {});
  if (t.repete && !para) tfSeguinte(t);
  f.volta = null; lcGrava([Data.col('sv2_tarefas').update(t.id, { status: 'cancelada', canceladaMotivo: m, canceladaEm: nowISO(), canceladaPor: S.user.nome, hist: tfHist(t, (para ? 'Parou a rotina: ' : 'Cancelou: ') + m) })], para ? 'Rotina parada.' : 'Tarefa cancelada.', () => { if (S.gv) gvFecharSo(); render(); });
}

/* ---------- eventos ---------- */
DD_AO.tf = (k, v) => {
  if (k === 'ver') { S.tfVer = v; S.tfTodas = false; render(); return; }
  if (!S.fm) return; S.fm.sujo = true;
  if (k === 'resp') S.fm.resp = v; else if (k === 'repete') { S.fm.repete = v; gvDesenha(true); } else if (k === 'alcance') S.fm.alcance = v;
};
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && t.getAttribute('data-fm') === 'prazo' && S.fm && S.fm.k === 'tfEd' && S.fm.repete) gvDesenha(true); });
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="tf-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'tf-abre') tfAbre(id); else if (a === 'tf-nova') tfNova(); else if (a === 'tf-editar') tfEditar(id); else if (a === 'tf-ed-ok') tfEdOk();
  else if (a === 'tf-andar') tfAndar(id); else if (a === 'tf-ok') tfConcluir(id); else if (a === 'tf-canc') tfCanc(id); else if (a === 'tf-canc-ok') tfCancOk();
  else if (a === 'tf-todas') { S.tfTodas = true; render(); }
});
