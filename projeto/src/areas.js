/* EFCwork · areas.js — telas das áreas que ainda não foram refeitas. Mostram o que a área vai ter e levam ao EFClaudian. Prefixo: ar.
   Cada área nova (v0.2 em diante) entra com o seu próprio módulo e registra TELAS[área]; esta tela some sozinha. */
const AR_PLANO = {
  coletas: ['Amostras numa tabela só, com o tipo no filtro (Solo, Nematoide, Folha, Fruta, Composto, Água)', 'Ciclo da amostra na gaveta: Programação, Coleta, Envio, OS, Laudo arquivado e Compra do serviço', 'NF do pacote, cupom dos Correios e código de rastreio no envio', 'Prazo do laboratório com aviso de atraso; laudo fora da faixa vira não conformidade'],
  rateios: ['Uma tela só, com o tipo (Campo, Água, Calibração) no filtro', 'Emitir a solicitação de compra direto do rateio', 'Painel do rateio em Relatórios'],
  inspecoes: ['Cloro', 'Apontamentos, com o relatório como botão', 'Auditoria interna (RNC)'],
  documentos: ['Documentos com o resumo no topo', 'Caixas d’água', 'Histórico (lançamentos e correções, com filtro)'],
  qualidade: ['Não conformidades', 'Análise de problemas', 'Bugs e sugestões'],
  relatorios: ['Documentos (gráficos)', 'Rateio', 'Almoxarifado do mês', 'Apontamentos', 'Coletas em aberto', 'Semana']
};
function arEmBreve(ar) {
  const aba = ar.abas.find(x => x.id === S.rota.aba);
  return cabecalho({ titulo: aba ? aba.nome : ar.nome, abaNome: aba && ar.abas.length > 1 ? aba.nome : '', meta: [metaPl('chega na ' + (ar.versao || 'próxima versão'), 'wa', 'relogio')], acoes: '<a class="bt pr" href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">' + ic('externo') + 'Usar no EFClaudian</a>' }) +
    '<section class="pn"><div class="vazio ar-vz">' + ic(ar.ic) + '<b>Esta área está sendo refeita no ' + APP_NOME + '.</b><span>Enquanto isso, ela continua funcionando no EFClaudian, com os mesmos dados.</span></div>' +
    (AR_PLANO[ar.id] ? '<div class="cpo ar-pl"><p class="ini-sub">O que vem aqui</p><ul>' + AR_PLANO[ar.id].map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '') + '</section>';
}
