# Roteiro para o Grok — EFCwork v0.6.5 (Coletas › Água)

**App:** https://eliasgrigori.github.io/efcwork — **Opções › Sobre** deve dizer **v0.6.5**. Use **`?demo=1`**. Na demonstração, cadastre antes: 3 bebedouros (Inspeções › Cloro), 1 caixa d'água (Documentos › Caixas d'água) e, se der, uma análise de Água (senão a Nova coleta avisa que falta).
Responda **ok** ou **não**; se não, o que apareceu, o aparelho e o print.

## 1. Aba
1.1 Coletas tem as abas Amostras · Água · Programação · Envio · Cadastros?
1.2 Na Água aparece a caixa "Rodízio dos bebedouros" com Próxima (dia e hora) e quais bebedouros?
1.3 A tela tem só as caixas e a tabela? Havendo pendência, o botão "Acompanhamento (N)" no topo abre uma gaveta com as recoletas, ações corretivas e laudos atrasados?
1.4 Cadastre um bebedouro novo (Inspeções › Cloro): na Água, a caixa do rodízio passa a mostrar ele como o próximo, junto com o que está há mais tempo sem coleta? Na Nova coleta ele vem marcado e dá para trocar por outro?

## 2. Nova coleta de água
2.1 Botão "Nova coleta de água": abre a gaveta com 1 Tipo, 2 Onde, 3 Coleta? O Tipo é uma lista retrátil?
2.2 Rodízio: os 2 bebedouros há mais tempo sem coleta já vêm marcados? Lance: entra uma linha por bebedouro?
2.3 Lance de novo: o tipo sugerido passa a ser Mesclada (todos juntos, uma linha só)?
2.4 Avulsa: sem ponto pede o ponto? "Outro ponto" pede o nome? Data de amanhã é recusada?

## 3. Detalhe, envio e resultado
3.1 Toque numa linha: abre o detalhe com o ciclo (Coletada, Enviada, O.S, Resultado, Compra do serviço)?
3.2 Informar envio com data antes da coleta: recusa? Com data certa, O.S e nº da solicitação: grava e o ciclo avança?
3.3 Registrar resultado › Não conforme: sem agente pede o agente; sem gravidade pede a gravidade? Com os dois: grava, chega o aviso no sino e aparece "Recoleta" no Acompanhamento?
3.4 Tocar no aviso do sino abre o detalhe da coleta?
3.5 Nova coleta: o tipo já vem Recoleta? Lançada, ela some do Acompanhamento?
3.6 Numa coleta conforme de bebedouro: Pedir recoleta com motivo curto recusa; com motivo, entra no Acompanhamento?
3.7 Lixeira (canto de cima): cancelar sem motivo recusa; com motivo, fica "Cancelada" na tabela?

## 4. Prazos e geral
4.1 Engrenagem › Prazos da água: 99 recusa; 3 dias grava e um laudo com mais de 3 dias do envio passa a "Laudo atrasado"?
4.2 No EFClaudian (mesma conta), as coletas lançadas aqui aparecem na aba Água, e o rodízio não fica como "atrasado"?
4.3 Nada arrasta para o lado no celular? Claro e Escuro legíveis? Algum erro vermelho?
