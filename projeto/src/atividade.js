/* EFCwork · atividade.js — Administração › Atividade (v0.4.14)
   Mostra o registro de tudo o que cada pessoa fez (sv2_audit, o mesmo dos dois apps), só para o Principal.
   Modelo aprovado em 09/11: linha do tempo por dia + gráfico de colunas dos últimos 30 dias + filtro único recolhível.
   A linha abre o detalhe no próprio lugar (sem gaveta). Só leitura: nada aqui grava no Firebase.
   Prefixo: at- */

const AT_LIM = 100;
S.atFiltro = { pessoa: '', area: '', app: '', dias: '30' };
S.atAberto = false; S.atLinha = null; S.atLimite = AT_LIM; S.audit = [];

CS_CARGAS.push(() => {
  if (!isPrincipal(S.user)) return;
  csOuve('sv2_audit', l => { S.audit = l || []; if (S.rota.area === 'adm' && S.rota.aba === 'atividade') render(); }, { order: 'ts', limit: 1000 });
});

/* ---------- como cada registro é mostrado ---------- */
const AT_ACOES = {
  criar_coleta: 'Criou coleta', envio_coleta: 'Envio', corrigir_os: 'Corrigiu O.S', programar_plano: 'Programou', desprogramar_plano: 'Desprogramou',
  criar_rodizio: 'Novo plano', alterar_rodizio: 'Alterou plano', encerrar_rodizio: 'Encerrou plano', recoleta_rodizio: 'Recoleta',
  criar_item_almox: 'Novo material', editar_item_almox: 'Editou material', reativar_item_almox: 'Reativou material', desativar_item_almox: 'Desativou material',
  entrada_almox: 'Entrada', saida_almox: 'Saída', ajuste_almox: 'Ajuste', anular_mov_almox: 'Anulou', corrigir_mov_almox: 'Corrigiu',
  abrir_frasco_almox: 'Abriu frasco', fim_frasco_almox: 'Frasco acabou', critico_confirmar: 'Confirmou saída crítica', critico_nao_confere: 'Saída crítica não confere',
  solicitacao_almox: 'Solicitação', cancelar_solicitacao_almox: 'Cancelou solicitação',
  calibracao_solicitacao: 'Solicitou calibração', calibracao_cotacao: 'Cotação', calibracao_agenda: 'Agendou calibração', calibracao_realizada: 'Calibração feita',
  calibracao_compra: 'Compra', calibracao_cancelar: 'Cancelou calibração', equip_calibracao: 'Calibrou equipamento', equip_inventario: 'Inventário do equipamento',
  inventario_abrir: 'Abriu inventário', inventario_recontar: 'Pediu recontagem', inventario_concluir: 'Concluiu inventário', inventario_cancelar: 'Cancelou inventário',
  pedir_autorizacao: 'Pediu autorização', confirmar_alerta: 'Confirmou aviso', imprimir: 'Imprimiu'
};
function atAcao(a) { a = String(a || ''); if (AT_ACOES[a]) return AT_ACOES[a]; const t = a.replace(/^equip_/, '').replace(/_/g, ' ').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Ação'; }
function atArea(r) {
  const e = String(r.entidade || '');
  if (/^almox|^lg_/.test(e)) return 'Almoxarifado';
  if (/^(coleta|rodizio|plano_coleta|prog|agua)/.test(e)) return 'Coletas';
  if (/^(rnc|nc|apont|analise|bug)/.test(e)) return 'Qualidade';
  if (/^(doc|lanc|caixa|cloro)/.test(e)) return 'Documentos';
  if (/^(aprov|notif)/.test(e)) return 'Avisos';
  return 'Outros';
}
const atApp = r => { const v = String(r.versao || '').trim().split(/\s+/)[0]; return v || 'EFClaudian'; };
const atPerfil = p => ({ principal: 'Administrador', principal_temp: 'Administrador', secundario: 'Líder', visitante: 'Visitante', colaborador: 'Colaborador' }[p] || (p || ''));
function atCor(a) {
  a = String(a || '');
  if (/critico|vencid/.test(a)) return 'cr';
  if (/cancel|desprog|anul|corrig|desativ|nao_confere|encerr/.test(a)) return 'wa';
  if (/concluir|conclu|realizada|confirmar|reativ/.test(a)) return 'ok';
  return '';
}
const atIni = n => String(n || '?').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const atDia = iso => { const d = new Date(iso); if (isNaN(d)) return ''; return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const atHora = iso => { const d = new Date(iso); return isNaN(d) ? '' : String(d.toTimeString()).slice(0, 5); };
function atDiaTxt(dia) { const h = hojeISO(); if (dia === h) return 'Hoje'; if (dia === addDias(h, -1)) return 'Ontem'; return fmtD(dia); }
const atId = (r, i) => String(r.id || ('i' + i));

/* ---------- filtro ---------- */
const AT_PERIODOS = [['7', 'Últimos 7 dias'], ['30', 'Últimos 30 dias'], ['90', 'Últimos 90 dias'], ['0', 'Todo o período']];
function atFiltrar(ignoraPeriodo) {
  const f = S.atFiltro, corte = !ignoraPeriodo && f.dias !== '0' ? addDias(hojeISO(), -(Number(f.dias) - 1)) : '';
  return (S.audit || []).filter(r => r.ts && (!f.pessoa || r.userName === f.pessoa) && (!f.area || atArea(r) === f.area) && (!f.app || atApp(r) === f.app) && (!corte || atDia(r.ts) >= corte));
}
const atTemFiltro = () => { const f = S.atFiltro; return !!(f.pessoa || f.area || f.app || f.dias !== '30'); };
function atResumo() {
  const f = S.atFiltro, p = [(AT_PERIODOS.find(x => x[0] === f.dias) || AT_PERIODOS[1])[1].toLowerCase()];
  if (f.pessoa) p.push(f.pessoa.split(' ')[0]); if (f.area) p.push(f.area); if (f.app) p.push(f.app);
  return p.length > 1 ? p.join(' · ') : p[0] + ' · todos';
}

/* ---------- gráfico de colunas (últimos 30 dias) ---------- */
function atGrafico() {
  const l = atFiltrar(true), hoje = hojeISO(), cont = {}; l.forEach(r => { const d = atDia(r.ts); cont[d] = (cont[d] || 0) + 1; });
  const dias = []; for (let i = 29; i >= 0; i--) dias.push(addDias(hoje, -i));
  const max = Math.max(1, ...dias.map(d => cont[d] || 0)), total = dias.reduce((s, d) => s + (cont[d] || 0), 0);
  const pico = dias.reduce((m, d) => (cont[d] || 0) >= (cont[m] || 0) ? d : m, dias[0]);
  return '<figure class="at-gr" aria-label="Registros por dia nos últimos 30 dias"><div class="at-cols" role="img" aria-label="Gráfico de colunas: registros por dia nos últimos 30 dias">' +
    dias.map((d, i) => { const n = cont[d] || 0; return '<i class="' + (i >= 23 ? 'rec' : '') + (n ? '' : ' vz') + '" style="height:' + (n ? Math.max(8, Math.round(n / max * 100)) : 4) + '%" title="' + esc(atDiaTxt(d) + ': ' + n + (n === 1 ? ' registro' : ' registros')) + '"></i>'; }).join('') + '</div>' +
    '<figcaption><span>30 dias atrás</span><span>' + (total ? 'mais movimento: ' + esc(atDiaTxt(pico)) + ' (' + cont[pico] + ')' : 'sem registros nestes 30 dias') + '</span><span>hoje</span></figcaption></figure>';
}

/* ---------- detalhe da linha (abre no próprio lugar) ---------- */
function atValor(v) {
  if (v == null || v === '') return '—'; if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (typeof v === 'number') return numBR(v); if (typeof v === 'object') return '';
  const s = String(v); if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return fmtDT(s); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return fmtD(s);
  return s.length > 90 ? s.slice(0, 90) + '…' : s;
}
function atMudou(r) {
  const a = r.antes && typeof r.antes === 'object' ? r.antes : {}, d = r.depois && typeof r.depois === 'object' ? r.depois : {};
  const ks = Array.from(new Set(Object.keys(a).concat(Object.keys(d)))).filter(k => !/^(id|criadoEm|criadoPor|marca|ts)$/.test(k) && atValor(a[k]) !== '' && atValor(d[k]) !== '' && atValor(a[k]) !== atValor(d[k])).slice(0, 14);
  if (!ks.length) return '';
  return '<p class="at-h">O que mudou</p><table class="at-dif"><thead><tr><th>Campo</th><th>Antes</th><th>Depois</th></tr></thead><tbody>' +
    ks.map(k => '<tr><td>' + esc(k) + '</td><td class="a">' + esc(atValor(a[k])) + '</td><td class="d">' + esc(atValor(d[k])) + '</td></tr>').join('') + '</tbody></table>';
}
function atDetalhe(r) {
  const l = [['Quem', (r.userName || '—') + (r.perfil ? ' · ' + atPerfil(r.perfil) : '')], ['Quando', fmtD(atDia(r.ts)) + ' às ' + atHora(r.ts)], ['App', r.versao || '—'], ['Onde', atArea(r) + (r.entidadeId ? ' · ' + r.entidadeId : '')],
    ['Autorizado por', r.autorizadoPor && (r.autorizadoPor.nome || r.autorizadoPor.por) || '']];
  return '<div class="at-det"><dl>' + l.filter(x => x[1]).map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>' + atMudou(r) + '</div>';
}

/* ---------- tela ---------- */
function atLinhas(l) {
  let h = '', dia = '', aberto = false;
  l.slice(0, S.atLimite).forEach((r, i) => {
    const d = atDia(r.ts), id = atId(r, i), ab = S.atLinha === id;
    if (d !== dia) { if (aberto) h += '</div>'; dia = d; aberto = true; h += '<div class="at-dia">' + esc(atDiaTxt(d)) + '</div><div class="at-tl">'; }
    h += '<div class="at-ev' + (ab ? ' ab' : '') + '"><button type="button" class="at-li" data-act="at-linha" data-id="' + esc(id) + '" aria-expanded="' + ab + '">' +
      '<span class="at-h">' + esc(atHora(r.ts)) + '</span><span class="at-ini" title="' + esc(r.userName || '') + '">' + esc(atIni(r.userName)) + '</span>' +
      '<span class="at-t"><b>' + esc((r.userName || '—').split(' ')[0]) + '</b> ' + esc(r.resumo || atAcao(r.acao)) + '<small>' + esc(atArea(r) + (r.entidadeId ? ' · ' + r.entidadeId : '') + ' · ' + atApp(r)) + '</small></span>' +
      '<span class="pill ' + atCor(r.acao) + '">' + esc(atAcao(r.acao)) + '</span>' + ic('seta', 'at-s') + '</button>' + (ab ? atDetalhe(r) : '') + '</div>';
  });
  if (aberto) h += '</div>';
  return h;
}
function atFiltroHTML() {
  const f = S.atFiltro, pessoas = Array.from(new Set((S.audit || []).map(r => r.userName).filter(Boolean))).sort(cmpTxt), areas = Array.from(new Set((S.audit || []).map(atArea))).sort(cmpTxt), apps = Array.from(new Set((S.audit || []).map(atApp))).sort(cmpTxt);
  const todos = t => [['', t]];
  return '<div class="at-fp"' + (S.atAberto ? '' : ' hidden') + '><label class="cp">Período' + ddHTML('at:dias', f.dias, AT_PERIODOS) + '</label>' +
    '<label class="cp">Pessoa' + ddHTML('at:pessoa', f.pessoa, todos('Todas').concat(pessoas.map(x => [x, x]))) + '</label>' +
    '<label class="cp">Área' + ddHTML('at:area', f.area, todos('Todas').concat(areas.map(x => [x, x]))) + '</label>' +
    '<label class="cp">App' + ddHTML('at:app', f.app, todos('Todos').concat(apps.map(x => [x, x]))) + '</label></div>';
}
function atTela() {
  if (!isPrincipal(S.user)) return ''; /* a tela some para quem não é Principal (roteador); aqui é só uma segunda trava */
  const l = atFiltrar(), tem = atTemFiltro();
  return '<div class="at">' + atGrafico() +
    '<div class="at-bar"><span class="tb-cont">' + l.length + (l.length === 1 ? ' registro' : ' registros') + '</span><span class="tb-sp"></span>' +
    (tem ? '<button type="button" class="bt" data-act="at-limpa">Limpar filtro</button>' : '') +
    '<button type="button" class="at-fl" data-act="at-filtro" aria-expanded="' + S.atAberto + '">' + ic('filtro') + '<b>Filtro</b><small>· ' + esc(atResumo()) + '</small></button>' +
    '<button type="button" class="bt ic-so" data-act="at-xlsx" title="Baixar planilha (.xlsx)" aria-label="Baixar planilha (.xlsx)">' + ic('planilha') + '</button>' +
    '<button type="button" class="bt ic-so" data-act="at-imp" title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button></div>' + atFiltroHTML() +
    (l.length ? atLinhas(l) + (l.length > S.atLimite ? '<div class="at-mais"><button type="button" class="bt" data-act="at-mais">Mostrar mais ' + Math.min(AT_LIM, l.length - S.atLimite) + ' de ' + (l.length - S.atLimite) + '</button></div>' : '') :
      '<div class="pn"><div class="vazio"><b>' + ((S.audit || []).length ? 'Nada com este filtro' : 'Ainda não há atividade registrada') + '</b><span>' + ((S.audit || []).length ? 'Mude o período ou limpe o filtro.' : 'Quando alguém lançar, programar ou corrigir algo, aparece aqui.') + '</span></div></div>') + '</div>';
}

/* ---------- planilha e impressão (só do que está filtrado) ---------- */
function atTexto() {
  const l = atFiltrar();
  return { cab: ['Data e hora', 'Quem', 'Perfil', 'App', 'Área', 'Ação', 'Registro', 'O que aconteceu', 'Autorizado por'],
    linhas: l.map(r => [fmtD(atDia(r.ts)) + ' ' + atHora(r.ts), r.userName || '', atPerfil(r.perfil), atApp(r), atArea(r), atAcao(r.acao), r.entidadeId || '', r.resumo || '', (r.autorizadoPor && (r.autorizadoPor.nome || r.autorizadoPor.por)) || '']) };
}
function atPlanilha() { const d = atTexto(), nome = APP_NOME + '-atividade-' + hojeISO() + '.xlsx'; plBaixar(plXlsx('Atividade', d.cab, d.linhas), nome); aviso('Planilha baixada: ' + nome); }
function atImprimir() {
  const d = atTexto(), e = S.empresa || {};
  let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>Atividade</b><span>' + esc(e.nome || '') + ' · ' + esc(fmtD(hojeISO())) + ' · ' + d.linhas.length + ' registros · ' + esc(atResumo()) + '</span></div><table><thead><tr>' + d.cab.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    d.linhas.map(l => '<tr>' + l.map(v => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table><div class="imp-pe">' + APP_APELIDO + '</div>';
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
DD_AO.at = (k, v) => { if (k in S.atFiltro) { S.atFiltro[k] = v; S.atLimite = AT_LIM; S.atLinha = null; render(); } };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="at-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'at-linha') { const id = t.getAttribute('data-id'); S.atLinha = S.atLinha === id ? null : id; render(); }
  else if (a === 'at-filtro') { S.atAberto = !S.atAberto; render(); }
  else if (a === 'at-limpa') { S.atFiltro = { pessoa: '', area: '', app: '', dias: '30' }; S.atLimite = AT_LIM; S.atLinha = null; render(); }
  else if (a === 'at-mais') { S.atLimite += AT_LIM; render(); }
  else if (a === 'at-xlsx') atPlanilha();
  else if (a === 'at-imp') atImprimir();
});
/* Esc fecha uma camada de cada vez: primeiro o detalhe aberto, depois o painel do filtro */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || S.rota.area !== 'adm' || S.rota.aba !== 'atividade' || (S.camadas && S.camadas.length) || document.querySelector('.dd-l:not([hidden]):not(.dd-fant)')) return;
  if (S.atLinha) { S.atLinha = null; render(); } else if (S.atAberto) { S.atAberto = false; render(); }
});
