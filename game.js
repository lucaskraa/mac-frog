const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Evita suavização. Vai ser importante quando entrarmos nos sprites.
ctx.imageSmoothingEnabled = false;

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Chão temporário
const ground = {
  x: 0,
  y: 440,
  width: GAME_WIDTH,
  height: GAME_HEIGHT - 440,
  color: "#666666"
};

// Mac temporário
const mac = {
  x: 120,
  y: ground.y - 64,
  width: 32,
  height: 64,
  color: "#22c55e"
};

function drawBackground() {
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawGround() {
  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawMac() {
  ctx.fillStyle = mac.color;
  ctx.fillRect(mac.x, mac.y, mac.width, mac.height);
}

function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawBackground();
  drawGround();
  drawMac();
}

render();
