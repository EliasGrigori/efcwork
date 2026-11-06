/* EFCwork · suíte da v0.1.0 (casca): primeiro acesso, entrar/sair, menu, abas, temas, empresa, celular, erros de JavaScript.
   Uso: node tools/testes/t_v010.js   (usa dist/index.html no modo demonstração; não toca no Firebase real) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(500);
  const html = fs.readFileSync(path.join(RAIZ, 'dist', 'index.html'), 'utf8');
  conf(!/meri\s*pobo|fazenda matriz|russas|jaguaruana|limoeiro/i.test(html), 'nenhum nome da Meri Pobo fixo no código');
  conf(/Cwork Quality/.test(html) && /const VERSAO = '0\.\d+\.\d+'/.test(html), 'apelido Cwork Quality e versão no arquivo');
  /* primeiro acesso */
  conf(await p.isVisible('[data-form="en-primeiro"]'), 'sem Principal: aparece o primeiro acesso');
  conf(await p.isVisible('.en-cena'), 'tela de entrar tem a ilustração agrícola');
  await p.fill('#en-nome', 'Joana'); await p.click('[data-form="en-primeiro"] button[type=submit]');
  conf(/nome completo/i.test(await p.textContent('#en-msg')), 'nome sem sobrenome é recusado');
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha12345');
  await p.click('[data-form="en-primeiro"] button[type=submit]');
  conf(/não são iguais/i.test(await p.textContent('#en-msg')), 'senhas diferentes são recusadas');
  await p.fill('#en-senha2', 'senha1234'); await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(600);
  conf(await p.isVisible('.cs-lado'), 'depois do primeiro acesso entra no app');
  const h1 = await p.textContent('.cs-ph h1');
  conf(/^(Bom dia|Boa tarde|Boa noite), Joana$/.test(h1.trim()), 'Início saúda pelo primeiro nome: "' + h1.trim() + '"');
  conf((await p.$$('.cs-nav .cs-it')).length === 8 && await p.isVisible('.cs-pe .cs-it'), 'menu lateral: Início + 6 áreas + Relatórios, e Administração no pé');
  conf(/Cwork Quality/.test(await p.textContent('.cs-cw')) && /Cwork Quality/.test(await p.textContent('.cs-rod')), '"Cwork Quality" no pé do menu e da página');
  conf(/Sua empresa/.test(await p.textContent('.cs-emp')), 'sem empresa configurada: "Sua empresa"');
  await p.screenshot({ path: path.join(SHOTS, 'pc-claro-inicio.png') });
  /* áreas e abas */
  const rotas = await p.evaluate(() => AREAS.map(a => ({ id: a.id, abas: a.abas.filter(x => !x.oculta).map(x => x.id) }))); /* v0.3.2: telas de ação (oculta) não contam como aba */
  for (const r of rotas) {
    for (const aba of (r.abas.length ? r.abas : [''])) {
      await p.evaluate(h => { location.hash = h; }, '#/' + r.id + (aba ? '/' + aba : '')); await p.waitForTimeout(120);
      const t = await p.textContent('.cs-ph h1');
      if (!t || !t.trim()) { conf(false, 'tela ' + r.id + '/' + aba + ' sem título'); }
    }
    const nAbas = (await p.$$('.cs-abas a')).length;
    conf(nAbas === (r.abas.length > 1 ? r.abas.length : 0), r.id + ': ' + nAbas + ' abas (esperado ' + (r.abas.length > 1 ? r.abas.length : 0) + ')');
  }
  conf(await p.evaluate(() => [4, 1, 3, 3, 5, 3].join() === ['coletas', 'rateios', 'inspecoes', 'documentos', 'almox', 'qualidade'].map(i => Math.max(1, csArea(i).abas.filter(x => !x.oculta).length)).join()), 'estrutura aprovada: Coletas 4, Rateios 1, Inspeções 3, Documentos 3, Almoxarifado 5, Qualidade 3 ');
  await p.evaluate(() => { location.hash = '#/coletas/envio'; }); await p.waitForTimeout(150);
  conf(await p.isVisible('.cs-it.on[href="#/coletas"]') && await p.isVisible('.cs-abas a.on[href="#/coletas/envio"]'), 'área e aba atuais marcadas no menu e nas abas');
  conf(/EFClaudian/.test(await p.textContent('.cs-ct')) && await p.isVisible('.cs-acts a[href*="efclaudian"]'), 'área ainda não refeita leva ao EFClaudian');
  await p.screenshot({ path: path.join(SHOTS, 'pc-claro-coletas.png') });
  /* temas */
  await p.click('[data-act="cs-tema"]'); await p.waitForTimeout(120);
  conf(await p.evaluate(() => document.documentElement.getAttribute('data-tema')) === 'escuro', 'botão do tema troca para o Escuro (Dourado)');
  const bgEsc = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  conf(bgEsc === 'rgb(11, 13, 22)', 'Escuro usa o fundo azul-tinta do Dourado original (' + bgEsc + ')');
  await p.screenshot({ path: path.join(SHOTS, 'pc-escuro-coletas.png') });
  /* empresa */
  await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(150);
  await p.fill('#adm-nome', 'Fazenda Exemplo'); await p.fill('#adm-un', 'Unidade Sede\nUnidade Norte\nUnidade Sede');
  await p.click('[data-form="adm-empresa"] button[type=submit]'); await p.waitForTimeout(300);
  conf(/Fazenda Exemplo/.test(await p.textContent('.cs-emp')) && /Unidade Sede/.test(await p.textContent('.cs-emp')), 'empresa salva aparece no menu (nome e unidade)');
  conf(await p.evaluate(() => S.empresa.unidades.join('|')) === 'Unidade Sede|Unidade Norte', 'unidades repetidas são juntadas');
  await p.click('[data-dd="adm:unid"] .dd-b'); await p.waitForTimeout(80);
  conf(await p.isVisible('[data-dd="adm:unid"] .dd-l'), 'escolha da unidade é uma janela retrátil');
  await p.click('[data-dd="adm:unid"] li[data-v="Unidade Norte"]'); await p.waitForTimeout(150);
  conf(/Unidade Norte/.test(await p.textContent('.cs-emp')), 'unidade deste aparelho trocada');
  await p.screenshot({ path: path.join(SHOTS, 'pc-escuro-empresa.png') });
  /* recarregar: continua logado, com tema e empresa */
  await p.reload(); await p.waitForTimeout(700);
  conf(await p.isVisible('.cs-lado') && await p.evaluate(() => document.documentElement.getAttribute('data-tema')) === 'escuro' && /Fazenda Exemplo/.test(await p.textContent('.cs-emp')), 'ao recarregar: continua logado, tema e empresa guardados');
  /* atalhos */
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(100);
  await p.evaluate(() => { location.hash = '#/almox/painel'; }); await p.waitForTimeout(100);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await p.waitForTimeout(100);
  await p.evaluate(() => { location.hash = '#/inicio'; }); await p.waitForTimeout(150);
  const at = await p.textContent('.ini-col:last-child');
  conf(/Voltar para/.test(at) && /Mais usadas/.test(at) && /Materiais/.test(at), 'Início mostra "Voltar para" e "Mais usadas"');
  /* sair e entrar */
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  conf(await p.isVisible('[data-form="en-entrar"]'), 'Sair volta para a tela de entrar');
  conf(await p.inputValue('#en-login') === 'joana.silva', 'lembra o usuário');
  await p.fill('#en-senha', 'errada99'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(300);
  conf(/incorretos/.test(await p.textContent('#en-msg')), 'senha errada: "Login ou senha incorretos."');
  await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(600);
  conf(await p.isVisible('.cs-lado'), 'entra com a senha certa');
  await p.click('[data-act="cs-tema"]'); await p.waitForTimeout(100); await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(SHOTS, 'pc-claro-empresa.png') });
  await p.click('[data-act="cs-sair"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(SHOTS, 'pc-claro-entrar.png') });
  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  /* celular */
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400);
  await q.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#en-nome', 'Joana Silva'); await q.fill('#en-login', 'joana.silva'); await q.fill('#en-senha', 'senha1234'); await q.fill('#en-senha2', 'senha1234');
  await q.click('[data-form="en-primeiro"] button[type=submit]'); await q.waitForTimeout(600);
  let largo = [];
  for (const r of rotas) { await q.evaluate(h => { location.hash = h; }, '#/' + r.id); await q.waitForTimeout(120); if (await q.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) largo.push(r.id); }
  conf(!largo.length, 'celular 390 px: nenhuma tela rola para o lado' + (largo.length ? ' (' + largo.join(', ') + ')' : ''));
  await q.evaluate(() => { location.hash = '#/inicio'; }); await q.waitForTimeout(150);
  conf(await q.isVisible('.cs-baixo') && await q.evaluate(() => document.querySelector('.cs-lado').getBoundingClientRect().right <= 0), 'celular: barra de baixo visível e menu lateral escondido');
  const alvos = await q.evaluate(() => Array.from(document.querySelectorAll('.cs-baixo a,.cs-baixo button,.cs-topo .bt')).map(x => x.getBoundingClientRect().height).filter(h => h < 36).length);
  conf(alvos === 0, 'celular: alvos de toque com 36 px ou mais');
  await q.screenshot({ path: path.join(SHOTS, 'cel-claro-inicio.png') });
  await q.click('.cs-baixo [data-act="cs-menu"]'); await q.waitForTimeout(300);
  conf(await q.evaluate(() => document.querySelector('.cs-lado').getBoundingClientRect().left >= 0), 'celular: "Mais" abre o menu lateral');
  await q.screenshot({ path: path.join(SHOTS, 'cel-claro-menu.png') });
  await q.keyboard.press('Escape'); await q.waitForTimeout(250);
  await q.click('[data-act="cs-tema"]'); await q.waitForTimeout(150);
  await q.evaluate(() => { location.hash = '#/coletas'; }); await q.waitForTimeout(150);
  await q.screenshot({ path: path.join(SHOTS, 'cel-escuro-coletas.png') });
  await q.click('[data-act="cs-sair"]').catch(async () => { await q.click('.cs-baixo [data-act="cs-menu"]'); await q.waitForTimeout(250); await q.click('[data-act="cs-sair"]'); });
  await q.waitForTimeout(300); await q.screenshot({ path: path.join(SHOTS, 'cel-escuro-entrar.png') });
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v010: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
