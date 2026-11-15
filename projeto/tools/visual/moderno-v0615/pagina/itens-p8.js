/* Página v0.6.16 · Qualidade › Não conformidades e Bugs e sugestões, portadas do EFClaudian (ITENS 54 a 60).
   HOJE = v0.6.15.3 publicada (a aba mostra "Esta área está sendo refeita"); PROPOSTA = o que já está no app (não publicado). */
const R = {
  reg: ['Auditor Training Online · ISO 9001, cláusula 10.2 (registro de NCs)', 'https://blog.auditortrainingonline.com/blog/iso-9001-clause-10.2-nonconformity-and-corrective-action'],
  aud: ['Open Exam Prep · o que o auditor líder pede na cláusula 10.2', 'https://open-exam-prep.com/study-guides/cqi-irca-qms-lead-auditor/clauses-9-10/clause-10-improvement'],
  ybug: ['Ybug · como escrever um relato de problema', 'https://blog.ybug.io/how-to-write-a-bug-report'],
  nolt: ['Nolt · modelos de relato de problema', 'https://nolt.io/blog/bug-report-templates'],
  efc: ['EFClaudian v2.102.41 a v2.102.50 (aba Não conformidades) e v2.80 a v2.92 (Bugs e sugestões)', 'o app de hoje']
};
const GRUPOS = { 54: 'Qualidade › Não conformidades', 57: 'Qualidade › Bugs e sugestões' };
const ITENS = [
  { n: 54, t: 'Não conformidades numa tabela só (apontamentos e auditorias)',
    p: 'Hoje a aba mostra “Esta área está sendo refeita” e manda para o EFClaudian. Proposta: a mesma lista do EFClaudian, no padrão das tabelas do EFCwork. Junta as NCs abertas nos apontamentos e as da auditoria interna (depois de enviar a RNC), em grupos Vencidas, Abertas e Fechadas, a mais atrasada primeiro. Colunas: Prazo (em vermelho quando venceu; parando o mouse diz há quantos dias), Situação (com o retorno da auditoria, ex.: Parcial), Origem (Apontamento ou RNC 03 · NC 05), Local, Não conformidade, Gravidade e Responsável. Corresponsáveis, Prioridade GUT e Tratamento ficam em Colunas, desligadas. O filtro é o menu de cada coluna (ex.: Responsável = Josineldo). Nada novo no Firebase: a tela só lê.',
    ref: [R.reg, 'O registro de NCs traz responsável, data e prazo de cada uma, para acompanhar até fechar.', R.efc],
    pares: [['pc', 'Qualidade › Não conformidades no PC', false], ['cel', 'No celular', true]],
    vivo: { rota: 'qualidade/nc', feito: true } },
  { n: 55, t: 'A linha abre a NC por cima, com as ações de sempre',
    p: 'Tocar numa linha abre a gaveta da origem por cima da tabela, sem sair da Qualidade: a do apontamento (Resolver, Fechar NC, Mudar gravidade) ou a da NC da auditoria (Análise, Conferir o retorno). É a mesma gaveta de Inspeções; nada foi duplicado. Fechou a NC, a linha vai para Fechadas na hora. Esc volta uma camada.',
    ref: [R.aud, 'O auditor confere a NC até o fim: correção, causa, ação e eficácia. Por isso a ação fica onde a NC nasceu.', R.efc],
    pares: [['gav', 'HOJE: só por Inspeções › Apontamentos · PROPOSTA: a mesma gaveta, aberta pela Qualidade', false]],
    vivo: { rota: 'qualidade/nc', feito: true, so: 'pc', passos: [['espera', 900], ['js', "nqAbre('ap|apN1')", 1200]] } },
  { n: 56, t: 'Folha por pessoa, com o ciente',
    p: 'Como no EFClaudian: escolha a pessoa e quais NCs (abertas, só as vencidas, fechadas ou todas). Entram as NCs em que ela é responsável ou corresponsável. A folha sai em A4 em pé, com o papel de cada NC e a linha “ciente em ___/___/______” para assinar. Se a coluna Responsável estiver filtrada numa pessoa, a janela já abre com ela.',
    ref: [R.reg, 'Cada responsável recebe as ações dele com prazo; a assinatura registra que ficou sabendo.', R.efc],
    pares: [['jan', 'A janela', false], ['folha', 'A folha impressa (A4 em pé)', false]],
    vivo: { rota: 'qualidade/nc', feito: true, so: 'pc', passos: [['espera', 900], ['clica', '[data-act="nq-folha"]', 900]] } },
  { n: 57, t: 'Bugs e sugestões numa tabela, com o que está em aberto primeiro',
    p: 'Hoje a aba manda para o EFClaudian. Proposta: os mesmos relatos (os do EFClaudian aparecem aqui também), em grupos Em aberto, Resolvidos e Não procede, do mais novo para o mais antigo. Colunas: Nº, Tipo, Título (com o clipe quando há imagem), Parte do app, Quem, Data e Situação (com a versão em que foi resolvido). O Administrador vê quantos relatos novos ainda não olhou. Dois botões: Sugerir melhoria e Reportar problema. No celular os nomes encurtam para caber (Sugestão e Problema).',
    ref: [R.nolt, 'Cada relato com número, quem mandou e a situação, para acompanhar até resolver.', R.efc],
    pares: [['pc', 'Qualidade › Bugs e sugestões no PC', false], ['cel', 'No celular', true]],
    vivo: { rota: 'qualidade/bugs', feito: true } },
  { n: 58, t: 'Reportar um problema em 3 passos',
    p: 'Qualquer pessoa reporta. Passo 1: tipo (Problema ou Sugestão) e a parte do app, que já vem com a tela onde a pessoa estava antes. Passo 2: título curto e o passo a passo (o que fez, o que apareceu, o que esperava). Passo 3: uma imagem opcional (print ou foto), reduzida até 240 KB como no EFClaudian. O app anota sozinho a versão, o app (EFCwork), a tela e o aparelho. O Administrador recebe o aviso no sino.',
    ref: [R.ybug, 'Um bom relato traz a tela, o passo a passo, o que se esperava, o que aconteceu e um print.', R.nolt],
    pares: [['jan', 'HOJE: só no EFClaudian · PROPOSTA: a janela aqui', false]],
    vivo: { rota: 'qualidade/bugs', feito: true, so: 'pc', passos: [['espera', 900], ['clica', '[data-act="bs-novo"][data-id="bug"]', 900]] } },
  { n: 59, t: 'O Administrador responde, e quem reportou é avisado',
    p: 'O relato abre na gaveta com a descrição, a imagem (amplia ao tocar), os dados anotados e o andamento em linha do tempo. Só o Administrador muda a situação: Em análise, Não procede (motivo obrigatório) ou Resolvido (com a versão; num relato do EFCwork ela já vem preenchida). Depois de fechado, aparece Reabrir. Cada mudança vira um passo no andamento (nada se apaga) e quem reportou recebe o aviso no sino.',
    ref: [R.nolt, 'Quem reporta precisa saber o que aconteceu com o relato; a resposta fecha o ciclo.', R.efc],
    pares: [['gav', 'O relato na gaveta', false], ['res', 'Resolvido: versão e resposta', false]],
    vivo: { rota: 'qualidade/bugs', feito: true, so: 'pc', passos: [['espera', 900], ['js', "bsAbre('b2')", 1300]] } },
  { n: 60, t: 'Relatório dos relatos para mandar para a IA',
    p: 'Como o “Relatório PDF” do EFClaudian: o ícone da impressora no cabeçalho imprime os relatos que estão na tabela (respeita o filtro das colunas), em A4 deitado, com a descrição, o andamento, os dados e a imagem de cada um. Serve para mandar para a IA avaliar e corrigir. A impressora da barra da tabela continua imprimindo só a tabela.',
    ref: [R.ybug, 'Com o passo a passo, a versão e a imagem juntos, quem corrige não precisa perguntar de novo.', R.efc],
    pares: [['folha', 'O relatório (A4 deitado)', false]],
    vivo: { rota: 'qualidade/bugs', feito: true, so: 'pc' } }
];
module.exports = { R, GRUPOS, ITENS, img: 'img8', saida: 'docs/aprovacao-efcwork-v0.6.16-qualidade.html', titulo: 'EFCwork v0.6.16 · Não conformidades e Bugs e sugestões',
  h1: 'Qualidade: Não conformidades e Bugs e sugestões', topo: 'EFCwork v0.6.16 · Qualidade', copia: 'Respostas EFCwork v0.6.16 · Qualidade', chave: 'efcwork-v0616-qualidade', jaFeito: 'Já está no app (v0.6.16, não publicada)',
  sub: 'As duas abas da Qualidade que ainda mandavam para o EFClaudian, agora no EFCwork, com os mesmos dados (nada novo no Firebase). Já estão no app, ainda não publicadas. HOJE = como está no ar (v0.6.15.3); PROPOSTA = com a aba nova. Dados inventados. ',
  semente: require('../../qualidade-v0616/semente.js').toString(),
  fila: ['Com os itens aprovados: numero a versão (v0.6.16), entrego o ZIP e publico só com o seu “pode publicar”.', 'Itens reprovados saem do pacote antes.', 'Próximas telas do EFClaudian (lista FALTA): Rateios, Relatórios (Semana, Almoxarifado do mês, Documentos), Pessoas e perfis, Backup, Conversas.'] };
