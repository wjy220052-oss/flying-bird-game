# Flappy Bird 小游戏（HTML5 版）
A mini-game named 'Flappy Bird'
这是一个用 **HTML + CSS + JavaScript (Canvas)** 实现的简易 Flappy Bird 风格小游戏。  
原型来自我在 Scratch 上做的“小鸟飞翔”游戏，这是我从可视化编程过渡到真实编程语言的练习项目之一。
This is a simple mini-game featuring 'Flappy Bird' which is made by HTML and Javascript.It comes from my trial to make a simple game on Scratch,which is one of my programmes served as transition from visual programming to real programming languages.
---

## 🎮 游戏玩法
The way to play
  按下 **空格键** 让小鸟向上“拍翅膀”
- CLick the 'Space' to make the bird(to be frank,it is only a circle) move up.
  松开后，小鸟会在重力作用下下落
- And if you release the key,it will drop down due to the 'gravity'.
  控制小鸟从水管中间的空隙飞过
- And your duty is to control the bird to fly through the interspace between the pipes.
  撞到水管或飞出屏幕上下边界则游戏结束
- Of course,the game wil be over if the poor bird dashes against the pipes or takes out of the canvas.
  每成功通过一对水管，分数 +1
- Every time the bird succeeds in flying through the interspace,the score will add one.
  之后我们还会添加一些新的功能
- Soon I'll supply some new functions.
  比如添加音效（拍翅膀 / 得分 / 撞击）、添加开始菜单和重新开始按钮、根据分数提升游戏难度（加快水管移动速度、缩小空隙等）  #  Luckily,I have made it!
- Such as sound effects,start menu,restart button and the dynamic game difficulty.
  当然，我也会把代码结构进一步拆分优化（例如用类/模块封装）
- I'll also optimize the code structure such as encapsulated in modules
---

---
And I updated this game by adding more functions,such as pause and continue,creating gradient backgrounds,controling the hitting spped to prevent the insertion,recording the best score and so on.
In this process,not only did I learn much syntax,but I also realized the importances of user interface and user experience and the object-oriented and so on.
---
##  🛠 技术栈 / Tech Stack

- HTML5 `<canvas>`
- CSS（简单的页面布局 & 背景样式）
  Simple page layout and style of background
- JavaScript
  - 基本的游戏循环（`requestAnimationFrame`）
    Essential game loop.
  - 碰撞检测
    Detection of hitting
  - 键盘事件监听
    Keyboard event listener
  - 简单的物理效果（重力、速度）
    Simple physical effects
---


## 🚀 本地运行方式（Run Locally）

1. 下载或克隆本仓库：
   Download or clone this repository.
   ```bash
   git clone https://github.com/wjy220052-oss/flying-bird-game.git
   ```
   或者直接点击仓库页面上的 “Code” → Download ZIP 下载压缩包并解压。
   OR directly click the 'Code' and download the compressed file.
2. 进入项目文件夹，找到 index.html。
   Click the project folder and find the file named index.html
3. 用浏览器打开 index.html：（如果你用 VS Code，也可以装一个 Live Server 插件来启动本地服务器）
   Open the index.html on the browser
4. 在浏览器中按 空格键 开始游戏。
   Cilck the 'Space' and run the game.
