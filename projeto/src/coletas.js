/* EFCwork · coletas.js — COLETAS (v0.4.0). Prefixo: co.
   Amostras de campo (Solo, Nematoide, Folha, Fruta, Composto) numa tabela só, com o material no filtro; o CICLO de cada amostra na gaveta
   com o fluido Gota (Programada → Coletada → Enviada → O.S → Laudo / Compra, laudo e compra na ordem em que aconteceram); remessas na aba
   Envio, com NF do pacote, cupom dos Correios (foto) e código de rastreio, que podem ser anexados a qualquer momento; prazo do laboratório
   com aviso de atraso. Pedidos aprovados no rework (05/11 20:35).
   Lê e grava no MESMO formato do EFClaudian v2.102.59 (sv2_coletas, sv2_prog, sv2_cfg/coletas, sv2_aprov tipos envio_retro e corrigir_os).
   Campos novos (o EFClaudian ignora): rastreio, cupomFoto (id em sv2_fotos, com refTipo 'coleta_envio').
   Fica no EFClaudian nesta versão: lançar coleta nova (Coletado), programação, plano de coleta, água, cadastros, fichas e etiquetas. */
Object.assign(S, { coletas: [], prog: [], colCarregado: false, cfgCol: S.cfgCol || null });
const CO_MAT = [['SOLO', 'Solo'], ['NEMATOIDE', 'Nematoide'], ['FOLHA', 'Folha'], ['FRUTA', 'Fruta'], ['COMPOSTO', 'Composto']];
const CO_TXT = { SOLO: 'Solo', NEMATOIDE: 'Nematoide', FOLHA: 'Folha', FRUTA: 'Fruta', COMPOSTO: 'Composto', AGUA: 'Água' };
const CO_LAUDO_PADRAO = 7, CO_FOLGA = 5, CO_ENVIO_FRENTE = 30; /* iguais ao EFClaudian (LAUDO_PRAZO_PADRAO, LAUDO_FOLGA, ENVIO_DIAS_FRENTE) */
const CO_RASTREIO_URL = 'https://rastreamento.correios.com.br/app/index.php';
const coVe = () => typeof temAtrib === 'function' && temAtrib(S.user, 'coletas');
const coPode = () => coVe() && podeLancar(S.user);
const coDif = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);

/* ---------- carregar ---------- */
CS_CARGAS.push(() => {
  if (!coVe()) return;
  const re = () => { S.colCarregado = true; if (S.rota.area === 'coletas' || S.rota.area === 'inicio') render(); };
  csOuve('sv2_coletas', l => { S.coletas = l; re(); });
  csOuve('sv2_prog', l => { S.prog = l; re(); });
});

/* ---------- cálculos (EFClaudian v2.102.59) ---------- */
const coAtivas = () => S.coletas.filter(c => c.situacao !== 'cancelada' && CO_TXT[c.tipo] && c.tipo !== 'AGUA');
const coLabPrazo = lab => { const v = Number((((S.cfgCol || {}).labPrazo) || {})[lab]); return v > 0 ? v : CO_LAUDO_PADRAO; };
const coLaudoLimite = c => coLabPrazo(c.lab) + CO_FOLGA;
const coEncerrada = c => !!c && c.situacao !== 'cancelada' && c.compra === 'solicitado';
const coRetroPend = id => S.aprov.some(a => a.tipo === 'envio_retro' && a.status === 'pendente' && a.payload && (a.payload.itens || []).some(x => x.id === id));
const coOsPend = id => S.aprov.some(a => a.tipo === 'corrigir_os' && a.status === 'pendente' && a.payload && !a.payload.agua && (a.payload.ids || []).indexOf(id) >= 0);
function coLaudoSit(c) { if (c.situacao === 'cancelada' || !c.enviado) return '—'; if (c.laudo) return 'Baixado'; return c.envio && coDif(c.envio, hojeISO()) > coLaudoLimite(c) && !(c.prazoLaudoAte && c.prazoLaudoAte >= hojeISO()) ? 'Atrasado' : 'Pendente'; }
const coPrevisto = c => c.envio ? addDias(c.envio, coLabPrazo(c.lab)) : '';
const coNome = c => c.talhao || c.loteComp || c.identificacao || '—';
const coLabs = () => { const cf = S.cfgCol || {}, at = cf.labAtivo || {}, l = (cf.labs || []).filter(x => at[x] !== false); const usados = Array.from(new Set(S.coletas.map(c => c.lab).filter(Boolean))); return Array.from(new Set(l.concat(l.length ? [] : usados))).sort(); };
function coSit(c) {
  if (c.situacao === 'cancelada') return { id: 'cancelada', txt: 'Cancelada', cor: '' };
  if (coEncerrada(c)) return { id: 'encerrada', txt: 'Encerrada', cor: 'ok' };
  if (!c.enviado) return coRetroPend(c.id) ? { id: 'naoenv', txt: 'Envio aguardando confirmação', cor: 'wa' } : { id: 'naoenv', txt: 'Não enviada', cor: 'wa' };
  if (c.laudo) return { id: 'laudo', txt: 'Laudo baixado', cor: '' };
  return coLaudoSit(c) === 'Atrasado' ? { id: 'atrasado', txt: 'Laudo atrasado', cor: 'cr' } : { id: 'aguarda', txt: 'Aguardando laudo', cor: '' };
}
/* remessa = enviadas no mesmo dia para o mesmo laboratório (como no EFClaudian) */
const coLoteK = c => c.enviado && c.envio ? c.envio + '|' + (c.lab || '') : '';
const coLote = k => coAtivas().filter(c => coLoteK(c) === k);

/* ---------- o ciclo da amostra ---------- */
function coEtapas(c) {
  const p = c.progId ? S.prog.find(x => x.id === c.progId) : null, rp = coRetroPend(c.id), ls = coLaudoSit(c), e = [];
  if (p) e.push({ nome: 'Programada', feito: true, data: p.data || '', txt: [p.coletor ? 'para ' + p.coletor : '', p.prazo ? 'prazo ' + fmtD(p.prazo) : ''].filter(Boolean).join(' · '), quem: p.criadoPorNome });
  e.push({ nome: 'Coletada', feito: true, data: c.data || '', txt: [c.pontos ? c.pontos + ' pontos' : '', c.prof, c.estadio, c.coletor ? 'coletor ' + c.coletor : ''].filter(Boolean).join(' · '), quem: c.criadoPorNome });
  e.push({ nome: 'Enviada', feito: !!c.enviado, parcial: !c.enviado && rp, data: c.envio || '', txt: c.enviado ? [c.lab, c.nfEnvio ? 'NF ' + c.nfEnvio : '', c.rastreio ? 'rastreio ' + c.rastreio : ''].filter(Boolean).join(' · ') : rp ? 'data retroativa aguardando confirmação' : '' });
  e.push({ nome: 'O.S', feito: !!c.os, txt: c.os ? 'O.S ' + c.os : c.enviado ? 'o laboratório ainda não mandou' : '' });
  const laudo = { nome: 'Laudo', feito: !!c.laudo, data: String(c.laudoEm || '').slice(0, 10), txt: c.laudo ? '' : c.enviado ? 'previsto até ' + fmtD(coPrevisto(c)) + ' (' + coLabPrazo(c.lab) + ' dias do laboratório)' : '', quem: c.laudoPor, alerta: !c.laudo && ls === 'Atrasado' ? 'atrasado: passou de ' + coLaudoLimite(c) + ' dias do envio' : '' };
  const compra = { nome: 'Compra do serviço', feito: c.compra === 'solicitado', data: c.dataSolicitacao || '', txt: c.pedidoSankhya ? 'Nº ' + c.pedidoSankhya : '', quem: c.solicitadoPorNome };
  /* laudo e compra na ordem em que aconteceram */
  e.push.apply(e, compra.feito && (!laudo.feito || String(compra.data) < String(laudo.data)) ? [compra, laudo] : [laudo, compra]);
  if (c.situacao !== 'cancelada') { const at = e.find(x => !x.feito); if (at) at.atual = true; }
  return e;
}

/* ======================= telas ======================= */
function coResumo() { const a = coAtivas(), s = a.map(coSit); return { a: a, naoenv: s.filter(x => x.id === 'naoenv').length, aguarda: s.filter(x => x.id === 'aguarda').length, atras: s.filter(x => x.id === 'atrasado').length }; }
TELAS.coletas = function (aba) {
  if (!coVe()) return cabecalho({ titulo: 'Coletas' }) + '<section class="pn"><div class="vazio">' + ic('frasco') + '<b>Você não tem acesso às Coletas.</b><span>Peça ao administrador para marcar a atribuição Coletas no seu cadastro.</span></div></section>';
  const ar = csArea('coletas'), t = ar.abas.find(x => x.id === aba) || ar.abas[0], r = coResumo();
  const ext = '<a class="bt ic-so" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener" title="No EFClaudian: nova programação, planos de coleta, água, fichas e etiquetas" aria-label="Abrir o EFClaudian (nova programação, planos de coleta, água, fichas e etiquetas)">' + ic('externo') + '</a>';
  const pl = (n, um, mais) => n + ' ' + (n === 1 ? um : mais);
  const meta = [r.naoenv ? metaPl(pl(r.naoenv, 'não enviada', 'não enviadas'), 'wa') : '', r.aguarda ? '<span>' + r.aguarda + ' aguardando laudo</span>' : '', r.atras ? metaPl(pl(r.atras, 'laudo atrasado', 'laudos atrasados'), 'cr', 'alerta') : ''].filter(Boolean);
  const acoes = (coPode() && r.naoenv ? '<button type="button" class="bt pr" data-act="co-env">' + ic('sai') + 'Enviar</button>' : '') + ext;
  if (t.id === 'cadastros') return cabecalho({ titulo: t.nome, abaNome: t.nome, meta: [metaPl('chega numa próxima versão', 'wa', 'relogio')], acoes: '<a class="bt pr" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">' + ic('externo') + 'Usar no EFClaudian</a>' }) +
    '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Talhões, análises, laboratórios e prazos continuam no EFClaudian por enquanto.</b><span>Os dados são os mesmos: o que for lançado lá aparece aqui na hora.</span></div></section>';
  if (t.id === 'programacao') { /* v0.4.4 (programacao.js) */
    const np = pgPendentes().filter(p => p.data).length;
    const h2 = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: [np ? metaPl(pl(np, 'programada a coletar', 'programadas a coletar'), 'wa') : '', '<span>Nova programação e planos de coleta: no EFClaudian</span>'].filter(Boolean), acoes: pgAcoes() });
    if (!S.colCarregado && !DEMO) return h2 + '<section class="pn"><div class="vazio">' + ic('relogio') + '<b>Carregando a programação…</b></div></section>';
    return h2 + pgTela();
  }
  let h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: meta, acoes: acoes });
  if (!S.colCarregado && !DEMO) return h + '<section class="pn"><div class="vazio">' + ic('relogio') + '<b>Carregando as amostras…</b></div></section>';
  return h + (t.id === 'envio' ? coTabRemessas() : coTabAmostras());
};
function coTabAmostras() {
  const l = S.coletas.filter(c => CO_TXT[c.tipo] && c.tipo !== 'AGUA').sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')) || cmpTxt(coNome(a), coNome(b)));
  const SITS = [['naoenv', 'Não enviadas'], ['aguarda', 'Aguardando laudo'], ['atrasado', 'Laudo atrasado'], ['laudo', 'Laudo baixado'], ['encerrada', 'Encerradas'], ['cancelada', 'Canceladas'], ['abertas', 'Em aberto (não encerradas)']];
  return tbHTML({ id: 'co-am', titulo: 'Amostras', unidade: 'amostras', linhas: l, aoClicar: coAbre, selecionado: S._coSel, buscaDica: 'Buscar talhão, análise, laboratório, O.S ou NF',
    busca: c => [coNome(c), c.analiseNome, c.sigla, c.lab, c.os, c.nfEnvio, c.rastreio, c.pedidoSankhya, c.coletor].join(' '),
    filtros: [
      { k: 'mat', rot: 'Material', opcoes: CO_MAT, teste: (c, v) => c.tipo === v },
      { k: 'sit', rot: 'Situação', opcoes: SITS, teste: (c, v) => v === 'abertas' ? ['encerrada', 'cancelada'].indexOf(coSit(c).id) < 0 : coSit(c).id === v },
      { k: 'lab', rot: 'Laboratório', opcoes: Array.from(new Set(l.map(c => c.lab).filter(Boolean))).sort().map(x => [x, x]), teste: (c, v) => c.lab === v }],
    cols: [
      { k: 'data', rot: 'Coleta', tipo: 'data', v: c => c.data || '' },
      { k: 'mat', rot: 'Material', v: c => CO_TXT[c.tipo] || c.tipo },
      { k: 'nome', rot: 'Talhão / lote', fixa: true, v: coNome, cls: 'forte' },
      { k: 'an', rot: 'Análise', v: c => c.sigla || c.analiseNome || '' },
      { k: 'lab', rot: 'Laboratório', v: c => c.lab || '' },
      { k: 'env', rot: 'Envio', tipo: 'data', v: c => c.enviado ? c.envio || '' : '' },
      { k: 'os', rot: 'O.S', v: c => c.os || '' },
      { k: 'laudo', rot: 'Laudo', v: c => coLaudoSit(c) === '—' ? '' : coLaudoSit(c), html: c => { const s = coLaudoSit(c); return s === '—' ? '' : alPill(s, s === 'Atrasado' ? 'cr' : s === 'Baixado' ? 'ok' : ''); } },
      { k: 'val', rot: 'Valor', tipo: 'num', v: c => Number(c.valor) || 0, html: c => esc(brl(c.valor)), total: 'soma', fmtTotal: brl },
      { k: 'sit', rot: 'Situação', v: c => coSit(c).txt, html: c => { const s = coSit(c); return alPill(s.txt, s.cor); } }] });
}
const cmpTxt = (a, b) => String(a || '').localeCompare(String(b || ''), 'pt-BR', { numeric: true });
function coRemessas() {
  const g = {}; coAtivas().forEach(c => { const k = coLoteK(c); if (k) (g[k] = g[k] || []).push(c); });
  return Object.keys(g).map(k => { const l = g[k], c0 = l[0], os = Array.from(new Set(l.map(c => c.os).filter(Boolean))), lau = l.filter(c => c.laudo).length, at = l.some(c => coLaudoSit(c) === 'Atrasado');
    return { id: k, envio: c0.envio, lab: c0.lab || '', l: l, n: l.length, mats: Array.from(new Set(l.map(c => CO_TXT[c.tipo]))).join(', '), os: os.join(', '), nf: Array.from(new Set(l.map(c => c.nfEnvio).filter(Boolean))).join(', '), rastreio: Array.from(new Set(l.map(c => c.rastreio).filter(Boolean))).join(', '), cupom: l.some(c => c.cupomFoto), lau: lau, at: at, prev: coPrevisto(c0) }; })
    .sort((a, b) => String(b.envio).localeCompare(String(a.envio)) || cmpTxt(a.lab, b.lab));
}
function coTabRemessas() {
  return tbHTML({ id: 'co-rem', titulo: 'Remessas', unidade: 'remessas', linhas: coRemessas(), aoClicar: coAbreLote, selecionado: S._coSel, buscaDica: 'Buscar laboratório, O.S, NF ou rastreio',
    busca: r => [r.lab, r.os, r.nf, r.rastreio, r.mats].join(' '),
    filtros: [{ k: 'sit', rot: 'Situação', opcoes: [['semos', 'Sem O.S'], ['semnf', 'Sem NF do envio'], ['semras', 'Sem rastreio'], ['laudo', 'Faltam laudos'], ['atras', 'Laudo atrasado'], ['ok', 'Todos os laudos baixados']], teste: (r, v) => v === 'semos' ? !r.os : v === 'semnf' ? !r.nf : v === 'semras' ? !r.rastreio : v === 'laudo' ? r.lau < r.n : v === 'atras' ? r.at : r.lau === r.n }],
    cols: [
      { k: 'env', rot: 'Envio', tipo: 'data', v: r => r.envio, cls: 'forte' },
      { k: 'lab', rot: 'Laboratório', fixa: true, v: r => r.lab },
      { k: 'n', rot: 'Amostras', tipo: 'num', v: r => r.n },
      { k: 'mats', rot: 'Materiais', v: r => r.mats },
      { k: 'os', rot: 'O.S', v: r => r.os },
      { k: 'nf', rot: 'NF do envio', v: r => r.nf },
      { k: 'ras', rot: 'Rastreio', v: r => r.rastreio },
      { k: 'cup', rot: 'Cupom', v: r => r.cupom ? 'sim' : '', html: r => r.cupom ? ic('imagem') : '' },
      { k: 'lau', rot: 'Laudos', v: r => r.lau + '/' + r.n, html: r => alPill(r.lau + ' de ' + r.n, r.lau === r.n ? 'ok' : r.at ? 'cr' : '') },
      { k: 'prev', rot: 'Laudo previsto', tipo: 'data', v: r => r.lau === r.n ? '' : r.prev }] });
}

/* ---------- gavetas ---------- */
function coAnexosHTML(l, k) {
  const c0 = l[0], nf = Array.from(new Set(l.map(c => c.nfEnvio).filter(Boolean))), ras = Array.from(new Set(l.map(c => c.rastreio).filter(Boolean))), cup = Array.from(new Set(l.map(c => c.cupomFoto).filter(Boolean)));
  if (!nf.length && !ras.length && !cup.length && !c0.obsEnvio) return '<p class="gv-h">Envio · NF, cupom e rastreio</p><p class="co-nada">Nada anexado ainda.' + (coPode() ? ' Use o ícone da foto no topo para anexar.' : '') + '</p>';
  return '<p class="gv-h">Envio · NF, cupom e rastreio</p><div class="co-anx">' +
    '<div class="co-ax"><small>NF do envio</small><b>' + esc(nf.join(', ') || '—') + '</b></div>' +
    '<div class="co-ax"><small>Rastreio</small><b>' + esc(ras.join(', ') || '—') + '</b>' + (ras.length ? '<button type="button" class="bt lk" data-act="co-ras" data-v="' + esc(ras[0]) + '">' + ic('externo') + 'Abrir nos Correios</button>' : '') + '</div>' +
    '<div class="co-ax"><small>Cupom dos Correios</small>' + (cup.length ? cup.map(f => '<button type="button" class="co-cup" data-act="co-foto" data-id="' + esc(f) + '" aria-label="Ver o cupom"><img data-cofoto="' + esc(f) + '" alt="Cupom dos Correios"></button>').join('') : '<b>—</b>') + '</div>' +
    (c0.obsEnvio ? '<div class="co-ax"><small>Observação</small><b>' + esc(c0.obsEnvio) + '</b></div>' : '') + '</div>';
}
function coAbre(id) {
  S._coSel = id; gvAbrir(() => {
    const c = S.coletas.find(x => x.id === id); if (!c) return null; const s = coSit(c), k = coLoteK(c), pode = coPode() && c.situacao !== 'cancelada';
    let pe = '';
    if (pode && !c.enviado && !coRetroPend(c.id)) pe += '<button type="button" class="bt pr" data-act="co-env" data-id="' + esc(c.id) + '">' + ic('sai') + 'Enviar</button>';
    if (pode && c.enviado) { if (!c.os && !coEncerrada(c)) pe += '<button type="button" class="bt" data-act="co-os" data-k="' + esc(k) + '">' + ic('lapis') + 'Informar O.S</button>'; if (!c.laudo && !coEncerrada(c)) pe += '<button type="button" class="bt pr" data-act="co-laudo" data-k="' + esc(k) + '" data-id="' + esc(c.id) + '">' + ic('ok') + 'Laudo recebido</button>'; }
    return { ico: 'frasco', cabAcoes: pode && k ? coAnxBt(k) : '', sub: (CO_TXT[c.tipo] || c.tipo) + ' · ' + (c.analiseNome || c.sigla || ''), titulo: coNome(c), pill: alPill(s.txt, s.cor),
      corpo: tlFluido('col-' + c.id, coEtapas(c)) +
        (k ? coAnexosHTML(coLote(k), k) + '<button type="button" class="bt lk co-vl" data-act="co-lote" data-k="' + esc(k) + '">' + ic('caixa') + 'Ver a remessa (' + coLote(k).length + (coLote(k).length === 1 ? ' amostra)' : ' amostras)') + '</button>' : '') +
        '<p class="gv-h">Amostra</p>' + gvCampos([['Análise', [c.analiseNome, c.sigla ? '(' + c.sigla + ')' : ''].filter(Boolean).join(' ')], ['Laboratório', c.lab], ['Valor', c.valor ? brl(c.valor) : ''], ['Cultura', [c.cultura, c.variedade].filter(Boolean).join(' · ')], ['Identificação', c.identificacao || c.identif], ['Lote do composto', c.loteComp], ['Observação', c.obs], ['Cancelada', c.situacao === 'cancelada' ? c.canceladaMotivo || 'sim' : '']]),
      rodape: pe };
  });
  render();
}
function coAbreLote(k) {
  S._coSel = k; gvAbrir(() => {
    const l = coLote(k); if (!l.length) return null; const c0 = l[0], lau = l.filter(c => c.laudo).length, at = l.filter(c => coLaudoSit(c) === 'Atrasado').length, pode = coPode(), aberta = l.some(c => !coEncerrada(c));
    return { ico: 'caixa', cabAcoes: pode ? coAnxBt(k) : '', sub: 'Remessa · ' + fmtD(c0.envio), titulo: c0.lab || 'Sem laboratório', pill: alPill(lau === l.length ? 'Laudos baixados' : at ? at + ' laudo(s) atrasado(s)' : 'Aguardando laudos', lau === l.length ? 'ok' : at ? 'cr' : ''),
      corpo: gvNums([[String(l.length), 'amostras'], [lau + '/' + l.length, 'laudos'], [lau === l.length ? '—' : fmtD(coPrevisto(c0)), 'laudo previsto', at ? 'cr' : '']]) +
        gvCampos([['O.S', Array.from(new Set(l.map(c => c.os).filter(Boolean))).join(', ') || 'ainda não informada']]) + coAnexosHTML(l, k) +
        '<p class="gv-h">Amostras</p><div class="gv-lotes">' + l.sort((a, b) => cmpTxt(a.tipo, b.tipo) || cmpTxt(coNome(a), coNome(b))).map(c => { const s = coSit(c); return '<button type="button" class="gv-lote co-am" data-act="co-abre" data-id="' + esc(c.id) + '"><span><b>' + esc(coNome(c)) + '</b> ' + esc((CO_TXT[c.tipo] || '') + ' · ' + (c.sigla || c.analiseNome || '')) + '</span>' + alPill(s.txt, s.cor) + '</button>'; }).join('') + '</div>',
      rodape: pode && aberta ? (l.some(c => !c.os) ? '<button type="button" class="bt" data-act="co-os" data-k="' + esc(k) + '">' + ic('lapis') + 'Informar O.S</button>' : '<button type="button" class="bt" data-act="co-os" data-k="' + esc(k) + '">' + ic('lapis') + 'Corrigir O.S</button>') +
        (lau < l.length ? '<button type="button" class="bt pr" data-act="co-laudo" data-k="' + esc(k) + '">' + ic('ok') + 'Laudos recebidos</button>' : '') : '' };
  });
  render();
}
const coAnxBt = k => '<button type="button" class="bt ic-so" data-act="co-anx" data-k="' + esc(k) + '" title="NF, cupom e rastreio" aria-label="NF, cupom e rastreio">' + ic('imagem') + '</button>';
/* fotos (cupom) carregadas sob demanda, como no EFClaudian (sv2_fotos) */
const CO_FOTO = {};
function coFotoGet(id) { if (CO_FOTO[id]) return Promise.resolve(CO_FOTO[id]); return Data.col('sv2_fotos').get(id).then(d => { const u = (d && d.dataUrl) || ''; if (u) CO_FOTO[id] = u; return u; }).catch(() => ''); }
GV_DEPOIS.push(g => { $$('img[data-cofoto]', g).forEach(img => { if (img.getAttribute('src')) return; coFotoGet(img.getAttribute('data-cofoto')).then(u => { if (u) img.src = u; }); }); });
function coFotoVer(id) {
  coFotoGet(id).then(u => {
    if (!u) { aviso('Não foi possível abrir a foto.', 'erro'); return; }
    const d = document.createElement('div'); d.id = 'co-fv'; d.className = 'co-fv'; d.innerHTML = '<img src="' + u + '" alt="Cupom dos Correios"><button type="button" class="bt ic-so" data-act="co-fv-x" aria-label="Fechar">' + ic('x') + '</button>';
    document.body.appendChild(d); csCamadaAbre('foto', () => { const x = $('#co-fv'); if (x) x.remove(); });
  });
}

/* ======================= formulários ======================= */
/* reduz a foto para caber no limite da regra (sv2_fotos: até 400 mil caracteres) */
function coFotoReduz(arq) {
  return new Promise((ok, erro) => {
    const r = new FileReader(); r.onerror = () => erro(new Error('Não deu para ler a foto.'));
    r.onload = () => { const im = new Image(); im.onerror = () => erro(new Error('Arquivo não é uma imagem.')); im.onload = () => {
      let q = .72, lado = 1400, url = '';
      for (let n = 0; n < 6; n++) { const k = Math.min(1, lado / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); url = cv.toDataURL('image/jpeg', q); if (url.length < 380000) break; lado *= .8; q -= .06; }
      url.length < 400000 ? ok(url) : erro(new Error('A foto ficou grande demais.')); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
const coCupomBl = f => lcBl('Cupom dos Correios', (f.cupom ? '<div class="co-cupf"><img src="' + f.cupom + '" alt="Cupom"><button type="button" class="bt ic-so" data-act="co-cup-x" title="Tirar a foto" aria-label="Tirar a foto">' + ic('lixo') + '</button></div>' : f.cupomAtual ? '<div class="co-cupf"><img data-cofoto="' + esc(f.cupomAtual) + '" alt="Cupom atual"><small>atual · escolha outra para trocar</small></div>' : '') +
  '<label class="bt co-file">' + ic('imagem') + (f.cupom || f.cupomAtual ? 'Trocar a foto' : 'Foto do cupom') + '<input type="file" accept="image/*" capture="environment" data-cofile hidden></label>', 'opcional');
async function coGravaCupom(f, ids) {
  if (!f.cupom) return '';
  const id = uid(); await Data.col('sv2_fotos').set(id, { refTipo: 'coleta_envio', papel: 'cupom', refIds: ids, dataUrl: f.cupom, criadoEm: nowISO(), porId: S.user.id }); CO_FOTO[id] = f.cupom; return id;
}
const coParaCorrecao = () => { const s = supsOf(S.user).filter(id => isSup(userById(id))); return s.length ? s : S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== S.user.id).map(x => x.id); };

/* ---- Enviar (remessa) ---- */
const coNaoEnviadas = () => coAtivas().filter(c => !c.enviado && !coRetroPend(c.id)).sort((a, b) => cmpTxt(a.tipo, b.tipo) || String(a.data).localeCompare(String(b.data)) || cmpTxt(coNome(a), coNome(b)));
LC_FORM.coenv = f => {
  const l = coNaoEnviadas().filter(c => !f.mat || c.tipo === f.mat), sel = coNaoEnviadas().filter(c => f.sel[c.id]), labs = coLabs();
  const porLab = {}; sel.forEach(c => { const x = f.lab || c.lab || '(sem laboratório)'; porLab[x] = (porLab[x] || 0) + 1; });
  return { ico: 'sai', sub: 'Remessa · ' + S.user.nome, titulo: 'Enviar amostras', corpo: lcMsg() +
    '<div class="cb-selh"><p class="gv-h">1 · Amostras · <span id="co-n">' + sel.length + ' marcada(s)</span></p>' + ddHTML('lc:comat', f.mat || '', [['', 'Todos os materiais']].concat(CO_MAT)) + '</div>' +
    '<div class="co-selb"><button type="button" class="bt lk" data-act="co-todas">Marcar as ' + l.length + ' da lista</button><button type="button" class="bt lk" data-act="co-limpa">Limpar</button></div>' +
    '<div class="fm-pk"><div class="fm-pkl co-pkl">' + (l.length ? l.map(c => { const on = !!f.sel[c.id]; return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="co-ck" data-id="' + esc(c.id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(coNome(c)) + '</b><small>' + esc([CO_TXT[c.tipo], c.sigla || c.analiseNome, c.lab, 'coleta ' + fmtD(c.data)].filter(Boolean).join(' · ')) + '</small></span></button>'; }).join('') : '<p class="cg-ob">Nenhuma amostra para enviar' + (f.mat ? ' deste material' : '') + '.</p>') + '</div></div>' +
    (sel.length ? '<p class="cg-ob">' + Object.keys(porLab).sort().map(x => esc(x) + ': ' + porLab[x]).join(' · ') + (Object.keys(porLab).length > 1 ? ' — cada laboratório vira uma remessa' : '') + '</p>' : '') +
    '<p class="gv-h">2 · Envio</p><div class="fm-g">' + lcBl('Data do envio', lcData('data', f.data, true)) + lcBl('Laboratório', ddHTML('lc:colab', f.lab || '', [['', 'O de cada amostra']].concat(labs.map(x => [x, x])))) + '</div>' +
    (f.data && f.data < hojeISO() ? lcAv('Data anterior a hoje: ' + (isSup(S.user) ? 'o Administrador e os superiores são avisados.' : 'fica aguardando a confirmação do Líder ★ ou do Administrador; as amostras continuam como não enviadas até lá.'), 'wa') : '') +
    '<p class="gv-h">3 · NF, cupom e rastreio <small>pode deixar para depois</small></p><div class="fm-g">' + lcBl('NF do envio', lcIn('nf', f.nf, ' placeholder="Correios, se o pacote foi com nota"')) + lcBl('Código de rastreio', lcIn('rastreio', f.rastreio, ' placeholder="Ex.: AB123456789BR" autocapitalize="characters"')) + '</div>' +
    coCupomBl(f) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: lcPe('co-env-ok', sel.length ? 'Enviar ' + sel.length + ' amostra(s)' : 'Enviar') };
};
async function coEnvOk() {
  const f = S.fm; if (!f || !coPode()) return;
  const cs = coNaoEnviadas().filter(c => f.sel[c.id]); if (!cs.length) return lcErro('Marque pelo menos uma amostra.');
  const data = f.data; if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) return lcErro('Informe a data do envio.');
  if (data > addDias(hojeISO(), CO_ENVIO_FRENTE)) return lcErro('A data do envio pode ser no máximo ' + CO_ENVIO_FRENTE + ' dias à frente.');
  const antes = cs.filter(c => c.data && data < c.data); if (antes.length) return lcErro('O envio não pode ser antes da coleta: ' + antes.slice(0, 3).map(c => coNome(c) + ' (' + fmtD(c.data) + ')').join(', ') + (antes.length > 3 ? '…' : '') + '.');
  const semLab = cs.filter(c => !(f.lab || c.lab)); if (semLab.length) return lcErro(semLab.length + ' amostra(s) sem laboratório: escolha um laboratório.');
  const ras = String(f.rastreio || '').trim().toUpperCase().replace(/\s+/g, ''), nf = String(f.nf || '').trim(), obs = String(f.obs || '').trim();
  if (!lcTravar()) return;
  try {
    const foto = await coGravaCupom(f, cs.map(c => c.id));
    const patchDe = c => { const o = { enviado: true, envio: data, lab: f.lab || c.lab }; if (nf) o.nfEnvio = nf; if (obs) o.obsEnvio = obs; if (ras) o.rastreio = ras; if (foto) o.cupomFoto = foto; return o; };
    if (data < hojeISO() && !isSup(S.user)) {
      const resumo = cs.length + ' amostra(s): ' + cs.slice(0, 6).map(coNome).join(', ') + (cs.length > 6 ? '…' : '') + ' · envio em ' + fmtD(data);
      const aid = await Aprov.pedir({ tipo: 'envio_retro', titulo: 'Envio com data retroativa (' + fmtD(data) + ')', descricao: resumo, refTipo: 'coleta', refId: cs[0].id, payload: { itens: cs.map(c => ({ id: c.id, patch: patchDe(c) })), data: data, resumo: resumo }, para: coParaCorrecao() });
      if (!aid) return lcErro('Não foi possível enviar o pedido.');
      lcFim(); aviso('Data retroativa: pedido enviado. As amostras ficam como não enviadas até o Líder ★ ou o Administrador confirmar.'); return;
    }
    for (const c of cs) {
      const o = patchDe(c); await Data.col('sv2_coletas').update(c.id, o);
      Audit.log({ acao: 'envio_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Remessa: ' + CO_TXT[c.tipo] + ' ' + coNome(c) + ' enviada em ' + fmtD(data) + ' · ' + o.lab, antes: { enviado: !!c.enviado, envio: c.envio || '', lab: c.lab || '' }, depois: o });
    }
    if (data < hojeISO()) coAvisaRetro(cs.length, data, S.user.nome, '');
    lcFim(); aviso(cs.length + ' amostra(s) enviada(s). As fichas de envio continuam no EFClaudian.');
  } catch (e) { lcErro(svErro(e)); }
}
function coAvisaRetro(n, data, quem, confirmou) {
  const para = Array.from(new Set(S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== S.user.id).map(x => x.id).concat(supsOf(S.user).filter(id => id !== S.user.id)))); if (!para.length) return;
  Notif.send({ nivel: 'aviso', titulo: 'Envio com data retroativa', texto: n + ' amostra(s) com envio em ' + fmtD(data) + ', lançado(s) por ' + quem + ' em ' + fmtD(hojeISO()) + (confirmou ? ' · confirmado por ' + confirmou : '') + '.', para: para, refTipo: 'coleta' }).catch(() => {});
}
/* confirmar o envio retroativo (o mesmo pedido do EFClaudian: decide aqui ou lá) */
APROV_APLICA.envio_retro = async (p, aprov) => {
  let n = 0;
  for (const it of (p.itens || [])) {
    const c = S.coletas.find(x => x.id === it.id); if (!c || c.situacao === 'cancelada' || coEncerrada(c)) continue;
    const antes = {}; Object.keys(it.patch).forEach(k => { antes[k] = c[k] == null ? '' : c[k]; });
    await Data.col('sv2_coletas').update(c.id, it.patch);
    Audit.log({ acao: 'envio_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Envio retroativo (' + fmtD(p.data) + ') confirmado: ' + (CO_TXT[c.tipo] || '') + ' ' + coNome(c) + (aprov ? ' · pedido de ' + aprov.solicitanteNome : ''), antes: antes, depois: it.patch, autorizadoPor: S.user.nome });
    n++;
  }
  if (aprov) coAvisaRetro(n, p.data, aprov.solicitanteNome, S.user.nome);
  return n;
};

/* ---- lançamentos na remessa (v0.4.1, pedido de 06/11 17:54/17:58): a Aquasollus pode mandar duas O.S para a mesma remessa.
   Regra para TODO lançamento em remessa (O.S, laudo, NF/cupom/rastreio): sugere lançar em todas as que ainda não têm; se não, escolher
   quais; ao lançar de novo, pergunta igual, só com as que continuam sem. ---- */
function coAlvoHTML(f, cand, rot) {
  if (cand.length <= 1) return cand.length ? '<p class="cg-ob">Vale para: <b>' + esc(coNome(cand[0])) + '</b> · ' + esc([CO_TXT[cand[0].tipo], cand[0].sigla || cand[0].analiseNome].filter(Boolean).join(' · ')) + '</p>' : '';
  const n = cand.filter(c => f.sel[c.id]).length;
  return lcBl('Lançar em', ddHTML('lc:coalvo', f.alvo, [['todas', 'Todas as ' + cand.length + ' ' + rot], ['escolher', 'Escolher quais']])) +
    (f.alvo === 'escolher' ? '<div class="cb-selh"><p class="gv-h">Amostras · <span id="co-n">' + n + ' marcada(s)</span></p></div><div class="fm-pk"><div class="fm-pkl co-pkl">' + cand.map(c => { const on = !!f.sel[c.id], at = coLaudoSit(c) === 'Atrasado' && !c.laudo; return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="co-ck" data-id="' + esc(c.id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(coNome(c)) + '</b><small>' + esc([CO_TXT[c.tipo], c.sigla || c.analiseNome, c.os ? 'O.S ' + c.os : '', c.rastreio ? 'rastreio ' + c.rastreio : ''].filter(Boolean).join(' · ')) + '</small></span>' + (at ? alPill('atrasado', 'cr') : '') + '</button>'; }).join('') + '</div></div>' : '');
}
const coAlvos = (f, cand) => cand.length <= 1 || f.alvo !== 'escolher' ? cand : cand.filter(c => f.sel[c.id]);
const coSemAnexo = c => !c.nfEnvio && !c.rastreio && !c.cupomFoto;

/* ---- NF, cupom e rastreio (a qualquer momento) ---- */
const coAnxCand = f => { const l = coLote(f.lk), s = l.filter(coSemAnexo); return f.modo === 'todas' || !s.length ? l : s; };
LC_FORM.coanx = f => { const l = coLote(f.lk); if (!l.length) return null; const c0 = l[0], cand = coAnxCand(f), sem = l.filter(coSemAnexo).length;
  return { ico: 'imagem', sub: 'Remessa · ' + fmtD(c0.envio) + ' · ' + (c0.lab || ''), titulo: 'NF, cupom e rastreio', corpo: lcMsg() +
    (sem && sem < l.length ? lcAv(sem + ' de ' + l.length + ' amostra(s) ainda sem NF, cupom ou rastreio.' + (f.modo === 'todas' ? '' : ' <button type="button" class="bt lk" data-act="co-anx-todas">Mostrar todas</button>')) : !sem ? lcAv('Todas já têm algo anexado: aqui você corrige ou completa. Pode anexar a qualquer momento, mesmo depois do laudo.') : '') +
    coAlvoHTML(f, cand, sem && f.modo !== 'todas' ? 'sem anexo' : 'da remessa') +
    '<div class="fm-g">' + lcBl('NF do envio', lcIn('nf', f.nf, ' placeholder="Correios, se o pacote foi com nota"')) + lcBl('Código de rastreio', lcIn('rastreio', f.rastreio, ' placeholder="Ex.: AB123456789BR" autocapitalize="characters"')) + '</div>' + coCupomBl(f) + lcBl('Observação do envio', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: lcPe('co-anx-ok', 'Guardar') }; };
async function coAnxOk() {
  const f = S.fm, l = coAlvos(f, coAnxCand(f)); if (!coPode()) return; if (!l.length) return lcErro('Marque pelo menos uma amostra.');
  const ras = String(f.rastreio || '').trim().toUpperCase().replace(/\s+/g, ''), nf = String(f.nf || '').trim(), obs = String(f.obs || '').trim();
  if (!lcTravar()) return;
  try {
    const foto = await coGravaCupom(f, l.map(c => c.id)); let n = 0;
    for (const c of l) {
      const o = {}; if (nf !== (c.nfEnvio || '')) o.nfEnvio = nf; if (ras !== (c.rastreio || '')) o.rastreio = ras; if (obs !== (c.obsEnvio || '')) o.obsEnvio = obs; if (foto) o.cupomFoto = foto;
      if (!Object.keys(o).length) continue; const antes = {}; Object.keys(o).forEach(k => { antes[k] = c[k] == null ? '' : c[k]; });
      await Data.col('sv2_coletas').update(c.id, o); n++;
      Audit.log({ acao: 'envio_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Envio de ' + fmtD(c.envio) + ' · ' + (c.lab || '') + ': ' + Object.keys(o).map(k => ({ nfEnvio: 'NF', rastreio: 'rastreio', obsEnvio: 'observação', cupomFoto: 'cupom' }[k])).join(', ') + ' — ' + coNome(c), antes: antes, depois: o });
    }
    lcFim(); aviso(n ? 'Guardado em ' + n + ' amostra(s).' : 'Nada mudou.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ---- O.S: informar nas que ainda não têm; corrigir uma já lançada = correção, como no EFClaudian ---- */
const coOsCand = f => { const l = coLote(f.lk).filter(c => !coEncerrada(c)); return f.modo === 'corr' ? l.filter(c => c.os) : l.filter(c => !c.os); };
LC_FORM.coos = f => { const l = coLote(f.lk).filter(c => !coEncerrada(c)); if (!l.length) return null; const c0 = l[0], corr = f.modo === 'corr', cand = coOsCand(f), com = l.filter(c => c.os).length, os = Array.from(new Set(l.map(c => c.os).filter(Boolean)));
  return { ico: 'lapis', sub: 'Remessa · ' + fmtD(c0.envio) + ' · ' + (c0.lab || ''), titulo: corr ? 'Corrigir O.S' : 'Informar O.S', corpo: lcMsg() +
    (corr ? lcAv('Trocar uma O.S já lançada é correção: ' + (isPrincipal(S.user) ? 'você corrige direto, com o motivo.' : 'vai como pedido ao seu superior, com o motivo.'), 'wa')
      : (com ? lcAv(com + ' amostra(s) já com O.S (' + esc(os.join(', ')) + '). Aqui entram só as que ainda não têm. <button type="button" class="bt lk" data-act="co-os-corr">Corrigir uma O.S já lançada</button>') : '')) +
    coAlvoHTML(f, cand, corr ? 'com O.S' : 'sem O.S') +
    lcBl(corr ? 'O.S certa' : 'O.S', lcIn('os', f.os, ' placeholder="Número que o laboratório mandou"')) + (corr ? lcBl('Motivo', lcIn('motivo', f.motivo, ' placeholder="Ex.: O.S digitada errada"')) : ''),
    rodape: lcPe('co-os-ok', corr ? (isPrincipal(S.user) ? 'Corrigir' : 'Pedir correção') : 'Guardar O.S') }; };
async function coOsOk() {
  const f = S.fm; if (!coPode()) return; const l = coAlvos(f, coOsCand(f)); if (!l.length) return lcErro('Marque pelo menos uma amostra.');
  const os = String(f.os || '').trim(); if (!os) return lcErro('Informe a O.S.');
  if (f.modo !== 'corr') {
    if (!lcTravar()) return;
    try { for (const c of l) { await Data.col('sv2_coletas').update(c.id, { os: os }); Audit.log({ acao: 'envio_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'O.S ' + os + ' do lote ' + fmtD(c.envio) + ' · ' + (c.lab || ''), antes: { os: '' }, depois: { os: os } }); } lcFim(); aviso('O.S ' + os + ' em ' + l.length + ' amostra(s).'); }
    catch (e) { lcErro(svErro(e)); } return;
  }
  const mot = String(f.motivo || '').trim(); if (mot.length < 5) return lcErro('Escreva o motivo da correção.');
  const ids = l.filter(c => c.os !== os).map(c => c.id); if (!ids.length) return lcErro('A O.S já é essa.');
  if (ids.some(coOsPend)) return lcErro('Já tem um pedido de correção de O.S destas amostras esperando.');
  const p = { ids: ids, agua: false, os: os, antes: Array.from(new Set(l.filter(c => ids.indexOf(c.id) >= 0).map(c => c.os || ''))).join(', '), motivo: mot, rotulo: 'remessa de ' + fmtD(l[0].envio) + ' · ' + (l[0].lab || '') };
  if (!lcTravar()) return;
  try {
    if (isPrincipal(S.user)) { await APROV_APLICA.corrigir_os(p, null); lcFim(); aviso('O.S corrigida.'); return; }
    const aid = await Aprov.pedir({ tipo: 'corrigir_os', titulo: 'Corrigir O.S: ' + p.rotulo, descricao: 'O.S ' + (p.antes || '—') + ' → ' + os + ' (' + ids.length + ' amostra(s))\nMotivo: ' + mot, refTipo: 'coleta', refId: ids[0], payload: p, para: coParaCorrecao() });
    if (aid) { lcFim(); aviso('Pedido de correção enviado.'); } else lcErro('Não foi possível enviar o pedido.');
  } catch (e) { lcErro(svErro(e)); }
}
APROV_APLICA.corrigir_os = async (p, aprov) => {
  if (p.agua) throw new Error('Correção de O.S da água: decida no EFClaudian.');
  for (const id of p.ids) {
    const c = S.coletas.find(x => x.id === id); if (!c) continue;
    const h = (c.historico || []).concat([{ ts: nowISO(), antes: { os: c.os || '' }, depois: { os: p.os }, motivo: p.motivo, pedidoPor: aprov ? aprov.solicitanteNome : S.user.nome, aprovadoPor: S.user.nome, aprovId: aprov ? aprov.id : '' }]);
    await Data.col('sv2_coletas').update(id, { os: p.os, historico: h, alterado: true });
    Audit.log({ acao: 'corrigir_os', entidade: 'coleta', entidadeId: id, resumo: 'O.S corrigida: ' + (c.os || '—') + ' → ' + p.os + ' · ' + p.motivo + (aprov ? ' (pedido de ' + aprov.solicitanteNome + ')' : ''), antes: { os: c.os || '' }, depois: { os: p.os }, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
  }
};

/* ---- Laudo recebido ---- */
const coLaudoCand = f => coLote(f.lk).filter(c => !c.laudo && !coEncerrada(c));
LC_FORM.colaudo = f => { const cand = coLaudoCand(f); if (!cand.length) return null; const c0 = cand[0], com = coLote(f.lk).filter(c => c.laudo).length;
  return { ico: 'ok', sub: 'Remessa · ' + fmtD(c0.envio) + ' · ' + (c0.lab || ''), titulo: 'Laudo recebido', corpo: lcMsg() + lcAv((com ? com + ' amostra(s) já com laudo. ' : '') + 'Fica registrado quem marcou e quando.') + coAlvoHTML(f, cand, 'sem laudo'),
    rodape: lcPe('co-laudo-ok', 'Marcar laudo recebido') }; };
async function coLaudoOk() {
  const f = S.fm; if (!coPode()) return; const l = coAlvos(f, coLaudoCand(f)); if (!l.length) return lcErro('Marque pelo menos uma amostra.');
  if (!lcTravar()) return;
  try { for (const c of l) { const o = { laudo: true, laudoEm: nowISO(), laudoPor: S.user.nome }; await Data.col('sv2_coletas').update(c.id, o); Audit.log({ acao: 'envio_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Laudo recebido: ' + CO_TXT[c.tipo] + ' ' + coNome(c) + (c.os ? ' · O.S ' + c.os : ''), antes: { laudo: false }, depois: { laudo: true } }); } lcFim(); aviso('Laudo marcado em ' + l.length + ' amostra(s).'); }
  catch (e) { lcErro(svErro(e)); }
}

/* ---------- eventos ---------- */
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; if (f && (k === 'comat' || k === 'colab' || k === 'coalvo')) { if (k === 'comat') f.mat = v; else if (k === 'colab') f.lab = v; else f.alvo = v; f.sujo = true; f.msg = ''; gvDesenha(true); return; } ant(k, v); }; })(DD_AO.lc);
document.addEventListener('change', e => {
  const t = e.target; if (!(t && t.hasAttribute && t.hasAttribute('data-cofile')) || !S.fm) return; const a = t.files && t.files[0]; if (!a) return;
  coFotoReduz(a).then(u => { if (!S.fm) return; S.fm.cupom = u; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); }).catch(er => lcErro(er.message));
});
/* a data do envio muda o aviso de retroativo: redesenha ao sair do campo */
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && t.getAttribute('data-fm') === 'data' && S.fm && S.fm.k === 'coenv') gvDesenha(true); });
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="co-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), k = t.getAttribute('data-k'), f = S.fm, vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'co-env') { if (!coPode()) return; const sel = {}; if (id) sel[id] = true; lcAbrir({ k: 'coenv', sel: sel, mat: id ? ((S.coletas.find(x => x.id === id) || {}).tipo || '') : '', data: hojeISO(), lab: '', nf: '', rastreio: '', obs: '', cupom: '' }, volta); }
  else if (a === 'co-ck' && f) { f.sel[id] = !f.sel[id]; f.sujo = true; t.classList.toggle('on', f.sel[id]); t.setAttribute('aria-pressed', f.sel[id]); t.querySelector('.cb-box').innerHTML = f.sel[id] ? ic('ok') : ''; if (f.k === 'coenv') gvDesenha(true); else { const n = $('#co-n'); if (n) n.textContent = Object.keys(f.sel).filter(x => f.sel[x]).length + ' marcada(s)'; } }
  else if (a === 'co-todas' && f) { coNaoEnviadas().filter(c => !f.mat || c.tipo === f.mat).forEach(c => { f.sel[c.id] = true; }); f.sujo = true; gvDesenha(true); }
  else if (a === 'co-limpa' && f) { f.sel = {}; gvDesenha(true); }
  else if (a === 'co-cup-x' && f) { f.cupom = ''; gvDesenha(true); }
  else if (a === 'co-env-ok') coEnvOk();
  else if (a === 'co-anx') { const l = coLote(k); if (!l.length || !coPode()) return; const sem = l.some(coSemAnexo), um = x => { if (sem) return ''; const v = Array.from(new Set(l.map(c => c[x]).filter(Boolean))); return v.length === 1 ? v[0] : ''; }; lcAbrir({ k: 'coanx', lk: k, modo: '', alvo: 'todas', sel: {}, nf: um('nfEnvio'), rastreio: um('rastreio'), obs: um('obsEnvio'), cupom: '', cupomAtual: um('cupomFoto') }, volta); }
  else if (a === 'co-anx-todas' && f) { f.modo = 'todas'; f.alvo = 'escolher'; f.sel = {}; coAnxCand(f).forEach(c => { if (coSemAnexo(c)) f.sel[c.id] = true; }); gvDesenha(true); }
  else if (a === 'co-os-corr' && f) { f.modo = 'corr'; f.alvo = 'escolher'; f.sel = {}; f.os = ''; f.msg = ''; gvDesenha(true); }
  else if (a === 'co-anx-ok') coAnxOk();
  else if (a === 'co-os') { if (!coPode()) return; const l = coLote(k).filter(c => !coEncerrada(c)); lcAbrir({ k: 'coos', lk: k, modo: l.some(c => !c.os) ? '' : 'corr', alvo: l.some(c => !c.os) ? 'todas' : 'escolher', sel: {}, os: '', motivo: '' }, volta); }
  else if (a === 'co-os-ok') coOsOk();
  else if (a === 'co-laudo') { if (!coPode()) return; const sel = {}; if (id) sel[id] = true; lcAbrir({ k: 'colaudo', lk: k, alvo: id && coLote(k).filter(c => !c.laudo).length > 1 ? 'escolher' : 'todas', sel: sel }, volta); }
  else if (a === 'co-laudo-ok') coLaudoOk();
  else if (a === 'co-lote') { S._gvNav = true; if (S.rota.aba !== 'envio') ir('coletas', 'envio'); coAbreLote(k); }
  else if (a === 'co-abre') { if (S.rota.aba !== 'amostras') { S._gvNav = true; ir('coletas', 'amostras'); } coAbre(id); }
  else if (a === 'co-ras') { const v = t.getAttribute('data-v') || ''; try { navigator.clipboard && navigator.clipboard.writeText(v); } catch {} window.open(CO_RASTREIO_URL, '_blank', 'noopener'); aviso('Código ' + v + ' copiado: cole na página dos Correios.'); }
  else if (a === 'co-foto') coFotoVer(id);
  else if (a === 'co-fv-x') csVolta();
});

/* ---------- busca geral ---------- */
BG_FONTES.push(q => {
  if (!coVe()) return [];
  return S.coletas.filter(c => CO_TXT[c.tipo] && c.tipo !== 'AGUA' && bgCasa(q, [coNome(c), c.analiseNome, c.sigla, c.os, c.nfEnvio, c.rastreio, c.lab, CO_TXT[c.tipo]].join(' '))).slice(0, 6)
    .map(c => ({ grupo: 'Amostras', nome: coNome(c) + ' · ' + (CO_TXT[c.tipo] || ''), sub: [c.sigla || c.analiseNome, fmtD(c.data), coSit(c).txt].filter(Boolean).join(' · '), ico: 'frasco', abrir: () => { if (S.rota.aba !== 'amostras' || S.rota.area !== 'coletas') { S._gvNav = true; ir('coletas', 'amostras'); } coAbre(c.id); } }));
});
