const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const TILE_SIZE = 20;
const MAZE_WIDTH = CANVAS_WIDTH / TILE_SIZE;
const MAZE_HEIGHT = CANVAS_HEIGHT / TILE_SIZE;

const Directions = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

let pacman = { x: 1, y: 1, direction: Directions.RIGHT };
let ghosts = [
    { x: 9, y: 9, direction: Directions.LEFT },
    { x: 10, y: 9, direction: Directions.RIGHT }
];
let score = 0;
let lives = 3;
let level = 1;
let pellets = [];
let powerPellets = [];

let maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
        if (maze[y][x] === 2) pellets.push({ x, y });
        else if (maze[y][x] === 3) powerPellets.push({ x, y });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas found:', canvas);
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    console.log('Context loaded:', ctx);
    if (!ctx) {
        console.error('Context not available!');
        return;
    }

    gameLoop(); // Start the game loop here
});

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    movePacman();
    moveGhosts();
    checkCollisions();
    checkLevelCompletion();
}

function movePacman() {
    let nextX = pacman.x;
    let nextY = pacman.y;
    switch (pacman.direction) {
        case Directions.UP: nextY--; break;
        case Directions.DOWN: nextY++; break;
        case Directions.LEFT: nextX--; break;
        case Directions.RIGHT: nextX++; break;
    }
    if (maze[nextY][nextX] !== 1) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        let directions = [Directions.UP, Directions.DOWN, Directions.LEFT, Directions.RIGHT];
        let possibleDirections = directions.filter(dir => {
            let nextX = ghost.x;
            let nextY = ghost.y;
            if (dir === Directions.UP) nextY--;
            if (dir === Directions.DOWN) nextY++;
            if (dir === Directions.LEFT) nextX--;
            if (dir === Directions.RIGHT) nextX++;
            return maze[nextY][nextX] !== 1;
        });
        ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        if (ghost.direction === Directions.UP) ghost.y--;
        if (ghost.direction === Directions.DOWN) ghost.y++;
        if (ghost.direction === Directions.LEFT) ghost.x--;
        if (ghost.direction === Directions.RIGHT) ghost.x++;
    });
}

function checkCollisions() {
    let pelletIndex = pellets.findIndex(p => p.x === pacman.x && p.y === pacman.y);
    if (pelletIndex !== -1) {
        pellets.splice(pelletIndex, 1);
        score += 10;
    }
    let powerPelletIndex = powerPellets.findIndex(p => p.x === pacman.x && p.y === pacman.y);
    if (powerPelletIndex !== -1) {
        powerPellets.splice(powerPelletIndex, 1);
        score += 50;
    }
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            lives--;
            if (lives > 0) resetPositions();
            else {
                alert('Game Over! Your score: ' + score);
                document.location.reload();
            }
        }
    });
}

function checkLevelCompletion() {
    if (pellets.length === 0 && powerPellets.length === 0) {
        level++;
        if (level > 10) {
            score += 1000;
            alert('Congratulations! You beat level 10. Bonus points awarded. Final score: ' + score);
            document.location.reload();
        } else {
            alert('Level ' + (level - 1) + ' completed! Moving to level ' + level);
            resetLevel();
        }
    }
}

function resetPositions() {
    pacman.x = 1;
    pacman.y = 1;
    ghosts.forEach(ghost => {
        ghost.x = 9;
        ghost.y = 9;
    });
}

function resetLevel() {
    pellets = [];
    powerPellets = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (maze[y][x] === 2) pellets.push({ x, y });
            else if (maze[y][x] === 3) powerPellets.push({ x, y });
        }
    }
    resetPositions();
}

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (maze[y][x] === 2) {
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (maze[y][x] === 3) {
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(pacman.x * TILE_SIZE + TILE_SIZE / 2, pacman.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ghosts.forEach(ghost => {
        ctx.fillStyle = 'red';
        ctx.fillRect(ghost.x * TILE_SIZE, ghost.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    document.getElementById('score').innerText = 'Score: ' + score;
    document.getElementById('lives').innerText = 'Lives: ' + lives;
    document.getElementById('level').innerText = 'Level: ' + level;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp': pacman.direction = Directions.UP; break;
        case 'ArrowDown': pacman.direction = Directions.DOWN; break;
        case 'ArrowLeft': pacman.direction = Directions.LEFT; break;
        case 'ArrowRight': pacman.direction = Directions.RIGHT; break;
    }
});

gameLoop();
