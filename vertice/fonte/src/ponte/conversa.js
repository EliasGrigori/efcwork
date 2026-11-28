/* Vértice Docs · v0.6.85 · conversa do cartão pela conta do Cwork (plano Conversas do Elias, 28/11 10:4x, decisão 3).
   - Aberto pelo Cwork (login da P2), o comentário e a resposta do Kanban e do post-it guardam também a conta de quem escreveu
     (notaAi no comentário, ai em cada resposta), além do nome de sempre (notaA, a).
   - Depois de gravar no arquivo, o Vértice chama a porta do Cwork (recurso 'conversas'): o Cwork guarda a mensagem na conversa
     do cartão, avisa no sino quem participa + o responsável do cartão, e tocar no aviso abre este cartão (#/arq/<id>/c/<cartão>).
   - Sem o Cwork (modo de teste, outro site) nada muda: o comentário fica só no arquivo, como antes.
   Parte sem tela (testada no node). */
import { ponteDoCwork } from '../nucleo/loginCwork.js';
import { loginDoCwork } from '../nucleo/quem.js';

/* o arquivo aberto no Quadro (o Quadro avisa aqui ao abrir) */
let arquivo = null;
export const definirArquivoDaConversa = (f) => { arquivo = f && f.id ? { id: String(f.id), nome: String(f.nome || '') } : null; };
export const arquivoDaConversa = () => arquivo;

/** A conta de quem escreve agora (só aberto pelo Cwork). */
export const contaDeQuemEscreve = () => { const l = loginDoCwork(); return l && l.uid ? String(l.uid).slice(0, 128) : ''; };

/** As contas que já estão na conversa do cartão (quem comentou e quem respondeu pelo Cwork). */
export function contasDaConversa(it) {
  const l = [it && it.notaAi].concat(Array.isArray(it && it.notaR) ? it.notaR.map((r) => r && r.ai) : []);
  return [...new Set(l.filter((x) => typeof x === 'string' && x))];
}

/** O cartão que a rota pede: #/arq/<arquivo>/c/<cartão>. */
export function cartaoDaRota(hash = typeof location !== 'undefined' ? location.hash : '') {
  const m = /\/c\/([^/?#]+)$/.exec(String(hash || ''));
  if (!m) return '';
  try { return decodeURIComponent(m[1]); } catch { return ''; }
}

/** Tira o /c/<cartão> do endereço depois de abrir (sem passo no voltar): o próximo toque no mesmo cartão abre de novo. */
export function tirarCartaoDaRota() {
  try { if (/\/c\/[^/?#]+$/.test(location.hash)) history.replaceState(history.state, '', location.href.replace(/\/c\/[^/?#]+$/, '')); } catch { /* sem history: fica */ }
}

/** Avisa o Cwork (o sino e a conversa). texto = o que acabou de ser escrito. Devolve true quando a porta recebeu. */
export function avisarConversa(it, texto, f = arquivo, win) {
  const p = ponteDoCwork(win), t = String(texto || '').trim();
  if (!p || !loginDoCwork() || !t || !it || !it.id || !f || !f.id) return false;
  const c = p.conversas;
  if (!Array.isArray(p.recursos) || p.recursos.indexOf('conversas') < 0 || !c || typeof c.avisar !== 'function') return false;
  const titulo = String(it.tit || '').trim() || String(it.texto || '').split('\n')[0].trim();
  try {
    Promise.resolve(c.avisar({ arq: f.id, arqNome: f.nome, item: String(it.id), cod: String(it.cod || ''), titulo: titulo.slice(0, 120), texto: t.slice(0, 1000), resp: it.resp ? [String(it.resp)] : [], ids: contasDaConversa(it) })).catch(() => {});
    return true;
  } catch { return false; }
}
