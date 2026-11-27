# Monta a página de aprovação da parte 2 (Cwork v0.6.46, kit nas coletas de água) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0646/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0646-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Cwork v0.6.46 · kit nas coletas de água'")
assert 'efcwork-v0646-respostas' in JS and 'coletas de água' in JS

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

DEC = ' suas decisões de 27/11 17:22 ("sim, o kit também nas coletas de água, eles também são enviados") e o CONTINUAR (parte 2).'
H, P = 'hoje/', 'proposta/'
its = [
  item(287, 'Remessa de água: coletas do mesmo envio e do mesmo laboratório',
       ['A coleta de água guarda o envio e o laboratório em cada coleta, sem remessa própria. Agora o Cwork junta numa remessa de água as coletas enviadas no mesmo dia para o mesmo laboratório (como a remessa do campo). Nada novo é gravado na coleta: é só uma forma de juntar. Cancelada não entra.',
        'No detalhe da coleta enviada aparece "Ver a remessa (N coletas)". Coleta sem envio não mostra.'],
       [([(H + 'pc-detalhe.png', 'HOJE · a coleta não leva à remessa', False), (P + 'pc-detalhe.png', 'PROPOSTA · "Ver a remessa (4 coletas)"', True)], False)], DEC),
  item(288, 'A gaveta da remessa de água',
       ['Igual à remessa do campo: no alto, o ícone dos papéis do envio; os números (coletas, resultados, laudo previsto), a O.S, os Documentos da remessa (imprimir, abrir no Vértice, via assinada) e a lista das coletas (toque abre a coleta).',
        'No celular, os ícones do alto e as linhas têm o mesmo tamanho da remessa do campo (já era assim).'],
       [([(P + 'pc-remessa.png', 'PROPOSTA · PC, Claro', True), (P + 'pc-remessa-escuro.png', 'PROPOSTA · PC, Escuro', True)], False), ([(P + 'cel-remessa.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(289, 'Papéis deste envio: o mesmo kit do laboratório',
       ['O ícone abre a mesma janela do campo, com o kit daquele laboratório (Envio › Laboratórios): o rótulo do endereço e a cadeia de custódia ou ficha (até 2). Com 2 ou mais análises na remessa, pergunta "Como preencher" (uma ficha por análise ou tudo numa só), como você aprovou no ITEM 285.',
        'Os dados sugeridos vêm das coletas: amostras = número de coletas da remessa; análises e pontos juntos.'],
       [([(P + 'pc-papeis.png', 'PROPOSTA · PC', True)], False), ([(P + 'cel-papeis.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(290, 'Os dados de cada amostra de água vão para o Vértice',
       ['Para cada coleta: data, hora, ponto (identificação), análise, coletor, O.S, observação e material Água; no grupo, "X se for Água" (grupo.xagua). Uma folha por análise, só com as coletas dela.',
        'No exemplo: 3 de MICROBIOLÓGICA e 1 de METAIS viram duas folhas. O modelo é de TESTE, com marca d\'água (uma grade com o nome de cada campo); nenhuma cadeia inventada.'],
       [([(P + 'pc-pedido.png', 'PROPOSTA · duas folhas de Água no Vértice', True)], False)], DEC),
  item(291, 'O que você escreve à mão',
       ['Código do frasco, matriz, nº de frascos, preservação e medidas de campo ficam para escrever na folha aberta ("Escrever nesta folha"), nas células que o modelo deixa liberadas. Nada fica gravado no modelo.'],
       [([(P + 'pc-escrever.png', 'PROPOSTA · folha preenchida com o que foi escrito à mão', True)], False)], DEC),
  item(292, '"Papéis" no aviso depois de informar o envio',
       ['No campo, os papéis abrem sozinhos depois de Enviar. Na água o envio é informado coleta por coleta; abrir sozinho a cada uma atrapalharia. Por isso o aviso "Envio salvo." ganha o botão "Papéis", que abre os papéis da remessa daquela coleta. Decisão minha: se preferir que abra sozinho, diga no comentário.'],
       [([(H + 'pc-aviso.png', 'HOJE · só "Envio salvo."', False), (P + 'pc-aviso.png', 'PROPOSTA · "Envio salvo." com o botão Papéis', True)], False)], 'decisão minha, para você confirmar.'),
  item(293, 'Correção junto: a situação não é mais cortada na lista da remessa',
       ['Na lista de amostras da remessa (campo e água), com nome comprido a situação era cortada ("Aguardand"). Agora o nome é que encolhe com reticências e a situação aparece inteira. Defeito antigo, achado na auditoria visual.'],
       [([(H + 'cel-campo.png', 'HOJE · "Aguardand" cortado', False), (P + 'cel-campo.png', 'PROPOSTA · "Aguardando laudo" inteiro', True)], True)], 'auditoria visual desta etapa.'),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade (t_v0646): 28 conferências certas, PC e celular, Claro e Escuro (remessa sem a cancelada e sem as de outro dia; dados de cada amostra; o pedido passa no conferente do contrato; duas folhas de Água no Vértice; escrever à mão; registro separado do campo; a remessa do campo com a mesma chave de antes; campos alinhados; sem erro de JavaScript).</li>
<li>Cwork: bateria de 86 arquivos, só as falhas de sempre (t_v067 data; t_v0636v clone antigo). Medidor --estrito: 0 defeitos, 73 ajustes (igual à base). Nada muda no Firebase.</li>
</ul><h2>Pergunta (não feito)</h2><ul><li>Quer as remessas de água também na tabela Coletas › Envio › Remessas (junto com as do campo, coluna Materiais = Água)? Hoje elas se abrem pela coleta.</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kit nas coletas de água</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.46 · kit nas coletas de água</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>O kit e os papéis do envio nas coletas de água</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.45). O modelo das fotos é de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você decidiu</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
