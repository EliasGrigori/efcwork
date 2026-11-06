# Roteiro do Grok — EFCwork v0.3.5 (onde cada coisa fica)

**O que é:** cada equipamento tem o lugar de GUARDA (gaveta, porta/armário) e o de USO (bancada, suporte de vidrarias); a vidraria diz quantas estão em cada lugar do laboratório; o inventário conta por lugar; a coluna Local das tabelas ficou curta.
**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (grava).

## NÃO SÃO DEFEITOS
- O tipo do lugar vem do começo do nome: Gaveta, Porta, Armário, Caixa, Prateleira, Estoque = guarda; o resto (Bancada, Suporte de vidrarias, Geladeira…) = uso.
- Guardar mostra só lugares de guarda; Pôr em uso só lugares de uso; "Outro lugar" aceita qualquer nome (arruma maiúsculas e espaços).
- Colaborador também guarda e põe em uso.
- Equipamento guardado: calibração "Pausada (guardado)" (regra do EFClaudian).
- "Mudar os lugares" não muda o total da vidraria (só o Inventário muda).
- A coluna Local mostra o lugar com número (Gaveta 02); o laboratório aparece ao passar o mouse e na gaveta.
- O fluido da calibração ainda é o da v0.3.4 (as 6 opções estão só na página de aprovação).

## Bloco A — Equipamento
A1. Abra uma micropipeta: "Onde está" em destaque (Em uso · laboratório · lugar), "Quando guardado" e "Quando em uso", e "Iguais a este" com as outras do mesmo nome e onde estão. Tocar numa abre ela.
A2. Guardar: escolha uma gaveta/porta ou "Outro lugar" → Armazenado, posição = lugar; o lugar de uso fica lembrado.
A3. Pôr em uso: já vem com o último lugar de uso; com calibração vencida → avisa e entra "Uso com restrição", superiores avisados no sino.
A4. Pino no topo: muda os dois lugares de referência.
A5. Segurar 1,5 s um lugar da lista e arrastar para a lixeira: some da sua lista.

## Bloco B — Vidraria
B1. Abra um béquer sem lugares: "Sem lugar definido N".
B2. Mudar os lugares: Suporte de vidrarias 4 + Gaveta 03 8 (de 12). A soma de cima muda enquanto digita. Passar do total → aviso.
B3. A gaveta mostra cada lugar com "guardadas" / "em uso"; a tabela mostra "2 lugares".

## Bloco C — Inventário
C1. Equipamentos › Inventário: a vidraria aparece em cada lugar; a micropipeta guardada aparece na gaveta/porta dela.
C2. Conte 1 a menos no suporte, decida "Quebra", conclua: total e o suporte diminuem 1, a gaveta fica igual; histórico "Laboratório › Suporte de vidrarias 4 → 3".
C3. Vidraria em 2 laboratórios: conte e conclua sem erro (corrigido o '~' da v0.3.4).

## Bloco D — Celular
D1. Gaveta em tela cheia, nada rola para o lado; Guardar e Pôr em uso funcionam.
