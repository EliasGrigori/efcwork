(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CH = PAG.chave, its = $$('.it');
  /* ---------- respostas ---------- */
  function le() { try { return JSON.parse(localStorage.getItem(CH) || '{}'); } catch (e) { return {}; } }
  function grava(o) { try { localStorage.setItem(CH, JSON.stringify(o)); } catch (e) {} }
  function estado() { var o = {}; its.forEach(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim(); if (r || c) o[n] = { r: r ? r.value : '', c: c }; }); return o; }
  function pinta() { var k = 0; its.forEach(function (a) { var r = $('input[name="r' + a.dataset.n + '"]:checked', a); a.classList.toggle('ok', !!r && r.value === 'Aprovado'); a.classList.toggle('no', !!r && r.value === 'Reprovado'); if (r) k++; }); $('#cont').textContent = k + ' de ' + its.length + ' respondidos'; }
  var g = le(); its.forEach(function (a) { var x = g[a.dataset.n]; if (!x) return; if (x.r) { var i = $('input[name="r' + a.dataset.n + '"][value="' + x.r + '"]', a); if (i) i.checked = true; } if (x.c) $('#c' + a.dataset.n).value = x.c; }); pinta();
  document.addEventListener('change', function (e) { if (e.target.closest('.resp')) { pinta(); grava(estado()); } });
  document.addEventListener('input', function (e) { if (e.target.tagName === 'TEXTAREA' && e.target.id !== 'saida') grava(estado()); });
  function texto() { return [PAG.copia].concat(its.map(function (a) { var n = a.dataset.n, r = $('input[name="r' + n + '"]:checked', a), c = $('#c' + n).value.trim().replace(/\s+/g, ' '); return 'ITEM ' + n + ' ' + (r ? r.value : '(sem resposta)') + (c ? ' — ' + c : '') + ' [' + a.dataset.t + ']'; })).join('\n'); }
  function copia() {
    var t = texto(), s = $('#saida'), ok = $('#copiado');
    function manual() { s.hidden = false; s.value = t; s.focus(); s.select(); var deu = false; try { deu = document.execCommand('copy'); } catch (e) {} ok.textContent = deu ? 'Copiado. Agora cole na conversa.' : 'Não deu para copiar sozinho: o texto está selecionado abaixo, copie e cole na conversa.'; s.scrollIntoView({ block: 'center' }); }
    s.hidden = false; s.value = t;
    try { navigator.clipboard.writeText(t).then(function () { ok.textContent = 'Copiado. Agora cole na conversa.'; var b = $('#copiar'); b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar respostas'; }, 2500); }, manual); } catch (e) { manual(); }
  }
  $('#copiar').addEventListener('click', copia); $('#copiar2').addEventListener('click', copia);

  /* ---------- imagem ampliada: alterna HOJE e PROPOSTA no mesmo lugar ---------- */
  var lb = $('#lb'), lbPar = '', lbLado = '';
  function lbMostra() { var b = $('.zoom[data-par="' + lbPar + '"][data-lado="' + lbLado + '"]'); if (!b) return; var im = $('img', b); $('#lb-img').src = im.src; $('#lb-img').alt = im.alt; $('#lb-t').textContent = 'ITEM ' + lbPar.split('-')[0] + ' · ' + (lbLado === 'hoje' ? 'HOJE' : 'PROPOSTA'); $$('[data-lb]', lb).forEach(function (x) { if (x.dataset.lb !== 'x') x.setAttribute('aria-pressed', String(x.dataset.lb === lbLado)); }); }
  function lbFecha() { lb.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('.zoom'); if (z) { lbPar = z.dataset.par; lbLado = z.dataset.lado; lb.hidden = false; document.body.style.overflow = 'hidden'; lbMostra(); $('[data-lb="x"]', lb).focus(); return; }
    var b = e.target.closest('[data-lb]'); if (b) { if (b.dataset.lb === 'x') lbFecha(); else { lbLado = b.dataset.lb; lbMostra(); } return; }
    if (e.target.closest('.lb-pal')) { lbLado = lbLado === 'hoje' ? 'prop' : 'hoje'; lbMostra(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) { if (e.key === 'Escape') lbFecha(); else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); lbLado = lbLado === 'hoje' ? 'prop' : 'hoje'; lbMostra(); } return; }
    if (e.key === 'Escape' && A && A.cheia) cheia(false);
  });

  /* ---------- o app de verdade dentro da página (um por vez) ---------- */
  var A = null, seq = 0;
  function vFecha() { if (!A) return; clearTimeout(A.t); var b = A.box; b.classList.remove('cheia', 'aberto'); document.body.style.overflow = ''; $('.vpal', b).hidden = true; $('.vpal', b).innerHTML = ''; $('.vctl', b).hidden = true; $('.vdica', b).hidden = true; $('[data-v="abre"]', b).hidden = false; A = null; }
  function vMonta() {
    var pal = $('.vpal', A.box); pal.hidden = false; pal.innerHTML = '<div class="vq"><div class="vesp">Abrindo o app…</div></div>';
    var cel = A.ap === 'cel'; A.dw = cel ? 390 : 1280; A.dh = cel ? 760 : 780; A.pronto = false;
    var fr = document.createElement('iframe'); fr.title = 'EFCwork em demonstração (' + (cel ? 'celular' : 'PC') + ')'; fr.setAttribute('width', A.dw); fr.setAttribute('height', A.dh); fr.style.width = A.dw + 'px'; fr.style.height = A.dh + 'px';
    fr.srcdoc = APP_SRC; $('.vq', pal).appendChild(fr); A.fr = fr; vAjusta();
    clearTimeout(A.t); A.t = setTimeout(function () { if (A && !A.pronto) { var e = $('.vesp', A.box); if (e) e.textContent = 'O app não abriu neste visualizador. As imagens deste item mostram a mesma mudança.'; } }, 20000);
    $$('[data-v="ap"]', A.box).forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.ap === A.ap)); x.style.borderColor = x.dataset.ap === A.ap ? 'var(--a)' : ''; });
  }
  function vAjusta() { if (!A || !A.fr) return; var q = $('.vq', A.box), W = q.clientWidth, Hm = A.cheia ? Math.max(200, innerHeight - (q.getBoundingClientRect().top + 12)) : Infinity, s = Math.min(1, W / A.dw, Hm / A.dh); A.fr.style.transform = 'scale(' + s + ')'; q.style.height = Math.round(A.dh * s) + 'px'; q.style.setProperty('--x', Math.max(0, Math.round((W - A.dw * s) / 2)) + 'px'); }
  function vManda(comPassos) { if (!A || !A.pronto) return; var v = VIVOS[A.n]; A.fr.contentWindow.postMessage({ efc: 'cmd', id: ++seq, mo: A.lado === 'prop' && !A.feito ? [A.n] : [], rota: v.rota, passos: comPassos ? v.passos : [] }, '*'); $$('.seg [data-v]', A.box).forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.v === A.lado)); }); }
  function cheia(sim) { if (!A) return; A.cheia = sim; A.box.classList.toggle('cheia', sim); document.body.style.overflow = sim ? 'hidden' : ''; $('[data-v="cheia"]', A.box).textContent = sim ? 'Sair da tela cheia' : 'Tela cheia'; vAjusta(); if (!sim) A.box.scrollIntoView({ block: 'nearest' }); }
  window.addEventListener('message', function (e) { if (!A || !A.fr || e.source !== A.fr.contentWindow) return; var d = e.data || {}; if (d.efc === 'pronto') { A.pronto = true; clearTimeout(A.t); var x = $('.vesp', A.box); if (x) x.remove(); vManda(true); } else if (d.efc === 'erro') { var y = $('.vesp', A.box); if (y) y.textContent = d.txt + ' As imagens deste item mostram a mesma mudança.'; } });
  window.addEventListener('resize', vAjusta);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-v]'); if (!b) return; var box = b.closest('.vivo'), a = b.dataset.v;
    if (a === 'abre') { vFecha(); var n = +box.dataset.n, v = VIVOS[n]; A = { n: n, box: box, lado: 'prop', feito: v.feito, ap: v.so || (innerWidth < 700 ? 'cel' : 'pc'), cheia: false }; box.classList.add('aberto'); b.hidden = true; $('.vctl', box).hidden = false; $('.vdica', box).hidden = false; vMonta(); return; }
    if (!A || A.box !== box) return;
    if (a === 'hoje' || a === 'prop') { A.lado = a; vManda(true); }
    else if (a === 'denovo') vManda(true);
    else if (a === 'ap') { if (A.ap !== b.dataset.ap) { A.ap = b.dataset.ap; vMonta(); } }
    else if (a === 'cheia') cheia(!A.cheia);
    else if (a === 'fecha') vFecha();
  });
})();
