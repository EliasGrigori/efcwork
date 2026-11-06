# EFCwork — memória do projeto

**App:** EFCwork · apelido **Cwork Quality** (vai no pé do app) · família **EFClaudian**.
**O que é:** o rework do EFClaudian pelo **Método Sabiá** (versões pequenas, cada uma testada pelo Claude, aprovada pelo Elias numa página de antes e depois, e só então publicada).
**Dono:** Elias (José Elias Florêncio Beserra). Começo: 05/11/2026.

## Regras do Elias (valem em todo ciclo)
- Antes de cada tarefa: modelo e esforço sugeridos **em negrito**; esperar o "pode iniciar".
- Uma versão pequena por vez. Publicar no GitHub **só com aprovação** (página com antes e depois, Aprovado/Reprovado e comentário por item, botão "Copiar respostas").
- O Claude testa tudo o que pode antes de entregar; o que não pode provar vai escrito no roteiro do Grok e na entrega.
- Em toda entrega: arquivo da versão, memória do projeto, roteiro do Grok, testes, telas e os próximos passos. Ao fechar um lote: resumo + o que conferir e configurar no Firebase.
- **Anotar tudo** (decisão, aprovação, descarte, pedido) na hora — aqui e no dossiê do EFClaudian.
- **Nunca abrir o OneDrive** sem o Elias pedir pelo nome.
- Visual: limpo e compacto, sem "encheção de linguiça"; cantos moderados; **um único filtro recolhível**; escolhas em **janelas retráteis**; números em caixas modernas centralizadas sobre o rótulo; **excluir = ícone de lixeira no canto de cima**; ícones desenhados, **sem emoji**; mesmo padrão em todas as telas, no celular e no PC.
- **Nada da Meri Pobo fixo no código**: a empresa (nome, unidades, logo) vem da configuração.

## Decisões do rework (05/11/2026)
- Estudo do Rework: os 16 itens aprovados (19:23). Navegação por menu lateral; Início novo; Coletas 4 abas, Rateios 1, Inspeções 3, Documentos 3, Qualidade 3, Almoxarifado 5; Relatórios num lugar só; tela de entrar simples "como a do Flow, só que agrícola"; conquistas saem; padrão visual único; perfis "Só ver / Ver e alterar" por área (quem existe continua igual); código no Método Sabiá; Saúde dos dados.
- Visual (20:22 e 20:35): base da **Opção 5** com as **fontes da Opção 4** (títulos Fraunces, texto Source Sans 3). **Dois temas:** Claro (marfim + ouro; botões principais em degradê dourado) e **Escuro = o Dourado original do EFClaudian** (fundo #0b0d16, ouro #d9b46a, brilho no canto, trama, botão com reflexo, título em degradê). Grafite e Alto contraste descartados. Menu lateral claro no Claro e escuro no Escuro. Cabeçalhos bem desenhados (título serifado com traço).
- Amostras (aprovado): ciclo na gaveta lateral — Programação → Coleta → Envio → OS → Laudo arquivado / Compra do serviço (na ordem em que acontecerem); NF e cupom dos Correios anexados a qualquer momento; código de rastreio abre a página dos Correios; prazo do laboratório com aviso; laudo fora da faixa vira NC; o mesmo ciclo para calibração e documentos.
- **Fim do rework:** EFCdocs reduzido — só receber planilhas comuns com máxima compatibilidade (SheetJS: .xlsx/.xls/.ods/.csv), página por fora sem instalador, aberta só pelo Cwork e pelo Sabiá; fichas de envio, etiquetas do isopor e cadeias de custódia preenchidas automaticamente.

## Estrutura do código
- `src/index.html` com dois pontos de encaixe (`/*__CSS__*/`, `/*__JS__*/`); `tools/montar.py` junta os módulos (ordem: base, casca, entrar, inicio, areas, adm) e grava `dist/index.html`, `dist/sw.js` (cache `efcwork-<versão>`), manifest e ícones.
- Prefixos por módulo: base (nenhum), `cs` casca, `pl` planilha, `tb`/`dd`/`gv` tabela padrão + janela retrátil + gaveta, `al`/`eq` almoxarifado, `bg` busca geral, `en` entrar, `ini` início, `ar` áreas, `adm` administração. Nome repetido quebra o app: cada módulo novo ganha prefixo próprio.
- Rotas por endereço: `#/area/aba`. Telas se registram em `TELAS[area]`; `TELAS[area + ':depois']` roda depois de desenhar. Cada área registra em `CS_CARGAS` a função que começa a ouvir os dados dela depois do login, e em `BG_FONTES` o que a busca geral acha.
- Tabela padrão (`tbHTML(cfg)`): busca, um filtro recolhível com janelas retráteis, ordenar pelo cabeçalho, colunas lembradas no aparelho (`cw-tbcol-<id>`), planilha .xlsx (`plXlsx`, sem biblioteca), impressão A4 deitada, total no rodapé, 100 linhas e "Mostrar mais". Gaveta: `gvAbrir(fn)` (redesenha sozinha quando os dados mudam).
- Dados: `Store` e `Data` vieram do EFClaudian v2.102.59 (mesmo projeto Firebase `docseliasflorencio`, mesmas coleções `sv2_*`, mesmo login `usuario@efclaudian.app` / sv2_login). Modo demonstração: `?demo=1` (tudo no navegador).
- Empresa: `sv2_cfg/empresa` `{nome, unidades[], logo (data URL ≤256 px), atualizadoEm, atualizadoPor}`. Só o Principal grava.

## Versões
| Versão | O que entrou | Situação |
|---|---|---|
| v0.2.0 | Almoxarifado para CONSULTA (Painel, Materiais, Movimentações, Solicitações, Equipamentos) com tabela padrão, gaveta, planilha e impressão; busca geral (/, Ctrl+K, lupa); números do Almoxarifado no Início. Cálculos de saldo por lote iguais aos do EFClaudian. Nada grava. Auditoria visual: letras 5–7 tamanhos por tela; "Valor em estoque" leva para Materiais por valor. Suíte 89 ok. | aprovada 05/11 22:59 (8 de 8) |
| v0.1.0 | Casca: tela de entrar agrícola, primeiro acesso, menu lateral, cabeçalho, abas, temas Claro/Escuro, empresa configurável, unidade do aparelho, Início (tarefas reais, atalhos, plano das áreas), celular com barra de baixo, sw.js e manifest | 05/11 22:22: aprovados 2, 3, 4, 5 e 7; **reprovados 1 (tela de entrar) e 6 (celular)** — o Elias vai trazer modelos. Publicar aprovado; falta o repositório `efcwork` existir |

## Pendências de visual
- Tela de entrar e celular: refazer a partir dos modelos que o Elias vai trazer.
- Relevo do fundo (trama + brilho) também no tema Claro.

## Próximas versões (plano)
v0.2 Almoxarifado consulta + tabela padrão + busca · v0.3 Almoxarifado lançamentos (entrada, saída, kit, contagem, solicitações, equipamentos; Nº 47 e 51) + sino · v0.4 Coletas (Amostras com ciclo, Envio com NF/cupom/rastreio) · v0.5 Documentos · v0.6 Inspeções · v0.7 Rateios e Qualidade · v0.8 Relatórios · v0.9 Perfis por área, Administração completa e Saúde dos dados · v1.0 virada · depois: EFCdocs e fichas preenchidas.

## Limites conhecidos (v0.1.0)
- Não testado no Firebase real: login real, leitura de `sv2_users`/`sv2_tarefas` e gravação de `sv2_cfg/empresa` (depende das regras atuais — conferir no console).
- "Esqueci a senha" leva ao EFClaudian (a recuperação própria entra depois).
- Busca, sino e as áreas ainda mostram "chega na vX" e levam ao EFClaudian.
