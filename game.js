console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas:', canvas);
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    console.log('Context:', ctx);
    if (!ctx) {
        console.error('Context not available!');
        return;
    }

    // Draw a red square to test
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 100, 100);

    // Basic loop (no game logic yet)
    function animate() {
        console.log('Animating');
        requestAnimationFrame(animate);
    }
    animate();
});
