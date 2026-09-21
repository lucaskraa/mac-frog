// ============================================================
// ROOM 1 V2 — MANGUE DARK-FANTASY / METROIDVANIA PASS
// Aplicado por cima da base estável. Mantém física, Mac e poderes.
// Foco: layout, profundidade, iluminação, água e arquitetura.
// ============================================================

roomNames[0] = "Área 1 - Mangue das Ruínas";
checkpoints[0].x = 2460;
checkpoints[0].y = 690;

grapple.minLength = 96;
grapple.maxLength = 315;
grapple.swingAcceleration = 8.4;
grapple.maxAngularSpeed = 4.8;

const ROOM1_V2_GROUND = [
  { x: 0,    y: 760, width: 760,  height: WORLD_HEIGHT - 760 },
  { x: 1100, y: 760, width: 880,  height: WORLD_HEIGHT - 760 },
  { x: 2320, y: 760, width: 940,  height: WORLD_HEIGHT - 760 },
  { x: 3590, y: 760, width: 1210, height: WORLD_HEIGHT - 760 }
];

const ROOM1_V2_PITS = [
  { x: 760,  width: 340 },
  { x: 1980, width: 340 },
  { x: 3260, width: 330 }
];

const ROOM1_V2_PLATFORMS = [
  { x: 190,  y: 700, width: 220, height: 22 },
  { x: 480,  y: 632, width: 190, height: 22 },
  { x: 680,  y: 690, width: 70,  height: 22 },

  { x: 1120, y: 700, width: 190, height: 22 },
  { x: 1325, y: 625, width: 165, height: 22 },
  { x: 1515, y: 545, width: 160, height: 22 },
  { x: 1690, y: 465, width: 165, height: 22 },
  { x: 1810, y: 615, width: 145, height: 22 },

  { x: 2350, y: 700, width: 220, height: 22 },
  { x: 2570, y: 625, width: 180, height: 22 },
  { x: 2760, y: 540, width: 175, height: 22 },
  { x: 2945, y: 450, width: 165, height: 22 },

  { x: 2640, y: 390, width: 130, height: 20 },
  { x: 2830, y: 315, width: 130, height: 20 },
  { x: 3030, y: 250, width: 180, height: 22 },

  { x: 3620, y: 700, width: 220, height: 22 },
  { x: 3870, y: 625, width: 190, height: 22 },
  { x: 4090, y: 545, width: 185, height: 22 },
  { x: 4310, y: 465, width: 175, height: 22 },
  { x: 4515, y: 620, width: 200, height: 22 }
];

const ROOM1_V2_WALLS = [
  { x: 1215, y: 585, width: 50, height: 175 },
  { x: 1575, y: 355, width: 52, height: 405 },
  { x: 2400, y: 590, width: 52, height: 170 },
  { x: 3140, y: 300, width: 50, height: 460 },
  { x: 3950, y: 590, width: 50, height: 170 },
  { x: 4590, y: 620, width: 46, height: 140 }
];

MANGUE_ROOM_0_PLATFORMS.splice(0, MANGUE_ROOM_0_PLATFORMS.length, ...ROOM1_V2_PLATFORMS);
MANGUE_ROOM_0_WALLS.splice(0, MANGUE_ROOM_0_WALLS.length, ...ROOM1_V2_WALLS);
MANGUE_V2_GROUND_SEGMENTS.splice(0, MANGUE_V2_GROUND_SEGMENTS.length, ...ROOM1_V2_GROUND);
MANGUE_V2_PITS.splice(0, MANGUE_V2_PITS.length, ...ROOM1_V2_PITS);

MANGUE_V2_ANCHORS.splice(
  0,
  MANGUE_V2_ANCHORS.length,
  { id: "r1_root_01", x: 920,  y: 475, radius: 12, grabRange: 325, kind: "root" },
  { id: "r1_vine_01", x: 1715, y: 330, radius: 12, grabRange: 300, kind: "vine" },
  { id: "r1_root_02", x: 2150, y: 450, radius: 12, grabRange: 340, kind: "root" },
  { id: "r1_vine_02", x: 2670, y: 360, radius: 12, grabRange: 305, kind: "vine" },
  { id: "r1_vine_03", x: 2910, y: 265, radius: 12, grabRange: 295, kind: "vine" },
  { id: "r1_root_03", x: 3430, y: 455, radius: 12, grabRange: 340, kind: "root" },
  { id: "r1_chain_01", x: 4190, y: 365, radius: 12, grabRange: 300, kind: "vine" }
);

const ROOM1_V2_WATER_GATE = { x: 3500, y: 520, width: 34, height: 240 };

const __room1v2RebuildSolids = rebuildSolids;
rebuildSolids = function() {
  __room1v2RebuildSolids();
  if (currentRoom === 0 && !mac.waterPower) {
    solids.push(ROOM1_V2_WATER_GATE);
  }
};

const __room1v2Apply = applyScenarioRoom;
applyScenarioRoom = function(index) {
  __room1v2Apply(index);
  if (index !== 0) return;

  setRoomGeometry(MANGUE_ROOM_0_PLATFORMS, MANGUE_ROOM_0_WALLS);

  grapplePoint.x = MANGUE_V2_ANCHORS[0].x;
  grapplePoint.y = MANGUE_V2_ANCHORS[0].y;
  grapplePoint.grabRange = MANGUE_V2_ANCHORS[0].grabRange;

  waterFly.baseX = 3105;
  waterFly.x = waterFly.baseX;
  waterFly.baseY = 205;
  waterFly.y = waterFly.baseY;
  waterFly.challengeTime = 0;
  waterFly.alive = !waterFly.collected;

  enemy.type = "caranguejo";
  enemy.surfaceY = ground.y;
  enemy.x = 560;
  enemy.patrolMin = 470;
  enemy.patrolMax = 710;
  enemy.patrolSpeed = 60;
  enemy.chaseSpeed = 112;
  enemy.detectionRange = 255;
  enemy.damage = 10;

  rebuildSolids();
};

applyScenarioRoom(0);

const __room1v2WaterFly = updateWaterFly;
updateWaterFly = function(dt) {
  if (currentRoom !== 0 || !waterFly.alive || typeof waterFly.baseX !== "number") {
    __room1v2WaterFly(dt);
    return;
  }

  waterFly.animTime = (waterFly.animTime || 0) + dt;
  waterFly.challengeTime = (waterFly.challengeTime || 0) + dt;

  const t = waterFly.challengeTime;
  waterFly.x = waterFly.baseX + Math.sin(t * 1.65) * 72;
  waterFly.y = waterFly.baseY + Math.sin(t * 3.2) * 22 + Math.cos(t * 1.1) * 8;
};

function room1v2Stone(rect, wall = false) {
  const top = wall ? "#48616a" : "#58727b";
  const side = wall ? "#20343b" : "#29434b";
  const dark = wall ? "#14252b" : "#1b3036";

  const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.height);
  g.addColorStop(0, top);
  g.addColorStop(0.18, side);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  const bw = 34;
  const bh = 17;
  for (let yy = rect.y + 7; yy < rect.y + rect.height; yy += bh) {
    const row = Math.floor((yy - rect.y) / bh);
    for (let xx = rect.x + (row % 2 ? -17 : 0); xx < rect.x + rect.width; xx += bw) {
      ctx.strokeStyle = "rgba(7,18,22,.42)";
      ctx.lineWidth = 1;
      ctx.strokeRect(xx, yy, bw, bh);
      ctx.fillStyle = "rgba(103,139,146,.07)";
      ctx.fillRect(xx + 2, yy + 2, bw - 4, 2);
    }
  }

  ctx.fillStyle = "#55784d";
  for (let x = rect.x + 5; x < rect.x + rect.width - 4; x += 19) {
    const h = 3 + ((x * 7 + rect.y) % 7);
    ctx.fillRect(x, rect.y - 3, 13, 5);
    if (h > 6) ctx.fillRect(x + 4, rect.y + 2, 3, h);
  }

  if (wall && rect.height > 150) {
    ctx.strokeStyle = "rgba(58,128,140,.5)";
    ctx.lineWidth = 2;
    for (let y = rect.y + 44; y < rect.y + rect.height - 20; y += 64) {
      ctx.beginPath();
      ctx.moveTo(rect.x + 9, y);
      ctx.lineTo(rect.x + rect.width / 2, y - 8);
      ctx.lineTo(rect.x + rect.width - 9, y);
      ctx.lineTo(rect.x + rect.width / 2, y + 8);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function room1v2Wood(rect) {
  ctx.fillStyle = "#261b18";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = "#6a4934";

  for (let x = rect.x + 3; x < rect.x + rect.width; x += 34) {
    ctx.fillRect(x, rect.y + 2, 29, rect.height - 4);
    ctx.fillStyle = "#8b6546";
    ctx.fillRect(x, rect.y + 2, 29, 3);
    ctx.fillStyle = "#6a4934";
  }

  ctx.strokeStyle = "#17100f";
  ctx.lineWidth = 2;
  for (let x = rect.x + 30; x < rect.x + rect.width; x += 68) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x - 4, rect.y + rect.height);
    ctx.stroke();
  }
}

function room1v2PlatformStyle(rect) {
  if (rect.x === 680 || rect.x === 1810 || rect.x === 2945 || rect.x === 4515) return "wood";
  return "stone";
}

drawWorldGeometry = function() {
  for (const segment of MANGUE_V2_GROUND_SEGMENTS) {
    const g = ctx.createLinearGradient(0, segment.y, 0, WORLD_HEIGHT);
    g.addColorStop(0, "#1d3435");
    g.addColorStop(1, "#0c1e22");
    ctx.fillStyle = g;
    ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
    ctx.fillStyle = "#496e4c";
    ctx.fillRect(segment.x, segment.y, segment.width, 7);
  }

  const t = performance.now() * 0.001;
  for (const pit of MANGUE_V2_PITS) {
    const g = ctx.createLinearGradient(0, ground.y, 0, WORLD_HEIGHT);
    g.addColorStop(0, "#1d6d72");
    g.addColorStop(1, "#082d36");
    ctx.fillStyle = g;
    ctx.fillRect(pit.x, ground.y, pit.width, WORLD_HEIGHT - ground.y);

    ctx.strokeStyle = "rgba(152,235,224,.38)";
    ctx.lineWidth = 2;
    for (let y = ground.y + 10; y < WORLD_HEIGHT; y += 24) {
      const phase = Math.sin(t * 1.55 + y * .03) * 9;
      for (let x = pit.x + 8; x < pit.x + pit.width - 22; x += 58) {
        ctx.beginPath();
        ctx.moveTo(x + phase, y);
        ctx.quadraticCurveTo(x + 17 + phase, y - 3, x + 35 + phase, y);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "#3a2d21";
    ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) {
      const x = pit.x + pit.width * (.16 + i * .22);
      ctx.beginPath();
      ctx.moveTo(x, ground.y + 72);
      ctx.lineTo(x + (i % 2 ? 9 : -8), ground.y + 15);
      ctx.stroke();
    }
  }

  for (const platform of platforms) {
    if (room1v2PlatformStyle(platform) === "wood") room1v2Wood(platform);
    else room1v2Stone(platform, false);
  }
  for (const wall of walls) room1v2Stone(wall, true);

  if (currentRoom === 0 && !mac.waterPower) {
    const g = ctx.createLinearGradient(ROOM1_V2_WATER_GATE.x, 0, ROOM1_V2_WATER_GATE.x + ROOM1_V2_WATER_GATE.width, 0);
    g.addColorStop(0, "#173d47");
    g.addColorStop(.5, "#3b8490");
    g.addColorStop(1, "#173d47");
    ctx.fillStyle = g;
    ctx.fillRect(ROOM1_V2_WATER_GATE.x, ROOM1_V2_WATER_GATE.y, ROOM1_V2_WATER_GATE.width, ROOM1_V2_WATER_GATE.height);
    ctx.fillStyle = "rgba(111,232,243,.23)";
    for (let y = ROOM1_V2_WATER_GATE.y + 9; y < ROOM1_V2_WATER_GATE.y + ROOM1_V2_WATER_GATE.height; y += 18) {
      ctx.fillRect(ROOM1_V2_WATER_GATE.x + 6, y, ROOM1_V2_WATER_GATE.width - 12, 3);
    }
  }
};

function room1v2FarArches(offset, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#213b41";
  ctx.strokeStyle = "#294950";
  for (let i = -1; i < 5; i++) {
    const x = offset + i * 330;
    ctx.fillRect(x, 210, 32, 210);
    ctx.fillRect(x + 155, 230, 30, 190);
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(x + 92, 250, 72, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

drawMangroveBackground = function() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#07151b");
  sky.addColorStop(.42, "#0d2430");
  sky.addColorStop(1, "#163a3c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const warmX = WIDTH * .70 - camera.x * .035;
  const glow = ctx.createRadialGradient(warmX, 150, 10, warmX, 150, 260);
  glow.addColorStop(0, "rgba(255,196,103,.30)");
  glow.addColorStop(.35, "rgba(255,181,82,.12)");
  glow.addColorStop(1, "rgba(255,181,82,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const far = -((camera.x * .055) % 430);
  ctx.fillStyle = "rgba(23,64,54,.42)";
  for (let i = -1; i < Math.ceil(WIDTH / 300) + 2; i++) {
    const x = far + i * 300;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT * .63);
    ctx.lineTo(x + 70, HEIGHT * .33);
    ctx.lineTo(x + 145, HEIGHT * .58);
    ctx.lineTo(x + 215, HEIGHT * .38);
    ctx.lineTo(x + 300, HEIGHT * .64);
    ctx.closePath();
    ctx.fill();
  }

  room1v2FarArches(-((camera.x * .11) % 330), .28);

  ctx.save();
  ctx.translate(WIDTH * .76 - camera.x * .035, 0);
  ctx.globalAlpha = .30;
  ctx.fillStyle = "#435057";
  ctx.fillRect(-55, 170, 128, 116);
  ctx.fillRect(-82, 120, 30, 166);
  ctx.fillRect(76, 120, 30, 166);
  ctx.fillStyle = "#d5b56f";
  ctx.fillRect(-8, 208, 30, 78);
  ctx.restore();

  const mid = -((camera.x * .19) % 180);
  ctx.strokeStyle = "rgba(20,48,39,.78)";
  ctx.lineCap = "round";
  for (let i = -1; i < Math.ceil(WIDTH / 155) + 2; i++) {
    const x = mid + i * 155 + 30;
    const top = 165 + (i % 3) * 20;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x, 440);
    ctx.quadraticCurveTo(x - 15, 300, x, top);
    ctx.stroke();
    ctx.lineWidth = 4;
    for (let a = -2; a <= 2; a++) {
      ctx.beginPath();
      ctx.moveTo(x, top + 10);
      ctx.quadraticCurveTo(x + a * 18, top - 14, x + a * 36, top + 12);
      ctx.stroke();
    }
  }

  const waterY = HEIGHT * .68;
  const wg = ctx.createLinearGradient(0, waterY, 0, HEIGHT);
  wg.addColorStop(0, "rgba(28,110,116,.36)");
  wg.addColorStop(1, "rgba(6,45,55,.58)");
  ctx.fillStyle = wg;
  ctx.fillRect(0, waterY, WIDTH, HEIGHT - waterY);

  ctx.strokeStyle = "rgba(183,236,223,.22)";
  ctx.lineWidth = 2;
  const t = performance.now() * .001;
  for (let y = waterY + 12; y < HEIGHT; y += 22) {
    const phase = Math.sin(t * 1.3 + y * .03) * 15;
    for (let x = -90; x < WIDTH + 90; x += 105) {
      ctx.beginPath();
      ctx.moveTo(x + phase, y);
      ctx.lineTo(x + 46 + phase, y);
      ctx.stroke();
    }
  }
};

function room1v2Lantern(x, y, color = "#ffbe70") {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 6, x, y, 72);
  glow.addColorStop(0, color === "#ffbe70" ? "rgba(255,190,112,.28)" : "rgba(99,235,211,.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 75, y - 75, 150, 150);
  ctx.fillStyle = "#2e2420";
  ctx.fillRect(x - 5, y - 11, 10, 18);
  ctx.fillStyle = color;
  ctx.fillRect(x - 3, y - 7, 6, 10);
  ctx.restore();
}

function room1v2Flask(x, y, color) {
  ctx.save();
  ctx.strokeStyle = "#1d2626";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 42);
  ctx.lineTo(x, y - 18);
  ctx.stroke();

  const glow = ctx.createRadialGradient(x, y, 2, x, y, 38);
  glow.addColorStop(0, color === "green" ? "rgba(77,255,167,.28)" : "rgba(184,92,255,.26)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 42, y - 42, 84, 84);

  ctx.fillStyle = color === "green" ? "#43d985" : "#a85be8";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(231,255,245,.45)";
  ctx.fillRect(x - 2, y - 4, 3, 3);
  ctx.restore();
}

drawMangroveWorldDecor = function() {
  if (currentRoom !== 0) return;

  const tx = 2440;
  ctx.save();
  ctx.fillStyle = "#231b18";
  ctx.fillRect(tx - 45, 270, 210, 490);
  ctx.fillStyle = "#3a2b22";
  ctx.fillRect(tx - 10, 270, 34, 490);
  ctx.fillRect(tx + 62, 270, 28, 490);
  ctx.fillRect(tx + 118, 270, 24, 490);
  ctx.fillStyle = "#102b23";
  ctx.fillRect(tx - 120, 210, 420, 36);
  ctx.fillRect(tx - 60, 175, 315, 28);
  ctx.restore();

  ctx.strokeStyle = "#33271f";
  ctx.lineCap = "round";
  for (const rx of [90, 1170, 2500, 3660, 4700]) {
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(rx, ground.y + 18);
    ctx.bezierCurveTo(rx - 65, ground.y - 70, rx + 44, ground.y - 180, rx + 20, ground.y - 300);
    ctx.stroke();
  }

  ctx.strokeStyle = "#1a2222";
  ctx.lineWidth = 4;
  for (const cx of [1380, 2030, 3910, 4450]) {
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, 185 + (cx % 3) * 25);
    ctx.stroke();
  }

  for (const cage of [[2030,240],[3910,215]]) {
    const [x, y] = cage;
    ctx.strokeStyle = "#232928";
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 22, y, 44, 64);
    for (let xx = x - 14; xx <= x + 14; xx += 9) {
      ctx.beginPath();
      ctx.moveTo(xx, y + 4);
      ctx.lineTo(xx, y + 60);
      ctx.stroke();
    }
  }

  room1v2Flask(1535, 255, "green");
  room1v2Flask(2890, 175, "purple");
  room1v2Flask(4220, 245, "green");

  room1v2Lantern(560, 590);
  room1v2Lantern(1670, 435);
  room1v2Lantern(3025, 220, "#63ebd3");
  room1v2Lantern(4320, 430);

  ctx.fillStyle = "#283d42";
  ctx.fillRect(3000, 245, 210, 510);
  ctx.fillStyle = "#3d5960";
  ctx.fillRect(3000, 245, 210, 12);
  ctx.fillStyle = "#102429";
  ctx.fillRect(3065, 330, 80, 145);
  ctx.fillStyle = "#3d8792";
  for (let x = 3074; x < 3144; x += 14) ctx.fillRect(x, 335, 5, 135);
};

const __room1v2DrawGrapple = drawGrapplePoint;
drawGrapplePoint = function() {
  if (currentRoom !== 0) {
    __room1v2DrawGrapple();
    return;
  }

  const origin = getTongueOrigin();
  for (const anchor of MANGUE_V2_ANCHORS) {
    const d = distance(origin.x, origin.y, anchor.x, anchor.y);
    const dir = anchor.x >= origin.x ? 1 : -1;
    const reachable = !grapple.active && d <= anchor.grabRange && (dir === mac.facing || d <= 185) && tongueLineClearToPoint(anchor.x, anchor.y);

    ctx.save();
    ctx.strokeStyle = anchor.kind === "vine" ? "#355843" : "#3b2d22";
    ctx.lineCap = "round";
    ctx.lineWidth = anchor.kind === "vine" ? 6 : 10;
    ctx.beginPath();
    ctx.moveTo(anchor.x - (anchor.kind === "vine" ? 0 : 48), anchor.y - 60);
    ctx.quadraticCurveTo(anchor.x - 8, anchor.y - 28, anchor.x, anchor.y);
    ctx.stroke();

    ctx.fillStyle = reachable ? "#c7e28f" : "#71855a";
    ctx.beginPath();
    ctx.ellipse(anchor.x, anchor.y, 10, 7, -.2, 0, Math.PI * 2);
    ctx.fill();

    if (reachable) {
      ctx.fillStyle = "rgba(211,243,163,.15)";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
};

function room1v2Foreground() {
  if (currentRoom !== 0) return;
  ctx.save();
  ctx.globalAlpha = .72;
  ctx.strokeStyle = "#081915";
  ctx.lineCap = "round";
  const off = -((camera.x * .045) % 250);
  for (let i = -1; i < 7; i++) {
    const x = off + i * 240;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT + 20);
    ctx.quadraticCurveTo(x - 35, HEIGHT - 100, x + 12, HEIGHT - 205);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT - 95);
    ctx.lineTo(x - 65, HEIGHT - 135);
    ctx.moveTo(x + 8, HEIGHT - 80);
    ctx.lineTo(x + 72, HEIGHT - 120);
    ctx.stroke();
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * .26, WIDTH / 2, HEIGHT / 2, WIDTH * .72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,10,13,.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const __room1v2Draw = draw;
draw = function() {
  if (currentRoom !== 0) {
    __room1v2Draw();
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawMangroveBackground();

  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
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
    const blink = mac.invulnerableTimer > 0 && Math.floor(mac.invulnerableTimer * 18) % 2 === 0;
    if (!blink) drawMacSprite();
    drawMacHitbox();
  }

  drawTongueHitbox();
  ctx.restore();

  room1v2Foreground();
  drawHUD();
};


let room1v2HadWaterPower = mac.waterPower;
const __room1v2Update = update;
update = function(dt) {
  __room1v2Update(dt);

  if (currentRoom === 0 && room1v2HadWaterPower !== mac.waterPower) {
    room1v2HadWaterPower = mac.waterPower;
    rebuildSolids();
  }
};
