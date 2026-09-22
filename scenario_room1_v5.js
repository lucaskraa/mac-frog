// ============================================================
// AREA 1 V5 — GRAPH-BASED METROIDVANIA / GOTHICVANIA SWAMP ART
// Base: game_v25.html only. No old scenario rendering required.
// Art: Ansimuz Gothicvania Swamp (CC0), loaded locally from b64 files.
// Design: hand-authored room graph inspired by the user's map.
// ============================================================

roomNames[0] = "Área 1 - Manguezal das Ruínas";

const A1 = {
  node: "entrada",
  previousNode: null,
  entryDir: "left",
  roomWidth: 1600,
  roomHeight: 900,
  transitionCooldown: 0,
  transitionLock: false,
  lastWaterPower: mac.waterPower,
  roomCache: null,
  roomCacheCtx: null,
  roomCacheId: null,
  roomCacheDirty: true,
  enemies: [],
  checkpointNode: "hub",
  checkpointX: 760,
  mapOpened: true,
  discovered: new Set(["entrada"]),
  assets: {},
  assetsReady: 0,
  assetsTotal: 8,
  bootReconciled: false,
  zoneColors: {
    red: "#a83b35",
    blue: "#3654a8",
    green: "#3f8647",
    purple: "#78438f"
  }
};

function a1Image(name, path) {
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    A1.assetsReady++;
    A1.roomCacheDirty = true;
  };
  img.onerror = () => {
    console.warn("A1 asset failed:", name, path);
  };
  fetch(path, { cache: "force-cache" })
    .then(r => r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status)))
    .then(b64 => {
      img.src = "data:image/png;base64," + b64.trim();
    })
    .catch(error => console.warn("A1 asset fetch failed:", name, error));
  A1.assets[name] = img;
  return img;
}

a1Image("bg", "./assets/gothicvania-swamp/background.b64");
a1Image("mid1", "./assets/gothicvania-swamp/mid-layer-01.b64");
a1Image("mid2", "./assets/gothicvania-swamp/mid-layer-02.b64");
a1Image("trees", "./assets/gothicvania-swamp/trees.b64");
a1Image("tileset", "./assets/gothicvania-swamp/tileset.b64");
a1Image("ghost", "./assets/gothicvania-swamp/ghost.b64");
a1Image("thing", "./assets/gothicvania-swamp/thing.b64");
a1Image("spider", "./assets/gothicvania-swamp/spider.b64");

const T = 48; // 16px source tile * 3 => crisp 16-bit scale

function p(x, y, w, style = "stone") {
  return { x, y, width: w, height: 24, style };
}
function wall(x, y, h, w = 48) {
  return { x, y, width: w, height: h };
}
function floorSeg(x, w) {
  return { x, y: 760, width: w, height: 140 };
}
function exitDef(side, dest, from = 0, to = 900, requiresWater = false) {
  return { side, dest, from, to, requiresWater };
}

// Layout approximates the branching shape from the user's uploaded map:
// red lower-left -> green upper branch -> blue right route,
// with a purple optional branch looping back into the central spine.
A1.rooms = {
  entrada: {
    name: "Porto Abandonado",
    zone: "red",
    map: [1, 6],
    width: 1584,
    floors: [floorSeg(0, 1584)],
    platforms: [
      p(180, 690, 220, "moss"),
      p(500, 620, 190, "stone"),
      p(790, 555, 190, "stone"),
      p(1100, 630, 190, "wood")
    ],
    walls: [wall(1450, 590, 170)],
    exits: [exitDef("right", "canal", 560, 900)],
    enemies: [
      { type: "spider", x: 620, surfaceY: 760, min: 520, max: 820 }
    ],
    landmark: "dock"
  },

  canal: {
    name: "Canal das Raízes",
    zone: "red",
    map: [2, 6],
    width: 1728,
    floors: [floorSeg(0, 480), floorSeg(820, 430), floorSeg(1510, 218)],
    platforms: [
      p(300, 650, 160, "wood"),
      p(585, 590, 160, "stone"),
      p(915, 650, 160, "moss"),
      p(1180, 575, 160, "stone"),
      p(1400, 490, 120, "stone")
    ],
    walls: [wall(1080, 600, 160)],
    pits: [{ x: 480, width: 340 }, { x: 1250, width: 260 }],
    anchors: [
      { x: 650, y: 430, grabRange: 320, kind: "root" },
      { x: 1370, y: 390, grabRange: 310, kind: "vine" }
    ],
    exits: [
      exitDef("left", "entrada", 560, 900),
      exitDef("top", "poco", 1280, 1600),
      exitDef("right", "aqueduto", 520, 900, true)
    ],
    enemies: [
      { type: "spider", x: 930, surfaceY: 760, min: 860, max: 1100 },
      { type: "thing", x: 1320, surfaceY: 575, min: 1180, max: 1340 }
    ],
    landmark: "flood"
  },

  poco: {
    name: "Poço das Raízes",
    zone: "red",
    map: [2, 5],
    width: 1392,
    floors: [floorSeg(0, 1392)],
    platforms: [
      p(160, 685, 150, "root"),
      p(360, 600, 150, "stone"),
      p(565, 520, 150, "root"),
      p(770, 430, 150, "stone"),
      p(960, 335, 150, "root"),
      p(1140, 245, 150, "stone")
    ],
    walls: [wall(0, 120, 640), wall(1344, 120, 640)],
    anchors: [
      { x: 460, y: 475, grabRange: 300, kind: "vine" },
      { x: 860, y: 305, grabRange: 300, kind: "root" },
      { x: 1190, y: 170, grabRange: 280, kind: "vine" }
    ],
    exits: [
      exitDef("bottom", "canal", 1120, 1370),
      exitDef("top", "arvore", 1040, 1340),
      exitDef("left", "capela", 150, 520)
    ],
    enemies: [
      { type: "ghost", x: 720, y: 420, min: 610, max: 880 }
    ],
    landmark: "well"
  },

  capela: {
    name: "Capela Submersa",
    zone: "purple",
    map: [1, 5],
    width: 1536,
    floors: [floorSeg(0, 1536)],
    platforms: [
      p(220, 640, 220, "stone"),
      p(520, 545, 190, "stone"),
      p(820, 620, 210, "wood"),
      p(1120, 520, 190, "stone")
    ],
    walls: [wall(690, 370, 390)],
    exits: [
      exitDef("right", "poco", 140, 560),
      exitDef("left", "prisao", 520, 900)
    ],
    enemies: [
      { type: "thing", x: 570, surfaceY: 545, min: 520, max: 700 },
      { type: "ghost", x: 1070, y: 480, min: 980, max: 1200 }
    ],
    landmark: "chapel"
  },

  prisao: {
    name: "Celas do Mangue",
    zone: "purple",
    map: [0, 5],
    width: 1584,
    floors: [floorSeg(0, 620), floorSeg(850, 734)],
    platforms: [
      p(180, 670, 180, "stone"),
      p(430, 590, 150, "stone"),
      p(900, 650, 190, "wood"),
      p(1160, 565, 190, "stone")
    ],
    pits: [{ x: 620, width: 230 }],
    anchors: [{ x: 735, y: 455, grabRange: 320, kind: "chain" }],
    walls: [wall(1360, 440, 320)],
    exits: [
      exitDef("right", "capela", 520, 900),
      exitDef("top", "reliquia", 1320, 1520)
    ],
    enemies: [
      { type: "spider", x: 290, surfaceY: 760, min: 180, max: 480 },
      { type: "thing", x: 1040, surfaceY: 650, min: 900, max: 1090 }
    ],
    landmark: "prison"
  },

  reliquia: {
    name: "Relicário Esquecido",
    zone: "purple",
    map: [0, 4],
    width: 1320,
    floors: [floorSeg(0, 1320)],
    platforms: [
      p(190, 625, 220, "shrine"),
      p(520, 535, 210, "stone"),
      p(850, 435, 220, "shrine")
    ],
    exits: [
      exitDef("bottom", "prisao", 1050, 1300),
      exitDef("right", "arvore", 240, 700, true)
    ],
    enemies: [{ type: "ghost", x: 720, y: 400, min: 620, max: 900 }],
    landmark: "relic"
  },

  arvore: {
    name: "Mangue Ancestral",
    zone: "green",
    map: [2, 4],
    width: 1840,
    floors: [floorSeg(0, 1840)],
    platforms: [
      p(180, 690, 220, "root"),
      p(480, 600, 190, "root"),
      p(780, 520, 180, "root"),
      p(1110, 610, 190, "stone"),
      p(1390, 510, 180, "root")
    ],
    anchors: [
      { x: 660, y: 400, grabRange: 320, kind: "root" },
      { x: 1240, y: 395, grabRange: 320, kind: "vine" }
    ],
    exits: [
      exitDef("bottom", "poco", 1000, 1340),
      exitDef("left", "reliquia", 240, 700, true),
      exitDef("right", "torre", 500, 900)
    ],
    enemies: [
      { type: "thing", x: 1130, surfaceY: 610, min: 1110, max: 1300 },
      { type: "spider", x: 1480, surfaceY: 510, min: 1390, max: 1570 }
    ],
    landmark: "giantTree"
  },

  torre: {
    name: "Torre das Marés",
    zone: "green",