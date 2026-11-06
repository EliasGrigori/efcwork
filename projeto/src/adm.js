/* EFCwork · adm.js — Administração: Empresa (nome, unidades, logo — nada fixo no código), Aparência (tema) e Sobre. Prefixo: adm.
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
    '</div></section></div>';
}
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
  if (e.target && e.target.id === 'adm-logo') {
    try { const d = await admReduz(e.target.files[0]); await admGrava({ logo: d }, 'Logo salva.'); } catch (er) { aviso('Não deu para usar esse arquivo como logo.', 'erro'); }
  }
});
DD_AO.adm = (k, v) => { if (k === 'tema') csTrocaTema(v); else if (k === 'unid') { Store.set('cw-unidade', v); aviso('Unidade deste aparelho: ' + v); render(); } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="adm-tira-logo"]'); if (t) admGrava({ logo: '' }, 'Logo retirada.'); });

/* liga tudo (último módulo da montagem) */
csIniciar();
