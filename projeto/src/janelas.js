/* EFCwork · janelas.js — os apps da família abrem dentro do EFCwork, em janelas com abas no alto (v0.6.22). Prefixo: jn.
   Escolha do Elias (20/11/2026): OPÇÃO 1 (linha fina sublinhada: só o nome do app e um traço de 2 px na cor da janela, faixa de 26 px)
   com o recolher da OPÇÃO 3 (fica um fio de 6 px no alto; abre ao passar o mouse ou ao tocar).
   - Mesmo endereço (eliasgrigori.github.io): o Vértice e o Sabiá abrem num quadro (iframe) por cima do EFCwork e continuam vivos
     quando se volta para o EFCwork (nada se perde ao alternar). A caixa de troca (efd-ponte) funciona igual dentro do quadro.
   - A faixa fica fora do #app (a tela redesenha e as janelas ficam). Só aparece depois que um app foi aberto.
   - A cor da faixa é a da janela que está na frente (lida do próprio app); o traço da aba é a cor de destaque daquele app.
   - Esc e o voltar do celular, com um app na frente, voltam para o EFCwork (uma camada por vez). Dentro do app, o Esc é dele. */
Object.assign(S, { jnAbertas: [], jnAtiva: 'efcwork' });
/* a janela só funciona no mesmo endereço do EFCwork (é o que deixa a caixa de troca passar); fora dele (arquivo aberto do disco) usa o site */
const JN_RAIZ = /^https?:$/.test(location.protocol) ? location.origin : 'https://eliasgrigori.github.io';
const JN_APPS = {
  docs: { nome: 'Vértice Docs', url: JN_RAIZ + '/EFCdocs/', ac: '#22a896' },
  sabia: { nome: 'Sabiá', url: JN_RAIZ + '/EFC-Sabi--Quiz/', ac: '#1f6f6a' }
};
const JN_FIO = 6, JN_FAIXA = 26;
const jnEhToque = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };
const jnFr = id => document.querySelector('.jn-fr iframe[data-j="' + id + '"]');

/* ---------- cores: a da janela que está na frente ---------- */
function jnLum(c) {
  const m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/.exec(String(c || '')); if (!m) return null;
  if (m[4] != null && Number(m[4]) < 0.5) return null; /* transparente: não serve */
  const f = v => { v = Number(v) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(m[1]) + 0.7152 * f(m[2]) + 0.0722 * f(m[3]);
}
function jnCorDe(id) {
  if (id === 'efcwork') { const r = getComputedStyle(document.documentElement); return { bg: getComputedStyle(document.body).backgroundColor, ac: (r.getPropertyValue('--a') || '').trim() || '#9a7128' }; }
  const a = JN_APPS[id], fr = jnFr(id); let bg = '', ac = '';
  try {
    const d = fr && fr.contentDocument; if (d && d.body) {
      bg = getComputedStyle(d.body).backgroundColor; if (jnLum(bg) == null) bg = getComputedStyle(d.documentElement).backgroundColor;
      ac = (getComputedStyle(d.body).getPropertyValue('--primary') || getComputedStyle(d.documentElement).getPropertyValue('--primary') || '').trim(); /* o tema do Vértice mora no body */
    }
  } catch (e) { /* outro endereço: fica a cor padrão */ }
  if (jnLum(bg) == null) bg = getComputedStyle(document.body).backgroundColor;
  return { bg: bg, ac: ac || a.ac };
}
function jnPinta() {
  const el = $('#jn'); if (!el) return;
  const c = jnCorDe(S.jnAtiva), l = jnLum(c.bg), esc_ = l != null && l < 0.22;
  el.style.setProperty('--jn-bg', c.bg); el.style.setProperty('--jn-tx', esc_ ? '#efeae0' : '#2a2519');
  el.style.setProperty('--jn-bd', esc_ ? 'rgba(255,255,255,.10)' : 'rgba(40,30,10,.12)');
  el.querySelectorAll('.jn-ab').forEach(b => { const j = b.getAttribute('data-j'); b.style.setProperty('--jn-ac', j === S.jnAtiva ? c.ac : (j === 'efcwork' ? jnCorDe('efcwork').ac : JN_APPS[j].ac)); });
}

/* ---------- a faixa ---------- */
function jnFaixaHTML() {
  const ab = (id, nome, x) => '<span class="jn-aw' + (id === S.jnAtiva ? ' on' : '') + '"><button type="button" role="tab" class="jn-ab" data-act="jn-ir" data-j="' + esc(id) + '" aria-selected="' + (id === S.jnAtiva) + '">' + esc(nome) + '</button>' +
    (x ? '<button type="button" class="jn-x" data-act="jn-fecha" data-j="' + esc(id) + '" title="Fechar o ' + esc(nome) + '" aria-label="Fechar o ' + esc(nome) + '">' + ic('x') + '</button>' : '') + '</span>';
  return '<div class="jn-faixa" role="tablist" aria-label="Janelas abertas">' + ab('efcwork', 'EFCwork', false) + S.jnAbertas.map(id => ab(id, JN_APPS[id].nome, true)).join('') +
    '</div>'; /* ITEM 114 (20/11): sem o ícone de abrir numa aba do navegador no topo; para isso, Ctrl + clique no menu */
}
function jnDesenha() {
  let el = $('#jn'), fr = $('.jn-fr');
  if (!S.jnAbertas.length) { if (el) el.remove(); if (fr) fr.remove(); document.body.classList.remove('jn-tem', 'jn-fora-on'); return; }
  if (!fr) { fr = document.createElement('div'); fr.className = 'jn-fr'; document.body.appendChild(fr); }
  if (!el) { el = document.createElement('div'); el.id = 'jn'; el.className = 'jn'; document.body.appendChild(el); jnLiga(el); }
  el.innerHTML = jnFaixaHTML();
  document.body.classList.add('jn-tem'); document.body.classList.toggle('jn-fora-on', S.jnAtiva !== 'efcwork');
  fr.querySelectorAll('iframe').forEach(f => { const on = f.getAttribute('data-j') === S.jnAtiva; f.classList.toggle('on', on); f.setAttribute('aria-hidden', on ? 'false' : 'true'); if (on) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', '-1'); });
  fr.classList.toggle('on', S.jnAtiva !== 'efcwork');
  jnPinta();
}
/* abre ao passar o mouse (PC) ou ao tocar o fio (celular); fecha sozinha */
function jnMostra(sim) {
  const el = $('#jn'); if (!el) return; clearTimeout(S._jnT);
  el.classList.toggle('aberta', !!sim);
  if (sim) jnPinta(); /* o app pode ter trocado de tema */
  if (sim && jnEhToque()) S._jnT = setTimeout(() => jnMostra(false), 4000);
}
function jnLiga(el) {
  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') jnMostra(true); });
  el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { clearTimeout(S._jnT); S._jnT = setTimeout(() => jnMostra(false), 350); } });
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !el.classList.contains('aberta')) { e.preventDefault(); jnMostra(true); } });
  el.addEventListener('focusin', () => jnMostra(true));
  el.addEventListener('focusout', () => { setTimeout(() => { if (!el.contains(document.activeElement)) jnMostra(false); }, 0); });
}
/* tocar dentro do app da frente (o quadro tira o foco do EFCwork) recolhe a faixa */
window.addEventListener('blur', () => { if ($('#jn')) setTimeout(() => jnMostra(false), 0); });
document.addEventListener('pointerdown', e => { const el = $('#jn'); if (el && el.classList.contains('aberta') && !el.contains(e.target)) jnMostra(false); }, true);

/* ---------- abrir, alternar, fechar ---------- */
function jnAbrir(id, rota) {
  const a = JN_APPS[id]; if (!a) return;
  let fr = jnFr(id);
  if (!fr) {
    if (S.jnAbertas.indexOf(id) < 0) S.jnAbertas.push(id);
    jnDesenha();
    fr = document.createElement('iframe'); fr.setAttribute('data-j', id); fr.title = a.nome;
    fr.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen'); fr.src = a.url + (rota || '');
    fr.addEventListener('load', () => {
      jnPinta(); [400, 1200, 3000].forEach(ms => setTimeout(jnPinta, ms)); /* o app de dentro põe o tema dele depois de carregar */
      try {
        fr.contentWindow.addEventListener('focus', () => jnMostra(false));
        const d = fr.contentDocument, ob = new MutationObserver(() => jnPinta()); /* trocou o tema lá dentro: a faixa acompanha */
        ob.observe(d.documentElement, { attributes: true }); if (d.body) ob.observe(d.body, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-tema', 'style'] });
      } catch (e) {}
    });
    $('.jn-fr').appendChild(fr);
  } else if (rota) {
    /* troca só o endereço de dentro, sem recarregar o app e sem criar passo novo no voltar */
    try { fr.contentWindow.location.replace(a.url + rota); } catch (e) { fr.src = a.url + rota; }
  }
  jnIr(id);
}
function jnIr(id) {
  if (id !== 'efcwork' && !jnFr(id)) return jnAbrir(id);
  const antes = S.jnAtiva; if (antes === id) { jnDesenha(); jnMostra(false); return; }
  S.jnAtiva = id; jnDesenha();
  if (id !== 'efcwork' && antes === 'efcwork') { S._jnHist = history.length; csCamadaAbre('janela', () => { S.jnAtiva = 'efcwork'; jnDesenha(); }); }
  else if (id === 'efcwork') jnSaiCamada();
  if (id !== 'efcwork') { const f = jnFr(id); setTimeout(() => { try { f.focus(); } catch (e) {} }, 0); }
  setTimeout(() => jnMostra(false), jnEhToque() ? 900 : 0);
}
/* voltou para o EFCwork pela aba: tira a camada. Se o app de dentro andou (criou passos no voltar), só tira da pilha */
function jnSaiCamada() {
  if (!csTemCamada('janela')) return;
  if (S.camadas.length && S.camadas[S.camadas.length - 1].nome === 'janela' && history.length === S._jnHist + 1) csCamadaSaiu('janela');
  else { const k = S.camadas.map(c => c.nome).lastIndexOf('janela'); if (k >= 0) S.camadas.splice(k, 1); }
}
function jnFechar(id) {
  const a = JN_APPS[id]; if (!a) return;
  const tira = () => { const f = jnFr(id); if (f) f.remove(); S.jnAbertas = S.jnAbertas.filter(x => x !== id); if (S.jnAtiva === id) { S.jnAtiva = S.jnAbertas.length ? S.jnAbertas[S.jnAbertas.length - 1] : 'efcwork'; if (S.jnAtiva === 'efcwork') jnSaiCamada(); } jnDesenha(); };
  csConfirma({ titulo: 'Fechar o ' + a.nome + '?', texto: 'O que já foi salvo no ' + a.nome + ' continua lá. O que estiver aberto sem salvar pode se perder.', sim: 'Fechar', nao: 'Deixar aberto' }, tira);
}

document.addEventListener('click', e => {
  /* os apps da família no menu abrem aqui dentro; Ctrl, Shift ou o botão do meio continuam abrindo numa aba do navegador */
  const lk = e.target.closest && e.target.closest('a[data-app]');
  if (lk && JN_APPS[lk.getAttribute('data-app')] && !(e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) { e.preventDefault(); if (typeof csFechaMenu === 'function') csFechaMenu(); jnAbrir(lk.getAttribute('data-app')); return; }
  const t = e.target.closest && e.target.closest('[data-act^="jn-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-j');
  if (a === 'jn-ir') jnIr(id);
  else if (a === 'jn-fecha') jnFechar(id);
});
/* Esc com o foco no EFCwork e um app na frente: volta para o EFCwork */
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.jnAtiva !== 'efcwork' && !csConfirmaAberto() && csTemCamada('janela')) { e.preventDefault(); csVolta(); } });
/* trocar o tema do EFCwork muda a cor da faixa quando o EFCwork está na frente */
new MutationObserver(() => { if ($('#jn')) jnPinta(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
/* saiu da conta: as janelas fecham junto */
const jnSairOrig = typeof csSair === 'function' ? csSair : null;
if (jnSairOrig) csSair = async function () { S.jnAbertas.forEach(id => { const f = jnFr(id); if (f) f.remove(); }); S.jnAbertas = []; S.jnAtiva = 'efcwork'; jnDesenha(); return jnSairOrig.apply(this, arguments); };
