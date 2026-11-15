/* dados inventados para Qualidade › Não conformidades e Bugs e sugestões (página v0.6.16). Roda dentro do app (?demo=1),
   depois da semente padrão (que já traz a RNC-2026-03 com 10 NCs, ainda em registro). Grava pelo Store/Data do app. */
module.exports = async function () {
  const C = Data.col.bind(Data), h = hojeISO(), ts = nowISO(), d = n => addDias(h, n), ag = n => new Date(Date.now() - n * 864e5).toISOString();
  const mk = (id, dias, cat, setor, grav, obs, nc, extra) => C('sv2_apont').set(id, Object.assign({ data: d(-dias), hora: '08:10', criadoEm: ag(dias), porId: 'x', porNome: 'Carlos Lima', origem: 'rotina', categoria: cat, setor: setor, grav: grav, gravOrig: grav, gravHist: [], comunicado: true, obs: obs, fotos: [], fotosDepois: [], fotosOff: {}, status: 'aberto', hist: [], nc: nc }, extra || {}));
  const nc = (resp, prazo, acao, fech) => Object.assign({ responsavel: resp, prazo: prazo, acao: acao, abertaPorNome: 'Joana Silva', ts: ts }, fech ? { fechada: true, fechadaEm: ts, fechadaPorNome: 'Joana Silva', verificacao: fech } : {});
  await mk('apN1', 12, 'acidente', 'Packing House', 'grave', 'Escada de acesso ao mezanino sem corrimão', nc('Jackson', d(-4), 'Instalar corrimão dos dois lados'));
  await mk('apN2', 6, 'quimicos', 'Almoxarifado', 'media', 'Embalagens de defensivo sem rótulo na prateleira de baixo', nc('Marcelo Bruno', d(8), 'Rotular e separar por classe'));
  await mk('apN3', 20, 'residuos', 'Refeitório', 'baixa', 'Coletores sem tampa', nc('Zoe', d(-10), 'Trocar os coletores', 'Coletores novos com tampa conferidos'), { status: 'resolvido', resolucao: { texto: 'NC fechada: coletores novos', porNome: 'Joana Silva', ts: ts } });
  await mk('apN4', 2, 'estrutura', 'Casa de bombas', 'urgente', 'Quadro elétrico aberto e molhado', nc('Josineldo', d(2), 'Fechar o quadro e isolar o vazamento'));
  /* a RNC da semente padrão vira enviada, com prazo vencido em 3 dias, e duas NCs com retorno */
  const r = await C('sv2_rnc').get('r1');
  if (r) { r.situacao = 'enviada'; r.prazo = d(-3); r.enviadaEm = ag(9); r.data = d(-12);
    r.ncs[0].ret = { res: 'resolvida', texto: 'Fiação trocada e isolada', ts: ag(2), porNome: 'Joana Silva', fotosDepois: [] };
    r.ncs[4].ret = { res: 'parcial', texto: 'Separado em parte; falta a prateleira nova', ts: ag(1), porNome: 'Joana Silva', fotosDepois: [] };
    await C('sv2_rnc').set('r1', r); }
  /* relatos de Bugs e sugestões */
  const png = (c1, c2) => 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="' + c1 + '"/><rect x="40" y="40" width="560" height="44" rx="6" fill="' + c2 + '"/><rect x="40" y="110" width="560" height="22" rx="4" fill="#fff"/><rect x="40" y="146" width="560" height="22" rx="4" fill="#fff"/><rect x="40" y="182" width="380" height="22" rx="4" fill="#fff"/></svg>');
  const bg = (id, n, tipo, area, tit, desc, st, por, dias, extra) => C('sv2_bugs').set(id, Object.assign({ numero: n, tipo: tipo, area: area, titulo: tit, descricao: desc, foto: '', status: st, versao: 'v2.102.58', tela: area + '/x', aparelho: 'celular · 390×844', porId: por === 'Joana Silva' ? S.user.id : 'u' + n, porNome: por, ts: ag(dias),
    hist: [{ ts: ag(dias), porNome: por, status: 'novo', texto: 'Enviado' }] }, extra || {}));
  await C('sv2_bugs_foto').set('b2', { bugId: 'b2', dataUrl: png('#e9e4d8', '#c9b27a'), porId: 'u2', ts: ag(3) });
  await bg('b1', 1, 'sugestao', 'coletas', 'Filtro por laboratório nos laudos', 'Na hora de cobrar laudo seria bom ver só os do IBRA de uma vez.', 'resolvido', 'Marcelo Bruno', 30, { versaoResolvido: 'EFCwork v0.6.14', hist: [{ ts: ag(30), porNome: 'Marcelo Bruno', status: 'novo', texto: 'Enviado' }, { ts: ag(25), porNome: 'Joana Silva', status: 'analise', texto: '' }, { ts: ag(20), porNome: 'Joana Silva', status: 'resolvido', texto: 'Use o menu da coluna Laboratório · versão EFCwork v0.6.14' }] });
  await bg('b2', 2, 'bug', 'coletas', 'A tabela sobe quando seleciono uma amostra', '1. Abro Coletas › Amostras\n2. Desço até o fim\n3. Toco numa amostra: a lista volta para o topo.\nEsperava que ficasse onde estava.', 'novo', 'Juraci Lima', 3, { temFoto: true, versao: 'EFCwork v0.6.15.3', app: 'efcwork' });
  await bg('b3', 3, 'bug', 'inspecoes', 'Foto do clorímetro não abre no celular antigo', 'No Moto G6 a foto fica carregando e não aparece.', 'analise', 'Carlos Lima', 6, { hist: [{ ts: ag(6), porNome: 'Carlos Lima', status: 'novo', texto: 'Enviado' }, { ts: ag(5), porNome: 'Joana Silva', status: 'analise', texto: 'Vou testar num aparelho igual' }] });
  await bg('b4', 4, 'sugestao', 'almox', 'Avisar quando o álcool 70% estiver acabando', 'Um aviso no sino quando chegar em 2 frascos.', 'novo', 'Zoe', 1);
  await bg('b5', 5, 'bug', 'documentos', 'Data do lançamento saiu um dia antes', 'Lancei a limpeza da caixa às 22 h e ficou com a data de ontem.', 'naoprocede', 'Jackson', 15, { hist: [{ ts: ag(15), porNome: 'Jackson', status: 'novo', texto: 'Enviado' }, { ts: ag(14), porNome: 'Joana Silva', status: 'naoprocede', texto: 'O lançamento foi feito no EFClaudian antigo (v2.80); no atual a data é a do aparelho' }] });
};
