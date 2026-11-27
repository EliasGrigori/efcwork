/* Vértice Docs · etiquetas das amostras (v0.6.78, etapa 3, EM APROVAÇÃO; pedido do Elias de 27/11 11:3x:
   "automáticas igual ao do Claudian, senão eu perderia muito tempo editando cada campo", com vários tipos de etiqueta).
   O modelo é UMA etiqueta desenhada numa planilha da pasta Etiquetas, com as células marcadas por nome (efc_et_talhao…).
   - Cada amostra vira uma cópia do modelo com os dados dela (nada é gravado).
   - Nada se escreve na hora de imprimir (ITEM 279, 27/11 14:29: "melhor deixar bloqueado"; a observação vem do Cwork).
   - As etiquetas se repetem na folha do modelo (papel, orientação e margens da Configuração de página), da esquerda para
     a direita e de cima para baixo, com 3 mm entre elas quando cabe (para cortar).
   Parte sem tela (testada no node). */
import { Motor } from '../planilha/motor.js';
import { normalizarPlanilha, mescladas, mesclaEm } from '../planilha/modelo.js';
import { normalizarImp, PAPEIS, CM } from '../planilha/impressao.js';
import { gerarImpressao } from '../planilha/imprimirLivro.js';
import { chave } from '../planilha/ref.js';
import { faixaDoNome } from './campos.js';

/** Os campos que o Cwork preenche em cada etiqueta: os do catálogo das etiquetas do EFClaudian (ET_CAT). O cabeçalho fica escrito no
    próprio modelo do Vértice (ITEM 277, 27/11 14:29: um modelo por laboratório, se quiser). [chave, rótulo] */
export const CAMPOS_ETIQUETA = [
  ['material', 'Material'], ['analise', 'Análise'], ['cultura', 'Cultura'], ['variedade', 'Variedade'], ['talhao', 'Talhão'],
  ['profundidade', 'Profundidade'], ['data', 'Data da coleta'], ['hora', 'Hora da coleta'], ['responsavel', 'Responsável pela coleta'],
  ['estadio', 'Estádio fenológico'], ['semana', 'Semana'], ['laboratorio', 'Laboratório'], ['identificacao', 'Identificação da amostra'],
  ['rastreabilidade', 'Rastreabilidade'], ['os', 'O.S'], ['obs', 'Observações'], ['fertilizante', 'Fertilizante'], ['fabricacao', 'Data de fabricação'],
];
const SABIDOS = new Set(CAMPOS_ETIQUETA.map((x) => x[0]));
const ROT = Object.fromEntries(CAMPOS_ETIQUETA);
export const rotuloEtiqueta = (k) => ROT[k] || k;
export const nomeEtiqueta = (k) => 'efc_et_' + k;
export const ehNomeEtiqueta = (n) => /^efc_et_/i.test(String(n || ''));
export const ETIQUETAS_MAX = 600, FOLHAS_ETIQUETA_MAX = 50;
const VAO = 0.3 * CM; /* 3 mm entre as etiquetas, como na folha do EFClaudian */

/** As células marcadas da etiqueta: [{ campo, abaId, l, c }] (a de cima à esquerda do nome). Nome desconhecido fica de fora. */
export function camposDaEtiqueta(c) {
  const out = [];
  for (const n of Object.values((c && c.nomes) || {})) {
    const m = /^efc_et_([a-z]+)$/i.exec((n && n.n) || '');
    if (!m || !SABIDOS.has(m[1].toLowerCase())) continue;
    const f = faixaDoNome(c, n.ref);
    if (f) out.push({ campo: m[1].toLowerCase(), abaId: f.abaId, l: f.l1, c: f.c1 });
  }
  return out.sort((a, b) => a.l - b.l || a.c - b.c);
}

/* a âncora (de cima à esquerda) da mesclada em que a célula está */
const ancora = (c, abaId, l, col) => { const m = mesclaEm(mescladas(c.abas[abaId]), l, col); return m ? { l: m.l1, c: m.c1 } : { l, c: col }; };

const dataBr = (v) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v)); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v); };

/** Uma cópia do modelo com os dados de uma amostra. O modelo não muda. */
export function preencherEtiqueta(c, campos, dados) {
  const abas = { ...c.abas }, copiadas = new Set();
  const por = (abaId, l, col, t) => {
    if (!copiadas.has(abaId)) { abas[abaId] = { ...abas[abaId], cel: { ...abas[abaId].cel } }; copiadas.add(abaId); }
    const a = ancora(c, abaId, l, col), k = chave(a.l, a.c);
    const nova = { ...(abas[abaId].cel[k] || {}) }; delete nova.v; delete nova.f;
    if (t) nova.v = t;
    if (Object.keys(nova).length) abas[abaId].cel[k] = nova; else delete abas[abaId].cel[k];
  };
  for (const x of campos) {
    const v = dados && dados[x.campo];
    por(x.abaId, x.l, x.c, v == null || v === '' ? '' : String(x.campo === 'data' || x.campo === 'fabricacao' ? dataBr(v) : v).slice(0, 120));
  }
  const out = { ...c, abas }; delete out.calcExcel;
  return out;
}

/* desloca os traços de uma página (o desenho da etiqueta) para o lugar dela na folha */
function deslocar(ops, dx, dy) {
  const cl = (q) => (q ? { ...q, x: q.x + dx, y: q.y + dy } : q);
  return ops.map((o) => (o.k === 'line' ? { ...o, x1: o.x1 + dx, x2: o.x2 + dx, y1: o.y1 + dy, y2: o.y2 + dy } : { ...o, x: o.x + dx, y: o.y + dy, ...(o.clip ? { clip: cl(o.clip) } : {}) }));
}

/** O que o modelo diz, sem montar nada: { campos, abaId } ou { erro }. */
export function lerModeloEtiqueta(conteudo) {
  const c = normalizarPlanilha(conteudo), campos = camposDaEtiqueta(c);
  if (!campos.length) return { erro: 'Este modelo não tem nenhuma célula marcada como campo da etiqueta (Campos do Cwork › Etiqueta da amostra).' };
  return { c, campos, abaId: campos[0].abaId };
}

/**
 * As folhas de etiquetas: uma etiqueta por amostra, repetidas na folha do modelo. Devolve
 * { erro } ou { paginas: [{ W, H, ops, n }], porFolha, colunas, linhas, etiqueta: { w, h } } (medidas em pt).
 */
export function folhasDeEtiquetas(conteudo, amostras, { nomeArquivo = '' } = {}) {
  const m = lerModeloEtiqueta(conteudo);
  if (m.erro) return m;
  const { c, campos, abaId } = m;
  const lista = (Array.isArray(amostras) ? amostras : []).filter(Boolean);
  if (!lista.length) return { erro: 'Nenhuma amostra para etiquetar.' };
  if (lista.length > ETIQUETAS_MAX) return { erro: `São ${lista.length} etiquetas; o limite é ${ETIQUETAS_MAX} por vez.` };
  const imp = normalizarImp(c.abas[abaId].imp);
  /* a etiqueta sozinha: sem margem, sem cabeçalho e rodapé, no tamanho de verdade */
  const impUma = { ...imp, papel: 'oficio', orient: 'retrato', escala: { ...imp.escala, modo: 'nenhum', pct: 100 }, marg: { t: 0, b: 0, l: 0, r: 0, cab: 0, rod: 0 }, cab: { e: '', c: '', d: '' }, rod: { e: '', c: '', d: '' }, centH: false, centV: false, grade: false, titulos: false };
  const desenhos = [];
  for (const dados of lista) {
    const cc = preencherEtiqueta(c, campos, dados);
    const g = gerarImpressao(cc, new Motor(cc), { imp: impUma, alvo: 'aba', abaId, nomeArquivo });
    if (g.paginas.length !== 1) return { erro: g.paginas.length ? 'A etiqueta do modelo é maior que uma folha: diminua a área de impressão.' : (g.aviso || 'A etiqueta do modelo está vazia.') };
    desenhos.push(g.paginas[0]);
  }
  const { w, h } = desenhos[0].area;
  const p = PAPEIS[imp.papel] || PAPEIS.A4, [W, H] = imp.orient === 'paisagem' ? [p.h, p.w] : [p.w, p.h];
  const ml = imp.marg.l * CM, mr = imp.marg.r * CM, mt = imp.marg.t * CM, mb = imp.marg.b * CM;
  const uW = W - ml - mr, uH = H - mt - mb;
  const cabe = (u, t, g) => Math.floor((u + g + 0.5) / (t + g));
  const gx = cabe(uW, w, VAO) > 1 ? VAO : 0, gy = cabe(uH, h, VAO) > 1 ? VAO : 0;
  const colunas = Math.max(cabe(uW, w, gx), Math.floor((uW + 0.5) / w)), linhas = Math.max(cabe(uH, h, gy), Math.floor((uH + 0.5) / h));
  const vx = colunas === cabe(uW, w, gx) ? gx : 0, vy = linhas === cabe(uH, h, gy) ? gy : 0;
  if (colunas < 1 || linhas < 1) return { erro: 'A etiqueta não cabe na folha com estas margens: diminua as margens ou a etiqueta.' };
  const porFolha = colunas * linhas, n = Math.ceil(desenhos.length / porFolha);
  if (n > FOLHAS_ETIQUETA_MAX) return { erro: `Daria ${n} folhas; o limite é ${FOLHAS_ETIQUETA_MAX}.` };
  /* o bloco de etiquetas fica no meio da área útil */
  const bw = colunas * w + (colunas - 1) * vx, bh = linhas * h + (linhas - 1) * vy;
  const x0 = ml + (uW - bw) / 2, y0 = mt + (uH - bh) / 2;
  const paginas = [];
  desenhos.forEach((d, i) => {
    const f = Math.floor(i / porFolha), k = i % porFolha;
    if (!paginas[f]) paginas[f] = { W, H, ops: [], n: f + 1 };
    paginas[f].ops.push(...deslocar(d.ops, x0 + (k % colunas) * (w + vx) - d.area.x, y0 + Math.floor(k / colunas) * (h + vy) - d.area.y));
  });
  return { paginas, porFolha, colunas, linhas, etiqueta: { w, h } };
}

/**
 * O pedido de etiquetas que o Cwork entrega pela porta: { titulo, amostras: [{ id, docId, rotulo, dados }] }.
 * Agrupa por modelo, na ordem em que vieram. [{ docId, amostras: [...] }]
 */
export function gruposDoPedido(pedido) {
  const g = new Map();
  for (const a of (pedido && Array.isArray(pedido.amostras) ? pedido.amostras : [])) {
    if (!a || !a.docId) continue;
    if (!g.has(a.docId)) g.set(a.docId, { docId: String(a.docId), amostras: [] });
    g.get(a.docId).amostras.push({ id: String(a.id || ''), rotulo: String(a.rotulo || '').slice(0, 120), dados: a.dados && typeof a.dados === 'object' ? a.dados : {} });
  }
  return [...g.values()];
}
