/* EFCwork · documentos.js — área Documentos (v0.5): Documentos (formulários e regulatórios), Caixas d’água e Histórico. Prefixo: dc.
   Mesmos dados do EFClaudian: sv2_docs (catálogo), sv2_caixas (caixas d’água), sv2_lanc (lançamentos). O "último" de cada item é o maior
   entre a data do preenchimento prévio (ultimoBase/ultimaBase) e os lançamentos; vence pelo período (regulatório com validade vence pela data do papel).
   Lançamento não se edita: corrige-se com pedido ao superior (sv2_aprov 'corrigir_lancamento', o mesmo do EFClaudian), e fica marcado "alterado" com o histórico.
   Escolhas do Elias (09/11 18:25): tabela do app com 4 caixas de números; Formulários (FOR, OAB, OABD, OAF, N/A) separados dos Regulatórios, em ordem
   alfabética, e mover um documento de um grupo para o outro; Tabela | Calendário no lugar da contagem; Caixas em ordem alfabética; Histórico com o
   lançamento mais recente em cima; gaveta do documento e Lançar entrega. */
Object.assign(S, { docs: [], caixas: [], lanc: [], dcVista: {}, dcMes: {}, dcDia: {} });
const DC_PERIODOS = ['DIÁRIO', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'TRIENAL', 'QUADRIENAL', 'QUINQUENAL', 'DECENAL'];
const DC_DIAS = { 'DIÁRIO': 1, 'SEMANAL': 7, 'QUINZENAL': 15, 'MENSAL': 30, 'BIMESTRAL': 60, 'TRIMESTRAL': 90, 'SEMESTRAL': 180, 'ANUAL': 365, 'TRIENAL': 1095, 'QUADRIENAL': 1460, 'QUINQUENAL': 1825, 'DECENAL': 3650 };
const DC_ATENCAO = 15;
const DC_ST = { venc: ['Vencido', 'cr'], aten: ['Vence em breve', 'wa'], ok: ['Em dia', ''], sem: ['Sem data', ''], des: ['Desativado', ''] };

CS_CARGAS.push(() => {
  const re = () => { if (S.rota.area === 'documentos') render(); else if (S.gv) gvDesenha(); };
  csOuve('sv2_docs', l => { S.docs = l || []; re(); });
  csOuve('sv2_caixas', l => { S.caixas = l || []; re(); });
  csOuve('sv2_lanc', l => { S.lanc = l || []; S._dcUltRef = null; re(); }, { order: 'ts', limit: 3000 });
});

/* ---------- situação ---------- */
const dcDif = (a, b) => { const x = a.split('-').map(Number), y = b.split('-').map(Number); return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 864e5); };
function dcUltimos() {
  if (S._dcUltRef === S.lanc && S._dcUlt) return S._dcUlt;
  const m = {}; S.lanc.forEach(l => { if (!l.data) return; const k = l.alvoTipo + '|' + l.alvoId; if (!m[k] || l.data > m[k]) m[k] = l.data; });
  S._dcUltRef = S.lanc; S._dcUlt = m; return m;
}
function dcSit(tipo, it) {
  const base = (tipo === 'doc' ? it.ultimoBase : it.ultimaBase) || '', lm = dcUltimos()[tipo + '|' + it.id] || '', ult = base > lm ? base : lm;
  if (it.desativado) return { st: 'des', ult: ult, prox: '', dias: null };
  let prox = '';
  if (tipo === 'doc' && it.tipo === 'REGULATORIO' && it.vencimento) prox = it.vencimento;
  else if (ult && DC_DIAS[it.periodo]) prox = addDias(ult, DC_DIAS[it.periodo]);
  if (!prox) return { st: 'sem', ult: ult, prox: '', dias: null };
  const dias = dcDif(hojeISO(), prox);
  return { st: dias < 0 ? 'venc' : dias <= DC_ATENCAO ? 'aten' : 'ok', ult: ult, prox: prox, dias: dias };
}
const dcCom = (tipo, l) => l.map(x => Object.assign({}, x, { _s: dcSit(tipo, x) }));
const dcPrazo = s => s.dias == null ? (s.st === 'sem' ? 'sem data' : '') : s.dias < 0 ? 'vencido há ' + (-s.dias) + ' d' : s.dias === 0 ? 'vence hoje' : 'faltam ' + s.dias + ' d';
const dcStTxt = (s, caixa) => s === 'venc' && caixa ? 'Vencida' : s === 'des' && caixa ? 'Desativada' : DC_ST[s][0];
const dcPill = (s, caixa) => DC_ST[s][1] ? '<span class="pill ' + DC_ST[s][1] + '">' + esc(dcStTxt(s, caixa)) + '</span>' : esc(dcStTxt(s, caixa));
const dcPillG = (s, caixa) => '<span class="pill ' + (DC_ST[s][1] || '') + '">' + esc(dcStTxt(s, caixa)) + '</span>'; /* na gaveta, sempre como selo */
const dcCont = l => { const c = { venc: 0, aten: 0, sem: 0, ok: 0 }; l.forEach(r => { if (r._s.st in c) c[r._s.st]++; }); return c; };
const dcPer = p => p ? p.charAt(0) + p.slice(1).toLowerCase() : '';
const dcNome = (tipo, it) => tipo === 'caixa' ? it.tag + ' — ' + it.local : (it.codigo ? it.codigo + ' — ' : '') + it.titulo;
const dcPodeCad = () => isSup(S.user);
const dcGrupo = d => d.desativado ? 'D' : d.tipo === 'REGULATORIO' ? 'R' : 'F';
const DC_GRUPOS = [['F', 'Formulários'], ['R', 'Regulatórios'], ['D', 'Desativados']];

/* ---------- telas ---------- */
TELAS.documentos = function (aba) {
  const docs = dcCom('doc', S.docs), cxs = dcCom('caixa', S.caixas);
  const at = docs.filter(d => !d.desativado), cat = cxs.filter(c => !c.desativado), cd = dcCont(at), cc = dcCont(cat);
  const nm = aba === 'caixas' ? 'Caixas d’água' : aba === 'historico' ? 'Histórico' : 'Documentos';
  const meta = aba === 'caixas' ? ['<span>' + cat.length + ' caixas ativas' + (cxs.length > cat.length ? ' · ' + (cxs.length - cat.length) + ' desativadas' : '') + '</span>', cc.venc ? metaPl(cc.venc + (cc.venc === 1 ? ' vencida' : ' vencidas'), 'cr', 'alerta') : '']
    : aba === 'historico' ? ['<span>' + S.lanc.length + ' lançamentos</span>', S.lanc.some(l => l.alterado) ? metaPl((n => n + (n === 1 ? ' corrigido' : ' corrigidos'))(S.lanc.filter(l => l.alterado).length), 'wa') : '']
    : ['<span>' + at.length + ' ativos' + (docs.length > at.length ? ' · ' + (docs.length - at.length) + ' desativados' : '') + '</span>', cd.venc ? metaPl(cd.venc + (cd.venc === 1 ? ' vencido' : ' vencidos'), 'cr', 'alerta') : ''];
  const acoes = !dcPodeCad() || aba === 'historico' ? '' : '<button type="button" class="bt pr" data-act="dc-novo" data-t="' + (aba === 'caixas' ? 'caixa' : 'doc') + '">' + ic('mais') + (aba === 'caixas' ? 'Nova caixa' : 'Novo documento') + '</button>';
  let h = cabecalho({ titulo: nm, abaNome: nm, meta: meta.filter(Boolean), acoes: acoes });
  if (!S.docs.length && !S.caixas.length && aba !== 'historico') return h + '<section class="pn"><div class="vazio">' + ic('doc') + '<b>Nenhum documento cadastrado.</b><span>O catálogo inicial é carregado pelo Principal no EFClaudian (Documentos › Catálogo).</span></div></section>';
  if (aba === 'historico') return h + dcHistorico();
  const caixa = aba === 'caixas';
  h += dcKps(caixa ? cc : cd, caixa);
  return h + (S.dcVista[aba] === 'cal' ? dcCalendario(aba, caixa ? cat : at) : caixa ? dcTabCaixas(cxs) : dcTabDocs(docs));
};
function dcKps(c, caixa) {
  return '<div class="kps dc-kps"><div class="kp' + (c.venc ? ' cr' : '') + '"><b class="num">' + c.venc + '</b><span>' + (caixa ? 'Vencidas' : 'Vencidos') + '</span></div><div class="kp' + (c.aten ? ' wa' : '') + '"><b class="num">' + c.aten + '</b><span>Vencem em ' + DC_ATENCAO + ' dias</span></div>' +
    '<div class="kp"><b class="num">' + c.sem + '</b><span>Sem data</span></div><div class="kp"><b class="num">' + c.ok + '</b><span>Em dia</span></div></div>';
}
/* Tabela | Calendário: fica no lugar da contagem (pedido de 09/11 18:25) */
function dcVistaHTML(aba) {
  const v = S.dcVista[aba] === 'cal' ? 'cal' : 'tab', b = (k, t) => '<button type="button" role="tab" aria-selected="' + (v === k) + '" class="' + (v === k ? 'on' : '') + '" data-act="dc-vista" data-aba="' + aba + '" data-v="' + k + '">' + t + '</button>';
  return '<div class="dc-vs" role="tablist" aria-label="Ver como">' + b('tab', 'Tabela') + b('cal', 'Calendário') + '</div>';
}
function dcTabDocs(docs) {
  const l = docs.slice().sort((a, b) => cmpTxt(a.titulo, b.titulo) || cmpTxt(a.codigo, b.codigo));
  return tbHTML({ id: 'dc-docs', titulo: 'Documentos', unidade: 'documentos', linhas: l, aoClicar: id => dcAbreDoc(id), aEsquerda: () => dcVistaHTML('documentos'),
    grupos: { v: dcGrupo, ordem: DC_GRUPOS }, busca: r => [r.codigo, r.titulo, r.setor, r.responsavel].join(' '), vazio: 'Nenhum documento com este filtro.',
    cols: [{ k: 'cod', rot: 'Código', v: r => r.codigo || '' }, { k: 'tit', rot: 'Título', v: r => r.titulo || '', cls: 'forte' }, { k: 'setor', rot: 'Setor', v: r => r.setor || '' },
      { k: 'resp', rot: 'Responsável', v: r => /^N\/?A$/i.test(r.responsavel || '') ? '' : r.responsavel || '' }, { k: 'per', rot: 'Período', v: r => r.tipo === 'REGULATORIO' && r.vencimento ? 'Validade' : dcPer(r.periodo) },
      { k: 'ult', rot: 'Último', tipo: 'data', v: r => r._s.ult }, { k: 'prox', rot: 'Vence em', tipo: 'data', v: r => r._s.prox },
      { k: 'st', rot: 'Situação', v: r => dcStTxt(r._s.st), html: r => dcPill(r._s.st) }] });
}
function dcTabCaixas(cxs) {
  const l = cxs.slice().sort((a, b) => cmpTxt(a.tag, b.tag));
  return tbHTML({ id: 'dc-cx', titulo: 'Caixas d’água', unidade: 'caixas', linhas: l, aoClicar: id => dcAbreCaixa(id), aEsquerda: () => dcVistaHTML('caixas'),
    grupos: { v: c => c.desativado ? 'D' : 'A', ordem: [['A', ''], ['D', 'Desativadas']] }, busca: r => [r.tag, r.tipo, r.local].join(' '), vazio: 'Nenhuma caixa com este filtro.',
    cols: [{ k: 'tag', rot: 'Caixa', v: r => r.tag || '', cls: 'forte' }, { k: 'agua', rot: 'Água', v: r => r.tipo || '' }, { k: 'local', rot: 'Local', v: r => r.local || '' }, { k: 'per', rot: 'Limpeza', v: r => dcPer(r.periodo) },
      { k: 'ult', rot: 'Última limpeza', tipo: 'data', v: r => r._s.ult }, { k: 'prox', rot: 'Próxima', tipo: 'data', v: r => r._s.prox },
      { k: 'pz', rot: 'Prazo', tipo: 'num', v: r => r._s.dias == null ? null : r._s.dias, html: r => esc(dcPrazo(r._s)) },
      { k: 'st', rot: 'Situação', v: r => dcStTxt(r._s.st, true), html: r => dcPill(r._s.st, true) }] });
}
/* ---------- calendário do mês ---------- */
function dcCalendario(aba, lista) {
  const hj = hojeISO(), mes = S.dcMes[aba] || hj.slice(0, 7), y = Number(mes.slice(0, 4)), mo = Number(mes.slice(5, 7)) - 1;
  const pri = new Date(y, mo, 1), ini = new Date(y, mo, 1 - ((pri.getDay() + 6) % 7)), dia = S.dcDia[aba] || (hj.slice(0, 7) === mes ? hj : mes + '-01');
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const caixa = aba === 'caixas', cod = r => caixa ? r.tag : (r.codigo && !/^N\/?A$/i.test(r.codigo) ? r.codigo : r.titulo), abre = caixa ? 'dc-cx' : 'dc-doc';
  const sem = Math.ceil((((pri.getDay() + 6) % 7) + new Date(y, mo + 1, 0).getDate()) / 7);
  let cel = '';
  for (let i = 0; i < sem * 7; i++) {
    const x = new Date(ini); x.setDate(ini.getDate() + i); const k = iso(x), l = lista.filter(r => r._s.prox === k), passou = k < hj;
    cel += '<button type="button" class="dc-d' + (x.getMonth() !== mo ? ' fora' : '') + (k === hj ? ' hj' : '') + (k === dia ? ' sel' : '') + (l.length ? ' tem ' + (passou ? 'cr' : 'wa') : '') + '" data-act="dc-dia" data-aba="' + aba + '" data-d="' + k + '" aria-label="' + esc(fmtD(k) + (l.length ? ': ' + l.length + ' vencem' : '')) + '"><span>' + x.getDate() + '</span>' +
      l.slice(0, 2).map(r => '<em class="' + (passou ? 'cr' : 'wa') + '">' + esc(cod(r)) + '</em>').join('') + (l.length > 2 ? '<em>+' + (l.length - 2) + '</em>' : '') + '</button>';
  }
  const doDia = lista.filter(r => r._s.prox === dia).sort((a, b) => cmpTxt(cod(a), cod(b))), atr = lista.filter(r => r._s.st === 'venc').sort((a, b) => a._s.dias - b._s.dias);
  const li = r => '<button type="button" class="dc-li" data-act="' + abre + '" data-id="' + esc(r.id) + '"><span class="t"><b>' + esc(caixa ? r.tag + ' — ' + r.local : r.titulo) + '</b><small>' + esc(caixa ? [r.tipo, dcPer(r.periodo)].filter(Boolean).join(' · ') : [r.codigo, r.setor, dcPer(r.periodo)].filter(Boolean).join(' · ')) + '</small></span><span class="p ' + (DC_ST[r._s.st][1] || '') + '">' + esc(dcPrazo(r._s)) + '</span>' + ic('seta') + '</button>';
  const nAtr = 8;
  return '<div class="dc-bar">' + dcVistaHTML(aba) + '</div><div class="dc-cal"><section class="dc-mes pn"><div class="dc-mh"><button type="button" class="bt ic-so" data-act="dc-mes" data-aba="' + aba + '" data-d="-1" title="Mês anterior" aria-label="Mês anterior">' + ic('volta') + '</button><b>' + MESES[mo] + ' de ' + y + '</b>' +
    (mes !== hj.slice(0, 7) ? '<button type="button" class="bt" data-act="dc-mes" data-aba="' + aba + '" data-d="0">Hoje</button>' : '') + '<button type="button" class="bt ic-so" data-act="dc-mes" data-aba="' + aba + '" data-d="1" title="Próximo mês" aria-label="Próximo mês">' + ic('seta') + '</button></div>' +
    '<div class="dc-dg">' + ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map(x => '<span>' + x + '</span>').join('') + cel + '</div></section>' +
    '<div class="dc-lat"><p class="dc-lh">' + esc(fmtD(dia)) + ' · ' + (doDia.length ? doDia.length + (doDia.length === 1 ? ' vence' : ' vencem') + ' neste dia' : 'nada vence neste dia') + '</p>' + (doDia.length ? '<div class="dc-lst pn">' + doDia.map(li).join('') + '</div>' : '') +
    '<p class="dc-lh">' + (caixa ? 'Atrasadas' : 'Atrasados') + ' · ' + atr.length + '</p>' + (atr.length ? '<div class="dc-lst pn">' + atr.slice(0, nAtr).map(li).join('') + (atr.length > nAtr ? '<button type="button" class="dc-mais" data-act="dc-vista" data-aba="' + aba + '" data-v="tab">Ver os ' + atr.length + ' na tabela</button>' : '') + '</div>' : '<p class="tb-nada">Nenhum atrasado.</p>') + '</div></div>';
}
/* ---------- histórico ---------- */
function dcCorrPend(lid) { return S.aprov.find(a => a.tipo === 'corrigir_lancamento' && a.refId === lid && a.status === 'pendente'); }
function dcHistorico() {
  const l = S.lanc.slice().sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')));
  return tbHTML({ id: 'dc-hist', titulo: 'Histórico de lançamentos', unidade: 'lançamentos', linhas: l, aoClicar: id => dcAbreLanc(id), busca: r => [r.alvoNome, r.entreguePor, r.lancadoPorNome, r.obs].join(' '), vazio: 'Nenhum lançamento ainda.',
    cols: [{ k: 'ts', rot: 'Lançado em', tipo: 'data', v: r => r.ts || '', html: r => esc(fmtDT(r.ts)) }, { k: 'data', rot: 'Preenchido em', tipo: 'data', v: r => r.data || '' },
      { k: 'item', rot: 'Documento ou caixa', v: r => r.alvoNome || '', cls: 'forte' }, { k: 'de', rot: 'Tipo', v: r => r.alvoTipo === 'caixa' ? 'Caixa d’água' : 'Documento' },
      { k: 'ent', rot: 'Entregue por', v: r => r.entreguePor || '' }, { k: 'por', rot: 'Lançado por', v: r => r.lancadoPorNome || '' }, { k: 'obs', rot: 'Observação', v: r => r.obs || '' },
      { k: 'alt', rot: 'Correção', v: r => dcCorrPend(r.id) ? 'Pendente' : r.alterado ? 'Corrigido' : '', html: r => dcCorrPend(r.id) ? '<span class="pill wa">Correção pendente</span>' : r.alterado ? '<span class="pill">Corrigido</span>' : '' }] });
}

/* ---------- gavetas ---------- */
const dcLancDe = (tipo, id) => S.lanc.filter(l => l.alvoTipo === tipo && l.alvoId === id).sort((a, b) => a.data < b.data ? 1 : a.data > b.data ? -1 : String(b.ts || '').localeCompare(String(a.ts || '')));
function dcUltimasHTML(tipo, id) {
  const l = dcLancDe(tipo, id).slice(0, 6);
  if (!l.length) return '<p class="tb-nada">Nenhum lançamento no app ainda.</p>';
  return '<div class="dc-ul">' + l.map(x => '<button type="button" class="dc-uli" data-act="dc-lanc" data-id="' + esc(x.id) + '"><b class="num">' + esc(fmtD(x.data)) + '</b><span>' + esc(tipo === 'caixa' ? 'limpeza' : 'entregue por ' + (x.entreguePor || '—')) + (x.alterado ? ' <i class="pill">Corrigido</i>' : '') + '</span><small>' + esc(x.lancadoPorNome || '') + '</small></button>').join('') + '</div>';
}
function dcAbreDoc(id) {
  S._dcSel = id; gvAbrir(() => {
    const d0 = S.docs.find(x => x.id === id); if (!d0) return null;
    const s = dcSit('doc', d0), reg = d0.tipo === 'REGULATORIO', cad = dcPodeCad();
    const grupo = '<div class="dc-gp"><span>' + (reg ? 'Regulatórios' : 'Formulários') + '</span>' + (cad && !d0.desativado ? '<button type="button" class="bt" data-act="dc-mover" data-id="' + esc(id) + '">' + ic('seta') + 'Mover para ' + (reg ? 'Formulários' : 'Regulatórios') + '</button>' : '') + '</div>';
    return { ico: 'doc', sub: (d0.codigo || 'sem código') + ' · ' + (reg ? 'Regulatório' : 'Formulário'), titulo: d0.titulo, pill: dcPillG(s.st),
      cabAcoes: cad ? '<button type="button" class="bt ic-so" data-act="dc-edita" data-t="doc" data-id="' + esc(id) + '" title="Editar o cadastro" aria-label="Editar o cadastro">' + ic('lapis') + '</button>' : '',
      lixeira: cad && !d0.desativado ? { act: 'dc-desativa', id: id, titulo: 'Desativar documento' } : null,
      corpo: grupo + gvCampos([['Setor', d0.setor || '—'], ['Responsável', d0.responsavel || '—'], ['Período', dcPer(d0.periodo) || '—'], reg ? ['Validade', d0.vencimento ? fmtD(d0.vencimento) : 'usa o período'] : ['', ''],
        ['Último preenchimento', s.ult ? fmtD(s.ult) : '—'], ['Vence em', s.prox ? fmtD(s.prox) + ' · ' + dcPrazo(s) : '—'], ['Preenchimento prévio', d0.ultimoBase ? fmtD(d0.ultimoBase) : '']]) +
        '<p class="gv-h">Últimas entregas</p>' + dcUltimasHTML('doc', id),
      rodape: dcPe('doc', d0) };
  });
  render();
}
function dcAbreCaixa(id) {
  S._dcSel = id; gvAbrir(() => {
    const c = S.caixas.find(x => x.id === id); if (!c) return null;
    const s = dcSit('caixa', c), cad = dcPodeCad();
    return { ico: 'doc', sub: 'Caixa d’água · ' + (c.tipo || ''), titulo: c.tag + ' — ' + (c.local || ''), pill: dcPillG(s.st, true),
      cabAcoes: cad ? '<button type="button" class="bt ic-so" data-act="dc-edita" data-t="caixa" data-id="' + esc(id) + '" title="Editar o cadastro" aria-label="Editar o cadastro">' + ic('lapis') + '</button>' : '',
      lixeira: cad && !c.desativado ? { act: 'dc-desativa', id: id, titulo: 'Desativar caixa' } : null,
      corpo: gvCampos([['Água', c.tipo || '—'], ['Local', c.local || '—'], ['Limpeza', dcPer(c.periodo) || '—'], ['Última limpeza', s.ult ? fmtD(s.ult) : '—'], ['Próxima', s.prox ? fmtD(s.prox) + ' · ' + dcPrazo(s) : '—']]) +
        '<p class="gv-h">Últimas limpezas</p>' + dcUltimasHTML('caixa', id),
      rodape: dcPe('caixa', c) };
  });
  render();
}
function dcPe(tipo, it) {
  const h = '<button type="button" class="bt" data-act="dc-hist" data-id="' + esc(it.id) + '" data-t="' + tipo + '">' + ic('relogio') + 'Histórico</button>';
  if (it.desativado) return h + (dcPodeCad() ? '<button type="button" class="bt pr" data-act="dc-reativa" data-t="' + tipo + '" data-id="' + esc(it.id) + '">Reativar</button>' : '');
  return h + (podeLancar(S.user) ? '<button type="button" class="bt pr" data-act="dc-lancar" data-t="' + tipo + '" data-id="' + esc(it.id) + '">' + ic('ok') + (tipo === 'caixa' ? 'Lançar limpeza' : 'Lançar entrega') + '</button>' : '');
}
function dcAbreLanc(id) {
  S._dcSel = id; gvAbrir(() => {
    const l = S.lanc.find(x => x.id === id); if (!l) return null;
    const pend = dcCorrPend(l.id), hist = (l.historico || []).slice().reverse(), doc = l.alvoTipo !== 'caixa';
    let c = gvCampos([[doc ? 'Preenchido em' : 'Limpeza em', fmtD(l.data)], doc ? ['Entregue por', l.entreguePor || '—'] : ['', ''], doc && (l.entreguePor || l.entregueEm) ? ['Entregue em', fmtD(l.entregueEm || String(l.ts || '').slice(0, 10)) + ' (automático)'] : ['', ''],
      ['Observação', l.obs || '—'], ['Lançado por', (l.lancadoPorNome || '—') + ' · ' + fmtDT(l.ts)]]);
    if (pend) c += lcAv('Correção pedida por ' + esc(pend.solicitanteNome) + ', aguardando ' + esc((pend.paraNomes || []).join(', ') || 'o superior') + '.', 'wa');
    if (hist.length) c += '<p class="gv-h">Correções aplicadas</p><div class="dc-cr">' + hist.map(x => '<div><b>' + esc(dcMudanca(x)) + '</b><small>Motivo: ' + esc(x.motivo || '—') + ' · pedido por ' + esc(x.pedidoPor || '—') + ' · aprovado por ' + esc(x.aprovadoPor || '—') + ' · ' + esc(fmtDT(x.ts)) + '</small></div>').join('') + '</div>';
    const alvo = (doc ? S.docs : S.caixas).find(x => x.id === l.alvoId);
    return { ico: 'relogio', sub: (doc ? 'Lançamento de entrega' : 'Lançamento de limpeza') + (l.alterado ? ' · corrigido' : ''), titulo: l.alvoNome || '', pill: pend ? '<span class="pill wa">Correção pendente</span>' : l.alterado ? '<span class="pill">Corrigido</span>' : '',
      corpo: c, rodape: (alvo ? '<button type="button" class="bt" data-act="' + (doc ? 'dc-doc' : 'dc-cx') + '" data-id="' + esc(alvo.id) + '">' + ic('doc') + (doc ? 'Ver o documento' : 'Ver a caixa') + '</button>' : '') +
        (!pend && podeLancar(S.user) ? '<button type="button" class="bt pr" data-act="dc-corrigir" data-id="' + esc(l.id) + '">' + ic('lapis') + (isPrincipal(S.user) ? 'Corrigir' : 'Pedir correção') + '</button>' : '') };
  });
  render();
}
function dcMudanca(p) {
  if (!p || !p.antes || !p.depois) return '';
  const o = []; if (p.antes.data !== p.depois.data) o.push('Data ' + fmtD(p.antes.data) + ' → ' + fmtD(p.depois.data));
  if ((p.antes.obs || '') !== (p.depois.obs || '')) o.push('Obs. "' + (p.antes.obs || '—') + '" → "' + (p.depois.obs || '—') + '"');
  return o.join(' · ');
}

/* ---------- formulários (gaveta com camada, como os lançamentos do almoxarifado) ---------- */
const dcAlvo = (t, id) => (t === 'caixa' ? S.caixas : S.docs).find(x => x.id === id);
const dcVolta = (t, id) => () => { if (t === 'lanc') dcAbreLanc(id); else if (t === 'caixa') dcAbreCaixa(id); else if (id) dcAbreDoc(id); else gvFecharSo(); };
function dcQuemLista() { const m = {}; S.lanc.forEach(l => { const q = String(l.entreguePor || '').trim(); if (q) m[q.toUpperCase()] = q; }); S.docs.forEach(d => { const q = String(d.responsavel || '').trim(); if (q && !/^N\/?A$/i.test(q)) m[q.toUpperCase()] = m[q.toUpperCase()] || q; }); return Object.keys(m).map(k => m[k]).sort(cmpTxt); }
const dcDl = (id, l) => '<datalist id="' + id + '">' + Array.from(new Set(l.filter(Boolean))).sort(cmpTxt).map(v => '<option value="' + esc(v) + '">').join('') + '</datalist>';
LC_FORM.dcLanc = f => {
  const it = dcAlvo(f.t, f.id); if (!it) return null;
  const doc = f.t === 'doc', s = dcSit(f.t, it), agora = new Date();
  let c = lcMsg() + lcAv((doc ? 'Último no app: <b>' + esc(s.ult ? fmtD(s.ult) : '—') + '</b> · ' : 'Última limpeza: <b>' + esc(s.ult ? fmtD(s.ult) : '—') + '</b> · ') + esc(dcPer(it.periodo)) + (s.prox ? ' · ' + esc(dcPrazo(s)) : ''));
  c += '<div class="fm-g">' + lcBl(doc ? 'Data do último preenchimento' : 'Data da limpeza', lcData('data', f.data)) + (doc ? lcBl('Quem entregou', lcIn('quem', f.quem, ' list="dc-quem" placeholder="nome de quem trouxe o documento"') + dcDl('dc-quem', dcQuemLista())) : '') + '</div>';
  c += lcBl('Observação', lcTx('obs', f.obs, 'opcional'));
  if (doc && it.tipo === 'REGULATORIO' && it.vencimento) c += dcPodeCad() ? lcBl('Nova validade', lcData('venc', f.venc, true), 'a data do documento novo · atual ' + fmtD(it.vencimento)) : lcAv('Este regulatório vence pela data do papel (' + esc(fmtD(it.vencimento)) + '). A validade nova é atualizada pelo Líder ★ ou pelo Principal.');
  c += lcAv((doc ? 'Entregue em <b>' + esc(fmtD(hojeISO()) + ' às ' + String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0')) + '</b>, com o seu nome (' + esc(S.user.nome) + '). ' : '') + 'Depois de lançado, só muda com pedido de correção aprovado pelo seu superior.');
  return { ico: 'ok', sub: dcNome(f.t, it), titulo: doc ? 'Lançar entrega' : 'Lançar limpeza', corpo: c, rodape: lcPe('dc-lanc-ok', 'Lançar') };
};
function dcLancOk() {
  const f = S.fm, it = f && dcAlvo(f.t, f.id); if (!it) return;
  const doc = f.t === 'doc', data = f.data || '', quem = String(f.quem || '').trim().toUpperCase(), obs = String(f.obs || '').trim(), nv = f.venc || '';
  if (doc && !data) return lcErro('Informe a data do último preenchimento.');
  const er = validaData(data); if (er) return lcErro(er);
  if (doc && quem.length < 2) return lcErro('Escreva quem entregou o documento.');
  if (S.lanc.some(l => l.alvoTipo === f.t && l.alvoId === f.id && l.data === data)) return lcErro('Já existe um lançamento deste item nessa data.');
  if (nv && nv <= data) return lcErro('A nova validade precisa ser depois da data do preenchimento.');
  if (!lcTravar()) return;
  const o = { alvoTipo: f.t, alvoId: f.id, alvoNome: dcNome(f.t, it), data: data, obs: obs, ts: nowISO(), lancadoPor: S.user.id, lancadoPorNome: S.user.nome, alterado: false, historico: [], ultimaAprovId: '' };
  if (doc) { o.entreguePor = quem; o.entregueEm = hojeISO(); }
  const txt = doc ? 'Lançou entrega de ' + o.alvoNome + ': preenchido em ' + fmtD(data) + ', entregue por ' + quem + ' em ' + fmtD(o.entregueEm) : 'Lançou limpeza de ' + o.alvoNome + ' em ' + fmtD(data);
  const ps = [Data.col('sv2_lanc').add(o).then(lid => Audit.log({ acao: doc ? 'lancar_entrega' : 'lancar_limpeza', entidade: 'lancamento', entidadeId: lid, resumo: txt, depois: { item: o.alvoNome, data: data, entreguePor: quem, entregueEm: o.entregueEm || '', obs: obs } }))];
  if (nv && doc && dcPodeCad()) ps.push(Data.col('sv2_docs').update(f.id, { vencimento: nv }).then(() => Audit.log({ acao: 'alterar_documento', entidade: 'documento', entidadeId: f.id, resumo: 'Validade atualizada na entrega: ' + o.alvoNome + ' — ' + fmtD(it.vencimento) + ' → ' + fmtD(nv), antes: { vencimento: it.vencimento }, depois: { vencimento: nv }, autorizadoPor: { id: S.user.id, nome: S.user.nome } })));
  lcGrava(ps, doc ? 'Entrega lançada.' : 'Limpeza lançada.');
}
LC_FORM.dcCad = f => {
  const doc = f.t === 'doc', c = lcMsg() + (doc
    ? '<div class="fm-g">' + lcBl('Código', lcIn('codigo', f.codigo, ' placeholder="ex.: FOR 0062 (ou N/A)"')) + lcBl('Grupo', ddHTML('dc:tipo', f.tipo || 'FORMULARIO', [['FORMULARIO', 'Formulários'], ['REGULATORIO', 'Regulatórios']])) + '</div>' + lcBl('Título', lcIn('titulo', f.titulo)) +
      '<div class="fm-g">' + lcBl('Setor', lcIn('setor', f.setor, ' list="dc-setor"') + dcDl('dc-setor', S.docs.map(x => x.setor))) + lcBl('Responsável', lcIn('responsavel', f.responsavel, ' list="dc-resp"') + dcDl('dc-resp', S.docs.map(x => x.responsavel))) + '</div>' +
      '<div class="fm-g">' + lcBl('Período', ddHTML('dc:periodo', f.periodo || 'MENSAL', DC_PERIODOS.map(p => [p, dcPer(p)]))) + (f.tipo === 'REGULATORIO' ? lcBl('Validade', lcData('vencimento', f.vencimento, true), 'opcional: se preencher, vence nesta data') : '') + '</div>'
    : '<div class="fm-g">' + lcBl('Número da caixa', lcIn('tag', f.tag, ' placeholder="ex.: CXR36"')) + lcBl('Água', ddHTML('dc:agua', f.agua || 'Potável', [['Potável', 'Potável'], ['Bruta', 'Bruta']])) + '</div>' +
      '<div class="fm-g">' + lcBl('Local', lcIn('local', f.local, ' list="dc-local"') + dcDl('dc-local', S.caixas.map(x => x.local))) + lcBl('Limpeza', ddHTML('dc:periodo', f.periodo || 'TRIMESTRAL', DC_PERIODOS.map(p => [p, dcPer(p)]))) + '</div>') +
    lcAv('Tudo o que mudar fica registrado na atividade.');
  return { ico: f.id ? 'lapis' : 'mais', sub: doc ? 'Documentos' : 'Caixas d’água', titulo: f.id ? (doc ? 'Editar documento' : 'Editar caixa') : (doc ? 'Novo documento' : 'Nova caixa'), corpo: c, rodape: lcPe('dc-cad-ok', 'Salvar') };
};
function dcCadOk() {
  const f = S.fm; if (!f) return;
  const doc = f.t === 'doc', col = doc ? 'sv2_docs' : 'sv2_caixas', lista = doc ? S.docs : S.caixas, ant = f.id ? lista.find(x => x.id === f.id) : null;
  let o;
  if (doc) {
    o = { codigo: String(f.codigo || '').trim().toUpperCase(), titulo: String(f.titulo || '').trim().toUpperCase(), tipo: f.tipo || 'FORMULARIO', setor: String(f.setor || '').trim().toUpperCase(), responsavel: String(f.responsavel || '').trim().toUpperCase(), periodo: f.periodo || 'MENSAL', vencimento: f.tipo === 'REGULATORIO' ? (f.vencimento || '') : '' };
    if (o.titulo.length < 3) return lcErro('Informe o título.');
    if (S.docs.some(x => x.id !== f.id && x.codigo === o.codigo && x.titulo === o.titulo)) return lcErro('Já existe um documento com esse código e esse título.');
  } else {
    o = { tag: String(f.tag || '').trim().toUpperCase(), tipo: f.agua || 'Potável', local: String(f.local || '').trim(), periodo: f.periodo || 'TRIMESTRAL' };
    if (o.tag.length < 2) return lcErro('Informe o número da caixa.');
    if (!o.local) return lcErro('Informe o local.');
    if (S.caixas.some(x => x.id !== f.id && x.tag === o.tag)) return lcErro('Já existe uma caixa com esse número.');
  }
  if (!lcTravar()) return;
  const nome = doc ? (o.codigo ? o.codigo + ' — ' : '') + o.titulo : o.tag;
  if (ant) {
    const antes = {}, depois = {}; Object.keys(o).forEach(k => { if ((ant[k] || '') !== o[k]) { antes[k] = ant[k] || ''; depois[k] = o[k]; } });
    if (!Object.keys(depois).length) { lcFim(); return; }
    lcGrava([Data.col(col).update(f.id, o).then(() => Audit.log({ acao: doc ? 'alterar_documento' : 'alterar_caixa', entidade: doc ? 'documento' : 'caixa', entidadeId: f.id, resumo: 'Alterou o cadastro de ' + nome, antes: antes, depois: depois, autorizadoPor: { id: S.user.id, nome: S.user.nome } }))], 'Cadastro salvo.');
  } else {
    const n = Object.assign({}, o, doc ? { ultimoBase: '' } : { ultimaBase: '' }, { desativado: false, origem: 'app', criadoEm: nowISO(), criadoPor: S.user.id });
    lcGrava([Data.col(col).add(n).then(nid => Audit.log({ acao: doc ? 'criar_documento' : 'criar_caixa', entidade: doc ? 'documento' : 'caixa', entidadeId: nid, resumo: (doc ? 'Cadastrou o documento ' : 'Cadastrou a caixa ') + nome, depois: o }))], doc ? 'Documento cadastrado.' : 'Caixa cadastrada.');
  }
}
LC_FORM.dcDesat = f => {
  const it = dcAlvo(f.t, f.id); if (!it) return null;
  return { ico: 'lixo', sub: dcNome(f.t, it), titulo: f.t === 'caixa' ? 'Desativar caixa' : 'Desativar documento', corpo: lcMsg() + lcAv('Nada é apagado: ' + (f.t === 'caixa' ? 'a caixa sai das contas e vai para Desativadas' : 'o documento sai das contas e vai para Desativados') + ', com o histórico guardado. Dá para reativar depois.') + lcBl('Por que desativar', lcTx('motivo', f.motivo, 'ex.: formulário substituído pelo FOR 0190')), rodape: lcPe('dc-desat-ok', 'Desativar') };
};
function dcDesatOk() {
  const f = S.fm, it = f && dcAlvo(f.t, f.id); if (!it) return;
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo (pelo menos 5 letras).'); if (!lcTravar()) return;
  const ent = f.t === 'caixa' ? 'caixa' : 'documento';
  lcGrava([Data.col(f.t === 'caixa' ? 'sv2_caixas' : 'sv2_docs').update(f.id, { desativado: true }).then(() => Audit.log({ acao: 'desativar', entidade: ent, entidadeId: f.id, resumo: 'Desativou ' + dcNome(f.t, it) + ' — motivo: ' + mot, antes: { desativado: false }, depois: { desativado: true, motivo: mot }, autorizadoPor: { id: S.user.id, nome: S.user.nome } }))], ent === 'caixa' ? 'Caixa desativada.' : 'Documento desativado.');
}
LC_FORM.dcCorr = f => {
  const l = S.lanc.find(x => x.id === f.id); if (!l) return null;
  const direto = isPrincipal(S.user);
  return { ico: 'lapis', sub: l.alvoNome, titulo: direto ? 'Corrigir lançamento' : 'Pedir correção',
    corpo: lcMsg() + '<div class="fm-g">' + lcBl(l.alvoTipo === 'caixa' ? 'Data correta da limpeza' : 'Data correta do preenchimento', lcData('data', f.data)) + '</div>' + lcBl('Observação correta', lcTx('obs', f.obs)) + lcBl('Motivo da correção', lcTx('motivo', f.motivo, 'ex.: data digitada errada, a entrega foi no dia 12')) +
      lcAv(direto ? 'Como Principal, a correção vale na hora e fica registrada com o seu nome.' : 'Vai para: ' + esc(supsOf(S.user).map(nomeDe).join(', ') || 'ninguém cadastrado') + '. Só muda depois de aprovado.'),
    rodape: lcPe('dc-corr-ok', direto ? 'Corrigir' : 'Enviar pedido') };
};
async function dcCorrOk() {
  const f = S.fm, l = f && S.lanc.find(x => x.id === f.id); if (!l) return;
  const data = f.data || '', obs = String(f.obs || '').trim(), mot = String(f.motivo || '').trim();
  const er = validaData(data); if (er) return lcErro(er);
  if (data === l.data && obs === (l.obs || '')) return lcErro('Nada mudou. Altere a data ou a observação.');
  if (mot.length < 5) return lcErro('Escreva o motivo da correção.');
  if (dcCorrPend(l.id)) return lcErro('Já existe uma correção pendente para este lançamento.');
  if (!lcTravar()) return;
  const p = { alvoNome: l.alvoNome, antes: { data: l.data, obs: l.obs || '' }, depois: { data: data, obs: obs }, motivo: mot };
  if (isPrincipal(S.user)) { lcGrava([dcAplicaCorr(l.id, p, null)], 'Lançamento corrigido.'); return; }
  const aid = await Aprov.pedir({ tipo: 'corrigir_lancamento', titulo: 'Corrigir lançamento: ' + l.alvoNome, descricao: dcMudanca(p) + '\nMotivo: ' + mot, refTipo: 'lancamento', refId: l.id, payload: p });
  if (!aid) return; lcFim(); aviso('Pedido de correção enviado.');
}
/* aplica a correção: chamada por quem aprovou (sino) ou direto pelo Principal — igual ao EFClaudian */
async function dcAplicaCorr(lid, p, aprov) {
  const l = S.lanc.find(x => x.id === lid); if (!l) throw new Error('Lançamento não encontrado.');
  if (l.data !== p.antes.data || (l.obs || '') !== (p.antes.obs || '')) throw new Error('O lançamento mudou depois do pedido. Peça a correção de novo.');
  const h = (l.historico || []).slice();
  h.push({ ts: nowISO(), antes: p.antes, depois: p.depois, motivo: p.motivo, pedidoPor: aprov ? aprov.solicitanteNome : S.user.nome, aprovadoPor: S.user.nome, aprovId: aprov ? aprov.id : '' });
  await Data.col('sv2_lanc').update(lid, { data: p.depois.data, obs: p.depois.obs, alterado: true, historico: h, ultimaAprovId: aprov ? aprov.id : '' });
  Audit.log({ acao: 'corrigir_lancamento', entidade: 'lancamento', entidadeId: lid, resumo: 'Lançamento corrigido: ' + l.alvoNome + ' — ' + dcMudanca(p) + (aprov ? ' (pedido de ' + aprov.solicitanteNome + ')' : ''), antes: p.antes, depois: p.depois, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
}
APROV_APLICA.corrigir_lancamento = (p, a) => dcAplicaCorr(a.refId, p, a);
/* mover de grupo (pedido de 09/11 18:25): Formulários ↔ Regulatórios; é o mesmo campo "tipo" do EFClaudian */
function dcMover(id) {
  const d = S.docs.find(x => x.id === id); if (!d || !dcPodeCad()) return;
  const para = d.tipo === 'REGULATORIO' ? 'FORMULARIO' : 'REGULATORIO', nome = para === 'REGULATORIO' ? 'Regulatórios' : 'Formulários';
  csConfirma({ titulo: 'Mover para ' + nome + '?', texto: (d.codigo ? d.codigo + ' — ' : '') + d.titulo + (para === 'FORMULARIO' && d.vencimento ? '. A validade informada deixa de valer; ele passa a vencer pelo período.' : '.'), sim: 'Mover', nao: 'Cancelar' }, () => {
    const o = { tipo: para }; if (para === 'FORMULARIO' && d.vencimento) o.vencimento = '';
    Data.col('sv2_docs').update(id, o).then(() => { Audit.log({ acao: 'alterar_documento', entidade: 'documento', entidadeId: id, resumo: 'Moveu ' + (d.codigo ? d.codigo + ' — ' : '') + d.titulo + ' para ' + nome, antes: { tipo: d.tipo, vencimento: d.vencimento || '' }, depois: o, autorizadoPor: { id: S.user.id, nome: S.user.nome } }); aviso('Movido para ' + nome + '.'); }).catch(e => aviso(svErro(e), 'erro'));
  });
}
function dcReativa(t, id) {
  const it = dcAlvo(t, id); if (!it || !dcPodeCad()) return;
  Data.col(t === 'caixa' ? 'sv2_caixas' : 'sv2_docs').update(id, { desativado: false }).then(() => { Audit.log({ acao: 'ativar', entidade: t === 'caixa' ? 'caixa' : 'documento', entidadeId: id, resumo: 'Reativou ' + dcNome(t, it), antes: { desativado: true }, depois: { desativado: false }, autorizadoPor: { id: S.user.id, nome: S.user.nome } }); aviso('Reativado.'); }).catch(e => aviso(svErro(e), 'erro'));
}
DD_AO.dc = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; if (k === 'tipo') f.tipo = v; else if (k === 'periodo') f.periodo = v; else if (k === 'agua') f.agua = v; gvDesenha(true); };

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="dc-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), tp = t.getAttribute('data-t');
  if (a === 'dc-vista') { S.dcVista[t.getAttribute('data-aba')] = t.getAttribute('data-v') === 'cal' ? 'cal' : 'tab'; render(); }
  else if (a === 'dc-mes') { const ab = t.getAttribute('data-aba'), d = Number(t.getAttribute('data-d')), hj = hojeISO(); if (!d) { S.dcMes[ab] = hj.slice(0, 7); S.dcDia[ab] = hj; } else { const m = S.dcMes[ab] || hj.slice(0, 7), x = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + d, 1); S.dcMes[ab] = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); S.dcDia[ab] = S.dcMes[ab] + '-01'; } render(); }
  else if (a === 'dc-dia') { const ab = t.getAttribute('data-aba'), d = t.getAttribute('data-d'); S.dcDia[ab] = d; S.dcMes[ab] = d.slice(0, 7); render(); }
  else if (a === 'dc-doc') dcAbreDoc(id);
  else if (a === 'dc-cx') dcAbreCaixa(id);
  else if (a === 'dc-lanc') dcAbreLanc(id);
  else if (a === 'dc-lancar') lcAbrir({ k: 'dcLanc', t: tp, id: id, data: tp === 'caixa' ? hojeISO() : '', quem: tp === 'doc' ? ((d => d && d.responsavel && !/^N\/?A$/i.test(d.responsavel) ? d.responsavel : '')(dcAlvo('doc', id))) : '' }, dcVolta(tp, id));
  else if (a === 'dc-novo') { if (dcPodeCad()) lcAbrir({ k: 'dcCad', t: tp, tipo: 'FORMULARIO', periodo: tp === 'caixa' ? 'TRIMESTRAL' : 'MENSAL', agua: 'Potável' }); }
  else if (a === 'dc-edita') { const it = dcAlvo(tp, id); if (it && dcPodeCad()) lcAbrir(tp === 'caixa' ? { k: 'dcCad', t: 'caixa', id: id, tag: it.tag, agua: it.tipo, local: it.local, periodo: it.periodo } : { k: 'dcCad', t: 'doc', id: id, codigo: it.codigo, titulo: it.titulo, tipo: it.tipo || 'FORMULARIO', setor: it.setor, responsavel: it.responsavel, periodo: it.periodo, vencimento: it.vencimento }, dcVolta(tp, id)); }
  else if (a === 'dc-desativa') { const tt = S.caixas.some(x => x.id === id) ? 'caixa' : 'doc'; if (dcPodeCad()) lcAbrir({ k: 'dcDesat', t: tt, id: id }, dcVolta(tt, id)); }
  else if (a === 'dc-reativa') dcReativa(tp, id);
  else if (a === 'dc-mover') dcMover(id);
  else if (a === 'dc-corrigir') { const l = S.lanc.find(x => x.id === id); if (l) lcAbrir({ k: 'dcCorr', id: id, data: l.data, obs: l.obs || '' }, dcVolta('lanc', id)); }
  else if (a === 'dc-hist') { const it = dcAlvo(tp, id); if (!it) return; const st = tbEstado('dc-hist'); st.busca = tp === 'caixa' ? it.tag : (it.codigo && !/^N\/?A$/i.test(it.codigo) ? it.codigo + ' ' : '') + it.titulo; gvFecharSo(); ir('documentos', 'historico'); }
  else if (a === 'dc-lanc-ok') dcLancOk();
  else if (a === 'dc-cad-ok') dcCadOk();
  else if (a === 'dc-desat-ok') dcDesatOk();
  else if (a === 'dc-corr-ok') dcCorrOk();
});

/* busca geral: documentos e caixas */
BG_FONTES.push(q => {
  const d = S.docs.filter(x => bgCasa(q, [x.codigo, x.titulo, x.setor, x.responsavel].join(' '))).slice(0, 6).map(x => { const s = dcSit('doc', x); return { grupo: 'Documentos', nome: x.titulo, sub: [x.codigo, x.setor, s.st === 'venc' || s.st === 'aten' ? dcPrazo(s) : ''].filter(Boolean).join(' · '), ico: 'doc', abrir: () => { if (S.rota.area !== 'documentos' || S.rota.aba !== 'documentos') { S._gvNav = true; ir('documentos', 'documentos'); } dcAbreDoc(x.id); } }; });
  const c = S.caixas.filter(x => bgCasa(q, [x.tag, x.local, 'caixa'].join(' '))).slice(0, 4).map(x => ({ grupo: 'Caixas d’água', nome: x.tag + ' — ' + x.local, sub: dcPrazo(dcSit('caixa', x)), ico: 'doc', abrir: () => { if (S.rota.area !== 'documentos' || S.rota.aba !== 'caixas') { S._gvNav = true; ir('documentos', 'caixas'); } dcAbreCaixa(x.id); } }));
  return d.concat(c);
});
