/* EFCwork · suíte da v0.4.2/v0.4.3 — tela de entrar com a garota-propaganda: Revista (Escuro) e Avisos (Claro), PC e celular,
   foto recortada x com fundo (moldura), configuração na Administração, cópia no aparelho, tema do aparelho, reduzir movimento.
   As fotos do teste são desenhadas na hora (sem foto de pessoa). Modo demonstração. Uso: node tools/testes/t_v042.js */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..'), URL = 'file://' + path.join(RAIZ, 'dist', 'index.html') + '?demo=1';
const SHOTS = path.join(RAIZ, 'tools', 'testes', 'telas'); fs.mkdirSync(SHOTS, { recursive: true });
let ok = 0, falhas = 0;
const conf = (c, msg) => { if (c) { ok++; console.log('  ok  ' + msg); } else { falhas++; console.log('  FALHA  ' + msg); } };
async function entra(p, login) { await p.fill('#en-login', login); await p.fill('#en-senha', 'senha1234'); await p.click('[data-form="en-entrar"] button[type=submit]'); await p.waitForTimeout(700); }
const sai = async p => { await p.evaluate(() => csSair()); await p.waitForTimeout(400); };
const tema = async (p, t) => { await p.evaluate(t => { if (t) Store.set('cw-tema', t); else Store.del('cw-tema'); csAplicaTema(csTema()); render(); }, t); await p.waitForTimeout(250); };
/* desenha uma figura: recortada (fundo transparente) ou com fundo (jpg) */
const figura = (p, recorte) => p.evaluate(rec => {
  const c = document.createElement('canvas'); c.width = 600; c.height = 900; const g = c.getContext('2d');
  if (!rec) { g.fillStyle = '#7aa0c8'; g.fillRect(0, 0, 600, 900); }
  g.fillStyle = '#b89cf0'; g.beginPath(); g.ellipse(300, 700, 200, 260, 0, 0, 7); g.fill(); g.fillStyle = '#e0b48a'; g.beginPath(); g.arc(300, 300, 120, 0, 7); g.fill();
  return c.toDataURL(rec ? 'image/png' : 'image/jpeg', .9).split(',')[1];
}, recorte);
async function enviaFoto(p, recorte) {
  const b64 = await figura(p, recorte);
  await p.setInputFiles('#adm-ftent', { name: recorte ? 'foto.png' : 'foto.jpg', mimeType: recorte ? 'image/png' : 'image/jpeg', buffer: Buffer.from(b64, 'base64') });
  await p.waitForTimeout(900);
}
const semRolagem = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 820 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|fonts\.g|ERR_|net::/i.test(m.text())) erros.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);

  console.log('— Antes de configurar');
  conf(await p.evaluate(() => { const e = document.querySelector('.en'); return e && e.classList.contains('en-avi') && e.classList.contains('padrao') && /^data:image\/svg\+xml/.test(document.querySelector('.en-ft img').src); }), 'aparelho no tema claro, sem configuração: Avisos com a ilustração padrão (v0.4.3)');
  conf(await p.evaluate(() => !!document.querySelector('[data-form="en-primeiro"]')), 'primeiro acesso aparece dentro do mesmo cartão');
  await p.fill('#en-nome', 'Joana Silva'); await p.fill('#en-login', 'joana.silva'); await p.fill('#en-senha', 'senha1234'); await p.fill('#en-senha2', 'senha1234');
  await p.click('[data-form="en-primeiro"] button[type=submit]'); await p.waitForTimeout(700);
  await p.evaluate(async () => { await Data.col('sv2_cfg').set('empresa', { nome: 'Empresa Teste', unidades: [] }); const a = await Data.auth.createAccount('ana.lima', 'senha1234'); await Data.col('sv2_users').set(a, { nome: 'Ana Lima', login: 'ana.lima', perfil: 'secundario', superiores: [S.user.id] }); });
  await p.waitForTimeout(200);

  console.log('— Administração › Empresa › Tela de entrar');
  await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /Tela de entrar/.test(document.querySelector('.adm-en h3').textContent) && document.querySelector('#adm-pal').value === 'QUALIDADE'), 'parte "Tela de entrar" aparece, com QUALIDADE como padrão');
  conf(await p.evaluate(() => document.querySelector('#adm-faixa').value.split('\n').includes('Coletas') && document.querySelector('#adm-av0t').value === 'Laudo recebido'), 'faixa padrão = áreas do app; avisos de exemplo preenchidos');
  await enviaFoto(p, true);
  const c1 = await p.evaluate(() => S.cfgEntrar);
  conf(c1 && c1.recorte === true && /^data:image\/(webp|png)/.test(c1.foto), 'foto sem fundo: reconhecida como recortada e guardada em sv2_cfg/entrar (' + (c1 && c1.foto.slice(5, 15)) + ')');
  conf(await p.evaluate(() => { const i = new Image(); i.src = S.cfgEntrar.foto; return new Promise(r => i.onload = () => r(i.height <= 1000 && i.width < 600 && i.height < 900)); }), 'bordas transparentes cortadas e tamanho reduzido');
  conf(c1 && c1.foto.length < 600000, 'foto cabe com folga no documento (' + Math.round((c1 ? c1.foto.length : 0) / 1024) + ' KB)');
  conf(await p.evaluate(() => /Recortada/.test(document.querySelector('.adm-en').textContent)), 'a Administração avisa: "Recortada (sem fundo): efeito completo"');
  conf(await p.evaluate(() => { try { return !!JSON.parse(Store.get('cw-entrar')).foto; } catch { return false; } }), 'cópia guardada no aparelho para a tela de entrar');
  await p.screenshot({ path: path.join(SHOTS, 'v042-adm-entrar.png') });

  console.log('— Tema Claro: Avisos flutuando (PC)');
  await sai(p);
  conf(await p.evaluate(() => { const e = document.querySelector('.en'); return e.classList.contains('en-avi') && !e.classList.contains('padrao') && /^data:image\/(webp|png)/.test(document.querySelector('.en-ft img').src) && document.querySelectorAll('.en-chip').length === 3; }), 'depois de sair: foto no arco e 3 avisos');
  conf(await p.evaluate(() => /Empresa Teste/.test(document.querySelector('.en-rod').textContent)), 'rodapé mostra o nome da empresa (da cópia do aparelho)');
  await p.waitForTimeout(1600); await p.screenshot({ path: path.join(SHOTS, 'v042-claro-pc.png') });
  conf(await semRolagem(p), 'PC claro: nada rola para o lado');

  console.log('— Tema Escuro: Revista (PC)');
  await tema(p, 'escuro');
  conf(await p.evaluate(() => { const e = document.querySelector('.en'); return e.classList.contains('en-rev') && document.querySelectorAll('.en-pal:not(.frente) span').length === 9 && !document.querySelector('.en-pal.frente') && document.querySelectorAll('.en-faixa span').length >= 4; }) /* v0.6.14: a faixa fica parada; a palavra só atrás da foto (13/11) */, 'Revista: QUALIDADE só atrás da foto (sem cortar o rosto) e faixa dourada');
  conf(await p.evaluate(() => { const c = document.querySelector('.en-caixa').getBoundingClientRect(), f = document.querySelector('.en-faixa').getBoundingClientRect(); return c.bottom <= f.top; }), 'o formulário não fica em cima da faixa');
  await p.waitForTimeout(1800); await p.screenshot({ path: path.join(SHOTS, 'v042-escuro-pc.png') });
  conf(await semRolagem(p), 'PC escuro: nada rola para o lado');

  console.log('— Trocar textos e foto com fundo');
  await entra(p, 'joana.silva'); await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(300);
  await p.fill('#adm-pal', 'campo'); await p.fill('#adm-faixa', 'Solo\nFolha\nFruta'); await p.fill('#adm-av0t', 'Nota fiscal lançada'); await p.fill('#adm-av1t', ''); await p.click('[data-form="adm-entrar"] button[type=submit]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => S.cfgEntrar.palavra === 'CAMPO' && S.cfgEntrar.faixa.join() === 'Solo,Folha,Fruta' && S.cfgEntrar.avisos.length === 2), 'salva palavra em maiúsculas, faixa e avisos (aviso sem título sai)');
  await p.fill('#adm-pal', 'a'); await p.click('[data-form="adm-entrar"] button[type=submit]'); await p.waitForTimeout(200);
  conf(/pelo menos 2 letras/.test(await p.textContent('#adm-enmsg')), 'palavra curta demais: avisa e não salva');
  await enviaFoto(p, false);
  conf(await p.evaluate(() => S.cfgEntrar.recorte === false && /^data:image\/jpeg/.test(S.cfgEntrar.foto)), 'foto com fundo: reconhecida e guardada como JPG');
  conf(await p.evaluate(() => /moldura/.test(document.querySelector('.adm-en').textContent)), 'a Administração avisa que vai numa moldura');
  await sai(p);
  conf(await p.evaluate(() => !!document.querySelector('.en-ft.moldura') && !document.querySelector('.en-pal.frente') && document.querySelectorAll('.en-pal span').length === 5 && document.querySelectorAll('.en-faixa span').length === 3), 'escuro com foto com fundo: moldura, CAMPO só atrás, faixa nova');
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(SHOTS, 'v042-escuro-moldura.png') });
  await tema(p, 'claro');
  conf(await p.evaluate(() => document.querySelectorAll('.en-chip').length === 2 && /Nota fiscal lançada/.test(document.querySelector('.en-chip').textContent)), 'claro: avisos com o texto novo');

  console.log('— Quem não é Administrador');
  await entra(p, 'ana.lima'); await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => document.querySelector('#adm-pal').disabled && !document.querySelector('#adm-ftent') && !document.querySelector('[data-form="adm-entrar"] button[type=submit]')), 'colaborador só vê (campos travados, sem Escolher/Salvar)');
  await sai(p); await entra(p, 'joana.silva'); await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(300);
  await p.click('[data-act="adm-tira-ftent"]'); await p.waitForTimeout(400);
  conf(await p.evaluate(() => !S.cfgEntrar.foto), 'lixeira tira a foto');
  await sai(p); await tema(p, 'escuro');
  conf(await p.evaluate(() => document.querySelector('.en').classList.contains('padrao') && !document.querySelector('.en-pal.frente') && /^data:image\/svg/.test(document.querySelector('.en-ft img').src)), 'sem foto: Revista com a ilustração padrão, palavra só atrás (v0.6.14)');
  await p.screenshot({ path: path.join(SHOTS, 'v043-padrao-escuro.png') }); await tema(p, 'claro'); await p.waitForTimeout(1500); await p.screenshot({ path: path.join(SHOTS, 'v043-padrao-claro.png') });
  await entra(p, 'joana.silva'); await p.evaluate(() => { location.hash = '#/adm/empresa'; }); await p.waitForTimeout(300);
  conf(await p.evaluate(() => /ilustração padrão/.test(document.querySelector('.adm-en').textContent)), 'Administração avisa: sem foto aparece a ilustração padrão');
  await enviaFoto(p, true); await sai(p);

  console.log('— Celular');
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const q = await cel.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e)));
  await q.goto(URL); await q.waitForTimeout(400);
  conf(await q.evaluate(() => document.querySelector('.en').classList.contains('padrao') && !!document.querySelector('.en-ft img')), 'aparelho novo, sem cópia: ilustração padrão (v0.4.3)');
  /* a cópia do aparelho do PC (foto recortada) passa para o celular; tela de "Entrar" (não a de primeiro acesso) */
  const cache = await p.evaluate(() => { const c = JSON.parse(Store.get('cw-entrar')); c.palavra = 'QUALIDADE'; return JSON.stringify(c); });
  await q.evaluate(c => { Store.set('cw-entrar', c); S._setup = true; render(); }, cache); await q.waitForTimeout(300);
  for (const t of ['claro', 'escuro']) {
    await tema(q, t); await q.waitForTimeout(1800);
    const m = await q.evaluate(() => { const a = document.querySelector('.en-arte').getBoundingClientRect(), c = document.querySelector('.en-caixa').getBoundingClientRect(), bt = document.querySelector('.en-bt').getBoundingClientRect(); return { a: a.height, top: c.top, bt: bt.bottom }; });
    conf(m.a === 380 && m.top >= 360 && m.bt <= 844, 'celular ' + t + ': arte em cima (380 px) e botão Entrar visível sem rolar (' + Math.round(m.bt) + ' px)');
    conf(await semRolagem(q), 'celular ' + t + ': nada rola para o lado');
    await q.screenshot({ path: path.join(SHOTS, 'v042-' + t + '-cel.png') });
  }
  conf(await q.evaluate(() => getComputedStyle(document.querySelector('.en-pal br')).display === 'inline' && document.querySelector('.en-pal').getBoundingClientRect().right <= 392), 'celular escuro: palavra em duas linhas, dentro da tela');

  console.log('— Tema do aparelho e reduzir movimento');
  const esc = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce' }); const r = await esc.newPage();
  await r.goto(URL); await r.waitForTimeout(300); await r.evaluate(c => { Store.set('cw-entrar', c); S._setup = true; render(); }, cache); await r.waitForTimeout(300);
  conf(await r.evaluate(() => csTema() === 'escuro' && document.querySelector('.en').classList.contains('en-rev')), 'sem escolha no app, segue o tema escuro do aparelho');
  conf(await r.evaluate(() => getComputedStyle(document.querySelector('.en-pal span')).animationName === 'none' && getComputedStyle(document.querySelector('.en-faixa div')).animationName === 'none' && getComputedStyle(document.querySelector('.en-pal span')).opacity === '1'), 'reduzir movimento: tudo parado e visível');
  await r.evaluate(() => { Store.set('cw-tema', 'claro'); csAplicaTema(csTema()); render(); }); await r.waitForTimeout(200);
  conf(await r.evaluate(() => document.querySelector('.en').classList.contains('en-avi')), 'escolha feita no app vale mais que o tema do aparelho');

  conf(erros.length === 0, 'nenhum erro de JavaScript no PC' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  conf(e2.length === 0, 'nenhum erro de JavaScript no celular' + (e2.length ? ': ' + e2.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log('\nt_v042: ' + ok + ' ok · ' + falhas + ' falha(s)');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
