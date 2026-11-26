# EFCwork v0.6.36 · Como testar as regras do Vértice (P3c) no Simulador do Firebase

O Simulador testa as regras **sem publicar**: você cola no editor, simula e só aperta "Publicar" no fim, se tudo der certo.
O Simulador não grava nada: os documentos de teste você cria à mão no console. Gravar um arquivo inteiro pelo Vértice só fica provado na P4.

## Antes de tudo (1 minuto)
0. O app precisa estar na v0.6.36 (publicada antes das regras) e você precisa abri-lo uma vez como Administrador: ele grava o mapa das pastas que a regra nova lê. Com as regras novas, a v0.6.35 não salva mais as Pastas do Vértice.
1. Abra console.firebase.google.com › seu projeto › **Firestore Database** › aba **Regras**.
2. Copie todo o texto que está lá para um arquivo `regras-antes-v0.6.36.txt` no computador. É a sua volta: se algo der errado, cola esse texto de volta e publica.
3. Apague o texto do editor e cole `REGRAS-FIRESTORE-EFCwork-v0.6.36-PROPOSTA.txt`. **Não publique ainda.**
4. Se aparecer um X vermelho numa linha, pare e me mande um print.

## Os UIDs de que você vai precisar
Em **Authentication › Users**, copie o "User UID" de três contas: **A** = você (Administrador); **L** = um Líder ★; **C** = um Colaborador comum.

## Como simular
**Rules Playground** › Tipo (get, create ou update) › Local (o caminho) › Autenticado ligado, Provedor password, Firebase UID da conta › Dados (create e update) › **Executar**.

## Prepare 3 documentos de teste (no console, aba Dados; o console não passa pelas regras)
- `vtd_partes/teste1_1_<UID do L>_0`: campos `arq` = teste1, `versao` = 1 (número), `n` = 0 (número), `b64` = abc, `porId` = <UID do L>.
- `vtd_arquivos/teste1`: `v` = 1, `id` = teste1, `ficha` = mapa com `nome` = Teste, `versao` = 1, `versaoPartes` = 1, `pasta` = Formulários, `partes` = 1, `partesDe` = <UID do L>, `bytes` = 3, `porId` = <UID do L>, `porNome` = o nome do L no cadastro (números como número).
- Em Administração › Pastas do Vértice (no app já na v0.6.36): Formulários = "Só as pessoas marcadas", sem o C; Fluxogramas = "Todos".
Depois dos testes, apague esses 2 documentos no console (ou deixe: ninguém os vê no app).

## Os testes
Contas: **A** = você; **L** = Líder ★ (que não seja conta de teste); **C** = Colaborador comum.

### Ler (o mais importante)
| # | Conta | Tipo | Local | Esperado |
|---|---|---|---|---|
| 1 | C | get | `vtd_arquivos/teste1` (pasta Formulários, C não marcado) | **Negado** |
| 2 | L | get | `vtd_arquivos/teste1` | Permitido (Líder ★ lê tudo) |
| 3 | C | get | `vtd_partes/teste1_1_<UID do L>_0` | **Negado** (o pedaço segue a pasta do arquivo) |
| 4 | L | get | `vtd_arquivos/nao-existe` | Permitido ("não existe") |
Agora marque o C em Formulários e repita o 1: **Permitido**. Mude teste1 para `pasta` = Fluxogramas no console e repita com o C desmarcado: **Permitido** (pasta de todos).

### Gravar pedaços (vtd_partes)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 5 | L | create | `vtd_partes/teste1_2_<UID do L>_0` | `{"arq":"teste1","versao":2,"n":0,"b64":"abc","porId":"<UID do L>"}` | Permitido (versão seguinte) |
| 6 | C | create | `vtd_partes/teste1_2_<UID do C>_0` | o mesmo, com `"porId":"<UID do C>"` | **Negado** (só Principal e Líder ★ salvam) |
| 7 | L | create | `vtd_partes/teste1_3_<UID do L>_0` | o do 5, com `"versao":3` | **Negado** (pulou uma versão) |
| 8 | L | create | `vtd_partes/teste1_2_<UID do A>_0` | o do 5 | **Negado** (o id leva a conta de quem grava) |
| 9 | L | update | `vtd_partes/teste1_1_<UID do L>_0` | o documento igual, com `"b64":"xyz"` | **Negado** (pedaço nunca muda) |

### Gravar a ficha (vtd_arquivos)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 10 | L | update | `vtd_arquivos/teste1` | o documento igual, com `"versao":2` e `ficha.nome` = Teste 2 (mesmos `versaoPartes`, `partesDe`, `partes`, `bytes`) | Permitido (só a ficha muda, sem reenviar) |
| 11 | L | update | o mesmo | o documento igual, com `"versao":3` | **Negado** (pulou uma versão) |
| 12 | L | update | o mesmo | o do 10, com `"versaoPartes":2` | **Negado** (os pedaços da versão 2 não existem) |
| 13 | C | update | o mesmo | o do 10 | **Negado** |

### Pastas do Vértice (sv2_cfg)
| # | Conta | Tipo | Local | Dados | Esperado |
|---|---|---|---|---|---|
| 14 | A | update | `sv2_cfg/vertice_pastas` | o documento igual | Permitido |
| 15 | A | update | o mesmo | o documento sem o campo `acesso` | **Negado** (app antigo) |
| 16 | L | update | o mesmo | o documento igual | **Negado** (só o Principal) |
| 17 | L | update | `sv2_cfg/tarefas` | o documento que está lá, sem mudar nada | Permitido (o resto do sv2_cfg não mudou) |

Se o 10 der Negado, confira se `porNome` é exatamente o nome do L no cadastro.

## Se tudo der o esperado
Aperte **Publicar**. Se algum der diferente, não publique: me mande o print do teste e do resultado.
