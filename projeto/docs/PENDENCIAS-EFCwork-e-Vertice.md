# Pendências · EFCwork e Vértice Docs (lista viva)

Arquivo pedido pelo Elias em 26/11/2026 11:41: tudo o que fica para outra conversa ou para o fim, para nada ficar para trás. Atualizado a cada mudança e enviado junto. Marque [x] quando estiver feito.

Última atualização: 26/11/2026 21h15 · v0.6.37 (aviso de versão nova) publicada. Próxima: CSP e SDK.

## A. Para a conversa do Vértice (o Elias leva)
- [ ] **O código do Vértice mora agora em `efcwork/vertice/fonte/`** (depois de publicada a P5): a conversa do Vértice clona o efcwork e publica na pasta `vertice/`. Está na memória do Vértice (registro de 26/11, 16:57).
- [ ] **Nota `NOTA-DO-CWORK-para-o-Vertice-P3c-regras.md`** (P3c): o formato que as regras aceitam na P4 (ficha, `versaoPartes`, pedaços um por gravação, ler por id para conta comum, testar consulta em lista).
- [ ] **Nota `NOTA-DO-CWORK-para-o-Vertice-P3-respostas.md`**: porta sem `contaTeste`; `recursos` novo; 3 perguntas (limpa o estado na troca de conta? a navegação cria passos no voltar do celular? nomes dos caches do sw).
- [ ] **Modo de teste sem login** (decisão de 26/11 10:12): nada vai para o Firebase, tudo fica só no aparelho.
- [ ] **ITEM 195 · acesso "documento"** (26/11 11:41): a porta agora manda `acesso` ('completo' ou 'documento') e `salvar` (true só para Principal e Líder ★). Com `acesso: 'documento'`, a pessoa só entra pelo documento ligado (o que o Cwork abriu), edita e imprime, mas **não salva** e não navega pelo resto do Vértice.
- [ ] **ITEM 195 · pedir para editar e salvar:** uma opção que a pessoa aciona e que leva ao processo de edição e mudança de versão (quem aprova: Principal ou Líder ★). Desenhar com o Elias; o Cwork pode receber esse pedido (aviso/aprovação) numa versão futura.
- [ ] **ITEM 196 · ninguém abaixo de ★ salva:** Secundário e Visitante editam, mas não salvam (`salvar: false`).
- [ ] **ITEM 196 · planilhas protegidas:** com células travadas, quem não é ★ só mexe nas células desbloqueadas; só Líder ★ e Principal usam "Desproteger".
- [ ] **Alça dourada (`menu-alca`, App.jsx/estilo-base.css):** fica em cima dos números das linhas da planilha e se estica quando o Elias mexe nas linhas. Sugestão: dentro do Cwork (classe `em-cwork`), a alça só aparece numa faixa de 6 px na borda ao passar o mouse, ou some e o menu abre pelo botão do alto.
- [ ] **Vários Vértices abertos ao mesmo tempo (feito no Cwork na v0.6.35, até 10 abas):** o Vértice deve mandar a mensagem 'arquivo' também quando abre um documento pelo Cwork (#/abrir), para o Cwork saber que a aba já tem arquivo. dois Vértices no mesmo aparelho não podem gravar o mesmo arquivo ao mesmo tempo (aviso "aberto em outra aba" ou só leitura na segunda), e cada um avisa o nome do arquivo dele.
- [ ] **pastas() (P3b, v0.6.35):** a porta devolve, por pasta, { nome, ler, editar, salvar }; o Vértice mostra só as pastas com ler, e só salva onde salvar = true; avisa quando recebe `cwork:usuario`.
- [ ] **ITEM 184 (v0.6.33) · PDF preenchido de volta:** `NOTA-DO-EFCWORK-para-o-Vertice-pdf-preenchido.md`. Precisa do contrato EFD v2 nos dois repositórios no mesmo dia, junto com a P4, com ordem do Elias.
- [ ] **P4 · documentos na nuvem:** gravar e abrir arquivos (`vtd_arquivos`, `vtd_partes`); tudo o que for arquivado no Cwork aparece no Vértice (PDF; Word e planilha abrem no Vértice para editar e imprimir); o que o Elias edita, posta ou remove no Vértice atualiza sozinho no Cwork.
- [ ] **Ligações futuras (item 1.8 do pedido):** preencher formulário, abrir procedimento, programações no Kanban do Vértice com relatórios no fichário do Cwork.

## B. Para esta conversa (Cwork), na ordem aprovada
- [x] **P3b · Administração › Pastas do Vértice**: feita e publicada na v0.6.35.
- [x] **v0.6.35 · tela inteira com abas (OPÇÃO 2, ITEM 201):** feita e testada; aprovada (ITENS 207 a 211) e publicada.
- [x] **Tarefas · "Conferir quando terminar" (pedido 26/11 14:18):** corrigido no Cwork (Principal conclui direto; parada ganha Concluir/Conferido); aprovado (ITEM 212) e publicado. A correção no EFClaudian é da outra conversa.
- [x] **Filtro da coluna (pedido 26/11 14:24):** janela parada ao marcar e escolha em várias buscas; aprovado (ITENS 213 e 214) e publicado.
- [x] **"Não vejo ícone" (ITENS 198, 202, 203):** eram as imagens da página de aprovação que não carregavam (defeito do montador, corrigido); o app estava certo.
- [x] **P3c · regras do Firestore**: aprovadas; app publicado (v0.6.36); regras publicadas por você (26/11 19:02).
- [x] **P5 · Vértice dentro do efcwork**: publicada em 26/11 (efcwork 84e1ddc, EFCdocs 12f2466).
- [ ] **ITEM 185 · ícone do Vértice no menu:** o Elias vai mandar o print do ícone que quer.
- [x] **Aviso de versão nova (v0.6.37):** aprovado (226 = janela no meio; "Depois" leva ao pé do menu) e publicado em 26/11.
- [ ] CSP e SDK · limpeza visual · `features.csv` · Cadastros de Coletas (por último).
- [ ] Estudo de rapidez (`ESTUDO-rapidez-EFCwork-v0.6.33.md`): só depois da integração.
- [x] Janela por cima: virou a tela inteira com abas (v0.6.35); a área ao lado do menu saiu.

## C. Pedidos pequenos e perguntas ao Elias
- [ ] **Tarefas no Cwork:** o Cwork não liga "Conferir quando terminar" ao passar tarefa (o EFClaudian liga sozinho). Quer a caixinha no formulário do Cwork, desligada por padrão?
- [ ] **Abas do Vértice:** o teto ficou em 10 abas ao mesmo tempo (memória do aparelho). Serve, ou quer outro número?
- [ ] **Trocar o nome do usuário:** cada pessoa troca o próprio em Meu perfil, ou só o Principal (como hoje)?
- [ ] **Item 44:** tirar "N amostras" da barra das tabelas no celular?
- [ ] **Rótulos por laboratório:** os modelos no Vértice ("até quinta") prontos? Anexar em Coletas › Laboratórios.
- [ ] Senha mínima: 8 (hoje) ou 15?

## D. O Elias confere (Firebase e uso real)
- [ ] **Depois da P5 no ar:** o menu Vértice Docs abre o endereço novo; um arquivo antigo do Vértice continua lá; no celular, desinstalar o ícone antigo do Vértice (o novo abre pelo Cwork).
- [ ] **Regras v0.6.36 (publicadas):** se ainda não rodou os 17 testes do GUIA-SIMULADOR-v0.6.36.md, rodar e dizer o resultado.
- [ ] **Na v0.6.38 (primeira com aviso):** no PC e no celular instalado, a janela aparece sozinha; "Depois" leva ao pé do menu; "Atualizar" volta na mesma tela.
- [ ] Almoxarifado › Entrada com um Colaborador no EFClaudian (regras da v0.6.33 coladas em 26/11).
- [ ] Via assinada (foto) numa remessa e abrir a mesma remessa em outro aparelho.
- [ ] Site publicado mostra v0.6.36; o menu Vértice Docs abre em tela inteira com a conta, sem pedir senha; dois arquivos em duas abas; no celular, o voltar sai do Vértice.
- [ ] Numa tabela (Almoxarifado), buscar e marcar itens de três buscas; a janela do filtro não treme.
- [ ] Uma tarefa passada para você (Principal) conclui direto; uma parada em "Para conferir" tem Concluir.
- [ ] "Esqueci a senha" e primeiro acesso no Firebase real.

## E. Defeitos abertos
- [ ] **Voltar do celular com várias abas do Vértice (revisor, v0.6.35):** se o Vértice criar passos no histórico, o voltar anda primeiro o quadro mais recente, que pode estar escondido. Testar no celular de verdade.
- [ ] `t_v067` "as datas do mês aparecem marcadas": falha também na v0.6.33 em 26/11 (ligado à data). Anterior à v0.6.34.
- [ ] **Almoxarifado: ajuste e saída com vários lotes gravam um por um (só lido, revisor da v0.6.37):** sem internet, recarregar ou fechar o app no meio deixa parte sem gravar. Corrigir gravando em lote (`Data.lote`).
