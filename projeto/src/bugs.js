/* EFCwork · bugs.js — Qualidade › Bugs e sugestões (v0.6.16). Prefixo: bs.
   Mesmo dado do EFClaudian v2.80/v2.92: sv2_bugs (um documento por relato) e sv2_bugs_foto/{id do relato} (a imagem, à parte;
   o relato guarda temFoto). QUALQUER pessoa reporta um problema ou sugere uma melhoria, com imagem opcional; o app anota sozinho
   a versão, a tela onde a pessoa estava e o aparelho. O Administrador recebe o aviso e muda a situação (Em análise, Resolvido na
   versão X, Não procede com motivo, Reabrir); quem reportou é avisado no sino. Nada se apaga. Campo novo só do EFCwork: app
   ('efcwork'), para saber de qual app veio o relato (o EFClaudian ignora). */
const BS_TIPOS = { bug: ['Problema', 'cr'], sugestao: ['Sugestão', ''] };
const BS_SIT = { novo: ['Novo', 'wa'], analise: ['Em análise', ''], resolvido: ['Resolvido', 'ok'], naoprocede: ['Não procede', ''] };
/* ITEM 57 (15/11): a tabela mostra só o que está em aberto; resolvidos e não procede ficam juntos em Finalizados (botão-ícone só desta aba),
   na ordem da data em que foram finalizados (finalizadoEm; nos antigos, a data do passo que fechou). */
const BS_FOTO_MAX = 240000; /* o mesmo teto do EFClaudian para a imagem do relato */
Object.assign(S, { bugs: [], _bsFotos: {}, _bsFin: false });
TB_OCULTAS_PADRAO['bs-fin'] = ['dt']; /* nos Finalizados a data que conta é a de finalizado; a de envio fica em Colunas */
const bsAberto = b => !b.status || b.status === 'novo' || b.status === 'analise';
const bsDe = id => S.bugs.find(b => b.id === id) || null;
const bsPode = () => isPrincipal(S.user);
const bsVersao = () => APP_NOME + ' v' + VERSAO;
function bsAreaNome(id) { const a = AREAS.find(x => x.id === id && x.id !== 'inicio' && x.id !== 'adm'); return a ? a.nome : 'Geral'; }
const bsAreasOpc = () => AREAS.filter(a => a.id !== 'inicio' && a.id !== 'adm' && !a.negada).map(a => [a.id, a.nome]).concat([['geral', 'Geral / outra']]);

CS_CARGAS.push(() => {
  csOuve('sv2_bugs', l => { S.bugs = l || []; if (S.rota.area === 'qualidade' && S.rota.aba === 'bugs') render(); else if (S.gv) gvDesenha(); }, { order: 'ts', limit: 500 });
});
/* a tela onde a pessoa estava antes de abrir Bugs e sugestões (para "Em qual parte do app" já vir certo) */
window.addEventListener('hashchange', e => { const h = String((e.oldURL || '').split('#')[1] || '').replace(/^\//, ''); if (h && h.indexOf('qualidade/bugs') !== 0) S._bsAntes = h.split('?')[0]; });

/* dois envios ao mesmo tempo (ou um sem internet) podem pegar o mesmo número: o mais novo aparece como 12-b (como no EFClaudian) */
function bsNum(b) {
  const n = Number(b && b.numero) || 0; if (!n) return '';
  const l = S.bugs.filter(x => (Number(x.numero) || 0) === n).sort((x, y) => String(x.ts || '').localeCompare(String(y.ts || '')) || String(x.id).localeCompare(String(y.id)));
  const k = l.findIndex(x => x.id === b.id); return String(n) + (k > 0 ? '-' + String.fromCharCode(97 + Math.min(k, 25)) : '');
}
const bsSitPill = b => { const s = BS_SIT[b.status || 'novo'] || BS_SIT.novo; return '<span class="pill ' + esc(s[1]) + '">' + esc(s[0] + (b.status === 'resolvido' && b.versaoResolvido ? ' · ' + b.versaoResolvido : '')) + '</span>'; };
const bsTipoPill = b => { const t = BS_TIPOS[b.tipo] || BS_TIPOS.bug; return '<span class="pill ' + esc(t[1]) + '">' + esc(t[0]) + '</span>'; };
function bsFimEm(b) { if (bsAberto(b)) return ''; if (b.finalizadoEm) return b.finalizadoEm; const h = (b.hist || []).filter(x => x.status === b.status).pop(); return (h && h.ts) || b.atualizadoEm || b.ts || ''; }

/* ---------- tela ---------- */
function bsTela() {
  const ab = S.bugs.filter(bsAberto).sort((a, b) => String(b.ts).localeCompare(String(a.ts))), fin = S.bugs.filter(b => !bsAberto(b)).sort((a, b) => String(bsFimEm(b)).localeCompare(String(bsFimEm(a))));
  if (S._bsFin && !fin.length) S._bsFin = false;
  const vf = S._bsFin, nv = ab.filter(b => (b.status || 'novo') === 'novo').length;
  const meta = vf ? ['<span>' + esc(fin.length) + (fin.length === 1 ? ' finalizado' : ' finalizados') + ' · ' + esc(ab.length) + ' em aberto</span>'] : ['<span>' + esc(ab.length) + ' em aberto</span>', bsPode() && nv ? metaPl(nv + (nv === 1 ? ' novo para ver' : ' novos para ver'), 'wa', 'alerta') : ''];
  const tFin = vf ? 'Voltar para os em aberto' : 'Finalizados: resolvidos e não procede (' + fin.length + ')';
  const acoes = '<div class="bs-acs"><button type="button" class="bt pr" data-act="bs-novo">' + ic('mais') + 'Reportar ou sugerir</button></div>';
  /* v0.6.16 (Elias, 15/11): o botão Finalizados fica na barra da tabela, ao lado de Colunas, no mesmo tamanho dos outros; a impressora da barra gera o relatório com descrição e imagens */
  const antes = fin.length ? '<button type="button" class="bt ic-so bs-fin' + (vf ? ' on' : '') + '" data-act="bs-fin" aria-pressed="' + (vf ? 'true' : 'false') + '" title="' + esc(tFin) + '" aria-label="' + esc(tFin) + '">' + ic('ok') + '</button>' : '';
  const c = cabecalho({ titulo: vf ? 'Bugs e sugestões · Finalizados' : 'Bugs e sugestões', abaNome: 'Bugs e sugestões', meta: meta.filter(Boolean), acoes: acoes });
  if (!S.bugs.length) return c + '<section class="pn"><div class="vazio">' + ic('alerta') + '<b>Nenhum problema ou sugestão ainda.</b><span>Deu algo errado no app ou tem uma ideia que ajuda no dia a dia? Conte aqui. Um print ajuda muito. O Administrador acompanha e responde.</span></div></section>';
  const cols = [{ k: 'nu', rot: 'Nº', tipo: 'num', v: b => Number(b.numero) || null, html: b => esc(bsNum(b)) },
    { k: 'ti', rot: 'Tipo', v: b => (BS_TIPOS[b.tipo] || BS_TIPOS.bug)[0], html: bsTipoPill },
    { k: 'tt', rot: 'Título', v: b => b.titulo || '', cls: 'forte', longo: true, html: b => esc(b.titulo || '') + (b.foto || b.temFoto ? ' <i class="bs-clip" title="Com imagem">' + ic('imagem') + '</i>' : '') },
    { k: 'ar', rot: 'Parte do app', v: b => bsAreaNome(b.area) },
    { k: 'qm', rot: 'Quem', v: b => b.porNome || '' },
    { k: 'dt', rot: 'Data', tipo: 'data', v: b => b.ts ? diaLocal(b.ts) : '' }];
  if (vf) cols.push({ k: 'fi', rot: 'Finalizado em', tipo: 'data', v: b => bsFimEm(b) ? diaLocal(bsFimEm(b)) : '' });
  cols.push({ k: 'st', rot: 'Situação', v: b => (BS_SIT[b.status || 'novo'] || BS_SIT.novo)[0], html: bsSitPill });
  return c + tbHTML({ id: vf ? 'bs-fin' : 'bs-lista', titulo: vf ? 'Bugs e sugestões finalizados' : 'Bugs e sugestões em aberto', unidade: 'relatos', unidade1: 'relato', linhas: vf ? fin : ab, aoClicar: bsAbre, antesIcones: antes, imprimir: bsPdf,
    busca: b => [bsNum(b), b.titulo, b.descricao, b.porNome, bsAreaNome(b.area), b.versao, b.versaoResolvido].join(' '), vazio: vf ? 'Nada finalizado com este filtro.' : 'Nada em aberto. Os resolvidos e os que não procedem estão em Finalizados (botão ao lado de Colunas, na barra da tabela).', cols: cols });
}
const bsQualOrig = TELAS.qualidade;
TELAS.qualidade = aba => aba === 'bugs' ? bsTela() : bsQualOrig(aba);

/* ---------- reportar / sugerir ---------- */
function bsNovo(tipo) { /* ITEM 58 (15/11): um botão só; o tipo se escolhe na janela */
  const ar = String(S._bsAntes || '').split('/')[0], opc = bsAreasOpc();
  lcAbrir({ k: 'bsNovo', tipo: tipo === 'sugestao' ? 'sugestao' : 'bug', area: opc.some(o => o[0] === ar) ? ar : 'geral', tela: S._bsAntes || '', titulo: '', desc: '', foto: '' });
}
LC_FORM.bsNovo = f => {
  const bug = f.tipo === 'bug';
  const c = lcMsg() + apPasso(1, 'O que é') + '<div class="fm-g cl-fm2">' + lcBl('Tipo', ddHTML('bs:tipo', f.tipo, [['bug', 'Problema'], ['sugestao', 'Sugestão']])) + lcBl('Em qual parte do app', ddHTML('bs:area', f.area, bsAreasOpc())) + '</div>' +
    apPasso(2, bug ? 'O que aconteceu' : 'Como seria') + lcBl('Título curto', lcIn('titulo', f.titulo, ' maxlength="90" placeholder="' + (bug ? 'ex.: a tabela sobe quando seleciono um item' : 'ex.: filtro por laboratório nos laudos') + '"')) +
    lcBl(bug ? 'Passo a passo, se puder' : 'A ideia e por que ajuda', lcTx('desc', f.desc, bug ? 'o que você fez, o que apareceu e o que esperava' : 'como funcionaria no dia a dia')) +
    apPasso(3, 'Imagem', 'opcional') + bsFotoBl(f) +
    lcAv('O app anota sozinho a versão (' + esc(bsVersao()) + '), a tela onde você estava e o aparelho. O Administrador recebe o aviso e responde no sino.');
  return { ico: bug ? 'alerta' : 'mais', sub: 'Qualidade · Bugs e sugestões · ' + S.user.nome, titulo: 'Reportar ou sugerir', corpo: c, rodape: lcPe('bs-novo-ok', 'Enviar') };
};
function bsFotoBl(f) {
  return '<div class="ap-fot">' + (imgSrc(f.foto) ? '<span class="ap-ft"><img src="' + imgSrc(f.foto) + '" alt="Imagem anexada"><button type="button" class="bt ic-so" data-act="bs-foto-x" title="Tirar a imagem" aria-label="Tirar a imagem">' + ic('x') + '</button></span>'
    : '<label class="bt">' + ic('imagem') + 'Escolher imagem<input type="file" accept="image/*" data-bsfoto-in hidden></label>') + '</div><small class="cl-nt">Um print da tela ou uma foto do que aconteceu.</small>';
}
DD_AO.bs = (k, v) => { if (!S.fm) return; S.fm[k] = v; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); };
/* a imagem fica até 240 KB, como no EFClaudian (lado maior 1280 px, fundo branco para print com transparência) */
function bsReduz(arq) {
  return new Promise((ok, erro) => {
    const r = new FileReader(); r.onerror = () => erro(new Error('Não deu para ler a imagem.'));
    r.onload = () => { const im = new Image(); im.onerror = () => erro(new Error('Esse arquivo não é uma imagem.')); im.onload = () => {
      let lado = 1280, q = .82, url = '';
      for (let n = 0; n < 8; n++) { const k = Math.min(1, lado / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(im.width * k)); cv.height = Math.max(1, Math.round(im.height * k));
        const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0, cv.width, cv.height); url = cv.toDataURL('image/jpeg', q); if (url.length <= BS_FOTO_MAX) break; q = Math.max(.5, q - .08); lado = Math.round(lado * .85); }
      url.length <= BS_FOTO_MAX ? ok(url) : erro(new Error('A imagem ficou grande demais. Tente um print menor.')); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
document.addEventListener('change', async e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-bsfoto-in') || !S.fm || !t.files || !t.files.length) return;
  const a = t.files[0]; t.value = '';
  try { const u = await bsReduz(a); if (!S.fm) return; S.fm.foto = u; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); } catch (er) { lcErro(er.message); }
});
const bsAparelho = () => (innerWidth < 860 ? 'celular' : 'computador') + ' · ' + innerWidth + '×' + innerHeight;
async function bsNovoOk() {
  const f = S.fm, u = S.user; if (!f || !u) return;
  const tit = String(f.titulo || '').trim(), desc = String(f.desc || '').trim();
  if (tit.length < 4) return lcErro('Escreva um título curto (pelo menos 4 letras).');
  if (desc.length < 8) return lcErro('Conte um pouco mais na descrição (pelo menos 8 letras).');
  if (!lcTravar()) return;
  const ts = nowISO(), numero = S.bugs.reduce((m, b) => Math.max(m, Number(b.numero) || 0), 0) + 1, id = 'bg' + uid(), bug = f.tipo !== 'sugestao';
  const o = { numero: numero, tipo: bug ? 'bug' : 'sugestao', area: f.area || 'geral', titulo: tit, descricao: desc, foto: '', status: 'novo', versao: bsVersao(), app: 'efcwork', tela: f.tela || '', aparelho: bsAparelho(),
    porId: u.id, porNome: u.nome, ts: ts, hist: [{ ts: ts, porNome: u.nome, status: 'novo', texto: 'Enviado' }] };
  try {
    if (f.foto) { try { await Data.col('sv2_bugs_foto').set(id, { bugId: id, dataUrl: f.foto, porId: u.id, ts: ts }); S._bsFotos[id] = f.foto; o.temFoto = true; }
      catch (er) { if (!(er && er.code === 'permission-denied')) throw er; o.foto = f.foto; console.warn('sv2_bugs_foto sem regra: a imagem vai dentro do relato'); } }
    await Data.col('sv2_bugs').set(id, o);
    if (!S.bugs.some(b => b.id === id)) S.bugs.push(Object.assign({ id: id }, o));
    const para = S.users.filter(x => isPrincipal(x) && !x.bloqueado && x.id !== u.id).map(x => x.id);
    if (para.length) Notif.send({ nivel: bug ? 'aviso' : 'info', titulo: (bug ? 'Problema reportado' : 'Sugestão nova') + ' · nº ' + numero, texto: u.nome + ': ' + tit, para: para, refTipo: 'bug', refId: id }).catch(() => {});
    Audit.log({ acao: bug ? 'bug_reportar' : 'sugestao_enviar', entidade: 'bug', entidadeId: id, resumo: 'Nº ' + numero + ' · ' + tit });
    lcFim(); aviso(bug ? 'Problema enviado. Obrigado!' : 'Sugestão enviada. Obrigado!');
  } catch (er) { if (S.fm) S.fm._trava = 0; lcErro(svErro(er)); }
}

/* ---------- detalhe ---------- */
function bsFotoDe(b) { const f = String((b && (b.foto || S._bsFotos[b.id])) || ''); return imgSrc(f) ? f : ''; }
function bsFotoCarrega(b) { if (!b || !b.temFoto || b.foto || S._bsFotos[b.id] !== undefined) return Promise.resolve();
  S._bsFotos[b.id] = ''; return Data.col('sv2_bugs_foto').get(b.id).then(d => { S._bsFotos[b.id] = (d && d.dataUrl) || ''; }).catch(() => { delete S._bsFotos[b.id]; }); }
function bsAbre(id) { S._bsGv = id; const b = bsDe(id); gvAbrir(() => bsGaveta(id)); if (b && b.temFoto && !bsFotoDe(b)) bsFotoCarrega(b).then(() => { if (S._bsGv === id && S.gv) gvDesenha(); }); }
function bsEtapas(b) {
  const es = (b.hist || []).map((h, i) => ({ nome: i === 0 ? 'Enviado por ' + (h.porNome || b.porNome || '') : (BS_SIT[h.status] || [h.status || ''])[0], feito: true, data: h.ts ? diaLocal(h.ts) : '', txt: i === 0 ? '' : h.texto || '', quem: i === 0 ? '' : [h.porNome, h.ts ? fmtDT(h.ts) : ''].filter(Boolean).join(' · ') }));
  if (bsAberto(b)) es.push({ nome: 'Resposta do Administrador', feito: false, atual: true, txt: 'resolvido em uma versão ou não procede, com o motivo' });
  return es;
}
function bsGaveta(id) {
  const b = bsDe(id); if (!b) { S._bsGv = null; return null; }
  const f = bsFotoDe(b);
  let c = '<p class="bs-desc">' + esc(b.descricao || '') + '</p>';
  if (f) c += '<div class="ap-gal"><button type="button" class="ap-fi" data-act="bs-foto-ver" data-id="' + esc(b.id) + '"><img src="' + imgSrc(f) + '" alt="Imagem anexada"></button></div>';
  else if (b.temFoto) c += '<p class="cl-nt">' + (S._bsFotos[b.id] === '' ? 'Carregando a imagem…' : 'Não deu para carregar a imagem agora.') + '</p>';
  c += gvCampos([['Quem', b.porNome || ''], ['Quando', b.ts ? fmtDT(b.ts) : ''], ['Parte do app', bsAreaNome(b.area) + (b.tela ? ' (' + esc(b.tela) + ')' : '')], ['Versão', b.versao || ''], ['Aparelho', b.aparelho || ''], ['Resolvido na versão', b.versaoResolvido || '']]);
  c += '<p class="gv-h">Andamento</p>' + tlFluido('bs' + b.id, bsEtapas(b));
  let pe = '';
  if (bsPode()) pe = bsAberto(b) ? (b.status !== 'analise' ? '<button type="button" class="bt" data-act="bs-sit" data-id="' + esc(b.id) + '" data-s="analise">Em análise</button>' : '') +
      '<button type="button" class="bt" data-act="bs-sit" data-id="' + esc(b.id) + '" data-s="naoprocede">Não procede</button><button type="button" class="bt pr" data-act="bs-sit" data-id="' + esc(b.id) + '" data-s="resolvido">' + ic('ok') + 'Resolvido</button>'
    : '<button type="button" class="bt" data-act="bs-sit" data-id="' + esc(b.id) + '" data-s="analise">Reabrir</button>';
  return { ico: b.tipo === 'sugestao' ? 'mais' : 'alerta', sub: 'Nº ' + bsNum(b) + ' · ' + bsAreaNome(b.area), titulo: b.titulo || '', pill: bsTipoPill(b) + ' ' + bsSitPill(b), corpo: c, rodape: pe ? '<div class="ap-pe">' + pe + '</div>' : '' };
}

/* ---------- mudar a situação (só o Administrador) ---------- */
const BS_ST_TIT = { analise: 'Em análise', naoprocede: 'Não procede', resolvido: 'Resolvido' };
LC_FORM.bsSit = f => { const b = bsDe(f.id); if (!b) return null; const re = !bsAberto(b) && f.st === 'analise';
  const c = lcMsg() + (f.st === 'resolvido' ? lcBl('Resolvido na versão', lcIn('ver', f.ver, ' maxlength="40" placeholder="ex.: EFCwork v0.6.16"')) : '') +
    lcBl(f.st === 'naoprocede' ? 'Motivo' : 'Resposta', lcTx('txt', f.txt, f.st === 'naoprocede' ? 'obrigatório · vai para quem reportou' : 'opcional · vai para quem reportou')) +
    lcAv(b.porNome && b.porId !== S.user.id ? esc(b.porNome) + ' recebe o aviso no sino.' : 'Fica no andamento do relato.');
  return { ico: f.st === 'resolvido' ? 'ok' : 'lapis', sub: 'Nº ' + bsNum(b) + ' · ' + b.titulo, titulo: re ? 'Reabrir' : BS_ST_TIT[f.st], corpo: c, rodape: lcPe('bs-sit-ok', re ? 'Reabrir' : 'Salvar') }; };
async function bsSitOk() {
  const f = S.fm, b = f && bsDe(f.id); if (!b || !bsPode() || !BS_SIT[f.st]) return lcErro('Só o Administrador muda a situação.');
  const txt = String(f.txt || '').trim(), ver = String(f.ver || '').trim(), st = f.st, re = !bsAberto(b) && st === 'analise';
  if (st === 'naoprocede' && txt.length < 3) return lcErro('Escreva o motivo de não proceder.');
  if (st === 'resolvido' && !ver) return lcErro('Diga em qual versão foi resolvido.');
  if (!lcTravar()) return;
  const ts = nowISO(), passo = { ts: ts, porNome: S.user.nome, status: st, texto: (re ? 'Reaberto' + (txt ? ': ' : '') : '') + txt + (st === 'resolvido' ? (txt ? ' · ' : '') + 'versão ' + ver : '') };
  const p = { status: st, atualizadoEm: ts, atualizadoPor: S.user.nome }; if (st === 'resolvido') p.versaoResolvido = ver;
  if (st === 'resolvido' || st === 'naoprocede') p.finalizadoEm = ts; else p.finalizadoEm = ''; /* ITEM 57: a data guardada como finalizado */
  try {
    await Data.col('sv2_bugs').push(b.id, 'hist', passo, p); Object.assign(b, p, { hist: (b.hist || []).concat([passo]) });
    if (b.porId && b.porId !== S.user.id) Notif.send({ nivel: 'info', titulo: (b.tipo === 'sugestao' ? 'Sua sugestão' : 'Seu problema reportado') + ' nº ' + bsNum(b) + ': ' + (re ? 'reaberto' : BS_SIT[st][0]), texto: b.titulo + (txt ? ' — ' + txt : '') + (st === 'resolvido' ? ' (versão ' + ver + ')' : ''), para: [b.porId], refTipo: 'bug', refId: b.id }).catch(() => {});
    Audit.log({ acao: 'bug_situacao', entidade: 'bug', entidadeId: b.id, resumo: 'Nº ' + bsNum(b) + ' → ' + (re ? 'reaberto' : BS_SIT[st][0]) + (txt ? ' (' + txt + ')' : ''), antes: { status: b.status }, depois: { status: st } });
    lcFim(); aviso('Situação atualizada.');
  } catch (er) { if (S.fm) S.fm._trava = 0; lcErro(svErro(er)); }
}

/* ---------- relatório (A4 deitado): os relatos da tabela, com descrição, andamento e imagem — para mandar para a IA avaliar ---------- */
async function bsPdf() {
  const cfg = TB[S._bsFin ? 'bs-fin' : 'bs-lista'], l = cfg ? tbFiltrar(cfg) : []; if (!l.length) { aviso('Nada para imprimir com este filtro.'); return; }
  if (l.some(b => b.temFoto && !bsFotoDe(b))) { aviso('Carregando as imagens…'); await Promise.all(l.map(bsFotoCarrega)); }
  const kv = (k, v) => v ? '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>' : '', e = S.empresa || {};
  const html = '<div class="bs-imp"><div class="au-ic"><b>Bugs e sugestões</b><span>' + esc([e.nome, l.length + (l.length === 1 ? ' relato' : ' relatos'), 'emitido em ' + fmtD(hojeISO()) + ' por ' + S.user.nome, bsVersao()].filter(Boolean).join(' · ')) + '</span></div>' +
    l.map(b => '<div class="bs-it"><div class="bs-ih"><b>Nº ' + esc(bsNum(b)) + ' · ' + esc((BS_TIPOS[b.tipo] || BS_TIPOS.bug)[0]) + '</b> ' + esc(b.titulo || '') + '<span>' + esc((BS_SIT[b.status || 'novo'] || BS_SIT.novo)[0]) + '</span></div>' +
      '<div class="bs-ic"><table class="bs-kv">' + kv('Parte do app', bsAreaNome(b.area) + (b.tela ? ' (' + esc(b.tela) + ')' : '')) + kv('Data', b.ts ? fmtDT(b.ts) : '') + kv('Quem', b.porNome) + kv('Versão', b.versao) + kv('Aparelho', b.aparelho) + kv('Resolvido na', b.versaoResolvido) + '</table>' +
      '<div class="bs-id"><p>' + esc(b.descricao || '').replace(/\n/g, '<br>') + '</p>' + ((b.hist || []).length > 1 ? '<ul>' + b.hist.map(h => '<li>' + esc((h.ts ? fmtDT(h.ts) : '') + ' · ' + (h.porNome || '') + ' · ' + ((BS_SIT[h.status] || [h.status || ''])[0]) + (h.texto ? ' — ' + h.texto : '')) + '</li>').join('') + '</ul>' : '') + '</div>' +
      (bsFotoDe(b) ? '<img class="bs-if" src="' + imgSrc(bsFotoDe(b)) + '" alt="">' : '') + '</div></div>').join('') + '</div>';
  Audit.log({ acao: 'imprimir', entidade: 'bug', entidadeId: 'relatorio', resumo: 'Relatório de Bugs e sugestões (' + esc(l.length) + ' relatos)' });
  nqImprimir(html, APP_NOME + ' · Bugs e sugestões · ' + fmtD(hojeISO()), true);
}

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="bs-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'bs-novo') bsNovo(id);
  else if (a === 'bs-novo-ok') bsNovoOk();
  else if (a === 'bs-foto-x') { if (S.fm) { S.fm.foto = ''; S.fm.sujo = true; gvDesenha(true); } }
  else if (a === 'bs-foto-ver') { const b = bsDe(id), f = bsFotoDe(b); if (f) fedVer({ src: f, marcas: [], titulo: 'Imagem do relato nº ' + bsNum(b), nome: 'relato_' + bsNum(b) }); }
  else if (a === 'bs-sit') { const b = bsDe(id), st = t.getAttribute('data-s'); if (b && bsPode()) lcAbrir({ k: 'bsSit', id: b.id, st: st, txt: '', ver: st === 'resolvido' ? (b.app === 'efcwork' ? bsVersao() : '') : '' }, () => bsAbre(b.id)); }
  else if (a === 'bs-sit-ok') bsSitOk();
  else if (a === 'bs-pdf') bsPdf();
  else if (a === 'bs-fin') { S._bsFin = !S._bsFin; render(); }
});
BG_FONTES.push(q => S.bugs.filter(b => bgCasa(q, [bsNum(b), b.titulo, b.descricao, b.porNome].join(' '))).slice(0, 6).map(b => ({ grupo: 'Bugs e sugestões', nome: 'Nº ' + bsNum(b) + ' · ' + b.titulo, sub: (BS_SIT[b.status || 'novo'] || BS_SIT.novo)[0] + ' · ' + (b.porNome || ''), ico: 'alerta',
  abrir: () => { if (S.rota.area !== 'qualidade' || S.rota.aba !== 'bugs') { S._gvNav = true; ir('qualidade', 'bugs'); } bsAbre(b.id); } })));
/* Esc nos Finalizados volta para os em aberto (uma camada de cada vez: gaveta, menu e lista aberta vêm antes) */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.defaultPrevented || !S._bsFin || S.rota.area !== 'qualidade' || S.rota.aba !== 'bugs' || (S.camadas && S.camadas.length) || S.tbMenu || document.querySelector('.dd-l:not([hidden]):not(.dd-fant)')) return;
  S._bsFin = false; render();
}, true); /* na captura: roda antes do voltar das camadas, que só age quando há camada, menu ou lista aberta */
