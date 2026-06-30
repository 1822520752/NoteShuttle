// ===== 记分板逻辑 =====
let timerInterval;
let seconds = 0;
let timerRunning = false;
let scoreA = 0;
let scoreB = 0;
let setsA = [];
let setsB = [];
let currentSet = 1;
const WIN_SCORE = 21;
const MAX_SCORE = 30;
const WIN_SETS = 2;
let server = 'a';
let gameOver = false;
let finalMatchTime = 0;
let finalMatchDate = null;
let currentScreen = 'scoreboard';

function toggleTimer() {
    const timerButton = document.getElementById('timer-button');
    if (timerRunning) {
        clearInterval(timerInterval);
        timerButton.textContent = '继续比赛';
    } else {
        timerInterval = setInterval(updateTimer, 1000);
        timerButton.textContent = '暂停比赛';
    }
    timerRunning = !timerRunning;
}

function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    document.getElementById('match-timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerRunning = false;
    document.getElementById('match-timer').textContent = '00:00';
    document.getElementById('timer-button').textContent = '开始比赛';
}
        function updateScore(team, amount) {
            if (!timerRunning) {
                alert('请先点击"开始比赛"才能调整比分');
                return;
            }
            if (gameOver) {
                alert('比赛已结束，请点击"重置比分"开始新比赛');
                return;
            }

            if (team === 'a') {
                scoreA = Math.max(0, scoreA + amount);
                document.getElementById('team-a-score').textContent = scoreA;
                if (amount > 0) {
                    const el = document.getElementById('team-a-score');
                    el.style.color = '#2ecc71';
                    setTimeout(() => { el.style.color = ''; }, 300);
                }
            } else {
                scoreB = Math.max(0, scoreB + amount);
                document.getElementById('team-b-score').textContent = scoreB;
                if (amount > 0) {
                    const el = document.getElementById('team-b-score');
                    el.style.color = '#2ecc71';
                    setTimeout(() => { el.style.color = ''; }, 300);
                }
            }

            // 得分后切换发球方（得分方获得发球权）
            if (amount > 0) {
                if (team !== server) {
                    server = team;
                }
                // 检查是否赢得本局
                const setWon = checkSetWin();
                // 如果本局结束，winSet中已设置新局发球方，不再切换
                if (setWon) {
                    updateGameInfo();
                    localStorage.setItem('scoreA', scoreA);
                    localStorage.setItem('scoreB', scoreB);
                    return;
                }
            }

            updateGameInfo();
            // Save score to localStorage for offline support
            localStorage.setItem('scoreA', scoreA);
            localStorage.setItem('scoreB', scoreB);
        }
        function checkSetWin() {
            // 羽毛球规则：先得21分且领先2分者胜；20-20后需连赢2分；最高30分封顶
            if (scoreA >= WIN_SCORE && scoreA - scoreB >= 2) {
                winSet('a');
                return true;
            } else if (scoreB >= WIN_SCORE && scoreB - scoreA >= 2) {
                winSet('b');
                return true;
            } else if (scoreA >= MAX_SCORE) {
                // 30-29时下一分获胜（封顶规则）
                winSet('a');
                return true;
            } else if (scoreB >= MAX_SCORE) {
                winSet('b');
                return true;
            }
            return false;
        }
        function winSet(winner) {
            // 正确记录双方得分（无论谁赢，己方得分进setsA，对方进setsB）
            setsA.push(scoreA);
            setsB.push(scoreB);

            // 计算双方胜局数
            const actualWinsA = setsA.reduce((count, sa, i) => sa > setsB[i] ? count + 1 : count, 0);
            const actualWinsB = setsB.reduce((count, sb, i) => sb > setsA[i] ? count + 1 : count, 0);

            if (actualWinsA >= WIN_SETS || actualWinsB >= WIN_SETS) {
                // 整场比赛结束
                gameOver = true;
                const matchWinner = actualWinsA >= WIN_SETS ? '己方' : '对方';
                alert(`🏆 比赛结束！${matchWinner}以 ${actualWinsA} - ${actualWinsB} 赢得比赛！`);
            } else {
                // 开始下一局，胜方获得下一局发球权
                alert(`第 ${currentSet} 局结束！开始第 ${currentSet + 1} 局`);
                currentSet++;
                scoreA = 0;
                scoreB = 0;
                server = winner; // 胜方获得新局发球权
                document.getElementById('team-a-score').textContent = '0';
                document.getElementById('team-b-score').textContent = '0';
            }
        }
        function updateGameInfo() {
            const setDisplay = document.getElementById('set-score-display');
            const statusDisplay = document.getElementById('game-status');

            // 显示各局比分
            let html = '';
            for (let i = 0; i < setsA.length; i++) {
                const winA = setsA[i] > setsB[i];
                const winB = setsB[i] > setsA[i];
                const cls = winA ? 'won-a' : (winB ? 'won-b' : 'ongoing');
                html += `<span class="set-badge ${cls}">第${i+1}局 ${setsA[i]}-${setsB[i]}</span>`;
            }
            // 显示当前局
            if (!gameOver) {
                html += `<span class="set-badge ongoing">第${currentSet}局 ${scoreA}-${scoreB}</span>`;
            }
            setDisplay.innerHTML = html;

            // 显示比赛状态
            if (gameOver) {
                const winsA = setsA.reduce((c, s, i) => s > setsB[i] ? c + 1 : c, 0);
                const winsB = setsB.reduce((c, s, i) => s > setsA[i] ? c + 1 : c, 0);
                statusDisplay.textContent = `比赛结束 - 最终比分 ${winsA} : ${winsB}`;
                statusDisplay.className = 'game-status';
            } else if (scoreA >= 20 && scoreB >= 20) {
                statusDisplay.textContent = '平分(deuce)！需连赢2分';
                statusDisplay.className = 'game-status';
            } else {
                statusDisplay.textContent = `第${currentSet}局进行中`;
                statusDisplay.className = 'game-status';
            }

            // 更新发球方指示器
            updateServerIndicator();
        }
        function updateServerIndicator() {
            const teamAName = document.querySelector('.team-a .team-name');
            const teamBName = document.querySelector('.team-b .team-name');

            // 移除旧指示器
            const oldA = document.getElementById('serve-a');
            const oldB = document.getElementById('serve-b');
            if (oldA) oldA.remove();
            if (oldB) oldB.remove();

            // 添加发球方脉冲指示器
            const indicator = document.createElement('span');
            indicator.className = `serve-indicator serve-${server}`;
            indicator.id = `serve-${server}`;

            if (server === 'a') {
                teamAName.appendChild(indicator);
            } else {
                teamBName.appendChild(indicator);
            }
        }
        function resetScore() {
            scoreA = 0;
            scoreB = 0;
            setsA = [];
            setsB = [];
            currentSet = 1;
            server = 'a';
            gameOver = false;
            document.getElementById('team-a-score').textContent = scoreA;
            document.getElementById('team-b-score').textContent = scoreB;
            document.getElementById('result-form').style.display = 'none';
            document.getElementById('result-card').style.display = 'none';
            document.getElementById('game-status').textContent = '';
            document.getElementById('set-score-display').innerHTML = '';
            // 清除发球方指示器
            const oldA = document.getElementById('serve-a');
            const oldB = document.getElementById('serve-b');
            if (oldA) oldA.remove();
            if (oldB) oldB.remove();
            localStorage.removeItem('scoreA');
            localStorage.removeItem('scoreB');
            resetTimer();
        }
        function showResultForm() {
            // 停止比赛时长计时器
            clearInterval(timerInterval);
            document.getElementById('result-form').style.display = 'block';
            document.getElementById('result-card').style.display = 'none';
        }
        function generateResult() {
            const teamANames = document.getElementById('team-a-names').value;
            const teamBNames = document.getElementById('team-b-names').value;
            if (!teamANames || !teamBNames) {
                alert('请输入双方选手昵称');
                return;
            }
            const playerNames = `${teamANames} vs ${teamBNames}`;

            // 保存比赛结束时的时间和时长
            finalMatchTime = seconds; // 保存比赛时长（秒数）
            finalMatchDate = new Date(); // 保存比赛结束时间

            // Update result card
            document.getElementById('result-title-text').textContent = playerNames;
            document.getElementById('result-score-text').textContent = `${scoreA} - ${scoreB}`;
            document.getElementById('match-date').textContent = finalMatchDate.toLocaleString();

            // Show result card and hide form
            document.getElementById('result-form').style.display = 'none';
            document.getElementById('result-card').style.display = 'block';

            // Save match result to localStorage
            const matchResult = {
                players: playerNames,
                scoreA: scoreA,
                scoreB: scoreB,
                date: new Date().toISOString()
            };
            const matchHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            matchHistory.push(matchResult);
            localStorage.setItem('matchHistory', JSON.stringify(matchHistory));

            // 生成海报
            generatePoster();
        }
        function shareResult() {
            // In a real app, this would use the Web Share API if available
            // For this demo, we'll just copy to clipboard
            const resultText = `${document.getElementById('result-title-text').textContent}\n比分: ${document.getElementById('result-score-text').textContent}\n日期: ${document.getElementById('match-date').textContent}`;

            navigator.clipboard.writeText(resultText).then(function() {
                alert('赛果已复制到剪贴板，可以粘贴分享了！');
            }, function(err) {
                alert('无法复制文本: ', err);
            });
        }
        function generatePoster(includeButtons = true) {
    const canvas = document.getElementById('posterCanvas');
    const overlay = document.getElementById('posterOverlay');
    const ctx = canvas.getContext('2d');
    const teamANames = document.getElementById('team-a-names').value;
    const teamBNames = document.getElementById('team-b-names').value;
    const scoreA = parseInt(document.getElementById('team-a-score').textContent);
    const scoreB = parseInt(document.getElementById('team-b-score').textContent);
    const winner = scoreA > scoreB ? '己方' : '对方';
    const winnerText = '胜方';
    const loserText = '败方';
    const netScore = Math.abs(scoreA - scoreB);

    // 添加背景亮度检测
    function getContrastColor() {
        // 获取背景中心区域像素亮度
        const imageData = ctx.getImageData(canvas.width/2 - 50, canvas.height/2 - 50, 100, 100);
        const data = imageData.data;
        let brightnessSum = 0;
        
        // 采样计算平均亮度
        for(let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            brightnessSum += (0.299*r + 0.587*g + 0.114*b);
        }
        
        const avgBrightness = brightnessSum / (data.length/4);
        return avgBrightness > 128 ? '#222' : '#fff'; // 亮背景用深色，暗背景用白色
    }

    if (!teamANames || !teamBNames) {
        alert('请输入双方选手昵称');
        return;
    }
    // 验证比赛结束数据
    if (typeof finalMatchTime === 'undefined' || !finalMatchDate) {
        alert('请先结束比赛再生成海报');
        return;
    }

    // 使用比赛结束时保存的时长
    const minutes = Math.floor(finalMatchTime / 60);
    const matchTime = `${minutes}:${(finalMatchTime % 60).toString().padStart(2, '0')}`;

    // 设置canvas尺寸（统一宽高比）
        const baseWidth = 600; // 基准宽度
        const baseHeight = 700; // 基准高度
        const aspectRatio = baseWidth / baseHeight;
        
        // 根据屏幕尺寸计算最大可用尺寸
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxWidth = Math.min(baseWidth, screenWidth * 0.9);
        const maxHeight = Math.min(baseHeight, screenHeight * 0.8);
        
        // 根据宽高比确定最终尺寸
        let canvasWidth, canvasHeight;
        if (maxWidth / maxHeight > aspectRatio) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            canvasWidth = maxWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }
        
        const scaleFactor = canvasWidth / baseWidth; // 计算缩放因子
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 添加横屏适配
        function adjustForOrientation() {
            return { scale: scaleFactor, yOffset: 0 };
        }

        const orientationAdjust = adjustForOrientation();

        // 绘制背景（只绘制一次）
            // 使用主界面相同的渐变背景
            // 绘制背景
            if (isBackgroundCached && backgroundCache[currentBackgroundIndex]) {
                // 使用缓存的背景
                ctx.drawImage(backgroundCache[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);
            } else {
                // 直接绘制背景作为备选方案
                backgroundStyles[currentBackgroundIndex](ctx, canvas.width, canvas.height);
            }

            // 添加半透明覆盖层增强文本可读性
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 添加纹理效果
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // 绘制标题（增强版 - 主界面风格）
            const titleGradient = ctx.createLinearGradient(0, 40, canvas.width, 80);
            titleGradient.addColorStop(0, '#3498db');
            titleGradient.addColorStop(1, '#9b59b6');
            
            ctx.font = `bold ${getScaledFontSize(46)}px "Arial Black", "Microsoft YaHei", sans-serif`;
            ctx.fillStyle = titleGradient;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 8 * scaleFactor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4 * scaleFactor;
            ctx.fillText('羽毛球比赛结果', canvas.width / 2, 80 * scaleFactor);
            ctx.shadowBlur = 0; // 重置阴影

            // 绘制比分前添加信息卡片背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.roundRect(canvas.width/2 - 250*scaleFactor, 100*scaleFactor, 500*scaleFactor, 480*scaleFactor, 20);
            ctx.fill();
            // 添加多层次阴影效果
            // ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            // ctx.shadowBlur = 15;
            // ctx.shadowOffsetX = 0;
            // ctx.shadowOffsetY = 8;
            
            // 绘制选手信息 - 添加文本溢出处理
        function getScaledFontSize(baseSize) {
            return Math.max(16, baseSize * scaleFactor); // 确保最小字体大小
        }

        // 绘制选手信息 - 统一字体大小并添加空格对齐
        const textColor = getContrastColor();
        // 胜方文本（添加首尾空格保持长度一致）
        const teamAText = ` ${teamANames} ${scoreA > scoreB ? winnerText : loserText} `;
        // 文本溢出处理
        let teamAFontSize = getScaledFontSize(28 * orientationAdjust.scale);
        ctx.font = `bold ${teamAFontSize}px "Arial Black", "Microsoft YaHei", sans-serif`;
        while (ctx.measureText(teamAText).width > canvas.width * 0.8 && teamAFontSize > 16) {
            teamAFontSize--;
            ctx.font = `bold ${teamAFontSize}px "Arial Black", "Microsoft YaHei", sans-serif`;
        }
        ctx.fillStyle = scoreA > scoreB ? '#e74c3c' : '#3498db';
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.strokeText(teamAText, canvas.width / 2, 150 * scaleFactor);
        ctx.fillText(teamAText, canvas.width / 2, 150 * orientationAdjust.scale + orientationAdjust.yOffset);
            // 败方文本（添加首尾空格保持长度一致）
            ctx.fillStyle = scoreB > scoreA ? '#e74c3c' : '#3498db';
            ctx.strokeText(` ${teamBNames} ${scoreB > scoreA ? winnerText : loserText} `, canvas.width / 2, 220 * scaleFactor);
            ctx.fillText(` ${teamBNames} ${scoreB > scoreA ? winnerText : loserText} `, canvas.width / 2, 220 * orientationAdjust.scale + orientationAdjust.yOffset);
            
            // 重置阴影
            ctx.shadowBlur = 0;

            // 绘制比分（增强版）
            ctx.font = `bold ${getScaledFontSize(90)}px "Arial Black", "Microsoft YaHei", sans-serif`;
            // 使用主界面相同的渐变效果
            const scoreGradient = ctx.createLinearGradient(canvas.width/2 - 100*scaleFactor, 320*scaleFactor, canvas.width/2 + 100*scaleFactor, 320*scaleFactor);
            scoreGradient.addColorStop(0, '#3498db');
            scoreGradient.addColorStop(1, '#e74c3c');
            ctx.fillStyle = scoreGradient;
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 4 * scaleFactor;
            ctx.strokeText(`${scoreA} - ${scoreB}`, canvas.width / 2, 340 * scaleFactor);
            ctx.fillText(`${scoreA} - ${scoreB}`, canvas.width / 2, 340 * orientationAdjust.scale + orientationAdjust.yOffset);
            // 添加发光效果
            ctx.shadowBlur = 0;

            // 绘制关键数据
            ctx.font = `bold ${getScaledFontSize(24)}px "Arial Black", "Microsoft YaHei", sans-serif`;
            ctx.fillStyle = '#333';
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1.5 * scaleFactor;
            ctx.strokeText(`比赛时长: ${matchTime}`, canvas.width / 2, 400 * scaleFactor);
            ctx.fillText(`比赛时长: ${matchTime}`, canvas.width / 2, 400 * orientationAdjust.scale + orientationAdjust.yOffset);
            ctx.strokeText(`净胜分: ${netScore}分`, canvas.width / 2, 440 * scaleFactor);
            ctx.fillText(`净胜分: ${netScore}分`, canvas.width / 2, 440 * orientationAdjust.scale + orientationAdjust.yOffset);
            ctx.strokeText(`胜者: ${winner}`, canvas.width / 2, 480 * scaleFactor);
            ctx.fillText(`胜者: ${winner}`, canvas.width / 2, 480 * orientationAdjust.scale + orientationAdjust.yOffset);

            // 将时间移到胜者信息下方（Y坐标调整为540）
            // 使用比赛结束时保存的时间
            const timeStr = finalMatchDate.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-');
            ctx.save();
            // 清除阴影属性设置
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.font = `bold ${getScaledFontSize(22)}px "Arial Black", "Microsoft YaHei", sans-serif`;
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            ctx.fillText(`比赛时间: ${timeStr}`, canvas.width / 2, 520*scaleFactor);
            ctx.restore();
            
            // 将水印移到时间下方（Y坐标调整为600）
            ctx.save();
            ctx.font = `italic ${getScaledFontSize(20)}px Arial, SimHei`;
            // 创建高对比度渐变
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, 'rgba(100, 149, 237, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 105, 180, 0.8)');
            ctx.fillStyle = gradient;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 调整位置至比赛时间下方25像素
            ctx.fillText('羽毛球极速计分板 | 亍幵', canvas.width / 2, 560*scaleFactor);
            ctx.restore();
            
        
            // 绘制分享引导
        ctx.font = 'italic 22px Arial';
        ctx.fillStyle = '#3498db';

    // 优化按钮点击区域计算
    const buttonWidth = 120 * scaleFactor;
    const buttonHeight = 40 * scaleFactor;
    const buttonY = canvas.height - 60 * orientationAdjust.scale + orientationAdjust.yOffset;
    const buttonPadding = 20 * scaleFactor;
    const totalButtonWidth = (buttonWidth * 3) + (buttonPadding * 2);
    const startX = (canvas.width - totalButtonWidth) / 2;

    // 绘制分享海报按钮（增强版 - 主界面风格）
    if (includeButtons) {
    const shareGradient = ctx.createLinearGradient(startX, buttonY, startX, buttonY + buttonHeight);
    shareGradient.addColorStop(0, '#3498db');
    shareGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = shareGradient;
    // 添加圆角和阴影
    ctx.beginPath();
    ctx.roundRect(startX, buttonY, buttonWidth, buttonHeight, 12);
    ctx.fill();
    // 添加高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(startX, buttonY, buttonWidth, buttonHeight/2, 12);
    ctx.fill();
    // 按钮文字
    ctx.fillStyle = 'white';
    ctx.font = '18px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // ctx.shadowColor = 'rgba(0,0,0,0.2)';
            // ctx.shadowBlur = 3;
            // ctx.shadowOffsetX = 0;
            // ctx.shadowOffsetY = 1;
            ctx.fillText('分享海报', startX + buttonWidth/2, buttonY + buttonHeight/2);
    ctx.shadowBlur = 0;

    // 绘制关闭海报按钮（增强版 - 主界面风格）
    const closeGradient = ctx.createLinearGradient(startX + buttonWidth + buttonPadding, buttonY, startX + buttonWidth + buttonPadding, buttonY + buttonHeight);
    closeGradient.addColorStop(0, '#e74c3c');
    closeGradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = closeGradient;
    ctx.beginPath();
    ctx.roundRect(startX + buttonWidth + buttonPadding, buttonY, buttonWidth, buttonHeight, 12);
    ctx.fill();
    // 添加高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(startX + buttonWidth + buttonPadding, buttonY, buttonWidth, buttonHeight/2, 12);
    ctx.fill();
    // 按钮文字
    ctx.fillStyle = 'white';
    ctx.font = '18px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('关闭海报', startX + buttonWidth + buttonPadding + buttonWidth/2, buttonY + buttonHeight/2);
            ctx.shadowBlur = 0;

    // 绘制切换背景按钮（增强版）
    const bgGradient = ctx.createLinearGradient(startX + buttonWidth*2 + buttonPadding*2, buttonY, startX + buttonWidth*2 + buttonPadding*2, buttonY + buttonHeight);
    bgGradient.addColorStop(0, '#2ecc71');
    bgGradient.addColorStop(1, '#27ae60');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(startX + buttonWidth*2 + buttonPadding*2, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('切换背景', startX + buttonWidth*2 + buttonPadding*2 + buttonWidth/2, buttonY + buttonHeight/2);

    // 存储按钮位置供事件处理使用
    canvas.buttonAreas = {
        share: {x: startX, y: buttonY, width: buttonWidth, height: buttonHeight},
        close: {x: startX + buttonWidth + buttonPadding, y: buttonY, width: buttonWidth, height: buttonHeight},
        changeBg: {x: startX + buttonWidth*2 + buttonPadding*2, y: buttonY, width: buttonWidth, height: buttonHeight}
    };
    }











        


        // 显示海报和遮罩
        overlay.style.display = 'block';
        canvas.style.display = 'block';
        // ==== 新增居中样式 ====
        canvas.style.margin = '0 auto';
        canvas.style.position = 'absolute';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.transformOrigin = 'center center';
        // ======================
        document.getElementById('closePosterBtn').style.display = 'none';
        document.getElementById('sharePosterBtn').style.display = 'none';
            // 添加微信环境检测提示
            if (navigator.userAgent.includes('MicroMessenger')) {
                const wechatTip = document.createElement('div');
                wechatTip.textContent = '微信用户请点击"分享海报"后长按保存';
                wechatTip.style.position = 'fixed';
                wechatTip.style.bottom = '180px';
                wechatTip.style.left = '50%';
                wechatTip.style.transform = 'translateX(-50%)';
                wechatTip.style.color = '#3498db';
                wechatTip.style.fontSize = '14px';
                wechatTip.style.padding = '5px 10px';
                wechatTip.style.backgroundColor = 'rgba(255,255,255,0.8)';
                wechatTip.style.borderRadius = '4px';
                wechatTip.id = 'wechatEnvironmentTip';
                document.body.appendChild(wechatTip);
            }
        }
        function handleButtonHover(e) {
    const canvas = document.getElementById('posterCanvas');
    if (!canvas.buttonAreas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // 检测鼠标是否在按钮区域
    const areas = canvas.buttonAreas;
    let isOverButton = false;
    
    Object.values(areas).forEach(area => {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
            isOverButton = true;
            canvas.style.cursor = 'pointer';
        }
    });
    
    if (!isOverButton) {
        canvas.style.cursor = 'default';
        // 恢复原始按钮样式
        if (canvas.isHovered) {
            generatePoster();
            canvas.isHovered = false;
        }
    }
}
function closePoster() {
            document.getElementById('posterCanvas').style.display = 'none';
            document.getElementById('posterOverlay').style.display = 'none';
            document.getElementById('closePosterBtn').style.display = 'none';
            document.getElementById('sharePosterBtn').style.display = 'none';
        }
        function savePoster() {
    const canvas = document.getElementById('posterCanvas');
    // 1. 保存当前canvas状态（含按钮）
    const originalCanvasData = canvas.toDataURL();
    
    // 2. 生成不带按钮的海报
    generatePoster(false);
    
    // 3. 获取无按钮版本的图片数据
    const shareImageData = canvas.toDataURL('image/png');
    
    // 4. 立即恢复带按钮的原始海报
    generatePoster(true);
    
    // 5. 执行保存逻辑（使用无按钮版本的图片数据）
    const isWechat = navigator.userAgent.includes('MicroMessenger');
    const isQQ = navigator.userAgent.toLowerCase().indexOf('qq/') > -1 || navigator.userAgent.toLowerCase().indexOf('mqqbrowser') > -1;

    if (isQQ) {
        // QQ环境下的保存逻辑
        alert('请长按图片选择"保存图片"到相册');
        // 创建适合QQ的预览模式
        const qqViewer = document.createElement('div');
        qqViewer.style.position = 'fixed';
        qqViewer.style.top = '0';
        qqViewer.style.left = '0';
        qqViewer.style.width = '100%';
        qqViewer.style.height = '100%';
        qqViewer.style.backgroundColor = 'rgba(0,0,0,0.9)';
        qqViewer.style.display = 'flex';
        qqViewer.style.alignItems = 'center';
        qqViewer.style.justifyContent = 'center';
        qqViewer.style.zIndex = '9999';

        const qqImg = document.createElement('img');
        qqImg.src = shareImageData;
        qqImg.style.maxWidth = '90%';
        qqImg.style.maxHeight = '80vh';
        qqImg.style.border = '8px solid white';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.padding = '8px 16px';
        closeBtn.style.backgroundColor = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => qqViewer.remove();

        qqViewer.appendChild(qqImg);
        qqViewer.appendChild(closeBtn);
        document.body.appendChild(qqViewer);
    } else if (isWechat) {
        // 微信环境预览逻辑
        const posterImg = document.createElement('img');
        posterImg.src = shareImageData;
        posterImg.style.maxWidth = '90%';
        posterImg.style.maxHeight = '80vh';
        posterImg.style.border = '8px solid white';
        posterImg.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        posterImg.style.margin = '0 auto';
        
        const wechatContainer = document.createElement('div');
        wechatContainer.style.position = 'fixed';
        wechatContainer.style.top = '0';
        wechatContainer.style.left = '0';
        wechatContainer.style.width = '100%';
        wechatContainer.style.height = '100%';
        wechatContainer.style.backgroundColor = 'rgba(0,0,0,0.85)';
        wechatContainer.style.display = 'flex';
        wechatContainer.style.flexDirection = 'column';
        wechatContainer.style.justifyContent = 'center';
        wechatContainer.style.alignItems = 'center';
        wechatContainer.style.zIndex = '9999';
        wechatContainer.id = 'wechatSaveContainer';
        
        const tipText = document.createElement('div');
        tipText.textContent = '长按图片选择"保存图片"';
        tipText.style.color = 'white';
        tipText.style.fontSize = '18px';
        tipText.style.marginTop = '20px';
        
        const closeBtn = document.createElement('div');
        closeBtn.textContent = '关闭';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.marginTop = '15px';
        closeBtn.style.padding = '8px 20px';
        closeBtn.style.border = '1px solid white';
        closeBtn.style.borderRadius = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => document.body.removeChild(wechatContainer);
        
        wechatContainer.appendChild(posterImg);
        wechatContainer.appendChild(tipText);
        wechatContainer.appendChild(closeBtn);
        document.body.appendChild(wechatContainer);
    } else {
        // 普通浏览器下载逻辑
        const link = document.createElement('a');
        link.download = '比赛海报.png';
        link.href = shareImageData;
        link.click();
        alert('海报已下载，请到下载文件夹查看');
        return;
    }
}
        function handleButtonClick(e) {
            const canvas = document.getElementById('posterCanvas');
            if (!canvas.buttonAreas) return;
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // 使用预计算的按钮区域
            const areas = canvas.buttonAreas;
            if (x >= areas.share.x && x <= areas.share.x + areas.share.width && y >= areas.share.y && y <= areas.share.y + areas.share.height) {
                savePoster();
            } else if (x >= areas.close.x && x <= areas.close.x + areas.close.width && y >= areas.close.y && y <= areas.close.y + areas.close.height) {
                closePoster();
            } else if (x >= areas.changeBg.x && x <= areas.changeBg.x + areas.changeBg.width && y >= areas.changeBg.y && y <= areas.changeBg.y + areas.changeBg.height) {
                requestAnimationFrame(() => {
                    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundStyles.length;
                    generatePoster();
                });
            }
        }
