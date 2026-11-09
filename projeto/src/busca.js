/* EFCwork · busca.js — busca geral: tecla /, Ctrl+K ou a lupa do topo. Prefixo: bg.
   Acha telas e, de cada área já refeita, os registros que a pessoa pode ver (v0.2: materiais, equipamentos e solicitações).
   Campo vazio: "Voltar para" e "Mais usadas". Setas escolhem, Enter abre, Esc fecha. */
const BG_FONTES = []; /* cada área registra: q => [{grupo, nome, sub, abrir:()=>{}}] */
const bgNorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function bgCasa(q, txt) { const pal = bgNorm(q).split(/\s+/).filter(Boolean), t = bgNorm(txt); return pal.length > 0 && pal.every(p => t.indexOf(p) >= 0); }
BG_FONTES.push(q => {
  const r = [];
  AREAS.forEach(a => { (a.abas.length ? a.abas : [{ id: '', nome: a.nome }]).forEach(t => { if (!a.negada && !t.negada && bgCasa(q, a.nome + ' ' + t.nome)) r.push({ grupo: 'Telas', nome: t.nome, sub: t.id ? a.nome : 'Área', ico: a.ic, abrir: () => ir(a.id, t.id) }); }); });
  return r;
});
BG_FONTES.push(q => {
  if (typeof alVe !== 'function' || !alVe()) return [];
  const it = S.almItens.filter(i => bgCasa(q, [i.nome, i.codigo, i.local].join(' '))).slice(0, 6).map(i => { const s = alSit(i); return { grupo: 'Materiais', nome: i.nome, sub: [i.codigo, i.local, 'utilizável ' + alQ(alDisp(i.id)) + ' ' + (i.un || ''), s.id !== 'ok' ? s.txt : ''].filter(Boolean).join(' · '), ico: 'caixa', abrir: () => { if (S.rota.aba !== 'materiais' || S.rota.area !== 'almox') { S._gvNav = true; ir('almox', 'materiais'); } alAbreItem(i.id); } }; });
  const eq = S.almEq.filter(e => bgCasa(q, [e.tag, e.nome, e.marca, e.serie, e.local].join(' '))).slice(0, 6).map(e => ({ grupo: 'Equipamentos', nome: eqNomeC(e), sub: eqLocal(e), ico: 'eng', abrir: () => { if (S.rota.aba !== 'equipamentos' || S.rota.area !== 'almox') { S._gvNav = true; ir('almox', 'equipamentos'); } alAbreEq(e.id); } }));
  const so = S.almSol.filter(x => bgCasa(q, [x.numero, x.solicitante].concat((x.linhas || []).map(l => l.nome)).join(' '))).slice(0, 4).map(x => ({ grupo: 'Solicitações do almoxarifado', nome: 'Nº ' + x.numero, sub: [fmtD(x.data), x.solicitante, (AL_SOL_ST[x.situacao] || AL_SOL_ST.pendente)[0]].filter(Boolean).join(' · '), ico: 'doc', abrir: () => { if (S.rota.aba !== 'solicitacoes' || S.rota.area !== 'almox') { S._gvNav = true; ir('almox', 'solicitacoes'); } alAbreSol(x.id); } }));
  return it.concat(eq, so);
});
let BG_RES = [];
function bgResultados(q) {
  if (bgNorm(q).trim().length < 2) {
    const o = csUsoLer(), atual = S.rota.area + (S.rota.aba ? '/' + S.rota.aba : '');
    const rec = o.r.filter(k => k !== atual).slice(0, 4).map(k => ({ grupo: 'Voltar para', nome: csNomeRota(k), sub: csArea(k.split('/')[0]).nome, ico: csArea(k.split('/')[0]).ic, abrir: () => { const p = k.split('/'); ir(p[0], p[1]); } }));
    const top = Object.keys(o.n).filter(k => o.n[k] >= 2).sort((a, b) => o.n[b] - o.n[a]).slice(0, 5).map(k => ({ grupo: 'Mais usadas', nome: csNomeRota(k), sub: o.n[k] + ' vezes', ico: csArea(k.split('/')[0]).ic, abrir: () => { const p = k.split('/'); ir(p[0], p[1]); } }));
    return rec.concat(top);
  }
  return BG_FONTES.reduce((a, f) => { try { return a.concat(f(q)); } catch (e) { console.error(e); return a; } }, []);
}
function bgDesenha() {
  const q = ($('#bg-q') || {}).value || '', box = $('#bg-res'); if (!box) return;
  BG_RES = bgResultados(q); let g = '', h = '';
  if (!BG_RES.length) h = '<p class="bg-vz">' + (bgNorm(q).trim().length < 2 ? 'Digite pelo menos 2 letras: nome, código, TAG ou o nome de uma tela.' : 'Nada encontrado para “' + esc(q) + '”.') + '</p>';
  BG_RES.forEach((r, k) => { if (r.grupo !== g) { g = r.grupo; h += '<p class="bg-gh">' + esc(g) + '</p>'; } h += '<button type="button" class="bg-it' + (k === 0 ? ' on' : '') + '" data-act="bg-ir" data-k="' + k + '" role="option" aria-selected="' + (k === 0) + '">' + ic(r.ico || 'seta') + '<span><b>' + esc(r.nome) + '</b><small>' + esc(r.sub || '') + '</small></span></button>'; });
  box.innerHTML = h;
}
function bgAbrir() {
  if (!S.user || $('#bg')) return;
  const d = document.createElement('div'); d.id = 'bg'; d.className = 'bg-fundo';
  d.innerHTML = '<div class="bg-caixa" role="dialog" aria-modal="true" aria-label="Buscar"><label class="bg-campo">' + ic('lupa') + '<input id="bg-q" type="search" autocomplete="off" placeholder="Buscar material, equipamento, solicitação ou tela" aria-label="Buscar"><kbd>Esc</kbd></label><div id="bg-res" class="bg-res" role="listbox"></div><p class="bg-dica">Setas para escolher · Enter abre · Esc fecha</p></div>';
  document.body.appendChild(d); csCamadaAbre('bg', bgFecharSo); bgDesenha(); setTimeout(() => { const i = $('#bg-q'); if (i) i.focus(); }, 0);
}
function bgFecharSo() { const d = $('#bg'); if (d) d.remove(); }
function bgFechar() { if (csTemCamada('bg')) csVolta(); else bgFecharSo(); }
function bgMove(n) { const l = $$('.bg-it'); if (!l.length) return; let k = l.findIndex(x => x.classList.contains('on')); l.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); }); k = (k + n + l.length) % l.length; l[k].classList.add('on'); l[k].setAttribute('aria-selected', 'true'); l[k].scrollIntoView({ block: 'nearest' }); }
document.addEventListener('input', e => { if (e.target && e.target.id === 'bg-q') bgDesenha(); });
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'bg') { bgFechar(); return; }
  const t = e.target.closest && e.target.closest('[data-act="bg-ir"], [data-act="cs-busca"]'); if (!t) return;
  if (t.getAttribute('data-act') === 'cs-busca') { bgAbrir(); return; }
  const r = BG_RES[+t.getAttribute('data-k')]; bgFecharSo(); csCamadaSaiu('bg', () => { if (r) r.abrir(); });
});
document.addEventListener('keydown', e => {
  if ($('#bg')) {
    if (e.key === 'Escape') { e.preventDefault(); /* quem fecha é o voltar das camadas (tabela.js) */ }
    else if (e.key === 'ArrowDown') { e.preventDefault(); bgMove(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); bgMove(-1); }
    else if (e.key === 'Enter') { const o = $('.bg-it.on'); if (o) { e.preventDefault(); o.click(); } }
    return;
  }
  const el = e.target, escrevendo = el && (/INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable);
  if (((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !escrevendo && !e.ctrlKey && !e.metaKey && !e.altKey)) { if (S.user) { e.preventDefault(); bgAbrir(); } }
});
