# Roteiro do Grok — EFCwork v0.4.10 (ajustes da auditoria visual)

**Testar sem tocar em dados reais:** `?demo=1`. Celular (ou janela com até 599 px de largura) e PC.

## NÃO SÃO DEFEITOS
- No PC os campos continuam com 34 px (só no celular sobem para 44 px).

## Bloco A — Celular
A1. Coletas › Programação › Coletado: Data da coleta, Coletores, Estádio e Observação com a mesma altura (44 px), lado a lado sem desalinhar.
A2. Novo plano: Tipo, Frequência, Ano e "Copiar áreas e análises de" com 44 px; ao abrir uma lista, cada opção com 44 px.
A3. Outras gavetas (Coleta avulsa, Programar, Saída de material): campos com 44 px e nada rolando para o lado.
A4. Tema escuro: mesma coisa, sem texto cortado.

## Bloco B — Plano
B1. Página de um plano: títulos "Faltam (N)" e "Coletadas (N)" em letra normal (sem MAIÚSCULAS espaçadas).

## Bloco C — Login separado do EFClaudian (conta real, só entrar e sair)
C1. Abrir o EFCwork v0.4.10: pede para entrar de novo (esperado, uma vez só).
C2. Com EFCwork e EFClaudian abertos em abas diferentes, sair do EFClaudian: o EFCwork continua logado e sincronizando.
C3. Sair do EFCwork: o EFClaudian continua logado.
C4. Lançar algo num e conferir no outro: os dados aparecem nos dois (mesma nuvem).
C5. Nenhuma das abas mostra "The client has already been terminated".
