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

## v0.6.9 · Impressos (12/11/2026) — publicar no console antes de usar de verdade
Duas coleções novas. O Vértice Docs e o Sabiá não gravam nelas (não usam a nuvem); só o EFCwork, com o login de quem está usando.
- `efd_docs/{id}` — ficha de cada impresso (Contrato EFD v1). Leitura: qualquer usuário ativo. Gravação: Administrador e Líder.
- `efd_partes/{id}` — o arquivo em pedaços de até 900.000 caracteres (`{docId, qual, rev, n, de, b64}`). Mesmas permissões. Nada é apagado: versão antiga e lixeira gravam `b64: ''`.

Trecho para colar dentro de `match /databases/{database}/documents { ... }`, adaptando aos nomes das funções que já existem nas regras (ex.: `isAtivo()`, `isSup()`):
```
function efdAtivo() { return request.auth != null && get(/databases/$(database)/documents/sv2_users/$(request.auth.uid)).data.bloqueado != true; }
function efdSup() { let u = get(/databases/$(database)/documents/sv2_users/$(request.auth.uid)).data;
  return efdAtivo() && (u.perfil in ['principal', 'principal_temp'] || (u.perfil == 'secundario' && u.estrela == true)); }
match /efd_docs/{id} {
  allow read: if efdAtivo();
  allow create, update: if efdSup() && request.resource.data.v == 1 && request.resource.data.id == id;
  allow delete: if false;
}
match /efd_partes/{id} {
  allow read: if efdAtivo();
  allow create, update: if efdSup() && request.resource.data.b64.size() <= 900000;
  allow delete: if false;
}
```
Conferir depois de publicar: importar um PDF pequeno como Administrador, abrir em outro aparelho e imprimir; como Colaborador, a aba aparece sem Importar e imprime.

## v0.6.10 · Kit do laboratório e papéis do envio (12/11/2026)
- `sv2_cfg/coletas` ganha o campo `labInfo` (endereço de cada laboratório, para o rótulo). O EFClaudian ignora. Quem já grava `sv2_cfg` (Administrador) continua gravando; **o Líder também precisa poder gravar o campo `labInfo`** (se as regras de hoje deixam só o Administrador gravar `sv2_cfg`, só o Administrador cadastra endereços — funciona, mas avise se quiser liberar para o Líder).
- `sv2_impressos/{id}` — o kit (papel ligado ao laboratório). Leitura: usuário ativo. Gravação: Administrador e Líder.
- `sv2_envio_imp/{id}` — o que saiu em cada remessa (para reimprimir). Leitura: usuário ativo. Gravação: quem lança coletas (inclui o Colaborador com Coletas).
```
match /sv2_impressos/{id} { allow read: if efdAtivo(); allow create, update: if efdSup() && request.resource.data.v == 1; allow delete: if false; }
match /sv2_envio_imp/{id} { allow read: if efdAtivo(); allow create, update: if efdAtivo() && request.resource.data.porId == request.auth.uid; allow delete: if false; }
```

## v0.6.12 · Treinamentos (13/11/2026)
Uma coleção nova. O arquivo completo com tudo (as regras dele v2.102.42 + efd_docs, efd_partes, sv2_impressos, sv2_envio_imp + sv2_treinos) é `regras-firestore-EFCwork-v0.6.12.txt`.
- `sv2_treinos/{id}` — um documento por treinamento (Contrato EFD v1, `treino`). Leitura: usuário ativo. Criar e alterar: líder ★ ou Principal. Nunca apagar (cancelar é um update com motivo).
```
match /sv2_treinos/{id} {
  allow read: if usuarioAtivo();
  allow create: if (liderOuPrincipal()) && testeNovo();
  allow update: if (liderOuPrincipal()) && testeMuda();
  allow delete: if false;
}
```
Conferir depois de publicar: como Administrador, programar um treinamento e registrar a realização; como Colaborador, a lista aparece e a lista de presença imprime, sem os botões de gravar.
