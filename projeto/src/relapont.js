/* EFCwork · relapont.js — Relatórios › Apontamentos (v0.6.25). Prefixo: rp.
   O relatório completo dos apontamentos, no padrão das outras abas de Relatórios: um filtro só (Período, Setor, Situação, Gravidade,
   Fotos), o resumo em texto no alto, as partes em tabelas com barras finas e a impressora na linha das abas.
   Partes: Como ler · Por setor · O que mais se repete (Pareto por categoria, "Outro" sempre no fim e fora do corte de 80%, a mesma regra
   da v0.6.15) · Mês a mês · Reincidências (mesmo setor e categoria) · NCs e plano de ação · Apontamentos por setor (a reunião: cada
   apontamento com o que foi visto, risco, recomendação, NC, resolução e as fotos de antes e depois). É a parte que a Semana deixou para cá.
   Só leitura; tocar num apontamento abre a gaveta dele (de lá se resolve, abre NC etc.). Mesmos dados de Inspeções › Apontamentos
   (sv2_apont, sv2_fotos, sv2_cfg/apont): nada novo no Firebase. Quem vê: Líder ★ e Administrador, como as outras abas de Relatórios. */
const rpVe = () => !!S.user && isSup(S.user);
Object.assign(S, { rp: { per: '30', setor: '', sit: '', grav: '', fotos: 'sim', aberto: false } });
const RP_PER = [['30', 'Últimos 30 dias'], ['90', 'Últimos 90 dias'], ['mes', 'Este mês'], ['mesant', 'Mês passado'], ['ano', 'Este ano'], ['tudo', 'Todo o período']];
const RP_SIT = [['', 'Todas'], ['aberto', 'Em aberto'], ['resolvido', 'Resolvidos'], ['nao_procede', 'Não procede']];
const RP_GRAV = [['', 'Todas'], ['gu', 'Grave e urgente'], ['media', 'Média'], ['baixa', 'Baixa']];
const RP_LISTA_MAX = 200, RP_MESES = 6;
const RP_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const rpMesTxt = m => RP_MES[Number(m.slice(5, 7)) - 1] + '/' + m.slice(2, 4);
const rpMesMais = (m, k) => { const d = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + k, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
const rpSetor = a => String(a.setor || '').trim() || 'sem setor';
const rpGravOk = (a, g) => !g || (g === 'gu' ? (a.grav === 'grave' || a.grav === 'urgente') : (a.grav || 'baixa') === g);
const rpSitOk = (a, s) => !s || (s === 'aberto' ? apAberto(a) : a.status === s);
const rpDiasRes = a => a.status === 'resolvido' && a.resolucao && a.resolucao.ts && a.data ? Math.max(0, dcDif(a.data, diaLocal(a.resolucao.ts))) : null;

function rpFaixa() {
  const h = hojeISO(), m = h.slice(0, 7), p = S.rp.per;
  if (p === 'mes') return [m + '-01', h];
  if (p === 'mesant') { const a = rpMesMais(m, -1); return [a + '-01', addDias(m + '-01', -1)]; }
  if (p === 'ano') return [h.slice(0, 4) + '-01-01', h];
  if (p === 'tudo') return ['', h];
  return [addDias(h, -(Number(p) - 1)), h];
}

function rpDados() {
  const f = S.rp, fx = rpFaixa(), noPer = S.apont.filter(a => a.data && (!fx[0] || a.data >= fx[0]) && a.data <= fx[1]);
  const doSetor = noPer.filter(a => !f.setor || rpSetor(a) === f.setor);
  const base = doSetor.filter(a => rpSitOk(a, f.sit) && rpGravOk(a, f.grav));
  const conta = base.filter(a => a.status !== 'nao_procede'); /* o que conta nas partes de análise: "não procede" não é problema de verdade */
  /* por setor (o setor do filtro não vale aqui, para comparar os setores) */
  const ps = {}; noPer.filter(a => a.status !== 'nao_procede' && rpSitOk(a, f.sit) && rpGravOk(a, f.grav)).forEach(a => { const k = rpSetor(a), x = ps[k] || (ps[k] = { nome: k, n: 0, ab: 0, gr: 0, nc: 0 });
    x.n++; if (apAberto(a)) x.ab++; if (a.grav === 'grave' || a.grav === 'urgente') x.gr++; if (a.nc && !a.nc.fechada) x.nc++; });
  const porSetor = Object.values(ps).sort((a, b) => (a.nome === 'sem setor') - (b.nome === 'sem setor') || b.n - a.n || cmpTxt(a.nome, b.nome));
  /* Pareto por categoria, com a mesma regra do Pareto dos Apontamentos */
  const pc = {}; conta.forEach(a => { const k = apCat(a.categoria)[1]; pc[k] = (pc[k] || 0) + 1; });
  const sobra = k => /^outros?$/i.test(String(k).trim());
  const pareto = Object.keys(pc).map(k => ({ nome: k, n: pc[k], sobra: sobra(k) })).sort((a, b) => (a.sobra - b.sobra) || b.n - a.n || cmpTxt(a.nome, b.nome));
  const real = pareto.filter(x => !x.sobra).reduce((s, x) => s + x.n, 0); let ac = 0, acR = 0;
  pareto.forEach(x => { ac += x.n; x.ac = ac; if (!x.sobra) { const antes = acR; acR += x.n; x.vital = acR / (real || 1) * 100 <= 80 || antes / (real || 1) * 100 < 80; } else x.vital = false; });
  /* mês a mês: os últimos meses até o fim do período (setor, situação e gravidade do filtro valem) */
  const ult = fx[1].slice(0, 7), meses = []; for (let k = RP_MESES - 1; k >= 0; k--) meses.push({ mes: rpMesMais(ult, -k), reg: 0, res: 0 });
  const doFiltro = S.apont.filter(a => a.status !== 'nao_procede' && (!f.setor || rpSetor(a) === f.setor) && rpGravOk(a, f.grav));
  doFiltro.forEach(a => { const r = meses.find(x => x.mes === String(a.data || '').slice(0, 7)); if (r) r.reg++;
    if (a.status === 'resolvido' && a.resolucao && a.resolucao.ts) { const q = meses.find(x => x.mes === diaLocal(a.resolucao.ts).slice(0, 7)); if (q) q.res++; } });
  /* reincidências: o mesmo setor e a mesma categoria mais de uma vez no período */
  const ri = {}; conta.forEach(a => { const k = rpSetor(a) + '|' + apCat(a.categoria)[1], x = ri[k] || (ri[k] = { setor: rpSetor(a), cat: apCat(a.categoria)[1], n: 0, ult: '', ab: 0 }); x.n++; if (a.data > x.ult) x.ult = a.data; if (apAberto(a)) x.ab++; });
  const rein = Object.values(ri).filter(x => x.n >= 2).sort((a, b) => b.n - a.n || (b.ult > a.ult ? 1 : -1));
  /* NCs: vencidas primeiro, depois abertas pelo prazo, depois fechadas */
  const ncOrd = { vencida: 0, aberta: 1, fechada: 2 };
  const ncs = base.filter(a => a.nc).sort((a, b) => ncOrd[apNcSit(a)] - ncOrd[apNcSit(b)] || String(a.nc.prazo || '').localeCompare(String(b.nc.prazo || '')));
  /* a reunião: por setor (maior primeiro), dentro do setor os em aberto e mais graves primeiro */
  const gOrd = { urgente: 0, grave: 1, media: 2, baixa: 3 }, sOrd = a => apAberto(a) ? 0 : a.status === 'resolvido' ? 1 : 2;
  const grupos = {}; base.forEach(a => (grupos[rpSetor(a)] = grupos[rpSetor(a)] || []).push(a));
  const setores = Object.keys(grupos).sort((a, b) => (a === 'sem setor') - (b === 'sem setor') || grupos[b].length - grupos[a].length || cmpTxt(a, b));
  setores.forEach(k => grupos[k].sort((a, b) => sOrd(a) - sOrd(b) || (gOrd[a.grav] ?? 3) - (gOrd[b.grav] ?? 3) || String(b.data).localeCompare(String(a.data)) || String(b.criadoEm).localeCompare(String(a.criadoEm))));
  const res = conta.filter(a => rpDiasRes(a) != null), media = res.length ? Math.round(res.reduce((s, a) => s + rpDiasRes(a), 0) / res.length) : null;
  return { fx, base, conta, porSetor, pareto, meses, rein, ncs, grupos, setores, media,
    ab: conta.filter(apAberto).length, gr: conta.filter(a => a.grav === 'grave' || a.grav === 'urgente').length, grAb: conta.filter(a => apAberto(a) && (a.grav === 'grave' || a.grav === 'urgente')).length,
    resolv: conta.filter(a => a.status === 'resolvido').length, np: base.filter(a => a.status === 'nao_procede').length,
    ncAb: base.filter(a => a.nc && !a.nc.fechada).length, ncV: base.filter(a => apNcSit(a) === 'vencida').length, aud: conta.filter(a => a.origem === 'auditoria').length };
}

function rpLeitura(d) {
  const l = [], f = S.rp;
  if (!d.base.length) return ['Nenhum apontamento com este filtro.'];
  l.push(smPl(d.conta.length, 'apontamento', 'apontamentos') + ' no período' + (d.np ? ' (e ' + smPl(d.np, 'marcado', 'marcados') + ' como não procede, fora das contas)' : '') + '; ' + d.resolv + ' ' + (d.resolv === 1 ? 'resolvido' : 'resolvidos') + (d.media != null ? ', em média em ' + smPl(d.media, 'dia', 'dias') : '') + '.');
  if (d.ab) l.push(smPl(d.ab, 'continua', 'continuam') + ' em aberto' + (d.grAb ? ', ' + smPl(d.grAb, 'deles grave ou urgente', 'deles graves ou urgentes') : '') + '.');
  else if (d.conta.length) l.push('Nenhum apontamento em aberto.');
  if (!f.setor && d.porSetor.length > 1) { const s = d.porSetor[0]; l.push('Setor com mais apontamentos: ' + s.nome + ' (' + s.n + ' de ' + d.conta.length + ').'); }
  const vit = d.pareto.filter(x => x.vital);
  if (vit.length && d.pareto.length > 1) l.push('O que mais se repete: ' + vit.map(x => x.nome + ' (' + x.n + ')').join(', ') + (vit.length < d.pareto.filter(x => !x.sobra).length ? '; ' + (vit.length === 1 ? 'esta categoria soma' : 'estas categorias somam') + ' cerca de 80% dos casos.' : '.'));
  if (d.rein.length) { const r = d.rein[0]; l.push(smPl(d.rein.length, 'reincidência', 'reincidências') + ' (mesmo setor e categoria); a maior: ' + r.cat + ' em ' + r.setor + ', ' + smPl(r.n, 'vez', 'vezes') + '.'); }
  if (d.ncAb) l.push(smPl(d.ncAb, 'NC aberta', 'NCs abertas') + (d.ncV ? ', ' + smPl(d.ncV, 'com o prazo vencido', 'com o prazo vencido') : ', todas no prazo') + '.');
  if (d.aud) l.push(smPl(d.aud, 'apontamento veio', 'apontamentos vieram') + ' de auditoria interna.');
  return l;
}

const rpN = v => '<span class="am-n">' + esc(String(v)) + '</span>';
function rpFotos(a) {
  if (S.rp.fotos !== 'sim') return '';
  const off = a.fotosOff || {}, an = (a.fotos || []).filter(x => !off[x]), dp = (a.fotosDepois || []).filter(x => !off[x]);
  if (!an.length && !dp.length) return Object.keys(off).length ? '<p class="rp-fx">Fotos apagadas ' + esc(String(AP_FOTO_DIAS)) + ' dias depois de resolvido (LGPD).</p>' : '';
  const fig = (id, r) => '<figure class="rp-ft">' + apFotoIMG(id) + '<figcaption>' + esc(r) + '</figcaption></figure>';
  return '<div class="rp-fs">' + an.map(x => fig(x, 'Antes')).join('') + dp.map(x => fig(x, 'Depois')).join('') + '</div>';
}
function rpAp(a) {
  const nc = a.nc ? '<p class="rp-l"><b>NC</b> ' + esc(a.nc.responsavel || '') + ' · prazo ' + esc(a.nc.prazo ? fmtD(a.nc.prazo) : '') + ' · ' + esc(a.nc.acao || '') + (a.nc.fechada && a.nc.verificacao ? ' · verificado: ' + esc(a.nc.verificacao) : '') + '</p>' : '';
  const res = a.resolucao && a.resolucao.texto ? '<p class="rp-l"><b>' + esc(a.status === 'nao_procede' ? 'Não procede' : 'Resolvido') + '</b> ' + esc(a.resolucao.texto) + ' · ' + esc(a.resolucao.porNome || '') + (a.resolucao.ts ? ', ' + esc(fmtD(diaLocal(a.resolucao.ts))) : '') + '</p>' : '';
  const rr = (a.risco ? '<p class="rp-l"><b>Risco</b> ' + esc(a.risco) + '</p>' : '') + (a.recom ? '<p class="rp-l"><b>Recomendação</b> ' + esc(a.recom) + '</p>' : '');
  return '<li class="rp-ap" data-act="rp-ap" data-id="' + esc(a.id) + '" tabindex="0"><div class="rp-c"><span class="rp-d">' + esc(fmtD(a.data)) + '</span><b>' + esc(apCat(a.categoria)[1]) + '</b>' +
    apGravPill(a) + apStPill(a) + apNcPill(a) + apReinPill(a) + apOrigPill(a) + '</div>' + (a.obs ? '<p class="rp-o">' + esc(a.obs) + '</p>' : '') + rr + nc + res +
    '<p class="rp-q">Registrado por ' + esc(a.porNome || '') + (a.comunicado ? ' · encarregado avisado' : '') + '</p>' + rpFotos(a) + '</li>';
}

function rpPartes(d) {
  const r = [], tab = amTab, bar = amBarra, f = S.rp;
  r.push(smSec('leitura', 'Como ler', 'gerado dos próprios apontamentos', '<ul class="am-lei">' + rpLeitura(d).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'));
  const ms = Math.max.apply(null, d.porSetor.map(x => x.n).concat([0]));
  r.push(smSec('setor', 'Por setor', smPl(d.porSetor.length, 'setor', 'setores') + (f.setor ? ' · todos os setores, para comparar' : ''),
    tab(['Setor', '', 'Total', 'Em aberto', 'Graves', 'NCs abertas'], d.porSetor.map(x => [x.nome === f.setor ? '<b>' + esc(x.nome) + '</b>' : esc(x.nome), bar(x.n, ms), rpN(x.n), rpN(x.ab || ''), rpN(x.gr || ''), rpN(x.nc || '')]), 'Nenhum apontamento no período.', [2, 3, 4, 5])));
  const mp = Math.max.apply(null, d.pareto.map(x => x.n).concat([0])), tp = d.conta.length;
  r.push(smSec('pareto', 'O que mais se repete', 'por categoria · em negrito, as que somam cerca de 80% (Outro fica no fim)',
    tab(['Categoria', '', 'Quantos', '%', 'Acumulado'], d.pareto.map(x => [x.vital ? '<b>' + esc(x.nome) + '</b>' : esc(x.nome), bar(x.n, mp), rpN(x.n), rpN(amPc(x.n, tp)), rpN(amPc(x.ac, tp))]), 'Nenhum apontamento no período.', [2, 3, 4])));
  const mm = Math.max.apply(null, d.meses.map(x => Math.max(x.reg, x.res)).concat([0]));
  r.push(smSec('meses', 'Mês a mês', 'registrados e resolvidos nos últimos ' + RP_MESES + ' meses' + (f.setor ? ' · ' + f.setor : ''),
    tab(['Mês', '', 'Registrados', 'Resolvidos'], d.meses.map(x => [x.mes === d.fx[1].slice(0, 7) ? '<b>' + esc(rpMesTxt(x.mes)) + '</b>' : esc(rpMesTxt(x.mes)), bar(x.reg, mm), rpN(x.reg || ''), rpN(x.res || '')]), '', [2, 3])));
  r.push(smSec('rein', 'Reincidências', 'o mesmo problema no mesmo setor mais de uma vez no período',
    tab(['Setor', 'Categoria', 'Vezes', 'Em aberto', 'Última'], d.rein.map(x => [esc(x.setor), esc(x.cat), rpN(x.n), rpN(x.ab || ''), esc(fmtD(x.ult))]), 'Nenhuma reincidência no período.', [2, 3])));
  r.push(smSec('nc', 'NCs e plano de ação', smPl(d.ncs.length, 'NC', 'NCs') + ' · ' + smPl(d.ncAb, 'aberta', 'abertas') + (d.ncV ? ' · ' + smPl(d.ncV, 'vencida', 'vencidas') : ''),
    d.ncs.length ? '<div class="sm-tw"><table class="sm-t am-t rp-t"><thead><tr><th>Setor</th><th>Categoria</th><th>Responsável</th><th>Prazo</th><th>Ação corretiva</th><th>Situação</th></tr></thead><tbody>' +
      d.ncs.map(a => '<tr data-act="rp-ap" data-id="' + esc(a.id) + '" tabindex="0"><td>' + esc(rpSetor(a)) + '</td><td>' + esc(apCat(a.categoria)[1]) + '</td><td>' + esc(a.nc.responsavel || '') + '</td><td>' + esc(a.nc.prazo ? fmtD(a.nc.prazo) : '') + '</td><td>' + esc(a.nc.acao || '') + '</td><td>' + apNcPill(a) + '</td></tr>').join('') +
      '</tbody></table></div>' : '<p class="sm-vz">Nenhuma NC aberta a partir destes apontamentos.</p>'));
  let resta = RP_LISTA_MAX; const blocos = d.setores.map(k => { const l = d.grupos[k].slice(0, Math.max(0, resta)); resta -= l.length; return !l.length ? '' : smH3(k + ' · ' + d.grupos[k].length) + '<ul class="rp-lst">' + l.map(rpAp).join('') + '</ul>'; }).join('');
  r.push(smSec('lista', 'Apontamentos por setor', smPl(d.base.length, 'apontamento', 'apontamentos') + ' · em aberto e mais graves primeiro' + (d.base.length > RP_LISTA_MAX ? ' · mostrando os ' + RP_LISTA_MAX + ' primeiros' : ''),
    blocos || '<p class="sm-vz">Nenhum apontamento com este filtro.</p>'));
  return r.join('');
}
function rpResumo(d) {
  return rlResumo([[String(d.conta.length), d.conta.length === 1 ? 'apontamento' : 'apontamentos', d.np ? d.np + ' não procede à parte' : 'no período'],
    [String(d.ab), 'em aberto', d.grAb ? d.grAb + ' grave' + (d.grAb === 1 ? '' : 's') + ' ou urgente' + (d.grAb === 1 ? '' : 's') : ''],
    [String(d.resolv), d.resolv === 1 ? 'resolvido' : 'resolvidos', d.media != null ? 'em média ' + smPl(d.media, 'dia', 'dias') : ''],
    [String(d.ncAb), d.ncAb === 1 ? 'NC aberta' : 'NCs abertas', d.ncV ? smPl(d.ncV, 'vencida', 'vencidas') : 'nenhuma vencida'],
    [String(d.rein.length), d.rein.length === 1 ? 'reincidência' : 'reincidências', 'mesmo setor e categoria']]);
}
function rpFiltroTxt() {
  const f = S.rp, p = [(RP_PER.find(x => x[0] === f.per) || RP_PER[0])[1]];
  if (f.setor) p.push(f.setor); if (f.sit) p.push((RP_SIT.find(x => x[0] === f.sit) || [0, ''])[1]); if (f.grav) p.push((RP_GRAV.find(x => x[0] === f.grav) || [0, ''])[1]);
  if (f.fotos !== 'sim') p.push('sem fotos');
  return p.join(' · ');
}

/* ---------- tela ---------- */
function rpTela() {
  const f = S.rp, ent = f._ent; f._ent = false;
  const c = cabecalho({ titulo: 'Relatório de apontamentos', abaNome: 'Apontamentos', acoes: '<button type="button" class="bt ic-so" data-act="rp-imp" data-ic-aba title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button>' });
  const sets = Array.from(new Set(apSetores().concat(S.apont.map(rpSetor)))).sort((a, b) => a === 'sem setor' ? 1 : b === 'sem setor' ? -1 : cmpTxt(a, b));
  const bar = '<div class="sm-bar"><button type="button" class="at-fl" data-act="rp-filtro" aria-expanded="' + esc(String(f.aberto)) + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(rpFiltroTxt()) + '</small></button></div>' +
    '<div class="sm-fp rp-fp"' + (f.aberto ? '' : ' hidden') + '><label class="cp">Período' + ddHTML('rp:per', f.per, RP_PER) + '</label>' +
    '<label class="cp">Setor' + ddHTML('rp:setor', f.setor, [['', 'Todos']].concat(sets.map(x => [x, x]))) + '</label>' +
    '<label class="cp">Situação' + ddHTML('rp:sit', f.sit, RP_SIT) + '</label><label class="cp">Gravidade' + ddHTML('rp:grav', f.grav, RP_GRAV) + '</label>' +
    '<label class="cp">Fotos' + ddHTML('rp:fotos', f.fotos, [['sim', 'Mostrar'], ['nao', 'Não mostrar']]) + '</label></div>';
  if (!S.apont.length) return c + bar + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Nenhum apontamento registrado.</b><span>Os apontamentos são lançados em Inspeções › Apontamentos.</span></div></section>';
  const d = rpDados();
  return c + '<div class="sm am rp' + (ent ? ' sm-ent' : '') + '">' + bar + rpResumo(d) + rpPartes(d) + '</div>';
}
const rpQual = TELAS.relatorios;
TELAS.relatorios = aba => aba === 'apontamentos' ? (rpVe() ? rpTela() : '') : (rpQual ? rpQual(aba) : '');
const rpDepois = TELAS['relatorios:depois'];
TELAS['relatorios:depois'] = aba => { if (rpDepois) rpDepois(aba); if (aba === 'apontamentos') { try { apFotosCarrega(document); } catch (e) { console.error(e); } } };

/* ---------- papel: as fotos são buscadas antes, para sair no papel ---------- */
async function rpImprimir() {
  const d = rpDados(), e = S.empresa || {}; let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  if (S.rp.fotos === 'sim') {
    const ids = []; let resta = RP_LISTA_MAX; d.setores.forEach(k => d.grupos[k].slice(0, Math.max(0, resta)).forEach(a => { resta--; const off = a.fotosOff || {}; (a.fotos || []).concat(a.fotosDepois || []).forEach(x => { if (!off[x]) ids.push(x); }); }));
    if (ids.some(x => S._apFotos[x] === undefined)) aviso('Preparando as fotos para imprimir…');
    await Promise.all(ids.map(x => apFotoGet(x).catch(() => '')));
  }
  p.innerHTML = '<div class="imp-cab"><b>Relatório de apontamentos · ' + esc(fmtD(hojeISO())) + '</b><span>' + esc([e.nome, rpFiltroTxt(), 'emitido por ' + S.user.nome].filter(Boolean).join(' · ')) + '</span></div><div class="sm sm-imp am rp">' + rpResumo(d) + rpPartes(d) + '</div><div class="imp-pe">' + esc(APP_APELIDO) + '</div>';
  $$('img[data-apfoto]', p).forEach(im => { const u = S._apFotos[im.getAttribute('data-apfoto')]; if (u && imgSrc(u)) im.src = imgSrc(u); else { const q = im.closest('.rp-ft'); if (q) q.remove(); } });
  Audit.log({ acao: 'imprimir', entidade: 'relatorio_apont', entidadeId: hojeISO(), resumo: 'Imprimiu o Relatório de apontamentos (' + rpFiltroTxt() + ')' });
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.rp = (k, v) => { if (!(k in S.rp)) return; S.rp[k] = v; S.rp._ent = true; render(); };
const rpAbre = id => { if (S.apont.some(a => a.id === id)) apAbre(id); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="rp-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'rp-filtro') { S.rp.aberto = !S.rp.aberto; render(); }
  else if (a === 'rp-imp') rpImprimir();
  else if (a === 'rp-ap') rpAbre(t.getAttribute('data-id'));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.rp.aberto && S.rota.area === 'relatorios' && S.rota.aba === 'apontamentos' && !S.gv && !document.querySelector('.dd-l:not([hidden])')) { e.preventDefault(); S.rp.aberto = false; render(); }
  else if (e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('data-act') === 'rp-ap') rpAbre(e.target.getAttribute('data-id'));
});
