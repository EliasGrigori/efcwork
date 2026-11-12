/* EFCwork · inicio.js — Início: saudação, tarefas de hoje (do mesmo Firebase do EFClaudian), voltar para / mais usadas e o plano das áreas. Prefixo: ini. */
function iniSaudacao() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function iniMinhas() {
  const me = S.user.id, hoje = hojeISO();
  return (S.tarefas || []).filter(t => t.respId === me && t.status !== 'done' && t.status !== 'cancelada' && !t.excluida)
    .map(t => Object.assign({ _v: t.prazo && t.prazo < hoje, _h: t.prazo === hoje }, t))
    .sort((a, b) => String(a.prazo || '9999').localeCompare(String(b.prazo || '9999')) || String(a.hora || '').localeCompare(String(b.hora || '')));
}
TELAS.inicio = function () {
  const u = S.user, l = iniMinhas(), venc = l.filter(t => t._v).length, hoje = l.filter(t => t._h).length;
  const nome = String(u.nome || '').split(/\s+/)[0] || '';
  let h = cabecalho({ caminho: [(S.empresa && S.empresa.nome) || 'Sua empresa', 'Início'], titulo: iniSaudacao() + (nome ? ', ' + nome.charAt(0) + nome.slice(1).toLowerCase() : ''),
    meta: ['<span>' + dataLonga() + '</span>', metaPl(hoje + (hoje === 1 ? ' tarefa hoje' : ' tarefas hoje'), '', 'relogio')].concat(venc ? [metaPl(venc + (venc === 1 ? ' vencida' : ' vencidas'), 'cr', 'alerta')] : []),
    acoes: '<a class="bt" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">' + ic('externo') + 'Abrir o EFClaudian</a>' });
  /* tarefas */
  const lis = l.slice(0, 8).map(t => '<div class="li"><span class="ico' + (t._v ? ' ini-cr' : t._h ? ' ini-wa' : '') + '">' + ic(t._v ? 'alerta' : 'relogio') + '</span><span class="tx"><b>' + esc(t.titulo || '(sem título)') + '</b><small>' + (t.prazo ? 'prazo ' + fmtD(t.prazo) + (t.hora ? ' às ' + esc(t.hora) : '') : 'sem prazo') + '</small></span>' +
    '<span class="pill ' + (t._v ? 'cr' : t._h ? 'wa' : 'ok') + '">' + (t._v ? 'vencida' : t._h ? 'hoje' : 'no prazo') + '</span></div>').join('');
  const tarefas = '<section class="pn"><div class="hd"><h3>Minhas tarefas</h3><em>' + l.length + '</em><span class="sp"></span></div>' +
    (l.length ? lis + (l.length > 8 ? '<div class="li"><span class="tx"><small>+ ' + (l.length - 8) + ' tarefas. A lista completa está no EFClaudian.</small></span></div>' : '') :
      '<div class="vazio">' + ic('ok') + '<b>Nada pendente com o seu nome.</b><span>As tarefas que o EFClaudian atribuir a você aparecem aqui.</span></div>') + '</section>';
  /* voltar para / mais usadas */
  const o = csUsoLer(), atual = S.rota.area + (S.rota.aba ? '/' + S.rota.aba : '');
  const rec = o.r.filter(k => k !== atual && k !== 'inicio').slice(0, 4), top = Object.keys(o.n).filter(k => o.n[k] >= 2 && k !== 'inicio').sort((a, b) => o.n[b] - o.n[a]).slice(0, 5);
  const lk = (k, n) => '<a class="ini-at" href="#/' + k + '">' + ic(csArea(k.split('/')[0]).ic) + esc(csNomeRota(k)) + (n ? '<em>' + n + '×</em>' : '') + '</a>';
  const atalhos = '<section class="pn"><div class="hd"><h3>Atalhos</h3></div><div class="cpo">' +
    (rec.length ? '<div><p class="ini-sub">Voltar para</p><div class="ini-ats">' + rec.map(k => lk(k)).join('') + '</div></div>' : '') +
    (top.length ? '<div><p class="ini-sub">Mais usadas</p><div class="ini-ats">' + top.map(k => lk(k, o.n[k])).join('') + '</div></div>' : '') +
    (!rec.length && !top.length ? '<p class="ini-vz">As telas que você abrir aparecem aqui para voltar com um toque.</p>' : '') + '</div></section>';
  /* plano das áreas */
  const plano = '<section class="pn"><div class="hd"><h3>Áreas do ' + APP_NOME + '</h3><span class="sp"></span><span class="pill">em construção</span></div>' +
    AREAS.filter(a => a.versao).sort((a, b) => a.versao.localeCompare(b.versao)).map(a => '<a class="li ini-li" href="#/' + a.id + '"><span class="ico">' + ic(a.ic) + '</span><span class="tx"><b>' + esc(a.nome) + '</b><small>' + (a.parcial ? esc(a.parcial) : 'chega na ' + a.versao + '; até lá, continua no EFClaudian') + '</small></span>' + ic('seta') + '</a>').join('') + '</section>';
  let nums = '';
  if (typeof alVe === 'function' && alVe() && (S.almCarregado || DEMO)) {
    const r = alResumo();
    nums = '<div class="kps"><a class="kp' + (r.aten.length ? ' wa' : '') + '" href="#/almox/materiais" data-act="al-ir" data-f="atencao"><b class="num">' + r.aten.length + '</b><span>Materiais que pedem atenção</span></a>' +
      '<a class="kp' + (r.calV ? ' cr' : r.calA ? ' wa' : '') + '" href="#/almox/equipamentos"><b class="num">' + (r.calV + r.calA) + '</b><span>Calibrações vencidas ou a vencer</span></a>' +
      '<a class="kp' + (r.solP ? ' wa' : '') + '" href="#/almox/solicitacoes"><b class="num">' + r.solP + '</b><span>Solicitações pendentes</span></a>' +
      '<a class="kp' + (venc ? ' cr' : '') + '" href="#/inicio"><b class="num">' + venc + '</b><span>Tarefas vencidas</span></a></div>';
  }
  let cg = '';
  if (typeof cgAberta === 'function' && alVe()) { const c = cgAberta(); if (c && (c.contadorId === u.id || (alSup() && (c.recontar && Object.keys(c.recontar).some(k => c.recontar[k]) || cgProgresso(c).faltam.length === 0)))) { const pr = cgProgresso(c), pct = pr.total ? Math.round(pr.feitos / pr.total * 100) : 0, minha = c.contadorId === u.id;
    cg = '<a class="pn ini-cg" href="#/almox/contagem"><span class="ico ini-wa">' + ic('lista') + '</span><span class="tx"><b>' + (minha ? (pr.recontar.length ? 'Recontar ' + pr.recontar.length + ' material(is) · ' : 'Contagem para você · ') : 'Contagem para conferir · ') + esc(c.numero) + '</b><small>' + pr.feitos + ' de ' + pr.total + ' contados · ' + pct + '%</small></span><span class="ini-cgb"><i style="width:' + pct + '%"></i></span>' + ic('seta') + '</a>'; } }
  return h + cg + nums + '<div class="ini-gr"><div class="ini-col">' + tarefas + plano + '</div><div class="ini-col">' + atalhos + '</div></div>';
};
