/* Página v0.6.20 · Bugs e sugestões 2 (itens 23, 25, 29 e 49 da TRIAGEM de 09/11). ITENS 89 a 98.
   HOJE = v0.6.19 publicada; PROPOSTA = o que já está no app (não publicado). O item 30 (as 24 regras) ficou para depois. */
const R = {
  tri: ['TRIAGEM de 09/11 (lista do EFClaudian): itens 23, 25, 29 e 49', 'o pedido original'],
  lin: ['Linear · prioridade opcional (Sem prioridade, Baixa, Média, Alta, Urgente)', 'https://linear.app/docs/priority'],
  jira: ['Jira · níveis de prioridade com cor só nos que pesam', 'https://support.atlassian.com/jira-service-management-cloud/docs/what-are-priority-levels-in-jira-service-management/'],
  mk: ['Marker.io · prioridade no relato de bug, com troca no histórico e no registro', 'https://help.marker.io/en/articles/11204437-issue-priority'],
  gl: ['GitLab · comentários dentro do item, separados do histórico de mudanças', 'https://docs.gitlab.com/ee/user/discussions.html']
};
const GRUPOS = { 89: 'Item 25 · prioridade e partes do app', 93: 'Item 29 · comentários', 95: 'Item 49 · marcar a imagem', 97: 'Item 23 · cada um vê só o que lançou' };
const V = (extra) => Object.assign({ rota: 'qualidade/bugs', feito: true, so: 'pc', passos: [['espera', 900]] }, extra || {});
const ITENS = [
  { n: 89, t: 'Coluna Prioridade na tabela',
    p: 'Nova coluna depois do Título. Só os problemas têm prioridade; sugestão fica em branco. Cor só na Alta (vermelha), porque é a que pede atenção; Média e Baixa ficam neutras. Os relatos antigos ficam sem prioridade até o Administrador escolher. Nos Finalizados a coluna começa escondida (dá para ligar em Colunas), para a tabela não rolar para o lado.',
    ref: [R.tri, 'Item 25: “Prioridade Alta/Média/Baixa nos bugs”.', R.jira],
    pares: [['tab', 'Tabela no PC', false]], vivo: V() },
  { n: 90, t: 'Reportar: Prioridade ao lado do Tipo',
    p: 'Na janela “Reportar ou sugerir”, quando o tipo é Problema, aparece a Prioridade ao lado do Tipo (mesma linha, mesma altura e largura) e a parte do app desce para a linha de baixo, inteira. Começa em Média. Em Sugestão o campo some. Quem reporta escolhe; o Administrador pode mudar depois.',
    ref: [R.tri, 'Item 25.', R.lin],
    pares: [['form', 'Janela de reportar', false]], vivo: V({ passos: [['espera', 900], ['clica', '[data-act="bs-novo"]', 700]] }) },
  { n: 91, t: 'Duas partes novas em “Em qual parte do app”',
    p: 'A lista ganha “Segurança / Login” e “Bugs e sugestões”, antes de “Geral / outra”. Servem para relatar problema de senha e de entrada, e problema da própria tela de relatos.',
    ref: [R.tri, 'Item 25: “Segurança / Login” e “Bugs e sugestões” em “Em qual parte do app”.', R.gl],
    pares: [['area', 'Lista aberta', false]], vivo: V({ passos: [['espera', 900], ['clica', '[data-act="bs-novo"]', 700], ['clica', '#gv [data-dd="bs:area"] .dd-b', 500]] }) },
  { n: 92, t: 'Gaveta: o Administrador muda a prioridade ali mesmo',
    p: 'Na gaveta do relato, a linha “Prioridade” fica na mesma grade dos dados (Quem, Quando…). Para o Administrador é uma janela retrátil (Sem prioridade, Alta, Média, Baixa); a troca grava na hora, aparece no aviso de baixo e fica no registro de atividade (“Alta → Média”). Quem reportou vê a prioridade, mas não muda. A prioridade também vai para o relatório impresso.',
    ref: [R.mk, 'Mesma ideia: a troca de prioridade fica no histórico e no registro.', R.lin],
    pares: [['gvpri', 'Gaveta do relato nº 2', false]], vivo: V({ passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900]] }) },
  { n: 93, t: 'Comentários dentro do relato',
    p: 'Bloco “Comentários · N” entre os dados e o Andamento, com o botão Comentar. Cada comentário mostra quem, quando, o texto e a miniatura da imagem (abre grande). O Andamento continua só com as mudanças de situação, como no GitLab (comentário separado do histórico). Quem pode comentar: quem reportou e o Administrador. O comentário de quem reportou avisa o Administrador no sino; o do Administrador avisa quem reportou. Os comentários também saem no relatório impresso.',
    ref: [R.tri, 'Item 29: “Comentário (texto e foto) dentro de cada item, com aviso ao autor”.', R.gl],
    pares: [['com', 'Comentários na gaveta', false]], vivo: V({ passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900]] }) },
  { n: 94, t: 'Janela Comentar: texto e imagem (com Marcar)',
    p: 'Janela curta: o comentário e uma imagem opcional, com o mesmo botão Marcar das inspeções antes de enviar. Embaixo diz quem vai receber o aviso. Sem texto e sem imagem, a janela diz o que falta.',
    ref: [R.tri, 'Item 29.', R.gl],
    pares: [['comjan', 'Janela de comentário', false]], vivo: V({ passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900], ['clica', '#gv [data-act="bs-com"]', 600]] }) },
  { n: 95, t: 'A imagem do relato abre com o botão Marcar',
    p: 'Tocar na imagem do relato abre a foto grande, agora com “Marcar” (o mesmo editor das inspeções: círculo, seta, texto, borrar, numerar, desfazer). Aparece para quem reportou e para o Administrador. Na janela de reportar, a imagem escolhida também tem Marcar antes de enviar.',
    ref: [R.tri, 'Item 49: “Abrir as fotos anexadas em Bugs e sugestões e editar com as ferramentas das inspeções”.', 'Mesmo editor do item 42 (inspeções), já aprovado.'],
    pares: [['ver', 'Imagem aberta', false]], vivo: V({ passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900], ['clica', '#gv [data-act="bs-foto-ver"]', 600]] }) },
  { n: 96, t: 'Imagem marcada na gaveta; a original fica guardada',
    p: 'Depois de marcar, a gaveta mostra a imagem com as marcas e a nota “1 marca · por Joana Silva em … · a original fica guardada”. A marcada é gravada como um documento novo; a original nunca é regravada (o EFClaudian continua vendo a original). Dá para abrir de novo e tirar ou refazer as marcas; na foto grande há o botão “Original”.',
    ref: [R.tri, 'Item 49.', 'Mesma regra das inspeções: a original nunca se perde.'],
    pares: [['mk', 'Gaveta depois de marcar', false]], vivo: V({ passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900]] }) },
  { n: 97, t: 'Quem não é Administrador vê só o que lançou',
    p: 'Decisão sua de hoje: regra agora. Para Colaborador e Líder, a tela mostra só os relatos que a pessoa enviou, e o cabeçalho diz “em aberto · só os seus”. Contadores, busca e relatório impresso seguem a mesma lista. O Administrador continua vendo todos. O número do relato vem de um contador no Firebase, para não repetir o número de outra pessoa. A regra fechada está no documento de regras (seção 0) para você publicar; com ela, a tela de Bugs do EFClaudian para de abrir para quem não é Administrador.',
    ref: [R.tri, 'Item 23: “cada um vê só o que lançou; Principal vê tudo (tela, contadores, PDF e regra do Firestore)”.', R.lin],
    pares: [['colab', 'Tela como Colaborador (Joana sem ser Administradora)', false]], vivo: V({ so: '', passos: [['espera', 900], ['js', "Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', atrib: { qualidade: true } }).then(() => csCarregaUsuario(S.user.id)).then(() => { location.hash = '#/qualidade/bugs'; })", 1500]] }) },
  { n: 98, t: 'Celular: gaveta com prioridade e comentários',
    p: 'No celular a gaveta é tela cheia. A Prioridade fica na mesma grade dos dados (rótulo à esquerda, janela à direita, 44 px de altura); Comentar com 44 px; nada rola para o lado.',
    ref: [R.tri, 'Itens 25 e 29 no celular.', R.gl],
    pares: [['cel', 'Gaveta no celular', true]], vivo: V({ so: '', passos: [['espera', 900], ['clica', 'tr[data-id="b2"]', 900]] }) }
];
module.exports = { R, GRUPOS, ITENS, img: 'img12', saida: 'docs/aprovacao-efcwork-v0.6.20-bugs2.html', titulo: 'EFCwork v0.6.20 · Bugs e sugestões 2',
  h1: 'Bugs e sugestões: prioridade, comentários e marcar', topo: 'EFCwork v0.6.20 · Bugs 2', copia: 'Respostas EFCwork v0.6.20 · Bugs e sugestões 2', chave: 'efcwork-v0620-bugs2', jaFeito: 'Já está no app (v0.6.20, não publicada)',
  sub: 'Itens 23, 25, 29 e 49 da lista do EFClaudian, feitos no EFCwork. O item 30 (as 24 regras no PDF) fica para quando você mandar o texto. Já está no app, ainda não publicada. HOJE = como está no ar (v0.6.19); PROPOSTA = com as mudanças. Dados inventados. ',
  semente: require('../../bugs-v0620/semente.js').toString(),
  fila: ['Item 30: as 24 regras do sistema no topo do relatório e em Sobre, quando você mandar o texto (regras-sistema.md).', 'Item 44: Meu dia › Semana sem datas repetidas (fica para a área Meu dia).', 'Com os itens aprovados: aplico só o aprovado, entrego o ZIP e publico só com o seu “pode publicar”. A regra do Firebase (seção 0 do documento de regras) você publica no console.'] };
