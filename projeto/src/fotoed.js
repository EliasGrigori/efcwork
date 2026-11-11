/* EFCwork · fotoed.js — editor de foto e foto grande (v0.6.4, Nº 42). Prefixo: fed.
   Mesmo formato do EFClaudian (v2.22.0 / v2.102.40): a foto marcada é a que aparece e imprime; a original fica em "base" e as
   marcas em "marcas" ([{ t: 'c'|'s'|'t'|'b', cor, esp, x1, y1, x2, y2, txt?, n? }] em pixels da imagem). Campos novos (o
   EFClaudian só não mostra): marcadoPor, marcadoEm. Escolhas do Elias (11/11 19:29): no PC, a foto à esquerda e o painel à
   direita (OPÇÃO 3), com o Desfazer na grade das ferramentas, ao lado de Numerar; no celular, tela escura com as ferramentas
   embaixo. Qualquer marca pode ser tirada ou refeita a qualquer momento; a original nunca se perde. Borrar (LGPD): na foto
   marcada fica borrado; a original só o Líder ★ e o Administrador veem e baixam. */
const FED_CORES = [['#E53935', 'Vermelho'], ['#FFD600', 'Amarelo'], ['#1E88E5', 'Azul'], ['#FFFFFF', 'Branco'], ['#111111', 'Preto']];
const FED_ESP = [['fina', 0.0045, 3, 0.034], ['media', 0.009, 6, 0.05], ['grossa', 0.016, 10, 0.07]];
const FED_FERR = [['c', 'Círculo'], ['s', 'Seta'], ['t', 'Texto'], ['b', 'Borrar']];
const FED_MAX = 1600;
const FED_ICO = {
  c: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  s: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M5 19L18 6M18 6h-7M18 6v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  t: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M6 6h12M12 6v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  b: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M5 5h4v4H5zM15 5h4v4h-4zM10 10h4v4h-4zM5 15h4v4H5zM15 15h4v4h-4z" fill="currentColor"/><path d="M10 5h4v4h-4zM5 10h4v4H5zM15 10h4v4h-4zM10 15h4v4h-4z" fill="currentColor" opacity=".45"/></svg>',
  n: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 9l2-1v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  dl: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  u: '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M9 7L4 12l5 5M4 12h10a5 5 0 010 10h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
const fedTemBorrao = l => (l || []).some(m => m.t === 'b');
const fedImg = url => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => erro(new Error('Não deu para abrir a foto.')); i.src = url; });
const fedEspD = e => FED_ESP.find(x => x[0] === e) || FED_ESP[1];
const FED_COR_F = { '#E53935': ['vermelho', 'vermelha'], '#FFD600': ['amarelo', 'amarela'], '#1E88E5': ['azul', 'azul'], '#FFFFFF': ['branco', 'branca'], '#111111': ['preto', 'preta'] };
const fedNomeM = m => m.t === 't' ? 'Texto “' + m.txt + '”' : m.t === 'b' ? 'Borrado' : (m.t === 'c' ? 'Círculo ' : 'Seta ') + ((FED_COR_F[m.cor] || ['', ''])[m.t === 's' ? 1 : 0]) + (m.n ? ' · ' + m.n : '');

/* ---------- desenhar ---------- */
function fedPintar(cx, img, l, W, H, prev) {
  cx.clearRect(0, 0, W, H); cx.drawImage(img, 0, 0, W, H);
  const todas = (l || []).concat(prev ? [prev] : []), M = Math.max(W, H);
  todas.filter(m => m.t === 'b').forEach(m => fedBorrar(cx, img, m, W, H));
  todas.filter(m => m.t !== 'b').forEach(m => {
    const e = fedEspD(m.esp), g = Math.max(2, Math.round(e[1] * M));
    cx.save(); cx.strokeStyle = m.cor; cx.fillStyle = m.cor; cx.lineWidth = g; cx.lineCap = 'round'; cx.lineJoin = 'round';
    if (m.t === 'c') { cx.beginPath(); cx.ellipse((m.x1 + m.x2) / 2, (m.y1 + m.y2) / 2, Math.max(2, Math.abs(m.x2 - m.x1) / 2), Math.max(2, Math.abs(m.y2 - m.y1) / 2), 0, 0, Math.PI * 2); cx.stroke(); }
    else if (m.t === 's') { const a = Math.atan2(m.y2 - m.y1, m.x2 - m.x1), k = g * 3.2; cx.beginPath(); cx.moveTo(m.x1, m.y1); cx.lineTo(m.x2, m.y2); cx.moveTo(m.x2, m.y2); cx.lineTo(m.x2 - k * Math.cos(a - 0.45), m.y2 - k * Math.sin(a - 0.45)); cx.moveTo(m.x2, m.y2); cx.lineTo(m.x2 - k * Math.cos(a + 0.45), m.y2 - k * Math.sin(a + 0.45)); cx.stroke(); }
    else if (m.t === 't') { const fs = Math.round(M * e[3]); cx.font = '800 ' + fs + 'px system-ui, Arial, sans-serif'; cx.textBaseline = 'middle'; cx.lineWidth = Math.max(2, fs * 0.18); cx.strokeStyle = m.cor === '#FFFFFF' || m.cor === '#FFD600' ? '#111111' : '#FFFFFF'; cx.strokeText(m.txt, m.x1, m.y1); cx.fillText(m.txt, m.x1, m.y1); }
    if (m.n && (m.t === 'c' || m.t === 's')) { const r = Math.max(14, M * 0.022), x = m.t === 'c' ? Math.min(m.x1, m.x2) + r * 0.6 : m.x1, y = m.t === 'c' ? Math.min(m.y1, m.y2) + r * 0.6 : m.y1;
      cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill(); cx.fillStyle = m.cor === '#FFFFFF' || m.cor === '#FFD600' ? '#111111' : '#FFFFFF'; cx.font = '800 ' + Math.round(r * 1.2) + 'px system-ui, Arial, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(String(m.n), x, y + 1); }
    cx.restore(); });
}
function fedBorrar(cx, img, m, W, H) {
  const x = Math.max(0, Math.min(m.x1, m.x2)), y = Math.max(0, Math.min(m.y1, m.y2)), w = Math.min(W - x, Math.abs(m.x2 - m.x1)), h = Math.min(H - y, Math.abs(m.y2 - m.y1)); if (w < 2 || h < 2) return;
  const q = Math.max(6, Math.round(Math.max(W, H) / 70)), t = document.createElement('canvas'); t.width = Math.max(1, Math.round(w / q)); t.height = Math.max(1, Math.round(h / q));
  const tc = t.getContext('2d'); tc.drawImage(img, x * img.naturalWidth / W, y * img.naturalHeight / H, w * img.naturalWidth / W, h * img.naturalHeight / H, 0, 0, t.width, t.height);
  cx.save(); cx.imageSmoothingEnabled = false; cx.drawImage(t, 0, 0, t.width, t.height, x, y, w, h); cx.restore();
}
function fedJpeg(cv) { let q = 0.85, u = cv.toDataURL('image/jpeg', q); while (u.length > 380000 && q > 0.45) { q -= 0.08; u = cv.toDataURL('image/jpeg', q); } return u; }
/* a foto com as marcas, sem abrir o editor (usada para refazer depois de tirar marcas) */
async function fedRender(base, marcas) { if (!(marcas || []).length) return base; const img = await fedImg(base), k = Math.min(1, FED_MAX / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement('canvas');
  cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k); fedPintar(cv.getContext('2d'), img, marcas, cv.width, cv.height); return fedJpeg(cv); }

/* ---------- o editor ---------- */
function fedAbrir(o) {
  return new Promise(async resolve => {
    const base = o.base || o.src; let img; try { img = await fedImg(base); } catch (e) { aviso(e.message, 'erro'); resolve(null); return; }
    let pref = {}; try { pref = JSON.parse(Store.get('cw-marca') || '{}') || {}; } catch {}
    const k = Math.min(1, FED_MAX / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * k), H = Math.round(img.naturalHeight * k);
    const st = S.fed = { W: W, H: H, img: img, l: (o.marcas || []).map(m => Object.assign({}, m)), l0: JSON.stringify(o.marcas || []), prev: null, txt: null,
      f: FED_FERR.some(x => x[0] === pref.f) ? pref.f : 'c', cor: FED_CORES.some(c => c[0] === pref.cor) ? pref.cor : FED_CORES[0][0], esp: FED_ESP.some(e => e[0] === pref.esp) ? pref.esp : 'media', num: !!pref.num, fim: resolve };
    const d = document.createElement('div'); d.id = 'fed'; d.className = 'fed'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Marcar a foto');
    d.innerHTML = '<div class="fed-h"><button type="button" class="bt" data-fed="sair">Cancelar</button><b>Marcar a foto</b><button type="button" class="bt pr" data-fed="ok">Pronto</button></div>' +
      '<div class="fed-pal"><canvas width="' + W + '" height="' + H + '" aria-label="Foto para marcar"></canvas><div class="fed-txt" hidden><input class="fm-i" maxlength="40" placeholder="ex.: fio desencapado" enterkeyhint="done"><button type="button" class="bt pr" data-fed="txt-ok">Pôr</button><button type="button" class="bt ic-so" data-fed="txt-x" aria-label="Cancelar o texto">' + ic('x') + '</button></div></div>' +
      '<aside class="fed-pn"><div class="fed-cab"><b>Marcar a foto</b><small>' + esc(o.sub || '') + '</small></div><div class="fed-pc"></div></aside>';
    document.body.appendChild(d); document.body.classList.add('fed-on');
    csCamadaAbre('fed', () => { if (!S.fed) return true; if (JSON.stringify(S.fed.l) !== S.fed.l0) { csConfirma({ titulo: 'Descartar as marcas?', texto: 'As marcas feitas agora serão perdidas. A foto continua como estava.', sim: 'Descartar', nao: 'Continuar marcando' }, () => { if (S.fed) S.fed.l0 = JSON.stringify(S.fed.l); csVolta(); }); return false; } fedFecha(null); return true; });
    fedPainel(); fedDesenha(); fedLiga(d.querySelector('canvas'));
  });
}
function fedPainel() {
  const st = S.fed, p = $('#fed .fed-pc'); if (!st || !p) return;
  const fb = (k, on, lab, act, dis) => '<button type="button" class="fed-f' + (on ? ' on' : '') + '" data-fed="' + act + '" data-v="' + k + '" aria-pressed="' + !!on + '"' + (dis ? ' disabled' : '') + '>' + FED_ICO[k] + '<span>' + lab + '</span></button>';
  const sc = st.f === 'b';
  p.innerHTML = '<p class="fed-pt">Ferramenta</p><div class="fed-fs">' + FED_FERR.map(x => fb(x[0], st.f === x[0], x[1], 'ferr')).join('') + fb('n', st.num, 'Numerar', 'num') + fb('u', false, 'Desfazer', 'desf', !st.l.length) + '</div>' +
    '<div class="fed-ce' + (sc ? ' off' : '') + '"><p class="fed-pt">Cor</p><div class="fed-cs">' + FED_CORES.map(c => '<button type="button" class="fed-c' + (st.cor === c[0] ? ' on' : '') + '" data-fed="cor" data-v="' + c[0] + '" style="background:' + c[0] + '" aria-label="' + c[1] + '" title="' + c[1] + '"></button>').join('') + '</div>' +
    '<p class="fed-pt">' + (st.f === 't' ? 'Tamanho' : 'Grossura') + '</p><div class="fed-es">' + FED_ESP.map(e => '<button type="button" class="fed-e' + (st.esp === e[0] ? ' on' : '') + '" data-fed="esp" data-v="' + e[0] + '" aria-label="' + (e[0] === 'media' ? 'média' : e[0]) + '"><span style="height:' + e[2] + 'px"></span></button>').join('') + '</div></div>' +
    '<p class="fed-pt fed-mlt">Marcas · ' + st.l.length + '</p><ol class="fed-ml">' + st.l.map((m, i) => '<li><span>' + esc(fedNomeM(m)) + '</span><button type="button" class="bt ic-so" data-fed="tirar" data-v="' + i + '" aria-label="' + esc('Tirar: ' + fedNomeM(m)) + '">' + ic('x') + '</button></li>').join('') + '</ol>' +
    '<small class="fed-d">' + esc(({ c: 'Arraste para desenhar o círculo', s: 'Arraste da cauda até a ponta da seta', t: 'Toque onde o texto começa', b: 'Arraste sobre o rosto, a placa ou o crachá' })[st.f]) + '</small>' +
    '<div class="fed-pv"><button type="button" class="bt" data-fed="sair">Cancelar</button><button type="button" class="bt pr" data-fed="ok">Pronto</button></div>';
}
function fedDesenha() { const st = S.fed, cv = $('#fed canvas'); if (!st || !cv) return; fedPintar(cv.getContext('2d'), st.img, st.l, st.W, st.H, st.prev); }
function fedLiga(cv) {
  const st = S.fed; let ini = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * st.W / (r.width || 1), y: (e.clientY - r.top) * st.H / (r.height || 1) }; };
  cv.addEventListener('pointerdown', e => { if (!S.fed) return; e.preventDefault(); const p = pt(e);
    if (st.f === 't') { st.txt = p; const b = $('#fed .fed-txt'); b.hidden = false; const i = b.querySelector('input'); i.value = ''; setTimeout(() => i.focus(), 0); return; }
    ini = p; try { cv.setPointerCapture(e.pointerId); } catch {} });
  cv.addEventListener('pointermove', e => { if (!ini) return; const p = pt(e); st.prev = { t: st.f, cor: st.cor, esp: st.esp, x1: ini.x, y1: ini.y, x2: p.x, y2: p.y }; fedDesenha(); });
  const fim = () => { if (!ini) return; const m = st.prev; ini = null; st.prev = null;
    if (m && Math.hypot(m.x2 - m.x1, m.y2 - m.y1) > Math.max(st.W, st.H) * 0.02) { if (st.num && (m.t === 'c' || m.t === 's')) m.n = st.l.filter(x => x.n).reduce((a, x) => Math.max(a, x.n), 0) + 1; if (m.t === 'b') { delete m.cor; delete m.esp; } st.l.push(m); }
    fedDesenha(); fedPainel(); };
  cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
}
function fedFecha(r) { const st = S.fed; S.fed = null; const d = $('#fed'); if (d) d.remove(); document.body.classList.remove('fed-on'); if (st) st.fim(r); }
function fedPronto() {
  const st = S.fed; if (!st) return; const cv = $('#fed canvas'); st.prev = null; fedDesenha();
  const r = { img: st.l.length ? fedJpeg(cv) : st.img.src, base: st.img.src, marcas: st.l.map(m => Object.assign({}, m)), marcadoPor: S.user.nome, marcadoEm: nowISO() };
  try { Store.set('cw-marca', JSON.stringify({ f: st.f, cor: st.cor, esp: st.esp, num: st.num })); } catch {}
  st.l0 = JSON.stringify(st.l); csCamadaSaiu('fed'); fedFecha(r);
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-fed]'); if (!t || !S.fed) return; const st = S.fed, a = t.getAttribute('data-fed'), v = t.getAttribute('data-v');
  if (a === 'ferr') { st.f = v; fedPainel(); }
  else if (a === 'num') { st.num = !st.num; fedPainel(); }
  else if (a === 'cor') { st.cor = v; fedPainel(); }
  else if (a === 'esp') { st.esp = v; fedPainel(); }
  else if (a === 'desf') { st.l.pop(); fedDesenha(); fedPainel(); }
  else if (a === 'tirar') { st.l.splice(Number(v), 1); fedDesenha(); fedPainel(); }
  else if (a === 'txt-ok') { const i = $('#fed .fed-txt input'), s = String(i.value || '').trim(); if (s && st.txt) st.l.push({ t: 't', cor: st.cor, esp: st.esp, x1: st.txt.x, y1: st.txt.y, x2: st.txt.x, y2: st.txt.y, txt: s }); st.txt = null; $('#fed .fed-txt').hidden = true; fedDesenha(); fedPainel(); }
  else if (a === 'txt-x') { st.txt = null; $('#fed .fed-txt').hidden = true; }
  else if (a === 'sair') csVolta();
  else if (a === 'ok') fedPronto();
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && S.fed && e.target && e.target.closest && e.target.closest('#fed .fed-txt')) { e.preventDefault(); const b = $('#fed [data-fed="txt-ok"]'); if (b) b.click(); } });

/* ---------- a foto grande: com as marcas ou a original, quem marcou, marcar de novo, baixar ---------- */
function fedVer(o) {
  /* o: { src, base, marcas, marcadoPor, marcadoEm, titulo, nome, marcar: () => Promise|void } */
  const temM = !!o.base && (o.marcas || []).length > 0, podeOrig = temM && (!fedTemBorrao(o.marcas) || isSup(S.user));
  const v = { orig: false };
  const d = document.createElement('div'); d.id = 'fed-v'; d.className = 'fed fed-v'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', o.titulo || 'Foto');
  const desenha = () => { const u = v.orig ? o.base : o.src;
    d.innerHTML = '<div class="fed-h"><b>' + esc(o.titulo || 'Foto') + '</b>' + (podeOrig ? '<div class="fed-tg" role="group"><button type="button" class="' + (v.orig ? '' : 'on') + '" data-fv="m" aria-pressed="' + !v.orig + '">Com as marcas</button><button type="button" class="' + (v.orig ? 'on' : '') + '" data-fv="o" aria-pressed="' + v.orig + '">Original</button></div>' : '') +
      (o.marcar ? '<button type="button" class="bt" data-fv="marcar" aria-label="' + (temM ? 'Marcas' : 'Marcar') + '">' + ic('lapis') + '<span class="fed-bl">' + (temM ? 'Marcas' : 'Marcar') + '</span></button>' : '') + '<button type="button" class="bt" data-fv="baixar" aria-label="Baixar">' + FED_ICO.dl + '<span class="fed-bl">Baixar</span></button><button type="button" class="bt ic-so" data-fv="x" aria-label="Fechar">' + ic('x') + '</button></div>' +
      '<div class="fed-pal"><img src="' + imgSrc(u) + '" alt="' + esc(o.titulo || 'Foto') + '"></div>' +
      '<div class="fed-rod">' + esc(temM ? (v.orig ? 'Original, sem as marcas' : (o.marcas.length === 1 ? '1 marca' : o.marcas.length + ' marcas')) + (o.marcadoPor ? ' · marcada por ' + o.marcadoPor + (o.marcadoEm ? ' em ' + fmtDT(o.marcadoEm) : '') : '') + ' · a original fica guardada' + (fedTemBorrao(o.marcas) && !isSup(S.user) ? ' (com parte borrada: só o líder vê a original)' : '') : 'Sem marcas') + '</div>'; };
  desenha(); document.body.appendChild(d); document.body.classList.add('fed-on');
  csCamadaAbre('fedv', () => { const x = $('#fed-v'); if (x) x.remove(); if (!$('#fed')) document.body.classList.remove('fed-on'); });
  d.addEventListener('click', ev => { const b = ev.target.closest('[data-fv]'); if (!b) return; const a = b.getAttribute('data-fv');
    if (a === 'm' || a === 'o') { v.orig = a === 'o'; desenha(); }
    else if (a === 'x') csVolta();
    else if (a === 'baixar') { const l = document.createElement('a'); l.href = imgSrc(v.orig ? o.base : o.src); l.download = String((o.nome || 'foto') + (v.orig ? '_original' : temM ? '_com-marcas' : '')).replace(/[^A-Za-z0-9_-]+/g, '-') + '.jpg'; document.body.appendChild(l); l.click(); l.remove(); }
    else if (a === 'marcar') { csCamadaSaiu('fedv', () => o.marcar()); const x = $('#fed-v'); if (x) x.remove(); } });
}
/* botão "Marcar" sobre a miniatura (formulários) */
const fedMkBt = (act, i, n) => '<button type="button" class="fed-mkb" data-act="' + act + '" data-i="' + i + '">' + ic('lapis') + (n ? 'Marcas · ' + n : 'Marcar') + '</button>';
