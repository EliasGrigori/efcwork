/* EFCwork · tabela.js — a TABELA PADRÃO, a GAVETA de detalhe e a JANELA RETRÁTIL usadas por todas as áreas. Prefixos: tb, gv, dd.
   Tabela: busca, um único filtro recolhível (resumo no botão), ordenar pelo cabeçalho, colunas (lembradas no aparelho),
   planilha .xlsx e impressora (só ícones), números à direita, total no rodapé, "mostrar mais".
   cfg = { id, titulo, linhas, cols:[{k, rot, v:r=>valor, html?:r=>html, tipo:'num'|'data'|'txt', fixa?, total?:'soma'|fn}], chave:r=>id,
           aoClicar:'nome da função global' , busca:r=>texto, filtros:[{k, rot, opcoes:[[v, rot]], teste:(r, v)=>bool}], selecionado, vazio, rodape } */
const TB = {}; S.tb = S.tb || {};
function tbEstado(id) {
  if (!S.tb[id]) { let oc = []; try { oc = JSON.parse(Store.get('cw-tbcol-' + id) || '[]'); } catch {} S.tb[id] = { busca: '', filtros: {}, ordem: null, ocultas: Array.isArray(oc) ? oc : [], limite: 100, painel: false }; }
  return S.tb[id];
}
const tbNorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function tbFiltrar(cfg) {
  const st = tbEstado(cfg.id), pal = tbNorm(st.busca).split(/\s+/).filter(Boolean);
  let l = (cfg.linhas || []).filter(r => (cfg.filtros || []).every(f => { const v = st.filtros[f.k]; return v == null || v === '' || f.teste(r, v); }));
  if (pal.length) l = l.filter(r => { const t = tbNorm(cfg.busca ? cfg.busca(r) : cfg.cols.map(c => c.v(r)).join(' ')); return pal.every(p => t.indexOf(p) >= 0); });
  if (st.ordem) {
    const c = cfg.cols.find(x => x.k === st.ordem.k);
    if (c) { const s = st.ordem.dir === 'desc' ? -1 : 1; l = l.slice().sort((a, b) => { const x = c.v(a), y = c.v(b); if (typeof x === 'number' && typeof y === 'number') return (x - y) * s; return String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'pt-BR', { numeric: true }) * s; }); }
  }
  return l;
}
const tbVisiveis = cfg => { const st = tbEstado(cfg.id); return cfg.cols.filter(c => c.fixa || st.ocultas.indexOf(c.k) < 0); };
function tbFmt(c, r) {
  if (c.html) return c.html(r);
  const v = c.v(r);
  if (v == null || v === '') return '<span class="tb-nada">—</span>';
  if (c.tipo === 'data') return esc(fmtD(v));
  if (c.tipo === 'num') return esc(typeof v === 'number' ? numBR(v, c.dec) : v);
  return esc(v);
}
const numBR = (n, dec) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 3 : dec });
const brl = n => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function tbResumoFiltro(cfg) {
  const st = tbEstado(cfg.id), at = (cfg.filtros || []).filter(f => st.filtros[f.k] != null && st.filtros[f.k] !== '');
  return { n: at.length, txt: at.length ? at.map(f => { const o = f.opcoes.find(x => x[0] === st.filtros[f.k]); return o ? o[1] : st.filtros[f.k]; }).join(' · ') : 'Todos' };
}
function tbHTML(cfg) {
  TB[cfg.id] = cfg; const st = tbEstado(cfg.id), cols = tbVisiveis(cfg), todas = tbFiltrar(cfg), l = todas.slice(0, st.limite), rf = tbResumoFiltro(cfg);
  const chave = cfg.chave || (r => r.id);
  let h = '<div class="tb" data-tb="' + esc(cfg.id) + '"><div class="tb-bar">' +
    '<label class="tb-busca">' + ic('lupa') + '<input type="search" data-tbbusca="' + esc(cfg.id) + '" value="' + esc(st.busca) + '" placeholder="' + esc(cfg.buscaDica || 'Buscar nesta lista') + '" aria-label="Buscar nesta lista"></label>' +
    ((cfg.filtros || []).length ? '<button type="button" class="tb-flt' + (st.painel ? ' on' : '') + '" data-act="tb-painel" data-tb="' + esc(cfg.id) + '" aria-expanded="' + st.painel + '">' + ic('filtro') + '<span>Filtro: <b>' + esc(rf.txt) + '</b></span>' + (rf.n ? '<em>' + rf.n + '</em>' : '') + '</button>' : '') +
    '<span class="tb-cont">' + todas.length + (todas.length !== (cfg.linhas || []).length ? ' de ' + (cfg.linhas || []).length : '') + ' ' + esc(cfg.unidade || 'registros') + (rf.n || st.busca ? '<button type="button" class="bt lk" data-act="tb-limpa" data-tb="' + esc(cfg.id) + '">Limpar</button>' : '') + '</span><span class="tb-sp"></span>' +
    '<button type="button" class="bt ic-so" data-act="tb-cols" data-tb="' + esc(cfg.id) + '" title="Escolher colunas" aria-label="Escolher colunas">' + ic('colunas') + '</button>' +
    '<button type="button" class="bt ic-so" data-act="tb-xlsx" data-tb="' + esc(cfg.id) + '" title="Baixar planilha (.xlsx)" aria-label="Baixar planilha (.xlsx)">' + ic('planilha') + '</button>' +
    '<button type="button" class="bt ic-so" data-act="tb-imp" data-tb="' + esc(cfg.id) + '" title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button></div>';
  if (st.painel && (cfg.filtros || []).length) h += '<div class="tb-painel">' + cfg.filtros.map(f => '<div class="tb-pf"><span>' + esc(f.rot) + '</span>' + ddHTML('tbf:' + cfg.id + ':' + f.k, st.filtros[f.k] == null ? '' : st.filtros[f.k], [['', 'Todos']].concat(f.opcoes)) + '</div>').join('') + '</div>';
  if (st.colsAberto) h += '<div class="tb-painel tb-colsp"><span class="tb-pt">Colunas que aparecem</span>' + cfg.cols.filter(c => !c.fixa).map(c => '<label class="tb-ck"><input type="checkbox" data-tbcol="' + esc(cfg.id) + '" value="' + esc(c.k) + '"' + (st.ocultas.indexOf(c.k) < 0 ? ' checked' : '') + '>' + esc(c.rot) + '</label>').join('') + '</div>';
  h += '<div class="tb-w"><table class="tb-t"><thead><tr>' + cols.map(c => {
    const o = st.ordem && st.ordem.k === c.k ? st.ordem.dir : '';
    return '<th class="' + (c.tipo === 'num' ? 'n' : '') + '"' + (o ? ' aria-sort="' + (o === 'asc' ? 'ascending' : 'descending') + '"' : '') + '><button type="button" data-act="tb-ord" data-tb="' + esc(cfg.id) + '" data-k="' + esc(c.k) + '">' + esc(c.rot) + (o ? '<span class="tb-seta">' + (o === 'asc' ? '▲' : '▼') + '</span>' : '') + '</button></th>';
  }).join('') + '</tr></thead><tbody>';
  if (!l.length) h += '<tr><td colspan="' + cols.length + '" class="tb-vz">' + esc(cfg.vazio || 'Nada encontrado.') + '</td></tr>';
  else h += l.map(r => { const id = chave(r); return '<tr' + (cfg.aoClicar ? ' data-act="tb-lin" data-tb="' + esc(cfg.id) + '" data-id="' + esc(id) + '" tabindex="0"' : '') + (cfg.selecionado === id ? ' class="sel"' : '') + '>' + cols.map(c => '<td class="' + (c.tipo === 'num' ? 'n' : '') + (c.cls ? ' ' + c.cls : '') + '">' + tbFmt(c, r) + '</td>').join('') + '</tr>'; }).join('');
  h += '</tbody>';
  const comTotal = cols.some(c => c.total);
  if (comTotal && l.length) h += '<tfoot><tr>' + cols.map((c, i) => { if (!c.total) return '<td>' + (i === 0 ? 'Total' : '') + '</td>'; const v = typeof c.total === 'function' ? c.total(todas) : todas.reduce((s, r) => s + (Number(c.v(r)) || 0), 0); return '<td class="n">' + esc(c.fmtTotal ? c.fmtTotal(v) : numBR(v, c.dec)) + '</td>'; }).join('') + '</tr></tfoot>';
  h += '</table></div>';
  h += '<div class="tb-pe"><span>Mostrando <b>' + l.length + '</b> de ' + todas.length + '</span>' + (cfg.rodape ? '<span>' + cfg.rodape(todas) + '</span>' : '') + (todas.length > l.length ? '<button type="button" class="bt" data-act="tb-mais" data-tb="' + esc(cfg.id) + '">Mostrar mais ' + Math.min(100, todas.length - l.length) + '</button>' : '') + '</div></div>';
  return h;
}

/* ---------- janela retrátil (escolha de opção) ---------- */
/* o = { remover: true } → as opções podem sair da lista: segurar 1,5 s e arrastar até a lixeira que aparece ao lado (DD_RM[prefixo]) */
function ddHTML(id, valor, opcoes, o) {
  const at = opcoes.find(x => x[0] === valor) || opcoes[0], rm = o && o.remover;
  return '<div class="dd" data-dd="' + esc(id) + '"><button type="button" class="dd-b" data-act="dd-abre" aria-haspopup="listbox" aria-expanded="false"><span>' + esc(at[1]) + '</span>' + ic('seta', 'dd-s') + '</button>' +
    '<ul class="dd-l" role="listbox" hidden>' + opcoes.map(x => '<li role="option" data-act="dd-v" data-v="' + esc(x[0]) + '"' + (rm && x[0] && x[0].indexOf('__') !== 0 ? ' data-rm="1"' : '') + ' aria-selected="' + (x[0] === at[0]) + '" tabindex="0">' + esc(x[1]) + (x[0] === at[0] ? ic('ok') : '') + '</li>').join('') +
    (rm && opcoes.some(x => x[0] && x[0].indexOf('__') !== 0) ? '<li class="dd-dica" aria-hidden="true">Para tirar da lista: segure 1,5 s e arraste até a lixeira</li>' : '') + '</ul></div>';
}
const DD_AO = {}; /* DD_AO['prefixo'] = (resto do id, valor) => ... */
const DD_RM = {}; /* DD_RM['prefixo'] = (resto do id, valor) => ... (tirou da lista) */
/* segurar e arrastar para a lixeira (mouse e dedo) */
const DD_SEGURA = 1500;
let ddPr = null;
function ddPrLimpa() { if (!ddPr) return; clearTimeout(ddPr.t); if (ddPr.fant) ddPr.fant.remove(); if (ddPr.lixo) ddPr.lixo.remove(); if (ddPr.li) ddPr.li.classList.remove('dd-pega'); document.body.classList.remove('dd-arrastando'); ddPr = null; }
function ddPrComeca() {
  const p = ddPr; if (!p) return; p.drag = true;
  try { if (navigator.vibrate) navigator.vibrate(30); } catch {}
  p.li.classList.add('dd-pega'); document.body.classList.add('dd-arrastando');
  const r = p.li.closest('.dd-l').getBoundingClientRect(), lx = document.createElement('div'); lx.className = 'dd-lixo'; lx.innerHTML = ic('lixo') + '<span>Solte aqui</span>';
  document.body.appendChild(lx); const lw = lx.offsetWidth || 96, lh = lx.offsetHeight || 64;
  let x = r.right + 12, y = r.top + Math.min(r.height, 220) / 2 - lh / 2;
  if (x + lw > innerWidth - 8) { x = Math.max(8, Math.min(innerWidth - lw - 8, r.left + r.width / 2 - lw / 2)); y = r.bottom + 12; if (y + lh > innerHeight - 8) y = Math.max(8, r.top - lh - 12); }
  lx.style.left = x + 'px'; lx.style.top = y + 'px'; p.lixo = lx;
  const f = document.createElement('div'); f.className = 'dd-fant'; f.textContent = p.li.textContent; document.body.appendChild(f); p.fant = f; ddPrMove(p.x, p.y);
}
function ddPrMove(x, y) {
  const p = ddPr; if (!p || !p.drag) return; p.x = x; p.y = y;
  p.fant.style.left = (x + 10) + 'px'; p.fant.style.top = (y - 18) + 'px';
  const r = p.lixo.getBoundingClientRect(); p.sobre = x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6; p.lixo.classList.toggle('on', p.sobre);
}
document.addEventListener('pointerdown', e => {
  const li = e.target.closest && e.target.closest('.dd-l li[data-rm]'); if (!li || (e.pointerType === 'mouse' && e.button !== 0)) return;
  ddPrLimpa(); ddPr = { li: li, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, drag: false }; ddPr.t = setTimeout(ddPrComeca, DD_SEGURA);
});
document.addEventListener('pointermove', e => { if (!ddPr) return; if (ddPr.drag) { e.preventDefault(); ddPrMove(e.clientX, e.clientY); } else if (Math.abs(e.clientX - ddPr.x0) > 8 || Math.abs(e.clientY - ddPr.y0) > 8) ddPrLimpa(); });
document.addEventListener('touchmove', e => { if (ddPr && ddPr.drag) { e.preventDefault(); const t = e.touches[0]; if (t) ddPrMove(t.clientX, t.clientY); } }, { passive: false });
document.addEventListener('pointerup', () => {
  if (!ddPr) return; const p = ddPr;
  if (p.drag) { S._ddEngole = true; setTimeout(() => { S._ddEngole = false; }, 0); } /* o clique que vem junto com o soltar não escolhe a opção */
  if (p.drag && p.sobre) { const dd = p.li.closest('.dd'), nome = dd.getAttribute('data-dd'), v = p.li.getAttribute('data-v'), pf = nome.split(':')[0]; ddPrLimpa(); ddFecha(); if (DD_RM[pf]) DD_RM[pf](nome.slice(pf.length + 1), v); return; }
  ddPrLimpa();
});
document.addEventListener('pointercancel', () => { if (ddPr && !ddPr.drag) ddPrLimpa(); });
document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('.dd-l li[data-rm]')) e.preventDefault(); });
function ddFecha() { $$('.dd-l').forEach(l => { l.hidden = true; const b = l.previousElementSibling; if (b) b.setAttribute('aria-expanded', 'false'); }); }

/* ---------- gaveta de detalhe (PC: à direita; celular: tela cheia) ---------- */
S.gv = null; S.gvForm = false;
/* gaveta de formulário (S.gvForm): não é redesenhada quando os dados mudam, para não perder o que a pessoa digita; só com gvDesenha(true) */
function gvAbrir(fn, form) { if (!S.camadas.length) csCamadaAbre('gv', gvFecharSo); S.gv = fn; S.gvForm = !!form; gvDesenha(true); }
/* fechar como a pessoa fecha (X, Esc): volta uma camada */
function gvFechar() { if (S.camadas.length) csVolta(); else gvFecharSo(); }
function gvFecharSo() { S.gv = null; S.gvForm = false; S.fm = null; S._alSel = null; const g = $('#gv'); if (g) g.remove(); document.body.classList.remove('gv-aberta'); try { render(); } catch {} }
function gvDesenha(forca) {
  let g = $('#gv'); if (!S.gv) { if (g) g.remove(); return; }
  if (S.gvForm && g && !forca) return;
  let o; try { o = S.gv(); } catch (e) { console.error(e); o = null; }
  if (!o) { S.gv = null; if (g) g.remove(); return; }
  if (!g) { g = document.createElement('aside'); g.id = 'gv'; g.className = 'gv'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'false'); document.body.appendChild(g); }
  document.body.classList.add('gv-aberta');
  g.setAttribute('aria-label', o.titulo || 'Detalhe');
  g.innerHTML = '<div class="gv-cab">' + (o.ico ? '<span class="ico' + (o.icoCls ? ' ' + o.icoCls : '') + '">' + ic(o.ico) + '</span>' : '') + '<div class="gv-tx"><small>' + esc(o.sub || '') + '</small><h2>' + esc(o.titulo || '') + '</h2>' + (o.pill || '') + '</div>' +
    (o.cabAcoes || '') + (o.lixeira ? (function (x) { x = typeof x === 'string' ? { act: x } : x; return '<button type="button" class="bt ic-so gv-lx" data-act="' + esc(x.act) + '"' + (x.id ? ' data-id="' + esc(x.id) + '"' : '') + ' title="' + esc(x.titulo || 'Excluir') + '" aria-label="' + esc(x.titulo || 'Excluir') + '">' + ic('lixo') + '</button>'; })(o.lixeira) : '') +
    '<button type="button" class="bt ic-so" data-act="gv-fecha" title="Fechar" aria-label="Fechar">' + ic('x') + '</button></div><div class="gv-corpo">' + (o.corpo || '') + '</div>' + (o.rodape ? '<div class="gv-pe">' + o.rodape + '</div>' : '');
}
const gvNums = l => '<div class="gv-kv">' + l.map(x => '<div' + (x[2] ? ' class="' + x[2] + '"' : '') + '><b class="num">' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div>').join('') + '</div>';
const gvCampos = l => '<dl class="gv-fl">' + l.filter(x => x[1] != null && x[1] !== '').map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>';
const gvLinha = l => l.length ? '<ol class="gv-tl">' + l.map(x => '<li><span>' + esc(x[0]) + '</span><small>' + esc(x[1]) + '</small></li>').join('') + '</ol>' : '<p class="tb-nada">Sem registros.</p>';

/* ---------- planilha e impressão da tabela ---------- */
function tbLinhasTexto(cfg) {
  const cols = tbVisiveis(cfg), l = tbFiltrar(cfg);
  return { cab: cols.map(c => c.rot), linhas: l.map(r => cols.map(c => { const v = c.v(r); if (c.tipo === 'num' && typeof v === 'number') return v; if (c.tipo === 'data') return v ? fmtD(v) : ''; return v == null ? '' : (c.txt ? c.txt(r) : String(v)); })) };
}
function tbPlanilha(id) {
  const cfg = TB[id]; if (!cfg) return; const d = tbLinhasTexto(cfg);
  const nome = APP_NOME + '-' + tbNorm(cfg.titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + hojeISO() + '.xlsx';
  plBaixar(plXlsx(cfg.titulo, d.cab, d.linhas), nome); aviso('Planilha baixada: ' + nome);
}
function tbImprimir(id) {
  const cfg = TB[id]; if (!cfg) return; const d = tbLinhasTexto(cfg), e = S.empresa || {};
  let p = $('#tb-imp'); if (!p) { p = document.createElement('div'); p.id = 'tb-imp'; document.body.appendChild(p); }
  p.innerHTML = '<div class="imp-cab"><b>' + esc(cfg.titulo) + '</b><span>' + esc(e.nome || '') + ' · ' + esc(fmtD(hojeISO())) + ' · ' + d.linhas.length + ' ' + esc(cfg.unidade || 'registros') + '</span></div><table><thead><tr>' + d.cab.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    d.linhas.map(l => '<tr>' + l.map(v => '<td' + (typeof v === 'number' ? ' class="n"' : '') + '>' + esc(typeof v === 'number' ? numBR(v) : v) + '</td>').join('') + '</tr>').join('') + '</tbody></table><div class="imp-pe">' + APP_APELIDO + '</div>';
  document.body.classList.add('imprimindo'); setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('imprimindo'); }, 50);
}

/* ---------- eventos ---------- */
document.addEventListener('input', e => {
  const t = e.target; if (!t || !t.getAttribute) return; const id = t.getAttribute('data-tbbusca'); if (!id) return;
  const st = tbEstado(id); st.busca = t.value; st.limite = 100;
  clearTimeout(S._tbT); S._tbT = setTimeout(() => { const pos = t.selectionStart; render(); const n = document.querySelector('[data-tbbusca="' + id + '"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } }, 160);
});
document.addEventListener('change', e => {
  const t = e.target; if (!t || !t.getAttribute) return; const id = t.getAttribute('data-tbcol'); if (!id) return;
  const st = tbEstado(id), cfg = TB[id], k = t.value;
  if (t.checked) st.ocultas = st.ocultas.filter(x => x !== k);
  else { const vis = cfg.cols.filter(c => !c.fixa && st.ocultas.indexOf(c.k) < 0); if (vis.length <= 1) { t.checked = true; aviso('Deixe pelo menos uma coluna.'); return; } st.ocultas.push(k); delete st.filtros[k]; if (st.ordem && st.ordem.k === k) st.ordem = null; }
  try { if (st.ocultas.length) Store.set('cw-tbcol-' + id, JSON.stringify(st.ocultas)); else Store.del('cw-tbcol-' + id); } catch {}
  render();
});
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act]');
  if (!t || !/^(tb-|dd-|gv-)/.test(t.getAttribute('data-act'))) { if (!(e.target.closest && e.target.closest('.dd'))) ddFecha(); return; }
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-tb');
  if (a === 'dd-abre') { const l = t.nextElementSibling, ab = l.hidden; ddFecha(); l.hidden = !ab; t.setAttribute('aria-expanded', String(ab)); if (ab) { const s = l.querySelector('[aria-selected="true"]') || l.querySelector('li'); if (s) s.focus(); } return; }
  if (a === 'dd-v') {
    if (S._ddEngole) return; /* foi segurar e arrastar, não escolher */
    const dd = t.closest('.dd'), nome = dd.getAttribute('data-dd'), v = t.getAttribute('data-v'); ddFecha();
    if (nome.indexOf('tbf:') === 0) { const p = nome.split(':'), st = tbEstado(p[1]); st.filtros[p[2]] = v; st.limite = 100; render(); return; }
    const pf = nome.split(':')[0]; if (DD_AO[pf]) DD_AO[pf](nome.slice(pf.length + 1), v); return;
  }
  if (a === 'gv-fecha') { gvFechar(); return; }
  const st = id ? tbEstado(id) : null;
  if (a === 'tb-ord') { const k = t.getAttribute('data-k'); st.ordem = st.ordem && st.ordem.k === k ? (st.ordem.dir === 'asc' ? { k: k, dir: 'desc' } : null) : { k: k, dir: 'asc' }; render(); }
  else if (a === 'tb-painel') { st.painel = !st.painel; st.colsAberto = false; render(); }
  else if (a === 'tb-cols') { st.colsAberto = !st.colsAberto; st.painel = false; render(); }
  else if (a === 'tb-limpa') { st.filtros = {}; st.busca = ''; st.limite = 100; render(); }
  else if (a === 'tb-mais') { st.limite += 100; render(); }
  else if (a === 'tb-xlsx') tbPlanilha(id);
  else if (a === 'tb-imp') tbImprimir(id);
  else if (a === 'tb-lin') { const cfg = TB[id]; if (cfg && cfg.aoClicar) cfg.aoClicar(t.getAttribute('data-id')); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($$('.dd-l:not([hidden])').length) { ddFecha(); return; } if (S.camadas.length) { e.preventDefault(); csVolta(); } }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-act="dd-v"], tr[data-act="tb-lin"]')) { e.preventDefault(); e.target.click(); }
});
