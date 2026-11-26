const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 640 }, deviceScaleFactor: 2, javaScriptEnabled: false }), p = await ctx.newPage();
  await p.goto('file:///home/claude/efcwork/projeto/tools/p5/EFCdocs-raiz/index.html'); await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/cap/out/p5-antigo.png' }); await b.close(); })();
