/* EFCwork · calibracao.js — CALIBRAÇÃO COM HISTÓRICO (v0.3.3, pedido do Elias de 05/11).
   Ciclo da solicitação, em etapas: Solicitada (data + número CAL-AAAA-NN) → Cotação recebida (data, valor de cada equipamento)
   → Agendada (data marcada) → Calibrada (data, QUEM CALIBROU, código do certificado/registro, validade, resultado) → Compra (Nº da
   solicitação de compras, data de hoje, NF) = Encerrada. No detalhe do equipamento: o histórico só dele, com validade e código.
   Formato do EFClaudian (sv2_alm_cal: numero, prestador, itens[{equipId, valor, data, certificado, resultado, aplicado, compra}],
   cotacaoEm, situacao) + campos novos que o EFClaudian ignora: agenda{data, obs, porNome, ts}, cotacaoRef, itens[].tecnico,
   itens[].validade; no equipamento cal.validade e cal.tecnico. Ações só do Líder/Administrador. Prefixo: cb. */
Object.assign(S, { almCal: [] });
CS_CARGAS.push(() => { if (!alVe()) return; csOuve('sv2_alm_cal', l => { S.almCal = l; if (S.rota.area === 'almox') render(); }); });
const cbDe = id => S.almCal.find(c => c.id === id) || null;
const cbEnc = it => !!(it.aplicado && it.data && it.certificado && it.compra && it.compra.numero);
function cbSit(c) {
  if (c.situacao === 'cancelada') return 'cancelada';
  const it = c.itens || [];
  if (it.length && it.every(cbEnc)) return 'encerrada';
  if (it.length && it.every(i => i.aplicado)) return 'realizada';
  if (it.some(i => i.aplicado)) return 'parcial';
  if (c.agenda && c.agenda.data) return 'agendada';
  if (it.length && it.every(i => Number(i.valor) > 0)) return 'cotada';
  return 'aberta';
}
const CB_SIT = { aberta: ['Aguardando cotação', 'wa'], cotada: ['Cotada · falta agendar', 'wa'], agendada: ['Agendada', ''], parcial: ['Calibração em andamento', 'wa'], realizada: ['Calibrada · falta a compra', 'wa'], encerrada: ['Encerrada', 'ok'], cancelada: ['Cancelada', ''] };
const cbSitTxt = c => { const s = cbSit(c); return s === 'agendada' ? 'Agendada para ' + fmtD(c.agenda.data) : CB_SIT[s][0]; };
const cbPill = c => alPill(cbSitTxt(c), CB_SIT[cbSit(c)][1]);
const cbAbertas = () => S.almCal.filter(c => ['encerrada', 'cancelada'].indexOf(cbSit(c)) < 0).sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
function cbNumero() { const a = hojeISO().slice(0, 4), n = S.almCal.filter(c => String(c.numero || '').indexOf('CAL-' + a + '-') === 0).length + 1; return 'CAL-' + a + '-' + pad(n); }
const cbTotal = c => (c.itens || []).reduce((s, i) => s + (Number(i.valor) || 0), 0);
const cbEq = id => S.almEq.find(e => e.id === id) || null;
const cbFreq = e => (e && e.cal && Number(e.cal.freqMeses)) || 12;
/* as 5 etapas, com data e quem */
function cbEtapas(c) {
  const it = c.itens || [], apl = it.filter(i => i.aplicado), cot = !!c.cotacaoEm && it.length && it.every(i => Number(i.valor) > 0);
  const datas = apl.map(i => i.data).filter(Boolean).sort(), tec = Array.from(new Set(apl.map(i => i.tecnico).filter(Boolean)));
  const comp = it.filter(i => i.compra && i.compra.numero), compNums = Array.from(new Set(comp.map(i => i.compra.numero)));
  const e = [
    { id: 'sol', nome: 'Solicitada', feito: true, data: String(c.criadoEm || '').slice(0, 10), txt: c.numero + ' · ' + it.length + ' equipamento(s)' + (c.prestador ? ' · ' + c.prestador : ''), quem: c.criadoPorNome },
    { id: 'cot', nome: 'Cotação recebida', feito: cot || apl.length > 0, data: c.cotacaoEm || '', txt: cbTotal(c) ? brl(cbTotal(c)) + (c.cotacaoRef ? ' · ref. ' + c.cotacaoRef : '') : '' },
    { id: 'ag', nome: 'Agendada', feito: !!(c.agenda && c.agenda.data) || apl.length > 0, data: (c.agenda && c.agenda.data) || '', txt: c.agenda && c.agenda.data ? 'para ' + fmtD(c.agenda.data) + (c.agenda.obs ? ' · ' + c.agenda.obs : '') : '', quem: c.agenda && c.agenda.porNome },
    { id: 'cal', nome: 'Calibrada', feito: it.length > 0 && apl.length === it.length, parcial: apl.length > 0 && apl.length < it.length, data: datas[datas.length - 1] || '', txt: apl.length ? apl.length + ' de ' + it.length + (tec.length ? ' · por ' + tec.join(', ') : '') : '' },
    { id: 'compra', nome: 'Compra do serviço', feito: it.length > 0 && it.every(cbEnc), parcial: comp.length > 0 && comp.length < it.length, data: comp.length ? comp[0].compra.data : '', txt: compNums.length ? 'Nº ' + compNums.join(', ') + (comp[0].compra.nf ? ' · NF ' + comp[0].compra.nf : '') : '' }
  ];
  if (c.situacao !== 'cancelada') { const at = e.find(x => !x.feito); if (at) at.atual = true; }
  return e;
}

/* linha do tempo com FLUIDO (v0.3.4, Gota na v0.3.6) — genérica: calibração, amostras (v0.4) e o que vier.
   es = [{nome, feito, atual?, parcial?, data?, txt?, quem?, cor?}]; id = chave de "até onde cada um viu". */
function tlFluido(id, es) {
  const feitas = es.findIndex(x => !x.feito) < 0 ? es.length : es.findIndex(x => !x.feito), visto = cbNivelVisto(id, feitas);
  return '<div class="cb-tlw" data-cbtl="' + esc(id) + '" data-feitas="' + feitas + '"><span class="cb-tubo" aria-hidden="true"><i class="cb-fluido"></i></span><ol class="cb-tl">' + es.map((x, n) => { const apagada = x.feito && n >= visto;
    return '<li class="' + (x.feito ? 'ok' : x.atual ? 'at' : '') + (apagada ? ' esp' : '') + (x.parcial ? ' pc' : '') + '"><span class="cb-n"><span class="cb-ib"><i class="cb-in"></i></span><span class="cb-nn">' + (n + 1) + '</span>' + ic('ok') + '</span><div><b>' + esc(x.nome) + (x.data ? ' <em>' + fmtD(x.data) + '</em>' : '') + '</b>' + (x.txt ? '<span>' + esc(x.txt) + '</span>' : '') + (x.quem ? '<small>' + esc(x.quem) + '</small>' : '') + (x.atual ? '<small class="cb-agora">próxima etapa</small>' : '') + (x.alerta ? '<small class="cb-alerta">' + esc(x.alerta) + '</small>' : '') + '</div></li>'; }).join('') + '</ol></div>';
}
function cbPassos(c, mini) {
  const es = cbEtapas(c);
  if (mini) return '<ol class="cb-mini" aria-label="Etapas">' + es.map(x => '<li class="' + (x.feito ? 'ok' : x.atual ? 'at' : '') + '" title="' + esc(x.nome + (x.data ? ' · ' + fmtD(x.data) : '')) + '"><i></i><span>' + esc(x.nome) + '</span></li>').join('') + '</ol>';
  return tlFluido(c.id, es);}

/* ======================= tela (Equipamentos › Calibração) ======================= */
function cbTela() {
  const ab = cbAbertas(), todas = S.almCal.slice().sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
  const venc = S.almEq.filter(e => ['vencida', 'sem'].indexOf(eqCalSit(e)) >= 0).length, av = S.almEq.filter(e => eqCalSit(e) === 'avencer').length;
  const emSol = {}; ab.forEach(c => (c.itens || []).forEach(i => { if (!i.aplicado) emSol[i.equipId] = 1; }));
  const fora = S.almEq.filter(e => ['vencida', 'sem', 'avencer'].indexOf(eqCalSit(e)) >= 0 && !emSol[e.id]).length;
  let h = '<div class="kps"><div class="kp' + (venc ? ' cr' : '') + '"><b class="num">' + venc + '</b><span>vencidas ou sem calibração</span></div><div class="kp' + (av ? ' wa' : '') + '"><b class="num">' + av + '</b><span>a vencer em ' + EQ_AVENCER + ' dias</span></div><div class="kp"><b class="num">' + ab.length + '</b><span>solicitações em andamento</span></div><div class="kp' + (fora ? ' wa' : '') + '"><b class="num">' + fora + '</b><span>precisam e não estão em solicitação</span></div></div>';
  if (ab.length) h += '<div class="cb-cards">' + ab.map(c => '<button type="button" class="pn cb-card" data-act="cb-abre" data-id="' + esc(c.id) + '"><span class="cb-ch"><b>' + esc(c.numero) + '</b>' + cbPill(c) + '</span><small>' + esc(c.prestador || '') + ' · ' + (c.itens || []).length + ' equipamento(s)' + (cbTotal(c) ? ' · ' + brl(cbTotal(c)) : '') + '</small>' + cbPassos(c, true) + '</button>').join('') + '</div>';
  else h += '<section class="pn"><div class="vazio">' + ic('eng') + '<b>Nenhuma solicitação de calibração em andamento.</b>' + (fora ? '<span>' + fora + ' equipamento(s) precisam de calibração.</span>' : '') + '</div></section>';
  if (todas.length) h += tbHTML({ id: 'cb-hist', titulo: 'Solicitações de calibração', unidade: 'solicitações', linhas: todas, aoClicar: cbAbre, selecionado: S._alSel, buscaDica: 'Buscar número, prestador ou equipamento',
    busca: c => [c.numero, c.prestador, (c.itens || []).map(i => i.tag + ' ' + i.nome + ' ' + (i.certificado || '')).join(' ')].join(' '),
    filtros: [{ k: 'sit', rot: 'Situação', opcoes: Object.keys(CB_SIT).map(k => [k, CB_SIT[k][0]]), teste: (c, v) => cbSit(c) === v }],
    cols: [
      { k: 'num', rot: 'Número', fixa: true, v: c => c.numero || '', cls: 'forte' },
      { k: 'sol', rot: 'Solicitada', tipo: 'data', v: c => String(c.criadoEm || '').slice(0, 10) },
      { k: 'pre', rot: 'Prestador', v: c => c.prestador || '' },
      { k: 'n', rot: 'Equipamentos', tipo: 'num', v: c => (c.itens || []).length },
      { k: 'cot', rot: 'Cotação', tipo: 'data', v: c => c.cotacaoEm || '' },
      { k: 'ag', rot: 'Agendada', tipo: 'data', v: c => (c.agenda && c.agenda.data) || '' },
      { k: 'val', rot: 'Valor', tipo: 'num', v: c => cbTotal(c), html: c => cbTotal(c) ? brl(cbTotal(c)) : '<span class="tb-nada">—</span>', total: true, fmtTotal: brl },
      { k: 'sit', rot: 'Situação', v: c => cbSitTxt(c), html: c => cbPill(c) }] });
  return h;
}

/* ---------- gaveta da solicitação: as etapas e cada equipamento ---------- */
function cbAbre(id) {
  S._alSel = id; gvAbrir(() => {
    const c = cbDe(id); if (!c) return null; const s = cbSit(c), sup = alSup(), it = c.itens || [], fim = s === 'encerrada' || s === 'cancelada';
    const pend = it.filter(i => !i.aplicado), semCompra = it.filter(i => i.aplicado && !(i.compra && i.compra.numero));
    /* no máximo 3 botões: os da etapa atual, com o principal em destaque */
    let pe = '';
    if (sup && !fim) {
      const B = (act, ico, txt, pr) => '<button type="button" class="bt' + (pr ? ' pr' : '') + '" data-act="' + act + '" data-id="' + esc(id) + '">' + ic(ico) + txt + '</button>';
      if (s === 'aberta') pe = B('cb-real', 'ok', 'Calibrado') + B('cb-cot', 'lapis', 'Cotação', true);
      else if (s === 'cotada') pe = B('cb-cot', 'lapis', 'Cotação') + B('cb-real', 'ok', 'Calibrado') + B('cb-ag', 'relogio', 'Agendar', true);
      else if (s === 'agendada') pe = B('cb-ag', 'relogio', 'Reagendar') + B('cb-real', 'ok', 'Calibrado', true);
      else if (s === 'parcial') pe = B('cb-real', 'ok', 'Calibrado', !semCompra.length) + (semCompra.length ? B('cb-compra', 'doc', 'Compra', true) : '');
      else if (s === 'realizada') pe = B('cb-compra', 'doc', 'Solicitação de compras', true);
    }
    void pend;
    return { ico: 'eng', sub: 'Solicitação de calibração · ' + (c.prestador || ''), titulo: c.numero, pill: cbPill(c),
      lixeira: sup && !fim && !it.some(i => i.aplicado) ? { act: 'cb-canc', id: id, titulo: 'Cancelar a solicitação' } : null,
      cabAcoes: '<button type="button" class="bt ic-so" data-act="cb-print" data-id="' + esc(id) + '" title="Imprimir para o prestador" aria-label="Imprimir para o prestador">' + ic('impressora') + '</button>',
      corpo: cbPassos(c) + (c.situacao === 'cancelada' ? lcAv('Cancelada por ' + esc(c.canceladaPor || '') + ': ' + esc(c.canceladaMotivo || ''), 'cr') : '') + (c.obs ? '<p class="cb-obs">' + esc(c.obs) + '</p>' : '') +
        '<p class="gv-h">Equipamentos · ' + it.length + (cbTotal(c) ? ' · ' + brl(cbTotal(c)) : '') + '</p><div class="cb-its">' + it.map(i => { const e = cbEq(i.equipId);
          return '<button type="button" class="cb-it' + (i.aplicado ? ' ok' : '') + '" data-act="al-eq" data-id="' + esc(i.equipId) + '"><span class="cb-itn"><b>' + esc(i.tag || i.nome) + '</b><small>' + esc(i.tag ? i.nome : (i.marca || '')) + '</small></span><span class="cb-itd">' +
            (i.aplicado ? '<b>' + (i.resultado === 'reprovado' ? 'Reprovado' : 'Aprovado') + '</b><small>' + fmtD(i.data) + (i.tecnico ? ' · ' + esc(i.tecnico) : '') + '</small><small>cert. ' + esc(i.certificado) + (i.validade ? ' · válido até ' + fmtD(i.validade) : '') + '</small>' + (i.compra && i.compra.numero ? '<small>compra Nº ' + esc(i.compra.numero) + '</small>' : '')
              : '<b>' + (Number(i.valor) > 0 ? brl(i.valor) : 'sem cotação') + '</b><small>' + (e ? esc(EQ_CAL[eqCalSit(e)] ? EQ_CAL[eqCalSit(e)][0] : '') : '') + '</small>') + '</span></button>'; }).join('') + '</div>',
      rodape: pe };
  });
  render();
}

/* ---------- formulários ---------- */
function cbPrestadores() { const v = {}; S.almCal.forEach(c => { if (c.prestador) v[c.prestador] = 1; }); S.almEq.forEach(e => { if (e.cal && e.cal.prestador) v[e.cal.prestador] = 1; }); const oc = ((S.almPref || {}).prestOcultos) || []; return Object.keys(v).filter(x => oc.indexOf(x) < 0).sort(); }
LC_FORM.cbnova = f => {
  const ab = cbAbertas(), em = {}; ab.forEach(c => (c.itens || []).forEach(i => { if (!i.aplicado) em[i.equipId] = c.numero; }));
  const ord = { vencida: 0, sem: 1, avencer: 2, ok: 3, pausada: 4, '': 5 };
  const l = S.almEq.filter(e => e.situacao !== 'baixa' && (e.tipo !== 'qtd' || e.precisaCal)).sort((a, b) => (ord[eqCalSit(a)] - ord[eqCalSit(b)]) || String(a.tag || 'zz').localeCompare(String(b.tag || 'zz')) || String(a.nome).localeCompare(b.nome, 'pt-BR'));
  const n = Object.keys(f.sel).filter(k => f.sel[k]).length, pr = cbPrestadores();
  return { ico: 'eng', sub: cbNumero() + ' · solicitação de calibração', titulo: 'Nova solicitação', corpo: lcMsg() +
    '<div class="cb-selh"><p class="gv-h">Equipamentos · <span id="cb-n">' + n + ' marcado(s)</span></p><button type="button" class="bt" data-act="cb-marca-venc">Marcar vencidos e a vencer</button></div>' +
    '<div class="fm-pk"><label class="tb-busca">' + ic('lupa') + '<input type="search" data-pk placeholder="Buscar TAG, nome ou série" aria-label="Buscar equipamento"></label><div class="fm-pkl">' + l.map(e => { const s = eqCalSit(e), on = !!f.sel[e.id], b = em[e.id];
      return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="cb-ck" data-id="' + esc(e.id) + '"' + (b ? ' disabled' : '') + ' aria-pressed="' + on + '" data-busca="' + esc(tbNorm([e.tag, e.nome, e.serie, e.marca].join(' '))) + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(eqNomeC(e)) + '</b><small>' + esc([e.marca, e.serie ? 'série ' + e.serie : '', eqLocal(e)].filter(Boolean).join(' · ')) + '</small></span><span class="num">' + (b ? 'já na ' + esc(b) : s ? alPill(EQ_CAL[s][0], EQ_CAL[s][1]) : 'fora do plano') + '</span></button>'; }).join('') + '<p class="tb-nada fm-pkv" hidden>Nada encontrado.</p></div></div>' +
    lcBl('Prestador', pr.length ? ddHTML('lc:cbprest', f.prest || '', [['', 'Escolha o prestador']].concat(pr.map(x => [x, x])).concat([['__outro', 'Outro prestador']]), { remover: true }) + (f.prest === '__outro' ? lcIn('prestTxt', f.prestTxt, ' placeholder="Nome do prestador"') : '') : lcIn('prestTxt', f.prestTxt, ' placeholder="Nome do prestador"')) +
    lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: lcPe('cb-nova-ok', 'Abrir solicitação') };
};
async function cbNovaOk() {
  const f = S.fm; if (!f || !alSup()) return;
  const ids = Object.keys(f.sel).filter(k => f.sel[k]); if (!ids.length) return lcErro('Marque pelo menos um equipamento.');
  const prest = String(f.prest && f.prest !== '__outro' ? f.prest : f.prestTxt || '').trim().toUpperCase(); if (prest.length < 2) return lcErro('Informe o prestador.');
  if (!lcTravar()) return;
  const itens = ids.map(id => { const e = cbEq(id); return { equipId: id, tag: e.tag || '', nome: e.nome, marca: [e.marca, e.modelo].filter(Boolean).join(' '), serie: e.serie || '', unidade: e.unidade || 'matriz', valor: 0, data: '', certificado: '', resultado: '', aplicado: false }; });
  const o = { numero: cbNumero(), prestador: prest, obs: String(f.obs || '').trim(), itens: itens, situacao: 'ativa', cotacaoEm: '', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome, origem: APP_NOME };
  try {
    const id = await Data.col('sv2_alm_cal').add(o);
    Audit.log({ acao: 'calibracao_solicitacao', entidade: 'almox_cal', entidadeId: id, resumo: 'Abriu a solicitação de calibração ' + o.numero + ' (' + itens.length + ' equipamento(s), ' + prest + ')', depois: o });
    lcFim(() => cbAbre(id)); aviso(o.numero + ' aberta.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cbcot = f => {
  const c = cbDe(f.id); if (!c) return null;
  return { ico: 'lapis', sub: c.numero + ' · ' + (c.prestador || ''), titulo: 'Cotação recebida', corpo: lcMsg() + lcAv('O valor de cada equipamento, como veio do prestador.') +
    '<div class="fm-g">' + lcBl('Data da cotação', lcData('data', f.data)) + lcBl('Nº / referência da cotação', lcIn('ref', f.ref, ' placeholder="opcional"')) + '</div>' +
    '<div class="fm-lotes">' + (c.itens || []).map((i, n) => '<div class="fm-lt"><span><b>' + esc(i.tag || i.nome) + '</b><small>' + esc(i.tag ? i.nome : i.marca) + '</small></span>' + (i.aplicado ? '<span class="num">' + (Number(i.valor) > 0 ? brl(i.valor) : '—') + '</span>' : lcIn('v.' + n, f.v[n], ' inputmode="decimal" class="fm-i num" placeholder="R$" aria-label="Valor de ' + esc(i.tag || i.nome) + '"')) + '</div>').join('') + '</div>',
    rodape: lcPe('cb-cot-ok', 'Salvar cotação') };
};
async function cbCotOk() {
  const f = S.fm, c = cbDe(f.id); if (!c || !alSup()) return;
  const er = validaData(f.data); if (er) return lcErro(er);
  const itens = (c.itens || []).map(i => Object.assign({}, i)); let ruim = '';
  itens.forEach((i, n) => { if (i.aplicado) return; const t = String(f.v[n] == null ? '' : f.v[n]).trim(); if (!t) return; const v = alNum(t); if (!(v >= 0)) ruim = ruim || i.tag || i.nome; else i.valor = alR(v); });
  if (ruim) return lcErro('Valor inválido em ' + ruim + '.');
  if (!itens.some(i => Number(i.valor) > 0)) return lcErro('Informe o valor de pelo menos um equipamento.');
  if (!lcTravar()) return;
  try {
    await Data.col('sv2_alm_cal').update(c.id, { itens: itens, cotacaoEm: f.data, cotacaoRef: String(f.ref || '').trim() });
    Audit.log({ acao: 'calibracao_cotacao', entidade: 'almox_cal', entidadeId: c.id, resumo: 'Cotação da ' + c.numero + ' (' + fmtD(f.data) + '): ' + brl(itens.reduce((s, i) => s + (Number(i.valor) || 0), 0)), antes: { itens: c.itens }, depois: { itens: itens } });
    lcFim(); aviso('Cotação salva.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cbag = f => {
  const c = cbDe(f.id); if (!c) return null;
  return { ico: 'relogio', sub: c.numero + ' · ' + (c.prestador || ''), titulo: c.agenda && c.agenda.data ? 'Reagendar a calibração' : 'Agendar a calibração', corpo: lcMsg() +
    (c.agenda && c.agenda.data ? lcAv('Estava agendada para ' + fmtD(c.agenda.data) + '. A data antiga fica no histórico.') : '') +
    '<div class="fm-g">' + lcBl('Data marcada', lcData('data', f.data, true)) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="Ex.: técnico vem às 8h"')) + '</div>',
    rodape: lcPe('cb-ag-ok', 'Agendar') };
};
async function cbAgOk() {
  const f = S.fm, c = cbDe(f.id); if (!c || !alSup()) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.data || '')) return lcErro('Informe a data marcada.');
  if (f.data < String(c.criadoEm || '').slice(0, 10)) return lcErro('A data marcada não pode ser antes da solicitação.');
  if (!lcTravar()) return;
  const ag = { data: f.data, obs: String(f.obs || '').trim(), porId: S.user.id, porNome: S.user.nome, ts: nowISO() };
  const hist = (c.agendaHist || []).concat(c.agenda && c.agenda.data ? [c.agenda] : []);
  try {
    await Data.col('sv2_alm_cal').update(c.id, { agenda: ag, agendaHist: hist });
    Audit.log({ acao: 'calibracao_agenda', entidade: 'almox_cal', entidadeId: c.id, resumo: (c.agenda && c.agenda.data ? 'Reagendou' : 'Agendou') + ' a ' + c.numero + ' para ' + fmtD(f.data) + (c.agenda && c.agenda.data ? ' (era ' + fmtD(c.agenda.data) + ')' : ''), antes: { agenda: c.agenda || null }, depois: { agenda: ag } });
    lcFim(); aviso('Calibração agendada para ' + fmtD(f.data) + '.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cbreal = f => {
  const c = cbDe(f.id); if (!c) return null;
  const pend = (c.itens || []).map((i, n) => ({ i: i, n: n })).filter(x => !x.i.aplicado);
  return { ico: 'ok', sub: c.numero + ' · ' + (c.prestador || ''), titulo: 'Calibrado', corpo: lcMsg() + lcAv('Quem ficar sem certificado continua na solicitação para depois. A validade vem preenchida com a data + a frequência do equipamento; dá para mudar.') +
    '<div class="fm-g">' + lcBl('Data da calibração', lcData('data', f.data)) + lcBl('Quem calibrou', lcIn('tecnico', f.tecnico, ' placeholder="Técnico do prestador"')) + '</div>' +
    pend.map(x => { const e = cbEq(x.i.equipId), r = f.it[x.n] || {};
      return '<div class="fm-ln"><div class="fm-lnh"><b>' + esc(x.i.tag || x.i.nome) + '</b><small>' + esc(x.i.tag ? x.i.nome : x.i.marca) + ' · a cada ' + cbFreq(e) + ' meses</small></div><div class="fm-g">' +
        lcBl('Código do certificado', lcIn('it.' + x.n + '.cert', r.cert, ' placeholder="Nº do registro"')) + lcBl('Válido até', lcData('it.' + x.n + '.validade', r.validade || eqAddMeses(f.data || hojeISO(), cbFreq(e)), true)) + lcBl('Resultado', ddHTML('lc:cbres:' + x.n, r.res || 'aprovado', [['aprovado', 'Aprovado'], ['reprovado', 'Reprovado']])) + '</div></div>'; }).join(''),
    rodape: lcPe('cb-real-ok', 'Gravar calibração') };
};
async function cbRealOk() {
  const f = S.fm, c = cbDe(f.id); if (!c || !alSup()) return;
  const er = validaData(f.data); if (er) return lcErro(er);
  const tec = String(f.tecnico || '').trim(); if (tec.length < 2) return lcErro('Informe quem calibrou.');
  const itens = (c.itens || []).map(i => Object.assign({}, i)), feitos = [];
  for (let n = 0; n < itens.length; n++) {
    const i = itens[n], r = f.it[n] || {}; if (i.aplicado) continue; const cert = String(r.cert || '').trim(); if (!cert) continue;
    const e = cbEq(i.equipId), val = r.validade || eqAddMeses(f.data, cbFreq(e));
    if (val <= f.data) return lcErro('A validade de ' + (i.tag || i.nome) + ' tem de ser depois da calibração.');
    Object.assign(i, { data: f.data, certificado: cert, resultado: r.res || 'aprovado', tecnico: tec, validade: val, aplicado: true, aplicadoEm: nowISO() }); feitos.push(n);
  }
  if (!feitos.length) return lcErro('Informe o código do certificado de pelo menos um equipamento.');
  if (!lcTravar()) return;
  try {
    for (const n of feitos) {
      const i = itens[n], e = cbEq(i.equipId); if (!e) continue;
      const cal = Object.assign({}, e.cal || {}, { ultima: i.data, certificado: i.certificado, prestador: c.prestador, resultado: i.resultado, valor: Number(i.valor) || 0, campanha: c.numero, tecnico: i.tecnico, validade: i.validade });
      const sit = i.resultado === 'reprovado' ? (e.situacao === 'ativo' ? 'restricao' : e.situacao) : (e.restricaoCal && e.situacao === 'restricao' ? 'ativo' : e.situacao);
      const ev = { tipo: 'calibracao', data: i.data, texto: c.numero + ' · certificado ' + i.certificado + ' · ' + c.prestador + ' · por ' + i.tecnico + ' · ' + (i.resultado === 'reprovado' ? 'Reprovado' : 'Aprovado para uso') + ' · válido até ' + fmtD(i.validade), antes: { cal: e.cal || null }, depois: { cal: cal }, ts: nowISO(), porId: S.user.id, porNome: S.user.nome };
      await Data.col('sv2_alm_equip').update(e.id, { cal: cal, precisaCal: true, situacao: sit || 'ativo', restricaoCal: false, hist: (e.hist || []).concat([ev]), atualizadoEm: nowISO() });
      Audit.log({ acao: 'equip_calibracao', entidade: 'almox_equip', entidadeId: e.id, resumo: eqNomeC(e) + ': calibração da ' + c.numero + ' em ' + fmtD(i.data) + ', certificado ' + i.certificado + ', por ' + i.tecnico, antes: ev.antes, depois: ev.depois });
      if (i.resultado === 'reprovado') Notif.send({ nivel: 'aviso', titulo: 'Calibração reprovada: ' + eqNomeC(e), texto: c.numero + ' · certificado ' + i.certificado + '. O equipamento fica em uso com restrição.', para: 'superiores', refTipo: 'equip', refId: e.id }).catch(() => {});
    }
    await Data.col('sv2_alm_cal').update(c.id, { itens: itens });
    Audit.log({ acao: 'calibracao_realizada', entidade: 'almox_cal', entidadeId: c.id, resumo: c.numero + ': ' + feitos.length + ' equipamento(s) calibrado(s) por ' + tec + ' · ' + feitos.map(n => (itens[n].tag || itens[n].nome) + ' ' + itens[n].certificado).join(', ') });
    lcFim(); aviso(feitos.length + ' calibração(ões) gravada(s).');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cbcompra = f => {
  const c = cbDe(f.id); if (!c) return null; const sel = (c.itens || []).filter(i => i.aplicado && !(i.compra && i.compra.numero)), tot = sel.reduce((s, i) => s + (Number(i.valor) || 0), 0);
  return { ico: 'doc', sub: c.numero + ' · ' + sel.length + ' calibração(ões)' + (tot ? ' · ' + brl(tot) : ''), titulo: 'Solicitação de compras', corpo: lcMsg() + lcAv('Com o Nº da solicitação de compras, a data de hoje e a NF, a calibração fica Encerrada e não se mexe mais (igual ao EFClaudian).') +
    '<div class="fm-g">' + lcBl('Nº da solicitação de compras', lcIn('numero', f.numero)) + lcBl('Data', '<p class="fm-fixo">' + fmtD(hojeISO()) + ' (hoje)</p>') + lcBl('NF', lcIn('nf', f.nf)) + '</div>' + gvLinha(sel.map(i => [(i.tag || i.nome) + ' · cert. ' + i.certificado, Number(i.valor) > 0 ? brl(i.valor) : 'sem valor'])),
    rodape: lcPe('cb-compra-ok', 'Gravar e encerrar') };
};
async function cbCompraOk() {
  const f = S.fm, c = cbDe(f.id); if (!c || !alSup()) return;
  const num = String(f.numero || '').trim(), nf = String(f.nf || '').trim();
  if (num.length < 2) return lcErro('Informe o Nº da solicitação de compras.'); if (nf.length < 1) return lcErro('Informe a NF.');
  if (!lcTravar()) return;
  const itens = (c.itens || []).map(i => Object.assign({}, i)); let n = 0;
  itens.forEach(i => { if (i.aplicado && !(i.compra && i.compra.numero)) { i.compra = { numero: num, data: hojeISO(), nf: nf, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }; n++; } });
  try {
    await Data.col('sv2_alm_cal').update(c.id, { itens: itens });
    Audit.log({ acao: 'calibracao_compra', entidade: 'almox_cal', entidadeId: c.id, resumo: c.numero + ': solicitação de compras ' + num + ' (NF ' + nf + ') para ' + n + ' calibração(ões)' });
    lcFim(); aviso('Solicitação de compras gravada.' + (itens.every(cbEnc) ? ' ' + c.numero + ' encerrada.' : ''));
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cbcanc = f => { const c = cbDe(f.id); if (!c) return null; return { ico: 'lixo', icoCls: 'ini-cr', sub: 'Cancelar solicitação de calibração', titulo: c.numero, corpo: lcMsg() + lcAv('Fica na lista como cancelada, com o motivo.') + lcBl('Motivo', lcTx('motivoG', f.motivoG)), rodape: lcPe('cb-canc-ok', 'Cancelar solicitação') }; };
async function cbCancOk() {
  const f = S.fm, c = cbDe(f.id); if (!c || !alSup() || (c.itens || []).some(i => i.aplicado)) return;
  const m = String(f.motivoG || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  try { await Data.col('sv2_alm_cal').update(c.id, { situacao: 'cancelada', canceladaMotivo: m, canceladaEm: nowISO(), canceladaPor: S.user.nome }); Audit.log({ acao: 'calibracao_cancelar', entidade: 'almox_cal', entidadeId: c.id, resumo: 'Cancelou a ' + c.numero + ' — ' + m }); lcFim(); aviso(c.numero + ' cancelada.'); }
  catch (e) { lcErro(svErro(e)); }
}
function cbPrint(id) {
  const c = cbDe(id); if (!c) return; const e0 = S.empresa || {};
  let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>Solicitação de calibração ' + esc(c.numero) + '</b><span>' + esc(e0.nome || '') + ' · ' + esc(c.prestador || '') + ' · aberta em ' + fmtD(String(c.criadoEm).slice(0, 10)) + '</span></div>' +
    '<table><thead><tr><th>#</th><th>TAG</th><th>Equipamento</th><th>Marca / modelo</th><th>Nº de série</th><th>Faixa do equipamento</th><th>Faixa a calibrar</th><th>Tolerância</th><th>EMA</th><th>Cotação</th></tr></thead><tbody>' +
    (c.itens || []).map((i, n) => { const k = (cbEq(i.equipId) || {}).cal || {}; return '<tr><td>' + (n + 1) + '</td><td>' + esc(i.tag || '') + '</td><td>' + esc(i.nome) + '</td><td>' + esc(i.marca || '') + '</td><td>' + esc(i.serie || '') + '</td><td>' + esc(k.faixaEquip || '') + '</td><td>' + esc(k.faixaCal || '') + '</td><td>' + esc(k.tolerancia || '') + '</td><td>' + esc(k.ema || '') + '</td><td class="n">' + (Number(i.valor) > 0 ? brl(i.valor) : '') + '</td></tr>'; }).join('') +
    '</tbody></table><div class="imp-pe">' + APP_APELIDO + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'almox_cal', entidadeId: id, resumo: 'Relatório da solicitação de calibração ' + c.numero });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- no detalhe do equipamento: o histórico só dele ---------- */
function cbHistEquip(e) {
  const reg = [];
  S.almCal.forEach(c => (c.itens || []).forEach(i => { if (i.equipId !== e.id) return;
    reg.push({ c: c, i: i, ord: i.data || (c.agenda && c.agenda.data) || String(c.criadoEm || '').slice(0, 10) }); }));
  /* calibrações avulsas (sem solicitação) que estão só na linha do tempo do equipamento */
  const avulsas = (e.hist || []).filter(h => h.tipo === 'calibracao' && !(h.depois && h.depois.cal && h.depois.cal.campanha && S.almCal.some(c => c.numero === h.depois.cal.campanha)));
  reg.sort((a, b) => String(b.ord).localeCompare(String(a.ord)));
  if (!reg.length && !avulsas.length) return '<p class="gv-h">Calibrações</p><p class="tb-nada">Nenhuma calibração registrada.</p>';
  return '<p class="gv-h">Calibrações deste equipamento</p><div class="cb-hq">' + reg.map(x => { const c = x.c, i = x.i, s = cbSit(c);
    const lin = [['Solicitada', fmtD(String(c.criadoEm || '').slice(0, 10)) + ' · ' + c.numero], ['Cotação', c.cotacaoEm ? fmtD(c.cotacaoEm) + (Number(i.valor) > 0 ? ' · ' + brl(i.valor) : '') : ''], ['Agendada', c.agenda && c.agenda.data ? fmtD(c.agenda.data) : ''],
      ['Calibrada', i.aplicado ? fmtD(i.data) + ' · ' + (i.tecnico ? i.tecnico + ' · ' : '') + (c.prestador || '') : ''], ['Código do certificado', i.certificado || ''], ['Validade', i.validade ? fmtD(i.validade) : (i.aplicado && i.data ? fmtD(eqAddMeses(i.data, cbFreq(e))) : '')],
      ['Resultado', i.aplicado ? (i.resultado === 'reprovado' ? 'Reprovado' : 'Aprovado para uso') : ''], ['Compra', i.compra && i.compra.numero ? 'Nº ' + i.compra.numero + (i.compra.nf ? ' · NF ' + i.compra.nf : '') : '']].filter(l => l[1]);
    return '<button type="button" class="cb-hc' + (i.aplicado ? '' : ' at') + '" data-act="cb-abre" data-id="' + esc(c.id) + '"><span class="cb-hh"><b>' + esc(c.numero) + '</b>' + (i.aplicado ? alPill(i.resultado === 'reprovado' ? 'Reprovado' : 'Calibrado', i.resultado === 'reprovado' ? 'cr' : 'ok') : cbPill(c)) + '</span>' + (i.aplicado ? '' : cbPassos(c, true)) + '<dl class="gv-fl">' + lin.map(l => '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>').join('') + '</dl></button>'; }).join('') +
    avulsas.map(h => { const k = (h.depois && h.depois.cal) || {}; return '<div class="cb-hc"><span class="cb-hh"><b>Calibração avulsa</b>' + alPill(k.resultado === 'reprovado' ? 'Reprovado' : 'Calibrado', k.resultado === 'reprovado' ? 'cr' : 'ok') + '</span><dl class="gv-fl"><dt>Calibrada</dt><dd>' + fmtD(h.data || String(h.ts).slice(0, 10)) + (k.prestador ? ' · ' + esc(k.prestador) : '') + '</dd>' + (k.certificado ? '<dt>Código do certificado</dt><dd>' + esc(k.certificado) + '</dd>' : '') + (k.ultima ? '<dt>Validade</dt><dd>' + fmtD(k.validade || eqAddMeses(k.ultima, k.freqMeses || 12)) + '</dd>' : '') + '<dt>Registrado por</dt><dd>' + esc(h.porNome || '') + '</dd></dl></div>'; }).join('') + '</div>';
}

/* ---------- eventos ---------- */
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm;
  if (f && k === 'cbprest') { f.prest = v; f.sujo = true; f.msg = ''; gvDesenha(true); if (v === '__outro') { const i = $('#gv [data-fm="prestTxt"]'); if (i) i.focus(); } return; }
  if (f && k.indexOf('cbres:') === 0) { const n = Number(k.slice(6)); f.it[n] = f.it[n] || {}; f.it[n].res = v; f.sujo = true; return; }
  ant(k, v); }; })(DD_AO.lc);
DD_RM.lc = (function (ant) { return (k, v) => { if (k === 'cbprest') { const p = S.almPref || {}, oc = (p.prestOcultos || []).slice(), antes = oc.slice(); oc.push(v); alPrefGravar({ prestOcultos: oc }); if (S.fm && S.fm.prest === v) S.fm.prest = ''; gvDesenha(true); aviso('"' + v + '" saiu da sua lista.', 'ok', () => { alPrefGravar({ prestOcultos: antes }); gvDesenha(true); }); return; } ant(k, v); }; })(DD_RM.lc);
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="cb-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm, vol = S.gv && !S.gvForm ? S.gv : null, voltaDe = fn => () => gvAbrir(fn);
  if (a === 'cb-abre') { if (S.rota.aba !== 'calibracao') { S._gvNav = true; ir('almox', 'calibracao'); } cbAbre(id); }
  else if (a === 'cb-nova') { if (alSup()) lcAbrir({ k: 'cbnova', sel: {}, prest: (cbPrestadores()[0] || ''), prestTxt: '', obs: '' }); }
  else if (a === 'cb-pedir') { if (alSup()) lcAbrir({ k: 'cbnova', sel: { [id]: true }, prest: (cbPrestadores()[0] || ''), prestTxt: '', obs: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-nova-ok') cbNovaOk();
  else if (a === 'cb-ck') { if (!f) return; f.sel[id] = !f.sel[id]; f.sujo = true; t.classList.toggle('on', f.sel[id]); t.setAttribute('aria-pressed', f.sel[id]); t.querySelector('.cb-box').innerHTML = f.sel[id] ? ic('ok') : ''; const n = $('#cb-n'); if (n) n.textContent = Object.keys(f.sel).filter(k => f.sel[k]).length + ' marcado(s)'; }
  else if (a === 'cb-marca-venc') { if (!f) return; $$('#gv .cb-ck:not([disabled])').forEach(b => { const eq = cbEq(b.getAttribute('data-id')); if (eq && ['vencida', 'sem', 'avencer'].indexOf(eqCalSit(eq)) >= 0) f.sel[eq.id] = true; }); f.sujo = true; gvDesenha(true); }
  else if (a === 'cb-cot') { const c = cbDe(id); if (c && alSup()) lcAbrir({ k: 'cbcot', id: id, data: c.cotacaoEm || hojeISO(), ref: c.cotacaoRef || '', v: (c.itens || []).map(i => Number(i.valor) > 0 ? lcDin(i.valor) : '') }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-cot-ok') cbCotOk();
  else if (a === 'cb-ag') { const c = cbDe(id); if (c && alSup()) lcAbrir({ k: 'cbag', id: id, data: (c.agenda && c.agenda.data) || '', obs: (c.agenda && c.agenda.obs) || '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-ag-ok') cbAgOk();
  else if (a === 'cb-real') { if (alSup()) lcAbrir({ k: 'cbreal', id: id, data: hojeISO(), tecnico: '', it: ((cbDe(id) || {}).itens || []).map(() => ({ res: 'aprovado' })) }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-real-ok') cbRealOk();
  else if (a === 'cb-compra') { if (alSup()) lcAbrir({ k: 'cbcompra', id: id, numero: '', nf: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-compra-ok') cbCompraOk();
  else if (a === 'cb-canc') { if (alSup()) lcAbrir({ k: 'cbcanc', id: id, motivoG: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'cb-canc-ok') cbCancOk();
  else if (a === 'cb-print') cbPrint(id);
});
/* a data da calibração muda a validade sugerida de quem ainda não foi mexido */
document.addEventListener('change', e => {
  const t = e.target; if (!(t && t.getAttribute && S.fm && S.fm.k === 'cbreal' && t.getAttribute('data-fm') === 'data')) return;
  const f = S.fm, c = cbDe(f.id); if (!c) return;
  (c.itens || []).forEach((i, n) => { if (i.aplicado) return; const r = f.it[n] = f.it[n] || {}; if (!r.validadeMexida) r.validade = eqAddMeses(t.value || hojeISO(), cbFreq(cbEq(i.equipId))); });
  gvDesenha(true);
});
document.addEventListener('input', e => { const t = e.target; if (t && t.getAttribute && S.fm && S.fm.k === 'cbreal' && /^it\.\d+\.validade$/.test(t.getAttribute('data-fm') || '')) { const n = Number(t.getAttribute('data-fm').split('.')[1]); (S.fm.it[n] = S.fm.it[n] || {}).validadeMexida = true; } });

/* ---------- fluido da linha do tempo (pedido de 06/11) ----------
   Cada pessoa tem guardado até onde já VIU cada solicitação (cw-cbvisto-<pessoa>-<id>). Ao abrir a gaveta, o fluido sobe da última
   etapa vista até a atual; com 2 ou mais etapas novas, sobe uma, espera 0,4 s, sobe a próxima. Com a gaveta aberta, uma mudança sobe na hora.
   "Reduzir movimento" no aparelho: aparece pronto, sem animação. */
const CB_SOBE = 600, CB_PAUSA = 400, CB_GOTA = 300, CB_GOTA_PARA = 16; /* opção 3 · Gota, escolhida pelo Elias em 06/11 09:07 */
S._cbNivel = S._cbNivel || {}; S._cbTok = S._cbTok || {};
const cbChaveVisto = id => 'cw-cbvisto-' + ((S.user && S.user.id) || '') + '-' + id;
function cbNivelVisto(id, feitas) {
  if (S._cbNivel[id] != null) return Math.min(S._cbNivel[id], feitas);
  if (!csMovimento()) return feitas;
  const v = Number(Store.get(cbChaveVisto(id)) || 0); return Math.max(1, Math.min(v || 1, feitas));
}
function cbFluir(g, abriuAgora) {
  const ol = g.querySelector('[data-cbtl]'); if (!ol) return;
  const id = ol.getAttribute('data-cbtl'), feitas = Number(ol.getAttribute('data-feitas')) || 0, lis = Array.from(ol.querySelectorAll('.cb-tl > li'));
  const tubo = ol.querySelector('.cb-tubo'), fl = ol.querySelector('.cb-fluido'); if (!lis.length || !tubo) return;
  const centro = n => lis[n].offsetTop + 14, topo = centro(0);
  tubo.style.top = topo + 'px'; tubo.style.height = (centro(lis.length - 1) - topo) + 'px';
  const alto = n => n <= 1 ? 0 : Math.max(0, centro(n - 1) - topo - CB_GOTA_PARA); /* n = quantas etapas acesas; o fluido para na borda da bolinha (opção 3 · Gota) */
  let nivel = cbNivelVisto(id, feitas); const tok = (S._cbTok[id] || 0) + 1; S._cbTok[id] = tok;
  fl.style.transition = 'none'; fl.style.height = alto(nivel) + 'px'; void fl.offsetHeight;
  const grava = n => { S._cbNivel[id] = n; Store.set(cbChaveVisto(id), n); };
  if (nivel >= feitas) { grava(feitas); return; }
  ol.classList.add('cb-correndo');
  const passo = () => {
    if (S._cbTok[id] !== tok || !ol.isConnected) return;
    nivel++; fl.style.transition = 'height ' + CB_SOBE + 'ms cubic-bezier(.45,.05,.3,1)'; fl.style.height = alto(nivel) + 'px';
    setTimeout(() => {
      if (S._cbTok[id] !== tok || !ol.isConnected) return;
      /* cai uma gota na bolinha; ela enche de baixo para cima, solta uma onda e aparece o certo */
      const g = document.createElement('i'); g.className = 'cb-gota'; g.style.top = (topo + alto(nivel) - 3) + 'px'; ol.appendChild(g);
      setTimeout(() => {
        g.remove(); if (S._cbTok[id] !== tok || !ol.isConnected) return;
        const li = lis[nivel - 1]; if (li) { li.classList.remove('esp'); li.classList.add('acende'); const n = li.querySelector('.cb-n'), r = document.createElement('i'); r.className = 'cb-onda'; n.appendChild(r); setTimeout(() => r.remove(), 650); }
        grava(nivel);
        if (nivel < feitas) setTimeout(passo, CB_PAUSA); else ol.classList.remove('cb-correndo');
      }, CB_GOTA);
    }, CB_SOBE);
  };
  setTimeout(passo, abriuAgora ? 220 : 0);
}
GV_DEPOIS.push(cbFluir);
