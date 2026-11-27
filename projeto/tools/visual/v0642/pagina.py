# Monta a página de aprovação da etapa 2 (Vértice v0.6.76, modo documento) com o mesmo visual da página da v0.6.41.
# Uso: python3 tools/visual/v0642/pagina.py <pasta das telas> <saída.html>
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9] if '<script>' in modelo else ''
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0642-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Vértice v0.6.76 · modo documento (etapa 2)'")
assert 'efcwork-v0642-respostas' in JS and 'etapa 2' in JS

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
its = [
  item(259, 'Aberto pelo Cwork: só a folha, sem menus',
       ['O arquivo que o Cwork abre mostra só a página do modelo: sem menu, sem faixa, sem abas de planilha. Em cima ficam só o nome, a impressora e os três pontos. Aparece só a aba que o Cwork pediu (sem pedir, a primeira visível); as outras abas do modelo não aparecem.',
        'Vale para todo mundo, inclusive o Administrador. A aba de cima do Cwork mostra o nome do documento.'],
       [([('hoje-pc-ficha.png', 'HOJE · o Vértice inteiro, com todos os menus', False), ('prop-pc-ficha.png', 'PROPOSTA · só a folha', True)], False),
        ([('hoje-cel-ficha.png', 'HOJE · celular', False), ('prop-cel-ficha.png', 'PROPOSTA · celular', True)], True)], DEC),
  item(260, 'A página na orientação do modelo',
       ['Modelo em retrato aparece em pé; modelo em paisagem aparece deitado (vem da configuração de página do próprio modelo). A folha sempre cabe na largura da tela, sem rolar para o lado; no tema escuro a folha continua branca, como o papel.',
        'No celular, a folha deitada fica pequena: ao tocar num campo, a caixa cresce para a letra ficar legível (16 px ou mais). O zoom de dois dedos não foi bloqueado, mas não testei num Android de verdade.'],
       [([('hoje-pc-etiquetas.png', 'HOJE · etiquetas no editor', False), ('prop-pc-etiquetas.png', 'PROPOSTA · etiquetas deitadas, como no papel', True)], False),
        ([('prop-cel-etiquetas.png', 'PROPOSTA · celular, claro', True), ('prop-cel-escuro-etiquetas.png', 'PROPOSTA · celular, escuro', True)], True)], DEC),
  item(261, 'Escrever só nas células liberadas',
       ['Campo para escrever = célula liberada no modelo (no Vértice: Revisão › Proteger planilha; no Excel: célula desbloqueada). Na tela elas têm um dourado bem claro com um traço embaixo; no papel isso não sai.',
        'Toque e escreva. Enter passa ao próximo campo; Esc desiste do que estava digitando. Célula com lista vira escolha da lista. Conta do modelo nunca vira campo, mas se refaz (no exemplo, Total 2 + 40 = 42). "007" continua 007; data fica como data.'],
       [([('hoje-pc-ficha.png', 'HOJE · dá para mexer em qualquer célula', False), ('pc-ficha-escrita.png', 'PROPOSTA · campos dourados; o resto não se mexe', True)], False),
        ([('cel-ficha-digitando.png', 'PROPOSTA · no celular, a caixa cresce ao tocar', True), ('cel-ficha.png', 'PROPOSTA · celular depois de escrever', True)], True)], DEC),
  item(262, 'Nada é gravado; antes de perder o que foi escrito, pergunta',
       ['O que se escreve fica só nesta tela, para imprimir: o modelo guardado no Vértice não muda, nem para o Administrador. No teste, o documento guardado ficou idêntico depois de escrever, imprimir e baixar.',
        'Se algo foi escrito e a pessoa vai sair (Atualizar documento ou carregar versão nova), aparece a pergunta e o Esc volta sem perder nada. Fechar a aba no Cwork já pergunta antes, como hoje.'],
       [([('pc-ficha-confirma.png', 'PROPOSTA · aviso antes de perder o que foi escrito', True)], False)], DEC),
  item(263, 'Impressora e três pontos: "Atualizar documento"',
       ['A impressora imprime a folha como está na tela, com o que foi escrito (Ctrl + P faz o mesmo). Nos três pontos, "Atualizar documento" abre o Vértice inteiro com todos os menus, no mesmo arquivo, para mudar de uma vírgula até trocar o documento por outro. O voltar do Vértice traz de volta à folha.',
        '"Atualizar documento" só aparece para quem salva: Administrador e Líder ★.'],
       [([('pc-ficha-menu.png', 'PROPOSTA · três pontos abertos', True), ('pc-editor-completo.png', 'PROPOSTA · depois de "Atualizar documento"', True)], False)], DEC),
  item(264, 'Modelo sem célula liberada: só para imprimir',
       ['Se o modelo não tem nenhuma célula liberada (um POP, por exemplo), a folha aparece só para ler e imprimir, com a frase "Este modelo não tem células liberadas: aqui é só para imprimir."',
        'Segui o que você escreveu em 06:59 ("editando só os campos deixados desbloqueados"). Se preferir que, sem nenhuma liberada, dê para escrever em tudo, reprove e diga.'],
       [([('pc-sem-campos.png', 'PROPOSTA · modelo sem campo', True)], False)], ' sua mensagem de 27/11, 06:59.'),
  item(265, 'Versão nova do Vértice entra sozinha',
       ['Quando o modelo muda (salvo no Vértice deste aparelho ou chegando da nuvem), a folha troca sozinha se nada foi escrito. Se algo foi escrito, aparece "Há uma versão nova deste documento" com o botão Carregar, que pergunta antes de apagar o que foi escrito.'],
       [([('pc-versao-nova.png', 'PROPOSTA · versão nova com algo escrito', True)], False)], ' sua mensagem de 27/11, 06:59 ("versão nova no Vértice atualiza automaticamente").'),
  item(266, 'Colaborador: entra só pelo documento (ITENS 195 e 196)',
       ['Quem não é Administrador nem Líder ★ vê a mesma folha, mas sem "Atualizar documento". Se tentar o endereço do editor, continua vendo só a folha; fora de um documento, não há navegação nenhuma.',
        'Hoje ele abria o Vértice inteiro e podia salvar no aparelho.'],
       [([('hoje-pc-colaborador.png', 'HOJE · Colaborador no editor inteiro', False), ('prop-pc-colaborador.png', 'PROPOSTA · Colaborador só com a folha', True)], False),
        ([('cel-menu.png', 'PROPOSTA · três pontos do Colaborador', True)], True)], ' ITENS 195 e 196, aprovados em 26/11.'),
  item(267, 'O resumo do envio continua junto da folha',
       ['Quando o kit manda os dados do envio, o painel "Resumo do envio" aparece ao lado da folha no computador e embaixo no celular, como já era no editor. "Preencher e imprimir" dele também abre sem menus e volta para a folha.'],
       [([('pc-resumo.png', 'PROPOSTA · computador', True), ('cel-resumo.png', 'PROPOSTA · celular', True)], False)], ' o resumo do envio já existia (v0.6.17).'),
]
sug = [
  item(268, 'SUGESTÃO · "Baixar PDF" nos três pontos',
       ['Você não pediu. Pus nos três pontos, abaixo de "Atualizar documento", um "Baixar PDF" com o que foi escrito. Aparece para todos. Se reprovar, sai.'],
       [([('pc-ficha-menu.png', 'PROPOSTA · "Baixar PDF" nos três pontos', True)], False)]),
  item(269, 'SUGESTÃO · Pedido do Cwork também sem menus',
       ['Você não pediu com estas palavras, mas é consequência de "aberto pelo Cwork, sem nenhum menu": o "Preencher e imprimir" do kit (Pedido do Cwork) também abre sem os menus do Vértice e sem o aviso repetido embaixo; "Agora não" leva à folha do documento, não ao Vértice inteiro.',
        'Observação para a etapa 3: o pedido imprime todas as abas do modelo (no exemplo, sai também a aba "Instruções"). Não mexi nisso agora.'],
       [([('hoje-pc-pedido.png', 'HOJE · pedido dentro do Vértice inteiro', False), ('prop-pc-pedido.png', 'PROPOSTA · pedido sem menus', True)], False)]),
]
fim = '''<div class="fim"><h2>Conferido</h2><ul>
<li>Revisão completa no Opus (alto), linha por linha, de tudo o que mudou na etapa 2 e de novo da etapa 1 publicada.</li>
<li>Defeitos achados na revisão e já corrigidos: (1) abrir de novo pelo Cwork, logo ao carregar, podia trocar o modelo do Vértice pelo arquivo antigo do Cwork; agora o Vértice pergunta ao banco do aparelho antes; (2) o aviso "Chegou do Cwork: Abrir" e o "O Cwork pediu para imprimir" apareciam por cima da tela já aberta; (3) ícones gigantes no menu dos três pontos; (4) botões de cima com 44 px no toque; (5) "Preencher e imprimir" do resumo caía no Vértice inteiro.</li>
<li>Teste novo de ponta a ponta pelo Cwork, com o Vértice de verdade e planilhas de exemplo inventadas (ficha em retrato, etiquetas em paisagem, POP sem campo): 48 conferências, todas certas, no computador e no celular.</li>
<li>Vértice: 700 testes (8 novos) e as 5 auditorias do método sem piorar nada. Cwork: bateria inteira com o Vértice novo; só as falhas de sempre (data antiga do t_v067, e a do t_v0636v que confere a pasta publicada e o clone antigo). Medidor: 0 defeitos.</li>
</ul><h2>O que não deu para provar daqui</h2><ul>
<li>Android de verdade (folha deitada no celular, zoom de dois dedos) e impressora de verdade (a impressão foi conferida pelo que vai para o navegador imprimir).</li>
<li>Firebase de verdade: a versão nova vinda de outro aparelho foi provada com a nuvem do modo demonstração do Cwork (o mesmo caminho, sem o Firestore).</li>
</ul><h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li><li>Etapa 3: Impressos, kit e etiquetas do Cwork apontando para o Vértice; os documentos antigos (efd_docs) migram uma vez para as 5 pastas.</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>'''

pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vértice v0.6.76 · modo documento</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Vértice v0.6.76 · etapa 2</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Etapa 2: o documento aberto pelo Cwork</h1><p class="sub">Segunda das 3 etapas da sua decisão de 27/11. Fotos do Vértice de verdade dentro do Cwork, no modo demonstração, com planilhas de exemplo inventadas. O Cwork não mudou nesta etapa. Nada publicado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">O que você decidiu</p>' + ''.join(its) + '<p class="grupo">Sugestões minhas, separadas (pode reprovar sem afetar o resto)</p>' + ''.join(sug) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
