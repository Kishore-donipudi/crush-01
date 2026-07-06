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

// Stickman image poses for different disappointment stages
const STICKMAN_IMAGES = {
    sad1: "assets/stickman_sad1.png",
    sad2: "assets/stickman_sad2.png",
    sad3: "assets/stickman_crying.png"
};

// ==========================================
// 0. WELCOME FORM SUBMISSION LOGIC
// ==========================================
welcomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userName = nameInput.value.trim();
    userGender = genderSelect.value;
    
    if (userName) {
        const isBlocked = (userGender === 'Male') || (userGender === 'Other') || isMaleName(userName);
        
        if (isBlocked) {
            let blockReason = "Blocked (Male detected) 🏳️‍🌈";
            if (userGender === 'Other') {
                blockReason = "Blocked (Other gender option)";
            }
            
            // Log troll block submission
            sendDataToGoogleSheets(userName, userGender, blockReason);
            
            // Update troll message dynamically
            const trollMessage = document.getElementById('trollMessage');
            if (trollMessage) {
                if (userGender === 'Other') {
                    trollMessage.innerText = "Sorry, this site is reserved for my crush only! 🤫❌";
                } else {
                    trollMessage.innerText = "Wait, you're a guy?! Why are you gay? 🏳️‍🌈";
                }
            }
            
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

    // 4. Update upper card stickman image based on click count
    const stickmanImg = document.getElementById('stickmanImg');
    if (stickmanImg) {
        if (clickCount <= 2) {
            stickmanImg.src = STICKMAN_IMAGES.sad1;
        } else if (clickCount <= 4) {
            stickmanImg.src = STICKMAN_IMAGES.sad2;
        } else {
            stickmanImg.src = STICKMAN_IMAGES.sad3;
        }
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
