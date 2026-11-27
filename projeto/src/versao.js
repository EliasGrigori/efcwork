/* EFCwork · versao.js — aviso de versão nova do app. Prefixo: vn. v0.6.37.
   Como funciona: o app pede ao navegador para procurar um sw.js novo ao abrir, ao voltar para o app, quando a internet volta e a
   cada 30 min. Quando a versão nova está pronta no aparelho, aparece o aviso. Nada recarrega sozinho: só no toque em "Atualizar",
   e antes pergunta se há algo preenchido ou apps abertos em abas (Vértice, Sabiá).
   Forma aprovada (ITEM 226, 26/11 20:58): janela no meio ("OPÇÃO 5"); com "Depois" (ou Esc, voltar, toque fora) o aviso
   passa para o pé do menu ("OPÇÃO 3"), com bolinha no botão do menu do celular. A janela é uma camada: Esc e o voltar fecham só ela. */
S.vn = { nova: '', fechada: false, indo: false, vendo: false, pedido: 0, ult: 0, reg: null, foco: null };
const VN_ESPERA = 5 * 60000, VN_CADA = 30 * 60000;
const vnMaior = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0; } return false; };

/* ---------- achar a versão nova ---------- */
/* pergunta a versão ao service worker (o de antes da v0.6.37 não responde) */
function vnPergunta(sw) {
  return new Promise(ok => {
    if (!sw) return ok('');
    const c = new MessageChannel(), t = setTimeout(() => ok(''), 3000);
    c.port1.onmessage = e => { clearTimeout(t); ok(String(e.data || '')); };
    try { sw.postMessage('versao', [c.port2]); } catch (e) { clearTimeout(t); ok(''); }
  });
}
async function vnExamina(sw, esperando) {
  if (!sw || S.vn.indo) return;
  const v = await vnPergunta(sw);
  if (sw.state === 'redundant' || S.vn.indo) return;  /* enquanto esperava a resposta, outro sw tomou o lugar deste */
  if (!v && !esperando) return;                       /* o sw que já está no comando é antigo: nada a avisar */
  if (v && !vnMaior(v, VERSAO)) {                     /* a tela já é essa versão (ou mais nova): o sw assume calado, sem recarregar */
    if (esperando) { try { sw.postMessage('pular'); } catch (e) {} }
    if (S.vn.nova && !vnMaior(S.vn.nova, VERSAO)) { S.vn.nova = ''; vnDesenha(); }
    return;
  }
  const nova = v || 'nova';
  if (S.vn.nova !== nova) S.vn.fechada = false; /* uma versão mais nova ainda volta a avisar */
  S.vn.nova = nova; vnDesenha();
}
function vnAcompanha(sw) {
  if (!sw) return;
  const ve = () => { if (sw.state === 'installed' && navigator.serviceWorker.controller) vnExamina(sw, true); };
  sw.addEventListener('statechange', ve); ve();
}
function vnProcura(forca) {
  const reg = S.vn.reg; if (!reg || navigator.onLine === false) return;
  if (!forca && Date.now() - S.vn.ult < VN_ESPERA) return;
  S.vn.ult = Date.now();
  reg.update().then(() => { if (reg.waiting) vnExamina(reg.waiting, true); }).catch(() => {});
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    S.vn.reg = reg;
    reg.addEventListener('updatefound', () => vnAcompanha(reg.installing));
    if (reg.waiting) vnExamina(reg.waiting, true); else vnAcompanha(reg.installing);
    vnProcura(true);
  }).catch(() => {});
  /* outra aba do app mandou a versão nova assumir (ou este toque em "Atualizar") */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (S.vn.indo) { vnRecarrega(); return; }
    vnExamina(navigator.serviceWorker.controller, false);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') vnProcura(false); });
  addEventListener('online', () => vnProcura(true));
  setInterval(() => { if (document.visibilityState === 'visible') vnProcura(false); }, VN_CADA);
}

/* ---------- atualizar ---------- */
function vnRecarrega() { if (S.vn.recarregou) return; S.vn.recarregou = true; location.reload(); }
/* o que se perderia ao recarregar */
function vnDigitado() {
  return Array.from(document.querySelectorAll('input, textarea')).some(el => {
    if (['hidden', 'search', 'checkbox', 'radio', 'button', 'submit', 'range', 'color', 'file'].indexOf(el.type) >= 0) return false;
    if (el.closest('.cs-busca, .bg-fundo, .tb-mn, .tb-bar, .vn, #jn') || /^(buscar|procurar|filtrar)/i.test(el.placeholder || '')) return false;
    return !!String(el.value || '').trim() && el.value !== el.defaultValue;
  });
}
/* preenchido e não gravado: a ficha aberta, a que ficou atrás dela, e os rascunhos que moram fora da ficha */
function vnPreenchido() {
  const f = S.fm;
  if (f && (f.sujo || f.paiSujo)) return true;                                  /* paiSujo: papéis do envio atrás do endereço (kit.js) */
  if (f && f.volta === anVoltaCancela && S._anVolta && S._anVolta.sujo) return true; /* análise atrás da ficha de ação, eficácia etc. */
  if (Object.values(S.cgRasc || {}).some(r => Object.values(r || {}).some(v => String(v).trim() !== ''))) return true; /* contagem */
  const e = S._ppEd, r = e && ppPlano(e.rid);                                    /* aba Ajustes do plano de coleta */
  if (r && (!ppIgual(e.ans, r.analiseIds) || !ppIgual(e.areas, r.areas))) return true;
  if (S.auAp && S.auAp.ed) return true;                                          /* correção na apresentação da auditoria */
  if (S.fed && JSON.stringify(S.fed.l) !== S.fed.l0) return true;                /* marcas na foto */
  return vnDigitado();
}
function vnRisco(pendente) {
  const l = [];
  if (vnPreenchido()) l.push('O que foi preenchido e ainda não foi gravado se perde.');
  if (pendente) l.push(S._semCache ? 'Há lançamentos que ainda não chegaram à nuvem e este aparelho não está guardando cópia: eles podem se perder.' : 'Há gravação que ainda não chegou à nuvem (sem internet ou internet lenta); se for grande, pode ficar pela metade.');
  const n = (S.jnAbertas || []).length;
  if (n) l.push((n === 1 ? 'A aba aberta (' + jnRotulo(S.jnAbertas[0]) + ') fecha' : 'As ' + n + ' abas abertas fecham') + '; o que estiver sem salvar nela' + (n === 1 ? '' : 's') + ' se perde.');
  return l.join(' ');
}
function vnVai() {
  const w = S.vn.reg && S.vn.reg.waiting;
  S.vn.indo = true; vnDesenha();
  if (!w) { vnRecarrega(); return; }
  try { w.postMessage('pular'); } catch (e) {}
  setTimeout(vnRecarrega, 4000);                      /* se o aviso de troca não vier */
}
async function vnAtualizar() {
  if (S.vn.indo || S.vn.vendo) return;
  const id = ++S.vn.pedido; S.vn.vendo = true;
  setTimeout(() => { if (S.vn.vendo && id === S.vn.pedido) vnDesenha(); }, 300);   /* só mostra "Conferindo…" se a resposta demorar */
  let pendente = false;
  try { pendente = !(await Data.semPendentes(2500)); } catch (e) { pendente = true; }
  if (id !== S.vn.pedido) return;                     /* tocou em "Depois" enquanto conferia */
  S.vn.vendo = false;
  const r = vnRisco(pendente);
  if (!r) { vnDesenha(); vnVai(); return; }
  vnFecha();                                          /* a pergunta toma o lugar da janela; "Depois" nela deixa no pé do menu */
  csConfirma({ titulo: 'Atualizar agora?', texto: r, sim: 'Atualizar', nao: 'Depois' }, vnVai);
}
/* "Depois" (botão, Esc, voltar ou toque fora): a janela sai e o aviso fica no pé do menu */
function vnFecha() { S.vn.fechada = true; S.vn.vendo = false; S.vn.pedido++; vnDesenha(); }

/* ---------- o aviso na tela ---------- */
const vnNome = () => S.vn.nova && S.vn.nova !== 'nova' ? 'v' + S.vn.nova : '';
const vnBt = () => '<button type="button" class="bt pr" data-act="vn-atualiza"' + (S.vn.indo || S.vn.vendo ? ' disabled' : '') + '>' + (S.vn.indo ? 'Atualizando…' : S.vn.vendo ? 'Conferindo…' : 'Atualizar') + '</button>';
const vnTexto = () => '<span class="vn-t"><b id="vn-tt">Versão nova do app</b>' + (vnNome() ? '<small>' + esc(vnNome()) + '</small>' : '') + '</span>';
/* cria, atualiza ou tira um elemento (sem recriar à toa, para a animação de entrada rodar uma vez só) */
function vnPoe(sel, sim, html, onde, antes) {
  let el = document.querySelector(sel);
  if (!sim || !onde) { if (el) el.remove(); return null; }
  const cx = document.createElement('div'); cx.innerHTML = html; const novo = cx.firstChild;
  if (el && el.parentNode === onde) { if (el.innerHTML !== novo.innerHTML) el.innerHTML = novo.innerHTML; return el; }
  if (el) el.remove();
  onde.insertBefore(novo, antes || null); return novo;
}
const vnFrente = () => !(S.jnAbertas || []).length || !S.jnAtiva || S.jnAtiva === 'efcwork';
/* a janela é uma camada (Esc e voltar fecham só ela); com o Vértice ou o Sabiá na frente, espera o Cwork voltar */
function vnCamada(mostra) {
  const tem = typeof csTemCamada === 'function' && csTemCamada('vn');
  if (mostra && !tem) {
    if (S._ignPop > 0) { clearTimeout(S.vn._t); S.vn._t = setTimeout(vnDesenha, 450); return; } /* o navegador ainda está voltando outra camada */
    csCamadaAbre('vn', () => { vnFecha(); });
  } else if (!mostra && tem) csCamadaSaiu('vn');
}
function vnDesenha() {
  const tem = !!S.vn.nova, aberto = tem && !S.vn.fechada, b = document.body, antes = document.querySelector('.vn-jan');
  const jan = vnPoe('.vn-jan', aberto, '<div class="vn vn-jan" data-vn-fundo="1"><div class="vn-cx" role="dialog" aria-modal="true" aria-labelledby="vn-tt" tabindex="-1">' + vnTexto() +
    '<p>O app atualiza em poucos segundos e volta para esta tela.</p><div class="vn-bts"><button type="button" class="bt" data-act="vn-fecha">Depois</button>' + vnBt() + '</div></div></div>', b);
  if (jan && !antes) {                               /* acabou de abrir: guarda onde estava o cursor e põe o foco na janela (Enter de quem digitava não atualiza) */
    const a = document.activeElement; S.vn.foco = a && a !== b ? a : null;
    if (vnFrente()) setTimeout(() => { const c = jan.querySelector('.vn-cx'); if (c && document.contains(c)) try { c.focus({ preventScroll: true }); } catch (e) {} }, 0);
  }
  if (!jan && antes && S.vn.foco) { const f = S.vn.foco; S.vn.foco = null; if (document.contains(f)) try { f.focus({ preventScroll: true }); } catch (e) {} }
  if (!S.vn.indo) vnCamada(aberto && vnFrente());
  /* fechado: "Atualizar o app" no pé do menu e bolinha no botão do menu do celular */
  const pe = document.querySelector('.cs-pe'), noPe = tem && S.vn.fechada;
  vnPoe('.vn-pe', noPe, '<button type="button" class="vn-pe" data-act="vn-atualiza">' + ic('gira') + '<span><b>Atualizar o app</b><small>' + esc(vnNome() ? 'Versão ' + vnNome() + ' pronta' : 'Versão nova pronta') + '</small></span></button>', pe, pe && pe.querySelector('.cs-cw'));
  const menu = document.querySelector('.cs-so-cel'); if (menu) menu.classList.toggle('vn-ponto', noPe);
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="vn-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'vn-atualiza') vnAtualizar(); else if (a === 'vn-fecha') vnFecha();
});
/* toque no fundo escuro = "Depois" */
document.addEventListener('click', e => { if (e.target && e.target.getAttribute && e.target.getAttribute('data-vn-fundo')) vnFecha(); });
/* o Vértice ou o Sabiá saiu da frente: a janela aparece (e entra na fila do voltar) */
if (typeof JN_DEPOIS !== 'undefined') JN_DEPOIS.push(() => { if (S.vn.nova) vnDesenha(); });
/* a tela é redesenhada: o aviso volta para o lugar */
const vnRenderAntes = render;
render = function () { const r = vnRenderAntes.apply(this, arguments); if (S.vn.nova) vnDesenha(); return r; };
