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
