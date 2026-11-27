/* Vértice Docs · v0.6.80: a folha preenchida pelo Cwork que a pessoa abriu para escrever à mão (só na memória desta tela).
   O pedido guarda aqui e o modo documento pega uma vez; nada vai para o banco nem para o modelo. */
const guardadas = new Map();
export function guardarFolha(docId, folha) { guardadas.set(String(docId), folha); }
export function pegarFolha(docId) { const f = guardadas.get(String(docId)); guardadas.delete(String(docId)); return f || null; }
