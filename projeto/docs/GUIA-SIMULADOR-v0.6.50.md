# Roteiro curto · regras [R8] Só ver por área (v0.6.50)

O emulador do Firestore não baixa aqui; a prova é no console do Firebase, aba Regras, botão "Playground de regras" (Simulador).

## Antes
1. Copie as regras de hoje para um arquivo (volta em segundos, se precisar).
2. Cole `REGRAS-FIRESTORE-EFCwork-v0.6.50-PROPOSTA.txt` inteiro no editor. Não publique ainda. Se aparecer X vermelho em alguma linha, mande o print.

## Preparo (2 documentos à mão, no Firestore)
- `sv2_users/teste_sover`: `perfil: "secundario"`, `estrela: true`, `atrib: { almox: true, coletas: true }`, `soVer: { almox: true }`.
- No Simulador, use "Autenticado" com o uid `teste_sover`.

## Testes (o resultado esperado está entre colchetes)
1. create em `sv2_alm_mov/x1` com qualquer dado [Negado: Almoxarifado é "Só ver"].
2. create em `sv2_aguacol/x1` com `criadoPor: "teste_sover"` [Permitido: Coletas é "Ver e alterar"].
3. get em `sv2_alm_itens/qualquer` [Permitido: ler não muda].
4. update em `sv2_users/teste_sover` mudando só `soVer` [Negado: só o Principal muda].
5. Troque no documento `soVer: { almox: false }` e repita o 1 [Permitido].
6. Com o uid de um Principal, repita o 1 com `soVer: { almox: true }` no teste_sover [Permitido: o Administrador grava tudo].

Se os 6 baterem, publique as regras. Depois apague o `sv2_users/teste_sover`.
