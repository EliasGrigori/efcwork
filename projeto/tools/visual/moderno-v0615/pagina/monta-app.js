/* Monta o app de demonstração que vai DENTRO da página de aprovação (um quadro por item):
   dist-proposta/index.html (o app de verdade + as propostas) sempre em demonstração, sem gravar nada no aparelho,
   entra sozinho como "Joana Silva" (inventada), põe dados de exemplo e obedece à página por mensagens. */
const fs = require('fs'), path = require('path');
const { sementeAlmox, SEM_EXTRA, PNGF } = require('./lib');
module.exports = function (RAIZ, extra) {
  let app = fs.readFileSync(path.join(RAIZ, process.env.EFC_APP || 'dist-proposta/index.html'), 'utf8'); /* EFC_APP=dist/index.html: o app de agora, sem propostas */
  const DEMO0 = 'let DEMO = /[?&]demo=1/.test(location.search)';
  if (app.split(DEMO0).length !== 2) throw new Error('linha do DEMO não encontrada');
  app = app.replace(DEMO0, 'let DEMO = true || /[?&]demo=1/.test(location.search)');
  /* sem Firebase, sem manifesto e sem ícones (a demonstração não usa; dentro da página não carregariam) */
  app = app.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+"[^>]*><\/script>\s*/g, '').replace(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\s*/g, '');
  const dentro = arq => { const t = fs.readFileSync(path.join(RAIZ, 'tools/testes', arq), 'utf8'), a = t.indexOf('p.evaluate(') + 'p.evaluate('.length, b = t.lastIndexOf(', o);'); return t.slice(a, b); };
  const SEM = '[function(){return (' + sementeAlmox(RAIZ) + ')()},function(){return (' + dentro('ag_semente.js') + ')({})},function(){return (' + dentro('au_semente.js') + ')({})},function(){return (' + SEM_EXTRA.toString() + ')(' + JSON.stringify(PNGF('#b9a88a', '#8c7a5c')) + ')}' + (extra ? ',function(){return (' + extra + ')()}' : '') + ']';
  const cabeca = `<script>/* demonstração dentro da página de aprovação: nada é gravado no aparelho */
try{['localStorage','sessionStorage'].forEach(function(k){Object.defineProperty(window,k,{configurable:true,get:function(){throw new Error('demonstração: sem armazenamento')}})})}catch(e){}
</script>`;
  const fim = `<style>.dm-cur{position:fixed;z-index:99999;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #9a7128;background:rgba(217,180,106,.35);pointer-events:none;opacity:0;transition:transform .32s cubic-bezier(.22,1,.36,1),opacity .2s}
.dm-cur.ap{background:rgba(217,180,106,.8)}</style>
<script>/* quadro dentro de página: envio de formulário e links #/… resolvidos aqui mesmo */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button[type=submit],input[type=submit]');if(!b||!b.form)return;e.preventDefault();b.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},true);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey)return;e.preventDefault();location.hash=a.getAttribute('href')},false);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[target="_blank"]');if(a)e.preventDefault()},true);
document.addEventListener('keydown',function(e){if(e.key!=='Enter'||!e.target||e.target.tagName!=='INPUT'||!e.target.form)return;e.preventDefault();e.target.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},true);
(function(){
var t0=Date.now(),SEM=${SEM};
function es(f,ms){return new Promise(function(r){(function v(){var x;try{x=f()}catch(e){}if(x||Date.now()-t0>(ms||15000))return r(x);setTimeout(v,100)})()})}
function esp(ms){return new Promise(function(r){setTimeout(r,ms)})}
function poe(id,v){var e=document.getElementById(id);if(!e)return;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}
function diz(o){try{parent.postMessage(o,'*')}catch(e){}}
var cur=null,sobre=null;
function cursor(el){if(!cur){cur=document.createElement('i');cur.className='dm-cur';cur.setAttribute('aria-hidden','true');document.body.appendChild(cur)}else if(!cur.isConnected)document.body.appendChild(cur);
  var r=el.getBoundingClientRect();cur.style.opacity=1;cur.style.transform='translate('+(r.left+r.width/2)+'px,'+(r.top+r.height/2)+'px)';return esp(380)}
function sai(){if(sobre){sobre.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));sobre=null}}
async function limpa(){sai();for(var i=0;i<6;i++){if(document.querySelector('#fed-v,#fed,#bg,.tb-mn,#gv,#cf,.dd-l:not([hidden])')){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await esp(520)}else break}}
var vez=0;
async function roda(passos){var minha=++vez;for(var i=0;i<passos.length;i++){if(minha!==vez)return;var p=passos[i],k=p[0],el;
  try{
  if(k==='ir'){location.hash='#/'+p[1];await esp(p[2]||600)}
  else if(k==='espera')await esp(p[1]);
  else if(k==='limpa')await limpa();
  else if(k==='js'){(new Function(p[1]))();await esp(p[2]||80)}
  else if(k==='clica'){el=document.querySelector(p[1]);if(el){if(el.scrollIntoView)el.scrollIntoView({block:'nearest'});await cursor(el);cur.classList.add('ap');el.click();await esp(160);if(cur)cur.classList.remove('ap')}await esp(p[2]||120)}
  else if(k==='paira'){sai();el=p[1]&&document.querySelector(p[1]);if(el){await cursor(el);el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));sobre=el}await esp(p[2]||120)}
  else if(k==='tecla'){document.dispatchEvent(new KeyboardEvent('keydown',{key:p[1],ctrlKey:!!p[2],bubbles:true,cancelable:true}));await esp(120)}
  else if(k==='digita'){el=document.querySelector(p[1]);if(el){for(var j=0;j<p[2].length;j++){el.value+=p[2][j];el.dispatchEvent(new Event('input',{bubbles:true}));await esp(130)}}}
  }catch(e){console.warn('passo',k,e)}
 }
 if(minha===vez&&cur)cur.style.opacity=0}
window.addEventListener('message',function(e){var d=e.data;if(!d||d.efc!=='cmd')return;(async function(){
  vez++;await limpa();
  if(d.tema&&csTema()!==d.tema)csTrocaTema(d.tema);
  if(d.mo&&d.mo.length&&typeof moLiga==='function')moLiga(d.mo);
  if(d.rota){location.hash='#/'+d.rota;await esp(450)}
  diz({efc:'comecou',id:d.id});
  if(d.passos&&d.passos.length)await roda(d.passos);
  diz({efc:'feito',id:d.id})})()});
(async function(){
  await es(function(){return document.getElementById('en-senha2')||(typeof S!=='undefined'&&S.user)},10000);
  if(document.getElementById('en-senha2')){poe('en-nome','Joana Silva');poe('en-login','joana.silva');poe('en-senha','senha1234');poe('en-senha2','senha1234');var b=document.querySelector('[data-form="en-primeiro"] button[type=submit]');if(b)b.click()}
  await es(function(){return typeof S!=='undefined'&&S.user},8000);
  if(!(typeof S!=='undefined'&&S.user)){diz({efc:'erro',txt:'O app não entrou na demonstração.'});return}
  for(var i=0;i<SEM.length;i++){try{await SEM[i]()}catch(e){console.warn('semente',i,e)}}
  await esp(350);diz({efc:'pronto'})
})();
})();</script>`;
  if (app.indexOf('<head>') < 0 || app.split('</body>').length !== 2) throw new Error('estrutura do app mudou');
  return app.replace('<head>', '<head>' + cabeca).replace('</body>', fim + '</body>');
};
