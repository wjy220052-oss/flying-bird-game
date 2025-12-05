const canvas = document.querySelector("#gameCanvas");
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");
const reStart = document.querySelector("#restart");
if (reStart){
  reStart.addEventListener("click", resetGame);
}
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
const basegapHeight = 150;  //记录重开难度
const basepipeSpeed = 2;
// 变量（动态调整难度）
let gapHeight = 150;
let pipeSpeed = 2;

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

// 游戏开始
let started = false;

// 简单音效
const flapSound = new Audio("flap.wav");
const scoreSound = new Audio("score.wav");
const hitSound = new Audio("hit.wav");

// 工具：随机缺口高度
function randomGapY() {
  const margin = 50;
  return margin + Math.random() * (canvas.height - 2 * margin - gapHeight);
}

// 键盘控制：空格跳跃
document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
  if (!started) {
    started = true;
    running = true;
  }
   
    bird.vy = jumpStrength;
    flapSound.currentTime = 0;   //将播放重置到开始，实现循环播放
    flapSound.play();
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
  started = true;
  gapHeight = basegapHeight;  //重置难度
  pipeSpeed = basepipeSpeed;
  pipes.forEach(function(p,i){
    p.x = 300 + i * 200;
    p.gapY = randomGapY();
    p.scored = false;
  });
}

// 碰撞检测：小鸟与水管或边界
function stopGameWithhit(){
  if (running) {
    running = false;
    hitSound.currentTime = 0;   //将播放重置到开始，实现循环播放
    hitSound.play();
  }
    
}
function checkCollision() {
  // 上下边界
  if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
    stopGameWithhit();
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
      stopGameWithhit();
    }
  });
}

// 主更新函数
function update() {
  if (!running || !started) {
    return;
  }  
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
      scoreSound.currentTime = 0;   //将播放重置到开始，实现循环播放
      scoreSound.play();
      updateDifficulty();
    }

    // 水管完全离开屏幕 -> 移动到最右边并重置
    if (p.x + pipeWidth < 0) {
      p.x = canvas.width + 100;
      p.gapY = randomGapY();
      p.scored = false;
    }
  });

  // 难度调整
  function updateDifficulty(){
    pipeSpeed = basepipeSpeed + score / 100;

    const minGapHeight = 80;  //最小空隙
    const shrinkPerScore = 2; //每得2分缩小2像素
    gapHeight = Math.max(minGapHeight, basegapHeight - shrinkPerScore * (score / 2));
  }

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
  ctx.textAlign = "center";
  ctx.fillText(score, canvas.width / 2, 60);

  // Game Over 文本 & 文本提示
  ctx.font = "24px Arial";
  if (!running) {
    ctx.font = "24px Arial";
    ctx.fillText("Game Over (Press Enter)", canvas.width / 2, canvas.height / 2);
  }else if (!started) {
    ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2);
  }

  // 显示重新开始按钮
  if (reStart){
    if (!running && started) {
      reStart.style.display = "block";
    } else {
      reStart.style.display = "none";
  }
}
}
// 游戏循环
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
