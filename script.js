// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval;
let score = 0;
const gameDuration = 30;
let timeRemaining = gameDuration;

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  removeResultPopup();
  clearDrops();

  gameRunning = true;
  score = 0;
  timeRemaining = gameDuration;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeRemaining;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

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
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  showResultPopup();
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

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
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
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
