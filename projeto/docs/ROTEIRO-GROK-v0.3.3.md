# Roteiro do Grok — EFCwork v0.3.3 (calibração com histórico)

**O que é:** Almoxarifado › Equipamentos › **Calibração**. Cada solicitação passa por 5 etapas, com data e quem: Solicitada → Cotação recebida → Agendada → Calibrada (quem calibrou, código do certificado, validade, resultado) → Compra do serviço (= Encerrada). No detalhe de cada equipamento, o histórico só dele.
**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (grava).

## NÃO SÃO DEFEITOS
- Só Líder/Administrador abre, cota, agenda, registra calibrado e compra; Colaborador só vê.
- A data agendada pode ser no futuro; as outras não.
- A compra usa sempre a data de hoje e exige NF (regra do EFClaudian).
- Cadastro, transferência, dano e manutenção de equipamento continuam no EFClaudian.
- No EFClaudian a solicitação aparece igual, mas sem a etapa "Agendada" e sem "quem calibrou"/"validade" (campos novos).

## Bloco A — Abrir
A1. Equipamentos: botão **Calibração** (mostra quantas em andamento). Números: vencidas/sem, a vencer (40 dias), em andamento, precisam e não estão em solicitação.
A2. Nova solicitação: lista com vencidos primeiro, depois a vencer; quem já está numa solicitação aberta aparece "já na CAL-…" e não marca. "Marcar vencidos e a vencer". Prestador em janela retrátil (os já usados) ou "Outro prestador". Sem marcar: aviso.
A3. Abrir → CAL-AAAA-NN; o detalhe mostra as 5 etapas: Solicitada feita (data, número, quem), Cotação = próxima etapa.

## Bloco B — Cotação e agenda
B1. Cotação: data, referência (opcional) e valor de cada equipamento → "Cotada · falta agendar"; a etapa mostra o total.
B2. Agendar: data (pode ser futura) e observação → "Agendada para …". Reagendar: a data antiga fica guardada.

## Bloco C — Calibrado
C1. Pede quem calibrou e pelo menos um código de certificado. A validade vem = data + frequência do equipamento (muda se trocar a data; dá para editar).
C2. Quem ficar sem certificado continua na solicitação ("Calibração em andamento").
C3. Reprovado: equipamento vai para "Uso com restrição" e os superiores recebem aviso.
C4. O equipamento fica com última calibração, código, quem calibrou, validade e o número da solicitação; situação "Em dia".

## Bloco D — Compra e histórico
D1. Solicitação de compras: Nº e NF obrigatórios, data de hoje → "Encerrada", 5 etapas feitas, sem lixeira.
D2. Clique num equipamento da lista (ou abra em Equipamentos): "Calibrações deste equipamento" com solicitada, cotação, agendada, calibrada por quem, código do certificado, validade, resultado e compra — só dele.
D3. Equipamento fora de solicitação: "Pedir calibração" abre a nova solicitação já com ele marcado.
D4. Lixeira (antes de calibrar): cancelar com motivo. Impressora: relatório para o prestador.

## Bloco E — Visual
E1. Gaveta com no máximo 3 botões (os da etapa atual); impressora no topo da gaveta.
E2. Celular: nada rola para o lado; detalhe em tela cheia.

## Conferir no Firebase real (1º uso)
- Se aparecer "O Firebase não deixou gravar (permissão)" ao agendar ou registrar calibrado, a regra de `sv2_alm_cal`/`sv2_alm_equip` limita campos: mande as regras atuais para o Claude.
