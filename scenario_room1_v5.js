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
        e.y = e.baseY + Math.sin(e.time * 2.1) * 20;        e.x += e.dir * 12 * dt;
        if (e.x < e.min || e.x > e.max) e.dir *= -1;
      }
    } else {
      const sameLevel = Math.abs(dy) < 110;
      const chase = sameLevel && Math.abs(dx) < 285;
      const speed = chase ? e.speed * 1.45 : e.speed;
      e.dir = chase ? (dx >= 0 ? 1 : -1) : e.dir;
      e.x += e.dir * speed * dt;
      if (e.x <= e.min) { e.x = e.min; e.dir = 1; }
      if (e.x + e.w >= e.max) { e.x = e.max - e.w; e.dir = -1; }
      e.y = e.surfaceY - e.h;
    }

    if (!mac.dead && e.attackCooldown <= 0 && rectsOverlap(a1EnemyHitbox(e), getMacHitbox())) {
      damageMac(e.damage, e.x + e.w / 2);
      e.attackCooldown = 0.85;
    }
  }
}

const __a1BaseUpdateEnemy = updateEnemy;
updateEnemy = function(dt) {
  if (currentRoom !== 0) {
    __a1BaseUpdateEnemy(dt);
    return;
  }
  a1UpdateEnemies(dt);
};

const __a1BaseUpdate = update;
update = function(dt) {
  __a1BaseUpdate(dt);
  if (currentRoom !== 0) return;
  a1ClampToRoom();
  a1UpdateCombatHits();

  if (A1.lastWaterPower !== mac.waterPower) {
    A1.lastWaterPower = mac.waterPower;
    a1RoomGeometry(a1CurrentRoom());
    A1.roomCacheDirty = true;
  }

  // loadSavedGame() restores the checkpoint id after calling loadRoom().
  // Reconcile that ordering once, without moving the saved Mac position.
  if (!A1.bootReconciled) {
    A1.bootReconciled = true;

    if (
      currentCheckpointId === checkpoints[0].id &&
      A1.node !== A1.checkpointNode
    ) {
      const savedX = mac.x;
      const savedY = mac.y;

      a1LoadNode(A1.checkpointNode, "left", true);

      mac.x = savedX;
      mac.y = savedY;
      snapCameraToMac();
    }
  }
};

// ----- Grapple anchors -----
function a1AnchorCandidate() {
  const room = a1CurrentRoom();
  const origin = getTongueOrigin();
  let best = null;
  let bestScore = Infinity;

  for (const a of room.anchors || []) {
    const d = distance(origin.x, origin.y, a.x, a.y);
    if (d > a.grabRange) continue;
    if (!tongueLineClearToPoint(a.x, a.y)) continue;
    const direction = a.x >= origin.x ? 1 : -1;
    if (direction !== mac.facing && d > 180) continue;
    const score = d + (a.y < origin.y ? -28 : 0);
    if (score < bestScore) {
      best = a;
      bestScore = score;
    }
  }
  return best;
}

const __a1BaseCanGrabPoint = canGrabPoint;
canGrabPoint = function() {
  if (currentRoom !== 0) return __a1BaseCanGrabPoint();
  if (grapple.active) return true;
  const a = a1AnchorCandidate();
  if (!a) return false;
  grapplePoint.x = a.x;
  grapplePoint.y = a.y;
  grapplePoint.radius = 12;
  grapplePoint.grabRange = a.grabRange;
  return true;
};

// ----- Art helpers -----
function a1DrawFrame(img, frame, fw, fh, x, y, scale = 2, flip = false, alpha = 1) {
  if (!(img && img.complete && img.naturalWidth)) return false;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(Math.round(x + fw * scale), Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(img, frame * fw, 0, fw, fh, 0, 0, fw * scale, fh * scale);
  } else {
    ctx.drawImage(img, frame * fw, 0, fw, fh, Math.round(x), Math.round(y), fw * scale, fh * scale);
  }
  ctx.restore();
  return true;
}

function a1Tile(ctx2, tileValue, x, y, scale = 3) {
  const img = A1.assets.tileset;
  if (!(img && img.complete && img.naturalWidth)) return false;
  const idx = Math.max(0, tileValue - 1);
  const sx = (idx % 21) * 16;
  const sy = Math.floor(idx / 21) * 16;
  ctx2.imageSmoothingEnabled = false;
  ctx2.drawImage(img, sx, sy, 16, 16, Math.round(x), Math.round(y), 16 * scale, 16 * scale);
  return true;
}

function a1DrawRectTiles(ctx2, rect, style = "stone") {
  const tileScale = 3;
  const ts = 16 * tileScale;
  const topTile = style === "wood" ? 3 : 2;
  const bodyTile = 1;

  // One crisp surface row aligned to collision top.
  for (let x = rect.x; x < rect.x + rect.width; x += ts) {
    a1Tile(ctx2, topTile, x, rect.y - ts + 24, tileScale);
  }

  // Stone body only where the collision has real thickness.
  const targetDepth = Math.max(rect.height, style === "wood" ? 24 : 72);
  for (let y = rect.y + 12; y < rect.y + targetDepth; y += ts) {
    for (let x = rect.x; x < rect.x + rect.width; x += ts) {
      a1Tile(ctx2, bodyTile, x, y, tileScale);
    }
  }

  if (style === "shrine" || style === "azulejo") {
    ctx2.fillStyle = "rgba(43,151,164,.58)";
    for (let x = rect.x + 12; x < rect.x + rect.width - 12; x += 32) {
      ctx2.fillRect(x, rect.y + 4, 12, 4);
    }
  }
}

function a1DrawBackgroundLayer(img, speed, scale, yOffset = 0, alpha = 1) {
  if (!(img && img.complete && img.naturalWidth)) return;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const scroll = (camera.x * speed) % dw;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  for (let x = -scroll - dw; x < WIDTH + dw; x += dw) {
    ctx.drawImage(img, Math.round(x), Math.round(HEIGHT - dh + yOffset), dw, dh);
  }
  ctx.restore();
}

function a1DrawParallax() {
  ctx.fillStyle = "#071015";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  a1DrawBackgroundLayer(A1.assets.bg, 0.03, 3, 0, 1);
  a1DrawBackgroundLayer(A1.assets.mid1, 0.12, 3, 0, 0.95);
  a1DrawBackgroundLayer(A1.assets.mid2, 0.25, 3, 0, 0.92);
  a1DrawBackgroundLayer(A1.assets.trees, 0.48, 3, 0, 0.92);

  // Brazilian warm dawn accent without filtering the pixel assets.
  const g = ctx.createRadialGradient(WIDTH * 0.72, HEIGHT * 0.28, 12, WIDTH * 0.72, HEIGHT * 0.28, 270);
  g.addColorStop(0, "rgba(255,190,104,.16)");
  g.addColorStop(1, "rgba(255,190,104,0)");
  ctx.fillStyle = g;
  ctx.fillRect(WIDTH * 0.45, 0, WIDTH * 0.5, HEIGHT * 0.65);
}

function a1DrawLandmark(ctx2, room) {
  // Trees from the pack become room-specific landmarks; they are cached once.
  if (!(A1.assets.trees && A1.assets.trees.complete && A1.assets.trees.naturalWidth)) return;
  ctx2.save();
  ctx2.imageSmoothingEnabled = false;

  if (room.landmark === "giantTree") {
    ctx2.globalAlpha = 0.92;
    ctx2.drawImage(A1.assets.trees, 480, 80, 1150, 832);
    ctx2.drawImage(A1.assets.trees, 1030, 10, 900, 650);
  } else if (room.landmark === "chapel" || room.landmark === "cloister" || room.landmark === "tower") {
    ctx2.globalAlpha = 0.38;
    ctx2.drawImage(A1.assets.mid2, 220, 100, 624, 768);
    ctx2.drawImage(A1.assets.mid1, room.width - 760, 70, 624, 768);
  } else if (room.landmark === "shrine") {
    ctx2.globalAlpha = 0.32;
    ctx2.drawImage(A1.assets.mid1, 310, 40, 832, 820);
  } else if (room.landmark === "aqueduct") {
    ctx2.globalAlpha = 0.36;
    ctx2.drawImage(A1.assets.mid2, 120, 90, 1100, 830);
  } else {
    ctx2.globalAlpha = 0.24;
    ctx2.drawImage(A1.assets.mid1, 140, 100, 624, 768);
  }

  ctx2.restore();
}

function a1BuildRoomCache() {
  const room = a1CurrentRoom();
  if (!A1.roomCache || A1.roomCacheId !== A1.node) return;
  const c = A1.roomCacheCtx;
  c.clearRect(0, 0, A1.roomCache.width, A1.roomCache.height);
  c.imageSmoothingEnabled = false;

  a1DrawLandmark(c, room);

  // Floor segments get real tiles; only static geometry is cached.
  for (const f of room.floors || []) {
    c.fillStyle = "#102026";
    c.fillRect(f.x, f.y, f.width, f.height);
    a1DrawRectTiles(c, { x:f.x, y:f.y, width:f.width, height:90 }, "moss");
  }

  for (const plat of room.platforms || []) a1DrawRectTiles(c, plat, plat.style);
  for (const w of room.walls || []) a1DrawRectTiles(c, w, "stone");

  // Room-specific architecture: doors, cell bars, shrine plinths, etc.
  c.strokeStyle = "rgba(74,94,91,.85)";
  c.lineWidth = 7;
  if (["prison","chapel","cloister","gate"].includes(room.landmark)) {
    for (let x = 260; x < room.width - 200; x += 420) {
      c.strokeRect(x, 250, 180, 280);
      for (let bx = x + 20; bx < x + 180; bx += 30) {
        c.beginPath(); c.moveTo(bx, 250); c.lineTo(bx, 530); c.stroke();
      }
    }
  }

  A1.roomCacheDirty = false;
}

function a1DrawWater(room) {
  const t = performance.now() * 0.001;
  for (const pit of room.pits || []) {
    ctx.fillStyle = "#0b3b49";
    ctx.fillRect(pit.x, 760, pit.width, 140);
    ctx.fillStyle = "rgba(41,126,136,.42)";
    ctx.fillRect(pit.x, 760, pit.width, 44);
    ctx.fillStyle = "rgba(172,236,226,.42)";
    ctx.fillRect(pit.x, 760, pit.width, 3);
    for (let y = 780; y < 900; y += 28) {
      const phase = Math.round(Math.sin(t * 1.5 + y * .03) * 9);
      for (let x = pit.x + 10; x < pit.x + pit.width - 20; x += 64) {
        ctx.fillRect(x + phase, y, 28, 2);
      }
    }
  }
}

function a1DrawBlockedExit(ex) {
  if (!ex.requiresWater || mac.waterPower) return;
  const room = a1CurrentRoom();
  ctx.save();
  ctx.fillStyle = "rgba(35,150,173,.46)";
  ctx.strokeStyle = "rgba(151,239,240,.70)";
  ctx.lineWidth = 3;

  if (ex.side === "right") {
    const x = room.width - 46;
    ctx.fillRect(x, ex.from, 46, ex.to - ex.from);
    ctx.strokeRect(x, ex.from, 46, ex.to - ex.from);
  } else if (ex.side === "left") {
    ctx.fillRect(0, ex.from, 46, ex.to - ex.from);
    ctx.strokeRect(0, ex.from, 46, ex.to - ex.from);
  }

  ctx.restore();
}

function a1DrawAnchors() {
  const room = a1CurrentRoom();
  const origin = getTongueOrigin();

  for (const a of room.anchors || []) {
    const d = distance(origin.x, origin.y, a.x, a.y);
    const reachable = d <= a.grabRange && tongueLineClearToPoint(a.x, a.y);

    ctx.save();
    ctx.strokeStyle = a.kind === "chain" ? "#584f46" : (a.kind === "vine" ? "#3d684d" : "#5a3c26");
    ctx.lineWidth = a.kind === "chain" ? 5 : 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 68);
    ctx.quadraticCurveTo(a.x - 10, a.y - 30, a.x, a.y);
    ctx.stroke();

    ctx.fillStyle = reachable ? "#d4e997" : "#74895e";
    ctx.beginPath();
    ctx.ellipse(a.x, a.y, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function a1DrawEnemy(e) {
  if (!e.alive) return;
  const flip = e.dir < 0;
  const hurt = e.hurtTimer > 0;
  const frame = e.frame % 4;

  ctx.save();
  if (hurt) ctx.globalAlpha = 0.55;

  if (e.type === "thing") {
    if (!a1DrawFrame(A1.assets.thing, frame, 33, 45, e.x - 5, e.y - 15, 2, flip, 1)) {
      ctx.fillStyle = "#526b47"; ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  } else if (e.type === "ghost") {
    if (!a1DrawFrame(A1.assets.ghost, frame, 31, 44, e.x - 5, e.y - 10, 2, flip, .78)) {
      ctx.fillStyle = "rgba(182,157,222,.7)"; ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  } else {
    if (!a1DrawFrame(A1.assets.spider, frame, 32, 21, e.x - 4, e.y - 8, 2, flip, 1)) {
      ctx.fillStyle = "#784b3b"; ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  }

  ctx.globalAlpha = 1;
  const hp = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = "rgba(8,12,12,.75)";
  ctx.fillRect(e.x, e.y - 9, e.w, 4);
  ctx.fillStyle = "#b26d60";
  ctx.fillRect(e.x, e.y - 9, e.w * hp, 4);
  ctx.restore();
}

const __a1BaseDrawEnemy = drawEnemy;
drawEnemy = function() {
  if (currentRoom !== 0) {
    __a1BaseDrawEnemy();
    return;
  }
  for (const e of A1.enemies) a1DrawEnemy(e);
};

const __a1BaseDrawGrapple = drawGrapplePoint;
drawGrapplePoint = function() {
  if (currentRoom !== 0) {
    __a1BaseDrawGrapple();
    return;
  }
  a1DrawAnchors();
};

const __a1BaseDrawCheckpoint = drawCheckpoint;
drawCheckpoint = function() {
  if (currentRoom !== 0) {
    __a1BaseDrawCheckpoint();
    return;
  }
  const room = a1CurrentRoom();
  if (!room.checkpoint) return;

  const cp = checkpoints[0];
  const active = currentCheckpointId === cp.id;
  ctx.save();
  ctx.fillStyle = "#253c36";
  ctx.fillRect(cp.x - 16, cp.y + 18, 58, 52);
  ctx.fillStyle = active ? "#7de6ac" : "#d6bb68";
  ctx.fillRect(cp.x + 4, cp.y + 5, 18, 24);
  const glow = ctx.createRadialGradient(cp.x + 13, cp.y + 16, 3, cp.x + 13, cp.y + 16, 55);
  glow.addColorStop(0, active ? "rgba(125,230,172,.28)" : "rgba(214,187,104,.24)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cp.x - 45, cp.y - 40, 120, 120);
  ctx.restore();
};

function a1DrawExitCue(ex) {
  const room = a1CurrentRoom();
  const unlocked = a1CanUseExit(ex);
  ctx.save();
  ctx.globalAlpha = unlocked ? .62 : .28;
  ctx.strokeStyle = unlocked ? "#88bfa8" : "#4d7f87";
  ctx.lineWidth = 3;

  if (ex.side === "left" || ex.side === "right") {
    const x = ex.side === "left" ? 16 : room.width - 34;
    const y = Math.max(120, Math.min(650, (ex.from + ex.to) / 2 - 54));
    ctx.strokeRect(x, y, 18, 108);
  } else {
    const x = Math.max(30, Math.min(room.width - 70, (ex.from + ex.to) / 2 - 20));
    const y = ex.side === "top" ? 34 : 710;
    ctx.strokeRect(x, y, 40, 18);
  }
  ctx.restore();
}

const __a1BaseDrawRoomExit = drawRoomExit;
drawRoomExit = function() {
  if (currentRoom !== 0) {
    __a1BaseDrawRoomExit();
    return;
  }
  for (const ex of a1CurrentRoom().exits || []) {
    a1DrawExitCue(ex);
    a1DrawBlockedExit(ex);
  }
};

function a1DrawMap() {
  const nodes = Object.entries(A1.rooms);
  const minX = 0, maxX = 5, minY = 3, maxY = 6;
  const cellW = 18, cellH = 12;
  const mapW = (maxX - minX + 1) * cellW + 18;
  const mapH = (maxY - minY + 1) * cellH + 18;
  const x0 = WIDTH - mapW - 16;
  const y0 = 76;

  ctx.save();
  ctx.fillStyle = "rgba(4,10,13,.68)";
  ctx.fillRect(x0, y0, mapW, mapH);
  ctx.strokeStyle = "rgba(170,200,190,.35)";
  ctx.strokeRect(x0, y0, mapW, mapH);

  for (const [id, room] of nodes) {
    if (!A1.discovered.has(id) && id !== A1.node) continue;
    const [mx,my] = room.map;
    const x = x0 + 9 + (mx-minX)*cellW;
    const y = y0 + 9 + (my-minY)*cellH;
    ctx.fillStyle = A1.zoneColors[room.zone];
    ctx.globalAlpha = id === A1.node ? 1 : .52;
    ctx.fillRect(x, y, 14, 8);
    if (id === A1.node) {
      ctx.strokeStyle = "#f4e4ad";
      ctx.strokeRect(x-1,y-1,16,10);
    }
  }
  ctx.restore();
}

const __a1BaseDrawHUD = drawHUD;
drawHUD = function() {
  __a1BaseDrawHUD();
  if (currentRoom === 0) a1DrawMap();
};

function a1DrawForeground() {
  ctx.save();
  ctx.globalAlpha = .60;
  ctx.strokeStyle = "#06120f";
  ctx.lineCap = "round";
  const offset = -((camera.x * .035) % 260);
  for (let i=-1;i<7;i++) {
    const x = offset + i*245;
    ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(x, HEIGHT+20); ctx.quadraticCurveTo(x-30,HEIGHT-100,x+10,HEIGHT-210); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x,HEIGHT-95); ctx.lineTo(x-58,HEIGHT-135); ctx.moveTo(x+8,HEIGHT-82); ctx.lineTo(x+68,HEIGHT-122); ctx.stroke();
  }
  ctx.restore();

  const v = ctx.createRadialGradient(WIDTH/2,HEIGHT/2,HEIGHT*.35,WIDTH/2,HEIGHT/2,WIDTH*.78);
  v.addColorStop(0,"rgba(0,0,0,0)");
  v.addColorStop(1,"rgba(0,7,9,.34)");
  ctx.fillStyle = v;
  ctx.fillRect(0,0,WIDTH,HEIGHT);
}

const __a1BaseDraw = draw;
draw = function() {
  if (currentRoom !== 0) {
    __a1BaseDraw();
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  a1DrawParallax();

  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  if (A1.roomCacheDirty) a1BuildRoomCache();
  if (A1.roomCache) {
    const sx = Math.max(0, Math.floor(camera.x));
    const sy = Math.max(0, Math.floor(camera.y));
    const sw = Math.min(WIDTH + 64, A1.roomCache.width - sx);
    const sh = Math.min(HEIGHT + 64, A1.roomCache.height - sy);
    if (sw > 0 && sh > 0) {
      ctx.drawImage(
        A1.roomCache,
        sx, sy, sw, sh,
        sx, sy, sw, sh
      );
    }
  }

  a1DrawWater(a1CurrentRoom());
  drawRoomExit();
  drawCheckpoint();
  drawGrapplePoint();
  drawWaterFly();
  drawGrappleRope();
  drawTongue();
  drawNormalAttack();
  drawWaterShots();
  drawWaterBurst();
  drawWaterUltimate();
  drawWindBlades();
  drawWindGust();
  drawWindUltimate();
  drawEnemy();
  drawMacGroundShadow();

  if (!mac.dead) {
    const blink = mac.invulnerableTimer > 0 && Math.floor(mac.invulnerableTimer * 18) % 2 === 0;
    if (!blink) drawMacSprite();
    drawMacHitbox();
  }

  drawTongueHitbox();
  ctx.restore();

  a1DrawForeground();
  drawHUD();
};

// Initial clean Area 1 load.
A1.node = "entrada";
a1LoadNode("entrada", "left", false);
