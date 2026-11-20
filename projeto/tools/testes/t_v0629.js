/* EFCwork · v0.6.29 · Acesso e senha (S2, S3, S5, C4 da varredura de 20/11). Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0629.js */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), fs = require('fs'), RAIZ = path.resolve(__dirname, '..', '..');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const fm = (p, campo, v) => p.evaluate(([c, x]) => { const i = document.querySelector('#gv [data-fm="' + c + '"]'); if (!i) return; i.value = x; i.dispatchEvent(new Event('input', { bubbles: true })); }, [campo, v]);
const msg = p => p.evaluate(() => (document.querySelector('#gv .fm-msg') || {}).textContent || '');
const cl = (p, a) => p.click('[data-act="' + a + '"]').then(() => p.waitForTimeout(500));
const txt = p => p.evaluate(() => document.body.innerText);
(async () => { const br = await chromium.launch();
  let p = await abre(br, { raiz: RAIZ, w: 1280, h: 860, semente: false }); await p.waitForTimeout(400);

  console.log('— S3 · Pessoas: 8 caracteres, campo escondido, troca no primeiro acesso');
  await ir(p, 'adm/pessoas', 900); await cl(p, 'pes-novo');
  conf(await p.evaluate(() => { const i = document.querySelector('#gv [data-fm="senha"]'); return !!i && i.type === 'password'; }), 'senha inicial em campo escondido (type=password)');
  conf(await p.evaluate(() => !!document.querySelector('#gv [data-act="pes-ver"]')), 'botão de olho para mostrar a senha inicial');
  const cria = async (login, senha) => { if (!(await p.$('#gv [data-fm="senha"]'))) { await p.evaluate(() => pesNovo()); await p.waitForTimeout(400); }
    await fm(p, 'nome', 'Marta Rocha'); await fm(p, 'login', login); await fm(p, 'senha', senha);
    await p.evaluate(() => { const c = document.querySelector('#gv input[type=checkbox][data-fm^="at."]'); if (c && !c.checked) c.click(); });
    await cl(p, 'pes-ed-ok'); await p.waitForTimeout(400); };
  await cria('marta.curta', 'abc123');
  conf(!(await p.evaluate(() => S.users.some(u => u.login === 'marta.curta'))), 'senha inicial de 6 não cria: ' + await msg(p));
  await cria('marta.rocha', 'inicio2026');
  const marta = await p.evaluate(() => S.users.find(u => u.login === 'marta.rocha'));
  conf(marta && marta.precisaCompletar === true, 'pessoa nova gravada com precisaCompletar = true: ' + JSON.stringify(marta && marta.precisaCompletar));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  console.log('— S3 · Meu perfil: 8 caracteres');
  await ir(p, 'adm/perfil', 800);
  await p.fill('#pes-s1', 'abc123'); await p.fill('#pes-s2', 'abc123'); await cl(p, 'pes-senha');
  conf(/8/.test(await p.evaluate(() => $('#pes-smsg').textContent)), 'Meu perfil recusa senha de 6: ' + await p.evaluate(() => $('#pes-smsg').textContent));

  console.log('— S2 · Meu perfil: e-mail para recuperar');
  conf(await p.evaluate(() => !!document.querySelector('#pes-email') && !!document.querySelector('[data-act="pes-email"]')), 'campo e botão do e-mail para recuperar');
  if (await p.$('#pes-email')) {
    await p.fill('#pes-email', 'joana@exemplo'); await cl(p, 'pes-email');
    conf(/e-mail válido/.test(await p.evaluate(() => ($('#pes-emsg') || {}).textContent || '')), 'e-mail sem domínio é recusado');
    await p.fill('#pes-email', 'joana@exemplo.com'); await cl(p, 'pes-email'); await p.waitForTimeout(400);
    conf(await p.evaluate(() => { const u = S.users.find(x => x.id === S.user.id); return u.email === 'joana@exemplo.com' && u.emailOk === true; }), 'demonstração: e-mail gravado e confirmado no cadastro');
    conf(await p.evaluate(() => Data.auth.emailDoLogin('joana.silva').then(e => e === 'joana@exemplo.com')), 'login → e-mail encontrado para recuperar');
  }

  console.log('— S2 · Esqueci a senha');
  await p.evaluate(() => Data.auth.signOut()); await p.waitForTimeout(600);
  await p.click('[data-act="en-esqueci"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => !!document.querySelector('[data-form="en-recup"]')), 'Esqueci a senha abre a tela de recuperar (antes: só um aviso)');
  if (await p.$('[data-form="en-recup"]')) {
    await p.fill('#en-rlogin', 'joana.silva'); await p.click('[data-form="en-recup"] button[type=submit]'); await p.waitForTimeout(600);
    const m1 = await p.evaluate(() => $('#en-msg').textContent); conf(/Se houver um e-mail cadastrado/.test(m1) && !/@/.test(m1), 'login com e-mail: frase única, sem mostrar o e-mail: ' + m1);
    await p.fill('#en-rlogin', 'marta.rocha'); await p.click('[data-form="en-recup"] button[type=submit]'); await p.waitForTimeout(600);
    conf(await p.evaluate(() => $('#en-msg').textContent) === m1, 'login sem e-mail: a MESMA frase (não revela se existe)');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    conf(await p.evaluate(() => !!document.querySelector('[data-form="en-entrar"]')), 'Esc volta para Entrar (uma camada)');
  }

  console.log('— S3 · Primeiro acesso da pessoa nova');
  await p.fill('#en-login', 'marta.rocha'); await p.fill('#en-senha', 'inicio2026'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(900);
  conf(await p.evaluate(() => !!document.querySelector('[data-form="en-trocar"]') && !document.querySelector('.cs-topo, .cs-menu')), 'entra e cai em "Crie a sua senha" antes do app');
  if (await p.$('[data-form="en-trocar"]')) {
    await p.fill('#en-senha', 'inicio2026'); await p.fill('#en-senha2', 'inicio2026'); await p.click('[data-form="en-trocar"] button[type=submit]'); await p.waitForTimeout(500);
    conf(/diferente/.test(await p.evaluate(() => $('#en-msg').textContent)), 'não aceita repetir a senha inicial');
    await p.fill('#en-senha', 'marta-nova-1'); await p.fill('#en-senha2', 'marta-nova-1'); await p.fill('#en-email', 'marta@exemplo.com'); await p.click('[data-form="en-trocar"] button[type=submit]'); await p.waitForTimeout(900);
    const m2 = await p.evaluate(() => S.users.find(u => u.login === 'marta.rocha'));
    conf(m2 && m2.precisaCompletar === false && m2.senhaTrocadaEm && m2.email === 'marta@exemplo.com', 'grava precisaCompletar = false, senhaTrocadaEm e o e-mail');
    conf(await p.evaluate(() => !document.querySelector('[data-form="en-trocar"]')), 'depois de criar a senha, abre o app');
    conf(await p.evaluate(() => JSON.parse(localStorage.getItem('sv2demo_auth'))['marta.rocha'].pass === 'marta-nova-1'), 'a senha nova vale');
  }

  console.log('— S5 · Link do impresso');
  await p.evaluate(() => { Data.auth.signOut(); const a = JSON.parse(localStorage.getItem('sv2demo_auth')); a['joana.silva'].pass = 'senha1234'; localStorage.setItem('sv2demo_auth', JSON.stringify(a)); }); await p.waitForTimeout(500);
  await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(900);
  await p.evaluate(() => Data.col('efd_docs').set('ipx', { v: 1, tipo: 'link', nome: 'Link estranho', link: 'javascript:alert(document.domain)', pasta: 'Geral', status: 'vigente', alteradoEm: nowISO(), alteradoPor: 'Teste' }));
  await ir(p, 'documentos/impressos', 900); await p.evaluate(() => ipAbre('ipx')); await p.waitForTimeout(500);
  conf(await p.evaluate(() => !!document.querySelector('#gv') && /Link estranho/.test(document.querySelector('#gv').textContent)), 'a gaveta do impresso abriu');
  conf(await p.evaluate(() => ![...document.querySelectorAll('a[href]')].some(a => /^\s*javascript:/i.test(a.getAttribute('href')))), 'link javascript: não vira <a href> nem botão Abrir');
  await p.evaluate(() => Data.col('efd_docs').set('ipy', { v: 1, tipo: 'link', nome: 'Link bom', link: 'https://exemplo.com/norma', pasta: 'Geral', status: 'vigente', alteradoEm: nowISO(), alteradoPor: 'Teste' }));
  await p.evaluate(() => ipAbre('ipy')); await p.waitForTimeout(500);
  conf(await p.evaluate(() => [...document.querySelectorAll('#gv a[href="https://exemplo.com/norma"]')].length === 2), 'link https continua abrindo (endereço e botão)');

  console.log('— C4 · travessão no apontamento');
  const fonte = fs.readFileSync(path.join(RAIZ, 'src/apont.js'), 'utf8');
  conf(!/' — '/.test(fonte), 'apont.js sem o separador " — " em texto visível');

  conf(!p._er.length, 'console sem erro' + (p._er.length ? ': ' + p._er.join(' | ') : ''));
  await br.close(); console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
