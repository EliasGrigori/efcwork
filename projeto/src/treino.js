/* EFCwork · treino.js — Qualidade › Treinamentos (v0.6.12). Prefixo: tr.
   Um documento por treinamento em sv2_treinos, no formato do Contrato EFD v1 (EFD.treino): título, data, instrutor, horas,
   participantes (presença, eficácia, % do quiz), situação (programado, realizado, cancelado), origem (efcwork ou sabia),
   documentos ligados (POP e material, vindos de Documentos › Impressos). Treinamento de TESTE ou ensaio não entra.
   Líder ★ e Administrador programam, registram, editam e cancelam; todos veem e imprimem a lista de presença.
   O resumo que o Sabiá exporta (.json do Contrato) entra por "Importar do Sabiá"; a ponte automática vem na v0.6.11.
   Nada se apaga: o treinamento só é cancelado, com motivo. */
const TR_SIT = { programado: ['Programado', ''], realizado: ['Realizado', 'ok'], cancelado: ['Cancelado', ''] };
const TR_GRUPOS = [['programado', 'Programados'], ['realizado', 'Realizados'], ['cancelado', 'Cancelados']];
const TR_PAPEL = { pop: 'Procedimento (POP)', material: 'Material de apoio' };
const trPode = () => isSup(S.user);
const trFalta = x => x.situacao === 'programado' && x.data < hojeISO();
const trPart = x => Array.isArray(x.participantes) ? x.participantes : [];
const trPresentes = x => trPart(x).filter(p => p.presente);
/* eficácia: dos presentes que já foram avaliados, quantos foram eficazes */
function trEfic(x) { const b = trPresentes(x).filter(p => p.eficaz === true || p.eficaz === false); return { base: b.length, sim: b.filter(p => p.eficaz).length, pct: b.length ? Math.round(100 * b.filter(p => p.eficaz).length / b.length) : null }; }
const trHoras = h => h == null || h === '' ? '' : String(h).replace('.', ',') + ' h';
const trDe = id => S.trn.find(x => x.id === id) || null;
function trSitPill(x) { const s = TR_SIT[x.situacao] || TR_SIT.programado; return trFalta(x) ? '<span class="pill wa">Falta registrar</span>' : '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>'; }
const trOrigTxt = x => x.origem === 'sabia' ? 'Sabiá' : 'Aqui';

CS_CARGAS.push(() => {
  csOuve('sv2_treinos', l => { S.trn = (l || []).filter(x => !x.teste); if (S.rota.area === 'qualidade') render(); else if (S.gv) gvDesenha(); }, { order: 'criadoEm', limit: 500 });
});
S.trn = [];

/* ---------- tela ---------- */
function trTela() {
  const u = S.user, l = S.trn.slice().sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.criadoEm).localeCompare(String(a.criadoEm))), ano = hojeISO().slice(0, 4);
  const prog = l.filter(x => x.situacao === 'programado'), falta = prog.filter(trFalta).length, fei = l.filter(x => x.situacao === 'realizado' && String(x.data).slice(0, 4) === ano);
  const h = fei.reduce((s, x) => s + (Number(x.horas) || 0), 0);
  const meta = ['<span>' + prog.length + (prog.length === 1 ? ' programado' : ' programados') + '</span>', '<span>' + fei.length + (fei.length === 1 ? ' realizado em ' : ' realizados em ') + ano + (h ? ' · ' + trHoras(Math.round(h * 10) / 10) : '') + '</span>',
    falta ? metaPl(falta + (falta === 1 ? ' sem registro' : ' sem registro'), 'wa', 'alerta') : ''];
  const acoes = trPode() ? '<div class="tr-acs"><button type="button" class="bt" data-act="tr-importar" title="Importar o resumo exportado pelo Sabiá (.json)">' + ic('baixar') + 'Importar do Sabiá</button>' +
    '<button type="button" class="bt pr" data-act="tr-novo">' + ic('mais') + 'Novo treinamento</button></div>' : '';
  let c = cabecalho({ titulo: 'Treinamentos', abaNome: 'Treinamentos', meta: meta.filter(Boolean), acoes: acoes });
  if (!l.length) return c + '<section class="pn"><div class="vazio">' + ic('pessoas') + '<b>Nenhum treinamento ainda.</b><span>' + (trPode() ? 'Programe um treinamento, registre um que já aconteceu ou importe o resumo de uma sessão do Sabiá. A lista de presença sai pronta, com os nomes.' : 'Quando o Administrador ou o Líder programar ou registrar treinamentos, eles aparecem aqui.') + '</span></div></section>';
  return c + tbHTML({ id: 'tr-lista', titulo: 'Treinamentos', unidade: 'treinamentos', linhas: l, aoClicar: id => trAbre(id),
    grupos: { v: x => x.situacao, ordem: TR_GRUPOS }, busca: x => [x.titulo, x.instrutorNome, x.local, trPart(x).map(p => p.nome).join(' ')].join(' '), vazio: 'Nenhum treinamento com este filtro.',
    cols: [{ k: 'dt', rot: 'Data', tipo: 'data', v: x => x.data }, { k: 'ti', rot: 'Treinamento', v: x => x.titulo, cls: 'forte' }, { k: 'in', rot: 'Instrutor', v: x => x.instrutorNome || '' },
      { k: 'pr', rot: 'Presentes', tipo: 'num', v: x => x.situacao === 'realizado' ? trPresentes(x).length : null }, { k: 'hr', rot: 'Horas', tipo: 'num', v: x => x.horas == null ? null : Number(x.horas) },
      { k: 'ef', rot: 'Eficácia %', tipo: 'num', v: x => trEfic(x).pct }, { k: 'or', rot: 'Origem', v: trOrigTxt }, { k: 'st', rot: 'Situação', v: x => trFalta(x) ? 'Falta registrar' : TR_SIT[x.situacao][0], html: trSitPill }] });
}
const trQualOrig = TELAS.qualidade;
TELAS.qualidade = aba => aba === 'treinos' ? trTela() : trQualOrig(aba);

/* ---------- detalhe ---------- */
function trAbre(id) { S._trGv = id; gvAbrir(() => trGaveta(id)); }
function trGaveta(id) {
  const x = trDe(id); if (!x) { S._trGv = null; return null; }
  const pres = trPresentes(x), ef = trEfic(x), q = x.quiz, ps = trPart(x), real = x.situacao === 'realizado';
  const rows = [['Data', fmtD(x.data)], ['Instrutor', x.instrutorNome || ''], ['Horas', trHoras(x.horas)], ['Local', x.local || ''], ['Origem', x.origem === 'sabia' ? 'Sabiá' : 'Registrado aqui']];
  if (real) { rows.push(['Presentes', pres.length + ' de ' + ps.length]); if (ef.base) rows.push(['Eficácia', ef.sim + ' de ' + ef.base + ' (' + ef.pct + '%)']); }
  if (q) { rows.push(['Quiz', (q.app === 'sabia' ? 'Sabiá' : 'EFCQuiz') + (q.cod ? ' · ' + q.cod : '')]); if (q.pct != null) rows.push(['Média do quiz', q.pct + '%']); }
  rows.push(['Registrado por', (x.criadoPorNome || '') + (x.criadoEm ? ' · ' + fmtD(diaLocal(x.criadoEm)) : '')]);
  let c = '';
  if (x.situacao === 'cancelado') c += lcAv('<b>Cancelado</b>' + (x.canceladoEm ? ' em ' + fmtD(x.canceladoEm) : '') + (x.canceladoPor ? ' por ' + esc(x.canceladoPor) : '') + ': ' + esc(x.canceladoMotivo || ''), 'cr');
  else if (trFalta(x)) c += lcAv('A data passou e o treinamento ainda não foi registrado. ' + (trPode() ? 'Toque em <b>Registrar realização</b>.' : 'O Líder ou o Administrador registra.'), 'wa');
  c += gvCampos(rows);
  if (x.obs) c += '<p class="gv-h">Observação</p><p class="tr-obs">' + esc(x.obs) + '</p>';
  c += '<p class="gv-h">Participantes (' + ps.length + ')</p>';
  if (!ps.length) c += '<p class="tr-vz">Sem lista ainda. A lista de presença sai em branco para assinar à mão.</p>';
  else c += '<ul class="tr-ps">' + ps.map(p => '<li><span class="tr-pn">' + esc(p.nome) + '</span><span class="tr-pp">' +
    (real ? (p.presente ? '<span class="pill ok">Presente</span>' : '<span class="pill cr">Faltou</span>') + (p.presente && p.eficaz === true ? '<span class="pill ok">Eficaz</span>' : p.presente && p.eficaz === false ? '<span class="pill wa">Não eficaz</span>' : '') + (p.pct != null ? '<span class="pill">' + esc(String(p.pct)) + '%</span>' : '') : '') + '</span></li>').join('') + '</ul>';
  const dl = (x.docs || []).map(d => ({ d: d, ip: S.ipDocs.find(y => y.id === d.docId) }));
  if (dl.length) c += '<p class="gv-h">Documentos</p><ul class="tr-ds">' + dl.map(o => '<li><span class="tr-dn"><b>' + esc(o.ip ? o.ip.nome : 'Documento não encontrado') + '</b><small>' + esc(TR_PAPEL[o.d.papel] || o.d.papel) + (o.ip && o.ip.status === 'obsoleto' ? ' · obsoleto' : '') + '</small></span>' +
    (o.ip ? '<button type="button" class="bt ic-so" data-act="tr-doc" data-id="' + esc(o.d.docId) + '" title="Abrir em Documentos › Impressos" aria-label="Abrir">' + ic('externo') + '</button>' : '') + '</li>').join('') + '</ul>';
  const cab = trPode() && x.situacao !== 'cancelado' ? '<button type="button" class="bt ic-so" data-act="tr-editar" data-id="' + esc(x.id) + '" title="Editar" aria-label="Editar">' + ic('lapis') + '</button>' : '';
  const pe = '<button type="button" class="bt ic-so" data-act="tr-lista" data-id="' + esc(x.id) + '" title="Imprimir a lista de presença" aria-label="Imprimir a lista de presença">' + ic('impressora') + '</button>' +
    (trPode() && x.situacao === 'programado' ? '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="tr-pres" data-id="' + esc(x.id) + '">' + ic('ok') + 'Registrar realização</button>'
      : trPode() && real ? '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="tr-pres" data-id="' + esc(x.id) + '">' + ic('pessoas') + 'Presença e eficácia</button>' : '');
  return { ico: 'pessoas', sub: fmtD(x.data) + ' · ' + trOrigTxt(x), titulo: x.titulo, pill: trSitPill(x), cabAcoes: cab,
    lixeira: trPode() && x.situacao !== 'cancelado' ? { act: 'tr-canc', id: x.id, titulo: 'Cancelar o treinamento' } : null, corpo: c, rodape: pe };
}

/* ---------- novo e editar ---------- */
const trNomes = t => { const v = [], vis = {}; String(t || '').split(/[\n;]+/).forEach(s => { const n = s.replace(/\s+/g, ' ').trim(); if (n && !vis[tbNorm(n)]) { vis[tbNorm(n)] = 1; v.push(n); } }); return v; };
const trDocsOpc = papel => [['', 'Nenhum']].concat(ipVivos().filter(d => d.status !== 'obsoleto').sort((a, b) => cmpTxt(a.nome, b.nome)).map(d => [d.id, (d.codigo ? d.codigo + ' · ' : '') + d.nome]));
function trNovo() { if (!trPode()) return; lcAbrir({ k: 'trEd', id: '', titulo: '', data: hojeISO(), horas: '', instrutor: S.user.nome, local: '', sit: 'programado', parts: '', pop: '', mat: '', obs: '' }); }
function trEditar(id) {
  const x = trDe(id); if (!x || !trPode()) return;
  const doc = p => ((x.docs || []).find(d => d.papel === p) || {}).docId || '';
  lcAbrir({ k: 'trEd', id: x.id, titulo: x.titulo, data: x.data, horas: x.horas == null ? '' : String(x.horas).replace('.', ','), instrutor: x.instrutorNome || '', local: x.local || '', sit: x.situacao, parts: trPart(x).map(p => p.nome).join('\n'), pop: doc('pop'), mat: doc('material'), obs: x.obs || '' }, () => trAbre(x.id));
}
LC_FORM.trEd = f => {
  const novo = !f.id, nomes = S.users.filter(u => !u.bloqueado).map(u => u.nome).sort(cmpTxt), opc = trDocsOpc();
  const c = lcMsg() + apPasso(1, 'O treinamento') + lcBl('Título', lcIn('titulo', f.titulo, ' maxlength="160" placeholder="ex.: Coleta de amostras de solo"')) +
    '<div class="fm-g cl-fm2">' + lcBl('Data', lcData('data', f.data, true)) + lcBl('Duração (horas)', lcIn('horas', f.horas, ' inputmode="decimal" placeholder="ex.: 1,5"')) + '</div>' +
    '<div class="fm-g cl-fm2">' + lcBl('Instrutor', lcIn('instrutor', f.instrutor, ' list="tr-dl-ins" maxlength="80"') + '<datalist id="tr-dl-ins">' + nomes.map(n => '<option value="' + esc(n) + '">').join('') + '</datalist>') + lcBl('Local', lcIn('local', f.local, ' maxlength="80" placeholder="ex.: refeitório"')) + '</div>' +
    (novo ? lcBl('Situação', ddHTML('tr:sit', f.sit, [['programado', 'Programado (ainda vai acontecer)'], ['realizado', 'Já realizado']])) : '') +
    apPasso(2, 'Quem participa') + lcBl('Participantes', '<textarea class="fm-i tr-pt" data-fm="parts" rows="7" placeholder="Um nome por linha">' + esc(f.parts || '') + '</textarea>', 'um por linha') +
    lcAv(f.sit === 'realizado' ? 'Quem está na lista entra como presente. Para marcar quem faltou e a eficácia, abra o treinamento depois de salvar.' : 'A lista pode ficar em branco: a lista de presença sai vazia para assinar à mão.') +
    apPasso(3, 'Documentos e observação') + '<div class="fm-g cl-fm2">' + lcBl(TR_PAPEL.pop, ddHTML('tr:pop', f.pop, opc)) + lcBl(TR_PAPEL.material, ddHTML('tr:mat', f.mat, opc)) + '</div>' +
    lcBl('Observação', lcTx('obs', f.obs, 'opcional'));
  return { ico: 'pessoas', sub: 'Qualidade · Treinamentos', titulo: novo ? 'Novo treinamento' : 'Editar treinamento', corpo: c, rodape: lcPe('tr-ed-ok', novo ? (f.sit === 'realizado' ? 'Registrar' : 'Programar') : 'Salvar') };
};
function trEdOk() {
  const f = S.fm; if (!f || !trPode()) return lcErro('Só o Líder ★ ou o Administrador registra treinamento.');
  const x = f.id ? trDe(f.id) : null, titulo = String(f.titulo || '').trim(), instr = String(f.instrutor || '').trim(), horas = String(f.horas || '').trim().replace(',', '.'), nomes = trNomes(f.parts);
  if (titulo.length < 3) return lcErro('Escreva o título do treinamento.');
  if (!dataOk(f.data)) return lcErro('Informe a data.');
  if (f.sit === 'realizado' && f.data > hojeISO()) return lcErro('Um treinamento já realizado não pode ter data no futuro.');
  if (horas && (isNaN(Number(horas)) || Number(horas) < 0 || Number(horas) > 200)) return lcErro('A duração é em horas, de 0 a 200 (ex.: 1,5).');
  if (!instr) return lcErro('Diga quem é o instrutor.');
  if (nomes.some(n => n.length > 80)) return lcErro('Cada nome cabe em até 80 letras.');
  if (nomes.length > 400) return lcErro('A lista cabe até 400 nomes.');
  if (f.sit === 'realizado' && !nomes.length) return lcErro('Escreva os participantes (um nome por linha).');
  if (!lcTravar()) return;
  const antigos = {}; if (x) trPart(x).forEach(p => { antigos[tbNorm(p.nome)] = p; });
  const parts = nomes.map(n => antigos[tbNorm(n)] ? Object.assign({}, antigos[tbNorm(n)], { nome: n }) : { nome: n, presente: f.sit === 'realizado', eficaz: null });
  const docs = []; if (f.pop) docs.push({ docId: f.pop, papel: 'pop' }); if (f.mat) docs.push({ docId: f.mat, papel: 'material' });
  const ins = S.users.find(u => tbNorm(u.nome) === tbNorm(instr)), ts = nowISO(), u = S.user;
  const o = Object.assign({}, x ? trLimpa(x) : { v: 1, origem: 'efcwork', quiz: null, criadoPorId: u.id, criadoPorNome: u.nome, criadoEm: ts },
    { titulo: titulo, data: f.data, situacao: x ? x.situacao : f.sit, instrutorNome: instr, instrutorId: ins ? ins.id : '', horas: horas ? Number(horas) : null, local: String(f.local || '').trim(), obs: String(f.obs || '').trim(), participantes: parts, docs: docs, alteradoEm: ts, alteradoPor: u.nome });
  const er = EFD.treino(o); if (er.length) { f._trava = 0; return lcErro('Confira os dados: ' + er[0] + '.'); }
  let p;
  if (x) { p = Data.col('sv2_treinos').update(x.id, o); Object.assign(x, o); Audit.log({ acao: 'treino_editar', entidade: 'treinamento', entidadeId: x.id, resumo: 'Editou o treinamento ' + titulo + ' (' + fmtD(o.data) + ')' }); }
  else {
    p = Data.col('sv2_treinos').add(o);
    p.then(id => { if (!S.trn.some(y => y.id === id)) S.trn.push(Object.assign({ id: id }, o));
      Audit.log({ acao: 'treino_criar', entidade: 'treinamento', entidadeId: id, resumo: (o.situacao === 'realizado' ? 'Registrou' : 'Programou') + ' o treinamento ' + titulo + ' (' + fmtD(o.data) + ') · instrutor ' + instr });
      if (o.situacao === 'programado' && ins && ins.id !== u.id) Notif.send({ nivel: 'aviso', titulo: 'Treinamento programado para você', texto: titulo + ' — ' + fmtD(o.data) + '. Programado por ' + u.nome + '.', para: [ins.id], refTipo: 'treinamento', refId: id }).catch(() => {}); });
  }
  const aberto = x ? x.id : null; f.volta = null;
  lcGrava([p], x ? 'Treinamento salvo.' : (o.situacao === 'realizado' ? 'Treinamento registrado.' : 'Treinamento programado.'), () => { if (aberto) trAbre(aberto); else if (S.gv) gvFecharSo(); });
}
const trLimpa = x => { const o = JSON.parse(JSON.stringify(x)); delete o.id; return o; };

/* ---------- registrar realização, presença e eficácia ---------- */
function trPres(id) {
  const x = trDe(id); if (!x || !trPode() || x.situacao === 'cancelado') return;
  const prog = x.situacao === 'programado', rows = trPart(x).map(p => ({ nome: p.nome, presente: prog ? '1' : (p.presente ? '1' : '0'), eficaz: p.eficaz === true ? '1' : p.eficaz === false ? '0' : '', pct: p.pct == null ? null : p.pct }));
  lcAbrir({ k: 'trPres', id: x.id, prog: prog, data: prog && x.data > hojeISO() ? hojeISO() : x.data, horas: x.horas == null ? '' : String(x.horas).replace('.', ','), rows: rows, novo: '' }, () => trAbre(x.id));
}
LC_FORM.trPres = f => {
  const x = trDe(f.id); if (!x) return null;
  const ln = f.rows.map((r, n) => '<li class="tr-lp"><span class="tr-pn">' + esc(r.nome) + '</span><div class="tr-pc"><label class="fm-ck"><input type="checkbox" data-fm="rows.' + n + '.presente"' + (r.presente === '1' ? ' checked' : '') + '> Presente</label>' +
    ddHTML('tr:ef.' + n, r.eficaz, [['', 'Eficácia: a avaliar'], ['1', 'Eficaz'], ['0', 'Não eficaz']]) + '</div></li>').join('');
  const c = lcMsg() + (f.prog ? '<div class="fm-g cl-fm2">' + lcBl('Data em que aconteceu', lcData('data', f.data)) + lcBl('Duração (horas)', lcIn('horas', f.horas, ' inputmode="decimal" placeholder="ex.: 1,5"')) + '</div>' : '') +
    apPasso(f.prog ? 2 : 1, 'Presença e eficácia') + (ln ? '<ul class="tr-lps">' + ln + '</ul>' : '<p class="tr-vz">Ninguém na lista. Adicione os nomes abaixo.</p>') +
    '<div class="tr-add">' + lcIn('novo', f.novo, ' maxlength="80" placeholder="Adicionar outro participante"') + '<button type="button" class="bt" data-act="tr-add">' + ic('mais') + 'Adicionar</button></div>' +
    lcAv('Eficácia vale só para quem estava presente. “A avaliar” deixa para depois (ex.: observação em campo ou resultado do quiz).');
  return { ico: 'pessoas', sub: x.titulo, titulo: f.prog ? 'Registrar realização' : 'Presença e eficácia', corpo: c, rodape: lcPe('tr-pres-ok', f.prog ? 'Registrar' : 'Salvar') };
};
function trAdd() {
  const f = S.fm; if (!f) return; const n = String(f.novo || '').replace(/\s+/g, ' ').trim(); if (!n) return lcErro('Escreva o nome.');
  if (n.length > 80) return lcErro('O nome cabe em até 80 letras.');
  if (f.rows.some(r => tbNorm(r.nome) === tbNorm(n))) return lcErro('Este nome já está na lista.');
  if (f.rows.length >= 400) return lcErro('A lista cabe até 400 nomes.');
  f.rows.push({ nome: n, presente: '1', eficaz: '', pct: null }); f.novo = ''; f.msg = ''; gvDesenha(true);
}
function trPresOk() {
  const f = S.fm, x = f && trDe(f.id); if (!x || !trPode()) return lcErro('Só o Líder ★ ou o Administrador registra.');
  const horas = String(f.horas || '').trim().replace(',', '.');
  if (f.prog) { const er = validaData(f.data); if (er) return lcErro(er); }
  if (horas && (isNaN(Number(horas)) || Number(horas) < 0 || Number(horas) > 200)) return lcErro('A duração é em horas, de 0 a 200 (ex.: 1,5).');
  const parts = f.rows.map(r => ({ nome: r.nome, presente: r.presente === '1', eficaz: r.presente === '1' && r.eficaz !== '' ? r.eficaz === '1' : null, pct: r.pct }));
  parts.forEach(p => { if (p.pct == null) delete p.pct; });
  if (!parts.some(p => p.presente)) return lcErro('Marque pelo menos uma pessoa presente.');
  if (!lcTravar()) return;
  const ts = nowISO(), o = { participantes: parts, situacao: 'realizado', alteradoEm: ts, alteradoPor: S.user.nome };
  if (f.prog) { o.data = f.data; o.horas = horas ? Number(horas) : x.horas == null ? null : x.horas; } else if (horas) o.horas = Number(horas);
  const novo = Object.assign({}, trLimpa(x), o), er = EFD.treino(novo); if (er.length) { f._trava = 0; return lcErro('Confira os dados: ' + er[0] + '.'); }
  const p = Data.col('sv2_treinos').update(x.id, o); Object.assign(x, o);
  const pr = parts.filter(y => y.presente).length, ef = trEfic(x);
  Audit.log({ acao: f.prog ? 'treino_realizar' : 'treino_presenca', entidade: 'treinamento', entidadeId: x.id, resumo: (f.prog ? 'Registrou a realização de ' : 'Atualizou presença e eficácia de ') + x.titulo + ': ' + pr + ' de ' + parts.length + ' presentes' + (ef.base ? ', eficácia ' + ef.pct + '%' : '') });
  const id = x.id; f.volta = null; lcGrava([p], f.prog ? 'Realização registrada.' : 'Presença e eficácia salvas.', () => trAbre(id));
}

/* ---------- cancelar ---------- */
LC_FORM.trCanc = f => { const x = trDe(f.id); if (!x) return null;
  return { ico: 'x', sub: fmtD(x.data) + ' · ' + x.titulo, titulo: 'Cancelar o treinamento', corpo: lcMsg() + lcAv('Nada é apagado: o treinamento fica como cancelado, com o motivo.', 'cr') + lcBl('Motivo', lcTx('motivo', f.motivo, 'obrigatório')), rodape: lcPe('tr-canc-ok', 'Cancelar o treinamento') }; };
function trCancOk() {
  const f = S.fm, x = f && trDe(f.id); if (!x || !trPode()) return lcErro('Só o Líder ★ ou o Administrador cancela.');
  const m = String(f.motivo || '').trim(); if (m.length < 5) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  const o = { situacao: 'cancelado', canceladoMotivo: m, canceladoEm: hojeISO(), canceladoPor: S.user.nome, alteradoEm: nowISO(), alteradoPor: S.user.nome };
  const p = Data.col('sv2_treinos').update(x.id, o); Object.assign(x, o);
  Audit.log({ acao: 'treino_cancelar', entidade: 'treinamento', entidadeId: x.id, resumo: 'Cancelou o treinamento ' + x.titulo + ' (' + fmtD(x.data) + '): ' + m });
  const id = x.id; S.fm.volta = null; lcGrava([p], 'Treinamento cancelado.', () => trAbre(id));
}

/* ---------- lista de presença (A4 em pé) ---------- */
function trListaHTML(x) {
  const ps = trPart(x), emp = S.empresa && (S.empresa.razao || S.empresa.nome) || '', n = Math.max(ps.length + (ps.length ? 3 : 0), 15), l = [];
  for (let k = 0; k < n; k++) l.push('<tr><td class="n">' + (k + 1) + '</td><td>' + (ps[k] ? esc(ps[k].nome) : '') + '</td><td></td></tr>');
  return '<div class="tr-imp"><p class="tr-ie">' + esc(emp) + '</p><h1>Lista de presença · Treinamento</h1>' +
    '<table class="tr-ic"><tr><th>Treinamento</th><td colspan="3">' + esc(x.titulo) + '</td></tr><tr><th>Data</th><td>' + esc(fmtD(x.data)) + '</td><th>Duração</th><td>' + esc(trHoras(x.horas) || '') + '</td></tr>' +
    '<tr><th>Instrutor</th><td>' + esc(x.instrutorNome || '') + '</td><th>Local</th><td>' + esc(x.local || '') + '</td></tr></table>' +
    '<table class="tr-it"><thead><tr><th class="n">Nº</th><th>Nome</th><th>Assinatura</th></tr></thead><tbody>' + l.join('') + '</tbody></table>' +
    '<div class="tr-ia"><span>Assinatura do instrutor</span><span>Data</span></div></div>';
}
function trLista(id) {
  const x = trDe(id); if (!x) return;
  Audit.log({ acao: 'treino_lista', entidade: 'treinamento', entidadeId: x.id, resumo: 'Imprimiu a lista de presença de ' + x.titulo + ' (' + fmtD(x.data) + ')' });
  ktImprimeHTML(trListaHTML(x), 'Lista de presença ' + x.titulo);
}

/* ---------- importar do Sabiá ---------- */
function trImportar() {
  if (!trPode()) return;
  let i = $('#tr-arq'); if (i) i.remove();
  i = document.createElement('input'); i.type = 'file'; i.id = 'tr-arq'; i.accept = '.json,application/json'; i.hidden = true; document.body.appendChild(i);
  i.addEventListener('change', async () => { const a = i.files && i.files[0]; i.remove(); if (a) trImportaTexto(await a.text()); });
  i.click();
}
async function trImportaTexto(txt) {
  let j; try { j = JSON.parse(txt); } catch { return aviso('Este arquivo não é um resumo do Sabiá (não consegui ler).', 'erro'); }
  const l = Array.isArray(j) ? j : j && Array.isArray(j.treinos) ? j.treinos : j && typeof j === 'object' ? [j] : [];
  if (!l.length) return aviso('Não achei nenhum treinamento neste arquivo.', 'erro');
  const u = S.user, ts = nowISO(); let ok = 0, dup = 0, teste = 0, ruim = 0;
  for (const r of l) {
    const o = Object.assign({ v: 1, origem: r && r.quiz ? 'sabia' : 'efcwork', criadoPorId: u.id, criadoPorNome: u.nome, criadoEm: ts }, r || {});
    if (o.teste === true) { teste++; continue; }
    if (EFD.treino(o).length) { ruim++; continue; }
    if (o.quiz && S.trn.some(y => y.quiz && y.quiz.app === o.quiz.app && y.quiz.sessaoId === o.quiz.sessaoId)) { dup++; continue; }
    try { const id = await Data.col('sv2_treinos').add(o); if (!S.trn.some(y => y.id === id)) S.trn.push(Object.assign({ id: id }, o)); ok++;
      Audit.log({ acao: 'treino_importar', entidade: 'treinamento', entidadeId: id, resumo: 'Importou o treinamento ' + o.titulo + ' (' + fmtD(o.data) + ') do ' + (o.quiz ? 'Sabiá' : 'arquivo') });
    } catch (e) { console.error(e); ruim++; }
  }
  const t = [ok ? ok + (ok === 1 ? ' importado' : ' importados') : '', dup ? dup + ' já estava aqui' : '', teste ? teste + (teste === 1 ? ' de teste ficou de fora' : ' de teste ficaram de fora') : '', ruim ? ruim + (ruim === 1 ? ' com dados errados' : ' com dados errados') : ''].filter(Boolean).join(' · ');
  aviso(t || 'Nada para importar.', ok ? undefined : 'erro'); if (S.rota.area === 'qualidade') render();
}

/* ---------- ações, listas retráteis e busca ---------- */
DD_AO.tr = (k, v) => {
  const f = S.fm; if (!f) return; f.sujo = true; f.msg = '';
  if (k === 'sit') { f.sit = v; gvDesenha(true); } else if (k === 'pop' || k === 'mat') f[k] = v;
  else if (k.indexOf('ef.') === 0) { const r = f.rows[Number(k.slice(3))]; if (r) r.eficaz = v; }
};
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="tr-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'tr-novo') trNovo();
  else if (a === 'tr-importar') trImportar();
  else if (a === 'tr-editar') trEditar(id);
  else if (a === 'tr-ed-ok') trEdOk();
  else if (a === 'tr-pres') trPres(id);
  else if (a === 'tr-pres-ok') trPresOk();
  else if (a === 'tr-add') trAdd();
  else if (a === 'tr-canc') lcAbrir({ k: 'trCanc', id: id, motivo: '' }, () => trAbre(id));
  else if (a === 'tr-canc-ok') trCancOk();
  else if (a === 'tr-lista') trLista(id);
  else if (a === 'tr-doc') { if (S.gv) gvFecharSo(); ir('documentos', 'impressos'); setTimeout(() => { try { ipAbre(id); } catch (er) { console.error(er); } }, 120); }
});
BG_FONTES.push(q => S.trn.filter(x => bgCasa(q, [x.titulo, x.instrutorNome, x.local, trPart(x).map(p => p.nome).join(' ')].join(' '))).slice(0, 6).map(x => ({ grupo: 'Treinamentos', nome: x.titulo, sub: fmtD(x.data) + ' · ' + (TR_SIT[x.situacao] || TR_SIT.programado)[0] + (x.instrutorNome ? ' · ' + x.instrutorNome : ''), ico: 'pessoas',
  abrir: () => { if (S.rota.area !== 'qualidade' || S.rota.aba !== 'treinos') ir('qualidade', 'treinos'); trAbre(x.id); } })));
