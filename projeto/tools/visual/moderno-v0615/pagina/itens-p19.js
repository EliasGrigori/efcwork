/* Página v0.6.31 · Administração e foto. ITENS 157 a 161.
   HOJE = v0.6.30 publicada; PROPOSTA = o que já está no app (não publicado). */
const R = {
  pedido: ['Pedido do Elias, 20/11 às 21:07', 'conversa'],
  regra: ['Regra do Firestore de sv2_avatar: cada pessoa grava a própria foto (até 60 mil letras); o Administrador só apaga', 'docs/REGRAS-FIRESTORE-EFCwork-v0.6.20-COMPLETAS.txt'],
  nng: ['EFClaudian: a foto já fica em sv2_avatar e aparece para a equipe', 'o mesmo Firebase'],
  m3: ['Padrão do EFCwork: menu com a conta (foto, nome, sair) no pé', 'casca.js']
};
const GRUPOS = { 157: 'Menu lateral', 158: 'Administração', 160: 'Foto do perfil' };
const V = (rota, passos, extra) => Object.assign({ rota: rota, feito: true, so: 'pc', passos: passos || [['espera', 800]] }, extra || {});
const ITENS = [
  { n: 157, t: 'Administração no lugar do cartão “Fazenda Exemplo”',
    p: 'HOJE o alto do menu tem o cartão da empresa (que só levava para Administração) e a Administração aparece de novo no pé do menu. PROPOSTA: o cartão vira a própria entrada da Administração, com o ícone da engrenagem; o nome da empresa e a unidade deste aparelho ficam na linha de baixo, em letra menor. O item do pé sai (não se repete). No menu só com ícones, vira a engrenagem. Sem empresa cadastrada, a linha de baixo diz “Empresa não configurada”.',
    ref: [R.pedido, '“troque a fazenda exemplo do menu lateral pela Administração”', R.m3],
    pares: [['menu', 'Menu do computador', false], ['cel', 'Menu do celular (botão Mais)', true]], vivo: V('inicio') },
  { n: 158, t: 'Empresa: dados e tela de entrar juntos, sem espaço sobrando',
    p: 'HOJE a aba Empresa tem a coluna da direita quase vazia (só “Unidade deste aparelho”) e a Tela de entrar embaixo, sozinha. PROPOSTA: duas colunas do mesmo tamanho: à esquerda Dados da empresa e Unidade deste aparelho; à direita a Tela de entrar, que começa no mesmo alto. Em tela estreita (até 1100 px) volta a uma coluna. Junto, em todas as abas da Administração: a linha reservada para a mensagem de erro, que ficava vazia antes do botão Salvar e dobrava o espaço, só aparece quando há mensagem.',
    ref: [R.pedido, '“lá dentro tem muitas abas com espaços dobrando” e “na aba da empresa pode ficar junto com material da tela de login”', R.pedido],
    pares: [['emp', 'Administração › Empresa', false]], vivo: V('adm/empresa') },
  { n: 159, t: 'Sai a aba Aparência',
    p: 'A aba só tinha a escolha do tema, que o botão de lua e sol do topo já faz. PROPOSTA: a aba sai; o botão do topo continua e a escolha continua valendo só neste aparelho. Quem tiver o endereço antigo cai em Empresa.',
    ref: [R.pedido, '“remove o tema” (sua resposta: só a aba Aparência)', R.pedido],
    pares: [['abas', 'Abas da Administração', false]], vivo: V('adm/empresa') },
  { n: 160, t: 'Meu perfil: foto',
    p: 'PROPOSTA: em Meus dados, a foto redonda com “Escolher” (ou “Trocar”) e a lixeira para tirar. O app recorta o centro da imagem, quadrado, reduz e grava em sv2_avatar, a mesma coleção que o EFClaudian já usa: assim a foto vale em todos os apps da família, sem coleção nova e sem mudar as regras. Cada pessoa troca só a própria foto.',
    ref: [R.regra, 'Mesma coleção e mesmo limite do EFClaudian.', R.nng],
    pares: [['mp', 'Administração › Meu perfil, com foto', false]], vivo: V('adm/perfil') },
  { n: 161, t: 'A foto aparece no menu, no lugar das iniciais',
    p: 'No pé do menu, a bolinha com as iniciais (JS) passa a mostrar a foto da pessoa. Sem foto, continuam as iniciais.',
    ref: [R.nng, 'Reconhecer quem está logado.', R.nng],
    pares: [['pe', 'Pé do menu', false]], vivo: V('adm/perfil') }
];
module.exports = { R, GRUPOS, ITENS, img: 'img19', saida: 'docs/aprovacao-efcwork-v0.6.31-administracao.html', titulo: 'EFCwork v0.6.31 · Administração e foto',
  h1: 'Administração e foto', topo: 'EFCwork v0.6.31', copia: 'Respostas EFCwork v0.6.31 · Administração e foto', chave: 'efcwork-v0631', jaFeito: 'Já está no app (v0.6.31, não publicada)',
  sub: 'Os pedidos de 20/11 (21:07): Administração no alto do menu, abas sem espaço dobrado, sem a aba Aparência e a foto do perfil compartilhada com os outros apps. Nenhuma coleção nova e nenhuma mudança nas regras do Firestore. HOJE = como está no ar (v0.6.30). ',
  fila: ['Próximo da fila: Regras do Firestore (v0.6.32).', 'Com os itens aprovados: aplico só o aprovado, entrego o ZIP e publico só com o seu “pode publicar”. Teste depois de publicar: pôr a foto no EFCwork e ver se ela aparece no EFClaudian.'] };
