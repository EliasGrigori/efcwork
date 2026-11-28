/* Vértice Docs — a caixa de troca com o EFCwork no aparelho (contrato/efd-ponte.js, o mesmo arquivo do EFCwork).
   Só funciona no mesmo aparelho e no mesmo navegador (os dois apps moram em eliasgrigori.github.io). */
import Ponte from '../../contrato/efd-ponte.js';
import { ler, gravar } from '../nucleo/armazem.js';
import { pdfDasPaginas, imagensDasPaginas } from '../planilha/impressaoPdf.js';

export const temCaixa = () => typeof indexedDB !== 'undefined';
export const lerEstado = () => ler('ponte', {}) || {};
export function marcarEstado(id, e) { const m = { ...lerEstado() }; if (e) m[id] = e; else delete m[id]; gravar('ponte', m); return m; }

/** Põe o documento na caixa para o EFCwork; devolve o pid. */
export async function porNaCaixa(envio) {
  return Ponte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: envio.ficha, pdf: envio.pdf, ...(envio.original ? { original: envio.original, nomeArquivo: envio.nomeArquivo } : {}) });
}
/** O EFCwork apaga da caixa depois de gravar na nuvem: item que sumiu = recebido. Atualiza e devolve o mapa. */
export async function conferirRecebidos() {
  const m = lerEstado();
  let mudou = false;
  for (const [id, e] of Object.entries(m)) {
    if (e.estado !== 'caixa' || !e.pid) continue;
    try { if (!(await Ponte.pegar(e.pid))) { m[id] = { ...e, estado: 'recebido' }; mudou = true; } } catch { /* sem caixa */ }
  }
  if (mudou) gravar('ponte', m);
  return m;
}
export const esperandoAqui = () => Ponte.esperando('docs');
export const pegar = (pid) => Ponte.pegar(pid);
export const apagar = (pid) => Ponte.apagar(pid);
export const ouvir = (fn) => Ponte.ouvir('docs', fn);
/** v0.6.17 (Ponte 2): a resposta de um pedido de impressão ({ pedido: pid, ok, erro, paginas }).
    v0.6.84 (ITEM 184 do Cwork; acordo autorizado pelo Elias em 27/11 17:22, só acrescenta): com ok, vai também `como` ('imprimir' ou 'pdf')
    e o PDF da cópia preenchida (`pdf`, ArrayBuffer) até 650 KB, para o Cwork guardar na remessa; acima disso, `pdfFora: true` sem o PDF. */
export const PDF_VOLTA_MAX = 650000;
export function responder(item, { ok, erro, paginas = 0, como, pdf }) {
  const extra = {};
  if (ok && (como === 'imprimir' || como === 'pdf')) extra.como = como;
  const u = pdf instanceof ArrayBuffer ? new Uint8Array(pdf) : pdf; /* aceita ArrayBuffer ou Uint8Array (revisor) */
  if (ok && u && u.byteLength) { if (u.byteLength <= PDF_VOLTA_MAX) extra.pdf = u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength); else extra.pdfFora = true; }
  return Ponte.por({ de: 'docs', para: item.de, tipo: 'resposta', pedido: item.pid, ok: !!ok, ...(erro ? { erro } : {}), paginas, ...extra });
}
/** v0.6.84: o PDF da cópia preenchida para a resposta (se não der para montar, a resposta vai sem ele). */
export async function pdfDaResposta(paginas, titulo, feito) {
  if (feito) return feito;
  try { return pdfDasPaginas(paginas, { titulo, imagens: await imagensDasPaginas(paginas) }); } catch { return null; }
}
