# Roteiro do Grok — EFCwork v0.2.0 (Almoxarifado para consulta)

**O que é:** o Almoxarifado do EFCwork só para CONSULTA (Painel, Materiais, Movimentações, Solicitações e Equipamentos), com a tabela padrão nova, a gaveta de detalhe, planilha, impressão e a busca geral. Lançar (entrada, saída, kit, contagem) continua no EFClaudian até a v0.3.
**Testar sem tocar em dados reais:** endereço com `?demo=1`.

## NÃO SÃO DEFEITOS
- Nenhum botão de entrada/saída no EFCwork: nesta versão é só consulta (o aviso "Consulta · lançar continua no EFClaudian até a v0.3" aparece no cabeçalho).
- A tela de entrar e o celular continuam os da v0.1.0 (o Elias vai trazer modelos novos).
- O sino ainda responde "chega na v0.2" → agora "na v0.3".

## Bloco A — Números batem com o EFClaudian (conta real, só olhar)
A1. Abra o EFClaudian e o EFCwork lado a lado. Para 5 itens quaisquer, compare o "Utilizável" do EFCwork com o saldo utilizável do EFClaudian. **Esperado:** iguais.
A2. Almoxarifado › Painel: "Pedem atenção" e "Valor em estoque". Compare com o Painel do EFClaudian. **Esperado:** iguais (o EFCwork conta lote vencido, sem saldo, abaixo do mínimo e vencendo em 30 dias).
A3. Equipamentos: compare 3 calibrações (vencida, a vencer em 40 dias, em dia) com o EFClaudian.

## Bloco B — Tabela padrão (PC 1366 px)
B1. Materiais: busca sem acento ("agua" acha "Água"). Filtro: um botão só; abre um painel com Situação e Local em janelas retráteis; o resumo aparece no botão.
B2. Clique no cabeçalho "Utilizável": ordena; clique de novo: inverte; de novo: volta.
B3. Ícone de colunas: esconda "Código"; recarregue: continua escondida. Não deixa esconder todas.
B4. Ícone de planilha: baixa EFCwork-materiais-<data>.xlsx; abrir no Excel: colunas visíveis, linhas filtradas, números como número.
B5. Ícone da impressora: folha A4 deitada só com a tabela, título, empresa e data.
B6. Rodapé: total de Utilizável e de Valor; "Mostrando X de Y".

## Bloco C — Gaveta
C1. Clique numa linha: a gaveta abre à direita com situação, utilizável/mínimo/valor, lotes com saldo e as últimas movimentações. A linha fica marcada.
C2. Esc ou o X fecham. Trocar de aba fecha.
C3. Solicitação com item não cadastrado mostra "ainda não cadastrado". Equipamento mostra a calibração e o local.

## Bloco D — Busca geral
D1. Tecla / (fora de campo de texto), Ctrl+K ou a lupa do topo abrem a busca.
D2. Vazia: "Voltar para" e "Mais usadas". Digite parte do nome de um material: aparece em "Materiais"; Enter abre Materiais com a gaveta do item.
D3. Digite a TAG de um equipamento e o nome de uma tela ("movimenta").
D4. Entre com alguém SEM a atribuição Almoxarifado: a área mostra "Você não tem acesso…" e a busca não mostra materiais.

## Bloco E — Início
E1. Com acesso ao Almoxarifado: 4 números (materiais que pedem atenção, calibrações, solicitações pendentes, tarefas vencidas). Clicar em "Materiais que pedem atenção" abre Materiais já filtrado.

## Outros erros para procurar
- Algum número diferente do EFClaudian (anotar item, valor nos dois apps e a data).
- Texto cortado na gaveta; tabela que empurra a página para o lado no PC.
