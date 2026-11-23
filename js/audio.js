// ==========================================
// Alpha Strike — audio.js : musique et effets sonores (synthétiseur)
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

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
    if (!sfxEnabled) { clearVoiceResume(); stopVoice(); } // les voix suivent le bouton EFFETS
    refreshSoundButtons();
    sfxBtn.blur();
});

refreshSoundButtons();
