// ROOM 1 V4 — performance-first metroidvania mangrove
// Fixed macro layout + hand-authored traversal chunks.
// Static scenery is cached and rendered from local atlases.

roomNames[0] = "Área 1 - Manguezal das Ruínas";
checkpoints[0].x = 2320;
checkpoints[0].y = 690;

grapple.minLength = 96;
grapple.maxLength = 315;
grapple.swingAcceleration = 8.4;
grapple.maxAngularSpeed = 4.8;

const ROOM1V4_TILE_IMG = new Image();
const ROOM1V4_LAND_IMG = new Image();
ROOM1V4_TILE_IMG.decoding = "async";
ROOM1V4_LAND_IMG.decoding = "async";

async function room1v4LoadLocalAtlas(path, image) {
  try {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) return;
    const b64 = (await response.text()).trim();
    image.src = "data:image/png;base64," + b64;
  } catch (error) {
    console.warn("Room 1 atlas failed:", path, error);
  }
}

room1v4LoadLocalAtlas("./assets/room1_tiles.b64", ROOM1V4_TILE_IMG);
room1v4LoadLocalAtlas("./assets/room1_landmarks.b64", ROOM1V4_LAND_IMG);

const ROOM1V4 = {
  floors: [
    { x:0, y:760, width:720, height:WORLD_HEIGHT-760 },
    { x:1080, y:760, width:820, height:WORLD_HEIGHT-760 },
    { x:2250, y:760, width:930, height:WORLD_HEIGHT-760 },
    { x:3510, y:760, width:1290, height:WORLD_HEIGHT-760 }
  ],
  pits: [
    { x:720, width:360 },
    { x:1900, width:350 },
    { x:3180, width:330 }
  ],
  platforms: [
    {x:170,y:700,width:220,height:24,style:"moss"},
    {x:455,y:630,width:190,height:24,style:"stone"},
    {x:650,y:690,width:60,height:24,style:"wood"},

    {x:1110,y:700,width:180,height:24,style:"moss"},
    {x:1300,y:625,width:165,height:24,style:"stone"},
    {x:1485,y:545,width:160,height:24,style:"stone"},
    {x:1665,y:465,width:175,height:24,style:"azulejo"},
    {x:1785,y:615,width:100,height:24,style:"wood"},

    {x:2280,y:700,width:210,height:24,style:"moss"},
    {x:2500,y:625,width:175,height:24,style:"stone"},
    {x:2680,y:540,width:165,height:24,style:"azulejo"},
    {x:2860,y:450,width:160,height:24,style:"wood"},
    {x:3020,y:355,width:155,height:24,style:"shrine"},

    {x:2420,y:420,width:120,height:22,style:"broken"},
    {x:2600,y:340,width:120,height:22,style:"root"},
    {x:2780,y:270,width:135,height:22,style:"root"},
    {x:2970,y:205,width:190,height:22,style:"shrine"},

    {x:3540,y:700,width:220,height:24,style:"moss"},
    {x:3780,y:625,width:180,height:24,style:"stone"},
    {x:3990,y:545,width:180,height:24,style:"azulejo"},
    {x:4200,y:465,width:180,height:24,style:"stone"},
    {x:4420,y:620,width:210,height:24,style:"wood"}
  ],
  walls: [
    {x:1210,y:585,width:48,height:175},
    {x:1570,y:355,width:50,height:405},
    {x:2370,y:590,width:50,height:170},
    {x:3135,y:285,width:48,height:475},
    {x:3910,y:585,width:50,height:175},
    {x:4580,y:620,width:46,height:140}
  ],
  anchors: [
    {id:"a1",x:900,y:470,radius:12,grabRange:330,kind:"root"},
    {id:"a2",x:1705,y:330,radius:12,grabRange:300,kind:"vine"},
    {id:"a3",x:2080,y:445,radius:12,grabRange:340,kind:"root"},
    {id:"a4",x:2550,y:370,radius:12,grabRange:305,kind:"vine"},
    {id:"a5",x:2790,y:275,radius:12,grabRange:295,kind:"vine"},
    {id:"a6",x:3340,y:455,radius:12,grabRange:340,kind:"root"},
    {id:"a7",x:4090,y:365,radius:12,grabRange:300,kind:"vine"}
  ],
  forwardGate:{x:3295,y:500,width:34,height:260},
  shortcutGate:{x:1040,y:650,width:34,height:110}
};

function room1v4Clone(items) {
  return items.map(o => ({ x:o.x, y:o.y, width:o.width, height:o.height }));
}

function room1v4Style(rect) {
  const p = ROOM1V4.platforms.find(o =>
    o.x === rect.x && o.y === rect.y && o.width === rect.width
  );
  return p?.style || "stone";
}

MANGUE_ROOM_0_PLATFORMS.splice(
  0,
  MANGUE_ROOM_0_PLATFORMS.length,
  ...room1v4Clone(ROOM1V4.platforms)
);

MANGUE_ROOM_0_WALLS.splice(
  0,
  MANGUE_ROOM_0_WALLS.length,
  ...room1v4Clone(ROOM1V4.walls)
);

MANGUE_V2_GROUND_SEGMENTS.splice(
  0,
  MANGUE_V2_GROUND_SEGMENTS.length,
  ...ROOM1V4.floors
);

MANGUE_V2_PITS.splice(
  0,
  MANGUE_V2_PITS.length,
  ...ROOM1V4.pits
);

MANGUE_V2_ANCHORS.splice(
  0,
  MANGUE_V2_ANCHORS.length,
  ...ROOM1V4.anchors
);

const __room1v4RebuildSolids = rebuildSolids;

rebuildSolids = function() {
  solids.length = 0;

  if (currentRoom === 0) {
    solids.push(...ROOM1V4.floors, ...platforms, ...walls);

    if (!mac.waterPower) {
      solids.push(ROOM1V4.forwardGate, ROOM1V4.shortcutGate);
    }

    return;
  }

  __room1v4RebuildSolids();
};

let room1v4StaticDirty = true;

function room1v4MarkStaticDirty() {
  room1v4StaticDirty = true;
}

const __room1v4Apply = applyScenarioRoom;

applyScenarioRoom = function(index) {
  __room1v4Apply(index);

  if (index !== 0) return;

  setRoomGeometry(MANGUE_ROOM_0_PLATFORMS, MANGUE_ROOM_0_WALLS);

  grapplePoint.x = ROOM1V4.anchors[0].x;
  grapplePoint.y = ROOM1V4.anchors[0].y;
  grapplePoint.grabRange = ROOM1V4.anchors[0].grabRange;

  waterFly.baseX = 3070;
  waterFly.x = waterFly.baseX;
  waterFly.baseY = 155;
  waterFly.y = waterFly.baseY;
  waterFly.challengeTime = 0;
  waterFly.alive = !waterFly.collected;

  windFly.alive = false;

  enemy.type = "caranguejo";
  enemy.surfaceY = ground.y;
  enemy.x = 540;
  enemy.patrolMin = 450;
  enemy.patrolMax = 690;
  enemy.patrolSpeed = 60;
  enemy.chaseSpeed = 112;
  enemy.detectionRange = 255;
  enemy.damage = 10;

  rebuildSolids();
  room1v4MarkStaticDirty();
};

applyScenarioRoom(0);

mangueEnemies.splice(
  0,
  7,
  makeMangueEnemy(0, "caranguejo", 520, 450, 690),
  Object.assign(
    makeMangueEnemy(0, "cururu", 1320, 1290, 1470, { detectionRange:220 }),
    { surfaceY:625 }
  ),
  Object.assign(
    makeMangueEnemy(0, "caranguejo", 1810, 1775, 1880),
    { surfaceY:615 }
  ),
  makeMangueEnemy(0, "caranguejo", 2390, 2280, 2490),
  Object.assign(
    makeMangueEnemy(0, "cururu", 2710, 2680, 2840, { detectionRange:210 }),
    { surfaceY:540 }
  ),
  Object.assign(
    makeMangueEnemy(0, "caranguejo", 3830, 3780, 3960),
    { surfaceY:625 }
  ),
  Object.assign(
    makeMangueEnemy(0, "cururu", 4230, 4200, 4370, { detectionRange:215 }),
    { surfaceY:465 }
  )
);

resetMangueEnemies(0);

const __room1v4WaterFly = updateWaterFly;

updateWaterFly = function(dt) {
  if (
    currentRoom !== 0 ||
    !waterFly.alive ||
    typeof waterFly.baseX !== "number"
  ) {
    __room1v4WaterFly(dt);
    return;
  }

  waterFly.animTime = (waterFly.animTime || 0) + dt;
  waterFly.challengeTime = (waterFly.challengeTime || 0) + dt;

  const t = waterFly.challengeTime;

  waterFly.x =
    waterFly.baseX +
    Math.sin(t * 1.55) * 66;

  waterFly.y =
    waterFly.baseY +
    Math.sin(t * 3.0) * 20 +
    Math.cos(t * 1.1) * 7;
};

let room1v4LastWaterPower = mac.waterPower;

const __room1v4Update = update;

update = function(dt) {
  __room1v4Update(dt);

  if (
    currentRoom === 0 &&
    room1v4LastWaterPower !== mac.waterPower
  ) {
    room1v4LastWaterPower = mac.waterPower;
    rebuildSolids();
    room1v4MarkStaticDirty();
  }
};

// Static world cache: expensive tile work happens only when geometry changes.
const ROOM1V4_STATIC = document.createElement("canvas");
ROOM1V4_STATIC.width = WORLD_WIDTH;
ROOM1V4_STATIC.height = WORLD_HEIGHT;

const ROOM1V4_SCTX = ROOM1V4_STATIC.getContext("2d");
ROOM1V4_SCTX.imageSmoothingEnabled = false;

// Cached parallax strip.
const ROOM1V4_BG = document.createElement("canvas");
ROOM1V4_BG.width = 2200;
ROOM1V4_BG.height = HEIGHT;

const ROOM1V4_BGCTX = ROOM1V4_BG.getContext("2d");
ROOM1V4_BGCTX.imageSmoothingEnabled = false;

let room1v4BgReady = false;

ROOM1V4_TILE_IMG.onload = room1v4MarkStaticDirty;
ROOM1V4_LAND_IMG.onload = room1v4MarkStaticDirty;

function room1v4Tile(ctx2, tileX, tileY, dx, dy, dw = 64, dh = 64) {
  if (!(ROOM1V4_TILE_IMG.complete && ROOM1V4_TILE_IMG.naturalWidth)) {
    return false;
  }

  ctx2.drawImage(
    ROOM1V4_TILE_IMG,
    tileX * 64,
    tileY * 64,
    64,
    64,
    Math.round(dx),
    Math.round(dy),
    Math.round(dw),
    Math.round(dh)
  );

  return true;
}

function room1v4DrawPlatformTo(ctx2, rect, style) {
  const tileMap = {
    stone:[0,0],
    moss:[0,1],
    azulejo:[2,0],
    wood:[3,0],
    broken:[1,0],
    root:[0,1],
    shrine:[2,2]
  };

  const [tx, ty] = tileMap[style] || tileMap.stone;

  for (let x = rect.x; x < rect.x + rect.width; x += 64) {
    const w = Math.min(64, rect.x + rect.width - x);

    if (!room1v4Tile(ctx2, tx, ty, x, rect.y - 40, 64, 64)) {
      ctx2.fillStyle = "#34434a";
      ctx2.fillRect(x, rect.y, w, rect.height);
    }
  }
}

function room1v4DrawWallTo(ctx2, rect) {
  for (let y = rect.y; y < rect.y + rect.height; y += 64) {
    for (let x = rect.x; x < rect.x + rect.width; x += 64) {
      room1v4Tile(ctx2, 0, 0, x, y, 64, 64);
    }
  }
}

function room1v4DrawLandmarksTo(ctx2) {
  if (!(ROOM1V4_LAND_IMG.complete && ROOM1V4_LAND_IMG.naturalWidth)) {
    return;
  }

  ctx2.globalAlpha = 0.72;
  ctx2.drawImage(
    ROOM1V4_LAND_IMG,
    0, 0, 190, 256,
    2050, 240, 460, 620
  );

  ctx2.globalAlpha = 0.64;
  ctx2.drawImage(
    ROOM1V4_LAND_IMG,
    190, 0, 180, 256,
    1250, 260, 360, 510
  );

  ctx2.globalAlpha = 0.80;
  ctx2.drawImage(
    ROOM1V4_LAND_IMG,
    370, 0, 142, 256,
    2970, 110, 210, 380
  );

  ctx2.globalAlpha = 1;
}

function room1v4BuildStatic() {
  room1v4StaticDirty = false;

  const s = ROOM1V4_SCTX;

  s.clearRect(0, 0, ROOM1V4_STATIC.width, ROOM1V4_STATIC.height);

  room1v4DrawLandmarksTo(s);

  for (const floor of ROOM1V4.floors) {
    s.fillStyle = "#142b30";
    s.fillRect(floor.x, floor.y, floor.width, floor.height);

    for (let x = floor.x; x < floor.x + floor.width; x += 64) {
      room1v4Tile(s, 0, 1, x, floor.y - 40, 64, 64);
    }
  }

  for (const platform of platforms) {
    room1v4DrawPlatformTo(s, platform, room1v4Style(platform));
  }

  for (const wall of walls) {
    room1v4DrawWallTo(s, wall);
  }

  if (!mac.waterPower) {
    for (const gate of [ROOM1V4.forwardGate, ROOM1V4.shortcutGate]) {
      s.fillStyle = "#1b5965";
      s.fillRect(gate.x, gate.y, gate.width, gate.height);

      s.fillStyle = "#78d7da";

      for (
        let y = gate.y + 8;
        y < gate.y + gate.height;
        y += 18
      ) {
        s.fillRect(gate.x + 5, y, gate.width - 10, 3);
      }
    }
  }
}

function room1v4BuildBg() {
  room1v4BgReady = true;

  const b = ROOM1V4_BGCTX;

  const g = b.createLinearGradient(0, 0, 0, HEIGHT);
  g.addColorStop(0, "#07161d");
  g.addColorStop(0.45, "#0d2c32");
  g.addColorStop(1, "#214842");

  b.fillStyle = g;
  b.fillRect(0, 0, ROOM1V4_BG.width, HEIGHT);

  // Distant mangrove trunks.
  b.fillStyle = "rgba(47,92,70,.46)";

  for (let i = 0; i < 12; i++) {
    const x = i * 195 + 30;

    b.fillRect(x, 160 + (i % 3) * 28, 14, 300);

    for (let a = -2; a <= 2; a++) {
      b.fillRect(
        x + a * 25,
        165 + Math.abs(a) * 10,
        42,
        9
      );
    }
  }

  // Distant ruined aqueduct.
  b.fillStyle = "rgba(63,83,76,.42)";

  for (let i = 0; i < 7; i++) {
    const x = i * 330 + 80;

    b.fillRect(x, 235, 28, 205);
    b.fillRect(x + 150, 265, 26, 175);
    b.fillRect(x + 28, 235, 122, 12);
  }

  const water = b.createLinearGradient(0, 390, 0, HEIGHT);
  water.addColorStop(0, "rgba(56,138,141,.38)");
  water.addColorStop(1, "rgba(13,65,74,.58)");

  b.fillStyle = water;
  b.fillRect(0, 390, ROOM1V4_BG.width, HEIGHT - 390);

  b.fillStyle = "rgba(220,244,221,.17)";

  for (let y = 405; y < HEIGHT; y += 25) {
    for (let x = 0; x < ROOM1V4_BG.width; x += 100) {
      b.fillRect(x + (y % 3) * 12, y, 38, 2);
    }
  }
}

room1v4BuildBg();

function drawMangroveBackground() {
  if (!room1v4BgReady) {
    room1v4BuildBg();
  }

  const span = ROOM1V4_BG.width;
  const offset = -Math.floor((camera.x * 0.10) % span);

  ctx.drawImage(ROOM1V4_BG, offset, 0);
  ctx.drawImage(ROOM1V4_BG, offset + span, 0);

  const x = WIDTH * 0.72;

  const glow =
    ctx.createRadialGradient(
      x, 135, 10,
      x, 135, 260
    );

  glow.addColorStop(0, "rgba(255,191,104,.20)");
  glow.addColorStop(1, "rgba(255,191,104,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(x - 270, -20, 540, 460);
}

function drawWorldGeometry() {
  if (room1v4StaticDirty) {
    room1v4BuildStatic();
  }

  const sx =
    Math.max(
      0,
      Math.min(
        WORLD_WIDTH - WIDTH,
        Math.floor(camera.x)
      )
    );

  const visibleW =
    Math.min(
      WIDTH,
      WORLD_WIDTH - sx
    );

  ctx.drawImage(
    ROOM1V4_STATIC,
    sx, 0,
    visibleW, HEIGHT,
    sx, 0,
    visibleW, HEIGHT
  );

  // Only water animates every frame.
  const t = performance.now() * 0.001;

  for (const pit of ROOM1V4.pits) {
    const g =
      ctx.createLinearGradient(
        0,
        ground.y,
        0,
        WORLD_HEIGHT
      );

    g.addColorStop(0, "#257b7f");
    g.addColorStop(1, "#071f29");

    ctx.fillStyle = g;

    ctx.fillRect(
      pit.x,
      ground.y,
      pit.width,
      WORLD_HEIGHT - ground.y
    );

    ctx.fillStyle = "rgba(180,240,228,.38)";
    ctx.fillRect(pit.x, ground.y, pit.width, 3);

    for (
      let y = ground.y + 14;
      y < WORLD_HEIGHT;
      y += 26
    ) {
      const phase =
        Math.round(
          Math.sin(t * 1.5 + y * 0.025) * 8
        );

      for (
        let x = pit.x + 8;
        x < pit.x + pit.width - 20;
        x += 60
      ) {
        ctx.fillRect(x + phase, y, 28, 2);
      }
    }
  }
}

function drawMangroveWorldDecor() {
  if (currentRoom !== 0) return;

  ctx.save();

  ctx.strokeStyle = "#2b2018";
  ctx.lineCap = "round";

  for (const rootX of [80,1120,2240,3550,4700]) {
    ctx.lineWidth = 17;

    ctx.beginPath();

    ctx.moveTo(
      rootX,
      ground.y + 18
    );

    ctx.bezierCurveTo(
      rootX - 60,
      ground.y - 80,
      rootX + 45,
      ground.y - 210,
      rootX + 15,
      ground.y - 330
    );

    ctx.stroke();
  }

  ctx.restore();
}

const __room1v4GrappleFallback = drawGrapplePoint;

drawGrapplePoint = function() {
  if (currentRoom !== 0) {
    __room1v4GrappleFallback();
    return;
  }

  const origin = getTongueOrigin();

  for (const anchor of MANGUE_V2_ANCHORS) {
    const d =
      distance(
        origin.x,
        origin.y,
        anchor.x,
        anchor.y
      );

    const direction =
      anchor.x >= origin.x
        ? 1
        : -1;

    const reachable =
      !grapple.active &&
      d <= anchor.grabRange &&
      (
        direction === mac.facing ||
        d <= 180
      ) &&
      tongueLineClearToPoint(
        anchor.x,
        anchor.y
      );

    ctx.save();

    ctx.strokeStyle =
      anchor.kind === "vine"
        ? "#406447"
        : "#4d3625";

    ctx.lineWidth =
      anchor.kind === "vine"
        ? 6
        : 9;

    ctx.beginPath();

    ctx.moveTo(
      anchor.x -
        (
          anchor.kind === "vine"
            ? 0
            : 46
        ),
      anchor.y - 60
    );

    ctx.quadraticCurveTo(
      anchor.x - 7,
      anchor.y - 28,
      anchor.x,
      anchor.y
    );

    ctx.stroke();

    ctx.fillStyle =
      reachable
        ? "#d0e68e"
        : "#81945d";

    ctx.beginPath();

    ctx.ellipse(
      anchor.x,
      anchor.y,
      10,
      7,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }
};

function room1v4Foreground() {
  ctx.save();

  ctx.globalAlpha = 0.64;
  ctx.strokeStyle = "#071914";
  ctx.lineCap = "round";

  const offset =
    -(
      (
        camera.x * 0.035
      ) %
      260
    );

  for (let i = -1; i < 7; i++) {
    const x =
      offset +
      i * 245;

    ctx.lineWidth = 16;

    ctx.beginPath();

    ctx.moveTo(
      x,
      HEIGHT + 20
    );

    ctx.quadraticCurveTo(
      x - 30,
      HEIGHT - 100,
      x + 10,
      HEIGHT - 200
    );

    ctx.stroke();

    ctx.lineWidth = 7;

    ctx.beginPath();
    ctx.moveTo(x, HEIGHT - 90);
    ctx.lineTo(x - 60, HEIGHT - 132);
    ctx.moveTo(x + 8, HEIGHT - 78);
    ctx.lineTo(x + 65, HEIGHT - 118);
    ctx.stroke();
  }

  ctx.restore();

  const vignette =
    ctx.createRadialGradient(
      WIDTH / 2,
      HEIGHT / 2,
      HEIGHT * 0.30,
      WIDTH / 2,
      HEIGHT / 2,
      WIDTH * 0.72
    );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,8,11,.36)");

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

const __room1v4DrawFallback = draw;

draw = function() {
  if (currentRoom !== 0) {
    __room1v4DrawFallback();
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawMangroveBackground();

  ctx.save();

  ctx.translate(
    -Math.floor(camera.x),
    -Math.floor(camera.y)
  );

  drawMangroveWorldDecor();
  drawWorldGeometry();
  drawBossGate();
  drawRoomExit();
  drawCheckpoint();
  drawGrapplePoint();
  drawWaterFly();
  drawWindFly();
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
  drawBoss();
  drawMacGroundShadow();

  if (!mac.dead) {
    const blink =
      mac.invulnerableTimer > 0 &&
      Math.floor(mac.invulnerableTimer * 18) % 2 === 0;

    if (!blink) {
      drawMacSprite();
    }

    drawMacHitbox();
  }

  drawTongueHitbox();

  ctx.restore();

  room1v4Foreground();
  drawHUD();
};
