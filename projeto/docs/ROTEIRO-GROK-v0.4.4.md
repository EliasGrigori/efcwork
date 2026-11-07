# Roteiro do Grok — EFCwork v0.4.4 (Coletas › Programação)

**Testar sem tocar em dados reais:** `?demo=1` (cadastre talhões, análises e uma programação de exemplo no console, como na suíte t_v044). Conta real: só olhar.

## NÃO SÃO DEFEITOS
- Nova programação, editar/cancelar programação e abrir o plano de coleta: continuam no EFClaudian (v0.4.5 / v0.4.6).
- Programação sem dia definido não aparece na tabela (só no plano e na lista do Coletado).
- A tabela não muda de ordem quando a situação muda; só quando você ordena pela coluna.
- Plano de coleta: o cartão ainda não abre (página do plano chega na v0.4.5).
- Área com o mesmo prefixo e número (RU35…) mostra mais dígitos no cartão (RU3523, RU3530).

## Bloco A — Tabela
A1. Colunas Área · Tipo · Quem · Quando · Etapas; colunas extras (Semana, Origem, Pontos, Profundidade, Estádio, Prazo) pelo botão de colunas.
A2. Marcadores: Atrasada (passou do prazo/dia), Esta semana, Próximos dias, Programada; Coletada; Cancelada.
A3. Etapas: Programada → Coletada → Enviada → Laudo (anel vermelho = coleta atrasada).
A4. Filtro único: Situação, Quem coleta, Tipo, Origem.

## Bloco B — Cartões dos planos
B1. Um cartão por plano ativo no período de hoje: tipo · frequência · ano, período, barra e %.
B2. Áreas: verde = coletada; contorno escuro = programada; contorno vermelho = programada e atrasada; branco = falta. Passe o mouse para ver dia e equipe.

## Bloco C — Coletado
C1. Marque áreas; o resumo diz quantas amostras vão ser gravadas (SOLO+RAIZ = Solo + Nematoide).
C2. Sem profundidade (solo/raiz), data no futuro, plano encerrado, área do plano já coletada no período: o app explica e não grava.

## Bloco D — Coleta avulsa
D1. Material: Solo, Nematoide, Folha, Fruta, Composto. Cada análise marcada = uma amostra (mesmo lote).
D2. Fruta: identificação e rastreabilidade preenchidas pelo talhão; sigla da análise no fim se o laboratório usa etiqueta completa.
D3. Composto: pede pilha/lote.
D4. Visitante: vê, mas não lança.
