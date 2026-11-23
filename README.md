# Mac Frog V10 — Metamorphosis (DESENVOLVIMENTO, NÃO PUBLICAR)

> A versão pública permanece na `main`. Este trabalho fica na branch `feature/mac-frog-v10-metamorphosis` até cumprir os requisitos completos de arte, animação e gameplay. **Testes automáticos aprovados não significam que a versão final esteja pronta.**

## Implementado na V10

- **Combate:** combo básico de quatro golpes (dois socos e dois chutes), janelas de ataque e testes de dano real contra a Lacraia.
- **Essências:** oito formas registradas, captura de moscas especiais pela língua, seleção, persistência, energia, dois golpes especiais e uma ultimate por forma; testes de ativação em Chromium.
- **Transformações:** atlas pixel-art em 8 estados × 8 frames para a forma base e as oito transformações, com silhuetas diferentes e hitboxes base preservadas.
- **Cenários:** um sistema de tiles com 7 biomas, 4 estilos de material e 4 variantes de textura cada. Pisos de pedra, musgo, madeira e templos possuem bordas, juntas, raízes, musgo, fraturas e molduras de passagens.
- **Arte gerada original:** atlas de motivos de arquitetura pantanosa e ruínas incorporado ao fundo das salas como mosaicos pixelados.
- **Recursos CC0:** quatro camadas GothicVania Swamp (Ansimuz) recuperadas para o parallax dos biomas mangue e raízes e pequenos motivos vegetais do tileset original. Crédito em `ASSET_CREDITS.md`.
- **Inimigos e mini-boss:** atlas PNG transparente com quatro frames de cada besouro, larva, mosca e Lacraia. A lógica dos ataques, avisos e colisões permanece no sistema da V9.
- **Regressões:** continuam os testes da V8 e V9, inclusive 136 direções de portas e 33 descidas pela gravidade.
- **Ferramentas de teste:** `tests/area1-v10.test.cjs`, `tests/browser-v10.cjs`, workflow `.github/workflows/mac-frog-v10.yml`. O Chromium gera capturas de biomas, formas e chefes.

## Pendências que bloqueiam o lançamento

- [ ] Redesenhar a arte de todas as oito transformações com animações frame a frame específicas para corrida, pulo, socos, chutes, dois especiais, ultimate, dano e morte.
- [ ] Criar e validar spritesheets detalhadas e animações exclusivas para todos os inimigos restantes.
- [ ] Redesenhar o chefão sapo tribal e completar testes manuais de todas as fases e padrões de ataque.
- [ ] Substituir os cenários ainda genéricos em **todas** as salas por composições de pixel art mais ricas, com biomas e pontos de interesse únicos.
- [ ] Realizar campanhas completas com progressão normal, reentrada em salas, coleta de poderes, saves e derrotas de bosses sem usar comandos de depuração.
- [ ] Revisar legibilidade dos elementos de HUD, efeitos e animações, corrigindo problemas identificados em capturas reais.
- [ ] Validar balanceamento e desempenho em computadores de desempenho limitado.

**Critério:** não misturar na `main` apenas pelo número de testes passando. O jogo exige revisão visual e uma campanha completa jogada do início ao fim.

---

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
