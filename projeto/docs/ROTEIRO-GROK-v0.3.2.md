# Roteiro do Grok — EFCwork v0.3.2 (contagem às cegas)

**O que é:** Almoxarifado › Materiais › **Contagem**. O Líder/Administrador abre e escolhe quem conta; quem conta vê os materiais por lugar (portas em sequência, depois gavetas, depois o resto), lote a lote, sem o saldo do sistema; na conferência o app sugere recontar o que não bateu; cada diferença recebe uma decisão; "saída esquecida" é lançada com a data certa e fica marcada como erro de lançamento de quem esqueceu, com a reclamação.
**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (a contagem grava).

## NÃO SÃO DEFEITOS
- Só materiais. Vidrarias e equipamentos (inventário geral) continuam no EFClaudian.
- Quem conta vê o que ELE contou (o número dele), nunca o saldo do sistema.
- Uma contagem aberta por vez (a mesma regra do EFClaudian; vale para os dois apps).
- A decisão de cada diferença só vira lançamento quando o Líder clica em Concluir.
- Material que bateu na recontagem não muda o estoque (foi erro de contagem).

## Bloco A — Abrir (Líder/Administrador)
A1. Materiais: botão **Contagem**. Sem contagem aberta: "Nenhuma contagem aberta" e **Nova contagem**.
A2. Nova contagem: "Quem vai contar" lista só quem tem o Almoxarifado (você aparece como "(você)"). Sem escolher: "Escolha quem vai contar". Abrir → número CNT-AAAA-NN; quem conta recebe aviso no sino.

## Bloco B — Contar (quem conta)
B1. Início: cartão "Contagem para você" com o progresso. Abre a contagem.
B2. Grupos na ordem: Porta 01, 02, 03…, depois Gaveta 01, 02…, depois o resto (Geladeira, Bancada…). Filtro "Todos os lugares" (janela retrátil) e busca.
B3. Nenhum saldo do sistema aparece. Material com 2 lotes: um campo por lote; faltando um, não salva ("0 se não achou").
B4. Enter vai para o próximo lote; no último, salva e o cursor pula para o próximo material que falta. Barra de progresso e % sobem.
B5. Lápis num material contado: conta de novo.

## Bloco C — Conferir e recontar (Líder)
C1. "Mostrar: conferência": números contados / bateram / não bateram / em recontagem.
C2. Caixa "Sugestão: recontar os N que não bateram" → **Pedir recontagem**. Quem conta é avisado e vê a seção **Recontar** no topo, com campos vazios.
C3. Depois da recontagem: "Bateu na recontagem" (nada muda no estoque) ou "Não bateu de novo". A sugestão não volta para os já recontados.
C4. Clique numa linha: gaveta com sistema, contado, diferença, lote a lote e as contagens (1ª e recontagem).

## Bloco D — Decidir e concluir
D1. **Decidir** (falta): Saída esquecida, Perda, Quebra, Erro de lançamento, Outro. (Sobra): Entrada não lançada, Achado, Erro de lançamento, Outro.
D2. Saída esquecida: data (não pode ser depois da abertura da contagem), quem esqueceu de lançar (ou "Não sei"), motivo e reclamação. Guardar decisão.
D3. **Concluir** só libera quando todas as diferenças têm decisão e não há recontagem pendente.
D4. Depois de concluir: a saída esquecida aparece em Movimentações com a data dela, pílula "Erro de lançamento", "Lançada depois" e a reclamação; quem esqueceu recebe "Saída não lançada" no sino; as outras viram ajuste "Contagem CNT-…: <motivo>".
D5. Painel: "Erros de lançamento (últimos 90 dias)". Movimentações › Filtro › "Erros de lançamento".
D6. Contagem: histórico com a concluída; clique → resumo com o que foi lançado e os erros.

## Bloco E — Outros
E1. Impressora: folha por lugar, às cegas, com espaço para escrever.
E2. Lixeira: cancelar com motivo (fica no histórico).
E3. Celular: nada rola para o lado; botão "Contado" grande; campos ocupam a largura.

## Conferir no Firebase real (1º uso)
- Se aparecer "O Firebase não deixou gravar (permissão)" ao abrir a contagem, pedir recontagem ou decidir: a regra de `sv2_alm_inv` limita os campos. Mande as regras atuais para o Claude montar o acréscimo.
