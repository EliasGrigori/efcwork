# Roteiro do Grok — EFCwork v0.3.6 (fluido Gota + pedidos com confirmação)

**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (grava).

## NÃO SÃO DEFEITOS
- O fluido para na borda de cima da bolinha (não no meio): é a opção 3 "Gota".
- Com "reduzir movimento" no aparelho, não anima.
- Colaborador: o equipamento só muda depois que o superior confirma; enquanto isso a gaveta mostra "Aguardando confirmação".
- Só um pedido pendente por equipamento.
- Líder ★/Administrador faz direto (o porquê é opcional para eles).
- No EFClaudian, o pedido aparece no sino mas não é aplicado lá: confirmar pelo EFCwork.
- A marca de recontagem não some do banco: ela guarda em qual contagem foi pedida e deixa de valer quando o item é recontado.

## Bloco A — Gota
A1. Abra uma solicitação de calibração nunca vista com cotação e agenda: o fluido desce até a borda da 2ª bolinha, cai uma gota, ela enche de baixo para cima com uma onda e aparece o certo; 0,4 s depois, a 3ª.
A2. Com a gaveta aberta, outra aba lança "Calibrado": acontece na hora na 4ª.

## Bloco B — Pedido do Colaborador
B1. Entre como Colaborador, abra uma micropipeta guardada: Pôr em uso → aviso amarelo "aguardando a confirmação de (superior)"; botão "Pedir para pôr em uso"; sem o porquê → erro.
B2. Com o porquê: "Pedido enviado"; o equipamento continua igual; a gaveta mostra "Aguardando confirmação: Pôr em uso · Bancada 1", quem, quando e o porquê.
B3. Tente outro pedido do mesmo equipamento: bloqueado.
B4. Repita com Guardar, Mudar os lugares (vidraria) e o pino.

## Bloco C — Confirmar / Recusar
C1. Entre como Líder ★/Administrador: a gaveta tem Recusar e Confirmar; o sino também mostra o pedido.
C2. Confirmar: o equipamento muda; histórico "…— porquê (pedido de Fulano)", confirmado por você.
C3. Recusar: pede o motivo; o Colaborador recebe no sino.

## Bloco D — Recontagem
D1. Abra uma contagem com um Colaborador contando; peça recontagem do que não bateu; entre como ele e reconte: grava sem erro.
D2. Decida uma diferença e depois peça para contar de novo: a decisão antiga deixa de valer.
