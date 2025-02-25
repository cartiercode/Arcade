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

    const MAZE_WIDTH = 20;
    const MAZE_HEIGHT = 20;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const minDimension = Math.min(canvas.width, canvas.height);
        window.TILE_SIZE = minDimension / MAZE_WIDTH;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const Directions = { UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right' };
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
    let ghostMoveCounter = 0;
    let pacmanMoveCounter = 0;
    let keys = {};
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const SWIPE_THRESHOLD = 20;
    let isTouchActive = false;

    let maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
        [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,2,2,2,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,2,2,2,2,1,1,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
        [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (maze[y][x] === 2) pellets.push({ x, y });
            else if (maze[y][x] === 3) powerPellets.push({ x, y });
        }
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    function update() {
        pacmanMoveCounter++;
        if (pacmanMoveCounter % 4 === 0) {
            // Keyboard controls
            if (keys['ArrowUp']) pacman.direction = Directions.UP;
            if (keys['ArrowDown']) pacman.direction = Directions.DOWN;
            if (keys['ArrowLeft']) pacman.direction = Directions.LEFT;
            if (keys['ArrowRight']) pacman.direction = Directions.RIGHT;
            if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
                movePacman();
            }
            // Touch controls
            if (isTouchActive) {
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
        if (nextX >= 0 && nextX < MAZE_WIDTH && nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1) {
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
                    return nextX >= 0 && nextX < MAZE_WIDTH && nextY >= 0 && nextY < MAZE_HEIGHT && maze[nextY][nextX] !== 1;
                });
                if (possibleDirections.length > 0) {
                    ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }
                if (ghost.direction === Directions.UP) ghost.y--;
                if (ghost.direction === Directions.DOWN) ghost.y++;
                if (ghost.direction === Directions.LEFT) ghost.x--;
                if (ghost.direction === Directions.RIGHT) ghost.x++;
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
                    ctx.arc(x * window.TILE_SIZE + window.TILE_SIZE / 2, y * window.TILE_SIZE + window.TILE_SIZE / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (maze[y][x] === 3) {
                    ctx.fillStyle = 'yellow';
                    ctx.beginPath();
                    ctx.arc(x * window.TILE_SIZE + window.TILE_SIZE / 2, y * window.TILE_SIZE + window.TILE_SIZE / 2, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(pacman.x * window.TILE_SIZE + window.TILE_SIZE / 2, pacman.y * window.TILE_SIZE + window.TILE_SIZE / 2, window.TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ghosts.forEach(ghost => {
            ctx.fillStyle = 'red';
            ctx.fillRect(ghost.x * window.TILE_SIZE, ghost.y * window.TILE_SIZE, window.TILE_SIZE, window.TILE_SIZE);
        });
        document.getElementById('score').innerText = 'Score: ' + score;
        document.getElementById('lives').innerText = 'Lives: ' + lives;
        document.getElementById('level').innerText = 'Level: ' + level;
    }

    document.addEventListener('keydown', (event) => { keys[event.key] = true; });
    document.addEventListener('keyup', (event) => { keys[event.key] = false; });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchActive = true;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        let deltaX = touchEndX - touchStartX;
        let deltaY = touchEndY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
            pacman.direction = deltaX > 0 ? Directions.RIGHT : Directions.LEFT;
        } else if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
            pacman.direction = deltaY > 0 ? Directions.DOWN : Directions.UP;
        }
        isTouchActive = false; // Stop when finger lifts
    });

    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        isTouchActive = false; // Stop if touch is interrupted
    });

    gameLoop();
});
