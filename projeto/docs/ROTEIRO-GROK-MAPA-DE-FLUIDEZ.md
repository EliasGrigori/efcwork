# Pedido para o Grok — mapa de fluidez do EFCwork (de cima a baixo)

**App:** https://eliasgrigori.github.io/efcwork (depois da v0.6.14.1 publicada: Opções › Sobre = **v0.6.14.1**; se ainda aparecer v0.6.14, vale igual). Use `?demo=1`. Só dados inventados. Percorra **PC (1280) e celular (390)**, nos temas **Claro** e **Escuro**.

## O que você deve fazer
Passar por **todas as áreas e todas as abas**, uma por uma, de cima a baixo, e **apontar cada lugar onde falta movimento** (algo aparece, some ou muda de uma vez, seco) **ou onde o movimento existe mas está estranho** (corta, pisca, rola para o lado, demora, repete). **Não é para consertar nada nem opinar sobre cores.** É só um mapa. Quem confirma e implementa depois sou eu (Claude) com o Elias.

## O que já tem movimento (v0.6.14) — não precisa apontar, só confirmar se funciona
- Troca de aba: o conteúdo desliza na direção da aba e o traço dourado da aba desliza. Troca de área: título entra letra por letra.
- Avisos (toasts) sobem de baixo, um por vez; o de sucesso tem visto que se desenha e faíscas douradas saem do botão principal ao salvar.
- Janela de confirmação (fundo escurece, janela sobe do centro). Mensagem de erro no formulário treme uma vez.
- Lista retrátil (dropdown) cresce do botão e encolhe ao fechar. Gaveta lateral abre e fecha deslizando.
- Sino: avisos entram em sequência; fim das listas desfocado. Ícone do tema troca com giro.
- Tela de entrar: pólen dourado, linha que entra palavra por palavra.
- Tudo para com "reduzir movimento" ligado. Nada se mexe para sempre (exceto o reflexo do botão dourado).

## Como medir o que você vê (escala comum da família)
Muito rápido: 80 ms · rápido: 150 ms · normal: 250 ms · devagar: 350–500 ms. Abrir/fechar = suave e curto. Se algo leva mais de 600 ms, ou menos de 80 ms e parece um pulo, aponte.

## O que olhar em CADA aba (checklist para a lista de achados)
1. Ao entrar na aba: a lista/tabela/cartões aparecem de uma vez (seco) ou entram com suavidade?
2. Ao abrir o detalhe (gaveta no PC, tela cheia no celular) e ao fechar com Esc ou voltar.
3. Ao aplicar filtro, ordenar, buscar ou usar o menu da coluna: a lista muda de uma vez, pisca ou "pula"?
4. Ao salvar, excluir (lixeira), resolver, cancelar ou mudar situação: o item sai/entra/muda de lugar de uma vez?
5. Números que mudam (totais, contadores, painel): trocam de repente?
6. Etapas / linha do tempo (gota enchendo), barras de progresso e abas internas de uma gaveta.
7. Foto grande (visualizador), marcação de foto, baixar, trocar Com as marcas / Original.
8. Estado vazio, carregando e erro: aparecem de uma vez ou com suavidade?
9. Cartões / caixas de números-chave e listas de seleção (marcar vários, caixa de bebedouros).
10. Qualquer coisa que **pisca, corta, salta, rola para o lado, repete ou demora** (defeito de movimento).

## Onde passar (todas as abas)
- **Início** (resumo, busca do alto, atalhos)
- **Coletas** › Amostras · Água · Programação · Envio · Cadastros · Plano de coleta
- **Rateios** (se aparecer)
- **Inspeções** › Cloro · Apontamentos · Auditoria interna
- **Documentos** › Documentos · Caixas d'água · Histórico · Impressos
- **Almoxarifado** › Painel · Materiais · Movimentações · Solicitações · Equipamentos · Contagem · Calibração
- **Qualidade** › Não conformidades · Análise de problemas · Treinamentos · Bugs e sugestões
- **Relatórios** (se aparecer)
- **Administração** › Empresa · Aparência · Atividade · Sobre
- **Fora das abas:** menu lateral e menu do celular, sino, busca do alto, Opções, trocar tema, instalar o app, tela de entrar e sair.

## Como responder (uma tabela só, em Markdown, para eu colar)
Uma linha por achado. Colunas:

| Nº | Área › Aba | Elemento | O que acontece hoje | O que falta ou está estranho | PC / Celular | Prioridade |
|---|---|---|---|---|---|---|

- **Prioridade:** **Alta** (aparece toda hora ou parece quebrado), **Média** (percebe-se, mas não atrapalha), **Baixa** (detalhe).
- Escreva "**sem achado**" nas abas em que tudo já está suave, para eu saber que você passou por lá.
- No fim, uma lista curta: **as 5 telas onde a falta de movimento mais incomoda**, e **os lugares onde eu NÃO deveria colocar movimento** (ex.: tabela grande, onde atrapalharia o trabalho).

## Regras que valem para a sugestão (não precisa propor solução, mas aponte se algo as quebraria)
Nada que se mexa para sempre. Nada que atrase quem trabalha (tela de trabalho tem que responder na hora). Um efeito por tela, no lugar certo. Sem "cara de IA" (sem brilho colorido, sem glow). Tudo com "reduzir movimento". Nada rolar para o lado.
