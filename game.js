console.log('Script loaded');

let ctx;
const MAZE_WIDTH = 28;
const MAZE_HEIGHT = 31;

// Your corrected maze layout
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,0,0,1,2,1,0,0,0,1,2,1,1,2,1,0,0,0,1,2,1,0,0,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Context not available!');
        return;
    }

    let tileSize;
    let xOffset = 0;
    let yOffset = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const controlsHeight = window.innerWidth <= 1024 ? 150 : 0; // Space for controls on mobile
        const availableHeight = window.innerHeight - controlsHeight;
        tileSize = Math.min(window.innerWidth / MAZE_WIDTH, availableHeight / MAZE_HEIGHT) * 0.9;
        xOffset = (window.innerWidth - (MAZE_WIDTH * tileSize)) / 2;
        yOffset = (availableHeight - (MAZE_HEIGHT * tileSize)) / 2;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const Directions = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
    let pacman = { x: 13, y: 23, dir: Directions.LEFT, speed: 0 }; // Start stationary
    let ghosts = [
        { x: 13, y: 11, dir: Directions.UP, color: 'red', speed: 5, state: 'released', releaseTime: 0 },
        { x: 14, y: 14, dir: Directions.DOWN, color: '#FFB8FF', speed: 5, state: 'trapped', releaseTime: 5 },
        { x: 12, y: 14, dir: Directions.DOWN, color: '#00FFFF', speed: 5, state: 'trapped', releaseTime: 10 },
        { x: 15, y: 14, dir: Directions.DOWN, color: '#FFB852', speed: 5, state: 'trapped', releaseTime: 15 }
    ];
    let score = 0;
    let lives = 3;
    let level = 1;
    let pellets = [];
    let powerPellets = [];
    let ghostMoveCounter = 0;
    let pacmanMoveCounter = 0;
    let keys = {};
    let buttonStates = { up: false, down: false, left: false, right: false };
    let ghostsEdible = false;
    let edibleTimer = 0;
    let timeElapsed = 0; // New: Track game time for ghost release

    function resetMaze() {
        pellets = [];
        powerPellets = [];
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if (maze[y][x] === 2) pellets.push({ x, y });
                else if (maze[y][x] === 3) powerPellets.push({ x, y });
            }
        }
    }
    resetMaze();

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    function update() {
        timeElapsed += 1 / 60; // Increment time (assuming 60 FPS)
        pacmanMoveCounter++;
        if (pacmanMoveCounter % (pacman.speed || 4) === 0 && pacman.speed > 0) {
            if (keys['ArrowUp'] || buttonStates.up) pacman.dir = Directions.UP;
            if (keys['ArrowDown'] || buttonStates.down) pacman.dir = Directions.DOWN;
            if (keys['ArrowLeft'] || buttonStates.left) pacman.dir = Directions.LEFT;
            if (keys['ArrowRight'] || buttonStates.right) pacman.dir = Directions.RIGHT;
            movePacman();
        }
        if (ghostsEdible) {
            edibleTimer--;
            if (edibleTimer <= 0) ghostsEdible = false;
        }
        moveGhosts();
        checkCollisions();
        checkLevelCompletion();
    }

    function movePacman() {
        let nextX = pacman.x;
        let nextY = pacman.y;
        switch (pacman.dir) {
            case Directions.UP: nextY--; break;
            case Directions.DOWN: nextY++; break;
            case Directions.LEFT: nextX--; break;
            case Directions.RIGHT: nextX++; break;
        }
        if (nextX < 0) nextX = MAZE_WIDTH - 1;
        if (nextX >= MAZE_WIDTH) nextX = 0;
        if (nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1) {
            pacman.x = nextX;
            pacman.y = nextY;
        }
    }

    function moveGhosts() {
        ghostMoveCounter++;
        ghosts.forEach(ghost => {
            if (ghostMoveCounter % ghost.speed === 0) {
                // Release logic
                if (ghost.state === 'trapped' && timeElapsed >= ghost.releaseTime) {
                    ghost.state = 'released';
                }

                if (ghost.state === 'released') {
                    // If in ghost house, move toward exit [14,10]
                    if (ghost.y > 10) {
                        if (ghost.x < 14 && maze[ghost.y][ghost.x + 1] !== 1) ghost.x++;
                        else if (ghost.x > 14 && maze[ghost.y][ghost.x - 1] !== 1) ghost.x--;
                        else if (ghost.y > 10 && maze[ghost.y - 1][ghost.x] !== 1) ghost.y--;
                    } else {
                        // Random movement outside ghost house
                        let directions = [Directions.UP, Directions.RIGHT, Directions.DOWN, Directions.LEFT];
                        let possibleDirections = directions.filter(dir => {
                            let nextX = ghost.x;
                            let nextY = ghost.y;
                            switch (dir) {
                                case Directions.UP: nextY--; break;
                                case Directions.DOWN: nextY++; break;
                                case Directions.LEFT: nextX--; break;
                                case Directions.RIGHT: nextX++; break;
                            }
                            if (nextX < 0) nextX = MAZE_WIDTH - 1;
                            if (nextX >= MAZE_WIDTH) nextX = 0;
                            return nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1;
                        });
                        if (possibleDirections.length > 0) {
                            ghost.dir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                        }
                        let nextX = ghost.x;
                        let nextY = ghost.y;
                        switch (ghost.dir) {
                            case Directions.UP: nextY--; break;
                            case Directions.DOWN: nextY++; break;
                            case Directions.LEFT: nextX--; break;
                            case Directions.RIGHT: nextX++; break;
                        }
                        if (nextX < 0) nextX = MAZE_WIDTH - 1;
                        if (nextX >= MAZE_WIDTH) nextX = 0;
                        if (nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1) {
                            ghost.x = nextX;
                            ghost.y = nextY;
                        }
                    }
                }
            }
        });
    }

    function checkCollisions() {
        let pelletIndex = pellets.findIndex(p => p.x === pacman.x && p.y === pacman.y);
        if (pelletIndex !== -1) {
            pellets.splice(pelletIndex, 1);
            maze[pacman.y][pacman.x] = 0;
            score += 10;
        }
        let powerPelletIndex = powerPellets.findIndex(p => p.x === pacman.x && p.y === pacman.y);
        if (powerPelletIndex !== -1) {
            powerPellets.splice(powerPelletIndex, 1);
            maze[pacman.y][pacman.x] = 0;
            score += 50;
            ghostsEdible = true;
            edibleTimer = 600;
        }
        ghosts.forEach(ghost => {
            if (ghost.x === pacman.x && ghost.y === pacman.y) {
                if (ghostsEdible) {
                    score += 200;
                    ghost.x = 13;
                    ghost.y = 11;
                    ghost.dir = Directions.UP;
                    ghost.state = 'released'; // Reset to released, not trapped
                } else {
                    lives--;
                    if (lives > 0) resetPositions();
                    else {
                        alert('Game Over! Your score: ' + score);
                        document.location.reload();
                    }
                }
            }
        });
    }

    function checkLevelCompletion() {
        if (pellets.length === 0 && powerPellets.length === 0) {
            level++;
            if (level > 10) {
                score += 1000;
                alert('Congratulations! You beat all 10 levels! Final score: ' + score);
                document.location.reload();
            } else {
                alert(`Level ${level - 1} completed! Starting Level ${level}`);
                resetLevel();
            }
        }
    }

    function resetPositions() {
        pacman.x = 13;
        pacman.y = 23;
        pacman.dir = Directions.LEFT;
        pacman.speed = 0; // Start stationary
        ghosts[0].x = 13; ghosts[0].y = 11; ghosts[0].dir = Directions.UP; ghosts[0].state = 'released';
        ghosts[1].x = 14; ghosts[1].y = 14; ghosts[1].dir = Directions.DOWN; ghosts[1].state = 'trapped';
        ghosts[2].x = 12; ghosts[2].y = 14; ghosts[2].dir = Directions.DOWN; ghosts[2].state = 'trapped';
        ghosts[3].x = 15; ghosts[3].y = 14; ghosts[3].dir = Directions.DOWN; ghosts[3].state = 'trapped';
        timeElapsed = 0; // Reset time for new ghost release schedule
    }

    function resetLevel() {
        resetMaze();
        resetPositions();
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(x * tileSize + xOffset, y * tileSize + yOffset, tileSize, tileSize);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(x * tileSize + tileSize / 2 + xOffset, y * tileSize + tileSize / 2 + yOffset, tileSize / 6, 0, Math.PI * 2);
                    ctx.fill();
                } else if (maze[y][x] === 3) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(x * tileSize + tileSize / 2 + xOffset, y * tileSize + tileSize / 2 + yOffset, tileSize / 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(pacman.x * tileSize + tileSize / 2 + xOffset, pacman.y * tileSize + tileSize / 2 + yOffset, tileSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ghosts.forEach(ghost => {
            ctx.fillStyle = ghostsEdible ? 'blue' : ghost.color;
            ctx.fillRect(ghost.x * tileSize + xOffset, ghost.y * tileSize + yOffset, tileSize, tileSize);
        });
        document.getElementById('score').innerText = 'Score: ' + score;
        document.getElementById('lives').innerText = 'Lives: ' + lives;
        document.getElementById('level').innerText = 'Level: ' + level;
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') buttonStates.up = true;
        if (event.key === 'ArrowDown') buttonStates.down = true;
        if (event.key === 'ArrowLeft') buttonStates.left = true;
        if (event.key === 'ArrowRight') buttonStates.right = true;
        pacman.speed = 4; // Start moving when a key is pressed
    });
    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowUp') buttonStates.up = false;
        if (event.key === 'ArrowDown') buttonStates.down = false;
        if (event.key === 'ArrowLeft') buttonStates.left = false;
        if (event.key === 'ArrowRight') buttonStates.right = false;
    });

    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.up = true; pacman.speed = 4; });
    upBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.up = false; });
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.down = true; pacman.speed = 4; });
    downBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.down = false; });
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.left = true; pacman.speed = 4; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.left = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.right = true; pacman.speed = 4; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.right = false; });

    gameLoop();
});
