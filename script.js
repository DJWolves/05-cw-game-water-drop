// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval;
let score = 0;
let highScore = 0;
const gameDuration = 30;
let timeRemaining = gameDuration;
const waterDropSound = new Audio('audio file/water-drip.mp3');
waterDropSound.preload = 'auto';
let selectedMode = 'easy';
let soundEnabled = true;
let settingsMenuOpen = false;
let welcomePopupOpen = false;

const gameModes = {
  easy: {
    label: 'Easy',
    duration: 35,
    spawnInterval: 900,
    dropSizeMultiplier: { min: 0.8, max: 1.2 },
  },
  normal: {
    label: 'Normal',
    duration: 30,
    spawnInterval: 650,
    dropSizeMultiplier: { min: 0.7, max: 1.15 },
  },
  hard: {
    label: 'Hard',
    duration: 25,
    spawnInterval: 420,
    dropSizeMultiplier: { min: 0.6, max: 1 },
  },
  'free-catcher': {
    label: 'Free Catcher',
    duration: 45,
    spawnInterval: 500,
    dropSizeMultiplier: { min: 0.9, max: 1.3 },
  },
};

function getStoredSoundEnabled() {
  try {
    return localStorage.getItem('water-drop-sound-enabled');
  } catch {
    return null;
  }
}

function storeSoundEnabled(value) {
  try {
    localStorage.setItem('water-drop-sound-enabled', String(value));
  } catch {
    // Ignore storage failures and keep the in-memory setting.
  }
}

function showWelcomePopup() {
  const welcomePopup = document.getElementById("welcome-popup");
  welcomePopup.hidden = false;
  welcomePopupOpen = true;
}

function hideWelcomePopup() {
  const welcomePopup = document.getElementById("welcome-popup");
  welcomePopup.hidden = true;
  welcomePopupOpen = false;
}

// Wait for button click to start the game
document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("welcome-start-btn").addEventListener("click", handleMenuStart);
document.getElementById("settings-btn").addEventListener("click", toggleSettingsMenu);
document.getElementById("sound-toggle").addEventListener("change", handleSoundToggle);

const storedSoundEnabled = getStoredSoundEnabled();
if (storedSoundEnabled !== null) {
  soundEnabled = storedSoundEnabled === 'true';
}

document.getElementById("sound-toggle").checked = soundEnabled;
updateSettingsMenuState();

document.querySelectorAll(".difficulty-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedMode(button.dataset.mode);
  });
});

document.addEventListener("click", (event) => {
  const settingsWrapper = document.querySelector(".settings-wrapper");
  if (settingsMenuOpen && settingsWrapper && !settingsWrapper.contains(event.target)) {
    closeSettingsMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === 'Escape' && settingsMenuOpen) {
    closeSettingsMenu();
  }
});

showWelcomePopup();

function setSelectedMode(mode) {
  selectedMode = gameModes[mode] ? mode : 'easy';
  document.querySelectorAll(".difficulty-btn").forEach((option) => {
    option.classList.toggle("is-selected", option.dataset.mode === selectedMode);
  });
}

function toggleSettingsMenu() {
  if (settingsMenuOpen) {
    closeSettingsMenu();
    return;
  }

  openSettingsMenu();
}

function openSettingsMenu() {
  settingsMenuOpen = true;
  updateSettingsMenuState();
}

function closeSettingsMenu() {
  settingsMenuOpen = false;
  updateSettingsMenuState();
}

function updateSettingsMenuState() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");

  settingsBtn.setAttribute("aria-expanded", String(settingsMenuOpen));
  settingsMenu.hidden = !settingsMenuOpen;
  settingsMenu.classList.toggle("is-open", settingsMenuOpen);
}

function handleSoundToggle(event) {
  soundEnabled = event.target.checked;
  storeSoundEnabled(soundEnabled);
}

function handleMenuStart() {
  if (welcomePopupOpen) {
    hideWelcomePopup();
  }
  startGame();
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  const mode = gameModes[selectedMode] || gameModes.easy;
  closeSettingsMenu();
  removeResultPopup();
  clearDrops();

  gameRunning = true;
  score = 0;
  timeRemaining = mode.duration;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeRemaining;
  document.querySelector(".game-wrapper").classList.add("is-playing");

  // Create new drops based on the selected mode
  dropMaker = setInterval(() => createDrop(mode), mode.spawnInterval);

  // Countdown timer updates once per second
  timerInterval = setInterval(() => {
    timeRemaining -= 1;
    document.getElementById("time").textContent = timeRemaining;

    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  if (score > highScore) {
    highScore = score;
    document.getElementById("high-score").textContent = highScore;
  }

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  document.querySelector(".game-wrapper").classList.remove("is-playing");
  showResultPopup();
}

function resetGame() {
  const mode = gameModes[selectedMode] || gameModes.easy;
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  closeSettingsMenu();
  removeResultPopup();
  clearDrops();
  document.querySelector(".game-wrapper").classList.remove("is-playing");

  score = 0;
  timeRemaining = mode.duration;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeRemaining;
}

function clearDrops() {
  const gameContainer = document.getElementById("game-container");
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}

function showResultPopup() {
  removeResultPopup();

  const overlay = document.createElement("div");
  overlay.id = "result-popup";
  overlay.className = "result-popup-overlay";

  const modal = document.createElement("div");
  modal.className = "result-popup-modal";
  modal.innerHTML = `
    <p>Congrats! You collected ${score} of water droplets!</p>
    <button id="play-again-btn" type="button">Play Again</button>
  `;

  overlay.appendChild(modal);
  createConfetti(overlay, 90);
  document.body.appendChild(overlay);

  document.getElementById("play-again-btn").addEventListener("click", startGame);
}

function removeResultPopup() {
  const existingPopup = document.getElementById("result-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
}

function createConfetti(container, count) {
  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C"];

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
  }
}

function createDrop(mode) {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * (mode.dropSizeMultiplier.max - mode.dropSizeMultiplier.min) + mode.dropSizeMultiplier.min;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove and score when a droplet is clicked
  drop.addEventListener("click", () => {
    score += 1;
    document.getElementById("score").textContent = score;
    playWaterDropSound();
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function playWaterDropSound() {
  if (!soundEnabled) {
    return;
  }

  waterDropSound.currentTime = 0;
  waterDropSound.play().catch(() => {});
}

setSelectedMode(selectedMode);
