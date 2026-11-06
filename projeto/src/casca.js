/* EFCwork · casca.js — estado, rotas por endereço (#/area/aba), menu lateral, barra de cima, cabeçalho de página e temas.
   Prefixo dos nomes deste módulo: cs. Telas de cada área se registram em TELAS[area] (ver areas.js, inicio.js, adm.js). */
const S = { user: null, empresa: null, rota: { area: 'inicio', aba: '' }, pronto: false, conexao: null, tarefas: [], _desl: [] };
const TELAS = {};
const CS_CARGAS = []; /* funções que cada área registra para começar a ouvir os dados dela depois do login */

/* áreas do EFCwork (estrutura aprovada no Estudo do Rework, 05/11/2026). "versao" = quando a área é refeita aqui */
const AREAS = [
  { id: 'inicio', nome: 'Início', ic: 'casa', abas: [] },
  { id: 'coletas', nome: 'Coletas', ic: 'frasco', versao: 'v0.4', abas: [{ id: 'amostras', nome: 'Amostras' }, { id: 'programacao', nome: 'Programação' }, { id: 'envio', nome: 'Envio' }, { id: 'cadastros', nome: 'Cadastros' }] },
  { id: 'rateios', nome: 'Rateios', ic: 'pizza', versao: 'v0.7', abas: [] },
  { id: 'inspecoes', nome: 'Inspeções', ic: 'lista', versao: 'v0.6', abas: [{ id: 'cloro', nome: 'Cloro' }, { id: 'apontamentos', nome: 'Apontamentos' }, { id: 'auditoria', nome: 'Auditoria interna' }] },
  { id: 'documentos', nome: 'Documentos', ic: 'doc', versao: 'v0.5', abas: [{ id: 'documentos', nome: 'Documentos' }, { id: 'caixas', nome: 'Caixas d’água' }, { id: 'historico', nome: 'Histórico' }] },
  { id: 'almox', nome: 'Almoxarifado', ic: 'caixa', versao: 'v0.3', parcial: 'consulta pronta aqui; lançamentos chegam na v0.3', abas: [{ id: 'painel', nome: 'Painel' }, { id: 'materiais', nome: 'Materiais' }, { id: 'movimentacoes', nome: 'Movimentações' }, { id: 'solicitacoes', nome: 'Solicitações' }, { id: 'equipamentos', nome: 'Equipamentos' }] },
  { id: 'qualidade', nome: 'Qualidade', ic: 'escudo', versao: 'v0.7', abas: [{ id: 'nc', nome: 'Não conformidades' }, { id: 'analise', nome: 'Análise de problemas' }, { id: 'bugs', nome: 'Bugs e sugestões' }] },
  { id: 'relatorios', nome: 'Relatórios', ic: 'graf', versao: 'v0.8', grupo: 'Análise', abas: [] },
  { id: 'adm', nome: 'Administração', ic: 'eng', rodape: true, abas: [{ id: 'empresa', nome: 'Empresa' }, { id: 'aparencia', nome: 'Aparência' }, { id: 'sobre', nome: 'Sobre' }] }
];
const csArea = id => AREAS.find(a => a.id === id) || AREAS[0];

/* ---------- tema ---------- */
function csTema() { return Store.get('cw-tema') === 'escuro' ? 'escuro' : 'claro'; }
function csAplicaTema(t) {
  document.documentElement.setAttribute('data-tema', t);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'escuro' ? '#121524' : '#fffefb');
}
function csTrocaTema(t) { Store.set('cw-tema', t); csAplicaTema(t); render(); }
csAplicaTema(csTema());

/* ---------- rotas ---------- */
function csLeRota() {
  const p = String(location.hash || '').replace(/^#\/?/, '').split(/[/?]/).filter(Boolean);
  let a = AREAS.find(x => x.id === p[0]) ? p[0] : 'inicio';
  const ar = csArea(a);
  let aba = p[1] && ar.abas.some(x => x.id === p[1]) ? p[1] : (ar.abas[0] ? ar.abas[0].id : '');
  return { area: a, aba: aba };
}
function ir(area, aba) { const h = '#/' + area + (aba ? '/' + aba : ''); if (location.hash !== h) location.hash = h; else render(); }
window.addEventListener('hashchange', () => { S.rota = csLeRota(); csUso(); csFechaMenu(); if (S._gvNav) S._gvNav = false; else { S.gv = null; S._alSel = null; const g = $('#gv'); if (g) g.remove(); document.body.classList.remove('gv-aberta'); } render(); try { window.scrollTo(0, 0); } catch {} });

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
  AREAS.filter(a => !a.rodape).forEach(a => {
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
    '<button type="button" class="bt ic-so" data-act="cs-sino" aria-label="Avisos" title="Avisos">' + ic('sino') + '</button></header>';
}
/* cabeçalho de página padrão: caminho, título com traço, situação (meta) e ações; abas sublinhadas embaixo */
function cabecalho(o) {
  const ar = csArea(S.rota.area);
  const cam = (o.caminho || [ar.nome].concat(o.abaNome ? [o.abaNome] : [])).map((x, k, l) => k < l.length - 1 ? '<b>' + esc(x) + '</b>' : esc(x)).join(' / ');
  let h = '<div class="cs-ph"><div class="cs-bc">' + cam + '</div><div class="cs-phr"><div class="cs-pht"><h1>' + esc(o.titulo) + '</h1>' + (o.meta && o.meta.length ? '<div class="cs-meta">' + o.meta.join('') + '</div>' : '') + '</div>' + (o.acoes ? '<div class="cs-acts">' + o.acoes + '</div>' : '') + '</div></div>';
  if (ar.abas.length > 1 && !o.semAbas) h += '<nav class="cs-abas" aria-label="Abas de ' + esc(ar.nome) + '">' + ar.abas.map(t => '<a href="#/' + ar.id + '/' + t.id + '"' + (t.id === S.rota.aba ? ' class="on" aria-current="page"' : '') + '>' + esc(t.nome) + '</a>').join('') + '</nav>';
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
  app.innerHTML = '<div class="cs-app">' + csLado() + '<div class="cs-fundo" data-act="cs-fecha"></div><main class="cs-main" id="conteudo">' + csTopo() + '<div class="cs-ct">' + corpo + '</div><footer class="cs-rod">' + APP_APELIDO + ' · ' + esc((S.empresa && S.empresa.nome) || 'Sua empresa') + '</footer></main>' + csBaixo() + '</div>';
  const dep = TELAS[ar.id + ':depois']; if (dep) { try { dep(S.rota.aba); } catch (e) { console.error(e); } }
  try { gvDesenha(); } catch (e) { console.error(e); }
}
function csFechaMenu() { const a = $('.cs-app'); if (a) a.classList.remove('menu-aberto'); }

/* ---------- cliques da casca ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'cs-tema') csTrocaTema(csTema() === 'escuro' ? 'claro' : 'escuro');
  else if (a === 'cs-menu') { const x = $('.cs-app'); if (x) x.classList.toggle('menu-aberto'); }
  else if (a === 'cs-fecha') csFechaMenu();
  else if (a === 'cs-sair') csSair();
  else if (a === 'cs-emp') ir('adm', 'empresa');
  else if (a === 'cs-sino') aviso('Os avisos do sino chegam na v0.3.');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') csFechaMenu(); });

/* ---------- sessão ---------- */
async function csSair() {
  try { await Data.auth.signOut(); } catch (e) { try { await Data.auth.forcarSaida(); } catch {} }
  S.user = null; S.gv = null; { const g = $('#gv'); if (g) g.remove(); } S._desl.forEach(f => { try { f(); } catch {} }); S._desl = []; location.hash = '#/inicio'; render();
}
function csOuve(col, cb, o) { const off = Data.col(col).watch(cb, o); S._desl.push(off); return off; }
async function csCarregaUsuario(uidAtual) {
  S._desl.forEach(f => { try { f(); } catch {} }); S._desl = [];
  if (!uidAtual) { S.user = null; S.pronto = true; render(); return; }
  let u = null; try { u = await Data.col('sv2_users').get(uidAtual); } catch (e) { console.error(e); }
  if (!u || u.ativo === false || u.bloqueado) {
    try { await Data.auth.signOut(); } catch {}
    S.user = null; S.pronto = true; S._erroEntrar = !u ? 'Este acesso não tem perfil cadastrado. Peça ao administrador.' : 'Este acesso está bloqueado. Fale com o administrador.'; render(); return;
  }
  S.user = Object.assign({ id: uidAtual }, u); S.pronto = true; S._erroEntrar = '';
  csOuve('sv2_cfg', l => { const e = l.find(x => x.id === 'empresa'); S.empresa = e || null; render(); });
  csOuve('sv2_tarefas', l => { S.tarefas = l; if (S.rota.area === 'inicio') render(); });
  CS_CARGAS.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  csUso(); render();
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
