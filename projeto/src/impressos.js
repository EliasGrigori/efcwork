/* EFCwork · impressos.js — Documentos › Impressos (v0.6.9). Prefixo: ip.
   Plano de integração v2, aprovado pelo Elias em 12/11/2026 13:51 (ITENS 1 a 12 e as 8 sugestões).
   - Tudo o que se imprime: PDF, foto (vira PDF aqui), Excel e Word (guardados como arquivo de reserva; a cópia de impressão é o PDF
     salvo pelo Excel/Word ou, depois, o que o Vértice Docs mandar) e link (só o endereço, sem arquivo).
   - Fichas no formato do Contrato EFD v1 (tools/contrato/efd-v1.js, o MESMO arquivo do Vértice): coleção efd_docs (id = ficha.id).
   - Plano grátis do Firebase (sem Storage): o arquivo vai em pedaços de até 900.000 caracteres em efd_partes
     ({docId, qual: 'copia'|'orig', rev, n, de, b64}). Cópia até 5 pedaços (~3,3 MB), original até 2 (~1,3 MB). Teto de 150 MB no total.
     Grava primeiro os pedaços e só depois a ficha: ninguém vê uma cópia pela metade. Versão nova ou lixeira esvaziam os pedaços antigos.
   - Cada aparelho baixa o arquivo uma vez e guarda (IndexedDB "efcwork-impressos"): depois imprime sem gastar leitura e sem internet.
   - Nunca depender só do app: Baixar (PDF e original) em cada papel e Reserva (ZIP de tudo, com a lista).
   - Papel obsoleto não imprime (sugestão 2). Quem cadastra: Administrador e Líder (como o catálogo de documentos). */
Object.assign(S, { ipDocs: [], ipAparelho: {}, _ipPrev: null });
const IP_PASTAS = ['Etiquetas', 'Fichas e custódias', 'Formulários', 'Fluxogramas', 'POPs e procedimentos'];
const IP_PARTE = 900000, IP_COPIA_PARTES = 5, IP_ORIG_PARTES = 2;
const IP_COPIA_MAX = Math.floor(IP_COPIA_PARTES * IP_PARTE * 3 / 4), IP_ORIG_MAX = Math.floor(IP_ORIG_PARTES * IP_PARTE * 3 / 4);
const IP_TETO = 150 * 1024 * 1024; /* caracteres guardados na nuvem (o banco grátis tem 1 GB para tudo) */
const IP_FMT = { pdf: 'PDF', imagem: 'Foto', xlsx: 'Excel', docx: 'Word', link: 'Link' };
const IP_VERTICE = 'https://eliasgrigori.github.io/EFCdocs/';

CS_CARGAS.push(() => {
  csOuve('efd_docs', l => { S.ipDocs = (l || []).filter(d => d && d.v === 1); if (S.rota.area === 'documentos' && S.rota.aba === 'impressos') render(); else if (S.gv && S._ipGv) gvDesenha(); }, { order: 'alteradoEm', limit: 600 });
});

/* ---------- quem pode, formato, situação ---------- */
const ipPode = () => isSup(S.user);
const ipVivos = () => S.ipDocs.filter(d => d.status !== 'lixeira');
const ipFmt = d => d.tipo === 'link' ? 'link' : d.tipo === 'planilha' ? 'xlsx' : d.tipo === 'docx' ? 'docx' : d.fonteFoto ? 'imagem' : 'pdf';
const ipFmtTxt = d => d.origem === 'docs' && d.tipo === 'postits' ? 'Quadro' : IP_FMT[ipFmt(d)] || 'PDF';
const ipPasta = d => String(d.pastaNome || '').trim() || 'Sem pasta';
function ipSit(d) {
  if (d.status === 'obsoleto') return ['Obsoleto', ''];
  if (d.tipo !== 'link' && !d.pub) return ['Sem cópia em PDF', 'wa'];
  return ['Vigente', 'ok'];
}
const ipPill = d => { const s = ipSit(d); return '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>'; };
const ipImprime = d => !!(d && d.pub && d.status === 'vigente');
const ipTam = b => !b ? '' : b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
const ipMB = c => (Math.ceil(c / 104857.6) / 10).toFixed(1).replace('.', ',') + ' MB';
const ipChars = b => Math.ceil((Number(b) || 0) / 3) * 4;
const ipOcupa = d => d.status === 'lixeira' ? 0 : (d.pub ? ipChars(d.pub.bytes) : 0) + (d.orig ? ipChars(d.orig.bytes) : 0);
const ipEspaco = () => S.ipDocs.reduce((s, d) => s + ipOcupa(d), 0);
const ipNovoId = () => 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1679616).toString(36).padStart(4, '0');
const ipNomeArq = (d, ext) => ((d.codigo ? d.codigo + ' ' : '') + d.nome + (d.rev ? ' v' + d.rev : '')).replace(/[\\/:*?"<>|]+/g, '-').trim() + '.' + ext;
const ipEhToque = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };
const ipVeNoApp = () => navigator.pdfViewerEnabled !== false && !ipEhToque();

/* ---------- bytes ---------- */
function ipB64(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
function ipBuf(b64) { const s = atob(b64), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }
async function ipSha(buf) { const h = await crypto.subtle.digest('SHA-256', buf); return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join(''); }
const ipLat = buf => { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return s; };
function ipPdfInfo(buf) {
  const t = ipLat(buf); if (t.slice(0, 5) !== '%PDF-') return null;
  const pg = (t.match(/\/Type\s*\/Page(?![a-z])/g) || []).length || 1;
  const mb = /\/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/.exec(t), deitado = mb ? (Number(mb[3]) - Number(mb[1])) > (Number(mb[4]) - Number(mb[2])) : false;
  return { paginas: Math.min(pg, 200), orient: deitado ? 'paisagem' : 'retrato' };
}
const ipLerArq = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error('Não deu para ler o arquivo.')); r.readAsArrayBuffer(f); });
/* foto → PDF de uma página A4 (deitada se a foto for deitada), JPEG embutido, sem biblioteca */
async function ipFotoPdf(f) {
  const url = URL.createObjectURL(f);
  try {
    const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Não deu para abrir a foto (use JPG ou PNG).')); i.src = url; });
    const lado = 2200, k = Math.min(1, lado / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
    const jpg = new Uint8Array(await (await fetch(c.toDataURL('image/jpeg', 0.85))).arrayBuffer());
    const dt = w > h, PW = dt ? 842 : 595, PH = dt ? 595 : 842, m = 24, e = Math.min((PW - 2 * m) / w, (PH - 2 * m) / h), dw = +(w * e).toFixed(2), dh = +(h * e).toFixed(2), x = +((PW - dw) / 2).toFixed(2), y = +((PH - dh) / 2).toFixed(2);
    const cmd = 'q ' + dw + ' 0 0 ' + dh + ' ' + x + ' ' + y + ' cm /Im0 Do Q', enc = s => new TextEncoder().encode(s), partes = [], pos = [];
    let tam = 0; const poe = p => { partes.push(p); tam += p.length; };
    poe(enc('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>', null, '<< /Length ' + cmd.length + ' >>\nstream\n' + cmd + '\nendstream'];
    objs.forEach((o, i) => {
      pos.push(tam);
      if (o) poe(enc((i + 1) + ' 0 obj\n' + o + '\nendobj\n'));
      else { poe(enc('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n')); poe(jpg); poe(enc('\nendstream\nendobj\n')); }
    });
    const xr = tam; poe(enc('xref\n0 6\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n'));
    const out = new Uint8Array(tam); let o = 0; partes.forEach(p => { out.set(p, o); o += p.length; });
    return { buf: out.buffer, orient: dt ? 'paisagem' : 'retrato' };
  } finally { URL.revokeObjectURL(url); }
}
function ipTipoArq(f) {
  const n = String(f.name || '').toLowerCase(), t = String(f.type || '');
  if (/\.pdf$/.test(n) || t === 'application/pdf') return 'pdf';
  if (/\.(jpe?g|png|webp)$/.test(n) || /^image\/(jpeg|png|webp)$/.test(t)) return 'imagem';
  if (/\.xlsx$/.test(n)) return 'xlsx';
  if (/\.docx$/.test(n)) return 'docx';
  if (/\.(xls|xlsm|xlsb|doc|odt|ods)$/.test(n)) return 'velho';
  return '';
}

/* ---------- guardado no aparelho (IndexedDB) ---------- */
function ipBanco() { return new Promise((ok, no) => { const r = indexedDB.open('efcwork-impressos', 1); r.onupgradeneeded = () => r.result.createObjectStore('arq'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); }
async function ipCache(modo, chave, val) {
  try {
    const db = await ipBanco();
    return await new Promise(ok => { const t = db.transaction('arq', modo), s = t.objectStore('arq'), q = modo === 'readonly' ? s.get(chave) : val === undefined ? s.delete(chave) : s.put(val, chave); let r = null; q.onsuccess = () => { r = q.result; }; t.oncomplete = () => { db.close(); ok(modo === 'readonly' ? r || null : true); }; t.onerror = t.onabort = () => { db.close(); ok(null); }; });
  } catch { return null; }
}
const ipChave = (d, qual) => { const m = qual === 'orig' ? d.orig : d.pub; return d.id + '|' + qual + '|' + (m && m.sha256 || ''); };
const ipParteId = (id, qual, rev, n) => id + '_' + (qual === 'orig' ? 'o' : 'c') + rev + '_' + n;
/* lê o arquivo: do aparelho; se não tem, da nuvem (pedaços), confere o SHA-256 e guarda */
async function ipArquivo(d, qual) {
  const m = qual === 'orig' ? d.orig : d.pub; if (!m) throw new Error('Este papel não tem ' + (qual === 'orig' ? 'arquivo de reserva.' : 'cópia em PDF.'));
  const ch = ipChave(d, qual), aqui = await ipCache('readonly', ch); if (aqui) { if (qual === 'copia') S.ipAparelho[d.id] = m.sha256; return aqui; }
  const rev = qual === 'orig' ? (m.rev || d.rev) : m.rev, ps = [];
  for (let n = 0; n < m.partes; n++) { const p = await Data.col('efd_partes').get(ipParteId(d.id, qual, rev, n)); if (!p || !p.b64) throw new Error('Faltam pedaços do arquivo na nuvem. Confira a internet e tente de novo.'); ps.push(p.b64); }
  const buf = ipBuf(ps.join(''));
  if (buf.byteLength !== m.bytes || await ipSha(buf) !== m.sha256) throw new Error('O arquivo chegou diferente do que foi guardado. Tente de novo.');
  await ipCache('readwrite', ch, buf); if (qual === 'copia') S.ipAparelho[d.id] = m.sha256;
  return buf;
}
async function ipNoAparelho(d) { if (!d.pub) return false; if (S.ipAparelho[d.id] === d.pub.sha256) return true; const x = await ipCache('readonly', ipChave(d, 'copia')); if (x) S.ipAparelho[d.id] = d.pub.sha256; return !!x; }
/* ao abrir a aba: baixa, um por vez, as cópias vigentes que este aparelho ainda não tem (para imprimir sem internet) */
async function ipPreBaixar() {
  if (S._ipBaixando || navigator.onLine === false) return; S._ipBaixando = true;
  try { for (const d of ipVivos().filter(ipImprime)) { if (await ipNoAparelho(d)) continue; try { await ipArquivo(d, 'copia'); } catch (e) { console.warn('impresso', d.id, e.message); } } }
  finally { S._ipBaixando = false; if (S.gv && S._ipGv) gvDesenha(); }
}

/* ---------- tela ---------- */
function ipGrupos(l) {
  const ps = Array.from(new Set(l.map(ipPasta))), ord = IP_PASTAS.filter(p => ps.indexOf(p) >= 0).concat(ps.filter(p => IP_PASTAS.indexOf(p) < 0 && p !== 'Sem pasta').sort(cmpTxt));
  if (ps.indexOf('Sem pasta') >= 0) ord.push('Sem pasta');
  return ord.map(p => [p, p]).concat([['\u0001obs', 'Obsoletos']]);
}
function ipTela() {
  const l = ipVivos().slice().sort((a, b) => cmpTxt(a.nome, b.nome) || cmpTxt(a.codigo, b.codigo)), esp = ipEspaco(), pct = esp / IP_TETO;
  const meta = ['<span>' + l.length + (l.length === 1 ? ' impresso' : ' impressos') + '</span>',
    pct >= 0.8 ? metaPl(ipMB(esp) + ' de 150 MB', pct >= 1 ? 'cr' : 'wa', 'alerta') : '<span title="Espaço que os impressos ocupam na nuvem (o banco grátis tem 1 GB para tudo)">' + ipMB(esp) + ' de 150 MB</span>'];
  const acoes = '<div class="ip-acs">' + (l.length ? '<button type="button" class="bt" data-act="ip-reserva" title="Baixar todos num arquivo ZIP">' + ic('caixa') + 'Reserva</button>' : '') +
    (ipPode() ? '<button type="button" class="bt" data-act="ip-importar">' + ic('mais') + 'Importar</button><a class="bt pr ip-vt" href="' + IP_VERTICE + '" target="_blank" rel="noopener" data-act="ip-vertice">' + ic('externo') + 'Novo no Vértice</a>' : '') + '</div>';
  let h = cabecalho({ titulo: 'Impressos', abaNome: 'Impressos', meta: meta, acoes: acoes });
  if (!l.length) return h + '<section class="pn"><div class="vazio">' + ic('impressora') + '<b>Nenhum impresso ainda.</b><span>' + (ipPode() ? 'Importe um PDF, uma foto, um arquivo do Excel ou do Word, ou um link. Fichas, custódias e formulários feitos no Vértice Docs também vão aparecer aqui.' : 'Quando o Administrador ou o Líder cadastrar fichas, custódias e formulários, eles aparecem aqui para imprimir.') + '</span></div></section>';
  setTimeout(ipPreBaixar, 600);
  return h + tbHTML({ id: 'ip-docs', titulo: 'Impressos', unidade: 'impressos', linhas: l, aoClicar: id => ipAbre(id),
    grupos: { v: d => d.status === 'obsoleto' ? '\u0001obs' : ipPasta(d), ordem: ipGrupos(l) }, busca: d => [d.codigo, d.nome, ipPasta(d), ipFmtTxt(d), d.alteradoPor].join(' '), vazio: 'Nenhum impresso com este filtro.',
    cols: [{ k: 'cod', rot: 'Código', v: d => d.codigo || '' }, { k: 'nome', rot: 'Nome', v: d => d.nome, cls: 'forte' }, { k: 'fmt', rot: 'Formato', v: ipFmtTxt },
      { k: 'por', rot: 'Editado por', v: d => d.alteradoPor || '' }, { k: 'em', rot: 'Data', tipo: 'data', v: d => diaLocal(d.alteradoEm) }, { k: 'rev', rot: 'Versão', tipo: 'num', v: d => d.tipo === 'link' ? null : d.rev || null },
      { k: 'st', rot: 'Situação', v: d => ipSit(d)[0], html: ipPill }] });
}
const ipTelaOrig = TELAS.documentos;
TELAS.documentos = aba => aba === 'impressos' ? ipTela() : ipTelaOrig(aba);

/* ---------- detalhe ---------- */
function ipAbre(id) { S._ipGv = id; gvAbrir(() => ipGaveta(id)); }
function ipGaveta(id) {
  const d = S.ipDocs.find(x => x.id === id); if (!d || d.status === 'lixeira') { S._ipGv = null; return null; }
  const f = ipFmt(d), link = d.tipo === 'link', p = d.pub, o = d.orig, aqui = p && S.ipAparelho[d.id] === p.sha256;
  if (p && !aqui) ipNoAparelho(d).then(x => { if (x && S.gv && S._ipGv === d.id) gvDesenha(); });
  let c = '';
  if (link) c += '<p class="gv-h">Endereço</p><p class="ip-link"><a href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.link) + '</a></p>';
  else if (p && ipVeNoApp()) c += '<p class="gv-h">Cópia de impressão</p><div class="ip-prev" data-ip-prev="' + esc(d.id) + '"><span class="ip-prevm">Abrindo o PDF…</span></div>';
  else if (p) c += '<button type="button" class="ip-abrirpdf" data-act="ip-ver" data-id="' + esc(d.id) + '">' + ic('doc') + '<span><b>Ver o PDF</b><small>' + p.paginas + (p.paginas === 1 ? ' página' : ' páginas') + ' · ' + ipTam(p.bytes) + '</small></span>' + ic('externo') + '</button>';
  if (d.status === 'obsoleto') c += lcAv('<b>Obsoleto:</b> este papel não imprime mais. Use a versão vigente.', 'cr');
  else if (!link && !p) c += lcAv('Ainda sem cópia em PDF: este papel não imprime daqui. Salve em PDF no ' + (f === 'docx' ? 'Word' : 'Excel') + ' e anexe (no lápis), ou abra no Vértice Docs.', 'wa');
  const rows = [['Pasta', ipPasta(d)], ['Formato', ipFmtTxt(d)], ['Editado por', d.alteradoPor || ''], ['Data', fmtD(diaLocal(d.alteradoEm))]];
  if (!link) rows.push(['Versão', String(d.rev || '')]);
  if (p) rows.push(['Cópia em PDF', p.paginas + (p.paginas === 1 ? ' página' : ' páginas') + ' · ' + ipTam(p.bytes) + (p.orient === 'paisagem' ? ' · deitada' : '')]);
  if (o) rows.push(['Arquivo de reserva', IP_FMT[o.formato] + ' · ' + ipTam(o.bytes)]);
  if (p) rows.push(['Guardado no aparelho', aqui ? 'Sim, imprime sem internet' : 'Ainda não']);
  rows.push(['Origem', d.origem === 'docs' ? 'Vértice Docs' : 'Importado aqui']);
  c += gvCampos(rows);
  /* baixar fica no corpo, lado a lado e do mesmo tamanho (no cabeçalho, 4 ícones espremiam o título) */
  if (p || o) c += '<div class="ip-bx">' + (p ? '<button type="button" class="bt" data-act="ip-baixar" data-id="' + esc(d.id) + '" data-q="copia">' + ic('baixar') + 'Baixar o PDF</button>' : '') +
    (o ? '<button type="button" class="bt" data-act="ip-baixar" data-id="' + esc(d.id) + '" data-q="orig">' + ic('baixar') + 'Baixar o ' + IP_FMT[o.formato] + '</button>' : '') + '</div>';
  const cab = (ipPode() ? '<button type="button" class="bt ic-so" data-act="ip-editar" data-id="' + esc(d.id) + '" title="Editar ou trocar o arquivo" aria-label="Editar">' + ic('lapis') + '</button>' : '');
  const vert = (d.tipo === 'planilha' || d.tipo === 'docx') && o ? '<button type="button" class="bt" data-act="ip-no-vertice" data-id="' + esc(d.id) + '">' + ic('externo') + 'Abrir no Vértice</button>' : '';
  const pe = link ? '<span class="au-pesp"></span><a class="bt pr" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + ic('externo') + 'Abrir o link</a>'
    : vert + '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="ip-imprimir" data-id="' + esc(d.id) + '"' + (ipImprime(d) ? '' : ' disabled') + '>' + ic('impressora') + 'Imprimir</button>';
  return { ico: link ? 'externo' : f === 'xlsx' ? 'planilha' : 'doc', sub: [d.codigo, ipFmtTxt(d), link ? '' : 'versão ' + d.rev].filter(Boolean).join(' · '), titulo: d.nome, pill: ipPill(d), cabAcoes: cab,
    lixeira: ipPode() ? { act: 'ip-lixo', id: d.id, titulo: 'Mandar para a lixeira' } : null, corpo: c, rodape: pe };
}
/* prévia do PDF dentro da gaveta (PC); o endereço temporário é solto quando a gaveta muda */
GV_DEPOIS.push(async g => {
  const box = g.querySelector('[data-ip-prev]'); if (!box) return;
  const d = S.ipDocs.find(x => x.id === box.getAttribute('data-ip-prev')); if (!d || !d.pub) return;
  if (S._ipPrev && S._ipPrev.ch === ipChave(d, 'copia')) { box.innerHTML = '<iframe title="Prévia do PDF" src="' + esc(S._ipPrev.url) + '#toolbar=0&navpanes=0&view=FitH"></iframe>'; return; }
  try {
    const buf = await ipArquivo(d, 'copia'); if (!box.isConnected) return;
    if (S._ipPrev) URL.revokeObjectURL(S._ipPrev.url);
    S._ipPrev = { ch: ipChave(d, 'copia'), url: URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })) };
    box.innerHTML = '<iframe title="Prévia do PDF" src="' + esc(S._ipPrev.url) + '#toolbar=0&navpanes=0&view=FitH"></iframe>';
    const dd = [...g.querySelectorAll('.gv-fl dt')].find(x => /Guardado no aparelho/.test(x.textContent)); if (dd && dd.nextElementSibling) dd.nextElementSibling.textContent = 'Sim, imprime sem internet'; /* passou a estar no aparelho */
  } catch (e) { box.innerHTML = '<span class="ip-prevm">' + esc(e.message) + '</span>'; }
});

/* ---------- imprimir, ver, baixar ---------- */
async function ipImprimir(id) {
  const d = S.ipDocs.find(x => x.id === id); if (!d) return;
  if (d.status === 'obsoleto') return aviso('Obsoleto: este papel não imprime mais. Use a versão vigente.', 'erro');
  if (!d.pub) return aviso('Este papel ainda não tem cópia em PDF.', 'erro');
  let buf; try { buf = await ipArquivo(d, 'copia'); } catch (e) { return aviso(e.message, 'erro'); }
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
  Audit.log({ acao: 'imprimir_impresso', entidade: 'impresso', entidadeId: d.id, resumo: 'Imprimiu ' + (d.codigo ? d.codigo + ' ' : '') + d.nome + ' (versão ' + d.rev + ')' });
  if (!ipVeNoApp()) { ipAbrirFora(url, ipNomeArq(d, 'pdf')); return; }
  const v = $('#ip-imp'); if (v) v.remove();
  const fr = document.createElement('iframe'); fr.id = 'ip-imp'; fr.title = 'Impressão'; fr.className = 'ip-imp'; fr.src = url;
  /* devolve quando a impressão foi chamada (o kit do envio imprime um papel depois do outro) */
  return new Promise(ok => {
    let feito = false; const fim = () => { if (!feito) { feito = true; ok(); } };
    fr.onload = () => { setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { ipAbrirFora(url, ipNomeArq(d, 'pdf')); } fim(); }, 250); };
    document.body.appendChild(fr); S._ipImp = { id: d.id, url: url }; setTimeout(fim, 8000);
  });
}
/* celular: o PDF abre no leitor do aparelho (de lá se imprime); se a aba nova for bloqueada, baixa */
function ipAbrirFora(url, nome) { const w = window.open(url, '_blank', 'noopener'); if (!w) ipSalvar(url, nome); }
function ipSalvar(url, nome) { const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); }
async function ipVer(id) { const d = S.ipDocs.find(x => x.id === id); if (!d) return; try { const buf = await ipArquivo(d, 'copia'); ipAbrirFora(URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })), ipNomeArq(d, 'pdf')); } catch (e) { aviso(e.message, 'erro'); } }
const IP_MIME = { pdf: 'application/pdf', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
async function ipBaixar(id, qual) {
  const d = S.ipDocs.find(x => x.id === id); if (!d) return;
  try { const buf = await ipArquivo(d, qual), ext = qual === 'orig' ? (d.orig.formato === 'imagem' ? 'jpg' : d.orig.formato) : 'pdf'; ipSalvar(URL.createObjectURL(new Blob([buf], { type: IP_MIME[ext] || 'application/octet-stream' })), qual === 'orig' && d.orig.nomeArquivo ? d.orig.nomeArquivo : ipNomeArq(d, ext)); }
  catch (e) { aviso(e.message, 'erro'); }
}
/* v0.6.9: até a ponte com o Vértice (v0.6.11), "Abrir no Vértice" baixa o arquivo e abre o Vértice numa aba nova */
async function ipNoVertice(id) {
  const d = S.ipDocs.find(x => x.id === id); if (!d || !d.orig) return;
  const w = window.open(IP_VERTICE, '_blank', 'noopener');
  await ipBaixar(id, 'orig');
  aviso(w ? 'O arquivo foi baixado. No Vértice Docs, abra o arquivo baixado para editar.' : 'O arquivo foi baixado. Abra o Vértice Docs e, nele, o arquivo baixado.');
}

/* ---------- Reserva: ZIP com todos (sem compressão, para abrir em qualquer computador) ---------- */
const IP_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const ipCrc = a => { let c = 0xFFFFFFFF; for (let i = 0; i < a.length; i++) c = IP_CRC[(c ^ a[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function ipZip(arqs) {
  const enc = new TextEncoder(), loc = [], cen = []; let off = 0;
  const dt = new Date(), dosT = (dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1), dosD = ((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate();
  arqs.forEach(a => {
    const nome = enc.encode(a.nome), dados = new Uint8Array(a.dados), crc = ipCrc(dados), h = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, dosT, 2], [12, dosD, 2], [14, crc, 4], [18, dados.length, 4], [22, dados.length, 4], [26, nome.length, 2], [28, 0, 2]].forEach(([p, v, n]) => n === 4 ? h.setUint32(p, v, true) : h.setUint16(p, v, true));
    loc.push(new Uint8Array(h.buffer), nome, dados);
    const c = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, dosT, 2], [14, dosD, 2], [16, crc, 4], [20, dados.length, 4], [24, dados.length, 4], [28, nome.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([p, v, n]) => n === 4 ? c.setUint32(p, v, true) : c.setUint16(p, v, true));
    cen.push(new Uint8Array(c.buffer), nome);
    off += 30 + nome.length + dados.length;
  });
  const tc = cen.reduce((s, x) => s + x.length, 0), fim = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, arqs.length, 2], [10, arqs.length, 2], [12, tc, 4], [16, off, 4], [20, 0, 2]].forEach(([p, v, n]) => n === 4 ? fim.setUint32(p, v, true) : fim.setUint16(p, v, true));
  return new Blob(loc.concat(cen, [new Uint8Array(fim.buffer)]), { type: 'application/zip' });
}
async function ipReserva() {
  if (S._ipReserva) return; const l = ipVivos(); if (!l.length) return;
  const total = l.reduce((s, d) => s + (d.pub ? d.pub.bytes : 0) + (d.orig ? d.orig.bytes : 0), 0);
  csConfirma({ titulo: 'Baixar a reserva de todos os impressos?', texto: l.length + ' impressos, cerca de ' + ipTam(total || 1) + '. O que este aparelho ainda não tem é lido da nuvem. Guarde o arquivo no computador ou no OneDrive.', sim: 'Baixar a reserva', nao: 'Agora não' }, async () => {
    S._ipReserva = true; aviso('Preparando a reserva…');
    const arqs = [], falhas = [], linhas = [['Pasta', 'Código', 'Nome', 'Formato', 'Situação', 'Versão', 'Editado por', 'Data', 'Arquivos'].join(';')], dir = s => String(s).replace(/[\\/:*?"<>|]+/g, '-');
    try {
      for (const d of l) {
        const fs = [], pasta = d.status === 'obsoleto' ? 'Obsoletos' : ipPasta(d);
        for (const q of ['copia', 'orig']) {
          if (!(q === 'copia' ? d.pub : d.orig)) continue;
          try { const buf = await ipArquivo(d, q), ext = q === 'orig' ? (d.orig.formato === 'imagem' ? 'jpg' : d.orig.formato) : 'pdf', nome = dir(pasta) + '/' + (q === 'orig' && d.orig.nomeArquivo ? dir(d.orig.nomeArquivo) : ipNomeArq(d, ext)); arqs.push({ nome: nome, dados: buf }); fs.push(nome); }
          catch (e) { falhas.push(d.nome); }
        }
        linhas.push([pasta, d.codigo || '', d.nome, ipFmtTxt(d), ipSit(d)[0], d.tipo === 'link' ? '' : d.rev, d.alteradoPor || '', fmtD(diaLocal(d.alteradoEm)), d.tipo === 'link' ? d.link : fs.join(' | ')].map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(';'));
      }
      arqs.unshift({ nome: 'LISTA.csv', dados: new TextEncoder().encode('﻿' + linhas.join('\r\n')).buffer });
      ipSalvar(URL.createObjectURL(ipZip(arqs)), 'efcwork-impressos-reserva-' + hojeISO() + '.zip');
      Audit.log({ acao: 'reserva_impressos', entidade: 'impresso', entidadeId: '', resumo: 'Baixou a reserva dos impressos (' + (arqs.length - 1) + ' arquivos)' });
      aviso(falhas.length ? 'Reserva baixada, mas ' + falhas.length + ' não vieram (sem internet?): ' + falhas.slice(0, 3).join(', ') + (falhas.length > 3 ? '…' : '') : 'Reserva baixada: ' + (arqs.length - 1) + ' arquivos e a lista.', falhas.length ? 'erro' : '');
    } finally { S._ipReserva = false; }
  });
}

/* ---------- importar, editar, nova versão ---------- */
function ipPastas() { return Array.from(new Set(IP_PASTAS.concat(ipVivos().map(d => String(d.pastaNome || '').trim()).filter(Boolean)))).sort((a, b) => (IP_PASTAS.indexOf(a) + 1 || 99) - (IP_PASTAS.indexOf(b) + 1 || 99) || cmpTxt(a, b)); }
function ipArqBl(f, campo, rot, dica, aceita) {
  const a = f[campo];
  return lcBl(rot, '<label class="ip-arq' + (a ? ' tem' : '') + '">' + ic(a ? (a.fmt === 'xlsx' ? 'planilha' : a.fmt === 'imagem' ? 'imagem' : 'doc') : 'mais') + '<span><b>' + esc(a ? a.nome : 'Escolher arquivo') + '</b><small>' + esc(a ? (IP_FMT[a.fmt] || '') + ' · ' + ipTam(a.bytes) + (a.fmt === 'imagem' ? ' · vira PDF de 1 página' : '') : dica) + '</small></span><input type="file" data-ip-arq="' + campo + '" accept="' + aceita + '" hidden></label>' +
    (a ? '<button type="button" class="bt ic-so ip-arqx" data-act="ip-arq-x" data-c="' + campo + '" title="Tirar o arquivo" aria-label="Tirar o arquivo">' + ic('x') + '</button>' : ''), '', 'ip-arqc');
}
LC_FORM.ipEd = f => {
  const d = f.id ? S.ipDocs.find(x => x.id === f.id) : null, link = d ? d.tipo === 'link' : f.modo === 'link', a = f.arq, planilha = a ? (a.fmt === 'xlsx' || a.fmt === 'docx') : d && !f.trocar && (d.tipo === 'planilha' || d.tipo === 'docx');
  const pastas = ipPastas();
  let c = lcMsg();
  if (!d) c += lcBl('O que vai importar', ddHTML('ip:modo', link ? 'link' : 'arq', [['arq', 'Arquivo: PDF, foto, Excel ou Word'], ['link', 'Link (só o endereço, sem arquivo)']]));
  if (link) c += lcBl('Endereço', lcIn('link', f.link, ' type="url" inputmode="url" placeholder="https://"'), 'abre numa aba nova; não ocupa espaço');
  else if (!d || f.trocar) {
    c += ipArqBl(f, 'arq', d ? 'Novo arquivo (vira a versão ' + ((d.rev || 0) + 1) + ')' : 'Arquivo', 'PDF, JPG, PNG, Excel (.xlsx) ou Word (.docx)', '.pdf,.jpg,.jpeg,.png,.webp,.xlsx,.docx,application/pdf,image/jpeg,image/png');
    if (planilha) c += ipArqBl(f, 'pdf', 'Cópia em PDF', 'opcional · salve em PDF no ' + (a && a.fmt === 'docx' ? 'Word' : 'Excel') + ' para já imprimir', '.pdf,application/pdf');
  } else if (d.tipo !== 'link') {
    c += '<div class="ip-atual"><span><b>Versão ' + d.rev + '</b><small>' + esc([ipFmtTxt(d), d.pub ? ipTam(d.pub.bytes) + ' em PDF' : 'sem cópia em PDF', d.orig ? ipTam(d.orig.bytes) + ' de reserva' : ''].filter(Boolean).join(' · ')) + '</small></span><button type="button" class="bt" data-act="ip-trocar">' + ic('mais') + 'Nova versão</button></div>';
    if (planilha && !d.pub) c += ipArqBl(f, 'pdf', 'Cópia em PDF', 'salve em PDF no ' + (d.tipo === 'docx' ? 'Word' : 'Excel') + ' para imprimir', '.pdf,application/pdf');
  }
  c += '<div class="fm-g">' + lcBl('Nome', lcIn('nome', f.nome, ' maxlength="120" placeholder="Ex.: Ficha de cotação · Laboratório A"')) + lcBl('Código', lcIn('codigo', f.codigo, ' maxlength="20" placeholder="opcional"')) + '</div>';
  c += '<div class="fm-g">' + lcBl('Pasta', ddHTML('ip:pasta', f.pasta, pastas.map(p => [p, p]).concat([['__outra', 'Outra pasta…']]))) +
    (d ? lcBl('Situação', ddHTML('ip:sit', f.sit, [['vigente', 'Vigente'], ['obsoleto', 'Obsoleto (não imprime)']])) : '<div></div>') + '</div>';
  if (f.pasta === '__outra') c += lcBl('Nome da pasta nova', lcIn('pastaNova', f.pastaNova, ' maxlength="40" placeholder="Ex.: Laudos-modelo"'));
  const esp = ipEspaco(); if (esp / IP_TETO >= 0.8) c += lcAv('Os impressos já ocupam ' + ipTam(esp) + ' dos 150 MB.', esp >= IP_TETO ? 'cr' : 'wa');
  return { ico: d ? 'lapis' : 'mais', sub: 'Documentos › Impressos', titulo: d ? (f.trocar ? 'Nova versão' : 'Editar impresso') : 'Importar impresso', corpo: c, rodape: lcPe('ip-ok', d ? 'Salvar' : 'Importar') };
};
DD_AO.ip = (k, v) => { const f = S.fm; if (!f) return; f.sujo = true; f.msg = ''; if (k === 'modo') f.modo = v; else if (k === 'pasta') f.pasta = v; else if (k === 'sit') f.sit = v; gvDesenha(true); };
document.addEventListener('change', async e => {
  const t = e.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-ip-arq') || !S.fm || S.fm.k !== 'ipEd' || !t.files || !t.files[0]) return;
  const campo = t.getAttribute('data-ip-arq'), arq = t.files[0], f = S.fm; t.value = '';
  let fmt = ipTipoArq(arq);
  if (fmt === 'velho') return lcErro('Este formato antigo não entra. No Excel ou no Word, use Salvar como .xlsx ou .docx (ou salve em PDF).');
  if (!fmt || (campo === 'pdf' && fmt !== 'pdf')) return lcErro(campo === 'pdf' ? 'Aqui vai só o PDF.' : 'Use PDF, JPG, PNG, Excel (.xlsx) ou Word (.docx).');
  try {
    let buf, orient = 'retrato', info = null, foto = null;
    if (fmt === 'imagem') { const r = await ipFotoPdf(arq); buf = r.buf; orient = r.orient; foto = arq; }
    else buf = await ipLerArq(arq);
    if (fmt === 'pdf' || fmt === 'imagem') { info = ipPdfInfo(buf); if (!info) return lcErro('Este arquivo não parece um PDF válido.'); if (fmt === 'pdf') orient = info.orient; if (buf.byteLength > IP_COPIA_MAX) return lcErro('O PDF tem ' + ipTam(buf.byteLength) + ' e o limite é ' + ipTam(IP_COPIA_MAX) + '. Reduza (salve em tamanho mínimo) ou guarde como link.'); }
    else if (buf.byteLength > IP_ORIG_MAX) return lcErro('O arquivo tem ' + ipTam(buf.byteLength) + ' e o limite do arquivo de reserva é ' + ipTam(IP_ORIG_MAX) + '. Salve em PDF e importe o PDF.');
    if (S.fm !== f) return;
    f[campo] = { buf: buf, nome: arq.name, bytes: buf.byteLength, fmt: fmt, orient: orient, paginas: info ? info.paginas : 0, foto: !!foto };
    if (campo === 'arq' && fmt !== 'xlsx' && fmt !== 'docx') f.pdf = null;
    if (campo === 'arq' && !String(f.nome || '').trim()) f.nome = arq.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 120);
    f.sujo = true; f.msg = ''; gvDesenha(true);
  } catch (er) { lcErro(er.message || 'Não deu para ler o arquivo.'); }
});
async function ipMeta(buf, info) { return { bytes: buf.byteLength, partes: Math.ceil(ipChars(buf.byteLength) / IP_PARTE), sha256: await ipSha(buf), paginas: info.paginas || 1, orient: info.orient || 'retrato' }; }
async function ipSobe(id, qual, rev, buf) {
  const b64 = ipB64(buf), n = Math.ceil(b64.length / IP_PARTE);
  for (let k = 0; k < n; k++) await Data.col('efd_partes').set(ipParteId(id, qual, rev, k), { docId: id, qual: qual, rev: rev, n: k, de: n, b64: b64.slice(k * IP_PARTE, (k + 1) * IP_PARTE), criadoEm: nowISO(), porId: S.user.id });
  await ipCache('readwrite', id + '|' + qual + '|' + await ipSha(buf), buf);
}
/* esvazia os pedaços de uma versão antiga (o Firestore do plano grátis cobra o espaço; nada é apagado de verdade, como no resto do app) */
async function ipEsvazia(id, qual, rev, partes) { for (let k = 0; k < (partes || 0); k++) { try { await Data.col('efd_partes').set(ipParteId(id, qual, rev, k), { docId: id, qual: qual, rev: rev, n: k, de: partes, b64: '', apagadaEm: nowISO() }); } catch (e) { console.warn(e); } } }
async function ipOk() {
  const f = S.fm; if (!f || !ipPode()) return;
  const d = f.id ? S.ipDocs.find(x => x.id === f.id) : null, link = !d ? f.modo === 'link' : d.tipo === 'link';
  const nome = String(f.nome || '').trim().replace(/\s+/g, ' '), codigo = String(f.codigo || '').trim().toUpperCase(), pasta = f.pasta === '__outra' ? String(f.pastaNova || '').trim() : f.pasta;
  if (!nome) return lcErro('Escreva o nome.');
  if (/[\\/:*?"<>|]/.test(nome)) return lcErro('O nome não pode ter \\ / : * ? " < > |');
  if (!pasta) return lcErro('Escreva o nome da pasta nova.');
  if (link && !/^https:\/\/\S{4,}$/.test(String(f.link || '').trim())) return lcErro('O endereço precisa começar com https://');
  const novo = !d || f.trocar, a = f.arq, pdfAnexo = f.pdf;
  if (!link && novo && !a) return lcErro('Escolha o arquivo.');
  const sit = d ? f.sit : 'vigente';
  /* espaço: o que entra menos o que sai */
  const entra = (a ? ipChars(a.bytes) : 0) + (pdfAnexo ? ipChars(pdfAnexo.bytes) : 0), sai = d && novo ? ipOcupa(d) : 0;
  if (entra && ipEspaco() - sai + entra > IP_TETO) return lcErro('Não cabe: os impressos passariam de 150 MB. Mande para a lixeira o que não usa mais, ou guarde este como link.');
  if (!lcTravar()) return;
  const ts = nowISO(), id = d ? d.id : ipNovoId(), rev = !d ? 1 : novo ? (d.rev || 0) + 1 : d.rev || 1;
  const ficha = Object.assign({ v: 1, id: id, cancelado: false, motivo: '', lixeiraEm: null, pasta: '', origem: 'efcwork', criadoPorId: S.user.id, criadoPor: S.user.nome, criadoEm: ts }, d ? JSON.parse(JSON.stringify(d)) : {}, {
    nome: nome, codigo: codigo, pastaNome: pasta, alteradoPorId: S.user.id, alteradoPor: S.user.nome, alteradoEm: ts, rev: link ? 1 : rev });
  delete ficha.srv;
  const pub = (buf, info) => ipMeta(buf, info).then(m => ({ rev: rev, em: ts, porId: S.user.id, por: S.user.nome, formato: 'pdf', bytes: m.bytes, partes: m.partes, sha256: m.sha256, paginas: m.paginas, papel: 'A4', orient: m.orient, preenche: 'nao', campos: [] }));
  try {
    const sobe = [];
    if (link) Object.assign(ficha, { tipo: 'link', link: String(f.link || '').trim(), pub: null, orig: null });
    else if (novo) {
      if (a.fmt === 'xlsx' || a.fmt === 'docx') {
        ficha.tipo = a.fmt === 'xlsx' ? 'planilha' : 'docx';
        ficha.orig = { formato: a.fmt, bytes: a.bytes, partes: Math.ceil(ipChars(a.bytes) / IP_PARTE), sha256: await ipSha(a.buf), nomeArquivo: a.nome.slice(0, 140), rev: rev };
        sobe.push(['orig', a.buf]);
        if (pdfAnexo) { ficha.pub = await pub(pdfAnexo.buf, pdfAnexo); sobe.push(['copia', pdfAnexo.buf]); } else ficha.pub = null;
      } else {
        ficha.tipo = 'externo'; ficha.pub = await pub(a.buf, a); sobe.push(['copia', a.buf]);
        ficha.orig = null; ficha.fonteFoto = a.fmt === 'imagem';
      }
    } else if (pdfAnexo && !d.pub) { ficha.pub = await pub(pdfAnexo.buf, pdfAnexo); ficha.pub.rev = d.rev; sobe.push(['copia', pdfAnexo.buf]); }
    ficha.status = sit === 'obsoleto' ? 'obsoleto' : (ficha.tipo === 'link' || ficha.pub) ? 'vigente' : 'rascunho';
    const erros = EFD.ficha(ficha); if (erros.length) { console.error('Contrato EFD', erros); if (S.fm) S.fm._trava = 0; return lcErro('Não deu para salvar: ' + erros[0] + '.'); }
    if (sobe.reduce((t, x) => t + x[1].byteLength, 0) > 400000) aviso('Enviando o arquivo…');
    for (const [q, buf] of sobe) await ipSobe(id, q, q === 'copia' ? ficha.pub.rev : rev, buf);
    await Data.col('efd_docs').set(id, ficha);
    if (d && novo) { if (d.pub) await ipEsvazia(d.id, 'copia', d.pub.rev, d.pub.partes); if (d.orig) await ipEsvazia(d.id, 'orig', d.orig.rev || d.rev, d.orig.partes); }
    Audit.log({ acao: !d ? 'importar_impresso' : novo ? 'versao_impresso' : 'editar_impresso', entidade: 'impresso', entidadeId: id, resumo: (!d ? 'Importou' : novo ? 'Nova versão (' + rev + ') de' : 'Editou') + ' o impresso ' + (codigo ? codigo + ' ' : '') + nome + (d && d.status !== ficha.status ? ' · ' + ipSit(ficha)[0].toLowerCase() : '') });
    if (ficha.pub) S.ipAparelho[id] = ficha.pub.sha256;
    if (d && novo && typeof ktAvisaVersao === 'function') ktAvisaVersao(ficha, rev); /* sugestão 1 (v0.6.10) */
    lcFim(); aviso(!d ? 'Impresso importado.' : novo ? 'Versão ' + rev + ' salva.' : 'Impresso salvo.');
  } catch (e) { console.error(e); if (S.fm) S.fm._trava = 0; lcErro(svErro(e)); }
}
function ipLixo(id) {
  const d = S.ipDocs.find(x => x.id === id); if (!d || !ipPode()) return;
  csConfirma({ titulo: 'Mandar "' + d.nome + '" para a lixeira?', texto: 'Some da lista e não imprime mais. O registro fica no histórico; os arquivos deixam de ocupar espaço na nuvem.', sim: 'Mandar para a lixeira', nao: 'Cancelar' }, async () => {
    try {
      await Data.col('efd_docs').update(d.id, { status: 'lixeira', lixeiraEm: nowISO(), alteradoPorId: S.user.id, alteradoPor: S.user.nome, alteradoEm: nowISO() });
      if (d.pub) await ipEsvazia(d.id, 'copia', d.pub.rev, d.pub.partes); if (d.orig) await ipEsvazia(d.id, 'orig', d.orig.rev || d.rev, d.orig.partes);
      Audit.log({ acao: 'lixeira_impresso', entidade: 'impresso', entidadeId: d.id, resumo: 'Mandou para a lixeira o impresso ' + (d.codigo ? d.codigo + ' ' : '') + d.nome });
      S._ipGv = null; gvFechar(); aviso('Mandado para a lixeira.');
    } catch (e) { aviso(svErro(e), 'erro'); }
  });
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-act^="ip-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm;
  const vol = S.gv && !S.gvForm ? S.gv : null, volta = vol ? () => gvAbrir(vol) : null;
  if (a === 'ip-importar') { if (!ipPode()) return; lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: '', codigo: '', pasta: IP_PASTAS[1], pastaNova: '', link: '', arq: null, pdf: null }, null); }
  else if (a === 'ip-editar') { const d = S.ipDocs.find(x => x.id === id); if (!d || !ipPode()) return; lcAbrir({ k: 'ipEd', id: d.id, nome: d.nome, codigo: d.codigo || '', pasta: ipPasta(d) === 'Sem pasta' ? IP_PASTAS[1] : ipPasta(d), pastaNova: '', sit: d.status === 'obsoleto' ? 'obsoleto' : 'vigente', link: d.link || '', arq: null, pdf: null, trocar: false }, volta); }
  else if (a === 'ip-trocar' && f) { f.trocar = true; f.sujo = true; gvDesenha(true); }
  else if (a === 'ip-arq-x' && f) { f[t.getAttribute('data-c')] = null; if (t.getAttribute('data-c') === 'arq') f.pdf = null; f.sujo = true; gvDesenha(true); }
  else if (a === 'ip-ok') ipOk();
  else if (a === 'ip-imprimir') ipImprimir(id);
  else if (a === 'ip-ver') ipVer(id);
  else if (a === 'ip-baixar') ipBaixar(id, t.getAttribute('data-q'));
  else if (a === 'ip-no-vertice') ipNoVertice(id);
  else if (a === 'ip-reserva') ipReserva();
  else if (a === 'ip-lixo') ipLixo(id);
});
