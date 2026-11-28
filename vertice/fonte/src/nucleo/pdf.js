/* Vértice Docs v0.6.82 · PDF guardado no Vértice (decisão do Elias de 27/11 06:59: todo documento mora só no Vértice).
   O arquivo do tipo 'pdf' guarda no conteúdo o próprio PDF em base64 e o que se lê dele:
   { pdf, bytes, sha256, paginas, orient: 'retrato' | 'paisagem', origem: 'pdf' | 'foto', arquivo }
   O mesmo formato é gravado pelo Cwork quando o PDF é importado por lá (Documentos › Impressos).
   A foto de um papel vira PDF de uma página A4 (deitada se a foto for deitada), como o Cwork já fazia. */

export const PDF_MAX = 15 * 1024 * 1024; /* 15 MB: cabe com folga nos 200 pedaços da nuvem e no plano grátis */

export function paraB64(bytes) {
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
  return btoa(s);
}
export function deB64(b64) {
  const s = atob(String(b64 || '')), a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}
async function sha256(bytes) {
  const h = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(h)).map((x) => x.toString(16).padStart(2, '0')).join('');
}
const latim = (a) => { let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return s; };

/** Páginas e orientação de um PDF (null se não for PDF). */
export function infoPdf(bytes) {
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const t = latim(a);
  if (t.slice(0, 5) !== '%PDF-') return null;
  const pg = (t.match(/\/Type\s*\/Page(?![a-z])/g) || []).length || 1;
  const mb = /\/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/.exec(t);
  const deitado = mb ? (Number(mb[3]) - Number(mb[1])) > (Number(mb[4]) - Number(mb[2])) : false;
  return { paginas: Math.min(pg, 999), orient: deitado ? 'paisagem' : 'retrato' };
}

/** 'pdf' | 'foto' | '' */
export function tipoDoArquivo(f) {
  const n = String((f && f.name) || '').toLowerCase(), t = String((f && f.type) || '');
  if (/\.pdf$/.test(n) || t === 'application/pdf') return 'pdf';
  if (/\.(jpe?g|png|webp)$/.test(n) || /^image\/(jpeg|png|webp)$/.test(t)) return 'foto';
  return '';
}

/** Monta o conteúdo do arquivo a partir dos bytes do PDF. */
export async function conteudoDoPdf(bytes, { origem = 'pdf', arquivo = '' } = {}) {
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const info = infoPdf(a);
  if (!info) throw new Error('Este arquivo não é um PDF.');
  if (a.length > PDF_MAX) throw new Error('PDF grande demais (' + (a.length / 1048576).toFixed(1).replace('.', ',') + ' MB). O limite é 15 MB.');
  return { pdf: paraB64(a), bytes: a.length, sha256: await sha256(a), paginas: info.paginas, orient: info.orient, origem, arquivo: String(arquivo || '').slice(0, 160) };
}

/** Foto (JPG, PNG ou WEBP) → bytes de um PDF A4 de uma página, sem biblioteca. Só no navegador. */
export async function fotoParaPdf(f) {
  const url = URL.createObjectURL(f);
  try {
    const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Não deu para abrir a foto (use JPG ou PNG).')); i.src = url; });
    const lado = 2200, k = Math.min(1, lado / Math.max(im.naturalWidth, im.naturalHeight));
    const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
    const jpg = new Uint8Array(await (await fetch(c.toDataURL('image/jpeg', 0.85))).arrayBuffer());
    return pdfDeJpeg(jpg, w, h);
  } finally { URL.revokeObjectURL(url); }
}

/** JPEG (bytes, largura, altura) → PDF A4 de uma página. Separado para testar no node. */
export function pdfDeJpeg(jpg, w, h) {
  const dt = w > h, PW = dt ? 842 : 595, PH = dt ? 595 : 842, m = 24;
  const e = Math.min((PW - 2 * m) / w, (PH - 2 * m) / h), dw = +(w * e).toFixed(2), dh = +(h * e).toFixed(2);
  const x = +((PW - dw) / 2).toFixed(2), y = +((PH - dh) / 2).toFixed(2);
  const cmd = 'q ' + dw + ' 0 0 ' + dh + ' ' + x + ' ' + y + ' cm /Im0 Do Q', enc = (s) => new TextEncoder().encode(s), partes = [], pos = [];
  let tam = 0; const poe = (p) => { partes.push(p); tam += p.length; };
  poe(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 0xe2, 0xe3, 0xcf, 0xd3, 10])); /* %PDF-1.4 + linha binária */
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>', null,
    '<< /Length ' + cmd.length + ' >>\nstream\n' + cmd + '\nendstream'];
  objs.forEach((o, i) => {
    pos.push(tam);
    if (o) poe(enc((i + 1) + ' 0 obj\n' + o + '\nendobj\n'));
    else { poe(enc('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n')); poe(jpg); poe(enc('\nendstream\nendobj\n')); }
  });
  const xr = tam;
  poe(enc('xref\n0 6\n0000000000 65535 f \n' + pos.map((p) => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n'));
  const out = new Uint8Array(tam); let o = 0; partes.forEach((p) => { out.set(p, o); o += p.length; });
  return out;
}

/** Lê o arquivo escolhido (PDF ou foto) e devolve o conteúdo pronto para gravar. */
export async function conteudoDoArquivo(f) {
  const t = tipoDoArquivo(f);
  if (!t) throw new Error('Escolha um PDF ou a foto de um papel (JPG ou PNG).');
  const bytes = t === 'pdf' ? new Uint8Array(await f.arrayBuffer()) : await fotoParaPdf(f);
  return conteudoDoPdf(bytes, { origem: t, arquivo: f.name });
}

export const nomeSemExtensao = (n) => String(n || '').replace(/\.(pdf|jpe?g|png|webp)$/i, '').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);

/** Blob do PDF guardado no conteúdo (para ver, imprimir e baixar). */
export const blobDoPdf = (c) => new Blob([deB64(c && c.pdf)], { type: 'application/pdf' });
