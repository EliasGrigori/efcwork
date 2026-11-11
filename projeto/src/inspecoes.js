/* EFCwork · inspecoes.js — área Inspeções › Cloro (v0.6.0). Prefixo: cl.
   Mesmos dados e regras do EFClaudian v2.102.60 (Cloro, etapa 4 e seguintes): sv2_bebs (bebedouros), sv2_cloro (verificações),
   sv2_cloro_foto (foto do clorímetro, um documento por verificação, id = id da verificação; "<id>_rv<n>" na nova medição),
   sv2_cloro_falta (dia útil sem verificação justificado, id = "<bebedouro>_<data>").
   Faixa do bebedouro: 0,20 a 2,00 ppm = conforme. Abaixo: aplicação obrigatória + nova verificação. Acima: alerta crítico + nova verificação.
   24 h para resolver (lembrete 4 h antes para quem lançou); depois bloqueia e avisa o superior. Caixa d'água só registra o valor.
   Escolhas do Elias (10/11 22:47): OPÇÃO 1 (velocímetros por local; até 5 por linha; com mais de 5 locais, escolhe quais aparecem),
   gaveta em passos (sem "Lançar e próximo"; dosagem e cloro depois alinhados), detalhe com a linha do tempo da gota (a mesma das
   Amostras e da Calibração), escopo do ITEM 2. Ficam no EFClaudian por enquanto: marcar/editar a foto (v0.6.3, Nº 42), relatório
   impresso com carta de controle e histograma, "tratado", mudar a situação do bebedouro, conferir fotos. */
Object.assign(S, { bebs: [], cloro: [], cloroFaltas: {}, _clFotos: {} });
const CL_MIN = 0.2, CL_MAX = 2.0, CL_ESCALA = 3, CL_PRAZO_H = 24, CL_LEMBRA_H = 4, CL_FALTA_DIAS = 7, CL_GAUGES = 5;
const CL_SIT_BEB = { ativo: ['Ativo', 'ok'], manutencao: ['Manutenção', 'wa'], sem_verificacao: ['Sem verificação', ''], pendente: ['Cadastro pendente', 'wa'], recusado: ['Cadastro recusado', 'cr'] };
const CL_CORR_CAMPOS = { data: 'Data', hora: 'Hora', valor: 'Cloro (ppm)', valorApos: 'Cloro depois (ppm)', dosagemUlt: 'Dosagem (ml)', medidoPor: 'Medido por', motivoAplicacao: 'Motivo da aplicação', obs: 'Observação' };

CS_CARGAS.push(() => {
  const re = () => { if (S.rota.area === 'inspecoes') render(); else if (S.gv) gvDesenha(); };
  csOuve('sv2_bebs', l => { S.bebs = l || []; re(); });
  csOuve('sv2_cloro', l => { S.cloro = l || []; re(); clint(); }, { order: 'ts', limit: 3000 });
  csOuve('sv2_cloro_falta', l => { const m = {}; (l || []).forEach(x => { m[x.id] = x; }); S.cloroFaltas = m; re(); });
});
let _clT = null; const clint = () => { clearTimeout(_clT); _clT = setTimeout(clChecaBloqueios, 1500); };

/* ---------- números e situação ---------- */
const clNum = v => { if (v == null || v === '') return NaN; let s = String(v).trim().replace(/\s/g, ''); if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.'); return parseFloat(s); };
const ppm = v => (v == null || v === '' || isNaN(v)) ? '—' : Number(v).toFixed(2).replace('.', ',');
const clMl = v => v == null || v === '' ? '' : String(v).replace('.', ',');
const clFaixa = v => v < CL_MIN ? 'baixo' : v > CL_MAX ? 'alto' : 'conforme';
const clFaixaTxt = f => f === 'baixo' ? 'Abaixo de 0,20' : f === 'alto' ? 'Acima de 2,00' : f === 'livre' ? 'Registro (caixa)' : 'Conforme';
const clFaixaPill = f => '<span class="pill ' + (f === 'conforme' ? 'ok' : f === 'baixo' ? 'wa' : f === 'alto' ? 'cr' : '') + '">' + esc(clFaixaTxt(f)) + '</span>';
function clValorFinal(r) { const rv = (r.reverif || []).filter(x => !x.semLeitura); return rv.length ? rv[rv.length - 1].valor : r.valor; }
const clTemApos = r => (r.reverif || []).some(x => !x.semLeitura);
const clFaixaDe = r => r.pontoTipo === 'caixa' ? 'livre' : clFaixa(r.valor);
const clAberto = r => r.situacao === 'aberto' || r.situacao === 'bloqueado';
const clHoras = iso => (Date.now() - new Date(iso).getTime()) / 3600000;
function clRestaTxt(r) { const m = Math.max(0, Math.round((CL_PRAZO_H - clHoras(r.ts)) * 60)); return m >= 60 ? 'bloqueia em ' + Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : 'bloqueia em ' + m + ' min'; }
function clSitTxt(r) {
  if (r.pontoTipo === 'caixa') return 'Registrado';
  if (r.tratadoAprovId && clAberto(r)) return 'Tratado aguardando aprovação';
  return { ok: 'Conforme', aberto: 'Nova verificação pendente', resolvido: 'Resolvido', bloqueado: 'Bloqueado (passou 24 h)', encerrado: 'Encerrado pelo superior', tratado: 'Tratado' }[r.situacao] || r.situacao || '';
}
function clSitPill(r) {
  const c = r.pontoTipo === 'caixa' ? '' : r.situacao === 'ok' || r.situacao === 'resolvido' ? 'ok' : r.situacao === 'bloqueado' ? 'cr' : clAberto(r) ? 'wa' : '';
  return '<span class="pill ' + c + '">' + esc(r.situacao === 'aberto' && r.pontoTipo !== 'caixa' ? 'Em aberto · ' + clRestaTxt(r) : clSitTxt(r)) + '</span>';
}
const clDosTxt = r => { const d = (r.reverif || []).filter(x => x.dosagemMl != null).map(x => clMl(x.dosagemMl)); if (r.dosagemPendente != null) d.push(clMl(r.dosagemPendente)); return d.join(' + '); };
const clBebAtivos = () => S.bebs.filter(b => b.situacao === 'ativo');
const clBebNome = b => b.codigo + (b.local ? ' — ' + b.local : '');
const clPodeCad = () => isSup(S.user);
const clDiaLocal = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? String(iso).slice(0, 10) : d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const clSemanaIni = iso => { const w = new Date(iso + 'T12:00:00').getDay() || 7; return addDias(iso, 1 - w); };
const clDiaUtil = iso => { const w = new Date(iso + 'T12:00:00').getDay(); return w >= 1 && w <= 5; };
function clUteisAntes(n) { const out = []; let d = addDias(hojeISO(), -1), g = 0; while (out.length < n && g++ < 40) { if (clDiaUtil(d)) out.push(d); d = addDias(d, -1); } return out; }
const clDiaSem = d => { const t = new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1) + ', ' + fmtD(d); };
function clParaCorrecao(u) { const s = supsOf(u).filter(id => isSup(userById(id))); return s.length ? s : S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== (u && u.id)).map(x => x.id); }
function clPodeCuidar(r) { const u = S.user; if (!u) return false; const dono = userById(r.lancadoPor); return isPrincipal(u) || (dono ? supsOf(dono).indexOf(u.id) >= 0 : isSup(u)); }
const clCorrPend = id => (S.aprov || []).find(a => a.tipo === 'corrigir_cloro' && a.refId === id && a.status === 'pendente') || null;
const clPodeCorrigir = r => !!r && podeLancar(S.user) && (r.pontoTipo === 'caixa' || !clAberto(r));

/* ---------- velocímetros: média da semana (segunda até hoje) por local, só bebedouros ativos ---------- */
function clEstadoLocal(local) {
  const bebs = clBebAtivos().filter(b => (b.local || '') === local), ids = bebs.map(b => b.id), hoje = hojeISO(), ini = clSemanaIni(hoje);
  const regs = S.cloro.filter(r => r.pontoTipo === 'beb' && ids.indexOf(r.pontoId) >= 0 && !r.pendenteCadastro && !r.excluirMedia && r.data >= ini && r.data <= hoje);
  const vs = regs.map(clValorFinal).filter(v => typeof v === 'number' && !isNaN(v));
  return { local: local, media: vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null, n: vs.length, total: bebs.length };
}
const clLocais = () => Array.from(new Set(clBebAtivos().map(b => b.local || ''))).filter(Boolean).sort(cmpTxt);
function clLocaisVisiveis() {
  const todos = clLocais(); if (todos.length <= CL_GAUGES) return todos;
  let esc5 = []; try { esc5 = JSON.parse(Store.get('cw-cl-locais') || '[]'); } catch {}
  esc5 = esc5.filter(l => todos.indexOf(l) >= 0).slice(0, CL_GAUGES);
  return esc5.length ? esc5 : todos.slice(0, CL_GAUGES);
}
function clGauge(v) {
  const cx = 60, cy = 60, r = 46, p = x => { const a = Math.PI * (1 - Math.max(0, Math.min(x, CL_ESCALA)) / CL_ESCALA); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const arco = (a, b, c) => { const s = p(a), e = p(b); return '<path d="M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '" fill="none" stroke="' + c + '" stroke-width="9"' + (v == null ? ' opacity=".3"' : '') + '/>'; };
  let ag = ''; if (v != null) { const a = Math.PI * (1 - Math.max(0, Math.min(v, CL_ESCALA)) / CL_ESCALA), q = r - 10; ag = '<line x1="60" y1="60" x2="' + (cx + q * Math.cos(a)).toFixed(1) + '" y2="' + (cy - q * Math.sin(a)).toFixed(1) + '" stroke="var(--tx)" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="60" r="4.5" fill="var(--tx)"/>'; }
  return '<svg viewBox="0 0 120 66" class="cl-g" role="img" aria-label="' + (v == null ? 'sem leitura na semana' : ppm(v) + ' ppm') + '">' + arco(0, CL_MIN, 'var(--wa)') + arco(CL_MIN, CL_MAX, 'var(--ok)') + arco(CL_MAX, CL_ESCALA, 'var(--cr)') + ag + '</svg>';
}
function clGaugesHTML() {
  const todos = clLocais(); if (!todos.length) return '';
  const vis = clLocaisVisiveis();
  return '<div class="cl-gt"><span>Média da semana por local' + (todos.length > CL_GAUGES ? ' · ' + vis.length + ' de ' + todos.length : '') + '</span>' + (todos.length > CL_GAUGES ? '<button type="button" class="bt" data-act="cl-locais">' + ic('colunas') + 'Escolher locais</button>' : '') + '</div>' +
    '<div class="cl-gs" style="--n:' + Math.min(vis.length, CL_GAUGES) + '">' + vis.map(l => { const e = clEstadoLocal(l), f = e.media == null ? '' : clFaixa(e.media);
      return '<div class="kp cl-gk' + (f === 'baixo' ? ' wa' : f === 'alto' ? ' cr' : '') + '" title="' + esc(l + ' · média da semana · ' + (e.n ? e.n + (e.n === 1 ? ' leitura' : ' leituras') : 'sem leitura')) + '">' + clGauge(e.media) + '<b class="num">' + ppm(e.media) + '</b><span>' + esc(l) + '</span></div>'; }).join('') + '</div>';
}

/* ---------- dias úteis sem verificação (últimos 7, a partir do dia em que o bebedouro ficou ativo) ---------- */
const clFaltaChave = (bid, d) => bid + '_' + d;
const clFaltaPend = k => (S.aprov || []).some(a => (a.tipo === 'cloro_retro' || a.tipo === 'cloro_just') && a.status === 'pendente' && a.payload && a.payload.key === k);
function clFaltas() {
  const out = [], lista = clUteisAntes(CL_FALTA_DIAS);
  clBebAtivos().forEach(b => {
    const desde = clDiaLocal(b.ativoDesde || b.criadoEm);
    lista.forEach(d => {
      if (desde && d < desde) return;
      if (S.cloro.some(r => r.pontoTipo === 'beb' && r.pontoId === b.id && r.data === d)) return;
      const k = clFaltaChave(b.id, d); if (S.cloroFaltas[k]) return;
      out.push({ key: k, bebId: b.id, codigo: b.codigo, local: b.local || '', data: d, pend: clFaltaPend(k) });
    });
  });
  return out.sort((a, b) => b.data.localeCompare(a.data) || cmpTxt(a.codigo, b.codigo));
}

/* ---------- tela ---------- */
/* a tela do Cloro; quem distribui as abas da área é o apont.js (TELAS.inspecoes), carregado depois */
function clTela() {
  const ativos = clBebAtivos(), hoje = hojeISO(), feitos = new Set(S.cloro.filter(r => r.pontoTipo === 'beb' && r.data === hoje).map(r => r.pontoId));
  const fHoje = ativos.filter(b => feitos.has(b.id)).length, pend = S.cloro.filter(r => r.pontoTipo === 'beb' && clAberto(r)).sort((a, b) => String(a.ts).localeCompare(String(b.ts))), faltas = clFaltas();
  const meta = ['<span>' + fHoje + ' de ' + ativos.length + ' verificados hoje</span>', pend.length ? metaPl(pend.length + ' em aberto', 'wa', 'alerta') : '', faltas.length ? metaPl(faltas.length + (faltas.length === 1 ? ' dia sem verificação' : ' dias sem verificação'), 'cr') : ''].filter(Boolean);
  const acoes = '<button type="button" class="bt" data-act="cl-bebs">' + ic('lista') + 'Bebedouros</button>' + (podeLancar(S.user) && (ativos.length || S.caixas.length) ? '<button type="button" class="bt pr" data-act="cl-nova">' + ic('mais') + 'Nova verificação</button>' : '');
  let h = cabecalho({ titulo: 'Cloro', abaNome: 'Cloro', meta: meta, acoes: S.bebs.length ? acoes : '' });
  if (!S.bebs.length) return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Nenhum bebedouro cadastrado.</b><span>O cadastro inicial dos bebedouros é feito pelo Principal no EFClaudian (Inspeções › Cloro).</span></div></section>';
  h += clGaugesHTML() + clAfazerHTML(pend, faltas);
  return h + clTabela();
}
function clAfazerHTML(pend, faltas) {
  const bp = clPodeCad() ? S.bebs.filter(b => b.situacao === 'pendente') : [], pode = podeLancar(S.user), n = pend.length + faltas.length + bp.length;
  if (!n) return '';
  const pl = r => { const v = clValorFinal(r), f = clFaixa(v), q = r.situacao === 'bloqueado' ? 'Bloqueado: passou 24 h sem nova verificação' + (clPodeCuidar(r) ? ' · encerre com o motivo' : ' · o superior foi avisado') : r.dosagemPendente != null ? 'Aplicação feita (' + clMl(r.dosagemPendente) + ' ml) · falta medir de novo · ' + clRestaTxt(r) : (f === 'baixo' ? 'Abaixo de 0,20 · aplicar cloro e medir de novo' : f === 'alto' ? 'Acima de 2,00 · medir de novo' : 'Medir de novo depois da aplicação') + ' · ' + clRestaTxt(r);
    return '<button type="button" class="li cl-li" data-act="cl-abre" data-id="' + esc(r.id) + '"><span class="cl-dot ' + (r.situacao === 'bloqueado' || f === 'alto' ? 'cr' : 'wa') + '"></span><span class="tx"><b>' + esc(r.pontoNome + (r.local ? ' · ' + r.local : '') + ' · ' + ppm(v) + ' ppm') + '</b><small>' + esc(q) + ' · ' + esc(fmtD(r.data) + ' ' + (r.hora || '') + ' · ' + (r.lancadoPorNome || '')) + '</small></span>' + ic('seta') + '</button>'; };
  const fl = x => '<div class="li cl-li"><span class="cl-dot cr"></span><span class="tx"><b>' + esc(x.codigo + ' sem verificação' + (x.local ? ' · ' + x.local : '')) + '</b><small>' + esc(clDiaSem(x.data)) + '</small></span>' +
    (x.pend ? '<span class="pill">Aguardando aprovação</span>' : pode ? '<button type="button" class="bt" data-act="cl-just" data-id="' + esc(x.key) + '">Justificar</button><button type="button" class="bt" data-act="cl-retro" data-id="' + esc(x.key) + '">Lançar</button>' : '') + '</div>';
  const bl = b => { const k = S.cloro.filter(r => r.pontoId === b.id && r.pendenteCadastro).length;
    return '<div class="li cl-li"><span class="cl-dot wa"></span><span class="tx"><b>' + esc(clBebNome(b)) + ' · bebedouro novo</b><small>Digitado por ' + esc(b.criadoPorNome || nomeDe(b.criadoPor)) + (k ? ' · ' + k + (k === 1 ? ' leitura esperando' : ' leituras esperando') + ' para contar' : '') + '</small></span><button type="button" class="bt" data-act="cl-beb-rec" data-id="' + esc(b.id) + '">Recusar</button><button type="button" class="bt pr" data-act="cl-beb-lib" data-id="' + esc(b.id) + '">Liberar</button></div>'; };
  return '<section class="pn cl-af"><div class="hd"><h3>A fazer</h3><em>' + n + '</em></div>' + pend.map(pl).join('') + bp.map(bl).join('') + faltas.slice(0, 30).map(fl).join('') + (faltas.length > 30 ? '<div class="li"><small class="tx">e mais ' + (faltas.length - 30) + ' dias sem verificação</small></div>' : '') + '</section>';
}
function clTabela() {
  const l = S.cloro.slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  return tbHTML({ id: 'cl-ver', titulo: 'Verificações de cloro', unidade: 'verificações', linhas: l, aoClicar: id => clAbre(id), busca: r => [r.pontoNome, r.local, r.lancadoPorNome, r.medidoPor, r.obs].join(' '), vazio: 'Nenhuma verificação com este filtro.',
    cols: [{ k: 'data', rot: 'Data', tipo: 'data', v: r => r.data }, { k: 'hora', rot: 'Hora', v: r => r.hora || '' }, { k: 'ponto', rot: 'Ponto', v: r => r.pontoNome || '', cls: 'forte' }, { k: 'local', rot: 'Local', v: r => r.local || '' },
      { k: 'v', rot: 'Cloro (ppm)', tipo: 'num', v: r => r.valor, html: r => ppm(r.valor) }, { k: 'dos', rot: 'Dosagem (ml)', v: r => clDosTxt(r) }, { k: 'apos', rot: 'Depois (ppm)', tipo: 'num', v: r => clTemApos(r) ? clValorFinal(r) : '', html: r => clTemApos(r) ? ppm(clValorFinal(r)) : '' },
      { k: 'fx', rot: 'Faixa', v: r => clFaixaTxt(clFaixaDe(r)), html: r => clFaixaPill(clFaixaDe(r)) },
      { k: 'sit', rot: 'Situação', v: r => clSitTxt(r), html: r => clSitPill(r) + (r.pendenteCadastro ? ' <span class="pill">cadastro pendente</span>' : '') + (clCorrPend(r.id) ? ' <span class="pill wa">correção pendente</span>' : r.alterado ? ' <span class="pill">corrigido</span>' : '') },
      { k: 'por', rot: 'Verificado por', v: r => r.medidoPor || r.lancadoPorNome || '' }] });
}

/* ---------- detalhe (gaveta) com a linha do tempo da gota ---------- */
function clEtapas(r) {
  const quem = (n, iso) => [n, iso ? fmtDT(iso).slice(11) : ''].filter(Boolean).join(' · ');
  const es = [{ nome: 'Leitura ' + ppm(r.valor) + ' ppm', feito: true, data: r.data, txt: (r.hora ? r.hora + ' · ' : '') + clFaixaTxt(clFaixaDe(r)), quem: r.medidoPor ? 'Medido por ' + r.medidoPor + ' · lançado por ' + (r.lancadoPorNome || '') : r.lancadoPorNome || '' }];
  if (r.pontoTipo === 'caixa') return es;
  (r.reverif || []).forEach(x => es.push({ nome: x.semLeitura ? 'Aplicou ' + clMl(x.dosagemMl) + ' ml' : (x.dosagemMl != null ? 'Aplicou ' + clMl(x.dosagemMl) + ' ml e mediu ' : 'Mediu de novo: ') + ppm(x.valor) + ' ppm', feito: true, txt: x.semLeitura ? 'sem nova leitura (estava conforme)' : clFaixaTxt(clFaixa(x.valor)), quem: quem(x.porNome, x.ts) }));
  if (r.dosagemPendente != null) es.push({ nome: 'Aplicou ' + clMl(r.dosagemPendente) + ' ml', feito: true, txt: 'falta medir de novo' });
  if (clAberto(r)) {
    const f = clFaixa(clValorFinal(r));
    if (r.dosagemPendente == null && f === 'baixo') es.push({ nome: 'Aplicar cloro', feito: false, txt: 'obrigatória abaixo de 0,20' });
    es.push({ nome: 'Medir de novo', feito: false, txt: r.situacao === 'bloqueado' ? 'passou das 24 h' : 'até ' + fmtDT(new Date(new Date(r.ts).getTime() + CL_PRAZO_H * 3600000).toISOString()).slice(0, 16), alerta: r.situacao === 'bloqueado' ? 'Bloqueado: o superior foi avisado' : '' });
    es.push({ nome: 'Fechar', feito: false });
  } else es.push({ nome: r.situacao === 'encerrado' ? 'Encerrado pelo superior' : r.situacao === 'resolvido' ? 'Resolvido' : 'Fechada', feito: true, txt: r.encerramento ? r.encerramento.texto : '', quem: r.encerramento ? quem(r.encerramento.porNome, r.encerramento.ts) : '' });
  const at = es.find(x => !x.feito); if (at) at.atual = true;
  return es;
}
function clFotoHTML(id) {
  const f = S._clFotos[id];
  if (f === undefined) { S._clFotos[id] = null; Data.col('sv2_cloro_foto').get(id).then(d => { S._clFotos[id] = d && imgSrc(d.img) ? d.img : ''; if (S.gv && S._clSel === id) gvDesenha(); }).catch(() => { S._clFotos[id] = ''; }); return '<p class="gv-h">Foto do clorímetro</p><div class="cl-ft vz">carregando…</div>'; }
  if (f === null) return '<p class="gv-h">Foto do clorímetro</p><div class="cl-ft vz">carregando…</div>';
  return f ? '<p class="gv-h">Foto do clorímetro</p><button type="button" class="cl-ft" data-act="cl-foto-ver" data-id="' + esc(id) + '"><img src="' + imgSrc(f) + '" alt="Foto do clorímetro"></button>' : '';
}
function clAbre(id) {
  S._clSel = id; gvAbrir(() => {
    const r = S.cloro.find(x => x.id === id); if (!r) return null;
    const ab = clAberto(r), pend = clCorrPend(id), pode = podeLancar(S.user), baixo = clFaixa(clValorFinal(r)) === 'baixo';
    let c = tlFluido('cl' + r.id, clEtapas(r));
    if (r.situacao === 'bloqueado' && clPodeCuidar(r)) c += lcAv('Passou 24 h sem a nova verificação. Como superior, você pode encerrar com o motivo, ou a pessoa ainda pode medir de novo.', 'cr');
    if (pend) c += lcAv('Correção pedida por ' + esc(pend.solicitanteNome) + ', aguardando ' + esc((pend.paraNomes || []).join(', ') || 'o superior') + '.', 'wa');
    if (r.pontoTipo === 'beb' && r.foto && r.foto.st !== 'sem_foto') c += clFotoHTML(r.id); else if (r.pontoTipo === 'beb' && r.foto && r.foto.motivo) c += gvCampos([['Sem foto', r.foto.motivo]]);
    c += gvCampos([['Motivo da aplicação', r.motivoAplicacao || ''], ['Observação', r.obs || ''], ['Lançado em', fmtDT(r.lancadoEm || r.ts)], r.retroativo ? ['Retroativa', 'lançada depois' + (r.aprovadoPor ? ', aprovada por ' + r.aprovadoPor : '')] : ['', '']]);
    const ult = S.cloro.filter(x => x.pontoId === r.pontoId && x.id !== r.id).sort((a, b) => String(b.ts).localeCompare(String(a.ts))).slice(0, 5);
    if (ult.length) c += '<p class="gv-h">Últimas deste ' + (r.pontoTipo === 'caixa' ? 'ponto' : 'bebedouro') + '</p><div class="cl-ul">' + ult.map(x => '<button type="button" data-act="cl-abre" data-id="' + esc(x.id) + '"><span>' + esc(fmtD(x.data) + ' ' + (x.hora || '')) + '</span><b>' + ppm(clValorFinal(x)) + '</b>' + clFaixaPill(clFaixaDe(Object.assign({}, x, { valor: clValorFinal(x) }))) + '</button>').join('') + '</div>';
    const hist = (r.historico || []).slice().reverse();
    if (hist.length) c += '<p class="gv-h">Correções aplicadas</p><div class="cl-cr">' + hist.map(x => '<div><b>' + esc(clCorrTxt(x)) + '</b><small>Motivo: ' + esc(x.motivo || '—') + ' · pedido por ' + esc(x.pedidoPor || '—') + ' · aprovado por ' + esc(x.aprovadoPor || '—') + ' · ' + esc(fmtDT(x.ts)) + '</small></div>').join('') + '</div>';
    let pe = '';
    if (ab && pode && r.pontoTipo === 'beb') pe = (baixo && r.dosagemPendente == null ? '<button type="button" class="bt" data-act="cl-rv" data-m="apl" data-id="' + esc(r.id) + '">Só a aplicação</button>' : '') + '<button type="button" class="bt pr" data-act="cl-rv" data-m="ambos" data-id="' + esc(r.id) + '">Medir de novo</button>';
    if (r.situacao === 'bloqueado' && clPodeCuidar(r)) pe = '<button type="button" class="bt" data-act="cl-enc" data-id="' + esc(r.id) + '">Encerrar</button>' + pe;
    return { ico: 'lista', sub: (r.local ? r.local + ' · ' : '') + 'verificação de ' + fmtD(r.data) + (r.hora ? ' ' + r.hora : ''), titulo: r.pontoNome || '', pill: clSitPill(r) + ' ' + clFaixaPill(clFaixaDe(r)),
      cabAcoes: !pend && clPodeCorrigir(r) ? '<button type="button" class="bt ic-so" data-act="cl-corr" data-id="' + esc(r.id) + '" title="' + (isPrincipal(S.user) ? 'Corrigir' : 'Pedir correção') + '" aria-label="' + (isPrincipal(S.user) ? 'Corrigir' : 'Pedir correção') + '">' + ic('lapis') + '</button>' : '',
      corpo: c, rodape: pe };
  });
  render();
}
function clFotoVer(id) {
  const u = S._clFotos[id]; if (!imgSrc(u)) return;
  const d = document.createElement('div'); d.id = 'cl-fv'; d.className = 'co-fv'; d.innerHTML = '<img src="' + imgSrc(u) + '" alt="Foto do clorímetro"><button type="button" class="bt ic-so" data-act="cl-fv-x" aria-label="Fechar">' + ic('x') + '</button>';
  document.body.appendChild(d); csCamadaAbre('clfv', () => { const x = $('#cl-fv'); if (x) x.remove(); });
}

/* ---------- formulário: nova verificação (gaveta em passos) ---------- */
const clPasso = (n, t) => '<div class="cl-p"><i>' + n + '</i>' + esc(t) + '</div>';
function clRegua(v) {
  const pct = x => Math.min(100, Math.max(0, x / CL_ESCALA * 100));
  return '<div class="cl-rg" aria-hidden="true"><i class="b" style="width:' + pct(CL_MIN) + '%"></i><i class="o" style="width:' + (pct(CL_MAX) - pct(CL_MIN)) + '%"></i><i class="a"></i>' + (isNaN(v) ? '' : '<em style="left:' + pct(v) + '%"></em>') + '</div><div class="cl-rgl" aria-hidden="true"><span style="left:' + pct(CL_MIN) + '%">0,20</span><span style="left:' + pct(CL_MAX) + '%">2,00</span><span class="fim">3</span></div>';
}
function clPontos() {
  const bebs = S.bebs.filter(b => b.situacao === 'ativo' || ((b.situacao === 'pendente' || b.situacao === 'recusado') && b.criadoPor === S.user.id)).sort((a, b) => cmpTxt(a.codigo, b.codigo));
  const cxs = (S.caixas || []).filter(c => !c.desativado).sort((a, b) => cmpTxt(a.tag, b.tag));
  return [['', 'Escolha o ponto…']].concat(bebs.map(b => ['beb:' + b.id, clBebNome(b) + (b.situacao !== 'ativo' ? ' (pendente)' : '')])).concat([['novo', '+ Bebedouro fora da lista']]).concat(cxs.map(c => ['caixa:' + c.id, 'Caixa d’água ' + c.tag + (c.local ? ' — ' + c.local : '')]));
}
function clProxSug() { const h = hojeISO(), feitos = new Set(S.cloro.filter(r => r.data === h).map(r => r.pontoId)); const b = clBebAtivos().filter(x => !feitos.has(x.id)).sort((a, c) => cmpTxt(a.local || '', c.local || '') || cmpTxt(a.codigo, c.codigo))[0]; return b ? 'beb:' + b.id : ''; }
function clFotoBl(f, rot) {
  const tem = imgSrc(f.foto), env = (r, h) => r ? lcBl(r, h, '') : '<div class="fm-c">' + h + '</div>';
  return env(rot, (tem ? '<div class="cl-fp"><img src="' + imgSrc(f.foto) + '" alt="Foto"><button type="button" class="bt ic-so" data-act="cl-foto-x" title="Tirar a foto" aria-label="Tirar a foto">' + ic('x') + '</button></div>' :
    '<div class="cl-fb"><label class="bt">' + ic('imagem') + 'Tirar foto<input type="file" accept="image/*" capture="environment" data-clfoto="camera" hidden></label><label class="bt">Galeria<input type="file" accept="image/*" data-clfoto="galeria" hidden></label></div>') +
    '<small class="cl-nt">Fotografe o clorímetro ao lado da placa do bebedouro. Não fotografe pessoas.</small>' + (tem ? '' : lcIn('semFoto', f.semFoto, ' placeholder="Sem foto? diga o motivo (opcional)"')));
}
LC_FORM.clNova = f => {
  const pv = f.ponto || '', novo = pv === 'novo', caixa = pv.indexOf('caixa:') === 0, v = clNum(f.valor), fx = caixa ? 'livre' : isNaN(v) ? '' : clFaixa(v), agora = new Date();
  let c = lcMsg() + clPasso(1, 'Ponto') + ddHTML('cl:ponto', pv, clPontos());
  if (novo) c += '<div class="fm-g cl-novo">' + lcBl('Código', lcIn('ncod', f.ncod, ' placeholder="ex.: BR 07"')) + lcBl('Local', lcIn('nloc', f.nloc, ' placeholder="ex.: Refeitório" list="cl-dl-loc"') + '<datalist id="cl-dl-loc">' + Array.from(new Set(S.bebs.map(b => b.local).filter(Boolean))).sort(cmpTxt).map(x => '<option value="' + esc(x) + '">').join('') + '</datalist>') + '</div>' + lcAv(clPodeCad() ? 'Entra ativo, com o seu nome.' : 'Fica pendente até o seu superior liberar.');
  c += clPasso(2, 'Resultado') + '<div class="cl-val">' + lcIn('valor', f.valor, ' class="fm-i cl-vi" inputmode="decimal" placeholder="0,00"') + '<span class="cl-un">ppm</span><span class="cl-fxp">' + (fx ? clFaixaPill(fx) : '') + '</span></div>' + (caixa ? '' : '<div class="cl-rgw">' + clRegua(v) + '</div>');
  if (!caixa) c += clPasso(3, 'Foto') + clFotoBl(f);
  const precisa = fx === 'baixo', mostra = fx && (fx !== 'conforme' && fx !== 'livre' || f.fiz === '1' || String(f.dos || '').trim());
  c += '<div class="cl-apl"' + (fx ? '' : ' hidden') + '>' + clPasso(caixa ? 3 : 4, precisa ? 'Aplicação · obrigatória abaixo de 0,20' : fx === 'alto' ? 'Aplicação · se aplicou algo' : 'Aplicação') +
    ((fx === 'conforme' || fx === 'livre') ? '<label class="cl-ck"><input type="checkbox" data-fm="fiz"' + (f.fiz === '1' ? ' checked' : '') + '> Fiz aplicação de cloro</label>' : '') +
    '<div class="cl-aplc"' + (mostra ? '' : ' hidden') + '><div class="fm-g cl-fm2">' + lcBl('Dosagem (ml)', lcIn('dos', f.dos, ' inputmode="decimal"')) + lcBl('Cloro depois (ppm)', lcIn('v2', f.v2, ' inputmode="decimal" placeholder="pode lançar depois"')) + '</div>' +
    (fx === 'conforme' ? lcBl('Motivo da aplicação', lcIn('mot', f.mot, ' placeholder="recomendado: ex.: no limite, para não cair durante o dia"')) : '') + '</div></div>';
  c += clPasso((caixa ? 3 : 4) + (fx ? 1 : 0), 'Registro') + '<div class="fm-g cl-fm2">' + lcBl('Medido por', lcIn('med', f.med, ' placeholder="em branco = você"')) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="se for o caso"')) + '</div>';
  return { ico: 'lista', sub: 'Hoje · ' + pad(agora.getHours()) + ':' + pad(agora.getMinutes()) + ' · ' + S.user.nome, titulo: 'Nova verificação', corpo: c, rodape: lcPe('cl-nova-ok', 'Lançar') };
};
/* resultado digitado: atualiza a faixa, a régua e a aplicação sem redesenhar a gaveta (o cursor fica no campo) */
function clPrevia() {
  const f = S.fm; if (!f || f.k !== 'clNova') return;
  const caixa = String(f.ponto || '').indexOf('caixa:') === 0, v = clNum(f.valor), fx = caixa ? 'livre' : isNaN(v) ? '' : clFaixa(v);
  const p = $('#gv .cl-fxp'); if (p) p.innerHTML = fx ? clFaixaPill(fx) : '';
  const rg = $('#gv .cl-rgw'); if (rg) rg.innerHTML = clRegua(v);
  const ap = $('#gv .cl-apl'); if (!ap) return;
  if (!!fx !== !ap.hidden || (fx && ap.getAttribute('data-fx') !== fx)) { gvDesenha(true); const i = $('#gv .cl-vi'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch {} } $('#gv .cl-apl') && $('#gv .cl-apl').setAttribute('data-fx', fx); }
}
document.addEventListener('input', e => { const t = e.target; if (t && t.getAttribute && S.fm && S.fm.k === 'clNova' && ['valor', 'dos'].indexOf(t.getAttribute('data-fm')) >= 0) setTimeout(clPrevia, 0); });
document.addEventListener('change', e => {
  const t = e.target; if (!t || !t.getAttribute || !S.fm) return;
  if (t.getAttribute('data-fm') === 'fiz' && S.fm.k === 'clNova') { S.fm.fiz = t.checked ? '1' : '0'; gvDesenha(true); return; }
  const o = t.getAttribute('data-clfoto'); if (!o || !t.files || !t.files[0]) return;
  coFotoReduz(t.files[0]).then(u => { if (!S.fm) return; S.fm.foto = u; S.fm.fotoOrigem = o; S.fm.sujo = true; gvDesenha(true); }).catch(er => lcErro(er.message || 'Não deu para ler a foto.'));
});
DD_AO.cl = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'ponto') { if (v.indexOf('beb:') === 0) { const ab = clAbertoHoje(v.slice(4)); if (ab) { clRegraAberto(ab); return; } } f.ponto = v; }
  else if (k === 'modo') f.modo = v;
  gvDesenha(true); };
const clAbertoHoje = bid => S.cloro.filter(r => r.pontoTipo === 'beb' && r.pontoId === bid && r.data === hojeISO()).find(clAberto) || null;
/* regra de 24/09/2026 do EFClaudian: bebedouro com verificação EM ABERTO hoje não aceita outra; leva para a pendente */
function clRegraAberto(r) {
  csConfirma({ titulo: r.pontoNome + ' já tem verificação em aberto hoje', texto: ppm(clValorFinal(r)) + ' ppm às ' + (r.hora || '') + '. Continue por ela: aplicar e/ou medir de novo. Só depois de fechada entra outra.', sim: 'Continuar a de hoje', nao: 'Escolher outro' }, () => { lcFim(() => { clAbre(r.id); setTimeout(() => clRvAbrir(r.id, 'ambos'), 60); }); });
}
async function clNovaOk() {
  const f = S.fm; if (!f) return;
  const pv = f.ponto || '', v = clNum(f.valor);
  if (!pv) return lcErro('Escolha o ponto.');
  if (isNaN(v) || v < 0 || v > 20) return lcErro('Digite o valor do cloro em ppm (ex.: 0,55).');
  const dosRaw = String(f.dos || '').trim(), v2Raw = String(f.v2 || '').trim(), dos = dosRaw ? clNum(dosRaw) : null, v2 = v2Raw ? clNum(v2Raw) : null;
  if (dosRaw && (isNaN(dos) || dos < 0 || dos > 100000)) return lcErro('Dosagem inválida.');
  if (v2Raw && (isNaN(v2) || v2 < 0 || v2 > 20)) return lcErro('Cloro depois da aplicação inválido.');
  let tipo, ponto, pendCad = false, novoBeb = null;
  if (pv === 'novo') {
    const cod = String(f.ncod || '').trim().toUpperCase().replace(/^BR\s*-?\s*(\d)/, 'BR $1'), loc = String(f.nloc || '').trim();
    if (cod.length < 2) return lcErro('Informe o código do bebedouro novo.');
    if (!loc) return lcErro('Informe o local do bebedouro novo.');
    if (S.bebs.some(b => b.codigo === cod)) return lcErro('Esse bebedouro já existe na lista. Escolha ele no campo Ponto.');
    tipo = 'beb'; pendCad = !clPodeCad(); novoBeb = { codigo: cod, local: loc };
  } else {
    const p = pv.split(':'); tipo = p[0];
    ponto = tipo === 'caixa' ? (S.caixas || []).find(c => c.id === p[1]) : S.bebs.find(b => b.id === p[1]);
    if (!ponto) return lcErro('Ponto não encontrado.');
    if (tipo === 'beb' && ponto.situacao !== 'ativo') pendCad = true;
    if (tipo === 'beb') { const ab = clAbertoHoje(ponto.id); if (ab) { clRegraAberto(ab); return; } }
  }
  const fx = tipo === 'caixa' ? 'livre' : clFaixa(v), mot = String(f.mot || '').trim();
  if (fx === 'baixo' && v2 != null && dos == null) return lcErro('Abaixo de 0,20 a aplicação é obrigatória: informe a dosagem em ml.');
  if ((fx === 'conforme' || fx === 'livre') && v2 != null && dos == null) return lcErro('Para lançar o cloro depois, informe a dosagem aplicada.');
  if (fx === 'conforme' && dos != null && mot.length < 5 && !f.semMotOk) { f.semMotOk = true; return lcErro('Está conforme: explique o motivo da aplicação (recomendado). Toque em Lançar de novo para lançar sem motivo.'); }
  if (!lcTravar()) return;
  try {
    if (novoBeb) {
      const bid = await Data.col('sv2_bebs').add({ codigo: novoBeb.codigo, local: novoBeb.local, situacao: pendCad ? 'pendente' : 'ativo', descricao: '', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome });
      ponto = { id: bid, codigo: novoBeb.codigo, local: novoBeb.local };
      if (pendCad) { const aid = await Aprov.pedir({ tipo: 'novo_bebedouro', titulo: 'Cadastrar bebedouro ' + novoBeb.codigo + ' — ' + novoBeb.local, descricao: 'Digitado na hora da verificação de cloro.', refTipo: 'bebedouro', refId: bid, payload: { bebId: bid, codigo: novoBeb.codigo, local: novoBeb.local } }); if (aid) await Data.col('sv2_bebs').update(bid, { aprovId: aid }); }
      Audit.log({ acao: 'criar_bebedouro', entidade: 'bebedouro', entidadeId: bid, resumo: pendCad ? 'Bebedouro ' + novoBeb.codigo + ' digitado na verificação (pendente de aprovação)' : 'Cadastrou o bebedouro ' + novoBeb.codigo + ' — ' + novoBeb.local + ' na hora da verificação (já ativo)', depois: novoBeb });
    }
    let reverif = [], dosPend = null, sit; const temV2 = v2 != null;
    if (fx === 'baixo' || fx === 'alto' || (fx === 'conforme' && dos != null)) {
      if (temV2) reverif = [{ ts: nowISO(), dosagemMl: dos, valor: v2, porId: S.user.id, porNome: S.user.nome }]; else if (dos != null) dosPend = dos;
      sit = temV2 && clFaixa(v2) === 'conforme' ? 'resolvido' : 'aberto';
    } else {
      if (dos != null) reverif = [{ ts: nowISO(), dosagemMl: dos, valor: temV2 ? v2 : v, semLeitura: !temV2, porId: S.user.id, porNome: S.user.nome }];
      sit = fx === 'conforme' && temV2 && clFaixa(v2) !== 'conforme' ? 'aberto' : 'ok';
    }
    const fDepois = fx === 'livre' ? 'livre' : clFaixa(temV2 ? v2 : v), agora = new Date();
    const o = { ts: nowISO(), data: hojeISO(), hora: pad(agora.getHours()) + ':' + pad(agora.getMinutes()), pontoTipo: tipo, pontoId: ponto.id, pontoNome: tipo === 'caixa' ? ponto.tag : ponto.codigo, local: ponto.local || '',
      valor: v, faixa: fx, reverif: reverif, dosagemPendente: dosPend, motivoAplicacao: mot, situacao: sit, bloqueadoEm: '', pedidoMotivo: null, motivoResposta: null, encerramento: null,
      tratado: null, tratadoAprovId: '', excluirMedia: false, pendenteCadastro: pendCad, medidoPor: String(f.med || '').trim(), obs: String(f.obs || '').trim(), lancadoPor: S.user.id, lancadoPorNome: S.user.nome };
    const foto = tipo === 'beb' && imgSrc(f.foto) ? { img: f.foto, origem: f.fotoOrigem || 'camera' } : null;
    if (tipo === 'beb') o.foto = foto ? { st: 'pendente', origem: foto.origem } : { st: 'sem_foto', motivo: String(f.semFoto || '').trim() };
    const cid = await Data.col('sv2_cloro').add(o);
    if (foto) { S._clFotos[cid] = foto.img; Data.col('sv2_cloro_foto').set(cid, { img: foto.img, ts: nowISO(), porId: S.user.id, origem: foto.origem }).catch(e => console.error('foto cloro', e)); }
    Audit.log({ acao: 'verificar_cloro', entidade: 'cloro', entidadeId: cid, resumo: 'Cloro ' + o.pontoNome + ' (' + (o.local || 'sem local') + '): ' + ppm(v) + ' ppm — ' + clFaixaTxt(fx) + (dos != null ? ' · dosagem ' + dos + ' ml' : '') + (mot ? ' · motivo: ' + mot : '') + (temV2 ? ' · após ' + ppm(v2) : ''), depois: { ponto: o.pontoNome, valor: v, faixa: fx, situacao: sit } });
    const eu = Array.from(new Set(supsOf(S.user).concat([S.user.id])));
    if (fx === 'alto') Notif.send({ nivel: 'critico', titulo: 'Cloro ALTO: ' + o.pontoNome + ' com ' + ppm(v) + ' ppm', texto: (o.local || '') + ' · ' + fmtD(o.data) + ' ' + o.hora + ' · lançado por ' + S.user.nome + '. Acima de 2,00 ppm: nova verificação obrigatória.', para: eu, refTipo: 'cloro', refId: cid });
    else if (fx === 'baixo' && sit === 'aberto') Notif.send({ nivel: 'aviso', titulo: 'Cloro baixo: ' + o.pontoNome + ' com ' + ppm(v) + ' ppm', texto: 'Aplicação obrigatória e nova verificação em até 24 h.', para: [S.user.id], refTipo: 'cloro', refId: cid });
    else if (fx === 'conforme' && sit === 'aberto' && fDepois === 'alto') Notif.send({ nivel: 'critico', titulo: 'Cloro ALTO depois da aplicação: ' + o.pontoNome + ' com ' + ppm(v2) + ' ppm', texto: (o.local || '') + ' · antes ' + ppm(v) + ' · dosagem ' + dos + ' ml · lançado por ' + S.user.nome + '. Nova verificação obrigatória.', para: eu, refTipo: 'cloro', refId: cid });
    else if (fx === 'conforme' && sit === 'aberto') Notif.send({ nivel: 'aviso', titulo: (temV2 ? 'Cloro baixo depois da aplicação: ' : 'Cloro aplicado: ') + o.pontoNome, texto: temV2 ? ppm(v2) + ' ppm. Nova verificação em até 24 h.' : dos + ' ml aplicados com ' + ppm(v) + ' ppm. Faça a nova verificação em até 24 h.', para: [S.user.id], refTipo: 'cloro', refId: cid });
    lcFim(); aviso(sit === 'aberto' ? 'Lançado. Falta a nova verificação.' : sit === 'resolvido' ? 'Lançado. Resolvido: dentro da faixa.' : 'Verificação lançada.');
  } catch (e) { S.fm && (S.fm._trava = 0); lcErro(svErro(e)); }
}

/* ---------- medir de novo / só a aplicação ---------- */
function clRvAbrir(id, modo) { const r = S.cloro.find(x => x.id === id); if (!r || !podeLancar(S.user)) return; lcAbrir({ k: 'clRv', id: id, modo: modo || 'ambos', dos: '', valor: '' }, () => clAbre(id)); }
LC_FORM.clRv = f => {
  const r = S.cloro.find(x => x.id === f.id); if (!r) return null;
  const dp = r.dosagemPendente, baixo = clFaixa(clValorFinal(r)) === 'baixo', soApl = baixo && dp == null && f.modo === 'apl';
  let c = lcMsg() + lcAv('Último valor <b>' + ppm(clValorFinal(r)) + ' ppm</b>' + (r.situacao === 'aberto' ? ' · ' + esc(clRestaTxt(r)) : ''));
  if (dp != null) c += lcAv('Aplicação feita: <b>' + esc(clMl(dp)) + ' ml</b>. Falta só medir o cloro de novo.');
  else if (baixo) c += lcBl('O que você fez', ddHTML('cl:modo', f.modo, [['ambos', 'Apliquei e medi de novo'], ['apl', 'Só apliquei (meço depois)']])) + lcBl('Dosagem aplicada (ml)', lcIn('dos', f.dos, ' inputmode="decimal"'));
  else c += lcBl('Dosagem aplicada (ml)', lcIn('dos', f.dos, ' inputmode="decimal" placeholder="se aplicou algo"'));
  if (!soApl) c += lcBl('Cloro livre agora (ppm)', lcIn('valor', f.valor, ' inputmode="decimal" placeholder="0,00"')) + clFotoBl(f, 'Foto do clorímetro');
  return { ico: 'lista', sub: r.pontoNome + (r.local ? ' · ' + r.local : ''), titulo: soApl ? 'Só a aplicação' : 'Medir de novo', corpo: c, rodape: lcPe('cl-rv-ok', 'Salvar') };
};
async function clRvOk() {
  const f = S.fm, r = f && S.cloro.find(x => x.id === f.id); if (!r) return;
  if (r.situacao !== 'aberto' && r.situacao !== 'bloqueado') return lcErro('Esta verificação não aceita mais nova medição (' + clSitTxt(r) + ').');
  const baixo = clFaixa(clValorFinal(r)) === 'baixo';
  if (r.dosagemPendente == null && baixo && f.modo === 'apl') {
    const d0 = clNum(f.dos); if (isNaN(d0) || d0 <= 0) return lcErro('Informe a dosagem aplicada em ml.');
    if (!lcTravar()) return;
    lcGrava([Data.col('sv2_cloro').update(r.id, { dosagemPendente: d0 }).then(() => Audit.log({ acao: 'aplicar_cloro', entidade: 'cloro', entidadeId: r.id, resumo: 'Aplicação no ' + r.pontoNome + ': ' + d0 + ' ml (medição depois)', depois: { dosagemMl: d0 } }))], 'Aplicação registrada. Falta medir.');
    return;
  }
  const dosRaw = r.dosagemPendente != null ? String(r.dosagemPendente) : String(f.dos || '').trim(), v = clNum(f.valor), dos = dosRaw ? clNum(dosRaw) : null;
  if (isNaN(v) || v < 0 || v > 20) return lcErro('Digite o cloro livre medido agora.');
  if (dosRaw && (isNaN(dos) || dos < 0)) return lcErro('Dosagem inválida.');
  if (baixo && dos == null) return lcErro('Não dá para medir sem aplicar: informe a dosagem aplicada em ml.');
  if (!lcTravar()) return;
  const rv = (r.reverif || []).slice(), foto = imgSrc(f.foto) ? { img: f.foto, origem: f.fotoOrigem || 'camera' } : null, nv = { ts: nowISO(), dosagemMl: dos, valor: v, porId: S.user.id, porNome: S.user.nome };
  if (r.pontoTipo === 'beb') nv.foto = foto ? { st: 'pendente', origem: foto.origem } : { st: 'sem_foto', motivo: String(f.semFoto || '').trim() };
  rv.push(nv); const ok = clFaixa(v) === 'conforme';
  try {
    await Data.col('sv2_cloro').update(r.id, { reverif: rv, dosagemPendente: null, situacao: ok ? 'resolvido' : 'aberto' });
    if (foto) Data.col('sv2_cloro_foto').set(r.id + '_rv' + (rv.length - 1), { img: foto.img, ts: nowISO(), porId: S.user.id, origem: foto.origem }).catch(e => console.error('foto rv', e));
    Audit.log({ acao: 'reverificar_cloro', entidade: 'cloro', entidadeId: r.id, resumo: 'Nova verificação ' + r.pontoNome + ': ' + ppm(v) + ' ppm' + (dos != null ? ' após dosagem de ' + dos + ' ml' : '') + (ok ? ' — resolvido' : ' — ainda fora da faixa'), antes: { valor: clValorFinal(r) }, depois: { valor: v, dosagemMl: dos } });
    if (!ok && clFaixa(v) === 'alto') Notif.send({ nivel: 'critico', titulo: 'Cloro continua ALTO: ' + r.pontoNome, texto: ppm(v) + ' ppm na nova verificação.', para: Array.from(new Set(supsOf(S.user).concat([S.user.id]))), refTipo: 'cloro', refId: r.id });
    lcFim(); aviso(ok ? 'Resolvido: dentro da faixa.' : 'Ainda fora da faixa. Faça nova aplicação e meça de novo.', ok ? '' : 'erro');
  } catch (e) { f._trava = 0; lcErro(svErro(e)); }
}
/* encerrar uma bloqueada (superior), com o motivo */
LC_FORM.clEnc = f => { const r = S.cloro.find(x => x.id === f.id); if (!r) return null;
  return { ico: 'lista', sub: r.pontoNome, titulo: 'Encerrar verificação bloqueada', corpo: lcMsg() + lcAv('Passou 24 h sem a nova verificação. Encerre explicando o que aconteceu.', 'wa') + lcBl('O que aconteceu', lcTx('texto', f.texto, 'ex.: bebedouro desligado; a água foi trocada; a pessoa estava de folga')), rodape: lcPe('cl-enc-ok', 'Encerrar') }; };
function clEncOk() {
  const f = S.fm, r = f && S.cloro.find(x => x.id === f.id); if (!r) return;
  const t = String(f.texto || '').trim(); if (t.length < 5) return lcErro('Escreva o que aconteceu (pelo menos algumas palavras).');
  if (!clPodeCuidar(r)) return lcErro('Só o superior de quem lançou (ou o Administrador) encerra.');
  if (!lcTravar()) return;
  const enc = { texto: t, porId: S.user.id, porNome: S.user.nome, ts: nowISO() };
  lcGrava([Data.col('sv2_cloro').update(r.id, { situacao: 'encerrado', encerramento: enc }).then(() => Audit.log({ acao: 'encerrar_cloro', entidade: 'cloro', entidadeId: r.id, resumo: 'Encerrou a verificação bloqueada de ' + r.pontoNome + ' (' + fmtD(r.data) + '): ' + t, antes: { situacao: r.situacao }, depois: { situacao: 'encerrado' } }))], 'Verificação encerrada.');
}

/* ---------- 24 h: lembrete 4 h antes (para quem lançou) e bloqueio com aviso ao superior ---------- */
let _clChecando = false;
async function clChecaBloqueios() {
  if (_clChecando || !S.user || DEMO && !S.cloro.length) return; _clChecando = true;
  try {
    for (const r of S.cloro) {
      if (r.situacao === 'aberto' && r.pontoTipo === 'beb' && !r.lembrete && !r.tratadoAprovId && clHoras(r.ts) >= CL_PRAZO_H - CL_LEMBRA_H && clHoras(r.ts) < CL_PRAZO_H && (r.lancadoPor === S.user.id || clPodeCuidar(r))) {
        r.lembrete = nowISO(); await Data.col('sv2_cloro').update(r.id, { lembrete: r.lembrete });
        Notif.send({ nivel: 'aviso', titulo: 'Cloro: ' + r.pontoNome + ' bloqueia em ' + Math.max(1, Math.ceil(CL_PRAZO_H - clHoras(r.ts))) + ' h', texto: 'Falta a nova verificação (' + ppm(clValorFinal(r)) + ' ppm em ' + fmtD(r.data) + ' ' + r.hora + '). Depois disso fica bloqueado e o superior é avisado.', para: [r.lancadoPor], refTipo: 'cloro', refId: r.id });
      }
      if (r.situacao !== 'aberto' || r.pontoTipo !== 'beb' || r.tratadoAprovId || clHoras(r.ts) < CL_PRAZO_H) continue;
      if (r.lancadoPor !== S.user.id && !clPodeCuidar(r)) continue;
      r.situacao = 'bloqueado'; await Data.col('sv2_cloro').update(r.id, { situacao: 'bloqueado', bloqueadoEm: nowISO() });
      const dono = userById(r.lancadoPor), para = dono ? supsOf(dono) : [];
      if (para.length) Notif.send({ nivel: 'aviso', titulo: 'Cloro: passou 24 h sem nova verificação', texto: r.pontoNome + ' (' + ppm(r.valor) + ' ppm em ' + fmtD(r.data) + ' ' + r.hora + '). Encerre ou peça o motivo a ' + r.lancadoPorNome + '.', para: para, refTipo: 'cloro', refId: r.id });
      Audit.log({ acao: 'cloro_bloqueado', entidade: 'cloro', entidadeId: r.id, resumo: 'Bloqueado por passar 24 h sem nova verificação: ' + r.pontoNome });
    }
  } catch (e) { console.warn('cloro 24 h', e && (e.code || e.message)); }
  _clChecando = false;
}
setInterval(() => { if (S.user && S.cloro.length) clChecaBloqueios(); }, 60000);

/* ---------- dias sem verificação: lançar depois (retroativa) ou justificar ---------- */
const clFaltaPartes = k => { const i = k.lastIndexOf('_'); return { bebId: k.slice(0, i), data: k.slice(i + 1) }; };
LC_FORM.clRetro = f => { const p = clFaltaPartes(f.key), b = S.bebs.find(x => x.id === p.bebId); if (!b) return null;
  return { ico: 'relogio', sub: clBebNome(b) + ' · ' + clDiaSem(p.data), titulo: 'Verificação de ' + fmtD(p.data) + ' (lançada depois)',
    corpo: lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Hora da verificação', '<input class="fm-i" type="time" data-fm="hora" value="' + esc(f.hora || '') + '">') + lcBl('Cloro livre (ppm)', lcIn('valor', f.valor, ' inputmode="decimal" placeholder="0,00"')) + '</div>' + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')) +
      lcAv(isSup(S.user) ? 'Fica registrada como retroativa e o Principal é avisado.' : 'Vai para aprovação do Líder ★ ou do Principal; só entra na lista depois de aprovada.'), rodape: lcPe('cl-retro-ok', isSup(S.user) ? 'Lançar' : 'Pedir aprovação') }; };
LC_FORM.clJust = f => { const p = clFaltaPartes(f.key), b = S.bebs.find(x => x.id === p.bebId); if (!b) return null;
  return { ico: 'relogio', sub: clBebNome(b) + ' · ' + clDiaSem(p.data), titulo: 'Justificar ' + fmtD(p.data),
    corpo: lcMsg() + lcBl('Por que não foi verificado', lcTx('motivo', f.motivo, 'ex.: bebedouro sem água nesse dia; feriado; coletor de atestado')) + lcAv(isSup(S.user) ? 'Fica registrada e o Principal é avisado.' : 'Vai para aprovação do Líder ★ ou do Principal.'), rodape: lcPe('cl-just-ok', isSup(S.user) ? 'Justificar' : 'Pedir aprovação') }; };
function clAvisaPrincipal(titulo, texto) { const p = S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== S.user.id).map(x => x.id); if (p.length) Notif.send({ nivel: 'info', titulo: titulo, texto: texto, para: p, refTipo: 'cloro', refId: '' }).catch(() => {}); }
async function clGravaRetro(rec, aprov) {
  const r = Object.assign({}, rec, aprov ? { aprovadoPor: S.user.nome, aprovId: aprov.id } : {});
  const id = await Data.col('sv2_cloro').add(r);
  Audit.log({ acao: 'cloro_retro', entidade: 'cloro', entidadeId: id, resumo: 'Verificação retroativa ' + r.pontoNome + ' de ' + fmtD(r.data) + ' ' + r.hora + ': ' + ppm(r.valor) + (aprov ? ' (pedido de ' + aprov.solicitanteNome + ')' : ''), depois: { data: r.data, hora: r.hora, valor: r.valor }, autorizadoPor: aprov ? { id: S.user.id, nome: S.user.nome } : '' });
  if (!isPrincipal(S.user)) clAvisaPrincipal('Verificação de cloro retroativa', r.pontoNome + ' · ' + fmtD(r.data) + ' ' + r.hora + ' · ' + ppm(r.valor) + ' — lançada por ' + (aprov ? aprov.solicitanteNome + ', aprovada por ' + S.user.nome : S.user.nome));
  return id;
}
async function clGravaJust(key, doc, aprov) {
  const d = Object.assign({}, doc, { aprovadoPor: S.user.nome, aprovadoEm: nowISO(), aprovId: aprov ? aprov.id : '' });
  await Data.col('sv2_cloro_falta').set(key, d);
  Audit.log({ acao: 'cloro_justificativa', entidade: 'cloro', entidadeId: key, resumo: 'Dia sem verificação justificado: ' + d.codigo + ' em ' + fmtD(d.data) + ' — ' + d.motivo + (aprov ? ' (pedido de ' + aprov.solicitanteNome + ')' : ''), depois: { data: d.data, motivo: d.motivo }, autorizadoPor: aprov ? { id: S.user.id, nome: S.user.nome } : '' });
  if (!isPrincipal(S.user)) clAvisaPrincipal('Dia sem verificação de cloro justificado', d.codigo + ' · ' + fmtD(d.data) + ' — ' + d.motivo + ' · por ' + (aprov ? aprov.solicitanteNome + ', aprovado por ' + S.user.nome : S.user.nome));
}
APROV_APLICA.cloro_retro = (p, a) => clGravaRetro(p.rec, a);
APROV_APLICA.cloro_just = (p, a) => clGravaJust(p.key, p.doc, a);
async function clRetroOk() {
  const f = S.fm; if (!f) return; const p = clFaltaPartes(f.key), b = S.bebs.find(x => x.id === p.bebId); if (!b) return;
  const hora = String(f.hora || ''), v = clNum(f.valor), obs = String(f.obs || '').trim();
  if (!/^\d{2}:\d{2}$/.test(hora)) return lcErro('Informe a hora da verificação.');
  if (isNaN(v) || v < 0 || v > 20) return lcErro('Digite o valor do cloro em ppm (ex.: 0,55).');
  if (clFaltaPend(f.key)) return lcErro('Já existe um pedido para este dia.');
  const fx = clFaixa(v);
  const rec = { ts: new Date(p.data + 'T' + hora + ':00').toISOString(), data: p.data, hora: hora, pontoTipo: 'beb', pontoId: b.id, pontoNome: b.codigo, local: b.local || '', valor: v, faixa: fx, reverif: [], dosagemPendente: null, motivoAplicacao: '', situacao: 'ok', bloqueadoEm: '', pedidoMotivo: null, motivoResposta: null, encerramento: null,
    tratado: null, tratadoAprovId: '', excluirMedia: false, pendenteCadastro: false, medidoPor: '', obs: (fx !== 'conforme' ? '[fora da faixa no dia; lançada depois] ' : '') + obs, lancadoPor: S.user.id, lancadoPorNome: S.user.nome, retroativo: true, lancadoEm: nowISO() };
  if (!lcTravar()) return;
  if (isSup(S.user)) { lcGrava([clGravaRetro(rec, null)], 'Verificação de ' + fmtD(p.data) + ' lançada.'); return; }
  const aid = await Aprov.pedir({ tipo: 'cloro_retro', titulo: 'Verificação de cloro retroativa: ' + b.codigo + ' de ' + fmtD(p.data), descricao: clDiaSem(p.data) + ' às ' + hora + ' · ' + ppm(v) + (obs ? ' · ' + obs : ''), refTipo: 'bebedouro', refId: b.id, payload: { key: f.key, rec: rec }, para: clParaCorrecao(S.user) });
  if (!aid) { f._trava = 0; return; } lcFim(); aviso('Pedido enviado ao Líder ★ / Principal.');
}
async function clJustOk() {
  const f = S.fm; if (!f) return; const p = clFaltaPartes(f.key), b = S.bebs.find(x => x.id === p.bebId); if (!b) return;
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Explique o motivo (pelo menos algumas palavras).');
  if (clFaltaPend(f.key)) return lcErro('Já existe um pedido para este dia.');
  const doc = { bebId: b.id, codigo: b.codigo, local: b.local || '', data: p.data, motivo: mot, por: S.user.id, porNome: S.user.nome, ts: nowISO() };
  if (!lcTravar()) return;
  if (isSup(S.user)) { lcGrava([clGravaJust(f.key, doc, null)], 'Justificado.'); return; }
  const aid = await Aprov.pedir({ tipo: 'cloro_just', titulo: 'Justificar dia sem verificação: ' + b.codigo + ' em ' + fmtD(p.data), descricao: mot, refTipo: 'bebedouro', refId: b.id, payload: { key: f.key, doc: doc }, para: clParaCorrecao(S.user) });
  if (!aid) { f._trava = 0; return; } lcFim(); aviso('Pedido enviado ao Líder ★ / Principal.');
}

/* ---------- pedir correção (Principal corrige direto, com motivo; o antes fica no histórico) ---------- */
function clUltLeitura(r) { const rv = r.reverif || []; for (let i = rv.length - 1; i >= 0; i--) if (!rv[i].semLeitura && rv[i].valor != null) return i; return -1; }
function clUltDose(r) { const rv = r.reverif || []; for (let i = rv.length - 1; i >= 0; i--) if (rv[i].dosagemMl != null) return i; return -1; }
function clCorrAtual(r) {
  const o = { data: r.data || '', hora: r.hora || '', medidoPor: r.medidoPor || '', valor: r.valor, motivoAplicacao: r.motivoAplicacao || '', obs: r.obs || '' }, il = clUltLeitura(r), id = clUltDose(r);
  if (il >= 0) o.valorApos = r.reverif[il].valor; if (id >= 0) o.dosagemUlt = r.reverif[id].dosagemMl; return o;
}
const clValTxt = (k, v) => v == null || v === '' ? '(vazio)' : k === 'data' ? fmtD(v) : (k === 'valor' || k === 'valorApos') ? ppm(v) + ' ppm' : k === 'dosagemUlt' ? clMl(v) + ' ml' : String(v);
function clCorrTxt(p) { return Object.keys(p.depois || {}).map(k => (CL_CORR_CAMPOS[k] || k) + ': ' + clValTxt(k, (p.antes || {})[k]) + ' → ' + clValTxt(k, p.depois[k])).join('; ') || 'ajuste'; }
LC_FORM.clCorr = f => {
  const r = S.cloro.find(x => x.id === f.id); if (!r) return null;
  const a = clCorrAtual(r), prin = isPrincipal(S.user), num = k => lcIn(k, f[k], ' inputmode="decimal"');
  let c = lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Data', lcData('data', f.data)) + lcBl('Hora', '<input class="fm-i" type="time" data-fm="hora" value="' + esc(f.hora || '') + '">') + lcBl('Cloro (ppm)', num('valor')) + (a.valorApos != null ? lcBl('Cloro depois (ppm)', num('valorApos')) : '') + (a.dosagemUlt != null ? lcBl('Dosagem (ml)', num('dosagemUlt')) : '') + lcBl('Medido por', lcIn('medidoPor', f.medidoPor)) + '</div>' +
    lcBl('Motivo da aplicação', lcIn('motivoAplicacao', f.motivoAplicacao)) + lcBl('Observação', lcIn('obs', f.obs)) + lcBl('Motivo da correção', lcTx('motivo', f.motivo, 'ex.: digitei 0,1 no lugar de 1,0')) +
    lcAv(prin ? 'Como Principal, a correção vale na hora e fica registrada com o seu nome. O antes fica no histórico.' : 'Vai para: ' + esc(clParaCorrecao(S.user).map(nomeDe).join(', ') || 'ninguém cadastrado') + '. Só muda depois de aprovada. O antes fica no histórico.');
  return { ico: 'lapis', sub: r.pontoNome + ' · ' + fmtD(r.data) + ' ' + (r.hora || ''), titulo: prin ? 'Corrigir verificação' : 'Pedir correção', corpo: c, rodape: lcPe('cl-corr-ok', prin ? 'Corrigir' : 'Enviar pedido') };
};
function clCorrLer(r, f) {
  const a = clCorrAtual(r), antes = {}, depois = {}, nums = ['valor', 'valorApos', 'dosagemUlt'];
  Object.keys(CL_CORR_CAMPOS).forEach(k => {
    if (!(k in a)) return; let v = String(f[k] == null ? '' : f[k]).trim();
    if (nums.indexOf(k) >= 0) { if (v === '') return; v = clNum(v); if (!isFinite(v) || v < 0) throw new Error('Valor inválido em ' + CL_CORR_CAMPOS[k] + '.'); if (k !== 'dosagemUlt' && v > 20) throw new Error('Cloro acima de 20 ppm: confira o número.'); }
    if (String(a[k] == null ? '' : a[k]) !== String(v)) { antes[k] = a[k] == null ? '' : a[k]; depois[k] = v; }
  });
  if (depois.data && depois.data > hojeISO()) throw new Error('A data não pode ser futura.');
  return { antes: antes, depois: depois };
}
async function clCorrAplicar(id, p, aprov) {
  const r = S.cloro.find(x => x.id === id); if (!r) throw new Error('Verificação não encontrada.');
  const at = clCorrAtual(r), igual = (a, b) => String(a == null ? '' : a) === String(b == null ? '' : b);
  if (Object.keys(p.antes || {}).some(k => !igual(at[k], p.antes[k]))) throw new Error('A verificação mudou depois do pedido. Peça a correção de novo.');
  const up = {}, rv = (r.reverif || []).map(x => Object.assign({}, x));
  Object.keys(p.depois).forEach(k => { if (k === 'valorApos') { const i = clUltLeitura(r); if (i >= 0) rv[i].valor = p.depois[k]; } else if (k === 'dosagemUlt') { const i = clUltDose(r); if (i >= 0) rv[i].dosagemMl = p.depois[k]; } else up[k] = p.depois[k]; });
  if ('valorApos' in p.depois || 'dosagemUlt' in p.depois) up.reverif = rv;
  if ('valor' in p.depois && r.pontoTipo !== 'caixa') up.faixa = clFaixa(p.depois.valor);
  const h = (r.historico || []).slice(); h.push({ ts: nowISO(), antes: p.antes, depois: p.depois, motivo: p.motivo, pedidoPor: aprov ? aprov.solicitanteNome : S.user.nome, aprovadoPor: S.user.nome, aprovId: aprov ? aprov.id : '' });
  await Data.col('sv2_cloro').update(id, Object.assign(up, { alterado: true, historico: h }));
  Audit.log({ acao: 'corrigir_cloro', entidade: 'cloro', entidadeId: id, resumo: 'Verificação de cloro corrigida: ' + (p.rotulo || r.pontoNome) + ' — ' + clCorrTxt(p) + (aprov ? ' (pedido de ' + aprov.solicitanteNome + ')' : '') + ' · motivo: ' + p.motivo, antes: p.antes, depois: p.depois, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
}
APROV_APLICA.corrigir_cloro = (p, a) => clCorrAplicar(a.refId, p, a);
async function clCorrOk() {
  const f = S.fm, r = f && S.cloro.find(x => x.id === f.id); if (!r) return;
  let p; try { p = clCorrLer(r, f); } catch (e) { return lcErro(e.message); }
  if (!Object.keys(p.depois).length) return lcErro('Nada mudou. Altere algum campo.');
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo da correção.');
  if (clCorrPend(r.id)) return lcErro('Já existe um pedido de correção para esta verificação.');
  p.motivo = mot; p.rotulo = r.pontoNome + ' · ' + fmtD(r.data) + ' ' + (r.hora || '');
  if (!lcTravar()) return;
  if (isPrincipal(S.user)) { lcGrava([clCorrAplicar(r.id, p, null)], 'Verificação corrigida.'); return; }
  const aid = await Aprov.pedir({ tipo: 'corrigir_cloro', titulo: 'Corrigir verificação de cloro: ' + p.rotulo, descricao: clCorrTxt(p) + '\nMotivo: ' + mot, refTipo: 'cloro', refId: r.id, payload: p, para: clParaCorrecao(S.user) });
  if (!aid) { f._trava = 0; return; } lcFim(); aviso('Pedido de correção enviado.');
}

/* ---------- bebedouros (lista, situação, liberar/recusar o digitado na hora) ---------- */
function clBebsAbre() {
  gvAbrir(() => {
    const l = S.bebs.slice().sort((a, b) => cmpTxt(a.codigo, b.codigo)), sup = clPodeCad();
    const c = '<div class="cl-bl">' + l.map(b => { const s = CL_SIT_BEB[b.situacao] || [b.situacao || '', ''], ult = S.cloro.filter(r => r.pontoId === b.id).sort((x, y) => String(y.ts).localeCompare(String(x.ts)))[0];
      return '<div class="cl-bi"><span class="tx"><b>' + esc(b.codigo) + '</b><small>' + esc(b.local || 'sem local') + (b.descricao ? ' · ' + esc(b.descricao) : '') + (ult ? ' · última: ' + esc(fmtD(ult.data)) + ' ' + ppm(clValorFinal(ult)) + ' ppm' : '') + '</small></span>' + '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>' +
        (sup && b.situacao === 'pendente' ? '<button type="button" class="bt" data-act="cl-beb-rec" data-id="' + esc(b.id) + '">Recusar</button><button type="button" class="bt pr" data-act="cl-beb-lib" data-id="' + esc(b.id) + '">Liberar</button>' : '') + '</div>'; }).join('') + '</div>' +
      lcAv('Para mudar a situação (manutenção, sem verificação) ou editar um bebedouro, use o EFClaudian por enquanto. Bebedouro novo: escolha “+ Bebedouro fora da lista” na Nova verificação.');
    return { ico: 'lista', sub: l.filter(b => b.situacao === 'ativo').length + ' ativos de ' + l.length, titulo: 'Bebedouros', corpo: c };
  });
  render();
}
async function clBebLibera(bid) {
  await Data.col('sv2_bebs').update(bid, { situacao: 'ativo', ativoDesde: nowISO() });
  for (const r of S.cloro.filter(x => x.pontoId === bid && x.pendenteCadastro)) await Data.col('sv2_cloro').update(r.id, { pendenteCadastro: false });
}
APROV_APLICA.novo_bebedouro = (p, a) => clBebLibera(p.bebId);
function clBebDecide(bid, ok) {
  const b = S.bebs.find(x => x.id === bid); if (!b || !clPodeCad()) return;
  const faz = async motivo => {
    try {
      if (ok) await clBebLibera(bid); else await Data.col('sv2_bebs').update(bid, { situacao: 'recusado' });
      const pp = (S.aprov || []).find(x => x.tipo === 'novo_bebedouro' && x.status === 'pendente' && x.payload && x.payload.bebId === bid);
      if (pp && Aprov.podeDecidir(pp)) await Data.col('sv2_aprov').update(pp.id, { status: ok ? 'aprovado' : 'reprovado', decisao: { por: S.user.id, nome: S.user.nome, perfil: S.user.perfil, ts: nowISO(), motivo: motivo || 'Liberado na tela do cloro' } });
      if (b.criadoPor && b.criadoPor !== S.user.id) Notif.send({ nivel: ok ? 'info' : 'aviso', titulo: ok ? 'Bebedouro liberado: ' + b.codigo : 'Bebedouro recusado: ' + b.codigo, texto: S.user.nome + (ok ? ' liberou o cadastro; as leituras já contam.' : ' recusou o cadastro' + (motivo ? ': ' + motivo : '.')), para: [b.criadoPor], refTipo: 'bebedouro', refId: bid }).catch(() => {});
      Audit.log({ acao: ok ? 'liberar_bebedouro' : 'recusar_bebedouro', entidade: 'bebedouro', entidadeId: bid, resumo: (ok ? 'Liberou' : 'Recusou') + ' o bebedouro ' + clBebNome(b) + (motivo ? ' — ' + motivo : ''), antes: { situacao: b.situacao }, depois: { situacao: ok ? 'ativo' : 'recusado' } });
      aviso(ok ? 'Bebedouro liberado.' : 'Cadastro recusado.');
    } catch (e) { aviso(svErro(e), 'erro'); }
  };
  if (ok) csConfirma({ titulo: 'Liberar ' + b.codigo + '?', texto: clBebNome(b) + ' entra na lista de bebedouros ativos e as leituras já feitas passam a contar.', sim: 'Liberar', nao: 'Cancelar' }, () => faz(''));
  else csConfirma({ titulo: 'Recusar ' + b.codigo + '?', texto: 'O cadastro fica recusado (nada é apagado). Quem digitou é avisado.', sim: 'Recusar', nao: 'Cancelar' }, () => faz('Recusado na tela do cloro'));
}

/* ---------- escolher os locais dos velocímetros (com mais de 5) ---------- */
function clLocaisAbre() {
  gvAbrir(() => {
    const todos = clLocais(), vis = clLocaisVisiveis();
    return { ico: 'colunas', sub: 'Até ' + CL_GAUGES + ' velocímetros', titulo: 'Escolher locais',
      corpo: '<div class="cl-lc">' + todos.map(l => { const on = vis.indexOf(l) >= 0, e = clEstadoLocal(l); return '<label class="tb-ck"><input type="checkbox" data-cllocal="' + esc(l) + '"' + (on ? ' checked' : '') + (!on && vis.length >= CL_GAUGES ? ' disabled' : '') + '> ' + esc(l) + ' <small>' + ppm(e.media) + ' ppm</small></label>'; }).join('') + '</div>' + lcAv('Marque até ' + CL_GAUGES + '. A escolha fica gravada neste aparelho.') };
  });
  render();
}
document.addEventListener('change', e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-cllocal')) return;
  let vis = clLocaisVisiveis().slice(); const l = t.getAttribute('data-cllocal');
  if (t.checked) { if (vis.indexOf(l) < 0) vis.push(l); } else vis = vis.filter(x => x !== l);
  if (!vis.length) { t.checked = true; aviso('Deixe pelo menos um local.'); return; }
  Store.set('cw-cl-locais', JSON.stringify(vis.slice(0, CL_GAUGES))); render();
});

/* ---------- cliques ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="cl-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'cl-abre') clAbre(id);
  else if (a === 'cl-nova') { if (podeLancar(S.user)) lcAbrir({ k: 'clNova', ponto: clProxSug(), valor: '', dos: '', v2: '', mot: '', med: '', obs: '', fiz: '0', foto: '', semFoto: '' }); }
  else if (a === 'cl-nova-ok') clNovaOk();
  else if (a === 'cl-rv') clRvAbrir(id, t.getAttribute('data-m'));
  else if (a === 'cl-rv-ok') clRvOk();
  else if (a === 'cl-enc') { if (podeLancar(S.user)) lcAbrir({ k: 'clEnc', id: id, texto: '' }, () => clAbre(id)); }
  else if (a === 'cl-enc-ok') clEncOk();
  else if (a === 'cl-retro') lcAbrir({ k: 'clRetro', key: id, hora: '', valor: '', obs: '' });
  else if (a === 'cl-retro-ok') clRetroOk();
  else if (a === 'cl-just') lcAbrir({ k: 'clJust', key: id, motivo: '' });
  else if (a === 'cl-just-ok') clJustOk();
  else if (a === 'cl-corr') { const r = S.cloro.find(x => x.id === id); if (r && clPodeCorrigir(r)) { const at = clCorrAtual(r); lcAbrir(Object.assign({ k: 'clCorr', id: id, motivo: '' }, at, { valor: clMl(at.valor), valorApos: at.valorApos == null ? '' : clMl(at.valorApos), dosagemUlt: at.dosagemUlt == null ? '' : clMl(at.dosagemUlt) }), () => clAbre(id)); } }
  else if (a === 'cl-corr-ok') clCorrOk();
  else if (a === 'cl-bebs') clBebsAbre();
  else if (a === 'cl-beb-lib') clBebDecide(id, true);
  else if (a === 'cl-beb-rec') clBebDecide(id, false);
  else if (a === 'cl-locais') clLocaisAbre();
  else if (a === 'cl-foto-x') { if (S.fm) { S.fm.foto = ''; S.fm.sujo = true; gvDesenha(true); } }
  else if (a === 'cl-foto-ver') clFotoVer(id);
  else if (a === 'cl-fv-x') csVolta();
});

/* busca geral: bebedouros (abre a última verificação) */
BG_FONTES.push(q => S.bebs.filter(b => bgCasa(q, [b.codigo, b.local, 'bebedouro cloro'].join(' '))).slice(0, 6).map(b => {
  const ult = S.cloro.filter(r => r.pontoId === b.id).sort((x, y) => String(y.ts).localeCompare(String(x.ts)))[0];
  return { grupo: 'Bebedouros', nome: clBebNome(b), sub: ult ? 'última: ' + fmtD(ult.data) + ' · ' + ppm(clValorFinal(ult)) + ' ppm' : (CL_SIT_BEB[b.situacao] || [''])[0], ico: 'lista',
    abrir: () => { if (S.rota.area !== 'inspecoes' || S.rota.aba !== 'cloro') { S._gvNav = !!ult; ir('inspecoes', 'cloro'); } if (ult) clAbre(ult.id); } };
}));
