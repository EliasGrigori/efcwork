/* Vértice Docs · tema do Cwork (v0.6.81, decisão do Elias de 27/11):
   - Aberto pelo Cwork (moldura do mesmo site), o Vértice usa o Claro/Escuro do Cwork e troca junto (o Cwork marca
     <html data-tema="claro|escuro">). Aberto sozinho, continua com o tema dele (prefs.tema).
   - No Escuro, a área de preencher (planilha, quadro) fica branca como no Excel; em Aparência › "Área de trabalho escura"
     ele escolhe deixar escura (prefs.areaEscura; vale também fora do Cwork).
   Parte sem tela (testada no node). */
import { useEffect, useState } from 'react';
import { molduraDoCwork } from './emCwork.js';

/** 'claro' | 'escuro' do Cwork → o id do tema do Vértice ('papel' | 'dark'); null fora do Cwork ou sem a marca. */
export function temaDoCwork(win = typeof window !== 'undefined' ? window : null) {
  try {
    if (!win || !molduraDoCwork(win.location, win)) return null;
    const t = win.parent.document.documentElement.getAttribute('data-tema');
    return t === 'escuro' ? 'dark' : t === 'claro' ? 'papel' : null;
  } catch { return null; }
}

/** O tema do Cwork, acompanhando as trocas (observa o <html> da página de fora). */
export function usarTemaCwork() {
  const [t, setT] = useState(() => temaDoCwork());
  useEffect(() => {
    let ob = null;
    try {
      if (!molduraDoCwork()) return undefined;
      ob = new MutationObserver(() => setT(temaDoCwork()));
      ob.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
    } catch { return undefined; }
    return () => { if (ob) ob.disconnect(); };
  }, []);
  return t;
}

/** A área de preencher fica clara? Só no tema escuro faz diferença: clara, a não ser que ele tenha escolhido escura. */
export const areaClara = (body = typeof document !== 'undefined' ? document.body : null) => !!body && body.dataset.theme === 'dark' && !body.classList.contains('area-escura');
