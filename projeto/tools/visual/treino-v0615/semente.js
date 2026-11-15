/* dados inventados para usar o módulo Treinamentos como no dia a dia (nomes e temas de uma fazenda de mamão e acerola) */
module.exports = async function () {
  const C = Data.col.bind(Data), h = hojeISO(), d = n => addDias(h, n), ts = nowISO();
  const NOMES = ['Ana Souza', 'Carlos Dias', 'Juraci Lima', 'Francisco Alves', 'Maria das Dores', 'José Ribeiro', 'Antônia Ferreira', 'Raimundo Nonato', 'Luciana Pereira', 'Edson Barbosa', 'Marta Oliveira', 'Pedro Henrique', 'Cícera Matos', 'Wellington Santos', 'Rita de Cássia', 'Genilson Costa', 'Vanda Moreira', 'Sebastião Lopes', 'Aparecida Nunes', 'Damião Silva', 'Josefa Cardoso', 'Alexandre Freitas', 'Lúcia Mendes', 'Cláudio Rocha', 'Terezinha Gomes', 'Marcos Vinícius', 'Rosimeire Araújo', 'Valdemir Cruz', 'Elisângela Pinto', 'Anderson Teixeira'];
  const pt = (n, falt, efic, pct) => NOMES.slice(0, n).map((nm, i) => { const pres = !falt.includes(i), o = { nome: nm, presente: pres, eficaz: pres ? (efic === 'x' ? null : (i % 7 === 3 ? false : true)) : null }; if (pct && pres) o.pct = 60 + (i * 7) % 40; return o; });
  const base = { v: 1, origem: 'efcwork', quiz: null, criadoPorId: 'x', criadoPorNome: 'Joana Silva', criadoEm: ts, local: 'Refeitório', docs: [] };
  const L = [
    ['t1', 'Uso correto de EPI na aplicação', d(-3), 'realizado', 'Joana Silva', 1.5, pt(22, [4, 9], '', false)],
    ['t2', 'Coleta de amostras de solo e folha', d(-9), 'realizado', 'Carlos Dias', 2, pt(14, [], '', true), { origem: 'sabia', quiz: { app: 'sabia', cod: 'SOLO-0911', sessaoId: 's1', pct: 78 } }],
    ['t3', 'Boas práticas de colheita do mamão', d(-16), 'realizado', 'Juraci Lima', 1, pt(28, [2, 11, 20], 'x', false)],
    ['t4', 'Higiene pessoal e lavagem das mãos (Global G.A.P.)', d(-30), 'realizado', 'Joana Silva', 0.75, pt(30, [], '', true), { origem: 'sabia', quiz: { app: 'efcquiz', cod: 'HIG-1014', sessaoId: 's2', pct: 91 } }],
    ['t5', 'Primeiros socorros no campo', d(-45), 'realizado', 'Ana Souza', 3, pt(18, [1], '', false)],
    ['t6', 'Manejo orgânico: caldas e biofertilizantes', d(-60), 'realizado', 'Francisco Alves', 2, pt(12, [], '', false)],
    ['t7', 'Rastreabilidade e identificação de lotes no packing house', d(-75), 'realizado', 'Joana Silva', 1.5, pt(16, [5], '', true)],
    ['t8', 'Segurança no uso de escadas e plataformas', d(-100), 'cancelado', 'Carlos Dias', 1, pt(10, [], 'x', false), { canceladoMotivo: 'Chuva forte no dia; remarcado para o próximo mês', canceladoEm: d(-100), canceladoPor: 'Joana Silva' }],
    ['t9', 'Reciclagem: NR-31 e direitos do trabalhador rural', d(-5), 'programado', 'Joana Silva', 2, pt(25, [], 'x', false).map(p => ({ nome: p.nome, presente: false, eficaz: null }))],
    ['t10', 'Calibração e cuidado com a balança do campo', d(4), 'programado', 'Ana Souza', 1, []],
    ['t11', 'Auditoria interna: o que o auditor olha', d(12), 'programado', 'Joana Silva', 2.5, NOMES.slice(0, 8).map(n => ({ nome: n, presente: false, eficaz: null }))],
    ['t12', 'Ensaio do quiz (teste)', d(-1), 'realizado', 'Joana Silva', 0.5, pt(3, [], 'x', false), { teste: true }]
  ];
  for (const [id, ti, dt, st, ins, hr, ps, ex] of L) await C('sv2_treinos').set(id, Object.assign({}, base, { titulo: ti, data: dt, situacao: st, instrutorNome: ins, instrutorId: '', horas: hr, participantes: ps, obs: id === 't1' ? 'Foi feito o treinamento com demonstração prática do uso de máscara, luvas e botas, com a troca de filtros da máscara.' : '' }, ex || {}));
};
