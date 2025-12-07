const canvas = document.querySelector("#gameCanvas");
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");
const reStart = document.querySelector("#restart");

let gameState = "menu"
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
const maxFallSpeed = 6; // 最大下落速度
const basegapPipe = 250;
const origin = 250;  //初始水管位置
// 变量（动态调整难度）
let gapHeight = 150;
let pipeSpeed = 2;
let gapPipe = 250;

// 水管数组（屏幕上三对水管）
const pipes = [];
for (let i = 0; i < 4; i++) {
  const gapY = randomGapY();
  const x = origin + i * gapPipe;
  pipes.push({
    x,
    gapY,
    scored: false, // 这个水管是否已经加过分
  });
}

// 分数
let score = 0;

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
let isPressingSpace = false;  // 是否正按住空格
let spaceDownTime = 0;        // 按下的时间戳
let isLongPressing = false;   // 是否进入长按模式
const LONG_PRESS_DELAY = 180; // 超过多少毫秒算长按，可自己调

document.addEventListener("keydown", function(event) {
  if (event.code === "Enter") {
    if (gameState === "menu" || gameState === "gameover"){
      resetGame();
    }
  }
 if (event.code === "Space" && !event.repeat) {
    isPressingSpace = true;
    isLongPressing = false;
    handleSingleClick();
    spaceDownTime = performance.now();
  } 
})
document.addEventListener("keyup", function(event) {
  if (event.code === "Space") {
    isPressingSpace = false;
    isLongPressing = false;
  }
})
//  单击空格
function handleSingleClick(){
  bird.vy = jumpStrength;
  flapSound.currentTime = 0;   
  flapSound.play();
}

// 暂停or继续
let paused = false;

document.addEventListener("keydown", function(event) {
  if (event.code === "KeyP") {
    paused = !paused;
    if (paused) {
      gameState = "paused";
    } else {
      gameState = "playing";
    }
  }
})


// 重新开始
function resetGame() {
  bird.y = canvas.height / 2;
  bird.vy = 0;
  score = 0;
  gapHeight = basegapHeight;  //重置难度
  pipeSpeed = basepipeSpeed;
  gameState = "playing";
  pipes.forEach(function(p,i){
    p.x = origin + i * basegapPipe;
    p.gapY = randomGapY();
    p.scored = false;
  });
}

// 碰撞后
function stopGameWithhit(){
  if (gameState === "playing") {
    gameState = "gameover"
    hitSound.currentTime = 0;   //将播放重置到开始，实现循环播放
    hitSound.play();
  }
    
}

// 碰撞检测
function checkCollision() {
  // 上下边界
  if (bird.y - bird.radius < 0) {
    bird.y = bird.radius;
    stopGameWithhit();
    return;
  }else if (bird.y + bird.radius > canvas.height){
    bird.y = canvas.height - bird.radius;
    stopGameWithhit();
    return;
  }

  // 水管
  pipes.forEach(function(p){
    const inPipeX =
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + pipeWidth;

    const inGapY =
      bird.y - bird.radius > p.gapY &&
      bird.y + bird.radius < p.gapY + gapHeight;
    if (!inPipeX) return;
    if (!inGapY && bird.x >= p.x) {
      if (bird.vy < 0 && bird.y < p.gapY){
        bird.y = p.gapY + bird.radius;
      }else if (bird.vy > 0 && bird.y > p.gapY + gapHeight){
        bird.y = p.gapY + gapHeight - bird.radius;
      }
      stopGameWithhit();
    }
    else if (!inGapY && bird.x < p.x){
      stopGameWithhit();
    }
  });
}

// 主更新函数
function update() {
  if (gameState !== "playing"){
    return;
  }
  // 空格长按
  if (isPressingSpace) {
    const now = performance.now();

  // 超过阈值 → 进入真正的“长按模式”
  if (!isLongPressing && now - spaceDownTime > LONG_PRESS_DELAY) {
    isLongPressing = true;
  }
  // 长按效果：持续向上推力
  if (isLongPressing) {
    bird.vy -= 0.5;   // 喷气力度，你可以调：0.3 ~ 0.7
  }
  }
  // 否则考虑重力影响
  bird.vy += gravity;
  if (bird.vy > maxFallSpeed) {
    bird.vy = maxFallSpeed;
  }

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
      updateBestScore();
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
    const minGapHeight = 80;  //最小空隙
    const shrinkPerScore = 2; //每得2分缩小2像素
    const maxpipSpeed = 4; //最大速度
    const maxgapPipe = 220; //最大间隔
    pipeSpeed = Math.min(basepipeSpeed + score / 100,maxpipSpeed);
    gapPipe = Math.min(basegapPipe - score / 10,maxgapPipe);
    gapHeight = Math.max(minGapHeight, basegapHeight - shrinkPerScore * (score / 2));
  } 

  checkCollision();
}

// 记录得分
let bestscore = Number(localStorage.getItem("bestscore") || 0);
function updateBestScore() {
  if (score > bestscore) {
    bestscore = score;
    localStorage.setItem("bestscore", bestscore);
  }
}
// 主绘制函数
function draw() {
  // 清屏
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === "menu"){
    drawMenuScrean();
  }else{
    drawGameScrean();
    if (gameState === "paused"){
      drawPausedScrean();
    }
    if (gameState === "gameover"){
    drawGameOverScrean();
  }
  }
    // 显示重新开始按钮
  if (reStart){
    if (gameState === "gameover" || gameState === "menu") {
      reStart.style.display = "block";
    } else {
      reStart.style.display = "none";
  }
}
}
function drawMenuScrean() {
  let grad_1 = ctx.createLinearGradient(0, 0, 0, canvas.height);  //从上到下渐变
  grad_1.addColorStop(0, "#a8ff78");   //添加颜色节点
  grad_1.addColorStop(1, "#78ffd6");
  ctx.fillStyle = grad_1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("会飞的小球", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "16px Arial";
  ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2 + 50);
  ctx.fillText("Press Space to Fly", canvas.width / 2, canvas.height / 2 + 80);
}
function drawPausedScrean() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  // ctx.fillRect(0,canvas.height / 2 - 50 , canvas.width, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "16px Arial";
  ctx.fillText("Press P to Resume", canvas.width / 2, canvas.height / 2);
}
function drawGameScrean(){
  // 画背景
  let grad_2 = ctx.createLinearGradient(0, 0, 0, canvas.height);  //从上到下渐变
  grad_2.addColorStop(0, "#4facfe");   //添加颜色节点
  grad_2.addColorStop(1, "#00f2fe");
  ctx.fillStyle = grad_2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 画小鸟
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fill();
  ctx.strokeStyle = "#f57f17";
  ctx.stroke();

  // 画水管
  ctx.fillStyle = "#4169e1";
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
}
  // Game Over 文本 & 文本提示
function drawGameOverScrean() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  // ctx.fillRect(0,canvas.height / 2 - 50 , canvas.width, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "16px Arial";
  ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2);
  ctx.font = "13px Arial";
  ctx.fillText("Your Score:" + score, canvas.width / 2, canvas.height / 2 + 20);
  ctx.font = "13px Arial";
  ctx.fillText("Best Score:" + bestscore, canvas.width / 2, canvas.height / 2 + 40);

}
// 游戏循环
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();