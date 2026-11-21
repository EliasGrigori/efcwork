# EFCwork v0.6.32 · Como testar as regras novas no Simulador do Firebase

O Simulador testa as regras **sem publicar**: você cola no editor, simula e só aperta "Publicar" no fim, se tudo der certo.
Use só as regras dos itens que você aprovou (te entrego o arquivo final já sem os reprovados).

## Antes de tudo (1 minuto)
1. Abra console.firebase.google.com › seu projeto › **Firestore Database** › aba **Regras**.
2. Selecione todo o texto que está lá, copie e cole num arquivo do computador com o nome `regras-antes-v0.6.32.txt`. É a sua volta: se algo der errado, cola esse texto de volta e publica.
3. Apague o texto do editor e cole o arquivo `REGRAS-FIRESTORE-EFCwork-v0.6.32-PROPOSTA.txt` (ou o final que eu mandar). **Não publique ainda.**
4. Se aparecer um X vermelho numa linha, pare e me mande um print: é erro de escrita da regra.

## Os UIDs de que você vai precisar
Em **Authentication › Users**, copie o "User UID" de três contas:
- **A** = você (Administrador);
- **L** = um Líder ★;
- **C** = um Colaborador comum, liderado do L.
E anote o **login** de cada uma (o que aparece em Pessoas). O id de um material do Almoxarifado e o id de uma tarefa você vê no próprio Firestore (aba Dados).

## Como simular
No editor de Regras, clique em **Rules Playground** (ou "Simulador de regras"). Em cada teste:
- **Tipo de simulação:** get, create ou update (o que o teste disser).
- **Local:** o caminho, por exemplo `sv2_login/joana.silva`.
- **Autenticado:** ligado; **Provedor:** password; **Firebase UID:** o UID da conta do teste.
- **Dados do documento** (create e update): cole o JSON do teste.
- Clique em **Executar**. Deve sair o resultado escrito em "Esperado".

## Os testes

### R1 · Login (sv2_login)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 1 | C | create | `sv2_login/<login do C>` (de um login ainda sem documento) | `{"uid":"<UID do C>","email":"c@exemplo.com"}` | Permitido |
| 2 | C | create | `sv2_login/<login do L>` (sem documento) | `{"uid":"<UID do C>","email":"c@exemplo.com"}` | **Negado** |
| 3 | A | update | `sv2_login/<login do C>` | `{"uid":"<UID do C>","email":"novo@exemplo.com"}` | Permitido |
Se o teste 1 der Negado: o login gravado no cadastro do C é diferente do id do documento (maiúscula, espaço). Me mande o print.

### R2 · Pedidos (sv2_aprov), num pedido **pendente** do C para o L
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 4 | L | update | `sv2_aprov/<id>` | o documento com `"status":"aprovado"` e `"decisao":{"por":"<UID do L>"}` | Permitido |
| 5 | C | update | o mesmo | o mesmo, com `"por":"<UID do C>"` | **Negado** |

### R3 · Material (sv2_alm_itens)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 6 | C | update | `sv2_alm_itens/<id>` | o documento igual, só com `"preco": 12.5` | Permitido |
| 7 | C | update | o mesmo | o documento igual, só com `"minimo": 0` mudado | **Negado** |
| 8 | C | create | `sv2_alm_itens/teste-regra` | `{"nome":"Teste"}` | **Negado** |
| 9 | L | create | `sv2_alm_itens/teste-regra` | `{"nome":"Teste"}` | Permitido |

### R4 · Tarefas (sv2_tarefas)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 10 | C | create | `sv2_tarefas/teste1` | `{"titulo":"x","respId":"<UID do C>","porId":"<UID do C>"}` | Permitido |
| 11 | C | create | `sv2_tarefas/teste2` | `{"titulo":"x","respId":"<UID do L>","porId":"<UID do C>"}` | **Negado** |
| 12 | L | create | `sv2_tarefas/teste3` | `{"titulo":"x","respId":"<UID do C>","porId":"<UID do L>"}` | Permitido |

### R5 · Número do relato (sv2_bugs_seq)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 13 | C | update | `sv2_bugs_seq/n` | `{"ultimo": <o número atual + 1>, "ts":"x", "porId":"<UID do C>"}` | Permitido |
| 14 | C | update | `sv2_bugs_seq/n` | `{"ultimo": 99999}` | **Negado** |

## Deu tudo como esperado?
1. Clique em **Publicar**.
2. No EFCwork **e no EFClaudian**, com a conta de um Colaborador, faça uma Entrada no Almoxarifado e abra Meu dia. Com a conta de um Líder ★, passe uma tarefa para um liderado e decida um pedido.
3. Se aparecer "permissão negada" em qualquer um: cole de volta o `regras-antes-v0.6.32.txt`, publique e me mande o print com o que estava fazendo.

Nada aqui apaga dado. Os documentos de teste (teste-regra, teste1…) só existem no Simulador: ele não grava.
