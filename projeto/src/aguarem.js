/* EFCwork · aguarem.js — remessa de água (v0.6.46; parte 2 das decisões do Elias de 27/11 17:22: "o kit também nas coletas de
   água, eles também são enviados"). Prefixo: ar.
   - As coletas de água (sv2_aguacol) guardam envio e lab em cada coleta, sem remessa própria. Remessa de água = coletas de água
     enviadas no mesmo dia para o mesmo laboratório (como a remessa do campo), com a chave 'agua:<envio>|<laboratório>'.
     Nada novo é gravado na coleta: a remessa é só uma forma de juntar.
   - A gaveta da remessa tem o ícone dos papéis (o MESMO kit do laboratório, kit.js) e os Documentos da remessa (remdocs.js).
   - Dados de cada amostra para o Vértice: data, hora, ponto (identificação), análise, coletor, O.S, observação, material Água
     (X em grupo.xagua). Código do frasco, matriz, nº de frascos, preservação e medidas de campo o Elias escreve à mão
     ("Escrever nesta folha"). */
const AR_PRE = 'agua:';
const remAgua = k => String(k || '').indexOf(AR_PRE) === 0;
const remEnvio = k => String(k || '').split('|')[0].replace(/^agua:/, '');
const arLoteK = c => c && c.envio && c.situacao !== 'cancelada' ? AR_PRE + c.envio + '|' + (c.lab || '') : '';
const arColetas = k => (typeof agAtivas === 'function' ? agAtivas() : []).filter(c => arLoteK(c) === k);
/* a coleta de água no formato que o kit e a ponte leem (como uma amostra do campo) */
const arAmostra = c => ({ id: c.id, _agua: true, tipo: 'AGUA', data: c.data, hora: c.hora, analiseNome: c.analiseNome, identificacao: c.pontoNome, pontoNome: c.pontoNome, coletor: c.coletor, os: c.os, obs: c.obs, qtd: c.qtd, lab: c.lab, envio: c.envio });
/* o lote de uma remessa (campo ou água) e o nome de cada amostra */
const remLote = k => remAgua(k) ? arColetas(k).map(arAmostra) : coLote(k);
const remNomeAm = c => c && c._agua ? c.pontoNome || '' : coNome(c);

/* a gaveta da remessa de água */
function arAbreLote(k) {
  S._agSel = ''; /* sem linha marcada na tabela: as setas de anterior/próximo (que andam pelas coletas) não aparecem na remessa */
  gvAbrir(() => {
    const l = arColetas(k); if (!l.length) return null;
    const c0 = l[0], res = l.filter(c => c.resultado !== 'PENDENTE').length, at = l.filter(agLaudoAtrasado).length, pode = agPode();
    const os = Array.from(new Set(l.map(c => c.os).filter(Boolean)));
    return { ico: 'caixa', cabAcoes: pode ? ktPapBt(k) : '', sub: 'Remessa de água · ' + fmtD(c0.envio), titulo: c0.lab || 'Sem laboratório',
      pill: alPill(res === l.length ? 'Resultados registrados' : at ? at + ' laudo(s) atrasado(s)' : 'Aguardando laudos', res === l.length ? 'ok' : at ? 'cr' : ''),
      corpo: gvNums([[String(l.length), l.length === 1 ? 'coleta' : 'coletas'], [res + '/' + l.length, 'resultados'], [res === l.length ? '—' : fmtD(addDias(c0.envio, agCfg().laudoDias)), 'laudo previsto', at ? 'cr' : '']]) +
        gvCampos([['O.S', os.join(', ') || 'ainda não informada']]) + (typeof drSecao === 'function' ? drSecao(k) : ktRemessaHTML(k)) +
        '<p class="gv-h">Coletas</p><div class="gv-lotes">' + l.slice().sort((a, b) => cmpTxt(a.pontoNome, b.pontoNome) || cmpTxt(a.analiseNome, b.analiseNome)).map(c => {
          const s = c.resultado === 'PENDENTE' ? (agLaudoAtrasado(c) ? ['Laudo atrasado', 'cr'] : ['Pendente', 'wa']) : c.resultado === 'CONFORME' ? ['Conforme', 'ok'] : ['Não conforme', 'cr'];
          return '<button type="button" class="gv-lote co-am" data-act="ag-abre" data-id="' + esc(c.id) + '"><span><b>' + esc(c.pontoNome || '') + '</b> ' + esc([c.analiseNome, c.data ? fmtD(c.data).slice(0, 5) : '', c.hora].filter(Boolean).join(' · ')) + '</span>' + alPill(s[0], s[1]) + '</button>'; }).join('') + '</div>' };
  });
  render();
}
/* no detalhe da coleta: o botão que leva à remessa dela */
function arBotaoRemessa(c) {
  const k = arLoteK(c); if (!k) return ''; const n = arColetas(k).length;
  return '<button type="button" class="bt lk co-vl" data-act="ar-lote" data-k="' + esc(k) + '">' + ic('caixa') + 'Ver a remessa (' + n + (n === 1 ? ' coleta)' : ' coletas)') + '</button>';
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="ar-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'ar-lote') arAbreLote(t.getAttribute('data-k'));
});
