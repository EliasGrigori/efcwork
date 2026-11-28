/* v0.6.85 · conversa do cartão pela conta do Cwork (plano Conversas do Elias, 28/11, decisão 3). Parte sem tela. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avisarConversa, contasDaConversa, cartaoDaRota, definirArquivoDaConversa, arquivoDaConversa, contaDeQuemEscreve } from '../../src/ponte/conversa.js';
import { respostaNova } from '../../src/quadro/comentario.js';
import { definirLogin } from '../../src/nucleo/quem.js';

/* uma janela de teste dentro do "Cwork" (parent com a porta) */
const janela = (porta) => { const w = { parent: { CworkPonteVertice: porta } }; return w; };
const porta = (extra = {}) => { const chamadas = []; return { chamadas, p: { versao: 1, recursos: ['usuario', 'conversas'], usuario: () => ({ uid: 'u1', nome: 'Ana' }), conversas: { avisar: (d) => { chamadas.push(d); return Promise.resolve({ ok: true }); } }, ...extra } }; };
const it = { id: 'pi1', tipo: 'postit', cod: 'P3', texto: 'Trocar o filtro\nlinha 2', resp: 'Carlos Lima', nota: 'Quem compra?', notaA: 'Ana', notaAi: 'u1', notaR: [{ a: 'Bia', t: 'Eu', em: '2026-11-28T10:00:00Z', ai: 'u2' }, { a: 'Sem conta', t: 'ok', em: '2026-11-28T10:01:00Z' }] };

test('cartão da rota: #/arq/<id>/c/<cartão> (e nada sem /c/)', () => {
  assert.equal(cartaoDaRota('#/arq/abc/c/pi1'), 'pi1');
  assert.equal(cartaoDaRota('#/arq/abc/c/p%C3%AD%201'), 'pí 1');
  assert.equal(cartaoDaRota('#/arq/abc'), '');
  assert.equal(cartaoDaRota('#/arq/abc/c/'), '');
});

test('contas da conversa: quem comentou e quem respondeu pelo Cwork (sem repetir, sem vazio)', () => {
  assert.deepEqual(contasDaConversa(it), ['u1', 'u2']);
  assert.deepEqual(contasDaConversa({ id: 'x' }), []);
});

test('sem o Cwork (ou sem login): nada é avisado e a resposta não leva conta', () => {
  definirLogin(null);
  assert.equal(contaDeQuemEscreve(), '');
  const r = respostaNova(it, 'oi', 'Bia', new Date('2026-11-28T11:00:00Z'));
  assert.equal(r.notaR.length, 3); assert.equal('ai' in r.notaR[2], false);
  const { p, chamadas } = porta();
  assert.equal(avisarConversa(it, 'oi', { id: 'arq1', nome: 'Plano' }, janela(p)), false, 'sem login do Cwork');
  assert.equal(chamadas.length, 0);
});

test('logado pelo Cwork: a resposta guarda a conta (ai) e a porta recebe arquivo, cartão, texto, responsável e contas', () => {
  definirLogin({ uid: 'u9', nome: 'Elias', perfil: 'admin' });
  try {
    const r = respostaNova(it, 'combinado', 'Elias', new Date('2026-11-28T11:00:00Z'));
    assert.deepEqual(r.notaR[2], { a: 'Elias', t: 'combinado', em: '2026-11-28T11:00:00.000Z', ai: 'u9' });
    const { p, chamadas } = porta();
    definirArquivoDaConversa({ id: 'arq1', nome: 'Plano 2026', outro: 1 });
    assert.deepEqual(arquivoDaConversa(), { id: 'arq1', nome: 'Plano 2026' });
    assert.equal(avisarConversa({ ...it, ...r }, ' combinado ', undefined, janela(p)), true);
    assert.equal(chamadas.length, 1);
    assert.deepEqual(chamadas[0], { arq: 'arq1', arqNome: 'Plano 2026', item: 'pi1', cod: 'P3', titulo: 'Trocar o filtro', texto: 'combinado', resp: ['Carlos Lima'], ids: ['u1', 'u2', 'u9'] });
    /* texto vazio, porta sem o recurso, porta que falha: não quebra nada */
    assert.equal(avisarConversa(it, '   ', undefined, janela(p)), false);
    const sem = porta({ recursos: ['usuario'] });
    assert.equal(avisarConversa(it, 'oi', undefined, janela(sem.p)), false);
    const ruim = porta({ conversas: { avisar: () => { throw new Error('x'); } } });
    assert.equal(avisarConversa(it, 'oi', undefined, janela(ruim.p)), false);
    const rejeita = porta({ conversas: { avisar: () => Promise.reject(new Error('nuvem')) } });
    assert.equal(avisarConversa(it, 'oi', undefined, janela(rejeita.p)), true, 'a recusa da nuvem fica com o Cwork (o comentário já está no arquivo)');
  } finally { definirLogin(null); definirArquivoDaConversa(null); }
});
