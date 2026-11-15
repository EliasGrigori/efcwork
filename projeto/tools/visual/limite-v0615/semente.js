/* dados inventados para os ITENS 6 e 7 da varredura v0.6.8 (página v0.6.15.3): ~2 anos de amostras (3.010) e de coletas de água (3.004),
   e duas ações corretivas de água concluídas com fotos (uma há 8 dias, já vencida; outra há 3 dias). Roda dentro do app (?demo=1). */
module.exports = async function () {
  const C = Data.col.bind(Data), h = hojeISO(), ts = nowISO(), ag = n => new Date(Date.now() - n * 864e5).toISOString(), d = n => addDias(h, n);
  /* grava direto pelo Store do app (na página de aprovação não há localStorage: fica na memória) */
  const gera = (col, n, fab) => { let a = []; try { a = JSON.parse(Store.get('sv2demo_' + col) || '[]'); } catch (e) {} for (let i = 0; i < n; i++) a.push(fab(i, addDias(h, -1 - Math.floor(i / 4)))); Store.set('sv2demo_' + col, JSON.stringify(a)); };
  const L = [['SOLO', 'Solo completo', 'IBRA', 185], ['FOLHA', 'Foliar completa', 'IBRA', 96], ['NEMATOIDE', 'Nematoide', 'BIOAGRI', 140], ['FRUTA', 'Resíduos multi', 'BIOAGRI', 620]];
  gera('sv2_coletas', 3010, (i, iso) => { const l = L[i % 4]; return { id: 'gx' + i, tipo: l[0], data: iso, talhao: 'RU' + (11 + i % 8) + 'TAI24', analiseNome: l[1], lab: l[2], valor: l[3], situacao: 'ativa', coletor: i % 2 ? 'Equipe A' : 'Juraci', enviado: true, envio: addDias(iso, 1), os: 'OS-' + (9000 - i), laudo: true, laudoEm: addDias(iso, 12), resultado: 'CONFORME', criadoEm: iso + 'T10:00:00.000Z' }; });
  const P = ['BR 01 — Escritório', 'BR 02 — Packing House', 'BR 03 — Refeitório', 'Poço 01 — Fazenda Jardim', 'Caixa 02 — Vestiário'];
  gera('sv2_aguacol', 3004, (i, iso) => ({ id: 'wx' + i, data: iso, hora: '07:30', tipoColeta: 'avulsa', pontoRef: 'ponto:x' + (i % 5), pontoNome: P[i % 5], bebIds: [], analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, lab: 'Aqualab', resultado: 'CONFORME', situacao: 'ativa', envio: iso, laudoEm: addDias(iso, 3), valor: 85, criadoEm: iso + 'T10:00:00.000Z' }));
  S._acLimpou = true; window.acFotoLimpar = async () => 0; /* a página mostra o que vê quem não é Líder ★/Administrador (no aparelho deles a eliminação roda sozinha) */
  const F = c => 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="' + c + '"/><path d="M0 180 L100 110 L180 170 L240 130 L320 190 V240 H0Z" fill="#5f6b77"/></svg>');
  await C('sv2_agua_foto').set('fv1', { coletaId: 'v8', dataUrl: F('#8fa5b4'), criadoEm: ts, porId: 'x' });
  await C('sv2_agua_foto').set('fv2', { coletaId: 'v8', dataUrl: F('#a7b59a'), criadoEm: ts, porId: 'x' });
  await C('sv2_agua_foto').set('fv3', { coletaId: 'v3', dataUrl: F('#b9a88a'), criadoEm: ts, porId: 'x' });
  const base = { hora: '07:30', analiseId: 'an1', analiseNome: 'MICROBIOLÓGICA', qtd: 1, lab: 'Aqualab', situacao: 'ativa', tipoColeta: 'avulsa', bebIds: [], resultado: 'NÃO CONFORME', agente: ['ecoli'], gravidade: 'leve', criadoEm: ts };
  const ac = (dias, fotos, txt) => ({ responsavelId: 'x2', responsavelNome: 'Marcelo Bruno', prazo: d(-dias), orientacao: 'Clorar o reservatório e trocar o filtro', abertaPor: 'x', abertaPorNome: 'Joana Silva', abertaEm: ag(dias + 3), etapas: [{ ts: ag(dias), porId: 'x2', porNome: 'Marcelo Bruno', texto: txt, fotos: fotos, final: true }], concluida: true, concluidaEm: ag(dias), concluidaPor: 'x2', concluidaPorNome: 'Marcelo Bruno' });
  await C('sv2_aguacol').set('v8', Object.assign({}, base, { data: d(-14), pontoRef: 'ponto:x2', pontoNome: 'BR 03 — Refeitório', envio: d(-13), laudoEm: d(-10), acao: ac(8, ['fv1', 'fv2'], 'Reservatório clorado e filtro trocado') }));
  await C('sv2_aguacol').set('v3', Object.assign({}, base, { data: d(-9), pontoRef: 'ponto:x3', pontoNome: 'Poço 01 — Fazenda Jardim', envio: d(-8), laudoEm: d(-5), acao: ac(3, ['fv3'], 'Tampa do poço trocada') }));
  await C('sv2_coletas').set('gx-um', { tipo: 'SOLO', data: d(-1), talhao: 'RU11TAI24', analiseNome: 'Solo completo', lab: 'IBRA', valor: 185, situacao: 'ativa', coletor: 'Juraci', enviado: false, criadoEm: ts });
};
