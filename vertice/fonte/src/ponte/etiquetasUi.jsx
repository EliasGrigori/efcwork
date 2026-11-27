/* Vértice Docs · etiquetas das amostras na tela (v0.6.78, etapa 3, EM APROVAÇÃO).
   O Cwork abre #/pedido/et<pid>; aqui o Vértice pede os dados pela porta (recurso 'etiquetas'), abre o modelo de cada
   grupo (planilha da pasta Etiquetas) e mostra as folhas prontas: sem menus, impressora e três pontos (Baixar PDF).
   Ao lado (embaixo no telefone): a lista das amostras, para tirar ou pôr de volta. Nada se escreve aqui (ITEM 279) e nada é
   gravado: o modelo não muda. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icone } from '../ui/comum.jsx';
import { svgDaPagina } from '../planilha/paginaDesenho.js';
import { imprimirPaginas } from '../planilha/imprimirLivro.js';
import { pdfDasPaginas, imagensDasPaginas, baixarBytes } from '../planilha/impressaoPdf.js';
import { ponteDoCwork } from '../nucleo/loginCwork.js';
import { avisarCwork } from '../nucleo/emCwork.js';
import { folhasDeEtiquetas, gruposDoPedido } from './etiquetas.js';
import './etiquetas.css';

const n = (q, um, varios) => `${q} ${q === 1 ? um : varios}`;

function Pontos({ aoPdf }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (ev) => { if (ref.current && !ref.current.contains(ev.target)) setAberto(false); };
    const esc = (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); setAberto(false); } };
    addEventListener('pointerdown', fora, true); addEventListener('keydown', esc, true);
    return () => { removeEventListener('pointerdown', fora, true); removeEventListener('keydown', esc, true); };
  }, [aberto]);
  return (
    <div className="md-mais" ref={ref}>
      <button type="button" className="iconbtn md-bt" data-md-mais aria-label="Mais opções" aria-haspopup="menu" aria-expanded={aberto} onClick={() => setAberto(!aberto)}><span className="md-pontos"><Icone n="mais" /></span></button>
      {aberto && <div className="md-menu" role="menu"><button type="button" role="menuitem" data-md-item="pdf" onClick={() => { setAberto(false); aoPdf(); }}><Icone n="pdf" />Baixar PDF</button></div>}
    </div>
  );
}

export function TelaEtiquetas({ pid, banco, fichas, avisar }) {
  const [pedido, setPedido] = useState(undefined); // undefined = lendo; null = não está no Cwork
  const [modelos, setModelos] = useState({}); // docId → { nome, conteudo } | { falta: true }
  const [fora, setFora] = useState(() => new Set());

  useEffect(() => {
    try { const p = ponteDoCwork(); setPedido(p && p.etiquetas && typeof p.etiquetas.ler === 'function' ? p.etiquetas.ler(pid) || null : null); } catch { setPedido(null); }
  }, [pid]);
  const grupos = useMemo(() => gruposDoPedido(pedido), [pedido]);

  /* os modelos vêm do aparelho (a nuvem traz os da pasta Etiquetas); o que ainda não chegou tenta de novo quando a lista muda */
  useEffect(() => {
    let vivo = true;
    (async () => {
      const novo = {};
      for (const g of grupos) {
        const r = await banco.abrir(g.docId).catch(() => null);
        novo[g.docId] = r && r.ficha.tipo === 'planilha' && r.ficha.status !== 'lixeira' ? { nome: r.ficha.nome, conteudo: r.conteudo } : { falta: true };
      }
      if (vivo) setModelos(novo);
    })();
    return () => { vivo = false; };
  }, [grupos, banco, fichas]);


  const montado = useMemo(() => grupos.map((g) => {
    const m = modelos[g.docId];
    if (!m) return { ...g, lendo: true, paginas: [] };
    if (m.falta) return { ...g, nome: '', erro: 'Este modelo ainda não está neste aparelho (pasta Etiquetas do Vértice).', paginas: [] };
    const dentro = g.amostras.filter((a) => !fora.has(a.id));
    if (!dentro.length) return { ...g, nome: m.nome, paginas: [], vazio: true };
    const r = folhasDeEtiquetas(m.conteudo, dentro.map((a) => a.dados), { nomeArquivo: m.nome });
    return { ...g, nome: m.nome, paginas: r.paginas || [], erro: r.erro || '', porFolha: r.porFolha, dentro: dentro.length };
  }), [grupos, modelos, fora]);

  const paginas = useMemo(() => montado.flatMap((g) => g.paginas), [montado]);
  const total = montado.reduce((s, g) => s + (g.dentro || 0), 0);
  const lendo = pedido === undefined || montado.some((g) => g.lendo);
  const titulo = 'Etiquetas das amostras';
  /* a aba do Cwork mostra o nome (depois do aviso do App, que diz que não há arquivo aberto) */
  useEffect(() => { const t = setTimeout(() => avisarCwork({ tipo: 'arquivo', nome: titulo, tipoArquivo: 'planilha' }), 300); return () => clearTimeout(t); }, [lendo]);

  const imprimir = useCallback(async () => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    try { await imprimirPaginas(paginas, titulo); } catch (e) { avisar('Não deu para imprimir: ' + (e.message || e), { ic: 'aviso', longo: true }); }
  }, [paginas, avisar]);
  const baixarPdf = useCallback(async () => {
    try { baixarBytes(pdfDasPaginas(paginas, { titulo, imagens: await imagensDasPaginas(paginas) }), 'Etiquetas das amostras.pdf'); } catch (e) { avisar('Não deu para gerar o PDF: ' + (e.message || e), { ic: 'aviso', longo: true }); }
  }, [paginas, avisar]);
  useEffect(() => {
    if (!paginas.length) return undefined;
    const tecla = (ev) => { if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === 'p') { ev.preventDefault(); imprimir(); } };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [paginas, imprimir]);

  const alternar = (id) => setFora((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });

  if (pedido === null) {
    return <div className="md md-et" data-etiquetas="sem-pedido"><header className="md-barra"><span className="md-nome">{titulo}</span></header>
      <p className="md-vazio">Este pedido de etiquetas não está mais no Cwork. Peça de novo pela tela de Amostras.</p></div>;
  }
  return (
    <div className="md md-et" data-etiquetas={lendo ? 'lendo' : paginas.length ? 'pronto' : 'vazio'} data-orient={paginas[0] && paginas[0].W > paginas[0].H ? 'paisagem' : 'retrato'}>
      <header className="md-barra">
        <span className="md-nome" title={titulo}>{titulo}</span>
        {paginas.length > 0 && <button type="button" className="iconbtn md-bt" data-md-imprimir aria-label="Imprimir" title="Imprimir" onClick={imprimir}><Icone n="imprimir" /></button>}
        {paginas.length > 0 && <Pontos aoPdf={baixarPdf} />}
      </header>
      <div className="md-corpo">
        <main className="md-folhas" id="conteudo">
          {lendo && <p className="md-vazio">Montando as etiquetas…</p>}
          {!lendo && !paginas.length && <p className="md-vazio">{montado.find((g) => g.erro) ? montado.find((g) => g.erro).erro : 'Todas as etiquetas foram tiradas.'}</p>}
          {paginas.map((pg, i) => (
            <div key={i} className="md-folha" style={{ width: `min(100%, ${Math.round(pg.W * 4 / 3)}px)`, aspectRatio: `${pg.W} / ${pg.H}` }}>
              <div className="md-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgDaPagina(pg, { id: 'et' + i + '_' }) }} />
            </div>
          ))}
        </main>
        {!lendo && (
          <aside className="resumo-envio et-painel" aria-label="Etiquetas" data-et-painel>
            <div className="re-cab"><div><b>Etiquetas</b><span data-et-conta>{n(total, 'etiqueta', 'etiquetas')} · {n(paginas.length, 'folha', 'folhas')}</span></div></div>
            {montado.map((g) => (
              <section key={g.docId} className="et-grupo" data-et-grupo={g.docId}>
                <div className="et-gcab"><b>{g.nome || 'Modelo'}</b><span>{g.erro ? '' : `${g.dentro || 0} de ${g.amostras.length}${g.porFolha ? ' · ' + g.porFolha + ' por folha' : ''}`}</span></div>
                {g.erro && <p className="et-erro" data-et-erro>{g.erro}</p>}
                <ul className="et-lista">
                  {g.amostras.map((a) => (
                    <li key={a.id}><label className={'et-am' + (fora.has(a.id) ? ' fora' : '')}>
                      <input type="checkbox" checked={!fora.has(a.id)} data-et-amostra={a.id} onChange={() => alternar(a.id)} />
                      <span>{a.rotulo || a.id}</span></label></li>
                  ))}
                </ul>
              </section>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
