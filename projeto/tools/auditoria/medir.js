/* EFC · medidor da auditoria visual (família EFClaudian) — versão 1 (13/11/2026).
   Mede o que a skill auditoria-visual-efc pede, igual em qualquer projeto:
   PARTE 1 (CSS, sem abrir o app): durações fora da escala de movimento, animação que não para, transition:all,
     arquivo com animação sem "movimento reduzido", cor escrita direto fora dos tokens.
   PARTE 2 (app aberto, Playwright): por tela × largura × tema — rolagem para o lado, botões abaixo do mínimo,
     quantos tamanhos de letra, emoji, erro no console, animação infinita rodando, botões/campos lado a lado desalinhados.
   Uso: NODE_PATH=$(npm root -g) node tools/auditoria/medir.js tools/auditoria/efcwork.json [--so-css] [--json saida.json] [--estrito]
   Exceção marcada no CSS: um comentário com a palavra mov:ok na mesma linha (ex.: o reflexo aprovado do botão dourado). */
const fs = require('fs'), path = require('path');
const ESCALA = [40, 60, 80, 150, 250, 350, 400, 455, 500]; /* ms dos tokens (60 = trecho b da tremida; 455 = número discreto) */
const cfgArq = process.argv[2]; if (!cfgArq) { console.log('Uso: node medir.js config.json [--so-css] [--json saida.json] [--estrito]'); process.exit(2); }
const CFG = JSON.parse(fs.readFileSync(cfgArq, 'utf8')), BASE = path.resolve(path.dirname(cfgArq), CFG.raiz || '.');
const arg = n => process.argv.indexOf(n) >= 0, argV = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const achados = []; const add = (parte, nivel, onde, oque, sug) => achados.push({ parte, nivel, onde, oque, sug });

/* ---------- PARTE 1: CSS ---------- */
function arquivosCss() {
  const l = []; (CFG.css || []).forEach(p => { const d = path.resolve(BASE, path.dirname(p)), re = new RegExp('^' + path.basename(p).replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    if (fs.existsSync(d)) fs.readdirSync(d).filter(f => re.test(f)).forEach(f => l.push(path.join(d, f))); }); return l;
}
const paraMs = t => /ms$/.test(t) ? parseFloat(t) : parseFloat(t) * 1000;
function parte1() {
  for (const f of arquivosCss()) {
    const nome = path.relative(BASE, f), txt = fs.readFileSync(f, 'utf8'), linhas = txt.split('\n');
    let temMov = false, temReduz = /prefers-reduced-motion/.test(txt);
    linhas.forEach((ln, i) => {
      const ok = /mov:ok/.test(ln), onde = nome + ':' + (i + 1), imp = /#au-imp|@media\s+print|@page/.test(ln);
      const decl = ln.match(/(?:transition|animation)\s*:[^;}]*/g) || [];
      decl.forEach(d => {
        temMov = true;
        if (/transition\s*:\s*all\b/.test(d)) add('CSS', 'defeito', onde, 'transition: all', 'Animar só as propriedades que mudam (transform, opacity).');
        if (/infinite/.test(d) && !ok) add('CSS', 'decisão', onde, 'animação que não para: ' + d.trim().slice(0, 70), 'Rodar uma vez, ou tirar. Se for aprovada, marcar com o comentário mov:ok.');
        if (/var\(--/.test(d)) return;
        (d.match(/(?<![\w-])\d*\.?\d+m?s\b/g) || []).forEach(t => { const v = Math.round(paraMs(t)); if (v === 0) return;
          if (ESCALA.indexOf(v) < 0 && !ok) add('CSS', 'ajuste', onde, 'duração fora da escala: ' + t + ' em "' + d.trim().slice(0, 60) + '"', 'Usar o token do mesmo uso (--duration-quick 150, fast 250, medium 350, slow 400…).'); });
      });
      if (!imp && !ok && !/^\s*--|^\s*:root|--[\w-]+\s*:/.test(ln)) {
        const hx = ln.match(/#[0-9a-fA-F]{3,8}\b/g); if (hx && !/^\s*\/\*/.test(ln)) add('CSS', 'ajuste', onde, 'cor escrita direto: ' + Array.from(new Set(hx)).join(' '), 'Trocar por um token de cor (var(--…)).');
      }
    });
    if (temMov && !temReduz) add('CSS', 'defeito', nome, 'tem animação mas não respeita "movimento reduzido"', 'Acrescentar @media (prefers-reduced-motion:reduce).');
  }
}

/* ---------- PARTE 2: app aberto ---------- */
async function passos(p, l) { for (const s of l || []) {
  if (s.ir) await p.goto(s.ir.indexOf('://') > 0 ? s.ir : 'file://' + path.resolve(BASE, s.ir));
  if (s.fill) await p.fill(s.fill[0], s.fill[1]); if (s.click) await p.click(s.click);
  if (s.eval) await p.evaluate(s.eval); if (s.espera) await p.waitForTimeout(s.espera); } }
async function parte2() {
  let chromium; try { ({ chromium } = require('playwright')); } catch { add('App', 'aviso', '-', 'Playwright não encontrado: parte 2 não rodou', 'Rodar com NODE_PATH=$(npm root -g).'); return; }
  const b = await chromium.launch();
  for (const w of CFG.larguras || [1280, 390]) for (const tema of Object.keys(CFG.temas || { padrao: '' })) {
    const cel = w < 600, p = await (await b.newContext({ viewport: { width: w, height: cel ? 820 : 860 }, hasTouch: cel, isMobile: cel, reducedMotion: 'no-preference' })).newPage(), er = [];
    p.on('pageerror', e => er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource/.test(m.text())) er.push(m.text()); });
    await p.route(/gstatic|fonts\.g/, r => r.abort());
    await passos(p, CFG.antes); if (CFG.temas && CFG.temas[tema]) await p.evaluate(CFG.temas[tema]);
    for (const r of CFG.telas || []) {
      const onde = r.nome + ' · ' + w + ' · ' + tema; er.length = 0;
      await passos(p, r.passos); await p.waitForTimeout(r.espera || 700);
      const m = await p.evaluate(({ cel, minPc, minCel, ign, infOk }) => {
        const fora = e => ign.some(s => { try { return e.closest(s); } catch { return false; } });
        const vis = e => { if (fora(e)) return false; const s = getComputedStyle(e), r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < innerHeight * 3; };
        const bts = [...document.querySelectorAll('button,.bt,a.bt,[role=button],input:not([type=checkbox]):not([type=radio]):not([type=file]),select,.dd-b')].filter(vis);
        const baixos = bts.map(e => ({ t: (e.getAttribute('aria-label') || e.textContent || e.className || '').trim().slice(0, 30), h: Math.round(e.getBoundingClientRect().height) }))
          .filter(x => x.h < (cel ? minCel : minPc) && x.h >= 12);
        const tams = new Set(); const emo = [];
        document.querySelectorAll('body *').forEach(e => { if (!vis(e)) return; const tx = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); if (!tx) return;
          tams.add(getComputedStyle(e).fontSize); if (/\p{Extended_Pictographic}/u.test(tx) && !/[©®™]/.test(tx)) emo.push(tx.slice(0, 30)); });
        const inf = (document.getAnimations ? document.getAnimations() : []).filter(a => a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity && a.playState === 'running' && infOk.indexOf(a.animationName) < 0)
          .map(a => (a.animationName || 'anim') + ' em ' + ((a.effect.target && (a.effect.target.className && String(a.effect.target.className.baseVal != null ? a.effect.target.className.baseVal : a.effect.target.className))) || '?').slice(0, 40));
        /* lado a lado: filhos visíveis da mesma linha com alturas diferentes */
        const desal = []; const grupos = new Set(bts.map(e => e.parentElement));
        grupos.forEach(g => { if (!g) return; const fs = [...g.children].filter(c => vis(c) && (c.matches('button,.bt,input,select,.dd,.dd-b,a.bt,label.fm-ck') ));
          if (fs.length < 2) return; const rs = fs.map(c => c.getBoundingClientRect());
          for (let i = 1; i < rs.length; i++) { const a = rs[i - 1], b = rs[i]; if (Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)) < 6 && Math.abs(a.height - b.height) > 1 && !fs[i].matches('label.fm-ck') && !fs[i - 1].matches('label.fm-ck'))
            desal.push(((fs[i - 1].textContent || '').trim().slice(0, 18) || fs[i - 1].className) + ' (' + Math.round(a.height) + ') × ' + ((fs[i].textContent || '').trim().slice(0, 18) || fs[i].className) + ' (' + Math.round(b.height) + ')'); } });
        return { scroll: document.documentElement.scrollWidth > innerWidth + 1, baixos: baixos.slice(0, 6), nb: baixos.length, tams: [...tams].length, emo: emo.slice(0, 3), inf: Array.from(new Set(inf)).slice(0, 5), desal: desal.slice(0, 5) };
      }, { cel, minPc: CFG.botaoMinPc || 32, minCel: CFG.botaoMinCel || 44, ign: CFG.ignorar || [], infOk: CFG.infinitasAprovadas || [] });
      if (m.scroll) add('App', 'defeito', onde, 'a tela rola para o lado', 'Achar o elemento mais largo que a tela.');
      if (m.nb) add('App', cel ? 'defeito' : 'ajuste', onde, m.nb + ' botão(ões)/campo(s) abaixo de ' + (cel ? CFG.botaoMinCel || 44 : CFG.botaoMinPc || 32) + ' px: ' + m.baixos.map(x => '"' + x.t + '" ' + x.h).join(', '), 'Usar a altura padrão de toque.');
      if (m.tams > (CFG.maxTamanhos || 7)) add('App', 'ajuste', onde, m.tams + ' tamanhos de letra (meta: até ' + (CFG.maxTamanhos || 7) + ')', 'Juntar tamanhos parecidos.');
      if (m.emo.length) add('App', 'defeito', onde, 'emoji na tela: ' + m.emo.join(' | '), 'Trocar por ícone desenhado (SVG).');
      if (m.inf.length) add('App', 'decisão', onde, 'animação infinita rodando: ' + m.inf.join('; '), 'Só a exceção aprovada pode ficar.');
      if (m.desal.length) add('App', 'defeito', onde, 'lado a lado com alturas diferentes: ' + m.desal.join('; '), 'Mesma linha, mesma altura (regra de 11/11).');
      if (er.length) add('App', 'defeito', onde, er.length + ' erro(s) no console: ' + er[0].slice(0, 90), 'Corrigir antes de entregar.');
    }
    await p.context().close();
  }
  await b.close();
}

(async () => {
  parte1(); if (!arg('--so-css')) await parte2();
  const ord = { defeito: 0, decisão: 1, ajuste: 2, aviso: 3 }; achados.sort((a, b) => ord[a.nivel] - ord[b.nivel]);
  const cont = n => achados.filter(a => a.nivel === n).length;
  console.log('Medidor da auditoria · ' + (CFG.nome || cfgArq) + '\n' + 'defeitos ' + cont('defeito') + ' · decisões ' + cont('decisão') + ' · ajustes ' + cont('ajuste') + ' · avisos ' + cont('aviso') + '\n');
  /* o mesmo achado em várias telas, larguras ou temas sai uma vez só, com a lista de onde aparece */
  const grupos = []; achados.forEach(a => { const g = grupos.find(x => x.nivel === a.nivel && x.parte === a.parte && x.oque === a.oque); if (g) g.ondes.push(a.onde); else grupos.push(Object.assign({ ondes: [a.onde] }, a)); });
  grupos.forEach(a => console.log('[' + a.nivel + '] ' + a.parte + ' · ' + (a.ondes.length > 3 ? a.ondes.slice(0, 3).join(' | ') + ' … (+' + (a.ondes.length - 3) + ')' : a.ondes.join(' | ')) + '\n    ' + a.oque + '\n    → ' + a.sug));
  const js = argV('--json'); if (js) fs.writeFileSync(js, JSON.stringify({ nome: CFG.nome, quando: new Date().toISOString(), achados }, null, 1));
  process.exit(arg('--estrito') && cont('defeito') ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
