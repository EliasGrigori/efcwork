/* EFCwork · v0.6.36 · P3c: regras do Firestore dos documentos do Vértice ([R7]) e o mapa "acesso" das Pastas do Vértice.
   O emulador do Firestore não baixa neste ambiente: aqui se confere o TEXTO das regras (o resto do arquivo igual ao da v0.6.33,
   o que cada bloco novo exige) e o lado do Cwork no navegador (?demo=1). O teste de verdade é o roteiro do Simulador do Firebase
   (docs/GUIA-SIMULADOR-v0.6.36.md). Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v0636.js */
const fs = require('fs'), path = require('path');
const { chromium, abre, ir } = require('../visual/moderno-v0615/pagina/lib');
const RAIZ = path.resolve(__dirname, '..', '..'), D = path.join(RAIZ, 'docs');
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const velho = fs.readFileSync(path.join(D, 'REGRAS-FIRESTORE-EFCwork-v0.6.33-PROPOSTA.txt'), 'utf8');
const novo = fs.readFileSync(path.join(D, 'REGRAS-FIRESTORE-EFCwork-v0.6.36-PROPOSTA.txt'), 'utf8');
console.log('— O arquivo de regras');
/* tirando o cabeçalho novo, os blocos [R7] e a lista do sv2_cfg, sobra exatamente o arquivo da v0.6.33 */
const i0 = novo.indexOf('\n    // ==================== EFCwork v0.6.36 · P3c'), i1 = novo.indexOf('\n    // sv2_treinos (v0.6.12):');
let resto = novo.slice(0, i0) + novo.slice(i1);
resto = resto.replace(/\/\/ EFCwork v0\.6\.36 \(26\/11\/2026\)[\s\S]*?\/\/          \[R7c\][^\n]*\n/, '').replace(/    \/\/ \[R7c\] v0\.6\.36:[^\n]*\n    \/\/ \(a versão antiga[^\n]*\n/, '')
  .split("['doccontrole', 'backup', 'arquivo', 'vertice_pastas'] && principal() && (doc != 'vertice_pastas' || novo().get('acesso', 0) is map))").join("['doccontrole', 'backup', 'arquivo'] && principal())").split("['doccontrole', 'backup', 'arquivo', 'vertice_pastas']").join("['doccontrole', 'backup', 'arquivo']");
conf(R7null(), 'nenhum "null" nos blocos novos (o verificador do Firebase recusou; print do Elias, 16:24)');
conf(resto === velho, 'fora dos blocos [R7], o arquivo é o mesmo da v0.6.33 (o que está no Firebase, conferido com o que o Elias colou)');
function R7null() { const a = novo.indexOf('EFCwork v0.6.36 · P3c'), b = novo.indexOf('// sv2_treinos'); return novo.slice(a, b).indexOf(', null)') < 0 && novo.slice(a, b).indexOf(': null') < 0 && novo.indexOf("get('acesso', 0) is map") > 0; }
const pares = (a, b) => (novo.split(a).length - 1) === (novo.split(b).length - 1);
conf(pares('{', '}') && pares('(', ')') && pares('[', ']'), 'chaves, parênteses e colchetes fechados');
const R7 = novo.slice(i0, i1), arq = R7.slice(R7.indexOf('match /vtd_arquivos/'), R7.indexOf('match /vtd_partes/')), par = R7.slice(R7.indexOf('match /vtd_partes/'));
conf(/allow delete: if false;/.test(arq) && /allow delete: if false;/.test(par) && /allow update: if false;/.test(par), 'nada se apaga; os pedaços nunca mudam');
conf(/allow create: if \(liderOuPrincipal\(\)/.test(arq) && /allow update: if \(liderOuPrincipal\(\)/.test(arq) && /allow create: if \(liderOuPrincipal\(\)/.test(par), 'só o Principal e o Líder ★ gravam (ITEM 196)');
conf(/novo\(\)\.versao == 1\)/.test(arq) && /novo\(\)\.versao == resource\.data\.get\('versao', 0\) \+ 1\)/.test(arq), 'arquivo novo começa na versão 1; cada gravação sobe exatamente 1 (duas pessoas ao mesmo tempo: a segunda é recusada)');
conf(/novo\(\)\.get\('versaoPartes', 0\) == novo\(\)\.versao && meu\('partesDe'\)\s+&& existsAfter\(vtParte\(id, novo\(\)\.versao, request\.auth\.uid, 0\)\)/.test(R7) && /novo\(\)\.partes - 1/.test(R7), 'a ficha só aponta para pedaços novos que existem (o primeiro e o último, gravados por quem grava)…');
conf(/resource != null && novo\(\)\.get\('versaoPartes', 0\) == resource\.data\.get\('versaoPartes', -1\)\s+&& novo\(\)\.get\('partesDe', ''\) == resource\.data\.get\('partesDe', ''\) && novo\(\)\.partes == resource\.data\.get\('partes', -1\)/.test(R7), '…ou mantém exatamente os pedaços de antes (renomear, pasta, lixeira sem reenviar; revisor)');
conf(/pid == novo\(\)\.arq \+ '_' \+ string\(novo\(\)\.versao\) \+ '_' \+ request\.auth\.uid/.test(par) && /get\('versao', 0\) \+ 1 : 1\)/.test(par), 'pedaço: id com o arquivo, a versão seguinte e quem grava (ninguém atrapalha o envio de outro)');
conf(/b64\.size\(\) <= 900000/.test(par), 'pedaço de até 900 mil letras (como os Impressos)');
conf(/allow read: if liderOuPrincipal\(\) \|\| \(resource != null && vtLe\(resource\.data\.pasta\)\)/.test(arq) && /allow read: if liderOuPrincipal\(\) \|\| \(resource != null && exists/.test(par) && /vtLe\(get\(/.test(par), 'quem lê: o arquivo pela pasta dele; o pedaço pela pasta do arquivo; o que não existe responde "não existe" ao Principal e ao Líder ★ (revisor)');
conf(/allow read: if liderOuPrincipal\(\)/.test(arq) && /acesso\.get\(p, \{'todos': true\}\)/.test(R7) && /c\.get\('todos', true\) == true \|\| request\.auth\.uid in c\.get\('leitores', \[\]\)/.test(R7) && /usuarioAtivo\(\) &&/.test(R7.slice(R7.indexOf('function vtLe'))), 'pasta: Principal e Líder ★ leem tudo; os outros, se a pasta é de todos ou se estão marcados (como na tela)');
const ipp = (fs.readFileSync(path.join(RAIZ, 'src/impressos.js'), 'utf8').match(/const IP_PASTAS = (\[[^\]]*\])/) || [])[1];
conf(ipp && R7.indexOf('p in ' + ipp.replace(/'/g, "'")) >= 0, 'as pastas aceitas são as 5 dos Impressos (as mesmas da tela)');
conf((arq.match(/testeNovo\(\)/g) || []).length === 1 && (arq.match(/testeMuda\(\)/g) || []).length === 1 && /testeNovo\(\)/.test(par), 'conta de teste: só mexe no que é de teste (como o resto)');
conf(/hasOnly\(\['v', 'id', 'ficha', 'versao', 'versaoPartes', 'pasta', 'partes', 'partesDe', 'bytes', 'porId', 'porNome', 'em', 'srv', 'testeConta'\]\)/.test(R7) && /novo\(\)\.get\('porNome', ''\) == eu\(\)\.get\('nome', ''\)/.test(R7), 'ficha: só os campos combinados, em nome de quem grava (nome conferido)');
const cfg = novo.slice(novo.indexOf('match /sv2_cfg/{doc}'), novo.indexOf('// ==================== DOCUMENTOS ===================='));
conf((cfg.match(/\['doccontrole', 'backup', 'arquivo', 'vertice_pastas'\] && principal\(\) && \(doc != 'vertice_pastas' \|\| novo\(\)\.get\('acesso', 0\) is map\)/g) || []).length === 2 && (cfg.match(/!\(doc in \['doccontrole', 'backup', 'arquivo', 'vertice_pastas'\]\) && liderOuPrincipal\(\)/g) || []).length === 2, '[R7c] Pastas do Vértice: só o Principal muda, e sempre com o mapa "acesso" (o app antigo, sem o mapa, é recusado; revisor)');

(async () => {
  console.log('— O Cwork grava o mapa "acesso"');
  const br = await chromium.launch(), p = await abre(br, { raiz: RAIZ, w: 1280, h: 860 }); await p.waitForTimeout(400);
  await p.evaluate(async () => { await Data.col('sv2_users').set('u3', { nome: 'Rita Souza', login: 'rita', perfil: 'secundario', estrela: false, superiores: [], status: 'ativo' }); });
  await ir(p, 'adm/vertice', 700);
  await p.click('[data-act="vt-pasta"][data-p="Fichas e custódias"]'); await p.waitForTimeout(400);
  await p.evaluate(() => DD_AO.vt('quem', 'escolhidos')); await p.waitForTimeout(300);
  await p.check('#gv [data-vtck="u3"]'); await p.click('[data-act="vt-pasta-ok"]'); await p.waitForTimeout(500);
  let d = await p.evaluate(() => Data.col('sv2_cfg').get('vertice_pastas'));
  conf(d && d.acesso && d.acesso['Fichas e custódias'] && d.acesso['Fichas e custódias'].todos === false && d.acesso['Fichas e custódias'].leitores.join() === 'u3', 'salvar a pasta grava o mapa "acesso" com quem lê (' + JSON.stringify(d && d.acesso && d.acesso['Fichas e custódias']) + ')');
  conf(d && Object.keys(d.acesso).length === 5 && d.acesso['Etiquetas'].todos === true && Array.isArray(d.pastas) && d.pastas.length === 5, 'o mapa tem as 5 pastas, e a lista de antes continua (o Cwork lê a lista)');
  /* gravação antiga (v0.6.35, sem o mapa): o Principal regrava sozinho uma vez */
  await p.evaluate(async () => { await Data.col('sv2_cfg').set('vertice_pastas', { pastas: [{ nome: 'Formulários', todos: false, leitores: ['u3'] }] }); });
  await p.waitForTimeout(800);
  d = await p.evaluate(() => Data.col('sv2_cfg').get('vertice_pastas'));
  conf(d && d.acesso && d.acesso['Formulários'] && d.acesso['Formulários'].todos === false && d.acesso['Formulários'].leitores.join() === 'u3', 'gravação antiga sem o mapa: o Principal acrescenta o mapa sozinho, uma vez (' + JSON.stringify(d && d.acesso) + ')');
  const u = await p.evaluate(() => { S.user = Object.assign({}, S.user, { id: 'u3', perfil: 'secundario', estrela: false }); return window.CworkPonteVertice.pastas().filter(x => x.ler).map(x => x.nome); });
  conf(u.indexOf('Formulários') >= 0 && u.indexOf('Etiquetas') >= 0, 'a porta continua igual: a Rita lê Formulários (marcada) e as pastas de todos (' + u.join(', ') + ')');
  conf(p._er.length === 0, 'sem erro de JavaScript' + (p._er.length ? ': ' + p._er[0] : ''));
  await br.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
