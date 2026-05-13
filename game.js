const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const progressIndicator = document.getElementById('progress-indicator');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const drNameInput = document.getElementById('dr-name-input');
const drLabelHeader = document.getElementById('dr-label-header');
const drLabelCard = document.getElementById('dr-label-card');

// Game State
let score = 0; // -100 to 100
let drName = "Doctor";
let isGameActive = false;
let isBtn1Down = false;
let isBtn2Down = false;
let isBtn3Down = false;
let aiForce = 0.15; // Slightly faster AI pull for button mechanic
let playerPullPower = 0.4; // Fixed pull power when buttons are coordinate

// Images
const images = {
    background: new Image(),
    tugOfWar: new Image()
};

images.background.src = 'assets/medical_lab_background.png';
images.tugOfWar.src = 'assets/tug of war.png';

// Setup Canvas size
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

drNameInput.addEventListener('input', () => {
    const val = drNameInput.value.trim() || "Doctor";
    drLabelHeader.textContent = `Team Dr. ${val}`;
    drLabelCard.textContent = `Team Dr. ${val}`;
});

const btn1 = document.getElementById('btn-1');
const btn2 = document.getElementById('btn-2');
const btn3 = document.getElementById('btn-3');

const handleButtonDown = (e, btnId) => {
    if (!isGameActive) return;
    if (btnId === 1) { isBtn1Down = true; btn1.classList.add('pressed'); }
    if (btnId === 2) { isBtn2Down = true; btn2.classList.add('pressed'); }
    if (btnId === 3) { isBtn3Down = true; btn3.classList.add('pressed'); }
    e.preventDefault();
};

const handleButtonUp = (e, btnId) => {
    if (btnId === 1) { isBtn1Down = false; btn1.classList.remove('pressed'); }
    if (btnId === 2) { isBtn2Down = false; btn2.classList.remove('pressed'); }
    if (btnId === 3) { isBtn3Down = false; btn3.classList.remove('pressed'); }
    if (e.cancelable) e.preventDefault();
};

btn1.addEventListener('touchstart', (e) => handleButtonDown(e, 1), { passive: false });
btn2.addEventListener('touchstart', (e) => handleButtonDown(e, 2), { passive: false });
btn3.addEventListener('touchstart', (e) => handleButtonDown(e, 3), { passive: false });

btn1.addEventListener('touchend', (e) => handleButtonUp(e, 1), { passive: false });
btn2.addEventListener('touchend', (e) => handleButtonUp(e, 2), { passive: false });
btn3.addEventListener('touchend', (e) => handleButtonUp(e, 3), { passive: false });

btn1.addEventListener('touchcancel', (e) => handleButtonUp(e, 1), { passive: false });
btn2.addEventListener('touchcancel', (e) => handleButtonUp(e, 2), { passive: false });
btn3.addEventListener('touchcancel', (e) => handleButtonUp(e, 3), { passive: false });

// Mouse support for testing
btn1.addEventListener('mousedown', (e) => { isBtn1Down = true; btn1.classList.add('pressed'); });
btn2.addEventListener('mousedown', (e) => { isBtn2Down = true; btn2.classList.add('pressed'); });
btn3.addEventListener('mousedown', (e) => { isBtn3Down = true; btn3.classList.add('pressed'); });

window.addEventListener('mouseup', () => {
    isBtn1Down = isBtn2Down = isBtn3Down = false;
    btn1.classList.remove('pressed');
    btn2.classList.remove('pressed');
    btn3.classList.remove('pressed');
});

function startGame() {
    drName = drNameInput.value.trim() || "Doctor";
    score = 0;
    isGameActive = true;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    requestAnimationFrame(update);
}

function endGame(winner) {
    isGameActive = false;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    if (winner === 'dr') {
        endTitle.textContent = 'Victory!';
        endTitle.className = 'win';
        endMessage.textContent = `Combination of Tazloc Trio and Dr. ${drName} defeats hypertension`;
    } else {
        endTitle.textContent = 'Pressure Rising...';
        endTitle.className = 'loss';
        endMessage.textContent = 'Team Hypertension gained the upper hand. Keep advocating for healthy habits!';
    }
}


// Game Loop
function update() {
    if (!isGameActive) return;

    // AI constant pull (Force decreases score)
    score -= aiForce;

    // Player Pull (Only if all 3 buttons are pressed)
    if (isBtn1Down && isBtn2Down && isBtn3Down) {
        score += playerPullPower;
        
        // Add tension to characters visuals? (optional)
    }

    // Boundary check
    if (score > 100) score = 100;
    if (score < -100) score = -100;

    // Update HUD
    const progressPercent = ((score + 100) / 200) * 100;
    progressIndicator.style.width = `${progressPercent}%`;

    // Visual feedback (Shake if score is low)
    if (score < -50) {
        canvas.classList.add('shake');
    } else {
        canvas.classList.remove('shake');
    }

    // Win/Loss Condition
    if (score >= 100) endGame('dr');
    if (score <= -100) endGame('hypertension');

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height * 0.6;
    const ropeCurrentPos = (canvas.width / 2) + (score * (canvas.width / 200));

    // Draw Tug of War Image
    let imgWidth = canvas.width * 0.8;
    let imgHeight = canvas.height * 0.5;
    
    if (images.tugOfWar.complete && images.tugOfWar.naturalWidth) {
        imgHeight = (images.tugOfWar.naturalHeight / images.tugOfWar.naturalWidth) * imgWidth;
    }
    
    // We want the center of the image to be at ropeCurrentPos
    const drawX = ropeCurrentPos - (imgWidth / 2);
    // Aligning the image so that the "rope" roughly matches the centerY
    // Assuming the rope is roughly in the middle of the image
    const drawY = centerY - (imgHeight / 2);

    if (images.tugOfWar.complete && images.tugOfWar.naturalWidth !== 0) {
        ctx.drawImage(images.tugOfWar, drawX, drawY, imgWidth, imgHeight);
    }
}
