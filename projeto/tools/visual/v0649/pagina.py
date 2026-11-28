# Monta a página de aprovação da v0.6.49 + Vértice v0.6.84 (PDF preenchido de volta, ITEM 184), com o visual da página da v0.6.41.
# Uso: python3 tools/visual/v0649/pagina.py <pasta das fotos (hoje/ e proposta/)> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0649-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas EFCwork v0.6.49 + Vértice v0.6.84 · PDF preenchido de volta'")
assert 'efcwork-v0649-respostas' in JS and 'PDF preenchido de volta' in JS

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

DEC = ' ITEM 184 (aprovado em 21/11: o Vértice devolve o PDF preenchido) e a nova versão do acordo entre os dois apps, autorizada em 27/11 17:22.'
H, P = 'hoje/', 'proposta/'
its = [
  item(315, 'O PDF preenchido volta para a remessa',
       ['Ao imprimir o pedido no Vértice ("Imprimir" na tela do pedido ou na folha aberta), o Vértice manda de volta o PDF da cópia preenchida. O Cwork guarda esse PDF na remessa, junto do registro "Preenchido no Vértice".',
        'Na gaveta da remessa, o papel ganha o botão do PDF (com a data). Ele abre em qualquer aparelho, mesmo sem o Vértice, como a via assinada. A via assinada continua igual e aparece primeiro.'],
       [([(H + 'pc-remessa-preenchido.png', 'HOJE · só o registro, sem o PDF', False), (P + 'pc-remessa-preenchido.png', 'PROPOSTA · o botão do PDF preenchido', True)], False)], DEC),
  item(316, 'Só baixou o PDF: o Cwork sabe que não imprimiu',
       ['Quando a pessoa toca em "Baixar PDF" no Vértice em vez de "Imprimir", o papel fica "PDF preenchido no Vértice": a etapa "Imprimir" continua apagada e o PDF fica guardado na remessa. A Atividade diz "Preencheu no Vértice e baixou o PDF".',
        'Hoje o Cwork marca "Imprimir" como feito nos dois casos.'],
       [([(H + 'pc-remessa-so-pdf.png', 'HOJE · "Imprimir" aceso, sem ter impresso', False), (P + 'pc-remessa-so-pdf.png', 'PROPOSTA · "Imprimir" apagado e o PDF guardado', True)], False),
        ([(P + 'cel-remessa-so-pdf.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(317, 'PDF grande fica só no Vértice',
       ['O PDF volta até 650 KB (o mesmo limite do PDF da via assinada). Acima disso, o registro "Preenchido no Vértice" entra como hoje, sem o PDF; ele continua no Vértice. Uma ficha comum fica bem abaixo disso (a de teste deu 80 KB).',
        'Firebase: nada muda. As regras da remessa já aceitam o PDF junto do registro.'],
       [], DEC),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade (t_v0649): imprimir e baixar o PDF pelo pedido; o PDF chega na nuvem do Cwork, abre a partir dela, conta 0 cópias quando só baixou. Antes, no ar: 5 falhas. Modelo de TESTE com marca d'água.</li>
<li>Vértice: 732 testes (3 novos do acordo) e as 5 auditorias do Método Sabiá sem piorar nada. Cwork: bateria de 91 arquivos, só as 2 falhas de sempre; medidor 0 defeitos.</li>
<li><b>Firebase: nada muda.</b></li>
</ul><h2>Não deu para provar daqui</h2><ul><li>A nuvem real, a impressora de verdade, o Android e o PDF de uma ficha sua (não abro documento seu).</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDF preenchido de volta</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>EFCwork v0.6.49 + Vértice v0.6.84 · PDF preenchido de volta</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>PDF preenchido de volta (ITEM 184)</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.48 + Vértice v0.6.83). Os documentos das fotos são de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que muda</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
