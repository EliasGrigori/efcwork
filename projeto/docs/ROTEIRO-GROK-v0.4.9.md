# Roteiro do Grok — EFCwork v0.4.9 · SOMENTE: desprogramar, reprogramar e criar novo rodízio

**Como testar sem tocar em dados reais:** abrir o app com `?demo=1` (cria uma conta de teste na hora). Na conta real, só olhar, não clicar em Criar/Desprogramar. Testar no PC e no celular.
**Quem pode:** Colaborador, Líder, Líder★ e Administrador podem programar, reprogramar e desprogramar. **Só Líder★ e Administrador** criam plano novo.

## NÃO SÃO DEFEITOS
- Desprogramar não apaga nada que já foi coletado. A área só volta para "Faltam" no plano.
- Área já **coletada** no período não aparece para reprogramar nem desprogramar.
- Programação feita direto no EFCwork (sv2_prog) não some: fica na lista como "cancelada" (motivo "Desprogramada"). Programação que mora dentro do plano (formato do EFClaudian) é retirada do plano.
- Plano novo nasce vazio, sem nenhuma programação.

## Bloco A — Desprogramar (página do plano)
A1. Abrir um plano com áreas programadas (azul/atrasada). Tocar numa área programada: aparece a barra de baixo "1 marcada · Reprogramar · Desprogramar 1 · Lançar coletadas".
A2. Tocar em "Desprogramar 1": abre confirmação "Desprogramar RUxx?" com o dia. Cancelar não muda nada.
A3. Confirmar: aviso "RUxx desprogramada." A área volta para "Faltam" (sem a data) e some da tabela da Programação.
A4. Marcar duas ou mais áreas programadas: "Desprogramar 2" desprograma as duas de uma vez.
A5. Marcar uma área que **não** está programada: o botão Desprogramar não aparece (só Programar).
A6. Conferir em Administração › Auditoria: ação "desprogramar_plano" com as áreas e o dia que tinham.

## Bloco B — Desprogramar (tela Programação)
B1. Coletas › Programação: tocar numa linha pendente. Na gaveta, no canto de cima, aparece a **lixeira** "Desprogramar" (não existe botão de texto no rodapé).
B2. Tocar na lixeira, confirmar: a gaveta fecha, a linha some da tabela e a área volta para "Faltam" no plano.
B3. Linha já coletada ou cancelada: sem lixeira.

## Bloco C — Reprogramar
C1. No plano, marcar **só** áreas já programadas: o botão da barra e o título da gaveta viram "Reprogramar".
C2. Escolher outro dia e outro coletor e salvar. A área continua programada, agora no novo dia/coletor (sem precisar desprogramar antes).
C3. Misturar área programada e área que falta: o botão fica "Programar" e programa as duas (as já programadas recebem o novo dia).
C4. Se a área tinha programação direta (sv2_prog), a antiga fica cancelada com motivo "Reprogramada no plano".

## Bloco D — Novo plano de coleta (novo rodízio)
D1. Coletas › Programação: botão **"Novo plano"** ao lado de "Coleta avulsa" (só Líder★/Administrador). Colaborador e Líder comum não veem.
D2. A gaveta tem 3 partes: 1 · O plano (Tipo, Frequência, Ano, "Copiar áreas e análises de"), 2 · Áreas (busca, Marcar todas, Limpar), 3 · Análises.
D3. Escolher um plano existente em "Copiar áreas e análises de" preenche áreas e análises dele.
D4. Criar com o mesmo tipo + frequência + ano de um plano ativo: aviso "Já existe o plano …" e não cria.
D5. Sem áreas: "Marque pelo menos uma área." Sem análises: "Marque pelo menos uma análise."
D6. Frequência **Quinzenal**: pede "Primeira segunda-feira". **Coleta única**: pede Início e Prazo (prazo não pode ser antes do início).
D7. Criar: aviso "Plano … criado." e abre direto a página do plano novo, com todas as áreas em "Faltam" e 0% coletado.
D8. O plano novo aparece no cartão de planos da Programação e em Ajustes pode ter análises e áreas mudadas.
D9. Auditoria: ação "criar_rodizio".
D10. Celular: a gaveta ocupa a tela, sem rolar para o lado, botão Criar plano sempre visível embaixo.

## O que conferir no Firebase (se algo falhar só na conta real)
- Regras de `sv2_rodizio`: Colaborador precisa poder **atualizar** (progs); Líder★/Administrador precisam poder **criar** documento novo.
- Regras de `sv2_prog`: atualizar situação para "cancelada".
