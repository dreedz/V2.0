// ==========================================
// Alpha Strike — menu.js : mode de jeu, thème, difficulté, partage, bouton de don
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 4 TER. 🎚️ CHOIX DE LA DIFFICULTÉ (SIMPLE / AVANCÉ)
// ==========================================
const difficultyButtons = document.querySelectorAll('.diff-btn');

function setDifficulty(diff) {
    if (diff !== 'simple' && diff !== 'avance') return;
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
        case 'defi':
            return '🎯 Les mêmes mots pour tout le monde aujourd\'hui. Un nouveau défi chaque jour, avec son classement !';
        case 'entrainement': {
            const weak = weakestLetters(4);
            return weak.length
                ? `🎓 Les mots avec tes lettres difficiles reviennent plus souvent. À travailler : ${weak.join(', ')}`
                : '🎓 Joue quelques parties : le jeu repèrera tes lettres difficiles et te les fera travailler.';
        }
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
    if (themePick) themePick.style.display = gameType === 'defi' ? 'none' : '';
    // Téléphone / tablette : toujours SIMPLE (pas d'accents sur le clavier à l'écran)
    if (difficultyBox) difficultyBox.style.display = (isTouchDevice || gameType === 'defi') ? 'none' : '';
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

// 📱 Sur téléphone / tablette : toujours le mode SIMPLE (pas d'accents à taper sur le clavier à l'écran)
setDifficulty(isTouchDevice ? 'simple' : difficulty);
refreshModeUi();
renderLeaderboard();
