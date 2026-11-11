# Roteiro para o Grok — EFCwork v0.6.1 (Inspeções › Apontamentos)

**App:** https://eliasgrigori.github.io/efcwork — em **Opções › Sobre** deve dizer **v0.6.1**. Se ainda disser v0.6.0, feche e abra de novo.
**Atenção:** esta aba grava nas mesmas coleções do EFClaudian (`sv2_apont` e `sv2_fotos`). Para testar sem sujar os dados, use o modo de demonstração (`?demo=1` no fim do endereço).
Responda item por item com **ok** ou **não**. Quando for **não**, diga o que apareceu, em que aparelho (celular ou PC) e mande o print.

## 1. A tela
1.1 Entre em **Inspeções › Apontamentos**. No alto aparece "N em aberto de M" e, quando houver, "N urgente(s)" e "N NC vencida(s)". Os números batem?
1.2 Cada apontamento é um cartão com a foto (quando tem), a categoria, o setor, o que foi visto e os selos: gravidade, situação, NC aberta ou vencida, origem (quando é auditoria) e "Nª vez em 30 dias" quando se repete.
1.3 O traço colorido na lateral do cartão aparece só nos graves e urgentes?
1.4 O filtro (Esta semana / Em aberto / Meus / Todos) mostra a contagem de cada um e muda a lista?
1.5 Havendo urgente em aberto, aparece o atalho vermelho ao lado do filtro; tocando nele, a lista mostra só os urgentes.
1.6 No celular: nada escorrega para o lado e **as letras não ficam menores** (a tela não "afasta"), mesmo nos apontamentos com texto comprido. Esse era um defeito e foi corrigido — confira com um apontamento de observação bem longa.

## 2. Novo apontamento
2.1 Toque em **Novo apontamento**: a gaveta abre com 5 passos numerados.
2.2 Passo 1: tire uma foto e escolha outra da galeria. Cabem até 5; dá para tirar uma com o "x". A foto encolhe sozinha no aparelho (não trava nem demora demais)?
2.3 Passo 2: Categoria e Setor são janelas retráteis, lado a lado e do mesmo tamanho. Escolhendo "+ Outro local" aparece o campo para digitar.
2.4 Passo 3: a gravidade são **quatro botões grandes** (Baixa, Média, Grave, Urgente), todos do mesmo tamanho. Ao tocar em cada um, a frase embaixo muda explicando o que ele faz?
2.5 Passo 4: "Avisou o encarregado?" e a origem (rotina ou auditoria interna). Escolhendo auditoria, aparece o campo para dizer qual.
2.6 Tente enviar sem categoria, sem setor, sem gravidade e sem responder o encarregado: o app avisa o que falta, um de cada vez?
2.7 Envie um **grave**: quem é seu superior recebe no sino? Envie um **urgente**: chega como alerta crítico?
2.8 O apontamento aparece na lista com a foto, logo depois de enviar?

## 3. Detalhe
3.1 Toque num apontamento: a linha do tempo é a do tubo com a gota (a mesma da Calibração e do Cloro)?
3.2 Ela mostra o caminho: registrado (com a gravidade original), encarregado avisado, NC com responsável e prazo, ação concluída, fechamento.
3.3 As fotos aparecem; tocando numa, ela abre grande. Voltar fecha só a foto.
3.4 No rodapé: **Não procede, Mudar gravidade, Abrir NC (ou Fechar NC) e Resolver** — todos do mesmo tamanho e alinhados. No celular ficam dois por linha, grandes o suficiente para o dedo. Confira que nenhum fica menor que os outros.
3.5 Quem **não** é Líder ★ nem Administrador não vê esses botões.

## 4. Mudar a gravidade
4.1 Em **Mudar gravidade**, escolha outra e escreva o motivo. Sem motivo, o app recusa?
4.2 Depois de salvar, a gravidade antiga aparece **riscada** ao lado da nova, no cartão e no detalhe?
4.3 Quem registrou recebe aviso no sino?

## 5. NC (não conformidade)
5.1 **Abrir NC**: responsável, prazo e ação corretiva. Sem algum deles, recusa?
5.2 Depois de abrir, o apontamento fica "Em andamento" e o selo "NC aberta" aparece. Se o prazo passar, vira "NC vencida" em vermelho.
5.3 O responsável, se for alguém cadastrado, recebe aviso no sino?
5.4 **Fechar NC**: escreva como foi verificado. Fechando, o apontamento também fica resolvido?

## 6. Resolver, não procede e reabrir
6.1 **Resolver**: escreva o que foi feito e, se quiser, tire uma foto do depois. No detalhe, as fotos do depois aparecem separadas.
6.2 Quem registrou recebe aviso?
6.3 **Não procede** com motivo: o apontamento sai dos abertos.
6.4 Num resolvido aparece **Reabrir**; reabrindo com motivo, ele volta para aberto.

## 7. Pareto e setores
7.1 **Pareto**: agrupando por categoria, setor e gravidade, e nos três períodos (30, 90 dias e o ano). As barras e as porcentagens fazem sentido?
7.2 O texto embaixo diz quais são os "poucos vitais"? Os "não procede" não entram na conta?
7.3 **Setores** (só Líder ★ e Administrador): escreva um por linha, salve e confira se o setor novo aparece na lista do Novo apontamento. O EFClaudian enxerga a mesma lista?

## 8. Fotos e LGPD
8.1 No detalhe de um resolvido, aparece a frase dizendo quando as fotos serão apagadas (30 dias depois de resolvido)?
8.2 Se você tiver algum resolvido há mais de 30 dias, as fotos dele já sumiram e o texto e o histórico continuaram?

## 9. Geral
9.1 A aba **Cloro** (v0.6.0) continua funcionando igual?
9.2 Busca do alto: procurando por uma palavra da observação, o apontamento aparece e abre?
9.3 Temas Claro e Escuro, no PC e no celular: tudo legível?
9.4 Voltar (ou Esc) fecha uma camada por vez.
9.5 Apareceu erro, tela branca ou travamento? Em qual passo?

**Não precisa testar (ainda não existe aqui):** análise de problema (5 Porquês, Ishikawa, plano de ação), a aba que junta as NCs dos apontamentos com as das auditorias, e marcar/editar foto — vêm nas v0.6.2 e v0.6.3.
