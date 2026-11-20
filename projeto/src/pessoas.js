/* EFCwork · pessoas.js — Administração › Pessoas e Meu perfil (v0.6.26). Prefixo: pes.
   Traz do EFClaudian (Gestão da Qualidade › Equipe + Usuários, Detalhe da pessoa, Meu perfil) o que faltava para o EFCwork funcionar
   sozinho: cadastrar quem entra, dar o perfil, as atribuições e os superiores, bloquear e liberar de novo. Mesmo documento sv2_users
   (id = uid do login), mesmos campos: nome, login, perfil (principal | principal_temp | secundario | visitante), estrela (Líder ★),
   superiores[], atrib {coletas, rateios, cloro, apont, docs, qualidade, almox} (sem atrib = vê tudo, como no EFClaudian), cargo,
   status (ativo | ausente), bloqueado, criadoEm. A conta de acesso é criada sem trocar a sessão de quem está logado
   (Data.auth.createAccount, app "sec"). Quem cadastra, edita e bloqueia: o Administrador. O Líder ★ vê a equipe, sem alterar.
   Meu perfil: cada um muda o próprio cargo, a situação (presente / ausente) e a senha. Nenhuma coleção nova.
   v0.6.29 (varredura S2 e S3): senha de no mínimo 8 em todo lugar; a pessoa nova nasce com precisaCompletar = true e cria a
   própria senha no primeiro acesso (entrar.js); Meu perfil guarda o e-mail para recuperar a senha (o Firebase confirma por link)
   e grava a ligação login → e-mail em sv2_login, como o EFClaudian. */
const pesVe = () => !!S.user && isSup(S.user);
const pesPode = () => !!S.user && isPrincipal(S.user);
const PES_ATRIB = [['coletas', 'Coletas'], ['rateios', 'Rateios'], ['cloro', 'Cloro'], ['apont', 'Apontamentos e auditoria'], ['docs', 'Documentos'], ['qualidade', 'Qualidade'], ['almox', 'Almoxarifado']];
const PES_PERFIL = [['secundario', 'Colaborador'], ['lider', 'Líder ★'], ['principal', 'Administrador'], ['visitante', 'Consulta (só vê)']];
const pesPerfilK = u => u.perfil === 'secundario' && u.estrela ? 'lider' : u.perfil === 'principal_temp' ? 'principal' : (u.perfil || 'secundario');
const pesSit = u => u.bloqueado || u.ativo === false ? 'bloqueado' : u.status === 'ausente' ? 'ausente' : 'ativo';
const PES_SIT = { ativo: ['Ativo', 'ok'], ausente: ['Ausente', 'wa'], bloqueado: ['Bloqueado', ''] };
const pesSitPill = u => { const s = PES_SIT[pesSit(u)]; return '<span class="pill ' + esc(s[1]) + '">' + esc(s[0]) + '</span>'; };
const pesAtribTxt = u => atribLegado(u) || isPrincipal(u) ? 'Todas' : PES_ATRIB.filter(a => u.atrib[a[0]] === true).map(a => a[1]).join(', ') || 'Nenhuma';
const pesSupTxt = u => (Array.isArray(u.superiores) ? u.superiores : []).map(nomeDe).join(', ');
const pesAdmsAtivos = () => S.users.filter(u => isPrincipal(u) && pesSit(u) !== 'bloqueado');

/* ---------- tela ---------- */
function pesTela() {
  const l = S.users.slice().sort((a, b) => (pesSit(a) === 'bloqueado') - (pesSit(b) === 'bloqueado') || cmpTxt(a.nome, b.nome));
  const at = l.filter(u => pesSit(u) !== 'bloqueado').length, au = l.filter(u => pesSit(u) === 'ausente').length;
  const meta = ['<span>' + at + (at === 1 ? ' pessoa ativa' : ' pessoas ativas') + '</span>', au ? metaPl(au + (au === 1 ? ' ausente' : ' ausentes'), 'wa') : ''].filter(Boolean);
  const c = cabecalho({ titulo: 'Pessoas', abaNome: 'Pessoas', meta: meta, acoes: pesPode() ? '<button type="button" class="bt pr" data-act="pes-novo">' + ic('mais') + 'Nova pessoa</button>' : '' });
  return c + tbHTML({ id: 'pes-lista', titulo: 'Pessoas', unidade: 'pessoas', unidade1: 'pessoa', linhas: l, aoClicar: id => pesAbre(id),
    grupos: { v: u => pesSit(u) === 'bloqueado' ? 'bloq' : 'at', ordem: [['at', 'Com acesso'], ['bloq', 'Bloqueados']] },
    busca: u => [u.nome, u.login, u.cargo, perfilLabel(u), pesSupTxt(u)].join(' '), vazio: 'Ninguém com este filtro.',
    cols: [{ k: 'nm', rot: 'Nome', v: u => u.nome || '', cls: 'forte' }, { k: 'lg', rot: 'Login', v: u => u.login || '' }, { k: 'pf', rot: 'Perfil', v: u => perfilLabel(u) },
      { k: 'cg', rot: 'Cargo', v: u => u.cargo || '' }, { k: 'sp', rot: 'Superiores', v: pesSupTxt, longo: true }, { k: 'at', rot: 'Atribuições', v: pesAtribTxt, longo: true },
      { k: 'st', rot: 'Situação', v: u => PES_SIT[pesSit(u)][0], html: pesSitPill }] });
}

/* ---------- detalhe ---------- */
function pesAbre(id) { gvAbrir(() => pesGaveta(id)); }
function pesGaveta(id) {
  const u = userById(id); if (!u) return null;
  const eu = u.id === S.user.id, liderados = S.users.filter(x => (x.superiores || []).indexOf(u.id) >= 0 && pesSit(x) !== 'bloqueado').map(x => x.nome).sort(cmpTxt);
  const rows = [['Login', u.login || ''], ['Perfil', perfilLabel(u)], ['Cargo', u.cargo || ''], ['Situação', PES_SIT[pesSit(u)][0] + (u.bloqueado && u.bloqueadoMotivo ? ' · ' + u.bloqueadoMotivo : '')],
    ['Superiores', pesSupTxt(u) || (isPrincipal(u) ? '' : 'os Administradores (ninguém marcado)')], ['Atribuições', pesAtribTxt(u)], ['Liderados', liderados.join(', ')], ['Cadastrado', u.criadoEm ? fmtD(diaLocal(u.criadoEm)) + (u.criadoPorNome ? ' · ' + u.criadoPorNome : '') : '']];
  let c = gvCampos(rows.filter(r => r[1]));
  if (u.perfil === 'visitante') c += lcAv('Perfil Consulta: vê as áreas marcadas, mas não lança nem altera nada.');
  if (atribLegado(u) && !isPrincipal(u)) c += lcAv('Sem atribuições marcadas: vê todas as áreas (como no EFClaudian). Para limitar, edite e marque só as áreas dele.');
  const cab = pesPode() ? '<button type="button" class="bt ic-so" data-act="pes-editar" data-id="' + esc(u.id) + '" title="Editar" aria-label="Editar">' + ic('lapis') + '</button>' : '';
  const pe = pesPode() && !eu ? (u.bloqueado ? '<span class="au-pesp"></span><button type="button" class="bt pr" data-act="pes-liberar" data-id="' + esc(u.id) + '">' + ic('ok') + 'Liberar o acesso</button>'
    : '<span class="au-pesp"></span><button type="button" class="bt" data-act="pes-bloq" data-id="' + esc(u.id) + '">' + ic('cadeado') + 'Bloquear o acesso</button>') : '';
  return { ico: 'pessoas', sub: 'Administração · Pessoas', titulo: u.nome || u.login, pill: pesSitPill(u), cabAcoes: cab, corpo: c, rodape: pe };
}

/* ---------- nova pessoa e editar ---------- */
function pesNovo() { if (!pesPode()) return; lcAbrir({ k: 'pesEd', id: '', nome: '', login: '', senha: '', perfil: 'secundario', cargo: '', at: {}, sup: {} }); }
function pesEditar(id) {
  const u = userById(id); if (!u || !pesPode()) return;
  const at = {}; PES_ATRIB.forEach(a => { at[a[0]] = atribLegado(u) || u.atrib[a[0]] === true ? '1' : '0'; });
  const sup = {}; (u.superiores || []).forEach(s => { sup[s] = '1'; });
  lcAbrir({ k: 'pesEd', id: u.id, nome: u.nome || '', login: u.login || '', perfil: pesPerfilK(u), cargo: u.cargo || '', at: at, sup: sup }, () => pesAbre(u.id));
}
LC_FORM.pesEd = f => {
  const novo = !f.id, adm = f.perfil === 'principal', sups = S.users.filter(u => isSup(u) && pesSit(u) !== 'bloqueado' && u.id !== f.id).sort((a, b) => cmpTxt(a.nome, b.nome));
  const ck = (campo, on, txt) => '<label class="fm-ck"><input type="checkbox" data-fm="' + esc(campo) + '"' + (on ? ' checked' : '') + '> ' + esc(txt) + '</label>';
  const c = lcMsg() + apPasso(1, 'Quem é') + lcBl('Nome', lcIn('nome', f.nome, ' maxlength="80" placeholder="ex.: Maria Souza"')) +
    '<div class="fm-g cl-fm2">' + lcBl('Login', lcIn('login', f.login, ' maxlength="40" autocapitalize="off" spellcheck="false" placeholder="ex.: maria.souza"' + (novo ? '' : ' disabled')), novo ? 'para entrar' : 'não muda') + lcBl('Cargo', lcIn('cargo', f.cargo, ' maxlength="60" placeholder="ex.: Técnica de laboratório"')) + '</div>' +
    (novo ? lcBl('Senha inicial', '<span class="pes-sen">' + lcIn('senha', f.senha, ' type="password" maxlength="40" autocomplete="new-password" placeholder="mínimo ' + esc(SENHA_MIN) + ' caracteres"') + '<button type="button" class="bt ic-so" data-act="pes-ver" aria-label="Mostrar a senha">' + ic('olho') + '</button></span>', 'vale só para o primeiro acesso') : '') +
    apPasso(2, 'O que pode fazer') + lcBl('Perfil', ddHTML('pes:perfil', f.perfil, PES_PERFIL)) +
    lcAv(adm ? 'Administrador vê e altera tudo, cadastra pessoas e decide qualquer pedido.' : f.perfil === 'lider' ? 'Líder ★ lança, decide os pedidos dos liderados e vê os relatórios.' : f.perfil === 'visitante' ? 'Consulta vê as áreas marcadas, mas não lança nem altera nada.' : 'Colaborador lança; o que precisa de aprovação vai para os superiores.') +
    (adm ? '' : lcBl('Áreas que vê', '<div class="pes-cks">' + PES_ATRIB.map(a => ck('at.' + a[0], f.at[a[0]] === '1', a[1])).join('') + '</div>')) +
    (adm ? '' : apPasso(3, 'A quem responde') + (sups.length ? lcBl('Superiores', '<div class="pes-cks">' + sups.map(u => ck('sup.' + u.id, f.sup[u.id] === '1', u.nome + ' (' + perfilLabel(u) + ')')).join('') + '</div>', 'recebem os pedidos de aprovação') : lcAv('Ainda não há Líder ★ nem Administrador para marcar. Sem superior, os pedidos vão para os Administradores.')));
  return { ico: 'pessoas', sub: 'Administração · Pessoas', titulo: novo ? 'Nova pessoa' : 'Editar ' + (f.nome || ''), corpo: c, rodape: lcPe('pes-ed-ok', novo ? 'Cadastrar' : 'Salvar') };
};
async function pesEdOk() {
  const f = S.fm; if (!f || !pesPode()) return lcErro('Só o Administrador cadastra e altera pessoas.');
  const novo = !f.id, nome = String(f.nome || '').replace(/\s+/g, ' ').trim(), login = slugLogin(f.login), cargo = String(f.cargo || '').trim(), adm = f.perfil === 'principal';
  if (nome.length < 3) return lcErro('Escreva o nome da pessoa.');
  if (novo) {
    if (login.length < 3) return lcErro('O login precisa de pelo menos 3 letras (sem espaço nem acento).');
    if (S.users.some(u => slugLogin(u.login) === login)) return lcErro('Já existe uma pessoa com o login ' + login + '.');
    if (String(f.senha || '').length < SENHA_MIN) return lcErro('A senha inicial precisa de no mínimo ' + SENHA_MIN + ' caracteres.');
  }
  const atrib = {}; PES_ATRIB.forEach(a => { atrib[a[0]] = (f.at || {})[a[0]] === '1'; });
  if (!adm && !Object.values(atrib).some(Boolean)) return lcErro('Marque pelo menos uma área que a pessoa vê.');
  const x = novo ? null : userById(f.id);
  if (x && isPrincipal(x) && !adm && pesAdmsAtivos().length <= 1) return lcErro('Este é o único Administrador. Cadastre outro antes de mudar o perfil dele.');
  if (x && x.id === S.user.id && !adm) return lcErro('Você não pode tirar o seu próprio perfil de Administrador.');
  const superiores = adm ? [] : Object.keys(f.sup || {}).filter(k => f.sup[k] === '1' && userById(k));
  const perfil = adm ? (x && x.perfil === 'principal_temp' ? 'principal_temp' : 'principal') : f.perfil === 'lider' ? 'secundario' : f.perfil;
  const dados = { nome, cargo, perfil, estrela: f.perfil === 'lider', superiores, atrib: adm ? null : atrib };
  if (!lcTravar()) return;
  if (novo) {
    let id;
    try { id = await Data.auth.createAccount(login, String(f.senha)); }
    catch (e) { f._trava = 0; const cd = e && e.code || ''; return lcErro(/email-already-in-use/.test(cd) ? 'Esse login já tem conta de acesso. Use outro login.' : /weak-password/.test(cd) ? 'Senha fraca: use no mínimo ' + SENHA_MIN + ' caracteres.' : 'Não deu para criar a conta de acesso agora (' + (cd || 'sem internet?') + ').'); }
    const o = Object.assign({ id, login, status: 'ativo', bloqueado: false, precisaCompletar: true, criadoEm: nowISO(), criadoPor: S.user.id, criadoPorNome: S.user.nome }, dados); /* v0.6.29: cria a própria senha no primeiro acesso */
    Audit.log({ acao: 'criar_usuario', entidade: 'usuario', entidadeId: id, resumo: 'Cadastrou ' + nome + ' (' + login + ') como ' + perfilLabel(o) });
    lcGrava([Data.col('sv2_users').set(id, o)], nome + ' cadastrado. Passe o login e a senha inicial: no primeiro acesso a pessoa cria a dela.', () => { if (S.gv) gvFecharSo(); });
  } else {
    Audit.log({ acao: 'editar_usuario', entidade: 'usuario', entidadeId: x.id, resumo: 'Alterou o cadastro de ' + nome + ' (' + perfilLabel(Object.assign({}, x, dados)) + ')', antes: { perfil: x.perfil, estrela: !!x.estrela, atrib: x.atrib || null, superiores: x.superiores || [] }, depois: { perfil: dados.perfil, estrela: dados.estrela, atrib: dados.atrib, superiores } });
    f.volta = null; lcGrava([Data.col('sv2_users').update(x.id, dados)], 'Cadastro salvo.', () => pesAbre(x.id));
  }
}

/* ---------- bloquear e liberar (nada se apaga) ---------- */
function pesBloq(id) {
  const u = userById(id); if (!u || !pesPode()) return;
  if (u.id === S.user.id) return aviso('Você não pode bloquear o seu próprio acesso.', 'erro');
  lcAbrir({ k: 'pesBloq', id: u.id, motivo: '' }, () => pesAbre(u.id));
}
LC_FORM.pesBloq = f => { const u = userById(f.id); if (!u) return null;
  return { ico: 'cadeado', sub: u.nome, titulo: 'Bloquear o acesso', corpo: lcMsg() + lcAv('A pessoa sai do app na hora e não entra mais. O que ela lançou continua. Dá para liberar de novo depois.') + lcBl('Motivo', lcTx('motivo', f.motivo, 'ex.: saiu da empresa')), rodape: lcPe('pes-bloq-ok', 'Bloquear') }; };
function pesBloqOk() {
  const f = S.fm, u = f && userById(f.id); if (!u || !pesPode()) return;
  const m = String(f.motivo || '').trim(); if (m.length < 3) return lcErro('Escreva o motivo.');
  if (isPrincipal(u) && pesAdmsAtivos().length <= 1) return lcErro('Este é o único Administrador ativo. Não dá para bloquear.');
  if (!lcTravar()) return;
  Audit.log({ acao: 'bloquear_usuario', entidade: 'usuario', entidadeId: u.id, resumo: 'Bloqueou o acesso de ' + u.nome + ': ' + m });
  f.volta = null; lcGrava([Data.col('sv2_users').update(u.id, { bloqueado: true, bloqueadoMotivo: m, bloqueadoEm: nowISO(), bloqueadoPor: S.user.nome })], 'Acesso de ' + u.nome + ' bloqueado.', () => pesAbre(u.id));
}
function pesLiberar(id) {
  const u = userById(id); if (!u || !pesPode()) return;
  csConfirma({ titulo: 'Liberar o acesso de ' + u.nome + '?', texto: 'Ela volta a entrar com o mesmo login e a mesma senha.', sim: 'Liberar', nao: 'Voltar' }, async () => {
    try { await Data.col('sv2_users').update(u.id, { bloqueado: false, ativo: true, bloqueadoMotivo: '', liberadoEm: nowISO(), liberadoPor: S.user.nome }); Audit.log({ acao: 'liberar_usuario', entidade: 'usuario', entidadeId: u.id, resumo: 'Liberou de novo o acesso de ' + u.nome }); aviso('Acesso de ' + u.nome + ' liberado.'); }
    catch (e) { aviso(/permission/i.test(e && (e.code || e.message) || '') ? 'O Firebase não deixou gravar (permissão em sv2_users).' : 'Não deu para liberar agora.', 'erro'); }
  });
}

/* ---------- Meu perfil (todo mundo) ---------- */
function pesMeuPerfil() {
  const u = S.user, me = userById(u.id) || u;
  return '<div class="adm-gr"><section class="pn"><div class="hd"><h3>Meus dados</h3></div><div class="cpo">' + gvCampos([['Nome', me.nome || ''], ['Login', me.login || ''], ['Perfil', perfilLabel(me)], ['Superiores', isPrincipal(me) ? '' : (pesSupTxt(me) || 'os Administradores')], ['Áreas', pesAtribTxt(me)]]) +
    '<label class="cp">Cargo<input id="pes-cargo" maxlength="60" value="' + esc(me.cargo || '') + '" placeholder="ex.: Técnica de laboratório"></label>' +
    '<label class="cp">Situação' + ddHTML('pes:status', me.status === 'ausente' ? 'ausente' : 'ativo', [['ativo', 'Presente'], ['ausente', 'Ausente (férias, folga): os pedidos vão para os Administradores']]) + '</label>' +
    '<div><button type="button" class="bt pr" data-act="pes-mp-ok">Salvar</button></div></div></section>' +
    '<section class="pn"><div class="hd"><h3>Trocar a senha</h3></div><div class="cpo"><label class="cp">Senha nova<input id="pes-s1" type="password" autocomplete="new-password" maxlength="40"></label>' +
    '<label class="cp">Repita a senha nova<input id="pes-s2" type="password" autocomplete="new-password" maxlength="40"></label><p class="en-msg" id="pes-smsg" role="alert"></p><div><button type="button" class="bt" data-act="pes-senha">Trocar a senha</button></div></div></section>' + pesEmailPainel(me) + '</div>';
}
async function pesMpOk() {
  const cargo = ($('#pes-cargo') || {}).value || '';
  try { await Data.col('sv2_users').update(S.user.id, { cargo: cargo.trim() }); aviso('Perfil salvo.'); } catch (e) { aviso('Não deu para salvar agora.', 'erro'); }
}
/* ---------- e-mail para recuperar a senha ---------- */
function pesEmailPainel(me) {
  const ok = emailReal(DEMO ? (me.emailOk ? me.email : '') : Data.auth.emailAtual()) || (me.emailOk ? emailReal(me.email) : ''), pend = emailReal(me.emailPendente);
  const sit = ok ? '<b>' + esc(ok) + '</b> confirmado.' : pend ? 'Aguardando a confirmação de <b>' + esc(pend) + '</b>: abra o link que chegou nesse e-mail.' : 'Sem e-mail: quem esquece a senha não consegue recuperar sozinho.';
  return '<section class="pn"><div class="hd"><h3>E-mail para recuperar a senha</h3></div><div class="cpo"><p class="pes-esit">' + sit + '</p>' +
    '<label class="cp">' + (ok || pend ? 'Trocar o e-mail' : 'E-mail') + '<input id="pes-email" type="email" autocomplete="email" maxlength="120" placeholder="ex.: nome@gmail.com"></label>' +
    '<p class="en-msg" id="pes-emsg" role="alert"></p><div><button type="button" class="bt" data-act="pes-email">Salvar o e-mail</button></div></div></section>';
}
/* grava o e-mail (Meu perfil e primeiro acesso). Nuvem: o Firebase manda um link e só troca depois do clique (volta false);
   demonstração: fica confirmado na hora (volta true). */
async function pesDefinirEmail(email) {
  const e = emailReal(email); if (!e) throw new Error('email-invalido');
  const conf = await Data.auth.definirEmail(e);
  await Data.col('sv2_users').update(S.user.id, conf ? { email: e, emailOk: true, emailPendente: '' } : { emailPendente: e, emailOk: false });
  try { await Data.auth.ligarLogin(S.user.login, conf ? { email: e, emailNovo: '' } : { emailNovo: e }); } catch (er) { console.warn('sv2_login', er); }
  Audit.log({ acao: 'definir_email', entidade: 'usuario', entidadeId: S.user.id, resumo: conf ? 'Cadastrou o e-mail para recuperar a senha' : 'Pediu a confirmação do e-mail para recuperar a senha' });
  return conf;
}
async function pesEmail() {
  const v = (($('#pes-email') || {}).value || '').trim(), m = $('#pes-emsg'); if (!m) return;
  if (!emailReal(v)) { m.textContent = 'Digite um e-mail válido (ex.: nome@gmail.com).'; return; }
  try { const conf = await pesDefinirEmail(v); m.textContent = ''; aviso(conf ? 'E-mail salvo.' : 'Mandamos um link para ' + emailReal(v) + '. O e-mail vale depois que você abrir o link.'); render(); }
  catch (e) { m.textContent = /recent-login/.test(e && e.code || '') ? 'Por segurança, saia e entre de novo antes de trocar o e-mail.' : /email-already-in-use/.test(e && e.code || '') ? 'Este e-mail já é de outra conta.' : 'Não deu para salvar o e-mail agora.'; }
}
/* nuvem: depois que a pessoa abre o link, o e-mail da conta muda; na entrada seguinte o cadastro e a ligação ficam confirmados */
CS_CARGAS.push(() => {
  const me = S.user, pend = me && emailReal(me.emailPendente); if (DEMO || !pend || emailReal(Data.auth.emailAtual()) !== pend) return;
  Data.col('sv2_users').update(me.id, { email: pend, emailOk: true, emailPendente: '' }).then(() => Data.auth.ligarLogin(me.login, { email: pend, emailNovo: '' })).catch(e => console.warn('email', e));
});
async function pesSenha() {
  const a = ($('#pes-s1') || {}).value || '', b = ($('#pes-s2') || {}).value || '', m = $('#pes-smsg');
  if (a.length < SENHA_MIN) { m.textContent = 'A senha precisa de no mínimo ' + SENHA_MIN + ' caracteres.'; return; }
  if (a !== b) { m.textContent = 'As duas senhas não são iguais.'; return; }
  try { await Data.auth.trocarSenha(a); m.textContent = ''; $('#pes-s1').value = ''; $('#pes-s2').value = ''; aviso('Senha trocada.'); Audit.log({ acao: 'trocar_senha', entidade: 'usuario', entidadeId: S.user.id, resumo: 'Trocou a própria senha' }); }
  catch (e) { m.textContent = /recent-login/.test(e && e.code || '') ? 'Por segurança, saia e entre de novo antes de trocar a senha.' : 'Não deu para trocar a senha agora.'; }
}

/* ---------- entra na Administração ---------- */
const pesAdmOrig = TELAS.adm;
TELAS.adm = aba => aba === 'pessoas' ? (pesVe() ? pesTela() : '') : aba === 'perfil' ? cabecalho({ titulo: 'Meu perfil', abaNome: 'Meu perfil' }) + pesMeuPerfil() : pesAdmOrig(aba);
DD_AO.pes = (k, v) => {
  if (k === 'perfil' && S.fm) { S.fm.perfil = v; S.fm.sujo = true; S.fm.msg = ''; gvDesenha(true); }
  else if (k === 'status') Data.col('sv2_users').update(S.user.id, { status: v }).then(() => aviso(v === 'ausente' ? 'Marcado como ausente: os pedidos vão para os Administradores.' : 'Marcado como presente.')).catch(() => aviso('Não deu para salvar agora.', 'erro'));
};
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act^="pes-"]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  if (a === 'pes-novo') pesNovo(); else if (a === 'pes-editar') pesEditar(id); else if (a === 'pes-ed-ok') pesEdOk();
  else if (a === 'pes-bloq') pesBloq(id); else if (a === 'pes-bloq-ok') pesBloqOk(); else if (a === 'pes-liberar') pesLiberar(id);
  else if (a === 'pes-mp-ok') pesMpOk(); else if (a === 'pes-senha') pesSenha(); else if (a === 'pes-email') pesEmail();
  else if (a === 'pes-ver') { const i = t.parentNode.querySelector('input'); if (i) i.type = i.type === 'password' ? 'text' : 'password'; }
});
