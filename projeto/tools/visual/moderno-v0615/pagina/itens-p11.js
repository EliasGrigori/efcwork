/* Página v0.6.19 · Relatórios › Semana, portada do EFClaudian (Gestão da Qualidade › Semana e Relatórios da semana, v2.26.0). ITENS 79 a 88.
   HOJE = v0.6.18 publicada (Relatórios só tem a aba Rateio); PROPOSTA = o que já está no app (não publicado). */
const R = {
  efc: ['EFClaudian v2.102.60 (Relatórios da semana e Atividade por semana)', 'o app de hoje'],
  sap: ['SAP Fiori · tabelas densas: linhas horizontais, texto à esquerda, número à direita', 'https://www.sap.com/design-system/btp/dna-design/floorplans/table/usage'],
  mae: ['Maersk Design System · tabela larga em tela estreita: rolagem horizontal com sinal de que há mais colunas', 'https://designsystem.maersk.com/components/table/'],
  sco: ['Design System do governo da Escócia · tabela que rola: a primeira coluna fica fixa', 'https://designsystem.gov.scot/components/table'],
  gov: ['GOV.UK · tabelas: poucas colunas, texto curto na célula', 'https://gov.uk/guidance/content-design/tables']
};
const GRUPOS = { 79: 'Semana · onde fica e como filtra', 82: 'Semana · as quatro partes do relatório', 85: 'Semana · atividade, papel e aviso', 88: 'Semana · celular' };
const ISO = "S.apont = S.apont.filter(a => /^sa/.test(a.id)); S.cloro = S.cloro.filter(a => /^sc/.test(a.id)); S.coletas = S.coletas.filter(a => /^sk/.test(a.id)); S.aguacol = S.aguacol.filter(a => /^sw/.test(a.id)); S.almMov = S.almMov.filter(a => /^sm/.test(a.id)); S.audit = S.audit.filter(a => /^sx/.test(a.id)); render()";
const V = (extra) => Object.assign({ rota: 'relatorios/semana', feito: true, so: 'pc', passos: [['espera', 900], ['js', ISO, 700]] }, extra || {});
const ITENS = [
  { n: 79, t: 'Relatórios › Semana: a aba passa a existir',
    p: 'No EFClaudian a “Semana” tem duas partes: os Relatórios da semana (PDF com apontamentos da reunião, cloro, coletas e remessas, almoxarifado) e a tabela “Atividade por semana” (ações de cada pessoa, só para o Principal). Aqui as duas ficam numa aba só, Relatórios › Semana, ao lado do Rateio, sem coleção nova no Firebase (o Arquivar usa a sv2_resumos que já existe). Quem vê: Líder ★ e Principal, como no EFClaudian; a Atividade por pessoa e o Arquivar, só o Principal. Quem não pode, não vê a aba nem o endereço (a tela some). O Rateio continua pela atribuição Rateios.',
    ref: [R.efc, 'Mesma origem: Relatórios da semana (openRelSemana) e Atividade por semana (viewSemana).', R.sap],
    pares: [['pc', 'Relatórios no PC', false], ['cel', 'No celular', true]],
    vivo: V({ so: '' }) },
  { n: 80, t: 'Filtro em um botão só: Mostrar, Semana e Partes',
    p: 'Pela sua regra do filtro único: um botão “Filtro” com o resumo (“Relatório da semana · 16/11 a 22/11”) que abre um painel com Mostrar (Relatório da semana ou Atividade por pessoa), Semana (as últimas 12, “esta semana” marcada) e as quatro Partes com caixa de marcar. No EFClaudian a semana muda por setas ‹ › e as partes são escolhidas numa janela; aqui tudo fica no mesmo painel e a tela já mostra o que está marcado. Sem botão “Limpar filtro”. Esc fecha o painel.',
    ref: [R.efc, 'Mesmos recortes: semana e partes do PDF.', R.gov],
    pares: [['fil', 'Painel do filtro aberto', false]],
    vivo: V({ passos: [['espera', 900], ['js', ISO, 500], ['clica', '[data-act="sm-filtro"]', 700]] }) },
  { n: 81, t: 'Resumo no alto, em texto, sem caixas',
    p: 'Cinco números no alto, no mesmo estilo do Rateio (texto, linha fina ao lado, sem caixa nem cor de enfeite): apontamentos (com os pendentes antigos e os graves/urgentes), verificações de cloro (com as fora da faixa), coletadas (com as de água), enviadas e movimentações do almoxarifado. Os números seguem a semana escolhida.',
    ref: [R.efc, 'O EFClaudian só mostra a contagem no título de cada parte.', R.sap],
    pares: [['res', 'Resumo da semana', false]], vivo: V() },
  { n: 82, t: 'Parte 1: Apontamentos (reunião)',
    p: 'Os apontamentos da semana, do mais grave para o menos grave, e logo abaixo os pendentes de semanas anteriores (abertos ou em andamento). Colunas: data, setor, categoria, gravidade, situação, observação e NC (aberta, vencida ou fechada). Atenção: o EFClaudian agrupa a reunião por setor e traz um plano de ação das NCs; aqui entra a lista simples. O relatório completo de apontamentos (agrupado, com fotos) é outra aba de Relatórios, que vem depois. Aprovado = fica a lista simples por enquanto.',
    ref: [R.efc, 'Parte “Apontamentos — reunião” do PDF da semana.', R.sap],
    pares: [['ap', 'Apontamentos da semana e pendentes anteriores', false]], vivo: V() },
  { n: 83, t: 'Partes 2 e 4: Cloro e Almoxarifado',
    p: 'Cloro: todas as verificações da semana (data, hora, ponto, local, cloro em ppm, faixa e quem lançou); a faixa diz “Abaixo de 0,20”, “Acima de 2,00”, “Conforme” ou “Registro (caixa)”, e o cabeçalho conta quantas ficaram fora da faixa. Almoxarifado: as movimentações da semana (entradas, saídas, ajustes), com a quantidade, o lote, o motivo ou documento e quem lançou; movimentação anulada fica de fora. No EFClaudian o cloro também traz os velocímetros e o gráfico de 3 semanas; aqui entra só a tabela (os velocímetros já estão em Inspeções › Cloro).',
    ref: [R.efc, 'Partes “Verificações de cloro” e “Almoxarifado” do PDF da semana.', R.sap],
    pares: [['cl', 'Cloro e Almoxarifado', false]], vivo: V() },
  { n: 84, t: 'Parte 3: Coletas e remessas',
    p: 'Três listas: coletadas na semana (data, tipo, talhão ou local, análise, coletor, laboratório, se foi enviada), enviadas na semana (envio, tipo, análise, laboratório, O.S e o laudo previsto pelo prazo de cada laboratório) e, se houver, as coletas de água (ponto, análise, laboratório e resultado, com o agente e a gravidade quando não conforme). Uma amostra coletada numa semana e enviada em outra aparece só em “enviadas” da semana do envio. Quem vê a Semana sem ter a atribuição Coletas também carrega essas amostras.',
    ref: [R.efc, 'Parte “Coletas e remessas” do PDF da semana.', R.sap],
    pares: [['co', 'Coletadas, enviadas e água', false]], vivo: V() },
  { n: 85, t: 'Atividade por pessoa e Arquivar (só o Principal)',
    p: 'No filtro, Mostrar › Atividade por pessoa troca o relatório pela tabela do EFClaudian: semana, pessoa, ações, última ação e origem (“Ao vivo” ou “Arquivada”), com os menus de coluna de sempre (A-Z, busca, lista de valores, travar). O botão “Arquivar 2026-S47” guarda o resumo da semana mais recente para sempre (documento sem_AAAA-SNN em sv2_resumos, o mesmo do EFClaudian) e registra em Atividade. A semana arquivada continua aparecendo depois que o registro ao vivo sai da janela carregada. Só o Principal vê esta opção.',
    ref: [R.efc, 'Mesma tabela e mesmo Arquivar (arquivarSemana).', R.sap],
    pares: [['ativ', 'Atividade por pessoa com o filtro aberto', false]],
    vivo: V({ passos: [['espera', 900], ['js', ISO, 500], ['js', "S.sm.ver = 'ativ'; S.sm.aberto = true; render()", 700]] }) },
  { n: 86, t: 'Imprimir a semana',
    p: 'Botão de impressora no alto, como nas outras telas. Imprime só as partes marcadas no filtro, uma depois da outra, em A4 deitado como o EFClaudian, com a empresa e a data no topo, sem fundo colorido, e registra a impressão em Atividade. É o “Salvar em PDF” do EFClaudian, pelo diálogo de impressão do aparelho.',
    ref: [R.efc, 'PDF único da semana, uma parte depois da outra.', R.gov],
    pares: [['imp', 'A folha impressa', false]], vivo: V() },
  { n: 87, t: 'Aviso de sexta, 13h, no sino',
    p: 'Igual ao EFClaudian: de sexta às 13h até domingo, o Líder ★ e o Principal recebem uma única notificação por semana, “Salvar os relatórios da semana?”. Tocar nela abre Relatórios › Semana já na semana do aviso. Se a pessoa já recebeu o aviso do outro app, não recebe outro (mesmo tipo de notificação). Se você não quiser o aviso, diga: tiro e fica só o botão de imprimir.',
    ref: [R.efc, 'Notificação rel_semana, uma por semana.', R.gov],
    pares: [['sino', 'O aviso no sino', false]], vivo: V({ passos: [['espera', 900], ['js', ISO, 400], ['js', "smAviso(new Date('2026-11-20T14:00:00')); snAbrir()", 1200]] }) },
  { n: 88, t: 'Celular: tabelas rolam de lado dentro do cartão',
    p: 'No celular as tabelas são largas: cada uma rola para o lado dentro do seu cartão, sem a página inteira andar. Aprovado = fica assim, como está (é o jeito simples e igual para todas as partes). Reprovado = escondo no celular as colunas secundárias (hora, local, coletor, lote, “por”) para as outras caberem sem rolar, e você abre o detalhe quando precisar.',
    ref: [R.mae, 'Rolagem horizontal é o caminho simples; o sinal de que há mais colunas é o corte na borda.', R.sco],
    pares: [['cel', 'Semana no celular', true]], vivo: V({ so: '' }) }
];
module.exports = { R, GRUPOS, ITENS, img: 'img11', saida: 'docs/aprovacao-efcwork-v0.6.19-semana.html', titulo: 'EFCwork v0.6.19 · Relatórios › Semana',
  h1: 'Relatórios: a Semana', topo: 'EFCwork v0.6.19 · Semana', copia: 'Respostas EFCwork v0.6.19 · Semana', chave: 'efcwork-v0619-semana', jaFeito: 'Já está no app (v0.6.19, não publicada)',
  sub: 'A Semana do EFClaudian (relatórios da semana em PDF e atividade por pessoa), agora em Relatórios no EFCwork, sem coleção nova no Firebase. Já está no app, ainda não publicada. HOJE = como está no ar (v0.6.18); PROPOSTA = com a Semana. Dados inventados. ',
  semente: require('../../semana-v0619/semente.js').toString(),
  fila: ['Mais abas de Relatórios, uma por vez: Almoxarifado do mês, Documentos, Apontamentos (o relatório completo), Coletas em aberto.', 'Com os itens aprovados: aplico só o aprovado, numero a versão (v0.6.19), entrego o ZIP e publico só com o seu “pode publicar”.'] };
