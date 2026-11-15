/* Página dos Treinamentos (Tarefa 4, 14/11): HOJE = v0.6.15.1 como publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Dados inventados de treinamentos (tools/visual/treino-v0615/semente.js). Uso: NODE_PATH=$(npm root -g) node captura6.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img6'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/treino-v0615/semente.js')).toString();
const IMG = {}, NUM = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg, buf0) { const buf = buf0 || await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, sel);
/* deixa só as linhas pedidas (pelo trecho do título) para o recorte caber no assunto do item; a ordem delas no app não muda */
const soLinhas = (p, trechos) => p.evaluate(t => { document.querySelectorAll('.tb-t tbody tr').forEach(tr => { const tx = tr.textContent; tr.style.display = t.some(x => tx.indexOf(x) >= 0) ? '' : 'none'; }); }, trechos);
async function tabelaClip(p) { const a = await caixa(p, '.tb-t thead'), b = await p.evaluate(() => { const l = [...document.querySelectorAll('.tb-t tbody tr')].filter(r => r.style.display !== 'none'); const r = l[l.length - 1].getBoundingClientRect(); return r.bottom; }); const w = await caixa(p, '.tb-w'); return { x: w.x, y: a.y, width: w.width, height: b - a.y + 2 }; }
const lista = async (p, ms) => { await ir(p, 'qualidade/treinos', ms || 1300); };
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w, h] of [['pc', 1280, 800], ['cel', 390, 800]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h, dsf: dev === 'cel' ? 2 : 1, semente: false }); await p.evaluate('(' + SEM + ')()'); await esp(p, 700);
      const L = dev === 'pc' ? 1400 : 780;
      /* 41 e 42 e 43: a lista */
      await lista(p);
      if (dev === 'pc') {
        await grava(p, 'i41-lista-' + suf, await tabelaClip(p), 1400);
        await soLinhas(p, ['Reciclagem', 'Calibração', 'Auditoria interna', 'Uso correto de EPI']); await grava(p, 'i42-ordem-' + suf, await tabelaClip(p), 1400);
        await p.evaluate(() => document.querySelectorAll('.tb-t tbody tr').forEach(tr => { tr.style.display = ''; }));
        await soLinhas(p, ['Uso correto de EPI', 'Coleta de amostras', 'Boas práticas de colheita', 'Higiene pessoal']); await grava(p, 'i43-aval-' + suf, await tabelaClip(p), 1400);
      } else {
        await grava(p, 'i41-lista-cel-' + suf, { x: 0, y: 56, width: 390, height: 520 }, L);
      }
      /* 44: presença */
      await lista(p, 900);
      await p.evaluate(() => trAbre('t1')); await esp(p, 900);
      if (dev === 'pc') await grava(p, 'i45-gav-' + suf, await caixa(p, '#gv'), 900);
      await p.evaluate(() => { document.querySelector('#gv [data-act="tr-pres"]').click(); }); await esp(p, 1000);
      const cx = await caixa(p, '#gv'), vis = await p.evaluate(() => { const c = document.querySelector('#gv .gv-corpo').getBoundingClientRect(); return [...document.querySelectorAll('#gv .tr-lp, #gv .tr-pl')].filter(e => { const r = e.getBoundingClientRect(); return r.top >= c.top - 2 && r.bottom <= c.bottom + 2; }).length; });
      NUM['pres-' + dev + '-' + suf] = vis;
      await grava(p, 'i44-pres-' + dev + '-' + suf, dev === 'pc' ? cx : { x: 0, y: 0, width: 390, height: 800 }, dev === 'pc' ? 900 : 780);
      await p.keyboard.press('Escape'); await esp(p, 400); await p.keyboard.press('Escape'); await esp(p, 500);
      /* 46: nomes na gaveta (só PC; no celular a proposta repete) e a lista filtrada */
      if (dev === 'pc') {
        await p.evaluate(() => trAbre('t1')); await esp(p, 900);
        await p.evaluate(() => { const c = document.querySelector('#gv .gv-corpo'); const e = [...c.querySelectorAll('*')].find(x => /Participantes/i.test(x.textContent) && x.children.length === 0); if (e) e.scrollIntoView({ block: 'start' }); }); await esp(p, 500);
        await grava(p, 'i46-nomes-' + suf, await caixa(p, '#gv'), 900);
        await p.keyboard.press('Escape'); await esp(p, 500);
        await p.evaluate(() => { const st = tbEstado('tr-lista'); st.busca = 'Ana Souza'; st.limite = 100; render(); }); await esp(p, 900);
        await grava(p, 'i46-filtro-' + suf, await tabelaClip(p).catch(() => null) || { x: 0, y: 60, width: 1280, height: 300 }, 1400);
        await p.evaluate(() => { const st = tbEstado('tr-lista'); st.busca = ''; render(); }); await esp(p, 500);
      }
      /* 45: repetir */
      if (dev === 'pc') {
        await p.evaluate(s => { if (s === 'prop') trRepetir('t1'); else trNovo(); }, suf); await esp(p, 1000);
        await grava(p, 'i45-form-' + suf, await caixa(p, '#gv'), 900);
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
    /* 47: lista impressa (t1: 22 nomes) */
    const pdf = '/tmp/tr/imp-' + suf + '.pdf'; fs.mkdirSync('/tmp/tr', { recursive: true });
    execFileSync('node', [path.join(RAIZ, 'tools/visual/treino-v0615/imprime.js'), 't1', pdf, suf === 'hoje' ? 'dist/index-antes.html' : 'dist/index.html'], { cwd: RAIZ, env: process.env });
    execFileSync('pdftoppm', ['-r', '60', '-png', pdf, '/tmp/tr/imp-' + suf]);
    const pgs = fs.readdirSync('/tmp/tr').filter(f => f.startsWith('imp-' + suf + '-') && f.endsWith('.png')).sort(); NUM['pdf-paginas-' + suf] = pgs.length;
    await grava(null, 'i47-imp1-' + suf, null, 560, fs.readFileSync('/tmp/tr/' + pgs[0]));
    if (pgs[1]) await grava(null, 'i47-imp2-' + suf, null, 560, fs.readFileSync('/tmp/tr/' + pgs[1]));
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img6.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens', NUM);
})().catch(e => { console.error(e); process.exit(1); });
