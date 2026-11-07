/* EFCwork · adm.js — Administração: Empresa (nome, unidades, logo, tela de entrar — nada fixo no código), Aparência (tema) e Sobre. Prefixo: adm.
   A empresa fica em sv2_cfg/empresa (mesmo Firebase do EFClaudian). Só o Principal altera; os outros veem. */
function admEmpresa() {
  const e = S.empresa || {}, pode = isPrincipal(S.user), un = e.unidades || [], logo = imgSrc(e.logo);
  const minha = Store.get('cw-unidade') || un[0] || '';
  return '<div class="adm-gr"><section class="pn"><div class="hd"><h3>Dados da empresa</h3><span class="sp"></span>' + (pode ? '' : '<span class="pill">só o Administrador altera</span>') + '</div>' +
    '<form class="cpo" data-form="adm-empresa">' +
    '<div class="adm-logo"><span class="adm-lg">' + (logo ? '<img src="' + logo + '" alt="Logo atual">' : ic('imagem')) + '</span><div><b>Logo</b><small>PNG ou JPG; o app reduz para 256 px.</small>' +
    (pode ? '<div class="adm-lgb"><label class="bt">' + ic('imagem') + 'Escolher<input type="file" id="adm-logo" accept="image/png,image/jpeg,image/webp" hidden></label>' + (logo ? '<button type="button" class="bt ic-so" data-act="adm-tira-logo" title="Tirar a logo" aria-label="Tirar a logo">' + ic('lixo') + '</button>' : '') + '</div>' : '') + '</div></div>' +
    '<label class="cp">Nome da empresa<input id="adm-nome" maxlength="80" value="' + esc(e.nome || '') + '"' + (pode ? '' : ' disabled') + ' placeholder="Ex.: Fazenda Boa Vista"></label>' +
    '<label class="cp">Unidades<textarea id="adm-un" rows="4"' + (pode ? '' : ' disabled') + ' placeholder="Uma por linha. Ex.: Unidade Sede">' + esc(un.join('\n')) + '</textarea><small>Uma por linha. Aparecem no menu e nos filtros.</small></label>' +
    (pode ? '<p class="en-msg" id="adm-msg" role="alert"></p><div><button class="bt pr" type="submit">Salvar</button></div>' : '') + '</form></section>' +
    '<section class="pn"><div class="hd"><h3>Unidade deste aparelho</h3></div><div class="cpo">' +
    (un.length ? '<p class="ini-vz">Usada como padrão nos filtros, neste aparelho.</p>' + ddHTML('adm:unid', minha, un.map(x => [x, x])) : '<p class="ini-vz">Cadastre as unidades ao lado.</p>') +
    '</div></section></div>' + admEntrar();
}
/* v0.4.2 — tela de entrar: foto da garota-propaganda, palavra grande (Escuro), faixa (Escuro) e avisos (Claro). Fica em sv2_cfg/entrar. */
function admEntrar() {
  const pode = isPrincipal(S.user), c = enCfg(), dis = pode ? '' : ' disabled', foto = imgSrc((S.cfgEntrar || {}).foto);
  const av = [0, 1, 2].map(i => c.avisos[i] || ['', '']);
  return '<section class="pn adm-en"><div class="hd"><h3>Tela de entrar</h3><span class="sp"></span>' + (pode ? '' : '<span class="pill">só o Administrador altera</span>') + '</div>' +
    '<form class="cpo" data-form="adm-entrar">' +
    '<div class="adm-logo"><span class="adm-lg adm-ftv">' + (foto ? '<img src="' + foto + '" alt="Foto atual">' : ic('imagem')) + '</span><div><b>Foto da garota-propaganda</b>' +
    '<small>' + (foto ? (S.cfgEntrar.recorte !== false ? 'Recortada (sem fundo): efeito completo.' : 'Com fundo: aparece numa moldura arredondada. Para o efeito completo, use um PNG sem fundo.') : 'Melhor um PNG sem fundo (recortado). Com fundo também serve: aparece numa moldura.') + '</small>' +
    (pode ? '<div class="adm-lgb"><label class="bt">' + ic('imagem') + 'Escolher<input type="file" id="adm-ftent" accept="image/png,image/jpeg,image/webp" hidden></label>' + (foto ? '<button type="button" class="bt ic-so" data-act="adm-tira-ftent" title="Tirar a foto" aria-label="Tirar a foto">' + ic('lixo') + '</button>' : '') + '</div>' : '') + '</div></div>' +
    '<label class="cp">Palavra grande (tema Escuro)<input id="adm-pal" maxlength="12" value="' + esc(c.palavra) + '"' + dis + '><small>Uma palavra, até 12 letras. Ex.: QUALIDADE</small></label>' +
    '<label class="cp">Faixa dourada (tema Escuro)<textarea id="adm-faixa" rows="4"' + dis + '>' + esc(c.faixa.join('\n')) + '</textarea><small>Uma por linha, até 12. Vazio = as áreas do app.</small></label>' +
    '<div class="cp"><span>Avisos flutuando (tema Claro)</span><div class="adm-avs">' + av.map((x, i) => '<input id="adm-av' + i + 't" maxlength="28" placeholder="Título" aria-label="Título do aviso ' + (i + 1) + '" value="' + esc(x[0]) + '"' + dis + '><input id="adm-av' + i + 'd" maxlength="32" placeholder="Detalhe" aria-label="Detalhe do aviso ' + (i + 1) + '" value="' + esc(x[1]) + '"' + dis + '>').join('') + '</div>' +
    '<small>São só textos de exemplo: a pessoa ainda não entrou, então não aparecem dados reais.</small></div>' +
    '<p class="ini-vz">Antes do login o app não pode ler a configuração; cada aparelho guarda uma cópia quando alguém entra nele. Sem cópia, aparece só o fundo e o formulário.</p>' +
    (pode ? '<p class="en-msg" id="adm-enmsg" role="alert"></p><div><button class="bt pr" type="submit">Salvar</button></div>' : '') + '</form></section>';
}
/* foto: recorta as bordas transparentes, reduz para até 1000 px de altura e vê se tem fundo */
function admFotoEntrar(arq) {
  return new Promise((res, rej) => {
    if (!arq || !/^image\//.test(arq.type)) return rej(new Error('tipo'));
    const r = new FileReader(); r.onerror = () => rej(new Error('ler'));
    r.onload = () => { const im = new Image(); im.onerror = () => rej(new Error('img')); im.onload = () => {
      const c0 = document.createElement('canvas'); c0.width = im.width; c0.height = im.height; const g0 = c0.getContext('2d'); g0.drawImage(im, 0, 0);
      const d = g0.getImageData(0, 0, im.width, im.height).data, W = im.width, H = im.height;
      let x0 = W, y0 = H, x1 = -1, y1 = -1, borda = 0, transp = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = d[(y * W + x) * 4 + 3];
        if (a > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) { borda++; if (a < 250) transp++; } }
      const recorte = borda > 0 && transp / borda > 0.3 && x1 >= 0;
      if (!recorte) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
      let alt = Math.min(1000, ch), url = '';
      for (let t = 0; t < 4; t++) {
        const k = alt / ch, c = document.createElement('canvas'); c.width = Math.round(cw * k); c.height = Math.round(ch * k);
        c.getContext('2d').drawImage(c0, x0, y0, cw, ch, 0, 0, c.width, c.height);
        url = recorte ? c.toDataURL('image/webp', 0.86) : c.toDataURL('image/jpeg', 0.85);
        if (recorte && url.indexOf('data:image/webp') !== 0) url = c.toDataURL('image/png');
        if (url.length < 600000) break; alt = Math.round(alt * 0.75);
      }
      res({ foto: url, recorte: recorte }); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
async function admGravaEntrar(patch, msgOk) {
  const c = Object.assign({}, S.cfgEntrar || {}, patch); delete c.id; delete c.srv; c.atualizadoEm = nowISO(); c.atualizadoPor = S.user.id;
  try { await Data.col('sv2_cfg').set('entrar', c); S.cfgEntrar = Object.assign({ id: 'entrar' }, c); enGuardaCache(); aviso(msgOk || 'Tela de entrar salva.'); render(); }
  catch (er) { console.error(er); const t = /permission/i.test(er && (er.code || er.message) || '') ? 'O Firebase não deixou salvar (permissão).' : 'Não foi possível salvar agora.'; const m = $('#adm-enmsg'); if (m) m.textContent = t; else aviso(t, 'erro'); }
}
document.addEventListener('submit', e => {
  const f = e.target.closest && e.target.closest('[data-form="adm-entrar"]'); if (!f) return;
  e.preventDefault(); if (!isPrincipal(S.user)) return;
  const pal = $('#adm-pal').value.toUpperCase().replace(/\s+/g, '').slice(0, 12);
  if (pal.length < 2) { $('#adm-enmsg').textContent = 'Informe a palavra grande (pelo menos 2 letras).'; return; }
  const faixa = $('#adm-faixa').value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 12);
  const avisos = [0, 1, 2].map(i => [$('#adm-av' + i + 't').value.trim(), $('#adm-av' + i + 'd').value.trim()]).filter(x => x[0]);
  admGravaEntrar({ palavra: pal, faixa: faixa, avisos: avisos });
});
function admAparencia() {
  return '<section class="pn adm-uma"><div class="hd"><h3>Tema</h3></div><div class="cpo"><p class="ini-vz">Vale só neste aparelho.</p>' + ddHTML('adm:tema', csTema(), [['claro', 'Claro'], ['escuro', 'Escuro (Dourado)']]) + '</div></section>';
}
function admSobre() {
  const l = [['App', APP_NOME + ' · ' + APP_APELIDO], ['Família', APP_FAMILIA], ['Versão', 'v' + VERSAO], ['Dados', DEMO ? 'Demonstração (só neste navegador)' : 'Firebase do EFClaudian (mesmas coleções)'], ['Empresa', (S.empresa && S.empresa.nome) || 'não configurada']];
  return '<section class="pn adm-uma"><div class="hd"><h3>Sobre</h3></div><dl class="adm-dl">' + l.map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl></section>';
}
TELAS.adm = function (aba) {
  const t = { empresa: 'Empresa', aparencia: 'Aparência', sobre: 'Sobre' }[aba] || 'Empresa';
  return cabecalho({ titulo: t, abaNome: t, meta: aba === 'empresa' ? [metaPl(isPrincipal(S.user) ? 'você pode alterar' : 'somente leitura', isPrincipal(S.user) ? 'ok' : '', 'info')] : [] }) +
    (aba === 'aparencia' ? admAparencia() : aba === 'sobre' ? admSobre() : admEmpresa());
};

/* logo: reduz no aparelho antes de guardar (máx. 256 px) */
function admReduz(arq) {
  return new Promise((res, rej) => {
    if (!arq || !/^image\//.test(arq.type)) return rej(new Error('tipo'));
    const r = new FileReader(); r.onerror = () => rej(new Error('ler'));
    r.onload = () => { const im = new Image(); im.onerror = () => rej(new Error('img')); im.onload = () => {
      const k = Math.min(1, 256 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
async function admGrava(patch, msgOk) {
  const e = Object.assign({ nome: '', unidades: [], logo: '' }, S.empresa || {}, patch);
  delete e.id; delete e.srv; e.atualizadoEm = nowISO(); e.atualizadoPor = S.user.id;
  try { await Data.col('sv2_cfg').set('empresa', e); S.empresa = Object.assign({ id: 'empresa' }, e); aviso(msgOk || 'Empresa salva.'); render(); }
  catch (er) { console.error(er); const m = $('#adm-msg'); const t = /permission/i.test(er && (er.code || er.message) || '') ? 'O Firebase não deixou salvar (permissão). As regras precisam liberar sv2_cfg/empresa para o Administrador.' : 'Não foi possível salvar agora.'; if (m) m.textContent = t; else aviso(t, 'erro'); }
}
document.addEventListener('submit', e => {
  const f = e.target.closest && e.target.closest('[data-form="adm-empresa"]'); if (!f) return;
  e.preventDefault(); if (!isPrincipal(S.user)) return;
  const nome = $('#adm-nome').value.trim(), un = $('#adm-un').value.split('\n').map(x => x.trim()).filter(Boolean).filter((x, i, l) => l.indexOf(x) === i).slice(0, 20);
  if (nome.length < 2) { $('#adm-msg').textContent = 'Informe o nome da empresa.'; return; }
  admGrava({ nome: nome, unidades: un });
});
document.addEventListener('change', async e => {
  if (e.target && e.target.id === 'adm-ftent') {
    try { const r = await admFotoEntrar(e.target.files[0]); await admGravaEntrar(r, r.recorte ? 'Foto salva (recortada).' : 'Foto salva (com fundo: vai numa moldura).'); } catch (er) { aviso('Não deu para usar esse arquivo como foto.', 'erro'); }
  }
  if (e.target && e.target.id === 'adm-logo') {
    try { const d = await admReduz(e.target.files[0]); await admGrava({ logo: d }, 'Logo salva.'); } catch (er) { aviso('Não deu para usar esse arquivo como logo.', 'erro'); }
  }
});
DD_AO.adm = (k, v) => { if (k === 'tema') csTrocaTema(v); else if (k === 'unid') { Store.set('cw-unidade', v); aviso('Unidade deste aparelho: ' + v); render(); } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="adm-tira-logo"]'); if (t) admGrava({ logo: '' }, 'Logo retirada.'); });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="adm-tira-ftent"]'); if (t && isPrincipal(S.user)) admGravaEntrar({ foto: '', recorte: true }, 'Foto retirada.'); });

/* liga tudo (último módulo da montagem) */
csIniciar();
