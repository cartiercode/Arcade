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

    // Blockchain setup
    const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace after deploying
    const contractABI = [
        {"inputs":[{"internalType":"address","name":"_automationAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
        {"inputs":[],"name":"payToPlay","outputs":[],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"bytes32","name":"gameStateHash","type":"bytes32"}],"name":"submitScore","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"scores","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasPaid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
    ];

    let web3;
    let contract;
    async function initWeb3() {
        if (window.tronWeb && window.tronWeb.defaultAddress) {
            web3 = window.tronWeb;
            contract = new web3.Contract(contractABI, contractAddress);
        } else {
            alert('Please install TronLink and log in!');
        }
    }
    initWeb3();

    async function payToPlay() {
        try {
            await contract.methods.payToPlay().send({
                callValue: web3.toSun(1), // 1 TRX
                from: web3.defaultAddress.base58
            });
            alert('Payment successful! Starting game...');
            return true;
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Check TronLink.');
            return false;
        }
    }

    async function submitScore() {
        const gameStateHash = web3.utils.sha3(JSON.stringify({ score, level, lives }));
        try {
            await contract.methods.submitScore(score, gameStateHash).send({
                from: web3.defaultAddress.base58
            });
            alert('Score submitted: ' + score);
        } catch (error) {
            console.error('Score submission failed:', error);
            alert('Score submission failed.');
        }
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
    const SWIPE_THRESHOLD = 30;

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
            if (keys['ArrowUp']) pacman.direction = Directions.UP;
            if (keys['ArrowDown']) pacman.direction = Directions.DOWN;
            if (keys['ArrowLeft']) pacman.direction = Directions.LEFT;
            if (keys['ArrowRight']) pacman.direction = Directions.RIGHT;
            if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
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
                    submitScore();
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
                submitScore();
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
            if (deltaX > 0) pacman.direction = Directions.RIGHT;
            else pacman.direction = Directions.LEFT;
        } else if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
            if (deltaY > 0) pacman.direction = Directions.DOWN;
            else pacman.direction = Directions.UP;
        }
        movePacman();
    });

    // Pay-to-play button
    canvas.style.display = 'none';
    const payButton = document.createElement('button');
    payButton.innerText = 'Pay 1 TRX to Play';
    payButton.style.position = 'absolute';
    payButton.style.top = '50%';
    payButton.style.left = '50%';
    payButton.style.transform = 'translate(-50%, -50%)';
    payButton.style.padding = '10px 20px';
    payButton.style.fontSize = '20px';
    payButton.style.backgroundColor = 'yellow';
    payButton.style.border = 'none';
    payButton.style.cursor = 'pointer';
    document.body.appendChild(payButton);

    payButton.addEventListener('click', async () => {
        const paid = await payToPlay();
        if (paid) {
            payButton.remove();
            canvas.style.display = 'block';
            gameLoop();
        }
    });
});
