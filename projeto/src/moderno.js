/* EFCwork · moderno.js — v0.6.15 · modernização aprovada pelo Elias em 14/11/2026 (parte 1, ITENS 1 a 15), já com os pedidos dos comentários.
   Fica por último na montagem: embrulha render, cabecalho, csTopo, bgResultados, bgAbrir, bgDesenha e tbHTML. Prefixo: mo. */
(function () {
  'use strict';
  const H = document.documentElement, on = () => true; /* tudo aprovado */
  const mov = () => { try { return !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const pl = (n, um, mais) => (n === 1 ? um : mais);
  const tenta = (f, pad) => { try { return f(); } catch (e) { return pad; } };

  /* ---------- ITEM 1 · Início: "Pede atenção" (todas as áreas) no lugar das caixas do almoxarifado e de "Áreas em construção" ---------- */
  function moAtencaoLinhas() {
    const L = [], add = (n, tipo, um, mais, onde, rota, ico, extra) => { if (n > 0) L.push({ n: n, tipo: tipo, t: pl(n, um, mais), onde: onde, rota: rota, ico: ico, extra: extra || '' }); };
    tenta(() => { if (!alVe()) return; const r = alResumo();
      add(r.calV, 'cr', 'calibração vencida', 'calibrações vencidas', 'Almoxarifado · Equipamentos', 'almox/equipamentos', 'eng');
      add(r.aten.length, 'wa', 'material pede atenção', 'materiais pedem atenção', 'Almoxarifado · Materiais', 'almox/materiais', 'caixa', ' data-act="al-ir" data-f="atencao"');
      add(r.solP, 'wa', 'solicitação pendente', 'solicitações pendentes', 'Almoxarifado · Solicitações', 'almox/solicitacoes', 'doc');
      add(r.calA, 'wa', 'calibração a vencer', 'calibrações a vencer', 'Almoxarifado · Equipamentos', 'almox/equipamentos', 'eng'); });
    tenta(() => { if (!coVe()) return; const r = coResumo();
      add(r.atras, 'cr', 'laudo atrasado', 'laudos atrasados', 'Coletas · Amostras', 'coletas/amostras', 'frasco');
      add(r.naoenv, 'wa', 'amostra não enviada', 'amostras não enviadas', 'Coletas · Amostras', 'coletas/amostras', 'frasco');
      add(agPendLinhas().length, 'wa', 'pendência nas coletas de água', 'pendências nas coletas de água', 'Coletas · Água', 'coletas/agua', 'frasco'); });
    tenta(() => { if (!rtVe() || !isSup(S.user)) return; /* v0.6.17: como no Meu dia do EFClaudian (atribuição Rateios + Líder ★/Principal) */
      add(rtPendCA().length, 'wa', 'amostra enviada sem solicitação de compra', 'amostras enviadas sem solicitação de compra', 'Rateios', 'rateios', 'pizza', ' data-act="rt-ir"'); });
    tenta(() => { const b = S.apont || [], urg = b.filter(a => a.grav === 'urgente' && apAberto(a)).length, ncv = b.filter(a => apNcSit(a) === 'vencida').length, ab = b.filter(apAberto).length - urg;
      add(urg, 'cr', 'apontamento urgente em aberto', 'apontamentos urgentes em aberto', 'Inspeções · Apontamentos', 'inspecoes/apontamentos', 'alerta');
      add(ncv, 'cr', 'NC de apontamento vencida', 'NCs de apontamento vencidas', 'Inspeções · Apontamentos', 'inspecoes/apontamentos', 'lista');
      add(ab, '', 'apontamento em aberto', 'apontamentos em aberto', 'Inspeções · Apontamentos', 'inspecoes/apontamentos', 'lista'); });
    tenta(() => { const h = hojeISO(), v = (S.tarefas || []).filter(t => t.respId === S.user.id && t.status !== 'done' && t.status !== 'cancelada' && !t.excluida && t.prazo && t.prazo < h).length;
      add(v, 'cr', 'tarefa vencida', 'tarefas vencidas', 'Minhas tarefas', 'inicio', 'relogio'); });
    const peso = { cr: 0, wa: 1, '': 2 };
    return L.sort((a, b) => peso[a.tipo] - peso[b.tipo]);
  }
  function moAtencaoHTML() {
    const L = moAtencaoLinhas();
    return '<section class="pn mo-at"><div class="hd"><h3>Pede atenção</h3><em>' + L.length + '</em><span class="sp"></span></div>' +
      (L.length ? L.map(x => '<a class="li ini-li mo-atl" href="#/' + x.rota + '"' + x.extra + '><b class="mo-atn num' + (x.tipo ? ' ' + x.tipo : '') + '">' + x.n + '</b><span class="tx"><b>' + esc(x.t) + '</b><small>' + esc(x.onde) + '</small></span>' + ic('seta') + '</a>').join('') :
        '<div class="vazio">' + ic('ok') + '<b>Tudo em dia.</b><span>Nada pede atenção agora.</span></div>') + '</section>';
  }
  /* ---------- ITEM 2 · Início: "Próximas coletas" (7 dias) ---------- */
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function moProximasHTML() {
    const h = hojeISO(), fim = addDias(h, 7);
    const l = tenta(() => (S.prog || []).concat(typeof pgRzProgs === 'function' ? pgRzProgs() : []).filter(p => p && p.data && p.data >= h && p.data <= fim && pgSit(p) === 'pendente'), []).sort((a, b) => String(a.data).localeCompare(String(b.data))).slice(0, 6);
    if (!tenta(() => coVe(), false)) return '';
    const mat = t => { const s = String(t || '').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
    return '<section class="pn mo-px"><div class="hd"><h3>Próximas coletas</h3><em>' + l.length + '</em><span class="sp"></span><a class="bt lk" href="#/coletas/programacao">Programação</a></div>' +
      (l.length ? l.map(p => { const d = new Date(p.data + 'T12:00:00'), hj = p.data === h, am = p.data === addDias(h, 1);
        return '<a class="li ini-li mo-pxl" href="#/coletas/programacao"><span class="mo-dia' + (hj ? ' hj' : '') + '"><small>' + (hj ? 'hoje' : am ? 'amanhã' : DIAS[d.getDay()]) + '</small><b class="num">' + String(d.getDate()).padStart(2, '0') + '</b></span><span class="tx"><b>' + esc(mat(p.tipo)) + ' · ' + esc(p.talhao || '') + '</b><small>' + esc(p.coletor || 'sem coletor') + '</small></span></a>'; }).join('') :
        '<div class="vazio"><b>Nenhuma coleta programada para os próximos 7 dias.</b></div>') + '</section>';
  }
  const iniOrig = TELAS.inicio;
  TELAS.inicio = function () {
    let h = iniOrig.apply(this, arguments);
    if (on(1)) {
      h = h.replace(/<div class="kps">[\s\S]*?<\/a><\/div>/, '').replace(/<section class="pn"><div class="hd"><h3>Áreas do [\s\S]*?<\/section>/, '');
      h = h.replace('<div class="ini-gr"><div class="ini-col">', '<div class="ini-gr"><div class="ini-col">' + moAtencaoHTML());
    }
    if (on(2)) { const k = h.lastIndexOf('<div class="ini-col">'); if (k >= 0) h = h.slice(0, k) + '<div class="ini-col">' + moProximasHTML() + h.slice(k + '<div class="ini-col">'.length); }
    return h;
  };

  /* ---------- ITEM 4 · Busca vira paleta de comandos: grupo "Ações", "Ctrl K" no topo, abre e fecha suave (P6 do Grok) ---------- */
  const MO_ACOES = [
    ['Novo apontamento', 'inspecoes', 'apontamentos', 'ap-novo', 'lista'], ['Nova verificação de cloro', 'inspecoes', 'cloro', 'cl-nova', 'lista'],
    ['Nova coleta de água', 'coletas', 'agua', 'ag-nova', 'frasco'], ['Enviar amostras', 'coletas', 'amostras', 'co-env', 'sai'],
    ['Entrada de material', 'almox', 'materiais', 'lc-ent', 'entra'], ['Saída de material', 'almox', 'materiais', 'lc-sai', 'sai'],
    ['Nova solicitação', 'almox', 'solicitacoes', 'lc-sol', 'doc'], ['Novo treinamento', 'qualidade', 'treinos', 'tr-novo', 'pessoas'],
    ['Nova análise de problema', 'qualidade', 'analise', 'anp-nova', 'escudo'], ['Importar impresso', 'documentos', 'impressos', 'ip-importar', 'impressora']];
  function moAcaoRoda(a) {
    const faz = () => { const b = [...document.querySelectorAll('.cs-ct [data-act="' + a[3] + '"]')].find(x => !x.getAttribute('data-id') && !x.getAttribute('data-pid')); if (b) b.click(); else aviso('Esta ação não está disponível para o seu perfil nesta tela.'); };
    if (S.rota.area === a[1] && S.rota.aba === a[2]) faz(); else { ir(a[1], a[2]); setTimeout(faz, 120); }
  }
  function moAcoes(q) {
    const vazio = bgNorm(q).trim().length < 2;
    const l = MO_ACOES.filter(a => { const ar = csArea(a[1]), t = ar.abas.find(x => x.id === a[2]); return !ar.negada && !(t && t.negada) && (vazio || bgCasa(q, a[0])); })
      .map(a => ({ grupo: 'Ações', nome: a[0], sub: csArea(a[1]).nome + ' · ' + csNomeRota(a[1] + '/' + a[2]), ico: a[4], abrir: () => moAcaoRoda(a) }));
    const t = csTema() === 'escuro' ? 'claro' : 'escuro';
    if (vazio || bgCasa(q, 'tema ' + t + ' aparência')) l.push({ grupo: 'Ações', nome: 'Usar tema ' + t, sub: 'Aparência', ico: t === 'escuro' ? 'lua' : 'sol', abrir: () => csTrocaTema(t) });
    return vazio ? l.slice(0, 4) : l;
  }
  const bgResOrig = bgResultados;
  bgResultados = function (q) { const r = bgResOrig(q); return on(4) ? moAcoes(q).concat(r) : r; };
  /* pedido do Elias no ITEM 4: suavizar a troca dos resultados enquanto digita — a caixa muda de altura deslizando,
     o que já estava fica parado e o que entra aparece em 150 ms */
  const bgDesOrig = bgDesenha;
  bgDesenha = function () {
    const box = document.getElementById('bg-res'), antes = box ? box.offsetHeight : 0, viu = new Set(box ? [...box.querySelectorAll('.bg-it b')].map(x => x.textContent) : []);
    bgDesOrig.apply(this, arguments);
    if (!box || !mov() || !antes) return;
    box.querySelectorAll('.bg-it').forEach((it, i) => { const b = it.querySelector('b'); if (b && !viu.has(b.textContent)) { it.style.setProperty('--i', Math.min(i, 6)); it.classList.add('mo-novo'); } });
    const depois = box.offsetHeight; if (Math.abs(depois - antes) < 2) return;
    box.style.height = antes + 'px'; box.style.overflow = 'hidden'; void box.offsetHeight; box.classList.add('mo-alt'); box.style.height = depois + 'px';
    clearTimeout(box._moT); box._moT = setTimeout(() => { box.classList.remove('mo-alt'); box.style.height = ''; box.style.overflow = ''; }, 170);
  };
  const bgAbrirOrig = bgAbrir;
  bgAbrir = function () { bgAbrirOrig.apply(this, arguments); const d = document.getElementById('bg'); if (d && on(4)) { d.classList.add('mo-pal'); const i = d.querySelector('#bg-q'); if (i) i.placeholder = 'Buscar documento, material, coleta ou ação…'; } };

  /* ---------- ITEM 5 · Abas com a contagem do que espera uma ação ---------- */
  const MO_CONTA = {
    'almox/solicitacoes': () => alResumo().solP, 'almox/equipamentos': () => alResumo().calV,
    'coletas/amostras': () => coResumo().naoenv, 'coletas/agua': () => agPendLinhas().length,
    'inspecoes/apontamentos': () => (S.apont || []).filter(apAberto).length
  };
  const cabOrig = cabecalho;
  cabecalho = function (o) {
    let h = cabOrig.apply(this, arguments);
    if (on(3) && innerWidth >= 900) h = h.replace(/<div class="cs-bc">([\s\S]*?)<\/div>/, (m, x) => { S._moBc = x; return ''; });
    if (!on(5)) return h;
    return h.replace(/(<a href="#\/([a-z]+\/[a-z]+)"[^>]*>)([^<]*)(<\/a>)/g, (m, a, rota, nome, f) => { const n = MO_CONTA[rota] ? tenta(MO_CONTA[rota], 0) : 0; return n > 0 ? a + nome + '<em class="mo-ct" aria-label="' + n + ' esperando">' + (n > 99 ? '99+' : n) + '</em>' + f : m; });
  };

  /* ---------- ITEM 3 · Caminho (onde estou) na barra de cima; a busca fica compacta à direita ---------- */
  const topoOrig = csTopo;
  csTopo = function () {
    let h = topoOrig.apply(this, arguments); if (!on(3) || innerWidth < 900 || !S._moBc) return h;
    return h.replace('<header class="cs-topo">', '<header class="cs-topo mo-tp">').replace('<button type="button" class="cs-busca"', '<nav class="mo-bc" aria-label="Onde você está">' + S._moBc + '</nav><button type="button" class="cs-busca"');
  };

  /* ---------- ITEM 9 · Gaveta: registro anterior e próximo sem fechar ---------- */
  function moVizinhos() { const l = [...document.querySelectorAll('.cs-ct .tb-t tbody tr[data-act="tb-lin"]')], k = l.findIndex(x => x.classList.contains('sel')); return { l: l, k: k }; }
  function moGvNav(g) {
    if (!on(9) || S.gvForm || !g) return; const v = moVizinhos(); if (v.k < 0 || v.l.length < 2) return;
    const x = g.querySelector('.gv-cab [data-act="gv-fecha"]'); if (!x || g.querySelector('.mo-nav')) return;
    const s = document.createElement('span'); s.className = 'mo-nav';
    s.innerHTML = '<button type="button" class="bt ic-so" data-act="mo-gv" data-d="-1" title="Anterior · ' + v.k + ' de ' + v.l.length + ' (Alt + seta para cima)" aria-label="Registro anterior"' + (v.k === 0 ? ' disabled' : '') + '>' + ic('cima') + '</button><button type="button" class="bt ic-so" data-act="mo-gv" data-d="1" title="Próximo · ' + (v.k + 2) + ' de ' + v.l.length + ' (Alt + seta para baixo)" aria-label="Próximo registro"' + (v.k === v.l.length - 1 ? ' disabled' : '') + '>' + ic('baixo') + '</button>';
    x.parentNode.insertBefore(s, g.querySelector('.gv-cab .gv-lx') || x);
  }
  function moGvVai(d) { const v = moVizinhos(), a = v.l[v.k + d]; if (v.k < 0 || !a) return; a.click(); const g = document.getElementById('gv'), c = g && g.querySelector('.gv-corpo'); if (c && mov()) { c.classList.remove('mo-troca'); void c.offsetWidth; c.style.setProperty('--mo-d', d); c.classList.add('mo-troca'); } const n = moVizinhos().l[v.k + d]; if (n && n.scrollIntoView) n.scrollIntoView({ block: 'nearest' }); }
  if (typeof GV_DEPOIS !== 'undefined') GV_DEPOIS.push(g => moGvNav(g));
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-act="mo-gv"]'); if (b && !b.disabled) moGvVai(+b.getAttribute('data-d')); });
  document.addEventListener('keydown', e => { if (!on(9) || !e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || !document.getElementById('gv') || S.gvForm) return; e.preventDefault(); moGvVai(e.key === 'ArrowUp' ? -1 : 1); });

  /* ---------- ITEM 10 · Dica desenhada nos botões só de ícone (no lugar da dica do navegador) ---------- */
  let ttEl = null, ttT = 0, ttDe = null, ttUlt = 0;
  function ttSome() { clearTimeout(ttT); if (ttDe) { const t = ttDe.getAttribute('data-mo-tt'); if (t != null) { ttDe.setAttribute('title', t); ttDe.removeAttribute('data-mo-tt'); } ttDe = null; } if (ttEl) { ttEl.remove(); ttEl = null; ttUlt = Date.now(); } }
  function ttMostra(el, txt) {
    const r = el.getBoundingClientRect(); if (!r.width) return;
    ttEl = document.createElement('div'); ttEl.className = 'mo-tt'; ttEl.setAttribute('role', 'tooltip'); ttEl.textContent = txt; document.body.appendChild(ttEl);
    const w = ttEl.offsetWidth, h = ttEl.offsetHeight, emb = r.top - h - 8 < 4;
    ttEl.style.left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2)) + 'px'; ttEl.style.top = (emb ? r.bottom + 8 : r.top - h - 8) + 'px';
    ttEl.classList.add(emb ? 'emb' : 'cim'); requestAnimationFrame(() => { if (ttEl) ttEl.classList.add('on'); });
  }
  document.addEventListener('mouseover', e => {
    if (!on(10) || !matchMedia('(hover:hover)').matches) return;
    const el = e.target.closest && e.target.closest('[title]'); if (!el || el === ttDe) return; ttSome();
    const t = el.getAttribute('title'); if (!t || el.closest('.tb-lg') || el.tagName === 'TD') return;
    ttDe = el; el.setAttribute('data-mo-tt', t); el.removeAttribute('title');
    ttT = setTimeout(() => ttMostra(el, t), Date.now() - ttUlt < 400 ? 60 : 450);
  });
  document.addEventListener('mouseout', e => { if (ttDe && !(e.relatedTarget && ttDe.contains(e.relatedTarget))) ttSome(); });
  ['mousedown', 'keydown', 'scroll'].forEach(ev => document.addEventListener(ev, () => ttSome(), true));

  /* ---------- ITEM 8 · Tabela vazia: diz por quê e oferece a saída ---------- */
  const tbOrig = tbHTML;
  tbHTML = function (cfg) {
    let h = tbOrig.apply(this, arguments); if (!on(8) || h.indexOf('class="tb-vz"') < 0) return h;
    const filtrada = (cfg.linhas || []).length > 0 && tbTemFiltro(cfg), un = tbUn(cfg, 2);
    const novo = filtrada
      ? '<div class="mo-vz">' + ic('filtro') + '<b>Nenhum resultado com o filtro atual.</b><span>Há ' + (cfg.linhas || []).length + ' ' + esc(tbUn(cfg, (cfg.linhas || []).length)) + ' fora dele.</span></div>'
      : '<div class="mo-vz">' + ic(csArea(S.rota.area).ic) + '<b>' + esc((cfg.linhas || []).length ? (cfg.vazio || 'Nada encontrado.') : 'Ainda não há ' + un + ' aqui.') + '</b></div>';
    return h.replace(/(<td colspan="\d+" class="tb-vz">)[\s\S]*?(<\/td>)/, '$1' + novo + '$2');
  };

  /* ---------- ITEM 6 · Celular: pastilha no item aberto da barra de baixo, que desliza até o novo ---------- */
  let moBxAnt = -1;
  function moBaixo() {
    const nav = document.querySelector('.cs-baixo'); if (!nav) return; const it = [...nav.children], k = it.findIndex(x => x.classList.contains('on'));
    if (!on(6) || k < 0) { moBxAnt = k; return; }
    const p = document.createElement('i'); p.className = 'mo-pl'; p.setAttribute('aria-hidden', 'true'); nav.appendChild(p);
    const pos = n => { const a = it[n]; return a.offsetLeft + a.offsetWidth / 2; };
    if (moBxAnt >= 0 && moBxAnt !== k && mov()) { p.style.transition = 'none'; p.style.left = pos(moBxAnt) + 'px'; void p.offsetWidth; p.style.transition = ''; }
    p.style.left = pos(k) + 'px'; moBxAnt = k;
  }

  /* ---------- ITENS 12 e 14 · o que fecha sai com efeito (menu da coluna, foto grande, paleta) ---------- */
  function moFantasma(el, cls, ms, pai) { if (!mov()) return; const r = el.getBoundingClientRect(), g = el.cloneNode(true); g.removeAttribute('id'); g.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); g.setAttribute('aria-hidden', 'true'); g.classList.add('mo-fant', cls);
    if (pai) { g.style.position = 'fixed'; g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; g.style.margin = '0'; g.style.right = 'auto'; g.style.bottom = 'auto'; }
    document.body.appendChild(g); if (!window.__moCongela) setTimeout(() => g.remove(), ms + 40); }
  try { new MutationObserver(ms => ms.forEach(m => m.removedNodes.forEach(n => { if (n.nodeType !== 1 || n.classList.contains('mo-fant')) return;
    if (n.id === 'fed-v' && on(14)) moFantasma(n, 'mo-f-fed', 150); else if (n.id === 'bg' && on(4)) moFantasma(n, 'mo-f-bg', 150); }))).observe(document.body, { childList: true }); } catch (e) {}

  /* ---------- ITEM 13 (refeito a pedido do Elias: "não está tão bonito") · Apontamentos: ao trocar o filtro, a lista se rearruma —
     o cartão que continua desliza até o lugar novo, o que entra aparece no lugar dele, o que sai some; sem sequência ---------- */
  let moApF = null, moApRota = '', moApPos = null;
  function moApAntes() {
    const rota = S.rota.area + '/' + S.rota.aba; moApPos = null; if (rota !== 'inspecoes/apontamentos') return;
    const m = {}; document.querySelectorAll('.ap-cards .ap-card').forEach(c => { m[c.getAttribute('data-id')] = c.getBoundingClientRect(); }); moApPos = m;
  }
  function moApont() {
    const rota = S.rota.area + '/' + S.rota.aba, f = S.apF || 'semana', mudou = rota === 'inspecoes/apontamentos' && moApRota === rota && moApF !== null && moApF !== f;
    moApF = rota === 'inspecoes/apontamentos' ? f : null; moApRota = rota;
    if (!mudou || !mov() || !moApPos) return;
    const ms = Mov.ms('--duration-fast', 250);
    document.querySelectorAll('.ap-cards .ap-card').forEach(c => { const r0 = moApPos[c.getAttribute('data-id')], r = c.getBoundingClientRect();
      if (r0) { const dy = r0.top - r.top; if (Math.abs(dy) > 1) c.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.22,1,.36,1)' }); }
      else c.animate([{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.22,1,.36,1)' }); });
  }

  /* ---------- depois de cada desenho da tela ---------- */
  const renderOrig = render;
  render = function () {
    S._moBc = ''; tenta(moApAntes);
    const mn = on(12) && document.querySelector('.tb-mn'), cl = mn ? [mn, mn.getBoundingClientRect()] : null;
    if (cl && mov()) { cl[2] = mn.cloneNode(true); cl[3] = S.tbMenu && S.tbMenu.k; }
    const rol = {}; document.querySelectorAll('.cs-ct .tb[data-tb] .tb-w').forEach(w => { rol[w.closest('.tb').getAttribute('data-tb')] = [w.scrollTop, w.scrollLeft]; }); /* a tabela rola por dentro: o redesenho não volta ao topo */
    renderOrig.apply(this, arguments);
    tenta(tbSobe); tenta(tbAltura); tenta(tbFimVigia);
    document.querySelectorAll('.cs-ct .tb[data-tb] .tb-w').forEach(w => { const r = rol[w.closest('.tb').getAttribute('data-tb')]; if (r) { w.scrollTop = r[0]; w.scrollLeft = r[1]; } });
    const nv = document.querySelector('.tb-mn');
    if (cl && nv && mov() && S.tbMenu && cl[3] !== S.tbMenu.k) { /* pedido do Elias no ITEM 12: trocou de coluna com o menu aberto */
      requestAnimationFrame(() => { const r2 = nv.getBoundingClientRect(), dx = cl[1].left - r2.left, dy = cl[1].top - r2.top; if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
        nv.style.animation = 'none'; nv.style.transition = 'none'; nv.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; void nv.offsetWidth;
        nv.style.transition = 'transform ' + Mov.ms('--duration-fast', 250) + 'ms ' + getComputedStyle(document.documentElement).getPropertyValue('--ease-smooth-out'); nv.style.transform = '';
        setTimeout(() => { nv.style.transition = ''; nv.style.animation = ''; }, 300); });
    }
    if (cl && cl[2] && !nv) { const g = cl[2], r = cl[1]; g.classList.add('mo-fant', 'mo-f-mn'); g.setAttribute('aria-hidden', 'true'); g.style.cssText += ';position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;margin:0;right:auto;bottom:auto'; document.body.appendChild(g); if (!window.__moCongela) setTimeout(() => g.remove(), 190); }
    tenta(moBaixo); tenta(moApont);
  };
  const mnSoltoOrig = typeof tbMenuFechaSolto === 'function' ? tbMenuFechaSolto : null;
  if (mnSoltoOrig) tbMenuFechaSolto = function () { const m = on(12) && document.querySelector('.tb-mn'); if (m) moFantasma(m, 'mo-f-mn', 150, true); return mnSoltoOrig.apply(this, arguments); };

})();
