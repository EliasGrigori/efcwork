# Monta docs/modelos-efcwork-v0.6.15.html: o app de verdade (demo) + os 5 modelos + um seletor de modelo no canto.
import pathlib
R = pathlib.Path(__file__).resolve().parents[3]
M = R / 'tools/visual/modelos-v0615'
app = (R / 'dist/index.html').read_text(encoding='utf-8')
css = '\n'.join((M / f).read_text(encoding='utf-8') for f in ['comum.css', 'm1.css', 'm2.css', 'm3.css', 'm4.css', 'm5.css'])
seletor = '''<div id="mdl-sel" aria-label="Escolher modelo"><b>Modelo</b><div class="mdl-bts">''' + ''.join(
    '<button type="button" data-m="%d" title="%s">%s</button>' % (i, t, 'Hoje' if i == 0 else str(i)) for i, t in enumerate(
        ['Como está hoje', 'Refinado', 'Plano e denso', 'Tátil tonal', 'Contorno nítido', 'Editorial'])) + '''</div><small id="mdl-nm"></small></div>
<style>#mdl-sel{position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;background:#1e1b14;color:#f7f5ef;font:600 13px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)}
#mdl-sel .mdl-bts{display:flex;gap:4px}#mdl-sel button{all:unset;cursor:pointer;min-width:30px;height:30px;padding:0 8px;box-sizing:border-box;display:grid;place-items:center;border-radius:7px;background:rgba(255,255,255,.08)}
#mdl-sel button.on{background:#d9b46a;color:#1c1406}#mdl-sel small{font-weight:500;opacity:.8;min-width:96px}
@media (max-width:899px){#mdl-sel{left:8px;right:8px;bottom:calc(76px + env(safe-area-inset-bottom,0px));justify-content:space-between}#mdl-sel button{height:36px;min-width:36px}#mdl-sel small{display:none}}
@media print{#mdl-sel{display:none}}</style>
<script>(function(){var N=['Como está hoje','Refinado','Plano e denso','Tátil tonal','Contorno nítido','Editorial'];
function poe(m){document.documentElement.setAttribute('data-modelo',m);document.querySelectorAll('#mdl-sel button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')==m)});var s=document.getElementById('mdl-nm');if(s)s.textContent=N[m];try{localStorage.setItem('mdl-v0615',m)}catch(e){}}
var q=new URLSearchParams(location.search).get('modelo'),m=q;if(m==null){try{m=localStorage.getItem('mdl-v0615')}catch(e){}}poe(m==null?1:m);
document.getElementById('mdl-sel').addEventListener('click',function(e){var b=e.target.closest('button[data-m]');if(b)poe(b.getAttribute('data-m'))});})();</script>'''
t48 = (R / 'tools/testes/t_v048.js').read_text(encoding='utf-8')
a = t48.index('await p.evaluate(async () => {') + len('await p.evaluate(')
b = t48.index('});\n  await p.waitForTimeout(300);', a) + 1
semente = t48[a:b]  # async () => { ... }  (materiais, movimentações, solicitações, equipamentos inventados)
cabeca = ''  # v0.6.15: a demonstração é forçada no próprio código (abaixo); antes mudava o endereço e falhava na prévia do app
ORIG_DEMO = "let DEMO = /[?&]demo=1/.test(location.search)"
assert app.count(ORIG_DEMO) == 1
app = app.replace(ORIG_DEMO, "let DEMO = true || /[?&]demo=1/.test(location.search)", 1)  # este arquivo de modelos é SEMPRE demonstração
envio = '''<script>/* prévia sem permissão de formulário (janela de prévia do app): o envio vira um evento só da página, nada sai daqui */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button[type=submit],input[type=submit]');if(!b||!b.form)return;e.preventDefault();b.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},true);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey)return;e.preventDefault();location.hash=a.getAttribute('href')},false);
document.addEventListener('keydown',function(e){if(e.key!=='Enter'||!e.target||e.target.tagName!=='INPUT'||!e.target.form)return;e.preventDefault();e.target.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))},true);</script>'''
auto = '''<script>/* entra sozinho como "Joana Silva" (inventada) e põe dados de exemplo, só na primeira vez */
(function(){var t0=Date.now();function es(f,ms){return new Promise(function(r){(function v(){var x=f();if(x||Date.now()-t0>(ms||15000))return r(x);setTimeout(v,120)})()})}
function poe(id,v){var e=document.getElementById(id);if(!e)return;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}
var semear=''' + semente + ''';
(async function(){await es(function(){return document.getElementById('en-nome')||((typeof S!=='undefined'&&S.user))},8000);
if(document.getElementById('en-nome')&&document.getElementById('en-senha2')){poe('en-nome','Joana Silva');poe('en-login','joana.silva');poe('en-senha','senha1234');poe('en-senha2','senha1234');var b=document.querySelector('[data-form="en-primeiro"] button[type=submit]');if(b)b.click();}
await es(function(){return (typeof S!=='undefined'&&S.user)},8000);if(!((typeof S!=='undefined'&&S.user)))return;
var f=null;try{f=localStorage.getItem('mdl-semeado')}catch(e){}
if(!f){try{await semear();localStorage.setItem('mdl-semeado','1')}catch(e){console.warn('semente',e)}if(!location.hash||location.hash==='#/inicio')location.hash='#/almox/materiais';else if(typeof render==='function')render();}
})();})();</script>'''
estilo = '<style id="modelos-v0615">\n' + css + '\n</style>'
assert '</body>' in app
out = app.replace('<head>', '<head>' + cabeca, 1).replace('</body>', estilo + seletor + envio + auto + '</body>', 1)
assert 'let DEMO = true ||' in out
(R / 'docs/modelos-efcwork-v0.6.15.html').write_text(out, encoding='utf-8')
print('ok', len(out) // 1024, 'KB')
