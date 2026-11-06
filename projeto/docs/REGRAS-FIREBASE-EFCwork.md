# EFCwork × regras do Firestore (conferência de 06/11/2026)

Base: as regras que o Elias mandou em 06/11 09:07 (EFClaudian v2.92.0 … v2.102.42 + EFCQuiz v2.2.0).
Conferi tudo o que o EFCwork grava (coleção por coleção) contra essas regras.

## Conclusão
**Não precisa colar regra nova.** Os 2 pontos que dariam "permissão negada" no Firebase real são do lado do app e saem na v0.3.6:

| O que | Quem | Por que a regra recusa | Correção (v0.3.6, sem mexer na regra) |
|---|---|---|---|
| Guardar / Pôr em uso / Mudar os lugares | Colaborador (sem ★) | `sv2_alm_equip`: quem não é líder ★/Principal só muda situacao, local, posicao, guardadoEm, qtdLocal, qtdGuard, hist…; `posGuarda`, `posUso` e `qtdPos` não estão na lista | Decisão do Elias: o Colaborador **pede** (fica pendente, com o motivo) e o Elias ou um líder ★ confirma; quem grava é quem confirma |
| Recontagem feita pelo Colaborador | Quem conta | `sv2_alm_inv`: quem não é líder ★/Principal só muda `contagens` e `folhas`; o app também tirava a marca `recontar` | A marca de recontagem passa a ser a data do pedido; a recontagem vale quando a contagem é mais nova — o contador só grava `contagens` |

## Já estava liberado (conferido)
- `sv2_cfg/empresa` (salvar a empresa, pendente desde a v0.1): a regra deixa o líder ★ e o Principal → resolvido.
- `sv2_alm_cal` (calibração), `sv2_alm_inv` criar/concluir, conclusões de inventário no equipamento: só líder ★/Principal, igual ao app.
- `sv2_alm_mov`, `sv2_alm_sol`, `sv2_alm_itens`: quem lança.
- `sv2_alm_pref`: cada um o seu (motivos, favoritos, lugares tirados da lista).
- `sv2_aprov`: criar com `solicitanteId` = quem pede e `status` pendente; decidir só `status` e `decisao` com `decisao.por` = quem decide → igual ao app.
- `sv2_audit` (`userId` = quem grava), `sv2_notifs` (`dest` lista; ler/confirmar só o próprio) → igual ao app.

## Limite conhecido
- **Conta de teste** (`contaTeste`): a regra exige `testeConta: true` em tudo o que ela cria; o EFCwork ainda não põe esse campo → a conta de teste não consegue gravar no EFCwork (só olhar). Entra quando a Administração for refeita (v0.9).
