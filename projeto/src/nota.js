/* EFCwork · nota.js — NOTINHA para imprimir (v0.4.1, pedido de 06/11 17:54; modelo: a requisição do Sankhya em docs/referencias).
   Genérica: solicitações do almoxarifado agora; transferências e solicitações de compra usam a mesma quando essas telas chegarem.
   Cabeçalho com a empresa da configuração (nada fixo) e o número; campos; itens (código, descrição, lote, unidade, quantidade,
   valor unitário e total); total; observação; assinaturas; "impresso em". Estilo cupom: 80 mm de largura, comprimento conforme os itens. Prefixo: nt. */
function ntHTML(o) {
  /* estilo cupom (pedido de 06/11 18:04): faixa estreita de 80 mm que vai encompridando com os itens */
  const e = S.empresa || {}, emp = [e.nome, o.unidade || Store.get('cw-unidade') || ''].filter(Boolean).join(' · ') || 'Empresa';
  const its = o.itens || [], tq = its.reduce((s, x) => s + (Number(x.qtd) || 0), 0), tv = its.reduce((s, x) => s + (Number(x.qtd) || 0) * (Number(x.vu) || 0), 0), temV = its.some(x => Number(x.vu) > 0);
  const q = n => numBR(Number(n) || 0, 2);
  return '<div class="nt"><div class="nt-cab"><b>' + esc(emp) + '</b><b class="nt-num">' + esc(o.sigla || 'Nº') + ' ' + esc(o.numero || '') + '</b></div>' +
    '<dl class="nt-kv">' + [['Data', o.data ? fmtD(o.data) : ''], ['Operação', o.operacao]].concat(o.campos || []).filter(x => x[1]).map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>' +
    '<div class="nt-it">' + its.map(x => '<div class="nt-l"><b>' + (x.codigo ? esc(x.codigo) + ' ' : '') + esc(x.nome || '') + '</b><div><span>' + [x.lote ? 'lote ' + esc(x.lote) : '', esc(x.un || '')].filter(Boolean).join(' · ') + '</span><span>' + q(x.qtd) + (temV && Number(x.vu) ? ' × ' + q(x.vu) + ' = <b>' + q((Number(x.qtd) || 0) * Number(x.vu)) + '</b>' : '') + '</span></div></div>').join('') + '</div>' +
    '<div class="nt-tot"><span>Itens: ' + its.length + '</span><span>Qtd ' + q(tq) + (temV ? ' · <b>R$ ' + q(tv) + '</b>' : '') + '</span></div>' +
    (o.obs ? '<div class="nt-obs"><small>Observação</small><p>' + esc(o.obs) + '</p></div>' : '') +
    '<div class="nt-ass">' + (o.assin || []).map(a => '<div><i></i><span>' + esc(a[0]) + (a[1] ? ': ' + esc(a[1]) : '') + '</span></div>').join('') + '</div>' +
    '<p class="nt-pe">Impresso em ' + fmtDT(nowISO()) + '<br>' + esc(S.user ? S.user.nome : '') + ' · ' + esc(APP_APELIDO) + '</p></div>';
}
function ntImprimir(o, audit) {
  let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = ntHTML(o);
  /* mede a altura do cupom para a página ter o comprimento exato (80 mm de largura) */
  const m = document.createElement('div'); m.className = 'nt-medir'; m.innerHTML = p.innerHTML; document.body.appendChild(m);
  const mm = Math.ceil(m.querySelector('.nt').getBoundingClientRect().height * 25.4 / 96) + 8; m.remove();
  let pg = $('#nt-page'); if (!pg) { pg = document.createElement('style'); pg.id = 'nt-page'; document.head.appendChild(pg); }
  pg.textContent = '@media print{@page{size:80mm ' + Math.max(80, mm) + 'mm;margin:3mm}}';
  if (audit) Audit.log(audit);
  document.body.classList.add('imprimindo');
  setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); const x = $('#nt-page'); if (x) x.remove(); }, 50);
}
/* solicitação do almoxarifado (abastecimento) */
function ntSol(id) {
  const x = S.almSol.find(y => y.id === id); if (!x) return;
  ntImprimir({ sigla: 'Nº', numero: x.numero, data: x.data, operacao: 'Solicitação de material ao almoxarifado',
    campos: [['Previsão', x.previsao ? fmtD(x.previsao) : ''], ['Liberador', x.liberador], ['Situação', (AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente)[0]]],
    itens: (x.linhas || []).map(l => { const i = l.itemId ? alItem(l.itemId) : null; return { codigo: i ? i.codigo : '', nome: l.nome, un: (i && i.un) || l.un || '', qtd: l.qtd, vu: Number(l.preco) || (i ? Number(i.preco) || 0 : 0) }; }),
    obs: x.obs, assin: [['Atendente', x.atendidaPor || ''], ['Solicitante', x.solicitante || '']] },
    { acao: 'imprimir', entidade: 'almox_sol', entidadeId: id, resumo: 'Notinha da solicitação ' + x.numero });
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="nt-sol"]'); if (t) ntSol(t.getAttribute('data-id')); });
