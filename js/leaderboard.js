// ==========================================
// Alpha Strike — leaderboard.js : Top 3 local et classement en ligne
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 4 BIS. 🏆 TOP 3 DES MEILLEURS SCORES
// ==========================================
// Un classement par difficulté (le mode avancé est plus dur : ce ne serait pas équitable de mélanger)
const leaderboardKey = () => (difficulty === 'simple' ? 'typing_shooter_top3' : 'typing_shooter_top3_' + difficulty);
const LAST_NAME_KEY = 'typing_shooter_lastname';
const LEADERBOARD_SIZE = 3;
const leaderboardElement = document.getElementById('leaderboard');
const nameEntryForm = document.getElementById('name-entry');
const nameInput = document.getElementById('name-input');
let leaderboard = [];
let pendingEntry = null; // score qui vient d'entrer dans le Top 3 (en attente du nom)


// Nettoie un nom : majuscules, 10 caractères max, pas de caractères bizarres
function cleanName(raw) {
    return String(raw || '').toUpperCase()
        .replace(/[^A-Z0-9ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ _.\-]/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, 10);
}

function loadLeaderboard() {
    let list = [];
    try { list = JSON.parse(readStore(leaderboardKey())) || []; } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    list = list
        .filter(r => r && Number.isFinite(r.score) && r.score > 0)
        .map(r => ({ name: cleanName(r.name) || 'PILOTE', score: Math.floor(r.score), level: r.level || null }));
    // Ancienne version du jeu : un seul record sans nom → on le garde (dans le classement simple)
    if (list.length === 0 && difficulty === 'simple') {
        const old = parseInt(readStore('typing_shooter_highscore'), 10) || 0;
        if (old > 0) list.push({ name: 'PILOTE', score: old, level: null });
    }
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, LEADERBOARD_SIZE);
}

function storeLeaderboard() {
    writeStore(leaderboardKey(), JSON.stringify(leaderboard));
    if (difficulty === 'simple') writeStore('typing_shooter_highscore', leaderboard.length ? leaderboard[0].score : 0); // compatibilité
    highScore = leaderboard.length ? leaderboard[0].score : 0;
    if (highScoreElement) highScoreElement.innerText = highScore;
}

function qualifiesForLeaderboard(s) {
    if (s <= 0) return false;
    return leaderboard.length < LEADERBOARD_SIZE || s > leaderboard[leaderboard.length - 1].score;
}

// Ajoute le score au classement. Renvoie l'entrée créée (ou null si pas qualifié).
function addToLeaderboard(s, lvl) {
    if (!qualifiesForLeaderboard(s)) return null;
    const entry = { name: cleanName(readStore(LAST_NAME_KEY)) || 'PILOTE', score: s, level: lvl };
    // À égalité, le score le plus ancien reste devant
    let i = leaderboard.findIndex(r => s > r.score);
    if (i === -1) i = leaderboard.length;
    leaderboard.splice(i, 0, entry);
    leaderboard = leaderboard.slice(0, LEADERBOARD_SIZE);
    storeLeaderboard();
    return entry;
}

// ==========================================
// 🌍 CLASSEMENT EN LIGNE (Supabase)
// ==========================================
// Clé "Publishable key" (sb_publishable_...) de Supabase → Project Settings → API Keys.
// JAMAIS la "Secret key" (sb_secret_...) ici ! La clé publishable est faite pour être visible :
// les règles de la base n'autorisent que la lecture et l'ajout de scores.
// Tant qu'elle est vide, le jeu utilise seulement le classement de l'appareil.
const ONLINE_URL = 'https://fzowmwwfamwdxffcaotd.supabase.co';
const ONLINE_KEY = 'sb_publishable_-C_GItAIa49ouDdNgNhrAA_zRkKX33d';
const onlineEnabled = () => ONLINE_KEY.length > 20;
const onlineTop = {}; // Top 3 téléchargés, rangés par classement (absent = pas chargé → classement local)
const onlineRankElement = document.getElementById('online-rank');
let boardHighlight = null; // score mis en valeur dans le tableau (celui qu'on vient de faire)

// Quel classement pour le mode choisi ?
//  'classique' : partie classique avec tous les mots · 'defi' : défi du jour · 'none' : hors classement
const boardKind = () => (gameType === 'defi' ? 'defi'
    : (gameType === 'classique' && wordTheme === 'tous' ? 'classique' : 'none'));
// Classement classique : de tous les temps ('all') ou de la semaine ('week')
let boardPeriod = readStore('typing_shooter_period') === 'week' ? 'week' : 'all';
// Lundi 0 h (temps universel) de la semaine en cours
function weekStartIso() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    return d.toISOString();
}
const boardCacheKey = () => (boardKind() === 'defi' ? 'defi|' + todayKey() : `classique|${difficulty}|${boardPeriod}`);
// Filtre de la base pour un classement
function boardFilter(kind = boardKind(), diff = effectiveDifficulty(), period = boardPeriod) {
    if (kind === 'defi') return `&game_mode=eq.defi&day=eq.${todayKey()}`;
    return `&game_mode=eq.classique&difficulty=eq.${diff}` + (period === 'week' ? `&created_at=gte.${encodeURIComponent(weekStartIso())}` : '');
}

function onlineFetch(path, options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    return fetch(`${ONLINE_URL}/rest/v1/${path}`, {
        ...options,
        signal: ctrl.signal,
        headers: {
            apikey: ONLINE_KEY,
            // anciennes clés (JWT "eyJ...") : aussi dans Authorization ; nouvelles clés "sb_publishable_..." : apikey suffit
            ...(ONLINE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer ' + ONLINE_KEY } : {}),
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r;
    }).finally(() => clearTimeout(timer));
}

// Télécharge le Top 3 mondial du classement affiché
async function refreshOnline() {
    if (!onlineEnabled() || boardKind() === 'none') return;
    const key = boardCacheKey();
    const kind = boardKind(), diff = effectiveDifficulty();
    try {
        const r = await onlineFetch(`scores?select=name,score,level${boardFilter()}&order=score.desc,created_at.asc&limit=${LEADERBOARD_SIZE}`);
        const rows = await r.json();
        onlineTop[key] = rows.map(x => ({
            name: cleanName(x.name) || 'PILOTE', score: Math.floor(x.score) || 0, level: x.level || null,
            difficulty: diff, kind: kind
        }));
        if (key === boardCacheKey()) renderLeaderboard();
    } catch (e) { /* hors ligne : on garde le classement de l'appareil */ }
}

// Compte les scores d'un classement (avec un filtre éventuel) sans les télécharger
async function onlineCount(entry, filter = '') {
    const r = await onlineFetch(`scores?select=id${boardFilter(entry.kind, entry.difficulty, 'all')}${filter}`, {
        method: 'HEAD', headers: { Prefer: 'count=exact' }
    });
    const range = r.headers.get('content-range') || '';
    return parseInt(range.split('/')[1], 10) || 0;
}

function showRankText(text) {
    if (!onlineRankElement) return;
    onlineRankElement.innerText = text || '';
    onlineRankElement.classList.toggle('hidden', !text);
}

// 🎫 Ticket de partie : demandé au serveur au début de chaque partie.
// Le serveur note l'heure de départ ; à la fin, il vérifie que le score est possible
// dans le temps écoulé (anti-triche). Un ticket ne sert qu'une fois.
let onlineSession = null;
async function startOnlineSession() {
    onlineSession = null;
    const kind = boardKind();
    if (!onlineEnabled() || kind === 'none') return; // entraînement, dictée, thème : hors classement
    const ticket = { id: null, difficulty: effectiveDifficulty(), kind };
    onlineSession = ticket;
    try {
        const r = await onlineFetch('rpc/start_game', {
            method: 'POST', body: JSON.stringify({ p_difficulty: ticket.difficulty, p_mode: kind })
        });
        ticket.id = await r.json();
    } catch (e) { /* hors ligne : la partie ne pourra pas être envoyée */ }
}

// Envoie un score validé (via la fonction de contrôle du serveur), puis affiche la place du joueur
async function submitOnline(entry) {
    if (!onlineEnabled() || !entry || entry.score <= 0) return;
    const sessionId = entry.ticket && entry.ticket.id;
    if (!sessionId) {
        showRankText('⚠️ Score non envoyé en ligne (pas de connexion au début de la partie)');
        return;
    }
    showRankText('🌍 Envoi du score…');
    try {
        // Le serveur répond "ok" si le score est accepté, sinon la raison du refus
        let verdict = 'refuse';
        try {
            const r = await onlineFetch('rpc/submit_score', {
                method: 'POST',
                body: JSON.stringify({
                    p_session: sessionId, p_name: entry.name, p_score: entry.score,
                    p_level: entry.level, p_words: entry.words
                })
            });
            verdict = await r.json();
        } catch (e) {
            if (!/^HTTP 4/.test(e.message)) throw e; // problème de connexion
        }
        if (verdict !== 'ok') {
            if (boardHighlight === entry) showRankText('⛔ Score refusé par le serveur');
            return;
        }
        await refreshOnline();
        const [better, total] = await Promise.all([
            onlineCount(entry, `&score=gt.${entry.score}`),
            onlineCount(entry)
        ]);
        if (boardHighlight !== entry) return; // le joueur est déjà passé à autre chose
        const rank = better + 1;
        const label = entry.kind === 'defi' ? '🎯 Défi du jour' : '🌍 Classement mondial';
        showRankText(`${label} : ${rank === 1 ? '1er' : rank + 'e'} sur ${total} partie${total > 1 ? 's' : ''}`);
    } catch (e) {
        if (boardHighlight === entry) showRankText('⚠️ Score non envoyé en ligne (pas de connexion)');
    }
}

// Liste affichée : le Top 3 mondial s'il est chargé, sinon celui de l'appareil.
// Le score qu'on vient de faire y est inséré (pour le voir tout de suite à sa place).
function displayedList() {
    const kind = boardKind();
    if (kind === 'none') return [];
    const online = onlineTop[boardCacheKey()];
    // Hors ligne : le Top 3 de l'appareil (seulement pour le classique "de tous les temps")
    const local = kind === 'classique' && boardPeriod === 'all' ? leaderboard : [];
    const list = (online || local).slice();
    const h = boardHighlight;
    if (h && h.kind === kind && h.difficulty === effectiveDifficulty() && !list.some(r => sameEntry(r, h))) {
        let i = list.findIndex(r => h.score > r.score);
        if (i === -1) i = list.length;
        list.splice(i, 0, h);
    }
    return list.slice(0, LEADERBOARD_SIZE);
}
const sameEntry = (a, b) => a === b || (a && b && a.name === b.name && a.score === b.score && (a.level || null) === (b.level || null));

// Affiche le tableau (avec la ligne du dernier score mise en valeur)
function renderLeaderboard() {
    if (!leaderboardElement) return;
    const medals = ['🥇', '🥈', '🥉'];
    const list = displayedList();
    leaderboardElement.innerHTML = '';

    // Intitulé de section + sous-titre (mondial / appareil, difficulté)
    const title = document.createElement('div');
    title.className = 'section-title gold';
    const titleText = document.createElement('span');
    titleText.innerText = 'CLASSEMENT';
    title.appendChild(titleText);
    leaderboardElement.appendChild(title);

    const kind = boardKind();
    const online = !!onlineTop[boardCacheKey()];

    // Classique : choix "tous les temps" / "cette semaine"
    if (kind === 'classique' && onlineEnabled()) {
        const tabs = document.createElement('div');
        tabs.className = 'lb-tabs';
        [['all', 'TOUS LES TEMPS'], ['week', 'CETTE SEMAINE']].forEach(([p, label]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'lb-tab' + (boardPeriod === p ? ' active' : '');
            b.innerText = label;
            b.addEventListener('click', () => { b.blur(); setBoardPeriod(p); });
            tabs.appendChild(b);
        });
        leaderboardElement.appendChild(tabs);
    }

    const sub = document.createElement('div');
    sub.className = 'lb-title';
    const diffName = DIFFICULTY_LABELS[difficulty] || 'SIMPLE';
    if (kind === 'none') {
        sub.innerText = `📘 ${GAME_TYPE_LABELS[gameType] || 'Ce mode'}${gameType === 'classique' ? ' · thème ' + THEME_LABELS[wordTheme] : ''} : hors classement (pour s'entraîner tranquillement)`;
        leaderboardElement.appendChild(sub);
        return;
    }
    if (kind === 'defi') {
        const d = new Date();
        sub.innerText = `🎯 Défi du ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · mêmes mots pour tout le monde`;
    } else if (online) {
        sub.innerText = `🌍 Top 3 mondial · ${diffName}${boardPeriod === 'week' ? ' · cette semaine' : ''}`;
    } else {
        sub.innerText = boardPeriod === 'week' ? '⚠️ Connexion nécessaire pour le classement de la semaine' : `🏆 Top 3 de cet appareil · ${diffName}`;
    }
    leaderboardElement.appendChild(sub);

    let highlightDone = false;
    for (let i = 0; i < LEADERBOARD_SIZE; i++) {
        const r = list[i];
        const isNew = !highlightDone && r && boardHighlight && sameEntry(r, boardHighlight);
        if (isNew) highlightDone = true;
        const row = document.createElement('div');
        row.className = 'lb-row rank-' + (i + 1) + (r ? '' : ' empty') + (isNew ? ' is-new' : '');

        const medal = document.createElement('span');
        medal.className = 'lb-medal';
        medal.innerText = medals[i];

        const name = document.createElement('span');
        name.className = 'lb-name';
        name.innerText = r ? r.name : '- - -'; // innerText : aucun HTML injecté depuis le nom

        const lvl = document.createElement('span');
        lvl.className = 'lb-level';
        lvl.innerText = r && r.level ? 'NIV ' + r.level : '';

        const sc = document.createElement('span');
        sc.className = 'lb-score';
        sc.innerText = r ? r.score : '';

        row.append(medal, name, lvl, sc);
        leaderboardElement.appendChild(row);
    }
}

// Change la période du classement classique
function setBoardPeriod(p) {
    boardPeriod = p === 'week' ? 'week' : 'all';
    writeStore('typing_shooter_period', boardPeriod);
    renderLeaderboard();
    refreshOnline();
}

// Affiche (ou cache) le champ pour écrire son nom
function showNameEntry(entry) {
    pendingEntry = entry;
    if (!nameEntryForm) return;
    nameEntryForm.classList.toggle('hidden', !entry);
    if (!entry || !nameInput) return;
    const entryTitle = nameEntryForm.querySelector('.name-entry-title');
    if (entryTitle) {
        const inTop = displayedList().includes(entry);
        entryTitle.innerText = inTop ? '🏆 TU ENTRES DANS LE TOP 3 !' : '🚀 ENREGISTRE TON SCORE EN LIGNE';
    }
    nameInput.value = cleanName(readStore(LAST_NAME_KEY));
    nameInput.dispatchEvent(new Event('input'));
    // Sur PC on peut écrire directement ; sur tactile on laisse le joueur toucher le champ
    // (sinon le clavier du téléphone surgit d'un coup)
    if (!isTouchDevice) setTimeout(() => { nameInput.focus(); nameInput.select(); }, 50);
}

if (nameInput) nameInput.addEventListener('input', () => {
    // Majuscules + caractères autorisés (on garde l'espace en cours de frappe)
    const v = nameInput.value.toUpperCase().replace(/[^A-Z0-9ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ _.\-]/g, '').slice(0, 10);
    if (v !== nameInput.value) nameInput.value = v;
    // Le nom apparaît en direct dans le classement
    const liveName = leaderboardElement && leaderboardElement.querySelector('.lb-row.is-new .lb-name');
    if (liveName) liveName.innerText = cleanName(v) || 'PILOTE';
});

// Valide le nom écrit (bouton OK / Entrée, ou automatiquement si on relance une partie)
function confirmName(withSound = true) {
    if (nameInput) nameInput.blur();
    if (!pendingEntry) return;
    const name = cleanName(nameInput ? nameInput.value : '') || 'PILOTE';
    pendingEntry.name = name;
    writeStore(LAST_NAME_KEY, name);
    const saved = pendingEntry;
    // Classement de l'appareil (si le score y est entré) : on l'enregistre dans sa difficulté
    if (leaderboard.includes(saved)) storeLeaderboard();
    showNameEntry(null);
    boardHighlight = saved;
    renderLeaderboard();
    submitOnline(saved); // 🌍 en arrière-plan
    if (withSound) playComboSound(3);
}

if (nameEntryForm) nameEntryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    confirmName();
});

leaderboard = loadLeaderboard();
storeLeaderboard();
renderLeaderboard();
refreshOnline();

