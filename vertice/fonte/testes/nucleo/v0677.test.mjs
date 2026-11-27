/* v0.6.77 · o que não sobe para a nuvem diz por quê, não segura os outros e tenta de novo (defeito visto pelo Elias em 27/11:
   "FLUX 0002 travado em Subindo para a nuvem desde 10:08"). Nuvem falsa com a regra de versão. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarBanco, bancoNaMemoria } from '../../src/nucleo/banco.js';
import { filaNoAparelho, criarSincronia, remotoDoCwork } from '../../src/nucleo/sincroniza.js';
import { enviarPendentes, criarFila, motivoDaNuvem, ehDeRede } from '../../src/nucleo/nuvem.js';

function nuvemFalsa({ negar = new Set(), calada = false } = {}) {
  const docs = new Map();
  const api = {
    listar: async () => [...docs.values()].map((d) => ({ id: d.ficha.id, versao: d.versao, pasta: d.pasta })),
    ler: async (id) => (docs.has(id) ? structuredClone(docs.get(id)) : null),
    gravar: async ({ ficha, pacote }, esperada) => {
      if (api.calada) throw new Error('a nuvem não respondeu');
      if (negar.has(ficha.id)) throw new Error('Missing or insufficient permissions.');
      const cur = docs.has(ficha.id) ? docs.get(ficha.id).versao : 0;
      if (cur !== esperada) return { conflito: true };
      docs.set(ficha.id, { ficha, pacote, versao: cur + 1, pasta: ficha.pastaNome });
      return { ok: true, versao: cur + 1 };
    },
    calada,
  };
  return api;
}
const rec = (id) => ({ id, ficha: { id, nome: id, tipo: 'postits', status: 'rascunho', pastaNome: 'Fluxogramas' }, pacote: { fmt: 'texto', dados: '{}' } });
function localFalso(ids) { const m = new Map(ids.map((id) => [id, rec(id)])); return { um: async (id) => m.get(id) || null, por: async (r) => m.set(r.id, r), m }; }

test('o motivo em palavras de gente; rede é tentar depois, o resto é do arquivo', () => {
  assert.equal(motivoDaNuvem('Missing or insufficient permissions.'), 'sem permissão na nuvem');
  assert.equal(motivoDaNuvem('a nuvem não respondeu'), 'a nuvem não respondeu');
  assert.equal(motivoDaNuvem('sem internet'), 'sem internet');
  assert.equal(ehDeRede('a nuvem não respondeu'), true);
  assert.equal(ehDeRede('Missing or insufficient permissions.'), false);
  assert.equal(ehDeRede('Arquivo grande demais para a nuvem (190 MB).'), false);
});

test('um arquivo recusado não segura os outros da fila (antes a fila parava nele)', async () => {
  const local = localFalso(['f2', 'f1']), remoto = nuvemFalsa({ negar: new Set(['f2']) }), fila = criarFila(['f2', 'f1']);
  const r = await enviarPendentes({ local, remoto, fila });
  assert.deepEqual(r.enviados, ['f1']);
  assert.deepEqual(r.falhas.map((x) => x.id), ['f2']);
  assert.equal(r.parou, null);
  assert.deepEqual(fila.lista(), ['f2'], 'o recusado continua na fila para tentar de novo');
});

test('nuvem calada: para tudo e cada arquivo da fila mostra o motivo', async () => {
  const banco = criarBanco(bancoNaMemoria());
  const remoto = nuvemFalsa({ calada: true }), mudou = [];
  const fila = filaNoAparelho(null, 'u1'); fila.por('fa'); fila.por('fb');
  const s = criarSincronia({ banco, remoto, fila, podeSalvar: true, aoMudar: (x) => mudou.push(x) });
  await banco.backend.por(rec('fa')); await banco.backend.por(rec('fb'));
  await s.enviar();
  assert.equal(s.erro('fa').texto, 'a nuvem não respondeu');
  assert.equal(s.erro('fb').texto, 'a nuvem não respondeu');
  assert.ok(mudou.length >= 1, 'a tela fica sabendo');
  remoto.calada = false;
  await s.tentar('fa');
  assert.equal(s.erro('fa'), null); assert.equal(s.erro('fb'), null, 'com a nuvem de volta, a fila inteira sobe');
  s.parar();
});

test('recusado por permissão: fica o motivo, "Tentar de novo" tenta e continua dizendo enquanto não muda', async () => {
  const banco = criarBanco(bancoNaMemoria());
  const remoto = nuvemFalsa({ negar: new Set(['fx']) });
  const fila = filaNoAparelho(null, 'u1'); fila.por('fx');
  const s = criarSincronia({ banco, remoto, fila, podeSalvar: true });
  await banco.backend.por(rec('fx'));
  await s.enviar();
  assert.equal(s.erro('fx').texto, 'sem permissão na nuvem');
  await s.tentar('fx');
  assert.equal(s.erro('fx').texto, 'sem permissão na nuvem');
  assert.equal(s.pendentes(), 1);
  s.parar();
});

test('a porta do Cwork continua a mesma', () => { assert.ok(remotoDoCwork({ nuvem: { listar() {}, ler() {}, gravar() {} } })); });
