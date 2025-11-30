const canvas = document.querySelector("#gameCanvas");
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");

// 小鸟
const bird = {
  x: 100,
  y: canvas.height / 2,
  radius: 20,
  vy: 0,
};

// 常量
const gravity = 0.5;   // 重力
const jumpStrength = -7; // 按一次的“跳跃速度”
const pipeWidth = 60;
const gapHeight = 150;
const pipeSpeed = 2;

// 水管数组（屏幕上三对水管）
const pipes = [];
for (let i = 0; i < 3; i++) {
  const gapY = randomGapY();
  const x = 300 + i * 200;
  pipes.push({
    x,
    gapY,
    scored: false, // 这个水管是否已经加过分
  });
}

// 分数
let score = 0;
let running = true;

// 简单音效（未使用）
// const flapSound = new Audio("flap.mp3");
// const scoreSound = new Audio("score.mp3");
// const hitSound = new Audio("hit.mp3");

// 工具：随机缺口高度
function randomGapY() {
  const margin = 50;
  return margin + Math.random() * (canvas.height - 2 * margin - gapHeight);
}

// 键盘控制：空格跳跃
document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    bird.vy = jumpStrength;
  }
  if (!running && event.code === "Enter") {
    resetGame();
  }
});

// 重新开始
function resetGame() {
  bird.y = canvas.height / 2;
  bird.vy = 0;
  score = 0;
  running = true;
  pipes.forEach((p, i) => {
    p.x = 300 + i * 200;
    p.gapY = randomGapY();
    p.scored = false;
  });
}

// 碰撞检测：小鸟与水管或边界
function checkCollision() {
  // 上下边界
  if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
    running = false;
  }

  // 水管
  pipes.forEach(function(p){
    const inPipeX =
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + pipeWidth;

    const inGapY =
      bird.y - bird.radius > p.gapY &&
      bird.y + bird.radius < p.gapY + gapHeight;

    if (inPipeX && !inGapY) {
      running = false;
    }
  });
}

// 主更新函数
function update() {
  if (!running) 
    return;

  // 小鸟受重力影响
  bird.vy += gravity;
  bird.y += bird.vy;

  // 更新水管位置
  pipes.forEach(function(p) {
    p.x -= pipeSpeed;

    // 经过小鸟右侧 -> 加分
    if (!p.scored && p.x + pipeWidth < bird.x) {
      score++;
      p.scored = true;
      // scoreSound.play();
    }

    // 水管完全离开屏幕 -> 移动到最右边并重置
    if (p.x + pipeWidth < 0) {
      p.x = canvas.width + 100;
      p.gapY = randomGapY();
      p.scored = false;
    }
  });

  checkCollision();
}

// 主绘制函数
function draw() {
  // 清屏
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 画小鸟
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fill();
  ctx.strokeStyle = "#f57f17";
  ctx.stroke();

  // 画水管
  ctx.fillStyle = "#5fb54a";
  pipes.forEach((p) => {
    // 上水管
    ctx.fillRect(p.x, 0, pipeWidth, p.gapY);
    // 下水管
    ctx.fillRect(
      p.x,
      p.gapY + gapHeight,
      pipeWidth,
      canvas.height - (p.gapY + gapHeight)
    );
  });

  // 画分数
  ctx.fillStyle = "white";
  ctx.font = "32px Arial";
  ctx.fillText(score, canvas.width / 2, 60);

  // Game Over 文本
  if (!running) {
    ctx.font = "24px Arial";
    ctx.fillText("Game Over (Press Enter)", 50, canvas.height / 2);
  }
}

// 游戏循环
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();


