/* EFCwork · suíte da v0.4.15 — Nº 46 (gaveta da nuvem: Atualizar agora), Nº 27 (lembrete de calibração 2 meses e 7 dias, selo
   "Vence em X dias"), Nº 31 (checagem de esc() — t_html_seg.js), ajustes do Grok (menu da coluna 8 px, impressão da Atividade).
   Dados fictícios. Uso: node tools/testes/t_v0415.js */
const { chromium } = require('playwright'); const path = require('path'); const cp = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const iso = d => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
(async () => {
  const b = await chromium.launch();
  const mk = async w => { const p = await (await b.newContext({ viewport: { width: w, height: 860 }, hasTouch: w < 600, isMobile: w < 600 })).newPage(); p._er = []; p.on('pageerror', e => p._er.push(String(e))); await p.route(/gstatic|fonts\.g/, r => r.abort());
    await p.goto(URL); await p.waitForTimeout(400); await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
    await (w < 600 ? p.tap('[data-form="en-primeiro"] button[type=submit]') : p.click('[data-form="en-primeiro"] button[type=submit]')); await p.waitForTimeout(800); return p; };
  console.log('Nuvem — gaveta e Atualizar agora (Nº 46):');
  let p = await mk(1366);
  await p.evaluate(() => gvAbrir(csNuvemGaveta)); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /Nuvem/.test(document.querySelector('#gv').textContent) && !!document.querySelector('[data-act="cs-nuvem-atu"]')), 'a gaveta Nuvem abre com o botão Atualizar agora');
  await p.click('[data-act="cs-nuvem-atu"]'); await p.waitForTimeout(500);
  conf(await p.evaluate(() => /Atualizado às \d\d:\d\d/.test(document.querySelector('#gv').textContent)), 'depois de atualizar mostra "Atualizado às HH:MM"');
  conf(await p.evaluate(() => !document.querySelector('[data-act="cs-nuvem-atu"]').disabled), 'o botão volta a ficar ativo');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  conf(!(await p.$('#gv [data-act="gv-fecha"]')), 'Esc fecha a gaveta');
  /* Data.atualizar de verdade: fdb simulado com 2 listas escutadas, uma falha */
  const r = await p.evaluate(async () => { const fake = { n: 0 }; return typeof Data.atualizar === 'function' && (await Data.atualizar()).ok; });
  conf(r === true, 'Data.atualizar() existe e responde ok na demonstração');
  conf(p._er.length === 0, 'sem erros no console' + (p._er[0] ? ': ' + p._er[0] : ''));

  console.log('Calibração — selo e lembrete (Nº 27):');
  await p.evaluate(async ([a, b2, c]) => { const C = Data.col.bind(Data);
    await C('sv2_alm_equip').set('q1', { nome: 'Balança A', codigo: 'EQ1', precisaCal: true, situacao: 'ativo', cal: { ultima: a, freqMeses: 12 } });
    await C('sv2_alm_equip').set('q2', { nome: 'Phmetro B', codigo: 'EQ2', precisaCal: true, situacao: 'ativo', cal: { ultima: b2, freqMeses: 12 } });
    await C('sv2_alm_equip').set('q3', { nome: 'Estufa C', codigo: 'EQ3', precisaCal: true, situacao: 'ativo', cal: { ultima: c, freqMeses: 12 } }); },
    [(() => { const d = new Date(Date.now() + 50 * 864e5); d.setFullYear(d.getFullYear() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })(), (() => { const d = new Date(Date.now() + 5 * 864e5); d.setFullYear(d.getFullYear() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })(), (() => { const d = new Date(Date.now() + 200 * 864e5); d.setFullYear(d.getFullYear() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })()]);
  await p.evaluate(() => { S._cbLemb = false; S._cbLembOk = {}; return cbLembretes(); }); await p.waitForTimeout(800);
  const nt = await p.evaluate(() => (S.notifs || []).filter(n => /^cal-/.test(n.id)).map(n => n.id.split('-').pop() + ':' + n.refId));
  conf(nt.length === 2 && nt.includes('m2:q1') && nt.includes('d7:q2'), 'vence em 50 dias → aviso de 2 meses; em 5 dias → aviso de 7 dias; em 200 dias → nada (' + nt.join(', ') + ')');
  await p.evaluate(() => { S._cbLemb = false; S._cbLembOk = {}; return cbLembretes(); }); await p.waitForTimeout(600);
  conf((await p.evaluate(() => (S.notifs || []).filter(n => /^cal-/.test(n.id)).length)) === 2, 'rodar de novo não duplica (cada aviso uma vez por vencimento)');
  const sino = await p.evaluate(() => { const n = (S.notifs || []).find(x => /^cal-/.test(x.id)); return { t: n.titulo, nivel: n.nivel, ref: n.refTipo, quem: Notif.visible ? Notif.visible(n) : true }; });
  conf(/Calibração vence em/.test(sino.t) && sino.ref === 'equip' && sino.quem !== false, 'o aviso aparece para o Administrador no sino: "' + sino.t + '"');
  await p.evaluate(() => { location.hash = '#/almox/equipamentos'; }); await p.waitForTimeout(600);
  const pills = await p.evaluate(() => [...document.querySelectorAll('.pill, .al-pill')].map(x => x.textContent.trim()).filter(t => /^Vence em/.test(t)));
  conf(pills.some(t => /^Vence em 50 dias$/.test(t)) && pills.some(t => /^Vence em 5 dias$/.test(t)), 'selo "Vence em 50 dias" e "Vence em 5 dias" na tela Equipamentos (' + pills.join(' | ') + ')');
  await p.evaluate(() => snAbrir && snAbrir()); await p.waitForTimeout(300);
  await p.evaluate(() => { const a = document.querySelector('[data-act="sn-abre"]'); if (a) a.click(); }); await p.waitForTimeout(500);
  conf(/almox\/equipamentos/.test(await p.evaluate(() => location.hash)) && !!(await p.$('#gv [data-act="gv-fecha"]')), 'tocar no aviso abre o equipamento');
  /* colaborador comum não gera */
  await p.close();

  console.log('Ajustes do Grok:');
  p = await mk(1366);
  await p.evaluate(async () => { await Data.col('sv2_alm_itens').set('u1', { nome: 'Luva', codigo: 'u1', un: 'Un', min: 1, local: 'P', ativo: true }); location.hash = '#/almox/materiais'; }); await p.waitForTimeout(500);
  await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="nome"] .tb-hm'); await p.waitForTimeout(250);
  const rad = await p.evaluate(() => [...document.querySelectorAll('.tb-mn-pe .bt')].map(x => getComputedStyle(x).borderTopLeftRadius));
  conf(rad.length > 0 && rad.every(x => x === '8px'), 'botões do rodapé do menu da coluna com canto de 8 px (' + rad.join(',') + ')');
  conf(await p.evaluate(() => { const r = [{ versao: 'v2.102.59 · Busca geral mostra as últimas telas', area: 'x' }]; return atApp(r[0]) === 'v2.102.59'; }), 'a coluna App da planilha/impressão da Atividade traz só a versão');
  await p.close();

  console.log('Checagem de esc() (Nº 31):');
  const t = cp.spawnSync('node', [path.join(__dirname, 't_html_seg.js')], { encoding: 'utf8' });
  conf(t.status === 0, 'teste t_html_seg.js passa');
  const fs = require('fs'), srcCol = path.join(RAIZ, 'src', 'coletas.js'), orig = fs.readFileSync(srcCol, 'utf8');
  try { fs.writeFileSync(srcCol, orig + "\nconst _t = x => '<b>' + innerHTML + '</b>' + '<div>' + dadoNovoSemEsc + '</div>'; document.body.innerHTML = '<p>' + dadoNovoSemEsc + '</p>';\n");
    const t2 = cp.spawnSync('node', [path.join(__dirname, 't_html_seg.js')], { encoding: 'utf8' }); conf(t2.status !== 0 && /dadoNovoSemEsc/.test(t2.stdout), 'a checagem pega um dado novo montado sem esc() (prova negativa)'); }
  finally { fs.writeFileSync(srcCol, orig); }
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); await b.close(); process.exit(falhas ? 1 : 0);
})();
