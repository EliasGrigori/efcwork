# Roteiro do Grok — EFCwork v0.3.1 (ajustes pedidos pelo Elias)

**O que é:** tabelas mais largas e gaveta por cima; voltar uma camada por vez (Esc, X, voltar do celular) com aviso antes de descartar; nomes novos dos perfis; favoritos na Saída; tirar itens das listas segurando 1,5 s e arrastando para a lixeira.
**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar.

## NÃO SÃO DEFEITOS
- Com a gaveta aberta no PC, ela cobre parte da tabela e os botões Saída/Entrada do cabeçalho: foi pedido (a tabela não recua). Os mesmos botões estão no detalhe.
- Os nomes dos perfis mudaram só na tela (Administrador, Líder, Colaborador, Consulta). No EFClaudian continuam os antigos; o cadastro gravado é o mesmo.
- Favoritos da configuração que o EFClaudian usava "de fábrica" não aparecem: nada fixo de empresa. Os kits salvos na configuração aparecem.
- Tirar um motivo ou favorito da lista vale só para quem tirou.

## Bloco A — Largura (PC 1366 e 1920)
A1. Materiais: a tabela vai até perto da borda direita. Em 1920 px, sem faixa vazia à direita.
A2. Abra um material: a gaveta fica por cima; a tabela não muda de largura. Busca, tema e sino continuam visíveis em cima.

## Bloco B — Voltar uma camada
B1. Abra um material → Saída. Esc: volta ao detalhe. Esc: fecha. Repita com o voltar do navegador (e no celular, com o voltar do Android).
B2. Entrada → escolha um material → "Adicionar outro material" (lista). Voltar: volta para as linhas. Voltar de novo: pergunta antes de descartar.
B3. Busca (tecla /) e menu do celular: voltar fecha, e a tela continua a mesma.
B4. Depois de registrar uma saída aberta pelo detalhe: volta ao detalhe; UM voltar fecha o detalhe (não volta de tela).

## Bloco C — Aviso antes de descartar
C1. Formulário recém-aberto, sem mexer: fecha direto.
C2. Digite algo e volte: "Descartar o que você preencheu?". Continuar preenchendo mantém o texto; Descartar volta uma camada.
C3. Com a pergunta aberta, aperte voltar de novo: a pergunta fecha e o formulário fica.

## Bloco D — Favoritos
D1. Saída: "Favoritos" (lista suspensa) quando houver; escolher traz materiais, quantidades e motivo. Mude uma quantidade e registre: movimentações no mesmo grupo com o nome do favorito.
D2. "Saída de vários materiais": monte 2 materiais, marque "Guardar como favorito" (pede nome). Na próxima saída ele aparece na lista.
D3. Favorito seu: "Atualizar o favorito com estes materiais e quantidades".

## Bloco E — Tirar da lista segurando
E1. Abra a lista de motivos. Segure 1,5 s numa opção: aparece a lixeira ao lado (no celular, embaixo, dentro da tela). Arraste e solte: sai da lista, aviso com Desfazer.
E2. Soltar fora da lixeira: nada sai, nada é escolhido. Toque rápido: escolhe normalmente.
E3. No celular: enquanto arrasta, a lista não pode rolar.

## Bloco F — Perfis
F1. Pé do menu: Administrador / Líder / Colaborador / Consulta conforme a pessoa. Textos ("Como Colaborador…", "Pedir ao Líder") com os nomes novos.

## Outros erros para procurar
- Voltar que fecha duas camadas de uma vez, ou que troca de tela.
- Formulário que perde o que foi digitado sem perguntar.
