/* EFCwork · casca.js — estado, rotas por endereço (#/area/aba), menu lateral, barra de cima, cabeçalho de página e temas.
   Prefixo dos nomes deste módulo: cs. Telas de cada área se registram em TELAS[area] (ver areas.js, inicio.js, adm.js). */
const S = { user: null, empresa: null, rota: { area: 'inicio', aba: '' }, pronto: false, conexao: null, tarefas: [], _desl: [] };
const TELAS = {};
const CS_CARGAS = []; /* funções que cada área registra para começar a ouvir os dados dela depois do login */

/* áreas do EFCwork (estrutura aprovada no Estudo do Rework, 05/11/2026). "versao" = quando a área é refeita aqui */
const AREAS = [
  { id: 'inicio', nome: 'Início', ic: 'casa', abas: [] },
  { id: 'coletas', nome: 'Coletas', ic: 'frasco', versao: 'v0.4', abas: [{ id: 'amostras', nome: 'Amostras' }, { id: 'programacao', nome: 'Programação' }, { id: 'envio', nome: 'Envio' }, { id: 'cadastros', nome: 'Cadastros' }, { id: 'plano', nome: 'Plano de coleta', oculta: true, pai: 'programacao' }] },
  { id: 'rateios', nome: 'Rateios', ic: 'pizza', versao: 'v0.7', abas: [] },
  { id: 'inspecoes', nome: 'Inspeções', ic: 'lista', versao: 'v0.6', abas: [{ id: 'cloro', nome: 'Cloro' }, { id: 'apontamentos', nome: 'Apontamentos' }, { id: 'auditoria', nome: 'Auditoria interna' }] },
  { id: 'documentos', nome: 'Documentos', ic: 'doc', versao: 'v0.5', parcial: 'documentos, caixas d’água e histórico prontos aqui; o relatório de documentos segue no EFClaudian', abas: [{ id: 'documentos', nome: 'Documentos' }, { id: 'caixas', nome: 'Caixas d’água' }, { id: 'historico', nome: 'Histórico' }] },
  { id: 'almox', nome: 'Almoxarifado', ic: 'caixa', versao: 'v0.3', parcial: 'consultar e lançar prontos aqui; cadastro de material, kits, fotos e inventário seguem no EFClaudian', abas: [{ id: 'painel', nome: 'Painel' }, { id: 'materiais', nome: 'Materiais' }, { id: 'movimentacoes', nome: 'Movimentações' }, { id: 'solicitacoes', nome: 'Solicitações' }, { id: 'equipamentos', nome: 'Equipamentos' }, { id: 'contagem', nome: 'Contagem', oculta: true, pai: () => typeof cgDoEq === 'function' && cgDoEq() ? 'equipamentos' : 'materiais' }, { id: 'calibracao', nome: 'Calibração', oculta: true, pai: 'equipamentos' }] },
  { id: 'qualidade', nome: 'Qualidade', ic: 'escudo', versao: 'v0.7', abas: [{ id: 'nc', nome: 'Não conformidades' }, { id: 'analise', nome: 'Análise de problemas' }, { id: 'bugs', nome: 'Bugs e sugestões' }] },
  { id: 'relatorios', nome: 'Relatórios', ic: 'graf', versao: 'v0.8', grupo: 'Análise', abas: [] },
  { id: 'adm', nome: 'Administração', ic: 'eng', rodape: true, abas: [{ id: 'empresa', nome: 'Empresa' }, { id: 'aparencia', nome: 'Aparência' }, { id: 'atividade', nome: 'Atividade', get negada() { return !isPrincipal(S.user); } }, { id: 'sobre', nome: 'Sobre' }] }
];
const csArea = id => AREAS.find(a => a.id === id) || AREAS[0];

/* ---------- tema ---------- */
/* v0.4.2: sem escolha feita no app, segue o tema do aparelho */
function csTema() { const t = Store.get('cw-tema'); if (t === 'escuro' || t === 'claro') return t; try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'; } catch { return 'claro'; } }
function csAplicaTema(t) {
  document.documentElement.setAttribute('data-tema', t);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'escuro' ? '#121524' : '#fffefb');
}
function csTrocaTema(t) { Store.set('cw-tema', t); csAplicaTema(t); render(); }
csAplicaTema(csTema());
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!Store.get('cw-tema')) { csAplicaTema(csTema()); render(); } }); } catch {}

/* ---------- rotas ---------- */
function csLeRota() {
  const p = String(location.hash || '').replace(/^#\/?/, '').split(/[/?]/).filter(Boolean);
  /* Tela sem autorização some (pedido do Elias, 09/11): não aparece no menu, nas abas nem na busca, e abrir pelo endereço cai na primeira tela liberada. */
  const livre = x => !S.user || !x.negada;
  let a = AREAS.find(x => x.id === p[0]) ? p[0] : 'inicio', neg = false;
  if (!livre(csArea(a))) { a = 'inicio'; neg = true; }
  const ar = csArea(a);
  let aba = p[1] && ar.abas.some(x => x.id === p[1]) ? p[1] : '';
  if (aba && !livre(ar.abas.find(x => x.id === aba))) { aba = ''; neg = true; }
  if (!aba) { const f = ar.abas.find(livre); aba = f ? f.id : ''; }
  return { area: a, aba: aba, id: neg ? '' : (p[2] ? decodeURIComponent(p[2]) : ''), neg: neg };
}
function csAcertaHash() { if (S.rota.neg) { S.rota.neg = false; try { history.replaceState(null, '', '#/' + S.rota.area + (S.rota.aba ? '/' + S.rota.aba : '')); } catch {} } }
function ir(area, aba) { const h = '#/' + area + (aba ? '/' + aba : ''); if (location.hash !== h) location.hash = h; else render(); }
window.addEventListener('hashchange', () => { S.rota = csLeRota(); csAcertaHash(); csUso(); csFechaMenu(); S.camadas = S.camadas.filter(c => c.nome !== 'menu'); if (S._gvNav) S._gvNav = false; else { S.gv = null; S.gvForm = false; S.fm = null; S._alSel = null; S.camadas = []; const g = $('#gv'); if (g) g.remove(); document.body.classList.remove('gv-aberta'); } render(); try { window.scrollTo(0, 0); } catch {} });

/* ---------- camadas (pedido do Elias, 05/11): cada coisa aberta por cima — gaveta, formulário, lista de escolher, busca, menu do celular —
   é uma camada. Esc, o X e o voltar do celular fecham SÓ a de cima. Formulário com algo preenchido pergunta antes de descartar. ---------- */
S.camadas = []; S._ignPop = 0;
function csCamadaAbre(nome, fechar) { S.camadas.push({ nome: nome, fechar: fechar }); S._camHash = location.hash; try { history.pushState({ cw: S.camadas.length }, ''); } catch {} }
const csTemCamada = nome => S.camadas.some(c => c.nome === nome);
/* a tela fechou a camada sozinha (gravou, escolheu): tira da pilha e devolve o histórico; "depois" roda quando o navegador terminar de voltar */
function csCamadaSaiu(nome, depois) {
  const k = S.camadas.map(c => c.nome).lastIndexOf(nome); if (k < 0) { if (depois) depois(); return; }
  const n = S.camadas.length - k; S.camadas.splice(k); S._ignPop++; S._aposPop = depois || null;
  clearTimeout(S._popT); S._popT = setTimeout(() => { if (S._ignPop > 0) { S._ignPop = 0; const f = S._aposPop; S._aposPop = null; if (f) f(); } }, 400);
  try { history.go(-n); } catch { S._ignPop = 0; const f = S._aposPop; S._aposPop = null; if (f) f(); }
}
function csVolta() { if (csConfirmaAberto()) { csConfirmaFecha(false); return; } if (S.camadas.length) { try { history.back(); } catch { csPop(); } } }
function csPop() {
  const c = S.camadas.pop(); if (!c) return; let ok = true;
  try { ok = c.fechar() !== false; } catch (e) { console.error(e); }
  if (!ok) { S.camadas.push(c); try { history.pushState({ cw: S.camadas.length }, ''); } catch {} }
}
window.addEventListener('popstate', () => {
  if (S._ignPop > 0) { S._ignPop--; clearTimeout(S._popT); const f = S._aposPop; S._aposPop = null; if (f) f(); return; }
  if (location.hash !== S._camHash) return; /* foi troca de tela: quem cuida é o hashchange */
  if (csConfirmaAberto()) { csConfirmaFecha(false); try { history.pushState({ cw: S.camadas.length }, ''); } catch {} return; }
  csPop();
});
/* aviso antes de perder o que foi preenchido */
const csConfirmaAberto = () => !!$('#cf');
function csConfirma(o, aoSim) {
  if ($('#cf')) return; S._cfSim = aoSim;
  const d = document.createElement('div'); d.id = 'cf'; d.className = 'cf-fundo';
  d.innerHTML = '<div class="cf-caixa" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" aria-describedby="cf-x"><span class="cf-ic">' + ic('alerta') + '</span><h2 id="cf-t">' + esc(o.titulo) + '</h2><p id="cf-x">' + esc(o.texto) + '</p><div class="cf-bts"><button type="button" class="bt" data-act="cf-sim">' + esc(o.sim) + '</button><button type="button" class="bt pr" data-act="cf-nao">' + esc(o.nao) + '</button></div></div>';
  document.body.appendChild(d); setTimeout(() => { const b = $('#cf [data-act="cf-nao"]'); if (b) b.focus(); }, 0);
}
function csConfirmaFecha(sim) { const d = $('#cf'); if (d) d.remove(); const f = S._cfSim; S._cfSim = null; if (sim && f) f(); }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act^="cf-"]'); if (t) csConfirmaFecha(t.getAttribute('data-act') === 'cf-sim'); else if (e.target && e.target.id === 'cf') csConfirmaFecha(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && csConfirmaAberto()) { e.preventDefault(); e.stopImmediatePropagation(); csConfirmaFecha(false); } }, true);

/* ---------- "onde você estava" e "mais usadas" (como no EFClaudian v2.102.59; só neste aparelho, por pessoa) ---------- */
function csUsoLer() { try { const o = JSON.parse(Store.get('cw-uso-' + ((S.user && S.user.id) || '')) || '{}'); return { n: o.n || {}, r: Array.isArray(o.r) ? o.r : [] }; } catch { return { n: {}, r: [] }; } }
function csUso() {
  if (!S.user) return; const k = S.rota.area + (S.rota.aba ? '/' + S.rota.aba : '');
  if (S._usoUlt === S.user.id + k) return; S._usoUlt = S.user.id + k;
  const o = csUsoLer(); o.n[k] = (o.n[k] || 0) + 1; o.r = [k].concat(o.r.filter(x => x !== k)).slice(0, 8);
  try { Store.set('cw-uso-' + S.user.id, JSON.stringify(o)); } catch {}
}
function csNomeRota(k) { const p = String(k).split('/'), a = csArea(p[0]), t = a.abas.find(x => x.id === p[1]); return t ? t.nome : a.nome; }

/* ---------- pedaços da tela ---------- */
function csMarca() {
  const e = S.empresa || {}, logo = imgSrc(e.logo);
  return '<div class="cs-marca"><span class="cs-logo">' + (logo ? '<img src="' + logo + '" alt="">' : ic('broto')) + '</span><span class="cs-nm"><b>' + APP_NOME + '</b><span>família ' + APP_FAMILIA + '</span></span></div>';
}
function csEmpresaBloco() {
  const e = S.empresa || {}, un = (e.unidades || []), u = Store.get('cw-unidade') || (un[0] || '');
  return '<button type="button" class="cs-emp" data-act="cs-emp" title="Empresa e unidade"><span><b>' + esc(e.nome || 'Sua empresa') + '</b><small>' + esc(un.length ? u : 'Configure em Administração') + '</small></span>' + ic('seta') + '</button>';
}
function csLado() {
  const at = S.rota.area; let h = '<aside class="cs-lado" id="cs-lado" aria-label="Menu">' + csMarca() + csEmpresaBloco() + '<nav class="cs-nav">';
  let grupo = '';
  AREAS.filter(a => !a.rodape && !a.negada).forEach(a => {
    if (a.grupo && a.grupo !== grupo) { grupo = a.grupo; h += '<div class="cs-gh">' + esc(grupo) + '</div>'; }
    h += '<a class="cs-it' + (a.id === at ? ' on' : '') + '" href="#/' + a.id + '"' + (a.id === at ? ' aria-current="page"' : '') + '>' + ic(a.ic) + '<span>' + esc(a.nome) + '</span></a>';
  });
  const adm = csArea('adm'), u = S.user || {};
  h += '</nav><div class="cs-pe"><a class="cs-it' + (at === 'adm' ? ' on' : '') + '" href="#/adm">' + ic(adm.ic) + '<span>' + adm.nome + '</span></a>' +
    '<div class="cs-us"><span class="cs-av">' + esc(iniciais(u.nome)) + '</span><span class="cs-ust"><b>' + esc(u.nome || '') + '</b><small>' + esc(perfilLabel(u)) + '</small></span><button type="button" class="bt ic-so" data-act="cs-sair" title="Sair" aria-label="Sair">' + ic('sair') + '</button></div>' +
    '<div class="cs-cw"><span>' + APP_APELIDO + '</span><span>v' + VERSAO + (DEMO ? ' · demonstração' : '') + '</span></div></div></aside>';
  return h;
}
function csTopo() {
  const t = csTema(), con = DEMO ? '<span class="cs-sync">Demonstração</span>' : S.conexao === false ? '<span class="cs-sync off"><i></i>Sem internet · guardando no aparelho</span>' : '<span class="cs-sync"><i></i>Sincronizado</span>';
  return '<header class="cs-topo"><button type="button" class="bt ic-so cs-so-cel" data-act="cs-menu" aria-label="Abrir menu">' + ic('menu') + '</button>' +
    '<button type="button" class="cs-busca" data-act="cs-busca" aria-label="Buscar (tecla /)">' + ic('lupa') + '<span>Buscar documento, material, coleta…</span><kbd>/</kbd></button><span class="cs-sp"></span>' + con +
    '<button type="button" class="bt ic-so" data-act="cs-tema" aria-label="' + (t === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro') + '" title="' + (t === 'escuro' ? 'Tema claro' : 'Tema escuro') + '">' + ic(t === 'escuro' ? 'sol' : 'lua') + '</button>' +
    '<button type="button" class="bt ic-so cs-sino" data-act="cs-sino" aria-label="Avisos" title="Avisos">' + ic('sino') + (function () { const n = typeof snConta === 'function' ? snConta() : 0; return '<span class="cs-bdg" id="sn-n"' + (n ? '' : ' hidden') + '>' + (n > 99 ? '99+' : n) + '</span>'; })() + '</button></header>';
}
/* cabeçalho de página padrão: caminho, título com traço, situação (meta) e ações; abas sublinhadas embaixo */
function cabecalho(o) {
  const ar = csArea(S.rota.area);
  const cam = (o.caminho || [ar.nome].concat(o.abaNome ? [o.abaNome] : [])).map((x, k, l) => k < l.length - 1 ? '<b>' + esc(x) + '</b>' : esc(x)).join(' / ');
  let h = '<div class="cs-ph"><div class="cs-bc">' + cam + '</div><div class="cs-phr"><div class="cs-pht">' + (o.aoLado ? '<div class="cs-ht"><h1>' + esc(o.titulo) + '</h1>' + o.aoLado + '</div>' : '<h1>' + esc(o.titulo) + '</h1>') + (o.meta && o.meta.length ? '<div class="cs-meta">' + o.meta.join('') + '</div>' : '') + '</div>' + (o.acoes ? '<div class="cs-acts">' + o.acoes + '</div>' : '') + '</div></div>';
  const atual = ar.abas.find(t => t.id === S.rota.aba), marca = atual && atual.oculta ? (typeof atual.pai === 'function' ? atual.pai() : atual.pai) : S.rota.aba;
  if (ar.abas.length > 1 && !o.semAbas) h += '<nav class="cs-abas" aria-label="Abas de ' + esc(ar.nome) + '">' + ar.abas.filter(t => !t.oculta && !t.negada).map(t => '<a href="#/' + ar.id + '/' + t.id + '"' + (t.id === marca ? ' class="on"' + (t.id === S.rota.aba ? ' aria-current="page"' : '') : '') + '>' + esc(t.nome) + '</a>').join('') + '</nav>';
  return h;
}
const metaPl = (txt, tipo, ico) => '<span class="cs-pl' + (tipo ? ' ' + tipo : '') + '">' + (ico ? ic(ico) : '') + esc(txt) + '</span>';
function csBaixo() {
  const at = S.rota.area, it = [['inicio', 'Início', 'casa'], ['coletas', 'Coletas', 'frasco'], ['documentos', 'Documentos', 'doc'], ['almox', 'Almox.', 'caixa']];
  return '<nav class="cs-baixo" aria-label="Atalhos">' + it.map(x => '<a href="#/' + x[0] + '"' + (x[0] === at ? ' class="on" aria-current="page"' : '') + '>' + ic(x[2]) + '<span>' + x[1] + '</span></a>').join('') +
    '<button type="button" data-act="cs-menu">' + ic('menu') + '<span>Mais</span></button></nav>';
}

/* ---------- desenhar ---------- */
function render() {
  const app = $('#app'); if (!app) return;
  if (!S.pronto) { app.innerHTML = '<div class="cs-carregando">' + ic('broto') + '<span>Abrindo o ' + APP_NOME + '…</span></div>'; return; }
  if (!S.user) { app.innerHTML = enTela(); try { enDepois(); } catch (e) { console.error(e); } return; }
  const ar = csArea(S.rota.area), f = TELAS[ar.id];
  let corpo = '';
  try { corpo = f ? f(S.rota.aba) : arEmBreve(ar); } catch (e) { console.error(e); corpo = '<div class="pn"><div class="vazio"><b>Esta tela deu erro ao abrir.</b><span>' + esc(e && e.message || e) + '</span></div></div>'; }
  const foco = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-foco'), sel = foco ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  app.innerHTML = '<div class="cs-app">' + csLado() + '<div class="cs-fundo" data-act="cs-fecha"></div><main class="cs-main" id="conteudo">' + csTopo() + '<div class="cs-ct">' + corpo + '</div><footer class="cs-rod">' + APP_APELIDO + ' · ' + esc((S.empresa && S.empresa.nome) || 'Sua empresa') + '</footer></main>' + csBaixo() + '</div>';
  const dep = TELAS[ar.id + ':depois']; if (dep) { try { dep(S.rota.aba); } catch (e) { console.error(e); } }
  try { gvDesenha(); } catch (e) { console.error(e); }
  if (foco) { const el = document.querySelector('[data-foco="' + foco.replace(/"/g, '') + '"]'); if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(sel[0], sel[1]); } catch {} } } /* quem estava digitando continua no mesmo campo */
}
function csFechaMenu() { const a = $('.cs-app'); if (a) a.classList.remove('menu-aberto'); }

/* ---------- cliques da casca ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'cs-tema') csTrocaTema(csTema() === 'escuro' ? 'claro' : 'escuro');
  else if (a === 'cs-menu') { const x = $('.cs-app'); if (!x) return; if (x.classList.contains('menu-aberto')) csVolta(); else { x.classList.add('menu-aberto'); csCamadaAbre('menu', csFechaMenu); } }
  else if (a === 'cs-fecha') csVolta();
  else if (a === 'cs-sair') csSair();
  else if (a === 'cs-emp') ir('adm', 'empresa');
  else if (a === 'cs-sino') snAbrir();
});

/* ---------- sessão ---------- */
async function csSair() {
  try { await Data.auth.signOut(); } catch (e) { try { await Data.auth.forcarSaida(); } catch {} }
  S.user = null; S.gv = null; S.gvForm = false; S.fm = null; S.camadas = []; S.users = []; S.notifs = []; S.aprov = []; { const g = $('#gv'); if (g) g.remove(); } S._desl.forEach(f => { try { f(); } catch {} }); S._desl = []; location.hash = '#/inicio'; render();
}
function csOuve(col, cb, o) { const off = Data.col(col).watch(cb, o); S._desl.push(off); return off; }
/* v0.4.9: Firestore desligado (cache do aparelho quebrado) — repara sozinho uma vez por sessão (até 2 tentativas) */
const csTerminado = e => /already been terminated|client has been terminated|IndexedDB|INTERNAL ASSERTION/i.test(String((e && (e.message || e.code)) || e || ''));
function csPodeReparar() { try { return Number(sessionStorage.getItem('cw-reparou') || 0) < 2; } catch { return false; } }
window.addEventListener('unhandledrejection', ev => { if (!DEMO && csTerminado(ev.reason) && csPodeReparar()) { aviso('Consertando o cache do aparelho…'); Data.reparaCache(); } });
async function csCarregaUsuario(uidAtual) {
  S._desl.forEach(f => { try { f(); } catch {} }); S._desl = [];
  if (!uidAtual) { S.user = null; S.pronto = true; render(); return; }
  let u = null, erro = null; try { u = await Data.col('sv2_users').get(uidAtual); } catch (e) { console.error(e); erro = e; }
  if (erro && csTerminado(erro) && csPodeReparar()) { S.pronto = false; S._erroEntrar = ''; render(); Data.reparaCache(); return; }
  if (!u || u.ativo === false || u.bloqueado) {
    try { await Data.auth.signOut(); } catch {}
    /* v0.4.1: diferencia "não achou o perfil" de "não conseguiu ler" (antes, um erro de leitura aparecia como "sem perfil") */
    S.user = null; S.pronto = true; S._erroEntrar = erro ? (csTerminado(erro) ? 'A senha está certa, mas o cache deste aparelho travou. Feche todas as abas do EFCwork e do EFClaudian e abra de novo; se continuar, avise o administrador.' : 'A senha está certa, mas não deu para ler o seu perfil (' + (/permission/i.test((erro && (erro.code || erro.message)) || '') ? 'o Firebase recusou a leitura: confira as regras ou o App Check' : svErro(erro)) + '). Tente de novo; se continuar, avise o administrador.')
      : !u ? 'A senha está certa, mas este acesso não tem perfil no app. Confira se digitou o seu login ou o e-mail completo (com @), igual ao do EFClaudian.' : 'Este acesso está bloqueado. Fale com o administrador.'; render(); return;
  }
  S.user = Object.assign({ id: uidAtual }, u); S.pronto = true; S._erroEntrar = ''; try { sessionStorage.removeItem('cw-reparou'); } catch {}
  csOuve('sv2_cfg', l => { const e = l.find(x => x.id === 'empresa'); S.empresa = e || null; S.cfgAlm = l.find(x => x.id === 'almox') || null; S.cfgCol = l.find(x => x.id === 'coletas') || null; S.cfgEntrar = l.find(x => x.id === 'entrar') || null; enGuardaCache(); render(); });
  csOuve('sv2_tarefas', l => { S.tarefas = l; if (S.rota.area === 'inicio') render(); });
  CS_CARGAS.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  S.rota = csLeRota(); csAcertaHash(); csUso(); render();
}
async function csIniciar() {
  S.rota = csLeRota();
  try { await Data.init(); } catch (e) { console.error(e); S.pronto = true; S._erroEntrar = 'Não foi possível carregar o Firebase. Confira a internet e abra de novo.'; render(); return; }
  try { S._setup = await Data.setupDone(); } catch (e) { S._setup = Store.get('sv2-setup') === '1'; }
  try { S._descon = Data.conexao(v => { S.conexao = v; }); } catch {}
  Data.auth.onChange(id => { csCarregaUsuario(id); });
  if (DEMO && !Store.get('sv2demo_session')) { S.pronto = true; render(); }
}
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js').catch(() => {}); }
