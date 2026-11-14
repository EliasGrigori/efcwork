# Pacote do layout v0.6.15 para o Vértice Docs

Montado em 14/11/2026 a partir do EFCwork v0.6.15 (respostas do Elias de 13:54). Tudo aqui foi testado no EFCwork e numa página de demonstração.

## O que fazer (3 passos)
1. Abra a conversa do Vértice Docs.
2. Anexe este ZIP inteiro.
3. Cole o texto de `TEXTO-PARA-A-IA-DO-VERTICE.md` (tudo abaixo da linha).

## O que tem dentro
| Arquivo | Para quê |
|---|---|
| `REGRAS-DE-LAYOUT.md` | As 14 regras (R1 a R14) em português simples, cada uma com "como conferir". |
| `TEXTO-PARA-A-IA-DO-VERTICE.md` | O pedido pronto para colar. |
| `codigo/efc-layout.css` | As peças visuais (tabela parada, selo do total, pílulas, gaveta, gota, esqueleto, botão dourado). |
| `codigo/efc-layout.js` | As peças de comportamento (travar a tela, guardar a rolagem, selo do total, ícones nas abas, carregar mais, rearrumar cartões, menu que desliza, busca suave, gota, anterior/próximo na gaveta). |
| `codigo/efc-movimento.css` e `.js` | A escala de movimento da família (o mesmo arquivo do EFCwork). |
| `codigo/demo.html` | Página que usa só as peças, com 230 documentos de mentira: abra no navegador para ver funcionando. |
| `imagens/antes-*.png` / `depois-*.png` | EFCwork v0.6.14.2 (antes) e v0.6.15 (depois): Materiais, Movimentações, Apontamentos e a gaveta do material. |
| `imagens/demo-*.png` | A demonstração (tabela filtrada e gaveta com a gota). |
| `referencia-efcwork/` | O código real do EFCwork que originou as peças (só para consulta) e o teste automático que prova as regras. |
| `REFERENCIAS.md` | De onde veio cada ideia. |

## O que foi conferido
- `demo.html` em 1280×800: tela parada, tabela até 16 px do fundo, 100 → 200 linhas sozinhas sem voltar ao topo, selo "R$ 4.704,50 em custos" → "R$ 1.578,50 · total filtrado", ícones na linha das abas, gota acendendo as 3 etapas, Alt + seta para baixo trocando o registro, zero erro no console.
- No EFCwork: suíte `t_v0615d.js` com 20 conferências (as mesmas regras), mais as suítes antigas atualizadas.

## Banco (Firebase)
Nada novo. As peças só mudam a tela. A gota guarda "até onde a pessoa viu" no navegador (localStorage), não no banco.
