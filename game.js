const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const ground = {
  x: 0,
  y: 440,
  width: GAME_WIDTH,
  height: GAME_HEIGHT - 440,
  color: "#666666"
};

const keys = {};

const mac = {
  x: 120,
  y: 0,

  width: 32,
  normalHeight: 64,
  rollHeight: 32,
  height: 64,

  vx: 0,
  vy: 0,

  walkSpeed: 220,
  runSpeed: 390,
  jumpForce: 620,
  gravity: 1700,

  grounded: false,
  facing: 1,

  rolling: false,
  rollSpeed: 520,
  rollDuration: 0.30,
  rollTimer: 0,
  rollCooldown: 0.15,
  rollCooldownTimer: 0,

  color: "#22c55e"
};

mac.y = ground.y - mac.height;

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;

  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)
  ) {
    event.preventDefault();
  }

  // PULO
  if (
    (event.code === "Space" ||
      event.code === "KeyW" ||
      event.code === "ArrowUp") &&
    mac.grounded &&
    !mac.rolling
  ) {
    mac.vy = -mac.jumpForce;
    mac.grounded = false;
  }

  // ROLAGEM
  if (
    event.code === "KeyX" &&
    mac.grounded &&
    !mac.rolling &&
    mac.rollCooldownTimer <= 0
  ) {
    startRoll();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

function startRoll() {
  mac.rolling = true;
  mac.rollTimer = mac.rollDuration;

  const bottom = mac.y + mac.height;

  mac.height = mac.rollHeight;
  mac.y = bottom - mac.height;
  mac.vx = mac.facing * mac.rollSpeed;
}

function endRoll() {
  const bottom = mac.y + mac.height;

  mac.rolling = false;
  mac.height = mac.normalHeight;
  mac.y = bottom - mac.height;

  mac.rollCooldownTimer = mac.rollCooldown;
}

function update(dt) {
  if (mac.rollCooldownTimer > 0) {
    mac.rollCooldownTimer -= dt;
  }

  if (mac.rolling) {
    mac.rollTimer -= dt;
    mac.vx = mac.facing * mac.rollSpeed;

    if (mac.rollTimer <= 0) {
      endRoll();
    }
  } else {
    let direction = 0;

    if (keys["KeyA"] || keys["ArrowLeft"]) {
      direction -= 1;
    }

    if (keys["KeyD"] || keys["ArrowRight"]) {
      direction += 1;
    }

    const running =
      keys["ShiftLeft"] ||
      keys["ShiftRight"];

    const speed = running
      ? mac.runSpeed
      : mac.walkSpeed;

    mac.vx = direction * speed;

    if (direction !== 0) {
      mac.facing = direction;
    }
  }

  // GRAVIDADE
  mac.vy += mac.gravity * dt;

  // MOVIMENTO
  mac.x += mac.vx * dt;
  mac.y += mac.vy * dt;

  // LIMITES LATERAIS
  if (mac.x < 0) {
    mac.x = 0;
  }

  if (mac.x + mac.width > GAME_WIDTH) {
    mac.x = GAME_WIDTH - mac.width;
  }

  // COLISÃO COM O CHÃO
  if (mac.y + mac.height >= ground.y && mac.vy >= 0) {
    mac.y = ground.y - mac.height;
    mac.vy = 0;
    mac.grounded = true;
  } else {
    mac.grounded = false;
  }
}

function drawBackground() {
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawGround() {
  ctx.fillStyle = ground.color;
  ctx.fillRect(
    ground.x,
    ground.y,
    ground.width,
    ground.height
  );
}

function drawMac() {
  ctx.fillStyle = mac.color;

  ctx.fillRect(
    Math.round(mac.x),
    Math.round(mac.y),
    mac.width,
    mac.height
  );
}

function render() {
  ctx.clearRect(
    0,
    0,
    GAME_WIDTH,
    GAME_HEIGHT
  );

  drawBackground();
  drawGround();
  drawMac();
}

let lastTime = performance.now();

function gameLoop(currentTime) {
  const dt = Math.min(
    (currentTime - lastTime) / 1000,
    0.033
  );

  lastTime = currentTime;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
