/* EFCwork · kit.js — Kit do laboratório e papéis do envio (v0.6.10). Prefixo: kt.
   Plano de integração v2, ITENS 6 e 7 e as sugestões 1, 3 e 5 (aprovados em 12/11/2026 13:51).
   - Coletas › Envio ganha a vista Laboratórios (lista retrátil Remessas | Laboratórios). Tocar num laboratório abre a gaveta com o endereço
     (destinatário do rótulo) e o kit de impressão: o rótulo do sistema e os papéis de Documentos › Impressos ligados àquele laboratório.
     Em cada papel: Sempre, Perguntar ou Só se eu pedir; e para qual análise vale (sugestão 5).
   - Endereços no cadastro, nada no código: sv2_cfg/coletas.labInfo[nome do laboratório] = {nome, end, bairro, cidade, uf, cep, contato, conteudo, rotulo}.
     O remetente vem do cadastro da empresa do EFClaudian (sv2_cfg/empresa: razao e unid.matriz/filial), a unidade pela fazenda do talhão.
   - Kit em sv2_impressos (Contrato EFD v1, ponto 'coletas.envio'): {v, ponto, nome, docId, lab, copias, ordem, ativo, quando, analise}.
   - Depois de enviar amostras (como no EFClaudian), abre "Papéis deste envio": Sempre já marcado, Perguntar desmarcado; "Quer acrescentar algo
     na ficha?" com amostras, caixas, análise e pontos sugeridos pelo envio. O rótulo sai uma folha por caixa (A4 em pé, "Caixa 1 de 2").
     Fica registrado em sv2_envio_imp (o que saiu, de que versão, quem e quando, e os dados) para Reimprimir (sugestão 3) e para o resumo. */
Object.assign(S, { ktKit: [], ktImp: [], coEnvVista: 'rem' });
const KT_QUANDO = [['sempre', 'Sempre'], ['perguntar', 'Perguntar'], ['pedir', 'Só se eu pedir']];
const KT_ROTULO = '__rotulo';

CS_CARGAS.push(() => {
  if (!coVe()) return;
  const re = () => { if (S.rota.area === 'coletas' || (S.rota.area === 'documentos' && S.rota.aba === 'impressos')) render(); else if (S.gv) gvDesenha(); };
  csOuve('sv2_impressos', l => { S.ktKit = (l || []).filter(x => x && x.v === 1); re(); });
  csOuve('sv2_envio_imp', l => { S.ktImp = l || []; re(); }, { order: 'em', limit: 400 });
});

/* ---------- dados ---------- */
const ktPodeCad = () => isSup(S.user);
const ktInfo = lab => ((S.cfgCol || {}).labInfo || {})[lab] || null;
const ktTemEnd = i => !!(i && i.nome && i.end);
const ktKitDe = lab => S.ktKit.filter(x => x.ativo !== false && x.ponto === 'coletas.envio' && (x.lab === lab || !x.lab)).sort((a, b) => (a.ordem || 0) - (b.ordem || 0) || cmpTxt(a.nome, b.nome));
const ktDoc = id => S.ipDocs.find(d => d.id === id) || null;
const ktRotQuando = lab => { const i = ktInfo(lab); return (i && i.rotulo) || 'sempre'; };
const ktImpId = k => k.split('|')[0] + '_' + slugLogin(k.split('|').slice(1).join('|') || 'sem-lab').replace(/\./g, '-').slice(0, 60);
const ktUltimo = k => S.ktImp.filter(x => x.k === k).sort((a, b) => String(b.em).localeCompare(String(a.em)))[0] || null;
const ktAnalises = () => Array.from(new Set(S.coletas.map(c => c.analiseNome || c.sigla).filter(Boolean).concat((S.analises || []).map(a => a.nome).filter(Boolean)))).sort(cmpTxt);
function ktUnidade(l) {
  const n = { matriz: 0, filial: 0 }; (l || []).forEach(c => { const f = typeof pgFazenda === 'function' ? pgFazenda(c.talhao) : null; n[(f && f.unidade) === 'filial' ? 'filial' : 'matriz']++; });
  return n.filial > n.matriz ? 'filial' : 'matriz';
}
function ktRemetente(u) {
  const e = S.empresa || {}, x = ((e.unid || {})[u]) || {};
  return { razao: String(e.razao || e.nome || '').trim(), nome: String(x.nome || (u === 'filial' ? 'Filial' : 'Matriz')).trim(), end: String(x.end || '').trim(), bairro: String(x.bairro || '').trim(), cep: String(x.cep || '').trim(), mun: String(x.mun || '').trim(), uf: String(x.uf || '').trim() };
}
const ktRemOk = r => !!(r.razao && r.end);
const ktDestLinhas = i => !i ? [] : [i.end, i.bairro ? 'Bairro: ' + i.bairro : '', [i.cidade, i.uf].filter(Boolean).join(' – ') + (i.cep ? ' - CEP ' + i.cep : ''), i.contato].filter(x => String(x || '').trim());

/* ---------- Envio › Laboratórios ---------- */
function ktLinhas() {
  const nomes = Array.from(new Set(coLabs().concat(Object.keys((S.cfgCol || {}).labInfo || {})))).filter(Boolean).sort(cmpTxt);
  const ult = {}; coAtivas().forEach(c => { if (c.enviado && c.envio && c.lab && (!ult[c.lab] || c.envio > ult[c.lab])) ult[c.lab] = c.envio; });
  return nomes.map(n => { const i = ktInfo(n), kit = ktKitDe(n).filter(x => ktDoc(x.docId)); return { id: n, nome: n, cid: i ? [i.cidade, i.uf].filter(Boolean).join(' · ') : '', kit: kit.length + (ktRotQuando(n) !== 'pedir' ? 1 : 0), ult: ult[n] || '', st: !ktTemEnd(i) ? 'end' : kit.length ? 'ok' : 'rot' }; });
}
const KT_ST = { ok: ['Kit pronto', 'ok'], rot: ['Só o rótulo', ''], end: ['Falta o endereço', 'wa'] };
function ktTabLabs() {
  return tbHTML({ id: 'kt-labs', titulo: 'Laboratórios', unidade: 'laboratórios', linhas: ktLinhas(), aoClicar: n => ktAbreLab(n), busca: r => [r.nome, r.cid].join(' '), vazio: 'Nenhum laboratório cadastrado (os laboratórios vêm do cadastro das Coletas no EFClaudian).',
    cols: [{ k: 'nome', rot: 'Laboratório', v: r => r.nome, cls: 'forte' }, { k: 'cid', rot: 'Cidade', v: r => r.cid }, { k: 'kit', rot: 'Papéis do kit', tipo: 'num', v: r => r.kit },
      { k: 'ult', rot: 'Último envio', tipo: 'data', v: r => r.ult }, { k: 'st', rot: 'Situação', v: r => KT_ST[r.st][0], html: r => alPill(KT_ST[r.st][0], KT_ST[r.st][1]) }] });
}
DD_AO.kt = (k, v) => {
  if (k === 'vista') { S.coEnvVista = v; render(); return; }
  if (k.indexOf('q:') === 0) return ktQuando(k.slice(2), v);
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'doc') f.docId = v; else if (k === 'quando') f.quando = v; else if (k === 'analise') f.analise = v; else if (k === 'copias') f.copias = v; else if (k === 'rem') { ktPapCarrega(f, v); f.sujo = false; } else if (k === 'unid') f.unid = v;
  gvDesenha(true);
};
/* gaveta do laboratório: endereço e kit */
function ktAbreLab(nome) { S._ktLab = nome; gvAbrir(() => ktGavLab(nome)); }
function ktGavLab(nome) {
  const i = ktInfo(nome), sup = ktPodeCad(), kit = ktKitDe(nome), linhas = ktDestLinhas(i);
  const qdd = (id, v) => sup ? ddHTML('kt:q:' + id, v, KT_QUANDO.concat(id === KT_ROTULO ? [] : [['__tirar', 'Tirar do kit']])) : '<span class="kt-q">' + esc((KT_QUANDO.find(x => x[0] === v) || KT_QUANDO[0])[1]) + '</span>';
  let c = '<p class="gv-h">Destinatário do rótulo</p>' + (ktTemEnd(i) ? gvCampos([['Nome', i.nome], ['Endereço', linhas[0] || ''], ['Bairro', i.bairro || ''], ['Cidade', [i.cidade, i.uf].filter(Boolean).join(' · ')], ['CEP', i.cep || ''], ['Contato', i.contato || ''], ['Conteúdo', i.conteudo || '']])
    : lcAv('Falta o endereço deste laboratório. ' + (sup ? 'Toque no lápis para cadastrar: ele vai no rótulo da caixa.' : 'Peça ao Administrador ou ao Líder para cadastrar.'), 'wa'));
  c += '<p class="gv-h">Kit de impressão do envio</p><div class="ag-pn ag-gv kt-kit">' +
    '<div class="ag-l"><span class="ag-t"><b>Rótulo destinatário e remetente</b><small>Do sistema · uma folha por caixa</small></span>' + qdd(KT_ROTULO, ktRotQuando(nome)) + '</div>' +
    kit.map(x => { const d = ktDoc(x.docId); if (!d || d.status === 'lixeira') return ''; return '<div class="ag-l"><span class="ag-t"><b>' + esc(d.nome) + '</b><small>' + esc([ipFmtTxt(d), 'versão ' + d.rev, x.analise ? 'só ' + x.analise : '', x.copias === 'porCaixa' ? 'uma por caixa' : Number(x.copias) > 1 ? x.copias + ' cópias' : '', !x.lab ? 'todos os laboratórios' : '', d.status === 'obsoleto' ? 'OBSOLETO' : !d.pub ? 'sem cópia em PDF' : ''].filter(Boolean).join(' · ')) + '</small></span>' + qdd(x.id, x.quando || 'sempre') + '</div>'; }).join('') + '</div>';
  if (!kit.length) c += '<p class="ag-dc">' + (sup ? 'Anexe a ficha, a cadeia de custódia ou o formulário deste laboratório (eles vêm de Documentos › Impressos).' : 'Só o rótulo, por enquanto.') + '</p>';
  const st = !ktTemEnd(i) ? 'end' : kit.length ? 'ok' : 'rot';
  return { ico: 'predio', sub: 'Coletas › Envio › Laboratórios', titulo: nome, pill: alPill(KT_ST[st][0], KT_ST[st][1]),
    cabAcoes: sup ? '<button type="button" class="bt ic-so" data-act="kt-end" title="Endereço do laboratório" aria-label="Editar o endereço">' + ic('lapis') + '</button>' : '', corpo: c,
    rodape: '<button type="button" class="bt" data-act="gv-fecha">Fechar</button><span class="au-pesp"></span>' + (sup ? '<button type="button" class="bt pr" data-act="kt-anexar">' + ic('mais') + 'Anexar papel</button>' : '') };
}
async function ktQuando(id, v) {
  if (!ktPodeCad()) return; const lab = S._ktLab;
  try {
    if (id === KT_ROTULO) { const info = Object.assign({}, ((S.cfgCol || {}).labInfo || {})); info[lab] = Object.assign({}, info[lab] || {}, { rotulo: v }); await ktCfgGrava(info); }
    else if (v === '__tirar') { const x = S.ktKit.find(y => y.id === id); await Data.col('sv2_impressos').update(id, { ativo: false, alteradoEm: nowISO(), alteradoPor: S.user.nome }); Audit.log({ acao: 'kit_tirar', entidade: 'impresso', entidadeId: id, resumo: 'Tirou do kit de ' + lab + ': ' + (x ? x.nome : '') }); aviso('Tirado do kit.'); }
    else await Data.col('sv2_impressos').update(id, { quando: v, alteradoEm: nowISO(), alteradoPor: S.user.nome });
  } catch (e) { aviso(svErro(e), 'erro'); }
}
async function ktCfgGrava(info) {
  const cf = S.cfgCol; if (cf && cf.id) await Data.col('sv2_cfg').update('coletas', { labInfo: info });
  else await Data.col('sv2_cfg').set('coletas', Object.assign({}, cf || {}, { labInfo: info }));
  S.cfgCol = Object.assign({ id: 'coletas' }, S.cfgCol || {}, { labInfo: info });
}
/* endereço do laboratório */
LC_FORM.ktEnd = f => ({ ico: 'lapis', sub: 'Coletas › Envio › ' + f.lab, titulo: 'Endereço do laboratório', corpo: lcMsg() +
  '<p class="ag-dc">Vai no rótulo da caixa, como destinatário. Fica no cadastro (não no código do app).</p>' +
  lcBl('Nome no rótulo', lcIn('nome', f.nome, ' maxlength="120" placeholder="Razão social do laboratório"')) + lcBl('Endereço', lcIn('end', f.end, ' maxlength="140" placeholder="Rua e número"')) +
  '<div class="fm-g">' + lcBl('Bairro', lcIn('bairro', f.bairro, ' maxlength="80"')) + lcBl('CEP', lcIn('cep', f.cep, ' maxlength="10" inputmode="numeric" placeholder="00000-000"')) + '</div>' +
  '<div class="fm-g">' + lcBl('Cidade', lcIn('cidade', f.cidade, ' maxlength="80"')) + lcBl('UF', lcIn('uf', f.uf, ' maxlength="2" autocapitalize="characters"')) + '</div>' +
  lcBl('Contato', lcIn('contato', f.contato, ' maxlength="120" placeholder="Telefone ou setor de recebimento (opcional)"')) + lcBl('Conteúdo', lcIn('conteudo', f.conteudo, ' maxlength="140" placeholder="Ex.: amostras de solo para análise (opcional)"')),
  rodape: lcPe('kt-end-ok', 'Salvar') });
async function ktEndOk() {
  const f = S.fm; if (!f || !ktPodeCad()) return;
  const t = k => String(f[k] || '').trim().replace(/\s+/g, ' '), o = { nome: t('nome'), end: t('end'), bairro: t('bairro'), cidade: t('cidade'), uf: t('uf').toUpperCase(), cep: t('cep'), contato: t('contato'), conteudo: t('conteudo') };
  if (!o.nome || !o.end) return lcErro('Escreva pelo menos o nome e o endereço.');
  if (o.cep && !/^\d{5}-?\d{3}$/.test(o.cep)) return lcErro('CEP com 8 números (00000-000).');
  if (o.uf && !/^[A-Z]{2}$/.test(o.uf)) return lcErro('UF com 2 letras.');
  if (o.cep && o.cep.indexOf('-') < 0) o.cep = o.cep.slice(0, 5) + '-' + o.cep.slice(5);
  if (!lcTravar()) return;
  try {
    const info = Object.assign({}, ((S.cfgCol || {}).labInfo || {})); info[f.lab] = Object.assign({}, info[f.lab] || {}, o, { alteradoEm: nowISO(), alteradoPor: S.user.nome });
    await ktCfgGrava(info); Audit.log({ acao: 'lab_endereco', entidade: 'laboratorio', entidadeId: f.lab, resumo: 'Endereço do laboratório ' + f.lab + ' salvo' });
    lcFim(); aviso('Endereço salvo.');
  } catch (e) { if (S.fm) S.fm._trava = 0; lcErro(svErro(e)); }
}
/* anexar um papel de Documentos › Impressos ao kit */
LC_FORM.ktAnexar = f => {
  const docs = ipVivos().filter(d => d.tipo !== 'link' && d.status !== 'obsoleto').sort((a, b) => cmpTxt(ipPasta(a), ipPasta(b)) || cmpTxt(a.nome, b.nome)), ja = ktKitDe(f.lab).map(x => x.docId);
  const ops = docs.filter(d => ja.indexOf(d.id) < 0).map(d => [d.id, (d.codigo ? d.codigo + ' · ' : '') + d.nome + (d.pub ? '' : ' (sem PDF)')]);
  let c = lcMsg();
  if (!ops.length) c += lcAv('Não há papel para anexar. Importe primeiro a ficha ou a custódia em Documentos › Impressos.', 'wa');
  else c += lcBl('Papel', ddHTML('kt:doc', f.docId || '', [['', 'Escolha o papel']].concat(ops))) +
    '<div class="fm-g">' + lcBl('Quando sai', ddHTML('kt:quando', f.quando, KT_QUANDO)) + lcBl('Cópias', ddHTML('kt:copias', f.copias, [['uma', '1 cópia'], ['2', '2 cópias'], ['3', '3 cópias'], ['porCaixa', 'Uma por caixa']])) + '</div>' +
    lcBl('Vale para', ddHTML('kt:analise', f.analise || '', [['', 'Todas as análises']].concat(ktAnalises().map(a => [a, a]))), 'opcional') +
    (ktPodeCad() ? '<label class="fm-ck"><input type="checkbox" data-fm="todos"' + (f.todos === '1' ? ' checked' : '') + '> Usar em todos os laboratórios</label>' : '');
  return { ico: 'mais', sub: 'Kit · ' + f.lab, titulo: 'Anexar papel', corpo: c, rodape: lcPe('kt-anexar-ok', 'Anexar') };
};
async function ktAnexarOk() {
  const f = S.fm; if (!f || !ktPodeCad()) return; const d = ktDoc(f.docId); if (!d) return lcErro('Escolha o papel.');
  if (!lcTravar()) return;
  const o = { v: 1, ponto: 'coletas.envio', nome: d.nome, docId: d.id, lab: f.todos === '1' ? '' : f.lab, copias: /^\d$/.test(f.copias) ? Number(f.copias) : f.copias, ordem: ktKitDe(f.lab).length + 1, ativo: true, quando: f.quando, analise: f.analise || '', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome };
  const e = EFD.impresso(o); if (e.length) { console.error('Contrato EFD', e); S.fm._trava = 0; return lcErro('Não deu para anexar: ' + e[0] + '.'); }
  try { await Data.col('sv2_impressos').add(o); Audit.log({ acao: 'kit_anexar', entidade: 'impresso', entidadeId: d.id, resumo: 'Anexou ' + d.nome + ' ao kit de ' + (o.lab || 'todos os laboratórios') }); lcFim(); aviso('Papel anexado ao kit.'); }
  catch (er) { if (S.fm) S.fm._trava = 0; lcErro(svErro(er)); }
}

/* ---------- Papéis deste envio ---------- */
function ktRemNome(k) { const p = k.split('|'); return fmtD(p[0]) + ' · ' + (p.slice(1).join('|') || 'sem laboratório'); }
function ktPapItens(k, dados) {
  const lab = k.split('|').slice(1).join('|'), l = coLote(k), ans = Array.from(new Set(l.map(c => c.analiseNome || c.sigla).filter(Boolean)));
  const it = [{ id: KT_ROTULO, nome: 'Rótulo destinatário e remetente', quando: ktRotQuando(lab) }];
  ktKitDe(lab).forEach(x => { const d = ktDoc(x.docId); if (!d || d.status === 'lixeira') return; if (x.analise && ans.indexOf(x.analise) < 0) return; it.push({ id: x.id, docId: d.id, nome: d.nome, quando: x.quando || 'sempre', copias: x.copias, d: d }); });
  return it.filter(x => x.quando !== 'pedir' || (dados && dados.forcar && dados.forcar[x.id]));
}
function ktPapCarrega(f, k) {
  const l = coLote(k), u = ktUltimo(k), ans = Array.from(new Set(l.map(c => c.analiseNome || c.sigla).filter(Boolean)));
  const pts = Array.from(new Set(l.map(c => coNome(c)).filter(x => x && x !== '—')));
  const d = u && u.dados ? u.dados : { amostras: String(l.length), caixas: '1', analise: ans.join(', '), pontos: pts.join(', '), obs: '', unid: ktUnidade(l) };
  Object.assign(f, { kRem: k, amostras: d.amostras, caixas: d.caixas, analise: d.analise, pontos: d.pontos, obs: d.obs || '', unid: d.unid || ktUnidade(l), sel: {}, reimp: !!u, msg: '' });
  const antes = u ? (u.itens || []).reduce((o, x) => { o[x.id] = true; return o; }, {}) : {};
  ktPapItens(k, { forcar: antes }).forEach(x => { f.sel[x.id] = u ? !!antes[x.id] : x.quando === 'sempre'; });
}
function ktPapAbre(ks, volta) {
  ks = (ks || []).filter(k => coLote(k).length); if (!ks.length) return;
  lcAbrir({ k: 'ktPap', ks: ks, kRem: ks[0], sel: {}, unid: 'matriz' }, volta || null);
  ktPapCarrega(S.fm, ks[0]); S.fm.sujo = false; gvDesenha(true);
}
LC_FORM.ktPap = f => {
  const k = f.kRem, lab = k.split('|').slice(1).join('|'), it = ktPapItens(k, { forcar: f.sel }), i = ktInfo(lab), rem = ktRemetente(f.unid);
  const box = x => { const on = !!f.sel[x.id], d = x.d, sub = x.id === KT_ROTULO ? (!ktTemEnd(i) ? 'falta o endereço do laboratório' : !ktRemOk(rem) ? 'falta o endereço da unidade (Administração › Empresa no EFClaudian)' : 'uma folha por caixa') : [ipFmtTxt(d), 'versão ' + d.rev, d.status === 'obsoleto' ? 'obsoleto: não imprime' : !d.pub ? 'abre no Vértice para preencher' : x.copias === 'porCaixa' ? 'uma por caixa' : Number(x.copias) > 1 ? x.copias + ' cópias' : ''].filter(Boolean).join(' · ');
    return '<button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="kt-ck" data-id="' + esc(x.id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(x.nome) + '</b><small>' + esc(sub) + '</small></span></button>'; };
  const pedir = ktKitDe(lab).filter(x => x.quando === 'pedir' && !it.some(y => y.id === x.id) && ktDoc(x.docId));
  let c = lcMsg();
  if (f.ks.length > 1) c += lcBl('Remessa', ddHTML('kt:rem', k, f.ks.map(x => [x, ktRemNome(x)])), f.ks.length + ' laboratórios neste envio');
  if (f.reimp) c += lcAv('Já saíram papéis desta remessa. Os mesmos ficam marcados para reimprimir.');
  c += '<div class="fm-pk"><div class="fm-pkl co-pkl">' + it.map(box).join('') + '</div></div>';
  if (pedir.length) c += '<div class="kt-ped">' + pedir.map(x => '<button type="button" class="bt lk" data-act="kt-pedir" data-id="' + esc(x.id) + '">' + ic('mais') + esc(ktDoc(x.docId).nome) + '</button>').join('') + '</div>';
  c += '<p class="gv-h">Quer acrescentar algo na ficha? <small>opcional</small></p>' +
    '<div class="fm-g">' + lcBl('Amostras', lcIn('amostras', f.amostras, ' inputmode="numeric" maxlength="4"')) + lcBl('Caixas', lcIn('caixas', f.caixas, ' inputmode="numeric" maxlength="2"')) + '</div>' +
    '<div class="fm-g">' + lcBl('Análise', lcIn('analise', f.analise, ' maxlength="140"')) + lcBl('Pontos', lcIn('pontos', f.pontos, ' maxlength="300"')) + '</div>' +
    lcBl('Observação', lcTx('obs', f.obs, 'Ex.: urgência, pedido de cotação, contato')) +
    (((S.empresa || {}).unid || {}).filial ? lcBl('Remetente', ddHTML('kt:unid', f.unid, [['matriz', ktRemetente('matriz').nome], ['filial', ktRemetente('filial').nome]])) : '');
  return { ico: 'impressora', sub: 'Remessa · ' + ktRemNome(k), titulo: 'Papéis deste envio', corpo: c, rodape: '<button type="button" class="bt" data-act="gv-fecha">Depois</button><span class="au-pesp"></span><button type="button" class="bt pr" data-act="kt-imprimir">' + ic('impressora') + 'Imprimir</button>' };
};
/* rótulo: A4 em pé, uma folha por caixa (port do fxEtiqueta do EFClaudian, com os endereços vindos do cadastro) */
function ktRotuloHTML(lab, unid, caixas, amostras) {
  const i = ktInfo(lab) || {}, r = ktRemetente(unid), n = Math.max(1, Math.min(20, Number(caixas) || 1)), pags = [];
  const rem = '<b>' + esc(r.razao) + '</b>' + [r.end, r.bairro ? 'Bairro: ' + r.bairro : '', [r.mun, r.uf].filter(Boolean).join(' – ') + (r.cep ? ' - CEP ' + r.cep : '')].filter(x => x.trim()).map(x => '<div>' + esc(x) + '</div>').join('');
  const dest = '<b>' + esc(i.nome || lab) + '</b>' + ktDestLinhas(i).map(x => '<div>' + esc(x) + '</div>').join('');
  for (let k = 1; k <= n; k++) pags.push('<section class="kt-pg"><div class="kt-etq"><div class="kt-b"><i>REMETENTE</i>' + rem + '</div><div class="kt-b kt-dest"><i>DESTINATÁRIO</i>' + dest + '</div>' +
    '<div class="kt-b"><i>CONTEÚDO</i>' + (i.conteudo ? '<div>' + esc(i.conteudo) + '</div>' : '') + '<div>' + (amostras ? esc(amostras) + ' amostra(s) · ' : '') + 'Caixa ' + k + ' de ' + n + '</div></div></div></section>');
  return '<div class="kt">' + pags.join('') + '</div>';
}
function ktImprimeHTML(html, titulo) {
  return new Promise(ok => {
    let el = $('#au-imp'); if (!el) { el = document.createElement('div'); el.id = 'au-imp'; document.body.appendChild(el); }
    el.innerHTML = html; el.setAttribute('data-modo', 'kit');
    let pg = $('#kt-page'); if (!pg) { pg = document.createElement('style'); pg.id = 'kt-page'; document.head.appendChild(pg); }
    pg.textContent = '@media print{@page{size:A4 portrait;margin:12mm}}';
    const t0 = document.title; document.title = titulo; document.body.classList.add('au-imprimindo');
    setTimeout(() => { try { window.print(); } catch {} document.body.classList.remove('au-imprimindo'); document.title = t0; const p2 = $('#kt-page'); if (p2) p2.remove(); ok(); }, 80);
  });
}
async function ktImprimir() {
  const f = S.fm; if (!f || f.k !== 'ktPap') return; const k = f.kRem, lab = k.split('|').slice(1).join('|'), it = ktPapItens(k, { forcar: f.sel }).filter(x => f.sel[x.id]);
  if (!it.length) return lcErro('Marque pelo menos um papel.');
  const caixas = Number(String(f.caixas || '').trim() || 1), amostras = String(f.amostras || '').trim();
  if (!(caixas >= 1 && caixas <= 20 && Number.isInteger(caixas))) return lcErro('Caixas: de 1 a 20.');
  if (amostras && !/^\d{1,4}$/.test(amostras)) return lcErro('Amostras: só números.');
  const rot = it.find(x => x.id === KT_ROTULO);
  if (rot && !ktTemEnd(ktInfo(lab))) return lcErro('Falta o endereço do laboratório para o rótulo. Desmarque o rótulo ou cadastre o endereço (Envio › Laboratórios).');
  if (rot && !ktRemOk(ktRemetente(f.unid))) return lcErro('Falta o endereço da unidade (remetente). Cadastre no EFClaudian: Administração › Empresa.');
  const obs = it.filter(x => x.d && x.d.status === 'obsoleto'); if (obs.length) return lcErro('Obsoleto não imprime: ' + obs[0].nome + '. Desmarque ou anexe a versão vigente ao kit.');
  if (!lcTravar()) return;
  const dados = { amostras: amostras, caixas: String(caixas), analise: String(f.analise || '').trim(), pontos: String(f.pontos || '').trim(), obs: String(f.obs || '').trim(), unid: f.unid };
  const reg = { k: k, envio: k.split('|')[0], lab: lab, itens: it.map(x => ({ id: x.id, docId: x.docId || '', nome: x.nome, rev: x.d ? x.d.rev : null })), dados: dados, porId: S.user.id, porNome: S.user.nome, em: nowISO() };
  try { await Data.col('sv2_envio_imp').set(ktImpId(k), reg); } catch (e) { console.warn(e); }
  Audit.log({ acao: 'imprimir_envio', entidade: 'remessa', entidadeId: k, resumo: 'Papéis do envio ' + ktRemNome(k) + ': ' + it.map(x => x.nome + (x.d ? ' v' + x.d.rev : '')).join(', ') });
  lcFim();
  if (rot) await ktImprimeHTML(ktRotuloHTML(lab, f.unid, caixas, amostras), 'Rótulo ' + lab + ' ' + k.split('|')[0]);
  for (const x of it.filter(y => y.d)) {
    const n = x.copias === 'porCaixa' ? caixas : Number(x.copias) || 1;
    if (!x.d.pub) { await ipNoVertice(x.d.id); continue; }
    for (let c = 0; c < n; c++) { await ipImprimir(x.d.id); await new Promise(r => setTimeout(r, 400)); }
  }
  aviso('Papéis enviados para a impressão.');
}
/* depois de gravar o envio: abre os papéis (como o EFClaudian abre a etiqueta) */
function ktDepoisEnvio(ks) { setTimeout(() => ktPapAbre(ks), 350); }
/* na gaveta da remessa: o que já saiu e o resumo (para preencher a ficha no Excel) */
function ktRemessaHTML(k) {
  const u = ktUltimo(k); if (!u) return '';
  const d = u.dados || {};
  return '<p class="gv-h">Papéis impressos</p>' + gvCampos([['Saíram', (u.itens || []).map(x => x.nome + (x.rev ? ' v' + x.rev : '')).join(', ')], ['Quando', fmtDT(u.em) + ' · ' + (u.porNome || '')], ['Amostras', d.amostras || ''], ['Caixas', d.caixas || ''], ['Análise', d.analise || ''], ['Pontos', d.pontos || ''], ['Observação', d.obs || '']]);
}
const ktPapBt = k => '<button type="button" class="bt ic-so" data-act="kt-pap" data-k="' + esc(k) + '" title="Papéis do envio (rótulo, ficha, custódia)" aria-label="Papéis do envio">' + ic('impressora') + '</button>';
/* sugestão 1: ficha nova de um laboratório → avisa quem cuida das coletas */
function ktAvisaVersao(d, rev) {
  try {
    const usos = S.ktKit.filter(x => x.ativo !== false && x.docId === d.id); if (!usos.length) return;
    const para = S.users.filter(u => !u.bloqueado && u.id !== S.user.id && isSup(u) && temAtrib(u, 'coletas')).map(u => u.id); if (!para.length) return;
    Notif.send({ nivel: 'info', titulo: 'Versão nova: ' + (d.codigo ? d.codigo + ' ' : '') + d.nome, texto: S.user.nome + ' salvou a versão ' + rev + '. Os envios de ' + Array.from(new Set(usos.map(x => x.lab || 'todos os laboratórios'))).join(', ') + ' já usam a nova.', para: para, refTipo: 'impresso', refId: d.id }).catch(() => {});
  } catch (e) { console.warn(e); }
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="kt-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), f = S.fm, vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'kt-end') { if (!ktPodeCad()) return; const i = ktInfo(S._ktLab) || {}; lcAbrir(Object.assign({ k: 'ktEnd', lab: S._ktLab }, { nome: i.nome || '', end: i.end || '', bairro: i.bairro || '', cidade: i.cidade || '', uf: i.uf || '', cep: i.cep || '', contato: i.contato || '', conteudo: i.conteudo || '' }), volta); }
  else if (a === 'kt-end-ok') ktEndOk();
  else if (a === 'kt-anexar') { if (!ktPodeCad()) return; lcAbrir({ k: 'ktAnexar', lab: S._ktLab, docId: '', quando: 'sempre', copias: 'uma', analise: '', todos: '0' }, volta); }
  else if (a === 'kt-anexar-ok') ktAnexarOk();
  else if (a === 'kt-ck' && f) { const id = t.getAttribute('data-id'); f.sel[id] = !f.sel[id]; f.sujo = true; gvDesenha(true); }
  else if (a === 'kt-pedir' && f) { f.sel[t.getAttribute('data-id')] = true; f.sujo = true; gvDesenha(true); }
  else if (a === 'kt-imprimir') ktImprimir();
  else if (a === 'kt-pap') { if (!coPode()) return; ktPapAbre([t.getAttribute('data-k')], volta); }
});
