# Asset notes

## Active Room 1 graphics

The current Manguezal das Ruínas V4 no longer loads the large external OpenGameArt sheets at runtime.

Room 1 uses two small local atlases stored as base64 text:
- `assets/room1_tiles.b64`
- `assets/room1_landmarks.b64`

They are cached into static canvas layers so tile rendering is not repeated every frame.

## References evaluated during the redesign

The following resources were researched as references, but are not loaded by the current V4 runtime:

- CraftPix / Free Game Assets — Free Swamp 2D Tileset Pixel Art
  https://free-game-assets.itch.io/free-swamp-2d-tileset-pixel-art

- egordorichev — Adve (CC0)
  https://egordorichev.itch.io/adve

- VEXED — Paper Pixels / Swamp biome (CC0)
  https://v3x3d.itch.io/paper-pixels

- Gurigraphics — Free platformer tileset (CC0)
  https://gurigraphics.itch.io/free-tileset-platformer
