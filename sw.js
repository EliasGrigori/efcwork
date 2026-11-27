/* EFCwork — sw.js (veio do EFClaudian v2.84.0+): guarda a TELA do app no aparelho para abrir sem internet.
   Os DADOS não passam por aqui: o Firestore guarda o cache dele e sincroniza quando a conexão volta.
   O nome do cache sobe a cada versão (tools/montar.py troca efcwork-0.6.40). */
const VERSAO = 'efcwork-0.6.40';
const ESSENCIAIS = ['./index.html'];
const TELA = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const FORA = [
  'https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/13.4.0/firebase-app-check-compat.js'
];
const ESPERA_REDE_MS = 3500;

/* guarda o que ainda não está guardado (não falha se um item não vier) */
function completar(c) {
  return Promise.all(TELA.concat(FORA).map(u => c.match(u).then(x => x || c.add(u).catch(() => null))));
}
self.addEventListener('install', ev => {
  /* sem a tela guardada, esta versão não se instala e a anterior continua valendo */
  /* v0.6.37: 'reload' = vem do servidor. Sem isso o navegador podia entregar a tela da versão anterior (o GitHub deixa guardar 10 min) */
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(ESSENCIAIS.map(u => new Request(u, { cache: 'reload' }))).then(() => completar(c))));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('efcwork-') === 0 && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', ev => {
  if (ev.data === 'pular') self.skipWaiting();
  /* v0.6.37: o app pergunta qual é a versão que está pronta, para avisar com o número certo */
  else if (ev.data === 'versao' && ev.ports && ev.ports[0]) ev.ports[0].postMessage(VERSAO.replace('efcwork-', ''));
});

function guardada() { return caches.match('./index.html').then(x => x || caches.match('./')); }
/* a tela: primeiro a internet (pega a versão nova), mas no máximo 3,5 s; sem internet ou lenta, a guardada */
function navegar(r) {
  /* v0.6.37: 'no-cache' = confere com o servidor se a tela mudou (sem mudança, a resposta é curta) */
  /* v0.6.37: só a tela do app é guardada (abrir outro arquivo pelo endereço não toma o lugar dela) e redirecionamento volta para o navegador */
  const caminho = new URL(r.url).pathname, raiz = new URL('./', self.location).pathname, doApp = caminho === raiz || caminho === raiz + 'index.html';
  const rede = fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(resp => {
    if (resp && resp.redirected) return Response.redirect(resp.url, 302);
    if (doApp && resp && resp.ok && resp.type === 'basic') { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put('./index.html', cp).then(() => completar(c))); }
    return resp;
  });
  return new Promise(res => {
    let feito = false; const fim = x => { if (!feito && x) { feito = true; res(x); } };
    const t = setTimeout(() => { guardada().then(fim); }, ESPERA_REDE_MS);
    rede.then(resp => { clearTimeout(t); if (resp && (resp.ok || resp.status === 302)) fim(resp); else guardada().then(x => fim(x || resp)); })
      .catch(() => { clearTimeout(t); guardada().then(x => fim(x || Response.error())); });
  });
}
self.addEventListener('fetch', ev => {
  const r = ev.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  /* endereço antigo do EFCquiz: vai direto à rede, para não trocar a tela guardada do EFClaudian pela dele */
  if (u.origin === self.location.origin && u.pathname.indexOf('/efcquiz/') >= 0) return;
  /* v0.6.34 (P5 item 1): o Vértice vai morar em /efcwork/vertice/ e tem o sw.js dele; este não guarda nada de lá (senão, sem internet, o Cwork abriria a tela do Vértice) */
  if (u.origin === self.location.origin && (u.pathname.indexOf('/efcwork/vertice/') === 0 || u.pathname === '/efcwork/vertice')) return; /* v0.6.36: também sem a barra final */
  const fonte = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  /* Firestore / login: sempre direto (nunca guardar) */
  if (!fonte && (/googleapis\.com$|firebaseio\.com$|identitytoolkit|securetoken/.test(u.hostname) || u.pathname.indexOf('/google.firestore') >= 0)) return;
  if (r.mode === 'navigate') { ev.respondWith(navegar(r)); return; }
  /* SDK do Firebase, fontes e ícones: do aparelho primeiro */
  if (u.hostname === 'www.gstatic.com' || fonte || u.origin === self.location.origin) {
    ev.respondWith(caches.match(r).then(x => x || fetch(r).then(resp => { if (resp && resp.status === 200) { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put(r, cp)); } return resp; })));
  }
});
