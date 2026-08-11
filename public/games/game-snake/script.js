const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const currentScoreLabel = document.getElementById("current-score");
const highScoreLabel = document.getElementById("high-score");

const grid = 20;
let count = 0;
let score = 0;
let highScore = localStorage.getItem("snake_high") || 0;
highScoreLabel.textContent = highScore;

let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [{x: 160, y: 160}], maxCells: 3 };
let apple = { x: 280, y: 160 };

// MOBILE TOUCH TRACKING VARIABLES
let touchStartX = 0;
let touchStartY = 0;

function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

function killSession() {
    // Dispatch score up into parent window layout safely
    window.parent.postMessage({ type: 'GAME_OVER_SCORE', score: score }, '*');
    
    snake.x = 160; snake.y = 160; snake.cells = [{x: 160, y: 160}]; snake.maxCells = 3;
    snake.dx = grid; snake.dy = 0; score = 0; currentScoreLabel.textContent = score;
    generateApple();
}

function generateApple() {
    apple.x = getRandomInt(0, 20) * grid;
    apple.y = getRandomInt(0, 20) * grid;
}

function loop() {
    requestAnimationFrame(loop);
    if (++count < 7) return; 
    count = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#aad751" : "#a2d149";
            ctx.fillRect(c * grid, r * grid, grid, grid);
        }
    }

    snake.x += snake.dx; snake.y += snake.dy;
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) { killSession(); return; }

    snake.cells.unshift({x: snake.x, y: snake.y});
    if (snake.cells.length > snake.maxCells) snake.cells.pop();

    ctx.fillStyle = "#e91e63";
    ctx.beginPath();
    ctx.arc(apple.x + grid/2, apple.y + grid/2, grid/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    snake.cells.forEach(function(cell, idx) {
        ctx.fillStyle = idx === 0 ? "#4674e9" : "#5182f7"; 
        ctx.fillRect(cell.x, cell.y, grid, grid);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++; score++; currentScoreLabel.textContent = score;
            if (score > highScore) { highScore = score; localStorage.setItem("snake_high", highScore); highScoreLabel.textContent = highScore; }
            generateApple();
        }

        for (let i = idx + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) { killSession(); return; }
        }
    });
}

// BUTTON CONTROL MAPS
document.getElementById('up-btn').addEventListener('click', () => { if (snake.dy === 0) { snake.dy = -grid; snake.dx = 0; } });
document.getElementById('down-btn').addEventListener('click', () => { if (snake.dy === 0) { snake.dy = grid; snake.dx = 0; } });
document.getElementById('left-btn').addEventListener('click', () => { if (snake.dx === 0) { snake.dx = -grid; snake.dy = 0; } });
document.getElementById('right-btn').addEventListener('click', () => { if (snake.dx === 0) { snake.dx = grid; snake.dy = 0; } });

// MOBILE PHONE SWIPE ENGINE LOGIC
window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', e => {
    let diffX = e.changedTouches[0].clientX - touchStartX;
    let diffY = e.changedTouches[0].clientY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) { // Swipe threshold check
            if (diffX > 0 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
            else if (diffX < 0 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
        }
    } else {
        if (Math.abs(diffY) > 30) {
            if (diffY > 0 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
            else if (diffY < 0 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
        }
    }
}, { passive: true });

generateApple();
requestAnimationFrame(loop);
