# Continuar o EFCwork numa conversa nova (14/11/2026, fim da tarde)

## Onde parou
- **v0.6.15 PUBLICADA** (14/11, 16:37) no GitHub: EliasGrigori/efcwork, main, commit bc42a4c. Antes no ar: v0.6.14.2 (016dc3e). `VERSAO` = 0.6.15.
- Todas as respostas da varredura, partes 1 a 3 e da página final (ITENS 25 a 38) estão **Aprovadas** e aplicadas. Bateria: 47 arquivos, 0 falhas; medidor 0 defeitos.
- Decisão do Elias (12:21): só EFCwork; nada no EFClaudian.
- Pacote do Vértice Docs entregue (`vertice-layout-v0.6.15.zip`, também em `projeto/docs/vertice-layout-v0.6.15/`).
- Não consegui abrir o site da sessão: conferir no navegador que mostra v0.6.15.

## Próximos passos possíveis
1. Conferir o site no ar (v0.6.15) e as regras do Firebase (só campos novos em `sv2_rodizio.liberadas`).
2. Celular: ícone de abrir em outra janela sozinho numa linha nas telas com 3 botões (proposta pendente).
3. Pendências antigas: ITENS 6 a 9 da v0.6.8, v0.6.11 (ponte com o Vértice), v0.6.13 (preencher sozinho). O Vértice Docs vai aplicar o layout pelo pacote.

## Padrão que ele espera
- Antes de cada tarefa: modelo e esforço em **negrito**, esperar "pode iniciar".
- Página de aprovação: número grande do ITEM, Aprovado/Reprovado com comentário, imagem que amplia (HOJE/PROPOSTA), antes/depois do app de verdade, movimento com o app de verdade, "Copiar respostas". Uma mudança por item.
- Referências reais da internet. Tudo no dossiê. No fim: resumo, Firebase, próximos passos e o ZIP.
- Não mexer no OneDrive sem ele pedir pelo nome. Publicar no GitHub só com "pode publicar".

## Como refazer as páginas
`python3 tools/montar.py`; em `tools/visual/moderno-v0615/pagina/`: `captura*.js` e `node monta-pagina.js itens-pN.js` (com `NODE_PATH=$(npm root -g)`).
Atenção: as propostas de `tools/visual/moderno-v0615/moderno.js` agora estão todas no src/; a página final compara v0.6.14.2 (pasta "antes") com o `dist/` atual.

## Pendências abertas
- ITENS 6 a 9 da varredura da v0.6.8 (sem resposta); v0.6.11 (ponte com o Vértice) e v0.6.13 (preencher sozinho).
- Firebase: nada novo além dos campos dentro de `sv2_rodizio.liberadas` (aprovadoPor/Id/Em, recusadaPor/Id/Em, recusaMotivo, porId, porSup).
