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
Object.assign(S, { ktKit: [], ktImp: [], coEnvVista: 'rem', ktVt: null, _ktVtLendo: false });
/* v0.6.44 (etapa 4, decisões do Elias de 27/11 15:24): os papéis do kit vêm direto do Vértice (planilhas das 5 pastas; o Cwork guarda
   só a ligação, com fonte: 'vertice') ou de Documentos › Impressos (PDF de fora, ou o que ele quiser); até 2 papéis de custódia ou
   ficha por laboratório; o que já estava anexado fica como está (ele troca quando quiser). */
const KT_DOCS_MAX = 2;
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
const ktDoc = id => S.ipDocs.find(d => d.id === id) || ktVtDoc(id);
/* o papel do Vértice como o kit enxerga (a lista vem da nuvem do Vértice; sem ela, o nome guardado na ligação) */
function ktVtDoc(id) {
  const v = (S.ktVt || []).find(x => x.id === id), e = S.ktKit.find(x => x.docId === id && x.fonte === 'vertice');
  if (!v && !e) return null;
  return { id: id, nome: (v && v.nome) || e.nome, rev: (v && v.versao) || 1, status: v && v.status === 'lixeira' ? 'lixeira' : 'vigente', tipo: 'planilha', codigo: '', orig: { formato: 'xlsx' }, fonte: 'vertice', pasta: v ? v.pasta : '' };
}
async function ktLerVt() {
  if (S._ktVtLendo || typeof vtUmaVez !== 'function' || !ktPodeCad()) return; S._ktVtLendo = true;
  try { S.ktVt = (await vtUmaVez({ limit: 2000 })).map(vtnResumo).filter(d => d.tipo === 'planilha' && d.status !== 'lixeira' && IP_PASTAS.indexOf(d.pasta) >= 0).sort((a, b) => cmpTxt(a.pasta, b.pasta) || cmpTxt(a.nome, b.nome)); }
  catch (e) { console.warn('kit', e); S.ktVt = S.ktVt || []; }
  finally { S._ktVtLendo = false; if (S.gv) gvDesenha(true); }
}
const ktOndeTxt = d => d.fonte === 'vertice' ? 'Vértice' + (d.pasta ? ' · ' + d.pasta : '') : 'Impressos · ' + ipFmtTxt(d);
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
const ktDestLinhas = i => !i ? [] : [i.end, i.bairro ? 'Bairro: ' + i.bairro : '', [i.cidade, i.uf].filter(Boolean).join('/') + (i.cep ? ' - CEP ' + i.cep : ''), i.contato].filter(x => String(x || '').trim());

/* ---------- Envio › Laboratórios ---------- */
function ktLinhas() {
  const nomes = Array.from(new Set(coLabs().concat(Object.keys((S.cfgCol || {}).labInfo || {})))).filter(Boolean).sort(cmpTxt);
  const ult = {}; coAtivas().forEach(c => { if (c.enviado && c.envio && c.lab && (!ult[c.lab] || c.envio > ult[c.lab])) ult[c.lab] = c.envio; });
  return nomes.map(n => { const i = ktInfo(n), kit = ktKitDe(n).filter(x => ktDoc(x.docId)); return { id: n, nome: n, cid: i ? [i.cidade, i.uf].filter(Boolean).join(' · ') : '', kit: kit.length + (kit.some(x => ktPapel(x) === 'rotulo') ? 0 : 1), ult: ult[n] || '', st: !ktTemEnd(i) && !kit.some(x => ktPapel(x) === 'rotulo') ? 'end' : kit.some(x => ktPapel(x) === 'doc') ? 'ok' : 'rot' }; });
}
const KT_ST = { ok: ['Kit pronto', 'ok'], rot: ['Só o rótulo', ''], end: ['Falta o endereço', 'wa'] };
function ktTabLabs() {
  return tbHTML({ id: 'kt-labs', titulo: 'Laboratórios', unidade: 'laboratórios', linhas: ktLinhas(), aoClicar: n => ktAbreLab(n), busca: r => [r.nome, r.cid].join(' '), vazio: 'Nenhum laboratório cadastrado (cadastre em Coletas › Cadastros › Laboratórios).',
    cols: [{ k: 'nome', rot: 'Laboratório', v: r => r.nome, cls: 'forte' }, { k: 'cid', rot: 'Cidade', v: r => r.cid }, { k: 'kit', rot: 'Papéis do kit', tipo: 'num', v: r => r.kit },
      { k: 'ult', rot: 'Último envio', tipo: 'data', v: r => r.ult }, { k: 'st', rot: 'Situação', v: r => KT_ST[r.st][0], html: r => alPill(KT_ST[r.st][0], KT_ST[r.st][1]) }] });
}
DD_AO.kt = (k, v) => {
  if (k === 'vista') { S.coEnvVista = v; render(); return; }
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'doc') f.docId = v; else if (k === 'papel') f.papel = v; else if (k === 'quando') f.quando = v; else if (k === 'analise') f.analise = v; else if (k === 'copias') f.copias = v; else if (k === 'rem') { ktPapCarrega(f, v); f.sujo = false; } else if (k === 'unid') f.unid = v;
  gvDesenha(true);
};
/* gaveta do laboratório: endereço e kit */
function ktAbreLab(nome) { S._ktLab = nome; if (S.ktVt === null) ktLerVt(); gvAbrir(() => ktGavLab(nome)); }
/* v0.6.33: cada laboratório tem até dois papéis no kit: o rótulo do endereço (modelo do Vértice; sem ele, o rótulo do sistema) e
   a cadeia de custódia OU a ficha. Escolher o papel certo de cada coleta é feito no Vértice (pedido do Elias, 20/11 23:52). */
const ktPapel = x => x.papel === 'rotulo' ? 'rotulo' : 'doc';
const KT_PAPEL = [['doc', 'Cadeia de custódia ou ficha (até 2)'], ['rotulo', 'Rótulo do endereço (modelo)']];
function ktGavLab(nome) {
  const i = ktInfo(nome), sup = ktPodeCad(), kit = ktKitDe(nome).filter(x => ktDoc(x.docId) && ktDoc(x.docId).status !== 'lixeira'), linhas = ktDestLinhas(i), rot = kit.find(x => ktPapel(x) === 'rotulo');
  const tira = id => sup ? '<button type="button" class="bt ic-so" data-act="kt-tira" data-id="' + esc(id) + '" title="Tirar do kit" aria-label="Tirar do kit">' + ic('lixo') + '</button>' : '';
  let c = '<p class="gv-h">Destinatário do rótulo</p>' + (ktTemEnd(i) ? gvCampos([['Nome', i.nome], ['Endereço', linhas[0] || ''], ['Bairro', i.bairro || ''], ['Cidade', [i.cidade, i.uf].filter(Boolean).join(' · ')], ['CEP', i.cep || ''], ['Contato', i.contato || ''], ['Conteúdo', i.conteudo || '']])
    : '<p class="co-nada">' + (rot ? 'O rótulo vem do modelo do Vértice.' : 'Sem endereço: o rótulo do sistema não sai. ' + (sup ? 'Toque no lápis para cadastrar, ou anexe o modelo do rótulo feito no Vértice.' : 'Peça ao Administrador ou ao Líder.')) + '</p>');
  c += '<p class="gv-h">Papéis do envio</p><div class="ag-pn ag-gv kt-kit">' +
    (rot ? '' : '<div class="ag-l"><span class="ag-t"><b>Rótulo destinatário e remetente</b><small>Do sistema · uma folha por caixa · até anexar o modelo do Vértice</small></span></div>') +
    kit.map(x => { const d = ktDoc(x.docId); return '<div class="ag-l"><span class="ag-t"><b>' + esc(d.nome) + '</b><small>' + esc([ktPapel(x) === 'rotulo' ? 'Rótulo do endereço' : 'Custódia ou ficha', ktOndeTxt(d), 'versão ' + d.rev, !x.lab ? 'todos os laboratórios' : '', d.status === 'obsoleto' ? 'OBSOLETO' : ''].filter(Boolean).join(' · ')) + '</small></span>' + tira(x.id) + '</div>'; }).join('') + '</div>';
  const st = !ktTemEnd(i) && !rot ? 'end' : kit.some(x => ktPapel(x) === 'doc') ? 'ok' : 'rot';
  return { ico: 'predio', sub: 'Coletas › Envio › Laboratórios', titulo: nome, pill: alPill(KT_ST[st][0], KT_ST[st][1]),
    cabAcoes: sup ? '<button type="button" class="bt ic-so" data-act="kt-end" title="Endereço do laboratório" aria-label="Editar o endereço">' + ic('lapis') + '</button>' : '', corpo: c,
    rodape: '<button type="button" class="bt" data-act="gv-fecha">Fechar</button><span class="au-pesp"></span>' + (sup && (!rot || ktDocsDoLab(nome).length < KT_DOCS_MAX) ? '<button type="button" class="bt pr" data-act="kt-anexar">' + ic('mais') + 'Anexar papel</button>' : '') };
}
async function ktTira(id) {
  if (!ktPodeCad()) return; const x = S.ktKit.find(y => y.id === id); if (!x) return;
  try { await Data.col('sv2_impressos').update(id, { ativo: false, alteradoEm: nowISO(), alteradoPor: S.user.nome }); Audit.log({ acao: 'kit_tirar', entidade: 'impresso', entidadeId: id, resumo: 'Tirou do kit de ' + (x.lab || 'todos') + ': ' + x.nome }); aviso('Tirado do kit.'); }
  catch (e) { aviso(svErro(e), 'erro'); }
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
/* anexar um papel ao kit (v0.6.44): planilhas do Vértice (as 5 pastas) ou Documentos › Impressos (PDF de fora e o resto).
   O rótulo novo substitui o rótulo do laboratório; custódia ou ficha: até 2 por laboratório. */
const ktDocsDoLab = lab => ktKitDe(lab).filter(x => x.lab === lab && ktPapel(x) === 'doc' && ktDoc(x.docId));
LC_FORM.ktAnexar = f => {
  if (S.ktVt === null) ktLerVt();
  const ja = ktKitDe(f.lab).map(x => x.docId);
  const vt = (S.ktVt || []).filter(d => ja.indexOf(d.id) < 0).map(d => [d.id, 'Vértice · ' + d.pasta + ' · ' + d.nome]);
  const ip = ipVivos().filter(d => d.tipo !== 'link' && d.status !== 'obsoleto' && ja.indexOf(d.id) < 0 && !(S.ktVt || []).some(v => v.id === d.id)).sort((a, b) => cmpTxt(a.nome, b.nome))
    .map(d => [d.id, 'Impressos · ' + (d.codigo ? d.codigo + ' · ' : '') + d.nome + ' (' + ipFmtTxt(d) + ')']);
  const ops = vt.concat(ip), velho = f.papel === 'rotulo' ? ktKitDe(f.lab).find(x => x.lab && ktPapel(x) === 'rotulo') : null, docs = ktDocsDoLab(f.lab);
  let c = lcMsg();
  if (f.papel === 'doc' && docs.length >= KT_DOCS_MAX) c += lcAv('Este laboratório já tem ' + KT_DOCS_MAX + ' papéis de custódia ou ficha. Tire um (lixeira) antes de anexar outro.', 'wa') + lcBl('Tipo', ddHTML('kt:papel', f.papel, KT_PAPEL));
  else if (!ops.length) c += lcAv(S.ktVt === null ? 'Lendo os documentos do Vértice…' : 'Não há papel para anexar. Ponha a planilha numa das 5 pastas do Vértice (ou o PDF em Documentos › Impressos).', 'wa');
  else c += lcBl('Tipo', ddHTML('kt:papel', f.papel, KT_PAPEL)) + lcBl('Papel', ddHTML('kt:doc', f.docId || '', [['', 'Escolha o papel']].concat(ops))) +
    (velho ? lcAv('Substitui "' + esc(velho.nome) + '" neste laboratório.') : f.papel === 'doc' && docs.length >= KT_DOCS_MAX ? lcAv('Este laboratório já tem ' + KT_DOCS_MAX + ' papéis de custódia ou ficha. Tire um (lixeira) antes de anexar outro.', 'wa') : f.papel === 'doc' && docs.length ? lcAv('Fica junto de "' + esc(ktDoc(docs[0].docId).nome) + '" (até ' + KT_DOCS_MAX + ').') : '');
  return { ico: 'mais', sub: 'Kit · ' + f.lab, titulo: 'Anexar papel', corpo: c, rodape: lcPe('kt-anexar-ok', 'Anexar') };
};
async function ktAnexarOk() {
  const f = S.fm; if (!f || !ktPodeCad()) return; const d = ktDoc(f.docId) || ((S.ktVt || []).find(v => v.id === f.docId) ? { id: f.docId, nome: S.ktVt.find(v => v.id === f.docId).nome, fonte: 'vertice' } : null);
  if (!d) return lcErro('Escolha o papel.');
  const vtEste = (S.ktVt || []).some(v => v.id === d.id);
  if (f.papel !== 'rotulo' && ktDocsDoLab(f.lab).length >= KT_DOCS_MAX) return lcErro('Este laboratório já tem ' + KT_DOCS_MAX + ' papéis de custódia ou ficha. Tire um (lixeira) antes de anexar outro.');
  if (!lcTravar()) return;
  const o = { v: 1, ponto: 'coletas.envio', nome: String(d.nome).slice(0, 80), docId: d.id, lab: f.lab, papel: f.papel === 'rotulo' ? 'rotulo' : 'doc', copias: f.papel === 'rotulo' ? 'porCaixa' : 'uma', ordem: f.papel === 'rotulo' ? 1 : 2, ativo: true, quando: 'sempre', analise: '', criadoEm: nowISO(), criadoPorId: S.user.id, criadoPor: S.user.nome };
  if (vtEste) o.fonte = 'vertice';
  const e = EFD.impresso(o); if (e.length) { console.error('Contrato EFD', e); S.fm._trava = 0; return lcErro('Não deu para anexar: ' + e[0] + '.'); }
  try {
    if (o.papel === 'rotulo') for (const v of ktKitDe(f.lab).filter(x => x.lab === f.lab && ktPapel(x) === 'rotulo')) await Data.col('sv2_impressos').update(v.id, { ativo: false, alteradoEm: nowISO(), alteradoPor: S.user.nome });
    await Data.col('sv2_impressos').add(o); Audit.log({ acao: 'kit_anexar', entidade: 'impresso', entidadeId: d.id, resumo: 'Anexou ' + o.nome + (vtEste ? ' (Vértice)' : '') + ' ao kit de ' + f.lab + ' (' + (o.papel === 'rotulo' ? 'rótulo' : 'custódia ou ficha') + ')' }); lcFim(); aviso('Papel anexado ao kit.');
  } catch (er) { if (S.fm) S.fm._trava = 0; lcErro(svErro(er)); }
}

/* ---------- Papéis deste envio ---------- */
function ktRemNome(k) { const p = k.split('|'); return fmtD(p[0]) + ' · ' + (p.slice(1).join('|') || 'sem laboratório'); }
/* os papéis da remessa: o rótulo (modelo do Vértice ou o do sistema) e a custódia ou ficha */
function ktPapItens(k) {
  const lab = k.split('|').slice(1).join('|'), it = [], kit = ktKitDe(lab).filter(x => { const d = ktDoc(x.docId); return d && d.status !== 'lixeira'; });
  const rot = kit.find(x => ktPapel(x) === 'rotulo');
  if (rot) it.push({ id: rot.id, docId: rot.docId, nome: ktDoc(rot.docId).nome, papel: 'rotulo', copias: rot.copias, d: ktDoc(rot.docId) });
  else it.push({ id: KT_ROTULO, nome: 'Rótulo destinatário e remetente', papel: 'rotulo' });
  kit.filter(x => ktPapel(x) === 'doc').forEach(x => it.push({ id: x.id, docId: x.docId, nome: ktDoc(x.docId).nome, papel: 'doc', copias: x.copias, d: ktDoc(x.docId) }));
  return it;
}
function ktPapCarrega(f, k) {
  const l = coLote(k), u = ktUltimo(k), ans = Array.from(new Set(l.map(c => c.analiseNome || c.sigla).filter(Boolean)));
  const pts = Array.from(new Set(l.map(c => coNome(c)).filter(x => x && x !== '—')));
  const d = u && u.dados ? u.dados : { amostras: String(l.length), caixas: '1', analise: ans.join(', '), pontos: pts.join(', '), obs: '', unid: ktUnidade(l) };
  Object.assign(f, { kRem: k, amostras: d.amostras, caixas: d.caixas, analise: d.analise, pontos: d.pontos, obs: d.obs || '', unid: d.unid || ktUnidade(l), sel: {}, fila: [], msg: '' });
  ktPapItens(k).forEach(x => { f.sel[x.id] = !(x.id === KT_ROTULO && !ktTemEnd(ktInfo(k.split('|').slice(1).join('|')))); });
}
function ktPapAbre(ks, volta) {
  ks = (ks || []).filter(k => coLote(k).length); if (!ks.length) return;
  lcAbrir({ k: 'ktPap', ks: ks, kRem: ks[0], sel: {}, fila: [], unid: 'matriz' }, volta || null);
  ktPapCarrega(S.fm, ks[0]); S.fm.sujo = false; gvDesenha(true);
}
/* como cada papel sai: rótulo do sistema e PDF fixo imprimem aqui; planilha e Word abrem no Vértice com os dados da remessa */
const ktComo = x => !x.d ? 'imprime aqui · uma folha por caixa' : x.d.fonte === 'vertice' ? 'abre no Vértice já preenchido' : x.d.status === 'obsoleto' ? 'obsoleto: não sai' : x.d.orig && x.d.orig.formato === 'xlsx' ? (typeof drPreenche === 'function' && drPreenche(x.d) ? 'abre no Vértice já preenchido' : 'abre no Vértice com os dados ao lado') : x.d.orig && x.d.orig.formato === 'docx' ? 'Word: baixa com os dados para copiar' : 'PDF: imprime aqui';
const ktNoVertice = x => !!(x.d && x.d.orig && x.d.orig.formato === 'xlsx' && x.d.status !== 'obsoleto');
LC_FORM.ktPap = f => {
  const k = f.kRem, lab = k.split('|').slice(1).join('|'), it = ktPapItens(k), i = ktInfo(lab), sup = ktPodeCad();
  it.forEach(x => { if (!(x.id in f.sel)) f.sel[x.id] = !(x.id === KT_ROTULO && !ktTemEnd(i)); }); /* papel anexado agora (ou que trocou o rótulo do sistema) já vem marcado */
  const box = x => { const on = !!f.sel[x.id], semEnd = x.id === KT_ROTULO && !ktTemEnd(i), feito = f.fila && f.feitos && f.feitos[x.id];
    return '<div class="kt-pr"><button type="button" class="fm-pki cb-ck' + (on ? ' on' : '') + '" data-act="kt-ck" data-id="' + esc(x.id) + '" aria-pressed="' + on + '"><span class="cb-box">' + (on ? ic('ok') : '') + '</span><span><b>' + esc(x.nome) + '</b><small>' + esc((feito ? 'aberto no Vértice · ' : '') + (semEnd ? 'falta o endereço do laboratório' : ktComo(x))) + '</small></span></button>' +
      (semEnd && sup ? '<button type="button" class="bt lk" data-act="kt-end-aqui">' + ic('lapis') + 'Cadastrar endereço</button>' : '') + '</div>'; };
  let c = lcMsg();
  if (f.ks.length > 1) c += lcBl('Remessa', ddHTML('kt:rem', k, f.ks.map(x => [x, ktRemNome(x)])), f.ks.length + ' laboratórios neste envio');
  c += '<div class="fm-pk"><div class="fm-pkl co-pkl">' + it.map(box).join('') + '</div></div>';
  if (!it.some(x => x.papel === 'doc')) c += '<p class="ag-dc">Este laboratório não tem custódia nem ficha no kit.</p>';
  if (sup && ktDocsDoLab(lab).length < KT_DOCS_MAX) c += '<button type="button" class="bt lk kt-anx" data-act="kt-anexar-aqui">' + ic('mais') + 'Anexar papel deste laboratório</button>';
  c += '<p class="gv-h">Dados que vão para o papel <small>opcional</small></p>' +
    '<div class="fm-g">' + lcBl('Amostras', lcIn('amostras', f.amostras, ' inputmode="numeric" maxlength="4"')) + lcBl('Caixas', lcIn('caixas', f.caixas, ' inputmode="numeric" maxlength="2"')) + '</div>' +
    '<div class="fm-g">' + lcBl('Análise', lcIn('analise', f.analise, ' maxlength="140"')) + lcBl('Pontos', lcIn('pontos', f.pontos, ' maxlength="300"')) + '</div>' +
    lcBl('Observação', lcTx('obs', f.obs, 'Ex.: urgência, pedido de cotação, contato')) +
    (((S.empresa || {}).unid || {}).filial ? lcBl('Remetente', ddHTML('kt:unid', f.unid, [['matriz', ktRemetente('matriz').nome], ['filial', ktRemetente('filial').nome]])) : '');
  const prox = (f.fila || []).length ? it.find(x => x.id === f.fila[0]) : null;
  return { ico: 'impressora', sub: 'Remessa · ' + ktRemNome(k), titulo: 'Papéis deste envio', corpo: c, rodape: '<button type="button" class="bt" data-act="gv-fecha">Depois</button><span class="au-pesp"></span><button type="button" class="bt pr" data-act="kt-imprimir">' + ic(prox ? 'abre' : 'impressora') + (prox ? 'Abrir o próximo no Vértice' : 'Imprimir') + '</button>' };
};

/* rótulo: A4 em pé, uma folha por caixa (port do fxEtiqueta do EFClaudian, com os endereços vindos do cadastro) */
function ktRotuloHTML(lab, unid, caixas, amostras) {
  const i = ktInfo(lab) || {}, r = ktRemetente(unid), n = Math.max(1, Math.min(20, Number(caixas) || 1)), pags = [];
  const rem = '<b>' + esc(r.razao) + '</b>' + [r.end, r.bairro ? 'Bairro: ' + r.bairro : '', [r.mun, r.uf].filter(Boolean).join('/') + (r.cep ? ' - CEP ' + r.cep : '')].filter(x => x.trim()).map(x => '<div>' + esc(x) + '</div>').join('');
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
/* volta à janela dos papéis depois de anexar ou cadastrar o endereço (sem abrir camada nova) */
function ktVoltaPap(fp) { S.fm = fp; fp._trava = 0; S.gvForm = true; gvAbrir(lcGaveta, true); }
function ktDadosForm(f) { return { amostras: String(f.amostras || '').trim(), caixas: String(Number(String(f.caixas || '').trim() || 1)), analise: String(f.analise || '').trim(), pontos: String(f.pontos || '').trim(), obs: String(f.obs || '').trim(), unid: f.unid }; }
async function ktImprimir() {
  const f = S.fm; if (!f || f.k !== 'ktPap') return; const k = f.kRem, lab = k.split('|').slice(1).join('|'), todos = ktPapItens(k);
  /* "Abrir o próximo no Vértice": um papel do Vértice por vez (a janela de dentro mostra um só) */
  if ((f.fila || []).length) { const idProx = f.fila.shift(), x = todos.find(y => y.id === idProx); f.feitos = Object.assign(f.feitos || {}, x ? { [x.id]: 1 } : {}); gvDesenha(true); if (x) await ktSaiUm(k, x, ktDadosForm(f)); if (!f.fila.length) lcFim(); return; }
  const it = todos.filter(x => f.sel[x.id]);
  if (!it.length) return lcErro('Marque pelo menos um papel.');
  const caixas = Number(String(f.caixas || '').trim() || 1), amostras = String(f.amostras || '').trim();
  if (!(caixas >= 1 && caixas <= 20 && Number.isInteger(caixas))) return lcErro('Caixas: de 1 a 20.');
  if (amostras && !/^\d{1,4}$/.test(amostras)) return lcErro('Amostras: só números.');
  if (it.some(x => x.id === KT_ROTULO) && !ktTemEnd(ktInfo(lab))) return lcErro('Falta o endereço do laboratório para o rótulo do sistema. Desmarque o rótulo, cadastre o endereço ou anexe o modelo do rótulo feito no Vértice.');
  if (it.some(x => x.id === KT_ROTULO) && !ktRemOk(ktRemetente(f.unid))) return lcErro('Falta o endereço da unidade (remetente). Cadastre em Administração › Empresa.');
  const obs = it.filter(x => x.d && x.d.status === 'obsoleto'); if (obs.length) return lcErro('Obsoleto não sai: ' + obs[0].nome + '. Anexe a versão vigente ao kit.');
  if (!lcTravar()) return;
  const dados = ktDadosForm(f);
  const reg = { k: k, envio: k.split('|')[0], lab: lab, itens: it.map(x => ({ id: x.id, docId: x.docId || '', nome: x.nome, rev: x.d ? x.d.rev : null })), dados: dados, porId: S.user.id, porNome: S.user.nome, em: nowISO() };
  try { await Promise.race([Data.col('sv2_envio_imp').set(ktImpId(k), reg), new Promise(r => setTimeout(r, 4000))]); } catch (e) { console.warn(e); }
  Audit.log({ acao: 'imprimir_envio', entidade: 'remessa', entidadeId: k, resumo: 'Papéis do envio ' + ktRemNome(k) + ': ' + it.map(x => x.nome + (x.d ? ' v' + x.d.rev : '')).join(', ') });
  const aqui = it.filter(x => !ktNoVertice(x)), vert = it.filter(ktNoVertice);
  for (const x of aqui) await ktSaiUm(k, x, dados);
  if (!vert.length) { lcFim(); aviso('Papéis enviados para a impressão.'); return; }
  f._trava = 0; f.fila = vert.slice(1).map(x => x.id); f.feitos = { [vert[0].id]: 1 }; f.sujo = false; gvDesenha(true);
  await ktSaiUm(k, vert[0], dados);
  if (!f.fila.length) lcFim(); else aviso('Imprima no Vértice e volte aqui: o próximo papel abre no botão "Abrir o próximo no Vértice".');
}
/* um papel: rótulo do sistema, PDF, Word ou planilha no Vértice (preenchida, ou com os dados ao lado) */
async function ktSaiUm(k, x, dados) {
  const lab = k.split('|').slice(1).join('|'), caixas = Math.max(1, Number(dados.caixas) || 1);
  if (x.id === KT_ROTULO) { await ktImprimeHTML(ktRotuloHTML(lab, dados.unid, caixas, dados.amostras), 'Rótulo ' + lab + ' ' + k.split('|')[0]); if (typeof drGrava === 'function') drGrava({ k: k, item: x.id, nome: x.nome, tipo: 'impresso' }); return; }
  const d = x.d; if (!d) return;
  if (ktNoVertice(x)) { if (typeof drPreenche === 'function' && drPreenche(d)) await drPedido(k, x, dados); else await ipNoVertice(d.id, typeof ptResumoEnvio === 'function' ? ptResumoEnvio(k, dados, d) : null); return; }
  if (d.orig && d.orig.formato === 'docx') { await ipNoVertice(d.id, null); return; }
  if (!d.pub) return aviso('Sem cópia em PDF: ' + d.nome + '.', 'erro');
  const n = x.copias === 'porCaixa' ? caixas : Number(x.copias) || 1;
  for (let c = 0; c < n; c++) { await ipImprimir(d.id); await new Promise(r => setTimeout(r, 400)); }
  if (typeof drGrava === 'function') drGrava({ k: k, item: x.id, nome: x.nome, tipo: 'impresso', docId: d.id, rev: d.rev });
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
  if (a === 'kt-end' && typeof ccEditar === 'function') { ccEditar('labs|' + S._ktLab, true); return; } /* v0.6.40: o endereço é editado num lugar só, o cadastro do laboratório (cadcol.js) */
  if (a === 'kt-end') { if (!ktPodeCad()) return; const i = ktInfo(S._ktLab) || {}; lcAbrir(Object.assign({ k: 'ktEnd', lab: S._ktLab }, { nome: i.nome || '', end: i.end || '', bairro: i.bairro || '', cidade: i.cidade || '', uf: i.uf || '', cep: i.cep || '', contato: i.contato || '', conteudo: i.conteudo || '' }), volta); }
  else if (a === 'kt-end-ok') ktEndOk();
  else if (a === 'kt-anexar') { if (!ktPodeCad()) return; lcAbrir({ k: 'ktAnexar', lab: S._ktLab, docId: '', papel: 'doc' }, volta); }
  else if (a === 'kt-anexar-aqui' && f) { if (!ktPodeCad()) return; const fp = f, lab = fp.kRem.split('|').slice(1).join('|'); lcAbrir({ k: 'ktAnexar', lab: lab, docId: '', papel: 'doc', paiSujo: !!fp.sujo }, () => ktVoltaPap(fp)); }
  else if (a === 'kt-end-aqui' && f) { if (!ktPodeCad()) return; const fp = f, lab = fp.kRem.split('|').slice(1).join('|'), i = ktInfo(lab) || {}; lcAbrir({ k: 'ktEnd', lab: lab, nome: i.nome || '', end: i.end || '', bairro: i.bairro || '', cidade: i.cidade || '', uf: i.uf || '', cep: i.cep || '', contato: i.contato || '', conteudo: i.conteudo || '', paiSujo: !!fp.sujo }, () => { fp.sel[KT_ROTULO] = ktTemEnd(ktInfo(lab)); ktVoltaPap(fp); }); }
  else if (a === 'kt-tira') ktTira(t.getAttribute('data-id'));
  else if (a === 'kt-anexar-ok') ktAnexarOk();
  else if (a === 'kt-ck' && f) { const id = t.getAttribute('data-id'); f.sel[id] = !f.sel[id]; f.sujo = true; gvDesenha(true); }
  else if (a === 'kt-imprimir') ktImprimir();
  else if (a === 'kt-pap') { if (!coPode()) return; ktPapAbre([t.getAttribute('data-k')], volta); }
});
