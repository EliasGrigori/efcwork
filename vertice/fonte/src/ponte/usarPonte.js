/* Vértice Docs — Ponte 1 na tela (v0.6.16): compartilhar com o Cwork, receber o que ele mandou para abrir e o resumo do envio.
   Tudo passa pela caixa de troca do aparelho (contrato/efd-ponte.js). Nada vai para a nuvem daqui. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { criarArquivo } from '../nucleo/modelo.js';
import { guardarOriginal } from '../nucleo/originais.js';
import { irPara } from '../ui/comum.jsx';
import { ponteDoCwork } from '../nucleo/loginCwork.js';
import { EFD, montarEnvio, PODE_COMPARTILHAR, SUBABAS } from './ponte.js';
import { camposDoLivro, camposParaPub } from './campos.js';
import { pedidoDoResumo } from './pedido.js';
import { temCaixa, lerEstado, marcarEstado, porNaCaixa, conferirRecebidos, esperandoAqui, pegar, apagar, ouvir } from './caixa.js';

export const SUBABA_RECEBIDOS = 'Recebidos do Cwork';

/* quem leva para o Vértice precisa salvar no Cwork (o mesmo que a nuvem usa) */
function podeSalvarNoCwork() { try { const p = ponteDoCwork(), u = p && p.usuario ? p.usuario() : null; return !!(u && u.salvar); } catch { return false; } }

export function usarPonte({ banco, fichas, recarregar, avisar, aberto, autor, mudarFichaArquivo, idDocumento }) {
  const [estado, setEstado] = useState(() => lerEstado());
  const [resumo, setResumo] = useState(null);
  const [janela, setJanela] = useState(null); // { ficha?, depois?: gerar }
  const [pedidoLocal, setPedidoLocal] = useState(null); // "Preencher e imprimir" a partir do resumo
  const fichasRef = useRef(fichas); fichasRef.current = fichas;
  const idAberto = aberto ? aberto.arquivo.ficha.id : idDocumento || null; /* v0.6.76: o resumo também vale no modo documento */

  const atualizarEstado = useCallback(async () => { if (temCaixa()) setEstado(await conferirRecebidos()); }, []);

  /* o resumo do envio que está na caixa para o documento aberto (o mais novo) */
  const lerResumo = useCallback(async (docId) => {
    if (!docId || !temCaixa()) { setResumo(null); return; }
    try {
      const itens = (await esperandoAqui()).filter((i) => i.tipo === 'resumo' && i.docId === docId);
      const i = itens[itens.length - 1];
      setResumo(i ? { pid: i.pid, docId, titulo: i.titulo || '', dados: i.dados || {} } : null);
    } catch { setResumo(null); }
  }, []);
  useEffect(() => { lerResumo(idAberto); }, [idAberto, lerResumo]);

  /* ao abrir o app: avisa o que o Cwork deixou para abrir; enquanto aberto: avisa na hora */
  useEffect(() => {
    if (!temCaixa()) return undefined;
    /* v0.6.76: no modo documento não há "Abrir" por cima da folha: o Cwork mesmo leva o endereço */
    const avisarAbrir = (pid, nome) => /^#\/(abrir|documento)\//.test(location.hash) || avisar(`Chegou do Cwork para abrir: ${nome || 'um arquivo'}.`, { ic: 'abrir', acao: { rotulo: 'Abrir', fazer: () => irPara('abrir/' + pid) } });
    /* v0.6.17 (Ponte 2): pedido de impressão com os dados do Cwork */
    const avisarPedido = (i) => { if (/^#\/(abrir|documento|pedido)\//.test(location.hash)) return; const f = fichasRef.current.find((x) => x.id === i.docId); avisar(`O Cwork pediu para imprimir ${f ? '"' + f.nome + '"' : 'um documento'}.`, { ic: 'imprimir', longo: true, acao: { rotulo: 'Ver e imprimir', fazer: () => irPara('pedido/' + i.pid) } }); };
    esperandoAqui().then((l) => { const i = l.filter((x) => x.tipo === 'abrir').pop(); if (i) avisarAbrir(i.pid, i.nomeArquivo); const p = l.filter((x) => x.tipo === 'pedido').pop(); if (p) avisarPedido(p); }).catch(() => {});
    atualizarEstado();
    const parar = ouvir(async (m) => {
      if (m.oQue === 'abrir') { const i = await pegar(m.pid); if (i) avisarAbrir(m.pid, i.nomeArquivo); }
      if (m.oQue === 'resumo') lerResumo(idAberto);
      if (m.oQue === 'pedido') { const i = await pegar(m.pid); if (i) avisarPedido(i); }
    });
    const foco = () => atualizarEstado();
    addEventListener('focus', foco);
    return () => { parar(); removeEventListener('focus', foco); };
  }, [avisar, atualizarEstado, lerResumo, idAberto]);

  /** #/abrir/<pid>: abre o arquivo que o Cwork mandou (o daqui, se já existe; senão, o que veio junto) e mostra o resumo. */
  const abrirDaCaixa = useCallback(async (pid) => {
    try {
      const i = await pegar(pid);
      if (!i || i.tipo !== 'abrir') { avisar('Este pedido do Cwork não está mais na caixa deste aparelho.', { ic: 'aviso', longo: true }); irPara(''); return; }
      /* v0.6.76: pergunta ao banco (a lista da tela pode ainda não ter chegado e o modelo daqui seria trocado pelo do Cwork) */
      const r0 = await banco.backend.um(i.docId), ja = r0 && r0.ficha.status !== 'lixeira' ? r0.ficha : null;
      /* v0.6.82 (2ª parte): "Levar para o Vértice" do Cwork: a planilha entra (ou muda) direto numa das 5 pastas, sobe para a nuvem
         e abre inteira (quem leva é o Administrador ou o Líder ★), para marcar os campos do Cwork */
      const lv = i.levar && SUBABAS.includes(i.levar.pasta) && podeSalvarNoCwork() ? i.levar : null;
      if (lv && ja) {
        await mudarFichaArquivo(ja, { pastaNome: lv.pasta, codigo: ja.codigo || String(lv.codigo || '').slice(0, 20) }); /* o código daqui vale; sem ele, o do Cwork */
        await recarregar(); await apagar(pid);
        avisar(`"${ja.nome}" está em ${lv.pasta}. Marque os campos em Arquivo › Campos do Cwork.`, { ic: 'check', longo: true });
        location.replace('#/arq/' + ja.id); return;
      }
      if (!ja) {
        if (!/\.(xlsx|xlsm)$/i.test(i.nomeArquivo || '')) { avisar(`"${i.nomeArquivo}" é um arquivo que o Vértice ainda não edita (o Documento chega na v0.7.0). Ele continua na caixa.`, { ic: 'aviso', longo: true }); irPara(''); return; }
        const { lerArquivoExcel } = await import('../planilha/xlsx/abrir.js');
        const arq = new File([i.original], i.nomeArquivo, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const r = await lerArquivoExcel(arq);
        const a = criarArquivo({ tipo: 'planilha', nome: i.nomeArquivo.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120), autor, id: i.docId });
        a.ficha.pastaNome = lv ? lv.pasta : SUBABA_RECEBIDOS;
        if (lv) { a.ficha.nome = String(lv.nome || a.ficha.nome).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120); if (lv.codigo) a.ficha.codigo = String(lv.codigo).slice(0, 20); }
        a.conteudo = r.conteudo;
        await banco.criar(a);
        await guardarOriginal(a.ficha.id, { nome: arq.name, tipo: arq.type, blob: arq });
        await recarregar();
        if (lv) { await apagar(pid); avisar(`"${a.ficha.nome}" entrou em ${lv.pasta}. Marque os campos em Arquivo › Campos do Cwork.`, { ic: 'check', longo: true }); location.replace('#/arq/' + a.ficha.id); return; }
      }
      await apagar(pid); /* só depois de guardar */
      /* v0.6.76: aberto pelo Cwork = modo documento (só a folha, ninguém salva); troca o endereço sem criar passo no voltar */
      location.replace('#/documento/' + i.docId);
    } catch (e) {
      avisar('Não deu para abrir o que veio do Cwork: ' + (e.message || e), { ic: 'aviso', longo: true });
      irPara('');
    }
  }, [banco, recarregar, avisar, autor]);

  /** Fecha o resumo e tira da caixa (ao fechar ou ao imprimir). Nada do resumo fica no documento. */
  const fecharResumo = useCallback(async () => {
    const r = resumo; setResumo(null);
    if (r && !r.fora) { try { await apagar(r.pid); } catch { /* sem caixa */ } }
  }, [resumo]);

  /** Imprimiu com o resumo na tela: tira da caixa, o painel fica até a pessoa fechar. */
  const resumoUsado = useCallback(async () => {
    const r = resumo; if (!r || r.fora) return;
    setResumo({ ...r, fora: true });
    try { await apagar(r.pid); } catch { /* sem caixa */ }
  }, [resumo]);

  /** v0.6.17: "Preencher e imprimir" do resumo do envio (os mesmos passos do pedido, sem resposta ao Cwork). */
  const preencherDoResumo = useCallback((conteudo) => { if (!resumo) return; setPedidoLocal({ ...pedidoDoResumo(resumo, conteudo), semMenus: !!idDocumento }); irPara('pedido/local'); }, [resumo, idDocumento]);

  /** Compartilhar com o Cwork. gerar() devolve { pdf, paginas, papel, orient, original? }. Sem sub-aba, pergunta antes. */
  const compartilhar = useCallback(async (ficha, gerar) => {
    if (!PODE_COMPARTILHAR[ficha.tipo]) { avisar('Compartilhar o Documento chega junto com o editor, na v0.7.0.', { ic: 'info' }); return; }
    if (!temCaixa()) { avisar('Este navegador não tem a caixa de troca do aparelho: baixe o PDF e importe no Cwork.', { ic: 'aviso', longo: true }); return; }
    if (!ficha.pastaNome) { setJanela({ ficha, depois: gerar }); return; }
    try {
      avisar('Montando o PDF para o Cwork…', { ic: 'pdf' });
      const { conteudo, ...g } = await gerar();
      const rev = ((lerEstado()[ficha.id] || {}).rev || 0) + 1;
      /* v0.6.17 (Ponte 2): os campos marcados por nome de célula vão na ficha, para o Cwork saber o que mandar */
      const cp = conteudo ? camposDoLivro(conteudo) : { campos: [], fora: [], excesso: 0 };
      const envio = await montarEnvio({ ficha, ...g, rev, campos: camposParaPub(cp.campos) });
      if (cp.campos.length) envio.avisos.unshift(`Vai com ${cp.campos.length} ${cp.campos.length === 1 ? 'campo' : 'campos'} para o Cwork preencher.`);
      if (cp.fora.length) envio.avisos.push(`${cp.fora.length === 1 ? 'O nome' : 'Os nomes'} ${cp.fora.join(', ')} ${cp.fora.length === 1 ? 'começa' : 'começam'} com efc_ mas não ${cp.fora.length === 1 ? 'é campo' : 'são campos'} do Cwork: ${cp.fora.length === 1 ? 'ficou' : 'ficaram'} de fora.`);
      if (cp.excesso) envio.avisos.push(`O Cwork aceita até ${EFD.CAMPOS_MAX} campos por documento: ${cp.excesso} ${cp.excesso === 1 ? 'ficou' : 'ficaram'} de fora.`);
      const pid = await porNaCaixa(envio);
      setEstado(marcarEstado(ficha.id, { rev, pid, em: envio.ficha.alteradoEm, estado: 'caixa' }));
      avisar(`"${ficha.nome}" (versão ${rev}) está na caixa do Cwork. Abra o EFCwork neste aparelho para ele receber.${envio.avisos.length ? ' ' + envio.avisos.join(' ') : ''}`, { ic: 'check', longo: true });
    } catch (e) {
      avisar('Não deu para compartilhar: ' + (e.message || e), { ic: 'aviso', longo: true });
    }
  }, [avisar]);

  /** Salvar a sub-aba e o código (e, se veio do Compartilhar, seguir com o envio). */
  const salvarInterno = useCallback(async (f, mud) => {
    const depois = janela && janela.depois;
    setJanela(null);
    await mudarFichaArquivo(f, mud);
    if (depois && mud.pastaNome) compartilhar({ ...f, ...mud }, depois);
  }, [janela, mudarFichaArquivo, compartilhar]);

  return { estado, resumo, janela, setJanela, abrirDaCaixa, fecharResumo, resumoUsado, compartilhar, salvarInterno, atualizarEstado, pedidoLocal, preencherDoResumo };
}
