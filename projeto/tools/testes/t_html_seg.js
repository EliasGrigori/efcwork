/* EFCwork v0.4.15 — Nº 31 (porte do teste_html_seg.js do EFClaudian v2.102.6): checagem de HTML montado com dado sem esc(), rodada a cada versão (na suíte).
   Olha as linhas que montam HTML (innerHTML, outerHTML, insertAdjacentHTML, openSheet, return '<…) e lista
   cada pedaço "' + nome + '" que é só um nome/campo (sem esc(), imgSrc() ou outra função).
   A lista de hoje fica em html-seg-base-efcwork.json (conferida na v0.4.15). Se aparecer um nome NOVO (ou mais vezes que
   na base), o teste falha e mostra a linha: ou passe por esc(), ou justifique e acrescente na base. */
const fs = require('fs'), path = require('path');
/* confere o que o app MONTA: todos os src/*.js (o dist/index.html é a soma deles) */
const SRC = path.resolve(__dirname, '..', '..', 'src');
const html = fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
const basePath = path.join(__dirname, 'html-seg-base-efcwork.json');
function ok(c, n) { console.log((c ? '  ok  ' : ' FALHA ') + n); if (!c) process.exitCode = 1; }
const linhas = html.split('\n'), achados = {}, onde = {};
const montaHTML = /innerHTML|outerHTML|insertAdjacentHTML|openSheet\(|return '<|'<(div|span|td|tr|p|b|li|small|img|a|button|label|option|h3|i) /;
linhas.forEach((l, i) => {
  if (!montaHTML.test(l)) return;
  const re = /' \+ ([A-Za-z_$][\w$]*(?:\.[\w$]+|\[[^\]'"]{1,20}\])*) \+ '/g; let m;
  while ((m = re.exec(l))) { const k = m[1]; achados[k] = (achados[k] || 0) + 1; (onde[k] = onde[k] || []).push(i + 1); }
});
if (process.argv[2] === '--gravar') { fs.writeFileSync(basePath, JSON.stringify(achados, Object.keys(achados).sort(), 1)); console.log('base gravada: ' + Object.keys(achados).length + ' nomes'); process.exit(0); }
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const novos = Object.keys(achados).filter(k => achados[k] > (base[k] || 0));
ok(novos.length === 0, 'nenhum dado novo entra no HTML sem esc()' + (novos.length ? ': ' + novos.map(k => k + ' (linhas ' + onde[k].join(', ') + ')').join('; ') : ' (' + Object.keys(achados).length + ' nomes conhecidos na base)'));
/* variáveis que já saem de imgSrc() na linha de cima (conferido na v0.4.15): logo (adm.js, casca.js), foto (adm.js), c.foto (entrar.js › enCfg) */
const SRC_OK = ['logo', 'foto', 'c.foto'];
const src = (html.match(/src="' \+ (?!esc\(|imgSrc\()[^']{1,60}/g) || []).filter(x => !SRC_OK.some(v => x.indexOf("src=\"' + " + v + " ") === 0));
ok(src.length === 0, 'nenhum <img src> recebe dado sem esc() ou imgSrc()' + (src.length ? ': ' + src.join(' | ') : ''));
console.log('erros de execução: 0');
process.exit(process.exitCode || 0);
