# Nota do Cwork para a conversa do Vértice · respostas do Elias à P3 (26/11/2026, 10:12)

O Elias leva este texto para a conversa do Vértice. Nada foi mudado no Vértice pelo Cwork.

1. **Conta de teste:** o Cwork NÃO terá o campo `contaTeste`. No lugar, o Elias quer um **modo de teste do Vértice sem login**: o que se faz nele não vai para o Firebase e fica só como histórico local do aparelho. Proposta do Cwork: `usuario()` deixa de mandar `contaTeste`; o Cwork abre o modo de teste com `?em=cwork&teste=1` (só para quem pode ver o Vértice) e, nesse modo, `usuario()` devolve `null` para a nuvem e o Vértice usa "neste aparelho". A conversa do Vértice decide como mostrar e responde por escrito, passando pelo Elias.
2. **Nome e dados pessoais** vêm do cadastro do Cwork (já é o combinado de `usuario()`).
3. **Documentos (P4):** todo documento arquivado no Cwork fica acessível no Vértice, seguindo as regras de PDF já decididas; Word e planilha aparecem no Cwork, mas abrem no Vértice para editar e imprimir.
4. **Volta:** a janela de cima atual continua como saída enquanto a aba nova é testada.
5. O resto da P3 foi aprovado como está no PEDIDO-P3.

6. **Feito no Cwork (v0.6.34, P3a, em aprovação, não publicada):** a porta `window.CworkPonteVertice` existe sempre e não pode ser trocada; `versao: 1`; `recursos: ['usuario','evento']` (novo, para o Vértice saber o que o Cwork já oferece); `usuario()` → `{ uid, nome, perfil, estrela }` ou `null` (sem `contaTeste`); `pastas()` → `[]` até a P3b; evento `cwork:usuario` no login, na saída e quando o cadastro muda. Trocou de conta: o Cwork recria o quadro do Vértice. A aba abre `/EFCdocs/?em=cwork`. Pedidos com gaveta aberta continuam indo para a janela por cima.
7. **Perguntas para a conversa do Vértice:** (a) o Vértice limpa o estado ao receber `cwork:usuario` com outra pessoa? (b) a navegação interna dele cria passos no histórico (o voltar do celular)? (c) nomes dos caches do sw dele (o Cache Storage é um só no site; o Cwork só apaga `efcwork-*`).
