/* dados inventados para Relatórios › Rateio (v0.6.18). Roda dentro do app (?demo=1), depois da semente padrão.
   Água (ano de hoje): 18 coletas em 6 meses, 4 pontos (2 tipos), 2 laboratórios; 3 não conformes (1 grave, 2 leves), 2 pendentes, 1 recoleta, 1 cancelada.
   Campo: 14 amostras (solo, folha, fruta, composto, nematoide) em 2 fazendas e 2 laboratórios; 4 laudos pendentes (1 atrasado); 1 histórica e 1 cancelada que não entram. */
module.exports = async function () {
  const C = Data.col.bind(Data), h = hojeISO(), ano = h.slice(0, 4), ts = nowISO(), m = (n, d) => ano + '-' + String(n).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  const cfg = (await C('sv2_cfg').get('coletas')) || {};
  await C('sv2_cfg').set('coletas', Object.assign({ id: 'coletas' }, cfg, { fazendas: [{ prefixo: 'RU', nome: 'Fazenda Norte' }, { prefixo: 'JD', nome: 'Fazenda Jardim' }], labPrazo: Object.assign({}, cfg.labPrazo || {}, { IBRA: 15, BIOAGRI: 20 }) }));
  await C('sv2_analises').set('anS', { nome: 'Solo completa', sigla: 'SC', valor: 58.5, tipo: 'SOLO', ativo: true });
  await C('sv2_analises').set('anF', { nome: 'Foliar macro e micro', sigla: 'FMM', valor: 72, tipo: 'FOLHA', ativo: true });
  await C('sv2_analises').set('anA', { nome: 'Potabilidade microbiológica', sigla: 'MB', valor: 95, tipo: 'AGUA', ativo: true });
  await C('sv2_aguaponto').set('pCx1', { nome: 'CX 01 · Reservatório elevado', tipo: 'caixa', ativo: true });
  await C('sv2_aguaponto').set('pTr1', { nome: 'Tratamento · Saída do filtro', tipo: 'tratamento', ativo: true });
  const ag = (id, mes, dia, ref, ponto, qtd, lab, res, extra) => C('sv2_aguacol').set(id, Object.assign({ data: m(mes, dia), hora: '08:00', pontoRef: ref, pontoNome: ponto, analiseId: 'anA', analiseNome: 'Potabilidade microbiológica', qtd: qtd, valor: 95, lab: lab, envio: m(mes, dia + 1), laudoEm: res === 'PENDENTE' ? '' : m(mes, dia + 6) + 'T10:00:00', os: '', resultado: res, situacao: 'ativa', tipoColeta: 'rodizio', criadoEm: ts, criadoPorNome: 'Carlos Lima' }, extra || {}));
  const B1 = ['beb:b1', 'BR 01 · Packing House'], B2 = ['beb:b2', 'BR 04 · Refeitório'], CX = ['ponto:pCx1', 'CX 01 · Reservatório elevado'], TR = ['ponto:pTr1', 'Tratamento · Saída do filtro'];
  await ag('rg1', 5, 6, B1[0], B1[1], 1, 'Aqualab', 'CONFORME'); await ag('rg2', 5, 6, B2[0], B2[1], 1, 'Aqualab', 'CONFORME'); await ag('rg3', 5, 20, CX[0], CX[1], 2, 'Aqualab', 'CONFORME');
  await ag('rg4', 6, 3, B1[0], B1[1], 1, 'Aqualab', 'CONFORME'); await ag('rg5', 6, 3, B2[0], B2[1], 1, 'Aqualab', 'NÃO CONFORME', { gravidade: 'leve', agente: ['coliformes'] });
  await ag('rg6', 6, 24, TR[0], TR[1], 1, 'Biolab', 'CONFORME'); await ag('rg7', 7, 8, B1[0], B1[1], 1, 'Aqualab', 'CONFORME'); await ag('rg8', 7, 8, B2[0], B2[1], 1, 'Aqualab', 'CONFORME', { tipoColeta: 'recoleta' });
  await ag('rg9', 7, 22, CX[0], CX[1], 2, 'Biolab', 'NÃO CONFORME', { gravidade: 'grave', agente: ['ecoli', 'outro'], agenteOutro: 'Enterococos' });
  await ag('rg10', 8, 5, B1[0], B1[1], 1, 'Aqualab', 'CONFORME'); await ag('rg11', 8, 5, B2[0], B2[1], 1, 'Aqualab', 'CONFORME'); await ag('rg12', 8, 19, TR[0], TR[1], 1, 'Biolab', 'CONFORME');
  await ag('rg13', 9, 2, B1[0], B1[1], 1, 'Aqualab', 'CONFORME'); await ag('rg14', 9, 2, B2[0], B2[1], 1, 'Aqualab', 'NÃO CONFORME', { gravidade: 'leve', agente: ['pseudomonas'] });
  await ag('rg15', 9, 23, CX[0], CX[1], 2, 'Biolab', 'CONFORME'); await ag('rg16', 10, 7, B1[0], B1[1], 1, 'Aqualab', 'PENDENTE'); await ag('rg17', 10, 7, TR[0], TR[1], 1, 'Biolab', 'PENDENTE');
  await ag('rg18', 10, 21, B2[0], B2[1], 1, 'Aqualab', 'CONFORME', { situacao: 'cancelada' });
  const col = (id, tipo, tal, an, anNome, lab, mes, dia, valor, extra) => C('sv2_coletas').set(id, Object.assign({ tipo: tipo, talhao: tal, analiseId: an, analiseNome: anNome, lab: lab, data: m(mes, dia), envio: m(mes, dia + 1), enviado: true, valor: valor, situacao: 'ativa', compra: 'solicitado', pedidoSankhya: '18755', os: '4410', laudo: true, laudoEm: m(mes, dia + 12) + 'T09:00:00', criadoEm: ts, criadoPorNome: 'Carlos Lima' }, extra || {}));
  await col('rk1', 'SOLO', 'RU18-01', 'anS', 'Solo completa', 'IBRA', 2, 10, 58.5); await col('rk2', 'SOLO', 'RU18-02', 'anS', 'Solo completa', 'IBRA', 2, 10, 58.5); await col('rk3', 'NEMATOIDE', 'RU18-02', 'anS', 'Nematoides', 'IBRA', 3, 4, 41);
  await col('rk4', 'FOLHA', 'JD08', 'anF', 'Foliar macro e micro', 'BIOAGRI', 4, 15, 72, { laudoEm: m(5, 8) + 'T09:00:00' }); await col('rk5', 'FOLHA', 'JD09', 'anF', 'Foliar macro e micro', 'BIOAGRI', 4, 15, 72, { laudoEm: m(5, 9) + 'T09:00:00' });
  await col('rk6', 'SOLO', 'RU18-03', 'anS', 'Solo completa', 'IBRA', 6, 9, 58.5); await col('rk7', 'FOLHA', 'JD10', 'anF', 'Foliar macro e micro', 'BIOAGRI', 7, 14, 72);
  await col('rk8', 'FRUTA', 'JD10', 'anF', 'Resíduo em fruto', 'BIOAGRI', 8, 6, 120, { compra: 'pendente', pedidoSankhya: '', os: '4501', laudo: false, laudoEm: '' });
  await col('rk9', 'COMPOSTO', '', 'anS', 'Composto orgânico', 'IBRA', 8, 20, 85, { loteComp: 'LC-07', compra: 'pendente', pedidoSankhya: '', os: '4501', laudo: false, laudoEm: '' });
  await col('rk10', 'SOLO', 'RU18-04', 'anS', 'Solo completa', 'IBRA', 9, 3, 58.5, { compra: 'pendente', pedidoSankhya: '', os: '4560', laudo: false, laudoEm: '' });
  await col('rk11', 'FOLHA', 'JD08', 'anF', 'Foliar macro e micro', 'BIOAGRI', 10, 1, 72, { compra: 'pendente', pedidoSankhya: '', os: '4602', laudo: false, laudoEm: '' });
  await col('rk12', 'SOLO', 'RU18-05', 'anS', 'Solo completa', 'IBRA', 10, 8, 58.5, { enviado: false, envio: '', compra: 'pendente', pedidoSankhya: '', os: '', laudo: false, laudoEm: '' });
  await col('rk13', 'SOLO', 'RU18-06', 'anS', 'Solo completa', 'IBRA', 3, 11, 50, { historica: true });
  await col('rk14', 'FRUTA', 'JD11', 'anF', 'Resíduo em fruto', 'BIOAGRI', 5, 12, 120, { situacao: 'cancelada' });
};
