/* EFCwork · semana.js — Relatórios › Semana (v0.6.19). Prefixo: sm.
   Traz do EFClaudian (v2.102.60) as duas coisas que lá se chamam "Semana":
   1) Relatórios da semana (openRelSemana/gerarRelSemana/rsDados): quatro partes de uma semana (segunda a domingo) — Apontamentos (reunião),
      Verificações de cloro, Coletas e remessas, Almoxarifado. Na tela e em papel (A4 deitado, uma parte depois da outra).
   2) Atividade por semana (viewSemana/semanaLinhas/arquivarSemana): ações de cada pessoa por semana ISO, só o Principal; "Arquivar" guarda
      o resumo da semana em sv2_resumos (id sem_AAAA-SNN, o mesmo documento dos dois apps).
   Quem vê: Líder ★ e Principal (como no EFClaudian, rsPode); a Atividade por pessoa e o Arquivar, só o Principal.
   Aviso de sexta, 13h (e sábado/domingo se ninguém abriu o app na sexta): uma notificação por semana, refTipo 'rel_semana' (a mesma do EFClaudian).
   Só leitura, a não ser o Arquivar. Nenhuma coleção nova. */
const smVe = () => !!S.user && isSup(S.user);
const smPrincipal = () => !!S.user && isPrincipal(S.user);
const SM_PARTES = [['apont', 'Apontamentos (reunião)'], ['cloro', 'Verificações de cloro'], ['coletas', 'Coletas e remessas'], ['almox', 'Almoxarifado']];
const SM_HORA = 13, SM_SEMANAS = 12;
S.sm = { ver: 'rel', seg: '', partes: { apont: true, cloro: true, coletas: true, almox: true }, aberto: false };
S.resumos = S.resumos || [];

/* ---------- semana ---------- */
const smSeg = iso => addDias(iso, -((new Date(iso + 'T12:00:00').getDay() + 6) % 7));
const smSemAtual = () => smSeg(hojeISO());
const smSegSel = () => S.sm.seg || smSemAtual();
function smIsoSem(iso) { /* semana ISO "AAAA-SNN", igual ao isoSemana do EFClaudian (o id do arquivo é sem_AAAA-SNN) */
  const s = String(iso || ''), d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + 'T12:00:00') : new Date(s), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dia); const a1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t.getUTCFullYear() + '-S' + pad(Math.ceil((((t - a1) / 864e5) + 1) / 7));
}
const smCurto = iso => String(fmtD(iso)).slice(0, 5);
const smFaixa = seg => smCurto(seg) + ' a ' + smCurto(addDias(seg, 6));
function smOpcoesSemana() {
  const atual = smSemAtual(), o = []; for (let k = 0; k < SM_SEMANAS; k++) { const s = addDias(atual, -7 * k); o.push([s, smFaixa(s) + (k === 0 ? ' · esta semana' : '')]); }
  const sel = smSegSel(); if (!o.some(x => x[0] === sel)) o.push([sel, smFaixa(sel)]);
  return o;
}

/* ---------- carga: quem vê a Semana sem ver a área de origem carrega o que precisa ---------- */
CS_CARGAS.push(() => {
  if (!smVe()) return;
  const re = () => { if (S.rota.area === 'relatorios' || S.rota.area === 'inicio') render(); };
  if (!coVe() && !rtVe()) coOuveColetas(re);
  if (!alVe()) csOuve('sv2_alm_mov', l => { S.almMov = l || []; re(); }, { order: 'criadoEm', limit: 3000 });
  if (smPrincipal()) csOuve('sv2_resumos', l => { S.resumos = l || []; if (S.rota.area === 'relatorios') render(); });
  setTimeout(() => { try { smAviso(); } catch (e) { console.error(e); } }, 6000);
});

/* ---------- aviso de sexta ---------- */
const smHora = agora => { const d = agora || new Date(), w = d.getDay(); return (w === 5 && d.getHours() >= SM_HORA) || w === 6 || w === 0; };
function smAviso(agora) {
  const u = S.user; if (!smVe() || !smHora(agora)) return 0;
  const seg = smSeg(hojeISO());
  if ((S.notifs || []).some(n => n.refTipo === 'rel_semana' && n.refId === seg && Notif.visible(n))) return 0;
  S._smAv = S._smAv || {}; if (S._smAv[u.id + seg]) return 0; S._smAv[u.id + seg] = true;
  Notif.send({ nivel: 'info', titulo: 'Salvar os relatórios da semana?', texto: 'Semana de ' + fmtD(seg) + ' a ' + fmtD(addDias(seg, 6)) + ': apontamentos, cloro, coletas e remessas e almoxarifado, num PDF só.', para: [u.id], refTipo: 'rel_semana', refId: seg }).catch(() => {});
  return 1;
}

/* ---------- dados da semana ---------- */
function smDados(seg) {
  const fim = addDias(seg, 6), dentro = d => !!d && d >= seg && d <= fim, dia = d => diaLocal(d);
  const gi = g => AP_GRAV.findIndex(x => x[0] === g), ord = (a, b) => gi(b.grav) - gi(a.grav) || String(a.data + (a.hora || '')).localeCompare(String(b.data + (b.hora || '')));
  const ap = S.apont || [], col = typeof coAtivas === 'function' ? coAtivas() : [];
  return {
    seg: seg, fim: fim,
    ap: ap.filter(a => dentro(a.data)).sort(ord), apAnt: ap.filter(a => a.data < seg && apAberto(a)).sort(ord),
    cloro: (S.cloro || []).filter(r => dentro(r.data)).sort((a, b) => String(a.data + a.hora).localeCompare(String(b.data + b.hora))),
    col: col.filter(c => dentro(c.data)).sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(coNome(a)).localeCompare(String(coNome(b)))),
    env: col.filter(c => c.enviado && dentro(c.envio ? dia(c.envio) : '')).sort((a, b) => String(a.envio).localeCompare(String(b.envio))),
    agua: (typeof agAtivas === 'function' ? agAtivas() : []).filter(a => dentro(a.data)),
    mov: (S.almMov || []).filter(m => !m.anulada && dentro(m.data)).sort((a, b) => String(a.data + (a.criadoEm || '')).localeCompare(String(b.data + (b.criadoEm || ''))))
  };
}
const smForaFaixa = l => l.filter(r => { const f = clFaixaDe(r); return f === 'baixo' || f === 'alto'; }).length;

/* ---------- partes (a mesma montagem serve a tela e o papel) ---------- */
const smPl = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
const smDc = iso => iso ? fmtD(iso).replace(/\/\d{2}(\d{2})$/, '/$1') : '';
function smTab(cab, linhas, vazio) {
  if (!linhas.length) return '<p class="sm-vz">' + esc(vazio) + '</p>';
  return '<div class="sm-tw"><table class="sm-t"><thead><tr>' + cab.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    linhas.map(l => '<tr>' + l.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
const smSec = (id, t, sub, corpo) => '<section class="sm-sec" data-parte="' + esc(id) + '"><h2>' + esc(t) + '<small>' + esc(sub) + '</small></h2>' + corpo + '</section>';
const smH3 = t => '<h3 class="sm-h3">' + esc(t) + '</h3>';
function smApLinha(a) { return [esc(smDc(a.data)), esc(a.setor || ''), esc(apCat(a.categoria)[1]), apGravPill(a), apStPill(a), esc(a.obs || ''), a.nc ? esc(ncRot(a)) : '']; }
const ncRot = a => a.nc.fechada ? 'NC fechada' : (a.nc.prazo && a.nc.prazo < hojeISO() ? 'NC vencida' : 'NC aberta');
const SM_AP_CAB = ['Data', 'Setor', 'Categoria', 'Gravidade', 'Situação', 'Observação', 'NC'];
function smParte(id, d) {
  if (id === 'apont') return smSec(id, 'Apontamentos da reunião', d.ap.length + ' na semana · ' + smPl(d.apAnt.length, 'pendente', 'pendentes') + ' de semanas anteriores',
    smH3('Na semana') + smTab(SM_AP_CAB, d.ap.map(smApLinha), 'Nenhum apontamento nesta semana.') + (d.apAnt.length ? smH3('Pendentes de semanas anteriores') + smTab(SM_AP_CAB, d.apAnt.map(smApLinha), '') : ''));
  if (id === 'cloro') return smSec(id, 'Verificações de cloro', smPl(d.cloro.length, 'verificação', 'verificações') + ' · ' + smForaFaixa(d.cloro) + ' fora da faixa',
    smTab(['Data', 'Hora', 'Ponto', 'Local', 'Cloro (ppm)', 'Faixa', 'Por'], d.cloro.map(r => [esc(smDc(r.data)), esc(r.hora || ''), esc(r.pontoNome || ''), esc(r.local || ''), esc(ppm(r.valor)), esc(clFaixaTxt(clFaixaDe(r))), esc(r.lancadoPorNome || '')]), 'Nenhuma verificação nesta semana.'));
  if (id === 'coletas') return smSec(id, 'Coletas e remessas', smPl(d.col.length, 'coletada', 'coletadas') + ' · ' + smPl(d.env.length, 'enviada', 'enviadas') + (d.agua.length ? ' · ' + d.agua.length + ' de água' : ''),
    smH3('Coletadas na semana') + smTab(['Data', 'Tipo', 'Talhão / local', 'Análise', 'Coletor', 'Laboratório', 'Enviada'], d.col.map(c => [esc(smDc(c.data)), esc(CO_TXT[c.tipo] || c.tipo || ''), esc(coNome(c)), esc(c.analiseNome || ''), esc(c.coletor || ''), esc(c.lab || ''), c.enviado ? esc(smDc(diaLocal(c.envio))) : 'não']), 'Nenhuma coleta nesta semana.') +
    smH3('Enviadas na semana') + smTab(['Envio', 'Tipo', 'Talhão / local', 'Análise', 'Laboratório', 'O.S', 'Laudo previsto'], d.env.map(c => [esc(smDc(diaLocal(c.envio))), esc(CO_TXT[c.tipo] || c.tipo || ''), esc(coNome(c)), esc(c.analiseNome || ''), esc(c.lab || ''), esc(c.os || '—'), esc(smDc(addDias(diaLocal(c.envio), coLabPrazo(c.lab))))]), 'Nenhum envio nesta semana.') +
    (d.agua.length ? smH3('Coletas de água') + smTab(['Data', 'Tipo', 'Ponto', 'Análise', 'Laboratório', 'Resultado'], d.agua.map(a => [esc(smDc(a.data)), esc(agTipoTxt(a)), esc(a.pontoNome || ''), esc(a.analiseNome || ''), esc(a.lab || ''), esc((a.resultado || '') + (agNC(a) ? ' · ' + agAgenteTxt(a) + (a.gravidade ? ' · ' + a.gravidade : '') : ''))]), '') : ''));
  return smSec(id, 'Movimentações do almoxarifado', smPl(d.mov.length, 'movimentação', 'movimentações'),
    smTab(['Data', 'Tipo', 'Item', 'Qtd', 'Lote', 'Motivo / documento', 'Por'], d.mov.map(m => [esc(smDc(m.data)), esc(AL_TIPO[m.tipo] || m.tipo || ''), esc(m.itemNome || ''), esc((m.tipo === 'saida' || m.tipo === 'abrir' ? '−' : '') + alQ(m.qtd)), esc(m.lote || ''), esc(m.motivo || (m.doc ? 'Doc. ' + m.doc : '')), esc(m.porNome || '')]), 'Nenhuma movimentação nesta semana.'));
}
const smPartesOn = () => SM_PARTES.map(p => p[0]).filter(k => S.sm.partes[k]);
const smCorpo = d => smPartesOn().map(k => smParte(k, d)).join('') || '<section class="pn"><div class="vazio"><b>Nenhuma parte marcada.</b><span>Abra o Filtro e marque as partes que quer ver.</span></div></section>';
function smResumo(d) {
  return rlResumo([[String(d.ap.length), 'apontamentos', smPl(d.apAnt.length, 'pendente antigo', 'pendentes antigos')], [String(d.cloro.length), 'verificações de cloro', smForaFaixa(d.cloro) + ' fora da faixa'],
    [String(d.col.length), 'coletadas', d.agua.length + ' de água'], [String(d.env.length), 'enviadas', ''], [String(d.mov.length), 'movimentações', 'no almoxarifado']]);
}

/* ---------- atividade por semana (só o Principal) ---------- */
function smLinhasAtiv() {
  const mapa = {};
  (S.audit || []).forEach(r => {
    if (!r.ts || !r.userId) return;
    const sem = smIsoSem(diaLocal(r.ts)), k = sem + '|' + r.userId, m = mapa[k] || (mapa[k] = { semana: sem, userId: r.userId, nome: r.userName || '', acoes: 0, ultima: r.ts, origem: 'Ao vivo' });
    m.acoes++; if (r.ts > m.ultima) m.ultima = r.ts;
  });
  const vivas = Object.keys(mapa).map(k => mapa[k]), ch = {}; vivas.forEach(v => { ch[v.semana + '|' + v.userId] = true; });
  const arq = [];
  (S.resumos || []).forEach(rz => (rz.linhas || []).forEach(l => { if (ch[rz.semana + '|' + l.userId]) return; arq.push({ semana: rz.semana, userId: l.userId, nome: l.nome || '', acoes: l.acoes, ultima: l.ultima, origem: 'Arquivada' }); }));
  return vivas.concat(arq).sort((a, b) => String(b.semana).localeCompare(String(a.semana)) || b.acoes - a.acoes || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
}
async function smArquivar(sem) {
  if (!smPrincipal()) return;
  const linhas = smLinhasAtiv().filter(l => l.semana === sem && l.origem === 'Ao vivo').map(l => ({ userId: l.userId, nome: l.nome, acoes: l.acoes, ultima: l.ultima }));
  if (!linhas.length) { aviso('Nada para arquivar nessa semana.'); return; }
  try {
    await Data.col('sv2_resumos').set('sem_' + sem, { semana: sem, linhas: linhas, geradoEm: nowISO(), geradoPor: S.user.id, geradoPorNome: S.user.nome });
    Audit.log({ acao: 'arquivar_semana', entidade: 'resumo', entidadeId: 'sem_' + sem, resumo: 'Arquivou o resumo da semana ' + sem + ' (' + linhas.length + ' pessoa(s))', depois: { semana: sem, pessoas: linhas.length } });
    aviso('Semana ' + sem + ' arquivada.');
  } catch (e) { aviso('Não foi possível arquivar: ' + svErro(e), 'erro'); }
}

/* ---------- tela ---------- */
const smVerTxt = () => S.sm.ver === 'ativ' ? 'Atividade por pessoa' : 'Relatório da semana';
const smResumoFiltro = () => S.sm.ver === 'ativ' ? smVerTxt() : smVerTxt() + ' · ' + smFaixa(smSegSel());
function smFiltroHTML() {
  const f = S.sm, ops = [['rel', 'Relatório da semana']].concat(smPrincipal() ? [['ativ', 'Atividade por pessoa']] : []);
  let h = '<div class="sm-fp"' + (f.aberto ? '' : ' hidden') + '><label class="cp">Mostrar' + ddHTML('sm:ver', f.ver, ops) + '</label>';
  if (f.ver === 'rel') h += '<label class="cp">Semana' + ddHTML('sm:seg', smSegSel(), smOpcoesSemana()) + '</label>' +
    '<div class="cp sm-pt"><span>Partes</span><div>' + SM_PARTES.map(p => '<label class="sm-ck"><input type="checkbox" data-act="sm-parte" data-k="' + esc(p[0]) + '"' + (f.partes[p[0]] ? ' checked' : '') + '><span>' + esc(p[1]) + '</span></label>').join('') + '</div></div>';
  return h + '</div>';
}
function smTela() {
  const f = S.sm, ent = f._ent; f._ent = false;
  if (f.ver === 'ativ' && !smPrincipal()) f.ver = 'rel';
  const bar = '<div class="sm-bar"><button type="button" class="at-fl" data-act="sm-filtro" aria-expanded="' + esc(String(f.aberto)) + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(smResumoFiltro()) + '</small></button></div>' + smFiltroHTML();
  if (f.ver === 'ativ') {
    const l = smLinhasAtiv(), sem = l.length ? l[0].semana : smIsoSem(hojeISO());
    const c = cabecalho({ titulo: 'Semana', abaNome: 'Semana', acoes: '<button type="button" class="bt" data-act="sm-arq" data-id="' + esc(sem) + '" title="Guarda o resumo desta semana para sempre">Arquivar ' + esc(sem) + '</button>' });
    return c + '<div class="sm' + (ent ? ' sm-ent' : '') + '">' + bar + tbHTML({ id: 'sm-ativ', titulo: 'Atividade por semana', unidade: 'linhas', unidade1: 'linha', linhas: l, chave: x => [x.semana, x.userId, x.origem].join('|'), vazio: 'Ainda não há atividade registrada.',
      busca: x => x.nome + ' ' + x.semana, cols: [{ k: 'se', rot: 'Semana', v: x => x.semana }, { k: 'pe', rot: 'Pessoa', v: x => x.nome, cls: 'forte' }, { k: 'ac', rot: 'Ações', tipo: 'num', v: x => x.acoes }, { k: 'ul', rot: 'Última ação', tipo: 'data', v: x => x.ultima, html: x => esc(fmtDT(x.ultima)) }, { k: 'or', rot: 'Origem', v: x => x.origem }] }) + '</div>';
  }
  const d = smDados(smSegSel());
  const c = cabecalho({ titulo: 'Semana', abaNome: 'Semana', acoes: '<button type="button" class="bt ic-so" data-act="sm-imp" title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button>' });
  return c + '<div class="sm' + (ent ? ' sm-ent' : '') + '">' + bar + smResumo(d) + smCorpo(d) + '</div>';
}
const smQual = TELAS.relatorios;
TELAS.relatorios = aba => aba === 'semana' ? (smVe() ? smTela() : '') : (smQual ? smQual(aba) : '');

/* ---------- papel ---------- */
function smImprimir() {
  const d = smDados(smSegSel()), e = S.empresa || {}; let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  const partes = smPartesOn(); if (!partes.length) { aviso('Marque pelo menos uma parte no Filtro.', 'erro'); return; }
  p.innerHTML = '<div class="imp-cab"><b>Relatórios da semana · ' + esc(fmtD(d.seg)) + ' a ' + esc(fmtD(d.fim)) + '</b><span>' + esc(e.nome || '') + ' · ' + esc(fmtD(hojeISO())) + '</span></div><div class="sm sm-imp">' + smCorpo(d) + '</div><div class="imp-pe">' + esc(APP_APELIDO) + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'relatorio_semana', entidadeId: d.seg, resumo: 'Imprimiu os relatórios da semana de ' + fmtD(d.seg) + ' (' + partes.join(', ') + ')' });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.sm = (k, v) => { if (k === 'ver') S.sm.ver = v; else if (k === 'seg') S.sm.seg = v; else return; S.sm._ent = true; render(); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="sm-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'sm-filtro') { S.sm.aberto = !S.sm.aberto; render(); }
  else if (a === 'sm-imp') smImprimir();
  else if (a === 'sm-arq') smArquivar(t.getAttribute('data-id'));
  else if (a === 'sm-parte') { S.sm.partes[t.getAttribute('data-k')] = !!t.checked; S.sm._ent = true; render(); }
});
/* Esc fecha uma camada de cada vez: aqui só o painel do filtro */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || S.rota.area !== 'relatorios' || S.rota.aba !== 'semana' || (S.camadas && S.camadas.length) || document.querySelector('.dd-l:not([hidden]):not(.dd-fant)')) return;
  if (S.sm.aberto) { S.sm.aberto = false; render(); }
});
