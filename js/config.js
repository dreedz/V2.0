// ==========================================
// Alpha Strike — config.js : éléments de la page, variables globales, outils
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 1. CONFIGURATION & VARIABLES GLOBALES
// ==========================================
// Le "monde" du jeu (zoomable) : mots, lasers, vaisseau, menus...
const container = document.getElementById('game-world') || document.getElementById('game-container');
// Le cadre extérieur (non zoomé) : c'est lui qui tremble lors des explosions
const gameFrame = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const streakElement = document.getElementById('streak');
const comboMultiplierElement = document.getElementById('combo-multiplier');
const highScoreElement = document.getElementById('high-score');
const playerShip = document.getElementById('player-ship');
const gameOverScreen = document.getElementById('game-over-screen');
const screenTitle = document.getElementById('screen-title');
const screenStats = document.getElementById('screen-stats');
const restartBtn = document.getElementById('restart-btn');
const levelProgressElement = document.getElementById('level-progress');
const comboProgressElement = document.getElementById('combo-progress');
const levelBanner = document.getElementById('level-banner');
const shieldLine = document.getElementById('shield-line');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const pauseScoreElement = document.getElementById('pause-score');
const pauseLevelElement = document.getElementById('pause-level');
const countdownElement = document.getElementById('countdown');
const modeBtn = document.getElementById('mode-btn');
const menuHint = document.getElementById('menu-hint');
const howTo = document.getElementById('how-to');
const virtualKeyboard = document.getElementById('virtual-keyboard');

// Contenu d'origine du menu (pour y revenir depuis la pause)
const initialTitle = screenTitle ? screenTitle.innerHTML : '';
const initialStats = screenStats ? screenStats.innerHTML : '';

let activeWords = [];
let targetedWord = null; 
let lasers = [];
let gameInterval = null;
let spawnTimer = 0;
let score = 0;
let level = 1;
let wordsDestroyedInLevel = 0;
let wordsDestroyedTotal = 0; // mots détruits dans la partie (vérifié par le serveur pour le classement en ligne)
let highScore = 0; // = 1er du Top 3 (voir section 4 BIS)
let isPlaying = false;
let currentCombo = 0;
let scoreMultiplier = 1;
let isPaused = false;
let isCountingDown = false;
let countdownTimer = null;

// 🛡️ Bouclier : 3 vies. Un mot qui touche le bouclier en retire une ; un mot doré en répare une.
const MAX_LIVES = 3;
let lives = MAX_LIVES;

// ⏱️ Temps de jeu en images (60 par seconde, s'arrête pendant la pause) + bonus actifs jusqu'à telle image
let tick = 0;
let slowUntil = 0, freezeUntil = 0, doubleUntil = 0;
const isFrozen = () => tick < freezeUntil;
const isSlowed = () => tick < slowUntil;
const isDoubleLaser = () => tick < doubleUntil;

// 📊 Statistiques de la partie (précision, vitesse, lettres ratées)
let stats = { correct: 0, wrong: 0, errors: {}, ok: {} };
let spawnCount = 0; // nombre de mots apparus (sert au tirage du défi du jour)

// 💾 Lecture / écriture dans la mémoire du navigateur (sans planter si elle est bloquée)
function readStore(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
}

// 📊 Lettres ratées, mémorisées d'une partie à l'autre (pour le mode entraînement)
const LETTER_STATS_KEY = 'typing_shooter_letters';
function loadLetterStats() {
    try {
        const s = JSON.parse(readStore(LETTER_STATS_KEY));
        if (s && s.err && s.ok) return s;
    } catch (e) { /* rien */ }
    return { err: {}, ok: {} };
}
// Taux d'erreur de chaque lettre (0 = jamais ratée, 1 = toujours ratée)
function letterErrorRates() {
    const s = loadLetterStats();
    const rates = {};
    Object.keys(s.err).forEach(l => { rates[l] = s.err[l] / (s.err[l] + (s.ok[l] || 0) + 2); });
    return rates;
}
// Les lettres les plus ratées (pour les conseils du menu)
function weakestLetters(n = 3) {
    const rates = letterErrorRates();
    return Object.keys(rates).filter(l => rates[l] > 0.05).sort((a, b) => rates[b] - rates[a]).slice(0, n);
}
function recordLetter(letter, ok) {
    if (!letter) return;
    const bucket = ok ? stats.ok : stats.errors;
    bucket[letter] = (bucket[letter] || 0) + 1;
}
// Ajoute les lettres de la partie aux statistiques mémorisées
function saveLetterStats() {
    const s = loadLetterStats();
    Object.entries(stats.errors).forEach(([l, n]) => { s.err[l] = (s.err[l] || 0) + n; });
    Object.entries(stats.ok).forEach(([l, n]) => { s.ok[l] = (s.ok[l] || 0) + n; });
    writeStore(LETTER_STATS_KEY, JSON.stringify(s));
}

// 🎲 Générateur aléatoire "à graine" : avec la même graine, il donne toujours les mêmes nombres.
// Utilisé par le défi du jour pour que tout le monde ait les mêmes mots.
function seededRandom(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
// Date du jour en temps universel (la même pour tout le monde), ex. "2026-11-23"
const todayKey = () => new Date().toISOString().slice(0, 10);
const daySeed = () => todayKey().split('-').reduce((acc, n) => acc * 100 + parseInt(n, 10), 0);
// Tirage pour le n-ième mot : identique pour tous les joueurs pendant le défi du jour
const randomForSpawn = () => (gameType === 'defi' ? seededRandom(daySeed() * 7919 + spawnCount * 104729) : Math.random);

// 🎮 Mode de jeu : 'clavier' (PC) ou 'mobile' (clavier virtuel à l'écran)
// Sur un appareil tactile sans souris, on propose le mode mobile par défaut.
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
let gameMode = isTouchDevice ? 'mobile' : 'clavier';
const MOBILE_SPEED_FACTOR = 0.75; // en mode mobile les mots tombent 25 % moins vite
let currentZoom = 1; // réglage "VUE" (voir section 6 QUATER)

// Dimensions de la zone de jeu (plus petite que l'écran en mode mobile, à cause du clavier)
const gameW = () => (container ? container.clientWidth : window.innerWidth);
const gameH = () => (container ? container.clientHeight : window.innerHeight);

if (restartBtn) restartBtn.addEventListener('click', () => { restartBtn.blur(); startGame(gameMode); });
if (modeBtn) modeBtn.addEventListener('click', () => {
    modeBtn.blur();
    startGame(gameMode === 'mobile' ? 'clavier' : 'mobile');
});

// Met à jour les boutons du menu selon le mode choisi
function updateMenuButtons() {
    // Sur téléphone / tablette tactile : toujours le mode mobile, donc pas de bouton pour changer
    // (le clavier virtuel est indispensable, et un clavier physique branché fonctionne aussi dans ce mode)
    if (modeBtn) {
        modeBtn.style.display = isTouchDevice ? 'none' : '';
        modeBtn.innerText = gameMode === 'mobile' ? '⌨ MODE CLAVIER' : '📱 MODE MOBILE';
    }
    if (menuHint) {
        menuHint.innerHTML = gameMode === 'mobile'
            ? 'Mode mobile · clavier affiché à l\'écran'
            : 'Mode clavier · ou appuie sur <span class="keycap">Entrée</span>';
    }
}
updateMenuButtons();

// Touches spéciales : Entrée (lancer / reprendre) et Échap (pause)
window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return; // on est en train d'écrire son nom
    if (e.key === 'Enter') {
        if (!isPlaying) {
            e.preventDefault(); // évite un double lancement si un bouton a le focus
            startGame(gameMode);
        } else if (isPaused) {
            e.preventDefault();
            resumeGame();
        }
    } else if (e.key === 'Escape' && isPlaying) {
        e.preventDefault();
        if (isPaused) resumeGame(); else pauseGame();
    }
});

// Met à jour les barres de progression du HUD (niveau + combo)
function updateHudBars() {
    const settings = getDifficultySettings();
    if (levelProgressElement) {
        const pct = Math.min(100, (wordsDestroyedInLevel / settings.wordsToNextLevel) * 100);
        levelProgressElement.style.width = pct + '%';
    }
    if (comboProgressElement) {
        // Le multiplicateur monte tous les 10 coups réussis, jusqu'à x4 (30 coups)
        const pct = currentCombo >= 30 ? 100 : (currentCombo % 10) * 10;
        comboProgressElement.style.width = pct + '%';
    }
}

// Fait apparaître un texte qui s'envole (points, bonus, combo...)
function showFloatingText(x, y, html, className = '') {
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'float-text ' + className;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerHTML = html;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

// Position d'un élément dans le "monde" du jeu.
// (getBoundingClientRect donne la position à l'écran, déjà réduite par le zoom :
//  on la convertit pour qu'elle corresponde aux coordonnées des mots et des lasers)
function localRect(el) {
    const r = el.getBoundingClientRect();
    const o = container.getBoundingClientRect();
    const left = (r.left - o.left) / currentZoom;
    const top = (r.top - o.top) / currentZoom;
    const width = r.width / currentZoom;
    const height = r.height / currentZoom;
    return { left, top, width, height, right: left + width, bottom: top + height };
}

// Centre d'un élément dans le monde du jeu
function getCenter(element) {
    const r = localRect(element);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Affiche la grosse bannière "NIVEAU X" au centre de l'écran
function showLevelBanner(lvl, boss = false) {
    if (!levelBanner) return;
    levelBanner.innerHTML = boss ? `NIVEAU ${lvl}<div class="banner-boss">⚠️ BOSS EN APPROCHE ⚠️</div>` : `NIVEAU ${lvl}`;
    levelBanner.classList.remove('show');
    void levelBanner.offsetWidth; // relance l'animation
    levelBanner.classList.add('show');
}


function getDifficultySettings() {
    const s = {
        maxWordsOnScreen: Math.min(1 + Math.floor(level / 2), 5),
        spawnDelay: Math.max(180 - (level * 20), 70),
        wordSpeed: 0.6 + (level * 0.15),
        wordsToNextLevel: 5 + (level * 2)
    };
    if (gameType === 'dictee') {       // dictée : 2 mots maximum, plus lents (il faut écouter)
        s.maxWordsOnScreen = Math.min(s.maxWordsOnScreen, 2);
        s.spawnDelay = Math.max(s.spawnDelay, 150);
        s.wordSpeed *= 0.6;
    } else if (gameType === 'entrainement') {
        s.wordSpeed *= 0.85;
    }
    return s;
}

// 🗣️ Voix de synthèse du navigateur (mode dictée) : prononce un mot en français
const canSpeak = 'speechSynthesis' in window;
function speakWord(text) {
    if (!canSpeak) return; // (la dictée parle même si les EFFETS sont coupés : c'est indispensable)
    try {
        const spoken = (ACCENTED_SPELLING[text] || text).toLowerCase();
        const u = new SpeechSynthesisUtterance(spoken);
        u.lang = 'fr-FR';
        u.rate = 0.85;
        const fr = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang));
        if (fr) u.voice = fr;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    } catch (e) { /* voix indisponible */ }
}
