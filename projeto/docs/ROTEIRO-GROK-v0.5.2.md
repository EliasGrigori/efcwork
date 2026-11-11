# Roteiro do Grok — EFCwork v0.5.2

Testar sem tocar em dados reais: `?demo=1` (pode importar a cópia do backup real no demo). Na conta real, só olhar; nada de apertar "Atualizar agora" mais de 2 vezes seguidas (são leituras do servidor).

## NÃO SÃO DEFEITOS
- Na demonstração o topo mostra só o texto "Demonstração" (sem botão de nuvem) e "Atualizar agora" não lê o servidor.
- O lembrete só é gerado por Líder ★ ou Administrador logado (colaborador comum não gera, mas recebe se for o responsável do equipamento).
- O menu lateral retrátil NÃO está nesta versão (só modelos para o Elias aprovar).

## Bloco A — Nuvem (Nº 46) — conta real, só olhar (sem login: marcar NÃO TESTADO)
A1. PC: no topo, "Sincronizado" é um botão (passar o mouse dá fundo e borda). Clicar abre a gaveta "Nuvem" com a situação, o texto e o botão "Atualizar agora".
A2. Clicar em Atualizar agora: o botão vira "Lendo da nuvem…" e depois aparece "Atualizado às HH:MM · N listas lidas do servidor." e o botão volta a ficar ativo.
A3. Celular 390: o aviso é um ícone de nuvem (verde). Tocar abre a mesma gaveta em tela cheia; Esc/voltar fecha uma camada só.
A4. Sem internet (modo avião no navegador): o ícone fica amarelo e a gaveta diz "Sem internet"; Atualizar agora mostra "Não deu para atualizar…".

## Bloco B — Calibração (Nº 27), no demo com o backup
B1. Almoxarifado › Equipamentos: equipamentos com calibração a vencer em até 60 dias mostram o selo "Vence em N dias" (conferir N com a data da próxima calibração do backup; hoje = a data do teste).
B2. Logado como o Principal do backup: o sino mostra avisos "Calibração vence em 2 meses" (equipamentos entre 8 e 60 dias) e "Calibração vence em 7 dias" (até 7 dias). Equipamento vencido, sem data ou com mais de 60 dias: sem aviso. Anotar quantos avisos saíram e a lista.
B3. Abrir de novo o app (recarregar): a quantidade de avisos de calibração não muda (não duplica).
B4. Tocar num aviso: abre Almoxarifado › Equipamentos com a gaveta do equipamento.
B5. Logado como Colaborador (Grok Agente): não gera aviso novo.

## Bloco C — Ajustes
C1. Menu de uma coluna (Materiais › Item): botões do rodapé (setas e "Limpar esta coluna") com canto de 8 px.
C2. Administração › Atividade › Impressora: a coluna App traz só a versão (ex.: v2.102.59) e a impressão tem bem menos páginas do que as 72 da v0.5.1 para 294 linhas. Anotar o número de páginas.
C3. Coletas: abrir a foto do cupom de um envio (ícone/ação de ver foto): continua abrindo.

## Retorno
Uma linha por passo: OK / FALHOU / PARCIAL / NÃO TESTADO, com o que viu e print quando falhar.
