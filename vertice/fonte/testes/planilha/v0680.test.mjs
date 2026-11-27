/* v0.6.80 · dicionário 2: uma folha por análise (o grupo e só as amostras dele) e cada folha pode abrir para escrever à mão. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerXlsx } from '../../src/planilha/xlsx/ler.js';
import { normalizarPlanilha } from '../../src/planilha/modelo.js';
import { camposDoLivro } from '../../src/ponte/campos.js';
import { paginasDoPedido } from '../../src/ponte/pedido.js';
import { EFD } from '../../src/ponte/ponte.js';
import { guardarFolha, pegarFolha } from '../../src/ponte/rascunhoPedido.js';

const MOD = new URL('../../../../projeto/tools/visual/v0645/amostras/teste-grupos.xlsx', import.meta.url);
const modelo = async () => normalizarPlanilha((await lerXlsx(new Uint8Array(readFileSync(MOD)))).conteudo);
const am = (k, an, prof) => Array.from({ length: k }, (_, i) => ({ n: i + 1, identificacao: 'RU' + i, data: '2026-11-19', hora: '08:30', analise: an, profundidade: prof, material: 'Solo' }));

test('o dicionário 2 só acrescenta: grupo e colunas novas; o resto igual', () => {
  assert.equal(EFD.CAMPOS['grupo.quantidade'], 'numero'); assert.equal(EFD.CAMPOS['coleta.os'], 'texto');
  assert.ok(EFD.COLUNAS['amostras[]'].includes('profundidade') && EFD.COLUNAS['amostras[]'][0] === 'n');
  assert.equal(EFD.chaveDe('efc_grupo_xsolo'), 'grupo.xsolo'); assert.equal(EFD.CAMPOS_MAX, 60);
});

test('o modelo de teste marca grupo, X do material e colunas da lista', async () => {
  const { campos, fora } = camposDoLivro(await modelo());
  assert.deepEqual(fora, []);
  assert.ok(['grupo.material', 'grupo.analise', 'grupo.quantidade', 'grupo.xsolo', 'amostras[].profundidade'].every((k) => campos.some((x) => x.chave === k)));
});

test('duas análises: duas folhas, cada uma com o grupo e só as amostras dela; o que o modelo não marca sai (soMarcados)', async () => {
  const c = await modelo();
  const item = { v: 1, pid: 'p0000000001', docId: 'dabc12345', de: 'efcwork', copias: 1, criadoEm: '2026-11-27T10:00:00.000Z', soMarcados: true,
    dados: { 'lab.nome': 'LAB (exemplo)', 'envio.caixas': 2, 'amostras[]': am(6, 'X') },
    folhas: [{ 'grupo.material': 'Solo', 'grupo.analise': 'FISICOQUIMICA', 'grupo.quantidade': 4, 'grupo.xsolo': 'X', 'grupo.xfolha': '', 'amostras[]': am(4, 'FISICOQUIMICA', '0-20') },
      { 'grupo.material': 'Solo', 'grupo.analise': 'QUÍMICA + CLORO', 'grupo.quantidade': 2, 'grupo.xsolo': 'X', 'grupo.xfolha': '', 'amostras[]': am(2, 'QUÍMICA + CLORO', '20-40') }] };
  const r = paginasDoPedido(item, { ficha: { tipo: 'planilha', status: 'vigente', nome: 'Teste' }, conteudo: c });
  assert.ok(!r.erro, r.detalhe);
  assert.equal(r.folhas, 2); assert.equal(r.conteudos.length, 2);
  assert.deepEqual(r.conteudos.map((f) => f.titulo), ['Solo · FISICOQUIMICA', 'Solo · QUÍMICA + CLORO']);
  const cel = (k, ref) => r.conteudos[k].conteudo.abas[r.conteudos[k].abaId].cel[ref];
  assert.equal(cel(0, 'B5').v, 4); assert.equal(cel(1, 'B5').v, 2); assert.equal(cel(0, 'B6').v, 'X'); assert.equal(cel(0, 'B8').v, 'LAB (exemplo)');
  assert.equal(cel(1, 'B12').v, 'RU1'); assert.equal((cel(1, 'B13') || {}).v, undefined, 'a segunda folha só tem as 2 amostras dela');
  assert.equal(cel(1, 'F11').v, '20-40');
});

test('a folha guardada para escrever à mão é pega uma vez só', () => {
  guardarFolha('d1', { conteudo: { x: 1 } });
  assert.deepEqual(pegarFolha('d1'), { conteudo: { x: 1 } }); assert.equal(pegarFolha('d1'), null);
});
