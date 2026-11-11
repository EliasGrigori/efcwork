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
