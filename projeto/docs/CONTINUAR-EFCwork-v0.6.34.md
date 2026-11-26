# EFCwork · CONTINUAR (26/11/2026, 11h10) · estado: v0.6.33 NO AR (commit c8c3323); v0.6.34 P3a Vértice como aba EM APROVAÇÃO (ITENS 185 a 196)

Este arquivo substitui o CONTINUAR-EFCwork-v0.6.33.md. Ele é autossuficiente: quem ler só ele já sabe o que fazer.

## 0. Estado de 26/11 (11h10)
- **v0.6.34 · P3a Vértice Docs como aba (EM APROVAÇÃO, nada publicado):** artefato "EFCwork v0.6.34 · Vértice como aba (P3a)", ITENS 185 a 196 (190 e 195 são de OPÇÃO). Arquivo `docs/aprovacao-efcwork-v0.6.34-vertice-aba.html`. Com as respostas: aplicar o aprovado (190: esconder ou não a barra de baixo do Cwork na área; 195: a porta devolve ou não quem é para quem não vê a área), rodar t_v0634 e a bateria, entregar, publicar só com "pode publicar". Detalhe e o que não foi provado: dossiê, seção v0.6.34.
- **Sequência aprovada (26/11):** P3a (v0.6.34) → P3b Pastas do Vértice → P3c regras do Firestore (no mesmo arquivo da v0.6.33, blocos novos) → P5 (mudança do Vértice para efcwork/vertice/) → aviso de versão nova → CSP e SDK → limpeza visual → features.csv → Cadastros de Coletas. O estudo de rapidez (ESTUDO-rapidez-EFCwork-v0.6.33.md) fica para DEPOIS da integração.
- **Decisões do Elias (26/11 10:01 a 10:16):** o Vértice "vai ser o Cwork, em arquivo separado", comunicação limpa; janela por cima fica como volta e melhora depois; documento arquivado no Cwork fica acessível no Vértice (PDF; Word e planilha abrem no Vértice para editar e imprimir) — escopo P4; sem campo de conta de teste: modo de teste do Vértice sem login, só no aparelho (com a conversa do Vértice); nome e dados vêm do cadastro do Cwork; pode ler o repositório EFCdocs (só leitura); obedecer às regras das auditorias.
- **Nota para a conversa do Vértice:** `docs/NOTA-DO-CWORK-para-o-Vertice-P3-respostas.md` (o Elias leva).
- **Pedir ao Elias:** o PEDIDO-P3 refeito às 07:30 (o anexado é o das 07:10; a memória do Vértice diz que a conversa do Cwork faz a mudança de repositório inteira).
- **Pedidos pequenos:** trocar o nome do usuário (hoje só o Principal, em Pessoas; a regra já deixa a própria pessoa mudar `nome`) — perguntar se cada um troca o seu em Meu perfil. Item 44 ("N amostras" na barra das tabelas no celular) sem resposta. Rótulos por laboratório: os modelos dele no Vértice ("até quinta").
- **Firebase:** regras da v0.6.33 coladas pelo Elias em 26/11 ("deu certo"); falta confirmar o teste do Almoxarifado com Colaborador no EFClaudian e a via assinada em dois aparelhos.
- **Teste com defeito ANTERIOR, aberto:** t_v067 "as datas do mês aparecem marcadas" falha também na v0.6.33 em 26/11 (ligado à data).
- **No ar:** v0.6.33 (commit c8c3323; CONTINUAR em 84b10d5).

## 1. TEXTO PARA COLAR NA CONVERSA NOVA


> EFCwork, continuando. Anexei o pacote: CONTINUAR-EFCwork-v0.6.34.md, o dossiê, o ZIP do app (efcwork-v0.6.34.zip) e o código-fonte (efcwork-v0.6.34-fonte.zip). Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço dessa tarefa em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" do CONTINUAR sem eu repetir. Repositório: EliasGrigori/efcwork (anexe com add_repo; se não der, git clone); para testar a aba, clone EliasGrigori/EFCdocs só para leitura, fora do repositório do Cwork. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano.

## 2. O que fazer logo ao começar (ordem)
1. Ler este arquivo e o fim do dossiê (seção "v0.6.25 · Relatórios › Apontamentos" e as anteriores de 20/11).
2. Conseguir o código (seção 4). Rodar `python3 tools/montar.py` dentro de `projeto/`.
3. Responder ao Elias em 3 linhas: onde parou (v0.6.34 P3a em aprovação, ITENS 185 a 196) e a próxima tarefa (aplicar as respostas; depois P3b).
4. Sugerir **modelo e esforço** em negrito e esperar "pode iniciar".

## 3. Onde parou
- v0.6.24 publicada (aprovações decididas no EFCwork). Antes: v0.6.23 (Relatórios › Documentos, faixa das janelas, só um link para o EFClaudian na Início), v0.6.22 (janela do Vértice com abas + Ponte 1), v0.6.21 (barra de cima + Almoxarifado do mês), v0.6.20 (Bugs e sugestões 2), v0.6.19 (Semana), v0.6.18 (Rateio), v0.6.17 (Rateios).
- v0.6.28 publicada (bateria 64 arquivos 0 falhas; medidor 0 defeitos). Na varredura de 20/11 reproduzi: medidor 0 defeitos e t_html_seg, t_regras_cobertura, t_v0626, t_v0628 e t_v0624 sem falha.

## 4. Como conseguir e montar o código
- **Caminho 1 (preferido):** `mcp__claude-code-remote__add_repo` com owner `EliasGrigori`, repo `efcwork`, access `push` (se for publicar) e clonar. Depois `register_repo_root`. Não conferir o repo antes com curl/gh (dá 404 falso em repo privado).
- **Caminho 2 (sem repositório):** descompactar `efcwork-v0.6.28-fonte.zip` numa pasta vazia: traz `projeto/src`, `projeto/tools` (montar.py, testes, auditoria, visual), regras do Firebase, README. Sem fotos de teste e sem páginas de aprovação antigas.
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
0. **v0.6.32 Regras:** aplicar as respostas dos ITENS 162 a 169 (Sonnet 5.5 · esforço médio). 1. **v0.6.33 Documentos da remessa** (Opus 5.5 · esforço alto). 2. **Cadastros de Coletas** (por último). Relatórios encerrados; Pessoas (v0.6.26), cadastros do Almoxarifado e Meu dia com rotinas (v0.6.28) feitos. Conferir no EFClaudian se as tarefas criadas no EFCwork (status todo/doing) aparecem certas.
3. **Conversas** (chat dentro de cada registro + sino). (Meu dia já foi feito na v0.6.28.) A ordem de versões proposta na varredura de 20/11 está na seção 0 e no relatório.
4. Partes de telas (tabela B do FALTA): etiquetas e fichas de campo, cadastros de Coletas, plano de rodízio, cadastro de material e equipamento, kits, reajuste de preços, vidraria quebrada, transferências, normas e editais, documento controlado, arquivo por ano.
5. Outros: ponte com o Vértice Docs (v0.6.11 e v0.6.13; ler `integracao-cwork-vertice-v0.6.18.zip`, que o Elias precisa anexar); entrega do resumo de treinamento ao Sabiá; mandar ao Grok os roteiros v0.6.14.1 e v0.6.14.2.

## 7. Decisões dele ainda em aberto (perguntar na hora certa, uma por vez)
- Senha mínima: 8 (hoje) ou 15 caracteres (NIST rev. 4 pede 15 quando a senha é a única proteção). Ele pediu explicação em 20/11 17:35; a resposta ainda não veio.
- Pergunta sem resposta: tirar "N amostras" da barra das tabelas no celular?
- Item 44 da TRIAGEM (em aberto).
- TTL do Firestore nas fotos da ação (precisa combinar com o EFClaudian; não mexer sozinho).
- Observações do Grok ainda sem mexer: coluna Prazo da Programação vazia (o dado não vem preenchido); ordem do Apresentar da Auditoria.
- Já resolvidas (não perguntar de novo): nova coleta do rodízio precisa da aprovação do Líder/Principal (feito na v0.6.15); tabela com só ela rolando, totais sem caixa e fluidez nas abas (v0.6.15); Pareto com "Outro" no fim e busca com plano de coleta e erro de digitação (v0.6.15); insumo por amostra (reprovado, fica fora); item 30 (substituído pelo Método Sabiá).

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
- `CONTINUAR-EFCwork-v0.6.29.md` (este), `DOSSIE-EFCwork-v0.6.15.md` (ler só o fim: varredura de 20/11 e v0.6.29) e `RELATORIO-VARREDURA-EFCwork-v0.6.28.md`.
- `efcwork-v0.6.29.zip` (app da v0.6.29, publicado) e `efcwork-v0.6.29-fonte.zip` (código-fonte, ferramentas e documentos).
- `aprovacao-efcwork-v0.6.29-acesso.html` (ITENS 147 a 152, para responder).
- Para colar na conversa nova: o texto da seção 1.
