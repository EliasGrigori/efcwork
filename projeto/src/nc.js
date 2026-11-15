/* EFCwork · nc.js — Qualidade › Não conformidades (v0.6.16). Prefixo: nq.
   Como no EFClaudian v2.102.41/50: a aba JUNTA as NCs dos apontamentos (sv2_apont, campo nc) e as das auditorias internas
   (sv2_rnc, depois de enviada a RNC). Não há coleção nova e nada se grava aqui: a tabela só lê, e cada linha abre a gaveta
   da origem (o apontamento ou a NC da auditoria), onde ficam as ações de sempre (Fechar NC, Conferir o retorno, Análise).
   Situação da NC da auditoria: fechada = RNC fechada ou retorno "Resolvida"; vencida = passou do prazo da RNC; senão aberta.
   Folha por pessoa: as NCs de um responsável ou corresponsável, em A4 em pé, com o "ciente em ___/___/______". */
const NQ_SIT = { vencida: ['Vencida', 'cr'], aberta: ['Aberta', 'wa'], fechada: ['Fechada', 'ok'] };
const NQ_GRUPOS = [['vencida', 'Vencidas'], ['aberta', 'Abertas'], ['fechada', 'Fechadas']];
const NQ_FOLHA = [['abertas', 'Abertas (inclui as vencidas)'], ['vencidas', 'Só as vencidas'], ['fechadas', 'Fechadas'], ['todas', 'Todas']];
TB_OCULTAS_PADRAO['nq-lista'] = ['co', 'gu', 'tr']; /* Corresponsáveis e Tratamento começam escondidos (estão em Colunas e na gaveta) */

function nqRncSit(r, n) { if (r.situacao === 'fechada' || (n.ret && n.ret.res === 'resolvida')) return 'fechada'; return r.prazo && r.prazo < hojeISO() ? 'vencida' : 'aberta'; }
function nqItens() {
  const ap = (S.apont || []).filter(a => a.nc).map(a => ({ key: 'ap|' + a.id, k: 'ap', a: a, prazo: a.nc.prazo || '', sit: apNcSit(a) }));
  const rn = []; auLista().forEach(r => { if (auSit(r) === 'registro') return; auNcs(r).forEach(n => rn.push({ key: 'au|' + r.id + '|' + n.id, k: 'au', r: r, n: n, prazo: r.prazo || '', sit: nqRncSit(r, n) })); });
  const gi = s => NQ_GRUPOS.findIndex(g => g[0] === s);
  return ap.concat(rn).sort((x, y) => gi(x.sit) - gi(y.sit) || (x.sit === 'fechada' ? String(y.prazo).localeCompare(String(x.prazo)) : String(x.prazo).localeCompare(String(y.prazo))) || (x.k === 'au' && y.k === 'au' ? x.n.n - y.n.n : 0));
}
const nqResp = x => x.k === 'ap' ? String(x.a.nc.responsavel || '').trim() : String(x.n.respNome || '').trim();
const nqCoresp = x => x.k === 'au' ? auCoresp(x.n).map(c => String(c.nome).trim()) : [];
const nqTexto = x => x.k === 'ap' ? apCat(x.a.categoria)[1] + (x.a.obs ? ' · ' + x.a.obs : '') : (x.n.titulo ? x.n.titulo + ' · ' : '') + (x.n.nc || '');
const nqLocal = x => x.k === 'ap' ? x.a.setor || '' : x.n.local || '';
const nqAtraso = x => x.sit === 'vencida' && x.prazo ? Math.max(1, Math.round((new Date(hojeISO() + 'T12:00:00') - new Date(x.prazo + 'T12:00:00')) / 864e5)) : 0;
const nqAtrasoTxt = x => { const d = nqAtraso(x); return d ? 'vencida há ' + d + (d === 1 ? ' dia' : ' dias') : ''; };
function nqSitPill(x) { const s = NQ_SIT[x.sit] || NQ_SIT.aberta;
  return '<span class="pill ' + esc(s[1]) + '">' + esc(s[0]) + '</span>' + (x.k === 'au' && x.n.ret && x.sit !== 'fechada' ? ' <span class="pill ' + esc(AU_RES[x.n.ret.res][1]) + '">' + esc(AU_RES[x.n.ret.res][0]) + '</span>' : ''); }
function nqGravPill(x) { if (x.k === 'ap') { const g = apGrav(x.a.grav); return '<span class="pill ' + esc(g[2]) + '">' + esc(g[1]) + '</span>'; } return auGravPill(x.n); } /* a GUT fica na gaveta da NC (e na coluna Prioridade GUT, escondida) */
const nqGut = x => { const g = x.k === 'au' && auGut(x.n.id); return g ? g.gut : null; };
const nqGrav = x => x.k === 'ap' ? apGrav(x.a.grav)[1] : (AU_GRAV[x.n.grav] || AU_GRAV.baixa)[0];
const nqTrat = x => x.k === 'au' ? AN_TRAT[anTrat(x.n)] : '';
const nqDe = key => nqItens().find(x => x.key === key) || null;
/* quem aparece numa NC: o responsável e os corresponsáveis (pelo nome, como no EFClaudian) */
function nqPapel(x, p) { if (!p) return ''; const k = auNorm(p); if (auNorm(nqResp(x)) === k) return 'resp'; return nqCoresp(x).some(c => auNorm(c) === k) ? 'co' : ''; }
function nqPessoas(l) { const m = new Map(), add = v => { const t = String(v || '').trim(); if (t.length >= 2 && !m.has(auNorm(t))) m.set(auNorm(t), t); }; l.forEach(x => { add(nqResp(x)); nqCoresp(x).forEach(add); }); return Array.from(m.values()).sort(cmpTxt); }

/* ---------- tela ---------- */
function nqTela() {
  const l = nqItens(), ab = l.filter(x => x.sit !== 'fechada'), venc = l.filter(x => x.sit === 'vencida').length;
  const meta = ['<span>' + ab.length + (ab.length === 1 ? ' aberta' : ' abertas') + ' de ' + esc(l.length) + '</span>', venc ? metaPl(venc + (venc === 1 ? ' vencida' : ' vencidas'), 'cr', 'alerta') : ''];
  const acoes = l.length ? '<button type="button" class="bt" data-act="nq-folha" title="Imprimir as NCs de uma pessoa, com o ciente">' + ic('impressora') + 'Folha por pessoa</button>' : '';
  const c = cabecalho({ titulo: 'Não conformidades', abaNome: 'Não conformidades', meta: meta.filter(Boolean), acoes: acoes });
  if (!l.length) return c + '<section class="pn"><div class="vazio">' + ic('escudo') + '<b>Nenhuma NC ainda.</b><span>Uma NC nasce de um apontamento (Inspeções › Apontamentos › Abrir NC) ou de uma auditoria interna (Inspeções › Auditoria interna, depois de enviar a RNC).</span></div></section>';
  return c + tbHTML({ id: 'nq-lista', titulo: 'Não conformidades', unidade: 'NCs', unidade1: 'NC', linhas: l, chave: x => x.key, aoClicar: nqAbre,
    grupos: { v: x => x.sit, ordem: NQ_GRUPOS }, busca: x => [nqTexto(x), nqLocal(x), nqResp(x), nqCoresp(x).join(' '), x.k === 'au' ? x.r.numero + ' ' + auNum(x.n.n) : 'apontamento'].join(' '), vazio: 'Nenhuma NC com este filtro.',
    cols: [{ k: 'pz', rot: 'Prazo', tipo: 'data', v: x => x.prazo, html: x => x.prazo ? '<span' + (x.sit === 'vencida' ? ' class="nq-venc"' : '') + '>' + esc(fmtD(x.prazo)) + '</span>' : '', titulo: x => nqAtrasoTxt(x) || (x.prazo ? 'prazo ' + fmtD(x.prazo) : '') },
      { k: 'si', rot: 'Situação', v: x => (NQ_SIT[x.sit] || NQ_SIT.aberta)[0], html: nqSitPill },
      { k: 'or', rot: 'Origem', v: x => x.k === 'ap' ? 'Apontamento' : x.r.numero, html: x => x.k === 'ap' ? 'Apontamento' : esc(String(x.r.numero || '').replace(/^RNC-\d{4}-/, 'RNC ')) + ' <span class="nq-n">' + esc(auNum(x.n.n)) + '</span>', titulo: x => x.k === 'ap' ? 'Apontamento de ' + fmtD(x.a.data) : x.r.numero + ' · ' + auNum(x.n.n) },
      { k: 'lo', rot: 'Local', v: nqLocal, cls: 'nq-lo', titulo: nqLocal },
      { k: 'nc', rot: 'Não conformidade', v: nqTexto, cls: 'forte', longo: true },
      { k: 'gr', rot: 'Gravidade', v: nqGrav, html: nqGravPill },
      { k: 're', rot: 'Responsável', v: x => nqResp(x) || 'Sem responsável', html: x => nqResp(x) ? esc(nqResp(x)) : '<span class="nq-n">sem responsável</span>' },
      { k: 'co', rot: 'Corresponsáveis', v: x => nqCoresp(x).join(', ') },
      { k: 'gu', rot: 'Prioridade GUT', tipo: 'num', v: nqGut },
      { k: 'tr', rot: 'Tratamento', v: nqTrat }] });
}
const nqQualOrig = TELAS.qualidade;
TELAS.qualidade = aba => aba === 'nc' ? nqTela() : nqQualOrig(aba);

/* a linha abre a gaveta da origem por cima desta tela; as ações (Fechar NC, Conferir o retorno, Análise) moram lá */
function nqAbre(key) { const p = String(key || '').split('|'); if (p[0] === 'ap') apAbre(p[1]); else if (p[0] === 'au') auNcAbre(p[1], p[2]); }

/* ---------- folha por pessoa (A4 em pé, com o ciente) ---------- */
LC_FORM.nqFolha = f => {
  const ps = nqPessoas(nqItens()), n = nqFolhaLista(f).length;
  const c = lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Pessoa', ddHTML('nq:pes', f.pes, [['', ps.length ? 'Escolha…' : 'Ninguém nas NCs']].concat(ps.map(p => [p, p])))) + lcBl('Quais', ddHTML('nq:sit', f.sit, NQ_FOLHA)) + '</div>' +
    lcAv(f.pes ? '<b>' + n + (n === 1 ? ' NC' : ' NCs') + '</b> de ' + esc(f.pes) + ' (como responsável ou corresponsável). A folha sai com a linha do ciente para a pessoa assinar.' : 'Escolha a pessoa: entram as NCs em que ela é responsável ou corresponsável.');
  return { ico: 'impressora', sub: 'Qualidade · Não conformidades', titulo: 'Folha por pessoa', corpo: c, rodape: lcPe('nq-folha-ok', 'Imprimir') };
};
DD_AO.nq = (k, v) => { if (!S.fm) return; S.fm[k] = v; S.fm.msg = ''; gvDesenha(true); };
function nqFolhaLista(f) {
  const F = { abertas: x => x.sit !== 'fechada', vencidas: x => x.sit === 'vencida', fechadas: x => x.sit === 'fechada', todas: () => true };
  return !f || !f.pes ? [] : nqItens().filter(x => nqPapel(x, f.pes)).filter(F[f.sit] || F.abertas);
}
function nqFolhaOk() {
  const f = S.fm; if (!f) return; if (!f.pes) return lcErro('Escolha a pessoa.');
  const l = nqFolhaLista(f); if (!l.length) return lcErro('Nenhuma NC de ' + f.pes + ' neste filtro. Troque em "Quais".');
  const fNome = (NQ_FOLHA.find(x => x[0] === f.sit) || NQ_FOLHA[0])[1], nR = l.filter(x => nqPapel(x, f.pes) === 'resp').length, e = S.empresa || {};
  const lin = x => '<tr><td>' + (x.k === 'ap' ? 'Apontamento<br>' + esc(fmtD(x.a.data)) : esc(x.r.numero) + '<br><b>' + esc(auNum(x.n.n)) + '</b>') + '</td><td>' + esc(nqLocal(x)) + '</td><td class="nq-it">' + esc(nqTexto(x)) +
    (x.k === 'au' && (nqCoresp(x).length || nqPapel(x, f.pes) === 'co') ? '<br><small>Resp.: ' + esc(nqResp(x) || '—') + (nqCoresp(x).length ? ' · Corresp.: ' + esc(nqCoresp(x).join(', ')) : '') + '</small>' : '') + '</td><td>' + (nqPapel(x, f.pes) === 'co' ? 'Corresponsável' : 'Responsável') + '</td><td>' + esc(fmtD(x.prazo) || '—') + '</td><td>' + esc((NQ_SIT[x.sit] || NQ_SIT.aberta)[0]) + (x.k === 'au' && x.n.ret ? ' · ' + esc(AU_RES[x.n.ret.res][0]) : '') + '</td></tr>';
  const html = '<div class="nq-imp"><div class="au-ic"><b>Não conformidades de ' + esc(f.pes) + '</b><span>' + esc([e.nome, 'emitido em ' + fmtD(hojeISO()) + ' por ' + S.user.nome].filter(Boolean).join(' · ')) + '</span></div>' +
    '<div class="nq-ik"><span><small>Pessoa</small>' + esc(f.pes) + '</span><span><small>Quais</small>' + esc(fNome) + '</span><span><small>NCs</small>' + esc(l.length) + '</span><span><small>Como responsável</small>' + esc(nR) + '</span><span><small>Como corresponsável</small>' + esc((l.length - nR)) + '</span></div>' +
    '<table class="au-itb nq-itb"><thead><tr><th>Origem</th><th>Local</th><th>Não conformidade</th><th>Papel</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>' + l.map(lin).join('') + '</tbody></table>' +
    '<div class="nq-ass"><span>' + esc(f.pes) + ' · ciente em ___/___/______</span><span>Qualidade</span></div></div>';
  Audit.log({ acao: 'imprimir', entidade: 'nc_pessoa', entidadeId: f.pes, resumo: 'Imprimiu as NCs de ' + f.pes + ' (' + fNome + ', ' + esc(l.length) + ')' });
  lcFim(); nqImprimir(html, 'Não conformidades de ' + f.pes, false);
}
/* impressão em A4 (em pé ou deitado), na mesma camada de impressão da Auditoria (#au-imp) */
function nqImprimir(html, titulo, deitado) {
  let el = $('#au-imp'); if (!el) { el = document.createElement('div'); el.id = 'au-imp'; document.body.appendChild(el); }
  el.innerHTML = html; el.setAttribute('data-modo', 'qualidade');
  let pg = $('#nq-page'); if (!pg) { pg = document.createElement('style'); pg.id = 'nq-page'; document.head.appendChild(pg); }
  pg.textContent = '@media print{@page{size:A4 ' + (deitado ? 'landscape' : 'portrait') + ';margin:10mm}}';
  const t0 = document.title; document.title = titulo; document.body.classList.add('au-imprimindo');
  setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('au-imprimindo'); document.title = t0; const p2 = $('#nq-page'); if (p2) p2.remove(); }, 80);
}

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="nq-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'nq-folha') { const tb = S.tb['nq-lista'], c = tb && tb.cf && tb.cf.re, pes = c && c.sel && c.sel.length === 1 ? c.sel[0] : ''; lcAbrir({ k: 'nqFolha', pes: pes && pes !== 'Sem responsável' ? pes : '', sit: 'abertas' }); }
  else if (a === 'nq-folha-ok') nqFolhaOk();
});
