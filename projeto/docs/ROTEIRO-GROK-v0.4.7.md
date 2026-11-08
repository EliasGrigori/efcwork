# Roteiro do Grok — EFCwork v0.4.7 (aba Ajustes do plano, recoleta, encerrar, renovar pelo sino; correção das programações do plano)

**Testar sem tocar em dados reais:** `?demo=1`. Monte como na suíte t_v047: plano SOLO+RAIZ semestral com 6 áreas e programações DENTRO do plano (`sv2_rodizio.progs[ano-S#][área] = {data, coletor, pontos, prof, estadio, por, em}`), uma área já coletada (Solo + Nematoide), um plano FOLHA do ano passado e um Colaborador (secundario, sem estrela) com o Administrador de superior. Pode usar a cópia do backup real no modo demonstração. Conta real: só olhar.

## NÃO SÃO DEFEITOS
- Tipo, frequência e ano aparecem fixos no bloco Plano (mudar continua no EFClaudian).
- Não há botão "Renovar" no plano: a sugestão aparece no sino a partir de 1º/12 (ou para planos do ano anterior ainda sem o do ano seguinte), só para Líder ★ e Administrador.
- Área coletada no período: caixinha travada no bloco Áreas.
- Depois da recoleta, a programação antiga da área não volta a contar (foi usada); a área fica em Faltam com o ícone de recoleta.
- Programações do plano sem dia aparecem só no plano (não na tabela da Programação).
- Pedido de recoleta (tipo `recoleta_plano`) só é decidido no EFCwork.

## Bloco A — Programações do plano (correção)
A1. Plano com programações dentro do plano: a página mostra programada/atrasada com o dia (antes apareciam como "falta").
A2. Tabela da Programação: as programações do plano aparecem com origem Plano e situação (Atrasada / Esta semana / …).
A3. "Coletado" numa programação do plano: grava as amostras com progId vazio e nada em sv2_prog; auditoria `coletado_plano`.
A4. "Programar" na página do plano grava em `sv2_rodizio.progs[período][área]` (não em sv2_prog); auditoria `programar_plano` com antes/depois.

## Bloco B — Aba Ajustes
B1. Abas "Áreas · Ajustes". Em Ajustes: blocos Plano, Áreas, Período, Recoletas. Celular: um embaixo do outro, sem rolar de lado.
B2. Plano: marcar/desmarcar análise liga "Salvar análises"; salva `analiseIds`; auditoria `alterar_rodizio`. Sem nenhuma análise: avisa.
B3. Áreas: busca filtra; marcar = entra, desmarcar = sai; linha mudada destacada; "Salvar áreas" pede confirmação quando tira; área programada que sai tem a programação removida do plano; auditoria com "entrou / saiu".
B4. Colaborador e Consulta veem os blocos, sem salvar e sem encerrar.

## Bloco C — Recoleta
C1. Bloco Recoletas → "Liberar recoleta de" (só áreas coletadas) → gaveta com as amostras, motivo (Erro de envio · Solicitação errada · Amostra perdida ou danificada · Laudo com resultado estranho · Coleta feita no lugar errado · Outro), detalhe.
C2. Sem motivo: avisa. "Outro" sem texto: avisa.
C3. Líder ★/Administrador: grava `liberadas[período][área] = {motivo, por, ts, aprovadoPor:''}`; auditoria `recoleta_rodizio`; a área volta para Faltam com o ícone; a coleta antiga continua em Amostras; pode coletar de novo.
C4. Colaborador: gaveta "Pedir recoleta" → sv2_aprov tipo `recoleta_plano`; aparece "aguardando confirmação" e a área sai da lista; o superior confirma no sino → grava com `por` = quem pediu e `aprovadoPor` = quem confirmou.

## Bloco D — Encerrar período
D1. "Encerrar período" (Líder ★/Administrador) abre a gaveta com os números e um motivo por área sem coleta. Sem motivo: avisa quais.
D2. Com programação aberta (atrasada ou não): abre o aviso "Cancelar a programação aberta? / Cancelar as N programações abertas?" com "Cancelar todas e encerrar" e "Voltar". Voltar não encerra.
D3. Grava `fechados[período] = {ts, por, porNome, snap[{area, st, data, pgId}], motivos{área: TEXTO}, obs}`; auditoria `encerrar_rodizio`; as programações abertas viram Cancelada ("Período encerrado"); a trava não aceita mais coleta no período; o bloco mostra "Encerrado em… por…".

## Bloco E — Renovar pelo sino
E1. Plano do ano anterior sem o do ano seguinte: sino → "Sugestões" → "Renovar X para AAAA?" com "Agora não" e "Renovar". Conta no número do sino.
E2. Renovar cria o plano do ano seguinte (mesmas áreas, análises e frequência; `renovadoDe`); auditoria `criar_rodizio`; a sugestão some. "Agora não" some só neste aparelho.
E3. Plano do ano corrente só aparece a partir de 1º/12 (dá para conferir mudando a data do sistema no teste).

## Bloco F — Retorno do Grok
F1. Login sem @ (ex.: fulano2099gmail.com) com senha errada: só depois de tentar aparece "Login ou senha incorretos. Parece um e-mail sem o @…".
F2. Tabelas com total (Materiais, Amostras, Calibração): o Total fica ACIMA da tabela, em caixinhas, sem linha de total dentro dela; buscar ou filtrar muda o valor e mostra "do filtro · N". Materiais sem filtro: Valor igual ao do cabeçalho.
