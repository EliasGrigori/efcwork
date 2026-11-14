/* EFCwork · tabela.js — a TABELA PADRÃO, a GAVETA de detalhe e a JANELA RETRÁTIL usadas por todas as áreas. Prefixos: tb, gv, dd.
   Tabela: busca, menu em cada coluna (ordenar, filtrar, travar, mover — v0.4.8), colunas (lembradas no aparelho),
   planilha .xlsx e impressora (só ícones), números à direita, total no rodapé, "mostrar mais".
   cfg = { id, titulo, linhas, cols:[{k, rot, v:r=>valor, html?:r=>html, tipo:'num'|'data'|'txt', fixa?, total?:'soma'|fn}], chave:r=>id,
           aoClicar:'nome da função global' , busca:r=>texto, filtros:[{k, rot, opcoes:[[v, rot]], teste:(r, v)=>bool}], selecionado, vazio, rodape } */
const TB = {}; S.tb = S.tb || {};
/* v0.4.8 (pedido de 08/11 14:12): sem botão Filtro; cada coluna tem um menu no cabeçalho (aparece ao passar o mouse; no celular fica sempre à vista):
   ordenar crescente/decrescente/padrão, busca por texto, lista de valores com caixinhas, mínimo e máximo nos números, mover a coluna, e TRAVAR
   (a coluna fica assim, mesmo depois de sair do app, até destravar). Coluna com filtro, ordem ou trava mostra o símbolo no cabeçalho.
   As colunas também se reorganizam arrastando o cabeçalho. O total fica numa faixa logo acima do cabeçalho, alinhado com cada coluna. */
function tbLeJ(k, pad) { try { const v = JSON.parse(Store.get(k) || 'null'); return v == null ? pad : v; } catch { return pad; } }
function tbEstado(id) {
  if (!S.tb[id]) {
    const oc = tbLeJ('cw-tbcol-' + id, []), co = tbLeJ('cw-tbord-' + id, []), tv = tbLeJ('cw-tbtrava-' + id, {});
    const st = S.tb[id] = { busca: '', filtros: {}, ordem: null, ocultas: Array.isArray(oc) ? oc : [], limite: 100, cf: {}, trava: {}, colOrd: Array.isArray(co) ? co : [] };
    Object.keys(tv || {}).forEach(k => { const t = tv[k] || {}; st.trava[k] = true; if (t.ordem) st.ordem = { k: k, dir: t.ordem }; if (t.cf) st.cf[k] = t.cf; Object.keys(t.pre || {}).forEach(fk => { st.filtros[fk] = t.pre[fk]; }); });
  }
  return S.tb[id];
}
function tbSalvaTrava(id) {
  const st = tbEstado(id), cfg = TB[id], o = {};
  Object.keys(st.trava).forEach(k => { if (!st.trava[k]) return; const pre = {}; tbPresetsDe(cfg, k).forEach(f => { if (st.filtros[f.k] != null && st.filtros[f.k] !== '') pre[f.k] = st.filtros[f.k]; });
    o[k] = { ordem: st.ordem && st.ordem.k === k ? st.ordem.dir : null, cf: tbCfAtivo(st.cf[k]) ? st.cf[k] : null, pre: pre }; });
  try { if (Object.keys(o).length) Store.set('cw-tbtrava-' + id, JSON.stringify(o)); else Store.del('cw-tbtrava-' + id); } catch {}
}
const tbNorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/* texto que a célula mostra (é o que aparece na lista de valores do menu) */
function tbRot(c, r) { const v = c.v(r); if (v == null || v === '') return ''; if (c.txt) return String(c.txt(r)); if (c.tipo === 'data') return fmtD(v); if (c.tipo === 'num' && typeof v === 'number') return c.fmtTotal ? c.fmtTotal(v) : numBR(v, c.dec); return String(v); }
const tbVazio = x => x == null || x === '';
const tbCfAtivo = f => !!f && (!!f.txt || !!f.sel || !tbVazio(f.min) || !tbVazio(f.max));
function tbPassaCol(c, f, r) {
  if (!tbCfAtivo(f)) return true; const lab = tbRot(c, r);
  if (f.txt && tbNorm(lab).indexOf(tbNorm(f.txt)) < 0) return false;
  if (f.sel && f.sel.indexOf(lab) < 0) return false;
  if (!tbVazio(f.min) || !tbVazio(f.max)) { const v = c.v(r); if (typeof v !== 'number') return false; if (!tbVazio(f.min) && v < Number(f.min)) return false; if (!tbVazio(f.max) && v > Number(f.max)) return false; }
  return true;
}
/* os filtros prontos de cada tela (Situação, Local…) moram no menu da coluna correspondente */
function tbColDoPreset(cfg, f) { const cs = cfg.cols || []; return (cs.find(c => c.k === f.k) || cs.find(c => tbNorm(c.rot) === tbNorm(f.rot)) || cs.find(c => !c.fixa) || cs[0] || {}).k; }
const tbPresetsDe = (cfg, k) => cfg ? (cfg.filtros || []).filter(f => tbColDoPreset(cfg, f) === k) : [];
function tbFiltrar(cfg, o) {
  o = o || {}; const st = tbEstado(cfg.id), pal = tbNorm(st.busca).split(/\s+/).filter(Boolean);
  let l = (cfg.linhas || []).filter(r => (cfg.filtros || []).every(f => { if (o.semCol && tbColDoPreset(cfg, f) === o.semCol) return true; const v = st.filtros[f.k]; return v == null || v === '' || f.teste(r, v); }));
  (cfg.cols || []).forEach(c => { if (c.k === o.semCol || !tbCfAtivo(st.cf[c.k])) return; l = l.filter(r => tbPassaCol(c, st.cf[c.k], r)); });
  if (pal.length) l = l.filter(r => { const t = tbNorm(cfg.busca ? cfg.busca(r) : cfg.cols.map(c => c.v(r)).join(' ')); return pal.every(p => t.indexOf(p) >= 0); });
  if (st.ordem && !o.semOrdem) {
    const c = cfg.cols.find(x => x.k === st.ordem.k);
    if (c) { const s = st.ordem.dir === 'desc' ? -1 : 1; l = l.slice().sort((a, b) => { const x = c.v(a), y = c.v(b); if (typeof x === 'number' && typeof y === 'number') return (x - y) * s; return String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'pt-BR', { numeric: true }) * s; }); }
  }
  /* v0.5 (pedido de 09/11 18:25): grupos separados (ex.: Formulários e Regulatórios); a ordem escolhida vale dentro de cada grupo */
  if (cfg.grupos && !o.semOrdem) { const ord = cfg.grupos.ordem.map(x => x[0]), gi = r => { const i = ord.indexOf(cfg.grupos.v(r)); return i < 0 ? ord.length : i; }; l = l.slice().sort((a, b) => gi(a) - gi(b)); }
  return l;
}
function tbOrdenadas(cfg) {
  const o = tbEstado(cfg.id).colOrd; if (!o || !o.length) return cfg.cols.slice();
  return cfg.cols.map((c, i) => [c, i]).sort((a, b) => { const ia = o.indexOf(a[0].k), ib = o.indexOf(b[0].k); return (ia < 0 ? 1000 + a[1] : ia) - (ib < 0 ? 1000 + b[1] : ib); }).map(x => x[0]);
}
const tbVisiveis = cfg => { const st = tbEstado(cfg.id); return tbOrdenadas(cfg).filter(c => c.fixa || st.ocultas.indexOf(c.k) < 0); };
function tbFmt(c, r) {
  if (c.html) return c.html(r);
  const v = c.v(r);
  if (v == null || v === '') return ''; /* célula sem dado fica em branco (pedido de 06/11 17:54) */
  if (c.tipo === 'data') return esc(fmtD(v));
  if (c.tipo === 'num') return esc(typeof v === 'number' ? numBR(v, c.dec) : v);
  return esc(v);
}
const numBR = (n, dec) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 3 : dec });
const brl = n => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/* filtro ativo em cada coluna (filtro pronto ou do menu) */
function tbColFiltrada(cfg, k) { const st = tbEstado(cfg.id); return tbCfAtivo(st.cf[k]) || tbPresetsDe(cfg, k).some(f => !tbVazio(st.filtros[f.k])); }
function tbTemFiltro(cfg) { const st = tbEstado(cfg.id); return !!st.busca || (cfg.cols || []).some(c => tbColFiltrada(cfg, c.k)); }
function tbTemFiltroSolto(cfg) { const st = tbEstado(cfg.id); return !!st.busca || (cfg.cols || []).some(c => !st.trava[c.k] && tbColFiltrada(cfg, c.k)); }
/* total (v0.4.8, refeito 08/11 15:00): na barra de cima, na linha dos ícones; cada valor fica exatamente acima da sua coluna
   e à esquerda vai "Total · N itens". As posições são medidas na tela (tbAlinhaTot); se não couber, ficam em sequência. */
function tbTotal(cfg, cols, todas, filtrado) {
  const cs = cols.filter(c => c.total); if (!cs.length) return '';
  return '<div class="tb-tots" data-tbtot="' + esc(cfg.id) + '"><span class="tb-tl" title="' + (filtrado ? 'Soma só do que está filtrado · ' : 'Soma de toda a lista · ') + todas.length + ' ' + esc(cfg.unidade || 'registros') + '"><b>Total</b></span>' +
    cs.map(c => { const v = typeof c.total === 'function' ? c.total(todas) : todas.reduce((s, r) => s + (Number(c.v(r)) || 0), 0); return '<span class="tb-tv" data-k="' + esc(c.k) + '" title="Total de ' + esc(c.rot) + '"><b>' + esc(c.fmtTotal ? c.fmtTotal(v) : numBR(v, c.dec)) + '</b></span>'; }).join('') + '</div>';
}
/* cada valor fica acima da sua coluna, na largura dela; se o número for maior que a coluna, a caixa cresce para a ESQUERDA (nunca por cima do rótulo "Total") */
function tbAlinhaTot() {
  $$('.tb-tots').forEach(t => {
    const tb = t.closest('.tb'), bar = t.parentElement, br = bar.getBoundingClientRect(), tvs = Array.from(t.querySelectorAll('.tb-tv')), lb = t.querySelector('.tb-tl');
    t.classList.remove('tb-tots-fluxo', 'tb-tots-linha'); t.style.top = ''; bar.style.paddingBottom = ''; t.style.width = br.width + 'px'; lb.style.right = '';
    tvs.forEach(v => { v.style.left = ''; v.style.width = 'auto'; });
    let ok = innerWidth >= 600, min = 1e9, max = 0;
    tvs.forEach(v => { const th = tb.querySelector('thead th[data-tbk="' + v.getAttribute('data-k') + '"]'); if (!th) { ok = false; return; }
      const r = th.getBoundingClientRect(), w = Math.max(r.width, v.offsetWidth), x = r.right - br.left - w; v.style.width = w + 'px'; v.style.left = x + 'px'; min = Math.min(min, x); max = Math.max(max, x + w); });
    if (ok) lb.style.right = (br.width - min + 6) + 'px';
    const esq = Array.from(bar.children).filter(x => x !== t && !x.classList.contains('tb-sp') && x.getBoundingClientRect().width && x.getBoundingClientRect().right <= br.left + min).reduce((m, x) => Math.max(m, x.getBoundingClientRect().right - br.left), 0);
    const dir = Array.from(bar.querySelectorAll('.ic-so')).reduce((m, x) => Math.min(m, x.getBoundingClientRect().left - br.left), br.width);
    /* v0.5.3 (Elias, 10/11: "espaço muito grande entre a tabela e o painel; o total deve estar no mesmo nível dos botões"):
       acabou a linha própria da v0.4.13. Se a coluna do total fica embaixo dos ícones, o total fica na MESMA linha, logo antes deles. */
    if (!ok || min - 6 - lb.offsetWidth < esq + 8 || max > dir - 8) { t.classList.add('tb-tots-fluxo'); t.style.width = ''; tvs.concat(lb).forEach(x => { x.style.left = ''; x.style.right = ''; x.style.width = ''; }); }
  });
}
addEventListener('resize', () => tbAlinhaTot()); addEventListener('scroll', e => { if (e.target && e.target.classList && e.target.classList.contains('tb-w')) tbAlinhaTot(); }, true);
function tbMarcas(cfg, c) {
  const st = tbEstado(cfg.id), o = st.ordem && st.ordem.k === c.k ? st.ordem.dir : '', f = tbColFiltrada(cfg, c.k), t = !!st.trava[c.k];
  return (f ? '<i class="tb-mf" title="Filtrada">' + ic('filtro') + '</i>' : '') + (o ? '<i class="tb-mo" title="' + (o === 'asc' ? 'Crescente' : 'Decrescente') + '">' + ic(o === 'asc' ? 'ordAsc' : 'ordDesc') + '</i>' : '') + (t ? '<i class="tb-mt" title="Travada">' + ic('cadeado') + '</i>' : '');
}
function tbHTML(cfg) {
  TB[cfg.id] = cfg; const st = tbEstado(cfg.id), cols = tbVisiveis(cfg), todas = tbFiltrar(cfg), l = todas.slice(0, st.limite), fl = tbTemFiltro(cfg);
  const chave = cfg.chave || (r => r.id), mn = S.tbMenu && S.tbMenu.id === cfg.id && S.tbMenu.h === location.hash ? S.tbMenu.k : null;
  let h = '<div class="tb" data-tb="' + esc(cfg.id) + '"><div class="tb-bar">' +
    (tbTemFiltroSolto(cfg) ? '<button type="button" class="tb-limpa" data-act="tb-limpa" data-tb="' + esc(cfg.id) + '">' + ic('x') + '<span>Limpar filtro</span></button>' : '') +
    (cfg.aEsquerda ? cfg.aEsquerda(todas) : '<span class="tb-cont">' + todas.length + (todas.length !== (cfg.linhas || []).length ? ' de ' + (cfg.linhas || []).length : '') + ' ' + esc(cfg.unidade || 'registros') + '</span>') + '<span class="tb-sp"></span>' + tbTotal(cfg, cols, todas, fl) +
    '<button type="button" class="bt ic-so" data-act="tb-cols" data-tb="' + esc(cfg.id) + '" title="Escolher colunas" aria-label="Escolher colunas">' + ic('colunas') + '</button>' +
    '<button type="button" class="bt ic-so" data-act="tb-xlsx" data-tb="' + esc(cfg.id) + '" title="Baixar planilha (.xlsx)" aria-label="Baixar planilha (.xlsx)">' + ic('planilha') + '</button>' +
    '<button type="button" class="bt ic-so" data-act="tb-imp" data-tb="' + esc(cfg.id) + '" title="Imprimir" aria-label="Imprimir">' + ic('impressora') + '</button></div>';
  if (st.colsAberto) h += '<div class="tb-painel tb-colsp"><span class="tb-pt">Colunas que aparecem</span>' + tbOrdenadas(cfg).filter(c => !c.fixa).map(c => '<label class="tb-ck"><input type="checkbox" data-tbcol="' + esc(cfg.id) + '" value="' + esc(c.k) + '"' + (st.ocultas.indexOf(c.k) < 0 ? ' checked' : '') + '>' + esc(c.rot) + '</label>').join('') + (st.colOrd.length ? '<button type="button" class="bt lk" data-act="tb-ordpad" data-tb="' + esc(cfg.id) + '">Voltar à ordem original das colunas</button>' : '') + '</div>';
  h += '<div class="tb-w"><table class="tb-t"><thead><tr class="tb-cab">' + cols.map(c => {
    const o = st.ordem && st.ordem.k === c.k ? st.ordem.dir : '', mk = tbMarcas(cfg, c), ab = mn === c.k;
    return '<th class="' + (c.tipo === 'num' ? 'n ' : '') + (mk ? 'tb-at ' : '') + (ab ? 'tb-ab' : '') + '" data-tbk="' + esc(c.k) + '"' + (o ? ' aria-sort="' + (o === 'asc' ? 'ascending' : 'descending') + '"' : '') + '><div class="tb-thi">' +
      '<button type="button" class="tb-thr" data-act="tb-menu" data-tb="' + esc(cfg.id) + '" data-k="' + esc(c.k) + '" title="Opções da coluna · arraste para mudar de lugar">' + esc(c.rot) + '</button>' +
      '<button type="button" class="tb-hm' + (mk ? ' on' : '') + '" data-act="tb-menu" data-tb="' + esc(cfg.id) + '" data-k="' + esc(c.k) + '" aria-haspopup="dialog" aria-expanded="' + ab + '" aria-label="Opções da coluna ' + esc(c.rot) + '">' + (mk || '') + '<i class="tb-hv">' + ic('abre') + '</i></button></div></th>';
  }).join('') + '</tr></thead><tbody>';
  if (!l.length) h += '<tr><td colspan="' + cols.length + '" class="tb-vz">' + esc(cfg.vazio || 'Nada encontrado.') + '</td></tr>';
  else h += l.map((r, n) => { const id = chave(r); return tbGrupoLinha(cfg, todas, l, n, cols.length) + '<tr' + (cfg.aoClicar ? ' data-act="tb-lin" data-tb="' + esc(cfg.id) + '" data-id="' + esc(id) + '" tabindex="0"' : '') + (cfg.selecionado === id ? ' class="sel"' : '') + '>' + cols.map(c => '<td class="' + (c.tipo === 'num' ? 'n' : '') + (c.cls ? ' ' + c.cls : '') + '"' + (c.titulo ? ' title="' + esc(c.titulo(r)) + '"' : '') + '>' + tbFmt(c, r) + '</td>').join('') + '</tr>'; }).join('');
  h += '</tbody></table></div>';
  h += '<div class="tb-pe"><span>Mostrando <b>' + l.length + '</b> de ' + todas.length + '</span>' + (cfg.rodape ? '<span>' + cfg.rodape(todas) + '</span>' : '') + (todas.length > l.length ? '<button type="button" class="bt" data-act="tb-mais" data-tb="' + esc(cfg.id) + '">Mostrar mais ' + Math.min(100, todas.length - l.length) + '</button>' : '') + '</div>';
  requestAnimationFrame(tbAlinhaTot);
  if (mn) { h += (innerWidth < 600 ? '<div class="tb-mn-fundo" data-act="tb-mn-x"></div>' : '') + tbMenuHTML(cfg, mn); requestAnimationFrame(() => { tbPosMenu(); tbMnRestaura(); }); }
  return h + '</div>';
}
/* cabeçalho do grupo (v0.5): aparece antes da primeira linha de cada grupo, com o nome e quantos há nele */
function tbGrupoLinha(cfg, todas, l, n, ncol) {
  const g = cfg.grupos; if (!g) return '';
  const k = g.v(l[n]); if (n > 0 && g.v(l[n - 1]) === k) return '';
  const par = g.ordem.find(x => x[0] === k), rot = par ? par[1] : ''; if (!rot) return '';
  return '<tr class="tb-gr"><td colspan="' + ncol + '"><b>' + esc(rot) + '</b><span>' + todas.filter(r => g.v(r) === k).length + '</span></td></tr>';
}
/* ---------- menu da coluna ---------- */
function tbValores(cfg, c) {
  const m = new Map(); tbFiltrar(cfg, { semCol: c.k, semOrdem: true }).forEach(r => { const lab = tbRot(c, r), x = m.get(lab); if (x) x.n++; else m.set(lab, { lab: lab, v: c.v(r), n: 1 }); });
  return Array.from(m.values()).sort((a, b) => a.lab === '' ? 1 : b.lab === '' ? -1 : typeof a.v === 'number' && typeof b.v === 'number' ? a.v - b.v : c.tipo === 'data' ? String(a.v).localeCompare(String(b.v)) : a.lab.localeCompare(b.lab, 'pt-BR', { numeric: true }));
}
function tbMenuHTML(cfg, k) {
  const st = tbEstado(cfg.id), c = cfg.cols.find(x => x.k === k); if (!c) return '';
  const f = st.cf[k] || {}, tr = !!st.trava[k], dis = tr ? ' disabled' : '', o = st.ordem && st.ordem.k === k ? st.ordem.dir : '', id = esc(cfg.id);
  const nomes = c.tipo === 'num' ? ['Menor para o maior', 'Maior para o menor'] : c.tipo === 'data' ? ['Mais antiga primeiro', 'Mais recente primeiro'] : ['De A a Z', 'De Z a A'];
  const vals = tbValores(cfg, c), bq = tbNorm(f.txt), vis = bq ? vals.filter(x => tbNorm(x.lab).indexOf(bq) >= 0) : vals, sel = f.sel;
  const pos = tbVisiveis(cfg).findIndex(x => x.k === k), nv = tbVisiveis(cfg).length;
  const lin = (act, ico, txt, on, extra) => '<button type="button" class="tb-mn-o' + (on ? ' on' : '') + '" data-act="' + act + '" data-tb="' + id + '" data-k="' + esc(k) + '"' + (extra || '') + dis + '>' + ic(ico) + '<span>' + txt + '</span>' + (on ? '<i>' + ic('ok') + '</i>' : '') + '</button>';
  let h = '<div class="tb-mn" data-tbmn="' + id + '" data-k="' + esc(k) + '" role="dialog" aria-label="Coluna ' + esc(c.rot) + '">' +
    '<i class="tb-mn-pt"></i><div class="tb-mn-cab"><div class="tb-mn-t"><b>' + esc(c.rot) + '</b><small>' + vals.reduce((q, x) => q + x.n, 0) + ' ' + esc(cfg.unidade || 'registros') + ' · ' + vals.length + (vals.length === 1 ? ' valor' : ' valores') + '</small></div>' +
    '<button type="button" class="tb-mn-tr' + (tr ? ' on' : '') + '" data-act="tb-trava" data-tb="' + id + '" data-k="' + esc(k) + '" aria-pressed="' + tr + '" title="' + (tr ? 'Destravar: volta a poder mudar e o Limpar filtro passa a valer' : 'Travar: a ordem e o filtro desta coluna ficam assim, mesmo ao sair do app, até você destravar') + '">' + ic('cadeado') + '<span>' + (tr ? 'Travada' : 'Travar') + '</span></button></div>' +
    (tr ? '<p class="tb-mn-av">' + ic('cadeado') + 'Travada. Destrave para mudar a ordem ou o filtro.</p>' : '') +
    '<div class="tb-mn-corpo"><div class="tb-mn-g tb-mn-ord"><div class="tb-mn-hh"><span class="tb-mn-h">Ordenar</span><button type="button" class="bt lk tb-mn-lp" data-act="tb-mnlimpa" data-tb="' + id + '" data-k="' + esc(k) + '"' + (tbColFiltrada(cfg, k) && !tr ? '' : ' disabled') + '>Limpar esta coluna</button></div>' + '<button type="button" class="tb-mn-o tb-mn-ci' + (o ? ' on' : '') + '" data-act="tb-ociclo" data-tb="' + id + '" data-k="' + esc(k) + '"' + dis + ' title="Cada toque troca: ordem padrão, ' + nomes[0].toLowerCase() + ', ' + nomes[1].toLowerCase() + '">' + ic(o === 'asc' ? 'ordAsc' : o === 'desc' ? 'ordDesc' : 'ordPad') + '<span>' + (o === 'asc' ? nomes[0] : o === 'desc' ? nomes[1] : 'Ordem padrão') + '</span><em>' + (o === 'asc' ? 'toque: inverte' : o === 'desc' ? 'toque: volta ao padrão' : 'toque: ordena') + '</em></button></div>';
  const pre = tbPresetsDe(cfg, k);
  if (pre.length) h += '<div class="tb-mn-g"><span class="tb-mn-h">Filtros prontos</span>' + pre.map(p => '<div class="tb-mn-pre' + (tr ? ' tb-mn-off' : '') + '">' + (pre.length > 1 || p.rot !== c.rot ? '<small>' + esc(p.rot) + '</small>' : '') + ddHTML('tbf:' + cfg.id + ':' + p.k, st.filtros[p.k] == null ? '' : st.filtros[p.k], [['', 'Todos']].concat(p.opcoes)) + '</div>').join('') + '</div>';
  h += '<div class="tb-mn-g tb-mn-fg"><span class="tb-mn-h">Filtrar</span><label class="tb-mn-bs">' + ic('lupa') + '<input type="search" data-tbmnbusca="' + id + '" data-k="' + esc(k) + '" value="' + esc(f.txt || '') + '" placeholder="Buscar em ' + esc(c.rot) + '" aria-label="Buscar em ' + esc(c.rot) + '"' + dis + '></label>';
  if (c.tipo === 'num') h += '<div class="tb-mn-nr"><label><small>De</small><input type="number" inputmode="decimal" data-tbmnmin="' + id + '" data-k="' + esc(k) + '" value="' + esc(f.min == null ? '' : f.min) + '" placeholder="mínimo"' + dis + '></label><label><small>Até</small><input type="number" inputmode="decimal" data-tbmnmax="' + id + '" data-k="' + esc(k) + '" value="' + esc(f.max == null ? '' : f.max) + '" placeholder="máximo"' + dis + '></label></div>';
  const todosMarc = vis.length && vis.every(x => !sel || sel.indexOf(x.lab) >= 0), algum = vis.some(x => !sel || sel.indexOf(x.lab) >= 0);
  h += '<div class="tb-mn-l">' + (vis.length ? '<label class="tb-mn-li tb-mn-all"><input type="checkbox" data-tbmnall="' + id + '" data-k="' + esc(k) + '"' + (todosMarc ? ' checked' : '') + (!todosMarc && algum ? ' data-meio="1"' : '') + dis + '><span>' + (bq ? 'Marcar os encontrados' : 'Marcar todos') + '</span><em>' + vis.reduce((s, x) => s + x.n, 0) + '</em></label>' : '') +
    vis.slice(0, 400).map(x => '<label class="tb-mn-li"><input type="checkbox" data-tbmnv="' + id + '" data-k="' + esc(k) + '" value="' + esc(x.lab) + '"' + (!sel || sel.indexOf(x.lab) >= 0 ? ' checked' : '') + dis + '><span' + (x.lab === '' ? ' class="tb-mn-vz"' : '') + '>' + esc(x.lab === '' ? '(em branco)' : x.lab) + '</span><em>' + x.n + '</em></label>').join('') +
    (!vis.length ? '<p class="tb-mn-nd">Nada com “' + esc(f.txt || '') + '”.</p>' : '') + '</div></div></div>';
  return h;
}
/* a rolagem da lista do menu é guardada quando o usuário rola e devolvida só depois de redesenhar (antes, cada rolagem a devolvia ao ponto antigo e a lista "travava") */
function tbMnRestaura() { const m = document.querySelector('.tb-mn'); if (!m) return; const l = m.querySelector('.tb-mn-l'), cp = m.querySelector('.tb-mn-corpo'); if (cp && S._tbMnCorpo) cp.scrollTop = S._tbMnCorpo; if (l && S._tbMnScroll) l.scrollTop = S._tbMnScroll; }
function tbRolador(el) { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight) return e; } return document.scrollingElement || document.documentElement; }
/* o menu nasce embaixo da própria coluna, com a pontinha apontando para ela; se faltar espaço embaixo, a página sobe um pouco (pedido de 08/11 15:00) */
function tbPosMenu() {
  const m = document.querySelector('.tb-mn'); if (!m) return;
  const meio = m.querySelector('[data-meio]'); if (meio) meio.indeterminate = true;
  const th = document.querySelector('.tb[data-tb="' + m.getAttribute('data-tbmn') + '"] th[data-tbk="' + m.getAttribute('data-k') + '"]');
  if (!th || innerWidth < 600) { m.classList.add('tb-mn-folha'); return; }
  m.classList.remove('tb-mn-folha'); m.style.maxHeight = '';
  let r = th.getBoundingClientRect(); const w = m.offsetWidth, hh = Math.min(m.scrollHeight, 640);
  const falta = r.bottom + 10 + hh - (innerHeight - 8);
  if (falta > 0 && !S._tbMnRolou) { S._tbMnRolou = true; const sob = Math.min(falta, Math.max(0, r.top - 72)); if (sob > 0) { tbRolador(th).scrollBy(0, sob); r = th.getBoundingClientRect(); } }
  let x = th.classList.contains('n') ? r.right - w : r.left; x = Math.max(8, Math.min(x, innerWidth - w - 8));
  const baixo = innerHeight - r.bottom - 18, cima = r.top - 72, sobe = hh > baixo && cima > baixo;
  m.classList.toggle('tb-mn-cima', sobe);
  const alt = Math.min(hh, sobe ? cima : baixo), y = sobe ? r.top - 8 - alt : r.bottom + 8;
  m.style.left = x + 'px'; m.style.top = y + 'px'; m.style.maxHeight = Math.max(200, alt) + 'px';
  m.style.setProperty('--tb-pt', Math.max(14, Math.min(w - 14, r.left + Math.min(r.width, 160) / 2 - x)) + 'px');
}
addEventListener('resize', tbPosMenu); addEventListener('scroll', e => {
  if (!S.tbMenu) return; const t = e.target;
  if (t && t.classList && t.closest && t.closest('.tb-mn')) { if (t.classList.contains('tb-mn-l')) S._tbMnScroll = t.scrollTop; else if (t.classList.contains('tb-mn-corpo')) S._tbMnCorpo = t.scrollTop; return; }
  tbPosMenu();
}, true);
function tbMenuAbre(id, k) {
  if (S.tbMenu && S.tbMenu.id === id && S.tbMenu.k === k) { tbMenuFecha(); return; }
  const ja = !!S.tbMenu; S.tbMenu = { id: id, k: k, h: location.hash }; S._tbMnScroll = 0; S._tbMnCorpo = 0; S._tbMnRolou = false;
  /* no celular o menu é uma folha com camada do "voltar"; no computador não usa o histórico (era ele que engolia o 1º toque ao trocar de aba) */
  if (!ja && innerWidth < 600) { S._tbMnCam = true; csCamadaAbre('tbmn', () => { S._tbMnCam = false; S.tbMenu = null; render(); tbMnRepassa(); }); }
  render(); setTimeout(() => { const i = document.querySelector('.tb-mn [data-tbmnbusca]'); if (i && innerWidth >= 600 && !i.disabled) i.focus(); }, 30);
}
/* v0.5.1 (Grok v0.4.11 A2): no celular, tocar no fundo escuro fecha a folha e o mesmo toque segue para o botão ou a aba que estava embaixo
   (linha da tabela não: só fecha, como no computador). Só botões e abas do conteúdo da página: a barra de cima (busca, tema, sino),
   o menu de baixo e campos de digitar não recebem o toque (tocar ali só fecha a folha, sem abrir teclado nem busca por engano) */
const TB_REPASSA = 'button, a[href], [role="tab"], [data-act]';
function tbMnAlvo(x, y) { const el = document.elementFromPoint(x, y), b = el && el.closest && el.closest(TB_REPASSA); if (!b || !b.closest('.cs-ct') || b.closest('tr[data-act="tb-lin"]') || b.closest('.tb-mn') || b.classList.contains('tb-mn-fundo') || b.disabled) return null; return b; }
function tbMnRepassa() { const p = S._tbMnPt; S._tbMnPt = null; if (!p) return; requestAnimationFrame(() => { const b = tbMnAlvo(p.x, p.y); if (b) b.click(); }); }
function tbMenuFecha() { if (!S.tbMenu) return; if (S._tbMnCam && S.camadas.length && S.camadas[S.camadas.length - 1].nome === 'tbmn') csVolta(); else { S.tbMenu = null; S._tbMnCam = false; render(); } }
/* toque fora (computador): some com o menu sem redesenhar a tela nem mexer no histórico; o toque segue para o que foi tocado */
function tbMenuFechaSolto() { const m = document.querySelector('.tb-mn'); if (m) m.remove(); $$('th.tb-ab').forEach(x => x.classList.remove('tb-ab')); $$('.tb-hm[aria-expanded="true"]').forEach(x => x.setAttribute('aria-expanded', 'false')); S.tbMenu = null; }
window.addEventListener('hashchange', () => { if (S.tbMenu) { S.tbMenu = null; S._tbMnCam = false; S.camadas = S.camadas.filter(c => c.nome !== 'tbmn'); } });
function tbMuda(id, fn) { const st = tbEstado(id); fn(st); st.limite = 100; tbSalvaTrava(id); render(); }
function tbMove(id, k, alvo, depois) {
  const cfg = TB[id], st = tbEstado(id); let o = tbOrdenadas(cfg).map(c => c.k).filter(x => x !== k);
  let i = o.indexOf(alvo); if (i < 0) return; o.splice(depois ? i + 1 : i, 0, k);
  st.colOrd = o; try { Store.set('cw-tbord-' + id, JSON.stringify(o)); } catch {} render();
}
function tbMoveLado(id, k, d) { const v = tbVisiveis(TB[id]).map(c => c.k), i = v.indexOf(k), j = i + d; if (i < 0 || j < 0 || j >= v.length) return; tbMove(id, k, v[j], d > 0); }
/* arrastar o cabeçalho para mudar a coluna de lugar (mouse) */
let tbDr = null;
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.tb-thr'); if (!b || e.button !== 0 || e.pointerType === 'touch') return;
  const th = b.closest('th'); tbDr = { id: b.getAttribute('data-tb'), k: b.getAttribute('data-k'), x: e.clientX, y: e.clientY, th: th, on: false };
});
document.addEventListener('pointermove', e => {
  if (!tbDr) return;
  if (!tbDr.on) { if (Math.abs(e.clientX - tbDr.x) < 7 && Math.abs(e.clientY - tbDr.y) < 7) return; tbDr.on = true; tbDr.th.classList.add('tb-pega'); document.body.classList.add('tb-arrastando');
    tbDr.f = document.createElement('div'); tbDr.f.className = 'tb-fant'; tbDr.f.innerHTML = ic('arrasta') + '<span>' + esc(tbDr.th.textContent.trim()) + '</span>'; document.body.appendChild(tbDr.f); }
  tbDr.f.style.left = (e.clientX + 12) + 'px'; tbDr.f.style.top = (e.clientY + 10) + 'px';
  $$('.tb-alvo-e,.tb-alvo-d').forEach(x => x.classList.remove('tb-alvo-e', 'tb-alvo-d')); tbDr.alvo = null;
  const el = document.elementFromPoint(e.clientX, e.clientY), th = el && el.closest && el.closest('.tb[data-tb="' + tbDr.id + '"] th[data-tbk]');
  if (th && th !== tbDr.th) { const r = th.getBoundingClientRect(), dep = e.clientX > r.left + r.width / 2; th.classList.add(dep ? 'tb-alvo-d' : 'tb-alvo-e'); tbDr.alvo = { k: th.getAttribute('data-tbk'), dep: dep }; }
});
document.addEventListener('pointerup', () => {
  if (!tbDr) return; const d = tbDr; tbDr = null; if (!d.on) return;
  if (d.f) d.f.remove(); d.th.classList.remove('tb-pega'); document.body.classList.remove('tb-arrastando'); $$('.tb-alvo-e,.tb-alvo-d').forEach(x => x.classList.remove('tb-alvo-e', 'tb-alvo-d'));
  S._tbEngole = true; setTimeout(() => { S._tbEngole = false; }, 0);
  if (d.alvo) tbMove(d.id, d.k, d.alvo.k, d.alvo.dep);
});

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
function gvFecharSo() {
  S.gv = null; S.gvForm = false; S.fm = null; S._alSel = null; const g = $('#gv');
  const fz = Mov.ms('--panel-close-dur', 350); gvAnim(fz + 40); if (g) { if (csMovimento()) { g.id = ''; g.classList.add('gv-sai'); g.setAttribute('aria-hidden', 'true'); setTimeout(() => g.remove(), fz - 10); } else g.remove(); } /* fecha deslizando de volta */
  document.body.classList.remove('gv-aberta'); try { render(); } catch {}
}
/* v0.6.3: corta o lado da página só enquanto a gaveta desliza */
function gvAnim(ms) { const h = document.documentElement; h.classList.add('gv-anim'); clearTimeout(S._gvAnimT); if (ms) S._gvAnimT = setTimeout(() => { if (!S.gv) h.classList.remove('gv-anim'); }, ms); }
const csMovimento = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function gvDesenha(forca) {
  let g = $('#gv'); if (!S.gv) { if (g) g.remove(); return; }
  if (S.gvForm && g && !forca) return;
  let o; try { o = S.gv(); } catch (e) { console.error(e); o = null; }
  if (!o) { S.gv = null; if (g) g.remove(); return; }
  const nova = !g, rol = g && g.querySelector('.gv-corpo') ? g.querySelector('.gv-corpo').scrollTop : 0, mesma = g && g._gvFn === S.gv;
  if (!g) { g = document.createElement('aside'); g.id = 'gv'; g.className = 'gv gv-entra'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'false'); document.body.appendChild(g); setTimeout(() => g.classList.remove('gv-entra'), Mov.ms('--panel-open-dur', 400) + 20); }
  gvAnim(0); /* gaveta aberta: o lado da página fica cortado até ela terminar de sair */ /* abre deslizando da lateral (pedido de 06/11) */
  g._gvFn = S.gv;
  document.body.classList.add('gv-aberta');
  g.setAttribute('aria-label', o.titulo || 'Detalhe');
  g.innerHTML = '<div class="gv-cab">' + (o.ico ? '<span class="ico' + (o.icoCls ? ' ' + o.icoCls : '') + '">' + ic(o.ico) + '</span>' : '') + '<div class="gv-tx"><small>' + esc(o.sub || '') + '</small><h2>' + esc(o.titulo || '') + '</h2>' + (o.pill || '') + '</div>' +
    (o.cabAcoes || '') + (o.lixeira ? (function (x) { x = typeof x === 'string' ? { act: x } : x; return '<button type="button" class="bt ic-so gv-lx" data-act="' + esc(x.act) + '"' + (x.id ? ' data-id="' + esc(x.id) + '"' : '') + ' title="' + esc(x.titulo || 'Excluir') + '" aria-label="' + esc(x.titulo || 'Excluir') + '">' + ic('lixo') + '</button>'; })(o.lixeira) : '') +
    '<button type="button" class="bt ic-so" data-act="gv-fecha" title="Fechar" aria-label="Fechar">' + ic('x') + '</button></div><div class="gv-corpo">' + (o.corpo || '') + '</div>' + (o.rodape ? '<div class="gv-pe">' + o.rodape + '</div>' : '');
  if (mesma && rol) { const c = g.querySelector('.gv-corpo'); if (c) c.scrollTop = rol; } /* redesenho da mesma gaveta não volta a rolagem para o topo */
  GV_DEPOIS.forEach(f => { try { f(g, nova || !mesma); } catch (e) { console.error(e); } });
}
const GV_DEPOIS = []; /* funções chamadas depois de desenhar a gaveta: (elemento, abriuAgora) */
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
  const t = e.target; if (!t || !t.getAttribute) return;
  const mb = t.getAttribute('data-tbmnbusca') || t.getAttribute('data-tbmnmin') || t.getAttribute('data-tbmnmax');
  if (mb) { const k = t.getAttribute('data-k'), campo = t.hasAttribute('data-tbmnbusca') ? 'txt' : t.hasAttribute('data-tbmnmin') ? 'min' : 'max', sel = '[data-tbmn' + (campo === 'txt' ? 'busca' : campo) + '="' + mb + '"]', st = tbEstado(mb);
    const f = st.cf[k] = st.cf[k] || {}; f[campo] = t.value; st.limite = 100;
    clearTimeout(S._tbT); S._tbT = setTimeout(() => { const pos = t.selectionStart; tbSalvaTrava(mb); S._tbMnScroll = 0; render(); const n = document.querySelector(sel); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } }, 180); return; }
  const id = t.getAttribute('data-tbbusca'); if (!id) return;
  const st = tbEstado(id); st.busca = t.value; st.limite = 100;
  clearTimeout(S._tbT); S._tbT = setTimeout(() => { const pos = t.selectionStart; render(); const n = document.querySelector('[data-tbbusca="' + id + '"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } }, 160);
});
document.addEventListener('change', e => {
  const t = e.target; if (!t || !t.getAttribute) return;
  const mv = t.getAttribute('data-tbmnv') || t.getAttribute('data-tbmnall');
  if (mv) {
    const cfg = TB[mv], k = t.getAttribute('data-k'), c = cfg.cols.find(x => x.k === k), st = tbEstado(mv), f = st.cf[k] = st.cf[k] || {};
    const vals = tbValores(cfg, c).map(x => x.lab), bq = tbNorm(f.txt), vis = bq ? vals.filter(x => tbNorm(x).indexOf(bq) >= 0) : vals;
    let sel = f.sel ? f.sel.slice() : vals.slice();
    if (t.hasAttribute('data-tbmnall')) { if (t.checked) vis.forEach(x => { if (sel.indexOf(x) < 0) sel.push(x); }); else sel = sel.filter(x => vis.indexOf(x) < 0); }
    else { const v = t.value; if (t.checked) { if (sel.indexOf(v) < 0) sel.push(v); } else sel = sel.filter(x => x !== v); }
    f.sel = vals.every(x => sel.indexOf(x) >= 0) ? null : sel;
    const l = document.querySelector('.tb-mn-l'), cp = document.querySelector('.tb-mn-corpo'); S._tbMnScroll = l ? l.scrollTop : 0; S._tbMnCorpo = cp ? cp.scrollTop : 0;
    tbMuda(mv, () => {}); return;
  }
  const id = t.getAttribute('data-tbcol'); if (!id) return;
  const st = tbEstado(id), cfg = TB[id], k = t.value;
  if (t.checked) st.ocultas = st.ocultas.filter(x => x !== k);
  else { const vis = cfg.cols.filter(c => !c.fixa && st.ocultas.indexOf(c.k) < 0); if (vis.length <= 1) { t.checked = true; aviso('Deixe pelo menos uma coluna.'); return; } st.ocultas.push(k); delete st.cf[k]; if (st.ordem && st.ordem.k === k) st.ordem = null; delete st.trava[k]; tbSalvaTrava(id); }
  try { if (st.ocultas.length) Store.set('cw-tbcol-' + id, JSON.stringify(st.ocultas)); else Store.del('cw-tbcol-' + id); } catch {}
  render();
});
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act]');
  if (S.tbMenu && !S._tbMnCam && !(e.target.closest && (e.target.closest('.tb-mn') || e.target.closest('[data-act="tb-menu"]')))) { const linha = e.target.closest && e.target.closest('tr[data-act="tb-lin"]'); tbMenuFechaSolto(); if (linha) return; /* v0.4.11 (Grok B7): clicar fora numa linha só fecha o menu, não abre a linha */ }
  if (!t || !/^(tb-|dd-|gv-)/.test(t.getAttribute('data-act'))) { if (!(e.target.closest && e.target.closest('.dd'))) ddFecha(); return; }
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-tb');
  if (a === 'dd-abre') { const l = t.nextElementSibling, ab = l.hidden; ddFecha(); l.hidden = !ab; t.setAttribute('aria-expanded', String(ab)); if (ab) { const s = l.querySelector('[aria-selected="true"]') || l.querySelector('li'); if (s) s.focus(); } return; }
  if (a === 'dd-v') {
    if (S._ddEngole) return; /* foi segurar e arrastar, não escolher */
    const dd = t.closest('.dd'), nome = dd.getAttribute('data-dd'), v = t.getAttribute('data-v'); ddFecha();
    if (nome.indexOf('tbf:') === 0) { const p = nome.split(':'); tbMuda(p[1], st => { st.filtros[p[2]] = v; }); return; }
    const pf = nome.split(':')[0]; if (DD_AO[pf]) DD_AO[pf](nome.slice(pf.length + 1), v); return;
  }
  if (a === 'gv-fecha') { gvFechar(); return; }
  const st = id ? tbEstado(id) : null;
  const k = t.getAttribute('data-k'), cfg = id ? TB[id] : null;
  if (a === 'tb-mn-x') {
    if (t.classList.contains('tb-mn-fundo') && e.clientX != null) { t.style.pointerEvents = 'none'; const b = tbMnAlvo(e.clientX, e.clientY); t.style.pointerEvents = ''; S._tbMnPt = b ? { x: e.clientX, y: e.clientY } : null; }
    tbMenuFecha(); if (!S._tbMnCam) tbMnRepassa();
  }
  else if (a === 'tb-menu') { if (S._tbEngole) return; tbMenuAbre(id, k); }
  else if (a === 'tb-ociclo') { const at = st.ordem && st.ordem.k === k ? st.ordem.dir : ''; if (st.ordem && st.ordem.k !== k && st.trava[st.ordem.k]) { aviso('A ordem está travada na coluna ' + (cfg.cols.find(c => c.k === st.ordem.k) || {}).rot + '. Destrave lá para ordenar por esta.'); return; } tbMuda(id, s => { s.ordem = !at ? { k: k, dir: 'asc' } : at === 'asc' ? { k: k, dir: 'desc' } : null; }); }
  else if (a === 'tb-oasc' || a === 'tb-odesc') { if (st.ordem && st.ordem.k !== k && st.trava[st.ordem.k]) { aviso('A ordem está travada na coluna ' + (cfg.cols.find(c => c.k === st.ordem.k) || {}).rot + '. Destrave lá para ordenar por esta.'); return; } tbMuda(id, s => { s.ordem = { k: k, dir: a === 'tb-oasc' ? 'asc' : 'desc' }; }); }
  else if (a === 'tb-opad') tbMuda(id, s => { if (s.ordem && s.ordem.k === k) s.ordem = null; });
  else if (a === 'tb-trava') tbMuda(id, s => { if (s.trava[k]) delete s.trava[k]; else s.trava[k] = true; });
  else if (a === 'tb-mnlimpa') { const l = document.querySelector('.tb-mn-l'); tbMuda(id, s => { delete s.cf[k]; tbPresetsDe(cfg, k).forEach(f => { delete s.filtros[f.k]; }); }); }
  else if (a === 'tb-mvesq' || a === 'tb-mvdir') tbMoveLado(id, k, a === 'tb-mvesq' ? -1 : 1);
  else if (a === 'tb-ordpad') { st.colOrd = []; try { Store.del('cw-tbord-' + id); } catch {} render(); }
  else if (a === 'tb-cols') { st.colsAberto = !st.colsAberto; render(); }
  else if (a === 'tb-limpa') tbMuda(id, s => { s.busca = ''; (cfg.cols || []).forEach(c => { if (s.trava[c.k]) return; delete s.cf[c.k]; tbPresetsDe(cfg, c.k).forEach(f => { delete s.filtros[f.k]; }); }); });
  else if (a === 'tb-mais') { st.limite += 100; render(); }
  else if (a === 'tb-xlsx') tbPlanilha(id);
  else if (a === 'tb-imp') tbImprimir(id);
  else if (a === 'tb-lin') { const cfg = TB[id]; if (cfg && cfg.aoClicar) cfg.aoClicar(t.getAttribute('data-id')); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($$('.dd-l:not([hidden]):not(.dd-fant)').length) { ddFecha(); return; } if (S.tbMenu) { e.preventDefault(); tbMenuFecha(); return; } if (S.camadas.length) { e.preventDefault(); csVolta(); } }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-act="dd-v"], tr[data-act="tb-lin"]')) { e.preventDefault(); e.target.click(); }
});
