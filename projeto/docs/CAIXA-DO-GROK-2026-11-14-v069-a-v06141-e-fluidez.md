Criado em 14/11/2026 01:04 (horário de Fortaleza)

# Caixa do Grok: EFCwork, roteiros v0.6.9 a v0.6.14.1 e mapa de fluidez

**Como testei**
- Tudo rodou numa cópia local, com Playwright sem janela, o Firebase bloqueado e `?demo=1`.
- O backup-2026-11-08.json entrou só no demo, por `Data.importarDemo`.
- Usei só dados inventados. Não gravei no Firebase real, não entrei na conta real e não apertei "Atualizar agora".
- Parte A: v0.6.14 publicada, baixada do site (Sobre = 0.6.14).
- Partes B e C: **a v0.6.14.1 foi testada a partir dos arquivos que o Elias enviou** (index.html, sw.js e manifest.webmanifest; só os ícones vieram da v0.6.14). **Não foi testada pelo site**, porque ainda não foi publicada.
- **Não chegaram roteiros da v0.6.11 nem da v0.6.13.** Essas versões não foram testadas por roteiro.
- Telas: PC 1280 e celular 390, temas Claro e Escuro.
- Os prints ficam em `prints/`. Os da v0.6.14.1 começam com `v06141-`.

## 1. Resumo por versão

| Versão | Onde | ok | não | não testado |
|---|---|---|---|---|
| v0.6.9 | v0.6.14 publicada | 13 | 0 | 0 |
| v0.6.10 | v0.6.14 publicada | 11 | 0 | 0 |
| v0.6.11 | sem roteiro | – | – | – |
| v0.6.12 | v0.6.14 publicada | 13 | 0 | 0 |
| v0.6.13 | sem roteiro | – | – | – |
| v0.6.14 | v0.6.14 publicada | 8 | 3 | 0 |
| v0.6.14.1 | arquivo do Elias | 8 | 1 | 0 |

## 2. Lista dos "não", explicados

1. **v0.6.14 item 2.** No celular, na tela de entrar, a linha "Qualidade da fazenda / Coletas, inspeções..." fica **por cima** da parte de baixo da foto. A linha vai de y 286 a 364 e a foto de y 18 a 358, então ela cobre 72 px (pernas e prancheta). Acontece no Claro e no Escuro.
   - Prints: `v0614-2-entrar-celular-claro.png`, `v0614-2-entrar-celular-escuro.png`.
2. **v0.6.14 item 7 (uma parte).** A lista retrátil abre crescendo (250 ms), mas **não encolhe ao fechar**: some de uma vez. A cópia que devia encolher é escondida na mesma hora. O menu da coluna também fecha sem efeito de saída.
   - **Continua igual na v0.6.14.1.** Medi quadro a quadro: a cópia já nasce escondida.
   - Print: `v0614-7-confirma.png`.
3. **v0.6.14 item 9 (a confirmar).** Na tela de entrar, o pólen não para de se mexer enquanto a tela está aberta (60 quadros por segundo, sem fim). Pode ser de propósito, mas o item pede "não" para isso. É igual na v0.6.14.1.
4. **v0.6.14.1 item 1.** No tema **Escuro**, nenhum cartão de apontamento tem o traço colorido da lateral, nem os Graves e Urgentes. Os 5 cartões ficam com a mesma cor de borda, dourada fraca.
   - No Claro está certo: Grave e Urgente com traço vermelho, Média e Baixa sem traço.
   - A regra do tema escuro para o cartão troca a cor de todas as bordas, inclusive a do traço.
   - Acontece no PC e no celular.
   - Prints: `v06141-b1-pc-escuro.png`, `v06141-b1-cel-escuro.png` (e o Claro, para comparar: `v06141-b1-pc-claro.png`).

## 3. NÃO TESTADO e observações

- **Nenhum item ficou sem testar** nos roteiros recebidos.
- **v0.6.11 e v0.6.13:** não houve roteiro.
- **Mapa de fluidez, "Opções" e "instalar o app":** não achei esses elementos na v0.6.14.1. O Sobre fica em Administração e não há botão de instalar na tela. Ficaram sem medir.
- **v0.6.14.1 item 6 (obs.):** o cartão do rodízio diz "quinzenal, terça · 08:00" mas mostra "Próxima: qui 19/11". Só anoto; não é item do roteiro.
- **v0.6.14.1 item 8 (como testei):** para ter uma "coleta sem laboratório", apaguei o laboratório de uma coleta **só no demo**. O resultado "Não conforme" e a ação corretiva foram feitos pela tela, e o PDF foi gerado pelo botão.
- **v0.6.9 item 7 (obs., da caixa anterior):** sem leitor de PDF (celular), "Ver o PDF" e Imprimir abrem a aba nova **e** baixam o arquivo junto.

## 4. Detalhe da v0.6.14.1 (arquivo enviado pelo Elias)

| Nº | Item | Resultado | O que vi |
|---|---|---|---|
| 1 | Traço só em grave/urgente | **não** (Escuro) | Claro ok. No Escuro, nenhum cartão tem traço (PC e celular). |
| 2 | Rodapé do detalhe | ok | PC: 4 botões numa linha, 90×36 cada, texto inteiro. Celular: 2 por linha, 173×44. Claro e Escuro. |
| 3 | Busca no Início abre o detalhe | ok | Apontamento ("parafuso solto"), NC 12 da RNC-2026-03, ANP-2026-01 e treinamento criados no demo: abre a aba certa com o detalhe. PC e celular. |
| 4 | Foto marcada sem recarregar | ok | Logo depois de enviar: "2 marcas · marcada por ..." e a chave Com as marcas / Original troca a imagem. A foto do "depois" ao resolver também. |
| 5 | Foto marcada do Cloro | ok | 2 marcas e a chave Original logo depois de lançar. PC e celular. |
| 6 | Bebedouro novo no rodízio | ok | BR 99 (novo) marcado junto com BR 01. BR 03, fora do projeto, continua fora. |
| 7 | Frase de Coletas | ok | Sobre › Coletas: "...prontos aqui; fichas, etiquetas e os outros cadastros seguem no EFClaudian". Não fala mais em "lançar coleta nova". |
| 8 | PDF da ação corretiva sem laboratório | ok | Análise = "MICROBIOLOGIA (COLIFORMES E E.COLI)", sem "· —". |
| 9 | Console e rolagem lateral | ok | 31 telas no celular, Claro e Escuro: nada rola para o lado e não aparece erro vermelho. |

Prints: `v06141-b2-*`, `b3-*`, `b4-*`, `b5-*`, `b6-*`, `b7-pc-sobre.png`, `b8-pc-pdf-acao.png`.

## 5. Mapa de fluidez (v0.6.14.1, arquivo do Elias), para o Claude

**Como medi**
- `document.getAnimations()` foi registrado a cada quadro durante cada ação: entrar na aba, abrir e fechar o detalhe, ordenar, filtrar, salvar e assim por diante.
- Os tempos são os reais do navegador.
- Passei pelas 31 abas no PC 1280 e no celular 390. As durações deram iguais no Claro e no Escuro (conferi aba, gaveta e lista no Escuro).

**Os movimentos que já existem (confirmados)**

| Movimento | Medido |
|---|---|
| Troca de aba | fzEntra 250 ms; o traço desliza (transform e width 250 ms) |
| Título da área | fzTt 500 ms + 40 ms por letra |
| Aviso | sobe em 350 ms; o visto se desenha em 500 ms (+80); faíscas 500 ms |
| Erro no formulário | treme uma vez (280 ms) |
| Confirmação | 250 ms ao abrir, 150 ms ao fechar |
| Gaveta | abre em 400 ms, fecha em 350 ms; no celular ocupa a tela toda e "Voltar" fecha com 350 ms |
| Lista retrátil | abre em 250 ms |
| Menu da coluna | 250 ms; no celular a folha sobe em 400 ms |
| Sino | itens em sequência (400 ms + 60 ms cada) |
| Tema | ícone gira em 250 ms |
| Menu lateral | recolhe em 350 ms; no celular ☰/Mais abre e fecha em 350 ms |
| Tela de entrar | en-entra, en-blur e en-brilho |

**Com reduzir movimento**
- Param aba, área, gaveta, lista, menu da coluna, tema, confirmação, tremida e tela de entrar.
- A tela de entrar fica sem quadros e o reflexo dourado para.
- **Sobram** duas coisas: o esmaecer do fim da lista (250 ms) e os rótulos do menu ao recolher (150 ms).
- **Só uma coisa se mexe para sempre** com o movimento normal: o reflexo do botão dourado (6 s). O pólen da tela de entrar também não para enquanto a tela está aberta.

**Prioridade:** Alta = aparece toda hora ou parece quebrado. Média = dá para perceber, mas não atrapalha. Baixa = detalhe.

| Nº | Área › Aba | Elemento | O que acontece hoje | O que falta ou está estranho | PC / Celular | Prioridade |
|---|---|---|---|---|---|---|
| 1 | Todas | Lista retrátil (filtros, escolhas) | Abre crescendo em 250 ms; ao fechar (Esc, escolher, tocar fora) some de uma vez | Defeito: a cópia que encolhe é escondida na hora, então não encolhe (igual à v0.6.14) | PC e Celular | Alta |
| 2 | Todas | Busca do alto (lupa, tecla /) | A caixa abre e fecha sem nenhuma animação; os resultados trocam de uma vez a cada letra | Abrir e fechar secos (é usada toda hora) | PC e Celular | Alta |
| 3 | Inspeções › Apontamentos e Cloro | Foto grande (visualizador) | Aparece e some de uma vez; trocar Com as marcas / Original troca a imagem seca | Abrir, fechar e trocar secos | PC e Celular | Média |
| 4 | Inspeções › Apontamentos (e Cloro, Auditoria) | Editor "Marcar a foto" | Abre e fecha de uma vez, tela cheia | Seco | PC e Celular | Média |
| 5 | Todas as gavetas | Conteúdo que troca dentro da gaveta aberta (Não procede, Resolver, Gravidade, abrir NC) | O conteúdo novo entra de uma vez, sem efeito | Seco | PC e Celular | Média |
| 6 | Todas as tabelas | Menu da coluna (fechar) | Abre em 250 ms (PC) ou com a folha de 400 ms (celular); fecha de uma vez | Sem saída | PC e Celular | Média |
| 7 | Inspeções › Apontamentos | Filtro (Esta semana / Todos) | Os cartões trocam de uma vez | Cartões aparecem secos | PC e Celular | Média |
| 8 | Inspeções › Apontamentos | Novo apontamento salvo | Aviso e visto ok; o cartão novo surge no topo de uma vez | O cartão novo não entra; a lista "pula" | PC e Celular | Média |
| 9 | Todas as áreas | Título da área, letra por letra | 500 ms + 40 ms por letra: "Painel" 700 ms, "Documentos" 860 ms, "Almoxarifado" ~940 ms, Início 980 ms | Passa de 600 ms em toda troca de área | PC e Celular | Média |
| 10 | Coletas › Amostras, Programação; Inspeções › Cloro; Apontamentos; Almox › Calibração | Linha do tempo (gota) no detalhe | Brilho do líquido de 1,5 s repetido 2 vezes (3 s) a cada abertura. A gota enche (600 ms) e acende (500 ms) só na 1ª abertura da sessão; se a gaveta fecha rápido, essa parte ainda começa durante o fechamento | Brilho longo e repetido; a sequência continua depois de fechar | PC e Celular | Média |
| 11 | Fora das abas › Tela de entrar | Pólen | requestAnimationFrame 60 por segundo sem parar enquanto a tela está aberta | Contra "nada se mexe para sempre" (a confirmar) | PC e Celular | Média |
| 12 | Início | Caixas de números (28, 11, 1, 0) | Aparecem junto com o conteúdo (fzEntra 250 ms); os números não mudam com efeito | Números secos | PC e Celular | Baixa |
| 13 | Almoxarifado › Painel; Documentos (caixas do topo) | Caixas de números | Iguais ao Início | Números secos | PC e Celular | Baixa |
| 14 | Inspeções › Apontamentos | Botões de gravidade no formulário | O botão escolhido muda sem transição | Seco (detalhe) | PC e Celular | Baixa |
| 15 | Fora das abas › Sino | Avisos em sequência | 12 avisos terminam em ~1,06 s | Passa de 600 ms com muitos avisos | PC e Celular | Baixa |
| 16 | Fora das abas › Menu lateral | Abrir o menu recolhido | Grade 350 ms; o puxador entra (500 ms) e tem brilho de 2 s depois de +500 ms (~2,5 s no total, uma vez) | Brilho longo | PC | Baixa |
| 17 | Almoxarifado › Calibração | Barra de etapas da solicitação | Brilho de 2 s ao entrar (uma vez) | Passa de 600 ms | PC e Celular | Baixa |
| 18 | Fora das abas › Barra de baixo | Trocar de área pela barra | Título e conteúdo entram; o marcador do ícone ativo troca de uma vez | Seco (detalhe) | Celular | Baixa |
| 19 | Fora das abas › Sair e tela de entrar | Sair | Sai sem confirmação; a tela de entrar monta em ~1,8 s (os cartões entram até +1,30 s + 500 ms) | Mais de 600 ms, mas não é tela de trabalho | PC e Celular | Baixa |
| 20 | Reduzir movimento | O que sobra | Esmaecer do fim da lista (250 ms) e rótulos do menu ao recolher (150 ms) | Duas transições curtas não param | PC | Baixa |
| 21 | Todas as tabelas | Ordenar e filtrar pelo cabeçalho | As linhas trocam de uma vez | Ver "onde NÃO pôr movimento" | PC e Celular | Baixa |
| 22 | Início | Busca do alto e atalhos | Ver nº 2; atalhos navegam com o título e a aba | Nada além dos nº 2, 9 e 12 | PC e Celular | – |
| 23 | Coletas › Amostras | Lista e gaveta | Gaveta 400/350 ms; menu da coluna 250 ms | Nada além dos nº 1, 6, 10 e 21 | PC e Celular | – |
| 24 | Coletas › Água | Lista, relatório e Nova coleta | Gaveta 400/350 ms; marcar bebedouros sem efeito (marca na hora) | sem achado | PC e Celular | – |
| 25 | Coletas › Programação | Tabela e gaveta | Igual Amostras | Nada além do nº 10 | PC e Celular | – |
| 26 | Coletas › Envio | Remessas / Laboratórios | A lista retrátil abre em 250 ms | Nada além do nº 1 | PC e Celular | – |
| 27 | Coletas › Cadastros | Tela | fzEntra 250 ms | sem achado | PC e Celular | – |
| 28 | Coletas › Plano de coleta | Tela | fzEntra 250 ms | sem achado | PC e Celular | – |
| 29 | Rateios | Tela (vazia) | fzEntra 250 ms e título | sem achado | PC e Celular | – |
| 30 | Inspeções › Cloro | Tabela, gaveta, nova verificação | Gaveta 400/350 ms | Nada além dos nº 3, 4 e 10 | PC e Celular | – |
| 31 | Inspeções › Auditoria interna | Trocar de RNC, abrir NC | A lista retrátil abre em 250 ms; a gaveta da NC 400/350 ms; a lista de NCs troca de uma vez ao mudar de RNC | Nada além dos nº 1 e 5 | PC e Celular | – |
| 32 | Documentos › Documentos | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 33 | Documentos › Caixas d'água | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 34 | Documentos › Histórico | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 35 | Documentos › Impressos | Lista | fzEntra 250 ms | sem achado | PC e Celular | – |
| 36 | Almoxarifado › Materiais | Tabela e gaveta | Gaveta 400/350 ms; ordenar troca as linhas de uma vez | Nada além do nº 21 | PC e Celular | – |
| 37 | Almoxarifado › Movimentações | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 38 | Almoxarifado › Solicitações | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 39 | Almoxarifado › Equipamentos | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 40 | Almoxarifado › Contagem | Tabela e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 41 | Qualidade › Não conformidades | Tela | fzEntra 250 ms | sem achado | PC e Celular | – |
| 42 | Qualidade › Análise de problemas | Lista e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 43 | Qualidade › Treinamentos | Lista e gaveta | Gaveta 400/350 ms | sem achado | PC e Celular | – |
| 44 | Qualidade › Bugs e sugestões | Tela | fzEntra 250 ms | sem achado | PC e Celular | – |
| 45 | Relatórios | Tela | fzEntra 250 ms e título | sem achado | PC e Celular | – |
| 46 | Administração › Empresa | Formulário | fzEntra 250 ms | sem achado | PC e Celular | – |
| 47 | Administração › Aparência | Tema | O ícone gira em 250 ms | sem achado | PC e Celular | – |
| 48 | Administração › Atividade | Lista longa (1000 registros) | fzEntra 250 ms | sem achado | PC e Celular | – |
| 49 | Administração › Sobre | Tela | fzEntra 250 ms | sem achado | PC e Celular | – |
| 50 | Fora das abas | Confirmação, aviso, tremida, tema, gaveta, menu ☰ do celular | Tempos na lista de movimentos confirmados | sem achado | PC e Celular | – |
| 51 | Fora das abas | Opções e instalar o app | Não achei esses elementos nesta versão | não testado | – | – |

### As 5 telas onde a falta de movimento mais incomoda

1. **Lista retrátil, em todas as telas:** fecha seco por defeito (nº 1).
2. **Busca do alto:** abre e fecha seca, e é usada toda hora (nº 2).
3. **Inspeções › Apontamentos:** filtro, cartão novo e conteúdo da gaveta trocando, tudo seco (nº 5, 7 e 8).
4. **Foto grande e editor "Marcar a foto"** (Apontamentos e Cloro): aparecem e somem de uma vez (nº 3 e 4).
5. **Menu da coluna das tabelas:** fecha seco, e mais ainda a folha do celular (nº 6).

### Onde NÃO colocar movimento

- **Tabelas grandes:** linhas ao ordenar, filtrar ou rolar (Amostras, Programação, Cloro, Documentos, Histórico, Materiais, Movimentações, Equipamentos). São de 60 a 100 linhas e precisam responder na hora.
- **Administração › Atividade:** lista de 1000 registros.
- **Digitação:** campos de formulário, o resultado do Cloro enquanto digita e a busca a cada letra (só abrir e fechar a caixa, não os resultados).
- **O editor "Marcar a foto" enquanto desenha:** o traço tem que seguir o dedo sem atraso.
- **Impressão e PDF:** papéis do envio, rótulos, lista de presença e PDF da ação corretiva.
- **Não somar mais brilhos:** já há o reflexo dourado sem fim, o brilho de 3 s da gota, o brilho de 2 s do puxador e o de 2 s da Calibração.
