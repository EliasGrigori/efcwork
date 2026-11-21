/* EFCwork · foto.js — foto do perfil (v0.6.31). Prefixo: ft.
   Grava em sv2_avatar/<uid> o campo img (data URL), a mesma coleção e a mesma regra que o EFClaudian já usa: cada pessoa grava só a
   própria foto, com menos de 60 mil letras; o Administrador só pode apagar (img vazio). Assim a foto vale em todos os apps da família.
   No aparelho a foto é recortada no centro (quadrada), reduzida a 192 px e salva em JPEG; a qualidade baixa até caber no limite. */
const FT_MAX = 58000; /* folga sob os 60000 da regra */
function ftMinha() { return (S._ftFoto && S._ftFoto.uid === (S.user && S.user.id)) ? S._ftFoto.img : ''; }
/* o que vai na bolinha do menu: a foto, se houver; senão as iniciais */
function ftAvatar(u) { return imgSrc(ftMinha()) ? '<img src="' + imgSrc(ftMinha()) + '" alt="">' : esc(iniciais((u || {}).nome)); }
function ftReduz(arq) {
  return new Promise((ok, no) => {
    if (!arq || !/^image\//.test(arq.type)) return no(new Error('tipo'));
    const r = new FileReader(); r.onerror = () => no(new Error('ler'));
    r.onload = () => { const im = new Image(); im.onerror = () => no(new Error('img')); im.onload = () => {
      const l = Math.min(im.width, im.height), x = (im.width - l) / 2, y = (im.height - l) / 2;
      for (const [lado, q] of [[192, 0.86], [192, 0.75], [160, 0.7], [128, 0.65], [96, 0.6]]) {
        const c = document.createElement('canvas'); c.width = c.height = lado; const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, lado, lado); g.drawImage(im, x, y, l, l, 0, 0, lado, lado);
        const u = c.toDataURL('image/jpeg', q); if (u.length < FT_MAX) return ok(u);
      }
      no(new Error('grande')); }; im.src = r.result; };
    r.readAsDataURL(arq);
  });
}
async function ftGrava(img) {
  const uid = S.user.id;
  try { await Data.col('sv2_avatar').set(uid, { img: img }); S._ftFoto = { uid: uid, img: img }; aviso(img ? 'Foto salva. Ela aparece também nos outros apps da família.' : 'Foto tirada.'); render(); }
  catch (e) { console.error(e); aviso(/permission/i.test((e && (e.code || e.message)) || '') ? 'O Firebase não deixou salvar a foto (permissão).' : 'Não deu para salvar a foto agora.', 'erro'); }
}
function ftLinha() {
  const f = !!imgSrc(ftMinha());
  return '<div class="adm-logo ft-linha"><span class="adm-lg ft-foto">' + (f ? '<img src="' + imgSrc(ftMinha()) + '" alt="Sua foto">' : esc(iniciais(S.user.nome))) + '</span><div><b>Foto</b><small>Aparece no menu e nos outros apps da família.</small>' +
    '<div class="adm-lgb"><label class="bt">' + ic('imagem') + (f ? 'Trocar' : 'Escolher') + '<input type="file" id="ft-arq" accept="image/png,image/jpeg,image/webp" hidden></label>' +
    (f ? '<button type="button" class="bt ic-so" data-act="ft-tira" title="Tirar a foto" aria-label="Tirar a foto">' + ic('lixo') + '</button>' : '') + '</div></div></div>';
}
document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'ft-arq' || !S.user) return;
  const a = e.target.files && e.target.files[0]; if (!a) return;
  ftReduz(a).then(ftGrava).catch(er => aviso(er.message === 'grande' ? 'Esta foto não coube no limite. Tente outra.' : 'Não deu para ler esta imagem. Use PNG ou JPG.', 'erro'));
});
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-act="ft-tira"]'); if (t && S.user) ftGrava(''); });
CS_CARGAS.push(() => { if (!S.user) return; const uid = S.user.id; Data.col('sv2_avatar').get(uid).then(d => { const img = (d && d.img) || ''; if (!S._ftFoto || S._ftFoto.uid !== uid || S._ftFoto.img !== img) { S._ftFoto = { uid: uid, img: img }; render(); } }).catch(() => {}); });
