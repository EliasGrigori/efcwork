# Mapa da integração · EFCwork × Vértice Docs × Sabiá (Quiz)

> **Substituído em 12/11/2026 pelo `PLANO-INTEGRACAO-v2.md`** (plano refeito depois das respostas do Elias: sem nuvem no Vértice, só o essencial na nuvem grátis, kit do laboratório, janela de resumo). Este arquivo fica como registro da primeira proposta.

Etapa 2 do pedido de 12/11/2026 03:02. Feito com Fable 5.2 · alto, em 12/11/2026. Nada do app mudou nesta etapa: continua valendo a v0.6.8.
Li o código e a memória dos três repositórios (EFCdocs v0.6.11.1, Sabiá v1.5.0, EFCquiz v2.8.8) e o EFClaudian v2.102.60.

## 1. Resposta curta

**Pode acontecer, sim.** Os três apps já moram no mesmo endereço (eliasgrigori.github.io) e usam o mesmo cadastro de pessoas. O que falta é um combinado escrito, igual nos dois lados, e três peças novas.

O que dá para prometer e o que não dá:

| Pergunta | Resposta honesta |
|---|---|
| Mesmo usuário e senha nos três? | Sim. Já é assim no Quiz. No Docs falta fazer (hoje ele não tem login). |
| Entrar num e já estar dentro do outro, sem digitar a senha? | Provável. Existe um caminho oficial do Firebase para isso, mas preciso provar num teste pequeno antes de prometer. Se não der, a pessoa digita a senha uma vez por app em cada aparelho. |
| O que sai impresso pelo EFCwork é idêntico ao do Docs? | Sim, 100%, porque só um lado desenha a folha: o Docs. O EFCwork nunca redesenha o documento, só manda imprimir a cópia que o Docs publicou. |
| Etiqueta, custódia e ficha saem já preenchidas? | Sim, mas numa segunda fase. Primeiro a folha sai como está; depois o EFCwork passa os dados (laboratório, O.S, amostras) e o Docs preenche. |
| POPs e procedimentos? | Só quando o Docs tiver o módulo Documento (a v0.7.0 dele). Hoje ele só tem Planilha e Quadro prontos. Até lá, POP entra como PDF importado. |
| Ficha do laboratório feita no Excel fica igual ao Excel? | Quase sempre, mas cada ficha precisa ser conferida uma vez. Onde o Docs não ficar igual, o caminho seguro é salvar em PDF no Excel e importar: aí é idêntico. |
| "100% de compatibilidade" entre os dois apps? | No que é combinado (contas, documentos, impressão, campos, treinamentos): sim, e dá para provar com teste. No resto (cada tela, cada botão), não é meta realista nem necessária. |

## 2. Como está hoje

| App | Onde guarda | Login | Ligação que já existe |
|---|---|---|---|
| EFCwork v0.6.8 | Nuvem (Firestore, coleções `sv2_`) | Cadastro do EFClaudian, sessão própria | Nenhuma com Docs ou Quiz |
| EFClaudian v2.102.60 | Nuvem (as mesmas coleções) | Cadastro próprio | Botão para o EFCquiz; botão do EFCdocs desligado ("em breve"). Etiqueta da caixa feita pelo próprio app |
| Vértice Docs v0.6.11.1 | **Só no aparelho** | **Não tem** | Nenhuma. Nuvem e login estão planejados para a v0.9.0 dele, ligação para a v0.10.0 |
| Sabiá v1.5.0 | Treinamentos e histórico **só no aparelho do instrutor**; a sala ao vivo passa pela nuvem | Conta do EFClaudian (opcional) | Avisa o perfil para outros apps; não grava histórico na nuvem |
| EFCquiz v2.8.8 (antigo) | Igual: histórico no aparelho | Conta do EFClaudian | É para ele que o botão do EFClaudian aponta |

Três fatos que mandam no desenho:

1. **Não existe lugar para arquivos na nossa nuvem.** A família usa só o banco (Firestore). O serviço de arquivos do Firebase (Storage) hoje pede o plano pago. O banco aceita no máximo 1 MB por registro. Então um PDF tem de ser guardado em pedaços.
2. **O EFCwork tem sessão separada de propósito.** Em 09/11 (v0.4.10) separei o login do EFCwork do login do EFClaudian, porque dividir a sessão fazia um derrubar o outro. O Docs tem de nascer do mesmo jeito: sessão dele, cache dele.
3. **Etiqueta e fichas.** No EFClaudian só a etiqueta da caixa é feita pelo app. As fichas e cadeias de custódia saíram de lá em 25/09, porque são documentos dos laboratórios, preenchidos no Excel. É exatamente o buraco que o Docs fecha.

## 3. O desenho proposto

### 3.1 Quem é dono do quê

- **O Docs é dono dos documentos.** Cria, edita, controla revisão e **publica uma cópia de impressão** (PDF) de cada revisão aprovada. Grava em coleções `efd_` (nome que ele já tinha decidido).
- **O EFCwork é dono dos pontos de impressão.** Ele diz "neste lugar do app imprime este documento" (por exemplo: Coletas › Envio imprime a etiqueta, a custódia do laboratório A e a ficha do laboratório B). Grava em `sv2_impressos`.
- **O Sabiá é dono da aula e da prova.** Quando encerra uma sessão, grava um resumo em `sv2_treinos`, o mesmo lugar onde o EFCwork registra treinamento sem prova.
- Ninguém mexe no que é do outro. Tudo passa por um combinado escrito: o **Contrato EFD v1** (está na nota para a IA do Docs).

### 3.2 Os dois caminhos de um documento

**Criado do zero no Docs:** a pessoa faz no Docs, conclui a revisão, o Docs publica a cópia. No EFCwork ele aparece em Documentos › Impressos e pode ser ligado a um ponto de impressão.

**Importado pelo EFCwork:**
- PDF ou foto: entra na hora, já imprime. Fica marcado como "Importado aqui".
- Excel ou Word: o EFCwork guarda o arquivo e mostra "Abrir no Vértice Docs". Só imprime depois que o Docs abrir e publicar a cópia, porque o EFCwork não sabe desenhar Excel (e não deve aprender: seriam dois desenhos diferentes do mesmo papel).

### 3.3 Impressão rápida

- O EFCwork baixa a cópia uma vez e guarda no aparelho. Depois imprime na hora, **mesmo sem internet**.
- Se o Docs publicar revisão nova, o EFCwork percebe e troca sozinho. A revisão velha nunca mais sai.
- Enquanto uma revisão nova está em aprovação, continua saindo a vigente.

### 3.4 Preenchimento sozinho (segunda fase)

- No Docs, a pessoa marca os lugares que o EFCwork preenche. Na Planilha, usando o recurso do próprio Excel de **dar nome à célula** (ex.: `efc_coleta_os`). O Docs já lê e grava esses nomes, e o arquivo continua abrindo no Excel normal.
- Os nomes saem de uma lista fechada, o **dicionário de campos** (laboratório, endereço, remetente, O.S, data, caixa, lista de amostras...). São 31 campos e 2 listas na v1.
- Na hora de imprimir, o EFCwork entrega os dados e **o Docs desenha e imprime**, numa janela pequena por cima do EFCwork. A pessoa não sai da tela.
- Os dados não vão no endereço da página (regra de privacidade): passam por uma área do aparelho que os dois apps enxergam, e são apagados em seguida.

### 3.5 Quiz

- **Botão:** "Outros apps" no EFCwork, com Vértice Docs e Sabiá, só para Administrador e Líder (como no EFClaudian).
- **Mesmo login:** mesma conta. A configuração que hoje se cola à mão no Sabiá pode ser entregue pelo EFCwork ao clicar no botão.
- **Histórico nos dois sentidos:**
  - Sabiá → EFCwork: ao encerrar a sessão, o Sabiá grava o resumo (título, data, instrutor, pessoas, acertos, quem ficou abaixo da meta, código de conferência SAB). Aparece em Qualidade › Treinamentos.
  - EFCwork → Sabiá: treinamento **programado** no EFCwork aparece no Sabiá como "para aplicar". Aplicou, o mesmo registro vira "realizado".
- **Sem quiz também vale:** o EFCwork registra treinamento só com lista de presença. E o Sabiá continua podendo ter treinamentos dele, sem nada no EFCwork.
- As assinaturas, fotos e o PDF de registro continuam no Sabiá. Depois, esse PDF pode ser publicado na pasta Treinamentos do Docs, e os três ficam ligados.

## 4. Dificuldades (da maior para a menor)

1. **O Docs ainda não tem nuvem nem login.** No plano dele isso é a v0.9.0, depois do Documento (v0.7.0) e das pastas (v0.8.0). Se esperar a fila, a integração demora. **Sugestão:** adiantar uma fatia fina, a "Ponte": só login + publicar a cópia de impressão. É pouco perto da v0.9.0 inteira e destrava tudo.
2. **Duas IAs, em duas contas, construindo as duas pontas.** É o maior risco de os apps se desencontrarem. **Remédio:** o contrato é um arquivo com número de versão, igual nos dois repositórios, com exemplos e um **conferente** (um programa pequeno que diz se um registro segue o contrato). Já deixei pronto e testado: 87 conferências, 0 falhas. Cada lado roda o mesmo conferente na sua suíte. Só o Elias manda mudar o contrato.
3. **Arquivo em pedaços no banco.** Funciona, mas tem limite: proponho 8 MB por cópia. Etiqueta e ficha têm 50 a 300 KB. PDF escaneado pesado precisa ser reduzido antes.
4. **POP e procedimento dependem da v0.7.0 do Docs.** Até lá: PDF importado.
5. **Imprimir PDF pelo celular.** No PC o EFCwork manda direto para a impressora. No Android o navegador não imprime PDF de dentro da página: abre o PDF no leitor do aparelho e imprime de lá (um toque a mais). Documento preenchido pelo Docs não tem esse problema.
6. **Regras do Firebase.** Coleções novas (`efd_docs`, `sv2_impressos`, `sv2_treinos`) precisam de regra. A proposta está na nota; quem publica é você no console.
7. **Sessão entre apps.** O atalho para não redigitar a senha precisa de um teste de 1 hora com o Firebase de verdade. Não consigo testar daqui.
8. **Plano grátis do Firebase.** Cada impressão sem cópia guardada custa de 1 a 12 leituras. Com a cópia no aparelho, zero. Folga grande para o uso de uma fazenda.
9. **Repositórios públicos.** Fichas reais de laboratório e dados da empresa não podem entrar em teste nem em print. Os exemplos do contrato são todos inventados.
10. **Qual Quiz?** O botão do EFClaudian ainda aponta para o EFCquiz antigo. Preciso que você diga qual o EFCwork abre (sugiro o Sabiá).

## 5. Ordem sugerida, modelo e esforço

No EFCwork (esta conta):

| Versão | O que entra | Depende do Docs? | Modelo · esforço |
|---|---|---|---|
| v0.6.9 Impressos | Documentos › Impressos: importar PDF ou foto, guardar em pedaços, imprimir, funcionar sem internet; pontos de impressão em Coletas › Envio; botão "Outros apps" | Não | **Opus 5.5 · alto** |
| v0.6.10 Etiqueta da caixa | Etiqueta como no EFClaudian, com os endereços dos laboratórios vindos do cadastro (hoje estão fixos no código de lá) | Não | **Sonnet 5.5 · alto** |
| v0.6.11 Treinamentos | Qualidade › Treinamentos: registrar com ou sem quiz, programar, histórico por pessoa e setor | Não (o Sabiá entra depois) | **Opus 5.5 · alto** |
| v0.6.12 Preenchimento | Entregar os dados ao Docs e imprimir preenchido | Sim: Ponte 2 | **Opus 5.5 · alto** |

No Vértice Docs (a outra conta, onde você tem o Fable 5.2):

| Versão | O que entra | Modelo · esforço |
|---|---|---|
| Ponte 1 | Login pelo cadastro (sessão própria), publicar a cópia de impressão ao concluir revisão, ler o que o EFCwork importou | **Fable 5.2 · alto** |
| Ponte 2 | Campos por nome de célula, modo imprimir com os dados do EFCwork | **Fable 5.2 · alto** |
| v0.7.0 (já planejada) | Documento: POP, formulário, Word, PDF. Passa a publicar cópia também | o que ele já definiu |

Por que Fable na Ponte: é a parte em que um erro custa caro (login, regras, arquivo em pedaços, duas sessões no mesmo endereço). O resto é construção comum.

No Sabiá: uma versão curta (gravar o resumo ao encerrar, ler os programados, receber a configuração do EFCwork). **Sonnet 5.5 · alto.**

No EFClaudian: ligar o botão do Docs (uma linha) e as três pendências da água (mensal de verdade, várias análises, tipo Canal). **Sonnet 5.5 · alto.**

## 6. O que entrego junto

- `NOTA-PARA-A-IA-DO-VERTICE-DOCS.md`: tudo o que a outra IA precisa, para colar na conversa dela.
- `tools/contrato/efd-v1.js`: o conferente (um arquivo, serve nos dois apps).
- `tools/contrato/exemplos-efd-v1.json`: exemplos certos e errados, todos inventados.
- `tools/contrato/confere.js`: o teste (87 ok, 0 falhas).
- Página de aprovação com os esboços das telas e as decisões que preciso de você.

## 7. Parte para o Sabiá (resumo do combinado)

1. Ao encerrar uma sessão com conta conectada, gravar `sv2_treinos/sab_<id da sessão>` no formato do contrato (o conferente tem `treino`). Gravar de novo o mesmo registro não duplica.
2. Ler os `sv2_treinos` com situação "programado" e mostrar em Aplicar; ao encerrar, completar o mesmo registro.
3. Sessão de teste e ensaio não vão para a nuvem.
4. Aceitar a configuração entregue pelo EFCwork (mesma chave `sabia-efc-cfg` que ele já usa), para ninguém colar texto.
5. Sessão própria: hoje ele usa a sessão padrão, dividida com o EFClaudian. Vale o mesmo cuidado que tive no EFCwork.
