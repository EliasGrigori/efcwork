/* EFCwork · apont.js — Inspeções › Apontamentos (v0.6.1). Prefixo: ap.
   Mesmos dados do EFClaudian v2.102.60: sv2_apont (apontamentos) e sv2_fotos (as fotos, um documento por foto,
   com refTipo 'apont', papel 'antes' | 'depois'). Nada de coleção nova.
   Escolhas do Elias (11/11 00:00): tela em cartões com foto (OPÇÃO 1); novo apontamento na gaveta em passos (OPÇÃO A),
   com a GRAVIDADE em botões grandes (como na OPÇÃO B) e categoria/setor em janela retrátil; detalhe com a linha do tempo
   da gota e o rodapé alinhado (Não procede / Mudar gravidade / Resolver na mesma linha e do mesmo tamanho, no celular também).
   Regra nova e permanente dele: botões e campos lado a lado ficam alinhados em todas as telas.
   Ficam no EFClaudian por enquanto: marcar/editar a foto (v0.6.3), a análise de problema (5 Porquês, Ishikawa, plano de
   ação) e a aba que junta as NCs dos apontamentos com as das auditorias — ambas vêm na v0.6.2 com a Auditoria interna. */
Object.assign(S, { apont: [], _apFotos: {} });
const AP_CATS = [['acidente', 'Risco de acidente', 'altura, máquina, piso escorregadio'], ['estrutura', 'Estrutura', 'inclui placas e sinalização'], ['residuos', 'Resíduos sólidos', 'lixo no chão, descarte errado'],
  ['higiene', 'Higiene / sanitização', 'banheiro, lavagem de mãos'], ['quimicos', 'Produtos químicos / insumos', 'embalagem, armazenamento, derrame'], ['epi', 'EPI', 'sem luva, bota ou proteção'], ['outro', 'Outro', '']];
const AP_GRAV = [['baixa', 'Baixa', '', 'Entra no relatório de apontamentos.'], ['media', 'Média', 'wa', 'Entra no relatório de apontamentos.'],
  ['grave', 'Grave', 'cr', 'Vai para o sino do seu superior (ele vê quando abrir o app).'], ['urgente', 'Urgente', 'cr', 'Alerta com som para o seu superior se o app dele estiver aberto. Se for urgente de verdade, ligue para ele.']];
const AP_ST = { aberto: ['Aberto', 'wa'], andamento: ['Em andamento', ''], resolvido: ['Resolvido', 'ok'], nao_procede: ['Não procede', ''] };
const AP_SETORES = ['Packing House', 'Campo', 'Almoxarifado', 'Oficina', 'Laboratório', 'Refeitório', 'Escritório'];
const AP_MAX_FOTOS = 5, AP_FOTO_DIAS = 30, AP_REIN_DIAS = 30;
const AP_FILTROS = [['semana', 'Esta semana'], ['abertos', 'Em aberto'], ['meus', 'Meus'], ['todos', 'Todos']];

CS_CARGAS.push(() => {
  csOuve('sv2_apont', l => { S.apont = (l || []).filter(a => !a.teste); if (S.rota.area === 'inspecoes') render(); else if (S.gv) gvDesenha(); }, { order: 'criadoEm', limit: 2000 });
});

const apCat = id => AP_CATS.find(c => c[0] === id) || AP_CATS[AP_CATS.length - 1];
const apGrav = id => AP_GRAV.find(g => g[0] === id) || AP_GRAV[0];
const apAberto = a => a.status === 'aberto' || a.status === 'andamento' || !a.status;
/* mesmos setores do EFClaudian: sv2_cfg/apont, lista de {nome, ativo} */
const apSetoresTodos = () => { const c = S.cfgAp && Array.isArray(S.cfgAp.setores) && S.cfgAp.setores.length ? S.cfgAp.setores : AP_SETORES.map(n => ({ nome: n, ativo: true })); return c.slice(); };
const apSetores = () => apSetoresTodos().filter(s => s.ativo !== false).map(s => s.nome);
const apSeg = () => { const h = hojeISO(), w = new Date(h + 'T12:00:00').getDay() || 7; return addDias(h, 1 - w); };
const apGravPill = a => { const g = apGrav(a.grav), o = a.gravOrig && a.gravOrig !== a.grav ? apGrav(a.gravOrig) : null;
  return (o ? '<span class="pill ap-risc" title="Gravidade de quem registrou">' + esc(o[1]) + '</span>' : '') + '<span class="pill ' + g[2] + '">' + esc(g[1]) + '</span>'; };
const apStPill = a => { const s = AP_ST[a.status] || AP_ST.aberto; return '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>'; };
const apNcSit = a => !a || !a.nc ? '' : a.nc.fechada ? 'fechada' : (a.nc.prazo && a.nc.prazo < hojeISO() ? 'vencida' : 'aberta');
const apNcPill = a => { const s = apNcSit(a); return !s ? '' : '<span class="pill ' + (s === 'fechada' ? 'ok' : s === 'vencida' ? 'cr' : 'wa') + '">NC ' + s + '</span>'; };
function apRein(a) { const lim = addDias(a.data, -AP_REIN_DIAS);
  return S.apont.filter(x => x.setor === a.setor && x.categoria === a.categoria && x.data >= lim && (x.data < a.data || (x.data === a.data && String(x.criadoEm) <= String(a.criadoEm)))).length; }
const apReinPill = a => { const r = apRein(a); return r >= 2 ? '<span class="pill wa">' + r + 'ª vez em ' + AP_REIN_DIAS + ' dias</span>' : ''; };
const apOrigPill = a => a.origem === 'auditoria' ? '<span class="pill">Auditoria' + (a.auditoria ? ' · ' + esc(a.auditoria) : '') + '</span>' : '';
const apPodeCuidar = () => isSup(S.user);
const apHora = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const apHistMais = (a, txt) => (a.hist || []).concat([{ ts: nowISO(), porNome: S.user.nome, txt: txt }]);

/* ---------- fotos: um documento por foto em sv2_fotos, carregadas quando aparecem ---------- */
function apFotoGet(id) { if (S._apFotos[id] !== undefined) return Promise.resolve(S._apFotos[id]);
  S._apFotos[id] = ''; return Data.col('sv2_fotos').get(id).then(d => { const u = (d && d.dataUrl) || ''; S._apFotos[id] = u; return u; }).catch(() => ''); }
GV_DEPOIS.push(g => apFotosCarrega(g));
function apFotosCarrega(raiz) { $$('img[data-apfoto]', raiz || document).forEach(im => { if (im.getAttribute('src')) return;
  apFotoGet(im.getAttribute('data-apfoto')).then(u => { if (u && imgSrc(u)) im.src = imgSrc(u); else { const q = im.closest('.ap-fi') || im.closest('.ap-cf'); if (q) q.classList.add('vz'); } }); }); }
const apFotoIMG = (id, cls) => '<img class="' + (cls || '') + '"' + (S._apFotos[id] && imgSrc(S._apFotos[id]) ? ' src="' + imgSrc(S._apFotos[id]) + '"' : ' data-apfoto="' + esc(id) + '"') + ' alt="Foto do apontamento">';
const apFotosVivas = a => (a.fotos || []).filter(f => !(a.fotosOff || {})[f]);
function apFotoVer(id) { const u = S._apFotos[id]; if (!imgSrc(u)) return;
  const d = document.createElement('div'); d.id = 'ap-fv'; d.className = 'co-fv'; d.innerHTML = '<img src="' + imgSrc(u) + '" alt="Foto do apontamento"><button type="button" class="bt ic-so" data-act="ap-fv-x" aria-label="Fechar">' + ic('x') + '</button>';
  document.body.appendChild(d); csCamadaAbre('apfv', () => { const x = $('#ap-fv'); if (x) x.remove(); }); }
/* LGPD: as fotos somem sozinhas AP_FOTO_DIAS depois de resolvido; o texto e o histórico ficam */
const apFotoVence = a => !a.resolucao || apAberto(a) ? '' : addDias(clDiaLocal(a.resolucao.ts), AP_FOTO_DIAS);
function apFotoPrazoTxt(a) {
  const apagadas = Object.keys(a.fotosOff || {}).length, vivas = apFotosVivas(a).length, v = apFotoVence(a);
  if (!apagadas && !vivas) return '';
  if (apagadas && !vivas) return 'Apagadas ' + AP_FOTO_DIAS + ' dias depois de resolvido (LGPD). O texto e o histórico continuam.';
  if (!v) return 'Ficam guardadas enquanto estiver aberto; depois de resolvido, mais ' + AP_FOTO_DIAS + ' dias.';
  const d = Math.round((new Date(v + 'T12:00:00') - new Date(hojeISO() + 'T12:00:00')) / 86400000);
  return vivas + (vivas === 1 ? ' foto será apagada' : ' fotos serão apagadas') + ' em ' + fmtD(v) + (d <= 0 ? ' (hoje)' : ' (daqui a ' + d + (d === 1 ? ' dia' : ' dias') + ')') + '. Se precisar delas, imprima antes.';
}
let _apLimpando = false;
async function apLimpaFotos() {
  if (_apLimpando || !S.user || !podeLancar(S.user)) return; _apLimpando = true;
  try {
    for (const a of S.apont) {
      const v = apFotoVence(a), vivas = apFotosVivas(a); if (!v || v > hojeISO() || !vivas.length) continue;
      const off = Object.assign({}, a.fotosOff || {}); vivas.forEach(f => { off[f] = nowISO(); });
      await Data.col('sv2_apont').update(a.id, { fotosOff: off });
      for (const f of vivas) await Data.col('sv2_fotos').update(f, { dataUrl: '', apagada: nowISO() }).catch(() => {});
      Audit.log({ acao: 'apagar_fotos', entidade: 'apontamento', entidadeId: a.id, resumo: 'Apagou ' + vivas.length + ' foto(s) do apontamento ' + apCat(a.categoria)[1] + ' (' + AP_FOTO_DIAS + ' dias depois de resolvido · LGPD)' });
    }
  } catch (e) { console.warn('fotos LGPD', e && (e.code || e.message)); }
  _apLimpando = false;
}
CS_CARGAS.push(() => setTimeout(apLimpaFotos, 4000));

/* ---------- tela: cartões com foto (OPÇÃO 1) ---------- */
TELAS.inspecoes = function (aba) {
  const ar = csArea('inspecoes');
  if (aba === 'cloro') return clTela();
  if (aba === 'auditoria') return auTela();
  if (aba !== 'apontamentos') return arEmBreve(ar);
  const u = S.user, f = S.apF || 'semana', seg = apSeg();
  const base = S.apont.slice().sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)));
  const FS = { semana: a => a.data >= seg, abertos: apAberto, meus: a => a.porId === u.id, todos: () => true, urgentes: a => a.grav === 'urgente' && apAberto(a) };
  const lst = base.filter(FS[f] || FS.semana), nUrg = base.filter(FS.urgentes).length;
  const abertos = base.filter(apAberto).length, ncVenc = base.filter(a => apNcSit(a) === 'vencida').length;
  const meta = ['<span>' + abertos + ' em aberto de ' + base.length + '</span>', nUrg ? metaPl(nUrg + (nUrg === 1 ? ' urgente' : ' urgentes'), 'cr', 'alerta') : '', ncVenc ? metaPl(ncVenc + (ncVenc === 1 ? ' NC vencida' : ' NCs vencidas'), 'cr') : ''];
  const acoes = (base.length ? '<button type="button" class="bt" data-act="ap-pareto">' + ic('graf') + 'Pareto</button>' : '') + (isSup(u) ? '<button type="button" class="bt" data-act="ap-setores">' + ic('eng') + 'Setores</button>' : '') +
    (podeLancar(u) ? '<button type="button" class="bt pr" data-act="ap-novo">' + ic('mais') + 'Novo apontamento</button>' : '');
  let h = cabecalho({ titulo: 'Apontamentos', abaNome: 'Apontamentos', meta: meta.filter(Boolean), acoes: acoes });
  const nF = k => base.filter(FS[k]).length, at = (AP_FILTROS.concat(f === 'urgentes' ? [['urgentes', 'Urgentes']] : [])).find(x => x[0] === f) || AP_FILTROS[0];
  h += '<div class="ap-bar">' + ddHTML('ap:f', f, (AP_FILTROS.concat(f === 'urgentes' ? [['urgentes', 'Urgentes']] : [])).map(x => [x[0], x[1] + ' · ' + nF(x[0])])) +
    (nUrg && f !== 'urgentes' ? '<button type="button" class="bt cr" data-act="ap-f-urg">' + ic('alerta') + nUrg + (nUrg === 1 ? ' urgente em aberto' : ' urgentes em aberto') + '</button>' : '') + '</div>';
  if (!lst.length) return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>' + (f === 'semana' ? 'Nenhum apontamento nesta semana.' : f === 'meus' ? 'Você ainda não registrou apontamentos.' : 'Nada por aqui.') + '</b>' +
    (podeLancar(u) ? '<span>Toque em “Novo apontamento” para registrar o que você viu.</span>' : '') + '</div></section>';
  return h + '<div class="ap-cards">' + lst.map(apCard).join('') + '</div>';
};
function apCard(a) {
  const c = apCat(a.categoria), f = apFotosVivas(a)[0];
  return '<button type="button" class="ap-card g-' + esc(a.grav) + '" data-act="ap-abre" data-id="' + esc(a.id) + '">' +
    '<span class="ap-cf' + (f ? '' : ' vz') + '">' + (f ? apFotoIMG(f) : ic('imagem')) + '</span>' +
    '<span class="ap-ct"><b>' + esc(c[1]) + '</b><span class="ap-cd">' + esc(a.setor || '') + (a.obs ? ' · ' + esc(a.obs) : '') + '</span>' +
    '<span class="ap-cp">' + apGravPill(a) + apStPill(a) + apNcPill(a) + apOrigPill(a) + apReinPill(a) + '</span>' +
    '<small>' + esc(fmtD(a.data) + ' ' + (a.hora || '') + ' · ' + (a.porNome || '') + ' · ' + (a.comunicado ? 'encarregado avisado' : 'encarregado não avisado')) + '</small></span>' + ic('seta') + '</button>';
}
/* depois de desenhar a tela, busca as fotos que ainda não estão na memória (o render é síncrono) */
TELAS['inspecoes:depois'] = () => { try { apFotosCarrega(document); auFotosCarrega(document); } catch (e) { console.error(e); } };
DD_AO.ap = (k, v) => { if (k === 'f') { S.apF = v; render(); } else if (S.fm) { S.fm[k] = v; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); } };

/* ---------- novo apontamento: gaveta em passos, gravidade em botões (OPÇÃO A + melhoria) ---------- */
const apPasso = (n, t, dica) => '<div class="cl-p"><i>' + n + '</i>' + esc(t) + (dica ? '<small>' + esc(dica) + '</small>' : '') + '</div>';
function apGravBotoes(v) {
  return '<div class="ap-gb">' + AP_GRAV.map(g => '<button type="button" class="ap-gbt g-' + g[0] + (v === g[0] ? ' on' : '') + '" data-act="ap-grav-pick" data-g="' + g[0] + '" aria-pressed="' + (v === g[0] ? 'true' : 'false') + '">' + esc(g[1]) + '</button>').join('') + '</div>' +
    '<small class="ap-gd">' + esc(v ? apGrav(v)[3] : 'Baixa e média entram no relatório; grave avisa o superior; urgente é alerta com som.') + '</small>';
}
function apFotosBl(f) {
  const fs = f.fotos || [];
  const th = fs.map((d, i) => '<span class="ap-ft"><img src="' + imgSrc(d) + '" alt="Foto ' + (i + 1) + '"><button type="button" class="bt ic-so" data-act="ap-foto-x" data-i="' + i + '" title="Tirar esta foto" aria-label="Tirar esta foto">' + ic('x') + '</button></span>').join('');
  const add = fs.length < AP_MAX_FOTOS ? '<label class="bt">' + ic('imagem') + (fs.length ? 'Mais uma' : 'Tirar foto') + '<input type="file" accept="image/*" capture="environment" data-apfoto-in hidden></label><label class="bt">Galeria<input type="file" accept="image/*" multiple data-apfoto-in hidden></label>' : '';
  return '<div class="ap-fot">' + th + add + '</div>' + '<small class="cl-nt">' + (fs.length >= AP_MAX_FOTOS ? 'Cabem no máximo ' + AP_MAX_FOTOS + ' fotos. ' : '') + 'Fotografe o problema, não o colaborador.</small>';
}
LC_FORM.apNovo = f => {
  const agora = new Date(), aud = f.orig === 'auditoria';
  let c = lcMsg() + apPasso(1, 'Foto', 'até ' + AP_MAX_FOTOS + ' · opcional') + apFotosBl(f) +
    apPasso(2, 'O que foi visto') + '<div class="fm-g cl-fm2">' + lcBl('Categoria', ddHTML('ap:cat', f.cat, [['', 'Escolha…']].concat(AP_CATS.map(x => [x[0], x[1] + (x[2] ? ' · ' + x[2] : '')])))) +
    lcBl('Setor', ddHTML('ap:setor', f.setor, [['', 'Escolha…']].concat(apSetores().map(s => [s, s])).concat([['__outro', '+ Outro local']]))) + '</div>' +
    (f.setor === '__outro' ? lcBl('Qual local', lcIn('setorTxt', f.setorTxt, ' placeholder="ex.: Casa de bombas"')) : '') +
    lcBl('Observação', lcTx('obs', f.obs, 'Se quiser, escreva o que viu')) +
    apPasso(3, 'Gravidade') + apGravBotoes(f.grav) +
    apPasso(4, 'Avisou o encarregado da área?') + '<div class="fm-g cl-fm2">' + lcBl('', ddHTML('ap:com', f.com, [['', 'Escolha…'], ['sim', 'Sim, avisei'], ['nao', 'Não avisei']])) + lcBl('Origem', ddHTML('ap:orig', f.orig || 'rotina', [['rotina', 'Rotina'], ['auditoria', 'Auditoria interna']])) + '</div>' +
    (aud ? lcBl('Qual auditoria', lcIn('audTxt', f.audTxt, ' placeholder="ex.: Auditoria interna 03/2026"')) : '') +
    apPasso(5, 'Risco e recomendação', 'opcional') + '<div class="fm-g cl-fm2">' + lcBl('O que pode acontecer', lcIn('risco', f.risco, ' placeholder="ex.: queda, contaminação"')) + lcBl('O que fazer', lcIn('recom', f.recom, ' placeholder="ex.: repor a placa"')) + '</div>';
  return { ico: 'lista', sub: fmtD(hojeISO()) + ' · ' + pad(agora.getHours()) + ':' + pad(agora.getMinutes()) + ' · ' + S.user.nome + ' · data, hora e nome entram sozinhos', titulo: 'Novo apontamento', corpo: c, rodape: lcPe('ap-novo-ok', 'Enviar') };
};
document.addEventListener('change', async e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-apfoto-in') || !S.fm || !t.files || !t.files.length) return;
  const arqs = Array.prototype.slice.call(t.files); t.value = '';
  const cabe = AP_MAX_FOTOS - (S.fm.fotos || []).length;
  for (const a of arqs.slice(0, cabe)) {
    try { const u = await coFotoReduz(a); if (!S.fm) return; S.fm.fotos = (S.fm.fotos || []).concat([u]); S.fm.sujo = true; }
    catch (er) { lcErro(er.message || 'Não deu para ler a foto.'); return; }
  }
  if (S.fm) { if (arqs.length > cabe) S.fm.msg = 'Cabem no máximo ' + AP_MAX_FOTOS + ' fotos.'; gvDesenha(true); }
});
async function apNovoOk() {
  const f = S.fm, u = S.user; if (!f || !u) return;
  const setor = f.setor === '__outro' ? String(f.setorTxt || '').trim() : String(f.setor || '').trim();
  if (!f.cat) return lcErro('Escolha a categoria.');
  if (!setor) return lcErro(f.setor === '__outro' ? 'Diga qual é o local.' : 'Escolha o setor.');
  if (!f.grav) return lcErro('Toque na gravidade.');
  if (f.com !== 'sim' && f.com !== 'nao') return lcErro('Diga se o encarregado da área foi avisado.');
  if (f.orig === 'auditoria' && String(f.audTxt || '').trim().length < 3) return lcErro('Diga qual auditoria.');
  if (!lcTravar()) return;
  const ts = nowISO(), c = apCat(f.cat), g = apGrav(f.grav), fotos = (f.fotos || []).slice(0, AP_MAX_FOTOS), ids = fotos.map(() => uid());
  const o = { data: hojeISO(), hora: apHora(), criadoEm: ts, porId: u.id, porNome: u.nome,
    origem: f.orig === 'auditoria' ? 'auditoria' : 'rotina', auditoria: f.orig === 'auditoria' ? String(f.audTxt || '').trim() : '',
    categoria: f.cat, setor: setor, grav: f.grav, gravOrig: f.grav, gravHist: [], comunicado: f.com === 'sim',
    obs: String(f.obs || '').trim(), risco: String(f.risco || '').trim(), recom: String(f.recom || '').trim(),
    fotos: ids, fotosDepois: [], fotosOff: {}, status: 'aberto', resolucao: null, nc: null,
    hist: [{ ts: ts, porNome: u.nome, txt: 'Registrou como ' + g[1] + (ids.length ? ' com ' + ids.length + ' foto(s)' : ' sem foto') + (o_aud(f) ? ' · ' + o_aud(f) : '') }] };
  try {
    const id = await Data.col('sv2_apont').add(o);
    fotos.forEach((d, i) => { S._apFotos[ids[i]] = d; Data.col('sv2_fotos').set(ids[i], { refTipo: 'apont', refId: id, papel: 'antes', dataUrl: d, criadoEm: ts, porId: u.id }).catch(er => console.error('foto apont', er)); });
    const sups = supsOf(u).filter(x => x !== u.id);
    const txt = (o.obs || 'Sem observação') + ' · por ' + u.nome + (o.comunicado ? ' · encarregado avisado' : ' · encarregado NÃO avisado');
    if (sups.length && f.grav === 'urgente') Notif.send({ nivel: 'critico', titulo: 'Apontamento URGENTE: ' + c[1] + ' — ' + setor, texto: txt, para: sups, refTipo: 'apont', refId: id });
    else if (sups.length && f.grav === 'grave') Notif.send({ nivel: 'aviso', titulo: 'Apontamento grave: ' + c[1] + ' — ' + setor, texto: txt, para: sups, refTipo: 'apont', refId: id });
    Audit.log({ acao: 'apontamento', entidade: 'apontamento', entidadeId: id, resumo: 'Registrou apontamento (' + g[1] + '): ' + c[1] + ' em ' + setor + (o.obs ? ' — ' + o.obs : ''), depois: { categoria: c[1], setor: setor, gravidade: g[1], origem: o.origem, fotos: ids.length } });
    lcFim(); aviso('Apontamento enviado.' + (f.grav === 'urgente' || f.grav === 'grave' ? ' O seu superior foi avisado.' : ''));
  } catch (e) { f._trava = 0; lcErro(svErro(e)); }
}
const o_aud = f => f.orig === 'auditoria' ? 'auditoria interna: ' + String(f.audTxt || '').trim() : '';

/* ---------- detalhe ---------- */
function apEtapas(a) {
  const quem = (n, ts) => [n, ts ? fmtDT(ts) : ''].filter(Boolean).join(' · ');
  const es = [{ nome: 'Registrado como ' + apGrav(a.gravOrig || a.grav)[1], feito: true, data: a.data, txt: (a.hora ? a.hora + ' · ' : '') + (a.setor || '') + (a.obs ? ' · ' + a.obs : ''), quem: a.porNome }];
  (a.gravHist || []).forEach(h => es.push({ nome: 'Gravidade: ' + apGrav(h.de)[1] + ' → ' + apGrav(h.para)[1], feito: true, txt: h.motivo, quem: quem(h.porNome, h.ts) }));
  es.push({ nome: a.comunicado ? 'Encarregado avisado' : 'Encarregado não avisado', feito: !!a.comunicado, txt: a.comunicado ? 'marcado por quem registrou' : 'quem registrou marcou que não avisou' });
  if (a.nc) { const s = apNcSit(a);
    es.push({ nome: 'NC para ' + a.nc.responsavel, feito: true, txt: 'prazo ' + fmtD(a.nc.prazo) + ' · ' + a.nc.acao, quem: quem(a.nc.abertaPorNome, a.nc.ts), alerta: s === 'vencida' ? 'Prazo vencido' : '' });
    es.push(a.nc.fechada ? { nome: 'NC fechada', feito: true, txt: a.nc.verificacao, quem: quem(a.nc.fechadaPorNome, a.nc.fechadaEm) } : { nome: 'Ação concluída e verificada', feito: false, txt: 'prazo ' + fmtD(a.nc.prazo) });
  }
  if (apAberto(a)) es.push({ nome: 'Resolvido', feito: false, txt: 'com o que foi feito (e foto do depois, se tiver)' });
  else es.push({ nome: a.status === 'nao_procede' ? 'Não procede' : 'Resolvido', feito: true, data: a.resolucao ? clDiaLocal(a.resolucao.ts) : '', txt: a.resolucao ? a.resolucao.texto : '', quem: a.resolucao ? quem(a.resolucao.porNome, a.resolucao.ts) : '' });
  const at = es.find(x => !x.feito); if (at) at.atual = true;
  return es;
}
function apAbre(id) {
  gvAbrir(() => {
    const a = S.apont.find(x => x.id === id); if (!a) return null;
    const c = apCat(a.categoria), sup = apPodeCuidar(), ab = apAberto(a), vivas = apFotosVivas(a), dep = (a.fotosDepois || []).filter(f => !(a.fotosOff || {})[f]);
    let corpo = tlFluido('ap' + a.id, apEtapas(a));
    if (apNcSit(a) === 'vencida') corpo += lcAv('A NC de <b>' + esc(a.nc.responsavel) + '</b> passou do prazo (' + esc(fmtD(a.nc.prazo)) + ').', 'cr');
    const gal = (l, t) => !l.length ? '' : '<p class="gv-h">' + t + '</p><div class="ap-gal">' + l.map(f => '<button type="button" class="ap-fi" data-act="ap-foto-ver" data-id="' + esc(f) + '">' + apFotoIMG(f) + '</button>').join('') + '</div>';
    corpo += gal(vivas, 'Fotos') + gal(dep, 'Depois');
    const kv = [['Registrado', fmtD(a.data) + ' às ' + (a.hora || '') + ' · ' + (a.porNome || '')], ['Origem', a.origem === 'auditoria' ? 'Auditoria interna' + (a.auditoria ? ' · ' + a.auditoria : '') : 'Rotina'],
      ['Setor', a.setor || ''], ['Observação', a.obs || ''], ['O que pode acontecer', a.risco || ''], ['Recomendação', a.recom || ''],
      ['Encarregado da área', a.comunicado ? 'Foi avisado' : 'Não foi avisado'], [apRein(a) >= 2 ? 'Reincidência' : '', apRein(a) >= 2 ? apRein(a) + 'ª vez em ' + AP_REIN_DIAS + ' dias (mesmo setor e categoria)' : ''],
      [a.nc ? 'Responsável da NC' : '', a.nc ? a.nc.responsavel + ' · prazo ' + fmtD(a.nc.prazo) + ' · ' + a.nc.acao : ''],
      [a.resolucao ? (a.status === 'nao_procede' ? 'Por que não procede' : 'O que foi feito') : '', a.resolucao ? a.resolucao.texto + ' — ' + a.resolucao.porNome + ', ' + fmtDT(a.resolucao.ts) : ''],
      ['Fotos', apFotoPrazoTxt(a)]];
    corpo += gvCampos(kv.filter(x => x[0]));
    const hist = (a.hist || []).slice().reverse();
    if (hist.length) corpo += '<p class="gv-h">Histórico</p><div class="ap-hist">' + hist.map(h => '<div><b>' + esc(h.porNome || '') + '</b> · ' + esc(fmtDT(h.ts)) + '<span>' + esc(h.txt || '') + '</span></div>').join('') + '</div>';
    let pe = '';
    if (sup && ab) pe = '<button type="button" class="bt" data-act="ap-np" data-id="' + esc(a.id) + '">Não procede</button><button type="button" class="bt" data-act="ap-grav" data-id="' + esc(a.id) + '">Mudar gravidade</button>' +
      (a.nc ? (a.nc.fechada ? '' : '<button type="button" class="bt" data-act="ap-nc-fechar" data-id="' + esc(a.id) + '">Fechar NC</button>') : '<button type="button" class="bt" data-act="ap-nc" data-id="' + esc(a.id) + '">Abrir NC</button>') +
      '<button type="button" class="bt pr" data-act="ap-res" data-id="' + esc(a.id) + '">Resolver</button>';
    else if (sup && !ab) pe = '<button type="button" class="bt" data-act="ap-reabrir" data-id="' + esc(a.id) + '">Reabrir</button>';
    return { ico: 'lista', sub: (a.setor || '') + ' · ' + fmtD(a.data) + ' ' + (a.hora || '') + ' · por ' + (a.porNome || ''), titulo: c[1],
      pill: apGravPill(a) + ' ' + apStPill(a) + ' ' + apNcPill(a), corpo: corpo, cabAcoes: (anpDoApont(a.id) || isSup(S.user)) && a.status !== 'nao_procede' ? '<button type="button" class="bt" data-act="anp-ap" data-id="' + esc(a.id) + '">' + (anpDoApont(a.id) ? esc(anpDoApont(a.id).numero) : 'Analisar') + '</button>' : '', rodape: pe ? '<div class="ap-pe">' + pe + '</div>' : '' };
  });
  render();
}
function apAplica(a, patch, msg, depois) {
  const loc = S.apont.find(x => x.id === a.id); if (loc) Object.assign(loc, patch);
  lcGrava([Data.col('sv2_apont').update(a.id, patch)], msg, depois || (() => apAbre(a.id)));
}

/* ---------- resolver, não procede, reabrir ---------- */
LC_FORM.apRes = f => { const a = S.apont.find(x => x.id === f.id); if (!a) return null;
  return { ico: 'ok', sub: apCat(a.categoria)[1] + ' · ' + a.setor, titulo: 'Resolver apontamento',
    corpo: lcMsg() + lcBl('O que foi feito', lcTx('texto', f.texto, 'ex.: piso secado e placa colocada')) + '<p class="gv-h">Foto do depois <small style="font-weight:400;color:var(--tx3)">opcional</small></p>' + apFotosBl(f) +
      lcAv('Quem registrou é avisado. As fotos ficam mais ' + AP_FOTO_DIAS + ' dias e depois somem sozinhas (LGPD); o texto fica.'),
    rodape: lcPe('ap-res-ok', 'Resolver') }; };
async function apResOk() {
  const f = S.fm, a = f && S.apont.find(x => x.id === f.id); if (!a) return;
  const t = String(f.texto || '').trim(); if (t.length < 3) return lcErro('Escreva o que foi feito.');
  if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador resolve.');
  if (!lcTravar()) return;
  const ts = nowISO(), fotos = (f.fotos || []).slice(0, AP_MAX_FOTOS), ids = fotos.map(() => uid());
  fotos.forEach((d, i) => { S._apFotos[ids[i]] = d; Data.col('sv2_fotos').set(ids[i], { refTipo: 'apont', refId: a.id, papel: 'depois', dataUrl: d, criadoEm: ts, porId: S.user.id }).catch(er => console.error(er)); });
  const patch = { status: 'resolvido', resolucao: { texto: t, porId: S.user.id, porNome: S.user.nome, ts: ts }, fotosDepois: (a.fotosDepois || []).concat(ids), hist: apHistMais(a, 'Resolvido: ' + t + (ids.length ? ' (com ' + ids.length + ' foto(s) do depois)' : '')) };
  Audit.log({ acao: 'situacao_apontamento', entidade: 'apontamento', entidadeId: a.id, resumo: 'Resolveu o apontamento ' + apCat(a.categoria)[1] + ', ' + a.setor + ': ' + t, antes: { situacao: (AP_ST[a.status] || AP_ST.aberto)[0] }, depois: { situacao: 'Resolvido' } });
  if (a.porId !== S.user.id) Notif.send({ nivel: 'info', titulo: 'Seu apontamento foi resolvido', texto: apCat(a.categoria)[1] + ' — ' + a.setor + ': ' + t, para: [a.porId], refTipo: 'apont', refId: a.id }).catch(() => {});
  apAplica(a, patch, 'Marcado como resolvido.');
}
LC_FORM.apSt = f => { const a = S.apont.find(x => x.id === f.id); if (!a) return null; const reab = f.st === 'reabrir';
  return { ico: 'lista', sub: apCat(a.categoria)[1] + ' · ' + a.setor, titulo: reab ? 'Reabrir apontamento' : 'Marcar como não procede',
    corpo: lcMsg() + lcBl('Motivo', lcTx('motivo', f.motivo, reab ? 'ex.: o problema voltou' : 'ex.: conferido no local, não era risco')) + lcAv('Quem registrou é avisado.'),
    rodape: lcPe('ap-st-ok', reab ? 'Reabrir' : 'Não procede') }; };
function apStOk() {
  const f = S.fm, a = f && S.apont.find(x => x.id === f.id); if (!a) return;
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador muda isso.');
  if (!lcTravar()) return;
  const reab = f.st === 'reabrir', patch = { status: reab ? 'aberto' : 'nao_procede', hist: apHistMais(a, (reab ? 'Reaberto' : 'Não procede') + '. Motivo: ' + m) };
  if (!reab) patch.resolucao = { texto: m, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }; else patch.resolucao = null;
  Audit.log({ acao: 'situacao_apontamento', entidade: 'apontamento', entidadeId: a.id, resumo: (reab ? 'Reabriu' : 'Marcou como não procede') + ' o apontamento ' + apCat(a.categoria)[1] + ', ' + a.setor + ' — ' + m, antes: { situacao: (AP_ST[a.status] || AP_ST.aberto)[0] }, depois: { situacao: reab ? 'Aberto' : 'Não procede' } });
  if (a.porId !== S.user.id) Notif.send({ nivel: 'info', titulo: reab ? 'Seu apontamento foi reaberto' : 'Seu apontamento foi marcado como não procede', texto: apCat(a.categoria)[1] + ' — ' + a.setor + ': ' + m, para: [a.porId], refTipo: 'apont', refId: a.id }).catch(() => {});
  apAplica(a, patch, reab ? 'Apontamento reaberto.' : 'Marcado como não procede.');
}

/* ---------- mudar a gravidade (o que a pessoa marcou nunca some) ---------- */
LC_FORM.apGrav = f => { const a = S.apont.find(x => x.id === f.id); if (!a) return null;
  return { ico: 'lapis', sub: apCat(a.categoria)[1] + ' · ' + a.setor, titulo: 'Mudar a gravidade',
    corpo: lcMsg() + lcAv('Hoje: <b>' + esc(apGrav(a.grav)[1]) + '</b>' + (a.gravOrig !== a.grav ? ' (registrado como ' + esc(apGrav(a.gravOrig)[1]) + ')' : '') + '. O que ' + esc(a.porNome || 'quem registrou') + ' marcou fica guardado, riscado.') +
      apGravBotoes(f.nova) + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: a placa só estava solta, sem risco imediato')),
    rodape: lcPe('ap-grav-ok', 'Salvar') }; };
function apGravOk() {
  const f = S.fm, a = f && S.apont.find(x => x.id === f.id); if (!a) return;
  if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador muda a gravidade.');
  if (!f.nova) return lcErro('Toque na nova gravidade.');
  if (f.nova === a.grav) return lcErro('Essa já é a gravidade de agora.');
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const de = a.grav, patch = { grav: f.nova, gravHist: (a.gravHist || []).concat([{ de: de, para: f.nova, porId: S.user.id, porNome: S.user.nome, ts: nowISO(), motivo: m }]), hist: apHistMais(a, 'Gravidade: ' + apGrav(de)[1] + ' → ' + apGrav(f.nova)[1] + '. Motivo: ' + m) };
  Audit.log({ acao: 'reclassificar_apontamento', entidade: 'apontamento', entidadeId: a.id, resumo: 'Mudou a gravidade do apontamento (' + apCat(a.categoria)[1] + ', ' + a.setor + ') de ' + apGrav(de)[1] + ' para ' + apGrav(f.nova)[1] + ' — ' + m, antes: { gravidade: apGrav(de)[1] }, depois: { gravidade: apGrav(f.nova)[1] } });
  if (a.porId !== S.user.id) Notif.send({ nivel: 'info', titulo: 'A gravidade do seu apontamento mudou', texto: apCat(a.categoria)[1] + ' — ' + a.setor + ': ' + apGrav(de)[1] + ' → ' + apGrav(f.nova)[1] + ' por ' + S.user.nome + '. Motivo: ' + m, para: [a.porId], refTipo: 'apont', refId: a.id }).catch(() => {});
  apAplica(a, patch, 'Gravidade alterada.');
}

/* ---------- NC: nasce do apontamento ---------- */
LC_FORM.apNC = f => { const a = S.apont.find(x => x.id === f.id); if (!a) return null;
  const nomes = S.users.filter(u => !u.bloqueado).map(u => u.nome).sort(cmpTxt);
  return { ico: 'lista', sub: apCat(a.categoria)[1] + ' · ' + a.setor, titulo: 'Abrir não conformidade',
    corpo: lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Responsável', lcIn('resp', f.resp, ' list="ap-dl-resp" placeholder="quem vai resolver"') + '<datalist id="ap-dl-resp">' + nomes.map(n => '<option value="' + esc(n) + '">').join('') + '</datalist>') +
      lcBl('Prazo', lcData('prazo', f.prazo, true)) + '</div>' + lcBl('Ação corretiva', lcTx('acao', f.acao, 'o que vai ser feito para não acontecer de novo')) + lcAv('O responsável é avisado no sino e o apontamento passa para “em andamento”.'),
    rodape: lcPe('ap-nc-ok', 'Abrir NC') }; };
function apNCOk() {
  const f = S.fm, a = f && S.apont.find(x => x.id === f.id); if (!a) return;
  if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador abre NC.');
  if (a.nc) return lcErro('Este apontamento já tem NC.');
  const resp = String(f.resp || '').trim(), prazo = String(f.prazo || ''), acao = String(f.acao || '').trim();
  if (resp.length < 2) return lcErro('Informe o responsável.');
  if (!dataOk(prazo)) return lcErro('Informe o prazo.');
  if (prazo < hojeISO()) return lcErro('O prazo não pode ser antes de hoje.');
  if (acao.length < 3) return lcErro('Escreva a ação corretiva.');
  if (!lcTravar()) return;
  const nc = { responsavel: resp, prazo: prazo, acao: acao, abertaPor: S.user.id, abertaPorNome: S.user.nome, ts: nowISO(), fechada: false };
  const patch = { nc: nc, hist: apHistMais(a, 'Abriu NC: ' + resp + ', prazo ' + fmtD(prazo) + '. Ação: ' + acao) };
  if (a.status === 'aberto') patch.status = 'andamento';
  const alvo = S.users.find(u => !u.bloqueado && String(u.nome).toLowerCase() === resp.toLowerCase());
  if (alvo && alvo.id !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'NC para você: ' + apCat(a.categoria)[1] + ' — ' + a.setor, texto: 'Prazo ' + fmtD(prazo) + '. Ação: ' + acao + ' · aberta por ' + S.user.nome, para: [alvo.id], refTipo: 'apont', refId: a.id }).catch(() => {});
  Audit.log({ acao: 'abrir_nc', entidade: 'apontamento', entidadeId: a.id, resumo: 'Abriu NC (' + apCat(a.categoria)[1] + ', ' + a.setor + ') para ' + resp + ', prazo ' + fmtD(prazo) + ': ' + acao, depois: { responsavel: resp, prazo: prazo, acao: acao } });
  apAplica(a, patch, 'NC aberta.');
}
LC_FORM.apNCFechar = f => { const a = S.apont.find(x => x.id === f.id); if (!a || !a.nc) return null;
  return { ico: 'ok', sub: a.nc.responsavel + ' · prazo ' + fmtD(a.nc.prazo), titulo: 'Fechar a NC',
    corpo: lcMsg() + lcBl('Como foi verificado que resolveu', lcTx('verif', f.verif, 'ex.: conferido no local em ' + fmtD(hojeISO()) + ', área limpa')) + lcAv('Fechando a NC o apontamento também fica resolvido.'),
    rodape: lcPe('ap-nc-fechar-ok', 'Fechar NC') }; };
function apNCFecharOk() {
  const f = S.fm, a = f && S.apont.find(x => x.id === f.id); if (!a || !a.nc) return;
  if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador fecha a NC.');
  const v = String(f.verif || '').trim(); if (v.length < 3) return lcErro('Escreva como foi verificado.');
  if (!lcTravar()) return;
  const ts = nowISO(), nc = Object.assign({}, a.nc, { fechada: true, fechadaEm: ts, fechadaPor: S.user.id, fechadaPorNome: S.user.nome, verificacao: v });
  const patch = { nc: nc, hist: apHistMais(a, 'Fechou a NC. Verificação: ' + v) };
  if (apAberto(a)) { patch.status = 'resolvido'; patch.resolucao = { texto: 'NC fechada: ' + v, porId: S.user.id, porNome: S.user.nome, ts: ts }; }
  Audit.log({ acao: 'fechar_nc', entidade: 'apontamento', entidadeId: a.id, resumo: 'Fechou a NC (' + apCat(a.categoria)[1] + ', ' + a.setor + ') — ' + v, antes: { nc: 'aberta' }, depois: { nc: 'fechada', verificacao: v } });
  apAplica(a, patch, 'NC fechada.');
}

/* ---------- Pareto: o que mais se repete ---------- */
function apParetoDados(por, dias) {
  const lim = addDias(hojeISO(), -dias), base = S.apont.filter(a => a.status !== 'nao_procede' && a.data >= lim);
  const m = {}; base.forEach(a => { const k = por === 'setor' ? (a.setor || 'sem setor') : por === 'grav' ? apGrav(a.grav)[1] : apCat(a.categoria)[1]; m[k] = (m[k] || 0) + 1; });
  const itens = Object.keys(m).map(k => ({ nome: k, n: m[k] })).sort((a, b) => b.n - a.n || cmpTxt(a.nome, b.nome));
  const total = itens.reduce((s, x) => s + x.n, 0); let ac = 0;
  itens.forEach(x => { ac += x.n; x.ac = ac; x.pc = total ? ac / total * 100 : 0; x.vital = x.pc <= 80 || (x.ac - x.n) / (total || 1) * 100 < 80; });
  return { itens: itens, total: total };
}
function apParetoAbre() {
  S.apPPor = S.apPPor || 'cat'; S.apPDias = S.apPDias || 90;
  gvAbrir(() => {
    const d = apParetoDados(S.apPPor, S.apPDias), max = d.itens.length ? d.itens[0].n : 1, vit = d.itens.filter(x => x.vital);
    const corpo = '<div class="fm-g cl-fm2">' + lcBl('Agrupar por', ddHTML('app:por', S.apPPor, [['cat', 'Categoria'], ['setor', 'Setor'], ['grav', 'Gravidade']])) + lcBl('Período', ddHTML('app:dias', String(S.apPDias), [['30', 'Últimos 30 dias'], ['90', 'Últimos 90 dias'], ['365', 'Último ano']])) + '</div>' +
      (!d.total ? '<div class="vazio">' + ic('graf') + '<b>Nenhum apontamento neste período.</b></div>' :
        '<div class="ap-par">' + d.itens.map(x => '<div class="ap-pl' + (x.vital ? ' vit' : '') + '"><span class="ap-pn">' + esc(x.nome) + '</span><span class="ap-pb"><i style="width:' + (x.n / max * 100).toFixed(1) + '%"></i></span><b>' + x.n + '</b><small>' + x.pc.toFixed(0) + '%</small></div>').join('') + '</div>' +
        lcAv(vit.length ? 'Poucos vitais (até 80% do total): <b>' + esc(vit.map(x => x.nome).join(', ')) + '</b>. Resolvendo esses, resolve a maior parte. Os “não procede” não entram.' : 'Os “não procede” não entram na conta.'));
    return { ico: 'graf', sub: d.total + (d.total === 1 ? ' apontamento' : ' apontamentos') + ' no período', titulo: 'Pareto dos apontamentos', corpo: corpo };
  });
  render();
}
DD_AO.app = (k, v) => { if (k === 'por') S.apPPor = v; else S.apPDias = Number(v); gvDesenha(true); };

/* ---------- setores (configuração do Líder ★ / Administrador) ---------- */
LC_FORM.apSetores = f => ({ ico: 'eng', sub: 'Os setores que aparecem no novo apontamento', titulo: 'Setores',
  corpo: lcMsg() + lcBl('Um por linha', '<textarea class="fm-i ap-setx" data-fm="lista" rows="8" placeholder="' + esc(AP_SETORES.join('\n')) + '">' + esc(f.lista || '') + '</textarea>') + lcAv('Se deixar em branco, voltam os setores de fábrica: ' + esc(AP_SETORES.join(', ')) + '.'),
  rodape: lcPe('ap-setores-ok', 'Salvar') });
function apSetoresOk() {
  const f = S.fm; if (!f) return; if (!apPodeCuidar()) return lcErro('Só o Líder ★ ou o Administrador muda os setores.');
  const l = String(f.lista || '').split('\n').map(x => x.trim()).filter(Boolean);
  if (l.length > 40) return lcErro('No máximo 40 setores.');
  if (!lcTravar()) return;
  const antes = apSetoresTodos(), novos = l.map(n => { const v = antes.find(x => x.nome === n); return v ? Object.assign({}, v, { ativo: true }) : { nome: n, ativo: true }; });
  const doc = Object.assign({}, S.cfgAp || {}, { setores: novos, atualizadoEm: nowISO(), atualizadoPor: S.user.nome }); delete doc.id; delete doc.srv;
  lcGrava([Data.col('sv2_cfg').set('apont', doc)], 'Setores salvos.');
  Audit.log({ acao: 'config', entidade: 'config', entidadeId: 'apSetores', resumo: 'Mudou os setores dos apontamentos: ' + (l.length ? l.join(', ') : '(voltou ao padrão)') });
}

/* ---------- cliques ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="ap-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'ap-abre') apAbre(id);
  else if (a === 'ap-novo') { if (podeLancar(S.user)) lcAbrir({ k: 'apNovo', fotos: [], cat: '', setor: '', setorTxt: '', grav: '', com: '', orig: 'rotina', audTxt: '', obs: '', risco: '', recom: '' }); }
  else if (a === 'ap-novo-ok') apNovoOk();
  else if (a === 'ap-grav-pick') { const g = t.getAttribute('data-g'); if (S.fm) { if (S.fm.k === 'apNovo') S.fm.grav = g; else S.fm.nova = g; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); } }
  else if (a === 'ap-foto-x') { const i = Number(t.getAttribute('data-i')); if (S.fm) { S.fm.fotos = (S.fm.fotos || []).filter((x, k) => k !== i); S.fm.sujo = true; gvDesenha(true); } }
  else if (a === 'ap-foto-ver') apFotoVer(id);
  else if (a === 'ap-fv-x') csVolta();
  else if (a === 'ap-f-urg') { S.apF = 'urgentes'; render(); }
  else if (a === 'ap-res') lcAbrir({ k: 'apRes', id: id, texto: '', fotos: [] }, () => apAbre(id));
  else if (a === 'ap-res-ok') apResOk();
  else if (a === 'ap-np') lcAbrir({ k: 'apSt', id: id, st: 'np', motivo: '' }, () => apAbre(id));
  else if (a === 'ap-reabrir') lcAbrir({ k: 'apSt', id: id, st: 'reabrir', motivo: '' }, () => apAbre(id));
  else if (a === 'ap-st-ok') apStOk();
  else if (a === 'ap-grav') lcAbrir({ k: 'apGrav', id: id, nova: '', motivo: '' }, () => apAbre(id));
  else if (a === 'ap-grav-ok') apGravOk();
  else if (a === 'ap-nc') lcAbrir({ k: 'apNC', id: id, resp: '', prazo: addDias(hojeISO(), 7), acao: '' }, () => apAbre(id));
  else if (a === 'ap-nc-ok') apNCOk();
  else if (a === 'ap-nc-fechar') lcAbrir({ k: 'apNCFechar', id: id, verif: '' }, () => apAbre(id));
  else if (a === 'ap-nc-fechar-ok') apNCFecharOk();
  else if (a === 'ap-pareto') apParetoAbre();
  else if (a === 'ap-setores') { if (apPodeCuidar()) lcAbrir({ k: 'apSetores', lista: apSetores().join('\n') }); }
  else if (a === 'ap-setores-ok') apSetoresOk();
});

/* busca geral */
BG_FONTES.push(q => S.apont.filter(a => bgCasa(q, [apCat(a.categoria)[1], a.setor, a.obs, a.porNome, a.risco, a.recom].join(' '))).slice(0, 6).map(a => ({
  grupo: 'Apontamentos', nome: apCat(a.categoria)[1] + ' · ' + (a.setor || ''), sub: fmtD(a.data) + ' · ' + (AP_ST[a.status] || AP_ST.aberto)[0] + (a.obs ? ' · ' + a.obs : ''), ico: 'lista',
  abrir: () => { if (S.rota.area !== 'inspecoes' || S.rota.aba !== 'apontamentos') ir('inspecoes', 'apontamentos'); apAbre(a.id); } })));
