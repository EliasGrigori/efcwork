/* v0.6.50 · Só ver por área (prefixo sov). Decisão do Elias (28/11, questionário): em Administração › Pessoas cada área tem
   Não vê · Só ver · Ver e alterar (OPÇÃO 1); numa área "Só ver" o que altera some (OPÇÃO A, como o perfil Consulta); a trava vale
   na tela e nas regras do Firebase ([R8]); o EFClaudian fica fora.
   Dado: sv2_users.atrib[área] = true (vê) + sv2_users.soVer[área] = true (só vê). O Administrador vê e altera tudo sempre.
   Na tela: isSup(S.user) e podeLancar(S.user) (servicos.js) respondem "não" dentro de uma área só de ver, e o que é de "Não vê" some. */
/* área (e aba) da tela → atribuição. Relatórios só leem, Início, Administração e Vértice não entram. */
const sovDaRota = (a, t) => a === 'coletas' ? 'coletas' : a === 'rateios' ? 'rateios' : a === 'inspecoes' ? (t === 'apontamentos' || t === 'auditoria' ? 'apont' : 'cloro')
  : a === 'documentos' ? 'docs' : a === 'almox' ? 'almox' : a === 'qualidade' ? (t === 'bugs' ? '' : 'qualidade') : '';
const sovAqui = () => S.rota ? sovDaRota(S.rota.area, S.rota.aba) : '';
const soVer = (u, id) => !!u && !!id && !isPrincipal(u) && !!u.soVer && typeof u.soVer === 'object' && u.soVer[id] === true;
const soVerAqui = u => !!u && !!S.user && u.id === S.user.id && soVer(S.user, sovAqui());
/* o mesmo mapa das regras [R8]: coleção → áreas que gravam nela (basta uma liberada) */
const SOV_COLS = {
  sv2_talhoes: ['coletas'], sv2_analises: ['coletas'], sv2_etqmodelos: ['coletas'], sv2_prog: ['coletas'], sv2_rodizio: ['coletas'], sv2_aguaproj: ['coletas'],
  sv2_aguaponto: ['coletas'], sv2_agua_foto: ['coletas'], sv2_envio_imp: ['coletas'], sv2_rem_docs: ['coletas'], sv2_rem_arq: ['coletas'],
  sv2_coletas: ['coletas', 'rateios'], sv2_aguacol: ['coletas', 'rateios'],
  sv2_bebs: ['cloro'], sv2_cloro: ['cloro'], sv2_cloro_falta: ['cloro'], sv2_cloro_foto: ['cloro'],
  sv2_apont: ['apont'], sv2_fotos: ['apont'], sv2_rnc: ['apont'], sv2_rnc_foto: ['apont'], sv2_rnc_plano: ['apont'], sv2_rnc_gut: ['apont'],
  sv2_docs: ['docs'], sv2_caixas: ['docs'], sv2_lanc: ['docs'], efd_docs: ['docs'], efd_partes: ['docs'], sv2_impressos: ['docs', 'coletas'],
  sv2_alm_itens: ['almox'], sv2_alm_mov: ['almox'], sv2_alm_sol: ['almox'], sv2_alm_equip: ['almox'], sv2_alm_equip_foto: ['almox'], sv2_alm_inv: ['almox'],
  sv2_alm_transf: ['almox'], sv2_alm_foto: ['almox'], sv2_alm_cal: ['almox', 'rateios'],
  sv2_analise: ['qualidade'], sv2_treinos: ['qualidade']
};
/* modo demonstração: nega a gravação como a regra [R8] negaria (para os testes) */
const sovNegaCol = col => { const l = SOV_COLS[col], u = S.user; return !!l && !!u && !isPrincipal(u) && l.every(a => soVer(u, a)); };
/* pedido de aprovação → área (quem só vê a área não decide o pedido dela) */
const SOV_APROV = { cloro_retro: 'cloro', cloro_just: 'cloro', corrigir_cloro: 'cloro', novo_bebedouro: 'cloro', cloro_tratado: 'cloro', almox: 'almox',
  recoleta_plano: 'coletas', cancelar_coleta: 'coletas', corrigir_coleta: 'coletas', laudo_prazo: 'coletas', rz_recoleta: 'coletas', desativar_cadastro: 'coletas',
  envio_retro: 'coletas', corrigir_os: 'coletas', corrigir_lancamento: 'docs' };

/* "Não vê": a tela some (regra de 09/11). Coletas e Almoxarifado mostravam "Você não tem acesso"; Cloro, Apontamentos,
   Documentos e Qualidade apareciam para todos, mesmo desmarcados. Bugs e sugestões fica para todos. */
(function sovTelas() {
  const area = id => AREAS.find(a => a.id === id), aba = (a, id) => a && a.abas.find(t => t.id === id);
  const nega = (o, f) => { if (o) Object.defineProperty(o, 'negada', { get: () => !!S.user && f(), configurable: true }); };
  const ve = id => temAtrib(S.user, id);
  nega(area('coletas'), () => !ve('coletas'));
  nega(area('almox'), () => !ve('almox'));
  nega(area('documentos'), () => !ve('docs'));
  const ins = area('inspecoes');
  nega(ins, () => !ve('cloro') && !ve('apont'));
  nega(aba(ins, 'cloro'), () => !ve('cloro'));
  nega(aba(ins, 'apontamentos'), () => !ve('apont'));
  nega(aba(ins, 'auditoria'), () => !ve('apont'));
  const q = area('qualidade');
  ['nc', 'analise', 'treinos'].forEach(t => nega(aba(q, t), () => !ve('qualidade')));
})();
