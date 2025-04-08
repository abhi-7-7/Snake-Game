const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const playerNameInput = document.getElementById('playerName');
const saveNameBtn = document.getElementById('saveName');
const leaderboardList = document.getElementById('leaderboardList');

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;

// Game variables
let snake = [];
let food = {};
let obstacles = [];  // Array to store obstacles
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let playerName = localStorage.getItem('snakePlayerName') || 'Player';
let gameLoop;
let gameStarted = false;

// Initialize high score display
highScoreElement.textContent = highScore;

// Initialize player name
if (playerName) {
    playerNameInput.value = playerName;
    playerNameInput.disabled = true;
    saveNameBtn.disabled = true;
}

// Load and display leaderboard
function loadLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('highScores')) || [];
    leaderboardList.innerHTML = '';
    
    leaderboard.sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            entryElement.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(entryElement);
        });
}

// Save player name
saveNameBtn.addEventListener('click', () => {
    const newName = playerNameInput.value.trim();
    if (newName) {
        playerName = newName;
        localStorage.setItem('playerName', playerName);
        alert('Name saved successfully!');
    }
});

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    obstacles = [];  // Clear obstacles
    generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    speed = 7;
    scoreElement.textContent = score;
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Generate obstacles based on score
function generateObstacles() {
    // Clear existing obstacles
    obstacles = [];
    
    // Add obstacles based on score thresholds
    if (score >= 50) {
        // First set of obstacles
        obstacles.push({ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 });
    }
    if (score >= 100) {
        // Second set of obstacles
        obstacles.push({ x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 });
    }
    if (score >= 150) {
        // Third set of obstacles
        obstacles.push({ x: 20, y: 5 }, { x: 20, y: 6 }, { x: 20, y: 7 });
    }
    if (score >= 200) {
        // Fourth set of obstacles
        obstacles.push({ x: 10, y: 20 }, { x: 10, y: 21 }, { x: 10, y: 22 });
    }
}

// Game loop
function gameUpdate() {
    moveSnake();
    
    // Generate new obstacles when score increases
    if (score % 50 === 0 && score > 0) {
        generateObstacles();
    }
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    draw();
}

// Move snake
function moveSnake() {
    direction = nextDirection;
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        // Increase speed every 50 points
        if (score % 50 === 0) {
            speed += 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameUpdate, 1000 / speed);
        }
    } else {
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    // Obstacle collision
    for (let obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y) {
            return true;
        }
    }
    
    return false;
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a001a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw obstacles
    ctx.fillStyle = '#666666';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
    });
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ff3366' : '#3366ff';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // Draw food
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            entryElement.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(entryElement);
        });
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    startBtn.textContent = 'Restart Game';
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    // Always save to leaderboard, regardless of high score
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.push({ name: playerName, score: score });
    localStorage.setItem('highScores', JSON.stringify(scores));
    
    // Enable name editing after game loss
    playerNameInput.disabled = false;
    saveNameBtn.disabled = false;
    
    // Update and display leaderboard
    updateLeaderboard();
    leaderboardPopup.classList.add('active');
    
    alert(`Game Over! Your score: ${score}\nHigh Score: ${highScore}`);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// Mobile controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (gameStarted && direction !== 'down') nextDirection = 'up';
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (gameStarted && direction !== 'up') nextDirection = 'down';
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (gameStarted && direction !== 'right') nextDirection = 'left';
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (gameStarted && direction !== 'left') nextDirection = 'right';
});

// Start game button
startBtn.addEventListener('click', () => {
    if (!playerName) {
        alert('Please enter your name first!');
        return;
    }
    
    if (!gameStarted) {
        initGame();
        gameStarted = true;
        startBtn.textContent = 'Pause Game';
        gameLoop = setInterval(gameUpdate, 1000 / speed);
    } else {
        clearInterval(gameLoop);
        gameStarted = false;
        startBtn.textContent = 'Resume Game';
    }
});

// Initialize page
function initializePage() {
    // Reset player name to default
    playerName = 'Player';
    playerNameInput.value = playerName;
    localStorage.setItem('playerName', playerName);
    
    // Reset high score to default
    highScore = 0;
    highScoreElement.textContent = highScore;
    localStorage.setItem('highScore', highScore);
    
    // Reset leaderboard
    localStorage.setItem('highScores', JSON.stringify([]));
    
    // Keep name input and save button enabled
    playerNameInput.disabled = false;
    saveNameBtn.disabled = false;
    
    // Update leaderboard display
    updateLeaderboard();
}

// Call initializePage when the page loads
document.addEventListener('DOMContentLoaded', initializePage);

// Leaderboard popup handling
const leaderboardPopup = document.querySelector('.leaderboard-popup');
const showLeaderboardBtn = document.getElementById('showLeaderboard');
const closeLeaderboardBtn = document.querySelector('.close-leaderboard');

showLeaderboardBtn.addEventListener('click', () => {
    leaderboardPopup.classList.add('active');
    updateLeaderboard();
});

closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardPopup.classList.remove('active');
});

// Close popup when clicking outside
leaderboardPopup.addEventListener('click', (e) => {
    if (e.target === leaderboardPopup) {
        leaderboardPopup.classList.remove('active');
    }
}); 