/* EFCwork · lanca.js — LANÇAMENTOS do Almoxarifado (v0.3): saída, entrada, ajuste pela contagem, abrir e terminar frasco,
   corrigir e anular movimentação, solicitação (nova, atender, cancelar) e confirmação de produto crítico.
   As regras e o formato gravado são os do EFClaudian v2.102.59 (alSaidaOk, alEntradaOk, alAjusteOk, alMovCorrOk, alMovAnularOk,
   alSolNOk, alAbrirOk, alFimOk, alCritDecidir, alPedirOuFazer, alAplicarAlmox): sai primeiro o que vence primeiro, o saldo nunca fica
   negativo, lote vencido só sai com motivo, nada é apagado (corrigir e anular guardam o antes e o motivo) e o secundário pede ao superior.
   Fica no EFClaudian por enquanto: cadastro de item, kits, fotos e inventário. Os formulários abrem na gaveta. Prefixo: lc. */
const ALM_MOTIVOS_BASE = ['Uso no expediente', 'Envio de amostras', 'Análise no laboratório', 'Calibração / manutenção de equipamento', 'Limpeza', 'Material vencido ou danificado'];
const AL_ACAO_TXT = { item_novo: 'Cadastrar item', item_edit: 'Editar item', item_desat: 'Desativar item', item_reativar: 'Reativar item', ajuste: 'Ajuste pela contagem', corrigir_mov: 'Corrigir movimentação', anular_mov: 'Anular movimentação', prazo_aberto: 'Prazo depois de aberto', saida_crit_venc: 'Lote vencido de produto crítico' };
Object.assign(S, { fm: null, almPref: null });

/* ---------- quem pode o quê (igual ao EFClaudian) ---------- */
const alPode = () => podeLancar(S.user) && alVe();
const alSup = () => isSup(S.user);
function alCtrl(u) { u = u || S.user; if (!u || u.perfil === 'visitante' || u.bloqueado) return false; if (isSup(u)) return true; return temAtrib(u, 'almox') && !!(u.atrib && u.atrib.almoxctrl === true); }
const alConfirmadores = () => S.users.filter(u => alCtrl(u) && temAtrib(u, 'almox'));
const alCorrigeDireto = m => alSup() || (m.por === S.user.id && (m.tipo === 'saida' || m.tipo === 'abrir'));
const alPodeCorrigir = m => !m.anulada && alPode() && m.tipo !== 'fim';
const alTemRef = m => S.almMov.some(x => x.lotRef === m.id && !x.anulada);
const alConsumido = m => alR(S.almMov.filter(x => x.lotRef === m.id && !x.anulada).reduce((s, x) => s + (x.tipo === 'saida' || x.tipo === 'abrir' ? x.qtd : x.tipo === 'ajuste' ? -x.qtd : 0), 0));
const alNum = v => { const t = String(v == null ? '' : v).trim().replace(/\s/g, ''); if (!t) return NaN; const n = Number(t.indexOf(',') >= 0 ? t.replace(/\./g, '').replace(',', '.') : t); return isFinite(n) ? n : NaN; };
const alQin = n => alQ(n).replace(/\./g, ''); /* número para o campo (sem ponto de milhar) */
const alUnCompra = i => (i && i.unCompra) || (i && i.un) || '';
const alPorFrasco = i => !!(i && i.porFrasco);
const alCritPendMov = m => !m.anulada && m.critico && m.critico.st === 'pendente';
function alCritPend() {
  const vistos = {}, out = [];
  S.almMov.filter(alCritPendMov).sort((a, b) => String(a.criadoEm).localeCompare(String(b.criadoEm))).forEach(m => { const k = (m.grupo || m.id) + '|' + m.itemId; if (vistos[k]) { vistos[k].qtd = alR(vistos[k].qtd + (Number(m.qtd) || 0)); return; } vistos[k] = Object.assign({}, m); out.push(vistos[k]); });
  return out;
}
function alAbertos(itemId) {
  const fim = {}; S.almMov.forEach(m => { if (m.tipo === 'fim' && !m.anulada && m.abertoRef) fim[m.abertoRef] = m; });
  return S.almMov.filter(m => m.tipo === 'abrir' && !m.anulada && !fim[m.id] && (!itemId || m.itemId === itemId)).sort((a, b) => String(a.data || '') < String(b.data || '') ? -1 : 1);
}
function alPrazoAberto(m) {
  const i = alItem(m.itemId), d = i ? Number(i.prazoAberto) || 0 : 0; if (!d || !m.data) return null;
  const venc = addDias(m.data, d); return { venc: venc, vencido: venc < hojeISO() };
}
function alPedidoPendente(acao, refId, titulo) { return S.aprov.find(a => a.tipo === 'almox' && a.status === 'pendente' && a.payload && a.payload.acao === acao && (a.payload.refId === refId || (titulo && a.titulo === titulo))); }
const alCorrPend = m => !m ? null : (alPedidoPendente('corrigir_mov', m.id) || alPedidoPendente('anular_mov', m.id) || null);

/* ---------- lotes: sai primeiro o que vence primeiro; vencido só se escolhido ---------- */
function alAlocar(itemId, q, lotId) {
  if (lotId) { const l = alIdx().lots[lotId]; if (!l || l.saldo <= 0) return { erro: 'Esse lote não tem mais saldo.' }; if (q > l.saldo + 1e-9) return { erro: 'Nesse lote só há ' + alQ(l.saldo) + '.' }; return { partes: [{ l: l, q: q }] }; }
  const ls = alLotes(itemId).filter(l => !alVencido(l)), disp = alR(ls.reduce((s, l) => s + l.saldo, 0));
  if (q > disp + 1e-9) { const venc = alR(alSaldo(itemId) - disp); return { erro: 'Só há ' + alQ(disp) + ' disponível' + (venc > 0 ? ' fora de lote vencido (tem mais ' + alQ(venc) + ' vencido; para usar, escolha o lote vencido)' : '') + '. O saldo não pode ficar negativo.' }; }
  const partes = []; let r = q;
  for (const l of ls) { if (r <= 1e-9) break; const t = alR(Math.min(l.saldo, r)); partes.push({ l: l, q: t }); r = alR(r - t); }
  return { partes: partes };
}
/* saída que faz o item passar de "no mínimo ou acima" para "abaixo": avisa no sino quem cuida do almoxarifado (só no cruzamento) */
function alMinAvisa(lista) {
  try {
    const por = {}; (lista || []).forEach(x => { if (!x || !x.i) return; const o = por[x.i.id] || (por[x.i.id] = { i: x.i, q: 0 }); o.q += Number(x.q) || 0; });
    const cruz = Object.keys(por).map(k => por[k]).map(x => { const antes = alDisp(x.i.id); return { i: x.i, antes: antes, dep: alR(antes - x.q) }; })
      .filter(x => Number(x.i.min) > 0 && x.i.ativo !== false && x.antes >= Number(x.i.min) && x.dep < Number(x.i.min));
    if (!cruz.length) return;
    const para = S.users.filter(u => !u.bloqueado && isSup(u) && temAtrib(u, 'almox')).map(u => u.id); if (!para.length) return;
    const txt = cruz.map(x => x.i.nome + ': utilizável ' + alQ(x.dep) + ' ' + (x.i.un || '') + ' (mínimo ' + alQ(x.i.min) + ')').join(' · ');
    Promise.resolve(Notif.send({ nivel: 'aviso', titulo: cruz.length === 1 ? 'Estoque abaixo do mínimo: ' + cruz[0].i.nome : cruz.length + ' itens do almoxarifado abaixo do mínimo', texto: txt + '. Saída lançada por ' + S.user.nome + '.', para: para })).catch(() => {});
  } catch {}
}
function alCritAvisar(itens, movId) {
  const para = alConfirmadores().map(u => u.id).filter(id => id !== S.user.id);
  if (!para.length || !itens.length) return;
  Notif.send({ nivel: 'aviso', titulo: 'Confirmar saída de produto crítico', texto: S.user.nome + ' registrou a saída de ' + itens.map(x => alQ(x.q) + ' ' + (x.i.un || '') + ' de ' + x.i.nome).join(', ') + ' — ' + itens[0].mot + '. Confirme no almoxarifado.', para: para, refTipo: 'alm_mov', refId: movId }).catch(() => {});
}
const alCritNovo = vencConfirmado => vencConfirmado ? { st: 'confirmada', porId: S.user.id, porNome: S.user.nome, ts: nowISO(), vencido: true, proprio: true } : { st: 'pendente' };
function alCritTxt(c) {
  if (!c) return '';
  if (c.st === 'pendente') return 'Aguardando a confirmação do líder ★ (ou de quem tem Controle do almoxarifado)';
  if (c.st === 'confirmada') return 'Confirmada por ' + (c.porNome || '') + ' em ' + fmtDT(c.ts) + (c.proprio ? ' (quem lançou)' : '') + (c.vencido ? ' · lote vencido liberado pelo líder' : '');
  return 'Não confere: ' + (c.motivo || '') + ' · ' + (c.porNome || '') + ' em ' + fmtDT(c.ts);
}

/* ---------- motivos: os da configuração (ou uma lista simples), os que a equipe mais usou em 90 dias e os guardados pela pessoa ---------- */
function alPref() { const p = S.almPref || {}; return { motivos: Array.isArray(p.motivos) ? p.motivos : [], ocultos: Array.isArray(p.ocultos) ? p.ocultos : [], uso: p.uso && typeof p.uso === 'object' ? p.uso : {} }; }
function alPrefGravar(patch) { const p = Object.assign({}, alPref(), patch, { userId: S.user.id, userNome: S.user.nome, atualizadoEm: nowISO() }); S.almPref = Object.assign({ id: S.user.id }, p); return Data.col('sv2_alm_pref').set(S.user.id, p).catch(() => {}); }
function alMotivos(ctx) {
  const pr = alPref(), cfg = S.cfgAlm && Array.isArray(S.cfgAlm.motivos) && S.cfgAlm.motivos.length ? S.cfgAlm.motivos : null;
  const lim = addDias(hojeISO(), -90), c = {};
  if (!cfg) S.almMov.forEach(m => { if (m.tipo === 'saida' && !m.anulada && m.motivo && String(m.data || '') >= lim) c[m.motivo] = (c[m.motivo] || 0) + 1; });
  const daEquipe = Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 12);
  const base = (cfg || daEquipe.concat(ALM_MOTIVOS_BASE)).filter((m, n, l) => l.indexOf(m) === n && pr.ocultos.indexOf(m) < 0);
  const lista = base.concat(pr.motivos.filter(m => base.indexOf(m) < 0));
  const aqui = pr.uso[ctx || '*'] || {}, geral = pr.uso['*'] || {};
  return lista.map((m, n) => ({ m: m, n: n, a: aqui[m] || 0, g: geral[m] || 0 })).sort((x, y) => y.a - x.a || y.g - x.g || x.n - y.n).map(x => x.m);
}
function alMotivoUsado(ctx, motivo, guardar) {
  if (!motivo) return; const pr = alPref(), uso = JSON.parse(JSON.stringify(pr.uso));
  [ctx || '*', '*'].forEach((k, n, l) => { if (n && k === l[0]) return; uso[k] = uso[k] || {}; uso[k][motivo] = (uso[k][motivo] || 0) + 1; });
  const patch = { uso: uso }; if (guardar && pr.motivos.indexOf(motivo) < 0) { patch.motivos = pr.motivos.concat([motivo]); patch.ocultos = pr.ocultos.filter(x => x !== motivo); }
  alPrefGravar(patch);
}
CS_CARGAS.push(() => { if (!alVe()) return; Data.col('sv2_alm_pref').get(S.user.id).then(d => { if (d && S.user && d.id === S.user.id) S.almPref = d; }).catch(() => {}); });

/* ---------- peças do formulário (na gaveta) ---------- */
const lcBl = (rot, html, dica, cls) => '<div class="fm-c' + (cls ? ' ' + cls : '') + '"><span class="fm-r">' + esc(rot) + (dica ? ' <small>' + esc(dica) + '</small>' : '') + '</span>' + html + '</div>';
const lcIn = (campo, v, extra) => '<input' + (/class=/.test(extra || '') ? '' : ' class="fm-i"') + ' data-fm="' + esc(campo) + '" value="' + esc(v == null ? '' : v) + '" autocomplete="off"' + (extra || '') + '>';
const lcTx = (campo, v, ph) => '<textarea class="fm-i" data-fm="' + esc(campo) + '" rows="2" placeholder="' + esc(ph || '') + '">' + esc(v || '') + '</textarea>';
const lcData = (campo, v, livre) => '<input class="fm-i" type="date" data-fm="' + esc(campo) + '" value="' + esc(v || '') + '"' + (livre ? '' : ' max="' + hojeISO() + '"') + '>';
const lcPasso = (campo, v, un) => '<div class="fm-passo"><button type="button" class="bt ic-so" data-act="lc-q" data-c="' + esc(campo) + '" data-d="-1" aria-label="Menos">' + ic('menos') + '</button><input class="fm-i num" data-fm="' + esc(campo) + '" inputmode="decimal" autocomplete="off" value="' + esc(v) + '"><button type="button" class="bt ic-so" data-act="lc-q" data-c="' + esc(campo) + '" data-d="1" aria-label="Mais">' + ic('mais') + '</button>' + (un ? '<span class="fm-un">' + esc(un) + '</span>' : '') + '</div>';
const lcAv = (txt, cor) => '<div class="fm-av ' + (cor || '') + '">' + ic(cor === 'cr' ? 'alerta' : 'info') + '<span>' + txt + '</span></div>';
const lcMsg = () => S.fm && S.fm.msg ? '<p class="fm-msg" role="alert">' + ic('alerta') + esc(S.fm.msg) + '</p>' : '';
function lcErro(t) { if (!S.fm) return false; S.fm.msg = t; gvDesenha(true); const m = $('#gv .fm-msg'); if (m && m.scrollIntoView) try { m.scrollIntoView({ block: 'nearest' }); } catch {} return false; }
function lcPicker(acao, dica) {
  const usados = (function () { const lim = addDias(hojeISO(), -90), c = {}; S.almMov.forEach(m => { if (m.tipo === 'saida' && !m.anulada && String(m.data || '') >= lim) c[m.itemId] = (c[m.itemId] || 0) + 1; }); return c; })();
  const l = alAtivos().slice().sort((a, b) => (usados[b.id] || 0) - (usados[a.id] || 0) || String(a.nome).localeCompare(b.nome, 'pt-BR'));
  return '<div class="fm-pk"><label class="tb-busca">' + ic('lupa') + '<input type="search" data-pk placeholder="' + esc(dica || 'Buscar material, código ou local') + '" aria-label="Buscar material"></label><div class="fm-pkl">' +
    (l.length ? l.map(i => { const d = alDisp(i.id); return '<button type="button" class="fm-pki" data-act="' + acao + '" data-id="' + esc(i.id) + '" data-busca="' + esc(tbNorm([i.nome, i.codigo, i.local].join(' '))) + '"><span><b>' + esc(i.nome) + '</b><small>' + esc([i.codigo, i.local].filter(Boolean).join(' · ')) + '</small></span><span class="num' + (d <= 0 ? ' fm-zero' : '') + '">' + alQ(d) + ' ' + esc(i.un || '') + '</span></button>'; }).join('') : '<p class="tb-nada">Nenhum material ativo.</p>') +
    '<p class="tb-nada fm-pkv" hidden>Nada encontrado.</p></div></div>';
}
const lcItemEsc = (i, acao) => '<button type="button" class="fm-esc" data-act="' + acao + '"><span><b>' + esc(i.nome) + '</b><small>utilizável ' + alQ(alDisp(i.id)) + ' ' + esc(i.un || '') + (alSaldo(i.id) > alDisp(i.id) ? ' · ' + alQ(alSaldo(i.id) - alDisp(i.id)) + ' vencido' : '') + (alPorFrasco(i) && alAbertos(i.id).length ? ' · ' + alAbertos(i.id).length + ' em uso' : '') + '</small></span><span class="fm-tr">trocar</span></button>';
function lcMotivoBl(ctx) {
  const f = S.fm, ms = alMotivos(ctx), outro = f.motivo === '__outro';
  return lcBl('Motivo', ddHTML('lc:motivo', f.motivo || '', [['', 'Escolha o motivo']].concat(ms.map(m => [m, m])).concat([['__outro', 'Escrever outro motivo']])) +
    (outro ? lcIn('motivoTxt', f.motivoTxt, ' placeholder="Qual o motivo?"') + '<label class="fm-ck"><input type="checkbox" data-fm="guardar"' + (f.guardar !== '0' ? ' checked' : '') + '> Guardar esse motivo na minha lista</label>' : ''));
}
const lcDin = v => Number(v) ? Number(v).toFixed(2).replace('.', ',') : '';
const lcMotFinal = f => f.motivo === '__outro' ? String(f.motivoTxt || '').trim() : f.motivo;
/* evita gravar duas vezes com toque duplo: vale para o MESMO formulário aberto */
function lcTravar() { const f = S.fm, a = Date.now(); if (!f) return false; if (f._trava && a - f._trava < 1200) return false; f._trava = a; return true; }
/* abre o formulário na gaveta; "volta" é o detalhe de onde ele saiu (o X volta para ele) */
function lcAbrir(estado, volta) { S.fm = Object.assign({ msg: '', volta: volta || null }, estado); gvAbrir(lcGaveta, true); }
function lcFim() { const v = S.fm && S.fm.volta; S.fm = null; S.gvForm = false; if (v) v(); else gvFechar(); }
function lcGrava(ps, okMsg) {
  lcFim(); aviso(okMsg);
  Promise.all(ps).catch(e => { console.error(e); aviso(svErro(e), 'erro'); });
}
/* superior aplica na hora; secundário vira pedido (como no EFClaudian) */
async function lcPedirOuFazer(acao, refId, payload, titulo, descricao, okMsg) {
  const p = Object.assign({ acao: acao, refId: refId }, payload);
  if (alSup()) { try { await lcAplicar(p, null); } catch (e) { aviso('Não deu para aplicar: ' + (e.message || svErro(e)), 'erro'); return false; } if (okMsg) aviso(okMsg); return true; }
  if (alPedidoPendente(acao, refId, titulo)) { aviso('Já existe um pedido pendente para isso, esperando o superior.', 'erro'); return false; }
  const aid = await Aprov.pedir({ tipo: 'almox', titulo: titulo, descricao: descricao || '', refTipo: 'almox', refId: acao + ':' + refId, payload: p });
  if (aid) aviso('Pedido enviado ao seu superior.');
  return false;
}
async function lcAplicar(p, aprov) {
  const quem = aprov ? aprov.solicitanteNome : S.user.nome, agora = nowISO();
  const marca = aprov ? { aprovId: aprov.id, pedidoPor: aprov.solicitanteNome, aprovadoPor: S.user.nome } : {};
  if (p.acao === 'item_novo') { await Data.col('sv2_alm_itens').set(p.refId, Object.assign({}, p.dados, marca, { criadoEm: agora, criadoPor: quem })); Audit.log({ acao: 'criar_item_almox', entidade: 'almox_item', entidadeId: p.refId, resumo: 'Item cadastrado: ' + p.dados.nome + (aprov ? ' (pedido de ' + quem + ')' : ''), depois: p.dados }); return; }
  if (p.acao === 'item_edit') { const i = alItem(p.refId); if (!i) throw new Error('Item não encontrado.'); await Data.col('sv2_alm_itens').update(p.refId, Object.assign({}, p.dados, marca)); Audit.log({ acao: 'editar_item_almox', entidade: 'almox_item', entidadeId: p.refId, resumo: 'Item editado: ' + (p.dados.nome || i.nome) + (aprov ? ' (pedido de ' + quem + ')' : ''), antes: i, depois: p.dados }); return; }
  if (p.acao === 'item_desat' || p.acao === 'item_reativar') {
    const i = alItem(p.refId); if (!i) throw new Error('Item não encontrado.'); const on = p.acao === 'item_reativar';
    await Data.col('sv2_alm_itens').update(p.refId, Object.assign({ ativo: on, motivoInativo: on ? '' : p.motivo, desativadoEm: on ? '' : agora }, marca));
    Audit.log({ acao: on ? 'reativar_item_almox' : 'desativar_item_almox', entidade: 'almox_item', entidadeId: p.refId, resumo: (on ? 'Reativou ' : 'Desativou ') + i.nome + (p.motivo ? ' — motivo: ' + p.motivo : ''), antes: { ativo: i.ativo !== false }, depois: { ativo: on } }); return;
  }
  if (p.acao === 'prazo_aberto') { const i = alItem(p.refId); if (!i) throw new Error('Item não encontrado.'); await Data.col('sv2_alm_itens').update(p.refId, Object.assign({ prazoAberto: p.dias || 0 }, marca)); Audit.log({ acao: 'editar_item_almox', entidade: 'almox_item', entidadeId: p.refId, resumo: 'Prazo depois de aberto de ' + i.nome + ': ' + (p.dias ? p.dias + ' dia(s)' : 'sem prazo'), antes: { prazoAberto: i.prazoAberto || 0 }, depois: { prazoAberto: p.dias || 0 } }); return; }
  if (p.acao === 'ajuste') {
    const i = alItem(p.refId); if (!i) throw new Error('Item não encontrado.');
    for (const l of p.linhas) await Data.col('sv2_alm_mov').set(uid(), Object.assign({ tipo: 'ajuste', itemId: i.id, itemNome: i.nome, lotRef: l.lotRef, lote: l.lote || '', validade: l.validade || '', qtd: l.qtd, preco: l.preco || 0, motivo: p.motivo, data: p.data, criadoEm: agora, por: aprov ? aprov.solicitanteId : S.user.id, porNome: quem }, marca));
    Audit.log({ acao: 'ajuste_almox', entidade: 'almox_item', entidadeId: i.id, resumo: 'Ajuste de ' + i.nome + ': ' + p.linhas.map(l => (l.lote || 's/ lote') + ' ' + (l.qtd > 0 ? '+' : '') + alQ(l.qtd)).join(', ') + ' — ' + p.motivo + (aprov ? ' (pedido de ' + quem + ')' : ''), depois: { linhas: p.linhas, motivo: p.motivo } }); return;
  }
  if (p.acao === 'saida_crit_venc') {
    const i = alItem(p.itemId); if (!i) throw new Error('Item não encontrado.');
    const a = alAlocar(i.id, Number(p.qtd) || 1, p.lotId); if (a.erro) throw new Error(a.erro);
    const crit = { st: 'confirmada', porId: S.user.id, porNome: S.user.nome, ts: nowISO(), vencido: true, aprovId: aprov ? aprov.id : '' }, grupo = a.partes.length > 1 ? uid() : '';
    for (const pt of a.partes) await Data.col('sv2_alm_mov').set(uid(), Object.assign({ tipo: p.tipo === 'abrir' ? 'abrir' : 'saida', itemId: i.id, itemNome: i.nome, lotRef: pt.l.id, lote: pt.l.lote, validade: pt.l.validade, qtd: pt.q, preco: pt.l.preco, motivo: p.motivo, obs: p.obs || '', data: p.data, grupo: grupo, vencidoMotivo: p.vencMot, critico: crit, criadoEm: nowISO(), por: aprov ? aprov.solicitanteId : S.user.id, porNome: quem }, marca));
    Audit.log({ acao: 'saida_almox', entidade: 'almox_item', entidadeId: i.id, resumo: 'Saída de lote VENCIDO de produto crítico: ' + alQ(p.qtd) + ' ' + (i.un || '') + ' de ' + i.nome + ' — ' + p.motivo + ' · liberada por ' + S.user.nome + (aprov ? ' (pedido de ' + quem + ')' : ''), depois: p }); return;
  }
  if (p.acao === 'corrigir_mov' || p.acao === 'anular_mov') {
    const m = S.almMov.find(x => x.id === p.refId); if (!m) throw new Error('Movimentação não encontrada.');
    if (p.acao === 'anular_mov') {
      await Data.col('sv2_alm_mov').update(m.id, Object.assign({ anulada: true, anuladaEm: agora, anuladaPor: S.user.nome, anuladaMotivo: p.motivo }, marca));
      Audit.log({ acao: 'anular_mov_almox', entidade: 'almox_item', entidadeId: m.itemId, resumo: 'Anulou ' + (AL_TIPO[m.tipo] || m.tipo).toLowerCase() + ' de ' + alQ(m.qtd) + ' ' + m.itemNome + ' — motivo: ' + p.motivo, antes: { anulada: false }, depois: { anulada: true } }); return;
    }
    const h = (m.historico || []).concat([{ ts: agora, por: quem, porId: aprov ? aprov.solicitanteId : S.user.id, motivo: p.motivo, antes: p.antes, depois: p.depois, aprovadoPor: aprov ? S.user.nome : '' }]);
    await Data.col('sv2_alm_mov').update(m.id, Object.assign({}, p.depois, { historico: h }));
    Audit.log({ acao: 'corrigir_mov_almox', entidade: 'almox_item', entidadeId: m.itemId, resumo: 'Corrigiu ' + (AL_TIPO[m.tipo] || m.tipo).toLowerCase() + ' de ' + m.itemNome + ' — motivo: ' + p.motivo, antes: p.antes, depois: p.depois }); return;
  }
  throw new Error('Ação desconhecida.');
}
APROV_APLICA.almox = lcAplicar;

/* ======================= formulários ======================= */
function lcGaveta() {
  const f = S.fm; if (!f) return null;
  const fn = LC_FORM[f.k]; return fn ? fn(f) : null;
}
const LC_FORM = {};
const lcPe = (okAct, okTxt, extra) => (extra || '') + '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button><button type="button" class="bt pr" data-act="' + okAct + '">' + esc(okTxt) + '</button>';

/* ---------- saída ---------- */
LC_FORM.saida = f => {
  if (!f.itemId) return { ico: 'sai', sub: 'Almoxarifado · ' + S.user.nome, titulo: 'Saída', corpo: lcMsg() + '<p class="gv-h">Escolha o material que vai sair</p>' + lcPicker('lc-sai-item') };
  const i = alItem(f.itemId); if (!i) { f.itemId = ''; return LC_FORM.saida(f); }
  const ls = alLotes(i.id), auto = ls.find(l => !alVencido(l)), lotSel = f.lotId ? alIdx().lots[f.lotId] : null, venc = !!(lotSel && alVencido(lotSel)), crit = !!i.critico;
  const lt = l => (l.lote || 'sem lote') + (l.validade ? ' · vence ' + fmtD(l.validade) : '') + ' · ' + alQ(l.saldo) + (alVencido(l) ? ' · VENCIDO' : '');
  let c = lcMsg() + lcBl('Material', lcItemEsc(i, 'lc-sai-trocar'));
  if (crit) c += lcAv('<b>Produto crítico.</b> A saída fica aguardando a confirmação do líder ★ (ou de quem tem Controle do almoxarifado).', 'wa');
  if (alPorFrasco(i)) c += lcAv('Este item sai por <b>frasco aberto</b>: para começar a usar um frasco, use Abrir frasco no material. A saída aqui é para transferência, perda ou descarte.');
  c += '<div class="fm-g">' + lcBl('Quantidade', lcPasso('qtd', f.qtd, i.un)) +
    (ls.length > 1 || (ls.length === 1 && alVencido(ls[0])) ? lcBl('Lote', ddHTML('lc:lotId', f.lotId || '', [['', 'Automático' + (auto ? ' · ' + (auto.lote || 'sem lote') : '')]].concat(ls.map(l => [l.id, lt(l)]))), f.lotId ? 'escolhido' : 'vence primeiro, sai primeiro') : lcBl('Lote', '<p class="fm-fixo">' + esc(ls[0] ? lt(ls[0]) : 'sem saldo') + '</p>')) + '</div>';
  if (venc && crit && !alSup()) c += lcAv('<b>Lote vencido de produto crítico.</b> Não sai, nem com motivo: só o líder ★ libera. Escreva por que precisa e toque em Pedir ao líder ★.', 'cr') + lcBl('Por que precisa usar o lote vencido', lcIn('vencMot', f.vencMot));
  else if (venc) c += lcAv('Este lote venceu em ' + fmtD(lotSel.validade) + '. Para usar mesmo assim, diga o motivo.', 'cr') + lcBl('Motivo para usar o lote vencido', lcIn('vencMot', f.vencMot)) + (crit ? '<label class="fm-ck"><input type="checkbox" data-fm="critVenc"' + (f.critVenc === '1' ? ' checked' : '') + '> Confirmo, como líder ★, a saída do lote vencido deste produto crítico</label>' : '');
  c += lcMotivoBl('item:' + i.id) + '<div class="fm-g">' + lcBl('Data da saída', lcData('data', f.data)) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')) + '</div>';
  return { ico: 'sai', sub: 'Saída · ' + S.user.nome, titulo: i.nome, corpo: c, rodape: venc && crit && !alSup() ? '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button><button type="button" class="bt pr" data-act="lc-crit-pedir">Pedir ao líder ★</button>' : lcPe('lc-sai-ok', 'Registrar saída') };
};
function lcSaidaOk() {
  const f = S.fm, i = alItem(f.itemId); if (!i) return;
  const q = alR(alNum(f.qtd)), mot = lcMotFinal(f);
  if (!(q > 0)) return lcErro('Informe a quantidade.');
  if (!mot) return lcErro(f.motivo === '__outro' ? 'Escreva qual é o motivo.' : 'Escolha o motivo.');
  const er = validaData(f.data); if (er) return lcErro(er);
  const a = alAlocar(i.id, q, f.lotId); if (a.erro) return lcErro(a.erro);
  const venc = a.partes.some(p => alVencido(p.l)), crit = !!i.critico;
  if (venc && crit && !alSup()) return lcErro('Lote vencido de produto crítico não sai, nem com motivo. Toque em Pedir ao líder ★.');
  if (venc && String(f.vencMot || '').trim().length < 3) return lcErro('Escreva o motivo para usar o lote vencido.');
  if (venc && crit && f.critVenc !== '1') return lcErro('Marque a confirmação do líder ★ para sair o lote vencido deste produto crítico.');
  if (!lcTravar()) return;
  const guardar = f.motivo === '__outro' && f.guardar !== '0' && alMotivos('item:' + i.id).indexOf(mot) < 0; /* antes de gravar: a saída nova entraria nos "da equipe" */
  alMinAvisa([{ i: i, q: q }]); /* antes de gravar: o saldo ainda é o de antes */
  const grupo = a.partes.length > 1 ? uid() : '', critObj = crit ? alCritNovo(venc) : null, ps = [], ids = [];
  a.partes.forEach(p => {
    const o = { tipo: 'saida', itemId: i.id, itemNome: i.nome, lotRef: p.l.id, lote: p.l.lote, validade: p.l.validade, qtd: p.q, preco: p.l.preco, criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome, motivo: mot, obs: String(f.obs || '').trim(), data: f.data, grupo: grupo };
    if (alVencido(p.l)) o.vencidoMotivo = String(f.vencMot).trim(); if (critObj) o.critico = critObj;
    const mid = uid(); ids.push(mid); ps.push(Data.col('sv2_alm_mov').set(mid, o));
  });
  Audit.log({ acao: 'saida_almox', entidade: 'almox_item', entidadeId: i.id, resumo: 'Saída: ' + alQ(q) + ' ' + (i.un || '') + ' de ' + i.nome + ' — ' + mot + (venc ? ' · LOTE VENCIDO: ' + String(f.vencMot).trim() : '') + (crit ? ' · PRODUTO CRÍTICO' + (critObj.st === 'pendente' ? ' (aguardando confirmação)' : ' (lote vencido confirmado pelo líder)') : ''), depois: { qtd: q, motivo: mot, lotes: a.partes.map(p => p.l.lote || 's/ lote'), critico: critObj ? critObj.st : '' } });
  alMotivoUsado('item:' + i.id, mot, guardar);
  if (critObj && critObj.st === 'pendente') alCritAvisar([{ i: i, q: q, mot: mot }], ids[0]);
  lcGrava(ps, 'Saída registrada: ' + alQ(q) + ' ' + (i.un || '') + ' de ' + i.nome + '.' + (critObj && critObj.st === 'pendente' ? ' Produto crítico: aguardando confirmação.' : ''));
}
/* lote vencido de produto crítico, por quem não é líder: vira pedido */
async function lcCritPedir() {
  const f = S.fm, abrir = f.k === 'abrir', i = alItem(f.itemId); if (!i) return;
  const q = abrir ? 1 : alR(alNum(f.qtd)), mot = abrir ? 'Frasco aberto para uso' : lcMotFinal(f);
  if (!(q > 0)) return lcErro('Informe a quantidade.'); if (!mot) return lcErro('Escolha o motivo da saída.');
  const l = f.lotId ? alIdx().lots[f.lotId] : null; if (!l || !alVencido(l)) return lcErro('Escolha o lote vencido.');
  if (q > l.saldo + 1e-9) return lcErro('Nesse lote só há ' + alQ(l.saldo) + '.');
  if (String(f.vencMot || '').trim().length < 3) return lcErro('Escreva por que precisa usar o lote vencido.');
  const er = validaData(f.data); if (er) return lcErro(er);
  if (!lcTravar()) return;
  const p = { tipo: abrir ? 'abrir' : 'saida', itemId: i.id, lotId: l.id, qtd: q, motivo: mot, vencMot: String(f.vencMot).trim(), obs: String(f.obs || '').trim(), data: f.data };
  lcFim();
  await lcPedirOuFazer('saida_crit_venc', uid(), p, 'Lote vencido de produto crítico: ' + i.nome, alQ(q) + ' ' + (i.un || '') + ' · lote ' + (l.lote || 's/ lote') + ' venceu em ' + fmtD(l.validade) + ' · ' + mot + ' · por que o vencido: ' + p.vencMot, 'Saída registrada.');
}

/* ---------- abrir frasco e frasco que acabou ---------- */
LC_FORM.abrir = f => {
  const i = alItem(f.itemId); if (!i) return null;
  const ls = alLotes(i.id), auto = ls.find(l => !alVencido(l)) || ls[0], sel = f.lotId ? alIdx().lots[f.lotId] : auto, venc = !!(sel && alVencido(sel)), crit = !!i.critico, d = Number(i.prazoAberto) || 0;
  let c = lcMsg() + gvNums([[alQ(alSaldo(i.id)), 'lacrados'], [String(alAbertos(i.id).length), 'em uso']]);
  if (crit) c += lcAv('<b>Produto crítico.</b> Abrir o frasco fica aguardando a confirmação do líder ★ (ou de quem tem Controle do almoxarifado).', 'wa');
  c += lcBl('Qual frasco', ls.length > 1 ? ddHTML('lc:lotId', f.lotId || (auto ? auto.id : ''), ls.map(l => [l.id, (l.lote || 'sem lote') + (l.validade ? ' · vence ' + fmtD(l.validade) : '') + (alVencido(l) ? ' · VENCIDO' : '')])) : '<p class="fm-fixo">' + esc(sel ? (sel.lote || 'sem lote') + (sel.validade ? ' · vence ' + fmtD(sel.validade) : '') : '—') + '</p>', ls.length > 1 ? 'o que vence primeiro vem marcado' : '');
  if (venc && crit && !alSup()) c += lcAv('<b>Lote vencido de produto crítico.</b> Não abre, nem com motivo: só o líder ★ libera.', 'cr') + lcBl('Por que precisa usar o lote vencido', lcIn('vencMot', f.vencMot));
  else if (venc && crit) c += lcAv('Este lote venceu em ' + fmtD(sel.validade) + '.', 'cr') + lcBl('Motivo para usar o lote vencido', lcIn('vencMot', f.vencMot)) + '<label class="fm-ck"><input type="checkbox" data-fm="critVenc"' + (f.critVenc === '1' ? ' checked' : '') + '> Confirmo, como líder ★, abrir o frasco vencido deste produto crítico</label>';
  if (d) c += lcAv('Depois de aberto, este item vale ' + d + ' dia(s): o aviso aparece em ' + fmtD(addDias(f.data || hojeISO(), d)) + '.');
  c += '<div class="fm-g">' + lcBl('Data da abertura', lcData('data', f.data)) + lcBl('Para que foi aberto', lcIn('obs', f.obs, ' placeholder="opcional"')) + '</div>';
  return { ico: 'frasco', sub: 'Abrir frasco', titulo: i.nome, corpo: c, rodape: venc && crit && !alSup() ? '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button><button type="button" class="bt pr" data-act="lc-crit-pedir">Pedir ao líder ★</button>' : lcPe('lc-abrir-ok', 'Abrir frasco') };
};
function lcAbrirOk() {
  const f = S.fm, i = alItem(f.itemId); if (!i) return;
  const er = validaData(f.data); if (er) return lcErro(er);
  const ls = alLotes(i.id), auto = ls.find(l => !alVencido(l)) || ls[0];
  const a = alAlocar(i.id, 1, f.lotId || (auto ? auto.id : '')); if (a.erro) return lcErro(a.erro);
  const p = a.partes[0], venc = alVencido(p.l), crit = !!i.critico;
  if (crit && venc) {
    if (!alSup()) return lcErro('Lote vencido de produto crítico não abre, nem com motivo. Toque em Pedir ao líder ★.');
    if (String(f.vencMot || '').trim().length < 3) return lcErro('Escreva o motivo para usar o lote vencido.');
    if (f.critVenc !== '1') return lcErro('Marque a confirmação do líder ★ para abrir o frasco vencido deste produto crítico.');
  }
  if (!lcTravar()) return;
  const id = uid(), o = { tipo: 'abrir', itemId: i.id, itemNome: i.nome, lotRef: p.l.id, lote: p.l.lote, validade: p.l.validade, qtd: 1, preco: p.l.preco, motivo: 'Frasco aberto para uso', obs: String(f.obs || '').trim(), data: f.data, criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome };
  if (crit) o.critico = alCritNovo(venc); if (crit && venc) o.vencidoMotivo = String(f.vencMot).trim();
  Audit.log({ acao: 'abrir_frasco_almox', entidade: 'almox_item', entidadeId: i.id, resumo: 'Abriu frasco de ' + i.nome + (p.l.lote ? ' (lote ' + p.l.lote + ')' : '') + (crit ? ' · PRODUTO CRÍTICO' + (o.critico.st === 'pendente' ? ' (aguardando confirmação)' : ' (lote vencido confirmado pelo líder)') : ''), depois: { lote: p.l.lote, data: f.data } });
  if (crit && o.critico.st === 'pendente') alCritAvisar([{ i: i, q: 1, mot: 'frasco aberto' }], id);
  lcGrava([Data.col('sv2_alm_mov').set(id, o)], 'Frasco aberto. Ele fica em uso até você marcar que acabou.' + (crit && o.critico.st === 'pendente' ? ' Produto crítico: aguardando confirmação.' : ''));
}
LC_FORM.fim = f => {
  const m = S.almMov.find(x => x.id === f.movId); if (!m) return null; const sobra = alSaldo(m.itemId);
  return { ico: 'frasco', sub: 'O frasco acabou', titulo: m.itemNome, corpo: lcMsg() + gvCampos([['Lote', m.lote || 'sem lote'], ['Aberto em', fmtD(m.data)]]) +
    lcAv('O consumo fica registrado na data de hoje. ' + (sobra > 0 ? 'Ainda há ' + alQ(sobra) + ' lacrado(s) no estoque.' : 'Não há mais frasco lacrado: o item vai aparecer para comprar.')) + lcBl('Observação', lcIn('obs', f.obs, ' placeholder="opcional"')),
    rodape: '<button type="button" class="bt" data-act="gv-fecha">Cancelar</button>' + (sobra > 0 ? '<button type="button" class="bt" data-act="lc-fim-ok" data-id="1">Acabou e abri outro</button>' : '') + '<button type="button" class="bt pr" data-act="lc-fim-ok">Marcar que acabou</button>' };
};
function lcFimOk(abrirOutro) {
  const f = S.fm, m = S.almMov.find(x => x.id === f.movId); if (!m) return; if (!lcTravar()) return;
  const o = { tipo: 'fim', itemId: m.itemId, itemNome: m.itemNome, abertoRef: m.id, lote: m.lote || '', validade: m.validade || '', qtd: 0, preco: 0, motivo: 'Frasco terminou', obs: String(f.obs || '').trim(), data: hojeISO(), criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome };
  Audit.log({ acao: 'fim_frasco_almox', entidade: 'almox_item', entidadeId: m.itemId, resumo: 'Frasco de ' + m.itemNome + ' terminou (aberto em ' + fmtD(m.data) + ')', depois: { abertoEm: m.data } });
  const volta = f.volta, itemId = m.itemId;
  lcGrava([Data.col('sv2_alm_mov').set(uid(), o)], 'Anotado: o frasco acabou.');
  if (abrirOutro) setTimeout(() => lcAbrir({ k: 'abrir', itemId: itemId, lotId: '', obs: '', data: hojeISO() }, volta), 120);
}

/* ---------- entrada (várias linhas) ---------- */
LC_FORM.entrada = f => {
  const sol = f.solId ? S.almSol.find(x => x.id === f.solId) : null;
  if (f.pk || !f.linhas.length) return { ico: 'entra', sub: 'Entrada' + (f.linhas.length ? ' · ' + f.linhas.length + ' item(ns) já na entrada' : ''), titulo: 'Qual material chegou?', corpo: lcMsg() + lcPicker('lc-ent-item'), rodape: f.linhas.length ? '<button type="button" class="bt" data-act="lc-ent-volta">' + ic('volta') + 'Voltar para a entrada</button>' : '' };
  const tot = f.linhas.reduce((s, l) => { const q = alNum(l.qtd), p = alNum(l.preco); return s + (q > 0 && p > 0 ? q * p : 0); }, 0);
  let c = lcMsg() + (sol ? lcAv('Da solicitação Nº ' + esc(sol.numero) + ': ao registrar, ela fica Atendida.') : '');
  c += f.linhas.map((l, n) => {
    const i = alItem(l.itemId); if (!i) return ''; const ft = alFator(i), ob = !!i.controlaVal;
    return '<div class="fm-ln"><div class="fm-lnh"><b>' + esc(i.nome) + '</b><small>tem ' + alQ(alDisp(i.id)) + ' ' + esc(i.un || '') + '</small><button type="button" class="bt ic-so" data-act="lc-ent-rm" data-id="' + n + '" title="Tirar da entrada" aria-label="Tirar da entrada">' + ic('lixo') + '</button></div>' +
      '<div class="fm-g">' + lcBl('Quantidade', '<div class="fm-qr">' + lcIn('linhas.' + n + '.qtd', l.qtd, ' inputmode="decimal" class="fm-i num"') + (ft > 1 ? '' : '<span class="fm-un">' + esc(i.un || '') + '</span>') + '</div>') +
      (ft > 1 ? lcBl('Chegou em', ddHTML('lc:emb:' + n, l.emb || 'compra', [['compra', alUnCompra(i) + ' (1 = ' + alQ(ft) + ' ' + (i.un || '') + ')'], ['uso', i.un || 'un']])) : '') +
      lcBl('Valor por ' + (ft > 1 && (l.emb || 'compra') === 'compra' ? alUnCompra(i) : (i.un || 'unidade')), lcIn('linhas.' + n + '.preco', l.preco, ' inputmode="decimal" placeholder="R$ 0,00"'), i.preco ? 'último ' + brl(i.preco) + (ft > 1 ? '/' + (i.un || 'un') : '') : 'opcional') +
      lcBl('Lote', lcIn('linhas.' + n + '.lote', l.lote), ob ? 'obrigatório' : 'opcional') + lcBl('Validade', lcData('linhas.' + n + '.validade', l.validade, true), ob ? 'obrigatória' : 'opcional') + '</div></div>';
  }).join('');
  c += '<button type="button" class="bt fm-add" data-act="lc-ent-add">' + ic('mais') + 'Adicionar outro material</button>' +
    '<div class="fm-g">' + lcBl('Nº do documento', lcIn('doc', f.doc, ' placeholder="opcional"')) + lcBl('Data da entrada', lcData('data', f.data)) + '</div>';
  return { ico: 'entra', sub: 'Entrada · ' + f.linhas.length + ' item(ns)' + (tot ? ' · ' + brl(tot) : ''), titulo: sol ? 'Solicitação Nº ' + sol.numero : 'Entrada', corpo: c, rodape: lcPe('lc-ent-ok', 'Registrar entrada') };
};
/* valor sugerido na unidade escolhida: o último valor do item é por unidade de uso; chegando na embalagem de compra, vale × o fator */
const lcPrecoSug = (i, emb) => i ? lcDin((Number(i.preco) || 0) * (alFator(i) > 1 && emb === 'compra' ? alFator(i) : 1)) : '';
function lcEntLinha(itemId) { const i = alItem(itemId), emb = alFator(i) > 1 ? 'compra' : ''; return { itemId: itemId, qtd: '', lote: '', validade: '', preco: lcPrecoSug(i, emb), emb: emb }; }
function lcEntradaOk() {
  const f = S.fm; if (!f.linhas.length) return lcErro('Adicione pelo menos um material.');
  const er = validaData(f.data); if (er) return lcErro(er);
  const prontas = [];
  for (const l of f.linhas) {
    const i = alItem(l.itemId); if (!i) return lcErro('Um dos materiais não existe mais.');
    let q = alNum(l.qtd), pr = String(l.preco || '').trim() ? alNum(l.preco) : 0;
    if (!(q > 0)) return lcErro(i.nome + ': informe a quantidade.');
    if (String(l.preco || '').trim() && !(pr >= 0)) return lcErro(i.nome + ': valor inválido. Use só números, ex.: 12,50');
    if (i.controlaVal && (!String(l.lote || '').trim() || !l.validade)) return lcErro(i.nome + ': este item controla validade, informe o lote e a validade.');
    const ft = alFator(i); if (ft > 1 && (l.emb || 'compra') === 'compra') { q = alR(q * ft); if (pr > 0) pr = alR(pr / ft); }
    prontas.push({ i: i, q: alR(q), pr: pr, lote: String(l.lote || '').trim(), validade: l.validade || '' });
  }
  if (!lcTravar()) return;
  const ps = [], grupo = uid(), sol = f.solId ? S.almSol.find(x => x.id === f.solId) : null;
  prontas.forEach(x => {
    ps.push(Data.col('sv2_alm_mov').set(uid(), { tipo: 'entrada', itemId: x.i.id, itemNome: x.i.nome, lote: x.lote, validade: x.validade, qtd: x.q, preco: x.pr > 0 ? x.pr : (Number(x.i.preco) || 0), doc: String(f.doc || '').trim(), data: f.data, grupo: grupo, solId: f.solId || '', criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome }));
    if (x.pr > 0 && x.pr !== Number(x.i.preco)) ps.push(Data.col('sv2_alm_itens').update(x.i.id, { preco: x.pr }));
  });
  if (sol && sol.situacao === 'pendente') ps.push(Data.col('sv2_alm_sol').update(sol.id, { situacao: 'atendida', atendidaEm: f.data, atendidaPor: S.user.nome, entradaGrupo: grupo }));
  Audit.log({ acao: 'entrada_almox', entidade: 'almox_entrada', entidadeId: grupo, resumo: 'Entrada' + (f.doc ? ' (doc. ' + String(f.doc).trim() + ')' : '') + ': ' + prontas.map(x => alQ(x.q) + ' ' + x.i.nome + (x.lote ? ' lote ' + x.lote : '')).join(', ') + (sol ? ' · solicitação ' + sol.numero + ' atendida' : ''), depois: { linhas: prontas.map(x => ({ itemId: x.i.id, qtd: x.q, lote: x.lote, validade: x.validade, preco: x.pr })) } });
  const n = prontas.length; lcGrava(ps, 'Entrada registrada (' + n + ' item' + (n > 1 ? 's' : '') + ').' + (sol ? ' Solicitação ' + sol.numero + ' atendida.' : ''));
}

/* ---------- ajuste pela contagem ---------- */
LC_FORM.ajuste = f => {
  const i = alItem(f.itemId); if (!i) return null; const ls = alLotes(i.id);
  return { ico: 'ajuste', sub: 'Ajustar saldo · digite o que foi contado em cada lote', titulo: i.nome, corpo: lcMsg() + (alSup() ? '' : lcAv('Como secundário, o ajuste vai como pedido ao seu superior.')) +
    '<div class="fm-lotes">' + ls.map(l => '<div class="fm-lt"><span><b>' + esc(l.lote || 'sem lote') + '</b><small>' + (l.validade ? 'vence ' + fmtD(l.validade) + ' · ' : '') + 'sistema: ' + alQ(l.saldo) + ' ' + esc(i.un || '') + '</small></span>' + lcIn('aj.' + l.id, f.aj[l.id] != null ? f.aj[l.id] : alQin(l.saldo), ' inputmode="decimal" class="fm-i num" aria-label="Contado no lote ' + esc(l.lote || 'sem lote') + '"') + '</div>').join('') + '</div>' +
    lcBl('Motivo do ajuste', lcTx('motivoG', f.motivoG, 'Ex.: contagem de hoje, quebra, perda')),
    rodape: lcPe('lc-aj-ok', alSup() ? 'Ajustar' : 'Pedir ajuste') };
};
async function lcAjusteOk() {
  const f = S.fm, i = alItem(f.itemId); if (!i) return; const ds = [];
  for (const l of alLotes(i.id)) { const v = f.aj[l.id]; if (v == null) continue; const n = alR(alNum(v)); if (isNaN(n) || n < 0) return lcErro('Quantidade inválida no lote ' + (l.lote || 'sem lote') + '.'); if (n !== l.saldo) ds.push({ l: l, d: alR(n - l.saldo) }); }
  if (!ds.length) return lcErro('Nada mudou: as quantidades são as mesmas do sistema.');
  const m = String(f.motivoG || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo do ajuste.');
  if (!lcTravar()) return;
  const linhas = ds.map(x => ({ lotRef: x.l.id, lote: x.l.lote, validade: x.l.validade, qtd: x.d, preco: x.l.preco }));
  lcFim();
  await lcPedirOuFazer('ajuste', i.id, { linhas: linhas, motivo: m, data: hojeISO() }, 'Ajustar o saldo de ' + i.nome, ds.map(x => (x.l.lote || 's/ lote') + ' ' + (x.d > 0 ? '+' : '') + alQ(x.d)).join(', ') + ' — ' + m, 'Saldo ajustado.');
}

/* ---------- corrigir e anular (nunca apagar) ---------- */
LC_FORM.corr = f => {
  const m = S.almMov.find(x => x.id === f.movId); if (!m) return null; const sai = m.tipo === 'saida', i = alItem(m.itemId);
  let c = lcMsg() + lcAv('O valor antigo fica guardado no histórico da movimentação.' + (alCorrigeDireto(m) ? '' : ' Como não é sua saída, a correção vai como pedido ao superior.')) + '<div class="fm-g">' + lcBl('Quantidade', lcIn('qtd', f.qtd, ' inputmode="decimal" class="fm-i num"'), (i && i.un) || '');
  if (sai) c += lcBl('Motivo da saída', lcIn('motivo', f.motivo)) + '</div>';
  else c += lcBl('Nº do documento', lcIn('doc', f.doc)) + lcBl('Lote', lcIn('lote', f.lote)) + lcBl('Validade', lcData('validade', f.validade, true)) + lcBl('Valor unitário', lcIn('preco', f.preco, ' inputmode="decimal"')) + '</div>';
  c += lcBl('Por que está corrigindo?', lcTx('motivoG', f.motivoG));
  return { ico: 'lapis', sub: 'Corrigir ' + (AL_TIPO[m.tipo] || '').toLowerCase() + ' · ' + fmtD(m.data), titulo: m.itemNome, corpo: c, rodape: lcPe('lc-corr-ok', 'Corrigir') };
};
async function lcCorrOk() {
  const f = S.fm, m = S.almMov.find(x => x.id === f.movId); if (!m || !alPodeCorrigir(m)) return;
  const q = alR(alNum(f.qtd)); if (!(q > 0)) return lcErro('Quantidade inválida. Para desfazer tudo, use Anular.');
  const novo = { qtd: q };
  if (m.tipo === 'saida') {
    novo.motivo = String(f.motivo || '').trim(); if (!novo.motivo) return lcErro('Informe o motivo da saída.');
    const l = alIdx().lots[m.lotRef], cabe = alR((l ? l.saldo : 0) + (Number(m.qtd) || 0));
    if (q > cabe + 1e-9) return lcErro('No lote ' + (m.lote || 'sem lote') + ' só cabe até ' + alQ(cabe) + '. O saldo não pode ficar negativo.');
  } else {
    novo.lote = String(f.lote || '').trim(); novo.validade = f.validade || ''; novo.doc = String(f.doc || '').trim();
    const pr = String(f.preco || '').trim(); novo.preco = pr ? alNum(pr) : 0; if (isNaN(novo.preco) || novo.preco < 0) return lcErro('Valor inválido.');
    const cons = alConsumido(m); if (q < cons - 1e-9) return lcErro('Deste lote já saíram ' + alQ(cons) + '. A quantidade não pode ser menor que isso.');
    const i = alItem(m.itemId); if (i && i.controlaVal && (!novo.lote || !novo.validade)) return lcErro('Este item controla validade: informe lote e validade.');
  }
  const antes = {}, depois = {};
  Object.keys(novo).forEach(k => { if (String(m[k] == null ? '' : m[k]) !== String(novo[k])) { antes[k] = m[k] == null ? '' : m[k]; depois[k] = novo[k]; } });
  if (!Object.keys(depois).length) return lcErro('Nada foi mudado.');
  const mot = String(f.motivoG || '').trim(); if (mot.length < 3) return lcErro('Escreva por que está corrigindo.');
  if (!lcTravar()) return;
  if (!alCorrigeDireto(m)) { lcFim(); await lcPedirOuFazer('corrigir_mov', m.id, { antes: antes, depois: depois, motivo: mot }, 'Corrigir ' + (AL_TIPO[m.tipo] || '').toLowerCase() + ' de ' + m.itemNome, Object.keys(depois).map(k => k + ': ' + antes[k] + ' → ' + depois[k]).join(' · ') + ' — ' + mot, ''); return; }
  const h = (m.historico || []).concat([{ ts: nowISO(), por: S.user.nome, porId: S.user.id, motivo: mot, antes: antes, depois: depois }]);
  const ps = [Data.col('sv2_alm_mov').update(m.id, Object.assign({}, depois, { historico: h }))];
  /* a saída guarda uma cópia do lote e da validade: acompanha a correção da entrada */
  if (m.tipo !== 'saida' && ('lote' in depois || 'validade' in depois || 'preco' in depois)) S.almMov.filter(x => x.lotRef === m.id && !x.anulada).forEach(x => { const p = {}; ['lote', 'validade', 'preco'].forEach(k => { if (k in depois) p[k] = depois[k]; }); ps.push(Data.col('sv2_alm_mov').update(x.id, p)); });
  Audit.log({ acao: 'corrigir_mov_almox', entidade: 'almox_item', entidadeId: m.itemId, resumo: 'Corrigiu ' + AL_TIPO[m.tipo].toLowerCase() + ' de ' + m.itemNome + ' (' + fmtD(m.data) + '): ' + Object.keys(depois).map(k => k + ' ' + antes[k] + ' → ' + depois[k]).join(', ') + ' — motivo: ' + mot, antes: antes, depois: depois });
  lcGrava(ps, 'Corrigido. O valor antigo ficou no histórico.');
}
LC_FORM.anular = f => {
  const m = S.almMov.find(x => x.id === f.movId); if (!m) return null;
  return { ico: 'lixo', icoCls: 'ini-cr', sub: 'Anular ' + (AL_TIPO[m.tipo] || '').toLowerCase() + ' · ' + alQ(m.qtd) + ' · ' + fmtD(m.data), titulo: m.itemNome, corpo: lcMsg() + lcAv('O registro não some: fica visível, marcado como anulado, com o seu nome e o motivo.' + (alCorrigeDireto(m) ? '' : ' Como não é sua saída, vai como pedido ao superior.')) + lcBl('Motivo', lcTx('motivoG', f.motivoG, 'Ex.: lançado em dobro, item errado')), rodape: lcPe('lc-anular-ok', 'Anular') };
};
async function lcAnularOk() {
  const f = S.fm, m = S.almMov.find(x => x.id === f.movId); if (!m || !alPodeCorrigir(m)) return;
  const mot = String(f.motivoG || '').trim(); if (mot.length < 3) return lcErro('Escreva o motivo.');
  if ((m.tipo === 'entrada' || m.tipo === 'inicial') && alTemRef(m)) return lcErro('Este lote já teve saída ou ajuste. Corrija a quantidade em vez de anular.');
  if (m.tipo === 'ajuste' && m.qtd > 0) { const l = alIdx().lots[m.lotRef]; if (l && l.saldo < m.qtd - 1e-9) return lcErro('Desfazer este ajuste deixaria o lote negativo (tem ' + alQ(l.saldo) + ').'); }
  if (!lcTravar()) return;
  if (!alCorrigeDireto(m)) { lcFim(); await lcPedirOuFazer('anular_mov', m.id, { motivo: mot }, 'Anular ' + (AL_TIPO[m.tipo] || '').toLowerCase() + ' de ' + m.itemNome, 'Motivo: ' + mot, ''); return; }
  Audit.log({ acao: 'anular_mov_almox', entidade: 'almox_item', entidadeId: m.itemId, resumo: 'Anulou ' + AL_TIPO[m.tipo].toLowerCase() + ' de ' + alQ(m.qtd) + ' ' + m.itemNome + ' (' + fmtD(m.data) + ') — motivo: ' + mot, antes: { anulada: false }, depois: { anulada: true } });
  lcGrava([Data.col('sv2_alm_mov').update(m.id, { anulada: true, anuladaEm: nowISO(), anuladaPor: S.user.nome, anuladaMotivo: mot })], 'Anulada. O registro continua visível, riscado.');
}

/* ---------- produto crítico: confirmar ou "não confere" ---------- */
LC_FORM.naoconf = f => {
  const m = S.almMov.find(x => x.id === f.movId); if (!m) return null;
  return { ico: 'alerta', icoCls: 'ini-cr', sub: 'Saída não confere · ' + alQ(m.qtd) + ' · ' + fmtD(m.data) + ' · ' + (m.porNome || ''), titulo: m.itemNome, corpo: lcMsg() + lcAv('A saída continua registrada; quem lançou é avisado. Para acertar, use Corrigir ou Anular na saída.') + lcBl('O que não confere?', lcTx('motivoG', f.motivoG, 'Ex.: a quantidade usada foi outra, o frasco não saiu')), rodape: lcPe('lc-crit-nao-ok', 'Marcar que não confere') };
};
function lcCritDecidir(id, ok, motivo) {
  const m = S.almMov.find(x => x.id === id);
  if (!m || !alCritPendMov(m)) { aviso('Esta saída já foi decidida.', 'erro'); return false; }
  if (!alCtrl(S.user)) { aviso('Só o líder ★, o Principal ou quem tem Controle do almoxarifado confirma.', 'erro'); return false; }
  const mot = ok ? '' : String(motivo || '').trim(); if (!ok && mot.length < 3) return lcErro('Escreva o que não confere.');
  const alvo = S.almMov.filter(x => alCritPendMov(x) && x.itemId === m.itemId && (x.id === m.id || (m.grupo && x.grupo === m.grupo)));
  const c = { st: ok ? 'confirmada' : 'nao_confere', porId: S.user.id, porNome: S.user.nome, ts: nowISO(), proprio: m.por === S.user.id }; if (!ok) c.motivo = mot;
  const qt = alR(alvo.reduce((s, x) => s + (Number(x.qtd) || 0), 0));
  const ps = alvo.map(x => Data.col('sv2_alm_mov').update(x.id, { critico: Object.assign({}, x.critico, c) }));
  Audit.log({ acao: ok ? 'critico_confirmar' : 'critico_nao_confere', entidade: 'almox_item', entidadeId: m.itemId, resumo: (ok ? 'Confirmou' : 'Não confere:') + ' saída de produto crítico ' + alQ(qt) + ' ' + m.itemNome + ' (' + fmtD(m.data) + ', lançada por ' + (m.porNome || '') + ')' + (c.proprio ? ' — confirmada por quem lançou' : '') + (mot ? ' — ' + mot : ''), antes: { critico: 'pendente' }, depois: { critico: c.st } });
  if (m.por && m.por !== S.user.id) Notif.send({ nivel: ok ? 'info' : 'aviso', titulo: ok ? 'Saída confirmada: ' + m.itemNome : 'Saída NÃO confere: ' + m.itemNome, texto: S.user.nome + (ok ? ' confirmou' : ' marcou que não confere') + ' a saída de ' + alQ(qt) + ' ' + m.itemNome + ' de ' + fmtD(m.data) + (mot ? ': ' + mot : '') + '.', para: [m.por], refTipo: 'alm_mov', refId: m.id }).catch(() => {});
  if (S.fm) lcGrava(ps, ok ? 'Saída confirmada.' : 'Marcada como não confere. Quem lançou foi avisado.');
  else { aviso(ok ? 'Saída confirmada.' : 'Marcada como não confere.'); Promise.all(ps).catch(e => aviso(svErro(e), 'erro')); }
  return true;
}

/* ---------- solicitação ao almoxarifado central ---------- */
LC_FORM.sol = f => {
  if (f.pk) return { ico: 'doc', sub: 'Nova solicitação', titulo: 'Qual material pedir?', corpo: lcPicker('lc-sol-item'), rodape: '<button type="button" class="bt" data-act="lc-sol-volta">' + ic('volta') + 'Voltar para a solicitação</button>' };
  let c = lcMsg() + lcAv('Pedido ao almoxarifado central. Quando chegar, marque Atendida e a entrada já vem preenchida.') +
    '<p class="gv-h">Materiais</p>' + (f.linhas.length ? '<div class="fm-lotes">' + f.linhas.map((l, n) => { const i = alItem(l.itemId); return '<div class="fm-lt"><span><b>' + esc(i ? i.nome : '(item removido)') + '</b><small>tem ' + (i ? alQ(alSaldo(i.id)) + ' ' + esc(i.un || '') : '—') + '</small></span>' + lcIn('linhas.' + n + '.qtd', l.qtd, ' inputmode="decimal" class="fm-i num" aria-label="Quantidade"') + '<button type="button" class="bt ic-so" data-act="lc-sol-rm" data-id="' + n + '" title="Tirar" aria-label="Tirar">' + ic('lixo') + '</button></div>'; }).join('') + '</div>' : '<p class="tb-nada">Nenhum material ainda.</p>') +
    '<button type="button" class="bt fm-add" data-act="lc-sol-add">' + ic('mais') + 'Adicionar material</button>' +
    '<div class="fm-g">' + lcBl('Nº do documento', lcIn('numero', f.numero)) + lcBl('Data', lcData('data', f.data)) + lcBl('Solicitante', lcIn('solicitante', f.solicitante)) + lcBl('Liberador', lcIn('liberador', f.liberador), 'opcional') + lcBl('Data prevista', lcData('previsao', f.previsao, true), 'opcional') + lcBl('Observação', lcIn('obs', f.obs), 'opcional') + '</div>';
  return { ico: 'doc', sub: 'Almoxarifado central', titulo: 'Nova solicitação', corpo: c, rodape: lcPe('lc-sol-ok', 'Salvar solicitação') };
};
function lcSolOk() {
  const f = S.fm; if (!f.linhas.length) return lcErro('Adicione pelo menos um material.');
  for (const l of f.linhas) if (!(alNum(l.qtd) > 0)) return lcErro('Quantidade inválida em ' + ((alItem(l.itemId) || {}).nome || 'um item') + '.');
  if (String(f.numero || '').trim().length < 2) return lcErro('Informe o Nº do documento.');
  const er = validaData(f.data); if (er) return lcErro(er);
  if (f.previsao && f.previsao < f.data) return lcErro('A data prevista não pode ser antes da data da solicitação.');
  if (!lcTravar()) return;
  const id = uid(), o = { numero: String(f.numero).trim(), data: f.data, solicitante: String(f.solicitante || '').trim(), liberador: String(f.liberador || '').trim(), previsao: f.previsao || '', obs: String(f.obs || '').trim(), situacao: 'pendente', linhas: f.linhas.map(l => ({ itemId: l.itemId, nome: alItem(l.itemId).nome, qtd: alR(alNum(l.qtd)) })), criadoEm: nowISO(), por: S.user.id, porNome: S.user.nome };
  Audit.log({ acao: 'solicitacao_almox', entidade: 'almox_sol', entidadeId: id, resumo: 'Solicitação ' + o.numero + ': ' + o.linhas.map(l => alQ(l.qtd) + ' ' + l.nome).join(', '), depois: o });
  lcGrava([Data.col('sv2_alm_sol').set(id, o)], 'Solicitação ' + o.numero + ' salva.');
}
LC_FORM.solcanc = f => {
  const x = S.almSol.find(y => y.id === f.solId); if (!x) return null;
  return { ico: 'lixo', icoCls: 'ini-cr', sub: 'Cancelar solicitação', titulo: 'Nº ' + x.numero, corpo: lcMsg() + lcAv('A solicitação continua na lista, marcada como cancelada, com o motivo.') + lcBl('Motivo', lcTx('motivoG', f.motivoG)), rodape: lcPe('lc-solcanc-ok', 'Cancelar solicitação') };
};
function lcSolCancOk() {
  const f = S.fm, x = S.almSol.find(y => y.id === f.solId); if (!x) return;
  const m = String(f.motivoG || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (!lcTravar()) return;
  Audit.log({ acao: 'cancelar_solicitacao_almox', entidade: 'almox_sol', entidadeId: x.id, resumo: 'Cancelou a solicitação ' + x.numero + ' — motivo: ' + m, antes: { situacao: x.situacao }, depois: { situacao: 'cancelada' } });
  lcGrava([Data.col('sv2_alm_sol').update(x.id, { situacao: 'cancelada', canceladaEm: nowISO(), canceladaPor: S.user.nome, canceladaMotivo: m })], 'Solicitação cancelada.');
}
function lcSolAtender(id) {
  const x = S.almSol.find(y => y.id === id); if (!x || !alPode()) return;
  const linhas = (x.linhas || []).filter(l => l.itemId && alItem(l.itemId)).map(l => Object.assign(lcEntLinha(l.itemId), { qtd: alQin(l.qtd), emb: 'uso' }));
  if (!linhas.length) { aviso('Nenhum material desta solicitação está cadastrado ainda. Cadastre no EFClaudian primeiro.', 'erro'); return; }
  lcAbrir({ k: 'entrada', linhas: linhas, doc: x.numero, data: hojeISO(), solId: x.id, pk: false }, () => alAbreSol(id));
}

/* ---------- abrir os formulários ---------- */
function lcNovaSaida(itemId, volta) { if (!alPode()) return; lcAbrir({ k: 'saida', itemId: itemId || '', qtd: '1', lotId: '', motivo: '', motivoTxt: '', guardar: '1', obs: '', data: hojeISO(), vencMot: '', critVenc: '' }, volta); }
function lcNovaEntrada(itemId, volta) { if (!alPode()) return; lcAbrir({ k: 'entrada', linhas: itemId ? [lcEntLinha(itemId)] : [], doc: '', data: hojeISO(), solId: '', pk: false }, volta); }
function lcNovaSol() { if (!alPode()) return; const ult = S.almSol.slice().sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)))[0] || {}; lcAbrir({ k: 'sol', linhas: [], numero: '', data: hojeISO(), solicitante: S.user.nome, liberador: ult.liberador || '', previsao: '', obs: '', pk: true }); }

/* ---------- campos: o que se digita vai direto para o estado do formulário ---------- */
function lcSet(campo, v) {
  const f = S.fm; if (!f) return; const p = campo.split('.');
  if (p[0] === 'aj') { f.aj[p.slice(1).join('.')] = v; return; }
  let o = f; for (let n = 0; n < p.length - 1; n++) { o = o[isNaN(p[n]) ? p[n] : Number(p[n])]; if (!o) return; }
  o[p[p.length - 1]] = v;
}
document.addEventListener('input', e => {
  const t = e.target; if (!t || !t.getAttribute) return;
  if (t.hasAttribute('data-pk')) { const q = tbNorm(t.value).trim(), box = t.closest('.fm-pk'); let n = 0; $$('[data-busca]', box).forEach(b => { const on = !q || q.split(/\s+/).every(w => b.getAttribute('data-busca').indexOf(w) >= 0); b.hidden = !on; if (on) n++; }); const v = $('.fm-pkv', box); if (v) v.hidden = n > 0; return; }
  const c = t.getAttribute('data-fm'); if (!c || !S.fm) return;
  lcSet(c, t.type === 'checkbox' ? (t.checked ? '1' : '0') : t.value);
  if (S.fm.msg) { S.fm.msg = ''; const m = $('#gv .fm-msg'); if (m) m.remove(); }
});
document.addEventListener('change', e => { const t = e.target; if (t && t.getAttribute && t.getAttribute('data-fm') && S.fm) lcSet(t.getAttribute('data-fm'), t.type === 'checkbox' ? (t.checked ? '1' : '0') : t.value); });
DD_AO.lc = (k, v) => {
  const f = S.fm; if (!f) return;
  if (k === 'motivo') { f.motivo = v; f.msg = ''; gvDesenha(true); if (v === '__outro') { const i = $('#gv [data-fm="motivoTxt"]'); if (i) i.focus(); } return; }
  if (k === 'lotId') { f.lotId = v; f.msg = ''; gvDesenha(true); return; }
  if (k.indexOf('emb:') === 0) { const l = f.linhas[Number(k.slice(4))]; if (!l) return; const i = alItem(l.itemId); if (l.preco === lcPrecoSug(i, l.emb || 'compra')) l.preco = lcPrecoSug(i, v); l.emb = v; gvDesenha(true); }
};
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="lc-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), f = S.fm;
  const vol = S.rota.area === 'almox' && S.gv && !S.gvForm ? S.gv : null; /* o detalhe aberto vira o "voltar" */
  const voltaDe = fn => () => gvAbrir(fn);
  if (a === 'lc-sai') { e.preventDefault(); lcNovaSaida(id || '', vol ? voltaDe(vol) : null); }
  else if (a === 'lc-ent') { e.preventDefault(); lcNovaEntrada(id || '', vol ? voltaDe(vol) : null); }
  else if (a === 'lc-sol') { e.preventDefault(); lcNovaSol(); }
  else if (a === 'lc-abrir') { const i = alItem(id); if (!i || !alPode()) return; if (!alLotes(i.id).length) { aviso('Não há frasco lacrado no estoque.', 'erro'); return; } lcAbrir({ k: 'abrir', itemId: id, lotId: '', obs: '', data: hojeISO(), vencMot: '', critVenc: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'lc-fim') { if (!alPode()) return; lcAbrir({ k: 'fim', movId: id, obs: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'lc-aj') { if (!alPode()) return; lcAbrir({ k: 'ajuste', itemId: id, aj: {}, motivoG: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'lc-corr') { const m = S.almMov.find(x => x.id === id); if (!m || !alPodeCorrigir(m)) return; lcAbrir({ k: 'corr', movId: id, qtd: alQin(m.qtd), motivo: m.motivo || '', lote: m.lote || '', validade: m.validade || '', preco: lcDin(m.preco), doc: m.doc || '', motivoG: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'lc-anular') { const m = S.almMov.find(x => x.id === id); if (!m || !alPodeCorrigir(m)) return; lcAbrir({ k: 'anular', movId: id, motivoG: '' }, vol ? voltaDe(vol) : null); }
  else if (a === 'lc-crit-ok') lcCritDecidir(id, true);
  else if (a === 'lc-crit-nao') lcAbrir({ k: 'naoconf', movId: id, motivoG: '' }, vol ? voltaDe(vol) : null);
  else if (a === 'lc-crit-nao-ok') lcCritDecidir(f.movId, false, f.motivoG);
  else if (a === 'lc-sol-atender') lcSolAtender(id);
  else if (a === 'lc-sol-canc') { if (!alPode()) return; lcAbrir({ k: 'solcanc', solId: id, motivoG: '' }, vol ? voltaDe(vol) : null); }
  else if (!f) return;
  else if (a === 'lc-q') { const c = t.getAttribute('data-c'), inp = $('#gv [data-fm="' + c + '"]'), n = alNum(inp ? inp.value : f[c]), v = alQin(Math.max(0, (isNaN(n) ? 0 : n) + Number(t.getAttribute('data-d')))); lcSet(c, v); if (inp) inp.value = v; }
  else if (a === 'lc-sai-item') { f.itemId = id; f.lotId = ''; f.msg = ''; gvDesenha(true); }
  else if (a === 'lc-sai-trocar') { f.itemId = ''; f.lotId = ''; gvDesenha(true); }
  else if (a === 'lc-sai-ok') lcSaidaOk();
  else if (a === 'lc-crit-pedir') lcCritPedir();
  else if (a === 'lc-abrir-ok') lcAbrirOk();
  else if (a === 'lc-fim-ok') lcFimOk(id === '1');
  else if (a === 'lc-ent-item') { if (!f.linhas.some(l => l.itemId === id)) f.linhas.push(lcEntLinha(id)); f.pk = false; f.msg = ''; gvDesenha(true); }
  else if (a === 'lc-ent-add') { f.pk = true; gvDesenha(true); }
  else if (a === 'lc-ent-volta') { f.pk = false; gvDesenha(true); }
  else if (a === 'lc-ent-rm') { f.linhas.splice(Number(id), 1); gvDesenha(true); }
  else if (a === 'lc-ent-ok') lcEntradaOk();
  else if (a === 'lc-aj-ok') lcAjusteOk();
  else if (a === 'lc-corr-ok') lcCorrOk();
  else if (a === 'lc-anular-ok') lcAnularOk();
  else if (a === 'lc-sol-item') { if (!f.linhas.some(l => l.itemId === id)) f.linhas.push({ itemId: id, qtd: '1' }); f.pk = false; gvDesenha(true); }
  else if (a === 'lc-sol-add') { f.pk = true; gvDesenha(true); }
  else if (a === 'lc-sol-volta') { f.pk = false; gvDesenha(true); }
  else if (a === 'lc-sol-rm') { f.linhas.splice(Number(id), 1); gvDesenha(true); }
  else if (a === 'lc-sol-ok') lcSolOk();
  else if (a === 'lc-solcanc-ok') lcSolCancOk();
});
