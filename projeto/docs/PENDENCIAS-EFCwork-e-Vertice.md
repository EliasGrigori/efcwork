# Pendências · EFCwork e Vértice Docs (lista viva)

Arquivo pedido pelo Elias em 26/11/2026 11:41: tudo o que fica para outra conversa ou para o fim, para nada ficar para trás. Atualizado a cada mudança e enviado junto. Marque [x] quando estiver feito.

Última atualização: 27/11/2026 18:3x · no ar: Cwork v0.6.44 + Vértice v0.6.79. Pronta e aprovada, NÃO publicada: v0.6.45 + Vértice v0.6.80 (fichas com todos os dados, ITENS 284 a 286; patch no pacote).

## A. Para a conversa do Vértice (o Elias leva)
- [ ] **NOVO (27/11 06:59) · Todos os documentos só no Vértice:** nota `NOTA-DO-CWORK-para-o-Vertice-documentos-so-no-Vertice.md`. Hospedar tudo lá (internos e externos); o Cwork guarda só a ligação; versão nova vale sozinha; PDF baixa e imprime direto; planilha e Word abrem em modo documento, só aquela aba ou folha, só os campos desbloqueados. Junta a P4 com os ITENS 195 e 196.
- [ ] **O código do Vértice mora agora em `efcwork/vertice/fonte/`** (depois de publicada a P5): a conversa do Vértice clona o efcwork e publica na pasta `vertice/`. Está na memória do Vértice (registro de 26/11, 16:57).
- [ ] **Nota `NOTA-DO-CWORK-para-o-Vertice-P3c-regras.md`** (P3c): o formato que as regras aceitam na P4 (ficha, `versaoPartes`, pedaços um por gravação, ler por id para conta comum, testar consulta em lista).
- [ ] **Nota `NOTA-DO-CWORK-para-o-Vertice-P3-respostas.md`**: porta sem `contaTeste`; `recursos` novo; 3 perguntas (limpa o estado na troca de conta? a navegação cria passos no voltar do celular? nomes dos caches do sw).
- [ ] **Modo de teste sem login** (decisão de 26/11 10:12): nada vai para o Firebase, tudo fica só no aparelho.
- [x] **ITEM 195 · acesso "documento"** (26/11 11:41): feito na etapa 2 (Vértice v0.6.76, em aprovação, ITEM 266). a porta agora manda `acesso` ('completo' ou 'documento') e `salvar` (true só para Principal e Líder ★). Com `acesso: 'documento'`, a pessoa só entra pelo documento ligado (o que o Cwork abriu), edita e imprime, mas **não salva** e não navega pelo resto do Vértice.
- [ ] **ITEM 195 · pedir para editar e salvar:** uma opção que a pessoa aciona e que leva ao processo de edição e mudança de versão (quem aprova: Principal ou Líder ★). Desenhar com o Elias; o Cwork pode receber esse pedido (aviso/aprovação) numa versão futura.
- [x] **ITEM 196 · ninguém abaixo de ★ salva:** feito na etapa 2 (quem não salva não tem "Atualizar documento" e não chega ao editor). Secundário e Visitante editam, mas não salvam (`salvar: false`).
- [x] **ITEM 196 · planilhas protegidas:** no documento aberto pelo Cwork só as células liberadas aceitam escrita (etapa 2). Antes: com células travadas, quem não é ★ só mexe nas células desbloqueadas; só Líder ★ e Principal usam "Desproteger".
- [ ] **Alça dourada (`menu-alca`, App.jsx/estilo-base.css):** fica em cima dos números das linhas da planilha e se estica quando o Elias mexe nas linhas. Sugestão: dentro do Cwork (classe `em-cwork`), a alça só aparece numa faixa de 6 px na borda ao passar o mouse, ou some e o menu abre pelo botão do alto.
- [ ] **Vários Vértices abertos ao mesmo tempo (feito no Cwork na v0.6.35, até 10 abas):** [feito na etapa 2: o documento e o pedido mandam o nome] o Vértice deve mandar a mensagem 'arquivo' também quando abre um documento pelo Cwork (#/abrir), para o Cwork saber que a aba já tem arquivo. dois Vértices no mesmo aparelho não podem gravar o mesmo arquivo ao mesmo tempo (aviso "aberto em outra aba" ou só leitura na segunda), e cada um avisa o nome do arquivo dele.
- [ ] **pastas() (P3b, v0.6.35):** a porta devolve, por pasta, { nome, ler, editar, salvar }; o Vértice mostra só as pastas com ler, e só salva onde salvar = true; avisa quando recebe `cwork:usuario`.
- [ ] **ITEM 184 (v0.6.33) · PDF preenchido de volta:** `NOTA-DO-EFCWORK-para-o-Vertice-pdf-preenchido.md`. Contrato EFD v2 autorizado em 27/11 17:22 (vai junto da próxima tarefa).
- [x] **P4 · documentos na nuvem:** etapa 1, publicada em 27/11 (1e6a059). O que faltava da frase abaixo (Cwork apontando para o Vértice) é a etapa 3. gravar e abrir arquivos (`vtd_arquivos`, `vtd_partes`); tudo o que for arquivado no Cwork aparece no Vértice (PDF; Word e planilha abrem no Vértice para editar e imprimir); o que o Elias edita, posta ou remove no Vértice atualiza sozinho no Cwork.
- [ ] **Ligações futuras (item 1.8 do pedido):** preencher formulário, abrir procedimento, programações no Kanban do Vértice com relatórios no fichário do Cwork.

## B. Para esta conversa (Cwork), na ordem aprovada
- [x] **Etapa 1 · Vértice na nuvem (P4):** aprovada (ITENS 255 a 258) e publicada em 27/11 09:32 (efcwork 1e6a059). Falta o roteiro curto no site (seção D).
- [x] **Etapa 2 · modo documento:** aprovada (ITENS 259 a 269) e publicada em 27/11 (Vértice v0.6.76).
- [ ] **Etapa 3 · observações da etapa 2:** o pedido do Cwork imprime todas as abas do modelo (deveria ser só a do documento?); o que chega do Cwork fica em "Recebidos do Cwork", fora das 5 pastas, e não sobe para a nuvem até a migração.
- [x] **Etapa 3 · etiquetas automáticas:** aprovada (ITENS 272 a 279) e publicada em 27/11 (Cwork v0.6.43 + Vértice v0.6.78). Cabeçalho escrito no modelo; nada a preencher na impressão.
- [x] **Etapa 4 · kit do laboratório com papéis do Vértice:** aprovada (ITENS 280 a 283) e publicada em 27/11 (Cwork v0.6.44 + Vértice v0.6.79); até 2 papéis de custódia ou ficha por laboratório.
- [ ] **Etapa 3 · Cwork apontando para o Vértice:** Impressos, kit e etiquetas; o que já está guardado no Cwork (`efd_docs`) muda de lugar uma vez.
- [ ] Backup do Cwork: incluir `vtd_arquivos` e `vtd_partes`? (hoje não entram; perguntar ao Elias)
- [x] **P3b · Administração › Pastas do Vértice**: feita e publicada na v0.6.35.
- [x] **v0.6.35 · tela inteira com abas (OPÇÃO 2, ITEM 201):** feita e testada; aprovada (ITENS 207 a 211) e publicada.
- [x] **Tarefas · "Conferir quando terminar" (pedido 26/11 14:18):** corrigido no Cwork (Principal conclui direto; parada ganha Concluir/Conferido); aprovado (ITEM 212) e publicado. A correção no EFClaudian é da outra conversa.
- [x] **Filtro da coluna (pedido 26/11 14:24):** janela parada ao marcar e escolha em várias buscas; aprovado (ITENS 213 e 214) e publicado.
- [x] **"Não vejo ícone" (ITENS 198, 202, 203):** eram as imagens da página de aprovação que não carregavam (defeito do montador, corrigido); o app estava certo.
- [x] **P3c · regras do Firestore**: aprovadas; app publicado (v0.6.36); regras publicadas por você (26/11 19:02).
- [x] **P5 · Vértice dentro do efcwork**: publicada em 26/11 (efcwork 84e1ddc, EFCdocs 12f2466).
- [ ] **ITEM 185 · ícone do Vértice no menu:** o Elias vai mandar o print do ícone que quer.
- [x] **Aviso de versão nova (v0.6.37):** aprovado (226 = janela no meio; "Depois" leva ao pé do menu) e publicado em 26/11.
- [x] **CSP e SDK (v0.6.38):** regra de segurança ligada e SDK 13.4.0.
- [x] **Limpeza visual (v0.6.39):** publicada em 27/11 (efcwork 756527b).
- [x] `features.csv` atualizado (27/11).
- [x] **Cadastros de Coletas (v0.6.40):** publicada em 27/11 (efcwork fc4afcc).
- [x] **Etiquetas das amostras:** feitas na v0.6.43 (Amostras, remessa, depois de Coletado). Antes: viram documentos do Vértice (decisão de 27/11 06:59). No Cwork, depois da P4: escolher onde abrir a etiqueta (aba, remessa, depois de "Coletado", amostras filtradas; o protótipo está em `fonte/rascunhos/`). Folha de campo das avulsas: perguntar se também vira documento do Vértice.
- [x] **Kit apontando para o Vértice:** feito na v0.6.44. O que já está guardado no Cwork (`efd_docs`) NÃO muda sozinho: o Elias troca no kit (resposta de 27/11 15:24); PDF continua em Impressos (o Vértice ainda não guarda PDF).
- [ ] Da matriz, funções "must" que faltam: Conversas; Relatórios › Coletas em aberto; Só ver por área.
- [ ] **Ideia (não pedida):** pôr a conferência de rótulos lado a lado no `medir.js` da família, para valer em todos os apps.
- [ ] Matriz: conferir as 169 linhas "Janela …" e 4 outras "should" marcadas como não.
- [ ] Estudo de rapidez (`ESTUDO-rapidez-EFCwork-v0.6.33.md`): só depois da integração.
- [x] Janela por cima: virou a tela inteira com abas (v0.6.35); a área ao lado do menu saiu.

- [x] **Fichas e cadeias com todos os dados (parte 1):** aprovada (ITENS 284 a 286) e pronta; falta o "pode publicar".
- [ ] **PRÓXIMA · parte 2: kit e papéis do envio nas coletas de água** (CONTINUAR seção 2).
- [ ] **Imprimir pela folha aberta ("Escrever nesta folha") não avisa o Cwork de "preenchido"** (observação do ITEM 286).
- [ ] **Cadeias em Word (BIOAGRI, H2O):** em espera; o Elias vai refazer em planilha no Vértice.

## C. Pedidos pequenos e perguntas ao Elias
- [ ] **Tema do Vértice:** hoje o Vértice tem o próprio Claro/Escuro, separado do Cwork (no documento aberto pelo Cwork não há botão para trocar). Quer que siga o tema do Cwork?
- [ ] **Tarefas no Cwork:** o Cwork não liga "Conferir quando terminar" ao passar tarefa (o EFClaudian liga sozinho). Quer a caixinha no formulário do Cwork, desligada por padrão?
- [ ] **Abas do Vértice:** o teto ficou em 10 abas ao mesmo tempo (memória do aparelho). Serve, ou quer outro número?
- [ ] **Trocar o nome do usuário:** cada pessoa troca o próprio em Meu perfil, ou só o Principal (como hoje)?
- [ ] **Item 44:** tirar "N amostras" da barra das tabelas no celular?
- [ ] **Rótulos por laboratório:** os modelos no Vértice ("até quinta") prontos? Anexar em Coletas › Laboratórios.
- [ ] Senha mínima: 8 (hoje) ou 15?

## D. O Elias confere (Firebase e uso real)
- [ ] **Etapa 1 no ar (v0.6.41 + Vértice v0.6.75), roteiro curto das regras:** (1) no PC, com a sua conta: Vértice Docs › crie uma planilha › Arquivo › Documento interno › Etiquetas; em Documentos internos, a coluna Nuvem chega em "Na nuvem · versão 1"; (2) no celular ou em outro navegador, com a sua conta, o mesmo documento aparece em Documentos internos › Etiquetas; (3) com uma conta de Colaborador, abrir pelo Cwork: só as pastas liberadas em Administração › Pastas do Vértice; (4) se algo der "negado", dizer em que passo. Também: Administração › Sobre mostra 0.6.41.
- [ ] **Depois da P5 no ar:** o menu Vértice Docs abre o endereço novo; um arquivo antigo do Vértice continua lá; no celular, desinstalar o ícone antigo do Vértice (o novo abre pelo Cwork).
- [ ] **Regras v0.6.36 (publicadas):** se ainda não rodou os 17 testes do GUIA-SIMULADOR-v0.6.36.md, rodar e dizer o resultado.
- [ ] **v0.6.38 no ar (primeira com aviso):** no PC e no celular instalado, a janela "Versão nova do app" aparece sozinha; "Depois" leva ao pé do menu; "Atualizar" volta na mesma tela.
- [ ] **v0.6.38 · regra e SDK:** entrar com a conta, abrir telas com dados, abrir o Vértice e um PDF; Administração › Sobre: "Firebase (SDK) 13.4.0" e "Regra de segurança: ligada · nada barrado". Se aparecer "barrou", me diga.
- [ ] **v0.6.38 · abas antigas:** quem tiver duas abas do EFCwork abertas no PC verá a nova esperar com o aviso "Outra aba ou janela do EFCwork ainda está na versão anterior…" até atualizar ou fechar a outra.
- [ ] Almoxarifado › Entrada com um Colaborador no EFClaudian (regras da v0.6.33 coladas em 26/11).
- [ ] Via assinada (foto) numa remessa e abrir a mesma remessa em outro aparelho.
- [ ] Site publicado mostra v0.6.36; o menu Vértice Docs abre em tela inteira com a conta, sem pedir senha; dois arquivos em duas abas; no celular, o voltar sai do Vértice.
- [ ] Numa tabela (Almoxarifado), buscar e marcar itens de três buscas; a janela do filtro não treme.
- [ ] Uma tarefa passada para você (Principal) conclui direto; uma parada em "Para conferir" tem Concluir.
- [ ] "Esqueci a senha" e primeiro acesso no Firebase real.

- [ ] **v0.6.39 no ar:** a janela "Versão nova do app" aparece; o botão dourado fica parado e o brilho passa uma vez quando o mouse chega (PC); letras um pouco maiores sem texto cortado no seu celular; no Escuro, título e linha da aba lisos e fundo sem roxo.

- [ ] **EFClaudian (decisão de 27/11: descontinuar ou adaptar ao Cwork):** dizer se alguém ainda usa no dia a dia; isso define o cuidado ao mudar o formato dos dados e as regras.

- [ ] **v0.6.40 no ar:** Coletas › Cadastros abre as 6 listas; cadastrar um laboratório com endereço e ver o rótulo em Envio › Laboratórios; editar uma fazenda; desativar e reativar um talhão de teste. Dizer se alguém ainda cadastra pelo EFClaudian.

- [ ] **Etiquetas de verdade (v0.6.43):** no Vértice, criar a sua planilha da etiqueta (igual à do EFClaudian, com o cabeçalho escrito, uma por laboratório se quiser) na pasta Etiquetas; marcar os campos em Arquivo › Campos do Cwork; ligar em Coletas › Cadastros › Modelos de etiqueta; imprimir pelo ícone em Amostras. Dizer se a letra (Helvetica no Vértice, Cambria no EFClaudian) incomoda.

- [ ] **Kit (v0.6.44):** em Coletas › Envio › Laboratórios, trocar cada papel antigo pelo do Vértice (lixeira e Anexar papel); imprimir os papéis de uma remessa e conferir que a ficha sai preenchida.

## E. Defeitos abertos
- [x] **Imagem do Excel saía como linha de assinatura com "Picture" na impressão do Vértice:** corrigido na v0.6.78 (ITEM 278).
- [x] **Quadro preso em "Subindo para a nuvem" (27/11 12:00):** correção Cwork v0.6.42 + Vértice v0.6.77 aprovada (ITENS 270 e 271) e publicada. Falta: o Elias abre Documentos internos no aparelho do print escuro e manda o motivo que aparecer.
- [x] **Abrir de novo pelo Cwork podia trocar o modelo do Vértice pelo arquivo antigo do Cwork** (vinha da v0.6.16; achado na revisão da etapa 2): corrigido na v0.6.76 (em aprovação).
- [ ] **`t_v0633` oscila** às vezes no passo "o pedido ficou anotado neste aparelho" (passa ao repetir).
- [x] **Teste do calendário (`t_v050`):** corrigido em 27/11 (só o teste).
- [x] `t_v050` corrigido enviado ao GitHub (8b8af0b).
- [x] `features.csv` e registros enviados (4e4d11f).
- [ ] **Regra de segurança (CSP) nos apps irmãos (revisor da v0.6.38):** Vértice, Sabiá e EFClaudian estão no mesmo endereço (eliasgrigori.github.io) e sem regra; um script posto num deles alcança o Cwork e o login guardado no aparelho. Pôr regra igual neles (cada um na sua conversa) e, a longo prazo, um endereço próprio para o Cwork.
- [ ] **Não voltar o SDK do Firebase para o 10.12.0:** depois da v0.6.38 o banco do aparelho está no formato 18; uma versão com SDK antigo abre sem cache e o que foi gravado sem internet fica parado. Se a regra quebrar algo no site, corrigir com versão nova.
- [ ] **Voltar do celular com várias abas do Vértice (revisor, v0.6.35):** se o Vértice criar passos no histórico, o voltar anda primeiro o quadro mais recente, que pode estar escondido. Testar no celular de verdade.
- [ ] `t_v067` "as datas do mês aparecem marcadas": falha também na v0.6.33 em 26/11 (ligado à data). Anterior à v0.6.34.
- [ ] **Almoxarifado: ajuste e saída com vários lotes gravam um por um (só lido, revisor da v0.6.37):** sem internet, recarregar ou fechar o app no meio deixa parte sem gravar. Corrigir gravando em lote (`Data.lote`).
