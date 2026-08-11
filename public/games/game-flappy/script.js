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

    if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) { triggerGameOver(); return; }

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2); ctx.fill();

    if (frameCount % 90 === 0) {
        let gap = 110;
        let topH = Math.floor(Math.random() * (canvas.height - gap - 100)) + 30;
        pipes.push({ x: canvas.width, top: topH, bottom: canvas.height - topH - gap });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].top);
        ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, 50, pipes[i].bottom);

        if (bird.x + bird.r > pipes[i].x && bird.x - bird.r < pipes[i].x + 50) {
            if (bird.y - bird.r < pipes[i].top || bird.y + bird.r > canvas.height - pipes[i].bottom) {
                triggerGameOver();
                return;
            }
        }

        if (pipes[i].x === 50) { score++; document.getElementById('score').innerText = "Score: " + score; }
        if (pipes[i].x < -50) pipes.splice(i, 1);
    }

    frameCount++;
    requestAnimationFrame(loop);
}

function triggerGameOver() {
    gameOver = true;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.fillText("Game Over", 85, 220);
    ctx.font = '14px Arial'; ctx.fillStyle = '#cbd5e1'; ctx.fillText("Tap screen to cash-out coins", 65, 260);

    // Dispatches earned scores up into the parent dashboard ledger instantly on execution crash
    window.parent.postMessage({ type: 'GAME_OVER_SCORE', score: score }, '*');
}

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver) { resetGame(); requestAnimationFrame(loop); }
    else bird.v = -bird.jump;
}, { passive: false });

window.addEventListener('mousedown', (e) => {
    if (gameOver) { resetGame(); requestAnimationFrame(loop); }
    else bird.v = -bird.jump;
});

loop();
