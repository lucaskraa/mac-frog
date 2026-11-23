# Mac Frog — Metroidvania (Área 1, V7)

O jogo conserva **o personagem, os poderes, os golpes e as animações originais** dentro de `game_v25.html`, enquanto a Área 1 recebe um novo projeto de exploração.

## Como acessar

Abra [Mac Frog](https://lucaskraa.github.io/mac-frog/) (após a publicação da atualização). No jogo, pressione **M** para abrir/fechar o mapa completo; com o mapa aberto, a ação é pausada.

## Nova estrutura

- 43 salas conectadas por 68 passagens bidirecionais reais.
- Salas em **5 modelos arquitetônicos**: galerias com rotas superiores, poços verticais, câmaras alagadas, encruzilhadas e fortificações.
- Diferentes profundidades, pontes, plataformas escalonadas, paredes, lacunas e pontos para agarrar.
- Mapa com **silhuetas das salas**, mostrando verticalidade, conexões, salas descobertas e bloqueios de habilidade.
- Rotas que se cruzam e circuitos de retorno. **11 salas de uma região inundada** só são alcançáveis depois de obter o poder de água no Santuário.
- Sai de `entrada` e mantém o caminho ao portão da próxima área.
- A arte do cenário foi substituída temporariamente por formas feitas por código; recursos gráficos antigos continuam no repositório para uso posterior.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Inicializa o motor e injeta V6 + V7 antes do `bootGame()` |
| `game_v25.html` | Motor e sprites/animações originais, preservados |
| `scenario_room1_v6.js` | Grafo das salas, combate e integração com o motor |
| `scenario_room1_v7.js` | Geometria diferenciada, arquitetura visual e novo mapa |
| `scenario_room1_v5.js` | Versão antiga preservada para recuperação |
| `assets/` | Recursos gráficos preservados |

## Verificações

Foram executados testes programáticos de sintaxe e construção das 43 salas, reciprocidade das conexões, existência de plataformas nas saídas verticais, acesso ao poder de água antes dos bloqueios, além da execução das funções de desenho com um contexto Canvas simulado.

**Importante:** as verificações automáticas não substituem testes reais de jogabilidade em navegador. A física original, altura dos saltos, ações de agarrar, efeitos visuais e carregamento de partidas salvas ainda precisam ser verificados manualmente. Este projeto permanece um protótipo, não o mapa final de um jogo comercial.
