const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const progressIndicator = document.getElementById('progress-indicator');

// Screens
const hcpScreen = document.getElementById('hcp-screen');
const descriptionScreen = document.getElementById('description-screen');
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

// Inputs & Texts
const hcpNameInput = document.getElementById('hcp-name');
const hcpCodeInput = document.getElementById('hcp-code');
const introHcpName = document.getElementById('intro-hcp-name');

// Buttons
const hcpSubmitButton = document.getElementById('hcp-submit-button');
const descNextButton = document.getElementById('desc-next-button');
const introStartButton = document.getElementById('intro-start-button');
const restartButton = document.getElementById('restart-button');

// Game State
let score = 0; // -100 to 100
let hcpName = "Doctor";
let hcpCode = "";
let gameStartTime = null;
let isGameActive = false;
let isBtn1Down = false;
let isBtn2Down = false;
let isBtn3Down = false;
let aiForce = 0.12;
let playerPullPower = 0.45;

// Images
const images = {
    background: new Image(),
    tugOfWar: new Image()
};

images.tugOfWar.src = '/static/assets/tug of war.png';

// Setup Canvas size
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Navigation helper
let lastTransitionTime = 0;

function addTapListener(el, callback) {
    if (!el) return;
    
    const handleEvent = (e) => {
        const now = Date.now();
        if (now - lastTransitionTime < 400) { // 400ms guard
            return;
        }
        lastTransitionTime = now;
        callback();
    };

    el.addEventListener('click', handleEvent);
    el.addEventListener('touchstart', (e) => {
        handleEvent(e);
    }, { passive: true });
}

// HCP Submit Logic
addTapListener(hcpSubmitButton, () => {
    const name = hcpNameInput.value.trim();
    const code = hcpCodeInput.value.trim();
    
    if (name && code) {
        hcpName = name;
        hcpCode = code;
        hcpScreen.classList.add('hidden');
        descriptionScreen.classList.remove('hidden');
    } else {
        window.alert("Please fill in both HCP Name and HCP Code to continue.");
    }
});

// Real-time validation removal (HCP screen)
if (hcpNameInput) hcpNameInput.addEventListener('input', () => {});
if (hcpCodeInput) hcpCodeInput.addEventListener('input', () => {});

addTapListener(descNextButton, () => {
    descriptionScreen.classList.add('hidden');
    introHcpName.textContent = hcpName;
    introScreen.classList.remove('hidden');
    gameStartTime = Date.now();
});

addTapListener(introStartButton, startGame);

addTapListener(restartButton, () => {
    endScreen.classList.add('hidden');
    introHcpName.textContent = hcpName;
    introScreen.classList.remove('hidden');
    gameStartTime = Date.now();
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
};

if (btn1) {
    btn1.addEventListener('touchstart', (e) => handleButtonDown(e, 1), { passive: false });
    btn1.addEventListener('touchend', (e) => handleButtonUp(e, 1), { passive: false });
    btn1.addEventListener('touchcancel', (e) => handleButtonUp(e, 1), { passive: false });
    btn1.addEventListener('mousedown', (e) => { isBtn1Down = true; btn1.classList.add('pressed'); });
}
if (btn2) {
    btn2.addEventListener('touchstart', (e) => handleButtonDown(e, 2), { passive: false });
    btn2.addEventListener('touchend', (e) => handleButtonUp(e, 2), { passive: false });
    btn2.addEventListener('touchcancel', (e) => handleButtonUp(e, 2), { passive: false });
    btn2.addEventListener('mousedown', (e) => { isBtn2Down = true; btn2.classList.add('pressed'); });
}
if (btn3) {
    btn3.addEventListener('touchstart', (e) => handleButtonDown(e, 3), { passive: false });
    btn3.addEventListener('touchend', (e) => handleButtonUp(e, 3), { passive: false });
    btn3.addEventListener('touchcancel', (e) => handleButtonUp(e, 3), { passive: false });
    btn3.addEventListener('mousedown', (e) => { isBtn3Down = true; btn3.classList.add('pressed'); });
}

window.addEventListener('mouseup', () => {
    isBtn1Down = isBtn2Down = isBtn3Down = false;
    if (btn1) btn1.classList.remove('pressed');
    if (btn2) btn2.classList.remove('pressed');
    if (btn3) btn3.classList.remove('pressed');
});

function startGame() {
    console.log("Starting Game Loop...");
    score = 0;
    isGameActive = true;
    introScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    requestAnimationFrame(update);
}

function endGame(winner) {
    console.warn(">>> END GAME TRIGGERED <<< Winner:", winner);
    isGameActive = false;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');

    const endTime = Date.now();
    const timeSpent = (endTime - gameStartTime) / 1000;
    
    fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            hcp_name: hcpName,
            hcp_code: hcpCode,
            time_spent: timeSpent,
            winner: winner
        })
    })
    .then(r => r.json())
    .then(res => console.log("Save result:", res))
    .catch(err => console.error("Save error:", err));
}

function update() {
    if (!isGameActive) return;
    score -= aiForce;
    if (isBtn1Down && isBtn2Down && isBtn3Down) {
        score += playerPullPower;
    }
    if (score > 100) score = 100;
    if (score < -100) score = -100;
    const progressPercent = ((score + 100) / 200) * 100;
    progressIndicator.style.width = `${progressPercent}%`;
    if (score < -50) canvas.classList.add('shake');
    else canvas.classList.remove('shake');
    
    // Win/Loss Condition
    if (score >= 100) {
        isGameActive = false;
        endGame('dr');
        return;
    }
    if (score <= -100) {
        isGameActive = false;
        endGame('hypertension');
        return;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerY = canvas.height * 0.6;
    const ropeCurrentPos = (canvas.width / 2) + (score * (canvas.width / 200));
    let imgWidth = canvas.width * 0.8;
    let imgHeight = canvas.height * 0.5;
    if (images.tugOfWar.complete && images.tugOfWar.naturalWidth) {
        imgHeight = (images.tugOfWar.naturalHeight / images.tugOfWar.naturalWidth) * imgWidth;
    }
    const drawX = ropeCurrentPos - (imgWidth / 2);
    const drawY = centerY - (imgHeight / 2);
    if (images.tugOfWar.complete) {
        ctx.drawImage(images.tugOfWar, drawX, drawY, imgWidth, imgHeight);
    }
}
