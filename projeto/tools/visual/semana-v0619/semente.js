/* dados inventados para Relatórios › Semana (v0.6.19). Roda dentro do app (?demo=1), depois da semente padrão.
   Semana atual (segunda a domingo): 3 apontamentos (1 urgente com NC vencida, 1 média, 1 baixa) + 1 pendente de semana anterior + 1 de antes já resolvido (fora);
   4 verificações de cloro (1 baixo, 1 alto, 1 conforme, 1 de caixa); 2 coletas (1 enviada nesta semana) e 1 coleta de água; 3 movimentações (1 anulada, fora);
   atividade: 2 pessoas nesta semana e 1 pessoa numa semana arquivada (sv2_resumos). */
module.exports = async function () {
  const C = Data.col.bind(Data), seg = (() => { const h = hojeISO(); return addDias(h, -((new Date(h + 'T12:00:00').getDay() + 6) % 7)); })(), ant = addDias(seg, -3), mui = addDias(seg, -9), ts = nowISO();
  const ap = (id, data, hora, cat, setor, grav, st, obs, extra) => C('sv2_apont').set(id, Object.assign({ data: data, hora: hora, categoria: cat, setor: setor, grav: grav, gravOrig: grav, status: st, obs: obs, porId: 'u1', porNome: 'Joana Silva', criadoEm: data + 'T' + hora + ':00' }, extra || {}));
  await ap('sa1', addDias(seg, 1), '07:40', 'acidente', 'Packing House', 'urgente', 'aberto', 'Piso escorregadio na entrada da câmara fria', { nc: { responsavel: 'Ana Souza', prazo: addDias(seg, -1), acao: 'Instalar piso antiderrapante', abertaPor: 'x', abertaPorNome: 'Joana Silva', ts: ts } });
  await ap('sa2', seg, '10:15', 'epi', 'Campo', 'media', 'andamento', 'Dois colaboradores sem luva');
  await ap('sa3', addDias(seg, 2), '15:30', 'residuos', 'Refeitório', 'baixa', 'resolvido', 'Lixo fora da lixeira');
  await ap('sa4', ant, '08:00', 'quimicos', 'Almoxarifado', 'grave', 'aberto', 'Frasco sem tampa na prateleira de baixo');
  await ap('sa5', mui, '08:00', 'estrutura', 'Oficina', 'baixa', 'resolvido', 'Placa solta (já resolvida, não entra)');
  const cl = (id, dia, hora, ponto, tipo, local, v) => C('sv2_cloro').set(id, { data: dia, hora: hora, pontoNome: ponto, pontoTipo: tipo, local: local, valor: v, lancadoPorNome: 'Carlos Lima', ts: dia + 'T' + hora + ':00', pontoId: id });
  await cl('sc1', seg, '07:30', 'BR 01 · Packing House', 'beb', 'Packing House', 0.12); await cl('sc2', seg, '07:40', 'BR 04 · Refeitório', 'beb', 'Refeitório', 2.4);
  await cl('sc3', addDias(seg, 1), '07:35', 'BR 01 · Packing House', 'beb', 'Packing House', 1.1); await cl('sc4', addDias(seg, 1), '08:00', 'CX 01 · Reservatório elevado', 'caixa', 'Casa de bombas', 3.5);
  const col = (id, tipo, tal, lab, data, extra) => C('sv2_coletas').set(id, Object.assign({ tipo: tipo, talhao: tal, analiseId: 'anS', analiseNome: 'Solo completa', lab: lab, data: data, coletor: 'Carlos Lima', enviado: false, envio: '', situacao: 'ativa', valor: 58.5 }, extra || {}));
  await col('sk1', 'SOLO', 'RU18-01', 'IBRA', seg, { enviado: true, envio: addDias(seg, 1), os: '4701' }); await col('sk2', 'FOLHA', 'JD08', 'BIOAGRI', addDias(seg, 1), { analiseNome: 'Foliar macro e micro' });
  await C('sv2_coletas').set('sk3', { tipo: 'SOLO', talhao: 'RU18-09', analiseNome: 'Solo completa', lab: 'IBRA', data: mui, coletor: 'Carlos Lima', enviado: true, envio: seg, os: '4702', situacao: 'ativa', valor: 58.5 });
  await C('sv2_aguacol').set('sw1', { data: addDias(seg, 2), hora: '08:00', pontoRef: 'beb:b1', pontoNome: 'BR 01 · Packing House', analiseId: 'anA', analiseNome: 'Potabilidade microbiológica', qtd: 1, lab: 'Aqualab', resultado: 'NÃO CONFORME', gravidade: 'leve', agente: ['coliformes'], tipoColeta: 'ponto', situacao: 'ativa' });
  const mv = (id, dia, tipo, item, qtd, lote, motivo, extra) => C('sv2_alm_mov').set(id, Object.assign({ data: dia, tipo: tipo, itemNome: item, qtd: qtd, lote: lote, motivo: motivo, porNome: 'Marta Dias', criadoEm: dia + 'T09:00:00' }, extra || {}));
  await mv('sm1', seg, 'entrada', 'ÁGUA DESMINERALIZADA 1L', 24, 'L-2201', 'Compra NF 1180'); await mv('sm2', addDias(seg, 1), 'saida', 'LUVA NITRÍLICA M', 2, '', 'Uso no expediente'); await mv('sm3', addDias(seg, 1), 'saida', 'LUVA NITRÍLICA M', 9, '', 'Engano', { anulada: true });
  const au = (id, dia, hora, uid, nome, acao) => C('sv2_audit').set(id, { ts: dia + 'T' + hora + ':00', userId: uid, userName: nome, acao: acao, resumo: nome + ' fez algo', entidade: 'x' });
  await au('sx1', seg, '08:00', 'u1', 'Joana Silva', 'criar_coleta'); await au('sx2', seg, '09:00', 'u1', 'Joana Silva', 'envio_coleta'); await au('sx3', addDias(seg, 1), '10:00', 'u2', 'Carlos Lima', 'entrada_almox');
  await C('sv2_resumos').set('sem_2026-S01', { semana: '2026-S01', linhas: [{ userId: 'u9', nome: 'Pedro Alves', acoes: 41, ultima: '2026-01-04T17:00:00' }], geradoEm: '2026-01-05T08:00:00', geradoPor: 'u0', geradoPorNome: 'Elias' });
};
