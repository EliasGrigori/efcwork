/* EFCwork · v0.6.30 · Backup e exportação. Uso: NODE_PATH=$(npm root -g) node -r /home/claude/work/ferr/preload.js tools/testes/t_v0630.js
   A pasta fixa é provada com a pasta privada do navegador (OPFS): é um FileSystemDirectoryHandle de verdade, guardado no IndexedDB. */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const srv = require('child_process').spawn('python3', ['-m', 'http.server', '8765', '-d', path.join(RAIZ, 'dist')], { stdio: 'ignore' });
(async () => { await new Promise(r => setTimeout(r, 1200)); const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, url: 'http://localhost:8765/index.html', w: 1280, h: 860, semente: true }); await p.waitForTimeout(400);
  const erros = []; p.on('pageerror', e => erros.push(String(e))); 
  console.log('— aba e tela');
  await ir(p, 'adm/backup', 900);
  conf(await p.evaluate(() => VERSAO === '0.6.30'), 'versão 0.6.30');
  conf(await p.evaluate(() => !!document.querySelector('[data-act="bk-salvar"]')), 'botão Salvar backup na tela');
  conf(await p.evaluate(() => !![...document.querySelectorAll('.cs-abas a')].find(a => /Backup/.test(a.textContent))), 'aba Backup aparece para o Administrador');

  console.log('— sem pasta: baixa o arquivo (Downloads)');
  await p.evaluate(() => { delete window.showDirectoryPicker; });
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('[data-act="bk-salvar"]')]);
  const nome = dl.suggestedFilename(); const fs = require('fs'); const tmp = '/tmp/bk-teste.json'; await dl.saveAs(tmp);
  const j = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  conf(/^efcwork-backup-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(nome), 'nome do arquivo: ' + nome);
  conf(j.app === 'EFCwork' && j.versao === '0.6.30' && j.cols && typeof j.cols === 'object', 'formato { app, versao, cols }');
  conf(Array.isArray(j.cols.sv2_users) && j.cols.sv2_users.length > 0, 'leva as pessoas: ' + (j.cols.sv2_users || []).length);
  conf(!('sv2_login' in j.cols) && !('sv2_recup' in j.cols), 'sv2_login e sv2_recup fora');
  conf(!('sv2_fotos' in j.cols), 'fotos fora quando a caixa não está marcada');
  conf(!/"senha"|"pass"/.test(fs.readFileSync(tmp, 'utf8')), 'nenhum campo de senha no arquivo');
  await p.waitForTimeout(500);
  conf(/salvo em Downloads/.test(await p.evaluate(() => $('#bk-msg').textContent)), 'mensagem diz onde foi: ' + await p.evaluate(() => $('#bk-msg').textContent));

  console.log('— com pasta fixa (pasta de verdade do navegador, guardada no IndexedDB)');
  await p.evaluate(() => { window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); return r.getDirectoryHandle('efcwork-bk', { create: true }); }; });
  await ir(p, 'adm/backup', 900);
  await p.evaluate(() => { window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); return r.getDirectoryHandle('efcwork-bk', { create: true }); }; });
  /* neste Chrome sem tela, guardar uma pasta do navegador (OPFS) no IndexedDB fecha a página; então o guardar/ler é trocado por uma variável e o resto (escolher, gravar, mostrar) roda de verdade */
  await p.evaluate(() => { window.bkPasta = async (modo, val) => { if (modo === 'readwrite') window.__h = val; return modo === 'readonly' ? window.__h || null : true; }; });
  await p.evaluate(() => bkEscolher()); await p.waitForTimeout(600);
  conf(await p.evaluate(() => $('#bk-nome').textContent === 'efcwork-bk'), 'pasta escolhida aparece: ' + await p.evaluate(() => $('#bk-nome').textContent));
  /* NÃO provado aqui: a pasta ficar guardada no IndexedDB e sobreviver a recarregar a página (precisa do Chrome de verdade). */
  await p.click('[data-act="bk-salvar"]'); await p.waitForTimeout(2500);
  const lista = await p.evaluate(async () => { const r = await navigator.storage.getDirectory(), d = await r.getDirectoryHandle('efcwork-bk'), n = []; for await (const [k] of d.entries()) n.push(k); return n; });
  conf(lista.length === 1 && /^efcwork-backup-/.test(lista[0]), 'um clique gravou na pasta, sem janela: ' + lista.join(','));
  const dentro = await p.evaluate(async () => { const r = await navigator.storage.getDirectory(), d = await r.getDirectoryHandle('efcwork-bk'); for await (const [k, h] of d.entries()) { const t = await (await h.getFile()).text(); const o = JSON.parse(t); return [o.app, Object.keys(o.cols).length]; } });
  conf(dentro && dentro[0] === 'EFCwork' && dentro[1] > 10, 'arquivo da pasta abre e tem as coleções: ' + JSON.stringify(dentro));
  conf(/na pasta "efcwork-bk"/.test(await p.evaluate(() => $('#bk-msg').textContent)), 'mensagem: ' + await p.evaluate(() => $('#bk-msg').textContent));
  await p.click('[data-act="bk-esquecer"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => $('#bk-nome').textContent === 'nenhuma escolhida'), 'Esquecer a pasta volta ao estado sem pasta');

  conf(await p.evaluate(() => $('#bk-msg').textContent.startsWith('Pronto') && /efcwork-backup-/.test(document.querySelector('.bk .adm-dl') ? document.querySelector('.bk .adm-dl').textContent : '')), 'depois de salvar, a mensagem fica e o "Último backup" mostra o arquivo');

  console.log('— datas do Firestore (Timestamp tem toJSON) e referência de documento');
  const ts = await p.evaluate(async () => { const T = { toDate: () => new Date('2026-11-20T12:00:00Z'), toJSON: () => ({ seconds: 1, nanoseconds: 0 }) }, R = { firestore: {}, path: 'sv2_users/abc', toJSON: () => ({ x: 1 }) };
    const f = bkArquivo({ cols: { sv2_x: [{ id: 'a', em: T, ref: R, lista: [T] }] }, falhas: {} }, false); const o = JSON.parse(await f.blob.text()); return o.cols.sv2_x[0]; });
  conf(ts.em === '2026-11-20T12:00:00.000Z' && ts.lista[0] === ts.em && ts.ref === 'sv2_users/abc', 'Timestamp vira data em texto e a referência vira o caminho: ' + JSON.stringify(ts));

  console.log('— quem não é Administrador');
  await p.evaluate(() => { S.user = Object.assign({}, S.user, { perfil: 'secundario', estrela: false }); });
  conf(await p.evaluate(() => bkTela() === '' && AREAS.find(a => a.id === 'adm').abas.find(t => t.id === 'backup').negada === true), 'tela e aba somem para quem não é Administrador');
  conf(erros.length === 0, 'sem erro de JavaScript: ' + erros.join(' | '));
  console.log('— ida e volta: o arquivo baixado volta para um ambiente de teste limpo com as mesmas contagens');
  const ctx2 = await br.newContext(); const q = await ctx2.newPage(); await q.goto('file://' + path.join(RAIZ, 'dist/index.html') + '?demo=1'); await q.waitForTimeout(700);
  const volta = await q.evaluate(j => { Data.importarDemo(j.cols, 'senha1234'); const r = {}; Object.keys(j.cols).filter(c => /^sv2_/.test(c)).forEach(c => { r[c] = [j.cols[c].length, JSON.parse(localStorage.getItem('sv2demo_' + c) || '[]').length]; }); return r; }, j);
  const dif = Object.keys(volta).filter(c => volta[c][0] !== volta[c][1]);
  conf(Object.keys(volta).length > 10 && dif.length === 0, 'ida e volta sem diferença em ' + Object.keys(volta).length + ' coleções' + (dif.length ? ': ' + dif.map(c => c + ' ' + volta[c]).join(', ') : ''));
  await ctx2.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); await br.close(); srv.kill(); process.exit(falhas ? 1 : 0);
})();
