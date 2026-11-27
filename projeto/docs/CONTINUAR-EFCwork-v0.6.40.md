# EFCwork · CONTINUAR (27/11/2026) · NO AR: v0.6.40 (Coletas › Cadastros)

Substitui o CONTINUAR-EFCwork-v0.6.39.md. Quem ler só este arquivo sabe o que fazer.

## 0. Estado
- **v0.6.40 (Coletas › Cadastros) PUBLICADA em 27/11** (efcwork commit fc4afcc; `sw.js` no site com `efcwork-0.6.40`). ITENS 239 a 254 aprovados (1ª rodada: 239, 243, 244, 246, 247, 248; 2ª rodada: 249 a 254). Último ITEM usado: 254.
- O que tem: `src/cadcol.js` (prefixo cc): lista retrátil no alto (Talhões · Análises · Laboratórios · Tipos de coleta · Fazendas · Pontos de água), tabelas sem faixa de grupo, gaveta com lápis e lixeira (desativar com motivo, Reativar), Reajustar preços nas Análises, laboratório e fazenda com cadastro completo (endereço em `labInfo` e em `fazendas[]`), chaves travadas depois de criadas, prefixo da fazenda só ao criar. O lápis de Envio › Laboratórios abre o cadastro do laboratório.
- **Decisão de 27/11 04:54:** o EFCwork é o foco; o EFClaudian vai ser descontinuado ou adaptado. Não prender telas a ele; não mexer no código dele; dados e regras do Firebase continuam os mesmos.
- **Regra nova (27/11):** antes de toda página de aprovação, rodar a skill auditoria-visual-efc e a conferência `alinha` (ver `t_v0640.js`) em todo formulário, PC e celular. Não acrescentar função não pedida sem marcar como sugestão separada.
- **Toda entrega leva o pacote de conversa nova** (pedido de 27/11).
- Vértice v0.6.74 em `efcwork/vertice/` (não tocado).

## 1. TEXTO PARA COLAR NA CONVERSA NOVA

> EFCwork, continuando. Anexei o pacote único (EFCwork-PACOTE-NOVA-CONVERSA-v0.6.40.zip): CONTINUAR, dossiê, pendências, o app no ar e o fonte. Leia o CONTINUAR inteiro. Responda em 3 linhas: onde parou e qual é a próxima tarefa. Depois sugira o modelo e o esforço em **negrito** e espere meu "pode iniciar". Siga o "Padrão de trabalho" sem eu repetir. Repositório: EliasGrigori/efcwork (add_repo com envio; se negar, me diga e use o fonte do pacote). O Vértice está na pasta vertice/ do efcwork (o código é da conversa do Vértice; aqui só leitura). Não abra o OneDrive. Nada no EFClaudian. GitHub só com "pode publicar". Fique em primeiro plano. Toda entrega: o pacote único atualizado.

## 2. Próxima tarefa
**Etapa 1 (Vértice na nuvem) pronta, esperando as respostas** dos ITENS 255 a 258 (artefato https://claude.ai/artifact/5oERb6u9qFKDBUNxh74ChC). Cwork v0.6.41 + Vértice v0.6.75, NÃO publicados e NÃO no GitHub: o fonte do Cwork está no pacote (`fonte/`) e as mudanças do Vértice em `vertice-fonte-v0.6.75.patch` + arquivos novos (`vertice-fonte-novos/`). Esta conversa está AUTORIZADA a mexer no Vértice (27/11 07:22) para as 3 etapas. Ao publicar: Cwork como sempre; Vértice: `npm run build` em `vertice/fonte`, copiar `dist/` para `vertice/` (index.html, sw.js, manifest, ícones, `assets/` trocado, apagar os assets antigos), registrar na `MEMORIA-DO-PROJETO.md` do Vértice. Testes do Cwork que sobem o Vértice usam `VERTICE_DIR=<pasta montada>`. Depois: etapa 2 (modo documento, decisões no dossiê de 27/11 07:3x) e etapa 3 (Cwork apontando para o Vértice).

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
- Publicar: copiar de `dist/` para a raiz do repositório index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png; `git add` esses, `projeto/src`, docs e testes (nunca `dist/`; `projeto/dist` está rastreado no git, então desfazer com `git checkout -- projeto/dist` depois de copiar para a raiz); commit com os trailers da sessão; `git push origin HEAD:main`. Não mexer em `vertice/`.
- Página de aprovação desta versão: `tools/visual/v0637/cap.js` e `monta.py` (as 5 formas foram filmadas com o protótipo; o código atual tem só a escolhida).

## 5. Padrão de trabalho (o que ele amou; não perder)
1. Sugerir modelo e esforço em **negrito**; esperar "pode iniciar".
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
2. Ligação com o Vértice (P4, documentos na nuvem): depende da conversa do Vértice. Lista em PENDENCIAS.

## 7. Decisões em aberto (perguntar uma por vez, na hora certa)
- Senha mínima: 8 (hoje) ou 15.
- Tirar "N amostras" da barra das tabelas no celular (item 44).
- Caixinha "Conferir quando terminar" no formulário de tarefa; teto de 10 abas do Vértice; quem troca o nome do usuário.

## 8. Peças que se reaproveitam
- Tabela `tbHTML`; gavetas `gvAbrir`; fichas `LC_FORM.<tipo>` com `lcAbrir`, `lcPe`, `lcBl`, `lcErro`; ações `DD_AO.<prefixo>`; `ddHTML`; confirmação `csConfirma`; dados `Data.col/lote/semPendentes`; avisos `Notif.send`; auditoria `Audit.log`.
- Todo dado em HTML passa por `esc()` (`t_html_seg`).

## 9. Firebase
Nada a configurar na v0.6.40 (cadastros usam os documentos e as regras que já existiam).

## 10. Armadilhas
- `projeto/dist` rastreado no git está velho (0.6.34): **montar antes de testar**, inclusive depois de um `git checkout -- dist`.
- `t_v067` falha por datas (antigo, ABERTO). `t_v0636v` precisa do clone antigo do EFCdocs (variável do teste). `t_v034` e `t_v0635f` podem falhar em paralelo e passam sozinhos.
- O registro do sw só acontece em https; em teste local, registrar à mão (ver `t_v0637.js`).
- Texto de botão cortado no celular: rótulo curto. Linha larga na tabela: esconder colunas por padrão.
