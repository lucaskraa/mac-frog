# Mac Frog — reconstrução Metroidvania (V8)

Jogo 2D em HTML5 Canvas. Esta branch preserva o motor original de animação e combate e substitui a geometria repetitiva da Área 1 por salas feitas com mapas de tiles individuais.

## Executar

Abra a versão publicada em [GitHub Pages](https://lucaskraa.github.io/mac-frog/) depois que esta branch for validada e integrada, ou execute um servidor estático local dentro do repositório:

```bash
python3 -m http.server 8765
```

Acesse http://localhost:8765/. O HTML usa `fetch()`; abrir por `file://` não é suportado.

**Controles conhecidos:** A/D ou setas para movimentar; W, seta para cima ou Espaço para pular; C para língua/agarrar; Z para ataque normal; M para mapa; Shift para correr. S ou seta para baixo abre saídas inferiores quando o personagem estiver sobre o portal.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `game_v25.html` | Motor original, 5 atlases WebP embutidos, animações, habilidades e combate; preservado |
| `scenario_room1_v6.js` | Compatibilidade com o motor, inimigos, entidades e grafo de conexão |
| `area1_blueprints_v8.js` | 43 salas com geometrias de tiles escritas separadamente |
| `area1_connectors_v8.js` | 92 plataformas corretivas explícitas, definidas após teste de alcançabilidade |
| `scenario_room1_v8.js` | Conversão dos tiles em colisões, portas, câmera, checkpoints e save V8 |
| `scenario_room1_v8_visual.js` | Renderização provisória do ambiente, portas, minimapa/mapa e HUD |
| `index.html` | Carregamento do motor original + scripts V8 na ordem correta |
| `tools/extract-atlases.cjs` | Extração reversível dos cinco atlases WebP originais |
| `tests/area1-v8.test.cjs` | Testes estáticos, topologia, progressão, renderização simulada e spawns |
| `tests/browser-smoke.cjs` | Teste real no Chromium de carregamento, movimentação e mapa |

V7 e os cenários anteriores permanecem no repositório como histórico recuperável, mas não são executados pelo novo `index.html`.

## Exploração

- **43 salas** e **68 conexões bidirecionais** no grafo atual;
- **13 salas verticais** com mais de uma tela de altura;
- Portas laterais, superiores e inferiores com coordenadas próprias;
- Diferenciação entre salas, abismos, plataformas, câmaras inundadas e âncoras para língua;
- Uma região de **11 salas** bloqueada por habilidade da água;
- O **Santuário da Água** é alcançável antes de adquirir a habilidade;
- HUD mais limpo, mapa com descoberta progressiva e sala atual;
- Estado de exploração V8 salvo separadamente para não destruir o save legado.

## Separar os sprites originais

```bash
node tools/extract-atlases.cjs
```

O comando escreve cinco imagens **WebP** em `assets/extracted/`, junto de um manifesto com hashes SHA-256 e metadados das animações. A extração não altera os bytes originais; para evitar duplicação permanente de ~13 MB, o GitHub Actions anexa essas imagens como artefato ZIP em vez de adicioná-las ao código-fonte. O motor continua usando os atlases originais embutidos.

## Verificação

```bash
node --test tests/area1-v8.test.cjs
```

O fluxo [Mac Frog V8 verification](https://github.com/lucaskraa/mac-frog/actions) executa esses testes, extrai os atlases e também inicia o jogo real num Chromium headless com capturas.

**Observação:** a V8 é um avanço importante de arquitetura, mas não é uma certificação de que toda a campanha foi completada. Salas e transições precisam de testes de jogabilidade longa, revisão visual de cada ambiente, progressão de todos os itens, verificação manual de segredos e eventual substituição da arte provisória por cenários finais. Não confunda topologia válida com uma campanha integralmente testada.
