# Roteiro do Grok — EFCwork v0.1.0 (casca)

**O que é:** primeira versão do EFCwork (rework do EFClaudian). Só a casca: entrar, menu, cabeçalho, temas, empresa configurável e Início. As áreas ainda levam ao EFClaudian.
**Endereço:** o que o Elias publicar (repositório novo `efcwork`). Para testar sem tocar em dados reais: acrescente `?demo=1` ao endereço.
**Regra:** conta real só para olhar. Testes que gravam: só no modo demonstração.

## NÃO SÃO DEFEITOS
- Áreas mostram "Esta área está sendo refeita…" e o botão "Usar no EFClaudian": é o esperado na v0.1.0.
- Busca e sino respondem "chega na v0.2".
- "Esqueci a senha" abre o EFClaudian.
- Só dois temas (Claro e Escuro dourado): decisão do Elias.

## Bloco A — Entrar (modo demonstração, aba anônima)
A1. Abra com `?demo=1`. **Esperado:** "Primeiro acesso" à direita e a ilustração agrícola (mamoeiros, sol, fileiras) à esquerda; no celular a ilustração fica em cima.
A2. Tente nome sem sobrenome, senhas diferentes e senha com menos de 8. **Esperado:** mensagem clara em cada caso, nada é criado.
A3. Crie Joana Silva / joana.silva / senha1234. **Esperado:** entra no Início com "Bom dia/Boa tarde/Boa noite, Joana".
A4. Sair (ícone no pé do menu) e entrar de novo; teste senha errada. **Esperado:** "Login ou senha incorretos."; "Lembrar usuário" preenche o usuário.

## Bloco B — Casca (PC 1280 px)
B1. Menu lateral: Início, Coletas, Rateios, Inspeções, Documentos, Almoxarifado, Qualidade, "Análise › Relatórios"; Administração e a pessoa no pé; "Cwork Quality · v0.1.0" embaixo.
B2. Abra cada área. **Esperado:** cabeçalho com caminho, título serifado com traço, abas sublinhadas (Coletas 4, Inspeções 3, Documentos 3, Almoxarifado 5, Qualidade 3; Rateios e Relatórios sem abas).
B3. Botão da lua/sol no topo. **Esperado:** Escuro = fundo azul-tinta com brilho dourado e trama; botão principal dourado com reflexo; título em degradê. Recarregue: o tema fica.
B4. Endereço: `#/almox/materiais` abre direto a aba certa; voltar do navegador funciona.

## Bloco C — Empresa
C1. Administração › Empresa: nome "Fazenda Exemplo", unidades "Unidade Sede" e "Unidade Norte" (uma por linha). Salvar. **Esperado:** nome e unidade no topo do menu e no pé da página.
C2. "Unidade deste aparelho": janela retrátil; trocar para Unidade Norte. **Esperado:** o menu mostra a nova unidade.
C3. Logo: escolher uma imagem PNG/JPG. **Esperado:** aparece no menu no lugar do broto; a lixeira tira a logo.
C4. Entre com um Secundário (se houver no modo demonstração). **Esperado:** campos travados e "só o Principal altera".

## Bloco D — Celular (384×790 ou 390×844)
D1. Nenhuma tela rola para o lado. Barra de baixo: Início, Coletas, Documentos, Almox., Mais.
D2. "Mais" abre o menu lateral; tocar fora ou Esc fecha.
D3. Alvos de toque com pelo menos 36 px.

## Bloco E — Só o Elias (conta real)
E1. Entrar com o login real. **Esperado:** mesmo usuário e senha do EFClaudian; nome e perfil corretos no pé do menu.
E2. Início: "Minhas tarefas" com as tarefas abertas dele (as mesmas do EFClaudian).
E3. Administração › Empresa: salvar o nome da empresa. **Se aparecer "O Firebase não deixou salvar (permissão)"**, as regras do Firestore precisam liberar `sv2_cfg/empresa` para o Principal — anotar e avisar o Claude.
E4. Console do navegador: nenhum erro vermelho.

## Outros erros para procurar
- Texto cortado no cabeçalho em telas estreitas; botões com alturas diferentes; algum nome da Meri Pobo aparecendo fixo.
