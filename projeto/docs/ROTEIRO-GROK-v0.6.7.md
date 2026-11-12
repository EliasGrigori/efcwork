# Roteiro para o Grok — EFCwork v0.6.7 (projetos de coleta de água e pontos de água)

**App:** https://eliasgrigori.github.io/efcwork — **Opções › Sobre** deve dizer **v0.6.7**. Use **`?demo=1`**.
Antes: cadastre 3 bebedouros (Inspeções › Cloro), 1 caixa d'água (Documentos › Caixas d'água) e duas análises de Água no EFClaudian, se der.
Responda **ok** ou **não**; se não, o que apareceu, o aparelho e o print.

## 1. Pontos de água (Coletas › Cadastros)
1.1 A aba Cadastros mostra "Pontos de água"? "Novo ponto de água" cadastra um Canal (tipo Outro), um Poço e um Açude?
1.2 Nome repetido é recusado? Desativar um ponto: aparece "Inativo" e ele some da coleta avulsa?

## 2. Criar um projeto (Coletas › Água › caixa "Novo projeto")
2.1 O editor tem 6 passos? Sem nome, sem ponto ou sem análise: recusa com a mensagem certa?
2.2 Rodízio com "pontos por vez" maior que os pontos marcados: recusa?
2.3 Crie "Canal — mensal": Canal + Poço, todos os pontos, 2 análises, Repete "Mensal (a cada 4 semanas)". A caixa mostra "mensal (a cada 4 semanas)" e as 2 análises?
2.4 Marque um bebedouro que já está no rodízio, com a mesma análise: aparece o aviso de ponto repetido e "Salvar mesmo assim"?

## 3. Detalhe e ações
3.1 Tocar na caixa abre o projeto com as datas? A primeira tem Confirmar / Remarcar / Não vai ter (e Lançar, se for hoje ou já passou)? Os botões ficam alinhados, mesma largura?
3.2 Remarcar para ontem recusa; para daqui a 10 dias, com motivo, aparece "era …" e Remarcada?
3.3 No Rodízio dos bebedouros, remarcar diz que as seguintes contam da nova data?
3.4 Não vai ter, com motivo: a próxima passa a ser a data seguinte?
3.5 Lançar: a Nova coleta vem como Projeto, com os pontos e as análises marcados? Lança uma coleta por ponto e por análise?
3.6 Editar › Repete "Trimestral": a caixa passa a dizer trimestral? Lixeira › Desativar com motivo: a caixa some?

## 4. Geral
4.1 O Plano de coleta (Coletas › Programação › cartão do plano) continua abrindo normal?
4.2 Nada arrasta para o lado no celular? Claro e Escuro legíveis? Algum erro vermelho?
