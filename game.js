const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = {};

const ground = {
  x: 0,
  y: 440,
  width: WIDTH,
  height: HEIGHT - 440
};

const mac = {
  x: 120,
  y: 0,

  width: 32,
  height: 64,
  normalHeight: 64,
  rollHeight: 32,

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
  rollTimer: 0
};

mac.y = ground.y - mac.height;

window.addEventListener("keydown", event => {
  keys[event.code] = true;

  if (
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight" ||
    event.code === "ArrowUp" ||
    event.code === "Space"
  ) {
    event.preventDefault();
  }

  const jumpPressed =
    event.code === "Space" ||
    event.code === "KeyW" ||
    event.code === "ArrowUp";

  if (
    jumpPressed &&
    mac.grounded &&
    !mac.rolling
  ) {
    mac.vy = -mac.jumpForce;
    mac.grounded = false;
  }

  if (
    event.code === "KeyX" &&
    mac.grounded &&
    !mac.rolling
  ) {
    startRoll();
  }
});

window.addEventListener("keyup", event => {
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

function stopRoll() {
  const bottom = mac.y + mac.height;

  mac.rolling = false;

  mac.height = mac.normalHeight;
  mac.y = bottom - mac.height;
}

function update(dt) {
  if (mac.rolling) {
    mac.rollTimer -= dt;

    mac.vx = mac.facing * mac.rollSpeed;

    if (mac.rollTimer <= 0) {
      stopRoll();
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

    const speed =
      running ? mac.runSpeed : mac.walkSpeed;

    mac.vx = direction * speed;

    if (direction !== 0) {
      mac.facing = direction;
    }
  }

  mac.vy += mac.gravity * dt;

  mac.x += mac.vx * dt;
  mac.y += mac.vy * dt;

  if (mac.x < 0) {
    mac.x = 0;
  }

  if (mac.x + mac.width > WIDTH) {
    mac.x = WIDTH - mac.width;
  }

  if (
    mac.y + mac.height >= ground.y &&
    mac.vy >= 0
  ) {
    mac.y = ground.y - mac.height;
    mac.vy = 0;
    mac.grounded = true;
  } else {
    mac.grounded = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Fundo
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Chão
  ctx.fillStyle = "#666666";
  ctx.fillRect(
    ground.x,
    ground.y,
    ground.width,
    ground.height
  );

  // Mac
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(
    Math.round(mac.x),
    Math.round(mac.y),
    mac.width,
    mac.height
  );
}

let lastTime = performance.now();

function loop(time) {
  const dt = Math.min(
    (time - lastTime) / 1000,
    0.033
  );

  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
