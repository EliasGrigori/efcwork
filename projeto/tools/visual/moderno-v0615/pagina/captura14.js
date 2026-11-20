/* Página v0.6.22 · janela do Vértice com abas + Ponte 1, travessões e Marcar no relato. HOJE = v0.6.21 publicada (dist/index-antes.html),
   PROPOSTA = dist de agora. Servidor no mesmo endereço com o Vértice de verdade em /EFCdocs/ (clone só de leitura).
   Uso: NODE_PATH=$(npm root -g) node captura14.js */
const http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const { chromium, abre, ir, PNGF } = require('./lib');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), VD = process.env.VERTICE_DIR || '/home/claude/eliasgrigori/efcdocs';
const OUT = path.join(__dirname, 'out', 'img14'); fs.mkdirSync(OUT, { recursive: true });
const ex = require(path.join(RAIZ, 'tools/contrato/exemplos-efd-v1.json'));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let f = u.startsWith('/efcwork/') ? path.join(RAIZ, 'dist', u.slice(9)) : u.startsWith('/antes/') ? path.join(RAIZ, 'dist', u.slice(7) === '' ? 'index-antes.html' : u.slice(7)) : u.startsWith('/EFCdocs/') ? path.join(VD, u.slice(9)) : u.startsWith('/contrato/') ? path.join(RAIZ, 'tools/contrato', u.slice(10)) : '';
  if (f && (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory()))) f = path.join(f, 'index.html');
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg });
  const o = await s.webp({ quality: 88 }).toBuffer(); fs.writeFileSync(path.join(OUT, nome + '.webp'), o); const mm = await sharp(o).metadata(); IMG[nome] = { w: mm.width, h: mm.height }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const vert = p => p.waitForFunction(() => { const f = document.querySelector('.jn-fr iframe[data-j="docs"]'); try { const d = f.contentDocument; return d.readyState === 'complete' && !d.querySelector('#abertura:not(.sai)') && d.body.children.length > 1; } catch (e) { return false; } }, null, { timeout: 20000 }).catch(() => {});
const sec = (p, s) => p.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: r.width + 12, height: r.height + 12 }; }, s);
const b64 = `s => { const t = atob(s), a = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a.buffer; }`;

(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch();
  const f1 = ex.validos.fichas[1], partes = ex.validos.copias[f1.id], xlsx = fs.readFileSync(path.join(RAIZ, 'tools/testes/vertice/ficha-teste.xlsx')).toString('base64');
  for (const [suf, url] of [['hoje', base + '/antes/'], ['prop', base + '/efcwork/']]) {
    const novo = suf === 'prop', W = { x: 0, y: 0, width: 1280, height: 820 }, TOPO = { x: 0, y: 0, width: 1280, height: 150 };
    let p = await abre(br, { raiz: RAIZ, url: url, w: 1280, h: 820 }); await esp(p, 500);
    await ir(p, 'documentos/impressos', 1000); await grava(p, 'i112-menu-' + suf, W, 1040);
    if (novo) {
      await p.click('a.cs-app-l[data-app="docs"]'); await vert(p); await esp(p, 900);
      await grava(p, 'i112-menu-prop', W, 1040); await grava(p, 'i114-fio-prop', TOPO, 1040);
      await p.mouse.move(400, 3); await esp(p, 400); await grava(p, 'i113-faixa-prop', TOPO, 1040);
      await p.click('.jn-ab[data-j="efcwork"]'); await esp(p, 300); await p.mouse.move(400, 3); await esp(p, 400); await grava(p, 'i115-efc-prop', TOPO, 1040);
      await p.evaluate(() => csTrocaTema('escuro')); await esp(p, 400); await p.mouse.move(640, 500); await esp(p, 300); await p.mouse.move(400, 3); await esp(p, 400); await grava(p, 'i115-esc-prop', TOPO, 1040);
      await p.evaluate(() => csTrocaTema('claro')); await esp(p, 300); await p.mouse.move(640, 500); await esp(p, 400);
      await p.mouse.move(400, 3); await esp(p, 300); await p.click('.jn-x[data-j="docs"]'); await esp(p, 400); await grava(p, 'i117-x-prop', W, 1040);
      await p.click('#cf [data-act="cf-nao"]'); await esp(p, 300);
      /* Ponte: o Vértice manda a ficha (com o Excel); o EFCwork recebe */
      await p.evaluate(() => jnIr('docs')); await esp(p, 300);
      const fr = p.frames().find(f => /\/EFCdocs\//.test(f.url())); await fr.addScriptTag({ url: base + '/contrato/efd-v1.js' }); await fr.addScriptTag({ url: base + '/contrato/efd-ponte.js' });
      await fr.evaluate(async ([f, partes, xlsx, b64]) => { const b = eval(b64), g = JSON.parse(JSON.stringify(f)); g.tipo = 'planilha'; g.pastaNome = 'Fichas e custódias';
        return EFDPonte.por({ de: 'docs', para: 'efcwork', tipo: 'documento', ficha: g, pdf: b(EFD.juntar(f.pub, partes)), original: b(xlsx), nomeArquivo: 'ficha-teste.xlsx' }); }, [f1, partes, xlsx, b64]);
      await esp(p, 900); await grava(p, 'i118-av-prop', { x: 240, y: 620, width: 800, height: 200 }, 800);
      await p.evaluate(() => jnIr('efcwork')); await esp(p, 3500); await ir(p, 'documentos/impressos', 900); await grava(p, 'i118-lista-prop', W, 1040);
      await p.evaluate(id => ipAbre(id), f1.id); await esp(p, 900); await grava(p, 'i119-gv-prop', { x: 640, y: 0, width: 640, height: 820 }, 640);
      /* Abrir no Vértice com o resumo de um envio (como faz o kit) */
      await p.evaluate(id => { const c = coAtivas().find(x => x.enviado && x.envio && x.lab), k = coLoteK(c), d = S.ipDocs.find(x => x.id === id);
        return ipNoVertice(id, ptResumoEnvio(k, { amostras: '3', caixas: '2', analise: 'Solo completo', pontos: 'RU11, RU12', unid: 'matriz' }, d)); }, f1.id);
      await esp(p, 4500); await grava(p, 'i119-vert-prop', W, 1040);
      console.log('pc erros', p._er);
    } else {
      ['i114-fio', 'i113-faixa', 'i115-efc', 'i115-esc', 'i117-x', 'i118-av', 'i118-lista'].forEach(x => copia('i112-menu-hoje', x + '-hoje'));
      await ir(p, 'documentos/impressos', 500);
      await p.evaluate(async ([f, partes, xlsx, b64]) => { const b = eval(b64), g = JSON.parse(JSON.stringify(f)); g.tipo = 'planilha'; g.origem = 'efcwork'; g.criadoPorId = g.alteradoPorId = S.user.id; g.criadoPor = g.alteradoPor = S.user.nome; g.pastaNome = 'Fichas e custódias';
        const buf = b(EFD.juntar(f.pub, partes)), x = b(xlsx); g.orig = { formato: 'xlsx', bytes: x.byteLength, partes: 1, sha256: await ipSha(x), nomeArquivo: 'ficha-teste.xlsx', rev: g.rev };
        await ipSobe(g.id, 'copia', g.pub.rev, buf); await ipSobe(g.id, 'orig', g.rev, x); await Data.col('efd_docs').set(g.id, g); }, [f1, partes, xlsx, b64]);
      await esp(p, 900); await p.evaluate(id => ipAbre(id), f1.id); await esp(p, 900); await grava(p, 'i119-gv-hoje', { x: 640, y: 0, width: 640, height: 820 }, 640); copia('i119-gv-hoje', 'i119-vert-hoje');
      console.log('hoje pc erros', p._er);
    }
    /* travessões (Semana) */
    await p.evaluate(() => { if (typeof jnIr === 'function') jnIr('efcwork'); }); await esp(p, 400); await p.mouse.move(640, 500);
    await ir(p, 'relatorios/semana', 1500); { const s = await sec(p, '.cs-ct .sm-sec h2'); await grava(p, 'i121-sem-' + suf, { x: 240, y: s.y, width: 1040, height: 110 }, 1040); }
    /* Marcar na imagem do relato novo */
    await ir(p, 'qualidade/bugs', 900); await p.evaluate(() => { const b = document.querySelector('[data-act="bs-novo"],[data-act="bs-reportar"]'); if (b) b.click(); }); await esp(p, 800);
    await p.evaluate(png => { if (S.fm) { S.fm.foto = png; gvDesenha(true); } }, PNGF('#b9a88a', '#8c7a5c')); await esp(p, 500);
    { const s = await sec(p, '#gv .ap-fot'); await grava(p, 'i122-mk-' + suf, s ? { x: 640, y: Math.max(0, s.y - 40), width: 640, height: 200 } : { x: 640, y: 300, width: 640, height: 200 }, 640); }
    await p.context().close();
    /* celular */
    p = await abre(br, { raiz: RAIZ, url: url, w: 390, h: 844, dsf: 2 }); await esp(p, 500);
    await ir(p, 'documentos/impressos', 900); await grava(p, 'i116-cel-' + suf, null, 780);
    if (novo) { await p.evaluate(() => jnAbrir('docs')); await vert(p); await esp(p, 1500); await grava(p, 'i116-cel-prop', null, 780);
      await p.touchscreen.tap(200, 8); await esp(p, 400); await grava(p, 'i116-toque-prop', { x: 0, y: 0, width: 390, height: 200 }, 780); }
    else copia('i116-cel-hoje', 'i116-toque-hoje');
    console.log(suf, 'cel erros', p._er); await p.context().close();
  }
  await br.close(); srv.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img14.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
