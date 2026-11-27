/* Vértice Docs · modo documento (etapa 2, v0.6.76; decisões do Elias de 27/11 06:59 e 07:3x). Parte sem tela (testada no node).
   Aberto pelo Cwork, o documento é só a folha: na orientação do modelo, digitando só nas células liberadas
   (Revisão › Proteger planilha), e NADA é gravado: as mudanças vivem numa cópia em memória, só para imprimir. */
import { Motor } from './motor.js';
import { chave, lerChave, textoFaixa, lerEndereco, normalFaixa } from './ref.js';
import { estiloDe, mescladas, mesclaEm, paraGuardarValor, normalizarPlanilha, indiceEstilo } from './modelo.js';
import { lerEntrada } from './entrada.js';
import { validacaoEm, valorValido, mensagemDeErro, listaDaCelula, opcoesLista } from './regras.js';
import { celulaLivre } from './dados.js';
import { textoCelula } from './grade.js';
import { normalizarImp } from './impressao.js';
import { gerarImpressao, areaUsada } from './imprimirLivro.js';

/** "#/documento/<id>" ou "#/documento/<id>/<aba>" → { id, aba } (rota já sem o "#/"). */
export function rotaDoDocumento(rota) {
  const m = /^documento\/([^/]+)(?:\/(.+))?$/.exec(String(rota || ''));
  if (!m) return null;
  let aba = m[2] || '';
  try { aba = decodeURIComponent(aba); } catch { /* endereço torto: vale como veio */ }
  return { id: m[1], aba };
}

/** A aba pedida (pelo id ou pelo nome); sem pedido ou sem achar, a primeira visível. */
export function abaDoDocumento(c, pedida) {
  const visiveis = c.ordem.filter((id) => !c.abas[id].oculta);
  const p = String(pedida || '').trim().toLocaleLowerCase('pt-BR');
  return (p && visiveis.find((id) => id === pedida || c.abas[id].nome.toLocaleLowerCase('pt-BR') === p)) || visiveis[0] || c.ordem[0];
}

/** As células em que se pode escrever: liberadas no modelo e sem conta (a conta do modelo nunca é trocada). Chaves de aba.cel. */
export function camposLiberados(c, abaId) {
  const A = c.abas[abaId], ms = mescladas(A), out = new Set();
  for (const [k, cel] of Object.entries(A.cel || {})) {
    if (!celulaLivre(c, cel) || cel.f !== undefined) continue;
    const p = lerChave(k);
    if (!p) continue;
    const m = mesclaEm(ms, p.l, p.c);
    if (m && (m.l1 !== p.l || m.c1 !== p.c)) continue; /* parte escondida de uma mesclada */
    out.add(k);
  }
  return out;
}

/** O que aparece na caixa ao escrever: o texto como foi digitado; número e data como a folha mostra. */
export function textoDoCampo(c, motor, abaId, l, col) {
  const cel = c.abas[abaId].cel[chave(l, col)] || {};
  if (cel.v === undefined) return '';
  if (typeof cel.v === 'string') return cel.v;
  return String(textoCelula(motor, c, abaId, l, col).t || '').trim();
}

/** Opções da lista suspensa da célula (ou null quando a célula não tem lista). */
export function opcoesDoCampo(c, motor, abaId, l, col) {
  const regra = listaDaCelula(c.abas[abaId], l, col);
  if (!regra) return null;
  const r = opcoesLista(motor, c, abaId, regra, l, col);
  return r && r.itens && r.itens.length ? r.itens.map((x) => String(x.t)) : null;
}

/**
 * Escreve numa célula liberada. Devolve { conteudo } (cópia nova), { erro } (a regra da célula não deixa) ou
 * { conteudo, aviso } (a regra só avisa). Texto que começa com "=" entra como texto: aqui só se escreve.
 */
export function escreverNoDocumento(c, motor, abaId, l, col, texto) {
  const A = c.abas[abaId], k = chave(l, col);
  if (!camposLiberados(c, abaId).has(k)) return { erro: 'Esta célula não está liberada no modelo.' };
  const atual = A.cel[k], est = estiloDe(c, atual);
  const t = String(texto ?? '');
  let r = lerEntrada(t.startsWith('=') ? "'" + t : t, est.nf || 'General');
  if (r.zeroNaFrente) r = { v: r.zeroNaFrente }; /* 001 continua 001 */
  if (r.erro) return { erro: 'Não entendi o que foi escrito.' };
  let aviso = '';
  const regra = validacaoEm(A, l, col);
  if (!r.vazio && regra && regra.t !== 'any' && regra.me && !valorValido(motor, c, abaId, regra, l, col, r.v, t)) {
    const m = mensagemDeErro(regra);
    if (m.nivel === 'stop') return { erro: m.texto };
    aviso = m.texto;
  }
  const nova = { ...atual };
  delete nova.v; delete nova.da; delete nova.lg;
  if (!r.vazio) nova.v = paraGuardarValor(r.v);
  let estilos = c.estilos;
  if (r.nf && (!est.nf || /^general$/i.test(est.nf))) {
    /* data ou moeda digitada numa célula sem formato: ganha o formato, como na planilha */
    const x = indiceEstilo(estilos, { ...est, nf: r.nf });
    estilos = x.estilos; if (x.s) nova.s = x.s;
  }
  const conteudo = { ...c, estilos, abas: { ...c.abas, [abaId]: { ...A, cel: { ...A.cel, [k]: nova } } } };
  delete conteudo.calcExcel; /* mudou: as contas passam a ser as daqui, como no editor */
  return aviso ? { conteudo, aviso } : { conteudo };
}

/** A área da folha: a de impressão do modelo; sem ela, a área usada mais as células liberadas (mesmo vazias e sem borda). */
function impDoDocumento(c, motor, abaId, livres) {
  const imp = normalizarImp(c.abas[abaId].imp);
  if (imp.area && lerEndereco(imp.area)) return imp;
  const a = areaUsada(c, motor, abaId) || { l1: 0, c1: 0, l2: 0, c2: 0 };
  for (const k of livres) { const p = lerChave(k); if (p.l > a.l2) a.l2 = p.l; if (p.c > a.c2) a.c2 = p.c; }
  return { ...imp, area: textoFaixa(normalFaixa(a)) };
}

/**
 * As páginas da folha, como saem no papel (retrato ou paisagem do modelo). Cada página traz em .campos o lugar de cada
 * célula liberada ({ l, c, x, y, w, h, tam, al, qb }), nas medidas da própria página.
 */
export function paginasDoDocumento(c, abaId, nomeArquivo) {
  const motor = new Motor(c);
  const livres = camposLiberados(c, abaId);
  const g = gerarImpressao(c, motor, { imp: impDoDocumento(c, motor, abaId, livres), alvo: 'aba', abaId, nomeArquivo, editavel: (l, col) => livres.has(chave(l, col)) });
  return { paginas: g.paginas, aviso: g.aviso, motor, livres };
}

/** Prepara o arquivo guardado para o modo documento (sem tocar no que está no banco). */
export function abrirParaDocumento(arquivo, abaPedida) {
  if (!arquivo || arquivo.ficha.tipo !== 'planilha') return null;
  const conteudo = normalizarPlanilha(structuredClone(arquivo.conteudo));
  return { conteudo, abaId: abaDoDocumento(conteudo, abaPedida) };
}
