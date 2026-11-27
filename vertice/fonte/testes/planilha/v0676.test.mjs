/* v0.6.76 · modo documento: só as células liberadas (sem conta) aceitam escrita, numa cópia; as páginas saem na
   orientação do modelo e dizem onde está cada campo. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planilhaVazia, normalizarPlanilha } from '../../src/planilha/modelo.js';
import { rotaDoDocumento, abaDoDocumento, camposLiberados, escreverNoDocumento, textoDoCampo, paginasDoDocumento, abrirParaDocumento } from '../../src/planilha/modoDocumento.js';
import { Motor } from '../../src/planilha/motor.js';
import { lerLogin } from '../../src/nucleo/loginCwork.js';

function modelo(orient) {
  const c = planilhaVazia();
  c.estilos = [{}, { lib: true }, { lib: true, nf: 'dd/mm/yyyy' }];
  const A = c.abas.a1;
  A.prot = 1;
  A.imp = { orient };
  A.cel = { A1: { v: 'Talhão' }, B1: { s: 1 }, A2: { v: 'Data' }, B2: { s: 2 }, B3: { s: 1, f: 'B1' }, D6: { s: 1 } };
  return normalizarPlanilha(c);
}

test('a rota do documento, com e sem a aba', () => {
  assert.deepEqual(rotaDoDocumento('documento/d1'), { id: 'd1', aba: '' });
  assert.deepEqual(rotaDoDocumento('documento/d1/Etiquetas%20solo'), { id: 'd1', aba: 'Etiquetas solo' });
  assert.equal(rotaDoDocumento('arq/d1'), null);
});

test('a aba pedida pelo nome; sem achar, a primeira visível', () => {
  const c = { ordem: ['a1', 'a2', 'a3'], abas: { a1: { nome: 'Capa', oculta: true }, a2: { nome: 'Ficha' }, a3: { nome: 'Solo' } } };
  assert.equal(abaDoDocumento(c, 'solo'), 'a3');
  assert.equal(abaDoDocumento(c, 'Capa'), 'a2');
  assert.equal(abaDoDocumento(c, ''), 'a2');
});

test('só célula liberada e sem conta é campo; escrever devolve uma cópia e não muda o modelo', () => {
  const c = modelo('retrato'), m = new Motor(c);
  assert.deepEqual([...camposLiberados(c, 'a1')].sort(), ['B1', 'B2', 'D6']);
  const r = escreverNoDocumento(c, m, 'a1', 0, 1, 'Talhão 7');
  assert.equal(r.conteudo.abas.a1.cel.B1.v, 'Talhão 7');
  assert.equal(c.abas.a1.cel.B1.v, undefined, 'o original não muda');
  assert.ok(escreverNoDocumento(c, m, 'a1', 0, 0, 'x').erro, 'rótulo não é campo');
  assert.ok(escreverNoDocumento(c, m, 'a1', 2, 1, 'x').erro, 'conta liberada não é campo');
});

test('código com zero na frente e texto começando com = entram como texto; data aparece no formato', () => {
  const c = modelo('retrato'), m = new Motor(c);
  assert.equal(escreverNoDocumento(c, m, 'a1', 0, 1, '001').conteudo.abas.a1.cel.B1.v, '001');
  const f = escreverNoDocumento(c, m, 'a1', 0, 1, '=1+1').conteudo.abas.a1.cel.B1;
  assert.equal(f.v, '=1+1'); assert.equal(f.f, undefined);
  const d = escreverNoDocumento(c, m, 'a1', 1, 1, '27/11/2026').conteudo;
  assert.equal(textoDoCampo(d, new Motor(d), 'a1', 1, 1), '27/11/2026');
});

test('apagar o que foi escrito volta a célula vazia, ainda liberada', () => {
  const c = modelo('retrato'), m = new Motor(c);
  const um = escreverNoDocumento(c, m, 'a1', 0, 1, 'abc').conteudo;
  const dois = escreverNoDocumento(um, new Motor(um), 'a1', 0, 1, '').conteudo;
  assert.equal(dois.abas.a1.cel.B1.v, undefined);
  assert.ok(camposLiberados(dois, 'a1').has('B1'));
});

test('as páginas seguem a orientação do modelo e trazem o lugar de cada campo (até a célula vazia fora da área usada)', () => {
  const retrato = paginasDoDocumento(modelo('retrato'), 'a1', 'x'), deitado = paginasDoDocumento(modelo('paisagem'), 'a1', 'x');
  assert.ok(retrato.paginas[0].H > retrato.paginas[0].W);
  assert.ok(deitado.paginas[0].W > deitado.paginas[0].H);
  assert.deepEqual(retrato.paginas.flatMap((p) => p.campos).map((f) => f.l + ':' + f.c).sort(), ['0:1', '1:1', '5:3']);
});

test('só planilha abre como documento', () => {
  assert.equal(abrirParaDocumento({ ficha: { tipo: 'postits' }, conteudo: {} }, ''), null);
});

test('o login diz quem só entra pelo documento e quem não atualiza o modelo', () => {
  const j = (u) => ({ parent: { CworkPonteVertice: { versao: 1, usuario: () => u } } });
  const colab = lerLogin(j({ uid: 'u', nome: 'A', perfil: 'secundario', acesso: 'documento', salvar: false }));
  assert.equal(colab.soDocumento, true); assert.equal(colab.semSalvar, true);
  const lider = lerLogin(j({ uid: 'u', nome: 'A', perfil: 'secundario', estrela: true, acesso: 'completo', salvar: true }));
  assert.equal(lider.soDocumento, undefined); assert.equal(lider.semSalvar, undefined);
});
