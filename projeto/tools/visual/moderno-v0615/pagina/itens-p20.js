/* Página v0.6.32 · Regras do Firestore. ITENS 162 a 169. Sem imagens: regra não tem tela. */
const R = {
  var: ['Varredura de 20/11 (S1 e S8)', 'RELATORIO-VARREDURA-EFCwork-v0.6.28.md'],
  rev: ['Revisor novo (agente sem a conversa), 20/11 22:20: nenhum achado bloqueante; 4 brechas importantes fechadas nesta proposta', 'dossiê, seção v0.6.32'],
  fb: ['Firebase · Regras de segurança: condições e o Simulador de regras do console', 'https://firebase.google.com/docs/rules/simulator'],
  arq: ['Regras propostas, prontas para colar', 'REGRAS-FIRESTORE-EFCwork-v0.6.32-PROPOSTA.txt']
};
const GRUPOS = { 162: 'Corrige no app (já está feito)', 163: 'Regras novas (você cola no console; cada uma pode ser recusada)', 168: 'Ficam como estão' };
const V = (rota, passos, feito) => ({ rota: rota, feito: feito !== false, so: 'pc', passos: passos || [['espera', 800]] });
const ITENS = [
  { n: 162, t: 'Meu dia: passar tarefa para outra pessoa funcionava só na demonstração',
    p: 'Achado ao ler as regras contra o código: a regra de hoje só deixa criar tarefa para outra pessoa quando a tarefa leva o campo porId (quem passou), e o EFCwork não gravava esse campo. No Firebase de verdade, o Líder ★ e o Administrador seriam barrados ao passar tarefa para um liderado, e quem passou não conseguiria editar nem cancelar. PROPOSTA (já no app): toda tarefa nova grava porId; tarefa antiga sem ele ganha o porId quando o Administrador a edita. Não muda regra. Lido no código e provado na demonstração; não reproduzido no Firebase real.',
    ref: [R.var, 'Teste t_v0632: antes, Administrador e Líder ★ barrados; depois, passam.', R.arq], vivo: V('inicio', [['espera', 700], ['js', 'tfNova()', 600]]) },
  { n: 163, t: 'R1 · Login: só o dono liga o próprio login a um e-mail',
    p: 'HOJE qualquer pessoa logada, até o login anônimo dos participantes do EFCQuiz, pode criar a ligação login → e-mail de um login que ainda não tem ligação, e assim desviar a recuperação de senha daquela pessoa. PROPOSTA: só quem tem conta ativa, e só para o próprio login (o mesmo gravado no cadastro dele); o Administrador continua podendo tudo. EFClaudian: o “completar cadastro” dele é feito pela própria pessoa logada, então deve passar; se o login dele for gravado com letra maiúscula ou espaço, não passa. Teste no Simulador (roteiro, passo R1).',
    ref: [R.var, 'S8 e o risco do login anônimo anotado na v0.6.29.', R.rev], vivo: V('inicio', null, false) },
  { n: 164, t: 'R2 · Pedidos de autorização: quem pediu não decide',
    p: 'HOJE qualquer Líder ★ decide qualquer pedido, inclusive o próprio, e quem pede pode pôr um colega comum como aprovador. PROPOSTA: decide o Líder ★ que foi indicado no pedido (e não é quem pediu), ou o Administrador. O EFCwork já funciona assim na tela; a regra passa a cobrar o mesmo. EFClaudian: se lá um Líder ★ decide pedidos que não foram para ele, passa a dar “permissão negada”.',
    ref: [R.var, 'S1 (sv2_aprov).', R.rev], vivo: V('inicio', null, false) },
  { n: 165, t: 'R3 · Material do Almoxarifado: cadastrar é do Líder ★ e do Administrador',
    p: 'HOJE qualquer pessoa que lança cria e altera qualquer campo do material (mínimo, crítico, ativo, nome) direto pela API, sem pedido. PROPOSTA: cadastrar e alterar, só Líder ★ ou Administrador (o pedido do Colaborador continua indo para o superior, que aplica); quem lança só atualiza o preço na Entrada, e só com número de 0 para cima. EFClaudian: se lá o Colaborador cadastra material direto ou a Entrada grava outro campo no material, passa a dar “permissão negada”. Este é o de maior risco para o EFClaudian: teste uma Entrada no EFClaudian com um Colaborador depois de colar.',
    ref: [R.var, 'S1 (sv2_alm_itens).', R.rev], vivo: V('inicio', null, false) },
  { n: 166, t: 'R4 · Tarefas: passar ou repassar para outra pessoa só o Líder ★ e o Administrador',
    p: 'HOJE a regra deixa qualquer um criar tarefa para outra pessoa e, depois de criada, trocar o responsável. PROPOSTA: para si mesmo, todos; para outra pessoa (ou trocar o responsável, quem passou e os superiores da tarefa), só Líder ★ ou Administrador. O EFCwork já funciona assim (item 162 incluído). EFClaudian: se lá o Colaborador passa tarefa ou o responsável repassa a tarefa, passa a dar “permissão negada”.',
    ref: [R.var, 'S1 (sv2_tarefas).', R.rev], vivo: V('inicio', null, false) },
  { n: 167, t: 'R5 · Número do relato de Bugs: sem salto',
    p: 'HOJE qualquer usuário pode subir o contador do número do relato para um número enorme e bagunçar a numeração, ou criar outros contadores. PROPOSTA: só o contador “n”, só com os campos que o app grava; quem não é Administrador sobe de 1 a 3 por vez. O Administrador acerta o contador quando abre a tela de Bugs, como hoje.',
    ref: [R.var, 'S8 (sv2_bugs_seq).', R.rev], vivo: V('inicio', null, false) },
  { n: 168, t: 'Rodízio: a liberação de coleta continua conferida só no app',
    p: 'A brecha da varredura: um Colaborador com o console aberto grava a liberação como se fosse do Líder ★. A liberação fica dentro do mesmo documento do plano (um mapa por período e área), e a regra do Firestore não consegue olhar entrada por entrada de um mapa. Fechar isso exige mudar como o EFCwork e o EFClaudian gravam a liberação (um documento por liberação). PROPOSTA: não mexer agora; fica anotado como limite. Se aprovar este item, fica como está; se reprovar, faço a mudança do formato numa versão própria.',
    ref: [R.var, 'S1 (sv2_rodizio).', R.fb], vivo: V('inicio', null, false) },
  { n: 169, t: 'Avisos para “todos”: continuam liberados',
    p: 'Qualquer usuário ativo pode mandar aviso para todos. Muitos avisos do próprio app saem para “todos” por padrão, inclusive de Colaboradores; fechar quebraria avisos do EFCwork e do EFClaudian. PROPOSTA: não mexer. O risco é aviso indevido no sino, sem acesso a dado.',
    ref: [R.var, 'S1 (sv2_notifs).', R.var], vivo: V('inicio', null, false) }
];
module.exports = { R, GRUPOS, ITENS, img: 'img20', saida: 'docs/aprovacao-efcwork-v0.6.32-regras.html', titulo: 'EFCwork v0.6.32 · Regras do Firestore',
  h1: 'Regras do Firestore', topo: 'EFCwork v0.6.32', copia: 'Respostas EFCwork v0.6.32 · Regras do Firestore', chave: 'efcwork-v0632', jaFeito: 'Pronto (o 162 no app; as regras no arquivo para colar)',
  sub: 'As regras valem também para o EFClaudian. Cada regra é um item: o que você reprovar sai do arquivo antes de colar. Nenhuma coleção nova. A prova final é sua, no Simulador de regras do console (roteiro em GUIA-SIMULADOR-v0.6.32.md): o simulador do Firebase não roda aqui. ',
  fila: ['Depois: v0.6.33 Documentos do Vértice na remessa (cadeia de custódia na nuvem).', 'Com as respostas: tiro do arquivo o que for reprovado, te entrego o arquivo final para colar e publico o app (item 162) só com o seu “pode publicar”. As regras você cola no console; antes, copie as atuais para um arquivo.'] };
