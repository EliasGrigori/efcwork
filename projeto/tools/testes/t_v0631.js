/* EFCwork · v0.6.31 · Administração mais limpa e foto do perfil.
   Uso: NODE_PATH=$(npm root -g) node -r /home/claude/work/ferr/preload.js tools/testes/t_v0631.js [caminho do index.html]  */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..'), APP = process.argv[2];
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
/* foto de teste 600 × 400 feita no próprio navegador */
const FOTO = async p => p.evaluate(async () => { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const g = c.getContext('2d'); for (let i = 0; i < 400; i++) { g.fillStyle = 'hsl(' + (i % 360) + ',70%,' + (30 + i % 40) + '%)'; g.fillRect(Math.random() * 600, Math.random() * 400, 60, 60); }
  const b = await new Promise(r => c.toBlob(r, 'image/png')); const f = new File([b], 'eu.png', { type: 'image/png' }); const i = document.querySelector('#ft-arq'); if (!i) return false; const dt = new DataTransfer(); dt.items.add(f); i.files = dt.files; i.dispatchEvent(new Event('change', { bubbles: true })); return true; });
(async () => { const br = await chromium.launch();
  const p = await abre(br, Object.assign({ raiz: RAIZ, w: 1280, h: 860, semente: true }, APP ? { url: 'file://' + path.resolve(APP) } : {})); await p.waitForTimeout(400);
  const erros = []; p.on('pageerror', e => erros.push(String(e)));
  console.log('— menu lateral');
  await ir(p, 'inicio', 700);
  const topo = await p.evaluate(() => { const l = document.querySelector('#cs-lado'); const t = l.querySelector('.cs-adm'); const pe = l.querySelector('.cs-pe a.cs-it[href="#/adm"]'); return { t: t ? t.textContent : '', h: t ? t.getAttribute('href') : '', pe: !!pe, emp: !!l.querySelector('.cs-emp:not(.cs-adm)') }; });
  conf(/Administração/.test(topo.t) && topo.h === '#/adm', 'no lugar do cartão da empresa, o menu tem Administração: ' + topo.t);
  conf(/Fazenda Exemplo/.test(topo.t), 'o nome da empresa continua visível, embaixo de Administração');
  conf(!topo.pe && !topo.emp, 'Administração não se repete no rodapé e o cartão antigo sumiu');
  await p.evaluate(() => { Store.set('cw-menu', 'icones'); render(); }); await p.waitForTimeout(400);
  conf(await p.evaluate(() => { const t = document.querySelector('.cs-adm'); return !!t && t.getBoundingClientRect().width > 0 && t.getBoundingClientRect().width <= 60; }), 'menu só com ícones: Administração vira um ícone (não some)');
  await p.evaluate(() => { Store.set('cw-menu', 'aberto'); render(); }); await p.waitForTimeout(300);
  console.log('— abas');
  await ir(p, 'adm/empresa', 700);
  const abas = await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].map(a => a.textContent.trim()).join(','));
  conf(!/Aparência/.test(abas), 'aba Aparência saiu: ' + abas);
  conf(await p.evaluate(() => !!document.querySelector('[data-act="cs-tema"], .cs-tema, [title*="tema" i], [aria-label*="tema" i]')), 'o botão de lua/sol do topo continua');
  await ir(p, 'adm/aparencia', 600);
  conf(await p.evaluate(() => !document.querySelector('[data-dd="adm:tema"]')), 'endereço antigo adm/aparencia não mostra mais o tema');
  console.log('— espaços');
  for (const a of ['empresa', 'perfil']) { await ir(p, 'adm/' + a, 700);
    const v = await p.evaluate(() => [...document.querySelectorAll('.pn .en-msg')].filter(m => !m.textContent.trim() && m.getBoundingClientRect().height > 0).length);
    conf(v === 0, a + ': sem linha vazia de mensagem antes do botão (' + v + ')'); }
  await ir(p, 'adm/empresa', 700);
  const lado = await p.evaluate(() => { const d = [...document.querySelectorAll('.pn h3')].find(h => h.textContent === 'Dados da empresa'), t = [...document.querySelectorAll('.pn h3')].find(h => h.textContent === 'Tela de entrar'); if (!d || !t) return null; const a = d.closest('.pn').getBoundingClientRect(), b = t.closest('.pn').getBoundingClientRect(); return [Math.round(a.top), Math.round(b.top), Math.round(a.left), Math.round(b.left)]; });
  conf(lado && lado[0] === lado[1] && lado[3] > lado[2], 'Empresa: Dados da empresa e Tela de entrar lado a lado, no mesmo alto: ' + JSON.stringify(lado));
  console.log('— foto do perfil');
  await ir(p, 'adm/perfil', 700);
  conf(await FOTO(p), 'Meu perfil tem o campo de foto');
  await p.waitForTimeout(1500);
  const av = await p.evaluate(async () => { const d = await Data.col('sv2_avatar').get(S.user.id); return d ? { n: (d.img || '').length, ini: (d.img || '').slice(0, 15), keys: Object.keys(d).sort().join(',') } : null; });
  conf(av && av.n > 1000 && av.n < 60000 && /^data:image\/(jpeg|webp)/.test(av.ini), 'foto gravada em sv2_avatar/<uid>.img, abaixo de 60 mil (regra do Firestore): ' + JSON.stringify(av));
  conf(await p.evaluate(() => { const i = document.querySelector('.cs-us .cs-av img'); return !!i && /^data:image/.test(i.src); }), 'a foto aparece no menu, no lugar das iniciais');
  conf(await p.evaluate(() => { const i = document.querySelector('.ft-foto img'); return !!i && Math.abs(i.naturalWidth - i.naturalHeight) <= 1; }), 'foto recortada quadrada');
  if (await p.$('[data-act="ft-tira"]')) { await p.click('[data-act="ft-tira"]'); await p.waitForTimeout(800); }
  conf(await p.evaluate(async () => { const d = await Data.col('sv2_avatar').get(S.user.id); return d && d.img === '' && !document.querySelector('.cs-us .cs-av img'); }), 'lixeira tira a foto (img vazio, como a regra aceita) e voltam as iniciais');
  console.log('— celular');
  await p.setViewportSize({ width: 390, height: 844 }); await ir(p, 'adm/perfil', 700);
  conf(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nada rola para o lado no celular');
  conf(erros.length === 0, 'sem erro de JavaScript: ' + erros.join(' | '));
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); await br.close(); process.exit(falhas ? 1 : 0);
})();
