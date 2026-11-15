/* Página dos ITENS 6 e 7 da varredura v0.6.8 (limite de 3.000 em Coletas e Água; fotos vencidas da ação). HOJE = v0.6.15.2 publicada; PROPOSTA = com o ajuste (já no app, não publicado). */
const R = {
  fb: ['Firebase · como o Firestore cobra as leituras', 'https://firebase.google.com/docs/firestore/pricing'],
  sap: ['SAP · comportamento de carregamento de tabelas', 'https://www.sap.com/design-system/cx-ux-best-practice-guide/patterns/table-loading-behavior'],
  maersk: ['Maersk Design System · botão “carregar mais”', 'https://designsystem.maersk.com/components/pagination/'],
  ttl: ['Google Cloud · eliminação automática (TTL) no Firestore', 'https://docs.cloud.google.com/firestore/docs/ttl'],
  efc: ['Regra das fotos da ação aprovada no EFClaudian em 23/09/2026', 'dossiê']
};
const GRUPOS = { 50: 'Quantas coletas o app carrega', 52: 'Fotos da ação corretiva de água' };
const ITENS = [
  { n: 50, t: 'Coletas › Amostras: carregar as 3.000 mais recentes',
    p: 'Hoje o app lê todas as amostras toda vez que abre. Com o tempo isso fica lento no celular e gasta leituras do Firebase: se o app ficou fechado mais de 30 minutos, a lista inteira é lida de novo. Proposta: o app lê as 3.000 amostras mais recentes pela data da coleta. Enquanto houver menos de 3.000, nada muda. Passando disso, a barra da tabela mostra “só as mais recentes” e o botão “Carregar todas” lê o resto até fechar o app. Atenção: com o teto, os números do topo (não enviadas, laudos atrasados, valor total) e a Programação contam só as amostras carregadas. Segurança: uma amostra nova nunca grava em cima de uma antiga que ficou de fora; o app confere o número no servidor antes. Nas imagens: 3.025 amostras inventadas (cerca de 2 anos).',
    ref: [R.fb, 'Se a escuta fica desligada mais de 30 minutos, o Firestore cobra a lista inteira como uma consulta nova.', R.sap],
    pares: [['pc', 'Coletas › Amostras no PC', false], ['cel', 'Coletas › Amostras no celular', true]],
    vivo: { rota: 'coletas/amostras', feito: true } },
  { n: 51, t: 'Coletas › Água: carregar as 3.000 mais recentes',
    p: 'O mesmo para as coletas de água, como o EFClaudian já faz na água. Até 3.000 coletas nada muda; passando, aparece “só as mais recentes” e “Carregar todas”. No celular o aviso fica na primeira linha e “Carregar todas” à esquerda dos ícones, com toque de 44 px. Nas imagens: 3.013 coletas de água inventadas.',
    ref: [R.maersk, 'Um botão para carregar mais deixa a pessoa decidir quando ver o resto, sem página de número.', R.fb],
    pares: [['pc', 'Coletas › Água no PC', false], ['cel', 'Coletas › Água no celular (a barra da tabela)', true]],
    vivo: { rota: 'coletas/agua', feito: true } },
  { n: 52, t: 'Fotos vencidas da ação somem para todos no dia',
    p: 'Hoje as fotos da ação corretiva só somem quando um Líder ★ ou Administrador abre o app (é no aparelho deles que a eliminação roda). Até lá, o responsável e os outros continuam vendo as fotos e o aviso “Fotos até 13/11” mesmo depois do dia, e o PDF ainda sai com elas. Proposta: passou o prazo, as fotos saem da tela e do PDF para todos no mesmo dia, com “2 foto(s) vencida(s) em 13/11”. A eliminação de vez continua no aparelho do Líder ★ ou Administrador (como no EFClaudian); depois disso aparece “eliminada(s) em …”. O texto das etapas nunca some. As imagens mostram o que vê o responsável.',
    ref: [R.ttl, 'Mesmo com a eliminação automática do Google, o app deve conferir a data e esconder o que venceu, porque a eliminação pode atrasar.', R.efc],
    pares: [['gav', 'Ação concluída há 8 dias (venceu ontem)', false]],
    vivo: { rota: 'coletas/agua', feito: true, so: 'pc', passos: [['espera', 900], ['js', "acAbre('v8')", 1200]] } },
  { n: 53, t: '“Fotos até” mostra o último dia com foto',
    p: 'Correção pequena: a ação concluída em 11/11 dizia “Fotos até 18/11”, mas no dia 18 as fotos já são eliminadas. Proposta: o aviso mostra o último dia em que ainda há foto (“Fotos até 17/11”). O prazo de 7 dias não muda.',
    ref: [R.efc, 'As fotos ficam 7 dias depois da conclusão; o aviso agora bate com o dia em que somem.'],
    pares: [['gav', 'Ação concluída há 3 dias', false]],
    vivo: { rota: 'coletas/agua', feito: true, so: 'pc', passos: [['espera', 900], ['js', "acAbre('v3')", 1200]] } }
];
module.exports = { R, GRUPOS, ITENS, img: 'img7', saida: 'docs/aprovacao-efcwork-v0.6.15-limites-fotos.html', titulo: 'EFCwork v0.6.15 · Limite de 3.000 e fotos vencidas',
  h1: 'Coletas e Água: limite de 3.000 e fotos vencidas', topo: 'EFCwork v0.6.15 · limite e fotos', copia: 'Respostas EFCwork v0.6.15 · limite e fotos', chave: 'efcwork-v0615-limite',
  sub: 'ITENS 6 e 7 da varredura da v0.6.8, que estavam sem resposta. Os ajustes já estão no app (ainda não publicados). HOJE = como está no ar (v0.6.15.2); PROPOSTA = com o ajuste. Dados inventados. ',
  semente: require('../../limite-v0615/semente.js').toString(),
  fila: ['Com os itens aprovados: numero a versão (v0.6.15.3), entrego o ZIP e publico só com o seu “pode publicar”.', 'Itens reprovados saem do pacote antes.'] };
