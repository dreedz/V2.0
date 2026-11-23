// ==========================================
// Alpha Strike — progress.js : expérience, badges, vaisseaux, série de jours, fantôme du record
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

const PROGRESS_KEY = 'typing_shooter_progress';

// 🏅 Les badges à gagner
const BADGES = [
    { id: 'first',     icon: '🚀', name: 'Premier décollage',  desc: 'Terminer une première partie' },
    { id: 'boss',      icon: '👾', name: 'Chasseur de boss',   desc: 'Vaincre un boss' },
    { id: 'boss5',     icon: '👑', name: 'Terreur des boss',   desc: 'Vaincre 5 boss (au total)' },
    { id: 'combo',     icon: '🔥', name: 'En feu',             desc: 'Atteindre le combo x4' },
    { id: 'bomb',      icon: '💣', name: 'Grosse explosion',   desc: 'Détruire 3 mots d\'un coup avec une bombe' },
    { id: 'lvl10',     icon: '⭐', name: 'Niveau 10',          desc: 'Atteindre le niveau 10' },
    { id: 'lvl20',     icon: '🌟', name: 'Niveau 20',          desc: 'Atteindre le niveau 20' },
    { id: 'untouched', icon: '🛡️', name: 'Intouchable',        desc: 'Atteindre le niveau 5 sans perdre de vie' },
    { id: 'precision', icon: '🎯', name: 'Tireur d\'élite',     desc: '100 % de précision (40 lettres minimum)' },
    { id: 'speed',     icon: '💨', name: 'Doigts de fée',      desc: 'Taper à 30 mots/min (1 minute de jeu minimum)' },
    { id: 'words100',  icon: '💯', name: 'Cent mots',          desc: 'Détruire 100 mots (au total)' },
    { id: 'words1000', icon: '🏆', name: 'Mille mots',         desc: 'Détruire 1 000 mots (au total)' },
    { id: 'dictee',    icon: '🗣️', name: 'Oreille d\'or',      desc: 'Réussir 15 mots dans une dictée' },
    { id: 'phrases',   icon: '📝', name: 'Écrivain',           desc: 'Taper 10 phrases dans une partie' },
    { id: 'defi',      icon: '🎯', name: 'Défi relevé',        desc: 'Terminer un défi du jour' },
    { id: 'streak3',   icon: '🔥', name: 'Sur ma lancée',      desc: 'Faire le défi du jour 3 jours de suite' },
    { id: 'streak7',   icon: '🗓️', name: 'Une semaine entière', desc: 'Faire le défi du jour 7 jours de suite' }
];

// 🚀 Vaisseaux débloqués avec le niveau de pilote (couleurs appliquées au dessin du vaisseau)
const SHIPS = [
    { id: 'cyan',    name: 'Faucon bleu',     level: 1,  filter: 'none' },
    { id: 'vert',    name: 'Comète verte',    level: 2,  filter: 'hue-rotate(-70deg) saturate(1.3)' },
    { id: 'rubis',   name: 'Fusée rubis',     level: 3,  filter: 'hue-rotate(160deg) saturate(1.6)' },
    { id: 'violet',  name: 'Ombre violette',  level: 5,  filter: 'hue-rotate(75deg) saturate(1.4)' },
    { id: 'or',      name: 'Étoile d\'or',    level: 8,  filter: 'hue-rotate(-150deg) saturate(2) brightness(1.15)' },
    { id: 'rose',    name: 'Néon rose',       level: 12, filter: 'hue-rotate(125deg) saturate(1.8) brightness(1.1)' },
    { id: 'rainbow', name: 'Arc-en-ciel',     level: 20, filter: 'rainbow' }
];

// --- Lecture / écriture de la progression ---
// Remet une progression (de l'appareil ou du compte en ligne) dans le bon format
function normalizeProgress(p) {
    p = p && typeof p === 'object' ? p : {};
    return {
        xp: p.xp || 0,
        badges: p.badges || {},
        totals: Object.assign({ words: 0, bosses: 0, games: 0 }, p.totals || {}),
        streak: Object.assign({ last: null, count: 0, best: 0 }, p.streak || {}),
        ship: p.ship || 'cyan',
        ghosts: p.ghosts || {}
    };
}
function loadProgress() {
    let p = null;
    try { p = JSON.parse(readStore(PROGRESS_KEY)); } catch (e) { p = null; }
    return normalizeProgress(p);
}
let progress = loadProgress();
function saveProgress() {
    writeStore(PROGRESS_KEY, JSON.stringify(progress));
    if (typeof scheduleCloudSave === 'function') scheduleCloudSave(); // ☁️ compte en ligne (account.js)
}

// Fusionne deux progressions (celle de l'appareil et celle du compte) sans rien perdre :
// on garde le meilleur de chaque (XP, badges, records...). "a" décide du vaisseau choisi.
function mergeProgress(a, b) {
    a = normalizeProgress(a); b = normalizeProgress(b);
    const out = normalizeProgress({ xp: Math.max(a.xp, b.xp), ship: a.ship });
    [a, b].forEach(p => {
        Object.entries(p.badges).forEach(([id, day]) => {
            if (!out.badges[id] || String(day) < String(out.badges[id])) out.badges[id] = day;
        });
        Object.entries(p.totals).forEach(([k, n]) => { out.totals[k] = Math.max(out.totals[k] || 0, n || 0); });
        Object.entries(p.ghosts).forEach(([k, g]) => {
            if (g && (!out.ghosts[k] || g.score > out.ghosts[k].score)) out.ghosts[k] = g;
        });
    });
    const s = String(a.streak.last || '') >= String(b.streak.last || '') ? a.streak : b.streak;
    out.streak = { last: s.last, count: s.count, best: Math.max(a.streak.best || 0, b.streak.best || 0, s.count || 0) };
    return out;
}

// --- Niveau de pilote : niveau 2 = 100 XP, 3 = 300, 4 = 600, 5 = 1 000... ---
const xpForLevel = (lvl) => 50 * (lvl - 1) * lvl;
function pilotLevel(xp = progress.xp) {
    let lvl = 1;
    while (xp >= xpForLevel(lvl + 1)) lvl++;
    return lvl;
}

// --- La partie en cours ---
let run = { bosses: 0, livesLost: 0, phrases: 0, newBadges: [], timeline: [] };
function startRun() {
    run = { bosses: 0, livesLost: 0, phrases: 0, newBadges: [], timeline: [0] };
    updateGhost();
}

// Débloque un badge (une seule fois). Pendant une partie, une petite annonce apparaît.
function unlockBadge(id) {
    if (progress.badges[id]) return false;
    const badge = BADGES.find(b => b.id === id);
    if (!badge) return false;
    progress.badges[id] = todayKey();
    run.newBadges.push(id);
    saveProgress();
    if (isPlaying) showBadgeToast(badge);
    return true;
}
function showBadgeToast(badge) {
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = `<span class="bt-icon">${badge.icon}</span><span><small>BADGE DÉBLOQUÉ</small><br>${badge.name}</span>`;
    (container || document.body).appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
    playComboSound(4);
}
function checkLevelBadges() {
    if (level >= 10) unlockBadge('lvl10');
    if (level >= 20) unlockBadge('lvl20');
    if (level >= 5 && run.livesLost === 0) unlockBadge('untouched');
}

// 🔥 Série de jours (défi du jour terminé plusieurs jours d'affilée)
function updateStreak() {
    const today = todayKey();
    const s = progress.streak;
    if (s.last === today) return false;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.count = s.last === yesterday ? s.count + 1 : 1;
    s.last = today;
    s.best = Math.max(s.best, s.count);
    return true;
}
// Série encore valable ? (faite aujourd'hui ou hier)
function currentStreak() {
    const s = progress.streak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return (s.last === todayKey() || s.last === yesterday) ? s.count : 0;
}

// 👻 Fantôme : où en était le record (de ce mode) au même moment de la partie
const ghostKey = () => `${gameType}|${effectiveDifficulty()}|${effectiveTheme()}`;
const ghostElement = document.getElementById('ghost');
function updateGhost() {
    if (isPlaying && tick % 60 === 0 && tick > 0) run.timeline.push(score); // un point par seconde
    if (!ghostElement) return;
    const ghost = progress.ghosts[ghostKey()];
    if (!isPlaying || !ghost || !ghost.timeline || ghost.timeline.length < 2) {
        ghostElement.innerHTML = '';
        return;
    }
    const sec = Math.floor(tick / 60);
    const ghostScore = ghost.timeline[Math.min(sec, ghost.timeline.length - 1)];
    const diff = score - ghostScore;
    ghostElement.className = 'ghost ' + (diff >= 0 ? 'ahead' : 'behind');
    ghostElement.innerHTML = `👻 ${diff >= 0 ? '+' : '−'}${Math.abs(diff)}`;
    ghostElement.title = `Ton record (${ghost.score}) avait ${ghostScore} points à ce moment-là`;
}

// 🏁 Fin de partie : XP, badges, série, fantôme. Renvoie un résumé pour l'écran de fin.
function finishRun(summary) {
    const before = pilotLevel();
    progress.totals.games++;
    progress.totals.words += wordsDestroyedTotal;
    progress.totals.bosses += run.bosses;

    // Expérience gagnée : 2 XP par mot détruit + 5 XP par niveau atteint
    const xpGained = wordsDestroyedTotal * 2 + level * 5;
    progress.xp += xpGained;

    unlockBadge('first');
    if (progress.totals.bosses >= 5) unlockBadge('boss5');
    if (progress.totals.words >= 100) unlockBadge('words100');
    if (progress.totals.words >= 1000) unlockBadge('words1000');
    if (summary.accuracy === 100 && stats.correct >= 40) unlockBadge('precision');
    if (summary.wpm >= 30 && tick >= 3600) unlockBadge('speed');
    if (gameType === 'dictee' && wordsDestroyedTotal >= 15) unlockBadge('dictee');
    if (run.phrases >= 10) unlockBadge('phrases');
    checkLevelBadges();

    let streakUp = false;
    if (gameType === 'defi' && wordsDestroyedTotal > 0) {
        unlockBadge('defi');
        streakUp = updateStreak();
        if (progress.streak.count >= 3) unlockBadge('streak3');
        if (progress.streak.count >= 7) unlockBadge('streak7');
    }

    // Nouveau record pour ce mode : on garde sa "trace" pour le fantôme
    run.timeline.push(score);
    const key = ghostKey();
    const oldGhost = progress.ghosts[key];
    const newGhost = score > 0 && (!oldGhost || score > oldGhost.score);
    if (newGhost) progress.ghosts[key] = { score, timeline: run.timeline.slice(0, 1800) };

    saveProgress();
    updateGhost();
    refreshPilotSummary();
    const after = pilotLevel();
    return {
        xpGained, newBadges: run.newBadges.slice(), levelUp: after > before ? after : 0,
        newShips: SHIPS.filter(s => s.level > before && s.level <= after),
        streak: progress.streak.count, streakUp, ghostBeaten: newGhost && !!oldGhost
    };
}

// Texte de l'écran de fin
function progressSummaryHtml(p) {
    if (!p) return '';
    const parts = [`<span class="pg-xp">+${p.xpGained} XP</span>`];
    if (p.levelUp) parts.push(`<span class="pg-level">⬆️ Pilote niveau ${p.levelUp} !</span>`);
    if (p.streakUp) parts.push(`<span class="pg-streak">🔥 ${p.streak} jour${p.streak > 1 ? 's' : ''} de suite</span>`);
    if (p.ghostBeaten) parts.push('<span class="pg-ghost">👻 Fantôme battu !</span>');
    let html = `<div class="progress-summary">${parts.join('')}</div>`;
    if (p.newBadges.length) {
        html += `<div class="new-badges">🏅 ${p.newBadges.map(id => {
            const b = BADGES.find(x => x.id === id);
            return `<span class="nb">${b.icon} ${b.name}</span>`;
        }).join('')}</div>`;
    }
    if (p.newShips.length) html += `<div class="new-badges">🚀 Nouveau vaisseau : ${p.newShips.map(s => s.name).join(', ')} !</div>`;
    return html;
}

// --- Vaisseau choisi ---
// (la couleur s'applique à tout le vaisseau, halo lumineux compris)
function applyShip() {
    if (!playerShip) return;
    const ship = SHIPS.find(s => s.id === progress.ship && s.level <= pilotLevel()) || SHIPS[0];
    const rainbow = ship.filter === 'rainbow';
    playerShip.classList.toggle('ship-rainbow', rainbow);
    if (rainbow || ship.filter === 'none') playerShip.style.removeProperty('--ship-filter');
    else playerShip.style.setProperty('--ship-filter', ship.filter);
}

// Copie "propre" du dessin du vaisseau pour les aperçus du profil :
// sans la couleur du vaisseau choisi, et avec des identifiants uniques
// (sinon les dégradés de couleur de chaque aperçu se mélangent)
function shipPreviewSvg(suffix) {
    const svg = playerShip ? playerShip.querySelector('svg') : null;
    if (!svg) return '';
    const clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    clone.removeAttribute('class');
    clone.removeAttribute('id');
    let html = clone.outerHTML;
    html = html.replace(/id="([^"]+)"/g, `id="$1-${suffix}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);
    return html;
}

// ==========================================
// 👨‍🚀 ÉCRAN "PROFIL" (badges, vaisseaux, série)
// ==========================================
const pilotCard = document.getElementById('pilot-card');
const profileScreen = document.getElementById('profile-screen');
const profileContent = document.getElementById('profile-content');

// Vaisseau choisi (en tenant compte du niveau)
const currentShip = () => SHIPS.find(s => s.id === progress.ship && s.level <= pilotLevel()) || SHIPS[0];

// 👨‍🚀 Carte du pilote (menu) : qui joue, niveau, badges, et accès au compte
function refreshPilotSummary() {
    if (!pilotCard) return;
    const lvl = pilotLevel();
    const from = xpForLevel(lvl), to = xpForLevel(lvl + 1);
    const pct = Math.max(0, Math.min(100, Math.round(100 * (progress.xp - from) / (to - from))));
    const got = Object.keys(progress.badges).length;
    const streak = currentStreak();
    const acc = typeof account !== 'undefined' && account ? cleanName(account.name) : '';
    const online = typeof onlineEnabled === 'function' && onlineEnabled();
    const ship = currentShip();
    const shipStyle = ship.filter !== 'rainbow' && ship.filter !== 'none' ? `filter:${ship.filter}` : '';
    const cloud = typeof cloudState !== 'undefined' ? cloudState : '';
    pilotCard.innerHTML = `
        <div class="pc-ship${ship.filter === 'rainbow' ? ' ship-rainbow' : ''}" style="${shipStyle}">${shipPreviewSvg('pc')}</div>
        <div class="pc-info">
            <div class="pc-name">${acc || 'PILOTE INVITÉ'}
                ${online ? (acc
                    ? `<span class="pc-tag ${cloud === 'offline' ? 'warn' : 'ok'}">${cloud === 'offline' ? '⚠️ hors ligne' : '☁️ sauvegardé'}</span>`
                    : '<span class="pc-tag warn">non sauvegardé</span>') : ''}
            </div>
            <div class="pc-level"><b>NIVEAU ${lvl}</b>
                <span class="pc-bar"><span style="width:${pct}%"></span></span>
                <span class="pc-xp">${progress.xp - from}/${to - from} XP</span>
            </div>
            <div class="pc-meta">🏅 ${got}/${BADGES.length} badges${streak ? ` · 🔥 ${streak} jour${streak > 1 ? 's' : ''} de suite` : ''}</div>
        </div>
        <div class="pc-actions">
            <button type="button" class="pc-btn" data-open="profile">🎨 VAISSEAUX &amp; BADGES</button>
            ${online ? (acc
                ? '<button type="button" class="pc-btn" data-open="account">☁️ MON COMPTE</button>'
                : '<button type="button" class="pc-btn cloud" data-open="account">☁️ SAUVEGARDER MA PROGRESSION</button>') : ''}
        </div>`;
}
if (pilotCard) pilotCard.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    btn.blur();
    if (btn.dataset.open === 'profile') openProfile();
    else if (typeof openAccount === 'function') openAccount();
});

function renderProfile() {
    if (!profileContent) return;
    const lvl = pilotLevel();
    const from = xpForLevel(lvl), to = xpForLevel(lvl + 1);
    const pct = Math.round(100 * (progress.xp - from) / (to - from));
    const streak = currentStreak();

    let html = `
        <div class="pf-level">
            <div class="pf-title">PILOTE NIVEAU ${lvl}</div>
            <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
            <div class="pf-sub">${progress.xp - from} / ${to - from} XP avant le niveau ${lvl + 1}
                · ${progress.totals.words} mots détruits · ${progress.totals.games} parties</div>
            <div class="pf-sub">🔥 Série du défi du jour : <b>${streak}</b> jour${streak > 1 ? 's' : ''} (record : ${progress.streak.best})</div>
        </div>
        <div class="section-title"><span>VAISSEAUX</span></div>
        <div class="pf-ships">`;
    SHIPS.forEach(s => {
        const unlocked = s.level <= lvl;
        const active = progress.ship === s.id;
        html += `<button type="button" class="pf-ship${unlocked ? '' : ' locked'}${active ? ' active' : ''}" data-ship="${s.id}" ${unlocked ? '' : 'disabled'}>
            <span class="pf-ship-img${s.filter === 'rainbow' ? ' ship-rainbow' : ''}" style="${s.filter !== 'rainbow' && s.filter !== 'none' ? 'filter:' + s.filter : ''}">${shipPreviewSvg('pf-' + s.id)}</span>
            <span class="pf-ship-name">${s.name}</span>
            <span class="pf-ship-lock">${unlocked ? (active ? '✔ CHOISI' : 'CHOISIR') : '🔒 niveau ' + s.level}</span>
        </button>`;
    });
    html += `</div><div class="section-title gold"><span>BADGES ${Object.keys(progress.badges).length}/${BADGES.length}</span></div><div class="pf-badges">`;
    BADGES.forEach(b => {
        const got = progress.badges[b.id];
        html += `<div class="pf-badge${got ? ' got' : ''}" title="${b.desc}">
            <span class="pf-badge-icon">${got ? b.icon : '🔒'}</span>
            <span class="pf-badge-name">${b.name}</span>
            <span class="pf-badge-desc">${b.desc}</span>
        </div>`;
    });
    html += '</div>';
    profileContent.innerHTML = html;
    profileContent.querySelectorAll('.pf-ship:not(.locked)').forEach(btn => btn.addEventListener('click', () => {
        progress.ship = btn.dataset.ship;
        saveProgress();
        applyShip();
        refreshPilotSummary();
        renderProfile();
    }));
}

function openProfile() {
    if (!profileScreen || isPlaying) return;
    renderProfile();
    profileScreen.classList.remove('hidden');
}
function closeProfile() { if (profileScreen) profileScreen.classList.add('hidden'); }

const profileClose = document.getElementById('profile-close');
if (profileClose) profileClose.addEventListener('click', closeProfile);
document.querySelectorAll('[data-close="profile"]').forEach(b => b.addEventListener('click', closeProfile));
if (profileScreen) profileScreen.addEventListener('click', (e) => { if (e.target === profileScreen) closeProfile(); });
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileScreen && !profileScreen.classList.contains('hidden')) closeProfile();
});

refreshPilotSummary();
applyShip();
