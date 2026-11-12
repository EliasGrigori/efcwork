# Dossiê EFCwork v0.6.1 — Inspeções › Apontamentos (11/11/2026)

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
