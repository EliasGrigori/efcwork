# EFCwork · CONTINUAR (27/11/2026 11:05) · NO AR: Cwork v0.6.41 + Vértice v0.6.75 (etapa 1) + Vértice v0.6.76 (etapa 2) · AGORA: etapa 3

Substitui o CONTINUAR-EFCwork-v0.6.40.md. Quem ler só este arquivo sabe o que fazer.

## 0. Estado
- **Etapa 1 PUBLICADA em 27/11 09:32** (efcwork `1e6a059`): Cwork v0.6.41 (porta `nuvem` em `src/vertice.js`) + Vértice v0.6.75 (sincronia com a nuvem). ITENS 255 a 258 aprovados. Build e deploy do GitHub com sucesso; a versão servida pelo site não foi conferida daqui.
- **Etapa 2 APROVADA (ITENS 259 a 269, todos) e PUBLICADA em 27/11:** Vértice v0.6.76, modo documento. Feita no Sonnet 5.5 · alto e revisada inteira no Opus 5.5 · alto. Página: `docs/aprovacao-vertice-v0.6.76-modo-documento.html` (artefato https://claude.ai/artifact/Xx6fNcY6MxZdWZA2PtBU6p). O Cwork não mudou (só testes). Último ITEM usado: 269.
- **Autorização (27/11 07:22):** esta conversa mexe no código do Vértice (`efcwork/vertice/fonte`) para as 3 etapas: (1) nuvem, (2) modo documento, (3) Cwork apontando para o Vértice.
- **Decisões do Elias de 27/11** (todas no dossiê): todos os documentos moram só no Vértice, o Cwork só liga e abre (06:59); sobe para a nuvem só o que está numa das 5 pastas (07:3x); arquivo aberto pelo Cwork: ninguém salva, só escrever, sem menus, na orientação do modelo, três pontos com "Atualizar documento" (07:3x).
- **Regra (27/11):** antes de toda página de aprovação, skill auditoria-visual-efc e a conferência `alinha`; função não pedida só como sugestão separada.
- **Toda entrega leva o pacote de conversa nova.**

## 1. TEXTO PARA COLAR NA CONVERSA NOVA

> EFCwork, continuando. Anexei o pacote único (EFCwork-PACOTE-NOVA-CONVERSA-v0.6.41.zip): CONTINUAR, dossiê, pendências, o app no ar e o fonte. Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" sem eu repetir. Repositório: EliasGrigori/efcwork (add_repo com envio; se negar, me diga e use o fonte do pacote). Esta conversa pode mexer no Vértice (vertice/fonte) para as 3 etapas. Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano. Toda entrega: o pacote único atualizado.

## 2. Próxima tarefa
**Etapa 3 (Opus 5.5 · alto, autorizada 27/11 11:3x):** Cwork apontando para o Vértice. Começar por uma proposta com página de aprovação para o pedido do Elias: **etiquetas das amostras automáticas como no EFClaudian** ("senão eu perderia muito tempo editando cada campo"), com vários tipos de etiqueta, feitas no Vértice. Depois: Impressos e kit abrem o documento do Vértice; `efd_docs` muda uma vez para as 5 pastas. Observações da etapa 2: o pedido imprime todas as abas; o que chega do Cwork fica em "Recebidos do Cwork" e não sobe.
- **ORDEM (27/11 11:28): não inventar documento nenhum (ficha, modelo, formulário) sem a autorização dele antes.** Planilha de teste só perguntando antes, e marcada "(exemplo)".

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

**Proibições:** não abrir nem tentar o OneDrive sem ele pedir pelo nome; nada no EFClaudian; não falar dos prints antigos do repositório público; dado real, senha e chave nunca entram no projeto; regras do Firestore são compartilhadas com o EFClaudian (alto risco).

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

