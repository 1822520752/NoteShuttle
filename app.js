// ===== 背景系统 + 兼容导出 =====
let mainBackgroundCanvas = null;
let mainBackgroundCtx = null;
let currentBackgroundIndex = 1;

const backgroundStyles = [
    (ctx, width, height) => {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);
    },
    (ctx, width, height) => {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#111111');
        grad.addColorStop(1, '#1f1f1f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    },
    (ctx, width, height) => {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
        grad.addColorStop(0, '#c7c7c7');
        grad.addColorStop(1, '#f5f5f5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    },
    (ctx, width, height) => {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let i = 0; i <= width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i <= height; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
    }
];

const backgroundCache = [];
let isBackgroundCached = false;

function cacheBackgrounds() {
    if (isBackgroundCached) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 700;
    backgroundStyles.forEach((style, index) => {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        style(offscreenCtx, canvas.width, canvas.height);
        backgroundCache[index] = offscreenCanvas;
    });
    isBackgroundCached = true;
}

function initMainBackground() {
    mainBackgroundCanvas = document.getElementById('mainBackgroundCanvas');
    if (!mainBackgroundCanvas) return;
    mainBackgroundCtx = mainBackgroundCanvas.getContext('2d');
    resizeMainBackground();
    window.addEventListener('resize', resizeMainBackground);
}

function resizeMainBackground() {
    if (!mainBackgroundCanvas) return;
    mainBackgroundCanvas.width = window.innerWidth;
    mainBackgroundCanvas.height = window.innerHeight;
    drawMainBackground();
}

function drawMainBackground() {
    if (!mainBackgroundCtx || !backgroundStyles[currentBackgroundIndex]) return;
    backgroundStyles[currentBackgroundIndex](mainBackgroundCtx, mainBackgroundCanvas.width, mainBackgroundCanvas.height);
}

function changeMainBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundStyles.length;
    drawMainBackground();
    if (document.getElementById('posterCanvas').style.display !== 'none') {
        generatePoster();
    }
}

window.addEventListener('load', function () {
    cacheBackgrounds();
    initMainBackground();
});
