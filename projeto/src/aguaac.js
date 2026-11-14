/* EFCwork · aguaac.js — COLETAS › ÁGUA: AÇÃO CORRETIVA e RELATÓRIO POR LOCAL (v0.6.6). Prefixos: ac (ação) e agr (relatório).
   Mesmos dados e regras do EFClaudian v2.28.0/v2.102.60 (Água-2):
   - A ação corretiva nasce dentro da coleta NÃO CONFORME (campo acao em sv2_aguacol): o Líder ★ ou o Administrador escolhe o responsável,
     o prazo e o que precisa ser feito. O responsável (ou um superior) registra ETAPAS (texto + até 5 fotos, com marcação) até CONCLUIR.
   - As fotos ficam em sv2_agua_foto ({coletaId, dataUrl, criadoEm, porId} + base/marcas/marcadoPor/marcadoEm quando marcadas) e são
     ELIMINADAS 7 dias depois da conclusão (grava dataUrl vazio; roda no aparelho de um Líder ★/Administrador ao entrar). Exceção declarada
     ao "nada é apagado", aprovada em 23/09/2026 no EFClaudian. O texto das etapas nunca é apagado.
   - PDF da ação (A4 deitado) e Relatório de água por local (período, resumo por local e todas as coletas, A4 deitado). */
const AC_FOTO_DIAS = 7, AC_MAX_FOTOS = 5;
Object.assign(S, { _acFotos: {}, _acLimpou: false });
const acEhResp = a => !!(a && S.user && a.responsavelId === S.user.id);
const acPode = a => !!S.user && (isSup(S.user) || acEhResp(a));
const acFotosVencem = a => a && a.concluida && a.concluidaEm ? addDias(agDia(a.concluidaEm), AC_FOTO_DIAS) : '';
const acPill = a => { const s = agAcSit(a); return alPill(s === 'concluida' ? 'Ação concluída' : s === 'vencida' ? 'Ação vencida' : 'Ação aberta', s === 'concluida' ? 'ok' : s === 'vencida' ? 'cr' : 'wa'); };
const acPessoas = () => S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').sort((a, b) => agCmp(a.nome, b.nome));

/* ---------- fotos (sob demanda) ---------- */
function acFotoGet(id) {
  if (S._acFotos[id]) return Promise.resolve(S._acFotos[id]);
  return Data.col('sv2_agua_foto').get(id).then(d => { if (d && d.dataUrl) S._acFotos[id] = d; return d && d.dataUrl ? d : null; }).catch(() => null);
}
function acFotosCarrega(raiz) { $$('img[data-acfoto]', raiz || document).forEach(im => { if (im.getAttribute('src')) return; acFotoGet(im.getAttribute('data-acfoto')).then(d => { if (d && imgSrc(d.dataUrl)) im.src = imgSrc(d.dataUrl); else { const q = im.closest('.ac-th'); if (q) q.classList.add('vz'); } }); }); }
GV_DEPOIS.push(g => acFotosCarrega(g));
function acFotoVer(cid, fid) {
  const c = S.aguacol.find(x => x.id === cid); acFotoGet(fid).then(d => { if (!d) return;
    fedVer({ src: d.dataUrl, base: d.base || '', marcas: d.marcas || [], marcadoPor: d.marcadoPor, marcadoEm: d.marcadoEm, titulo: 'Ação corretiva · ' + ((c && c.pontoNome) || ''), nome: 'acao-agua' }); });
}

/* ---------- fotos vencidas: eliminadas 7 dias depois da conclusão ---------- */
async function acFotoLimpar() {
  if (!S.user || !isSup(S.user)) return 0; let n = 0;
  for (const c of (S.aguacol || []).filter(x => x.acao && x.acao.concluida && !x.acao.fotosApagadas && acFotosVencem(x.acao) && acFotosVencem(x.acao) <= hojeISO())) {
    try {
      const ids = (c.acao.etapas || []).reduce((l, e) => l.concat(e.fotos || []), []);
      for (const f of ids) { await Data.col('sv2_agua_foto').set(f, { coletaId: c.id, dataUrl: '', apagadaEm: nowISO() }); delete S._acFotos[f]; n++; }
      await Data.col('sv2_aguacol').update(c.id, { acao: Object.assign({}, c.acao, { fotosApagadas: nowISO() }) });
      Audit.log({ acao: 'eliminar_fotos_acao_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Fotos da ação corretiva da água ' + c.pontoNome + ' eliminadas (' + ids.length + '), 7 dias depois da conclusão; as tratativas continuam' });
    } catch (e) { console.error(e); }
  }
  return n;
}
function acLimparUmaVez() { if (S._acLimpou || !S.user || !isSup(S.user) || !S.aguacol.length) return; S._acLimpou = true; setTimeout(() => acFotoLimpar().catch(() => {}), 2500); }

/* ======================= detalhe da ação ======================= */
function acTratHTML(c, a) {
  const et = a.etapas || [];
  if (!et.length) return '<p class="ag-dc">Nenhuma etapa ainda.</p>';
  return '<ol class="ac-tl">' + et.map((e, i) => '<li class="' + (e.final ? 'fim' : '') + '"><div class="ac-eh"><b>' + (e.final ? 'Conclusão' : 'Etapa ' + (i + 1)) + '</b><small>' + esc(fmtDT(e.ts) + ' · ' + (e.porNome || '')) + '</small></div><p>' + esc(e.texto) + '</p>' +
    ((e.fotos || []).length ? (a.fotosApagadas ? '<small class="ac-apag">' + e.fotos.length + ' foto(s) eliminada(s) em ' + esc(fmtD(agDia(a.fotosApagadas))) + '</small>' : '<div class="ac-ths">' + e.fotos.map((f, k) => '<button type="button" class="ac-th" data-act="ac-foto" data-id="' + esc(c.id) + '" data-f="' + esc(f) + '"><img ' + (S._acFotos[f] && imgSrc(S._acFotos[f].dataUrl) ? 'src="' + imgSrc(S._acFotos[f].dataUrl) + '"' : 'data-acfoto="' + esc(f) + '"') + ' alt="Foto ' + (k + 1) + '"></button>').join('') + '</div>') : '') + '</li>').join('') + '</ol>';
}
function acAbre(id) {
  S._agSel = id; gvAbrir(() => {
    const c = S.aguacol.find(x => x.id === id), a = c && c.acao; if (!a) return null; const pode = acPode(a) && !a.concluida, vence = acFotosVencem(a);
    const cab = '<button type="button" class="bt ic-so" data-act="ac-pdf" data-id="' + esc(c.id) + '" title="Imprimir a ação (PDF)" aria-label="Imprimir a ação (PDF)">' + ic('impressora') + '</button>';
    let pe = coVe() ? '<button type="button" class="bt" data-act="ag-abre" data-id="' + esc(c.id) + '">' + ic('frasco') + 'Coleta</button>' : '';
    if (pode) pe += '<button type="button" class="bt" data-act="ac-concluir" data-id="' + esc(c.id) + '">' + ic('ok') + 'Concluir</button><button type="button" class="bt pr" data-act="ac-etapa" data-id="' + esc(c.id) + '">' + ic('mais') + 'Registrar etapa</button>';
    return { ico: 'lista', cabAcoes: cab, sub: 'Ação corretiva · ' + (agAgenteTxt(c) || 'não conforme') + (c.gravidade ? ' · ' + c.gravidade : ''), titulo: c.pontoNome || 'Coleta de água', pill: acPill(a),
      corpo: (a.concluida && !a.fotosApagadas && vence ? lcAv('<b>Fotos até ' + esc(fmtD(vence)) + '.</b> Depois disso as fotos são eliminadas e ficam só os textos. Imprima antes, se precisar.', 'wa') : '') +
        gvCampos([['Responsável', a.responsavelNome], ['Prazo', fmtD(a.prazo) + (agAcSit(a) === 'vencida' ? ' (venceu)' : '')], ['O que fazer', a.orientacao], ['Aberta por', (a.abertaPorNome || '') + (a.abertaEm ? ', ' + fmtDT(a.abertaEm) : '')], ['Concluída', a.concluida ? (a.concluidaPorNome || '') + ', ' + fmtDT(a.concluidaEm) : ''], ['Coleta', fmtD(c.data) + ' · ' + agTipoTxt(c) + ' · ' + (c.analiseNome || '') + (c.laudoEm ? ' · laudo ' + fmtD(c.laudoEm) : '')]]) +
        '<p class="gv-h">Tratativas (' + (a.etapas || []).length + ')</p>' + acTratHTML(c, a),
      rodape: pe };
  });
  render();
}

/* ======================= formulários ======================= */
LC_FORM.acNova = f => { const c = S.aguacol.find(x => x.id === f.id); if (!c) return null; const us = acPessoas();
  return { ico: 'lista', sub: c.pontoNome + ' · não conforme em ' + fmtD(c.laudoEm || c.data), titulo: 'Abrir ação corretiva', corpo: lcMsg() +
    (agAgenteTxt(c) ? lcAv('Encontrado: ' + esc(agAgenteTxt(c)) + (c.gravidade ? ' · gravidade ' + esc(c.gravidade) : '') + '.', c.gravidade === 'grave' ? 'cr' : 'wa') : '') +
    '<div class="fm-g">' + agBl('Responsável', ddHTML('ac:resp', f.resp || '', [['', 'Quem vai tratar']].concat(us.map(u => [u.id, u.nome + (u.cargo ? ' · ' + u.cargo : '')])))) + agBl('Prazo', lcData('prazo', f.prazo, true)) + '</div>' +
    agBl('O que precisa ser feito', lcTx('orient', f.orient, 'Ex.: desativar o bebedouro, higienizar, trocar o filtro de carvão e pedir recoleta')), rodape: lcPe('ac-nova-ok', 'Abrir a ação') }; };
async function acNovaOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id); if (!c || !isSup(S.user)) return;
  if (c.acao) return lcErro('Esta coleta já tem ação corretiva.');
  const resp = userById(f.resp), prazo = f.prazo, orient = String(f.orient || '').trim();
  if (!resp) return lcErro('Escolha o colaborador responsável.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo || '') || prazo < hojeISO()) return lcErro('Informe o prazo (de hoje em diante).');
  if (orient.length < 5) return lcErro('Escreva o que precisa ser feito.');
  if (!lcTravar()) return;
  const a = { responsavelId: resp.id, responsavelNome: resp.nome, prazo: prazo, orientacao: orient, abertaPor: S.user.id, abertaPorNome: S.user.nome, abertaEm: nowISO(), etapas: [], concluida: false };
  try {
    await Data.col('sv2_aguacol').update(c.id, { acao: a });
    Audit.log({ acao: 'abrir_acao_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: 'Abriu ação corretiva na água ' + c.pontoNome + ': responsável ' + resp.nome + ', prazo ' + fmtD(prazo), depois: { responsavel: resp.nome, prazo: prazo } });
    if (resp.id !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Ação corretiva para você: ' + c.pontoNome, texto: 'Água não conforme (' + (agAgenteTxt(c) || 'coleta de ' + fmtD(c.data)) + '). O que fazer: ' + orient + ' · prazo ' + fmtD(prazo) + '. Registre cada etapa com texto e fotos.', para: [resp.id], refTipo: 'agua_acao', refId: c.id });
    S.fm.volta = () => acAbre(c.id); lcFim(); aviso('Ação corretiva aberta.');
  } catch (e) { lcErro(svErro(e)); }
}
function acFotosBl(f) {
  const fs = f.fotos || [];
  const th = fs.map((d, i) => '<span class="ap-ft"><img src="' + imgSrc(d) + '" alt="Foto ' + (i + 1) + '">' + fedMkBt('ac-foto-mk', i, ((f.mk || [])[i] || { marcas: [] }).marcas.length) + '<button type="button" class="bt ic-so" data-act="ac-foto-x" data-i="' + i + '" title="Tirar esta foto" aria-label="Tirar esta foto">' + ic('x') + '</button></span>').join('');
  const add = fs.length < AC_MAX_FOTOS ? '<label class="bt">' + ic('imagem') + (fs.length ? 'Mais uma' : 'Tirar foto') + '<input type="file" accept="image/*" capture="environment" data-acfoto-in hidden></label><label class="bt">Galeria<input type="file" accept="image/*" multiple data-acfoto-in hidden></label>' : '';
  return '<div class="ap-fot">' + th + add + '</div><small class="cl-nt">' + (fs.length >= AC_MAX_FOTOS ? 'Cabem no máximo ' + AC_MAX_FOTOS + ' fotos por etapa. ' : 'Até ' + AC_MAX_FOTOS + ' fotos por etapa. ') + 'Elas ficam até ' + AC_FOTO_DIAS + ' dias depois da conclusão; o texto fica para sempre.</small>';
}
LC_FORM.acEt = f => { const c = S.aguacol.find(x => x.id === f.id), a = c && c.acao; if (!a) return null; const n = (a.etapas || []).length;
  return { ico: f.fim ? 'ok' : 'mais', sub: 'Ação corretiva · ' + c.pontoNome, titulo: f.fim ? 'Concluir a ação' : 'Registrar a etapa ' + (n + 1), corpo: lcMsg() +
    (f.fim ? lcAv(n ? 'Escreva a conclusão (opcional) e conclua. Quem abriu a ação e o Administrador são avisados; as fotos ficam até ' + AC_FOTO_DIAS + ' dias depois.' : 'Ainda não há etapa: escreva a conclusão para concluir.', 'wa') : '') +
    agBl(f.fim ? 'Conclusão' : 'O que foi feito nesta etapa', lcTx('texto', f.texto, f.fim ? 'Ex.: recoleta conforme, bebedouro liberado' : 'Ex.: bebedouro desativado e higienizado; filtro trocado')) +
    agBl('Fotos', acFotosBl(f), 'opcional'), rodape: lcPe('ac-et-ok', f.fim ? 'Concluir a ação' : 'Registrar a etapa') }; };
async function acEtOk() {
  const f = S.fm, c = f && S.aguacol.find(x => x.id === f.id), a = c && c.acao; if (!a || a.concluida || !acPode(a)) return lcErro('Esta ação não pode mais receber etapas.');
  const txt = String(f.texto || '').trim(), fim = !!f.fim, fs = f.fotos || [];
  if (fim && !(a.etapas || []).length && txt.length < 5) return lcErro('Registre pelo menos uma etapa antes de concluir (ou escreva a conclusão).');
  if (!fim && txt.length < 5) return lcErro('Escreva o que foi feito nesta etapa (pelo menos 5 letras).');
  if (fs.length && txt.length < 5) return lcErro('Escreva o que foi feito: as fotos vão junto com o texto.');
  if (!lcTravar()) return;
  const ts = nowISO(), ids = fs.map(() => 'af' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)), etapas = (a.etapas || []).slice();
  if (txt.length >= 5) etapas.push({ ts: ts, porId: S.user.id, porNome: S.user.nome, texto: txt, fotos: ids, final: fim });
  const patch = { etapas: etapas }; if (fim) Object.assign(patch, { concluida: true, concluidaEm: ts, concluidaPor: S.user.id, concluidaPorNome: S.user.nome });
  try {
    for (let i = 0; i < fs.length; i++) { const m = (f.mk || [])[i], o = { coletaId: c.id, dataUrl: fs[i], criadoEm: ts, porId: S.user.id }; if (m) Object.assign(o, { base: m.base, marcas: m.marcas, marcadoPor: m.por, marcadoEm: m.em }); S._acFotos[ids[i]] = o; await Data.col('sv2_agua_foto').set(ids[i], o); }
    await Data.col('sv2_aguacol').update(c.id, { acao: Object.assign({}, a, patch) });
    Audit.log({ acao: fim ? 'concluir_acao_agua' : 'etapa_acao_agua', entidade: 'coleta_agua', entidadeId: c.id, resumo: (fim ? 'Concluiu a ação corretiva' : 'Registrou etapa na ação corretiva') + ' da água ' + c.pontoNome + (txt ? ': ' + txt : '') + (ids.length ? ' (' + ids.length + ' foto(s))' : '') });
    const para = Array.from(new Set([a.abertaPor, a.responsavelId].concat(fim ? S.users.filter(x => isPrincipal(x) && !x.bloqueado).map(x => x.id) : []))).filter(x => x && x !== S.user.id);
    if (para.length) Notif.send({ nivel: 'info', titulo: (fim ? 'Ação corretiva concluída: ' : 'Nova etapa na ação corretiva: ') + c.pontoNome, texto: S.user.nome + (txt ? ': ' + txt : '') + (fim ? ' · as fotos ficam até ' + fmtD(addDias(agDia(ts), AC_FOTO_DIAS)) + '.' : ''), para: para, refTipo: 'agua_acao', refId: c.id });
    lcFim(); aviso(fim ? 'Ação concluída.' : 'Etapa registrada.');
  } catch (e) { lcErro(svErro(e)); }
}
function acFotoMk(i) { const f = S.fm; if (!f) return; const cur = (f.fotos || [])[i], m = (f.mk || [])[i]; if (!imgSrc(cur)) return;
  fedAbrir({ src: cur, base: m ? m.base : cur, marcas: m ? m.marcas : [], sub: 'Ação corretiva' }).then(r => { if (!r || S.fm !== f) return; f.fotos[i] = r.img; f.mk = f.mk || []; f.mk[i] = r.marcas.length ? { base: r.base, marcas: r.marcas, por: r.marcadoPor, em: r.marcadoEm } : null; f.sujo = true; gvDesenha(true); }); }

/* ======================= impressão (A4 deitado) ======================= */
function acImprimir(html, titulo) {
  let el = $('#au-imp'); if (!el) { el = document.createElement('div'); el.id = 'au-imp'; document.body.appendChild(el); }
  el.innerHTML = html; el.setAttribute('data-modo', 'agua');
  let pg = $('#ag-page'); if (!pg) { pg = document.createElement('style'); pg.id = 'ag-page'; document.head.appendChild(pg); }
  pg.textContent = '@media print{@page{size:A4 landscape;margin:8mm}}';
  const t0 = document.title; document.title = titulo;
  document.body.classList.add('au-imprimindo');
  setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('au-imprimindo'); document.title = t0; const p2 = $('#ag-page'); if (p2) p2.remove(); }, 80);
}
const acCab = t => '<div class="au-ic"><b>' + esc(t) + '</b><span>' + esc([(S.empresa || {}).nome, 'emitido em ' + fmtD(hojeISO()) + ' por ' + S.user.nome].filter(Boolean).join(' · ')) + '</span></div>';
async function acPdf(id) {
  const c = S.aguacol.find(x => x.id === id), a = c && c.acao; if (!a) return;
  const ids = (a.etapas || []).reduce((l, e) => l.concat(e.fotos || []), []);
  if (ids.length && !a.fotosApagadas) { aviso('Preparando as fotos…'); await Promise.all(ids.map(acFotoGet)); }
  const im = f => S._acFotos[f] && imgSrc(S._acFotos[f].dataUrl) ? '<img src="' + imgSrc(S._acFotos[f].dataUrl) + '" alt="">' : '';
  const kv = [['Ponto', c.pontoNome], ['Coleta', fmtD(c.data) + ' ' + (c.hora || '') + ' · ' + agTipoTxt(c)], ['Análise', [c.analiseNome, c.lab].filter(Boolean).join(' · ') || '—'], ['Resultado', String(c.resultado || '').toLowerCase() + (c.laudoEm ? ' · laudo ' + fmtD(c.laudoEm) : '')], ['Agente', agAgenteTxt(c) || '—'], ['Gravidade', c.gravidade || '—'],
    ['Responsável', a.responsavelNome], ['Prazo', fmtD(a.prazo)], ['Situação', a.concluida ? 'Concluída por ' + a.concluidaPorNome + ' em ' + fmtD(agDia(a.concluidaEm)) : agAcSit(a) === 'vencida' ? 'Vencida' : 'Aberta'], ['Aberta por', (a.abertaPorNome || '') + ' · ' + fmtD(agDia(a.abertaEm))]];
  const et = (a.etapas || []).map((e, i) => { const fs = a.fotosApagadas ? [] : (e.fotos || []).map(im).filter(Boolean);
    return '<tr><td><b>' + (e.final ? 'Conclusão' : 'Etapa ' + (i + 1)) + '</b></td><td>' + esc(fmtDT(e.ts)) + '</td><td>' + esc(e.porNome || '') + '</td><td>' + esc(e.texto) + (a.fotosApagadas && (e.fotos || []).length ? '<br><i>' + e.fotos.length + ' foto(s) eliminada(s) depois da conclusão</i>' : '') + (fs.length ? '<div class="ac-ifs">' + fs.join('') + '</div>' : '') + '</td></tr>'; }).join('');
  Audit.log({ acao: 'imprimir', entidade: 'coleta_agua', entidadeId: id, resumo: 'PDF da ação corretiva da água ' + c.pontoNome });
  acImprimir('<section class="au-fl au-fli">' + acCab('Ação corretiva · água') + '<div class="au-ikv ac-ikv">' + kv.map(x => '<span><small>' + esc(x[0]) + '</small>' + esc(x[1]) + '</span>').join('') + '</div>' +
    '<p class="au-itx"><b>O que fazer:</b> ' + esc(a.orientacao || '') + '</p><h3 class="ac-ih">Tratativas</h3>' + (et ? '<table class="au-itb ac-itb ac-iet"><colgroup><col style="width:22mm"><col style="width:32mm"><col style="width:40mm"><col></colgroup><thead><tr><th>Etapa</th><th>Data</th><th>Por</th><th>O que foi feito</th></tr></thead><tbody>' + et + '</tbody></table>' : '<p>Nenhuma etapa registrada.</p>') + '</section>', 'Ação corretiva — água · ' + c.pontoNome);
}

/* ---------- relatório de água por local ---------- */
function agrLocal(c) {
  if (c.tipoColeta === 'mesclada') return 'Mesclada (todos os bebedouros)';
  const b = agBebIds(c).length === 1 ? S.bebs.find(x => x.id === agBebIds(c)[0]) : null;
  return b ? agNome(b) : (c.pontoNome || '—');
}
LC_FORM.agRel = f => ({ ico: 'impressora', sub: 'Coletas › Água', titulo: 'Relatório de água por local', corpo: lcMsg() + '<p class="ag-dc">Um PDF em A4 deitado: resumo por local e todas as coletas do período.</p>' +
  '<div class="fm-g">' + agBl('De', lcData('de', f.de)) + agBl('Até', lcData('ate', f.ate)) + '</div>' +
  '<label class="fm-ck"><input type="checkbox" data-fm="av"' + (f.av !== '0' ? ' checked' : '') + '> Incluir as coletas avulsas (caixas, poços…)</label>' +
  '<p class="ag-dc">' + agrLista(f).length + ' coleta(s) no período.</p>', rodape: lcPe('agr-ok', 'Gerar o PDF') });
const agrLista = f => agAtivas().filter(c => c.data >= f.de && c.data <= f.ate && (f.av !== '0' || (c.tipoColeta && c.tipoColeta !== 'avulsa')));
function agrOk() {
  const f = S.fm; if (!f || !isSup(S.user)) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.de || '') || !/^\d{4}-\d{2}-\d{2}$/.test(f.ate || '') || f.de > f.ate) return lcErro('Confira o período.');
  const cs = agrLista(f), grupos = {}; cs.forEach(c => { const k = agrLocal(c); (grupos[k] = grupos[k] || []).push(c); });
  const locs = Object.keys(grupos).sort(agCmp), dc = iso => iso ? fmtD(iso).replace(/\/\d{2}(\d{2})$/, '/$1') : '';
  const med = l => { const d = l.filter(c => c.envio && c.laudoEm).map(c => agDif(c.envio, c.laudoEm)); return d.length ? String(Math.round(d.reduce((a, b) => a + b, 0) / d.length * 10) / 10).replace('.', ',') : '—'; };
  const ags = l => Array.from(new Set(l.filter(agNC).map(agAgenteTxt).join(', ').split(', ').filter(Boolean))).join(', ') || '—';
  const linha = (nome, l, tot) => '<tr' + (tot ? ' class="ac-tot"' : '') + '><td><b>' + esc(nome) + '</b></td><td>' + l.length + '</td><td>' + l.filter(c => c.resultado === 'CONFORME').length + '</td><td>' + l.filter(agNC).length + '</td><td>' + l.filter(c => c.resultado === 'PENDENTE').length + '</td><td>' + l.filter(c => c.tipoColeta === 'recoleta').length + '</td><td>' + (tot ? '' : esc(ags(l))) + '</td><td>' + med(l) + '</td><td>' + (tot ? '' : dc(l.map(c => c.data).sort().pop())) + '</td></tr>';
  const nums = [[cs.length, 'coletas'], [cs.filter(c => c.resultado === 'CONFORME').length, 'conformes'], [cs.filter(agNC).length, 'não conformes'], [cs.filter(c => c.resultado === 'PENDENTE').length, 'pendentes'], [cs.filter(c => c.tipoColeta === 'recoleta').length, 'recoletas'], [med(cs), 'dias até o laudo']];
  const resumo = '<div class="au-inum">' + nums.map(x => '<span><b>' + esc(String(x[0])) + '</b><small>' + esc(x[1]) + '</small></span>').join('') + '</div>' +
    '<h3 class="ac-ih">Resumo por local</h3><table class="au-itb ac-itb"><thead><tr><th>Local</th><th>Coletas</th><th>Conformes</th><th>Não conformes</th><th>Pendentes</th><th>Recoletas</th><th>Agentes encontrados</th><th>Dias até o laudo</th><th>Última</th></tr></thead><tbody>' + locs.map(k => linha(k, grupos[k])).join('') + linha('Total', cs, true) + '</tbody></table>';
  const det = locs.map(k => '<h3 class="ac-ih">' + esc(k) + '</h3><table class="au-itb ac-itb ac-iet"><colgroup><col style="width:8%"><col style="width:9%"><col style="width:14%"><col style="width:9%"><col style="width:8%"><col style="width:11%"><col style="width:10%"><col style="width:12%"><col style="width:8%"><col></colgroup><thead><tr><th>Data</th><th>Tipo</th><th>Análise</th><th>Lab</th><th>Envio</th><th>Laudo</th><th>Resultado</th><th>Agente</th><th>Gravidade</th><th>Ação corretiva</th></tr></thead><tbody>' +
    grupos[k].slice().sort((a, b) => a.data.localeCompare(b.data)).map(c => '<tr><td>' + dc(c.data) + '</td><td>' + esc(agTipoTxt(c)) + '</td><td>' + esc(c.analiseNome || '') + '</td><td>' + esc(c.lab || '') + '</td><td>' + dc(c.envio) + '</td><td>' + dc(c.laudoEm) + (c.envio && c.laudoEm ? ' (' + agDif(c.envio, c.laudoEm) + ' d)' : '') + '</td><td>' + esc(c.resultado === 'NÃO CONFORME' ? 'Não conforme' : c.resultado === 'CONFORME' ? 'Conforme' : 'Pendente') + '</td><td>' + esc(agNC(c) ? agAgenteTxt(c) : '') + '</td><td>' + esc(c.gravidade || '') + '</td><td>' + (c.acao ? esc((agAcSit(c.acao) === 'concluida' ? 'concluída ' + dc(agDia(c.acao.concluidaEm)) : agAcTxt(c.acao).toLowerCase()) + ' · ' + (c.acao.responsavelNome || '')) : '') + '</td></tr>').join('') + '</tbody></table>').join('');
  Audit.log({ acao: 'imprimir', entidade: 'relatorio_agua', entidadeId: f.de + '_' + f.ate, resumo: 'Relatório de água por local de ' + fmtD(f.de) + ' a ' + fmtD(f.ate) + ' (' + cs.length + ' coletas)' });
  const per = 'de ' + fmtD(f.de) + ' a ' + fmtD(f.ate) + (f.av === '0' ? ' · sem as avulsas' : '');
  lcFim();
  acImprimir('<section class="au-fl au-fli">' + acCab('Água por local') + '<p class="au-itx">Período ' + esc(per) + '</p>' + (cs.length ? resumo + det : '<p>Nenhuma coleta de água no período.</p>') + '</section>', 'Água por local — ' + fmtD(f.de) + ' a ' + fmtD(f.ate));
}

/* ======================= eventos ======================= */
DD_AO.ac = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; f.msg = ''; if (k === 'resp') f.resp = v; gvDesenha(true); };
document.addEventListener('change', async e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-acfoto-in') || !S.fm || !t.files || !t.files.length) return;
  const arqs = Array.prototype.slice.call(t.files); t.value = '';
  const cabe = AC_MAX_FOTOS - (S.fm.fotos || []).length;
  for (const a of arqs.slice(0, cabe)) { try { const u = await coFotoReduz(a); if (!S.fm) return; S.fm.fotos = (S.fm.fotos || []).concat([u]); S.fm.sujo = true; } catch (er) { lcErro(er.message || 'Não deu para ler a foto.'); return; } }
  if (arqs.length > cabe) S.fm.msg = 'Cabem no máximo ' + AC_MAX_FOTOS + ' fotos por etapa.';
  gvDesenha(true);
});
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="ac-"], [data-act^="agr-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), c = id ? S.aguacol.find(x => x.id === id) : null, f = S.fm;
  const vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'ac-abre') { if (c && c.acao) acAbre(c.id); }
  else if (a === 'ac-nova') { if (!c || !isSup(S.user) || c.acao || !agNC(c)) return; lcAbrir({ k: 'acNova', id: c.id, resp: '', prazo: addDias(hojeISO(), 7), orient: '' }, volta); }
  else if (a === 'ac-nova-ok') acNovaOk();
  else if (a === 'ac-etapa' || a === 'ac-concluir') { if (!c || !c.acao || !acPode(c.acao) || c.acao.concluida) return; lcAbrir({ k: 'acEt', id: c.id, fim: a === 'ac-concluir', texto: '', fotos: [], mk: [] }, volta); }
  else if (a === 'ac-et-ok') acEtOk();
  else if (a === 'ac-foto-x' && f) { const i = Number(t.getAttribute('data-i')); f.fotos = (f.fotos || []).filter((x, k) => k !== i); f.mk = (f.mk || []).filter((x, k) => k !== i); f.sujo = true; gvDesenha(true); }
  else if (a === 'ac-foto-mk') acFotoMk(Number(t.getAttribute('data-i')));
  else if (a === 'ac-foto') acFotoVer(id, t.getAttribute('data-f'));
  else if (a === 'ac-pdf') acPdf(id);
  else if (a === 'agr-abre') { if (!isSup(S.user)) return; const h = hojeISO(); lcAbrir({ k: 'agRel', de: h.slice(0, 4) + '-01-01', ate: h, av: '1' }, null); }
  else if (a === 'agr-ok') agrOk();
});
/* o período e a caixinha mudam a contagem: redesenha ao sair do campo */
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && S.fm && S.fm.k === 'agRel' && /^(de|ate|av)$/.test(t.getAttribute('data-fm') || '')) gvDesenha(true); });
