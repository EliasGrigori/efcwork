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
JS = re.search(r'\nJS = r"""(.*?)"""', ANT, re.S).group(1).replace("'efcwork-v0635b-respostas'", "'efcwork-v0640-respostas'").replace('Respostas EFCwork v0.6.35 · tela inteira, tarefas e filtro', 'Respostas EFCwork v0.6.40 · cadastros de coletas')
assert 'efcwork-v0640-respostas' in JS

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

it(239, 'Aba Cadastros: uma lista retrátil escolhe o cadastro',
   'Hoje a aba só tem Pontos de água e manda o resto para o EFClaudian. Proposta: no alto, a lista retrátil (como Remessas | Laboratórios no Envio) troca entre Talhões, Análises, Laboratórios, Tipos de coleta, Fazendas e Pontos de água; ao lado, o botão "Novo …" do cadastro escolhido. Embaixo, a tabela de sempre, com os menus de coluna, ativos em cima e desativados no fim.',
   lado(um('hoje-pc', 'HOJE'), um('pc-talhoes', 'PROPOSTA')) + lado(um('pc-lista-aberta', 'A lista retrátil aberta'), filme('filme-trocar', 'Em movimento: trocar de cadastro e abrir o formulário'), cls='lado') + lado(um('cel-talhoes', 'Celular'), cls='lado cels'))
it(240, 'Talhões: tabela e gaveta',
   'Colunas: código, fazenda (pelo prefixo do código), pivô, cultura, variedade, hectares (total no alto) e situação. Tocar no talhão abre a gaveta com os pontos por hectare (os do tipo de coleta, ou os só dele) e quantas amostras tem. Lápis e lixeira no canto.',
   lado(um('pc-talhao-gaveta', 'Gaveta do talhão')))
it(241, 'Talhão: formulário, com o código travado depois de criado',
   'Novo talhão: código, pivô, cultura, variedade, hectares e, se este talhão for diferente, pontos por hectare de solo, folha e fruta. O código é o que liga as amostras e os planos: depois de criado, aparece travado. Barra código repetido e prefixo sem fazenda. Cultura e variedade sugerem as que já existem.',
   lado(um('pc-talhao-novo', 'Novo talhão'), um('pc-talhao-editar', 'Editar: código travado')) + lado(um('cel-talhao-novo', 'Celular'), cls='lado cels'))
it(242, 'Análises: tabela e formulário',
   'Colunas: material, análise, sigla, laboratório, valor e situação. Formulário: material e laboratório em listas retráteis, nome, sigla (entra na etiqueta completa) e valor. Mudar o valor guarda um preço novo: as amostras já lançadas ficam com o preço da época.',
   lado(um('pc-analises', 'Tabela'), um('pc-analise-nova', 'Nova análise')))
it(243, 'Análises: Reajustar preços',
   'Ícone na barra da tabela de Análises. Escolhe o laboratório e o material (ou todos), digita a porcentagem e vê antes e depois de cada análise. Um toque reajusta todas juntas (ou nenhuma, se cair a internet).',
   lado(um('pc-reajuste', 'Reajustar preços')))
it(244, 'Laboratórios: tabela e formulário',
   'Colunas: laboratório, cidade, prazo do laudo, etiqueta da fruta (simples ou completa), análises ativas e situação. Formulário: nome (travado depois de criado), prazo do laudo em dias e etiqueta. Endereço e kit de impressão continuam onde estão, em Coletas › Envio › Laboratórios.',
   lado(um('pc-labs', 'Tabela'), um('pc-lab-novo', 'Novo laboratório')))
it(245, 'Tipos de coleta: tabela e formulário',
   'Colunas: tipo, que amostras gera (SOLO+RAIZ gera Solo + Nematoide), profundidades, pontos por hectare e situação. Formulário: nome (travado depois de criado, porque liga planos e programações), materiais que gera, profundidades e pontos por hectare.',
   lado(um('pc-tipos', 'Tabela'), um('pc-tipo-novo', 'Novo tipo')))
it(246, 'Fazendas: tabela e formulário',
   'Colunas: prefixo, fazenda, unidade (matriz ou filial: o remetente do rótulo do envio), talhões ativos e situação. Formulário: prefixo (travado depois de criado; são as letras do começo do código do talhão), nome, unidade e número.',
   lado(um('pc-fazendas', 'Tabela'), um('pc-fazenda-nova', 'Nova fazenda')))
it(247, 'Pontos de água: na mesma tabela dos outros cadastros',
   'Hoje é uma lista solta, com título colado no texto e "1 pontos". Proposta: a mesma tabela (ponto, tipo, local, situação). Tocar no ponto abre o formulário que já existe; nada muda nos dados.',
   lado(um('hoje-pc', 'HOJE'), um('pc-pontos', 'PROPOSTA')))
it(248, 'Desativar com motivo, reativar; só Líder ★ e Administrador alteram',
   'Nada se apaga: a lixeira no canto da gaveta desativa com motivo e avisa se ainda está em uso (ex.: talhão num plano de coleta ativo). O desativado vai para o fim da tabela e ganha "Reativar". Colaborador e Consulta veem as tabelas, sem "Novo", lápis ou lixeira. Tudo vai para a Atividade.',
   lado(um('pc-desativar', 'Desativar talhão que está num plano')))

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
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EFCwork v0.6.40 · Cadastros de Coletas</title><style>' + CSS + EXTRA + '</style></head><body>'
       '<div class="topo"><div class="topo-in"><b>EFCwork v0.6.40</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Cadastros de Coletas</h1><p class="sub">Talhões, análises, laboratórios, tipos de coleta e fazendas passam a ser feitos no Cwork (sua decisão de 27/11: o Cwork é o foco). Mesmos dados do Firebase, nenhuma coleção nova, nenhuma regra nova. As telas seguem o padrão já aprovado dos Cadastros do Almoxarifado. Fotos e vídeo do protótipo rodando de verdade, com dados inventados. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha). O vídeo toca sozinho.</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       + ''.join(item_html(x) for x in ITENS) +
       '<div class="fim"><h2>Vai junto, sem mudar a tela</h2><ul><li>Os avisos "cadastre no EFClaudian" (Programação, Plano de coleta, Água) passam a dizer "Coletas › Cadastros".</li><li>Teste novo da versão: 36 conferências (criar, editar, travas, desativar, reativar, reajuste, quem pode, celular).</li></ul>'
       '<h2>O que não deu para provar</h2><ul><li>Gravar no Firebase de verdade (testei no modo demonstração, que segue as mesmas regras de quem pode).</li><li>iPhone e Safari.</li></ul>'
       '<h2>Uma pergunta</h2><ul><li>Alguém ainda cadastra pelo EFClaudian? Se sim, os dois continuam funcionando juntos (mesmos dados). Se ninguém usa, nada muda aqui.</li></ul>'
       '<h2>Referências</h2><ul class="rf">' + ''.join('<li><a href="%s" target="_blank" rel="noopener">%s</a>: %s</li>' % (u, html.escape(t), html.escape(d)) for u, t, d in REFS) + '</ul>'
       '<h2>Depois da sua resposta</h2><ul><li>Aplico só o aprovado, rodo todos os testes e o medidor, e espero o "pode publicar".</li><li>Firebase: nada a configurar.</li></ul>'
       '<button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado" aria-live="polite"></p><textarea id="saida" rows="8" hidden></textarea></div></main>'
       '<script>' + VJS + JS + '</script></body></html>')
saida = os.path.join(R, 'docs/aprovacao-efcwork-v0.6.40-cadastros-coletas.html')
open(saida, 'w').write(pag)
print(saida, round(len(pag) / 1024), 'KB', len(ITENS), 'itens')
