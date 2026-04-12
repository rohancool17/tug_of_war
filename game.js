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

// Game State
let score = 0; // -100 to 100
let isGameActive = false;
let isDragging = false;
let startX = 0;
let lastX = 0;
let aiForce = 0.1; // Slow constant pull (Easy mode)
let playerPullPower = 0.05; // Force per pixel dragged back

// Images
const images = {
    background: new Image(),
    dr: new Image(),
    hypertension: new Image()
};

images.background.src = 'assets/medical_lab_background.png';
images.dr.src = 'assets/team_dr_icon.png';
images.hypertension.src = 'assets/team_hypertension_icon.png';

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

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd);

canvas.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

function startGame() {
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
        endMessage.textContent = 'Hypertension is under control. Excellent work, Doctor!';
    } else {
        endTitle.textContent = 'Pressure Rising...';
        endTitle.className = 'loss';
        endMessage.textContent = 'Team Hypertension gained the upper hand. Keep advocating for healthy habits!';
    }
}

// Input Handling
function handleTouchStart(e) {
    if (!isGameActive) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    lastX = startX;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isGameActive || !isDragging) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - lastX;
    
    // Only count dragging "away" from the center (to the right)
    if (delta > 0) {
        score += delta * playerPullPower;
    }
    
    lastX = currentX;
    e.preventDefault();
}

function handleTouchEnd() {
    isDragging = false;
}

// Mouse support for testing
function handleMouseDown(e) {
    if (!isGameActive) return;
    isDragging = true;
    startX = e.clientX;
    lastX = startX;
}

function handleMouseMove(e) {
    if (!isGameActive || !isDragging) return;
    const currentX = e.clientX;
    const delta = currentX - lastX;
    if (delta > 0) {
        score += delta * playerPullPower;
    }
    lastX = currentX;
}

function handleMouseUp() {
    isDragging = false;
}

// Game Loop
function update() {
    if (!isGameActive) return;

    // AI constant pull (Force decreases score)
    score -= aiForce;

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
    
    // Draw rope
    const centerY = canvas.height * 0.6;
    const ropeStartX = 0;
    const ropeEndX = canvas.width;
    const ropeCurrentPos = (canvas.width / 2) + (score * (canvas.width / 200));

    // Rope Line
    ctx.beginPath();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    
    // Draw with a slight curve (sag)
    ctx.moveTo(ropeStartX, centerY);
    ctx.quadraticCurveTo(canvas.width / 2, centerY + 20 + (score / 5), ropeEndX, centerY);
    ctx.stroke();

    // Rope Detail (Braided look)
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Flag in center
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(ropeCurrentPos - 5, centerY - 25, 10, 50);

    // Draw Teams
    const spriteSize = 180;
    const spriteY = centerY - spriteSize;

    // Team Hypertension (Left)
    const hypertensionX = ropeCurrentPos - 150 - spriteSize;
    ctx.drawImage(images.hypertension, hypertensionX, spriteY, spriteSize, spriteSize);
    
    // Team Dr (Right)
    const drX = ropeCurrentPos + 150;
    ctx.drawImage(images.dr, drX, spriteY, spriteSize, spriteSize);

    // Tension Particles or dust if score moves fast (optional polish)
}
