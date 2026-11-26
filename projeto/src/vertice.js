/* EFCwork · vertice.js — v0.6.34 (P3a do plano "Vértice como aba do Cwork", aprovado pelo Elias em 26/11/2026). Prefixo: vt.
   O Vértice (React) roda num quadro (iframe) do mesmo site e pergunta ao Cwork quem entrou pela porta combinada
   no PEDIDO-P3 (seção 3):
     window.CworkPonteVertice = { versao: 1, recursos: [...], usuario() → { uid, nome, perfil, estrela, acesso, salvar } | null, pastas() }
     e o evento 'cwork:usuario' nesta janela quando entra, sai ou muda o cadastro (ou a pasta liberada).
   - A porta existe sempre (mesmo sem ninguém logado: usuario() devolve null), como o Vértice pediu.
   - Nome e dados pessoais vêm do cadastro do Cwork (decisão do Elias, 26/11 10:12). Sem campo de conta de teste:
     o modo de teste do Vértice (sem login, só no aparelho) fica com a conversa do Vértice.
   - v0.6.35 (decisão de 26/11 13:18, ITEM 200 = OPÇÃO 2): o menu "Vértice Docs" abre direto a tela inteira com abas no alto
     (janelas.js); a área ao lado do menu saiu. Várias abas do Vértice; cada aba mostra o nome do arquivo aberto nela, e o
     arquivo da aba da frente vai para o título da janela do navegador (ITEM 199).
   - Mensagens do Vértice: só do mesmo site, só com de: 'vertice' e só de um quadro do Vértice.
   - Quem vê o menu: Administrador e Líder ★ (tela sem permissão some). Os outros abrem o Vértice só pelo documento ligado
     (ITEM 195; a parte do Vértice é feita na conversa dele). */
Object.assign(S, { vtVer: '' });
Object.assign(ICS, {
  vertice: '<path d="M12 3 3 20h18L12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 14h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
});
const VT_URL = JN_RAIZ + '/EFCdocs/?em=cwork';
const vtLiga = () => !!S.user && !S.user.precisaCompletar && isSup(S.user);

/* ---------- a porta ---------- */
function vtUsuario() {
  const u = S.user;
  if (!u || !u.id || u.precisaCompletar || u.bloqueado) return null;
  /* ITEM 195 (OPÇÃO 1, 26/11): quem não vê o menu entra no Vértice só pelo documento ligado (acesso 'documento': edita e
     imprime, não salva); a parte do Vértice é feita na conversa dele. ITEM 196: só Principal e Líder ★ salvam. */
  return { uid: String(u.id), nome: String(u.nome || ''), perfil: String(u.perfil || ''), estrela: !!u.estrela, acesso: vtLiga() ? 'completo' : 'documento', salvar: vtLiga() };
}
try {
  Object.defineProperty(window, 'CworkPonteVertice', {
    value: Object.freeze({ versao: 1, recursos: Object.freeze(['usuario', 'evento', 'acesso', 'pastas']), usuario: () => vtUsuario(), pastas: () => vtPastasDe(S.user) }),
    writable: false, configurable: false, enumerable: false
  });
} catch (e) { console.warn('porta do Vértice:', e); }

/* ---------- o endereço de cada aba ---------- */
/* quem vê o menu abre o Vértice no modo do Cwork (?em=cwork: lê a porta); os outros, como antes (só pelo documento ligado) */
Object.defineProperty(JN_APPS.docs, 'url', { get: () => vtLiga() ? VT_URL : JN_RAIZ + '/EFCdocs/', configurable: true });
JN_APPS.docs.podeNova = () => vtLiga();
const vtAbas = () => S.jnAbertas.filter(x => jnBase(x) === 'docs');
/* tira as abas do Vértice sem perguntar (troca de conta; perdeu a permissão: só as abertas no modo do Cwork) */
function vtFechaAbas(soCwork) { vtAbas().forEach(id => { const f = jnFr(id); if (!soCwork || (f && f.getAttribute('data-url') === VT_URL)) jnTira(id); }); }

/* avisa o Vértice quando quem entrou (ou o cadastro, ou a pasta liberada) muda */
let vtUlt = 'x', vtUid = '';
function vtConfere() {
  let k, u = null; try { u = vtUsuario(); k = JSON.stringify([u, typeof vtPastasDe === 'function' ? vtPastasDe(S.user) : []]); } catch { k = 'null'; }
  if (k === vtUlt) return; vtUlt = k;
  const uid = u ? u.uid : ''; if (vtUid && uid !== vtUid) vtFechaAbas(false); vtUid = uid; /* trocou de conta: o Vértice recomeça (nada do anterior fica aberto) */
  try { window.dispatchEvent(new Event('cwork:usuario')); } catch (e) { console.warn(e); }
  if (!vtLiga()) vtFechaAbas(true);
}
setInterval(vtConfere, 2000); /* garantia: o render também confere */

/* ---------- o menu ---------- */
{ const i = AREAS.findIndex(a => a.id === 'documentos');
  AREAS.splice(i >= 0 ? i + 1 : AREAS.length - 1, 0, { id: 'vertice', nome: 'Vértice Docs', ic: 'vertice', get negada() { return !!S.user && !vtLiga(); }, abas: [] }); }
/* o item do menu abre a tela inteira (não é mais uma área ao lado do menu); Ctrl + clique segue para uma aba do navegador */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href="#/vertice"]'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
  e.preventDefault(); e.stopPropagation(); if (!vtLiga()) return;
  jnDepoisDoMenu(() => jnAbrir('docs')); /* revisor: o menu do celular sai da pilha do voltar antes (senão a camada 'menu' ficava presa) */
}, true);
/* chegou no endereço #/vertice (link, recarregar, Ctrl + clique): volta para onde estava e abre a tela inteira, sem passo no voltar */
TELAS.vertice = () => '';
let vtDe = '#/inicio';
const vtRenderOrig = render;
render = function () {
  const r = S.rota;
  if (r && r.area === 'vertice' && (!S.user || vtDe === '#/vertice')) vtDe = '#/inicio'; /* revisor: nunca voltar para o próprio #/vertice */
  if (S.user && r && r.area === 'vertice') {
    try { history.replaceState(history.state, '', vtDe); } catch {} S.rota = csLeRota();
    if (vtLiga() && !S.user.precisaCompletar) setTimeout(() => jnAbrir('docs'), 0);
  } else if (S.user && r && r.area && r.area !== 'vertice' && !/^#\/vertice(\/|$)/.test(location.hash)) vtDe = location.hash || '#/inicio';
  vtRenderOrig.apply(this, arguments); try { vtConfere(); vtTitulo(); } catch (e) { console.error(e); }
};

/* ---------- título da janela do navegador: o arquivo da aba do Vértice que está na frente (ITEM 199) ---------- */
let vtTitOrig = '';
function vtTitulo() {
  if (!vtTitOrig) vtTitOrig = document.title;
  const id = S.jnAtiva, na = S.user && id && jnBase(id) === 'docs';
  document.title = na ? (S.jnNome[id] ? S.jnNome[id] + ' · ' : '') + 'Vértice Docs · ' + APP_NOME : vtTitOrig;
}
JN_DEPOIS.push(vtTitulo);

/* ---------- mensagens do Vértice ---------- */
addEventListener('message', e => {
  const d = e.data;
  if (e.origin !== location.origin || !d || d.de !== 'vertice') return;
  const id = vtAbas().find(x => { const f = jnFr(x); return f && e.source === f.contentWindow; }); if (!id) return; /* só de um quadro do Vértice */
  if (d.tipo === 'pronto') S.vtVer = String(d.versao || '').slice(0, 24);
  else if (d.tipo === 'arquivo') {
    const nome = d.nome ? String(d.nome).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120) : '';
    if ((S.jnNome[id] || '') === nome) return;
    if (nome) S.jnNome[id] = nome; else delete S.jnNome[id];
    jnDesenha();
  }
});

/* no menu, o Vértice sai de "Apps da família" (já está nas áreas) */
const vtAppsOrig = csAppsFamilia;
csAppsFamilia = function (n) {
  if (!vtLiga()) return vtAppsOrig.apply(this, arguments);
  const tudo = CS_APPS.slice(); CS_APPS.splice(0, CS_APPS.length, ...tudo.filter(a => a.id !== 'docs'));
  try { return vtAppsOrig.apply(this, arguments); } finally { CS_APPS.splice(0, CS_APPS.length, ...tudo); }
};
