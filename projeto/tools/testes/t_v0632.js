/* EFCwork · v0.6.32 · Regras do Firestore. Uso: NODE_PATH=$(npm root -g) node -r /home/claude/work/ferr/preload.js tools/testes/t_v0632.js [index.html]
   O Simulador de regras do Firebase não roda aqui (download bloqueado). Este teste faz o que dá:
   1) confere o arquivo docs/REGRAS-FIRESTORE-EFCwork-v0.6.32-PROPOSTA.txt (só os blocos [R1] a [R5] mudaram, chaves e parênteses fechados);
   2) roda o app em demonstração e passa CADA gravação real das 4 coleções por uma cópia em JavaScript das condições novas (R2 a R5),
      com o perfil de quem está logado. Se o app fosse barrado pela regra nova, aparece aqui. NÃO prova a sintaxe nem o motor do Firebase. */
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const path = require('path'), fs = require('fs'), RAIZ = path.resolve(__dirname, '..', '..'), APP = process.argv[2];
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
(async () => {
  console.log('— arquivo de regras');
  const A = fs.readFileSync(path.join(RAIZ, 'docs/REGRAS-FIRESTORE-EFCwork-v0.6.20-COMPLETAS.txt'), 'utf8'), B = fs.readFileSync(path.join(RAIZ, 'docs/REGRAS-FIRESTORE-EFCwork-v0.6.32-PROPOSTA.txt'), 'utf8');
  const sem = t => t.split('\n').filter(l => !/\[R[1-5]\]/.test(l)).join('\n');
  const conta = (t, c) => t.split(c).length - 1;
  conf(['{', '}'].every(() => conta(B, '{') === conta(B, '}')) && conta(B, '(') === conta(B, ')'), 'chaves e parênteses fechados');
  for (const r of ['R1', 'R2', 'R3', 'R4', 'R5']) conf(conta(B, '[' + r + ']') >= 2, r + ' marcado no cabeçalho e no bloco');
  const linhasA = new Set(A.split('\n')), mud = B.split('\n').filter(l => !linhasA.has(l) && l.trim() && !/^\s*\/\//.test(l));
  conf(mud.length === 12, 'só as linhas das 5 regras mudaram (' + mud.length + ' linhas de regra novas; comentários fora)'); /* R1: 2 · R2: 1 · R3: 2 · R4: 1 + 3 · R5: 3 */
  conf(!/match \/sv2_rodizio[^}]*porSup/.test(B) && /match \/sv2_notifs/.test(B), 'rodízio e avisos ficam como estão (decisão na página)');

  console.log('— o app contra as condições novas (demonstração)');
  const br = await chromium.launch();
  const p = await abre(br, Object.assign({ raiz: RAIZ, w: 1280, h: 860, semente: true }, APP ? { url: 'file://' + path.resolve(APP) } : {})); await p.waitForTimeout(500);
  const erros = []; p.on('pageerror', e => erros.push(String(e)));
  /* espião: registra cada gravação com o perfil de quem gravou e a decisão do modelo das regras novas */
  await p.evaluate(() => {
    const lider = u => !!u && (['principal', 'principal_temp'].includes(u.perfil) || u.estrela === true), princ = u => !!u && ['principal', 'principal_temp'].includes(u.perfil);
    const lanca = u => !!u && u.perfil !== 'visitante';
    const muda = (antes, depois) => Object.keys(Object.assign({}, antes, depois)).filter(k => k !== 'id' && JSON.stringify((antes || {})[k]) !== JSON.stringify((depois || {})[k]));
    const R = {
      sv2_tarefas: (u, op, a, d) => op === 'create' ? (d.respId === u.id || (d.porId === u.id && lider(u))) : (lider(u) || ((d.respId || '') === (a.respId || '') && (d.porId || '') === (a.porId || '') && JSON.stringify(d.lideres || []) === JSON.stringify(a.lideres || []))),
      sv2_alm_itens: (u, op, a, d) => op === 'create' ? lider(u) : (lider(u) || (lanca(u) && muda(a, d).every(k => k === 'preco') && typeof d.preco === 'number' && d.preco >= 0)),
      sv2_aprov: (u, op, a, d) => op === 'create' || (a.status === 'pendente' && ((lider(u) && (a.paraIds || []).includes(u.id) && u.id !== a.solicitanteId) || princ(u))),
      sv2_bugs_seq: (u, op, a, d, id) => id === 'n' && Object.keys(d).every(k => ['id', 'ultimo', 'ts', 'porId'].includes(k)) && Number.isInteger(d.ultimo) && (!a || d.ultimo > (a.ultimo || 0)) && (princ(u) || d.ultimo <= ((a && a.ultimo) || 0) + 3)
    };
    window.__R = R; window.__G = []; const orig = Data.col.bind(Data);
    Data.col = name => { const c = orig(name); if (!R[name]) return c;
      const reg = async (op, id, antes, depois) => { const u = S.user; window.__G.push({ c: name, op, id, quem: u.nome, perfil: u.perfil + (u.estrela ? '★' : ''), ok: R[name](u, op, antes, depois, id) }); };
      return Object.assign({}, c, {
        set: async (id, o) => { const a = await c.get(id); await reg(a ? 'update' : 'create', id, a, Object.assign({ id }, o)); return c.set(id, o); },
        add: async o => { const id = await c.add(o); await reg('create', id, null, o); return id; },
        update: async (id, o) => { const a = await c.get(id); await reg('update', id, a, Object.assign({}, a, o)); return c.update(id, o); },
        seq: async (id, min) => { const a = await c.get(id); const n = Math.max(Number(a && a.ultimo) || 0, Number(min) || 0) + 1; await reg(a ? 'update' : 'create', id, a, { ultimo: n, ts: '', porId: '' }); return c.seq(id, min); }
      }); };
  });
  /* três pessoas: Joana (Administrador), Caio (Líder ★) e Marta (Colaboradora, liderada do Caio) */
  const QUEM = { principal: 'joana', lider: 'u-caio', colab: 'u-marta' };
  const quem = async k => p.evaluate(k => { const j = S.users.find(u => u.login === 'joana.silva'); const id = k === 'joana' ? j.id : k;
    S.user = Object.assign({}, S.users.find(u => u.id === id), { atrib: { coletas: true, almox: true, rateios: true, inspecoes: true, documentos: true } }); render(); }, QUEM[k]);
  const outro = () => 'u-marta';
  const tarefa = async resp => { await p.evaluate(r => { tfNova(); Object.assign(S.fm, { titulo: 'Conferir o pHmetro', resp: r || S.user.id }); tfEdOk(); }, resp); await p.waitForTimeout(500); };
  /* a demonstração só tem a Joana: põe dois colegas (Marta e Caio) */
  await p.evaluate(async () => { for (const [id, nome, login] of [['u-marta', 'Marta Rocha', 'marta.rocha'], ['u-caio', 'Caio Lima', 'caio.lima']]) { const u = { nome, login, perfil: 'secundario', estrela: id === 'u-caio', bloqueado: false, ativo: true, superiores: id === 'u-marta' ? ['u-caio'] : [], atrib: { coletas: true, almox: true, rateios: true, inspecoes: true, documentos: true } }; await Data.col('sv2_users').set(id, u); if (!S.users.some(x => x.id === id)) S.users.push(Object.assign({ id }, u)); } });
  await ir(p, 'inicio', 700);
  /* R4 */
  await quem('principal'); await tarefa(outro());
  await quem('lider'); await tarefa(outro());
  await quem('colab'); await tarefa(null);
  const gt = await p.evaluate(() => __G.filter(g => g.c === 'sv2_tarefas'));
  conf(gt.length === 3 && gt.every(g => g.ok), 'R4 · tarefas: Administrador e Líder ★ passando para outra pessoa e Colaborador para si passam: ' + gt.map(g => g.perfil + (g.ok ? ' ok' : ' BARRADO')).join(', '));
  conf(await p.evaluate(() => { const t = S.tarefas.slice(-3); return t.length === 3 && t.every(x => x.porId && x.porId === x.criadoPor); }), 'tarefa nova grava porId = quem criou (antes não gravava: a regra de hoje barraria o Líder ★ e o Administrador)');
  /* R3 */
  await quem('lider');
  await p.evaluate(() => lcAplicar({ acao: 'item_novo', refId: 'tst-item', dados: { nome: 'Luva nitrílica', unidade: 'par', ativo: true, preco: 1 } }, null)); await p.waitForTimeout(300);
  await quem('colab');
  await p.evaluate(() => Data.col('sv2_alm_itens').update('tst-item', { preco: 2.5 })); /* o que a Entrada grava quando o preço muda (lanca.js) */
  const gi = await p.evaluate(() => __G.filter(g => g.c === 'sv2_alm_itens'));
  conf(gi.length === 2 && gi.every(g => g.ok), 'R3 · material: Líder ★ cadastra e Colaborador só atualiza o preço: ' + gi.map(g => g.perfil + ' ' + g.op + (g.ok ? ' ok' : ' BARRADO')).join(', '));
  conf(await p.evaluate(() => !alSup()), 'o Colaborador não cadastra material direto no app (vira pedido)');
  /* R2 */
  await quem('colab');
  const aid = await p.evaluate(() => Aprov.pedir({ tipo: 'geral', titulo: 'Pedido de teste', descricao: '' }));
  const aid2 = await p.evaluate(() => Aprov.pedir({ tipo: 'geral', titulo: 'Pedido de teste 2', descricao: '' })); await p.waitForTimeout(300);
  await quem('lider'); await p.evaluate(id => Data.col('sv2_aprov').update(id, { status: 'aprovado', decisao: { por: S.user.id, nome: S.user.nome } }), aid);
  await quem('principal'); await p.evaluate(id => Data.col('sv2_aprov').update(id, { status: 'aprovado', decisao: { por: S.user.id, nome: S.user.nome } }), aid2);
  const ga = await p.evaluate(() => __G.filter(g => g.c === 'sv2_aprov'));
  conf(aid && aid2 && ga.length === 4 && ga.every(g => g.ok), 'R2 · pedido: a Colaboradora pede, o Líder ★ indicado decide um e o Administrador o outro: ' + ga.map(g => g.perfil + ' ' + g.op + (g.ok ? ' ok' : ' BARRADO')).join(', '));
  await quem('lider');
  conf(await p.evaluate(() => { const meu = { status: 'pendente', solicitanteId: S.user.id, paraIds: ['u-marta'] }, outroP = { status: 'pendente', solicitanteId: 'u-marta', paraIds: ['joana-x'] }; return !Aprov.podeDecidir(meu) && !Aprov.podeDecidir(outroP); }), 'R2 · no app, o Líder ★ não decide o próprio pedido nem o que não foi indicado para ele (a regra nova passa a cobrar o mesmo)');
  /* R5 */
  await quem('colab'); await p.evaluate(() => bsProximo()); await p.waitForTimeout(300);
  const gs = await p.evaluate(() => __G.filter(g => g.c === 'sv2_bugs_seq'));
  conf(gs.length >= 1 && gs.every(g => g.ok), 'R5 · número do relato pelo Colaborador sobe 1: ' + gs.map(g => g.perfil + (g.ok ? ' ok' : ' BARRADO')).join(', '));
  console.log('— as brechas do revisor ficam fechadas (no modelo)');
  const br2 = await p.evaluate(() => { const M = window.__R, col = { id: 'u-marta', perfil: 'secundario' }, cmum = { id: 'u-ana', perfil: 'secundario' };
    const t = { respId: 'u-marta', porId: 'u-marta', titulo: 'x' };
    return {
      repassa: M.sv2_tarefas(col, 'update', t, Object.assign({}, t, { respId: 'u-caio' })),
      aprovComum: M.sv2_aprov(cmum, 'update', { status: 'pendente', solicitanteId: 'u-marta', paraIds: ['u-ana'] }, {}),
      proprio: M.sv2_aprov({ id: 'u-caio', perfil: 'secundario', estrela: true }, 'update', { status: 'pendente', solicitanteId: 'u-caio', paraIds: ['u-caio'] }, {}),
      precoTexto: M.sv2_alm_itens(col, 'update', { preco: 1, nome: 'a' }, { preco: '1', nome: 'a' }),
      precoNeg: M.sv2_alm_itens(col, 'update', { preco: 1, nome: 'a' }, { preco: -1, nome: 'a' }),
      outroId: M.sv2_bugs_seq(col, 'update', { ultimo: 5 }, { ultimo: 6 }, 'x'),
      salto: M.sv2_bugs_seq(col, 'update', { ultimo: 5 }, { ultimo: 900 }, 'n') }; });
  conf(!br2.repassa, 'R4 · a Colaboradora não troca o responsável da própria tarefa para outra pessoa');
  conf(!br2.aprovComum && !br2.proprio, 'R2 · colega comum posto em paraIds não decide; o Líder ★ não decide o próprio pedido');
  conf(!br2.precoTexto && !br2.precoNeg, 'R3 · preço só número, 0 ou mais');
  conf(!br2.outroId && !br2.salto, 'R5 · só o contador n, sem salto grande');
  conf(erros.length === 0, 'sem erro de JavaScript: ' + erros.join(' | '));
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); await br.close(); process.exit(falhas ? 1 : 0);
})();
