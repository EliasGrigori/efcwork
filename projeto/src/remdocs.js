/* EFCwork · remdocs.js — Documentos da remessa (v0.6.33). Prefixo: dr (o rd já é do Relatório de documentos).
   Pedidos do Elias (20/11 22:28, 23:05, 23:44 e 23:52): cada laboratório tem o rótulo do endereço (modelo dele, feito no Vértice;
   sem modelo, o rótulo do sistema) e a cadeia de custódia OU a ficha. Em "Papéis deste envio" (kit.js) ele marca o que sai; a planilha
   abre no Vértice com os dados da remessa (já preenchida se tiver campos efc_ marcados), que é o jeito mais preciso.
   - Aqui: a seção "Documentos da remessa" na gaveta (situação de cada papel), o pedido e a resposta com o Vértice (Ponte 2 dele) e a
     via assinada (foto reduzida ou PDF) na nuvem: sv2_rem_docs (o registro) e sv2_rem_arq (o arquivo, lido só ao abrir).
   - Revisor novo (20/11): a resposta só sai da caixa depois de gravada; sem internet não prende; arquivo e registro em lote; duas abas
     não se atrapalham (navigator.locks e leitura na hora); o pedido leva a versão do modelo.
   - Quem faz: quem tem acesso às Coletas e lança (coPode); regra [R6] no Firestore. Nada se apaga: tirar um anexo é marcar "removido". */
Object.assign(S, { drDocs: [] });
Object.assign(ICS, {
  clipe: '<path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l8-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  assina: '<path d="M3 20h18M5 16l9.5-9.5 3 3L8 19H5v-3zM13 8l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
});
const DR_ARQ_MAX = 900000, DR_PDF_MAX = 650000, DR_PEND = 'efcwork-dr-pedidos';

CS_CARGAS.push(() => {
  if (!coVe()) return;
  csOuve('sv2_rem_docs', l => { S.drDocs = l || []; if (S.gv) gvDesenha(); }, { order: 'em', limit: 800 });
  if (ptTem() && !S._drOuve) { S._drOuve = true; EFDPonte.ouvir(PT_APP, m => { if (m && m.oQue === 'resposta') drRespostas(); }); setTimeout(drRespostas, 1800); }
});

/* ---------- os papéis da remessa e em que pé estão ---------- */
const drLab = k => k.split('|').slice(1).join('|');
const drReg = (k, id) => S.drDocs.filter(x => x.k === k && x.item === id && !x.removido).sort((a, b) => String(b.em).localeCompare(String(a.em)));
const drPreenche = d => !!(d && (d.fonte === 'vertice' || (d.pub && d.pub.preenche === 'docs' && (d.pub.campos || []).length && d.orig && d.orig.formato === 'xlsx'))); /* v0.6.44: papel do Vértice sempre vai pelo pedido */
const drItens = k => ktPapItens(k).map(x => Object.assign({}, x, { exige: true }));
function drSit(k, x) {
  const r = drReg(k, x.id), ax = r.filter(y => y.tipo === 'foto' || y.tipo === 'pdf'), pr = r.find(y => y.tipo === 'preenchido'), im = r.find(y => y.tipo === 'impresso' || y.tipo === 'aberto');
  const u = ktUltimo(k), noKit = u && (u.itens || []).some(y => y.id === x.id);
  if (ax.length) return { t: x.papel === 'rotulo' ? 'Foto anexada' : 'Via assinada anexada', c: 'ok', n: 3, em: ax[0].em, por: ax[0].porNome, ax: ax };
  if (pr) return { t: 'Preenchido no Vértice', c: 'ok', n: 2, em: pr.em, por: pr.porNome, ax: [], pr: pr };
  if (im || noKit) return { t: im && im.tipo === 'aberto' ? 'Aberto no Vértice' : 'Impresso', c: '', n: 1, em: im ? im.em : u.em, por: im ? im.porNome : u.porNome, ax: [] };
  return { t: 'Falta', c: 'wa', n: 0, ax: [] };
}
const drFonte = x => typeof ktComo === 'function' ? ktComo(x) : '';
const drQuando = s => s.em ? fmtDT(s.em) + (s.por ? ' · ' + s.por : '') : '';

/* ---------- a seção na gaveta da remessa: OPÇÃO 2 aprovada (21/11, ITEM 178): etapas por papel ---------- */
function drSecao(k) {
  const it = drItens(k), pode = coPode();
  const l = it.map(x => Object.assign({}, x, { s: drSit(k, x) }));
  const prontos = l.filter(x => x.s.n >= 1).length, exig = l.length, conta = exig ? [prontos, exig].join(' de ') : '', pct = String(exig ? Math.round(prontos / exig * 100) : 100);
  let c = '<div class="dr">';
  const tit = '<p class="gv-h dr-h">Documentos da remessa' + (conta ? ' <small>' + esc(conta) + ' prontos</small>' : '') + '</p>';
  if (!l.length) return tit + '<p class="co-nada">Este laboratório não pede papéis.</p></div>';
  const acoes = x => pode ? '<span class="dr-ac">' + drBtImp(k, x) + drBtAnx(k, x) + '</span>' : '';
  const anexos = x => x.s.ax.length ? '<span class="dr-ax">' + x.s.ax.map(a => '<button type="button" class="dr-axb" data-act="dr-ver" data-id="' + esc(a.id) + '" title="Ver ' + esc(a.nome || '') + '">' + ic(a.tipo === 'pdf' ? 'doc' : 'imagem') + '<span>' + esc(fmtDT(a.em).slice(0, 5)) + '</span></button>').join('') + '</span>' : '';
  c += tit + '<div class="dr-l">' + l.map(x => { const p = !ktNoVertice(x) ? ['Imprimir', 'Via anexada'] : ['Abrir no Vértice', 'Imprimir', 'Via assinada'], at = x.s.n === 3 ? p.length : x.s.t === 'Aberto no Vértice' ? 1 : x.s.n >= 1 ? p.length - 1 : 0;
    return '<div class="dr-i" data-sit="' + esc(x.s.t) + '" title="' + esc(x.s.t + (x.s.em ? ' · ' + drQuando(x.s) : '')) + '"><span class="dr-t"><b>' + esc(x.nome) + '</b><span class="dr-et">' + p.map((e, n) => '<i class="' + (n < at ? 'on' : '') + '">' + esc(e) + '</i>').join('') + '</span>' + anexos(x) + '</span>' + acoes(x) + '</div>'; }).join('') + '</div>';
  return c + '</div>';
}
function drBtImp(k, x) {
  const v = typeof ktNoVertice === 'function' && ktNoVertice(x), t = x.id === KT_ROTULO ? 'Imprimir o rótulo' : v ? 'Abrir no Vértice com os dados da remessa' : 'Imprimir';
  return '<button type="button" class="bt ic-so" data-act="dr-imp" data-k="' + esc(k) + '" data-id="' + esc(x.id) + '" title="' + esc(t) + '" aria-label="' + esc(t) + '">' + ic(v ? 'assina' : 'impressora') + '</button>';
}
const drBtAnx = (k, x) => '<label class="bt ic-so" title="Anexar a via assinada (foto ou PDF)" aria-label="Anexar a via assinada">' + ic('clipe') + '<input type="file" accept="image/*,application/pdf" data-drfile data-k="' + esc(k) + '" data-id="' + esc(x.id) + '" hidden></label>';

/* ---------- sair um papel pela seção (o mesmo caminho da janela Papéis deste envio) ---------- */
function drDadosEnvio(k) {
  const u = ktUltimo(k); if (u && u.dados) return u.dados;
  const l = remLote(k), ans = Array.from(new Set(l.map(c => c.analiseNome || c.sigla).filter(Boolean))), pts = Array.from(new Set(l.map(c => remNomeAm(c)).filter(x => x && x !== '—')));
  return { amostras: String(l.length), caixas: '1', analise: ans.join(', '), pontos: pts.join(', '), obs: '', unid: ktUnidade(l) };
}
/* só o que o documento tem marcado: o Vértice recusa dado sem campo (campo-desconhecido) */
function drSoCampos(o, campos) {
  const ch = new Set((campos || []).map(c => c.chave)), lista = new Set((campos || []).filter(c => /\[\]\./.test(c.chave)).map(c => c.chave.split('.')[0])), r = {};
  Object.keys(o).forEach(k => { if (ch.has(k) || lista.has(k)) r[k] = o[k]; });
  return r;
}
async function drImp(k, id) {
  if (!coPode()) return; const x = drItens(k).find(y => y.id === id); if (!x) return;
  const dd = drDadosEnvio(k), lab = drLab(k);
  if (x.id === KT_ROTULO && !ktTemEnd(ktInfo(lab))) return aviso('Falta o endereço do laboratório (Envio › Laboratórios), ou anexe o modelo do rótulo feito no Vértice.', 'erro');
  if (x.id === KT_ROTULO && !ktRemOk(ktRemetente(dd.unid))) return aviso('Falta o endereço da unidade (remetente): Administração › Empresa.', 'erro');
  if (x.d && x.d.status === 'obsoleto') return aviso('Obsoleto não sai: ' + x.d.nome + '. Anexe a versão vigente ao kit.', 'erro');
  await ktSaiUm(k, x, dd);
  if (ktNoVertice(x) && !drPreenche(x.d)) drGrava({ k: k, item: x.id, nome: x.nome, tipo: 'aberto', docId: x.d.id, rev: x.d.rev });
}

/* ---------- pedido e resposta com o Vértice (caixa de troca do aparelho) ---------- */
const DR_VALIDADE = 30 * 864e5;
const drPendLe = () => { try { return JSON.parse(localStorage.getItem(DR_PEND) || '{}') || {}; } catch { return {}; } };
/* lê, muda e grava na hora (duas abas não apagam o pedido uma da outra); tira o que passou de 30 dias */
function drPendMuda(fn) { const p = drPendLe(), r = fn(p); Object.keys(p).forEach(id => { if (Date.now() - Date.parse(p[id].em || 0) > DR_VALIDADE) delete p[id]; }); try { localStorage.setItem(DR_PEND, JSON.stringify(p)); } catch {} return r; }
const drTrava = f => navigator.locks && navigator.locks.request ? navigator.locks.request('efcwork-dr', f) : f();
async function drPedido(k, x, dd, tent, pidVelho) {
  if (!ptTem()) return aviso('Este navegador não tem a caixa de troca com o Vértice: use Abrir no Vértice e preencha lá.', 'erro');
  /* v0.6.47 (trava pedida pelo Elias em 27/11 22:46): o papel que veio do Vértice ("Compartilhar com o Cwork", origem 'docs') é pedido como o
     papel ligado direto ao Vértice: sem conferir a versão compartilhada por ESTE aparelho (dava "O Cwork pediu a versão 10, mas a versão
     compartilhada daqui é a 9" quando a 10 foi compartilhada de outro aparelho). O Vértice usa a versão atual dele e só os campos marcados. */
  const d = x.d, vt = d.fonte === 'vertice', doVt = vt || d.origem === 'docs', dados = doVt ? ptResumoEnvio(k, dd, d) : drSoCampos(ptResumoEnvio(k, dd, d), d.pub.campos); /* v0.6.44: do Vértice vai tudo; ele usa só o que o documento tem marcado */
  const copias = Math.max(1, Math.min(20, x.copias === 'porCaixa' ? Number(dd.caixas) || 1 : Number(x.copias) || 1));
  const e = EFD.pedido({ v: 1, pid: 'p00000001', docId: d.id, de: 'efcwork', copias: copias, criadoEm: nowISO(), dados: dados });
  if (e.length) { console.error('pedido', e); return aviso('Não deu para montar o pedido ao Vértice: ' + e[0] + '.', 'erro'); }
  try {
    let pidA = '';
    if (tent && !vt) pidA = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: await ipArquivo(d, 'orig'), nomeArquivo: d.orig.nomeArquivo || ipNomeArq(d, 'xlsx'), docId: d.id });
    /* rev: o Vértice confere com a versão compartilhada daqui e recusa outra (controle de documentos) */
    /* v0.6.45: do Vértice, uma folha por material + análise (as folhas trocam o grupo e a lista de amostras) */
    const fl = doVt && dd.modo !== 'unificada' && dados._folhas && dados._folhas.length > 1 ? dados._folhas.slice(0, 50) : null; /* ITEM 285: "Tudo numa ficha só" manda uma folha com o resumo dos grupos */
    const pid = await EFDPonte.por(Object.assign({ de: PT_APP, para: 'docs', tipo: 'pedido', docId: d.id, copias: copias, dados: dados }, fl ? { folhas: fl } : {}, doVt ? { soMarcados: true } : { rev: d.rev }));
    drPendMuda(p => { p[pid] = { k: k, item: x.id, nome: x.nome, docId: d.id, rev: d.rev, copias: copias, dd: dd, dados: dados, tent: tent || 0, vt: vt ? 1 : 0, em: nowISO() }; });
    jnAbrir('docs', pidA ? '#/abrir/' + pidA : '#/pedido/' + pid, false, pidVelho && typeof jnAbaDaRota === 'function' ? jnAbaDaRota('#/pedido/' + pidVelho) : ''); /* v0.6.35: o mesmo documento pedido de novo volta para a aba dele */
    return pid;
  } catch (er) { console.error(er); aviso('Não deu para falar com o Vértice: ' + (er.message || er) + '.', 'erro'); }
}
const DR_ERRO = { 'campo-desconhecido': 'o modelo no Vértice deste aparelho não tem os campos que o Cwork mandou. Compartilhe o modelo de novo a partir do Vértice', 'nao-cabe': 'passaria do limite de folhas do Vértice', 'revisao-mudou': 'a versão do modelo no Vértice deste aparelho é outra da que está no Cwork. Compartilhe de novo a partir do Vértice' };
/* a resposta só sai da caixa DEPOIS de gravada (ou guardada na fila da nuvem); quem não lança deixa para quem lança */
function drRespostas() {
  if (!ptTem() || !S.user || !coPode() || S._drOcup) return; S._drOcup = true;
  return drTrava(async () => {
    const l = (await EFDPonte.esperando(PT_APP)).filter(i => i.tipo === 'resposta' && i.de === 'docs');
    for (const i of l) {
      const q = drPendLe()[i.pedido];
      if (!q) { await EFDPonte.apagar(i.pid); continue; }
      if (i.ok) {
        const id = 'pre_' + i.pedido, dj = JSON.stringify(q.dados || {});
        const ok = S.drDocs.some(x => x.id === id) || await drGrava({ k: q.k, item: q.item, nome: q.nome, tipo: 'preenchido', docId: q.docId, rev: q.rev, paginas: Number(i.paginas) || 0, copias: q.copias, dadosJson: dj.length <= 200000 ? dj : '' }, id);
        if (!ok) continue;
        aviso('Preenchido no Vértice: ' + q.nome + '.');
      } else if (i.erro === 'sem-documento' && q.vt) aviso('O Vértice deste aparelho ainda não tem ' + q.nome + ': abra o Vértice com internet para ele trazer da nuvem e peça de novo.', 'erro');
      else if (i.erro === 'sem-documento' && !q.tent) {
        const x = drItens(q.k).find(y => y.id === q.item);
        if (x && x.d) { aviso('O Vértice deste aparelho ainda não tinha o modelo de ' + q.nome + ': levei o modelo. Toque em "Ver e imprimir" quando ele avisar.'); await drPedido(q.k, x, q.dd, 1, i.pedido); }
      } else aviso('Não deu para preencher ' + q.nome + ': ' + (DR_ERRO[i.erro] || i.erro || 'o Vértice recusou') + '.', 'erro');
      await EFDPonte.apagar(i.pid); drPendMuda(p => { delete p[i.pedido]; });
    }
  }).catch(e => console.warn('dr', e)).finally(() => { S._drOcup = false; });
}

/* ---------- registro na nuvem ---------- */
/* sem internet a gravação fica na fila do aparelho e vai quando a rede voltar: não prende a tela */
const drEspera = pr => Promise.race([pr.then(() => true), new Promise(r => setTimeout(() => r(true), 5000))]);
async function drGrava(o, id) {
  const r = Object.assign({ v: 1, removido: false, porId: S.user.id, porNome: S.user.nome, em: nowISO() }, o);
  try { await drEspera(Data.col('sv2_rem_docs').set(id || uid(), r)); Audit.log({ acao: 'remessa_doc', entidade: 'remessa', entidadeId: r.k, resumo: ({ impresso: 'Imprimiu ', aberto: 'Abriu no Vértice ', preenchido: 'Preencheu no Vértice ', foto: 'Anexou a foto de ', pdf: 'Anexou o PDF de ' }[r.tipo] || '') + r.nome + ' · ' + ktRemNome(r.k) }); return true; }
  catch (e) { aviso('Não deu para guardar na nuvem: ' + svErro(e), 'erro'); return false; }
}
/* via assinada: foto reduzida (como o cupom, mais nítida) ou PDF pequeno */
function drReduz(arq) {
  return new Promise((ok, erro) => {
    const r = new FileReader(); r.onerror = () => erro(new Error('Não deu para ler a foto.'));
    r.onload = () => { const im = new Image(); im.onerror = () => erro(new Error('O arquivo não é uma imagem.')); im.onload = () => {
      let q = .8, lado = 2000, url = '';
      for (let n = 0; n < 8; n++) { const f = Math.min(1, lado / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * f); cv.height = Math.round(im.height * f); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); url = cv.toDataURL('image/jpeg', q); if (url.length < DR_ARQ_MAX - 20000) break; lado *= .85; q -= .05; }
      url.length < DR_ARQ_MAX ? ok(url) : erro(new Error('A foto ficou grande demais.')); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
/* o arquivo e o registro vão juntos (lote): ou entram os dois, ou nenhum */
async function drAnexa(k, id, arq) {
  if (!coPode() || !arq) return; const x = drItens(k).find(y => y.id === id); if (!x) return;
  const pdf = /pdf$/i.test(arq.type) || /\.pdf$/i.test(arq.name);
  try {
    let b64;
    if (pdf) { if (arq.size > DR_PDF_MAX) return aviso('O PDF tem ' + ipTam(arq.size) + ' e o limite é ' + ipTam(DR_PDF_MAX) + '. Tire uma foto da via assinada ou digitalize com menos resolução.', 'erro'); b64 = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => no(new Error('Não deu para ler o PDF.')); r.readAsDataURL(arq); }); if (!/^data:application\/pdf;base64,/.test(b64)) return aviso('O arquivo não é um PDF.', 'erro'); }
    else b64 = await drReduz(arq);
    aviso('Guardando na nuvem…');
    const aid = Data.novoId('sv2_rem_arq'), rid = Data.novoId('sv2_rem_docs'), ts = nowISO();
    const reg = { v: 1, removido: false, porId: S.user.id, porNome: S.user.nome, em: ts, k: k, item: x.id, nome: x.nome, tipo: pdf ? 'pdf' : 'foto', arqId: aid, bytes: b64.length };
    await drEspera(Data.lote([{ tipo: 'set', col: 'sv2_rem_arq', id: aid, dados: { b64: b64, porId: S.user.id, em: ts } }, { tipo: 'set', col: 'sv2_rem_docs', id: rid, dados: reg }]));
    DR_ARQ[aid] = b64; Audit.log({ acao: 'remessa_doc', entidade: 'remessa', entidadeId: k, resumo: 'Anexou ' + (pdf ? 'o PDF' : 'a foto') + ' de ' + x.nome + ' · ' + ktRemNome(k) });
    aviso('Anexado à remessa: ' + x.nome + '.');
  } catch (e) { aviso(e.message || svErro(e), 'erro'); }
}
const DR_ARQ = {};
function drArq(aid) { if (DR_ARQ[aid]) return Promise.resolve(DR_ARQ[aid]); return Data.col('sv2_rem_arq').get(aid).then(d => { const b = (d && d.b64) || ''; if (b) DR_ARQ[aid] = b; return b; }); }
async function drVer(id) {
  const r = S.drDocs.find(x => x.id === id); if (!r) return;
  let b; try { b = await drArq(r.arqId); } catch (e) { return aviso(svErro(e), 'erro'); }
  if (!b) return aviso('O arquivo não está na nuvem (ou ainda está subindo).', 'erro');
  const tira = r.porId === S.user.id || isSup(S.user) || isPrincipal(S.user);
  if (r.tipo === 'pdf') { try { const bin = atob(b.split(',')[1] || ''), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return ipAbrirFora(URL.createObjectURL(new Blob([u8], { type: 'application/pdf' })), r.nome + '.pdf'); } catch (e) { return aviso('O PDF guardado está com defeito.', 'erro'); } }
  if (!imgSrc(b)) return aviso('Não foi possível abrir a foto.', 'erro');
  const d = document.createElement('div'); d.id = 'co-fv'; d.className = 'co-fv dr-fv';
  d.innerHTML = '<img src="' + imgSrc(b) + '" alt="' + esc(r.nome) + '"><span class="dr-fvt">' + esc(r.nome + ' · ' + fmtDT(r.em) + ' · ' + (r.porNome || '')) + '</span><span class="dr-fva">' + (tira ? '<button type="button" class="bt ic-so" data-act="dr-tira" data-id="' + esc(r.id) + '" title="Tirar da remessa" aria-label="Tirar da remessa">' + ic('lixo') + '</button>' : '') + '<button type="button" class="bt ic-so" data-act="co-fv-x" aria-label="Fechar">' + ic('x') + '</button></span>';
  document.body.appendChild(d); csCamadaAbre('foto', () => { const x = $('#co-fv'); if (x) x.remove(); });
}
async function drTira(id) {
  const r = S.drDocs.find(x => x.id === id); if (!r || r.removido || !(r.porId === S.user.id || isSup(S.user) || isPrincipal(S.user))) return;
  try { await drEspera(Data.col('sv2_rem_docs').update(id, { removido: true, removidoEm: nowISO(), removidoPor: S.user.nome, removidoPorId: S.user.id })); Audit.log({ acao: 'remessa_doc_tirar', entidade: 'remessa', entidadeId: r.k, resumo: 'Tirou ' + (r.tipo === 'pdf' ? 'o PDF' : 'a foto') + ' de ' + r.nome + ' · ' + ktRemNome(r.k) }); history.back(); aviso('Tirado da remessa.'); }
  catch (e) { aviso(svErro(e), 'erro'); }
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="dr-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'dr-imp') drImp(t.getAttribute('data-k'), t.getAttribute('data-id'));
  else if (a === 'dr-ver') drVer(t.getAttribute('data-id'));
  else if (a === 'dr-tira') drTira(t.getAttribute('data-id'));
});
document.addEventListener('change', ev => {
  const t = ev.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-drfile')) return;
  const f = t.files && t.files[0]; t.value = ''; drAnexa(t.getAttribute('data-k'), t.getAttribute('data-id'), f);
});
