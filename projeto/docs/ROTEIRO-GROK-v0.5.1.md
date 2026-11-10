# Roteiro do Grok — EFCwork v0.5.1 (retorno do Grok v0.4.11)

**Testar sem tocar em dados reais:** `?demo=1` (pode usar a cópia do backup real no modo demonstração). Conta real: só abrir a tela de entrar e, se o Elias passar o login, só entrar e olhar.

## NÃO SÃO DEFEITOS
- Selo do reCAPTCHA escondido na tela de entrar (decisão: fica assim).
- No celular, tocar no fundo escuro em cima da barra de cima (busca, tema, sino), do menu de baixo, de um campo de digitar ou de uma linha da tabela só fecha o menu (de propósito).
- No PC não há fundo escuro: o clique fora já fazia a ação desde a v0.4.11.

## Bloco A — Menu da coluna no celular (390, toque) — refaz o A2 da v0.4.11
A1. Materiais: abrir o menu de uma coluna (folha de baixo). Tocar uma vez em **Saída** (por cima do fundo escuro): o menu fecha e a gaveta Saída abre no mesmo toque.
A2. Igual com **Entrada** e **Contagem**.
A3. Igual com uma aba da página (ex.: Movimentações em Almoxarifado, ou as abas de Documentos), quando a aba estiver visível acima da folha.
A4. Menu aberto e tocar numa linha da tabela que esteja acima da folha: só fecha o menu; o 2º toque abre a gaveta da linha.
A5. Menu aberto e tocar no fundo em cima da busca do topo: só fecha (a busca não abre).
A6. Menu aberto e botão voltar do celular: fecha só o menu. Depois de abrir a Saída pelo toque do A1, o voltar fecha só a gaveta.
A7. Repetir A1 no PC (1366, mouse): continua 1 clique.

## Bloco B — Tela de entrar num navegador novo (refaz o achado do B1 da v0.4.11)
B1. Abrir https://eliasgrigori.github.io/efcwork/ num navegador novo (sem dados), PC e celular: aparece **Entrar** (usuário ou e-mail + senha), rodapé v0.5.1. Não pode aparecer "Primeiro acesso".
B2. Anotar o console: se o App Check der 403 no navegador-robô, a tela continua sendo Entrar.
B3. (Só se o Elias passar o login) entrar na conta real e só olhar o Início.

## Retorno
Uma linha por passo: OK / FALHOU / PARCIAL / NÃO TESTADO, com o que viu e o print quando falhar.
