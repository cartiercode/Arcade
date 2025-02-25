console.log('Script loaded');

let ctx;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
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

    const MAZE_WIDTH = 28; // Classic Pac-Man width
    const MAZE_HEIGHT = 31; // Classic Pac-Man height

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const minDimension = Math.min(canvas.width, canvas.height);
        window.TILE_SIZE = minDimension / MAZE_WIDTH; // Scale based on width
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const Directions = { UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right' };
    let pacman = { x: 13, y: 23, direction: Directions.LEFT }; // Starting at classic position
    let ghosts = [
        { x: 13, y: 11, direction: Directions.UP, color: 'red' },    // Blinky
        { x: 14, y: 13, direction: Directions.DOWN, color: '#FFB8FF' }, // Pinky
        { x: 12, y: 13, direction: Directions.DOWN, color: '#00FFFF' }, // Inky
        { x: 15, y: 13, direction: Directions.DOWN, color: '#FFB852' }  // Clyde
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

    // Classic Pac-Man maze (1 = wall, 2 = pellet, 3 = power pellet, 0 = empty)
    let maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
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
        [1,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

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
        pacmanMoveCounter++;
        if (pacmanMoveCounter % 4 === 0) {
            if (keys['ArrowUp']) pacman.direction = Directions.UP;
            if (keys['ArrowDown']) pacman.direction = Directions.DOWN;
            if (keys['ArrowLeft']) pacman.direction = Directions.LEFT;
            if (keys['ArrowRight']) pacman.direction = Directions.RIGHT;
            if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
                movePacman();
            }
            if (buttonStates.up) pacman.direction = Directions.UP;
            if (buttonStates.down) pacman.direction = Directions.DOWN;
            if (buttonStates.left) pacman.direction = Directions.LEFT;
            if (buttonStates.right) pacman.direction = Directions.RIGHT;
            if (buttonStates.up || buttonStates.down || buttonStates.left || buttonStates.right) {
                movePacman();
            }
        }
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
        if (nextX < 0) nextX = MAZE_WIDTH - 1; // Wrap around left
        if (nextX >= MAZE_WIDTH) nextX = 0;     // Wrap around right
        if (nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1) {
            pacman.x = nextX;
            pacman.y = nextY;
        }
    }

    function moveGhosts() {
        ghostMoveCounter++;
        if (ghostMoveCounter % 10 === 0) {
            ghosts.forEach(ghost => {
                let directions = [Directions.UP, Directions.DOWN, Directions.LEFT, Directions.RIGHT];
                let possibleDirections = directions.filter(dir => {
                    let nextX = ghost.x;
                    let nextY = ghost.y;
                    if (dir === Directions.UP) nextY--;
                    if (dir === Directions.DOWN) nextY++;
                    if (dir === Directions.LEFT) nextX--;
                    if (dir === Directions.RIGHT) nextX++;
                    if (nextX < 0) nextX = MAZE_WIDTH - 1;
                    if (nextX >= MAZE_WIDTH) nextX = 0;
                    return nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1;
                });
                if (possibleDirections.length > 0) {
                    ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }
                let nextX = ghost.x;
                let nextY = ghost.y;
                if (ghost.direction === Directions.UP) nextY--;
                if (ghost.direction === Directions.DOWN) nextY++;
                if (ghost.direction === Directions.LEFT) nextX--;
                if (ghost.direction === Directions.RIGHT) nextX++;
                if (nextX < 0) nextX = MAZE_WIDTH - 1;
                if (nextX >= MAZE_WIDTH) nextX = 0;
                if (nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1) {
                    ghost.x = nextX;
                    ghost.y = nextY;
                }
            });
        }
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
        pacman.direction = Directions.LEFT;
        ghosts[0].x = 13; ghosts[0].y = 11; ghosts[0].direction = Directions.UP;    // Blinky
        ghosts[1].x = 14; ghosts[1].y = 13; ghosts[1].direction = Directions.DOWN;  // Pinky
        ghosts[2].x = 12; ghosts[2].y = 13; ghosts[2].direction = Directions.DOWN;  // Inky
        ghosts[3].x = 15; ghosts[3].y = 13; ghosts[3].direction = Directions.DOWN;  // Clyde
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
                    ctx.fillRect(x * window.TILE_SIZE, y * window.TILE_SIZE, window.TILE_SIZE, window.TILE_SIZE);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(x * window.TILE_SIZE + window.TILE_SIZE / 2, y * window.TILE_SIZE + window.TILE_SIZE / 2, window.TILE_SIZE / 6, 0, Math.PI * 2);
                    ctx.fill();
                } else if (maze[y][x] === 3) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(x * window.TILE_SIZE + window.TILE_SIZE / 2, y * window.TILE_SIZE + window.TILE_SIZE / 2, window.TILE_SIZE / 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(pacman.x * window.TILE_SIZE + window.TILE_SIZE / 2, pacman.y * window.TILE_SIZE + window.TILE_SIZE / 2, window.TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            ctx.fillRect(ghost.x * window.TILE_SIZE, ghost.y * window.TILE_SIZE, window.TILE_SIZE, window.TILE_SIZE);
        });
        document.getElementById('score').innerText = 'Score: ' + score;
        document.getElementById('lives').innerText = 'Lives: ' + lives;
        document.getElementById('level').innerText = 'Level: ' + level;
    }

    document.addEventListener('keydown', (event) => { keys[event.key] = true; });
    document.addEventListener('keyup', (event) => { keys[event.key] = false; });

    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    upBtn.addEventListener('mousedown', () => { buttonStates.up = true; });
    upBtn.addEventListener('mouseup', () => { buttonStates.up = false; });
    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.up = true; });
    upBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.up = false; });

    downBtn.addEventListener('mousedown', () => { buttonStates.down = true; });
    downBtn.addEventListener('mouseup', () => { buttonStates.down = false; });
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.down = true; });
    downBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.down = false; });

    leftBtn.addEventListener('mousedown', () => { buttonStates.left = true; });
    leftBtn.addEventListener('mouseup', () => { buttonStates.left = false; });
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.left = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.left = false; });

    rightBtn.addEventListener('mousedown', () => { buttonStates.right = true; });
    rightBtn.addEventListener('mouseup', () => { buttonStates.right = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); buttonStates.right = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); buttonStates.right = false; });

    gameLoop();
});
