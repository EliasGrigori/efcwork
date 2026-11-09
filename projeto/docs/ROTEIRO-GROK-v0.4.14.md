# Roteiro do Grok — EFCwork v0.4.14 (Administração › Atividade)

**Só execute e relate.** Use a conta do Principal com o backup real, só lendo. Não grave nada. Para dados de exemplo, `?demo=1`.

## NÃO SÃO DEFEITOS
- A aba Atividade só existe para o Principal. Líder, colaborador e demais não veem a aba nem a encontram na busca; pelo endereço direto caem na tela Empresa (a tela some, sem aviso em branco).
- O detalhe abre na própria linha (não é gaveta). É de propósito: a gaveta foi reprovada.
- Mostra 100 registros e há "Mostrar mais". A tela lê os 1000 mais novos.
- O gráfico considera só os últimos 30 dias, mesmo que o período do filtro seja outro.
- Registros do EFClaudian aparecem com o app "EFClaudian" e os do EFCwork com "EFCwork".

## Bloco A — tela
A1. Administração: a aba Atividade aparece entre Aparência e Sobre, com o selo "só o Principal vê".
A2. Gráfico: 30 colunas; as 7 últimas em destaque; a legenda cita o dia de mais movimento. Compare a contagem de uma coluna (passe o mouse) com a lista do mesmo dia.
A3. A lista vem agrupada por Hoje, Ontem e datas, do mais novo para o mais antigo; cada linha mostra hora, iniciais, nome, o que aconteceu, área, registro, app e o selo da ação.
A4. Nenhuma rolagem para o lado em 1280 e 390 px, nos temas Claro e Escuro.

## Bloco B — detalhe
B1. Toque numa linha: abre na própria linha com Quem (e perfil), Quando, App (versão), Onde e, se houve, Autorizado por.
B2. Em registros com alteração (ex.: desprogramar plano, corrigir O.S): tabela Campo / Antes (riscado) / Depois.
B3. Toque em outra linha: a primeira fecha. Toque na mesma de novo: fecha. Esc fecha o detalhe.

## Bloco C — filtro
C1. O botão "Filtro" mostra o resumo ("últimos 30 dias · todos") e abre o painel com Período, Pessoa, Área e App em janelas retráteis.
C2. Filtre por uma pessoa: contagem, lista e gráfico seguem o filtro; aparece "Limpar filtro".
C3. Combine pessoa + área sem registro: mensagem "Nada com este filtro".
C4. Período "Últimos 7 dias" e "Todo o período": a contagem muda.
C5. Esc com o painel aberto fecha o painel.

## Bloco D — planilha e impressão
D1. Ícone de planilha: baixa um .xlsx só com o que está filtrado.
D2. Ícone da impressora: página A4 com o título Atividade e as linhas filtradas.

## Bloco E — segurança
E1. Entre como Líder ou colaborador: sem a aba e sem aparecer na busca; abrindo #/adm/atividade, a tela vai para Empresa e o endereço vira #/adm/empresa. Nenhuma tela vazia nem aviso.
E2. Relate o que a regra publicada de sv2_audit diz sobre LER (quem pode). Se outros perfis conseguirem ler, é achado de segurança.
E3. Confirme que a tela não cria nem altera nenhum documento em sv2_audit (aba Rede do navegador: só leitura).
