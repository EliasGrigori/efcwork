/* EFCwork · almox.js — Almoxarifado (v0.2: consulta; v0.3: os botões de lançar chamam lanca.js). Painel, Materiais, Movimentações, Solicitações e Equipamentos com a tabela padrão e a gaveta.
   Prefixo: al (materiais) e eq (equipamentos). Os cálculos de saldo por lote vieram do EFClaudian v2.102.59 sem mudança (alIdx, alSit…),
   para os números baterem com os do EFClaudian. Lê sv2_alm_itens, sv2_alm_mov, sv2_alm_sol, sv2_alm_equip. Os lançamentos ficam em lanca.js. */
const ALM_VENCE_DIAS = 30, EQ_AVENCER = 40, ALM_MOV_LIM = 10000;
const AL_TIPO = { inicial: 'Conferência inicial', entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste', abrir: 'Frasco aberto', fim: 'Frasco terminou' };
const AL_SOL_ST = { pendente: ['Pendente', 'wa'], atendida: ['Atendida', 'ok'], cancelada: ['Cancelada', ''] };
const EQ_SIT = { ativo: ['Em uso', 'ok'], restricao: ['Uso com restrição', 'wa'], manutencao: ['Em manutenção', 'wa'], armazenado: ['Armazenado', ''], baixa: ['Baixado', ''] };
const EQ_CAL = { sem: ['Sem calibração', 'cr'], vencida: ['Vencida', 'cr'], avencer: ['A vencer', 'wa'], ok: ['Em dia', 'ok'], pausada: ['Pausada (guardado)', ''] };
Object.assign(S, { almItens: [], almMov: [], almSol: [], almEq: [], almCarregado: false, almErro: '' });

/* ---------- permissões (como no EFClaudian: Principal vê tudo; cadastro sem atribuições vê tudo) ---------- */
const atribLegado = u => !u || u.atrib == null || typeof u.atrib !== 'object';
function temAtrib(u, id) { if (!u) return false; if (isPrincipal(u) || atribLegado(u)) return true; return u.atrib[id] === true; }
const alVe = () => temAtrib(S.user, 'almox');

/* ---------- datas ---------- */
function addDias(iso, n) { const p = iso.split('-').map(Number); const t = new Date(p[0], p[1] - 1, p[2] + n); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); }
function eqAddMeses(iso, n) { const p = String(iso).split('-').map(Number); const t = new Date(p[0], p[1] - 1 + Number(n || 0), p[2]); if (t.getDate() !== p[2]) t.setDate(0); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); }

/* ---------- cálculos (EFClaudian v2.102.59) ---------- */
const alR = n => Math.round((Number(n) || 0) * 1000) / 1000;
const alQ = n => numBR(alR(n));
const alItem = id => S.almItens.find(i => i.id === id) || null;
const alAtivos = () => S.almItens.filter(i => i.ativo !== false).sort((a, b) => String(a.nome).localeCompare(b.nome, 'pt-BR'));
const alVencido = l => !!l.validade && l.validade < hojeISO();
const alAVencer = l => !!l.validade && !alVencido(l) && l.validade <= addDias(hojeISO(), ALM_VENCE_DIAS);
const alFefo = (a, b) => { const x = a.validade || '9999', y = b.validade || '9999'; return x < y ? -1 : x > y ? 1 : String(a.data || '') < String(b.data || '') ? -1 : String(a.data || '') > String(b.data || '') ? 1 : String(a.id) < String(b.id) ? -1 : 1; };
let _alIdx = null, _alIdxRef = null;
function alIdx() {
  if (_alIdxRef === S.almMov && _alIdx) return _alIdx;
  const lots = {}, porItem = {};
  S.almMov.forEach(m => {
    if (m.anulada || (m.tipo !== 'entrada' && m.tipo !== 'inicial')) return;
    const l = { id: m.id, itemId: m.itemId, lote: m.lote || '', validade: m.validade || '', preco: Number(m.preco) || 0, data: m.data || '', ent: Number(m.qtd) || 0, saldo: Number(m.qtd) || 0 };
    lots[m.id] = l; (porItem[m.itemId] = porItem[m.itemId] || []).push(l);
  });
  S.almMov.forEach(m => {
    if (m.anulada) return; const l = lots[m.lotRef]; if (!l) return;
    if (m.tipo === 'saida' || m.tipo === 'abrir') l.saldo -= Number(m.qtd) || 0;
    if (m.tipo === 'ajuste') l.saldo += Number(m.qtd) || 0;
  });
  Object.keys(porItem).forEach(k => { porItem[k].forEach(l => { l.saldo = alR(l.saldo); }); porItem[k].sort(alFefo); });
  _alIdx = { lots: lots, porItem: porItem }; _alIdxRef = S.almMov;
  return _alIdx;
}
const alLotes = (itemId, todos) => (alIdx().porItem[itemId] || []).filter(l => todos || l.saldo > 0);
const alSaldo = itemId => alR(alLotes(itemId).reduce((s, l) => s + l.saldo, 0));
const alDisp = itemId => alR(alLotes(itemId).filter(l => !alVencido(l)).reduce((s, l) => s + l.saldo, 0));
const alValorEst = itemId => alLotes(itemId).reduce((s, l) => s + l.saldo * l.preco, 0);
function alSit(i) {
  const ls = alLotes(i.id), sal = alSaldo(i.id);
  if (i.ativo === false) return { id: 'inativo', txt: 'Inativo', cor: '' };
  if (ls.some(alVencido)) return { id: 'vencido', txt: 'Lote vencido', cor: 'cr' };
  if (sal <= 0) return { id: 'zero', txt: 'Sem saldo', cor: 'cr' };
  if (Number(i.min) > 0 && sal < Number(i.min)) return { id: 'min', txt: 'Abaixo do mínimo', cor: 'wa' };
  if (ls.some(alAVencer)) return { id: 'avencer', txt: 'Vence em até ' + ALM_VENCE_DIAS + ' dias', cor: 'wa' };
  return { id: 'ok', txt: 'Em dia', cor: 'ok' };
}
const alAtencao = i => ['vencido', 'zero', 'min', 'avencer'].indexOf(alSit(i).id) >= 0;
const alFator = i => { const f = Number(i && i.fator) || 1; return f > 1 ? f : 1; };
function alMedidor(i) {
  const min = Number(i.min) || 0; if (!min || i.ativo === false) return '';
  const d = alDisp(i.id), p = Math.max(4, Math.min(100, d / (2 * min) * 100)), cor = d <= 0 ? 'var(--cr)' : d < min ? 'var(--wa)' : 'var(--ok)';
  return '<span class="tb-med" aria-hidden="true"><i style="width:' + p.toFixed(0) + '%;background:' + cor + '"></i></span>';
}
/* equipamentos */
const eqNomeC = e => (e.tag ? e.tag + ' · ' : '') + e.nome;
function eqProxima(e) { const c = e.cal || {}; return c.ultima ? eqAddMeses(c.ultima, c.freqMeses || 12) : ''; }
function eqCalSit(e) {
  if (!e.precisaCal || e.situacao === 'baixa') return '';
  if (e.situacao === 'armazenado' && !e.calGuardado) return 'pausada';
  const c = e.cal || {}; if (!c.ultima) return 'sem';
  const p = eqProxima(e), h = hojeISO();
  return p < h ? 'vencida' : p <= addDias(h, EQ_AVENCER) ? 'avencer' : 'ok';
}
function eqLocal(e) {
  if (e.tipo === 'qtd') return Object.keys(e.qtdLocal || {}).filter(k => Number(e.qtdLocal[k])).map(k => k + ' ' + e.qtdLocal[k]).join(' · ') || '—';
  return [e.local, e.posicao].filter(Boolean).join(' · ') + (e.transito ? ' · em trânsito' : '') || '—';
}
const eqQtd = e => e.tipo === 'qtd' ? Object.keys(e.qtdLocal || {}).reduce((s, k) => s + (Number(e.qtdLocal[k]) || 0), 0) : 1;

/* ---------- carregar (só quem tem a atribuição do Almoxarifado) ---------- */
CS_CARGAS.push(() => {
  if (!alVe()) return;
  const re = () => { _alIdx = null; S.almCarregado = true; if (S.rota.area === 'almox' || S.rota.area === 'inicio') render(); };
  csOuve('sv2_alm_itens', l => { S.almItens = l; re(); });
  csOuve('sv2_alm_mov', l => { S.almMov = l; S.almErro = ''; re(); }, { order: 'criadoEm', limit: ALM_MOV_LIM, onError: e => { S.almErro = 'Não foi possível carregar as movimentações (' + ((e && e.code) || 'erro') + '). Os saldos podem estar errados.'; re(); } });
  csOuve('sv2_alm_sol', l => { S.almSol = l; re(); }, { order: 'criadoEm', limit: 3000 });
  csOuve('sv2_alm_equip', l => { S.almEq = l; re(); });
});

/* ---------- telas ---------- */
const alPill = (txt, cor) => '<span class="pill ' + (cor || '') + '">' + esc(txt) + '</span>';
function alSemAcesso() { return cabecalho({ titulo: 'Almoxarifado' }) + '<section class="pn"><div class="vazio">' + ic('caixa') + '<b>Você não tem acesso ao Almoxarifado.</b><span>Peça ao administrador para marcar a atribuição Almoxarifado no seu cadastro.</span></div></section>'; }
function alResumo() {
  const at = alAtivos(), aten = at.filter(alAtencao), val = at.reduce((s, i) => s + alValorEst(i.id), 0);
  const eqs = S.almEq.filter(e => e.situacao !== 'baixa'), calV = eqs.filter(e => eqCalSit(e) === 'vencida' || eqCalSit(e) === 'sem').length, calA = eqs.filter(e => eqCalSit(e) === 'avencer').length;
  return { at: at, aten: aten, val: val, eqs: eqs, calV: calV, calA: calA, solP: S.almSol.filter(x => x.situacao === 'pendente').length };
}
function alIrMateriais(filtro) { const st = tbEstado('al-mat'); st.filtros = filtro ? { sit: filtro } : {}; st.busca = ''; ir('almox', 'materiais'); }
function alPainel() {
  const r = alResumo(), mes = hojeISO().slice(0, 7);
  const sai = S.almMov.filter(m => !m.anulada && m.tipo === 'saida' && String(m.data || '').slice(0, 7) === mes);
  const valSai = sai.reduce((s, m) => s + (Number(m.qtd) || 0) * (Number(m.preco) || 0), 0);
  const top = {}; sai.forEach(m => { top[m.itemId] = (top[m.itemId] || 0) + (Number(m.qtd) || 0); });
  const topL = Object.keys(top).sort((a, b) => top[b] - top[a]).slice(0, 5);
  const avencer = r.at.filter(i => alLotes(i.id).some(alAVencer)).length;
  let h = '<div class="kps al-kps">' +
    '<a class="kp" href="#/almox/materiais" data-act="al-ir" data-f=""><b class="num">' + r.at.length + '</b><span>Itens ativos</span></a>' +
    '<a class="kp' + (r.aten.length ? ' wa' : '') + '" href="#/almox/materiais" data-act="al-ir" data-f="atencao"><b class="num">' + r.aten.length + '</b><span>Pedem atenção</span></a>' +
    '<a class="kp" href="#/almox/materiais" data-act="al-ir-valor"><b class="num">' + esc(brl(r.val)) + '</b><span>Valor em estoque</span></a>' +
    '<a class="kp' + (r.calV ? ' cr' : r.calA ? ' wa' : '') + '" href="#/almox/equipamentos"><b class="num">' + (r.calV + r.calA) + '</b><span>Calibrações vencidas ou a vencer</span></a></div>';
  if (S.almErro) h += '<p class="al-aviso cr">' + ic('alerta') + esc(S.almErro) + '</p>';
  else if (avencer || r.solP) h += '<p class="al-aviso">' + ic('info') + [avencer ? avencer + (avencer === 1 ? ' item tem' : ' itens têm') + ' lote vencendo em até ' + ALM_VENCE_DIAS + ' dias' : '', r.solP ? r.solP + (r.solP === 1 ? ' solicitação pendente' : ' solicitações pendentes') : ''].filter(Boolean).join(' · ') + '</p>';
  const crit = typeof alCtrl === 'function' && alCtrl(S.user) ? alCritPend() : [];
  if (crit.length) h += '<section class="pn"><div class="hd"><h3>Produto crítico: confirmar saída</h3><em>' + crit.length + '</em></div>' + crit.slice(0, 6).map(m => '<button type="button" class="li al-li" data-act="al-mov" data-id="' + esc(m.id) + '"><span class="tx"><b>' + esc(m.itemNome) + '</b><small>' + alQ(m.qtd) + ' · ' + esc(AL_TIPO[m.tipo] || '') + ' · ' + fmtD(m.data) + ' · ' + esc(m.porNome || '') + (m.motivo ? ' · ' + esc(m.motivo) : '') + '</small></span>' + alPill('Aguardando', 'wa') + '</button>').join('') + '</section>';
  const aten = r.aten.slice().sort((a, b) => ['vencido', 'zero', 'min', 'avencer'].indexOf(alSit(a).id) - ['vencido', 'zero', 'min', 'avencer'].indexOf(alSit(b).id)).slice(0, 8);
  h += '<div class="al-gr"><section class="pn"><div class="hd"><h3>Pedem atenção</h3><em>' + r.aten.length + '</em><span class="sp"></span>' + (r.aten.length > 8 ? '<a class="bt lk" href="#/almox/materiais" data-act="al-ir" data-f="atencao">Ver todos</a>' : '') + '</div>' +
    (aten.length ? aten.map(i => { const s = alSit(i); return '<button type="button" class="li al-li" data-act="al-item" data-id="' + esc(i.id) + '"><span class="tx"><b>' + esc(i.nome) + '</b><small>' + esc([i.codigo, i.local].filter(Boolean).join(' · ')) + ' · utilizável ' + alQ(alDisp(i.id)) + ' ' + esc(i.un || '') + (Number(i.min) ? ' (mín. ' + alQ(i.min) + ')' : '') + '</small></span>' + alPill(s.txt, s.cor) + '</button>'; }).join('') : '<div class="vazio">' + ic('ok') + '<b>Tudo em dia.</b></div>') + '</section>' +
    '<div class="al-col"><section class="pn"><div class="hd"><h3>Saídas deste mês</h3><span class="sp"></span><span class="pill">' + sai.length + ' · ' + esc(brl(valSai)) + '</span></div>' +
    (topL.length ? topL.map(id => { const i = alItem(id); return '<div class="li"><span class="tx"><b>' + esc(i ? i.nome : '(item removido)') + '</b></span><span class="num al-q">' + alQ(top[id]) + ' ' + esc(i ? i.un || '' : '') + '</span></div>'; }).join('') : '<div class="vazio"><span>Nenhuma saída este mês.</span></div>') + '</section>' +
    '<section class="pn"><div class="hd"><h3>Calibrações</h3><span class="sp"></span><a class="bt lk" href="#/almox/equipamentos">Ver equipamentos</a></div>' +
    (function () { const l = r.eqs.filter(e => ['vencida', 'sem', 'avencer'].indexOf(eqCalSit(e)) >= 0).sort((a, b) => String(eqProxima(a) || '0').localeCompare(String(eqProxima(b) || '0'))).slice(0, 5);
      return l.length ? l.map(e => { const c = eqCalSit(e); return '<button type="button" class="li al-li" data-act="al-eq" data-id="' + esc(e.id) + '"><span class="tx"><b>' + esc(eqNomeC(e)) + '</b><small>' + (eqProxima(e) ? 'próxima ' + fmtD(eqProxima(e)) : 'sem data de calibração') + '</small></span>' + alPill(EQ_CAL[c][0], EQ_CAL[c][1]) + '</button>'; }).join('') : '<div class="vazio">' + ic('ok') + '<span>Nenhuma calibração vencida ou a vencer em ' + EQ_AVENCER + ' dias.</span></div>'; })() + '</section></div></div>';
  return h;
}
function alTabMateriais() {
  const linhas = S.almItens.slice().sort((a, b) => String(a.nome).localeCompare(b.nome, 'pt-BR'));
  const locais = Array.from(new Set(linhas.map(i => i.local).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return tbHTML({ id: 'al-mat', titulo: 'Materiais', unidade: 'itens', linhas: linhas, aoClicar: alAbreItem, selecionado: S._alSel, buscaDica: 'Buscar item, código ou local',
    busca: i => [i.nome, i.codigo, i.local].join(' '),
    filtros: [
      { k: 'sit', rot: 'Situação', opcoes: [['atencao', 'Pedem atenção'], ['min', 'Abaixo do mínimo'], ['zero', 'Sem saldo'], ['vencido', 'Lote vencido'], ['avencer', 'Vence em até 30 dias'], ['ok', 'Em dia'], ['inativo', 'Inativos']], teste: (i, v) => v === 'atencao' ? alAtencao(i) : alSit(i).id === v },
      { k: 'loc', rot: 'Local', opcoes: locais.map(x => [x, x]), teste: (i, v) => i.local === v }],
    cols: [
      { k: 'cod', rot: 'Código', v: i => i.codigo || '' },
      { k: 'nome', rot: 'Item', fixa: true, v: i => i.nome, cls: 'forte' },
      { k: 'loc', rot: 'Local', v: i => i.local || '' },
      { k: 'un', rot: 'Un', v: i => i.un || '' },
      { k: 'disp', rot: 'Utilizável', tipo: 'num', v: i => alDisp(i.id), html: i => '<span class="num">' + alQ(alDisp(i.id)) + '</span>' + alMedidor(i), total: 'soma' },
      { k: 'min', rot: 'Mínimo', tipo: 'num', v: i => Number(i.min) || 0 },
      { k: 'val', rot: 'Valor', tipo: 'num', v: i => Math.round(alValorEst(i.id) * 100) / 100, dec: 2, html: i => esc(brl(alValorEst(i.id))), total: 'soma', fmtTotal: brl },
      { k: 'sit', rot: 'Situação', v: i => alSit(i).txt, html: i => { const s = alSit(i); return alPill(s.txt, s.cor); } }] });
}
function alSitMov(m) { return m.anulada ? ['Anulada', ''] : m.critico && m.critico.st === 'nao_confere' ? ['Não confere', 'cr'] : m.historico && m.historico.length ? ['Corrigida', ''] : ['', '']; }
function alTabMov() {
  const h = hojeISO(), mes = h.slice(0, 7), ant = (function () { const p = h.split('-').map(Number); const d = new Date(p[0], p[1] - 2, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); })();
  const linhas = S.almMov.slice().sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')) || String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')));
  const vt = m => alR((Number(m.qtd) || 0) * (Number(m.preco) || 0));
  return tbHTML({ id: 'al-mov', titulo: 'Movimentações', unidade: 'movimentações', linhas: linhas, aoClicar: alAbreMov, selecionado: S._alSel, buscaDica: 'Buscar item, lote, motivo ou pessoa',
    busca: m => [m.itemNome, m.lote, m.motivo, m.doc, m.porNome, AL_TIPO[m.tipo]].join(' '),
    filtros: [
      { k: 'per', rot: 'Período', opcoes: [['mes', 'Este mês'], ['ant', 'Mês passado'], ['90', 'Últimos 90 dias']], teste: (m, v) => v === 'mes' ? String(m.data || '').slice(0, 7) === mes : v === 'ant' ? String(m.data || '').slice(0, 7) === ant : String(m.data || '') >= addDias(h, -90) },
      { k: 'tipo', rot: 'Tipo', opcoes: [['saida', 'Saídas'], ['entrada', 'Entradas'], ['ajuste', 'Ajustes'], ['inicial', 'Conferência inicial'], ['abrir', 'Frascos abertos'], ['fim', 'Frascos que terminaram']], teste: (m, v) => m.tipo === v }],
    cols: [
      { k: 'data', rot: 'Data', tipo: 'data', v: m => m.data || '' },
      { k: 'tipo', rot: 'Tipo', v: m => AL_TIPO[m.tipo] || m.tipo, html: m => alPill(AL_TIPO[m.tipo] || m.tipo, m.tipo === 'saida' ? 'wa' : m.tipo === 'ajuste' ? '' : 'ok') },
      { k: 'item', rot: 'Item', fixa: true, v: m => m.itemNome || '', cls: 'forte' },
      { k: 'qtd', rot: 'Qtd', tipo: 'num', v: m => (m.tipo === 'saida' || m.tipo === 'abrir' ? -1 : 1) * (Number(m.qtd) || 0) },
      { k: 'lote', rot: 'Lote', v: m => m.lote || '' },
      { k: 'valid', rot: 'Validade', tipo: 'data', v: m => m.validade || '' },
      { k: 'vt', rot: 'Valor', tipo: 'num', dec: 2, v: vt, html: m => esc(brl(vt(m))) },
      { k: 'mot', rot: 'Motivo / documento', v: m => m.tipo === 'saida' || m.tipo === 'ajuste' ? (m.motivo || '') + (m.kit ? ' (kit ' + m.kit + ')' : '') : (m.doc ? 'Doc. ' + m.doc : m.motivo || '') },
      { k: 'quem', rot: 'Quem', v: m => m.porNome || '' },
      { k: 'sit', rot: 'Situação', v: m => alSitMov(m)[0], html: m => { const s = alSitMov(m); return s[0] ? alPill(s[0], s[1]) : ''; } }],
    rodape: l => { const e = l.filter(m => m.tipo === 'entrada' && !m.anulada).reduce((s, m) => s + vt(m), 0), sa = l.filter(m => m.tipo === 'saida' && !m.anulada).reduce((s, m) => s + vt(m), 0); return 'Entradas <b>' + esc(brl(e)) + '</b> · Saídas <b>' + esc(brl(sa)) + '</b>'; } });
}
function alTabSol() {
  const linhas = S.almSol.slice().sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
  return tbHTML({ id: 'al-sol', titulo: 'Solicitações', unidade: 'solicitações', linhas: linhas, aoClicar: alAbreSol, selecionado: S._alSel, buscaDica: 'Buscar número, solicitante ou item',
    busca: x => [x.numero, x.solicitante, x.liberador, x.obs].concat((x.linhas || []).map(l => l.nome)).join(' '),
    filtros: [{ k: 'sit', rot: 'Situação', opcoes: [['pendente', 'Pendentes'], ['atendida', 'Atendidas'], ['cancelada', 'Canceladas']], teste: (x, v) => (x.situacao || 'pendente') === v }],
    cols: [
      { k: 'num', rot: 'Nº', fixa: true, v: x => x.numero || '', cls: 'forte' },
      { k: 'data', rot: 'Data', tipo: 'data', v: x => x.data || '' },
      { k: 'sol', rot: 'Solicitante', v: x => x.solicitante || '' },
      { k: 'itens', rot: 'Itens', v: x => (x.linhas || []).map(l => alQ(l.qtd) + ' ' + l.nome).join(', ') },
      { k: 'prev', rot: 'Previsão', tipo: 'data', v: x => x.previsao || '' },
      { k: 'sit', rot: 'Situação', v: x => (AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente)[0], html: x => { const s = AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente; return alPill(s[0], s[1]); } }] });
}
function alTabEq() {
  const linhas = S.almEq.slice().sort((a, b) => eqNomeC(a).localeCompare(eqNomeC(b), 'pt-BR'));
  return tbHTML({ id: 'al-eq', titulo: 'Equipamentos', unidade: 'equipamentos', linhas: linhas, aoClicar: alAbreEq, selecionado: S._alSel, buscaDica: 'Buscar TAG, nome, marca ou local',
    busca: e => [e.tag, e.nome, e.marca, e.modelo, e.serie, e.local, e.posicao].join(' '),
    filtros: [
      { k: 'sit', rot: 'Situação', opcoes: Object.keys(EQ_SIT).map(k => [k, EQ_SIT[k][0]]), teste: (e, v) => (e.situacao || 'ativo') === v },
      { k: 'cal', rot: 'Calibração', opcoes: [['atencao', 'Vencida, sem ou a vencer']].concat(Object.keys(EQ_CAL).map(k => [k, EQ_CAL[k][0]])), teste: (e, v) => v === 'atencao' ? ['vencida', 'sem', 'avencer'].indexOf(eqCalSit(e)) >= 0 : eqCalSit(e) === v }],
    cols: [
      { k: 'tag', rot: 'TAG', v: e => e.tag || '' },
      { k: 'nome', rot: 'Equipamento', fixa: true, v: e => e.nome || '', cls: 'forte' },
      { k: 'marca', rot: 'Marca', v: e => e.marca || '' },
      { k: 'loc', rot: 'Local', v: e => eqLocal(e) },
      { k: 'qtd', rot: 'Qtd', tipo: 'num', v: eqQtd },
      { k: 'sit', rot: 'Situação', v: e => (EQ_SIT[e.situacao] || EQ_SIT.ativo)[0], html: e => { const s = EQ_SIT[e.situacao] || EQ_SIT.ativo; return alPill(s[0], s[1]); } },
      { k: 'prox', rot: 'Próxima calibração', tipo: 'data', v: e => e.precisaCal ? eqProxima(e) : '' },
      { k: 'cal', rot: 'Calibração', v: e => { const c = eqCalSit(e); return c ? EQ_CAL[c][0] : ''; }, html: e => { const c = eqCalSit(e); return c ? alPill(EQ_CAL[c][0], EQ_CAL[c][1]) : '<span class="tb-nada">não calibra</span>'; } }] });
}
TELAS.almox = function (aba) {
  if (!alVe()) return alSemAcesso();
  const r = alResumo(), ar = csArea('almox'), t = ar.abas.find(x => x.id === aba) || ar.abas[0];
  const meta = aba === 'materiais' ? [ '<span>' + r.at.length + ' itens ativos</span>', metaPl(brl(r.val) + ' em estoque'), r.aten.length ? metaPl(r.aten.length + ' pedem atenção', 'wa', 'alerta') : '' ]
    : aba === 'equipamentos' ? ['<span>' + r.eqs.length + ' equipamentos</span>', r.calV ? metaPl(r.calV + ' calibração vencida ou sem data', 'cr', 'alerta') : '', r.calA ? metaPl(r.calA + ' a vencer', 'wa') : '']
    : aba === 'solicitacoes' ? [r.solP ? metaPl(r.solP + ' pendentes', 'wa') : '<span>Nenhuma pendente</span>'] : aba === 'painel' ? ['<span>' + dataLonga() + '</span>'] : [];
  const ext = '<a class="bt ic-so" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener" title="No EFClaudian: cadastro de material, kits, fotos e inventário" aria-label="Abrir o EFClaudian (cadastro de material, kits, fotos e inventário)">' + ic('externo') + '</a>';
  const acoes = !alPode() ? ext : aba === 'solicitacoes' ? '<button type="button" class="bt pr" data-act="lc-sol">' + ic('mais') + 'Nova solicitação</button>' + ext
    : aba === 'equipamentos' ? ext : '<button type="button" class="bt" data-act="lc-ent">' + ic('entra') + 'Entrada</button><button type="button" class="bt pr" data-act="lc-sai">' + ic('sai') + 'Saída</button>' + ext;
  let h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: meta.filter(Boolean), acoes: acoes });
  if (!S.almCarregado && !DEMO) return h + '<section class="pn"><div class="vazio">' + ic('relogio') + '<b>Carregando o estoque…</b></div></section>';
  h += aba === 'materiais' ? alTabMateriais() : aba === 'movimentacoes' ? alTabMov() : aba === 'solicitacoes' ? alTabSol() : aba === 'equipamentos' ? alTabEq() : alPainel();
  return h;
};

/* ---------- gavetas ---------- */
function alAbreItem(id) {
  S._alSel = id; gvAbrir(() => {
    const i = alItem(id); if (!i) return null;
    const s = alSit(i), ls = alLotes(i.id), d = alDisp(i.id), min = Number(i.min) || 0;
    const movs = S.almMov.filter(m => m.itemId === i.id).sort((a, b) => String(b.criadoEm || b.data || '').localeCompare(String(a.criadoEm || a.data || ''))).slice(0, 10);
    const consumo = (function () { const de = addDias(hojeISO(), -90); const q = S.almMov.filter(m => m.itemId === i.id && !m.anulada && m.tipo === 'saida' && String(m.data || '') >= de).reduce((s2, m) => s2 + (Number(m.qtd) || 0), 0); return q ? numBR(q / 3, 1) + ' ' + (i.un || '') + '/mês' : ''; })();
    return { ico: 'caixa', icoCls: s.cor === 'cr' ? 'ini-cr' : s.cor === 'wa' ? 'ini-wa' : '', sub: 'Material' + (i.codigo ? ' · código ' + i.codigo : ''), titulo: i.nome, pill: alPill(s.txt, s.cor),
      corpo: gvNums([[alQ(d), 'utilizável (' + (i.un || 'un') + ')', d <= 0 ? 'cr' : min && d < min ? 'wa' : ''], [min ? alQ(min) : '—', 'mínimo'], [brl(alValorEst(i.id)), 'em estoque']]) +
        gvCampos([['Local', i.local], ['Unidade', i.un], ['Embalagem', alFator(i) > 1 ? '1 ' + (i.unCompra || 'emb.') + ' = ' + alFator(i) + ' ' + (i.un || '') : ''], ['Consumo', consumo ? consumo + ' (média de 90 dias)' : 'sem saídas em 90 dias'], ['Por frasco', i.porFrasco ? 'sim (abre e termina frasco)' : '']]) +
        '<p class="gv-h">Lotes com saldo</p>' + (ls.length ? '<div class="gv-lotes">' + ls.map(l => '<div class="gv-lote"><span>' + esc(l.lote || 'sem lote') + (l.validade ? ' · vence ' + fmtD(l.validade) : '') + '</span><span class="num">' + alQ(l.saldo) + ' ' + esc(i.un || '') + (alVencido(l) ? ' ' + alPill('vencido', 'cr') : alAVencer(l) ? ' ' + alPill('vence logo', 'wa') : '') + '</span></div>').join('') + '</div>' : '<p class="tb-nada">Sem saldo.</p>') +
        (alPorFrasco(i) ? alAbertosHTML(i) : '') +
        '<p class="gv-h">Últimas movimentações</p>' + gvLinha(movs.map(m => [(AL_TIPO[m.tipo] || m.tipo) + ' de ' + alQ(m.qtd) + ' ' + (i.un || '') + (m.motivo ? ' · ' + m.motivo : m.doc ? ' · Doc. ' + m.doc : '') + (m.anulada ? ' (anulada)' : ''), (m.porNome || '') + ' · ' + fmtD(m.data)])),
      rodape: alItemPe(i) };
  });
  render();
}
function alAbreMov(id) {
  S._alSel = id; gvAbrir(() => {
    const m = S.almMov.find(x => x.id === id); if (!m) return null; const s = alSitMov(m), i = alItem(m.itemId);
    const pode = typeof alPodeCorrigir === 'function' && alPodeCorrigir(m), pend = typeof alCorrPend === 'function' ? alCorrPend(m) : null, decide = typeof alCritPendMov === 'function' && alCritPendMov(m) && alCtrl(S.user);
    const anula = pode && !pend && !alTemRef(m), corrige = pode && !pend && ['saida', 'entrada', 'inicial'].indexOf(m.tipo) >= 0;
    return { ico: 'caixa', sub: (AL_TIPO[m.tipo] || m.tipo) + ' · ' + fmtD(m.data), titulo: m.itemNome || '(item removido)', pill: (s[0] ? alPill(s[0], s[1]) : alPill(AL_TIPO[m.tipo] || m.tipo, m.tipo === 'saida' ? 'wa' : 'ok')) + (pend ? ' ' + alPill('Correção pendente', 'wa') : ''),
      lixeira: anula ? { act: 'lc-anular', id: m.id, titulo: 'Anular (lançado por engano)' } : null,
      corpo: (m.critico ? '<div class="fm-av ' + (m.critico.st === 'pendente' ? 'wa' : m.critico.st === 'confirmada' ? 'ok' : 'cr') + '">' + ic('alerta') + '<span><b>Produto crítico.</b> ' + esc(alCritTxt(m.critico)) + '</span></div>' : '') +
        gvNums([[alQ(m.qtd), 'quantidade (' + ((i && i.un) || 'un') + ')'], [brl(Number(m.preco) || 0), 'valor unitário'], [brl((Number(m.qtd) || 0) * (Number(m.preco) || 0)), 'valor total']]) +
        gvCampos([['Lote', m.lote], ['Validade', m.validade ? fmtD(m.validade) : ''], ['Motivo', m.motivo], ['Documento', m.doc], ['Kit', m.kit], ['Observação', m.obs], ['Lote vencido usado porque', m.vencidoMotivo], ['Quem', m.porNome], ['Registrado em', m.criadoEm ? fmtDT(m.criadoEm) : ''], ['Aprovado por', m.aprovadoPor ? m.aprovadoPor + (m.pedidoPor ? ' (pedido de ' + m.pedidoPor + ')' : '') : ''], ['Anulada por', m.anulada ? (m.anuladaPor || '') + ' — ' + (m.anuladaMotivo || m.motivoAnulacao || '') : ''], ['Correção pedida', pend ? 'aguardando ' + ((pend.paraIds || []).map(nomeDe).join(', ') || 'o superior') : '']]) +
        (m.historico && m.historico.length ? '<p class="gv-h">Correções</p>' + gvLinha(m.historico.map(x => [Object.keys(x.depois || {}).map(k => k + ': ' + ((x.antes || {})[k] === '' || (x.antes || {})[k] == null ? '—' : x.antes[k]) + ' → ' + (x.depois[k] === '' || x.depois[k] == null ? '—' : x.depois[k])).join(' · ') + (x.motivo ? ' — ' + x.motivo : ''), (x.por || x.porNome || '') + (x.ts ? ' · ' + fmtDT(x.ts) : '') + (x.aprovadoPor ? ' · aprovado por ' + x.aprovadoPor : '')])) : ''),
      rodape: (decide ? '<button type="button" class="bt" data-act="lc-crit-nao" data-id="' + esc(m.id) + '">Não confere</button><button type="button" class="bt pr" data-act="lc-crit-ok" data-id="' + esc(m.id) + '">' + ic('ok') + 'Confirmar saída</button>' : '') +
        (corrige ? '<button type="button" class="bt" data-act="lc-corr" data-id="' + esc(m.id) + '">' + ic('lapis') + 'Corrigir</button>' : '') + (i ? '<button type="button" class="bt lk" data-act="al-item" data-id="' + esc(i.id) + '">Ver o material</button>' : '') };
  });
  render();
}
function alAbreSol(id) {
  S._alSel = id; gvAbrir(() => {
    const x = S.almSol.find(y => y.id === id); if (!x) return null; const s = AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente;
    const pend = (x.situacao || 'pendente') === 'pendente' && typeof alPode === 'function' && alPode();
    return { ico: 'doc', sub: 'Solicitação · ' + fmtD(x.data), titulo: 'Nº ' + (x.numero || '—'), pill: alPill(s[0], s[1]), lixeira: pend ? { act: 'lc-sol-canc', id: x.id, titulo: 'Cancelar solicitação' } : null,
      rodape: pend ? '<button type="button" class="bt pr" data-act="lc-sol-atender" data-id="' + esc(x.id) + '">' + ic('entra') + 'Chegou: marcar Atendida</button>' : '',
      corpo: gvCampos([['Solicitante', x.solicitante], ['Liberador', x.liberador], ['Previsão', x.previsao ? fmtD(x.previsao) : ''], ['Observação', x.obs], ['Atendida em', x.atendidaEm ? fmtD(x.atendidaEm) + (x.atendidaPor ? ' · ' + x.atendidaPor : '') : ''], ['Cancelada', x.situacao === 'cancelada' ? (x.canceladaPor || '') + ' — ' + (x.canceladaMotivo || '') : '']]) +
        '<p class="gv-h">Itens</p><div class="gv-lotes">' + (x.linhas || []).map(l => '<div class="gv-lote"><span>' + esc(l.nome) + (!l.itemId || !alItem(l.itemId) ? ' ' + alPill('ainda não cadastrado', '') : '') + '</span><span class="num">' + alQ(l.qtd) + '</span></div>').join('') + '</div>' };
  });
  render();
}
function alAbreEq(id) {
  S._alSel = id; gvAbrir(() => {
    const e = S.almEq.find(y => y.id === id); if (!e) return null; const st = EQ_SIT[e.situacao] || EQ_SIT.ativo, c = eqCalSit(e), cal = e.cal || {};
    return { ico: 'eng', sub: 'Equipamento' + (e.tag ? ' · ' + e.tag : ''), titulo: e.nome, pill: alPill(st[0], st[1]) + (c ? ' ' + alPill(EQ_CAL[c][0], EQ_CAL[c][1]) : ''),
      corpo: (e.precisaCal ? gvNums([[cal.ultima ? fmtD(cal.ultima) : '—', 'última calibração'], [eqProxima(e) ? fmtD(eqProxima(e)) : '—', 'próxima', c === 'vencida' || c === 'sem' ? 'cr' : c === 'avencer' ? 'wa' : ''], [(cal.freqMeses || 12) + ' meses', 'frequência']]) : '') +
        gvCampos([['Local', eqLocal(e)], ['Marca', e.marca], ['Modelo', e.modelo], ['Nº de série', e.serie], ['Quantidade', e.tipo === 'qtd' ? String(eqQtd(e)) : ''], ['Resultado', cal.resultado === 'aprovado' ? 'Aprovado para uso' : cal.resultado === 'reprovado' ? 'Reprovado' : ''], ['Certificado', cal.certificado || cal.cert || ''], ['Observação', e.obs]]) };
  });
  render();
}
function alItemPe(i) {
  if (typeof alPode !== 'function' || !alPode() || i.ativo === false) return '';
  const temLote = alLotes(i.id).length > 0;
  return (alPorFrasco(i) ? '<button type="button" class="bt pr" data-act="lc-abrir" data-id="' + esc(i.id) + '">' + ic('frasco') + 'Abrir frasco</button><button type="button" class="bt" data-act="lc-sai" data-id="' + esc(i.id) + '" title="Transferência, perda ou descarte">' + ic('sai') + 'Saída</button>'
    : '<button type="button" class="bt pr" data-act="lc-sai" data-id="' + esc(i.id) + '">' + ic('sai') + 'Saída</button>') +
    '<button type="button" class="bt" data-act="lc-ent" data-id="' + esc(i.id) + '">' + ic('entra') + 'Entrada</button>' + (temLote ? '<button type="button" class="bt" data-act="lc-aj" data-id="' + esc(i.id) + '">' + ic('ajuste') + 'Ajustar</button>' : '');
}
function alAbertosHTML(i) {
  const abs = alAbertos(i.id), pode = typeof alPode === 'function' && alPode();
  return '<p class="gv-h">Em uso agora · ' + abs.length + ' frasco(s) aberto(s)</p>' + (abs.length ? '<div class="gv-lotes">' + abs.map(m => { const p = alPrazoAberto(m); return '<div class="gv-lote"><span>' + esc(m.lote || 'sem lote') + ' · aberto em ' + fmtD(m.data) + (p ? ' · ' + (p.vencido ? 'passou do prazo em ' + fmtD(p.venc) : 'vale até ' + fmtD(p.venc)) : '') + '</span>' + (pode ? '<button type="button" class="bt" data-act="lc-fim" data-id="' + esc(m.id) + '">Acabou</button>' : '') + '</div>'; }).join('') + '</div>' : '<p class="tb-nada">Nenhum frasco aberto.</p>');
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="al-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'al-ir') { e.preventDefault(); alIrMateriais(t.getAttribute('data-f')); }
  else if (a === 'al-ir-valor') { e.preventDefault(); const st = tbEstado('al-mat'); st.filtros = {}; st.busca = ''; st.ordem = { k: 'val', dir: 'desc' }; ir('almox', 'materiais'); }
  else if (a === 'al-item') { if (S.rota.aba !== 'materiais') { S._gvNav = true; ir('almox', 'materiais'); } alAbreItem(t.getAttribute('data-id')); }
  else if (a === 'al-mov') { if (S.rota.aba !== 'movimentacoes') { S._gvNav = true; ir('almox', 'movimentacoes'); } alAbreMov(t.getAttribute('data-id')); }
  else if (a === 'al-eq') { if (S.rota.aba !== 'equipamentos') { S._gvNav = true; ir('almox', 'equipamentos'); } alAbreEq(t.getAttribute('data-id')); }
});
