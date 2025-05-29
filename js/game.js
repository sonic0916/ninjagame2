const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ninja = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 120,
  width: 80,
  height: 80,
  speed: 5
};

let shurikens = [];
let obstacles = [];
let level = 1;
let destroyed = 0;
let hits = 0;
let lives = 3;
let gameOver = false;
let gameStarted = true;
let gamePaused = false;
let score = 0;
let flashTimer = 0;

const ninjaImage = new Image();
ninjaImage.src = "images/ninja.png";

const shurikenImage = new Image();
shurikenImage.src = "images/thunder.png";

const backgroundImage = new Image();
backgroundImage.src = "images/background.png";

const obstacleImages = [];
const imagePaths = [
  "images/ob1.png",
  "images/ob2.png",
  "images/ob3.png",
  "images/ob4.png",
  "images/ob5.png"
];

imagePaths.forEach((path, index) => {
  const img = new Image();
  img.src = path;
  obstacleImages[index] = img;
});

function drawNinja() {
  ctx.drawImage(ninjaImage, ninja.x, ninja.y, ninja.width, ninja.height);
}

function drawShurikens() {
  shurikens.forEach(s => {
    ctx.drawImage(shurikenImage, s.x, s.y, s.width, s.height);
  });
}

function drawObstacles() {
  obstacles.forEach(o => {
    const img = obstacleImages[o.type];
    const scale = o.type === 4 ? 2 : 1;
    ctx.drawImage(img, o.x, o.y, o.width * scale, o.height * scale);
  });
}

function fireShuriken() {
  if (!gamePaused) {
    shurikens.push({
      x: ninja.x + ninja.width / 2 - 5,
      y: ninja.y,
      width: 10,
      height: 20,
      speed: 7
    });
  }
  document.getElementById("bgm").play();
}

function spawnObstacle() {
  if (!gamePaused) {
    const width = 40;
    const height = 40;
    const x = Math.random() * (canvas.width - width);
    const type = Math.min(level - 1, 4);
    const speed = 1.5 + level * 0.3;
    obstacles.push({ x, y: 0, width, height, speed, type });
  }
}

function updateGame() {
  if (gameOver || !gameStarted || gamePaused) return;
  shurikens = shurikens.filter(s => s.y > -s.height);
  obstacles = obstacles.filter(o => o.y < canvas.height);

  shurikens.forEach(s => s.y -= s.speed);
  obstacles.forEach(o => o.y += o.speed);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    let hit = false;
    for (let j = shurikens.length - 1; j >= 0; j--) {
      const s = shurikens[j];
      if (s.x < o.x + o.width && s.x + s.width > o.x && s.y < o.y + o.height && s.y + s.height > o.y) {
        shurikens.splice(j, 1);
        obstacles.splice(i, 1);
        destroyed++;
        score += (o.type + 1) * 10;
        hit = true;
        if (destroyed % 10 === 0) {
          level++;
          flashTimer = 10;
        }
        break;
      }
    }
    if (!hit && o.y + o.height >= ninja.y) {
      hits++;
      obstacles.splice(i, 1);
      if (hits % 5 === 0) {
        lives--;
        if (lives <= 0) gameOver = true;
      }
    }
  }
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText(`레벨: ${level}`, 10, 20);
  ctx.fillText(`파괴: ${destroyed}`, 10, 40);
  ctx.fillText(`목숨: ${lives}`, 10, 60);
  ctx.fillText(`점수: ${score}`, 10, 80);

  if (flashTimer > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashTimer--;
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px sans-serif";
    ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
    document.getElementById("restartBtn").style.display = "block";
  }
}

function draw() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawNinja();
  drawShurikens();
  drawObstacles();
  drawUI();
}

function gameLoop() {
  updateGame();
  draw();
  requestAnimationFrame(gameLoop);
}

let keys = {};
document.addEventListener("keydown", e => {
  if (e.key === " ") fireShuriken();
  keys[e.key] = true;
});
document.addEventListener("keyup", e => keys[e.key] = false);

function moveNinja() {
  if (!gamePaused) {
    if (keys["ArrowLeft"] && ninja.x > 0) ninja.x -= ninja.speed;
    if (keys["ArrowRight"] && ninja.x < canvas.width - ninja.width) ninja.x += ninja.speed;
  }
}

setInterval(spawnObstacle, 1000);
setInterval(moveNinja, 16);
gameLoop();

// 🎮 다시 시작하기 버튼 기능
document.getElementById("restartBtn").addEventListener("click", () => {
  level = 1;
  destroyed = 0;
  hits = 0;
  lives = 3;
  gameOver = false;
  gameStarted = true;
  gamePaused = false;
  score = 0;
  shurikens = [];
  obstacles = [];
  document.getElementById("restartBtn").style.display = "none";
});
