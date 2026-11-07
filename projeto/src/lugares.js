/* EFCwork · lugares.js — ONDE CADA COISA FICA (v0.3.5, pedido do Elias de 06/11 08:19).
   Equipamentos e vidrarias têm o lugar de GUARDA (gaveta, porta/armário) e o lugar de USO (bancada, suporte de vidrarias).
   Ex.: micropipeta reserva guardada na Gaveta 02 para substituir a da Bancada 1 quando ela der problema; um novato vê onde cada uma está.
   Formato compatível com o EFClaudian: equipamento = `local` (laboratório) + `posicao` (onde está agora) + `situacao` 'ativo'/'armazenado'
   (+ `guardadoEm`); vidraria = `qtdLocal` por laboratório + `qtdGuard` (quantas guardadas). Campos novos (o EFClaudian ignora):
   `posGuarda` e `posUso` (os dois lugares de referência do equipamento) e `qtdPos` {laboratório: {lugar: qtd}} da vidraria. Prefixo: lg. */
const LG_GUARDA_RE = /^(gaveta|porta|arm[aá]rio|caixa|prateleira|estoque|almox|guarda)/i;
const lgTipo = l => LG_GUARDA_RE.test(String(l || '').trim()) ? 'guarda' : 'uso';
const lgNome = l => { const s = String(l || '').trim().replace(/\s+/g, ' '); if (!s) return ''; const b = s.toLowerCase(); return b.charAt(0).toUpperCase() + b.slice(1); };
const LG_USO_PADRAO = ['Bancada', 'Suporte de vidrarias']; /* só sugestões iniciais; a lista cresce com o que for usado */
/* todos os lugares já usados (materiais, equipamentos, vidrarias), menos os tirados da lista pela pessoa */
function lgLugares(tipo) {
  const v = {}, add = l => { const n = lgNome(l); if (n) v[tbNorm(n)] = v[tbNorm(n)] || n; };
  S.almItens.forEach(i => add(i.local));
  S.almEq.forEach(e => { add(e.posicao); add(e.posGuarda); add(e.posUso); Object.keys(e.qtdPos || {}).forEach(lab => Object.keys(e.qtdPos[lab] || {}).forEach(add)); });
  LG_USO_PADRAO.forEach(d => { if (!Object.keys(v).some(k => k.indexOf(tbNorm(d)) === 0)) add(d); });
  const oc = (((S.almPref || {}).lugOcultos) || []).map(tbNorm);
  return Object.keys(v).map(k => v[k]).filter(n => oc.indexOf(tbNorm(n)) < 0 && (!tipo || lgTipo(n) === tipo)).sort(cgCmpLocal);
}
/* campo de lugar: janela retrátil com os já usados (segurar 1,5 s e arrastar para tirar) ou "Outro lugar" */
function lgCampo(campo, f, tipo, dica) {
  const v = f[campo] || '', l = lgLugares(tipo), tem = l.some(x => tbNorm(x) === tbNorm(v)), sel = v === '__outro' || (v && !tem) ? '__outro' : v;
  return ddHTML('lc:lg~' + campo, sel, [['', 'Escolha o lugar']].concat(l.map(x => [x, x])).concat([['__outro', 'Outro lugar']]), { remover: true }) +
    (sel === '__outro' ? lcIn(campo + 'Txt', f[campo + 'Txt'] != null ? f[campo + 'Txt'] : (v !== '__outro' ? v : ''), ' placeholder="' + esc(dica || 'Ex.: Gaveta 03, Porta 05, Bancada 1') + '"') : '');
}
const lgValor = (f, campo) => lgNome(f[campo] === '__outro' || (f[campo] && !lgLugares().some(x => tbNorm(x) === tbNorm(f[campo]))) ? (f[campo + 'Txt'] != null ? f[campo + 'Txt'] : f[campo] === '__outro' ? '' : f[campo]) : f[campo]);
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; if (f && k.indexOf('lg~') === 0) { const c = k.slice(3); f[c] = v; f[c + 'Txt'] = undefined; f.sujo = true; f.msg = ''; gvDesenha(true); if (v === '__outro') { const i = $('#gv [data-fm="' + c + 'Txt"]'); if (i) i.focus(); } return; } ant(k, v); }; })(DD_AO.lc);
DD_RM.lc = (function (ant) { return (k, v) => { if (k.indexOf('lg~') === 0) { const oc = (((S.almPref || {}).lugOcultos) || []).slice(); oc.push(v); alPrefGravar({ lugOcultos: oc }); const f = S.fm, c = k.slice(3); if (f && f[c] === v) f[c] = ''; gvDesenha(true); aviso('"' + v + '" saiu da sua lista de lugares.'); return; } ant(k, v); }; })(DD_RM.lc);

/* ---------- leitura ---------- */
const lgGuardado = e => e.situacao === 'armazenado';
const lgLabs = e => Object.keys(e.qtdLocal || {}).filter(k => Number(e.qtdLocal[k]) > 0 || Object.keys((e.qtdPos || {})[k] || {}).length);
/* distribuição da vidraria num laboratório: [{lugar, qtd, tipo}] + o que está sem lugar definido */
function lgDist(e, lab) {
  const tot = Number((e.qtdLocal || {})[lab]) || 0, pos = (e.qtdPos || {})[lab] || {}, l = Object.keys(pos).filter(k => Number(pos[k]) > 0).map(k => ({ lugar: k, qtd: Number(pos[k]), tipo: lgTipo(k) })).sort((a, b) => cgCmpLocal(a.lugar, b.lugar));
  const soma = l.reduce((s, x) => s + x.qtd, 0); if (tot - soma > 0) l.push({ lugar: '', qtd: alR(tot - soma), tipo: '' });
  return l;
}
/* o texto curto da coluna Local (pedido de 06/11: só o lugar; o resto fica na gaveta) */
function lgCurto(e) {
  if (e.tipo === 'qtd') { const l = []; lgLabs(e).forEach(lab => lgDist(e, lab).forEach(x => l.push(x.lugar || lab))); const u = Array.from(new Set(l)); return u.length === 1 ? u[0] : u.length ? u.length + ' lugares' : ''; }
  return (e.transito ? 'Em trânsito' : lgNome(e.posicao) || e.local || '');
}
/* outros iguais a este (mesmo nome): onde estão — para achar a reserva */
const lgIguais = e => S.almEq.filter(x => x.id !== e.id && x.situacao !== 'baixa' && x.tipo !== 'qtd' && tbNorm(x.nome).trim() === tbNorm(e.nome).trim());
function lgOndeHTML(e) { return lgPendHTML(e) + lgOndeHTML0(e); }
function lgOndeHTML0(e) {
  if (e.tipo === 'qtd') {
    const labs = lgLabs(e); if (!labs.length) return '';
    return '<p class="gv-h">Onde ficam</p>' + labs.map(lab => '<div class="lg-lab">' + (labs.length > 1 || lab ? '<small>' + esc(lab || 'Sem laboratório') + ' · ' + alQ((e.qtdLocal || {})[lab] || 0) + '</small>' : '') + '<div class="gv-lotes">' + lgDist(e, lab).map(x => '<div class="gv-lote lg-l"><span>' + ic(x.tipo === 'guarda' ? 'guarda' : x.tipo === 'uso' ? 'bancada' : 'alerta') + '<b>' + esc(x.lugar || 'Sem lugar definido') + '</b>' + (x.tipo ? '<em class="lg-tp ' + x.tipo + '">' + (x.tipo === 'guarda' ? 'guardadas' : 'em uso') + '</em>' : '') + '</span><b class="num">' + alQ(x.qtd) + '</b></div>').join('') + '</div></div>').join('');
  }
  const g = lgGuardado(e), agora = lgNome(e.posicao), ig = lgIguais(e);
  let h = '<p class="gv-h">Onde está</p><div class="lg-onde"><div class="lg-agora ' + (g ? 'guarda' : 'uso') + '">' + ic(g ? 'guarda' : 'bancada') + '<div><small>' + (e.transito ? 'Em trânsito' : g ? 'Guardado' : 'Em uso') + (e.local ? ' · ' + esc(e.local) : '') + '</small><b>' + esc(agora || 'Lugar não informado') + '</b></div></div>' +
    '<dl class="gv-fl lg-ref"><dt>Quando guardado</dt><dd>' + esc(lgNome(e.posGuarda) || (g && agora) || '—') + '</dd><dt>Quando em uso</dt><dd>' + esc(lgNome(e.posUso) || (!g && agora) || '—') + '</dd></dl></div>';
  if (ig.length) h += '<p class="gv-h">Iguais a este · ' + ig.length + '</p><div class="gv-lotes">' + ig.slice(0, 6).map(x => '<button type="button" class="gv-lote lg-ig" data-act="al-eq" data-id="' + esc(x.id) + '"><span>' + ic(lgGuardado(x) ? 'guarda' : 'bancada') + '<b>' + esc(x.tag || x.nome) + '</b><em class="lg-tp ' + (lgGuardado(x) ? 'guarda' : 'uso') + '">' + (lgGuardado(x) ? 'reserva guardada' : 'em uso') + '</em></span><small>' + esc(lgNome(x.posicao) || x.local || '') + '</small></button>').join('') + '</div>';
  return h;
}
/* botões da gaveta do equipamento */
function lgBotoes(e) {
  if (typeof alPode !== 'function' || !alPode() || e.situacao === 'baixa' || e.transito) return '';
  if (e.tipo === 'qtd') return lgLabs(e).length ? '<button type="button" class="bt" data-act="lg-dist" data-id="' + esc(e.id) + '">' + ic('pino') + 'Mudar os lugares</button>' : '';
  return lgGuardado(e) ? '<button type="button" class="bt" data-act="lg-usar" data-id="' + esc(e.id) + '">' + ic('bancada') + 'Pôr em uso</button>' : '<button type="button" class="bt" data-act="lg-guardar" data-id="' + esc(e.id) + '">' + ic('guarda') + 'Guardar</button>';
}
const lgCab = e => typeof alPode === 'function' && alPode() && e.tipo !== 'qtd' && e.situacao !== 'baixa' ? '<button type="button" class="bt ic-so" data-act="lg-ref" data-id="' + esc(e.id) + '" title="Lugares de guarda e de uso" aria-label="Lugares de guarda e de uso">' + ic('pino') + '</button>' : '';
/* calibração ao pôr em uso (como no EFClaudian: guardado pausa a calibração) */
function lgCalProblema(e) {
  if (!e.precisaCal) return ''; const c = e.cal || {}; if (!c.ultima) return 'nunca foi calibrado';
  const p = eqProxima(e); return p && p < hojeISO() ? 'calibração vencida em ' + fmtD(p) : '';
}

/* ---------- formulários ---------- */
const lgEq = f => S.almEq.find(x => x.id === f.eqId) || null;
LC_FORM.lgguardar = f => { const e = lgEq(f); if (!e) return null; return { ico: 'guarda', sub: 'Guardar · ' + (e.local || ''), titulo: eqNomeC(e), corpo: lcMsg() +
  lcAv('Fica guardado' + (e.precisaCal ? ' e a calibração fica pausada enquanto estiver guardado' : '') + '. Quem procurar vê onde ele está.') +
  lcBl('Onde vai ficar guardado', lgCampo('lugar', f, 'guarda', 'Ex.: Gaveta 02, Porta 05')) + lgPorque(f, 'Ex.: reserva da Bancada 1; voltou da manutenção'), rodape: lcPe('lg-guardar-ok', lgPrecisaPedir() ? 'Pedir para guardar' : 'Guardar') }; };
LC_FORM.lgusar = f => { const e = lgEq(f); if (!e) return null; const pb = lgCalProblema(e); return { ico: 'bancada', sub: 'Pôr em uso · ' + (e.local || ''), titulo: eqNomeC(e), corpo: lcMsg() +
  (pb ? lcAv('Atenção: ' + esc(pb) + '. Ele entra como <b>Uso com restrição</b> e os seus superiores são avisados.', 'cr') : '') +
  lcBl('Onde vai ficar em uso', lgCampo('lugar', f, 'uso', 'Ex.: Bancada 1, Suporte de vidrarias')) + lgPorque(f, 'Ex.: substitui a MP-01, que deu problema'), rodape: lcPe('lg-usar-ok', lgPrecisaPedir() ? 'Pedir para pôr em uso' : 'Pôr em uso') }; };
LC_FORM.lgref = f => { const e = lgEq(f); if (!e) return null; return { ico: 'pino', sub: 'Lugares · ' + (e.local || ''), titulo: eqNomeC(e), corpo: lcMsg() +
  lcAv('Os dois lugares de referência: onde ele fica quando está guardado e onde fica quando está em uso. Guardar e Pôr em uso já vêm com eles.') +
  lcBl('Quando guardado', lgCampo('pg', f, 'guarda')) + lcBl('Quando em uso', lgCampo('pu', f, 'uso')) + lgPorque(f, 'Ex.: mudou de armário'), rodape: lcPe('lg-ref-ok', lgPrecisaPedir() ? 'Pedir a mudança' : 'Guardar lugares') }; };
LC_FORM.lgdist = f => { const e = lgEq(f); if (!e) return null; const labs = lgLabs(e), tot = Number((e.qtdLocal || {})[f.lab]) || 0, soma = f.d.reduce((s, x) => s + (alNum(x.q) || 0), 0), sobra = alR(tot - soma);
  return { ico: 'pino', sub: 'Onde ficam · vidraria', titulo: e.nome, corpo: lcMsg() +
    (labs.length > 1 ? lcBl('Laboratório', ddHTML('lc:lgLab', f.lab, labs.map(l => [l, l + ' · ' + alQ(e.qtdLocal[l])]))) : '') +
    gvNums([[alQ(tot), 'no ' + (f.lab || 'laboratório')], [alQ(soma), 'com lugar'], [alQ(Math.abs(sobra)), sobra < 0 ? 'passou do total' : 'sem lugar', sobra < 0 ? 'cr' : sobra > 0 ? 'wa' : '']]) +
    '<div class="lg-dl">' + f.d.map((x, n) => '<div class="lg-dr">' + lgCampo('d.' + n + '.l', x.__f || (x.__f = { ['d.' + n + '.l']: x.l }), '') + '<input class="fm-i num" data-fm="d.' + n + '.q" inputmode="decimal" autocomplete="off" value="' + esc(x.q) + '" aria-label="Quantidade"><button type="button" class="bt ic-so" data-act="lg-dist-rm" data-n="' + n + '" title="Tirar este lugar" aria-label="Tirar este lugar">' + ic('lixo') + '</button></div>').join('') + '</div>' +
    '<button type="button" class="bt lg-add" data-act="lg-dist-add">' + ic('mais') + 'Mais um lugar</button>' +
    '<p class="cg-ob">Para mudar o total, use o Inventário. Aqui só se diz onde cada uma está.</p>' + lgPorque(f, 'Ex.: separei 4 para o suporte da bancada'), rodape: lcPe('lg-dist-ok', lgPrecisaPedir() ? 'Pedir a mudança' : 'Guardar') }; };
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; if (f && k === 'lgLab') { f.lab = v; f.d = lgDistForm(lgEq(f), v); f.sujo = true; f.msg = ''; gvDesenha(true); return; } ant(k, v); }; })(DD_AO.lc);
const lgDistForm = (e, lab) => { const l = lgDist(e, lab).filter(x => x.lugar).map(x => ({ l: x.lugar, q: String(x.qtd) })); return l.length ? l : [{ l: '', q: '' }]; };

/* ---------- gravar ----------
   v0.3.6 (decisão do Elias de 06/11 09:07): o Colaborador pode guardar, pôr em uso e mudar os lugares, mas cada operação fica
   AGUARDANDO CONFIRMAÇÃO (pedido em sv2_aprov, com o porquê) até o Elias ou um líder ★ confirmar; ele pode usar o equipamento
   normalmente, só o registro espera. Quem grava no equipamento é quem confirma (as regras do Firestore só deixam o líder ★/Principal
   gravar posGuarda, posUso e qtdPos). O líder ★/Administrador aplica na hora. */
const LG_ACAO = { lg_guardar: 'Guardar', lg_usar: 'Pôr em uso', lg_ref: 'Lugares de guarda e de uso', lg_dist: 'Mudar os lugares' };
const lgPendentes = e => S.aprov.filter(a => a.status === 'pendente' && a.tipo === 'almox' && a.payload && a.payload.refId === e.id && LG_ACAO[a.payload.acao]);
const lgPrecisaPedir = () => !alSup();
/* monta a mudança a partir do pedido e do equipamento como ele está AGORA (na hora de aplicar) */
function lgMontar(p, e) {
  const quem = p.porNome ? ' (pedido de ' + p.porNome + ')' : '', por = p.motivo ? ' — ' + p.motivo : '';
  if (p.acao === 'lg_guardar') { const patch = { situacao: 'armazenado', guardadoEm: hojeISO(), posicao: p.lugar, posGuarda: p.lugar }; if (!e.posUso && e.posicao && !lgGuardado(e)) patch.posUso = lgNome(e.posicao);
    return { patch: patch, ev: { tipo: 'guardar', texto: 'Guardado em ' + p.lugar + por + quem, antes: { situacao: e.situacao || 'ativo', posicao: e.posicao || '' } }, resumo: 'guardado em ' + p.lugar + quem, ok: eqNomeC(e) + ' guardado em ' + p.lugar + '.' }; }
  if (p.acao === 'lg_usar') { const pb = lgCalProblema(e), patch = { situacao: pb ? 'restricao' : 'ativo', guardadoEm: '', posicao: p.lugar, posUso: p.lugar }; if (!e.posGuarda && e.posicao && lgGuardado(e)) patch.posGuarda = lgNome(e.posicao);
    return { patch: patch, pb: pb, ev: { tipo: 'usar', texto: 'Posto em uso em ' + p.lugar + (pb ? ' (' + pb + ': uso com restrição)' : '') + por + quem, antes: { situacao: e.situacao || '', posicao: e.posicao || '' } }, resumo: 'posto em uso em ' + p.lugar + quem, ok: eqNomeC(e) + ' em uso na ' + p.lugar + (pb ? ' (com restrição)' : '') + '.' }; }
  if (p.acao === 'lg_ref') { const patch = { posGuarda: p.pg, posUso: p.pu }, cur = lgGuardado(e) ? p.pg : p.pu; if (cur && tbNorm(cur) !== tbNorm(e.posicao || '')) patch.posicao = cur;
    return { patch: patch, ev: { tipo: 'lugares', texto: 'Lugares: guardado em ' + (p.pg || '—') + ' · em uso em ' + (p.pu || '—') + por + quem, antes: { posGuarda: e.posGuarda || '', posUso: e.posUso || '', posicao: e.posicao || '' } }, resumo: 'lugares de guarda e de uso' + quem, ok: 'Lugares guardados.' }; }
  if (p.acao === 'lg_dist') { const m = p.m, tot = Number((e.qtdLocal || {})[p.lab]) || 0, soma = Object.keys(m).reduce((s, k) => s + m[k], 0);
    if (soma > tot) throw new Error('A soma (' + alQ(soma) + ') passou do total do ' + p.lab + ' (' + alQ(tot) + '); o total mudou depois do pedido.');
    const pos = Object.assign({}, e.qtdPos || {}); pos[p.lab] = m; const gd = Object.assign({}, e.qtdGuard || {}); gd[p.lab] = Object.keys(m).filter(k => lgTipo(k) === 'guarda').reduce((s, k) => s + m[k], 0); if (!gd[p.lab]) delete gd[p.lab];
    const txt = Object.keys(m).map(k => k + ' ' + alQ(m[k])).join(' · ') + (tot - soma > 0 ? ' · sem lugar ' + alQ(tot - soma) : '');
    return { patch: { qtdPos: pos, qtdGuard: gd }, ev: { tipo: 'lugares', texto: p.lab + ': ' + txt + por + quem, antes: { qtdPos: e.qtdPos || {} } }, resumo: 'lugares no ' + p.lab + ': ' + txt + quem, ok: 'Lugares guardados.' }; }
  throw new Error('Operação desconhecida.');
}
async function lgAplicar(p, aprov) {
  const e = S.almEq.find(x => x.id === p.refId); if (!e) throw new Error('Equipamento não encontrado.');
  const r = lgMontar(Object.assign({}, p, aprov ? { porNome: aprov.solicitanteNome } : {}), e);
  const ev = Object.assign({ ts: nowISO(), porId: aprov ? aprov.solicitanteId : S.user.id, porNome: aprov ? aprov.solicitanteNome : S.user.nome, data: hojeISO() }, r.ev, aprov ? { confirmadoPor: S.user.nome, aprovId: aprov.id } : {});
  await Data.col('sv2_alm_equip').update(e.id, Object.assign({}, r.patch, { hist: (e.hist || []).concat([ev]), atualizadoEm: nowISO() }));
  Audit.log({ acao: 'equip_' + r.ev.tipo, entidade: 'almox_equip', entidadeId: e.id, resumo: eqNomeC(e) + ': ' + r.resumo + (aprov ? ' · confirmado por ' + S.user.nome : '') + (p.motivo ? ' — ' + p.motivo : ''), depois: r.patch, autorizadoPor: aprov ? S.user.nome : null });
  if (r.pb && !aprov) { const sp = supsOf(S.user).filter(id => id !== S.user.id); if (sp.length) Notif.send({ nivel: 'aviso', titulo: 'Em uso com restrição: ' + eqNomeC(e), texto: S.user.nome + ' pôs em uso um equipamento guardado: ' + r.pb + '. Lugar: ' + p.lugar + '.', para: sp, refTipo: 'equip', refId: e.id }).catch(() => {}); }
  return r.ok;
}
APROV_APLICA.almox = (function (ant) { return (p, a) => p && LG_ACAO[p.acao] ? lgAplicar(p, a) : ant(p, a); })(APROV_APLICA.almox);
/* líder ★/Administrador aplica; Colaborador pede (com o porquê) */
async function lgFazer(p, titulo) {
  const f = S.fm, e = lgEq(f); if (!e) return; p.refId = e.id; p.motivo = String(f.motivo || '').trim();
  if (lgPrecisaPedir()) {
    if (p.motivo.length < 3) return lcErro('Diga o porquê: quem confirma precisa saber.');
    if (lgPendentes(e).length) return lcErro('Já tem um pedido deste equipamento esperando confirmação.');
    if (!lcTravar()) return;
    const aid = await Aprov.pedir({ tipo: 'almox', titulo: titulo + ' · ' + eqNomeC(e), descricao: (p.lugar ? 'Lugar: ' + p.lugar + '. ' : '') + 'Por quê: ' + p.motivo, refTipo: 'almox', refId: p.acao + ':' + e.id, payload: p });
    if (aid) { lcFim(); aviso('Pedido enviado. Fica aguardando a confirmação; pode usar normalmente.'); } else lcErro('Não foi possível enviar o pedido.');
    return;
  }
  if (!lcTravar()) return;
  try { const ok = await lgAplicar(p, null); lcFim(); aviso(ok); } catch (er) { lcErro(er.message && !/permission/i.test(er.message) ? er.message : svErro(er)); }
}
function lgGuardarOk() { const f = S.fm; if (!lgEq(f) || !alPode()) return; const l = lgValor(f, 'lugar'); if (!l) return lcErro('Diga onde ele vai ficar guardado.'); lgFazer({ acao: 'lg_guardar', lugar: l }, 'Guardar em ' + l); }
function lgUsarOk() { const f = S.fm; if (!lgEq(f) || !alPode()) return; const l = lgValor(f, 'lugar'); if (!l) return lcErro('Diga onde ele vai ficar em uso.'); lgFazer({ acao: 'lg_usar', lugar: l }, 'Pôr em uso na ' + l); }
function lgRefOk() { const f = S.fm; if (!lgEq(f) || !alPode()) return; const pg = lgValor(f, 'pg'), pu = lgValor(f, 'pu'); if (!pg && !pu) return lcErro('Diga pelo menos um dos lugares.'); lgFazer({ acao: 'lg_ref', pg: pg, pu: pu }, 'Lugares de referência'); }
function lgDistOk() {
  const f = S.fm, e = lgEq(f); if (!e || !alPode()) return; const tot = Number((e.qtdLocal || {})[f.lab]) || 0, m = {};
  for (let n = 0; n < f.d.length; n++) {
    const x = f.d[n], l = lgValor(x.__f || {}, 'd.' + n + '.l') || lgNome(x.l), q = String(x.q || '').trim();
    if (!l && !q) continue; if (!l) return lcErro('Escolha o lugar da linha ' + (n + 1) + '.');
    const v = alNum(q); if (!(v > 0)) return lcErro('Quantidade inválida em ' + l + '.');
    const k = Object.keys(m).find(y => tbNorm(y) === tbNorm(l)) || l; m[k] = alR((m[k] || 0) + v);
  }
  const soma = Object.keys(m).reduce((s, k) => s + m[k], 0); if (soma > tot) return lcErro('Passou do total do ' + f.lab + ' (' + alQ(tot) + '). Para mudar o total, use o Inventário.');
  lgFazer({ acao: 'lg_dist', lab: f.lab, m: m }, 'Mudar os lugares no ' + f.lab);
}
/* bloco do porquê nos formulários (obrigatório para quem pede) */
function lgPorque(f, ex) {
  const e = lgEq(f), pede = lgPrecisaPedir(), sups = pede ? supsOf(S.user).map(nomeDe) : [];
  return (pede ? lcAv('Fica <b>aguardando a confirmação</b> de ' + esc(sups.join(', ') || 'um líder') + '. Pode usar normalmente: só o registro espera.', 'wa') : '') +
    (e && lgPendentes(e).length ? lcAv('Já tem um pedido deste equipamento esperando confirmação.', 'cr') : '') +
    lcBl(pede ? 'Por quê?' : 'Por quê', lcIn('motivo', f.motivo, ' placeholder="' + esc(ex) + '"'), pede ? 'obrigatório' : 'opcional');
}
/* pedidos esperando confirmação, na gaveta do equipamento */
function lgPendHTML(e) {
  const l = lgPendentes(e); if (!l.length) return '';
  return l.map(a => { const p = a.payload, pode = Aprov.podeDecidir(a);
    return '<div class="lg-pend"><div>' + ic('relogio') + '<span><b>Aguardando confirmação: ' + esc(LG_ACAO[p.acao]) + (p.lugar ? ' · ' + esc(p.lugar) : '') + '</b><small>' + esc(a.solicitanteNome) + ' · ' + fmtDT(a.ts) + (p.motivo ? ' · "' + esc(p.motivo) + '"' : '') + (pode ? '' : ' · com ' + esc((a.paraNomes || []).join(', '))) + '</small></span></div>' +
      (pode ? '<div class="lg-pb"><button type="button" class="bt" data-act="lg-rep" data-id="' + esc(a.id) + '">' + ic('x') + 'Recusar</button><button type="button" class="bt pr" data-act="lg-apr" data-id="' + esc(a.id) + '">' + ic('ok') + 'Confirmar</button></div>' : '') + '</div>'; }).join('');
}
/* o lugar escolhido em cada linha da distribuição fica no rascunho da própria linha */
DD_AO.lc = (function (ant) { return (k, v) => { const f = S.fm; const m = /^lg~d\.(\d+)\.l$/.exec(k); if (f && m && f.d) { const x = f.d[Number(m[1])]; x.__f = x.__f || {}; x.__f['d.' + m[1] + '.l'] = v; x.__f['d.' + m[1] + '.lTxt'] = undefined; if (v !== '__outro') x.l = v; f.sujo = true; f.msg = ''; gvDesenha(true); if (v === '__outro') { const i = $('#gv [data-fm="d.' + m[1] + '.lTxt"]'); if (i) i.focus(); } return; } ant(k, v); }; })(DD_AO.lc);
document.addEventListener('input', e => { const t = e.target, c = t && t.getAttribute && t.getAttribute('data-fm'), m = c && /^d\.(\d+)\.lTxt$/.exec(c); if (m && S.fm && S.fm.d) { const x = S.fm.d[Number(m[1])]; if (x) { x.__f = x.__f || {}; x.__f[c] = t.value; } } });

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="lg-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null, e = id && S.almEq.find(x => x.id === id);
  if (a === 'lg-guardar' && e) lcAbrir({ k: 'lgguardar', eqId: id, lugar: lgNome(e.posGuarda), motivo: '' }, volta);
  else if (a === 'lg-usar' && e) lcAbrir({ k: 'lgusar', eqId: id, lugar: lgNome(e.posUso), motivo: '' }, volta);
  else if (a === 'lg-apr') { t.disabled = true; Aprov.decidir(id, true).then(() => render()); }
  else if (a === 'lg-rep') lgRecusar(id);
  else if (a === 'lg-ref' && e) lcAbrir({ k: 'lgref', eqId: id, pg: lgNome(e.posGuarda) || (lgGuardado(e) ? lgNome(e.posicao) : ''), pu: lgNome(e.posUso) || (!lgGuardado(e) ? lgNome(e.posicao) : '') }, volta);
  else if (a === 'lg-dist' && e) { const lab = lgLabs(e)[0]; lcAbrir({ k: 'lgdist', eqId: id, lab: lab, d: lgDistForm(e, lab) }, volta); }
  else if (a === 'lg-dist-add' && S.fm) { S.fm.d.push({ l: '', q: '' }); S.fm.sujo = true; gvDesenha(true); }
  else if (a === 'lg-dist-rm' && S.fm) { S.fm.d.splice(Number(t.getAttribute('data-n')), 1); S.fm.d.forEach((x, n) => { if (x.__f) { const o = {}; Object.keys(x.__f).forEach(k => { o[k.replace(/^d\.\d+\./, 'd.' + n + '.')] = x.__f[k]; }); x.__f = o; } }); if (!S.fm.d.length) S.fm.d.push({ l: '', q: '' }); S.fm.sujo = true; gvDesenha(true); }
  else if (a === 'lg-guardar-ok') lgGuardarOk(); else if (a === 'lg-usar-ok') lgUsarOk(); else if (a === 'lg-ref-ok') lgRefOk(); else if (a === 'lg-dist-ok') lgDistOk();
});
/* a soma de cima se atualiza enquanto digita (sem redesenhar, para não perder o clique nem o foco) */
document.addEventListener('input', e => {
  const c = e.target && e.target.getAttribute && e.target.getAttribute('data-fm'); if (!(c && /^d\.\d+\.q$/.test(c) && S.fm && S.fm.k === 'lgdist')) return;
  const f = S.fm, eq = lgEq(f); if (!eq) return; const tot = Number((eq.qtdLocal || {})[f.lab]) || 0, soma = alR(f.d.reduce((s, x) => s + (alNum(x.q) || 0), 0)), sobra = alR(tot - soma), bx = $$('#gv .gv-kv > div'); if (bx.length < 3) return;
  bx[1].querySelector('b').textContent = alQ(soma); bx[2].querySelector('b').textContent = alQ(Math.abs(sobra)); bx[2].querySelector('small').textContent = sobra < 0 ? 'passou do total' : 'sem lugar'; bx[2].className = sobra < 0 ? 'cr' : sobra > 0 ? 'wa' : '';
});
/* recusar pela gaveta: pede o motivo numa linha (camada de formulário) */
LC_FORM.lgrep = f => { const a = S.aprov.find(x => x.id === f.aid); if (!a) return null; return { ico: 'x', icoCls: 'ini-cr', sub: 'Recusar pedido de ' + a.solicitanteNome, titulo: a.titulo, corpo: lcMsg() + lcAv(esc(a.descricao || '')) + lcBl('Por que recusa?', lcIn('motivoR', f.motivoR, ' placeholder="A pessoa recebe no sino"')), rodape: lcPe('lg-rep-ok', 'Recusar') }; };
function lgRecusar(aid) { const vol = S.gv && !S.gvForm ? S.gv : null; lcAbrir({ k: 'lgrep', aid: aid, motivoR: '' }, vol ? () => gvAbrir(vol) : null); }
document.addEventListener('click', ev => { const t = ev.target.closest && ev.target.closest('[data-act="lg-rep-ok"]'); if (!t || !S.fm) return; const m = String(S.fm.motivoR || '').trim(); if (m.length < 3) { lcErro('Escreva o motivo.'); return; } if (!lcTravar()) return; Aprov.decidir(S.fm.aid, false, m).then(ok => { if (ok) lcFim(); else lcErro('Não foi possível recusar.'); }); });
