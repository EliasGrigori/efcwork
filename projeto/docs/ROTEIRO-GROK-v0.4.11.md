# Roteiro do Grok — EFCwork v0.4.11 (App Check + clique fora do menu)

**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só entrar e olhar; não gravar.

## NÃO SÃO DEFEITOS
- Rótulo do total mostra só "Total" (contagem na dica); A-Z em botão único; total em sequência antes dos ícones quando não cabe ao lado da coluna.

## Bloco A — Menu da coluna
A1. Abrir o menu de uma coluna (Materiais) e clicar numa linha da tabela: o menu fecha e a gaveta da linha **não** abre. Clicar de novo na linha: abre a gaveta.
A2. Menu aberto e clicar numa aba/botão da página: o toque funciona na hora (1 toque).

## Bloco B — Login (conta real, só entrar e olhar)
B1. Abrir o EFCwork v0.4.11 (rodapé da tela de entrar mostra v0.4.11); entrar com o login real. Entra e mostra o Início, sem a mensagem "não deu para ler o seu perfil (permissão)".
B2. Console do navegador sem erro de "Missing or insufficient permissions" nem de App Check.
B3. Com o EFClaudian aberto em outra aba, sair de um não derruba o outro.
B4. Anotar se aparece o selo/aviso do reCAPTCHA (deve ficar escondido; não é defeito se aparecer pouco).
