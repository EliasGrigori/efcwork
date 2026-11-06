# Roteiro do Grok — EFCwork v0.3.4 (animações + inventário de equipamentos)

**O que é:** (1) as gavetas entram e saem deslizando pela direita; (2) a linha do tempo da calibração virou um tubo com fluido dourado que sobe até a etapa atual, com brilho correndo; (3) a contagem às cegas agora também faz o inventário de equipamentos (achei / não achei) e de vidrarias (quantidade em cada lugar).
**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (grava).

## NÃO SÃO DEFEITOS
- A primeira vez que alguém abre uma solicitação de calibração, o fluido sobe desde "Solicitada" (ainda não viu nenhuma etapa).
- "Até onde viu" fica no aparelho: no celular e no PC a mesma pessoa vê a subida uma vez em cada um.
- Com "reduzir movimento" ligado no sistema (Windows/Android/iOS), nada anima: a gaveta abre na hora e o fluido já aparece cheio.
- Trocar de item com a gaveta aberta não repete a entrada deslizando.
- Equipamento conta como 1 (Achei) ou 0 (Não achei); não tem campo de quantidade.
- Vidraria com mais de um lugar aparece uma vez em cada lugar.
- Equipamento em trânsito ou baixado não entra no inventário.
- Pelo botão Inventário (Equipamentos) a contagem já vem com Equipamentos e Vidrarias marcados e se chama "Inventário"; pelo botão Contagem (Materiais), vem só Materiais.

## Bloco A — Gaveta
A1. Abra um material, um equipamento, o sino: a gaveta entra deslizando da direita (≈0,3 s). Feche (X, Esc, voltar do celular): sai deslizando.
A2. Com a gaveta aberta, clique em outro item da tabela: troca o conteúdo sem deslizar de novo; a rolagem dentro da gaveta não pula para o topo quando chega dado novo.
A3. Abra e feche rápido várias vezes: nunca ficam duas gavetas na tela.

## Bloco B — Fluido da calibração
B1. Abra uma solicitação nunca vista com cotação e agenda: o fluido sobe da 1ª para a 2ª etapa, espera 0,4 s, sobe para a 3ª; cada bolinha acende com um pulo.
B2. Feche e abra de novo: já aparece cheio, sem animar.
B3. Com a gaveta aberta, outra pessoa (ou outra aba) lança "Calibrado": o fluido sobe na hora até "Calibrada".
B4. Veja nos dois temas: o brilho corre de cima para baixo no fluido.

## Bloco C — Inventário
C1. Equipamentos › Inventário › Nova contagem: "O que contar" com Materiais, Equipamentos e Vidrarias (e quantos de cada). Desmarcar tudo → "Marque o que vai ser contado".
C2. Contando: vidrarias com campo de quantidade (sem o saldo); equipamentos com "Não achei" e "Achei". Na ordem do lugar.
C3. Conferência: coluna Tipo; só aparece o que não bateu. Equipamento não achado: "Não encontrado", "Está em outro lugar", "Outro". Vidraria: Quebra, Perda, Achado…
C4. Concluir: o equipamento "Não encontrado" mostra o aviso na gaveta dele e o registro no histórico; a vidraria fica com a quantidade contada naquele lugar ("Quebra 12 → 10").
C5. Numa próxima contagem, marque "Achei" no equipamento não encontrado e conclua: o aviso some.
C6. Celular: nada rola para o lado; Achei / Não achei com altura de toque.
