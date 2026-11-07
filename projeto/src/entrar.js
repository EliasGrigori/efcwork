/* EFCwork · entrar.js — tela de entrar (garota-propaganda: Revista no Escuro, Avisos no Claro) e primeiro acesso. Prefixo: en.
   Usa o mesmo login do EFClaudian (usuário ou e-mail; senha). O primeiro acesso só aparece num projeto/demonstração sem nenhum Principal. */
const EN_ERROS = {
  'auth/invalid-credential': 'Login ou senha incorretos.', 'auth/wrong-password': 'Login ou senha incorretos.', 'auth/user-not-found': 'Login ou senha incorretos.',
  'auth/invalid-email': 'Login ou senha incorretos.', 'auth/invalid-login-credentials': 'Login ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 'auth/network-request-failed': 'Sem conexão. Conecte-se à internet para entrar.',
  'auth/email-already-in-use': 'Este login já existe.', 'auth/weak-password': 'Senha fraca: use no mínimo 8 caracteres.'
};
const enErro = e => EN_ERROS[e && e.code] || 'Não foi possível entrar agora. Tente de novo.';

/* v0.4.2 — tela de entrar com a garota-propaganda (aprovada em 07/11/2026, jeito A):
   tema Escuro = "Revista" (palavra gigante atrás e na frente da foto + faixa dourada com as áreas);
   tema Claro = "Avisos flutuando" (foto num arco dourado + cartões do dia a dia).
   Tudo vem da Administração (sv2_cfg/entrar). Antes do login o Firebase não deixa ler a configuração,
   então o app guarda uma cópia no aparelho (cw-entrar) sempre que alguém entra; sem cópia, fica só o fundo e o formulário. */
const EN_PADRAO = { palavra: 'QUALIDADE', avisos: [['Laudo recebido', 'RU12 · O.S AQ-100'], ['Coleta enviada', '3 amostras · IBRA'], ['Calibração em dia', 'pHmetro PHM-02']] };
const enFaixaPadrao = () => AREAS.filter(a => a.id !== 'inicio' && a.id !== 'adm').map(a => a.nome);
function enCfg() {
  let c = S.cfgEntrar || null;
  if (!c) { try { c = JSON.parse(Store.get('cw-entrar') || 'null'); } catch { c = null; } }
  c = c || {};
  const av = Array.isArray(c.avisos) ? c.avisos.filter(x => x && x[0]) : [];
  return { foto: imgSrc(c.foto), recorte: c.recorte !== false, palavra: String(c.palavra || EN_PADRAO.palavra).toUpperCase().replace(/\s+/g, '').slice(0, 12) || EN_PADRAO.palavra,
    faixa: (Array.isArray(c.faixa) && c.faixa.filter(Boolean).length ? c.faixa.filter(Boolean) : enFaixaPadrao()).slice(0, 12),
    avisos: (av.length ? av : EN_PADRAO.avisos).slice(0, 3), nome: c.nome || (S.empresa && S.empresa.nome) || '' };
}
/* chamada pela casca sempre que sv2_cfg muda (depois do login) */
function enGuardaCache() {
  const c = Object.assign({}, S.cfgEntrar || {}); delete c.id; delete c.srv; c.nome = (S.empresa && S.empresa.nome) || '';
  try { Store.set('cw-entrar', JSON.stringify(c)); } catch {}
}
const EN_OK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', EN_IDA = '<svg viewBox="0 0 24 24"><path d="M4 12h12M12 6l6 6-6 6"/></svg>';
function enArte(c, escuro) {
  const ft = c.foto ? '<div class="en-ft' + (c.recorte ? '' : ' moldura') + '" data-px="14"><img src="' + c.foto + '" alt="">' + (c.recorte ? '<i class="en-br"></i>' : '') + '</div>' : '';
  if (escuro) {
    const n = c.palavra.length, meio = Math.ceil(n / 2);
    const pal = cls => '<div class="en-pal' + cls + '" data-px="5" aria-hidden="true">' + c.palavra.split('').map((l, i) => (i === meio && n > 6 ? '<br>' : '') + '<span style="--i:' + i + '">' + esc(l) + '</span>').join('') + '</div>';
    const fx = c.faixa.map(x => '<span>' + esc(x) + '</span>').join('');
    return '<div class="en-fundo"></div>' + pal('') + ft + (c.foto && c.recorte ? pal(' frente') : '') +
      '<div class="en-faixa" aria-hidden="true"><div>' + fx + fx + '</div></div><i class="en-luz"></i>';
  }
  const pos = ['a', 'b', 'c'];
  return '<div class="en-fundo"></div><div class="en-arco" data-px="5"></div>' + ft +
    c.avisos.map((x, i) => '<div class="en-chip ' + pos[i] + '" data-px="' + [18, 22, 16][i] + '" aria-hidden="true"><i class="' + (i === 1 ? 'ida' : 'ok') + '">' + (i === 1 ? EN_IDA : EN_OK) + '</i><span><b>' + esc(x[0]) + '</b><small>' + esc(x[1] || '') + '</small></span></div>').join('');
}
function enTela() {
  const primeiro = S._setup === false, c = enCfg(), escuro = csTema() === 'escuro';
  const n = c.palavra.length;
  const form = primeiro ?
    '<h2>Primeiro acesso</h2><p>Crie a conta do Administrador. Depois ele cadastra as outras pessoas.</p>' +
    '<form class="en-form" data-form="en-primeiro" novalidate>' +
    '<label class="cp">Nome completo<input id="en-nome" autocomplete="name" required></label>' +
    '<label class="cp">Usuário<input id="en-login" autocomplete="username" autocapitalize="none" required><small>Só letras, números e ponto. Ex.: joana.silva</small></label>' +
    '<label class="cp">E-mail<input id="en-email" type="email" autocomplete="email"><small>Para recuperar a senha.</small></label>' +
    '<label class="cp">Senha<input id="en-senha" type="password" autocomplete="new-password" required><small>No mínimo 8 caracteres.</small></label>' +
    '<label class="cp">Repita a senha<input id="en-senha2" type="password" autocomplete="new-password" required></label>' +
    '<p class="en-msg" id="en-msg" role="alert"></p><button class="bt pr en-bt" type="submit">Criar e entrar</button></form>'
    :
    '<h2>Entrar</h2><p>Use o login que o administrador da empresa criou para você.</p>' +
    '<form class="en-form" data-form="en-entrar" novalidate>' +
    '<label class="cp">Usuário ou e-mail<input id="en-login" autocomplete="username" autocapitalize="none" value="' + esc(Store.get('cw-ultimo-login') || '') + '" required></label>' +
    '<label class="cp">Senha<span class="en-sen"><input id="en-senha" type="password" autocomplete="current-password" required><button type="button" class="bt ic-so" data-act="en-ver" aria-label="Mostrar a senha">' + ic('olho') + '</button></span></label>' +
    '<div class="en-lin"><label class="en-ck"><input type="checkbox" id="en-lembrar"' + (Store.get('cw-ultimo-login') ? ' checked' : '') + '> Lembrar usuário</label><a href="' + EFCLAUDIAN_URL + '" target="_blank" rel="noopener">Esqueci a senha</a></div>' +
    '<p class="en-msg" id="en-msg" role="alert">' + esc(S._erroEntrar || '') + '</p><button class="bt pr en-bt" type="submit">Entrar</button></form>';
  return '<div class="en ' + (escuro ? 'en-rev' : 'en-avi') + (c.foto ? '' : ' sem-foto') + '" style="--n:' + n + ';--h:' + (n > 6 ? Math.ceil(n / 2) : n) + (c.foto && c.recorte ? ';--foto:url(' + c.foto + ')' : '') + '">' +
    '<section class="en-arte">' + enArte(c, escuro) + '</section>' +
    '<section class="en-lado"><div class="en-caixa">' +
    '<div class="en-mk"><span class="cs-logo">' + ic('broto') + '</span><span><b>' + APP_NOME + '</b><small>família ' + APP_FAMILIA + '</small></span></div>' + form +
    '<div class="en-rod"><span>' + APP_APELIDO + ' · v' + VERSAO + (DEMO ? ' · demonstração' : '') + '</span><span>' + esc(c.nome) + '</span></div></div></section></div>';
}
/* a foto e as camadas acompanham o mouse (no PC); parado com "reduzir movimento" */
document.addEventListener('mousemove', e => {
  const en = document.querySelector('.en'); if (!en || matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 900) return;
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  en.querySelectorAll('[data-px]').forEach(c => { const k = Number(c.dataset.px); c.style.translate = (-x * k * 2).toFixed(1) + 'px ' + (-y * k).toFixed(1) + 'px'; });
});
function enDepois() { const i = $('#en-login'); if (i && !i.value) { try { i.focus(); } catch {} } else { const s = $('#en-senha'); if (s) try { s.focus(); } catch {} } }
function enMsg(t) { const m = $('#en-msg'); if (m) m.textContent = t || ''; }

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act="en-ver"]'); if (!t) return;
  const i = $('#en-senha'); if (i) i.type = i.type === 'password' ? 'text' : 'password';
});
document.addEventListener('submit', async e => {
  const f = e.target.closest && e.target.closest('[data-form^="en-"]'); if (!f) return;
  e.preventDefault();
  const bt = f.querySelector('button[type=submit]');
  if (f.getAttribute('data-form') === 'en-entrar') {
    const login = $('#en-login').value.trim(), senha = $('#en-senha').value;
    if (!login || !senha) return enMsg('Preencha o usuário e a senha.');
    if (login.indexOf('@') < 0 && /(gmail|hotmail|outlook|yahoo|icloud)\.com|\.com\.br$/i.test(login)) return enMsg('Parece um e-mail sem o @. Digite o e-mail completo (ex.: nome@gmail.com) ou o seu login.'); /* v0.4.1 */
    bt.disabled = true; bt.textContent = 'Entrando…'; enMsg('');
    try {
      if ($('#en-lembrar').checked) Store.set('cw-ultimo-login', login); else Store.del('cw-ultimo-login');
      const id = await Data.auth.signIn(login, senha);
      if (DEMO) await csCarregaUsuario(id);
    } catch (er) { enMsg(enErro(er)); bt.disabled = false; bt.textContent = 'Entrar'; }
    return;
  }
  /* primeiro acesso */
  const nome = $('#en-nome').value.trim(), login = slugLogin($('#en-login').value), email = $('#en-email').value.trim().toLowerCase(), s1 = $('#en-senha').value, s2 = $('#en-senha2').value;
  if (nome.split(/\s+/).filter(Boolean).length < 2) return enMsg('Informe o nome completo (nome e sobrenome).');
  if (login.length < 3) return enMsg('O usuário precisa de pelo menos 3 letras ou números.');
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return enMsg('Digite um e-mail válido ou deixe em branco.');
  if (s1.length < 8) return enMsg('A senha precisa de no mínimo 8 caracteres.');
  if (s1 !== s2) return enMsg('As senhas não são iguais.');
  bt.disabled = true; bt.textContent = 'Criando…';
  try {
    const id = await Data.auth.createFirst(login, s1, email);
    await Data.firstSetup({ id: id, nome: nome, login: login, perfil: 'principal', estrela: false, bloqueado: false, criadoEm: nowISO(), email: email, emailOk: DEMO, emailPendente: '', precisaCompletar: false });
    S._setup = true; Store.set('cw-ultimo-login', login);
    await csCarregaUsuario(id);
  } catch (er) { enMsg(enErro(er)); bt.disabled = false; bt.textContent = 'Criar e entrar'; }
});
