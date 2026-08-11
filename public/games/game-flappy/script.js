const canvas = document.getElementById('flappy');
const ctx = canvas.getContext('2d');

let bird = { x: 50, y: 150, v: 0, g: 0.25, jump: 4.6, r: 12 };
let pipes = [];
let score = 0;
let frameCount = 0;
let gameOver = false;

function resetGame() {
    bird.y = 150; bird.v = 0; pipes = []; score = 0; frameCount = 0; gameOver = false;
    document.getElementById('score').innerText = "Score: 0";
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bird.v += bird.g;
    bird.y += bird.v;

    if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) gameOver = true;

    // Draw Bird
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2); ctx.fill();

    // Handle Pipes
    if (frameCount % 90 === 0) {
        let gap = 110;
        let topH = Math.floor(Math.random() * (canvas.height - gap - 100)) + 30;
        pipes.push({ x: canvas.width, top: topH, bottom: canvas.height - topH - gap });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        // Draw top pipe
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].top);
        // Draw bottom pipe
        ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, 50, pipes[i].bottom);

        // Check Collision
        if (bird.x + bird.r > pipes[i].x && bird.x - bird.r < pipes[i].x + 50) {
            if (bird.y - bird.r < pipes[i].top || bird.y + bird.r > canvas.height - pipes[i].bottom) {
                gameOver = true;
            }
        }

        if (pipes[i].x === 50) { score++; document.getElementById('score').innerText = "Score: " + score; }
        if (pipes[i].x < -50) pipes.splice(i, 1);
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#fff'; ctx.font = '24px Arial'; ctx.fillText("Game Over", 100, 240);
        ctx.font = '16px Arial'; ctx.fillText("Tap to Restart", 110, 280);
    } else {
        frameCount++;
        requestAnimationFrame(loop);
    }
}

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver) resetGame(), loop();
    else bird.v = -bird.jump;
});
window.addEventListener('mousedown', () => {
    if (gameOver) resetGame(), loop();
    else bird.v = -bird.jump;
});

loop();
