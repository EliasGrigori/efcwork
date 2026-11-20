/* apontamentos de exemplo para Relatórios › Apontamentos (v0.6.25). Uso: await p.evaluate(require(...)) */
module.exports = async () => {
  const h = hojeISO(), d = n => addDias(h, n), A = Data.col('sv2_apont'), F = Data.col('sv2_fotos');
  for (const x of S.apont.slice()) await A.update(x.id, { teste: true }); /* os apontamentos da demonstração saem da conta */
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 120; const g = cv.getContext('2d');
  const foto = (cor) => { g.fillStyle = cor; g.fillRect(0, 0, 160, 120); g.fillStyle = '#fff'; g.fillRect(40, 40, 80, 40); return cv.toDataURL('image/jpeg', .7); };
  await F.set('f1', { dataUrl: foto('#8a5a2b'), refTipo: 'apont', refId: 'a1', papel: 'antes' });
  await F.set('f2', { dataUrl: foto('#3a6b3a'), refTipo: 'apont', refId: 'a1', papel: 'depois' });
  await F.set('f3', { dataUrl: foto('#55607a'), refTipo: 'apont', refId: 'a3', papel: 'antes' });
  const ts = n => new Date(Date.now() + n * 864e5).toISOString();
  const ap = (id, n, setor, categoria, grav, status, extra) => A.set(id, Object.assign({ data: d(n), hora: '08:00', criadoEm: ts(n), porId: 'u1', porNome: 'Joana Silva', origem: 'rotina', setor, categoria, grav, gravOrig: grav,
    comunicado: true, obs: 'Observação do apontamento ' + id, risco: '', recom: '', fotos: [], fotosDepois: [], fotosOff: {}, status, resolucao: null, nc: null, hist: [] }, extra || {}));
  await ap('a1', -2, 'Packing House', 'residuos', 'media', 'resolvido', { obs: 'Sacola plástica no chão da linha 2', fotos: ['f1'], fotosDepois: ['f2'], resolucao: { texto: 'Recolhido e lixeira trocada', porNome: 'Marcos', ts: ts(-1) } });
  await ap('a2', -3, 'Packing House', 'residuos', 'baixa', 'aberto', { obs: 'Copo descartável perto da esteira' });
  await ap('a3', -1, 'Packing House', 'acidente', 'urgente', 'andamento', { obs: 'Piso molhado sem placa', risco: 'Queda', recom: 'Placa e rodo no local', fotos: ['f3'], nc: { responsavel: 'Marcos', prazo: d(-1), acao: 'Instalar placa fixa', fechada: false } });
  await ap('a4', -5, 'Campo', 'epi', 'grave', 'aberto', { obs: 'Aplicador sem luva', nc: { responsavel: 'Giovane', prazo: d(5), acao: 'Entregar luvas e orientar', fechada: false } });
  await ap('a5', -8, 'Campo', 'epi', 'media', 'resolvido', { obs: 'Sem bota', resolucao: { texto: 'Bota entregue', porNome: 'Giovane', ts: ts(-6) } });
  await ap('a6', -10, 'Oficina', 'quimicos', 'media', 'resolvido', { obs: 'Óleo derramado', origem: 'auditoria', auditoria: 'RNC 03', nc: { responsavel: 'Alex', prazo: d(-4), acao: 'Bandeja de contenção', fechada: true, verificacao: 'Conferido no local' }, resolucao: { texto: 'NC fechada: Conferido no local', porNome: 'Elias', ts: ts(-4) } });
  await ap('a7', -12, 'Almoxarifado', 'estrutura', 'baixa', 'nao_procede', { obs: 'Placa torta', resolucao: { texto: 'Já estava assim de propósito', porNome: 'Elias', ts: ts(-11) } });
  await ap('a8', -15, 'Refeitório', 'outro', 'baixa', 'aberto', { obs: 'Cadeira quebrada' });
  await ap('a9', -60, 'Campo', 'epi', 'media', 'resolvido', { obs: 'Fora do período de 30 dias', resolucao: { texto: 'ok', porNome: 'Giovane', ts: ts(-58) } });
};
