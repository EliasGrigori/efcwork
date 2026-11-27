import sys, shutil, os
__file__='/home/claude/efcwork/projeto/tools/visual/v0642/pagina.py'
sys.argv=['x','/tmp/pg','/tmp/x.html']
src=open(__file__).read(); src=src[:src.index("DEC = ")]
exec(src)
JS2=JS.replace("efcwork-v0642-respostas","efcwork-v0642n-respostas").replace("Respostas Vértice v0.6.76 · modo documento (etapa 2)","Respostas Cwork v0.6.42 + Vértice v0.6.77 · nuvem que diz por quê")
shutil.copy('/mnt/user-data/uploads/77981e4b-image.png','/tmp/pg/hoje-escuro.png')
for n in ['pc-nao-subiu','pc-subiu']: shutil.copy('tools/visual/v0642n/%s.png'%n,'/tmp/pg/prop-%s.png'%n[3:])
its=[item(270,'Coluna Nuvem diz por que não subiu, com "Tentar de novo"',
  ['Hoje, "Subindo para a nuvem" só quer dizer "ainda não tem versão na nuvem": se a gravação falha ou fica esperando, a coluna mostra isso para sempre (o FLUX 0002 do seu print, desde 10:08).',
   'Agora, quando não sobe, a coluna diz o motivo em palavras simples ("sem permissão na nuvem", "a nuvem não respondeu", "sem internet", arquivo grande demais) e aparece "Tentar de novo" (também no painel de detalhes). Só para quem salva.'],
  [([('hoje-escuro.png','HOJE · seu print: FLUX 0002 em "Subindo" desde 10:08',False),('prop-nao-subiu.png','PROPOSTA · o motivo e "Tentar de novo"',True)],False),
   ([('prop-subiu.png','PROPOSTA · depois de resolvido, "Tentar de novo" sobe',True)],False)],' sua mensagem de 27/11 12:00 e o "Aprovado" de 12:23.'),
 item(271,'Um arquivo com problema não segura os outros, e nada espera para sempre',
  ['Sem tela nova. (1) Antes, quando um arquivo falhava, a fila do aparelho parava nele e os de trás também não subiam; agora só ele fica e os outros seguem. (2) Cada pedido à nuvem tem prazo de 1 minuto; sem resposta, conta como "a nuvem não respondeu" e tenta de novo sozinho a cada 2 minutos. (3) A lista do que tem na nuvem vem do servidor, não da memória do aparelho (no seu print o FLUX 0001 estava na versão 3 num aparelho e na 7 no outro).'],
  [([('prop-nao-subiu.png','Teste: o quadro recusado vem primeiro na fila e o outro sobe mesmo assim',True)],False)],' sua mensagem de 27/11 12:00.')]
fim='''<div class="fim"><h2>Conferido</h2><ul><li>Vértice: 705 testes (5 novos) e auditorias sem piorar. Cwork: teste novo no navegador com o Vértice de verdade (a nuvem recusa um quadro; o outro sobe; a coluna diz por quê; "Tentar de novo" resolve), mais os da nuvem, do modo documento, da versão e da segurança. Medidor: 0 defeitos.</li></ul>
<h2>O que não deu para provar daqui</h2><ul><li>A causa exata no seu aparelho (permissão ou conexão). Depois de publicar, abra Documentos internos nesse aparelho: a coluna vai dizer o motivo. Me mande o print.</li></ul>
<h2>Depois</h2><ul><li>"Pode publicar" sai como Cwork v0.6.42 + Vértice v0.6.77. Depois volto às etiquetas automáticas (etapa 3).</li></ul>
<p class="sub">Responda cada ITEM e toque em "Copiar respostas".</p><button type="button" class="bt pr gr" data-copiar>Copiar respostas</button><p id="copiado"></p><textarea id="saida" hidden rows="6"></textarea></div>'''
pag=('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nuvem que diz por quê</title>'+CSS+
 '</head><body><div class="topo"><div class="topo-in"><b>Cwork v0.6.42 · Vértice v0.6.77</b><span id="cont"></span><span class="sp"></span><button type="button" class="bt pr" data-copiar>Copiar respostas</button></div></div><main>'
 '<h1>Correção: o que não sobe para a nuvem diz por quê</h1><p class="sub">Defeito que você achou: o FLUX 0002 ficou em "Subindo para a nuvem" desde 10:08. Fotos do app de verdade dentro do Cwork, modo demonstração, com quadros de exemplo do teste. Nada publicado.</p>'
 '<ol class="como"><li>Toque numa foto para ampliar.</li><li>Aprovado ou Reprovado em cada ITEM.</li><li>"Copiar respostas" e cole na conversa.</li></ol>'+''.join(its)+fim+'</main>'+JS2+'</body></html>')
open('docs/aprovacao-efcwork-v0.6.42-nuvem-diz-por-que.html','w').write(pag); print(len(pag)//1024,'KB')
