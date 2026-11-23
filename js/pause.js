// ==========================================
// Alpha Strike — pause.js : pause et reprise
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 6 BIS. PAUSE
// ==========================================
function pauseGame() {
    if (!isPlaying || isPaused) return;
    isPaused = true;
    clearInterval(gameInterval);
    gameInterval = null;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend(); // fige musique et sons
    // La voix se met en pause aussi (elle reprendra après le compte à rebours)
    if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; voicePlayer.dataset.pendingLevel = level; }
    else if (!voicePlayer.paused) {
        voicePlayer.pause();
        if (!voicePlayer.muted) voicePlayer.dataset.resume = '1'; // (muet = simple déblocage, rien à reprendre)
    }
    document.body.classList.add('is-paused');
    if (pauseScoreElement) pauseScoreElement.innerText = score;
    if (pauseLevelElement) pauseLevelElement.innerText = level;
    if (pauseScreen) pauseScreen.classList.remove('hidden');
}

// Reprise avec un compte à rebours 3, 2, 1 pour avoir le temps de se replacer
function resumeGame() {
    if (!isPlaying || !isPaused || isCountingDown) return;
    if (pauseScreen) pauseScreen.classList.add('hidden');
    isCountingDown = true;
    let n = 3;

    const tick = () => {
        if (!isPlaying || !isCountingDown) return;
        if (n === 0) {
            if (countdownElement) countdownElement.classList.remove('show');
            isCountingDown = false;
            isPaused = false;
            document.body.classList.remove('is-paused');
            if (audioCtx) audioCtx.resume();
            resumeVoice();
            gameInterval = setInterval(updateGame, 1000 / 60);
            return;
        }
        if (countdownElement) {
            countdownElement.innerText = n;
            countdownElement.classList.remove('show');
            void countdownElement.offsetWidth; // relance l'animation
            countdownElement.classList.add('show');
        }
        n--;
        countdownTimer = setTimeout(tick, 600);
    };
    tick();
}

// Annule un compte à rebours en cours et réaffiche l'écran de pause
function cancelCountdown() {
    if (!isCountingDown) return;
    clearTimeout(countdownTimer);
    isCountingDown = false;
    if (countdownElement) countdownElement.classList.remove('show');
    if (pauseScreen) pauseScreen.classList.remove('hidden');
}

// Abandonne la partie et revient au menu principal
function quitToMenu() {
    clearTimeout(countdownTimer);
    isCountingDown = false;
    isPlaying = false;
    isPaused = false;
    clearInterval(gameInterval);
    gameInterval = null;
    clearVoiceResume();
    stopVoice();
    // Une partie abandonnée ne compte pas dans le Top 3 (seules les parties terminées comptent)
    clearField();

    document.body.classList.remove('is-playing', 'is-paused');
    if (pauseScreen) pauseScreen.classList.add('hidden');
    applyLayout(false);

    if (audioCtx) audioCtx.resume().then(() => stopMusic()).catch(() => {});

    if (screenTitle) screenTitle.innerHTML = initialTitle;
    if (screenStats) screenStats.innerHTML = initialStats;
    if (restartBtn) restartBtn.innerText = 'COMMENCER';
    showNameEntry(null);
    boardHighlight = null;
    showRankText('');
    renderLeaderboard();
    refreshOnline();
    if (gameOverScreen) {
        gameOverScreen.classList.remove('is-game-over');
        gameOverScreen.classList.remove('hidden');
    }
    updateMenuButtons();
}

if (pauseBtn) pauseBtn.addEventListener('click', () => {
    pauseBtn.blur();
    if (isCountingDown) return;
    if (isPaused) resumeGame(); else pauseGame();
});
if (resumeBtn) resumeBtn.addEventListener('click', () => { resumeBtn.blur(); resumeGame(); });
if (quitBtn) quitBtn.addEventListener('click', () => { quitBtn.blur(); quitToMenu(); });

// Pause automatique si on quitte l'onglet / l'application (appel, notification...)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (isCountingDown) cancelCountdown();
    else pauseGame();
});

