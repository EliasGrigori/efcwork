# Triagem — Bugs e sugestões do EFClaudian (lista de 03/11, conferida em 09/11/2026)

Fontes conferidas: PDF de 03/11 (títulos), backup real de 08/11 (descrição completa de cada item; as fotos não vêm no backup), dossiê do EFClaudian (até a v2.102.60), dossiê e memória do EFCwork (até a v0.4.14) e o código publicado dos dois apps.

## A. Já feitos — só marcar "Resolvido" no app (Gestão › Bugs e sugestões)
| Nº | Item | Onde foi feito |
|---|---|---|
| 34, 35, 36 | Histograma, Diagrama de dispersão, Carta de controle | EFClaudian v2.102.49 (gráficos do cloro nos relatórios) |
| 37 | Fluxograma | EFClaudian v2.102.48 (na análise da NC e na Análise de problemas) |
| 38 | Bebedouro reativado cobra dias antigos | EFClaudian v2.102.39 (`ativoDesde`) |
| 39 | Menu de imprimir da RNC cortado no celular | EFClaudian v2.102.39 |
| 40 | Campo Local com sugestões (segurar e arrastar para a lixeira) | EFClaudian v2.102.41 e v2.102.45 |
| 41 | Campo de quantidade cobre o lote na contagem | EFClaudian v2.102.39 |
| 47 | Almoxarifado "feio e poluído" + Nº da solicitação de compras no orçamento da calibração | EFCwork v0.2–v0.3.4 (Almoxarifado refeito) e v0.3.3 (calibração com Nº da solicitação de compras e NF) |
| 51 | Contagem seguindo a sequência de local | EFCwork v0.3.2 (contagem às cegas por lugar, portas em sequência) |
| 31 (fase 1) | Checagem de innerHTML antes de cada versão | EFClaudian: `teste_html_seg.js` roda em toda suíte. **Falta no EFCwork** (ver C) |

## B. Fechados por decisão sua (05/11)
- Nº 43 Sair não desloga: aconteceu só no navegador do Grok; aguardar repetir. O EFCwork tem o login próprio e a saída é testada em toda suíte.
- Nº 46 Verificação de cloro: não procede (aparelho com VPN). **A sugestão do botão "Atualizar" na nuvem ainda não existe** (ver C).

## C. Faltam — com o lugar certo de fazer
| Nº | O que falta | Onde | Situação hoje |
|---|---|---|---|
| 44 | Meu dia › Semana: as datas aparecem duas vezes (faixa de cima e colunas de baixo). Alinhar a faixa às colunas e tirar as datas das colunas | EFClaudian | conferido na tela (demo v2.102.60) |
| 50 | Rodízio de água: a lista salva está fixa (no backup de 08/11 só BR 06 e BR 01; **o BR 03 está ativo e fora do rodízio**). Parado sai sozinho; ao voltar a ativo (ou bebedouro novo) perguntar "colocar no rodízio?" e entrar na próxima coleta ainda não confirmada; editar a qualquer hora (Líder ★ e Principal) | EFClaudian (Coletas › Água ainda não foi refeita) | causa achada: projeto "legado" com pontos fixos |
| 46 | Botão "Atualizar agora" na janela da nuvem (forçar a leitura de novo) | EFClaudian e EFCwork | não existe |
| 42 | Editar as fotos das evidências a qualquer momento (setas, textos, círculos), não só antes de enviar | EFClaudian (Inspeções › Auditoria/RNC) | hoje as marcas só até enviar |
| 45 | Apresentação da RNC nas demais etapas + apresentação individual por responsável (inclui as NCs em que ele é envolvido) | EFClaudian | hoje só na etapa de registro |
| 49 | Abrir as fotos anexadas em Bugs e sugestões e editar com as ferramentas das inspeções | EFClaudian | não existe |
| 23 | Bugs e sugestões: cada um vê só o que lançou; Principal vê tudo (tela, contadores, PDF e **regra do Firestore**) | EFClaudian (+ regra que você publica) | hoje todos veem tudo |
| 25 | Prioridade Alta/Média/Baixa nos bugs + "Segurança / Login" e "Bugs e sugestões" em "Em qual parte do app" | EFClaudian | não existe |
| 29 | Comentário (texto e foto) dentro de cada item, com aviso ao autor | EFClaudian | não existe |
| 30 | As 24 regras do sistema no topo do PDF de bugs e em Sobre (só leitura) | EFClaudian | não existe; **preciso do texto das 24 regras (regras-sistema.md)** |
| 27 | Lembrete de calibração no sino: 2 meses e 7 dias antes, uma vez por vencimento, para o responsável e o superior | EFCwork (Almoxarifado/Calibração) | hoje só o selo "a vencer" (40 dias) e o filtro |
| 31 (EFCwork) | Checagem de esc() em todo HTML novo, na suíte do EFCwork | EFCwork | não existe |
| 48 | Menu lateral retrátil em 3 jeitos (aberto, só ícones, recolhido com puxador que cresce ao passar o mouse), com escolha bonita de como fixar | EFCwork (casca) | não existe |
| 21 | Produtividade em Coletas e Rateios | EFCwork já cobre busca, filtro lembrado/travado, planilha, total, O.S e laudo em lote com escolha. **Falta**: selo "Etiqueta não impressa" (etiquetas ainda no EFClaudian) e o mesmo em Rateios | EFCwork (Coletas v0.4.x / Rateios v0.7) |
| 22 | Estornar a solicitação de compra no Rateio (só Principal, com motivo, amostras voltam a abertas, aviso a quem solicitou) | Rateios (EFClaudian hoje; EFCwork v0.7) | não existe |
| 14 + 26 | Gestão de perfis (26 itens: motivo de bloqueio, Arquivados, árvore, temporário, restrição por subaba, histórico, migração) | Administração (EFCwork v0.9) ou EFClaudian | não existe; é o maior item da lista |

## Decisão do Elias (09/11 17:59): "EFClaudian v2.102.6x não quero dar continuidade, tudo vai ser jogado para o EFCwork por hora"
Nenhuma versão nova do EFClaudian. Os 17 itens que faltam entram no EFCwork, cada um com a sua área:
| Versão do EFCwork | Itens |
|---|---|
| v0.4.15 (casca e almoxarifado) | 46 botão "Atualizar agora" na nuvem · 27 lembrete de calibração no sino (2 meses e 7 dias) · 31 checagem de esc() na suíte · 48 menu lateral retrátil (com modelos antes) |
| v0.5 Documentos (em modelos) | — |
| Coletas › Água (nova no EFCwork) | 50 rodízio de água que acompanha o bebedouro (sai parado, pergunta ao voltar, editar a qualquer hora) |
| v0.6 Inspeções | 42 editar as fotos das evidências a qualquer momento · 45 apresentação em todas as etapas e individual por responsável |
| v0.7 Qualidade (Meu dia, Bugs e sugestões) | 44 Semana sem datas repetidas · 49 abrir e editar fotos · 23 cada um vê só o que lançou (+ regra do Firestore) · 25 prioridade · 29 comentários · 30 as 24 regras no PDF |
| v0.7 Rateios | 22 estornar solicitação de compra · 21 resto (etiqueta não impressa, Rateios) |
| v0.9 Administração | 14 + 26 gestão de perfis |
Enquanto isso, no EFClaudian em uso: o BR 03 continua fora do rodízio de água (lista salva fixa); dá para incluí-lo à mão na configuração do rodízio.
