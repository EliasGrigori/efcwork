/* EFCwork · sino.js — o SINO do topo (v0.3). Abre na gaveta: pedidos para você decidir (os do Almoxarifado decidem aqui; os das
   outras áreas, no EFClaudian até elas serem refeitas), seus pedidos esperando e os avisos (os mesmos do sino do EFClaudian:
   sv2_notifs, lidos por pessoa). O número no sino = avisos não lidos + pedidos para decidir. Prefixo: sn. */
S.snRep = null; /* id do pedido que está sendo reprovado (mostra o campo do motivo) */
const snConta = () => S.user ? Notif.unread().length + Aprov.pendentesParaMim().length : 0;
const snAberto = () => S.gv === snGaveta;
function snAtualiza() {
  const b = $('#sn-n'), n = snConta();
  if (b) { b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n); }
  if (snAberto()) { const a = document.activeElement; if (!(a && a.closest && a.closest('#gv') && /INPUT|TEXTAREA/.test(a.tagName))) gvDesenha(true); }
  if (S.rota.area === 'inicio' && !S.gv) render();
}
const snNivel = { critico: ['Crítico', 'cr'], aviso: ['Aviso', 'wa'], info: ['', ''] };
function snGaveta() {
  if (!S.user) return null;
  const pend = Aprov.pendentesParaMim().slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts))), meus = Aprov.meusPendentes(), ns = Notif.mine().slice(0, 40), nl = Notif.unread().length;
  let c = '';
  if (pend.length) c += '<p class="gv-h">Para você decidir · ' + pend.length + '</p>' + pend.map(a => {
    const aqui = !!APROV_APLICA[a.tipo];
    return '<div class="sn-pd"><b>' + esc(a.titulo) + '</b>' + (a.descricao ? '<span>' + esc(a.descricao) + '</span>' : '') + '<small>Pedido por ' + esc(a.solicitanteNome || '') + ' · ' + fmtDT(a.ts) + '</small>' +
      (S.snRep === a.id ? '<div class="fm-c"><span class="fm-r">Motivo da reprovação</span><textarea class="fm-i" id="sn-mot" rows="2"></textarea></div><div class="sn-bts"><button type="button" class="bt" data-act="sn-rep-x">Voltar</button><button type="button" class="bt pr" data-act="sn-rep-ok" data-id="' + esc(a.id) + '">Reprovar</button></div>'
        : aqui ? '<div class="sn-bts"><button type="button" class="bt" data-act="sn-rep" data-id="' + esc(a.id) + '">Reprovar</button><button type="button" class="bt pr" data-act="sn-apr" data-id="' + esc(a.id) + '">' + ic('ok') + 'Aprovar</button></div>'
        : '<div class="sn-bts"><a class="bt" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">' + ic('externo') + 'Decidir no EFClaudian</a></div>') + '</div>';
  }).join('');
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
  if (a === 'sn-todas') { Notif.readAll(); aviso('Avisos marcados como lidos.'); }
  else if (a === 'sn-conf') Notif.confirm(id);
  else if (a === 'sn-rep') { S.snRep = id; gvDesenha(true); const m = $('#sn-mot'); if (m) m.focus(); }
  else if (a === 'sn-rep-x') { S.snRep = null; gvDesenha(true); }
  else if (a === 'sn-rep-ok') { const m = String(($('#sn-mot') || {}).value || '').trim(); if (m.length < 3) { aviso('Escreva o motivo da reprovação.', 'erro'); return; } t.disabled = true; if (await Aprov.decidir(id, false, m)) S.snRep = null; gvDesenha(true); }
  else if (a === 'sn-apr') { t.disabled = true; await Aprov.decidir(id, true); gvDesenha(true); }
  else if (a === 'sn-abre') {
    const n = S.notifs.find(x => x.id === id); if (!n) return; Notif.read(n.id);
    if (n.refTipo === 'alm_mov' && n.refId && alVe() && S.almMov.some(m => m.id === n.refId)) { S._gvNav = true; ir('almox', 'movimentacoes'); alAbreMov(n.refId); }
  }
});
