/* EFCwork · contagem.js — CONTAGEM ÀS CEGAS do Almoxarifado (v0.3.2, pedido do Elias de 05/11 e Nº 51).
   Fluxo: o Líder/Administrador abre e escolhe quem conta (só aparece quem tem o Almoxarifado) → quem conta vê os materiais na ordem do
   lugar (portas em sequência, depois gavetas, depois o resto), lote a lote, SEM o saldo do sistema → na conferência aparecem os que não
   bateram e o app sugere recontar → depois da recontagem, cada diferença recebe o que aconteceu: saída esquecida (lançada com a data certa
   e marcada como ERRO DE LANÇAMENTO, com quem esqueceu e a reclamação), perda, quebra, achado… → concluir aplica tudo.
   Formato compatível com o EFClaudian (sv2_alm_inv: numero CNT-AAAA-NN, tipo 'contagem', partes.mat, contagens.m_<id> {cont, lotes, esp, …}).
   Campos novos (o EFClaudian ignora): contadorId/contadorNome, recontar{}, resolucoes{}. Prefixo: cg. */
Object.assign(S, { almInv: [], cgRasc: {}, cgVista: '' });
const CG_RES_EQ = { falta: [['nao_achado', 'Não encontrado (marcar no equipamento)'], ['Em outro lugar', 'Está em outro lugar'], ['Outro', 'Outro']], sobra: [['Outro', 'Outro']] };
const CG_RES_VID = { falta: [['Quebra', 'Quebra'], ['Perda', 'Perda'], ['Erro de lançamento', 'Erro de lançamento'], ['Outro', 'Outro']], sobra: [['Achado', 'Achado'], ['Entrada não lançada', 'Entrada não lançada'], ['Erro de lançamento', 'Erro de lançamento'], ['Outro', 'Outro']] };
const CG_RES = {
  falta: [['saida_retro', 'Saída esquecida (lançar com a data certa)'], ['Perda', 'Perda'], ['Quebra', 'Quebra'], ['Erro de lançamento', 'Erro de lançamento (sem saída)'], ['Outro', 'Outro']],
  sobra: [['Entrada não lançada', 'Entrada não lançada'], ['Achado', 'Achado'], ['Erro de lançamento', 'Erro de lançamento'], ['Outro', 'Outro']]
};
CS_CARGAS.push(() => { if (!alVe()) return; csOuve('sv2_alm_inv', l => { S.almInv = l; if (S.rota.area === 'almox' || S.rota.area === 'inicio') render(); }); });

/* ---------- dados ---------- */
const cgAberta = () => S.almInv.find(x => x.situacao === 'aberto') || null;
const cgDe = id => S.almInv.find(x => x.id === id) || null;
const cgChave = k => k.replace(':', '_');
function cgContagens(inv) { const o = {}, c = (inv && inv.contagens) || {}; Object.keys(c).forEach(k => { o[k.replace('_', ':')] = c[k]; }); return o; }
const cgDif = c => c ? alR((Number(c.cont) || 0) - (Number((c.esp || {}).total) || 0)) : 0;
/* ordem do lugar: portas em sequência, depois gavetas, depois o resto (pedido do Elias) */
function cgOrdemLocal(loc) {
  const s = String(loc || '').trim(), p = s.match(/porta\s*(\d+)/i), g = s.match(/gaveta\s*(\d+)/i);
  return p ? [0, Number(p[1]), s] : g ? [1, Number(g[1]), s] : [s ? 2 : 3, 0, s.toLowerCase()];
}
const cgCmpLocal = (a, b) => { const x = cgOrdemLocal(a), y = cgOrdemLocal(b); return x[0] - y[0] || x[1] - y[1] || String(x[2]).localeCompare(String(y[2]), 'pt-BR'); };
const cgNomeLocal = l => { const s = String(l || '').trim(); if (!s) return 'Sem local'; return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); };
/* materiais da contagem, na ordem do lugar; lotes com saldo (sem mostrar o saldo) */
/* o que entra na contagem: materiais (por lote), equipamentos (achei / não achei) e vidrarias (quantidade em cada lugar) — pedido de 06/11 */
const cgSlug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'x';
function cgAlvos(inv) {
  const p = (inv && inv.partes) || { mat: true }, out = [];
  if (p.mat !== false) alAtivos().forEach(i => out.push({ k: 'm:' + i.id, parte: 'mat', i: i, local: cgNomeLocal(i.local), lotes: alLotes(i.id, true).filter(l => l.saldo > 0) }));
  if (p.equip || p.vid) S.almEq.filter(e => e.situacao !== 'baixa' && !e.transito).forEach(e => {
    if (e.tipo === 'qtd') { if (!p.vid) return; const ls = Object.keys(e.qtdLocal || {}); (ls.length ? ls : [e.local || '']).forEach(l => out.push({ k: 'v:' + e.id + (ls.length > 1 ? '~' + cgSlug(l) : ''), parte: 'vid', e: e, vloc: l, i: { id: e.id, nome: e.nome, codigo: [e.marca, ls.length > 1 ? l : ''].filter(Boolean).join(' · '), un: 'un' }, local: cgNomeLocal(l || e.local), lotes: [] })); }
    else if (p.equip) out.push({ k: 'e:' + e.id, parte: 'equip', e: e, i: { id: e.id, nome: eqNomeC(e), codigo: [e.marca, e.serie ? 'série ' + e.serie : ''].filter(Boolean).join(' · '), un: '' }, local: cgNomeLocal([e.local, e.posicao].filter(Boolean).join(' · ')), lotes: [] });
  });
  const ord = { mat: 0, vid: 1, equip: 2 };
  return out.sort((a, b) => cgCmpLocal(a.local, b.local) || ord[a.parte] - ord[b.parte] || String(a.i.nome).localeCompare(b.i.nome, 'pt-BR'));
}
function cgEsperado(a) {
  if (a.parte === 'vid') return { total: Number((a.e.qtdLocal || {})[a.vloc]) || 0 };
  if (a.parte === 'equip') return { total: 1 };
  const l = {}; alLotes(a.i.id).forEach(x => { l[x.id] = x.saldo; }); return { total: alSaldo(a.i.id), lotes: l };
}
const CG_PARTES = [['mat', 'Materiais', 'por lote, quantidade'], ['equip', 'Equipamentos', 'achei / não achei'], ['vid', 'Vidrarias', 'quantidade em cada lugar']];
const cgPartesTxt = p => CG_PARTES.filter(x => p && (x[0] === 'mat' ? p.mat !== false : p[x[0]])).map(x => x[1].toLowerCase()).join(', ');
function cgProgresso(inv) {
  const al = cgAlvos(inv), ct = cgContagens(inv), rc = inv.recontar || {};
  const feitos = al.filter(a => ct[a.k]), difs = feitos.filter(a => cgDif(ct[a.k]) !== 0);
  return { al: al, ct: ct, total: al.length, feitos: feitos.length, difs: difs, bateram: feitos.length - difs.length, recontar: al.filter(a => rc[cgChave(a.k)]), faltam: al.filter(a => !ct[a.k]) };
}
const cgPodeAbrir = () => alSup();
const cgSouContador = inv => !!inv && (inv.contadorId === S.user.id || (!inv.contadorId && alPode()));
const cgPodeContar = inv => !!inv && inv.situacao === 'aberto' && alPode() && (cgSouContador(inv) || alSup());
const cgPessoas = () => S.users.filter(u => !u.bloqueado && u.ativo !== false && podeLancar(u) && temAtrib(u, 'almox')).sort((a, b) => String(a.nome).localeCompare(b.nome, 'pt-BR'));
function cgNumero() { const a = hojeISO().slice(0, 4), n = S.almInv.filter(x => String(x.numero || '').indexOf('CNT-' + a + '-') === 0).length + 1; return 'CNT-' + a + '-' + pad(n); }
function cgLocais() { const u = (S.empresa && S.empresa.unidades) || []; return u.length ? u : ['Almoxarifado']; }

/* ---------- situação de cada material na conferência ---------- */
function cgSitItem(inv, a, ct) {
  const c = ct[a.k], rc = inv.recontar || {}, rs = (inv.resolucoes || {})[cgChave(a.k)];
  if (!c) return { id: 'falta', txt: 'Falta contar', cor: '' };
  if (rc[cgChave(a.k)]) return { id: 'recontar', txt: 'Recontagem pedida', cor: 'wa' };
  const d = cgDif(c);
  if (!d) return c.ant && c.ant.length ? { id: 'bateu2', txt: 'Bateu na recontagem', cor: 'ok' } : { id: 'bateu', txt: 'Bateu', cor: 'ok' };
  if (rs) return { id: 'resolvido', txt: rs.tipo === 'saida_retro' ? 'Saída esquecida' : rs.tipo, cor: rs.tipo === 'saida_retro' ? 'cr' : '' };
  return { id: 'difere', txt: (c.ant && c.ant.length ? 'Não bateu de novo' : 'Não bateu'), cor: 'cr' };
}

/* ======================= tela ======================= */
function cgTela() {
  const inv = cgAberta(), sup = alSup();
  const hist = S.almInv.filter(x => x.situacao !== 'aberto').slice().sort((a, b) => String(b.abertoEm).localeCompare(String(a.abertoEm)));
  if (!inv) {
    const ult = hist.find(x => x.situacao === 'concluido');
    let h = '<section class="pn cg-vazio"><div class="cg-vz">' + ic('lista') + '<div><b>Nenhuma contagem aberta</b><span>' + (ult ? 'A última foi a ' + esc(ult.numero) + ', concluída em ' + fmtD(String(ult.concluidoEm || '').slice(0, 10)) + '.' : 'Nenhuma contagem feita ainda.') + ' Na contagem às cegas, quem conta não vê o saldo do sistema.</span></div>' +
      (sup ? '<button type="button" class="bt pr" data-act="cg-nova">' + ic('mais') + 'Nova contagem</button>' : '') + '</div></section>';
    return h + cgHistorico(hist);
  }
  const pr = cgProgresso(inv), pct = pr.total ? Math.round(pr.feitos / pr.total * 100) : 0, rcN = pr.recontar.length;
  const vista = sup && S.cgVista === 'conf' ? 'conf' : 'contar';
  let h = '<section class="pn cg-topo"><div class="cg-tp"><div class="cg-tpt"><span class="pill wa">Em andamento</span><small>' + esc(inv.local || '') + ' · aberta por ' + esc(inv.porNome || '') + ' em ' + fmtD(String(inv.abertoEm || '').slice(0, 10)) + '</small><small>Quem conta: <b>' + esc(inv.contadorNome || 'qualquer pessoa do Almoxarifado') + '</b> · ' + esc(cgPartesTxt(inv.partes) || 'materiais') + '</small></div>' +
    '<div class="cg-pct"><b class="num">' + pct + '%</b><small>' + pr.feitos + ' de ' + pr.total + ' contados</small></div></div>' +
    '<div class="cg-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
    (sup ? '<div class="cg-acts">' + ddHTML('cg:vista', vista, [['contar', 'Mostrar: contagem'], ['conf', 'Mostrar: conferência' + (pr.difs.length ? ' (' + pr.difs.length + ' não bateram)' : '')]]) + '<span class="sp"></span><button type="button" class="bt ic-so" data-act="cg-folha" title="Imprimir a folha de contagem (sem o saldo)" aria-label="Imprimir a folha de contagem">' + ic('impressora') + '</button><button type="button" class="bt ic-so" data-act="cg-cancelar" title="Cancelar a contagem" aria-label="Cancelar a contagem">' + ic('lixo') + '</button></div>' : '') + '</section>';
  if (vista === 'conf') return h + cgConferencia(inv, pr);
  if (!cgPodeContar(inv)) return h + '<section class="pn"><div class="vazio">' + ic('info') + '<b>Esta contagem está com ' + esc(inv.contadorNome || 'outra pessoa') + '.</b><span>Quando ela terminar, o Líder confere.</span></div></section>';
  return h + cgContar(inv, pr);
}
function cgHistorico(hist) {
  if (!hist.length) return '';
  return tbHTML({ id: 'cg-hist', titulo: 'Contagens e inventários', unidade: 'contagens', linhas: hist, aoClicar: cgAbreResumo, selecionado: S._alSel, buscaDica: 'Buscar número, local ou pessoa',
    busca: x => [x.numero, x.local, x.porNome, x.contadorNome].join(' '),
    cols: [
      { k: 'num', rot: 'Número', fixa: true, v: x => x.numero || '', cls: 'forte' },
      { k: 'tipo', rot: 'Tipo', v: x => x.tipo === 'contagem' ? 'Contagem' : 'Inventário' },
      { k: 'loc', rot: 'Local', v: x => x.local || '' },
      { k: 'quem', rot: 'Quem contou', v: x => x.contadorNome || '' },
      { k: 'ab', rot: 'Aberta', tipo: 'data', v: x => String(x.abertoEm || '').slice(0, 10) },
      { k: 'fim', rot: 'Concluída', tipo: 'data', v: x => String(x.concluidoEm || '').slice(0, 10) },
      { k: 'ct', rot: 'Contados', tipo: 'num', v: x => (x.resumo || {}).contados || 0 },
      { k: 'df', rot: 'Diferenças', tipo: 'num', v: x => (x.resumo || {}).difs || 0 },
      { k: 'er', rot: 'Erros de lançamento', tipo: 'num', v: x => (x.resumo || {}).erros || 0 },
      { k: 'sit', rot: 'Situação', v: x => x.situacao === 'concluido' ? 'Concluída' : 'Cancelada', html: x => alPill(x.situacao === 'concluido' ? 'Concluída' : 'Cancelada', x.situacao === 'concluido' ? 'ok' : '') }] });
}

/* ---------- contar (às cegas) ---------- */
function cgContar(inv, pr) {
  const rc = inv.recontar || {}, busca = tbNorm(S.cgBusca || '').trim(), loc = S.cgLocal || '';
  const vis = a => (!loc || a.local === loc) && (!busca || busca.split(/\s+/).every(w => tbNorm([a.i.nome, a.i.codigo, a.local].join(' ')).indexOf(w) >= 0));
  const locais = Array.from(new Set(pr.al.map(a => a.local)));
  let h = '<div class="cg-bar2"><label class="tb-busca">' + ic('lupa') + '<input type="search" data-cgbusca value="' + esc(S.cgBusca || '') + '" placeholder="' + (cgSoMat(inv) ? 'Buscar material' : 'Buscar item') + '" aria-label="Buscar material" data-foco="cg-busca"></label>' +
    ddHTML('cg:local', loc, [['', 'Todos os lugares']].concat(locais.map(l => { const g = pr.al.filter(a => a.local === l); return [l, l + ' · ' + g.filter(a => pr.ct[a.k]).length + '/' + g.length]; }))) +
    '<span class="cg-dica">' + ic('olho') + 'Às cegas: o saldo do sistema não aparece</span></div>';
  const rec = pr.recontar.filter(vis);
  if (rec.length) h += '<section class="pn cg-grp cg-rec"><div class="hd"><span class="ico ini-wa">' + ic('recontar') + '</span><h3>Recontar</h3><em>' + rec.length + '</em><span class="sp"></span><small>O Líder pediu para contar de novo</small></div>' + rec.map(a => cgItemHTML(inv, a, null, true)).join('') + '</section>';
  locais.forEach(l => {
    const g = pr.al.filter(a => a.local === l && vis(a) && !rc[cgChave(a.k)]); if (!g.length) return;
    const tot = pr.al.filter(a => a.local === l), f = tot.filter(a => pr.ct[a.k]).length;
    h += '<section class="pn cg-grp"><div class="hd"><span class="ico">' + ic('caixa') + '</span><h3>' + esc(l) + '</h3><em>' + f + '/' + tot.length + '</em><span class="sp"></span>' + (f === tot.length ? alPill('Pronto', 'ok') : '') + '</div>' + g.map(a => cgItemHTML(inv, a, pr.ct[a.k], false)).join('') + '</section>';
  });
  if (!h.includes('cg-it')) h += '<section class="pn"><div class="vazio"><span>Nada encontrado.</span></div></section>';
  if (!pr.faltam.length && !pr.recontar.length) h += '<section class="pn cg-fim"><div class="vazio">' + ic('ok') + '<b>Tudo contado.</b><span>' + (alSup() ? 'Abra a conferência para ver o que não bateu.' : 'O Líder vai conferir e, se precisar, pedir recontagem.') + '</span>' + (alSup() ? '<button type="button" class="bt pr" data-act="cg-ver-conf">Ver a conferência</button>' : '') + '</div></section>';
  return h;
}
function cgItemHTML(inv, a, c, recontar) {
  const i = a.i, k = a.k, rz = S.cgRasc[k] || {}, feito = !!c && !recontar, edit = S.cgEdit === k;
  const lotes = a.lotes.length ? a.lotes : [{ id: '', lote: '', validade: '' }];
  const head = '<div class="cg-ith"><span class="cg-nm"><b>' + esc(i.nome) + '</b><small>' + esc([i.codigo, i.un].filter(Boolean).join(' · ')) + '</small></span>';
  if (feito && !edit) return '<div class="cg-it ok" data-k="' + esc(k) + '">' + head + '<span class="cg-res">' + (a.parte === 'equip' ? '<b class="cg-ach' + (c.cont ? '' : ' nao') + '">' + (c.cont ? 'Achei' : 'Não achei') + '</b>' : '<b class="num">' + alQ(c.cont) + '</b> ' + esc(i.un || '')) + '<small>' + esc(c.porNome || '') + '</small></span><button type="button" class="bt ic-so" data-act="cg-edit" data-k="' + esc(k) + '" title="Contar de novo" aria-label="Contar de novo">' + ic('lapis') + '</button></div></div>';
  if (a.parte === 'equip') return '<div class="cg-it' + (recontar ? ' rc' : '') + '" data-k="' + esc(k) + '">' + head + '</div><div class="cg-lts cg-eqb"><button type="button" class="bt" data-act="cg-achei" data-k="' + esc(k) + '" data-v="0">' + ic('x') + 'Não achei</button><button type="button" class="bt pr" data-act="cg-achei" data-k="' + esc(k) + '" data-v="1">' + ic('ok') + 'Achei</button></div></div>';
  return '<div class="cg-it' + (recontar ? ' rc' : '') + '" data-k="' + esc(k) + '">' + head + '</div><div class="cg-lts">' + lotes.map((l, n) => {
    const v = rz[l.id] != null ? rz[l.id] : (edit && c && c.lotes && c.lotes[l.id] != null ? alQin(c.lotes[l.id]) : '');
    return '<label class="cg-lt"><span>' + (l.id ? esc(l.lote || 'sem lote') + (l.validade ? ' · vence ' + fmtD(l.validade) : '') : 'Quantidade') + '</span><input class="fm-i num" inputmode="decimal" autocomplete="off" data-cgk="' + esc(k) + '" data-cgl="' + esc(l.id) + '" data-foco="cg:' + esc(k) + ':' + esc(l.id) + '" value="' + esc(v) + '" placeholder="' + esc(i.un || 'qtd') + '" aria-label="Contado' + (l.id ? ' no lote ' + esc(l.lote || 'sem lote') : '') + '"></label>';
  }).join('') + '<button type="button" class="bt pr cg-ok" data-act="cg-salva" data-k="' + esc(k) + '">' + ic('ok') + 'Contado</button></div>' + (a.lotes.length > 1 ? '<p class="cg-ob">Conte cada lote (0 se não achou).</p>' : '') + '</div>';
}
async function cgSalvar(k, achou) {
  const inv = cgAberta(); if (!cgPodeContar(inv)) return;
  const a = cgAlvos(inv).find(x => x.k === k); if (!a) return;
  if (a.parte === 'equip') { S.cgRasc[k] = { '': achou ? '1' : '0' }; }
  const lotes = a.lotes.length ? a.lotes : [{ id: '' }], rz = S.cgRasc[k] || {};
  if (a.parte !== 'equip') $$('[data-cgk="' + k + '"]').forEach(x => { rz[x.getAttribute('data-cgl')] = x.value; }); S.cgRasc[k] = rz;
  let tot = 0; const lt = {};
  for (const l of lotes) { const t = String(rz[l.id] == null ? '' : rz[l.id]).trim(); if (t === '') { aviso('Conte todos os lotes de ' + a.i.nome + ' (0 se não achou).', 'erro'); const e = $('[data-cgk="' + k + '"][data-cgl="' + l.id + '"]'); if (e) e.focus(); return; } const n = alNum(t); if (!(n >= 0)) { aviso('Quantidade inválida em ' + a.i.nome + '.', 'erro'); return; } tot += n; if (l.id) lt[l.id] = alR(n); }
  const ant = cgContagens(inv)[k], reg = { porId: S.user.id, porNome: S.user.nome, ts: nowISO(), obs: '', esp: cgEsperado(a), lotes: lt, cont: alR(tot) };
  if (ant) reg.ant = (ant.ant || []).concat([{ cont: ant.cont, lotes: ant.lotes || {}, porNome: ant.porNome, ts: ant.ts, esp: ant.esp }]);
  const patch = { ['contagens.' + cgChave(k)]: reg }; if ((inv.recontar || {})[cgChave(k)]) patch['recontar.' + cgChave(k)] = false;
  if ((inv.resolucoes || {})[cgChave(k)]) patch['resolucoes.' + cgChave(k)] = null;
  delete S.cgRasc[k]; if (S.cgEdit === k) S.cgEdit = '';
  try { await Data.col('sv2_alm_inv').update(inv.id, patch); } catch (e) { aviso(svErro(e), 'erro'); return; }
  /* foco no próximo que falta */
  setTimeout(() => { const prox = $$('.cg-it:not(.ok) input[data-cgk], .cg-it:not(.ok) [data-act="cg-achei"][data-v="1"]').find(x => (x.getAttribute('data-cgk') || x.getAttribute('data-k')) !== k); if (prox) { prox.focus(); try { prox.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {} } }, 60);
}

/* ---------- conferência (Líder/Administrador) ---------- */
function cgConferencia(inv, pr) {
  const rs = inv.resolucoes || {}, pend = pr.difs.filter(a => !(inv.recontar || {})[cgChave(a.k)] && !rs[cgChave(a.k)]), recPedida = pr.recontar.length;
  const jaRecontados = pr.difs.filter(a => (pr.ct[a.k].ant || []).length), naoRecontados = pend.filter(a => !(pr.ct[a.k].ant || []).length);
  const eu = Object.keys(pr.ct).some(k => pr.ct[k] && pr.ct[k].porId === S.user.id);
  let h = '<div class="kps cg-kps"><div class="kp"><b class="num">' + pr.feitos + '</b><span>contados de ' + pr.total + '</span></div><div class="kp' + (pr.bateram ? ' ok' : '') + '"><b class="num">' + pr.bateram + '</b><span>bateram</span></div><div class="kp' + (pr.difs.length ? ' cr' : '') + '"><b class="num">' + pr.difs.length + '</b><span>não bateram</span></div><div class="kp' + (recPedida ? ' wa' : '') + '"><b class="num">' + recPedida + '</b><span>em recontagem</span></div></div>';
  if (eu) h += '<p class="al-aviso">' + ic('info') + 'Você também contou. O recomendado é que quem conta não seja quem confere.</p>';
  if (naoRecontados.length) h += '<section class="pn cg-sug"><div class="cg-sgt"><span class="ico ini-wa">' + ic('recontar') + '</span><div><b>Sugestão: recontar os ' + naoRecontados.length + ' que não bateram</b><span>Antes de ajustar, peça para ' + esc(inv.contadorNome || 'quem contou') + ' contar de novo, às cegas. Se bater na recontagem, foi erro de contagem e nada muda no estoque.</span></div><button type="button" class="bt pr" data-act="cg-recontar">' + ic('recontar') + 'Pedir recontagem (' + naoRecontados.length + ')</button></div></section>';
  const linhas = pr.al.filter(a => pr.ct[a.k] && (cgDif(pr.ct[a.k]) !== 0 || (pr.ct[a.k].ant || []).length || (inv.recontar || {})[cgChave(a.k)]));
  h += tbHTML({ id: 'cg-conf', titulo: 'Conferência ' + inv.numero, unidade: 'materiais', linhas: linhas.map(a => Object.assign({ id: a.k }, a)), aoClicar: k => cgAbreItem(k), selecionado: S._cgSel, buscaDica: 'Buscar material ou lugar',
    vazio: pr.feitos ? 'Tudo o que foi contado bateu com o sistema.' : 'Nada contado ainda.',
    busca: a => [a.i.nome, a.i.codigo, a.local].join(' '),
    filtros: [{ k: 'sit', rot: 'Situação', opcoes: [['difere', 'Não bateu (decidir)'], ['recontar', 'Recontagem pedida'], ['bateu2', 'Bateu na recontagem'], ['resolvido', 'Já decidido']], teste: (a, v) => { const s = cgSitItem(inv, a, pr.ct).id; return v === 'difere' ? s === 'difere' : s === v; } }],
    cols: [
      { k: 'loc', rot: 'Lugar', v: a => a.local },
      { k: 'nome', rot: 'Item', fixa: true, v: a => a.i.nome, cls: 'forte' },
      { k: 'tp', rot: 'Tipo', v: a => a.parte === 'equip' ? 'Equipamento' : a.parte === 'vid' ? 'Vidraria' : 'Material' },
      { k: 'sis', rot: 'Sistema', tipo: 'num', v: a => Number((pr.ct[a.k].esp || {}).total) || 0 },
      { k: 'c1', rot: '1ª contagem', tipo: 'num', v: a => { const c = pr.ct[a.k]; return (c.ant && c.ant.length ? c.ant[0].cont : c.cont); } },
      { k: 'c2', rot: 'Recontagem', tipo: 'num', v: a => { const c = pr.ct[a.k]; return c.ant && c.ant.length ? c.cont : ''; } },
      { k: 'dif', rot: 'Diferença', tipo: 'num', v: a => cgDif(pr.ct[a.k]), html: a => { const d = cgDif(pr.ct[a.k]); return d ? '<b class="cg-d ' + (d < 0 ? 'neg' : 'pos') + '">' + (d > 0 ? '+' : '') + alQ(d) + '</b>' : '<span class="tb-nada">0</span>'; } },
      { k: 'sit', rot: 'Situação', v: a => cgSitItem(inv, a, pr.ct).txt, html: a => { const s = cgSitItem(inv, a, pr.ct); return alPill(s.txt, s.cor); } }] });
  const falta = pr.difs.filter(a => !(inv.recontar || {})[cgChave(a.k)] && !rs[cgChave(a.k)]).length;
  h += '<section class="pn cg-conc"><div class="cg-cc"><div><b>' + (falta ? 'Falta decidir ' + falta + (falta === 1 ? ' material' : ' materiais') : recPedida ? 'Esperando a recontagem de ' + recPedida : 'Pronto para concluir') + '</b><span>' + (pr.faltam.length ? pr.faltam.length + ' material(is) sem contagem ficam como estão no sistema. ' : '') + 'Ao concluir, as decisões viram lançamentos (ajuste lote a lote ou saída com a data certa) e a contagem fica no histórico.</span></div>' +
    '<button type="button" class="bt pr" data-act="cg-concluir"' + (falta || recPedida || !pr.feitos ? ' disabled' : '') + '>' + ic('ok') + 'Concluir contagem</button></div></section>';
  return h;
}
async function cgPedirRecontagem() {
  const inv = cgAberta(); if (!inv || !alSup()) return; const pr = cgProgresso(inv), rs = inv.resolucoes || {};
  const alvo = pr.difs.filter(a => !(inv.recontar || {})[cgChave(a.k)] && !rs[cgChave(a.k)] && !(pr.ct[a.k].ant || []).length); if (!alvo.length) return;
  const patch = {}; alvo.forEach(a => { patch['recontar.' + cgChave(a.k)] = true; });
  try { await Data.col('sv2_alm_inv').update(inv.id, patch); } catch (e) { aviso(svErro(e), 'erro'); return; }
  if (inv.contadorId && inv.contadorId !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Recontar ' + alvo.length + ' material(is) · ' + inv.numero, texto: S.user.nome + ' pediu para contar de novo: ' + alvo.slice(0, 6).map(a => a.i.nome).join(', ') + (alvo.length > 6 ? '…' : '') + '.', para: [inv.contadorId], refTipo: 'inventario', refId: inv.id }).catch(() => {});
  Audit.log({ acao: 'inventario_recontar', entidade: 'almox_inv', entidadeId: inv.id, resumo: 'Pediu recontagem no ' + inv.numero + ': ' + alvo.map(a => a.i.nome).join(', ') });
  aviso('Recontagem pedida (' + alvo.length + ').' + (inv.contadorNome ? ' ' + inv.contadorNome + ' foi avisado(a).' : ''));
}

/* ---------- gaveta do material na conferência: o que aconteceu ---------- */
function cgAbreItem(k) {
  S._cgSel = k; gvAbrir(() => {
    const inv = cgAberta(); if (!inv) return null; const a = cgAlvos(inv).find(x => x.k === k), c = cgContagens(inv)[k]; if (!a || !c) return null;
    const s = cgSitItem(inv, a, cgContagens(inv)), d = cgDif(c), rs = (inv.resolucoes || {})[cgChave(k)], i = a.i;
    const lts = Object.keys(Object.assign({}, (c.esp || {}).lotes, c.lotes)).map(lid => { const l = alIdx().lots[lid] || { lote: '?' }, e = Number(((c.esp || {}).lotes || {})[lid]) || 0, n = Number((c.lotes || {})[lid]) || 0; return [l.lote || 'sem lote', e, n, alR(n - e)]; });
    return { ico: 'caixa', sub: 'Conferência ' + inv.numero + ' · ' + a.local, titulo: i.nome, pill: alPill(s.txt, s.cor),
      corpo: gvNums([[alQ((c.esp || {}).total || 0), 'sistema (' + (i.un || 'un') + ')'], [alQ(c.cont), (c.ant && c.ant.length ? 'recontagem' : 'contado')], [(d > 0 ? '+' : '') + alQ(d), 'diferença', d < 0 ? 'cr' : d > 0 ? 'wa' : '']]) +
        (lts.length > 1 ? '<p class="gv-h">Lote a lote</p><div class="gv-lotes">' + lts.map(x => '<div class="gv-lote"><span>' + esc(x[0]) + '</span><span class="num">sistema ' + alQ(x[1]) + ' · contado ' + alQ(x[2]) + (x[3] ? ' · <b class="cg-d ' + (x[3] < 0 ? 'neg' : 'pos') + '">' + (x[3] > 0 ? '+' : '') + alQ(x[3]) + '</b>' : '') + '</span></div>').join('') + '</div>' : '') +
        '<p class="gv-h">Contagens</p>' + gvLinha((c.ant || []).map((x, n) => [(n ? (n + 1) + 'ª' : '1ª') + ' contagem: ' + alQ(x.cont), (x.porNome || '') + ' · ' + fmtDT(x.ts)]).concat([[((c.ant || []).length ? 'Recontagem' : 'Contagem') + ': ' + alQ(c.cont), (c.porNome || '') + ' · ' + fmtDT(c.ts)]])) +
        (rs ? '<p class="gv-h">Decisão</p>' + gvCampos([['O que aconteceu', rs.tipo === 'saida_retro' ? 'Saída esquecida (erro de lançamento)' : rs.tipo], ['Data da saída', rs.data ? fmtD(rs.data) : ''], ['Motivo', rs.motivo], ['Quem esqueceu', rs.respNome], ['Reclamação', rs.reclamacao], ['Decidido por', (rs.porNome || '') + ' · ' + fmtDT(rs.ts)]]) : ''),
      rodape: d && !(inv.recontar || {})[cgChave(k)] ? (!(c.ant || []).length ? '<button type="button" class="bt" data-act="cg-recontar1" data-k="' + esc(k) + '">' + ic('recontar') + 'Pedir recontagem</button>' : '') + '<button type="button" class="bt pr" data-act="cg-decidir" data-k="' + esc(k) + '">' + ic(rs ? 'lapis' : 'ok') + (rs ? 'Mudar a decisão' : 'Decidir') + '</button>' : '' };
  });
  render();
}
LC_FORM.cgres = f => {
  const inv = cgAberta(); if (!inv) return null; const a = cgAlvos(inv).find(x => x.k === f.kItem), c = cgContagens(inv)[f.kItem]; if (!a || !c) return null;
  const R = a.parte === 'equip' ? CG_RES_EQ : a.parte === 'vid' ? CG_RES_VID : CG_RES, d = cgDif(c), falta = d < 0, ops = falta ? R.falta : R.sobra, retro = f.tipo === 'saida_retro', pes = cgPessoas();
  let corpo = lcMsg() + (a.parte === 'equip' ? lcAv('<b>Não achado</b> na contagem (' + esc(a.local) + ').', 'cr') : gvNums([[alQ((c.esp || {}).total || 0), 'sistema'], [alQ(c.cont), 'contado'], [(d > 0 ? '+' : '') + alQ(d), falta ? 'falta' : 'sobra', falta ? 'cr' : 'wa']])) +
    lcBl('O que aconteceu?', ddHTML('lc:cgtipo', f.tipo || '', [['', 'Escolha']].concat(ops)));
  if (retro) corpo += lcAv('A saída entra com a data em que aconteceu e fica marcada como <b>erro de lançamento</b>, com quem esqueceu e a sua reclamação. A pessoa é avisada no sino.', 'wa') +
    '<div class="fm-g">' + lcBl('Data da saída', lcData('data', f.data)) + lcBl('Quem esqueceu de lançar', ddHTML('lc:cgresp', f.respId || '', [['', 'Não sei']].concat(pes.map(u => [u.id, u.nome])))) + '</div>' +
    lcMotivoBl('item:' + a.i.id) + lcBl('Reclamação', lcTx('reclamacao', f.reclamacao, 'Ex.: saída usada no envio de quinta e não lançada'), 'opcional');
  else if (f.tipo) corpo += lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"'));
  return { ico: 'lista', sub: 'Conferência ' + inv.numero + ' · ' + a.local, titulo: a.i.nome, corpo: corpo, rodape: lcPe('cg-res-ok', 'Guardar decisão') };
};
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; if (f && (k === 'cgtipo' || k === 'cgresp')) { f.sujo = true; if (k === 'cgtipo') f.tipo = v; else f.respId = v; f.msg = ''; gvDesenha(true); return; } ant(k, v); }; })(DD_AO.lc);
async function cgResOk() {
  const f = S.fm, inv = cgAberta(); if (!f || !inv) return;
  if (!f.tipo) return lcErro('Escolha o que aconteceu.');
  const r = { tipo: f.tipo, porId: S.user.id, porNome: S.user.nome, ts: nowISO(), obs: String(f.obs || '').trim() };
  if (f.tipo === 'saida_retro') {
    const er = validaData(f.data); if (er) return lcErro(er);
    if (String(inv.abertoEm || '').slice(0, 10) < f.data) return lcErro('A saída esquecida tem de ser antes da contagem (' + fmtD(String(inv.abertoEm).slice(0, 10)) + ').');
    const mot = lcMotFinal(f); if (!mot) return lcErro('Escolha o motivo da saída.');
    const u = f.respId ? userById(f.respId) : null;
    Object.assign(r, { data: f.data, motivo: mot, respId: u ? u.id : '', respNome: u ? u.nome : '', reclamacao: String(f.reclamacao || '').trim() });
  }
  if (!lcTravar()) return;
  const k = f.kItem; try { await Data.col('sv2_alm_inv').update(inv.id, { ['resolucoes.' + cgChave(k)]: r }); } catch (e) { return lcErro(svErro(e)); }
  lcFim(); aviso('Decisão guardada. Ela vira lançamento quando você concluir a contagem.');
}
async function cgConcluir() {
  const inv = cgAberta(); if (!inv || !alSup()) return; const pr = cgProgresso(inv), rs = inv.resolucoes || {};
  if (pr.recontar.length) { aviso('Ainda há recontagem pedida.', 'erro'); return; }
  const semDec = pr.difs.filter(a => !rs[cgChave(a.k)]); if (semDec.length) { aviso('Falta decidir: ' + semDec.slice(0, 3).map(a => a.i.nome).join(', ') + (semDec.length > 3 ? '…' : '') + '.', 'erro'); return; }
  if (S._cgConc) return; S._cgConc = true;
  const res = { contados: pr.feitos, total: pr.total, difs: pr.difs.length, bateramNaRecontagem: pr.al.filter(a => pr.ct[a.k] && !cgDif(pr.ct[a.k]) && (pr.ct[a.k].ant || []).length).length, erros: 0, ajustes: [] };
  try {
    for (const a of pr.difs) {
      const c = pr.ct[a.k], r = rs[cgChave(a.k)];
      if (a.parte !== 'mat') {
        const e = S.almEq.find(x => x.id === a.e.id); if (!e) continue; const mot = 'Contagem ' + inv.numero + ': ' + (r.tipo === 'nao_achado' ? 'não encontrado' : r.tipo) + (r.obs ? ' — ' + r.obs : '');
        let patch = {}, ev;
        if (a.parte === 'vid') { const qn = Object.assign({}, e.qtdLocal || {}); qn[a.vloc] = c.cont; patch = { qtdLocal: qn }; ev = { tipo: 'quantidade', data: hojeISO(), texto: mot + ' · ' + a.vloc + ' ' + (Number((e.qtdLocal || {})[a.vloc]) || 0) + ' → ' + c.cont, antes: { qtdLocal: e.qtdLocal || {} }, depois: { qtdLocal: qn } }; res.ajustes.push(e.nome + ' (' + a.vloc + ') → ' + c.cont + ' (' + r.tipo + ')'); }
        else { if (r.tipo === 'nao_achado') patch = { naoAchado: inv.numero }; ev = { tipo: 'inventario', data: hojeISO(), texto: mot }; res.ajustes.push(eqNomeC(e) + ': ' + (r.tipo === 'nao_achado' ? 'não encontrado' : r.tipo)); }
        await Data.col('sv2_alm_equip').update(e.id, Object.assign({}, patch, { hist: (e.hist || []).concat([Object.assign({ ts: nowISO(), porId: S.user.id, porNome: S.user.nome }, ev)]), atualizadoEm: nowISO() }));
        Audit.log({ acao: 'equip_inventario', entidade: 'almox_equip', entidadeId: e.id, resumo: eqNomeC(e) + ': ' + mot, depois: patch });
        continue;
      }
      const i = alItem(a.i.id); if (!i) continue;
      const linhas = Object.keys(Object.assign({}, (c.esp || {}).lotes, c.lotes)).map(lid => { const l = alIdx().lots[lid]; const e = Number(((c.esp || {}).lotes || {})[lid]) || 0, n = Number((c.lotes || {})[lid]) || 0, d = alR(n - e); return l && d ? { l: l, d: d } : null; }).filter(Boolean);
      if (r.tipo === 'saida_retro') {
        const grupo = linhas.filter(x => x.d < 0).length > 1 ? uid() : '';
        for (const x of linhas) {
          if (x.d < 0) {
            const q = Math.min(-x.d, Math.max(0, x.l.saldo)); if (!(q > 0)) continue;
            await Data.col('sv2_alm_mov').set(uid(), { tipo: 'saida', itemId: i.id, itemNome: i.nome, lotRef: x.l.id, lote: x.l.lote, validade: x.l.validade, qtd: alR(q), preco: x.l.preco, motivo: r.motivo, obs: 'Saída esquecida, achada na contagem ' + inv.numero + (r.obs ? ' — ' + r.obs : ''), data: r.data, grupo: grupo, criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome,
              retroativa: { invId: inv.id, contagem: inv.numero, lancadaEm: hojeISO() }, erro: { tipo: 'saida_nao_lancada', responsavelId: r.respId || '', responsavelNome: r.respNome || '', reclamacao: r.reclamacao || '', registradoPor: S.user.nome, ts: nowISO() } });
          } else await Data.col('sv2_alm_mov').set(uid(), { tipo: 'ajuste', itemId: i.id, itemNome: i.nome, lotRef: x.l.id, lote: x.l.lote || '', validade: x.l.validade || '', qtd: x.d, preco: x.l.preco || 0, motivo: 'Contagem ' + inv.numero + ': sobra no lote', data: hojeISO(), criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome });
        }
        res.erros++; res.ajustes.push(i.nome + ': saída esquecida de ' + fmtD(r.data) + (r.respNome ? ' (' + r.respNome + ')' : ''));
        if (r.respId && r.respId !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Saída não lançada: ' + i.nome, texto: 'Na contagem ' + inv.numero + ', faltou ' + alQ(-cgDif(c)) + ' ' + (i.un || '') + ' de ' + i.nome + '. A saída de ' + fmtD(r.data) + ' foi lançada agora e ficou registrada como erro de lançamento' + (r.reclamacao ? '. Reclamação de ' + S.user.nome + ': ' + r.reclamacao : '') + '.', para: [r.respId], refTipo: 'inventario', refId: inv.id }).catch(() => {});
      } else {
        const ls = linhas.map(x => ({ lotRef: x.l.id, lote: x.l.lote, validade: x.l.validade, qtd: x.d, preco: x.l.preco }));
        if (ls.length) { await lcAplicar({ acao: 'ajuste', refId: i.id, linhas: ls, motivo: 'Contagem ' + inv.numero + ': ' + r.tipo + (r.obs ? ' — ' + r.obs : ''), data: hojeISO() }, null); res.ajustes.push(i.nome + ' ' + ls.map(l => (l.qtd > 0 ? '+' : '') + alQ(l.qtd)).join(' ') + ' (' + r.tipo + ')'); }
      }
    }
    /* equipamento que estava marcado "não encontrado" e foi achado: tira a marca */
    for (const a of pr.al.filter(x => x.parte === 'equip' && pr.ct[x.k] && pr.ct[x.k].cont && x.e.naoAchado)) { const e = S.almEq.find(x => x.id === a.e.id); if (e) { await Data.col('sv2_alm_equip').update(e.id, { naoAchado: '', hist: (e.hist || []).concat([{ ts: nowISO(), porId: S.user.id, porNome: S.user.nome, tipo: 'inventario', data: hojeISO(), texto: 'Encontrado na ' + inv.numero }]), atualizadoEm: nowISO() }); res.ajustes.push(eqNomeC(e) + ': encontrado de novo'); } }
    await Data.col('sv2_alm_inv').update(inv.id, { situacao: 'concluido', concluidoEm: nowISO(), concluidoPor: S.user.nome, resumo: res });
    Audit.log({ acao: 'inventario_concluir', entidade: 'almox_inv', entidadeId: inv.id, resumo: 'Concluiu a ' + inv.numero + ': ' + res.contados + ' de ' + res.total + ' contados, ' + res.difs + ' diferença(s), ' + res.erros + ' erro(s) de lançamento' + (res.ajustes.length ? ' · ' + res.ajustes.join('; ') : ''), depois: res });
    S.cgVista = ''; aviso(inv.numero + ' concluída.' + (res.erros ? ' ' + res.erros + ' erro(s) de lançamento registrado(s).' : ''));
  } catch (e) { console.error(e); aviso(svErro(e), 'erro'); }
  S._cgConc = false;
}

/* ---------- abrir, cancelar, resumo, folha ---------- */
LC_FORM.cgnova = f => {
  const pes = cgPessoas(), al = cgAlvos({ partes: f.partes });
  const conta = { mat: alAtivos().length, equip: S.almEq.filter(e => e.situacao !== 'baixa' && !e.transito && e.tipo !== 'qtd').length, vid: S.almEq.filter(e => e.situacao !== 'baixa' && !e.transito && e.tipo === 'qtd').length };
  return { ico: 'lista', sub: cgNumero() + ' · contagem às cegas', titulo: 'Nova contagem', corpo: lcMsg() +
    lcAv('Quem conta não vê o sistema. Tudo vem na ordem do lugar: portas em sequência, depois gavetas, depois o resto.') +
    '<p class="gv-h">O que contar</p><div class="fm-pkl">' + CG_PARTES.map(x => { const on = x[0] === 'mat' ? f.partes.mat !== false : !!f.partes[x[0]]; return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="cg-parte" data-id="' + x[0] + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + x[1] + '</b><small>' + x[2] + '</small></span><span class="num">' + conta[x[0]] + '</span></button>'; }).join('') + '</div>' +
    gvNums([[String(al.length), 'itens para contar'], [String(Array.from(new Set(al.map(a => a.local))).length), 'lugares']]) +
    lcBl('Quem vai contar', ddHTML('lc:cgcont', f.contadorId || '', [['', 'Escolha a pessoa']].concat(pes.map(u => [u.id, u.nome + (u.id === S.user.id ? ' (você)' : '')]))), 'só aparece quem tem o Almoxarifado') +
    lcBl('Local', ddHTML('lc:cglocal', f.local, cgLocais().map(l => [l, l]))),
    rodape: lcPe('cg-nova-ok', 'Abrir contagem') };
};
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; if (f && (k === 'cgcont' || k === 'cglocal')) { f.sujo = true; f[k === 'cgcont' ? 'contadorId' : 'local'] = v; f.msg = ''; gvDesenha(true); return; } ant(k, v); }; })(DD_AO.lc);
async function cgNovaOk() {
  const f = S.fm; if (!f || !alSup()) return;
  if (cgAberta()) return lcErro('Já existe uma contagem em andamento.');
  const u = userById(f.contadorId); if (!u) return lcErro('Escolha quem vai contar.');
  const p = { mat: f.partes.mat !== false, equip: !!f.partes.equip, vid: !!f.partes.vid };
  if (!p.mat && !p.equip && !p.vid) return lcErro('Marque o que vai ser contado.');
  const n = cgAlvos({ partes: p }).length; if (!n) return lcErro('Nada para contar no que foi marcado.');
  if (!lcTravar()) return;
  const o = { numero: cgNumero(), tipo: 'contagem', local: f.local, partes: p, tipo2: p.equip || p.vid ? 'inventario' : 'contagem', situacao: 'aberto', contagens: {}, recontar: {}, resolucoes: {}, abertoEm: nowISO(), porId: S.user.id, porNome: S.user.nome, contadorId: u.id, contadorNome: u.nome, origem: APP_NOME };
  try {
    const id = await Data.col('sv2_alm_inv').add(o);
    Audit.log({ acao: 'inventario_abrir', entidade: 'almox_inv', entidadeId: id, resumo: 'Abriu a contagem ' + o.numero + ' (' + o.local + ': ' + cgPartesTxt(p) + ') · quem conta: ' + u.nome });
    if (u.id !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Contagem para você: ' + o.numero, texto: S.user.nome + ' abriu a contagem ' + o.numero + ' e escolheu você para contar (' + n + ' itens: ' + cgPartesTxt(p) + ', às cegas). Abra Almoxarifado › Materiais › Contagem.', para: [u.id], refTipo: 'inventario', refId: id }).catch(() => {});
    lcFim(); aviso(o.numero + ' aberta. ' + (u.id === S.user.id ? 'Pode começar a contar.' : u.nome + ' foi avisado(a) no sino.'));
  } catch (e) { lcErro(svErro(e)); }
}
LC_FORM.cgcanc = f => { const inv = cgAberta(); if (!inv) return null; return { ico: 'lixo', icoCls: 'ini-cr', sub: 'Cancelar contagem', titulo: inv.numero, corpo: lcMsg() + lcAv('Nada do que foi contado vira lançamento. A contagem fica no histórico como cancelada, com o motivo.') + lcBl('Motivo', lcTx('motivoG', f.motivoG)), rodape: lcPe('cg-canc-ok', 'Cancelar contagem') }; };
async function cgCancOk() {
  const f = S.fm, inv = cgAberta(); if (!inv || !alSup()) return; const m = String(f.motivoG || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  try { await Data.col('sv2_alm_inv').update(inv.id, { situacao: 'cancelado', canceladoEm: nowISO(), canceladoPor: S.user.nome, canceladoMotivo: m }); Audit.log({ acao: 'inventario_cancelar', entidade: 'almox_inv', entidadeId: inv.id, resumo: 'Cancelou a ' + inv.numero + ' — ' + m }); lcFim(); aviso(inv.numero + ' cancelada.'); }
  catch (e) { lcErro(svErro(e)); }
}
function cgAbreResumo(id) {
  S._alSel = id; gvAbrir(() => {
    const x = cgDe(id); if (!x) return null; const r = x.resumo || {};
    const erros = S.almMov.filter(m => m.retroativa && m.retroativa.invId === id && !m.anulada);
    return { ico: 'lista', sub: (x.tipo === 'contagem' ? 'Contagem' : 'Inventário') + ' · ' + (x.local || ''), titulo: x.numero, pill: alPill(x.situacao === 'concluido' ? 'Concluída' : 'Cancelada', x.situacao === 'concluido' ? 'ok' : ''),
      corpo: (x.situacao === 'concluido' ? gvNums([[(r.contados || 0) + '/' + (r.total || 0), 'contados'], [String(r.difs || 0), 'diferenças', r.difs ? 'wa' : ''], [String(r.erros || 0), 'erros de lançamento', r.erros ? 'cr' : '']]) : '') +
        gvCampos([['Aberta', (x.porNome || '') + ' · ' + fmtDT(x.abertoEm)], ['Quem contou', x.contadorNome], ['Bateram na recontagem', r.bateramNaRecontagem ? String(r.bateramNaRecontagem) : ''], ['Concluída', x.concluidoEm ? (x.concluidoPor || '') + ' · ' + fmtDT(x.concluidoEm) : ''], ['Cancelada', x.situacao === 'cancelado' ? (x.canceladoPor || '') + ' — ' + (x.canceladoMotivo || '') : '']]) +
        ((r.ajustes || []).length ? '<p class="gv-h">O que foi lançado</p>' + gvLinha(r.ajustes.map(t => [t, ''])) : '') +
        (erros.length ? '<p class="gv-h">Erros de lançamento</p>' + gvLinha(erros.map(m => [alQ(m.qtd) + ' ' + m.itemNome + ' · saída de ' + fmtD(m.data), ((m.erro || {}).responsavelNome || 'responsável não informado') + ((m.erro || {}).reclamacao ? ' · "' + m.erro.reclamacao + '"' : '')])) : '') };
  });
  render();
}
function cgFolha() {
  const inv = cgAberta(); if (!inv) return; const al = cgAlvos(inv), e = S.empresa || {};
  let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  const locais = Array.from(new Set(al.map(a => a.local)));
  p.innerHTML = '<div class="imp-cab"><b>Folha de contagem · ' + esc(inv.numero) + '</b><span>' + esc(e.nome || '') + ' · ' + esc(inv.local || '') + ' · ' + al.length + ' materiais</span></div>' +
    '<p style="margin:0 0 6pt">Contagem às cegas: a folha não traz o saldo do sistema. Contado por: ______________________ · Data: ___/___/______</p>' +
    '<table><thead><tr><th>Lugar</th><th>Material</th><th>Código</th><th>Lote</th><th>Validade</th><th>Un</th><th>Contado</th></tr></thead><tbody>' +
    locais.map(l => al.filter(a => a.local === l).map(a => (a.lotes.length ? a.lotes : [{ lote: '', validade: '' }]).map((t, n) => '<tr><td>' + (n ? '' : esc(l)) + '</td><td>' + (n ? '' : esc(a.i.nome)) + '</td><td>' + (n ? '' : esc(a.i.codigo || '')) + '</td><td>' + esc(t.lote || (a.lotes.length ? 'sem lote' : '')) + '</td><td>' + (t.validade ? fmtD(t.validade) : '') + '</td><td>' + esc(a.i.un || '') + '</td><td style="width:60pt">' + (a.parte === 'equip' ? '□ achei  □ não' : '') + '</td></tr>').join('')).join('')).join('') + '</tbody></table><div class="imp-pe">' + APP_APELIDO + '</div>';
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
  Data.col('sv2_alm_inv').update(inv.id, { folhas: (inv.folhas || []).concat([{ ts: nowISO(), porId: S.user.id, porNome: S.user.nome }]) }).catch(() => {});
}

/* ---------- eventos ---------- */
DD_AO.cg = (k, v) => { if (k === 'vista') { S.cgVista = v; render(); } else if (k === 'local') { S.cgLocal = v; render(); } };
document.addEventListener('input', e => {
  const t = e.target; if (!t || !t.getAttribute) return;
  if (t.hasAttribute('data-cgbusca')) { S.cgBusca = t.value; clearTimeout(S._cgT); S._cgT = setTimeout(render, 180); return; }
  const k = t.getAttribute('data-cgk'); if (k) { (S.cgRasc[k] = S.cgRasc[k] || {})[t.getAttribute('data-cgl')] = t.value; }
});
document.addEventListener('keydown', e => {
  const t = e.target; if (e.key !== 'Enter' || !t || !t.getAttribute || !t.getAttribute('data-cgk')) return;
  e.preventDefault(); const k = t.getAttribute('data-cgk'), ins = $$('[data-cgk="' + k + '"]'), n = ins.indexOf(t);
  if (n < ins.length - 1) ins[n + 1].focus(); else cgSalvar(k);
});
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="cg-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), k = t.getAttribute('data-k');
  if (a === 'cg-salva') cgSalvar(k);
  else if (a === 'cg-achei') cgSalvar(k, t.getAttribute('data-v') === '1');
  else if (a === 'cg-parte') { const f = S.fm; if (!f) return; const id = t.getAttribute('data-id'); f.partes[id] = id === 'mat' ? f.partes.mat === false : !f.partes[id]; f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'cg-edit') { S.cgEdit = k; render(); setTimeout(() => { const i = $('[data-cgk="' + k + '"]'); if (i) i.focus(); }, 30); }
  else if (a === 'cg-nova') { if (cgPodeAbrir()) lcAbrir({ k: 'cgnova', partes: S._cgDeEq ? { mat: false, equip: true, vid: true } : { mat: true, equip: false, vid: false }, contadorId: '', local: Store.get('cw-unidade') && cgLocais().indexOf(Store.get('cw-unidade')) >= 0 ? Store.get('cw-unidade') : cgLocais()[0] }); }
  else if (a === 'cg-nova-ok') cgNovaOk();
  else if (a === 'cg-cancelar') { if (alSup()) lcAbrir({ k: 'cgcanc', motivoG: '' }); }
  else if (a === 'cg-canc-ok') cgCancOk();
  else if (a === 'cg-recontar') cgPedirRecontagem();
  else if (a === 'cg-recontar1') { const inv = cgAberta(); if (inv && alSup()) Data.col('sv2_alm_inv').update(inv.id, { ['recontar.' + cgChave(k)]: true }).then(() => { aviso('Recontagem pedida.'); if (inv.contadorId && inv.contadorId !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Recontar 1 material · ' + inv.numero, texto: S.user.nome + ' pediu para contar de novo: ' + ((alItem(k.slice(2)) || {}).nome || '') + '.', para: [inv.contadorId], refTipo: 'inventario', refId: inv.id }).catch(() => {}); }).catch(er => aviso(svErro(er), 'erro')); }
  else if (a === 'cg-decidir') { const inv = cgAberta(), rs = inv && (inv.resolucoes || {})[cgChave(k)], vol = S.gv; lcAbrir(Object.assign({ k: 'cgres', kItem: k, tipo: '', data: hojeISO(), respId: '', motivo: '', motivoTxt: '', guardar: '0', reclamacao: '', obs: '' }, rs ? { tipo: rs.tipo, data: rs.data || hojeISO(), respId: rs.respId || '', motivo: rs.motivo || '', reclamacao: rs.reclamacao || '', obs: rs.obs || '' } : {}), vol ? () => gvAbrir(vol) : null); }
  else if (a === 'cg-res-ok') cgResOk();
  else if (a === 'cg-concluir') cgConcluir();
  else if (a === 'cg-ver-conf') { S.cgVista = 'conf'; render(); }
  else if (a === 'cg-folha') cgFolha();
});

/* quem chega pelo botão Inventário de Equipamentos já começa com equipamentos e vidrarias marcados */
document.addEventListener('click', e => { const l = e.target.closest && e.target.closest('a[href="#/almox/contagem"]'); if (l) S._cgDeEq = l.hasAttribute('data-inv'); }, true);
const cgSoMat = inv => { const p = (inv && inv.partes) || { mat: true }; return !p.equip && !p.vid; };
/* inventário sem materiais (aberto pelo botão Inventário de Equipamentos) */
const cgDoEq = () => { const inv = cgAberta(); if (inv) { const p = inv.partes || { mat: true }; return p.mat === false && !!(p.equip || p.vid); } return !!S._cgDeEq; };
