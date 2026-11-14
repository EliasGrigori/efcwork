# EFCwork × Firebase · o que conferir (v0.6.15, 14/11/2026)

Este documento junta, em um lugar só, tudo o que o EFCwork grava no Firestore. Ele **substitui a leitura** de `REGRAS-FIREBASE-EFCwork.md` (que continua como histórico). A tabela da seção 3 é gerada a partir do código (`src/*.js`) e tem um teste que falha se uma coleção nova entrar no app sem entrar aqui: `node projeto/tools/testes/t_regras_cobertura.js`.

> Limite desta conferência: eu leio o **código**; não vejo as regras que estão publicadas no seu console. As regras que o Elias mandou em 06/11 (EFClaudian v2.102.42) foram a base das conferências antigas; as de depois estão nos trechos das versões v0.6.9, v0.6.10 e v0.6.12. Se quiser uma conferência linha a linha das regras de hoje, cole o arquivo de regras inteiro na conversa.

## 1. O que fazer agora (v0.6.15)

A v0.6.15 **não cria coleção nova** e **não precisa de regra nova** se as regras da v0.6.12 já estão publicadas. Confira só estes dois pontos:

1. **`sv2_rodizio`: campos novos dentro de `liberadas.<período>.<área>`.** O app passou a gravar, quando o Líder ★ ou o Principal decide uma nova coleta pedida:
   - aprovar: `aprovadoPor`, `aprovadoPorId`, `aprovadoEm`;
   - recusar: `recusadaPor`, `recusadaPorId`, `recusadaEm`, `recusaMotivo`;
   - ao liberar: `porId` e `porSup` (quem pediu e se era Líder ★/Principal), além de `motivo`, `por`, `ts` que já existiam.
   - Quem grava `liberadas`: só Líder ★ e Principal (o Colaborador pede pela Aprovação em `sv2_aprov` e não escreve em `liberadas`; quem tem Coletas continua gravando `progs` ao programar, como antes).
   - **A regra de `sv2_rodizio` precisa deixar o Líder ★/Principal alterar `liberadas` de um plano criado por outra pessoa.** Se a regra do EFClaudian só aceita certos campos, `liberadas` já era um deles; os subcampos novos moram dentro dele e não mudam a regra por campo. Se a sua regra confere o formato de `liberadas` (por exemplo, só chaves conhecidas), acrescente os 7 campos acima.
2. **Teste em dois aparelhos** (3 minutos), no Firebase real:
   - Como Colaborador com Coletas: em um plano, "Pedir recoleta" → deve aparecer o pedido em Aprovações do Líder.
   - Como Líder ★ ou Principal: aprovar o pedido → o plano mostra a nova coleta liberada; recusar com motivo → o plano continua com a coleta já feita.
   - Se aparecer "permissão negada" ao aprovar, é a regra de `sv2_rodizio` do ponto 1.

Nada mais mudou no banco na v0.6.15 (o resto foi tela).

## 2. O que o EFCwork grava e o EFClaudian ignora (não quebra o EFClaudian)

| Onde | Campo / coleção | Desde | Observação |
|---|---|---|---|
| `sv2_rodizio` | `liberadas.*.{porId, porSup, aprovadoPor, aprovadoPorId, aprovadoEm, recusadaPor, recusadaPorId, recusadaEm, recusaMotivo}` | v0.6.15 | O EFClaudian lê só `motivo`, `por`, `ts`. |
| `sv2_cfg/coletas` | `labInfo` (endereço de cada laboratório) | v0.6.10 | Quem grava `sv2_cfg` hoje (Administrador) continua gravando; o Líder precisa poder gravar **só este campo** se for editar endereços. |
| `efd_docs`, `efd_partes` | coleções novas (impressos) | v0.6.9 | Trecho de regra na seção 4. |
| `sv2_impressos`, `sv2_envio_imp` | coleções novas (kit e envio) | v0.6.10 | Trecho na seção 4. |
| `sv2_treinos` | coleção nova (treinamentos) | v0.6.12 | Trecho na seção 4. |

## 3. Todas as coleções que o app usa (gerado do código)

Coluna "Estado": **Conferida** = conferida contra as regras em 06/11; **Trecho** = coleção nova com trecho pronto (seção 4); **EFClaudian** = coleção do EFClaudian que o EFCwork também usa, com a mesma regra dele (só olhe se der "permissão negada"); **Interna** = não é dado de negócio.

| Coleção | Telas (arquivos) | Operações | Estado |
|---|---|---|---|
| `sv2_users` | login, casca, serviços | ler, criar o próprio perfil | EFClaudian |
| `sv2_login` | login | ler | EFClaudian |
| `sv2_meta` (doc `setup`) | login | ler, criar na primeira vez | Interna |
| `sv2_cfg` | adm, água, apontamentos, casca, kit | gravar, atualizar | Conferida (`empresa`); `coletas.labInfo` na seção 2 |
| `sv2_audit` | atividade, serviços | criar | Conferida |
| `sv2_notifs` | calibração, serviços | criar, ler, marcar lida | Conferida |
| `sv2_aprov` | inspeções, serviços | criar, decidir | Conferida |
| `sv2_alm_itens` | almoxarifado, lançamentos | criar, atualizar | Conferida |
| `sv2_alm_mov` | almoxarifado, contagem, lançamentos | criar, atualizar | Conferida |
| `sv2_alm_sol` | almoxarifado, lançamentos | criar, atualizar | Conferida |
| `sv2_alm_pref` | lançamentos | cada um o seu | Conferida |
| `sv2_alm_equip` | almoxarifado, calibração, contagem, lugares | atualizar | Conferida (corrigida na v0.3.6) |
| `sv2_alm_cal` | calibração | criar, atualizar | Conferida |
| `sv2_alm_inv` | contagem | criar, atualizar | Conferida (corrigida na v0.3.6) |
| `sv2_coletas` | coletas, programação, plano | atualizar | EFClaudian |
| `sv2_prog` | coletas, programação, plano | criar, atualizar | EFClaudian |
| `sv2_rodizio` | plano, programação | criar, atualizar | EFClaudian; **campos novos na seção 1** |
| `sv2_analise` | análise, ANP | criar, atualizar | EFClaudian |
| `sv2_analises` | programação | só ler | EFClaudian |
| `sv2_talhoes` | programação | só ler | EFClaudian |
| `sv2_fotos` | apontamentos, coletas | ler, gravar, atualizar | EFClaudian |
| `sv2_apont` | apontamentos | criar, atualizar | EFClaudian |
| `sv2_cloro` | inspeções | criar, atualizar | EFClaudian |
| `sv2_cloro_falta` | inspeções | gravar | EFClaudian |
| `sv2_cloro_foto` | inspeções | ler, gravar | EFClaudian |
| `sv2_bebs` | inspeções | criar, atualizar | EFClaudian |
| `sv2_rnc` | auditoria, auditoria interna, análise | criar, atualizar | EFClaudian |
| `sv2_rnc_foto` | auditoria | ler, gravar | EFClaudian |
| `sv2_rnc_gut` | auditoria | gravar | EFClaudian |
| `sv2_rnc_plano` | análise | gravar | EFClaudian |
| `sv2_aguacol` | água | criar, atualizar | EFClaudian |
| `sv2_aguaponto` | água | criar, atualizar | EFClaudian |
| `sv2_aguaproj` | água | criar, gravar, atualizar | EFClaudian |
| `sv2_agua_foto` | água (ações) | ler, gravar | EFClaudian |
| `sv2_docs` | documentos | criar, atualizar | EFClaudian |
| `sv2_lanc` | documentos | criar, atualizar | EFClaudian |
| `sv2_caixas` | documentos | só ler | EFClaudian |
| `sv2_tarefas` | casca (Início) | só ler | EFClaudian |
| `efd_docs` | impressos | gravar, atualizar | Trecho |
| `efd_partes` | impressos | ler, gravar | Trecho |
| `sv2_impressos` | kit | criar, atualizar | Trecho |
| `sv2_envio_imp` | kit | gravar | Trecho |
| `sv2_treinos` | treinamentos | criar, atualizar | Trecho |

## 4. Trechos de regra prontos (já entregues nas versões; juntos aqui)

Dentro de `match /databases/{database}/documents { ... }`. Os nomes `usuarioAtivo()`, `liderOuPrincipal()`, `testeNovo()` e `testeMuda()` são os do arquivo de regras do Elias (v2.102.42); se na sua versão forem outros, adapte.

```
match /efd_docs/{id} {
  allow read: if usuarioAtivo();
  allow create, update: if liderOuPrincipal() && request.resource.data.v == 1 && request.resource.data.id == id;
  allow delete: if false;
}
match /efd_partes/{id} {
  allow read: if usuarioAtivo();
  allow create, update: if liderOuPrincipal() && request.resource.data.b64.size() <= 900000;
  allow delete: if false;
}
match /sv2_impressos/{id} {
  allow read: if usuarioAtivo();
  allow create, update: if liderOuPrincipal() && request.resource.data.v == 1;
  allow delete: if false;
}
match /sv2_envio_imp/{id} {
  allow read: if usuarioAtivo();
  allow create, update: if usuarioAtivo() && request.resource.data.porId == request.auth.uid;
  allow delete: if false;
}
match /sv2_treinos/{id} {
  allow read: if usuarioAtivo();
  allow create: if liderOuPrincipal() && testeNovo();
  allow update: if liderOuPrincipal() && testeMuda();
  allow delete: if false;
}
```
O arquivo completo (regras dele + estas cinco) é `regras-firestore-EFCwork-v0.6.12.txt`, entregue na v0.6.12.

## 5. Limites conhecidos (já anotados antes, seguem valendo)

- **Conta de teste:** a regra exige `testeConta: true` em tudo o que ela cria; o EFCwork ainda não grava esse campo, então a conta de teste só consegue olhar. Entra quando você decidir.
- **Coletas e Água sem limite:** as listas carregam tudo; o limite de 3.000 mais recentes (ITEM 6 da varredura) continua em aberto, aguardando a sua decisão.
- **Fotos vencidas da ação** (ITEM 7 da varredura): continuam em aberto.
- O que o EFClaudian grava e o EFCwork não conhece (frequências, várias análises, tipo Canal) continua em aberto, junto com a decisão de não mexer no EFClaudian.

## 6. Como conferir depois de publicar regras

1. Console do Firebase › Firestore › Regras › **Publicar**.
2. Aba **Regras** › Simulador: teste `get` e `update` em `sv2_rodizio/{qualquer}` como Líder ★ e como Colaborador.
3. No EFCwork real (não no demo): as duas conferências da seção 1.
4. Se algo der "permissão negada", abra o console do navegador (F12): a mensagem diz a coleção e o caminho; procure essa coleção na seção 3.
