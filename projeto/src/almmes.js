/* EFCwork · almmes.js — Relatórios › Almoxarifado do mês (v0.6.21). Prefixo: am.
   Porte da "Apresentação do almoxarifado" do EFClaudian (viewAlmApre, alApreDados, alApreLeitura, Relatórios › Almoxarifado do mês),
   no padrão das outras abas de Relatórios (Rateio e Semana): um filtro só (Mês), o resumo em texto no alto, as partes em tabelas
   simples e a impressora. Sem gráfico de pizza nem caixa de KPI: as barras são finas, dentro da própria tabela. Só leitura: nada grava.
   ITENS 104 a 111 aprovados (20/11); no 106 o Elias pediu a barra entre o nome (mês, motivo, laboratório) e o valor. */
const amVe = () => !!S.user && (isSup(S.user) || alVe());
Object.assign(S, { am: { mes: '', aberto: false } });

CS_CARGAS.push(() => {
  if (!amVe() || alVe()) return; /* quem tem o Almoxarifado já carrega tudo em almox.js */
  const re = () => { _alIdx = null; S.almCarregado = true; if (S.rota.area === 'relatorios') render(); };
  csOuve('sv2_alm_itens', l => { S.almItens = l || []; re(); });
  if (!smVe()) csOuve('sv2_alm_mov', l => { S.almMov = l || []; re(); }, { order: 'criadoEm', limit: ALM_MOV_LIM });
  csOuve('sv2_alm_sol', l => { S.almSol = l || []; re(); }, { order: 'criadoEm', limit: 3000 });
  csOuve('sv2_alm_equip', l => { S.almEq = l || []; re(); });
});

/* ---------- mês ---------- */
const amMesAtual = () => hojeISO().slice(0, 7);
const amMesSel = () => S.am.mes || amMesAtual();
function amMesAnda(mes, n) { const [a, m] = mes.split('-').map(Number), d = new Date(a, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
const AM_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const amMesTxt = mes => AM_MESES[Number(mes.slice(5, 7)) - 1] + ' de ' + mes.slice(0, 4);
const amMesTit = mes => amMesTxt(mes).charAt(0).toUpperCase() + amMesTxt(mes).slice(1);
const amMesCurto = mes => AM_MESES[Number(mes.slice(5, 7)) - 1].slice(0, 3) + '/' + mes.slice(2, 4);
function amOpcoesMes() { const l = [], at = amMesAtual(); for (let k = 0; k < 12; k++) { const m = amMesAnda(at, -k); l.push([m, amMesTit(m) + (k === 0 ? ' (este mês)' : '')]); } if (!l.some(x => x[0] === amMesSel())) l.push([amMesSel(), amMesTit(amMesSel())]); return l; }

/* ---------- dados (mesma conta do EFClaudian) ---------- */
const amVal = m => (Number(m.qtd) || 0) * (Number(m.preco) || 0);
const amMovMes = (mes, tipo) => S.almMov.filter(m => !m.anulada && String(m.data || '').slice(0, 7) === mes && (!tipo || m.tipo === tipo));
const amSemAc = t => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '');
const amTokens = t => ' ' + amSemAc(t).toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim() + ' ';
function amLabsConhecidos() {
  const set = {}, por = n => { const k = String(n || '').trim().toUpperCase(), t = amTokens(k).trim(); if (t.length >= 3) set[t] = k; };
  ((S.cfgCol && S.cfgCol.labs) || []).forEach(por); ((S.cfgAlm && S.cfgAlm.kits) || []).forEach(k => por(k.lab));
  return set;
}
/* para qual laboratório foi a saída: o que a saída ou o kit diz; senão, o nome do laboratório escrito no kit ou no motivo */
function amLabDaSaida(m, labs) {
  if (m.lab) return String(m.lab).toUpperCase();
  const k = m.kit ? ((S.cfgAlm && S.cfgAlm.kits) || []).find(x => x.nome === m.kit) : null; if (k && k.lab) return String(k.lab).toUpperCase();
  const t = amTokens((m.kit || '') + ' ' + (m.motivo || '')), achou = Object.keys(labs).find(n => t.indexOf(' ' + n + ' ') >= 0);
  return achou ? labs[achou] : '';
}
function amDados(mes) {
  const saidas = amMovMes(mes, 'saida'), entradas = amMovMes(mes, 'entrada'), aberturas = amMovMes(mes, 'abrir'), labs = amLabsConhecidos();
  const gasto = saidas.reduce((s, m) => s + amVal(m), 0), comprado = entradas.reduce((s, m) => s + amVal(m), 0);
  const porMotivo = {}, porItem = {}, porPessoa = {}, porLab = {}; let semLab = 0;
  const it = (m) => (porItem[m.itemId] = porItem[m.itemId] || { id: m.itemId, nome: m.itemNome || ((alItem(m.itemId) || {}).nome) || '(material removido)', sq: 0, sv: 0, eq: 0, ev: 0 });
  saidas.forEach(m => {
    const lab = amLabDaSaida(m, labs), v = amVal(m); if (lab) porLab[lab] = (porLab[lab] || 0) + v; else semLab += v;
    const mot = m.motivo || 'Sem motivo'; porMotivo[mot] = (porMotivo[mot] || 0) + v;
    const x = it(m); x.sq += Number(m.qtd) || 0; x.sv += v;
    const p = m.porNome || '—'; porPessoa[p] = (porPessoa[p] || 0) + 1;
  });
  entradas.forEach(m => { const x = it(m); x.eq += Number(m.qtd) || 0; x.ev += amVal(m); });
  const serie = []; for (let k = 5; k >= 0; k--) { const mm = amMesAnda(mes, -k); serie.push({ mes: mm, v: amMovMes(mm, 'saida').reduce((s, m) => s + amVal(m), 0) }); }
  const itens = alAtivos(), venc = [], avenc = [], abaixo = [], zerados = [];
  itens.forEach(i => {
    alLotes(i.id).forEach(l => { if (alVencido(l)) venc.push({ i: i, l: l }); else if (alAVencer(l)) avenc.push({ i: i, l: l }); });
    const s = alSaldo(i.id), u = alDisp(i.id);
    if (s <= 0 && !alAbertos(i.id).length) zerados.push(i); else if (Number(i.min) > 0 && u < Number(i.min)) abaixo.push({ i: i, s: u });
  });
  const abAviso = alAbertos().map(m => ({ m: m, p: alPrazoAberto(m) })).filter(x => x.p && (x.p.vencido || x.p.venc <= addDias(hojeISO(), 7)));
  const eqs = (S.almEq || []).filter(e => e.situacao !== 'baixa');
  return { mes: mes, saidas: saidas, entradas: entradas, aberturas: aberturas, gasto: gasto, comprado: comprado, porMotivo: porMotivo, porItem: porItem, porPessoa: porPessoa, porLab: porLab, semLab: semLab, serie: serie,
    estoque: itens.reduce((s, i) => s + alValorEst(i.id), 0), itensAtivos: itens.length, venc: venc, avenc: avenc, abaixo: abaixo, zerados: zerados, emUso: alAbertos(), abAviso: abAviso,
    solMes: S.almSol.filter(x => String(x.data || '').slice(0, 7) === mes), solPend: S.almSol.filter(x => x.situacao === 'pendente'), itensMov: Object.keys(porItem).length,
    eqs: eqs, calV: eqs.filter(e => eqCalSit(e) === 'vencida').length, calS: eqs.filter(e => eqCalSit(e) === 'sem').length, calA: eqs.filter(e => eqCalSit(e) === 'avencer').length };
}
/* "Como ler este mês": frases geradas dos próprios lançamentos (como no EFClaudian), com singular e plural certos */
function amLeitura(d) {
  const f = [], ant = amMesAnda(d.mes, -1), gAnt = amMovMes(ant, 'saida').reduce((s, m) => s + amVal(m), 0);
  if (d.gasto || gAnt) { const dif = d.gasto - gAnt, pc = gAnt > 0 ? Math.round(Math.abs(dif) / gAnt * 100) : 0;
    f.push(gAnt <= 0 ? 'Foram consumidos ' + brl(d.gasto) + ' em material neste mês.' : 'O consumo foi de ' + brl(d.gasto) + ', ' + (dif >= 0 ? 'acima' : 'abaixo') + ' de ' + amMesTxt(ant) + ' (' + brl(gAnt) + (pc ? ', ' + pc + '% ' + (dif >= 0 ? 'a mais' : 'a menos') : '') + ').'); }
  else f.push('Nenhuma saída de material neste mês nem no anterior.');
  const mot = Object.keys(d.porMotivo).sort((a, b) => d.porMotivo[b] - d.porMotivo[a])[0];
  if (mot) f.push('O que mais consumiu foi “' + mot + '”: ' + brl(d.porMotivo[mot]) + ' (' + Math.round(d.porMotivo[mot] / (d.gasto || 1) * 100) + '% do mês).');
  const top = Object.values(d.porItem).filter(x => x.sv > 0).sort((a, b) => b.sv - a.sv)[0];
  if (top) f.push('Material de maior valor consumido: ' + top.nome + ' (' + alQ(top.sq) + ((alItem(top.id) || {}).un ? ' ' + alItem(top.id).un : '') + ', ' + brl(top.sv) + ').');
  if (d.comprado) f.push('Entraram ' + brl(d.comprado) + ' em compras, em ' + smPl(d.entradas.length, 'lançamento', 'lançamentos') + '.');
  f.push(d.venc.length ? 'Atenção: ' + smPl(d.venc.length, 'lote vencido', 'lotes vencidos') + ' ainda com saldo, para descarte ou baixa.' : 'Nenhum lote vencido com saldo no estoque.');
  if (d.abaixo.length) f.push(smPl(d.abaixo.length, 'material abaixo', 'materiais abaixo') + ' do estoque mínimo, para repor na próxima solicitação.');
  if (d.abAviso.length) f.push(smPl(d.abAviso.length, 'frasco aberto', 'frascos abertos') + ' no fim do prazo de uso (ou passado).');
  if (d.solPend.length) f.push(smPl(d.solPend.length, 'solicitação pendente', 'solicitações pendentes') + ' no almoxarifado central.');
  return f;
}

/* ---------- partes ---------- */
/* tabela simples (as mesmas classes da Semana); as colunas em "num" ficam à direita, no cabeçalho e nas linhas */
function amTab(cab, linhas, vazio, num) {
  if (!linhas.length) return '<p class="sm-vz">' + esc(vazio) + '</p>'; const n = k => (num || []).indexOf(k) >= 0 ? ' class="n"' : '';
  return '<div class="sm-tw"><table class="sm-t am-t"><thead><tr>' + cab.map((c, k) => '<th' + n(k) + '>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    linhas.map(l => '<tr>' + l.map((x, k) => '<td' + n(k) + '>' + x + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
const amBarra = (v, max) => '<span class="am-br" aria-hidden="true"><i style="width:' + (max > 0 && v > 0 ? Math.max(2, Math.round(v / max * 100)) : 0) + '%"></i></span>';
const amPc = (v, t) => t > 0 ? Math.round(v / t * 100) + '%' : '';
function amPartes(d) {
  const r = [];
  r.push(smSec('leitura', 'Como ler este mês', 'gerado dos próprios lançamentos', '<ul class="am-lei">' + amLeitura(d).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'));
  const mx = Math.max.apply(null, d.serie.map(x => x.v).concat([0]));
  r.push(smSec('serie', 'Consumo mês a mês', 'R$ das saídas nos últimos 6 meses', amTab(['Mês', '', 'Consumo'], d.serie.map(x => [x.mes === d.mes ? '<b>' + esc(amMesCurto(x.mes)) + '</b>' : esc(amMesCurto(x.mes)), amBarra(x.v, mx), '<span class="am-n">' + esc(brl(x.v)) + '</span>']), '', [2])));
  const mots = Object.keys(d.porMotivo).sort((a, b) => d.porMotivo[b] - d.porMotivo[a]), mm = mots.length ? d.porMotivo[mots[0]] : 0;
  r.push(smSec('motivo', 'Para que foi usado', 'valor das saídas por motivo', amTab(['Motivo', '', 'Valor', '%'], mots.map(k => [esc(k), amBarra(d.porMotivo[k], mm), '<span class="am-n">' + esc(brl(d.porMotivo[k])) + '</span>', '<span class="am-n">' + esc(amPc(d.porMotivo[k], d.gasto)) + '</span>']), 'Nenhuma saída neste mês.', [2, 3])));
  const its = Object.values(d.porItem).sort((a, b) => b.sv - a.sv || b.ev - a.ev || a.nome.localeCompare(b.nome, 'pt-BR'));
  r.push(smSec('material', 'Material a material', smPl(its.length, 'material movimentado', 'materiais movimentados') + ' de ' + d.itensAtivos + ' ativos',
    amTab(['Material', 'Saiu', 'Saiu (R$)', 'Entrou', 'Entrou (R$)', 'Saldo hoje'], its.map(x => { const i = alItem(x.id), un = i ? ' ' + (i.un || '') : ''; return ['<b>' + esc(x.nome) + '</b>', '<span class="am-n">' + (x.sq ? esc(alQ(x.sq) + un) : '') + '</span>', '<span class="am-n">' + (x.sv ? esc(brl(x.sv)) : '') + '</span>', '<span class="am-n">' + (x.eq ? esc(alQ(x.eq) + un) : '') + '</span>', '<span class="am-n">' + (x.ev ? esc(brl(x.ev)) : '') + '</span>', '<span class="am-n">' + (i ? esc(alQ(alSaldo(i.id)) + un) : '') + '</span>']; }), 'Nenhuma entrada nem saída neste mês.', [1, 2, 3, 4, 5])));
  const labs = Object.keys(d.porLab).sort((a, b) => d.porLab[b] - d.porLab[a]), ml = labs.length ? d.porLab[labs[0]] : 0;
  const pes = Object.keys(d.porPessoa).sort((a, b) => d.porPessoa[b] - d.porPessoa[a]);
  r.push(smSec('lab', 'Por laboratório e por pessoa', 'valor do que saiu para cada laboratório' + (d.semLab > 0 ? ' · ' + brl(d.semLab) + ' sem laboratório' : '') + ' · quem registrou as saídas',
    '<div class="am-2">' + amTab(['Laboratório', '', 'Valor'], labs.map(k => [esc(k), amBarra(d.porLab[k], ml), '<span class="am-n">' + esc(brl(d.porLab[k])) + '</span>']), 'Nenhuma saída para laboratório neste mês. O laboratório vem do kit ou do nome dele no motivo.', [2]) +
    amTab(['Pessoa', 'Saídas'], pes.map(k => [esc(k), '<span class="am-n">' + esc(String(d.porPessoa[k])) + '</span>']), 'Sem saídas registradas.', [1]) + '</div>'));
  const at = d.venc.map(x => ['<b>' + esc(x.i.nome) + '</b>', '<span class="pill cr">Lote vencido</span>', esc('Lote ' + (x.l.lote || 's/ lote') + ' · venceu em ' + fmtD(x.l.validade) + ' · ' + alQ(x.l.saldo) + ' ' + (x.i.un || ''))])
    .concat(d.zerados.map(i => ['<b>' + esc(i.nome) + '</b>', '<span class="pill cr">Sem saldo</span>', esc('sem saldo e sem frasco aberto')]))
    .concat(d.abAviso.map(x => ['<b>' + esc(x.m.itemNome || '') + '</b>', '<span class="pill wa">Frasco aberto</span>', esc('aberto em ' + fmtD(x.m.data) + ' · ' + (x.p.vencido ? 'fora do prazo' : 'vale até ' + fmtD(x.p.venc)))]))
    .concat(d.abaixo.map(x => ['<b>' + esc(x.i.nome) + '</b>', '<span class="pill wa">Abaixo do mínimo</span>', esc('utilizável ' + alQ(x.s) + ' · mínimo ' + alQ(x.i.min))]))
    .concat(d.avenc.map(x => ['<b>' + esc(x.i.nome) + '</b>', '<span class="pill">Vence logo</span>', esc('Lote ' + (x.l.lote || 's/ lote') + ' · vence em ' + fmtD(x.l.validade))]));
  r.push(smSec('atencao', 'O que pede atenção', 'situação de hoje · ' + smPl(at.length, 'ponto', 'pontos'), at.length ? amTab(['Material', 'O quê', 'Detalhe'], at, '') : '<p class="sm-vz">Estoque em dia: nada vencido, nada abaixo do mínimo.</p>'));
  const sol = d.solMes.concat(d.solPend.filter(x => d.solMes.indexOf(x) < 0)).sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
  const eqTxt = d.eqs.length ? smPl(d.eqs.length, 'equipamento', 'equipamentos') + ' · ' + smPl(d.calV, 'calibração vencida', 'calibrações vencidas') + ' · ' + smPl(d.calA, 'vence', 'vencem') + ' em até 40 dias · ' + smPl(d.calS, 'necessário', 'necessários') + ' sem calibração' : 'Nenhum equipamento cadastrado.';
  r.push(smSec('sol', 'Solicitações e equipamentos', smPl(d.solPend.length, 'solicitação pendente', 'solicitações pendentes') + ' hoje',
    amTab(['Nº', 'Data', 'Situação', 'Itens', 'Previsão'], sol.map(x => { const s = AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente; return [esc('Nº ' + (x.numero || '')), esc(fmtD(x.data)), '<span class="pill ' + esc(s[1]) + '">' + esc(s[0]) + '</span>', '<span class="am-n">' + ((x.linhas || []).length) + '</span>', esc(x.previsao ? fmtD(x.previsao) : '')]; }), 'Nenhuma solicitação neste mês.', [3]) +
    '<p class="am-eq">' + ic('eng') + '<span>' + esc(eqTxt) + '</span></p>'));
  return r.join('');
}
function amResumo(d) {
  return rlResumo([[brl(d.gasto), 'consumo do mês', smPl(d.saidas.length, 'saída', 'saídas')], [brl(d.comprado), 'em compras', smPl(d.entradas.length, 'entrada', 'entradas')],
    [brl(d.estoque), 'em estoque hoje', 'pelo preço de cada lote'], [String(d.itensMov), 'materiais movimentados', 'de ' + d.itensAtivos + ' ativos'],
    [String(d.venc.length + d.abaixo.length), 'pontos de atenção', d.venc.length + ' vencido' + (d.venc.length === 1 ? '' : 's') + ' · ' + d.abaixo.length + ' abaixo']]);
}

/* ---------- tela ---------- */
function amTela() {
  const f = S.am, ent = f._ent, mes = amMesSel(); f._ent = false;
  const c = cabecalho({ titulo: 'Almoxarifado do mês', abaNome: 'Almoxarifado', acoes: '<button type="button" class="bt ic-so" data-act="am-imp" data-ic-aba title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button>' });
  const bar = '<div class="sm-bar"><button type="button" class="at-fl" data-act="am-filtro" aria-expanded="' + esc(String(f.aberto)) + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(amMesTit(mes)) + '</small></button></div>' +
    '<div class="sm-fp am-fp"' + (f.aberto ? '' : ' hidden') + '><label class="cp">Mês' + ddHTML('am:mes', mes, amOpcoesMes()) + '</label></div>';
  if (!S.almCarregado && !DEMO && !S.almItens.length) return c + bar + '<section class="pn"><div class="vazio"><b>Carregando o almoxarifado…</b></div></section>';
  if (!S.almItens.length) return c + bar + '<section class="pn"><div class="vazio">' + ic('caixa') + '<b>Nenhum material cadastrado ainda.</b><span>Os materiais são cadastrados no Almoxarifado.</span></div></section>';
  const d = amDados(mes);
  return c + '<div class="sm am' + (ent ? ' sm-ent' : '') + '">' + bar + amResumo(d) + amPartes(d) + '</div>';
}
const amQual = TELAS.relatorios;
TELAS.relatorios = aba => aba === 'almox' ? (amVe() ? amTela() : '') : (amQual ? amQual(aba) : '');

/* ---------- papel ---------- */
function amImprimir() {
  if (!S.almItens.length) { aviso('Nenhum material cadastrado.', 'erro'); return; }
  const mes = amMesSel(), d = amDados(mes), e = S.empresa || {}; let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>Almoxarifado do mês · ' + esc(amMesTit(mes)) + '</b><span>' + esc([e.nome, 'emitido em ' + fmtD(hojeISO()) + ' por ' + S.user.nome].filter(Boolean).join(' · ')) + '</span></div><div class="sm sm-imp am">' + amResumo(d) + amPartes(d) + '</div><div class="imp-pe">' + esc(APP_APELIDO) + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'relatorio_almox', entidadeId: mes, resumo: 'Imprimiu o Almoxarifado do mês de ' + amMesTxt(mes) });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.am = (k, v) => { if (k !== 'mes') return; S.am.mes = v === amMesAtual() ? '' : v; S.am._ent = true; render(); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="am-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'am-filtro') { S.am.aberto = !S.am.aberto; render(); }
  else if (a === 'am-imp') amImprimir();
});
/* Esc fecha uma camada de cada vez: aqui só o painel do filtro */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || S.rota.area !== 'relatorios' || S.rota.aba !== 'almox' || (S.camadas && S.camadas.length) || document.querySelector('.dd-l:not([hidden]):not(.dd-fant)')) return;
  if (S.am.aberto) { S.am.aberto = false; render(); }
});
