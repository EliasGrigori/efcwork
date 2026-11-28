/* v0.6.75 (P4) · Vértice na nuvem do Cwork: sobe só o que está nas 5 pastas, só quem salva envia, quem não salva só recebe,
   versão esperada e cópia em conflito, fila guardada no aparelho, excluído aqui não volta. Nuvem falsa com a regra de versão. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarBanco, bancoNaMemoria } from '../../src/nucleo/banco.js';
import { vaiParaNuvem, remotoDoCwork, filaNoAparelho, puxar, criarSincronia, PASTAS_NUVEM } from '../../src/nucleo/sincroniza.js';
import { SUBABAS } from '../../src/ponte/ponte.js';

/* a mesma regra da porta do Cwork (vtNuvemGravar): versão esperada, pasta obrigatória, só quem salva */
function nuvemFalsa() {
  const docs = new Map();
  let fora = false;
  const api = {
    listar: async () => { if (fora) throw new Error('sem internet'); return [...docs.values()].map((d) => ({ id: d.ficha.id, versao: d.versao, pasta: d.pasta, status: d.ficha.status || '' })); },
    ler: async (id) => { if (fora) throw new Error('sem internet'); const d = docs.get(id); return d ? structuredClone(d) : null; },
    gravar: async ({ ficha, pacote }, esperada) => {
      if (fora) throw new Error('sem internet');
      if (!PASTAS_NUVEM.includes(ficha.pastaNome)) throw new Error('Só sobe arquivo numa das 5 pastas.');
      const atual = docs.get(ficha.id), cur = atual ? atual.versao : 0;
      if (cur !== esperada) return { conflito: true };
      docs.set(ficha.id, structuredClone({ ficha, pacote, versao: cur + 1, pasta: ficha.pastaNome }));
      return { ok: true, versao: cur + 1 };
    },
  };
  return { ponte: { nuvem: api }, docs, sairDoAr: (v = true) => { fora = v; } };
}
function guardaFalsa() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; }
const arq = (id, extra = {}) => ({ ficha: { id, nome: 'Arquivo ' + id, tipo: 'planilha', status: 'rascunho', criadoEm: '2026-11-27T10:00:00.000Z', ...extra }, conteudo: { abas: [{ nome: 'A', celulas: { A1: id } }] } });
const espere = (ms) => new Promise((r) => setTimeout(r, ms));

test('as 5 pastas da nuvem são as mesmas sub-abas de Documentos internos', () => {
  assert.deepEqual(PASTAS_NUVEM, SUBABAS);
  assert.equal(vaiParaNuvem({ pastaNome: 'Etiquetas' }), true);
  assert.equal(vaiParaNuvem({ pastaNome: '' }), false);
  assert.equal(vaiParaNuvem({}), false);
});

test('a porta do Cwork sem o recurso nuvem: não liga', () => {
  assert.equal(remotoDoCwork(null), null);
  assert.equal(remotoDoCwork({ usuario() {} }), null);
  assert.ok(remotoDoCwork(nuvemFalsa().ponte));
});

test('fila guardada no aparelho, uma por conta', () => {
  const g = guardaFalsa();
  const a = filaNoAparelho(g, 'u1'); a.por('x'); a.por('y'); a.por('x');
  assert.deepEqual(filaNoAparelho(g, 'u1').lista(), ['x', 'y']);
  assert.deepEqual(filaNoAparelho(g, 'u2').lista(), []);
  a.tirar('x'); assert.deepEqual(filaNoAparelho(g, 'u1').lista(), ['y']);
});

test('quem salva: só o arquivo numa das 5 pastas sobe; rascunho sem pasta fica no aparelho', async () => {
  const n = nuvemFalsa(), banco = criarBanco({ backend: bancoNaMemoria() }), fila = filaNoAparelho(guardaFalsa(), 'lider');
  await banco.salvar(arq('a', { pastaNome: 'Etiquetas' }), 'criou');
  await banco.salvar(arq('b'), 'criou');
  const s = criarSincronia({ banco, remoto: remotoDoCwork(n.ponte), fila, podeSalvar: true, espera: 10 });
  await s.iniciar();
  assert.deepEqual([...n.docs.keys()], ['a'], 'só o da pasta Etiquetas subiu');
  assert.equal((await banco.backend.um('a')).ficha.nuvem.versao, 1);
  assert.equal(s.situacao((await banco.backend.um('b')).ficha), 'aparelho');
  /* pôs o rascunho numa pasta: sobe sozinho logo depois */
  await banco.mudarFicha('b', { pastaNome: 'Formulários' }, 'interno');
  await espere(60); await s.enviar();
  assert.ok(n.docs.has('b'));
  assert.equal(n.docs.get('b').pasta, 'Formulários');
  /* salvou de novo: versão 2, sem conflito (o banco lembra a versão da nuvem) */
  const a = await banco.abrir('a'); await banco.salvar({ ficha: a.ficha, conteudo: { abas: [{ nome: 'A', celulas: { A1: 'novo' } }] } });
  await espere(60); await s.enviar();
  assert.equal(n.docs.get('a').versao, 2);
  assert.equal((await banco.backend.um('a')).ficha.nuvem.versao, 2);
  s.parar();
});

test('quem não salva: recebe da nuvem e nunca envia; a nuvem vale mais que o aparelho dele', async () => {
  const n = nuvemFalsa(), lider = criarBanco({ backend: bancoNaMemoria() });
  await lider.salvar(arq('e1', { pastaNome: 'Etiquetas' }), 'criou');
  const sl = criarSincronia({ banco: lider, remoto: remotoDoCwork(n.ponte), fila: filaNoAparelho(guardaFalsa(), 'l'), podeSalvar: true, espera: 10 });
  await sl.iniciar();
  const colab = criarBanco({ backend: bancoNaMemoria() }), fc = filaNoAparelho(guardaFalsa(), 'c');
  const sc = criarSincronia({ banco: colab, remoto: remotoDoCwork(n.ponte), fila: fc, podeSalvar: false, espera: 10 });
  const r = await sc.iniciar();
  assert.deepEqual(r.trazer.baixados, ['e1']);
  const aberto = await colab.abrir('e1');
  assert.equal(aberto.conteudo.abas[0].celulas.A1, 'e1', 'o conteúdo chegou inteiro');
  /* ele mexe: nada vai para a fila nem para a nuvem */
  await colab.salvar({ ficha: aberto.ficha, conteudo: { abas: [{ nome: 'A', celulas: { A1: 'mexi' } }] } });
  await espere(40); assert.equal(fc.tamanho, 0); assert.equal(n.docs.get('e1').versao, 1);
  /* o líder publica versão nova: o colaborador recebe por cima do que mexeu */
  const a = await lider.abrir('e1'); await lider.salvar({ ficha: a.ficha, conteudo: { abas: [{ nome: 'A', celulas: { A1: 'v2' } }] } });
  await espere(40); await sl.enviar();
  await sc.puxar();
  assert.equal((await colab.abrir('e1')).conteudo.abas[0].celulas.A1, 'v2');
  sl.parar(); sc.parar();
});

test('dois que salvam mexem no mesmo arquivo: o segundo vira cópia em conflito, nada se perde', async () => {
  const n = nuvemFalsa(), b1 = criarBanco({ backend: bancoNaMemoria() }), b2 = criarBanco({ backend: bancoNaMemoria() });
  await b1.salvar(arq('k', { pastaNome: 'Fluxogramas' }), 'criou');
  const s1 = criarSincronia({ banco: b1, remoto: remotoDoCwork(n.ponte), fila: filaNoAparelho(guardaFalsa(), '1'), podeSalvar: true, quem: 'Ana', espera: 100000 });
  await s1.iniciar();
  const s2 = criarSincronia({ banco: b2, remoto: remotoDoCwork(n.ponte), fila: filaNoAparelho(guardaFalsa(), '2'), podeSalvar: true, quem: 'Bia', espera: 100000 });
  await s2.iniciar();
  const x1 = await b1.abrir('k'), x2 = await b2.abrir('k');
  await b1.salvar({ ficha: x1.ficha, conteudo: { abas: [{ nome: 'A', celulas: { A1: 'Ana' } }] } });
  await b2.salvar({ ficha: x2.ficha, conteudo: { abas: [{ nome: 'A', celulas: { A1: 'Bia' } }] } });
  await espere(40); await s1.enviar(); const r2 = await s2.enviar();
  assert.equal(r2.conflitos.length, 1);
  assert.equal((await b2.abrir('k')).conteudo.abas[0].celulas.A1, 'Ana', 'o original passa a ser o da nuvem');
  const copia = await b2.abrir(r2.conflitos[0].copia);
  assert.equal(copia.conteudo.abas[0].celulas.A1, 'Bia', 'o que a Bia fez ficou na cópia');
  assert.match(copia.ficha.nome, /cópia em conflito de Bia/);
  assert.equal(copia.ficha.conflitoDe, 'k', 'v0.6.83: a cópia diz de qual arquivo é (o Cwork não a mostra como vigente)');
  s1.parar(); s2.parar();
});

test('sem internet: a fila espera e sobe quando volta; excluído de vez aqui não volta da nuvem', async () => {
  const n = nuvemFalsa(), g = guardaFalsa(), banco = criarBanco({ backend: bancoNaMemoria() });
  await banco.salvar(arq('z', { pastaNome: 'POPs e procedimentos' }), 'criou');
  n.sairDoAr(true);
  const s = criarSincronia({ banco, remoto: remotoDoCwork(n.ponte), fila: filaNoAparelho(g, 'u'), podeSalvar: true, espera: 10 });
  await s.iniciar();
  assert.equal(n.docs.size, 0); assert.deepEqual(filaNoAparelho(g, 'u').lista(), ['z'], 'ficou guardado na fila do aparelho');
  n.sairDoAr(false); await s.enviar(); assert.ok(n.docs.has('z'));
  await banco.mandarParaLixeira('z'); await espere(40); await s.enviar();
  await banco.excluirDeVez('z');
  const r = await puxar({ local: banco.backend, remoto: remotoDoCwork(n.ponte), fila: filaNoAparelho(g, 'u'), podeSalvar: true });
  assert.deepEqual(r.baixados, []);
  assert.equal(await banco.backend.um('z'), null);
  s.parar();
});
