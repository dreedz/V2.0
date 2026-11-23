// ==========================================
// Alpha Strike — game.js : déroulement d'une partie (début, fin, mots, lasers)
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 4. ÉTATS DU JEU & LOGIQUE DES BONUS
// ==========================================
// Retire tous les mots et lasers de l'écran
function clearField() {
    activeWords.forEach(w => { if (w.element && container && container.contains(w.element)) container.removeChild(w.element); });
    lasers.forEach(l => { if (l.element && container && container.contains(l.element)) container.removeChild(l.element); });
    activeWords = [];
    lasers = [];
    targetedWord = null;
}

// Applique (ou retire) la mise en page du mode mobile
function applyLayout(mobile) {
    document.body.classList.toggle('mobile-mode', mobile);
    refreshBackgroundSize(); // le fond s'adapte à la nouvelle taille de la zone de jeu
}

function startGame(mode) {
    if (mode === 'clavier' || mode === 'mobile') gameMode = mode;
    if (isTouchDevice) gameMode = 'mobile'; // sécurité : jamais de mode sans clavier à l'écran sur tactile
    // Si le joueur relance sans valider son nom, on l'enregistre tel qu'il est écrit
    confirmName(false);
    // Le mode mobile (clavier à l'écran) n'a pas les accents : AVANCÉ → SIMPLE (BABY reste possible)
    if (gameMode === 'mobile' && difficulty === 'avance') setDifficulty('simple');
    startOnlineSession(); // 🎫 ticket de partie pour le classement en ligne (anti-triche)
    document.body.dataset.gameType = gameType;
    closeProfile();
    buildVirtualKeyboard(); // (barre ESPACE en mode phrases)
    startRun();             // badges, fantôme du record
    applySector(1);
    updateMenuButtons();
    applyLayout(gameMode === 'mobile');

    clearTimeout(countdownTimer);
    isCountingDown = false;
    isPaused = false;
    isPlaying = true;
    document.body.classList.add('is-playing');
    document.body.classList.remove('is-paused');
    if (pauseScreen) pauseScreen.classList.add('hidden');

    currentCombo = 0;
    scoreMultiplier = 1;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    startMusic();

    clearField();
    activeWords = [];
    lasers = [];
    targetedWord = null;
    score = 0;
    level = 1;
    wordsDestroyedInLevel = 0;
    wordsDestroyedTotal = 0;
    spawnTimer = 0;
    spawnCount = 0;
    tick = 0;
    slowUntil = freezeUntil = 0;
    lives = maxLives();
    stats = { correct: 0, wrong: 0, errors: {}, ok: {} };
    updateLivesHud();
    updatePowerHud();
    // Dictée : la voix de synthèse doit être "réveillée" pendant le clic (obligatoire sur iPhone)
    if (gameType === 'dictee' && canSpeak) {
        try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) { /* rien */ }
    }

    if (scoreElement) scoreElement.innerText = score;
    if (levelElement) levelElement.innerText = level;
    
    const displayElement = comboMultiplierElement || streakElement;
    if (displayElement) {
        displayElement.innerText = "x1";
        displayElement.style.color = "#22d3ee";
    }

    const settings = getDifficultySettings();
    if (streakElement) streakElement.innerText = `0/${settings.wordsToNextLevel}`;
    
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (playerShip) {
        playerShip.style.transform = 'translateX(-50%) rotate(0deg)';
        playerShip.style.left = '50%';
    }

    updateHudBars();
    showLevelBanner(1);
    stopVoice();
    // Débloque le lecteur des voix pendant le clic sur COMMENCER (obligatoire sur iPhone),
    // sinon les voix des niveaux suivants seraient bloquées. Aucun son n'est joué.
    try {
        connectVoiceToMixer();
        const unlockId = ++voiceUnlockId;
        voicePlayer.muted = true;
        voicePlayer.src = voiceFile(2);
        const p = voicePlayer.play();
        const unmute = () => {
            if (unlockId !== voiceUnlockId) return; // une vraie voix a démarré entre-temps : on n'y touche pas
            voicePlayer.pause(); voicePlayer.currentTime = 0; voicePlayer.muted = false;
        };
        if (p && p.then) p.then(unmute, unmute); else unmute();
    } catch (e) { voicePlayer.muted = false; }

    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
}

function triggerGameOver() {
    isPlaying = false;
    isPaused = false;
    clearInterval(gameInterval);
    gameInterval = null;
    document.body.classList.remove('is-playing', 'is-paused');
    applyLayout(false); // le menu reprend tout l'écran
    stopVoice();
    stopMusic();
    playGameOverSound();

    if (canSpeak) { try { speechSynthesis.cancel(); } catch (e) { /* rien */ } }
    saveLetterStats();
    const summary = gameSummary();
    lastGameSummary = summary;

    // Classement : seulement en partie classique (tous les mots) et au défi du jour
    const kind = boardKind();
    let entry = kind === 'classique' ? addToLeaderboard(score, level) : null; // Top 3 de l'appareil
    const newRecord = entry !== null && leaderboard[0] === entry;
    // En ligne, toutes les parties classées sont enregistrées (pour connaître sa place mondiale)
    if (!entry && kind !== 'none' && onlineEnabled() && score > 0) {
        entry = { name: cleanName(readStore(LAST_NAME_KEY)) || 'PILOTE', score: score, level: level };
    }
    if (entry) {
        entry.difficulty = effectiveDifficulty();
        entry.kind = kind;
        entry.words = wordsDestroyedTotal;
        entry.ticket = onlineSession && onlineSession.kind === kind && onlineSession.difficulty === entry.difficulty ? onlineSession : null;
    }
    onlineSession = null; // un ticket = une seule partie
    boardHighlight = entry;
    showRankText('');

    // 🏅 Expérience, badges, série de jours, fantôme du record
    const progress = finishRun(summary);
    refreshModeUi(); // (la série du défi du jour a peut-être augmenté)

    if (screenTitle) screenTitle.innerText = "GAME OVER";
    const weak = summary.weak.length
        ? `<div class="weak-letters">🎯 À travailler : ${summary.weak.map(([l, n]) => `<span class="keycap">${l}</span> <small>×${n}</small>`).join(' ')}</div>`
        : (summary.accuracy === 100 && summary.typed > 10 ? '<div class="weak-letters">✨ Aucune faute, bravo !</div>' : '');
    if (screenStats) screenStats.innerHTML = `
        <div class="stat-grid four">
            <div class="stat"><div class="stat-label">NIVEAU</div><div class="stat-value">${level}</div></div>
            <div class="stat"><div class="stat-label">SCORE</div><div class="stat-value">${score}</div></div>
            <div class="stat"><div class="stat-label">PRÉCISION</div><div class="stat-value">${summary.accuracy}<small>%</small></div></div>
            <div class="stat"><div class="stat-label">MOTS/MIN</div><div class="stat-value">${summary.wpm}</div></div>
        </div>
        ${weak}
        ${newRecord ? '<div class="new-record">★ NOUVEAU RECORD ★</div>' : ''}
        ${progressSummaryHtml(progress)}`;
    renderLeaderboard();
    showNameEntry(entry);
    if (restartBtn) restartBtn.innerText = "REJOUER";
    if (gameOverScreen) {
        gameOverScreen.classList.add('is-game-over');
        gameOverScreen.classList.remove('hidden');
    }
}

function triggerBonusBomb(bonusWord) {
    triggerScreenShake();
    createExplosion(gameW() / 2, gameH() / 2, '#eab308');

    const survivors = activeWords.filter(w => w.type === 'BOSS'); // 👾 le boss résiste à la bombe
    const blasted = activeWords.filter(w => w !== bonusWord && w.type !== 'BOSS').length;
    if (blasted >= 3) unlockBadge('bomb');
    activeWords.forEach(w => {
        if (w === bonusWord || w.type === 'BOSS') return; // le mot bonus est déjà compté par updateGame
        if (w.element) {
            const c = getCenter(w.element);
            createExplosion(c.x, c.y, '#eab308');
            showFloatingText(c.x, c.y, `+${5 * scoreMultiplier}`, 'type-bomb-hit');
        }

        score += 5 * scoreMultiplier;
        wordsDestroyedInLevel++; wordsDestroyedTotal++;
        if (w.element && container && container.contains(w.element)) container.removeChild(w.element);
    });
    
    if (scoreElement) scoreElement.innerText = score;
    activeWords = survivors;
    if (!survivors.includes(targetedWord)) targetedWord = null;
    
    const settings = getDifficultySettings();
    const displayElement = streakElement || comboMultiplierElement;
    if (displayElement) displayElement.innerText = `${wordsDestroyedInLevel}/${settings.wordsToNextLevel}`;
    playBombSound();
}
// ==========================================
// 5. APPARITIONS & LOGIQUE CYCLIQUEMENT MISE À JOUR
// ==========================================
// Les différents types de mots : points, couleur, icône (l'icône aide aussi les daltoniens)
const WORD_TYPES = {
    NORMAL: { points: 10, color: '',        glow: '',        icon: '',   tag: '',               boom: '#38bdf8' },
    RAPIDE: { points: 20, color: '#f87171', glow: '#ef4444', icon: '⚡', tag: 'RAPIDE !',        boom: '#ef4444' },
    BONUS:  { points: 30, color: '#fef08a', glow: '#eab308', icon: '💣', tag: 'BOMBE !',         boom: '#eab308' },
    SLOW:   { points: 15, color: '#67e8f9', glow: '#06b6d4', icon: '⏱️', tag: 'RALENTI !',       boom: '#06b6d4' },
    FREEZE: { points: 15, color: '#bfdbfe', glow: '#60a5fa', icon: '❄️', tag: 'GEL !',           boom: '#93c5fd' },
    BOSS:   { points: 50, color: '#f0abfc', glow: '#d946ef', icon: '👾', tag: 'BOSS VAINCU !',   boom: '#d946ef' }
};
const BOSS_EVERY = 5; // un boss tous les 5 niveaux

// Tire le type d'un mot (r entre 0 et 1)
function pickWordType(r) {
    if (gameType === 'dictee') return r > 0.92 ? 'BONUS' : 'NORMAL'; // dictée : pas de mots rapides
    if (r < 0.67) return 'NORMAL';
    if (r < 0.70) return 'SLOW';
    if (r < 0.73) return 'FREEZE';
    if (r < 0.90) {
        // Pas de mots rapides pour les tout-petits, ni en mode phrases
        return (effectiveDifficulty() === 'baby' || gameType === 'phrases') ? 'NORMAL' : 'RAPIDE';
    }
    return 'BONUS';
}
// Points d'un mot détruit (en mode phrases : selon la longueur de la phrase)
function wordPoints(word) {
    const base = (WORD_TYPES[word.type] || WORD_TYPES.NORMAL).points;
    if (gameType === 'phrases' && word.type !== 'BOSS') return base + 2 * word.text.replace(/ /g, '').length;
    return base;
}
// Longueur maximale des mots aux premiers niveaux
function maxLengthForLevel(lvl) {
    if (gameType === 'phrases') return [0, 12, 15, 18][lvl] || 99;
    return [0, 4, 5, 6][lvl] || 99;
}

// 🎓 Entraînement : les mots qui contiennent les lettres souvent ratées sortent plus souvent
function pickTrainingWord(list, rnd) {
    const rates = letterErrorRates();
    const weights = list.map(w => 1 + 6 * [...new Set(w)].reduce((sum, l) => sum + (rates[l] || 0), 0));
    let r = rnd() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
}

function spawnWord(forceType = null) {
    const settings = getDifficultySettings();
    if (!forceType && activeWords.length >= settings.maxWordsOnScreen) return;
    const rnd = randomForSpawn();
    spawnCount++;

    let filteredList = [];
    const dict = currentWordList();
    if (forceType === 'BOSS') {
        // 👾 Le boss porte un mot très long
        filteredList = dict.filter(word => word.length >= 9);
        if (filteredList.length < 5) filteredList = dict.slice().sort((a, b) => b.length - a.length).slice(0, 15);
    }
    else filteredList = dict.filter(word => word.length <= maxLengthForLevel(level));

    if (filteredList.length === 0) filteredList = dict;

    // 🎯 Jamais deux mots à l'écran qui commencent par la même lettre :
    // la première lettre tapée désigne toujours un seul mot.
    const usedFirstLetters = new Set(activeWords.map(w => w.text[0]));
    filteredList = filteredList.filter(word => !usedFirstLetters.has(word[0]));
    if (filteredList.length === 0) return; // (presque impossible) on réessaiera au prochain tour
    const text = gameType === 'entrainement'
        ? pickTrainingWord(filteredList, rnd)
        : filteredList[Math.floor(rnd() * filteredList.length)];

    const element = document.createElement('div');
    element.className = 'word-container';
    let posX = rnd() * (gameW() * 0.7) + (gameW() * 0.15);
    const wordType = forceType || pickWordType(rnd());
    const info = WORD_TYPES[wordType];
    if (wordType === 'BOSS') { element.classList.add('boss'); posX = gameW() / 2; }
    element.style.left = posX + 'px';
    element.style.top = '0px';
    if (info.glow) element.style.textShadow = `0 0 10px ${info.glow}`;

    // Dictée : l'icône du thème du mot sert d'indice (🐾 animal, 🍕 nourriture...)
    const icon = gameType === 'dictee' && wordType === 'NORMAL' ? themeIcon(themeOfWord(text)) : info.icon;
    let htmlContent = icon ? `<span class="word-icon" aria-hidden="true">${icon}</span>` : '';
    for (let i = 0; i < text.length; i++) {
        const helperClass = (i === 0 && !targetedWord) ? "targetable" : "";
        const extraColor = info.color ? `color: ${info.color};` : '';
        // Dictée : seule la 1re lettre est visible, les autres apparaissent quand on les tape
        const hidden = gameType === 'dictee' && i > 0;
        // Phrases : l'espace est une "lettre" à taper, affichée comme une petite marque
        if (text[i] === ' ') {
            htmlContent += `<span class="letter space-letter" data-i="${i}" style="${extraColor}">·</span>`;
            continue;
        }
        htmlContent += `<span class="letter ${helperClass}" data-i="${i}"${hidden ? ' data-blank="1"' : ''} style="${extraColor}">${hidden ? '' : text[i]}</span>`;
    }
    if (wordType === 'BOSS') htmlContent += '<div class="boss-bar"><div class="boss-fill"></div></div>';
    element.innerHTML = htmlContent;
    if (container) container.appendChild(element);
    if (gameType === 'dictee') speakWord(text);

    // On s'assure que le mot ne dépasse pas sur les bords (important sur téléphone)
    const half = element.offsetWidth / 2;
    const margin = 8;
    posX = half * 2 + margin * 2 > gameW()
        ? gameW() / 2
        : Math.min(Math.max(posX, half + margin), gameW() - half - margin);
    element.style.left = posX + 'px';

    activeWords.push({
        text: text, element: element, posX: posX, posY: 0, typedIndex: 0, validatedIndex: 0, type: wordType,
        hits: new Array(text.length).fill(false), height: element.offsetHeight
    });
}

// Récupère la lettre n°i d'un mot (sans utiliser d'id, qui seraient en double entre plusieurs mots)
function getLetter(word, i) {
    return word.element ? word.element.querySelector(`[data-i="${i}"]`) : null;
}

function createLaser(startX, startY, targetX, targetY, targetWordRef, targetLetterIndex) {
    playLaserSound();
    const laserElement = document.createElement('div');
    laserElement.className = 'laser';
    laserElement.style.left = startX + 'px';
    laserElement.style.top = startY + 'px';
    
    const angle = Math.atan2(targetY - startY, targetX - startX);
    laserElement.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI/2}rad)`;
    if (container) container.appendChild(laserElement);

    const angleDeg = (angle * 180 / Math.PI) + 90;
    if (playerShip) playerShip.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;

    lasers.push({
        element: laserElement, x: startX, y: startY,
        vx: Math.cos(angle) * 35, vy: Math.sin(angle) * 35,
        wordRef: targetWordRef, targetIndex: targetLetterIndex
    });
}

function updateGame() {
    const settings = getDifficultySettings();
    tick++;
    const frozen = isFrozen();
    if (!frozen) {
        spawnTimer++;
        if (spawnTimer >= settings.spawnDelay) { spawnWord(); spawnTimer = 0; }
    }

    // Limite du bouclier : un mot qui touche la ligne fait perdre une vie
    const shieldTop = shieldLine ? shieldLine.offsetTop : gameH() - 80;
    const speedFactor = (gameMode === 'mobile' ? MOBILE_SPEED_FACTOR : 1) * (isSlowed() ? 0.5 : 1) * (frozen ? 0 : 1);

    for (let i = activeWords.length - 1; i >= 0; i--) {
        let w = activeWords[i];
        const typeFactor = w.type === 'RAPIDE' ? 2 : (w.type === 'BOSS' ? 0.35 : 1);
        w.posY += settings.wordSpeed * typeFactor * speedFactor;
        if (w.element) w.element.style.top = w.posY + 'px';
        if (w.posY + w.height > shieldTop) {
            if (shieldHit(w, shieldTop)) return; // plus de vie : partie terminée
        }
    }
    if (tick % 10 === 0) updatePowerHud();
    if (tick % 30 === 0) updateGhost(); // 👻 fantôme du record

    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.x += l.vx; l.y += l.vy;
        if (l.element) { l.element.style.left = l.x + 'px'; l.element.style.top = l.y + 'px'; }

        if (activeWords.includes(l.wordRef)) {
            const targetLetterElement = getLetter(l.wordRef, l.targetIndex);
            if (targetLetterElement) {
                const letterRect = localRect(targetLetterElement);
                if (l.y <= letterRect.bottom && l.y >= letterRect.top - 20) {
                    if (!l.wordRef.hits[l.targetIndex]) {
                        // Les lasers peuvent arriver dans le désordre (angles différents) :
                        // on mémorise l'impact puis on valide toutes les lettres consécutives touchées.
                        l.wordRef.hits[l.targetIndex] = true;
                        const info = WORD_TYPES[l.wordRef.type] || WORD_TYPES.NORMAL;
                        createExplosion(l.x, l.y, info.boom);
                        targetLetterElement.className = 'letter destroyed';
                        playHitSound();
                        while (l.wordRef.validatedIndex < l.wordRef.text.length && l.wordRef.hits[l.wordRef.validatedIndex]) {
                            l.wordRef.validatedIndex++;
                        }
                        const nextLetterElement = getLetter(l.wordRef, l.wordRef.validatedIndex);
                        if (nextLetterElement && !l.wordRef.hits[l.wordRef.validatedIndex]) nextLetterElement.className = 'letter active';
                        // 👾 Barre de vie du boss
                        if (l.wordRef.type === 'BOSS' && l.wordRef.element) {
                            const fill = l.wordRef.element.querySelector('.boss-fill');
                            if (fill) fill.style.width = (100 * (1 - l.wordRef.validatedIndex / l.wordRef.text.length)) + '%';
                        }

                        if (l.wordRef.validatedIndex === l.wordRef.text.length) {
                            const pointsGagnes = wordPoints(l.wordRef);
                            const c = l.wordRef.element ? getCenter(l.wordRef.element) : { x: gameW() / 2, y: gameH() / 2 };
                            if (l.wordRef.type === 'RAPIDE' || l.wordRef.type === 'BOSS') triggerScreenShake();
                            if (l.wordRef.type === 'BOSS') {
                                createExplosion(c.x, c.y, '#d946ef'); createExplosion(c.x, c.y, '#f0abfc');
                                run.bosses++;
                                unlockBadge('boss');
                            }
                            if (l.wordRef.text.includes(' ')) run.phrases++;
                            if (l.wordRef.type === 'BONUS') triggerBonusBomb(l.wordRef);
                            activatePowerUp(l.wordRef.type, c);

                            // ✨ Points qui s'envolent depuis le mot détruit
                            const pts = pointsGagnes * scoreMultiplier;
                            const tag = info.tag ? `<div class="float-tag">${info.tag}</div>` : '';
                            const multi = scoreMultiplier > 1 ? `<span class="float-multi">x${scoreMultiplier}</span>` : '';
                            showFloatingText(c.x, c.y, `${tag}+${pts}${multi}`, 'type-' + l.wordRef.type.toLowerCase());

                            score += pointsGagnes * scoreMultiplier;
                            wordsDestroyedInLevel++; wordsDestroyedTotal++;
                            if (scoreElement) scoreElement.innerText = score;
                            playExplosionSound();
                            
                            if (l.wordRef.element && container && container.contains(l.wordRef.element)) container.removeChild(l.wordRef.element);
                            activeWords = activeWords.filter(item => item !== l.wordRef);
                            if (targetedWord === l.wordRef) targetedWord = null;
                            
                            const displayElement = streakElement || comboMultiplierElement;
                            if (displayElement) displayElement.innerText = `${wordsDestroyedInLevel}/${settings.wordsToNextLevel}`;

                            if (wordsDestroyedInLevel >= settings.wordsToNextLevel) {
                                level++; wordsDestroyedInLevel = 0;
                                if (levelElement) {
                                    levelElement.innerText = level;
                                    levelElement.style.color = '#00ffcc';
                                    setTimeout(() => levelElement.style.color = '#ffffff', 500);
                                }
                                const newSettings = getDifficultySettings();
                                if (streakElement) streakElement.innerText = `0/${newSettings.wordsToNextLevel}`;
                                const bossLevel = level % BOSS_EVERY === 0;
                                showLevelBanner(level, bossLevel);
                                applySector(level); // 🌌 nouveau décor tous les 5 niveaux
                                checkLevelBadges();
                                playLevelUpSound();
                                playLevelVoice(level, 450);
                                if (bossLevel) spawnWord('BOSS'); // 👾 un boss arrive !
                            }
                            refreshTargetableHelpers();
                        }
                    }
                    if (l.element && container && container.contains(l.element)) container.removeChild(l.element); 
                    lasers.splice(i, 1); continue;
                }
            }
        }
        if (l.y < 0 || l.x < 0 || l.x > gameW()) {
            if (l.element && container && container.contains(l.element)) container.removeChild(l.element);
            lasers.splice(i, 1);
        }
    }
    updateHudBars();
}

// ==========================================
// 🛡️ VIES, BONUS ET STATISTIQUES
// ==========================================
const livesElement = document.getElementById('lives');
const powerHudElement = document.getElementById('power-hud');

// Affiche les vies du bouclier (◆ pleine, ◇ perdue) et colore la ligne du bouclier
function updateLivesHud() {
    if (livesElement) {
        livesElement.innerHTML = '';
        for (let i = 0; i < maxLives(); i++) {
            const s = document.createElement('span');
            s.className = 'life' + (i < lives ? ' on' : '');
            livesElement.appendChild(s);
        }
    }
    document.body.dataset.lives = lives;
}

// Un mot touche le bouclier : il explose, on perd une vie. Renvoie true si la partie est finie.
function shieldHit(w, shieldTop) {
    const c = w.element ? getCenter(w.element) : { x: gameW() / 2 };
    createExplosion(c.x, shieldTop, '#f43f5e');
    createExplosion(c.x, shieldTop, '#fb923c');
    if (w.element && container && container.contains(w.element)) container.removeChild(w.element);
    activeWords = activeWords.filter(x => x !== w);
    if (targetedWord === w) targetedWord = null;

    lives--;
    run.livesLost++;
    updateLivesHud();
    triggerScreenShake();
    playErrorSound();
    playExplosionSound();
    if (shieldLine) {
        shieldLine.classList.remove('hit');
        void shieldLine.offsetWidth;
        shieldLine.classList.add('hit');
    }
    // le combo est perdu
    currentCombo = 0; scoreMultiplier = 1;
    const displayElement = comboMultiplierElement || streakElement;
    if (displayElement) { displayElement.innerText = 'x1'; displayElement.style.color = '#64748b'; }

    if (lives <= 0) { triggerGameOver(); return true; }
    showFloatingText(c.x, shieldTop - 40, `🛡️ BOUCLIER ${lives}/${maxLives()}`, 'shield-lost');
    refreshTargetableHelpers();
    return false;
}

// Effet d'un mot spécial détruit
function activatePowerUp(type, c) {
    if (type === 'SLOW')   { slowUntil = tick + 5 * 60;   playComboSound(2); }
    if (type === 'FREEZE') { freezeUntil = tick + 3 * 60; playComboSound(3); }
    if (type === 'BONUS' && lives < maxLives()) {          // 💣 le mot doré répare le bouclier
        lives++;
        updateLivesHud();
        showFloatingText(c.x, c.y - 50, '🛡️ +1', 'shield-repair');
    }
    updatePowerHud();
}

// Bonus actifs affichés sous le HUD (avec les secondes restantes)
function updatePowerHud() {
    const active = [];
    if (isFrozen()) active.push(['❄️', 'GEL', freezeUntil]);
    if (isSlowed()) active.push(['⏱️', 'RALENTI', slowUntil]);
    document.body.classList.toggle('pw-freeze', isFrozen());
    document.body.classList.toggle('pw-slow', isSlowed());
    if (!powerHudElement) return;
    powerHudElement.innerHTML = active
        .map(([icon, name, until]) => `<span class="power-chip">${icon} ${name} ${Math.ceil((until - tick) / 60)}s</span>`)
        .join('');
}

// Résumé de la partie : précision, vitesse (5 lettres = 1 mot, la mesure habituelle), lettres ratées
let lastGameSummary = null;
function gameSummary() {
    const typed = stats.correct + stats.wrong;
    const accuracy = typed ? Math.round(100 * stats.correct / typed) : 100;
    const minutes = tick / 3600;
    const wpm = minutes > 0.05 ? Math.round((stats.correct / 5) / minutes) : 0;
    const weak = Object.entries(stats.errors).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { typed, accuracy, wpm, weak, score, level, gameType, difficulty: effectiveDifficulty() };
}

function refreshTargetableHelpers() {
    if (targetedWord) return; // Ne fait rien si un mot est verrouillé
    activeWords.forEach(w => {
        if (w.typedIndex > 0) return; // mot déjà entamé : on ne touche pas à ses couleurs
        const firstLetter = getLetter(w, 0);
        if(firstLetter && !firstLetter.classList.contains('destroyed')) {
            firstLetter.className = 'letter targetable';
        }
    });
}

