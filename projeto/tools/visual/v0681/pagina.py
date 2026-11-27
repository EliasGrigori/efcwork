# Monta a página de aprovação do Vértice v0.6.81 (sobras da integração) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0681/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'vertice-v0681-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Vértice v0.6.81 · sobras da integração'")
assert 'vertice-v0681-respostas' in JS and 'sobras da integração' in JS

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

DEC = ' suas respostas de 27/11 19:0x (as sobras da integração).'
H, P = 'hoje/', 'proposta/'
its = [
  item(294, 'O pedido do Cwork imprime só a aba com campos',
       ['Quando o Cwork pede a ficha de uma remessa, sai só a aba em que você marcou os campos do Cwork. Uma aba a mais na planilha (ex.: "Instruções") não sai mais junto. Se nenhuma aba tiver campos, sai a primeira. "Escrever nesta folha" abre a aba dos campos.',
        'No exemplo de TESTE (com marca d\'água): uma aba de instruções antes da aba dos campos. Antes saíam 2 páginas; agora sai 1.'],
       [([(H + 'pc-pedido-abas.png', 'HOJE · 2 páginas (a aba de instruções sai junto)', False), (P + 'pc-pedido-abas.png', 'PROPOSTA · 1 página, só a aba dos campos', True)], False)], DEC),
  item(295, '"Recebidos do Cwork": aviso e botão Mover',
       ['Na sub-aba Recebidos do Cwork aparece o aviso de que esses modelos ficam só neste aparelho, e cada linha ganha o botão "Mover" (só para quem salva: Principal e Líder ★). Ele abre a escolha da pasta já numa das 5 pastas; depois de mover, o modelo sobe para a nuvem como os outros.',
        'Correção junto: a coluna Nuvem dizia "Subindo para a nuvem" para esses modelos, que nunca sobem. Agora diz "Só neste aparelho".'],
       [([(H + 'pc-recebidos.png', 'HOJE · sem aviso; Nuvem dizia "Subindo"', False), (P + 'pc-recebidos.png', 'PROPOSTA · aviso, Mover e "Só neste aparelho"', True)], False), ([(P + 'pc-mover.png', 'PROPOSTA · Mover abre a escolha da pasta', True)], False)], DEC),
  item(296, 'O Vértice segue o tema do Cwork; no Escuro, a planilha fica branca',
       ['Aberto pelo Cwork, o Vértice usa o mesmo Claro/Escuro do Cwork e troca junto quando você troca no Cwork. Aberto sozinho, continua com o tema dele.',
        'No Escuro, a área de preencher da planilha fica branca como no Excel; o resto (barras, menus) fica escuro.'],
       [([(H + 'pc-tema-escuro.png', 'HOJE · Cwork no Escuro, Vértice no Claro', False), (P + 'pc-tema-escuro.png', 'PROPOSTA · Vértice no Escuro, planilha branca', True)], False)], DEC),
  item(297, 'O quadro também fica branco no Escuro',
       ['A área do quadro (post-its, fluxograma) fica branca no tema escuro, como a planilha. O Word ainda não existe no Vértice (chega na versão 0.7.0 dele); quando chegar, segue a mesma regra.'],
       [([(H + 'pc-quadro-escuro.png', 'HOJE · quadro escuro', False), (P + 'pc-quadro-escuro.png', 'PROPOSTA · quadro com a área branca', True)], False)], DEC),
  item(298, 'Você escolhe: "Área de trabalho escura no tema escuro"',
       ['Em Opções (a engrenagem do Vértice) › Tema, a chave nova "Área de trabalho escura no tema escuro". Desligada (o padrão), planilha e quadro ficam brancos; ligada, ficam escuros. Vale dentro e fora do Cwork.',
        'Dentro do Cwork, os botões Claro/Escuro das Opções mostram o tema do Cwork e ficam parados (troca-se no Cwork). O resumo diz "Escuro (do Cwork)".'],
       [([(H + 'pc-opcoes-area.png', 'HOJE · Opções sem a chave; marca Claro', False), (P + 'pc-opcoes-area.png', 'PROPOSTA · a chave nova, desligada', True)], False), ([(P + 'pc-tema-area-escura.png', 'PROPOSTA · ligada: a planilha fica escura', True)], False)], DEC),
  item(299, 'Imprimir pela folha aberta também conta como "Preenchido no Vértice"',
       ['Explicando com a imagem: quando você imprime pelo botão "Escrever nesta folha", o Cwork agora recebe o aviso e guarda o registro "Preenchido no Vértice" (com os dados que foram para a folha), igual ao Imprimir do pedido. Aparece a mensagem embaixo da tela. Antes não ficava registro nenhum.',
        'Os passos do papel na gaveta (Abrir no Vértice · Imprimir · Via assinada) ficam iguais; o que muda é o registro guardado. Com uma folha só, o pedido também sai da caixa do Vértice (antes ele ficava avisando "O Cwork pediu para imprimir").'],
       [([(H + 'pc-remessa-preenchido.png', 'HOJE · sem a mensagem e sem registro', False), (P + 'pc-remessa-preenchido.png', 'PROPOSTA · "Preenchido no Vértice" registrado', True)], False)], DEC),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade (t_v0681v): 17 conferências certas (1 página com a aba dos campos; folha aberta na aba certa; "Preenchido" registrado; pedido sai da caixa; aviso e Mover; pasta certa; Vértice no Escuro com planilha e quadro brancos; troca junto com o Cwork; chave da área escura; sem erro de JavaScript). Modelos de TESTE com marca d'água; nenhum documento inventado.</li>
<li>Vértice: 722 testes (5 novos) e as 5 auditorias do Método Sabiá sem piorar nada. Cwork: bateria de 87 arquivos, só as falhas de sempre. O Cwork não mudou (segue v0.6.46); só o Vértice sobe para v0.6.81.</li>
</ul><h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sobras da integração</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Vértice v0.6.81 · sobras da integração</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>As sobras da integração Cwork e Vértice</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.46 + Vértice v0.6.80). O modelo das fotos é de TESTE, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você decidiu</p>' + ''.join(its) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
