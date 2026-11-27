# Nota do Cwork para a conversa do Vértice · documentos só no Vértice (27/11/2026)

Pedido do Elias em 27/11/2026, às 06:59, na conversa do Cwork, quando ela começava as etiquetas das amostras:

> As etiquetas devem ser subidas do Vértice. As em PDF baixam direto; as em planilha ou Word abrem somente essa aba de arquivo do Vértice, podendo editar só os campos que deixei desbloqueados pelo Vértice. Se der, abrir a tela só daquela folha, como se fosse uma função do Cwork, porém trazida do Vértice. Cada documento tem a sua ligação: sempre que eu atualizar pelo Vértice para uma versão nova, ele atualiza sozinho no Cwork. Uma ideia: o documento não fica hospedado no Cwork, só no Vértice; ao tocar nele, abre essa tela como se fosse nativa, mas é uma função própria do Vértice. **Isso vale para todos os documentos, internos e externos: hospedados lá.**

## O que muda (resumo para o Vértice)
1. **Hospedagem:** todo documento (etiqueta, ficha, cadeia de custódia, formulário, POP, fluxograma, documentos internos e externos) mora **só no Vértice** (a P4: `vtd_arquivos` / `vtd_partes`). O Cwork guarda **só a ligação** (o id do documento e onde ele é usado, como laboratório, ponto do envio, análise), nunca uma cópia.
2. **Versão:** o Cwork sempre abre a **versão atual** que o Vértice publicou. Atualizou no Vértice, já vale no Cwork, sem reenviar nada.
3. **PDF:** do Cwork, abre, imprime e baixa direto.
4. **Planilha e Word:** o Cwork abre o Vértice em **modo documento**, só aquele arquivo e só aquela aba ou folha, sem o resto do Vértice (menus, pastas, outros arquivos). A pessoa edita **só as células ou campos desbloqueados** no Vértice e imprime. Para ela, parece uma tela do Cwork, mas é o Vértice que desenha. Isso junta o que já estava pedido: ITEM 195 (`acesso: 'documento'`) e ITEM 196 (planilha protegida: só as células desbloqueadas; quem salva é só o Líder ★ ou o Principal).
5. **Etiquetas das amostras:** são documentos do Vértice como os outros. O Cwork não desenha etiqueta própria. O protótipo de etiquetas feito no Cwork foi deixado de lado (guardado em `fonte/rascunhos/`).

## O que o Cwork precisa que o Vértice ofereça
- Uma forma de **abrir um documento pelo id em modo documento**, já na aba certa, sem a navegação do Vértice. Hoje existe o `#/abrir`; falta dizer **qual aba ou folha** e esconder o resto.
- Saber a **versão atual** e o **formato** (PDF, planilha, Word) de cada documento, para o Cwork mostrar e escolher entre abrir e baixar.
- Para PDF: um jeito de o Cwork **baixar ou imprimir** a versão atual sem abrir o editor.
- Mais tarde, se o Elias pedir: o Cwork mandar **dados para preencher** as células desbloqueadas (ex.: talhão, análise, data da coleta), pelo dicionário de campos do Contrato EFD (a nota `NOTA-DO-EFCWORK-para-o-Vertice-pdf-preenchido.md` já fala disso).

## O que fica do lado do Cwork (depois do Vértice pronto)
- Documentos › Impressos e o kit do laboratório (Envio › Laboratórios) passam a **apontar** para os documentos do Vértice, em vez de guardar arquivo (`efd_docs`/`efd_partes`). Os que já estão guardados no Cwork precisam de uma mudança única para o Vértice (decidir com o Elias).
- Os lugares de imprimir etiqueta (aba, remessa, depois de "Coletado", amostras filtradas) passam a abrir o documento de etiqueta do Vértice ligado ao material e ao laboratório.

Nada disso foi feito no Vértice por esta conversa: o código do Vértice é da conversa dele.
