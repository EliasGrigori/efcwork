// capturas do filtro da coluna e da conferência das tarefas (v0.6.35 e HOJE v0.6.34)
const { chromium } = require('playwright');
const [,, APP, OUT, PRE] = process.argv;
const esp = (p, ms) => p.waitForTimeout(ms);
async function entra(b, w, h) { const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: cel, isMobile: cel, deviceScaleFactor: 2 }), p = await ctx.newPage();
  await p.route(/gstatic|fonts\.g/, r => r.abort()); await p.goto('file://' + APP + '?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800); return p; }
const ITENS = ['Água desmineralizada 1L', 'Alcalino clorado', 'Bateria botão LR44 1.5V', 'Bureta âmbar 25 mL', 'Caixa térmica isopor 05L', 'Caixa térmica isopor 08L', 'Caixa térmica isopor 13L', 'Caneta azul', 'Caneta permanente preta', 'Pilha alcalina AAA', 'Reagente calibração pH4', 'Reagente calibração pH7', 'Reagente calibração pH10', 'Reagente líquido p/ cloro livre (DPD1)'];
async function semeia(p) { await p.evaluate(async l => { for (let i = 0; i < l.length; i++) await Data.col('sv2_alm_itens').set('i' + i, { nome: l[i].toUpperCase(), codigo: String(100 + i), un: 'Un', min: 1, local: 'Porta 0' + (i % 5 + 1), ativo: true }); }, ITENS);
  await p.evaluate(() => { location.hash = '#/almox/materiais'; }); await esp(p, 700); }
const abre = async p => { await p.click('.tb[data-tb="al-mat"] .tb-cab th[data-tbk="nome"] .tb-hm'); await esp(p, 600); };
const foto = async (p, n, cel) => { const m = await p.$('.tb-mn'); const r = await m.boundingBox(); await p.screenshot({ path: OUT + '/' + PRE + n + '.png', clip: cel ? { x: 0, y: Math.max(0, r.y - 10), width: 390, height: Math.min(820 - Math.max(0, r.y - 10), r.height + 20) } : { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 50), width: Math.min(r.width + 40, 1366), height: r.height + 70 } }); };
(async () => {
  const b = await chromium.launch();
  for (const [w, h, s] of [[1366, 820, 'pc'], [390, 820, 'cel']]) {
    const p = await entra(b, w, h); await semeia(p); await abre(p);
    await p.fill('[data-tbmnbusca]', 'isopor 5l'); await esp(p, 500); await foto(p, 'f1-' + s, s === 'cel');
    if (PRE === 'novo-') {
      await p.click('.tb-mn-li:not(.tb-mn-all) input'); await esp(p, 400); await foto(p, 'f2-' + s, s === 'cel');
      await p.fill('[data-tbmnbusca]', 'ph10'); await esp(p, 450); await p.click('.tb-mn-li:not(.tb-mn-all) input'); await esp(p, 400);
      await p.fill('[data-tbmnbusca]', 'caneta'); await esp(p, 450); await p.click('.tb-mn-li.tb-mn-all input'); await esp(p, 400); await foto(p, 'f3-' + s, s === 'cel');
      await p.fill('[data-tbmnbusca]', ''); await esp(p, 450); await foto(p, 'f4-' + s, s === 'cel');
      if (s === 'pc') { await p.keyboard.press('Escape'); await esp(p, 500); await p.screenshot({ path: OUT + '/' + PRE + 'f5-pc.png', clip: { x: 230, y: 0, width: 1136, height: 520 } }); }
    } else {
      await p.fill('[data-tbmnbusca]', 'isopor'); await esp(p, 500); await foto(p, 'f2-' + s, s === 'cel');
    }
    await p.context().close();
  }
  /* tarefas */
  const p = await entra(b, 1366, 820);
  await p.evaluate(async () => { const h = hojeISO(), me = S.user.id;
    await Data.col('sv2_users').set('u2', { nome: 'Marcos Lima', login: 'marcos', perfil: 'secundario', estrela: true, superiores: [], status: 'ativo' });
    await Data.col('sv2_tarefas').set('a1', { titulo: 'Conferir o cloro dos bebedouros', respId: me, porId: 'u2', prazo: h, status: 'todo', confere: true });
    await Data.col('sv2_tarefas').set('a2', { titulo: 'Atualizar a planilha de calibração', respId: me, porId: 'u2', prazo: h, status: 'review', confere: true }); });
  await p.evaluate(() => { location.hash = '#/inicio'; }); await esp(p, 700);
  const g = async n => { await p.evaluate(i => tfAbre(i), n); await esp(p, 600); const r = await (await p.$('#gv')).boundingBox(); await p.screenshot({ path: OUT + '/' + PRE + 't-' + n + '.png', clip: { x: r.x, y: r.y, width: r.width, height: r.height } }); await p.evaluate(() => gvFecharSo()); await esp(p, 300); };
  await g('a1'); await g('a2');
  const li = await p.$('.tf-pn'); if (li) await li.screenshot({ path: OUT + '/' + PRE + 't-lista.png' });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
