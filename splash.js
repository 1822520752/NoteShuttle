// ===== 启动动画 - 极简瑞士风 =====
(function () {
    'use strict';

    const SPLASH_DURATION = 2200;
    const BG = '#f5f5f5';
    const INK = '#0a0a0a';

    let splashCanvas, splashCtx;
    let animationId;
    let startTime;
    let skipped = false;

    function initSplash() {
        splashCanvas = document.getElementById('splash-canvas');
        if (!splashCanvas) return;
        splashCtx = splashCanvas.getContext('2d');
        resizeSplashCanvas();

        const overlay = document.getElementById('splash-overlay');
        if (overlay) {
            overlay.addEventListener('click', skipSplash);
            overlay.addEventListener('touchstart', skipSplash, { passive: true });
        }

        setTimeout(function () {
            if (!skipped && document.getElementById('splash-overlay') && document.getElementById('splash-overlay').style.display !== 'none') {
                skipSplash();
            }
        }, SPLASH_DURATION + 400);

        startTime = performance.now();
        animationId = requestAnimationFrame(animateSplash);
    }

    function resizeSplashCanvas() {
        if (!splashCanvas) return;
        splashCanvas.width = window.innerWidth;
        splashCanvas.height = window.innerHeight;
    }

    function animateSplash(timestamp) {
        if (skipped) return;

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / SPLASH_DURATION, 1);

        splashCtx.fillStyle = BG;
        splashCtx.fillRect(0, 0, splashCanvas.width, splashCanvas.height);

        const cx = splashCanvas.width / 2;
        const cy = splashCanvas.height / 2;

        // 中心字标
        const logoOpacity = Math.min(progress * 2.5, 1);
        splashCtx.globalAlpha = logoOpacity;
        splashCtx.fillStyle = INK;
        splashCtx.font = 'bold 72px "Inter", "SF Pro Display", "Helvetica Neue", "PingFang SC", sans-serif';
        splashCtx.textAlign = 'center';
        splashCtx.textBaseline = 'middle';
        splashCtx.fillText('V', cx, cy);

        // 细线装饰
        const lineWidth = Math.min(progress * 3, 1);
        splashCtx.globalAlpha = logoOpacity * 0.9;
        splashCtx.strokeStyle = INK;
        splashCtx.lineWidth = 1.5;
        splashCtx.beginPath();
        splashCtx.moveTo(cx - 24, cy + 48);
        splashCtx.lineTo(cx + 24, cy + 48);
        splashCtx.stroke();

        splashCtx.globalAlpha = 1;

        if (progress >= 1) {
            finishSplash();
            return;
        }

        animationId = requestAnimationFrame(animateSplash);
    }

    function skipSplash() {
        if (skipped) return;
        skipped = true;

        if (animationId) cancelAnimationFrame(animationId);

        const overlay = document.getElementById('splash-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 220ms ease';
            overlay.style.opacity = '0';
            setTimeout(function () {
                overlay.style.display = 'none';
            }, 240);
        }
    }

    function finishSplash() {
        if (skipped) return;
        skipSplash();
    }

    window.addEventListener('resize', resizeSplashCanvas);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplash);
    } else {
        initSplash();
    }
})();
