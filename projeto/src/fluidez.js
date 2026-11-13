/* EFCwork · fluidez.js — v0.6.14 "Movimento" (aprovado em 13/11/2026). Prefixo: fz.
   Usa a escala comum da família (tools/visual/efc-movimento.css + Mov, carregados antes de tudo).
   Efeitos que o Elias escolheu (página "Efeitos e fluidez"): troca de tela fluida, título que entra (Blur Text),
   lista que entra em sequência (Animated List), desfoque no fim da lista (Gradual Blur), faíscas ao salvar (Click Spark).
   E as receitas da página "Movimento": avisos um por vez com o visto, janela de confirmação, lista retrátil,
   traço da aba que desliza, tremida no erro, troca do ícone do tema. Tudo para com "movimento reduzido". */
const fzMov = () => !Mov.reduzido();

/* ---------- avisos: um por vez, sobem de baixo; o de sucesso traz o visto que se desenha ---------- */
const FZ_VISTO = '<span class="av-vs t-success-check" data-state="out" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
function fzAvFecha(d) { if (!d || d._saindo) return; d._saindo = true; clearTimeout(d._t); d.classList.add('av-sai'); Mov.fecha(d, () => d.remove(), '--toast-close'); }
aviso = function (txt, tipo, desfazer) {
  const h = $('#avisos'); if (!h) return;
  [...h.querySelectorAll('.av')].forEach(fzAvFecha);
  const ok = !tipo || tipo === 'ok', d = document.createElement('div'); d.className = 'av t-toast ' + (tipo || 'ok'); d.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  d.innerHTML = (ok ? FZ_VISTO : '') + '<span>' + esc(txt) + '</span>' + (desfazer ? '<button type="button" class="av-df">Desfazer</button>' : '');
  if (desfazer) d.querySelector('.av-df').addEventListener('click', () => { try { desfazer(); } catch {} fzAvFecha(d); });
  h.appendChild(d); Mov.abre(d);
  if (ok) { setTimeout(() => Mov.visto(d.querySelector('.t-success-check')), 90); fzFaiscaSeSalvou(); }
  d._t = setTimeout(() => fzAvFecha(d), desfazer ? 6000 : 3800);
};

/* ---------- faíscas ao salvar (Click Spark): só no botão principal, e só quando a ação deu certo ---------- */
S._fzBt = null;
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('.bt.pr'); if (b && !b.closest('.en')) S._fzBt = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
function fzFaiscaSeSalvou() {
  const p = S._fzBt; S._fzBt = null; if (!p || Date.now() - p.t > 2500 || !fzMov()) return;
  const s = document.createElement('span'); s.className = 'fz-spk'; s.setAttribute('aria-hidden', 'true'); s.style.left = p.x + 'px'; s.style.top = p.y + 'px';
  for (let i = 0; i < 8; i++) { const r = document.createElement('i'); r.style.setProperty('--r', (i * 45) + 'deg'); s.appendChild(r); }
  document.body.appendChild(s); setTimeout(() => s.remove(), Mov.ms('--duration-very-slow', 500));
}

/* ---------- janela de confirmação: fundo escurece e a janela sobe do centro ---------- */
const fzCfOrig = csConfirma;
csConfirma = function (o, aoSim) {
  const ja = $('#cf'); fzCfOrig(o, aoSim); const d = $('#cf'); if (!d || d === ja) return;
  d.classList.add('t-fundo'); const cx = d.querySelector('.cf-caixa'); if (cx) cx.classList.add('t-modal'); Mov.abre(d); Mov.abre(cx);
};
csConfirmaFecha = function (sim) {
  const d = $('#cf');
  if (d) { if (fzMov()) { d.id = ''; d.style.pointerEvents = 'none'; Mov.fecha(d.querySelector('.cf-caixa'), null, '--modal-close-dur'); Mov.fecha(d, () => d.remove(), '--modal-close-dur'); } else d.remove(); }
  const f = S._cfSim; S._cfSim = null; if (sim && f) f();
};

/* ---------- lista retrátil: abre crescendo do botão (CSS) e fecha encolhendo (cópia que some) ---------- */
const fzDdFechaOrig = ddFecha;
ddFecha = function () {
  if (fzMov()) $$('.dd-l:not([hidden])').forEach(l => { const g = l.cloneNode(true); g.classList.add('dd-fant'); g.removeAttribute('role'); g.setAttribute('aria-hidden', 'true');
    g.querySelectorAll('[data-act],[data-v],[role],[tabindex],[id]').forEach(x => { x.removeAttribute('data-act'); x.removeAttribute('data-v'); x.removeAttribute('role'); x.removeAttribute('tabindex'); x.removeAttribute('id'); });
    const r = l.getBoundingClientRect(); g.style.cssText = 'position:fixed;margin:0;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;min-width:0;right:auto;bottom:auto;z-index:130';
    document.body.appendChild(g); setTimeout(() => g.remove(), Mov.ms('--dropdown-close-dur', 150)); }); /* a cópia fica no corpo da página: sobrevive ao redesenho da gaveta */
  fzDdFechaOrig();
};

/* ---------- erro no formulário: a mensagem dá uma tremida curta ---------- */
const fzLcErroOrig = lcErro;
lcErro = function (t) { const r = fzLcErroOrig(t); const m = $('#gv .fm-msg'); if (m) Mov.treme(m); return r; };

/* ---------- gaveta: lista que entra em sequência e desfoque no fim da rolagem ---------- */
function fzFimLista(c) { if (!c) return; c.classList.toggle('fz-mais', c.scrollHeight - c.scrollTop - c.clientHeight > 6); }
GV_DEPOIS.push((g, abriu) => {
  const c = g.querySelector('.gv-corpo'); fzFimLista(c);
  if (abriu && fzMov()) g.querySelectorAll('.sn-l>.sn-n,.gv-corpo>.sn-pd').forEach((x, i) => { if (i < 12) { x.style.setProperty('--i', i); x.classList.add('fz-li'); } });
});
document.addEventListener('scroll', e => { const c = e.target; if (c && c.classList && (c.classList.contains('gv-corpo') || c.classList.contains('cs-lado'))) fzFimLista(c); }, true);

/* ---------- troca de tela: o conteúdo entra deslizando na direção da aba; o traço da aba desliza; o título entra do desfoque ---------- */
S._fzRota = null; S._fzLinha = null;
const fzRenderOrig = render;
render = function () {
  fzRenderOrig();
  try { fzDepois(); } catch (e) { console.error(e); }
};
function fzDepois() {
  if (!S.user || !S.pronto) { S._fzRota = null; S._fzLinha = null; return; }
  const ar = csArea(S.rota.area), chave = ar.id + '/' + (S.rota.aba || ''), ant = S._fzRota, mudou = ant && ant !== chave, mesmaArea = ant && ant.split('/')[0] === ar.id;
  S._fzRota = chave;
  /* traço da aba */
  const bar = $('.cs-abas'), on = bar && bar.querySelector('a.on');
  if (bar && on) { bar.classList.add('fz-abas'); const l = document.createElement('span'); l.className = 't-abas-linha fz-linha'; l.setAttribute('aria-hidden', 'true'); bar.appendChild(l);
    const de = S._fzLinha && S._fzLinha.area === ar.id && mudou ? S._fzLinha : null;
    l.style.transition = 'none'; l.style.width = (de ? de.w : on.offsetWidth) + 'px'; l.style.transform = 'translateX(' + (de ? de.x : on.offsetLeft) + 'px)';
    if (de && fzMov()) { void l.offsetWidth; l.style.transition = ''; l.style.width = on.offsetWidth + 'px'; l.style.transform = 'translateX(' + on.offsetLeft + 'px)'; }
    S._fzLinha = { area: ar.id, x: on.offsetLeft, w: on.offsetWidth };
  } else S._fzLinha = null;
  if (!mudou || !fzMov()) return;
  /* conteúdo entra */
  const ct = $('.cs-ct'); if (ct) { let dir = 1;
    if (mesmaArea) { const ids = ar.abas.map(t => t.id), a = ids.indexOf(ant.split('/')[1]), b = ids.indexOf(S.rota.aba); if (a >= 0 && b >= 0 && b < a) dir = -1; }
    ct.style.setProperty('--fz-dir', dir); gvAnim(Mov.ms('--duration-fast', 250) + 80); /* corta o lado só enquanto o conteúdo desliza */ ct.classList.remove('fz-entra'); void ct.offsetWidth; ct.classList.add('fz-entra'); setTimeout(() => ct.classList.remove('fz-entra'), Mov.ms('--duration-fast', 250) + 60); }
  /* título da área entra letra por letra, saindo do desfoque (só quando muda de área) */
  if (!mesmaArea) { const h = $('.cs-ph h1'); if (h && !h.children.length) { const t = h.textContent; if (t.length <= 48) {
    h.classList.add('fz-tt'); h.innerHTML = [...t].map((c, i) => c === ' ' ? ' ' : '<span style="--i:' + i + '">' + esc(c) + '</span>').join('');
    setTimeout(() => { if (h.isConnected) { h.textContent = t; h.classList.remove('fz-tt'); } }, Math.min(t.length, 30) * Mov.ms('--duration-stagger', 40) + Mov.ms('--duration-very-slow', 500) + 80); } } }
}
/* menu do celular: desfoque no fim quando tem mais itens */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="cs-menu"]'); if (t) setTimeout(() => fzFimLista($('.cs-lado')), 30); });

/* ---------- tema: o ícone novo entra no lugar do outro ---------- */
const fzTemaOrig = csTrocaTema;
csTrocaTema = function (t) { fzTemaOrig(t); const b = $('[data-act="cs-tema"]'); if (b && fzMov()) { b.classList.remove('fz-tema'); void b.offsetWidth; b.classList.add('fz-tema'); } };
