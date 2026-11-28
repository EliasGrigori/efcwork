/* Vértice Docs · modo documento (etapa 2, v0.6.76; decisões do Elias de 27/11 06:59 e 07:3x).
   O Cwork abre um documento e a pessoa vê só a folha, na orientação do modelo: sem menu, faixa nem abas; escreve só nas
   células liberadas; impressora e três pontinhos ("Atualizar documento" abre o Vértice inteiro). NADA é gravado, nem pelo
   Administrador: o que se escreve fica numa cópia em memória, para imprimir. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icone, Pergunta, Avisos, usarEsc } from './comum.jsx';
import { ResumoEnvio } from './internos.jsx';
import { avisarCwork } from '../nucleo/emCwork.js';
import { abrirParaDocumento, paginasDoDocumento, escreverNoDocumento, textoDoCampo, opcoesDoCampo, rotaDoDocumento } from '../planilha/modoDocumento.js';
import { normalizarImp } from '../planilha/impressao.js';
import { gerarImpressao, imprimirPaginas } from '../planilha/imprimirLivro.js';
import { svgDaPagina } from '../planilha/paginaDesenho.js';
import { pdfDasPaginas, imagensDasPaginas, baixarBytes } from '../planilha/impressaoPdf.js';
import { chave } from '../planilha/ref.js';
import { pegarFolha } from '../ponte/rascunhoPedido.js';
import { responder, apagar, pdfDaResposta } from '../ponte/caixa.js';
import { normalizarPlanilha } from '../planilha/modelo.js';
import './modoDocumento.css';

/** O documento que a rota pede. Quem só entra pelo documento ligado (ITEM 195) também vê "#/arq/<id>" assim. */
export function docDaRota(rota, login) {
  const d = rotaDoDocumento(rota);
  if (d) return d;
  return login && login.soDocumento && rota.startsWith('arq/') ? { id: rota.slice(4), aba: '' } : null;
}

function Campo({ f, pg, conteudo, motor, abaId, aoEscrever }) {
  const [rascunho, setRascunho] = useState(null);
  const desistiu = useRef(false);
  const valor = textoDoCampo(conteudo, motor, abaId, f.l, f.c);
  const opcoes = opcoesDoCampo(conteudo, motor, abaId, f.l, f.c);
  const estilo = {
    left: (f.x / pg.W) * 100 + '%', top: (f.y / pg.H) * 100 + '%', width: (f.w / pg.W) * 100 + '%', height: (f.h / pg.H) * 100 + '%',
    '--tam': (f.tam / pg.W) * 100 + 'cqw', textAlign: f.al === 'c' ? 'center' : f.al === 'd' ? 'right' : 'left', fontWeight: f.b ? 700 : 400,
  };
  const nome = 'Célula ' + chave(f.l, f.c);
  const comum = { className: 'md-campo', style: estilo, 'data-campo': f.l + ',' + f.c, 'aria-label': nome };
  if (opcoes) {
    return (
      <select {...comum} value={valor} onChange={(ev) => aoEscrever(f, ev.target.value)}>
        <option value="">&nbsp;</option>
        {!opcoes.includes(valor) && valor !== '' && <option value={valor}>{valor}</option>}
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const confirmar = () => {
    const t = rascunho; setRascunho(null);
    if (desistiu.current) { desistiu.current = false; return; }
    if (t !== null && t !== valor) aoEscrever(f, t);
  };
  const Caixa = f.qb ? 'textarea' : 'input';
  return (
    <Caixa {...comum} value={rascunho === null ? valor : rascunho} autoComplete="off" spellCheck="false"
      onFocus={() => { desistiu.current = false; setRascunho(valor); }}
      onChange={(ev) => setRascunho(ev.target.value)}
      onBlur={confirmar}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); desistiu.current = true; ev.target.blur(); return; }
        if (ev.key !== 'Enter' || ev.altKey || ev.shiftKey) return;
        ev.preventDefault();
        const todos = [...document.querySelectorAll('.md-campo')], i = todos.indexOf(ev.target);
        const prox = todos[i + 1];
        if (prox) prox.focus(); else ev.target.blur();
      }} />
  );
}

function MenuPontos({ itens }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  usarEsc(() => setAberto(false), aberto, ref);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (ev) => { if (ref.current && !ref.current.contains(ev.target)) setAberto(false); };
    addEventListener('pointerdown', fora, true);
    return () => removeEventListener('pointerdown', fora, true);
  }, [aberto]);
  return (
    <div className="md-mais" ref={ref}>
      <button type="button" className="iconbtn md-bt" data-md-mais aria-label="Mais opções" aria-haspopup="menu" aria-expanded={aberto} onClick={() => setAberto(!aberto)}><span className="md-pontos"><Icone n="mais" /></span></button>
      {aberto && (
        <div className="md-menu" role="menu">
          {itens.map((x) => <button key={x.id} type="button" role="menuitem" data-md-item={x.id} onClick={() => { setAberto(false); x.fazer(); }}><Icone n={x.ic} />{x.rot}</button>)}
        </div>
      )}
    </div>
  );
}

export function ModoDocumento({ id, abaPedida, banco, fichas, lendo, login, avisar, perguntar, canal, resumo, fecharResumo, preencherDoResumo }) {
  const [doc, setDoc] = useState(null); // { ficha, abaId, versao }
  const [conteudo, setConteudo] = useState(null);
  const [falta, setFalta] = useState('');
  const [escreveu, setEscreveu] = useState(false);
  const [mudouAqui, setMudouAqui] = useState(false); /* o Vértice inteiro gravou este documento em outra aba deste aparelho */
  const atual = useRef(null);
  const pedidoRef = useRef(null); /* v0.6.81: o pedido do Cwork de onde veio a folha aberta (ou null) */
  const naLista = fichas.find((f) => f.id === id) || null;
  const versaoNova = naLista && naLista.nuvem ? naLista.nuvem.versao : 0;

  const carregar = useCallback(async () => {
    const r = await banco.abrir(id);
    if (!r || r.ficha.status === 'lixeira') { setDoc(null); setFalta('nao'); return; }
    const d = abrirParaDocumento(r, abaPedida);
    if (!d) { setDoc({ ficha: r.ficha, abaId: null, versao: 0 }); setFalta('tipo'); return; }
    /* v0.6.80: veio do pedido do Cwork já preenchido ("Escrever nesta folha"): parte da folha preenchida, só na memória */
    const pf = pegarFolha(id);
    if (pf && pf.conteudo) { d.conteudo = normalizarPlanilha(structuredClone(pf.conteudo)); if (pf.abaId && d.conteudo.abas[pf.abaId]) d.abaId = pf.abaId; }
    pedidoRef.current = pf && pf.pedido ? { item: pf.pedido, umaFolha: !!pf.umaFolha } : null; /* v0.6.81: a folha veio do pedido do Cwork: imprimir aqui também avisa "preenchido" */
    atual.current = d.conteudo;
    setConteudo(d.conteudo); setEscreveu(!!pf); setMudouAqui(false); setFalta('');
    setDoc({ ficha: r.ficha, abaId: d.abaId, versao: (r.ficha.nuvem && r.ficha.nuvem.versao) || 0 });
  }, [banco, id, abaPedida]);

  useEffect(() => { setDoc(null); setConteudo(null); setFalta(''); carregar().catch((e) => { setFalta('erro'); avisar('Não deu para abrir o documento: ' + (e.message || e), { ic: 'aviso', longo: true }); }); }, [carregar]); // eslint-disable-line react-hooks/exhaustive-deps
  /* chegou da nuvem depois (primeira vez neste aparelho) ou veio versão nova: sem nada escrito, troca sozinho */
  useEffect(() => { if (falta === 'nao' && naLista) carregar().catch(() => {}); }, [falta, naLista, carregar]);
  useEffect(() => {
    if (!canal) return undefined;
    const ouvir = (ev) => { const m = ev.data || {}; if (m.t === 'salvou' && m.arq === id) setMudouAqui(true); };
    canal.addEventListener('message', ouvir);
    return () => canal.removeEventListener('message', ouvir);
  }, [canal, id]);
  const temNova = !!(doc && ((versaoNova && versaoNova > doc.versao) || mudouAqui));
  useEffect(() => { if (temNova && !escreveu) carregar().catch(() => {}); }, [temNova, escreveu, carregar]);

  const nome = doc ? doc.ficha.nome : '';
  useEffect(() => { if (nome) { document.title = nome + ' · Vértice Docs'; avisarCwork({ tipo: 'arquivo', nome, tipoArquivo: doc.ficha.tipo }); } }, [nome]); // eslint-disable-line react-hooks/exhaustive-deps

  const montado = useMemo(() => {
    if (!conteudo || !doc || !doc.abaId) return null;
    try { return paginasDoDocumento(conteudo, doc.abaId, doc.ficha.nome); } catch (e) { return { paginas: [], aviso: String((e && e.message) || e), livres: new Set(), motor: null }; }
  }, [conteudo, doc]);

  const escrever = useCallback((f, texto) => {
    const c = atual.current;
    const r = escreverNoDocumento(c, montado.motor, doc.abaId, f.l, f.c, texto);
    if (r.erro) { avisar(r.erro, { ic: 'aviso', longo: true }); return; }
    atual.current = r.conteudo; setConteudo(r.conteudo); setEscreveu(true);
    if (r.aviso) avisar(r.aviso, { ic: 'aviso', longo: true });
  }, [montado, doc, avisar]);

  /* imprimir e PDF saem da cópia em memória, já com o que acabou de ser escrito */
  const paginasAgora = useCallback(async () => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    await new Promise((ok) => setTimeout(ok, 60));
    const p = paginasDoDocumento(atual.current, doc.abaId, doc.ficha.nome);
    if (!p.paginas.length) throw new Error(p.aviso || 'Não há nada para imprimir.');
    return p.paginas;
  }, [doc]);
  /* v0.6.81 (ITEM 286): imprimir ou baixar o PDF da folha que veio do pedido marca o papel da remessa como "Preenchido no Vértice" no Cwork.
     Com uma folha só, o pedido sai da caixa; com várias, continua (as outras folhas ainda podem ser abertas); o Cwork ignora uma segunda resposta. */
  /* v0.6.84 (ITEM 184): leva também como saiu ('imprimir' ou 'pdf') e o PDF preenchido, para o Cwork guardar na remessa */
  const avisarPreenchido = useCallback(async (pags, como, bytes) => { const r = pedidoRef.current; if (!r) return; pedidoRef.current = null; try { await responder(r.item, { ok: true, paginas: pags.length, como, pdf: await pdfDaResposta(pags, doc && doc.ficha.nome, bytes) }); if (r.umaFolha) await apagar(r.item.pid); /* uma folha só: o pedido terminou */ } catch { /* sem a caixa: segue */ } }, [doc]);
  const imprimir = useCallback(async () => {
    try { const pags = await paginasAgora(); await imprimirPaginas(pags, doc.ficha.nome); await avisarPreenchido(pags, 'imprimir'); } catch (e) { avisar('Não deu para imprimir: ' + (e.message || e), { ic: 'aviso', longo: true }); }
  }, [paginasAgora, doc, avisar, avisarPreenchido]);
  const baixarPdf = useCallback(async () => {
    try {
      const pags = await paginasAgora();
      const bytes = pdfDasPaginas(pags, { titulo: doc.ficha.nome, imagens: await imagensDasPaginas(pags) });
      baixarBytes(bytes, `${String(doc.ficha.nome || 'documento').replace(/[\\/:*?"<>|]/g, '_')}.pdf`);
      await avisarPreenchido(pags, 'pdf', bytes);
    } catch (e) { avisar('Não deu para gerar o PDF: ' + (e.message || e), { ic: 'aviso', longo: true }); }
  }, [paginasAgora, doc, avisar, avisarPreenchido]);

  useEffect(() => {
    if (!montado) return undefined;
    const tecla = (ev) => { if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === 'p') { ev.preventDefault(); imprimir(); } };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [montado, imprimir]);

  /* quem salva: "Atualizar documento" abre o Vértice inteiro, com todos os menus */
  const podeAtualizar = !login || !login.semSalvar;
  const irAoVertice = () => { location.hash = '#/arq/' + id; };
  const atualizarDocumento = () => {
    if (!escreveu) { irAoVertice(); return; }
    perguntar({ titulo: 'Abrir o Vértice inteiro?', texto: 'O que você escreveu aqui não vai junto e se perde.', confirmar: 'Abrir', aoConfirmar: irAoVertice });
  };

  const pronto = !!(montado && montado.paginas.length);
  const itens = [];
  if (podeAtualizar && doc) itens.push({ id: 'atualizar', rot: 'Atualizar documento', ic: 'renomear', fazer: atualizarDocumento });
  if (pronto) itens.push({ id: 'pdf', rot: 'Baixar PDF', ic: 'pdf', fazer: baixarPdf });
  const semCampos = pronto && montado.livres.size === 0;
  const soImp = pronto ? normalizarImp(conteudo.abas[doc.abaId].imp) : null;

  return (
    <div className="md" data-modo-documento={doc && !falta ? 'pronto' : falta || 'lendo'} data-orient={soImp ? soImp.orient : undefined}>
      <header className="md-barra">
        <span className="md-nome" title={nome}>{nome}</span>
        {pronto && <button type="button" className="iconbtn md-bt" data-md-imprimir aria-label="Imprimir" title="Imprimir" onClick={imprimir}><Icone n="imprimir" /></button>}
        {itens.length > 0 && <MenuPontos itens={itens} />}
      </header>
      {temNova && escreveu && (
        <div className="md-aviso" role="alert"><span>Há uma versão nova deste documento.</span>
          <button type="button" className="btn sm" data-md-nova onClick={() => perguntar({ titulo: 'Carregar a versão nova?', texto: 'O que você escreveu aqui se perde.', confirmar: 'Carregar', aoConfirmar: () => carregar().catch(() => {}) })}>Carregar</button></div>
      )}
      {semCampos && <p className="md-nota" data-md-sem-campos>Este modelo não tem células liberadas: aqui é só para imprimir.</p>}
      <div className="md-corpo">
        <main className="md-folhas" id="conteudo">
          {falta === 'nao' && <p className="md-vazio">{lendo ? 'Procurando o documento…' : 'Este documento ainda não está neste aparelho.'}</p>}
          {falta === 'tipo' && <p className="md-vazio">Por enquanto, só a planilha abre como documento.</p>}
          {falta === 'erro' && <p className="md-vazio">Não deu para abrir o documento.</p>}
          {montado && !pronto && <p className="md-vazio">{montado.aviso || 'Não há nada para mostrar.'}</p>}
          {pronto && montado.paginas.map((pg, i) => (
            <div key={i} className="md-folha" style={{ width: `min(100%, ${Math.round(pg.W * 4 / 3)}px)`, aspectRatio: `${pg.W} / ${pg.H}` }}>
              <div className="md-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgDaPagina(pg, { id: 'md' + i + '_' }) }} />
              {(pg.campos || []).map((f) => <Campo key={f.l + ',' + f.c} f={f} pg={pg} conteudo={conteudo} motor={montado.motor} abaId={doc.abaId} aoEscrever={escrever} />)}
            </div>
          ))}
        </main>
        {pronto && resumo && resumo.docId === id && <ResumoEnvio resumo={resumo} conteudo={conteudo} avisar={avisar} aoFechar={fecharResumo} aoPreencher={() => preencherDoResumo(conteudo)} />}
      </div>
    </div>
  );
}

/** As telas sem o resto do Vértice: o documento; o arquivo chegando do Cwork; e quem só entra pelo documento ligado. */
export function TelaSemMenus({ doc, pidRota, login, pergunta, fecharPergunta, avisos, tirarAviso, pedido, ...p }) {
  return (
    <div className="app md-app">
      {doc ? <ModoDocumento key={doc.id + '|' + doc.aba} id={doc.id} abaPedida={doc.aba} login={login} {...p} />
        : pedido ? <main className="md-pedido" id="conteudo">{pedido}</main>
          : pidRota ? <div className="md" aria-busy="true" />
            : <main className="md-vazio" id="conteudo" data-md-so-documento>Abra um documento pelo Cwork.</main>}
      {pergunta && <Pergunta p={pergunta} aoFechar={fecharPergunta} />}
      <Avisos lista={avisos} tirar={tirarAviso} menu="oculto" />
    </div>
  );
}
