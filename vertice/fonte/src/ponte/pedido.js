/* Vértice Docs — Ponte 2 (v0.6.17): do pedido do EFCwork às páginas prontas para imprimir.
   Preenche uma cópia em memória para cada folha, refaz as contas e monta as páginas pelo mesmo caminho do Imprimir. */
import { Motor } from '../planilha/motor.js';
import { normalizarPlanilha } from '../planilha/modelo.js';
import { normalizarImp } from '../planilha/impressao.js';
import { gerarImpressao } from '../planilha/imprimirLivro.js';
import { EFD } from './ponte.js';
import { camposDoLivro, preencher, conferirPedido, PAGINAS_MAX } from './campos.js';

/** As abas que saem no pedido: as visíveis que têm campo do Cwork marcado, na ordem do livro; sem nenhuma, a primeira visível. */
export function abasDoPedido(c, campos) {
  const visiveis = c.ordem.filter((id) => !c.abas[id].oculta), com = new Set((campos || []).map((x) => x.abaId));
  const l = visiveis.filter((id) => com.has(id));
  return l.length ? l : [visiveis[0] || c.ordem[0]];
}

/** arquivo: o que veio de banco.abrir (ou null). Devolve { erro, detalhe } ou { paginas, folhas, campos }. */
export function paginasDoPedido(item, arquivo, revAtual) {
  const serve = arquivo && arquivo.ficha.tipo === 'planilha' && arquivo.ficha.status !== 'lixeira';
  const c = serve ? normalizarPlanilha(arquivo.conteudo) : null;
  const r = conferirPedido(item, { c, revAtual });
  if (r.erro) return r;
  const { campos } = camposDoLivro(c);
  let paginas = [];
  const folhas = []; /* v0.6.80: o conteúdo preenchido de cada folha (para abrir e escrever à mão nas células liberadas) */
  for (const dados of r.folhas) {
    const { conteudo } = preencher(c, campos, dados);
    /* v0.6.81 (decisão do Elias, 27/11): sai só a aba com campos do Cwork marcados (uma aba "Instruções" não sai); sem nenhuma, a primeira aba */
    const abas = abasDoPedido(conteudo, campos), motor = new Motor(conteudo), pgs = [];
    let aviso = '';
    for (const abaId of abas) { const g = gerarImpressao(conteudo, motor, { imp: normalizarImp(conteudo.abas[abaId].imp), alvo: 'aba', abaId, nomeArquivo: arquivo.ficha.nome }); pgs.push(...g.paginas); aviso = aviso || g.aviso; }
    if (!pgs.length) return { erro: 'nao-cabe', detalhe: aviso || 'Não há nada para imprimir neste documento.' };
    folhas.push({ conteudo, abaId: abas[0], de: paginas.length, ate: paginas.length + pgs.length, titulo: [dados['grupo.material'], dados['grupo.analise']].filter(Boolean).join(' · ') });
    paginas = paginas.concat(pgs);
    if (paginas.length > PAGINAS_MAX) return { erro: 'nao-cabe', detalhe: `Passaria de ${PAGINAS_MAX} páginas: peça menos folhas ou diminua a área de impressão.` };
  }
  return { paginas, folhas: r.folhas.length, conteudos: folhas, campos: campos.length };
}

/** "Preencher e imprimir" a partir do resumo do envio: vale só o que o documento tem marcado (o resto fica no painel). */
export function pedidoDoResumo(resumo, conteudo) {
  const marcados = new Set(camposDoLivro(conteudo).campos.map((x) => x.lista || x.chave)), dados = {};
  for (const [k, v] of Object.entries(resumo.dados || {})) if (marcados.has(k) && k in EFD.CAMPOS) dados[k] = v;
  return { local: true, pid: 'plocal00', docId: resumo.docId, de: 'efcwork', copias: 1, criadoEm: new Date().toISOString(), dados, titulo: resumo.titulo || '' };
}
