/* EFCwork · casca.js — estado, rotas por endereço (#/area/aba), menu lateral, barra de cima, cabeçalho de página e temas.
   Prefixo dos nomes deste módulo: cs. Telas de cada área se registram em TELAS[area] (ver areas.js, inicio.js, adm.js). */
const S = { user: null, empresa: null, rota: { area: 'inicio', aba: '' }, pronto: false, conexao: null, tarefas: [], _desl: [] };
const TELAS = {};
const CS_CARGAS = []; /* funções que cada área registra para começar a ouvir os dados dela depois do login */

/* áreas do EFCwork (estrutura aprovada no Estudo do Rework, 05/11/2026). "versao" = quando a área é refeita aqui */
const AREAS = [
  { id: 'inicio', nome: 'Início', ic: 'casa', abas: [] },
  { id: 'coletas', nome: 'Coletas', ic: 'frasco', versao: 'v0.4', parcial: 'amostras, água, programação, envio e pontos de água prontos aqui; lançar coleta nova, fichas, etiquetas e os outros cadastros seguem no EFClaudian', abas: [{ id: 'amostras', nome: 'Amostras' }, { id: 'agua', nome: 'Água' }, { id: 'programacao', nome: 'Programação' }, { id: 'envio', nome: 'Envio' }, { id: 'cadastros', nome: 'Cadastros' }, { id: 'plano', nome: 'Plano de coleta', oculta: true, pai: 'programacao' }] },
  { id: 'rateios', nome: 'Rateios', ic: 'pizza', versao: 'v0.7', abas: [] },
  { id: 'inspecoes', nome: 'Inspeções', ic: 'lista', versao: 'v0.6', parcial: 'cloro, apontamentos e auditoria interna prontos aqui', abas: [{ id: 'cloro', nome: 'Cloro' }, { id: 'apontamentos', nome: 'Apontamentos' }, { id: 'auditoria', nome: 'Auditoria interna' }] },
  { id: 'documentos', nome: 'Documentos', ic: 'doc', versao: 'v0.5', parcial: 'documentos, caixas d’água, histórico e impressos prontos aqui; o relatório de documentos segue no EFClaudian', abas: [{ id: 'documentos', nome: 'Documentos' }, { id: 'caixas', nome: 'Caixas d’água' }, { id: 'historico', nome: 'Histórico' }, { id: 'impressos', nome: 'Impressos' }] },
  { id: 'almox', nome: 'Almoxarifado', ic: 'caixa', versao: 'v0.3', parcial: 'consultar e lançar prontos aqui; cadastro de material, kits, fotos e inventário seguem no EFClaudian', abas: [{ id: 'painel', nome: 'Painel' }, { id: 'materiais', nome: 'Materiais' }, { id: 'movimentacoes', nome: 'Movimentações' }, { id: 'solicitacoes', nome: 'Solicitações' }, { id: 'equipamentos', nome: 'Equipamentos' }, { id: 'contagem', nome: 'Contagem', oculta: true, pai: () => typeof cgDoEq === 'function' && cgDoEq() ? 'equipamentos' : 'materiais' }, { id: 'calibracao', nome: 'Calibração', oculta: true, pai: 'equipamentos' }] },
  { id: 'qualidade', nome: 'Qualidade', ic: 'escudo', versao: 'v0.7', parcial: 'Análise de problemas pronta aqui; Não conformidades e Bugs seguem no EFClaudian', abas: [{ id: 'nc', nome: 'Não conformidades' }, { id: 'analise', nome: 'Análise de problemas' }, { id: 'bugs', nome: 'Bugs e sugestões' }] },
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
window.addEventListener('hashchange', () => { S.rota = csLeRota(); csAcertaHash(); csUso(); csFechaMenu(); S._menuFlut = false; S.camadas = S.camadas.filter(c => c.nome !== 'menu' && c.nome !== 'menuflut'); if (S._gvNav) S._gvNav = false; else { S.gv = null; S.gvForm = false; S.fm = null; S._alSel = null; S.camadas = []; const g = $('#gv'); if (g) g.remove(); document.body.classList.remove('gv-aberta'); } render(); try { window.scrollTo(0, 0); } catch {} });

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
/* ---------- menu lateral retrátil (v0.5.3, Nº 48; aprovado 10/11: 3 estados + OPÇÃO 4 "botão que alterna") ----------
   Só no computador (≥ 900 px). Aberto → Só ícones → Recolhido, um toque no botão do topo do menu (os 3 pontinhos mostram onde está).
   Recolhido: sobra o puxador dourado no meio da borda esquerda; passar o mouse ele cresce, clicar abre o menu por cima da tela.
   Com o menu aberto por cima, o mesmo botão fixa o menu aberto de novo. A escolha fica gravada neste aparelho (cw-menu).
   As animações só rodam quando algo muda (nunca a cada desenho da tela) e somem com "reduzir movimento" do sistema. */
const CS_MENU = ['aberto', 'icones', 'recolhido'];
function csMenuEst() { const v = Store.get('cw-menu'); return CS_MENU.includes(v) ? v : 'aberto'; }
function csPuxForma() { const v = Store.get('cw-pux'); return ['pa', 'pb', 'pc'].includes(v) ? v : 'pa'; }
function csMenuClasse() { const m = csMenuEst(); return m === 'icones' ? ' m-ic' : m === 'recolhido' ? ' m-rc' + (S._menuFlut ? ' flut' : '') : ''; }
function csMenuAltDica() { const m = csMenuEst(); return m === 'aberto' ? 'Mostrar só os ícones' : m === 'icones' ? 'Recolher o menu' : 'Fixar o menu aberto'; }
function csMenuAlt() {
  const m = csMenuEst(), k = CS_MENU.indexOf(m), d = csMenuAltDica();
  return '<div class="cs-alt"><span class="cs-pts" aria-hidden="true">' + CS_MENU.map((x, i) => '<i' + (i === k ? ' class="on"' : '') + '></i>').join('') + '</span>' +
    '<button type="button" class="bt ic-so cs-altb" data-act="cs-alterna" title="' + esc(d) + '" aria-label="' + esc(d) + '">' + ic('recolhe') + '</button></div>';
}
function csPux() { return '<button type="button" class="cs-pux ' + csPuxForma() + (S._puxEntra ? ' entra' : '') + '" data-act="cs-pux" title="Abrir o menu" aria-label="Abrir o menu"><span class="cs-pux-g" aria-hidden="true"></span>' + ic('seta') + '</button>'; }
function csMenuAplica(novo) {
  const app = $('.cs-app'), ant = csMenuEst(); Store.set('cw-menu', novo);
  if (!app) { render(); return; }
  if (S._menuFlut) { S._menuFlut = false; S.camadas = S.camadas.filter(c => c.nome !== 'menuflut'); }
  app.classList.remove('m-ic', 'm-rc', 'flut', 'abrindo');
  if (novo === 'icones') app.classList.add('m-ic'); else if (novo === 'recolhido') app.classList.add('m-rc');
  const alt = app.querySelector('.cs-alt'); if (alt) alt.outerHTML = csMenuAlt(); /* sem redesenhar a tela, para a transição correr */
  const px = app.querySelector('.cs-pux'); if (px && novo === 'recolhido') { px.classList.remove('entra'); void px.offsetWidth; px.classList.add('entra'); }
  if (ant === 'recolhido' && novo !== 'recolhido') { app.classList.add('fixando'); }
  setTimeout(() => { app.classList.remove('fixando'); try { tbAlinhaTot(); } catch {} }, 450);
}
function csMenuAlterna() {
  const m = csMenuEst();
  if (m === 'recolhido') { if (S._menuFlut && csTemCamada('menuflut')) { const app = $('.cs-app'); if (app) app.classList.add('fixando'); csCamadaSaiu('menuflut', () => csMenuAplica('aberto')); } else csMenuAplica('aberto'); return; }
  csMenuAplica(m === 'aberto' ? 'icones' : 'recolhido');
}
function csMenuFlutAbre() {
  const app = $('.cs-app'); if (!app || S._menuFlut) return;
  S._menuFlut = true; app.classList.add('flut', 'abrindo'); setTimeout(() => app.classList.remove('abrindo'), 700);
  csCamadaAbre('menuflut', csMenuFlutFecha);
}
function csMenuFlutFecha() {
  S._menuFlut = false; const app = $('.cs-app'); if (!app) return;
  app.classList.remove('flut', 'abrindo');
  const px = app.querySelector('.cs-pux'); if (px) { px.classList.remove('entra'); void px.offsetWidth; px.classList.add('entra'); }
}
function csLado() {
  const at = S.rota.area; let h = '<aside class="cs-lado" id="cs-lado" aria-label="Menu"><div class="cs-topl">' + csMarca() + csMenuAlt() + '</div>' + csEmpresaBloco() + '<nav class="cs-nav">';
  let grupo = '', n = 0;
  AREAS.filter(a => !a.rodape && !a.negada).forEach(a => {
    if (a.grupo && a.grupo !== grupo) { grupo = a.grupo; h += '<div class="cs-gh">' + esc(grupo) + '</div>'; }
    h += '<a class="cs-it' + (a.id === at ? ' on' : '') + '" style="--i:' + (n++) + '" href="#/' + a.id + '"' + (a.id === at ? ' aria-current="page"' : '') + '>' + ic(a.ic) + '<span>' + esc(a.nome) + '</span></a>';
  });
  h += csAppsFamilia(n);
  const adm = csArea('adm'), u = S.user || {};
  h += '</nav><div class="cs-pe"><a class="cs-it' + (at === 'adm' ? ' on' : '') + '" href="#/adm">' + ic(adm.ic) + '<span>' + adm.nome + '</span></a>' +
    '<div class="cs-us"><span class="cs-av">' + esc(iniciais(u.nome)) + '</span><span class="cs-ust"><b>' + esc(u.nome || '') + '</b><small>' + esc(perfilLabel(u)) + '</small></span><button type="button" class="bt ic-so" data-act="cs-sair" title="Sair" aria-label="Sair">' + ic('sair') + '</button></div>' +
    '<div class="cs-cw"><span>' + APP_APELIDO + '</span><span>v' + VERSAO + (DEMO ? ' · demonstração' : '') + '</span></div></div></aside>';
  return h;
}
/* v0.6.9 · Apps da família no menu (plano de integração v2, ITEM 3): Vértice Docs e Sabiá, só para Administrador e Líder (como no EFClaudian).
   Abrem fora, numa aba nova; o ícone de cada app vai embutido (48 px) para aparecer mesmo sem internet. */
const CS_APPS = [
  { id: 'docs', nome: 'Vértice Docs', url: 'https://eliasgrigori.github.io/EFCdocs/', ic: 'data:image/png;base64,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' },
  { id: 'sabia', nome: 'Sabiá', url: 'https://eliasgrigori.github.io/EFC-Sabi--Quiz/', ic: 'data:image/png;base64,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' }];
function csAppsFamilia(n) {
  if (!S.user || !isSup(S.user)) return '';
  return '<div class="cs-gh">Apps da família</div>' + CS_APPS.map((a, k) => '<a class="cs-it cs-app-l" style="--i:' + (n + k) + '" href="' + esc(a.url) + '" target="_blank" rel="noopener" data-app="' + a.id + '" title="Abrir o ' + esc(a.nome) + ' numa aba nova"><img src="' + esc(a.ic) + '" alt="" width="20" height="20"><span>' + esc(a.nome) + '</span>' + ic('externo', 'cs-app-x') + '</a>').join('');
}
/* gaveta da nuvem (Nº 46): situação, hora da última leitura e o botão que força a releitura do servidor */
function csNuvemGaveta() {
  const off = S.conexao === false, r = S._nuvemRes, ocu = !!S._nuvemOcupada, hora = S._nuvemEm ? new Date(S._nuvemEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const c = '<div class="nv"><div class="nv-st' + (off ? ' off' : '') + '">' + ic('nuvem') + '<span><b>' + (off ? 'Sem internet' : 'Sincronizado') + '</b><small>' + (off ? 'O que você lançar fica guardado no aparelho e sobe quando a internet voltar.' : 'O app recebe as mudanças da nuvem sozinho.') + '</small></span></div>' +
    '<p class="nv-t">Se uma tela parecer desatualizada (por exemplo, outra pessoa lançou e ainda não apareceu aqui), toque em <b>Atualizar agora</b>: o app lê tudo de novo direto do servidor.</p>' +
    (hora ? '<p class="nv-u">Última leitura da nuvem: ' + hora + '</p>' : '') +
    (r ? '<p class="nv-r ' + (r.ok ? 'ok' : 'er') + '" role="status">' + ic(r.ok ? 'ok' : 'excl') + '<span>' + (r.ok ? 'Atualizado às ' + esc(r.hora) + ' · ' + r.n + ' listas lidas do servidor.' : 'Não deu para atualizar' + (r.falhas && r.n ? ' (' + r.falhas + ' de ' + r.n + ' listas sem resposta)' : '') + '. Confira a internet e tente de novo.') + '</span></p>' : '') + '</div>';
  return { ico: 'nuvem', sub: 'Mesma nuvem do EFClaudian', titulo: 'Nuvem', corpo: c,
    rodape: '<button type="button" class="bt pr" data-act="cs-nuvem-atu"' + (ocu ? ' disabled' : '') + '>' + ic('gira') + (ocu ? 'Lendo da nuvem…' : 'Atualizar agora') + '</button>' };
}
async function csNuvemAtualiza() {
  if (S._nuvemOcupada) return; S._nuvemOcupada = true; if (S.gv === csNuvemGaveta) gvDesenha(true);
  let r; try { r = await Data.atualizar(); } catch (e) { r = { ok: false, n: 0, falhas: 1 }; }
  S._nuvemOcupada = false; const h = new Date(); r.hora = h.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); S._nuvemRes = r; if (r.ok) S._nuvemEm = h.toISOString();
  if (S.gv === csNuvemGaveta) gvDesenha(true);
}
function csTopo() {
  /* v0.4.15 (Nº 46): o aviso da nuvem virou botão; abre a gaveta com "Atualizar agora". No celular fica só o ícone (cor = situação) */
  const off = S.conexao === false, t = csTema(), con = DEMO ? '<span class="cs-sync">Demonstração</span>' : '<button type="button" class="cs-sync' + (off ? ' off' : '') + '" data-act="cs-nuvem" aria-label="Nuvem: ' + (off ? 'sem internet' : 'sincronizado') + '. Abrir" title="Nuvem · atualizar agora">' + ic('nuvem') + '<i></i><span>' + (off ? 'Sem internet · guardando no aparelho' : 'Sincronizado') + '</span></button>';
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
  app.innerHTML = '<div class="cs-app' + csMenuClasse() + '">' + csLado() + csPux() + '<div class="cs-fundo" data-act="cs-fecha"></div><main class="cs-main" id="conteudo">' + csTopo() + '<div class="cs-ct">' + corpo + '</div><footer class="cs-rod">' + APP_APELIDO + ' · ' + esc((S.empresa && S.empresa.nome) || 'Sua empresa') + '</footer></main>' + csBaixo() + '</div>';
  const dep = TELAS[ar.id + ':depois']; if (dep) { try { dep(S.rota.aba); } catch (e) { console.error(e); } }
  S._puxEntra = false;
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
  else if (a === 'cs-alterna') csMenuAlterna();
  else if (a === 'cs-pux') csMenuFlutAbre();
  else if (a === 'cs-sair') csSair();
  else if (a === 'cs-emp') ir('adm', 'empresa');
  else if (a === 'cs-sino') snAbrir();
  else if (a === 'cs-nuvem') { S._nuvemRes = null; gvAbrir(csNuvemGaveta); }
  else if (a === 'cs-nuvem-atu') csNuvemAtualiza();
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
  csOuve('sv2_cfg', l => { const e = l.find(x => x.id === 'empresa'); S.empresa = e || null; S.cfgAlm = l.find(x => x.id === 'almox') || null; S.cfgCol = l.find(x => x.id === 'coletas') || null; S.cfgAgua = l.find(x => x.id === 'agua') || null; S.cfgEntrar = l.find(x => x.id === 'entrar') || null; S.cfgAp = l.find(x => x.id === 'apont') || null; enGuardaCache(); render(); });
  csOuve('sv2_tarefas', l => { S.tarefas = l; if (S.rota.area === 'inicio') render(); });
  CS_CARGAS.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  S.rota = csLeRota(); csAcertaHash(); csUso(); render();
}
async function csIniciar() {
  S.rota = csLeRota();
  try { await Data.init(); } catch (e) { console.error(e); S.pronto = true; S._erroEntrar = 'Não foi possível carregar o Firebase. Confira a internet e abra de novo.'; render(); return; }
  /* v0.5.1 (Grok v0.4.11 B1): se a leitura falhar (App Check, permissão, sem internet), mostra o Entrar. O "Primeiro acesso"
     só aparece quando a nuvem respondeu que não existe nenhum Administrador (ou na demonstração nova). */
  try { S._setup = await Data.setupDone(); } catch (e) { S._setup = DEMO ? Store.get('sv2demo_setup') === '1' : true; }
  try { S._descon = Data.conexao(v => { const mudou = S.conexao !== v; S.conexao = v; if (v === true) S._nuvemEm = new Date().toISOString(); if (mudou) { const b = $('.cs-sync'); if (b) { const n = document.createElement('div'); n.innerHTML = csTopo(); const novo = n.querySelector('.cs-sync'); if (novo) b.replaceWith(novo); } if (S.gv === csNuvemGaveta) gvDesenha(true); } }); } catch {}
  Data.auth.onChange(id => { csCarregaUsuario(id); });
  if (DEMO && !Store.get('sv2demo_session')) { S.pronto = true; render(); }
}
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js').catch(() => {}); }
