# Monta a página de aprovação da v0.6.47 + Vértice v0.6.82 (documentos só no Vértice, 1ª parte), com o visual da página da v0.6.41.
# Uso: python3 tools/visual/v0647/pagina.py <pasta das fotos (hoje/ e proposta/)> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0647-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas EFCwork v0.6.47 + Vértice v0.6.82 · documentos só no Vértice (1ª parte)'")
assert 'efcwork-v0647-respostas' in JS and 'documentos só no Vértice' in JS

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

DEC = ' sua decisão de 27/11 06:59 (todo documento mora só no Vértice) e respostas de 27/11 21:2x (antigos com botão um por um; importar nos dois; foto de papel vira PDF; duas versões).'
H, P = 'hoje/', 'proposta/'
its = [
  item(300, 'Importar no Cwork: o PDF vai para o Vértice',
       ['Em Documentos › Impressos, "Importar" aceita PDF ou a foto de um papel (vira PDF de uma página). O arquivo é guardado no Vértice Docs, na pasta escolhida; no Cwork fica só a ligação.',
        'A pasta é uma das 5 do Vértice (sem "Outra pasta…"). Excel e Word entram pelo Vértice (lá, Abrir do Excel): o Cwork avisa. Link continua como antes. O limite do PDF sobe de 3,2 MB para 15 MB.'],
       [([(H + 'pc-importar.png', 'HOJE · PDF, foto, Excel ou Word guardados no Cwork', False), (P + 'pc-importar.png', 'PROPOSTA · PDF ou foto, vai para o Vértice, só as 5 pastas', True)], False)], DEC),
  item(301, 'Os Impressos mostram os documentos do Vértice',
       ['A tabela dos Impressos traz os documentos do Vértice (PDF, planilha, quadro) das 5 pastas, com Formato, Editado por, Data e Versão, e uma coluna nova "Guardado" (Vértice ou Cwork).',
        'A lista vem da nuvem do Vértice ao abrir a aba (uma vez por minuto). Versão nova feita no Vértice já aparece aqui, sem reenviar nada.'],
       [([(H + 'pc-lista.png', 'HOJE · o PDF fica guardado no Cwork', False), (P + 'pc-lista.png', 'PROPOSTA · Guardado: Vértice', True)], False)], DEC),
  item(302, 'O PDF do Vértice: ver, imprimir, baixar e trocar',
       ['Tocar no PDF abre a gaveta com a folha (no PC), "Ver o PDF" (no celular), Imprimir, Baixar o PDF e, para o Administrador e o Líder ★, o lápis "Trocar pela versão nova" e "Abrir no Vértice".',
        'Depois da primeira vez, o PDF fica guardado no aparelho e imprime sem internet (como os impressos de antes). A impressão vai para a Atividade com a versão.'],
       [([(H + 'pc-gaveta.png', 'HOJE · papel guardado no Cwork', False), (P + 'pc-gaveta.png', 'PROPOSTA · documento do Vértice', True)], False), ([(P + 'cel-gaveta.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(303, 'Planilha e quadro do Vértice abrem em modo documento',
       ['Ficha, custódia ou formulário feito no Vértice aparece nos Impressos com Formato Planilha (ou Quadro). "Abrir" leva ao Vértice só com a folha dele: escreve só nas células liberadas e imprime; nada é gravado (o modo documento já aprovado na etapa 2).'],
       [([(P + 'pc-planilha-gaveta.png', 'PROPOSTA · gaveta da planilha do Vértice', True)], False)], DEC),
  item(304, 'Os antigos continuam, marcados "Cwork"',
       ['O que já está guardado no Cwork (PDFs, fotos, Excel, links) continua funcionando como hoje, com "Guardado: Cwork". Na 2ª versão cada um ganha o botão "Levar para o Vértice" para você mover um por um (sua resposta de 21:2x). O kit e os Treinamentos também ficam para a 2ª versão.'],
       [([(P + 'pc-antigo-cwork.png', 'PROPOSTA · antigo (Cwork) e novo (Vértice) na mesma tabela', True)], False)], DEC),
  item(305, 'No Vértice: Documentos externos pronto',
       ['A página "Documentos externos" do Vértice deixa de ser "em breve": lista os PDFs separados pelas 5 pastas (as mesmas sub-abas dos Documentos internos), com Código, Nome, Alterado em e Nuvem. O PDF não aparece mais em Documentos internos.'],
       [([(H + 'pc-vertice-externos.png', 'HOJE · "Chega na v0.8.0"', False), (P + 'pc-vertice-externos.png', 'PROPOSTA · os PDFs por pasta', True)], False)], DEC),
  item(306, 'No Vértice: Importar PDF, ver e trocar',
       ['"Importar PDF" pede o arquivo (PDF ou foto), o nome e a pasta; sobe para a nuvem e aparece no Cwork. Tocar no PDF abre a folha na tela, com Baixar, Imprimir e (quem salva) "Trocar pela versão nova".',
        'A Pasta usa a lista simples do Vértice, igual à janela de sub-aba que já existe lá. Observação do teste: o navegador sem tela daqui não desenha PDF, por isso a folha aparece em branco na foto; no Chrome de verdade aparece o documento.'],
       [([(P + 'pc-vertice-importar.png', 'PROPOSTA · Importar PDF', True), (P + 'pc-vertice-ver.png', 'PROPOSTA · ver o PDF (folha em branco só no teste)', True)], False)], DEC),
  item(307, 'Colaborador: só as pastas liberadas, sem trocar',
       ['Quem não é Administrador nem Líder ★ vê só os documentos das pastas liberadas em Administração › Pastas do Vértice; imprime e baixa, mas não importa, não troca e não abre o Vértice inteiro.'],
       [([(P + 'pc-colaborador.png', 'PROPOSTA · Colaborador com a pasta Formulários liberada', True)], False)], DEC),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade (t_v0647): 35 conferências (importar PDF e foto no Cwork e no Vértice, SHA-256 igual, versão nova, nada novo no Cwork, só os campos que as regras aceitam, planilha em modo documento, Colaborador por pasta, celular 44 px, sem erro de JavaScript). PDFs de TESTE com marca d'água.</li>
<li>Vértice: 728 testes (6 novos) e as 5 auditorias do Método Sabiá sem piorar nada. Cwork: bateria de 89 arquivos, só as 2 falhas de sempre; medidor 0 defeitos; tema Escuro, PC e celular conferidos.</li>
<li><b>Firebase: nada muda.</b> As regras da nuvem do Vértice (v0.6.36) já aceitam o tipo novo.</li>
</ul><h2>Não deu para provar daqui</h2><ul><li>A folha do PDF na tela (o navegador sem tela não desenha PDF); impressora de verdade; Android; a nuvem real.</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar". A 2ª versão (botão "Levar para o Vértice", kit e Treinamentos com o PDF do Vértice) começa só com o seu "pode iniciar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Documentos só no Vértice</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>EFCwork v0.6.47 + Vértice v0.6.82 · documentos só no Vértice</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Documentos só no Vértice · 1ª parte</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.46.2 + Vértice v0.6.81). Os PDFs das fotos são de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que muda</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
