/* documentos e caixas de exemplo (os mesmos do t_v050) para Relatórios › Documentos (v0.6.23). Uso: await p.evaluate(require(...)) */
module.exports = async () => {
  const h = hojeISO(), d = n => addDias(h, n), D = Data.col('sv2_docs'), C = Data.col('sv2_caixas');
  const doc = (id, codigo, titulo, tipo, setor, resp, periodo, ultimoBase, extra) => D.set(id, Object.assign({ codigo, titulo, tipo, setor, responsavel: resp, periodo, ultimoBase, vencimento: '', desativado: false, origem: 'teste' }, extra || {}));
  await doc('d1', 'FOR 0010', 'LIMPEZA PULVERIZADORES', 'FORMULARIO', 'MECANIZAÇÃO', 'ALEX', 'MENSAL', d(-40));
  await doc('d2', 'FOR 0084', 'VERIFICAÇÃO DE LIMPEZA PACKING HOUSE', 'FORMULARIO', 'CONT. QUALIDADE', 'ELIAS', 'SEMANAL', d(-3));
  await doc('d3', 'OAB', 'COMANDA ADUBAÇÃO', 'FORMULARIO', 'AGRICOLA', 'IVANIA', 'QUINZENAL', d(-1));
  await doc('d4', 'N/A', 'COTA DE CONSUMO MENSAL DE ÁGUA', 'FORMULARIO', 'AGRICOLA', 'N/A', 'MENSAL', '');
  await doc('d5', 'LUBRASIL', 'ALVARÁ DE FUNCIONAMENTO', 'REGULATORIO', 'LUBRASIL', 'LU BRAZIL', 'ANUAL', d(-100));
  await doc('d6', 'FOCUS AMB', 'LICENÇA SANITÁRIA MATRIZ', 'REGULATORIO', 'FOCUS', 'FOCUS', 'ANUAL', d(-300), { vencimento: d(20) });
  await doc('d7', 'FOR 0099', 'ANTIGO CONTROLE', 'FORMULARIO', 'LIMPEZA', 'BEATRIZ', 'MENSAL', d(-5), { desativado: true });
  await doc('d8', 'FOR 0050', 'ABASTECIMENTO DE MÁQUINAS', 'FORMULARIO', 'MECANIZAÇÃO', 'ALEX', 'MENSAL', d(-5));
  await doc('d9', 'IBAMA', 'CADASTRO TÉCNICO FEDERAL', 'REGULATORIO', 'MEIO AMBIENTE', 'ELIAS', 'ANUAL', d(-300), { vencimento: d(-6) });
  await doc('d10', 'FOR 0120', 'CONTROLE DE PRAGAS PACKING', 'FORMULARIO', 'CONT. QUALIDADE', 'ELIAS', 'QUINZENAL', d(-20));
  const cx = (id, tag, local, periodo, ultimaBase) => C.set(id, { tag, tipo: 'Potável', local, periodo, ultimaBase, desativado: false, origem: 'teste' });
  await cx('c1', 'CXR10', 'Escritório', 'TRIMESTRAL', d(-100)); await cx('c2', 'CXR02', 'Oficina', 'TRIMESTRAL', d(-10)); await cx('c3', 'CXR01', 'Refeitório', 'SEMESTRAL', ''); await cx('c4', 'CXR05', 'Packing', 'TRIMESTRAL', d(-80));
};
