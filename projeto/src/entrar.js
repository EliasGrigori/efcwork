/* EFCwork · entrar.js — tela de entrar (dividida, com ilustração agrícola) e primeiro acesso. Prefixo: en.
   Usa o mesmo login do EFClaudian (usuário ou e-mail; senha). O primeiro acesso só aparece num projeto/demonstração sem nenhum Principal. */
const EN_ERROS = {
  'auth/invalid-credential': 'Login ou senha incorretos.', 'auth/wrong-password': 'Login ou senha incorretos.', 'auth/user-not-found': 'Login ou senha incorretos.',
  'auth/invalid-email': 'Login ou senha incorretos.', 'auth/invalid-login-credentials': 'Login ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 'auth/network-request-failed': 'Sem conexão. Conecte-se à internet para entrar.',
  'auth/email-already-in-use': 'Este login já existe.', 'auth/weak-password': 'Senha fraca: use no mínimo 8 caracteres.'
};
const enErro = e => EN_ERROS[e && e.code] || 'Não foi possível entrar agora. Tente de novo.';

/* ilustração: mamoeiros, sol e fileiras de plantio (desenhada por código, sem imagem externa) */
function enCena() {
  const p = csTema() === 'escuro' ? ['#0b0d16', '#1b2036', '#26304a', '#b08d3e', '#e9c97a', '#2f3b5a'] : ['#1f3a2a', '#2c5a3c', '#4f8a55', '#a9c97f', '#f2d58b', '#3a6d47'];
  let s = '<svg class="en-cena" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="enCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs><rect width="700" height="800" fill="url(#enCeu)"/>';
  s += '<circle cx="520" cy="240" r="74" fill="' + p[4] + '" opacity=".92"/><circle cx="520" cy="240" r="110" fill="' + p[4] + '" opacity=".08"/>';
  s += '<path d="M0 470 C160 420 300 440 420 410 S640 380 700 400 V800 H0Z" fill="' + p[5] + '"/>';
  s += '<path d="M0 540 C180 500 330 520 470 490 S650 470 700 480 V800 H0Z" fill="' + p[2] + '"/>';
  for (let k = 0; k < 14; k++) { const y = 560 + k * 20, sk = k * 6; s += '<path d="M' + (-40 + sk) + ' ' + (y + 18) + ' Q350 ' + (y - 6) + ' ' + (740 - sk) + ' ' + (y + 18) + '" stroke="' + p[3] + '" stroke-width="' + (2 + k * 0.35).toFixed(2) + '" fill="none" opacity="' + (0.35 + k * 0.04).toFixed(2) + '"/>'; }
  for (let j = 0; j < 6; j++) {
    const x = 80 + j * 108 + (j % 2) * 10, h = 92 + (j % 3) * 18, top = 508 - h;
    s += '<path d="M' + x + ' 512 C' + (x - 2) + ' ' + (top + 40) + ' ' + (x + 3) + ' ' + (top + 20) + ' ' + x + ' ' + top + '" stroke="' + p[5] + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    for (let a = -80; a <= 80; a += 32) s += '<path d="M' + x + ' ' + top + ' q 18 -6 40 4 q -20 6 -40 -4z" fill="' + p[3] + '" transform="rotate(' + a + ' ' + x + ' ' + top + ')"/>';
    for (let b = -56; b <= 56; b += 37) s += '<path d="M' + x + ' ' + top + ' q 14 -5 30 3 q -15 5 -30 -3z" fill="' + p[2] + '" transform="rotate(' + (b - 90) + ' ' + x + ' ' + top + ')"/>';
    s += '<ellipse cx="' + (x - 6) + '" cy="' + (top + 16) + '" rx="5.5" ry="9" fill="' + p[4] + '"/><ellipse cx="' + (x + 6) + '" cy="' + (top + 18) + '" rx="5.5" ry="9" fill="' + p[4] + '" opacity=".85"/><ellipse cx="' + x + '" cy="' + (top + 28) + '" rx="5" ry="8" fill="' + p[4] + '" opacity=".75"/>';
  }
  return s + '</svg>';
}
function enTela() {
  const e = S.empresa || {}, primeiro = S._setup === false;
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
  return '<div class="en">' +
    '<section class="en-arte">' + enCena() + '<div class="en-mk"><span class="cs-logo">' + ic('broto') + '</span>' + APP_NOME + ' · família ' + APP_FAMILIA + '</div>' +
    '<div class="en-frase"><b>Qualidade do campo ao laboratório, num lugar só.</b><p>Coletas, documentos, inspeções e almoxarifado da sua empresa, com o que vence hoje na primeira tela.</p></div></section>' +
    '<section class="en-lado"><div class="en-caixa">' + form +
    '<div class="en-rod"><span>' + APP_APELIDO + ' · v' + VERSAO + (DEMO ? ' · demonstração' : '') + '</span><span>' + esc(e.nome || '') + '</span></div></div></section></div>';
}
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
