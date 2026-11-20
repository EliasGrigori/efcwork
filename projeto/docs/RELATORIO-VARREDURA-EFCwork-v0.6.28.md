# EFCwork v0.6.28 · Varredura de segurança, Método Sabiá e "sem cara de IA"
Feita em 20/11/2026, 15h a 16h, com Sonnet 5.5. Nada no app foi alterado: a versão continua 0.6.28.

## 0. Resumo em três linhas
1. **Onde parou:** v0.6.28 publicada (Cadastros do Almoxarifado e Meu dia com rotinas). A próxima da fila do Elias é Backup e exportação.
2. **Segurança:** o código do app está limpo (XSS, segredos, eval, links). Os pontos fracos estão no acesso (senha e "Esqueci a senha") e nas regras do Firebase, que não impõem o que o app proíbe.
3. **Proposta:** 10 fragilidades e 6 ajustes visuais, agrupados em versões pequenas (seção 6). Sugiro uma versão pequena de Acesso e senha antes do Backup, porque hoje quem esquece a senha fica sem saída.

## 1. Como foi feita e o que NÃO deu para provar
Conferido por mim, nesta sessão, rodando de verdade:
- O app publicado (efcwork-v0.6.28.zip) é byte a byte igual ao que o montador gera do fonte (mesmo SHA-256 do index.html e do sw.js).
- Sintaxe: `node --check` em todos os 97 arquivos de `src/`, 0 erros.
- Segurança do HTML (`t_html_seg`): 200 nomes conhecidos, nenhum dado entra no HTML sem `esc()`, nenhum `<img src>` sem `esc()` ou `imgSrc()`.
- Cobertura das regras (`t_regras_cobertura`): 50 ok. Testes de alto risco: `t_v0626` (Pessoas) 27 ok, `t_v0628` (cadastros e tarefas) 28 ok, `t_v0624` (aprovações) 14 ok.
- Medidor visual estrito (`medir.js`, 32 telas, PC e celular, claro e escuro): 0 defeitos, 0 decisões, 142 ajustes.
- Buscas no código: eval, new Function, document.write, handlers inline, `window.open`, `target=_blank`, postMessage, segredos, e-mails, CPF, CNPJ e telefones.

NÃO deu para provar:
- Console do Firebase: regras publicadas hoje, App Check em modo "exigir", restrição da chave web, uso da cota (Firestore › Uso).
- Navegador real com Firebase real: CSP, troca do SDK e as regras novas só se provam lá.
- EFClaudian e EFC-Claude-Base: o `add_repo` foi negado pelo sistema de permissões desta sessão e eu não tentei contornar. Por isso não conferi `VERSOES.md` nem `RECOMENDADOS.md`.
- A bateria completa de 64 arquivos (rodei 5 arquivos mais o medidor).
- Revisor novo (agente sem a conversa): não existe nesta sessão. Ver M5.

## 2. Segurança

### 2.1 O que está bem
- Nenhum segredo. Só a chave web do Firebase e a chave pública do App Check, públicas por desenho. O e-mail pessoal que o kit achou em 11/11 não está mais no fonte nem nos documentos.
- Zero `eval`, `new Function`, `document.write` e handlers inline. Todo `window.open` e `target=_blank` leva `noopener`.
- O `imgSrc()` só aceita `data:image`, `blob:` e `https:` e escapa o resultado (logo, foto da entrada).
- Regras: `delete` negado em tudo, coleção não listada negada, conta de teste isolada, `sv2_bugs` restringido na v0.6.20, imagens com teto de tamanho.

### 2.2 Fragilidades (da mais séria para a mais leve)

**S1 · Alta · A autorização mora só no app, as regras não a impõem.**
Evidência (regras e código):
- `sv2_rodizio` aceita `update` de qualquer `lanca()`. O app trata uma liberação como válida se tiver `aprovadoPor` ou `porSup: true` (programacao.js:98 a 102). Um Colaborador com o console aberto grava `porSup: true` e pula a aprovação do Líder ★ decidida em 14/11. A chave do Firebase é pública, então "console aberto" é fácil.
- `sv2_alm_itens`: a regra de criar diz `liderOuPrincipal() || lanca()` e a de alterar diz `lanca()`. O app (v0.6.28, almcad.js:8) deixa só Líder ★ e Administrador cadastrar material.
- `sv2_tarefas`: a regra deixa criar com `respId` de qualquer pessoa. O app diz que o Colaborador cria só para si (tarefas.js:5).
- `sv2_aprov`: quem cria o pedido escolhe o `paraIds` e pode decidi-lo. O efeito do pedido (cancelar coleta, corrigir lançamento) é gravado em outra operação que `lanca()` já permite. A aprovação é um fluxo de tela, não uma barreira.
- `sv2_notifs`: qualquer usuário ativo avisa `todos`.
Risco real: baixo a médio numa equipe pequena e de confiança, mas é a base da auditoria e do "quem aprovou".
Atenção: as regras são do mesmo projeto do EFClaudian. Apertar a regra do rodízio muda o comportamento dele (lá o secundário sem ★ libera direto), e o Elias decidiu "nada no EFClaudian". Precisa da decisão dele.
Proposta: versão própria "Regras do Firestore" (campo a campo para rodízio e almoxarifado; `paraIds` validado e quem pede não decide o próprio pedido; contador `sv2_bugs_seq` com salto máximo). Provar no Simulador de regras do console com dois logins (Colaborador e Líder ★).

**S2 · Alta (disponibilidade) · "Esqueci a senha" não tem saída.**
- entrar.js:143 mostra "Peça ao Administrador para trocar a sua senha". Mas Pessoas não troca a senha de outra pessoa (limite escrito na v0.6.26: precisa de servidor).
- `Data.auth.recuperar(email)` existe em base.js:310 e não é chamado por nenhuma tela. Antes da v0.6.23 o link levava ao EFClaudian; ao tirar os links, o único caminho de recuperação sumiu.
- Pessoas cria a conta só com o e-mail interno do login (sem e-mail real), então nem o e-mail de redefinição funcionaria.
Proposta: campo "E-mail para recuperar" no cadastro de pessoa (grava `sv2_login` como o EFClaudian) e o link "Esqueci" chamando `recuperar()`. Sem e-mail cadastrado, o texto diz isso de forma honesta. Sem servidor, é o único jeito.

**S3 · Média · Política de senha inconsistente e sem troca no primeiro acesso.**
- A entrada e o primeiro acesso exigem 8 caracteres (entrar.js:62 e 132). O cadastro de pessoa e Meu perfil aceitam 6 (pessoas.js:78 e 142).
- A senha inicial é digitada em campo de texto visível e nada obriga a pessoa a trocá-la (o EFClaudian tinha `precisaCompletar`; o EFCwork não grava nem lê esse campo).
Proposta: 8 em todo lugar; gravar `precisaCompletar: true` na criação e pedir a troca no primeiro acesso (as regras já aceitam esse campo no próprio cadastro).

**S4 · Média · Origem compartilhada entre os apps.**
EFCwork, Vértice, Sabiá, EFClaudian e EFCquiz estão em eliasgrigori.github.io. A caixa de troca (IndexedDB e BroadcastChannel) e a janela do Vértice (iframe sem sandbox) dependem disso. Qualquer falha de XSS em QUALQUER um dos apps lê o IndexedDB, onde o Firebase guarda a sessão, e os dados dos outros.
Mitigação viável agora: CSP por `<meta>` com o hash do script inline calculado no `montar.py` (não há handlers inline nem eval, então dá), mais `connect-src`, `frame-src`, `img-src`, `object-src 'none'` e `base-uri 'none'`. Só se prova no navegador com Firebase e reCAPTCHA reais.
Decisão de longo prazo (do Elias): um endereço por app. Custo: quebra a caixa de troca, que exigiria nova ponte.

**S5 · Média a baixa · Link do impresso só é validado ao gravar.**
impressos.js:153 e 170 põem `d.link` num `<a href>` e só `impressos.js:334` exige `https://`, na gravação. As regras não validam. Um Líder (ou uma conta de Líder comprometida) pode gravar `javascript:` pela API, e o clique de outro usuário, inclusive do Administrador, executa script na origem do app.
Proposta de uma linha: só renderizar e abrir o link se casar `^https://` (e o mesmo no kit).

**S6 · Baixa a média · Aba antiga continua gravando.**
Em 20/11 uma aba aberta havia horas na v0.6.18 deu "permissão negada" falsa (as regras estavam certas). Já estava anotado no dossiê como ideia, não feito.
Proposta: aviso "Há versão nova, recarregue" (compara a `VERSAO` com o sw/index no ar) e erro de permissão dizendo em qual coleção.

**S7 · Baixa · SDK do Firebase 10.12.0.** O app usa a 10.12.0 e a atual do JavaScript é a 13.2.0 (firebase.google.com/support/releases). As bibliotecas "compat" que o app usa já não são recomendadas daqui para frente (firebase.google.com/docs/web/modular-upgrade). Planejar a troca em versão própria, testada em Firebase real.

**S8 · Baixa · Abuso de cota e enumeração.**
- `sv2_login` com `get` público: dá para descobrir se um login existe e qual e-mail está ligado a ele.
- `sv2_recup`: criação sem login, com tamanho limitado.
- `sv2_bugs_seq`: qualquer usuário ativo pode subir o contador para um inteiro enorme e travar a numeração.
- Plano grátis: 20 mil gravações por dia.
O que fecha: App Check em "exigir" e a chave web restrita a eliasgrigori.github.io (referrer). O Elias confere no console. O contador entra na versão das regras.

**S9 · Média (continuidade) · Backup.**
Sem backup no EFCwork, o plano grátis do Firestore não tem backup gerenciado, e "nada apaga" protege de exclusão, não de sobrescrita. O backup do EFClaudian provavelmente não cobre o que só o EFCwork usa (`efd_docs`, `efd_partes`, `sv2_tarefas`, `sv2_treinos`, `sv2_resumos`, `sv2_impressos`, `sv2_envio_imp`, `sv2_cfg/almox` kits). A limpeza de fotos por LGPD só roda quando um Líder abre o app (TTL do Firestore ainda em aberto). É a tarefa 4 da fila e eu a recomendo.

**S10 · Baixa · O teste de segurança é aprovado pelo autor.**
A base do `t_html_seg` é "regravada" a cada versão por quem escreve o código. É a regra 4 do método (quem faz não aprova sozinho). Proposta: congelar a base e exigir uma linha de justificativa por nome novo no dossiê.

## 3. Método Sabiá (texto da habilidade carregada: "Método Sabiá 2.1")

### 3.1 O que o projeto cumpre
- Uma versão pequena por assunto; teste novo por versão e bateria completa; "o que não deu para provar" aparece em várias versões.
- Dado real nunca no projeto; página de aprovação fracionada com Aprovado/Reprovado e "Copiar respostas"; primeiro plano; dossiê e CONTINUAR a cada entrega; medidor estrito sem defeito em todas as versões.

### 3.2 Lacunas contra o método
- **M1 · Ligação com o EFC-Claude-Base não conferida.** Não consegui abrir o repositório. A habilidade desta sessão diz "2.1"; o registro de 19/11 fala em "2.1.1" aprovado. A habilidade da conta (ou o repositório) pode estar desatualizada. Verificar com `VERSOES.md`.
- **M2 · Faltam MEMORIA-DO-PROJETO.md e FICHA-DO-SISTEMA.md.** O dossiê e o CONTINUAR fazem o papel, mas sem as regras do dono numeradas e datadas e sem a ficha com metas e linha de base.
- **M3 · Linha de base das auditorias não formalizada.** Os "ajustes" do medidor foram 57 (v0.6.14.1), 60, 76, 80, 88, 90, 92 (v0.6.25) e 143 no arquivo da v0.6.28 (142 quando rodei hoje). O relatório da v0.6.28 diz "nenhum ajuste nos arquivos novos", mas o total subiu de 92 para 143. Não consegui conciliar (pode ser contagem diferente ou telas novas). O método manda que nenhuma medida de programa piore contra a linha de base aprovada.
- **M4 · Programas do kit ausentes.** `varredura-sensivel.py` e `medir-codigo.py` não estão em `tools/`; a avaliação de 11/11 ficou "proposta". Não há auditoria de rapidez com processador 4 vezes mais lento (só medições manuais do Grok em 14/11). A auditoria de código mede linhas por arquivo (maior: 624, dentro da meta), mas há linhas de mais de 1.000 caracteres (programacao.js, almox.js, plano.js) que escondem tamanho.
- **M5 · Sem revisor novo desde 14/11.** O último retorno do Grok registrado é da v0.6.14.2. Desde então foram 13 versões. As v0.6.24 (aprovações), v0.6.26 (Pessoas: contas e perfis) e v0.6.28 (dados do Almoxarifado e tarefas) tocam acesso e dados, o que o método classifica como alto risco, e saíram sem página de aprovação (por autorização do Elias) e sem revisor novo (que o método pede independente da autorização). Os roteiros do Grok das v0.6.14.1 e v0.6.14.2 seguem sem enviar.
- **M6 · Faltam os "dois números por versão"** (tempo gasto e defeitos achados depois da entrega). Os defeitos existem (o t_v0619 que dependia do relógio, o susto de permissão), mas não são contados.
- **M7 · features.csv desatualizada.** Tem o formato antigo (`funcao,area,prioridade,original,efcwork,destino,notas`, não o do Sabiá), 6 linhas quebradas por vírgula sem aspas e ainda lista como "must não" coisas já entregues: Sino de avisos, Registro de atividade, Impressão A4/PDF, Pessoas/Equipe, Relatórios › Documentos, Análise da NC. É a conferência de desvio que o método pede.
- **M8 · O próprio método cobre só parte do "sem cara de IA".** A auditoria visual do Sabiá tem emoji, maiúsculas espaçadas, sombra e borda, cor forte e frases que explicam ícone. Não tem medida para gradiente, brilho que não para, texto com degradê nem travessão como separador. Isso hoje vive só no `medir.js` e na habilidade auditoria-visual-efc. Proposta: levar essas três medidas ao método (exige aprovação e publicação no EFC-Claude-Base).

## 4. Auditoria "sem cara de IA"
Resultado do medidor: **0 defeitos, 0 decisões** (reproduzido por mim). Zero emoji (a ★ de "Líder ★" é o vocabulário do app, não emoji), zero `transition: all`, zero sombra com desfoque de 20 px ou mais. As 142 observações são 23 grupos de cor escrita direto (papel impresso e entrada, justificáveis) e tamanhos de letra acima da meta de 7 (8 tamanhos em 45 telas/estados, 9 em 26 e 10 em 8).

Pontos que ainda merecem decisão do Elias (todos foram aprovados antes por ele; listo para ele rever se quiser):
- **C1 · Brilho que percorre todo botão dourado a cada 6 s, para sempre** (base.css:48, marcado como exceção aprovada), mais degradê, sombra dourada e realce interno. É o maior sinal de enfeite que sobrou. O botão também tem borda e sombra ao mesmo tempo, contra a regra "sombra ou borda, nunca as duas".
- **C2 · 30 gradientes no CSS.** A maioria é a entrada (modelo 4 aprovado). Dentro do app, no tema Escuro, o título da tela (`.cs-ph h1`) usa texto com degradê, a aba ativa usa `border-image` em degradê e o item do menu usa degradê. Texto com degradê é um sinal clássico.
- **C3 · Escala de letras.** 21 tamanhos distintos no CSS, incluindo 11,5, 12,5 e 13,5 (meios-tamanhos). Falta uma escala (por exemplo 12, 13, 14, 16, 18, 22, 28).
- **C4 · Travessão ' — ' ainda aparece em texto visível:** apont.js:170 e 171 (título do aviso de apontamento urgente e grave no sino) e 172 (resumo do registro). O Elias pediu em 20/11 (ITEM 79) para tirar esse separador; a v0.6.22 tirou quase todos e estes sobraram.
- **C5 · Cobertura do medidor.** O `efcwork.json` lista 32 telas, mas não vejo pelo nome: Entrar, Programação, Plano de coleta, Atividade, a faixa das janelas, o sino e a paleta de comandos. Confirmar se alguma está coberta por dentro de outra.

## 5. Pendências (consolidado)
Fila do Elias (CONTINUAR): 4 Backup e exportação; 5 Cadastros de Coletas por último.
Depois, da tabela do FALTA:
- Conversas (chat dentro de cada registro e sino); Perfis "Só ver / Ver e alterar" por área (a v0.6.26 tem perfil e áreas, mas não por área).
- Coletas: Etiquetas e fichas de campo, plano de rodízio, etiqueta da caixa d'água; a aba Nematoide (conferir na matriz).
- Almoxarifado: reajuste de preços, vidraria quebrada, transferências. Documentos: normas e editais, documento controlado, arquivo por ano.
- Vértice: Preencher sozinho (v0.6.13); resumo de treinamento do Sabiá chegando pela ponte; mandar ao Grok os roteiros v0.6.14.1 e v0.6.14.2.
Decisões do Elias em aberto: item 44 da TRIAGEM; "N amostras" no celular; TTL do Firestore nas fotos da ação; coluna Prazo da Programação vazia; ordem do Apresentar da Auditoria; Marcar na imagem do relato já enviado (item 49).
A conferir no Firebase/EFClaudian: valores `todo`/`doing` das tarefas (foram suposição na v0.6.28); regras de `sv2_alm_itens`, `sv2_alm_equip`, `sv2_cfg/almox` e `sv2_tarefas`; que o site no ar mostra v0.6.28.
Estacionadas por serem no EFClaudian: frequência mensal real, várias análises e tipo Canal da v0.6.7.

## 6. Propostas, em versões pequenas (uma por assunto, cada uma só começa com "pode iniciar")
| Versão | Assunto | Cobre | Modelo e esforço sugeridos |
|---|---|---|---|
| v0.6.29 | Acesso e senha | S2, S3, S5, C4 | **Opus 5.5 · esforço médio** (toca acesso: sobe um degrau) |
| v0.6.30 | Backup e exportação (já na fila) | S9 | **Opus 5.5 · esforço alto** (lê todas as coleções) |
| v0.6.31 | Regras do Firestore | S1, S8 | **Fable 5.2 · esforço alto**, com revisor novo e teste no Simulador |
| v0.6.32 | Aviso de versão nova e erro com a coleção | S6 | **Sonnet 5.5 · esforço alto** |
| v0.6.33 | CSP e SDK do Firebase | S4, S7 | **Opus 5.5 · esforço alto**, com Firebase real |
| visual | Limpeza "sem cara de IA" por página de aprovação fracionada | C1, C2, C3, C5 | **Opus 5.5 · esforço médio** |
| método | features.csv, linha de base, ficha e memória, medidas novas no método | M2, M3, M7, M8 | **Sonnet 5.5 · esforço médio** |
A revisão por revisor novo (M5) pode ser feita agora, sobre as v0.6.24, v0.6.26 e v0.6.28, pelo Grok ou por outro agente que nunca viu a conversa. Eu não conto como revisor novo.

## 7. O que o Elias confere no console do Firebase
- App Check: Firestore em "Exigir" (não só "Monitorar").
- Chave web: restrição por referrer para eliasgrigori.github.io (Google Cloud › Credenciais).
- Firestore › Uso: quanto do 1 GiB e das 20 mil gravações por dia já está em uso.
- Regras: copiar as publicadas para um arquivo antes de qualquer mudança e comparar com `REGRAS-FIRESTORE-EFCwork-v0.6.20-COMPLETAS.txt`.
- Authentication: a opção de redefinir senha por e-mail está ativa (necessária para a S2).
