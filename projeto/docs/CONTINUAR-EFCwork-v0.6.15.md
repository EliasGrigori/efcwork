# Continuar o EFCwork numa conversa nova (14/11/2026, 19h)

## TEXTO PARA COLAR NA CONVERSA NOVA
> Vamos continuar o EFCwork (PWA de arquivo único da família EFClaudian). Anexei o ZIP da versão, o CONTINUAR e o dossiê. Leia o CONTINUAR primeiro e siga o "Padrão de trabalho" dele sem eu repetir: sugerir modelo e esforço em negrito antes de cada tarefa e esperar meu "pode iniciar"; páginas de aprovação fracionadas (um item por mudança); tudo no dossiê; ao final resumo, Firebase, próximos passos e o ZIP; GitHub só com "pode publicar"; OneDrive só se eu pedir pelo nome; só EFCwork, nada no EFClaudian. Próxima tarefa: (diga qual).

## Onde parou
- **v0.6.15.1 PUBLICADA** (14/11, 19:49; ITENS 39 e 40 do celular aprovados + regras do Firebase). Antes: **v0.6.15 PUBLICADA** (14/11, 16:37) no GitHub: EliasGrigori/efcwork, main, commits 85ee2c6 (v0.6.15.1), bc42a4c (versão) e 92f2eb4 (docs). `VERSAO` = 0.6.15. Conferir no site que o rodapé mostra v0.6.15 (não consegui abrir da sessão).
- Varredura partes 1 a 3 e página final (ITENS 25 a 38): tudo **Aprovado** e aplicado. Bateria 49 arquivos, 0 falhas; medidor 0 defeitos.
- Pacote do Vértice Docs entregue (`vertice-layout-v0.6.15.zip`).
- **Tarefa 1 feita e publicada na v0.6.15.1:** `projeto/docs/REGRAS-FIREBASE-EFCwork-v0.6.15.md` + `tools/testes/t_regras_cobertura.js` (45 ok) + `docs/regras-cobertura-v0.6.15.log`.

## Tarefa 2 (feita, aprovada e publicada na v0.6.15.1)
- ITEM 39 (ícone do EFClaudian sobe para a linha do caminho no celular) e ITEM 40 (botões da fileira com a mesma largura). Página: artefato "EFCwork v0.6.15 · celular: cabeçalho" (docs/aprovacao-efcwork-v0.6.15-celular.html).
- Bateria 49 arquivos, 0 falhas; t_v0615e.js (14 ok).

## Próximas tarefas (já escolhidas por ele, 19:04)
1. **Tarefa 4 · Treinamentos: revisão pelo uso** (próxima, aguardando o "pode iniciar") (Sonnet 5.5 · alto): rever o módulo da v0.6.12 na demo com dados reais, ajustar e propor melhorias.
- Em aberto, não escolhidas: ITENS 6/7 da varredura v0.6.8 (limite de 3.000 em Coletas/Água; fotos de ação vencidas; Opus 5.5 · alto). v0.6.11 (ponte com o Vértice) e v0.6.13 (preencher sozinho) dependem do Docs.

## Padrão de trabalho (o que ele amou, manter sempre)
**Fluxo de cada tarefa**
1. Sugerir modelo e esforço em **negrito** e esperar "pode iniciar".
2. Uma frase dizendo o que vai fazer, lista de tarefas, trabalho em primeiro plano (nada em segundo plano/agendado).
3. Implementar + testar (bateria `tools/testes/t_*.js`, medidor `tools/auditoria/medir.js --estrito`, auditoria visual da skill auditoria-visual-efc).
4. Página de aprovação antes de aplicar qualquer mudança visual (ver abaixo). Só aplica o que ele aprovou.
5. Tudo registrado no dossiê (DOSSIE-EFCwork-vX.md) e no CONTINUAR.
6. Entrega: o ZIP da versão (index.html, sw.js, ícones, manifest) em toda entrega + dossiê + CONTINUAR, com resumo final: o que mudou, **o que conferir no Firebase**, próximos passos.
7. GitHub: só com "pode publicar", a cada vez. Trailer de commit com Co-Authored-By e Claude-Session.

**Página de aprovação**
- Número grande do ITEM; Aprovado/Reprovado + comentário; imagens que ampliam (HOJE/PROPOSTA); antes/depois do app de verdade; movimento mostrado com o app real; botão "Copiar respostas"; fracionada (uma mudança por item). Referências reais da internet quando for decisão de design.

**Regras visuais**
- Sem "cara de IA" (sem emoji, sem gradiente/brilho enfeite, sem KPI decorativo). Botões lado a lado alinhados (mesma linha, altura e largura). Um único filtro recolhível; menus de coluna estilo Sankhya. Esc volta uma camada por vez; tela sem permissão some. Movimento só pela escala (40, 80, 150, 250, 350, 400, 500 ms).

**Proibições**
- Não abrir nem tentar o OneDrive sem ele pedir pelo nome. Nada no EFClaudian. Não citar os prints antigos do repositório público.

## Como refazer as páginas
`python3 tools/montar.py`; em `tools/visual/moderno-v0615/pagina/`: `captura*.js` e `node monta-pagina.js itens-pN.js` (com `NODE_PATH=$(npm root -g)`). A página final compara v0.6.14.2 (pasta "antes") com o `dist/` atual.

## Firebase
Nada novo além dos campos em `sv2_rodizio.liberadas` (porId, porSup, aprovadoPor/Id/Em, recusadaPor/Id/Em, recusaMotivo). Detalhes e trechos de regra no documento REGRAS-FIREBASE-EFCwork-v0.6.15.md.
