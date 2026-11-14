/* Itens da parte 3 (ITENS 22 a 24): os três pedidos que vieram nos comentários da parte 2 (14/11 12:50), já feitos no app. */
const R = {
  primer: ['Visa Design System · tabela (cabeçalho fixo)', 'https://design.visa.com/components/table/usage/'],
  linear: ['Linear · renovação da interface (março de 2026)', 'https://linear.app/now/behind-the-latest-design-refresh'],
  mov: ['Atlassian Design · Movimento', 'https://atlassian.design/foundations/motion']
};
const GRUPOS = { 22: 'Seus pedidos nos comentários da parte 2 (já feitos no app; confira se entendi certo)' };
const ITENS = [
  { n: 22, t: 'Só a tabela rola, com o cabeçalho dela parado no alto',
    p: 'Seu comentário no ITEM 17: “rolagem só fica para a tabela, com o cabeçalho para cima congelado”. No PC, a tabela de cada tela vai até o fim da janela e rola por dentro; o título, as abas, os botões e o cabeçalho das colunas ficam parados. No celular a página continua rolando como hoje (uma tabela rolando dentro da página atrapalha o dedo). Vale para todas as tabelas das telas; nas gavetas nada muda.',
    ref: [R.primer, 'Com rolagem vertical na tabela, o recomendado é o cabeçalho fixo: as linhas passam por baixo dele e ele fica parado no alto.'],
    pares: [['pc', 'Coletas › Amostras, depois de rolar a lista']], vivo: { rota: 'coletas/amostras', feito: true, so: 'pc', dica: 'Role a lista dentro do app: o cabeçalho das colunas fica parado.' } },
  { n: 23, t: 'Total sem caixas, com a letra de “4 não enviadas”',
    p: 'Seu comentário no ITEM 18: o total de todas as tabelas sem as caixas, com a mesma letra das pílulas do cabeçalho, ocupando menos espaço. Ficou “Total” em cinza e o valor em negrito, os dois com 13 px, sem borda e sem fundo; continua no mesmo lugar (em cima da coluna quando cabe; senão, antes dos ícones). No celular fica numa linha só de texto.',
    ref: [R.linear, 'Menos caixas e bordas em volta de números; o valor aparece pela letra.'],
    pares: [['pc', 'PC · Coletas › Amostras'], ['pc2', 'PC · Almoxarifado › Materiais'], ['cel', 'Celular · Coletas › Amostras', 1]], vivo: { rota: 'almox/materiais', feito: true } },
  { n: 24, t: 'Fluidez também ao trocar de aba (Cloro, Apontamentos, Auditoria…)',
    p: 'Seu comentário no ITEM 18: entre as áreas (Coletas, Rateios, Inspeções) havia fluidez, mas nas abas de dentro não. Entre áreas o título entrava letra por letra; nas abas o conteúdo só deslizava 12 px e o título trocava seco. Agora o título entra do mesmo jeito ao trocar de aba, em todas as áreas. Se o item 15 da parte 1 (título mais rápido) for aprovado, a velocidade nova vale para os dois.',
    ref: [R.mov, 'O mesmo movimento para a mesma ação, em toda a interface.'],
    vivo: { rota: 'inspecoes/cloro', feito: true, dica: 'Troque de aba dentro do app: Cloro, Apontamentos, Auditoria interna.', passos: [['espera', 900], ['clica', '.cs-abas a[href="#/inspecoes/apontamentos"]'], ['espera', 1500], ['clica', '.cs-abas a[href="#/inspecoes/auditoria"]'], ['espera', 1700], ['clica', '.cs-abas a[href="#/inspecoes/cloro"]']] } }
];
module.exports = { R, GRUPOS, ITENS, img: 'img3', saida: 'docs/aprovacao-efcwork-v0.6.15-moderno-parte3.html', titulo: 'EFCwork v0.6.15 · Modernização, parte 3',
  h1: 'Modernização, parte 3: seus pedidos', topo: 'EFCwork v0.6.15 · parte 3', copia: 'Respostas EFCwork v0.6.15 · modernização (parte 3)', chave: 'efcwork-v0615-moderno-p3',
  sub: 'Os itens 16 a 21 da parte 2 já estão no app (aprovados). Estes são os pedidos que vieram nos seus comentários; confira se entendi certo. ', semente: require('./semente-p3.js').toString(),
  fila: ['Parte 1 (itens 1 a 15) continua esperando as suas respostas.', 'Depois: página final da v0.6.15 e publicar só com o seu “pode publicar”.'] };
