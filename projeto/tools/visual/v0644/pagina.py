# Monta a página de aprovação da etapa 4 (Cwork v0.6.44 + Vértice v0.6.79, kit do laboratório) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0644/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0644-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Cwork v0.6.44 + Vértice v0.6.79 · kit do laboratório (etapa 4)'")
assert 'efcwork-v0644-respostas' in JS and 'etapa 4' in JS

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

DEC = ' suas respostas de 27/11, 15:24 (até dois papéis; você mesmo troca o que já está anexado; PDF de fora e liberdade para anexar qualquer um).'
its = [
  item(280, 'Anexar papel: os documentos do Vértice entram na lista',
       ['Em Coletas › Envio › Laboratórios › Anexar papel, a lista mostra as planilhas do Vértice das 5 pastas (com a pasta escrita na frente) e, depois, tudo o que está em Documentos › Impressos (PDF de fora e o resto), para você ter liberdade de anexar qualquer um.',
        'Do Vértice, o Cwork guarda só a ligação: nada é copiado. Versão nova no Vértice já vale no próximo envio.'],
       [([('hoje-kit-anexar.png', 'HOJE · só o que foi compartilhado para Impressos', False), ('pc-kit-anexar.png', 'PROPOSTA · os papéis do Vértice na lista', True)], False)], DEC),
  item(281, 'Até dois papéis de custódia ou ficha por laboratório',
       ['O tipo passa a se chamar "Cadeia de custódia ou ficha (até 2)". O segundo papel fica junto do primeiro (antes substituía). Com dois, o terceiro é recusado com o aviso para tirar um pela lixeira. O rótulo continua um só.',
        'Normalmente fica um só; o segundo é para quando o laboratório pede os dois. Laboratório sem nenhum continua como hoje.'],
       [([('hoje-kit.png', 'HOJE · gaveta do laboratório', False), ('pc-kit-dois.png', 'PROPOSTA · dois papéis do Vértice no mesmo laboratório', True)], False)], DEC),
  item(282, 'Papéis do envio: o do Vértice abre já preenchido',
       ['Na hora de imprimir os papéis da remessa, o papel do Vértice mostra "abre no Vértice já preenchido": o Cwork manda os dados do envio e o Vértice preenche só os campos que o documento tem marcados (o resto fica de fora, sem dar erro). Sai sem menus, com Baixar PDF, Imprimir e Agora não.',
        'Se o documento ainda não chegou ao Vértice deste aparelho, o aviso diz para abrir o Vértice com internet e pedir de novo.'],
       [([('pc-papeis-envio.png', 'PROPOSTA · papéis do envio', True), ('pc-pedido-vertice.png', 'PROPOSTA · o pedido aberto no Vértice', True)], False)], DEC),
  item(283, 'O que já está anexado fica como está',
       ['Nada muda sozinho: os papéis já anexados (vindos de Impressos) continuam funcionando. Você troca cada um pelo do Vértice quando quiser: lixeira no papel antigo e "Anexar papel".'],
       [([('hoje-kit.png', 'O kit continua como você deixou', False)], False)], DEC),
]
fim = '''<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade: 14 conferências certas (anexar do Vértice, dois papéis, terceiro recusado, papéis do envio, pedido aceito pelo Vértice). As fotos usam os modelos de TESTE com marca d'água; nenhum documento inventado.</li>
<li>Vértice: 713 testes (1 novo). Cwork: bateria inteira; o teste antigo do kit (t_v0610) foi ajustado para a regra nova de até dois; só as falhas de sempre. Medidor: 0 defeitos.</li>
</ul><h2>O que não deu para provar daqui</h2><ul><li>Firebase de verdade e impressora de verdade. Nada novo no Firebase: a ligação grava em sv2_impressos com o campo fonte, que as regras já aceitam.</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li><li>Pendentes desta etapa: o que está em Documentos › Impressos (efd_docs) não muda de lugar (o Vértice ainda não guarda PDF); o pedido imprime todas as abas do modelo.</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>'''
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Etapa 4 · kit do laboratório</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.44 + Vértice v0.6.79 · etapa 4</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Etapa 4: o kit do laboratório com os papéis do Vértice</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.43). Os papéis das fotos são os modelos de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você decidiu</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
