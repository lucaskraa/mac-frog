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
    map: [3, 4],
    width: 1440,
    floors: [floorSeg(0, 1440)],
    platforms: [
      p(150, 690, 170, "stone"),
      p(380, 610, 160, "stone"),
      p(600, 520, 160, "stone"),
      p(815, 430, 160, "azulejo"),
      p(1030, 335, 160, "azulejo"),
      p(1215, 240, 160, "shrine")
    ],
    walls: [wall(0, 210, 550), wall(1392, 210, 550)],
    anchors: [
      { x: 510, y: 465, grabRange: 300, kind: "vine" },
      { x: 925, y: 345, grabRange: 300, kind: "chain" },
      { x: 1250, y: 155, grabRange: 280, kind: "vine" }
    ],
    exits: [
      exitDef("left", "arvore", 500, 900),
      exitDef("top", "santuario", 1160, 1400)
    ],
    enemies: [
      { type: "ghost", x: 700, y: 420, min: 600, max: 900 }
    ],
    landmark: "tower"
  },

  santuario: {
    name: "Santuário da Água",
    zone: "green",
    map: [3, 3],
    width: 1536,
    floors: [floorSeg(0, 1536)],
    platforms: [
      p(160, 670, 190, "shrine"),
      p(430, 570, 180, "azulejo"),
      p(700, 475, 180, "shrine"),
      p(980, 375, 200, "shrine"),
      p(1220, 520, 170, "stone")
    ],
    anchors: [
      { x: 560, y: 390, grabRange: 300, kind: "vine" },
      { x: 880, y: 310, grabRange: 300, kind: "root" }
    ],
    exits: [
      exitDef("bottom", "torre", 1140, 1440),
      exitDef("right", "hub", 320, 760, true)
    ],
    enemies: [{ type: "ghost", x: 1220, y: 410, min: 1100, max: 1340 }],
    landmark: "shrine",
    waterFly: { x: 1040, y: 315 }
  },

  aqueduto: {
    name: "Aqueduto Afogado",
    zone: "blue",
    map: [3, 6],
    width: 1776,
    floors: [floorSeg(0, 450), floorSeg(760, 380), floorSeg(1420, 356)],
    platforms: [
      p(250, 650, 160, "stone"),
      p(530, 585, 160, "wood"),
      p(850, 650, 160, "stone"),
      p(1120, 560, 160, "azulejo"),
      p(1360, 470, 150, "stone")
    ],
    pits: [{ x: 450, width: 310 }, { x: 1140, width: 280 }],
    anchors: [
      { x: 610, y: 430, grabRange: 310, kind: "chain" },
      { x: 1260, y: 380, grabRange: 320, kind: "root" }
    ],
    exits: [
      exitDef("left", "canal", 520, 900),
      exitDef("top", "hub", 1320, 1700)
    ],
    enemies: [
      { type: "spider", x: 870, surfaceY: 760, min: 800, max: 1080 },
      { type: "thing", x: 1190, surfaceY: 560, min: 1120, max: 1270 }
    ],
    landmark: "aqueduct"
  },

  hub: {
    name: "Pátio das Águas",
    zone: "blue",
    map: [3, 5],
    width: 1632,
    floors: [floorSeg(0, 1632)],
    platforms: [
      p(210, 685, 210, "moss"),
      p(500, 600, 190, "stone"),
      p(810, 600, 190, "shrine"),
      p(1120, 510, 190, "stone")
    ],
    exits: [
      exitDef("bottom", "aqueduto", 1280, 1600),
      exitDef("left", "santuario", 260, 760, true),
      exitDef("right", "claustro", 460, 900)
    ],
    enemies: [{ type: "thing", x: 1150, surfaceY: 510, min: 1120, max: 1300 }],
    landmark: "courtyard",
    checkpoint: true
  },

  claustro: {
    name: "Claustro do Lodo",
    zone: "blue",
    map: [4, 5],
    width: 1776,
    floors: [floorSeg(0, 1776)],
    platforms: [
      p(180, 690, 200, "stone"),
      p(460, 615, 180, "stone"),
      p(730, 535, 180, "azulejo"),
      p(990, 615, 190, "wood"),
      p(1270, 520, 190, "stone"),
      p(1510, 630, 190, "stone")
    ],
    walls: [wall(680, 380, 380), wall(1450, 420, 340)],
    exits: [
      exitDef("left", "hub", 460, 900),
      exitDef("right", "saida", 500, 900)
    ],
    enemies: [
      { type: "spider", x: 520, surfaceY: 615, min: 460, max: 640 },
      { type: "ghost", x: 1080, y: 500, min: 980, max: 1210 },
      { type: "thing", x: 1300, surfaceY: 520, min: 1270, max: 1460 }
    ],
    landmark: "cloister"
  },

  saida: {
    name: "Portão das Correntes",
    zone: "blue",
    map: [5, 5],
    width: 1536,
    floors: [floorSeg(0, 1536)],
    platforms: [
      p(200, 690, 210, "stone"),
      p(500, 610, 190, "stone"),
      p(810, 530, 190, "azulejo"),
      p(1120, 610, 180, "stone")
    ],
    exits: [
      exitDef("left", "claustro", 500, 900),
      { side: "right", dest: "__NEXT_AREA__", from: 520, to: 900 }
    ],
    enemies: [
      { type: "thing", x: 850, surfaceY: 530, min: 810, max: 1000 }
    ],
    landmark: "gate"
  }
};

function a1AssetReady(name) {
  const img = A1.assets[name];
  return !!(img && img.complete && img.naturalWidth > 0);
}

function a1CurrentRoom() {
  return A1.rooms[A1.node];
}

function a1ResetEnemyList(room) {
  A1.enemies.length = 0;
  enemy.alive = false;

  for (const e of room.enemies || []) {
    const type = e.type;
    const dims = type === "thing"
      ? { w: 56, h: 74, hp: 100, speed: 46, damage: 13 }
      : type === "ghost"
        ? { w: 52, h: 72, hp: 70, speed: 40, damage: 11 }
        : { w: 56, h: 34, hp: 65, speed: 62, damage: 9 };

    A1.enemies.push({
      type,
      x: e.x,
      y: e.y ?? ((e.surfaceY ?? 760) - dims.h),
      baseY: e.y ?? ((e.surfaceY ?? 760) - dims.h),
      surfaceY: e.surfaceY ?? 760,
      min: e.min ?? e.x - 100,
      max: e.max ?? e.x + 100,
      dir: 1,
      w: dims.w,
      h: dims.h,
      hp: dims.hp,
      maxHp: dims.hp,
      speed: dims.speed,
      damage: dims.damage,
      attackCooldown: 0,
      hurtTimer: 0,
      frame: 0,
      frameTimer: 0,
      time: Math.random() * 10,
      alive: true
    });
  }
}

function a1RoomGeometry(room) {
  platforms.length = 0;
  walls.length = 0;
  solids.length = 0;

  for (const p of room.platforms || []) {
    platforms.push({ x:p.x, y:p.y, width:p.width, height:p.height, style:p.style });
  }
  for (const w of room.walls || []) {
    walls.push({ ...w });
  }

  solids.push(...room.floors, ...platforms, ...walls);

  // Water progression gates live in room geometry, not in visual-only code.
  for (const ex of room.exits || []) {
    if (!ex.requiresWater || mac.waterPower) continue;

    if (ex.side === "right") {
      solids.push({ x: room.width - 48, y: ex.from, width: 48, height: Math.max(48, ex.to - ex.from) });
    } else if (ex.side === "left") {
      solids.push({ x: 0, y: ex.from, width: 48, height: Math.max(48, ex.to - ex.from) });
    } else if (ex.side === "top") {
      solids.push({ x: ex.from, y: 0, width: Math.max(48, ex.to - ex.from), height: 48 });
    } else if (ex.side === "bottom") {
      solids.push({ x: ex.from, y: 820, width: Math.max(48, ex.to - ex.from), height: 80 });
    }
  }

  // Closed edges get invisible collision walls.
  const hasLeft = room.exits?.some(e => e.side === "left");
  const hasRight = room.exits?.some(e => e.side === "right");
  if (!hasLeft) solids.push({ x:0, y:0, width:24, height:900 });
  if (!hasRight) solids.push({ x:room.width-24, y:0, width:24, height:900 });
}

function a1EntryPosition(room, entryDir) {
  const safeY = ground.y - mac.normalHeight;
  const reverse = (room.exits || []).find(ex => ex.dest === A1.previousNode);

  if (reverse) {
    if (reverse.side === "left") {
      return { x: 82, y: Math.max(90, Math.min(safeY, (reverse.from + reverse.to) / 2 - mac.height / 2)) };
    }
    if (reverse.side === "right") {
      return { x: room.width - 120, y: Math.max(90, Math.min(safeY, (reverse.from + reverse.to) / 2 - mac.height / 2)) };
    }
    if (reverse.side === "top") {
      return { x: Math.max(70, Math.min(room.width - 120, (reverse.from + reverse.to) / 2)), y: 110 };
    }
    if (reverse.side === "bottom") {
      return { x: Math.max(70, Math.min(room.width - 120, (reverse.from + reverse.to) / 2)), y: safeY };
    }
  }

  if (entryDir === "right") return { x: room.width - 120, y: safeY };
  if (entryDir === "top") return { x: Math.min(room.width - 120, room.width * 0.72), y: 110 };
  if (entryDir === "bottom") return { x: Math.min(room.width - 120, room.width * 0.72), y: safeY };
  return { x: 90, y: safeY };
}

function a1LoadNode(nodeId, entryDir = "left", preserveMac = false) {
  const room = A1.rooms[nodeId];
  if (!room) return;

  A1.previousNode = A1.node;
  A1.node = nodeId;
  A1.entryDir = entryDir;
  A1.roomWidth = room.width;
  A1.discovered.add(nodeId);
  A1.transitionCooldown = 0.32;
  A1.roomCacheDirty = true;

  roomNames[0] = "Área 1 - " + room.name;
  a1RoomGeometry(room);
  a1ResetEnemyList(room);

  cancelMacActions();
  waterShots.length = 0;
  windBlades.length = 0;
  waterBurst.active = false;
  windGust.active = false;
  waterUltimate.active = false;
  windUltimate.active = false;

  waterFly.alive = false;
  windFly.alive = false;

  if (room.waterFly && !waterFly.collected) {
    waterFly.x = room.waterFly.x;
    waterFly.baseX = room.waterFly.x;
    waterFly.baseY = room.waterFly.y;
    waterFly.y = room.waterFly.y;
    waterFly.hoverTime = 0;
    waterFly.alive = true;
  }

  // Single real checkpoint for Area 1, at the central blue hub.
  if (room.checkpoint) {
    checkpoints[0].x = A1.checkpointX;
    checkpoints[0].y = 680;
  } else {
    checkpoints[0].x = -9999;
    checkpoints[0].y = 680;
  }

  if (!preserveMac) {
    const pos = a1EntryPosition(room, entryDir);
    mac.x = pos.x;
    mac.y = pos.y;
    mac.vx = 0;
    mac.vy = 0;
    mac.height = mac.normalHeight;
    mac.grounded = false;
  }

  camera.x = Math.max(0, Math.min(mac.x - WIDTH * 0.35, Math.max(0, room.width - WIDTH)));
  camera.y = Math.max(0, Math.min(mac.y - HEIGHT * 0.50, Math.max(0, A1.roomHeight - HEIGHT)));

  if (A1.roomCacheId !== nodeId) {
    A1.roomCacheId = nodeId;
    A1.roomCache = document.createElement("canvas");
    A1.roomCache.width = room.width;
    A1.roomCache.height = A1.roomHeight;
    A1.roomCacheCtx = A1.roomCache.getContext("2d");
    A1.roomCacheCtx.imageSmoothingEnabled = false;
  }
}

function a1HasWater() {
  return !!mac.waterPower;
}

function a1CanUseExit(exit) {
  return !exit.requiresWater || a1HasWater();
}

function a1Transition(exit) {
  if (!exit || A1.transitionCooldown > 0) return;

  if (!a1CanUseExit(exit)) {
    mac.vx *= -0.25;
    mac.vy = Math.max(mac.vy, 0);
    return;
  }

  if (exit.dest === "__NEXT_AREA__") {
    __a1BaseLoadRoom(1, "left");
    return;
  }

  const opposite = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top"
  }[exit.side] || "left";

  a1LoadNode(exit.dest, opposite, false);
}

function a1CheckTransitions(dt) {
  if (currentRoom !== 0) return;
  A1.transitionCooldown = Math.max(0, A1.transitionCooldown - dt);
  if (A1.transitionCooldown > 0) return;

  const room = a1CurrentRoom();
  const cx = mac.x + mac.width / 2;
  const cy = mac.y + mac.height / 2;

  for (const ex of room.exits || []) {
    if (ex.side === "right" && mac.x + mac.width >= room.width - 8 && cy >= ex.from && cy <= ex.to) {
      a1Transition(ex); return;
    }
    if (ex.side === "left" && mac.x <= 8 && cy >= ex.from && cy <= ex.to) {
      a1Transition(ex); return;
    }
    if (
      ex.side === "top" &&
      mac.y <= 175 &&
      cx >= ex.from &&
      cx <= ex.to &&
      (keys["w"] || keys["arrowup"])
    ) {
      a1Transition(ex); return;
    }
    if (
      ex.side === "bottom" &&
      mac.grounded &&
      cy >= 620 &&
      cx >= ex.from &&
      cx <= ex.to &&
      (keys["s"] || keys["arrowdown"])
    ) {
      a1Transition(ex); return;
    }
  }
}

function a1ClampToRoom() {
  if (currentRoom !== 0) return;
  const room = a1CurrentRoom();
  mac.x = Math.max(0, Math.min(mac.x, room.width - mac.width));
}

const __a1BaseUpdateCamera = updateCamera;
updateCamera = function(dt) {
  if (currentRoom !== 0) {
    __a1BaseUpdateCamera(dt);
    return;
  }

  const room = a1CurrentRoom();
  const maxX = Math.max(0, room.width - WIDTH);
  const maxY = Math.max(0, A1.roomHeight - HEIGHT);
  const targetX = Math.max(0, Math.min(mac.x + mac.width / 2 - WIDTH / 2, maxX));
  const targetY = Math.max(0, Math.min(mac.y + mac.height / 2 - HEIGHT / 2, maxY));
  const f = Math.min(1, 7.5 * dt);
  camera.x += (targetX - camera.x) * f;
  camera.y += (targetY - camera.y) * f;
};

const __a1BaseSnapCamera = snapCameraToMac;
snapCameraToMac = function() {
  if (currentRoom !== 0) {
    __a1BaseSnapCamera();
    return;
  }

  const room = a1CurrentRoom();
  camera.x = Math.max(0, Math.min(mac.x + mac.width / 2 - WIDTH / 2, Math.max(0, room.width - WIDTH)));
  camera.y = Math.max(0, Math.min(mac.y + mac.height / 2 - HEIGHT / 2, Math.max(0, A1.roomHeight - HEIGHT)));
};

const __a1BaseLoadRoom = loadRoom;
loadRoom = function(index, entrySide = "left") {
  __a1BaseLoadRoom(index, entrySide);

  if (index !== 0) return;

  // Respawn at the hub if its checkpoint has been activated.
  const node = respawnPoint.checkpointId === checkpoints[0].id
    ? A1.checkpointNode
    : "entrada";

  a1LoadNode(node, entrySide === "right" ? "right" : "left", false);
};

const __a1BaseUpdateRoomTransition = updateRoomTransition;
updateRoomTransition = function(dt) {
  if (currentRoom === 0) {
    a1CheckTransitions(dt);
    return;
  }
  __a1BaseUpdateRoomTransition(dt);
};

// ----- Enemy system -----
function a1EnemyHitbox(e) {
  return { x:e.x, y:e.y, width:e.w, height:e.h };
}

function a1DamageEnemy(e, damage) {
  if (!e || !e.alive) return;
  e.hp -= damage;
  e.hurtTimer = 0.12;
  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
  }
}

function a1HitFirst(hitbox, damage) {
  if (!hitbox) return false;
  for (const e of A1.enemies) {
    if (!e.alive) continue;
    if (rectsOverlap(hitbox, a1EnemyHitbox(e))) {
      a1DamageEnemy(e, damage);
      return true;
    }
  }
  return false;
}

function a1UpdateCombatHits() {
  if (currentRoom !== 0) return;

  if (tongue.active && !grapple.active && !tongue.didHitEnemy) {
    if (a1HitFirst(getTongueHitbox(), 15)) tongue.didHitEnemy = true;
  }
  if (normalAttack.active && normalAttack.hitboxActive && !normalAttack.didHitEnemy) {
    if (a1HitFirst(getNormalAttackHitbox(), 25)) normalAttack.didHitEnemy = true;
  }
  for (let i = waterShots.length - 1; i >= 0; i--) {
    const s = waterShots[i];
    if (a1HitFirst({ x:s.x-s.radius, y:s.y-s.radius, width:s.radius*2, height:s.radius*2 }, 20)) {
      waterShots.splice(i, 1);
    }
  }
  if (waterBurst.active && !waterBurst.didHitEnemy && a1HitFirst(getWaterBurstHitbox(), 35)) {
    waterBurst.didHitEnemy = true;
  }
  for (let i = windBlades.length - 1; i >= 0; i--) {
    const b = windBlades[i];
    if (a1HitFirst({ x:b.x, y:b.y, width:b.width, height:b.height }, 20)) windBlades.splice(i, 1);
  }
  if (windGust.active && !windGust.didHitEnemy && a1HitFirst(getWindGustHitbox(), 35)) {
    windGust.didHitEnemy = true;
  }
}

function a1UpdateEnemies(dt) {
  if (currentRoom !== 0) return;

  for (const e of A1.enemies) {
    if (!e.alive) continue;
    e.time += dt;
    e.frameTimer += dt;
    e.attackCooldown = Math.max(0, e.attackCooldown - dt);
    e.hurtTimer = Math.max(0, e.hurtTimer - dt);

    if (e.frameTimer >= 0.14) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 4;
    }

    const mx = mac.x + mac.width / 2;
    const my = mac.y + mac.height / 2;
    const ex = e.x + e.w / 2;
    const ey = e.y + e.h / 2;
    const dx = mx - ex;
    const dy = my - ey;
    const dist = Math.hypot(dx, dy);

    if (e.type === "ghost") {
      if (dist < 330 && dist > 1) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
      } else {
        e.y = e.baseY + Math.sin(e.time * 2.1) * 20;