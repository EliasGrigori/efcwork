/* EFCwork v0.6.47 + Vértice v0.6.82 · documentos só no Vértice, 1ª parte (decisão do Elias de 27/11 06:59; respostas de 21:2x).
   - O Vértice guarda PDF (tipo 'pdf', página Documentos externos); importar no Vértice ou no Cwork, foto de papel vira PDF.
   - Documentos › Impressos do Cwork mostra os documentos do Vértice (PDF: ver, imprimir, baixar, trocar; planilha: abre no Vértice).
   - Os antigos (guardados no Cwork) continuam, marcados "Cwork".
   Sobe o EFCwork em /efcwork/ e o Vértice DE VERDADE em /efcwork/vertice/ (VERTICE_DIR = a pasta montada). Modo demonstração.
   PDFs de TESTE gerados aqui, com a marca "MODELO NAO OFICIAL - SO PARA TESTE" (nenhum documento do Elias).
   Uso: NODE_PATH=$(npm root -g) VERTICE_DIR=../vertice/fonte/dist node tools/testes/t_v0647.js  (EFC_FOTOS=<pasta> guarda as fotos) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), http = require('http'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..', '..'), VD = process.env.VERTICE_DIR || path.resolve(RAIZ, '..', 'vertice'), DIST = process.env.EFC_DIST || path.join(RAIZ, 'dist');
const FOTOS = process.env.EFC_FOTOS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  let f = u.startsWith('/efcwork/vertice/') ? path.join(VD, u.slice(17)) : u.startsWith('/efcwork/') ? path.join(DIST, u.slice(9)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end('nada'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let ok = 0, falhas = 0; const conf = (c, m) => { if (c) { ok++; console.log('  ok  ' + m); } else { falhas++; console.log('  FALHA  ' + m); } };
const esp = (p, ms) => p.waitForTimeout(ms || 350);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'efc0647-'));
function pdf(txt, deitado) {
  const W = deitado ? 842 : 595, H = deitado ? 595 : 842, s = 'BT /F1 22 Tf 50 ' + (H - 80) + ' Td (' + txt + ') Tj ET BT /F1 30 Tf 60 ' + (H / 2) + ' Td (MODELO NAO OFICIAL - SO PARA TESTE) Tj ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Contents 5 0 R /Resources << /Font << /F1 3 0 R >> >> >>', '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream'];
  let o = '%PDF-1.4\n'; const pos = []; objs.forEach((x, k) => { pos.push(o.length); o += (k + 1) + ' 0 obj\n' + x + '\nendobj\n'; });
  const xr = o.length; o += 'xref\n0 6\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF\n';
  return Buffer.from(o, 'latin1');
}
const grava = (nome, buf) => { const f = path.join(TMP, nome); fs.writeFileSync(f, buf); return f; };
const F = { a: grava('teste-formulario.pdf', pdf('PDF DE TESTE A')), b: grava('teste-formulario-v2.pdf', pdf('PDF DE TESTE A v2', true)), c: grava('teste-pop.pdf', pdf('PDF DE TESTE C')),
  foto: path.join(RAIZ, 'src', 'estaticos', 'icon-512.png'), xlsx: grava('teste.xlsx', Buffer.concat([Buffer.from('PK\x03\x04', 'latin1'), crypto.randomBytes(2000)])) };
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
async function abre(b, w, h) {
  const cel = w < 600, ctx = await b.newContext({ viewport: { width: w, height: h || 860 }, hasTouch: cel, isMobile: cel, timezoneId: 'America/Fortaleza', serviceWorkers: 'block', acceptDownloads: true });
  const p = await ctx.newPage(); p._er = [];
  p.on('pageerror', e => p._er.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/gstatic|fonts|net::ERR|Failed to load resource|favicon/.test(m.text())) p._er.push(m.text()); });
  await p.route(/gstatic|fonts\.g/, r => r.abort());
  await p.goto(base + '/efcwork/?demo=1'); await esp(p, 500);
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await esp(p, 800);
  return p;
}
let base = '';
const N = (p, fn, ...a) => p.evaluate(fn, ...a);
const vai = async (p, h) => { await N(p, x => { location.hash = x; }, h); await esp(p, 500); };
const vertFr = p => p.frames().filter(f => /\/efcwork\/vertice\//.test(f.url()) && f !== p.mainFrame()).pop();
const foto = async (p, nome) => { if (FOTOS) { fs.mkdirSync(FOTOS, { recursive: true }); await p.screenshot({ path: path.join(FOTOS, nome + '.png') }); } };
async function importa(p, arq, nome, pasta) {
  await p.click('[data-act="ip-importar"]'); await esp(p, 300);
  await p.setInputFiles('[data-ip-arq="arq"]', arq); await esp(p, 500);
  if (nome) await p.fill('[data-fm="nome"]', nome);
  if (pasta) { await p.click('[data-dd="ip:pasta"] .dd-b'); await p.click('[data-dd="ip:pasta"] [data-v="' + pasta + '"]'); await esp(p, 200); }
}
const vtd = p => N(p, async () => ({ a: await Data.col('vtd_arquivos').all(), ps: await Data.col('vtd_partes').all(), efd: await Data.col('efd_docs').all() }));
const linhas = p => N(p, () => [...document.querySelectorAll('tr[data-act="tb-lin"]')].map(t => ({ id: t.getAttribute('data-id'), tx: t.textContent })));
(async () => {
  await new Promise(r => srv.listen(0, r)); base = 'http://localhost:' + srv.address().port;
  const b = await chromium.launch();
  let p = await abre(b, 1280);

  console.log('— Importar um PDF no Cwork: vai para o Vértice');
  await vai(p, '#/documentos/impressos');
  await p.click('[data-act="ip-importar"]'); await esp(p, 300);
  const txtForm = await p.textContent('#gv');
  await p.keyboard.press('Escape'); await esp(p, 400);
  await importa(p, F.a, 'Formulário de teste', 'Formulários');
  conf(/vai para o Vértice Docs/.test(txtForm), 'o formulário diz que o PDF vai para o Vértice');
  const pastasForm = await N(p, () => [...document.querySelectorAll('[data-dd="ip:pasta"] [data-v]')].map(x => x.getAttribute('data-v')));
  conf(pastasForm.length === 5 && pastasForm.indexOf('__outra') < 0, 'só as 5 pastas do Vértice (sem "Outra pasta")');
  await p.click('[data-act="ip-ok"]'); await esp(p, 1200);
  let d = await vtd(p);
  const a1 = d.a.find(x => x.ficha && x.ficha.nome === 'Formulário de teste');
  conf(a1 && a1.ficha.tipo === 'pdf' && a1.pasta === 'Formulários' && a1.versao === 1 && a1.ficha.pastaNome === 'Formulários', 'gravado no Vértice: tipo pdf, pasta Formulários, versão 1');
  conf(!d.efd.length, 'nada novo guardado no Cwork (efd_docs vazio)');
  const camposFora = a1 ? Object.keys(a1).filter(k => ['id', 'v', 'ficha', 'versao', 'versaoPartes', 'pasta', 'partes', 'partesDe', 'bytes', 'porId', 'porNome', 'em', 'srv', 'testeConta'].indexOf(k) < 0) : ['?'];
  conf(!camposFora.length, 'a ficha só tem os campos que as regras [R7a] aceitam (o Firebase não muda)');
  const pac = a1 ? JSON.parse(d.ps.filter(x => x.arq === a1.id).sort((x, y) => x.n - y.n).map(x => x.b64).join('')) : null;
  const cont = pac && pac.fmt === 'json' ? JSON.parse(pac.dados) : null;
  conf(cont && cont.sha256 === sha(fs.readFileSync(F.a)) && cont.paginas === 1 && cont.origem === 'pdf', 'o PDF inteiro está no Vértice (SHA-256 igual ao arquivo)');
  let ls = await linhas(p);
  const l1 = ls.find(x => x.id === 'vt:' + (a1 && a1.id));
  conf(l1 && /Vértice/.test(l1.tx) && /PDF/.test(l1.tx) && /Vigente/.test(l1.tx) && !/Sem cópia/.test(l1.tx), 'a linha aparece nos Impressos com Formato PDF, Guardado Vértice e Situação Vigente');
  await foto(p, 'proposta-lista');

  console.log('— Abrir, baixar e imprimir o PDF do Vértice');
  await p.click('tr[data-id="vt:' + a1.id + '"]'); await esp(p, 700);
  const gv = await p.textContent('#gv');
  conf(/Formulário de teste/.test(gv) && /No Vértice \(nuvem\)/.test(gv) && !!(await p.$('#gv [data-act="iv-imprimir"]')), 'a gaveta mostra o documento do Vértice com Imprimir');
  conf(!!(await p.$('#gv [data-act="iv-trocar"]')) && !!(await p.$('#gv [data-act="iv-vertice"]')), 'quem salva tem "Trocar pela versão nova" e "Abrir no Vértice"');
  await foto(p, 'proposta-gaveta');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#gv [data-act="iv-baixar"]')]);
  const baixado = fs.readFileSync(await dl.path());
  conf(sha(baixado) === sha(fs.readFileSync(F.a)) && /Formulario de teste v1\.pdf$/.test(dl.suggestedFilename()), 'Baixar o PDF entrega o mesmo arquivo (' + dl.suggestedFilename() + ', ' + baixado.length + ' de ' + fs.readFileSync(F.a).length + ' bytes)');
  await N(p, () => { window._imp = 0; const o = HTMLIFrameElement.prototype; });
  await p.click('#gv [data-act="iv-imprimir"]'); await esp(p, 900);
  const imp = await N(p, async () => ({ fr: !!document.querySelector('#ip-imp') || !!(S._ipImp && /^vt:/.test(S._ipImp.id)), log: (await Data.col('sv2_audit').all()).some(x => x.acao === 'imprimir_impresso' && /Vértice, versão 1/.test(x.resumo)) }));
  conf(imp.log, 'imprimir fica na Atividade ("Vértice, versão 1")');

  console.log('— Trocar pela versão nova (pelo Cwork)');
  await p.click('#gv [data-act="iv-trocar"]'); await esp(p, 400);
  await p.setInputFiles('[data-ip-arq="arq"]', F.b); await esp(p, 500);
  await p.click('[data-act="iv-troca-ok"]'); await esp(p, 1200);
  d = await vtd(p);
  const a2 = d.a.find(x => x.id === a1.id);
  conf(a2 && a2.versao === 2 && a2.ficha.rev === 1, 'versão 2 no Vértice, mesmo documento');
  const cont2 = JSON.parse(JSON.parse(d.ps.filter(x => x.arq === a1.id && x.versao === 2).sort((x, y) => x.n - y.n).map(x => x.b64).join('')).dados);
  conf(cont2.orient === 'paisagem' && cont2.sha256 === sha(fs.readFileSync(F.b)), 'o PDF novo (deitado) entrou inteiro');
  conf(d.ps.filter(x => x.arq === a1.id && x.versao === 1).length >= 1, 'os pedaços da versão 1 continuam (nada se apaga)');

  console.log('— Foto de um papel vira PDF; Excel e Word entram pelo Vértice; link continua no Cwork');
  if (await p.$('#gv')) { await p.keyboard.press('Escape'); await esp(p, 400); await p.keyboard.press('Escape'); await esp(p, 400); }
  await importa(p, F.foto, 'Foto de teste', 'POPs e procedimentos');
  await p.click('[data-act="ip-ok"]'); await esp(p, 1500);
  d = await vtd(p);
  const af = d.a.find(x => x.ficha && x.ficha.nome === 'Foto de teste');
  const cf = af ? JSON.parse(JSON.parse(d.ps.filter(x => x.arq === af.id).sort((x, y) => x.n - y.n).map(x => x.b64).join('')).dados) : null;
  conf(af && cf && cf.origem === 'foto' && Buffer.from(cf.pdf, 'base64').slice(0, 5).toString() === '%PDF-', 'a foto entrou no Vértice como PDF (origem foto)');
  await importa(p, F.xlsx, 'Planilha de teste', 'Formulários');
  await p.click('[data-act="ip-ok"]'); await esp(p, 600);
  conf(/Excel e Word entram pelo Vértice/.test(await p.textContent('#gv')), 'Excel não entra pelo Cwork: o aviso manda para o Vértice');
  await p.keyboard.press('Escape'); await esp(p, 300); if (await p.$('.cs-cf, .cf')) { await p.keyboard.press('Enter'); await esp(p, 300); }
  await N(p, () => { if (S.fm) { S.fm.sujo = false; } if (typeof gvFechar === 'function') gvFechar(true); });  await esp(p, 400);
  await p.click('[data-act="ip-importar"]'); await esp(p, 300);
  await p.click('[data-dd="ip:modo"] .dd-b'); await p.click('[data-dd="ip:modo"] [data-v="link"]'); await esp(p, 200);
  await p.fill('[data-fm="link"]', 'https://exemplo.com/teste'); await p.fill('[data-fm="nome"]', 'Link de teste');
  await p.click('[data-act="ip-ok"]'); await esp(p, 900);
  d = await vtd(p);
  conf(d.efd.length === 1 && d.efd[0].tipo === 'link', 'o link continua guardado no Cwork (não é arquivo)');
  await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos');
  ls = await linhas(p);
  const lk = ls.find(x => /Link de teste/.test(x.tx));
  conf(lk && /Cwork/.test(lk.tx), 'na tabela, o antigo diz Guardado Cwork');

  console.log('— Planilha do Vértice nos Impressos abre em modo documento');
  const pl = { fmt: 'json', dados: JSON.stringify({ abas: {} }), bytesOriginal: 10, bytesFinal: 10 };
  await N(p, a => window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'dplteste01', nome: 'Planilha de teste no Vértice', tipo: 'planilha', status: 'rascunho', pastaNome: 'Fichas e custódias' }, pacote: a }, 0), pl);
  await N(p, () => ivLer(true)); await esp(p, 700);
  ls = await linhas(p);
  const lp = ls.find(x => x.id === 'vt:dplteste01');
  conf(lp && /Planilha/.test(lp.tx), 'a planilha do Vértice aparece com Formato Planilha');
  await p.click('tr[data-id="vt:dplteste01"]'); await esp(p, 600);
  conf(!!(await p.$('#gv [data-act="iv-documento"]')) && !(await p.$('#gv [data-act="iv-imprimir"]')), 'a gaveta da planilha tem "Abrir" (sem Imprimir direto)');
  await p.click('#gv [data-act="iv-documento"]'); await esp(p, 2500);
  const fr = vertFr(p);
  conf(fr && /#\/documento\/dplteste01/.test(fr.url()), 'Abrir leva ao Vértice em #/documento/<id> (' + (fr ? fr.url().replace(/^.*#/, '#') : 'sem quadro') + ')');
  await N(p, () => { if (typeof jnFrente === 'function') jnFrente('efcwork'); else location.hash = '#/documentos/impressos'; }); await esp(p, 600);

  console.log('— O Vértice de verdade: Documentos externos');
  await N(p, () => { if (typeof jnAbrir === 'function') jnAbrir('docs', '#/externos'); }); await esp(p, 5000);
  let v = vertFr(p);
  let tx = v ? await v.textContent('body') : '';
  conf(/Documentos externos/.test(tx) && /Formulário de teste/.test(tx), 'o PDF importado pelo Cwork aparece no Vértice, em Documentos externos');
  if (v) { const ab = await v.$('[data-ext-sub="Formulários"]'); if (ab) await ab.click(); await esp(p, 300); }
  if (FOTOS && v) await foto(p, 'vertice-externos');
  const menuEm = v ? await v.evaluate(() => /em breve/.test((([...document.querySelectorAll('a,button')].find(x => /Documentos externos/.test(x.textContent)) || {}).textContent) || '')) : true;
  conf(!menuEm, 'no menu do Vértice, Documentos externos não diz mais "em breve"');
  if (v) { await v.click('[data-ext-ver="' + a1.id + '"]'); await esp(p, 1200); }
  const ver = v ? await v.evaluate(() => { const q = document.querySelector('[data-ext-quadro]'), leitor = navigator.pdfViewerEnabled !== false; return { leitor, ok: leitor ? !!q && /^blob:/.test(q.src) : !!document.querySelector('[data-ext-abrir]'), imp: !!document.querySelector('[data-ext-imprimir]'), trocar: !!document.querySelector('[data-ext-trocar]') }; }) : {};
  conf(ver.ok && ver.imp && ver.trocar, 'no Vértice o PDF abre (' + (ver.leitor ? 'na tela' : 'navegador sem leitor de PDF: botão "Abrir o PDF"') + '), com Imprimir, Baixar e Trocar pela versão nova');
  if (FOTOS && v) await foto(p, 'vertice-ver');
  if (v) { await v.press('body', 'Escape'); await esp(p, 400); }
  const internos = v ? await v.evaluate(async () => { location.hash = '#/internos'; await new Promise(r => setTimeout(r, 600)); return document.body.textContent; }) : '';
  conf(!/Formulário de teste/.test(internos), 'o PDF não aparece em Documentos internos (fica em Documentos externos)');

  console.log('— Importar no Vértice: aparece no Cwork');
  if (v) {
    await v.evaluate(() => { location.hash = '#/externos'; }); await esp(p, 600);
    await v.click('[data-ext-importar]'); await esp(p, 300);
    await v.setInputFiles('[data-ext-arq]', F.c); await esp(p, 400);
    await v.fill('[data-ext-nome]', 'POP de teste do Vértice');
    await v.selectOption('[data-ext-pasta]', 'POPs e procedimentos');
    await v.click('[data-ext-ok]'); await esp(p, 4000);
  }
  d = await vtd(p);
  const ac = d.a.find(x => x.ficha && x.ficha.nome === 'POP de teste do Vértice');
  conf(ac && ac.ficha.tipo === 'pdf' && ac.pasta === 'POPs e procedimentos', 'o PDF importado no Vértice subiu para a nuvem (pasta POPs e procedimentos)');
  await N(p, () => { if (typeof jnFrente === 'function') jnFrente('efcwork'); }); await esp(p, 400);
  await vai(p, '#/inicio'); await N(p, () => ivLer(true)); await vai(p, '#/documentos/impressos'); await esp(p, 700);
  ls = await linhas(p);
  conf(ac && ls.some(x => x.id === 'vt:' + ac.id), 'e aparece nos Impressos do Cwork');

  console.log('— Colaborador: só as pastas liberadas, sem trocar');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'secundario', estrela: false }); });
  await N(p, async () => { const ps = IP_PASTAS.map(nome => ({ nome: nome, todos: false, leitores: nome === 'Formulários' ? [S.user.id] : [] })); const ac = {}; ps.forEach(x => { ac[x.nome] = { todos: x.todos, leitores: x.leitores }; }); await Data.col('sv2_cfg').set('vertice_pastas', { pastas: ps, acesso: ac }); });
  await esp(p, 700); await N(p, () => ivLer(true)); await esp(p, 800);
  ls = await linhas(p);
  const soForm = ls.filter(x => /^vt:/.test(x.id));
  conf(soForm.length === 1 && soForm[0].id === 'vt:' + a1.id, 'Colaborador vê só o PDF da pasta liberada (Formulários)');
  await p.click('tr[data-id="vt:' + a1.id + '"]'); await esp(p, 700);
  conf(!!(await p.$('#gv [data-act="iv-imprimir"]')) && !(await p.$('#gv [data-act="iv-trocar"]')) && !(await p.$('#gv [data-act="iv-vertice"]')), 'Colaborador imprime e baixa, mas não troca nem abre o Vértice inteiro');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'principal' }); });
  conf(!p._er.length, 'sem erro de JavaScript no PC' + (p._er.length ? ': ' + p._er.slice(0, 3).join(' | ') : ''));

  console.log('— Trava (pedido do Elias, 27/11 22:46): papel antigo que veio do Vértice não confere a versão deste aparelho');
  const ped = await N(p, async () => {
    await Data.col('sv2_coletas').set('ctrava1', { data: addDias(hojeISO(), -2), situacao: 'ativa', criadoEm: nowISO(), enviado: true, envio: addDias(hojeISO(), -1), coletor: 'Teste', tipo: 'SOLO', talhao: 'T01A', analiseNome: 'Solo completo', lab: 'Laboratório A' });
    await new Promise(r => setTimeout(r, 400));
    const c = (S.coletas || []).find(x => x.id === 'ctrava1') || null; if (!c) return { semDado: true };
    const k = c.envio + '|' + c.lab, out = [];
    const por0 = EFDPonte.por, jn0 = window.jnAbrir;
    EFDPonte.por = async m => { out.push(m); return 'p' + String(out.length).padStart(9, '0'); }; window.jnAbrir = () => {};
    try {
      const mk = o => ({ id: 'dtrava' + o, nome: 'Ficha de teste', codigo: '', rev: 10, status: 'vigente', tipo: 'planilha', origem: o, pub: { rev: 10, campos: [{ chave: 'envio.data' }] }, orig: { formato: 'xlsx' } });
      await drPedido(k, { id: 'kx', nome: 'Ficha de teste', copias: 'uma', d: mk('docs') }, { amostras: 1, caixas: 1 });
      await drPedido(k, { id: 'ky', nome: 'Ficha de teste', copias: 'uma', d: mk('efcwork') }, { amostras: 1, caixas: 1 });
    } finally { EFDPonte.por = por0; window.jnAbrir = jn0; }
    return { docs: out[0] || null, cw: out[1] || null };
  });
  conf(!ped.semDado && (ped.docs && !('rev' in ped.docs) && ped.docs.soMarcados === true), 'papel que veio do Vértice (Compartilhar com o Cwork) vai sem a versão: o Vértice usa a versão atual dele' + (ped.semDado ? ' (sem remessa na demonstração)' : ''));
  conf(!ped.semDado && (ped.cw && ped.cw.rev === 10 && !ped.cw.soMarcados), 'papel importado aqui (Excel do Cwork) continua conferindo a versão, como antes');

  console.log('— Correções do revisor');
  await N(p, async () => { await Data.col('sv2_users').update(S.user.id, { perfil: 'principal' }); }); await esp(p, 500);
  await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await N(p, () => ivLer(true)); await esp(p, 900);
  const laco = await N(p, async () => {
    const orig = window.vtNuvemListar; let n = 0; window.vtNuvemListar = async () => { n++; throw new Error('sem internet'); };
    S.ivDocs = []; S._ivDoAparelho = false; await ivLer(true); render(); await new Promise(r => setTimeout(r, 3000));
    const linhas = [...document.querySelectorAll('tr[data-act="tb-lin"]')].filter(t => /^vt:/.test(t.getAttribute('data-id'))).length;
    const aviso = /Vértice: mostrando a última lista guardada/.test(document.querySelector('main, #app, body').textContent);
    window.vtNuvemListar = orig; S._ivLido = 0; return { n, linhas, aviso };
  });
  conf(laco.n <= 2, 'lista do Vértice que falha não vira leitura sem fim (' + laco.n + ' tentativas em 3 s)');
  conf(laco.linhas >= 1 && laco.aviso, 'sem internet, os PDFs continuam na tabela pela última lista guardada, com o aviso no cabeçalho');
  const dup = await N(p, async () => { const a = { buf: new Uint8Array([37, 80, 68, 70, 45]).buffer, nome: 'x.pdf', fmt: 'pdf', paginas: 1 }; const r = await Promise.allSettled([ivNovo(a, 'Duplo de teste', '', 'Formulários'), ivNovo(a, 'Duplo de teste', '', 'Formulários')]);
    return { st: r.map(x => x.status), msg: r.filter(x => x.status === 'rejected').map(x => x.reason.message), n: (await Data.col('vtd_arquivos').all()).filter(x => x.ficha && x.ficha.nome === 'Duplo de teste').length }; });
  conf(dup.n === 1 && /Ainda enviando/.test(dup.msg.join()), 'clique duplo em Importar cria um documento só (' + dup.n + ')');
  await N(p, async () => { await Data.col('efd_docs').set(S.ivDocs[0].id, { v: 1, id: S.ivDocs[0].id, tipo: 'planilha', origem: 'docs', nome: 'Cópia antiga de teste', pastaNome: S.ivDocs[0].pasta, status: 'vigente', rev: 1 }); });
  await esp(p, 500); await vai(p, '#/inicio'); await vai(p, '#/documentos/impressos'); await esp(p, 500);
  const repet = await N(p, id => [...document.querySelectorAll('tr[data-act="tb-lin"]')].filter(t => t.getAttribute('data-id') === id || t.getAttribute('data-id') === 'vt:' + id).length, await N(p, () => S.ivDocs[0].id));
  conf(repet === 1, 'documento com o mesmo id aqui e no Vértice aparece uma vez só');
  const mist = await N(p, async id => {
    const orig = Data.col.bind(Data), dc = Data.col;
    Data.col = n => { const c = orig(n); if (n !== 'vtd_partes') return c; return Object.assign(Object.create(Object.getPrototypeOf(c)), c, { set: async (pid, v) => { if (await c.get(pid)) { const e = new Error('Missing or insufficient permissions.'); e.code = 'permission-denied'; throw e; } return c.set(pid, v); }, get: pid => c.get(pid) }); };
    try {
      const d = await Data.col('vtd_arquivos').get(id), cur = d.versao;
      await orig('vtd_partes').set(id + '_' + (cur + 1) + '_' + S.user.id + '_0', { arq: id, versao: cur + 1, n: 0, b64: 'RESTO DE OUTRA TENTATIVA', porId: S.user.id, em: nowISO() });
      const pdf = new TextEncoder().encode('%PDF-1.4 teste de pedacos'), v = await ivTrocar(id, { buf: pdf.buffer, nome: 't.pdf', fmt: 'pdf', paginas: 1 });
      const lido = await vtNuvemLer(id), c = JSON.parse(lido.pacote.dados);
      return { cur, v, ok: atob(c.pdf).indexOf('teste de pedacos') > 0 };
    } finally { Data.col = dc; }
  }, a1.id);
  conf(mist.v === mist.cur + 2 && mist.ok, 'pedaço de outra tentativa: a versão é pulada e a nova sai inteira (' + mist.cur + ' → ' + mist.v + ')');

  console.log('— Celular 390');
  const pc = await abre(b, 390, 844);
  await N(pc, a => window.CworkPonteVertice.nuvem.gravar({ ficha: { id: 'dpdfcel01', nome: 'PDF de teste no celular', tipo: 'pdf', status: 'rascunho', pastaNome: 'Formulários' }, pacote: a }, 0), { fmt: 'json', dados: JSON.stringify({ pdf: fs.readFileSync(F.a).toString('base64'), bytes: fs.readFileSync(F.a).length, sha256: sha(fs.readFileSync(F.a)), paginas: 1, orient: 'retrato', origem: 'pdf' }), bytesOriginal: 1, bytesFinal: 1 });
  await vai(pc, '#/documentos/impressos'); await N(pc, () => ivLer(true)); await esp(pc, 800);
  const larg = await N(pc, () => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  conf(larg.sw <= larg.iw, 'celular: nada rola para o lado (' + larg.sw + ' de ' + larg.iw + ')');
  await foto(pc, 'proposta-celular-lista');
  await pc.click('tr[data-id="vt:dpdfcel01"]'); await esp(pc, 700);
  const bt = await N(pc, () => { const x = document.querySelector('#gv [data-act="iv-imprimir"]'); return x ? x.getBoundingClientRect().height : 0; });
  conf(bt >= 44 && !!(await pc.$('#gv [data-act="iv-ver"]')), 'celular: "Ver o PDF" e Imprimir com 44 px (' + bt + ')');
  await foto(pc, 'proposta-celular-gaveta');
  await N(pc, () => jnAbrir('docs', '#/externos')); await esp(pc, 5000);
  const vc = vertFr(pc);
  if (vc) { const ab = await vc.$('[data-ext-sub="Formulários"]'); if (ab) await ab.click(); await esp(pc, 300); await vc.click('[data-ext-ver="dpdfcel01"]'); await esp(pc, 1200); }
  const cel = vc ? await vc.evaluate(() => ({ abrir: !!document.querySelector('[data-ext-abrir]'), quadro: !!document.querySelector('[data-ext-quadro]') })) : {};
  conf(cel.abrir && !cel.quadro, 'celular, no Vértice: "Abrir o PDF" no lugar do quadro (que sai em branco no Android)');
  await foto(pc, 'proposta-celular-vertice-ver');
  conf(!pc._er.length, 'sem erro de JavaScript no celular' + (pc._er.length ? ': ' + pc._er.slice(0, 3).join(' | ') : ''));

  await b.close(); srv.close();
  console.log('\n' + ok + ' ok, ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
