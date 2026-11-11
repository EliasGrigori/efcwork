# Roteiro do Grok — EFCwork v0.5.3 (menu lateral retrátil e Total na linha dos botões)

Testar no `?demo=1` (pode importar a cópia do backup real). PC 1280 e 1366 com mouse; celular 390 com toque. Claro e Escuro.

## NÃO SÃO DEFEITOS
- No celular o menu continua como antes (☰ abre a gaveta); não há botão de alternar nem puxador.
- O brilho que passa no puxador a cada ~6 s é de propósito (está em aprovação).
- A forma do puxador pode ser trocada no teste com `Store.set('cw-pux','pa'|'pb'|'pc'); render()`; o padrão é 'pa'.

## Bloco A — Menu (PC)
A1. Abrir Almoxarifado › Materiais. No topo do menu: 3 pontinhos (o 1º é um tracinho) e o botão «. Passar o mouse no botão: dica "Mostrar só os ícones".
A2. Clicar: o menu encolhe para só ícones (~68 px) com animação; 2º pontinho aceso; passar o mouse num ícone mostra o nome da área ao lado. A tabela e o Total se ajustam.
A3. Clicar de novo: o menu sai da tela e aparece o puxador dourado no meio da borda esquerda, com animação de entrada. O conteúdo usa a largura toda.
A4. Recarregar a página: continua recolhido (gravado no aparelho).
A5. Passar o mouse no puxador: ele cresce e a seta aparece balançando. Clicar: o menu desliza por cima (itens entram um a um) e o fundo escurece de leve, sem empurrar a tabela.
A6. Esc: fecha só o menu por cima (a tela continua). Abrir de novo e clicar fora: fecha. Abrir de novo e escolher Documentos: abre Documentos e o menu recolhe.
A7. Abrir pelo puxador e clicar no botão do topo do menu (dica "Fixar o menu aberto"): o menu fica aberto como no início, sem trocar de tela; o botão voltar do navegador não volta para o menu flutuante.
A8. Repetir A1–A7 no Escuro. Anotar qualquer coisa que pisque, corte texto ou role para o lado.
A9. Com "reduzir movimento" ligado (emulação), nada anima e tudo funciona.

## Bloco B — Total (PC 1180, 1280, 1366)
B1. Materiais, Amostras, Calibração: o "Total" fica na MESMA linha dos ícones de colunas/planilha/impressora (antes, a 1280–1366, ficava numa linha só dele). Anotar se encosta nos ícones.
B2. No celular 390 nada muda no total.

## Bloco C — v0.5.2 (se ainda não testou): seguir ROTEIRO-GROK-v0.5.2.md.

## Retorno
Uma linha por passo: OK / FALHOU / PARCIAL / NÃO TESTADO, com o que viu e print quando falhar.
