/* Itens da página de modernização · parte 2 (ITENS 16 a 21). 16–18 são propostas; 19–21 já estão no app (v0.6.15, não publicada). */
const path = require('path');
const R = {
  nng: ['Nielsen Norman Group · telas vazias em aplicativos', 'https://www.nngroup.com/articles/empty-state-interface-design/'],
  guia: ['Vercel · Web Interface Guidelines', 'https://vercel.com/design/guidelines'],
  mov: ['Atlassian Design · Movimento', 'https://atlassian.design/foundations/motion'],
  grok: ['Mapa de fluidez do Grok (14/11), linhas 10 e 15', 'docs/CAIXA-DO-GROK-2026-11-14-v069-a-v06141-e-fluidez.md'],
  paleta: ['SaaS UI · busca e paleta de comandos', 'https://www.saasui.design/blog/saas-search-command-palette-ux-patterns'],
  par: ['JMP · gráfico de Pareto', 'https://www.jmp.com/en/statistics-knowledge-portal/exploratory-data-analysis/pareto-chart']
};
const GRUPOS = { 16: 'Propostas novas (resto da P9 do Grok e o carregamento)', 19: 'Já feito no app: confira e responda' };
const ITENS = [
  { n: 16, t: 'Esqueleto de carregamento no lugar de “Nada encontrado.”',
    p: 'Quando a internet está lenta, a tabela abre vazia e diz “Nada encontrado.” antes de os dados chegarem, e a pessoa acha que não há registro. Proposta: enquanto a primeira leitura não chega, a tabela mostra linhas cinzas que pulsam de leve e “Carregando…”; o total fica em branco em vez de “R$ 0,00”. Quando os dados chegam, as linhas cinzas saem e o pulso para.',
    ref: [R.nng, 'Uma mensagem de “não há itens” mostrada antes de o sistema terminar de buscar engana quem está usando.'],
    pares: [['pc', 'PC · Coletas › Amostras com a internet lenta']],
    vivo: { rota: 'coletas/amostras', dica: 'A demonstração imita a internet lenta por 2,5 s. Compare HOJE e PROPOSTA.', passos: [['espera', 500], ['js', "moSimulaCarga(2500,'coletas')"], ['espera', 3400], ['js', "moSimulaCarga(2500,'coletas')"]] } },
  { n: 17, t: 'Gota da linha do tempo: um brilho curto',
    p: 'Ao abrir o detalhe de uma amostra, coleta, calibração ou apontamento, o líquido da gota tem um brilho de 1,5 s que passa 2 vezes (3 s no total), a cada abertura. Proposta: um brilho só, de 0,5 s. A gota continua enchendo do mesmo jeito.',
    ref: [R.mov, 'Movimento que passa de meio segundo atrasa quem está trabalhando; o Grok marcou este como o brilho mais longo do app.'],
    tempo: { hoje: 3000, prop: 500, leg: 'Tempo do brilho a cada abertura' },
    vivo: { rota: 'coletas/amostras', dica: 'Olhe o tubo dourado à esquerda da linha do tempo.', passos: [['espera', 400], ['js', "S._cbNivel={}"], ['clica', '.tb tbody tr[data-act="tb-lin"]:nth-child(5)'], ['espera', 3600], ['tecla', 'Escape'], ['espera', 700], ['js', "S._cbNivel={}"], ['clica', '.tb tbody tr[data-act="tb-lin"]:nth-child(6)']] } },
  { n: 18, t: 'Sino: os avisos entram em sequência, mais rápido',
    p: 'Ao abrir o sino, os avisos entram um depois do outro (60 ms entre eles, 400 ms cada). Com 12 avisos, o último só termina de entrar em cerca de 1,1 s. Proposta: a sequência para no 6º aviso (os de baixo entram juntos) e cada um leva 250 ms; o conjunto termina em cerca de 450 ms.',
    ref: [R.grok, 'Com muitos avisos a lista passa de 600 ms; a sugestão foi encurtar.'],
    tempo: { hoje: 1060, prop: 450, leg: 'Tempo até o último aviso aparecer (12 avisos)' },
    vivo: { rota: 'inicio', so: 'pc', passos: [['espera', 500], ['clica', '[data-act="cs-sino"]'], ['espera', 1800], ['tecla', 'Escape'], ['espera', 900], ['clica', '[data-act="cs-sino"]']] } },
  { n: 19, t: 'Rodízio: nova coleta só vale com a aprovação do Líder ★ ou do Principal',
    p: 'Sua regra de hoje (10h). Pedido de nova coleta feito por quem não é Líder ★ nem Principal (o EFClaudian deixa o secundário liberar direto) fica esperando: a coleta já feita continua valendo, e lançar outra na área é barrado com o aviso. Aprovar e Recusar ficam no plano de coleta (Ajustes › Recoletas) e no sino; recusar pede o motivo; quem pediu recebe aviso; nada é apagado. No exemplo, o Giovane (sem ★) pediu JD07 e JD08; o Marcos (★) liberou JD06, que vale na hora.',
    ref: [R.guia, 'O controle diz exatamente o que acontece: “Aprovar” e “Recusar”, com o motivo da recusa escrito.'],
    pares: [['pc', 'Cartão do plano na Programação: HOJE as três áreas viram “falta”; com a regra, JD07 e JD08 continuam coletadas, com o relógio de espera'], ['pc2', 'Plano › Ajustes › Recoletas']],
    vivo: { rota: 'coletas/plano/rz1', feito: true, dica: 'Abra Ajustes e use Aprovar ou Recusar. Ou toque no sino.', passos: [['espera', 500], ['clica', '[data-act="pp-aba"][data-v="aj"]']] } },
  { n: 20, t: 'Busca acha plano de coleta e palavra com erro de digitação',
    p: 'A busca do alto passa a achar o plano de coleta (pelo tipo, ano ou uma área, como “jd08”) e a aceitar uma letra trocada, faltando ou sobrando a partir de 5 letras (duas a partir de 8). Exemplo do Grok: “desemcapado” agora acha “desencapados”. Palavra curta com erro não acha, para não encher de resultado errado.',
    ref: [R.paleta, 'A busca precisa tolerar erro de digitação e alcançar o que a pessoa procura em qualquer área.'],
    pares: [['pc', 'Buscando “desemcapado”'], ['pc2', 'Buscando “jd08”']],
    vivo: { rota: 'inicio', feito: true, dica: 'Aperte / ou Ctrl K dentro do app e escreva com um erro.', passos: [['js', 'bgAbrir()'], ['espera', 500], ['digita', '#bg-q', 'desemcapado'], ['espera', 2200], ['js', "document.getElementById('bg-q').value='';"], ['digita', '#bg-q', 'jd08']] } },
  { n: 21, t: 'Pareto: “Outro” sempre no fim e fora dos poucos vitais',
    p: 'Hoje “Outro” entra na ordem pelo tamanho e pode virar a primeira causa, o que não ajuda a decidir nada. Agora “Outro” e “sem setor” vão sempre para o fim, nunca entram nos “poucos vitais”, e o corte de 80% conta só as causas de verdade. As porcentagens acumuladas continuam sobre o total.',
    ref: [R.par, 'Ao juntar causas pequenas em “Outro”, a boa prática é deixar essa barra por último.'],
    pares: [['pc', 'Pareto dos apontamentos (90 dias)', 1]],
    vivo: { rota: 'inspecoes/apontamentos', feito: true, passos: [['espera', 400], ['clica', '[data-act="ap-pareto"]']] } }
];
module.exports = { R, GRUPOS, ITENS, img: 'img2', saida: 'docs/aprovacao-efcwork-v0.6.15-moderno-parte2.html', titulo: 'EFCwork v0.6.15 · Modernização, parte 2',
  h1: 'Modernização, parte 2', topo: 'EFCwork v0.6.15 · parte 2', copia: 'Respostas EFCwork v0.6.15 · modernização (parte 2)', chave: 'efcwork-v0615-moderno-p2',
  sub: 'Continuação da parte 1 (itens 1 a 15), que segue valendo. ', semente: require('./semente-p2.js').toString(),
  fila: ['Aplicar no app o que for aprovado nas partes 1 e 2, com teste de cada item, e montar a página final da v0.6.15 antes de publicar.', 'O que você pedir nos comentários desta página.'] };
