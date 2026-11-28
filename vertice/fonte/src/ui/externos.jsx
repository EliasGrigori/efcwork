/* Vértice Docs v0.6.82 · Documentos externos: PDFs guardados no Vértice (decisão do Elias de 27/11 06:59:
   todo documento mora só no Vértice; o Cwork guarda só a ligação). O PDF importado aqui ou pelo Cwork
   (Documentos › Impressos) entra numa das 5 pastas e sobe para a nuvem como os outros arquivos.
   Ver, imprimir, baixar e trocar pela versão nova; quem não salva só vê, imprime e baixa. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ativos, criarArquivo, carimbar } from '../nucleo/modelo.js';
import { conteudoDoArquivo, blobDoPdf, nomeSemExtensao, tipoDoArquivo } from '../nucleo/pdf.js';
import { Janela, Icone, dataHora } from './comum.jsx';
import { CabPagina, SeloTotal, TabelaArquivos, Tr } from './listas.jsx';
import { useFiltro, LimparFiltros, aplicarFiltro, FILTRO_PADRAO, BotaoDetalhes, COL_NOME, COL_QUANDO, COL_ACOES } from './paginas.jsx';
import { usarTabela } from './colunas.jsx';
import { filtrarPorColunas, temAlgoParaLimpar } from './tabelaColunas.js';
import { Situacao, dadosDoArquivo } from './gaveta.jsx';
import { situacaoNuvem } from './internos.jsx';
import { SUBABAS } from '../ponte/ponte.js';
import './externos.css';

/* "Abrir" um PDF (de qualquer lista do Vértice) vem para cá: App manda para #/externos e pede para ver */
const PEDIDO = { id: null };
export function verPdfDepois(id) { PEDIDO.id = id; try { dispatchEvent(new CustomEvent('vt-ver-pdf', { detail: id })); } catch { /* sem janela (node) */ } }

const paginasTx = (n) => (n ? n + (n === 1 ? ' página' : ' páginas') : '');
const colunasExternos = (nuvem) => [
  { id: 'codigo', rot: 'Código', cls: 'c-codigo', v: (x) => x.codigo || '' }, COL_NOME, COL_QUANDO,
  { id: 'nuvem', rot: 'Nuvem', cls: 'c-nuvem', v: (x) => situacaoNuvem(nuvem, x) }, COL_ACOES,
];

export function DocsExternos({ fichas, lendo, nuvem, cx, editar }) {
  const todos = useMemo(() => ativos(fichas).filter((f) => f.tipo === 'pdf'), [fichas]);
  const [f] = useFiltro('externos');
  const colunas = colunasExternos(nuvem);
  const st = usarTabela('externos');
  const base = aplicarFiltro([...todos].sort((a, b) => (b.alteradoEm || '').localeCompare(a.alteradoEm || '')), FILTRO_PADRAO);
  const lista0 = filtrarPorColunas(base, colunas, st);
  const [escolhida, setSub] = useState(null);
  const abas = [...SUBABAS, ...new Set(todos.map((x) => x.pastaNome || 'Sem pasta').filter((n) => !SUBABAS.includes(n)))];
  const pastaDe = (x) => x.pastaNome || 'Sem pasta';
  const qt = (n) => lista0.filter((x) => pastaDe(x) === n).length;
  const sub = escolhida && abas.includes(escolhida) ? escolhida : abas.find(qt) || abas[0];
  const lista = lista0.filter((x) => pastaDe(x) === sub);
  const pode = cx.pode('arquivo.criar') && (!nuvem || !nuvem.ligada || nuvem.pode);
  const [importar, setImportar] = useState(null); /* { pasta } */
  const [ver, setVer] = useState(null); /* id */
  useEffect(() => {
    if (PEDIDO.id) { setVer(PEDIDO.id); PEDIDO.id = null; }
    const ouvir = (ev) => { setVer(ev.detail); PEDIDO.id = null; };
    addEventListener('vt-ver-pdf', ouvir);
    return () => removeEventListener('vt-ver-pdf', ouvir);
  }, []);
  return (
    <div className="pagina pg-lista internos externos">
      <CabPagina titulo="Documentos externos" meta={<SeloTotal n={lista0.length} total={todos.length} unidade={['PDF', 'PDFs']} lendo={lendo} />}>
        {pode && <button type="button" className="btn pg-novo" data-ext-importar onClick={() => setImportar({ pasta: SUBABAS.includes(sub) ? sub : SUBABAS[1] })}><Icone n="importar" />Importar PDF</button>}
      </CabPagina>
      <div className="efl-abas-linha">
        <div className="int-abas" role="tablist" aria-label="Pastas dos documentos externos">
          {abas.map((n) => (
            <button key={n} type="button" role="tab" aria-selected={sub === n} className={'int-aba' + (sub === n ? ' on' : '')} data-ext-sub={n} onClick={() => setSub(n)}>
              {n}{qt(n) ? <span className="qt">{qt(n)}</span> : null}
            </button>
          ))}
        </div>
        <div className="efl-ferramentas">{temAlgoParaLimpar(st) && <LimparFiltros tabela="externos" />}</div>
      </div>
      <TabelaArquivos nome="externos" rotulo={'Documentos externos: ' + sub} colunas={colunas} itens={lista} base={base.filter((x) => pastaDe(x) === sub)} unidade={['PDF', 'PDFs']} lendo={lendo} reinicia={sub + '|' + f.q + '|' + f.ordem}
        vazio={todos.length ? `Nenhum PDF em ${sub}.` : 'Os PDFs que vêm de fora (certificados, laudos, normas, POPs em PDF) ficam aqui, separados pelas 5 pastas. Use "Importar PDF" (ou a foto de um papel).'}
        detalhe={(x) => dadosDoArquivo(x, cx, { situacoes: [{ tom: x.nuvem && x.nuvem.versao ? 'ok' : '', texto: situacaoNuvem(nuvem, x) }], acoes: [
          { id: 'ver', rotulo: 'Ver o PDF', ic: 'pdf', tipo: 'ouro', fazer: () => setVer(x.id) },
          { id: 'subaba', rotulo: 'Pasta e código', ic: 'renomear', fazer: () => editar(x) },
        ] })}
        linha={(x, extra) => (
          <Tr className={'arq' + (extra.naGaveta ? ' na-gaveta' : '')} key={x.id} data-id={x.id}>
            <td className="c-codigo">{x.codigo || ''}</td>
            <td className="c-nome">
              <button type="button" className="abre" title={x.nome} data-ext-ver={x.id} onClick={() => setVer(x.id)}>
                <span className="ri"><Icone n="pdf" /></span>
                <span className="txt"><b>{x.nome}</b><span className="so-cel">{x.codigo || ''}</span></span>
              </button>
            </td>
            <td className="c-quando">{dataHora(x.alteradoEm)}</td>
            <td className="c-nuvem"><Situacao tom={x.nuvem && x.nuvem.versao ? 'ok' : ''} data-int-nuvem={x.id}>{situacaoNuvem(nuvem, x)}</Situacao></td>
            <td className="c-acoes"><span className="acoes">
              <BotaoDetalhes nome={x.nome} extra={extra} />
              <button type="button" className="iconbtn" aria-label={'Pasta e código: ' + x.nome} title="Pasta e código" onClick={() => editar(x)}><Icone n="renomear" /></button>
            </span></td>
          </Tr>
        )} />
      {importar && <JanelaImportarPdf pasta={importar.pasta} cx={cx} aoFechar={() => setImportar(null)} />}
      {ver && <VerPdf id={ver} cx={cx} pode={pode} aoFechar={() => setVer(null)} />}
    </div>
  );
}

/** Importar um PDF (ou a foto de um papel, que vira PDF) para uma das 5 pastas. */
export function JanelaImportarPdf({ pasta, cx, aoFechar, trocar }) {
  const [arq, setArq] = useState(null), [nome, setNome] = useState(trocar ? trocar.nome : ''), [onde, setOnde] = useState(pasta || SUBABAS[1]);
  const [erro, setErro] = useState(''), [indo, setIndo] = useState(false);
  const escolher = (fl) => { setErro(''); if (!fl) return; if (!tipoDoArquivo(fl)) { setErro('Escolha um PDF ou a foto de um papel (JPG ou PNG).'); return; } setArq(fl); if (!trocar && !nome) setNome(nomeSemExtensao(fl.name)); };
  const ok = arq && (trocar || (nome.trim() && onde)) && !indo;
  const fazer = async () => {
    setIndo(true); setErro('');
    try {
      const conteudo = await conteudoDoArquivo(arq);
      if (trocar) {
        const r = await cx.banco.abrir(trocar.id);
        if (!r) throw new Error('Esse PDF não está mais neste aparelho.');
        const a = carimbar({ ficha: { ...r.ficha, rev: (r.ficha.rev || 0) + 1 }, conteudo }, cx.eu());
        await cx.banco.salvar(a, 'trocou o PDF');
        cx.avisar(`"${a.ficha.nome}" agora está na versão nova.`, { ic: 'check' });
      } else {
        const a = criarArquivo({ tipo: 'pdf', nome: nome.trim(), autor: cx.eu() });
        a.ficha.pastaNome = onde; a.conteudo = conteudo;
        await cx.banco.criar(a);
        cx.avisar(`"${a.ficha.nome}" entrou em ${onde}.`, { ic: 'check' });
      }
      await cx.recarregar();
      aoFechar(true);
    } catch (e) { setErro(String((e && e.message) || e)); setIndo(false); }
  };
  return (
    <Janela titulo={trocar ? 'Trocar pela versão nova' : 'Importar PDF'} icone="importar" subtitulo={trocar ? trocar.nome : 'PDF ou a foto de um papel'} aoFechar={aoFechar} classe="ext-janela"
      rodape={<>
        <button type="button" className="btn sm" onClick={aoFechar}>Cancelar</button>
        <button type="button" className="btn sm primary" data-ext-ok disabled={!ok} onClick={fazer}>{indo ? 'Guardando…' : trocar ? 'Trocar' : 'Importar'}</button>
      </>}>
      <div className="janela-c int-campos">
        <label className="campo"><span>Arquivo</span>
          <input type="file" accept="application/pdf,.pdf,image/jpeg,image/png,image/webp" data-ext-arq onChange={(ev) => escolher(ev.target.files && ev.target.files[0])} />
        </label>
        {!trocar && (
          <div className="ext-par">
            <label className="campo"><span>Nome</span><input value={nome} maxLength={120} data-ext-nome onChange={(ev) => setNome(ev.target.value)} /></label>
            <label className="campo"><span>Pasta</span>
              <select value={onde} data-ext-pasta onChange={(ev) => setOnde(ev.target.value)}>{SUBABAS.map((n) => <option key={n} value={n}>{n}</option>)}</select>
            </label>
          </div>
        )}
        {erro ? <small className="ext-erro" role="alert">{erro}</small> : <small className="op-dica">A foto de um papel vira um PDF de uma página. O PDF sobe para a nuvem e o Cwork mostra em Documentos › Impressos.</small>}
      </div>
    </Janela>
  );
}

/** Ver o PDF: folha na tela, imprimir, baixar e (quem salva) trocar pela versão nova. */
export function VerPdf({ id, cx, pode, aoFechar }) {
  const [rec, setRec] = useState(null), [url, setUrl] = useState(''), [erro, setErro] = useState(''), [trocar, setTrocar] = useState(false), [vez, setVez] = useState(0);
  const quadro = useRef(null);
  /* celular e tablet: o navegador não mostra PDF dentro do quadro e imprime em branco (revisor); abre o PDF no visualizador do aparelho */
  const toque = (() => { try { return matchMedia('(pointer: coarse)').matches || navigator.pdfViewerEnabled === false; } catch { return false; } })();
  const abrirFora = () => { const w = window.open(url, '_blank'); if (!w) baixar(); };
  useEffect(() => {
    let vivo = true, u = '';
    cx.banco.abrir(id).then((r) => {
      if (!vivo) return;
      if (!r || r.ficha.tipo !== 'pdf' || !r.conteudo || !r.conteudo.pdf) { setErro('Esse PDF não está neste aparelho.'); return; }
      u = URL.createObjectURL(blobDoPdf(r.conteudo)); setRec(r); setUrl(u);
    }).catch((e) => vivo && setErro(String((e && e.message) || e)));
    return () => { vivo = false; if (u) URL.revokeObjectURL(u); };
  }, [id, vez]);
  const nome = rec ? rec.ficha.nome : 'PDF';
  const imprimir = () => { if (toque || !quadro.current) return abrirFora(); try { quadro.current.contentWindow.focus(); quadro.current.contentWindow.print(); } catch { abrirFora(); } };
  const baixar = () => { const a = document.createElement('a'); a.href = url; a.download = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '').trim() + '.pdf'; /* sem acento: o Chromium troca por "download" */ document.body.appendChild(a); a.click(); a.remove(); };
  const c = rec ? rec.conteudo : null;
  return (
    <>
      <Janela titulo={nome} icone="pdf" subtitulo={c ? [rec.ficha.pastaNome, paginasTx(c.paginas), c.origem === 'foto' ? 'veio de uma foto' : ''].filter(Boolean).join(' · ') : ''} aoFechar={aoFechar} classe={'ext-ver' + (c && c.orient === 'paisagem' ? ' deitado' : '')}
        rodape={<>
          {pode && rec && <button type="button" className="btn sm" data-ext-trocar onClick={() => setTrocar(true)}>Trocar pela versão nova</button>}
          <button type="button" className="iconbtn" aria-label="Baixar o PDF" title="Baixar o PDF" data-ext-baixar disabled={!url} onClick={baixar}><Icone n="baixar" /></button>
          <button type="button" className="iconbtn" aria-label="Imprimir" title="Imprimir" data-ext-imprimir disabled={!url} onClick={imprimir}><Icone n="imprimir" /></button>
        </>}>
        <div className="ext-folha">
          {erro ? <p className="ext-erro" role="alert">{erro}</p>
            : url && toque ? <button type="button" className="btn ext-abrir" data-ext-abrir onClick={abrirFora}><Icone n="pdf" />Abrir o PDF</button>
            : url ? <iframe ref={quadro} src={url} title={'PDF: ' + nome} data-ext-quadro />
              : <p className="op-dica">Abrindo…</p>}
        </div>
        {rec && <small className="ext-pe">{'Alterado por ' + (rec.ficha.alteradoPor || '—') + ' em ' + dataHora(rec.ficha.alteradoEm)}</small>}
      </Janela>
      {trocar && rec && <JanelaImportarPdf trocar={rec.ficha} cx={cx} aoFechar={(feito) => { setTrocar(false); if (feito) setVez((n) => n + 1); }} />}
    </>
  );
}
