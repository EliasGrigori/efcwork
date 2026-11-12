/* semente de teste da Água (v0.6.5): bebedouros, caixa, análise de água, laboratórios e coletas em várias situações, em ?demo=1 */
module.exports = (p, o) => p.evaluate(async o => {
  o = o || {};
  const C = Data.col.bind(Data), ts = new Date().toISOString(), hoje = hojeISO(), d = n => addDias(hoje, n);
  const bebs = [['b1', 'BR 01', 'Refeitório'], ['b2', 'BR 02', 'Packing House'], ['b3', 'BR 03', 'Oficina'], ['b4', 'BR 04', 'Escritório'], ['b5', 'BR 05', 'Almoxarifado']];
  for (const b of bebs) await C('sv2_bebs').set(b[0], { codigo: b[1], local: b[2], situacao: 'ativo', descricao: '', criadoEm: ts, criadoPor: 'x', criadoPorNome: 'x' });
  await C('sv2_caixas').set('cx1', { tag: 'CX 01', local: 'Casa de bombas', tipo: 'Elevada', criadoEm: ts });
  await C('sv2_analises').set('an1', { tipo: 'AGUA', nome: 'MICROBIOLÓGICA', sigla: 'MIC', lab: 'Aqualab', valor: 85, rev: 0, ativo: true });
  await C('sv2_analises').set('an2', { tipo: 'AGUA', nome: 'FÍSICO-QUÍMICA', sigla: 'FQ', lab: 'Aqualab', valor: 140, rev: 0, ativo: true });
  await C('sv2_cfg').set('coletas', { labs: ['Aqualab', 'Hidrolab'], labAtivo: {}, labPrazo: {} });
  await C('sv2_aguaponto').set('pt1', { nome: 'Poço 01', local: 'Fazenda Jardim', tipo: 'poco', ativo: true, criadoEm: ts });
  const base = { hora: '08:10', semana: 40, analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, coletor: 'Joana Silva', lab: 'Aqualab', envio: '', os: '', numSolicitacao: '', resultado: 'PENDENTE', obs: '', situacao: 'ativa', canceladaMotivo: '', valor: 85, precoRev: 0, nf: '', compra: 'pendente', pedidoSankhya: '', dataSolicitacao: '', agente: [], gravidade: '', laudoEm: '', criadoEm: ts, criadoPor: 'x', criadoPorNome: 'Joana Silva' };
  const add = (id, x) => C('sv2_aguacol').set(id, Object.assign({}, base, x));
  await add('g1', { data: d(-40), tipoColeta: 'rodizio', rodada: 'R0', pontoRef: 'beb:b1', pontoNome: 'BR 01 — Refeitório', bebIds: ['b1'], envio: d(-39), os: 'OS-1001', resultado: 'CONFORME', laudoEm: d(-34) });
  await add('g2', { data: d(-25), tipoColeta: 'rodizio', rodada: 'R1', pontoRef: 'beb:b3', pontoNome: 'BR 03 — Oficina', bebIds: ['b3'], envio: d(-24), os: 'OS-1020', resultado: 'CONFORME', laudoEm: d(-18) });
  await add('g3', { data: d(-25), tipoColeta: 'rodizio', rodada: 'R1', pontoRef: 'beb:b4', pontoNome: 'BR 04 — Escritório', bebIds: ['b4'], envio: d(-24), os: 'OS-1020', resultado: 'CONFORME', laudoEm: d(-18) });
  await add('g4', { data: d(-12), tipoColeta: 'mesclada', rodada: 'R2', pontoRef: 'mesclada', pontoNome: 'Mesclada · BR 01 + BR 02 + BR 03 + BR 04 + BR 05', bebIds: ['b1', 'b2', 'b3', 'b4', 'b5'], envio: d(-11), resultado: 'PENDENTE' });
  await add('g5', { data: d(-5), tipoColeta: 'avulsa', pontoRef: 'caixa:cx1', pontoNome: 'CX 01 — Casa de bombas', bebIds: [], envio: d(-4), os: 'OS-1044', resultado: 'NÃO CONFORME', agente: ['coliformes'], gravidade: 'grave', laudoEm: d(-2), acao: { responsavelId: 'x', responsavelNome: 'Marcelo Bruno', prazo: d(3), etapas: [], concluida: false } });
  await add('g6', { data: d(-3), tipoColeta: 'avulsa', pontoRef: 'ponto:pt1', pontoNome: 'Poço 01 — Fazenda Jardim', bebIds: [], resultado: 'PENDENTE' });
  await add('g7', { data: d(-8), tipoColeta: 'avulsa', pontoRef: 'beb:b5', pontoNome: 'BR 05 — Almoxarifado', bebIds: ['b5'], situacao: 'cancelada', canceladaMotivo: 'Lançada por engano' });
  return 7;
}, o);
