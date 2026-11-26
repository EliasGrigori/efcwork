/* EFCwork · vertice.js — v0.6.34 (P3a do plano "Vértice como aba do Cwork", aprovado pelo Elias em 26/11/2026). Prefixo: vt.
   O Vértice Docs vira uma área do Cwork (menu lateral), no lugar da janela por cima. Continuam dois programas:
   o Vértice (React) roda num quadro (iframe) do mesmo site e pergunta ao Cwork quem entrou pela porta combinada
   no PEDIDO-P3 (seção 3):
     window.CworkPonteVertice = { versao: 1, recursos: [...], usuario() → { uid, nome, perfil, estrela } | null, pastas() }
     e o evento 'cwork:usuario' nesta janela quando entra, sai ou muda o cadastro.
   - A porta existe sempre (mesmo sem ninguém logado: usuario() devolve null), como o Vértice pediu.
   - Nome e dados pessoais vêm do cadastro do Cwork (decisão do Elias, 26/11 10:12). Sem campo de conta de teste:
     o modo de teste do Vértice (sem login, só no aparelho) fica com a conversa do Vértice.
   - pastas() devolve [] até a P3b (Administração › Pastas do Vértice).
   - O quadro mora fora do #app (a tela redesenha e o Vértice continua vivo) e fica por cima do lugar reservado na área.
   - Mensagens do Vértice: só do mesmo site, só com de: 'vertice' e só do quadro do Vértice. 'arquivo' mostra o nome
     do arquivo aberto no cabeçalho; 'pronto' guarda a versão.
   - Quem vê a área: o mesmo de hoje para o botão do Vértice (Administrador e Líder ★). Tela sem permissão some.
   - Volta: a janela por cima continua no botão do cabeçalho ("Abrir em janela"); nunca ficam as duas vivas juntas.
   - Pedidos que já abriam o Vértice (Impressos, Ponte, Documentos da remessa) passam a abrir a aba. */
Object.assign(S, { vtArq: '', vtTipo: '', vtVer: '' });
Object.assign(ICS, {
  vertice: '<path d="M12 3 3 20h18L12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 14h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  janela: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18" fill="none" stroke="currentColor" stroke-width="1.8"/>'
});
const VT_URL = JN_RAIZ + '/EFCdocs/?em=cwork';
const vtLiga = () => !!S.user && !S.user.precisaCompletar && isSup(S.user);

/* ---------- a porta ---------- */
function vtUsuario() {
  const u = S.user;
  if (!u || !u.id || u.precisaCompletar || u.bloqueado) return null;
  /* ITEM 195 (OPÇÃO 1, 26/11): quem não vê a área entra no Vértice só pelo documento ligado (acesso 'documento': edita e
     imprime, não salva); a parte do Vértice é feita na conversa dele. ITEM 196: só Principal e Líder ★ salvam. */
  return { uid: String(u.id), nome: String(u.nome || ''), perfil: String(u.perfil || ''), estrela: !!u.estrela, acesso: vtLiga() ? 'completo' : 'documento', salvar: vtLiga() };
}
try {
  Object.defineProperty(window, 'CworkPonteVertice', {
    value: Object.freeze({ versao: 1, recursos: Object.freeze(['usuario', 'evento', 'acesso']), usuario: () => vtUsuario(), pastas: () => [] }),
    writable: false, configurable: false, enumerable: false
  });
} catch (e) { console.warn('porta do Vértice:', e); }
/* avisa o Vértice quando quem entrou (ou o cadastro) muda */
let vtUlt = 'x', vtUid = '';
function vtConfere() {
  let k, u = null; try { u = vtUsuario(); k = JSON.stringify(u); } catch { k = 'null'; }
  if (k === vtUlt) return; vtUlt = k;
  const uid = u ? u.uid : ''; if (vtUid && uid !== vtUid) vtDesliga(); vtUid = uid; /* trocou de conta: o Vértice recomeça (nada do anterior fica aberto) */
  try { window.dispatchEvent(new Event('cwork:usuario')); } catch (e) { console.warn(e); }
  if (!vtLiga()) vtDesliga();
}
setInterval(vtConfere, 2000); /* garantia: o render também confere */

/* ---------- a área ---------- */
{ const i = AREAS.findIndex(a => a.id === 'documentos');
  AREAS.splice(i >= 0 ? i + 1 : AREAS.length - 1, 0, { id: 'vertice', nome: 'Vértice Docs', ic: 'vertice', get negada() { return !!S.user && !vtLiga(); }, abas: [] }); }
const vtArqPl = () => S.vtArq ? metaPl(S.vtArq, '', S.vtTipo === 'planilha' ? 'planilha' : 'doc') : metaPl('Nenhum arquivo aberto');
TELAS.vertice = () => cabecalho({
  titulo: 'Vértice Docs',
  meta: ['<span id="vt-arq">' + vtArqPl() + '</span>'],
  acoes: '<button type="button" class="bt ic-so" data-act="vt-janela" title="Abrir em janela por cima" aria-label="Abrir o Vértice em janela por cima">' + ic('janela') + '</button>'
}) + (typeof jnFr === 'function' && jnFr('docs')
  ? '<div class="vt-lugar vt-vz" id="vt-lugar"><div class="vazio"><b>O Vértice está aberto na janela por cima.</b><span>O que estiver aberto lá continua lá.</span><button type="button" class="bt" data-act="vt-trazer">Trazer para a aba</button></div></div>'
  : '<div class="vt-lugar" id="vt-lugar"></div>');
TELAS['vertice:depois'] = () => { if (!(typeof jnFr === 'function' && jnFr('docs'))) vtAbrir(); }; /* com a janela por cima aberta, não pergunta sozinho: espera o "Trazer para a aba" */

/* ---------- o quadro ---------- */
const vtFr = () => document.querySelector('#vt-fr iframe');
function vtAbrir(rota) {
  if (!vtLiga()) return;
  if (S.rota.area !== 'vertice') { location.hash = '#/vertice'; }
  if (typeof jnFr === 'function' && jnFr('docs')) return; /* nunca os dois vivos: a troca é só pelo "Trazer para a aba" */
  let box = $('#vt-fr');
  if (!box) { box = document.createElement('div'); box.id = 'vt-fr'; box.className = 'vt-fr'; document.body.appendChild(box); }
  let fr = vtFr();
  if (!fr) {
    fr = document.createElement('iframe'); fr.title = 'Vértice Docs';
    fr.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen');
    fr.src = VT_URL + (rota || '');
    box.appendChild(fr); S.vtArq = ''; S.vtTipo = '';
  } else if (rota) {
    try { fr.contentWindow.location.replace(VT_URL + rota); } catch (e) { fr.src = VT_URL + rota; }
  }
  vtPoe();
}
/* "Trazer para a aba": pergunta antes de fechar a janela por cima (o que estiver sem salvar lá pode se perder) */
function vtTrocaJanela() {
  csConfirma({ titulo: 'Trazer o Vértice para a aba?', texto: 'A janela por cima do Vértice vai fechar. O que já foi salvo continua lá; o que estiver aberto sem salvar pode se perder.', sim: 'Trazer para a aba', nao: 'Deixar a janela' }, () => {
    const f = jnFr('docs'); if (f) f.remove(); S.jnAbertas = S.jnAbertas.filter(x => x !== 'docs');
    if (S.jnAtiva === 'docs') { S.jnAtiva = S.jnAbertas.length ? S.jnAbertas[S.jnAbertas.length - 1] : 'efcwork'; if (S.jnAtiva === 'efcwork' && typeof jnSaiCamada === 'function') jnSaiCamada(); }
    if (typeof jnDesenha === 'function') jnDesenha();
    if (S.rota.area === 'vertice') render(); else location.hash = '#/vertice';
  });
}
function vtDesliga() { const b = $('#vt-fr'); if (b) b.remove(); S.vtArq = ''; S.vtTipo = ''; const el = $('#vt-arq'); if (el) el.innerHTML = vtArqPl(); }
/* põe o quadro por cima do lugar reservado (o lugar ocupa o resto da tela) */
let vtPoeQ = 0;
function vtPoeLogo() { if (vtPoeQ) return; vtPoeQ = requestAnimationFrame(() => { vtPoeQ = 0; vtPoe(); }); } /* no máximo uma vez por quadro */
function vtPoe() {
  document.documentElement.classList.toggle('vt-area', S.rota && S.rota.area === 'vertice' && !!S.user);
  const box = $('#vt-fr'); if (!box) return;
  const lg = S.rota.area === 'vertice' ? $('#vt-lugar') : null;
  /* menu do celular, gaveta, busca ou confirmação por cima: o quadro sai da frente (o #app é uma camada só, abaixo dele) */
  const cobre = (S.camadas && S.camadas.length) || $('.cs-app.menu-aberto') || $('#gv') || (typeof csConfirmaAberto === 'function' && csConfirmaAberto());
  if (!lg || cobre) { box.hidden = true; return; }
  const bx = $('.cs-baixo'), baixo = bx && getComputedStyle(bx).display !== 'none' ? bx.getBoundingClientRect().height : 0;
  const r0 = lg.getBoundingClientRect(), h = Math.max(240, innerHeight - r0.top - baixo - 12);
  lg.style.height = h + 'px';
  const r = lg.getBoundingClientRect();
  Object.assign(box.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  box.hidden = false;
}
const vtRenderOrig = render;
render = function () {
  if (S.user && S.rota && S.rota.area === 'vertice' && !vtLiga()) { try { history.replaceState(history.state, '', '#/inicio'); } catch {} S.rota = csLeRota(); } /* perdeu a permissão com a aba aberta: a tela some (sem passo no voltar) */
  vtRenderOrig.apply(this, arguments); try { vtConfere(); vtPoe(); requestAnimationFrame(() => vtPoe()); [150, 400].forEach(ms => setTimeout(vtPoe, ms)); } catch (e) { console.error(e); } /* o menu e o cabeçalho ainda se acomodam depois do desenho */
};
['csCamadaAbre', 'csPop', 'csFechaMenu', 'gvDesenha'].forEach(n => { const o = window[n]; if (typeof o !== 'function') return;
  window[n] = function () { const r = o.apply(this, arguments); try { vtPoe(); } catch {} return r; }; });
try { new MutationObserver(vtPoeLogo).observe(document.body, { childList: true }); } catch {}
addEventListener('resize', vtPoeLogo);
addEventListener('scroll', vtPoeLogo, true);
try { new ResizeObserver(vtPoeLogo).observe(document.body); } catch {}
document.addEventListener('transitionend', e => { if (e.target && e.target.closest && e.target.closest('.cs-lado, .cs-app')) vtPoeLogo(); });

/* ---------- mensagens do Vértice ---------- */
addEventListener('message', e => {
  const d = e.data, fr = vtFr();
  if (e.origin !== location.origin || !d || d.de !== 'vertice') return;
  if (!fr || e.source !== fr.contentWindow) return; /* só o quadro da aba (a janela por cima tem o dela) */
  if (d.tipo === 'pronto') S.vtVer = String(d.versao || '').slice(0, 24);
  else if (d.tipo === 'arquivo') {
    S.vtArq = d.nome ? String(d.nome).slice(0, 120) : '';
    S.vtTipo = ['planilha', 'docx', 'postits'].indexOf(d.tipoArquivo) >= 0 ? d.tipoArquivo : '';
    const el = $('#vt-arq'); if (el) el.innerHTML = vtArqPl();
  }
});

/* ---------- quem já abria o Vértice passa a abrir a aba ---------- */
const vtJnAbrirOrig = jnAbrir;
/* com a janela por cima aberta (a volta), ou com uma gaveta ou formulário aberto (por exemplo a fila "Abrir o próximo no Vértice"
   dos Papéis deste envio), o pedido vai para a janela por cima: assim a gaveta não se perde e o Esc volta para ela */
const vtTemCamada = () => !!(S.gv || S.fm || (S.camadas && S.camadas.length) || $('#gv'));
jnAbrir = function (id, rota) { if (id === 'docs' && vtLiga() && !jnFr('docs') && !vtTemCamada()) return vtAbrir(rota); return vtJnAbrirOrig.apply(this, arguments); };
/* no menu, o Vértice sai de "Apps da família" (já está nas áreas) */
const vtAppsOrig = csAppsFamilia;
csAppsFamilia = function (n) {
  if (!vtLiga()) return vtAppsOrig.apply(this, arguments);
  const tudo = CS_APPS.slice(); CS_APPS.splice(0, CS_APPS.length, ...tudo.filter(a => a.id !== 'docs'));
  try { return vtAppsOrig.apply(this, arguments); } finally { CS_APPS.splice(0, CS_APPS.length, ...tudo); }
};
/* volta: a janela por cima (modo de antes); a aba fecha o quadro dela */
document.addEventListener('click', e => {
  if (!e.target.closest) return;
  if (e.target.closest('[data-act="vt-janela"]')) { vtDesliga(); vtJnAbrirOrig('docs'); render(); }
  else if (e.target.closest('[data-act="vt-trazer"]')) vtTrocaJanela();
});
