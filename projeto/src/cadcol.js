/* EFCwork · cadcol.js — Coletas › Cadastros (v0.6.40, EM APROVAÇÃO). Prefixo: cc.
   Decisão do Elias (27/11 04:54): o Cwork é o foco. Os cadastros que só se faziam no EFClaudian vêm para cá, nos MESMOS documentos
   (nenhuma coleção nova, nenhuma regra nova do Firestore):
   - sv2_talhoes: codigo (é a chave das amostras e dos planos: não muda depois de criado), pivo, hectares, cultura, variedade,
     ptsSolo, ptsFolha, ptsFruta (pontos por hectare só deste talhão; vazio = o do tipo de coleta), ativo, motivoInativo.
   - sv2_analises: tipo (material), nome, sigla, lab, valor, rev (sobe a cada preço novo; a amostra guarda precoRev), ativo, motivoInativo.
   - sv2_cfg/coletas: labs [nomes], labAtivo, labMotivo, labPrazo {nome: dias}, labModelo {nome: 'completa' | 'simples'};
     labInfo {nome: { nome (razão social), cnpj, end, bairro, cidade, uf, cep, contato, conteudo }} (o mesmo do rótulo do envio, kit.js);
     tipos [{ nome, gera[], pontosPorHa, ativo, motivoInativo }] (profundidades antigas ficam guardadas; a profundidade se decide na coleta);
     fazendas [{ prefixo, nome, unidade, cnpj, end, bairro, cidade, uf, cep, ativo, motivoInativo }] (o prefixo só aparece ao criar).
   - Pontos de água continuam em aguapj.js (sv2_aguaponto); o kit do laboratório continua em Coletas › Envio › Laboratórios, e o lápis de lá abre este cadastro.
   2ª rodada (respostas de 27/11 05:31): sem faixa Ativos/Desativados; rótulos lado a lado sem dica (mesma altura); sem Sigla na tabela;
   sem profundidade no tipo; laboratório e fazenda com cadastro completo; prefixo da fazenda escondido.
   Quem altera: Líder ★ e Administrador (como as regras do Firestore já exigem). Nada se apaga: sai com "desativar" e motivo, e volta com Reativar. */
Object.assign(S, { ccVista: 'talhoes' });
const CC_VISTAS = [['talhoes', 'Talhões'], ['analises', 'Análises'], ['labs', 'Laboratórios'], ['tipos', 'Tipos de coleta'], ['fazendas', 'Fazendas'], ['pontos', 'Pontos de água'], ['etiquetas', 'Modelos de etiqueta']]; /* v0.6.43: modelos de etiqueta do Vértice (etiquetas.js) */
const CC_UM = { talhoes: ['Novo talhão', 'talhão', 'talhões'], analises: ['Nova análise', 'análise', 'análises', 'a'], labs: ['Novo laboratório', 'laboratório', 'laboratórios'], tipos: ['Novo tipo de coleta', 'tipo', 'tipos'], fazendas: ['Nova fazenda', 'fazenda', 'fazendas', 'a'], pontos: ['Novo ponto de água', 'ponto', 'pontos'] };
const CC_MATS = CO_MAT.concat([['AGUA', 'Água']]);
const CC_MAT_TXT = m => (CC_MATS.find(x => x[0] === m) || [m, m || ''])[1];
const ccPode = () => !!S.user && isSup(S.user) && coVe();
const ccCfg = () => S.cfgCol || {};
const ccAtivo = x => !!x && x.ativo !== false;
const ccPill = x => ccAtivo(x) ? '<span class="pill ok">Ativo</span>' : '<span class="pill">Desativado</span>';
const ccNum = v => { const s = String(v == null ? '' : v).trim().replace(',', '.'); return s === '' ? null : (isNaN(Number(s)) ? NaN : Number(s)); };
const ccTxt = v => String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
const ccSit = x => ccAtivo(x) ? 'Ativo' : 'Desativado';
const ccMot = x => !ccAtivo(x) && x.motivoInativo ? ' · ' + x.motivoInativo : '';
const ccIcBt = (act, icone, tit, id) => '<button type="button" class="bt ic-so" data-act="' + esc(act) + '"' + (id != null ? ' data-id="' + esc(id) + '"' : '') + ' title="' + esc(tit) + '" aria-label="' + esc(tit) + '">' + ic(icone) + '</button>';

/* ---------- as listas ---------- */
const ccTalhoes = () => (S.talhoes || []).slice().sort((a, b) => cmpTxt(a.codigo, b.codigo));
const ccAnalises = () => (S.analises || []).slice().sort((a, b) => cmpTxt(CC_MAT_TXT(a.tipo), CC_MAT_TXT(b.tipo)) || cmpTxt(a.nome, b.nome));
function ccLabs() {
  const cf = ccCfg(), at = cf.labAtivo || {}, mt = cf.labMotivo || {}, pz = cf.labPrazo || {}, md = cf.labModelo || {}, inf = cf.labInfo || {};
  const nomes = Array.from(new Set((cf.labs || []).concat((S.analises || []).map(a => a.lab), Object.keys(inf)).filter(Boolean)));
  return nomes.sort(cmpTxt).map(n => ({ id: n, nome: n, ativo: at[n] !== false, motivoInativo: mt[n] || '', prazo: Number(pz[n]) > 0 ? Number(pz[n]) : 0, modelo: md[n] === 'completa' ? 'completa' : 'simples',
    cid: [(inf[n] || {}).cidade, (inf[n] || {}).uf].filter(Boolean).join(' · '), info: inf[n] || {}, nAn: (S.analises || []).filter(a => a.lab === n && a.ativo !== false).length, noCad: (cf.labs || []).indexOf(n) >= 0 }));
}
const ccTipos = () => (ccCfg().tipos || []).map(t => Object.assign({ id: t.nome }, t)).sort((a, b) => cmpTxt(a.nome, b.nome));
const ccFazendas = () => (ccCfg().fazendas || []).map(f => Object.assign({ id: f.prefixo }, f)).sort((a, b) => cmpTxt(a.nome || a.prefixo, b.nome || b.prefixo));
const ccAchar = (v, id) => ({ talhoes: () => (S.talhoes || []).find(x => x.id === id), analises: () => (S.analises || []).find(x => x.id === id), labs: () => ccLabs().find(x => x.id === id), tipos: () => ccTipos().find(x => x.id === id), fazendas: () => ccFazendas().find(x => x.id === id) }[v] || (() => null))();
const ccPts = (t, k) => Number(t[k]) > 0 ? numBR(t[k]) : '';

/* ---------- tela ---------- */
function ccTela(t) {
  const v = CC_VISTAS.some(x => x[0] === S.ccVista) ? S.ccVista : 'talhoes';
  if (v === 'pontos') return ccPontos(t);
  if (v === 'etiquetas') return etCadTela(t, ddHTML('cc:vista', v, CC_VISTAS));
  const um = CC_UM[v], l = { talhoes: ccTalhoes, analises: ccAnalises, labs: ccLabs, tipos: ccTipos, fazendas: ccFazendas }[v](), at = l.filter(ccAtivo).length;
  const acoes = ddHTML('cc:vista', v, CC_VISTAS) + (ccPode() ? '<button type="button" class="bt pr" data-act="cc-novo">' + ic('mais') + esc(um[0]) + '</button>' : '');
  const h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: ['<span>' + at + ' ' + (at === 1 ? um[1] + ' ativ' + (um[3] || 'o') : um[2] + ' ativ' + (um[3] || 'o') + 's') + '</span>'], acoes: acoes });
  const base = { id: 'cc-' + v, titulo: CC_VISTAS.find(x => x[0] === v)[1], unidade: um[2], unidade1: um[1], linhas: l, aoClicar: id => ccAbre(v, id), vazio: 'Nada cadastrado com este filtro.',
    antesIcones: ccPode() && v === 'analises' ? ccIcBt('cc-reaj', 'ajuste', 'Reajustar preços') : '' };
  const cols = {
    talhoes: [{ k: 'cod', rot: 'Código', v: x => x.codigo || '', cls: 'forte', fixa: true }, { k: 'faz', rot: 'Fazenda', v: x => { const f = pgFazenda(x.codigo); return f ? f.nome || f.prefixo : ''; } }, { k: 'piv', rot: 'Pivô', v: x => x.pivo || '' },
      { k: 'cul', rot: 'Cultura', v: x => x.cultura || '' }, { k: 'var', rot: 'Variedade', v: x => x.variedade || '' }, { k: 'ha', rot: 'Hectares', tipo: 'num', dec: 2, v: x => Number(x.hectares) || 0, total: true },
      { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }],
    analises: [{ k: 'mat', rot: 'Material', v: x => CC_MAT_TXT(x.tipo) }, { k: 'nm', rot: 'Análise', v: x => x.nome || '', cls: 'forte' }, { k: 'lab', rot: 'Laboratório', v: x => x.lab || '' }, { k: 'vl', rot: 'Valor', tipo: 'num', v: x => Number(x.valor) || 0, html: x => esc(brl(x.valor)) }, { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }],
    labs: [{ k: 'nm', rot: 'Laboratório', v: x => x.nome, cls: 'forte' }, { k: 'cid', rot: 'Cidade', v: x => x.cid }, { k: 'pz', rot: 'Prazo do laudo', tipo: 'num', v: x => x.prazo || CO_LAUDO_PADRAO, html: x => esc((x.prazo || CO_LAUDO_PADRAO) + ' dias') },
      { k: 'md', rot: 'Etiqueta', v: x => x.modelo === 'completa' ? 'Completa' : 'Simples' }, { k: 'na', rot: 'Análises', tipo: 'num', v: x => x.nAn }, { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }],
    tipos: [{ k: 'nm', rot: 'Tipo de coleta', v: x => x.nome, cls: 'forte' }, { k: 'gr', rot: 'Gera amostras de', v: x => pgGera(x.nome).map(CC_MAT_TXT).join(' + ') }, { k: 'ph', rot: 'Pontos por ha', tipo: 'num', v: x => Number(x.pontosPorHa) || 0 }, { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }],
    fazendas: [{ k: 'nm', rot: 'Fazenda', v: x => x.nome || x.prefixo, cls: 'forte' }, { k: 'un', rot: 'Unidade', v: x => x.unidade === 'filial' ? 'Filial' : 'Matriz' }, { k: 'cid', rot: 'Cidade', v: x => [x.cidade, x.uf].filter(Boolean).join(' · ') },
      { k: 'nt', rot: 'Talhões', tipo: 'num', v: x => (S.talhoes || []).filter(t => t.ativo !== false && (pgPartes(t.codigo) || {}).prefixo === x.prefixo).length }, { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }]
  }[v];
  const busca = { talhoes: x => [x.codigo, x.pivo, x.cultura, x.variedade].join(' '), analises: x => [x.nome, x.sigla, x.lab, CC_MAT_TXT(x.tipo)].join(' '), labs: x => [x.nome, x.cid].join(' '), tipos: x => x.nome, fazendas: x => [x.nome, x.cidade].join(' ') }[v];
  return h + tbHTML(Object.assign(base, { cols: cols, busca: busca }));
}

/* Pontos de água (sv2_aguaponto, aguapj.js) na mesma tabela dos outros cadastros; tocar abre o formulário que já existia (paEd) */
function ccPontos(t) {
  const pode = isSup(S.user), l = (S.aguapontos || []).slice().sort((a, b) => agCmp(a.nome, b.nome)), at = l.filter(ccAtivo).length;
  const nb = (S.bebs || []).filter(b => b.situacao === 'ativo').length, nc = (S.caixas || []).filter(c => !c.desativado).length;
  const h = cabecalho({ titulo: t.nome, abaNome: t.nome, meta: ['<span>' + at + (at === 1 ? ' ponto ativo' : ' pontos ativos') + '</span>', '<span>bebedouros (' + nb + ') vêm do Cloro e caixas d’água (' + nc + ') de Documentos</span>'],
    acoes: ddHTML('cc:vista', 'pontos', CC_VISTAS) + (pode ? '<button type="button" class="bt pr" data-act="pa-ed" data-id="">' + ic('mais') + 'Novo ponto de água</button>' : '') });
  return h + tbHTML({ id: 'cc-pontos', titulo: 'Pontos de água', unidade: 'pontos', unidade1: 'ponto', linhas: l, vazio: 'Nenhum ponto de água com este filtro.', busca: x => [x.nome, x.local, PJ_TIPO1[x.tipo]].join(' '),
    aoClicar: id => { if (!pode) return; const p = l.find(x => x.id === id); if (p) lcAbrir({ k: 'paEd', id: id, tipo: p.tipo || 'outro', nome: p.nome, local: p.local || '' }, null); },
    cols: [{ k: 'nm', rot: 'Ponto', v: x => x.nome || '', cls: 'forte' }, { k: 'tp', rot: 'Tipo', v: x => PJ_TIPO1[x.tipo] || 'Outro' }, { k: 'lc', rot: 'Local', v: x => x.local || '' }, { k: 'st', rot: 'Situação', v: ccSit, html: ccPill }] });
}

/* ---------- detalhe (gaveta) ---------- */
function ccAbre(v, id) { gvAbrir(() => ccGaveta(v, id)); }
function ccGaveta(v, id) {
  const x = ccAchar(v, id); if (!x) return null; let rows = [], tit = '', sub = 'Coletas › Cadastros › ' + CC_VISTAS.find(y => y[0] === v)[1], ico = 'frasco', av = '';
  if (v === 'talhoes') { const f = pgFazenda(x.codigo), tp = ccTipos();
    tit = x.codigo; rows = [['Fazenda', f ? (f.nome || f.prefixo) + (f.unidade === 'filial' ? ' · Filial' : ' · Matriz') : 'sem fazenda para o prefixo ' + ((pgPartes(x.codigo) || {}).prefixo || '')], ['Pivô', x.pivo], ['Cultura', [x.cultura, x.variedade].filter(Boolean).join(' · ')], ['Hectares', x.hectares ? numBR(x.hectares, 2) : ''],
      ['Pontos por ha', [['SOLO', 'ptsSolo', 'Solo'], ['FOLHA', 'ptsFolha', 'Folha'], ['FRUTA VERDE', 'ptsFruta', 'Fruta']].map(p => p[2] + ' ' + (ccPts(x, p[1]) || ((tp.find(y => y.nome === p[0]) || {}).pontosPorHa || '—') + ' (do tipo)')).join(' · ')],
      ['Amostras', String((S.coletas || []).filter(c => c.talhao === x.codigo).length) + ' carregadas'], ['Situação', ccSit(x) + ccMot(x)]]; }
  else if (v === 'analises') { tit = x.nome; rows = [['Material', CC_MAT_TXT(x.tipo)], ['Sigla', x.sigla], ['Laboratório', x.lab], ['Valor', brl(x.valor) + (x.rev ? ' · preço nº ' + (x.rev + 1) : '')], ['Situação', ccSit(x) + ccMot(x)]]; }
  else if (v === 'labs') { ico = 'predio'; tit = x.nome; const i = x.info;
    rows = [['Razão social', i.nome], ['CNPJ', i.cnpj], ['Endereço', i.end], ['Bairro', i.bairro], ['Cidade', x.cid], ['CEP', i.cep], ['Contato', i.contato], ['Prazo do laudo', (x.prazo || CO_LAUDO_PADRAO) + ' dias' + (x.prazo ? '' : ' (padrão)')], ['Etiqueta da fruta', x.modelo === 'completa' ? 'Completa (cultura + talhão + sigla)' : 'Simples (cultura + maturação)'], ['Análises ativas', String(x.nAn)], ['Situação', ccSit(x) + ccMot(x)]];
    av = x.noCad ? '' : lcAv('Este laboratório aparece nas análises mas não está na lista de laboratórios. Salvar o cadastro o põe na lista.', 'wa'); }
  else if (v === 'tipos') { tit = x.nome; rows = [['Gera amostras de', pgGera(x.nome).map(CC_MAT_TXT).join(' + ')], ['Pontos por ha', x.pontosPorHa ? String(x.pontosPorHa) : ''], ['Situação', ccSit(x) + ccMot(x)]]; }
  else if (v === 'fazendas') { tit = x.nome || x.prefixo; rows = [['Unidade', x.unidade === 'filial' ? 'Filial' : 'Matriz'], ['CNPJ', x.cnpj], ['Endereço', x.end], ['Bairro', x.bairro], ['Cidade', [x.cidade, x.uf].filter(Boolean).join(' · ')], ['CEP', x.cep], ['Contato', x.contato], ['Talhões ativos', String((S.talhoes || []).filter(t => t.ativo !== false && (pgPartes(t.codigo) || {}).prefixo === x.prefixo).length)], ['Situação', ccSit(x) + ccMot(x)]]; }
  const cab = ccPode() ? ccIcBt('cc-editar', 'lapis', 'Editar o cadastro', v + '|' + id) + (ccAtivo(x) ? '' : ccIcBt('cc-reativar', 'recontar', 'Reativar', v + '|' + id)) : '';
  return { ico: ico, sub: sub, titulo: tit, pill: ccPill(x), cabAcoes: cab, lixeira: ccPode() && ccAtivo(x) ? { act: 'cc-desat', id: v + '|' + id, titulo: 'Desativar' } : null, corpo: gvCampos(rows.filter(r => r[1])) + av };
}

/* ---------- formulários ---------- */
function ccNovo() { if (!ccPode()) return; const v = S.ccVista;
  const f = { talhoes: { codigo: '', pivo: '', hectares: '', cultura: '', variedade: '', ptsSolo: '', ptsFolha: '', ptsFruta: '' }, analises: { tipo: 'SOLO', nome: '', sigla: '', lab: '', valor: '' },
    labs: Object.assign({ nome: '', prazo: '', modelo: 'simples' }, CC_END0), tipos: { nome: '', gera: { SOLO: '1' }, pontosPorHa: '' }, fazendas: Object.assign({ prefixo: '', nome: '', unidade: 'matriz' }, CC_END0) }[v];
  if (f) lcAbrir(Object.assign({ k: 'ccEd', v: v, id: '' }, f));
}
function ccEditar(ref, doKit) { const [v, id] = ref.split('|'), x = ccAchar(v, id); if (!x || !ccPode()) return; const s = n => n == null || n === '' || Number(n) === 0 ? '' : String(n).replace('.', ',');
  const f = { talhoes: () => ({ codigo: x.codigo, pivo: x.pivo || '', hectares: s(x.hectares), cultura: x.cultura || '', variedade: x.variedade || '', ptsSolo: s(x.ptsSolo), ptsFolha: s(x.ptsFolha), ptsFruta: s(x.ptsFruta) }),
    analises: () => ({ tipo: x.tipo || 'SOLO', nome: x.nome || '', sigla: x.sigla || '', lab: x.lab || '', valor: x.valor === '' || x.valor == null ? '' : Number(x.valor).toFixed(2).replace('.', ',') }),
    labs: () => Object.assign({ nome: x.nome, prazo: x.prazo ? String(x.prazo) : '', modelo: x.modelo }, ccEndDe(x.info)),
    tipos: () => { const g = {}; pgGera(x.nome).forEach(m => { g[m] = '1'; }); return { nome: x.nome, gera: g, pontosPorHa: s(x.pontosPorHa) }; },
    fazendas: () => Object.assign({ prefixo: x.prefixo, nome: x.nome || '', unidade: x.unidade === 'filial' ? 'filial' : 'matriz' }, ccEndDe(x)) }[v]();
  lcAbrir(Object.assign({ k: 'ccEd', v: v, id: id, voltaKit: !!doKit }, f), doKit ? () => ktAbreLab(id) : () => ccAbre(v, id));
}
const ccDl = (id, l) => '<datalist id="' + esc(id) + '">' + Array.from(new Set(l.filter(Boolean))).sort(cmpTxt).map(x => '<option value="' + esc(x) + '">').join('') + '</datalist>';
const ccFixo = (rot, val) => lcBl(rot, '<input class="fm-i" value="' + esc(val) + '" disabled title="Não muda depois de criado">');
/* endereço completo (laboratório e fazenda): os mesmos campos do rótulo do envio (kit.js) */
const CC_END0 = { razao: '', cnpj: '', end: '', bairro: '', cidade: '', uf: '', cep: '', contato: '', conteudo: '' };
const ccEndDe = i => { i = i || {}; return { razao: i.nome || '', cnpj: i.cnpj || '', end: i.end || '', bairro: i.bairro || '', cidade: i.cidade || '', uf: i.uf || '', cep: i.cep || '', contato: i.contato || '', conteudo: i.conteudo || '' }; };
const ccEndHTML = (f, lab) => { const dois = h => '<div class="fm-g cl-fm2">' + h + '</div>';
  return (lab ? lcBl('Razão social', lcIn('razao', f.razao, ' maxlength="120" placeholder="Nome no rótulo da caixa"')) : '') +
    dois(lcBl('CNPJ', lcIn('cnpj', f.cnpj, ' maxlength="18" inputmode="numeric" placeholder="00.000.000/0000-00"')) + lcBl('Contato', lcIn('contato', f.contato, ' maxlength="120" placeholder="Telefone ou e-mail"'))) +
    lcBl('Rua e número', lcIn('end', f.end, ' maxlength="140" placeholder="Ex.: Rodovia CE-123, km 4"')) +
    dois(lcBl('Bairro', lcIn('bairro', f.bairro, ' maxlength="80"')) + lcBl('CEP', lcIn('cep', f.cep, ' maxlength="9" inputmode="numeric" placeholder="00000-000"'))) +
    dois(lcBl('Cidade', lcIn('cidade', f.cidade, ' maxlength="80"')) + lcBl('UF', lcIn('uf', f.uf, ' maxlength="2" style="text-transform:uppercase"'))) +
    (lab ? lcBl('Conteúdo da caixa', lcIn('conteudo', f.conteudo, ' maxlength="140" placeholder="Ex.: amostras de solo para análise (opcional)"')) : ''); };
/* confere e devolve o endereço limpo; texto do erro quando algo não fecha */
function ccEndLe(f) {
  const t = k => ccTxt(f[k]), o = { cnpj: t('cnpj'), end: t('end'), bairro: t('bairro'), cidade: t('cidade'), uf: t('uf').toUpperCase(), cep: t('cep'), contato: t('contato') };
  const dg = o.cnpj.replace(/\D/g, ''); if (o.cnpj && dg.length !== 14) return { erro: 'O CNPJ tem 14 números (00.000.000/0000-00).' };
  if (dg) o.cnpj = dg.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  const cp = o.cep.replace(/\D/g, ''); if (o.cep && cp.length !== 8) return { erro: 'O CEP tem 8 números (00000-000).' }; if (cp) o.cep = cp.slice(0, 5) + '-' + cp.slice(5);
  if (o.uf && !/^[A-Z]{2}$/.test(o.uf)) return { erro: 'A UF tem 2 letras (ex.: CE).' };
  return { o: o };
}
LC_FORM.ccEd = f => {
  const novo = !f.id, v = f.v, dois = h => '<div class="fm-g cl-fm2">' + h + '</div>'; let c = lcMsg(), tit = '';
  if (v === 'talhoes') { tit = novo ? 'Novo talhão' : 'Editar ' + f.codigo; const tl = S.talhoes || [];
    c += apPasso(1, 'O talhão') + dois((novo ? lcBl('Código', lcIn('codigo', f.codigo, ' maxlength="20" placeholder="RU11TAI24" style="text-transform:uppercase"')) : ccFixo('Código', f.codigo)) + lcBl('Pivô', lcIn('pivo', f.pivo, ' maxlength="30" list="cc-dl-piv" placeholder="ex.: Pivô 2"') + ccDl('cc-dl-piv', tl.map(t => t.pivo)))) +
      dois(lcBl('Cultura', lcIn('cultura', f.cultura, ' maxlength="30" list="cc-dl-cul" placeholder="ex.: MAMÃO"') + ccDl('cc-dl-cul', tl.map(t => t.cultura))) + lcBl('Variedade', lcIn('variedade', f.variedade, ' maxlength="30" list="cc-dl-var" placeholder="ex.: TAINUNG"') + ccDl('cc-dl-var', tl.map(t => t.variedade)))) +
      lcBl('Hectares', lcIn('hectares', f.hectares, ' inputmode="decimal" placeholder="ex.: 4,5"')) +
      apPasso(2, 'Pontos por hectare', 'só se este talhão for diferente do tipo de coleta') + '<div class="fm-g cc-fm3">' + lcBl('Solo', lcIn('ptsSolo', f.ptsSolo, ' inputmode="decimal" placeholder="do tipo"')) + lcBl('Folha', lcIn('ptsFolha', f.ptsFolha, ' inputmode="decimal" placeholder="do tipo"')) + lcBl('Fruta', lcIn('ptsFruta', f.ptsFruta, ' inputmode="decimal" placeholder="do tipo"')) + '</div>'; }
  else if (v === 'analises') { tit = novo ? 'Nova análise' : 'Editar ' + f.nome; const labs = ccLabs().filter(l => l.ativo || l.nome === f.lab).map(l => [l.nome, l.nome]);
    c += apPasso(1, 'A análise') + dois(lcBl('Material', ddHTML('cc:tipo', f.tipo, CC_MATS)) + lcBl('Laboratório', labs.length ? ddHTML('cc:lab', f.lab, [['', 'Escolha']].concat(labs)) : '<p class="ag-dc">Cadastre um laboratório antes.</p>')) +
      dois(lcBl('Nome', lcIn('nome', f.nome, ' maxlength="60" placeholder="ex.: COMPLETA + MICRO"')) + lcBl('Sigla', lcIn('sigla', f.sigla, ' maxlength="10" placeholder="ex.: CM (vai na etiqueta)" style="text-transform:uppercase"'))) +
      apPasso(2, 'Preço') + lcBl('Valor (R$)', lcIn('valor', f.valor, ' inputmode="decimal" placeholder="ex.: 85,00"')) + (novo ? '' : lcAv('Mudar o valor vale para as amostras novas. As que já foram lançadas guardam o preço da época.')); }
  else if (v === 'labs') { tit = novo ? 'Novo laboratório' : 'Editar ' + f.nome;
    c += apPasso(1, 'O laboratório') + dois((novo ? lcBl('Nome', lcIn('nome', f.nome, ' maxlength="40" placeholder="ex.: IBRA"')) : ccFixo('Nome', f.nome)) + lcBl('Prazo do laudo (dias)', lcIn('prazo', f.prazo, ' inputmode="numeric" placeholder="' + CO_LAUDO_PADRAO + ' (padrão)"'))) +
      lcBl('Etiqueta da fruta', ddHTML('cc:modelo', f.modelo, [['simples', 'Simples (cultura + maturação)'], ['completa', 'Completa (cultura + talhão + sigla)']])) +
      apPasso(2, 'Dados e endereço', 'vão no rótulo da caixa') + ccEndHTML(f, true); }
  else if (v === 'tipos') { tit = novo ? 'Novo tipo de coleta' : 'Editar ' + f.nome;
    c += apPasso(1, 'O tipo') + dois((novo ? lcBl('Nome', lcIn('nome', f.nome, ' maxlength="30" placeholder="ex.: SOLO+RAIZ" style="text-transform:uppercase"')) : ccFixo('Nome', f.nome)) + lcBl('Pontos por hectare', lcIn('pontosPorHa', f.pontosPorHa, ' inputmode="decimal" placeholder="ex.: 2"'))) +
      apPasso(2, 'Gera amostras de', 'cada coleta vira uma amostra de cada') + '<div class="pes-cks">' + CO_MAT.map(m => '<label class="fm-ck"><input type="checkbox" data-fm="gera.' + esc(m[0]) + '"' + (f.gera[m[0]] === '1' ? ' checked' : '') + '> ' + esc(m[1]) + '</label>').join('') + '</div>'; }
  else if (v === 'fazendas') { tit = novo ? 'Nova fazenda' : 'Editar ' + (f.nome || f.prefixo);
    c += apPasso(1, 'A fazenda') + dois(lcBl('Nome', lcIn('nome', f.nome, ' maxlength="40" placeholder="ex.: Fazenda Boa Vista"')) + lcBl('Unidade', ddHTML('cc:unidade', f.unidade, [['matriz', 'Matriz'], ['filial', 'Filial']]))) +
      (novo ? lcBl('Letras do código dos talhões', lcIn('prefixo', f.prefixo, ' maxlength="4" placeholder="ex.: RU (de RU11TAI24)" style="text-transform:uppercase"')) : '') +
      apPasso(2, 'Dados e endereço') + ccEndHTML(f, false); }
  return { ico: v === 'labs' ? 'predio' : 'frasco', sub: 'Coletas › Cadastros', titulo: tit, corpo: c, rodape: lcPe('cc-ok', novo ? 'Cadastrar' : 'Salvar') };
};

/* ---------- gravar ---------- */
const ccCfgGrava = (o, cf) => { const up = Object.assign({}, o, { atualizadoEm: nowISO(), atualizadoPor: S.user.id }); return cf && cf.id ? Data.col('sv2_cfg').update('coletas', up) : Data.col('sv2_cfg').set('coletas', Object.assign({}, cf || {}, up)); };
function ccOk() {
  const f = S.fm; if (!f || !ccPode()) return lcErro('Só o Líder ★ ou o Administrador altera os cadastros.');
  const v = f.v, novo = !f.id, cf = ccCfg(), volta = id => () => ccAbre(v, id);
  if (v === 'talhoes') {
    const cod = ccTxt(f.codigo).toUpperCase().replace(/\s+/g, ''), ha = ccNum(f.hectares), pts = ['ptsSolo', 'ptsFolha', 'ptsFruta'].map(k => [k, ccNum(f[k])]);
    if (novo && !/^[A-Z]+\d{2}/.test(cod)) return lcErro('O código começa com o prefixo da fazenda e o número do talhão (ex.: RU11TAI24).');
    if (novo && (S.talhoes || []).some(t => String(t.codigo).toUpperCase() === cod)) return lcErro('Já existe o talhão ' + cod + '.');
    if (ha === null || isNaN(ha) || ha <= 0) return lcErro('Os hectares são um número maior que zero (ex.: 4,5).');
    if (pts.some(p => p[1] !== null && (isNaN(p[1]) || p[1] < 0))) return lcErro('Pontos por hectare: um número, ou vazio para usar o do tipo.');
    if (novo && !pgFazenda(cod)) return lcErro('Não há fazenda com o prefixo ' + ((pgPartes(cod) || {}).prefixo || '') + '. Cadastre a fazenda antes.');
    const o = { pivo: ccTxt(f.pivo), hectares: ha, cultura: ccTxt(f.cultura).toUpperCase(), variedade: ccTxt(f.variedade).toUpperCase() }; pts.forEach(p => { o[p[0]] = p[1] || 0; });
    if (!lcTravar()) return;
    if (novo) { const id = Data.novoId('sv2_talhoes'); Object.assign(o, { codigo: cod, ativo: true, criadoEm: nowISO(), criadoPor: S.user.id });
      Audit.log({ acao: 'criar_cadastro', entidade: 'talhao', entidadeId: id, resumo: 'Cadastrou o talhão ' + cod }); lcGrava([Data.col('sv2_talhoes').set(id, o)], 'Talhão cadastrado.', volta(id)); }
    else { Audit.log({ acao: 'editar_cadastro', entidade: 'talhao', entidadeId: f.id, resumo: 'Alterou o talhão ' + f.codigo }); f.volta = null; lcGrava([Data.col('sv2_talhoes').update(f.id, o)], 'Talhão salvo.', volta(f.id)); }
  } else if (v === 'analises') {
    const nome = ccTxt(f.nome).toUpperCase(), vl = ccNum(f.valor), x = novo ? null : ccAchar(v, f.id);
    if (nome.length < 2) return lcErro('Escreva o nome da análise.'); if (!f.lab) return lcErro('Escolha o laboratório.');
    if (vl === null || isNaN(vl) || vl < 0) return lcErro('O valor é um número, 0 ou mais (ex.: 85,00).');
    if ((S.analises || []).some(a => a.id !== f.id && a.ativo !== false && a.tipo === f.tipo && a.lab === f.lab && tbNorm(a.nome) === tbNorm(nome))) return lcErro('Já existe essa análise de ' + CC_MAT_TXT(f.tipo) + ' no ' + f.lab + '.');
    const o = { tipo: f.tipo, nome: nome, sigla: ccTxt(f.sigla).toUpperCase(), lab: f.lab, valor: Math.round(vl * 100) / 100 };
    if (x && Number(x.valor) !== o.valor) o.rev = (Number(x.rev) || 0) + 1;
    if (!lcTravar()) return;
    if (novo) { const id = Data.novoId('sv2_analises'); Object.assign(o, { rev: 0, ativo: true, criadoEm: nowISO(), criadoPor: S.user.id });
      Audit.log({ acao: 'criar_cadastro', entidade: 'analise', entidadeId: id, resumo: 'Cadastrou a análise ' + nome + ' (' + CC_MAT_TXT(f.tipo) + ', ' + f.lab + ', ' + brl(o.valor) + ')' }); lcGrava([Data.col('sv2_analises').set(id, o)], 'Análise cadastrada.', volta(id)); }
    else { Audit.log({ acao: 'editar_cadastro', entidade: 'analise', entidadeId: f.id, resumo: 'Alterou a análise ' + nome + (o.rev ? ' · preço ' + brl(x.valor) + ' → ' + brl(o.valor) : '') }); f.volta = null; lcGrava([Data.col('sv2_analises').update(f.id, o)], 'Análise salva.', volta(f.id)); }
  } else if (v === 'labs') {
    const nome = novo ? ccTxt(f.nome) : f.nome, pz = ccNum(f.prazo);
    if (nome.length < 2) return lcErro('Escreva o nome do laboratório.');
    if (novo && ccLabs().some(l => tbNorm(l.nome) === tbNorm(nome))) return lcErro('Já existe o laboratório ' + nome + '.');
    if (pz !== null && (isNaN(pz) || pz < 1 || pz > 120 || Math.round(pz) !== pz)) return lcErro('O prazo do laudo é em dias, de 1 a 120 (vazio = ' + CO_LAUDO_PADRAO + ').');
    const labs = (cf.labs || []).slice(); if (labs.indexOf(nome) < 0) labs.push(nome);
    const pzs = Object.assign({}, cf.labPrazo || {}), mds = Object.assign({}, cf.labModelo || {}); if (pz) pzs[nome] = pz; else delete pzs[nome]; mds[nome] = f.modelo === 'completa' ? 'completa' : 'simples';
    const en = ccEndLe(f); if (en.erro) return lcErro(en.erro);
    const info = Object.assign({}, cf.labInfo || {}); info[nome] = Object.assign({}, info[nome] || {}, en.o, { nome: ccTxt(f.razao), conteudo: ccTxt(f.conteudo), alteradoEm: nowISO(), alteradoPor: S.user.nome });
    if (!lcTravar()) return;
    Audit.log({ acao: novo ? 'criar_cadastro' : 'editar_cadastro', entidade: 'lab', entidadeId: nome, resumo: (novo ? 'Cadastrou' : 'Alterou') + ' o laboratório ' + nome });
    const volta = f.voltaKit ? () => { if (typeof ktAbreLab === 'function') ktAbreLab(nome); } : () => ccAbre(v, nome);
    f.volta = null; lcGrava([ccCfgGrava({ labs: labs, labPrazo: pzs, labModelo: mds, labInfo: info }, cf)], novo ? 'Laboratório cadastrado.' : 'Laboratório salvo.', () => { S.cfgCol = Object.assign({ id: 'coletas' }, cf, { labs: labs, labPrazo: pzs, labModelo: mds, labInfo: info }); volta(); });
  } else if (v === 'tipos') {
    const nome = novo ? ccTxt(f.nome).toUpperCase() : f.nome, gera = CO_MAT.map(m => m[0]).filter(m => f.gera[m] === '1'), ph = ccNum(f.pontosPorHa);
    if (nome.length < 2) return lcErro('Escreva o nome do tipo de coleta.'); if (novo && ccTipos().some(t => t.nome === nome)) return lcErro('Já existe o tipo ' + nome + '.');
    if (!gera.length) return lcErro('Marque pelo menos um material.'); if (ph !== null && (isNaN(ph) || ph < 0)) return lcErro('Pontos por hectare: um número, 0 ou mais.');
    const l = (cf.tipos || []).map(t => Object.assign({}, t)), i = l.findIndex(t => t.nome === nome), o = Object.assign(i >= 0 ? l[i] : { nome: nome, ativo: true }, { gera: gera, pontosPorHa: ph || 0 }); /* profundidades antigas ficam como estavam: a profundidade se decide na coleta */
    if (i < 0) l.push(o); if (!lcTravar()) return;
    Audit.log({ acao: novo ? 'criar_cadastro' : 'editar_cadastro', entidade: 'tipo_coleta', entidadeId: nome, resumo: (novo ? 'Cadastrou' : 'Alterou') + ' o tipo de coleta ' + nome + ' (' + gera.map(CC_MAT_TXT).join(' + ') + ')' });
    f.volta = null; lcGrava([ccCfgGrava({ tipos: l }, cf)], novo ? 'Tipo cadastrado.' : 'Tipo salvo.', () => { S.cfgCol = Object.assign({ id: 'coletas' }, cf, { tipos: l }); ccAbre(v, nome); });
  } else if (v === 'fazendas') {
    const px = novo ? ccTxt(f.prefixo).toUpperCase() : f.prefixo;
    if (!/^[A-Z]{1,4}$/.test(px)) return lcErro('Diga as letras do começo do código dos talhões desta fazenda (de 1 a 4, ex.: RU).'); if (novo && ccFazendas().some(x => x.prefixo === px)) return lcErro('Essas letras já são da ' + (ccFazendas().find(x => x.prefixo === px).nome || px) + '.');
    if (ccTxt(f.nome).length < 2) return lcErro('Escreva o nome da fazenda.');
    if (ccFazendas().some(x => x.prefixo !== px && tbNorm(x.nome) === tbNorm(ccTxt(f.nome)))) return lcErro('Já existe a ' + ccTxt(f.nome) + '.');
    const en = ccEndLe(f); if (en.erro) return lcErro(en.erro);
    const l = (cf.fazendas || []).map(x => Object.assign({}, x)), i = l.findIndex(x => x.prefixo === px), o = Object.assign(i >= 0 ? l[i] : { prefixo: px, ativo: true }, en.o, { nome: ccTxt(f.nome), unidade: f.unidade === 'filial' ? 'filial' : 'matriz' });
    if (i < 0) l.push(o); if (!lcTravar()) return;
    Audit.log({ acao: novo ? 'criar_cadastro' : 'editar_cadastro', entidade: 'fazenda', entidadeId: px, resumo: (novo ? 'Cadastrou' : 'Alterou') + ' a fazenda ' + o.nome });
    f.volta = null; lcGrava([ccCfgGrava({ fazendas: l }, cf)], novo ? 'Fazenda cadastrada.' : 'Fazenda salva.', () => { S.cfgCol = Object.assign({ id: 'coletas' }, cf, { fazendas: l }); ccAbre(v, px); });
  }
}

/* ---------- desativar e reativar (mesmo formato do pedido desativar_cadastro do aprovar.js) ---------- */
const CC_ENT = { talhoes: 'talhao', analises: 'analise', labs: 'lab', tipos: 'tipo_coleta', fazendas: 'fazenda' };
function ccUso(v, x) {
  if (v === 'talhoes') { const n = (S.rodizios || []).filter(r => r.ativo !== false && (r.areas || []).indexOf(x.codigo) >= 0).length; return n ? 'Está em ' + n + (n === 1 ? ' plano de coleta ativo' : ' planos de coleta ativos') + '. Os planos continuam; ele só some das listas para programar.' : ''; }
  if (v === 'labs') return x.nAn ? 'Tem ' + x.nAn + (x.nAn === 1 ? ' análise ativa' : ' análises ativas') + '. Elas continuam ativas: desative-as também, se for o caso.' : '';
  if (v === 'fazendas') { const n = (S.talhoes || []).filter(t => t.ativo !== false && (pgPartes(t.codigo) || {}).prefixo === x.prefixo).length; return n ? 'Tem ' + n + ' talhões ativos.' : ''; }
  return '';
}
function ccDesat(ref) { const [v, id] = ref.split('|'), x = ccAchar(v, id); if (!x || !ccPode()) return; lcAbrir({ k: 'ccDesat', v: v, id: id, motivo: '' }, () => ccAbre(v, id)); }
LC_FORM.ccDesat = f => { const x = ccAchar(f.v, f.id); if (!x) return null; const u = ccUso(f.v, x);
  return { ico: 'frasco', sub: 'Coletas › Cadastros', titulo: 'Desativar ' + (x.codigo || x.nome || x.prefixo), corpo: lcMsg() + (u ? lcAv(u, 'wa') : '') + lcAv('Sai das listas para lançar e programar. Amostras e histórico continuam, e dá para reativar depois.') + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: talhão erradicado')), rodape: lcPe('cc-desat-ok', 'Desativar') }; };
async function ccAtivar(v, id, at, mot) {
  const ent = CC_ENT[v], x = ccAchar(v, id), cf = ccCfg(), rot = x.codigo || x.nome || x.prefixo;
  if (v === 'talhoes' || v === 'analises') await Data.col(v === 'talhoes' ? 'sv2_talhoes' : 'sv2_analises').update(id, { ativo: at, motivoInativo: at ? '' : mot });
  else if (v === 'labs') { const mapa = Object.assign({}, cf.labAtivo || {}), mt = Object.assign({}, cf.labMotivo || {}), labs = (cf.labs || []).slice(); mapa[id] = at; if (at) delete mt[id]; else mt[id] = mot; if (labs.indexOf(id) < 0) labs.push(id);
    await ccCfgGrava({ labs: labs, labAtivo: mapa, labMotivo: mt }, cf); S.cfgCol = Object.assign({ id: 'coletas' }, cf, { labs: labs, labAtivo: mapa, labMotivo: mt }); }
  else { const campo = v === 'fazendas' ? 'fazendas' : 'tipos', l = (cf[campo] || []).map(y => Object.assign({}, y)), y = l.find(z => (v === 'fazendas' ? z.prefixo : z.nome) === id);
    y.ativo = at; y.motivoInativo = at ? '' : mot; const o = {}; o[campo] = l; await ccCfgGrava(o, cf); S.cfgCol = Object.assign({ id: 'coletas' }, cf, o); }
  Audit.log({ acao: at ? 'ativar_cadastro' : 'desativar_cadastro', entidade: ent, entidadeId: String(id), resumo: (at ? 'Reativou ' : 'Desativou ') + rot + (mot ? ' · motivo: ' + mot : '') });
}
function ccDesatOk() {
  const f = S.fm; if (!f || !ccPode()) return; const m = ccTxt(f.motivo); if (m.length < 3) return lcErro('Escreva o motivo.'); if (!lcTravar()) return;
  const v = f.v, id = f.id; f.volta = null; lcGrava([ccAtivar(v, id, false, m)], 'Desativado.', () => ccAbre(v, id));
}
function ccReativar(ref) { const [v, id] = ref.split('|'); if (!ccPode() || !ccAchar(v, id)) return; ccAtivar(v, id, true, '').then(() => { aviso('Reativado.'); gvDesenha(); render(); }).catch(e => aviso(svErro(e), 'erro')); }

/* ---------- reajustar preços (análises) ---------- */
function ccReaj() { if (!ccPode()) return; lcAbrir({ k: 'ccReaj', lab: '', mat: '', pct: '' }); }
const ccReajLista = f => (S.analises || []).filter(a => a.ativo !== false && (!f.lab || a.lab === f.lab) && (!f.mat || a.tipo === f.mat));
const ccReajNovo = (a, p) => Math.round(Number(a.valor || 0) * (1 + p / 100) * 100) / 100;
LC_FORM.ccReaj = f => { const p = ccNum(f.pct), l = ccReajLista(f), ok = p !== null && !isNaN(p) && p !== 0;
  const labs = [['', 'Todos']].concat(ccLabs().filter(x => x.ativo).map(x => [x.nome, x.nome])), mats = [['', 'Todos']].concat(CC_MATS);
  return { ico: 'ajuste', sub: 'Coletas › Cadastros › Análises', titulo: 'Reajustar preços', corpo: lcMsg() + '<div class="fm-g cl-fm2">' + lcBl('Laboratório', ddHTML('cc:rlab', f.lab, labs)) + lcBl('Material', ddHTML('cc:rmat', f.mat, mats)) + '</div>' +
    lcBl('Reajuste (%)', lcIn('pct', f.pct, ' inputmode="decimal" placeholder="ex.: 8 ou -5"'), 'negativo baixa o preço') +
    (l.length ? '<div class="cc-rj">' + l.slice(0, 40).map(a => '<div><span>' + esc(a.nome) + ' <small>' + esc(CC_MAT_TXT(a.tipo) + ' · ' + a.lab) + '</small></span><b>' + esc(brl(a.valor)) + (ok ? ' → ' + esc(brl(ccReajNovo(a, p))) : '') + '</b></div>').join('') + '</div>' : '<p class="ag-dc">Nenhuma análise ativa com este filtro.</p>') +
    lcAv('Vale para as amostras novas. As que já foram lançadas guardam o preço da época.'), rodape: lcPe('cc-reaj-ok', ok && l.length ? 'Reajustar ' + l.length + (l.length === 1 ? ' análise' : ' análises') : 'Reajustar') }; };
function ccReajOk() {
  const f = S.fm; if (!f || !ccPode()) return; const p = ccNum(f.pct), l = ccReajLista(f);
  if (p === null || isNaN(p) || p === 0 || p < -90 || p > 300) return lcErro('O reajuste é uma porcentagem diferente de zero (ex.: 8 ou -5).'); if (!l.length) return lcErro('Nenhuma análise com este filtro.'); if (!lcTravar()) return;
  Audit.log({ acao: 'reajustar_precos', entidade: 'analise', entidadeId: '', resumo: 'Reajustou ' + numBR(p) + '% em ' + l.length + ' análises' + (f.lab ? ' do ' + f.lab : '') + (f.mat ? ' de ' + CC_MAT_TXT(f.mat) : '') });
  lcGrava([Data.lote(l.map(a => ({ col: 'sv2_analises', id: a.id, tipo: 'update', dados: { valor: ccReajNovo(a, p), rev: (Number(a.rev) || 0) + 1 } })))], l.length + (l.length === 1 ? ' análise reajustada.' : ' análises reajustadas.'));
}

/* ---------- eventos ---------- */
DD_AO.cc = (k, v) => {
  if (k === 'vista') { S.ccVista = v; render(); return; }
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'tipo') f.tipo = v; else if (k === 'lab') f.lab = v; else if (k === 'modelo') f.modelo = v; else if (k === 'unidade') f.unidade = v; else if (k === 'rlab') f.lab = v; else if (k === 'rmat') f.mat = v;
  gvDesenha(true);
};
document.addEventListener('input', e => { const t = e.target; if (t && t.getAttribute && t.getAttribute('data-fm') === 'pct' && S.fm && S.fm.k === 'ccReaj') { S.fm.pct = t.value; clearTimeout(S._ccRj); S._ccRj = setTimeout(() => gvDesenha(true), 350); } });
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="cc-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'cc-novo') { if (S.ccVista === 'pontos') return; ccNovo(); } else if (a === 'cc-editar') ccEditar(id); else if (a === 'cc-ok') ccOk();
  else if (a === 'cc-desat') ccDesat(id); else if (a === 'cc-desat-ok') ccDesatOk(); else if (a === 'cc-reativar') ccReativar(id);
  else if (a === 'cc-reaj') ccReaj(); else if (a === 'cc-reaj-ok') ccReajOk();
});
