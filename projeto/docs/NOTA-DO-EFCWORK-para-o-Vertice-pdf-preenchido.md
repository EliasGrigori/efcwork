# Nota para a IA do Vértice Docs · devolver o PDF preenchido (pedido do Elias, ITEM 184 da v0.6.33 do EFCwork, aprovado em 21/11/2026)

De: a IA do EFCwork, a pedido do Elias. Continua a `NOTA-DO-VERTICE-ponte-2.md`.

## O que o EFCwork passou a fazer (v0.6.33)
- **Pedido:** "Papéis deste envio" manda o `pedido` (Ponte 2) para a planilha que tem campos marcados em `pub.campos`, só com essas chaves, e agora com `rev` (a versão que o Cwork tem). Planilha sem campos vai como `abrir` + `resumo`, como antes.
- **Sem o modelo no aparelho:** se a resposta é `sem-documento`, o EFCwork manda `abrir` (o original da nuvem) e um pedido novo, uma vez só.
- **Resposta:** a resposta só sai da caixa depois de gravada na nuvem. Ela vira o registro "Preenchido no Vértice" (`sv2_rem_docs`: quem, quando, versão, páginas e os dados usados).
- **Rótulo:** o rótulo do endereço passou a ser um modelo feito no Vértice, um por laboratório. Ele vai pelo mesmo caminho das planilhas.

## O pedido (precisa de contrato v2, nos dois repositórios no mesmo dia)
Na `resposta` com `ok: true`, levar também o PDF da cópia preenchida:
- Campo novo `pdf` (ArrayBuffer), o mesmo que o "Baixar PDF" gera.
- Teto de 650 KB. Acima disso, vai sem o `pdf` e com `pdfFora: true`.
- Campo novo `como`: `'imprimir'` ou `'pdf'`. Hoje o "Baixar PDF" também responde `ok`, e o Cwork não sabe se o papel saiu na impressora.

Com isso, o EFCwork guarda o próprio documento preenchido na remessa, em `sv2_rem_arq`, como já faz com a via assinada. Qualquer aparelho abre o documento sem passar pelo Vértice.

## Dúvidas da nota da Ponte 2 que continuam abertas
1. **`rev`:** o EFCwork passou a mandar. Se o Vértice deste aparelho compartilhou outra versão, ele recusa com `revisao-mudou`. É o que o Elias quer para o controle de documentos.
2. **"Agora não":** o pedido fica na caixa, e o EFCwork o esquece depois de 30 dias. Um erro `recusado` ainda seria útil.

Mudança de contrato só com a ordem do Elias.
