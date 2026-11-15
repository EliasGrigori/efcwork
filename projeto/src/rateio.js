/* EFCwork · rateio.js — Rateios (v0.6.17). Prefixo: rt.
   Como no EFClaudian v2.102.60 (linhasRateio, viewRateio, viewRateioCal, openEmitir/emitirSolicitacao, openRcEmitir/rcEmitirOk),
   mas numa tela só: Campo, Água e Calibração na mesma tabela, com o Tipo na coluna (menu da coluna = filtro).
   - Campo: sv2_coletas enviadas (ou canceladas depois de enviadas), sem as "históricas". Valor congelado da amostra (ou o da análise).
   - Água: sv2_aguacol enviadas (ou canceladas). Valor congelado × amostras.
   - Calibração: cada equipamento com valor de cada solicitação de calibração (sv2_alm_cal, itens com valor > 0), por unidade.
   Rateio % = valor da linha ÷ soma do que a tabela está mostrando (segue os filtros), canceladas fora.
   Emitir solicitação de compra: Campo e água juntos, ou Calibração (separada, só Líder ★/Principal, unidade em pausa não emite).
   Nº da solicitação (≥ 3), data de HOJE (sem retroativo) e NF obrigatórios; O.S das remessas que ainda não têm é pedida aqui.
   Mesmos campos do EFClaudian: compra 'solicitado', pedidoSankhya, dataSolicitacao, solicitadoPor(Nome), nf (e numSolicitacao na água);
   na calibração itens[n].compra {numero, data, nf, porId, porNome, ts}. Amostra com a solicitação emitida = encerrada.
   Nenhuma coleção nova. O painel do rateio vai para Relatórios (próxima tarefa). */
/* unidades: nome e cidade vêm do cadastro da empresa (sv2_cfg/empresa.unid, como no EFClaudian); a Filial fica em pausa até o sistema por unidades */
const rtUnidCad = k => (((S.empresa || {}).unid || {})[k]) || {};
const RT_UNID = { matriz: { get nome() { return rtUnidCad('matriz').curto || rtUnidCad('matriz').nome || 'Matriz'; }, pausada: false }, filial: { get nome() { return rtUnidCad('filial').curto || rtUnidCad('filial').nome || 'Filial'; }, pausada: true } };
const rtVe = () => typeof temAtrib === 'function' && temAtrib(S.user, 'rateios');
const rtPodeCA = () => rtVe() && podeLancar(S.user);
const rtPodeCal = () => rtVe() && isSup(S.user);
TB_OCULTAS_PADRAO['rt-lista'] = ['os', 'ps', 'vl', 'qt', 'nf', 'ds', 'tr', 'cu', 'un', 'sp']; /* O.S e Nº da solicitação ficam em Colunas e na gaveta, para caber sem rolar para o lado */

CS_CARGAS.push(() => {
  if (!rtVe()) return;
  /* quem vê Rateios sem ver Coletas ou o Almoxarifado: carrega aqui o que a tabela precisa */
  const re = () => { if (S.rota.area === 'rateios' || S.rota.area === 'relatorios' || S.rota.area === 'inicio') render(); else if (S.gv) gvDesenha(); };
  if (!coVe()) { coOuveColetas(re); csOuve('sv2_analises', l => { S.analises = l; re(); }); }
  if (!alVe()) { csOuve('sv2_alm_cal', l => { S.almCal = l; re(); }); csOuve('sv2_alm_equip', l => { S.almEq = l; re(); }); }
});

/* ---------- linhas ---------- */
const rtAnalise = id => (S.analises || []).find(a => a.id === id) || null;
const rtValor = c => { if (c.valor !== undefined && c.valor !== null && c.valor !== '') return Number(c.valor) || 0; const a = rtAnalise(c.analiseId); return a ? Number(a.valor) || 0 : 0; };
const rtTri = iso => iso ? iso.slice(0, 4) + ' · T' + (Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1) : '';
const rtUnidEq = e => { const m = tbNorm(rtUnidCad('filial').mun || '').trim(); return m && tbNorm((e && (e.local || e.lugar)) || '').indexOf(m) >= 0 ? 'filial' : 'matriz'; }; /* o local do equipamento na cidade da Filial */
function rtLinhas() {
  const out = [];
  (S.coletas || []).filter(c => (c.envio || (c.situacao === 'cancelada' && c.enviado)) && !c.historica).forEach(c => {
    const t = typeof pgTalhao === 'function' ? pgTalhao(c.talhao) : null;
    out.push({ id: 'c:' + c.id, k: 'campo', oid: c.id, tipo: CO_TXT[c.tipo] || c.tipo || '', item: coNome(c), data: c.envio || c.data || '', serv: c.analiseNome || '', lab: c.lab || '', os: c.os || '', nf: c.nf || '',
      ped: c.pedidoSankhya || '', dsol: c.dataSolicitacao || '', valor: rtValor(c), qtd: 1, cultura: (t && t.cultura) || c.cultura || (c.tipo === 'COMPOSTO' ? 'COMPOSTO' : ''), unid: 'matriz',
      canc: c.situacao === 'cancelada', sol: c.compra === 'solicitado', solPor: c.solicitadoPorNome || '', rem: c.envio ? 'c|' + c.envio + '|' + (c.lab || '—') : '' });
  });
  (S.aguacol || []).filter(c => c.envio || c.situacao === 'cancelada').forEach(c => {
    out.push({ id: 'a:' + c.id, k: 'agua', oid: c.id, tipo: 'Água', item: c.pontoNome || '', data: c.envio || c.data || '', serv: c.analiseNome || '', lab: c.lab || '', os: c.os || '', nf: c.nf || '',
      ped: c.pedidoSankhya || '', dsol: c.dataSolicitacao || '', valor: rtValor(c), qtd: Number(c.qtd) || 1, cultura: '', unid: 'matriz',
      canc: c.situacao === 'cancelada', sol: c.compra === 'solicitado', solPor: c.solicitadoPorNome || '', rem: c.envio ? 'a|' + c.envio + '|' + (c.lab || '—') : '' });
  });
  (S.almCal || []).filter(c => c.situacao !== 'cancelada').forEach(c => (c.itens || []).forEach((i, n) => {
    if (!(Number(i.valor) > 0)) return;
    const e = typeof cbEq === 'function' ? cbEq(i.equipId) : null, cp = i.compra && i.compra.numero ? i.compra : null;
    out.push({ id: 'k:' + c.id + '|' + n, k: 'cal', oid: c.id, n: n, tipo: 'Calibração', item: [i.tag || (e && e.tag), i.nome || (e && e.nome)].filter(Boolean).join(' · '), data: i.data || c.cotacaoEm || diaLocal(c.criadoEm) || '',
      serv: c.numero || '', lab: c.prestador || '', os: '', nf: cp ? cp.nf || '' : '', ped: cp ? cp.numero : '', dsol: cp ? cp.data || '' : '', valor: Number(i.valor) || 0, qtd: 1, cultura: '',
      unid: i.unidade || rtUnidEq(e), canc: false, sol: !!cp, enc: !!(cp && i.aplicado && i.data && i.certificado), solPor: cp ? cp.porNome || '' : '', rem: '' });
  }));
  return out.sort((a, b) => String(b.data).localeCompare(String(a.data)) || cmpTxt(a.item, b.item));
}
const rtPendente = r => !r.canc && !r.sol;
const rtPendCA = () => rtLinhas().filter(r => r.k !== 'cal' && rtPendente(r));
const rtPendCal = () => rtLinhas().filter(r => r.k === 'cal' && rtPendente(r) && !RT_UNID[r.unid].pausada);
function rtSit(r) {
  if (r.canc) return ['Cancelada', ''];
  if (r.k === 'cal') return r.enc ? ['Encerrada', 'ok'] : r.sol ? ['Solicitada', 'ok'] : ['Pendente', 'wa'];
  return r.sol ? ['Solicitada', 'ok'] : ['Pendente', 'wa'];
}
const rtVt = r => r.canc ? 0 : r.valor * r.qtd;

/* ---------- tela ---------- */
const RT_PER = [['ano', 'Este ano'], ['T1', '1º trimestre deste ano'], ['T2', '2º trimestre deste ano'], ['T3', '3º trimestre deste ano'], ['T4', '4º trimestre deste ano'], ['S1', '1º semestre deste ano'], ['S2', '2º semestre deste ano'], ['passado', 'Ano passado']];
function rtPerOk(iso, v) {
  const a = hojeISO().slice(0, 4); if (!iso) return false;
  if (v === 'passado') return iso.slice(0, 4) === String(Number(a) - 1);
  if (iso.slice(0, 4) !== a) return false; const m = Number(iso.slice(5, 7));
  return v === 'ano' ? true : v[0] === 'T' ? Math.floor((m - 1) / 3) + 1 === Number(v[1]) : (m <= 6 ? 1 : 2) === Number(v[1]);
}
let rtTotVis = 0;
function rtTela() {
  const l = rtLinhas(), pCA = l.filter(r => r.k !== 'cal' && rtPendente(r)), pCal = l.filter(r => r.k === 'cal' && rtPendente(r));
  const ant = pCA.map(r => r.data).filter(Boolean).sort()[0];
  const meta = [pCA.length ? metaPl(pCA.length + (pCA.length === 1 ? ' amostra sem solicitação' : ' amostras sem solicitação'), 'wa', 'relogio') : metaPl('Nenhuma amostra sem solicitação', 'ok', 'ok'),
    pCal.length ? metaPl(pCal.length + (pCal.length === 1 ? ' calibração sem solicitação' : ' calibrações sem solicitação'), 'wa') : ''].filter(Boolean);
  if (ant && meta[0]) meta[0] = meta[0].replace('<span class="cs-pl', '<span title="A mais antiga foi enviada em ' + esc(fmtD(ant)) + '" class="cs-pl');
  const podeE = (rtPodeCA() && pCA.length) || (rtPodeCal() && rtPendCal().length);
  const acoes = podeE ? '<button type="button" class="bt pr" data-act="rt-emitir">' + ic('doc') + 'Emitir solicitação</button>' : '';
  const c = cabecalho({ titulo: 'Rateio', meta: meta, acoes: acoes });
  if (!l.length) return c + '<section class="pn"><div class="vazio">' + ic('pizza') + '<b>Nada para ratear ainda.</b><span>Entram aqui as amostras de campo e de água depois de enviadas ao laboratório, e as calibrações com valor da cotação.</span></div></section>';
  const cfg = { id: 'rt-lista', titulo: 'Rateio', unidade: 'linhas', unidade1: 'linha', linhas: l, aoClicar: rtAbre, selecionado: S._rtSel, vazio: 'Nenhuma linha com este filtro.',
    busca: r => [r.tipo, r.item, r.serv, r.lab, r.os, r.nf, r.ped, r.solPor, r.cultura].join(' '),
    filtros: [{ k: 'si', rot: 'Situação', opcoes: [['pend', 'Só as pendentes'], ['sol', 'Com solicitação'], ['canc', 'Canceladas']], teste: (r, v) => v === 'pend' ? rtPendente(r) : v === 'sol' ? r.sol : r.canc },
      { k: 'dt', rot: 'Data', opcoes: RT_PER, teste: (r, v) => rtPerOk(r.data, v) }],
    cols: [
      { k: 'tp', rot: 'Tipo', v: r => r.tipo },
      { k: 'it', rot: 'Área ou ponto', v: r => r.item, cls: 'forte rt-c', longo: true, titulo: r => r.k === 'cal' ? 'Equipamento: ' + r.item : r.item },
      { k: 'dt', rot: 'Data', tipo: 'data', v: r => r.data, titulo: r => r.k === 'cal' ? 'Data da calibração (ou da cotação)' : 'Data do envio ao laboratório' },
      { k: 'sv', rot: 'Análise', v: r => r.serv, cls: 'rt-c', longo: true, titulo: r => r.k === 'cal' ? 'Solicitação de calibração ' + r.serv : r.serv },
      { k: 'lb', rot: 'Laboratório', v: r => r.lab, titulo: r => r.k === 'cal' ? 'Prestador: ' + r.lab : r.lab },
      { k: 'os', rot: 'O.S', v: r => r.canc ? '' : r.os },
      { k: 'ps', rot: 'Nº sol.', titulo: () => 'Nº da solicitação de compra', v: r => r.canc ? '' : r.ped },
      { k: 'ds', rot: 'Data da solicitação', tipo: 'data', v: r => r.canc ? '' : r.dsol },
      { k: 'nf', rot: 'NF', v: r => r.canc ? '' : r.nf },
      { k: 'vl', rot: 'Valor', tipo: 'num', v: r => r.valor, html: r => esc(brl(r.valor)) },
      { k: 'qt', rot: 'Quantidade', tipo: 'num', v: r => r.qtd },
      { k: 'vt', rot: 'Valor total', tipo: 'num', v: rtVt, html: r => r.canc ? '<span class="rt-canc">cancelada</span>' : esc(brl(rtVt(r))), total: 'soma', fmtTotal: brl },
      { k: 'rt', rot: 'Rateio', tipo: 'num', v: r => r.canc || !rtTotVis ? null : Math.round(rtVt(r) / rtTotVis * 1000) / 10, html: r => r.canc || !rtTotVis ? '' : esc(numBR(Math.round(rtVt(r) / rtTotVis * 1000) / 10, 1)) + '%', titulo: () => 'Parte desta linha no total do que a tabela está mostrando' },
      { k: 'tr', rot: 'Trimestre', v: r => rtTri(r.data) },
      { k: 'cu', rot: 'Cultura', v: r => r.cultura },
      { k: 'un', rot: 'Unidade', v: r => RT_UNID[r.unid].nome },
      { k: 'sp', rot: 'Solicitado por', v: r => r.solPor },
      { k: 'si', rot: 'Situação', v: r => rtSit(r)[0], html: r => alPill(rtSit(r)[0], rtSit(r)[1]) }] };
  /* o rateio de cada linha segue o que a tabela mostra (filtros, busca); canceladas não contam */
  rtTotVis = 0; rtTotVis = tbFiltrar(cfg, { semOrdem: true }).reduce((s, r) => s + rtVt(r), 0);
  return c + tbHTML(cfg);
}
TELAS.rateios = () => rtTela();

/* a linha abre a gaveta da origem (amostra, coleta de água ou calibração), onde moram as ações de sempre */
function rtAbre(id) {
  const r = rtLinhas().find(x => x.id === id); if (!r) return; S._rtSel = id;
  if (r.k === 'campo') coAbre(r.oid); else if (r.k === 'agua') agAbre(r.oid); else cbAbre(r.oid);
}

/* ---------- emitir a solicitação de compra ---------- */
const RT_DE = [['ca', 'Campo e água'], ['cal', 'Calibração']];
const rtCand = f => f.de === 'cal' ? rtPendCal() : rtPendCA();
const rtAlvos = f => { const c = rtCand(f); return f.alvo === 'escolher' ? c.filter(r => f.sel[r.id]) : c; };
const rtRemNome = k => { const p = k.split('|'); return (p[0] === 'a' ? 'Água · ' : '') + p[2] + ' · envio ' + fmtD(p[1]); };
const rtRemSemOs = l => Array.from(new Set(l.filter(r => r.k !== 'cal' && !r.os && r.rem).map(r => r.rem)));
function rtRemItens(k) { const p = k.split('|'); return p[0] === 'a' ? (S.aguacol || []).filter(c => c.situacao !== 'cancelada' && c.envio === p[1] && (c.lab || '—') === p[2]) : (S.coletas || []).filter(c => c.situacao !== 'cancelada' && c.envio === p[1] && (c.lab || '—') === p[2]); }
function rtEmitirAbre(de) {
  const ca = rtPodeCA() && rtPendCA().length, cal = rtPodeCal() && rtPendCal().length;
  if (!ca && !cal) return;
  lcAbrir({ k: 'rtEmit', de: de || (ca ? 'ca' : 'cal'), alvo: 'todas', sel: {}, numero: '', nf: '', os: {} });
}
LC_FORM.rtEmit = f => {
  const cand = rtCand(f), al = rtAlvos(f), tot = al.reduce((s, r) => s + rtVt(r), 0), rems = rtRemSemOs(al);
  const opDe = RT_DE.filter(o => o[0] === 'cal' ? rtPodeCal() && rtPendCal().length : rtPodeCA() && rtPendCA().length);
  const lin = r => { const on = !!f.sel[r.id]; return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="rt-ck" data-id="' + esc(r.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '" data-busca="' + esc(tbNorm([r.tipo, r.item, r.lab, r.serv].join(' '))) + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span>' +
    '<span><b>' + esc(r.item || '—') + '</b><small>' + esc([r.tipo, r.serv, r.lab, r.k === 'cal' ? '' : 'envio ' + fmtD(r.data)].filter(Boolean).join(' · ')) + '</small></span><em class="num">' + esc(brl(rtVt(r))) + '</em></button>'; };
  const corpo = lcMsg() + '<div class="rt-em-v"><b class="num" id="rt-tot">' + esc(brl(tot)) + '</b><small id="rt-n">' + esc(al.length) + (al.length === 1 ? (f.de === 'cal' ? ' calibração' : ' amostra') : (f.de === 'cal' ? ' calibrações' : ' amostras')) + ' · solicitado por ' + esc(S.user.nome) + '</small></div>' +
    '<p class="gv-h">1 · O que entra</p>' +
    '<div class="fm-g cl-fm2">' + (opDe.length > 1 ? lcBl('Solicitação de', ddHTML('rt:de', f.de, opDe)) : '') + lcBl('Entram', ddHTML('rt:alvo', f.alvo, [['todas', 'Todas (' + esc(cand.length) + ')'], ['escolher', 'Escolher quais']])) + '</div>' +
    (f.de === 'cal' && rtLinhas().some(r => r.k === 'cal' && rtPendente(r) && RT_UNID[r.unid].pausada) ? lcAv(esc(RT_UNID.filial.nome) + ' está em pausa até o sistema por unidades: as calibrações de lá não entram.') : '') +
    (f.alvo === 'escolher' ? '<div class="cb-selh"><p class="gv-h" id="rt-mc">' + esc(al.length + ' de ' + cand.length) + ' marcada(s)</p><button type="button" class="bt lk" data-act="rt-todas">' + (al.length && al.length === cand.length ? 'Desmarcar todas' : 'Marcar todas') + '</button></div>' +
      '<div class="fm-pk"><input class="fm-i fm-pkb" data-pk placeholder="Buscar área, ponto, laboratório…" autocomplete="off"><div class="fm-pkl rt-pkl">' + cand.map(lin).join('') + '</div><p class="fm-pkv" hidden>Nada com essa busca.</p></div>' : '') +
    '<p class="gv-h">2 · Solicitação</p><div class="fm-g cl-fm2">' + lcBl('Nº da solicitação', lcIn('numero', f.numero, ' inputmode="numeric" enterkeyhint="next"')) + lcBl('Data', '<p class="fm-fixo">' + esc(fmtD(hojeISO())) + ' (hoje)</p>') + '</div>' +
    lcBl('NF do boleto', lcIn('nf', f.nf, ' enterkeyhint="next"')) +
    (rems.length ? '<p class="gv-h">3 · O.S das remessas</p>' + lcAv(rems.length + (rems.length === 1 ? ' remessa ainda está sem O.S.' : ' remessas ainda estão sem O.S.') + ' Vale para as amostras da remessa que estão sem O.S.') +
      rems.map(k => lcBl((k[0] === 'a' ? '' : 'Campo · ') + rtRemNome(k), lcIn('os.' + k.replace(/\./g, '_'), (f.os || {})[k.replace(/\./g, '_')], ' placeholder="Número que o laboratório mandou"'))).join('') : '') +
    lcAv(f.de === 'cal' ? 'Com a solicitação emitida e o certificado registrado, a calibração fica encerrada.' : 'Com a solicitação emitida, as amostras ficam encerradas: depois, só a baixa do laudo. Qualquer outra mudança passa por pedido de correção ao Líder ★ ou ao Principal.');
  return { ico: 'doc', sub: 'Rateios', titulo: 'Emitir solicitação de compra', corpo: corpo, rodape: lcPe('rt-emitir-ok', 'Emitir') };
};
DD_AO.rt = (k, v) => { const f = S.fm; if (!f) return; f[k] = v; f.msg = ''; if (k === 'de') { f.sel = {}; f.alvo = 'todas'; } gvDesenha(true); };
async function rtEmitirOk() {
  const f = S.fm; if (!f) return; const al = rtAlvos(f), num = String(f.numero || '').trim(), nf = String(f.nf || '').trim(), data = hojeISO();
  if (f.de === 'cal' ? !rtPodeCal() : !rtPodeCA()) return lcErro('Você não pode emitir esta solicitação.');
  if (!al.length) return lcErro('Marque pelo menos uma ' + (f.de === 'cal' ? 'calibração.' : 'amostra.'));
  if (num.length < 3) return lcErro('Informe o Nº da solicitação.');
  if (!nf) return lcErro('Informe a NF do boleto.');
  const rems = rtRemSemOs(al), osM = {}, falta = [];
  rems.forEach(k => { const v = String((f.os || {})[k.replace(/\./g, '_')] || '').trim(); if (v) osM[k] = v; else falta.push(rtRemNome(k)); });
  if (falta.length) return lcErro('Informe a O.S de: ' + falta.join('; ') + '.');
  if (!lcTravar()) return;
  const u = S.user, tot = al.reduce((s, r) => s + rtVt(r), 0);
  try {
    if (f.de === 'cal') {
      const por = {}; al.forEach(r => { (por[r.oid] = por[r.oid] || []).push(r.n); });
      for (const cid of Object.keys(por)) {
        const c = cbDe(cid); if (!c) continue; const itens = (c.itens || []).map(i => Object.assign({}, i));
        por[cid].forEach(n => { if (itens[n] && !(itens[n].compra && itens[n].compra.numero)) itens[n].compra = { numero: num, data: data, nf: nf, porId: u.id, porNome: u.nome, ts: nowISO() }; });
        await Data.col('sv2_alm_cal').update(cid, { itens: itens });
      }
      Audit.log({ acao: 'emitir_solicitacao', entidade: 'almox_cal', entidadeId: num, resumo: 'Solicitação ' + num + ' (calibração) com ' + al.length + ' equipamento(s) · ' + brl(tot) + ' · NF ' + nf });
    } else {
      let nOs = 0;
      for (const k of Object.keys(osM)) {
        const agua = k[0] === 'a', col = agua ? 'sv2_aguacol' : 'sv2_coletas';
        for (const c of rtRemItens(k).filter(x => !x.os)) {
          await Data.col(col).update(c.id, { os: osM[k] }); nOs++;
          Audit.log({ acao: 'os_remessa', entidade: agua ? 'coleta_agua' : 'coleta', entidadeId: c.id, resumo: 'O.S ' + osM[k] + ' da remessa ' + rtRemNome(k) + ' (solicitação ' + num + ')', antes: { os: '' }, depois: { os: osM[k] } });
        }
      }
      let n = 0;
      for (const r of al) {
        const agua = r.k === 'agua', col = agua ? 'sv2_aguacol' : 'sv2_coletas', c = (agua ? S.aguacol : S.coletas).find(x => x.id === r.oid);
        if (!c || c.compra === 'solicitado' || c.situacao === 'cancelada') continue;
        const patch = { compra: 'solicitado', pedidoSankhya: num, dataSolicitacao: data, solicitadoPor: u.id, solicitadoPorNome: u.nome, nf: nf };
        if (agua && !c.numSolicitacao) patch.numSolicitacao = num;
        await Data.col(col).update(c.id, patch); n++;
        Audit.log({ acao: 'emitir_solicitacao', entidade: agua ? 'coleta_agua' : 'coleta', entidadeId: c.id, resumo: 'Solicitação ' + num + ' em ' + fmtD(data) + ' · NF ' + nf, depois: patch });
      }
      Audit.log({ acao: 'emitir_solicitacao', entidade: 'solicitacao', entidadeId: num, resumo: 'Emitiu a solicitação ' + num + ' com ' + n + ' amostra(s) · ' + brl(tot) + (nOs ? ' · O.S em ' + nOs : '') + ' · NF ' + nf, depois: { solicitacao: num, data: data, amostras: n, nf: nf } });
    }
    lcFim(); aviso('Solicitação ' + num + ' emitida.');
  } catch (e) { lcErro(svErro(e)); }
}

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="rt-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), f = S.fm;
  if (a === 'rt-ir') { const st = tbEstado('rt-lista'); st.filtros.si = 'pend'; } /* o link do Início abre o Rateio só com as pendentes */
  else if (a === 'rt-emitir') rtEmitirAbre();
  else if (a === 'rt-emitir-ok') rtEmitirOk();
  else if (a === 'rt-ck' && f) { const id = t.getAttribute('data-id'); if (f.sel[id]) delete f.sel[id]; else f.sel[id] = true; f.msg = ''; f.sujo = true;
    /* marca no lugar (a lista não volta ao topo); só a O.S das remessas muda o formulário inteiro */
    const on = !!f.sel[id]; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); t.querySelector('.cb-box').innerHTML = on ? ic('ok') : '';
    const al = rtAlvos(f), cand = rtCand(f), q = (sel, v) => { const el = $(sel); if (el) el.textContent = v; };
    q('#rt-tot', brl(al.reduce((s, r) => s + rtVt(r), 0))); q('#rt-n', al.length + (al.length === 1 ? (f.de === 'cal' ? ' calibração' : ' amostra') : (f.de === 'cal' ? ' calibrações' : ' amostras')) + ' · solicitado por ' + S.user.nome); q('#rt-mc', al.length + ' de ' + cand.length + ' marcada(s)');
    if (rtRemSemOs(al).length !== $$('#gv [data-fm^="os."]').length) { const l = $('#gv .rt-pkl'), y = l ? l.scrollTop : 0; gvDesenha(true); const l2 = $('#gv .rt-pkl'); if (l2) l2.scrollTop = y; } }
  else if (a === 'rt-todas' && f) { const c = rtCand(f), tudo = c.every(r => f.sel[r.id]); f.sel = {}; if (!tudo) c.forEach(r => { f.sel[r.id] = true; }); gvDesenha(true); }
});

/* busca geral: acha a solicitação de compra pelo Nº e abre o Rateio filtrado por ela */
BG_FONTES.push(q => {
  if (!rtVe()) return []; const m = {}; rtLinhas().filter(r => r.ped && !r.canc).forEach(r => { (m[r.ped] = m[r.ped] || []).push(r); });
  return Object.keys(m).filter(p => bgCasa(q, 'solicitação ' + p + ' ' + m[p].map(r => r.item + ' ' + r.lab).join(' '))).slice(0, 6).map(p => ({ grupo: 'Rateio', nome: 'Solicitação ' + p, sub: m[p].length + (m[p].length === 1 ? ' linha · ' : ' linhas · ') + brl(m[p].reduce((s, r) => s + rtVt(r), 0)) + ' · ' + fmtD(m[p][0].dsol), ico: 'doc',
    abrir: () => { tbEstado('rt-lista').busca = p; ir('rateios'); } }));
});
