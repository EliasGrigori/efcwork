/* EFCwork · aprovar.js — os pedidos que só o EFClaudian decidia passam a ser decididos aqui, no sino (v0.6.24). Prefixo: ap2.
   Pedido do Elias (20/11 09:52): "preciso também das aprovações no Cwork" (print do sino com "Decidir no EFClaudian").
   Cada função faz o MESMO que o EFClaudian v2.102.60 faz em Aprov.decidir (mesmas coleções, mesmos campos, mesmo registro):
   cloro_tratado (aplicarTratado / aoDecidirCloro), cancelar_coleta (cancelarCol), corrigir_coleta (aplicarCorrColeta),
   laudo_prazo (aplicarPatchColetas), rz_recoleta (rzAplicarRec), desativar_cadastro (aplicarDesativarCad).
   APROV_RECUSA: o que o EFClaudian faz quando reprova (cloro tratado volta a esperar; bebedouro novo fica recusado). */
const ap2Rot = c => (CO_TXT[c.tipo] || c.tipo || 'Coleta') + ' ' + (c.talhao || c.loteComp || '') + (c.data ? ' (' + fmtD(c.data) + ')' : '');

/* ---------- cloro: tratado ---------- */
APROV_APLICA.cloro_tratado = async (p, a) => {
  const r = S.cloro.find(x => x.id === p.cloroId); if (!r) throw new Error('Registro de cloro não encontrado.');
  if (!clAberto(r)) throw new Error('Este registro já foi fechado (' + clSitTxt(r) + ').');
  const t = { texto: p.texto, pedidoPor: a ? a.solicitanteNome : S.user.nome, aprovadoPor: S.user.nome, aprovadoPorId: S.user.id, ts: nowISO(), aprovId: a ? a.id : '' };
  await Data.col('sv2_cloro').update(r.id, { situacao: 'tratado', tratado: t, excluirMedia: true, tratadoAprovId: a ? a.id : '' });
  Audit.log({ acao: 'cloro_tratado', entidade: 'cloro', entidadeId: r.id, resumo: 'Tratado no ' + r.pontoNome + ': ' + p.texto, depois: { situacao: 'tratado', texto: p.texto }, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
};
APROV_RECUSA.cloro_tratado = p => p && p.cloroId ? Data.col('sv2_cloro').update(p.cloroId, { tratadoAprovId: '' }) : null;
APROV_RECUSA.novo_bebedouro = p => p && p.bebId ? Data.col('sv2_bebs').update(p.bebId, { situacao: 'recusado' }) : null;

/* ---------- coletas: cancelar, corrigir, mais prazo ---------- */
APROV_APLICA.cancelar_coleta = async (p, a) => {
  const c = S.coletas.find(x => x.id === a.refId); if (!c) throw new Error('Coleta não encontrada.');
  if (c.situacao === 'cancelada') { aviso('Aprovado. A coleta já estava cancelada.'); return; }
  if (c.laudo) throw new Error('A amostra já tem laudo: não pode ser cancelada.');
  const motivo = (p && p.motivo) || 'Cancelamento pedido', ts = nowISO();
  const passo = { ts: ts, porNome: S.user.nome, acao: 'cancelada', texto: motivo + (c.enviado ? ' (depois do envio)' : '') + ' · pedido de ' + a.solicitanteNome };
  await Data.col('sv2_coletas').push(c.id, 'hist', passo, { situacao: 'cancelada', canceladaMotivo: motivo, canceladaPor: S.user.nome, canceladaPorId: S.user.id, canceladaEm: ts, canceladaAposEnvio: !!c.enviado });
  let volta = false;
  if (c.progId) { const pg = (S.prog || []).find(x => x.id === c.progId), outras = S.coletas.filter(x => x.progId === c.progId && x.id !== c.id && x.situacao !== 'cancelada');
    if (pg && pg.situacao !== 'cancelada' && !outras.length) { await Data.col('sv2_prog').update(pg.id, { coletadaEm: '', coletadaDesfeita: { em: ts, por: S.user.nome, motivo: motivo } }); volta = true; } }
  Audit.log({ acao: 'cancelar_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Cancelou a coleta ' + ap2Rot(c) + ': ' + motivo + (c.enviado ? ' · já enviada' : '') + (volta ? ' · a programação voltou a pendente' : '') + ' · pedido de ' + a.solicitanteNome + ' (aprovado)', autorizadoPor: { id: S.user.id, nome: S.user.nome } });
};
APROV_APLICA.corrigir_coleta = async (p, a) => {
  const c = S.coletas.find(x => x.id === a.refId); if (!c) throw new Error('Amostra não encontrada.');
  const igual = (x, y) => String(x == null ? '' : x) === String(y == null ? '' : y);
  if (Object.keys(p.antes || {}).some(k => !igual(c[k], p.antes[k]))) throw new Error('A amostra mudou depois do pedido. Peça a correção de novo.');
  const h = (c.historico || []).slice();
  h.push({ ts: nowISO(), antes: p.antes, depois: p.depois, motivo: p.motivo, pedidoPor: a.solicitanteNome, aprovadoPor: S.user.nome, aprovId: a.id });
  await Data.col('sv2_coletas').update(c.id, Object.assign({}, p.depois, { alterado: true, historico: h, ultimaAprovId: a.id }));
  const mud = Object.keys(p.depois || {}).map(k => k + ': ' + (p.antes || {})[k] + ' → ' + p.depois[k]).join(', ');
  Audit.log({ acao: 'corrigir_coleta', entidade: 'coleta', entidadeId: c.id, resumo: 'Amostra corrigida: ' + ap2Rot(c) + ' · ' + mud + ' (pedido de ' + a.solicitanteNome + ')', antes: p.antes, depois: p.depois, autorizadoPor: { id: S.user.id, nome: S.user.nome } });
};
APROV_APLICA.laudo_prazo = async (p, a) => {
  let n = 0;
  for (const it of (p.itens || [])) {
    const c = S.coletas.find(x => x.id === it.id); if (!c || c.situacao === 'cancelada') continue;
    const antes = {}; Object.keys(it.patch || {}).forEach(k => { if (k !== 'prazoHist') antes[k] = c[k] == null ? '' : c[k]; });
    const patch = Object.assign({}, it.patch);
    if (it.hist) patch.prazoHist = (c.prazoHist || []).concat([Object.assign({}, it.hist, { aprovadoPor: S.user.nome })]);
    await Data.col('sv2_coletas').update(c.id, patch);
    const dep = Object.assign({}, it.patch); delete dep.prazoHist;
    Audit.log({ acao: 'laudo_prazo', entidade: 'coleta', entidadeId: c.id, resumo: 'Mais prazo para o laudo (aprovado): ' + ap2Rot(c) + ' até ' + fmtD(it.patch.prazoLaudoAte) + ' · pedido de ' + a.solicitanteNome, antes: antes, depois: dep, autorizadoPor: S.user.nome });
    n++;
  }
  aviso('Prazo estendido em ' + n + (n === 1 ? ' amostra.' : ' amostras.'));
};

/* ---------- plano de coleta (rodízio): recoleta ---------- */
APROV_APLICA.rz_recoleta = async (p, a) => {
  const r = (S.rodizios || []).find(x => x.id === p.rid); if (!r) throw new Error('Plano de coleta não encontrado.');
  const lib = JSON.parse(JSON.stringify(r.liberadas || {})); lib[p.pk] = lib[p.pk] || {};
  lib[p.pk][p.area] = { motivo: p.motivo, por: p.porNome, ts: nowISO(), aprovadoPor: S.user.nome };
  await Data.col('sv2_rodizio').update(r.id, { liberadas: lib });
  Audit.log({ acao: 'recoleta_rodizio', entidade: 'rodizio', entidadeId: r.id, resumo: 'Recoleta liberada: ' + p.area + ' no ' + p.pk + ' (' + r.nome + ') · ' + p.motivo + ' · aprovada por ' + S.user.nome });
};

/* ---------- desativar ou reativar um cadastro ---------- */
APROV_APLICA.desativar_cadastro = async (p, a) => {
  const ent = p.entTipo, ch = p.chave, at = p.novoAtivo, mot = p.motivo || '', rot = p.rotulo || String(ch), cfgC = () => S.cfgCol || {};
  const up = o => Object.assign(o, { atualizadoEm: nowISO(), atualizadoPor: S.user.id });
  if (ent === 'talhao' || ent === 'analise' || ent === 'etqmodelo') {
    const col = { talhao: 'sv2_talhoes', analise: 'sv2_analises', etqmodelo: 'sv2_etqmodelos' }[ent];
    if (!(await Data.col(col).get(ch))) throw new Error('Cadastro não encontrado.');
    await Data.col(col).update(ch, Object.assign({ ativo: at, motivoInativo: at ? '' : mot }, ent === 'etqmodelo' ? { desativadoEm: at ? '' : nowISO() } : {}));
  } else if (ent === 'lab') {
    const mapa = Object.assign({}, cfgC().labAtivo || {}), mt = Object.assign({}, cfgC().labMotivo || {}); mapa[ch] = at; if (at) delete mt[ch]; else mt[ch] = mot;
    await Data.col('sv2_cfg').update('coletas', up({ labAtivo: mapa, labMotivo: mt }));
  } else if (ent === 'fazenda' || ent === 'tipo_coleta') {
    const campo = ent === 'fazenda' ? 'fazendas' : 'tipos', l = (cfgC()[campo] || []).map(x => Object.assign({}, x)), x = l.find(y => (ent === 'fazenda' ? y.prefixo : y.nome) === ch);
    if (!x) throw new Error(ent === 'fazenda' ? 'Fazenda não encontrada.' : 'Tipo de coleta não encontrado.');
    x.ativo = at; x.motivoInativo = at ? '' : mot; const o = {}; o[campo] = l;
    await Data.col('sv2_cfg').update('coletas', up(o));
  } else throw new Error('Tipo de cadastro desconhecido: ' + ent);
  Audit.log({ acao: at ? 'ativar_cadastro' : 'desativar_cadastro', entidade: ent, entidadeId: String(ch), resumo: (at ? 'Ativou ' : 'Desativou ') + rot + (mot ? ' · motivo: ' + mot : '') + ' (pedido de ' + a.solicitanteNome + ')', autorizadoPor: { id: S.user.id, nome: S.user.nome } });
};
