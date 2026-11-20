/* Página v0.6.29 · Acesso e senha. ITENS 147 a 152.
   HOJE = v0.6.28 publicada; PROPOSTA = o que já está no app (não publicado). */
const R = {
  owf: ['OWASP · Forgot Password Cheat Sheet: recuperar por link enviado a um e-mail cadastrado antes', 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html'],
  owa: ['OWASP · Authentication Cheat Sheet: tamanho mínimo da senha exigido pelo app', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],
  nist: ['NIST SP 800-63B (rev. 4) · senhas', 'https://pages.nist.gov/800-63-4/sp800-63b/authenticators'],
  owx: ['OWASP · XSS Prevention Cheat Sheet: endereço em href só com esquema permitido', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
  var: ['Varredura de 20/11 (S2, S3, S5, C4)', 'RELATORIO-VARREDURA-EFCwork-v0.6.28.md'],
  efc: ['EFClaudian v2.74.0: ligação login → e-mail (sv2_login) e precisaCompletar', 'o mesmo Firebase']
};
const GRUPOS = { 147: 'Acesso e senha' };
const V = (rota, passos, extra) => Object.assign({ rota: rota, feito: true, so: 'pc', passos: passos || [['espera', 800]] }, extra || {});
const ITENS = [
  { n: 147, t: '“Esqueci a senha” passa a funcionar',
    p: 'HOJE o link só dizia “Peça ao Administrador”, mas o Administrador não tem como trocar a senha de outra pessoa. PROPOSTA: abre “Esqueci a senha” na mesma caixa do Entrar, com o usuário já preenchido. Pelo usuário, o app acha o e-mail cadastrado e o Firebase manda o link para criar a senha nova (o e-mail aparece escondido, j***@exemplo.com). Sem e-mail cadastrado, diz isso e manda falar com o Administrador. Voltar, Esc e o voltar do celular levam de volta ao Entrar. Decisão sua: a OWASP recomenda a mesma frase para quem tem e quem não tem conta; hoje a mensagem diz quando o usuário não tem e-mail (mais útil para a equipe, mas mostra que o login existe). Se preferir a frase única, escreva no comentário. Junto: o olho do campo Senha passou a ter a altura do campo (era 42 px fixo).',
    ref: [R.owf, 'Link de uso único, mandado ao e-mail cadastrado.', R.var],
    pares: [['pc', 'No PC, depois de tocar em Enviar o link', false], ['cel', 'No celular', true]],
    vivo: V('inicio', [['espera', 600], ['js', 'Data.auth.signOut()', 900], ['clica', '[data-act="en-esqueci"]', 600]]) },
  { n: 148, t: 'A pessoa nova cria a própria senha no primeiro acesso',
    p: 'HOJE quem é cadastrado em Pessoas entra com a senha inicial e fica com ela (o Administrador sabe a senha). PROPOSTA: o cadastro grava precisaCompletar; no primeiro acesso aparece “Crie a sua senha” antes do app: senha nova (diferente da inicial, no mínimo 8), repetir e, opcional, o e-mail para recuperar. Sair volta ao Entrar. Quem já tem conta não vê esta tela. O campo precisaCompletar é o mesmo do EFClaudian: se a pessoa entrar primeiro lá, o EFClaudian também pede para completar.',
    ref: [R.efc, 'Mesmo campo e mesmas regras do Firestore (o próprio usuário pode mudar).', R.owa],
    pares: [['pc', 'No PC', false], ['cel', 'No celular', true]],
    vivo: V('inicio', [['espera', 600], ['js', 'S.user.precisaCompletar=true;render()', 600]]) },
  { n: 149, t: 'Meu perfil: e-mail para recuperar a senha',
    p: 'Painel novo embaixo de Meus dados. Mostra se há e-mail confirmado, se está esperando a confirmação ou se não há nenhum. Ao salvar, o Firebase manda um link de confirmação e o e-mail só vale depois do clique (assim um erro de digitação não entrega a conta a outra pessoa). O app grava a ligação login → e-mail em sv2_login, a mesma do EFClaudian, sem apagar o que já está nela.',
    ref: [R.efc, 'sv2_login: o próprio dono grava; qualquer um lê só pelo login exato.', R.owf],
    pares: [['mp', 'Administração › Meu perfil', false]], vivo: V('adm/perfil') },
  { n: 150, t: 'Nova pessoa: senha inicial escondida e com no mínimo 8',
    p: 'HOJE a senha inicial aparece em texto aberto e aceita 6 caracteres, enquanto o primeiro acesso do Administrador pede 8. PROPOSTA: campo escondido com o olho para mostrar, e 8 caracteres em todo lugar (cadastro, Meu perfil e primeiro acesso). Contas antigas com senha menor continuam entrando; a regra vale para senha nova. Para saber: a revisão 4 da NIST pede 15 caracteres quando a senha é a única proteção; 8 é o mínimo quando há um segundo fator. Se quiser 15, diga no comentário.',
    ref: [R.nist, '8 no mínimo; 15 para senha sem segundo fator.', R.owa],
    pares: [['gv', 'Administração › Pessoas › Nova pessoa', false]], vivo: V('adm/pessoas', [['espera', 600], ['js', 'pesNovo()', 500]]) },
  { n: 151, t: 'Impresso tipo link: só abre se for https',
    p: 'HOJE o app só confere o https:// na hora de gravar; um endereço gravado por fora (pela API, por exemplo javascript:…) virava link clicável e o botão “Abrir o link”, e o clique rodaria código dentro do app. PROPOSTA: o endereço só vira link se começar com https://; senão aparece como texto, com o aviso para corrigir no lápis, e sem o botão.',
    ref: [R.owx, 'Em href, só esquemas permitidos.', R.var],
    pares: [['gv', 'Documentos › Impressos, link gravado por fora', false]],
    vivo: V('documentos/impressos', [['espera', 600], ['js', "Data.col('efd_docs').set('ipx',{v:1,tipo:'link',nome:'Norma do cliente',codigo:'NOR-04',link:'javascript:alert(1)',pasta:'Geral',status:'vigente',alteradoEm:nowISO(),alteradoPor:'Carlos Dias'})", 500], ['js', "ipAbre('ipx')", 600]]) },
  { n: 152, t: 'Aviso do apontamento sem travessão',
    p: 'Os últimos “ — ” que sobraram (ITEM 79). O aviso no sino do apontamento grave ou urgente passa de “Apontamento URGENTE: Acidente — Packing House” para “Apontamento URGENTE: Acidente · Packing House”, e o registro de atividade de “… em Packing House — Piso molhado” para “… em Packing House: Piso molhado”. Só texto.',
    ref: [R.var, 'C4 da varredura.', R.var],
    vivo: V('inspecoes/apontamentos') }
];
module.exports = { R, GRUPOS, ITENS, img: 'img17', saida: 'docs/aprovacao-efcwork-v0.6.29-acesso.html', titulo: 'EFCwork v0.6.29 · Acesso e senha',
  h1: 'Acesso e senha', topo: 'EFCwork v0.6.29', copia: 'Respostas EFCwork v0.6.29 · Acesso e senha', chave: 'efcwork-v0629', jaFeito: 'Já está no app (v0.6.29, não publicada)',
  sub: 'Os quatro achados de acesso da varredura de 20/11: recuperar a senha, a pessoa nova criar a dela, a mesma regra de tamanho em todo lugar e o link do impresso. Nenhuma coleção nova e nenhuma mudança nas regras do Firestore. HOJE = como está no ar (v0.6.28). ',
  fila: ['Próximo da fila: Backup e exportação (v0.6.30).', 'Com os itens aprovados: aplico só o aprovado, entrego o ZIP e publico só com o seu “pode publicar”. No Firebase: conferir se o modelo de e-mail de redefinição de senha está ativo em Authentication.'] };
