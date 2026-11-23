// ==========================================
// Alpha Strike — menu.js : mode de jeu, thème, difficulté, partage, bouton de don
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 4 TER. 🎚️ CHOIX DE LA DIFFICULTÉ (SIMPLE / AVANCÉ)
// ==========================================
const difficultyButtons = document.querySelectorAll('.diff-btn');

function setDifficulty(diff) {
    if (!DIFFICULTIES.includes(diff)) return;
    if (isPlaying) return; // on ne change pas en pleine partie
    if (diff !== difficulty) {
        confirmName(false); // un score en attente de nom va dans le classement de l'ancienne difficulté
        difficulty = diff;
        writeStore('typing_shooter_difficulty', diff);
        leaderboard = loadLeaderboard();
        storeLeaderboard();
        showRankText('');
        renderLeaderboard();
        refreshOnline();
    }
    difficultyButtons.forEach(b => {
        const on = b.dataset.diff === difficulty;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    document.body.classList.toggle('diff-avance', difficulty === 'avance');
}

difficultyButtons.forEach(b => b.addEventListener('click', () => {
    b.blur();
    setDifficulty(b.dataset.diff);
}));

// ==========================================
// 🎮 TYPE DE PARTIE (classique, défi du jour, entraînement, dictée) ET THÈME
// ==========================================
const typeButtons = document.querySelectorAll('.type-btn');
const typeDesc = document.getElementById('type-desc');
const themeSelect = document.getElementById('theme-select');
const themePick = document.getElementById('theme-pick');
const difficultyBox = document.getElementById('difficulty');

function typeDescription() {
    switch (gameType) {
        case 'defi': {
            const streak = typeof currentStreak === 'function' ? currentStreak() : 0;
            return '🎯 Les mêmes mots pour tout le monde aujourd\'hui (en SIMPLE), avec son classement !'
                + (streak ? ` 🔥 Série : ${streak} jour${streak > 1 ? 's' : ''}.` : ' Reviens chaque jour pour faire une série 🔥');
        }
        case 'entrainement': {
            const weak = weakestLetters(4);
            return weak.length
                ? `🎓 Les mots avec tes lettres difficiles reviennent plus souvent. À travailler : ${weak.join(', ')}`
                : '🎓 Joue quelques parties : le jeu repèrera tes lettres difficiles et te les fera travailler.';
        }
        case 'phrases':
            return isTouchDevice
                ? '📝 De courtes phrases à taper, avec la barre ESPACE entre les mots. Hors classement.'
                : '📝 De courtes phrases à taper, avec la touche Espace entre les mots. Hors classement.';
        case 'dictee':
            return canSpeak
                ? (isTouchDevice
                    ? '🗣️ Écoute le nom et tape-le. L\'icône donne un indice (🐾 animal, 🍕 nourriture…). Bouton 🔊 pour réécouter.'
                    : '🗣️ Écoute le nom et tape-le. L\'icône donne un indice (🐾 animal, 🍕 nourriture…). Touche Espace ou 🔊 pour réécouter.')
                : '🗣️ La voix n\'est pas disponible sur cet appareil : la dictée ne fonctionnera pas.';
        default:
            return wordTheme === 'tous'
                ? '🚀 La partie normale. Compte pour le classement mondial.'
                : '🚀 Avec un thème choisi, la partie ne compte pas pour le classement.';
    }
}

// Met à jour les boutons, la description et ce qui est visible selon le mode
function refreshModeUi() {
    typeButtons.forEach(b => {
        const on = b.dataset.type === gameType;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (typeDesc) typeDesc.innerText = typeDescription();
    // Défi du jour : tous les mots, mode simple → pas de choix de thème ni de difficulté
    // Phrases : pas de thème (ce sont des phrases)
    if (themePick) themePick.style.display = (gameType === 'defi' || gameType === 'phrases') ? 'none' : '';
    const diffBlock = document.getElementById('difficulty-block') || difficultyBox;
    if (diffBlock) diffBlock.style.display = gameType === 'defi' ? 'none' : '';
    // Téléphone / tablette : pas d'AVANCÉ (pas d'accents sur le clavier à l'écran), mais BABY oui
    const avanceBtn = document.querySelector('.diff-btn[data-diff="avance"]');
    if (avanceBtn) avanceBtn.style.display = isTouchDevice ? 'none' : '';
    if (difficultyBox) difficultyBox.classList.toggle('two', isTouchDevice);
    if (themeSelect) themeSelect.value = wordTheme;
}

function setGameType(t) {
    if (isPlaying || !GAME_TYPES.includes(t)) return;
    if (t !== gameType) {
        confirmName(false);
        gameType = t;
        writeStore('typing_shooter_mode', t);
        boardHighlight = null;
        showRankText('');
    }
    refreshModeUi();
    renderLeaderboard();
    refreshOnline();
}

function setTheme(t) {
    if (isPlaying || !THEME_LABELS[t]) return;
    if (t !== wordTheme) {
        confirmName(false);
        wordTheme = t;
        writeStore('typing_shooter_theme', t);
        boardHighlight = null;
        showRankText('');
    }
    refreshModeUi();
    renderLeaderboard();
    refreshOnline();
}

typeButtons.forEach(b => b.addEventListener('click', () => { b.blur(); setGameType(b.dataset.type); }));
if (themeSelect) {
    Object.entries(THEME_LABELS).forEach(([key, label]) => {
        const o = document.createElement('option');
        o.value = key;
        o.textContent = label;
        themeSelect.appendChild(o);
    });
    themeSelect.addEventListener('change', () => { setTheme(themeSelect.value); themeSelect.blur(); });
}

// ==========================================
// 📤 PARTAGER SON SCORE
// ==========================================
const shareBtn = document.getElementById('share-btn');
async function shareScore() {
    const s = lastGameSummary;
    if (!s) return;
    const mode = s.gameType === 'defi' ? ' au défi du jour' : '';
    const text = `🚀 J'ai fait ${s.score} points (niveau ${s.level}, ${s.accuracy}% de précision)${mode} sur Alpha Strike ! Tu peux me battre ?`;
    const url = location.href.split('#')[0].split('?')[0];
    try {
        if (navigator.share) {
            await navigator.share({ title: 'Alpha Strike', text, url });
            return;
        }
        await navigator.clipboard.writeText(`${text} ${url}`);
        showShareFeedback('✅ Copié ! Colle-le dans un message.');
    } catch (e) {
        if (e && e.name === 'AbortError') return; // partage annulé par le joueur
        showShareFeedback('⚠️ Partage impossible sur cet appareil');
    }
}
function showShareFeedback(text) {
    if (!shareBtn) return;
    const old = shareBtn.dataset.label || shareBtn.innerText;
    shareBtn.dataset.label = old;
    shareBtn.innerText = text;
    clearTimeout(shareBtn._t);
    shareBtn._t = setTimeout(() => { shareBtn.innerText = old; }, 2500);
}
if (shareBtn) shareBtn.addEventListener('click', () => { shareBtn.blur(); shareScore(); });

// ==========================================
// 💜 BOUTON DE DON (cadre sous le menu principal)
// ==========================================
// Ton lien PayPal, par exemple 'https://paypal.me/TonPseudo' ou 'https://www.paypal.com/donate/?hosted_button_id=XXXX'.
// Tant qu'il est vide, le cadre n'est pas affiché.
const DONATE_URL = 'https://paypal.me/wordshooter';
(() => {
    const ok = /^https:\/\/(www\.)?(paypal\.me|paypal\.com)\//i.test(DONATE_URL);
    const btn = document.getElementById('donate-btn');
    if (ok && btn) btn.href = DONATE_URL;
    if (gameOverScreen) gameOverScreen.classList.toggle('has-donate', ok && !!btn);
})();

// ==========================================
// 🔤 POLICE ADAPTÉE À LA DYSLEXIE (option mémorisée)
// ==========================================
const fontBtn = document.getElementById('font-btn');
let dysFont = readStore('typing_shooter_dys') === '1';
function applyFont() {
    document.body.classList.toggle('dys-font', dysFont);
    if (fontBtn) {
        fontBtn.classList.toggle('off', !dysFont);
        fontBtn.title = dysFont ? 'Revenir à la police normale' : 'Police plus facile à lire (dyslexie)';
    }
}
if (fontBtn) fontBtn.addEventListener('click', () => {
    fontBtn.blur();
    dysFont = !dysFont;
    writeStore('typing_shooter_dys', dysFont ? '1' : '0');
    applyFont();
    // la taille des mots change : on met à jour leur hauteur (limite du bouclier)
    activeWords.forEach(w => { if (w.element) w.height = w.element.offsetHeight; });
});
applyFont();

// 📱 Sur téléphone / tablette : pas d'AVANCÉ (pas d'accents à taper sur le clavier à l'écran)
setDifficulty(isTouchDevice && difficulty === 'avance' ? 'simple' : difficulty);
refreshModeUi();
renderLeaderboard();
