/* EFCwork · aguapj.js — COLETAS › ÁGUA: PROJETOS DE COLETA e PONTOS DE ÁGUA (v0.6.7). Prefixos: pj (projetos) e pa (pontos de água; pp é do plano.js).
   Mesmos dados do EFClaudian v2.31+ (sv2_aguaproj, sv2_aguaponto). Um projeto = pontos + como coletar (todos ou rodízio N por vez) + análise(s)
   + quando (dia da semana, a cada N semanas, hora, a partir de). Cada data do calendário é uma "ocorrência" (oc = a data original):
   confirmadas / remarcadas / puladas ficam em mapas por oc no próprio projeto; a coleta lançada leva projetoId + ocorrencia.
   O rodízio dos bebedouros é o projeto "legado" (vira documento na primeira mudança, pjGarantir).
   Novidades pedidas pelo Elias em 11/11 21:56 (decisões na página da v0.6.7):
   - frequências com nome (semanal, quinzenal, mensal = 4 semanas, bimestral, trimestral, semestral), sempre em semanas (cadaSemanas) para o
     EFClaudian continuar calculando as mesmas datas;
   - várias análises no mesmo projeto (analiseIds[]; analiseId = a primeira, para o EFClaudian); ao lançar, uma coleta por ponto e por análise. */
const PJ_TIPOS = [['bebedouro', 'Bebedouros'], ['caixa', 'Caixas d’água'], ['tratamento', 'Tratamento'], ['reservatorio', 'Açudes e reservatórios'], ['bacia', 'Bacias'], ['poco', 'Poços'], ['outro', 'Outros']];
const PJ_FREQ = [[1, 'Toda semana'], [2, 'Quinzenal (a cada 2 semanas)'], [3, 'A cada 3 semanas'], [4, 'Mensal (a cada 4 semanas)'], [6, 'A cada 6 semanas'], [8, 'Bimestral (a cada 8 semanas)'], [13, 'Trimestral (a cada 13 semanas)'], [26, 'Semestral (a cada 26 semanas)']];
const PJ_DIAS_UT = [1, 2, 3, 4, 5, 6];
const pjAnIds = p => (Array.isArray(p.analiseIds) && p.analiseIds.length ? p.analiseIds : (p.analiseId ? [p.analiseId] : []));
const pjAnsTxt = p => pjAnIds(p).map(id => ((S.analises || []).find(a => a.id === id) || {}).nome).filter(Boolean).join(', ') || 'sem análise';
const pjLab = p => { const an = (S.analises || []).find(a => a.id === pjAnIds(p)[0]); return p.lab || (an ? an.lab : '') || ''; };
const pjRealinha = p => !!p && (p.legado || (Number(p.porVez) || 0) > 0);
const pjIntervalo = p => p && p.legado ? agCfg().periodoDias : pjPasso(p);
const pjPontosTxt = p => { const l = (p.pontos || []).map(pjPonto).filter(Boolean); return l.length <= 6 ? l.map(x => x.cod).join(', ') : l.slice(0, 6).map(x => x.cod).join(', ') + ' e mais ' + (l.length - 6); };
Object.assign(S, { _pjAvisou: false, _pjMes: '' });

/* ---------- gravar no projeto ---------- */
async function pjGarantir(p) {
  if (!p || !p._virtual) return p;
  const o = Object.assign({}, p); delete o._virtual; delete o.id;
  o.criadoEm = nowISO(); o.criadoPor = S.user.id; o.criadoPorNome = S.user.nome;
  await Data.col('sv2_aguaproj').set('legado', o);
  const salvo = Object.assign({ id: 'legado' }, o); S.aguaproj = (S.aguaproj || []).filter(x => x.id !== 'legado').concat([salvo]); return salvo;
}
async function pjMarca(id, oc, campo, valor, resumo) {
  let p = pjDe(id); if (!p || !agPode()) return false;
  p = await pjGarantir(p);
  const m = Object.assign({}, p[campo] || {}); m[oc] = valor;
  await Data.col('sv2_aguaproj').update(p.id, { [campo]: m }); p[campo] = m;
  Audit.log({ acao: 'agua_projeto_' + campo, entidade: 'agua_projeto', entidadeId: p.id, resumo: p.nome + ' · ' + fmtD(oc) + ': ' + resumo });
  return true;
}

/* ======================= detalhe do projeto ======================= */
function pjAcoesHTML(p, x) {
  if (!agPode()) return ''; const hoje = hojeISO(), id = esc(p.id), oc = esc(x.oc);
  return '<div class="pj-ac">' + (x.sit === 'aguardando' ? '<button type="button" class="bt" data-act="pj-conf" data-id="' + id + '" data-oc="' + oc + '">' + ic('ok') + 'Confirmar</button>' : '') +
    '<button type="button" class="bt" data-act="pj-rem" data-id="' + id + '" data-oc="' + oc + '">' + ic('relogio') + 'Remarcar</button>' +
    '<button type="button" class="bt" data-act="pj-pul" data-id="' + id + '" data-oc="' + oc + '">' + ic('x') + 'Não vai ter</button>' +
    (x.data <= hoje || x.sit !== 'aguardando' ? '<button type="button" class="bt' + (x.data <= hoje ? ' pr' : '') + '" data-act="ag-nova" data-pid="' + id + '" data-oc="' + oc + '">' + ic('mais') + 'Lançar</button>' : '') + '</div>';
}
function pjObs(p, x) {
  const r = (p.remarcadas || {})[x.oc], pu = (p.puladas || {})[x.oc], cf = (p.confirmadas || {})[x.oc], lc = pjLancadas(p, x.oc);
  return [r ? 'era ' + fmtD(x.oc).slice(0, 5) + ' · ' + r.motivo + ' (' + r.porNome + ')' : '', cf && !r ? 'confirmada por ' + cf.porNome : '', pu ? pu.motivo + ' (' + pu.porNome + ')' : '', lc.length ? lc.length + ' coleta(s) lançada(s)' : '', pjAvisar(x) ? 'confirme até hoje' : ''].filter(Boolean).join(' · ');
}
const pjSitPill = x => { const s = PJ_SIT[x.sit]; return alPill(s[0], pjAvisar(x) ? 'wa' : s[1]); };
/* calendário do mês (OPÇÃO 2, aprovada em 12/11 02:55) */
function pjCal(p) {
  const hoje = hojeISO(), mes = S._pjMes || (pjProxima(p) || { data: hoje }).data.slice(0, 7), y = Number(mes.slice(0, 4)), m = Number(mes.slice(5, 7));
  const ini = mes + '-01', dIni = pjDow(ini), nd = new Date(y, m, 0).getDate(), fim = mes + '-' + pad(nd);
  const ocs = pjOcs(p, addDias(fim, 1)).map(oc => Object.assign({ oc: oc, sit: pjSit(p, oc) }, pjEfetiva(p, oc))).filter(x => x.data >= ini && x.data <= fim);
  const sel = S._pjSel && ocs.find(x => x.oc === S._pjSel) || ocs.find(x => ['lancada', 'pulada'].indexOf(x.sit) < 0) || ocs[0];
  let cel = PJ_DIAS3.map(t => '<i>' + t.charAt(0).toUpperCase() + '</i>').join('');
  for (let i = 0; i < dIni; i++) cel += '<span></span>';
  for (let d = 1; d <= nd; d++) {
    const iso = mes + '-' + pad(d), x = ocs.find(o => o.data === iso);
    cel += x ? '<button type="button" class="pj-dia ' + x.sit + (sel && sel.oc === x.oc ? ' on' : '') + (iso === hoje ? ' hj' : '') + '" data-act="pj-dia" data-id="' + esc(p.id) + '" data-oc="' + esc(x.oc) + '">' + d + '</button>' : '<span class="pj-dn' + (iso === hoje ? ' hj' : '') + '">' + d + '</span>';
  }
  const nomeMes = new Date(y, m - 1, 15).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return '<div class="pj-cal"><div class="pj-calh"><button type="button" class="bt ic-so" data-act="pj-mes" data-id="' + esc(p.id) + '" data-d="-1" aria-label="Mês anterior">' + ic('esq') + '</button><b>' + esc(nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)) + '</b><button type="button" class="bt ic-so" data-act="pj-mes" data-id="' + esc(p.id) + '" data-d="1" aria-label="Próximo mês">' + ic('dir') + '</button></div><div class="pj-grid">' + cel + '</div>' +
    '<div class="pj-leg"><span class="aguardando">a confirmar</span><span class="confirmada">confirmada</span><span class="atrasada">atrasada</span><span class="lancada">lançada</span><span class="pulada">não houve</span></div></div>' +
    (sel ? '<div class="pj-oc pj-sel ' + sel.sit + '"><span class="pj-ot"><b>' + esc(pjDataTxt(sel)) + '</b><small>' + esc(pjObs(p, sel) || pjOQue(p)) + '</small></span>' + pjSitPill(sel) + '</div>' + (['lancada', 'pulada'].indexOf(sel.sit) < 0 ? pjAcoesHTML(p, sel) : '') : '<p class="ag-dc">Nenhuma coleta neste mês.</p>');
}
function pjAbre(id) {
  gvAbrir(() => {
    const p = pjDe(id); if (!p) return null; const sup = isSup(S.user), lab = pjLab(p);
    const kv = [['Pontos', pjPontosTxt(p)], ['Como', Number(p.porVez) > 0 ? 'Rodízio: ' + p.porVez + ' por vez, os há mais tempo sem coleta' + (p.legado && p.mesclada !== false ? '; depois de uma rodada conforme, a mesclada' : '') : 'Todos os pontos a cada coleta'], ['Próxima', pjOQue(p)],
      ['Análises', pjAnsTxt(p) + (lab ? ' · ' + lab : '')], ['Quando', pjQuandoTxt(p) + (p._virtual ? '' : ' · desde ' + fmtD(p.inicio))]]
      .concat((p.realinhos || []).length ? [['Realinhado', (r => 'a partir de ' + fmtD(r.data) + ', a cada ' + r.passo + ' dias (' + r.porNome + ')')(p.realinhos[p.realinhos.length - 1])]] : []);
    const cab = sup && !p.legado ? '<button type="button" class="bt ic-so" data-act="pj-des" data-id="' + esc(p.id) + '" title="Desativar o projeto" aria-label="Desativar o projeto">' + ic('lixo') + '</button>' : '';
    const corpo = pjCal(p) + '<p class="gv-h">Projeto</p>' + gvCampos(kv) + '<p class="ag-dc">O aviso para confirmar sai no dia útil anterior, para o Líder ★ responsável pela água e os secundários com Coletas.</p>';
    return { ico: 'calendario', cabAcoes: cab, sub: 'Projeto de coleta de água' + (p.legado ? ' · rodízio com mesclada e recoleta' : ''), titulo: p.nome, corpo: corpo, rodape: sup ? '<button type="button" class="bt" data-act="pj-ed" data-id="' + esc(p.id) + '">' + ic('lapis') + 'Editar</button>' : '' };
  });
  render();
}

/* ======================= formulários ======================= */
LC_FORM.pjRem = f => { const p = pjDe(f.id); if (!p) return null; const ef = pjEfetiva(p, f.oc);
  if (f.manuais) return { ico: 'relogio', sub: p.nome + ' · nova data ' + fmtD(f.data), titulo: 'Já há coleta remarcada à mão mais à frente', corpo: lcMsg() + '<p class="ag-dc">Remarcada' + (f.manuais.length > 1 ? 's' : '') + ' à mão: <b>' + f.manuais.map(x => esc(pjDataTxt(x))).join(', ') + '</b>.</p>' +
      lcAv('"Mudar todas" recalcula todas as seguintes a cada ' + pjIntervalo(p) + ' dias. "Só as automáticas" deixa as remarcadas à mão onde estão.'), rodape: '<button type="button" class="bt" data-act="pj-rea" data-m="auto">Só as automáticas</button><button type="button" class="bt pr" data-act="pj-rea" data-m="todas">Mudar todas</button>' };
  return { ico: 'relogio', sub: p.nome + ' · era ' + pjDataTxt(Object.assign({}, ef, { data: f.oc })), titulo: 'Remarcar a coleta', corpo: lcMsg() +
    '<div class="fm-g">' + agBl('Nova data', lcData('data', f.data, true)) + agBl('Hora', lcIn('hora', f.hora, ' type="time"')) + '</div>' + agBl('Motivo', lcIn('motivo', f.motivo, ' placeholder="Ex.: laboratório sem coleta na terça"')) +
    '<p class="ag-dc">' + (pjRealinha(p) ? 'As seguintes passam a contar da nova data: uma a cada ' + pjIntervalo(p) + ' dias' + (p.legado ? ' (mesma sequência: rodízio → mesclada → rodízio, e as recoletas).' : '.') : 'Só esta data muda. As próximas seguem o dia padrão.') + '</p>', rodape: lcPe('pj-rem-ok', 'Remarcar') }; };
async function pjRemOk() {
  const f = S.fm, p = f && pjDe(f.id); if (!p || !agPode()) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.data || '') || f.data < hojeISO()) return lcErro('Escolha uma data de hoje em diante.');
  if (!f.hora) return lcErro('Informe a hora.');
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo.');
  if (pjRealinha(p)) {
    const manuais = pjPendentes(p, 24).filter(x => x.oc > f.oc && (p.remarcadas || {})[x.oc]);
    if (manuais.length) { f.manuais = manuais; f.msg = ''; gvDesenha(true); return; }
    return pjRealinharOk('todas');
  }
  if (!lcTravar()) return;
  try { await pjMarca(p.id, f.oc, 'remarcadas', { data: f.data, hora: f.hora, motivo: mot, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }, 'remarcada para ' + fmtD(f.data) + ' ' + f.hora + ' (' + mot + ')'); lcFim(); aviso('Coleta remarcada.'); }
  catch (e) { lcErro(svErro(e)); }
}
async function pjRealinharOk(modo) {
  const f = S.fm; if (!f) return; const mot = String(f.motivo || '').trim();
  if (!lcTravar()) return;
  try {
    await pjMarca(f.id, f.oc, 'remarcadas', { data: f.data, hora: f.hora, motivo: mot, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }, 'remarcada para ' + fmtD(f.data) + ' ' + f.hora + ' (' + mot + ')');
    const p = pjDe(f.id), passo = pjIntervalo(p), manuais = pjPendentes(p, 24).filter(x => x.oc > f.oc && (p.remarcadas || {})[x.oc]).map(x => x.oc);
    const fixas = modo === 'auto' ? Array.from(new Set((p.fixas || []).concat(manuais))) : (p.fixas || []).filter(x => x <= f.oc);
    const realinhos = (p.realinhos || []).concat([{ oc: f.oc, data: f.data, passo: passo, modo: modo, motivo: mot, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }]);
    await Data.col('sv2_aguaproj').update(p.id, { realinhos: realinhos, fixas: fixas }); p.realinhos = realinhos; p.fixas = fixas;
    Audit.log({ acao: 'agua_projeto_realinhar', entidade: 'agua_projeto', entidadeId: p.id, resumo: p.nome + ': a partir de ' + fmtD(f.data) + ', as seguintes a cada ' + passo + ' dias' + (modo === 'auto' ? ' (as remarcadas à mão ficaram no lugar)' : '') + ' — ' + mot });
    lcFim(); aviso('Coleta remarcada; as seguintes contam da nova data.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.pjPul = f => { const p = pjDe(f.id); if (!p) return null;
  return { ico: 'x', sub: p.nome + ' · ' + pjDataTxt(pjEfetiva(p, f.oc)), titulo: 'Não vai ter coleta nesta data', corpo: lcMsg() + '<p class="ag-dc">A data sai das pendências e fica registrada com o motivo. As próximas seguem normais.</p>' + agBl('Motivo', lcIn('motivo', f.motivo, ' placeholder="Ex.: feriado, laboratório fechado"')), rodape: lcPe('pj-pul-ok', 'Registrar') }; };
async function pjPulOk() {
  const f = S.fm; if (!f || !agPode()) return; const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  try { await pjMarca(f.id, f.oc, 'puladas', { motivo: mot, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }, 'não houve coleta (' + mot + ')'); lcFim(); aviso('Registrado.'); }
  catch (e) { lcErro(svErro(e)); }
}
LC_FORM.pjDes = f => { const p = pjDe(f.id); if (!p) return null;
  return { ico: 'lixo', sub: p.nome, titulo: 'Desativar o projeto', corpo: lcMsg() + lcAv('O projeto sai da aba Água e para de avisar. As coletas já lançadas continuam. Nada é apagado.', 'cr') + agBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('pj-des-ok', 'Desativar') }; };
async function pjDesOk() {
  const f = S.fm, p = f && (S.aguaproj || []).find(x => x.id === f.id); if (!p || !isSup(S.user)) return;
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  try { await Data.col('sv2_aguaproj').update(p.id, { ativo: false, motivoInativo: mot, desativadoEm: nowISO(), desativadoPor: S.user.nome }); Audit.log({ acao: 'desativar_agua_projeto', entidade: 'agua_projeto', entidadeId: p.id, resumo: 'Desativou o projeto de água ' + p.nome + ': ' + mot }); S.fm.volta = null; lcFim(); gvFechar(); aviso('Projeto desativado.'); }
  catch (e) { lcErro(svErro(e)); }
}

/* ---------- criar / editar (Líder ★ e Administrador) ---------- */
function pjEdEstado(id) {
  const p = id ? pjDe(id) : null, an = pjAnPadrao();
  let ini = hojeISO(); for (let i = 0; i < 7 && pjDow(ini) !== 2; i++) ini = addDias(ini, 1);
  const pts = {}; (p ? p.pontos || [] : []).forEach(r => { pts[r] = true; });
  const ans = {}; (p ? pjAnIds(p) : (an.id ? [an.id] : [])).forEach(a => { ans[a] = true; });
  return { k: 'pjEd', id: id || '', legado: !!(p && p.legado), nome: p ? p.nome : '', pontos: pts, grupo: '', modo: p && Number(p.porVez) > 0 ? 'rodizio' : 'todos', porVez: String(p && Number(p.porVez) > 0 ? Number(p.porVez) : 2),
    mesclada: p ? p.mesclada !== false : false, ans: ans, lab: p ? p.lab || '' : '', cada: String(p ? Number(p.cadaSemanas) || 1 : 1), dia: String(p ? Number(p.dia) : 2), hora: p ? p.hora || '08:00' : '08:00', inicio: p && !p._virtual ? p.inicio : ini, avisado: '' };
}
const pjEdPts = f => Object.keys(f.pontos).filter(r => f.pontos[r]);
const pjEdAns = f => Object.keys(f.ans).filter(a => f.ans[a] && (S.analises || []).some(x => x.id === a));
function pjEdResumo(f) {
  const ans = pjEdAns(f).map(id => (S.analises.find(a => a.id === id) || {}).nome).filter(Boolean);
  return (f.nome || 'Sem nome') + ' · ' + pjEdPts(f).length + ' ponto(s) · ' + (f.modo === 'rodizio' ? f.porVez + ' por vez' : 'todos') + ' · ' + pjQuandoTxt({ cadaSemanas: Number(f.cada), dia: Number(f.dia), hora: f.hora }) + ' · ' + (ans.join(', ') || 'sem análise');
}
LC_FORM.pjEd = f => {
  const pts = pjPontos(), ans = agDDAn(), grupos = PJ_TIPOS.map(t => ({ k: t[0], nome: t[1], l: pts.filter(p => p.tipo === t[0]) })).filter(g => g.l.length);
  if (f.grupo === '' && grupos.length) f.grupo = grupos[0].k;
  const grp = grupos.map(g => { const sel = g.l.filter(p => f.pontos[p.ref]), ab = f.grupo === g.k;
    return '<div class="pj-g' + (ab ? ' on' : '') + '"><button type="button" class="pj-gh" data-act="pj-grupo" data-id="' + g.k + '" aria-expanded="' + ab + '"><b>' + esc(g.nome) + '</b><span>' + (sel.length ? sel.length + ' de ' + g.l.length : g.l.length + ' ponto(s)') + '</span>' + ic(ab ? 'cima' : 'baixo') + '</button>' +
      (ab ? '<div class="fm-pkl co-pkl">' + g.l.map(p => agCk('pt', p.ref, !!f.pontos[p.ref], p.cod, p.local || '')).join('') + '</div>' : sel.length ? '<div class="pj-selc">' + sel.map(p => '<i>' + esc(p.cod) + '</i>').join('') + '</div>' : '') + '</div>'; }).join('');
  const soBeb = pjEdPts(f).every(r => r.indexOf('beb:') === 0);
  const anSel = ans.find(a => a.id === pjEdAns(f)[0]);
  return { ico: 'calendario', sub: 'Onde, o quê e quando coletar', titulo: f.id ? 'Editar projeto' : 'Novo projeto de coleta de água', corpo: lcMsg() +
    (f.avisado ? lcAv('<b>Mesmo ponto, análise e laboratório em outro projeto:</b> ' + esc(f.avisado) + '. Toque em Salvar de novo para manter assim.', 'wa') : '') +
    '<p class="gv-h">1 · Nome</p>' + agBl('Nome do projeto', lcIn('nome', f.nome, ' placeholder="Ex.: Canal — mensal"')) +
    '<p class="gv-h">2 · Pontos</p><p class="ag-dc">Toque no grupo para abrir. Pode misturar bebedouros, caixas e outros pontos.</p><div class="pj-gs">' + (grp || '<p class="ag-dc">Nenhum ponto de água ativo.</p>') + '</div>' +
    '<p class="gv-h">3 · Como coletar</p><div class="fm-g">' + agBl('Como', ddHTML('pj:modo', f.modo, [['todos', 'Todos os pontos a cada coleta'], ['rodizio', 'Rodízio']])) + (f.modo === 'rodizio' ? agBl('Pontos por vez', lcIn('porVez', f.porVez, ' inputmode="numeric"'), 'os há mais tempo sem coleta; um ponto novo entra primeiro') : '') + '</div>' +
      (f.legado && f.modo === 'rodizio' && soBeb ? '<label class="fm-ck"><input type="checkbox" data-fm="mesclada"' + (f.mesclada ? ' checked' : '') + '> Depois de uma rodada conforme, a próxima é a mesclada</label>' : '') +
    '<p class="gv-h">4 · Análises</p><p class="ag-dc">Pode marcar mais de uma: ao lançar, sai uma coleta por ponto e por análise.</p><div class="fm-pk"><div class="fm-pkl co-pkl">' + (ans.length ? ans.map(a => agCk('an', a.id, !!f.ans[a.id], a.nome, a.lab ? 'laboratório ' + a.lab : '')).join('') : '<p class="ag-dc">Cadastre uma análise de Água no EFClaudian.</p>') + '</div></div>' +
      '<div class="fm-g">' + agBl('Laboratório', ddHTML('pj:lab', f.lab || '', [['', 'O de cada análise' + (anSel && anSel.lab ? ' (' + anSel.lab + ')' : '')]].concat(coLabs().map(x => [x, x])))) + '</div>' +
    '<p class="gv-h">5 · Quando</p><div class="fm-g">' + agBl('Dia', ddHTML('pj:dia', f.dia, PJ_DIAS_UT.map(d => [String(d), PJ_DIAS[d].charAt(0).toUpperCase() + PJ_DIAS[d].slice(1)]))) + agBl('Repete', ddHTML('pj:cada', f.cada, PJ_FREQ.map(x => [String(x[0]), x[1]]))) + '</div>' +
      '<div class="fm-g">' + agBl('Hora', lcIn('hora', f.hora, ' type="time"')) + agBl('A partir de', lcData('inicio', f.inicio, true)) + '</div>' +
      '<p class="ag-dc">O aviso para confirmar sai no dia útil anterior (terça → segunda; segunda → sexta).</p>' +
    '<p class="gv-h">6 · Conferir</p><div class="pj-res">' + esc(pjEdResumo(f)) + '</div>',
    rodape: lcPe('pj-ed-ok', f.avisado ? 'Salvar mesmo assim' : 'Salvar') };
};
async function pjEdOk() {
  const f = S.fm; if (!f || !isSup(S.user)) return;
  const pts = pjEdPts(f), ans = pjEdAns(f), nome = String(f.nome || '').trim(), porVez = parseInt(f.porVez, 10) || 0;
  if (nome.length < 3) return lcErro('Dê um nome ao projeto.');
  if (!pts.length) return lcErro('Marque pelo menos um ponto.');
  if (!ans.length) return lcErro('Marque pelo menos uma análise.');
  if (f.modo === 'rodizio' && !(porVez >= 1 && porVez <= pts.length)) return lcErro('Pontos por vez: de 1 até ' + pts.length + '.');
  if (!f.hora) return lcErro('Informe a hora.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.inicio || '')) return lcErro('Informe a partir de quando.');
  const labDe = an => f.lab || (S.analises.find(a => a.id === an) || {}).lab || '';
  const iguais = pjProjetos().filter(p => p.id !== f.id).map(p => ({ p: p, c: (p.pontos || []).filter(r => pts.indexOf(r) >= 0 && pjAnIds(p).some(a => ans.indexOf(a) >= 0 && (p.lab || (S.analises.find(x => x.id === a) || {}).lab || '') === labDe(a))) })).filter(x => x.c.length);
  const txtIg = iguais.map(x => '"' + x.p.nome + '": ' + x.c.map(r => (pjPonto(r) || {}).cod || r).join(', ')).join(' · ');
  if (iguais.length && f.avisado !== txtIg) { f.avisado = txtIg; f.msg = ''; gvDesenha(true); return; }
  const o = { nome: nome, pontos: pts, porVez: f.modo === 'rodizio' ? porVez : 0, mesclada: f.legado ? !!f.mesclada : false, analiseId: ans[0], analiseIds: ans, lab: f.lab || '', cadaSemanas: Number(f.cada) || 1, dia: Number(f.dia), hora: f.hora, inicio: f.inicio, ativo: true };
  if (!lcTravar()) return;
  try {
    let id = f.id;
    if (id === 'legado' && !pjLegadoSalvo()) await Data.col('sv2_aguaproj').set('legado', Object.assign({ legado: true, confirmadas: {}, remarcadas: {}, puladas: {}, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome }, o));
    else if (id) await Data.col('sv2_aguaproj').update(id, o);
    else id = await Data.col('sv2_aguaproj').add(Object.assign({ confirmadas: {}, remarcadas: {}, puladas: {}, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome }, o));
    Audit.log({ acao: f.id ? 'alterar_agua_projeto' : 'criar_agua_projeto', entidade: 'agua_projeto', entidadeId: id, resumo: (f.id ? 'Alterou' : 'Criou') + ' o projeto de água ' + o.nome + ' (' + o.pontos.length + ' pontos, ' + pjQuandoTxt(o) + ')', depois: { pontos: o.pontos.map(r => (pjPonto(r) || {}).cod || r).join(', '), porVez: o.porVez, analises: pjAnsTxt(o), lab: o.lab, quando: pjQuandoTxt(o), inicio: o.inicio } });
    if (iguais.length) Notif.send({ nivel: 'aviso', titulo: 'Projetos de água com o mesmo ponto', texto: o.nome + ' e ' + txtIg + ' — mesma análise e laboratório. Confira se não vai coletar duas vezes.', para: Array.from(new Set(pjResp().concat([S.user.id]))), refTipo: 'agua_proj', refId: id + ':' });
    S.fm.volta = () => pjAbre(id); lcFim(); aviso('Projeto salvo.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---------- avisos: confirmar no dia útil anterior ---------- */
function pjResp() {
  const m = (S.cfgCol && S.cfgCol.resp) || {}, ok = id => { const u = userById(id); return u && !u.bloqueado && isSup(u); };
  const ids = Object.keys(m).filter(id => ok(id) && (m[id] === 'todas' || (Array.isArray(m[id]) && m[id].indexOf('AGUA') >= 0)));
  const est = ids.filter(id => !isPrincipal(userById(id)));
  return est.length ? est : ids.length ? ids : S.users.filter(u => isPrincipal(u) && !u.bloqueado).map(u => u.id);
}
const pjAvisarPara = () => Array.from(new Set(pjResp().concat(S.users.filter(u => !u.bloqueado && u.perfil === 'secundario' && !isSup(u) && temAtrib(u, 'coletas')).map(u => u.id))));
function pjAviso() {
  if (!S.user || S._pjAvisou) return 0; const para = pjAvisarPara(); if (para.indexOf(S.user.id) < 0) return 0; S._pjAvisou = true; let n = 0;
  pjProjetos().forEach(p => {
    const x = pjProxima(p); if (!pjAvisar(x)) return;
    const ref = p.id + ':' + x.oc; if ((S.notifs || []).some(nn => nn.refTipo === 'agua_proj' && nn.refId === ref)) return;
    Notif.send({ nivel: 'aviso', titulo: 'Confirmar coleta de água: ' + p.nome, texto: pjDataTxt(x) + ' · ' + pjOQue(p) + '. Confirme se a coleta vai acontecer ou remarque.', para: para, refTipo: 'agua_proj', refId: ref }); n++;
  });
  return n;
}
CS_CARGAS.push(() => { if (!coVe()) return; setTimeout(() => { try { if (S.agCarregado) pjAviso(); } catch (e) { console.error(e); } }, 3000); });

/* ======================= Coletas › Cadastros › Pontos de água ======================= */
function paTela(t) {
  const pode = isSup(S.user), l = (S.aguapontos || []).slice().sort((a, b) => (a.ativo === false) - (b.ativo === false) || agCmp(a.nome, b.nome));
  const nb = (S.bebs || []).filter(b => b.situacao === 'ativo').length, nc = (S.caixas || []).filter(c => !c.desativado).length;
  const h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: ['<span>' + l.filter(p => p.ativo !== false).length + ' pontos de água ativos</span>'], acoes: (pode ? '<button type="button" class="bt pr" data-act="pa-ed" data-id="">' + ic('mais') + 'Novo ponto de água</button>' : '') + '<a class="bt ic-so" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener" title="Talhões, análises, laboratórios e prazos: no EFClaudian" aria-label="Abrir o EFClaudian (talhões, análises, laboratórios e prazos)">' + ic('externo') + '</a>' });
  return h + '<section class="pn"><div class="pn-h"><b>Pontos de água</b><small>Bebedouros (' + nb + ') vêm de Inspeções › Cloro e caixas d’água (' + nc + ') de Documentos. Aqui ficam os outros pontos: tratamento, açudes, bacias, poços, canais.</small></div>' +
    (l.length ? l.map(p => '<button type="button" class="anp-li pa-li" data-act="' + (pode ? 'pa-ed' : 'pa-nada') + '" data-id="' + esc(p.id) + '"><span class="tx"><b>' + esc(p.nome) + '</b><small>' + esc([PJ_TIPO1[p.tipo] || 'Outro', p.local].filter(Boolean).join(' · ')) + '</small></span>' + (p.ativo === false ? alPill('Inativo') : '') + '</button>').join('') : '<div class="vazio">' + ic('lista') + '<b>Nenhum outro ponto cadastrado.</b><span>Cadastre canais, poços, açudes e o tratamento para usar nos projetos e na coleta avulsa.</span></div>') +
    '</section><p class="ag-dc">Talhões, análises, laboratórios e prazos continuam no EFClaudian por enquanto.</p>';
}
LC_FORM.paEd = f => { const p = f.id ? (S.aguapontos || []).find(x => x.id === f.id) : null;
  return { ico: 'frasco', sub: 'Entra nos projetos e na coleta avulsa', titulo: p ? 'Ponto de água' : 'Novo ponto de água', cabAcoes: '', corpo: lcMsg() +
    '<div class="fm-g">' + agBl('Tipo', ddHTML('pa:tipo', f.tipo, PJ_TIPOS.filter(t => t[0] !== 'bebedouro' && t[0] !== 'caixa').map(t => [t[0], PJ_TIPO1[t[0]]]))) + agBl('Nome', lcIn('nome', f.nome, ' placeholder="Ex.: Canal 01"')) + '</div>' +
    agBl('Local', lcIn('local', f.local, ' placeholder="Ex.: Fazenda Norte"')),
    rodape: (p ? '<button type="button" class="bt" data-act="pa-ativo" data-id="' + esc(p.id) + '">' + (p.ativo === false ? 'Reativar' : 'Desativar') + '</button>' : '') + lcPe('pa-ok', 'Salvar') }; };
async function paOk() {
  const f = S.fm; if (!f || !isSup(S.user)) return; const nome = String(f.nome || '').trim(), local = String(f.local || '').trim();
  if (nome.length < 2) return lcErro('Escreva o nome do ponto.');
  if ((S.aguapontos || []).some(p => p.id !== f.id && String(p.nome).toUpperCase() === nome.toUpperCase())) return lcErro('Já existe um ponto com esse nome.');
  const o = { nome: nome, local: local, tipo: f.tipo || 'outro' };
  if (!lcTravar()) return;
  try { let id = f.id; if (id) await Data.col('sv2_aguaponto').update(id, o); else id = await Data.col('sv2_aguaponto').add(Object.assign({ ativo: true, criadoEm: nowISO(), criadoPor: S.user.id }, o));
    Audit.log({ acao: 'ponto_agua', entidade: 'agua_ponto', entidadeId: id, resumo: 'Ponto de água ' + nome + ' (' + PJ_TIPO1[o.tipo] + ')' }); lcFim(); aviso('Ponto salvo.'); }
  catch (e) { lcErro(svErro(e)); }
}
async function paAtivo(id) {
  const p = (S.aguapontos || []).find(x => x.id === id); if (!p || !isSup(S.user)) return;
  try { await Data.col('sv2_aguaponto').update(id, { ativo: p.ativo === false }); Audit.log({ acao: 'ponto_agua', entidade: 'agua_ponto', entidadeId: id, resumo: (p.ativo === false ? 'Reativou' : 'Desativou') + ' o ponto de água ' + p.nome }); S.fm && (S.fm.sujo = false); lcFim(); aviso(p.ativo === false ? 'Ponto reativado.' : 'Ponto desativado.'); }
  catch (e) { lcErro(svErro(e)); }
}

/* ======================= eventos ======================= */
DD_AO.pj = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; f.msg = ''; f.avisado = ''; if (k === 'modo') f.modo = v; else if (k === 'lab') f.lab = v; else if (k === 'dia') f.dia = v; else if (k === 'cada') f.cada = v; gvDesenha(true); };
DD_AO.pa = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; f.msg = ''; if (k === 'tipo') f.tipo = v; gvDesenha(true); };
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="pj-"], [data-act^="pa-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), oc = t.getAttribute('data-oc'), f = S.fm;
  const vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'pj-abre') { if (ev.target.closest('[data-act="ag-nova"]')) return; S._pjMes = ''; S._pjSel = ''; pjAbre(id); }
  else if (a === 'pj-conf') { if (!agPode()) return; pjMarca(id, oc, 'confirmadas', { porId: S.user.id, porNome: S.user.nome, ts: nowISO() }, 'coleta confirmada').then(ok => { if (ok) { aviso('Coleta confirmada.'); gvDesenha(); render(); } }).catch(e => aviso(svErro(e), 'cr')); }
  else if (a === 'pj-rem') { if (!agPode()) return; const p = pjDe(id), ef = pjEfetiva(p, oc); lcAbrir({ k: 'pjRem', id: id, oc: oc, data: ef.data < hojeISO() ? hojeISO() : ef.data, hora: ef.hora || '08:00', motivo: '' }, volta); }
  else if (a === 'pj-rem-ok') pjRemOk();
  else if (a === 'pj-rea') pjRealinharOk(t.getAttribute('data-m'));
  else if (a === 'pj-pul') { if (!agPode()) return; lcAbrir({ k: 'pjPul', id: id, oc: oc, motivo: '' }, volta); }
  else if (a === 'pj-pul-ok') pjPulOk();
  else if (a === 'pj-des') { if (!isSup(S.user)) return; lcAbrir({ k: 'pjDes', id: id, motivo: '' }, volta); }
  else if (a === 'pj-des-ok') pjDesOk();
  else if (a === 'pj-ed' || a === 'pj-novo') { if (!isSup(S.user)) return; lcAbrir(pjEdEstado(a === 'pj-novo' ? '' : id), volta); }
  else if (a === 'pj-ed-ok') pjEdOk();
  else if (a === 'pj-grupo' && f) { f.grupo = f.grupo === id ? '-' : id; gvDesenha(true); }
  else if (a === 'pj-dia') { S._pjSel = oc; gvDesenha(); }
  else if (a === 'pj-mes') { const p = pjDe(id), base = S._pjMes || (pjProxima(p) || { data: hojeISO() }).data.slice(0, 7), d = new Date(Number(base.slice(0, 4)), Number(base.slice(5, 7)) - 1 + Number(t.getAttribute('data-d')), 15); S._pjMes = d.getFullYear() + '-' + pad(d.getMonth() + 1); S._pjSel = ''; gvDesenha(); }
  else if (a === 'pa-ed') { if (!isSup(S.user)) return; const p = id ? (S.aguapontos || []).find(x => x.id === id) : null; lcAbrir({ k: 'paEd', id: id || '', tipo: p ? p.tipo || 'outro' : 'tratamento', nome: p ? p.nome : '', local: p ? p.local || '' : '' }, null); }
  else if (a === 'pa-ok') paOk();
  else if (a === 'pa-ativo') paAtivo(id);
});
/* checkbox da mesclada no editor */
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && S.fm && S.fm.k === 'pjEd' && t.getAttribute('data-fm') === 'mesclada') { S.fm.mesclada = t.checked; } });
