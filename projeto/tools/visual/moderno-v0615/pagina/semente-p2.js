/* dados inventados da parte 2: plano de coleta FOLHA com 3 áreas coletadas e 3 pedidos de nova coleta (Giovane sem ★, Marcos ★),
   apontamentos "Outro" (o maior grupo) e um com "desencapados", 12 avisos no sino. Roda dentro do app em demonstração. */
module.exports = async function () {
  const C = Data.col.bind(Data), ano = hojeISO().slice(0, 4), h = hojeISO(), ts = n => new Date(Date.now() - n * 864e5).toISOString();
  await C('sv2_users').set('giovane', { nome: 'Giovane Lima', login: 'giovane', perfil: 'secundario', estrela: false, atribuicoes: ['coletas'], superiorId: S.user.id });
  await C('sv2_users').set('marcos', { nome: 'Marcos Rocha', login: 'marcos', perfil: 'secundario', estrela: true, atribuicoes: ['coletas'] });
  for (const a of ['JD06', 'JD07', 'JD08']) await C('sv2_talhoes').set(a, { codigo: a, pivo: 'Pivô 4', hectares: 3, cultura: 'MAMÃO', variedade: 'TAINUNG', ativo: true });
  await C('sv2_rodizio').set('rz1', { nome: 'FOLHA · anual · ' + ano, tipo: 'FOLHA', freq: 'A', ano: ano, ativo: true, inicio: '', prazo: '', criadoEm: ano + '-01-01T10:00:00.000Z', criadoPor: S.user.id, criadoPorNome: 'Joana Silva', areas: ['JD06', 'JD07', 'JD08'], analiseIds: [], fechados: {}, liberadas: {}, progs: {} });
  for (const [id, a] of [['cz6', 'JD06'], ['cz7', 'JD07'], ['cz8', 'JD08']]) await C('sv2_coletas').set(id, { tipo: 'FOLHA', data: addDias(h, -10), talhao: a, analiseNome: 'Foliar completa', lab: 'IBRA', valor: 96, situacao: 'ativa', coletor: 'Equipe A', enviado: true, envio: addDias(h, -9), os: 'OS-22' + a.slice(2), criadoEm: ts(10) });
  const r = await C('sv2_rodizio').get('rz1'), p = rzPeriodoDe(r, h), lib = {};
  lib[p.k] = { JD08: { por: 'Giovane Lima', motivo: 'Outro: amostra descartada', ts: ts(3), aprovadoPor: '' }, JD07: { por: 'Giovane Lima', motivo: 'Erro de envio', ts: ts(2), aprovadoPor: '' }, JD06: { por: 'Marcos Rocha', motivo: 'Amostra perdida ou danificada', ts: ts(1), aprovadoPor: '' } };
  await C('sv2_rodizio').update('rz1', { liberadas: lib });
  const mk = (id, cat, setor, obs, n) => C('sv2_apont').set(id, { data: addDias(h, -n), hora: '09:00', criadoEm: ts(n), porId: 'x', porNome: 'Carlos Dias', origem: 'rotina', auditoria: '', categoria: cat, setor: setor, grav: 'media', gravOrig: 'media', gravHist: [], comunicado: true, obs: obs, risco: '', recom: '', fotos: [], fotosDepois: [], fotosOff: {}, status: 'aberto', resolucao: null, nc: null, hist: [] });
  const outros = ['Mangueira jogada na trilha', 'Sacola no chão do pivô', 'Torneira pingando', 'Caixa de papelão na chuva', 'Lona rasgada', 'Pallet quebrado'];
  for (let i = 0; i < outros.length; i++) await mk('ox' + i, 'outro', 'Campo', outros[i], i + 1);
  await mk('fx1', 'estrutura', 'Casa de bombas', 'Fios desencapados na CBR 01', 2);
  const av = ['Nova coleta de água lançada', 'Laudo do IBRA chegou', 'Calibração do pHmetro vence em 5 dias', 'Solicitação 1042 aguardando', 'Envio para a BIOAGRI saiu', 'Treinamento de EPI amanhã', 'Apontamento urgente no Packing', 'Documento POP-07 vence este mês', 'Coleta de folha programada', 'Água: resultado conforme', 'Contagem do almoxarifado aberta', 'Bebedouro BR 03 sem verificação'];
  for (let i = 0; i < av.length; i++) await Notif.send({ nivel: i === 6 ? 'aviso' : 'info', titulo: av[i], texto: 'Aviso de exemplo ' + (i + 1), para: 'todos' });
};
