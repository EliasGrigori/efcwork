/* EFCwork · agua.js — COLETAS › ÁGUA (v0.6.5). Prefixo: ag.
   Mesmos dados e regras do EFClaudian v2.102.60: sv2_aguacol (coletas), sv2_aguaproj (projetos; só leitura aqui), sv2_aguaponto (pontos),
   sv2_cfg/agua (prazos), sv2_bebs e sv2_caixas (pontos), sv2_analises (tipo AGUA).
   RODÍZIO: os N bebedouros há mais tempo sem coleta (uma amostra por bebedouro) → se tudo CONFORME, a próxima é a MESCLADA (uma amostra com a água
   de todos) → depois volta o rodízio. NÃO CONFORME (ou recoleta pedida com motivo) → RECOLETA nos mesmos bebedouros até N dias depois do laudo,
   que aparece no acompanhamento, e aviso na hora. Nada disso é gravado à parte: o plano é calculado das próprias coletas
   (tipoColeta, bebIds, rodada, recoletaDe, recoletaPedida). O rodízio é o projeto "legado" (sv2_aguaproj): aqui só se lê o calendário dele e se
   lança a coleta com projetoId/ocorrencia certos (para não ficar "atrasada" no EFClaudian).
   Fica no EFClaudian nesta versão: criar/remarcar projetos e pontos (v0.6.7) e a etiqueta da caixa. Ação corretiva e relatório por local: aguaac.js (v0.6.6). */
Object.assign(S, { aguacol: [], aguaproj: [], aguapontos: [], agCarregado: false, cfgAgua: S.cfgAgua || null });
const AG_CFG_PADRAO = { periodoDias: 15, porVez: 2, laudoDias: 7, recoletaDias: 7, fora: [] };
const AG_AGENTES = [['coliformes', 'Coliformes totais'], ['ecoli', 'E. coli'], ['pseudomonas', 'Pseudomonas'], ['outro', 'Outro']];
const AG_TIPOS = { rodizio: 'Rodízio', mesclada: 'Mesclada', recoleta: 'Recoleta', avulsa: 'Avulsa', projeto: 'Projeto' };
const AG_RES = [['PENDENTE', 'Pendente'], ['CONFORME', 'Conforme'], ['NÃO CONFORME', 'Não conforme']];
const PJ_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'], PJ_DIAS3 = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const PJ_SIT = { aguardando: ['A confirmar', ''], confirmada: ['Confirmada', 'ok'], remarcada: ['Remarcada', ''], atrasada: ['Atrasada', 'cr'], lancada: ['Lançada', 'ok'], pulada: ['Não houve', ''] };
const PJ_TIPO1 = { bebedouro: 'Bebedouro', caixa: 'Caixa d’água', tratamento: 'Tratamento', reservatorio: 'Açude ou reservatório', bacia: 'Bacia', poco: 'Poço', outro: 'Outro' };
const agNome = b => b.codigo + (b.local ? ' — ' + b.local : '');
const agDia = ts => { if (/^\d{4}-\d{2}-\d{2}$/.test(String(ts || ''))) return String(ts); const d = new Date(ts); return isNaN(d) ? String(ts || '').slice(0, 10) : d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const agDif = (a, b) => coDif(a, b);
const agBl = (rot, html, dica) => lcBl(rot, html, dica, 'ag-al'); /* .ag-al: lista retrátil com a mesma altura do campo ao lado */
const agCmp = (a, b) => String(a || '').localeCompare(String(b || ''), 'pt-BR', { numeric: true });

/* ---------- carregar ---------- */
CS_CARGAS.push(() => {
  const re = () => { S.agCarregado = true; if (S.rota.area === 'coletas' || S.rota.area === 'inicio') render(); else if (S.gv) gvDesenha(); };
  /* v0.6.6: as coletas carregam para todos (o responsável por uma ação corretiva pode não ter a atribuição Coletas); a aba continua só com ela */
  csOuve('sv2_aguacol', l => { S.aguacol = l; re(); if (typeof acLimparUmaVez === 'function') acLimparUmaVez(); });
  if (!coVe()) return;
  csOuve('sv2_aguaproj', l => { S.aguaproj = l; re(); });
  csOuve('sv2_aguaponto', l => { S.aguapontos = l; re(); });
});

/* ---------- cálculos do rodízio (iguais ao EFClaudian) ---------- */
function agCfg() { const c = Object.assign({}, AG_CFG_PADRAO, S.cfgAgua || {}); ['periodoDias', 'porVez', 'laudoDias', 'recoletaDias'].forEach(k => { c[k] = Math.max(1, parseInt(c[k], 10) || AG_CFG_PADRAO[k]); }); c.fora = Array.isArray(c.fora) ? c.fora : []; return c; }
function agBebs() { const f = agCfg().fora, L = pjLegadoSalvo(); return S.bebs.filter(b => b.situacao === 'ativo' && (L ? (L.pontos || []).indexOf('beb:' + b.id) >= 0 : f.indexOf(b.id) < 0)).sort((a, b) => agCmp(a.codigo, b.codigo)); }
function agBebIds(c) { if (Array.isArray(c.bebIds) && c.bebIds.length) return c.bebIds; const p = String(c.pontoRef || ''); return p.indexOf('beb:') === 0 ? [p.slice(4)] : []; }
const agAtivas = () => (S.aguacol || []).filter(c => c.situacao !== 'cancelada');
const agUltima = bebId => agAtivas().filter(c => agBebIds(c).indexOf(bebId) >= 0).map(c => c.data).sort().pop() || '';
function agPorVez() { const L = pjLegadoSalvo(); return L ? (Number(L.porVez) > 0 ? Number(L.porVez) : agBebs().length) : agCfg().porVez; }
const agSugeridos = () => agBebs().slice().sort((a, b) => (agUltima(a.id) || '0000').localeCompare(agUltima(b.id) || '0000') || (b.rodizioAuto ? 1 : 0) - (a.rodizioAuto ? 1 : 0) || agCmp(a.codigo, b.codigo)).slice(0, agPorVez()); /* v0.6.14.1: entre os nunca coletados, o bebedouro novo vem primeiro */
const agNC = c => c.resultado === 'NÃO CONFORME';
const agTipoTxt = c => AG_TIPOS[c.tipoColeta] || 'Avulsa';
const agAgenteTxt = c => (c.agente || []).map(a => a === 'outro' ? (c.agenteOutro || 'Outro') : ((AG_AGENTES.find(x => x[0] === a) || [])[1] || a)).join(', ');
const agAcSit = a => !a ? '' : a.concluida ? 'concluida' : (a.prazo && a.prazo < hojeISO() ? 'vencida' : 'aberta');
const agAcTxt = a => ({ concluida: 'Concluída', vencida: 'Vencida', aberta: 'Aberta' })[agAcSit(a)] || '';
const agAcAbertas = () => agAtivas().filter(c => c.acao && !c.acao.concluida);
function agRecoletasPend() {
  const at = agAtivas(), cfg = agCfg();
  return at.filter(c => (agNC(c) || c.recoletaPedida) && !at.some(x => x.recoletaDe === c.id)).map(c => {
    const base = agNC(c) ? (c.laudoEm || c.data) : (c.recoletaPedida && c.recoletaPedida.ts ? agDia(c.recoletaPedida.ts) : c.data);
    return { c: c, ate: addDias(base, cfg.recoletaDias), motivo: agNC(c) ? 'não conforme' + (c.gravidade ? ' (' + c.gravidade + ')' : '') : 'pedida: ' + ((c.recoletaPedida && c.recoletaPedida.motivo) || '') };
  }).sort((a, b) => a.ate.localeCompare(b.ate));
}
const agLaudoAtrasado = c => c.situacao !== 'cancelada' && !!c.envio && c.resultado === 'PENDENTE' && agDif(c.envio, hojeISO()) > agCfg().laudoDias;
function agPlano() {
  const cfg = agCfg(), rod = agAtivas().filter(c => c.tipoColeta === 'rodizio' || c.tipoColeta === 'mesclada').sort((a, b) => String(b.data + b.criadoEm).localeCompare(String(a.data + a.criadoEm)));
  const ult = rod[0], px = pjProxima(pjLegado());
  if (!ult) return { tipo: 'rodizio', ate: px ? px.data : hojeISO(), oc: px ? px.oc : '', bebs: agSugeridos(), ult: null, aguardando: false };
  const grupo = rod.filter(c => (c.rodada || c.id) === (ult.rodada || ult.id));
  const pend = grupo.some(c => c.resultado === 'PENDENTE'), tudoOk = grupo.every(c => c.resultado === 'CONFORME');
  const tipo = ult.tipoColeta === 'rodizio' && !grupo.some(agNC) && pjLegado().mesclada !== false ? 'mesclada' : 'rodizio';
  return { tipo: tipo, ate: px ? px.data : addDias(ult.data, cfg.periodoDias), oc: px ? px.oc : '', bebs: tipo === 'mesclada' ? agBebs() : agSugeridos(), ult: ult, aguardando: tipo === 'mesclada' && pend && !tudoOk };
}
function agDiasLaudo() {
  const m = {};
  agAtivas().filter(c => c.envio && c.laudoEm && c.laudoEm >= c.envio && c.lab).forEach(c => { (m[c.lab] = m[c.lab] || []).push(agDif(c.envio, c.laudoEm)); });
  return Object.keys(m).sort().map(l => ({ lab: l, dias: Math.round(m[l].reduce((a, b) => a + b, 0) / m[l].length * 10) / 10, n: m[l].length }));
}
/* o que está em aberto, para o acompanhamento */
function agPend() { return { rec: agRecoletasPend(), ac: agAcAbertas(), atr: agAtivas().filter(agLaudoAtrasado) }; }

/* ---------- projetos: só leitura (o calendário do EFClaudian) ---------- */
const pjAnPadrao = () => { const ans = (S.analises || []).filter(a => a.tipo === 'AGUA' && a.ativo !== false); return ans.find(a => /MICRO/i.test(a.nome)) || ans[0] || {}; };
function pjLegadoVirtual() {
  const c = agCfg();
  return { id: 'legado', legado: true, _virtual: true, nome: 'Rodízio dos bebedouros', pontos: (S.bebs || []).filter(b => b.situacao === 'ativo' && c.fora.indexOf(b.id) < 0).map(b => 'beb:' + b.id),
    porVez: c.porVez, mesclada: true, analiseId: pjAnPadrao().id || '', lab: '', cadaSemanas: Math.max(1, Math.round(c.periodoDias / 7)), dia: 2, hora: '08:00', inicio: hojeISO(), confirmadas: {}, remarcadas: {}, puladas: {}, ativo: true };
}
/* v0.6.10.1: bebedouro cadastrado aqui (Cloro) depois do último salvamento do projeto entra sozinho no rodízio; ao salvar o projeto ele passa a valer como ponto comum */
const pjLegadoSalvo = () => { const p = (S.aguaproj || []).find(x => x.id === 'legado'); if (!p) return null;
  const nv = (S.bebs || []).filter(b => b.situacao === 'ativo' && b.rodizioAuto && (p.pontos || []).indexOf('beb:' + b.id) < 0 && String(b.ativoDesde || b.criadoEm || '') > String(p.atualizadoEm || '')).map(b => 'beb:' + b.id);
  return nv.length ? Object.assign({}, p, { pontos: (p.pontos || []).concat(nv) }) : p; };
const pjLegado = () => pjLegadoSalvo() || pjLegadoVirtual();
function pjProjetos() {
  const L = pjLegado(), l = (S.aguaproj || []).filter(p => p.ativo !== false && p.id !== 'legado').sort((a, b) => agCmp(a.nome, b.nome));
  return (L.ativo !== false && (L.pontos || []).length ? [L] : []).concat(l);
}
const pjDe = id => id === 'legado' ? pjLegado() : (S.aguaproj || []).find(p => p.id === id) || null;
function pjPontos() {
  const cmp = (a, b) => agCmp(a.cod, b.cod);
  const bs = (S.bebs || []).filter(b => b.situacao === 'ativo').map(b => ({ ref: 'beb:' + b.id, tipo: 'bebedouro', cod: b.codigo, nome: agNome(b), local: b.local || '' }));
  const cx = (S.caixas || []).filter(c => !c.desativado).map(c => ({ ref: 'caixa:' + c.id, tipo: 'caixa', cod: c.tag, nome: c.tag + ' — ' + (c.local || ''), local: [c.local, c.tipo].filter(Boolean).join(' · ') }));
  const ou = (S.aguapontos || []).filter(p => p.ativo !== false).map(p => ({ ref: 'ponto:' + p.id, tipo: p.tipo || 'outro', cod: p.nome, nome: p.nome + (p.local ? ' — ' + p.local : ''), local: p.local || '' }));
  return bs.sort(cmp).concat(cx.sort(cmp), ou.sort(cmp));
}
const pjPonto = ref => pjPontos().find(p => p.ref === ref) || null;
const pjDow = iso => new Date(iso + 'T12:00:00').getDay();
function pjPrimeira(p) { let d = p.inicio || hojeISO(); for (let i = 0; i < 7 && pjDow(d) !== Number(p.dia); i++) d = addDias(d, 1); return d; }
const pjPasso = p => 7 * Math.max(1, Number(p.cadaSemanas) || 1);
function pjOcsBase(p, ate) { const out = []; let d = pjPrimeira(p); while (d <= ate && out.length < 600) { out.push(d); d = addDias(d, pjPasso(p)); } return out; }
function pjOcs(p, ate) {
  let l = pjOcsBase(p, ate); const ger = new Set(); let passo = pjPasso(p);
  (p.realinhos || []).forEach(r => {
    const k = l.filter(d => d <= r.oc || pjLancadas(p, d).length || (p.puladas || {})[d]);
    let d = addDias(r.data, r.passo); while (d <= ate && k.length < 600) { if (k.indexOf(d) < 0) { k.push(d); ger.add(d); } d = addDias(d, r.passo); }
    l = k; passo = r.passo;
  });
  (p.fixas || []).forEach(f => {
    const perto = l.filter(d => ger.has(d) && d !== f && Math.abs(agDif(d, pjEfetiva(p, f).data)) < passo / 2).sort((a, b) => Math.abs(agDif(a, pjEfetiva(p, f).data)) - Math.abs(agDif(b, pjEfetiva(p, f).data)))[0];
    if (perto) l = l.filter(d => d !== perto);
    if (f <= ate && l.indexOf(f) < 0) l.push(f);
  });
  return l.sort((a, b) => pjEfetiva(p, a).data.localeCompare(pjEfetiva(p, b).data) || a.localeCompare(b));
}
const pjLancadas = (p, oc) => agAtivas().filter(c => c.projetoId === p.id && c.ocorrencia === oc);
function pjEfetiva(p, oc) { const r = (p.remarcadas || {})[oc]; return { data: r ? r.data : oc, hora: (r && r.hora) || p.hora || '' }; }
function pjSit(p, oc) {
  if (pjLancadas(p, oc).length) return 'lancada';
  if ((p.puladas || {})[oc]) return 'pulada';
  if (pjEfetiva(p, oc).data < hojeISO()) return 'atrasada';
  if ((p.remarcadas || {})[oc]) return 'remarcada';
  if ((p.confirmadas || {})[oc]) return 'confirmada';
  return 'aguardando';
}
function pjPendentes(p, n) {
  const l = pjOcs(p, addDias(hojeISO(), pjPasso(p) * (n + 1))).filter(d => ['lancada', 'pulada'].indexOf(pjSit(p, d)) < 0).map(d => Object.assign({ oc: d, sit: pjSit(p, d) }, pjEfetiva(p, d)));
  return l.sort((a, b) => a.data.localeCompare(b.data)).slice(0, n);
}
const pjProxima = p => pjPendentes(p, 1)[0] || null;
function pjUtilAntes(iso) { let d = addDias(iso, -1); while (pjDow(d) === 0 || pjDow(d) === 6) d = addDias(d, -1); return d; }
const pjAvisar = x => !!x && x.sit === 'aguardando' && hojeISO() >= pjUtilAntes(x.data);
const pjDataTxt = x => PJ_DIAS3[pjDow(x.data)] + ' ' + fmtD(x.data).slice(0, 5) + (x.hora ? ' · ' + x.hora : '');
function pjQuandoTxt(p) { const n = Math.max(1, Number(p.cadaSemanas) || 1), dia = PJ_DIAS[p.dia] || ''; const nome = { 1: 'toda ' + dia, 2: 'quinzenal, ' + dia, 4: 'mensal (a cada 4 semanas), ' + dia, 8: 'bimestral, ' + dia, 13: 'trimestral, ' + dia, 26: 'semestral, ' + dia }[n] || 'a cada ' + n + ' semanas, ' + dia; return nome + (p.hora ? ' · ' + p.hora : ''); }
const pjUltimaRef = ref => { const b = ref.indexOf('beb:') === 0 ? ref.slice(4) : ''; return agAtivas().filter(c => c.pontoRef === ref || (b && agBebIds(c).indexOf(b) >= 0)).map(c => c.data).sort().pop() || ''; };
function pjSugeridos(p) {
  const l = (p.pontos || []).map(pjPonto).filter(Boolean);
  if (!(Number(p.porVez) > 0)) return l;
  return l.slice().sort((a, b) => (pjUltimaRef(a.ref) || '0000').localeCompare(pjUltimaRef(b.ref) || '0000') || agCmp(a.cod, b.cod)).slice(0, Number(p.porVez));
}
function pjOQue(p) {
  if (p.legado) { const pl = agPlano(); return pl.tipo === 'mesclada' ? 'Mesclada · todos os bebedouros (' + pl.bebs.length + ')' : 'Rodízio · ' + (pl.bebs.map(b => b.codigo).join(', ') || 'nenhum bebedouro'); }
  const s = pjSugeridos(p), n = (p.pontos || []).length;
  return Number(p.porVez) > 0 ? 'Rodízio · ' + s.map(x => x.cod).join(', ') : (n <= 4 ? s.map(x => x.cod).join(', ') : 'Todos os ' + n + ' pontos');
}
function pjVinculoLegado(data) { const L = pjLegado(), x = pjProxima(L); return x && data >= addDias(x.data, -6) ? { projetoId: 'legado', ocorrencia: x.oc } : {}; }

/* ======================= tela ======================= */
const agPode = () => coPode();
function agMeta(p) {
  const pl = (n, um, mais) => n + ' ' + (n === 1 ? um : mais), m = [];
  if (p.rec.length) m.push(metaPl(pl(p.rec.length, 'recoleta', 'recoletas'), p.rec.some(r => r.ate < hojeISO()) ? 'cr' : 'wa'));
  if (p.atr.length) m.push(metaPl(pl(p.atr.length, 'laudo atrasado', 'laudos atrasados'), 'cr', 'alerta'));
  if (p.ac.length) m.push('<span>' + pl(p.ac.length, 'ação corretiva aberta', 'ações corretivas abertas') + '</span>');
  return m;
}
/* caixas dos projetos (só leitura) */
function agBoxesHTML() {
  const ps = pjProjetos(), sup = isSup(S.user); if (!ps.length && !sup) return '';
  return '<div class="ag-boxes">' + ps.map(p => {
    const x = pjProxima(p), sit = x ? PJ_SIT[x.sit] : null, av = pjAvisar(x), cor = x && x.sit === 'atrasada' ? 'cr' : av ? 'wa' : '';
    return '<div class="ag-box' + (cor ? ' ' + cor : '') + '" data-act="pj-abre" data-id="' + esc(p.id) + '" role="button" tabindex="0" aria-label="Abrir o projeto ' + esc(p.nome) + '"><span class="ag-bt"><b>' + esc(p.nome) + '</b>' + (sit ? alPill(sit[0], av ? 'wa' : sit[1]) : '') + '</span>' +
      '<span class="ag-bq">' + (x ? 'Próxima: <b>' + esc(pjDataTxt(x)) + '</b>' + (x.oc && x.oc !== x.data ? ' <small>(remarcada, o normal seria ' + esc(PJ_DIAS3[pjDow(x.oc)] + ' ' + fmtD(x.oc).slice(0, 5)) + ')</small>' : '') : 'Sem data') + '</span><small>' + esc(pjOQue(p)) + '</small>' +
      '<small>' + esc(pjQuandoTxt(p) + ' · ' + pjAnsTxt(p)) + '</small>' +
      (agPode() && x ? '<button type="button" class="bt' + (x.data <= hojeISO() ? ' pr' : '') + '" data-act="ag-nova" data-pid="' + esc(p.id) + '" data-oc="' + esc(x.oc) + '">' + ic('mais') + 'Lançar esta coleta</button>' : '') + '</div>';
  }).join('') + (sup ? '<button type="button" class="ag-box ag-novo" data-act="pj-novo">' + ic('mais') + '<b>Novo projeto</b><small>pontos, análises, dia e frequência</small></button>' : '') + '</div>';
}
/* acompanhamento: recoletas, ações corretivas, laudos atrasados */
function agPendLinhas() {
  const p = agPend(), hoje = hojeISO(), podeL = agPode(), l = [];
  const venceTxt = ate => ate < hoje ? '<b class="cr">venceu ' + esc(fmtD(ate).slice(0, 5)) + '</b>' : ate === hoje ? '<b class="wa">hoje</b>' : 'até ' + esc(fmtD(ate).slice(0, 5));
  p.rec.forEach(r => l.push({ cls: r.ate < hoje ? 'cr' : 'wa', t: 'Recoleta · ' + r.c.pontoNome, d: esc(r.motivo) + ' · coleta de ' + esc(fmtD(r.c.data).slice(0, 5)) + ' · ' + venceTxt(r.ate), bt: podeL ? '<button type="button" class="bt pr" data-act="ag-nova" data-tipo="recoleta">Lançar</button>' : '' }));
  p.ac.forEach(c => l.push({ cls: agAcSit(c.acao) === 'vencida' ? 'cr' : 'wa', t: 'Ação corretiva · ' + c.pontoNome, d: esc((c.acao.responsavelNome || '') + ' · ' + (c.acao.etapas || []).length + ' etapa(s) · ') + (agAcSit(c.acao) === 'vencida' ? '<b class="cr">prazo venceu ' + esc(fmtD(c.acao.prazo).slice(0, 5)) + '</b>' : 'prazo ' + esc(fmtD(c.acao.prazo).slice(0, 5))), bt: '<button type="button" class="bt" data-act="ac-abre" data-id="' + esc(c.id) + '">Abrir</button>' }));
  p.atr.forEach(c => l.push({ cls: 'wa', t: 'Laudo atrasado · ' + c.pontoNome, d: esc((c.lab || 'sem laboratório') + ' · enviada em ' + fmtD(c.envio).slice(0, 5) + ' · ' + agDif(c.envio, hoje) + ' dias'), bt: '<button type="button" class="bt" data-act="ag-abre" data-id="' + esc(c.id) + '">Abrir</button>' }));
  return l;
}
const agLinhaHTML = x => '<div class="ag-l ' + x.cls + '"><span class="ag-t"><b>' + esc(x.t) + '</b><small>' + x.d + '</small></span>' + (x.bt || '') + '</div>';
/* acompanhamento numa gaveta (OPÇÃO 2, aprovada em 11/11 21:56) */
function agPendAbre() {
  gvAbrir(() => { const l = agPendLinhas(), dl = agDiasLaudo(), cfg = agCfg();
    return { ico: 'lista', sub: 'Coletas › Água', titulo: 'Acompanhamento', corpo: '<p class="ag-dc">Laudo em até ' + cfg.laudoDias + ' dias' + (dl.length ? ' · média: ' + dl.map(x => esc(x.lab) + ' ' + String(x.dias).replace('.', ',') + ' d').join(', ') : '') + '</p>' +
      '<div class="ag-pn ag-gv">' + (l.length ? l.map(agLinhaHTML).join('') : '<p class="ag-nd">Nada pendente: recoletas, ações corretivas e laudos atrasados aparecem aqui.</p>') + '</div>' }; });
  render();
}
function agTabela() {
  const l = S.aguacol.slice().sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')) || String(b.hora || '').localeCompare(String(a.hora || '')) || agCmp(a.pontoNome, b.pontoNome));
  const SITS = [['pend', 'Resultado pendente'], ['atr', 'Laudo atrasado'], ['ok', 'Conforme'], ['nc', 'Não conforme'], ['ac', 'Ação corretiva aberta'], ['cancelada', 'Canceladas']];
  const sit = (c, v) => v === 'cancelada' ? c.situacao === 'cancelada' : c.situacao === 'cancelada' ? false : v === 'pend' ? c.resultado === 'PENDENTE' : v === 'atr' ? agLaudoAtrasado(c) : v === 'ok' ? c.resultado === 'CONFORME' : v === 'nc' ? agNC(c) : !!(c.acao && !c.acao.concluida);
  return tbHTML({ id: 'ag-col', titulo: 'Coletas de água', unidade: 'coletas', linhas: l, aoClicar: agAbre, selecionado: S._agSel, buscaDica: 'Buscar ponto, análise, laboratório ou O.S',
    busca: c => [c.pontoNome, c.analiseNome, c.lab, c.os, c.numSolicitacao, agAgenteTxt(c), c.coletor, agTipoTxt(c)].join(' '),
    filtros: [
      { k: 'tipo', rot: 'Tipo', opcoes: Object.keys(AG_TIPOS).map(k => [k, AG_TIPOS[k]]), teste: (c, v) => (c.tipoColeta || 'avulsa') === v },
      { k: 'sit', rot: 'Situação', opcoes: SITS, teste: sit },
      { k: 'lab', rot: 'Laboratório', opcoes: Array.from(new Set(l.map(c => c.lab).filter(Boolean))).sort().map(x => [x, x]), teste: (c, v) => c.lab === v }],
    cols: [
      { k: 'data', rot: 'Coleta', tipo: 'data', v: c => c.data || '' },
      { k: 'hora', rot: 'Hora', v: c => c.hora || '' },
      { k: 'tipo', rot: 'Tipo', v: agTipoTxt },
      { k: 'ponto', rot: 'Ponto', fixa: true, v: c => c.pontoNome || '', cls: 'forte' },
      { k: 'an', rot: 'Análise', v: c => c.analiseNome || '' },
      { k: 'lab', rot: 'Laboratório', v: c => c.lab || '' },
      { k: 'env', rot: 'Envio', tipo: 'data', v: c => c.envio || '' },
      { k: 'os', rot: 'O.S', v: c => c.os || '' },
      { k: 'res', rot: 'Resultado', v: c => c.situacao === 'cancelada' ? 'Cancelada' : c.resultado === 'PENDENTE' ? (agLaudoAtrasado(c) ? 'Laudo atrasado' : 'Pendente') : c.resultado === 'CONFORME' ? 'Conforme' : 'Não conforme',
        html: c => c.situacao === 'cancelada' ? alPill('Cancelada') : agLaudoAtrasado(c) ? alPill('Laudo atrasado', 'cr') : alPill(c.resultado === 'PENDENTE' ? 'Pendente' : c.resultado === 'CONFORME' ? 'Conforme' : 'Não conforme', c.resultado === 'CONFORME' ? 'ok' : agNC(c) ? 'cr' : 'wa') },
      { k: 'ag', rot: 'Agente', v: agAgenteTxt },
      { k: 'gr', rot: 'Gravidade', v: c => c.gravidade ? (c.gravidade === 'grave' ? 'Grave' : 'Leve') : '' },
      { k: 'ac', rot: 'Ação corretiva', v: c => c.acao ? agAcTxt(c.acao) + ' · ' + (c.acao.responsavelNome || '') : '' }] });
}
function agTela(aba) {
  const p = agPend(), np = agPendLinhas().length, podeCfg = isSup(S.user);
  const ext = '<a class="bt ic-so" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener" title="No EFClaudian: projetos, pontos e etiqueta da caixa" aria-label="Abrir o EFClaudian (projetos, pontos e etiqueta da caixa)">' + ic('externo') + '</a>';
  const acoes = (np ? '<button type="button" class="bt" data-act="ag-pend">' + ic('lista') + 'Acompanhamento (' + np + ')</button>' : '') +
    (agPode() ? '<button type="button" class="bt pr" data-act="ag-nova">' + ic('mais') + 'Nova coleta de água</button>' : '') +
    (podeCfg ? '<button type="button" class="bt ic-so" data-act="agr-abre" title="Relatório de água por local" aria-label="Relatório de água por local">' + ic('impressora') + '</button>' : '') +
    (podeCfg ? '<button type="button" class="bt ic-so" data-act="ag-cfg" title="Prazos da água" aria-label="Prazos da água">' + ic('eng') + '</button>' : '') + ext;
  const h = cabecalho({ titulo: aba.nome, abaNome: aba.nome, meta: agMeta(p), acoes: acoes });
  if (!S.agCarregado && !DEMO) return h + '<section class="pn"><div class="vazio">' + ic('relogio') + '<b>Carregando as coletas de água…</b></div></section>';
  if (!S.bebs.length && !S.caixas.length && !S.aguacol.length) return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Nenhum ponto de água cadastrado.</b><span>Bebedouros e caixas d’água são cadastrados em Inspeções › Cloro e em Documentos › Caixas d’água.</span></div></section>';
  return h + agBoxesHTML() + agTabela();
}

/* ======================= detalhe ======================= */
function agEtapas(c) {
  const e = [], nc = agNC(c), orig = c.recoletaDe ? S.aguacol.find(x => x.id === c.recoletaDe) : null, atr = agLaudoAtrasado(c);
  e.push({ nome: 'Coletada', feito: true, data: c.data || '', txt: [c.hora, agTipoTxt(c) + (orig ? ' de ' + fmtD(orig.data).slice(0, 5) : ''), c.qtd ? c.qtd + ' amostra(s)' : '', c.coletor ? 'coletor ' + c.coletor : ''].filter(Boolean).join(' · '), quem: c.criadoPorNome });
  e.push({ nome: 'Enviada', feito: !!c.envio, data: c.envio || '', txt: c.envio ? [c.lab, c.numSolicitacao ? 'solicitação ' + c.numSolicitacao : ''].filter(Boolean).join(' · ') : '' });
  e.push({ nome: 'O.S', feito: !!c.os, txt: c.os ? c.os : c.envio ? 'o laboratório ainda não mandou' : '' });
  e.push({ nome: nc ? 'Resultado: não conforme' : c.resultado === 'CONFORME' ? 'Resultado: conforme' : 'Resultado', feito: c.resultado !== 'PENDENTE', data: c.laudoEm || '', txt: nc ? [agAgenteTxt(c), c.gravidade ? 'gravidade ' + c.gravidade : ''].filter(Boolean).join(' · ') : c.resultado === 'PENDENTE' && c.envio ? 'previsto até ' + fmtD(addDias(c.envio, agCfg().laudoDias)) : c.envio && c.laudoEm ? agDif(c.envio, c.laudoEm) + ' dia(s) do envio ao laudo' : '', alerta: atr ? 'laudo atrasado: passou de ' + agCfg().laudoDias + ' dias do envio' : '' });
  e.push({ nome: 'Compra do serviço', feito: c.compra === 'solicitado', data: c.dataSolicitacao || '', txt: c.pedidoSankhya ? 'Nº ' + c.pedidoSankhya + (c.nf ? ' · NF ' + c.nf : '') : '', quem: c.solicitadoPorNome });
  if (c.situacao !== 'cancelada') { const at = e.find(x => !x.feito); if (at) at.atual = true; }
  return e;
}
function agAbre(id) {
  S._agSel = id; gvAbrir(() => {
    const c = S.aguacol.find(x => x.id === id); if (!c) return null; const canc = c.situacao === 'cancelada', pode = agPode() && !canc, nc = agNC(c);
    const orig = c.recoletaDe ? S.aguacol.find(x => x.id === c.recoletaDe) : null, filha = S.aguacol.find(x => x.recoletaDe === c.id && x.situacao !== 'cancelada');
    const bebs = agBebIds(c).map(b => { const x = S.bebs.find(y => y.id === b); return x ? x.codigo : ''; }).filter(Boolean);
    let pe = '';
    if (pode) {
      pe += '<button type="button" class="bt" data-act="ag-env" data-id="' + esc(c.id) + '">' + ic('sai') + (c.envio ? 'Corrigir envio' : 'Informar envio') + '</button>';
      pe += '<button type="button" class="bt' + (c.resultado === 'PENDENTE' ? ' pr' : '') + '" data-act="ag-res" data-id="' + esc(c.id) + '">' + ic('ok') + (c.resultado === 'PENDENTE' ? 'Registrar resultado' : 'Corrigir resultado') + '</button>';
      if (!nc && !filha && !c.recoletaPedida && bebs.length) pe += '<button type="button" class="bt" data-act="ag-rec" data-id="' + esc(c.id) + '">' + ic('recontar') + 'Pedir recoleta</button>';
    }
    const cab = isSup(S.user) && !canc ? '<button type="button" class="bt ic-so" data-act="ag-canc" data-id="' + esc(c.id) + '" title="Cancelar a coleta" aria-label="Cancelar a coleta">' + ic('lixo') + '</button>' : '';
    const a = c.acao, acBl = a ? '<p class="gv-h">Ação corretiva</p><button type="button" class="ac-res" data-act="ac-abre" data-id="' + esc(c.id) + '"><span><b>' + esc(a.responsavelNome || '') + '</b><small>' + esc('prazo ' + fmtD(a.prazo) + ' · ' + (a.etapas || []).length + ' etapa(s)' + (a.orientacao ? ' · ' + a.orientacao : '')) + '</small></span>' + acPill(a) + '</button>' : nc && !canc && isSup(S.user) ? '<p class="gv-h">Ação corretiva</p><button type="button" class="bt pr ac-abrir" data-act="ac-nova" data-id="' + esc(c.id) + '">' + ic('lista') + 'Abrir ação corretiva</button>' : '';
    return { ico: 'frasco', cabAcoes: cab, sub: (c.analiseNome || '') + ' · ' + agTipoTxt(c), titulo: c.pontoNome || 'Coleta de água', pill: canc ? alPill('Cancelada') : agLaudoAtrasado(c) ? alPill('Laudo atrasado', 'cr') : alPill(c.resultado === 'PENDENTE' ? 'Pendente' : c.resultado === 'CONFORME' ? 'Conforme' : 'Não conforme', c.resultado === 'CONFORME' ? 'ok' : nc ? 'cr' : 'wa'),
      corpo: (canc ? '' : tlFluido('ag-' + c.id, agEtapas(c))) + '<p class="gv-h">Coleta</p>' + gvCampos([['Semana', c.semana ? 'semana ' + c.semana : ''], ['Tipo', agTipoTxt(c) + (orig ? ' · recoleta de ' + fmtD(orig.data) + ' (' + String(orig.resultado || '').toLowerCase() + ')' : '')], ['Bebedouros', bebs.length > 1 ? bebs.join(', ') : ''], ['Quantidade', c.qtd ? String(c.qtd) : ''], ['Laboratório', c.lab], ['Valor', c.valor ? brl(c.valor) : ''],
        ['Recoleta', filha ? 'lançada em ' + fmtD(filha.data) + ' · ' + String(filha.resultado || '').toLowerCase() : c.recoletaPedida ? 'pedida: ' + c.recoletaPedida.motivo + ' — ' + (c.recoletaPedida.porNome || '') + ', ' + fmtDT(c.recoletaPedida.ts) : ''],
        ['Ação corretiva', !a && nc && !canc && !isSup(S.user) ? 'ainda não aberta (o Líder ★ ou o Administrador abre)' : ''], ['Observação', c.obs], ['Cancelada', canc ? c.canceladaMotivo || 'sim' : '']]) + acBl,
      rodape: pe };
  });
  render();
}

/* ======================= formulários ======================= */
const agDDAn = () => (S.analises || []).filter(a => a.tipo === 'AGUA' && a.ativo !== false);
function agAgoraHM() { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function agCk(g, id, on, t, sub) { return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="ag-ck" data-g="' + g + '" data-id="' + esc(id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(t) + '</b><small>' + esc(sub || '') + '</small></span></button>'; }
function agNovoEstado(tipo, oc, pid) {
  const pj = pid ? pjDe(pid) : null, pl = agPlano(), rec = agRecoletasPend(), an = agDDAn(), anPad = (an.find(a => /MICRO/i.test(a.nome)) || an[0] || {}).id || '';
  let t = pj && !pj.legado ? 'projeto' : pj && pj.legado ? pl.tipo : AG_TIPOS[tipo] && tipo !== 'projeto' ? tipo : (rec.length ? 'recoleta' : pl.tipo);
  const bebs = {}; agSugeridos().forEach(b => { bebs[b.id] = true; }); const recs = {}; rec.forEach(r => { recs[r.c.id] = true; });
  const ppt = {}, pan = {}; if (pj && !pj.legado) { pjSugeridos(pj).forEach(x => { ppt[x.ref] = true; }); pjAnIds(pj).forEach(a => { pan[a] = true; }); }
  const anP = pj && pjAnIds(pj)[0] && an.some(a => a.id === pjAnIds(pj)[0]) ? pjAnIds(pj)[0] : anPad;
  return { k: 'agNova', tipo: t, bebs: bebs, recs: recs, ppt: ppt, pan: pan, pid: pj ? pj.id : '', pv: '', outro: '', data: hojeISO(), hora: agAgoraHM(), an: anP, qtd: '1', lab: pj ? pj.lab || '' : '', coletor: S.user.nome, oc: oc || '' };
}
function agTipoDica(f) {
  const p = agPlano();
  return f.tipo === 'recoleta' ? 'Repete os bebedouros que deram não conforme (ou que tiveram recoleta pedida).' : f.tipo === 'avulsa' ? 'Fora do rodízio: qualquer ponto (caixa, bebedouro, poço, torneira). Não conta no rodízio.' : f.tipo === p.tipo ? 'É a próxima do rodízio.' : 'A próxima do rodízio seria: ' + AG_TIPOS[p.tipo] + '.';
}
LC_FORM.agNova = f => {
  const rec = agRecoletasPend(), bebs = agBebs(), cfg = agCfg(), ans = agDDAn(), tipos = [['rodizio', 'Rodízio'], ['mesclada', 'Mesclada']].concat(rec.length ? [['recoleta', 'Recoleta (' + rec.length + ')']] : []).concat([['avulsa', 'Avulsa']]);
  const ult = id => { const u = agUltima(id); return u ? 'última ' + fmtD(u).slice(0, 5) : 'nunca coletado'; };
  let onde = '';
  if (f.tipo === 'rodizio') onde = '<p class="ag-dc">Marcados: os ' + agPorVez() + ' há mais tempo sem coleta. Uma amostra por bebedouro.</p><div class="fm-pk"><div class="fm-pkl co-pkl">' + (bebs.length ? bebs.map(b => agCk('bebs', b.id, !!f.bebs[b.id], b.codigo, (b.local || '') + ' · ' + ult(b.id))).join('') : '<p class="ag-dc">Nenhum bebedouro ativo.</p>') + '</div></div>';
  else if (f.tipo === 'mesclada') onde = '<p class="ag-dc">Uma amostra só, com a água de todos os bebedouros do rodízio.</p><div class="gv-lotes">' + bebs.map(b => '<div class="gv-lote"><span><b>' + esc(b.codigo) + '</b> ' + esc(b.local || '') + '</span></div>').join('') + '</div>';
  else if (f.tipo === 'recoleta') onde = '<p class="ag-dc">Nos mesmos bebedouros da coleta que precisa repetir.</p><div class="fm-pk"><div class="fm-pkl co-pkl">' + rec.map(r => agCk('recs', r.c.id, !!f.recs[r.c.id], r.c.pontoNome, r.motivo + ' · até ' + fmtD(r.ate).slice(0, 5))).join('') + '</div></div>';
  else if (f.tipo === 'projeto') { const pj = pjDe(f.pid); onde = '<p class="ag-dc">' + (Number(pj.porVez) > 0 ? 'Marcados: os ' + Number(pj.porVez) + ' há mais tempo sem coleta.' : 'Todos os pontos do projeto.') + ' Uma amostra por ponto' + (pjAnIds(pj).length > 1 ? ' e por análise' : '') + '.</p><div class="fm-pk"><div class="fm-pkl co-pkl">' + (pj.pontos || []).map(pjPonto).filter(Boolean).map(x => agCk('ppt', x.ref, !!f.ppt[x.ref], x.cod, [PJ_TIPO1[x.tipo], pjUltimaRef(x.ref) ? 'última ' + fmtD(pjUltimaRef(x.ref)).slice(0, 5) : 'nunca coletado'].join(' · '))).join('') + '</div></div>'; }
  else { const pts = pjPontos(); onde = agBl('Ponto', ddHTML('ag:pv', f.pv || '', [['', 'Escolha o ponto']].concat(pts.map(p => [p.ref, (PJ_TIPO1[p.tipo] || 'Ponto') + ' · ' + p.nome])).concat([['outro', 'Outro ponto (poço, torneira…)']]))) + (f.pv === 'outro' ? agBl('Nome do ponto', lcIn('outro', f.outro, ' placeholder="Ex.: Poço 03"')) : ''); }
  return { ico: 'frasco', sub: fmtD(hojeISO()) + ' · ' + S.user.nome, titulo: 'Nova coleta de água', corpo: lcMsg() +
    (f.tipo === 'projeto' ? '<p class="gv-h">1 · Projeto</p><div class="pj-ctx"><b>' + esc(pjDe(f.pid).nome) + '</b><small>' + esc('coleta de ' + pjDataTxt(pjEfetiva(pjDe(f.pid), f.oc)) + ' · ' + pjAnsTxt(pjDe(f.pid))) + '</small></div>'
      : '<p class="gv-h">1 · Tipo</p>' + agBl('Tipo da coleta', ddHTML('ag:tipo', f.tipo, tipos), agTipoDica(f))) +
    '<p class="gv-h">2 · Onde</p>' + onde +
    '<p class="gv-h">3 · Coleta</p><div class="fm-g">' + agBl('Data', lcData('data', f.data)) + agBl('Hora', lcIn('hora', f.hora, ' type="time"')) + '</div>' +
    (f.tipo === 'projeto' && pjAnIds(pjDe(f.pid)).length > 1 ? agBl('Análises', '<div class="fm-pk"><div class="fm-pkl co-pkl">' + pjAnIds(pjDe(f.pid)).map(id => ans.find(a => a.id === id)).filter(Boolean).map(a => agCk('pan', a.id, !!f.pan[a.id], a.nome, a.lab ? 'laboratório ' + a.lab : '')).join('') + '</div></div>') + '<div class="fm-g">' + agBl('Laboratório', ddHTML('ag:lab', f.lab || '', [['', 'O de cada análise']].concat(coLabs().map(x => [x, x])))) + '</div>' :
    '<div class="fm-g">' + agBl('Análise', ddHTML('ag:an', f.an || '', ans.length ? ans.map(a => [a.id, a.nome]) : [['', 'Cadastre uma análise de Água no EFClaudian']])) + agBl('Laboratório', ddHTML('ag:lab', f.lab || '', [['', 'O da análise']].concat(coLabs().map(x => [x, x])))) + '</div>') +
    '<div class="fm-g">' + agBl('Amostras por ponto', lcIn('qtd', f.qtd, ' inputmode="numeric"')) + agBl('Coletor', lcIn('coletor', f.coletor)) + '</div>' +
    (f.oc ? lcAv('Conta como a coleta ' + (f.tipo === 'projeto' ? 'do projeto' : 'do rodízio') + ' de ' + esc(fmtD(f.oc).slice(0, 5)) + '.') : ''),
    rodape: lcPe('ag-nova-ok', 'Lançar') };
};
async function agNovaOk() {
  const f = S.fm; if (!f || !agPode()) return;
  const erro = validaData(f.data); if (erro) return lcErro(erro);
  if (!f.hora) return lcErro('Informe a hora.');
  const pj = f.tipo === 'projeto' ? pjDe(f.pid) : null, multi = pj && pjAnIds(pj).length > 1;
  const ansSel = multi ? pjAnIds(pj).filter(id => f.pan[id]).map(id => (S.analises || []).find(a => a.id === id)).filter(Boolean) : [(S.analises || []).find(a => a.id === f.an)].filter(Boolean);
  if (multi && !ansSel.length) return lcErro('Marque pelo menos uma análise.');
  const an = ansSel[0]; if (!an) return lcErro('Escolha a análise (cadastre uma de Água no EFClaudian).');
  const qtd = parseInt(f.qtd, 10); if (!(qtd >= 1 && qtd <= 100)) return lcErro('Quantidade inválida.');
  const tipo = f.tipo, rodada = tipo === 'rodizio' || tipo === 'mesclada' || tipo === 'projeto' ? 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) : '';
  const base = { data: f.data, hora: f.hora, semana: pgSemana(f.data), analiseId: an.id, analiseNome: an.nome, qtd: qtd, coletor: String(f.coletor || '').trim(), lab: f.lab || an.lab || '', envio: '', os: '', numSolicitacao: '', resultado: 'PENDENTE', obs: '', situacao: 'ativa', canceladaMotivo: '', valor: Number(an.valor) || 0, precoRev: Number(an.rev) || 0, nf: '', compra: 'pendente', pedidoSankhya: '', dataSolicitacao: '', solicitadoPor: '', solicitadoPorNome: '', tipoColeta: tipo, agente: [], gravidade: '', laudoEm: '', criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome };
  if (tipo === 'rodizio' || tipo === 'mesclada') Object.assign(base, f.oc ? { projetoId: 'legado', ocorrencia: f.oc } : pjVinculoLegado(f.data));
  if (tipo === 'projeto') Object.assign(base, { projetoId: pj.id, ocorrencia: f.oc });
  const comAn = (o, a) => Object.assign({}, o, { analiseId: a.id, analiseNome: a.nome, lab: f.lab || a.lab || '', valor: Number(a.valor) || 0, precoRev: Number(a.rev) || 0 });
  const regs = [];
  if (tipo === 'avulsa') {
    if (!f.pv) return lcErro('Escolha o ponto.');
    let nome = ''; if (f.pv === 'outro') { nome = String(f.outro || '').trim(); if (nome.length < 2) return lcErro('Informe o nome do ponto.'); } else nome = (pjPonto(f.pv) || {}).nome || '';
    regs.push(Object.assign({}, base, { pontoRef: f.pv, pontoNome: nome, bebIds: f.pv.indexOf('beb:') === 0 ? [f.pv.slice(4)] : [] }));
  } else if (tipo === 'rodizio') {
    const ids = agBebs().filter(b => f.bebs[b.id]).map(b => b.id); if (!ids.length) return lcErro('Marque pelo menos um bebedouro.');
    ids.forEach(id => { const b = S.bebs.find(x => x.id === id); if (b) regs.push(Object.assign({}, base, { pontoRef: 'beb:' + b.id, pontoNome: agNome(b), bebIds: [b.id], rodada: rodada })); });
  } else if (tipo === 'mesclada') {
    const bs = agBebs(); if (!bs.length) return lcErro('Nenhum bebedouro ativo no rodízio.');
    regs.push(Object.assign({}, base, { pontoRef: 'mesclada', pontoNome: 'Mesclada · ' + bs.map(b => b.codigo).join(' + '), bebIds: bs.map(b => b.id), rodada: rodada }));
  } else if (tipo === 'projeto') {
    const refs = (pj.pontos || []).filter(r => f.ppt[r]); if (!refs.length) return lcErro('Marque pelo menos um ponto.');
    refs.forEach(r => { const x = pjPonto(r); if (x) ansSel.forEach(a => regs.push(comAn(Object.assign({}, base, { pontoRef: r, pontoNome: x.nome, bebIds: r.indexOf('beb:') === 0 ? [r.slice(4)] : [], rodada: rodada }), a))); });
  } else if (tipo === 'recoleta') {
    const ids = agRecoletasPend().filter(r => f.recs[r.c.id]).map(r => r.c.id); if (!ids.length) return lcErro('Marque a recoleta que está lançando.');
    ids.forEach(id => { const o = S.aguacol.find(x => x.id === id); if (o) regs.push(Object.assign({}, base, { pontoRef: o.pontoRef, pontoNome: o.pontoNome, bebIds: agBebIds(o), recoletaDe: o.id })); });
  }
  if (!regs.length) return lcErro('Nada para lançar.');
  if (!lcTravar()) return;
  try {
    for (const o of regs) {
      const nid = await Data.col('sv2_aguacol').add(o);
      Audit.log({ acao: 'criar_coleta_agua', entidade: 'coleta_agua', entidadeId: nid, resumo: AG_TIPOS[tipo] + (pj ? ' ' + pj.nome : '') + ': coleta de água ' + o.pontoNome + ' — ' + o.analiseNome + ' (' + qtd + ') em ' + fmtD(f.data) + (o.recoletaDe ? ' (recoleta)' : ''), depois: { tipo: tipo, ponto: o.pontoNome, analise: o.analiseNome, qtd: qtd } });
    }
    lcFim(); aviso(regs.length > 1 ? regs.length + ' coletas de água lançadas.' : 'Coleta de água lançada.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.agEnv = f => { const c = S.aguacol.find(x => x.id === f.id); if (!c) return null;
  return { ico: 'sai', sub: c.pontoNome + ' · coleta de ' + fmtD(c.data), titulo: c.envio ? 'Corrigir o envio' : 'Informar o envio', corpo: lcMsg() +
    '<div class="fm-g">' + agBl('Data do envio', lcData('envio', f.envio)) + agBl('Laboratório', ddHTML('ag:envlab', f.lab || '', [['', '—']].concat(coLabs().map(x => [x, x])))) + '</div>' +
    '<div class="fm-g">' + agBl('O.S', lcIn('os', f.os)) + agBl('Nº da solicitação', lcIn('sol', f.sol)) + '</div>', rodape: lcPe('ag-env-ok', 'Salvar') }; };
async function agEnvOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id); if (!c || !agPode()) return;
  const o = { envio: f.envio || '', lab: f.lab || '', os: String(f.os || '').trim(), numSolicitacao: String(f.sol || '').trim() };
  if (o.envio && !/^\d{4}-\d{2}-\d{2}$/.test(o.envio)) return lcErro('Data do envio inválida.');
  if (o.envio && o.envio > hojeISO()) return lcErro('O envio não pode ser depois de hoje.');
  if (o.envio && o.envio < c.data) return lcErro('O envio não pode ser antes da coleta.');
  if (c.laudoEm && o.envio && c.laudoEm < o.envio) return lcErro('O envio não pode ser depois da data do laudo (' + fmtD(c.laudoEm) + ').');
  const antes = {}, depois = {}; Object.keys(o).forEach(k => { if (String(c[k] == null ? '' : c[k]) !== String(o[k])) { antes[k] = c[k]; depois[k] = o[k]; } });
  if (!Object.keys(depois).length) { lcFim(); return; }
  if (!lcTravar()) return;
  try { await Data.col('sv2_aguacol').update(c.id, o); Audit.log({ acao: 'alterar_coleta_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Atualizou o envio da coleta de água ' + c.pontoNome, antes: antes, depois: depois }); lcFim(); aviso('Envio salvo.'); }
  catch (e) { lcErro(svErro(e)); }
}
LC_FORM.agRes = f => { const c = S.aguacol.find(x => x.id === f.id); if (!c) return null; const nc = f.res === 'NÃO CONFORME';
  return { ico: 'ok', sub: c.pontoNome + ' · coleta de ' + fmtD(c.data), titulo: c.resultado === 'PENDENTE' ? 'Registrar o resultado' : 'Corrigir o resultado', corpo: lcMsg() +
    '<div class="fm-g">' + agBl('Resultado', ddHTML('ag:res', f.res, AG_RES)) + (f.res !== 'PENDENTE' ? agBl('Data do laudo', lcData('laudo', f.laudo)) : '') + '</div>' +
    (nc ? agBl('Agente encontrado', '<div class="fm-pk"><div class="fm-pkl co-pkl">' + AG_AGENTES.map(a => agCk('ag', a[0], f.agente.indexOf(a[0]) >= 0, a[1], '')).join('') + '</div></div>' + (f.agente.indexOf('outro') >= 0 ? lcIn('agOutro', f.agOutro, ' placeholder="Qual outro agente?"') : '')) +
      '<div class="fm-g">' + agBl('Gravidade', ddHTML('ag:grav', f.grav || '', [['', 'Escolha']].concat([['leve', 'Leve'], ['grave', 'Grave']]))) + '</div>' + lcAv('A recoleta nos mesmos bebedouros entra no acompanhamento (até ' + agCfg().recoletaDias + ' dias depois do laudo) e sai o aviso.', 'wa') : '') +
    agBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')), rodape: lcPe('ag-res-ok', 'Salvar') }; };
async function agResOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id); if (!c || !agPode()) return;
  const nc = f.res === 'NÃO CONFORME', o = { resultado: f.res, obs: String(f.obs || '').trim() };
  if (f.res !== 'PENDENTE') { o.laudoEm = f.laudo || hojeISO(); if (c.envio && o.laudoEm < c.envio) return lcErro('A data do laudo não pode ser antes do envio.'); if (o.laudoEm > hojeISO()) return lcErro('A data do laudo não pode ser depois de hoje.'); } else o.laudoEm = '';
  if (nc) {
    o.agente = f.agente.slice(); o.agenteOutro = o.agente.indexOf('outro') >= 0 ? String(f.agOutro || '').trim() : ''; o.gravidade = f.grav || '';
    if (!o.agente.length) return lcErro('Não conforme: marque o agente encontrado.');
    if (o.agente.indexOf('outro') >= 0 && o.agenteOutro.length < 2) return lcErro('Escreva qual é o outro agente.');
    if (!o.gravidade) return lcErro('Não conforme: marque a gravidade (leve ou grave).');
  } else { o.agente = []; o.agenteOutro = ''; o.gravidade = ''; }
  const antes = {}, depois = {}; Object.keys(o).forEach(k => { if (JSON.stringify(c[k] == null ? (Array.isArray(o[k]) ? [] : '') : c[k]) !== JSON.stringify(o[k])) { antes[k] = c[k]; depois[k] = o[k]; } });
  if (!Object.keys(depois).length) { lcFim(); return; }
  if (!lcTravar()) return;
  try {
    await Data.col('sv2_aguacol').update(c.id, o);
    Audit.log({ acao: 'alterar_coleta_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Atualizou a coleta de água ' + c.pontoNome + (depois.resultado ? ' — resultado ' + o.resultado : '') + (nc ? ' · ' + agAgenteTxt(o) + ' · ' + o.gravidade : ''), antes: antes, depois: depois });
    if (nc && (depois.resultado || depois.gravidade || depois.agente)) {
      const ate = addDias(o.laudoEm || hojeISO(), agCfg().recoletaDias), para = Array.from(new Set(supsOf(S.user).concat([S.user.id]).concat(S.users.filter(x => isPrincipal(x) && !x.bloqueado).map(x => x.id))));
      Notif.send({ nivel: o.gravidade === 'grave' ? 'critico' : 'aviso', titulo: 'Água NÃO CONFORME: ' + c.pontoNome, texto: c.analiseNome + ' (coleta de ' + fmtD(c.data) + ') · ' + agAgenteTxt(o) + ' · ' + (o.gravidade === 'grave' ? 'grave' : 'leve') + '. Recoleta nos mesmos bebedouros até ' + fmtD(ate) + '.', para: para, refTipo: 'coleta_agua', refId: c.id });
    }
    lcFim(); aviso(nc ? 'Salvo. A recoleta entrou no acompanhamento.' : 'Salvo.');
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.agRec = f => { const c = S.aguacol.find(x => x.id === f.id); if (!c) return null;
  return { ico: 'recontar', sub: c.pontoNome + ' · coleta de ' + fmtD(c.data), titulo: 'Pedir recoleta', corpo: lcMsg() + lcAv('A recoleta entra no acompanhamento nos mesmos bebedouros, até ' + agCfg().recoletaDias + ' dias depois do pedido.') + agBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('ag-rec-ok', 'Pedir recoleta') }; };
async function agRecOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id); if (!c || !agPode()) return;
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo (pelo menos 5 letras).');
  if (!lcTravar()) return;
  const rp = { motivo: m, por: S.user.id, porNome: S.user.nome, ts: nowISO() };
  try { await Data.col('sv2_aguacol').update(c.id, { recoletaPedida: rp }); Audit.log({ acao: 'pedir_recoleta_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Pediu recoleta de água ' + c.pontoNome + ': ' + m }); lcFim(); aviso('Recoleta pedida: entrou no acompanhamento.'); }
  catch (e) { lcErro(svErro(e)); }
}
LC_FORM.agCanc = f => { const c = S.aguacol.find(x => x.id === f.id); if (!c) return null;
  return { ico: 'lixo', sub: c.pontoNome + ' · coleta de ' + fmtD(c.data), titulo: 'Cancelar a coleta de água', corpo: lcMsg() + lcAv('Ela sai das contagens, mas fica guardada como cancelada, com o motivo.', 'cr') + agBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('ag-canc-ok', 'Cancelar a coleta') }; };
async function agCancOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id); if (!c || !isSup(S.user)) return;
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo (pelo menos 5 letras).');
  if (!lcTravar()) return;
  try { await Data.col('sv2_aguacol').update(c.id, { situacao: 'cancelada', canceladaMotivo: m }); Audit.log({ acao: 'cancelar_coleta_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Cancelou a coleta de água ' + c.pontoNome + ': ' + m, autorizadoPor: { id: S.user.id, nome: S.user.nome } }); lcFim(); aviso('Coleta cancelada.'); }
  catch (e) { lcErro(svErro(e)); }
}
LC_FORM.agCfg = f => ({ ico: 'eng', sub: 'Coletas › Água', titulo: 'Prazos da água', corpo: lcMsg() + '<p class="ag-dc">Pontos, frequência, dia e hora do rodízio ficam em cada projeto (no EFClaudian).</p><div class="fm-g">' + agBl('Laudo atrasado depois de (dias)', lcIn('laudo', f.laudo, ' inputmode="numeric"')) + agBl('Recoleta até (dias após o laudo)', lcIn('rec', f.rec, ' inputmode="numeric"')) + '</div>', rodape: lcPe('ag-cfg-ok', 'Salvar') });
async function agCfgOk() {
  const f = S.fm; if (!f || !isSup(S.user)) return;
  const c0 = agCfg(), o = { periodoDias: c0.periodoDias, porVez: c0.porVez, laudoDias: parseInt(f.laudo, 10), recoletaDias: parseInt(f.rec, 10), fora: c0.fora };
  if (!(o.laudoDias >= 1 && o.laudoDias <= 60) || !(o.recoletaDias >= 1 && o.recoletaDias <= 60)) return lcErro('Prazos entre 1 e 60 dias.');
  if (!lcTravar()) return;
  try {
    await Data.col('sv2_cfg').set('agua', Object.assign({}, o, { atualizadoEm: nowISO(), atualizadoPor: S.user.nome })); S.cfgAgua = Object.assign({ id: 'agua' }, o);
    Audit.log({ acao: 'config_agua', entidade: 'config', entidadeId: 'agua', resumo: 'Prazos da água: laudo ' + o.laudoDias + ' d, recoleta ' + o.recoletaDias + ' d', antes: { laudoDias: c0.laudoDias, recoletaDias: c0.recoletaDias }, depois: { laudoDias: o.laudoDias, recoletaDias: o.recoletaDias } });
    lcFim(); aviso('Prazos atualizados.');
  } catch (e) { lcErro(svErro(e)); }
}

/* ======================= eventos ======================= */
DD_AO.ag = (k, v) => {
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'tipo') f.tipo = v; else if (k === 'pv') f.pv = v; else if (k === 'an') f.an = v; else if (k === 'lab') f.lab = v; else if (k === 'envlab') f.lab = v; else if (k === 'res') f.res = v; else if (k === 'grav') f.grav = v;
  gvDesenha(true);
};
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="ag-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm, vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  const c = id ? S.aguacol.find(x => x.id === id) : null;
  if (a === 'ag-nova') { if (!agPode()) return; lcAbrir(agNovoEstado(t.getAttribute('data-tipo') || '', t.getAttribute('data-oc') || '', t.getAttribute('data-pid') || ''), volta); }
  else if (a === 'ag-nova-ok') agNovaOk();
  else if (a === 'ag-ck' && f) { const g = t.getAttribute('data-g'); if (g === 'bebs') f.bebs[id] = !f.bebs[id]; else if (g === 'recs') f.recs[id] = !f.recs[id]; else if (g === 'ppt') f.ppt[id] = !f.ppt[id]; else if (g === 'pan') f.pan[id] = !f.pan[id]; else if (g === 'pt') { f.pontos[id] = !f.pontos[id]; f.avisado = ''; } else if (g === 'an') { f.ans[id] = !f.ans[id]; f.avisado = ''; } else if (g === 'ag') { const i = f.agente.indexOf(id); if (i >= 0) f.agente.splice(i, 1); else f.agente.push(id); } f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'ag-env') { if (!agPode() || !c) return; lcAbrir({ k: 'agEnv', id: c.id, envio: c.envio || '', lab: c.lab || '', os: c.os || '', sol: c.numSolicitacao || '' }, volta); }
  else if (a === 'ag-env-ok') agEnvOk();
  else if (a === 'ag-res') { if (!agPode() || !c) return; lcAbrir({ k: 'agRes', id: c.id, res: c.resultado || 'PENDENTE', laudo: c.laudoEm || hojeISO(), agente: (c.agente || []).slice(), agOutro: c.agenteOutro || '', grav: c.gravidade || '', obs: c.obs || '' }, volta); }
  else if (a === 'ag-res-ok') agResOk();
  else if (a === 'ag-rec') { if (!agPode() || !c) return; lcAbrir({ k: 'agRec', id: c.id, motivo: '' }, volta); }
  else if (a === 'ag-rec-ok') agRecOk();
  else if (a === 'ag-canc') { if (!isSup(S.user) || !c) return; lcAbrir({ k: 'agCanc', id: c.id, motivo: '' }, volta); }
  else if (a === 'ag-canc-ok') agCancOk();
  else if (a === 'ag-cfg') { if (!isSup(S.user)) return; const g = agCfg(); lcAbrir({ k: 'agCfg', laudo: String(g.laudoDias), rec: String(g.recoletaDias) }, null); }
  else if (a === 'ag-cfg-ok') agCfgOk();
  else if (a === 'ag-abre') { if (S.rota.aba !== 'agua') { S._gvNav = true; ir('coletas', 'agua'); } agAbre(id); }
  else if (a === 'ag-pend') agPendAbre();
});

/* ---------- busca geral ---------- */
BG_FONTES.push(q => {
  if (!coVe()) return [];
  return S.aguacol.filter(c => bgCasa(q, [c.pontoNome, c.analiseNome, c.os, c.lab, 'água', agTipoTxt(c)].join(' '))).slice(0, 6)
    .map(c => ({ grupo: 'Água', nome: (c.pontoNome || 'Coleta de água') + ' · ' + fmtD(c.data), sub: [c.analiseNome, c.situacao === 'cancelada' ? 'Cancelada' : c.resultado === 'PENDENTE' ? 'Pendente' : c.resultado === 'CONFORME' ? 'Conforme' : 'Não conforme'].filter(Boolean).join(' · '), ico: 'frasco', abrir: () => { if (S.rota.aba !== 'agua' || S.rota.area !== 'coletas') { S._gvNav = true; ir('coletas', 'agua'); } agAbre(c.id); } }));
});
