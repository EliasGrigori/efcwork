/* EFCwork · base.js — configuração, armazenamento do aparelho, ajudantes, ícones e dados (Firebase ou modo demonstração).
   Prefixo dos nomes deste módulo: nenhum (é a base). Os outros módulos usam prefixos próprios (cs, en, ini, ar, adm).
   Store e Data vieram do EFClaudian v2.102.59 (mesmo projeto Firebase, mesmas coleções sv2_*), quase sem mudança. */
const VERSAO = '0.4.8';
const APP_NOME = 'EFCwork';
const APP_APELIDO = 'Cwork Quality';
const APP_FAMILIA = 'EFClaudian';
const EFCLAUDIAN_URL = 'https://eliasgrigori.github.io/efclaudian/';
/* configuração pública do projeto Firebase (a mesma do EFClaudian; não é senha: quem protege os dados são as regras e o login) */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAm5bkvHaWaS3mMBmfFP-ug0kB2ve9GjQ4',
  authDomain: 'docseliasflorencio.firebaseapp.com',
  projectId: 'docseliasflorencio',
  storageBucket: 'docseliasflorencio.firebasestorage.app',
  messagingSenderId: '1043678730602',
  appId: '1:1043678730602:web:6e03bf65fd892f9782ad13'
};
const fbConfigAtual = () => FIREBASE_CONFIG;
const appCheckLigar = () => false; /* o EFClaudian deixa o App Check desligado na prática; aqui ele não é carregado */
function storeAvisoCheio() { try { aviso('O armazenamento deste navegador está cheio. Libere espaço para o app guardar os dados.', 'erro'); } catch {} }

const Store = (function () {
  /* v2.102.9 (Nº 28): LER e GRAVAR separados. Memória cheia não impede de ler o que já estava guardado; o que não couber
     vai para a memória da aba (sessionStorage: sobrevive a recarregar) e, por último, para a memória da página. */
  const mem = {}, SES = 'sv2s:'; let ok = false, le = false, ses = false;
  try { localStorage.getItem('__sv2t'); le = true; } catch (e) { le = false; }
  try { const k = '__sv2t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); ok = true; } catch (e) { ok = false; }
  try { const k = '__sv2t'; sessionStorage.setItem(k, '1'); sessionStorage.removeItem(k); ses = true; } catch (e) { ses = false; }
  const falha = { n: 0, cota: false, chave: '', em: '' };
  const tem = k => Object.prototype.hasOwnProperty.call(mem, k);
  function registrar(k, e) {
    falha.n++; falha.chave = k; falha.em = new Date().toISOString();
    if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) falha.cota = true;
    try { console.warn('Armazenamento: não gravou', k, e && (e.name || e.code)); } catch {}
    setTimeout(() => { try { storeAvisoCheio(); } catch {} }, 0);
  }
  return {
    persistente: ok, falha: falha,
    get(k) {
      if (tem(k)) return mem[k];
      if (ses) { try { const v = sessionStorage.getItem(SES + k); if (v !== null) return v; } catch {} }
      if (le) { try { return localStorage.getItem(k); } catch {} }
      return null;
    },
    set(k, v) {
      v = String(v);
      if (le) { try { localStorage.setItem(k, v); delete mem[k]; if (ses) { try { sessionStorage.removeItem(SES + k); } catch {} } return; } catch (e) { registrar(k, e); } }
      if (ses) { try { sessionStorage.setItem(SES + k, v); delete mem[k]; return; } catch {} }
      mem[k] = v;
    },
    del(k) { if (le) { try { localStorage.removeItem(k); } catch {} } if (ses) { try { sessionStorage.removeItem(SES + k); } catch {} } delete mem[k]; },
    soNaAba() { const l = Object.keys(mem); if (ses) { try { for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); if (k && k.indexOf(SES) === 0) l.push(k.slice(SES.length)); } } catch {} } return l; }
  };
})();

let DEMO = /[?&]demo=1/.test(location.search) || /(^|#|&)demo(=1)?($|&)/.test(location.hash) || Store.get('sv2-demo') === '1';
/* nomes dos perfis na tela (pedido do Elias 05/11: trocar "Secundário"). O valor gravado no Firebase não muda (principal, principal_temp,
   secundario + estrela, visitante): o EFClaudian continua lendo igual. Proposta A em aprovação: Administrador · Líder · Colaborador · Consulta. */
const PERFIL_NOMES = { principal: 'Administrador', principal_temp: 'Administrador temporário', lider: 'Líder', secundario: 'Colaborador', visitante: 'Consulta' };
const PERFIS = { principal: PERFIL_NOMES.principal, principal_temp: PERFIL_NOMES.principal_temp, secundario: PERFIL_NOMES.secundario, visitante: PERFIL_NOMES.visitante };

/* ============ AJUDANTES ============ */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = v => v == null ? '' : String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const imgSrc = u => { const s = String(u == null ? '' : u).trim(); return /^(data:image\/[a-z0-9.+-]+[;,]|blob:|https:\/\/)/i.test(s) ? esc(s) : ''; };
/* modo demonstração: as mesmas listas das regras do Firestore (06/11) para quem não é líder ★/Administrador, para os testes pegarem permissão negada */
const DEMO_REGRAS = { sv2_alm_inv: ['contagens', 'folhas'], sv2_alm_equip: ['situacao', 'local', 'posicao', 'guardadoEm', 'sitAntes', 'posAntes', 'restricaoCal', 'qtdLocal', 'qtdGuard', 'trfQtd', 'transito', 'hist', 'atualizadoEm'], sv2_alm_cal: [] };
function demoRegraNega(col, chaves) { const l = DEMO_REGRAS[col], u = S.user; if (!l || !u || typeof isSup !== 'function' || isSup(u)) return ''; return chaves.map(k => k.split('.')[0]).find(k => l.indexOf(k) < 0) || ''; }
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const nowISO = () => new Date().toISOString();
const hojeISO = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const clean = o => JSON.parse(JSON.stringify(o));
function slugLogin(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, ''); }
const emailOf = login => slugLogin(login) + '@efclaudian.app';
const perfilLabel = u => !u ? '' : u.perfil === 'secundario' && u.estrela ? PERFIL_NOMES.lider : (PERFIL_NOMES[u.perfil] || u.perfil);
const isPrincipal = u => !!u && (u.perfil === 'principal' || u.perfil === 'principal_temp');
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function fmtD(iso) { if (!iso) return '—'; const p = String(iso).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '—'; }
function dataLonga(d) { d = d || new Date(); const s = DIAS[d.getDay()]; return s.charAt(0).toUpperCase() + s.slice(1) + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
function iniciais(nome) { const p = String(nome || '?').trim().split(/\s+/); return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }

/* aviso na tela (com Desfazer opcional) */
function aviso(txt, tipo, desfazer) {
  const h = $('#avisos'); if (!h) return;
  const d = document.createElement('div'); d.className = 'av ' + (tipo || 'ok');
  d.innerHTML = '<span>' + esc(txt) + '</span>' + (desfazer ? '<button type="button" class="av-df">Desfazer</button>' : '');
  if (desfazer) d.querySelector('.av-df').addEventListener('click', () => { try { desfazer(); } catch {} d.remove(); });
  h.appendChild(d); setTimeout(() => { d.classList.add('sai'); setTimeout(() => d.remove(), 300); }, desfazer ? 6000 : 3800);
}

/* ============ ÍCONES (desenhados, sem emoji) ============ */
const ICS = {
  casa: '<path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/>',
  frasco: '<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
  pizza: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  lista: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 13l2 2 4-4"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  pino: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  guarda: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 12h17M10 8h4M10 16h4"/>',
  bancada: '<path d="M3 9h18M5 9v11M19 9v11M8 9V5h3v4M14 9V6h2v3"/>',
  caixa: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  escudo: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  graf: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  eng: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  sino: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', mais: '<path d="M12 5v14M5 12h14"/>', menos: '<path d="M5 12h14"/>', recontar: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>', entra: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>', sai: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14"/>', lapis: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l2 2"/>', ajuste: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', seta: '<path d="m9 6 6 6-6 6"/>', volta: '<path d="m15 6-6 6 6 6"/>',
  broto: '<path d="M12 21v-8"/><path d="M12 13c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5zM12 11c0-3.5 2.6-6 6.5-6 0 3.5-2.6 6-6.5 6z"/>',
  relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', excl: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.2v.2"/>', alerta: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.3v.2"/>',
  ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sair: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  predio: '<path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>', pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.3 2.5 3.5 5.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  filtro: '<path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/>',
  ordAsc: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M14 6h6M14 12h4.5M14 18h3"/>', ordDesc: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M14 6h3M14 12h4.5M14 18h6"/>',
  ordPad: '<path d="M4 7h16M4 12h16M4 17h16"/>', abre: '<path d="m7 10 5 5 5-5"/>', arrasta: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  colunas: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.5 4v16M14.5 4v16"/>',
  planilha: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 12h7M8.5 16h7M12 12v6"/>',
  impressora: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
  lixo: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v6M14 11v6"/>', imagem: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8 8.5"/>'
};
const ic = (n, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICS[n] || '') + '</svg>';

/* ============ DADOS (do EFClaudian v2.102.59) ============ */
const Data = (function () {
  let fdb = null, fauth = null, demoAuthCb = null;
  const watchers = {};
  const dk = n => 'sv2demo_' + n;
  const dLoad = n => { try { return JSON.parse(Store.get(dk(n)) || '[]'); } catch (e) { return []; } };
  const dSave = (n, a) => { try { Store.set(dk(n), JSON.stringify(a)); } catch (e) {} };
  const dAuth = () => { try { return JSON.parse(Store.get('sv2demo_auth') || '{}'); } catch (e) { return {}; } };
  function dView(n, o) {
    let a = dLoad(n);
    if (o && o.desde && o.order) a = a.filter(x => String(x[o.order] || '') >= o.desde);
    if (o && o.contem) a = a.filter(x => Array.isArray(x[o.contem[0]]) && x[o.contem[0]].indexOf(o.contem[1]) >= 0); /* v2.89.0 */
    if (o && o.order) a = a.slice().sort((x, y) => String(y[o.order]).localeCompare(String(x[o.order])));
    if (o && o.limit) a = a.slice(0, o.limit);
    return a;
  }
  function dNotify(n) { (watchers[n] || []).forEach(w => w.cb(dView(n, w.o))); }
  function setPath(obj, path, val) {
    const p = path.split('.'); let o = obj;
    for (let i = 0; i < p.length - 1; i++) o = (o[p[i]] = o[p[i]] || {});
    o[p[p.length - 1]] = val;
  }
  /* v2.84.0: leitura que não pendura sem internet — tenta a nuvem por até 4 s; sem resposta, usa a cópia guardada no aparelho */
  const fbDoc = d => d && d.exists ? Object.assign({ id: d.id }, d.data()) : null;
  function fbGet(ref) {
    const cache = () => ref.get({ source: 'cache' }).then(fbDoc).catch(() => undefined);
    const srv = () => ref.get().then(fbDoc);
    if (navigator.onLine === false) return cache().then(x => x !== undefined ? x : srv());
    let t = null;
    const lim = new Promise(r => { t = setTimeout(() => r({ lento: true }), 4000); });
    return Promise.race([srv().then(x => ({ x: x }), e => ({ e: e })), lim]).then(r => {
      clearTimeout(t);
      if ('x' in r) return r.x;
      return cache().then(x => { if (x !== undefined) return x; if (r.e) throw r.e; return srv(); });
    });
  }
  function col(name) {
    if (DEMO) {
      return {
        watch(cb, o) {
          const w = { cb: cb, o: o || {} };
          (watchers[name] = watchers[name] || []).push(w);
          setTimeout(() => cb(dView(name, w.o)), 0);
          return () => { watchers[name] = (watchers[name] || []).filter(x => x !== w); };
        },
        add(obj) { const a = dLoad(name); const id = uid(); a.push(Object.assign({ id: id }, clean(obj))); dSave(name, a); dNotify(name); return Promise.resolve(id); },
        set(id, obj) { const a = dLoad(name).filter(x => x.id !== id); a.push(Object.assign({ id: id }, clean(obj))); dSave(name, a); dNotify(name); return Promise.resolve(id); },
        update(id, patch) { const ruim = Object.keys(patch).find(k => /[~*\/\[\]]/.test(k)); if (ruim) return Promise.reject(new Error('Invalid field path (' + ruim + '): o Firestore não aceita ~ * / [ ]')); const nega = demoRegraNega(name, Object.keys(patch)); if (nega) return Promise.reject(Object.assign(new Error('Missing or insufficient permissions (' + nega + ')'), { code: 'permission-denied' })); const a = dLoad(name); const it = a.find(x => x.id === id); if (!it) return Promise.reject(new Error('nf')); Object.keys(patch).forEach(k => setPath(it, k, clean({ v: patch[k] }).v)); dSave(name, a); dNotify(name); return Promise.resolve(); },
        /* v2.84.0: acrescenta um item numa lista do registro sem regravar a lista inteira (ninguém apaga o passo do outro) */
        push(id, campo, item, extra) { const a = dLoad(name); const it = a.find(x => x.id === id); if (!it) return Promise.reject(new Error('nf')); it[campo] = (Array.isArray(it[campo]) ? it[campo] : []).concat([clean({ v: item }).v]); Object.keys(extra || {}).forEach(k => setPath(it, k, clean({ v: extra[k] }).v)); dSave(name, a); dNotify(name); return Promise.resolve(); },
        get(id) { return Promise.resolve(dLoad(name).find(x => x.id === id) || null); },
        fresco(id) { return Promise.resolve(dLoad(name).find(x => x.id === id) || null); }, /* v2.89.1 */
        all() { return Promise.resolve(dLoad(name)); }
      };
    }
    return {
      watch(cb, o) {
        o = o || {};
        let q = fdb.collection(name);
        if (o.desde && o.order) q = q.where(o.order, '>=', o.desde);
        if (o.contem) q = q.where(o.contem[0], 'array-contains', o.contem[1]); /* v2.89.0 */
        if (o.order) q = q.orderBy(o.order, 'desc');
        if (o.limit) q = q.limit(o.limit);
        return q.onSnapshot(s => cb(s.docs.map(d => Object.assign({ id: d.id }, d.data()))), e => { console.error(name, e); if (o.onError) o.onError(e); });
      },
      add(obj) {
        const ref = fdb.collection(name).doc();
        const p = ref.set(Object.assign(clean(obj), { srv: firebase.firestore.FieldValue.serverTimestamp() })).then(() => ref.id);
        p.docId = ref.id; return p; /* v2.84.0: o número do registro já existe antes de a nuvem confirmar */
      },
      set(id, obj) {
        const p = fdb.collection(name).doc(id).set(Object.assign(clean(obj), { srv: firebase.firestore.FieldValue.serverTimestamp() })).then(() => id);
        p.docId = id; return p;
      },
      update(id, patch) { return fdb.collection(name).doc(id).update(patch); },
      push(id, campo, item, extra) { const p = Object.assign({}, extra || {}); p[campo] = firebase.firestore.FieldValue.arrayUnion(clean({ v: item }).v); return fdb.collection(name).doc(id).update(p); },
      get(id) { return fbGet(fdb.collection(name).doc(id)); },
      fresco(id) { return fdb.collection(name).doc(id).get({ source: 'server' }).then(fbDoc); }, /* v2.89.1: direto do servidor */
      all() { return fdb.collection(name).get().then(q => q.docs.map(d => Object.assign({ id: d.id }, d.data()))); }
    };
  }
  const auth = {
    onChange(cb) {
      if (DEMO) { demoAuthCb = cb; cb(Store.get('sv2demo_session') || null); }
      else if (fauth) fauth.onAuthStateChanged(u => { if (!DEMO) cb(u ? u.uid : null); });
    },
    async signIn(login, senha) {
      if (DEMO) {
        if (String(login).indexOf('@') >= 0) { const e = String(login).trim().toLowerCase(), a = dAuth(); login = Object.keys(a).find(k => a[k].email === e) || '__sem__'; } /* v2.74.0 */
        const r = dAuth()[slugLogin(login)];
        if (!r || r.pass !== senha) { const e = new Error('x'); e.code = 'auth/invalid-credential'; throw e; }
        Store.set('sv2demo_session', r.uid);
        if (demoAuthCb) demoAuthCb(r.uid);
        return r.uid;
      }
      /* v2.74.0: login ou e-mail; o login procura a ligação login → e-mail (sv2_login) e tenta o e-mail confirmado e o pendente */
      const ent = String(login || '').trim(); let cands = [], trocado = false; /* v2.79.0 */
      if (ent.indexOf('@') >= 0) cands = [ent.toLowerCase()];
      else { try { const d = await fdb.collection('sv2_login').doc(slugLogin(ent)).get(); if (d.exists) { const x = d.data(); if (x.trocadoPara) trocado = true; [x.email, x.emailNovo, x.interno].forEach(e => { if (e && cands.indexOf(e) < 0) cands.push(e); }); } } catch (e) {} if (trocado) { const er = new Error('login-trocado'); er.code = 'auth/login-trocado'; throw er; } if (!cands.length) cands.push(emailOf(ent)); }
      let ult = null;
      for (const e of cands) { try { const c = await fauth.signInWithEmailAndPassword(e, senha); return c.user.uid; } catch (er) { ult = er; if (!/invalid-credential|wrong-password|user-not-found|invalid-login-credentials|invalid-email/.test(er && er.code || '')) throw er; } }
      throw ult;
    },
    /* v2.73.0: confere a senha de quem está logado (tela bloqueada) */
    async verificar(senha) {
      if (DEMO) { const r = dAuth()[slugLogin(S.user && S.user.login)]; return !!r && r.pass === senha; }
      const u = fauth && fauth.currentUser; if (!u) return false;
      try { await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, senha)); return true; }
      catch (e) { if (/wrong-password|invalid-credential|invalid-login-credentials/.test(e && e.code || '')) return false; throw e; }
    },
    async signOut() {
      if (DEMO) { Store.del('sv2demo_session'); if (demoAuthCb) demoAuthCb(null); return; }
      await fauth.signOut();
    },
    /* v2.102.39 (Nº 43): com o espaço do navegador cheio o signOut pode falhar e a conta fica; aqui se apaga a sessão guardada à força */
    aindaLogado() { return !DEMO && !!(fauth && fauth.currentUser); },
    async forcarSaida() {
      try { Object.keys(localStorage).filter(k => k.indexOf('firebase:authUser') === 0).forEach(k => localStorage.removeItem(k)); } catch {}
      try { Object.keys(sessionStorage).filter(k => k.indexOf('firebase:') === 0).forEach(k => sessionStorage.removeItem(k)); } catch {}
      try { await new Promise(r => { const q = indexedDB.deleteDatabase('firebaseLocalStorageDb'); q.onsuccess = q.onerror = q.onblocked = () => r(); setTimeout(r, 1500); }); } catch {}
    },
    /* cria a conta de acesso SEM trocar a sessão de quem está logado */
    async createAccount(login, senha, emailInterno) {
      if (DEMO) {
        const a = dAuth(), k = slugLogin(login);
        if (a[k] && !emailInterno) { const e = new Error('x'); e.code = 'auth/email-already-in-use'; throw e; } /* v2.74.0: liberar = acesso novo com o mesmo login */
        const id = uid(); a[k] = { uid: id, pass: senha };
        Store.set('sv2demo_auth', JSON.stringify(a));
        return id;
      }
      const sec = firebase.apps.find(x => x.name === 'sec') || firebase.initializeApp(fbConfigAtual(), 'sec');
      const c = await sec.auth().createUserWithEmailAndPassword(emailInterno || emailOf(login), senha);
      await sec.auth().signOut();
      return c.user.uid;
    },
    /* primeiro acesso: cria a conta Principal e já entra com ela */
    async createFirst(login, senha, email) {
      if (DEMO) { const id = await this.createAccount(login, senha); if (email) { const a = dAuth(); a[slugLogin(login)].email = email; Store.set('sv2demo_auth', JSON.stringify(a)); } Store.set('sv2demo_session', id); return id; }
      const c = await fauth.createUserWithEmailAndPassword(email || emailOf(login), senha);
      if (email) try { await c.user.sendEmailVerification(); } catch (e) {}
      return c.user.uid;
    },
    /* v2.74.0: senha nova, e-mail (Firebase confirma por link), recuperar e o e-mail atual da conta */
    async trocarSenha(nova) {
      if (DEMO) { const a = dAuth(), k = slugLogin(S.user.login); if (a[k]) { a[k].pass = nova; Store.set('sv2demo_auth', JSON.stringify(a)); } return; }
      await fauth.currentUser.updatePassword(nova);
    },
    async definirEmail(email) {
      if (DEMO) { const a = dAuth(), k = slugLogin(S.user.login); if (a[k]) { a[k].email = email; Store.set('sv2demo_auth', JSON.stringify(a)); } return true; }
      await fauth.currentUser.verifyBeforeUpdateEmail(email); return false;
    },
    async recuperar(email) { if (DEMO) return; await fauth.sendPasswordResetEmail(email); },
    emailAtual() { if (DEMO) { const r = dAuth()[slugLogin(S.user && S.user.login)]; return r && r.email || ''; } return fauth && fauth.currentUser ? fauth.currentUser.email || '' : ''; }
  };
  return {
    get mode() { return DEMO ? 'demo' : 'nuvem'; },
    auth: auth,
    col: col,
    async init() {
      if (DEMO) return;
      if (typeof firebase === 'undefined') throw new Error('sdk');
      firebase.initializeApp(fbConfigAtual());
      appCheckLigar(); /* v2.88.0: antes do Firestore e do login */
      fdb = firebase.firestore(); fauth = firebase.auth(); try { fauth.languageCode = 'pt'; } catch (e) {}
      try { await fauth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) { try { await fauth.setPersistence(firebase.auth.Auth.Persistence.SESSION); S._authSessao = true; } catch {} } /* v2.76.0: o aparelho guarda a sessão; ao abrir, o app pede a senha (funciona sem internet). v2.102.9: se não der, guarda na aba */
      try { await fdb.enablePersistence({ synchronizeTabs: true }); } catch (e) { console.warn('Sem cache offline:', e.code); S._semCache = (e && (e.name === 'QuotaExceededError' ? 22 : e.code)) || 'erro'; } /* v2.84.0: avisa na tela */
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(v => { S._persistido = !!v; }).catch(() => {}); } catch {} /* v2.102.9: pede ao navegador para não apagar o cache sozinho */
    },
    async setupDone() {
      if (DEMO) return Store.get('sv2demo_setup') === '1';
      const d = await fbGet(fdb.collection('sv2_meta').doc('setup'));
      if (d) Store.set('sv2-setup', '1'); /* v2.84.0: o aparelho lembra (o login aparece na hora, mesmo sem internet) */
      return !!d;
    },
    /* v2.84.0: a nuvem responde? (um documento pequeno, escutado com a marca "veio do aparelho") */
    conexao(cb) {
      if (DEMO || !fdb) return () => {};
      try { return fdb.collection('sv2_meta').doc('setup').onSnapshot({ includeMetadataChanges: true }, s => cb(!s.metadata.fromCache), () => cb(null)); } catch (e) { return () => {}; }
    },
    /* grava o perfil Principal e a marca "instalado" juntos */
    /* v2.53.0: ambiente de teste — grava a cópia de um backup no armazenamento do modo demo */
    importarDemo(cols, senha) {
      if (!DEMO) return 0; let n = 0, cabe = true; const a = {};
      Object.keys(cols || {}).forEach(c => { if (!/^sv2_/.test(c)) return; const l = (cols[c] || []).map(x => { const y = Object.assign({}, x); delete y.srv; return y; }); const txt = JSON.stringify(l); Store.set(dk(c), txt); try { if (localStorage.getItem(dk(c)) !== txt) cabe = false; } catch (e) { cabe = false; } n += l.length; });
      (cols.sv2_users || []).forEach(u => { if (u && u.login && u.id) a[slugLogin(u.login)] = { uid: u.id, pass: senha }; });
      Store.set('sv2demo_auth', JSON.stringify(a)); Store.set('sv2demo_setup', '1'); Store.del('sv2demo_session'); this._cabe = cabe; return n;
    },
    importarCabe() { return this._cabe !== false; },
    /* v2.102.9 (Nº 28 / 32.4): a nuvem confirmou tudo o que foi lançado neste aparelho? (sem internet: não, depois de ms) */
    async semPendentes(ms) { if (DEMO || !fdb) return true; try { return await Promise.race([fdb.waitForPendingWrites().then(() => true), new Promise(r => setTimeout(() => r(false), ms || 2500))]); } catch (e) { return false; } },
    /* apaga só a CÓPIA da nuvem guardada neste navegador (cache offline). Depois disso a página precisa recarregar. */
    async limparCache() { if (DEMO || !fdb) return false; try { await fdb.terminate(); } catch {} await fdb.clearPersistence(); return true; },
    /* v2.85.0: várias gravações juntas — ou entram todas, ou nenhuma (lote do Firestore; funciona sem internet) */
    novoId(name) { return DEMO || !fdb ? uid() : fdb.collection(name).doc().id; },
    lote(ops) {
      if (DEMO) {
        for (const o of ops) if (o.tipo === 'update' && !dLoad(o.col).some(x => x.id === o.id)) return Promise.reject(new Error('nf'));
        ops.forEach(o => { const c = col(o.col); if (o.tipo === 'set') c.set(o.id, o.dados); else c.update(o.id, o.dados); });
        return Promise.resolve(ops.length);
      }
      const b = fdb.batch();
      ops.forEach(o => { const ref = fdb.collection(o.col).doc(o.id); if (o.tipo === 'set') b.set(ref, Object.assign(clean(o.dados), { srv: firebase.firestore.FieldValue.serverTimestamp() })); else b.update(ref, o.dados); });
      return b.commit().then(() => ops.length);
    },
    async firstSetup(profile) {
      if (DEMO) { await col('sv2_users').set(profile.id, profile); Store.set('sv2demo_setup', '1'); return; }
      const b = fdb.batch();
      b.set(fdb.collection('sv2_users').doc(profile.id), Object.assign(clean(profile), { srv: firebase.firestore.FieldValue.serverTimestamp() }));
      b.set(fdb.collection('sv2_meta').doc('setup'), { por: profile.id, em: nowISO() });
      await b.commit();
    }
  };
})();
