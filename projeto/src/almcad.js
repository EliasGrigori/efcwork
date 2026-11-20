/* EFCwork · almcad.js — Almoxarifado: cadastro de material, de equipamento e os kits (v0.6.27). Prefixo: mc.
   O que ainda só se fazia no EFClaudian. Mesmos documentos e campos:
   - sv2_alm_itens: nome, codigo, un, local, min, critico, controlaVal, porFrasco, prazoAberto, unCompra, fator, ativo, motivoInativo, criadoEm, criadoPor.
     O saldo não é campo: entra pela Entrada (ou Ajuste), como sempre.
   - sv2_alm_equip: tag, nome, tipo ('qtd' = vidraria contada por quantidade), marca, modelo, serie, local, precisaCal, cal {ultima, freqMeses}, obs, situacao.
   - sv2_cfg/almox.kits: [{ id, nome, motivo, lab, itens: [{ itemId, qtd }] }] (os kits da Saída).
   Quem cadastra: Líder ★ e Administrador (alSup), como no EFClaudian. Nada se apaga: material sai com "desativar" e motivo; equipamento sai pela Baixa que já existe. */
const mcPode = () => typeof alSup === 'function' && alSup() && alVe();
const mcIcBt = (act, icone, tit) => '<button type="button" class="bt ic-so" data-act="' + esc(act) + '" title="' + esc(tit) + '" aria-label="' + esc(tit) + '">' + ic(icone) + '</button>';
const mcIconesMat = () => mcPode() ? mcIcBt('mc-novo', 'mais', 'Novo material') + mcIcBt('mc-kits', 'lista', 'Kits da saída') : '';
const mcIconesEq = () => mcPode() ? mcIcBt('mc-eq-novo', 'mais', 'Novo equipamento') : '';
const mcCabItem = i => mcPode() ? '<button type="button" class="bt ic-so" data-act="mc-editar" data-id="' + esc(i.id) + '" title="Editar o cadastro" aria-label="Editar o cadastro">' + ic('lapis') + '</button>' +
  (i.ativo === false ? '<button type="button" class="bt ic-so" data-act="mc-reativar" data-id="' + esc(i.id) + '" title="Reativar" aria-label="Reativar">' + ic('recontar') + '</button>' : '') : '';
const mcLxItem = i => mcPode() && i.ativo !== false ? { act: 'mc-desat', id: i.id, titulo: 'Desativar o material' } : null;
const mcCabEq = e => mcPode() ? '<button type="button" class="bt ic-so" data-act="mc-eq-editar" data-id="' + esc(e.id) + '" title="Editar o cadastro" aria-label="Editar o cadastro">' + ic('lapis') + '</button>' : '';
const mcNum = v => { const n = Number(String(v == null ? '' : v).replace(',', '.')); return isNaN(n) ? NaN : n; };
const mcLocais = () => Array.from(new Set(S.almItens.map(i => String(i.local || '').trim()).filter(Boolean))).sort(cmpTxt);
const mcUns = () => Array.from(new Set(['Un', 'mL', 'L', 'g', 'kg', 'Cx', 'Pct', 'Rolo', 'Par'].concat(S.almItens.map(i => i.un).filter(Boolean)))).sort(cmpTxt);
const mcSn = (campo, v, txt) => '<label class="fm-ck"><input type="checkbox" data-fm="' + esc(campo) + '"' + (v === '1' ? ' checked' : '') + '> ' + esc(txt) + '</label>';
function mcDl(id, l) { return '<datalist id="' + esc(id) + '">' + l.map(x => '<option value="' + esc(x) + '">').join('') + '</datalist>'; }

/* ---------- material ---------- */
function mcNovo() { if (!mcPode()) return; lcAbrir({ k: 'mcItem', id: '', nome: '', codigo: '', un: 'Un', local: '', min: '', critico: '0', controlaVal: '1', porFrasco: '0', prazoAberto: '', unCompra: '', fator: '' }); }
function mcEditar(id) {
  const i = alItem(id); if (!i || !mcPode()) return; const sn = v => v ? '1' : '0';
  lcAbrir({ k: 'mcItem', id: i.id, nome: i.nome || '', codigo: i.codigo || '', un: i.un || '', local: i.local || '', min: i.min == null ? '' : String(i.min), critico: sn(i.critico), controlaVal: sn(i.controlaVal !== false), porFrasco: sn(i.porFrasco), prazoAberto: i.prazoAberto ? String(i.prazoAberto) : '', unCompra: i.unCompra || '', fator: alFator(i) > 1 ? String(alFator(i)) : '' }, () => alAbreItem(i.id));
}
LC_FORM.mcItem = f => {
  const novo = !f.id;
  const c = lcMsg() + apPasso(1, 'O material') + lcBl('Nome', lcIn('nome', f.nome, ' maxlength="100" placeholder="ex.: Ácido sulfúrico P.A."')) +
    '<div class="fm-g cl-fm2">' + lcBl('Código', lcIn('codigo', f.codigo, ' maxlength="30" placeholder="opcional"')) + lcBl('Local', lcIn('local', f.local, ' list="mc-dl-loc" maxlength="60" placeholder="ex.: ARMÁRIO 03"') + mcDl('mc-dl-loc', mcLocais())) + '</div>' +
    apPasso(2, 'Quantidade') + '<div class="fm-g cl-fm2">' + lcBl('Unidade de uso', lcIn('un', f.un, ' list="mc-dl-un" maxlength="12"') + mcDl('mc-dl-un', mcUns())) + lcBl('Estoque mínimo', lcIn('min', f.min, ' inputmode="decimal" placeholder="0 = sem mínimo"')) + '</div>' +
    '<div class="fm-g cl-fm2">' + lcBl('Compra em', lcIn('unCompra', f.unCompra, ' maxlength="12" placeholder="ex.: Cx (opcional)"')) + lcBl('Quantas unidades vêm em 1', lcIn('fator', f.fator, ' inputmode="decimal" placeholder="ex.: 12"')) + '</div>' +
    apPasso(3, 'Controles') + mcSn('controlaVal', f.controlaVal, 'Controla lote e validade') + mcSn('critico', f.critico, 'Produto crítico (a saída pede conferência)') + mcSn('porFrasco', f.porFrasco, 'Usa por frasco (abre e termina frasco)') +
    (f.porFrasco === '1' ? lcBl('Prazo depois de aberto (dias)', lcIn('prazoAberto', f.prazoAberto, ' inputmode="numeric" placeholder="0 = não cobra"')) : '') +
    (novo ? lcAv('O saldo entra pela <b>Entrada</b> depois de cadastrar, com lote e validade.') : '');
  return { ico: 'caixa', sub: 'Almoxarifado · Materiais', titulo: novo ? 'Novo material' : 'Editar ' + (f.nome || ''), corpo: c, rodape: lcPe('mc-item-ok', novo ? 'Cadastrar' : 'Salvar') };
};
function mcItemOk() {
  const f = S.fm; if (!f || !mcPode()) return lcErro('Só o Líder ★ ou o Administrador cadastra material.');
  const nome = String(f.nome || '').replace(/\s+/g, ' ').trim(), codigo = String(f.codigo || '').trim(), un = String(f.un || '').trim(), min = f.min === '' ? 0 : mcNum(f.min), fator = f.fator === '' ? 1 : mcNum(f.fator), pz = f.prazoAberto === '' ? 0 : mcNum(f.prazoAberto);
  if (nome.length < 2) return lcErro('Escreva o nome do material.');
  if (!un) return lcErro('Diga a unidade de uso (ex.: Un, mL, g).');
  if (isNaN(min) || min < 0) return lcErro('O estoque mínimo é um número, 0 ou mais.');
  if (isNaN(fator) || fator < 1) return lcErro('"Quantas unidades vêm em 1" é um número, 1 ou mais.');
  if (f.unCompra && fator === 1) return lcErro('Diga quantas unidades vêm em 1 ' + f.unCompra + '.');
  if (isNaN(pz) || pz < 0) return lcErro('O prazo depois de aberto é em dias, 0 ou mais.');
  const x = f.id ? alItem(f.id) : null, n = tbNorm(nome);
  if (S.almItens.some(i => i.id !== f.id && i.ativo !== false && tbNorm(i.nome) === n)) return lcErro('Já existe um material ativo com esse nome.');
  if (codigo && S.almItens.some(i => i.id !== f.id && String(i.codigo || '').trim() === codigo)) return lcErro('O código ' + codigo + ' já é de outro material.');
  if (!lcTravar()) return;
  const o = { nome, codigo, un, local: String(f.local || '').trim(), min, critico: f.critico === '1', controlaVal: f.controlaVal === '1', porFrasco: f.porFrasco === '1', prazoAberto: f.porFrasco === '1' ? pz : 0, unCompra: fator > 1 ? String(f.unCompra || '').trim() : '', fator: fator > 1 ? fator : 1, atualizadoEm: nowISO(), atualizadoPor: S.user.nome };
  if (x) {
    Audit.log({ acao: 'editar_item', entidade: 'item', entidadeId: x.id, resumo: 'Alterou o cadastro do material ' + nome });
    f.volta = null; lcGrava([Data.col('sv2_alm_itens').update(x.id, o)], 'Material salvo.', () => alAbreItem(x.id));
  } else {
    const id = Data.novoId('sv2_alm_itens'); Object.assign(o, { ativo: true, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome });
    Audit.log({ acao: 'criar_item', entidade: 'item', entidadeId: id, resumo: 'Cadastrou o material ' + nome + (codigo ? ' (' + codigo + ')' : '') });
    lcGrava([Data.col('sv2_alm_itens').set(id, o)], 'Material cadastrado. Dê a Entrada para pôr o saldo.', () => { if (!S.almItens.some(i => i.id === id)) S.almItens.push(Object.assign({ id }, o)); alAbreItem(id); });
  }
}
function mcDesat(id) { const i = alItem(id); if (!i || !mcPode()) return; lcAbrir({ k: 'mcDesat', id: i.id, motivo: '' }, () => alAbreItem(i.id)); }
LC_FORM.mcDesat = f => { const i = alItem(f.id); if (!i) return null; const d = alSaldo(i.id);
  return { ico: 'caixa', sub: i.nome, titulo: 'Desativar o material', corpo: lcMsg() + (d > 0 ? lcAv('Ainda há ' + alQ(d) + ' ' + esc(i.un || '') + ' em estoque. Dê a saída ou o ajuste antes, ou desative mesmo assim (o saldo fica guardado).', 'wa') : '') +
    lcAv('Sai das listas de entrada e saída. O histórico continua, e dá para reativar depois.') + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: não é mais usado')), rodape: lcPe('mc-desat-ok', 'Desativar') }; };
function mcDesatOk() {
  const f = S.fm, i = f && alItem(f.id); if (!i || !mcPode()) return; const m = String(f.motivo || '').trim();
  if (m.length < 3) return lcErro('Escreva o motivo.'); if (!lcTravar()) return;
  Audit.log({ acao: 'desativar_item', entidade: 'item', entidadeId: i.id, resumo: 'Desativou o material ' + i.nome + ': ' + m });
  f.volta = null; lcGrava([Data.col('sv2_alm_itens').update(i.id, { ativo: false, motivoInativo: m, inativadoEm: nowISO(), inativadoPor: S.user.nome })], 'Material desativado.', () => alAbreItem(i.id));
}
function mcReativar(id) {
  const i = alItem(id); if (!i || !mcPode()) return;
  Data.col('sv2_alm_itens').update(i.id, { ativo: true, motivoInativo: '' }).then(() => { Audit.log({ acao: 'reativar_item', entidade: 'item', entidadeId: i.id, resumo: 'Reativou o material ' + i.nome }); aviso('Material reativado.'); }).catch(() => aviso('Não deu para reativar agora.', 'erro'));
}

/* ---------- equipamento ---------- */
function mcEqNovo() { if (!mcPode()) return; lcAbrir({ k: 'mcEq', id: '', tipo: 'un', tag: '', nome: '', marca: '', modelo: '', serie: '', local: '', precisaCal: '0', freq: '12', ultima: '', obs: '' }); }
function mcEqEditar(id) {
  const e = S.almEq.find(x => x.id === id); if (!e || !mcPode()) return; const c = e.cal || {};
  lcAbrir({ k: 'mcEq', id: e.id, tipo: e.tipo === 'qtd' ? 'qtd' : 'un', tag: e.tag || '', nome: e.nome || '', marca: e.marca || '', modelo: e.modelo || '', serie: e.serie || '', local: e.local || '', precisaCal: e.precisaCal ? '1' : '0', freq: String(c.freqMeses || 12), ultima: c.ultima || '', obs: e.obs || '' }, () => alAbreEq(e.id));
}
LC_FORM.mcEq = f => {
  const novo = !f.id, labs = Array.from(new Set(S.almEq.map(e => e.local).filter(Boolean))).sort(cmpTxt);
  const c = lcMsg() + apPasso(1, 'O equipamento') + (novo ? lcBl('Tipo', ddHTML('mc:tipo', f.tipo, [['un', 'Equipamento (um por cadastro)'], ['qtd', 'Vidraria ou peça contada por quantidade']])) : '') +
    lcBl('Nome', lcIn('nome', f.nome, ' maxlength="100" placeholder="ex.: Balança analítica"')) +
    '<div class="fm-g cl-fm2">' + lcBl('Tag', lcIn('tag', f.tag, ' maxlength="30" placeholder="ex.: BAL-01"')) + lcBl('Laboratório', lcIn('local', f.local, ' list="mc-dl-lab" maxlength="60"') + mcDl('mc-dl-lab', labs)) + '</div>' +
    (f.tipo === 'qtd' ? '' : '<div class="fm-g cl-fm2">' + lcBl('Marca', lcIn('marca', f.marca, ' maxlength="40"')) + lcBl('Modelo', lcIn('modelo', f.modelo, ' maxlength="40"')) + '</div>' + lcBl('Nº de série', lcIn('serie', f.serie, ' maxlength="40"'))) +
    (f.tipo === 'qtd' ? '' : apPasso(2, 'Calibração') + mcSn('precisaCal', f.precisaCal, 'Precisa de calibração') +
      (f.precisaCal === '1' ? '<div class="fm-g cl-fm2">' + lcBl('A cada (meses)', lcIn('freq', f.freq, ' inputmode="numeric"')) + lcBl('Última calibração', lcData('ultima', f.ultima)) + '</div>' : '')) +
    lcBl('Observação', lcTx('obs', f.obs, 'opcional')) + (novo && f.tipo === 'qtd' ? lcAv('As quantidades de cada lugar entram pela contagem (Inventário).') : '');
  return { ico: 'eng', sub: 'Almoxarifado · Equipamentos', titulo: novo ? 'Novo equipamento' : 'Editar ' + (f.nome || ''), corpo: c, rodape: lcPe('mc-eq-ok', novo ? 'Cadastrar' : 'Salvar') };
};
function mcEqOk() {
  const f = S.fm; if (!f || !mcPode()) return lcErro('Só o Líder ★ ou o Administrador cadastra equipamento.');
  const nome = String(f.nome || '').replace(/\s+/g, ' ').trim(), tag = String(f.tag || '').trim().toUpperCase(), cal = f.tipo !== 'qtd' && f.precisaCal === '1', freq = mcNum(f.freq);
  if (nome.length < 2) return lcErro('Escreva o nome do equipamento.');
  if (tag && S.almEq.some(e => e.id !== f.id && String(e.tag || '').toUpperCase() === tag && e.situacao !== 'baixa')) return lcErro('A tag ' + tag + ' já é de outro equipamento.');
  if (cal && (isNaN(freq) || freq < 1 || freq > 120)) return lcErro('A frequência é em meses, de 1 a 120.');
  if (cal && f.ultima && f.ultima > hojeISO()) return lcErro('A última calibração não pode ser no futuro.');
  if (!lcTravar()) return;
  const x = f.id ? S.almEq.find(e => e.id === f.id) : null, ca = (x && x.cal) || {};
  const o = { nome, tag, local: String(f.local || '').trim(), obs: String(f.obs || '').trim(), atualizadoEm: nowISO() };
  if (f.tipo !== 'qtd') Object.assign(o, { marca: String(f.marca || '').trim(), modelo: String(f.modelo || '').trim(), serie: String(f.serie || '').trim(), precisaCal: cal, cal: Object.assign({}, ca, cal ? { freqMeses: freq, ultima: f.ultima || ca.ultima || '' } : {}) });
  if (x) {
    Audit.log({ acao: 'editar_equipamento', entidade: 'equipamento', entidadeId: x.id, resumo: 'Alterou o cadastro de ' + eqNomeC(Object.assign({}, x, o)) });
    f.volta = null; lcGrava([Data.col('sv2_alm_equip').update(x.id, o)], 'Equipamento salvo.', () => alAbreEq(x.id));
  } else {
    const id = Data.novoId('sv2_alm_equip'); Object.assign(o, { tipo: f.tipo === 'qtd' ? 'qtd' : 'un', situacao: 'ativo', hist: [], criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome }); if (f.tipo === 'qtd') o.qtdLocal = {};
    Audit.log({ acao: 'criar_equipamento', entidade: 'equipamento', entidadeId: id, resumo: 'Cadastrou ' + eqNomeC(o) });
    lcGrava([Data.col('sv2_alm_equip').set(id, o)], 'Equipamento cadastrado.', () => { if (!S.almEq.some(e => e.id === id)) S.almEq.push(Object.assign({ id }, o)); alAbreEq(id); });
  }
}

/* ---------- kits da saída (sv2_cfg/almox.kits) ---------- */
const mcKits = () => (S.cfgAlm && Array.isArray(S.cfgAlm.kits) ? S.cfgAlm.kits : []);
function mcKitsAbre() { if (!mcPode()) return; gvAbrir(mcKitsGaveta); }
function mcKitsGaveta() {
  const ks = mcKits();
  const c = (ks.length ? '<ul class="mc-ks">' + ks.map(k => '<li><button type="button" class="mc-k" data-act="mc-kit" data-id="' + esc(k.id) + '"><b>' + esc(k.nome) + '</b><small>' + esc((k.itens || []).map(x => { const i = alItem(x.itemId); return alQ(x.qtd) + ' ' + (i ? i.nome : '(material removido)'); }).join(' · ')) + '</small></button></li>').join('') + '</ul>'
    : '<p class="tb-nada">Nenhum kit ainda. Um kit junta os materiais que sempre saem juntos (ex.: envio de água: frascos, gelo e luvas) para a Saída lançar tudo de uma vez.</p>');
  return { ico: 'lista', sub: 'Almoxarifado · Materiais', titulo: 'Kits da saída', corpo: c, rodape: '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="mc-kit-novo">' + ic('mais') + 'Novo kit</button>' };
}
function mcKitEd(id) {
  const k = id ? mcKits().find(x => x.id === id) : null;
  lcAbrir({ k: 'mcKit', id: k ? k.id : '', nome: k ? k.nome : '', motivo: k ? (k.motivo || '') : '', linhas: k ? (k.itens || []).map(x => ({ itemId: x.itemId, qtd: String(x.qtd) })) : [{ itemId: '', qtd: '1' }] }, () => mcKitsAbre());
}
LC_FORM.mcKit = f => {
  const opc = [['', 'Escolha o material']].concat(alAtivos().map(i => [i.id, i.nome + (i.un ? ' (' + i.un + ')' : '')]));
  const c = lcMsg() + lcBl('Nome do kit', lcIn('nome', f.nome, ' maxlength="60" placeholder="ex.: Envio de água"')) + lcBl('Motivo da saída', lcIn('motivo', f.motivo, ' maxlength="60" placeholder="ex.: Envio de amostras"'), 'vem preenchido na Saída') +
    '<p class="gv-h">Materiais</p>' + f.linhas.map((l, n) => '<div class="mc-kl">' + ddHTML('mc:kit:' + String(n), l.itemId, opc) + lcIn('linhas.' + String(n) + '.qtd', l.qtd, ' inputmode="decimal" class="fm-i mc-kq" aria-label="Quantidade"') +
      '<button type="button" class="bt ic-so" data-act="mc-kl-tira" data-n="' + esc(String(n)) + '" title="Tirar esta linha" aria-label="Tirar esta linha">' + ic('x') + '</button></div>').join('') +
    '<button type="button" class="bt" data-act="mc-kl-mais">' + ic('mais') + 'Mais um material</button>';
  return { ico: 'lista', sub: 'Almoxarifado · Kits', titulo: f.id ? 'Editar o kit' : 'Novo kit', corpo: c, cabAcoes: '', lixeira: f.id ? { act: 'mc-kit-tira', id: f.id, titulo: 'Tirar o kit' } : null, rodape: lcPe('mc-kit-ok', 'Salvar') };
};
function mcKitsGrava(kits, msg) {
  const cfg = Object.assign({}, S.cfgAlm || {}); delete cfg.id; delete cfg.srv; cfg.kits = kits;
  return Data.col('sv2_cfg').set('almox', cfg).then(() => { S.cfgAlm = Object.assign({ id: 'almox' }, cfg); if (msg) aviso(msg); });
}
function mcKitOk() {
  const f = S.fm; if (!f || !mcPode()) return; const nome = String(f.nome || '').trim();
  const itens = f.linhas.filter(l => l.itemId).map(l => ({ itemId: l.itemId, qtd: mcNum(l.qtd) }));
  if (nome.length < 2) return lcErro('Dê um nome ao kit.');
  if (!itens.length) return lcErro('Escolha pelo menos um material.');
  if (itens.some(x => isNaN(x.qtd) || x.qtd <= 0)) return lcErro('Cada quantidade precisa ser maior que zero.');
  if (new Set(itens.map(x => x.itemId)).size !== itens.length) return lcErro('Um material aparece duas vezes. Junte numa linha só.');
  if (mcKits().some(k => k.id !== f.id && tbNorm(k.nome) === tbNorm(nome))) return lcErro('Já existe um kit com esse nome.');
  if (!lcTravar()) return;
  const k = { id: f.id || uid(), nome, motivo: String(f.motivo || '').trim(), lab: '', itens }, l = mcKits().filter(x => x.id !== k.id).concat([k]);
  Audit.log({ acao: f.id ? 'editar_kit' : 'criar_kit', entidade: 'kit', entidadeId: k.id, resumo: (f.id ? 'Alterou' : 'Criou') + ' o kit ' + nome + ' (' + itens.length + ' materiais)' });
  f.volta = null; lcGrava([mcKitsGrava(l)], 'Kit salvo.', () => mcKitsAbre());
}
function mcKitTira(id) {
  const k = mcKits().find(x => x.id === id); if (!k) return;
  csConfirma({ titulo: 'Tirar o kit ' + k.nome + '?', texto: 'As saídas já lançadas com ele continuam iguais.', sim: 'Tirar', nao: 'Voltar' }, () => {
    if (S.fm) { S.fm.volta = null; S.fm.sujo = false; }
    mcKitsGrava(mcKits().filter(x => x.id !== id), 'Kit tirado.').then(() => { Audit.log({ acao: 'remover_kit', entidade: 'kit', entidadeId: id, resumo: 'Tirou o kit ' + k.nome }); mcKitsAbre(); }).catch(() => aviso('Não deu para salvar agora.', 'erro'));
  });
}

/* ---------- eventos ---------- */
DD_AO.mc = (k, v) => {
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'tipo') { f.tipo = v; gvDesenha(true); }
  else if (k.indexOf('kit:') === 0) { const l = f.linhas[Number(k.slice(4))]; if (l) { l.itemId = v; gvDesenha(true); } }
};
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && S.fm && /^(porFrasco|precisaCal)$/.test(t.getAttribute('data-fm') || '') && /^mc/.test(S.fm.k || '')) gvDesenha(true); });
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="mc-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm;
  if (a === 'mc-novo') mcNovo(); else if (a === 'mc-editar') mcEditar(id); else if (a === 'mc-item-ok') mcItemOk();
  else if (a === 'mc-desat') mcDesat(id); else if (a === 'mc-desat-ok') mcDesatOk(); else if (a === 'mc-reativar') mcReativar(id);
  else if (a === 'mc-eq-novo') mcEqNovo(); else if (a === 'mc-eq-editar') mcEqEditar(id); else if (a === 'mc-eq-ok') mcEqOk();
  else if (a === 'mc-kits') mcKitsAbre(); else if (a === 'mc-kit') mcKitEd(id); else if (a === 'mc-kit-novo') mcKitEd(''); else if (a === 'mc-kit-ok') mcKitOk(); else if (a === 'mc-kit-tira') mcKitTira(id);
  else if (a === 'mc-kl-mais' && f) { f.linhas.push({ itemId: '', qtd: '1' }); f.sujo = true; gvDesenha(true); }
  else if (a === 'mc-kl-tira' && f) { f.linhas.splice(Number(t.getAttribute('data-n')), 1); if (!f.linhas.length) f.linhas.push({ itemId: '', qtd: '1' }); f.sujo = true; gvDesenha(true); }
});
