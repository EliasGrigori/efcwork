# Texto para colar na conversa do Vértice Docs

(Copie tudo abaixo da linha e cole na conversa do Vértice, junto com o ZIP `vertice-layout-v0.6.15.zip` anexado.)

---

Oi! Vamos levar para o Vértice Docs o layout que aprovei no EFCwork v0.6.15 (14/11/2026). Anexei o pacote `vertice-layout-v0.6.15.zip`. Leia nesta ordem: `LEIA-PRIMEIRO.md`, `REGRAS-DE-LAYOUT.md` (R1 a R14), depois `codigo/` e `imagens/`.

O que quero:
1. Aplique no Vértice as regras R1 a R14, usando as peças prontas de `codigo/efc-layout.css`, `codigo/efc-layout.js` e `codigo/efc-movimento.css` (a escala de movimento da família). Elas já foram testadas no EFCwork e na `codigo/demo.html`. Ligue as variáveis `--efl-*` do topo do CSS aos tokens de cor do Vértice; não escreva cor solta.
2. Use as peças com o HTML do Vértice; não copie telas do EFCwork. A pasta `referencia-efcwork/` é só para consulta (é o código real que está rodando no EFCwork).
3. Em todas as tabelas do Vértice: tela parada e só a tabela rolando no PC (R1), sem "Mostrando X de Y" nem rodapé, tabela até o fundo, mais linhas carregando sozinhas (R2), total no selo do cabeçalho com "total filtrado" (R3), ícones de imprimir/planilha/colunas na linha das abas (R4), cabeçalhos com a mesma medida (R5).
4. Situação com bolinha + texto, caixa forte só no vermelho, em todas as abas e gavetas (R6). Nenhum cartão com faixa colorida na lateral (R7).
5. Gaveta: setas e X na linha de cima, título sem quebrar, anterior/próximo com Alt + setas (R8). Histórico de documento (criado, revisado, aprovado, vencimentos) com a linha do tempo da gota (R9).
6. Esqueleto ao carregar (R10), botão dourado com sombra nítida (R11), paleta Ctrl K com resultados suaves (R12), menu da coluna que desliza ao trocar de coluna (R13), movimento só da escala (R14).

Como trabalhar (meu padrão de sempre):
- Antes de começar, me sugira o modelo e o esforço em **negrito** e espere eu dizer "pode iniciar".
- Faça por partes, uma mudança por item, e me mande a página de aprovação: número do ITEM grande, Aprovado/Reprovado + comentário, imagens que ampliam, antes/depois do app de verdade, movimento mostrado com o app de verdade, botão "Copiar respostas".
- Antes da página de aprovação, rode a auditoria visual (1280 e 390 px, Claro e Escuro) e o medidor da família. Cada regra tem um "Como conferir": transforme em teste automático.
- Nada de emoji, ícones desenhados em SVG, sem "cara de IA". Botões lado a lado alinhados. Esc volta uma camada por vez. Tela sem permissão some.
- Não mexa no meu OneDrive a não ser que eu peça pelo nome. Só publique no GitHub quando eu disser "pode publicar".
- Registre tudo no dossiê do Vértice e entregue o ZIP da versão no fim, com resumo, conferências do Firebase (este pacote não cria campo novo no banco) e próximos passos.
