/* EFCwork · relatorios.js — Relatórios › Rateio (v0.6.18). Prefixo: rl.
   É o "Painel dos rateios" do EFClaudian (v2.29.0, dpAguaHTML/dpCampoHTML), só leitura: nada é gravado.
   Duas visões, Água e Campo, com o ano (‹ ›) e o período (ano inteiro, trimestre ou semestre).
   Custo da água = valor congelado × amostras; custo do campo = valor congelado da amostra. Canceladas fora.
   O filtro é um botão só, que abre o painel (Mostrar, Período, Ano e, na água, o tipo de ponto). Sem botão "Limpar filtro".
   Quem vê: a atribuição Rateios (a mesma da tela Rateios). Gráficos em SVG próprio, só com tokens de cor do app. */
const RL_MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const RL_PERS = [['', 'Ano todo'], ['T1', '1º trimestre'], ['T2', '2º trimestre'], ['T3', '3º trimestre'], ['T4', '4º trimestre'], ['S1', '1º semestre'], ['S2', '2º semestre']];
S.rl = { tipo: 'agua', ano: hojeISO().slice(0, 4), per: '', pt: '', aberto: false };
const rlVe = () => typeof rtVe === 'function' && rtVe();

/* ---------- período ---------- */
function rlNoPer(iso) {
  const f = S.rl; if (!iso || String(iso).slice(0, 4) !== f.ano) return false; if (!f.per) return true;
  const m = Number(String(iso).slice(5, 7));
  return f.per[0] === 'T' ? Math.floor((m - 1) / 3) + 1 === Number(f.per[1]) : (m <= 6 ? 1 : 2) === Number(f.per[1]);
}
const rlPerTxt = () => { const f = S.rl, p = RL_PERS.find(x => x[0] === f.per); return f.ano + (f.per ? ' · ' + p[1] : '') + (f.tipo === 'agua' && f.pt ? ' · ' + ((PJ_TIPOS.find(t => t[0] === f.pt) || [])[1] || '') : ''); };
const rlMeses = () => { const m = []; for (let k = 1; k <= 12; k++) { const iso = S.rl.ano + '-' + String(k).padStart(2, '0') + '-01'; if (rlNoPer(iso)) m.push(k); } return m; };

/* ---------- dados ---------- */
const rlValor = c => { if (c.valor !== undefined && c.valor !== null && c.valor !== '') return Number(c.valor) || 0; const a = (S.analises || []).find(x => x.id === c.analiseId); return a ? Number(a.valor) || 0 : 0; };
const rlCustoAg = c => rlValor(c) * (Number(c.qtd) || 1);
let RL_MP = null; /* ref do ponto → tipo, montado uma vez por desenho (pjPontos refaz a lista a cada chamada) */
const rlTipoPonto = c => { if (!RL_MP) { RL_MP = {}; (typeof pjPontos === 'function' ? pjPontos() : []).forEach(p => { RL_MP[p.ref] = p.tipo; }); } return RL_MP[c.pontoRef] || (String(c.pontoRef || '').indexOf('beb:') === 0 || c.tipoColeta === 'mesclada' ? 'bebedouro' : ''); };
const rlLocal = c => c.tipoColeta === 'mesclada' ? 'Mesclada (todos os bebedouros)' : (c.pontoNome || '—');
const rlMedia = l => l.length ? Math.round(l.reduce((a, b) => a + b, 0) / l.length * 10) / 10 : null;
const rlNum = v => String(v).replace('.', ',');
const rlAgrupa = (l, chave, valor) => { const m = {}; l.forEach(x => { const k = chave(x); if (!k) return; m[k] = m[k] || { label: k, v: 0, n: 0 }; m[k].v += valor(x); m[k].n++; }); return Object.keys(m).map(k => m[k]); };
const rlFaz = c => { if (c.tipo === 'COMPOSTO') return 'Composto'; const f = typeof pgFazenda === 'function' ? pgFazenda(c.talhao) : null; return f ? (f.nome || f.prefixo) : 'Outro local'; };
/* teto "redondo" do eixo, em 3 faixas */
function rlTeto(v) { if (!(v > 0)) return 3; const b = v / 3, p = Math.pow(10, Math.floor(Math.log10(b))), passo = [1, 2, 2.5, 5, 10].map(k => k * p).find(k => k >= b - 1e-9); return Math.max(3, (passo < 1 ? 1 : passo) * 3); }

/* ---------- gráficos (SVG, só tokens do app) ---------- */
const rlPct = v => Number(v).toFixed(1);
function rlColunas(dados, fmt, rot) {
  const teto = rlTeto(Math.max.apply(null, dados.map(d => d.v).concat([0])));
  const eixo = [3, 2, 1, 0].map(i => '<span style="bottom:' + esc(rlPct(i / 3 * 100)) + '%">' + esc(rot(teto * i / 3)) + '</span>').join('');
  const linhas = [0, 1, 2, 3].map(i => '<i style="bottom:' + esc(rlPct(i / 3 * 100)) + '%"></i>').join('');
  const cols = dados.map((d, k) => '<div class="rl-col" style="--i:' + esc(k) + '" title="' + esc(d.label + ': ' + fmt(d.v)) + '"><div class="rl-cb"><b class="rl-b" style="height:' + esc(rlPct(d.v ? Math.max(1.5, d.v / teto * 100) : 0)) + '%"></b></div><span>' + esc(d.label) + '</span></div>').join('');
  return ['<div class="rl-g" role="img" aria-label="Custo por mês"><div class="rl-gy">', eixo, '</div><div class="rl-gp"><div class="rl-gl">', linhas, '</div><div class="rl-gc">', cols, '</div></div></div>'].join('');
}
const rlRot = x => x.label + (x.n != null ? ' (' + x.n + ')' : '');
function rlBarrasH(linhas, fmt, max) {
  const l = linhas.slice(0, max || 8); if (!l.length) return '<p class="rl-vz">Nada no período.</p>';
  const mx = Math.max.apply(null, l.map(x => x.v).concat([0.0001]));
  return '<div class="rl-bh">' + l.map(x => '<div class="rl-bl" title="' + esc(rlRot(x) + ': ' + fmt(x.v)) + '"><span class="rl-bn">' + esc(x.label) + (x.n != null ? '<small> (' + esc(x.n) + ')</small>' : '') + '</span><span class="rl-bt"><i class="' + (x.cor || '') + '" style="width:' + Math.max(x.v ? 2 : 0, x.v / mx * 100).toFixed(1) + '%"></i></span><b>' + esc(fmt(x.v)) + '</b></div>').join('') + '</div>' + (linhas.length > l.length ? '<div class="rl-mais">e mais ' + esc(linhas.length - l.length) + '</div>' : '');
}
function rlRosca(fatias, centro, sub) {
  const tot = fatias.reduce((s, x) => s + x.v, 0) || 1, R = 52, C = 2 * Math.PI * R; let ac = 0;
  return '<svg class="rl-ros" viewBox="0 0 140 140" role="img" aria-label="' + esc(sub) + '"><circle cx="70" cy="70" r="' + esc(R) + '" class="rl-r0"/>' + fatias.filter(x => x.v).map(x => { const len = x.v / tot * C, s = '<circle cx="70" cy="70" r="' + esc(R) + '" class="rl-c ' + esc(x.cls) + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-ac).toFixed(2) + '"><title>' + esc(x.k + ': ' + x.v) + '</title></circle>'; ac += len; return s; }).join('') +
    '<text x="70" y="68" class="rl-rn">' + esc(centro) + '</text><text x="70" y="86" class="rl-rt">' + esc(sub) + '</text></svg>';
}
const rlLegenda = fatias => '<div class="rl-leg">' + fatias.map(x => '<div><i class="rl-c ' + esc(x.cls) + '"></i><span>' + esc(x.k) + '</span><b>' + esc(x.v) + '</b></div>').join('') + '</div>';
const rlCard = (t, sub, corpo, larga) => '<section class="rl-card' + (larga ? ' rl-larga' : '') + '"><header><h3>' + esc(t) + '</h3>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</header>' + corpo + '</section>';
/* resumo no alto: texto pequeno, sem caixas (como as pílulas do cabeçalho das tabelas) */
const rlResumo = l => '<ul class="rl-res">' + l.map(x => '<li><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</li>').join('') + '</ul>';
const rlMesesDados = (lista, dataDe, valor) => rlMeses().map(m => ({ label: RL_MESES[m - 1], v: Math.round(lista.filter(x => String(dataDe(x) || '').slice(0, 7) === S.rl.ano + '-' + String(m).padStart(2, '0')).reduce((a, x) => a + valor(x), 0) * 100) / 100 }));
const rlBRL = v => brl(v), rlRotEixo = v => v >= 1000 ? rlNum(Math.round(v / 100) / 10) + ' mil' : String(Math.round(v));

const rlTitQ = (l, n, p) => l.length + ' coleta(s): ' + (l.length - n - p) + ' conforme, ' + n + ' não conforme, ' + p + ' pendente';
/* ---------- água ---------- */
function rlAgua() {
  const f = S.rl, cs = agAtivas().filter(c => rlNoPer(c.data) && (!f.pt || rlTipoPonto(c) === f.pt));
  const custo = cs.reduce((a, c) => a + rlCustoAg(c), 0), conf = cs.filter(c => c.resultado === 'CONFORME'), nc = cs.filter(agNC), pend = cs.filter(c => c.resultado === 'PENDENTE');
  const grave = nc.filter(c => c.gravidade === 'grave'), leve = nc.filter(c => c.gravidade !== 'grave'), comRes = conf.length + nc.length;
  const dias = cs.filter(c => c.envio && c.laudoEm && c.laudoEm >= c.envio).map(c => coDif(c.envio, diaLocal(c.laudoEm)));
  const res = rlResumo([[String(cs.length), 'coletas de água', cs.reduce((a, c) => a + (Number(c.qtd) || 1), 0) + ' amostra(s)'], [brl(custo), 'custo', 'valor × amostras'],
    [comRes ? Math.round(conf.length / comRes * 100) + '%' : '—', 'conformes', conf.length + ' de ' + comRes + ' com laudo'], [String(nc.length), 'não conformes', grave.length + ' grave(s) · ' + leve.length + ' leve(s)'],
    [String(cs.filter(c => c.tipoColeta === 'recoleta').length), 'recoletas', agRecoletasPend().length + ' pendente(s) hoje'], [dias.length ? rlNum(rlMedia(dias)) + ' d' : '—', 'até o laudo', dias.length ? 'média de ' + dias.length + ' laudo(s)' : 'sem laudo com data']]);
  const fatias = [{ k: 'Conforme', v: conf.length, cls: 'ok' }, { k: 'Não conforme · leve', v: leve.length, cls: 'le' }, { k: 'Não conforme · grave', v: grave.length, cls: 'gr' }, { k: 'Pendente', v: pend.length, cls: 'pe' }];
  const g1 = rlCard('Conforme × não conforme', 'resultados no período', cs.length ? '<div class="rl-rw">' + rlRosca(fatias, String(cs.length), 'coletas') + rlLegenda(fatias) + '</div>' : '<p class="rl-vz">Nenhuma coleta no período.</p>');
  const g2 = rlCard('Custo por mês', rlPerTxt() + ' · pela data da coleta', rlColunas(rlMesesDados(cs, c => c.data, rlCustoAg), rlBRL, rlRotEixo), true);
  const g3 = rlCard('Custo por ponto', 'entre parênteses, as coletas', rlBarrasH(rlAgrupa(cs, rlLocal, rlCustoAg).sort((a, b) => b.v - a.v), rlBRL));
  const g4 = rlCard('Custo por laboratório', 'entre parênteses, as coletas', rlBarrasH(rlAgrupa(cs, c => c.lab || 'sem laboratório', rlCustoAg).sort((a, b) => b.v - a.v), rlBRL));
  const ag = {}; nc.forEach(c => (c.agente || []).forEach(a => { const n = a === 'outro' ? (c.agenteOutro || 'Outro') : ((AG_AGENTES.find(x => x[0] === a) || [])[1] || a); ag[n] = (ag[n] || 0) + 1; }));
  const g5 = rlCard('Contaminações por agente', nc.length + ' não conforme(s)', rlBarrasH(Object.keys(ag).map(k => ({ label: k, v: ag[k], cor: 'cr' })).sort((a, b) => b.v - a.v), v => v + '×'));
  const g6 = rlCard('Contaminações por local', 'grave e leve', rlBarrasH(rlAgrupa(nc, rlLocal, () => 1).map(x => ({ label: x.label, v: x.v, cor: nc.some(c => rlLocal(c) === x.label && c.gravidade === 'grave') ? 'cr' : 'le' })).sort((a, b) => b.v - a.v), v => v + '×'));
  /* quadro ponto × mês: C conforme · N não conforme · P pendente (letra + cor; nunca só cor) */
  const ms = rlMeses(), locs = Array.from(new Set(cs.map(rlLocal))).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  const cel = l => { if (!l.length) return '<td></td>'; const n = l.filter(agNC).length, p = l.filter(c => c.resultado === 'PENDENTE').length, k = n ? 'n' : p ? 'p' : 'c', tit = rlTitQ(l, n, p), cont = l.length > 1 ? '<sup>' + esc(l.length) + '</sup>' : ''; return '<td><span class="rl-q ' + esc(k) + '" title="' + esc(tit) + '">' + (k === 'n' ? 'N' : k === 'p' ? 'P' : 'C') + cont + '</span></td>'; };
  const quadro = locs.length ? '<div class="rl-qw"><table class="rl-quadro"><thead><tr><th>Ponto</th>' + ms.map(m => '<th>' + esc(RL_MESES[m - 1]) + '</th>').join('') + '</tr></thead><tbody>' + locs.map(l => '<tr><th>' + esc(l) + '</th>' + ms.map(m => cel(cs.filter(c => rlLocal(c) === l && String(c.data).slice(5, 7) === String(m).padStart(2, '0')))).join('') + '</tr>').join('') + '</tbody></table></div>' +
    '<div class="rl-qleg"><span class="rl-q c">C</span> conforme <span class="rl-q n">N</span> não conforme <span class="rl-q p">P</span> pendente · o número pequeno é quantas coletas no mês</div>' : '<p class="rl-vz">Nenhuma coleta no período.</p>';
  const g7 = rlCard('Quadro ponto × mês', rlPerTxt(), quadro, true);
  const dl = {}; cs.filter(c => c.envio && c.laudoEm && c.laudoEm >= c.envio).forEach(c => { const l = c.lab || 'sem laboratório'; (dl[l] = dl[l] || []).push(coDif(c.envio, diaLocal(c.laudoEm))); });
  const g8 = rlCard('Dias até o laudo', 'média por laboratório · alerta com ' + agCfg().laudoDias + ' dias', rlBarrasH(Object.keys(dl).map(k => ({ label: k, n: dl[k].length, v: rlMedia(dl[k]), cor: rlMedia(dl[k]) > agCfg().laudoDias ? 'wa' : '' })).sort((a, b) => b.v - a.v), v => rlNum(v) + ' d'));
  return res + '<div class="rl-grade">' + g1 + g8 + g2 + g3 + g4 + g5 + g6 + g7 + '</div>';
}

/* ---------- campo ---------- */
function rlCampo() {
  const hoje = hojeISO(), cs = (S.coletas || []).filter(c => c.situacao !== 'cancelada' && c.tipo !== 'AGUA' && !c.historica && rlNoPer(c.data));
  const custo = cs.reduce((a, c) => a + rlValor(c), 0), env = cs.filter(c => c.enviado), pend = env.filter(c => !c.laudo), atr = cs.filter(c => coLaudoSit(c) === 'Atrasado');
  const dias = cs.filter(c => c.envio && c.laudo && c.laudoEm && diaLocal(c.laudoEm) >= c.envio).map(c => coDif(c.envio, diaLocal(c.laudoEm)));
  const res = rlResumo([[String(cs.length), 'amostras de campo', Array.from(new Set(cs.map(coNome).filter(x => x && x !== '—'))).length + ' área(s)'], [brl(custo), 'custo', 'valor de cada amostra'],
    [String(env.length), 'enviadas', (cs.length - env.length) + ' ainda não enviada(s)'], [String(pend.length), 'laudos pendentes', atr.length + ' atrasado(s)'],
    [String(cs.filter(c => c.compra !== 'solicitado' && c.enviado).length), 'sem solicitação', 'enviadas, sem compra'], [dias.length ? rlNum(rlMedia(dias)) + ' d' : '—', 'até o laudo', dias.length ? 'média de ' + dias.length + ' laudo(s)' : 'sem laudo com data']]);
  const g1 = rlCard('Custo por mês', rlPerTxt() + ' · pela data da coleta', rlColunas(rlMesesDados(cs, c => c.data, rlValor), rlBRL, rlRotEixo), true);
  const g2 = rlCard('Por tipo de coleta', 'custo · entre parênteses, as amostras', rlBarrasH(rlAgrupa(cs, c => CO_TXT[c.tipo] || c.tipo, rlValor).sort((a, b) => b.v - a.v), rlBRL));
  const g3 = rlCard('Custo por fazenda', 'entre parênteses, as amostras', rlBarrasH(rlAgrupa(cs, rlFaz, rlValor).sort((a, b) => b.v - a.v), rlBRL));
  const g4 = rlCard('Coletas por área', 'as 10 com mais amostras · valor no fim', rlBarrasH(rlAgrupa(cs, c => coNome(c), rlValor).sort((a, b) => b.n - a.n || b.v - a.v).slice(0, 10), rlBRL, 10));
  const g5 = rlCard('Por laboratório', 'custo · entre parênteses, as amostras', rlBarrasH(rlAgrupa(cs, c => c.lab || 'sem laboratório', rlValor).sort((a, b) => b.v - a.v), rlBRL));
  const faixas = [['até 7 d', 0, 7, ''], ['8 a 15 d', 8, 15, ''], ['16 a 30 d', 16, 30, 'wa'], ['mais de 30 d', 31, 1e9, 'cr']];
  const idade = faixas.map(f => ({ label: f[0], v: pend.filter(c => c.envio && coDif(c.envio, hoje) >= f[1] && coDif(c.envio, hoje) <= f[2]).length, cor: f[3] }));
  const g6 = rlCard('Laudos pendentes por idade', 'dias desde o envio · hoje', pend.length ? rlBarrasH(idade, v => String(Math.round(v)), 4) : '<p class="rl-ok">Nenhum laudo pendente no período.</p>');
  const dl = {}; cs.filter(c => c.envio && c.laudo && c.laudoEm).forEach(c => { const d = coDif(c.envio, diaLocal(c.laudoEm)); if (d < 0) return; const l = c.lab || 'sem laboratório'; (dl[l] = dl[l] || []).push(d); });
  const g7 = rlCard('Dias até o laudo', 'média por laboratório · prazo de cada um em Cadastros', rlBarrasH(Object.keys(dl).map(k => ({ label: k, n: dl[k].length, v: rlMedia(dl[k]), cor: rlMedia(dl[k]) > coLabPrazo(k) ? 'wa' : '' })).sort((a, b) => b.v - a.v), v => rlNum(v) + ' d'));
  return res + '<div class="rl-grade">' + g1 + g2 + g3 + g5 + g6 + g7 + g4 + '</div>';
}

/* ---------- tela ---------- */
function rlAviso() {
  const f = S.rl, ca = f.tipo === 'campo' && !S._coTudo && (S.coletas || []).length >= CO_LIM, ag = f.tipo === 'agua' && typeof agTeto === 'function' && agTeto();
  return ca || ag ? '<p class="rl-teto">Só as ' + (ca ? CO_LIM.toLocaleString('pt-BR') + ' amostras' : AG_LIM.toLocaleString('pt-BR') + ' coletas') + ' mais recentes estão carregadas; períodos antigos podem estar incompletos. <button type="button" class="bt lk" data-act="rl-tudo">Carregar tudo</button></p>' : '';
}
function rlResumoFiltro() { const f = S.rl; return (f.tipo === 'agua' ? 'Água' : 'Campo') + ' · ' + rlPerTxt(); }
function rlFiltroHTML() {
  const f = S.rl, ano = Number(hojeISO().slice(0, 4)), anos = []; for (let a = ano; a >= ano - 5; a--) anos.push([String(a), String(a)]);
  const tem = PJ_TIPOS.filter(t => agAtivas().some(c => rlTipoPonto(c) === t[0]));
  return '<div class="rl-fp"' + (f.aberto ? '' : ' hidden') + '><label class="cp">Mostrar' + ddHTML('rl:tipo', f.tipo, [['agua', 'Água'], ['campo', 'Campo']]) + '</label>' +
    '<label class="cp">Ano' + ddHTML('rl:ano', f.ano, anos.some(x => x[0] === f.ano) ? anos : anos.concat([[f.ano, f.ano]])) + '</label>' +
    '<label class="cp">Período' + ddHTML('rl:per', f.per, RL_PERS) + '</label>' +
    (f.tipo === 'agua' ? '<label class="cp">Tipo de ponto' + ddHTML('rl:pt', f.pt, [['', 'Todos os pontos']].concat(tem.map(t => [t[0], t[1]]))) + '</label>' : '') + '</div>';
}
function rlTela() {
  const f = S.rl, ent = f._ent; f._ent = false; RL_MP = null;
  const c = cabecalho({ titulo: 'Rateio', acoes: '<button type="button" class="bt ic-so" data-act="rl-imp" data-ic-aba title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button>' });
  return c + '<div class="rl' + (ent ? ' rl-ent' : '') + '"><div class="rl-bar"><button type="button" class="at-fl" data-act="rl-filtro" aria-expanded="' + esc(String(f.aberto)) + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(rlResumoFiltro()) + '</small></button></div>' + rlFiltroHTML() + rlAviso() + (f.tipo === 'agua' ? rlAgua() : rlCampo()) + '</div>';
}
const rlQualOrig = TELAS.relatorios;
TELAS.relatorios = aba => (!aba || aba === 'rateio') ? (rlVe() ? rlTela() : '') : (rlQualOrig ? rlQualOrig(aba) : '');
function rlImprimir() {
  RL_MP = null; const e = S.empresa || {}; let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>Painel do rateio · ' + esc(rlResumoFiltro()) + '</b><span>' + esc(e.nome || '') + ' · ' + esc(fmtD(hojeISO())) + '</span></div><div class="rl rl-imp">' + (S.rl.tipo === 'agua' ? rlAgua() : rlCampo()) + '</div><div class="imp-pe">' + esc(APP_APELIDO) + '</div>';
  if (typeof Audit !== 'undefined') Audit.log({ acao: 'imprimir', entidade: 'painel_rateio', entidadeId: S.rl.tipo, resumo: 'Imprimiu o painel de ' + (S.rl.tipo === 'agua' ? 'água' : 'campo') + ' · ' + rlPerTxt() });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.rl = (k, v) => { if (!(k in S.rl) || k === 'aberto') return; S.rl[k] = v; S.rl._ent = true; if (k === 'tipo') S.rl.pt = ''; render(); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="rl-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'rl-filtro') { S.rl.aberto = !S.rl.aberto; render(); }
  else if (a === 'rl-imp') rlImprimir();
  else if (a === 'rl-tudo') { if (S.rl.tipo === 'campo') coTudo(); else agTudo(); }
});
/* Esc fecha uma camada de cada vez: aqui só o painel do filtro */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || S.rota.area !== 'relatorios' || (S.camadas && S.camadas.length) || document.querySelector('.dd-l:not([hidden]):not(.dd-fant)')) return;
  if (S.rl.aberto) { S.rl.aberto = false; render(); }
});
