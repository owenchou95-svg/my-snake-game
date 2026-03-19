// 游戏配置
const CONFIG = {
    canvasSize: 400,
    gridSize: 20,
    gameSpeed: 100,
    colors: {
        snakeHead: '#4CAF50',
        snakeBody: '#8BC34A',
        food: '#FF5722',
        grid: '#34495e',
        text: '#ecf0f1'
    }
};

// 游戏状态
let gameState = {
    snake: [],
    direction: 'right',
    nextDirection: 'right',
    food: {},
    score: 0,
    highScore: 0,
    gameLoop: null,
    isRunning: false,
    isPaused: false,
    isGameOver: false
};

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');

// 初始化画布
function initCanvas() {
    canvas.width = CONFIG.canvasSize;
    canvas.height = CONFIG.canvasSize;
}

// 初始化游戏
function initGame() {
    // 初始化蛇的位置（中间位置，长度为3）
    const startX = Math.floor(CONFIG.canvasSize / CONFIG.gridSize / 2);
    const startY = Math.floor(CONFIG.canvasSize / CONFIG.gridSize / 2);

    gameState.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];

    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.isPaused = false;

    // 从localStorage读取最高分
    const savedHighScore = localStorage.getItem('snakeHighScore');
    gameState.highScore = savedHighScore ? parseInt(savedHighScore) : 0;

    updateScore();
    generateFood();
}

// 生成食物
function generateFood() {
    const gridCount = CONFIG.canvasSize / CONFIG.gridSize;

    do {
        gameState.food = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    } while (isOnSnake(gameState.food));
}

// 检查位置是否在蛇身上
function isOnSnake(pos) {
    return gameState.snake.some(segment =>
        segment.x === pos.x && segment.y === pos.y
    );
}

// 更新分数显示
function updateScore() {
    currentScoreEl.textContent = gameState.score;
    highScoreEl.textContent = gameState.highScore;
}

// 保存最高分
function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        updateScore();
    }
}

// 绘制网格背景
function drawGrid() {
    ctx.fillStyle = CONFIG.colors.grid;
    ctx.fillRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;

    for (let i = 0; i <= CONFIG.canvasSize; i += CONFIG.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CONFIG.canvasSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CONFIG.canvasSize, i);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.gridSize;
        const y = segment.y * CONFIG.gridSize;

        // 蛇头使用不同颜色
        ctx.fillStyle = index === 0 ? CONFIG.colors.snakeHead : CONFIG.colors.snakeBody;

        // 绘制圆角矩形
        const radius = 5;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, CONFIG.gridSize - 4, CONFIG.gridSize - 4, radius);
        ctx.fill();

        // 蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = 3;
            const eyeOffset = 6;

            let eye1X, eye1Y, eye2X, eye2Y;

            switch (gameState.direction) {
                case 'right':
                    eye1X = x + CONFIG.gridSize - eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + CONFIG.gridSize - eyeOffset;
                    eye2Y = y + CONFIG.gridSize - eyeOffset;
                    break;
                case 'left':
                    eye1X = x + eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + eyeOffset;
                    eye2Y = y + CONFIG.gridSize - eyeOffset;
                    break;
                case 'up':
                    eye1X = x + eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + CONFIG.gridSize - eyeOffset;
                    eye2Y = y + eyeOffset;
                    break;
                case 'down':
                    eye1X = x + eyeOffset;
                    eye1Y = y + CONFIG.gridSize - eyeOffset;
                    eye2X = x + CONFIG.gridSize - eyeOffset;
                    eye2Y = y + CONFIG.gridSize - eyeOffset;
                    break;
            }

            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 绘制食物（苹果）
function drawFood() {
    const gs = CONFIG.gridSize;
    const bx = gameState.food.x * gs;
    const by = gameState.food.y * gs;
    const cx = bx + gs / 2;
    const cy = by + gs / 2 + 1;
    const r = gs / 2 - 3;

    // 苹果主体（径向渐变）
    const gradient = ctx.createRadialGradient(cx - 1, cy - 2, 1, cx, cy, r);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 茎
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, by + 3);
    ctx.lineTo(cx + 1, by + 1);
    ctx.stroke();

    // 叶子
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.ellipse(cx + 3, by + 2, 3, 1.5, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, r / 3, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制游戏画面
function draw() {
    drawGrid();
    drawFood();
    drawSnake();

    // 暂停时显示暂停文字
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

        ctx.fillStyle = CONFIG.colors.text;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', CONFIG.canvasSize / 2, CONFIG.canvasSize / 2);
    }
}

// 移动蛇
function moveSnake() {
    // 更新方向
    gameState.direction = gameState.nextDirection;

    const head = { ...gameState.snake[0] };

    switch (gameState.direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // 添加新头部
    gameState.snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        updateScore();
        generateFood();
    } else {
        // 没有吃到食物，移除尾部
        gameState.snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = gameState.snake[0];
    const gridCount = CONFIG.canvasSize / CONFIG.gridSize;

    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        return true;
    }

    // 检查自身碰撞（从第4节开始检查，因为头不可能碰到前3节）
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }

    return false;
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    clearInterval(gameState.gameLoop);

    saveHighScore();

    overlayTitle.textContent = '游戏结束';
    overlayMessage.textContent = `最终分数: ${gameState.score}`;
    startBtn.textContent = '重新开始';
    gameOverlay.classList.remove('hidden');
}

// 游戏主循环
function gameLoopFn() {
    if (!gameState.isPaused) {
        moveSnake();

        if (checkCollision()) {
            gameOver();
            return;
        }
    }

    draw();
}

// 开始游戏
function startGame() {
    if (gameState.isRunning) {
        // 如果游戏正在运行，切换暂停状态
        gameState.isPaused = !gameState.isPaused;
        return;
    }

    initGame();
    gameState.isRunning = true;
    gameOverlay.classList.add('hidden');

    // 清除之前的游戏循环
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }

    // 启动游戏循环
    gameState.gameLoop = setInterval(gameLoopFn, CONFIG.gameSpeed);
}

// 重新开始游戏
function restartGame() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    startGame();
}

// 暂停/继续游戏
function togglePause() {
    if (!gameState.isRunning || gameState.isGameOver) {
        return;
    }

    gameState.isPaused = !gameState.isPaused;
    draw();
}

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    // 空格键：开始/暂停
    if (e.code === 'Space') {
        if (gameState.isGameOver) {
            restartGame();
        } else {
            startGame();
            togglePause();
        }
        return;
    }

    // R键：重新开始
    if (e.code === 'KeyR') {
        restartGame();
        return;
    }

    // 方向控制
    if (!gameState.isRunning || gameState.isPaused) {
        return;
    }

    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', () => {
    if (gameState.isGameOver) {
        restartGame();
    } else {
        startGame();
    }
});

// 初始化
initCanvas();
initGame();
draw();
