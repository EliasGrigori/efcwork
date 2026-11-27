# EFCwork · CONTINUAR (27/11/2026 18:3x) · NO AR: Cwork v0.6.44 + Vértice v0.6.79 · PRONTA, NÃO PUBLICADA: v0.6.45 + Vértice v0.6.80 (fichas com todos os dados, aprovada) · DEPOIS: kit na água

Substitui o CONTINUAR-EFCwork-v0.6.44.md (o arquivo tem o nome v0.6.45). Quem ler só este arquivo sabe o que fazer.

## 0. Estado
- **PRONTA E APROVADA, NÃO PUBLICADA: Cwork v0.6.45 + Vértice v0.6.80 (ITENS 284 a 286, todos aprovados em 27/11 18:14).** Falta só o "pode publicar". O código está em `MUDANCAS-NAO-PUBLICADAS-v0.6.45.patch` (no pacote): clone o efcwork, confira que a `main` está em 3b5bdd4 (ou depois, sem conflito), `git apply` o patch, rode `npm ci` em `vertice/fonte`, monte os dois e rode `t_v0645` antes de publicar. O que faz: contrato dicionário 2 (grupo, X do material, 6 colunas novas, 60 campos); uma folha por material + análise; "Como preencher" (separadas ou unificada, ITEM 285); "Escrever nesta folha" abre a folha preenchida no modo documento. Último ITEM usado: **286**.
- **Skill:** o Elias pediu (ITEM 284) guardar a regra da marca d'água numa skill: foi mostrada a proposta de melhoria da efcwork-fluxo-de-trabalho; se ele não salvou, mostrar de novo.
- **Etapa 4 PUBLICADA em 27/11 16:3x (Cwork v0.6.44 + Vértice v0.6.79, ITENS 280 a 283, todos aprovados).** Kit do laboratório com papéis direto do Vértice: Anexar papel lista as planilhas das 5 pastas do Vértice e tudo de Impressos; ligação com `fonte: 'vertice'` em sv2_impressos; até 2 papéis de custódia ou ficha por laboratório; o papel do Vértice abre no Vértice já preenchido (pedido com `soMarcados`: vale só o que o documento marca); o que já estava anexado fica (o Elias troca). Último ITEM usado: **283**.
- **Etapa 3 PUBLICADA em 27/11 (Cwork v0.6.43 + Vértice v0.6.78, ITENS 272 a 279, todos aprovados).** Etiquetas das amostras automáticas, feitas no Vértice: Coletas › Cadastros › Modelos de etiqueta (material + laboratório → planilha da pasta Etiquetas do Vértice, em `sv2_cfg/coletas.etqVertice`); ícone de etiqueta em Amostras (lista filtrada), na gaveta da remessa e botão "Etiquetas" no aviso depois de "Coletado"; o Vértice monta as folhas (`#/pedido/et<pid>`, recurso `etiquetas` da porta; uma etiqueta por amostra repetida na folha do modelo); valores pelas regras do `etValor` do EFClaudian; cabeçalho escrito no próprio modelo (ITEM 277); nada se escreve na impressão (ITEM 279); imagem do Excel agora imprime (ITEM 278). Último ITEM usado: **279**.
- **Falta o Elias:** criar as etiquetas de verdade no Vértice e ligar (PENDENCIAS, seção D); abrir Documentos internos no aparelho que tinha o FLUX 0002 preso e mandar o motivo.
- **REGRAS de 27/11 (memória e dossiê):** NUNCA inventar documento, nem de teste; documento dele se copia fiel. Todo modelo de teste leva marca d'água "MODELO NÃO OFICIAL · SÓ PARA TESTE" (`tools/visual/v0643/amostras/gerar.py` faz assim).
- **Toda entrega leva o pacote de conversa nova.**

## 1. TEXTO PARA COLAR NA CONVERSA NOVA

> EFCwork, continuando. Anexei o pacote único (EFCwork-PACOTE-NOVA-CONVERSA-v0.6.45.zip): CONTINUAR, dossiê, pendências, o app no ar e o fonte. Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" sem eu repetir. Repositório: EliasGrigori/efcwork (add_repo com envio; se negar, me diga e use o fonte do pacote). Esta conversa pode mexer no Vértice (vertice/fonte). Nunca invente documento; modelo de teste com marca d'água. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano. Toda entrega: o pacote único atualizado.

## 2. Próxima tarefa
1. **Publicar a v0.6.45 + Vértice v0.6.80** (só com "pode publicar"; o patch está no pacote).
2. **Parte 2 · kit e papéis do envio nas coletas de água (Opus 5.5 · alto; decisão de 27/11 17:22).** As coletas de água (`sv2_aguacol`) têm `envio` e `lab` em cada coleta, sem remessa própria: criar a remessa de água (mesmo envio + laboratório), a gaveta com o ícone dos papéis e o mesmo kit do laboratório; dados de cada amostra: data, hora, ponto (identificação), análise, coletor, O.S, observação, material Água (X em "grupo.xagua"). Código do frasco, matriz, nº de frascos, preservação e medidas de campo são escritos à mão ("Escrever nesta folha"). Página de aprovação antes.
3. Cadeias em Word (BIOAGRI, H2O): em espera (ele refaz em planilha).
4. Depois: as 3 sobras (pedido imprime todas as abas; "Recebidos do Cwork" fora das 5 pastas; tema do Vértice) e a observação do ITEM 286 (imprimir pela folha aberta não avisa o Cwork de "preenchido").

## 2e. O que a v0.6.45 faz (Cwork) + Vértice v0.6.80
- Contrato `efd-v1.js` (igual nos dois lados): dicionário 2. Cwork `ponte.js` (`ptGrupos`, `ptFolhaDoGrupo`, unificada), `remdocs.js` (folhas no pedido do Vértice), `kit.js` ("Como preencher"). Vértice `ponte/ponte.js` (rótulos), `ponte/pedido.js` (conteúdo de cada folha), `ponte/camposUi.jsx` (folhas e "Escrever nesta folha"), `ponte/rascunhoPedido.js`, `ui/modoDocumento.jsx`, `ui/internos.css`. Testes `t_v0645`, `testes/planilha/v0680.test.mjs`; modelo de TESTE `tools/visual/v0645/amostras/teste-grupos.xlsx` (com marca d'água). Página `docs/aprovacao-efcwork-v0.6.45-fichas.html`.

## 2d. O que a etapa 4 faz (Cwork v0.6.44 + Vértice v0.6.79)
- Cwork `kit.js` (`ktVtDoc`, `ktLerVt`, `KT_DOCS_MAX = 2`, `ktDocsDoLab`), `remdocs.js` (`drPreenche` e `drPedido` com o papel do Vértice). Vértice `ponte/campos.js` (`soMarcados`). Testes: `t_v0644`, `t_v0610` ajustado, `v0678.test.mjs`. Fotos HOJE `tools/visual/v0644/hoje.js`; página `tools/visual/v0644/pagina.py`.

## 2c. O que a etapa 3 faz (Cwork v0.6.43 + Vértice v0.6.78)
- Cwork `src/etiquetas.js` (prefixo et); ganchos em cadcol.js, coletas.js, programacao.js, base.js/fluidez.js (aviso com botão de outro nome), vertice.js (recurso `etiquetas`), montar.py.
- Vértice `src/ponte/etiquetas.js` (motor, testado no node), `etiquetasUi.jsx`/`etiquetas.css` (tela), `camposUi.jsx` (grupo "Etiqueta da amostra"; nomes `efc_et_<campo>`), `imprimirLivro.js` (imagem imprime). App.jsx com 799 linhas (limite 800).
- Testes: `t_v0643` (Cwork + Vértice montados) e `testes/planilha/v0678.test.mjs`. Fotos HOJE: `tools/visual/v0643/hoje.js`; página: `tools/visual/v0643/pagina.py`.

## 3. O que a v0.6.37 faz
- Janela no meio quando há versão nova; "Depois", Esc, voltar ou toque fora deixam "Atualizar o app" no pé do menu (bolinha no botão do menu do celular). Procura versão ao abrir, ao voltar para o app (mínimo 5 min), quando a internet volta e a cada 30 min. Nada recarrega sozinho. "Atualizar" pergunta antes se há ficha ou rascunho não gravado, gravação pendente na nuvem ou abas do Vértice/Sabiá.
- Conserta: a versão nova guardava a tela antiga; abrir outro arquivo pelo endereço trocava a tela guardada.
- De 0.6.36 para 0.6.37 não aparece aviso (a 0.6.36 não tem a função).
- **Ao criar tela com rascunho fora de `S.fm`, incluir em `vnPreenchido()` (versao.js).**

## 4. Código
- `add_repo` (access push) funcionou em 26/11 21h; antes tinha sido negado. Se negar, dizer ao Elias.
- Sem repositório: descompactar o fonte (`fonte/src`, `fonte/tools`, `fonte/docs`) numa pasta vazia chamada `projeto`.
- Montar: `cd projeto && python3 tools/montar.py` (gera `dist/`). A versão fica em `VERSAO` (`src/base.js`); o cache do sw é `efcwork-<versão>`.
- Testes: `NODE_PATH=$(npm root -g) node tools/testes/t_*.js` (um por vez ou `xargs -P 3`, em dois lotes de comando, cada comando até 600 s). Depois: desfazer os prints regravados (`git checkout -- projeto/tools/testes/telas`).
- Medidor: `NODE_PATH=$(npm root -g) node tools/auditoria/medir.js tools/auditoria/efcwork.json --estrito` (0 defeitos).
- Publicar: copiar de `dist/` para a raiz do repositório index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png; `git add` esses, `projeto/src`, docs e testes (nunca `dist/`; `projeto/dist` está rastreado no git, então desfazer com `git checkout -- projeto/dist` depois de copiar para a raiz); commit com os trailers da sessão; `git push origin HEAD:main`. O Vértice (`vertice/`) só com a autorização de 27/11 07:22 (as 3 etapas); passos na seção 2.
- Página de aprovação desta versão: `tools/visual/v0637/cap.js` e `monta.py` (as 5 formas foram filmadas com o protótipo; o código atual tem só a escolhida).

## 5. Padrão de trabalho (o que ele amou; não perder)
1. Sugerir modelo e esforço em **negrito**; esperar "pode iniciar". **Lembrar de novo no começo de CADA tarefa e ao retomar depois de um resumo da conversa** (27/11 09:50: a etapa 2 foi feita no Sonnet porque não lembrei; ele pediu revisão de tudo).
2. Uma frase do que vai fazer; lista de tarefas; tudo em primeiro plano (nada em segundo plano nem agendado).
3. Provar o antes, implementar e testar: teste da versão, bateria, medidor `--estrito`, auditoria visual (skill auditoria-visual-efc); revisor novo quando o risco é alto.
4. Mudança visual passa por página de aprovação antes. Só aplica o aprovado.
5. Registrar tudo no dossiê, atualizar o CONTINUAR e as pendências (mandar o arquivo a cada mudança).
6. Entregar: ZIP da versão, dossiê, CONTINUAR e resumo final (o que mudou, o que conferir no Firebase, próximos passos, modelo e esforço em negrito, o que não deu para provar).
7. Avisar quando for hora de conversa nova e mandar tudo, sem OneDrive.

**Página de aprovação:** número grande do ITEM; Aprovado/Reprovado e comentário; imagens que ampliam (HOJE/PROPOSTA) do app de verdade; movimento em vídeo ou animação do app real; "Copiar respostas"; uma mudança por item; com dúvida visual, 5 ou mais modelos com "OPÇÃO N" grande; referências reais da internet.

**Regras visuais:** sem "cara de IA" e sem emoji; limpo e compacto; botões e campos lado a lado alinhados; um único filtro recolhível; menus de coluna estilo Sankhya; opção em janela retrátil; excluir é lixeira no canto; imprimir é só o ícone; Esc e voltar do celular uma camada por vez; tela sem permissão some; avisos sobem de baixo; movimento só pela escala 40, 80, 150, 250, 350, 400, 500 ms.

**Proibições:** **NUNCA inventar documento, nem como exemplo de teste (regra do Elias de 27/11 13:50, "última vez que falo"): não mudar campos, ordem, cabeçalho ou desenho; a etiqueta das amostras é IGUAL à do EFClaudian; todo modelo de teste leva marca d'água visível "MODELO NÃO OFICIAL · SÓ PARA TESTE" (27/11 14:00)**; não abrir nem tentar o OneDrive sem ele pedir pelo nome; nada no EFClaudian; não falar dos prints antigos do repositório público; dado real, senha e chave nunca entram no projeto; regras do Firestore são compartilhadas com o EFClaudian (alto risco).

## 6. Depois (cada uma só com "pode iniciar")
1. Relatórios › Coletas em aberto · Conversas · Etiquetas de campo · Só ver por área (a ordem é do Elias).
2. Etapa 3 da integração com o Vértice (Cwork apontando para o Vértice), depois da etapa 2 aprovada e publicada. Lista em PENDENCIAS.

## 7. Decisões em aberto (perguntar uma por vez, na hora certa)
- Senha mínima: 8 (hoje) ou 15.
- Tirar "N amostras" da barra das tabelas no celular (item 44).
- Caixinha "Conferir quando terminar" no formulário de tarefa; teto de 10 abas do Vértice; quem troca o nome do usuário.

## 8. Peças que se reaproveitam
- Tabela `tbHTML`; gavetas `gvAbrir`; fichas `LC_FORM.<tipo>` com `lcAbrir`, `lcPe`, `lcBl`, `lcErro`; ações `DD_AO.<prefixo>`; `ddHTML`; confirmação `csConfirma`; dados `Data.col/lote/semPendentes`; avisos `Notif.send`; auditoria `Audit.log`.
- Todo dado em HTML passa por `esc()` (`t_html_seg`).

## 9. Firebase
- Etapa 1 (no ar): as regras [R7] já estavam publicadas (v0.6.36); falta o roteiro curto no site (PENDENCIAS, seção D). Nada a configurar.
- Etapa 2: nada no Firebase (o documento aberto pelo Cwork não grava nada).

## 10. Armadilhas
- `projeto/dist` rastreado no git está velho (0.6.34): **montar antes de testar**, inclusive depois de um `git checkout -- dist`.
- `t_v067` falha por datas (antigo, ABERTO). `t_v0636v` precisa do clone antigo do EFCdocs (variável do teste). `t_v034` e `t_v0635f` podem falhar em paralelo e passam sozinhos.
- O registro do sw só acontece em https; em teste local, registrar à mão (ver `t_v0637.js`).
- Texto de botão cortado no celular: rótulo curto. Linha larga na tabela: esconder colunas por padrão.
- `t_v0633` procura `fonte/testes/amostras` dentro do `VERTICE_DIR`: para testar o Vértice montado, criar uma pasta com o `dist/` copiado e um atalho `fonte` → `vertice/fonte` (ex.: `/tmp/vd`). Ele oscila às vezes no passo "o pedido ficou anotado" (repetir).
- `t_v0636v` confere a pasta `vertice/` publicada contra o `package.json`: falha enquanto o Vértice novo não for copiado para `vertice/` (normal antes de publicar).
- Vértice: `App.jsx` com 798 linhas (limite 800). Para mudar algo lá, mexer na linha que já existe ou passar para um arquivo novo.

