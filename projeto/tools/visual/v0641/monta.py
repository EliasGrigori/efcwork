#!/usr/bin/env python3
"""EFCwork v0.6.40 · página de aprovação dos Cadastros de Coletas (ITENS 239 a 248).
Fotos do app de verdade em tools/visual/v0640/telas (tiradas por tools/testes/t_v0640.js e o filme por cap.js).
Saída: docs/aprovacao-efcwork-v0.6.40-cadastros-coletas.html"""
import base64, io, os, re, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/visual/v0641/telas')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()
ANT = open(os.path.join(R, 'tools/visual/v0635b/monta.py')).read()
EXTRA = re.search(r'EXTRA = """(.*?)"""', ANT, re.S).group(1)
JS = re.search(r'\nJS = r"""(.*?)"""', ANT, re.S).group(1).replace("'efcwork-v0635b-respostas'", "'efcwork-v0641-respostas'").replace('Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro', 'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)')
assert 'efcwork-v0641-respostas' in JS

def img(n, larg=1100):
    im = Image.open(os.path.join(T, n + '.png')).convert('RGB')
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def z(n, alt):
    larg = 520 if n.startswith('cel') else 1200
    return '<button type="button" class="zoom" aria-label="Ampliar: %s"><img src="%s" alt="%s"></button>' % (html.escape(alt), img(n, larg), html.escape(alt))
def um(n, leg): return '<div><p class="leg">%s</p>%s</div>' % (html.escape(leg), z(n, leg))
def filme(n, leg):
    v = base64.b64encode(open(os.path.join(T, n + '.mp4'), 'rb').read()).decode()
    return '<div><p class="leg">%s</p><video class="vd" muted loop playsinline controls preload="metadata" aria-label="%s" poster="%s" src="data:video/mp4;base64,%s"></video></div>' % (html.escape(leg), html.escape(leg), img(n, 960), v)
def lado(*a, cls='lado'): return '<div class="%s">%s</div>' % (cls, ''.join(a))

ITENS = []
def it(n, t, p, corpo): ITENS.append(dict(n=n, t=t, p=p, corpo=corpo))
it(255, 'Documentos internos sobem sozinhos para a nuvem',
   'Sua decisão de 27/11: sobe só o arquivo que está numa das 5 pastas (Etiquetas, Fichas e custódias, Formulários, Fluxogramas, POPs e procedimentos); sem pasta, fica "neste aparelho" como rascunho. Quem sobe: só o Administrador e o Líder ★, logo depois de salvar. Sem internet, espera e sobe quando a internet volta (fica guardado no aparelho). Os arquivos que já estavam nas 5 pastas sobem na primeira vez que o Vértice abre. Tudo fica registrado na Atividade do Cwork.',
   lado(um('pc-internos-etiquetas', 'Documentos internos dentro do Cwork, com o arquivo já na nuvem')))
it(256, 'Coluna "Nuvem" em Documentos internos',
   'Mostra onde está cada documento: "Na nuvem · versão 3", "Subindo para a nuvem" ou "Só neste aparelho". A Situação (o envio antigo pela caixa do aparelho) encolheu para o Nome não sumir; abaixo de 1240 px a coluna "Alterado em" sai. No celular a coluna sai da linha e aparece nos detalhes do documento.',
   lado(um('pc-internos-nuvem', 'Coluna Nuvem')))
it(257, 'Quem recebe e quando',
   'Todo mundo que tem a pasta liberada (Administração › Pastas do Vértice) recebe os documentos dela: ao abrir o Vértice, a cada 2 minutos e quando a internet volta. Quem não é Líder ★ nem Administrador nunca envia: se ele mexer num documento da nuvem, a versão da nuvem volta por cima quando chegar uma versão nova. Documento apagado de vez no aparelho não volta da nuvem.',
   '')
it(258, 'Duas pessoas salvam o mesmo documento',
   'Quem salvou primeiro vale. O segundo recebe o aviso "Alguém salvou este documento na nuvem antes de você. O seu ficou numa cópia em conflito; o original agora é o da nuvem." e o que ele fez fica num arquivo novo, "(cópia em conflito de Nome)". Nada se perde. (Regra combinada na P1 do Vértice, agora ligada de verdade.)',
   '')

def item_html(x):
    voto = '<div class="voto"><input type="radio" id="r%d_a" name="r%d" value="Aprovado"><label for="r%d_a" class="ok">Aprovado</label><input type="radio" id="r%d_r" name="r%d" value="Reprovado"><label for="r%d_r" class="no">Reprovado</label></div>' % ((x['n'],) * 6)
    return ('<section class="it" data-n="%d" data-t="%s"><div class="seg"><div class="num">ITEM<span>%d</span></div><div class="cab"><h3>%s</h3><p>%s</p></div></div>%s'
            '<div class="resp">%s<label class="com">Comentário (opcional)<textarea id="c%d" rows="2"></textarea></label></div></section>') % (
        x['n'], html.escape(x['t']), x['n'], html.escape(x['t']), html.escape(x['p']), x['corpo'], voto, x['n'])

EXTRA += """
.cels{grid-template-columns:repeat(2,minmax(0,300px))!important}
.vd{display:block;width:100%;border:1px solid var(--bd);border-radius:var(--rs);background:var(--c2)}
.resp .voto{flex-wrap:wrap}.resp .voto label{white-space:nowrap;min-width:96px;padding:0 12px}
.rf{margin:0;padding-left:20px}.rf li{margin-bottom:6px}.rf a{color:var(--aTx)}
"""
VJS = r"""
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var v = [].slice.call(document.querySelectorAll('video'));
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var x = e.target; if (e.isIntersecting) { var p = x.play(); if (p && p.catch) p.catch(function () {}); } else x.pause(); }); }, { threshold: .4 });
  v.forEach(function (x) { io.observe(x); });
})();
"""
REFS = [('https://www.nngroup.com/articles/drop-down-menus/', 'Nielsen Norman Group: menus suspensos', 'A lista retrátil economiza espaço; o rótulo do que se escolhe fica à vista com ela aberta.'),
        ('https://www.ucl.ac.uk/brand-and-experience/experience/ucl-design-system/components/dropdown', 'UCL Design System: dropdown', 'Serve para um conjunto fixo de opções (de 5 a 15) e mostra a opção escolhida quando fechada.'),
        ('https://developer.gnome.org/hig/patterns/controls/drop-downs.html', 'GNOME: listas suspensas', 'Lista suspensa só a partir de 3 opções; com 2, botões (aqui são 6).')]
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.41 · Vértice na nuvem</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.41 · Vértice v0.6.75</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Etapa 1: o Vértice na nuvem</h1><p class="sub">Primeira das 3 etapas da sua decisão de 27/11 (todos os documentos só no Vértice). Os documentos de "Documentos internos" passam a morar no Firebase do Cwork, pelas regras já publicadas na v0.6.36; o Vértice continua sem chave nenhuma: pede ao Cwork. Fotos do Vértice de verdade dentro do Cwork, no modo demonstração. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in ITENS) +
       '<div class="fim"><h2>Conferido</h2><ul><li>Cwork: teste novo da nuvem com o Vértice de verdade, 22 conferências (formato que as regras aceitam, versão e conflito, arquivo de 2 MB em 3 pedaços, Colaborador não grava e só vê as pastas liberadas, o Vértice traz e sobe sozinho). Bateria inteira: 78 de 80 (as 2 de sempre). Medidor sem defeitos.</li><li>Vértice: 692 testes (7 novos da sincronia) e as 5 auditorias do método sem piorar nada.</li></ul>'
       '<h2>O que não deu para provar daqui</h2><ul><li>As regras do Firestore de verdade (o simulador não baixa aqui). Por isso, depois do "pode publicar", você faz o roteiro abaixo no site.</li><li>Android de verdade e internet caindo de verdade.</li></ul>'
       '<h2>Roteiro curto para você testar no site (depois de publicar)</h2><ol><li>No PC, com a sua conta: Vértice Docs › crie uma planilha qualquer › Arquivo › Documento interno › Etiquetas. Em Documentos internos, a coluna Nuvem deve chegar em "Na nuvem · versão 1".</li><li>No celular (ou outro navegador), entre com a sua conta e abra o Vértice: o mesmo documento aparece em Documentos internos › Etiquetas.</li><li>Com uma conta de Colaborador, abra o Vértice pelo Cwork: ele vê só as pastas liberadas para ele em Administração › Pastas do Vértice.</li><li>Se algo der "negado" ou não aparecer, me diga em que passo.</li></ol>'
       '<h2>Depois</h2><ul><li>Etapa 2: o documento aberto pelo Cwork (só escrever, sem menus, na orientação do modelo, três pontinhos com "Atualizar documento").</li><li>Etapa 3: Impressos, kit e etiquetas do Cwork apontando para o Vértice.</li><li>Firebase: nada novo para colar (as regras são as da v0.6.36).</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + VJS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
