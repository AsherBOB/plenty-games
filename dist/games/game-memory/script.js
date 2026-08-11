const gridContainer = document.getElementById('grid-matrix');
const scoreLabel = document.getElementById('score-lbl');
const statusMessage = document.getElementById('status-msg');

const itemDeck = ['🐟', '🐟', '💩', '💩', '🔮', '🔮', '🐯', '🐯', '🦊', '🦊', '🐼', '🐼', '🦁', '🦁', '🐸', '🐸'];
let selectedPair = [];
let pointWallet = 0;
let totalMatches = 0;

// Shuffle tracking array mechanics
itemDeck.sort(() => Math.random() - 0.5);

function initEcosystem() {
    gridContainer.innerHTML = '';
    itemDeck.forEach((char, index) => {
        const block = document.createElement('div');
        block.classList.add('card');
        block.dataset.char = char;
        block.dataset.id = index;
        block.addEventListener('click', triggerRotation);
        gridContainer.appendChild(block);
    });
}

function triggerRotation() {
    if (selectedPair.length === 2 || this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    this.textContent = this.dataset.char;
    selectedPair.push(this);

    if (selectedPair.length === 2) {
        setTimeout(verifyEquivalence, 500);
    }
}

function verifyEquivalence() {
    const [nodeA, nodeB] = selectedPair;
    
    if (nodeA.dataset.char === nodeB.dataset.char) {
        nodeA.classList.add('matched');
        nodeB.classList.add('matched');
        pointWallet += 20;
        totalMatches += 2;
        scoreLabel.textContent = pointWallet;
        
        if (totalMatches === itemDeck.length) {
            statusMessage.textContent = "Complete! 🎉";
            // Broadcast score payload up into core App.jsx coin holder matrix
            setTimeout(() => {
                window.parent.postMessage({ type: 'GAME_OVER_SCORE', score: pointWallet }, '*');
            }, 1000);
        }
    } else {
        nodeA.classList.remove('flipped');
        nodeB.classList.remove('flipped');
        nodeA.textContent = '';
        nodeB.textContent = '';
    }
    selectedPair = [];
}

initEcosystem();
