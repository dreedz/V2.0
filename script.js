// ==========================================
// 1. CONFIGURATION & VARIABLES GLOBALES
// ==========================================
const container = document.getElementById('game-container');
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

const wordList = [
    "RAT", "COQ", "RENARD", "FOURMI", "CHEVAL", "CHIEN", "GIRAFE", "REQUIN", "SOURIS", "OISEAU",
    "SINGE", "TIGRE", "LION", "OURS", "LAPIN", "MOUTON", "CANARD", "DAUPHIN", "BALEINE", "PANDA",
    "DESERT", "JUNGLE", "FLEUVE", "OCEAN", "NATURE", "ANIMAL", "PLANTE", "FORET", "ESPACE", "PLANETE",
    "ETOILE", "FUSEE", "MOTEUR", "VOLCAN", "MONTAGNE", "CAMPAGNE", "UNIVERS", "GALAXIE", "ASTEROIDE",
    "LIVRE", "COURS", "TEXTE", "CODE", "ROBOT", "CLASSE", "ECOLE", "CAHIER", "CRAYON", "PAPIER",
    "DESSIN", "DICTEE", "REGLE", "BUREAU", "LECON", "CALCUL", "LOGIQUE", "SCIENCE", "HISTOIRE",
    "LECTURE", "ECRITURE", "FENETRE", "TABLEAU", "COMPTEUR", "EXERCICE", "GYMNASE", "JEUNESSE",
    "JEU", "OR", "ROI", "PIRATE", "NAVIRE", "MAGIE", "DRAGON", "DONJON", "MONSTRE", "ZOMBIE",
    "FANTOME", "SORCIER", "TRESOR", "CHATEAU", "CHASSEUR", "BOUSSOLE", "SQUELETTE", "CHEVALIER",
    "LEGENDE", "MYSTERE", "VICTOIRE", "COMBAT", "DEFENSE", "MISSION", "TACTIQUE", "COURAGE",
    "PAIN", "EAU", "REPAS", "POMME", "TABLE", "CHAISE", "PORTE", "AVION", "BALLON", "BATEAU",
    "MONTRE", "PANIER", "VALISE", "JOURNAL", "MAISON", "VOITURE", "GUITARE", "MUSIQUE", "HORLOGE",
    "LAMPE", "VETEMENT", "TELEPHONE", "ORDINATEUR", "VELO", "TRAIN", "CAMION",
    "VOIR", "FAIRE", "DIRE", "LIRE", "JOUER", "TAPER", "PARLER", "MARCHER", "COURIR", "SAUTER",
    "NAGER", "VOLER", "AIMER", "AIDER", "REVER", "ECRIRE", "PENSER", "TROUVER", "GAGNER", "PERDRE",
    "CHOISIR", "GRANDIR", "REUSSIR", "PARTAGER", "COOPERER", "DECOUVRIR", "INVENTER",
    "BON", "BEAU", "FORT", "VITE", "GRAND", "PETIT", "RAPIDE", "SOLIDE", "CALME", "JOYEUX",
    "SOLAIRE", "SPATIAL", "SUPERBE", "VISIBLE", "BRILLANT", "MAGNIFIQUE", "AMUSANT",
    "GENIAL", "AGILE", "HABILE", "BRAVE", "FRANC", "FUTE", "PROPRE"
];

let activeWords = [];
let targetedWord = null; 
let lasers = [];
let gameInterval = null;
let spawnTimer = 0;
let score = 0;
let level = 1;
let wordsDestroyedInLevel = 0;
let highScore = parseInt(localStorage.getItem('typing_shooter_highscore'), 10) || 0;
let isPlaying = false;
let currentCombo = 0;
let scoreMultiplier = 1;
let isPaused = false;
let isCountingDown = false;
let countdownTimer = null;

// 🎮 Mode de jeu : 'clavier' (PC) ou 'mobile' (clavier virtuel à l'écran)
// Sur un appareil tactile sans souris, on propose le mode mobile par défaut.
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
let gameMode = isTouchDevice ? 'mobile' : 'clavier';
const MOBILE_SPEED_FACTOR = 0.75; // en mode mobile les mots tombent 25 % moins vite

// Dimensions de la zone de jeu (plus petite que l'écran en mode mobile, à cause du clavier)
const gameW = () => (container ? container.clientWidth : window.innerWidth);
const gameH = () => (container ? container.clientHeight : window.innerHeight);

if (highScoreElement) highScoreElement.innerText = highScore;
if (restartBtn) restartBtn.addEventListener('click', () => { restartBtn.blur(); startGame(gameMode); });
if (modeBtn) modeBtn.addEventListener('click', () => {
    modeBtn.blur();
    startGame(gameMode === 'mobile' ? 'clavier' : 'mobile');
});

// Met à jour les boutons du menu selon le mode choisi
function updateMenuButtons() {
    if (modeBtn) modeBtn.innerText = gameMode === 'mobile' ? '⌨ MODE CLAVIER' : '📱 MODE MOBILE';
    if (menuHint) {
        menuHint.innerHTML = gameMode === 'mobile'
            ? 'Mode mobile · clavier affiché à l\'écran'
            : 'Mode clavier · ou appuie sur <span class="keycap">Entrée</span>';
    }
}
updateMenuButtons();

// Touches spéciales : Entrée (lancer / reprendre) et Échap (pause)
window.addEventListener('keydown', (e) => {
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

// Centre d'un élément à l'écran
function getCenter(element) {
    const r = element.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Affiche la grosse bannière "NIVEAU X" au centre de l'écran
function showLevelBanner(lvl) {
    if (!levelBanner) return;
    levelBanner.innerText = `NIVEAU ${lvl}`;
    levelBanner.classList.remove('show');
    void levelBanner.offsetWidth; // relance l'animation
    levelBanner.classList.add('show');
}

function getDifficultySettings() {
    return {
        maxWordsOnScreen: Math.min(1 + Math.floor(level / 2), 5), 
        spawnDelay: Math.max(180 - (level * 20), 70),             
        wordSpeed: 0.6 + (level * 0.15),                          
        wordsToNextLevel: 5 + (level * 2)                         
    };
}
// ==========================================
// 2. MOTEUR AUDIO (SYNTHÉTISEUR SPATIAL)
// ==========================================
// Volumes généraux (entre 0 et 1) : à ajuster selon tes goûts
const MUSIC_VOLUME = 0.32;
const SFX_VOLUME = 0.55;

let audioCtx = null;
let masterGain, musicGain, sfxGain;   // bus de volume
let musicBus, musicReverb, sfxReverb, arpDelay; // effets
let noiseBuffer = null;
let musicTimer = null;
let nextStepTime = 0;
let musicStep = 0;

function loadSetting(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1'; }
    catch (e) { return fallback; }
}
function saveSetting(key, value) {
    try { localStorage.setItem(key, value ? '1' : '0'); } catch (e) { /* stockage indisponible */ }
}
let musicEnabled = loadSetting('typing_shooter_music', true);
let sfxEnabled = loadSetting('typing_shooter_sfx', true);

const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12); // numéro de note -> fréquence

// Réverbération "spatiale" générée (bruit qui s'éteint doucement)
function makeImpulse(duration, decay) {
    const len = Math.floor(audioCtx.sampleRate * duration);
    const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
}

function initAudio() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();

    // Compresseur final : évite que les sons saturent quand tout joue en même temps
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.connect(audioCtx.destination);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(comp);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = sfxEnabled ? SFX_VOLUME : 0;
    sfxGain.connect(masterGain);

    // Bus musique + réverbération
    musicBus = audioCtx.createGain();
    musicBus.connect(musicGain);
    const musicConv = audioCtx.createConvolver();
    musicConv.buffer = makeImpulse(3, 2.5);
    musicReverb = audioCtx.createGain();
    musicReverb.gain.value = 0.6;
    musicReverb.connect(musicConv);
    musicConv.connect(musicGain);

    // Écho pour l'arpège
    arpDelay = audioCtx.createDelay(1);
    arpDelay.delayTime.value = 0.42;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.35;
    const fbFilter = audioCtx.createBiquadFilter();
    fbFilter.type = 'lowpass';
    fbFilter.frequency.value = 1800;
    arpDelay.connect(fbFilter);
    fbFilter.connect(feedback);
    feedback.connect(arpDelay);
    arpDelay.connect(musicGain);

    // Réverbération des effets sonores
    const sfxConv = audioCtx.createConvolver();
    sfxConv.buffer = makeImpulse(1.8, 3);
    sfxReverb = audioCtx.createGain();
    sfxReverb.gain.value = 0.5;
    sfxReverb.connect(sfxConv);
    sfxConv.connect(sfxGain);

    // Bruit blanc réutilisable (explosions, charleston)
    noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const nd = noiseBuffer.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
}

// --- Petites briques de synthé ---
// Joue une note avec une enveloppe douce. dest = où envoyer le son.
function tone({ freq, type = 'sine', t, attack = 0.005, dur = 0.2, vol = 0.1, endFreq = null,
                filterFreq = null, dest, reverb = null, reverbAmount = 0, detune = 0 }) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    osc.detune.value = detune;

    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur);

    let node = osc;
    if (filterFreq) {
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = filterFreq;
        osc.connect(f);
        node = f;
    }
    node.connect(g);
    g.connect(dest);
    if (reverb && reverbAmount > 0) {
        const s = audioCtx.createGain();
        s.gain.value = reverbAmount;
        g.connect(s);
        s.connect(reverb);
    }
    osc.start(t);
    osc.stop(t + attack + dur + 0.05);
}

// Joue un souffle de bruit filtré (explosions, charleston)
function noise({ t, dur = 0.3, vol = 0.2, type = 'lowpass', from = 1000, to = 100, dest, reverb = null, reverbAmount = 0 }) {
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = audioCtx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    if (reverb && reverbAmount > 0) {
        const s = audioCtx.createGain();
        s.gain.value = reverbAmount;
        g.connect(s);
        s.connect(reverb);
    }
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
}

// ------------------------------------------
// 🎵 MUSIQUE : ambiance spatiale qui s'enrichit avec les niveaux
//   Niveau 1 : nappes + basse douce
//   Niveau 2 : + arpège cristallin avec écho
//   Niveau 3 : + charleston léger
//   Niveau 4 : + grosse caisse douce
//   Le tempo accélère un peu à chaque niveau.
// ------------------------------------------
const progression = [
    { pad: [57, 60, 64], bass: 45 }, // La mineur
    { pad: [53, 57, 60], bass: 41 }, // Fa majeur
    { pad: [55, 60, 64], bass: 48 }, // Do majeur
    { pad: [55, 59, 62], bass: 43 }  // Sol majeur
];
const arpPattern = [0, 1, 2, 1, 0, 2, 1, 2];

function currentChord() {
    return progression[Math.floor(musicStep / 16) % progression.length];
}

function getStepDuration() {
    const bpm = 92 + Math.min(level - 1, 8) * 3;
    return 60 / bpm / 4; // une double-croche
}

function playMusicStep(step, t) {
    const chord = progression[Math.floor(step / 16)];
    const s = step % 16;
    const stepDur = getStepDuration();

    // Nappe d'accord (début de chaque mesure)
    if (s === 0) {
        chord.pad.forEach(n => {
            [-8, 8].forEach(det => tone({
                freq: mtof(n), type: 'sawtooth', t, attack: 0.8, dur: stepDur * 16 + 0.3, vol: 0.022,
                filterFreq: 900, detune: det, dest: musicBus, reverb: musicReverb, reverbAmount: 0.8
            }));
        });
    }

    // Basse ronde
    if (s === 0 || s === 8 || s === 11) {
        tone({ freq: mtof(chord.bass), type: 'triangle', t, attack: 0.01, dur: stepDur * (s === 11 ? 4 : 6),
               vol: 0.16, filterFreq: 500, dest: musicBus });
    }

    // Arpège (à partir du niveau 2)
    if (level >= 2 && s % 2 === 0) {
        const note = chord.pad[arpPattern[s / 2]] + 12;
        tone({ freq: mtof(note), type: 'triangle', t, attack: 0.005, dur: 0.22, vol: 0.05,
               filterFreq: 2500, dest: musicBus, reverb: arpDelay, reverbAmount: 0.6 });
    }

    // Charleston (à partir du niveau 3)
    if (level >= 3 && s % 4 === 2) {
        noise({ t, dur: 0.05, vol: 0.05, type: 'highpass', from: 8000, to: 6000, dest: musicBus });
    }
    if (level >= 6 && s % 2 === 1) {
        noise({ t, dur: 0.03, vol: 0.02, type: 'highpass', from: 9000, to: 7000, dest: musicBus });
    }

    // Grosse caisse douce (à partir du niveau 4)
    if (level >= 4 && (s === 0 || s === 8)) {
        tone({ freq: 110, endFreq: 42, type: 'sine', t, attack: 0.003, dur: 0.28, vol: 0.32, dest: musicBus });
    }
}

function scheduleMusic() {
    // On programme les notes un peu à l'avance pour un rythme parfaitement régulier
    while (nextStepTime < audioCtx.currentTime + 0.15) {
        playMusicStep(musicStep, nextStepTime);
        nextStepTime += getStepDuration();
        musicStep = (musicStep + 1) % (progression.length * 16);
    }
}

function startMusic() {
    initAudio();
    if (!audioCtx) return;
    if (musicTimer) clearInterval(musicTimer);
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(musicEnabled ? MUSIC_VOLUME : 0, now + 1.5); // fondu d'entrée
    musicStep = 0;
    nextStepTime = now + 0.1;
    musicTimer = setInterval(scheduleMusic, 25);
}

function stopMusic() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0, now + 1.5); // fondu de sortie
    setTimeout(() => {
        if (!isPlaying && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }, 1600);
}

// ------------------------------------------
// 🔊 EFFETS SONORES
// ------------------------------------------
function sfxReady() { return audioCtx && sfxEnabled; }

function playLaserSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    // Le tir monte légèrement dans les aigus quand le combo grimpe
    const base = 900 + Math.min(currentCombo, 30) * 12;
    const f = base * (0.96 + Math.random() * 0.08);
    tone({ freq: f, endFreq: f * 0.35, type: 'triangle', t, dur: 0.09, vol: 0.07, dest: sfxGain });
    tone({ freq: f * 2, endFreq: f * 0.7, type: 'sine', t, dur: 0.05, vol: 0.025, dest: sfxGain });
}

function playHitSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    tone({ freq: 1600, endFreq: 800, type: 'sine', t, dur: 0.05, vol: 0.04, dest: sfxGain });
}

function playExplosionSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    noise({ t, dur: 0.35, vol: 0.22, from: 1400, to: 120, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.4 });
    tone({ freq: 95, endFreq: 40, type: 'sine', t, attack: 0.003, dur: 0.22, vol: 0.28, dest: sfxGain });
    // Petite note cristalline accordée avec la musique
    const chord = currentChord();
    const note = chord.pad[Math.floor(Math.random() * chord.pad.length)] + 24;
    tone({ freq: mtof(note), type: 'sine', t: t + 0.02, dur: 0.5, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.8 });
}

function playBombSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    noise({ t, dur: 1.2, vol: 0.45, from: 2500, to: 50, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.7 });
    tone({ freq: 70, endFreq: 25, type: 'sine', t, attack: 0.005, dur: 0.9, vol: 0.5, dest: sfxGain });
    tone({ freq: 1200, endFreq: 150, type: 'triangle', t, dur: 0.5, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

function playLevelUpSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    [72, 76, 79, 84].forEach((n, i) => {
        tone({ freq: mtof(n), type: 'triangle', t: t + i * 0.08, dur: 0.35, vol: 0.09,
               dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.7 });
    });
    tone({ freq: mtof(88), type: 'sine', t: t + 0.32, dur: 0.8, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.9 });
}

function playComboSound(mult) {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    const base = 76 + mult * 2;
    tone({ freq: mtof(base), type: 'sine', t, dur: 0.15, vol: 0.08, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
    tone({ freq: mtof(base + 7), type: 'sine', t: t + 0.07, dur: 0.3, vol: 0.08, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

function playErrorSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    tone({ freq: 140, endFreq: 100, type: 'square', t, dur: 0.1, vol: 0.035, filterFreq: 700, dest: sfxGain });
}

function playGameOverSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    [64, 60, 57, 52].forEach((n, i) => {
        tone({ freq: mtof(n), type: 'triangle', t: t + i * 0.22, attack: 0.02, dur: 0.6, vol: 0.09,
               filterFreq: 1500, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.8 });
    });
    noise({ t, dur: 1.5, vol: 0.2, from: 900, to: 40, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

// ------------------------------------------
// 🎚️ BOUTONS MUSIQUE / EFFETS
// ------------------------------------------
const musicBtn = document.getElementById('music-btn');
const sfxBtn = document.getElementById('sfx-btn');

function refreshSoundButtons() {
    if (musicBtn) musicBtn.classList.toggle('off', !musicEnabled);
    if (sfxBtn) sfxBtn.classList.toggle('off', !sfxEnabled);
}

if (musicBtn) musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    saveSetting('typing_shooter_music', musicEnabled);
    if (audioCtx && isPlaying) {
        musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
        musicGain.gain.setTargetAtTime(musicEnabled ? MUSIC_VOLUME : 0, audioCtx.currentTime, 0.15);
    }
    refreshSoundButtons();
    musicBtn.blur(); // évite que Espace/Entrée réactivent le bouton pendant la partie
});

if (sfxBtn) sfxBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    saveSetting('typing_shooter_sfx', sfxEnabled);
    if (audioCtx) sfxGain.gain.setTargetAtTime(sfxEnabled ? SFX_VOLUME : 0, audioCtx.currentTime, 0.05);
    refreshSoundButtons();
    sfxBtn.blur();
});

refreshSoundButtons();
// ==========================================
// 3. EFFETS VISUELS (JUICE)
// ==========================================
function triggerScreenShake() {
    if (!container) return;
    container.classList.remove('shake-active');
    void container.offsetWidth; 
    container.classList.add('shake-active');
    setTimeout(() => { container.classList.remove('shake-active'); }, 200);
}

function createExplosion(x, y, color = '#f43f5e') {
    if (!container) return;
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 8px ${color}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 20;
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        particle.style.setProperty('--mx', `${moveX}px`);
        particle.style.setProperty('--my', `${moveY}px`);
        container.appendChild(particle);

        setTimeout(() => {
            if (particle && container.contains(particle)) container.removeChild(particle);
        }, 400);
    }
}
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

// Enregistre le record si besoin. Renvoie true si c'est un nouveau record.
function saveHighScore() {
    if (score <= highScore) return false;
    highScore = score;
    try { localStorage.setItem('typing_shooter_highscore', highScore); } catch (e) { /* stockage indisponible */ }
    if (highScoreElement) highScoreElement.innerText = highScore;
    return true;
}

function startGame(mode) {
    if (mode === 'clavier' || mode === 'mobile') gameMode = mode;
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
    spawnTimer = 0;

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
    stopMusic();
    playGameOverSound();

    const newRecord = saveHighScore();

    if (screenTitle) screenTitle.innerText = "GAME OVER";
    if (screenStats) screenStats.innerHTML = `
        <div class="stat-grid">
            <div class="stat"><div class="stat-label">NIVEAU</div><div class="stat-value">${level}</div></div>
            <div class="stat"><div class="stat-label">SCORE</div><div class="stat-value">${score}</div></div>
            <div class="stat"><div class="stat-label">RECORD</div><div class="stat-value">${highScore}</div></div>
        </div>
        ${newRecord ? '<div class="new-record">★ NOUVEAU RECORD ★</div>' : ''}`;
    if (restartBtn) restartBtn.innerText = "REJOUER";
    if (gameOverScreen) {
        gameOverScreen.classList.add('is-game-over');
        gameOverScreen.classList.remove('hidden');
    }
}

function triggerBonusBomb(bonusWord) {
    triggerScreenShake();
    createExplosion(gameW() / 2, gameH() / 2, '#eab308');

    activeWords.forEach(w => {
        if (w === bonusWord) return; // le mot bonus est déjà compté par updateGame
        if (w.element) {
            const c = getCenter(w.element);
            createExplosion(c.x, c.y, '#eab308');
            showFloatingText(c.x, c.y, `+${5 * scoreMultiplier}`, 'type-bomb-hit');
        }

        score += 5 * scoreMultiplier;
        wordsDestroyedInLevel++;
        if (w.element && container && container.contains(w.element)) container.removeChild(w.element);
    });
    
    if (scoreElement) scoreElement.innerText = score;
    activeWords = [];
    targetedWord = null;
    
    const settings = getDifficultySettings();
    const displayElement = streakElement || comboMultiplierElement;
    if (displayElement) displayElement.innerText = `${wordsDestroyedInLevel}/${settings.wordsToNextLevel}`;
    playBombSound();
}
// ==========================================
// 5. APPARITIONS & LOGIQUE CYCLIQUEMENT MISE À JOUR
// ==========================================
function spawnWord() {
    const settings = getDifficultySettings();
    if (activeWords.length >= settings.maxWordsOnScreen) return;

    let filteredList = [];
    if (level === 1) filteredList = wordList.filter(word => word.length <= 4);
    else if (level === 2) filteredList = wordList.filter(word => word.length <= 5);
    else if (level === 3) filteredList = wordList.filter(word => word.length <= 6);
    else filteredList = wordList;

    if (filteredList.length === 0) filteredList = wordList;
    const text = filteredList[Math.floor(Math.random() * filteredList.length)];
    
    const element = document.createElement('div');
    element.className = 'word-container';
    let posX = Math.random() * (gameW() * 0.7) + (gameW() * 0.15);
    element.style.left = posX + 'px';
    element.style.top = '0px';
    
    let wordType = 'NORMAL';
    const rand = Math.random();
    if (rand > 0.7 && rand <= 0.9) {
        wordType = 'RAPIDE';
        element.style.textShadow = '0 0 10px #ef4444';
    } else if (rand > 0.9) {
        wordType = 'BONUS';
        element.style.textShadow = '0 0 10px #eab308';
    }
    
    let htmlContent = "";
    for (let i = 0; i < text.length; i++) {
        const helperClass = (i === 0 && !targetedWord) ? "targetable" : "";
        let extraColor = '';
        if (wordType === 'RAPIDE') extraColor = 'color: #f87171;';
        if (wordType === 'BONUS') extraColor = 'color: #fef08a;';
        htmlContent += `<span class="letter ${helperClass}" data-i="${i}" style="${extraColor}">${text[i]}</span>`;
    }
    element.innerHTML = htmlContent;
    if (container) container.appendChild(element);

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
    spawnTimer++;
    if (spawnTimer >= settings.spawnDelay) { spawnWord(); spawnTimer = 0; }

    // Limite du bouclier : c'est perdu quand le bas d'un mot touche la ligne
    const shieldTop = shieldLine ? shieldLine.offsetTop : gameH() - 80;
    const speedFactor = gameMode === 'mobile' ? MOBILE_SPEED_FACTOR : 1;

    for (let i = activeWords.length - 1; i >= 0; i--) {
        let w = activeWords[i];
        const currentSpeed = (w.type === 'RAPIDE' ? settings.wordSpeed * 2 : settings.wordSpeed) * speedFactor;
        w.posY += currentSpeed;
        if (w.element) w.element.style.top = w.posY + 'px';
        if (w.posY + w.height > shieldTop) { triggerGameOver(); return; }
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.x += l.vx; l.y += l.vy;
        if (l.element) { l.element.style.left = l.x + 'px'; l.element.style.top = l.y + 'px'; }

        if (activeWords.includes(l.wordRef)) {
            const targetLetterElement = getLetter(l.wordRef, l.targetIndex);
            if (targetLetterElement) {
                const letterRect = targetLetterElement.getBoundingClientRect();
                if (l.y <= letterRect.bottom && l.y >= letterRect.top - 20) {
                    if (!l.wordRef.hits[l.targetIndex]) {
                        // Les lasers peuvent arriver dans le désordre (angles différents) :
                        // on mémorise l'impact puis on valide toutes les lettres consécutives touchées.
                        l.wordRef.hits[l.targetIndex] = true;
                        createExplosion(l.x, l.y, l.wordRef.type === 'BONUS' ? '#eab308' : '#38bdf8');
                        targetLetterElement.className = 'letter destroyed';
                        playHitSound();
                        while (l.wordRef.validatedIndex < l.wordRef.text.length && l.wordRef.hits[l.wordRef.validatedIndex]) {
                            l.wordRef.validatedIndex++;
                        }
                        const nextLetterElement = getLetter(l.wordRef, l.wordRef.validatedIndex);
                        if (nextLetterElement && !l.wordRef.hits[l.wordRef.validatedIndex]) nextLetterElement.className = 'letter active';

                        if (l.wordRef.validatedIndex === l.wordRef.text.length) {
                            let pointsGagnes = 10;
                            if (l.wordRef.type === 'RAPIDE') { pointsGagnes = 20; triggerScreenShake(); }
                            else if (l.wordRef.type === 'BONUS') { pointsGagnes = 30; triggerBonusBomb(l.wordRef); }
                            
                            // ✨ Points qui s'envolent depuis le mot détruit
                            if (l.wordRef.element) {
                                const c = getCenter(l.wordRef.element);
                                const pts = pointsGagnes * scoreMultiplier;
                                let tag = '';
                                if (l.wordRef.type === 'RAPIDE') tag = '<div class="float-tag">RAPIDE !</div>';
                                else if (l.wordRef.type === 'BONUS') tag = '<div class="float-tag">BOMBE !</div>';
                                const multi = scoreMultiplier > 1 ? `<span class="float-multi">x${scoreMultiplier}</span>` : '';
                                showFloatingText(c.x, c.y, `${tag}+${pts}${multi}`, 'type-' + l.wordRef.type.toLowerCase());
                            }

                            score += pointsGagnes * scoreMultiplier;
                            wordsDestroyedInLevel++;
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
                                showLevelBanner(level);
                                playLevelUpSound();
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

// ==========================================
// 6. ÉVÉNEMENTS CLAVIER (CIBLAGE SANS CONFLIT DE LETTRES)
// ==========================================
// Clavier physique
window.addEventListener('keydown', (e) => {
    if (!isPlaying || isPaused || e.key.length !== 1) return;
    handleLetter(e.key.toUpperCase());
});

// Traite une lettre tapée (clavier physique OU clavier virtuel).
// Renvoie true si la lettre était correcte.
function handleLetter(keyPressed) {
    if (!isPlaying || isPaused || !playerShip) return false;
    const shipRect = playerShip.getBoundingClientRect();
    const shipX = shipRect.left + shipRect.width / 2; 
    const shipY = shipRect.top + shipRect.height / 2;
    let toucheCorrecte = false;

    if (targetedWord) {
        // --- CAS 1 : UN MOT EST DÉJÀ STRICTEMENT VERROUILLÉ ---
        const expectedLetter = targetedWord.text[targetedWord.typedIndex];
        if (keyPressed === expectedLetter) {
            toucheCorrecte = true;
            const letterElement = getLetter(targetedWord, targetedWord.typedIndex);
            if (letterElement) {
                letterElement.className = 'letter active';
                const letterRect = letterElement.getBoundingClientRect();
                createLaser(shipX, shipY, letterRect.left + letterRect.width / 2, letterRect.top + letterRect.height / 2, targetedWord, targetedWord.typedIndex);
            }
            targetedWord.typedIndex++;

            if (targetedWord.typedIndex === targetedWord.text.length) {
                targetedWord = null;
            }
        }
    } else {
        // --- CAS 2 : CHOIX LIBRE (AVEC GESTION DES DOUBLONS DE LETTRES) ---
        // Étape 1 : On cherche en priorité si on avait déjà commencé un mot qui attend CETTE lettre exacte
        for (let w of activeWords) {
            if (w.typedIndex > 0 && w.text[w.typedIndex] === keyPressed) {
                toucheCorrecte = true;
                targetedWord = w; // On reverrouille ce mot en cours
                break;
            }
        }

        // Étape 2 : Si aucun mot en cours ne correspond, on cherche un NOUVEAU mot qui commence par cette lettre
        if (!toucheCorrecte) {
            for (let w of activeWords) {
                if (w.typedIndex === 0 && w.text[0] === keyPressed) {
                    toucheCorrecte = true;
                    targetedWord = w; // On verrouille ce nouveau mot
                    break;
                }
            }
        }

        // Étape 3 : Si on a trouvé le bon mot (nouveau ou en cours), on applique les effets et le tir
        if (toucheCorrecte && targetedWord) {
            // Nettoyage visuel des indices d'aide des autres mots
            activeWords.forEach(word => { 
                if (word !== targetedWord) { 
                    const currentLetter = getLetter(word, word.typedIndex);
                    if (currentLetter) currentLetter.className = 'letter'; 
                } 
            });

            // On récupère la lettre qu'on vient de taper (à son indice actuel)
            const currentIndex = targetedWord.typedIndex;
            const letterElement = getLetter(targetedWord, currentIndex);
            if (letterElement) {
                letterElement.className = 'letter active';
                const letterRect = letterElement.getBoundingClientRect();
                createLaser(shipX, shipY, letterRect.left + letterRect.width / 2, letterRect.top + letterRect.height / 2, targetedWord, currentIndex);
            }
            targetedWord.typedIndex++;

            // Si le mot est fini dès la première lettre (mots de 1 lettre)
            if (targetedWord.typedIndex === targetedWord.text.length) {
                targetedWord = null;
            }
        }
    }

    // --- GESTION DU MULTIPLICATEUR DE COMBO ---
    const previousMultiplier = scoreMultiplier;
    const previousCombo = currentCombo;

    if (toucheCorrecte) {
        currentCombo++;
        if (currentCombo >= 30) scoreMultiplier = 4;
        else if (currentCombo >= 20) scoreMultiplier = 3;
        else if (currentCombo >= 10) scoreMultiplier = 2;
        else scoreMultiplier = 1;
        
        const displayElement = comboMultiplierElement || streakElement;
        if (displayElement) {
            displayElement.innerText = `x${scoreMultiplier}`;
            if (scoreMultiplier === 4) displayElement.style.color = "#f43f5e";
            else if (scoreMultiplier === 3) displayElement.style.color = "#eab308";
            else if (scoreMultiplier === 2) displayElement.style.color = "#a855f7";
            else displayElement.style.color = "#22d3ee";
        }
        // 🔥 Le multiplicateur vient de monter
        if (scoreMultiplier > previousMultiplier) {
            showFloatingText(shipX, shipY - 90, `COMBO x${scoreMultiplier} !`, `combo-up combo-x${scoreMultiplier}`);
            playComboSound(scoreMultiplier);
        }
    } else {
        // 💔 Combo cassé (seulement si on avait un vrai combo en cours)
        if (previousCombo >= 10) showFloatingText(shipX, shipY - 90, 'COMBO PERDU', 'combo-lost');
        playErrorSound();
        currentCombo = 0; scoreMultiplier = 1;
        const displayElement = comboMultiplierElement || streakElement;
        if (displayElement) { displayElement.innerText = "x1"; displayElement.style.color = "#64748b"; }
    }
    updateHudBars();
    return toucheCorrecte;
}

// ==========================================
// 6 BIS. PAUSE
// ==========================================
function pauseGame() {
    if (!isPlaying || isPaused) return;
    isPaused = true;
    clearInterval(gameInterval);
    gameInterval = null;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend(); // fige musique et sons
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
    saveHighScore();
    clearField();

    document.body.classList.remove('is-playing', 'is-paused');
    if (pauseScreen) pauseScreen.classList.add('hidden');
    applyLayout(false);

    if (audioCtx) audioCtx.resume().then(() => stopMusic()).catch(() => {});

    if (screenTitle) screenTitle.innerHTML = initialTitle;
    if (screenStats) screenStats.innerHTML = initialStats;
    if (restartBtn) restartBtn.innerText = 'COMMENCER';
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

// ==========================================
// 6 TER. CLAVIER VIRTUEL (MODE MOBILE)
// ==========================================
const KEYBOARD_ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN']; // disposition AZERTY

function buildVirtualKeyboard() {
    if (!virtualKeyboard) return;
    virtualKeyboard.innerHTML = '';
    KEYBOARD_ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'vk-row';
        for (const letter of row) {
            const key = document.createElement('button');
            key.className = 'vk-key';
            key.type = 'button';
            key.dataset.key = letter;
            key.innerText = letter;
            rowEl.appendChild(key);
        }
        virtualKeyboard.appendChild(rowEl);
    });
}

function flashKey(key, className) {
    key.classList.remove('ok', 'ko');
    key.classList.add('pressed', className);
    clearTimeout(key._timer);
    key._timer = setTimeout(() => key.classList.remove('pressed', 'ok', 'ko'), 130);
}

if (virtualKeyboard) {
    buildVirtualKeyboard();
    // "pointerdown" réagit dès que le doigt touche l'écran (plus rapide qu'un clic)
    virtualKeyboard.addEventListener('pointerdown', (e) => {
        const key = e.target.closest('.vk-key');
        if (!key) return;
        e.preventDefault();
        if (!isPlaying || isPaused) return;
        const correct = handleLetter(key.dataset.key);
        flashKey(key, correct ? 'ok' : 'ko');
        if (navigator.vibrate) navigator.vibrate(correct ? 8 : 30); // petite vibration (Android)
    });
    // Empêche le menu "copier / sélectionner" lors d'un appui long
    virtualKeyboard.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Téléphone tourné à l'horizontale en mode mobile : on met en pause automatiquement
const landscapePhoneQuery = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
function checkOrientation() {
    if (gameMode === 'mobile' && isPlaying && landscapePhoneQuery.matches) {
        if (isCountingDown) cancelCountdown();
        else pauseGame();
    }
}
window.addEventListener('resize', checkOrientation);

// ==========================================
// 7. FOND SPATIAL ANIMÉ (ÉTOILES, PLANÈTES, ASTÉROÏDES)
// ==========================================
const bgCanvas = document.getElementById('space-bg');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
let bgW = 0, bgH = 0;
let stars = [], planets = [], asteroids = [], shootingStars = [];
let bgLastTime = performance.now();
let warpSpeed = 0.5; // vitesse de défilement (accélère avec le niveau)

const rand = (min, max) => Math.random() * (max - min) + min;

function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function resizeBackground() {
    const dpr = window.devicePixelRatio || 1;
    bgW = gameW();
    bgH = gameH();
    bgCanvas.width = bgW * dpr;
    bgCanvas.height = bgH * dpr;
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// --- ÉTOILES : 3 couches de profondeur (effet parallaxe) ---
function createStars() {
    stars = [];
    const count = Math.floor((bgW * bgH) / 3500);
    const colors = ['#ffffff', '#ffffff', '#cfe8ff', '#ffe9c4', '#c7d2fe'];
    for (let i = 0; i < count; i++) {
        const r = Math.random();
        const layer = r < 0.6 ? 0 : r < 0.9 ? 1 : 2; // loin, moyen, proche
        stars.push({
            x: Math.random() * bgW,
            y: Math.random() * bgH,
            layer: layer,
            size: [0.7, 1.3, 2.1][layer] * rand(0.7, 1.3),
            speed: [0.15, 0.4, 0.9][layer],
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: rand(0.01, 0.05),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// --- PLANÈTES : pré-dessinées une seule fois dans un canvas caché (performance) ---
function renderPlanet(p) {
    const r = p.r;
    const pad = p.ring ? r * 1.4 : r * 0.45;
    const size = Math.ceil((r + pad) * 2);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Halo d'atmosphère
    const halo = g.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.4);
    halo.addColorStop(0, hexToRgba(p.glow, 0.35));
    halo.addColorStop(1, hexToRgba(p.glow, 0));
    g.fillStyle = halo;
    g.beginPath(); g.arc(cx, cy, r * 1.4, 0, Math.PI * 2); g.fill();

    // Anneau (moitié arrière, cachée ensuite par la planète)
    const drawRing = (start, end) => {
        g.save();
        g.translate(cx, cy);
        g.rotate(p.tilt);
        [[2.15, 0.16, 0.45], [1.8, 0.1, 0.6], [1.55, 0.05, 0.35]].forEach(([rx, lw, a]) => {
            g.beginPath();
            g.ellipse(0, 0, r * rx, r * rx * 0.25, 0, start, end);
            g.strokeStyle = hexToRgba(p.ringColor, a);
            g.lineWidth = r * lw;
            g.stroke();
        });
        g.restore();
    };
    if (p.ring) drawRing(Math.PI, Math.PI * 2);

    // Corps de la planète
    g.save();
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
    const body = g.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
    body.addColorStop(0, p.colors[0]);
    body.addColorStop(0.55, p.colors[1]);
    body.addColorStop(1, p.colors[2]);
    g.fillStyle = body;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Bandes nuageuses (géante gazeuse)
    if (p.bands) {
        g.save();
        g.translate(cx, cy); g.rotate(p.tilt); g.translate(-cx, -cy);
        for (let k = 0; k < 9; k++) {
            const light = Math.random() < 0.5;
            g.fillStyle = light ? `rgba(255,255,255,${rand(0.05, 0.14)})` : `rgba(0,0,0,${rand(0.08, 0.2)})`;
            g.fillRect(cx - r * 1.5, cy - r + (k + Math.random() * 0.5) * (r * 2 / 9), r * 3, r * rand(0.06, 0.16));
        }
        g.restore();
    }

    // Cratères (planète rocheuse)
    if (p.craters) {
        for (let k = 0; k < 9; k++) {
            const a = Math.random() * Math.PI * 2, d = Math.random() * r * 0.85;
            const cr = r * rand(0.05, 0.16);
            g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, 0, Math.PI * 2);
            g.fillStyle = 'rgba(0,0,0,0.22)'; g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1; g.stroke();
        }
    }

    // Ombre (côté nuit de la planète)
    const shadow = g.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.2, cx - r * 0.2, cy - r * 0.2, r * 1.6);
    shadow.addColorStop(0, 'rgba(0,0,0,0)');
    shadow.addColorStop(0.55, 'rgba(0,0,0,0.3)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.9)');
    g.fillStyle = shadow;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.restore();

    // Anneau (moitié avant, par-dessus la planète)
    if (p.ring) drawRing(0, Math.PI);

    p.img = c;
    p.half = size / 2;
}

function createPlanets() {
    const base = Math.min(bgW, bgH);
    planets = [
        // Géante gazeuse orange avec anneaux
        { x: bgW * 0.82, y: bgH * 0.3, r: base * 0.13, colors: ['#fed7aa', '#ea580c', '#431407'], glow: '#fb923c',
          ring: true, ringColor: '#fde68a', tilt: -0.35, bands: true },
        // Planète de glace bleue
        { x: bgW * 0.1, y: bgH * 0.68, r: base * 0.07, colors: ['#cffafe', '#0891b2', '#082f49'], glow: '#22d3ee',
          bands: true, tilt: 0.2 },
        // Petite lune violette rocheuse
        { x: bgW * 0.42, y: bgH * 0.14, r: base * 0.028, colors: ['#e9d5ff', '#7e22ce', '#1e0336'], glow: '#a855f7',
          craters: true, tilt: 0 }
    ];
    planets.forEach(p => {
        p.speed = p.r * 0.0009; // les grosses planètes (plus proches) défilent un peu plus vite
        renderPlanet(p);
    });
}

// --- ASTÉROÏDES : rochers irréguliers qui tournent sur eux-mêmes ---
function renderAsteroid(a) {
    const r = a.r;
    const size = Math.ceil(r * 2.4);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.translate(size / 2, size / 2);

    const pts = 11;
    g.beginPath();
    for (let i = 0; i < pts; i++) {
        const ang = (i / pts) * Math.PI * 2;
        const rr = r * rand(0.72, 1.05);
        const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    const grad = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
    grad.addColorStop(0, '#a8a29e');
    grad.addColorStop(0.5, '#57534e');
    grad.addColorStop(1, '#1c1917');
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.lineWidth = 1.5;
    g.stroke();

    g.save();
    g.clip();
    for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.arc(rand(-r * 0.5, r * 0.5), rand(-r * 0.5, r * 0.5), r * rand(0.1, 0.25), 0, Math.PI * 2);
        g.fillStyle = 'rgba(0,0,0,0.28)'; g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 1; g.stroke();
    }
    g.restore();

    a.img = c;
    a.half = size / 2;
}

function makeAsteroid(startOnScreen) {
    const a = {
        r: rand(7, 26),
        x: Math.random() * bgW,
        y: startOnScreen ? Math.random() * bgH : rand(-120, -40),
        vx: rand(-0.35, 0.35),
        rot: Math.random() * Math.PI * 2,
        rotSpeed: rand(-0.02, 0.02)
    };
    a.vy = 0.25 + a.r * 0.02; // les gros (plus proches) vont plus vite
    renderAsteroid(a);
    return a;
}

function createAsteroids() {
    asteroids = [];
    for (let i = 0; i < 7; i++) asteroids.push(makeAsteroid(true));
}

// --- BOUCLE D'ANIMATION DU FOND ---
function drawBackground(now) {
    const dt = Math.min((now - bgLastTime) / 16.67, 3); // indépendant des FPS
    bgLastTime = now;

    const targetWarp = isPaused ? 0.15 : isPlaying ? 1 + (level - 1) * 0.12 : 0.5;
    warpSpeed += (targetWarp - warpSpeed) * 0.02 * dt;

    bgCtx.clearRect(0, 0, bgW, bgH);

    // Étoiles
    for (const s of stars) {
        s.y += s.speed * warpSpeed * dt;
        if (s.y > bgH) { s.y = -2; s.x = Math.random() * bgW; }
        s.twinkle += s.twinkleSpeed * dt;
        bgCtx.globalAlpha = 0.5 + 0.5 * Math.sin(s.twinkle);
        bgCtx.fillStyle = s.color;
        const stretch = s.layer === 2 ? Math.max(0, warpSpeed - 1) * 8 : 0; // traînée en vitesse lumière
        bgCtx.fillRect(s.x, s.y, s.size, s.size + stretch);
    }

    // Planètes
    bgCtx.globalAlpha = 0.9;
    for (const p of planets) {
        p.y += p.speed * warpSpeed * dt;
        if (p.y - p.half > bgH) {
            p.y = -p.half - Math.random() * bgH * 0.5;
            p.x = rand(bgW * 0.05, bgW * 0.95);
        }
        bgCtx.drawImage(p.img, p.x - p.half, p.y - p.half);
    }

    // Astéroïdes
    bgCtx.globalAlpha = 0.8;
    for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        a.x += a.vx * dt;
        a.y += a.vy * warpSpeed * dt;
        a.rot += a.rotSpeed * dt;
        if (a.y - a.half > bgH || a.x < -60 || a.x > bgW + 60) { asteroids[i] = makeAsteroid(false); continue; }
        bgCtx.save();
        bgCtx.translate(a.x, a.y);
        bgCtx.rotate(a.rot);
        bgCtx.drawImage(a.img, -a.half, -a.half);
        bgCtx.restore();
    }

    // Étoiles filantes (de temps en temps)
    if (Math.random() < 0.004 * dt) {
        const ang = rand(Math.PI * 0.15, Math.PI * 0.35);
        const spd = rand(10, 16);
        shootingStars.push({ x: rand(0, bgW * 0.7), y: rand(0, bgH * 0.4), vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 1 });
    }
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.02 * dt;
        if (s.life <= 0) { shootingStars.splice(i, 1); continue; }
        const tail = bgCtx.createLinearGradient(s.x, s.y, s.x - s.vx * 6, s.y - s.vy * 6);
        tail.addColorStop(0, 'rgba(255,255,255,0.9)');
        tail.addColorStop(1, 'rgba(255,255,255,0)');
        bgCtx.globalAlpha = s.life;
        bgCtx.strokeStyle = tail;
        bgCtx.lineWidth = 2;
        bgCtx.beginPath();
        bgCtx.moveTo(s.x, s.y);
        bgCtx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
        bgCtx.stroke();
    }

    bgCtx.globalAlpha = 1;
    requestAnimationFrame(drawBackground);
}

// Recalcule le fond quand la zone de jeu change de taille (rotation, mode mobile...)
function refreshBackgroundSize() {
    if (!bgCanvas || !bgCtx) return;
    const w = gameW(), h = gameH();
    if (w === bgW && h === bgH) return;
    resizeBackground();
    createStars();
    createPlanets();
}

if (bgCanvas && bgCtx) {
    resizeBackground();
    createStars();
    createPlanets();
    createAsteroids();
    window.addEventListener('resize', refreshBackgroundSize);
    requestAnimationFrame(drawBackground);
}
