// ==========================================
// Alpha Strike — voice.js : voix des niveaux
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 1 BIS. 🎙️ VOIX DES NIVEAUX (dossier voix/)
// ==========================================
// Niveaux 2 à 20 : voix/nivX.mp3 (pas de voix au niveau 1 ni au-delà du 20)
const VOICE_MAX_LEVEL = 20;
const VOICE_VOLUME = 0.3; // volume des voix (0 à 1) : à ajuster selon tes goûts
let voiceGainNode = null; // réglage de volume via Web Audio (seul moyen qui marche sur iPhone)
const voicePlayer = new Audio(); // un seul lecteur réutilisé (indispensable sur iPhone)
voicePlayer.preload = 'auto';
let voiceTimer = null;
let voiceUnlockId = 0;

function voiceFile(lvl) {
    return lvl >= 2 && lvl <= VOICE_MAX_LEVEL ? `voix/niv${lvl}.mp3` : null;
}

// Joue la voix du niveau (après "delay" ms, pour ne pas couvrir le jingle de montée de niveau)
function playLevelVoice(lvl, delay = 0) {
    clearVoiceResume();
    stopVoice();
    const src = voiceFile(lvl);
    if (!src || !sfxEnabled) return;
    const go = () => {
        voiceTimer = null;
        if (!isPlaying || !sfxEnabled) return;
        connectVoiceToMixer();
        voiceUnlockId++;          // annule le déblocage silencieux s'il n'est pas fini
        voicePlayer.muted = false;
        voicePlayer.src = src;
        // Si la voix passe par le mixeur, c'est lui qui règle le volume ; sinon le lecteur lui-même
        voicePlayer.volume = voiceGainNode ? 1 : VOICE_VOLUME;
        const p = voicePlayer.play();
        if (p && p.catch) p.catch(() => duckMusic(false)); // fichier absent / lecture refusée : pas grave
        duckMusic(true);
    };
    if (delay > 0) voiceTimer = setTimeout(go, delay); else go();
}

// Fait passer la voix par le mixeur audio du jeu (une seule fois).
// Seulement quand le jeu est en ligne (http/https) : en fichier local, Chrome rendrait la voix muette.
function connectVoiceToMixer() {
    if (voiceGainNode || !audioCtx || !/^https?:$/.test(location.protocol)) return;
    try {
        const source = audioCtx.createMediaElementSource(voicePlayer);
        voiceGainNode = audioCtx.createGain();
        voiceGainNode.gain.value = VOICE_VOLUME;
        source.connect(voiceGainNode);
        voiceGainNode.connect(audioCtx.destination);
    } catch (e) { voiceGainNode = null; }
}

function stopVoice() {
    clearTimeout(voiceTimer);
    voiceTimer = null;
    if (!voicePlayer.paused) voicePlayer.pause();
    duckMusic(false);
}

// Baisse la musique pendant que la voix parle, pour bien l'entendre
function duckMusic(on) {
    if (!audioCtx || !musicGain || !isPlaying) return;
    const now = audioCtx.currentTime;
    const target = musicEnabled ? (on ? MUSIC_VOLUME * 0.7 : MUSIC_VOLUME) : 0;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.setTargetAtTime(target, now, on ? 0.08 : 0.4);
}
// Après une pause : on reprend la voix là où elle s'était arrêtée (ou on lance celle qui allait démarrer)
function resumeVoice() {
    const pending = parseInt(voicePlayer.dataset.pendingLevel, 10);
    const wasPlaying = voicePlayer.dataset.resume === '1';
    clearVoiceResume();
    if (!sfxEnabled) return;
    if (pending) { playLevelVoice(pending); return; }
    if (wasPlaying && !voicePlayer.ended) {
        const p = voicePlayer.play();
        if (p && p.catch) p.catch(() => duckMusic(false));
        duckMusic(true);
    }
}
function clearVoiceResume() {
    delete voicePlayer.dataset.pendingLevel;
    delete voicePlayer.dataset.resume;
}

voicePlayer.addEventListener('ended', () => duckMusic(false));
voicePlayer.addEventListener('error', () => duckMusic(false));

