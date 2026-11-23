# Mac Frog V9 — reconstrução visual e combates (branch experimental)

> **A V8 publicada continua na `main`.** Esta V9 está sendo desenvolvida em `feature/mac-frog-v9`. Não mesclar sem verificar o resultado de `Mac Frog V9 verification` e jogar uma campanha completa.

## Execução local

```bash
python3 -m http.server 8765
```

Acesse `http://localhost:8765/`. O jogo continua em HTML5 Canvas e usa o motor `game_v25.html`. O carregamento em `index.html` injeta o núcleo V8 e depois os três módulos V9.

## O que a V9 implementa

- **Construção visual:** pedras pixeladas, padrões de solo, musgo e madeira produzidos por código, com contornos de plataformas e parallax de ruínas/raízes sem cópia de obras comerciais.
- **Vãos revisados:** vários setores de travessia passam a ter solo contínuo. Poços perigosos ficam concentrados em regiões específicas.
- **Descidas físicas:** salas que têm saída inferior recebem uma abertura real no piso; o personagem precisa cair por ela para mudar de sala. A chegada é posicionada em área desobstruída.
- **Inimigos:** moscas, larvas e besouros recebem sprites pixelados originais gerados em pequenos canvases e variações de movimento. As imagens originais de V8 e o motor de combate continuam recuperáveis.
- **Mini-boss:** Lacraia das Profundezas nas Minas, com corpo de oito segmentos, aviso de investida, duas velocidades/fases, barra de vida e derrota registrada no armazenamento local.
- **Chefe final:** o sapo tribal usa o boss e as hitboxes do motor original na Área 2, agora com novo corpo pixelado e ataque elástico extra na segunda fase.
- **Mac Frog:** atlases de movimento e ataques originais preservados; partículas adicionais para dano, aterrissagem, água, vento e transições.
- **Arte ambiental complementar:** sete biomas com fundos originais renderizados em baixa resolução e escalados sem suavização, com raízes, ruínas, névoa, cavernas, archotes e silhuetas. Módulo `scenario_room1_v9_backdrop.js`.
- **Batalhas aprimoradas:** lacraia com padrões de investida e golpe de área sinalizado; após a primeira derrota restaura até 35 pontos de vida. Chefe tribal com sprite original detalhado em seis poses e ataque elástico.
- **Testes físicos:** além das 136 direções de portas, a suíte de navegador executa gravidade real e transição por todas as 33 saídas inferiores, sem teleporte por código.
- **Testes:** regressão V8, sintaxe V9, browser Chromium com 136 transições direcionais, 33 descidas pela física real e combate à lacraia.

## Arquivos novos

| Arquivo | Função |
|---|---|
| `scenario_room1_v9.js` | Colisões e descidas, variações de sala, comportamento dos insetos e IA da lacraia |
| `scenario_room1_v9_visual.js` | Pixéis e texturas próprios, parallax, sprites de insetos, lacraia e sapo tribal |
| `scenario_room1_v9_backdrop.js` | Pixel art de sete biomas em camadas de parallax pré-renderizadas |
| `scenario_room1_v9_fx.js` | Feedback de golpes, efeitos de poderes e testes disponíveis em `?dev=1` |
| `tests/area1-v9.test.cjs` | Verificações estáticas e de preservação |
| `tests/browser-v9.cjs` | Testes de carregamento, navegação e combate em Chromium |
| `.github/workflows/mac-frog-v9.yml` | Integração contínua da V9 |

## Limitações e trabalho restante

A V9 ainda **não representa o polimento final de Dead Cells**: os sprites de insetos e os padrões de cenário são pixel art gerada por código, ainda com espaço para direção artística detalhada. A física de todas as plataformas precisa de uma campanha manual longa, além dos testes automatizados de portas. O chefe tribal aproveita os ataques existentes, mas a batalha integral também precisa de teste humano.

Não foram removidos `game_v25.html`, os atlases WebP originais, a V8 ou outros recursos e versões anteriores. O armazenamento da derrota da lacraia usa a chave `mac_frog_v9_boss`, separada da chave do save V8.

## Verificar

```bash
node --test tests/area1-v8.test.cjs
node --test tests/area1-v9.test.cjs
# Com servidor HTTP local e Playwright instalado:
node tests/browser-v9.cjs
```

O workflow publica as capturas reais de teste como artefatos do GitHub Actions.
