# Roteiro do Grok — EFCwork v0.4.8 (tabelas com menu em cada coluna)

**Testar sem tocar em dados reais:** `?demo=1`. Pode usar a cópia do backup real (Materiais com 59 itens). Conta real: só olhar. Fazer no PC (mouse) e no celular (toque).

## NÃO SÃO DEFEITOS
- Não existe mais o botão "Filtro: Todos". Os filtros prontos (Situação, Local, Tipo, Período…) estão dentro do menu da coluna correspondente.
- "Limpar filtro" só aparece com filtro ou busca **não travados**.
- Trava, ordem das colunas e colunas escondidas ficam guardadas **no aparelho** (outro aparelho começa do jeito padrão).
- Em Materiais só o Valor tem total (Utilizável e Mínimo misturam unidades diferentes).
- O filtro vale na hora; não há botão Aplicar.

## Bloco A — Barra e total
A1. Materiais: barra = (Limpar filtro, quando houver) · "N de M itens" · total · ícones colunas/planilha/impressora. **Não existe caixa de busca da tabela** nem faixa de total.
A2. Total na linha dos ícones: o quadradinho do valor fica exatamente acima da coluna Valor (mesma largura) e logo à esquerda vem "Total · N itens".
A2b. Arrastar a coluna Valor para outro lugar: o total vai junto. Colocar Valor como última coluna: o total fica em sequência antes dos ícones (não é defeito).
A3. Menu da coluna Item → buscar "CAIXA": total vira "do filtro · N itens" com a soma só desses itens. Conferir a soma de cabeça.
A4. Sem filtro, o total bate com o "R$ … em estoque" do cabeçalho.
A5. Amostras e Calibração: o total também fica na faixa, alinhado com sua coluna.

## Bloco B — Menu da coluna (PC)
B1. Passar o mouse no título: aparece a setinha; tirar o mouse: some (a não ser que a coluna tenha filtro/ordem/trava).
B2. Clicar no título ou na setinha abre o cartão "Coluna X": Ordenar, Filtros prontos (quando houver), Filtrar (busca + lista com caixinhas e quantidade), setas de mover, "Limpar esta coluna".
B3. Texto: "De A a Z / De Z a A / Ordem padrão". Número: "Menor para o maior / Maior para o menor" + campos De/Até. Data: "Mais antiga primeiro / Mais recente primeiro".
B4. Busca do menu: filtra a lista e a tabela; o cursor continua na caixa enquanto digita.
B5. Desmarcar um valor some com essas linhas; "Marcar todos" fica pela metade; marcar todos volta tudo.
B6. A lista de valores de uma coluna respeita os filtros das outras colunas (só mostra o que existe).
B7. Esc fecha só o menu; clicar fora fecha o menu sem abrir a linha clicada.
B8. O menu nasce colado embaixo da coluna, com a pontinha apontando para ela, nas colunas da esquerda, do meio e da ponta direita. Nunca vira painel lateral grudado no topo. Tela baixa: o miolo rola, com o nome da coluna e o rodapé sempre visíveis.
B9. Sem texto em maiúsculas espaçadas no menu; botão Travar com cantos iguais aos outros botões.

## Bloco C — Símbolos e trava
C1. Coluna filtrada: funil; ordenada: seta; travada: cadeado; título com sublinhado dourado.
C2. Travar: controles apagados + aviso "Destrave para mudar". Fechar e abrir o app: continua travado e filtrado.
C3. "Limpar filtro" limpa busca e colunas soltas, mas não a travada.
C4. Ordem travada numa coluna e tentar ordenar por outra: aviso dizendo onde está a trava.
C5. Destravar: volta a poder mudar; "Limpar esta coluna" funciona.

## Bloco D — Colunas
D1. Arrastar o título com o mouse: etiqueta segue o mouse e uma barra dourada mostra onde cai; soltar muda a coluna de lugar (não abre o menu).
D2. Setas ← → do menu também movem.
D3. Planilha (.xlsx) e impressão saem na nova ordem.
D4. "Escolher colunas" → "Voltar à ordem original das colunas".
D5. Esconder uma coluna com filtro: o filtro dela sai junto.

## Bloco E — Celular e tema
E1. Setinha sempre visível (mais clara). Tocar abre o menu de baixo, na largura da tela.
E2. Botão voltar do celular fecha só o menu.
E3. Tema escuro: menu legível, caixinhas douradas, sem texto cortado.
E4. Programação: títulos continuam centralizados.
E5. Rodar em todas as tabelas: Materiais, Movimentações, Solicitações, Equipamentos, Amostras, Envios, Programação, Calibração, Contagem.
