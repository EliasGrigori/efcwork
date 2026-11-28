/* EFCwork · impvt.js — Documentos › Impressos mostra os documentos do Vértice (v0.6.47). Prefixo: iv.
   Decisão do Elias de 27/11 06:59: todo documento mora só no Vértice; o Cwork guarda só a ligação.
   Respostas de 27/11 21:2x: importar PDF nos dois (aqui grava direto no Vértice); foto de papel vira PDF; os antigos
   (guardados no Cwork, efd_docs) ficam como estão e ganham o botão "Levar para o Vértice" na versão seguinte.
   - A lista vem da nuvem do Vértice (vtd_arquivos, pela porta da P4: quem salva lê tudo; os outros, as pastas liberadas).
   - PDF: ver, imprimir e baixar a versão atual (guardada no aparelho depois da primeira vez, como os impressos antigos).
   - Planilha e quadro: abrem no Vértice em modo documento (só a folha; escreve só nas células liberadas).
   - O PDF importado aqui vira um arquivo do tipo 'pdf' do Vértice (o mesmo formato que o Vértice grava: nucleo/pdf.js). */
Object.assign(S, { ivDocs: [], _ivLido: 0, _ivPrev: null });
const IV_PDF_MAX = 15 * 1024 * 1024; /* o mesmo limite do Vértice (nucleo/pdf.js) */
const IV_FMT = { pdf: 'PDF', planilha: 'Planilha', postits: 'Quadro', docx: 'Documento' };
const ivFmt = x => IV_FMT[x.tipo] || 'Arquivo';
const ivPode = () => { const u = typeof vtUsuario === 'function' ? vtUsuario() : null; return !!(u && u.salvar); };
const ivDe = id => S.ivDocs.find(x => x.id === id) || null;

/* lê a lista do Vértice (uma vez a cada 60 s, ou na hora com forca) */
/* a última lista fica no aparelho (por conta): sem internet os PDFs continuam na tabela e imprimem pelo que já foi guardado (revisor da v0.6.47) */
const ivChaveLista = () => 'efcwork:impressos-vertice:' + ((S.user && S.user.id) || '');
function ivDoAparelho() { if (S._ivDoAparelho) return; S._ivDoAparelho = true; try { const l = JSON.parse(localStorage.getItem(ivChaveLista()) || '[]'); if (Array.isArray(l) && !S.ivDocs.length) S.ivDocs = l; } catch (e) { /* sem lista guardada */ } }
async function ivLer(forca) {
  if (S._ivLendo || typeof vtNuvemListar !== 'function' || !vtUsuario()) return;
  ivDoAparelho();
  if (!forca && Date.now() - S._ivLido < 60000) return;
  S._ivLendo = true;
  const antes = JSON.stringify(S.ivDocs) + '|' + (S._ivErro || '');
  try {
    S.ivDocs = (await vtNuvemListar()).filter(x => x && x.status !== 'lixeira' && IP_PASTAS.indexOf(x.pasta) >= 0);
    S._ivLido = Date.now(); S._ivErro = '';
    try { localStorage.setItem(ivChaveLista(), JSON.stringify(S.ivDocs)); } catch (e) { /* aparelho cheio */ }
  } catch (e) { console.warn('impressos do Vértice', e); S._ivErro = svErro(e); S._ivLido = Date.now() - 45000; /* tenta de novo em 15 s, não a cada desenho (revisor) */ }
  finally {
    S._ivLendo = false;
    if (JSON.stringify(S.ivDocs) + '|' + (S._ivErro || '') === antes) return; /* nada mudou: não redesenha (antes, erro + desenho = leitura sem fim) */
    if (S.rota.area === 'documentos' && S.rota.aba === 'impressos' && !S.gv) render(); else if (S.gv && S._ivGv) gvDesenha();
  }
}
/* as linhas do Vértice, no mesmo formato das linhas da tabela dos impressos */
const ivLinhas = () => S.ivDocs.map(x => ({ id: 'vt:' + x.id, _vt: x, codigo: x.codigo || '', nome: x.nome || '(sem nome)', pastaNome: x.pasta, tipo: x.tipo, alteradoPor: x.alteradoPor || x.porNome || '', alteradoEm: x.em, rev: x.versao, status: 'vigente' }));

/* ---------- o PDF: lido da nuvem do Vértice uma vez e guardado no aparelho ---------- */
async function ivConteudo(pacote) {
  if (!pacote) return null;
  if (pacote.fmt === 'json') return JSON.parse(pacote.dados);
  if (pacote.fmt !== 'gzip' || typeof DecompressionStream !== 'function') throw new Error('Este aparelho não abre o formato deste PDF. Abra pelo Vértice.');
  const r = new Response(new Blob([new Uint8Array(ipBuf(pacote.dados))]).stream().pipeThrough(new DecompressionStream('gzip')));
  return JSON.parse(await r.text());
}
const ivChave = x => 'vt|' + x.id + '|' + x.versao;
async function ivPdf(x) {
  const ch = ivChave(x), aqui = await ipCache('readonly', ch); if (aqui) return aqui;
  if (!DEMO && navigator.onLine === false) throw new Error('Sem internet e este PDF ainda não está no aparelho.');
  const d = await vtNuvemLer(x.id); if (!d) throw new Error('Este documento não está mais no Vértice.');
  const c = await ivConteudo(d.pacote); if (!c || !c.pdf) throw new Error('O PDF não chegou inteiro. Tente de novo.');
  const buf = ipBuf(c.pdf);
  if ((c.bytes && buf.byteLength !== c.bytes) || (c.sha256 && await ipSha(buf) !== c.sha256)) throw new Error('O PDF chegou diferente do que foi guardado. Tente de novo.');
  await ipCache('readwrite', ch, buf);
  return buf;
}
/* sem acento no nome do arquivo baixado: o Chromium troca nome com acento por "download" (visto no teste) */
const ivNomeArq = x => ((x.codigo ? x.codigo + ' ' : '') + x.nome + ' v' + x.versao).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '').replace(/[\\/:*?"<>|]+/g, '-').trim() + '.pdf';

/* ---------- detalhe ---------- */
function ivAbre(id) { S._ivGv = id; S._ipGv = null; gvAbrir(() => ivGaveta(id)); }
function ivGaveta(id) {
  const x = ivDe(id); if (!x) { S._ivGv = null; return null; }
  const pdf = x.tipo === 'pdf', pode = ivPode();
  let c = '';
  if (pdf && ipVeNoApp()) c += '<p class="gv-h">Documento</p><div class="ip-prev" data-iv-prev="' + esc(x.id) + '"><span class="ip-prevm">Abrindo o PDF…</span></div>';
  else if (pdf) c += '<button type="button" class="ip-abrirpdf" data-act="iv-ver" data-id="' + esc(x.id) + '">' + ic('doc') + '<span><b>Ver o PDF</b><small>versão ' + esc(x.versao) + '</small></span>' + ic('externo') + '</button>';
  else c += lcAv('Abre no Vértice só com a folha deste documento: escreve só nas células liberadas e imprime. Nada é gravado.');
  c += gvCampos([['Pasta', x.pasta], ['Formato', ivFmt(x)], ['Editado por', x.alteradoPor || x.porNome || ''], ['Data', fmtD(diaLocal(x.em))], ['Versão', String(x.versao)], ['Guardado', 'No Vértice (nuvem)']]);
  if (pdf) c += '<div class="ip-bx"><button type="button" class="bt" data-act="iv-baixar" data-id="' + esc(x.id) + '">' + ic('baixar') + 'Baixar o PDF</button></div>';
  const vert = pode ? '<button type="button" class="bt" data-act="iv-vertice" data-id="' + esc(x.id) + '">' + ic('externo') + 'Abrir no Vértice</button>' : '';
  const troca = pode && pdf ? '<button type="button" class="bt ic-so" data-act="iv-trocar" data-id="' + esc(x.id) + '" title="Trocar pela versão nova" aria-label="Trocar pela versão nova">' + ic('lapis') + '</button>' : '';
  const pe = pdf ? vert + '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="iv-imprimir" data-id="' + esc(x.id) + '">' + ic('impressora') + 'Imprimir</button>'
    : vert + '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="iv-documento" data-id="' + esc(x.id) + '">' + ic('doc') + 'Abrir</button>';
  return { ico: pdf ? 'doc' : 'planilha', sub: [x.codigo, ivFmt(x), 'versão ' + x.versao].filter(Boolean).join(' · '), titulo: x.nome, pill: '<span class="pill ok">Vértice</span>', cabAcoes: troca, corpo: c, rodape: pe };
}
GV_DEPOIS.push(async g => {
  const box = g.querySelector('[data-iv-prev]'); if (!box) return;
  const x = ivDe(box.getAttribute('data-iv-prev')); if (!x) return;
  const poe = u => { box.innerHTML = '<iframe title="Prévia do PDF" src="' + esc(u) + '#toolbar=0&navpanes=0&view=FitH"></iframe>'; };
  if (S._ivPrev && S._ivPrev.ch === ivChave(x)) return poe(S._ivPrev.url);
  try {
    const buf = await ivPdf(x); if (!box.isConnected) return;
    if (S._ivPrev) URL.revokeObjectURL(S._ivPrev.url);
    S._ivPrev = { ch: ivChave(x), url: URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })) }; poe(S._ivPrev.url);
  } catch (e) { box.innerHTML = '<span class="ip-prevm">' + esc(e.message) + '</span>'; }
});

/* ---------- imprimir, ver, baixar, abrir ---------- */
async function ivImprimir(id) {
  const x = ivDe(id); if (!x || x.tipo !== 'pdf') return;
  let buf; try { buf = await ivPdf(x); } catch (e) { return aviso(e.message, 'erro'); }
  if (S._ipImp && S._ipImp.url && /^vt:/.test(S._ipImp.id)) { try { URL.revokeObjectURL(S._ipImp.url); } catch (e) { /* já liberado */ } } /* libera a impressão anterior (revisor) */
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
  Audit.log({ acao: 'imprimir_impresso', entidade: 'vtd_arquivo', entidadeId: x.id, resumo: 'Imprimiu ' + (x.codigo ? x.codigo + ' ' : '') + x.nome + ' (Vértice, versão ' + x.versao + ')' });
  if (!ipVeNoApp()) return ipAbrirFora(url, ivNomeArq(x));
  const v = $('#ip-imp'); if (v) v.remove();
  const fr = document.createElement('iframe'); fr.id = 'ip-imp'; fr.title = 'Impressão'; fr.className = 'ip-imp'; fr.src = url;
  return new Promise(ok => {
    let feito = false; const fim = () => { if (!feito) { feito = true; ok(); } };
    fr.onload = () => { setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { ipAbrirFora(url, ivNomeArq(x)); } fim(); }, 250); };
    document.body.appendChild(fr); S._ipImp = { id: 'vt:' + x.id, url: url }; setTimeout(fim, 8000);
  });
}
async function ivBaixar(id, abrir) {
  const x = ivDe(id); if (!x) return;
  try { const u = URL.createObjectURL(new Blob([await ivPdf(x)], { type: 'application/pdf' })); if (abrir) ipAbrirFora(u, ivNomeArq(x)); else ipSalvar(u, ivNomeArq(x)); setTimeout(() => URL.revokeObjectURL(u), 60000); } catch (e) { aviso(e.message, 'erro'); } /* libera a memória depois de 1 min (revisor) */
}
function ivDocumento(id, cheio) {
  const x = ivDe(id); if (!x || typeof jnAbrir !== 'function') return;
  if (cheio && !ivPode()) return;
  /* o PDF abre na página Documentos externos (recém-importado aqui, o Vértice ainda pode não ter baixado: revisor) */
  gvFechar(); jnAbrir('docs', cheio && x.tipo === 'pdf' ? '#/externos' : (cheio ? '#/arq/' : '#/documento/') + encodeURIComponent(x.id));
}

/* ---------- gravar um PDF no Vértice (importar aqui ou trocar pela versão nova) ---------- */
async function ivConteudoDe(a) {
  const u8 = new Uint8Array(a.buf);
  return { pdf: ipB64(a.buf), bytes: u8.length, sha256: await ipSha(a.buf), paginas: a.paginas || 1, orient: a.orient || 'retrato', origem: a.fmt === 'imagem' ? 'foto' : 'pdf', arquivo: String(a.nome || '').slice(0, 160) };
}
const ivPacote = c => { const t = JSON.stringify(c); return { fmt: 'json', dados: t, bytesOriginal: t.length, bytesFinal: t.length }; };
/* a = { buf, nome, fmt: 'pdf' | 'imagem', paginas, orient } (lido pelo formulário dos impressos) */
async function ivNovo(a, nome, codigo, pasta) {
  if (S._ivIndo) throw new Error('Ainda enviando o PDF anterior. Espere terminar.'); /* clique duplo num envio longo criava dois documentos (revisor) */
  S._ivIndo = true; try { return await ivNovo0(a, nome, codigo, pasta); } finally { S._ivIndo = false; }
}
async function ivNovo0(a, nome, codigo, pasta) {
  if (!ivPode()) throw new Error('Só o Administrador e o Líder ★ guardam documentos no Vértice.');
  if (IP_PASTAS.indexOf(pasta) < 0) throw new Error('Escolha uma das 5 pastas.');
  const ts = nowISO(), id = ipNovoId(), quem = { nome: S.user.nome, id: S.user.id };
  const ficha = { id: id, tipo: 'pdf', nome: nome, codigo: codigo || undefined, status: 'rascunho', rev: 0, pastaNome: pasta,
    criadoPor: quem.nome, criadoPorId: quem.id, criadoEm: ts, alteradoPor: quem.nome, alteradoPorId: quem.id, alteradoEm: ts, gravacao: 1, cancelado: false, motivo: '', lixeiraEm: null };
  if (!ficha.codigo) delete ficha.codigo;
  const r = await vtNuvemGravar({ ficha: ficha, pacote: ivPacote(await ivConteudoDe(a)) }, 0);
  if (!r || !r.ok) throw new Error('Não deu para guardar no Vértice. Tente de novo.');
  Audit.log({ acao: 'importar_impresso', entidade: 'vtd_arquivo', entidadeId: id, resumo: 'Importou no Vértice o PDF ' + (codigo ? codigo + ' ' : '') + nome + ' (' + pasta + ')' });
  S.ivDocs = S.ivDocs.concat([{ id: id, pasta: pasta, versao: r.versao, em: ts, porNome: quem.nome, nome: nome, tipo: 'pdf', status: 'rascunho', codigo: codigo || '', alteradoPor: quem.nome }]);
  await ipCache('readwrite', 'vt|' + id + '|' + r.versao, a.buf);
  ivLer(true);
  return id;
}
async function ivTrocar(id, a) {
  if (S._ivIndo) throw new Error('Ainda enviando o PDF anterior. Espere terminar.');
  S._ivIndo = true; try { return await ivTrocar0(id, a); } finally { S._ivIndo = false; }
}
async function ivTrocar0(id, a) {
  if (!ivPode()) throw new Error('Só o Administrador e o Líder ★ trocam o documento.');
  const d = await vtNuvemLer(id); if (!d) throw new Error('Este documento não está mais no Vértice.');
  const ts = nowISO(), ficha = Object.assign({}, d.ficha, { rev: (Number(d.ficha.rev) || 0) + 1, alteradoPor: S.user.nome, alteradoPorId: S.user.id, alteradoEm: ts, gravacao: (Number(d.ficha.gravacao) || 0) + 1 });
  const r = await vtNuvemGravar({ ficha: ficha, pacote: ivPacote(await ivConteudoDe(a)) }, d.versao);
  if (r && r.conflito) throw new Error('Alguém salvou este documento agora há pouco. Feche e abra de novo para ver a versão atual.');
  if (!r || !r.ok) throw new Error('Não deu para guardar no Vértice. Tente de novo.');
  Audit.log({ acao: 'versao_impresso', entidade: 'vtd_arquivo', entidadeId: id, resumo: 'Nova versão (' + r.versao + ') de ' + (ficha.nome || id) + ' no Vértice' });
  await ipCache('readwrite', 'vt|' + id + '|' + r.versao, a.buf);
  const x = ivDe(id); if (x) Object.assign(x, { versao: r.versao, em: ts, alteradoPor: S.user.nome });
  ivLer(true);
  return r.versao;
}

/* trocar pela versão nova: formulário curto (o arquivo é lido pelo mesmo leitor dos impressos: data-ip-arq) */
LC_FORM.ivTroca = f => {
  const x = ivDe(f.id) || { nome: '', versao: 0 };
  let c = lcMsg() + ipArqBl(f, 'arq', 'Arquivo novo (vira a versão ' + ((x.versao || 0) + 1) + ')', 'PDF ou a foto de um papel (JPG ou PNG)', '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png');
  return { ico: 'lapis', sub: 'Documentos › Impressos · Vértice', titulo: 'Trocar pela versão nova', corpo: c, rodape: lcPe('iv-troca-ok', 'Trocar') };
};
async function ivTrocaOk() {
  const f = S.fm; if (!f || f.k !== 'ivTroca') return;
  if (!f.arq) return lcErro('Escolha o arquivo.');
  if (f.arq.fmt !== 'pdf' && f.arq.fmt !== 'imagem') return lcErro('Aqui vai só PDF ou foto.');
  if (!lcTravar()) return;
  try { const v = await ivTrocar(f.id, f.arq); lcFim(); aviso('Versão ' + v + ' guardada no Vértice.'); }
  catch (e) { console.error(e); if (S.fm) S.fm._trava = 0; lcErro(e.message || svErro(e)); }
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="iv-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'iv-imprimir') ivImprimir(id);
  else if (a === 'iv-ver') ivBaixar(id, true);
  else if (a === 'iv-baixar') ivBaixar(id, false);
  else if (a === 'iv-documento') ivDocumento(id, false);
  else if (a === 'iv-vertice') ivDocumento(id, true);
  else if (a === 'iv-trocar') { if (!ivPode()) return; const vol = S.gv && !S.gvForm ? S.gv : null; lcAbrir({ k: 'ivTroca', id: id, arq: null }, vol ? () => gvAbrir(vol) : null); }
  else if (a === 'iv-troca-ok') ivTrocaOk();
});
