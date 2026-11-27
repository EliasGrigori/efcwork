/* Vértice Docs · sincronia com a nuvem do Cwork (P4, v0.6.75; feita pela conversa do Cwork, autorizada pelo Elias em 27/11 07:22).
   Decisões do Elias (27/11):
   - Todos os documentos moram no Vértice; o Cwork só liga e abre (06:59).
   - Sobe para a nuvem só o arquivo que está numa das 5 pastas de "Documentos internos"; sem pasta, fica "neste aparelho" (07:3x).
   - Só quem salva no Cwork (Administrador e Líder ★: usuario().salvar) envia. Os outros só recebem.
   O Vértice não carrega o Firebase: lê e grava pela porta do Cwork, recurso 'nuvem' ({ listar, ler, gravar }).
   Envio e conflito: enviarPendentes do nuvem.js (versão esperada; alguém gravou no meio → cópia em conflito).
   Parte sem tela (testada no node com a nuvem falsa). */
import { criarFila, enviarPendentes } from './nuvem.js';

export const PASTAS_NUVEM = ['Etiquetas', 'Fichas e custódias', 'Formulários', 'Fluxogramas', 'POPs e procedimentos']; /* = SUBABAS (ponte.js) e IP_PASTAS do Cwork */

/** O arquivo vai para a nuvem? Só numa das 5 pastas. */
export const vaiParaNuvem = (f) => !!f && PASTAS_NUVEM.includes(f.pastaNome);

/** A nuvem do Cwork no formato que o nuvem.js usa (null se o Cwork não tem o recurso). */
export function remotoDoCwork(ponte) {
  const n = ponte && ponte.nuvem;
  if (!n || typeof n.ler !== 'function' || typeof n.gravar !== 'function' || typeof n.listar !== 'function') return null;
  return { listar: () => n.listar(), ler: (id) => n.ler(id), gravar: (d, esperada) => n.gravar(d, esperada) };
}

/** Fila de envio guardada no aparelho (uma por conta): sobrevive a fechar o app e a ficar sem internet. */
export function filaNoAparelho(store, uid) {
  const chave = 'efcdocs:nuvem-fila:' + String(uid || 'aparelho');
  let ini = [];
  try { ini = JSON.parse((store && store.getItem(chave)) || '[]'); } catch { ini = []; }
  const f = criarFila(Array.isArray(ini) ? ini.filter((x) => typeof x === 'string') : []);
  const salva = () => { try { if (store) store.setItem(chave, JSON.stringify(f.lista())); } catch { /* aparelho cheio: fica na memória */ } };
  return { chave, por(id) { f.por(id); salva(); }, tirar(id) { f.tirar(id); salva(); }, lista: () => f.lista(), get tamanho() { return f.tamanho; } };
}

const novaMarca = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/**
 * Traz da nuvem o que mudou. Devolve { baixados, pulados, parou }.
 * - Arquivo da nuvem que o aparelho não tem (e não está na lixeira) ou que tem numa versão antiga: baixa.
 * - Quem salva e tem o arquivo na fila (mudou aqui e ainda não subiu): não baixa; o envio resolve (conflito vira cópia).
 * - Quem não salva: a nuvem sempre vale (ele não guarda mudança em arquivo da nuvem).
 */
export async function puxar({ local, remoto, fila, podeSalvar, agora = new Date().toISOString(), aoMarcar = () => {} }) {
  const out = { baixados: [], pulados: [], parou: null };
  let lista;
  try { lista = await remoto.listar(); } catch (e) { out.parou = String((e && e.message) || e || 'sem internet'); return out; }
  const naFila = new Set(fila ? fila.lista() : []);
  for (const it of lista || []) {
    if (!it || !it.id) continue;
    const rec = await local.um(it.id);
    const vLocal = (rec && rec.ficha && rec.ficha.nuvem && rec.ficha.nuvem.versao) || 0;
    if (vLocal >= it.versao) continue;
    if (!rec && it.status === 'lixeira') continue; /* excluído de vez aqui: não volta */
    if (rec && podeSalvar && naFila.has(it.id)) { out.pulados.push(it.id); continue; }
    let d;
    try { d = await remoto.ler(it.id); } catch (e) { out.parou = String((e && e.message) || e || 'sem internet'); break; }
    if (!d || !d.ficha || !d.pacote) continue;
    const nuvem = { versao: d.versao, em: agora };
    await local.por({ id: it.id, ficha: { ...d.ficha, id: it.id, nuvem }, pacote: d.pacote, marca: novaMarca() });
    aoMarcar(it.id, nuvem);
    out.baixados.push(it.id);
  }
  return out;
}

/**
 * Liga o banco à nuvem. banco = criarBanco(...) (usa banco.backend, banco.ouvir e banco.lembrarNuvem).
 * Devolve { puxar, enviar, parar, situacao(id) }. aoMudar(resultado) avisa a tela para ler a lista de novo.
 */
export function criarSincronia({ banco, remoto, fila, podeSalvar, quem = 'neste aparelho', aoMudar = () => {}, espera = 1500 }) {
  const local = banco.backend;
  const aoMarcar = (id, nuvem) => banco.lembrarNuvem(id, nuvem);
  let rodando = null, de_novo = false, relogio = null, vivo = true;
  const enviando = new Set();
  async function enviar() {
    if (!podeSalvar || !vivo) return null;
    if (rodando) { de_novo = true; return rodando; }
    rodando = (async () => {
      fila.lista().forEach((id) => enviando.add(id));
      const r = await enviarPendentes({ local, remoto, fila, quem, aoMarcar });
      enviando.clear();
      if (r.enviados.length || r.conflitos.length) aoMudar(r);
      return r;
    })().finally(() => { rodando = null; if (de_novo && vivo) { de_novo = false; enviar(); } });
    return rodando;
  }
  async function trazer() {
    const r = await puxar({ local, remoto, fila, podeSalvar, aoMarcar });
    if (r.baixados.length) aoMudar(r);
    return r;
  }
  /* primeira vez de quem salva: o que já estava nas 5 pastas e nunca subiu entra na fila */
  async function primeiraVez() {
    if (!podeSalvar) return;
    for (const r of await local.todos()) if (vaiParaNuvem(r.ficha) && !(r.ficha.nuvem && r.ficha.nuvem.versao) && r.ficha.status !== 'lixeira') fila.por(r.id);
  }
  const parar = banco.ouvir ? banco.ouvir((ficha) => {
    if (!podeSalvar || !vaiParaNuvem(ficha)) return;
    fila.por(ficha.id);
    clearTimeout(relogio); relogio = setTimeout(enviar, espera);
  }) : () => {};
  return {
    async iniciar() { await primeiraVez(); const r1 = await trazer(); const r2 = await enviar(); return { trazer: r1, enviar: r2 }; },
    puxar: trazer,
    enviar,
    parar() { vivo = false; clearTimeout(relogio); parar(); },
    /** 'enviando' · 'na-fila' · 'nuvem' · 'aparelho' (para a tela mostrar) */
    situacao(ficha) {
      if (!ficha || !vaiParaNuvem(ficha)) return 'aparelho';
      if (enviando.has(ficha.id)) return 'enviando';
      if (fila.lista().includes(ficha.id)) return 'na-fila';
      return ficha.nuvem && ficha.nuvem.versao ? 'nuvem' : 'na-fila';
    },
  };
}
