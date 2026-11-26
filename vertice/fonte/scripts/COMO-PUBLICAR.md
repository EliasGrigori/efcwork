# Como publicar o EFCdocs (pelo computador ou pelo celular)

**Desde a v0.6.74 (26/11/2026) o Vértice mora no repositório `efcwork`, pasta `vertice/`** (endereço `https://eliasgrigori.github.io/efcwork/vertice/`). O repositório `EFCdocs` só leva ao endereço novo.

Os arquivos desta pasta vão **todos juntos para a pasta `vertice/`** do repositório `efcwork`:
`index.html`, `sw.js`, `manifest.webmanifest`, `assets/` (pasta), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` e `apple-touch-icon.png`.

O código-fonte fica em `vertice/fonte/` (o que gera estes arquivos). Assim o código nunca se perde entre conversas. A pasta `fonte/` não muda nada no app publicado.

## Versão nova
Envie os arquivos novos por cima (o `sw.js` e a pasta `assets` sempre vão juntos). Apague da pasta `assets` os arquivos da versão anterior (o nome muda a cada versão). Quem já instalou vê "Versão nova pronta. Toque para atualizar".

## Atenção ao enviar pela página do GitHub
Não envie as pastas `fonte/node_modules/` nem `fonte/dist/` (são geradas no computador; o `git` já as deixa de fora, o "Upload files" não).

## Montar a partir do código (quem tiver Node)
Na pasta `fonte/`: `npm install`, depois `npm test` (testes) e `npm run build` (gera `dist/`).

O EFCdocs não guarda senha nem dado real no código. Fica separado do EFClaudian e do EFCquiz: só usa chaves `efcdocs:` no aparelho e caches `efcdocs-`.
