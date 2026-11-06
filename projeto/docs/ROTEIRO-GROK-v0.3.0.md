# Roteiro do Grok — EFCwork v0.3.0 (Almoxarifado lança + sino)

**O que é:** o Almoxarifado do EFCwork agora LANÇA (saída, entrada, abrir frasco e acabou, ajustar saldo, corrigir, anular, solicitação nova, atender e cancelar, confirmar produto crítico) e o sino do topo funciona (avisos e pedidos para decidir). Grava nas mesmas coleções e no mesmo formato do EFClaudian.
**Testar sem tocar em dados reais:** endereço com `?demo=1` (Blocos A a F). **Conta real: só olhar** (Bloco G).

## NÃO SÃO DEFEITOS
- Cadastro de material, kits, fotos e inventário continuam no EFClaudian (ícone de "abrir fora" no cabeçalho do Almoxarifado).
- Equipamentos: só consulta nesta versão (calibração com histórico vem na v0.3.2).
- Pedidos de outras áreas (coletas, cloro, documentos…) aparecem no sino com "Decidir no EFClaudian": só os do Almoxarifado decidem no EFCwork por enquanto.
- Saída sem foto (a foto continua opcional no EFClaudian).
- Com a gaveta aberta no PC, o sino e o tema do topo ficam por baixo dela: feche a gaveta para usar.
- Na entrada por embalagem (ex.: Fardo com 12 Lt), o valor sugerido já vem por fardo; no EFClaudian vinha por litro. É de propósito: o rótulo diz "Valor por Fardo".
- A lista de motivos não traz motivos fixos de empresa: vem da configuração; sem configuração, os que a equipe usou nos últimos 90 dias + uma lista simples + os guardados por cada pessoa.
- A tela de entrar e o celular continuam os da v0.1.0 (o Elias vai trazer modelos).

## Bloco A — Saída (demonstração)
A1. Almoxarifado › Materiais: botões **Saída** (dourado) e **Entrada** no cabeçalho. Saída abre a gaveta com a lista de materiais; a busca filtra sem acento.
A2. Escolha um material com pouco saldo e peça mais do que tem. **Esperado:** "Só há X disponível… O saldo não pode ficar negativo." O que foi digitado continua no campo.
A3. Sem motivo: "Escolha o motivo". Motivo em janela retrátil; "Escrever outro motivo" abre o campo e a caixinha "Guardar esse motivo na minha lista".
A4. Registre. **Esperado:** aviso "Saída registrada…", saldo cai, a movimentação aparece em Movimentações com lote, valor do lote, motivo e quem.
A5. Saída que faz o item passar do mínimo para baixo: aviso no sino ("Estoque abaixo do mínimo: …") para o Principal e líderes ★ com Almoxarifado.
A6. Material só com lote vencido: pede para escolher o lote vencido; escolhido, pede o motivo para usar.
A7. Produto crítico: aviso no formulário; a saída fica "Aguardando"; no Painel aparece "Produto crítico: confirmar saída"; na gaveta da movimentação, **Confirmar saída** ou **Não confere** (com motivo).
A8. Abrir a saída pelo detalhe do material: depois de registrar, volta para o detalhe dele.

## Bloco B — Frasco, entrada e ajuste (demonstração)
B1. Material "por frasco": o botão principal do detalhe é **Abrir frasco**; depois aparece "Em uso agora" com **Acabou** (e "Acabou e abri outro" quando há lacrado).
B2. Entrada com 2 materiais: cada um com quantidade, valor, lote e validade; lixeira tira a linha; "Adicionar outro material". Material que controla validade exige lote e validade.
B3. Material com embalagem de compra: "Chegou em" (janela retrátil). 2 fardos de 12 a R$ 24,00 = 24 unidades a R$ 2,00.
B4. Ajustar saldo: sem mudar nada → "Nada mudou". Mudando um lote + motivo → ajuste com a diferença.

## Bloco C — Corrigir e anular (demonstração)
C1. Movimentações › uma saída › **Corrigir**: pede o porquê; o detalhe mostra "20 → 18" nas correções.
C2. **Lixeira no canto de cima** = Anular (com motivo). A linha continua na lista, marcada "Anulada".
C3. Entrada que já teve saída depois: não mostra a lixeira (corrigir em vez de anular).

## Bloco D — Solicitações (demonstração)
D1. Nova solicitação: materiais com quantidade, Nº do documento obrigatório, data prevista não pode ser antes da data.
D2. Solicitação pendente › **Chegou: marcar Atendida**: abre a Entrada já preenchida (quantidades e Nº do documento). Registrar → solicitação "Atendida".
D3. Lixeira da solicitação = Cancelar (com motivo).

## Bloco E — Secundário e sino (demonstração)
E1. Crie (no EFClaudian demonstração ou pelo teste) um Secundário com Almoxarifado e com você como superior. Entre com ele: Ajustar saldo diz "vai como pedido" e o botão é "Pedir ajuste". O saldo não muda.
E2. Volte como Principal: número vermelho no sino. Sino: "Para você decidir" com o pedido; **Aprovar** aplica (o ajuste fica no nome de quem pediu, com "Aprovado por"); **Reprovar** pede o motivo.
E3. Avisos: os não lidos em negrito com bolinha; clicar marca como lido; "Marcar todas como lidas". Aviso crítico tem "Confirmar ciência".

## Bloco F — Visual (PC 1366 px e celular 390 px, Claro e Escuro)
F1. Formulários na gaveta: botões de 36 px no PC e 44 px no celular; no celular a gaveta ocupa a tela toda; nada rola para o lado.
F2. Nenhum emoji; excluir/anular/cancelar sempre pela lixeira do canto de cima.

## Bloco G — Conta real (SÓ OLHAR)
G1. Entre com a sua conta: o sino mostra os mesmos avisos do sino do EFClaudian; os não lidos batem.
G2. Lance uma saída no EFClaudian (algo que você faria de qualquer jeito) e veja aparecer no EFCwork na hora, com o mesmo saldo.
G3. Se o Elias decidir fazer o primeiro lançamento real pelo EFCwork: depois, abra o mesmo item no EFClaudian e confira saldo, lote, motivo e a auditoria (Histórico). **Esperado:** igual a um lançamento feito pelo EFClaudian.

## Outros erros para procurar
- Formulário que perde o que foi digitado quando chega dado novo.
- Número diferente do EFClaudian (anotar item, valor nos dois apps e a data).
- Pedido aprovado que não aplicou (anotar o título do pedido).
