/* dados inventados para Rateios (v0.6.17). Roda dentro do app (?demo=1), depois da semente padrão. Grava pelo Data do app.
   Campo: 9 enviadas (5 pendentes, 2 já com solicitação, 1 cancelada depois de enviada, 1 histórica que não entra) + 1 não enviada.
   Água: 3 enviadas (2 pendentes numa remessa sem O.S, 1 com solicitação). Calibração: 1 solicitação com 3 equipamentos (1 da filial). */
module.exports = async function () {
  const C = Data.col.bind(Data), h = hojeISO(), d = n => addDias(h, n), ts = nowISO();
  await C('sv2_analises').set('anS', { nome: 'Solo completa', sigla: 'SC', valor: 58.5, tipo: 'SOLO', ativo: true });
  await C('sv2_analises').set('anF', { nome: 'Foliar macro e micro', sigla: 'FMM', valor: 72, tipo: 'FOLHA', ativo: true });
  await C('sv2_analises').set('anA', { nome: 'Potabilidade microbiológica', sigla: 'MB', valor: 95, tipo: 'AGUA', ativo: true });
  const col = (id, tipo, tal, an, anNome, lab, env, valor, extra) => C('sv2_coletas').set(id, Object.assign({ tipo: tipo, talhao: tal, analiseId: an, analiseNome: anNome, lab: lab, data: addDias(env || h, -2), envio: env || '', enviado: !!env, valor: valor,
    situacao: 'ativa', compra: 'pendente', pedidoSankhya: '', os: '', laudo: false, cultura: tipo === 'FOLHA' ? 'MAMÃO' : 'ACEROLA', criadoEm: ts, criadoPorNome: 'Carlos Lima' }, extra || {}));
  await col('rc1', 'SOLO', 'RU18-01', 'anS', 'Solo completa', 'IBRA', d(-20), 58.5, { os: '4410' });
  await col('rc2', 'SOLO', 'RU18-02', 'anS', 'Solo completa', 'IBRA', d(-20), 58.5, { os: '4410' });
  await col('rc3', 'NEMATOIDE', 'RU18-02', 'anS', 'Nematoides', 'IBRA', d(-20), 41, { os: '4410' });
  await col('rc4', 'FOLHA', 'JD08', 'anF', 'Foliar macro e micro', 'BIOAGRI', d(-9), 72, {});
  await col('rc5', 'FOLHA', 'JD09', 'anF', 'Foliar macro e micro', 'BIOAGRI', d(-9), 72, {});
  await col('rc6', 'SOLO', 'RU18-03', 'anS', 'Solo completa', 'IBRA', d(-60), 58.5, { os: '4302', compra: 'solicitado', pedidoSankhya: '18755', dataSolicitacao: d(-40), nf: '9921', solicitadoPorNome: 'Joana Silva', laudo: true });
  await col('rc7', 'SOLO', 'RU18-04', 'anS', 'Solo completa', 'IBRA', d(-60), 58.5, { os: '4302', compra: 'solicitado', pedidoSankhya: '18755', dataSolicitacao: d(-40), nf: '9921', solicitadoPorNome: 'Joana Silva', laudo: true });
  await col('rc8', 'FRUTA', 'JD10', 'anF', 'Resíduo em fruto', 'BIOAGRI', d(-9), 120, { situacao: 'cancelada', canceladaMotivo: 'Amostra chegou estragada' });
  await col('rc9', 'SOLO', 'RU18-05', 'anS', 'Solo completa', 'IBRA', '2025-03-10', 50, { historica: true });
  await col('rc10', 'SOLO', 'RU18-06', 'anS', 'Solo completa', 'IBRA', '', 58.5, {});
  const ag = (id, ponto, env, valor, qtd, extra) => C('sv2_aguacol').set(id, Object.assign({ data: addDias(env, -1), hora: '08:00', pontoNome: ponto, analiseId: 'anA', analiseNome: 'Potabilidade microbiológica', qtd: qtd, lab: 'Aqualab', envio: env, os: '', valor: valor,
    resultado: 'PENDENTE', situacao: 'ativa', compra: 'pendente', tipoColeta: 'rodizio', criadoEm: ts, criadoPorNome: 'Carlos Lima' }, extra || {}));
  await ag('ra1', 'BR 01 · Packing House', d(-6), 95, 1);
  await ag('ra2', 'BR 04 · Refeitório', d(-6), 95, 2);
  await ag('ra3', 'BR 02 · Escritório', d(-45), 95, 1, { os: 'A-118', compra: 'solicitado', pedidoSankhya: '18690', dataSolicitacao: d(-30), nf: '9870', solicitadoPorNome: 'Joana Silva', resultado: 'CONFORME' });
  const emp = (await C('sv2_cfg').get('empresa')) || {};
  await C('sv2_cfg').set('empresa', Object.assign({}, emp, { unid: { matriz: { nome: 'Unidade Matriz', curto: 'Matriz', mun: 'Cidade Norte' }, filial: { nome: 'Unidade Filial', curto: 'Filial', mun: 'Vila Sul' } } }));
  await C('sv2_alm_equip').set('eqR1', { tag: 'BAL-01', nome: 'Balança analítica', local: 'Laboratório', tipo: 'un', situacao: 'ativo' });
  await C('sv2_alm_equip').set('eqR2', { tag: 'PH-02', nome: 'pHmetro de bancada', local: 'Laboratório', tipo: 'un', situacao: 'ativo' });
  await C('sv2_alm_equip').set('eqR3', { tag: 'EST-03', nome: 'Estufa de secagem', local: 'Laboratório Vila Sul', tipo: 'un', situacao: 'ativo' });
  await C('sv2_alm_cal').set('calR', { numero: 'CAL-' + h.slice(0, 4) + '-07', prestador: 'Metrocal', situacao: 'ativa', cotacaoEm: d(-15), criadoEm: ts, itens: [
    { equipId: 'eqR1', tag: 'BAL-01', nome: 'Balança analítica', valor: 380, aplicado: true, data: d(-5), certificado: 'MC-2231', resultado: 'aprovado' },
    { equipId: 'eqR2', tag: 'PH-02', nome: 'pHmetro de bancada', valor: 220, aplicado: false },
    { equipId: 'eqR3', tag: 'EST-03', nome: 'Estufa de secagem', valor: 460, aplicado: false }] });
};
