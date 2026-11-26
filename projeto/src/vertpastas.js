/* EFCwork · vertpastas.js — v0.6.35 · P3b · Administração › Pastas do Vértice (aprovada no ITEM 196, 26/11 11:41).
   As 5 pastas dos Impressos; para cada uma, quem lê: todos que entram no Cwork (padrão) ou só as pessoas marcadas.
   Regras do Elias (ITEM 196): Principal e Líder ★ leem tudo e são os únicos que SALVAM; quem lê também edita, mas sem salvar
   (Secundário e Visitante); planilha protegida e "Desproteger" ficam com o Vértice. Guardado em sv2_cfg/vertice_pastas;
   só o Principal muda (a regra do Firestore entra na P3c). A porta passa a ter pastas(). */
Object.assign(S, { vtPastas: null });
CS_CARGAS.push(() => { csOuve('sv2_cfg', l => { const d = (l || []).find(x => x.id === 'vertice_pastas'); S.vtPastas = d && Array.isArray(d.pastas) ? d.pastas : []; vtUlt = 'x'; vtConfere(); if (S.rota.area === 'adm' && S.rota.aba === 'vertice') render(); }); });
const vtCfgPasta = nome => (S.vtPastas || []).find(p => p && p.nome === nome) || null;
const vtLeTodos = c => !c || c.todos !== false;
function vtPastasDe(u) {
  if (!u || !u.id || u.precisaCompletar || u.bloqueado) return [];
  const sup = isSup(u);
  return IP_PASTAS.map(nome => { const c = vtCfgPasta(nome), ler = sup || vtLeTodos(c) || ((c && c.leitores) || []).indexOf(u.id) >= 0; return { nome: nome, ler: ler, editar: ler, salvar: ler && sup }; });
}
/* aba na Administração: só o Principal */
{ const adm = AREAS.find(a => a.id === 'adm'), i = adm.abas.findIndex(t => t.id === 'backup');
  adm.abas.splice(i >= 0 ? i : adm.abas.length, 0, { id: 'vertice', nome: 'Pastas do Vértice', get negada() { return !isPrincipal(S.user); } }); }
const vtPessoasLeem = () => (S.users || []).filter(u => !isSup(u) && !u.bloqueado).sort((a, b) => cmpTxt(a.nome, b.nome));
const vtResumo = nome => { const c = vtCfgPasta(nome); if (vtLeTodos(c)) return 'Todos que entram no Cwork'; const n = ((c && c.leitores) || []).filter(id => (S.users || []).some(u => u.id === id)).length; return n ? n + (n === 1 ? ' pessoa marcada' : ' pessoas marcadas') : 'Só Principal e Líder ★'; };
function vtPastasTela() {
  if (!isPrincipal(S.user)) return '';
  return '<section class="pn vt-pn"><div class="hd"><h3>Quem lê cada pasta</h3></div>' +
    '<ul class="vt-ps">' + IP_PASTAS.map(nome => '<li><span class="vt-pn-n">' + ic('pasta') + '<b>' + esc(nome) + '</b></span><span class="vt-pn-q">' + esc(vtResumo(nome)) + '</span>' +
      '<button type="button" class="bt ic-so" data-act="vt-pasta" data-p="' + esc(nome) + '" title="Mudar quem lê ' + esc(nome) + '" aria-label="Mudar quem lê ' + esc(nome) + '">' + ic('assina') + '</button></li>').join('') + '</ul>' +
    '<p class="vt-reg">Principal e Líder ★ leem todas as pastas e são os únicos que salvam. Quem lê também pode editar e imprimir, sem salvar.</p></section>';
}
const vtAdmOrig = TELAS.adm;
TELAS.adm = aba => aba === 'vertice' ? cabecalho({ titulo: 'Pastas do Vértice', abaNome: 'Pastas do Vértice', meta: [metaPl('só o Principal vê', '', 'cadeado')] }) + vtPastasTela() : vtAdmOrig(aba);
const VT_QUEM = [['todos', 'Todos que entram no Cwork'], ['escolhidos', 'Só as pessoas marcadas']];
LC_FORM.vtPasta = f => {
  const ps = vtPessoasLeem();
  let c = lcMsg() + lcBl('Quem lê', ddHTML('vt:quem', f.quem, VT_QUEM));
  if (f.quem === 'escolhidos') c += lcBl('Pessoas', ps.length ? '<div class="vt-cks">' + ps.map(u => '<label class="vt-ck"><input type="checkbox" data-vtck="' + esc(u.id) + '"' + (f.leitores.indexOf(u.id) >= 0 ? ' checked' : '') + '><span>' + esc(u.nome) + '</span><small>' + esc(perfilLabel(u)) + '</small></label>').join('') + '</div>' : lcAv('Não há outras pessoas cadastradas.'), 'Principal e Líder ★ já leem');
  return { ico: 'pasta', sub: 'Pastas do Vértice', titulo: f.pasta, corpo: c, rodape: lcPe('vt-pasta-ok', 'Salvar') };
};
DD_AO.vt = (k, v) => { const f = S.fm; if (!f || k !== 'quem') return; f.quem = v; f.sujo = true; f.msg = ''; gvDesenha(true); };
async function vtPastaOk() {
  const f = S.fm; if (!f || !isPrincipal(S.user)) return; if (!lcTravar()) return;
  if (f.quem === 'escolhidos') f.leitores = $$('#gv [data-vtck]').filter(x => x.checked).map(x => x.getAttribute('data-vtck'));
  const lista = IP_PASTAS.map(nome => { const velho = vtCfgPasta(nome) || { nome: nome, todos: true, leitores: [] }; return nome === f.pasta ? { nome: nome, todos: f.quem !== 'escolhidos', leitores: f.quem === 'escolhidos' ? f.leitores.slice(0, 300) : [] } : { nome: nome, todos: velho.todos !== false, leitores: (velho.leitores || []).slice(0, 300) }; });
  try {
    await Data.col('sv2_cfg').set('vertice_pastas', { pastas: lista, alteradoEm: nowISO(), alteradoPor: S.user.nome, alteradoPorId: S.user.id });
    Audit.log({ acao: 'vertice_pastas', entidade: 'config', entidadeId: 'vertice_pastas', resumo: 'Pastas do Vértice · ' + f.pasta + ': ' + (f.quem === 'escolhidos' ? f.leitores.length + ' pessoa(s)' : 'todos') });
    lcFim(); aviso('Pasta ' + f.pasta + ' atualizada.', 'ok');
  } catch (e) { lcErro('Não foi possível salvar: ' + (e && e.message || e)); }
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act="vt-pasta"], [data-act="vt-pasta-ok"]'); if (!t) return;
  if (t.getAttribute('data-act') === 'vt-pasta-ok') return vtPastaOk();
  const nome = t.getAttribute('data-p'), c = vtCfgPasta(nome);
  lcAbrir({ k: 'vtPasta', pasta: nome, quem: vtLeTodos(c) ? 'todos' : 'escolhidos', leitores: ((c && c.leitores) || []).slice() });
});
document.addEventListener('change', e => { if (e.target.matches && e.target.matches('#gv [data-vtck]') && S.fm) S.fm.sujo = true; });
