/* EFCwork · ponte.js — Ponte 1 com o Vértice Docs (v0.6.22, a "v0.6.11" do plano de integração v2). Prefixo: pt.
   A caixa de troca (tools/contrato/efd-ponte.js, o MESMO arquivo do Vértice e do Sabiá) é do aparelho: nada passa pela nuvem.
   - Vértice → EFCwork: "Compartilhar com o Cwork" deixa {tipo:'documento', ficha, pdf, original?}. Aqui: confere com EFD.ficha e os
     limites, grava em Documentos › Impressos com o login de quem está aqui (o Vértice não tem login) e só então apaga da caixa
     (é assim que o Vértice sabe que foi "Recebido pelo Cwork"). Quem grava: Administrador e Líder (como Importar). Os outros
     veem o aviso e o documento espera na caixa (até 30 dias) para alguém que pode gravar.
   - EFCwork → Vértice: "Abrir no Vértice" deixa {tipo:'abrir', original, nomeArquivo, docId} e, quando vem de um envio, o
     {tipo:'resumo', docId, dados} com os dados do envio (dicionário do contrato). O Vértice abre na janela de dentro (janelas.js). */
const PT_APP = 'efcwork';
const ptTem = () => typeof EFDPonte !== 'undefined' && typeof indexedDB !== 'undefined';
Object.assign(S, { _ptOcupada: false, _ptDeNovo: false, _ptAvisados: {} });

CS_CARGAS.push(() => {
  if (!ptTem() || S._ptOuvindo) return; S._ptOuvindo = true;
  EFDPonte.ouvir(PT_APP, m => { if (m && m.oQue === 'documento') ptReceber(); });
  setTimeout(ptReceber, 1500); /* o que chegou com o EFCwork fechado (depois de ler os impressos da nuvem) */
});

async function ptReceber() {
  if (!ptTem() || !S.user) return;
  if (S._ptOcupada) { S._ptDeNovo = true; return; }
  S._ptOcupada = true;
  try {
    const l = (await EFDPonte.esperando(PT_APP)).filter(i => i.tipo === 'documento' && i.de === 'docs');
    for (const i of l) {
      if (!ipPode()) { if (!S._ptAvisados[i.pid]) { S._ptAvisados[i.pid] = 1; aviso('Chegou do Vértice "' + ((i.ficha && i.ficha.nome) || 'documento') + '". Só o Administrador ou o Líder grava em Impressos: ele espera no aparelho.'); } continue; }
      let r; try { r = await ptGrava(i); } catch (e) { console.error(e); r = { erro: svErro(e) }; }
      if (r && r.ok) { await EFDPonte.apagar(i.pid); aviso('Recebido do Vértice: ' + r.nome + ' (versão ' + r.rev + ').'); }
      else if (!S._ptAvisados[i.pid]) { S._ptAvisados[i.pid] = 1; aviso('Não deu para receber "' + ((i.ficha && i.ficha.nome) || 'documento') + '" do Vértice: ' + ((r && r.erro) || 'confira e envie de novo') + '.', 'erro'); }
    }
  } catch (e) { console.warn('ponte', e); }
  finally { S._ptOcupada = false; if (S._ptDeNovo) { S._ptDeNovo = false; setTimeout(ptReceber, 50); } }
}

/* grava o documento que veio do Vértice: pedaços primeiro, ficha depois (como Importar) */
async function ptGrava(i) {
  const f = i.ficha || {}, pdf = i.pdf, orig = i.original || null;
  const e0 = EFD.ficha(f); if (e0.length) return { erro: 'a ficha veio fora do combinado (' + e0[0] + ')' };
  if (!(pdf instanceof ArrayBuffer) || !pdf.byteLength) return { erro: 'faltou o PDF' };
  if (pdf.byteLength > IP_COPIA_MAX) return { erro: 'o PDF tem ' + ipTam(pdf.byteLength) + ' e o limite é ' + ipTam(IP_COPIA_MAX) };
  const info = ipPdfInfo(pdf); if (!info) return { erro: 'o arquivo não é um PDF válido' };
  const sha = await ipSha(pdf); if (f.pub && f.pub.sha256 && f.pub.sha256 !== sha) return { erro: 'o PDF chegou diferente do que o Vértice mandou' };
  const usaOrig = orig instanceof ArrayBuffer && orig.byteLength > 0 && orig.byteLength <= IP_ORIG_MAX;
  const d = S.ipDocs.find(x => x.id === f.id) || null;
  const entra = ipChars(pdf.byteLength) + (usaOrig ? ipChars(orig.byteLength) : 0), sai = d ? ipOcupa(d) : 0;
  if (ipEspaco() - sai + entra > IP_TETO) return { erro: 'os impressos passariam de 150 MB; mande para a lixeira o que não usa mais' };
  const ts = nowISO(), rev = d ? Math.max((d.rev || 0) + 1, f.rev || 1) : Math.max(1, f.rev || 1);
  const nome = String(f.nome || '').trim(), nomeArq = String(i.nomeArquivo || (orig && f.orig && f.orig.nomeArquivo) || (nome + '.xlsx')).replace(/[\\/:*?"<>|]+/g, '-').slice(0, 140);
  const ficha = Object.assign({}, d ? JSON.parse(JSON.stringify(d)) : {}, JSON.parse(JSON.stringify(f)), {
    v: 1, rev: rev, origem: 'docs', pasta: '', pastaNome: String(f.pastaNome || (d && d.pastaNome) || '').trim().slice(0, 40),
    criadoPorId: d ? d.criadoPorId : S.user.id, criadoPor: d ? d.criadoPor : S.user.nome, criadoEm: d ? d.criadoEm : ts,
    alteradoPorId: S.user.id, alteradoPor: S.user.nome, alteradoEm: ts, status: f.status === 'rascunho' ? 'rascunho' : 'vigente',
    cancelado: false, motivo: '', lixeiraEm: null });
  delete ficha.srv; delete ficha.fonteFoto; delete ficha.link;
  const p = f.pub || {};
  ficha.pub = { rev: rev, em: ts, porId: S.user.id, por: S.user.nome, formato: 'pdf', bytes: pdf.byteLength, partes: Math.ceil(ipChars(pdf.byteLength) / IP_PARTE), sha256: sha,
    paginas: Number.isInteger(p.paginas) && p.paginas > 0 ? p.paginas : info.paginas, papel: p.papel || 'A4', orient: p.orient || info.orient, preenche: p.preenche || 'nao', campos: Array.isArray(p.campos) ? p.campos : [] };
  if (usaOrig) {
    const fmt = /\.docx$/i.test(nomeArq) ? 'docx' : 'xlsx';
    ficha.orig = { formato: fmt, bytes: orig.byteLength, partes: Math.ceil(ipChars(orig.byteLength) / IP_PARTE), sha256: await ipSha(orig), nomeArquivo: nomeArq, rev: rev };
  } else ficha.orig = null;
  const e1 = EFD.ficha(ficha); if (e1.length) return { erro: e1[0] };
  await ipSobe(ficha.id, 'copia', rev, pdf);
  if (usaOrig) await ipSobe(ficha.id, 'orig', rev, orig);
  await Data.col('efd_docs').set(ficha.id, ficha);
  if (d) { if (d.pub) await ipEsvazia(d.id, 'copia', d.pub.rev, d.pub.partes); if (d.orig) await ipEsvazia(d.id, 'orig', d.orig.rev || d.rev, d.orig.partes); }
  Audit.log({ acao: d ? 'versao_impresso' : 'importar_impresso', entidade: 'impresso', entidadeId: ficha.id, resumo: 'Recebeu do Vértice Docs ' + (d ? 'a versão ' + rev + ' de ' : '') + (ficha.codigo ? ficha.codigo + ' ' : '') + nome + (orig && !usaOrig ? ' (só o PDF: o original passou de ' + ipTam(IP_ORIG_MAX) + ')' : '') });
  S.ipAparelho[ficha.id] = sha;
  if (d && typeof ktAvisaVersao === 'function') ktAvisaVersao(ficha, rev);
  return { ok: true, nome: nome, rev: rev };
}

/* EFCwork → Vértice: põe o arquivo (e o resumo do envio, se houver) na caixa e abre o Vértice na janela de dentro */
async function ptAbrirNoVertice(d, dados) {
  const buf = await ipArquivo(d, 'orig');
  if (dados && Object.keys(dados).length) await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'resumo', docId: d.id, dados: dados });
  const pid = await EFDPonte.por({ de: PT_APP, para: 'docs', tipo: 'abrir', original: buf, nomeArquivo: d.orig.nomeArquivo || ipNomeArq(d, 'xlsx'), docId: d.id });
  jnAbrir('docs', '#/abrir/' + pid);
  return pid;
}

/* os dados de um envio no dicionário do contrato (o Vértice mostra na janela de resumo, ao lado da ficha) */
function ptResumoEnvio(k, dd, d) {
  const l = typeof coLote === 'function' ? coLote(k) : [], lab = k.split('|').slice(1).join('|'), i = (typeof ktInfo === 'function' && ktInfo(lab)) || {}, rem = typeof ktRemetente === 'function' ? ktRemetente(dd.unid) : {}, o = {};
  const tx = (c, v) => { v = String(v == null ? '' : v).trim(); if (v) o[c] = v.slice(0, 300); };
  const so = a => Array.from(new Set(a.map(x => String(x || '').trim()).filter(Boolean)));
  tx('empresa.nome', rem.razao); tx('unidade.nome', rem.nome); tx('unidade.endereco', rem.end); tx('unidade.cidade', [rem.mun, rem.uf].filter(Boolean).join('/'));
  tx('lab.nome', i.nome || lab); tx('lab.endereco', i.end); tx('lab.cidade', [i.cidade, i.uf].filter(Boolean).join('/')); tx('lab.cep', i.cep); tx('lab.contato', i.contato); tx('lab.telefone', i.tel || i.telefone);
  const env = k.split('|')[0]; if (/^\d{4}-\d{2}-\d{2}$/.test(env)) o['envio.data'] = env;
  const cx = Number(dd.caixas), am = Number(dd.amostras); if (cx > 0) o['envio.caixas'] = cx; if (am > 0) o['envio.amostras'] = am;
  tx('coleta.analise', dd.analise); tx('coleta.ponto', dd.pontos); tx('coleta.os', so(l.map(c => c.os)).join(', ')); tx('coleta.coletor', so(l.map(c => c.coletor)).join(', '));
  const dias = so(l.map(c => /^\d{4}-\d{2}-\d{2}/.test(c.data || '') ? String(c.data).slice(0, 10) : '')); if (dias.length === 1) o['coleta.data'] = dias[0];
  tx('usuario.nome', S.user && S.user.nome); o['hoje.data'] = hojeISO(); o['hoje.hora'] = new Date().toTimeString().slice(0, 5);
  if (d) { tx('doc.codigo', d.codigo); if (d.rev) o['doc.rev'] = d.rev; }
  if (l.length) o['amostras[]'] = l.slice(0, 200).map((c, n) => { const r = { n: n + 1 }, p = (k2, v) => { v = String(v == null ? '' : v).trim(); if (v) r[k2] = v.slice(0, 120); };
    p('identificacao', c.identificacao || c.identif || coNome(c)); if (/^\d{4}-\d{2}-\d{2}/.test(c.data || '')) r.data = String(c.data).slice(0, 10); p('analise', c.analiseNome || c.sigla); p('ponto', coNome(c)); p('talhao', c.talhao); p('produto', c.cultura); return r; });
  /* o mesmo conferente do Vértice: o que não passa sai (o resto do resumo continua) */
  const prova = x => EFD.pedido({ v: 1, pid: 'p00000001', docId: (d && d.id) || 'd0000000', de: 'efcwork', copias: 1, criadoEm: '2026-01-01T00:00:00.000Z', dados: x });
  if (prova(o).length) Object.keys(o).forEach(c => { const um = {}; um[c] = o[c]; if (prova(um).length) delete o[c]; });
  return o;
}
