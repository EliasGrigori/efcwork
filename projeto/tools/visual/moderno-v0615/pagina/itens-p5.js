/* Página do celular (Tarefa 2): cabeçalho das telas no celular. HOJE = v0.6.15 publicada; PROPOSTA = com o ajuste (já no app, não publicado). */
const R = {
  m3: ['Material Design · barra de topo (ações à direita)', 'https://material.io/components/app-bars-top'],
  appian: ['Appian Design · botões (largura “Fill” no celular)', 'https://docs.appian.com/suite/help/24.3/sail/ux-buttons.html'],
  mozilla: ['Mozilla Acorn · botões lado a lado', 'https://acorn.firefox.com/latest/mobile/components/buttons/i-os-TWW7xym3']
};
const GRUPOS = { 39: 'Celular: fileira de ações do cabeçalho' };
const ITENS = [
  { n: 39, t: 'Celular: o ícone “Abrir o EFClaudian” sobe para a linha do caminho',
    p: 'O problema: no Almoxarifado (Materiais e Painel) a fileira tem Contagem, Entrada e Saída; o ícone de abrir o EFClaudian não cabe e cai sozinho numa linha de baixo. Proposta: o ícone vai para o canto direito da linha do caminho (“Almoxarifado / Materiais”), no mesmo lugar em todas as telas que têm esse atalho (Almoxarifado, Coletas, Água, Programação). A fileira de baixo fica só com os botões de trabalho. Toque de 44 px mantido. No PC nada muda.',
    ref: [R.m3, 'Ações de apoio ficam no canto direito do topo; a fileira de baixo guarda o que se usa o tempo todo.'],
    pares: [['cel', 'Almoxarifado › Materiais', true], ['cel2', 'Coletas › Água: o botão e os ícones continuam alinhados', true], ['cel3', 'Almoxarifado › Materiais no tema Escuro', true]],
    vivo: { rota: 'almox/materiais', feito: true, so: 'cel' } },
  { n: 40, t: 'Celular: botões da fileira com a mesma largura',
    p: 'Pela sua regra (lado a lado = mesma linha, altura e largura). Hoje Contagem, Entrada e Saída têm 123, 105 e 91 px. Com a proposta, os botões com texto dividem a largura em partes iguais (114 px cada em 390 px de tela). Quando um botão tem texto grande demais para a parte igual (“Novo apontamento”), ele passa para a linha de baixo e ocupa a linha toda; os outros continuam iguais entre si. Em telas de 360 px, se três botões não couberem iguais, a coluna cresce só o necessário e nada é cortado. Fileiras com ícone solto (Água) ficam como estão.',
    ref: [R.appian, 'No celular, botões lado a lado preenchem a largura em partes iguais.', R.mozilla],
    pares: [['cel', 'Inspeções › Apontamentos', true], ['cel2', 'Coletas › Envio', true], ['cel3', 'Almoxarifado › Equipamentos', true]],
    vivo: { rota: 'inspecoes/apontamentos', feito: true, so: 'cel' } }
];
module.exports = { R, GRUPOS, ITENS, img: 'img5', saida: 'docs/aprovacao-efcwork-v0.6.15-celular.html', titulo: 'EFCwork v0.6.15 · celular: cabeçalho',
  h1: 'Celular: ícones e botões do cabeçalho', topo: 'EFCwork v0.6.15 · celular', copia: 'Respostas EFCwork v0.6.15 · celular', chave: 'efcwork-v0615-celular',
  sub: 'Os dois ajustes já estão no app (v0.6.15, ainda não publicados). HOJE = como está no ar; PROPOSTA = com o ajuste, em tela de celular (390 px). ',
  semente: (async function () {}).toString(),
  fila: ['Com os itens aprovados: aplico no pacote e publico só com o seu “pode publicar”.', 'Depois: Tarefa 4 (Treinamentos: revisão pelo uso).'] };
