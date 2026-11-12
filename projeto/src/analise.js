/* EFCwork · analise.js — análise de problema (v0.6.3). Prefixo: an.
   As mesmas ferramentas servem a duas coisas: a análise de cada NC da auditoria (sv2_rnc_plano, um documento por NC, id = id da NC)
   e a Análise de problemas da área Qualidade (sv2_analise, em anp.js). Formato e regras iguais ao EFClaudian v2.102.60:
   contencao { texto, data, porNome }, porques[5], ishi [{ id, m, t, em, porNome, tirada? }], ishiPri, ishiV, causa, m6 (vem da causa
   principal), outra { sim, quais } (só NC), acoes [5W2H: id, oque, quemId, quemNome, quando, onde, porque, como, quanto, st, feitaEm,
   feitaPor, feitaTxt, cancEm, cancPor, cancMotivo, hist], rev, em, porId, porNome, hist, respId, respNome, respHist.
   Escolhas do Elias (11/11 17:34): gaveta em passos (OPÇÃO 1), Ishikawa desenhado como espinha de peixe (OPÇÃO A), plano de ação em
   cartões (OPÇÃO C), regras do EFClaudian (só o responsável pela resposta escreve; o risco decide o que é pedido; tratativa direta ×
   com análise), e a eficácia também na NC (campo novo efic { res 'eficaz'|'nao', texto, data, porId, porNome, ts } + eficHist). */
Object.assign(S, { rncPlano: [], anl: [] });
const AN_6M = ['Método', 'Mão de obra', 'Material', 'Máquina', 'Medição', 'Meio ambiente'];
const AN_FALTA_TXT = { feito: 'o que foi feito', causa: 'a causa', porques: 'pelo menos 3 “por quê”', ishi: 'o Ishikawa com a causa principal', outra: 'se pode acontecer em outra área' };
const AN_AC_ST = { aberta: ['Aberta', ''], atrasada: ['Atrasada', 'cr'], feita: ['Feita', 'ok'], cancelada: ['Cancelada', ''] };
const AN_TRAT = { direta: 'Tratativa direta', analise: 'Com análise' };
const AN_ISHI_MAX = 5, AN_EFIC_DIAS = 30;

CS_CARGAS.push(() => {
  csOuve('sv2_rnc_plano', l => { S.rncPlano = l || []; anRedesenha(); }, { limit: 3000 });
  csOuve('sv2_analise', l => { S.anl = (l || []).filter(x => !x.teste); anRedesenha(); }, { order: 'criadoEm', limit: 500 });
});
function anRedesenha() { if (S.rota.area === 'qualidade' || (S.rota.area === 'inspecoes' && S.rota.aba === 'auditoria')) render(); else if (S.gv) gvDesenha(); }

/* ---------- regras ---------- */
const anIshiAtivas = l => (l || []).filter(c => c && !c.tirada);
const anIshiPri = d => anIshiAtivas((d || {}).ishi).find(c => c.id === (d || {}).ishiPri) || null;
const anIshiOk = d => !!anIshiPri(d) || (!(d || {}).ishiV && !anIshiAtivas((d || {}).ishi).length && !!(d || {}).m6);
const anAtivas = l => (l || []).filter(a => a.st !== 'cancelada');
const anAcSt = a => a.st === 'feita' || a.st === 'cancelada' ? a.st : a.quando && a.quando < hojeISO() ? 'atrasada' : 'aberta';
const anPlano = ncId => S.rncPlano.find(x => x.ncId === ncId) || null;
const anpDe = id => S.anl.find(x => x.id === id) || null;
function anFaixa(nc) { const g = auGut(nc.id); return g ? g.faixa : nc.grav === 'maior' ? 'alto' : nc.grav === 'media' ? 'medio' : 'baixo'; }
function anComecado(p) { return !!p && (String(p.causa || '').trim().length > 0 || (p.porques || []).some(x => String(x || '').trim()) || anIshiAtivas(p.ishi).length > 0 || (p.acoes || []).length > 0); }
function anTrat(nc) { if (anFaixa(nc) === 'alto') return 'analise'; if (nc.trat === 'direta' || nc.trat === 'analise') return nc.trat; if (anComecado(anPlano(nc.id))) return 'analise'; return anFaixa(nc) === 'baixo' ? 'direta' : 'analise'; }
const anPedeNc = fx => fx === 'alto' ? ['causa', 'porques', 'ishi', 'outra'] : fx === 'medio' ? ['causa', 'porques'] : ['causa'];
/* contexto: { t: 'nc', rid, ncId } ou { t: 'anp', id } */
function anInfo(ctx) {
  const u = S.user;
  if (ctx.t === 'anp') { const x = anpDe(ctx.id); if (!x) return null; const aberto = x.situacao === 'aberta', resp = { id: x.respId, nome: x.respNome || nomeDe(x.respId) };
    return { t: 'anp', x: x, doc: x, aberto: aberto, resp: resp, direta: false, pede: ['causa', 'porques', 'ishi'], podeEd: !!u && aberto && resp.id === u.id && u.perfil !== 'visitante', podeLider: !!u && isSup(u) && aberto, podeEfic: !!u && isSup(u) && aberto,
      titulo: x.numero, sub: x.titulo, cabeca: x.titulo, ref: x.numero }; }
  const r = auDe(ctx.rid), nc = auNc(r, ctx.ncId); if (!r || !nc || nc.cancelada) return null;
  const doc = anPlano(nc.id), sit = auSit(r), naoEf = !!(doc && doc.efic && doc.efic.res === 'nao');
  const aberto = sit === 'retorno' || sit === 'pronta' || (sit === 'fechada' && naoEf);
  const resp = doc && doc.respId ? { id: doc.respId, nome: doc.respNome || nomeDe(doc.respId) } : nc.respId ? { id: nc.respId, nome: nc.respNome } : { id: nc.porId || r.porId || '', nome: nc.porNome || r.porNome || '' };
  const direta = anTrat(nc) === 'direta';
  return { t: 'nc', r: r, nc: nc, doc: doc, sit: sit, aberto: aberto, resp: resp, direta: direta, fx: anFaixa(nc), pede: direta ? ['feito'] : anPedeNc(anFaixa(nc)),
    podeEd: !!u && aberto && resp.id === u.id && u.perfil !== 'visitante', podeLider: !!u && isSup(u) && aberto, podeEfic: auPode(r) && sit !== 'registro',
    titulo: 'Análise · ' + auNum(nc.n), sub: r.numero + ' · ' + auAreaNome(nc.area) + ' › ' + nc.local, cabeca: (nc.titulo ? nc.titulo + ': ' : '') + nc.nc + ' (' + auNum(nc.n) + ')', ref: r.numero + ' · ' + auNum(nc.n) };
}
function anFalta(I, d) {
  d = d || I.doc || {};
  if (I.direta) return String((d.contencao && d.contencao.texto) || '').trim().length >= 3 ? [] : ['feito'];
  return I.pede.filter(k => k === 'causa' ? String(d.causa || '').trim().length < 5 : k === 'porques' ? (d.porques || []).filter(x => String(x || '').trim()).length < 3 : k === 'ishi' ? !anIshiOk(d) : k === 'outra' ? !(d.outra && (d.outra.sim === true || d.outra.sim === false)) : false);
}
/* o que impede marcar Resolvida na conferência (como o confPend do EFClaudian) */
function anPend(ctx) { const I = anInfo(ctx); if (!I) return []; const f = anFalta(I), ab = anAtivas((I.doc || {}).acoes).filter(a => a.st !== 'feita'), p = [];
  if (I.direta) { if (f.length) p.push('tratativa direta sem o que foi feito'); return p; }
  if (f.length) p.push('análise incompleta (falta ' + f.map(k => AN_FALTA_TXT[k]).join(', ') + ')');
  if (ab.length) p.push(ab.length + (ab.length > 1 ? ' ações ainda não feitas' : ' ação ainda não feita'));
  return p; }
function anSelo(ctx) { const I = anInfo(ctx); if (!I) return ''; const f = anFalta(I), p = I.doc;
  const t = I.direta ? (f.length ? ['Sem o que foi feito', ''] : ['Tratativa feita', 'ok']) : f.length ? (anComecado(p) ? ['Análise incompleta', 'wa'] : ['Sem análise', '']) : ['Análise completa', 'ok'];
  const l = anAtivas((p || {}).acoes), at = l.filter(a => anAcSt(a) === 'atrasada').length, fe = l.filter(a => a.st === 'feita').length;
  const ef = p && p.efic ? (p.efic.res === 'eficaz' ? '<span class="pill ok">Eficaz</span>' : '<span class="pill cr">Não eficaz</span>') : '';
  return '<span class="pill ' + t[1] + '">' + esc(t[0]) + '</span>' + (l.length ? '<span class="pill ' + (at ? 'cr' : fe === l.length ? 'ok' : '') + '">' + (at ? at + (at > 1 ? ' ações atrasadas' : ' ação atrasada') : fe + ' de ' + l.length + (l.length > 1 ? ' ações feitas' : ' ação feita')) + '</span>' : '') + ef; }
function anEficDesde(I) { const l = anAtivas((I.doc || {}).acoes), ds = l.map(a => a.feitaEm).filter(Boolean).concat(I.nc && I.nc.ret ? [I.nc.ret.data || diaLocal(I.nc.ret.ts)] : []).sort(); return ds.length ? addDias(ds[ds.length - 1], AN_EFIC_DIAS) : ''; }
function anPdca(I, d) {
  const l = anAtivas(d.acoes), f = anFalta(I, d);
  const st = [['P', 'Planejar', 'análise e ações', !f.length && (I.direta || l.length > 0)], ['D', 'Fazer', 'ações feitas', I.direta ? !f.length : l.length > 0 && l.every(a => a.st === 'feita')],
    [I.t === 'anp' ? 'C' : 'C', 'Checar', I.nc ? 'auditor conferiu' : 'ações conferidas', I.nc ? !!I.nc.ret : l.length > 0 && l.every(a => a.st === 'feita')], ['A', 'Agir', 'eficácia', !!(d.efic && d.efic.res === 'eficaz')]];
  const cur = st.findIndex(x => !x[3]);
  return '<div class="an-pdca">' + st.map((x, i) => '<div class="' + (x[3] ? 'ok' : i === cur ? 'at' : '') + '"><i>' + (x[3] ? ic('ok') : x[0]) + '</i><b>' + x[1] + '</b><small>' + x[2] + '</small></div>').join('') + '</div>';
}

/* ---------- Ishikawa desenhado (espinha de peixe, OPÇÃO A) ---------- */
function anPeixe(cabeca, ishi, pri, w) {
  w = w || 760; const h = 340, mid = 170, hx = w - 190, col = (hx - 90) / 3, at = anIshiAtivas(ishi);
  let s = '<svg class="an-fish" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Diagrama de Ishikawa"><line x1="20" y1="' + mid + '" x2="' + hx + '" y2="' + mid + '" class="esp"/>';
  AN_6M.forEach((m, i) => { const top = i < 3, k = i % 3, x = 70 + k * col, y = top ? 34 : h - 34, cs = at.filter(c => c.m === m), temPri = cs.some(c => c.id === pri);
    s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 70) + '" y2="' + mid + '" class="cos' + (temPri ? ' pri' : '') + '"/><text x="' + (x - 6) + '" y="' + (top ? y - 12 : y + 20) + '" class="cat">' + esc(m) + '</text>';
    if (cs.length) s += '<foreignObject x="' + (x + 8) + '" y="' + (top ? y + 6 : mid + 8) + '" width="' + Math.round(col - 26) + '" height="' + (mid - 48) + '"><div xmlns="http://www.w3.org/1999/xhtml" class="an-fcs' + (top ? '' : ' em') + '">' +
      cs.slice(0, 3).map(c => '<span class="an-fc' + (c.id === pri ? ' pri' : '') + '">' + esc(c.t) + '</span>').join('') + (cs.length > 3 ? '<span class="an-fc">+' + (cs.length - 3) + '</span>' : '') + '</div></foreignObject>'; });
  return s + '<foreignObject x="' + (hx + 8) + '" y="' + (mid - 52) + '" width="172" height="104"><div xmlns="http://www.w3.org/1999/xhtml" class="an-fh">' + esc(String(cabeca || '').slice(0, 110)) + '</div></foreignObject></svg>';
}

/* ---------- a análise na gaveta, em passos (OPÇÃO 1) ---------- */
const anKey = ctx => ctx.t === 'nc' ? 'nc-' + ctx.ncId : 'anp-' + ctx.id;
function anDoEstado(d) { d = d || {}; const ct = d.contencao || {};
  return { cont: ct.texto || '', contData: ct.data || hojeISO(), contPor: ct.porNome || '', pq: (d.porques || []).concat(['', '', '', '', '']).slice(0, 5), ishi: (d.ishi || []).map(c => Object.assign({}, c)), ishiPri: d.ishiPri || '', ishiV: d.ishiV, m6: d.m6 || '',
    causa: d.causa || '', outra: d.outra ? d.outra.sim : null, outraQ: (d.outra && d.outra.quais) || '', isM: AN_6M[0], isTxt: '' }; }
function anParaDoc(f) { const at = anIshiAtivas(f.ishi), pri = at.find(c => c.id === f.ishiPri);
  return { contencao: String(f.cont || '').trim() ? { texto: String(f.cont).trim(), data: f.contData || hojeISO(), porNome: f.contPor || S.user.nome } : null, porques: f.pq.map(x => String(x || '').trim()), causa: String(f.causa || '').trim(),
    ishi: f.ishi, ishiPri: pri ? pri.id : '', ishiV: f.ishiV === 0 && !at.length ? 0 : 1, m6: pri ? pri.m : (at.length ? '' : f.m6 || ''), outra: f.outra === true || f.outra === false ? { sim: f.outra, quais: f.outra ? String(f.outraQ || '').trim() : '' } : null }; }
function anAbrir(ctx, rascunho) {
  const I = anInfo(ctx); if (!I) return;
  if (!I.podeEd) { anVer(ctx); return; }
  let base = I.doc || {}, rasc = null; try { rasc = JSON.parse(Store.get('cw-an-' + anKey(ctx)) || 'null'); } catch {}
  const est = Object.assign({ k: 'anPl', ctx: ctx, rev0: base.rev || 0, rasc: rasc && !rascunho ? rasc.ts : '' }, anDoEstado(rascunho || base));
  lcAbrir(est, ctx.t === 'nc' ? () => auNcAbre(ctx.rid, ctx.ncId) : null);
}
function anCab(I, d) {
  const f = anFalta(I, d), F = I.nc ? AU_GUT_FX[I.fx] : null;
  let h = I.nc ? '<div class="au-cfn">' + ((I.nc.fotosAntes || [])[0] ? '<span class="au-th">' + auFotoIMG(I.nc.fotosAntes[0]) + '</span>' : '') + '<div><b>' + esc(auNum(I.nc.n) + (I.nc.titulo ? ' · ' + I.nc.titulo : '')) + '</b><span>' + esc(I.nc.nc) + '</span><small>' + esc(auAreaNome(I.nc.area) + ' › ' + I.nc.local) + '</small><div class="an-ncp">' + auGravPill(I.nc) + (auGut(I.nc.id) ? auGutPill(I.nc) : '<span class="pill ' + F[1] + '">Risco ' + esc(F[0]) + ' (pela gravidade)</span>') + '</div></div></div>'
    : '<div class="au-cfn"><div><b>' + esc(I.x.titulo) + '</b><span>' + esc(I.x.descricao || '') + '</span><small>' + esc(anpOrigTxt(I.x)) + '</small></div></div>';
  h += '<div class="an-lin"><span>Responsável pela resposta: <b>' + esc(I.resp.nome || '—') + '</b></span>' + (I.podeLider ? '<button type="button" class="bt" data-act="an-resp">Trocar</button>' : '') + '</div>';
  if (I.nc) h += '<div class="an-lin"><span>Tratamento: <b>' + esc(AN_TRAT[anTrat(I.nc)]) + '</b>' + (I.fx === 'alto' ? ' <small>(risco Alto é sempre com análise)</small>' : '') + '</span>' + (I.podeLider && I.fx !== 'alto' ? '<button type="button" class="bt" data-act="an-trat">Trocar</button>' : '') + '</div>';
  h += I.direta ? lcAv('<b>Tratativa direta:</b> diga o que foi feito e quando.' + (f.length ? ' <b>Falta:</b> o que foi feito.' : ' Completa.'), f.length ? 'wa' : '')
    : lcAv('<b>' + (I.nc ? 'Risco ' + esc(F[0]) + ':' : 'A análise pede:') + '</b> ' + (I.nc ? 'a análise pede ' : '') + I.pede.map(k => AN_FALTA_TXT[k]).join(', ') + '.' + (f.length ? ' <b>Falta:</b> ' + f.map(k => AN_FALTA_TXT[k]).join(', ') + '.' : ' Completa.'), f.length ? 'wa' : '');
  return h + anPdca(I, d);
}
LC_FORM.anPl = f => {
  const I = anInfo(f.ctx); if (!I) return null; const d = Object.assign({}, I.doc || {}, anParaDoc(f));
  let c = lcMsg() + (f.rasc ? lcAv('Há um texto seu desta análise que não chegou à nuvem (' + esc(fmtDT(f.rasc)) + '). <button type="button" class="bt" data-act="an-rasc">Usar o texto guardado</button>', 'wa') : '') + anCab(I, d);
  const dataPar = '<div class="fm-g cl-fm2">' + lcBl(I.direta ? 'O que foi feito' : 'O que foi feito', lcIn('cont', f.cont, ' placeholder="' + (I.direta ? 'ex.: placa recolocada no mesmo dia' : 'ex.: área isolada com fita') + '"')) + lcBl('Quando', lcData('contData', f.contData)) + '</div>';
  if (I.direta) return { ico: 'lista', sub: I.sub + ' · só ' + I.resp.nome + ' escreve', titulo: I.titulo, corpo: c + apPasso(1, 'O que foi feito', 'tratativa direta') + dataPar + '<small class="cl-nt">A foto do depois o auditor põe na conferência.</small>', rodape: anPe(I) };
  const at = anIshiAtivas(f.ishi), pri = at.find(x => x.id === f.ishiPri);
  c += apPasso(1, 'O que foi feito na hora', 'contenção · opcional') + dataPar +
    apPasso(2, '5 Porquês', I.pede.indexOf('porques') >= 0 ? 'pelo menos 3' : 'opcional') + '<div class="an-pq">' + f.pq.map((v, i) => '<label><span>' + (i + 1) + 'º por quê</span>' + lcIn('pq.' + i, v, i === 0 ? ' placeholder="Por que aconteceu?"' : '') + '</label>').join('') + '</div>' +
    apPasso(3, 'Ishikawa (6M)', 'toque numa causa para marcar a principal') + '<div class="an-fw" data-act="an-fv" title="Ver o diagrama grande">' + anPeixe(I.cabeca, f.ishi, f.ishiPri) + '</div><small class="cl-nt">Toque no diagrama para ver grande.</small>' +
    (at.length ? '<div class="au-chips an-isc">' + at.map(x => '<span class="au-chip' + (x.id === f.ishiPri ? ' pri' : '') + '"><button type="button" class="an-isp" data-act="an-is-pri" data-id="' + esc(x.id) + '" aria-pressed="' + (x.id === f.ishiPri) + '"><small>' + esc(x.m) + '</small>' + esc(x.t) + '</button><button type="button" data-act="an-is-x" data-id="' + esc(x.id) + '" aria-label="' + esc('Tirar ' + x.t) + '">' + ic('x') + '</button></span>').join('') + '</div>' : '') +
    '<div class="au-addr an-isa">' + ddHTML('anf:isM', f.isM, AN_6M.map(m => [m, m])) + lcIn('isTxt', f.isTxt, ' placeholder="uma causa (curta)" maxlength="120"') + '<button type="button" class="bt" data-act="an-is-add">Adicionar</button></div>' +
    apPasso(4, 'Causa', 'a raiz · por que aconteceu') + lcTx('causa', f.causa, 'ex.: não há rotina de revisão das instalações') + '<div class="an-lin"><small>' + (pri ? 'Categoria (6M): <b>' + esc(pri.m) + '</b> · vem da causa principal' : 'A categoria (6M) vem da causa principal do Ishikawa') + '</small><button type="button" class="bt" data-act="an-ultimo">Usar o último “por quê”</button></div>' +
    (I.nc ? apPasso(5, 'Pode acontecer em outra área?', I.pede.indexOf('outra') >= 0 ? '' : 'opcional') + '<div class="ap-gb an-gb2">' + [['1', 'Sim'], ['0', 'Não']].map(o => '<button type="button" class="ap-gbt' + (f.outra === (o[0] === '1') ? ' on' : '') + '" data-act="an-outra" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>' + (f.outra === true ? lcIn('outraQ', f.outraQ, ' placeholder="Quais? (outro talhão, outra fazenda, outra casa de bombas…)" class="fm-i an-oq"') : '') : '') +
    apPasso(I.nc ? 6 : 5, 'Plano de ação (5W2H)') + anAcoesHTML(I, true) + apPasso(I.nc ? 7 : 6, 'Eficácia') + anEficHTML(I);
  return { ico: 'lista', sub: I.sub + ' · só ' + I.resp.nome + ' escreve', titulo: I.titulo, corpo: c, rodape: anPe(I) };
};
const anPodeEficAgora = I => I.podeEfic && !anFalta(I).length && anAtivas((I.doc || {}).acoes).every(a => a.st === 'feita') && !(I.doc && I.doc.efic && I.doc.efic.res === 'eficaz');
const anPe = I => '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button><span class="au-pesp"></span>' + (I && anPodeEficAgora(I) ? '<button type="button" class="bt" data-act="an-efic">Eficácia</button>' : '') + '<button type="button" class="bt ic-so" data-act="an-imp" title="Imprimir a análise" aria-label="Imprimir a análise">' + ic('impressora') + '</button><button type="button" class="bt pr au-pr0" data-act="an-salvar">Salvar</button>';
function anAcCard(I, a, ed) {
  const s = anAcSt(a), t = AN_AC_ST[s], fora = a.st !== 'cancelada' && a.quando && I.r && I.r.prazo && a.quando > I.r.prazo;
  return '<div class="an-ac st-' + s + '"><div class="an-act"><b>' + esc(a.oque) + '</b><span class="pill ' + t[1] + '">' + esc(t[0]) + '</span></div><div class="an-ack">' +
    [['Quem', a.quemNome], ['Quando', fmtD(a.quando) + (fora ? ' · depois do prazo da RNC' : '')], ['Onde', a.onde], ['Por quê', a.porque], ['Como', a.como], ['Quanto', a.quanto]].filter(x => x[1]).map(x => '<span' + (x[0] === 'Quando' && fora ? ' class="cr"' : '') + '><i>' + x[0] + '</i>' + esc(x[1]) + '</span>').join('') + '</div>' +
    (a.st === 'feita' ? '<p class="an-acn">Feita em ' + esc(fmtD(a.feitaEm)) + ' · ' + esc(a.feitaPor || '') + (a.feitaTxt ? ': ' + esc(a.feitaTxt) : '') + '</p>' : '') + (a.st === 'cancelada' ? '<p class="an-acn">Cancelada · ' + esc(a.cancPor || '') + ': ' + esc(a.cancMotivo || '') + '</p>' : '') +
    (ed && (s === 'aberta' || s === 'atrasada') ? '<div class="ap-pe an-acb"><button type="button" class="bt" data-act="an-ac-ed" data-id="' + esc(a.id) + '">Editar</button><button type="button" class="bt" data-act="an-ac-canc" data-id="' + esc(a.id) + '">Cancelar</button><button type="button" class="bt pr" data-act="an-ac-feita" data-id="' + esc(a.id) + '">Concluir</button></div>' : '') + '</div>';
}
function anAcoesHTML(I, ed) { const l = ((I.doc || {}).acoes || []);
  return (l.length ? l.map(a => anAcCard(I, a, ed)).join('') : '<small class="cl-nt">Nenhuma ação ainda.</small>') + (ed ? '<button type="button" class="au-add an-add" data-act="an-ac-nova">' + ic('mais') + 'Nova ação</button>' : ''); }
function anEficHTML(I) { const e = (I.doc || {}).efic, desde = anEficDesde(I);
  return e ? '<div class="an-ef ' + (e.res === 'eficaz' ? 'ok' : 'cr') + '"><b>' + (e.res === 'eficaz' ? 'Eficaz' : 'Não eficaz') + '</b> · ' + esc(fmtD(e.data) + ' · ' + (e.porNome || '')) + '<span>' + esc(e.texto || '') + '</span></div>'
    : '<small class="cl-nt">' + (desde ? 'Verificar a partir de ' + esc(fmtD(desde)) + ' (' + AN_EFIC_DIAS + ' dias depois da última ação feita) se o problema voltou.' : 'Depois que as ações forem feitas, ' + (I.nc ? 'o auditor ou o líder' : 'o líder') + ' confere se o problema voltou (padrão: ' + AN_EFIC_DIAS + ' dias).') + '</small>'; }
DD_AO.anf = (k, v) => { if (!S.fm) return; S.fm[k] = v; gvDesenha(true); };
function anLeCampos() { const f = S.fm; if (!f) return; $$('#gv [data-fm]').forEach(el => { const k = el.getAttribute('data-fm'); if (el.type !== 'checkbox') lcSet(k, el.value); }); }

/* gravar: NC → sv2_rnc_plano (documento inteiro, como o EFClaudian); Análise de problemas → sv2_analise (update) */
function anGravar(I, ctx, patch, resumo, rev0) {
  const cur = I.doc, revAt = (cur && cur.rev) || 0;
  if (rev0 != null && revAt !== rev0) return Promise.reject(new Error('conflito'));
  const ts = nowISO(), rev = revAt + 1, u = S.user, hist = ((cur && cur.hist) || []).concat([{ ts: ts, porNome: u.nome, rev: rev, o: resumo }]);
  Audit.log({ acao: ctx.t === 'nc' ? 'rnc_analise' : 'anl_editar', entidade: ctx.t === 'nc' ? 'rnc' : 'analise', entidadeId: ctx.t === 'nc' ? I.r.id : I.x.id, resumo: I.ref + ': ' + resumo });
  if (ctx.t === 'anp') { const p = Object.assign({}, patch, { rev: rev, em: ts, porId: u.id, porNome: u.nome, hist: hist }); Object.assign(I.x, p); return Data.col('sv2_analise').update(I.x.id, p); }
  const doc = Object.assign({ rid: I.r.id, ncId: I.nc.id, respId: I.resp.id, respNome: I.resp.nome, respHist: [] }, cur || {}, patch, { rev: rev, em: ts, porId: u.id, porNome: u.nome, hist: hist }); delete doc.id;
  S.rncPlano = S.rncPlano.filter(x => x.ncId !== I.nc.id).concat([Object.assign({ id: I.nc.id }, doc)]);
  return Data.col('sv2_rnc_plano').set(I.nc.id, doc);
}
function anSalvar() {
  const f = S.fm; if (!f) return; anLeCampos(); const I = anInfo(f.ctx); if (!I || !I.podeEd) return lcErro('Só ' + ((I && I.resp.nome) || 'o responsável') + ' escreve esta análise.');
  if (f.outra === true && String(f.outraQ || '').trim().length < 2) return lcErro('Diga em quais áreas pode acontecer.');
  if (f.cont && f.contData > hojeISO()) return lcErro('A data do que foi feito não pode ser depois de hoje.');
  if (!lcTravar()) return;
  const dados = anParaDoc(f), key = 'cw-an-' + anKey(f.ctx);
  try { Store.set(key, JSON.stringify(Object.assign({ ts: nowISO() }, dados))); } catch {}
  if (((I.doc && I.doc.rev) || 0) !== f.rev0) { f._trava = 0; return lcErro('Esta análise mudou em outro aparelho ou por outra pessoa depois que você abriu. Nada foi gravado por cima: o seu texto ficou guardado neste aparelho. Feche e abra de novo para comparar.'); }
  const falta = anFalta(I, Object.assign({}, I.doc || {}, dados));
  const p = anGravar(I, f.ctx, dados, 'análise salva' + (dados.causa ? ' · causa: ' + dados.causa : ''), f.rev0);
  p.then(() => { try { Store.del(key); } catch {} }, () => {});
  lcGrava([p], 'Análise salva' + (falta.length ? ' (ainda falta ' + falta.map(k => AN_FALTA_TXT[k]).join(', ') + ').' : '.'));
}

/* ---------- só ver (quem não é o responsável) ---------- */
function anVer(ctx) {
  gvAbrir(() => {
    const I = anInfo(ctx); if (!I) return null; const d = I.doc || {}, ct = d.contencao, pq = (d.porques || []).filter(Boolean), at = anIshiAtivas(d.ishi);
    let c = anCab(I, d);
    if (ct) c += '<p class="gv-h">O que foi feito' + (I.direta ? '' : ' na hora') + '</p>' + gvCampos([['O que', ct.texto], ['Quando', fmtD(ct.data) + ' · ' + (ct.porNome || '')]]);
    if (!I.direta) {
      if (pq.length) c += '<p class="gv-h">5 Porquês</p><ol class="an-ol">' + pq.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>';
      if (at.length) c += '<p class="gv-h">Ishikawa (6M)</p><div class="an-fw">' + anPeixe(I.cabeca, d.ishi, d.ishiPri) + '</div>';
      c += gvCampos([['Causa', d.causa || ''], ['Categoria (6M)', d.m6 || ''], ['Outra área', d.outra ? (d.outra.sim ? 'Sim' + (d.outra.quais ? ': ' + d.outra.quais : '') : 'Não') : '']]);
      c += '<p class="gv-h">Plano de ação (5W2H)</p>' + anAcoesHTML(I, false);
    }
    c += '<p class="gv-h">Eficácia</p>' + anEficHTML(I);
    if (!anComecado(d) && !ct) c += '<p class="cl-nt">Ainda sem análise.' + (I.aberto ? ' Só ' + esc(I.resp.nome || 'o responsável') + ' escreve.' : '') + '</p>';
    if (d.em) c += '<small class="cl-nt">Última alteração: ' + esc((d.porNome || '') + ' · ' + fmtDT(d.em)) + '</small>';
    const pe = (anPodeEficAgora(I) ? '<button type="button" class="bt pr" data-act="an-efic">Registrar a eficácia</button>' : '') + (I.t === 'anp' && I.podeLider ? '<button type="button" class="bt" data-act="anp-canc">Cancelar a análise</button>' : '');
    return { ico: 'lista', sub: I.sub, titulo: I.titulo, pill: I.nc ? anSelo(ctx) : anpSitPill(I.x), corpo: c, rodape: (pe ? '<div class="ap-pe">' + pe + '</div>' : ''),
      cabAcoes: '<button type="button" class="bt ic-so" data-act="an-imp" title="Imprimir a análise" aria-label="Imprimir a análise">' + ic('impressora') + '</button>' };
  });
  S._anCtx = ctx; render();
}

/* ---------- ações 5W2H ---------- */
function anAcAbrir(id) {
  const f = S.fm; if (!f || f.k !== 'anPl') return; anLeCampos(); const I = anInfo(f.ctx); if (!I || !I.podeEd) return;
  const a = id ? ((I.doc || {}).acoes || []).find(x => x.id === id) : null;
  anSub({ k: 'anAc', ctx: f.ctx, acId: id || '', rev0: (I.doc && I.doc.rev) || 0, oque: a ? a.oque : '', quem: a ? a.quemNome : I.resp.nome, quando: a ? a.quando : addDias(hojeISO(), 7), onde: a ? a.onde || '' : (I.nc ? I.nc.local : (I.x.local || '')), porque: a ? a.porque || '' : '', como: a ? a.como || '' : '', quanto: a ? a.quanto || '' : '' });
}
/* formulário por cima da análise (ação, eficácia, responsável, tratamento): troca no mesmo lugar, sem camada nova;
   Cancelar/Esc volta para a análise com o que estava escrito; gravar volta para ela já atualizada */
function anSub(estado) { const f = S.fm; if (f && f.k === 'anPl') { anLeCampos(); S._anVolta = Object.assign({}, f); S.fm = Object.assign({ msg: '', sujo: false }, estado, { volta: anVoltaCancela }); gvDesenha(true); return true; } S._anVolta = null; return false; }
function anVoltaCancela() { const v = S._anVolta; S._anVolta = null; if (v) lcAbrir(v, v.volta); }
function anFimSub(ps, msg) {
  const v = S._anVolta; if (!v) { lcGrava(ps, msg); return; }
  S._anVolta = null; aviso(msg); Promise.all(ps).catch(e => { console.error(e); aviso(svErro(e), 'erro'); });
  const I = anInfo(v.ctx);
  if (!I || !I.podeEd) { S.fm = null; S.gvForm = false; csCamadaSaiu('fm', () => { if (I) anVer(v.ctx); else gvFecharSo(); }); return; }
  Object.assign(v, { rev0: (I.doc && I.doc.rev) || 0, _trava: 0, msg: '' }); S.fm = v; gvDesenha(true);
}
LC_FORM.anAc = f => { const I = anInfo(f.ctx); if (!I) return null;
  return { ico: 'lista', sub: I.ref, titulo: f.acId ? 'Editar a ação' : 'Nova ação (5W2H)', corpo: lcMsg() + lcBl('O quê', lcIn('oque', f.oque, ' placeholder="ex.: trocar a fiação por cabo em eletroduto"')) +
    '<div class="fm-g cl-fm2">' + lcBl('Quem', lcIn('quem', f.quem, ' list="an-dl-pes"') + auDl('an-dl-pes', S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').map(u => u.nome).sort(cmpTxt))) + lcBl('Quando', lcData('quando', f.quando, true)) + '</div>' +
    '<div class="fm-g cl-fm2">' + lcBl('Onde', lcIn('onde', f.onde, '')) + lcBl('Por quê', lcIn('porque', f.porque, ' placeholder="opcional"')) + '</div>' + '<div class="fm-g cl-fm2">' + lcBl('Como', lcIn('como', f.como, ' placeholder="opcional"')) + lcBl('Quanto', lcIn('quanto', f.quanto, ' placeholder="opcional · ex.: R$ 480"')) + '</div>' +
    (I.r && I.r.prazo ? lcAv('O prazo da RNC é ' + esc(fmtD(I.r.prazo)) + '. Ação depois dele fica marcada.') : '') + lcAv('Quem faz a ação recebe o aviso no sino.'), rodape: lcPe('an-ac-ok', 'Salvar a ação') }; };
function anAcOk() {
  const f = S.fm; if (!f) return; const I = anInfo(f.ctx); if (!I || !I.podeEd) return lcErro('Só ' + ((I && I.resp.nome) || 'o responsável') + ' mexe nas ações.');
  const o = { oque: String(f.oque || '').trim(), onde: String(f.onde || '').trim(), porque: String(f.porque || '').trim(), como: String(f.como || '').trim(), quanto: String(f.quanto || '').trim(), quando: f.quando };
  const us = auUserDe(f.quem);
  if (((I.doc && I.doc.rev) || 0) !== f.rev0) return lcErro('Esta análise mudou em outro aparelho ou por outra pessoa depois que você abriu. Volte e abra de novo (nada foi gravado por cima).');
  if (o.oque.length < 3) return lcErro('Diga o que vai ser feito.');
  if (!us) return lcErro('Escolha quem faz (uma pessoa com conta no app).');
  if (!dataOk(o.quando)) return lcErro('Informe quando.');
  if (!lcTravar()) return;
  o.quemId = us.id; o.quemNome = us.nome; const ts = nowISO(), l = ((I.doc || {}).acoes || []), velha = f.acId ? l.find(x => x.id === f.acId) : null;
  const lista = velha ? l.map(x => x.id === f.acId ? Object.assign({}, x, o, { hist: (x.hist || []).concat([{ ts: ts, porNome: S.user.nome, o: 'editou', antes: { oque: x.oque, quemNome: x.quemNome, quando: x.quando } }]) }) : x)
    : l.concat([Object.assign({ id: uid(), st: 'aberta', criadoEm: ts, porNome: S.user.nome, hist: [] }, o)]);
  const p = anGravar(I, f.ctx, { acoes: lista }, (velha ? 'ação editada: ' : 'nova ação: ') + o.oque + ' · ' + o.quemNome + ' até ' + fmtD(o.quando), f.rev0);
  if (us.id !== S.user.id && (!velha || velha.quemId !== us.id)) Notif.send({ nivel: 'aviso', titulo: 'Ação para você', texto: I.ref + ': ' + o.oque + ' — até ' + fmtD(o.quando) + '. Responsável pela resposta: ' + I.resp.nome + '.', para: [us.id], refTipo: f.ctx.t === 'nc' ? 'rnc_acao' : 'analise', refId: f.ctx.t === 'nc' ? I.r.id : I.x.id }).catch(() => {});
  anFimSub([p], velha ? 'Ação alterada.' : 'Ação criada.');
}
LC_FORM.anAcSt = f => { const I = anInfo(f.ctx); const a = I && ((I.doc || {}).acoes || []).find(x => x.id === f.acId); if (!a) return null; const fe = f.st === 'feita';
  return { ico: fe ? 'ok' : 'x', sub: a.oque + ' · ' + a.quemNome + ' até ' + fmtD(a.quando), titulo: fe ? 'Concluir a ação' : 'Cancelar a ação', corpo: lcMsg() + (fe ? '<div class="fm-g cl-fm2">' + lcBl('Quando foi feita', lcData('data', f.data)) + lcBl('O que foi feito', lcIn('texto', f.texto, ' placeholder="opcional"')) + '</div>' : lcBl('Motivo', lcTx('texto', f.texto, 'obrigatório')) + lcAv('A ação fica guardada, marcada como cancelada.')),
    rodape: lcPe('an-ac-st-ok', fe ? 'Concluir' : 'Cancelar a ação') }; };
function anAcStOk() {
  const f = S.fm; if (!f) return; const I = anInfo(f.ctx); if (!I || !I.podeEd) return lcErro('Só o responsável pela resposta mexe nas ações.');
  if (((I.doc && I.doc.rev) || 0) !== f.rev0) return lcErro('Esta análise mudou em outro aparelho ou por outra pessoa depois que você abriu. Volte e abra de novo (nada foi gravado por cima).');
  const fe = f.st === 'feita', t = String(f.texto || '').trim(); let muda;
  if (fe) { if (!dataOk(f.data) || f.data > hojeISO()) return lcErro('A data não pode ser depois de hoje.'); muda = { st: 'feita', feitaEm: f.data, feitaPor: S.user.nome, feitaTxt: t }; }
  else { if (t.length < 5) return lcErro('Escreva o motivo.'); muda = { st: 'cancelada', cancEm: hojeISO(), cancPor: S.user.nome, cancMotivo: t }; }
  if (!lcTravar()) return;
  const a = I.doc.acoes.find(x => x.id === f.acId), ts = nowISO(), lista = I.doc.acoes.map(x => x.id === f.acId ? Object.assign({}, x, muda, { hist: (x.hist || []).concat([{ ts: ts, porNome: S.user.nome, o: muda.st, motivo: t }]) }) : x);
  anFimSub([anGravar(I, f.ctx, { acoes: lista }, (fe ? 'ação feita: ' : 'ação cancelada: ') + a.oque + (t ? ' — ' + t : ''), f.rev0)], fe ? 'Ação concluída.' : 'Ação cancelada.');
}

/* ---------- eficácia (o auditor ou o líder confere depois) ---------- */
LC_FORM.anEf = f => { const I = anInfo(f.ctx); if (!I) return null; const desde = anEficDesde(I);
  return { ico: 'ok', sub: I.ref, titulo: 'Eficácia', corpo: lcMsg() + (desde && desde > hojeISO() ? lcAv('O combinado é conferir a partir de ' + esc(fmtD(desde)) + '. Pode registrar antes, se já deu para ver.', 'wa') : '') + apPasso(1, 'O problema voltou?') +
    '<div class="ap-gb an-gb2"><button type="button" class="ap-gbt r-resolvida' + (f.res === 'eficaz' ? ' on' : '') + '" data-act="an-ef-pick" data-v="eficaz">Eficaz · não voltou</button><button type="button" class="ap-gbt r-nao' + (f.res === 'nao' ? ' on' : '') + '" data-act="an-ef-pick" data-v="nao">Não eficaz · voltou</button></div>' +
    apPasso(2, 'Como foi conferido') + '<div class="fm-g cl-fm2">' + lcBl('O que viu', lcIn('texto', f.texto, ' placeholder="ex.: conferido no local, cabo em eletroduto"')) + lcBl('Quando', lcData('data', f.data)) + '</div>' +
    (f.res === 'nao' ? lcAv('Não eficaz reabre a análise para ' + esc(I.resp.nome) + ', que recebe o aviso no sino.', 'cr') : (I.t === 'anp' ? lcAv('Eficaz conclui a análise.') : '')), rodape: lcPe('an-ef-ok', 'Registrar') }; };
function anEfOk() {
  const f = S.fm; if (!f) return; const I = anInfo(f.ctx); if (!I || !I.podeEfic) return lcErro(I && I.t === 'anp' ? 'Só o líder registra a eficácia.' : 'Só o auditor ou o líder registra a eficácia.');
  if (!f.res) return lcErro('Diga se foi eficaz ou não.');
  const t = String(f.texto || '').trim(); if (t.length < 3) return lcErro('Escreva como foi conferido.');
  if (!dataOk(f.data) || f.data > hojeISO()) return lcErro('A data não pode ser depois de hoje.');
  if (f.res === 'eficaz') { const p = anPend(f.ctx); if (I.t === 'anp' && (anFalta(I).length || anAtivas(I.doc.acoes).some(a => a.st !== 'feita'))) return lcErro('Ainda não dá para concluir: análise completa e todas as ações feitas.'); if (I.t === 'nc' && p.length) return lcErro('Ainda falta: ' + p.join('; ') + '.'); }
  if (!lcTravar()) return;
  const ef = { res: f.res, texto: t, data: f.data, porId: S.user.id, porNome: S.user.nome, ts: nowISO() }, d = I.doc || {};
  const patch = { efic: ef, eficHist: (d.eficHist || []).concat(d.efic ? [d.efic] : []) };
  if (I.t === 'anp' && f.res === 'eficaz') Object.assign(patch, { situacao: 'concluida', concluidaEm: nowISO(), concluidaPor: S.user.nome });
  const p = anGravar(I, f.ctx, patch, (f.res === 'eficaz' ? 'eficaz' : 'não eficaz, análise reaberta') + ' — ' + t, null);
  if (I.resp.id && I.resp.id !== S.user.id) Notif.send({ nivel: f.res === 'nao' ? 'aviso' : 'info', titulo: f.res === 'eficaz' ? 'Ação eficaz' : 'Ação não foi eficaz: análise reaberta', texto: I.ref + ' — ' + t, para: [I.resp.id], refTipo: f.ctx.t === 'nc' ? 'rnc_plano' : 'analise', refId: f.ctx.t === 'nc' ? I.r.id : I.x.id }).catch(() => {});
  anFimSub([p], f.res === 'eficaz' ? (I.t === 'anp' ? I.x.numero + ' concluída.' : 'Eficácia registrada.') : 'Registrado: não eficaz. A análise foi reaberta.');
}

/* ---------- trocar o responsável pela resposta e o tratamento (líder ★, com motivo) ---------- */
LC_FORM.anResp = f => { const I = anInfo(f.ctx); if (!I) return null; const us = S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').sort((a, b) => cmpTxt(a.nome, b.nome));
  return { ico: 'pessoas', sub: I.ref + ' · hoje: ' + I.resp.nome, titulo: 'Trocar o responsável pela resposta', corpo: lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Novo responsável', ddHTML('anf:resp', f.resp, [['', 'Escolha…']].concat(us.map(u => [u.id, u.nome])))) + lcBl('Motivo', lcIn('motivo', f.motivo, '')) + '</div>' + lcAv('O que já foi escrito fica. Só o novo responsável passa a escrever.'), rodape: lcPe('an-resp-ok', 'Trocar') }; };
function anRespOk() {
  const f = S.fm; if (!f) return; const I = anInfo(f.ctx); if (!I || !I.podeLider) return lcErro('Só o líder ★ troca o responsável.');
  if (!f.resp) return lcErro('Escolha o novo responsável.'); if (f.resp === I.resp.id) return lcErro('Essa pessoa já é a responsável.');
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const nome = nomeDe(f.resp), d = I.doc || {}, patch = { respId: f.resp, respNome: nome, respHist: (d.respHist || []).concat([{ de: I.resp.nome, para: nome, motivo: m, porNome: S.user.nome, ts: nowISO() }]) };
  if (f.resp !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Análise para você responder', texto: I.ref + ': agora a resposta é sua. ' + S.user.nome + ': ' + m, para: [f.resp], refTipo: f.ctx.t === 'nc' ? 'rnc_plano' : 'analise', refId: f.ctx.t === 'nc' ? I.r.id : I.x.id }).catch(() => {});
  anFimSub([anGravar(I, f.ctx, patch, 'responsável ' + I.resp.nome + ' → ' + nome + ' · ' + m, null)], 'Responsável trocado.');
}
LC_FORM.anTrat = f => { const I = anInfo(f.ctx); if (!I) return null; const at = anTrat(I.nc);
  return { ico: 'ajuste', sub: I.ref + ' · hoje: ' + AN_TRAT[at], titulo: 'Trocar o tratamento', corpo: lcMsg() + '<div class="ap-gb an-gb2">' + ['direta', 'analise'].map(v => '<button type="button" class="ap-gbt' + ((f.para || at) === v ? ' on' : '') + '" data-act="an-trat-pick" data-v="' + v + '">' + AN_TRAT[v] + '</button>').join('') + '</div>' +
    lcBl('Motivo', lcIn('motivo', f.motivo, ' placeholder="ex.: precisa achar a causa"')) + lcAv('Direta pede só o que foi feito e quando. Com análise pede o que o risco manda. O que já foi escrito não se apaga.'), rodape: lcPe('an-trat-ok', 'Trocar') }; };
function anTratOk() {
  const f = S.fm; if (!f) return; const I = anInfo(f.ctx); if (!I || !I.podeLider) return lcErro('Só o líder ★ troca o tratamento.');
  const de = anTrat(I.nc), para = f.para || de; if (para === de) return lcErro('Já é ' + AN_TRAT[de].toLowerCase() + '.');
  if (para === 'direta' && I.fx === 'alto') return lcErro('Risco Alto é sempre com análise.');
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const ts = nowISO(), passo = { de: de, para: para, porId: S.user.id, porNome: S.user.nome, ts: ts, motivo: m }, r = I.r;
  const ncs = (r.ncs || []).map(y => y.id === I.nc.id ? Object.assign({}, y, { trat: para, tratHist: (y.tratHist || []).concat([passo]) }) : y); r.ncs = ncs;
  Audit.log({ acao: 'rnc_tratamento', entidade: 'rnc', entidadeId: r.id, resumo: I.ref + ': tratamento ' + AN_TRAT[de] + ' → ' + AN_TRAT[para] + ' · motivo: ' + m });
  if (I.resp.id && I.resp.id !== S.user.id) Notif.send({ nivel: 'aviso', titulo: 'Tratamento da NC mudou', texto: I.ref + ': agora é ' + AN_TRAT[para].toLowerCase() + '. ' + S.user.nome + ': ' + m, para: [I.resp.id], refTipo: 'rnc_plano', refId: r.id }).catch(() => {});
  anFimSub([Data.col('sv2_rnc').update(r.id, { ncs: ncs, atualizadoEm: ts })], 'Tratamento: ' + AN_TRAT[para].toLowerCase() + '.');
}

/* ---------- imprimir a análise (A4 deitado, como o EFClaudian) ---------- */
function anFolha(I, d, folha) {
  const pq = (d.porques || []).filter(Boolean), ct = d.contencao, l = anAtivas(d.acoes);
  return '<section class="au-fl an-fl"><div class="au-ic"><b>' + esc(I.titulo) + '</b><span>' + esc(I.ref) + '</span></div>' +
    '<div class="au-ikv">' + [['Problema', I.nc ? I.nc.nc : I.x.titulo], ['Responsável pela resposta', I.resp.nome], ['Tratamento', I.nc ? AN_TRAT[anTrat(I.nc)] : 'Com análise'], ['O que foi feito' + (I.direta ? '' : ' na hora'), ct ? ct.texto + ' (' + fmtD(ct.data) + ')' : ''], ['Causa', d.causa || ''], ['Categoria (6M)', d.m6 || ''],
      ['Outra área', d.outra ? (d.outra.sim ? 'Sim' + (d.outra.quais ? ': ' + d.outra.quais : '') : 'Não') : ''], ['Eficácia', d.efic ? (d.efic.res === 'eficaz' ? 'Eficaz' : 'Não eficaz') + ' · ' + fmtD(d.efic.data) + ' · ' + d.efic.texto : '']].filter(x => x[1]).map(x => '<span><small>' + esc(x[0]) + '</small>' + esc(x[1]) + '</span>').join('') + '</div>' +
    (pq.length ? '<div class="an-ipq"><b>5 Porquês</b><ol>' + pq.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' : '') +
    (anIshiAtivas(d.ishi).length ? '<div class="an-ifish">' + anPeixe(I.cabeca, d.ishi, d.ishiPri, 900) + '</div>' : '') +
    (l.length ? '<table class="au-itb"><thead><tr><th>O quê</th><th>Quem</th><th>Quando</th><th>Onde</th><th>Por quê</th><th>Como</th><th>Quanto</th><th>Situação</th></tr></thead><tbody>' + l.map(a => '<tr><td>' + esc(a.oque) + '</td><td>' + esc(a.quemNome || '') + '</td><td>' + esc(fmtD(a.quando)) + '</td><td>' + esc(a.onde || '') + '</td><td>' + esc(a.porque || '') + '</td><td>' + esc(a.como || '') + '</td><td>' + esc(a.quanto || '') + '</td><td>' + esc(AN_AC_ST[anAcSt(a)][0] + (a.feitaEm ? ' ' + fmtD(a.feitaEm) : '')) + '</td></tr>').join('') + '</tbody></table>' : '') +
    (folha ? '<div class="au-ipe">Folha ' + folha + '</div>' : '') + '</section>';
}
async function anImprimir(ctx) {
  const I = anInfo(ctx); if (!I) return; const f = S.fm && S.fm.k === 'anPl' ? (anLeCampos(), S.fm) : null;
  const d = f ? Object.assign({}, I.doc || {}, anParaDoc(f)) : (I.doc || {});
  let el = $('#au-imp'); if (!el) { el = document.createElement('div'); el.id = 'au-imp'; document.body.appendChild(el); }
  el.innerHTML = anFolha(I, d, 0); el.setAttribute('data-modo', 'analise');
  document.body.classList.add('au-imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('au-imprimindo'); }, 80);
}

/* ---------- cliques ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="an-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm, ctx = (f && f.ctx) || S._anCtx;
  if (a === 'an-abrir') { const p = String(id).split('|'); anAbrir({ t: 'nc', rid: p[0], ncId: p[1] }); }
  else if (a === 'an-salvar') anSalvar();
  else if (a === 'an-rasc' && f) { let r = null; try { r = JSON.parse(Store.get('cw-an-' + anKey(f.ctx)) || 'null'); } catch {} if (r) { Object.assign(f, anDoEstado(r), { rasc: '', sujo: true }); gvDesenha(true); } }
  else if (a === 'an-is-add' && f) { anLeCampos(); const txt = String(f.isTxt || '').trim(); if (txt.length < 3) return lcErro('Escreva a causa (pelo menos 3 letras).');
    if (anIshiAtivas(f.ishi).filter(c => c.m === f.isM).length >= AN_ISHI_MAX) return lcErro('Já são ' + AN_ISHI_MAX + ' causas em ' + f.isM + '.');
    f.ishi = f.ishi.concat([{ id: uid(), m: f.isM, t: txt, em: nowISO(), porNome: S.user.nome }]); if (!f.ishiPri && !anIshiAtivas(f.ishi).slice(0, -1).length) f.ishiPri = f.ishi[f.ishi.length - 1].id; f.isTxt = ''; f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'an-is-pri' && f) { anLeCampos(); f.ishiPri = id; f.sujo = true; gvDesenha(true); }
  else if (a === 'an-is-x' && f) { anLeCampos(); f.ishi = f.ishi.map(c => c.id === id ? Object.assign({}, c, { tirada: true, tiradaEm: nowISO(), tiradaPor: S.user.nome }) : c); if (f.ishiPri === id) f.ishiPri = ''; f.sujo = true; gvDesenha(true); }
  else if (a === 'an-ultimo' && f) { anLeCampos(); const u = f.pq.filter(x => String(x || '').trim()).slice(-1)[0]; if (!u) return lcErro('Escreva os “por quê” primeiro.'); f.causa = u.replace(/^.*\?\s*/, '') || u; f.sujo = true; gvDesenha(true); }
  else if (a === 'an-outra' && f) { anLeCampos(); f.outra = t.getAttribute('data-v') === '1'; f.sujo = true; gvDesenha(true); }
  else if (a === 'an-ac-nova') anAcAbrir('');
  else if (a === 'an-ac-ed') anAcAbrir(id);
  else if (a === 'an-ac-ok') anAcOk();
  else if ((a === 'an-ac-feita' || a === 'an-ac-canc') && f && f.k === 'anPl') { const I = anInfo(f.ctx); anSub({ k: 'anAcSt', ctx: f.ctx, acId: id, st: a === 'an-ac-feita' ? 'feita' : 'cancelada', texto: '', data: hojeISO(), rev0: (I.doc && I.doc.rev) || 0 }); }
  else if (a === 'an-ac-st-ok') anAcStOk();
  else if (a === 'an-efic' && ctx) { const e = { k: 'anEf', ctx: ctx, res: '', texto: '', data: hojeISO() }; if (!anSub(e)) lcAbrir(e, () => anVer(ctx)); }
  else if (a === 'an-ef-pick' && f) { anLeCampos(); f.res = t.getAttribute('data-v'); f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'an-ef-ok') anEfOk();
  else if (a === 'an-resp' && ctx) { const e = { k: 'anResp', ctx: ctx, resp: '', motivo: '' }; if (!anSub(e)) lcAbrir(e, () => anVer(ctx)); }
  else if (a === 'an-resp-ok') anRespOk();
  else if (a === 'an-trat' && ctx) { const e = { k: 'anTrat', ctx: ctx, para: '', motivo: '' }; if (!anSub(e)) lcAbrir(e, () => anVer(ctx)); }
  else if (a === 'an-trat-pick' && f) { anLeCampos(); f.para = t.getAttribute('data-v'); f.sujo = true; gvDesenha(true); }
  else if (a === 'an-trat-ok') anTratOk();
  else if (a === 'an-imp' && ctx) anImprimir(ctx);
  else if (a === 'an-fv') { const sv = t.querySelector('svg'); if (!sv) return; const d = document.createElement('div'); d.id = 'an-fv'; d.className = 'an-fv'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Diagrama de Ishikawa');
    d.innerHTML = '<div><b>Ishikawa (6M)</b><button type="button" class="bt ic-so" data-act="an-fv-x" aria-label="Fechar">' + ic('x') + '</button></div>' + sv.outerHTML; document.body.appendChild(d); csCamadaAbre('anfv', () => { const x = $('#an-fv'); if (x) x.remove(); }); }
  else if (a === 'an-fv-x') csVolta();
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && S.fm && S.fm.k === 'anPl' && e.target && e.target.getAttribute && e.target.getAttribute('data-fm') === 'isTxt') { e.preventDefault(); const b = $('#gv [data-act="an-is-add"]'); if (b) b.click(); } });
