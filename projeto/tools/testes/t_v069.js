/* EFCwork · suíte da v0.6.9 — Documentos › Impressos e Apps da família no menu (plano de integração v2, aprovado em 12/11/2026 13:51).
   ?demo=1, fuso America/Fortaleza. Uso: NODE_PATH=$(npm root -g) node tools/testes/t_v069.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), crypto = require('crypto'), { execFileSync } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const EFD = require(path.join(RAIZ, 'tools', 'contrato', 'efd-v1.js'));
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'efc069-'));
/* PDF inventado de N páginas (deitado ou em pé) */
function pdf(txt, pags, deitado) {
  const W = deitado ? 842 : 595, H = deitado ? 595 : 842, objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [' + Array.from({ length: pags }, (x, i) => (4 + i * 2) + ' 0 R').join(' ') + '] /Count ' + pags + ' >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  for (let i = 0; i < pags; i++) { const s = 'BT /F1 18 Tf 60 ' + (H - 60) + ' Td (' + txt + ' ' + (i + 1) + ') Tj ET'; objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Contents ' + (5 + i * 2) + ' 0 R /Resources << /Font << /F1 3 0 R >> >> >>', '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream'); }
  let o = '%PDF-1.4\n'; const pos = []; objs.forEach((x, k) => { pos.push(o.length); o += (k + 1) + ' 0 obj\n' + x + '\nendobj\n'; });
  const xr = o.length; o += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n';
  return Buffer.from(o, 'latin1');
}
const grava = (nome, buf) => { const f = path.join(TMP, nome); fs.writeFileSync(f, buf); return f; };
const F = {
  ficha: grava('ficha-cotacao-lab-a.pdf', pdf('FICHA DE COTACAO (exemplo)', 2)),
  ficha2: grava('ficha-cotacao-lab-a-v2.pdf', pdf('FICHA DE COTACAO v2 (exemplo)', 1, true)),
  foto: path.join(RAIZ, 'src', 'estaticos', 'icon-512.png'),
  xlsx: grava('cadeia-custodia.xlsx', Buffer.concat([Buffer.from('PK\x03\x04', 'latin1'), crypto.randomBytes(40000)])),
  xlsxPdf: grava('cadeia-custodia.pdf', pdf('CADEIA DE CUSTODIA (exemplo)', 1)),
  grande: grava('escaneado-grande.pdf', Buffer.concat([pdf('GRANDE', 1), Buffer.alloc(3500000, 32)])),
  velho: grava('antigo.xls', Buffer.from('antigo')),
  falso: grava('nao-e-pdf.pdf', Buffer.from('isto nao e um pdf'))
};
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza', acceptDownloads: true });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Contrato EFD|Failed to load resource/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(URL); await esp(p, 400);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 700);
  return p;
}
const vai = async (p, h) => { await p.evaluate(x => { location.hash = x; }, h); await esp(p, 450); };
const docs = p => p.evaluate(() => Data.col('efd_docs').all());
const partes = p => p.evaluate(() => Data.col('efd_partes').all());
async function importa(p, arq, o) {
  await p.click('[data-act="ip-importar"]'); await esp(p, 300);
  if (o && o.link) { await p.click('[data-dd="ip:modo"] .dd-b'); await p.click('[data-dd="ip:modo"] [data-v="link"]'); await esp(p, 200); await p.fill('[data-fm="link"]', o.link); }
  else await p.setInputFiles('[data-ip-arq="arq"]', arq);
  await esp(p, 500);
  if (o && o.pdf) { await p.setInputFiles('[data-ip-arq="pdf"]', o.pdf); await esp(p, 400); }
  if (o && o.nome) await p.fill('[data-fm="nome"]', o.nome);
  if (o && o.codigo) await p.fill('[data-fm="codigo"]', o.codigo);
  if (o && o.pasta) { await p.click('[data-dd="ip:pasta"] .dd-b'); await p.click('[data-dd="ip:pasta"] [data-v="' + o.pasta + '"]'); await esp(p, 200); }
  if (o && o.pastaNova) { await p.click('[data-dd="ip:pasta"] .dd-b'); await p.click('[data-dd="ip:pasta"] [data-v="__outra"]'); await esp(p, 200); await p.fill('[data-fm="pastaNova"]', o.pastaNova); }
  await p.click('[data-act="ip-ok"]'); await esp(p, 900);
}
const msg = p => p.evaluate(() => { const m = document.querySelector('#gv .fm-msg'); return m ? m.textContent : ''; });
const abreDoc = async (p, nome) => { await p.evaluate(n => { const d = S.ipDocs.find(x => x.nome === n); if (d) ipAbre(d.id); }, nome); await esp(p, 600); };
const fecha = async p => { for (let i = 0; i < 4 && await p.$('#gv'); i++) { await p.keyboard.press('Escape'); await esp(p, 300); } };
const zipLista = f => execFileSync('python3', ['-c', 'import zipfile,sys,json;z=zipfile.ZipFile(sys.argv[1]);print(json.dumps([[i.filename,i.file_size] for i in z.infolist()]));print(z.read("LISTA.csv").decode("utf-8-sig"))', f]).toString();

(async () => {
  const b = await chromium.launch();
  const p = await abre(b, 1280);
  console.log('Menu: Apps da família');
  const apps = await p.evaluate(() => [...document.querySelectorAll('.cs-app-l')].map(a => ({ n: a.textContent.trim(), h: a.getAttribute('href'), t: a.getAttribute('target'), r: a.getAttribute('rel'), img: a.querySelector('img').naturalWidth })));
  conf(apps.length === 2 && apps[0].n === 'Vértice Docs' && apps[1].n === 'Sabiá', 'Administrador vê Vértice Docs e Sabiá no menu');
  conf(apps.every(a => a.t === '_blank' && /noopener/.test(a.r)) && apps[0].h === 'https://eliasgrigori.github.io/EFCdocs/' && apps[1].h === 'https://eliasgrigori.github.io/EFC-Sabi--Quiz/', 'abrem numa aba nova, nos endereços certos');
  conf(apps.every(a => a.img > 0), 'o ícone de cada app aparece sem internet (embutido)');
  console.log('Aba vazia:');
  await vai(p, '#/documentos/impressos');
  conf(await p.evaluate(() => [...document.querySelectorAll('h1')].some(h => /Impressos/.test(h.textContent)) && S.rota.aba === 'impressos'), 'Documentos › Impressos abre');
  conf(/Nenhum impresso ainda/.test(await p.textContent('body')) && !!(await p.$('[data-act="ip-importar"]')), 'tela vazia com o convite e o botão Importar');
  console.log('Importar PDF:');
  await importa(p, F.ficha, { codigo: 'fic-01' });
  let d = (await docs(p)).find(x => x.nome === 'ficha cotacao lab a' || /ficha.cotacao/i.test(x.nome));
  conf(!!d && d.tipo === 'externo' && d.status === 'vigente' && d.codigo === 'FIC-01' && d.pastaNome === 'Fichas e custódias', 'PDF entra vigente, nome tirado do arquivo, código em maiúsculas, pasta Fichas e custódias');
  const pdfBuf = fs.readFileSync(F.ficha);
  conf(d && d.pub.bytes === pdfBuf.length && d.pub.sha256 === crypto.createHash('sha256').update(pdfBuf).digest('hex') && d.pub.paginas === 2 && d.pub.partes === 1 && d.pub.rev === 1, 'cópia com tamanho, SHA-256, 2 páginas e 1 pedaço');
  conf(d && EFD.ficha(d).length === 0, 'a ficha segue o Contrato EFD v1' + (d ? ' ' + EFD.ficha(d).join('; ') : ''));
  let ps = (await partes(p)).filter(x => x.docId === d.id);
  conf(ps.length === 1 && ps[0].id === d.id + '_c1_0' && Buffer.from(ps[0].b64, 'base64').equals(pdfBuf), 'o PDF foi para a nuvem em pedaço e volta igual');
  await p.evaluate(n => { S.ipDocs.forEach(x => {}); }, 0);
  const linha = await p.evaluate(() => [...document.querySelectorAll('.tb tbody tr, .tb [data-id]')].map(r => r.textContent).join(' | '));
  conf(/FIC-01/.test(linha) && /PDF/.test(linha) && /Joana Silva/.test(linha) && /Vigente/.test(linha), 'linha com código, formato, quem editou e situação');
  conf(/Fichas e custódias/.test(await p.textContent('.tb')), 'tabela separada pela pasta');
  console.log('Foto vira PDF:');
  await importa(p, F.foto, { nome: 'Rótulo da caixa (foto)', pasta: 'Etiquetas' });
  const foto = (await docs(p)).find(x => x.nome === 'Rótulo da caixa (foto)');
  conf(!!foto && foto.fonteFoto === true && foto.pub && foto.pub.paginas === 1 && foto.pastaNome === 'Etiquetas', 'a foto virou um PDF de 1 página na pasta Etiquetas');
  const fb = await p.evaluate(async id => { const d = S.ipDocs.find(x => x.id === id), b = new Uint8Array(await ipArquivo(d, 'copia')); return String.fromCharCode.apply(null, b.subarray(0, 5)) + '|' + (String.fromCharCode.apply(null, b.subarray(0, Math.min(b.length, 400))).indexOf('/DCTDecode') > 0); }, foto.id);
  conf(fb === '%PDF-|true', 'é um PDF de verdade com a foto em JPEG');
  console.log('Excel com e sem a cópia em PDF:');
  await importa(p, F.xlsx, { nome: 'Cadeia de custódia · Laboratório A', codigo: 'CUS-01' });
  let cus = (await docs(p)).find(x => x.codigo === 'CUS-01');
  conf(!!cus && cus.tipo === 'planilha' && cus.status === 'rascunho' && !cus.pub && cus.orig && cus.orig.formato === 'xlsx' && cus.orig.bytes === fs.statSync(F.xlsx).size, 'Excel sem PDF entra como rascunho, com o arquivo de reserva');
  conf(cus && EFD.ficha(cus).length === 0, 'a ficha do Excel segue o contrato');
  await abreDoc(p, 'Cadeia de custódia · Laboratório A');
  conf(await p.$eval('[data-act="ip-imprimir"]', e => e.disabled) && /Ainda sem cópia em PDF/.test(await p.textContent('#gv')), 'sem cópia em PDF: Imprimir desligado e o aviso de como resolver');
  conf(!!(await p.$('#gv [data-act="ip-no-vertice"]')) && !!(await p.$('#gv [data-act="ip-baixar"][data-q="orig"]')), 'tem Abrir no Vértice e Baixar o Excel');
  await p.click('[data-act="ip-editar"]'); await esp(p, 400);
  await p.setInputFiles('[data-ip-arq="pdf"]', F.xlsxPdf); await esp(p, 400); await p.click('[data-act="ip-ok"]'); await esp(p, 900);
  cus = (await docs(p)).find(x => x.codigo === 'CUS-01');
  conf(cus.status === 'vigente' && cus.pub && cus.pub.rev === 1 && cus.rev === 1 && cus.orig, 'anexou o PDF salvo pelo Excel: ficou vigente, mesma versão, com os dois arquivos');
  await fecha(p);
  const g2 = await p.evaluate(() => { const l = [...document.querySelectorAll('.tb .tb-gh, .tb [class*="grupo"], .tb tr.tb-g, .tb .tb-gr')].map(x => x.textContent.replace(/\d+/g, '').trim()); return l.join('|'); });
  conf(/Etiquetas/.test(g2) && /Fichas e custódias/.test(g2) && g2.indexOf('Etiquetas') < g2.indexOf('Fichas'), 'as pastas aparecem na ordem: Etiquetas, Fichas e custódias…');
  console.log('Excel com a cópia junto e pasta nova:');
  await importa(p, F.xlsx, { nome: 'Ficha de solicitação · Laboratório B', codigo: 'FIC-02', pdf: F.xlsxPdf, pastaNova: 'Laudos-modelo' });
  const fic2 = (await docs(p)).find(x => x.codigo === 'FIC-02');
  conf(fic2 && fic2.status === 'vigente' && fic2.pub && fic2.orig && fic2.pastaNome === 'Laudos-modelo', 'Excel + PDF de uma vez, numa pasta nova');
  console.log('Recusas:');
  await p.click('[data-act="ip-importar"]'); await esp(p, 300);
  await p.setInputFiles('[data-ip-arq="arq"]', F.grande); await esp(p, 500);
  conf(/limite é 3,2 MB/.test(await msg(p)), 'PDF acima de 3,2 MB é recusado com o motivo (' + (await msg(p)) + ')');
  await p.setInputFiles('[data-ip-arq="arq"]', F.velho); await esp(p, 300);
  conf(/Salvar como \.xlsx/.test(await msg(p)), 'Excel antigo (.xls) pede para salvar como .xlsx');
  await p.setInputFiles('[data-ip-arq="arq"]', F.falso); await esp(p, 300);
  conf(/não parece um PDF/.test(await msg(p)), 'arquivo que não é PDF de verdade é recusado');
  await p.click('[data-act="ip-ok"]'); await esp(p, 300);
  conf(/Escolha o arquivo|Escreva o nome/.test(await msg(p)), 'sem arquivo não importa');
  await p.evaluate(() => { S.fm.sujo = false; }); await fecha(p);
  console.log('Link:');
  await importa(p, null, { link: 'http://exemplo.invalid/manual', nome: 'Manual do equipamento' });
  conf(/https:\/\//.test(await msg(p)), 'link sem https é recusado');
  await p.fill('[data-fm="link"]', 'https://exemplo.invalid/manual.pdf'); await p.click('[data-act="ip-ok"]'); await esp(p, 700);
  const lk = (await docs(p)).find(x => x.tipo === 'link');
  conf(lk && lk.status === 'vigente' && !lk.pub && !lk.orig && EFD.ficha(lk).length === 0, 'link entra vigente, sem arquivo, e segue o contrato');
  await abreDoc(p, 'Manual do equipamento');
  conf(await p.$eval('#gv a.bt.pr', a => a.href + '|' + a.target) === 'https://exemplo.invalid/manual.pdf|_blank', 'o link abre numa aba nova');
  await fecha(p);
  console.log('Imprimir, ver e baixar:');
  await abreDoc(p, d.nome);
  await p.evaluate(() => { window._ab = []; window.open = (u, t) => { window._ab.push(u); return {}; }; });
  const leituras = await p.evaluate(async () => { let n = 0; const col = Data.col; Data.col = nm => { const c = col.call(Data, nm); if (nm !== 'efd_partes') return c; return Object.assign({}, c, { get: id => { n++; return c.get(id); } }); }; await ipImprimir(S._ipGv); await new Promise(r => setTimeout(r, 400)); Data.col = col; return n; });
  const imp = await p.evaluate(() => { const f = document.querySelector('#ip-imp'); return { iframe: !!(f && /^blob:/.test(f.src)), aberto: (window._ab || []).filter(u => /^blob:/.test(u)).length }; });
  conf(imp.iframe || imp.aberto === 1, 'Imprimir manda o PDF para a impressão (' + (imp.iframe ? 'janela de impressão' : 'leitor do aparelho') + ')');
  conf(leituras === 0, 'o PDF já estava guardado no aparelho: imprimir não leu nada da nuvem (' + leituras + ')');
  const aud = await p.evaluate(() => Data.col('sv2_audit').all().then(l => l.filter(x => x.acao === 'imprimir_impresso').length));
  conf(aud >= 1, 'a impressão fica registrada no histórico');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#gv [data-act="ip-baixar"][data-q="copia"]')]);
  const dlArq = path.join(TMP, 'baixado.pdf'); await dl.saveAs(dlArq);
  conf(dl.suggestedFilename() === 'FIC-01 ficha-cotacao-lab-a v1.pdf' && fs.readFileSync(dlArq).equals(pdfBuf), 'Baixar entrega o PDF igual, com código, nome e versão no nome (' + dl.suggestedFilename() + ')');
  console.log('Sem cópia no aparelho, sem internet:');
  const off = await p.evaluate(async id => { const d = S.ipDocs.find(x => x.id === id); await ipCache('readwrite', ipChave(d, 'copia')); delete S.ipAparelho[id]; const g = Data.col; Data.col = nm => { const c = g.call(Data, nm); if (nm !== 'efd_partes') return c; return Object.assign({}, c, { get: () => Promise.reject(new Error('sem internet')) }); }; let r = ''; try { await ipArquivo(d, 'copia'); r = 'leu'; } catch (e) { r = e.message; } Data.col = g; return r; }, d.id);
  conf(/sem internet|Faltam pedaços|Confira a internet/.test(off), 'sem internet e sem cópia guardada: avisa em vez de travar');
  const re = await p.evaluate(async id => { const d = S.ipDocs.find(x => x.id === id); const b = await ipArquivo(d, 'copia'); return [b.byteLength, await ipNoAparelho(d)]; }, d.id);
  conf(re[0] === pdfBuf.length && re[1] === true, 'com internet: baixa, confere e volta a guardar no aparelho');
  console.log('Pré-baixar ao abrir a aba:');
  await p.evaluate(async () => { for (const x of S.ipDocs) if (x.pub) await ipCache('readwrite', ipChave(x, 'copia')); S.ipAparelho = {}; });
  await fecha(p); await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await esp(p, 1800);
  const pre = await p.evaluate(async () => { const l = S.ipDocs.filter(ipImprime); let n = 0; for (const x of l) if (await ipNoAparelho(x)) n++; return [n, l.length]; });
  conf(pre[0] === pre[1] && pre[1] >= 3, 'ao abrir Impressos, o aparelho guarda todas as cópias vigentes (' + pre.join(' de ') + ')');
  console.log('Nova versão, obsoleto, lixeira:');
  await abreDoc(p, d.nome);
  await p.click('[data-act="ip-editar"]'); await esp(p, 300); await p.click('[data-act="ip-trocar"]'); await esp(p, 300);
  await p.setInputFiles('[data-ip-arq="arq"]', F.ficha2); await esp(p, 500); await p.click('[data-act="ip-ok"]'); await esp(p, 900);
  d = (await docs(p)).find(x => x.id === d.id);
  ps = (await partes(p)).filter(x => x.docId === d.id);
  conf(d.rev === 2 && d.pub.rev === 2 && d.pub.paginas === 1 && d.pub.orient === 'paisagem', 'versão 2 com 1 página deitada');
  conf(ps.find(x => x.id === d.id + '_c1_0').b64 === '' && ps.find(x => x.id === d.id + '_c2_0').b64.length > 100, 'a versão 1 deixou de ocupar espaço; a 2 está na nuvem');
  await fecha(p); await abreDoc(p, d.nome);
  await p.click('[data-act="ip-editar"]'); await esp(p, 300); await p.click('[data-dd="ip:sit"] .dd-b'); await p.click('[data-dd="ip:sit"] [data-v="obsoleto"]'); await esp(p, 200); await p.click('[data-act="ip-ok"]'); await esp(p, 700);
  d = (await docs(p)).find(x => x.id === d.id);
  conf(d.status === 'obsoleto' && EFD.ficha(d).length === 0, 'marcado como obsoleto');
  conf(await p.$eval('[data-act="ip-imprimir"]', e => e.disabled) && /não imprime mais/.test(await p.textContent('#gv')), 'obsoleto não imprime (sugestão 2)');
  const obs = await p.evaluate(async id => { window._ab = []; const n0 = document.querySelectorAll('#ip-imp').length; document.querySelector('#ip-imp') && document.querySelector('#ip-imp').remove(); await ipImprimir(id); return [!!document.querySelector('#ip-imp'), window._ab.length]; }, d.id);
  conf(!obs[0] && obs[1] === 0, 'nem chamando direto ele imprime');
  await fecha(p);
  conf(/Obsoletos/.test(await p.textContent('.tb')), 'obsoletos ficam num grupo separado no fim');
  await abreDoc(p, 'Rótulo da caixa (foto)');
  await p.click('#gv [data-act="ip-lixo"]'); await esp(p, 300); await p.click('[data-act="cf-sim"]'); await esp(p, 800);
  const lx = (await docs(p)).find(x => x.id === foto.id), lxp = (await partes(p)).filter(x => x.docId === foto.id);
  conf(lx.status === 'lixeira' && lxp.every(x => x.b64 === '') && !/Rótulo da caixa \(foto\)/.test(await p.textContent('.tb')), 'lixeira: some da lista e o arquivo deixa de ocupar espaço');
  console.log('Espaço e Reserva:');
  const mt = await p.evaluate(() => [...document.querySelectorAll('.cs-cab span, .cs-meta span')].map(x => x.textContent).join(' '));
  conf(/0,\d MB de 150 MB/.test(mt), 'o medidor mostra o espaço usado (' + (mt.match(/[\d,]+ MB de 150 MB/) || [''])[0] + ')');
  const cheio = await p.evaluate(() => { const r = S.ipDocs; S.ipDocs = r.concat([{ v: 1, id: 'dcheio0001', status: 'vigente', tipo: 'externo', nome: 'x', pub: { bytes: 118 * 1024 * 1024 } }]); render(); const t = document.body.textContent; S.ipDocs = r; render(); return /MB de 150 MB/.test(t) && !!document; });
  conf(cheio, 'acima de 80% o medidor fica em destaque');
  const negado = await p.evaluate(async () => { const r = S.ipDocs; S.ipDocs = r.concat([{ v: 1, id: 'dcheio0002', status: 'vigente', tipo: 'externo', nome: 'x', pub: { bytes: 113 * 1024 * 1024 } }]); lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: 'Teste', codigo: '', pasta: 'Etiquetas', arq: { buf: new ArrayBuffer(10), nome: 't.pdf', bytes: 2000000, fmt: 'pdf', paginas: 1, orient: 'retrato' }, pdf: null }); await ipOk(); const m = document.querySelector('#gv .fm-msg'); S.ipDocs = r; S.fm.sujo = false; return m ? m.textContent : ''; });
  conf(/passariam de 150 MB/.test(negado), 'não deixa passar do teto de 150 MB');
  await fecha(p);
  const [z] = await Promise.all([p.waitForEvent('download'), (async () => { await p.click('[data-act="ip-reserva"]'); await esp(p, 300); await p.click('[data-act="cf-sim"]'); })()]);
  const zArq = path.join(TMP, 'reserva.zip'); await z.saveAs(zArq);
  const zl = zipLista(zArq).split('\n'), ent = JSON.parse(zl[0]), csv = zl.slice(1).join('\n');
  conf(/^efcwork-impressos-reserva-\d{4}-\d{2}-\d{2}\.zip$/.test(z.suggestedFilename()), 'Reserva baixa um ZIP com a data (' + z.suggestedFilename() + ')');
  conf(ent[0][0] === 'LISTA.csv' && ent.some(e => /^Fichas e custódias\/CUS-01 .*\.pdf$/.test(e[0])) && ent.some(e => /^Fichas e custódias\/cadeia-custodia\.xlsx$/.test(e[0])) && ent.some(e => /^Obsoletos\/FIC-01 .*v2\.pdf$/.test(e[0])), 'dentro: a lista e os arquivos separados por pasta (PDF e Excel)');
  conf(!ent.some(e => /Rótulo da caixa/.test(e[0])), 'o que foi para a lixeira não vai na reserva');
  conf(/Manual do equipamento/.test(csv) && /https:\/\/exemplo\.invalid\/manual\.pdf/.test(csv) && /Joana Silva/.test(csv), 'a lista traz o link, quem editou e a data');
  console.log('Contrato em tudo o que foi gravado:');
  const todos = (await docs(p)).filter(x => x.status !== 'lixeira');
  const errs = todos.map(x => EFD.ficha(JSON.parse(JSON.stringify(Object.assign({}, x, { srv: undefined }))))).filter(e => e.length);
  conf(todos.length === 4 && !errs.length, 'as 4 fichas seguem o Contrato EFD v1 (' + todos.length + ' ' + JSON.stringify(errs) + ')');
  conf(p._er.length === 0, 'sem erros no console (PC)' + (p._er.length ? ': ' + p._er.slice(0, 2).join(' | ') : ''));
  console.log('Colaborador:');
  await p.evaluate(async () => { const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id], atrib: {} }); });
  await p.click('[data-act="cs-sair"]'); await esp(p, 300); await p.fill('#en-login', 'ana.lima'); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await esp(p, 800);
  conf((await p.$$('.cs-app-l')).length === 0, 'Colaborador não vê os Apps da família');
  await vai(p, '#/documentos/impressos');
  const col = await p.evaluate(() => ({ imp: !!document.querySelector('[data-act="ip-importar"]'), res: !!document.querySelector('[data-act="ip-reserva"]'), n: S.ipDocs.filter(x => x.status !== 'lixeira').length }));
  conf(!col.imp && col.res && col.n === 4, 'Colaborador vê e imprime, mas não importa ' + JSON.stringify(col));
  await p.evaluate(() => { const d = S.ipDocs.find(x => x.codigo === 'CUS-01'); ipAbre(d.id); }); await esp(p, 500);
  conf(!(await p.$('#gv [data-act="ip-editar"]')) && !(await p.$('#gv [data-act="ip-lixo"]')) && !!(await p.$('#gv [data-act="ip-baixar"][data-q="orig"]')) && !(await p.$eval('[data-act="ip-imprimir"]', e => e.disabled)), 'na gaveta: sem lápis e sem lixeira, mas imprime');
  await p.context().close();
  console.log('Celular (390):');
  const m = await abre(b, 390, 800);
  await m.evaluate(async () => { const pdf = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'; const buf = new TextEncoder().encode(pdf).buffer; lcAbrir({ k: 'ipEd', id: '', modo: 'arq', nome: 'Controle de cloro', codigo: 'FOR-12', pasta: 'Formulários', arq: { buf: buf, nome: 'cloro.pdf', bytes: buf.byteLength, fmt: 'pdf', paginas: 1, orient: 'retrato' }, pdf: null }); await ipOk(); });
  await vai(m, '#/documentos/impressos'); await esp(m, 500);
  const mc = await m.evaluate(() => ({ lado: document.documentElement.scrollWidth > innerWidth, bts: [...document.querySelectorAll('.cs-cab .bt, .cs-acts .bt')].filter(e => e.offsetWidth).map(e => Math.round(e.getBoundingClientRect().height)) }));
  conf(!mc.lado && mc.bts.length && mc.bts.every(h => h >= 44), 'Impressos sem rolagem lateral e botões com 44 px (' + mc.bts.join(', ') + ')');
  await m.evaluate(() => ipAbre(S.ipDocs[0].id)); await esp(m, 600);
  const mg = await m.evaluate(() => ({ ver: !!document.querySelector('#gv [data-act="ip-ver"]'), prev: !!document.querySelector('#gv [data-ip-prev]'), pe: [...document.querySelectorAll('#gv .gv-pe .bt')].map(e => Math.round(e.getBoundingClientRect().top) + ':' + Math.round(e.getBoundingClientRect().height)), lado: document.documentElement.scrollWidth > innerWidth }));
  conf(mg.ver && !mg.prev, 'no celular: "Ver o PDF" no lugar da prévia');
  conf(new Set(mg.pe.map(x => x.split(':')[0])).size === 1 && mg.pe.every(x => Number(x.split(':')[1]) >= 44) && !mg.lado, 'rodapé da gaveta numa linha só, 44 px (' + mg.pe.join(', ') + ')');
  await fecha(m); await m.click('[data-act="cs-menu"]'); await esp(m, 400);
  conf((await m.$$('.cs-app-l')).length === 2, 'no celular os apps ficam no mesmo menu');
  conf(m._er.length === 0, 'sem erros no console (celular)' + (m._er.length ? ': ' + m._er.slice(0, 2).join(' | ') : ''));
  await b.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
