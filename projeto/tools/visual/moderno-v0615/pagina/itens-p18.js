/* Página v0.6.30 · Backup. ITENS 153 a 156.
   HOJE = v0.6.29 publicada; PROPOSTA = o que já está no app (não publicado). */
const R = {
  mdn: ['MDN · showDirectoryPicker(): o site pede uma pasta e pode guardar a permissão', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker'],
  cdev: ['Chrome for Developers · File System Access API: guardar a pasta no IndexedDB e pedir a permissão de novo', 'https://developer.chrome.com/docs/capabilities/web-apis/file-system-access'],
  ciu: ['Can I use · File System Access: Chrome e Edge no computador; não no Android nem no iPhone', 'https://caniuse.com/native-filesystem-api'],
  fb: ['Firebase · exportar e importar o Firestore pelo console (backup oficial do banco, pago)', 'https://firebase.google.com/docs/firestore/manage-data/export-import'],
  falta: ['FALTA-DO-EFCLAUDIAN: “must · Backup e exportação · Administração · todas”', 'docs/FALTA-DO-EFCLAUDIAN.md']
};
const GRUPOS = { 153: 'Backup' };
const V = (rota, passos, extra) => Object.assign({ rota: rota, feito: true, so: 'pc', passos: passos || [['espera', 800]] }, extra || {});
const ITENS = [
  { n: 153, t: 'Administração › Backup: um arquivo com todos os registros',
    p: 'HOJE não há backup no EFCwork (o endereço cai em Empresa). PROPOSTA: aba nova Backup, só para o Administrador (para os outros a aba some). “Salvar backup” lê as 49 coleções do app e grava um arquivo efcwork-backup-AAAA-MM-DD-HHMM.json. O que a regra do Firebase não deixar ler não derruba o resto: aparece em “Sem leitura”. O painel ao lado mostra o último backup feito neste aparelho. Cada backup fica no registro de Atividade. Fica de fora: sv2_login e sv2_recup (ligações de acesso), e senha nenhuma vai no arquivo. Atenção: cada backup lê todos os documentos do banco, e cada leitura conta na cota do Firebase.',
    ref: [R.falta, 'Linha “must” da lista do que falta.', R.fb],
    pares: [['pc', 'No PC, antes de escolher a pasta', false]], vivo: V('adm/backup') },
  { n: 154, t: 'Pasta fixa: escolher uma vez, depois é um clique',
    p: 'O seu pedido: “é só clicar e salva automaticamente, só vou na pasta X”. No Chrome ou no Edge do computador você toca em “Escolher a pasta” uma vez (crie uma pasta só para isso, por exemplo Documentos › Backups EFCwork). O app guarda a pasta neste aparelho e, dali em diante, “Salvar backup” grava direto nela, sem janela. De vez em quando o Chrome pergunta de novo se pode gravar (é proteção dele; basta permitir). “Trocar a pasta” e “Esquecer a pasta” ficam ao lado. Se a pasta não responder, o arquivo vai para Downloads e a mensagem diz isso.',
    ref: [R.cdev, 'A pasta pode ser guardada e a permissão pedida de novo num clique.', R.mdn],
    pares: [['pasta', 'Depois de escolher a pasta e salvar', false]], vivo: V('adm/backup') },
  { n: 155, t: 'No celular: o backup vai para Downloads',
    p: 'O Chrome do Android e o Safari do iPhone não deixam um site guardar uma pasta. No celular a tela não mostra o “Escolher a pasta”; diz que o arquivo vai para Downloads, que é sempre o mesmo lugar. Botões lado a lado com a mesma largura.',
    ref: [R.ciu, 'Sem suporte no Android e no iPhone.', R.ciu],
    pares: [['cel', 'No celular', true]], vivo: V('adm/backup', null, { so: 'cel' }) },
  { n: 156, t: 'Fotos: só quando você marcar',
    p: 'As fotos (relatos, água, cloro, almoxarifado, avatares e bugs) deixam o arquivo muitas vezes maior. Por isso ficam fora, a não ser que você marque “Incluir as fotos”. Decisão sua: se preferir com as fotos sempre, escreva no comentário.',
    ref: [R.falta, 'Mesma lista de coleções das regras do Firestore.', R.falta], vivo: V('adm/backup') }
];
module.exports = { R, GRUPOS, ITENS, img: 'img18', saida: 'docs/aprovacao-efcwork-v0.6.30-backup.html', titulo: 'EFCwork v0.6.30 · Backup',
  h1: 'Backup', topo: 'EFCwork v0.6.30', copia: 'Respostas EFCwork v0.6.30 · Backup', chave: 'efcwork-v0630', jaFeito: 'Já está no app (v0.6.30, não publicada)',
  sub: 'Backup de todos os registros num arquivo, com a pasta fixa que você pediu. Nenhuma coleção nova e nenhuma mudança nas regras do Firestore. Ainda sem “restaurar” (voltar um backup para a nuvem): fica para uma versão própria, se você quiser. HOJE = como está no ar (v0.6.29). ',
  fila: ['Próximo da fila: Regras do Firestore (v0.6.31).', 'Com os itens aprovados: aplico só o aprovado, entrego o ZIP e publico só com o seu “pode publicar”. Teste no seu Chrome: escolher a pasta, salvar, fechar o app, abrir de novo e salvar outra vez (deve gravar na mesma pasta sem janela).'] };
