# O que ainda falta trazer do EFClaudian para o EFCwork (conferido em 15/11/2026; atualizado às 16h: v0.6.17 Rateios publicada; v0.6.18 Relatórios › Rateio publicada)

Processo de refazer o EFClaudian no EFCwork: cada função do original está na matriz `features.csv` (must = precisa ter, should = deveria ter, could = pode ter). Conferi abrindo cada área do app (v0.6.15 em andamento) e procurando cada função no código. 20 linhas da matriz estavam como "não feito" mas já existem; atualizei a matriz.

## A. Telas inteiras que ainda não existem no EFCwork (conferido abrindo o app)

> **Feitas e PUBLICADAS na v0.6.16 (15/11, commit 97c1d41):** Qualidade › Não conformidades (com a folha por pessoa) e Qualidade › Bugs e sugestões (com o relatório). Saíram da tabela abaixo.
> **Feita e publicada na v0.6.18 (15/11; ITENS 70 a 77 aprovados, 78 reprovado):** Relatórios › Rateio = Painel do rateio do EFClaudian (água: 8 quadros; campo: 7), só leitura, `relatorios.js`. Ficam de fora, por já terem casa no EFCwork: Andamento dos planos de coleta e Bebedouros há mais tempo sem coleta (ITEM 75).
> **Feita e publicada na v0.6.17 (15/11; ITENS 61 a 69 aprovados):** Rateios › Campo, Água e Calibração numa tabela só + Emitir solicitação de compra (rateio.js; dados sv2_coletas, sv2_aguacol, sv2_alm_cal). Saiu da tabela. O Painel continua abaixo (vai para Relatórios).
| Prioridade | Do EFClaudian | Vai para | Dados (Firebase) |
|---|---|---|---|
| must | Gestão da Qualidade › Relatórios | Relatórios (Documentos, Almoxarifado do mês, Apontamentos, Coletas em aberto; o Rateio já está na v0.6.18) | — |
| must | Gestão da Qualidade › Semana | Relatórios › Semana (relatório semanal) | sv2_resumos (não usada ainda) |
| must | Almoxarifado › Apresentação | Relatórios › Almoxarifado do mês | sv2_alm_* |
| must | Documentos › Relatório | Relatórios › Documentos (gráficos) | sv2_docs, sv2_lanc |
| must | Gestão da Qualidade › Equipe + Usuários, Detalhe da pessoa, Meu perfil | Administração › Pessoas | sv2_users |
| must | Perfis "Só ver" / "Ver e alterar" por área | Administração › Pessoas | sv2_users |
| must | Gestão da Qualidade › Conversas (chat) | Dentro de cada registro + sino | sv2_chat (não usada ainda) |
| must | Backup e exportação | Administração | todas |
| should | Gestão da Qualidade › Meu dia (tarefas) | Início (hoje o EFCwork só lê as tarefas) | sv2_tarefas |

## B. Partes de telas que ainda ficam no EFClaudian
O próprio app avisa (texto das áreas) ou a janela do EFClaudian não tem nada parecido no EFCwork.

**Coletas**
- Etiquetas e revisão de etiquetas (sv2_etqmodelos, não usada ainda); fichas de campo e "Preparar folha de campo" (coletas avulsas).
- Cadastros: talhões, análises, laboratórios, tipos e fazendas (no EFCwork só se leem; criar, editar e desativar seguem no EFClaudian). Só "Pontos de água" já é feito aqui.
- Plano de rodízio: criar/editar o plano e "Histórico do ano".
- Etiqueta da caixa d'água (Água).

**Almoxarifado**
- Cadastro de material (novo/editar) e fotos do material; kits; configuração do almoxarifado.
- Cadastro de equipamento (novo/editar) e eventos do equipamento.
- Reajustar preços; vidraria quebrada e relatório de quebras por pessoa; transferências (sv2_alm_transf, não usada ainda).

**Documentos**
- Normas e editais (norma, itens, checklist); documento controlado; arquivo por ano; pedir revisão de processo (sv2_proc, não usada ainda).

**Qualidade / Geral**
- Conquistas (medalhas e níveis) e os 16 temas + fundos de campo: marcados "skip" na matriz (não trazer, salvo pedido).
- Cobrar pendência (janela "Cobrar"), cadastro recorrente.

## C. Outras pendências (não são do EFClaudian)
- **Vértice Docs:** Ponte 1 (v0.6.11) e Ponte 2 (v0.6.13). A IA do Vértice mandou em 14/11 o pacote `integracao-cwork-vertice-v0.6.18.zip` (LEIA-ME, PROGRESSO, ESTADO, MEMORIA): falta ler e encaixar.
- **Sabiá:** entrega do resumo do treinamento pela caixa de troca (Plano de integração v2).
- **Decisão do Elias:** nova coleta pedida no rodízio precisa da aprovação do Líder/Principal? (OPÇÃO A sim / B não).
- **Fluidez (propostas do Grok P5 a P9):** página `aprovacao-efcwork-v0.6.15-fluidez.html` sem resposta (o Elias achou fraca; refazer com o app de verdade se for seguir).
- **Pedidos de 14/11 (memória):** tabela com só a tabela rolando e o cabeçalho das colunas fixo; totais sem caixa, na letra pequena das etiquetas do cabeçalho; mesma fluidez ao trocar abas internas.
- **Observações do Grok sem mexer:** Pareto inclui "Outro"; coluna Prazo da Programação vazia; busca não acha plano de coleta nem erro de digitação; ordem do Apresentar da Auditoria.
- **Mandar ao Grok:** roteiros v0.6.14.1 e v0.6.14.2 (e o da v0.6.15 e v0.6.16 quando ele pedir).
