# Nota do Cwork para a conversa do Vértice · P3c, regras dos documentos na nuvem (26/11/2026)

O Elias leva este texto para a conversa do Vértice. É o formato que as regras do Firestore (EFCwork v0.6.36, blocos [R7]) aceitam. A P4 (gravar e abrir de verdade) é feita na conversa do Vértice e precisa seguir este formato. Para mudar o formato, a regra também muda, sempre com a ordem do Elias.

## vtd_arquivos/{id} (a ficha)
- Campos aceitos: `v` (sempre 1), `id` (igual ao id do documento), `ficha` (um mapa: a ficha do Vértice, sem `nuvem`), `versao` (número inteiro), `versaoPartes` (a versão dos pedaços que a ficha usa), `pasta`, `partes` (inteiro de 1 a 200), `partesDe` (uid de quem gravou os pedaços), `bytes` (inteiro, 0 ou mais), `porId` (uid de quem grava), `porNome` (o nome do cadastro do Cwork de quem grava, igual), `em`, `srv`, `testeConta`. Qualquer outro campo é recusado.
- `pasta`: uma das 5 dos Impressos: Etiquetas, Fichas e custódias, Formulários, Fluxogramas, POPs e procedimentos.
- Arquivo novo: `versao: 1`. Cada gravação seguinte: `versao` exatamente 1 acima da que está na nuvem. Se outra pessoa gravou no meio, a regra recusa ("permission-denied"). É o "conflito" do `nuvem.js`: ler de novo e fazer a cópia em conflito.
- **Conteúdo novo:** `versaoPartes` = `versao`, `partesDe` = a própria conta, e os pedaços dessa versão gravados antes. **Só a ficha muda** (renomear, mudar de pasta, lixeira): mantenha `versaoPartes`, `partesDe`, `partes` e `bytes` iguais aos da nuvem; a versão sobe 1 e nada é reenviado.
- Só o Principal e o Líder ★ gravam (ITEM 196). Ninguém apaga: a lixeira é um campo dentro da `ficha`.
- Lê: o Principal e o Líder ★ leem tudo. Os outros leem as pastas de todos e aquelas em que estão marcados (sv2_cfg/vertice_pastas, mapa `acesso`). Para quem não é Principal nem Líder ★, **ler por id** (um arquivo por vez) é o caminho garantido. Consulta em lista com `where('pasta', '==', ...)` pode ser recusada pelo Firestore (a regra consulta outro documento com o nome da pasta); testar na P4 com uma conta comum antes de contar com ela.
- Arquivo que não existe: o Principal e o Líder ★ recebem "não existe"; os outros recebem "negado".
- `pasta` com o texto idêntico ao do Cwork (mesmos acentos).

## vtd_partes/{arq}_{versao}_{uid}_{n} (o conteúdo)
- Campos aceitos: `arq` (id do arquivo), `versao`, `n` (0 a 199), `b64` (até 900 mil letras), `porId` (uid de quem grava), `em`, `srv`, `testeConta`.
- O id é exatamente `<arq>_<versao>_<uid de quem grava>_<n>`, e `versao` é a do arquivo na nuvem + 1 (ou 1, se o arquivo ainda não existe).
- Os pedaços só são criados. Nunca mudam nem se apagam (pedido de outra versão = pedaços novos).
- Lê quem lê o arquivo.

## Ordem para gravar
1. Ler a versão da nuvem (v). Gravar os pedaços da versão v+1, **um por gravação** (não num lote grande: a regra consulta o arquivo em cada pedaço e há limite de consultas por pedido).
2. Gravar a ficha com `versao: v+1`, `versaoPartes: v+1`, `partes: N`, `partesDe` = a própria conta. A regra confere se o primeiro e o último pedaço existem (os do meio, o Vértice confere).
3. Repetir um pedaço que já foi gravado dá "negado" (pedaço nunca muda): tratar como "já gravado".
4. Recusou na ficha: alguém gravou antes (conflito). Os pedaços enviados ficam sem uso (não atrapalham ninguém, porque o id leva a conta de quem gravou).

## Fica com o Vértice
- Usar o Firebase do Cwork (a porta ou o próprio objeto do Cwork na moldura, mesmo endereço) para ler e gravar.
- O que o Cwork mostra: o Cwork não lê vtd_* nesta versão.
- Pedaços das versões antigas ficam na nuvem (nada se apaga). Se o espaço pesar, o Elias decide depois um jeito de esvaziar.
