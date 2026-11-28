# EFCwork · CONTINUAR (28/11/2026 10:4x) · NO AR: Cwork v0.6.50 + Vértice v0.6.84 · Só ver por área publicado (regras [R8] esperando o Simulador)

Substitui o CONTINUAR-EFCwork-v0.6.46.md de 08:3x (mesmo nome: o Cwork não mudou de versão). Quem ler só este arquivo sabe o que fazer.

## 0. Estado
- **PUBLICADA em 28/11 10:4x: Cwork v0.6.50 · Só ver por área** (sem página e sem revisor, ordem do Elias às 10:21). Em Pessoas, cada área Não vê · Só ver · Ver e alterar; numa área "Só ver" o que altera some; "Não vê" some de verdade em todas as áreas (antes Cloro, Apontamentos, Documentos e Qualidade apareciam para todos). **Falta o Elias:** conferir Administração › Pessoas; rodar `docs/GUIA-SIMULADOR-v0.6.50.md` e colar `docs/REGRAS-FIRESTORE-EFCwork-v0.6.50-PROPOSTA.txt`. Último ITEM usado: 317. Firebase: regras [R8] a colar.
- **PUBLICADA em 28/11 08:5x: Cwork v0.6.49 + Vértice v0.6.84 · PDF preenchido de volta (ITEM 184; ITENS 315 a 317 Aprovados; efcwork a44773b).** Último ITEM usado: **317**. Firebase: nada muda.
- **O que a v0.6.49 faz:** o Vértice responde o pedido com `como` (imprimir/pdf) e o PDF preenchido (até 650 KB); o Cwork guarda o PDF na remessa (`sv2_rem_arq` + registro "preenchido" com `arqId`), mostra o botão do PDF na gaveta e "PDF preenchido no Vértice" quando só baixou.
- **PUBLICADA em 28/11 07:4x: Cwork v0.6.48 + Vértice v0.6.83 · documentos só no Vértice, 2ª parte (efcwork d59e4cf; ITENS 308 a 314 todos Aprovados; revisor novo e 9 correções no dossiê).** Último ITEM usado: **314**. Firebase: nada muda.
- **O que a v0.6.48 faz:** "Levar para o Vértice" na gaveta de cada impresso antigo (só quem salva no Vértice): PDF, foto e Word sobem como PDF; Excel abre no Vértice como planilha na pasta escolhida; o antigo sai da lista e fica guardado (`levadoPara`). Kit e Treinamentos seguem o levado e listam os do Vértice; backup com `vtd_arquivos` e `vtd_partes`; Reserva e espaço com os do Vértice; cópia em conflito fora do Cwork.
- **PUBLICADA em 28/11 06:0x: Cwork v0.6.47 + Vértice v0.6.82 (efcwork 76354c2; ITENS 300 a 307 todos Aprovados; revisor novo e correções no dossiê).** Último ITEM usado: **307**. Firebase: nada muda.
- **PUBLICADAS em 27/11 (noite):** Cwork v0.6.46.1 (bef3c2d: trava do pedido do papel vindo do Vértice — "O Cwork pediu a versão 10…") e v0.6.46.2 (0c7d2e8: etiqueta sem modelo liga ali mesmo e imprime; a lista traz as etiquetas dos Impressos vindas do Vértice).
- **PUBLICADA em 27/11 20:3x: Vértice v0.6.81 (o Cwork não mudou; segue v0.6.46). ITENS 294 a 299 todos Aprovados** (299: "não entendi nada mas tá aprovado, não precisa mais explicar, confio em você"). Commit: b921957. Último ITEM usado: **299**.
- **O que a v0.6.81 faz:** pedido do Cwork imprime só a aba com campos; Recebidos do Cwork com aviso e Mover (e Nuvem "Só neste aparelho"); o Vértice segue o tema do Cwork; no Escuro, planilha e quadro brancos como no Excel, com a chave "Área de trabalho escura no tema escuro" em Opções; imprimir pela folha aberta registra "Preenchido no Vértice" no Cwork.
- **PUBLICADA em 27/11 19:0x: Cwork v0.6.46** (efcwork accc354; ITENS 287 a 293, kit nas coletas de água; página `docs/aprovacao-efcwork-v0.6.46-agua-kit.html`).
- **O que a v0.6.46 faz:** remessa de água = coletas de água (sv2_aguacol) do mesmo envio e laboratório (chave `agua:<envio>|<lab>`, nada novo gravado). "Ver a remessa (N coletas)" no detalhe; gaveta com o ícone dos papéis (o MESMO kit do laboratório), Documentos da remessa e as coletas; "Papéis" no aviso depois de informar o envio (decisão minha, ITEM 292); dados de cada coleta para o Vértice (data, hora, ponto, análise, coletor, O.S, observação, material Água, X em grupo.xagua), uma folha por análise; o resto à mão. Correção junto: a situação não é cortada na lista da remessa (ITEM 293). Pergunta sem código no fim da página: remessas de água também em Envio › Remessas?
- **PUBLICADA em 27/11 18:2x: Cwork v0.6.45 + Vértice v0.6.80** (efcwork 964c801; fichas com todos os dados, ITENS 284 a 286).
- **Etapas anteriores publicadas:** etapa 4 (v0.6.44 + Vértice v0.6.79, kit com papéis do Vértice), etapa 3 (v0.6.43 + v0.6.78, etiquetas), etapas 1 e 2 (nuvem e modo documento).
- **Falta o Elias:** criar as etiquetas de verdade no Vértice e ligar; trocar os papéis antigos do kit pelos do Vértice; roteiros da seção D das PENDENCIAS.
- **REGRA de 28/11 08:24:** nada no Sabiá sem o Elias pedir (nem a cópia do acordo da ponte).
- **REGRA de 28/11 08:30 ("anota aí"):** todo plano e todo próximo passo se decide com o Elias, SEMPRE por questionário (AskUserQuestion) com as opções; não deixar plano anotado por conta própria nem escolher sozinho o próximo passo.
- **REGRAS de 27/11 (memória, dossiê e skill):** NUNCA inventar documento, nem de teste; documento dele se copia fiel. Todo modelo de teste leva marca d'água "MODELO NÃO OFICIAL · SÓ PARA TESTE" (`tools/visual/v0646/amostras/gerar.py` faz assim).
- **REQUISITO de 28/11 08:54 (Conversas e avisos):** o diálogo também existe dentro do Kanban e do quadro de post-it do Vértice (comentários nos cartões e nas notas), e a central das notificações é o Cwork (o sino do Cwork avisa também o que acontece nessas conversas do Vértice). Como ligar: só por questionário com o Elias.
- **Toda entrega leva o pacote de conversa nova.**

## 1. TEXTO PARA COLAR NA CONVERSA NOVA

> EFCwork, continuando. Anexei o pacote único (EFCwork-PACOTE-NOVA-CONVERSA-v0.6.49-vertice-v0.6.84.zip): CONTINUAR, dossiê, pendências, o app no ar e o fonte. Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" sem eu repetir. Repositório: EliasGrigori/efcwork (add_repo com envio; se negar, me diga e use o fonte do pacote). Esta conversa pode mexer no Vértice (vertice/fonte). Nunca invente documento; modelo de teste com marca d'água. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano. Toda entrega: o pacote único atualizado.

## 2. Próxima tarefa
1. **Próxima tarefa: decidir com o Elias por questionário** (opções que sobram: Conversas, com o requisito do Kanban e do post-it; sobras das PENDENCIAS).
   - O Elias leva os impressos antigos para o Vértice, um por um, quando quiser.
2. Outras opções que ficaram: Conversas · sobras da 2ª parte (PENDENCIAS, seção do Vértice).

## 2g. O que a v0.6.47 faz (Cwork) + Vértice v0.6.82
- Vértice: tipo `pdf` (`nucleo/pdf.js`, `ui/externos.jsx`): Documentos externos com as 5 pastas, Importar PDF (ou foto), ver, baixar, imprimir, trocar. O formato do conteúdo é o mesmo que o Cwork grava.
- Cwork: `src/impvt.js` (prefixo iv): Impressos com os documentos do Vértice (coluna Guardado), PDF lido da nuvem e guardado no aparelho, planilha/quadro em `#/documento/<id>`, importar PDF/foto grava no Vértice. Testes que precisam de impresso antigo usam `antigo: true` no formulário `ipEd`.
- `etiquetas.js` (v0.6.46.2): `etFaltaLigar`, `etDocsTodos`; `remdocs.js` (v0.6.46.1): `doVt` (origem 'docs' pedido sem `rev`).

## 2f. O que a v0.6.46 faz (Cwork)
- `src/aguarem.js` (novo, prefixo ar; módulo depois de `agua`): `remAgua`, `remEnvio`, `arLoteK`, `arColetas`, `arAmostra`, `remLote`, `remNomeAm`, `arAbreLote`, `arBotaoRemessa`. Ganchos: `kit.js` (`ktImpId`, `ktRemNome`, `ktPapCarrega`, `ktPapAbre`, `ktImprimir`, `ktSaiUm`), `remdocs.js` (`drDadosEnvio`), `ponte.js` (`ptResumoEnvio`), `agua.js` (botão no detalhe, botão "Papéis" no aviso), `coletas.css` (pílula inteira). Teste `t_v0646` (28 ok; `EFC_DIST=<pasta>` tira as fotos HOJE); modelo de TESTE `tools/visual/v0646/amostras/teste-agua.xlsx`; página `tools/visual/v0646/pagina.py`.
- **Ao criar algo que lê uma remessa (campo ou água), usar `remLote(k)`, `remEnvio(k)` e `remNomeAm(c)`; não `coLote` nem `k.split('|')[0]`.**

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
- `t_v0633` precisa do Vértice montado numa pasta com `fonte` → `vertice/fonte` (`/tmp/vd`, seção 10).
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


## 2h. O que a v0.6.50 faz (Cwork)
- `src/sover.js` (prefixo sov): `soVer`, `sovDaRota`, `SOV_COLS`, `SOV_APROV`; `isSup`/`podeLancar` de `S.user` respondem "não" numa área "Só ver" (`isSupGeral` é a de antes); "Não vê" põe `negada` nas áreas e abas. **Ao criar tela nova numa área, usar `isSup(S.user)`/`podeLancar(S.user)` para o que altera (a trava vem junto) e pôr a coleção nova em `SOV_COLS` e nas regras [R8].** Teste `t_v0650` e `t_v0650r`.
