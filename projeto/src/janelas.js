/* EFCwork · janelas.js — os apps da família abrem dentro do EFCwork, em tela inteira, com abas no alto. Prefixo: jn.
   v0.6.22: janelas com abas (faixa recolhida em fio). v0.6.35 (ITEM 200 = OPÇÃO 2, ITEM 201, decisão de 26/11 13:18):
   - Com um app na frente, a faixa fica sempre à vista: 32 px (40 no toque), só texto, letra menor, traço dourado de 2 px
     embaixo da aba aberta, sem relevo nem degradê. O app ocupa o resto da tela, por cima também do menu do Cwork.
   - Várias abas do Vértice ao mesmo tempo (sem teto de 3); com muitas, as abas encolhem e o nome termina em "…".
     Cada aba do Vértice mostra o nome do arquivo aberto nela. O "+" abre uma aba nova do Vértice.
   - A primeira aba (EFCwork) volta ao Cwork sem fechar nada; com o Cwork na frente, a faixa recolhe num fio de 6 px
     (abre ao parar o mouse ou ao tocar), como antes.
   - O X pergunta antes de fechar. Esc e o voltar do celular, com um app na frente, voltam para o EFCwork (uma camada por vez).
   - Mesmo endereço (eliasgrigori.github.io): cada app roda num quadro (iframe) e continua vivo ao alternar; a caixa de troca
     (efd-ponte) funciona igual dentro do quadro. A faixa e os quadros ficam fora do #app (a tela redesenha e as janelas ficam). */
Object.assign(S, { jnAbertas: [], jnAtiva: 'efcwork', jnNome: {}, jnUlt: {}, jnSeq: 1, jnOcupada: {} }); /* jnOcupada: a aba recebeu um documento do Cwork (não recebe outro por cima) */
/* a janela só funciona no mesmo endereço do EFCwork (é o que deixa a caixa de troca passar); fora dele (arquivo aberto do disco) usa o site */
const JN_RAIZ = /^https?:$/.test(location.protocol) ? location.origin : 'https://eliasgrigori.github.io';
/* multi: o app abre em várias abas; url pode virar um "get" (o vertice.js escolhe o endereço conforme quem entrou) */
const JN_APPS = {
  docs: { nome: 'Vértice Docs', url: JN_RAIZ + '/efcwork/vertice/', multi: true, /* v0.6.36 (P5): era /EFCdocs/ */ podeNova: () => true },
  sabia: { nome: 'Sabiá', url: JN_RAIZ + '/EFC-Sabi--Quiz/' }
};
const JN_MAX = 10; /* proteção de memória do aparelho: cada aba do Vértice é um app inteiro */
const jnApp = id => JN_APPS[String(id).split('~')[0]];
const jnBase = id => String(id).split('~')[0];
const jnEhToque = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };
const jnFr = id => document.querySelector('.jn-fr iframe[data-j="' + id + '"]');
const jnDoApp = app => S.jnAbertas.filter(x => jnBase(x) === app);
function jnRotulo(id) { const a = jnApp(id); return id === 'efcwork' ? 'EFCwork' : (S.jnNome[id] || a.nome); }

/* ---------- a faixa ---------- */
function jnFaixaHTML() {
  let k = 0; /* --k: a ordem em que as abas entram (escala de movimento) */
  const ab = id => {
    const nome = jnRotulo(id), on = id === S.jnAtiva, x = id !== 'efcwork';
    return '<span class="jn-aw' + (on ? ' on' : '') + (x ? '' : ' jn-cw') + '" style="--k:' + (k++) + '" data-j="' + esc(id) + '">' +
      '<button type="button" role="tab" class="jn-ab" data-act="jn-ir" data-j="' + esc(id) + '" aria-selected="' + (on ? 'true' : 'false') + '"' + (x ? ' title="' + esc(nome) + '"' : '') + '>' + esc(nome) + '</button>' +
      (x ? '<button type="button" class="jn-x" data-act="jn-fecha" data-j="' + esc(id) + '" aria-label="Fechar ' + esc(nome) + '">' + ic('x') + '</button>' : '') + '</span>';
  };
  return ab('efcwork') + S.jnAbertas.map(ab).join('');
}
function jnDesenha() {
  let el = $('#jn'), fr = $('.jn-fr');
  if (!S.jnAbertas.length) { if (el) el.remove(); if (fr) fr.remove(); document.body.classList.remove('jn-tem', 'jn-fora-on'); jnDepois(); return; }
  if (!fr) { fr = document.createElement('div'); fr.className = 'jn-fr'; document.body.appendChild(fr); }
  if (!el) {
    el = document.createElement('div'); el.id = 'jn'; el.className = 'jn';
    el.innerHTML = '<div class="jn-abas" role="tablist" aria-label="Janelas abertas"></div><button type="button" class="jn-mais" data-act="jn-mais" aria-label="Nova aba do Vértice" title="Nova aba do Vértice">' + ic('mais') + '</button><i class="jn-ind" aria-hidden="true"></i><i class="jn-zona" aria-hidden="true"></i>';
    document.body.appendChild(el); jnLiga(el);
  }
  const abas = el.querySelector('.jn-abas'), sx = abas.scrollLeft;
  abas.innerHTML = jnFaixaHTML(); jnAperta(abas); abas.scrollLeft = sx; /* o traço (.jn-ind) fica: é ele que desliza de uma aba para a outra */
  el.querySelector('.jn-mais').hidden = !(JN_APPS.docs.podeNova() && S.jnAtiva !== 'efcwork' && jnBase(S.jnAtiva) === 'docs');
  const fora = S.jnAtiva !== 'efcwork';
  el.classList.toggle('fixa', fora); if (fora) el.classList.add('aberta'); else if (!el.matches(':hover') && !el.contains(document.activeElement)) el.classList.remove('aberta');
  document.body.classList.add('jn-tem'); document.body.classList.toggle('jn-fora-on', fora);
  fr.querySelectorAll('iframe').forEach(f => { const on = f.getAttribute('data-j') === S.jnAtiva; f.classList.toggle('on', on); f.setAttribute('aria-hidden', on ? 'false' : 'true'); if (on) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', '-1'); });
  fr.classList.toggle('on', fora);
  const on = abas.querySelector('.jn-aw.on'); if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch {} }
  jnTraco(); requestAnimationFrame(jnTraco);
  jnDepois();
}
/* com muitas abas, encolhem por igual; com poucas, cada uma tem o tamanho do nome (até 200 px) */
function jnAperta(abas) { abas = abas || $('#jn .jn-abas'); if (!abas) return; abas.classList.remove('apertado'); abas.classList.add('medindo'); const cheio = abas.scrollWidth > abas.clientWidth + 1; abas.classList.remove('medindo'); abas.classList.toggle('apertado', cheio); }
/* quem quiser saber que a faixa mudou (o vertice.js põe o nome do arquivo no título da janela) */
const JN_DEPOIS = [];
function jnDepois() { JN_DEPOIS.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
/* põe o traço embaixo da aba da frente (o CSS faz ele deslizar); some se a aba está fora da vista */
function jnTraco() {
  const el = $('#jn'), b = el && el.querySelector('.jn-aw.on'); if (!b) return;
  const r = b.getBoundingClientRect(), f = el.getBoundingClientRect(), v = el.querySelector('.jn-abas').getBoundingClientRect(), m = 8;
  const l = Math.max(r.left, v.left), d = Math.min(r.right, v.right);
  el.style.setProperty('--zw', Math.round(v.right - f.left) + 'px');
  el.style.setProperty('--ix', Math.round(l - f.left + m) + 'px'); el.style.setProperty('--iw', Math.max(0, Math.round(d - l - 2 * m)) + 'px');
}
/* com o Cwork na frente: abre quando o mouse para um instante sobre o fio (passar de raspão não abre) e espera um pouco antes de fechar */
function jnQuer(sim) {
  const el = $('#jn'); if (!el || el.classList.contains('fixa')) return; clearTimeout(S._jnQ);
  if (sim === el.classList.contains('aberta')) { clearTimeout(S._jnT); return; }
  S._jnQ = setTimeout(() => jnMostra(sim), sim ? 120 : 400);
}
function jnMostra(sim) {
  const el = $('#jn'); if (!el) return; clearTimeout(S._jnT);
  if (el.classList.contains('fixa')) { el.classList.add('aberta'); return; } /* com um app na frente, a faixa não recolhe */
  el.classList.toggle('aberta', !!sim); if (sim) jnTraco();
  if (sim && jnEhToque()) S._jnT = setTimeout(() => jnMostra(false), 4000);
}
function jnLiga(el) {
  /* só as abas reagem; o resto do alto deixa o clique passar para o Cwork (pointer-events no CSS) */
  const naAba = x => !!(x && x.closest && x.closest('.jn-abas, .jn-mais, .jn-zona'));
  el.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' && naAba(e.target)) jnQuer(true); });
  el.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !naAba(e.relatedTarget)) jnQuer(false); });
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !el.classList.contains('aberta')) { e.preventDefault(); jnMostra(true); } });
  el.addEventListener('focusin', () => jnMostra(true));
  el.addEventListener('focusout', () => { setTimeout(() => { if (!el.contains(document.activeElement)) jnMostra(false); }, 0); });
  el.querySelector('.jn-abas').addEventListener('scroll', jnTraco, { passive: true });
  /* roda do mouse sobre as abas: anda para o lado (muitas abas) */
  el.querySelector('.jn-abas').addEventListener('wheel', e => { const a = e.currentTarget; if (a.scrollWidth > a.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { a.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
}
window.addEventListener('blur', () => { if ($('#jn')) setTimeout(() => { clearTimeout(S._jnQ); jnMostra(false); }, 0); });
window.addEventListener('resize', () => { jnAperta(); jnTraco(); });
document.addEventListener('pointerdown', e => { const el = $('#jn'); if (el && el.classList.contains('aberta') && !el.contains(e.target)) jnMostra(false); }, true);

/* ---------- abrir, alternar, fechar ---------- */
/* jnAbrir('docs') traz a última aba do Vértice (ou abre uma); jnAbrir('docs', rota) abre o documento numa aba nova
   (ou na última aba do Vértice usada, se ela ainda não tem arquivo); jnAbrir('docs', '', true) abre uma aba nova vazia */
function jnAbrir(id, rota, nova, aba) { /* aba: uma aba certa (o mesmo documento pedido de novo) */
  const a = JN_APPS[id] ? JN_APPS[id] : jnApp(id); if (!a) return;
  let alvo = aba && jnFr(aba) ? aba : JN_APPS[id] ? '' : id; /* veio o id de uma aba (docs~2): é ela */
  if (!alvo) {
    const tem = jnDoApp(id);
    if (!a.multi) alvo = tem[0] || '';
    else if (nova) alvo = '';
    else if (rota) { const u = jnBase(S.jnAtiva) === id ? S.jnAtiva : S.jnUlt[id]; alvo = u && tem.indexOf(u) >= 0 && !S.jnNome[u] && !S.jnOcupada[u] ? u : ''; } /* a aba do Vértice sem arquivo recebe o documento; com arquivo, abre outra */
    else alvo = tem.indexOf(S.jnUlt[id]) >= 0 ? S.jnUlt[id] : (tem[tem.length - 1] || '');
  }
  let fr = alvo && jnFr(alvo);
  if (!fr) {
    if (a.multi && jnDoApp(id).length >= JN_MAX) { aviso('Já há ' + JN_MAX + ' abas do ' + a.nome + ' abertas. Feche uma para abrir outra.', 'erro'); return; }
    if (!alvo) { const n = jnDoApp(id).length ? ++S.jnSeq : 1; alvo = a.multi && n > 1 ? id + '~' + n : id; while (jnFr(alvo) || S.jnAbertas.indexOf(alvo) >= 0) alvo = id + '~' + (++S.jnSeq); }
    const i = S.jnAbertas.indexOf(S.jnAtiva); /* a aba nova entra logo depois da aba da frente (como no navegador) */
    if (S.jnAbertas.indexOf(alvo) < 0) S.jnAbertas.splice(i >= 0 ? i + 1 : S.jnAbertas.length, 0, alvo);
    delete S.jnNome[alvo]; delete S.jnOcupada[alvo];
    if (!$('.jn-fr')) jnDesenha();
    fr = document.createElement('iframe'); fr.setAttribute('data-j', alvo); fr.setAttribute('aria-label', a.nome); /* sem title: o navegador mostrava a dica por cima do app */
    fr.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen'); fr.src = a.url + (rota || ''); fr.setAttribute('data-url', a.url);
    fr.addEventListener('load', () => { fr._carregou = true; try { fr.contentWindow.addEventListener('focus', () => jnMostra(false)); } catch (e) {} });
    $('.jn-fr').appendChild(fr);
  } else if (rota) {
    /* troca só o endereço de dentro, sem recarregar o app e sem criar passo novo no voltar */
    if (!fr._carregou) fr.src = a.url + rota; /* ainda carregando: troca o endereço que vai carregar */
    else try { fr.contentWindow.location.replace(a.url + rota); } catch (e) { fr.src = a.url + rota; }
  }
  if (rota && a.multi) S.jnOcupada[alvo] = rota;
  jnIr(alvo);
}
function jnIr(id) {
  if (id !== 'efcwork' && !jnFr(id)) return jnAbrir(id);
  if (id !== 'efcwork') S.jnUlt[jnBase(id)] = id;
  const antes = S.jnAtiva; if (antes === id) { jnDesenha(); return; }
  S.jnAtiva = id; jnDesenha();
  if (id !== 'efcwork' && antes === 'efcwork') { S._jnHist = history.length; csCamadaAbre('janela', () => { S.jnAtiva = 'efcwork'; jnDesenha(); }); }
  else if (id === 'efcwork') jnSaiCamada();
  if (id !== 'efcwork') { const f = jnFr(id); setTimeout(() => { try { f.focus(); } catch (e) {} }, 0); }
  else setTimeout(() => jnMostra(false), jnEhToque() ? 900 : 0);
}
/* voltou para o EFCwork pela aba: tira a camada. Se o app de dentro andou (criou passos no voltar), só tira da pilha */
function jnSaiCamada() {
  if (!csTemCamada('janela')) return;
  if (S.camadas.length && S.camadas[S.camadas.length - 1].nome === 'janela' && history.length === S._jnHist + 1) csCamadaSaiu('janela');
  else { const k = S.camadas.map(c => c.nome).lastIndexOf('janela'); if (k >= 0) S.camadas.splice(k, 1); }
}
/* a aba que recebeu esta rota (por exemplo '#/pedido/<pid>'), para o mesmo documento voltar para ela */
const jnAbaDaRota = r => S.jnAbertas.find(x => S.jnOcupada[x] === r) || '';
/* o menu do celular (camada 'menu') fecha e sai da pilha do voltar; o app abre depois que o navegador terminar de voltar */
function jnDepoisDoMenu(f) {
  if (typeof csFechaMenu === 'function') csFechaMenu();
  if (typeof csTemCamada === 'function' && csTemCamada('menu')) csCamadaSaiu('menu', f); else f();
}
/* tira uma aba sem perguntar (usado depois da confirmação e na troca de conta) */
function jnTira(id) {
  const f = jnFr(id); if (f) f.remove();
  const i = S.jnAbertas.indexOf(id); S.jnAbertas = S.jnAbertas.filter(x => x !== id); delete S.jnNome[id]; delete S.jnOcupada[id];
  if (S.jnAtiva === id) {
    const viz = S.jnAbertas[Math.max(0, i - 1)]; /* vai para a aba ao lado, como no navegador */
    S.jnAtiva = viz || 'efcwork'; if (viz) S.jnUlt[jnBase(viz)] = viz;
    if (S.jnAtiva === 'efcwork') jnSaiCamada();
  }
  jnDesenha();
}
function jnFechar(id) {
  const a = jnApp(id); if (!a || !jnFr(id)) return;
  const nome = jnRotulo(id);
  csConfirma({ titulo: 'Fechar ' + (nome === a.nome ? 'o ' + a.nome : '"' + nome + '"') + '?', texto: 'O que já foi salvo continua no ' + a.nome + '. O que estiver aberto sem salvar nesta aba pode se perder.', sim: 'Fechar', nao: 'Deixar aberta' }, () => jnTira(id));
}

document.addEventListener('click', e => {
  /* os apps da família no menu abrem aqui dentro; Ctrl, Shift ou o botão do meio continuam abrindo numa aba do navegador */
  const lk = e.target.closest && e.target.closest('a[data-app]');
  if (lk && JN_APPS[lk.getAttribute('data-app')] && !(e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) { e.preventDefault(); const ap = lk.getAttribute('data-app'); jnDepoisDoMenu(() => jnAbrir(ap)); return; }
  const t = e.target.closest && e.target.closest('[data-act^="jn-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-j');
  if (a === 'jn-ir') jnIr(id);
  else if (a === 'jn-fecha') jnFechar(id);
  else if (a === 'jn-mais') jnAbrir('docs', '', true);
});
/* clique do meio numa aba: fecha (como no navegador), também perguntando antes */
document.addEventListener('auxclick', e => { const t = e.button === 1 && e.target.closest && e.target.closest('#jn .jn-aw:not(.jn-cw)'); if (t) { e.preventDefault(); jnFechar(t.getAttribute('data-j')); } });
/* o Cwork mudou de tela por baixo (um aviso tocado, um link): o Cwork vem para a frente; as abas continuam abertas */
window.addEventListener('hashchange', e => { if (S.jnAtiva !== 'efcwork' && !/#\/vertice(\/|$)/.test(String(e.newURL || '')) && !/^#\/vertice(\/|$)/.test(location.hash)) jnIr('efcwork'); });
/* Esc com o foco no EFCwork e um app na frente: quem volta é o Esc geral das camadas (tabela.js), uma camada por vez.
   (revisor, v0.6.35: havia um segundo ouvinte aqui, e um Esc podia voltar duas camadas) */
/* saiu da conta: as janelas fecham junto */
const jnSairOrig = typeof csSair === 'function' ? csSair : null;
if (jnSairOrig) csSair = async function () { S.jnAbertas.forEach(id => { const f = jnFr(id); if (f) f.remove(); }); S.jnAbertas = []; S.jnNome = {}; S.jnOcupada = {}; S.jnAtiva = 'efcwork'; jnDesenha(); return jnSairOrig.apply(this, arguments); };
