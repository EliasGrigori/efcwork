/* v0.6.82 (decisão do Elias de 27/11 06:59): o PDF passa a morar no Vértice (tipo 'pdf', Documentos externos). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIPOS, criarArquivo, conteudoVazio } from '../../src/nucleo/modelo.js';
import { infoPdf, pdfDeJpeg, conteudoDoPdf, tipoDoArquivo, nomeSemExtensao, paraB64, deB64, PDF_MAX } from '../../src/nucleo/pdf.js';
import { compactar, descompactar } from '../../src/nucleo/compacta.js';
import { vaiParaNuvem } from '../../src/nucleo/sincroniza.js';

const jpegFalso = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]); /* só para montar a folha; nenhum documento */

test('o tipo PDF existe, só se importa e começa vazio', () => {
  assert.equal(TIPOS.pdf.nome, 'PDF');
  assert.equal(TIPOS.pdf.soImporta, true);
  assert.deepEqual(conteudoVazio('pdf').pdf, '');
  const a = criarArquivo({ tipo: 'pdf', nome: 'Laudo', agora: '2026-11-27T10:00:00.000Z' });
  assert.equal(a.ficha.tipo, 'pdf');
});

test('foto vira PDF A4 de uma página, deitado quando a foto é deitada', () => {
  const pe = pdfDeJpeg(jpegFalso, 300, 400), deitado = pdfDeJpeg(jpegFalso, 400, 300);
  assert.deepEqual(infoPdf(pe), { paginas: 1, orient: 'retrato' });
  assert.deepEqual(infoPdf(deitado), { paginas: 1, orient: 'paisagem' });
  const t = new TextDecoder('latin1').decode(pe);
  assert.ok(t.startsWith('%PDF-1.4') && t.trim().endsWith('%%EOF'));
  assert.match(t, /\/MediaBox \[0 0 595 842\]/);
});

test('o conteúdo guarda o PDF inteiro, o tamanho, o SHA-256 e as páginas; não-PDF é recusado', async () => {
  const pdf = pdfDeJpeg(jpegFalso, 300, 400);
  const c = await conteudoDoPdf(pdf, { origem: 'foto', arquivo: 'papel.jpg' });
  assert.equal(c.bytes, pdf.length);
  assert.equal(c.sha256.length, 64);
  assert.equal(c.paginas, 1);
  assert.equal(c.origem, 'foto');
  assert.deepEqual(deB64(c.pdf), pdf);
  await assert.rejects(conteudoDoPdf(new TextEncoder().encode('não sou pdf')), /não é um PDF/);
  const grande = new Uint8Array(PDF_MAX + 1); grande.set(new TextEncoder().encode('%PDF-1.4'));
  await assert.rejects(conteudoDoPdf(grande), /grande demais/);
});

test('o PDF passa inteiro pela compactação (o mesmo pacote que vai para a nuvem)', async () => {
  const pdf = pdfDeJpeg(jpegFalso, 300, 400), c = await conteudoDoPdf(pdf);
  const volta = await descompactar(await compactar(c));
  assert.deepEqual(deB64(volta.pdf), pdf);
  /* o Cwork grava o pacote em texto (fmt json): o Vértice abre igual */
  const doCwork = await descompactar({ fmt: 'json', dados: JSON.stringify(c), bytesOriginal: 1, bytesFinal: 1 });
  assert.equal(doCwork.sha256, c.sha256);
});

test('escolha do arquivo, nome sem extensão e base64 de ida e volta', () => {
  assert.equal(tipoDoArquivo({ name: 'Laudo.PDF' }), 'pdf');
  assert.equal(tipoDoArquivo({ name: 'foto.jpeg' }), 'foto');
  assert.equal(tipoDoArquivo({ name: 'planilha.xlsx' }), '');
  assert.equal(nomeSemExtensao('Certificado: balança.pdf'), 'Certificado balança');
  const b = new Uint8Array([0, 1, 254, 255]);
  assert.deepEqual(deB64(paraB64(b)), b);
});

test('PDF numa das 5 pastas sobe para a nuvem; sem pasta, não', () => {
  assert.equal(vaiParaNuvem({ tipo: 'pdf', pastaNome: 'POPs e procedimentos' }), true);
  assert.equal(vaiParaNuvem({ tipo: 'pdf' }), false);
});

test('arquivo da nuvem que não abre (pedaços misturados) pula só ele; os outros baixam (revisor)', async () => {
  const { puxar } = await import('../../src/nucleo/sincroniza.js');
  const guardados = [];
  const local = { um: async () => null, por: async (r) => { guardados.push(r.id); } };
  const remoto = {
    listar: async () => [{ id: 'dquebrado', versao: 1, status: 'rascunho' }, { id: 'dbom', versao: 1, status: 'rascunho' }],
    ler: async (id) => { if (id === 'dquebrado') return JSON.parse('{"quebrado'); return { ficha: { id, tipo: 'pdf', nome: 'Bom' }, pacote: { fmt: 'json', dados: '{}' }, versao: 1 }; },
  };
  const r = await puxar({ local, remoto, fila: null, podeSalvar: false });
  assert.deepEqual(r.pulados, ['dquebrado']);
  assert.deepEqual(r.baixados, ['dbom']);
  assert.equal(r.parou, null);
});
