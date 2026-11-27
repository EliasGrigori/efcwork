/* v0.6.78 · etapa 3: etiquetas das amostras. Uma etiqueta desenhada no modelo, células marcadas efc_et_*, repetida na folha
   do modelo (papel, orientação e margens), uma por amostra; as células liberadas sem campo são "para preencher" (valem para todas). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planilhaVazia, normalizarPlanilha } from '../../src/planilha/modelo.js';
import { camposDaEtiqueta, preencherEtiqueta, folhasDeEtiquetas, gruposDoPedido, lerModeloEtiqueta } from '../../src/ponte/etiquetas.js';
import { camposDoLivro } from '../../src/ponte/campos.js';
import { fonteImpressao } from '../../src/planilha/imprimirLivro.js';
import { Motor } from '../../src/planilha/motor.js';

function modelo({ orient = 'paisagem', marg = 0.5 } = {}) {
  const c = planilhaVazia();
  c.estilos = [{}, { lib: true }];
  const A = c.abas.a1;
  A.nome = 'Etiqueta'; A.prot = 1;
  A.imp = { orient, papel: 'A4', marg: { t: marg, b: marg, l: marg, r: marg, cab: 0, rod: 0 }, area: 'A1:B5' };
  A.larg = { 0: 120, 1: 130 }; A.alt = { 0: 18, 1: 18, 2: 18, 3: 18, 4: 18 };
  A.cel = { A2: { v: 'TALHÃO:' }, A3: { v: 'DATA COLETA:' }, A4: { v: 'OBSERVAÇÕES:' }, B4: { s: 1 }, A5: { v: 'ANÁLISE:' } };
  A.cel.A1 = { v: 'CABEÇALHO DO MODELO' };
  c.nomes = { efc_et_talhao: { n: 'efc_et_talhao', ref: "'Etiqueta'!$B$2" }, efc_et_data: { n: 'efc_et_data', ref: "'Etiqueta'!$B$3" }, efc_et_analise: { n: 'efc_et_analise', ref: "'Etiqueta'!$B$5" }, efc_et_nada: { n: 'efc_et_nada', ref: "'Etiqueta'!$B$1" } };
  return normalizarPlanilha(c);
}
const am = (k) => Array.from({ length: k }, (_, i) => ({ talhao: 'T' + (i + 1), data: '2026-11-27', analise: 'Química' }));
const textos = (pg) => pg.ops.filter((o) => o.k === 'text').map((o) => o.t);

test('os campos da etiqueta: só os nomes conhecidos; não aparecem como "fora" nos campos do Cwork', () => {
  const c = modelo();
  assert.deepEqual(camposDaEtiqueta(c).map((x) => x.campo), ['talhao', 'data', 'analise']);
  assert.ok(!camposDoLivro(c).fora.some((n) => /^efc_et_/.test(n)));
});

test('preencher não muda o modelo; data em dd/mm/aaaa; o cabeçalho do modelo fica', () => {
  const c = modelo(), campos = camposDaEtiqueta(c);
  const p = preencherEtiqueta(c, campos, { talhao: 'T9', data: '2026-11-27' });
  assert.equal(p.abas.a1.cel.B2.v, 'T9'); assert.equal(p.abas.a1.cel.B3.v, '27/11/2026'); assert.equal(p.abas.a1.cel.A1.v, 'CABEÇALHO DO MODELO', 'o cabeçalho escrito no modelo fica (ITEM 277)');
  assert.equal(c.abas.a1.cel.B2, undefined, 'o modelo continua vazio');
});

test('repete na folha do modelo: A4 deitado, várias por folha, uma por amostra, na ordem', () => {
  const c = modelo(), r = folhasDeEtiquetas(c, am(14));
  assert.ok(!r.erro, r.erro);
  assert.ok(r.paginas[0].W > r.paginas[0].H, 'paisagem');
  assert.ok(r.colunas >= 2 && r.linhas >= 2);
  assert.equal(r.paginas.length, Math.ceil(14 / r.porFolha));
  const t = r.paginas.flatMap(textos).filter((x) => /^T\d+$/.test(x));
  assert.deepEqual(t, am(14).map((x) => x.talhao));
  assert.equal(r.paginas.flatMap(textos).filter((x) => x === 'TALHÃO:').length, 14, 'o desenho fixo sai em todas');
});

test('o papel do modelo manda: em pé cabem outras quantidades', () => {
  const d = folhasDeEtiquetas(modelo(), am(3)), e = folhasDeEtiquetas(modelo({ orient: 'retrato' }), am(3));
  assert.ok(e.paginas[0].H > e.paginas[0].W);
  assert.notEqual(d.colunas, e.colunas);
});

test('erros claros: sem campo marcado, sem amostra, margem que não deixa caber', () => {
  const c = modelo(); c.nomes = {};
  assert.match(lerModeloEtiqueta(c).erro, /nenhuma célula marcada/);
  assert.match(folhasDeEtiquetas(modelo(), []).erro, /Nenhuma amostra/);
  assert.match(folhasDeEtiquetas(modelo({ marg: 13 }), am(1)).erro, /não cabe/);
});

test('o pedido do Cwork agrupa por modelo, na ordem em que veio', () => {
  const g = gruposDoPedido({ amostras: [{ id: 'a', docId: 'd1', dados: {} }, { id: 'b', docId: 'd2', dados: {} }, { id: 'c', docId: 'd1', dados: {} }, { id: 'x' }] });
  assert.deepEqual(g.map((x) => [x.docId, x.amostras.map((a) => a.id).join()]), [['d1', 'a,c'], ['d2', 'b']]);
  assert.deepEqual(gruposDoPedido(null), []);
});

test('a imagem do Excel sai como imagem na impressão (antes: linha de assinatura com "Picture")', () => {
  const c = modelo(), png = 'data:image/png;base64,iVBORw0KGgo=';
  c.abas.a1.objs = [{ id: 'i1', tipo: 'imagem', l: 0, c: 0, dx: 0, dy: 0, w: 100, h: 40, src: png, nome: 'Picture' }, { id: 'i2', tipo: 'imagem', l: 0, c: 0, dx: 0, dy: 0, w: 10, h: 10, src: 'javascript:x', nome: 'x' }];
  const f = fonteImpressao(c, new Motor(c), 'a1', 'x');
  assert.match(f.objetos[0].svg, /<image href="data:image\/png;base64,iVBORw0KGgo="/);
  assert.doesNotMatch(f.objetos[0].svg, /Picture|<line/);
  assert.doesNotMatch(f.objetos[1].svg, /javascript|<image/, 'só imagem em texto data: entra');
});

test('v0.6.79 · pedido de um papel do Vértice (soMarcados): o que o documento não marcou sai, sem recusar', async () => {
  const { conferirPedido } = await import('../../src/ponte/campos.js');
  const c = planilhaVazia(); c.abas.a1.nome = 'Ficha';
  c.nomes = { efc_lab_nome: { n: 'efc_lab_nome', ref: "'Ficha'!$B$2" } };
  const n = normalizarPlanilha(c), base = { v: 1, pid: 'p0000000001', docId: 'dabc12345', de: 'efcwork', copias: 1, criadoEm: '2026-11-27T10:00:00.000Z', dados: { 'lab.nome': 'LAB', 'envio.caixas': 2 } };
  assert.equal(conferirPedido(base, { c: n }).erro, 'campo-desconhecido', 'sem a marca continua recusando (papel antigo dos Impressos)');
  const r = conferirPedido({ ...base, soMarcados: true }, { c: n });
  assert.ok(!r.erro, r.detalhe); assert.deepEqual(r.folhas, [{ 'lab.nome': 'LAB' }]);
});
