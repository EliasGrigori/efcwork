/* EFCwork · backup.js — Administração › Backup (v0.6.30). Prefixo: bk.
   Traz do EFClaudian a função "Backup e exportação" (FALTA-DO-EFCLAUDIAN, linha "must"). Lê as coleções do app (sv2_* e efd_*) com a
   permissão de quem está logado e grava UM arquivo .json: { app, versao, geradoEm, cols: { coleção: [documentos] }, falhas }.
   O formato "cols" é o mesmo que o ambiente de teste (Data.importarDemo) já lê. Só o Administrador faz o backup (ele leva a equipe toda).
   Caminho fixo: no Chrome e no Edge do computador o app guarda a pasta escolhida (File System Access, no IndexedDB) e o botão "Salvar"
   grava direto nela, sem janela. No celular o navegador não deixa isso: o arquivo vai para Downloads, que também é um lugar fixo.
   Fora de sv2_login e sv2_recup (sem leitura da lista pelas regras). Fotos entram só se a pessoa marcar. Nenhuma coleção nova. */
const BK_COLS = ['sv2_meta', 'sv2_users', 'sv2_notifs', 'sv2_audit', 'sv2_aprov', 'sv2_resumos', 'sv2_chat', 'sv2_cfg', 'sv2_docs', 'sv2_caixas', 'sv2_lanc', 'sv2_bebs', 'sv2_cloro', 'sv2_cloro_falta',
  'sv2_talhoes', 'sv2_analises', 'sv2_etqmodelos', 'sv2_prog', 'sv2_coletas', 'sv2_aguacol', 'sv2_rodizio', 'sv2_aguaproj', 'sv2_aguaponto', 'sv2_proc', 'sv2_proc_pag', 'sv2_apont', 'sv2_rnc', 'sv2_rnc_plano',
  'sv2_rnc_gut', 'sv2_analise', 'sv2_alm_itens', 'sv2_alm_mov', 'sv2_alm_sol', 'sv2_alm_pref', 'sv2_conquistas', 'sv2_alm_equip', 'sv2_alm_cal', 'sv2_alm_inv', 'sv2_alm_transf', 'sv2_normas', 'sv2_normas_ed',
  'sv2_bugs', 'sv2_bugs_seq', 'sv2_tarefas', 'efd_docs', 'efd_partes', 'sv2_impressos', 'sv2_envio_imp', 'sv2_treinos'];
const BK_FOTOS = ['sv2_avatar', 'sv2_cloro_foto', 'sv2_agua_foto', 'sv2_fotos', 'sv2_rnc_foto', 'sv2_alm_equip_foto', 'sv2_alm_foto', 'sv2_bugs_foto'];
const bkPode = () => !!S.user && isPrincipal(S.user);
const bkTemPasta = () => typeof window.showDirectoryPicker === 'function';
const bkDois = n => String(n).padStart(2, '0');
const bkNome = d => 'efcwork-backup-' + d.getFullYear() + '-' + bkDois(d.getMonth() + 1) + '-' + bkDois(d.getDate()) + '-' + bkDois(d.getHours()) + bkDois(d.getMinutes()) + '.json';
const bkTam = b => b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
const bkQuando = iso => { const d = new Date(iso); return isNaN(d) ? '' : bkDois(d.getDate()) + '/' + bkDois(d.getMonth() + 1) + '/' + d.getFullYear() + ' às ' + bkDois(d.getHours()) + ':' + bkDois(d.getMinutes()); };

/* a pasta escolhida fica no IndexedDB do aparelho (só o "ponteiro"; nada de dado) */
function bkBanco() { return new Promise((ok, no) => { const r = indexedDB.open('efcwork-backup', 1); r.onupgradeneeded = () => r.result.createObjectStore('pasta'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); }
async function bkPasta(modo, val) {
  try {
    const db = await bkBanco();
    return await new Promise(ok => { const t = db.transaction('pasta', modo), s = t.objectStore('pasta'), q = modo === 'readonly' ? s.get('p') : val === undefined ? s.delete('p') : s.put(val, 'p'); let r = null; q.onsuccess = () => { r = q.result; }; t.oncomplete = () => { db.close(); ok(modo === 'readonly' ? r || null : true); }; t.onerror = () => { db.close(); ok(null); }; });
  } catch (e) { return null; }
}
/* a pessoa precisa dar permissão de novo de vez em quando; isso só pode ser pedido dentro de um clique */
async function bkPermissao(h) {
  if (!h) return false;
  try { if ((await h.queryPermission({ mode: 'readwrite' })) === 'granted') return true; return (await h.requestPermission({ mode: 'readwrite' })) === 'granted'; } catch (e) { return false; }
}

/* lê tudo o que o perfil consegue ler; o que a regra negar vai para "falhas" e não derruba o resto */
async function bkLer(comFotos, prog) {
  const nomes = BK_COLS.concat(comFotos ? BK_FOTOS : []), cols = {}, falhas = {}; let feitos = 0;
  const lim = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('tempo')), ms))]);
  const um = async n => { try { cols[n] = await lim(Data.col(n).all(), 30000); } catch (e) { falhas[n] = (e && (e.code || e.message)) || 'erro'; } feitos++; if (prog) prog(feitos, nomes.length); };
  for (let i = 0; i < nomes.length; i += 6) await Promise.all(nomes.slice(i, i + 6).map(um)); /* 6 de cada vez: não sufoca o celular */
  return { cols: cols, falhas: falhas };
}
function bkArquivo(r, comFotos) {
  const agora = new Date(), resumo = {}; Object.keys(r.cols).forEach(n => { resumo[n] = r.cols[n].length; });
  const pac = { app: 'EFCwork', versao: VERSAO, geradoEm: agora.toISOString(), geradoPor: (S.user && S.user.login) || '', modo: DEMO ? 'demonstracao' : 'nuvem', comFotos: !!comFotos, resumo: resumo, falhas: r.falhas, cols: r.cols };
  /* Timestamp do Firestore vira texto; sem isso o JSON sairia como {seconds, nanoseconds} */
  /* o JSON.stringify chama o toJSON do Timestamp antes do substituto; por isso olha o valor original (this[k]). Referência de documento vira o caminho. */
  const txt = JSON.stringify(pac, function (k, v) { const o = this[k]; if (o && typeof o === 'object') { if (typeof o.toDate === 'function') return o.toDate().toISOString(); if (o.firestore && typeof o.path === 'string') return o.path; } return v; });
  return { nome: bkNome(agora), blob: new Blob([txt], { type: 'application/json' }), docs: Object.keys(resumo).reduce((s, n) => s + resumo[n], 0), cols: Object.keys(resumo).length, falhas: Object.keys(r.falhas) };
}

/* a mensagem fica no estado (S._bkMsg): a tela é redesenhada depois do backup e a mensagem não pode sumir junto */
function bkMsg(t, ok) { S._bkMsg = t ? [t, !!ok] : null; const m = $('#bk-msg'); if (!m) return; m.textContent = t || ''; m.classList.toggle('ok', !!ok); }
async function bkSalvar(bt) {
  if (!bkPode() || bt.disabled) return;
  const comFotos = !!($('#bk-fotos') || {}).checked; let h = null;
  /* a permissão da pasta tem de ser pedida já no clique, antes da leitura demorada */
  if (bkTemPasta()) { h = await bkPasta('readonly'); if (h && !(await bkPermissao(h))) { bkMsg('O navegador não deixou gravar na pasta. Toque em "Trocar a pasta" e escolha de novo.'); return; } }
  if (!DEMO && navigator.onLine === false) { bkMsg('Sem internet: o backup sairia só com a cópia guardada neste aparelho. Conecte e tente de novo.'); return; }
  bt.disabled = true; bt.textContent = 'Lendo…'; bkMsg('');
  try {
    const r = await bkLer(comFotos, (a, b) => { bt.textContent = 'Lendo… ' + a + ' de ' + b; });
    const f = bkArquivo(r, comFotos); let onde = '';
    if (h) { try { const fh = await h.getFileHandle(f.nome, { create: true }), w = await fh.createWritable(); await w.write(f.blob); await w.close(); onde = 'na pasta "' + h.name + '"'; } catch (e) { h = null; } }
    if (!h) { const url = URL.createObjectURL(f.blob); ipSalvar(url, f.nome); setTimeout(() => URL.revokeObjectURL(url), 60000); /* celular lento: o arquivo grande demora a começar a baixar */ onde = bkTemPasta() ? 'em Downloads (a pasta não respondeu)' : 'em Downloads'; }
    Store.set('cw-bk-ultimo', JSON.stringify({ em: new Date().toISOString(), nome: f.nome, docs: f.docs, tam: f.blob.size, onde: onde }));
    Audit.log({ acao: 'backup', entidade: 'backup', resumo: 'Backup salvo: ' + f.nome + ' (' + f.docs + ' registros)' });
    bkMsg('Pronto: ' + f.nome + ' (' + f.docs + ' registros, ' + bkTam(f.blob.size) + ') salvo ' + onde + '.' + (f.falhas.length ? ' Sem leitura: ' + f.falhas.join(', ') + '.' : ''), !f.falhas.length);
  } catch (e) { console.error(e); bkMsg('Não deu para fazer o backup agora. Confira a internet e tente de novo.'); }
  const t = $('#gv'); if (t && S.rota.area === 'adm' && S.rota.aba === 'backup') render();
}
async function bkEscolher() {
  if (!bkPode() || !bkTemPasta()) return;
  try { const h = await window.showDirectoryPicker({ id: 'efcwork-backup', mode: 'readwrite', startIn: 'documents' }); await bkPasta('readwrite', h); S._bkPasta = h.name; render(); bkMsg('Pasta "' + h.name + '" guardada. Agora é só tocar em "Salvar backup".', true); }
  catch (e) { if (!e || e.name !== 'AbortError') bkMsg('Esta pasta não pode ser usada. Crie uma pasta só para os backups (por exemplo, dentro de Documentos) e escolha ela.'); }
}
async function bkEsquecer() { await bkPasta('readwrite', undefined); S._bkPasta = ''; render(); }

function bkTela() {
  if (!bkPode()) return '';
  const u = (() => { try { return JSON.parse(Store.get('cw-bk-ultimo') || 'null'); } catch (e) { return null; } })(), tem = bkTemPasta();
  const fx = S._bkPasta; /* nome da pasta, carregado de forma assíncrona abaixo */
  const rodaPasta = tem
    ? '<div class="bk-pasta"><span class="bk-rot">Pasta de destino</span><b id="bk-nome">' + esc(fx || 'nenhuma escolhida') + '</b>' +
      '<div class="bk-bts"><button type="button" class="bt" data-act="bk-escolher">' + ic('pasta') + (fx ? 'Trocar a pasta' : 'Escolher a pasta') + '</button>' + (fx ? '<button type="button" class="bt" data-act="bk-esquecer">Esquecer a pasta</button>' : '') + '</div></div>'
    : '<p class="ini-vz">Este navegador não deixa o app guardar uma pasta. O backup vai para a pasta Downloads do aparelho, sempre a mesma. No computador, use o Chrome ou o Edge para escolher uma pasta própria.</p>';
  return '<div class="adm-gr"><section class="pn bk"><div class="hd"><h3>Salvar backup</h3></div><div class="cpo">' +
    '<p class="ini-vz">Um arquivo só, com todos os registros do app, inclusive os da equipe. Guarde num lugar seguro.</p>' + rodaPasta +
    '<label class="bk-ck"><input type="checkbox" id="bk-fotos"> Incluir as fotos (o arquivo fica bem maior)</label>' +
    '<div class="bk-bts"><button type="button" class="bt pr" data-act="bk-salvar">' + ic('baixar') + 'Salvar backup</button></div>' +
    '<p class="en-msg' + (S._bkMsg && S._bkMsg[1] ? ' ok' : '') + '" id="bk-msg" role="status">' + esc(S._bkMsg ? S._bkMsg[0] : '') + '</p></div></section>' +
    '<section class="pn bk"><div class="hd"><h3>Último backup</h3></div><div class="cpo">' + (u ? '<dl class="adm-dl"><dt>Quando</dt><dd>' + esc(bkQuando(u.em)) + '</dd><dt>Arquivo</dt><dd>' + esc(u.nome) + '</dd><dt>Registros</dt><dd>' + esc(u.docs) + ' (' + esc(bkTam(u.tam)) + ')</dd><dt>Onde</dt><dd>' + esc(u.onde) + '</dd></dl>' : '<p class="ini-vz">Ainda não foi feito neste aparelho.</p>') + '</div></section></div>';
}
if (bkTemPasta()) CS_CARGAS.push(() => { bkPasta('readonly').then(h => { const n = h ? h.name : ''; if (n !== S._bkPasta) { S._bkPasta = n; if (S.rota && S.rota.area === 'adm' && S.rota.aba === 'backup') render(); } }); });

const bkAdmOrig = TELAS.adm;
TELAS.adm = aba => aba === 'backup' ? cabecalho({ titulo: 'Backup', abaNome: 'Backup', meta: [metaPl('só o Principal vê', '', 'cadeado')] }) + bkTela() : bkAdmOrig(aba);
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="bk-"]'); if (!t) return;
  const a = t.getAttribute('data-act');
  if (a === 'bk-salvar') bkSalvar(t); else if (a === 'bk-escolher') bkEscolher(); else if (a === 'bk-esquecer') bkEsquecer();
});
