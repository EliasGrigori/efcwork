# Dossiê EFCwork — v0.6.1 a v0.6.15 (cumulativo)

## De onde veio
Respostas do Elias aos modelos (11/11 00:00): **OPÇÃO 1** (cartões com foto) aprovada e as outras quatro reprovadas; **OPÇÃO A** (gaveta em passos) aprovada com a melhoria "a gravidade pode ser os botões como na OPÇÃO B"; **OPÇÃO B** reprovada; **ITEM 1** (detalhe) aprovado com "alinhar botão Não procede / Mudar gravidade com Resolver, celular"; **ITEM 2** (escopo) aprovado.
Dali saiu uma **regra nova e permanente**: em todas as telas, botões e campos lado a lado ficam alinhados — mesma linha, mesma altura, mesma largura, no PC e no celular. Vale para a Auditoria (v0.6.2) e para o que vier.

## O que foi feito
Arquivos novos: `src/apont.js` e `src/apont.css`, registrados em `tools/montar.py` logo depois de `inspecoes`. O `TELAS.inspecoes` passou para o `apont.js` (ele distribui as abas); a tela do Cloro virou a função `clTela()` dentro de `inspecoes.js`. A aba Auditoria interna segue como "em breve" (v0.6.2).

### Dados (os mesmos do EFClaudian v2.102.60)
- `sv2_apont` — data, hora, criadoEm, porId/porNome, origem (rotina | auditoria) + auditoria, categoria, setor, grav, gravOrig, gravHist[], comunicado, obs, risco, recom, fotos[], fotosDepois[], fotosOff{}, status (aberto | andamento | resolvido | nao_procede), resolucao, nc{responsavel, prazo, acao, fechada, verificacao}, hist[].
- `sv2_fotos` — uma foto por documento, com `refTipo: 'apont'`, `refId` e `papel` (antes | depois).
- `sv2_cfg/apont` — os setores, como lista de `{nome, ativo}` (igual ao EFClaudian, para os dois apps lerem o mesmo).

### Tela (OPÇÃO 1)
Cartões com foto, categoria, setor, o que foi visto e os selos (gravidade, situação, NC aberta/vencida, origem, reincidência); traço na lateral quando é grave ou urgente. No alto, quantos em aberto, urgentes e NCs vencidas; filtro em janela retrátil (esta semana, em aberto, meus, todos) e atalho vermelho para os urgentes. Ações: Pareto, Setores (só Líder ★/Principal) e Novo apontamento.

### Novo apontamento (OPÇÃO A + melhoria)
Passos: 1 Foto (até 5, câmera ou galeria, compactadas no aparelho pelo mesmo `coFotoReduz` das Coletas), 2 O que foi visto (Categoria e Setor em janela retrátil, alinhados; "+ Outro local"; Observação), 3 **Gravidade em quatro botões grandes** com a explicação do que cada uma faz, 4 Avisou o encarregado + Origem (rotina ou auditoria interna), 5 Risco e recomendação. Grave avisa o superior no sino; urgente é alerta crítico.

### Detalhe (ITEM 1 + melhoria)
Linha do tempo da gota (registrado com a gravidade original, mudanças de gravidade, encarregado avisado, NC com responsável e prazo, ação concluída, fechamento), fotos antes e depois, campos, aviso de LGPD das fotos e histórico. Rodapé com **Não procede, Mudar gravidade, Abrir/Fechar NC e Resolver alinhados** (dois por linha no celular, 44 px).

### Resto do escopo
Mudar a gravidade com motivo (a de quem registrou fica riscada e guardada em gravHist); resolver com o que foi feito e foto do depois; não procede; reabrir; abrir e fechar NC (fechar a NC resolve o apontamento); reincidência de 30 dias no mesmo setor e categoria; Pareto por categoria, setor ou gravidade em 30/90/365 dias, com os "poucos vitais"; setores configuráveis; fotos apagadas sozinhas 30 dias depois de resolvido (LGPD), mantendo texto e histórico; busca geral.

## Defeito encontrado e corrigido (ninguém tinha visto)
Com texto comprido, o cartão esticava a tela no celular e o aparelho **afastava a página** (zoom-out, letras menores) em vez de cortar o texto — e isso não aparecia na checagem antiga, porque `scrollWidth` continuava igual a `innerWidth`. Causa: os cartões ficam numa grade e grade não encolhe o item abaixo do conteúdo. Correção: `grid-template-columns:minmax(0,1fr)`, `min-width:0` no cartão e reticências no título e no rodapé do cartão. Os testes do Cloro e dos Apontamentos agora conferem também que `innerWidth` continua 390 px no celular.
Outros ajustes da auditoria: o "x" da foto passou de 26 px para 28 no PC e 36 no celular (e o mesmo no Cloro).

## Conferência
- `t_v061.js`: **60 verificações, 0 falhas** — tela e filtros, cartões com foto e selos, reincidência (o de 40 dias não conta), gaveta em passos, os 4 botões de gravidade medidos em pixels, Categoria × Setor alinhados, todas as recusas do formulário, foto gravada em `sv2_fotos`, detalhe com a linha do tempo da gota, rodapé medido em pixels (PC e celular), mudar gravidade com a original riscada, abrir e fechar NC, resolver com foto do depois, reabrir, Pareto, setores em `sv2_cfg/apont`, busca, `esc()` num apontamento com HTML, Cloro intacto.
- Suíte completa: **28 arquivos, 1.086 verificações, 0 falhas** (docs/suite-v0.6.1.log).
- Auditoria visual 1280 e 390 px, Claro e Escuro: sem rolagem para o lado, botões 36 px no PC e 44 no celular, 5 a 7 tamanhos de letra, nenhuma cor fora dos tokens, 0 erros no console.

## Firebase (o que o Elias confere)
As regras precisam deixar: qualquer um que lança criar em `sv2_apont` e `sv2_fotos`; o Líder ★/Principal atualizar `sv2_apont` (gravidade, situação, NC) e gravar `sv2_cfg/apont` (setores). A limpeza de fotos por LGPD atualiza `sv2_apont.fotosOff` e zera o `dataUrl` em `sv2_fotos`.

## Fica para depois
v0.6.2: Auditoria interna/RNC, a análise de problema (5 Porquês, Ishikawa, plano de ação), a aba que junta as NCs dos apontamentos com as das auditorias e o Nº 45. v0.6.3: marcar e editar a foto (Nº 42), guardando a original.

## Respostas do Elias (11/11 05:10)
ITEM 1 (tela em cartões) Aprovado · ITEM 2 (gaveta em passos com a gravidade em botões) Aprovado · ITEM 3 (detalhe com a linha do tempo e o rodapé alinhado) Aprovado (respondido na conversa às 05:1x, estava em branco na página) · ITEM 4 (Pareto) Aprovado · ITEM 5 (regra do alinhamento e o defeito do zoom-out) Aprovado · ITEM 6 (escopo) Aprovado.
Os 6 itens ficaram aprovados. A publicação espera o "pode publicar".

# Retorno do Grok da v0.6.0 (recebido 11/11 07:40)
**38 ok, 2 não, 0 não testado.** Ele conferiu no demo com o backup de 08/11 (4.839 registros) e com dados inventados para os prazos de 24 h e para mais de 5 locais; a versão do site e o zip do OneDrive têm o mesmo hash. Confirmados: velocímetros (ponteiro coerente, cor só fora da faixa, só número e nome embaixo, 5 por linha, escolher locais gravando no aparelho, 2 colunas no celular), A fazer, dias úteis sem verificação, perfis (comum não vê Liberar/Recusar), régua e faixa ao digitar, Dosagem × Cloro depois alinhados (185,5 px no PC e 172 px no celular), a regra do bebedouro em aberto, foto, linha do tempo da gota, 24 h com lembrete e bloqueio, encerrar, justificar e lançar retroativa (com pedido de aprovação para quem é comum), bebedouros, tabela com filtro/planilha/impressora, busca, correção (Administrador na hora, comum por pedido), temas e Esc.

**Os dois "não":**
1. **3.1 — a numeração dos passos pula de 3 para 5.** O passo "4 Aplicação" só aparece depois de digitar o resultado, então a gaveta mostra 1, 2, 3 e 5. Defeito meu: os números têm de ser recalculados conforme o que está à mostra.
2. **3.8 — o aviso depois de lançar não diz que ficou resolvido.** Lançando 0,15 com dosagem e cloro depois dentro da faixa, a situação fica "Resolvido", mas o aviso é só "Verificação lançada." (no "Medir de novo" ele diz "Resolvido: dentro da faixa.").

Ele apontou ainda uma diferença pequena fora da lista de "fica para depois": no EFClaudian o superior pode "Pedir motivo" e a pessoa "Responder motivo" numa bloqueada; aqui só existe Encerrar com o motivo.

# Pedido do Elias (11/11 07:40)
**O velocímetro tem de ter tamanho travado** — o tamanho mínimo definido para o formato 5/5 — e não adaptativo. Com 2 locais, hoje os cartões esticam e ficam enormes (print que ele mandou). Devem manter a largura do caso de 5 por linha e se alinhar à esquerda.
Ele mandou também o relatório RNC-2026-03 impresso de verdade (42 NCs, 51 folhas, salvo em docs/referencia-RNC-2026-03-EFClaudian.pdf) e um print da trilha dos 5 passos do EFClaudian — material para a v0.6.2. Disse que vai explicar melhor.

# Explicação do Elias sobre a Auditoria interna (11/11 07:47) — define a v0.6.2
**Os 5 modelos de tela que mandei foram todos reprovados.** Ele quer o modelo do print que mandou: a trilha dos 5 passos do EFClaudian (números 1 a 5 em cima, com o que cada passo faz, e cada RNC com a barra de progresso mostrando onde está), passada pela auditoria do método (tokens do EFCwork, nada de roxo, sem cara de IA).

**Como a auditoria dele funciona de verdade:**
- **Uma RNC só por auditoria interna**, não várias — é uma inspeção completa da fazenda. Dá 40, 60, 70 NCs.
- A inspeção segue a **rota dele, que não é padrão**: escritório → campo → packing house → campo → oficina → campo → almoxarifado → campo → ponto de apoio → campo → casa de bombas → campo → biofábrica → campo. Ele vai e volta ao campo o tempo todo.
- **O problema maior: o mesmo achado se repete em vários lugares.** Placa caída, sacola no chão, mangueira descartada. Hoje ele precisa abrir um item novo para cada ocorrência, ou procurar o item já aberto no meio de 60-70 NCs para acrescentar — os dois jeitos atrapalham. Ele quer todas as sacolas num item só, sem ficar procurando.
- Outra dificuldade: se ele nomeia o item "placas caídas" e descreve a não conformidade, o que fica no cabeçalho é a descrição — e aí, com 70 NCs, fica difícil achar qual é qual numa olhada rápida.
- **O relatório tem "enchimento de linguiça"**: as primeiras páginas não interessam a ninguém; dá para apresentar só o visual — rosca, colunas, tabelas. Mas: "se for complicar demais, é melhor permanecer como está"; o relatório de hoje já atende bastante.
- **A apresentação** continua como no EFClaudian, com três acréscimos: poder voltar à apresentação **depois de enviada**; **segregar por responsável** (porque ninguém tem tempo de esperar a vez); e corrigir tudo durante a apresentação (nome, texto, uma segunda pontuação, descrição do encarregado).
Ele pediu um levantamento com ideias para o agrupamento das ocorrências repetidas.

# Respostas do Elias aos modelos da v0.6.2 (11/11 08:55)
OPÇÕES 1 a 5 (telas) **todas reprovadas** — vale o modelo do print dele: a trilha dos 5 passos. OPÇÃO A (registrar NC em passos) **aprovada**, com "a GUT pode usar o padrão do EFClaudian" (o bloco com as cinco notas e a explicação de cada uma, como lá). OPÇÃO B reprovada. ITEM 1 (apresentação, Nº 45) aprovado. ITEM 2 (**partir em v0.6.2 RNC / v0.6.3 plano de ação / v0.6.4 editor de foto**) aprovado. ITEM 3 (mesmos dados) aprovado.

**Resposta dele sobre o responsável:** "placa de identificação da área é uma coisa, placa de identificação de uma prateleira é outra, sendo que cada setor tem seu responsável; se esse mesmo problema for numa casa de bombas é outro responsável." Ou seja: **o responsável vem do setor/local, não do achado** — então o responsável fica na ocorrência, e achados de nome parecido não podem ser juntados sozinhos pelo app; quem junta é ele.

# Kit do Método Sabiá 2.0 — avaliação (11/11, rodado no EFCwork)
Adotável. `medir-codigo.py`: 7.676 linhas em 48 arquivos, nenhum acima de 800 (dentro da meta). `varredura-sensivel.py`: 31 achados — o e-mail pessoal do Elias em 14 arquivos publicados em `projeto/docs/` (veio do registro do problema de login de 06/11) e a chave web do Firebase no `base.js` (não é vazamento: é pública por desenho, protegem-na as regras e o App Check; fica como exceção escrita). Ganhos: trava com código de erro, contraste, cantos, maiúsculas espaçadas, emoji, sombra com borda e a auditoria de rapidez com processador 4× mais lento. Ajustes necessários: metas do kit (botão 28 px no PC) trocadas pelas regras do Elias (36 no PC, 44 no toque); montar o `.config.json` com as ~20 telas do EFCwork; lista de exceções para os e-mails de documentação. Não substitui as 28 suítes (elas provam comportamento; o kit mede forma).

# Correção de rumo da v0.6.2 (11/11 10:10 e 10:2x)
Respostas: ITENS 1 a 4 **reprovados**, ITEM 5 (agrupar por responsável) aprovado, ITEM 6 reprovado com a pergunta "botões desse tamanho no PC estão de acordo com o padrão?", ITEM 7 aprovado com "completo, os índices podem ficar para o final, somente o gráfico em cima", ITEM 8 aprovado ("vamos caprichar").
Perguntado o motivo, ele respondeu: **"na verdade não entendi foi nada ali; o que eu acho que pode atender é separar por responsável ou setor e eu ter a opção de ordenar dentro dele por local — tipo responsável Jackson, aí CBR 01, CBR 02, CBR 03…, e na CBR 01 ter os apontamentos lá dentro."**
Ou seja: nada de item guarda-chuva nem de atalhos. O que ele quer é uma **árvore de três níveis: responsável (ou setor) → local → as NCs**, com seletor de agrupamento e de ordenação. Cada NC continua sendo uma NC do seu local; o "não ficar procurando" se resolve navegando até o local e usando o "+ NC aqui".
Medição do ITEM 6: altura certa (36 px no PC, 44 no celular), mas "Anterior" e "Próxima" com **601 px de largura** no PC — esticados pelo grid de 1fr. Corrigido para o tamanho do conteúdo no PC, mantendo os dois iguais no celular.
Enviados três jeitos da árvore (acordeão, duas colunas, tudo à mostra) em aprovacao-efcwork-v0.6.2-arvore.html.

# Tela da v0.6.2 decidida (11/11 10:23)
OPÇÃO 3 **aprovada**: tudo à mostra, sem abrir nada — cada responsável é um painel, com os locais dentro e todas as NCs visíveis; seletor de agrupamento (responsável, setor, local, achado) e de ordenação dentro (local, prioridade, número). "+ NC aqui" em cada local; apresentar e imprimir por responsável. OPÇÕES 1 (acordeão) e 2 (duas colunas) reprovadas.
ITEM 4 aprovado (botões da apresentação do tamanho do texto no PC, dois iguais no celular). ITEM 5 aprovado (relatório: gráfico na folha 1, índices no fim, três jeitos de sair).
Com isso a v0.6.2 está inteiramente definida: tela OPÇÃO 3 + registrar NC em passos com a GUT do EFClaudian + apresentação do Nº 45 + relatório. Falta a v0.6.1.1 antes dela.

---

## v0.6.1.1 — correções do Cloro (11/11/2026, aguardando aprovação)

Pedidos do Elias e retorno do Grok (v0.6.0) resolvidos nesta versão pequena:
1. **Velocímetro com tamanho travado** (pedido do Elias): cada cartão tem sempre 114 px de largura, o mínimo medido do formato 5 por linha (a 900 px de tela). Com 1 a 4 locais não estica; alinha à esquerda. Vale no PC (900/1280/1600) e no celular (3 por linha no 390 px).
2. **Grok 3.1**: numeração dos passos da gaveta Nova verificação. Registro = 4 (ou 3 na caixa d'água) quando a Aplicação está escondida, e 5 (ou 4) quando aparece. Nunca pula.
3. **Grok 3.8**: lançar com o "cloro depois" já na faixa avisa "Lançado. Resolvido: dentro da faixa."
4. **Pergunta aberta** (ITEM 4 da página de aprovação): trazer Pedir motivo / Responder motivo nas verificações bloqueadas (existe no EFClaudian) ou manter só Encerrar com motivo. Padrão proposto: manter como está.

Testes: t_v0611.js (32 ok) e t_v010.js ajustado para aceitar versão com quatro números. Suíte: 29 arquivos, 0 falhas (docs/suite-v0.6.1.1.log).
Arquivos mexidos: src/inspecoes.css, src/inspecoes.js, src/base.js (VERSAO 0.6.1.1), tools/testes.
Sem mudança de dados no Firebase.

---

# v0.6.2 — Inspeções › Auditoria interna (RNC) (11/11/2026, aguardando aprovação)

Construída com **Opus 5.5 · Esforço alto**, depois do "pode iniciar" das 15:54. A v0.6.1.1 (ainda não publicada) vai junto.

## O que entrou
- **Arquivos novos:** `src/auditoria.js` (tela, detalhe, abrir, registrar, tirar, enviar, conferir, fechar, prazo, cancelar, busca), `src/auapres.js` (apresentação Nº 45 e relatório), `src/auditoria.css`. Registrados em `tools/montar.py` depois de `apont`. O `TELAS.inspecoes` (apont.js) passou a mandar a aba `auditoria` para `auTela()`.
- **Tela "tudo à mostra" (OPÇÃO 3):** responsável → local → NCs, sem abrir nada; janelas retráteis de agrupar (responsável, setor = área Campo/Estrutura, local, achado) e de ordenar dentro (local em ordem natural CBR 01, 02, 03…; prioridade = GUT, ou a gravidade sem GUT; número). Escolha gravada no aparelho (`cw-au-a`, `cw-au-o`). "+ NC aqui" em cada local já traz área, local e o responsável daquele local (o responsável vem do local, nunca do achado; o app não junta NCs). Apresentar e impressora por responsável.
- **Registrar NC (OPÇÃO A):** 5 passos — Fotos (até 8) · Onde · O que está errado (nome curto do achado, descrição, até 5 leis em etiquetas) · Gravidade (botões) e GUT do EFClaudian (notas 1–5 explicadas, G×U×T, alto ≥ 48, médio ≥ 18, G 5 nunca baixo; a gravidade sugere o G; mudar a nota de outra pessoa pede motivo) · Quem responde (responsável, ciente, corresponsáveis, observação, sugestão). Rodapé: Cancelar · Salvar e próxima · Salvar.
- **Detalhe da NC:** tudo, com o retorno e o histórico das correções da apresentação. Antes de enviar: Corrigir e lixeira (tirar com motivo; fica guardada).
- **Apresentação (Nº 45):** tela cheia, uma NC por tela, ordem do relatório (Campo → Estrutura, local na ordem em que apareceu, número). Abre em qualquer etapa; seletor Todas / pessoa (responsável ou corresponsável). Corrigir: achado, texto, local, responsável, corresponsáveis, lei, observação, sugestão, descrição do encarregado e 2ª pontuação GUT — cada mudança vira um item em `r.apresAlt` (mesmo formato do EFClaudian: id, em, porId, porNome, ncId, n, campo, antes, depois, de, para) e no registro de atividade. Fechada: só olhar. Botões 36 px no PC (Anterior/Próxima com 108 px, do tamanho do texto), iguais no celular. Setas do teclado; Esc fecha uma camada por vez (correção → apresentação).
- **Enviar / conferir / fechar:** enviar avisa no sino quem tem conta (Maior = aviso); depois de enviada não há mais Nova NC; conferir uma por uma (Resolvida/Parcial/Não resolvida, fotos do depois, o que foi feito, `ret` + `retHist` como no EFClaudian); com todas conferidas, Fechar com confirmação e resumo. Prorrogar prazo (líder, com motivo, `prazoHist`) e cancelar antes de enviar (`situacao: 'cancelada'`, `canceladaMotivo`).
- **Relatório:** Completo (folha 1 com números, rosca por gravidade e colunas por responsável; uma folha por NC com fotos, 1ª visita e 2ª visita/retorno — em branco para preencher à mão; índice com a folha no fim) · Só o visual (gráfico e índice) · Só as folhas de um responsável. A4 retrato.

## Dados (mesmos do EFClaudian v2.102.60)
`sv2_rnc` (RNC com `ncs[]`), `sv2_rnc_foto` (uma foto por documento: rncId, ncId, papel antes/depois, dataUrl, marcas []), `sv2_rnc_gut` (id = id da NC; g, u, t, gut, faixa, porId, porNome, hist[]). Campos novos dentro da NC (o EFClaudian ignora): `titulo` (nome curto do achado), `encTxt` (descrição do encarregado), `gut2` (2ª pontuação). `trat` gravado pela regra do EFClaudian (Alto/Médio = com análise, Baixo = direta).

## Decisões tomadas por mim (para o Elias confirmar na página)
- Setor = a área da NC (Campo/Estrutura), como no modelo aprovado.
- Correções na apresentação liberadas até a RNC ser fechada (pedido: "também depois de enviada").
- Sem a análise (v0.6.3), o retorno pode ser marcado Resolvida; o formulário avisa quando o EFClaudian pediria a análise.
- Em vez da Lixeira de 15 dias do EFClaudian, "Cancelar a auditoria" antes de enviar (nada se apaga).

## Correções que vão junto
- **Defeito da v0.6.1 (publicada):** Apontamentos › Abrir NC conferia o prazo com `validaData` ao contrário (essa função devolve a mensagem de erro e recusa data futura). Prazo em branco passava; prazo para hoje dava "Informe o prazo". Nova função `dataOk` (servicos.js) para prazos; teste no t_v062.
- **Regra do alinhamento:** `.cl-fm2 .dd-b{height:40px}` — janela retrátil ao lado de campo com a mesma altura (Cloro, Apontamentos, Auditoria).

## Testes
`t_v062.js` (79 ok) e `au_semente.js` (RNC de exemplo com 10 NCs). `t_html_seg` com a base regravada (nomes novos conferidos: todos números, textos fixos ou já dentro de `esc()`). Suíte: 30 arquivos, 1.199 ok, 0 falhas (`docs/suite-v0.6.2.log`).
Auditoria visual (1280 claro/escuro, 390): 6 tamanhos de letra, botões 36 px no PC e 44 no toque, sem rolagem lateral, sem erro no console; cor escrita direta só no bloco de impressão (como o relatório de tabela). Achados corrigidos antes da página: Responsável × "Estava ciente?" com alturas diferentes; botões do painel quebrando de jeitos diferentes no celular; "NC aqui" com 32 px no PC; número da coluna mais alta cortado no relatório; " · " sobrando no cabeçalho do relatório sem nome de empresa.

## Kit Método Sabiá 2.0
Não adotado nesta versão: falta o Elias confirmar (avaliação acima). Continua proposto.

## Respostas do Elias (11/11 16:31)
ITENS 1, 2, 3, 4, 5, 7, 8 e 9 **aprovados**. ITEM 6 (enviar, conferir o retorno e fechar) ficou **sem resposta** na página; publicado junto com o "pode publicar e iniciar a próxima etapa". A página da v0.6.1.1 não teve respostas copiadas; ela foi publicada dentro da v0.6.2 com o mesmo "pode publicar" (pergunta do ITEM 4, Pedir/Responder motivo no Cloro, continua em aberto — fica como está: só Encerrar com motivo).

## v0.6.3 — começo (11/11 16:3x)
Publicada a v0.6.2 (commit 409bb98; index.html do GitHub conferido contra o testado). O relatório real `referencia-RNC-2026-03-EFClaudian.pdf` **não** foi publicado (repositório público; fica só local).
Estudo da análise do EFClaudian (sv2_rnc_plano: contencao, porques[5], causa, m6, outra{sim,quais}, ishi[{id,m,t,tirada}], ishiPri, flux, acoes[5W2H com st], rev, hist, respId/respHist; regras planoPede por risco, tratativa direta × com análise (trat, tratHist), PDCA, rascunho e conflito; sv2_analise para a Análise de problemas com efic).
Enviados os modelos em aprovacao-efcwork-v0.6.3-modelos.html: 5 telas (gaveta em passos, tela com PDCA e abas, duas colunas, folha A3, uma pergunta por vez), Ishikawa desenhado × lista, 5W2H cartões × tabela, e os itens de regras, mudanças na auditoria, eficácia e escopo. Referência: relatório A3 (Toyota). Fonte dos modelos: tools/modelos-v063.js.

---

# v0.6.3 — análise da NC e Análise de problemas (11/11/2026, aguardando aprovação)

## Respostas do Elias aos modelos (11/11 17:34)
OPÇÃO 1 (gaveta em passos) **aprovada**; 2, 3, 4 e 5 reprovadas. OPÇÃO A (Ishikawa desenhado) aprovada, B reprovada. OPÇÃO C (5W2H em cartões) aprovada, D reprovada. ITENS 1 (regras do EFClaudian), 2 (o que muda na auditoria), 3 (eficácia na NC) e 4 (escopo: análise da NC + Análise de problemas; fluxograma e editor de foto na v0.6.4) aprovados. "Pode iniciar." Construída com Opus 5.5 · Esforço alto.

## O que entrou
- **Arquivos novos:** `src/analise.js` (ferramentas compartilhadas e a análise da NC), `src/anp.js` (Qualidade › Análise de problemas), `src/analise.css`. Registrados em `tools/montar.py` depois de `auapres`.
- **Análise da NC** (sv2_rnc_plano, id = id da NC, formato do EFClaudian): gaveta em 7 passos; Ishikawa desenhado (SVG, causa principal em vermelho, causas em etiquetas, tirar = `tirada`, abre grande na tela inteira); causa com "usar o último por quê"; 6M vem da causa principal; outra área; ações 5W2H em cartões (nova, editar, concluir, cancelar com motivo; `hist`; aviso no sino para quem faz); eficácia. Regras do EFClaudian: só o responsável pela resposta escreve (doc.respId → nc.respId → quem registrou); risco pede (Alto: causa, 3 porquês, Ishikawa com principal, outra área; Médio: causa e 3 porquês; Baixo/direta: o que foi feito); tratamento direta × com análise (`trat`, `tratHist`; Alto sempre com análise); troca de responsável (`respHist`) e de tratamento pelo líder com motivo; revisão (`rev`) — se outra pessoa salvou antes, não grava por cima; texto guardado no aparelho (`cw-an-nc-<id>`) até a nuvem confirmar, com "Usar o texto guardado".
- **Formulários por cima da análise** (ação, concluir/cancelar ação, eficácia, responsável, tratamento) trocam no mesmo lugar, sem camada nova: Esc/Cancelar volta para a análise com o que estava escrito; gravar volta para ela atualizada.
- **Eficácia** (ITEM 3): `efic { res, texto, data, porId, porNome, ts }` + `eficHist`, registrada pelo auditor/líder com a análise completa e as ações feitas; verificar a partir de 30 dias depois da última ação feita; não eficaz reabre a análise (também depois de a RNC fechar) e avisa o responsável.
- **Auditoria:** selos da análise e das ações em cada NC depois de enviada; botão "Análise" no detalhe; conferência: "Resolvida" exige análise completa e ações feitas (`anPend`), o líder libera com motivo (`ret.lib`, como o EFClaudian), e o relatório mostra a liberação; relatório completo e por responsável com a folha da análise de cada NC (Ishikawa desenhado e plano em tabela), folhas renumeradas.
- **Qualidade › Análise de problemas** (sv2_analise, ANP-ano-NN, formato do EFClaudian): lista com filtro; nova a partir de reclamação de cliente ou de apontamento (botão "Analisar" no detalhe do apontamento, que depois mostra o número); mesmas ferramentas (sem "outra área"); eficaz conclui; cancelar com motivo; busca geral. As outras abas da Qualidade continuam no EFClaudian (v0.7).

## Defeito achado e corrigido
No celular, quando uma gaveta saía deslizando e outra abria em seguida (ex.: salvar a ação e voltar para a análise), a página esticava e o aparelho afastava a tela (innerWidth 421). Agora `html.gv-anim` corta o lado da página enquanto há gaveta aberta ou saindo (`gvAnim` em tabela.js). Teste no t_v063.

## Testes
`t_v063.js` (58 ok); `au_semente.js` agora grava `trat` como o app (Baixa = direta); `t_v062.js` ajustado (Resolvida sem análise pede a liberação). Suíte: 31 arquivos, 1.257 ok, 0 falhas (`docs/suite-v0.6.3.log`); depois dos últimos ajustes de CSS, t_v062 e t_v063 rodados de novo (79 e 58 ok). `t_html_seg` com a base regravada (nomes novos conferidos: textos fixos, números, ou dentro de `esc()`; `I.resp.nome` e `a.quemNome` vão para o subtítulo da gaveta, que passa por `esc()`).
Auditoria visual: botões 36 px no PC; letras 11 a 21 px; sem rolagem lateral (390 e 1280); sem erros no console. Corrigidos antes da página: etiquetas das causas espremidas, campo da causa apertado ao lado da janela do M, diagrama pequeno demais na gaveta, botões da ação em duas linhas no celular, tabela de ações cortada na folha impressa, texto da NC espremido pelos selos na árvore.

## Firebase (para conferir)
Regras de `sv2_rnc_plano` (set pelo responsável pela resposta e pelo líder/auditor ao registrar a eficácia ou trocar o responsável) e `sv2_analise` (add pelo Líder ★/Principal; update pelo responsável e pelo líder). Mesmas do EFClaudian v2.102.13/20; a eficácia da NC é campo novo dentro do mesmo documento.

## Respostas do Elias (11/11 19:10)
ITENS 1 a 9 **aprovados**. "Pode publicar e iniciar a próxima etapa" (v0.6.4).

## Publicação e começo da v0.6.4 (11/11 19:1x)
v0.6.3 publicada (commit 58514ca; index.html do GitHub conferido contra o testado; o PDF real da RNC continua fora do repositório).
Estudo do EFClaudian para a v0.6.4: editor de foto (v2.22.0/v2.102.40: ferramentas c/s/t/b — círculo, seta, texto, borrar —, numerar, 5 cores, 3 grossuras, marcas em pixels da imagem {t, cor, esp, x1, y1, x2, y2, txt, n}; foto gravada com dataUrl + base + marcas; marcar uma foto gravada cria registro novo) e fluxograma (flux: [{id, k ini/et/dec/fim, t, sim, nao, vai, prob}], até 20 etapas, 60 letras).
Enviados os modelos em aprovacao-efcwork-v0.6.4-modelos.html: editor (OPÇÕES 1 a 5: escura com ferramentas em cima, clara com tudo embaixo, painel ao lado, barra flutuante, janelas retráteis), ver grande com original/marcas (ITEM 1), fluxograma em lista × no desenho (A/B) e os itens de onde aparece, o que fica guardado (base + marcas + marcadoPor/marcadoEm), Borrar (LGPD) e o fluxograma na análise. Fonte: tools/modelos-v064.js.

## Respostas do Elias aos modelos da v0.6.4 (11/11 19:29)
- Editor de foto: OPÇÃO 1 aprovada "no modo celular, ferramentas ficam embaixo"; OPÇÃO 2 aprovada; OPÇÃO 3 aprovada no PC, "porém o retorno fica com as ferramentas lá em cima, no local vazio ao lado de Numerar" (o Desfazer sobe para a grade das ferramentas, no espaço vazio ao lado de Numerar); OPÇÕES 4 e 5 reprovadas.
  Leitura (a confirmar com ele): PC = painel ao lado (OPÇÃO 3) com o Desfazer no espaço vazio ao lado de Numerar; celular = tela escura (OPÇÃO 1) com as ferramentas embaixo (como na OPÇÃO 2).
- ITEM 1 (ver grande: com as marcas / original), ITEM 2 (onde o editor aparece), ITEM 3 (o que fica guardado, Nº 42), ITEM 4 (Borrar/LGPD) e ITEM 5 (fluxograma na análise) aprovados.
- Fluxograma: OPÇÕES A e B reprovadas. Ele perguntou se dá para aproveitar o "Docs" para isso, com integração interna nativa pelo próprio Cwork; disse que pode haver a integração, mas está trabalhando nisso com outra IA e pode haver uma forma de comunicação para essa parte. → O fluxograma sai da v0.6.4 e espera essa integração.
- Pedido novo: "a qualquer momento eu posso remover, editar, corrigir qualquer informação" (escopo a confirmar: só as marcas da foto ou regra geral do Administrador).
- Pediu a sugestão de modelo e esforço antes de começar.
- Ele respondeu só "pode iniciar" (19:30). Segui as respostas padrão que propus: (1) remover/editar/corrigir vale para as marcas da foto — qualquer marca pode ser tirada ou refeita a qualquer momento, guardando a original e o histórico; a regra geral do app não mudou; (2) celular com fundo escuro.

---

# v0.6.4 — editor de foto (Nº 42) (11/11/2026, aguardando aprovação)
Construída com Opus 5.5 · Esforço alto, depois do "pode iniciar" das 19:30.

## O que entrou
- **Arquivos novos:** `src/fotoed.js` (editor e foto grande) e `src/fotoed.css`, registrados em `tools/montar.py` antes de `inspecoes`. Tokens novos em base.css para o fundo escuro do editor: `--fedBg`, `--fedTx`, `--fedBd`, `--fedBt`. As cores das marcas (vermelho, amarelo, azul, branco, preto) são dado da marca, como no EFClaudian.
- **Editor** (`fedAbrir`): canvas com a foto (lado maior até 1600 px), Círculo, Seta, Texto (campo e “Pôr”, Enter), Borrar (quadriculado), Numerar (liga/desliga; numera círculo e seta), 5 cores, 3 grossuras (no Texto é o tamanho), Desfazer e a lista das marcas com “x” para tirar qualquer uma. PC: foto à esquerda e painel de 300 px à direita, Desfazer na grade ao lado de Numerar (pedido do Elias). Celular: tela escura, Cancelar/Pronto no alto, cores e grossura e as 6 ferramentas numa linha embaixo. Camada própria (Esc/voltar); com marca nova, pergunta antes de descartar. Preferência de ferramenta/cor/grossura/numerar guardada no aparelho (`cw-marca`).
- **Foto grande** (`fedVer`): chave Com as marcas / Original, Marcas (quando pode marcar), Baixar a versão na tela, rodapé com quantas marcas, quem marcou e quando. Foto com parte borrada: quem não é Líder ★/Administrador não vê nem baixa a original.
- **Onde:** Auditoria — registro da NC e conferência (botão “Marcar”/“Marcas · N” em cada miniatura; foto já gravada vira registro novo com `substitui`), e a foto grande no detalhe e na apresentação (“Marcas” até a RNC fechar; gravar troca o id na NC e guarda o anterior; tirar todas as marcas grava a original de novo). Apontamentos (novo e resolver) e Cloro (nova verificação e nova medição): marcar antes de enviar; depois, a foto grande mostra a original.
- **Dados:** `dataUrl`/`img` com as marcas, `base` (original), `marcas` (mesmo formato do EFClaudian), `marcadoPor`, `marcadoEm` (novos) em sv2_rnc_foto, sv2_fotos e sv2_cloro_foto.

## Respostas seguidas (ele disse só “pode iniciar”)
“Remover, editar, corrigir a qualquer momento” aplicado às marcas (qualquer marca sai ou muda a qualquer momento, sem perder a original); celular com fundo escuro. Perguntado de novo no ITEM 5 da página. Fluxograma fora desta versão (espera a integração com o Docs).

## Testes
`t_v064.js` (30 ok). Suíte: 32 arquivos, 1.287 ok, 0 falhas (`docs/suite-v0.6.4.log`); depois dos ajustes finais da foto grande, t_v064 rodado de novo (30 ok). `t_html_seg` com a base regravada (nomes novos: constantes do editor, números e booleano).
Auditoria visual: botões 36 px no PC; editor sem rolagem lateral no celular; corrigidos antes da página: concordância (“Seta amarela”), o “X” da foto grande que caía para a segunda linha no celular, “Baixar” que caía para a terceira, o ícone de baixar que parecia “enviar” (ícone novo de download) e “Com as marcas” quebrando em duas linhas.

## Firebase (para conferir)
Nada de coleção nova. Os documentos de foto ganham `base`, `marcas`, `marcadoPor`, `marcadoEm` e `substitui`; se as regras do Firestore limitam os campos de sv2_rnc_foto, sv2_fotos ou sv2_cloro_foto, precisam aceitar esses.

## Respostas do Elias (11/11 20:03 e 20:53)
v0.6.4: ITENS 1 a 6 **aprovados**. Na checklist: "Pode publicar a v0.6.4" e próxima etapa v0.6.5 Coletas › Água com **Sonnet 5.5 · Esforço alto** (recomendado).

## Publicação da v0.6.4 (11/11 20:5x)
Commit eec8edd; index.html do GitHub conferido contra o testado (sha igual); o PDF real da RNC continua fora do repositório. t_v064 rodado de novo antes (30 ok).

---

# v0.6.5 — Coletas › Água (11/11/2026, aguardando aprovação)
Construída com Sonnet 5.5 · Esforço alto (a parte final com Opus 5.5).

## Escopo dividido (dito ao Elias ao começar)
No EFClaudian a Água tem 3 partes: Água-1 (v2.27, rodízio, plano, coletas), Água-2 (v2.28, ação corretiva e relatório por local) e Projetos (v2.31, calendário com confirmar/remarcar/não vai ter, sv2_aguaproj e sv2_aguaponto). Ficou assim:
- **v0.6.5** = coletas de água (Água-1) + caixas dos projetos só para consulta.
- **v0.6.6** = ação corretiva e relatório por local.
- **v0.6.7** = projetos e pontos de água.

## O que entrou
- **Arquivos novos:** `src/agua.js` e `src/agua.css`, registrados em `tools/montar.py` logo depois de `coletas`. Aba nova **Água** em Coletas (Amostras · Água · Programação · Envio · Cadastros). `casca.js` lê `sv2_cfg/agua` em `S.cfgAgua`. `sino.js` abre o aviso `refTipo: 'coleta_agua'` direto no detalhe. Busca geral acha coletas de água.
- **Tela:** caixas dos projetos (só leitura; o Rodízio dos bebedouros tem “Lançar esta coleta”), Acompanhamento (recoletas, ações corretivas abertas, laudos atrasados, média de dias até o laudo por laboratório) e a tabela padrão (Coleta, Hora, Tipo, Ponto, Análise, Laboratório, Envio, O.S, Resultado, Agente, Gravidade, Ação corretiva; filtros Tipo, Situação, Laboratório). Cabeçalho resume recoletas, laudos atrasados e ações abertas.
- **Cinco modelos de layout da aba** na página (agv=1 a 5 no endereço, só para a página): 1 acompanhamento em cima da tabela (como o EFClaudian; é o padrão hoje), 2 numa gaveta, 3 ao lado, 4 linha de resumo, 5 duas abas dentro da aba. Depois da escolha do Elias, as outras saem do código.
- **Nova coleta de água** (gaveta em 3 passos): Tipo em janela retrátil (Rodízio, Mesclada, Recoleta quando há pendência, Avulsa), Onde (bebedouros há mais tempo sem coleta já marcados; mesclada com todos; recoletas pendentes; avulsa com ponto ou nome digitado), Coleta (data, hora, análise, laboratório, amostras por ponto, coletor). Rodízio e mesclada gravam `projetoId: 'legado'` + `ocorrencia` (pela caixa ou pela data, igual ao `pjVinculoLegado` do EFClaudian).
- **Detalhe:** ciclo com o tubo de gota (Coletada, Enviada, O.S, Resultado, Compra do serviço), dados, recoleta pedida ou lançada, ação corretiva (só mostra; conduzida no EFClaudian). Rodapé: Informar/Corrigir envio, Registrar/Corrigir resultado, Pedir recoleta. Lixeira no canto (Líder ★ e Administrador) para cancelar com motivo.
- **Formulários:** envio (data, laboratório, O.S, nº da solicitação; não antes da coleta nem depois do laudo), resultado (Pendente/Conforme/Não conforme em lista retrátil, data do laudo, agente e gravidade no não conforme), pedir recoleta (motivo ≥ 5 letras), cancelar (motivo ≥ 5), prazos (laudo e recoleta, 1 a 60 dias).
- **Aviso:** não conforme manda Notif (crítico se grave) para quem lançou, os superiores e os Administradores, igual ao EFClaudian.

## Dados (os mesmos do EFClaudian v2.102.60)
`sv2_aguacol` com os mesmos campos (data, hora, semana, analiseId/Nome, qtd, coletor, lab, envio, os, numSolicitacao, resultado, obs, situacao, canceladaMotivo, valor, precoRev, nf, compra, pedidoSankhya, dataSolicitacao, solicitadoPor(Nome), tipoColeta, agente[], agenteOutro, gravidade, laudoEm, pontoRef, pontoNome, bebIds[], rodada, recoletaDe, recoletaPedida{motivo,por,porNome,ts}, projetoId, ocorrencia, criadoEm/Por/PorNome). `sv2_cfg/agua` (periodoDias, porVez, laudoDias, recoletaDias, fora). Só leitura: `sv2_aguaproj`, `sv2_aguaponto`. Histórico: criar_coleta_agua, alterar_coleta_agua, pedir_recoleta_agua, cancelar_coleta_agua, config_agua.

## Decisões tomadas por mim (ITEM 9 da página)
Resultado em lista retrátil (eram 3 botões); envio e resultado em formulários separados; cancelar só Líder ★/Administrador (podeCadastrar do EFClaudian); caixa do projeto sem confirmar/remarcar; tipo Projeto só se lança no EFClaudian.

## Defeito achado
Nos formulários, a lista retrátil tem 34 px e o campo ao lado 40 px (aparecia em Resultado × Data do laudo). Corrigido só nos formulários da Água (classe `.ag-al`, 40 px). O mesmo existe no formulário Coletado da Programação, onde os 34 px são exigidos pelos testes t_v0410 e t_v045 (aprovados antes): perguntado no ITEM 10 se passa tudo para a mesma altura.

## Testes
`t_v065.js` (58 ok) com a semente `tools/testes/ag_semente.js`. Suíte: 33 arquivos, 1.345 ok, 0 falhas (`docs/suite-v0.6.5.log`). Ajustes em testes antigos: t_v010 (Coletas agora com 5 abas) e base do t_html_seg regravada (nomes novos conferidos: classes constantes, números, booleano, EFCLAUDIAN_URL).
Auditoria visual (1280 e 390, Claro e Escuro): botões 36 px no PC e 44 px no celular, 3 a 5 tamanhos de letra, nenhuma cor fora dos tokens, nada rola para o lado, zero erros. Corrigidos antes da página: faixa colorida na lateral das linhas do acompanhamento (sinal de "cara de IA"), dica dos bebedouros alinhada à direita, "O.S O.S" repetido no ciclo.

## Firebase (para conferir)
Nada de coleção nova. O EFCwork passa a gravar em `sv2_aguacol` (add ao lançar; update de envio, resultado, recoleta pedida e cancelamento) e em `sv2_cfg/agua` (prazos, Líder ★/Administrador), e a ler `sv2_aguaproj` e `sv2_aguaponto`. As regras são as mesmas do EFClaudian; confirmar que valem para quem entra pelo EFCwork.

## Respostas do Elias à v0.6.5 (11/11 21:56)
- **OPÇÃO 2 aprovada** (acompanhamento numa gaveta); OPÇÕES 1, 3, 4 e 5 reprovadas. Comentário na OPÇÃO 2 (regras dele):
  1. Bebedouro novo colocado no rodízio vai ser o próximo, junto com outro que será analisado; ele tem liberdade de escolher outro se quiser.
  2. Se der contaminado, ele é o próximo a ser analisado.
  3. Poder escolher o rodízio semanal, quinzenal, mensal etc., e de 1, 2, 3 ou mais pontos de uma vez.
  4. As caixas podem ser de outros pontos com outras análises, como Canal (metais pesados, microbiologia, pesticidas, química completa etc.).
- ITENS 1 a 10 **aprovados**. ITEM 7 (regras iguais ao EFClaudian): "sim, mas nem todos; tem algumas regrinhas lá em cima que eu queria levar em consideração" (as 4 acima). ITEM 10 aprovado = passar todos os formulários para a mesma altura.
- Sem "pode publicar" ainda.

## Ajustes depois das respostas (11/11 22:0x, Opus 5.5)
- Só a OPÇÃO 2 ficou no código: tela com as caixas dos projetos e a tabela; botão "Acompanhamento (N)" no topo (só quando há pendência) abre a gaveta com o prazo do laudo, a média por laboratório e as linhas (Lançar / Abrir). Removidos o parâmetro agv e as outras 4 telas (e o CSS delas).
- Regras 1 e 2 conferidas: já valiam (bebedouro nunca coletado vem antes no rodízio; o não conforme vira Recoleta, que é o tipo sugerido e já vem marcado). Agora há teste: BR 06 novo → sugeridos "BR 06, BR 01", a caixa mostra, a Nova coleta marca os dois e deixa trocar. Corrigido junto: a aba Água não se redesenhava quando um bebedouro mudava (inspecoes.js agora redesenha a Água também).
- Regras 3 e 4 são da configuração dos Projetos → **requisitos da v0.6.7**: frequência semanal, quinzenal, mensal e outras (o EFClaudian guarda em semanas, `cadaSemanas`; mensal de verdade precisa de campo novo, a decidir na v0.6.7); pontos por vez 1, 2, 3 ou mais (`porVez`); projetos para outros pontos (canal, poço, açude etc.) com outras análises (metais pesados, microbiologia, pesticidas, química completa).
- ITEM 10 aplicado no app todo: `.fm-g .fm-c .dd-b{height:40px}` em lanca.css (lista retrátil lado a lado com campo = 40 px no PC; no celular continuam 44). Testes antigos t_v0410 e t_v045 passaram a conferir o alinhamento em vez dos 34 px.
- Testes: t_v065 com 67 ok. Suíte: 33 arquivos, 1.354 ok, 0 falhas. t_html_seg com a base regravada (nome novo: `np`, um número).

## "Pode publicar, pode iniciar por etapa" (11/11 22:41)
v0.6.5 publicada (commit d9750d7; index.html do GitHub conferido contra o testado; PDF real da RNC fora). Começada a v0.6.6 com Opus 5.5 · alto (modelo que ele mesmo trocou).

---

# v0.6.6 — Coletas › Água: ação corretiva e relatório por local (11/11/2026, aguardando aprovação)

## O que entrou
- **Arquivo novo:** `src/aguaac.js` (prefixos ac e agr), registrado em `tools/montar.py` logo depois de `agua`. CSS em `agua.css` (cartão da ação, tratativas, miniaturas, impressão).
- **Abrir a ação** (Líder ★/Administrador), na seção "Ação corretiva" do detalhe da coleta não conforme: responsável (janela retrátil com a equipe), prazo (≥ hoje, vem +7 dias), o que fazer (≥ 5 letras). Aviso ao responsável (`refTipo: 'agua_acao'`).
- **Ação** em gaveta própria (`acAbre`): dados, aviso "Fotos até …" quando concluída, tratativas com fotos (miniaturas sob demanda; tocar abre `fedVer`). Rodapé: Coleta, Concluir, Registrar etapa. Impressora no topo (PDF da ação).
- **Etapa / concluir** (`LC_FORM.acEt`): texto (≥ 5 letras; na conclusão é opcional se já há etapa), até 5 fotos com Marcar (editor da v0.6.4). Fotos em `sv2_agua_foto` com `coletaId, dataUrl, criadoEm, porId` (+ `base, marcas, marcadoPor, marcadoEm` quando marcadas). Avisos: quem abriu e o responsável; na conclusão também os Administradores.
- **Fotos vencidas:** 7 dias depois da conclusão, `acFotoLimpar` grava `dataUrl: ''` + `apagadaEm` em cada foto e `acao.fotosApagadas` (roda uma vez por sessão no aparelho do Líder ★/Administrador, 2,5 s depois de carregar as coletas). Texto nunca é apagado.
- **Relatório de água por local** (impressora no topo da aba, Líder ★/Administrador): período, avulsas sim/não, contagem antes de gerar; PDF A4 deitado com números do período, resumo por local e uma tabela por local (colunas fixas, título preso à tabela).
- **Coletas de água carregam para todos** (o responsável sem a atribuição Coletas abre a ação pelo sino); a aba continua só com Coletas; o botão "Coleta" some para quem não tem a aba.
- **Defeito corrigido (Apontamentos também):** "Marcas · 1" quebrava na miniatura de 72 px no PC → miniaturas 84 px e rótulo sem quebra.

## Testes
`t_v066.js` 39 ok (semente própria: g8 não conforme sem ação, g9 com ação concluída há 10 dias e 2 fotos). Suíte: 34 arquivos, 1.393 ok, 0 falhas (`docs/suite-v0.6.6.log`). t_v065 ajustado (o detalhe mostra o cartão da ação). t_html_seg com base regravada (nomes novos: índices, contagens, constantes AC_*, HTML montado com esc()).
Impressões conferidas em PDF (A4 deitado): ação com 2 etapas e 3 fotos; relatório com 6 locais em 2 páginas.

## Firebase (para conferir)
- `sv2_aguacol`: update do campo `acao` (abrir: Líder ★/Administrador; etapas e conclusão: o responsável também). Se as regras só deixam a atribuição Coletas mexer, o responsável sem ela não consegue registrar etapa.
- `sv2_agua_foto`: set pelo responsável/Líder ★/Administrador; os campos novos `base, marcas, marcadoPor, marcadoEm` (fotos marcadas) e `apagadaEm` (eliminadas) precisam ser aceitos.
- Leitura de `sv2_aguacol` para todos os usuários logados (para o responsável sem Coletas).

## Próxima
v0.6.7 Projetos de água e pontos (com as regras do Elias de 11/11 21:56: frequência semanal/quinzenal/mensal, 1, 2, 3+ pontos por vez, caixas de outros pontos com outras análises — Canal: metais pesados, microbiologia, pesticidas, química completa).

## Respostas do Elias à v0.6.6 (12/11 02:11)
ITENS 1 a 8 **aprovados**. ITEM 4 (PDF da ação): "a foto tem ocupado todo o quadrado delimitado; esse quadrado pode ser 3x4 deitado e o tamanho da foto também, porém sempre forçado à horizontal". Feito: no PDF cada foto ocupa um quadro 4:3 deitado (56 × 42 mm), recortada ao centro, sempre na horizontal (t_v066 39 ok; PDF conferido). Mensagem terminou com "já iniciar" (= começar a v0.6.7). **Sem "pode publicar" para a v0.6.6**: continua não publicada até ele autorizar.

---

# v0.6.7 — Coletas › Água: projetos de coleta e pontos de água (12/11/2026, aguardando aprovação)
Construída com Opus 5.5 · alto, depois do "já iniciar" (12/11 02:11). A v0.6.6 continua não publicada (sem "pode publicar").

## O que entrou
- **Arquivo novo:** `src/aguapj.js` (prefixos pj = projetos e pa = pontos de água; "pp" já era do plano.js), registrado em `tools/montar.py` depois de `aguaac`. Ícones novos em base.js: calendario, esq, dir, cima, baixo.
- **Caixas:** toda caixa abre o projeto; "Lançar esta coleta" vale para qualquer projeto; caixa "Novo projeto" (Líder ★/Administrador); frequência com nome e todas as análises na caixa.
- **Detalhe do projeto** (`pjAbre`) em 5 modelos (OPÇÕES 1 a 5, `?pjv=N` ou `S._pjVar`, só para a página): lista de datas, calendário do mês, linha do tempo, tabela, próxima em destaque. Lixeira = desativar com motivo; rodapé Editar. Ações da data: Confirmar, Remarcar, Não vai ter, Lançar (botões em grade de colunas iguais).
- **Remarcar** com realinhamento (rodízio e projetos com rodízio): pergunta "Só as automáticas" × "Mudar todas" quando há remarcada à mão mais à frente (`realinhos`, `fixas`, iguais ao EFClaudian v2.59). O legado vira documento na primeira mudança (`pjGarantir`).
- **Editor** (`LC_FORM.pjEd`, 6 passos): nome; pontos por grupo; como (janela retrátil todos/rodízio + pontos por vez); análises (várias) + laboratório; quando (dia seg–sáb, repete, hora, a partir de); conferir. Aviso de ponto repetido (mesma análise e laboratório) com "Salvar mesmo assim" e Notif.
- **Lançar do projeto:** a Nova coleta (agua.js) ganhou o tipo Projeto: contexto do projeto, pontos (sugeridos marcados), análises (várias marcadas) → uma coleta por ponto × análise, com `projetoId`, `ocorrencia`, `rodada`, laboratório de cada análise.
- **Avisos** (`pjAviso`, 3 s depois de entrar, uma vez por sessão): "Confirmar coleta de água" no dia útil anterior para os Líderes ★ responsáveis por AGUA (cfgCol.resp) e secundários com Coletas, sem repetir.
- **Coletas › Cadastros** passa a mostrar **Pontos de água** (sv2_aguaponto): novo, editar (tipo, nome, local), desativar/reativar; o resto dos cadastros segue no EFClaudian.

## Regras do Elias (11/11 21:56) aplicadas — decisões na página
- Frequência com nome (ITEM 5): 1, 2 (quinzenal), 3, 4 (mensal = 4 semanas), 6, 8 (bimestral), 13 (trimestral), 26 (semestral) semanas, em `cadaSemanas`. O editor do EFClaudian só conhece 1, 2, 3, 4, 6, 8. "Mensal de verdade" exigiria mudar o EFClaudian.
- Várias análises (ITEM 6): `analiseIds[]` + `analiseId` = a primeira. O EFClaudian vê só a primeira.
- Pontos por vez 1, 2, 3+: já existia (`porVez`), com a dica "um ponto novo entra primeiro".
- Canal: entra como tipo "Outro" (o tipo "Canal" exige mudar o EFClaudian) — ITEM 7.

## Defeitos achados
- Colisão de nomes: as funções dos pontos de água começavam com "pp" como as do Plano de coleta (ppTela, LC_FORM.ppEd, DD_AO.pp) e o Plano sumia → prefixo "pa". Conferido: nenhuma função global duplicada no index.html.
- t_v061 dependia do dia da semana (contava 4 apontamentos "desta semana" fixos) → agora calcula pelo início da semana.
- t_v010 pegou "Fazenda Russas" num exemplo de campo → trocado por "Fazenda Norte".

## Testes
`t_v067.js` 53 ok. Suíte: 35 arquivos, 1.446 ok, 0 falhas (`docs/suite-v0.6.7.log`). t_v065 ajustado (conta só as caixas de projeto). t_html_seg com base regravada (nomes novos: id/oc já escapados, situações fixas, números, HTML montado com esc()).

## Firebase (para conferir)
- `sv2_aguaproj`: o EFCwork cria/edita (Líder ★/Administrador: nome, pontos, porVez, mesclada, analiseId, **analiseIds**, lab, cadaSemanas, dia, hora, inicio, ativo, motivoInativo, desativadoEm/Por, realinhos, fixas) e quem lança coletas grava confirmadas/remarcadas/puladas. O campo novo `analiseIds` precisa ser aceito.
- `sv2_aguaponto`: o EFCwork cria/edita/desativa (Líder ★/Administrador).
- `sv2_aguacol`: coletas novas com `tipoColeta: 'projeto'`, `projetoId`, `ocorrencia`.

## Respostas do Elias à v0.6.7 (12/11 02:55)
- **OPÇÃO 2 aprovada** (calendário do mês); OPÇÕES 1, 3, 4, 5 reprovadas → só o calendário ficou no código (`pjCal`; tirados pjV1/3/4/5, `?pjv=` e o CSS deles).
- ITENS 1 a 9 aprovados. **ITEM 5:** "Mas depois devemos corrigir isso lá para aqui ser como eu te falei" → **pendência**: mudar o EFClaudian para aceitar frequência mensal de verdade (mesmo dia do mês) e as frequências longas no editor dele; depois o EFCwork passa a usar "mensal" real.
- "Pode publicar e iniciar a próxima etapa" (02:55) e logo depois "Quando publicar aguarde um momento" (02:56): publica a v0.6.6 + v0.6.7 juntas e **espera**, sem começar a próxima etapa.
- Testes depois do ajuste: t_v067 46 ok (calendário: datas marcadas, troca de mês, tocar na data); t_v065 67, t_v066 39, t_v010 41, t_v046 40, t_html_seg sem falhas. Suíte: 35 arquivos, 0 falhas.

## Pedido de 12/11 03:02 — varredura completa + integração EFCdocs e Quiz
Pedido (voz): varredura completa em busca de defeitos e fragilidades no código, auditoria interna visual, e mapeamento da implementação do EFCdocs e do Quiz.
Respostas na checklist (03:0x):
- Modelo: **Etapa 1** (varredura + auditoria visual) com **Opus 5.5 · alto**; **Etapa 2** (mapa da integração EFCdocs/Quiz + nota de compatibilidade para a IA do Docs) com **Fable 5.2 · alto**.
- Documentos que o Docs cria/edita e o EFCwork anexa para impressão rápida (como a etiqueta da caixa no EFClaudian): **fluxogramas, POPs e procedimentos, etiqueta dos isopores, cadeia de custódia, ficha do Ibra — tudo que for de preenchimento**. O documento pode ser criado do zero pelo app ou importado pelo EFCwork e vinculado como documento de impressão direta. Ele está criando o Docs com outra IA e quer as duas na mesma direção, 100% compatíveis: sugestões, se é possível, dificuldades, modelo e esforço.
- EFCdocs: tem repositório no GitHub (nome a confirmar).
- Quiz: botão de acesso; treinamentos no histórico do EFCwork; atividade do EFCwork no Quiz; mesmo login. "Sobre a atividade no Quiz, ele pode ter seus treinamentos independentes e também posso passar os treinamentos sem o quiz; isso se torna opcional."

---

# v0.6.8 — Etapa 1: varredura de defeitos e auditoria visual (12/11/2026, aguardando aprovação)
Opus 5.5 · alto. Página: `docs/aprovacao-efcwork-v0.6.8-varredura.html` (9 itens).

## Como foi feita
- **Código:** análise com parser (acorn) de todo o index.html montado: nomes usados sem declaração (nenhum), funções globais repetidas (nenhuma); funções assíncronas com gravação fora de try nos formulários (10, todas via Aprov.pedir); carimbos UTC cortados como data (15 lugares); listas lidas sem limite.
- **Telas:** 112 medições (todas as áreas e abas + o detalhe quando havia linha), PC 1280 e celular 390, Claro e Escuro: erros de JavaScript, rolagem lateral, alturas de toque, pares lado a lado com alturas diferentes, tamanhos de letra, cores fora dos tokens.

## Corrigido (ITENS 2 a 5)
- `diaLocal(ts)` em base.js; `fmtD` passa por ela; 15 trocas de `String(x.criadoEm/abertoEm/concluidoEm/laudoEm/ts || '').slice(0, 10)` em almox, analise, calibracao, coletas, contagem, documentos, programacao.
- `Aprov.pedir` protegido (`_pedir` dentro de try): aviso "Não deu para enviar o pedido" + lcErro no formulário.
- Início: `parcial` de Coletas e Inspeções; frase das tarefas.
- Celular: `.cs-busca` 44 px; `.cp input/select` 44 px; `.pg-i` com área de toque maior (::after).
- Testes: `t_v068.js` 10 ok (fuso America/Fortaleza). Suíte: 36 arquivos, 1.449 ok, 0 falhas (`docs/suite-v0.6.8.log`). Varredura repetida depois: só o desenho de 22 px do "i" da Programação (área de toque já maior).

## Decisões pedidas (ITENS 6 a 9)
6. Limitar Coletas e Água às 3.000 mais recentes (como o EFClaudian na água). 7. Fotos vencidas da ação só somem quando Líder ★/Administrador abre o app. 8. Lista consolidada das regras do Firebase a conferir. 9. Pendências de compatibilidade com o EFClaudian (frequências, várias análises, tipo Canal) — sugerido fazer junto com a Etapa 2.

## Próximo
Etapa 2 (Fable 5.2 · alto): mapa da integração EFCdocs (EliasGrigori/EFCdocs) e Quiz (EFCquiz / EFC-Sabi--Quiz) + nota de compatibilidade para a IA do Docs.

## "Pode publicar e pode iniciar próxima etapa" (12/11 04:02, já no Fable 5.2)
v0.6.8 publicada com as correções dos ITENS 2 a 5. Os ITENS 6 a 9 da página da varredura ficaram sem resposta (limite de 3.000 nas listas, fotos vencidas, regras do Firebase, pendências do EFClaudian): seguem em aberto. Começada a Etapa 2 (integração EFCdocs e Quiz).

## Etapa 2 · Mapa da integração com o Vértice Docs e o Sabiá (12/11, Fable 5.2 · alto)
Nada do app mudou (segue v0.6.8; suíte não foi rodada de novo porque `src/` e `dist/` estão iguais).

**Lido:** EFCdocs v0.6.11.1 (memória, ficha do sistema, `nucleo/modelo.js`, `armazem.js`, `banco.js`, `perfis.js`, `features.csv`, leitura e gravação de `definedNames`), Sabiá v1.5.0 (memória, `src/integra.js`, `live.js`, regras do Realtime Database), EFCquiz v2.8.8 (bloco da nuvem), EFClaudian v2.102.60 (etiqueta da caixa, botões "Outros apps").

**Fatos que mandam no desenho:**
- Os apps estão na mesma origem (eliasgrigori.github.io): `localStorage`, IndexedDB e `BroadcastChannel` são comuns.
- O EFCwork usa app do Firebase com nome (`'efcwork'`, v0.4.10); EFClaudian, EFCquiz e Sabiá usam o padrão. Sessões separadas.
- Só Firestore; sem Storage (plano pago) e sem Functions. Registro de até 1 MB: arquivo vai em pedaços.
- O Docs guarda só no aparelho e não tem login (nuvem na v0.9.0 dele, ligação na v0.10.0). Planilha e Quadro geram PDF; Documento só na v0.7.0.
- Sabiá e EFCquiz guardam o histórico de treinamentos só no aparelho do instrutor.
- No EFClaudian só a etiqueta da caixa é do app; fichas e custódias saíram em 25/09 (são do laboratório, no Excel).

**Proposta (Contrato EFD v1):**
- `efd_docs/{id}` = ficha do Docs + `pub` (cópia de impressão em PDF: rev, sha256, partes, papel, campos, preenche); pedaços em `efd_docs/{id}/copia/{rev}_{n}` (base64, até 900.000 caracteres, até 12 pedaços, cerca de 8 MB). Publicar: primeiro os pedaços, depois troca o `pub`.
- Importação pelo EFCwork: PDF ou imagem entra como `tipo: 'externo'` já com cópia; Excel ou Word ficam em `original/` até o Docs abrir e publicar.
- `sv2_impressos/{id}` = ponto de impressão do EFCwork (`ponto`, `docId`, `lab`, `copias`).
- Preenchimento: dicionário de 31 campos e 2 listas; na Planilha, nome definido do Excel (`coleta.os` ↔ `efc_coleta_os`); quem desenha é o Docs; pedido em `localStorage['efd:pedido:<pid>']`, página `?imprimir=<docId>&pedido=<pid>` em iframe, resposta no canal `efd`. `folhas` = várias folhas numa impressão.
- `sv2_treinos/{id}` = treinamento com ou sem quiz (`origem` efcwork ou sabia, `quiz` opcional com `sessaoId` e código SAB, participantes, situação programado/realizado/cancelado).
- Login: mesma conta; sessão própria em cada app; atalho com `auth.updateCurrentUser` a provar com o Firebase de verdade.

**Arquivos novos:**
- `docs/MAPA-INTEGRACAO-DOCS-E-QUIZ.md` (para o Elias) e `docs/NOTA-PARA-A-IA-DO-VERTICE-DOCS.md` (para a outra IA).
- `tools/contrato/efd-v1.js` (conferente comum, navegador e Node), `gerar-exemplos.js`, `exemplos-efd-v1.json` (inventados), `confere.js`: `node tools/contrato/confere.js` → 87 ok, 0 falhas.
- `docs/aprovacao-efcwork-integracao-docs-quiz.html`: 12 itens, esboços feitos dentro do app em demonstração (Documentos › Impressos, detalhe com prévia, impressos do envio, Qualidade › Treinamentos), 1280 e 390, Claro e Escuro. Sem rolagem lateral; botões do cabeçalho com 36 px (PC) e 44 px (celular).

**Não testado daqui:** regras do Firestore para `efd_docs`, `sv2_impressos`, `sv2_treinos`; atalho de sessão entre apps; impressão de PDF no Android.

**Plano sugerido:** v0.6.9 Impressos (Opus 5.5 · alto) · v0.6.10 Etiqueta da caixa (Sonnet 5.5 · alto) · v0.6.11 Treinamentos (Opus 5.5 · alto) · v0.6.12 Preenchimento, depende do Docs (Opus 5.5 · alto). No Docs: Ponte 1 e Ponte 2 (Fable 5.2 · alto). Sabiá e EFClaudian: versões curtas (Sonnet 5.5 · alto).

**Aguardando:** respostas dos 12 itens desta página e dos ITENS 6 a 9 da varredura.

## Respostas da página de integração (12/11 08:08)
Todos os 12 itens aprovados, com estas condições:
- ITEM 2: o documento precisa poder ser **vinculado ao item**, como no EFClaudian (ao fazer o envio, oferece imprimir o rótulo destinatário/remetente). A **Ficha/Cotação** sempre pergunta se quer adicionar algo (pontos, quantidades etc.). Pediu sugestões de melhoria. **Não pode depender 100% do app**: tem de dar para exportar e imprimir de outro lugar se o app falhar. PDF importado abre dentro do EFCwork; Word e planilha que precisam ser editados redirecionam ao Vértice.
- ITEM 4: Coletas › Envio mostra na tabela os **laboratórios**; tocar num abre a gaveta lateral, onde anexa documentos e etiquetas. No que ele precisa preencher (**Word e Excel**), quer no Vértice uma **janela de resumo** com os principais dados preenchidos (quantidade de amostras, tipo de análise etc.) para não esquecer na hora de preencher.
- ITEM 5: aprovado com as condições acima; pediu as melhores possibilidades e o que mais for importante ter.
- ITEM 6: preencher sozinho deve aceitar de **1 até 32 campos**, e os campos **podem ser células mescladas**.
- ITEM 7: **treinamentos de teste não entram** no histórico.
- ITEM 8: Sabiá como **botão no menu lateral esquerdo**, junto com o do Vértice ("capricha").
- ITEM 9: no Vértice haverá uma aba de **arquivos de documentos internos** (formulários, fluxogramas), tudo na pasta compartilhável com o Cwork, **mas o Cwork só abre nativamente o PDF**; sub-abas para separar (fluxo com fluxo, FOR com FOR...); aparece segregado numa tabela com **quem editou, data e versão**.
- ITEM 10: limitar o arquivo ao essencial: **endereços e fichas/cadeias de custódia**.
- ITENS 1, 3, 11, 12: aprovados sem comentário.
- Pedido novo: **refazer todo o plano de integração**, com sugestões e **realista para quem não quer plano pago** (Firebase grátis).

## Plano de integração refeito (12/11, 12h, Fable 5.2 · alto)
Pedido: refazer o plano com as condições dele, com sugestões, realista para quem não quer plano pago. Modelo escolhido por ele no checklist: Fable 5.2 · alto. Nada do app mudou.

**Conferido nas páginas do Google (12/11):** Firestore grátis = 1 GiB guardado, 50 mil leituras, 20 mil gravações e 20 mil exclusões por dia, 10 GiB de saída por mês, zera à meia-noite do Pacífico; Storage exige o plano Blaze desde 03/02/2026 (projetos no Spark perderam o acesso); App Check com reCAPTCHA Enterprise tem validade do token de 30 min a 7 dias (padrão 1 h) e cota mensal grátis.

**Mudança principal:** o Vértice não precisa de Firebase, login nem regras. Como os apps estão na mesma origem, trocam por uma caixa no aparelho (IndexedDB `efd-ponte`, gaveta `caixa`, aviso no canal `efd`). Só o EFCwork grava na nuvem, com o login de quem está usando. O Sabiá entrega o resumo do treinamento pela mesma caixa. Condição: mesmo aparelho e mesmo navegador; fora disso, exportar o PDF e importar.

**Prova:** `tools/contrato/confere-ponte.js` (Playwright, servidor local, EFCwork real em demonstração + página no lugar do Vértice): documento com PDF em 3 pedaços chega inteiro (tamanho e SHA-256), com o EFCwork aberto e fechado; resumo e arquivo do Excel vão do EFCwork ao Vértice byte a byte; treino do Sabiá chega e o de teste é recusado; item fora do combinado não entra; outro endereço não enxerga a caixa. 13 ok, 0 falhas.

**Contrato EFD v1 ajustado (ninguém construiu em cima ainda):** `PARTES_MAX` 5 (cópia até ~3,3 MB), `ORIG_PARTES_MAX` 2 (original até ~1,3 MB), `CAMPOS_MAX` 32, ficha com `pastaNome` e `orig`, treino com `teste: true` recusado. `node tools/contrato/confere.js` → 91 ok, 0 falhas.

**Desenho por condição dele:**
- Documentos › Impressos separado por `pastaNome`, com formato, quem editou, data e versão; PDF abre no EFCwork; Excel e Word mostram a cópia e redirecionam ao Vértice; Baixar (PDF e original) em cada papel e botão Reserva (ZIP de todos); medidor de espaço e teto de 150 MB.
- Coletas › Envio com vista Laboratórios; gaveta do laboratório com endereço (destinatário do rótulo) e kit de impressão (sempre / perguntar / só se eu pedir); rótulo destinatário e remetente do próprio sistema, endereços no cadastro.
- Ao enviar: "Papéis deste envio" com o kit marcado e "Quer acrescentar algo na ficha?" (amostras, caixas, análise, pontos, observação); registro do que foi impresso por remessa.
- Vértice: aba de documentos internos com sub-abas, Compartilhar com o Cwork, janela de resumo do envio (copiar por linha, "na ficha", faltam N de M).
- Preencher sozinho depois: 1 a 32 campos, célula mesclada (valor na âncora).
- Menu lateral com grupo "Apps da família": Vértice Docs e Sabiá, com o ícone de cada app.
- Treinamentos: teste e ensaio não entram.

**Sugestões levadas à página (ITEM 11):** aviso de versão nova no sino; obsoleto não imprime; reimprimir o último kit; lista de presença com os nomes; papel por análise; modelos prontos no Vértice; aviso se a quantidade da ficha diferir do envio; link no lugar de arquivo grande.

**Auditoria visual dos esboços (1280 e 390, Claro e Escuro):** sem rolagem lateral; rodapés com botões na mesma linha e altura (36 px no PC, 44 px no celular). Defeito achado e corrigido antes da página: no celular, a gaveta do papel tinha três botões no rodapé e o Imprimir caía para a linha de baixo; o Baixar virou ícone no canto de cima.

**Arquivos:** `docs/PLANO-INTEGRACAO-v2.md` (substitui o MAPA, que ficou marcado como substituído), `docs/NOTA-PARA-A-IA-DO-VERTICE-DOCS.md` (2ª edição), `tools/contrato/efd-ponte.js`, `confere-ponte.js`, `docs/aprovacao-efcwork-plano-v2.html` (12 itens).

**Ordem proposta:** v0.6.9 Impressos (Opus 5.5 · alto) · v0.6.10 Kit e envio (Opus 5.5 · alto) · v0.6.11 Ponte com o Vértice (Opus 5.5 · alto) · v0.6.12 Treinamentos (Sonnet 5.5 · alto) · v0.6.13 Preencher sozinho (Opus 5.5 · alto). Vértice: Ponte 1 (Opus 5.5 · alto), Ponte 2 (Fable 5.2 · alto). Sabiá: Sonnet 5.5 · alto.

**Não testado daqui:** regras do Firestore; quanto do 1 GiB já está ocupado; consumo do App Check; impressão de PDF no Android; a caixa de troca entre apps instalados por navegadores diferentes (não funciona, por desenho).

**Aguardando:** respostas dos 12 itens do plano v2; ITENS 6 a 9 da varredura.

## Respostas do plano de integração v2 (12/11 13:51)
ITENS 1 a 12 aprovados, incluindo as 8 sugestões do ITEM 11. Pergunta no ITEM 1: "essa nuvem é referente ao que, pode ser OneDrive ou outra?" (respondida na conversa: é o Firebase que o EFCwork e o EFClaudian já usam; o OneDrive serve para guardar a Reserva, não como banco do app). Ordem: "pode iniciar" a v0.6.9 Impressos com Opus 5.5 · alto.

---
# v0.6.9 · Documentos › Impressos e Apps da família (12/11/2026, Opus 5.5 · alto)
Primeira versão do plano de integração v2 (aprovado 12/11 13:51, ITENS 1 a 12 e as 8 sugestões). Não depende do Vértice nem do Sabiá. **Não publicada:** aguarda a página de aprovação e o "pode publicar".

**Arquivos novos:** `src/impressos.js` (prefixo `ip`), `src/impressos.css`, `tools/testes/t_v069.js` (58 ok). O `tools/contrato/efd-v1.js` entra no app pelo `montar.py` (`DE_FORA`), sem cópia: é o mesmo arquivo que vai para o Vértice.
**Mudados:** `casca.js` (aba Impressos em Documentos; `CS_APPS` + `csAppsFamilia` no menu, ícones de 48 px embutidos, só `isSup`), `casca.css`, `base.js` (VERSAO 0.6.9, ícone `baixar`), `tools/montar.py`, `tools/contrato/efd-v1.js` (tipo `link`; 94 conferências), `t_v010.js` (menu e estrutura com os Apps e a aba nova), base do `t_html_seg` regravada (187 nomes; conferidos: só constantes e endereços temporários).

**Como funciona:**
- Coleções novas: `efd_docs` (ficha do Contrato EFD v1, id = ficha.id, escuta das 600 mais recentes por `alteradoEm`) e `efd_partes` (id `{docId}_{c|o}{rev}_{n}`, `{docId, qual, rev, n, de, b64}`). Pedaços de até 900.000 caracteres; cópia até 5 (~3,2 MB), original até 2 (~1,3 MB); teto 150 MB (medidor no cabeçalho, destaque a partir de 80%).
- Grava os pedaços antes da ficha. Nova versão e lixeira gravam `b64: ''` nos pedaços antigos (nada é apagado; libera espaço).
- Toda ficha passa por `EFD.ficha` antes de gravar.
- Cópia guardada no IndexedDB `efcwork-impressos` (chave `{id}|{qual}|{sha256}`); ao abrir a aba, pré-baixa as vigentes. Lê da nuvem só o que falta, confere tamanho e SHA-256.
- Foto → PDF A4 de uma página feito no aparelho (JPEG embutido, sem biblioteca), deitado se a foto for deitada (`fonteFoto: true`).
- Excel/Word: `tipo planilha|docx`, `orig` com o arquivo; sem PDF fica `rascunho` ("Sem cópia em PDF", não imprime); com o PDF salvo pelo Excel/Word, `vigente`.
- Link: `tipo link`, só https, sem arquivo.
- Imprimir: PC com leitor de PDF → iframe fora da tela + `print()`; celular → abre no leitor do aparelho (se a aba for bloqueada, baixa). Obsoleto não imprime nem chamando direto. Cada impressão vai para `sv2_audit` (`imprimir_impresso`).
- Baixar PDF e original; Reserva = ZIP sem compressão feito no aparelho (pastas + `LISTA.csv` com BOM e `;`).
- "Abrir no Vértice" (até a v0.6.11): baixa o original e abre o Vértice numa aba nova.
- Permissões: ver, imprimir, baixar e Reserva para todos que veem Documentos; importar, editar, nova versão e lixeira para Administrador e Líder.

**Auditoria visual (1280 e 390, Claro e Escuro):** sem rolagem lateral, 0 erros de JavaScript, 5 tamanhos de letra na tela, botões 36 px (PC) e 44 px (celular), rodapés numa linha. Corrigido antes da página: (1) quatro ícones no cabeçalho da gaveta espremiam o título → Baixar foi para o corpo, dois botões lado a lado do mesmo tamanho; (2) no celular, três botões no topo quebravam a linha com larguras diferentes → Reserva e Importar em grade de duas colunas iguais e o Novo no Vértice só no PC (no celular o Vértice está no menu); (3) dois avisos por importação ("Enviando…" + "Importado") → o "Enviando" só aparece acima de 400 KB.
**Limite do teste:** o Chromium sem tela não tem leitor de PDF, então a prévia dentro da gaveta não aparece nos prints (aparece o "Ver o PDF", que é o caminho do celular). No Chrome de verdade aparece a folha.

**Suíte:** 39 arquivos (36 de versão + segurança do HTML + os dois conferentes do contrato), 1.614 conferências, 0 falhas (`docs/suite-v0.6.9.log`).

**Firebase (antes de usar de verdade):** publicar as regras de `efd_docs` e `efd_partes` (trecho em `REGRAS-FIREBASE-EFCwork.md`). Conferir em Firestore › Uso quanto do 1 GB já está ocupado.

**Próximas:** v0.6.10 Kit e envio (Envio › Laboratórios, endereços no cadastro, rótulo do sistema, Papéis deste envio, aviso de versão nova no sino) · v0.6.11 Ponte com o Vértice · v0.6.12 Treinamentos · v0.6.13 Preencher sozinho.

## Respostas da v0.6.9 (12/11 15:18)
ITENS 1 a 12 aprovados, sem comentário. Ordem: "Pode continuar" (segue para a v0.6.10; **publicar ainda não foi autorizado**). Pedido: ao concluir, mandar todos os roteiros do Grok juntos num ZIP.

---
# v0.6.10 · Kit do laboratório e papéis do envio (12/11/2026, Opus 5.5 · alto)
Plano de integração v2, ITENS 6 e 7 e sugestões 1, 3 e 5. **Não publicada** (a v0.6.9 também não): aguardam a página de aprovação e o "pode publicar".

**Arquivos:** `src/kit.js` (prefixo `kt`), `src/kit.css`, `tools/testes/t_v0610.js` (36 ok). Mudados: `coletas.js` (lista retrátil Remessas | Laboratórios na aba Envio; `ktTabLabs`; ícone da impressora e "Papéis impressos" na gaveta da remessa; depois de enviar abre os papéis; o aviso "fichas continuam no EFClaudian" saiu), `impressos.js` (`ipImprimir` devolve quando a impressão foi chamada; aviso de versão nova), `base.js` VERSAO 0.6.10, `montar.py` (módulo `kit`). Base do `t_html_seg` regravada (só variáveis numéricas e de marcação).

**Como funciona:**
- Endereço do laboratório em `sv2_cfg/coletas.labInfo[nome]` = {nome, end, bairro, cidade, uf, cep, contato, conteudo, rotulo}. Nada no código (no EFClaudian os endereços estão fixos em `FX_LABS`; aqui são cadastrados uma vez).
- Remetente: `sv2_cfg/empresa` do EFClaudian (`razao`, `unid.matriz|filial` com end, bairro, cep, mun, uf); unidade pela fazenda do talhão (`pgFazenda`), escolha manual quando há filial.
- Kit em `sv2_impressos` (Contrato EFD v1, `ponto: 'coletas.envio'`): docId, lab ('' = todos), copias (uma | n | porCaixa), quando (sempre | perguntar | pedir), analise ('' = todas), ordem, ativo. Validado por `EFD.impresso` antes de gravar.
- Rótulo do sistema: "Sempre/Perguntar/Só se eu pedir" fica em `labInfo.rotulo`.
- Papéis deste envio: abre sozinho depois de Enviar (cada laboratório do envio vira uma remessa: escolhe na lista). Sempre = marcado; Perguntar = desmarcado; Só se eu pedir = botão à parte. Dados sugeridos: amostras (quantas), caixas (1), análise e pontos (das amostras). Rótulo: uma folha A4 por caixa (até 20), "Caixa k de N". PDFs um depois do outro; Excel/Word sem PDF baixa e abre o Vértice. Obsoleto bloqueia.
- Registro em `sv2_envio_imp/{data_lab}` (itens com versão, dados, quem, quando) e `sv2_audit` (`imprimir_envio`). A gaveta da remessa mostra "Papéis impressos" e o resumo; o ícone da impressora reabre com os mesmos papéis e dados.
- Versão nova de um papel usado no kit: aviso no sino para Administrador/Líder com Coletas.
- Permissões: endereço e kit = Administrador e Líder; imprimir os papéis = quem lança coletas.

**Auditoria visual (1280 e 390, Claro e Escuro):** sem rolagem lateral, 0 erros; cabeçalho com a lista retrátil e os botões na mesma linha e altura (36 px PC, 44 px celular); no kit, a escolha fica na mesma linha do papel; no celular os campos lado a lado com a mesma altura e largura. Rótulo conferido em PDF A4.

**Suíte:** 40 arquivos, 1.650 conferências, 0 falhas (`docs/suite-v0.6.10.log`).

**Firebase:** regras de `sv2_impressos` e `sv2_envio_imp` e o campo `labInfo` (trecho em `REGRAS-FIREBASE-EFCwork.md`), além das da v0.6.9.

**Próximas:** v0.6.11 Ponte com o Vértice (depende da Ponte 1 de lá) · v0.6.12 Treinamentos (Sonnet 5.5 · alto, não depende) · v0.6.13 Preencher sozinho.

## Respostas da v0.6.10 (13/11 07:57)
ITENS 1 a 9 aprovados (Envio › Laboratórios, gaveta e kit, endereço no cadastro, anexar papel, Papéis deste envio, rótulo destinatário/remetente, reimprimir e resumo, sino de versão nova, quem pode o quê). "Pode publicar e iniciar a próxima etapa": v0.6.9 + v0.6.10 publicadas juntas (commit 3db05ef; sha do index.html conferido). Regras completas do Firestore entregues (arquivo dele v2.102.42 + efd_docs, efd_partes, sv2_impressos, sv2_envio_imp); o Líder ★ já pode gravar sv2_cfg/coletas.labInfo pela regra de hoje.

## Caixa do Grok (13/11 05:30) — v0.6.1 a v0.6.10
Testou a v0.6.8 (a que estava no ar). 165 itens, 6 "não", 3 "não testado" (v0.6.9 e v0.6.10 por não estarem publicadas; v0.6.2 9.3 e v0.6.5 4.2 pedem o EFClaudian real). Os "não": v0.6.1 1.3 (traço lateral aparece na gravidade Média), v0.6.1 3.4 ("Mudar gravidade" cortado no PC), v0.6.1 9.2 (busca a partir do Início não abre o detalhe), v0.6.4 3.1 e 3.2 (foto grande sem marcas/Original logo depois de enviar, no Apontamento e no Cloro), v0.6.5 1.4 (bebedouro novo fora do rodízio salvo). Observações: texto "seguem no EFClaudian" ainda em Áreas, etapa O.S cinza depois de informada, PDF da ação com "· —" sem laboratório. Pergunta aberta ao Elias: corrigir numa v0.6.10.1.

# v0.6.12 · Qualidade › Treinamentos (13/11/2026, Sonnet 5.5 · alto)
Primeira versão do módulo de treinamentos (plano de integração v2, ITEM 7; sugestão 4). Independente do Vértice e do Sabiá: o resumo do Sabiá entra por arquivo (.json do Contrato EFD v1) até a ponte da v0.6.11.

## O que entrou
- **Aba Qualidade › Treinamentos** (`src/treino.js`, `src/treino.css`, prefixo `tr`). Coleção **`sv2_treinos`**, um documento por treinamento, no formato `EFD.treino` do contrato (título, data, instrutor, horas, local, participantes com presença/eficácia/% do quiz, situação programado|realizado|cancelado, origem efcwork|sabia, quiz {app, sessaoId, cod, pct}, docs POP/material, observação).
- Tabela padrão (agrupada em Programados, Realizados, Cancelados; colunas Data, Treinamento, Instrutor, Presentes, Horas, Eficácia %, Origem, Situação). Resumo no cabeçalho: programados, realizados no ano com horas, "N sem registro" (programado com data passada).
- **Novo treinamento** (Líder ★ e Administrador): título, data, duração, instrutor (lista com os usuários), local, situação (programado | já realizado), participantes (um nome por linha, repetidos entram uma vez), POP e material vindos de Impressos, observação. Data futura não vale para "já realizado".
- **Registrar realização / Presença e eficácia**: cada pessoa tem "Presente" e Eficácia (a avaliar | Eficaz | Não eficaz); dá para adicionar nome na hora; ausente fica sem eficácia. Eficácia do treinamento = eficazes ÷ avaliados entre os presentes.
- **Lista de presença pronta** (sugestão 4): A4 em pé, com o nome da empresa (da configuração), título, data, duração, instrutor, local, os nomes, linhas em branco até 15 e a assinatura do instrutor. Qualquer usuário imprime. Botão só com o ícone da impressora.
- **Cancelar** (lixeira no alto, motivo obrigatório): nada se apaga; fica Cancelado com motivo, data e quem cancelou.
- **Importar do Sabiá**: lê .json (um objeto, uma lista ou `{treinos:[…]}`), valida com `EFD.treino`; **teste/ensaio fica de fora**; a mesma sessão do Sabiá (`quiz.sessaoId`) não duplica; resumo "N importados · N já estava aqui · N de teste ficaram de fora · N com dados errados".
- Aviso no sino ao instrutor que tem conta (programado por outra pessoa); busca geral acha pelo título, instrutor, local ou nome de participante; auditoria de criar, editar, realizar, presença, cancelar, importar e imprimir lista.
- **Colaborador** vê a tabela e imprime a lista; não vê Novo, Importar, editar, registrar nem cancelar.
- Ajuste geral: a aba aberta é levada para dentro da faixa de abas (no celular, a quinta aba ficava escondida).

## Decisões de desenho
- Aba nova em vez de tela separada: o plano diz "Qualidade › Treinamentos". Layout igual ao padrão (tabela + gaveta + formulário em gaveta), sem 5 modelos porque nada é novo no desenho.
- Treinamento vindo do Sabiá pode ser editado (instrutor, horas, lista): o quiz fica como registro. Cada edição vai para a auditoria.
- `docs` do contrato aceita pop, material, lista e registro; a tela usa só POP e material por enquanto.
- Programado que aparece no Sabiá do mesmo aparelho depende da caixa de troca (v0.6.11).

## Testes
`t_v0612.js` 52 ok. Suíte completa: 41 arquivos, **1.702 ok, 0 falhas** (docs/suite-v0.6.12.log). `t_v010` (4 abas na Qualidade) e a base do `t_html_seg` (188 nomes) atualizados. Auditoria visual 1280/390, Claro/Escuro: sem rolagem lateral, botões 36/44 px, 5 tamanhos de letra, 0 erros; folha da lista de presença conferida em PDF A4. Defeito achado e corrigido: no celular o rodapé da gaveta quebrava em duas linhas (botão "Lista de presença" virou só o ícone da impressora).

## Firebase
Coleção nova `sv2_treinos`: ler = usuário ativo; criar/alterar = Líder ★ ou Principal (com os ajudantes testeNovo/testeMuda); nunca apagar. Bloco no arquivo `regras-firestore-EFCwork-v0.6.12.txt` e em REGRAS-FIREBASE-EFCwork.md.

## Pendências
Corrigir os 6 "não" do Grok (v0.6.10.1?), ponte automática com o Sabiá (v0.6.11), treinamentos programados aparecerem no Sabiá, quiz/% por participante vindo da ponte. Próxima etapa: v0.6.13 só depois do Vértice Ponte 2; v0.7 Qualidade (itens 44, 49, 23, 25, 29, 30) quando ele mandar.

## Respostas da v0.6.12 e publicação (13/11 08:47)
"Firebase publicado" (regras completas com sv2_treinos) e "pode publicar essa versão também": v0.6.12 publicada (commit 77ddcae; sha do index.html conferido). O ITEM 11 (6 correções do Grok numa v0.6.10.1) ficou sem resposta.

# v0.6.14 · Movimento (13/11/2026, Opus 5.5 · alto) — proposta, app ainda não mudou
Pedido (09:43): atualizar o app com as skills novas taste-skill, transitions-dev e react-bits-guia, "quero o melhor". Respostas (10:22): Opus 5.5 alto; taste-skill só na tela de entrar; revisar as skills de "sem cara de IA" e auditoria para valerem em sistemas, nos projetos atuais e futuros; sugestões A, B e C aprovadas.
- Análise: transitions-dev serve (60 animações soltas, 18 durações de 0,14 s a 26 s, 12 curvas); react-bits só como referência (o app não é React; nada instalado, efeito refeito em CSS/JS); taste-skill não serve nas telas de dentro, só no "modo sistema" da tela de entrar.
- **A (aprovado, pronto):** tools/visual/efc-movimento.css + efc-movimento.js — escala única (40/80/150/250/350/400/500 ms por uso; curvas suave, entra-e-sai, saída, salto leve) e receitas adaptadas (t-dropdown, t-modal + t-fundo, t-gaveta, t-folha, t-toast, t-abas-linha, t-acc, t-icon-swap, t-shake, t-subtle-number, t-success-check), todas com movimento reduzido. Arquivo comum da família, mesma regra do Contrato EFD.
- **B (aprovado, pronto):** tools/auditoria/medir.js + efcwork.json — parte CSS (durações fora da escala, animação sem fim, transition:all, arquivo sem movimento reduzido, hex fora dos tokens; exceção marcada com mov:ok) e parte app (14 telas × 1280/390 × Claro/Escuro: rolagem lateral, botões abaixo do mínimo, tamanhos de letra, emoji, console, animação infinita rodando, lado a lado desalinhado); agrupa achados repetidos; --json, --estrito. Resultado no EFCwork v0.6.12: 3 defeitos (atividade.css, contagem.css, programacao.css sem movimento reduzido), 10 decisões (animações sem fim), 59 durações fora da escala, 47 cores escritas direto; 0 rolagem, emoji ou erro.
- **C (aprovado, feito):** o artefato "Design System" vazio da conta virou "EFC · Família EFClaudian": tokens de cor (Claro/Escuro), letras, medidas, cantos, sombras e movimento; README com as regras do Elias; 7 peças com prévia (Botão, Lista retrátil, Pílula, Tabela, Gaveta, Aviso, Caixa de número) e capa.
- Revisão das 4 skills proposta em cartões: auditoria-visual-efc (medidor, movimento, regras novas, referência ao sistema visual), transitions-dev (seção da família com a tabela peça → classe → ritmo), taste-skill (modo sistema para telas de abertura), react-bits-guia (regras da família).
- Página aprovacao-efcwork-v0.6.14-movimento.html: 18 itens com demonstrações vivas (antes/depois/opções; "Ver de novo"). Opções em aberto: gaveta 400/350 ou 250/150 (ITEM 2), aviso um por vez ou pilha compacta (5), visto no "salvo" (9), números sem efeito / discreto / contagem React Bits (10), tela de entrar 1/2/3 (14). Observação: a blusa lilás da ilustração padrão e o brilho violeta do tema escuro contrariam a taste-skill; não mexidos.
- 13/11 11:58 — Elias: quer o sistema "com fluidez e com efeitos no login tipo as sugestões do React Bits", e aceita alguns efeitos dentro do app. Resposta: página efeitos-efcwork-v0.6.14.html com 6 modelos completos da tela de entrar (efeitos do React Bits refeitos sem React: 1 Aurora dourada + Blur Text; 2 Campo de pontos/linhas de plantio + Split Text; 3 Seda + Shiny Text; 4 Pólen + Blur Text; 5 Curvas de nível + Split Text; 6 Raios de luz + Text Type), WebGL/canvas puro, param fora da tela e na aba escondida, respeitam movimento reduzido, versão lisa se o aparelho não tiver WebGL; e cardápio de 9 efeitos para o app com "Quero no app": Spotlight Card, Glare Hover, Count Up, Click Spark, Animated List, Blur Text no título, Magnet, Gradual Blur, troca de tela fluida. Ele escolhe 1 modelo e marca os efeitos; a página anterior (v0.6.14 Movimento) continua valendo para a escala.

## Respostas "Efeitos e fluidez" (13/11 13:06)
Tela de entrar: MODELO 4 · Pólen, "com a foto da menina anexada, perfeito" (= manter a foto/ilustração atual com o pólen). Dentro do app: QUERO Click Spark, Animated List, Blur Text no título, Gradual Blur e troca de tela fluida; NÃO Spotlight Card, Glare Hover, Count Up e Magnet. 13:18: pediu, no final, todas as skills num zip.

# v0.6.14 · Movimento (construída 13/11/2026, Opus 5.5 · alto) — não publicada
- **Escala comum no app:** montar.py carrega `movimento` primeiro (DE_FORA js + novo DE_FORA_CSS → tools/visual/efc-movimento.*). Todas as durações do app trocadas pelo token do mesmo uso (casca, calibração, sino, contagem, atividade, programação, tabela, entrar); "movimento reduzido" acrescentado em atividade.css, contagem.css e programacao.css; reflexo do botão dourado marcado `mov:ok`.
- **src/fluidez.js + fluidez.css (prefixo fz, último módulo):** avisos um por vez (o anterior sai por baixo), visto que se desenha no sucesso, faíscas (Click Spark) só quando a ação veio do botão dourado e deu certo (até 2,5 s), confirmação com t-fundo/t-modal, lista retrátil abre crescendo e a cópia que fecha encolhe (cópia fixa no corpo, sem ações, sobrevive ao redesenho), tremida no erro (lcErro), lista do sino em sequência (GV_DEPOIS), desfoque no fim da gaveta e do menu do celular (fz-mais), troca de tela (conteúdo desliza 12 px na direção da aba, traço da aba desliza da anterior, título letra por letra saindo do desfoque só ao trocar de área; redesenho por dado não anima; gvAnim corta o lado durante a troca), ícone do tema entra no lugar; avisos no celular acima da barra de baixo (84 px).
- **Gaveta:** abre 400 / fecha 350 com desfoque leve (tabela.css + tabela.js lendo Mov.ms). Menu da coluna cresce do cabeçalho; folha do celular sobe em 400 ms.
- **Tela de entrar (Modelo 4 · Pólen):** canvas `.en-polen` (partículas douradas em profundidade, acompanham o mouse; param ao entrar, com a aba escondida e em movimento reduzido — um quadro só), linha `.en-diz` ("Coletas, inspeções, documentos e almoxarifado num lugar só.") palavra por palavra (Claro: no alto à esquerda; Escuro: caixa embaixo à esquerda; celular: embaixo da foto), palavra grande sem parallax e saindo do desfoque, faixa parada (uma vez cada área; escondida no celular junto com o 3º cartão), brilhos da foto e luz passam uma vez, cartões sem boiar.
- **Correção junto:** Treinamentos — as listas retráteis de POP, Material e Eficácia não atualizavam o botão (agora redesenham).
- **Escolhas sem resposta (ITEM 8 da página):** gaveta OPÇÃO 1, avisos OPÇÃO 1, salvo com visto; números sem efeito.
- **Testes:** t_v0614.js 47 ok; suíte 42 arquivos, 1.749 ok, 0 falhas (docs/suite-v0.6.14.log). Ajustes de tempo nos testes antigos: t_v010 (menu 450 ms), t_v048 (folha 500 ms), t_v042 (faixa sem repetição). t_html_seg base 189 nomes. Medidor (docs/medidor-v0.6.14.txt/.json): 0 defeitos, 0 decisões; sobram ajustes de cor (47 cores escritas direto, outra versão) e botões de 32 px do PC.
- **Auditoria visual:** 1440/390, Claro/Escuro; defeitos achados e corrigidos: aviso cobria o rodapé da gaveta no celular; linha do app em cima da faixa e do 3º cartão no celular; borda dos avisos do sino sumia (fill backwards).
- Firebase: nada muda.

## Respostas da v0.6.14 (13/11 13:53) e publicação
ITENS 1 a 10 aprovados. ITEM 1: "sem o nome qualidade cortando o rosto, fica por trás — não precisa de autorização, pode seguir"; ITEM 2: "nome qualidade igual ao anterior" (mesma regra no celular). Feito: a palavra grande do tema Escuro fica só atrás da foto (sem a camada da frente), preenchida com o dourado; t_v042 atualizado (palavra só atrás). Publicada com essa autorização.

## v0.6.14.1 — correções da Caixa do Grok (13/11/2026 14:02)
Pedido: "Pode publicar e iniciar a parte 2" (o pacote de correções que eu tinha chamado de v0.6.10.1; usei o número v0.6.14.1 para não parecer que o app voltou de versão). A v0.6.14 já estava publicada. Modelo: Sonnet 5.5 · alto.
Origem: caixa do Grok v0.6.1 a v0.6.10 (165 itens, 6 "não"). Cada "não" virou um teste novo em tools/testes/t_v06141.js (27 conferências).
- v0.6.1 1.3 — traço da lateral do cartão do apontamento só em Grave e Urgente (tirei o âmbar da Média). apont.css.
- v0.6.1 3.4 — rodapé do detalhe do apontamento: decisão do Elias OPÇÃO B (14/11): os 4 botões numa linha só no PC, com o botão chamado "Gravidade" (dica e leitor de tela dizem "Mudar gravidade"); letra 13 px e margem interna de 4 px no PC para caber "Não procede"; no celular continuam 2 por linha, 44 px, letra 14 px. t_v061 aceita linhas iguais.
- v0.6.1 9.2 — busca a partir de outra tela: faltava `S._gvNav = true` antes de `ir()`; o detalhe não abria. Corrigido em Apontamentos e também (mesmo defeito) em Análise de problemas, Auditoria (NC) e Treinamentos.
- v0.6.4 3.1 e 3.2 — foto grande logo depois de enviar: o app guardava a imagem no aparelho mas não as marcas (`S._apFotoDoc`, `S._clFotoDoc`). Agora guarda também (Apontamento antes e depois, Cloro).
- v0.6.5 1.4 — bebedouro novo no rodízio: o projeto "Rodízio dos bebedouros" guarda uma lista fixa de pontos. Bebedouro cadastrado pelo EFCwork ganha `rodizioAuto: true` e entra no rodízio se for ativo e mais novo que o último salvamento do projeto (`atualizadoEm`, agora gravado quando o projeto é salvo aqui). Entre os nunca coletados, o novo vem primeiro. Bebedouros antigos fora do projeto continuam fora. Limite: se o líder tirar o ponto pelo EFClaudian (que não grava `atualizadoEm`), ele volta; tirar pelo EFCwork vale.
- Observações: Áreas › Coletas sem a frase "lançar coleta nova ... seguem no EFClaudian"; PDF da ação sem "· —" quando não há laboratório.
- Não mexi: etapa "O.S" cinza (é a gota enchendo, acende em ~1 s; conferido com 4 s de espera). Ficam para depois: "Lançar" em data futura depois de remarcada/confirmada (v0.6.7), Anterior/Próxima com 36 px no celular (v0.6.2), etapa 2 com "próxima etapa" em resolvido com encarregado não avisado (v0.6.1 3.2).
- Suíte: 41 arquivos de teste + contratos (94 e 13), 1.834 conferências, 0 falhas (docs/suite-v0.6.14.1.log). Medidor: 0 defeitos, 0 decisões (docs/medidor-v0.6.14.1.txt).
- Firebase: nada muda nas regras. Dados novos: campo `rodizioAuto` em sv2_bebs (criado) e `atualizadoEm` em sv2_aguaproj (salvar projeto). Conferir que as regras aceitam esses campos (as regras publicadas não restringem campos nessas coleções).
- Página de aprovação: docs/aprovacao-efcwork-v0.6.14.1.html (6 itens; o ITEM 2 tem OPÇÃO A/B).

## Respostas da v0.6.14.1 (14/11 23:48)
ITENS 1, 3, 4, 5 e 6 aprovados; ITEM 2: OPÇÃO B (uma linha, botão "Gravidade"). Aplicado e suíte repetida inteira (0 falhas). Sem pedido de publicar nessa mensagem: **não publicado**, aguardando "pode publicar".
Pedidos novos: (1) ZIP com todos os roteiros do Grok; (2) pedir ao Grok um mapa de fluidez do app de cima a baixo (ROTEIRO-GROK-MAPA-DE-FLUIDEZ.md): ele aponta onde falta movimento (muitas abas sem), eu só confirmo e depois implemento.

## Respostas e pedidos de 14/11/2026 06:52 (Elias)
**Página v0.6.14.1:** ITENS 1, 3, 4, 5, 6 aprovados; **ITEM 2: OPÇÃO A** (4 botões em duas linhas de dois, texto "Mudar gravidade" inteiro). Ele tinha respondido OPÇÃO B na noite anterior; vale a última resposta (A). O código atual (opção B) precisa voltar para A. **v0.6.14.1 ainda não publicada.**
**Caixa do Grok (v0.6.9 a v0.6.14.1 e fluidez):** 4 "não": (1) v0.6.14 item 2: no celular, na tela de entrar, a linha "Qualidade da fazenda / Coletas, inspeções…" cobre 72 px da parte de baixo da foto; (2) lista retrátil não encolhe ao fechar (cópia escondida na hora); (3) pólen da entrada não para (decisão dele: manter ou parar); (4) **v0.6.14.1 item 1: no tema Escuro nenhum cartão tem o traço colorido** (Claro certo; a borda do tema escuro vence a regra do traço). Observações: rodízio mostra "quinzenal, terça · 08:00" com "Próxima: qui 19/11"; "Ver o PDF"/Imprimir sem leitor de PDF abre aba nova e baixa junto (v0.6.9); sem roteiro da v0.6.11 e v0.6.13. Mapa de fluidez do Grok: 51 linhas (ver docs/CAIXA-DO-GROK-2026-11-14-…md).
**PDF "Propostas de fluidez e organização" (Grok, 29 páginas, nada aplicado ao app):** P1 cabeçalho compacto de altura fixa (68 px PC / 114 px celular); P2 grade de campos 34 px PC / 44 px celular; P3 suavização igual de 150 ms nos 28 de 32 tipos tocáveis (inclui cartões de número e calibração do Escuro, que hoje não mudam ao passar o mouse); P4 régua de cantos (4, 6, 8, 12 px); P5 lista retrátil e menu da coluna fechando em 150 ms; P6 busca do alto abre 250/fecha 150; P7 Apontamentos (filtro 450 ms, cartão novo 400 ms, troca no detalhe 250 ms); P8 foto grande e editor abrem 250/fecham 150; P9 encurtar o que passa de 600 ms (título 450, brilho da gota 484, sino 450). Os arquivos CSS/JS das propostas (pasta css/) **não vieram anexados**, só o PDF. Ele ainda não aprovou/reprovou cada proposta.
**Pedidos novos:**
1. Bug do menu da coluna: ao tirar todas as marcas, não consegue marcar os itens do fim da lista. Sugestão dele (print): **remover as setas ‹ ›** (mover coluna) e **levar "Limpar esta coluna" para cima** (na área de Ordenar).
2. Auditoria de fluidez em todo o app (onde o filtro/lista troca seco): implementar o mapa do Grok depois da confirmação.
3. **Solicitações (Almoxarifado):** a coluna "Itens" (texto comprido) sai da tabela; os itens só aparecem na janela (gaveta), para padronizar a tabela.
4. Deixar o app "o máximo moderno e bonito, todo moderno, fazer o melhor"; ele ainda tem o **Fable** (modelo) para usar.


## v0.6.14.2 — correções da revisão de 14/11 (Sonnet 5.5 · alto)
Respostas do Elias à v0.6.14.1: ITEM 2 = **OPÇÃO A** (final); ITEMs 1, 3 a 6 aprovados. Pedidos do mesmo dia: bug do menu da coluna, auditoria de fluidez, Solicitações sem texto de itens na tabela, app "o máximo moderno e bonito". Plano: **T1** = esta versão (correções); **T2** = Opus 5.5 · alto, auditoria de fluidez e as 9 propostas do Grok (v0.6.15); **T3** = Fable 5.2 · máximo, modernização com pesquisa de modelos na internet e 5+ modelos completos para aprovação.

### O que mudou
- **Rodapé do apontamento = OPÇÃO A** (4 botões em duas linhas de dois, texto "Mudar gravidade" inteiro; celular 44 px). Traço vermelho de Grave/Urgente também no tema Escuro.
- **Menu da coluna** (`tabela.js`/`tabela.css`): havia duas áreas rolando uma dentro da outra (`.tb-mn-corpo` e `.tb-mn-l`); depois de tirar todas as marcas, o último item ficava coberto. Agora o corpo é uma coluna flex e só a lista rola (mín. 96 px, máx. 260 px; folha do celular sem máximo). Saíram as setas esquerda/direita e o rodapé; "Limpar esta coluna" subiu para o cabeçalho do grupo Ordenar (28 px no PC, 44 px no toque). Mover coluna: arrastar o cabeçalho no PC; **no celular não há mais como mover** (as setas eram o único meio) — registrado para decisão.
- **Solicitações** (`almox.js`): a coluna Itens passou a ser a contagem (`tipo:'num'`); o texto dos itens fica só na gaveta; a busca continua achando pelo nome do item.
- **Tela de entrar no celular** (`entrar.css`): a frase "Coletas, inspeções…" ficou no alto, texto simples, sem caixa; a foto e os cartões desceram 28–44 px. Antes cobria 72 px da foto.
- **Lista retrátil** (`fluidez.js`): a cópia que anima o encolher era escondida pela própria função original; agora entra depois dela. Efeito colateral encontrado pela suíte (t_v032): a cópia contava como "lista aberta" e o Esc fechava só ela; os dois manipuladores de Esc (`tabela.js`, `atividade.js`) agora ignoram `.dd-fant`.
- **Pólen** (`entrar.js`): para depois de 10 s sem o ponteiro mexer e volta ao mexer (nada se mexe para sempre).
- **Rodízio** (`agua.js`): quando a próxima coleta é remarcada, o cartão diz "(remarcada, o normal seria terça 17/11)"; explica a diferença "terça" x "qui 19/11" que o Grok viu.
- Versão `0.6.14.2`.

### Conferência
- `t_v06142.js`: **33 verificações, 0 falhas** (linha do celular, pólen parando e voltando, menu PC e celular, cópia da lista visível, Solicitações, rodapé A, traço no Escuro).
- Suíte completa: 42 arquivos de teste + contrato (94) + ponte (13), 0 falhas (`suite-v0.6.14.2.log`). Medidor visual: 0 defeitos, 0 decisões, 57 ajustes (os mesmos da v0.6.14.1: cores escritas direto e 8 tamanhos de letra).

### Varredura 2, parte B do Grok (recebida 14/11 07:36, sobre a v0.6.14.1) — vai para a próxima versão
11 achados (1 alta, 6 médias, 4 baixas). Tempos de abrir aba todos dentro da meta (≤ 100 ms; 4x mais lento ≤ 3x). Lista completa para o plano da v0.6.15: **D1** Atividade lê no máximo 1000 registros (`limit:1000`; backup tem 3251), gráfico zera dias cheios (alta); **D2** sino: contador 5, lista mostra 4 não lidas (lista só tem os 40 mais recentes); **D3** 36 de 40 avisos do sino não abrem nada (aprovação, tarefa, relatório semanal); **D4** Histórico: Observação de 327 letras alarga a tabela a 3261 px; **D5** Programação no celular: cartão do plano com 404–408 px numa faixa de 358; **D6** plano FOLHA mostra 5 de 24 (21%) e o backup tem 6 (25%): JD08 reprogramado pelo rodízio após a coleta de 20/10 (regra a confirmar); **D7** busca no celular: "Esc" não fecha, placeholder corta; **D8** contraste do texto secundário 3,41–3,69 no Claro e 4,20–4,49 no Escuro, número do sino no Escuro 2,54 (meta 4,5); **D9** "1 impressos"; **D10** foto que não carrega mostra texto cortado; **D11** toques pequenos (ⓘ 22 px; "Buscar talhão" 42 px no celular). Observações: campos das gavetas 40 px no PC (decisão fala 34); ordem do Apresentar; Pareto inclui "Outro"; nome repetido na Atividade; rótulo "De A a Z" em coluna numérica; coluna Prazo vazia; busca não acha plano de coleta.
Também chegaram da IA do Vértice Docs (v0.6.18, Pontes 1 e 2): LEIA-ME, PROGRESSO, ESTADO, MEMORIA e ZIP de integração — ficam para a v0.6.11/v0.6.13 (aguardam o Elias publicar o Vértice).

### Firebase (o que o Elias confere)
Sem campo novo nesta versão. Seguem valendo: `rodizioAuto` em `sv2_bebs` e `atualizadoEm` em `sv2_aguaproj` gravando sem erro depois de publicada a v0.6.14.1/2.

### Pedido do Elias para a próxima versão (07:36)
Varredura do sistema inteiro, melhorar **todos os botões de interação e o layout** ("bonitão e fluido"), com o melhor modelo, buscando modelos na internet. Juntar: auditoria de fluidez (mapa + 9 propostas do Grok), D1–D11 acima e a modernização (T2/T3).

### Respostas da v0.6.14.2 (14/11 08:17) e publicação
ITEMs 1 a 4 aprovados. ITEM 1 com melhoria pedida (print): **tirar as linhas divisórias** do menu da coluna (abaixo do cabeçalho, entre Ordenar, Filtros prontos e Filtrar) e **otimizar os espaços** para a parte Filtrar não ficar fora da tela. Feito: sem bordas no cabeçalho e nos grupos, espaçamentos menores, "Ordem padrão", "Filtros prontos" e busca com 34 px no PC (44 no celular). O menu ficou 61 px mais baixo: em 1366×768 a lista mostra 157 px (antes 96), em 1280×720 mostra 109 px (antes 55, só um item). Teste novo em t_v06142 (sem divisórias). "Pode publicar e iniciar a próxima etapa" → v0.6.14.2 publicada (leva junto a v0.6.14.1).


## v0.6.15 — varredura de botões, campos e movimento (Opus 5.5 · alto) — EM ANDAMENTO
Pedido do Elias (14/11 07:36 e 08:17): "varredura do sistema na próxima versão, melhorar todos os botões de interação e layout para ficar bonitão e fluido, buscar modelos na internet". Ordem combinada: modelos primeiro; enquanto ele escolhe, os defeitos claros da Varredura 2B do Grok; depois o modelo aprovado no app inteiro com as propostas de fluidez do Grok (P1–P9).

### Referências pesquisadas (14/11)
Linear (redesenho de 2026: menos separadores, navegação mais apagada, cinza mais quente); Vercel Web Interface Guidelines (foco visível, alvo de toque 24/44 px, animar só transform/opacity, nunca "transition: all", sombra de duas camadas); NN/g, estados de botão (passar 150–200 ms, aperto 100–150 ms, foco com contorno); Attio (linhas de 36 px, uma ação principal por decisão, painel lateral plano); Material 3 (camada de estado).

### Modelos (aplicados ao app de verdade, `tools/visual/modelos-v0615/`)
`comum.css` (todos: resposta em 150 ms ease-out, aperto .98, sem movimento sozinho, "reduzir movimento" desliga) + `m1.css` Refinado (régua de cantos 4/6/8/12, campos 36 px, cabeçalho mais baixo, contorno que esquenta para o dourado), `m2.css` Plano e denso (Linear: sem borda, fundo que escurece, 32 px, abas em pastilha, linhas de 36 px), `m3.css` Tátil tonal (Material 3: secundário em dourado claro, campo preenchido com linha que acende, cartões sobem 2 px), `m4.css` Contorno nítido (Vercel: linhas finas, sombra de duas camadas, cantos 6, grade fina na tabela), `m5.css` Editorial (título maior com traço que cresce, ações como texto com sublinhado que desliza, campos só com a linha de baixo). Montagem: `python3 tools/visual/modelos-v0615/montar-modelos.py` → `docs/modelos-efcwork-v0.6.15.html` (o app inteiro, sempre em demonstração, entra sozinho como "Joana Silva" com dados inventados; botões Hoje · 1–5 no canto). Página: `docs/aprovacao-efcwork-v0.6.15-modelos.html` (ITEM 1 modelo, ITEM 2 contraste D8, ITEM 3 regra do rodízio D6).
Correção (14/11 08:41, Elias): na prévia do app o arquivo dava "SecurityError replaceState" e "Error: sdk" (não entrava na demonstração e tentava o Firebase). Agora a demonstração é forçada no próprio arquivo de modelos e o envio de formulário funciona mesmo na prévia sem permissão de formulário (vira evento só da página). Conferido num quadro "srcdoc" com e sem allow-same-origin.

### Defeitos corrigidos (Varredura 2B)
- **D1 Atividade**: lia `{order:'ts', limit:1000}`. Agora lê pelo período escolhido (`desde` = no mínimo 30 dias, por causa do gráfico, com 1 dia de folga pelo fuso; "Todo o período" sem `desde`), teto de 50.000 com aviso "só os 50.000 mais recentes". Troca de período refaz a escuta. Firestore: `where ts >= … orderBy ts desc` no mesmo campo, não pede índice novo.
- **Nome repetido na Atividade** ("José José Elias…"): o resumo que já começa com o nome não repete (`atResumoTx`).
- **D2 sino**: a lista mostra todos os não lidos + os 40 mais recentes, com "Mostrar mais".
- **D3 sino**: cada tipo de aviso leva à sua tela (apontamento, treinamento, análise, RNC, coleta, envio, água, rodízio, cloro, histórico, impressos, contagem, solicitações); aprovação, tarefa e relatório (EFClaudian) abrem o detalhe dentro do sino com o texto, de quem e quando, e "Abrir no EFClaudian".
- **D4 texto longo**: coluna de texto com valor acima de 60 letras corta com "…" (320 px PC, 220 celular) e mostra inteiro ao parar o mouse; vale para todas as tabelas (opção `longo` também disponível).
- **D5 plano no celular**: cada cartão cabe na largura (100vw − 32 px, máx. 380) e a faixa encaixa um cartão por vez.
- **D7 busca no celular**: X de 44 px que fecha de verdade (no PC continua a dica "Esc"); texto igual ao do topo, "Buscar documento, material, coleta…".
- **D9 singular**: unidade da tabela vai para o singular quando o número é 1 ("1 impresso", "1 item ativo", "1 ponto de água"), na barra, no menu da coluna, no total e na impressão.
- **D10 foto que não carrega**: vira espaço neutro (sem o ícone quebrado e sem texto cortado), no app inteiro.
- **D11 toques**: legenda (i) da Programação com 28 px sem empurrar o título (margem −3 px; com 28 px "puro" a linha quebrava com a gaveta aberta, pego pelo t_v045); busca da lista de escolha não encolhe mais (44 px no celular).
- **Pontos** (Programação) passou a ordenar como número.
- Para decisão do Elias (página): **D8** contraste do cinza (#8d846c → #746c55 no Claro; #80796a → #948c7c no Escuro; número do sino com letra escura no Escuro) e **D6** regra do rodízio (JD08).
- Ficam anotados (sem mexer): Pareto inclui "Outro" no corte de 80%; coluna Prazo da Programação vazia (o dado não vem preenchido); busca não acha plano de coleta nem erro de digitação ("desemcapado"); ordem do Apresentar da Auditoria; campos das gavetas com 40 px no PC (decisão fala 34) — entra com o modelo escolhido.

### Testes
`t_v0615.js`: 27 verificações, 0 falhas (Atividade com 3.200 registros; sino com 45 avisos; Histórico com observação de 364 letras; singular; foto quebrada; busca e plano no celular). Suíte completa: 43 arquivos + contrato (94) + ponte (13), 0 falhas depois de dois ajustes: `t_html_seg` (base aceita +1 `EFCLAUDIAN_URL`, constante, e `n.origem`, que já passa por `esc()`), `t_v045` (legenda 28 px sem mudar o lugar).

### Firebase (o que conferir depois de publicar)
A Atividade agora consulta `sv2_audit` com `where('ts','>=',…)` + `orderBy('ts','desc')`: conferir no console que não aparece pedido de índice (é o mesmo campo, não deve pedir). Ao escolher "Todo o período", a leitura é de todos os registros (custo de leitura proporcional ao total).

### Retorno do Elias (14/11 09:04–09:06)
"Como eu vou responder isso? Deveria ser fracionado"; "não gostei dessas sugestões"; "tá tudo bugado, não acesso as páginas"; "suas sugestões foram péssimas"; "faz ela fracionada, passa não passa, aprova reprova". Regra nova: página de aprovação de desenho sempre em partes pequenas, uma mudança por item, com Passa/Não passa.
- Bug do arquivo de modelos na prévia: os links das abas e do menu (href="#/…") levavam para fora do quadro da prévia. Agora o próprio arquivo troca a tela sem sair (conferido: Coletas, Água, Inspeções, Apontamentos, Documentos, Qualidade, Início).
- A página "modelos inteiros" (aprovacao-efcwork-v0.6.15-modelos.html) foi substituída por **aprovacao-efcwork-v0.6.15-partes.html**: 9 mudanças de desenho (contorno dourado no botão secundário; botões de ícone sem contorno; botão dourado sobe 1 px; botões afundam ao apertar; campos 36 px no PC com foco dourado; cabeçalho mais baixo; traço cinza nas abas; tabela de 36 px; menu lateral mais calmo), mais o contraste do cinza e a regra do rodízio. Cada mudança é um pedaço de CSS independente (`tools/visual/fracoes-v0615/fracoes.css`, classes f1…f11), então só entra o que passar. Os 5 modelos inteiros ficam descartados.

### Respostas por partes (14/11 09:28) e aplicação
ITEMs 1 a 10 **Passa**. Comentários: ITEM 8 "gostei muito da sugestão de tabela com as linhas das colunas" → linhas finas entre as colunas em todas as tabelas; ITEM 9 "ícones Sabiá e Vértice não devem perder contraste, poderiam ter destaque melhor" → os dois ficam com contraste cheio, moldura própria, ícone de 24 px e letra forte. ITEM 11 sem opção, com a regra: "a coleta deve ser feita apenas uma vez por rodízio, a não ser que seja descartada ou aconteça algum problema que necessite eu solicitar uma nova coleta". Pedido: "poderia ter feito animado em HTML" → próximas páginas de movimento em HTML animado.
Aplicado no app (src): botões (base.css: contorno dourado ao passar, ícone sem caixinha, dourado sobe 1 px, aperto 98%); token `--campo` (36 px PC, 44 toque) nos campos e listas lado a lado (lanca, inspecoes, agua, treino, .cp); anel dourado no foco; cabeçalho 26 px e espaços menores (casca.css); traço cinza nas abas; `--row` 36 px só no PC; menu lateral calmo com os apps da família em destaque; linhas entre colunas (tabela.css); `--tx3` #746c55 (Claro) e #948c7c (Escuro), número do sino no Escuro com letra escura. "Total" centrado na caixa no celular.
Rodízio: conferido nos dados do backup de 08/11 — a JD08 tinha coleta em 20/10, mas uma nova coleta foi pedida em 06/11 (motivo "Outro", sem aprovação) e programada para 09/11; pela regra do Elias a de 20/10 deixa de contar (o app já fazia isso). Agora a área com nova coleta pedida mostra a marca de refazer e, no título, quem pediu, quando, o motivo e quem aprovou. Pergunta aberta: nova coleta precisa da aprovação do Líder/Principal? (página de fluidez, ITEM 3).
Testes ajustados ao padrão novo: t_v0410 (listas 34/36 px), t_v061 (mede o rodapé sem o mouse sobre o dourado). t_v0615 ganhou as conferências dos itens aprovados e da marca de nova coleta (34 verificações). Suíte: 0 falhas. Medidor: 0 defeitos, 57 ajustes (os mesmos).
Página nova: **aprovacao-efcwork-v0.6.15-fluidez.html** (HTML animado, Passa/Não passa): 1 linhas entre colunas, 2 destaque Vértice/Sabiá, 3 marca de nova coleta + OPÇÃO A/B (aprovação), 4 lista e menu da coluna fecham com efeito (P5), 5 busca abre/fecha suave (P6), 6 cartões dos apontamentos em sequência (P7), 7 foto grande suave (P8), 8 título mais rápido, gota e sino (P9).

### Conversa nova (14/11/2026 10:09) — respostas por partes recebidas de novo
Abertura da conversa com o CONTINUAR, este dossiê, o ZIP em andamento e o texto das respostas por partes (as mesmas de 09:28): ITENS 1 a 10 **Passa**; ITEM 8 com "gostei muito da tabela com as linhas das colunas"; ITEM 9 com "Sabiá e Vértice não devem perder contraste, poderiam ter um destaque melhor"; ITEM 11 sem opção, com a regra do rodízio ("a coleta deve ser feita apenas uma vez por rodízio, a não ser que seja descartada ou aconteça algum problema que necessite eu solicitar uma nova coleta").
Conferido no ZIP: tudo isso já está aplicado (`--campo` 36/44 px, `--tx3` novo nos dois temas, linhas entre colunas, destaque dos apps da família, marca de nova coleta no rodízio). Nada mudou no app. `VERSAO` continua 0.6.14.2 no código (v0.6.15 não numerada nem publicada).
Segue valendo: publicar só com "pode publicar"; modelos inteiros e página animada de fluidez descartados; próxima tarefa (modernização com referências reais em imagem, página por partes com Aprovado/Reprovado e o app de verdade) só depois do "pode iniciar" com o modelo e esforço sugeridos.
Checklist (14/11 10:1x): **Fable 5.2 · esforço máximo** escolhido para a modernização (T3). Pergunta do rodízio respondida: **nova coleta pedida no rodízio PRECISA da aprovação do Líder/Principal** (a coleta original continua contando até a aprovação). Ainda não implementado: entra na v0.6.15 junto com o resto. Aguardando ele trocar o modelo e dizer "pode iniciar".

## Modernização por partes — página nova (14/11/2026, 10:13 em diante · Fable 5.2 · esforço máximo) — o app NÃO mudou
"Pode iniciar" às 10:13, depois da checklist (Fable 5.2 · esforço máximo; nova coleta do rodízio **precisa** da aprovação do Líder/Principal).
`src/` não foi tocado: `VERSAO` continua 0.6.14.2 e o `dist/` é o mesmo do pacote. Tudo o que é proposta mora em `tools/visual/moderno-v0615/` e só entra no app depois do "Aprovado" de cada item.

### Referências pesquisadas (14/11)
- Linear, renovação de março/2026 (linear.app/now/behind-the-latest-design-refresh e linear.app/changelog/2026-03-12-ui-refresh): interface mais calma, menos bordas, o que não é ação fica apagado. Também linear.app/now/how-we-redesigned-the-linear-ui (cabeçalho, abas e painéis com menos ruído) e linear.app/docs/peek (setas percorrem a lista com a prévia aberta).
- Vercel: Geist Status Dot (vercel.com/geist/status-dot), Geist Tooltip (vercel.com/geist/tooltip), Web Interface Guidelines (vercel.com/design/guidelines: dica com espera só na primeira, sombra em camadas) e a nova navegação do painel de 26/02/2026 (vercel.com/changelog/dashboard-navigation-redesign-rollout).
- GitHub Primer, abas com contador (primer.style/product/components/underline-nav).
- Material Design 3, barra de navegação com indicador em pastilha (m3.material.io/components/navigation-bar/overview).
- Nielsen Norman Group, telas vazias (nngroup.com/articles/empty-state-interface-design).
- Atlassian Design, movimento: saída mais rápida que a entrada (atlassian.design/foundations/motion).
- Paleta de comandos: saasui.design/blog/saas-search-command-palette-ux-patterns. Google Agenda, visão Programação (support.google.com/calendar/answer/6101541).
**Limite avisado ao Elias:** as imagens das referências foram mostradas na conversa (busca de imagens). Dentro da página vão como link: o visualizador não carrega imagem de outro site e eu não copio print de outros produtos para dentro de arquivo.

### As 15 propostas (uma classe por item: `mo1` … `mo15` no `<html>`; sem classe o app fica igual)
Arquivos: `moderno.css`, `moderno.js`, `montar-proposta.py` (gera `dist-proposta/index.html` = dist + propostas; não vai no pacote, é só rodar). `moLiga([n…])` liga e desliga.
1. Início: lista "Pede atenção" com todas as áreas (calibração vencida/a vencer, materiais, solicitações, laudos atrasados, amostras não enviadas, pendências de água, apontamentos urgentes/NC vencida/em aberto, tarefas vencidas) no lugar das 4 caixas do Almoxarifado e de "Áreas do EFCwork · em construção".
2. Início: quadro "Próximas coletas" (7 dias; `S.prog` + rodízio, só pendentes).
3. Caminho da tela na barra de cima; busca compacta à direita (só PC).
4. Busca vira paleta de comandos: grupo "Ações" (10 ações + trocar tema), "Ctrl K" no topo, abre 250 ms / fecha 150 ms (cobre a P6 do Grok).
5. Abas com contagem do que espera ação (Amostras não enviadas, Água pendências, Solicitações pendentes, Equipamentos calibração vencida, Apontamentos em aberto).
6. Celular: pastilha no item aberto da barra de baixo, deslizando 250 ms.
7. Situação na tabela com ponto + texto; cor cheia só no vermelho.
8. Tabela vazia: "Ainda não há …" ou "Nenhum resultado com o filtro atual" + quantos ficaram fora + "Limpar filtro" no meio; no celular fica centrado na tela.
9. Gaveta: anterior e próximo sem fechar (setas no alto; Alt + seta; a dica mostra "4 de 6"). Só para tabelas.
10. Dica desenhada nos botões de ícone (0,45 s na primeira, 60 ms nas vizinhas), só PC.
11. Botão dourado com sombra nítida em duas camadas, sem o brilho borrado (degradê e reflexo aprovados continuam).
12. Menu da coluna some com efeito, 150 ms (P5).
13. Apontamentos: cartões em sequência ao trocar o filtro, 40 ms entre eles, 250 ms cada (P7).
14. Foto grande abre 250 ms e fecha 150 ms (P8).
15. Título da tela em ~450 ms no total (P9).
Fora desta página (fila): esqueleto de carregamento; regra do rodízio com aprovação; brilho da gota e sino da P9 (só o título entrou).

### Página de aprovação
`docs/aprovacao-efcwork-v0.6.15-moderno.html` (≈3,8 MB, arquivo único). Padrão do Elias: ITEM com número grande, **Aprovado/Reprovado** + comentário em cada um, imagem que amplia ao clicar (e alterna HOJE/PROPOSTA no mesmo lugar), "Copiar respostas" (em cima e no fim; respostas guardadas no aparelho).
- **HOJE × PROPOSTA do app de verdade**: 90 imagens tiradas do próprio app em demonstração (PC 1280 e celular 390), com as fontes do app (Fraunces e Source Sans 3 instaladas localmente para o print).
- **Movimento**: quadros congelados (0, 50, 100, 150 ms…) do app de verdade, HOJE em cima e PROPOSTA embaixo.
- **"Ver funcionando no app"**: o EFCwork inteiro abre dentro da página (um por vez), entra como "Joana Silva", com dados inventados, liga HOJE/PROPOSTA na hora, repete o movimento ("Ver de novo"), PC/Celular e Tela cheia. Nada é gravado (a demonstração roda só na memória da página).
- Como refazer: `tools/visual/moderno-v0615/pagina/` → `captura.js` (prints e quadros) e `monta-pagina.js` (junta tudo; `monta-app.js` prepara o app que vai dentro).

### Defeitos achados no caminho
- **Meu:** o script que renumerou as propostas apagou os "@" do CSS (`@media`, `@keyframes`); as animações e a pastilha sumiram nas primeiras capturas. Achado olhando os prints, corrigido e tudo recapturado antes da página.
- **Do app publicado (pequeno):** no celular, o aviso "Nada encontrado." de tabela vazia sai cortado à direita (fica no meio da tabela larga, não da tela). O ITEM 8 corrige; se ele for reprovado, corrijo só esse corte.

### Decisões que tomei (para o Elias confirmar pelos comentários)
- Com as setas no alto da gaveta, um título comprido pode passar para duas linhas.
- Contagem nas abas só do que espera uma ação (não é o total de registros).
- Na lista "Pede atenção" as 4 caixas do Almoxarifado saem, porque os mesmos números entram na lista.

### Conferência
- Suíte completa rodada de novo (o `src/` é o mesmo): **43 arquivos, 0 falhas** (`docs/suite-v0.6.15-moderno.log`); contrato 94 ok; ponte 13 ok.
- Medidor da auditoria visual no app **com as 15 propostas ligadas** (`tools/visual/moderno-v0615/medidor-proposta.json`, saída em `docs/medidor-v0.6.15-moderno.txt/.json`): 14 telas × 1280/390 × Claro/Escuro → **0 defeitos, 0 decisões**, 11 ajustes (3 são falso alarme: o medidor lê o seletor `#fed-v` como cor; o resto são os tamanhos de letra que já existiam). Na primeira passada ele achou 1 defeito meu: o botão "Programação" do quadro Próximas coletas tinha 28 px; passou para a altura padrão (36 PC / 44 toque). Também igualei os tamanhos de letra novos aos que o app já usa (12 e 18 px).
- Página: aberta no PC (1280) e no celular (390), sem rolagem para o lado e sem erro; imagem ampliada alterna HOJE/PROPOSTA; "Copiar respostas" conferido (texto no formato "ITEM n Aprovado — comentário [título]"); respostas voltam ao recarregar.
- "Ver funcionando no app": os 15 itens abertos um por um **dentro de um quadro isolado** (como o visualizador faz), em HOJE e PROPOSTA, 0 erros. Não testado daqui: o visualizador de verdade do Claude no aparelho do Elias; se o app não abrir lá, a página avisa em 20 s e as imagens e os quadros mostram a mesma coisa.

### Aguardando
Respostas dos 15 itens. Depois: aplicar no `src/` só o aprovado, com teste de cada um (t_v0615), rodar a suíte, e só então numerar a v0.6.15. Publicar só com "pode publicar".
Pendências que continuam: regra do rodízio com aprovação do Líder/Principal (respondida, falta construir); esqueleto de carregamento; resto da P9 (gota e sino); ITENS 6 a 9 da varredura da v0.6.8; v0.6.11 e v0.6.13 (dependem do Vértice).

## Regra do rodízio: nova coleta só vale com a aprovação do Líder ★ ou do Principal (14/11/2026 11:51 · Opus 5.5 · alto)
"Pode continuar" às 11:51, já no Opus 5.5 (o modelo que sugeri para a próxima etapa). Como as respostas da página de modernização ainda não tinham chegado, fiz o que já estava decidido e não depende delas: a regra do rodízio (respondida na checklist das 10:1x).

### Como estava
- No EFCwork, o Líder ★ e o Principal já liberavam direto e os outros pediam (o pedido só vale depois de confirmado em `sv2_aprov`).
- **O furo vinha do EFClaudian:** lá o secundário sem ★ libera direto (caso da JD08: Giovane, 06/11, motivo "Outro", sem aprovação). O EFCwork aceitava essa liberação e a coleta de 20/10 deixava de contar.

### O que mudou (src/)
- `programacao.js`: `rzLibSit(l)` = valida | pendente | recusada. Vale se tem `aprovadoPor`, se foi gravada com `porSup: true`, ou se quem liberou (`porId`, ou o nome em `por` procurado em `S.users`) é Líder ★/Principal. Senão fica **pendente**: `rzLib`/`rzLiberada` não a enxergam, então a coleta já feita continua contando e lançar outra é barrado com "ainda espera a aprovação do Líder ★ ou do Principal. Até lá vale a coleta de DD/MM/AAAA". `recusadaEm` = recusada (não vale, fica no histórico). Sem a lista de usuários (não dá para conferir), vale como antes.
- Cartão do plano na Programação: marca de relógio tracejada na área pendente; ao parar o mouse, quem pediu, quando, o motivo e que espera aprovação.
- `plano.js`: a área pendente ganha a marca de espera na página do plano; Ajustes › Recoletas mostra cada pendente num quadro com o motivo, quem pediu, quando e "até lá vale a coleta de …", com **Recusar** e **Aprovar** (só para Líder ★ e Principal; o colaborador vê o quadro sem os botões). Recusar pede o motivo (mínimo 3 letras). Recusadas aparecem na tabela com "recusada: motivo" e "recusada por …".
- Gravação nova: liberação direta grava também `porId` e `porSup`; aprovar grava `aprovadoPor`, `aprovadoPorId`, `aprovadoEm`; recusar grava `recusadaPor`, `recusadaPorId`, `recusadaEm`, `recusaMotivo`. Nada é apagado. Registro de atividade: `aprovar_recoleta_rodizio` / `recusar_recoleta_rodizio`. Quem pediu recebe aviso no sino.
- `sino.js`: para Líder ★ e Principal, grupo "Novas coletas para aprovar · N" com Recusar/Aprovar ali mesmo; entra no número do sino.
- Defeito achado na conferência e corrigido: no cartão estreito (gaveta aberta), Recusar e Aprovar saíam da borda; agora são dois iguais que encolhem com o cartão.

### Testes
`t_v0615r.js` (novo): 26 ok — pendente × válida × recusada, barrar com o texto da espera, marcas na Programação e no plano, os 2 pendentes em Ajustes, botões na mesma linha e altura (PC) e 44 px com a mesma largura (celular), aprovar no sino (grava quem e quando, baixa o número, avisa quem pediu, registro de atividade), recusar no plano (sem motivo não recusa; depois some dos pendentes e vai para o histórico), liberação direta do Principal com `porId`/`porSup`, colaborador sem botões e sem o grupo no sino. `t_html_seg`: base regravada (nome novo `lp.length`, número).

### Firebase (o que conferir)
Nenhuma coleção nova. Em `sv2_rodizio`, o Líder ★/Principal passa a gravar dentro de `liberadas[período][área]` os campos `aprovadoPor/Id/Em` e `recusadaPor/Id/Em/recusaMotivo`; a liberação direta grava `porId` e `porSup`. As regras de hoje já deixam o Líder ★ atualizar `sv2_rodizio` (é o mesmo update das recoletas).

### Pendência no EFClaudian (não está no meu pacote)
Para os dois apps ficarem iguais: no EFClaudian o secundário sem ★ deve **pedir** a recoleta (como no EFCwork) em vez de liberar direto, e ele deve ler `recusadaEm` (hoje ele trataria uma liberação recusada como válida) e o pendente. Até lá, o EFClaudian continua contando a liberação pendente como válida; o EFCwork não.
Suíte completa depois da mudança: **44 arquivos, 0 falhas** (`docs/suite-v0.6.15-rodizio.log`); contrato 94 ok; ponte 13 ok. Depois do ajuste dos botões no cartão estreito: `t_v0615r` 26 ok e `t_html_seg` sem falhas de novo; telas conferidas no PC (com e sem a gaveta do sino aberta) e no celular.
A página de modernização não mudou (o app dentro dela é o de antes desta regra; a regra entra na página final da v0.6.15, antes do "pode publicar").

## "Não, vamos só para o Cwork, pode continuar" (14/11/2026 12:21 · Opus 5.5 · alto)
**Decisão do Elias:** nada no EFClaudian; fica só no EFCwork. (A versão curta do EFClaudian que sugeri fica descartada.) O EFCwork continua tratando a liberação feita lá por quem não é Líder ★/Principal como pendente até a aprovação, então a regra vale do lado do EFCwork mesmo assim.
Sem as respostas da página de modernização, segui com o que não depende delas.

### Corrigido no app (src/) — observações do Grok que estavam anotadas
- **Busca acha plano de coleta** (`programacao.js`, BG_FONTES): planos ativos pelo tipo, nome, ano, frequência ou uma área ("jd08"); tocar abre a página do plano. Plano desativado não aparece.
- **Busca aceita erro de digitação** (`busca.js`, `bgCasa`): cada palavra precisa estar no texto; se não estiver, vale uma parecida — 1 letra diferente a partir de 5 letras, 2 a partir de 8 (troca, falta ou sobra), também contra o começo de palavra maior. "desemcapado" acha "desencapados"; palavra curta com erro não acha. Vale para todas as fontes da busca.
- **Pareto** (`apont.js`, `apParetoDados`): "Outro" e "sem setor" vão sempre para o fim e nunca entram nos "poucos vitais"; o corte de 80% conta só as causas de verdade (a que cruza os 80% continua entrando, como antes); a barra usa o maior valor como 100% (antes era o primeiro). Referência: JMP, boa prática de deixar "Outro" como a última barra.
- Testes: `t_v0615b.js` 14 ok. `t_v061` (Pareto antigo) 60 ok.

### Propostas novas (tools/visual/moderno-v0615, classes mo16–mo18; não estão no src/)
- **mo16 · Esqueleto de carregamento:** `csOuve` conta as listas cuja 1ª leitura ainda não chegou; enquanto houver, tabela vazia mostra 6 linhas cinzas que pulsam (1 s, alternado; para quando os dados chegam), "Carregando…" no contador e no rodapé, total em branco. Hoje aparece "Nada encontrado." e "R$ 0,00" (engana; NN/g). `moSimulaCarga(ms, chave)` só para a demonstração.
- **mo17 · Gota:** brilho do líquido de 3 s (1,5 s × 2) para um só de 0,5 s.
- **mo18 · Sino:** sequência para no 6º aviso e cada um em 250 ms; conjunto em ~0,45 s (hoje ~1,06 s com 12).

### Página parte 2
`docs/aprovacao-efcwork-v0.6.15-moderno-parte2.html` (publicada como página; ≈1,7 MB), ITENS 16 a 21: 16 esqueleto, 17 gota, 18 sino (propostas) e 19 rodízio, 20 busca, 21 Pareto (já feitos: HOJE = pacote anterior, PROPOSTA = agora; "Ver funcionando" sem a chave HOJE, com o selo "Já está no app"). Para 17 e 18 os quadros parados não mostravam nada (brilho fino; o deslizar da gaveta escondia a sequência): no lugar, régua de tempo HOJE × PROPOSTA. O app dentro da página traz dados próprios (`semente-p2.js`: plano FOLHA com JD06/07/08, Giovane sem ★ e Marcos ★, apontamentos "Outro", 12 avisos).
Ferramentas generalizadas: `monta-pagina.js <itens-pN.js>` (parte 1 = `itens-p1.js`), `captura2.js` (precisa de `EFC_ANTES` = pasta da versão anterior).
Conferido: os 6 "Ver funcionando" abriram dentro de um quadro isolado, sem erro; sem rolagem lateral.
Suíte completa depois destas mudanças: **45 arquivos, 0 falhas** (`docs/suite-v0.6.15-busca.log`).

### Respostas da parte 2 (14/11 12:50)
- ITEM 16 (esqueleto) **Aprovado** — "perfeito".
- ITEM 17 (gota) **Aprovado** — comentário com pedido novo: "rolagem só fica para tabela com o cabeçalho para cima congelado" → só a tabela rola, com o cabeçalho dela parado no alto.
- ITEM 18 (sino) **Aprovado** — comentário com dois pedidos novos: (a) "o total de todas as tabelas pode ser igual às fontes '4 não enviadas 4 laudos atrasados' e fora de caixas, ocupando menos espaço"; (b) "a fluidez existe entre as janelas Coletas, Rateio, Inspeções, mas nas abas de dentro (Cloro, Apontamento, Auditoria) e em todas as outras janelas não existe" → efeito também ao trocar de aba dentro da área, em todas as áreas.
- ITENS 19 (rodízio), 20 (busca) e 21 (Pareto) **Aprovados** (já estavam no app).
Parte 1 (ITENS 1 a 15) ainda sem resposta.

### Aplicado no app depois das respostas da parte 2 (14/11 13:0x, Opus 5.5 · alto)
- **ITEM 16 · esqueleto** (`casca.js` `csOuve` conta a 1ª leitura de cada lista em `S._carga`; `tabela.js` `tbEsqueleto`, "Carregando…" no contador e no rodapé, total em branco; `tabela.css` pulso marcado `mov:ok`, para quando os dados chegam; lista que chega vazia continua dizendo "Nada encontrado.").
- **ITEM 17 · gota** (`calibracao.css`): um brilho de 0,5 s.
- **ITEM 18 · sino** (`fluidez.css`): sequência até o 6º aviso, 250 ms cada.
- As propostas 16–18 saíram de `moderno.js/.css` (ficou só `moSimulaCarga`, usando `S._carga`, para a demonstração).
- **Pedido no comentário do ITEM 17 · rolagem só na tabela, cabeçalho congelado** (`tabela.js` `tbAltura`, chamado junto com `tbAlinhaTot` e no resize): no PC (≥ 900 px) a tabela das telas (não as das gavetas) vai até o fim da janela, descontando tudo o que fica abaixo dela (rodapé "Mostrando…", rodapé do app), e rola por dentro; o `th` já era sticky. Se o topo da tabela estiver muito abaixo (sobra < 320 px), ela usa a altura da janela menos o topo do app. Celular: igual a antes.
- **Pedido no comentário do ITEM 18 · total sem caixas** (`tabela.css`): "Total" 13 px cinza e o valor 13 px em negrito, sem borda e sem fundo; mesmo lugar de antes.
- **Pedido no comentário do ITEM 18 · fluidez nas abas** (`fluidez.js`): o título entra letra por letra também ao trocar de aba (quando o texto do título muda), não só ao trocar de área. Redesenho sem troca não anima.
- Testes: `t_v0615c.js` 19 ok (esqueleto liga e desliga, lista vazia sem esqueleto, tabela cabe na janela e a página não rola, cabeçalho parado ao rolar, total sem borda/fundo e 13 px, gota e sino no CSS, título na troca Cloro → Apontamentos, celular sem altura própria). `t_html_seg`: base regravada (nome novo: largura fixa do esqueleto).
- Página **parte 3** (`docs/aprovacao-efcwork-v0.6.15-moderno-parte3.html`, publicada): ITENS 22 (rolagem/cabeçalho), 23 (total), 24 (fluidez nas abas), para ele conferir se entendi certo; HOJE = pacote anterior, PROPOSTA = agora.

### Defeito meu nas páginas, achado e corrigido
O app de demonstração dentro das páginas não recebia a semente extra (a troca de texto no `monta-app.js` não tinha pegado) e não abria rota de três partes (`coletas/plano/rz1`). Na parte 2, "Ver funcionando" dos itens 18, 19 e 21 abria sem os dados do exemplo (as fotos estavam certas). Corrigido, conferido por item dentro de um quadro isolado (18, 19, 21 e 22 com os dados certos) e as três páginas republicadas.
Conferência final: suíte completa **46 arquivos, 0 falhas** (`docs/suite-v0.6.15-parte2.log`); contrato 94 ok; ponte 13 ok; medidor visual no app: **0 defeitos, 0 decisões**, 57 ajustes (os mesmos de antes: cores escritas direto em blocos de impressão e tamanhos de letra) — `docs/medidor-v0.6.15-parte2.txt/.json`.
`VERSAO` continua 0.6.14.2 no código; nada publicado.

## Respostas da parte 1 e da parte 3 (14/11/2026 13:54)
"Até hoje esse acima foi o melhor, continua assim."
### Parte 1 (ITENS 1 a 15) — todos Aprovados
1 "Pede atenção" — perfeito. 2 Próximas coletas. 3 Caminho na barra de cima. 4 Paleta (Ctrl K) — **"precisa só suavizar a transição quando vai fazendo a filtragem"**. 5 Abas com contagem — perfeito; **pedidos:** (a) no Almoxarifado, fazer o efeito da linha do tempo (gota) na gaveta da direita que abre ao tocar no material; (b) remover "Mostrando 12 de 12" e "Cwork Quality · Fazenda Exemplo" e deixar a tabela descer até embaixo, em todas as tabelas; (c) de novo: tirar a rolagem das abas/página, só a tabela rola, do cabeçalho para cima congelado e sem se mexer. 6 Pastilha. 7 Ponto e texto — "amei, sem cara de IA". 8 Tabela vazia. 9 Anterior/próximo na gaveta — **"as letras com cores de notificação podem obedecer às regras de cores do item anterior (7), em todas as abas; reposicionar as setas e o X mais acima para não atrapalhar o texto e não quebrar o título"**. 10 Dica desenhada — perfeito; **pedido:** o campo do total some; a pílula "R$ 303,80 em estoque" passa a ser o número do valor e acompanha a filtragem (sem filtro fica como está; filtrado vira "total filtrado" ou nome condizente). 11 Sombra nítida — "vira um padrão". 12 Menu da coluna com efeito — perfeito; **pedido:** efeito também ao clicar no filtro de outra coluna. 13 Cartões em sequência — **"não está tão bonito esse efeito, e os quadrados têm umas cores nas bordas, padrão de app de IA; vamos fazer algo melhor"**. 14 Foto grande — top. 15 Título mais rápido — melhorou muito.
### Parte 3
22 Rolagem/cabeçalho — **Aprovado**, mas "ainda há rolagem no cabeçalho, só remover isso; não me interessa 'Mostrando 52 de 52 / Cwork Quality · Fazenda Exemplo'; descer a tabela para o fundo e a parte de cima estática, sem nenhuma interação de rolagem para cima e para baixo". 23 Total sem caixas — **Reprovado**: "faz o que eu pedi depois (o total na pílula do cabeçalho), tira esse número tosco, sobe os ícones de imprimir e os do lado para cima e reaproveita o espaço para a tabela; usa em todas as tabelas do app; os cabeçalhos devem ter as mesmas medidas para ficarem harmonizados". 24 Fluidez nas abas — **Aprovado**.

### Aplicado no app depois das respostas de 13:54 (14/11, Opus 5.5 · alto)
- **Parte 1 inteira ligada** (`src/moderno.js` + `src/moderno.css`, último módulo do `montar.py`), com os pedidos dos comentários:
  - ITEM 4: a caixa de resultados da paleta muda de altura suave e os resultados novos entram leve (sem pular). Texto do campo: "Buscar documento, material, coleta ou ação…" (começa igual ao topo).
  - ITEM 5a: gaveta do material (Almoxarifado) — "Últimas movimentações" virou a linha do tempo com a gota (`almox.js` usa `tlFluido`), da mais antiga para a mais nova; a gota corre até o que a pessoa ainda não viu.
  - ITEM 5b/22: sem "Mostrando X de Y" e sem o rodapé "Cwork Quality · Fazenda" (`.tb-pe` oculto, `.cs-rod` some). Mais linhas carregam sozinhas ao chegar no fim (`tbFimVigia`, sentinela "Carregando mais…"), sem botão; o redesenho não volta a tabela ao topo.
  - ITEM 5c/22: no PC, com uma tabela na tela, a página fica parada (`html.pag-fixa`) e a tabela desce até 16 px do fundo; só ela rola. Celular rola normal.
  - ITEM 7/9: pílula = bolinha + texto em todas as telas e gavetas; só o vermelho fica com caixa forte. Gaveta: setas e X na linha de cima, título com a largura toda.
  - ITEM 10/23: o total saiu da barra da tabela e virou o selo do cabeçalho (`tbSobe`): reaproveita a pílula que já tem o valor ("R$ 303,80 em estoque"); filtrando vira "R$ 231,38 · total filtrado" em dourado suave; enquanto carrega, não mostra. Classe do selo `tb-tp` (troquei de `tb-mt`, que já era o cadeado de coluna travada).
  - ITEM 23: imprimir/planilha/colunas na linha das abas (`.cs-abas-l`); cabeçalhos com a mesma medida (título 66 px, linha de pílulas 24 px) — abas em y = 156 em todas as telas.
  - ITEM 11: sombra nítida do botão dourado é o padrão. ITEM 12: trocando de coluna com o menu aberto, o menu desliza até a coluna nova. ITEM 13: refeito — os cartões deslizam até o lugar novo (FLIP), sem sequência, e sem o traço colorido na lateral.
- **Testes:** novo `t_v0615d.js` (20 ok). Atualizados para as decisões novas: `t_v020` (Início "Pede atenção"; total no selo), `t_v041`, `t_v0413` (reescrito: selo em 1024/1280/1366/1600/390), `t_v046` (caminho na barra de cima), `t_v048`, `t_v049`, `t_v050` (ícones na linha das abas), `t_v053`, `t_v06141` (Grave também sem traço), `t_v0615` (texto da busca), `t_v0615c` (tabela até o fundo, página não rola), `t_v068`. `t_html_seg` base regravada (199 nomes; os novos são números, rotas internas e HTML já escapado).

### Pacote do Vértice Docs (pedido de 13:55, entregue às 14:34)
`vertice-layout-v0.6.15.zip`: regras R1–R14 em português com "como conferir", texto pronto para a IA do Vértice, `efc-layout.css/.js` (peças portáteis, sem nada do EFCwork), `efc-movimento.css/.js`, `demo.html` (230 documentos de mentira; conferida: tela parada, 100 → 200 linhas, selo filtrado, ícones nas abas, gota, Alt + setas, zero erro), imagens antes (v0.6.14.2) / depois (v0.6.15), código real do EFCwork para consulta e referências. Nada no banco.
- **Conferência final (14/11, ~15h):** suíte completa **47 arquivos, 0 falhas** (`docs/suite-v0.6.15-final.log`); medidor **0 defeitos, 0 decisões**, 60 ajustes (os de sempre: cores direto em impressão/entrada e tamanhos de letra; o "#fed" de `moderno.css` é o seletor `#fed-v`, falso alarme) — `docs/medidor-v0.6.15-final.txt`.
- `VERSAO` continua 0.6.14.2; nada publicado. Próximo: auditoria visual e página de aprovação final da v0.6.15.

### Conferência visual e página final (14/11 ~15h, Opus 5.5 · alto, depois do "pode iniciar" de 14:57)
- **Auditoria visual** (1280 e 390, Claro e Escuro; Início, Amostras, Materiais, Movimentações, Apontamentos, Equipamentos e a gaveta do material): zero erro de JavaScript, nada rola de lado, até 7 tamanhos de letra por tela, tela parada só onde há uma tabela (PC). Prints em `tools/visual/moderno-v0615/pagina/out/aud/`.
  - **Defeito corrigido:** com a gaveta aberta, os ícones na linha das abas escondiam "Equipamentos". Agora (`tabela.js` `tbAperta`, no desenho e no resize): se as abas não cabem, a contagem sai e as abas apertam 3 px; se ainda não couber, os ícones descem para debaixo das abas (só enquanto a gaveta está aberta). Virou o ITEM 38 da página final.
  - **Defeito corrigido:** dentro do quadro da página de aprovação, as linhas não carregavam sozinhas (o vigia olhava a janela de fora). O vigia agora olha a própria tabela quando ela rola por dentro (`tbFimVigia` com `root` = a tabela, margem de 200 px). Mesma correção no `efc-layout.js` do pacote do Vértice (ZIP refeito).
  - **Decisão do Elias (não mexi):** no celular, nas telas com 3 botões no cabeçalho, o ícone de abrir em outra janela fica sozinho numa linha (já era assim na v0.6.14.2). Está em "Fica para depois" na página.
  - Botões de 22 px no PC são as setas de menu nos cabeçalhos das colunas (já eram assim).
- **Página final** `docs/aprovacao-efcwork-v0.6.15-final.html` (publicada: "EFCwork v0.6.15 · conferência final"): ITENS 25 a 38, um por pedido de 13:54. HOJE = pacote de hoje cedo; PROPOSTA = agora. "Ver funcionando" usa o app de agora (`EFC_APP=dist/index.html` no `monta-app.js`; o `moLiga` só é chamado se existir). Conferidos no quadro: 25, 27 (100 → 162 linhas), 28 (busca digitando), 30 (selo "R$ 101,42 · total filtrado"), 33 (gota), 36 (menu), 37, 38, sem erro.
  - Itens: 25 só a tabela rola · 26 sem "Mostrando"/rodapé · 27 mais linhas sozinhas · 28 busca suave · 29 total no selo · 30 total filtrado · 31 ícones na linha das abas · 32 cabeçalhos iguais · 33 gota na gaveta do material · 34 bolinha + texto em tudo · 35 setas e X acima do título · 36 menu desliza · 37 cartões deslizam e sem borda colorida · 38 gaveta aberta com abas inteiras.
  - Ferramentas novas: `captura4.js`, `itens-p4.js`, `semente-p4.js` (150 amostras a mais), `aud.js`/`aud2.js`.
- Testes depois das duas correções: `t_html_seg`, `t_v020`, `t_v041`, `t_v048`, `t_v049`, `t_v050`, `t_v053`, `t_v0615c`, `t_v0615d`, `t_v06142` — 0 falhas.
- Esperando as respostas dos ITENS 25 a 38. `VERSAO` continua 0.6.14.2; nada publicado.

### Respostas finais e publicação (14/11, 16:37; Sonnet 5.5)
- **Respostas da página final (ITENS 25 a 38): todos Aprovados**, sem comentário. "Pode publicar" às 16:37.
- `VERSAO` = **0.6.15** (cache do sw.js `efcwork-0.6.15`). Bateria completa **47 arquivos, 0 falhas** (`docs/suite-v0.6.15-final.log`); medidor `--estrito`: **0 defeitos, 0 decisões**, 60 ajustes de sempre (`docs/medidor-v0.6.15-final.txt`).
- **Publicado no GitHub:** EliasGrigori/efcwork, branch main, commit **bc42a4c** (app montado na raiz; código, testes e documentos em `projeto/`; pacote do Vértice em `projeto/docs/vertice-layout-v0.6.15/`). Prints antigos de testes que só mudaram por regeração não foram incluídos no commit (para não inflar). O site (eliasgrigori.github.io/efcwork) não pôde ser aberto da sessão: conferir no navegador que o rodapé mostra v0.6.15 (se mostrar a antiga, recarregar uma vez para o service worker trocar).
- Firebase: nada novo além dos campos dentro de `sv2_rodizio.liberadas` (aprovadoPor/Id/Em, recusadaPor/Id/Em, recusaMotivo, porId, porSup).
- Pendente de resposta dele: ícone de abrir em outra janela sozinho numa linha no celular (proposta para depois); ITENS 6–9 da v0.6.8, v0.6.11 (ponte com o Vértice) e v0.6.13 (preencher sozinho).

---
## Tarefa 1 · Regras do Firebase consolidadas (19:07, Sonnet 5.5 · médio)
- Pedido: ITEM 8 da varredura v0.6.8. Um documento só com tudo que conferir ou colar nas regras. Sem mudança no app.
- Entregue: `projeto/docs/REGRAS-FIREBASE-EFCwork-v0.6.15.md` (43 coleções levantadas do código, com estado Conferida/Trecho/EFClaudian/Interna; 5 trechos de regra; limites conhecidos; como verificar).
- Único campo novo desde as regras publicadas: `sv2_rodizio.liberadas.<pk>.<area>.{porId, porSup, aprovadoPor, aprovadoPorId, aprovadoEm, recusadaPor, recusadaPorId, recusadaEm, recusaMotivo}`, gravado só por Líder ★/Principal.
- Teste novo: `tools/testes/t_regras_cobertura.js` (toda coleção `sv2_*`/`efd_*` de src/*.js precisa estar na tabela do documento): 45 ok, 0 falha. Log em `docs/regras-cobertura-v0.6.15.log`.
- Limite: li só o código, não as regras publicadas (o arquivo `regras-firestore-EFCwork-v0.6.12.txt` não está neste ambiente). Para conferir linha a linha, o Elias cola as regras atuais.
- Não publicado no GitHub (aguarda "pode publicar").

---
## Tarefa 2 · Celular: ícones do cabeçalho (19:11, Sonnet 5.5 · médio)
- Problema reproduzido a 390 px: Almoxarifado › Materiais e Painel têm Contagem, Entrada, Saída (123/105/91 px, larguras diferentes) e o ícone "Abrir o EFClaudian" caía sozinho numa 2ª linha.
- Proposta aplicada no app (v0.6.15, NÃO publicada, aguarda aprovação dos ITENS 39 e 40):
  - ITEM 39: o ícone (classe `cs-ext` nos 5 links do EFClaudian: almox, agua, aguapj, coletas, programacao) sobe para o canto direito da linha do caminho, só no celular e só em cabeçalhos que o têm; 44 px de toque.
  - ITEM 40: a fileira de ações com 2+ botões de texto (sem ícone solto) divide a largura em partes iguais (114 px cada em 390 px); botão de texto grande demais ("Novo apontamento") passa para a linha de baixo; fileira com ícones soltos (Água) fica como estava. Em 360 px, se 3 botões não couberem iguais, a coluna cresce só o necessário (111/100/100), sem corte.
  - CSS no fim de `src/moderno.css` (`@media(max-width:899px)`). Aprendizados: `flex-basis:0` com padding diferente gera larguras diferentes (usar `flex:1 1 18px` com border-box); `min-width:max-content` evita corte.
- Medições a 390/360/700 px em 28 telas: sem corte e sem rolagem lateral.
- Página de aprovação: `docs/aprovacao-efcwork-v0.6.15-celular.html` (artefato "EFCwork v0.6.15 · celular: cabeçalho"), 2 itens, 3 pares de imagens cada (HOJE = v0.6.15 publicada × PROPOSTA), app de verdade em 390 px com "Ver funcionando". Referências: Material Design (barra de topo), Appian (botões Fill no celular), Mozilla Acorn.
- Testes: teste novo `tools/testes/t_v0615e.js` (14 ok); bateria completa 49 arquivos, 0 falhas; medidor `docs/medidor-v0.6.15-celular.txt`: 0 defeitos, 0 decisões, 23 ajustes (tamanhos de letra, já conhecidos).
- ZIP de proposta: `efcwork-v0.6.15-proposta-celular.zip` (para testar no celular; o ZIP publicado `efcwork-v0.6.15.zip` não mudou).
- Ferramentas novas: `tools/visual/celular-v0615/mede-cab.js`, `pagina/captura5.js`, `pagina/itens-p5.js` (monta com `EFC_APP=dist/index.html node monta-pagina.js itens-p5.js`; HOJE exige uma cópia do dist publicado em `dist/index-antes.html`).
- Pedido do Elias (19:08): "garantir o padrão e avisar quando iniciar nova conversa e mandar todos os dados" → CONTINUAR reescrito com padrão de trabalho e texto para colar; skill `efcwork-fluxo-de-trabalho` proposta (cartão); aviso de conversa nova combinado.

---
## Respostas do celular e publicação da v0.6.15.1 (14/11, 19:49)
- "Respostas EFCwork v0.6.15 · celular": ITEM 39 Aprovado; ITEM 40 Aprovado. "Pode publicar, pode continuar."
- Numerada **v0.6.15.1** (`VERSAO` em src/base.js; cache do sw `efcwork-0.6.15.1`). Conteúdo: ITENS 39 e 40 (celular) + documento de regras do Firebase (Tarefa 1) + testes t_v0615e.js e t_regras_cobertura.js.
- Testes finais: bateria 49 arquivos, 0 falhas (t_html_seg, t_v0615e 14 ok, t_v0615d 20 ok, t_regras_cobertura 45 ok rodados de novo após a numeração).
- Publicado no GitHub EliasGrigori/efcwork (main), commit 85ee2c6, com a autorização "pode publicar". ZIP: efcwork-v0.6.15.1.zip.

---
## Tarefa 4 · Treinamentos: revisão pelo uso (14/11, 20:02 a ~20:50, Sonnet 5.5 · alto)
- Usei o módulo da v0.6.12 com 12 treinamentos inventados (programados, um atrasado, realizados, cancelado, do Sabiá, um de teste) no PC (1280) e no celular (390). Dados em `tools/visual/treino-v0615/semente.js`; roteiros `explora.js`, `explora2.js`; PDF da lista impressa `imprime.js <id> <saida.pdf> [dist]`.
- Defeitos achados e corrigidos no app (v0.6.15.1 + ajustes, NÃO publicados, aguardam aprovação dos ITENS 41 a 49):
  - D1 (ITENS 41, 42): em 1280 px a lista cortava Situação e Origem à direita. `src/treino.js`: Treinamento com `longo:true` (máx. 320 px, 220 no celular), Situação na 3ª coluna, Origem escondida por padrão (`TB_OCULTAS_PADRAO['tr-lista']=['or']` em `src/tabela.js`; só vale quando `cw-tbcol-<id>` não existe no aparelho).
  - D2 (ITEM 43): programados saíam da data mais distante; agora grupo programado/realizado/cancelado, programados por data crescente (atrasado primeiro), demais do mais recente ao mais antigo.
  - D3 (ITEM 44): Eficácia em branco num realizado sem avaliados; agora "a avaliar" (`.tr-av`).
  - D4 (ITEM 49): lista de presença impressa com 21 a 25 linhas jogava as linhas finais e a assinatura na folha 2; nessa faixa a linha passa a 8 mm (`.tr-ap`), tudo na folha 1. Até 20 linhas não muda.
  - Defeito meu nas imagens: no celular "Não eficaz" quebrava em 2 linhas no seletor da presença; corrigido (dd 124 px, `white-space:nowrap`, fonte 15 px, padding menor). Teste novo confere que nenhum seletor corta ou quebra.
- Melhorias por uso:
  - ITEM 45: presença com uma linha por pessoa (49 px PC, 57 px celular; antes 83/≈115). Cabem 9 pessoas por tela no PC (antes 6) e 8 no celular (antes 6), com toque de 44 px.
  - ITEM 46: botões "Todos presentes" e "Todos eficazes" (`trTodos`, nada grava até Salvar).
  - ITEM 47: ícone de cópia no detalhe → `trRepetir(id)` abre "Novo treinamento" preenchido (título, horas, instrutor, local, documentos, participantes), data de hoje, Programado.
  - ITEM 48: nome de participante é botão (`tr-pessoa`); fecha o detalhe e filtra a lista pelo nome (a busca da lista já inclui participantes). Sem sublinho fixo; sublinha no hover no PC.
- Observado e NÃO alterado: no celular a tabela rola para o lado (comportamento global de tabelas); a data do campo nativo aparece mês/dia só no Chromium de teste; o PDF gerado pelo Playwright mostra uma folha 2 em branco (também antes da mudança; não investiguei a fundo, parece vir do gerador). Confirmar na primeira impressão real.
- Ícone novo `copia` em `ICS` (`src/base.js`). Sem campo novo no Firestore: `sv2_treinos` e o contrato EFD.treino ficam como estão (a cópia grava um documento novo com os mesmos campos de um treinamento comum).
- Testes: `tools/testes/t_v0615f.js` (novo, 27 ok, 0 falhas); bateria completa de 50 arquivos, 0 falhas; medidor `docs/medidor-v0.6.15-treinamentos.txt`: 0 defeitos, 0 decisões, 60 ajustes (mesmos de antes: cores soltas em CSS antigos e tamanhos de letra).
- Página de aprovação: `docs/aprovacao-efcwork-v0.6.15-treinamentos.html` (artefato "EFCwork v0.6.15 · Treinamentos: aprovação"), 9 itens (41 a 49), HOJE (v0.6.15.1 publicada) × PROPOSTA, app de verdade com os 12 treinamentos. Montagem: `captura6.js` (imagens em `out/img6`, renumeradas para `out/img6f` por um passo manual: copiar `i41-lista`→`i42-lista`, `i42-ordem`→`i43-ordem`, `i43-aval`→`i44-aval`, `i44-pres-*`→`i45-`/`i46-`, `i45-*`→`i47-`, `i46-*`→`i48-`, `i47-imp*`→`i49-imp*`) e `itens-p6.js`.
- ZIP de proposta: `efcwork-v0.6.15-proposta-treinamentos.zip` (index.html, sw.js, manifest, ícones; `VERSAO` ainda 0.6.15.1, será v0.6.15.2 depois da aprovação).
- Referências reais usadas na página: NN/g (tabelas de dados), UX World, MindSphere, GitHub Primer, IBM Carbon, Agriculture Design System, SAP Fiori (copiar objeto), 101 UX Principles (criar a partir do existente), Adobe Acrobat (lista de assinaturas).
- Não publicado no GitHub (aguarda respostas e "pode publicar").

---
## Respostas da página dos Treinamentos e v0.6.15.2 pronta (14/11, 20:54)
- "Respostas EFCwork v0.6.15 · Treinamentos": ITENS 41 a 48 **Aprovados**. ITEM 49 (lista de presença impressa com linhas de 8 mm) **Reprovado**: "lista do sabia, importo por fora" (a lista vem do Sabiá, importada; a impressão do app não entra nesse fluxo). Registrado: **não mexer na lista de presença impressa**.
- Removido do app: `trListaHTML` e `.tr-ap` voltaram ao que eram na v0.6.15.1 (diff zerado nessa função); asserções de impressão saíram do t_v0615f.js (agora 23 ok).
- Numerada **v0.6.15.2** (`VERSAO` em src/base.js; cache do sw `efcwork-0.6.15.2`). Conteúdo: ITENS 41 a 48.
- Testes: bateria 50 arquivos, 0 falhas; medidor `docs/medidor-v0.6.15.2.txt`: 0 defeitos, 0 decisões, 60 ajustes (os mesmos de antes). (O medidor da proposta, `medidor-v0.6.15-treinamentos.txt`, foi trocado por este.)
- ZIP: `efcwork-v0.6.15.2.zip` (index.html, sw.js, manifest, ícones). Firebase: sem campo novo.
- **NÃO publicado no GitHub** (aguarda "pode publicar"). Commit previsto: src/{base.js,tabela.js,treino.js,treino.css}, tools/testes/t_v0615f.js, tools/visual/treino-v0615/, pagina/{captura6,itens-p6}.js, docs/aprovacao-...-treinamentos.html, docs/medidor-v0.6.15.2.txt, docs/dossiê.

---
## Publicação da v0.6.15.2 (14/11, 21:28)
- "Pode publicar" recebido. Commit **a2a806d** em EliasGrigori/efcwork (main): "v0.6.15.2: Treinamentos revisados pelo uso (ITENS 41 a 48)". Arquivos: index.html, sw.js (raiz), projeto/src/{base,tabela,treino}.{js,css}, t_v0615f.js, ferramentas e página de aprovação dos Treinamentos, medidor-v0.6.15.2.txt.
- Falta ele conferir que o site no ar mostra v0.6.15.2 (a sessão não abre o site).

---
## ITENS 6 e 7 da varredura v0.6.8: limite de 3.000 e fotos vencidas (14/11, 21:34 a ~22:20, Opus 5.5 · alto)
- "Pode iniciar" às 21:34 (ele seguiu nesta conversa depois do aviso de conversa nova).
- Levantamento: `sv2_coletas` e `sv2_aguacol` eram lidas sem limite (`csOuve` sem `order/limit`). Pelas regras do Firebase, uma escuta desligada por mais de 30 minutos lê tudo de novo. Fotos da ação: `acFotoLimpar` só roda no aparelho do Líder ★/Administrador; até lá todos viam as fotos e o PDF saía com elas; o aviso "Fotos até" mostrava o próprio dia da eliminação.
- Feito no app (NÃO publicado; aguarda os ITENS 50 a 53):
  - ITEM 50: `coletas.js` `CO_LIM = 3000`, escuta `{ order: 'data', limit: 3000 }` (pela data da coleta; abaixo de 3.000 nada muda). `coTeto()`, `coTudo()` ("Carregar todas", lê tudo na sessão, `data-act="co-tudo"`). `coIdsSeguros(ops)`: com o teto ativo, toda amostra nova com data ≤ a mais antiga carregada é conferida no servidor (`get`) antes do lote; se o nº existir, vira `_2`, `_3`… Chamado antes de `Data.lote` em programacao.js (2 lugares) e plano.js.
  - ITEM 51: `agua.js` `AG_LIM = 3000`, mesma escuta pela data; `agTudo()` (`ag-tudo`). Água não precisa da conferência de nº (usa `add`).
  - Aviso na barra das tabelas (`tabela.js` `tbTetoHTML`, opção `teto:{n, act, de}` no `tbHTML`): "· só as mais recentes" + botão `.bt.lk` "Carregar todas"; quando a barra aperta no PC mostra "só as 3.000 mais recentes"; no celular o aviso fica na 1ª linha e "Carregar todas" + ícones na 2ª (`.tb-teto-q`). Tabelas: Amostras, Remessas, Coletas de água.
  - ITEM 52: `aguaac.js` `acFotosFora(a)` (eliminadas OU vencidas); passou o prazo, miniaturas, visualização e PDF param de mostrar as fotos para todos, com "N foto(s) vencida(s) em dd/mm"; depois da eliminação de vez "eliminada(s) em dd/mm". Eliminação de vez continua só no aparelho do Líder ★/Administrador.
  - ITEM 53: aviso "Fotos até" mostra vence − 1 dia (o último dia com foto).
  - Limitação dita na página: com o teto, os selos do topo (não enviadas, laudos atrasados, valor total), o Início e a Programação contam só as amostras carregadas. Uma amostra sem `data` deixaria de aparecer (o app sempre grava data).
- Testes: `tools/testes/t_v0615g.js` (novo, 20 ok: 3.010 amostras → 3.000 + aviso + Carregar todas; 40 → sem aviso; nº seguro; água 3.004 no celular com toque de 44 px; fotos vencidas para quem não é Líder; PDF sem fotos; "Fotos até"; eliminação de vez). Bateria 51 arquivos, 0 falhas (e 10 arquivos de tabela/coletas/água repetidos depois do último ajuste de CSS, 0 falhas). Medidor `docs/medidor-v0.6.15-limites.txt`: 0 defeitos, 60 ajustes (os mesmos).
- Página: `docs/aprovacao-efcwork-v0.6.15-limites-fotos.html` (artefato "EFCwork v0.6.15 · Limite de 3.000 e fotos vencidas: aprovação"), ITENS 50 a 53, HOJE = v0.6.15.2 publicada. Ferramentas: `tools/visual/limite-v0615/semente.js` (3.010 amostras, 3.004 coletas de água, 2 ações com fotos; grava pelo `Store` do app), `pagina/captura7.js`, `pagina/itens-p7.js`.
- Referências: Firebase (cobrança das leituras e regra dos 30 minutos), SAP (carregamento de tabelas com "carregar mais"), Maersk (botão carregar mais), Google Cloud TTL (o app deve conferir a data mesmo com eliminação automática).
- Ideia para depois (não feita): política TTL do Firestore em `sv2_agua_foto` para eliminar as fotos no servidor sem depender de alguém abrir o app; mudaria o formato (apaga o documento inteiro) e precisa combinar com o EFClaudian.
- ZIP de proposta: `efcwork-v0.6.15-proposta-limites.zip` (`VERSAO` ainda 0.6.15.2; vira 0.6.15.3 depois da aprovação).
- Firebase: sem campo novo. As consultas novas (`orderBy('data','desc').limit(3000)` em `sv2_coletas` e `sv2_aguacol`) usam índice de um campo, que o Firestore cria sozinho. As regras precisam permitir `list` com ordenação (já permitem leitura).

---
## Pedido 15/11 05:29 — comandos de fluidez para a outra conta
- Elias: "tá faltando fluidez na outra conta, o Claude tá ignorando esse detalhe; me passa os comandos necessários".
- Entregue `fluidez-comandos-efc.zip`: COMANDOS-FLUIDEZ-EFC.md (regra fixa: troca de área e de aba de dentro com deslize de 12 px + traço da aba + título do desfoque; gaveta 400/350; lista retrátil e menu da coluna que encolhem; confirmação; avisos um por vez com visto; filtro/busca/paleta suaves; lista em sequência; tremida no erro; desfoque no fim; ícone do tema; faíscas só no dourado; escala 40–500 ms, só transform/opacity/filter, sem "transition: all", sem infinito, movimento reduzido; efeitos recusados; como provar com lista de abas + teste Playwright + página com app vivo) + efc-movimento.css/.js + fluidez.js/.css como referência.

---
## Respostas "limite e fotos" e v0.6.15.3 pronta (15/11, 06:22)
- ITEM 50 **Aprovado** com ajuste: "Remove esse texto — '2998 amostras · só as mais recentes'; você quer colocar isso em tudo, não precisa disso". Feito: sem texto de aviso; quando passa do teto a barra mostra só o botão "Carregar todas" (título ao passar o mouse explica). Classes `.tb-teto`/`.tb-teto-n`/`.tb-teto-q` removidas. **Regra: não pôr textos de aviso/contagem extras nas barras das tabelas.**
- ITEM 51 **Aprovado** com ajuste: "pode descer para mil" → `AG_LIM = 1000` na Água (Coletas continua 3.000).
- ITENS 52 e 53 **Aprovados**.
- Numerada **v0.6.15.3**. t_v0615g.js ajustado (20 ok). Bateria 51 arquivos, 0 falhas. Medidor `docs/medidor-v0.6.15.3.txt`: 0 defeitos (o da proposta foi trocado por este). ZIP `efcwork-v0.6.15.3.zip`. Firebase: sem campo novo.
- **NÃO publicado** (aguarda "pode publicar").
- Pedido novo no mesmo recado: "creio que tem abas do Cwork que não estão portadas do Claudian" → próxima tarefa: comparar as abas do EFClaudian com as do EFCwork (precisa do EFClaudian atual).

## v0.6.15.3 publicada (15/11, 06:58)
- "Pode só publicar" do Elias. Commit **38604f0** em EliasGrigori/efcwork (main), em cima do a2a806d. Entrou: index.html, sw.js, projeto/src, página de aprovação, medidor, t_v0615g.js, limite-v0615, captura7/itens-p7. dist/ e pagina/out/ não são versionados.
- Pendente do lado dele: abrir o site e conferir que mostra v0.6.15.3 (a sessão não abre o site).
- Próxima tarefa proposta: Qualidade › Não conformidades e Bugs e sugestões (itens a partir do 54), Opus 5.5 · alto. Aguarda "pode iniciar".
- Conversa longa: hora de abrir conversa nova com ZIP, dossiê, CONTINUAR e texto para colar.

## Tarefa: Qualidade › Não conformidades e Bugs e sugestões (15/11, 07:01 → pronta; Opus 5.5 · alto)
- Pedido: "Pode iniciar" (07:01), na proposta de fazer as telas "must" do FALTA começando pelas duas abas da Qualidade que ainda mandavam para o EFClaudian.
- Leitura do EFClaudian (repositório EliasGrigori/efclaudian, v2.102.60, clonado só para ler; nada mudado lá): `viewNC`/`ncItens`/`ncRncSit`/`ncPessoaImprimir` (v2.102.41 a .50) e `viewBugs`/`openBugNovo`/`bugGravar`/`openBug`/`bugMudar`/`bugPDF` (v2.80 a v2.92).
- **Não conformidades (src/nc.js, prefixo nq):** tabela padrão que junta as NCs dos apontamentos (`a.nc`) e as das auditorias enviadas (`sv2_rnc`), em grupos Vencidas/Abertas/Fechadas. NC da auditoria fechada = RNC fechada ou retorno "Resolvida"; vencida = passou do prazo da RNC. Colunas: Prazo (vermelho quando vencido; "vencida há N dias" ao parar o mouse), Situação (+ retorno Parcial/Não resolvida), Origem (Apontamento ou "RNC 03 NC 05"), Local, Não conformidade, Gravidade, Responsável; escondidas: Corresponsáveis, Prioridade GUT, Tratamento. A linha abre a gaveta da origem por cima (apAbre / auNcAbre), sem duplicar ações. "Folha por pessoa" (A4 em pé, papel de cada NC, linha do ciente), como `ncPessoaImprimir`. apont.js e auditoria.js passaram a redesenhar também a aba Qualidade › NC. Nada se grava.
- **Bugs e sugestões (src/bugs.js, prefixo bs):** os mesmos dados do EFClaudian (`sv2_bugs` e `sv2_bugs_foto/{id}` com `temFoto`; se a regra da foto negar, a imagem vai dentro do relato, como lá). Tabela em grupos Em aberto/Resolvidos/Não procede; "Reportar problema" e "Sugerir melhoria" (no celular "Problema" e "Sugestão" para caber); janela em 3 passos com a parte do app vinda da tela anterior; imagem até 240 KB; o app anota versão ("EFCwork v…"), app ('efcwork', campo novo que o EFClaudian ignora), tela e aparelho; aviso no sino aos Administradores. Gaveta com descrição, imagem que amplia, dados e andamento em linha do tempo; só o Administrador muda a situação (Em análise, Não procede com motivo, Resolvido com versão, Reabrir), cada mudança é um passo novo (`push` em `hist`) e quem reportou é avisado. Relatório A4 deitado (ícone da impressora no cabeçalho) com os relatos da tabela, descrição, andamento e imagem. Sino abre o relato (refTipo 'bug'); busca acha relatos.
- casca.js (texto da Qualidade), areas.js (o que falta: Semana e Conversas), sino.js (refTipo bug), montar.py (módulos nc e bugs).
- Firebase: nenhuma coleção nova. `sv2_bugs` e `sv2_bugs_foto` já existem no EFClaudian (com regra); entraram na tabela do REGRAS-FIREBASE como "EFClaudian". Conferir só se aparecer "permissão negada" ao reportar ou ao mudar a situação.
- Testes: t_v0616.js 45 ok; bateria 52 arquivos 0 falhas; t_html_seg: base com +1 `pe` (HTML do rodapé, justificado); t_regras_cobertura 47 ok. Medidor (`docs/medidor-v0.6.16.txt`): 0 defeitos, 76 ajustes (16 a mais por causa das 4 telas novas no medidor e das cores de papel do relatório impresso, iguais às da Auditoria).
- Página de aprovação: `docs/aprovacao-efcwork-v0.6.16-qualidade.html`, ITENS 54 a 60 (54 tabela NC, 55 linha abre a gaveta, 56 folha por pessoa, 57 tabela Bugs, 58 reportar, 59 resposta do Administrador, 60 relatório para a IA), com app vivo e referências (ISO 9001 10.2, Ybug, Nolt). HOJE = v0.6.15.3 publicada.
- ZIP de proposta: `efcwork-v0.6.16-proposta-qualidade.zip` (VERSAO ainda 0.6.15.3; vira 0.6.16 depois da aprovação).
- FALTA-DO-EFCLAUDIAN.md e features.csv atualizados (as duas abas saíram da lista).

## Respostas da página v0.6.16 · Qualidade (15/11, 09:09) e v0.6.16 pronta
- ITENS 54, 55, 56, 59 e 60: **Aprovados** como estavam.
- ITEM 57: **Aprovado com ajuste**: "não procede e resolvidas ficam junto em ordem cronológica de data guardada como finalizado, aí esse finalizado é um botão que aparece só nessa aba, botão com ícone padrão o de imprimir e exportar". Aplicado: a tabela mostra só os relatos em aberto (sem grupos); botão-ícone **Finalizados** (ícone de visto, ao lado da impressora, só nesta aba) troca para a tabela dos resolvidos + não procede juntos, com a coluna "Finalizado em", da mais recente para a mais antiga (dá para inverter no menu da coluna); o botão fica marcado; Esc volta para os em aberto. Campo novo `finalizadoEm` gravado ao Resolver/Não proceder (apagado ao Reabrir); nos relatos antigos vale a data do passo que fechou. Nos Finalizados a coluna Data (envio) começa escondida, para caber sem rolar. O relatório imprime a tabela que está na tela (em aberto ou finalizados).
- ITEM 58: **Aprovado com ajuste**: "o botão de reportar e sugerir é para ser o mesmo". Aplicado: um botão só, **Reportar ou sugerir**; o tipo (Problema ou Sugestão) se escolhe dentro da janela (vem Problema).
- VERSAO = **0.6.16**. t_v0616.js 52 ok; bateria 52 arquivos 0 falhas; medidor 0 defeitos (76 ajustes). ZIP `efcwork-v0.6.16.zip`. Aguarda "pode publicar".
- Firebase: nada a configurar (sv2_bugs e sv2_bugs_foto já têm regra no EFClaudian; `finalizadoEm` é só um campo a mais no relato).

## v0.6.16 publicada (15/11, 09:48 a 10:05)
- "Pode publicar" do Elias (09:48). Antes de publicar chegou o ajuste (09:53): "Remove esses dois ícones … esse ícone para baixo, porém reduzido no tamanho e padrão dos botões ao lado". Feito: o topo da aba Bugs e sugestões fica só com **Reportar ou sugerir**; o ícone Finalizados (ok) vai para a barra da tabela, antes de Colunas, no mesmo tamanho dos outros três (gancho novo `antesIcones` em tbHTML); a impressora do topo saiu e a da barra chama o relatório com descrição e imagens (gancho novo `imprimir` em tbImprimir). Texto da tabela vazia: "botão ao lado de Colunas, na barra da tabela".
- Testes: t_v0616.js 53 ok (2 conferências novas: topo só com um botão; 4 ícones da barra com mesmo tamanho e linha); t_html_seg 20 ok; t_v0615g 34 ok; medidor sem defeito. A bateria completa de 52 arquivos rodou antes do ajuste; o ajuste só acrescentou dois ganchos opcionais em tabela.js.
- Commit **97c1d41** em EliasGrigori/efcwork (main), em cima do 38604f0. Entrou: index.html, sw.js, manifest, ícones, projeto/src, página de aprovação, medidor, t_v0616.js, semente qualidade-v0616, captura8/itens-p8/monta-pagina, REGRAS, efcwork.json, html-seg-base, montar.py.
- Firebase: nada a configurar (atenção a "permissão negada" em sv2_bugs).

## Pacote de continuação (15/11, 10h)
- Pedido do Elias: "manda todo material necessário para continuar e não ter o problema de não saber o que fazer". O CONTINUAR antigo tinha trechos velhos e confundiu a outra conversa. Refeito do zero: `CONTINUAR-EFCwork-v0.6.16.md` (autossuficiente: texto para colar, o que fazer ao começar, como conseguir e montar o código, padrão de trabalho, próximas tarefas em ordem, decisões em aberto, peças reaproveitáveis, Firebase, armadilhas), `TEXTO-PARA-COLAR.txt`, `FALTA-DO-EFCLAUDIAN.md` atualizado, `features.csv`, `efcwork-v0.6.16.zip` (app) e `efcwork-v0.6.16-fonte.zip` (código-fonte e ferramentas, 0,9 MB; montar.py gera um index.html idêntico ao publicado).
- O CONTINUAR e o dossiê novos não foram para o GitHub (a cópia em projeto/docs é a da v0.6.15); só vão com "pode publicar".

---
## Tarefa: Rateios (15/11, 10:22 → 12h; Opus 5.5 · alto, aplicação em Sonnet 5.5 · médio) — v0.6.17, PUBLICADA
- Conversa nova (10:20) com o pacote da v0.6.16. Modelo sugerido Opus 5.5 · alto; "PODE CONTINUAR" às 10:22 (já no Opus 5.5).
- Repositório: `add_repo` do EFCwork com `push` foi **negado pelo sistema de permissões** da sessão; trabalhei pelo ZIP de fonte (Caminho 2 do CONTINUAR; `montar.py` imprimiu "versão 0.6.16"). O EFClaudian foi lido por clone anônimo só de leitura (público, v2.102.60, commit b56739b); nada mudado lá. **Para publicar, o acesso de escrita ao EliasGrigori/efcwork precisa ser liberado de novo.**
- Os ícones não vêm no ZIP de fonte: copiados do `efcwork-v0.6.16.zip` para `projeto/src/estaticos/` (o `t_v069` precisa do icon-512.png).

### Lido no EFClaudian
`linhasRateio(kind)` (campo: sv2_coletas com envio, ou cancelada depois de enviada, sem `historica`; água: sv2_aguacol com envio ou cancelada; valor congelado ou o da análise; água × qtd), `viewRateio` (filtros tipo/ano/período/só pendentes; % do total filtrado desde a v2.102.10; marcar linhas ☐ e "Emitir solicitação (N)"), `openEmitir`/`emitirSolicitacao` (Nº ≥ 3, data de hoje sem retroativo, NF obrigatória, O.S das remessas sem O.S pedida ali e gravada em todas as amostras da remessa sem O.S; grava compra 'solicitado', pedidoSankhya, dataSolicitacao, solicitadoPor/Nome, nf; numSolicitacao na água; Audit `emitir_solicitacao` e `os_remessa`), `viewRateioCal`/`openRcEmitir`/`rcEmitirOk` (linha por item de sv2_alm_cal com valor > 0; unidade pelo local do equipamento; Filial em pausa; só `isSup`; grava itens[n].compra {numero, data, nf, porId, porNome, ts}), `viewPainelRateio` (painel de água e de campo; fica para Relatórios), `insResumoHTML` (insumo por amostra; fica para depois). Permissões: área por atribuição `rateios`; campo/água `podeLancar`; calibração `isSup`. Meu dia: "Amostras enviadas sem solicitação de compra" (atribuição Rateios + sup).

### O que entrou (src/rateio.js + rateio.css, prefixo rt; módulo depois de `plano` no montar.py)
- **Rateios numa tela só** (sem abas): Campo, Água e Calibração na mesma tabela; colunas Tipo, Área ou ponto, Data, Análise, Laboratório, Valor total, Rateio, Situação; O.S, Nº sol., NF, Valor, Quantidade, Trimestre, Cultura, Unidade, Solicitado por em Colunas (desligadas; `TB_OCULTAS_PADRAO['rt-lista']`). Cabe sem rolar de lado em 1280 e 1366 (em 1024 rola, como as outras tabelas).
- **Filtro = menu da coluna**: Tipo (lista de valores); Data com filtros prontos (este ano, T1–T4, S1–S2, ano passado); Situação com filtros prontos (só as pendentes, com solicitação, canceladas).
- **Rateio %** = valor da linha ÷ soma do que a tabela mostra (`tbFiltrar` antes de desenhar; canceladas fora). Total no selo do cabeçalho, "total filtrado" com filtro. Pílulas: amostras e calibrações sem solicitação (a mais antiga ao parar o mouse).
- **Emitir solicitação** (botão dourado; `LC_FORM.rtEmit`): 1 O que entra (Campo e água | Calibração; Todas (N) | Escolher quais, com busca, marcar no lugar sem a lista pular, soma e contagem atualizando), 2 Nº / data de hoje fixa / NF, 3 O.S das remessas sem O.S. Mesmos campos e registros de atividade do EFClaudian. Calibração: Filial em pausa (aviso), sem O.S.
- **Unidade sem nome fixo**: nome e cidade da Matriz/Filial vêm de `sv2_cfg/empresa.unid` (curto/nome/mun); o equipamento é da Filial quando o local tem a cidade da Filial (o EFClaudian usa o nome fixo da cidade; o t_v010 proíbe nomes da empresa no código).
- **A linha abre a gaveta da origem** (coAbre / agAbre / cbAbre).
- **Início › Pede atenção**: "amostras enviadas sem solicitação de compra" (atribuição Rateios + Líder ★/Principal); toque abre o Rateio só com as pendentes (`rt-ir`).
- **Busca geral** acha "Solicitação Nº" e abre o Rateio buscando por ela.
- **Permissões**: área `negada` sem a atribuição Rateios (some do menu, da busca, dos atalhos e do endereço); campo/água para quem lança; calibração só Líder ★/Principal. Quem tem Rateios sem Coletas/Almoxarifado carrega sv2_coletas (com o teto de 3.000), sv2_analises, sv2_alm_cal e sv2_alm_equip.
- **Correção junto (inicio.js)**: os atalhos "Voltar para" e "Mais usadas" mostravam telas sem permissão; agora somem (achado pelo teste).
- Outros: coletas.js, agua.js e calibracao.js redesenham também quando a área aberta é Rateios; casca.js (área sem `versao`, com `negada`); t_v010 passou a usar Relatórios como "área ainda não refeita"; efcwork.json do medidor com Rateios e a gaveta Emitir.

### Testes
- `tools/testes/t_v0617.js`: **42 ok** (tabela, filtros, rateio 100%, selo filtrado, Tipo = Calibração, gavetas da origem, emitir campo e água com todas as recusas, O.S na remessa, encerrada, calibração com Filial em pausa, busca, Início, colaborador, área some, celular alinhado e 44 px). Semente: `tools/visual/rateio-v0617/semente.js`.
- Bateria: **53 arquivos, 0 falhas** (4 lotes). `t_html_seg` sem nomes novos (números e booleano passam por esc()). `t_regras_cobertura` 47 ok (nenhuma coleção nova).
- Medidor `--estrito` (`docs/medidor-v0.6.17-rateios.txt`): **0 defeitos, 0 decisões**, 80 ajustes (os de sempre: tamanhos de letra; nenhum das telas novas).
- Auditoria visual (1280 e 390): sem rolagem de lado, sem erro; ajustes antes da página: rótulos de coluna encurtados, Análise/Área com reticências (168 px), O.S e Nº sol. em Colunas, "Todas (N)" no lugar de "Todas as N pendentes" (cortava), "Campo ·" na O.S das remessas de campo.

### Página de aprovação
`docs/aprovacao-efcwork-v0.6.17-rateios.html` (artefato "EFCwork v0.6.17 · Rateios"), ITENS 61 a 69: 61 tabela única, 62 filtro pelo menu da coluna, 63 rateio e total seguem o filtro, 64 Início, 65 gaveta em 3 partes, 66 escolher quais (decisão minha: dentro da gaveta, em vez da coluna ☐ na tabela do EFClaudian), 67 calibração e Filial em pausa, 68 linha abre a origem, 69 quem vê e quem emite + correção dos atalhos. HOJE = v0.6.16 publicada. App vivo conferido nos 9 itens (PC) e no celular. Ferramentas: `pagina/captura9.js`, `pagina/itens-p9.js`. Referências: Oracle JD Edwards (juntar linhas num pedido), Oracle PeopleSoft (total antes de enviar), Certinia (rateio por percentual).

### Firebase
Nada novo: as gravações são as mesmas do EFClaudian em sv2_coletas, sv2_aguacol (compra, pedidoSankhya, dataSolicitacao, solicitadoPor/Nome, nf, numSolicitacao, os) e sv2_alm_cal (itens[n].compra). Atenção: quem emite precisa poder fazer `update` nessas coleções (no EFClaudian a regra já deixa).

### Fica para depois
Painel do rateio → Relatórios › Rateio (próxima tarefa). Insumo por amostra (perguntado na página). 

### Respostas e aplicação (15/11, 11:36 → 12h)
- ITENS 61, 62, 64, 65, 66, 68 e 69 aprovados como estavam. **ITEM 67 sem resposta**: mantido (a Calibração entra na mesma gaveta, Filial em pausa), pois decorre do 65 e do 66. **ITEM 63 aprovado com pedido novo:** tirar o botão de limpar filtro de todas as páginas, porque ele limpa pelo próprio filtro.
- Feito: botão "Limpar filtro" removido das tabelas (`tabela.js`), de Atividade (`atividade.js`) e do aviso de tabela vazia (`moderno.js`); apagados `tbTemFiltroSolto`, `atTemFiltro`, os manipuladores `tb-limpa`/`at-limpa` e o CSS `.tb-limpa`; o texto do cadeado ("o Limpar filtro passa a valer") e um comentário em `treino.js` foram ajustados. "Limpar esta coluna" (menu da coluna) e os "Limpar" de seleção ficam.
- Um deslize no meio: tirei a aspa de fechamento em `moderno.js` e o app parou de abrir (`Invalid or unexpected token`); achei com `node --check` em cada arquivo de `src/` e consertei. Lição: depois de editar HTML dentro de strings, rodar `node --check src/*.js` antes da bateria.
- `VERSAO = '0.6.17'`. Testes antigos que clicavam no botão (t_v020, t_v040, t_v048, t_v0414, t_v0615d, t_v0615f) agora limpam o estado da tabela e conferem que o botão não existe. Bateria **53 arquivos, 0 falhas**; medidor `--estrito` **0 defeitos**, 80 ajustes (`docs/medidor-v0.6.17.txt`).
- Publicado em EliasGrigori/efcwork (main) com "pode publicar" às 11:36; o acesso `push` foi liberado nessa hora.

## Tarefa: Relatórios › Rateio (15/11, 14:48 → 16h; Sonnet 5.5, o Elias disse "pode iniciar prx passo") — v0.6.18, PUBLICADA em 15/11 (respostas abaixo)
- Começou depois da v0.6.17 publicada (commit 51c9323). Trabalhei no clone do repositório (`/home/claude/efcwork`, acesso `push` liberado às 11:36), sem commitar: só publica com "pode publicar".
- **Lido no EFClaudian** (`dpAguaHTML`, `dpCampoHTML`, `viewPainelRateio`, v2.29.0): duas visões (Água, Campo), ano ‹ ›, período (ano, T1–T4, S1–S2), tipo de ponto na água. Custo da água = valor congelado × amostras; custo do campo = valor congelado; canceladas fora (campo: sem as históricas).
- **O que entrou** (`src/relatorios.js` + `relatorios.css`, prefixo rl; módulo depois de `rateio` no montar.py): área Relatórios com a aba **Rateio** (única por ora; área `negada` sem a atribuição Rateios, mesma do Rateios). Filtro num botão só (`at-fl`) com painel: Mostrar, Ano, Período, Tipo de ponto (só na água); sem botão Limpar filtro; Esc fecha. Resumo no alto em texto (6 números, sem caixas). **Água (8 quadros):** rosca conforme × não conforme, dias até o laudo por laboratório, custo por mês (colunas), por ponto, por laboratório, contaminações por agente e por local, quadro ponto × mês (C/N/P). **Campo (7):** custo por mês, por tipo, por fazenda (cadastro de fazendas; composto à parte), por laboratório, laudos pendentes por idade, dias até o laudo, 10 áreas com mais amostras. Gráficos em SVG e barras CSS próprios, só com tokens do app; colunas com largura de celular (350) abaixo de 600 px.
- **Fora, de propósito:** "Andamento dos planos de coleta" (já em Coletas › Plano) e "Bebedouros há mais tempo sem coleta" (já em Coletas › Água) — ITEM 75. **Insumo por amostra** perguntado de novo (ITEM 78).
- **Aviso de limite:** carrega 3.000 amostras (`CO_LIM`) e 1.000 coletas de água (`AG_LIM`); se atingido, aviso e "Carregar tudo" (`coTudo`/`agTudo`).
- **Imprimir:** mesmo mecanismo das tabelas (`#tb-imp`, `body.imprimindo`), retrato (o EFClaudian usa A4 deitado); registra em Atividade (`Audit.log` `imprimir`/`painel_rateio`).
- **Outros ajustes:** `coletas.js`, `agua.js` e `rateio.js` redesenham também quando a área aberta é Relatórios; `areas.js` (plano de Relatórios sem o Rateio); `t_v010` passou a usar uma área de mentira (`AREAS.push`) para provar "área ainda não refeita", porque não sobrou nenhuma.
- **Testes:** `t_v0618.js` **27 ok** (água, filtro, campo, imprimir, 390 px, permissão); `t_html_seg` exigiu `esc()` em tudo (helpers sem HTML `rlRot`, `rlTitQ`); bateria **54 arquivos, 0 falhas**; medidor `--estrito` **0 defeitos, 0 decisões**, 88 ajustes (só tamanhos de letra, 8 a mais que antes por causa das 2 telas novas).
- **Página de aprovação:** `docs/aprovacao-efcwork-v0.6.18-relatorios.html` (artefato "EFCwork v0.6.18 · Relatórios › Rateio"), ITENS 70 a 78: 70 a área, 71 filtro, 72 resumo, 73 água, 74 campo, 75 quadros que ficam de fora, 76 imprimir, 77 aviso de limite, 78 insumo por amostra. Imagens HOJE (v0.6.17 publicada) × PROPOSTA; app de verdade embutido. Referências: Shopify Polaris, guia de visualização de dados da UE, Visa Product Design System.
- **Firebase:** nada novo (só leitura de `sv2_coletas`, `sv2_aguacol`, `sv2_analises`, `sv2_aguaponto`, `sv2_cfg/coletas`). `VERSAO` continua 0.6.17 até a aprovação; vira 0.6.18.

### Respostas e aplicação (15/11, 16h11) — v0.6.18 Relatórios › Rateio
- ITENS **70 a 77 Aprovados**; **78 (Insumo por amostra) Reprovado** → fica de fora do EFCwork.
- ITEM 70 + pedido: "os meses podem iniciar de ponta a ponta no gráfico para aproveitar o máximo do espaço" → o Custo por mês deixou de ser SVG de largura fixa e virou colunas em CSS (grade com eixo + 12 partes iguais); a primeira coluna encosta no eixo e a última na borda direita (teste confere ponta a ponta).
- ITEM 77 + pedido: "falta uma transição e fluidez mais bacana nas mudanças de filtro" → ao trocar qualquer valor do filtro (Mostrar, Ano, Período, Tipo) os quadros entram em sequência (250 ms, 40 ms de atraso), colunas e barras crescem (400 ms, escala do app), resumo também; só no filtro (redesenho comum não anima); respeita "movimento reduzido" e não anima na impressão.
- Pedido: "corrija esses dados antes de publicar" → aplicado antes de numerar. `VERSAO = '0.6.18'`.
- Testes: t_v0618 **29 ok**; bateria completa 0 falhas (t_html_seg pediu montar o gráfico sem variáveis cruas na concatenação); medidor `--estrito` 0 defeitos (docs/medidor-v0.6.18-relatorios.txt).



## Tarefa: Relatórios › Semana (19/11, 22:24 → 22:45; Opus 5.5 · alto sugerido; o Elias disse "vamos prx passo") — v0.6.19, FECHADA E TESTADA, AGUARDA "PODE PUBLICAR"
- Começou depois da v0.6.18 publicada (ca97d23). Clone em `/home/claude/efcwork` (acesso `push` liberado no `add_repo`), sem commitar: só publica com "pode publicar". EFClaudian lido por clone anônimo, só leitura (v2.102.60, b56739b).
- **Decisão dele (22:29):** "o EFClaudian é só para eu pegar os dados dele que ainda precisam ir para o Cwork; a continuação é no Cwork" → levei as duas partes da Semana (relatório da semana e atividade por pessoa); a pergunta do aviso de sexta ficou sem preferência e virou o ITEM 87 para ele decidir.
- **Lido no EFClaudian:** `viewSemana`/`semanaLinhas`/`arquivarSemana` (Atividade por semana, só Principal, arquiva em `sv2_resumos/sem_AAAA-SNN` com `semana, linhas[{userId,nome,acoes,ultima}], geradoEm, geradoPor, geradoPorNome`) e `openRelSemana`/`gerarRelSemana`/`rsDados`/`rsAviso` (PDF A4 deitado: apontamentos da reunião, cloro, coletas e remessas, almoxarifado; aviso de sexta 13h, `refTipo: 'rel_semana'`, uma por semana; quem pode: `isSup`).
- **O que entrou** (`src/semana.js` + `semana.css`, prefixo sm; módulo depois de `relatorios` no montar.py): aba **Semana** em Relatórios (área visível para Rateios OU Líder ★/Principal; aba Rateio só com Rateios; aba Semana só `isSup`). Filtro único (Mostrar: Relatório da semana | Atividade por pessoa [Principal]; Semana: últimas 12; Partes: 4 caixas), resumo em texto (5 números), quatro partes em tabelas simples, imprimir (A4 deitado pelo `#tb-imp`, só as partes marcadas, fundo branco), Atividade por pessoa (`tbHTML` `sm-ativ`, origem Ao vivo/Arquivada) com **Arquivar** (grava `sv2_resumos`), aviso de sexta 13h (`smAviso`, `smHora`), o sino abre a Semana (`sino.js`, refTipo `rel_semana`). Quem vê a Semana sem ver Coletas/Almoxarifado carrega `sv2_coletas` (`coOuveColetas`, sem duplicar com o Rateio) e `sv2_alm_mov` (limite 3000); o Principal carrega `sv2_resumos`. `atividade.js` também redesenha quando a Semana está aberta.
- **Fora, de propósito (dito no ITEM 82/83):** a reunião agrupada por setor com plano de ação das NCs e fotos (vem com a aba Apontamentos de Relatórios); velocímetros e gráfico de 3 semanas do cloro (já em Inspeções › Cloro).
- **Testes:** `t_v0619.js` **31 ok** (semente `tools/visual/semana-v0619/semente.js`); `t_html_seg` ok (a chave da tabela usa `join`); `t_regras_cobertura` 48 ok (linha `sv2_resumos` na seção 3 do REGRAS-FIREBASE-EFCwork-v0.6.15.md); `t_v010` 41 ok; `t_v0618` 29 ok; medidor `--estrito` 0 defeitos (docs/medidor-v0.6.19-semana.txt; 2 telas novas no efcwork.json). Bateria completa de 55 arquivos: a rodar depois de aplicar as respostas.
- **Duas correções no caminho:** o resumo do alto tinha rótulo grande e número pequeno (invertido em relação ao Rateio) → corrigido; a folha impressa saía com cartões creme e cantos redondos → branco e reto no papel.
- **Página de aprovação:** `docs/aprovacao-efcwork-v0.6.19-semana.html` (artefato "EFCwork v0.6.19 · Relatórios › Semana"), ITENS 79 a 88: 79 aba e quem vê, 80 filtro único, 81 resumo, 82 Apontamentos, 83 Cloro e Almoxarifado, 84 Coletas e remessas, 85 Atividade por pessoa e Arquivar, 86 imprimir, 87 aviso de sexta, 88 celular (rolagem dentro do cartão ou esconder colunas). HOJE = v0.6.18 publicada. Referências: SAP Fiori (tabelas densas), Maersk (rolagem horizontal), design system do governo da Escócia (primeira coluna fixa), GOV.UK (tabelas). Ferramentas: `pagina/captura11.js`, `pagina/itens-p11.js`.
- **Firebase:** nada novo a criar. Gravação só no Arquivar (`sv2_resumos`, Principal) e a notificação do aviso (`sv2_notifs`, já usada). Se aparecer "permissão negada" ao arquivar, conferir a regra de `sv2_resumos` (no EFClaudian o Principal grava).
- `VERSAO = '0.6.19'` já no código local; o site publicado continua v0.6.18 até o "pode publicar".

- **Respostas dele (19/11, 22:48), ITENS 79 a 88: todos APROVADOS.** Comentário no 79: "não quero esses - no meu app, kd a auditoria de sem cara de ia? usa outra coisa". Entendi como cobrança da auditoria visual, que eu tinha pulado antes da página; ficou em aberto a que "esses" se referia (talvez a linha fina na lateral do resumo, igual à do Rateio). Perguntado ao Elias.
- **Auditoria visual (sem cara de IA):** medidor `--estrito` 0 defeitos / 90 ajustes preexistentes; Semana a 1280 e 390 px, claro e escuro: sem rolagem lateral, sem emoji, sem erro de JS. Defeitos corrigidos: caixas de marcar com 20 px (agora 36 PC / 44 celular), "(ões)" e "(s)" viraram singular/plural (`smPl`), resumo do alto cortado.
- **Bateria completa (20/11):** 55 arquivos, 0 falhas (t_v0619 31 ok); medidor 0 defeitos.
- **Matriz:** features.csv e FALTA atualizados (Semana e Relatórios da semana feitos na v0.6.19).
- **Publicação:** só com "pode publicar" explícito (copiar dist para a raiz, commit com Co-Authored-By e Claude-Session).
- **PUBLICADA em 20/11 04:38** ("publica e vamos de bugs e sugestões"): commit e569966 na main.

## Tarefa: Bugs e sugestões 2 (20/11, 04:40 → 05:35; Opus 5.5 · alto) — v0.6.20, PUBLICADA em 20/11
- Pedido: itens 23, 25, 29, 30 e 49 da TRIAGEM de 09/11. **Decisões do Elias (20/11 04:4x):** item 23 = "Regra agora" (fecha a leitura no Firebase já; a tela de Bugs do EFClaudian para de abrir para quem não é Administrador); item 30 = "Deixar para depois" (falta o texto das 24 regras, regras-sistema.md).
- **23:** consulta filtrada (`where porId == eu`, sem orderBy para não pedir índice composto) para quem não é Administrador; cabeçalho "em aberto · só os seus"; contadores, busca e PDF seguem a lista. Número do relato pelo contador `sv2_bugs_seq/n` (transação, `Data.col().seq`); o Administrador acerta o contador quando o maior número visível cresce; sem a regra, cai no maior visível + 1. Novo em base.js: opção `igual` na consulta e o método `seq`.
- **25:** `prioridade` (alta/media/baixa) só em problema; na janela, ao lado do Tipo (começa em Média), parte do app embaixo; coluna Prioridade (cor só na Alta; escondida por padrão nos Finalizados); na gaveta, janela retrátil para o Administrador (grava na hora, registro "Alta → Média"); no PDF. Partes novas: 'login' (Segurança / Login) e 'bugs' (Bugs e sugestões).
- **29:** `coment` (push) com texto e imagem à parte (`sv2_bugs_foto/{relato}_c…`, com `donoId`); quem reportou e o Administrador comentam; aviso cruzado no sino; no PDF.
- **49:** a imagem do relato abre com Marcar (editor das inspeções); a marcada vira `sv2_bugs_foto/{relato}_m…` (base = original, marcas, substitui) e o relato aponta com `fotoAtual`; a original nunca é regravada. Marcar também antes de enviar (relato e comentário).
- **Firebase:** trecho novo na seção 0 do REGRAS (bsPrincipal, sv2_bugs, sv2_bugs_foto, sv2_bugs_seq) + roteiro de teste em dois aparelhos. `t_regras_cobertura` 49 ok.
- **Testes:** t_v0620 36 ok; t_v0616 ajustado (coluna Prioridade); bateria 56 arquivos, 0 falhas; medidor --estrito 0 defeitos / 90 ajustes (os de antes).
- **Auditoria visual (sem cara de IA):** gaveta a 1280 e 390, claro e escuro: sem rolagem lateral, 5 tamanhos de letra, botões 36/44 px, sem erro de JS. Ajuste feito: a linha Prioridade no celular quebrava em duas (rótulo em cima, janela embaixo); agora segue a grade dos dados (120 px + valor), alinhada ao pixel. Sem emoji, gradiente, brilho ou KPI.
- **Página:** docs/aprovacao-efcwork-v0.6.20-bugs2.html (ITENS 89 a 98, artefato publicado), captura12.js, itens-p12.js, semente tools/visual/bugs-v0620.
- **Respostas do Elias (20/11 06:31):** APROVADOS 89, 90, 91, 92, 93, 94, 97 e 98; **REPROVADOS sem comentário 95 (Marcar na imagem do relato e antes de enviar o relato) e 96 (imagem marcada na gaveta)**. "Pode publicar aí para o próximo".
- **Aplicado só o aprovado:** saiu o Marcar do visualizador da imagem do relato e da janela de reportar; saiu o `fotoAtual` (e a nota "1 marca … a original fica guardada"); ficou o Marcar da imagem do comentário (ITEM 94). A regra da seção 0 perdeu `fotoAtual` (quem reportou só pode mexer em `coment`). **O item 49 da TRIAGEM continua em aberto** (a forma de editar a imagem do relato fica para ele dizer).
- Testes depois do ajuste: t_v0620 37 ok (agora confere que o relato NÃO tem Marcar e o comentário tem), t_v0616, t_html_seg, t_regras_cobertura ok; medidor --estrito 0 defeitos (docs/medidor-v0.6.20-bugs2.txt). Publicada (commit abaixo no CONTINUAR).
- **20/11 06:44–07:00 · regras publicadas e um susto de "permissão":** o Elias mandou as regras do console (cabeçalho v0.6.12); montei `REGRAS-FIRESTORE-EFCwork-v0.6.20-COMPLETAS.txt` (só sv2_bugs, sv2_bugs_foto e sv2_bugs_seq mudam) e ele publicou. Logo depois, "O Firebase não deixou gravar (permissão)" ao pedir recontagem e ao mudar a situação do relato nº 40, logado como Principal. Causa: a aba estava aberta havia horas na **v0.6.18** (App Check vencido / app antigo); fechar as abas e abrir de novo na v0.6.20 resolveu ("funcionou", 07:00). As regras estão certas. Ideia para uma próxima versão (a propor, não feita): avisar quando há versão nova no ar e, se o Firebase recusar gravação por permissão sendo Principal, sugerir recarregar o app; e a mensagem de erro dizer em qual coleção foi.

## Tarefa: Barra de cima + Relatórios › Almoxarifado do mês (20/11, 07:06 → 07:45; Opus 5.5 · médio/alto; "pode iniciar, se der faz os dois juntos") — v0.6.21, ESPERANDO AS RESPOSTAS DOS ITENS 99 A 111
- **Pedido (07:05, print marcado):** "nessa parte de cima vamos excluir tudo e tbm vamos decer para baixo deixando alinhado ao nome da aba essa parte que dexei em amarelo, assim ganho mais espaço". Mais a tarefa escolhida: outra aba de Relatórios (sugeri Almoxarifado do mês).
- **Barra de cima (casca.js/casca.css):** no PC (≥ 900 px) `csTopo()` não desenha mais a barra (sai o caminho também; o `mo-bc` do moderno some junto). As ferramentas (busca, nuvem, tema, sino) vão para a linha do título por `csFerPoe()` depois de montar a tela (`.cs-fer` dentro do 1º `.cs-phr`; sem cabeçalho, linha própria `.cs-fer.solta`). OPÇÃO 1 (no app): grade com `display:contents` no `.cs-pht` — linha 1 título | ferramentas; linha 2 pílulas | botões da tela, tudo alinhado à direita. OPÇÃO 2 (só para comparar, `html[data-fer="2"]`): ferramentas na linha dos botões, depois de um traço. Gaveta `top:0` no PC; altura da tabela sem os 56 px; ao trocar PC↔celular a tela se redesenha. No celular nada muda (a barra segura o menu). `fer` entrou na base do t_html_seg (é o HTML montado com esc() em csTopo).
- **Almoxarifado do mês (src/almmes.js + almmes.css, prefixo am):** porte de viewAlmApre/alApreDados/alApreLeitura do EFClaudian no padrão de Rateio/Semana: filtro único (Mês, 12 meses), resumo em texto (consumo, compras, estoque hoje, movimentados, atenção), 7 partes em tabelas simples com números à direita e barra fina (Como ler este mês; Consumo mês a mês (6 meses); Para que foi usado; Material a material; Por laboratório e por pessoa; O que pede atenção; Solicitações e equipamentos), impressora (registro `relatorio_almox`), Esc fecha o filtro. Quem vê: Líder ★, Principal ou quem tem o Almoxarifado (`amVe`); quem não tem o Almoxarifado carrega itens, solicitações e equipamentos aqui (mov já vem da Semana). Sem coleção nova; só leitura.
- **Testes:** t_v0621 38 ok; ajustados t_v045 (ferramentas na linha do título; os cantos da casca não contam), t_v046 (caminho saiu: confere o menu lateral), t_v0619 (3ª aba). Bateria 57 arquivos, 0 falhas. Medidor --estrito 0 defeitos / 90 ajustes (tela nova no efcwork.json).
- **Auditoria visual:** cabeçalho medido em 4 telas (ferramentas na altura do título, botões alinhados à direita com elas); Almoxarifado do mês a 1280 e 390 sem rolagem lateral; corrigido na hora: cabeçalhos das tabelas desalinhados dos valores (agora só as colunas de número vão à direita), "1 vencido · 2 abaixo do …" cortado no resumo, unidade no "Como ler".
- **Página:** docs/aprovacao-efcwork-v0.6.21-topo-almox.html (ITENS 99 a 111, artefato publicado; 100 = OPÇÃO 1, 101 = OPÇÃO 2), captura13.js, itens-p13.js. Referências conferidas na internet: Primer PageHeader, Grommet PageHeader, Carbon data table, Alberta (números à direita).
- **Respostas do Elias (20/11 07:56):** APROVADOS 99, 100 (OPÇÃO 1), 102 a 111; REPROVADO 101 (OPÇÃO 2). No 106: "essa tabela pode ser entre mes e valor, faz junto na prx etapa" → aplicado já: a barra fina fica entre o nome e o valor (Consumo mês a mês, Para que foi usado e Por laboratório, que segue o mesmo desenho). Tirada a OPÇÃO 2 do casca.css. Testes t_v0621, t_v045, t_v046, t_v0619, t_html_seg ok. "pode contiuar" (não é "pode publicar": a publicação espera).
- 07:56, pergunta do Elias: "me fala o que tínhamos combinado que precisaria para integrar o doc no cwork" → respondido com o PLANO-INTEGRACAO-v2 (Ponte 1 = v0.6.11; Ponte 2 = v0.6.13): o Vértice publicado no mesmo endereço do EFCwork (caixa de troca do aparelho só funciona na mesma origem) e o pacote `integracao-cwork-vertice-v0.6.18.zip` anexado na conversa.
- **"pode publicar" (20/11 07:59):** publicada.
- **20/11 08:12–08:19 · Janela do Vértice com abas:** o Elias anexou `integracao-cwork-vertice-v0.6.18_1.zip` (LEIA-ME, ESTADO, PROGRESSO, MEMORIA, contrato/ com efd-v1.js, efd-ponte.js, exemplos e confere.js 94 ok; notas das Pontes 1 e 2). A IA do Vértice confirmou: Vértice em `https://eliasgrigori.github.io/EFCdocs/` (mesma origem do EFCwork, a caixa de troca já funciona), Pontes 1 e 2 no ar desde 14/11 (site na v0.6.41). Endereços: `…/EFCdocs/#/abrir/<pid>` e `…/#/pedido/<pid>`. Pedido do Elias: "quero que o vértice abra aqui por cima numa janela tipo navegador, aí posso ficar alternando". Mostrei 5 modelos de abas finas (visual na conversa). **Escolha dele: OPÇÃO 1 (linha fina sublinhada, só o nome do app e um traço de 2 px na cor da janela) com o recolher da OPÇÃO 3 (fica um fio de 6 px no alto e abre ao passar o mouse ou tocar).** Próxima tarefa: janela do Vértice com essas abas + Ponte 1 (v0.6.11), Opus 5.5 · alto, de preferência em conversa nova.

### v0.6.22 · Janela do Vértice com abas + Ponte 1 (20/11/2026, 08:25 → 09:25; Sonnet 5.5 no começo, depois Opus 5.5 · alto)
- **Pedido (08:25):** "ordem aprovada, pode iniciar" (ordem: 1 janela do Vértice + Ponte 1; 2 abas de Relatórios; 3 item 22; 4 Pessoas e perfis). Respostas no mesmo recado: **item 30** "onde consigo isso?" (o texto das 24 regras); **item 49** "aprovado agora" (entendido como: o Marcar volta na imagem do relato; vai como ITEM 122 para ele confirmar); **ITEM 79** "é o ' - ' que fica no texto" (os travessões usados como separador nos textos do app).
- **Item 30 (resposta):** o texto das 24 regras não existe no código nem nos documentos do EFCwork, nem no EFClaudian (procurado no clone de leitura). Veio do relato nº 30 dele (lista de 03/11), que pedia "as 24 regras do sistema (regras-sistema.md)". Ofereci: ele cola o texto, ou eu escrevo um rascunho das regras da família a partir do Padrão de trabalho e das regras visuais, para ele aprovar.
- **Vértice para teste:** clonado só para leitura `EliasGrigori/efcdocs` (v0.6.42, commit 8b0905b) em `/home/claude/eliasgrigori/efcdocs`; o site não abre da sessão (proxy), então os testes servem o Vértice de verdade em `/EFCdocs/` e o EFCwork em `/efcwork/`, no mesmo endereço, como no GitHub Pages.
- **Construído:**
  - `src/janelas.js` + `janelas.css` (prefixo jn): Vértice e Sabiá abrem num quadro por cima do EFCwork (fora do #app, sobrevive ao redesenho). Faixa OPÇÃO 1 (nome + traço de 2 px na cor de destaque do app; 26 px no PC, 40 px no toque) com o recolher da OPÇÃO 3 (fio de 6 px; abre ao passar o mouse ou tocar; no toque, 12 px invisíveis a mais para acertar e fecha sozinha em 4 s). Cor da faixa = cor do app da frente (lida do próprio app, com repintura quando ele carrega ou troca o tema). Alternar não recarrega; Esc e voltar do celular voltam ao EFCwork (camada `janela`); X pergunta antes de fechar; ícone de abrir numa aba do navegador; Ctrl + clique no menu abre fora como antes; sair da conta fecha as janelas.
  - `src/ponte.js` (prefixo pt) + `efd-ponte.js` no app (módulo `efdponte`, de `tools/contrato/`): recebe `documento` do Vértice (confere EFD.ficha, limites 3,3 MB / 1,3 MB, SHA-256 do PDF, espaço de 150 MB), grava em efd_docs com o login de quem está aqui (Administrador e Líder; os outros veem aviso e o item espera), versão nova quando o mesmo id chega de novo, e só então apaga da caixa. "Abrir no Vértice" (Excel) põe `abrir` (+ `resumo` do envio quando vem do kit, `ptResumoEnvio` no dicionário do contrato) e abre `#/abrir/<pid>` na janela. Word continua baixando (Documento do Vértice é a v0.7.0 dele).
  - Travessões: todos os " — " usados como separador nos textos do app viraram " · " ou frase reescrita (Semana: "Apontamentos da reunião", "Movimentações do almoxarifado"; "foi encerrado e não aceita mais coleta"); cidade/UF "Russas/CE"; leitura antiga do plano aceita os dois separadores. O "—" sozinho de campo vazio continua.
  - Bugs: Marcar na imagem do relato novo (antes de enviar). O visualizador continua sem Marcar (mudaria relato já enviado; pediria regra nova).
- **Testes:** `t_v0622.js` novo (45 ok, com o Vértice de verdade: abriu a ficha e o Resumo do envio); ajustados t_v035, t_v040 (texto sem travessão), t_v0619 (títulos da Semana), t_v0620 (Marcar no relato). Bateria 58 arquivos, 0 falhas; contrato 94 ok; prova da ponte 13 ok; t_html_seg ok. Medidor `--estrito`: 0 defeitos, 0 decisões, 90 ajustes (letras de sempre).
- **Página:** `docs/aprovacao-efcwork-v0.6.22-janela-vertice.html` (artefato "EFCwork v0.6.22 · Janela do Vértice com abas e Ponte 1"), ITENS 112 a 122, prints com o Vértice de verdade dentro. Ferramentas: `pagina/captura14.js`, `pagina/itens-p14.js`. Referências: Material 3 (abas), Primer UnderlineNav, Fluent 2 TabList, NN/g (abas bem usadas).
- **Firebase:** nada novo nesta versão.
- **Respostas do Elias (20/11 09:42): ITENS 112 a 122 todos APROVADOS.** Comentários: 112 "pode ficar um pouco maior a fonte" → letra das abas 13 px no PC e 14 px no toque; 114 "não precisa de ícone para abrir na rede lá no topo" → saiu o ícone de abrir numa aba do navegador da faixa (fica o Ctrl + clique no menu); 116 "aprovo, mas creio que não seja intuitivo; na verdade isso é mais pensado para notebook e tablets" → mantido como aprovado no celular; anotado que o uso principal é notebook e tablet (se ele quiser, no celular volta a abrir numa aba do navegador). t_v0622 45 ok; medidor 0 defeitos.
- **"pode publicar e irmos para o próximo passo" (09:43):** publicada a v0.6.22 (commit dc9a523). Próximo passo: as 3 abas de Relatórios (Documentos, Apontamentos completo, Coletas em aberto).

### v0.6.23 · Relatórios › Documentos + faixa das janelas ajustada (20/11/2026, 09:48 → 10:35; Opus 5.5)
- **Pedido (09:48):** "pode iniciar" (aba Relatórios › Documentos). **09:52:** "preciso também das aprovações no Cwork" (print do sino com "Decidir no EFClaudian" em dois pedidos de cloro tratado) → próxima tarefa. **09:55:** a faixa de cima "é muito descontrolada, sobe e desce muito rápido e não tem uma transição bonita; muito simples e sem relevo; quero que a interação seja somente onde existem abas; animação com efeito bonito e profissional". **10:13:** "eu não pedi para mudar o tamanho da janela; queria um pouco mais de textura, efeito, e ela interagir somente onde está a janelinha, não do outro lado que não tem nada; quando vou para cima para fechar alguma coisa ela fica toda hora baixando" → a primeira tentativa (faixa estreita e centrada, 34 px) foi desfeita antes de ele ver a página.
- **Relatórios › Documentos (`src/reldocs.js` + `.css`, prefixo rd):** porte do viewDocsRel do EFClaudian no padrão das abas de Relatórios: filtro único (Tipo, Situação, Responsável; Esc fecha), resumo (vencidos, vencem logo, em dia, sem data, caixas vencidas), Como ler, Vencidos por responsável (Formulários, Regulatórios, Total, com barra), O que vence nas próximas 8 semanas (novo), Caixas d'água · limpeza (por situação + lista das vencidas e perto de vencer), lista do mais urgente para o em dia (toque abre a gaveta do documento, de onde se lança), imprimir (registro relatorio_docs). Quem vê: Líder ★ e Administrador (decisão para ele no ITEM 123; para todos faria a área Relatórios aparecer ao Colaborador). Mesmos dados (sv2_docs, sv2_caixas, sv2_lanc): nada no Firebase. documentos.js redesenha também em Relatórios › Documentos.
- **Faixa das janelas:** mesmo tamanho (ponta a ponta, 26 px PC / 40 px toque). Textura e relevo (degradê na cor da janela da frente, luz em cima, sombra em duas camadas). Efeito: abre só se o mouse parar 120 ms sobre as abas e fecha 450 ms depois de sair; desliza em 400 ms (fecha em 250 ms); abas entram uma a uma (40 ms); um traço só que desliza entre as abas (250 ms). Só a área das abas reage (`pointer-events` só em `.jn-faixa`, + 8 px abaixo do fio; 12 px no toque); o resto deixa o clique passar ao app.
- **Testes:** `t_v0623.js` novo (21 ok; semente `tools/visual/reldocs-v0623/semente.js`); `t_v0622.js` 53 ok (raspão não abre, canto direito não reage, clique passa, traço desliza, relevo); t_v0621 ajustado (abas de Relatórios). Bateria 59 arquivos, 0 falhas; medidor 0 defeitos (91 ajustes de letra).
- **Página:** `docs/aprovacao-efcwork-v0.6.23-documentos-faixa.html` (artefato "EFCwork v0.6.23 · Relatórios › Documentos e a faixa das janelas"), ITENS 123 a 135, com quadros de movimento (abrir e trocar de aba). Ferramentas: `pagina/captura15.js`, `pagina/itens-p15.js`.
- **Respostas do Elias (20/11 10:46): ITENS 123 a 135 todos APROVADOS.** No 130: "o ícone está num lugar fora do padrão" → a impressora dos quatro Relatórios (Rateio, Semana, Almoxarifado, Documentos) vai para a linha das abas, à direita, como os ícones das tabelas (`csIcAba` na casca, marca `data-ic-aba`; no celular continua no cabeçalho). Pedido no mesmo recado: "removi as linkagens com o Claudian, deixa somente um na tela Início" → saíram os links para o EFClaudian de Coletas, Programação, Água, Pontos de água, Almoxarifado, área "em breve", detalhe do aviso no sino e "Esqueci a senha" na entrada (vira aviso: peça ao Administrador). Fica só "Abrir o EFClaudian" na Início e, até a próxima versão, "Decidir no EFClaudian" nos pedidos que o EFCwork ainda não decide (sai com as aprovações). Testes ajustados: t_v010, t_v030, t_v0615, t_v0615e, t_v0621. Bateria 59/59, medidor 0 defeitos.
- **10:46–10:47:** "pode publicar e seguir com aprovações" e "depois de feito pode publicar sem aprovação" → publicada a v0.6.23; a versão das aprovações pode ser publicada direto depois de pronta e testada.

### v0.6.24 · Aprovações decididas no EFCwork (20/11/2026, 10:50 → 11:30; Opus 5.5) — PUBLICADA sem página de aprovação (autorização do Elias, 10:47)
- **Pedido (09:52):** "preciso também das aprovações no Cwork" (print do sino: "Tratado no BR 01" com "Decidir no EFClaudian"). **10:47:** "depois de feito pode publicar sem aprovação".
- **O que faltava:** o EFCwork só decidia os tipos com tela refeita (envio_retro, corrigir_os, corrigir_lancamento, cloro_retro, cloro_just, corrigir_cloro, novo_bebedouro, almox). Faltavam os outros seis que o EFClaudian pede: cloro_tratado, cancelar_coleta, corrigir_coleta, laudo_prazo, rz_recoleta e desativar_cadastro.
- **`src/aprovar.js` (novo):** cada um aplica o MESMO que o EFClaudian v2.102.60 em Aprov.decidir (aplicarTratado, cancelarCol, aplicarCorrColeta, aplicarPatchColetas, rzAplicarRec, aplicarDesativarCad): mesmas coleções, campos e registro. `APROV_RECUSA` (servicos.js) faz o que o EFClaudian faz ao reprovar: cloro tratado volta a esperar (tratadoAprovId vazio) e bebedouro novo fica "recusado". Pedido geral (sem payload) também se decide aqui. O sino não tem mais "Decidir no EFClaudian" (se um dia vier um tipo novo, aparece "Tipo de pedido ainda não decidido aqui. Avise o Administrador."). Com isso, o único link para o EFClaudian que sobra no app é o da Início.
- **Firebase:** nada novo (as regras publicadas já deixam o superior e o Principal atualizar essas coleções, as mesmas do EFClaudian). `sv2_etqmodelos` entrou na tabela do documento de regras (já estava nas regras publicadas).
- **Testes:** `t_v0624.js` novo (14 ok: os 8 pedidos com Confirmar e Recusar no sino; cloro tratado aprovado e reprovado; cancelar, corrigir, prazo do laudo, recoleta do plano, desativar talhão; registro; aviso a quem pediu; pedido já decidido não se decide de novo). Bateria 60 arquivos, 0 falhas; medidor 0 defeitos.

### v0.6.25 · Relatórios › Apontamentos (20/11/2026, 11:59 → 12:45; Opus 5.5 · médio) — ESPERANDO AS RESPOSTAS DOS ITENS 136 A 146
- **Conversa nova (11:58)** com o pacote da v0.6.24. Resposta do Elias junto com o "pode iniciar" (11:59): **item 30 resolvido — as 24 regras foram substituídas pelo Método Sabiá.** Sai da lista de pendências.
- **Acesso:** `add_repo` com `push` **negado** de novo pelo sistema de permissões da sessão; trabalhei num clone só de leitura de EliasGrigori/efcwork (`/home/claude/eliasgrigori/efcwork`, HEAD 5499dbc = v0.6.24). Para publicar, o acesso de escrita precisa ser liberado na hora do "pode publicar". O clone do EFClaudian para leitura também foi **bloqueado** (de acordo com o "nada no EFClaudian"): o relatório foi feito só com os dados que o EFCwork já usa. EFCdocs clonado só para leitura (8b0905b, v0.6.42) para o t_v0622.
- **O que entrou** (`src/relapont.js` + `relapont.css`, prefixo rp; módulo depois de `reldocs` no montar.py): aba **Apontamentos** em Relatórios, depois de Documentos (Líder ★ e Administrador, `rpVe`; a área passa a aparecer também por ela). Filtro único: Período (30/90 dias, este mês, mês passado, este ano, tudo; começa em 30 dias), Setor, Situação, Gravidade (grave e urgente, média, baixa), Fotos (mostrar/não). Resumo em texto (5 números; "não procede" fica à parte e fora das contas). Partes: **Como ler · Por setor** (Total, Em aberto, Graves, NCs abertas; o setor do filtro em negrito, comparando com todos) · **O que mais se repete** (Pareto por categoria, vitais em negrito, "Outro" no fim e fora do corte de 80%, mesma regra da v0.6.15) · **Mês a mês** (6 meses, registrados × resolvidos) · **Reincidências** (mesmo setor e categoria ≥ 2 no período) · **NCs e plano de ação** (vencidas, abertas pelo prazo, fechadas; a linha abre o apontamento) · **Apontamentos por setor** (a reunião que a Semana deixou para cá: setor com mais casos primeiro; dentro, em aberto e mais graves primeiro; observação, risco, recomendação, NC, resolução, quem registrou, fotos de antes e depois; LGPD vira aviso; até 200; tocar abre a gaveta). Imprimir na linha das abas (`data-ic-aba`): busca as fotos antes (`apFotoGet`), partes pequenas não se partem entre folhas, registro `relatorio_apont`. `TELAS['relatorios:depois']` carrega as miniaturas. `apont.js` redesenha também em Relatórios › Apontamentos. `casca.js` (aba e texto da área), `areas.js` (falta só Coletas em aberto).
- **Testes:** `t_v0625.js` novo **32 ok** (semente `tools/visual/relapont-v0625/semente.js`, que esconde os apontamentos da demonstração com `teste: true`); `t_v0623` aceita abas depois de Documentos. Bateria **61 arquivos, 0 falhas** (5 lotes; t_v0622 com o Vértice de verdade 53 ok). Medidor `--estrito` **0 defeitos, 0 decisões**, 92 ajustes (1 a mais: cores de papel na impressão, como as outras abas) — `docs/medidor-v0.6.25-apontamentos.txt` (tela nova no efcwork.json).
- **Auditoria visual (sem cara de IA):** 1280 e 390, claro e escuro: nada rola de lado, 5 tamanhos de letra (12 a 16 px), sem erro de JS, sem emoji, gradiente ou KPI decorativo. Corrigidos antes da página: o traço entre os apontamentos saía curvo (canto arredondado) → reto; o fundo de "passar o mouse" ficava preso no celular → só onde há mouse; o título "Mês a mês" ficava sozinho no pé da folha → partes pequenas inteiras no papel.
- **Página:** `docs/aprovacao-efcwork-v0.6.25-apontamentos.html` (artefato "EFCwork v0.6.25 · Relatórios › Apontamentos"), ITENS 136 a 146: 136 aba e quem vê · 137 filtro · 138 resumo e Como ler · 139 por setor · 140 Pareto · 141 mês a mês · 142 reincidências · 143 NCs e plano de ação · 144 reunião por setor com fotos · 145 imprimir com fotos · 146 celular. HOJE = v0.6.24 publicada; app vivo conferido. Ferramentas: `pagina/captura16.js` (a folha impressa sai de um PDF A4 de verdade), `pagina/itens-p16.js`. Referências: GOV.UK (tabelas), Carbon (números à direita), ASQ (Pareto), ISO 9001 10.2.
- **Firebase:** nada novo (só leitura de sv2_apont, sv2_fotos, sv2_cfg/apont; o registro de impressão vai para sv2_audit, como sempre).
- `VERSAO` continua **0.6.24** no código até a aprovação; vira 0.6.25. ZIP de proposta: `efcwork-v0.6.25-proposta-apontamentos.zip`.
- **Respostas do Elias (20/11 12:59): ITENS 136 a 146 todos APROVADOS**, sem comentário. "Pode publicar e seguir para a próxima etapa."
- `VERSAO = '0.6.25'` (cache `efcwork-0.6.25`). O `add_repo` com `push` foi liberado nessa hora; as mudanças passaram do clone de leitura para `/home/claude/efcwork`. Testes depois de numerar: t_v0625 32, t_v010 41, t_html_seg, t_v0623 21, t_v0621 38, t_v061 60, t_regras_cobertura 50, todos sem falha. O t_v0619 falhou uma vez depois das 13h de sexta: o app já dispara o aviso de sexta ao abrir, e o teste esperava disparar ele mesmo. Era defeito do teste (dependia do relógio), não do app; corrigido (31 ok).
- **PUBLICADA em 20/11** (commit "v0.6.25: Relatórios › Apontamentos"). Próxima: Relatórios › Coletas em aberto.
