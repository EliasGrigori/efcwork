/* semente de teste da Auditoria interna (v0.6.2): uma RNC parecida com a RNC-2026-03 do Elias, em ?demo=1 */
module.exports = (p, o) => p.evaluate(async o => {
  o = o || {};
  const C = Data.col.bind(Data), ts = new Date().toISOString(), hoje = hojeISO();
  const svg = (c1, c2) => 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="' + c1 + '"/><path d="M0 180 L100 100 L180 170 L240 130 L320 190 V240 H0Z" fill="' + c2 + '"/></svg>');
  const F = [svg('#9aa7b4', '#6f7d8c'), svg('#b9a88a', '#8c7a5c'), svg('#8fa58f', '#637a63'), svg('#b59aa0', '#8c6f76')];
  for (let i = 0; i < F.length; i++) await C('sv2_rnc_foto').set('f' + i, { rncId: 'r1', ncId: 'x', papel: 'antes', dataUrl: F[i], criadoEm: ts, porId: 'x', marcas: [] });
  const D = [['Josineldo', 'estrutura', 'CBR 01', 'Fiação com condutores desencapados', 'maior', [5, 4, 3]], ['Josineldo', 'estrutura', 'CBR 01', 'Matéria em desuso', 'media', [3, 3, 4]], ['Josineldo', 'estrutura', 'CBR 03', 'Fios desencapados à mostra', 'maior', [5, 2, 4]],
    ['Josineldo', 'estrutura', 'CBR 02', 'Reservatório sem cercado de proteção', 'media', [3, 2, 4]], ['Jackson', 'estrutura', 'Almoxarifado', 'Líquidos sobre pós', 'media', [3, 4, 2]], ['Jackson', 'estrutura', 'Packing House Novo', 'Pregos expostos', 'maior', [5, 4, 4]],
    ['Marcelo Bruno', 'campo', 'Placas dos talhões', 'Placas caídas, apagadas ou ausentes', 'media', [3, 3, 1]], ['Marcelo Bruno', 'campo', 'Refeitório', 'Lixo e bitucas ao lado do refeitório', 'media', [3, 3, 2]], ['Zoe', 'estrutura', 'Pátio de composto', 'Escoamento do chorume para o solo', 'maior', [5, 5, 3]], ['', 'campo', 'Pivô 09', 'Frente de trabalho sem abrigo contra intempéries', 'baixa', null]];
  const ncs = D.map((d, i) => ({ id: 'n' + (i + 1), n: i + 1, area: d[1], local: d[2], titulo: i === 6 ? 'Placa caída' : '', nc: d[3], leis: ['Global G.A.P. AF 3.' + (i + 1)], lei: 'Global G.A.P. AF 3.' + (i + 1), respId: '', respNome: d[0], ciente: i % 2 === 0, grav: d[4], obs: '', sug: i === 0 ? 'Trocar a fiação e isolar' : '', fotosAntes: i < 8 ? ['f' + (i % 4)] : [], coresp: i === 4 ? [{ id: '', nome: 'Josineldo' }] : [], trat: d[4] === 'baixa' ? 'direta' : 'analise', criadoEm: ts, porId: S.user.id, porNome: S.user.nome }));
  await C('sv2_rnc').set('r1', { numero: 'RNC-2026-03', tipo: 'Global G.A.P.', preparacao: '', auditorId: S.user.id, auditorNome: S.user.nome, acompanhante: '', data: hoje, prazo: addDias(hoje, 9), prazoHist: [], ncs: ncs, situacao: o.situacao || 'registro', criadoEm: ts, porId: S.user.id, porNome: S.user.nome });
  for (let i = 0; i < D.length; i++) { const g = D[i][5]; if (!g) continue; const c = auGutCalc(g[0], g[1], g[2]); await C('sv2_rnc_gut').set('n' + (i + 1), { rid: 'r1', ncId: 'n' + (i + 1), g: g[0], u: g[1], t: g[2], gut: c.v, faixa: c.fx, cancelada: false, porId: S.user.id, porNome: S.user.nome, em: ts, hist: [] }); }
  return ncs.length;
}, o);
