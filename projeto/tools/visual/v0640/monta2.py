#!/usr/bin/env python3
"""EFCwork v0.6.40 · página de aprovação dos Cadastros de Coletas (ITENS 239 a 248).
Fotos do app de verdade em tools/visual/v0640/telas (tiradas por tools/testes/t_v0640.js e o filme por cap.js).
Saída: docs/aprovacao-efcwork-v0.6.40-cadastros-coletas.html"""
import base64, io, os, re, html
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
T = os.path.join(R, 'tools/visual/v0640/telas')
CSS = open(os.path.join(R, 'tools/visual/moderno-v0615/pagina/pagina.css')).read()
ANT = open(os.path.join(R, 'tools/visual/v0635b/monta.py')).read()
EXTRA = re.search(r'EXTRA = """(.*?)"""', ANT, re.S).group(1)
JS = re.search(r'\nJS = r"""(.*?)"""', ANT, re.S).group(1).replace("'efcwork-v0635b-respostas'", "'efcwork-v0640b-respostas'").replace('Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro', 'Respostas EFCwork v0.6.40 · cadastros de coletas, 2ª rodada')
assert 'efcwork-v0640b-respostas' in JS

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
A = lambda n, leg: um('antes/' + n, leg)
it(249, 'Desativados junto dos ativos, sem a faixa "Ativos" (todas as tabelas dos Cadastros)',
   'Sua resposta no ITEM 240 e no 246. A faixa "Ativos / Desativados" saiu das 6 tabelas. O desativado fica na ordem normal (aqui, RU09TAI21 entre os outros) e a coluna Situação diz que está desativado.',
   lado(A('pc-talhoes', 'ANTES (reprovado)'), um('pc-talhoes', 'AGORA')) + lado(um('esc-pc-talhoes', 'AGORA no tema Escuro'), cls='lado') + lado(um('cel-talhoes', 'AGORA no celular'), um('esc-cel-talhoes', 'Celular, Escuro'), cls='lado cels'))
it(250, 'Formulário do talhão: Código e Pivô alinhados',
   'Sua resposta no ITEM 241. O rótulo do Código tinha uma explicação embaixo e ficou com 2 linhas (41 px contra 20 px do Pivô); por isso a caixa desceu. Saíram as explicações dos campos lado a lado em todos os formulários. O teste agora mede, em cada formulário, no PC e no celular, se os campos lado a lado estão na mesma linha, com a mesma altura e (no celular) a mesma largura. Rodado na versão reprovada, ele acusa o defeito; na de agora, passa.',
   lado(A('pc-talhao-novo', 'ANTES (reprovado)'), um('pc-talhao-novo', 'AGORA')) + lado(um('pc-talhao-editar', 'AGORA: editar, com o código travado'), cls='lado') + lado(um('cel-talhao-novo', 'AGORA no celular'), cls='lado cels'))
it(251, 'Análises sem a coluna Sigla',
   'Sua resposta no ITEM 242. A sigla saiu da tabela. Ela continua só dentro do formulário, porque é ela que sai na etiqueta completa da fruta (ex.: MAMÃO RU11 SC).',
   lado(A('pc-analises', 'ANTES (reprovado)'), um('pc-analises', 'AGORA')) + lado(um('pc-analise-nova', 'AGORA: formulário'), um('cel-analise-nova', 'Celular'), cls='lado'))
it(252, 'Tipo de coleta sem profundidade',
   'Sua resposta no ITEM 245. A profundidade saiu da tabela e do formulário: você decide na hora da coleta, como já é hoje no Coletado. Ficam o nome, os pontos por hectare e que amostras o tipo gera. As profundidades antigas que já estão gravadas não são apagadas.',
   lado(A('pc-tipo-novo', 'ANTES (reprovado)'), um('pc-tipo-novo', 'AGORA')) + lado(um('pc-tipos', 'AGORA: tabela'), um('cel-tipo-novo', 'Celular'), cls='lado'))
it(253, 'Laboratório com cadastro completo',
   'Seu pedido no ITEM 244. Formulário: nome e prazo do laudo, etiqueta da fruta e, no passo 2, razão social, CNPJ, contato, rua e número, bairro, CEP, cidade, UF e o conteúdo da caixa. CNPJ e CEP ganham pontos e traço sozinhos. O endereço passa a ser editado num lugar só: o lápis de Coletas › Envio › Laboratórios abre este mesmo cadastro, e Esc volta para o Envio.',
   lado(A('pc-lab-novo', 'ANTES (aprovado sem o endereço)'), um('pc-lab-novo', 'AGORA')) + lado(um('pc-lab-gaveta', 'AGORA: gaveta do laboratório'), um('esc-pc-lab-novo', 'AGORA no tema Escuro'), cls='lado') + lado(um('cel-lab-novo', 'Celular'), um('esc-cel-lab-novo', 'Celular, Escuro'), cls='lado cels'))
it(254, 'Fazenda com cadastro completo e sem o prefixo à vista',
   'Seu pedido no ITEM 246. A tabela mostra fazenda, unidade, cidade, talhões e situação; o prefixo sumiu da tabela, da gaveta e da edição. Ele só aparece uma vez, ao criar uma fazenda nova, como "Letras do código dos talhões": é ele que liga cada talhão à fazenda e ao remetente do rótulo. Formulário com CNPJ, contato, rua e número, bairro, CEP, cidade e UF.',
   lado(A('pc-fazendas', 'ANTES (aprovado com o prefixo)'), um('pc-fazendas', 'AGORA')) + lado(um('pc-fazenda-nova', 'AGORA: nova fazenda'), um('pc-fazenda-gaveta', 'AGORA: gaveta'), cls='lado') + lado(um('cel-fazenda-nova', 'Celular'), cls='lado cels'))

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
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.40 · Cadastros, 2ª rodada</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.40 · 2ª rodada</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Cadastros de Coletas: o que você pediu</h1><p class="sub">Só o que mudou depois das suas respostas de 27/11 05:31. Os ITENS aprovados (239, 243, 244, 246, 247 e 248) continuam como estavam, com os acréscimos que você pediu nos ITENS 253 e 254. ANTES é a versão que você viu; AGORA é a de agora, rodando de verdade com dados inventados. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in ITENS) +
       '<div class="fim"><h2>Conferido antes desta página</h2><ul><li>Auditoria visual do Método Sabiá: medidor sem defeitos (agora também abre os Cadastros); alinhamento medido em todos os formulários, PC e celular; temas Claro e Escuro.</li><li>Teste da versão: 60 conferências passando. Bateria inteira: 77 de 79 passam; as 2 que falham já falhavam antes (data do calendário e o clone antigo do EFCdocs).</li><li>Nenhum nome da empresa no código; nenhum dado entra na tela sem proteção.</li></ul>'
       '<h2>O que não deu para provar</h2><ul><li>Gravar no Firebase de verdade (o modo demonstração segue as mesmas regras de quem pode).</li><li>iPhone e Safari.</li></ul>'
       '<h2>Depois da sua resposta</h2><ul><li>Se tudo passar: subo a versão para 0.6.40, rodo tudo de novo e espero o "pode publicar".</li><li>Firebase: nada a configurar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + VJS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.40b-cadastros-2a-rodada.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
