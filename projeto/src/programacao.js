/* EFCwork · programacao.js — Coletas › Programação (v0.4.4): tabela de programações e coletas, "Coletado" das programações
   pendentes e coleta avulsa. Regras portadas do EFClaudian v2.102.59 (pgSit, cdNovas, coletadoGravar, saveCol, rzBarrar).
   Nova programação, editar/cancelar programação e Planos de coleta continuam no EFClaudian (v0.4.5 / v0.4.6).
   Nada da empresa fica no código: talhões, análises, laboratórios, tipos, fazendas e modelo de etiqueta vêm do Firebase
   (sv2_talhoes, sv2_analises, sv2_cfg/coletas). Prefixo: pg. */

/* ---------- carregar ---------- */
CS_CARGAS.push(() => {
  if (!coVe()) return;
  const re = () => { if (S.rota.area === 'coletas') render(); };
  csOuve('sv2_talhoes', l => { S.talhoes = l; re(); });
  csOuve('sv2_analises', l => { S.analises = l; re(); });
  csOuve('sv2_rodizio', l => { S.rodizios = l; re(); });
});

/* ---------- cadastros e cálculos (iguais ao EFClaudian) ---------- */
const PG_GERA = { 'SOLO': ['SOLO'], 'SOLO+RAIZ': ['SOLO', 'NEMATOIDE'], 'RAIZ': ['NEMATOIDE'], 'FOLHA': ['FOLHA'], 'FRUTA VERDE': ['FRUTA'], 'COMPOSTO': ['COMPOSTO'] };
const PG_ESTADIOS = ['FLORAÇÃO', 'FRUTIFICAÇÃO', 'VEGETATIVO', 'POUSIO'];
const pgCfg = () => S.cfgCol || {};
const pgTalhoes = () => S.talhoes || [];
const pgAnalises = () => S.analises || [];
const pgTalhao = cod => pgTalhoes().find(t => t.codigo === cod) || null;
function pgGera(nome) { const t = (pgCfg().tipos || []).find(x => x.nome === nome); return t && Array.isArray(t.gera) && t.gera.length ? t.gera : (PG_GERA[nome] || [String(nome || '').toUpperCase()].filter(x => CO_TXT[x])); }
const pgPedeProf = tipo => { const g = pgGera(tipo); return g.indexOf('SOLO') >= 0 || g.indexOf('NEMATOIDE') >= 0; };
const pgSoComposto = tipo => { const g = pgGera(tipo); return g.length > 0 && g.every(x => x === 'COMPOSTO'); };
const pgAnsDo = mat => pgAnalises().filter(a => a.tipo === mat && a.ativo !== false).sort((a, b) => String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')));
const pgAnPadrao = mat => pgAnsDo(mat)[0] || null;
const pgProfsDo = nome => { const t = (pgCfg().tipos || []).find(x => x.nome === nome); return ((t && t.profundidades) || []).filter(v => v && v !== 'N/A'); };
const pgProfsTodas = () => Array.from(new Set((pgCfg().tipos || []).reduce((a, t) => a.concat(t.profundidades || []), []).filter(v => v && v !== 'N/A')));
function pgIsoSemana(iso) { const d = new Date(iso + 'T12:00:00'), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dia = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dia); const a1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil((((t - a1) / 864e5) + 1) / 7); }
const pgSemana = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? pgIsoSemana(iso) : '';
function pgPtsHa(tipoNome, cod) { const t = (pgCfg().tipos || []).find(x => x.nome === tipoNome), ta = pgTalhao(cod); const k = tipoNome === 'SOLO' || tipoNome === 'SOLO+RAIZ' ? 'ptsSolo' : tipoNome === 'FOLHA' ? 'ptsFolha' : tipoNome === 'FRUTA VERDE' ? 'ptsFruta' : ''; return ta && k && Number(ta[k]) > 0 ? Number(ta[k]) : (t ? t.pontosPorHa : 0); }
const pgPontos = (tipoNome, cod) => { const ta = pgTalhao(cod), ph = pgPtsHa(tipoNome, cod); return ph && ta ? Math.round(ph * ta.hectares) : ''; };
function pgSit(p) { if (!p || p.situacao === 'cancelada') return 'cancelada'; return p.coletadaEm || S.coletas.some(c => c.progId === p.id && c.situacao !== 'cancelada') ? 'coletada' : 'pendente'; }
const pgPendentes = () => (S.prog || []).filter(p => pgSit(p) === 'pendente');
function pgEquipes() { const l = S.coletas.filter(c => c.coletor).sort((a, b) => String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))).map(c => c.coletor.trim()).concat((S.prog || []).map(p => (p.coletor || '').trim())); return l.filter((v, i) => v && l.indexOf(v) === i).slice(0, 6); }
function pgEstadioSug(ps) { if (!ps.length) return ''; const u = ps.map(p => { const c = S.coletas.filter(x => x.talhao === p.talhao && x.estadio).sort((a, b) => String(b.data).localeCompare(String(a.data)))[0]; return c ? c.estadio : ''; }); return u.every(v => v && v === u[0]) ? u[0] : ''; }
function pgValidaData(v) { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return 'Informe a data da coleta.'; if (v > hojeISO()) return 'A data da coleta não pode ser no futuro.'; if (v < '2000-01-01') return 'Data inválida.'; return ''; }
/* etiqueta da fruta (modelo do laboratório e fazendas vêm de sv2_cfg/coletas) */
const pgLabModelo = lab => ((pgCfg().labModelo || {})[lab] === 'completa' ? 'completa' : 'simples');
const pgPartes = cod => { const m = /^([A-Z]+)\s*(\d{2})/.exec(String(cod || '').toUpperCase()); return m ? { prefixo: m[1], num: m[2] } : null; };
const pgCodCurto = cod => { const p = pgPartes(cod); return p ? p.prefixo + p.num : String(cod || ''); };
const pgFazenda = cod => { const p = pgPartes(cod); return p ? ((pgCfg().fazendas || []).find(f => f.prefixo === p.prefixo) || null) : null; };
const pgMatCurta = m => String(m || 'VERDE').toUpperCase().replace(/^FRUTA\s+/, '') || 'VERDE';
function pgIdentBase(cod, lab, mat, cultura) { const t = pgTalhao(cod), cult = ((t ? t.cultura : cultura) || '').toUpperCase(); return pgLabModelo(lab) === 'completa' ? (cult + ' ' + pgCodCurto(cod)).trim() : (cult + ' ' + pgMatCurta(mat)).trim(); }
const pgIdentFinal = (base, lab, sigla) => pgLabModelo(lab) === 'completa' && sigla ? base + ' ' + sigla : base;
function pgRastreio(iso, cod) { const p = pgPartes(cod), f = pgFazenda(cod); if (!p || !f || !/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return ''; return iso.replace(/-/g, '') + String(f.numero).padStart(2, '0') + p.num; }

/* ---------- planos de coleta: só as travas (os planos em si continuam no EFClaudian) ---------- */
const RZ_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const rzCobre = (r, mat) => pgGera(r.tipo).indexOf(mat) >= 0;
const rzMat = r => pgGera(r.tipo)[0];
const rzSegunda = iso => { const d = new Date(iso + 'T12:00:00'), w = d.getDay() || 7; return addDias(iso, 1 - w); };
const rzDia = ts => { const d = new Date(ts); return isNaN(d) ? '' : d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
function rzPeriodos(r) {
  const a = String(r.ano), f = r.freq, P = [];
  const mk = (k, m1, m2, nome) => P.push({ k: a + '-' + k, ini: a + '-' + pad(m1) + '-01', fim: addDias(m2 === 12 ? (Number(a) + 1) + '-01-01' : a + '-' + pad(m2 + 1) + '-01', -1), nome: nome });
  if (f === 'T') [1, 2, 3, 4].forEach(q => mk('T' + q, q * 3 - 2, q * 3, q + 'º trimestre ' + a));
  else if (f === 'S') [1, 2].forEach(q => mk('S' + q, q * 6 - 5, q * 6, q + 'º semestre ' + a));
  else if (f === 'M') for (let m = 1; m <= 12; m++) mk('M' + pad(m), m, m, RZ_MESES[m - 1] + ' ' + a);
  else if (f === 'W' || f === 'Q') {
    const j1 = a + '-01-01', d31 = a + '-12-31', passo = f === 'Q' ? 14 : 7; let sg = rzSegunda(f === 'Q' ? (r.inicio || j1) : j1);
    while (f === 'Q' && addDias(sg, -1) >= j1) sg = addDias(sg, -14);
    for (; sg <= d31; sg = addDias(sg, passo)) { const fim0 = addDias(sg, passo - 1); if (fim0 < j1) continue; const ini = sg < j1 ? j1 : sg, fim = fim0 > d31 ? d31 : fim0; P.push({ k: a + '-' + f + ini.slice(5).replace('-', ''), ini: ini, fim: fim, nome: (f === 'W' ? 'Semana de ' : 'Quinzena de ') + fmtD(ini).slice(0, 5) }); }
  }
  else if (f === 'U') P.push({ k: a + '-U', ini: r.inicio || rzDia(r.criadoEm || nowISO()), fim: r.prazo || (a + '-12-31'), nome: 'Coleta única' });
  else mk('A', 1, 12, 'Ano ' + a);
  return P;
}
const rzPeriodoDe = (r, iso) => rzPeriodos(r).find(p => iso >= p.ini && iso <= p.fim) || null;
const rzVale = (r, p) => !r.criadoEm || p.fim >= rzDia(r.criadoEm);
const rzAtivos = () => (S.rodizios || []).filter(r => r.ativo !== false);
function rzDaArea(mat, area, iso) { for (const r of rzAtivos()) { if (!rzCobre(r, mat) || (r.areas || []).indexOf(area) < 0) continue; const p = rzPeriodoDe(r, iso); if (p && rzVale(r, p)) return { r: r, p: p }; } return null; }
function rzDono(mat, area, iso) { const l = (S.rodizios || []).filter(r => rzCobre(r, mat) && (r.areas || []).indexOf(area) >= 0).sort((a, b) => (a.ativo === false ? 1 : 0) - (b.ativo === false ? 1 : 0)); for (const r of l) { const p = rzPeriodoDe(r, iso); if (p) return { r: r, p: p }; } return null; }
const rzTrancado = (mat, area, iso) => { const d = rzDono(mat, area, iso); return d && d.r.fechados && d.r.fechados[d.p.k] ? d : null; };
const rzLiberada = (r, p, area) => !!(r.liberadas && r.liberadas[p.k] && r.liberadas[p.k][area]);
const rzColetasDe = (r, p, area) => { const mat = rzMat(r); return S.coletas.filter(c => c.situacao !== 'cancelada' && c.tipo === mat && (c.talhao === area || (mat === 'COMPOSTO' && !c.talhao && c.loteComp === area)) && c.data >= p.ini && c.data <= p.fim); };
/* devolve o texto do bloqueio ou '' (igual ao EFClaudian) */
function rzBarrar(mat, area, iso) {
  const t = rzTrancado(mat, area, iso); if (t) return area + ': o plano de coleta "' + t.r.nome + '" (' + t.p.nome + ') foi encerrado — não aceita mais coleta.';
  const x = rzDaArea(mat, area, iso); if (!x) return '';
  const ja = rzColetasDe(x.r, x.p, area).filter(c => c.tipo === mat);
  if (ja.length && !rzLiberada(x.r, x.p, area)) return area + ' já tem ' + (CO_TXT[mat] || mat).toLowerCase() + ' no ' + x.p.nome + ' (plano de coleta "' + x.r.nome + '", ' + fmtD(ja[0].data) + '). Para coletar de novo, peça recoleta no plano de coleta (EFClaudian).';
  return '';
}
const pgOrigem = p => { const m = pgGera(p.tipo)[0]; return m && p.talhao && p.data && rzDaArea(m, p.talhao, p.data) ? 'Plano' : 'Avulsa'; };

/* ---------- a nova amostra (mesmos campos do EFClaudian) ---------- */
function pgNovaColeta(mat, b) {
  const an = b.analiseId ? pgAnalises().find(a => a.id === b.analiseId) : pgAnPadrao(mat), lab = b.lab || (an ? an.lab : '');
  const o = { tipo: mat, data: b.data, semana: pgSemana(b.data), talhao: b.talhao || '', pontos: b.pontos || '', analiseId: an ? an.id : '', analiseNome: an ? an.nome : '', sigla: an ? an.sigla || '' : '', valor: an ? Number(an.valor) || 0 : 0, precoRev: an ? Number(an.rev) || 0 : 0, lab: lab,
    coletor: b.coletor || '', prof: b.prof || '', estadio: b.estadio || '', hora: b.hora || '', maturacao: b.maturacao || '', obs: b.obs || '', cultura: b.cultura || '', variedade: b.variedade || '', identificacao: '', rastreabilidade: '',
    loteComp: b.loteComp || '', dataFabr: b.dataFabr || '', identif: b.identif || '', fertilizante: b.fertilizante || '', dadosCompl: b.dadosCompl || '',
    envio: '', os: '', numAm: '', enviado: false, laudo: false, obsEnvio: '', progId: b.progId || '', loteId: b.loteId || '', situacao: 'ativa', canceladaMotivo: '',
    compra: 'pendente', pedidoSankhya: '', dataSolicitacao: '', solicitadoPor: '', solicitadoPorNome: '', nf: '', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome };
  if (mat === 'FRUTA') { o.rastreabilidade = b.rastreabilidade != null ? b.rastreabilidade : pgRastreio(b.data, b.talhao); o.identificacao = pgIdentFinal(b.identBase ? b.identBase : pgIdentBase(b.talhao, lab, b.maturacao, b.cultura), lab, o.sigla); }
  return o;
}
const pgLoteId = () => 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const pgColId = (p, aid, data) => ('col_' + String(p.id || p.talhao) + '_' + aid + '_' + data).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 400);
function pgColIdLivre(id, ops) { let x = id, n = 2; while (S.coletas.some(c => c.id === x) || ops.some(o => o.id === x)) x = id + '_' + (n++); return x; }
/* análises de cada programação conferidas contra o material (SOLO+RAIZ → Solo e Nematoide) */
function pgCdAnalises(p) {
  const gera = pgGera(p.tipo), avisos = [], tipoDe = aid => (pgAnalises().find(a => a.id === aid) || {}).tipo;
  const pedidas = (p.analiseIds || []).filter(aid => pgAnalises().some(a => a.id === aid));
  if (!pedidas.length) return { ids: gera.map(g => (pgAnPadrao(g) || {}).id).filter(Boolean), avisos: avisos };
  const ids = pedidas.filter(aid => gera.indexOf(tipoDe(aid)) >= 0);
  if (ids.length < pedidas.length) avisos.push('Saiu análise de outro material.');
  gera.forEach(g => { if (!ids.some(aid => tipoDe(aid) === g)) { const pd = pgAnPadrao(g); if (pd) { ids.push(pd.id); avisos.push('A programação não tinha análise de ' + (CO_TXT[g] || g) + '; entrou ' + pd.nome + '.'); } } });
  return { ids: ids, avisos: avisos };
}
function pgCdNovas(p) {
  const ca = pgCdAnalises(p), novas = [], existem = [];
  ca.ids.forEach(aid => { const an = pgAnalises().find(a => a.id === aid); if (!an) return; if (S.coletas.some(c => c.progId === p.id && c.tipo === an.tipo && c.situacao !== 'cancelada')) existem.push(an.tipo); else novas.push(aid); });
  return { ids: novas, existem: existem, avisos: ca.avisos };
}

/* ---------- a aba ---------- */
/* v0.4.4 — tabela principal (modelo 5 "Tabela com etapas", escolhido em 07/11 09:40, sem as caixas de números).
   Só entra o que tem DIA de coleta definido (programação com data, ou coleta já feita). Ordem = pela data definida
   (mais nova em cima); mudar a situação NUNCA reordena sozinho — só a ordenação da coluna (A-Z) muda a ordem. */
function pgEtapas(cs, st, q) {
  const vivas = cs.filter(c => c.situacao !== 'cancelada'), env = vivas.length && vivas.every(c => c.enviado || c.envio), lau = vivas.length && vivas.every(c => c.laudo);
  const parcial = (f) => vivas.some(f) && !vivas.every(f);
  return { p: true, c: st === 'coletada', cx: st === 'pendente' ? (q && q.k === 'atrasada' ? 'at' : 'ag') : '', e: !!env, ex: st === 'coletada' && !env ? (parcial(c => c.enviado || c.envio) ? 'meio' : 'ag') : '', l: !!lau, lx: env && !lau ? (parcial(c => c.laudo) ? 'meio' : 'ag') : '' };
}
function pgEtapasHTML(e) {
  const s = (on, cls, t) => '<span class="' + (on ? 'on' : cls || '') + '"><i></i>' + t + '</span>';
  return '<div class="pg-et">' + s(e.p, '', 'Programada') + s(e.c, e.cx, 'Coletada') + s(e.e, e.ex, 'Enviada') + s(e.l, e.lx, 'Laudo') + '</div>';
}
function pgLinhas() {
  const out = [], visto = new Set();
  (S.prog || []).forEach(p => {
    if (!p.data) return; /* sem dia definido: não aparece (fica só no plano) */
    const st = pgSit(p), cs = S.coletas.filter(c => c.progId === p.id).sort((a, b) => String(a.data).localeCompare(String(b.data)));
    cs.forEach(c => visto.add(c.id));
    const vivas = cs.filter(c => c.situacao !== 'cancelada'), c0 = vivas[0] || {}, t = pgTalhao(p.talhao), q = st === 'pendente' ? pgQuando(p) : null;
    out.push({ id: 'p|' + p.id, _p: p.id, _st: st, _q: q, data: p.data, coletada: st === 'coletada' ? (p.coletadaEm || c0.data || '') : '', semana: pgSemana(p.data), talhao: p.talhao || '', local: t ? [t.cultura, t.pivo].filter(Boolean).join(' · ') : '', tipo: p.tipo || '', orig: pgOrigem(p), pontos: p.pontos || '', coletor: p.coletor || c0.coletor || '', prof: p.prof || c0.prof || '', estadio: p.estadio || c0.estadio || '', prazo: p.prazo || '', _e: st === 'cancelada' ? null : pgEtapas(vivas, st, q) });
  });
  const grupos = {};
  S.coletas.forEach(c => {
    if (!CO_TXT[c.tipo] || c.tipo === 'AGUA' || visto.has(c.id) || !c.data || (c.progId && (S.prog || []).some(p => p.id === c.progId))) return;
    const k = (c.situacao === 'cancelada' ? 'x|' + c.id : '') + c.data + '|' + (c.talhao || c.loteComp || '') + '|' + (c.loteId || c.id); (grupos[k] = grupos[k] || []).push(c);
  });
  Object.keys(grupos).forEach(k => {
    const cs = grupos[k], c = cs[0], x = c.talhao ? rzDaArea(c.tipo, c.talhao, c.data) : null, t = pgTalhao(c.talhao), st = c.situacao === 'cancelada' ? 'cancelada' : 'coletada';
    out.push({ id: 'c|' + c.id, _c: c.id, _st: st, data: c.data, coletada: st === 'coletada' ? c.data : '', semana: c.semana || pgSemana(c.data), talhao: c.talhao || c.loteComp || '', local: t ? [t.cultura, t.pivo].filter(Boolean).join(' · ') : c.loteComp ? 'Composto' : (c.cultura || ''), tipo: Array.from(new Set(cs.map(y => CO_TXT[y.tipo] || y.tipo))).join(' + ').toUpperCase(), orig: x ? 'Plano' : 'Direta', pontos: c.pontos || '', coletor: c.coletor || '', prof: c.prof || '', estadio: c.estadio || '', prazo: '', _e: st === 'cancelada' ? null : pgEtapas(cs, st, null) });
  });
  return out;
}
const PG_ST = { pendente: ['Pendente', 'wa'], coletada: ['Coletada', 'ok'], cancelada: ['Cancelada', ''] };
/* segundo marcador das pendentes (pedido de 07/11 07:27): Atrasada = passou do prazo (ou do dia, sem prazo);
   Esta semana = até o fim desta semana; Próximos dias = até 14 dias; depois, "Programada dd/mm". */
const pgFimSemana = () => { const h = hojeISO(), d = new Date(h + 'T12:00:00'), w = d.getDay() || 7; return addDias(h, 7 - w); };
function pgQuando(p) {
  const h = hojeISO(), lim = p.prazo || p.data || '';
  if (lim && lim < h) return { k: 'atrasada', txt: 'Atrasada', cor: 'cr' };
  if (!p.data || p.data <= pgFimSemana()) return { k: 'semana', txt: 'Esta semana', cor: 'wa' };
  if (p.data <= addDias(h, 14)) return { k: 'proximos', txt: 'Próximos dias', cor: 'info' };
  return { k: 'depois', txt: 'Programada', cor: '' };
}
const pgStTxt = r => r._st === 'pendente' ? r._q.txt : r._st === 'coletada' ? 'Coletada' : 'Cancelada';
const pgStCor = r => r._st === 'pendente' ? r._q.cor : PG_ST[r._st][1];
const pgStK = r => r._st === 'pendente' ? r._q.k : r._st;
const pgDiaTxt = iso => { if (!iso) return ''; const d = new Date(iso + 'T12:00:00'); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ' ' + fmtD(iso).slice(0, 5) + (iso.slice(0, 4) !== hojeISO().slice(0, 4) ? '/' + iso.slice(2, 4) : ''); };
function pgTela() {
  const l = pgLinhas().sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')) || cmpTxt(a.talhao, b.talhao) || cmpTxt(a.tipo, b.tipo));
  const st = tbEstado('pg'); if (!st._pgIni) { st._pgIni = 1; if (!Store.get('cw-tbcol-pg')) st.ocultas = ['sem', 'orig', 'pts', 'prof', 'est', 'prazo']; }
  const semCad = !pgTalhoes().length || !pgAnalises().length;
  return pgPlanosHTML() + (semCad ? '<section class="pn pg-aviso">' + lcAv('Os talhões e as análises ainda não foram cadastrados (Coletas › Cadastros no EFClaudian). Sem eles não dá para lançar coleta aqui.', 'wa') + '</section>' : '') +
    tbHTML({ id: 'pg', titulo: 'Programação', unidade: 'linhas', linhas: l, aoClicar: pgAbre, selecionado: S._pgSel, buscaDica: 'Buscar área, tipo ou quem coleta',
      busca: r => [r.talhao, r.local, r.tipo, r.coletor, r.estadio, r.orig].join(' '), vazio: 'Nada programado com dia definido.',
      filtros: [
        { k: 'st', rot: 'Situação', opcoes: [['pendente', 'Faltam coletar'], ['atrasada', 'Atrasadas'], ['semana', 'Esta semana'], ['proximos', 'Próximos dias'], ['coletada', 'Coletadas'], ['cancelada', 'Canceladas']], teste: (r, v) => v === 'pendente' ? r._st === 'pendente' : pgStK(r) === v },
        { k: 'col', rot: 'Quem coleta', opcoes: Array.from(new Set(l.map(r => r.coletor).filter(Boolean))).sort(cmpTxt).map(x => [x, x]), teste: (r, v) => r.coletor === v },
        { k: 'tipo', rot: 'Tipo', opcoes: Array.from(new Set(l.map(r => r.tipo).filter(Boolean))).sort().map(x => [x, x]), teste: (r, v) => r.tipo === v },
        { k: 'orig', rot: 'Origem', opcoes: [['Plano', 'Plano de coleta'], ['Avulsa', 'Programação avulsa'], ['Direta', 'Lançada direto']], teste: (r, v) => r.orig === v }],
      cols: [
        { k: 'tal', rot: 'Área', fixa: true, v: r => r.talhao, html: r => '<b>' + esc(r.talhao) + '</b>' + (r.local ? '<small class="pg-sub">' + esc(r.local) + '</small>' : '') },
        { k: 'tipo', rot: 'Tipo', v: r => r.tipo },
        { k: 'col', rot: 'Quem', v: r => r.coletor, html: r => r.coletor ? '<span class="pg-quem"><span class="pg-av">' + esc(pgSigla(r.coletor)) + '</span>' + esc(r.coletor) + '</span>' : '' },
        { k: 'qd', rot: 'Quando', tipo: 'data', v: r => r.data || '', html: r => alPill(pgStTxt(r), pgStCor(r)) + '<small class="pg-sub">' + esc(r._st === 'coletada' && r.coletada ? 'coletada ' + pgDiaTxt(r.coletada) : pgDiaTxt(r.data)) + '</small>' },
        { k: 'et', rot: 'Etapas', v: r => r._e ? (r._e.l ? '4 laudo' : r._e.e ? '3 enviada' : r._e.c ? '2 coletada' : '1 programada') : '0', html: r => r._e ? pgEtapasHTML(r._e) : '' },
        { k: 'sem', rot: 'Semana', tipo: 'num', v: r => Number(r.semana) || 0, html: r => r.semana ? esc(String(r.semana)) : '' },
        { k: 'orig', rot: 'Origem', v: r => r.orig },
        { k: 'pts', rot: 'Pontos', tipo: 'num', v: r => Number(r.pontos) || 0, html: r => r.pontos ? esc(String(r.pontos)) : '' },
        { k: 'prof', rot: 'Profundidade', v: r => r.prof },
        { k: 'est', rot: 'Estádio', v: r => r.estadio },
        { k: 'prazo', rot: 'Prazo', tipo: 'data', v: r => r.prazo || '' }] });
}
const pgSigla = n => { const p = String(n || '').trim().split(/\s+/).filter(Boolean); if (!p.length) return ''; if (/^equipe$/i.test(p[0]) && p[1]) return ('E' + p[1][0]).toUpperCase(); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : (p[0][1] || ''))).toUpperCase(); };

/* ---------- cartões dos planos de coleta (modernizado do EFClaudian; abrir o plano chega na v0.4.5) ---------- */
const RZ_FREQ = { T: 'trimestral', S: 'semestral', M: 'mensal', W: 'semanal', Q: 'quinzenal', A: 'anual', U: 'coleta única' };
/* rótulo curto da área: prefixo + número (RU11, JD01); se dois ficarem iguais no mesmo plano, mostra mais dígitos */
function pgRotulos(areas) {
  const curto = a => pgCodCurto(a), conta = {}; areas.forEach(a => { conta[curto(a)] = (conta[curto(a)] || 0) + 1; });
  const r = {}; areas.forEach(a => { const c = curto(a), m = /^([A-Z]+)(\d+)/.exec(String(a).toUpperCase()); r[a] = conta[c] > 1 && m ? m[1] + m[2].slice(0, 4) : c; }); return r;
}
function pgAreaEstado(r, p, area) {
  const mat = rzMat(r); if (rzColetasDe(r, p, area).length) return { k: 'c' };
  const pr = (S.prog || []).find(x => pgSit(x) === 'pendente' && x.talhao === area && x.data && pgGera(x.tipo).indexOf(mat) >= 0 && x.data <= p.fim && (x.prazo || x.data) >= addDias(p.ini, -31));
  return pr ? { k: pgQuando(pr).k === 'atrasada' ? 'x' : 'p', d: pr.data, col: pr.coletor } : { k: 'f' };
}
function pgPlanosHTML() {
  const h = hojeISO(), l = rzAtivos().map(r => ({ r: r, p: rzPeriodoDe(r, h) })).filter(x => x.p && rzVale(x.r, x.p)).sort((a, b) => cmpTxt(a.r.tipo, b.r.tipo) || cmpTxt(a.r.nome, b.r.nome));
  if (!l.length) return '';
  return '<section class="pg-planos" aria-label="Planos de coleta">' + l.map(x => {
    const r = x.r, p = x.p, areas = (r.areas || []).slice().sort(cmpTxt), rot = pgRotulos(areas), est = areas.map(a => ({ a: a, e: pgAreaEstado(r, p, a) }));
    const c = est.filter(y => y.e.k === 'c').length, pr = est.filter(y => y.e.k === 'p' || y.e.k === 'x').length, pc = areas.length ? Math.round(c / areas.length * 100) : 0;
    const fechado = r.fechados && r.fechados[p.k], sit = fechado ? ['Encerrado', ''] : c === areas.length && areas.length ? ['Concluído', 'ok'] : ['Em andamento', 'info'];
    const tit = { c: 'coletada', p: 'programada', x: 'programada e atrasada', f: 'falta' };
    return '<article class="pg-pl"><header><div><h3>' + esc(r.tipo || r.nome) + ' · ' + esc(RZ_FREQ[r.freq] || '') + ' · ' + esc(String(r.ano)) + '</h3><small>' + esc(p.nome) + ' · ' + fmtD(p.ini).slice(0, 5) + ' a ' + fmtD(p.fim).slice(0, 5) + (r.nome && r.nome !== r.tipo ? ' · ' + esc(r.nome) : '') + '</small></div>' + alPill(sit[0], sit[1]) + '</header>' +
      '<div class="pg-plb" role="img" aria-label="' + pc + '% coletado"><i style="width:' + pc + '%"></i></div>' +
      '<p class="pg-pln"><b>' + pc + '%</b> · ' + c + ' de ' + areas.length + ' áreas coletadas' + (pr ? ' · ' + pr + ' programada' + (pr > 1 ? 's' : '') : '') + '</p>' +
      '<div class="pg-ars">' + est.map(y => '<span class="pg-ar ' + y.e.k + '" title="' + esc(y.a + ' · ' + tit[y.e.k] + (y.e.d ? ' para ' + pgDiaTxt(y.e.d) + (y.e.col ? ' · ' + y.e.col : '') : '')) + '">' + esc(rot[y.a]) + '</span>').join('') + '</div></article>';
  }).join('') + '<p class="pg-leg"><span><i class="pg-ar c"></i>coletada</span><span><i class="pg-ar p"></i>programada</span><span><i class="pg-ar x"></i>programada e atrasada</span><span><i class="pg-ar f"></i>falta</span></p></section>';
}
function pgAcoes() {
  const pode = coPode(), np = pgPendentes().length, semCad = !pgTalhoes().length || !pgAnalises().length;
  return (pode && !semCad ? '<button type="button" class="bt" data-act="pg-av">' + ic('mais') + 'Coleta avulsa</button>' + (np ? '<button type="button" class="bt pr" data-act="pg-cd">' + ic('ok') + 'Coletado</button>' : '') : '') +
    '<a class="bt ic-so" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener" title="No EFClaudian: nova programação e planos de coleta" aria-label="Abrir o EFClaudian (nova programação e planos de coleta)">' + ic('externo') + '</a>';
}
function pgAbre(id) {
  if (String(id).indexOf('c|') === 0) { const c = S.coletas.find(x => x.id === id.slice(2)); if (c) { S._pgSel = id; coAbre(c.id); } return; }
  S._pgSel = id; gvAbrir(() => {
    const p = (S.prog || []).find(x => 'p|' + x.id === id); if (!p) return null;
    const st = pgSit(p), cs = S.coletas.filter(c => c.progId === p.id), ans = (p.analiseIds || []).map(a => (pgAnalises().find(x => x.id === a) || {}).nome).filter(Boolean), t = pgTalhao(p.talhao);
    const tp = (pgCfg().tipos || []).find(x => x.nome === p.tipo) || {};
    return { ico: 'relogio', sub: 'Programação · ' + pgOrigem(p), titulo: (p.tipo || '') + ' · ' + (p.talhao || ''), pill: st === 'pendente' ? alPill(pgQuando(p).txt, pgQuando(p).cor) : alPill(PG_ST[st][0], PG_ST[st][1]),
      corpo: gvCampos([['Programada', p.data ? fmtD(p.data) + (p.semana ? ' (semana ' + p.semana + ')' : '') : ''], ['Prazo', p.prazo ? fmtD(p.prazo) : ''],
        ['Pontos', p.pontos ? p.pontos + (tp.pontosPorHa && t ? ' (' + tp.pontosPorHa + ' pts/ha × ' + String(t.hectares).replace('.', ',') + ' ha)' : '') : ''],
        ['Local', t ? [t.cultura, t.variedade, t.pivo].filter(Boolean).join(' · ') : ''], ['Análises', ans.join(' · ')], ['Coletor', p.coletor], ['Profundidade', p.prof], ['Estádio', p.estadio], ['Observação', p.obs],
        ['Programado por', [p.criadoPorNome, p.criadoEm ? fmtD(String(p.criadoEm).slice(0, 10)) : ''].filter(Boolean).join(' em ')],
        ['Coletada', p.coletadaEm ? fmtD(p.coletadaEm) + (p.coletadaPor ? ' · lançada por ' + p.coletadaPor : '') : ''], ['Cancelada', p.situacao === 'cancelada' ? p.canceladaMotivo || 'sim' : '']]) +
        (cs.length ? '<p class="gv-h">Amostras</p><div class="gv-lotes">' + cs.map(c => { const s = coSit(c); return '<button type="button" class="gv-lote co-am" data-act="co-abre" data-id="' + esc(c.id) + '"><span><b>' + esc(CO_TXT[c.tipo] || c.tipo) + '</b> ' + esc(c.sigla || c.analiseNome || '') + '</span>' + alPill(s.txt, s.cor) + '</button>'; }).join('') + '</div>' : '') +
        (st === 'pendente' ? '<p class="cg-ob">Editar ou cancelar a programação: no EFClaudian, por enquanto.</p>' : ''),
      rodape: st === 'pendente' && coPode() ? '<button type="button" class="bt pr" data-act="pg-cd" data-id="' + esc(p.id) + '">' + ic('ok') + 'Coletado</button>' : '' };
  });
  render();
}

/* ---------- Coletado (uma ou várias programações) ---------- */
const pgPendOrd = () => pgPendentes().sort((a, b) => String(a.data || '9').localeCompare(String(b.data || '9')) || cmpTxt(a.tipo, b.tipo) || cmpTxt(a.talhao, b.talhao));
const pgSelPs = f => pgPendOrd().filter(p => f.sel[p.id]);
function pgDdLivre(k, atual, lista, rotOutro) {
  const l = Array.from(new Set(lista.filter(Boolean))), outro = atual === '__outro' || (!!atual && l.indexOf(atual) < 0);
  return ddHTML('lc:' + k, outro ? '__outro' : (atual || ''), [['', 'Escolha…']].concat(l.map(x => [x, x])).concat([['__outro', rotOutro || 'Outro (digitar)']]));
}
const pgLivreVal = (f, k) => f[k] === '__outro' ? String(f[k + 'Txt'] || '').trim().toUpperCase() : (f[k] || '');
const pgLivreIn = (f, k, ph) => f[k] === '__outro' ? lcIn(k + 'Txt', f[k + 'Txt'] || '', ' placeholder="' + esc(ph) + '"') : '';
function pgResumo(ps) {
  const cont = {}, av = [], ja = []; let n = 0;
  ps.forEach(p => { const ca = pgCdNovas(p); ca.avisos.forEach(x => { if (av.indexOf(x) < 0) av.push(x); }); ca.existem.forEach(g => ja.push((CO_TXT[g] || g) + ' em ' + p.talhao)); ca.ids.forEach(aid => { const a = pgAnalises().find(x => x.id === aid); if (!a) return; cont[a.tipo] = (cont[a.tipo] || 0) + 1; n++; }); });
  return '<div class="pg-res"><span><b>Vai gravar ' + n + ' amostra(s)</b>' + (n ? ': ' + Object.keys(cont).map(k => esc(CO_TXT[k] || k) + ' ' + cont[k]).join(' · ') : '') + '</span>' +
    (ja.length ? '<small>Já existe' + (ja.length > 1 ? 'm' : '') + ' (não grava de novo): ' + esc(ja.slice(0, 4).join(', ') + (ja.length > 4 ? ' (+' + (ja.length - 4) + ')' : '')) + '</small>' : '') +
    (av.length ? '<small>' + esc(av.slice(0, 3).join(' ')) + '</small>' : '') + '</div>';
}
LC_FORM.pgcd = f => {
  const l = pgPendOrd(), ps = pgSelPs(f), prof = ps.some(p => pgPedeProf(p.tipo)), est = !ps.length || !ps.every(p => pgSoComposto(p.tipo));
  const profs = Array.from(new Set(ps.filter(p => pgPedeProf(p.tipo)).reduce((a, p) => a.concat(pgProfsDo(p.tipo)), [])));
  return { ico: 'ok', sub: 'Programação · ' + S.user.nome, titulo: 'Coletado', corpo: lcMsg() +
    '<p class="gv-h">1 · Áreas · <span id="pg-n">' + ps.length + ' marcada(s)</span></p>' +
    '<div class="co-selb"><button type="button" class="bt lk" data-act="pg-todas">Marcar as ' + l.length + '</button><button type="button" class="bt lk" data-act="pg-limpa">Limpar</button></div>' +
    (l.length > 6 ? '<div class="fm-pk"><label class="tb-busca">' + ic('lupa') + '<input type="search" data-pk data-pgq value="' + esc(f.q || '') + '" placeholder="Buscar talhão ou tipo" aria-label="Buscar talhão ou tipo"></label>' : '<div class="fm-pk">') + '<div class="fm-pkl co-pkl">' + l.map(p => { const on = !!f.sel[p.id], bu = tbNorm([p.talhao, p.tipo].join(' ')), q = tbNorm(f.q || '').trim(), vis = !q || q.split(/\s+/).every(w => bu.indexOf(w) >= 0); return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="pg-ck" data-id="' + esc(p.id) + '" aria-pressed="' + on + '" data-busca="' + esc(bu) + '"' + (vis ? '' : ' hidden') + '><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span class="pg-cdi"><b>' + esc(p.talhao) + '</b><small>' + esc([p.tipo, p.data ? pgDiaTxt(p.data) : 'sem dia definido', p.prazo ? 'prazo ' + fmtD(p.prazo).slice(0, 5) : '', p.pontos ? p.pontos + ' pts' : '', p.coletor].filter(Boolean).join(' · ')) + '</small></span>' + (p.data ? alPill(pgQuando(p).txt, pgQuando(p).cor) : '') + '</button>'; }).join('') + '</div><p class="tb-nada fm-pkv" hidden>Nada encontrado.</p></div>' +
    (ps.length ? pgResumo(ps) : '') +
    '<p class="gv-h">2 · Quando e quem</p><div class="fm-g">' + lcBl('Data da coleta', lcData('data', f.data), 'pode ser de dias atrás') + lcBl('Coletores', pgDdLivre('pgcol', f.col, pgEquipes().concat(S.users.map(u => u.nome))) + pgLivreIn(f, 'col', 'Ex.: Equipe A')) + '</div>' +
    '<p class="gv-h">3 · Campo</p><div class="fm-g">' + (prof ? lcBl('Profundidade', pgDdLivre('pgprof', f.prof, profs.concat(pgProfsTodas()).concat(['N/A']), 'Outra (digitar)') + pgLivreIn(f, 'prof', 'Ex.: 40-60'), 'solo e raiz') : '') +
      (est ? lcBl('Estádio', pgDdLivre('pgest', f.est, PG_ESTADIOS) + pgLivreIn(f, 'est', 'Ex.: PÓS-COLHEITA')) : '') + '</div>' +
    lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: lcPe('pg-cd-ok', ps.length ? 'Lançar ' + ps.length + ' coletada(s)' : 'Lançar coletadas') };
};
async function pgCdOk() {
  const f = S.fm; if (!f || !coPode()) return;
  const ps = pgSelPs(f); if (!ps.length) return lcErro('Marque pelo menos uma área.');
  const d = { data: f.data, coletor: pgLivreVal(f, 'col'), prof: pgLivreVal(f, 'prof'), estadio: pgLivreVal(f, 'est'), obs: String(f.obs || '').trim() };
  const er = pgValidaData(d.data); if (er) return lcErro(er);
  if (!ps.some(p => pgCdNovas(p).ids.length) && ps.some(p => pgCdNovas(p).existem.length)) return lcErro('As amostras dessas áreas já foram lançadas. Nada novo para gravar.');
  const semAn = ps.filter(p => !pgCdAnalises(p).ids.length); if (semAn.length) return lcErro('Sem análise cadastrada para: ' + semAn.map(p => p.tipo + ' ' + p.talhao).join(', ') + '. Cadastre a análise no EFClaudian (Coletas › Cadastros) e lance de novo. Nada foi gravado.');
  if (ps.some(p => pgPedeProf(p.tipo) && !p.prof) && !d.prof) return lcErro('Informe a profundidade (solo e raiz).');
  { const bl = []; ps.forEach(p => pgGera(p.tipo).forEach(g => { const m = rzBarrar(g, p.talhao, d.data); if (m && bl.indexOf(m) < 0) bl.push(m); })); if (bl.length) return lcErro(bl.slice(0, 3).join(' ')); }
  if (!lcTravar()) return;
  const ops = [], logs = []; let n = 0;
  try {
    for (const p of ps) {
      const ca = pgCdNovas(p), lote = ca.ids.length > 1 ? pgLoteId() : '', pontos = p.pontos || pgPontos(p.tipo, p.talhao);
      const prof = d.prof || p.prof || '', coletor = d.coletor || p.coletor || '', estadio = d.estadio || p.estadio || ''; let k = 0;
      for (const aid of ca.ids) {
        const an = pgAnalises().find(a => a.id === aid); if (!an) continue; const cp = an.tipo === 'COMPOSTO';
        ops.push({ col: 'sv2_coletas', tipo: 'set', id: pgColIdLivre(pgColId(p, aid, d.data), ops), dados: pgNovaColeta(an.tipo, { data: d.data, talhao: cp ? '' : p.talhao, loteComp: cp ? p.talhao : '', dataFabr: cp ? p.dataFabr || '' : '', identif: cp ? 'COMPOSTO' : '', fertilizante: cp ? 'COMPOSTO ORGANICO' : '', pontos: cp ? '' : pontos, analiseId: aid, coletor: coletor, prof: an.tipo === 'SOLO' || an.tipo === 'NEMATOIDE' ? prof : 'N/A', estadio: cp ? '' : estadio, obs: [p.obs, d.obs].filter(Boolean).join(' · '), progId: p.id, loteId: lote }) });
        k++;
      }
      if (!k && ca.existem.length) continue;
      if (!k) throw new Error('Nenhuma amostra gravada para ' + p.tipo + ' ' + p.talhao + ' (análise não encontrada).');
      ops.push({ col: 'sv2_prog', tipo: 'update', id: p.id, dados: { coletadaEm: d.data, coletadaPor: S.user.nome, coletadaReg: nowISO(), coletor: coletor, prof: prof, estadio: estadio } });
      const kk = k; logs.push(() => Audit.log({ acao: 'coletado_programacao', entidade: 'programacao', entidadeId: p.id, resumo: 'Coletado: ' + p.tipo + ' ' + p.talhao + ' em ' + fmtD(d.data) + (coletor ? ' por ' + coletor : '') + ' — ' + kk + ' amostra(s)', depois: { coletadaEm: d.data, coletor: coletor, prof: prof, estadio: estadio, amostras: kk } }));
      n += k;
    }
    for (let i = 0; i < ops.length; i += 450) await Data.lote(ops.slice(i, i + 450));
    logs.forEach(x => { try { x(); } catch (e) {} });
    lcFim(); aviso(ps.length + ' área(s) coletada(s) · ' + n + ' amostra(s) em Amostras.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---------- coleta avulsa (já feita, fora da programação) ---------- */
const PG_MATS = CO_MAT;
function pgAvAns(f) { return pgAnsDo(f.mat); }
LC_FORM.pgav = f => {
  const m = f.mat, fr = m === 'FRUTA', cp = m === 'COMPOSTO', comProf = m === 'SOLO' || m === 'NEMATOIDE', comEst = !fr && !cp;
  const tal = pgTalhoes().filter(t => t.ativo !== false).sort((a, b) => cmpTxt(a.codigo, b.codigo)), ans = pgAvAns(f), labs = coLabs();
  const anTxt = a => a.nome + (a.sigla ? ' (' + a.sigla + ')' : '') + (a.lab ? ' · ' + a.lab : '');
  let corpo = lcMsg() + '<p class="gv-h">1 · Material e data</p><div class="fm-g">' + lcBl('Material', ddHTML('lc:pgmat', m, PG_MATS)) + lcBl('Data da coleta', lcData('data', f.data)) + '</div>';
  if (!cp) corpo += lcBl(fr ? 'Talhão / local' : 'Talhão', ddHTML('lc:pgtal', f.tal || '', [['', 'Escolha…']].concat(tal.map(t => [t.codigo, t.codigo + (t.cultura ? ' · ' + t.cultura : '') + (t.pivo ? ' · ' + t.pivo : '')])).concat(fr ? [['__outro', 'Outro local']] : []))) +
    (fr && f.tal === '__outro' ? '<div class="fm-g">' + lcBl('Nome do local', lcIn('outro', f.outro, ' placeholder="Ex.: QUADRANTE 03-04"')) + lcBl('Cultura', lcIn('cult', f.cult)) + lcBl('Variedade', lcIn('vari', f.vari)) + '</div>' : '');
  corpo += '<p class="gv-h">2 · Análises <small>cada análise marcada vira uma amostra</small></p>' + (ans.length ? '<div class="fm-pkl co-pkl pg-ans">' + ans.map(a => { const on = !!f.ans[a.id]; return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="pg-an" data-id="' + esc(a.id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(a.nome) + '</b><small>' + esc([a.sigla, a.lab].filter(Boolean).join(' · ')) + '</small></span></button>'; }).join('') + '</div>' : lcAv('Nenhuma análise de ' + esc((CO_TXT[m] || m).toLowerCase()) + ' cadastrada. Cadastre no EFClaudian (Coletas › Cadastros).', 'wa'));
  corpo += '<p class="gv-h">3 · Coleta</p><div class="fm-g">' + lcBl('Laboratório', ddHTML('lc:pglab', f.lab || '', [['', 'O de cada análise']].concat(labs.map(x => [x, x])))) + lcBl('Coletor', pgDdLivre('pgcol', f.col, pgEquipes().concat(S.users.map(u => u.nome))) + pgLivreIn(f, 'col', 'Nome ou equipe')) +
    (comProf ? lcBl('Profundidade', pgDdLivre('pgprof', f.prof, pgProfsTodas().concat(['N/A']), 'Outra (digitar)') + pgLivreIn(f, 'prof', 'Ex.: 40-60')) : '') +
    (comEst ? lcBl('Estádio', pgDdLivre('pgest', f.est, PG_ESTADIOS) + pgLivreIn(f, 'est', 'Ex.: PÓS-COLHEITA')) : '') + '</div>';
  if (fr) {
    const an1 = ans.find(a => f.ans[a.id]), lab = f.lab || (an1 ? an1.lab : ''), loc = f.tal === '__outro' ? String(f.outro || '').trim().toUpperCase() : f.tal;
    const idSug = f.tal === '__outro' ? (String(f.cult || '').toUpperCase() + ' ' + loc).trim() : pgIdentBase(loc, lab, f.matur, f.cult), raSug = f.tal === '__outro' ? '' : pgRastreio(f.data, loc);
    corpo += '<div class="fm-g">' + lcBl('Hora da coleta', '<input class="fm-i" type="time" data-fm="hora" value="' + esc(f.hora || '') + '">') + lcBl('Maturação', ddHTML('lc:pgmatur', f.matur || 'FRUTA VERDE', [['FRUTA VERDE', 'Fruta verde'], ['FRUTA MADURA', 'Fruta madura']])) + '</div>' +
      '<p class="gv-h">4 · Identificação <small>preenchida pelo talhão; a sigla da análise entra no fim quando o laboratório usa etiqueta completa</small></p><div class="fm-g">' + lcBl('Identificação', lcIn('ident', f.identMan ? f.ident : idSug)) + lcBl('Rastreabilidade', lcIn('rast', f.rastMan ? f.rast : raSug, ' inputmode="numeric"')) + '</div>';
  }
  if (cp) corpo += '<p class="gv-h">4 · Composto</p><div class="fm-g">' + lcBl('Pilha / lote', lcIn('lote', f.lote, ' placeholder="Ex.: COM-071-25" autocapitalize="characters"')) + lcBl('Fabricação', lcData('fabr', f.fabr, true)) + lcBl('Identificação', lcIn('identif', f.identif)) + lcBl('Fertilizante', lcIn('fert', f.fert)) + '</div>' + lcBl('Dados complementares', lcIn('dc', f.dc, ' placeholder="Ex.: SEM CAVACO"'));
  corpo += lcBl('Observação', lcIn('obs', f.obs, ' placeholder="Ex.: SEM RAIZ, CLIENTE EXTERNO"'));
  const n = ans.filter(a => f.ans[a.id]).length;
  return { ico: 'mais', sub: 'Coleta avulsa · ' + S.user.nome, titulo: 'Coleta avulsa · ' + (CO_TXT[m] || m), corpo: corpo, rodape: lcPe('pg-av-ok', n > 1 ? 'Lançar ' + n + ' amostras' : 'Lançar coleta') };
};
function pgAvMarcaPadrao(f) { f.ans = {}; const l = pgAnsDo(f.mat); l.forEach((a, i) => { if (i === 0 || f.mat === 'COMPOSTO') f.ans[a.id] = true; }); }
async function pgAvOk() {
  const f = S.fm; if (!f || !coPode()) return;
  const m = f.mat, fr = m === 'FRUTA', cp = m === 'COMPOSTO', up = x => String(x || '').trim().toUpperCase();
  const er = pgValidaData(f.data); if (er) return lcErro(er);
  const outro = fr && f.tal === '__outro', tal = cp ? '' : outro ? up(f.outro) : (f.tal || '');
  if (!cp && !tal) return lcErro(outro ? 'Informe o nome do local.' : 'Escolha o talhão.');
  if (cp && !up(f.lote)) return lcErro('Informe a pilha / lote do composto.');
  const ids = pgAnsDo(m).filter(a => f.ans[a.id]).map(a => a.id); if (!ids.length) return lcErro('Marque pelo menos uma análise.');
  const prof = pgLivreVal(f, 'prof'); if ((m === 'SOLO' || m === 'NEMATOIDE') && !prof) return lcErro('Informe a profundidade.');
  if (!cp) { const b = rzBarrar(m, tal, f.data); if (b) return lcErro(b); }
  if (!lcTravar()) return;
  const lote = ids.length > 1 ? pgLoteId() : '', ops = [];
  const comum = { data: f.data, talhao: tal, coletor: pgLivreVal(f, 'col'), prof: prof || (m === 'SOLO' || m === 'NEMATOIDE' ? '' : 'N/A'), estadio: fr || cp ? '' : pgLivreVal(f, 'est'), obs: up(f.obs), cultura: outro ? up(f.cult) : '', variedade: outro ? up(f.vari) : '', lab: f.lab || '', loteId: lote };
  if (fr) Object.assign(comum, { hora: f.hora || '', maturacao: up(f.matur || 'FRUTA VERDE'), identBase: f.identMan ? up(f.ident) : '', rastreabilidade: f.rastMan ? String(f.rast || '').trim() : null });
  if (cp) Object.assign(comum, { loteComp: up(f.lote), dataFabr: f.fabr || '', identif: up(f.identif) || 'COMPOSTO', fertilizante: up(f.fert) || 'COMPOSTO ORGANICO', dadosCompl: up(f.dc) });
  try {
    ids.forEach(aid => ops.push({ col: 'sv2_coletas', tipo: 'set', id: pgColIdLivre(pgColId({ talhao: tal || up(f.lote) }, aid, f.data), ops), dados: pgNovaColeta(m, Object.assign({}, comum, { analiseId: aid })) }));
    await Data.lote(ops);
    ops.forEach(o => Audit.log({ acao: 'criar_coleta', entidade: 'coleta', entidadeId: o.id, resumo: 'Coleta ' + (lote ? 'em lote ' : 'avulsa ') + (CO_TXT[m] || m) + ' ' + (tal || o.dados.loteComp) + ' em ' + fmtD(f.data) + ' — ' + o.dados.analiseNome, depois: { data: f.data, talhao: tal, analise: o.dados.analiseNome, valor: o.dados.valor } }));
    lcFim(); aviso(ids.length > 1 ? 'Lançadas ' + ids.length + ' amostras.' : 'Coleta lançada.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---------- ações ---------- */
DD_AO.lc = (function (ant) { return (k, v) => {
  const f = S.fm; if (!f || (f.k !== 'pgcd' && f.k !== 'pgav')) return ant(k, v);
  const mapa = { pgcol: 'col', pgprof: 'prof', pgest: 'est', pgtal: 'tal', pglab: 'lab', pgmatur: 'matur' };
  if (k === 'pgmat') { f.mat = v; f.tal = ''; pgAvMarcaPadrao(f); }
  else if (mapa[k]) f[mapa[k]] = v; else return ant(k, v);
  f.sujo = true; f.msg = ''; gvDesenha(true);
  if (v === '__outro') { const i = $('#gv [data-fm="' + (mapa[k] === 'tal' ? 'outro' : mapa[k] + 'Txt') + '"]'); if (i) i.focus(); }
}; })(DD_AO.lc);
document.addEventListener('input', e => { const t = e.target, f = S.fm; if (t && t.hasAttribute && t.hasAttribute('data-pgq') && f) { f.q = t.value; return; } if (!t || !t.getAttribute || !f || f.k !== 'pgav') return; const c = t.getAttribute('data-fm'); if (c === 'ident') f.identMan = true; if (c === 'rast') f.rastMan = true; });
document.addEventListener('change', e => { const t = e.target, f = S.fm; if (!t || !t.getAttribute || !f || f.k !== 'pgav') return; const c = t.getAttribute('data-fm'); if (c === 'data' || c === 'cult' || c === 'outro') gvDesenha(true); });
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="pg-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm, vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'pg-cd') { if (!coPode()) return; const sel = {}; if (id) sel[id] = true; const ps = pgPendentes().filter(p => sel[p.id]); const um = k => { const v = Array.from(new Set(ps.map(p => p[k] || ''))); return v.length === 1 ? v[0] : ''; };
    lcAbrir({ k: 'pgcd', sel: sel, data: hojeISO(), col: um('coletor') || pgEquipes()[0] || '', prof: um('prof'), est: um('estadio') || pgEstadioSug(ps), obs: '' }, volta); }
  else if (a === 'pg-ck' && f) { f.sel[id] = !f.sel[id]; f.sujo = true; gvDesenha(true); }
  else if (a === 'pg-todas' && f) { pgPendentes().forEach(p => { f.sel[p.id] = true; }); f.sujo = true; gvDesenha(true); }
  else if (a === 'pg-limpa' && f) { f.sel = {}; gvDesenha(true); }
  else if (a === 'pg-cd-ok') pgCdOk();
  else if (a === 'pg-av') { if (!coPode()) return; const nf = { k: 'pgav', mat: 'SOLO', data: hojeISO(), tal: '', col: S.user.nome, prof: '', est: '', lab: '', obs: '', matur: 'FRUTA VERDE', identif: 'COMPOSTO', fert: 'COMPOSTO ORGANICO' }; pgAvMarcaPadrao(nf); lcAbrir(nf, volta); }
  else if (a === 'pg-an' && f) { f.ans[id] = !f.ans[id]; f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'pg-av-ok') pgAvOk();
});
