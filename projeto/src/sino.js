/* EFCwork · sino.js — o SINO do topo (v0.3). Abre na gaveta: pedidos para você decidir (os do Almoxarifado decidem aqui; os das
   outras áreas, no EFClaudian até elas serem refeitas), seus pedidos esperando e os avisos (os mesmos do sino do EFClaudian:
   sv2_notifs, lidos por pessoa). O número no sino = avisos não lidos + pedidos para decidir. Prefixo: sn. */
S.snRep = null; /* id do pedido que está sendo reprovado (mostra o campo do motivo) */
const snRen = () => typeof ppRenovaveis === 'function' ? ppRenovaveis() : [];
const snConta = () => S.user ? Notif.unread().length + Aprov.pendentesParaMim().length + snRen().length : 0;
const snAberto = () => S.gv === snGaveta;
function snAtualiza() {
  const b = $('#sn-n'), n = snConta();
  if (b) { b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n); }
  if (snAberto()) { const a = document.activeElement; if (!(a && a.closest && a.closest('#gv') && /INPUT|TEXTAREA/.test(a.tagName))) gvDesenha(true); }
  if (S.rota.area === 'inicio' && !S.gv) render();
  snToastNovos();
}
/* confirmação rápida (v0.4.1, pedido de 06/11 17:54): pedido novo para você aparece num aviso no canto, com Confirmar ali mesmo.
   Os que já esperavam quando o app abriu não pulam (estão no sino). Recusar abre o sino, que pede o motivo. */
S._snVistos = null;
function snToastNovos() {
  if (!S.user) return; const pend = Aprov.pendentesParaMim();
  if (!S._snVistos) { S._snVistos = {}; pend.forEach(a => { S._snVistos[a.id] = 1; }); return; }
  const novos = pend.filter(a => !S._snVistos[a.id]); novos.forEach(a => { S._snVistos[a.id] = 1; });
  const ab = $('#sn-toast'); if (ab && !pend.some(a => a.id === ab.getAttribute('data-id'))) ab.remove();
  if (!novos.length || snAberto()) return; const a = novos[novos.length - 1], aqui = !!APROV_APLICA[a.tipo];
  let d = $('#sn-toast'); if (!d) { d = document.createElement('div'); d.id = 'sn-toast'; d.className = 'sn-toast'; d.setAttribute('role', 'alert'); document.body.appendChild(d); }
  d.setAttribute('data-id', a.id);
  d.innerHTML = '<div class="sn-tc">' + ic('sino') + '<span><small>Pedido para você confirmar' + (novos.length > 1 ? ' · +' + (novos.length - 1) + ' no sino' : '') + '</small><b>' + esc(a.titulo) + '</b>' + (a.descricao ? '<em>' + esc(a.descricao) + '</em>' : '') + '<small>' + esc(a.solicitanteNome || '') + ' · ' + fmtDT(a.ts) + '</small></span><button type="button" class="bt ic-so" data-act="sn-tx" aria-label="Fechar">' + ic('x') + '</button></div>' +
    '<div class="sn-bts"><button type="button" class="bt" data-act="sn-ver">Ver no sino</button>' + (aqui ? '<button type="button" class="bt pr" data-act="sn-apr" data-id="' + esc(a.id) + '">' + ic('ok') + 'Confirmar</button>' : '') + '</div>';
}
const snNivel = { critico: ['Crítico', 'cr'], aviso: ['Aviso', 'wa'], info: ['', ''] };
function snGaveta() {
  if (!S.user) return null;
  const pend = Aprov.pendentesParaMim().slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts))), meus = Aprov.meusPendentes(), ns = Notif.mine().slice(0, 40), nl = Notif.unread().length;
  let c = '';
  if (pend.length) c += '<p class="gv-h">Para você decidir · ' + pend.length + '</p>' + pend.map(a => {
    const aqui = !!APROV_APLICA[a.tipo];
    return '<div class="sn-pd"><b>' + esc(a.titulo) + '</b>' + (a.descricao ? '<span>' + esc(a.descricao) + '</span>' : '') + '<small>Pedido por ' + esc(a.solicitanteNome || '') + ' · ' + fmtDT(a.ts) + '</small>' +
      (S.snRep === a.id ? '<div class="fm-c"><span class="fm-r">Por que recusa?</span><textarea class="fm-i" id="sn-mot" rows="2"></textarea></div><div class="sn-bts"><button type="button" class="bt" data-act="sn-rep-x">Voltar</button><button type="button" class="bt pr" data-act="sn-rep-ok" data-id="' + esc(a.id) + '">Recusar</button></div>'
        : aqui ? '<div class="sn-bts"><button type="button" class="bt" data-act="sn-rep" data-id="' + esc(a.id) + '">Recusar</button><button type="button" class="bt pr" data-act="sn-apr" data-id="' + esc(a.id) + '">' + ic('ok') + 'Confirmar</button></div>'
        : '<div class="sn-bts"><a class="bt" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">' + ic('externo') + 'Decidir no EFClaudian</a></div>') + '</div>';
  }).join('');
  const ren = snRen(); /* v0.4.7: no fim do ano, sugere renovar os planos de coleta */
  if (ren.length) c += '<p class="gv-h">Sugestões · ' + ren.length + '</p>' + ren.map(r => '<div class="sn-pd"><b>Renovar ' + esc(r.nome || r.tipo) + ' para ' + (Number(r.ano) + 1) + '?</b><span>Cria o plano de ' + (Number(r.ano) + 1) + ' igual a este: ' + (r.areas || []).length + ' áreas, as mesmas análises e a mesma frequência. O de ' + esc(String(r.ano)) + ' continua até o fim.</span><div class="sn-bts"><button type="button" class="bt" data-act="sn-ren-nao" data-id="' + esc(r.id) + '">Agora não</button><button type="button" class="bt pr" data-act="sn-ren" data-id="' + esc(r.id) + '">' + ic('recontar') + 'Renovar</button></div></div>').join('');
  if (meus.length) c += '<p class="gv-h">Seus pedidos esperando</p>' + gvLinha(meus.map(a => [a.titulo, 'aguardando ' + ((a.paraNomes || []).join(', ') || 'o superior') + ' · ' + fmtDT(a.ts)]));
  c += '<p class="gv-h">Avisos' + (nl ? ' · ' + nl + ' não lido(s)' : '') + '</p>' + (ns.length ? '<div class="sn-l">' + ns.map(n => {
    const lido = Notif.isRead(n), nv = snNivel[n.nivel] || snNivel.info, conf = n.nivel === 'critico' && !Notif.isConfirmed(n);
    return '<div class="sn-n' + (lido ? '' : ' nl') + '"><button type="button" class="sn-nb" data-act="sn-abre" data-id="' + esc(n.id) + '"><i aria-hidden="true"></i><span><b>' + esc(n.titulo) + '</b>' + (n.texto ? '<span>' + esc(n.texto) + '</span>' : '') + '<small>' + fmtDT(n.ts) + (n.origem ? ' · ' + esc(n.origem) : '') + (nv[0] ? ' · ' + nv[0] : '') + '</small></span></button>' +
      (conf ? '<button type="button" class="bt" data-act="sn-conf" data-id="' + esc(n.id) + '">Confirmar ciência</button>' : '') + '</div>';
  }).join('') + '</div>' : '<div class="vazio">' + ic('sino') + '<span>Nenhum aviso por enquanto.</span></div>');
  return { ico: 'sino', sub: (pend.length ? pend.length + ' para decidir · ' : '') + (nl ? nl + ' não lido(s)' : 'tudo lido'), titulo: 'Avisos', corpo: c,
    rodape: nl ? '<button type="button" class="bt" data-act="sn-todas">' + ic('ok') + 'Marcar todas como lidas</button>' : '' };
}
function snAbrir() { S.snRep = null; gvAbrir(snGaveta, true); }
document.addEventListener('click', async e => {
  const t = e.target.closest && e.target.closest('[data-act^="sn-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'sn-ren') { t.disabled = true; await ppRenova(id); snAtualiza(); if (snAberto()) gvDesenha(true); return; }
  if (a === 'sn-ren-nao') { ppRenovaNao(id); snAtualiza(); if (snAberto()) gvDesenha(true); return; }
  if (a === 'sn-todas') { Notif.readAll(); aviso('Avisos marcados como lidos.'); }
  else if (a === 'sn-conf') Notif.confirm(id);
  else if (a === 'sn-rep') { S.snRep = id; gvDesenha(true); const m = $('#sn-mot'); if (m) m.focus(); }
  else if (a === 'sn-rep-x') { S.snRep = null; gvDesenha(true); }
  else if (a === 'sn-rep-ok') { const m = String(($('#sn-mot') || {}).value || '').trim(); if (m.length < 3) { aviso('Escreva o motivo da recusa.', 'erro'); return; } t.disabled = true; if (await Aprov.decidir(id, false, m)) S.snRep = null; gvDesenha(true); }
  else if (a === 'sn-apr') { t.disabled = true; const ok = await Aprov.decidir(id, true); const x = $('#sn-toast'); if (x && x.getAttribute('data-id') === id) x.remove(); if (ok) aviso('Confirmado.'); if (snAberto()) gvDesenha(true); }
  else if (a === 'sn-tx') { const x = $('#sn-toast'); if (x) x.remove(); }
  else if (a === 'sn-ver') { const x = $('#sn-toast'); if (x) x.remove(); snAbrir(); }
  else if (a === 'sn-abre') {
    const n = S.notifs.find(x => x.id === id); if (!n) return; Notif.read(n.id);
    if (n.refTipo === 'alm_mov' && n.refId && alVe() && S.almMov.some(m => m.id === n.refId)) { S._gvNav = true; ir('almox', 'movimentacoes'); alAbreMov(n.refId); }
  }
});
