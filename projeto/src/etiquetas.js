/* EFCwork · etiquetas.js — Etiquetas das amostras feitas no Vértice (v0.6.43, etapa 3, EM APROVAÇÃO). Prefixo: et.
   Pedido do Elias (27/11 11:3x): "automáticas igual ao do Claudian, senão eu perderia muito tempo editando cada campo", com
   vários tipos de etiqueta, feitas no Vértice. Decisão de 27/11 06:59: o documento mora só no Vértice; o Cwork guarda só a ligação.
   - O modelo é uma planilha do Vértice na pasta Etiquetas: UMA etiqueta desenhada, com as células marcadas (Campos do Cwork ›
     Etiqueta da amostra). O Vértice repete a etiqueta na folha do modelo (vertice/fonte/src/ponte/etiquetas.js).
   - Coletas › Cadastros › Modelos de etiqueta: qual modelo serve para cada material (e, se quiser, para um laboratório).
     Grava em sv2_cfg/coletas.etqVertice = [{ id, tipo, lab ('' = qualquer), docId, nome }] (o mesmo documento dos outros
     cadastros; as regras já deixam Líder ★ e Administrador gravar).
   - Escolha por amostra (a mesma regra do EFClaudian): material + laboratório; sem ele, o do material para qualquer laboratório.
   - Imprimir: o Cwork monta o pedido (os dados de cada amostra), guarda só na memória desta tela e abre o Vértice em
     #/pedido/et<pid>; o Vértice pede os dados pela porta (recurso 'etiquetas'). Nada vai para a nuvem; nada é gravado.
   Quem imprime: quem vê Coletas. Onde: ícone em Amostras (as da lista filtrada), na gaveta da remessa e no aviso depois de "Coletado". */
Object.assign(ICS, { etiqueta: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>' });
Object.assign(S, { etPedidos: {}, etDocs: null, etDocsLendo: false });
const ET_MATS = ['SOLO', 'NEMATOIDE', 'FOLHA', 'FRUTA', 'COMPOSTO'];
const ET_MAX = 600;

/* ---------- os dados de cada amostra: as MESMAS regras do etValor do EFClaudian (valor que falta sai "-") ---------- */
function etDados(c) {
  const t = typeof pgTalhao === 'function' ? pgTalhao(c.talhao) : null, cult = t ? t.cultura : (c.cultura || '-'), vari = t ? t.variedade : (c.variedade || '-');
  const cp = c.tipo === 'COMPOSTO', tr = v => (v == null || v === '' ? '-' : String(v));
  /* o cabeçalho fica escrito no próprio modelo do Vértice (ITEM 277); a observação vem da amostra, no Cwork (ITEM 279) */
  return {
    material: c.tipo === 'NEMATOIDE' ? 'SOLO + RAIZ' : c.tipo, analise: tr(c.analiseNome), cultura: tr(cult), variedade: tr(vari), talhao: tr(c.talhao || c.loteComp),
    profundidade: tr(c.prof), data: c.data || '-', responsavel: tr(c.coletor), estadio: tr(c.estadio), obs: tr(cp ? (c.dadosCompl || c.obs) : c.obs), semana: tr(c.semana),
    laboratorio: tr(c.lab), identificacao: cp ? (c.identif || 'COMPOSTO') : (c.identificacao || (String(cult || '') + ' ' + (c.maturacao || '')).trim() || '-'),
    fertilizante: tr(c.fertilizante), fabricacao: c.dataFabr || '-', rastreabilidade: tr(c.rastreabilidade), hora: tr(c.hora), os: tr(c.os)
  };
}

/* ---------- as ligações (material + laboratório → modelo do Vértice) ---------- */
const etLig = () => ((S.cfgCol || {}).etqVertice || []).filter(x => x && x.docId);
function etModelo(c) {
  const l = etLig().filter(x => x.tipo === c.tipo);
  return l.find(x => x.lab && x.lab === c.lab) || l.find(x => !x.lab) || null;
}
const etMatTxt = m => (CO_MAT.find(x => x[0] === m) || [m, m])[1];

/* ---------- imprimir ---------- */
function etImprimir(ids, origem) {
  const cs = (ids || []).map(id => (S.coletas || []).find(c => c.id === id)).filter(c => c && ET_MATS.indexOf(c.tipo) >= 0 && c.situacao !== 'cancelada');
  if (!cs.length) return aviso('Nenhuma amostra para etiqueta (água não tem etiqueta).', 'erro');
  if (cs.length > ET_MAX) return aviso('São ' + cs.length + ' amostras. Filtre a data (até ' + ET_MAX + ' por vez).', 'erro');
  const sem = Array.from(new Set(cs.filter(c => !etModelo(c)).map(c => etMatTxt(c.tipo))));
  const com = cs.filter(c => etModelo(c));
  if (!com.length) return aviso('Falta ligar um modelo de etiqueta para ' + sem.join(', ') + ' em Coletas › Cadastros › Modelos de etiqueta.', 'erro');
  com.sort((a, b) => cmpTxt(etModelo(a).nome || '', etModelo(b).nome || '') || cmpTxt(a.data + coNome(a), b.data + coNome(b)));
  const pid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  S.etPedidos[pid] = { titulo: 'Etiquetas · ' + origem, em: nowISO(), amostras: com.map(c => { const m = etModelo(c); return { id: c.id, docId: m.docId, modelo: m.nome || '', rotulo: [coNome(c), c.analiseNome, c.prof && c.prof !== 'N/A' ? c.prof : '', c.data ? fmtD(c.data).slice(0, 5) : ''].filter(Boolean).join(' · '), dados: etDados(c) }; }) };
  if (sem.length) aviso('Sem modelo de etiqueta para ' + sem.join(', ') + ': essas ficaram de fora. Ligue em Coletas › Cadastros › Modelos de etiqueta.', 'erro');
  jnAbrir('docs', '#/pedido/et' + pid, true);
}
function etDasFiltradas() {
  const cfg = TB['co-am']; if (!cfg) return;
  etImprimir(tbFiltrar(cfg).map(c => c.id), 'amostras filtradas');
}
const etIcAmostras = () => coVe() ? '<button type="button" class="bt ic-so" data-act="et-am" title="Etiquetas das amostras da lista" aria-label="Etiquetas das amostras da lista">' + ic('etiqueta') + '</button>' : '';
const etIcRemessa = k => coVe() ? '<button type="button" class="bt ic-so" data-act="et-rem" data-id="' + esc(k) + '" title="Etiquetas desta remessa" aria-label="Etiquetas desta remessa">' + ic('etiqueta') + '</button>' : '';
function etDepoisColetado(ids, txt) { aviso(txt, 'ok', ids && ids.length && coVe() ? { rot: 'Etiquetas', fn: () => etImprimir(ids, 'acabou de coletar') } : null); }

/* a porta: o Vértice pede os dados do pedido (só os desta tela, enquanto ela estiver aberta) */
function etPortaLer(pid) {
  if (!S.user || !coVe()) return null;
  const p = S.etPedidos[String(pid || '').replace(/^et/, '')]; if (!p) return null;
  return JSON.parse(JSON.stringify(p));
}

/* ---------- Coletas › Cadastros › Modelos de etiqueta ---------- */
async function etLerDocs() {
  if (S.etDocsLendo || typeof vtUmaVez !== 'function') return; S.etDocsLendo = true;
  try { S.etDocs = (await vtUmaVez({ igual: ['pasta', 'Etiquetas'] })).map(vtnResumo).filter(d => d.tipo === 'planilha' && d.status !== 'lixeira').sort((a, b) => cmpTxt(a.nome, b.nome)); }
  catch (e) { console.warn('etiquetas', e); S.etDocs = S.etDocs || []; }
  finally { S.etDocsLendo = false; if (S.rota.area === 'coletas') { render(); if (S.fm && S.fm.k === 'etLig') gvDesenha(true); } }
}
const etDocNome = id => { const d = (S.etDocs || []).find(x => x.id === id); return d ? d.nome : ''; };
function etCadTela(t, acoesBase) {
  if (S.etDocs === null && !S.etDocsLendo) setTimeout(etLerDocs, 0);
  const l = etLig().map(x => Object.assign({}, x, { nm: etDocNome(x.docId) || x.nome || '' })), pode = ccPode();
  const h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: ['<span>' + l.length + (l.length === 1 ? ' modelo ligado' : ' modelos ligados') + '</span>'], acoes: acoesBase + (pode ? '<button type="button" class="bt pr" data-act="et-lig-novo">' + ic('mais') + 'Ligar modelo</button>' : '') });
  return h + tbHTML({ id: 'cc-etq', titulo: 'Modelos de etiqueta', unidade: 'modelos', unidade1: 'modelo', linhas: l, aoClicar: id => gvAbrir(() => etLigGaveta(id)), vazio: 'Nenhum modelo ligado. As planilhas da pasta Etiquetas do Vértice aparecem aqui para ligar.',
    busca: x => [etMatTxt(x.tipo), x.lab, x.nm].join(' '),
    cols: [{ k: 'mat', rot: 'Material', v: x => etMatTxt(x.tipo), cls: 'forte' }, { k: 'lab', rot: 'Laboratório', v: x => x.lab || 'Qualquer' }, { k: 'md', rot: 'Modelo no Vértice', v: x => x.nm || 'Não encontrado na pasta Etiquetas' }] });
}
function etLigGaveta(id) {
  const x = etLig().find(y => y.id === id); if (!x) return null; const nm = etDocNome(x.docId) || x.nome || '';
  const cab = ccPode() ? ccIcBt('et-lig-ed', 'lapis', 'Trocar o modelo', id) : '';
  return { ico: 'etiqueta', sub: 'Coletas › Cadastros › Modelos de etiqueta', titulo: etMatTxt(x.tipo) + (x.lab ? ' · ' + x.lab : ''), cabAcoes: cab, lixeira: ccPode() ? { act: 'et-lig-tira', id: id, titulo: 'Tirar a ligação' } : null,
    corpo: gvCampos([['Material', etMatTxt(x.tipo)], ['Laboratório', x.lab || 'Qualquer laboratório'], ['Modelo no Vértice', nm || 'Não encontrado na pasta Etiquetas'], ['Amostras carregadas', String((S.coletas || []).filter(c => etModelo(c) === x).length) + ' usam este modelo']]) };
}
function etLigAbrir(id) {
  if (!ccPode()) return; const x = id ? etLig().find(y => y.id === id) : null;
  if (S.etDocs === null) etLerDocs();
  lcAbrir({ k: 'etLig', id: id || '', tipo: x ? x.tipo : 'SOLO', lab: x ? x.lab || '' : '', docId: x ? x.docId : '' }, id ? () => gvAbrir(() => etLigGaveta(id)) : null);
}
LC_FORM.etLig = f => {
  const labs = ccLabs().filter(l => l.ativo || l.nome === f.lab).map(l => [l.nome, l.nome]), docs = (S.etDocs || []).map(d => [d.id, d.nome]);
  const dois = h => '<div class="fm-g cl-fm2">' + h + '</div>';
  const c = lcMsg() + dois(lcBl('Material', ddHTML('et:tipo', f.tipo, CO_MAT)) + lcBl('Laboratório', ddHTML('et:lab', f.lab, [['', 'Qualquer']].concat(labs)))) +
    lcBl('Modelo no Vértice', S.etDocs === null ? '<p class="ag-dc">Lendo a pasta Etiquetas…</p>' : docs.length ? ddHTML('et:doc', f.docId, [['', 'Escolha']].concat(docs)) : '<p class="ag-dc">Nenhuma planilha na pasta Etiquetas do Vértice.</p>');
  return { ico: 'etiqueta', sub: 'Coletas › Cadastros › Modelos de etiqueta', titulo: f.id ? 'Trocar o modelo' : 'Ligar modelo de etiqueta', corpo: c, rodape: lcPe('et-lig-ok', 'Salvar') };
};
function etLigOk() {
  const f = S.fm; if (!f || !ccPode()) return;
  if (!f.docId) return lcErro('Escolha o modelo no Vértice.');
  const cf = S.cfgCol || {}, l = etLig().slice(), dup = l.find(x => x.id !== f.id && x.tipo === f.tipo && (x.lab || '') === (f.lab || ''));
  if (dup) return lcErro(etMatTxt(f.tipo) + (f.lab ? ' · ' + f.lab : ' · qualquer laboratório') + ' já tem modelo ligado. Abra a ligação para trocar.');
  if (!lcTravar()) return;
  const id = f.id || 'et' + Date.now().toString(36), o = { id: id, tipo: f.tipo, lab: f.lab || '', docId: f.docId, nome: etDocNome(f.docId).slice(0, 120) }, i = l.findIndex(x => x.id === id);
  if (i >= 0) l[i] = o; else l.push(o);
  Audit.log({ acao: 'ligar_etiqueta', entidade: 'etqvertice', entidadeId: id, resumo: 'Etiqueta de ' + etMatTxt(o.tipo) + (o.lab ? ' · ' + o.lab : '') + ': ' + o.nome });
  f.volta = null; lcGrava([ccCfgGrava({ etqVertice: l }, cf)], f.id ? 'Modelo trocado.' : 'Modelo ligado.', () => { S.cfgCol = Object.assign({ id: 'coletas' }, cf, { etqVertice: l }); gvAbrir(() => etLigGaveta(id)); });
}
function etLigTira(id) {
  const x = etLig().find(y => y.id === id); if (!x || !ccPode()) return;
  csConfirma({ titulo: 'Tirar a ligação?', texto: 'As amostras de ' + etMatTxt(x.tipo) + (x.lab ? ' do ' + x.lab : '') + ' ficam sem etiqueta até ligar outro modelo. O documento continua no Vértice.', sim: 'Tirar', nao: 'Voltar' }, async () => {
    const cf = S.cfgCol || {}, l = etLig().filter(y => y.id !== id);
    try { await ccCfgGrava({ etqVertice: l }, cf); S.cfgCol = Object.assign({ id: 'coletas' }, cf, { etqVertice: l }); Audit.log({ acao: 'tirar_etiqueta', entidade: 'etqvertice', entidadeId: id, resumo: 'Tirou a etiqueta de ' + etMatTxt(x.tipo) + (x.lab ? ' · ' + x.lab : '') }); gvFechar(); aviso('Ligação tirada.'); render(); }
    catch (e) { aviso(svErro(e), 'erro'); }
  });
}

DD_AO.et = (k, v) => { const f = S.fm; if (!f || f.k !== 'etLig') return; f.sujo = true; f.msg = ''; if (k === 'tipo') f.tipo = v; else if (k === 'lab') f.lab = v; else if (k === 'doc') f.docId = v; gvDesenha(true); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="et-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'et-am') etDasFiltradas();
  else if (a === 'et-rem') etImprimir(coLote(id).map(c => c.id), 'remessa');
  else if (a === 'et-lig-novo') etLigAbrir('');
  else if (a === 'et-lig-ed') etLigAbrir(id);
  else if (a === 'et-lig-ok') etLigOk();
  else if (a === 'et-lig-tira') etLigTira(id);
});
