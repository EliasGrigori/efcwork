# Monta a página de aprovação da v0.6.48 + Vértice v0.6.83 (documentos só no Vértice, 2ª parte), com o visual da página da v0.6.41.
# Uso: python3 tools/visual/v0648/pagina.py <pasta das fotos (hoje/ e proposta/)> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0648-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas EFCwork v0.6.48 + Vértice v0.6.83 · documentos só no Vértice (2ª parte)'")
assert 'efcwork-v0648-respostas' in JS and '2ª parte' in JS

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

DEC = ' suas respostas de 27/11 21:2x (antigos com botão em cada um, você move um por um) e de 28/11 06:1x (Excel vai como planilha; depois de levado sai da lista e fica guardado; o backup leva o Vértice).'
H, P = 'hoje/', 'proposta/'
its = [
  item(308, 'PDF antigo: "Levar para o Vértice"',
       ['Na gaveta de um PDF (ou foto) guardado no Cwork, o botão "Abrir no Vértice" vira "Levar para o Vértice". Ele abre um formulário curto: a pasta do Vértice (uma das 5, já sugerida) e "Levar".',
        'O PDF sobe para a nuvem do Vértice como documento novo, com o mesmo código e nome. A impressão segue igual (guardado no aparelho, sem internet).'],
       [([(H + 'pc-gaveta-pdf.png', 'HOJE · "Abrir no Vértice"', False), (P + 'proposta-gaveta-antigo.png', 'PROPOSTA · "Levar para o Vértice"', True), (P + 'proposta-levar-pdf.png', 'PROPOSTA · escolhe a pasta e leva', True)], False),
        ([(P + 'proposta-celular-gaveta-antigo.png', 'PROPOSTA · celular, gaveta', True), (P + 'proposta-celular-levar.png', 'PROPOSTA · celular, formulário', True)], True)], DEC),
  item(309, 'Excel antigo vai como planilha',
       ['Para um Excel guardado no Cwork, "Levar" abre o Vértice com a planilha inteira, já na pasta escolhida, com o mesmo código e nome. Lá você confere e marca os campos do Cwork (Arquivo › Campos do Cwork), como em qualquer planilha nova.',
        'Até a planilha chegar à nuvem do Vértice, o antigo continua na lista. Quando chega, sai sozinho. Word continua indo como cópia em PDF.'],
       [([(H + 'pc-gaveta-excel.png', 'HOJE · Excel guardado no Cwork', False), (P + 'proposta-levar-excel.png', 'PROPOSTA · "Abre no Vértice como planilha"', True), (P + 'proposta-vertice-planilha.png', 'PROPOSTA · já no Vértice, em Fichas e custódias (planilha de TESTE)', True)], False)], DEC),
  item(310, 'Depois de levado, o antigo sai da lista e fica guardado',
       ['O antigo some dos Impressos e no lugar aparece o do Vértice ("Guardado: Vértice"). Ele não é apagado: fica guardado escondido no Cwork, com a anotação de para onde foi, quem levou e quando.',
        'O botão "Levar" aparece só para quem salva no Vértice (Administrador e Líder ★). Quem não salva continua vendo "Abrir no Vértice" como hoje.'],
       [([(H + 'pc-lista.png', 'HOJE · FOR-91 guardado no Cwork', False), (P + 'proposta-levar-excel.png', 'PROPOSTA · depois de levado, FOR-91 aparece só como Vértice (ao fundo)', True)], False)], DEC),
  item(311, 'Kit: anexar o PDF do Vértice e seguir o levado',
       ['Em "Anexar papel" do kit aparecem também os PDFs do Vértice ("Vértice · código · nome (PDF)"). Na saída do kit eles imprimem aqui, com as cópias pedidas.',
        'Um kit que já tinha um papel antigo que foi levado passa a usar o do Vértice sozinho, sem precisar anexar de novo.'],
       [([(H + 'pc-kit-anexar.png', 'HOJE · só os do Cwork', False), (P + 'pc-kit-anexar.png', 'PROPOSTA · com o POP do Vértice', True)], False)], DEC),
  item(312, 'Treinamentos com os documentos do Vértice',
       ['Em Qualidade › Treinamentos, a lista de POP e Material de apoio traz também os do Vértice ("Vértice · código · nome"). Tocar no documento do treinamento abre a gaveta do Vértice. Treinamento que apontava para um antigo levado passa a apontar para o do Vértice.'],
       [([(H + 'pc-treino-pop.png', 'HOJE · só os do Cwork', False), (P + 'pc-treino-pop.png', 'PROPOSTA · com o do Vértice', True)], False)], DEC),
  item(313, 'Backup, Reserva e espaço contam o Vértice',
       ['O backup do Administrador leva também os documentos do Vértice (as duas coleções da nuvem dele). A Reserva (pacote para imprimir sem o app) traz os PDFs do Vértice numa pasta "Vértice/<pasta>".',
        'O "0,1 MB de 150 MB" do topo passa a somar os documentos do Vértice. Conta só a versão atual de cada um; as versões antigas ficam guardadas na nuvem e não entram na conta.'],
       [], DEC),
  item(314, 'Cópia em conflito fica só no Vértice',
       ['Quando duas pessoas mexem no mesmo documento ao mesmo tempo, o Vértice guarda a "cópia em conflito" para você decidir. Ela não aparece nos Impressos, no kit nem nos Treinamentos do Cwork, para ninguém imprimir a errada.',
        'Também corrigido: um PDF grande trocado duas vezes seguidas não trava mais a gravação (o Cwork ajusta a versão sozinho).'],
       [], DEC),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade (t_v0648): 24 conferências (levar PDF e Excel, o antigo sai e fica guardado, Excel chega como planilha na pasta certa, kit e Treinamentos seguem o levado, Colaborador sem "Levar", backup com as coleções do Vértice, Reserva, espaço, cópia em conflito fora, celular 44 px, sem erro de JavaScript). Planilha e PDFs de TESTE com marca d'água.</li>
<li>Vértice: 729 testes e as 5 auditorias do Método Sabiá sem piorar nada. Cwork: bateria de 90 arquivos, só as 2 falhas de sempre; medidor 0 defeitos.</li>
<li><b>Firebase: nada muda.</b> Nenhuma regra nova; levar usa as mesmas gravações já aprovadas.</li>
</ul><h2>Não deu para provar daqui</h2><ul><li>A nuvem real (levar um documento de verdade), impressora, Android e o backup restaurado numa conta real.</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar". Aí você leva os antigos um por um, quando quiser.</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Documentos só no Vértice</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>EFCwork v0.6.48 + Vértice v0.6.83 · documentos só no Vértice</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Documentos só no Vértice · 2ª parte</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.47 + Vértice v0.6.82). Os documentos das fotos são de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que muda</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
