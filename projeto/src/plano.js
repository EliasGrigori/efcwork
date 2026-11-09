/* ======================= EFCwork · plano.js — v0.4.6 / v0.4.7 =======================
   Página própria do plano de coleta (abre ao tocar no cartão em Coletas › Programação).
   Modelo escolhido em 07/11/2026 17:14: "Opção 2" da 2ª leva — grade alinhada de áreas (Faltam / Coletadas),
   chips com o código e o dia, barra de seleção flutuante, Programar e Lançar coletadas na gaveta.
   Sem Calendário e sem Histórico (decisão de 07/11 19:46).
   Regras do EFClaudian mantidas: área com programação pendente usa a programação (não duplica);
   área sem programação é coletada direto (amostras sem sv2_prog, progId vazio, auditoria coletado_plano);
   área já coletada no período é barrada (rzBarrar). Prefixo: pp. */

const ppPlano = id => (S.rodizios || []).find(r => r.id === id) || null;
/* período mostrado: o de hoje; se o plano ainda não começou ou já acabou, o mais próximo */
function ppPeriodo(r) {
  const h = hojeISO(), l = rzPeriodos(r).filter(p => rzVale(r, p)); if (!l.length) return null;
  return l.find(p => h >= p.ini && h <= p.fim) || l.filter(p => p.fim < h).pop() || l[0];
}
const ppProgDe = (r, p, area) => pgRzDe(r, p, area) || (S.prog || []).find(x => pgSit(x) === 'pendente' && pgOrigem(x) === 'Plano' && x.talhao === area && x.data && pgGera(x.tipo).indexOf(rzMat(r)) >= 0 && x.data <= p.fim && (x.prazo || x.data) >= addDias(p.ini, -31)) || null;
function ppAreas(r, p) {
  const rot = pgRotulos(r.areas || []);
  return (r.areas || []).slice().sort(cmpTxt).map(a => {
    const cs = rzColetasDe(r, p, a), pr = cs.length ? null : ppProgDe(r, p, a);
    const k = cs.length ? 'c' : pr ? (pgQuando(pr).k === 'atrasada' ? 'x' : 'p') : 'f';
    return { a: a, rot: rot[a], k: k, rec: k !== 'c' && !!rzLib(r, p, a), d: cs.length ? cs.map(c => c.data).sort().pop() : pr ? pr.data : '', pr: pr, cs: cs };
  });
}
const ppSel = rid => { if (!S._pp || S._pp.rid !== rid) S._pp = { rid: rid, sel: {} }; return S._pp.sel; };
const ppMarcadas = rid => Object.keys(ppSel(rid)).filter(k => ppSel(rid)[k]);
const ppAba = rid => (S._ppAba && S._ppAba[rid]) || 'areas';
const PP_TIT = { c: 'coletada', p: 'programada', x: 'programada e atrasada', f: 'falta' };

function ppTela(id) {
  const r = ppPlano(id);
  if (!r) return cabecalho({ caminho: ['Coletas', 'Programação', 'Plano'], titulo: 'Plano de coleta' }) + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Plano não encontrado.</b><span>Volte para a Programação e toque no cartão do plano.</span><a class="bt" href="#/coletas/programacao">Voltar para a Programação</a></div></section>';
  const p = ppPeriodo(r); const tit = (r.tipo || r.nome) + ' · ' + (RZ_FREQ[r.freq] || '') + ' · ' + r.ano;
  if (!p) return cabecalho({ caminho: ['Coletas', 'Programação', tit], titulo: tit }) + '<section class="pn"><div class="vazio">' + ic('relogio') + '<b>Este plano não tem período em aberto.</b></div></section>';
  const ar = ppAreas(r, p), c = ar.filter(x => x.k === 'c'), f = ar.filter(x => x.k !== 'c'), pc = ar.length ? Math.round(c.length / ar.length * 100) : 0;
  const fechado = r.fechados && r.fechados[p.k], sit = fechado ? ['Encerrado', ''] : c.length === ar.length && ar.length ? ['Concluído', 'ok'] : ['Em andamento', 'info'];
  const pode = coPode() && !fechado;
  /* marcadas que deixaram de faltar (alguém coletou) saem da seleção */
  const sel = ppSel(r.id); Object.keys(sel).forEach(k => { if (!f.some(x => x.a === k)) delete sel[k]; });
  const acoes = (pode ? '<button type="button" class="bt" data-act="pp-prog" data-id="' + esc(r.id) + '">' + ic('mais') + 'Programar</button>' : '') +
    '<button type="button" class="bt ic-so" data-act="pp-folha" data-id="' + esc(r.id) + '" title="Folha de campo (áreas que faltam)" aria-label="Imprimir a folha de campo">' + ic('impressora') + '</button>';
  const meta = [alPill(sit[0], sit[1]), '<span>' + esc((p.nome ? p.nome + ' · ' : '') + fmtD(p.ini).slice(0, 5) + ' a ' + fmtD(p.fim).slice(0, 5)) + '</span>'];
  const chip = x => { const on = !!sel[x.a], dica = x.a + ', ' + PP_TIT[x.k] + (x.d ? ' ' + fmtD(x.d) : '') + (x.pr && x.pr.coletor ? ', ' + x.pr.coletor : '');
    const dentro = (on ? '<i class="pp-ok">' + ic('ok') + '</i>' : '') + (x.rec ? '<i class="pp-rc" title="Recoleta liberada">' + ic('recontar') + '</i>' : '') + '<b>' + esc(x.rot) + '</b>' + (x.d ? '<small>' + fmtD(x.d).slice(0, 5) + '</small>' : '');
    return x.k === 'c' || !pode ? '<span class="pp-ar ' + x.k + '" title="' + esc(dica) + '">' + dentro + '</span>'
      : '<button type="button" class="pp-ar ' + x.k + (on ? ' sel' : '') + '" data-act="pp-ck" data-id="' + esc(x.a) + '" data-r="' + esc(r.id) + '" aria-pressed="' + on + '" title="' + esc(dica) + '">' + dentro + '</button>'; };
  const n = ppMarcadas(r.id).length, aba = ppAba(r.id);
  const abas = '<div class="pp-abas" role="tablist">' + [['areas', 'Áreas'], ['aj', 'Ajustes']].map(t => '<button type="button" role="tab" aria-selected="' + (aba === t[0]) + '" class="' + (aba === t[0] ? 'on' : '') + '" data-act="pp-aba" data-id="' + esc(r.id) + '" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
  return cabecalho({ caminho: ['Coletas', 'Programação', tit], titulo: tit, abaNome: 'Plano', aoLado: pgLegenda(), meta: meta, acoes: acoes }) +
    '<section class="pp">' +
    '<div class="pp-prog"><div class="pg-plb" role="img" aria-label="' + pc + '% coletado"><i style="width:' + pc + '%"></i></div><span><b>' + pc + '%</b> · ' + c.length + ' de ' + ar.length + ' ' + (ar.length === 1 ? 'área' : 'áreas') + ' coletada' + (c.length === 1 ? '' : 's') + '</span></div>' +
    abas + (aba === 'aj' ? ppAjustes(r, p, ar) : (fechado ? lcAv('Período encerrado: só consulta.', '') : '') +
    '<p class="pp-gh">Faltam (' + f.length + ')' + (pode && f.length ? '<button type="button" class="bt lk" data-act="pp-todas" data-id="' + esc(r.id) + '">' + (n === f.length ? 'Desmarcar todas' : 'Marcar todas') + '</button>' : '') + '</p>' +
    (f.length ? '<div class="pp-grade">' + f.map(chip).join('') + '</div>' : '<p class="pp-nada">Nenhuma área faltando neste período.</p>') +
    '<p class="pp-gh">Coletadas (' + c.length + ')</p>' + (c.length ? '<div class="pp-grade">' + c.map(chip).join('') + '</div>' : '<p class="pp-nada">Nenhuma coletada ainda.</p>')) +
    '</section>' +
    (n && pode && aba === 'areas' ? '<div class="pp-bar" role="region" aria-label="Áreas marcadas"><span>' + n + ' marcada' + (n > 1 ? 's' : '') + '</span><button type="button" class="bt" data-act="pp-prog" data-id="' + esc(r.id) + '">' + (ar.filter(x => x.k !== 'c' && sel[x.a]).every(x => x.k === 'p' || x.k === 'x') ? 'Reprogramar' : 'Programar') + '</button>' + (ar.some(x => (x.k === 'p' || x.k === 'x') && sel[x.a]) ? '<button type="button" class="bt" data-act="pp-desprog" data-id="' + esc(r.id) + '">' + ic('lixo') + 'Desprogramar ' + ar.filter(x => (x.k === 'p' || x.k === 'x') && sel[x.a]).length + '</button>' : '') + '<button type="button" class="bt pr" data-act="pp-lanc" data-id="' + esc(r.id) + '">' + ic('ok') + 'Lançar coletadas</button><button type="button" class="bt ic-so" data-act="pp-limpa" data-id="' + esc(r.id) + '" aria-label="Limpar a seleção" title="Limpar a seleção">' + ic('x') + '</button></div>' : '');
}

/* ---------- Programar (v0.4.7: grava em sv2_rodizio.progs, igual ao EFClaudian; antes ia para sv2_prog) ---------- */
function ppCtx(f) { const r = ppPlano(f.rid), p = r && ppPeriodo(r); return r && p ? { r: r, p: p, ar: ppAreas(r, p) } : null; }
LC_FORM.ppprog = f => {
  const x = ppCtx(f); if (!x) return { titulo: 'Programar', corpo: lcAv('Plano não encontrado.', 'cr'), rodape: '' };
  const livres = x.ar.filter(a => a.k !== 'c'), marc = livres.filter(a => f.sel[a.a]), re = marc.filter(a => a.pr).length;
  const pick = a => { const on = !!f.sel[a.a]; return '<button type="button" class="pp-ar ' + (a.pr ? a.k : 'f') + (on ? ' sel' : '') + '" data-act="pp-fck" data-id="' + esc(a.a) + '" aria-pressed="' + on + '" title="' + esc(a.a + (a.pr ? ', programada para ' + fmtD(a.d) : '')) + '">' + (on ? '<i class="pp-ok">' + ic('ok') + '</i>' : '') + '<b>' + esc(a.rot) + '</b>' + (a.pr && a.d ? '<small>' + fmtD(a.d).slice(0, 5) + '</small>' : '') + '</button>'; };
  return { ico: 'mais', sub: (x.r.tipo || '') + ' · ' + (RZ_FREQ[x.r.freq] || '') + ' · ' + x.r.ano, titulo: re && re === marc.length ? 'Reprogramar' : 'Programar', corpo: lcMsg() +
    '<p class="gv-h">1 · Áreas · ' + marc.length + ' marcada(s)</p>' +
    (livres.length ? '<div class="pp-grade pp-gv">' + livres.map(pick).join('') + '</div>' : '<p class="pp-nada">Todas as áreas já foram coletadas neste período.</p>') +
    (livres.some(a => a.pr) ? '<p class="pp-nada pp-ja">As que têm data já estão programadas: marque para mudar o dia, o prazo ou quem coleta.</p>' : '') +
    '<p class="gv-h">2 · Quando e quem</p><div class="fm-g">' + lcBl('Dia da coleta', lcData('data', f.data, true)) + lcBl('Prazo', lcData('prazo', f.prazo, true), 'opcional') + '</div>' +
    '<div class="fm-g">' + lcBl('Quem coleta', pgDdLivre('pgcol', f.col, pgEquipes().concat(S.users.map(u => u.nome))) + pgLivreIn(f, 'col', 'Ex.: Equipe A')) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')) + '</div>',
    rodape: lcPe('pp-prog-ok', marc.length ? (re && re === marc.length ? 'Reprogramar ' : 'Programar ') + marc.length + ' área(s)' : 'Programar') };
};
async function ppProgOk() {
  const f = S.fm, x = f && ppCtx(f); if (!x || !coPode()) return;
  const areas = x.ar.filter(a => a.k !== 'c' && f.sel[a.a]); if (!areas.length) return lcErro('Marque pelo menos uma área.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.data || '')) return lcErro('Informe o dia da coleta.');
  if (f.data < x.p.ini || f.data > x.p.fim) return lcErro('O dia tem que estar dentro do período do plano (' + fmtD(x.p.ini) + ' a ' + fmtD(x.p.fim) + ').');
  if (f.prazo && f.prazo < f.data) return lcErro('O prazo não pode ser antes do dia da coleta.');
  const coletor = pgLivreVal(f, 'col');
  { const bl = []; areas.forEach(a => pgGera(x.r.tipo).forEach(g => { const m = rzBarrar(g, a.a, f.data); if (m && bl.indexOf(m) < 0) bl.push(m); })); if (bl.length) return lcErro(bl.slice(0, 3).join(' ')); }
  if (!lcTravar()) return;
  /* v0.4.7: grava dentro do plano, como o EFClaudian (sv2_rodizio.progs[período][área]) */
  const pk = x.p.k, antes = {}, depois = {}, up = {};
  areas.forEach(a => { const g = { data: f.data, coletor: coletor, pontos: String(pgPontos(x.r.tipo, a.a) || ''), prof: '', estadio: '', por: S.user.nome, em: nowISO(), prazo: f.prazo || '', obs: String(f.obs || '').trim().toUpperCase() };
    if (x.r.progs && x.r.progs[pk] && x.r.progs[pk][a.a]) antes[a.a] = x.r.progs[pk][a.a]; depois[a.a] = g; up['progs.' + pk + '.' + a.a] = g; });
  const ops = []; areas.forEach(a => { if (a.pr && !a.pr._rz && a.pr.id) { antes[a.a] = antes[a.a] || { id: a.pr.id, data: a.pr.data, coletor: a.pr.coletor }; ops.push(Data.col('sv2_prog').update(a.pr.id, { situacao: 'cancelada', canceladaMotivo: 'Reprogramada no plano', canceladaEm: nowISO(), canceladaPor: S.user.nome })); } });
  try {
    await Data.col('sv2_rodizio').update(x.r.id, up); await Promise.all(ops);
    Audit.log({ acao: 'programar_plano', entidade: 'rodizio', entidadeId: x.r.id, resumo: (x.r.nome || x.r.tipo) + ' · ' + x.p.nome + ': ' + (Object.keys(antes).length ? 'reprogramou/programou ' : 'programou ') + areas.length + ' área(s) (' + areas.map(a => a.a).join(', ') + ')', antes: antes, depois: depois });
    const sel = ppSel(x.r.id); areas.forEach(a => { delete sel[a.a]; });
    lcFim(); aviso(areas.length + ' área(s) programada(s) para ' + fmtD(f.data) + '.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---------- Lançar coletadas (programação pendente = usa a programação; sem programação = coleta direta do plano) ---------- */
function ppAlvos(x, f) { return x.ar.filter(a => a.k !== 'c' && f.sel[a.a]).map(a => a.pr || { id: '', tipo: x.r.tipo, talhao: a.a, analiseIds: [], pontos: pgPontos(x.r.tipo, a.a), _direta: true }); }
const ppNovas = p => p._direta ? { ids: pgCdAnalises(p).ids, existem: [], avisos: [] } : pgCdNovas(p);
LC_FORM.pplanc = f => {
  const x = ppCtx(f); if (!x) return { titulo: 'Lançar coletadas', corpo: lcAv('Plano não encontrado.', 'cr'), rodape: '' };
  const ps = ppAlvos(x, f), prof = pgPedeProf(x.r.tipo), est = !pgSoComposto(x.r.tipo), cont = {}; let n = 0;
  ps.forEach(p => ppNovas(p).ids.forEach(aid => { const a = pgAnalises().find(y => y.id === aid); if (a) { cont[a.tipo] = (cont[a.tipo] || 0) + 1; n++; } }));
  return { ico: 'ok', sub: (x.r.tipo || '') + ' · ' + (RZ_FREQ[x.r.freq] || '') + ' · ' + x.r.ano, titulo: 'Lançar coletadas', corpo: lcMsg() +
    '<p class="gv-h">1 · Áreas · ' + ps.length + '</p><div class="pp-grade pp-gv">' + ps.map(p => { const a = x.ar.find(y => y.a === p.talhao); return '<span class="pp-ar ' + a.k + '"><b>' + esc(a.rot) + '</b>' + (a.d ? '<small>' + fmtD(a.d).slice(0, 5) + '</small>' : '') + '</span>'; }).join('') + '</div>' +
    '<div class="pg-res"><span><b>Vai gravar ' + n + ' amostra(s)</b>' + (n ? ': ' + Object.keys(cont).map(k => esc(CO_TXT[k] || k) + ' ' + cont[k]).join(', ') : '') + '</span></div>' +
    '<p class="gv-h">2 · Quando e quem</p><div class="fm-g">' + lcBl('Data da coleta', lcData('data', f.data), 'pode ser de dias atrás') + lcBl('Coletores', pgDdLivre('pgcol', f.col, pgEquipes().concat(S.users.map(u => u.nome))) + pgLivreIn(f, 'col', 'Ex.: Equipe A')) + '</div>' +
    (prof || est ? '<p class="gv-h">3 · Campo</p><div class="fm-g">' + (prof ? lcBl('Profundidade', pgDdLivre('pgprof', f.prof, pgProfsDo(x.r.tipo).concat(pgProfsTodas()).concat(['N/A']), 'Outra (digitar)') + pgLivreIn(f, 'prof', 'Ex.: 40-60'), 'solo e raiz') : '') + (est ? lcBl('Estádio', pgDdLivre('pgest', f.est, PG_ESTADIOS) + pgLivreIn(f, 'est', 'Ex.: PÓS-COLHEITA')) : '') + '</div>' : '') +
    lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: lcPe('pp-lanc-ok', 'Lançar ' + ps.length + ' coletada(s)') };
};
async function ppLancOk() {
  const f = S.fm, x = f && ppCtx(f); if (!x || !coPode()) return;
  const ps = ppAlvos(x, f); if (!ps.length) return lcErro('Marque pelo menos uma área.');
  const d = { data: f.data, coletor: pgLivreVal(f, 'col'), prof: pgLivreVal(f, 'prof'), estadio: pgLivreVal(f, 'est'), obs: String(f.obs || '').trim() };
  const er = pgValidaData(d.data); if (er) return lcErro(er);
  if (d.data < x.p.ini) return lcErro('A data é antes do começo do período do plano (' + fmtD(x.p.ini) + ').');
  const semAn = ps.filter(p => !pgCdAnalises(p).ids.length); if (semAn.length) return lcErro('Sem análise cadastrada para ' + x.r.tipo + '. Cadastre a análise no EFClaudian (Coletas › Cadastros). Nada foi gravado.');
  if (pgPedeProf(x.r.tipo) && !d.prof && ps.some(p => !p.prof)) return lcErro('Informe a profundidade (solo e raiz).');
  { const bl = []; ps.forEach(p => pgGera(p.tipo).forEach(g => { const m = rzBarrar(g, p.talhao, d.data); if (m && bl.indexOf(m) < 0) bl.push(m); })); if (bl.length) return lcErro(bl.slice(0, 3).join(' ')); }
  if (!lcTravar()) return;
  const ops = [], logs = []; let n = 0;
  try {
    for (const p of ps) {
      const ca = ppNovas(p), lote = ca.ids.length > 1 ? pgLoteId() : '', pontos = p.pontos || pgPontos(p.tipo, p.talhao);
      const prof = d.prof || p.prof || '', coletor = d.coletor || p.coletor || '', estadio = d.estadio || p.estadio || ''; let k = 0;
      for (const aid of ca.ids) {
        const an = pgAnalises().find(a => a.id === aid); if (!an) continue;
        ops.push({ col: 'sv2_coletas', tipo: 'set', id: pgColIdLivre(pgColId(p, aid, d.data), ops), dados: pgNovaColeta(an.tipo, { data: d.data, talhao: p.talhao, pontos: pontos, analiseId: aid, coletor: coletor, prof: an.tipo === 'SOLO' || an.tipo === 'NEMATOIDE' ? prof : 'N/A', estadio: estadio, obs: [p.obs, d.obs].filter(Boolean).join(', '), progId: p._rz ? '' : (p.id || ''), loteId: lote }) });
        k++;
      }
      if (!k) continue;
      if (p.id && !p._rz) ops.push({ col: 'sv2_prog', tipo: 'update', id: p.id, dados: { coletadaEm: d.data, coletadaPor: S.user.nome, coletadaReg: nowISO(), coletor: coletor, prof: prof, estadio: estadio } });
      const kk = k, dir = !p.id || !!p._rz;
      logs.push(() => Audit.log({ acao: dir ? 'coletado_plano' : 'coletado_programacao', entidade: dir ? 'coleta' : 'programacao', entidadeId: p.id || p.talhao, resumo: 'Coletado' + (dir ? ' (plano ' + (x.r.nome || x.r.tipo) + ')' : '') + ': ' + p.tipo + ' ' + p.talhao + ' em ' + fmtD(d.data) + (coletor ? ' por ' + coletor : '') + ' — ' + kk + ' amostra(s)', depois: { data: d.data, coletor: coletor, prof: prof, estadio: estadio, amostras: kk, plano: x.r.id } }));
      n += k;
    }
    if (!ops.length) return lcErro('Nada novo para gravar.');
    for (let i = 0; i < ops.length; i += 450) await Data.lote(ops.slice(i, i + 450));
    logs.forEach(y => { try { y(); } catch (e) {} });
    const sel = ppSel(x.r.id); ps.forEach(p => { delete sel[p.talhao]; });
    lcFim(); aviso(ps.length + ' área(s) coletada(s) · ' + n + ' amostra(s) em Amostras.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---------- folha de campo do plano (áreas que faltam; data, coletor, profundidade e estádio em branco; A4 deitado) ---------- */
function ppFolha(id) {
  const r = ppPlano(id), p = r && ppPeriodo(r); if (!p) return; const e0 = S.empresa || {}, ar = ppAreas(r, p).filter(a => a.k !== 'c');
  let el = $('#tb-imp'); if (!el) { el = document.createElement('div'); el.id = 'tb-imp'; document.body.appendChild(el); }
  el.innerHTML = '<div class="imp-cab"><b>Folha de campo · ' + esc(r.tipo + ' · ' + (RZ_FREQ[r.freq] || '') + ' · ' + r.ano) + '</b><span>' + esc(e0.nome || '') + ' · ' + fmtD(p.ini) + ' a ' + fmtD(p.fim) + ' · ' + ar.length + ' área(s) que faltam</span></div>' +
    '<table><thead><tr><th>#</th><th>Área</th><th>Local</th><th>Pontos</th><th>Programada</th><th>Data</th><th>Coletor</th><th>Profundidade</th><th>Estádio</th><th>Observação</th></tr></thead><tbody>' +
    ar.map((a, i) => { const t = pgTalhao(a.a); return '<tr><td>' + (i + 1) + '</td><td>' + esc(a.a) + '</td><td>' + esc(t ? [t.cultura, t.pivo].filter(Boolean).join(', ') : '') + '</td><td class="n">' + esc(String(pgPontos(r.tipo, a.a) || '')) + '</td><td>' + (a.pr ? fmtD(a.pr.data).slice(0, 5) + (a.pr.coletor ? ', ' + esc(a.pr.coletor) : '') : '') + '</td><td></td><td></td><td></td><td></td><td></td></tr>'; }).join('') +
    '</tbody></table><div class="imp-pe">' + APP_APELIDO + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'plano_coleta', entidadeId: id, resumo: 'Folha de campo do plano ' + (r.nome || r.tipo) + ' (' + ar.length + ' áreas)' });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ======================= v0.4.7 · aba Ajustes =======================
   Modelo aprovado em 08/11/2026 11:00: aba "Ajustes" (Opção 4) com blocos separados, cada um com o seu botão —
   Plano (análises) · Áreas (caixinhas) · Período (encerrar) · Recoletas. "Renovar" não tem botão: a partir de 1º/12 o sino sugere.
   Grava no formato do EFClaudian: alterar_rodizio; encerrar_rodizio (fechados[período] = {ts, por, porNome, snap, motivos});
   recoleta_rodizio (liberadas[período][área] = {motivo, por, ts, aprovadoPor}). Encerrar com programação aberta pede para cancelar todas. */
const ppSup = () => !!S.user && isSup(S.user);
const PP_MOT = ['Erro de envio', 'Solicitação errada', 'Amostra perdida ou danificada', 'Laudo com resultado estranho', 'Coleta feita no lugar errado'];
function ppEd(r) { if (!S._ppEd || S._ppEd.rid !== r.id) S._ppEd = { rid: r.id, ans: (r.analiseIds || []).slice(), areas: (r.areas || []).slice() }; return S._ppEd; }
const ppIgual = (a, b) => a.slice().sort().join('|') === (b || []).slice().sort().join('|');
const ppRet = r => ({ tipo: r.tipo, freq: r.freq, ano: r.ano, prazo: r.prazo || '', analiseIds: (r.analiseIds || []).slice(), areas: (r.areas || []).slice() });
const ppRecRef = (rid, pk, a) => rid + ':' + pk + ':' + a;
const ppRecPend = (rid, pk) => (S.aprov || []).filter(y => y.status === 'pendente' && y.tipo === 'recoleta_plano' && String(y.refId || '').indexOf(rid + ':' + pk + ':') === 0);

function ppAjustes(r, p, ar) {
  const sup = ppSup(), fch = r.fechados && r.fechados[p.k], ro = !sup || !!fch, e = ppEd(r), mats = pgGera(r.tipo), cad = (txt, mini, corpo) => '<div class="pn pp-bl"><h3>' + txt + (mini ? ' <small>' + mini + '</small>' : '') + '</h3>' + corpo + '</div>';
  /* Plano */
  const ans = pgAnalises().filter(a => mats.indexOf(a.tipo) >= 0 && (a.ativo !== false || e.ans.indexOf(a.id) >= 0));
  const plano = cad('Plano', '', '<div class="pp-kv"><span>Tipo<b>' + esc(r.tipo || '') + '</b></span><span>Frequência<b>' + esc(RZ_FREQ[r.freq] || r.freq || '') + '</b></span><span>Ano<b>' + esc(String(r.ano || '')) + '</b></span></div>' +
    '<p class="pp-gh">Análises</p><div class="pp-lis">' + (ans.length ? ans.map(a => '<label class="pp-li"><input type="checkbox" data-pp-an="' + esc(a.id) + '"' + (e.ans.indexOf(a.id) >= 0 ? ' checked' : '') + (ro ? ' disabled' : '') + '><b>' + esc(a.nome) + '</b><span>' + esc((CO_TXT[a.tipo] || a.tipo) + (a.lab ? ' · ' + a.lab : '')) + '</span></label>').join('') : '<p class="pp-nada">Nenhuma análise cadastrada para ' + esc(r.tipo) + '.</p>') + '</div>' +
    '<p class="pp-nota">Tipo e frequência mudam os períodos do plano: por enquanto, só no EFClaudian.</p>' +
    (sup && !fch ? '<div class="pp-pe"><button type="button" class="bt pr" data-act="pp-an-ok" data-id="' + esc(r.id) + '"' + (ppIgual(e.ans, r.analiseIds) ? ' disabled' : '') + '>Salvar análises</button></div>' : ''));
  /* Áreas */
  const est = {}; ar.forEach(x => { est[x.a] = x; });
  const todos = Array.from(new Set(pgTalhoes().filter(t => t.ativo !== false).map(t => t.codigo).concat(r.areas || []).concat(e.areas))).filter(Boolean).sort(cmpTxt);
  const linha = c => { const x = est[c], on = e.areas.indexOf(c) >= 0, trv = !!(x && x.k === 'c'), t = pgTalhao(c), noPl = (r.areas || []).indexOf(c) >= 0, loc = t ? [t.cultura, t.pivo].filter(Boolean).join(', ') : '';
    const info = trv ? 'coletada neste período, não sai' : x && x.pr ? (on ? 'programada · se tirar, a programação é cancelada' : 'sai do plano · a programação é cancelada') : noPl ? (on ? 'no plano' : 'sai do plano') : on ? 'entra no plano' : loc;
    return '<label class="pp-li' + (trv ? ' trv' : '') + (on !== noPl ? ' mud' : '') + '" data-q="' + esc((c + ' ' + loc).toUpperCase()) + '"><input type="checkbox" data-pp-ar="' + esc(c) + '"' + (on ? ' checked' : '') + (trv || ro ? ' disabled' : '') + '><b>' + esc(c) + '</b><span>' + esc(info) + '</span></label>'; };
  const areas = cad('Áreas', e.areas.length + ' no plano', '<label class="pp-bsc">' + ic('lupa') + '<input data-pp-busca="1" placeholder="Buscar área" autocomplete="off" aria-label="Buscar área"></label>' +
    '<div class="pp-lis pp-lim">' + todos.map(linha).join('') + '</div>' +
    (sup && !fch ? '<div class="pp-pe"><button type="button" class="bt pr" data-act="pp-ar-ok" data-id="' + esc(r.id) + '"' + (ppIgual(e.areas, r.areas) ? ' disabled' : '') + '>Salvar áreas</button></div>' : ''));
  /* Período */
  const n = k => ar.filter(x => x.k === k).length, at = n('x');
  const per = cad('Período', esc(p.nome + ' · ' + fmtD(p.ini).slice(0, 5) + ' a ' + fmtD(p.fim).slice(0, 5)),
    '<div class="pp-nums"><span><b>' + n('c') + '</b>coletadas</span><span><b>' + n('p') + '</b>programadas</span><span' + (at ? ' class="cr"' : '') + '><b>' + at + '</b>atrasadas</span><span><b>' + n('f') + '</b>sem programação</span></div>' +
    (fch ? lcAv('Encerrado em ' + esc(fmtDT(fch.ts)) + (fch.porNome ? ' por ' + esc(fch.porNome) : '') + '.', '')
      : sup ? '<p class="pp-nota">Ao encerrar, o app guarda o retrato do período: o que foi e o que não foi coletado, com o motivo de cada área que faltou. Depois disso, ninguém lança mais coleta deste período neste plano.</p><div class="pp-pe"><button type="button" class="bt" data-act="pp-enc" data-id="' + esc(r.id) + '">' + ic('cadeado') + 'Encerrar período</button></div>'
      : '<p class="pp-nota">Encerrar o período: Líder ★ ou Administrador.</p>'));
  /* Recoletas */
  const lib = (r.liberadas && r.liberadas[p.k]) || {}, libs = Object.keys(lib).sort((a, b) => String(lib[b].ts || '').localeCompare(String(lib[a].ts || ''))), pend = ppRecPend(r.id, p.k);
  const cols = ar.filter(x => x.k === 'c' && !pend.some(y => y.refId === ppRecRef(r.id, p.k, x.a)));
  const linhas = pend.map(y => { const a = String(y.refId).split(':').pop(); return '<tr><td>' + esc(a) + '</td><td class="l">' + esc(String(y.descricao || '').split(' — ').slice(1).join(' — ')) + '</td><td>' + esc(y.solicitanteNome || '') + '<small>aguardando confirmação</small></td><td>' + esc(fmtD(String(y.ts).slice(0, 10)).slice(0, 5)) + '</td></tr>'; })
    .concat(libs.map(a => { const l = lib[a] || {}; return '<tr><td>' + esc(a) + '</td><td class="l">' + esc(l.motivo || '') + '</td><td>' + esc(l.por || '') + (l.aprovadoPor ? '<small>confirmado por ' + esc(l.aprovadoPor) + '</small>' : '') + '</td><td>' + (l.ts ? esc(fmtD(String(l.ts).slice(0, 10)).slice(0, 5)) : '') + '</td></tr>'; }));
  const rec = cad('Recoletas', esc(p.nome),
    (coPode() && !fch ? (cols.length ? lcBl('Liberar recoleta de', ddHTML('pp:rec:' + r.id, '', [['', 'Escolha a área coletada']].concat(cols.map(x => [x.a, x.a + ' · coletada ' + fmtD(x.d).slice(0, 5)])))) : '<p class="pp-nada">Nenhuma área coletada para liberar.</p>') + (sup ? '' : '<p class="pp-nota">O pedido vai para o Líder ★ ou o Administrador confirmar.</p>') : '') +
    (linhas.length ? '<div class="pp-tbw"><table class="pp-tb"><thead><tr><th>Área</th><th class="l">Motivo</th><th>Quem</th><th>Quando</th></tr></thead><tbody>' + linhas.join('') + '</tbody></table></div>' : '<p class="pp-nada">Nenhuma recoleta neste período.</p>'));
  return '<div class="pp-aj">' + plano + areas + per + rec + '</div>';
}

async function ppSalvaAns(rid) {
  const r = ppPlano(rid), e = S._ppEd; if (!r || !e || e.rid !== rid || !ppSup()) return;
  if (!e.ans.length) { aviso('Deixe pelo menos uma análise.', 'erro'); return; }
  const antes = ppRet(r), nomes = e.ans.map(id => (pgAnalises().find(a => a.id === id) || {}).nome || id);
  try { await Data.col('sv2_rodizio').update(r.id, { analiseIds: e.ans.slice() });
    Audit.log({ acao: 'alterar_rodizio', entidade: 'rodizio', entidadeId: r.id, resumo: 'Alterou o plano de coleta ' + (r.nome || r.tipo) + ' (análises: ' + nomes.join(', ') + ')', antes: antes, depois: Object.assign({}, antes, { analiseIds: e.ans.slice() }) });
    aviso('Análises salvas.'); } catch (x) { aviso(svErro(x), 'erro'); }
}
function ppSalvaAr(rid) {
  const r = ppPlano(rid), e = S._ppEd; if (!r || !e || e.rid !== rid || !ppSup()) return;
  const p = ppPeriodo(r), ar = p ? ppAreas(r, p) : [], tira = (r.areas || []).filter(a => e.areas.indexOf(a) < 0), poe = e.areas.filter(a => (r.areas || []).indexOf(a) < 0);
  if (!e.areas.length) { aviso('O plano precisa de pelo menos uma área.', 'erro'); return; }
  if (ar.some(x => x.k === 'c' && tira.indexOf(x.a) >= 0)) { aviso('Área coletada neste período não sai do plano.', 'erro'); return; }
  const comPr = ar.filter(x => x.pr && tira.indexOf(x.a) >= 0);
  const vai = async () => {
    const novas = e.areas.slice().sort(cmpTxt), up = { areas: novas }, ops = [], antes = ppRet(r);
    if (p && comPr.some(x => x.pr._rz)) { const g = Object.assign({}, (r.progs && r.progs[p.k]) || {}); comPr.forEach(x => { delete g[x.a]; }); up['progs.' + p.k] = g; }
    comPr.forEach(x => { if (!x.pr._rz && x.pr.id) ops.push(Data.col('sv2_prog').update(x.pr.id, { situacao: 'cancelada', canceladaMotivo: 'Área tirada do plano', canceladaEm: nowISO(), canceladaPor: S.user.nome })); });
    try { await Data.col('sv2_rodizio').update(r.id, up); await Promise.all(ops);
      Audit.log({ acao: 'alterar_rodizio', entidade: 'rodizio', entidadeId: r.id, resumo: 'Alterou o plano de coleta ' + (r.nome || r.tipo) + ' (' + novas.length + ' áreas' + (poe.length ? '; entrou: ' + poe.join(', ') : '') + (tira.length ? '; saiu: ' + tira.join(', ') : '') + (comPr.length ? '; ' + comPr.length + ' programação(ões) cancelada(s)' : '') + ')', antes: antes, depois: Object.assign({}, antes, { areas: novas }) });
      aviso('Áreas salvas.'); } catch (x) { aviso(svErro(x), 'erro'); }
  };
  if (tira.length) csConfirma({ titulo: 'Tirar ' + tira.length + ' área(s) do plano?', texto: tira.join(', ') + '.' + (comPr.length ? ' ' + comPr.length + ' tem programação neste período, que será cancelada.' : '') + ' As coletas antigas dessas áreas continuam no histórico.', sim: 'Tirar do plano', nao: 'Voltar' }, vai);
  else vai();
}

/* ---------- Encerrar período ---------- */
LC_FORM.ppenc = f => {
  const x = ppCtx(f); if (!x) return { titulo: 'Encerrar período', corpo: lcAv('Plano não encontrado.', 'cr'), rodape: '' };
  const falta = x.ar.filter(a => a.k !== 'c'), ab = falta.filter(a => a.pr), n = k => x.ar.filter(a => a.k === k).length;
  return { ico: 'cadeado', sub: (x.r.nome || x.r.tipo) + ' · ' + fmtD(x.p.ini).slice(0, 5) + ' a ' + fmtD(x.p.fim).slice(0, 5), titulo: 'Encerrar ' + x.p.nome, corpo: lcMsg() +
    '<div class="pp-nums"><span><b>' + n('c') + '</b>coletadas</span><span><b>' + ab.length + '</b>programadas abertas</span><span><b>' + n('f') + '</b>sem programação</span></div>' +
    (falta.length ? '<p class="gv-h">Por que cada área ficou sem coleta?</p>' + falta.map(a => lcBl(a.a + (a.pr ? ' · programada' + (a.d ? ' ' + fmtD(a.d).slice(0, 5) : '') : ''), lcIn('m_' + a.a, f['m_' + a.a] || '', ' placeholder="motivo"'))).join('') : lcAv('Todas as áreas foram coletadas neste período.', '')) +
    (ab.length ? lcAv((ab.length === 1 ? '1 programação ainda aberta' : ab.length + ' programações ainda abertas') + '. Ao encerrar, o app pede para cancelar.', '') : '') +
    lcBl('Observação', lcIn('obs', f.obs || '', ' placeholder="opcional"')),
    rodape: lcPe('pp-enc-ok', 'Encerrar período') };
};
function ppEncOk() {
  const f = S.fm, x = f && ppCtx(f); if (!x || !ppSup()) return;
  if (x.r.fechados && x.r.fechados[x.p.k]) return lcErro('Este período já foi encerrado.');
  const falta = x.ar.filter(a => a.k !== 'c'), sem = falta.filter(a => String(f['m_' + a.a] || '').trim().length < 3);
  if (sem.length) return lcErro('Escreva o motivo de ' + sem.slice(0, 4).map(a => a.a).join(', ') + (sem.length > 4 ? ' e mais ' + (sem.length - 4) : '') + '.');
  const ab = falta.filter(a => a.pr), at = ab.filter(a => a.k === 'x').length;
  const vai = async () => {
    if (!lcTravar()) return;
    const pk = x.p.k, mot = {}; falta.forEach(a => { mot[a.a] = String(f['m_' + a.a]).trim().toUpperCase(); });
    const snap = x.ar.map(a => ({ area: a.a, st: a.k === 'c' ? 'coletada' : 'falta', data: a.k === 'c' ? a.d : '', pgId: a.pr && !a.pr._rz ? a.pr.id : '' }));
    const up = {}; up['fechados.' + pk] = { ts: nowISO(), por: S.user.id, porNome: S.user.nome, snap: snap, motivos: mot, obs: String(f.obs || '').trim() };
    const ops = [Data.col('sv2_rodizio').update(x.r.id, up)];
    ab.forEach(a => { if (!a.pr._rz && a.pr.id) ops.push(Data.col('sv2_prog').update(a.pr.id, { situacao: 'cancelada', canceladaMotivo: 'Período encerrado', canceladaEm: nowISO(), canceladaPor: S.user.nome })); });
    try {
      await Promise.all(ops);
      const pc = x.ar.length ? Math.round((x.ar.length - falta.length) / x.ar.length * 100) : 0;
      Audit.log({ acao: 'encerrar_rodizio', entidade: 'rodizio', entidadeId: x.r.id, resumo: 'Encerrou o ' + x.p.nome + ' do plano de coleta ' + (x.r.nome || x.r.tipo) + ': ' + pc + '% coletado' + (falta.length ? ' · sem coleta: ' + falta.map(a => a.a + ' (' + mot[a.a] + ')').join('; ') : '') + (ab.length ? ' · ' + ab.length + ' programação(ões) cancelada(s)' : '') });
      lcFim(); aviso(x.p.nome + ' encerrado.');
    } catch (e) { lcErro(svErro(e)); }
  };
  if (ab.length) csConfirma({ titulo: ab.length === 1 ? 'Cancelar a programação aberta?' : 'Cancelar as ' + ab.length + ' programações abertas?', texto: [at ? at + (at === 1 ? ' atrasada' : ' atrasadas') : '', ab.length - at ? (ab.length - at) + ' no prazo' : ''].filter(Boolean).join(' e ') + ': ' + ab.map(a => a.a).join(', ') + '. Para encerrar o período, ' + (ab.length === 1 ? 'ela é cancelada' : 'todas são canceladas') + ' com o motivo "período encerrado".', sim: 'Cancelar todas e encerrar', nao: 'Voltar' }, vai);
  else vai();
}

/* ---------- Recoleta ---------- */
LC_FORM.pprec = f => {
  const x = ppCtx(f); if (!x) return { titulo: 'Liberar recoleta', corpo: lcAv('Plano não encontrado.', 'cr'), rodape: '' };
  const sup = ppSup(), cols = x.ar.filter(a => a.k === 'c'), a = cols.find(y => y.a === f.area), outro = f.mot === '__outro';
  return { ico: 'volta', sub: (x.r.nome || x.r.tipo) + ' · ' + x.p.nome, titulo: sup ? 'Liberar recoleta' : 'Pedir recoleta', corpo: lcMsg() +
    lcBl('Área', ddHTML('lc:pparea', f.area || '', [['', 'Escolha a área coletada']].concat(cols.map(y => [y.a, y.a + ' · coletada ' + fmtD(y.d).slice(0, 5)])))) +
    (a ? (cs => '<div class="pg-res"><span>Coletada em ' + esc(fmtD(a.d)) + ' · ' + cs.length + ' amostra(s)</span><small>' + esc(cs.map(c => (CO_TXT[c.tipo] || c.tipo) + (c.os ? ', O.S ' + c.os : c.enviado ? ', enviada' : '')).join(' · ')) + '</small></div>')(S.coletas.filter(c => c.situacao !== 'cancelada' && c.talhao === a.a && pgGera(x.r.tipo).indexOf(c.tipo) >= 0 && c.data >= x.p.ini && c.data <= x.p.fim)) : '') +
    lcBl('Motivo', ddHTML('lc:ppmot', f.mot || '', [['', 'Escolha o motivo']].concat(PP_MOT.map(m => [m, m])).concat([['__outro', 'Outro (escrever)']]))) +
    lcBl(outro ? 'Qual o motivo?' : 'Detalhe', lcIn('det', f.det || '', ' placeholder="' + (outro ? 'escreva o motivo' : 'opcional') + '"')) +
    lcAv('A coleta anterior não é apagada: fica no histórico da área. A área volta para "Faltam" e pode ser programada e coletada de novo neste período.' + (sup ? '' : ' O pedido vai para o Líder ★ ou o Administrador confirmar.'), ''),
    rodape: lcPe('pp-rec-ok', sup ? 'Liberar recoleta' : 'Pedir recoleta') };
};
async function ppRecGrava(pl, ped) {
  const r = ppPlano(pl.rid); if (!r) throw new Error('Plano não encontrado.');
  const up = {}; up['liberadas.' + pl.pk + '.' + pl.area] = { motivo: pl.motivo, por: ped ? ped.solicitanteNome : S.user.nome, ts: nowISO(), aprovadoPor: ped ? S.user.nome : '' };
  await Data.col('sv2_rodizio').update(r.id, up);
  Audit.log({ acao: 'recoleta_rodizio', entidade: 'rodizio', entidadeId: r.id, resumo: 'Recoleta liberada: ' + pl.area + ' no ' + pl.pk + ' (' + (r.nome || r.tipo) + ') — ' + pl.motivo + (ped ? ' · pedido de ' + ped.solicitanteNome : '') });
}
APROV_APLICA.recoleta_plano = (pl, ped) => ppRecGrava(pl, ped);
async function ppRecOk() {
  const f = S.fm, x = f && ppCtx(f); if (!x || !coPode()) return;
  const a = x.ar.find(y => y.a === f.area && y.k === 'c'); if (!a) return lcErro('Escolha a área coletada.');
  if (!f.mot) return lcErro('Escolha o motivo.');
  const det = String(f.det || '').trim(); if (f.mot === '__outro' && det.length < 3) return lcErro('Escreva o motivo.');
  const motivo = f.mot === '__outro' ? 'Outro: ' + det : f.mot + (det ? ': ' + det : ''), pl = { rid: x.r.id, pk: x.p.k, area: a.a, motivo: motivo };
  if (!lcTravar()) return;
  if (ppSup()) { try { await ppRecGrava(pl, null); lcFim(); aviso('Recoleta liberada: ' + a.a + '.'); } catch (e) { lcErro(svErro(e)); } return; }
  if (ppRecPend(x.r.id, x.p.k).some(y => y.refId === ppRecRef(x.r.id, x.p.k, a.a))) return lcErro('Já existe um pedido de recoleta de ' + a.a + ' esperando.');
  const id = await Aprov.pedir({ tipo: 'recoleta_plano', titulo: 'Recoleta de ' + a.a + ' (' + (x.r.nome || x.r.tipo) + ')', descricao: x.p.nome + ' — ' + motivo, refTipo: 'rodizio', refId: ppRecRef(x.r.id, x.p.k, a.a), payload: pl });
  if (id) { lcFim(); aviso('Pedido de recoleta enviado.'); } else lcErro('Não deu para enviar o pedido.');
}
DD_AO.pp = (k, v) => { if (k.indexOf('rec:') === 0 && v && coPode()) lcAbrir({ k: 'pprec', rid: k.slice(4), area: v, mot: '', det: '' }); };

/* ---------- Renovar: sem botão; a partir de 1º/12 o sino sugere (pedido de 08/11 11:00) ---------- */
function ppRenovaveis() {
  if (!ppSup()) return []; const h = hojeISO(), ano = Number(h.slice(0, 4)), mes = h.slice(5, 7); let nao = {};
  try { nao = JSON.parse(localStorage.getItem('cw-pp-renova-nao') || '{}') || {}; } catch {}
  return rzAtivos().filter(r => r.freq !== 'U' && !nao[r.id] && ((Number(r.ano) === ano && mes === '12') || Number(r.ano) === ano - 1) &&
    !(S.rodizios || []).some(o => o.id !== r.id && o.ativo !== false && o.tipo === r.tipo && Number(o.ano) === Number(r.ano) + 1));
}
function ppRenovaNao(rid) { let nao = {}; try { nao = JSON.parse(localStorage.getItem('cw-pp-renova-nao') || '{}') || {}; } catch {} nao[rid] = 1; try { localStorage.setItem('cw-pp-renova-nao', JSON.stringify(nao)); } catch {} }
async function ppRenova(rid) {
  const r = ppPlano(rid); if (!r || !ppSup()) return false;
  const ano = String(Number(r.ano) + 1), nome = r.tipo + ' · ' + (RZ_FREQ[r.freq] || '') + ' · ' + ano;
  const o = { nome: nome, tipo: r.tipo, freq: r.freq, ano: ano, areas: (r.areas || []).slice(), analiseIds: (r.analiseIds || []).slice(), inicio: '', prazo: '', ativo: true, fechados: {}, liberadas: {}, progs: {}, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome, renovadoDe: r.id };
  try { const id = await Data.col('sv2_rodizio').add(o);
    Audit.log({ acao: 'criar_rodizio', entidade: 'rodizio', entidadeId: id, resumo: 'Criou o plano de coleta ' + nome + ' com ' + o.areas.length + ' áreas (renovação de ' + (r.nome || r.tipo) + ')', depois: ppRet(o) });
    aviso('Plano ' + nome + ' criado.'); return true; } catch (e) { aviso(svErro(e), 'erro'); return false; }
}

/* ---------- Desprogramar (v0.4.9, pedido de 09/11: antes só dava no EFClaudian) ---------- */
function ppDesprograma(rid, areas, depois) {
  const r = ppPlano(rid), p = r && ppPeriodo(r); if (!r || !p || !coPode()) return;
  const ar = ppAreas(r, p).filter(x => (x.k === 'p' || x.k === 'x') && x.pr && areas.indexOf(x.a) >= 0); if (!ar.length) return;
  const vai = async () => {
    const pk = p.k, antes = {}, ops = []; const g = Object.assign({}, (r.progs && r.progs[pk]) || {}); let mexeu = false;
    ar.forEach(x => { antes[x.a] = { data: x.pr.data, coletor: x.pr.coletor || '', prazo: x.pr.prazo || '' };
      if (x.pr._rz) { delete g[x.a]; mexeu = true; } else if (x.pr.id) ops.push(Data.col('sv2_prog').update(x.pr.id, { situacao: 'cancelada', canceladaMotivo: 'Desprogramada', canceladaEm: nowISO(), canceladaPor: S.user.nome })); });
    try {
      if (mexeu) { const up = {}; up['progs.' + pk] = g; ops.push(Data.col('sv2_rodizio').update(r.id, up)); }
      await Promise.all(ops);
      Audit.log({ acao: 'desprogramar_plano', entidade: 'rodizio', entidadeId: r.id, resumo: (r.nome || r.tipo) + ' · ' + p.nome + ': desprogramou ' + ar.length + ' área(s) (' + ar.map(x => x.a).join(', ') + ')', antes: antes });
      const sel = ppSel(r.id); ar.forEach(x => { delete sel[x.a]; });
      aviso(ar.length === 1 ? ar[0].a + ' desprogramada.' : ar.length + ' áreas desprogramadas.'); if (depois) depois(); else render();
    } catch (e) { aviso(svErro(e), 'erro'); }
  };
  csConfirma({ titulo: ar.length === 1 ? 'Desprogramar ' + ar[0].a + '?' : 'Desprogramar ' + ar.length + ' áreas?', texto: ar.map(x => x.a + ' (' + fmtD(x.pr.data).slice(0, 5) + ')').join(', ') + '. A área volta para "Faltam" e pode ser programada de novo. Nada que já foi coletado é apagado.', sim: 'Desprogramar', nao: 'Voltar' }, vai);
}

/* ---------- Novo plano de coleta (novo rodízio) ---------- */
const ppTipos = () => { const n = (pgCfg().tipos || []).map(t => t.nome).filter(Boolean); return n.length ? n : Object.keys(PG_GERA); };
const ppAnsDe = tipo => pgAnalises().filter(a => a.ativo !== false && pgGera(tipo).indexOf(a.tipo) >= 0).map(a => a.id);
function ppNovoIni() {
  const ano = Number(hojeISO().slice(0, 4)), tipo = ppTipos()[0] || '', ult = (S.rodizios || []).filter(r => r.tipo === tipo).sort((a, b) => Number(b.ano) - Number(a.ano))[0];
  return { k: 'ppnovo', tipo: tipo, freq: ult ? ult.freq : 'S', ano: String(ano), inicio: '', prazo: '', areas: ult ? (ult.areas || []).slice() : [], ans: ult ? (ult.analiseIds || []).slice() : ppAnsDe(tipo), q: '' };
}
LC_FORM.ppnovo = f => {
  const tipos = ppTipos(), anos = [-1, 0, 1].map(d => String(Number(hojeISO().slice(0, 4)) + d)), fr = Object.keys(RZ_FREQ);
  const tal = pgTalhoes().filter(t => t.ativo !== false).map(t => t.codigo).concat(f.areas).filter(Boolean), todas = Array.from(new Set(tal)).sort(cmpTxt);
  const an = pgAnalises().filter(a => pgGera(f.tipo).indexOf(a.tipo) >= 0 && (a.ativo !== false || f.ans.indexOf(a.id) >= 0));
  const copia = (S.rodizios || []).slice().sort((a, b) => String(b.ano).localeCompare(String(a.ano)) || cmpTxt(a.tipo, b.tipo)).map(r => [r.id, (r.nome || r.tipo) + (r.ativo === false ? ' (desativado)' : '')]);
  const lin = c => { const on = f.areas.indexOf(c) >= 0, t = pgTalhao(c), loc = t ? [t.cultura, t.pivo].filter(Boolean).join(', ') : ''; return '<button type="button" class="fm-pki pp-nv' + (on ? ' on' : '') + '" data-act="pp-nvar" data-id="' + esc(c) + '" data-busca="' + esc(tbNorm(c + ' ' + loc)) + '" aria-pressed="' + on + '"><i class="pp-nvk">' + (on ? ic('ok') : '') + '</i><b>' + esc(c) + '</b><small>' + esc(loc) + '</small></button>'; };
  return { ico: 'mais', sub: 'Coletas · Programação', titulo: 'Novo plano de coleta', corpo: lcMsg() +
    '<p class="gv-h">1 · O plano</p><div class="fm-g">' + lcBl('Tipo', ddHTML('lc:ppnvtipo', f.tipo, tipos.map(x => [x, x]))) + lcBl('Frequência', ddHTML('lc:ppnvfreq', f.freq, fr.map(k => [k, RZ_FREQ[k]]))) + '</div>' +
    '<div class="fm-g">' + lcBl('Ano', ddHTML('lc:ppnvano', f.ano, anos.map(x => [x, x]))) + lcBl('Copiar áreas e análises de', ddHTML('lc:ppnvcp', '', [['', 'Não copiar']].concat(copia))) + '</div>' +
    (f.freq === 'Q' || f.freq === 'U' ? '<div class="fm-g">' + lcBl(f.freq === 'Q' ? 'Primeira segunda-feira' : 'Início', lcData('inicio', f.inicio, true)) + (f.freq === 'U' ? lcBl('Prazo', lcData('prazo', f.prazo, true)) : '') + '</div>' : '') +
    '<p class="gv-h">2 · Áreas · <span id="pp-nvn">' + f.areas.length + ' marcada(s)</span></p><div class="co-selb"><button type="button" class="bt lk" data-act="pp-nvtodas">Marcar todas</button><button type="button" class="bt lk" data-act="pp-nvlimpa">Limpar</button></div>' +
    '<div class="fm-pk"><label class="tb-busca">' + ic('lupa') + '<input type="search" data-pk placeholder="Buscar talhão" aria-label="Buscar talhão"></label><div class="fm-pkl co-pkl">' + (todas.length ? todas.map(lin).join('') : '<p class="pp-nada">Nenhum talhão cadastrado (Coletas › Cadastros no EFClaudian).</p>') + '</div></div>' +
    '<p class="gv-h">3 · Análises</p>' + (an.length ? '<div class="pp-lis">' + an.map(a => '<button type="button" class="fm-pki pp-nv' + (f.ans.indexOf(a.id) >= 0 ? ' on' : '') + '" data-act="pp-nvan" data-id="' + esc(a.id) + '" aria-pressed="' + (f.ans.indexOf(a.id) >= 0) + '"><i class="pp-nvk">' + (f.ans.indexOf(a.id) >= 0 ? ic('ok') : '') + '</i><b>' + esc(a.nome) + '</b><small>' + esc((CO_TXT[a.tipo] || a.tipo) + (a.lab ? ' · ' + a.lab : '')) + '</small></button>').join('') + '</div>' : '<p class="pp-nada">Nenhuma análise cadastrada para ' + esc(f.tipo) + '.</p>'),
    rodape: lcPe('pp-novo-ok', 'Criar plano') };
};
async function ppNovoOk() {
  const f = S.fm; if (!f || !ppSup()) return;
  if (!f.tipo) return lcErro('Escolha o tipo.');
  const nome = f.tipo + ' · ' + (RZ_FREQ[f.freq] || '') + ' · ' + f.ano;
  if ((S.rodizios || []).some(r => r.ativo !== false && r.tipo === f.tipo && r.freq === f.freq && String(r.ano) === String(f.ano))) return lcErro('Já existe o plano "' + nome + '". Abra ele em Coletas › Programação (Ajustes) para mudar as áreas.');
  if (!f.areas.length) return lcErro('Marque pelo menos uma área.');
  if (!f.ans.length) return lcErro('Marque pelo menos uma análise.');
  if (f.freq === 'Q' && !/^\d{4}-\d{2}-\d{2}$/.test(f.inicio || '')) return lcErro('Informe a primeira segunda-feira das quinzenas.');
  if (f.freq === 'U') { if (!/^\d{4}-\d{2}-\d{2}$/.test(f.inicio || '') || !/^\d{4}-\d{2}-\d{2}$/.test(f.prazo || '')) return lcErro('Informe o início e o prazo da coleta única.'); if (f.prazo < f.inicio) return lcErro('O prazo não pode ser antes do início.'); }
  if (!lcTravar()) return;
  const o = { nome: nome, tipo: f.tipo, freq: f.freq, ano: String(f.ano), areas: f.areas.slice().sort(cmpTxt), analiseIds: f.ans.slice(), inicio: f.freq === 'Q' || f.freq === 'U' ? f.inicio : '', prazo: f.freq === 'U' ? f.prazo : '', ativo: true, fechados: {}, liberadas: {}, progs: {}, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome };
  try { const id = await Data.col('sv2_rodizio').add(o);
    Audit.log({ acao: 'criar_rodizio', entidade: 'rodizio', entidadeId: id, resumo: 'Criou o plano de coleta ' + nome + ' com ' + o.areas.length + ' áreas', depois: ppRet(o) });
    lcFim(() => { aviso('Plano ' + nome + ' criado.'); location.hash = '#/coletas/plano/' + encodeURIComponent(id); });
  } catch (e) { lcErro(svErro(e)); }
}

/* campos da aba Ajustes (fora da gaveta) */
document.addEventListener('change', ev => {
  const t = ev.target; if (!t || !t.getAttribute) return; const e = S._ppEd; if (!e) return;
  const an = t.getAttribute('data-pp-an'), ar = t.getAttribute('data-pp-ar'); if (!an && !ar) return;
  const l = an ? e.ans : e.areas, v = an || ar, i = l.indexOf(v); if (t.checked && i < 0) l.push(v); if (!t.checked && i >= 0) l.splice(i, 1);
  const r = ppPlano(e.rid); if (!r) return;
  const b = $(an ? '[data-act="pp-an-ok"]' : '[data-act="pp-ar-ok"]'); if (b) b.disabled = ppIgual(an ? e.ans : e.areas, an ? r.analiseIds : r.areas);
  if (ar) { const lb = t.closest('.pp-li'); if (lb) lb.classList.toggle('mud', t.checked !== (r.areas || []).indexOf(v) >= 0); const h = t.closest('.pp-bl') && t.closest('.pp-bl').querySelector('h3 small'); if (h) h.textContent = e.areas.length + ' no plano'; }
});
document.addEventListener('input', ev => {
  const t = ev.target; if (!t || !t.getAttribute || !t.getAttribute('data-pp-busca')) return;
  const q = String(t.value || '').trim().toUpperCase(), bl = t.closest('.pp-bl'); if (!bl) return;
  bl.querySelectorAll('.pp-li').forEach(l => { l.hidden = !!q && String(l.getAttribute('data-q') || '').indexOf(q) < 0; });
});

/* ---------- ações ---------- */
DD_AO.lc = (function (ant) { return (k, v) => {
  const f = S.fm;
  if (f && f.k === 'ppnovo' && ['ppnvtipo', 'ppnvfreq', 'ppnvano', 'ppnvcp'].indexOf(k) >= 0) {
    f.sujo = true; f.msg = '';
    if (k === 'ppnvtipo' && v !== f.tipo) { f.tipo = v; f.ans = ppAnsDe(v); const ult = (S.rodizios || []).filter(r => r.tipo === v).sort((a, b) => Number(b.ano) - Number(a.ano))[0]; if (ult) { f.areas = (ult.areas || []).slice(); f.freq = ult.freq; if (ult.analiseIds && ult.analiseIds.length) f.ans = ult.analiseIds.slice(); } }
    else if (k === 'ppnvfreq') f.freq = v; else if (k === 'ppnvano') f.ano = v;
    else if (k === 'ppnvcp' && v) { const r = ppPlano(v); if (r) { f.areas = (r.areas || []).slice(); f.ans = (r.analiseIds || []).slice(); if (r.tipo !== f.tipo) { f.tipo = r.tipo; } if (r.freq) f.freq = r.freq; } }
    gvDesenha(true); return;
  }
  if (!f || ['ppprog', 'pplanc', 'pprec'].indexOf(f.k) < 0) return ant(k, v);
  const mapa = { pgcol: 'col', pgprof: 'prof', pgest: 'est', pparea: 'area', ppmot: 'mot' }; if (!mapa[k]) return ant(k, v);
  f[mapa[k]] = v; f.sujo = true; f.msg = ''; gvDesenha(true);
  if (v === '__outro') { const i = $('#gv [data-fm="' + mapa[k] + 'Txt"]'); if (i) i.focus(); }
}; })(DD_AO.lc);
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="pp-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm;
  if (a === 'pp-ck') { const sel = ppSel(t.getAttribute('data-r')); sel[id] = !sel[id]; render(); }
  else if (a === 'pp-todas') { const r = ppPlano(id), p = r && ppPeriodo(r); if (!p) return; const l = ppAreas(r, p).filter(x => x.k !== 'c'), sel = ppSel(id), todas = l.every(x => sel[x.a]); l.forEach(x => { sel[x.a] = !todas; }); render(); }
  else if (a === 'pp-limpa') { S._pp = { rid: id, sel: {} }; render(); }
  else if (a === 'pp-prog') { if (!coPode()) return; const sel = {}; ppMarcadas(id).forEach(k => { sel[k] = true; }); lcAbrir({ k: 'ppprog', rid: id, sel: sel, data: '', prazo: '', col: pgEquipes()[0] || '', obs: '' }); }
  else if (a === 'pp-fck' && f) { f.sel[id] = !f.sel[id]; f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'pp-prog-ok') ppProgOk();
  else if (a === 'pp-desprog') ppDesprograma(id, ppMarcadas(id));
  else if (a === 'pp-novo') { if (!ppSup()) return; lcAbrir(ppNovoIni()); }
  else if (a === 'pp-novo-ok') ppNovoOk();
  else if (a === 'pp-nvar' && f) { const i = f.areas.indexOf(id); if (i < 0) f.areas.push(id); else f.areas.splice(i, 1); f.sujo = true; f.msg = ''; const b = $('#gv .pp-nv[data-act="pp-nvar"][data-id="' + id.replace(/"/g, '') + '"]'); if (b) { b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', String(i < 0)); b.querySelector('.pp-nvk').innerHTML = i < 0 ? ic('ok') : ''; } const n = $('#pp-nvn'); if (n) n.textContent = f.areas.length + ' marcada(s)'; }
  else if (a === 'pp-nvan' && f) { const i = f.ans.indexOf(id); if (i < 0) f.ans.push(id); else f.ans.splice(i, 1); f.sujo = true; f.msg = ''; const b = t; b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', String(i < 0)); b.querySelector('.pp-nvk').innerHTML = i < 0 ? ic('ok') : ''; }
  else if (a === 'pp-nvtodas' && f) { $$('#gv .pp-nv[data-act="pp-nvar"]').forEach(b => { if (!b.hidden) { const c = b.getAttribute('data-id'); if (f.areas.indexOf(c) < 0) f.areas.push(c); } }); f.sujo = true; gvDesenha(true); }
  else if (a === 'pp-nvlimpa' && f) { f.areas = []; f.sujo = true; gvDesenha(true); }
  else if (a === 'pp-lanc') { if (!coPode()) return; const sel = {}; ppMarcadas(id).forEach(k => { sel[k] = true; }); const x = ppCtx({ rid: id }); const ps = x ? ppAlvos(x, { sel: sel }) : []; const um = k => { const v = Array.from(new Set(ps.map(p => p[k] || ''))); return v.length === 1 ? v[0] : ''; };
    lcAbrir({ k: 'pplanc', rid: id, sel: sel, data: hojeISO(), col: um('coletor') || pgEquipes()[0] || '', prof: um('prof'), est: um('estadio') || pgEstadioSug(ps.filter(p => p.id)), obs: '' }); }
  else if (a === 'pp-lanc-ok') ppLancOk();
  else if (a === 'pp-folha') ppFolha(id);
  else if (a === 'pp-aba') { S._ppAba = S._ppAba || {}; S._ppAba[id] = t.getAttribute('data-v'); if (S._ppEd && S._ppEd.rid === id) S._ppEd = null; render(); }
  else if (a === 'pp-an-ok') ppSalvaAns(id);
  else if (a === 'pp-ar-ok') ppSalvaAr(id);
  else if (a === 'pp-enc') { if (!ppSup()) return; lcAbrir({ k: 'ppenc', rid: id, obs: '' }); }
  else if (a === 'pp-enc-ok') ppEncOk();
  else if (a === 'pp-rec-ok') ppRecOk();
});
