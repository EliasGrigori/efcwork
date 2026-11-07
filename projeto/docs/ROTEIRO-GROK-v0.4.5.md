# Roteiro do Grok — EFCwork v0.4.5 (Programação: ajustes, tabela do EFClaudian, etapas na gaveta, Solo + Raiz separados)

**Testar sem tocar em dados reais:** `?demo=1` (cadastre talhões, análises, programações e planos no console, como na suíte t_v045). Conta real: só olhar.

## NÃO SÃO DEFEITOS
- Não há funil em cada coluna nem pílulas em Origem/Coletada: filtro único e cor só para problema (regras do Elias; escolha em aberto na 2ª rodada).
- Não existe status "Em aberto" no plano: decisão do Elias (07/11 11:45). Ficam Em andamento / Concluído / Encerrado.
- Programação SOLO+RAIZ ainda não coletada aparece numa linha só; vira duas (SOLO e NEMATOIDE) depois de coletada.
- Os cartões dos planos ficam numa faixa que rola de lado; com a gaveta aberta, parte da faixa fica atrás dela (não muda de forma nem de lugar).
- A gaveta da linha mostra "Programação · Avulsa" quando a área não está em nenhum plano daquele material.
- Coleta já feita (mesmo avulsa) conta como coletada no cartão do plano pela regra do período (trava do rodízio). Só a PROGRAMAÇÃO avulsa deixou de marcar "programada" no cartão.
- Nova programação, editar/cancelar programação e a página do plano continuam no EFClaudian (próximas versões).
- A coluna Sem é a semana ISO da data programada.

## Bloco A — Cartões dos planos
A1. Cabeçalho numa linha: "TIPO · frequência · ano", "01/01 a 31/12" e o status. Sem "Ano 2026" e sem repetir o nome.
A2. Só borda, sem sombra. Plural: "1 de 1 área coletada", "0 de 3 áreas coletadas".
A3. Área programada: contorno fino verde. Programada e atrasada: contorno amarelo. Coletada: verde cheio.
A4. Abra uma linha da tabela: os cartões não mudam de tamanho nem de lugar; a barra da tabela continua numa linha.
A5. Ícone "!" ao lado de "N programadas a coletar": mostra a legenda das cores ao passar o mouse ou tocar.

## Bloco B — Tabela
B1. Colunas (como a do EFClaudian): Data · Sem · Talhão · Tipo · Origem · Pontos · Coletor · Prof · Estádio · Prazo · Situação, centralizadas. Local pelo botão de colunas.
B2. Nenhuma bolinha de etapa na linha. Só "Atrasada" é colorida; as outras situações são texto.
B3. Clique numa linha: gaveta com a linha do tempo Programada → Coletada → Enviada → Laudo (fluido Gota) e os dados.
B4. Lance Coletado numa programação SOLO+RAIZ: a tabela passa a ter duas linhas (SOLO e NEMATOIDE). A gaveta de cada uma mostra só a amostra e a análise daquele material.

## Bloco A2 — Cabeçalho
A6. "!" ao lado do título Programação; não existe mais "N programadas a coletar"; no PC os botões ficam na linha do título.

## Bloco C — Formulários
C0. Coleta avulsa: Análises numa lista suspensa; fechada mostra "Solo completo + 1".
C1. Coleta avulsa e Coletado: campos 2 lado a lado no PC e no celular (390 px); janelas retráteis com 34 px e itens da lista menores.
C2. Na avulsa, Talhão e Laboratório lado a lado (no Composto, o Laboratório fica no bloco 3).

## Bloco D — Outros
D1. Primeiro acesso no PC com 1280×800: o botão "Criar e entrar" aparece inteiro.
D2. Celular: a tabela da Programação aparece na primeira tela; nada rola para o lado.
D3. Tema Escuro: mesmas telas sem rolar para o lado.
