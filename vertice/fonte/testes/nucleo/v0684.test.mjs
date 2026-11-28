// v0.6.84 (ITEM 184 do Cwork): a resposta do pedido leva como saiu e o PDF preenchido (até 650 KB); acima, pdfFora. Contrato: só acrescenta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Ponte = require('../../contrato/efd-ponte.js');
const base = { v: 1, pid: 'p' + 'a'.repeat(12), de: 'docs', para: 'efcwork', tipo: 'resposta', criadoEm: new Date().toISOString(), pedido: 'pbbbbbbbbbb', ok: true, paginas: 1 };

test('resposta antiga (sem como e sem pdf) continua valendo', () => { assert.deepEqual(Ponte.confere(base), []); });
test('resposta com como e o PDF preenchido', () => { assert.deepEqual(Ponte.confere({ ...base, como: 'imprimir', pdf: new ArrayBuffer(2000) }), []); assert.deepEqual(Ponte.confere({ ...base, como: 'pdf', pdfFora: true }), []); });
test('como só imprimir ou pdf; pdf só com ok; até 650 KB', () => {
  assert.ok(Ponte.confere({ ...base, como: 'email' }).includes('como: imprimir ou pdf'));
  assert.ok(Ponte.confere({ ...base, ok: false, erro: 'x', pdf: new ArrayBuffer(10) }).includes('pdf só com ok'));
  assert.ok(Ponte.confere({ ...base, pdf: new ArrayBuffer(650001) }).includes('pdf da resposta até 650 KB'));
  assert.ok(Ponte.confere({ ...base, pdf: new Uint8Array(10) }).includes('pdf deve ser ArrayBuffer'));
});
