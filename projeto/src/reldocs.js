/* EFCwork · reldocs.js — Relatórios › Documentos (v0.6.23). Prefixo: rd.
   Porte do "Relatório de documentos" do EFClaudian (viewDocsRel: caixas de status, rosca das caixas d'água, lista filtrada,
   vencidos por responsável em linhas para Formulários e Regulatórios, segmentação por tipo, status e responsável), no padrão
   das outras abas de Relatórios: um filtro só (Tipo, Situação, Responsável), o resumo em texto no alto, as partes em tabelas
   com barras finas, a impressora. Sem rosca nem caixas de KPI que filtram. Só leitura; tocar num documento abre a gaveta dele
   (de lá se lança, como no EFClaudian). Mesmos dados da área Documentos (sv2_docs, sv2_caixas, sv2_lanc): nada novo no Firebase. */
const rdVe = () => !!S.user && isSup(S.user); /* Líder e Administrador, como as outras abas de Relatórios (o Colaborador continua vendo a área Documentos) */
Object.assign(S, { rd: { tipo: '', sit: '', resp: '', aberto: false } });
const RD_SEM = '(sem responsável)';
const rdResp = d => String(d.responsavel || '').trim() || RD_SEM;
const RD_SIT = [['', 'Todas'], ['venc', 'Vencidos'], ['aten', 'Vencem em até ' + DC_ATENCAO + ' dias'], ['ok', 'Em dia'], ['sem', 'Sem data']];
const RD_ORD = { venc: 0, aten: 1, sem: 2, ok: 3 };
const rdSemana = iso => { const d = new Date(iso + 'T12:00:00'), w = (d.getDay() + 6) % 7; return addDias(iso, -w); };

function rdDados() {
  const f = S.rd, hoje = hojeISO();
  const todos = dcCom('doc', S.docs).filter(d => !d.desativado);
  const doTipo = todos.filter(d => !f.tipo || (f.tipo === 'R' ? d.tipo === 'REGULATORIO' : d.tipo !== 'REGULATORIO'));
  const base = doTipo.filter(d => !f.resp || rdResp(d) === f.resp);
  const lista = base.filter(d => !f.sit || d._s.st === f.sit).sort((a, b) => (RD_ORD[a._s.st] - RD_ORD[b._s.st]) || ((a._s.dias == null ? 1e9 : a._s.dias) - (b._s.dias == null ? 1e9 : b._s.dias)) || cmpTxt(a.titulo, b.titulo));
  const cont = dcCont(base);
  /* vencidos por responsável (o tipo do filtro vale; o responsável não, para comparar as pessoas) */
  const pr = {}; doTipo.filter(d => d._s.st === 'venc').forEach(d => { const k = rdResp(d), x = pr[k] || (pr[k] = { nome: k, f: 0, r: 0 }); if (d.tipo === 'REGULATORIO') x.r++; else x.f++; });
  const porResp = Object.values(pr).sort((a, b) => (b.f + b.r) - (a.f + a.r) || cmpTxt(a.nome, b.nome));
  /* o que vence nas próximas 8 semanas (segunda a domingo) */
  const s0 = rdSemana(hoje), sem = []; for (let k = 0; k < 8; k++) sem.push({ ini: addDias(s0, k * 7), docs: 0, cx: 0 });
  const fim = addDias(s0, 56), poe = (prox, campo) => { if (!prox || prox < hoje || prox >= fim) return; const k = Math.floor(dcDif(s0, prox) / 7); if (sem[k]) sem[k][campo]++; };
  base.forEach(d => poe(d._s.prox, 'docs'));
  const cxs = dcCom('caixa', S.caixas), cxAt = cxs.filter(c => !c.desativado);
  cxAt.forEach(c => poe(c._s.prox, 'cx'));
  const cxc = dcCont(cxAt);
  return { todos, base, lista, cont, porResp, sem, cxs, cxAt, cxc, cxDes: cxs.length - cxAt.length, ativos: base.length };
}

function rdLeitura(d) {
  const l = [], c = d.cont, f = S.rd;
  if (!d.ativos) return ['Nenhum documento ativo com este filtro.'];
  const fv = d.base.filter(x => x._s.st === 'venc' && x.tipo !== 'REGULATORIO').length, rv = c.venc - fv;
  l.push(c.venc ? smPl(c.venc, 'documento vencido', 'documentos vencidos') + ' de ' + d.ativos + ' ativos' + (f.tipo ? '' : ' (' + smPl(fv, 'formulário', 'formulários') + ', ' + smPl(rv, 'regulatório', 'regulatórios') + ').') + (f.tipo ? '.' : '') : 'Nenhum documento vencido entre os ' + d.ativos + ' ativos.');
  if (!f.resp && d.porResp.length) { const p = d.porResp[0], n = p.f + p.r; l.push((d.porResp.length === 1 ? 'Os vencidos são de ' : 'Quem tem mais vencidos: ') + p.nome + ' (' + n + ')' + (d.porResp.length > 1 ? ', de ' + smPl(d.porResp.length, 'responsável', 'responsáveis') + ' com vencidos.' : '.')); }
  const prox = d.base.filter(x => x._s.st === 'aten').sort((a, b) => a._s.dias - b._s.dias);
  if (prox.length) l.push(smPl(prox.length, 'documento vence', 'documentos vencem') + ' nos próximos ' + DC_ATENCAO + ' dias; o primeiro é ' + prox[0].titulo + ' (' + dcPrazo(prox[0]._s) + ').');
  if (c.sem) l.push(smPl(c.sem, 'documento está', 'documentos estão') + ' sem data: precisa' + (c.sem === 1 ? '' : 'm') + ' do primeiro lançamento para o app calcular o vencimento.');
  if (d.cxAt.length) l.push('Caixas d’água: ' + d.cxc.ok + ' de ' + d.cxAt.length + ' com a limpeza em dia' + (d.cxc.venc ? '; ' + smPl(d.cxc.venc, 'vencida', 'vencidas') : '') + (d.cxc.aten ? '; ' + smPl(d.cxc.aten, 'vence', 'vencem') + ' em até ' + DC_ATENCAO + ' dias' : '') + '.');
  return l;
}

function rdPartes(d) {
  const r = [], f = S.rd, tab = amTab, bar = amBarra, n = v => '<span class="am-n">' + esc(String(v)) + '</span>';
  r.push(smSec('leitura', 'Como ler', 'gerado da situação de hoje', '<ul class="am-lei">' + rdLeitura(d).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'));
  const mx = Math.max.apply(null, d.porResp.map(x => x.f + x.r).concat([0])), soF = f.tipo === 'F', soR = f.tipo === 'R';
  const cabR = ['Responsável', ''].concat(soR ? [] : ['Formulários']).concat(soF ? [] : ['Regulatórios']).concat(f.tipo ? [] : ['Total']);
  const numR = f.tipo ? [2] : [2, 3, 4];
  r.push(smSec('resp', 'Vencidos por responsável', smPl(d.porResp.reduce((a, x) => a + x.f + x.r, 0), 'vencido', 'vencidos') + (f.resp ? ' · todos os responsáveis, para comparar' : ''),
    tab(cabR, d.porResp.map(x => [(x.nome === f.resp ? '<b>' + esc(x.nome) + '</b>' : esc(x.nome)), bar(x.f + x.r, mx)].concat(soR ? [] : [n(x.f)]).concat(soF ? [] : [n(x.r)]).concat(f.tipo ? [] : [n(x.f + x.r)])), 'Nenhum documento vencido.', numR)));
  const ms = Math.max.apply(null, d.sem.map(x => x.docs + x.cx).concat([0]));
  r.push(smSec('semanas', 'O que vence nas próximas semanas', 'documentos e limpezas de caixa por semana (segunda a domingo)',
    tab(['Semana', '', 'Documentos', 'Caixas'], d.sem.map((x, k) => [(k === 0 ? '<b>Esta semana</b>' : esc(smDc(x.ini) + ' a ' + smDc(addDias(x.ini, 6)))), bar(x.docs + x.cx, ms), n(x.docs || ''), n(x.cx || '')]), '', [2, 3])));
  const tc = d.cxAt.length + d.cxDes, ls = [['ok', 'Em dia'], ['aten', 'Vencem em até ' + DC_ATENCAO + ' dias'], ['venc', 'Vencidas'], ['sem', 'Sem data']].map(x => [x[1], d.cxc[x[0]], x[0]]);
  if (d.cxDes) ls.push(['Desativadas', d.cxDes, 'des']);
  const mc = Math.max.apply(null, ls.map(x => x[1]).concat([0]));
  const crit = d.cxAt.filter(c => c._s.st === 'venc' || c._s.st === 'aten').sort((a, b) => a._s.dias - b._s.dias);
  r.push(smSec('caixas', 'Caixas d’água · limpeza', smPl(d.cxAt.length, 'caixa ativa', 'caixas ativas'),
    !tc ? '<p class="sm-vz">Nenhuma caixa d’água cadastrada.</p>' : tab(['Situação', '', 'Caixas', '%'], ls.map(x => [esc(x[0]), bar(x[1], mc), n(x[1]), n(amPc(x[1], tc))]), '', [2, 3]) +
      (crit.length ? smH3('Vencidas e perto de vencer') + tab(['Caixa', 'Local', 'Última limpeza', 'Situação'], crit.map(c => [esc(c.tag || ''), esc(c.local || ''), esc(c._s.ult ? fmtD(c._s.ult) : ''), dcPill(c._s.st, true) + ' <small class="rd-pz">' + esc(dcPrazo(c._s)) + '</small>']), '') : '')));
  const mostra = d.lista.slice(0, 300);
  r.push(smSec('lista', 'Documentos', smPl(d.lista.length, 'documento', 'documentos') + ' com este filtro · do mais urgente para o em dia' + (d.lista.length > mostra.length ? ' · mostrando os ' + mostra.length + ' primeiros' : ''),
    d.lista.length ? '<div class="sm-tw"><table class="sm-t am-t rd-t"><thead><tr><th>Documento</th><th>Tipo</th><th>Responsável</th><th>Último</th><th>Próximo</th><th>Situação</th></tr></thead><tbody>' +
      mostra.map(x => '<tr data-act="rd-doc" data-id="' + esc(x.id) + '" tabindex="0"><td><b>' + esc(dcNome('doc', x)) + '</b></td><td>' + esc(x.tipo === 'REGULATORIO' ? 'Regulatório' : 'Formulário') + '</td><td>' + esc(rdResp(x)) + '</td><td>' + esc(x._s.ult ? fmtD(x._s.ult) : '') + '</td><td>' + esc(x._s.prox ? fmtD(x._s.prox) : '') + '</td><td>' + dcPill(x._s.st) + ' <small class="rd-pz">' + esc(dcPrazo(x._s)) + '</small></td></tr>').join('') +
      '</tbody></table></div>' : '<p class="sm-vz">Nenhum documento com este filtro.</p>'));
  return r.join('');
}
function rdResumo(d) {
  const c = d.cont;
  return rlResumo([[String(c.venc), c.venc === 1 ? 'vencido' : 'vencidos', 'de ' + d.ativos + ' ativos'], [String(c.aten), 'vencem logo', 'em até ' + DC_ATENCAO + ' dias'],
    [String(c.ok), 'em dia', ''], [String(c.sem), 'sem data', 'falta o 1º lançamento'], [String(d.cxc.venc), d.cxc.venc === 1 ? 'caixa vencida' : 'caixas vencidas', 'de ' + d.cxAt.length + ' caixas']]);
}
function rdFiltroTxt() {
  const f = S.rd, p = [f.tipo === 'F' ? 'Formulários' : f.tipo === 'R' ? 'Regulatórios' : 'Todos os tipos'];
  if (f.sit) p.push((RD_SIT.find(x => x[0] === f.sit) || [0, ''])[1]); if (f.resp) p.push(f.resp);
  return p.join(' · ');
}

/* ---------- tela ---------- */
function rdTela() {
  const f = S.rd, ent = f._ent; f._ent = false;
  const c = cabecalho({ titulo: 'Relatório de documentos', abaNome: 'Documentos', acoes: '<button type="button" class="bt ic-so" data-act="rd-imp" data-ic-aba title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button>' });
  const resps = Array.from(new Set(dcCom('doc', S.docs).filter(x => !x.desativado).map(rdResp))).sort((a, b) => a === RD_SEM ? 1 : b === RD_SEM ? -1 : cmpTxt(a, b));
  const bar = '<div class="sm-bar"><button type="button" class="at-fl" data-act="rd-filtro" aria-expanded="' + esc(String(f.aberto)) + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(rdFiltroTxt()) + '</small></button></div>' +
    '<div class="sm-fp rd-fp"' + (f.aberto ? '' : ' hidden') + '><label class="cp">Tipo' + ddHTML('rd:tipo', f.tipo, [['', 'Todos'], ['F', 'Formulários'], ['R', 'Regulatórios']]) + '</label>' +
    '<label class="cp">Situação' + ddHTML('rd:sit', f.sit, RD_SIT) + '</label><label class="cp">Responsável' + ddHTML('rd:resp', f.resp, [['', 'Todos']].concat(resps.map(x => [x, x]))) + '</label></div>';
  if (!S.docs.length && !S.caixas.length) return c + bar + '<section class="pn"><div class="vazio">' + ic('doc') + '<b>Nenhum documento cadastrado.</b><span>O catálogo é carregado pelo Principal no EFClaudian (Documentos › Catálogo).</span></div></section>';
  const d = rdDados();
  return c + '<div class="sm am rd' + (ent ? ' sm-ent' : '') + '">' + bar + rdResumo(d) + rdPartes(d) + '</div>';
}
const rdQual = TELAS.relatorios;
TELAS.relatorios = aba => aba === 'documentos' ? (rdVe() ? rdTela() : '') : (rdQual ? rdQual(aba) : '');

/* ---------- papel ---------- */
function rdImprimir() {
  const d = rdDados(), e = S.empresa || {}; let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>Relatório de documentos · ' + esc(fmtD(hojeISO())) + '</b><span>' + esc([e.nome, rdFiltroTxt(), 'emitido por ' + S.user.nome].filter(Boolean).join(' · ')) + '</span></div><div class="sm sm-imp am rd">' + rdResumo(d) + rdPartes(d) + '</div><div class="imp-pe">' + esc(APP_APELIDO) + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'relatorio_docs', entidadeId: hojeISO(), resumo: 'Imprimiu o Relatório de documentos (' + rdFiltroTxt() + ')' });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.rd = (k, v) => { if (!(k in S.rd)) return; S.rd[k] = v; S.rd._ent = true; render(); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="rd-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'rd-filtro') { S.rd.aberto = !S.rd.aberto; render(); }
  else if (a === 'rd-imp') rdImprimir();
  else if (a === 'rd-doc') dcAbreDoc(t.getAttribute('data-id'));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.rd.aberto && S.rota.area === 'relatorios' && S.rota.aba === 'documentos' && !S.gv && !document.querySelector('.dd-l:not([hidden])')) { e.preventDefault(); S.rd.aberto = false; render(); }
  else if (e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('data-act') === 'rd-doc') dcAbreDoc(e.target.getAttribute('data-id'));
});
