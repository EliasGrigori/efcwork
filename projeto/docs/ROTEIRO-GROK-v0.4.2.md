# Roteiro do Grok — EFCwork v0.4.2 (tela de entrar com a garota-propaganda)

**Testar sem tocar em dados reais:** `?demo=1`. Conta real: só olhar (gravar a foto é tarefa do Elias).

## NÃO SÃO DEFEITOS
- Num aparelho onde ninguém entrou ainda, a tela mostra só o fundo e o formulário (sem foto). Antes do login o Firebase não deixa ler a configuração; o aparelho guarda uma cópia na primeira entrada.
- Os avisos do tema Claro são textos de exemplo, não dados reais (a pessoa ainda não entrou).
- A palavra grande passa por trás do formulário no PC (efeito de revista).
- Foto com fundo aparece numa moldura arredondada e a palavra fica só atrás (sem o "na frente").
- Sem tema escolhido no app, a tela segue o tema do aparelho (claro/escuro).
- Com "reduzir movimento" ligado no aparelho, nada se mexe.

## Bloco A — Temas
A1. Tema Escuro: QUALIDADE sobe letra por letra, atrás da foto e na frente na cintura; faixa dourada correndo embaixo; a foto acompanha o mouse.
A2. Tema Claro: foto no arco dourado; 3 avisos entram um a um e balançam.
A3. Troque o tema (botão sol/lua dentro do app), saia: a tela de entrar muda junto.

## Bloco B — Celular (390 px)
B1. Arte em cima, formulário embaixo; botão Entrar visível sem rolar; nada rola para o lado.
B2. Escuro: palavra em duas linhas (QUALI / DADE).

## Bloco C — Administração › Empresa › Tela de entrar (demo, como Principal)
C1. Escolher foto PNG sem fundo: aviso "Recortada (sem fundo): efeito completo".
C2. Escolher JPG com fundo: aviso de moldura; ao sair, foto na moldura.
C3. Trocar palavra (vira maiúscula), faixa (uma por linha) e avisos; salvar; sair e conferir.
C4. Palavra com 1 letra: aviso, não salva. Lixeira tira a foto.
C5. Entrar como colaborador: campos travados, sem Escolher/Salvar.
