/* v0.6.81 (decisão do Elias, 27/11): o pedido do Cwork imprime só a aba com campos do Cwork marcados; sem nenhuma, a primeira aba. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerXlsx } from '../../src/planilha/xlsx/ler.js';
import { normalizarPlanilha } from '../../src/planilha/modelo.js';
import { camposDoLivro } from '../../src/ponte/campos.js';
import { paginasDoPedido, abasDoPedido } from '../../src/ponte/pedido.js';

/* modelos de TESTE com marca d'água (nenhum documento inventado) */
const ler = async (u) => normalizarPlanilha((await lerXlsx(new Uint8Array(readFileSync(new URL(u, import.meta.url))))).conteudo);
const DUAS = '../../../../projeto/tools/visual/v0681/amostras/teste-duas-abas.xlsx', UMA = '../../../../projeto/tools/visual/v0645/amostras/teste-grupos.xlsx';
const item = (dados) => ({ v: 1, pid: 'p0000000001', docId: 'dabc12345', de: 'efcwork', copias: 1, criadoEm: '2026-11-27T10:00:00.000Z', soMarcados: true, dados });
const nomeAba = (c, id) => c.abas[id].nome;

test('com uma aba de instruções antes, sai só a aba com campos', async () => {
  const c = await ler(DUAS), { campos } = camposDoLivro(c);
  assert.equal(c.ordem.length, 2);
  assert.deepEqual(abasDoPedido(c, campos).map((id) => nomeAba(c, id)), ['Teste']);
  const r = paginasDoPedido(item({ 'lab.nome': 'LAB (exemplo)', 'grupo.quantidade': 3 }), { ficha: { tipo: 'planilha', status: 'vigente', nome: 'Teste' }, conteudo: c });
  assert.ok(!r.erro, r.detalhe);
  assert.equal(r.paginas.length, 1, 'uma página só: a aba de instruções não sai');
  assert.equal(nomeAba(c, r.conteudos[0].abaId), 'Teste', '"Escrever nesta folha" abre a aba dos campos');
});

test('modelo de uma aba: igual a antes', async () => {
  const c = await ler(UMA), { campos } = camposDoLivro(c);
  assert.deepEqual(abasDoPedido(c, campos), [c.ordem[0]]);
});

test('sem nenhum campo marcado: a primeira aba visível', async () => {
  const c = await ler(DUAS);
  assert.deepEqual(abasDoPedido(c, []).map((id) => nomeAba(c, id)), ['Instruções (exemplo)']);
  c.abas[c.ordem[0]].oculta = true;
  assert.deepEqual(abasDoPedido(c, []).map((id) => nomeAba(c, id)), ['Teste']);
});

/* tema do Cwork (decisão do Elias, 27/11): dentro do Cwork segue o Claro/Escuro dele; no escuro a área de preencher fica clara */
import { temaDoCwork, areaClara } from '../../src/nucleo/temaCwork.js';
const janela = (tema, pai = '/efcwork/') => { const parent = { location: { origin: 'https://x.io', pathname: pai }, document: { documentElement: { getAttribute: () => tema } } }; return { location: { origin: 'https://x.io', href: 'https://x.io/efcwork/vertice/' }, parent }; };
test('dentro do Cwork, o tema do Vértice é o do Cwork; fora, nenhum', () => {
  assert.equal(temaDoCwork(janela('escuro')), 'dark');
  assert.equal(temaDoCwork(janela('claro')), 'papel');
  assert.equal(temaDoCwork(janela('escuro', '/outro/')), null, 'outra página do site não manda no tema');
  const so = { location: { origin: 'https://x.io', href: 'https://x.io/efcwork/vertice/' } }; so.parent = so;
  assert.equal(temaDoCwork(so), null, 'aberto sozinho: segue o tema dele');
});
test('área clara só no tema escuro e só se ele não escolheu a área escura', () => {
  const b = (tema, escura) => ({ dataset: { theme: tema }, classList: { contains: (c) => c === 'area-escura' && escura } });
  assert.equal(areaClara(b('dark', false)), true);
  assert.equal(areaClara(b('dark', true)), false);
  assert.equal(areaClara(b('papel', false)), false, 'no claro nada muda');
});
