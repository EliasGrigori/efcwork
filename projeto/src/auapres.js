/* EFCwork · auapres.js — Auditoria interna: apresentação (Nº 45) e relatório (v0.6.2). Prefixo: aua.
   Apresentação como no EFClaudian (tela cheia, uma NC por tela), com os pedidos do Elias: abre em qualquer etapa (também
   depois de enviada); escolhe "Todas" ou uma pessoa (entram as NCs em que ela é responsável ou corresponsável); corrige ali
   mesmo — texto, achado, local, responsável, corresponsáveis, lei, observação, sugestão, descrição do encarregado e uma
   segunda pontuação GUT. Cada correção entra em r.apresAlt (antes, depois, quem, quando), como no EFClaudian.
   Botões: 36 px no PC (Anterior e Próxima do tamanho do texto), 44 px no celular (os dois do mesmo tamanho).
   Relatório: o gráfico na folha 1 (rosca por gravidade e colunas por responsável), uma folha por NC com a 1ª visita e o
   retorno, e os índices no fim. Três jeitos de sair: completo, só o visual, só as folhas de um responsável. */

/* ordem do relatório e da apresentação (a do EFClaudian): Campo → Estrutura; por local na ordem em que apareceu; pelo número */
function auaOrdem(r) {
  const l = auNcs(r), pri = {}, ordA = a => { const i = AU_AREAS.findIndex(x => x[0] === a); return i < 0 ? 9 : i; };
  l.forEach(n => { const k = n.area + '|' + auNorm(n.local); if (pri[k] == null) pri[k] = n.n; });
  return l.sort((a, b) => ordA(a.area) - ordA(b.area) || pri[a.area + '|' + auNorm(a.local)] - pri[b.area + '|' + auNorm(b.local)] || a.n - b.n);
}
const auaDe = (n, p) => !p || p === '__todas' || auNorm(auResp(n)) === auNorm(p) || auCoresp(n).some(c => auNorm(c.nome) === auNorm(p));
const auaLista = (r, p) => auaOrdem(r).filter(n => auaDe(n, p));
function auaPessoas(r) { const m = new Map(); auNcs(r).forEach(n => [auResp(n)].concat(auCoresp(n).map(c => c.nome)).forEach(x => { const k = auNorm(x); if (!m.has(k)) m.set(k, x); }));
  return Array.from(m.values()).sort((a, b) => (a === 'Sem responsável') - (b === 'Sem responsável') || cmpTxt(a, b)); }
const auaPodeCorrigir = r => auPode(r) && auSit(r) !== 'fechada';

/* ---------- apresentação ---------- */
function auAprAbre(rid, p) {
  const r = auDe(rid); if (!r || !auNcs(r).length) return;
  S.auAp = { rid: rid, p: p || '__todas', i: 0, foto: 0, ed: null };
  csCamadaAbre('auap', () => { S.auAp = null; const x = $('#au-apr'); if (x) x.remove(); document.body.classList.remove('au-apr-on'); render(); });
  auAprDesenha();
}
function auAprDesenha() {
  const A = S.auAp; if (!A) return; const r = auDe(A.rid); if (!r) return;
  const ls = auaLista(r, A.p); A.i = Math.max(0, Math.min(A.i, ls.length - 1)); const n = ls[A.i];
  let d = $('#au-apr'); if (!d) { d = document.createElement('div'); d.id = 'au-apr'; d.className = 'au-apr'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Apresentação da RNC'); document.body.appendChild(d); document.body.classList.add('au-apr-on'); }
  const ps = auaPessoas(r), opc = [['__todas', 'Todas as NCs · ' + auNcs(r).length]].concat(ps.map(x => [x, x + ' · ' + auaLista(r, x).length]));
  const pode = auaPodeCorrigir(r), sit = auSit(r);
  const cab = '<div class="au-aph"><b>' + esc(r.numero) + '</b>' + ddHTML('aua:p', A.p, opc) + metaPl(AU_SIT[sit][0].split(' · ')[0], AU_SIT[sit][1]) + '<span class="sp"></span>' +
    (pode && n ? '<button type="button" class="bt' + (A.ed ? ' on' : '') + '" data-act="aua-ed">' + ic('lapis') + (A.ed ? 'Corrigindo' : 'Corrigir') + '</button>' : '') +
    '<button type="button" class="bt ic-so" data-act="aua-x" title="Fechar a apresentação" aria-label="Fechar a apresentação">' + ic('x') + '</button></div>';
  if (!n) { d.innerHTML = cab + '<div class="au-apb"><div class="vazio"><b>Nenhuma NC para ' + esc(A.p) + '.</b></div></div>'; return; }
  const fotos = (n.fotosAntes || []).filter(Boolean); A.foto = Math.max(0, Math.min(A.foto, fotos.length - 1));
  const foto = fotos.length ? '<div class="au-apf"><button type="button" class="au-apfi" data-act="au-foto-ver" data-id="' + esc(fotos[A.foto]) + '">' + auFotoIMG(fotos[A.foto]) + '</button>' +
    (fotos.length > 1 ? '<div class="au-apfn"><button type="button" class="bt ic-so" data-act="aua-foto" data-d="-1" aria-label="Foto anterior"' + (A.foto ? '' : ' disabled') + '>' + ic('volta') + '</button><span>Foto ' + (A.foto + 1) + ' de ' + fotos.length + '</span><button type="button" class="bt ic-so" data-act="aua-foto" data-d="1" aria-label="Próxima foto"' + (A.foto < fotos.length - 1 ? '' : ' disabled') + '>' + ic('seta') + '</button></div>' : '') + '</div>'
    : '<div class="au-apf vz">' + ic('imagem') + '<span>Sem foto</span></div>';
  const g = auGut(n.id), kv = [['Onde', auAreaNome(n.area) + ' › ' + (n.local || '')], ['Responsável', auResp(n) + (auCoresp(n).length ? ' · corresponsáveis: ' + auCoresp(n).map(c => c.nome).join(', ') : '')],
    [auLeis(n).length > 1 ? 'Leis / requisitos' : 'Lei / requisito', auLeis(n).join('; ')], ['Observação', n.obs || ''], ['Sugestão', n.sug || ''], ['Descrição do encarregado', n.encTxt || ''],
    ['Prioridade', g ? 'GUT ' + g.gut + ' · ' + AU_GUT_FX[g.faixa][0] + ' (G ' + g.g + ' × U ' + g.u + ' × T ' + g.t + ')' : ''], ['2ª pontuação', n.gut2 ? 'GUT ' + n.gut2.gut + ' · ' + AU_GUT_FX[n.gut2.faixa][0] + ' (G ' + n.gut2.g + ' × U ' + n.gut2.u + ' × T ' + n.gut2.t + ')' : ''],
    ['Retorno', n.ret ? AU_RES[n.ret.res][0] + ' · ' + (n.ret.texto || '') : '']];
  const info = '<div class="au-api"><div class="au-apn0">' + esc(auNum(n.n)) + ' · ' + (A.i + 1) + ' de ' + ls.length + (A.p !== '__todas' ? ' de ' + esc(A.p) : '') + '</div><h2>' + esc(n.titulo || n.nc) + '</h2>' + (n.titulo ? '<p class="au-apt">' + esc(n.nc) + '</p>' : '') +
    '<div class="au-apm">' + auGravPill(n) + auGutPill(n) + auGut2Pill(n) + auRetPill(n) + '</div>' + gvCampos(kv) + '</div>';
  const corpo = A.ed ? auaEdHTML(r, n) : info;
  d.innerHTML = cab + '<div class="au-apb">' + foto + corpo + '</div>' +
    '<div class="au-apnv"><button type="button" class="bt" data-act="aua-ir" data-d="-1"' + (A.i ? '' : ' disabled') + '>' + ic('volta') + 'Anterior</button><span>' + (A.i + 1) + ' / ' + ls.length + '</span><button type="button" class="bt pr" data-act="aua-ir" data-d="1"' + (A.i < ls.length - 1 ? '' : ' disabled') + '>Próxima' + ic('seta') + '</button></div>';
  auFotosCarrega(d);
}
const AUA_ED = [['titulo', 'Achado (nome curto)'], ['nc', 'Texto da NC'], ['local', 'Local'], ['resp', 'Responsável'], ['coresp', 'Corresponsáveis (separe com vírgula)'], ['lei', 'Lei / requisito (separe com ;)'], ['obs', 'Observação'], ['sug', 'Sugestão'], ['enc', 'Descrição do encarregado']];
function auaValor(n, k) { if (k === 'resp') return n.respNome || ''; if (k === 'coresp') return auCoresp(n).map(c => c.nome).join(', '); if (k === 'lei') return auLeis(n).join('; '); if (k === 'enc') return n.encTxt || ''; return n[k] || ''; }
function auaEdHTML(r, n) {
  const e = S.auAp.ed;
  if (!e.n || e.n !== n.id) { S.auAp.ed = { n: n.id, v: {}, gut: n.gut2 ? { g: n.gut2.g, u: n.gut2.u, t: n.gut2.t } : { g: 0, u: 0, t: 0 } }; AUA_ED.forEach(x => { S.auAp.ed.v[x[0]] = auaValor(n, x[0]); }); }
  const v = S.auAp.ed.v, campo = (k, rot) => '<label class="au-ac"><span class="fm-r">' + esc(rot) + '</span>' + (k === 'nc' || k === 'enc' ? '<textarea class="fm-i" rows="2" data-aued="' + k + '">' + esc(v[k]) + '</textarea>' : '<input class="fm-i" data-aued="' + k + '" value="' + esc(v[k]) + '" autocomplete="off"' + (k === 'resp' ? ' list="aua-dl-pes"' : '') + '>') + '</label>';
  return '<div class="au-api au-aed"><div class="au-apn0">' + esc(auNum(n.n)) + ' · corrigindo · cada mudança fica no histórico</div><div class="au-aedg">' + AUA_ED.map(x => campo(x[0], x[1])).join('') + '</div>' + auDl('aua-dl-pes', auPessoas()) +
    '<p class="gv-h">Segunda pontuação GUT <small>(opcional · a primeira não muda)</small></p>' + auGutBl(S.auAp.ed.gut, 'aua-gut', '', true) +
    '<div class="ap-pe"><button type="button" class="bt" data-act="aua-ed">Cancelar</button><button type="button" class="bt pr" data-act="aua-salvar">Salvar correções</button></div></div>';
}
DD_AO.aua = (k, v) => { if (k === 'p' && S.auAp) { S.auAp.p = v; S.auAp.i = 0; S.auAp.foto = 0; S.auAp.ed = null; auAprDesenha(); } };
function auaEdFecha() { if (!S.auAp) return; S.auAp.ed = null; if (csTemCamada('auaed')) csCamadaSaiu('auaed'); auAprDesenha(); }
function auaSalvar() {
  const A = S.auAp, r = A && auDe(A.rid); if (!r || !A.ed || !auaPodeCorrigir(r)) return;
  const n = auNc(r, A.ed.n); if (!n) return;
  $$('#au-apr [data-aued]').forEach(el => { A.ed.v[el.getAttribute('data-aued')] = el.value; });
  const u = S.user, em = nowISO(), patch = {}, alts = [], v = A.ed.v;
  AUA_ED.forEach(x => { const k = x[0], antes = auaValor(n, k), depois = String(v[k] || '').replace(/\s+$/g, '').trim(); if (antes === depois) return;
    if ((k === 'nc' && depois.length < 5) || (k === 'local' && !depois) || (k === 'resp' && depois.length < 3)) return;
    let p = {};
    if (k === 'resp') { const us = auUserDe(depois); p = { respNome: us ? us.nome : depois, respId: us ? us.id : '' }; }
    else if (k === 'coresp') p = { coresp: depois.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6).map(s => { const us = auUserDe(s); return { id: us ? us.id : '', nome: us ? us.nome : s }; }) };
    else if (k === 'lei') { const l = depois.split(';').map(s => s.trim()).filter(Boolean).slice(0, AU_LEIS_MAX); p = { leis: l, lei: l.join('; ') }; }
    else if (k === 'enc') p = { encTxt: depois }; else p[k] = depois;
    const de = {}; Object.keys(p).forEach(c => { de[c] = n[c] == null ? '' : n[c]; }); Object.assign(patch, p);
    alts.push({ id: uid(), em: em, porId: u.id, porNome: u.nome, ncId: n.id, n: n.n, campo: k, antes: antes, depois: depois, de: de, para: p }); });
  const gt = A.ed.gut, gc = auGutCalc(gt.g, gt.u, gt.t), g2a = n.gut2 ? n.gut2.gut : 0;
  if ((gt.u || gt.t) && !gc) { aviso('Marque as três notas da segunda GUT (ou tire a nota).', 'erro'); return; }
  if ((gc ? gc.v : 0) !== g2a || (gc && n.gut2 && (n.gut2.g !== gt.g || n.gut2.u !== gt.u || n.gut2.t !== gt.t))) {
    const novo = gc ? { g: Number(gt.g), u: Number(gt.u), t: Number(gt.t), gut: gc.v, faixa: gc.fx, porId: u.id, porNome: u.nome, em: em } : null;
    patch.gut2 = novo; alts.push({ id: uid(), em: em, porId: u.id, porNome: u.nome, ncId: n.id, n: n.n, campo: 'gut2', antes: n.gut2 ? 'GUT ' + n.gut2.gut : '', depois: novo ? 'GUT ' + novo.gut : '', de: { gut2: n.gut2 || null }, para: { gut2: novo } });
  }
  if (!alts.length) { aviso('Nada mudou.'); auaEdFecha(); return; }
  const ncs = (r.ncs || []).map(y => y.id === n.id ? Object.assign({}, y, patch) : y), lista = (Array.isArray(r.apresAlt) ? r.apresAlt : []).concat(alts);
  r.ncs = ncs; r.apresAlt = lista;
  alts.forEach(a => Audit.log({ acao: 'rnc_apres_alt', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · ' + auNum(n.n) + ' · ' + (AU_CAMPOS[a.campo] || a.campo) + ': "' + a.antes + '" → "' + a.depois + '" (na apresentação)', antes: a.de, depois: a.para }));
  Data.col('sv2_rnc').update(r.id, { ncs: ncs, apresAlt: lista, atualizadoEm: em }).catch(e => aviso(svErro(e), 'erro'));
  aviso(alts.length === 1 ? 'Corrigido: ' + (AU_CAMPOS[alts[0].campo] || 'campo') + ' da ' + auNum(n.n) + '.' : alts.length + ' correções na ' + auNum(n.n) + '.');
  auaEdFecha();
}
document.addEventListener('input', e => { const t = e.target; if (t && t.getAttribute && t.getAttribute('data-aued') && S.auAp && S.auAp.ed) S.auAp.ed.v[t.getAttribute('data-aued')] = t.value; });
function auaIr(dl) { const A = S.auAp; if (!A) return; const r = auDe(A.rid), tot = auaLista(r, A.p).length, j = A.i + dl; if (j < 0 || j >= tot) return; if (A.ed) auaEdFecha(); A.i = j; A.foto = 0; auAprDesenha(); }
document.addEventListener('keydown', e => {
  if (!S.auAp || $('#cf') || $('#au-fv')) return; const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); auaIr(1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); auaIr(-1); }
});

/* ---------- relatório ---------- */
LC_FORM.auRel = f => { const r = auDe(f.rid); if (!r) return null; const ps = auaPessoas(r);
  const c = lcMsg() + lcBl('O que imprimir', ddHTML('auf:modo', f.modo, [['completo', 'Completo · gráfico na folha 1, uma folha por NC, índices no fim'], ['visual', 'Só o visual · gráfico e índices'], ['resp', 'Só as folhas de um responsável']])) +
    (f.modo === 'resp' ? lcBl('Responsável', ddHTML('auf:p', f.p || ps[0], ps.map(x => [x, x + ' · ' + auaLista(r, x).length + ' NC(s)']))) : '') +
    lcAv(f.modo === 'visual' ? 'Uma folha com o gráfico e os números, e o índice com todas as NCs.' : f.modo === 'resp' ? 'Só as NCs em que a pessoa é responsável ou corresponsável, com uma folha de rosto dela.' : (auNcs(r).length + 2) + ' folhas: o gráfico, uma por NC (com a 1ª visita e o retorno) e o índice no fim.');
  return { ico: 'impressora', sub: r.numero + ' · ' + (r.tipo || ''), titulo: 'Relatório da RNC', corpo: c, rodape: lcPe('au-rel-ok', 'Imprimir') }; };
function auRelOk() {
  const f = S.fm, r = f && auDe(f.rid); if (!r) return; const modo = f.modo || 'completo', p = modo === 'resp' ? (f.p || auaPessoas(r)[0]) : '';
  lcFim(); auImprimir(r, modo, p);
}
const auSvgRosca = (l) => {
  const tot = l.reduce((s, x) => s + x.n, 0) || 1, R = 52, C = 2 * Math.PI * R; let ac = 0;
  return '<svg class="au-ros" viewBox="0 0 140 140" role="img" aria-label="NCs por gravidade"><circle cx="70" cy="70" r="' + R + '" class="au-ros0"/>' + l.filter(x => x.n).map(x => { const len = x.n / tot * C, s = '<circle cx="70" cy="70" r="' + R + '" class="au-c-' + x.k + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-ac).toFixed(2) + '" transform="rotate(-90 70 70)"/>'; ac += len; return s; }).join('') +
    '<text x="70" y="68" class="au-ros-n">' + l.reduce((s, x) => s + x.n, 0) + '</text><text x="70" y="86" class="au-ros-t">NCs</text></svg>';
};
function auSvgColunas(l) {
  const max = Math.max(1, ...l.map(x => x.n)), w = Math.max(320, l.length * 64), h = 170, bw = Math.min(40, (w - 20) / l.length - 14);
  return '<svg class="au-col" viewBox="0 0 ' + w + ' ' + (h + 60) + '" role="img" aria-label="NCs por responsável">' + l.map((x, i) => { const bh = Math.max(2, x.n / max * h), cx = 10 + i * ((w - 20) / l.length) + ((w - 20) / l.length) / 2;
    let y = 24 + h, out = ''; ['maior', 'media', 'baixa'].forEach(k => { const v = x[k] || 0; if (!v) return; const hh = v / max * h; y -= hh; out += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" class="au-c-' + k + '"/>'; });
    return out + '<text x="' + cx.toFixed(1) + '" y="' + (24 + h - bh - 4).toFixed(1) + '" class="au-col-n">' + x.n + '</text><text x="' + cx.toFixed(1) + '" y="' + (h + 40) + '" class="au-col-t">' + esc(x.nome === 'Sem responsável' ? 'Sem resp.' : String(x.nome).split(' ')[0].slice(0, 12)) + '</text>'; }).join('') + '</svg>';
}
async function auImprimir(r, modo, p) {
  const ls = auaLista(r, p), todas = auaOrdem(r), e = S.empresa || {}, g = k => ls.filter(n => n.grav === k).length;
  aviso('Preparando o relatório (' + ls.length + ' NCs)…');
  const ids = []; if (modo !== 'visual') ls.forEach(n => (n.fotosAntes || []).concat((n.ret && n.ret.fotosDepois) || []).forEach(x => ids.push(x)));
  await Promise.all(ids.map(auFotoGet));
  const im = id => imgSrc(S._auFotos[id]) ? '<img src="' + imgSrc(S._auFotos[id]) + '" alt="">' : '';
  const sit = auSit(r), cab = (t) => '<div class="au-ic"><b>' + esc(t) + '</b><span>' + esc([e.nome, r.numero, r.tipo].filter(Boolean).join(' · ')) + '</span></div>';
  const temAn = n => { const p = anPlano(n.id); return !!p && (anComecado(p) || !!p.contencao || !!p.efic); };
  const folhaDe = {}, folhaAn = {}; let fo = 2; ls.forEach(n => { folhaDe[n.id] = fo++; if (temAn(n)) folhaAn[n.id] = fo++; });
  const porResp = auQuemRecebe(ls).map(x => { const l2 = ls.filter(n => auNorm(auResp(n)) === auNorm(x.nome)); return { nome: x.nome, n: l2.length, maior: l2.filter(n => n.grav === 'maior').length, media: l2.filter(n => n.grav === 'media').length, baixa: l2.filter(n => n.grav === 'baixa').length }; });
  const nums = [[ls.length, 'NCs'], [g('maior'), 'maior'], [g('media'), 'média'], [g('baixa'), 'baixa'], [auAltas(ls), 'prioridade alta']].concat(sit !== 'registro' ? [[ls.filter(n => n.ret && n.ret.res === 'resolvida').length, 'resolvidas']] : []);
  let h = '<section class="au-fl">' + cab(modo === 'resp' ? 'Não conformidades de ' + p : 'Relatório de não conformidades') +
    '<div class="au-ikv">' + [['Auditor', r.auditorNome || ''], ['Acompanhado por', r.acompanhante || ''], ['Data', fmtD(r.data)], ['Prazo', fmtD(r.prazo)], ['Situação', AU_SIT[sit][0]], ['Preparação para', r.preparacao || '']].filter(x => x[1]).map(x => '<span><small>' + esc(x[0]) + '</small>' + esc(x[1]) + '</span>').join('') + '</div>' +
    '<div class="au-inum">' + nums.map(x => '<span><b>' + x[0] + '</b><small>' + esc(x[1]) + '</small></span>').join('') + '</div>' +
    '<div class="au-igr"><figure>' + auSvgRosca([{ k: 'maior', n: g('maior') }, { k: 'media', n: g('media') }, { k: 'baixa', n: g('baixa') }]) + '<figcaption><i class="au-c-maior"></i>Maior <i class="au-c-media"></i>Média <i class="au-c-baixa"></i>Baixa</figcaption></figure>' +
    (modo !== 'resp' ? '<figure>' + auSvgColunas(porResp) + '<figcaption>NCs por responsável</figcaption></figure>' : '') + '</div></section>';
  if (modo !== 'visual') h += ls.map((n, i) => { const gu = auGut(n.id), fs = (n.fotosAntes || []).filter(Boolean), dep = ((n.ret && n.ret.fotosDepois) || []).filter(Boolean);
    return '<section class="au-fl">' + cab(auNum(n.n) + (n.titulo ? ' · ' + n.titulo : '')) + '<p class="au-itx">' + esc(n.nc) + '</p>' +
      '<div class="au-ikv">' + [['Onde', auAreaNome(n.area) + ' › ' + n.local], ['Responsável', auResp(n) + (n.ciente ? ' (estava ciente)' : '')], ['Corresponsáveis', auCoresp(n).map(c => c.nome).join(', ')], ['Gravidade', (AU_GRAV[n.grav] || AU_GRAV.baixa)[0]],
        ['Prioridade GUT', gu ? gu.gut + ' · ' + AU_GUT_FX[gu.faixa][0] + ' (G' + gu.g + ' × U' + gu.u + ' × T' + gu.t + ')' : ''], ['2ª pontuação', n.gut2 ? n.gut2.gut + ' · ' + AU_GUT_FX[n.gut2.faixa][0] : ''], [auLeis(n).length > 1 ? 'Leis / requisitos' : 'Lei / requisito', auLeis(n).join('; ')],
        ['Observação', n.obs || ''], ['Sugestão', n.sug || ''], ['Descrição do encarregado', n.encTxt || '']].filter(x => x[1]).map(x => '<span><small>' + esc(x[0]) + '</small>' + esc(x[1]) + '</span>').join('') + '</div>' +
      (fs.length ? '<div class="au-ifs n' + Math.min(fs.length, 4) + '">' + fs.map(im).join('') + '</div>' : '') +
      '<div class="au-ivs"><div><b>1ª visita · apontamento</b><span>' + esc(fmtD(r.data) + ' · ' + (r.auditorNome || '')) + '</span></div><div><b>2ª visita · retorno</b>' +
      (n.ret ? '<span>' + esc(AU_RES[n.ret.res][0] + (n.ret.lib ? ' (liberada por ' + n.ret.lib.porNome + ': ' + n.ret.lib.motivo + ')' : '') + ' · ' + fmtD(n.ret.data || String(n.ret.ts).slice(0, 10)) + ' · ' + (n.ret.porNome || '')) + '</span><span>' + esc(n.ret.texto || '') + '</span>' + (dep.length ? '<div class="au-ifs n' + Math.min(dep.length, 4) + '">' + dep.map(im).join('') + '</div>' : '')
        : '<span class="au-ilin">Data: ____/____/______   Situação: (  ) Resolvida  (  ) Parcial  (  ) Não resolvida</span><span class="au-ilin">O que foi feito: ______________________________________________</span><span class="au-ilin">Assinatura: ______________________________</span>') +
      '</div></div><div class="au-ipe">Folha ' + folhaDe[n.id] + '</div></section>' + (folhaAn[n.id] ? anFolha(anInfo({ t: 'nc', rid: r.id, ncId: n.id }), anPlano(n.id), folhaAn[n.id]) : ''); }).join('');
  if (modo !== 'resp') h += '<section class="au-fl au-fli">' + cab('Índice') + '<table class="au-itb"><thead><tr><th>NC</th><th>O que está errado</th><th>Local</th><th>Responsável</th><th>Gravidade</th><th>GUT</th>' + (sit !== 'registro' ? '<th>Retorno</th>' : '') + (modo === 'completo' ? '<th>Folha</th>' : '') + '</tr></thead><tbody>' +
    todas.map(n => { const gu = auGut(n.id); return '<tr><td>' + esc(auNum(n.n)) + '</td><td>' + esc(n.titulo ? n.titulo + ' · ' + n.nc : n.nc) + '</td><td>' + esc(n.local || '') + '</td><td>' + esc(auResp(n)) + '</td><td>' + esc((AU_GRAV[n.grav] || AU_GRAV.baixa)[0]) + '</td><td>' + esc(gu ? gu.gut + ' ' + AU_GUT_FX[gu.faixa][0] : '—') + '</td>' + (sit !== 'registro' ? '<td>' + esc(n.ret ? AU_RES[n.ret.res][0] : '—') + '</td>' : '') + (modo === 'completo' ? '<td>' + esc(folhaDe[n.id] || '') + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></section>';
  let d = $('#au-imp'); if (!d) { d = document.createElement('div'); d.id = 'au-imp'; document.body.appendChild(d); }
  d.innerHTML = h; d.setAttribute('data-modo', modo);
  Audit.log({ acao: 'rnc_imprimir', entidade: 'rnc', entidadeId: r.id, resumo: 'Imprimiu a ' + r.numero + ' (' + (modo === 'resp' ? 'folhas de ' + p : modo) + ', ' + ls.length + ' NCs)' });
  document.body.classList.add('au-imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('au-imprimindo'); }, 80);
}

/* ---------- cliques ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="au-apr"],[data-act^="aua-"],[data-act^="au-rel"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'au-apr') auAprAbre(id, t.getAttribute('data-p'));
  else if (a === 'aua-x') csVolta();
  else if (a === 'aua-ir') auaIr(Number(t.getAttribute('data-d')));
  else if (a === 'aua-foto') { if (S.auAp) { S.auAp.foto += Number(t.getAttribute('data-d')); auAprDesenha(); } }
  else if (a === 'aua-ed') { if (!S.auAp) return; if (S.auAp.ed) { csVolta(); return; } S.auAp.ed = {}; csCamadaAbre('auaed', () => { if (S.auAp) { S.auAp.ed = null; auAprDesenha(); } }); auAprDesenha(); }
  else if (a === 'aua-salvar') auaSalvar();
  else if (a === 'aua-gut' && S.auAp && S.auAp.ed) { const k = t.getAttribute('data-k'); $$('#au-apr [data-aued]').forEach(el => { S.auAp.ed.v[el.getAttribute('data-aued')] = el.value; }); if (k === 'limpar') S.auAp.ed.gut = { g: 0, u: 0, t: 0 }; else S.auAp.ed.gut[k] = Number(t.getAttribute('data-v')); auAprDesenha(); }
  else if (a === 'au-rel') { const r = auDe(id); if (!r) return; const p = t.getAttribute('data-p'); lcAbrir({ k: 'auRel', rid: id, modo: p ? 'resp' : 'completo', p: p || '' }); }
  else if (a === 'au-rel-ok') auRelOk();
});
