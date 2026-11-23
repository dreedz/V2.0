// ==========================================
// Alpha Strike — mobile.js : clavier virtuel, réglage VUE, orientation
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

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
        // 📝 Mode phrases : une barre ESPACE au bout de la dernière rangée
        if (row === KEYBOARD_ROWS[KEYBOARD_ROWS.length - 1] && gameType === 'phrases') {
            const space = document.createElement('button');
            space.className = 'vk-key vk-space';
            space.type = 'button';
            space.dataset.key = ' ';
            space.innerText = 'ESPACE';
            rowEl.appendChild(space);
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

// ⌨️ Afficher / masquer le clavier virtuel (choix mémorisé)
const keyboardToggle = document.getElementById('keyboard-toggle');
let keyboardVisible = loadSetting('typing_shooter_keyboard', true);

function setKeyboardVisible(visible) {
    const oldH = gameH();
    keyboardVisible = visible;
    document.body.classList.toggle('vk-hidden', !visible);
    saveSetting('typing_shooter_keyboard', visible);
    if (keyboardToggle) keyboardToggle.title = visible ? 'Masquer le clavier' : 'Afficher le clavier';

    // La zone de jeu change de hauteur : on garde la même progression des mots
    // (sinon, en réaffichant le clavier, un mot pourrait se retrouver d'un coup sous le bouclier)
    const newH = gameH();
    if (oldH > 0 && newH !== oldH) {
        const ratio = newH / oldH;
        activeWords.forEach(w => {
            w.posY *= ratio;
            if (w.element) w.element.style.top = w.posY + 'px';
        });
    }
    refreshBackgroundSize();
}

// ==========================================
// 6 QUATER. RÉGLAGE "VUE" (ZOOM DE LA ZONE DE JEU)
// ==========================================
// Plus le pourcentage est petit, plus tout est petit à l'écran et plus on voit de terrain
// (les mots apparaissent donc plus tôt et on a plus de temps pour les taper).
const ZOOM_LEVELS = [1, 0.85, 0.7, 0.55];
const zoomBtn = document.getElementById('zoom-btn');
// Tablette (tactile, petit côté de l'écran ≥ 600 px) : vue 70 % par défaut. Sinon 100 %.
const isTablet = isTouchDevice && Math.min(screen.width, screen.height) >= 600;
const DEFAULT_ZOOM = isTablet ? 0.7 : 1;

function loadZoom() {
    try {
        const v = parseFloat(localStorage.getItem('typing_shooter_zoom'));
        return ZOOM_LEVELS.includes(v) ? v : DEFAULT_ZOOM;
    } catch (e) { return DEFAULT_ZOOM; }
}

function setZoom(z, keepWordsInPlace = true) {
    const oldW = gameW(), oldH = gameH();
    currentZoom = z;
    document.documentElement.style.setProperty('--zoom', z);
    try { localStorage.setItem('typing_shooter_zoom', z); } catch (e) { /* stockage indisponible */ }
    const zoomValue = zoomBtn ? zoomBtn.querySelector('.zoom-value') : null;
    if (zoomValue) zoomValue.innerText = Math.round(z * 100) + '%';

    // La zone de jeu change de taille : on garde la même position relative des mots et lasers
    if (keepWordsInPlace && oldW > 0 && oldH > 0) {
        const rx = gameW() / oldW, ry = gameH() / oldH;
        activeWords.forEach(w => {
            w.posX *= rx; w.posY *= ry;
            if (w.element) { w.element.style.left = w.posX + 'px'; w.element.style.top = w.posY + 'px'; }
        });
        lasers.forEach(l => {
            l.x *= rx; l.y *= ry;
            if (l.element) { l.element.style.left = l.x + 'px'; l.element.style.top = l.y + 'px'; }
        });
        refreshBackgroundSize();
    }
}

if (zoomBtn) zoomBtn.addEventListener('click', () => {
    zoomBtn.blur();
    const i = ZOOM_LEVELS.indexOf(currentZoom);
    setZoom(ZOOM_LEVELS[(i + 1) % ZOOM_LEVELS.length]);
});

setZoom(loadZoom(), false); // applique la vue enregistrée au démarrage

// Applique le choix enregistré au démarrage (sans toucher au fond, qui n'est pas encore créé)
document.body.classList.toggle('vk-hidden', !keyboardVisible);
if (keyboardToggle) keyboardToggle.title = keyboardVisible ? 'Masquer le clavier' : 'Afficher le clavier';

if (keyboardToggle) keyboardToggle.addEventListener('click', () => {
    keyboardToggle.blur();
    setKeyboardVisible(!keyboardVisible);
});

// Téléphone tourné à l'horizontale en mode mobile : on met en pause automatiquement
const landscapePhoneQuery = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
function checkOrientation() {
    if (gameMode === 'mobile' && isPlaying && landscapePhoneQuery.matches) {
        if (isCountingDown) cancelCountdown();
        else pauseGame();
    }
}
window.addEventListener('resize', checkOrientation);

