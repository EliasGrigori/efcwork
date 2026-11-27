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
const VT_URL = JN_RAIZ + '/efcwork/vertice/?em=cwork'; /* v0.6.36 (P5): o Vértice mora dentro do efcwork (era /EFCdocs/) */
const vtLiga = () => !!S.user && !S.user.precisaCompletar && isSup(S.user);

/* ---------- a porta ---------- */
function vtUsuario() {
  const u = S.user;
  if (!u || !u.id || u.precisaCompletar || u.bloqueado) return null;
  /* ITEM 195 (OPÇÃO 1, 26/11): quem não vê o menu entra no Vértice só pelo documento ligado (acesso 'documento': edita e
     imprime, não salva); a parte do Vértice é feita na conversa dele. ITEM 196: só Principal e Líder ★ salvam. */
  return { uid: String(u.id), nome: String(u.nome || ''), perfil: String(u.perfil || ''), estrela: !!u.estrela, acesso: vtLiga() ? 'completo' : 'documento', salvar: vtLiga() };
}
/* ---------- v0.6.41 (P4, autorizada pelo Elias em 27/11 07:22): a nuvem do Vértice, gravada e lida pelo Cwork ----------
   O Vértice não carrega o Firebase (decisão da v0.6.73): ele pede ao Cwork pela porta, recurso 'nuvem'.
   Formato que as regras [R7a]/[R7b] da v0.6.36 aceitam (NOTA-DO-CWORK-para-o-Vertice-P3c-regras.md):
   - vtd_arquivos/{id} = { v: 1, id, ficha (sem nuvem), versao, versaoPartes, pasta, partes, partesDe, bytes, porId, porNome, em }
   - vtd_partes/{id}_{versao}_{uid}_{n} = { arq, versao, n, b64, porId, em } (900 mil letras cada; só criados, nunca mudam)
   Sobe só arquivo numa das 5 pastas (decisão de 27/11 07:3x); só quem salva (Principal e Líder ★) grava. */
const VT_PARTE = 900000, VT_PARTES_MAX = 200;
const vtNegado = e => /permission|insufficient/i.test(String((e && (e.code || e.message)) || ''));
const vtnPastaOk = p => IP_PASTAS.indexOf(p) >= 0;
/* uma leitura só de uma consulta (a primeira resposta), com erro devolvido */
const vtUmaVez = o => new Promise((ok, falha) => { let off = null, feito = false; off = Data.col('vtd_arquivos').watch(l => { if (feito) return; feito = true; ok(l); setTimeout(() => off && off(), 0); }, Object.assign({ onError: e => { if (!feito) { feito = true; falha(e); } } }, o || {})); });
const vtnResumo = d => ({ id: d.id, pasta: d.pasta, versao: Number(d.versao) || 0, em: d.em || '', porNome: d.porNome || '', nome: (d.ficha && d.ficha.nome) || '', tipo: (d.ficha && d.ficha.tipo) || '', status: (d.ficha && d.ficha.status) || '' });
/* lista o que a pessoa pode ler: Principal e Líder ★ leem tudo; os outros, pasta por pasta (a pasta negada fica de fora) */
async function vtNuvemListar() {
  const u = vtUsuario(); if (!u) return [];
  if (u.salvar) return (await vtUmaVez({ limit: 2000 })).map(vtnResumo);
  const out = [];
  for (const p of vtPastasDe(S.user).filter(x => x.ler)) { try { (await vtUmaVez({ igual: ['pasta', p.nome] })).forEach(d => out.push(vtnResumo(d))); } catch (e) { if (!vtNegado(e)) throw e; } }
  return out;
}
async function vtFicha(id, doServidor) { try { return await (doServidor && !DEMO && navigator.onLine !== false ? Data.col('vtd_arquivos').fresco(id) : Data.col('vtd_arquivos').get(id)); } catch (e) { if (vtNegado(e)) return null; throw e; } }
/* lê um arquivo inteiro: { ficha, pacote, versao, pasta } ou null */
async function vtNuvemLer(id) {
  if (!vtUsuario()) return null; id = String(id || ''); if (!id) return null;
  const d = await vtFicha(id, true); if (!d) return null;
  const n = Number(d.partes) || 0, vp = Number(d.versaoPartes) || 0; let s = '';
  for (let i = 0; i < n; i++) { const p = await Data.col('vtd_partes').get(id + '_' + vp + '_' + d.partesDe + '_' + i); if (!p || typeof p.b64 !== 'string') throw new Error('Pedaço ' + (i + 1) + ' de ' + n + ' não chegou.'); s += p.b64; }
  return { ficha: d.ficha, pacote: s ? JSON.parse(s) : null, versao: Number(d.versao) || 0, pasta: d.pasta };
}
/* grava a versão seguinte. esperada = a versão da nuvem que o Vértice conhece. { ok, versao } | { conflito: true } */
async function vtNuvemGravar(dados, esperada) {
  const u = vtUsuario(); if (!u || !u.salvar) throw new Error('Só o Administrador e o Líder ★ salvam na nuvem.');
  if (!DEMO && navigator.onLine === false) throw new Error('sem internet'); /* sem internet a gravação do Firestore fica pendurada: o Vértice guarda na fila e tenta quando voltar */
  const ficha = dados && dados.ficha, id = String((ficha && ficha.id) || ''), pasta = ficha && ficha.pastaNome;
  if (!id || /[\/_]/.test(id) || id.length > 120) throw new Error('Arquivo sem id válido.');
  if (!vtnPastaOk(pasta)) throw new Error('Só sobe arquivo numa das 5 pastas.');
  const atual = await vtFicha(id, true), cur = atual ? Number(atual.versao) || 0 : 0;
  if (cur !== (Number(esperada) || 0)) return { conflito: true };
  const v = cur + 1, s = JSON.stringify(dados.pacote == null ? null : dados.pacote), partes = [];
  for (let i = 0; i < s.length; i += VT_PARTE) partes.push(s.slice(i, i + VT_PARTE));
  if (!partes.length) partes.push('');
  if (partes.length > VT_PARTES_MAX) throw new Error('Arquivo grande demais para a nuvem (' + Math.round(s.length / 1048576) + ' MB).');
  const em = nowISO(), limpa = JSON.parse(JSON.stringify(ficha)); delete limpa.nuvem;
  for (let n = 0; n < partes.length; n++) {
    const pid = id + '_' + v + '_' + u.uid + '_' + n;
    try { await Data.col('vtd_partes').set(pid, { arq: id, versao: v, n: n, b64: partes[n], porId: u.uid, em: em }); }
    catch (e) { if (!vtNegado(e)) throw e; const ja = await Data.col('vtd_partes').get(pid).catch(() => null); if (!ja) throw e; } /* pedaço já gravado numa tentativa anterior: segue */
  }
  try { await Data.col('vtd_arquivos').set(id, { v: 1, id: id, ficha: limpa, versao: v, versaoPartes: v, pasta: pasta, partes: partes.length, partesDe: u.uid, bytes: s.length, porId: u.uid, porNome: u.nome, em: em }); }
  catch (e) { if (vtNegado(e)) { const de = await vtFicha(id, true); if (de && (Number(de.versao) || 0) !== cur) return { conflito: true }; } throw e; }
  try { Audit.log({ acao: 'vertice_nuvem', entidade: 'vtd_arquivo', entidadeId: id, resumo: 'Vértice: ' + (limpa.nome || id) + ' na nuvem (versão ' + v + ', ' + pasta + ')' }); } catch {}
  return { ok: true, versao: v };
}
try {
  Object.defineProperty(window, 'CworkPonteVertice', {
    value: Object.freeze({ versao: 1, recursos: Object.freeze(['usuario', 'evento', 'acesso', 'pastas', 'nuvem']), usuario: () => vtUsuario(), pastas: () => vtPastasDe(S.user),
      nuvem: Object.freeze({ listar: () => vtNuvemListar(), ler: id => vtNuvemLer(id), gravar: (dados, esperada) => vtNuvemGravar(dados, esperada) }) }),
    writable: false, configurable: false, enumerable: false
  });
} catch (e) { console.warn('porta do Vértice:', e); }

/* ---------- o endereço de cada aba ---------- */
/* quem vê o menu abre o Vértice no modo do Cwork (?em=cwork: lê a porta); os outros, como antes (só pelo documento ligado) */
Object.defineProperty(JN_APPS.docs, 'url', { get: () => vtLiga() ? VT_URL : JN_RAIZ + '/efcwork/vertice/', configurable: true });
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
/* v0.6.36 (P5, revisor): o Vértice mora em /efcwork/vertice/ com o sw.js dele. Quem vê o menu já deixa a tela do Vértice guardada
   no aparelho ao entrar, para a aba abrir sem internet mesmo antes da primeira vez (antes, ela ficava guardada em /EFCdocs/). */
let vtSwFeito = false;
function vtGuardaVertice() {
  if (vtSwFeito || !vtLiga() || !('serviceWorker' in navigator) || location.protocol !== 'https:' || !/^\/efcwork\//.test(location.pathname)) return;
  vtSwFeito = true; navigator.serviceWorker.register('/efcwork/vertice/sw.js', { scope: '/efcwork/vertice/' }).catch(() => { vtSwFeito = false; });
}
setInterval(vtGuardaVertice, 5000);

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
