/* EFCwork · auditoria.js — Inspeções › Auditoria interna (RNC) (v0.6.2). Prefixo: au.
   Mesmos dados do EFClaudian v2.102.60: sv2_rnc (uma auditoria com as NCs dentro), sv2_rnc_foto (uma foto por documento)
   e sv2_rnc_gut (a nota GUT de cada NC, id = id da NC). Nada de coleção nova.
   Decisões do Elias (11/11): UMA RNC por auditoria interna (40 a 70 NCs, rota que não é padrão); tela "tudo à mostra"
   (OPÇÃO 3): cada responsável é um painel, os locais dentro e as NCs visíveis, com seletor de agrupamento (responsável,
   setor, local, achado) e de ordenação dentro (local, prioridade, número); "+ NC aqui" em cada local. O responsável vem do
   local/setor, nunca do achado: o app não junta NCs parecidas sozinho. Registrar NC numa gaveta em passos (OPÇÃO A) com a
   GUT no padrão do EFClaudian (G, U e T de 1 a 5, cada nota explicada; G × U × T; alto ≥ 48, médio ≥ 18; G = 5 nunca é
   baixo). Só o Líder ★, o Administrador ou o auditor da RNC registram e enviam. Nada se apaga: NC tirada e RNC cancelada
   ficam guardadas com o motivo. A apresentação (Nº 45) e o relatório estão em auapres.js. Plano de ação: v0.6.3. */
Object.assign(S, { rnc: [], rncGut: [], _auFotos: {}, _auFotoDoc: {} });
const AU_AREAS = [['campo', 'Campo'], ['estrutura', 'Estrutura']];
const AU_GRAV = { maior: ['Maior', 'cr'], media: ['Média', 'wa'], baixa: ['Baixa', ''] };
const AU_RES = { resolvida: ['Resolvida', 'ok'], parcial: ['Parcial', 'wa'], nao: ['Não resolvida', 'cr'] };
const AU_TIPOS = ['Global G.A.P.', 'Ecocert Orgânico'];
const AU_MAX_FOTOS = 8, AU_LEIS_MAX = 5;
const AU_SIT = { registro: ['Registrando · passo 2 de 5', ''], retorno: ['Aguardando o retorno · passo 4 de 5', 'wa'], pronta: ['Conferida · falta fechar', 'wa'], fechada: ['Fechada', 'ok'] };
const AU_GUT_FX = { alto: ['Alto', 'cr'], medio: ['Médio', 'wa'], baixo: ['Baixo', ''] };
const AU_GUT_G = { maior: 5, media: 3, baixa: 1 };
const AU_GUT_TXT = {
  g: ['Gravidade', [['Sem gravidade', 'Oportunidade de melhoria, sem descumprir requisito'], ['Pouco grave', 'Falha de documento ou organização (ex.: assinatura faltando)'], ['Grave', 'Procedimento não seguido, sem chegar ao produto (ex.: falta um dia no registro de cloro)'], ['Muito grave', 'Afeta o produto ou o certificado, mas dá para segurar (ex.: lote sem rastreabilidade)'], ['Extremamente grave', 'Risco à saúde de quem come ou trabalha, ou perda de certificação (ex.: produto não permitido no orgânico)']]],
  u: ['Urgência', [['Longuíssimo prazo', 'Na próxima revisão'], ['Longo prazo', 'Até 90 dias'], ['Médio prazo', 'Até 30 dias'], ['Curto prazo', 'Até 7 dias'], ['Imediatamente', 'Hoje (produto saindo, auditoria nesta semana)']]],
  t: ['Tendência', [['Desaparece', 'Some sozinha'], ['Reduz-se ligeiramente', 'Melhora um pouco sozinha'], ['Permanece', 'Fica igual'], ['Aumenta', 'Piora em semanas'], ['Piora muito', 'Piora a cada dia (ex.: praga se espalhando)']]]
};
const AU_AGRUPA = [['resp', 'Agrupar por responsável'], ['setor', 'Agrupar por setor'], ['local', 'Agrupar por local'], ['achado', 'Agrupar por achado']];
const AU_ORDEM = [['local', 'Dentro: por local'], ['gut', 'Dentro: por prioridade'], ['n', 'Dentro: por número da NC']];

CS_CARGAS.push(() => {
  csOuve('sv2_rnc', l => { S.rnc = (l || []).filter(r => !r.teste); auRedesenha(); }, { order: 'criadoEm', limit: 300 });
  csOuve('sv2_rnc_gut', l => { S.rncGut = l || []; auRedesenha(); }, { limit: 5000 });
});
function auRedesenha() {
  if (typeof auAprDesenha === 'function' && S.auAp && !S.auAp.ed) auAprDesenha(); /* corrigindo: não redesenha (não perde o que está sendo digitado) */
  if (S.rota.area === 'inspecoes' && S.rota.aba === 'auditoria') render(); else if (S.gv) gvDesenha();
}

/* ---------- regras e leitura ---------- */
function auGutCalc(g, u, t) {
  g = Number(g) || 0; u = Number(u) || 0; t = Number(t) || 0; if (!g || !u || !t) return null;
  const v = g * u * t; let fx = v >= 48 ? 'alto' : v >= 18 ? 'medio' : 'baixo';
  if (g === 5 && fx === 'baixo') fx = 'medio'; /* piso de risco do EFClaudian */
  return { v: v, fx: fx };
}
const auDe = id => S.rnc.find(r => r.id === id) || null;
const auLista = () => S.rnc.filter(r => r.situacao !== 'cancelada' && !r.lixeira).sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)));
const auNcs = r => ((r && r.ncs) || []).filter(n => !n.cancelada).slice().sort((a, b) => a.n - b.n);
const auNc = (r, id) => ((r && r.ncs) || []).find(n => n.id === id) || null;
const auNum = n => 'NC ' + pad(n);
const auGut = ncId => S.rncGut.find(x => x.ncId === ncId && !x.cancelada) || null;
const auAreaNome = a => (AU_AREAS.find(x => x[0] === a) || ['', a || '—'])[1];
const auResp = n => String(n.respNome || '').trim() || 'Sem responsável';
const auCoresp = n => (n && Array.isArray(n.coresp) ? n.coresp : []).filter(x => x && String(x.nome || '').trim());
const auLeis = n => { if (!n) return []; const l = Array.isArray(n.leis) ? n.leis : (n.lei ? [n.lei] : []); return l.map(x => String(x || '').trim()).filter(Boolean); };
const auAchado = n => String(n.titulo || '').trim() || String(n.nc || '').trim();
const auNorm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
function auSit(r) {
  if (r.situacao === 'fechada') return 'fechada';
  if (r.situacao !== 'enviada') return 'registro';
  const l = auNcs(r); return l.length && l.every(n => n.ret) ? 'pronta' : 'retorno';
}
const auPode = r => { const u = S.user; return !!u && u.perfil !== 'visitante' && !u.bloqueado && (isSup(u) || (!!r && r.auditorId === u.id)); };
function auAtual() { const l = auLista(); return l.find(r => r.id === S.auRid) || l.find(r => auSit(r) !== 'fechada') || l[0] || null; }
/* prioridade para ordenar: a GUT; sem GUT, a gravidade */
const auPri = n => { const g = auGut(n.id); return g ? g.gut : ({ maior: 30, media: 12, baixa: 2 })[n.grav] || 0; };
const auGravPill = n => { const g = AU_GRAV[n.grav] || AU_GRAV.baixa; return '<span class="pill ' + g[1] + '">' + esc(g[0]) + '</span>'; };
const auGutPill = n => { const g = auGut(n.id); if (!g) return ''; const f = AU_GUT_FX[g.faixa] || AU_GUT_FX.baixo; return '<span class="pill ' + f[1] + '" title="' + esc('G ' + g.g + ' × U ' + g.u + ' × T ' + g.t) + '">GUT ' + esc(g.gut) + '</span>'; };
const auGut2Pill = n => { const g = n.gut2; if (!g || !g.gut) return ''; const f = AU_GUT_FX[g.faixa] || AU_GUT_FX.baixo; return '<span class="pill ' + f[1] + '" title="Segunda pontuação, na apresentação">2ª GUT ' + esc(g.gut) + '</span>'; };
const auRetPill = n => n.ret ? '<span class="pill ' + AU_RES[n.ret.res][1] + '">' + esc(AU_RES[n.ret.res][0]) + '</span>' : '';
const auAltas = l => l.filter(n => { const g = auGut(n.id); return g ? g.faixa === 'alto' : n.grav === 'maior'; }).length;
function auPrazoTxt(r) { if (!r.prazo) return ''; const d = Math.round((new Date(r.prazo + 'T12:00:00') - new Date(hojeISO() + 'T12:00:00')) / 86400000);
  return d < 0 ? 'prazo venceu há ' + (-d) + (d === -1 ? ' dia' : ' dias') : d === 0 ? 'prazo vence hoje' : 'faltam ' + d + (d === 1 ? ' dia' : ' dias'); }
function auNovoNumero() { const a = hojeISO().slice(0, 4), n = S.rnc.filter(r => String(r.numero || '').indexOf('RNC-' + a + '-') === 0).length + 1; return 'RNC-' + a + '-' + pad(n); }
const auSug = f => { const s = new Set(); S.rnc.forEach(r => (r.ncs || []).forEach(n => { const v = String(f(n) || '').trim(); if (v) s.add(v); })); return Array.from(s).sort(cmpTxt); };
function auLeisSug() { const s = new Set(); S.rnc.forEach(r => (r.ncs || []).forEach(n => auLeis(n).forEach(l => s.add(l)))); return Array.from(s).sort(cmpTxt); }
function auPessoas() { const s = new Map(), add = v => { const t = String(v || '').trim(); if (t.length >= 2 && !s.has(auNorm(t))) s.set(auNorm(t), t); };
  S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').forEach(u => add(u.nome));
  S.rnc.forEach(r => (r.ncs || []).forEach(n => { add(n.respNome); auCoresp(n).forEach(c => add(c.nome)); }));
  return Array.from(s.values()).sort(cmpTxt); }
const auUserDe = nome => S.users.find(u => !u.bloqueado && auNorm(u.nome) === auNorm(nome)) || null;
const auDl = (id, l) => '<datalist id="' + id + '">' + l.map(x => '<option value="' + esc(x) + '">').join('') + '</datalist>';
const auTrat = (grav, gc) => { const fx = gc ? gc.fx : grav === 'maior' ? 'alto' : grav === 'media' ? 'medio' : 'baixo'; return fx === 'baixo' ? 'direta' : 'analise'; };
const auLe = (k, pad0) => { try { return Store.get('cw-au-' + k) || pad0; } catch { return pad0; } };
const auGrava = (k, v) => { try { Store.set('cw-au-' + k, v); } catch {} };

/* ---------- fotos (evidência da auditoria: não entram na regra dos 30 dias) ---------- */
function auFotoGet(id) { if (S._auFotos[id] !== undefined && S._auFotos[id] !== '') return Promise.resolve(S._auFotos[id]);
  S._auFotos[id] = ''; return Data.col('sv2_rnc_foto').get(id).then(d => { const u = (d && d.dataUrl) || ''; S._auFotos[id] = u; S._auFotoDoc[id] = { base: (d && d.base) || '', marcas: d && Array.isArray(d.marcas) ? d.marcas : [], marcadoPor: (d && d.marcadoPor) || '', marcadoEm: (d && d.marcadoEm) || '' }; return u; }).catch(() => ''); }
function auFotosCarrega(raiz) { $$('img[data-aufoto]', raiz || document).forEach(im => { if (im.getAttribute('src')) return;
  auFotoGet(im.getAttribute('data-aufoto')).then(u => { if (u && imgSrc(u)) im.src = imgSrc(u); else { const q = im.parentNode; if (q && q.classList) q.classList.add('vz'); } }); }); }
GV_DEPOIS.push(g => auFotosCarrega(g));
const auFotoIMG = (id, cls) => '<img class="' + (cls || '') + '"' + (S._auFotos[id] && imgSrc(S._auFotos[id]) ? ' src="' + imgSrc(S._auFotos[id]) + '"' : ' data-aufoto="' + esc(id) + '"') + ' alt="Foto da NC">';
/* v0.6.4: marcar no formulário (foto nova ou já gravada: a gravada vira um registro novo ao salvar, a anterior fica) */
function auFotoMk(i) { const f = S.fm; if (!f) return; const x = (f.fotos || [])[i]; if (!x) return; const doc = x.id ? S._auFotoDoc[x.id] || {} : {}, src = x.url || S._auFotos[x.id]; if (!imgSrc(src)) return;
  fedAbrir({ src: src, base: x.base || doc.base || src, marcas: x.marcas || doc.marcas || [], sub: (auDe(f.rid) || {}).numero || '' }).then(r => { if (!r || !S.fm || S.fm !== f) return;
    f.fotos[i] = { url: r.img, base: r.base, marcas: r.marcas, mkPor: r.marcadoPor, mkEm: r.marcadoEm, subst: x.id || x.subst || '' }; f.sujo = true; gvDesenha(true); }); }
function auFotoOnde(id) { for (const r of S.rnc) for (const n of (r.ncs || [])) { if ((n.fotosAntes || []).indexOf(id) >= 0) return { r: r, n: n, papel: 'antes', l: n.fotosAntes }; if (n.ret && (n.ret.fotosDepois || []).indexOf(id) >= 0) return { r: r, n: n, papel: 'depois', l: n.ret.fotosDepois }; } return null; }
function auFotoAbrir(id) {
  const u = S._auFotos[id]; if (!imgSrc(u)) return; const w = auFotoOnde(id), doc = S._auFotoDoc[id] || {};
  const pode = !!w && auPode(w.r) && auSit(w.r) !== 'fechada';
  fedVer({ src: u, base: doc.base, marcas: doc.marcas, marcadoPor: doc.marcadoPor, marcadoEm: doc.marcadoEm, titulo: w ? w.r.numero + ' · ' + auNum(w.n.n) + ' · foto ' + (w.l.indexOf(id) + 1) + ' de ' + w.l.length + (w.papel === 'depois' ? ' (depois)' : '') : 'Foto',
    nome: w ? w.r.numero + '_' + auNum(w.n.n) + '_foto' + (w.l.indexOf(id) + 1) + '_' + w.papel : 'foto', marcar: pode ? () => auFotoMarcarGravada(id) : null });
}
function auFotoMarcarGravada(id) {
  const w = auFotoOnde(id), doc = S._auFotoDoc[id] || {}, src = S._auFotos[id]; if (!w || !imgSrc(src)) return;
  fedAbrir({ src: src, base: doc.base || src, marcas: doc.marcas || [], sub: w.r.numero + ' · ' + auNum(w.n.n) }).then(res => {
    if (!res) return; const r = w.r, nid = uid(), ts = nowISO();
    const o = { rncId: r.id, ncId: w.n.id, papel: w.papel, dataUrl: res.img, criadoEm: ts, porId: S.user.id, marcas: res.marcas, substitui: id };
    if (res.marcas.length) Object.assign(o, { base: res.base, marcadoPor: res.marcadoPor, marcadoEm: res.marcadoEm });
    S._auFotos[nid] = res.img; S._auFotoDoc[nid] = { base: o.base || '', marcas: o.marcas, marcadoPor: o.marcadoPor || '', marcadoEm: o.marcadoEm || '' };
    const troca = l => (l || []).map(x => x === id ? nid : x);
    const ncs = (r.ncs || []).map(y => y.id !== w.n.id ? y : w.papel === 'antes' ? Object.assign({}, y, { fotosAntes: troca(y.fotosAntes) }) : Object.assign({}, y, { ret: Object.assign({}, y.ret, { fotosDepois: troca(y.ret.fotosDepois) }) })); r.ncs = ncs;
    Promise.all([Data.col('sv2_rnc_foto').set(nid, o), Data.col('sv2_rnc').update(r.id, { ncs: ncs, atualizadoEm: ts })]).then(() => aviso(res.marcas.length ? 'Marcas salvas. A foto anterior fica guardada.' : 'Marcas tiradas. A foto anterior fica guardada.')).catch(e => aviso(svErro(e), 'erro'));
    Audit.log({ acao: 'rnc_foto_marcas', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · ' + auNum(w.n.n) + ': ' + (res.marcas.length ? res.marcas.length + ' marca(s) na foto' : 'marcas tiradas da foto') + ' (' + w.papel + ')' });
    if (S.gv) gvDesenha(); if (S.auAp && !S.auAp.ed) auAprDesenha(); render();
  });
}
function auFotoVer(id) { const u = S._auFotos[id]; if (!imgSrc(u)) return;
  const d = document.createElement('div'); d.id = 'au-fv'; d.className = 'co-fv'; d.innerHTML = '<img src="' + imgSrc(u) + '" alt="Foto da NC"><button type="button" class="bt ic-so" data-act="au-fv-x" aria-label="Fechar">' + ic('x') + '</button>';
  document.body.appendChild(d); csCamadaAbre('aufv', () => { const x = $('#au-fv'); if (x) x.remove(); }); }

/* ---------- tela: tudo à mostra (OPÇÃO 3) ---------- */
function auTela() {
  const u = S.user, lst = auLista(), r = auAtual(), sup = isSup(u);
  if (!r) {
    const h = cabecalho({ titulo: 'Auditoria interna', abaNome: 'Auditoria interna', meta: ['<span>Nenhuma auditoria aberta</span>'], acoes: sup ? '<button type="button" class="bt pr" data-act="au-abrir">' + ic('mais') + 'Abrir auditoria</button>' : '' });
    return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>Nenhuma auditoria interna ainda.</b><span>' + (sup ? 'Uma auditoria = uma RNC, com todas as não conformidades da inspeção dentro.' : 'Quando o seu líder abrir uma auditoria, ela aparece aqui.') + '</span></div></section>';
  }
  const ncs = auNcs(r), sit = auSit(r), pode = auPode(r), altas = auAltas(ncs);
  const meta = ['<span>' + esc(r.numero + ' · ' + (r.tipo || '') + ' · ' + ncs.length + (ncs.length === 1 ? ' NC' : ' NCs')) + '</span>', metaPl(AU_SIT[sit][0], AU_SIT[sit][1]),
    sit !== 'fechada' && r.prazo ? metaPl(auPrazoTxt(r), r.prazo < hojeISO() ? 'cr' : 'wa') : '', altas ? metaPl(altas + ' de prioridade alta', 'cr', 'alerta') : ''];
  let acoes = (lst.length > 1 ? ddHTML('au:rnc', r.id, lst.map(x => [x.id, x.numero + ' · ' + AU_SIT[auSit(x)][0].split(' · ')[0]])) : '') +
    '<button type="button" class="bt ic-so" data-act="au-rnc" data-id="' + esc(r.id) + '" title="Dados da RNC" aria-label="Dados da RNC">' + ic('info') + '</button>' +
    (ncs.length ? '<button type="button" class="bt ic-so" data-act="au-rel" data-id="' + esc(r.id) + '" title="Relatório" aria-label="Relatório">' + ic('impressora') + '</button><button type="button" class="bt" data-act="au-apr" data-id="' + esc(r.id) + '">' + ic('graf') + 'Apresentar</button>' : '');
  if (pode && sit === 'registro') acoes += (ncs.length ? '<button type="button" class="bt" data-act="au-enviar" data-id="' + esc(r.id) + '">Enviar RNC</button>' : '') + '<button type="button" class="bt pr" data-act="au-nova-nc" data-id="' + esc(r.id) + '">' + ic('mais') + 'Nova NC</button>';
  else if (pode && sit === 'retorno') acoes += '<button type="button" class="bt pr" data-act="au-conf" data-id="' + esc(r.id) + '">Conferir o retorno</button>';
  else if (pode && sit === 'pronta') acoes += '<button type="button" class="bt pr" data-act="au-fechar" data-id="' + esc(r.id) + '">Fechar a RNC</button>';
  else if (sit === 'fechada' && sup && !lst.some(x => auSit(x) !== 'fechada')) acoes += '<button type="button" class="bt pr" data-act="au-abrir">' + ic('mais') + 'Abrir auditoria</button>';
  let h = cabecalho({ titulo: 'Auditoria interna', abaNome: 'Auditoria interna', meta: meta.filter(Boolean), acoes: acoes });
  if (!ncs.length) return h + '<section class="pn"><div class="vazio">' + ic('lista') + '<b>' + esc(r.numero) + ' aberta, ainda sem NCs.</b>' + (pode ? '<span>Toque em “Nova NC” e registre a primeira não conformidade.</span>' : '') + '</div></section>';
  const a = auLe('a', 'resp'), o = auLe('o', 'local');
  const cont = k => new Set(ncs.map(AU_K1[k])).size;
  h += '<div class="au-bar">' + ddHTML('au:a', a, AU_AGRUPA.map(x => [x[0], x[1] + ' · ' + cont(x[0])])) + ddHTML('au:o', o, AU_ORDEM) + '</div>';
  return h + '<div class="au-bl">' + auGrupos(r, ncs, a, o).map(g => auPainel(r, g, a, pode && sit === 'registro')).join('') + '</div>';
}
const AU_K1 = { resp: n => auResp(n), setor: n => auAreaNome(n.area), local: n => String(n.local || '').trim() || '—', achado: n => auAchado(n) };
const AU_K2 = { resp: n => String(n.local || '').trim() || '—', setor: n => String(n.local || '').trim() || '—', local: n => auResp(n), achado: n => String(n.local || '').trim() || '—' };
function auGrupos(r, ncs, a, o) {
  const m = new Map();
  ncs.forEach(n => { const k1 = AU_K1[a](n), c1 = auNorm(k1); if (!m.has(c1)) m.set(c1, { nome: k1, sub: new Map() }); const g = m.get(c1), k2 = AU_K2[a](n), c2 = auNorm(k2);
    if (!g.sub.has(c2)) g.sub.set(c2, { nome: k2, ncs: [] }); g.sub.get(c2).ncs.push(n); });
  const gs = Array.from(m.values()).map(g => { const sub = Array.from(g.sub.values()); const tot = sub.reduce((s, x) => s.concat(x.ncs), []); return { nome: g.nome, sub: sub, ncs: tot }; });
  const ordN = l => o === 'gut' ? l.sort((x, y) => auPri(y) - auPri(x) || x.n - y.n) : l.sort((x, y) => x.n - y.n);
  gs.forEach(g => { g.sub.forEach(s => ordN(s.ncs));
    g.sub.sort(o === 'gut' ? (x, y) => Math.max.apply(null, y.ncs.map(auPri)) - Math.max.apply(null, x.ncs.map(auPri)) || cmpTxt(x.nome, y.nome) : o === 'n' ? (x, y) => x.ncs[0].n - y.ncs[0].n : (x, y) => cmpTxt(x.nome, y.nome)); });
  const ordA = n => { const i = AU_AREAS.findIndex(x => x[1] === n); return i < 0 ? 9 : i; };
  return gs.sort(a === 'setor' ? (x, y) => ordA(x.nome) - ordA(y.nome) : a === 'achado' ? (x, y) => y.ncs.length - x.ncs.length || cmpTxt(x.nome, y.nome)
    : (x, y) => (x.nome === 'Sem responsável') - (y.nome === 'Sem responsável') || cmpTxt(x.nome, y.nome));
}
function auPainel(r, g, a, regist) {
  const altas = auAltas(g.ncs), porResp = a === 'resp';
  const naLocal = a === 'local' && regist ? auNcAquiBt(r, g.ncs[0], '') : '';
  return '<section class="pn au-bk"><div class="hd"><h3>' + esc(g.nome) + '</h3><em>' + g.ncs.length + '</em>' + (altas ? '<span class="pill cr">' + altas + ' de prioridade alta</span>' : '') + '<span class="sp"></span>' + naLocal +
    (porResp ? '<button type="button" class="bt" data-act="au-apr" data-id="' + esc(r.id) + '" data-p="' + esc(g.nome) + '">' + ic('graf') + 'Apresentar</button><button type="button" class="bt ic-so" data-act="au-rel" data-id="' + esc(r.id) + '" data-p="' + esc(g.nome) + '" title="' + esc('Imprimir as folhas de ' + g.nome) + '" aria-label="' + esc('Imprimir as folhas de ' + g.nome) + '">' + ic('impressora') + '</button>' : '') + '</div>' +
    g.sub.map(s => '<div class="au-cl"><div class="au-clh"><b>' + esc(s.nome) + '</b><span>' + s.ncs.length + (s.ncs.length === 1 ? ' NC' : ' NCs') + '</span>' + (regist && a !== 'local' ? auNcAquiBt(r, s.ncs[0], a === 'achado' ? s.ncs[0].titulo || '' : '', a === 'resp') : '') + '</div>' + s.ncs.map(n => auLinha(r, n, a)).join('') + '</div>').join('') + '</section>';
}
function auNcAquiBt(r, n, titulo, comResp) {
  return '<button type="button" class="au-add" data-act="au-nc-aqui" data-id="' + esc(r.id) + '" data-area="' + esc(n.area || 'campo') + '" data-local="' + esc(n.local || '') + '"' + (titulo ? ' data-tit="' + esc(titulo) + '"' : '') + (comResp ? ' data-resp="' + esc(n.respNome || '') + '"' : '') + '>' + ic('mais') + 'NC aqui</button>';
}
function auLinha(r, n, a) {
  const f = (n.fotosAntes || [])[0], tit = String(n.titulo || '').trim(), extra = a === 'local' ? '' : a === 'resp' ? '' : ' · ' + auResp(n);
  return '<button type="button" class="au-nc g-' + esc(n.grav || 'baixa') + '" data-act="au-nc" data-id="' + esc(r.id) + '" data-nc="' + esc(n.id) + '"><span class="au-th' + (f ? '' : ' vz') + '">' + (f ? auFotoIMG(f) : ic('imagem')) + '</span><span class="au-nn">' + esc(auNum(n.n)) + '</span>' +
    '<span class="tx">' + (tit ? '<b>' + esc(tit) + '</b> · ' : '') + esc(n.nc || '') + (extra ? '<small>' + esc(extra) + '</small>' : '') + '</span><span class="au-pl">' + auGravPill(n) + auGutPill(n) + auGut2Pill(n) + (r.situacao === 'enviada' || r.situacao === 'fechada' ? anSelo({ t: 'nc', rid: r.id, ncId: n.id }) : '') + auRetPill(n) + '</span></button>';
}
DD_AO.au = (k, v) => { if (k === 'a' || k === 'o') { auGrava(k, v); render(); } else if (k === 'rnc') { S.auRid = v; render(); } };

/* ---------- detalhe da NC ---------- */
function auNcAbre(rid, ncId) {
  gvAbrir(() => {
    const r = auDe(rid), n = auNc(r, ncId); if (!r || !n) return null;
    const sit = auSit(r), pode = auPode(r), g = auGut(n.id), fotos = n.fotosAntes || [], dep = (n.ret && n.ret.fotosDepois) || [];
    const gal = (l, t) => !l.length ? '' : '<p class="gv-h">' + t + '</p><div class="ap-gal">' + l.map(f => '<button type="button" class="ap-fi" data-act="au-foto-ver" data-id="' + esc(f) + '">' + auFotoIMG(f) + '</button>').join('') + '</div>';
    let corpo = gal(fotos, 'Fotos do antes');
    const kv = [['Onde', auAreaNome(n.area) + ' › ' + (n.local || '')], ['Achado', n.titulo || ''], ['O que está errado', n.nc || ''], [auLeis(n).length > 1 ? 'Leis / requisitos' : 'Lei / requisito', auLeis(n).join('; ')],
      ['Responsável', auResp(n) + (n.ciente === true ? ' · estava ciente' : n.ciente === false ? ' · não estava ciente' : '')], ['Corresponsáveis', auCoresp(n).map(c => c.nome).join(', ')],
      ['Gravidade', (AU_GRAV[n.grav] || AU_GRAV.baixa)[0]], ['Prioridade GUT', g ? g.gut + ' (' + AU_GUT_FX[g.faixa][0] + ') · G ' + g.g + ' × U ' + g.u + ' × T ' + g.t + ' · por ' + (g.porNome || '') : 'Sem GUT'],
      ['2ª pontuação GUT', n.gut2 ? n.gut2.gut + ' (' + AU_GUT_FX[n.gut2.faixa][0] + ') · G ' + n.gut2.g + ' × U ' + n.gut2.u + ' × T ' + n.gut2.t + ' · ' + (n.gut2.porNome || '') : ''],
      ['Observação', n.obs || ''], ['Sugestão', n.sug || ''], ['Descrição do encarregado', n.encTxt || ''], ['Registrada', fmtDT(n.criadoEm) + ' · ' + (n.porNome || '')]];
    corpo += gvCampos(kv);
    if (n.ret) corpo += '<p class="gv-h">Retorno</p>' + gvCampos([['Situação', AU_RES[n.ret.res][0]], ['O que foi feito', n.ret.texto || ''], ['Conferido', fmtDT(n.ret.ts) + ' · ' + (n.ret.porNome || '')]]) + gal(dep, 'Fotos do depois');
    const alts = (Array.isArray(r.apresAlt) ? r.apresAlt : []).filter(x => x.ncId === n.id && !x.desfeitaEm).slice().reverse();
    if (alts.length) corpo += '<p class="gv-h">Corrigido na apresentação</p><div class="ap-hist">' + alts.map(x => '<div><b>' + esc(x.porNome || '') + '</b> · ' + esc(fmtDT(x.em)) + ' · ' + esc(AU_CAMPOS[x.campo] || x.campo) + '<span><del>' + esc(x.antes || '(vazio)') + '</del> → ' + esc(x.depois || '(vazio)') + '</span></div>').join('') + '</div>';
    let pe = '';
    if (pode && sit === 'registro') pe = '<button type="button" class="bt" data-act="au-nc-ed" data-id="' + esc(r.id) + '" data-nc="' + esc(n.id) + '">' + ic('lapis') + 'Corrigir</button>';
    else if (pode && (sit === 'retorno' || sit === 'pronta')) pe = '<button type="button" class="bt pr" data-act="au-conf" data-id="' + esc(r.id) + '" data-nc="' + esc(n.id) + '">' + (n.ret ? 'Mudar o retorno' : 'Conferir o retorno') + '</button>';
    if (sit !== 'registro') { corpo = '<p class="gv-h">Análise</p><div class="an-lin"><span class="au-pl">' + anSelo({ t: 'nc', rid: r.id, ncId: n.id }) + '</span><span>' + esc('resp. ' + (anInfo({ t: 'nc', rid: r.id, ncId: n.id }) || { resp: {} }).resp.nome) + '</span></div>' + corpo;
      pe = '<button type="button" class="bt" data-act="an-abrir" data-id="' + esc(r.id + '|' + n.id) + '">Análise</button>' + pe; }
    return { ico: 'lista', sub: r.numero + ' · ' + auAreaNome(n.area) + ' › ' + (n.local || ''), titulo: auNum(n.n) + (n.titulo ? ' · ' + n.titulo : ''), pill: auGravPill(n) + ' ' + auGutPill(n) + ' ' + auRetPill(n), corpo: corpo,
      lixeira: pode && sit === 'registro' ? { act: 'au-nc-tirar', id: r.id + '|' + n.id, titulo: 'Tirar esta NC' } : null, rodape: pe ? '<div class="ap-pe">' + pe + '</div>' : '' };
  });
  render();
}
const AU_CAMPOS = { nc: 'Texto da NC', titulo: 'Achado', local: 'Local', resp: 'Responsável', coresp: 'Corresponsáveis', lei: 'Lei / requisito', obs: 'Observação', sug: 'Sugestão', st: 'Situação', enc: 'Descrição do encarregado', gut2: '2ª pontuação GUT' };

/* ---------- abrir a auditoria (passo 1) ---------- */
LC_FORM.auAbrir = f => {
  const us = S.users.filter(u => !u.bloqueado && u.perfil !== 'visitante').sort((a, b) => cmpTxt(a.nome, b.nome));
  const c = lcMsg() + apPasso(1, 'Que auditoria') + '<div class="fm-g cl-fm2">' + lcBl('Tipo', lcIn('tipo', f.tipo, ' list="au-dl-tipo" placeholder="ex.: Global G.A.P."') + auDl('au-dl-tipo', AU_TIPOS.concat(S.rnc.map(r => r.tipo).filter(t => t && AU_TIPOS.indexOf(t) < 0)))) +
      lcBl('Preparação para', lcIn('prep', f.prep, ' placeholder="opcional · ex.: auditoria externa em 20/12"')) + '</div>' +
    apPasso(2, 'Quem audita') + '<div class="fm-g cl-fm2">' + lcBl('Auditor', ddHTML('auf:aud', f.aud, us.map(u => [u.id, u.nome]).concat([['__outro', 'Outra pessoa (escrever)']]))) + lcBl('Acompanhado por', lcIn('acomp', f.acomp, ' placeholder="opcional"')) + '</div>' +
    (f.aud === '__outro' ? lcBl('Nome do auditor', lcIn('audTxt', f.audTxt, '')) : '') +
    apPasso(3, 'Quando') + '<div class="fm-g cl-fm2">' + lcBl('Data da auditoria', lcData('data', f.data)) + lcBl('Prazo para resolver todas', lcData('prazo', f.prazo, true)) + '</div>' +
    lcAv('Uma auditoria = uma RNC. Depois de abrir, registre as não conformidades na ordem em que for andando.');
  return { ico: 'lista', sub: auNovoNumero() + ' · passo 1 de 5', titulo: 'Abrir auditoria interna', corpo: c, rodape: lcPe('au-abrir-ok', 'Abrir e registrar a NC 01') };
};
function auAbrirOk() {
  const f = S.fm, u = S.user; if (!f || !isSup(u)) return lcErro('Só o Líder ★ ou o Administrador abre auditoria.');
  const tipo = String(f.tipo || '').trim(), audO = String(f.audTxt || '').trim();
  if (tipo.length < 2) return lcErro('Escreva ou escolha o tipo de auditoria.');
  if (f.aud === '__outro' && audO.length < 3) return lcErro('Escreva o nome do auditor.');
  const er = validaData(f.data); if (er) return lcErro(er);
  if (!dataOk(f.prazo)) return lcErro('Informe o prazo para resolver as não conformidades.');
  if (f.prazo < f.data) return lcErro('O prazo precisa ser depois da data da auditoria.');
  if (!lcTravar()) return;
  const o = { numero: auNovoNumero(), tipo: tipo, preparacao: String(f.prep || '').trim(), auditorId: f.aud === '__outro' ? '' : f.aud, auditorNome: f.aud === '__outro' ? audO : nomeDe(f.aud),
    acompanhante: String(f.acomp || '').trim(), data: f.data, prazo: f.prazo, prazoHist: [], ncs: [], situacao: 'registro', criadoEm: nowISO(), porId: u.id, porNome: u.nome };
  const p = Data.col('sv2_rnc').add(o);
  p.then(id => { S.auRid = id; Audit.log({ acao: 'rnc_abrir', entidade: 'rnc', entidadeId: id, resumo: 'Abriu a auditoria interna ' + o.numero + ' (' + tipo + ') · auditor ' + o.auditorNome + ' · prazo ' + fmtD(o.prazo), depois: o }); });
  lcGrava([p], o.numero + ' aberta.', () => p.then(id => { if (!S.rnc.some(r => r.id === id)) S.rnc.push(Object.assign({ id: id }, o)); auNcNova(id, {}); }));
}

/* ---------- registrar NC (passo 2): gaveta em passos ---------- */
function auNcNova(rid, pre) {
  const r = auDe(rid); if (!r || !auPode(r) || auSit(r) !== 'registro') return;
  const todas = r.ncs || [], ult = auNcs(r).slice(-1)[0], loc = pre.local || '';
  const doLocal = loc ? auNcs(r).filter(n => auNorm(n.local) === auNorm(loc)).slice(-1)[0] : null; /* o responsável vem do local */
  lcAbrir({ k: 'auNc', rid: rid, id: '', n: Math.max(0, ...todas.map(y => y.n || 0)) + 1, area: pre.area || (ult ? ult.area : 'campo'), local: loc, titulo: pre.titulo || '', nc: '', leis: [], leiTxt: '',
    grav: '', gut: { g: 0, u: 0, t: 0 }, gutGMan: false, gutMot: '', gutDono: '', resp: pre.resp || (doLocal ? doLocal.respNome || '' : ''), ciente: '', coresp: [], crTxt: '', obs: '', sug: '', fotos: [] });
}
function auNcEditar(rid, ncId) {
  const r = auDe(rid), n = auNc(r, ncId); if (!r || !n || !auPode(r) || auSit(r) !== 'registro') return;
  const g = auGut(n.id);
  lcAbrir({ k: 'auNc', rid: rid, id: n.id, n: n.n, area: n.area || 'campo', local: n.local || '', titulo: n.titulo || '', nc: n.nc || '', leis: auLeis(n), leiTxt: '', grav: n.grav || '',
    gut: g ? { g: g.g, u: g.u, t: g.t } : { g: AU_GUT_G[n.grav] || 0, u: 0, t: 0 }, gutGMan: !!g, gutMot: '', gutDono: g ? g.porId : '', gutDonoNome: g ? g.porNome : '',
    resp: n.respNome || '', ciente: n.ciente === true ? 'sim' : n.ciente === false ? 'nao' : '', coresp: auCoresp(n).map(c => ({ id: c.id || '', nome: c.nome })), crTxt: '', obs: n.obs || '', sug: n.sug || '',
    fotos: (n.fotosAntes || []).map(id => ({ id: id })) }, () => auNcAbre(rid, ncId));
}
function auFotosBl(f) {
  const fs = f.fotos || [];
  const th = fs.map((x, i) => '<span class="ap-ft">' + (x.id ? auFotoIMG(x.id) : '<img src="' + imgSrc(x.url) + '" alt="Foto ' + (i + 1) + '">') + fedMkBt('au-foto-mk', i, (x.marcas || (x.id && S._auFotoDoc[x.id] && S._auFotoDoc[x.id].marcas) || []).length) + '<button type="button" class="bt ic-so" data-act="au-foto-x" data-i="' + i + '" title="Tirar esta foto" aria-label="Tirar esta foto">' + ic('x') + '</button></span>').join('');
  const add = fs.length < AU_MAX_FOTOS ? '<label class="bt">' + ic('imagem') + (fs.length ? 'Mais uma' : 'Tirar foto') + '<input type="file" accept="image/*" capture="environment" data-aufoto-in hidden></label><label class="bt">Galeria<input type="file" accept="image/*" multiple data-aufoto-in hidden></label>' : '';
  return '<div class="ap-fot">' + th + add + '</div><small class="cl-nt">' + fs.length + ' de ' + AU_MAX_FOTOS + ' · ficam guardadas como evidência da auditoria. Fotografe o problema, não as pessoas.</small>';
}
function auGravBotoes(v) {
  return '<div class="ap-gb au-gb">' + Object.keys(AU_GRAV).map(k => '<button type="button" class="ap-gbt g-' + k + (v === k ? ' on' : '') + '" data-act="au-grav-pick" data-g="' + k + '" aria-pressed="' + (v === k ? 'true' : 'false') + '">' + esc(AU_GRAV[k][0]) + '</button>').join('') + '</div>';
}
/* GUT no padrão do EFClaudian: três linhas de notas 1 a 5, cada nota explicada, e a conta */
function auGutBl(gt, act, dono, livre) {
  const c = auGutCalc(gt.g, gt.u, gt.t);
  const linha = k => { const v = Number(gt[k]) || 0, T = AU_GUT_TXT[k];
    return '<div class="au-gl"><span class="au-gk">' + esc(T[0]) + '</span><div class="au-gbs">' + [1, 2, 3, 4, 5].map(i => '<button type="button" class="ap-gbt' + (v === i ? ' on' : '') + '" data-act="' + act + '" data-k="' + k + '" data-v="' + i + '" title="' + esc(T[1][i - 1][0]) + '" aria-pressed="' + (v === i ? 'true' : 'false') + '">' + i + '</button>').join('') + '</div>' +
      '<small class="au-gtx">' + (v ? '<b>' + esc(T[1][v - 1][0]) + '</b> · ' + esc(T[1][v - 1][1]) : esc(k === 'g' && !livre ? 'Vem da gravidade; pode trocar' : 'Toque numa nota')) + '</small></div>'; };
  return '<div class="au-gut">' + linha('g') + linha('u') + linha('t') + '<div class="au-gres">' +
    (c ? '<span>GUT = ' + esc(gt.g) + ' × ' + esc(gt.u) + ' × ' + esc(gt.t) + ' = <b>' + c.v + '</b></span><span class="pill ' + AU_GUT_FX[c.fx][1] + '">' + esc(AU_GUT_FX[c.fx][0]) + '</span>' + (Number(gt.g) === 5 && c.v < 18 ? '<small>Gravidade 5 nunca fica Baixo</small>' : '')
      : '<span class="au-gv">' + (gt.u || gt.t ? 'Marque as três notas para calcular' : 'Sem GUT (opcional)') + '</span>') +
    (gt.u || gt.t ? '<button type="button" class="bt" data-act="' + act + '" data-k="limpar">Tirar a GUT</button>' : '') + '</div>' + (dono || '') + '</div>';
}
function auListaBl(f, campo, txtCampo, rot, dl, ph, max) {
  const l = f[campo] || [], cheio = l.length >= max;
  return lcBl(rot, (l.length ? '<div class="au-chips">' + l.map((x, i) => '<span class="au-chip">' + esc(typeof x === 'string' ? x : x.nome) + '<button type="button" data-act="au-chip-x" data-c="' + campo + '" data-i="' + i + '" aria-label="' + esc('Tirar ' + (typeof x === 'string' ? x : x.nome)) + '">' + ic('x') + '</button></span>').join('') + '</div>' : '') +
    (cheio ? '' : '<div class="au-addr">' + lcIn(txtCampo, f[txtCampo], ' list="' + dl + '" placeholder="' + esc(ph) + '"') + '<button type="button" class="bt" data-act="au-chip-add" data-c="' + campo + '" data-t="' + txtCampo + '">Adicionar</button></div>'), l.length + ' de ' + max);
}
LC_FORM.auNc = f => {
  const r = auDe(f.rid); if (!r) return null;
  const dono = f.gutDono && f.gutDono !== S.user.id && f.gut.u ? lcBl('Motivo para mudar a nota dada por ' + (f.gutDonoNome || 'outra pessoa'), lcIn('gutMot', f.gutMot, ' placeholder="obrigatório se mudar a nota"')) : '';
  const c = lcMsg() + apPasso(1, 'Fotos', 'até ' + AU_MAX_FOTOS + ' · opcional') + auFotosBl(f) +
    apPasso(2, 'Onde') + '<div class="fm-g cl-fm2">' + lcBl('Área', ddHTML('auf:area', f.area, AU_AREAS)) + lcBl('Local', lcIn('local', f.local, ' list="au-dl-loc" placeholder="ex.: CBR 01"') + auDl('au-dl-loc', auSug(n => n.local))) + '</div>' +
    apPasso(3, 'O que está errado') + lcBl('Nome curto do achado', lcIn('titulo', f.titulo, ' list="au-dl-tit" placeholder="ex.: Placa caída"') + auDl('au-dl-tit', auSug(n => n.titulo)), 'opcional · ajuda a achar e a agrupar') +
    lcBl('Descrição', lcTx('nc', f.nc, 'o que foi visto e por que não está conforme')) + auListaBl(f, 'leis', 'leiTxt', 'Leis / requisitos', 'au-dl-lei', 'escreva ou escolha', AU_LEIS_MAX) + auDl('au-dl-lei', auLeisSug()) +
    apPasso(4, 'Gravidade e prioridade') + auGravBotoes(f.grav) + auGutBl(f.gut, 'au-gut-pick', dono) +
    apPasso(5, 'Quem responde') + '<div class="fm-g cl-fm2">' + lcBl('Responsável', lcIn('resp', f.resp, ' list="au-dl-pes" placeholder="quem responde por este local"')) + lcBl('Estava ciente?', ddHTML('auf:ciente', f.ciente, [['', 'Escolha…'], ['sim', 'Sim, estava ciente'], ['nao', 'Não estava ciente']])) + '</div>' +
    auListaBl(f, 'coresp', 'crTxt', 'Corresponsáveis', 'au-dl-pes', 'nome de quem também responde', 6) + auDl('au-dl-pes', auPessoas()) +
    '<div class="fm-g cl-fm2">' + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')) + lcBl('Sugestão', lcIn('sug', f.sug, ' placeholder="opcional · o que fazer"')) + '</div>';
  return { ico: 'lista', sub: r.numero + ' · ' + (f.id ? 'corrigindo' : 'data, hora e o seu nome entram sozinhos'), titulo: (f.id ? 'Corrigir a ' : 'Registrar a ') + auNum(f.n), corpo: c,
    rodape: '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button><span class="au-pesp"></span>' + (f.id ? '' : '<button type="button" class="bt" data-act="au-nc-ok" data-prox="1">Salvar e próxima</button>') + '<button type="button" class="bt pr au-pr0" data-act="au-nc-ok">Salvar</button>' };
};
DD_AO.auf = (k, v) => { if (!S.fm) return; S.fm[k] = v; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); };
document.addEventListener('change', async e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-aufoto-in') || !S.fm || !t.files || !t.files.length) return;
  const arqs = Array.prototype.slice.call(t.files); t.value = '';
  const cabe = AU_MAX_FOTOS - (S.fm.fotos || []).length;
  for (const a of arqs.slice(0, cabe)) {
    try { const u = await coFotoReduz(a); if (!S.fm) return; S.fm.fotos = (S.fm.fotos || []).concat([{ url: u }]); S.fm.sujo = true; }
    catch (er) { lcErro(er.message || 'Não deu para ler a foto.'); return; }
  }
  if (S.fm) { if (arqs.length > cabe) S.fm.msg = 'Cabem no máximo ' + AU_MAX_FOTOS + ' fotos.'; gvDesenha(true); }
});
/* fotos novas viram documentos em sv2_rnc_foto; as que já existem ficam com o id */
function auFotosGravar(fotos, rid, ncId, papel) {
  const ids = [], ps = [];
  (fotos || []).forEach(f => { if (f.id) { ids.push(f.id); return; } const id = uid(); S._auFotos[id] = f.url; ids.push(id);
    const mk = f.base && (f.marcas || []).length, o = { rncId: rid, ncId: ncId, papel: papel, dataUrl: f.url, criadoEm: nowISO(), porId: S.user.id, marcas: mk ? f.marcas : [] };
    if (mk) Object.assign(o, { base: f.base, marcadoPor: f.mkPor || S.user.nome, marcadoEm: f.mkEm || nowISO() }); if (f.subst) o.substitui = f.subst;
    S._auFotoDoc[id] = { base: o.base || '', marcas: o.marcas, marcadoPor: o.marcadoPor || '', marcadoEm: o.marcadoEm || '' };
    ps.push(Data.col('sv2_rnc_foto').set(id, o)); });
  return { ids: ids, ps: ps };
}
function auNcOk(prox) {
  const f = S.fm; if (!f) return; const r = auDe(f.rid);
  if (!r || !auPode(r) || auSit(r) !== 'registro') return lcErro('Esta RNC não aceita mais NCs (já foi enviada).');
  ['leiTxt', 'crTxt'].forEach(k => { const el = $('#gv [data-fm="' + k + '"]'); if (el) f[k] = el.value; });
  if (String(f.leiTxt || '').trim()) auChipAdd('leis', 'leiTxt', true); if (String(f.crTxt || '').trim()) auChipAdd('coresp', 'crTxt', true);
  const local = String(f.local || '').trim(), resp = String(f.resp || '').trim(), txt = String(f.nc || '').trim();
  if (!f.area) return lcErro('Escolha a área.');
  if (!local) return lcErro('Escreva o local.');
  if (txt.length < 5) return lcErro('Descreva o que está errado.');
  if (!f.grav) return lcErro('Toque na gravidade.');
  const gt = f.gut || {}, usa = !!(gt.u || gt.t), gc = usa ? auGutCalc(gt.g, gt.u, gt.t) : null, gAnt = f.id ? auGut(f.id) : null;
  if (usa && !gc) return lcErro('Marque as três notas da GUT (ou toque em “Tirar a GUT”).');
  const gutMuda = gAnt ? (!gc || gAnt.g !== Number(gt.g) || gAnt.u !== Number(gt.u) || gAnt.t !== Number(gt.t)) : !!gc;
  if (gutMuda && gAnt && gAnt.porId !== S.user.id && String(f.gutMot || '').trim().length < 5) return lcErro('Escreva o motivo para mudar a nota GUT de ' + (gAnt.porNome || 'outra pessoa') + '.');
  if (resp.length < 3) return lcErro('Informe o responsável.');
  if (f.ciente !== 'sim' && f.ciente !== 'nao') return lcErro('Diga se o responsável estava ciente.');
  if (!lcTravar()) return;
  const u = S.user, id = f.id || uid(), fo = auFotosGravar(f.fotos, r.id, id, 'antes'), antes = auNc(r, id), alvo = auUserDe(resp), ts = nowISO();
  const leis = (f.leis || []).slice(0, AU_LEIS_MAX);
  const nc = Object.assign({}, antes || {}, { id: id, n: f.n, area: f.area, local: local, titulo: String(f.titulo || '').trim(), nc: txt, leis: leis, lei: leis.join('; '), respId: alvo ? alvo.id : '', respNome: alvo ? alvo.nome : resp,
    ciente: f.ciente === 'sim', grav: f.grav, obs: String(f.obs || '').trim(), sug: String(f.sug || '').trim(), fotosAntes: fo.ids, trat: auTrat(f.grav, gc),
    coresp: (f.coresp || []).filter(c => auNorm(c.nome) !== auNorm(resp)).map(c => ({ id: c.id || '', nome: c.nome })) });
  if (!antes) Object.assign(nc, { criadoEm: ts, porId: u.id, porNome: u.nome });
  const ncs = (r.ncs || []).filter(x => x.id !== id).concat([nc]).sort((a, b) => a.n - b.n);
  r.ncs = ncs; /* já aparece na tela; a nuvem confirma em seguida */
  const ps = fo.ps.concat([Data.col('sv2_rnc').update(r.id, { ncs: ncs, atualizadoEm: ts })]);
  Audit.log({ acao: antes ? 'rnc_nc_editar' : 'rnc_nc', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · ' + auNum(nc.n) + ' (' + auAreaNome(nc.area) + ' › ' + local + ', ' + AU_GRAV[nc.grav][0] + '): ' + txt + ' · resp. ' + nc.respNome + (fo.ids.length ? ' · ' + fo.ids.length + ' foto(s)' : ''), depois: nc });
  if (gutMuda) {
    const passo = { ts: ts, porNome: u.nome, de: gAnt ? { g: gAnt.g, u: gAnt.u, t: gAnt.t, gut: gAnt.gut } : null, para: gc ? { g: Number(gt.g), u: Number(gt.u), t: Number(gt.t), gut: gc.v } : null, motivo: gAnt && gAnt.porId !== u.id ? String(f.gutMot || '').trim() : '' };
    const raw = S.rncGut.find(x => x.ncId === id) || null;
    const doc = gc ? { rid: r.id, ncId: id, g: Number(gt.g), u: Number(gt.u), t: Number(gt.t), gut: gc.v, faixa: gc.fx, cancelada: false, porId: raw ? raw.porId : u.id, porNome: raw ? raw.porNome : u.nome, em: ts, hist: ((raw && raw.hist) || []).concat([passo]) }
      : Object.assign({}, raw, { cancelada: true, em: ts, hist: ((raw && raw.hist) || []).concat([passo]) });
    delete doc.id; S.rncGut = S.rncGut.filter(x => x.ncId !== id).concat([Object.assign({ id: id }, doc)]);
    ps.push(Data.col('sv2_rnc_gut').set(id, doc));
    Audit.log({ acao: 'rnc_gut', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · ' + auNum(nc.n) + ': GUT ' + (gAnt ? gAnt.gut + ' → ' : '') + (gc ? gc.v + ' (' + AU_GUT_FX[gc.fx][0] + ')' : 'tirada') + (passo.motivo ? ' · motivo: ' + passo.motivo : ''), antes: passo.de, depois: passo.para });
  }
  lcGrava(ps, auNum(nc.n) + ' salva.', prox ? () => auNcNova(r.id, { area: nc.area, local: nc.local, resp: nc.respNome }) : null);
}
function auChipAdd(campo, txt, quieto) {
  const f = S.fm; if (!f) return; const el = $('#gv [data-fm="' + txt + '"]'), v = String((el ? el.value : f[txt]) || '').replace(/\s+/g, ' ').trim(); if (!v) return;
  const max = campo === 'leis' ? AU_LEIS_MAX : 6, l = (f[campo] || []).slice();
  if (l.length >= max) { if (!quieto) lcErro('Já são ' + max + ': tire um para trocar.'); return; }
  if (l.some(x => auNorm(typeof x === 'string' ? x : x.nome) === auNorm(v))) { f[txt] = ''; if (!quieto) gvDesenha(true); return; }
  if (campo === 'leis') l.push(v); else { const us = auUserDe(v); l.push({ id: us ? us.id : '', nome: us ? us.nome : v }); }
  f[campo] = l; f[txt] = ''; f.sujo = true; if (!quieto) { gvDesenha(true); const n = $('#gv [data-fm="' + txt + '"]'); if (n) n.focus(); }
}

/* ---------- tirar a NC (fica guardada, marcada como tirada) ---------- */
LC_FORM.auTirar = f => { const r = auDe(f.rid), n = auNc(r, f.ncId); if (!n) return null;
  return { ico: 'lixo', sub: r.numero + ' · ' + auNum(n.n), titulo: 'Tirar a ' + auNum(n.n), corpo: lcMsg() + lcAv('Ela não entra no relatório nem na apresentação. O registro fica guardado, marcado como tirado.') + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: registrada duas vezes')), rodape: lcPe('au-tirar-ok', 'Tirar') }; };
function auTirarOk() {
  const f = S.fm, r = f && auDe(f.rid), n = auNc(r, f && f.ncId); if (!r || !n) return;
  if (!auPode(r) || auSit(r) !== 'registro') return lcErro('Depois de enviada, a NC não sai mais.');
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const ncs = (r.ncs || []).map(x => x.id === n.id ? Object.assign({}, x, { cancelada: { motivo: m, porNome: S.user.nome, ts: nowISO() } }) : x); r.ncs = ncs;
  Audit.log({ acao: 'rnc_nc_tirar', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · tirou a ' + auNum(n.n) + ' — ' + m });
  S.fm.volta = null; lcGrava([Data.col('sv2_rnc').update(r.id, { ncs: ncs })], auNum(n.n) + ' tirada.', () => { if (S.gv) gvFechar(); });
}

/* ---------- enviar (passo 3) ---------- */
function auQuemRecebe(l) { const m = new Map(); l.forEach(n => { const k = auNorm(auResp(n)); if (!m.has(k)) m.set(k, { nome: auResp(n), id: n.respId, n: 0 }); m.get(k).n++; }); return Array.from(m.values()).sort((a, b) => cmpTxt(a.nome, b.nome)); }
LC_FORM.auEnviar = f => { const r = auDe(f.rid); if (!r) return null; const l = auNcs(r), q = auQuemRecebe(l), g = k => l.filter(n => n.grav === k).length;
  return { ico: 'sino', sub: r.numero + ' · passo 3 de 5 · prazo ' + fmtD(r.prazo), titulo: 'Enviar a RNC',
    corpo: lcMsg() + gvNums([[l.length, l.length === 1 ? 'NC' : 'NCs'], [g('maior'), 'maior'], [g('media'), 'média'], [g('baixa'), 'baixa']]) + '<p class="gv-h">Quem recebe</p>' + gvCampos(q.map(x => [x.nome, x.n + (x.n === 1 ? ' NC' : ' NCs') + (x.id ? ' · avisado no app' : ' · entregar o relatório')])) +
      lcAv('Depois de enviada, as NCs só mudam pela apresentação (com histórico) e pela conferência do retorno.'), rodape: lcPe('au-enviar-ok', 'Enviar RNC') }; };
function auEnviarOk() {
  const f = S.fm, r = f && auDe(f.rid); if (!r) return;
  if (!auPode(r) || auSit(r) !== 'registro') return lcErro('Esta RNC já foi enviada.');
  const l = auNcs(r); if (!l.length) return lcErro('Registre ao menos uma NC.');
  if (!lcTravar()) return;
  const patch = { situacao: 'enviada', enviadaEm: nowISO(), enviadaPor: S.user.nome }; Object.assign(r, patch);
  Audit.log({ acao: 'rnc_enviar', entidade: 'rnc', entidadeId: r.id, resumo: 'Enviou a ' + r.numero + ' (' + l.length + ' NCs, prazo ' + fmtD(r.prazo) + ')' });
  const porU = {}; l.forEach(n => { if (n.respId && n.respId !== S.user.id) (porU[n.respId] = porU[n.respId] || []).push(n); });
  Object.keys(porU).forEach(id => Notif.send({ nivel: porU[id].some(n => n.grav === 'maior') ? 'aviso' : 'info', titulo: 'Não conformidade para resolver até ' + fmtD(r.prazo), texto: r.numero + ' (' + r.tipo + '): ' + porU[id].map(n => auNum(n.n) + ' — ' + (n.titulo || n.nc)).join(' · ') + '. Resolva e avise o auditor (' + r.auditorNome + ').', para: [id], refTipo: 'rnc', refId: r.id }).catch(() => {}));
  lcGrava([Data.col('sv2_rnc').update(r.id, patch)], r.numero + ' enviada.' + (Object.keys(porU).length ? ' Os responsáveis foram avisados.' : ''));
}

/* ---------- conferir o retorno (passo 4) ---------- */
function auConfAbre(rid, ncId) {
  const r = auDe(rid); if (!r || !auPode(r)) return; const s = auSit(r); if (s !== 'retorno' && s !== 'pronta') return;
  const seq = auNcs(r); const x = (ncId ? seq.find(y => y.id === ncId) : null) || seq.find(y => !y.ret) || seq[0]; if (!x) return;
  lcAbrir({ k: 'auConf', rid: rid, ncId: x.id, res: x.ret ? x.ret.res : '', texto: x.ret ? x.ret.texto : '', fotos: ((x.ret && x.ret.fotosDepois) || []).map(id => ({ id: id })) });
}
LC_FORM.auConf = f => {
  const r = auDe(f.rid), seq = auNcs(r), x = seq.find(y => y.id === f.ncId); if (!x) return null;
  const i = seq.indexOf(x), feitas = seq.filter(y => y.ret).length, prox = seq.slice(i + 1).find(y => !y.ret) || seq.find(y => !y.ret && y.id !== x.id);
  const c = lcMsg() + '<div class="au-cfp"><span style="width:' + Math.round(feitas / seq.length * 100) + '%"></span></div><small class="cl-nt">' + feitas + ' de ' + seq.length + ' conferidas · prazo ' + esc(fmtD(r.prazo)) + ' (' + esc(auPrazoTxt(r)) + ')</small>' +
    '<div class="au-cfn">' + ((x.fotosAntes || [])[0] ? '<span class="au-th">' + auFotoIMG(x.fotosAntes[0]) + '</span>' : '') + '<div><b>' + esc(auNum(x.n) + (x.titulo ? ' · ' + x.titulo : '')) + '</b><span>' + esc(x.nc) + '</span><small>' + esc(auAreaNome(x.area) + ' › ' + x.local + ' · ' + auResp(x)) + '</small></div></div>' +
    apPasso(1, 'Foi resolvida?') + '<div class="ap-gb au-gb">' + Object.keys(AU_RES).map(k => '<button type="button" class="ap-gbt r-' + k + (f.res === k ? ' on' : '') + '" data-act="au-res-pick" data-g="' + k + '" aria-pressed="' + (f.res === k ? 'true' : 'false') + '">' + esc(AU_RES[k][0]) + '</button>').join('') + '</div>' +
    apPasso(2, 'Fotos do depois', 'até ' + AU_MAX_FOTOS + ' · opcional') + auFotosBl(f) +
    apPasso(3, 'O que foi feito', 'ou o que falta') + lcTx('texto', f.texto, 'ex.: placa recolocada e fixada') +
    (function () { const pend = anPend({ t: 'nc', rid: r.id, ncId: x.id }); if (!pend.length) return '<div class="an-lin"><span class="au-pl">' + anSelo({ t: 'nc', rid: r.id, ncId: x.id }) + '</span></div>';
      return lcAv('<b>Para marcar Resolvida falta:</b> ' + esc(pend.join('; ')) + '.' + (isSup(S.user) ? ' Você pode liberar, com motivo.' : ' Sem isso, marque Parcial ou Não resolvida.'), 'wa') +
        (isSup(S.user) && f.res === 'resolvida' ? lcBl('Motivo da liberação', lcIn('lib', f.lib, ' placeholder="ex.: ação feita fora do app; conferi no local"'), 'vai para o histórico e o relatório') : ''); })();
  return { ico: 'ok', sub: r.numero + ' · retorno · passo 4 de 5 · ' + (i + 1) + ' de ' + seq.length, titulo: 'Conferir a ' + auNum(x.n), corpo: c,
    rodape: lcPe('au-conf-ok', prox ? 'Salvar e ir para a ' + auNum(prox.n) : 'Salvar') };
};
function auConfOk() {
  const f = S.fm, r = f && auDe(f.rid), x = auNc(r, f && f.ncId); if (!r || !x) return;
  if (!auPode(r)) return lcErro('Só o Líder ★, o Administrador ou o auditor confere.');
  if (!f.res) return lcErro('Diga se foi resolvida, parcial ou não resolvida.');
  const t = String(f.texto || '').trim(); if (t.length < 3) return lcErro('Escreva o que foi feito (ou o que falta).');
  const pend = f.res === 'resolvida' ? anPend({ t: 'nc', rid: r.id, ncId: x.id }) : []; let lib = null;
  if (pend.length) { if (!isSup(S.user)) return lcErro('Não dá para marcar Resolvida: ' + pend.join('; ') + '. Marque Parcial ou Não resolvida, ou peça ao líder.');
    const m = String(f.lib || '').trim(); if (m.length < 5) return lcErro('Para marcar Resolvida assim, escreva o motivo da liberação.');
    lib = { motivo: m, porId: S.user.id, porNome: S.user.nome, pend: pend }; }
  if (!lcTravar()) return;
  const fo = auFotosGravar(f.fotos, r.id, x.id, 'depois'), ts = nowISO();
  const ret = { res: f.res, texto: t, fotosDepois: fo.ids, ts: ts, data: hojeISO(), porId: S.user.id, porNome: S.user.nome };
  if (lib) ret.lib = lib;
  const ncs = (r.ncs || []).map(y => y.id === x.id ? Object.assign({}, y, { ret: ret, retHist: (y.retHist || []).concat(y.ret ? [y.ret] : []) }) : y); r.ncs = ncs;
  Audit.log({ acao: 'rnc_conferir', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ' · ' + auNum(x.n) + ': ' + AU_RES[f.res][0] + ' — ' + t + (lib ? ' · LIBERADA por ' + S.user.nome + ' (' + lib.pend.join('; ') + '): ' + lib.motivo : '') + (fo.ids.length ? ' · ' + fo.ids.length + ' foto(s) do depois' : ''), depois: ret });
  const seq = auNcs(r), prox = seq.slice(seq.findIndex(y => y.id === x.id) + 1).find(y => !y.ret) || seq.find(y => !y.ret);
  lcGrava(fo.ps.concat([Data.col('sv2_rnc').update(r.id, { ncs: ncs, atualizadoEm: ts })]), auNum(x.n) + ': ' + AU_RES[f.res][0].toLowerCase() + '.' + (prox ? '' : ' Todas conferidas: falta fechar a RNC.'), prox ? () => auConfAbre(r.id, prox.id) : null);
}

/* ---------- fechar (passo 5), prazo e cancelar ---------- */
function auFechar(rid) {
  const r = auDe(rid); if (!r || !auPode(r) || auSit(r) !== 'pronta') return;
  const l = auNcs(r), res = l.filter(n => n.ret && n.ret.res === 'resolvida').length;
  csConfirma({ titulo: 'Fechar a ' + r.numero + '?', texto: res + ' de ' + l.length + ' resolvidas. Depois de fechada, a RNC só pode ser vista e impressa.', sim: 'Fechar a RNC', nao: 'Voltar' }, () => {
    const patch = { situacao: 'fechada', fechadaEm: nowISO(), fechadaPor: S.user.nome }; Object.assign(r, patch);
    Data.col('sv2_rnc').update(r.id, patch).then(() => aviso(r.numero + ' fechada.')).catch(e => aviso(svErro(e), 'erro'));
    Audit.log({ acao: 'rnc_fechar', entidade: 'rnc', entidadeId: r.id, resumo: 'Fechou a ' + r.numero + ': ' + res + ' de ' + l.length + ' resolvida(s)' }); render();
  });
}
function auRncAbre(rid) {
  gvAbrir(() => {
    const r = auDe(rid); if (!r) return null; const sit = auSit(r), sup = isSup(S.user);
    let corpo = gvCampos([['Número', r.numero], ['Tipo', r.tipo || ''], ['Preparação para', r.preparacao || ''], ['Auditor', r.auditorNome || ''], ['Acompanhado por', r.acompanhante || ''], ['Data da auditoria', fmtD(r.data)],
      ['Prazo', fmtD(r.prazo) + (sit !== 'fechada' ? ' · ' + auPrazoTxt(r) : '')], ['Situação', AU_SIT[sit][0]], ['Aberta', fmtDT(r.criadoEm) + ' · ' + (r.porNome || '')], ['Enviada', r.enviadaEm ? fmtDT(r.enviadaEm) + ' · ' + (r.enviadaPor || '') : ''], ['Fechada', r.fechadaEm ? fmtDT(r.fechadaEm) + ' · ' + (r.fechadaPor || '') : '']]);
    const ph = (r.prazoHist || []).slice().reverse();
    if (ph.length) corpo += '<p class="gv-h">Prazo prorrogado</p><div class="ap-hist">' + ph.map(p => '<div><b>' + esc(p.porNome || '') + '</b> · ' + esc(fmtDT(p.ts)) + '<span>' + esc(fmtD(p.de) + ' → ' + fmtD(p.para) + ' · ' + (p.motivo || '')) + '</span></div>').join('') + '</div>';
    return { ico: 'info', sub: 'Auditoria interna', titulo: r.numero, pill: metaPl(AU_SIT[sit][0], AU_SIT[sit][1]), corpo: corpo,
      lixeira: sup && sit === 'registro' ? { act: 'au-canc', id: r.id, titulo: 'Cancelar a auditoria' } : null,
      rodape: sup && sit !== 'fechada' ? '<div class="ap-pe"><button type="button" class="bt" data-act="au-prazo" data-id="' + esc(r.id) + '">Prorrogar o prazo</button></div>' : '' };
  });
  render();
}
LC_FORM.auPrazo = f => { const r = auDe(f.rid); if (!r) return null;
  return { ico: 'relogio', sub: r.numero + ' · prazo atual ' + fmtD(r.prazo), titulo: 'Prorrogar o prazo', corpo: lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Novo prazo', lcData('prazo', f.prazo, true)) + lcBl('Motivo', lcIn('motivo', f.motivo, ' placeholder="ex.: peça encomendada"')) + '</div>', rodape: lcPe('au-prazo-ok', 'Prorrogar') }; };
function auPrazoOk() {
  const f = S.fm, r = f && auDe(f.rid); if (!r || !isSup(S.user)) return lcErro('Só o Líder ★ ou o Administrador prorroga.');
  if (!dataOk(f.prazo) || f.prazo <= r.prazo) return lcErro('O novo prazo precisa ser depois de ' + fmtD(r.prazo) + '.');
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const patch = { prazo: f.prazo, prazoHist: (r.prazoHist || []).concat([{ de: r.prazo, para: f.prazo, motivo: m, porNome: S.user.nome, ts: nowISO() }]) };
  Audit.log({ acao: 'rnc_prorrogar', entidade: 'rnc', entidadeId: r.id, resumo: r.numero + ': prazo ' + fmtD(r.prazo) + ' → ' + fmtD(f.prazo) + ' — ' + m }); Object.assign(r, patch);
  lcGrava([Data.col('sv2_rnc').update(r.id, patch)], 'Prazo prorrogado.');
}
LC_FORM.auCanc = f => { const r = auDe(f.rid); if (!r) return null;
  return { ico: 'lixo', sub: r.numero + ' · ' + auNcs(r).length + ' NC(s)', titulo: 'Cancelar a auditoria', corpo: lcMsg() + lcAv('Ela some da tela, mas fica guardada como cancelada, com o motivo. Só dá para cancelar antes de enviar.', 'cr') + lcBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('au-canc-ok', 'Cancelar a auditoria') }; };
function auCancOk() {
  const f = S.fm, r = f && auDe(f.rid); if (!r || !isSup(S.user) || auSit(r) !== 'registro') return lcErro('Só dá para cancelar antes de enviar.');
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const patch = { situacao: 'cancelada', canceladaEm: nowISO(), canceladaPor: S.user.nome, canceladaMotivo: m }; Object.assign(r, patch);
  Audit.log({ acao: 'rnc_cancelar', entidade: 'rnc', entidadeId: r.id, resumo: 'Cancelou a ' + r.numero + ' — ' + m });
  S.fm.volta = null; lcGrava([Data.col('sv2_rnc').update(r.id, patch)], r.numero + ' cancelada.', () => { if (S.gv) gvFechar(); });
}

/* ---------- cliques ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="au-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm;
  if (a === 'au-nc') auNcAbre(id, t.getAttribute('data-nc'));
  else if (a === 'au-abrir') { if (isSup(S.user)) lcAbrir({ k: 'auAbrir', tipo: '', prep: '', aud: S.user.id, audTxt: '', acomp: '', data: hojeISO(), prazo: addDias(hojeISO(), 30) }); }
  else if (a === 'au-abrir-ok') auAbrirOk();
  else if (a === 'au-nova-nc') auNcNova(id, {});
  else if (a === 'au-nc-aqui') auNcNova(id, { area: t.getAttribute('data-area'), local: t.getAttribute('data-local'), titulo: t.getAttribute('data-tit') || '', resp: t.getAttribute('data-resp') || '' });
  else if (a === 'au-nc-ed') auNcEditar(id, t.getAttribute('data-nc'));
  else if (a === 'au-nc-ok') auNcOk(t.getAttribute('data-prox') === '1');
  else if (a === 'au-grav-pick' && f) { f.grav = t.getAttribute('data-g'); if (!f.gutGMan) f.gut = Object.assign({}, f.gut, { g: AU_GUT_G[f.grav] || 0 }); f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'au-gut-pick' && f) { const k = t.getAttribute('data-k'); if (k === 'limpar') { f.gut = { g: AU_GUT_G[f.grav] || 0, u: 0, t: 0 }; f.gutGMan = false; } else { f.gut = Object.assign({}, f.gut); f.gut[k] = Number(t.getAttribute('data-v')); if (k === 'g') f.gutGMan = true; } f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'au-res-pick' && f) { f.res = t.getAttribute('data-g'); f.sujo = true; f.msg = ''; gvDesenha(true); }
  else if (a === 'au-chip-add') auChipAdd(t.getAttribute('data-c'), t.getAttribute('data-t'));
  else if (a === 'au-chip-x' && f) { const c = t.getAttribute('data-c'), i = Number(t.getAttribute('data-i')); f[c] = (f[c] || []).filter((x, k) => k !== i); f.sujo = true; gvDesenha(true); }
  else if (a === 'au-foto-x' && f) { const i = Number(t.getAttribute('data-i')); f.fotos = (f.fotos || []).filter((x, k) => k !== i); f.sujo = true; gvDesenha(true); }
  else if (a === 'au-foto-ver') auFotoAbrir(id);
  else if (a === 'au-foto-mk') auFotoMk(Number(t.getAttribute('data-i')));
  else if (a === 'au-fv-x') csVolta();
  else if (a === 'au-nc-tirar') { const p = String(id).split('|'); lcAbrir({ k: 'auTirar', rid: p[0], ncId: p[1], motivo: '' }, () => auNcAbre(p[0], p[1])); }
  else if (a === 'au-tirar-ok') auTirarOk();
  else if (a === 'au-enviar') { const r = auDe(id); if (r && auPode(r)) lcAbrir({ k: 'auEnviar', rid: id }); }
  else if (a === 'au-enviar-ok') auEnviarOk();
  else if (a === 'au-conf') auConfAbre(id, t.getAttribute('data-nc'));
  else if (a === 'au-conf-ok') auConfOk();
  else if (a === 'au-fechar') auFechar(id);
  else if (a === 'au-rnc') auRncAbre(id);
  else if (a === 'au-prazo') { const r = auDe(id); if (r) lcAbrir({ k: 'auPrazo', rid: id, prazo: addDias(r.prazo > hojeISO() ? r.prazo : hojeISO(), 7), motivo: '' }, () => auRncAbre(id)); }
  else if (a === 'au-prazo-ok') auPrazoOk();
  else if (a === 'au-canc') lcAbrir({ k: 'auCanc', rid: id, motivo: '' }, () => auRncAbre(id));
  else if (a === 'au-canc-ok') auCancOk();
});
document.addEventListener('keydown', e => { if (e.key !== 'Enter' || !S.fm || S.fm.k !== 'auNc') return; const t = e.target, k = t && t.getAttribute && t.getAttribute('data-fm');
  if (k === 'leiTxt' || k === 'crTxt') { e.preventDefault(); auChipAdd(k === 'leiTxt' ? 'leis' : 'coresp', k); } });

/* busca geral */
BG_FONTES.push(q => { const out = []; auLista().forEach(r => auNcs(r).forEach(n => { if (out.length < 6 && bgCasa(q, [r.numero, auNum(n.n), n.titulo, n.nc, n.local, n.respNome, auLeis(n).join(' ')].join(' '))) out.push({ r: r, n: n }); }));
  return out.map(x => ({ grupo: 'Auditoria interna', nome: auNum(x.n.n) + ' · ' + (x.n.titulo || x.n.nc), sub: x.r.numero + ' · ' + (x.n.local || '') + ' · ' + auResp(x.n), ico: 'lista',
    abrir: () => { S.auRid = x.r.id; if (S.rota.area !== 'inspecoes' || S.rota.aba !== 'auditoria') { S._gvNav = true; ir('inspecoes', 'auditoria'); } auNcAbre(x.r.id, x.n.id); } })); });
