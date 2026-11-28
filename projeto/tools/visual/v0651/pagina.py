# Página de aprovação da v0.6.51 (Cwork) + v0.6.85 (Vértice) · Conversas. Mesmo visual das páginas anteriores (v0.6.41).
# Uso: python3 tools/visual/v0651/pagina.py tools/visual/v0651/fotos docs/aprovacao-efcwork-v0.6.51-conversas.html
import base64, io, html, re, sys, os
from PIL import Image

IMG, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
modelo = open(os.path.join(RAIZ, 'docs/aprovacao-efcwork-v0.6.41-vertice-nuvem.html'), encoding='utf-8').read()
CSS = modelo[modelo.index('<style>'):modelo.index('</style>') + 8]
JS = modelo[modelo.rindex('<script>'):modelo.rindex('</script>') + 9]
JS = JS.replace("'efcwork-v0641-respostas'", "'efcwork-v0651-respostas'").replace(
    "'Respostas EFCwork v0.6.41 + Vértice v0.6.75 · nuvem (etapa 1)'", "'Respostas Cwork v0.6.51 + Vértice v0.6.85 · Conversas'")
assert 'efcwork-v0651-respostas' in JS and 'Conversas' in JS

def foto(nome, larg=1400):
    im = Image.open(os.path.join(IMG, nome)).convert('RGB')
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def fig(nome, cap, prop=True):
    a = html.escape(cap)
    return f'<figure class="{"prop" if prop else ""}"><figcaption>{a}</figcaption><button type="button" class="zoom" aria-label="Ampliar: {a}"><img src="{foto(nome)}" alt="{a}"></button></figure>'

def item(n, titulo, texto, figs, ref=''):
    t = html.escape(titulo)
    corpo = ''.join(f'<p>{p}</p>' for p in texto)
    r = f'<p class="ref"><b>De onde vem:</b> {ref}</p>' if ref else ''
    grade = ''.join(f'<div class="lado{" cels" if c else ""}">' + ''.join(fig(*f) for f in grupo) + '</div>' for grupo, c in figs)
    return (f'<section class="it" data-n="{n}" data-t="{t}"><div class="seg"><div class="num">ITEM<span>{n}</span></div><div class="cab"><h3>{t}</h3>{corpo}{r}</div></div>'
            f'{grade}<div class="resp"><div class="voto"><input type="radio" id="r{n}_a" name="r{n}" value="Aprovado"><label for="r{n}_a" class="ok">Aprovado</label>'
            f'<input type="radio" id="r{n}_r" name="r{n}" value="Reprovado"><label for="r{n}_r" class="no">Reprovado</label></div>'
            f'<label class="com">Comentário (opcional)<textarea id="c{n}" rows="2"></textarea></label></div></section>')

P1 = 'seu questionário de 28/11 10:4x, decisão 1 (OPÇÃO 3 · as duas: no registro e numa aba que junta tudo).'
P2 = 'seu questionário de 28/11 10:4x, decisão 2 (avisa quem já participa + o responsável).'
P3 = 'seu questionário de 28/11 10:4x, decisão 3 (Vértice pela conta do Cwork) e o lembrete de 08:54 ("diálogo dentro do Kanban e do post-it; a central das notificações é o Cwork").'
its = [
  item(318, 'A conversa no fim do detalhe de cada registro',
       ['Depois dos dados do registro entra "Conversa · N": as mensagens na ordem (nome, data e hora; as suas aparecem como "Você", num fundo um pouco mais escuro), o campo de escrever e o Enviar. Ctrl + Enter também envia.',
        'Entra em: apontamento, auditoria interna (e cada NC dela, com a mesma conversa da auditoria), coleta, remessa do campo e de água, coleta de água, cloro, equipamento, documento, caixa d\'água e treinamento. Mensagem não se edita nem se apaga (como no EFClaudian).',
        'Desenho: o mesmo dos comentários dos Bugs e sugestões e da gaveta de comentários do Kanban, sem balão de chat.'],
       [([('h1-apont-pc.png', 'HOJE · o detalhe termina nos dados', False), ('c2-apont-enviada.png', 'PROPOSTA · com a conversa no fim', True)], False)], P1),
  item(319, '"Avisa no sino:" com os nomes de quem vai receber',
       ['Embaixo do Enviar, uma linha pequena diz quem recebe o aviso: quem já escreveu na conversa e o responsável do registro (quem registrou o apontamento ou a coleta, o auditor e os responsáveis das NCs, o responsável do documento pelo nome do cadastro). Quem escreveu e conta bloqueada não recebem.'],
       [([('c1-apont-vazia.png', 'PROPOSTA · conversa vazia: "Avisa no sino: Rita Alves" (a responsável)', True)], False)], P2),
  item(320, 'A aba Qualidade › Conversas',
       ['Nova aba antes de Bugs e sugestões. Junta todas as conversas que você pode ver, em dois grupos: Não lidas e Lidas. Colunas: Quando, Registro, Tipo, Última mensagem, Não lidas e Mensagens (Pessoas e "Com você" ficam em Colunas). Os menus de cada coluna (ordenar, buscar, marcar, travar) são os de sempre.',
        'No alto, a pílula "N com mensagem não lida" só quando há.'],
       [([('h3-qualidade-pc.png', 'HOJE · 4 abas, sem Conversas', False), ('c3-conversas-pc.png', 'PROPOSTA · a aba Conversas', True)], False)], P1),
  item(321, 'Tocar na conversa abre o registro, já na conversa',
       ['Da aba Conversas, tocar numa linha leva para a tela do registro (ex.: Inspeções › Apontamentos) e abre o detalhe rolado até a conversa; Esc fecha o detalhe e o voltar do celular volta para a lista. Vai para a tela do registro porque é lá que valem as permissões da área (o "Só ver" de cada área).',
        'Registro que o Cwork ainda não abre (ex.: transferência do almoxarifado, feita no EFClaudian) ou que saiu da lista: abre só a conversa, com o aviso.'],
       [([('c2-apont-enviada.png', 'PROPOSTA · o apontamento aberto na conversa', True)], False)], 'decisão minha (onde abrir), para você confirmar.'),
  item(322, 'O aviso no sino abre a conversa',
       ['O aviso "Mensagem nova · Documento" (ou Apontamento, Coleta…) leva ao registro, aberto na conversa, e sai do sino como lido. Abrir a conversa também marca como lidos os avisos dela.'],
       [([('h6-sino-pc.png', 'HOJE · não existe aviso de conversa', False), ('c6-sino.png', 'PROPOSTA · "Mensagem nova · Documento"', True)], False)], P2),
  item(323, 'Quem conversa: "Só ver" conversa; Consulta só lê',
       ['Conversar não altera o registro, então quem tem a área como "Só ver" também escreve na conversa (mas continua sem os botões que alteram). O perfil Consulta lê a conversa e não escreve (a regra do Firebase de sempre só deixa gravar quem lança).',
        'Quem tem a área como "Não vê" não vê as conversas dela, a não ser as que já escreveu. Com Qualidade "Não vê", a aba Conversas some (a conversa continua no detalhe de cada registro e no sino).'],
       [], 'decisão minha, para você confirmar.'),
  item(324, 'No celular',
       ['O Enviar fica na largura toda, com 44 px, embaixo do campo. A aba Conversas é a mesma tabela, com a rolagem só dentro dela.'],
       [([('h4-apont-cel.png', 'HOJE · celular', False), ('c4-apont-cel.png', 'PROPOSTA · a conversa no celular', True), ('c5-conversas-cel.png', 'PROPOSTA · a aba no celular', True)], True)], 'suas regras de celular (botão de 44 px, mesma largura).'),
  item(325, 'Vértice: o comentário do Kanban e do post-it avisa no sino do Cwork',
       ['Aberto pelo Cwork, o comentário (e cada resposta) guarda também a sua conta, além do nome. Depois de gravar no arquivo, o Vértice passa o comentário ao Cwork: ele vira mensagem da conversa do cartão e o Cwork avisa no sino quem já está na conversa e o responsável do cartão (o nome dele no cadastro do Cwork).',
        'Fora do Cwork (modo de teste) nada muda. Na tela do Vértice também nada muda.'],
       [([('h5-kanban-pc.png', 'HOJE · o comentário fica só no arquivo', False), ('v1-kanban-comentario.png', 'PROPOSTA · igual na tela; o Cwork avisa Carlos Lima', True)], False)], P3),
  item(326, 'A conversa do cartão na aba Conversas, e tocar abre o cartão',
       ['A conversa do cartão aparece na aba Conversas como "Vértice · cartão" (arquivo e código do cartão). Tocar abre o arquivo numa aba do Vértice, com a gaveta de comentários daquele cartão aberta (no Kanban) ou o cartão do comentário aberto no post-it (no quadro livre).',
        'Só quem vê o Vértice (Administrador e Líder ★) e quem já está na conversa veem esta linha.'],
       [([('v2-conversas-vertice.png', 'PROPOSTA · a linha do cartão', True), ('v3-cartao-aberto.png', 'PROPOSTA · abre a gaveta do cartão no Kanban', True)], False),
        ([('v4-quadro-livre.png', 'PROPOSTA · no quadro livre, o cartão do comentário', True)], False)], P3),
  item(328, 'No Cwork, a conversa do cartão se responde no Vértice',
       ['Aberta no Cwork (pelo sino ou pela lista, quando a aba do Vértice não abre), a conversa de um cartão mostra as mensagens e o botão "Responder no cartão do Vértice", sem campo de escrever. Assim a resposta fica no cartão, junto do comentário, e não só no Cwork. Quem não vê o Vértice lê a linha "A resposta se escreve no cartão, no Vértice."'],
       [([('c7-vtq.png', 'PROPOSTA · conversa do cartão aberta no Cwork', True)], False)], 'achado do revisor novo (a resposta escrita no Cwork não chegava ao cartão); decisão minha, para você confirmar.'),
  item(327, 'O formato das conversas (o EFClaudian não pesa)',
       ['Você lembrou em 28/11 12:21: o EFClaudian vai ser descontinuado, então não importa se ele fica diferente; o que vale é o Cwork e o Vértice juntos. O Cwork já grava as conversas na coleção sv2_chat, que existia na regra do Firebase; por isso nada muda no Firebase.',
        'Efeito de graça: conversas antigas que alguém tenha feito no EFClaudian aparecem no Cwork (na foto, uma transferência de exemplo). Não há nada para conferir no EFClaudian.'],
       [([('c3-conversas-pc.png', 'PROPOSTA · a aba com uma conversa antiga de exemplo', True)], False)], 'sua mensagem de 28/11 12:21 ("não mexe no Claudian, ele vai ser descontinuado").'),
]
fim = """<div class="fim"><h2>Conferido</h2><ul>
<li>t_v0651 (Cwork): 29 conferências certas, PC e celular. No app no ar (v0.6.50) falha logo no 1º passo (docs/antes-v0651.txt).</li>
<li>t_v0651v (Cwork e Vértice montados de verdade): 19 conferências certas (comentário no Kanban → mensagem e aviso; a conta no arquivo; a lista; o cartão aberto no Kanban e no quadro livre; o segundo toque na mesma aba; o arquivo que ainda vem da nuvem).</li>
<li>Revisor novo (leu o código sem ter feito): 10 achados nesta versão + 1 antigo, todos corrigidos e testados: o cartão abre mesmo com o arquivo ainda vindo da nuvem; só avisa se o comentário entrou no arquivo (travado não entra); reaproveita a aba do Vértice que já tem o arquivo; sem internet o Enviar não trava; mensagem nova enquanto você escreve troca só a lista; mudar o texto de um comentário não vira mensagem nova; excluir o comentário tira também a conta; o endereço do cartão sai depois de abrir; sair da conta apaga o rascunho; o aviso da conta de teste passa na regra.</li>
<li>Vértice: 736 testes de núcleo (4 novos) e os 4 roteiros de comentário no navegador, todos certos.</li>
<li>Cwork: bateria de 97 arquivos, só as falhas de sempre (t_v067 data; t_v0636v clone antigo e o Vértice ainda não copiado). Medidor --estrito: 0 defeitos, 73 ajustes (igual à v0.6.50). Auditoria visual: 1280 e 390 px, Claro e Escuro, sem rolagem para o lado, sem erro de JavaScript.</li>
<li>Firebase: nada muda (a regra do sv2_chat já existia). As regras [R8] da v0.6.50 continuam esperando o Simulador.</li>
</ul><h2>Perguntas (não feito)</h2><ul><li>Quer o @nome como no EFClaudian (chamar uma pessoa na mensagem, ela recebe o aviso mesmo sem estar na conversa)?</li>
<li>Quer a conversa também na Análise de problemas e nas Tarefas?</li></ul>
<h2>Depois</h2><ul><li>Com tudo aprovado, você manda "pode publicar".</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="8"></textarea></div>"""
pag = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conversas</title>'
       + CSS + '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.51 + Vértice v0.6.85 · Conversas</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
       '<h1>Conversas nos registros, na aba Qualidade › Conversas e nos cartões do Vértice</h1><p class="sub">Fotos do app de verdade no modo demonstração, com nomes e registros inventados (exemplo). HOJE = o que está no ar (Cwork v0.6.50 + Vértice v0.6.84). Nenhum documento seu foi usado nem inventado.</p>'
       '<ol class="como"><li>Toque numa foto para ampliar (Esc fecha).</li><li>Em cada ITEM, Aprovado ou Reprovado; o comentário é opcional.</li><li>No fim, "Copiar respostas" e cole na conversa.</li></ol>'
       '<p class="grupo">No Cwork</p>' + ''.join(its[:7]) + '<p class="grupo">No Vértice e com o EFClaudian</p>' + ''.join(its[7:]) + fim + '</main>' + JS + '</body></html>')
assert not re.search(r'[\U0001F300-\U0001FAFF]', pag)
open(SAIDA, 'w', encoding='utf-8').write(pag)
print(SAIDA, len(pag) // 1024, 'KB')
