/* EFCwork · v0.6.50 · regras [R8] (Só ver por área), conferência de texto (o emulador do Firestore não baixa aqui).
   Uso: node tools/testes/t_v0650r.js. A prova de verdade é o roteiro docs/GUIA-SIMULADOR-v0.6.50.md, no console. */
const fs = require('fs'), path = require('path'), D = path.resolve(__dirname, '..', '..', 'docs');
const a = fs.readFileSync(path.join(D, 'REGRAS-FIRESTORE-EFCwork-v0.6.36-PROPOSTA.txt'), 'utf8'), b = fs.readFileSync(path.join(D, 'REGRAS-FIRESTORE-EFCwork-v0.6.50-PROPOSTA.txt'), 'utf8');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const sem = t => t.replace(/lancaEm\('\w+', '\w+'\)/g, 'lanca()').replace(/liderOuPrincipalEm\('\w+', '\w+'\)/g, 'liderOuPrincipal()').replace(" && livre('apont')", '');
const corpoA = a.slice(a.indexOf('service cloud.firestore')), corpoB = b.slice(b.indexOf('service cloud.firestore'));
const fun = corpoB.match(/\n    \/\/ \[R8\][\s\S]*?function liderOuPrincipalEm[^\n]*/);
conf(!!fun, 'as 3 funções novas do [R8] estão logo depois de lanca()');
conf(sem(corpoB.replace(fun ? fun[0] : '', '')) === corpoA, 'tirando o [R8], o arquivo é igual ao da v0.6.36 (nenhuma outra linha mudou)');
conf(!/allow\s+read\s*:[^;]*Em\(/.test(b), 'nenhuma leitura mudou');
const usos = (b.match(/(lancaEm|liderOuPrincipalEm)\('/g) || []).length;
conf(usos >= 80, 'gravações das 41 coleções das áreas com a área conferida (' + usos + ' usos)');
conf(['{', '('].every(c => b.split(c).length === b.split(c === '{' ? '}' : ')').length), 'chaves e parênteses fechados');
conf(!/get\('soVer', null\)|, null\)/.test(fun ? fun[0] : ''), 'sem null como padrão (o verificador do console recusa)');
const users = b.match(/match \/sv2_users\/\{uid\}[\s\S]*?allow delete: if false;/)[0];
conf(!/soVer/.test(users) && /soMuda\(\['cargo'/.test(users), 'sv2_users igual: a própria pessoa não muda o soVer dela (só o Principal)');
console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
