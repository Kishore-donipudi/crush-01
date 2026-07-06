// Configuration & DOM Elements
const welcomeCard = document.getElementById('welcomeCard');
const welcomeForm = document.getElementById('welcomeForm');
const nameInput = document.getElementById('nameInput');
const genderSelect = document.getElementById('genderSelect');
const cardTitle = document.getElementById('cardTitle');

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const messageText = document.getElementById('message');
const questionCard = document.getElementById('questionCard');
const victoryCard = document.getElementById('victoryCard');
const heartsContainer = document.getElementById('heartsContainer');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const stickmanContainer = document.getElementById('stickmanContainer');
const bgAudio = document.getElementById('bgAudio');

// GOOGLE SHEETS WEB APP URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLoqGUn7p_709WeoSgn7jc3_Aq7KwKjtEEx6ZvcqFpctcUjSCElC41JbfXt-Sp6xUkTA/exec";

let clickCount = 0;
let soundInitialized = false;
let audioCtx = null;
let synthIntervalId = null;
let isPlayingMusic = false;
let userName = "";
let userGender = "";

// Common male names for automatic detection
const maleNames = [
    "john", "james", "robert", "michael", "william", "david", "richard", "joseph", "thomas", "charles", 
    "christopher", "daniel", "matthew", "anthony", "mark", "donald", "steven", "paul", "andrew", "joshua", 
    "kenneth", "kevin", "brian", "george", "edward", "ronald", "timothy", "jason", "jeffrey", "ryan", 
    "jacob", "gary", "nicholas", "eric", "jonathan", "stephen", "larry", "justin", "scott", "brandon", 
    "benjamin", "samuel", "gregory", "frank", "alexander", "raymond", "patrick", "jack", "dennis", "jerry", 
    "tyler", "aaron", "jose", "adam", "nathan", "henry", "douglas", "zachary", "peter", "kyle", 
    "walter", "harold", "jeremy", "carl", "keith", "roger", "gerald", "ethan", "arthur", "terry", 
    "christian", "sean", "lawrence", "austin", "noah", "jesse", "billy", "bryan", "bruce", "jordan", 
    "albert", "willie", "alan", "ralph", "gabriel", "hector", "jesus", "rahul", "amit", "rohit",
    "mohammad", "ahmed", "ali", "yousef", "omar", "mustafa", "karan", "arjun", "vijay", "ajay", "sanjay"
];

function isMaleName(name) {
    const cleaned = name.toLowerCase().trim();
    return maleNames.includes(cleaned) || 
           maleNames.some(maleName => cleaned.startsWith(maleName + " "));
}

// Romantic and flirty arguments when "No" is clicked (exactly 5 stages before disappearing)
const flirtyLines = [
    "Are you sure? 🥺 Please think about it!",
    "But we make such a perfect pair! ☕🍰",
    "I promise to make you smile every single day! ☀️💖",
    "Just one date? I'll buy you your favorite food! 🍕🍰",
    "Okay, now you're just playing hard to get! 😉 Say Yes!"
];

// Stickman SVG poses for different disappointment stages
const SVGs = {
    sad1: `<svg viewBox="0 0 100 100" width="120" height="120" class="stickman-svg">
            <circle cx="50" cy="32" r="12" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <circle cx="46" cy="30" r="1.5" fill="#3d0c11"/>
            <circle cx="54" cy="30" r="1.5" fill="#3d0c11"/>
            <line x1="45" y1="38" x2="55" y2="38" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <line x1="50" y1="44" x2="50" y2="70" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 50 50 Q 38 52 40 62" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 50 50 Q 62 52 60 62" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="70" x2="42" y2="90" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="70" x2="58" y2="90" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
        </svg>`,
    sad2: `<svg viewBox="0 0 100 100" width="120" height="120" class="stickman-svg">
            <circle cx="50" cy="32" r="12" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 44 28 Q 46 31 48 29" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 52 29 Q 54 31 56 28" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 45 39 Q 50 36 55 39" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 50 44 Q 48 58 50 70" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 49 50 Q 38 48 40 38" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 51 50 Q 62 55 60 65" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="70" x2="42" y2="90" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="70" x2="58" y2="90" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
        </svg>`,
    sad3: `<svg viewBox="0 0 100 100" width="120" height="120" class="stickman-svg">
            <circle cx="40" cy="38" r="12" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 34 35 Q 36 38 38 36" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 42 36 Q 44 38 46 35" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 35 44 Q 40 41 45 44" fill="none" stroke="#3d0c11" stroke-width="2" stroke-linecap="round"/>
            <path d="M 45 48 Q 56 54 52 70" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 48 51 Q 40 62 38 72" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 48 51 Q 56 60 52 72" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 52 70 Q 42 75 35 88" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
            <path d="M 52 70 Q 62 76 68 88" fill="none" stroke="#3d0c11" stroke-width="4" stroke-linecap="round"/>
        </svg>`
};

// ==========================================
// 0. WELCOME FORM SUBMISSION LOGIC
// ==========================================
welcomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userName = nameInput.value.trim();
    userGender = genderSelect.value;
    
    if (userName) {
        const isMale = (userGender === 'Male') || isMaleName(userName);
        
        if (isMale) {
            // Log troll block submission
            sendDataToGoogleSheets(userName, userGender, "Blocked (Male detected) 🏳️·🌈");
            
            // Hide welcome form and show troll card
            welcomeCard.classList.add('hidden');
            const trollCard = document.getElementById('trollCard');
            trollCard.classList.remove('hidden');
            
            // Play the funny troll audio loop infinitely
            const trollAudio = document.getElementById('trollAudio');
            trollAudio.play().catch(err => console.log("Audio play deferred till user interaction: ", err));
        } else {
            // Personalize the main dating question
            cardTitle.innerHTML = `Will you date me, ${userName}? 🌹`;
            
            // Log welcome form submission
            sendDataToGoogleSheets(userName, userGender, "Opened Site");
            
            // Initialize Audio Context on interaction
            initAudio();
            
            // Hide welcome form and show main card
            welcomeCard.classList.add('hidden');
            questionCard.classList.remove('hidden');
            
            // Auto-play song when transitioning
            isPlayingMusic = true;
            musicToggleBtn.classList.add('playing');
            musicToggleBtn.title = "Pause melody";
            startMelodyLoop();
        }
    }
});

// ==========================================
// 1. FLOATING HEARTS GENERATOR
// ==========================================
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    
    // Random position and sizing
    const size = Math.random() * 20 + 15;
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = Math.random() * 4 + 6;
    
    // Custom styles
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${left}%`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;
    
    // Varied shades of pink/red
    const hue = 340 + Math.random() * 20;
    const lightness = 55 + Math.random() * 15;
    heart.style.backgroundColor = `hsl(${hue}, 85%, ${lightness}%)`;
    
    // Add variables for heart pseudo-elements
    heart.style.setProperty('--heart-bg', `hsl(${hue}, 85%, ${lightness}%)`);
    
    heartsContainer.appendChild(heart);
    
    // Remove heart after animation finishes
    setTimeout(() => {
        heart.remove();
    }, (duration + delay) * 1000);
}

// Generate hearts continuously
setInterval(createFloatingHeart, 400);

// ==========================================
// 2. NO BUTTON INTERACTION LOGIC
// ==========================================
noBtn.addEventListener('click', () => {
    clickCount++;
    
    // 1. Audio check - play a minor sad beep
    if (soundInitialized && isPlayingMusic) {
        playBeep(220, 0.15);
    }

    // 2. Shake card animation
    questionCard.classList.add('shake');
    setTimeout(() => {
        questionCard.classList.remove('shake');
    }, 500);

    // 3. Update the emotional text line
    const lineIndex = Math.min(clickCount - 1, flirtyLines.length - 1);
    messageText.style.opacity = '0';
    setTimeout(() => {
        messageText.innerText = flirtyLines[lineIndex];
        messageText.style.opacity = '1';
    }, 200);

    // 4. Update upper card stickman SVG based on click count
    if (clickCount <= 2) {
        stickmanContainer.innerHTML = SVGs.sad1;
    } else if (clickCount <= 4) {
        stickmanContainer.innerHTML = SVGs.sad2;
    } else {
        stickmanContainer.innerHTML = SVGs.sad3;
    }

    // Log the click count to Google Sheets
    sendDataToGoogleSheets(userName, userGender, `Clicked No (Click ${clickCount})`);

    // 5. Exponential growth for "Yes" button
    const scale = 1 + clickCount * 0.45;
    yesBtn.style.transform = `scale(${scale})`;
    yesBtn.style.zIndex = `${10 + clickCount}`;
    
    // 6. Shrink and hide "No" button (vanishes on 5th click)
    if (clickCount >= 5) {
        noBtn.style.display = 'none';
    } else {
        const shrink = Math.max(0.3, 1 - clickCount * 0.15);
        noBtn.style.transform = `scale(${shrink})`;

        // Start moving the button randomly on click/hover after 3 clicks
        if (clickCount >= 3) {
            moveNoButtonRandomly();
        }
    }
});

// Move the "No" button dynamically on hover when clickCount is 3 or 4
noBtn.addEventListener('mouseover', () => {
    if (clickCount >= 3 && clickCount < 5) {
        moveNoButtonRandomly();
    }
});

function moveNoButtonRandomly() {
    const container = document.querySelector('.buttons-container');
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    
    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;
    
    const randomX = Math.random() * maxX - (maxX / 2);
    const randomY = Math.random() * maxY - (maxY / 2);
    
    noBtn.style.position = 'relative';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
}

// ==========================================
// 3. YES BUTTON / VICTORY LOGIC
// ==========================================
yesBtn.addEventListener('click', () => {
    // Hide standard card
    questionCard.classList.add('hidden');
    
    // Show victory card
    victoryCard.classList.remove('hidden');
    
    // Trigger celebration hearts/confetti
    launchVictoryConfetti();
    
    // Trigger special victory chime / speed up melody
    if (!soundInitialized) {
        initAudio();
    }
    
    triggerVictoryChime();

    // Log acceptance in Google Sheet
    sendDataToGoogleSheets(userName, userGender, "Accepted! 💖");
});

function launchVictoryConfetti() {
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.innerText = ['💖', '❤️', '🌹', '✨', '👑', '🧸'][Math.floor(Math.random() * 6)];
            confetti.classList.add('heart-confetti');
            
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = Math.random() * 3 + 2;
            const size = Math.random() * 1.5 + 1;
            
            confetti.style.left = `${left}%`;
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.fontSize = `${size}rem`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, (duration + delay) * 1000);
        }, i * 30);
    }
}

// ==========================================
// 4. MAIN BACKGROUND MUSIC CONTROL
// ==========================================
function initAudio() {
    if (soundInitialized) return;
    
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        soundInitialized = true;
    } catch (e) {
        console.error("Web Audio API is not supported in this browser.");
    }
}

function playBeep(freq, duration) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function startMelodyLoop() {
    if (bgAudio) {
        bgAudio.play().catch(err => console.log("Audio play deferred: ", err));
    }
}

function stopMelodyLoop() {
    if (bgAudio) {
        bgAudio.pause();
    }
}

function triggerVictoryChime() {
    if (!audioCtx) return;
    
    // Pause background song temporarily
    stopMelodyLoop();
    
    const now = audioCtx.currentTime;
    const chimeNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77];
    
    chimeNotes.forEach((freq, idx) => {
        const time = now + (idx * 0.08);
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.08, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.85);
    });

    // Resume background song after chime finishes
    setTimeout(() => {
        if (isPlayingMusic) {
            startMelodyLoop();
        }
    }, 1200);
}

// Toggle background music play state
musicToggleBtn.addEventListener('click', () => {
    initAudio();
    
    if (isPlayingMusic) {
        stopMelodyLoop();
        isPlayingMusic = false;
        musicToggleBtn.classList.remove('playing');
        musicToggleBtn.title = "Play romantic melody";
    } else {
        isPlayingMusic = true;
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.title = "Pause melody";
        startMelodyLoop();
    }
});

// ==========================================
// 5. DATA TRANSMISSION TO GOOGLE SHEETS
// ==========================================
async function sendDataToGoogleSheets(name, gender, choice) {
    if (!GOOGLE_SCRIPT_URL) {
        console.log("Google Sheets URL not configured. Local Log:", { name, gender, choice });
        return;
    }
    
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify({ name, gender, choice })
        });
    } catch (e) {
        console.error("Failed to post details to Google Sheets:", e);
    }
}
