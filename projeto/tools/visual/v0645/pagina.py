# Monta a página de aprovação da etapa 4 (Cwork v0.6.44 + Vértice v0.6.79, kit do laboratório) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0645/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0645-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Cwork v0.6.45 + Vértice v0.6.80 · fichas com todos os dados'")
assert 'efcwork-v0645-respostas' in JS and 'todos os dados' in JS

def foto(nome, larg=1400):
    p = os.path.join(IMG, nome)
    if not os.path.exists(p): p = p[:-4] + '.webp'
    im = Image.open(p).convert('RGB')
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def fig(nome, cap, prop=True):
    a = html.escape(cap)
    return f'<figure class="{"prop" if prop else ""}"><figcaption>{a}</figcaption><button type="button" class="zoom" aria-label="Ampliar: {a}"><img src="{foto(nome)}" alt="{a}"></button></figure>'

def item(n, titulo, texto, figs, ref='', cel=False):
    t = html.escape(titulo)
    corpo = ''.join(f'<p>{p}</p>' for p in texto)
    r = f'<p class="ref"><b>De onde vem:</b>{ref}</p>' if ref else ''
    grade = ''.join(f'<div class="lado{" cels" if c else ""}">' + ''.join(fig(*f) for f in grupo) + '</div>' for grupo, c in figs)
    return (f'<section class="it" data-n="{n}" data-t="{t}"><div class="seg"><div class="num">ITEM<span>{n}</span></div><div class="cab"><h3>{t}</h3>{corpo}{r}</div></div>'
            f'{grade}<div class="resp"><div class="voto"><input type="radio" id="r{n}_a" name="r{n}" value="Aprovado"><label for="r{n}_a" class="ok">Aprovado</label>'
            f'<input type="radio" id="r{n}_r" name="r{n}" value="Reprovado"><label for="r{n}_r" class="no">Reprovado</label></div>'
            f'<label class="com">Comentário (opcional)<textarea id="c{n}" rows="2"></textarea></label></div></section>')

DEC = ' suas decisões de 27/11, 16:58 a 17:22 (todos os dados das amostras; você escolhe a célula; uma ficha por análise; escrever à mão).'
its = [
  item(284, 'Campos do Cwork: todos os dados para você escolher a célula',
       ['No Vértice, em Arquivo › Campos do Cwork, entram: o grupo "Análise da folha" (Material, Tipo de análise, Quantidade de amostras e "X se for Solo", "X se for Folha"… para a célula do X de cada material, como na ficha do IBRA) e, na Lista de amostras, as colunas Material, Profundidade, Estádio, Coletor, O.S e Observação (além de Data, Hora, Identificação, Análise, Ponto, Talhão).',
        'O limite passou de 32 para 60 campos por documento. É o acordo novo entre o Cwork e o Vértice que você autorizou: só acrescenta; o que já estava marcado continua igual.'],
       [([('hoje-pc-campos-grupo.png', 'HOJE · os campos novos não existem (o Vértice avisa que não são do Cwork)', False), ('pc-campos-grupo.png', 'PROPOSTA · Análise da folha e o X de cada material', True)], False)], DEC),
  item(285, 'Uma folha por material + análise',
       ['Na remessa, o Cwork junta as amostras de mesmo material e mesma análise. Para o papel do Vértice, sai uma folha do mesmo modelo para cada grupo, com o material, a análise, a quantidade, o X no material e só as amostras dele (numeradas de 1 de novo). Uma análise só: uma folha, como hoje.',
        'No exemplo: 4 de FISICOQUIMICA e 2 de QUÍMICA + CLORO viram duas folhas.'],
       [([('hoje-pc-pedido-folhas.png', 'HOJE · uma folha com as 6 amostras misturadas', False), ('pc-pedido-folhas.png', 'PROPOSTA · uma folha por análise', True)], False)], DEC),
  item(286, '"Escrever nesta folha": a folha preenchida aberta para escrever à mão',
       ['Cada folha tem "Escrever nesta folha" (com uma folha só, o botão "Escrever" no alto). Abre a folha já preenchida no modo documento: você escreve nas células liberadas (código do frasco, matriz, nº de frascos, preservação, medidas de campo…) e imprime dali. Nada fica gravado no modelo.',
        'Observação: imprimindo pela folha aberta, o Cwork não recebe o aviso de "preenchido" (só quando imprime pelo pedido). Se quiser, eu acrescento isso depois.'],
       [([('pc-folha-escrever.png', 'PROPOSTA · folha 2 preenchida, com o que foi escrito à mão', True)], False)], DEC),
]
fim = '''<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade: 12 conferências certas (grupos, quantidade, X do material, só as amostras de cada folha, o pedido passa no conferente do contrato, duas folhas no Vértice, escrever à mão, modelo sem mudança). Modelo de TESTE com marca d'água; nenhum documento inventado.</li>
<li>Vértice: 717 testes (4 novos; 2 antigos ajustados ao acordo novo). Contrato igual nos dois lados (103 conferências). Cwork: bateria inteira, só as falhas de sempre. Medidor: 0 defeitos.</li>
</ul><h2>Parte 2 (depois desta)</h2><ul><li>O kit e os papéis do envio também nas coletas de água (você disse sim às 17:22).</li><li>As cadeias em Word continuam em espera.</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>'''
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fichas com todos os dados</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.45 + Vértice v0.6.80 · fichas com todos os dados</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Fichas e cadeias com todos os dados das amostras</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.44). O modelo das fotos é de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você decidiu</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
