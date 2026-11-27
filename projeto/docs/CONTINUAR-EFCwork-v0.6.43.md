# EFCwork · CONTINUAR (27/11/2026 14:4x) · NO AR: Cwork v0.6.43 + Vértice v0.6.78 (etapas 1, 2 e 3: etiquetas) · AGORA: kit por laboratório

Substitui o CONTINUAR-EFCwork-v0.6.42.md. Quem ler só este arquivo sabe o que fazer.

## 0. Estado
- **Etapa 3 PUBLICADA em 27/11 (Cwork v0.6.43 + Vértice v0.6.78, ITENS 272 a 279, todos aprovados).** Etiquetas das amostras automáticas, feitas no Vértice: Coletas › Cadastros › Modelos de etiqueta (material + laboratório → planilha da pasta Etiquetas do Vértice, em `sv2_cfg/coletas.etqVertice`); ícone de etiqueta em Amostras (lista filtrada), na gaveta da remessa e botão "Etiquetas" no aviso depois de "Coletado"; o Vértice monta as folhas (`#/pedido/et<pid>`, recurso `etiquetas` da porta; uma etiqueta por amostra repetida na folha do modelo); valores pelas regras do `etValor` do EFClaudian; cabeçalho escrito no próprio modelo (ITEM 277); nada se escreve na impressão (ITEM 279); imagem do Excel agora imprime (ITEM 278). Último ITEM usado: **279**.
- **Falta o Elias:** criar as etiquetas de verdade no Vértice e ligar (PENDENCIAS, seção D); abrir Documentos internos no aparelho que tinha o FLUX 0002 preso e mandar o motivo.
- **REGRAS de 27/11 (memória e dossiê):** NUNCA inventar documento, nem de teste; documento dele se copia fiel. Todo modelo de teste leva marca d'água "MODELO NÃO OFICIAL · SÓ PARA TESTE" (`tools/visual/v0643/amostras/gerar.py` faz assim).
- **Toda entrega leva o pacote de conversa nova.**

## 1. TEXTO PARA COLAR NA CONVERSA NOVA

> EFCwork, continuando. Anexei o pacote único (EFCwork-PACOTE-NOVA-CONVERSA-v0.6.43.zip): CONTINUAR, dossiê, pendências, o app no ar e o fonte. Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" sem eu repetir. Repositório: EliasGrigori/efcwork (add_repo com envio; se negar, me diga e use o fonte do pacote). Esta conversa pode mexer no Vértice (vertice/fonte). Nunca invente documento; modelo de teste com marca d'água. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano. Toda entrega: o pacote único atualizado.

## 2. Próxima tarefa
**Kit e Impressos apontando para o Vértice (Opus 5.5 · alto).** Pedido do ITEM 277 (27/11 14:29): cada laboratório escolhe o que o envio leva: ficha de envio, cadeia de custódia, as duas ou nenhuma; os documentos são do Vértice (o Cwork só liga e abre). Depois: o que está guardado no Cwork (`efd_docs`) muda uma vez para as 5 pastas do Vértice; observações da etapa 2 (o pedido imprime todas as abas do modelo; o que chega do Cwork fica em "Recebidos do Cwork" e não sobe). Começar por proposta com página de aprovação; nenhum documento inventado.

## 2a. O que a etapa 2 faz (Vértice v0.6.76)
- `#/abrir/<pid>` (o Cwork põe o arquivo na caixa) vira `#/documento/<id>[/<aba>]` com `location.replace`. Tela `ui/modoDocumento.jsx` (`TelaSemMenus`, `ModoDocumento`), lógica sem tela `planilha/modoDocumento.js` (campos = `celulaLivre` sem conta; escrever numa cópia; páginas pelo motor de impressão, que devolve o lugar de cada campo quando recebe `editavel`).
- Nada grava. "Atualizar documento" = `#/arq/<id>` (só quem salva; `login.semSalvar`). Quem tem `acesso: 'documento'` (`login.soDocumento`) nunca vê o editor. Pedido do Cwork e "Preencher e imprimir" do resumo sem menus.
- Versão nova: pela nuvem (`ficha.nuvem.versao`) ou pela mensagem `salvou` do canal `efcdocs-abas` de outra aba.
- `abrirDaCaixa` confere se o documento já existe pelo banco (`banco.backend.um`), não pela lista da tela.

## 2b. O que a v0.6.38 faz (CSP e SDK)
- `tools/montar.py`: `SDK = '13.4.0'` (um lugar só: index.html, sw.js e regra) e a regra CSP no alto do index.html, com o sha256 do único `<script>` inline. **Qualquer mudança no index.html depois da montagem quebra o app** (o script fica barrado): teste que cria versão de mentira tem de recalcular o hash (ver `rehash` em `t_v0637.js`).
- Script de fora (ataque) não roda. Estilos `style=` continuam (unsafe-inline só no CSS).
- Banco do aparelho do Firestore muda do formato 16 para 18 no primeiro uso; com aba antiga aberta, a nova espera e avisa. Voltar ao SDK 10.12.0 depois disso faria o app antigo não abrir o banco novo (ele tenta consertar o cache e recarrega; o que estiver só no aparelho se perde): **não voltar o SDK sem pensar nisso**.
- Novo endereço externo (script, quadro, conexão) precisa entrar na função `csp()` do montar.py e no t_v0638.

## 2c. O que a etapa 3 faz (Cwork v0.6.43 + Vértice v0.6.78)
- Cwork `src/etiquetas.js` (prefixo et); ganchos em cadcol.js, coletas.js, programacao.js, base.js/fluidez.js (aviso com botão de outro nome), vertice.js (recurso `etiquetas`), montar.py.
- Vértice `src/ponte/etiquetas.js` (motor, testado no node), `etiquetasUi.jsx`/`etiquetas.css` (tela), `camposUi.jsx` (grupo "Etiqueta da amostra"; nomes `efc_et_<campo>`), `imprimirLivro.js` (imagem imprime). App.jsx com 799 linhas (limite 800).
- Testes: `t_v0643` (Cwork + Vértice montados) e `testes/planilha/v0678.test.mjs`. Fotos HOJE: `tools/visual/v0643/hoje.js`; página: `tools/visual/v0643/pagina.py`.

## 3. O que a v0.6.37 faz
- Janela no meio quando há versão nova; "Depois", Esc, voltar ou toque fora deixam "Atualizar o app" no pé do menu (bolinha no botão do menu do celular). Procura versão ao abrir, ao voltar para o app (mínimo 5 min), quando a internet volta e a cada 30 min. Nada recarrega sozinho. "Atualizar" pergunta antes se há ficha ou rascunho não gravado, gravação pendente na nuvem ou abas do Vértice/Sabiá.
- Conserta: a versão nova guardava a tela antiga; abrir outro arquivo pelo endereço trocava a tela guardada.
- De 0.6.36 para 0.6.37 não aparece aviso (a 0.6.36 não tem a função).
- **Ao criar tela com rascunho fora de `S.fm`, incluir em `vnPreenchido()` (versao.js).**

## 4. Código
- `add_repo` (access push) funcionou em 26/11 21h; antes tinha sido negado. Se negar, dizer ao Elias.
- Sem repositório: descompactar o fonte (`fonte/src`, `fonte/tools`, `fonte/docs`) numa pasta vazia chamada `projeto`.
- Montar: `cd projeto && python3 tools/montar.py` (gera `dist/`). A versão fica em `VERSAO` (`src/base.js`); o cache do sw é `efcwork-<versão>`.
- Testes: `NODE_PATH=$(npm root -g) node tools/testes/t_*.js` (um por vez ou `xargs -P 3`, em dois lotes de comando, cada comando até 600 s). Depois: desfazer os prints regravados (`git checkout -- projeto/tools/testes/telas`).
- Medidor: `NODE_PATH=$(npm root -g) node tools/auditoria/medir.js tools/auditoria/efcwork.json --estrito` (0 defeitos).
- Publicar: copiar de `dist/` para a raiz do repositório index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png; `git add` esses, `projeto/src`, docs e testes (nunca `dist/`; `projeto/dist` está rastreado no git, então desfazer com `git checkout -- projeto/dist` depois de copiar para a raiz); commit com os trailers da sessão; `git push origin HEAD:main`. O Vértice (`vertice/`) só com a autorização de 27/11 07:22 (as 3 etapas); passos na seção 2.
- Página de aprovação desta versão: `tools/visual/v0637/cap.js` e `monta.py` (as 5 formas foram filmadas com o protótipo; o código atual tem só a escolhida).

## 5. Padrão de trabalho (o que ele amou; não perder)
1. Sugerir modelo e esforço em **negrito**; esperar "pode iniciar". **Lembrar de novo no começo de CADA tarefa e ao retomar depois de um resumo da conversa** (27/11 09:50: a etapa 2 foi feita no Sonnet porque não lembrei; ele pediu revisão de tudo).
2. Uma frase do que vai fazer; lista de tarefas; tudo em primeiro plano (nada em segundo plano nem agendado).
3. Provar o antes, implementar e testar: teste da versão, bateria, medidor `--estrito`, auditoria visual (skill auditoria-visual-efc); revisor novo quando o risco é alto.
4. Mudança visual passa por página de aprovação antes. Só aplica o aprovado.
5. Registrar tudo no dossiê, atualizar o CONTINUAR e as pendências (mandar o arquivo a cada mudança).
6. Entregar: ZIP da versão, dossiê, CONTINUAR e resumo final (o que mudou, o que conferir no Firebase, próximos passos, modelo e esforço em negrito, o que não deu para provar).
7. Avisar quando for hora de conversa nova e mandar tudo, sem OneDrive.

**Página de aprovação:** número grande do ITEM; Aprovado/Reprovado e comentário; imagens que ampliam (HOJE/PROPOSTA) do app de verdade; movimento em vídeo ou animação do app real; "Copiar respostas"; uma mudança por item; com dúvida visual, 5 ou mais modelos com "OPÇÃO N" grande; referências reais da internet.

**Regras visuais:** sem "cara de IA" e sem emoji; limpo e compacto; botões e campos lado a lado alinhados; um único filtro recolhível; menus de coluna estilo Sankhya; opção em janela retrátil; excluir é lixeira no canto; imprimir é só o ícone; Esc e voltar do celular uma camada por vez; tela sem permissão some; avisos sobem de baixo; movimento só pela escala 40, 80, 150, 250, 350, 400, 500 ms.

**Proibições:** **NUNCA inventar documento, nem como exemplo de teste (regra do Elias de 27/11 13:50, "última vez que falo"): não mudar campos, ordem, cabeçalho ou desenho; a etiqueta das amostras é IGUAL à do EFClaudian; todo modelo de teste leva marca d'água visível "MODELO NÃO OFICIAL · SÓ PARA TESTE" (27/11 14:00)**; não abrir nem tentar o OneDrive sem ele pedir pelo nome; nada no EFClaudian; não falar dos prints antigos do repositório público; dado real, senha e chave nunca entram no projeto; regras do Firestore são compartilhadas com o EFClaudian (alto risco).

## 6. Depois (cada uma só com "pode iniciar")
1. Relatórios › Coletas em aberto · Conversas · Etiquetas de campo · Só ver por área (a ordem é do Elias).
2. Etapa 3 da integração com o Vértice (Cwork apontando para o Vértice), depois da etapa 2 aprovada e publicada. Lista em PENDENCIAS.

## 7. Decisões em aberto (perguntar uma por vez, na hora certa)
- Senha mínima: 8 (hoje) ou 15.
- Tirar "N amostras" da barra das tabelas no celular (item 44).
- Caixinha "Conferir quando terminar" no formulário de tarefa; teto de 10 abas do Vértice; quem troca o nome do usuário.

## 8. Peças que se reaproveitam
- Tabela `tbHTML`; gavetas `gvAbrir`; fichas `LC_FORM.<tipo>` com `lcAbrir`, `lcPe`, `lcBl`, `lcErro`; ações `DD_AO.<prefixo>`; `ddHTML`; confirmação `csConfirma`; dados `Data.col/lote/semPendentes`; avisos `Notif.send`; auditoria `Audit.log`.
- Todo dado em HTML passa por `esc()` (`t_html_seg`).

## 9. Firebase
- Etapa 1 (no ar): as regras [R7] já estavam publicadas (v0.6.36); falta o roteiro curto no site (PENDENCIAS, seção D). Nada a configurar.
- Etapa 2: nada no Firebase (o documento aberto pelo Cwork não grava nada).

## 10. Armadilhas
- `projeto/dist` rastreado no git está velho (0.6.34): **montar antes de testar**, inclusive depois de um `git checkout -- dist`.
- `t_v067` falha por datas (antigo, ABERTO). `t_v0636v` precisa do clone antigo do EFCdocs (variável do teste). `t_v034` e `t_v0635f` podem falhar em paralelo e passam sozinhos.
- O registro do sw só acontece em https; em teste local, registrar à mão (ver `t_v0637.js`).
- Texto de botão cortado no celular: rótulo curto. Linha larga na tabela: esconder colunas por padrão.
- `t_v0633` procura `fonte/testes/amostras` dentro do `VERTICE_DIR`: para testar o Vértice montado, criar uma pasta com o `dist/` copiado e um atalho `fonte` → `vertice/fonte` (ex.: `/tmp/vd`). Ele oscila às vezes no passo "o pedido ficou anotado" (repetir).
- `t_v0636v` confere a pasta `vertice/` publicada contra o `package.json`: falha enquanto o Vértice novo não for copiado para `vertice/` (normal antes de publicar).
- Vértice: `App.jsx` com 798 linhas (limite 800). Para mudar algo lá, mexer na linha que já existe ou passar para um arquivo novo.

