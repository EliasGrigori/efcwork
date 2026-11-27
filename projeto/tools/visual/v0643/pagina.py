# Monta a página de aprovação da etapa 3 (Cwork v0.6.43 + Vértice v0.6.78, etiquetas das amostras) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0643/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0643-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Cwork v0.6.43 + Vértice v0.6.78 · etiquetas (etapa 3)'")
assert 'efcwork-v0643-respostas' in JS and 'etapa 3' in JS

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

DEC = ' sua decisão de 27/11, 07:3x ("Arquivo aberto pelo Cwork: ninguém salva nele…").'

DEC = ' seu pedido de 27/11, 11:3x ("etiquetas automáticas igual ao do Claudian") e a decisão de 06:59 (documentos só no Vértice).'
its = [
  item(272, 'Coletas › Cadastros › Modelos de etiqueta',
       ['Uma lista nova no mesmo seletor dos cadastros. Nela você liga o material (e, se quiser, um laboratório) ao modelo de etiqueta que está no Vértice, na pasta Etiquetas. É o que faz cada amostra sair no modelo certo: a mesma regra do EFClaudian (material + laboratório; sem ele, o do material para qualquer laboratório).',
        'O Cwork só guarda a ligação (sv2_cfg/coletas, o mesmo documento dos outros cadastros: nenhuma coleção nova, nenhuma regra nova). Ligar e tirar: Administrador e Líder ★. Os outros só veem a lista. Tirar a ligação é a lixeira no canto da gaveta.'],
       [([('hoje-cadastros-lista.png', 'HOJE · os cadastros', False), ('pc-cadastros-lista.png', 'PROPOSTA · "Modelos de etiqueta" na lista', True)], False),
        ([('pc-ligar-modelo.png', 'PROPOSTA · ligar: material, laboratório e o modelo do Vértice', True), ('pc-cadastros.png', 'PROPOSTA · Solo (qualquer) e Fruta (LAB FRUTA)', True)], False)], DEC),
  item(273, 'Amostras: ícone de etiqueta na barra da tabela',
       ['Imprime as etiquetas das amostras que estão na lista (com o filtro das colunas que você deixou). Água fica de fora, como no EFClaudian. Material sem modelo ligado fica de fora com aviso dizendo qual falta e onde ligar.'],
       [([('hoje-amostras.png', 'HOJE · Amostras', False), ('pc-amostras-icone.png', 'PROPOSTA · ícone de etiqueta antes de colunas, planilha e impressora', True)], False)], DEC),
  item(274, 'Remessa: ícone de etiqueta no alto da gaveta',
       ['Na gaveta da remessa (Envio), o ícone imprime as etiquetas só das amostras daquela remessa.'],
       [([('hoje-remessa.png', 'HOJE · gaveta da remessa', False), ('pc-remessa.png', 'PROPOSTA · ícone de etiqueta no alto', True)], False)], DEC),
  item(275, 'Depois de "Coletado": botão "Etiquetas" no aviso',
       ['O aviso que sobe depois de "Coletado" (e de "Coleta lançada") ganha o botão "Etiquetas", que imprime só as amostras que acabaram de entrar. Se não tocar, o aviso some como sempre.'],
       [([('hoje-coletado-aviso.png', 'HOJE · aviso depois de Coletado', False), ('pc-coletado-aviso.png', 'PROPOSTA · aviso com "Etiquetas"', True)], False)], DEC),
  item(276, 'As etiquetas prontas no Vértice, iguais às do EFClaudian',
       ['O Cwork abre uma aba do Vértice só com as folhas prontas: uma etiqueta por amostra, repetida na folha do modelo (A4 deitada, 3 × 4, 3 mm entre elas, como no EFClaudian). Cada amostra sai no modelo dela: Solo e Fruta na mesma impressão, sem editar campo nenhum. Os valores seguem as regras do EFClaudian (cultura e variedade do cadastro do talhão, data dd/mm/aaaa, "-" no que falta; cabeçalho Empresa e Local da configuração). Sem menus: impressora e três pontos (Baixar PDF). Ao lado (embaixo no celular), a lista das amostras para tirar ou pôr de volta. Nada é gravado.',
        'As fotos usam os dois modelos de TESTE, cópia fiel da etiqueta do EFClaudian com a marca d\'água "MODELO NÃO OFICIAL · SÓ PARA TESTE". Os modelos de verdade são os que você criar no Vértice. Uma diferença que fica: o Vértice desenha a letra em Helvetica; o EFClaudian usa Cambria nas linhas.'],
       [([('pc-etiquetas.png', 'PROPOSTA · Fruta completa e Solo na mesma impressão', True), ('etiqueta-teste-com-marca.png', 'PROPOSTA · a etiqueta ampliada', True)], False),
        ([('pc-etiquetas-escuro.png', 'PROPOSTA · tema escuro (a folha continua branca)', True)], False), ([('cel-etiquetas.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(277, 'No Vértice: marcar os campos da etiqueta',
       ['Para um modelo virar etiqueta automática, em Arquivo › Campos do Cwork aparece o grupo "Etiqueta da amostra" com os campos do EFClaudian (Material, Análise, Cultura, Variedade, Talhão, Profundidade, Data, Hora, Responsável, Estádio, Semana, Laboratório, Identificação, Rastreabilidade, O.S, Observações, Fertilizante, Data de fabricação) e as duas faixas do cabeçalho (Empresa e Local). Clica na célula e toca em Marcar. Num arquivo da pasta Etiquetas, esse grupo vem primeiro.'],
       [([('pc-vertice-campos-etiqueta.png', 'PROPOSTA · o modelo de Solo de teste com os 12 campos marcados', True)], False)], DEC),
  item(278, 'Correção: imagem do Excel sai como imagem ao imprimir',
       ['Defeito antigo achado ao pôr a marca d\'água: na impressão do Vértice (e no documento aberto pelo Cwork), toda imagem que veio do Excel, um logotipo num formulário por exemplo, saía como uma linha de assinatura com a palavra "Picture". Agora sai a imagem.'],
       [([('hoje-imagem-impressa.png', 'HOJE · a imagem vira linha com "Picture"', False), ('pc-imagem-impressa.png', 'PROPOSTA · a imagem aparece', True)], False)], ' achado nesta etapa (Vértice, impressão).'),
]
sug = [
  item(279, 'SUGESTÃO · campos para preencher na hora de imprimir',
       ['Como os campos manuais dos modelos do EFClaudian: se um modelo do Vértice tiver uma célula liberada que não é campo do Cwork, ao imprimir aparece ao lado um campo com o rótulo dela; o que você escrever vale para todas as etiquetas daquele modelo naquela impressão (nada é gravado).',
        'Sem foto: os dois modelos de teste são iguais ao EFClaudian e não têm essa célula, e não vou mudar a etiqueta para mostrar. Se reprovar, sai.'],
       []),
]
fim = '''<div class="fim"><h2>Conferido</h2><ul>
<li>Teste de ponta a ponta com o Cwork e o Vértice montados de verdade: 43 conferências certas (PC claro e escuro, celular 390, Colaborador, PDF, nada gravado, marca d'água em cada etiqueta de teste).</li>
<li>Vértice: 713 testes (8 novos) e as 5 auditorias do método sem piorar nada. Cwork: bateria inteira; só as falhas de sempre (t_v067 data, t_v0636v pasta publicada, t_v0633 em paralelo). Medidor: 0 defeitos, com as 2 telas novas dos Cadastros.</li>
<li>Regra registrada: nada de documento inventado; modelo de teste sempre com a marca d'água.</li>
</ul><h2>O que não deu para provar daqui</h2><ul>
<li>Firebase de verdade (a ligação grava em sv2_cfg/coletas, que as regras já deixam o Líder ★ e o Administrador gravar) e impressora de verdade.</li>
<li>Para o GitHub, o envio ainda precisa de permissão nesta sessão (foi negado no começo).</li>
</ul><h2>Para usar de verdade</h2><ul><li>No Vértice, crie a planilha da etiqueta (a sua, igual à do EFClaudian) na pasta Etiquetas e marque os campos em Arquivo › Campos do Cwork. Depois ligue em Coletas › Cadastros › Modelos de etiqueta.</li>
<li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>'''

pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Etapa 3 · etiquetas das amostras</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.43 + Vértice v0.6.78 · etapa 3</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Etapa 3: etiquetas das amostras automáticas, feitas no Vértice</h1><p class="sub">Fotos do app de verdade no modo demonstração. HOJE = o que está no ar (Cwork v0.6.42 e Vértice v0.6.77). Os modelos das fotos são de TESTE, cópia fiel do EFClaudian, com marca d\'água. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você pediu</p>' + ''.join(its) + '<p class="grupo">Sugestão minha, separada (pode reprovar sem afetar o resto)</p>' + ''.join(sug) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
