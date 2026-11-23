# Mac Frog — Metroidvania (protótipo V6)

> Desenvolvimento experimental na branch `feature/metroidvania-map-v6`. A versão original está preservada em `main`.

## O que foi alterado

- **43 salas** conectadas por **69 passagens bidirecionais**, incluindo caminhos verticais, circuitos e atalhos.
- O novo mapa de exploração usa **formas geométricas simples** para que o layout seja testado antes de investir em sprites de cenário.
- A tecla **M** abre/fecha o mapa completo; o minimapa permanece no HUD.
- Algumas portas exigem o **poder de água** e o portão final mantém a saída para a próxima área.
- A lógica principal de personagem, animações, golpes e inimigos ainda vem do jogo original `game_v25.html`; os sprites animados de inimigos continuam salvos em `assets/gothicvania-swamp/`.
- O arquivo `scenario_room1_v5.js` e os demais recursos anteriores foram preservados.

## Organização e execução

- `index.html` — inicia o jogo e injeta o novo cenário.
- `game_v25.html` — motor original, sprites/animações do personagem e poderes; **não substituído**.
- `scenario_room1_v6.js` — nova definição das salas, rotas, colisões e mapa.
- `scenario_room1_v5.js` — implementação anterior, mantida como referência.
- `assets/` — recursos gráficos originais preservados.

O `index.html` usa `fetch()` para carregar os arquivos. Execute usando um servidor HTTP, como GitHub Pages, ou um servidor local, em vez de abrir o HTML diretamente com `file://`.

## Inspeção no console

```js
MacFrogMapV6.info()      // versão, sala atual, total, descobertas
MacFrogMapV6.rooms()     // salas, coordenadas e conexões
MacFrogMapV6.validate()  // checagem de conexões recíprocas
```

## Limitações desta etapa

Esta é uma **primeira implementação da arquitetura de exploração**, e não um mapa final polido. As salas ainda usam uma geometria-base de prototipação, e colisões, alturas alcançáveis, persistência do progresso e integração completa com o motor antigo exigem testes de jogabilidade. O arquivo de 17 MB `game_v25.html` ainda precisa ser modularizado para extrair fisicamente sprites e animações do personagem sem perda de comportamento. Não publique esta branch na `main` antes de testar.
