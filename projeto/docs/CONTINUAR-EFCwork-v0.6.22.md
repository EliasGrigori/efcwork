# EFCwork · CONTINUAR (20/11/2026, 09h45) · estado: v0.6.22 PUBLICADA; próxima tarefa: as 3 abas de Relatórios (Documentos, Apontamentos completo, Coletas em aberto)

Este arquivo substitui o CONTINUAR-EFCwork-v0.6.21.md. Ele é autossuficiente: quem ler só ele já sabe o que fazer.

## 0. Estado de 20/11 (09h45): v0.6.22 PUBLICADA (janela do Vértice com abas + Ponte 1; ITENS 112 a 122 aprovados; letra das abas maior e sem o ícone de abrir fora)
- v0.6.22 = Vértice e Sabiá abrem aqui dentro em abas finas (OPÇÃO 1 + recolher da OPÇÃO 3), Ponte 1 (receber do Vértice; Abrir no Vértice com o arquivo e o resumo do envio), sem travessão nos textos (ITEM 79) e Marcar na imagem do relato novo (item 49).
- Página: docs/aprovacao-efcwork-v0.6.22-janela-vertice.html (artefato publicado). Com as respostas: aplicar só o aprovado (se o 120 for reprovado, tirar o Sabiá de JN_APPS), bateria, medidor, ZIP, e publicar só com "pode publicar".
- Testes do Vértice: clonar `EliasGrigori/efcdocs` só para leitura em /home/claude/eliasgrigori/efcdocs (ou VERTICE_DIR); `t_v0622.js` e `captura14.js` servem os dois apps no mesmo endereço.
- Bateria 58/58, medidor 0 defeitos. Firebase: nada novo.
- Em aberto com o Elias: item 30 (texto das 24 regras: ele cola ou eu rascunho), item 44, tirar "N amostras" da barra das tabelas no celular (sim/não). Depois: 3 abas de Relatórios, item 22, Pessoas e perfis.

## 1. TEXTO PARA COLAR NA CONVERSA NOVA
(O mesmo texto está em TEXTO-PARA-COLAR.txt.)

> EFCwork, continuando. Anexei o pacote: CONTINUAR-EFCwork-v0.6.22.md, o dossiê, o ZIP do app (efcwork-v0.6.22-proposta.zip), o código-fonte (efcwork-v0.6.22-proposta-fonte.zip) e as respostas da página da v0.6.22 (ITENS 112 a 122). Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço dessa tarefa em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" do CONTINUAR sem eu repetir. Repositório: EliasGrigori/efcwork (anexe com add_repo); para testar a janela, clone EliasGrigori/efcdocs só para leitura. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano.

## 2. O que fazer logo ao começar (ordem)
1. Ler este arquivo, o FALTA-DO-EFCLAUDIAN.md e o fim do dossiê (últimas seções, de "v0.6.17 · Rateios" para cima).
2. Conseguir o código (seção 4). Rodar `python3 tools/montar.py` dentro de `projeto/` para provar que o ambiente funciona (imprime "versão 0.6.17" até a v0.6.18 ser numerada).
3. Responder ao Elias em 3 linhas: onde parou (v0.6.17 publicada; v0.6.18 Relatórios › Rateio esperando as respostas dos ITENS 70 a 78) e a próxima tarefa (aplicar as respostas; depois a seção 6).
4. Sugerir **modelo e esforço** em negrito e esperar "pode iniciar". Não começar antes.
5. Perguntar uma vez se o site mostra v0.6.17 no rodapé (a sessão não abre o site). Não insistir. Se não mostrar, pedir para fechar e abrir o app (cache do service worker `efcwork-0.6.17`).

## 3. Onde parou
- (histórico) **v0.6.16 publicada** no GitHub EliasGrigori/efcwork, branch main, commit **97c1d41** (em cima do 38604f0 = v0.6.15.3). Antes dela: v0.6.15 a v0.6.15.3, todas publicadas.
- A v0.6.16 trouxe **Qualidade › Não conformidades** (junta as NCs de apontamentos e auditorias, só leitura, com "Folha por pessoa" para imprimir) e **Qualidade › Bugs e sugestões** (relatar com imagem, gaveta com andamento, situação só para o Administrador, Finalizados na barra da tabela, relatório A4 com descrição e imagens). ITENS 54 a 60 aprovados e aplicados.
- Último ajuste dele (15/11 09:53): o botão-ícone Finalizados fica na barra da tabela, antes de Colunas, do mesmo tamanho dos outros; o topo da aba só tem "Reportar ou sugerir". Dois ganchos novos em `tabela.js`: `cfg.antesIcones` (HTML antes do botão Colunas) e `cfg.imprimir` (função que substitui a impressão padrão).
- Testes na publicação: t_v0616.js 53 ok; bateria de 52 arquivos sem falha (antes do último ajuste, que só acrescentou ganchos opcionais); medidor 0 defeitos.
- Os documentos desta versão (CONTINUAR, dossiê, FALTA, matriz) foram publicados junto, em `projeto/docs/` do repositório (CONTINUAR-EFCwork-v0.6.18.md; o dossiê continua com o nome DOSSIE-EFCwork-v0.6.15.md e acumula as seções).

### v0.6.17 · Rateios (15/11, 10:22 → 12h, Opus 5.5 · alto para construir, Sonnet 5.5 · médio para aplicar) — PUBLICADA
- **Publicada** no GitHub EliasGrigori/efcwork, branch main: o commit mais recente, de título "v0.6.17: Rateios" (em cima do 97c1d41 = v0.6.16). Ele disse "pode publicar" às 11:36 e o acesso `push` foi liberado nesta hora (o primeiro `add_repo` tinha sido negado).
- **Respostas dele (ITENS 61 a 69):** todos aprovados; **ITEM 67 sem resposta** (Calibração na mesma gaveta, com a Filial em pausa) — mantido como construído, porque faz parte do 65 e do 66 aprovados; avisar o Elias e mudar se ele reprovar. **ITEM 63 com pedido novo:** "o botão de limpar filtro remove isso de todas as páginas, eu limpo pelo próprio filtro".
- **Botão "Limpar filtro" removido de todo o app:** barra de todas as tabelas (`tbHTML`), tela de Atividade e o aviso de tabela vazia (`moderno.js`, que agora só diz "Nenhum resultado com o filtro atual" e quantos itens há fora dele). Apagados também `tbTemFiltroSolto`, `atTemFiltro`, os manipuladores `tb-limpa` e `at-limpa` e o CSS `.tb-limpa`. Continuam: "Limpar esta coluna" dentro do menu da coluna e os "Limpar" de seleção (marcar/desmarcar caixinhas), que não são filtro. Testes antigos que clicavam no botão (t_v020, t_v040, t_v048, t_v0414, t_v0615d, t_v0615f) passaram a limpar o estado da tabela direto e a conferir que o botão não existe.
- **Arquivos novos:** `src/rateio.js`, `src/rateio.css` (módulo `rateio` depois de `plano`), `tools/testes/t_v0617.js` (42 ok), `tools/visual/rateio-v0617/semente.js`, `pagina/captura9.js`, `pagina/itens-p9.js`, `docs/aprovacao-efcwork-v0.6.17-rateios.html`, `docs/medidor-v0.6.17.txt`.
- **Bateria:** 53 arquivos, 0 falhas (rodada depois de remover o botão). Medidor `--estrito`: 0 defeitos, 0 decisões, 80 ajustes (tamanhos de letra de sempre).
- **Firebase:** nada novo. Se aparecer "permissão negada" ao emitir solicitação, a regra de `sv2_coletas`, `sv2_aguacol` e `sv2_alm_cal` precisa deixar quem emite gravar.
- **Falta ele confirmar que o site mostra v0.6.17** (cache `efcwork-0.6.17`).

### v0.6.18 · Relatórios › Rateio (15/11, 14:48 → 16h, Sonnet 5.5) — PUBLICADA em 15/11 (ITENS 70 a 77 aprovados; 78 reprovado; colunas de ponta a ponta e transição do filtro aplicadas)
- **Arquivos novos:** `src/relatorios.js`, `src/relatorios.css` (módulo `relatorios` depois de `rateio`), `tools/testes/t_v0618.js` (27 ok), `tools/visual/relatorios-v0618/semente.js`, `pagina/captura10.js`, `pagina/itens-p10.js`, `docs/aprovacao-efcwork-v0.6.18-relatorios.html`. Alterados: `casca.js` (área Relatórios com a aba Rateio e `negada` pela atribuição Rateios), `areas.js`, `coletas.js`, `agua.js`, `rateio.js` (redesenham em Relatórios), `t_v010.js`, `efcwork.json` (2 telas do medidor), `montar.py`.
- **O que é:** o Painel do rateio do EFClaudian (água: 8 quadros; campo: 7), só leitura; filtro num botão só (Mostrar, Ano, Período, Tipo de ponto), resumo em texto, imprimir, aviso de limite de carga. Fora: planos de coleta e bebedouros sem coleta (já existem em Coletas).
- **Página de aprovação** (artefato "EFCwork v0.6.18 · Relatórios › Rateio"): ITENS 70 a 78. Esperando as respostas. Com elas: aplicar só o aprovado, `VERSAO = '0.6.18'`, bateria, medidor, ZIP, e publicar só com "pode publicar".
- **Bateria:** 54 arquivos, 0 falhas. Medidor: 0 defeitos (88 ajustes de tamanho de letra).
- **Repositório:** o clone `/home/claude/efcwork` está com as mudanças sem commit; para publicar, o acesso `push` precisa estar liberado na conversa (add_repo). `projeto/dist` não é versionado (não adicionar ao commit).

## 4. Como conseguir e montar o código
- **Caminho 1 (preferido):** `mcp__claude-code-remote__add_repo` com owner `EliasGrigori`, repo `efcwork`, access `push` (se for publicar) e clonar. Depois `register_repo_root`. Não conferir o repo antes com curl/gh (dá 404 falso em repo privado).
- **Caminho 2 (sem repositório):** descompactar `efcwork-v0.6.18-proposta-relatorios-fonte.zip` (ou o da v0.6.16) numa pasta vazia: traz `projeto/src`, `projeto/tools` (montar.py, testes, auditoria, visual), regras do Firebase, README. Sem fotos de teste e sem páginas de aprovação antigas.
- **Mapa:** a raiz do repositório guarda o app publicado (index.html, sw.js, manifest.webmanifest, ícones). `projeto/src` guarda os 75 módulos (.js e .css). `projeto/tools/montar.py` junta os módulos e gera `projeto/dist/` (não versionado). `projeto/docs` guarda dossiês, roteiros do Grok, regras do Firebase e páginas de aprovação.
- **Montar:** `cd projeto && python3 tools/montar.py`. A versão vive em `VERSAO` no `src/base.js`; o cache do service worker é `efcwork-<versão>`.
- **Testes:** precisa de Playwright com Chromium (`npm i -g playwright` e `npx playwright install chromium`, se faltar). Rodar da pasta `projeto`, com `NODE_PATH=$(npm root -g)`: `node tools/testes/t_v0616.js` (um arquivo) ou a bateria de 52 arquivos `t_*.js`. **Um comando em primeiro plano estoura em 600 s:** rodar de 13 em 13 arquivos por comando. Depois da bateria: `git checkout -- projeto/tools/testes/telas` (ela regrava prints).
- **Medidor visual:** `NODE_PATH=$(npm root -g) node tools/auditoria/medir.js tools/auditoria/efcwork.json --estrito` (0 defeitos esperado; ajustes de letra são "decisão", não defeito).
- **Publicar (só com "pode publicar", a cada vez):** copiar de `projeto/dist/` para a raiz do repositório: index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png. `git add` esses mais `projeto/src`, docs e testes da versão (nunca `projeto/dist/` nem `pagina/out/`). Commit com os trailers abaixo e `git push origin HEAD:main`.
- **Trailers do commit (a sessão atual manda os dela, usar os da mensagem de sistema):** `Co-Authored-By: Claude <modelo> <noreply@anthropic.com>` e `Claude-Session: <link da sessão>`.
- **EFClaudian (só leitura):** clonar `EliasGrigori/efclaudian` fora do repositório do EFCwork, só para ler o que falta portar (HEAD no dia: v2.102.60). Nunca alterar nem publicar nele.

## 5. Padrão de trabalho (o que ele amou; não perder)
**Cada tarefa**
1. Sugerir modelo e esforço em **negrito**; esperar "pode iniciar".
2. Uma frase do que vai fazer; lista de tarefas (TaskCreate); tudo em primeiro plano (nada em segundo plano nem agendado).
3. Implementar e testar: teste da versão, bateria, medidor `--estrito`, auditoria visual (skill auditoria-visual-efc).
4. Mudança visual **passa por página de aprovação antes** de ser aplicada. Só aplica o aprovado.
5. Registrar tudo no dossiê e atualizar o CONTINUAR.
6. Entregar sempre: ZIP da versão + dossiê + CONTINUAR, com resumo final: o que mudou, **o que conferir no Firebase**, próximos passos.
7. Avisar quando for hora de conversa nova e mandar tudo (este pacote), sem OneDrive.

**Página de aprovação** (ferramentas em `projeto/tools/visual/moderno-v0615/pagina/`: `captura8.js`, `itens-p8.js`, `monta-pagina.js`; rodar `EFC_APP=dist/index.html NODE_PATH=$(npm root -g) node tools/visual/moderno-v0615/pagina/monta-pagina.js tools/visual/moderno-v0615/pagina/itens-p8.js`; publicar como artefato com `mcp__claude-artifacts__publish_files`)
- Número grande do ITEM; Aprovado/Reprovado + comentário; imagens que ampliam (HOJE/PROPOSTA); antes/depois com o app de verdade; movimento mostrado com o app real; botão "Copiar respostas"; **fracionada (uma mudança por item)**; referências reais da internet em decisão de design; opção `jaFeito` para o que já está feito.

**Regras visuais fixas**
- Sem "cara de IA" (sem emoji, brilho ou gradiente de enfeite, KPI decorativo). Limpo e compacto, cantos moderados.
- Botões e campos lado a lado: mesma linha, altura e largura, no PC e no celular.
- Um único filtro recolhível; menus de coluna estilo Sankhya (seta, A-Z, busca, lista de valores, travar). Só a tabela rola, cabeçalho fixo; totais sem caixa, na letra pequena das pílulas.
- Escolha de opção em janela retrátil, nunca fileira de botões. Excluir = lixeira no canto de cima. Imprimir = só o ícone.
- Esc e o botão voltar do celular voltam **uma camada por vez**; se perde dado digitado, avisar. Tela sem permissão **some**.
- Movimento só pela escala 40, 80, 150, 250, 350, 400, 500 ms; mesma fluidez ao trocar abas internas e áreas.
- Nada de texto extra nas barras das tabelas (ele pediu para não pôr avisos).

**Proibições**
- Não abrir nem tentar o OneDrive sem ele pedir pelo nome ("mande os dados" e "conversa nova" não são pedidos).
- Nada no EFClaudian (só leitura). Não falar dos prints antigos do repositório público. Não mexer na lista de presença impressa dos Treinamentos (vem do Sabiá).

## 6. Próximas tarefas (ordem sugerida; cada uma só começa com "pode iniciar")
Fonte: FALTA-DO-EFCLAUDIAN.md (tabelas A, B e C) e features.csv (458 funções: 18 "must" ainda "não").
1. **Mais abas de Relatórios** (Rateio = o Painel do EFClaudian: água e campo; Semana, Almoxarifado do mês, Documentos, Apontamentos, Coletas em aberto).
2. **Administração › Pessoas e perfis** ("Só ver" / "Ver e alterar" por área; detalhe da pessoa; meu perfil).
3. **Backup e exportação**; **Conversas** (chat dentro de cada registro + sino); **Meu dia** (tarefas no Início).
4. Partes de telas (tabela B do FALTA): etiquetas e fichas de campo, cadastros de Coletas, plano de rodízio, cadastro de material e equipamento, kits, reajuste de preços, vidraria quebrada, transferências, normas e editais, documento controlado, arquivo por ano.
5. Outros: ponte com o Vértice Docs (v0.6.11 e v0.6.13; ler `integracao-cwork-vertice-v0.6.18.zip`, que o Elias precisa anexar); entrega do resumo de treinamento ao Sabiá; mandar ao Grok os roteiros v0.6.14.1 e v0.6.14.2.

## 7. Decisões dele ainda em aberto (perguntar na hora certa, uma por vez)
- Nova coleta pedida no rodízio precisa de aprovação do Líder/Principal? (A: sim; B: não).
- Pedidos de 14/11 ainda não feitos: tabela com só a tabela rolando e cabeçalho fixo; totais sem caixa; mesma fluidez nas abas internas (parte já feita na v0.6.15, conferir o que falta antes de mexer).
- Pergunta sem resposta: tirar "N amostras" da barra das tabelas no celular?
- Insumo por amostra no Rateio (custo do material do almoxarifado ÷ amostras do laboratório no mês): trazer ou não (REPROVADO na v0.6.18, ITEM 78: fica fora).
- TTL do Firestore nas fotos da ação (precisa combinar com o EFClaudian; não mexer sozinho).
- Observações do Grok sem mexer: Pareto inclui "Outro"; coluna Prazo da Programação vazia; busca não acha plano de coleta nem erro de digitação; ordem do Apresentar da Auditoria.

## 8. Peças de código que se reaproveitam (não reinventar)
- Tabela: `tbHTML({id, titulo, unidade, unidade1, linhas, chave, aoClicar, grupos, busca, vazio, cols, antesIcones, imprimir})`; colunas escondidas por padrão em `TB_OCULTAS_PADRAO[id]`; estado em `S.tb[id]`.
- Gavetas e formulários: `gvAbrir`; formulários `LC_FORM.<tipo>` com `lcAbrir`, `lcPe`, `lcBl`, `lcAv`, `lcErro`, `lcTravar`, `lcFim`; ações `DD_AO.<prefixo>`; `ddHTML`; linha do tempo `tlFluido`.
- Dados: `Data.col(nome).set/get/update/push`; avisos `Notif.send`; auditoria `Audit.log`; sino com `refTipo` (sino.js); busca global `BG_FONTES`.
- Telas: `TELAS.<área>` (embrulhar a aba com um wrapper, como em nc.js e bugs.js); lista de módulos em `tools/montar.py`; telas do medidor em `tools/auditoria/efcwork.json`.
- Segurança do HTML: todo dado novo em HTML passa por `esc()` (o teste `t_html_seg` conta; ajustar `html-seg-base-efcwork.json` só quando o HTML for legítimo e justificado).

## 9. Firebase
- Nada a configurar na v0.6.16. Coleções usadas: `sv2_apont` (campo `nc`) e `sv2_rnc` (só leitura); `sv2_bugs` e `sv2_bugs_foto/{id}` (leitura e escrita; regra já existe no EFClaudian; campos novos `app:'efcwork'` e `finalizadoEm`, ignorados por ele). Se aparecer "permissão negada" em `sv2_bugs`, a regra precisa liberar. Ver `REGRAS-FIREBASE-EFCwork-v0.6.15.md`.
- Campos do rodízio em `sv2_rodizio.liberadas`: porId, porSup, aprovadoPor/Id/Em, recusadaPor/Id/Em, recusaMotivo.

## 10. Armadilhas já vividas
- Dois lotes de testes no mesmo comando passam de 600 s. Um lote por comando.
- Depois da bateria, desfazer os prints regravados (`git checkout -- projeto/tools/testes/telas`).
- A falha isolada do `t_v050.js` já foi transitória; rodar de novo sozinho antes de investigar.
- Linha larga demais na tabela: esconder colunas por padrão e limitar `td.tb-lg` (240 px) em vez de deixar rolar para o lado.
- Texto de botão cortado no celular: rótulo curto, ou um botão só.
- O que ele pede "do nada" mas vê na tela vale como ajuste de item aprovado: aplicar, testar e só então publicar.

## 11. O que está neste pacote
- `CONTINUAR-EFCwork-v0.6.18.md` (este), `TEXTO-PARA-COLAR.txt`, `FALTA-DO-EFCLAUDIAN.md`, `features.csv`, `DOSSIE-EFCwork-v0.6.15.md` (histórico completo; ler só o fim).
- `efcwork-v0.6.18-proposta-relatorios.zip` (app publicado, com os Rateios) e `efcwork-v0.6.18-proposta-relatorios-fonte.zip` (código-fonte e ferramentas com os Rateios).
- `REGRAS-FIREBASE-EFCwork-v0.6.15.md` e a página `aprovacao-efcwork-v0.6.17-rateios.html` (a que está esperando resposta).
