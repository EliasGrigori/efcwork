/* EFCwork · cobertura do documento de regras: toda coleção do Firestore usada em src/*.js precisa estar na tabela de
   docs/REGRAS-FIREBASE-EFCwork-v0.6.15.md (ou no documento mais novo REGRAS-FIREBASE-EFCwork-v*.md). Sem navegador.
   Uso: node tools/testes/t_regras_cobertura.js */
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), SRC = path.join(RAIZ, 'src'), DOCS = path.join(RAIZ, 'docs');
let ok = 0, falhas = 0;
const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const usadas = new Set();
fs.readdirSync(SRC).filter(f => f.endsWith('.js')).forEach(f => { (fs.readFileSync(path.join(SRC, f), 'utf8').match(/['"](sv2_[a-z0-9_]+|efd_[a-z_]+)['"]/g) || []).forEach(x => usadas.add(x.slice(1, -1))); });
const docs = fs.readdirSync(DOCS).filter(f => /^REGRAS-FIREBASE-EFCwork-v[\d.]+\.md$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const novo = docs[docs.length - 1]; conf(!!novo, 'existe um documento REGRAS-FIREBASE-EFCwork-vX.md (' + novo + ')');
const txt = fs.readFileSync(path.join(DOCS, novo), 'utf8'), tabela = txt.slice(txt.indexOf('## 3.'), txt.indexOf('## 4.'));
const prefixosDemo = /^sv2demo_/;
[...usadas].filter(c => !prefixosDemo.test(c)).sort().forEach(c => conf(tabela.indexOf('`' + c + '`') >= 0, 'coleção ' + c + ' está na tabela'));
const sobra = (tabela.match(/\| `([a-z0-9_]+)`/g) || []).map(x => x.slice(3, -1)).filter(c => !usadas.has(c));
conf(!sobra.length, 'a tabela não lista coleção que o app já não usa' + (sobra.length ? ': ' + sobra.join(', ') : ''));
console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
