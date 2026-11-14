# Continuar o EFCwork numa conversa nova (14/11/2026, fim da tarde)

## Onde parou
- **Publicado no site:** v0.6.14.2 (commit 016dc3e). Nada da v0.6.15 foi publicado. `VERSAO` ainda 0.6.14.2 no código.
- **Decisão do Elias (12:21):** só EFCwork; nada no EFClaudian.
- **Já no app (src/), não publicado:** tudo da v0.6.15 (varredura, partes 1, 2 e 3 aprovadas) com os pedidos dos comentários de 13:54 aplicados:
  tela parada no PC e só a tabela rolando até o fundo; sem "Mostrando X de Y" nem rodapé; mais linhas carregam sozinhas; total no selo do cabeçalho ("total filtrado"); ícones da tabela na linha das abas; cabeçalhos com a mesma medida; pílulas bolinha + texto em tudo; setas e X acima do título da gaveta; gota em "Últimas movimentações" do material; paleta com resultados suaves; menu da coluna que desliza; cartões de Apontamentos que deslizam (FLIP) e sem traço colorido.
  Arquivos novos: `src/moderno.js`, `src/moderno.css` (último módulo do `montar.py`); mudanças em `src/tabela.js` (tbSobe, tbAltura, tbFimVigia), `src/almox.js` (gota), `src/casca.js`, `src/fluidez.js`.
- **Testes:** `t_v0615d.js` novo (20 ok) e 12 suítes antigas atualizadas para as decisões novas (lista no dossiê). Ver `docs/suite-v0.6.15-final.log`.
- **Pacote do Vértice Docs** entregue (`vertice-layout-v0.6.15.zip`): regras R1–R14, peças portáteis `efc-layout.css/.js`, demonstração, antes/depois e texto pronto para a IA do Vértice.

## Esperando resposta do Elias
- **Página final** `docs/aprovacao-efcwork-v0.6.15-final.html` (publicada como "EFCwork v0.6.15 · conferência final"): ITENS 25 a 38, todos já no app. Auditoria visual feita (2 defeitos corrigidos; ver dossiê).

## Quando ele colar as respostas
1. Anotar no dossiê item por item; o que vier Reprovado é desfeito ou refeito pelo comentário.
2. `sh tools/rodar-tudo.sh` (roda ~25 min: em primeiro plano, em lotes, se precisar), medidor.
3. Numerar `VERSAO` 0.6.15 e publicar só com "pode publicar". Entregar o ZIP da versão (index.html, sw.js, ícones, manifesto).
Refazer a página: `EFC_ANTES=<pasta do pacote de hoje cedo> node captura4.js` e `EFC_APP=dist/index.html node monta-pagina.js itens-p4.js` (em `tools/visual/moderno-v0615/pagina/`, com `NODE_PATH=$(npm root -g)`).

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
