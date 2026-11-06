# Roteiro do Grok — EFCwork v0.4.0 (Coletas: amostras, ciclo e envio)

**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (grava).

## NÃO SÃO DEFEITOS
- Água não aparece nas Amostras (continua no EFClaudian nesta versão).
- Programação e Cadastros mostram "continua no EFClaudian".
- Não há botão de lançar coleta nova aqui (Coletado continua no EFClaudian).
- "Abrir nos Correios" abre a página oficial e copia o código; o andamento não aparece dentro do app.
- Amostra com envio retroativo esperando confirmação não aparece na lista do Enviar.
- As fichas de envio não abrem depois de enviar (continuam no EFClaudian).
- Encerrada = compra solicitada (regra do EFClaudian), mesmo sem o laudo marcado.
- Laudo atrasado = passou do prazo do laboratório + 5 dias (sem prazo cadastrado, 7 dias).

## Bloco A — Amostras
A1. Coletas › Amostras: todos os materiais juntos; filtro único com Material, Situação, Laboratório.
A2. Cabeçalho: não enviadas, aguardando laudo, atrasadas.
A3. Abra uma amostra: ciclo Programada (se houver) → Coletada → Enviada → O.S → Laudo/Compra, com datas e quem; o fluido Gota sobe.
A4. Encerrada com compra antes do laudo: Compra aparece antes de Laudo.
A5. Atrasada: "previsto até …" + aviso vermelho.

## Bloco B — Enviar
B1. Enviar: lista só as não enviadas; filtro de material; Marcar todas; Limpar.
B2. Data antes da coleta → recusa; mais de 30 dias à frente → recusa; sem marcar → recusa.
B3. Dois laboratórios marcados: o aviso diz que cada um vira uma remessa.
B4. NF, rastreio (vira maiúsculas, sem espaços), foto do cupom (aparece reduzida; lixeira tira).
B5. Colaborador com data de ontem: vira pedido; a amostra fica "Envio aguardando confirmação"; o Líder confirma no sino.

## Bloco C — Remessas, O.S, laudo
C1. Aba Envio: uma linha por dia + laboratório; filtros sem O.S / sem NF / sem rastreio / faltam laudos / atrasados.
C2. Gaveta da remessa: números, O.S, anexos, amostras (tocar abre a amostra).
C3. Informar O.S: vale para todas sem O.S. Corrigir: pede motivo; Administrador direto; Colaborador vira pedido.
C4. Laudos recebidos: lista as sem laudo já marcadas; grava quem e quando.
C5. Ícone da foto no topo: NF, rastreio e cupom a qualquer momento, para a remessa inteira.
C6. Cupom: tocar abre grande; Esc fecha só a foto.

## Bloco D — Celular
D1. Amostras e remessas sem rolar para o lado; ciclo em tela cheia nos dois temas.
