/* EFCwork — sw.js (veio do EFClaudian v2.84.0+): guarda a TELA do app no aparelho para abrir sem internet.
   Os DADOS não passam por aqui: o Firestore guarda o cache dele e sincroniza quando a conexão volta.
   O nome do cache sobe a cada versão (tools/montar.py troca efcwork-0.4.2). */
const VERSAO = 'efcwork-0.4.2';
const ESSENCIAIS = ['./index.html'];
const TELA = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const FORA = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'
];
const ESPERA_REDE_MS = 3500;

/* guarda o que ainda não está guardado (não falha se um item não vier) */
function completar(c) {
  return Promise.all(TELA.concat(FORA).map(u => c.match(u).then(x => x || c.add(u).catch(() => null))));
}
self.addEventListener('install', ev => {
  /* sem a tela guardada, esta versão não se instala e a anterior continua valendo */
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(ESSENCIAIS).then(() => completar(c))));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('efcwork-') === 0 && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', ev => { if (ev.data === 'pular') self.skipWaiting(); });

function guardada() { return caches.match('./index.html').then(x => x || caches.match('./')); }
/* a tela: primeiro a internet (pega a versão nova), mas no máximo 3,5 s; sem internet ou lenta, a guardada */
function navegar(r) {
  const rede = fetch(r).then(resp => {
    if (resp && resp.ok && resp.type === 'basic') { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put('./index.html', cp).then(() => completar(c))); }
    return resp;
  });
  return new Promise(res => {
    let feito = false; const fim = x => { if (!feito && x) { feito = true; res(x); } };
    const t = setTimeout(() => { guardada().then(fim); }, ESPERA_REDE_MS);
    rede.then(resp => { clearTimeout(t); if (resp && resp.ok) fim(resp); else guardada().then(x => fim(x || resp)); })
      .catch(() => { clearTimeout(t); guardada().then(x => fim(x || Response.error())); });
  });
}
self.addEventListener('fetch', ev => {
  const r = ev.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  /* endereço antigo do EFCquiz: vai direto à rede, para não trocar a tela guardada do EFClaudian pela dele */
  if (u.origin === self.location.origin && u.pathname.indexOf('/efcquiz/') >= 0) return;
  const fonte = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  /* Firestore / login: sempre direto (nunca guardar) */
  if (!fonte && (/googleapis\.com$|firebaseio\.com$|identitytoolkit|securetoken/.test(u.hostname) || u.pathname.indexOf('/google.firestore') >= 0)) return;
  if (r.mode === 'navigate') { ev.respondWith(navegar(r)); return; }
  /* SDK do Firebase, fontes e ícones: do aparelho primeiro */
  if (u.hostname === 'www.gstatic.com' || fonte || u.origin === self.location.origin) {
    ev.respondWith(caches.match(r).then(x => x || fetch(r).then(resp => { if (resp && resp.status === 200) { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put(r, cp)); } return resp; })));
  }
});
