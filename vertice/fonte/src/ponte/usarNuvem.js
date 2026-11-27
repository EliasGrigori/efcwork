/* Vértice Docs · v0.6.75 (P4): a nuvem do Cwork na tela.
   Dentro do Cwork, com quem entrou e com a porta da nuvem: traz o que mudou (ao abrir, a cada 2 minutos e quando a internet
   volta) e, para quem salva (Administrador e Líder ★), sobe o que está nas 5 pastas de Documentos internos (nucleo/sincroniza.js).
   Devolve { ligada, pode } para a coluna "Nuvem" de Documentos internos. */
import { useEffect, useState } from 'react';
import { ponteDoCwork } from '../nucleo/loginCwork.js';
import { remotoDoCwork, filaNoAparelho, criarSincronia } from '../nucleo/sincroniza.js';

export function usarNuvem({ banco, login, demo, recarregar, abertoRef, recarregarAberto, avisarRef }) {
  const [nuvem, setNuvem] = useState({ ligada: false, pode: false });
  const [, setVez] = useState(0); /* v0.6.77: redesenha quando muda um erro */
  const chave = login ? login.uid + '|' + login.perfil : '';
  useEffect(() => {
    const ponte = ponteDoCwork(), remoto = remotoDoCwork(ponte);
    if (!login || !remoto || demo) { setNuvem({ ligada: false, pode: false }); return undefined; }
    let u = null; try { u = ponte.usuario(); } catch { u = null; }
    const pode = !!(u && u.salvar);
    let s0 = null;
    setNuvem({ ligada: true, pode, erro: (id) => (s0 ? s0.erro(id) : null), erroReceber: () => (s0 ? s0.erroReceber() : null),
      tentar: (id) => { if (s0) { s0.tentar(id).catch(() => {}); setVez((n) => n + 1); } } });
    let guarda = null; try { guarda = window.localStorage; } catch { guarda = null; }
    const s = criarSincronia({ banco, remoto, fila: filaNoAparelho(guarda, login.uid), podeSalvar: pode, quem: login.nome || 'outra pessoa',
      aoMudar: (r) => {
        setVez((n) => n + 1);
        recarregar();
        const a = abertoRef.current, id = a && a.arquivo.ficha.id;
        if (id && (r.baixados || []).includes(id) && !a.sujo) recarregarAberto();
        (r.conflitos || []).forEach(() => avisarRef.current('Alguém salvou este documento na nuvem antes de você. O seu ficou numa cópia em conflito; o original agora é o da nuvem.', { ic: 'aviso', longo: true }));
      } });
    s0 = s;
    s.iniciar().catch(() => { /* sem internet: tenta de novo depois */ });
    const relogio = setInterval(() => { s.puxar().catch(() => {}); if (s.pendentes()) s.enviar(); }, 120000); /* v0.6.77: o que não subiu tenta de novo a cada 2 minutos */
    const voltou = () => { s.puxar().catch(() => {}); s.enviar(); };
    window.addEventListener('online', voltou);
    return () => { s.parar(); clearInterval(relogio); window.removeEventListener('online', voltou); };
  }, [banco, chave, demo]); // eslint-disable-line react-hooks/exhaustive-deps
  return nuvem;
}
