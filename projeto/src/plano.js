/* ======================= EFCwork · plano.js — v0.4.6 =======================
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
const ppProgDe = (r, p, area) => (S.prog || []).find(x => pgSit(x) === 'pendente' && pgOrigem(x) === 'Plano' && x.talhao === area && x.data && pgGera(x.tipo).indexOf(rzMat(r)) >= 0 && x.data <= p.fim && (x.prazo || x.data) >= addDias(p.ini, -31)) || null;
function ppAreas(r, p) {
  const rot = pgRotulos(r.areas || []);
  return (r.areas || []).slice().sort(cmpTxt).map(a => {
    const cs = rzColetasDe(r, p, a), pr = cs.length ? null : ppProgDe(r, p, a);
    const k = cs.length ? 'c' : pr ? (pgQuando(pr).k === 'atrasada' ? 'x' : 'p') : 'f';
    return { a: a, rot: rot[a], k: k, d: cs.length ? cs.map(c => c.data).sort().pop() : pr ? pr.data : '', pr: pr, cs: cs };
  });
}
const ppSel = rid => { if (!S._pp || S._pp.rid !== rid) S._pp = { rid: rid, sel: {} }; return S._pp.sel; };
const ppMarcadas = rid => Object.keys(ppSel(rid)).filter(k => ppSel(rid)[k]);
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
    const dentro = (on ? '<i class="pp-ok">' + ic('ok') + '</i>' : '') + '<b>' + esc(x.rot) + '</b>' + (x.d ? '<small>' + fmtD(x.d).slice(0, 5) + '</small>' : '');
    return x.k === 'c' || !pode ? '<span class="pp-ar ' + x.k + '" title="' + esc(dica) + '">' + dentro + '</span>'
      : '<button type="button" class="pp-ar ' + x.k + (on ? ' sel' : '') + '" data-act="pp-ck" data-id="' + esc(x.a) + '" data-r="' + esc(r.id) + '" aria-pressed="' + on + '" title="' + esc(dica) + '">' + dentro + '</button>'; };
  const n = ppMarcadas(r.id).length;
  return cabecalho({ caminho: ['Coletas', 'Programação', tit], titulo: tit, abaNome: 'Plano', aoLado: pgLegenda(), meta: meta, acoes: acoes }) +
    '<section class="pp">' +
    '<div class="pp-prog"><div class="pg-plb" role="img" aria-label="' + pc + '% coletado"><i style="width:' + pc + '%"></i></div><span><b>' + pc + '%</b> · ' + c.length + ' de ' + ar.length + ' ' + (ar.length === 1 ? 'área' : 'áreas') + ' coletada' + (c.length === 1 ? '' : 's') + '</span></div>' +
    (fechado ? lcAv('Período encerrado: só consulta.', '') : '') +
    '<p class="pp-gh">Faltam (' + f.length + ')' + (pode && f.length ? '<button type="button" class="bt lk" data-act="pp-todas" data-id="' + esc(r.id) + '">' + (n === f.length ? 'Desmarcar todas' : 'Marcar todas') + '</button>' : '') + '</p>' +
    (f.length ? '<div class="pp-grade">' + f.map(chip).join('') + '</div>' : '<p class="pp-nada">Nenhuma área faltando neste período.</p>') +
    '<p class="pp-gh">Coletadas (' + c.length + ')</p>' + (c.length ? '<div class="pp-grade">' + c.map(chip).join('') + '</div>' : '<p class="pp-nada">Nenhuma coletada ainda.</p>') +
    '</section>' +
    (n && pode ? '<div class="pp-bar" role="region" aria-label="Áreas marcadas"><span>' + n + ' marcada' + (n > 1 ? 's' : '') + '</span><button type="button" class="bt" data-act="pp-prog" data-id="' + esc(r.id) + '">Programar</button><button type="button" class="bt pr" data-act="pp-lanc" data-id="' + esc(r.id) + '">' + ic('ok') + 'Lançar coletadas</button><button type="button" class="bt ic-so" data-act="pp-limpa" data-id="' + esc(r.id) + '" aria-label="Limpar a seleção" title="Limpar a seleção">' + ic('x') + '</button></div>' : '');
}

/* ---------- Programar (cria sv2_prog no formato do EFClaudian) ---------- */
function ppCtx(f) { const r = ppPlano(f.rid), p = r && ppPeriodo(r); return r && p ? { r: r, p: p, ar: ppAreas(r, p) } : null; }
LC_FORM.ppprog = f => {
  const x = ppCtx(f); if (!x) return { titulo: 'Programar', corpo: lcAv('Plano não encontrado.', 'cr'), rodape: '' };
  const livres = x.ar.filter(a => a.k === 'f'), ja = x.ar.filter(a => a.k === 'p' || a.k === 'x'), marc = livres.filter(a => f.sel[a.a]);
  const pick = a => { const on = !!f.sel[a.a]; return '<button type="button" class="pp-ar f' + (on ? ' sel' : '') + '" data-act="pp-fck" data-id="' + esc(a.a) + '" aria-pressed="' + on + '">' + (on ? '<i class="pp-ok">' + ic('ok') + '</i>' : '') + '<b>' + esc(a.rot) + '</b></button>'; };
  return { ico: 'mais', sub: (x.r.tipo || '') + ' · ' + (RZ_FREQ[x.r.freq] || '') + ' · ' + x.r.ano, titulo: 'Programar', corpo: lcMsg() +
    '<p class="gv-h">1 · Áreas · ' + marc.length + ' marcada(s)</p>' +
    (livres.length ? '<div class="pp-grade pp-gv">' + livres.map(pick).join('') + '</div>' : '<p class="pp-nada">Todas as áreas que faltam já estão programadas.</p>') +
    (ja.length ? '<p class="pp-nada pp-ja">Já programadas (mudar o dia continua no EFClaudian): ' + esc(ja.map(a => a.rot + ' ' + fmtD(a.d).slice(0, 5)).join(', ')) + '</p>' : '') +
    '<p class="gv-h">2 · Quando e quem</p><div class="fm-g">' + lcBl('Dia da coleta', lcData('data', f.data, true)) + lcBl('Prazo', lcData('prazo', f.prazo, true), 'opcional') + '</div>' +
    '<div class="fm-g">' + lcBl('Quem coleta', pgDdLivre('pgcol', f.col, pgEquipes().concat(S.users.map(u => u.nome))) + pgLivreIn(f, 'col', 'Ex.: Equipe A')) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')) + '</div>',
    rodape: lcPe('pp-prog-ok', marc.length ? 'Programar ' + marc.length + ' área(s)' : 'Programar') };
};
async function ppProgOk() {
  const f = S.fm, x = f && ppCtx(f); if (!x || !coPode()) return;
  const areas = x.ar.filter(a => a.k === 'f' && f.sel[a.a]); if (!areas.length) return lcErro('Marque pelo menos uma área.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.data || '')) return lcErro('Informe o dia da coleta.');
  if (f.data < x.p.ini || f.data > x.p.fim) return lcErro('O dia tem que estar dentro do período do plano (' + fmtD(x.p.ini) + ' a ' + fmtD(x.p.fim) + ').');
  if (f.prazo && f.prazo < f.data) return lcErro('O prazo não pode ser antes do dia da coleta.');
  const coletor = pgLivreVal(f, 'col');
  { const bl = []; areas.forEach(a => pgGera(x.r.tipo).forEach(g => { const m = rzBarrar(g, a.a, f.data); if (m && bl.indexOf(m) < 0) bl.push(m); })); if (bl.length) return lcErro(bl.slice(0, 3).join(' ')); }
  const ans = pgGera(x.r.tipo).map(g => (pgAnPadrao(g) || {}).id).filter(Boolean);
  if (!lcTravar()) return;
  const ops = areas.map(a => ({ col: 'sv2_prog', tipo: 'set', id: 'pg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + '_' + String(a.a).replace(/[^A-Za-z0-9]/g, ''),
    dados: { data: f.data, semana: pgSemana(f.data), ano: Number(f.data.slice(0, 4)), talhao: a.a, tipo: x.r.tipo, pontos: pgPontos(x.r.tipo, a.a), prof: '', coletor: coletor, estadio: '', obs: String(f.obs || '').trim().toUpperCase(), analiseIds: ans, situacao: 'ativa', prazo: f.prazo || '', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome } }));
  try {
    await Data.lote(ops);
    ops.forEach(o => Audit.log({ acao: 'criar_programacao', entidade: 'programacao', entidadeId: o.id, resumo: 'Programada ' + x.r.tipo + ' ' + o.dados.talhao + ' para ' + fmtD(f.data) + (coletor ? ' (' + coletor + ')' : '') + ' — plano ' + (x.r.nome || x.r.tipo), depois: { data: f.data, talhao: o.dados.talhao, tipo: x.r.tipo, coletor: coletor, prazo: f.prazo || '' } }));
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
        ops.push({ col: 'sv2_coletas', tipo: 'set', id: pgColIdLivre(pgColId(p, aid, d.data), ops), dados: pgNovaColeta(an.tipo, { data: d.data, talhao: p.talhao, pontos: pontos, analiseId: aid, coletor: coletor, prof: an.tipo === 'SOLO' || an.tipo === 'NEMATOIDE' ? prof : 'N/A', estadio: estadio, obs: [p.obs, d.obs].filter(Boolean).join(', '), progId: p.id || '', loteId: lote }) });
        k++;
      }
      if (!k) continue;
      if (p.id) ops.push({ col: 'sv2_prog', tipo: 'update', id: p.id, dados: { coletadaEm: d.data, coletadaPor: S.user.nome, coletadaReg: nowISO(), coletor: coletor, prof: prof, estadio: estadio } });
      const kk = k, dir = !p.id;
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

/* ---------- ações ---------- */
DD_AO.lc = (function (ant) { return (k, v) => {
  const f = S.fm; if (!f || (f.k !== 'ppprog' && f.k !== 'pplanc')) return ant(k, v);
  const mapa = { pgcol: 'col', pgprof: 'prof', pgest: 'est' }; if (!mapa[k]) return ant(k, v);
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
  else if (a === 'pp-lanc') { if (!coPode()) return; const sel = {}; ppMarcadas(id).forEach(k => { sel[k] = true; }); const x = ppCtx({ rid: id }); const ps = x ? ppAlvos(x, { sel: sel }) : []; const um = k => { const v = Array.from(new Set(ps.map(p => p[k] || ''))); return v.length === 1 ? v[0] : ''; };
    lcAbrir({ k: 'pplanc', rid: id, sel: sel, data: hojeISO(), col: um('coletor') || pgEquipes()[0] || '', prof: um('prof'), est: um('estadio') || pgEstadioSug(ps.filter(p => p.id)), obs: '' }); }
  else if (a === 'pp-lanc-ok') ppLancOk();
  else if (a === 'pp-folha') ppFolha(id);
});
