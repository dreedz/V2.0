// ==========================================
// Alpha Strike — account.js : compte joueur (optionnel) pour garder sa progression en ligne
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================
// Pseudo + mot de passe, sans e-mail. Ce qui est sauvegardé : XP, badges, vaisseau,
// série de jours, fantômes et lettres ratées (mode entraînement).
// Les fonctions côté serveur sont dans supabase/comptes.sql.

const ACCOUNT_KEY = 'typing_shooter_account';
let account = null; // { name, token } quand on est connecté
try {
    const a = JSON.parse(readStore(ACCOUNT_KEY));
    if (a && a.name && a.token) account = a;
} catch (e) { account = null; }

const accountBox = document.getElementById('account-box');
let cloudTimer = null;
let cloudBusy = null;   // synchronisation en cours (pour ne pas en lancer deux à la fois)
let cloudState = '';    // 'saving' | 'saved' | 'offline'
let accountMsg = '';

const accountRpc = (fn, body) =>
    onlineFetch('rpc/' + fn, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json());

function networkMessage(e) {
    return /HTTP 404/.test(String(e && e.message))
        ? '⚠️ Les comptes ne sont pas encore activés sur le serveur.'
        : '⚠️ Pas de connexion internet ? Réessaie dans un moment.';
}

// Ce qu'on envoie au serveur
const cloudPayload = () => ({ v: 1, progress, letters: loadLetterStats() });

// Lettres ratées : on garde le plus grand compte de chaque lettre
function mergeLetters(a, b) {
    const out = { err: {}, ok: {} };
    [a, b].forEach(s => {
        if (!s || typeof s !== 'object') return;
        ['err', 'ok'].forEach(k => Object.entries(s[k] || {}).forEach(([l, n]) => {
            out[k][l] = Math.max(out[k][l] || 0, Number(n) || 0);
        }));
    });
    return out;
}

// Mélange la sauvegarde du compte avec ce qu'il y a sur l'appareil, puis met l'écran à jour
function applyCloud(remote, preferRemoteShip) {
    remote = remote && typeof remote === 'object' ? remote : {};
    progress = preferRemoteShip ? mergeProgress(remote.progress, progress) : mergeProgress(progress, remote.progress);
    writeStore(PROGRESS_KEY, JSON.stringify(progress));
    writeStore(LETTER_STATS_KEY, JSON.stringify(mergeLetters(loadLetterStats(), remote.letters)));
    applyShip();
    refreshPilotSummary();
    if (!isPlaying && typeof refreshModeUi === 'function') refreshModeUi();
    if (profileScreen && !profileScreen.classList.contains('hidden')) renderProfile();
}

// Synchronise : récupère le compte, fusionne, renvoie le tout. Renvoie 'ok', 'expired' ou 'offline'.
function cloudSync(preferRemoteShip = false) {
    if (!account) return Promise.resolve('expired');
    if (cloudBusy) return cloudBusy.then(() => cloudSync(preferRemoteShip));
    clearTimeout(cloudTimer);
    cloudTimer = null;
    setCloudState('saving');
    cloudBusy = (async () => {
        try {
            const token = account.token;
            const r = await accountRpc('account_load', { p_token: token });
            if (r.expired) return accountExpired();
            applyCloud(r.progress, preferRemoteShip);
            const s = await accountRpc('account_save', { p_token: token, p_progress: cloudPayload() });
            if (s.expired) return accountExpired();
            if (s.error) throw new Error(s.error);
            setCloudState('saved');
            return 'ok';
        } catch (e) {
            setCloudState('offline');
            return 'offline';
        }
    })();
    return cloudBusy.finally(() => { cloudBusy = null; });
}

// Appelée à chaque sauvegarde de la progression (fin de partie, badge, vaisseau...)
function scheduleCloudSave() {
    if (!account) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => cloudSync(false), 1500);
}

function accountExpired() {
    account = null;
    writeStore(ACCOUNT_KEY, '');
    accountMsg = 'Ta session a expiré : reconnecte-toi pour retrouver ta progression.';
    refreshPilotSummary();
    renderAccount();
    return 'expired';
}

function setCloudState(state) {
    cloudState = state;
    const el = accountBox && accountBox.querySelector('.acc-state');
    if (el) {
        el.className = 'acc-state ' + state;
        el.textContent = { saving: '⏳ sauvegarde…', saved: '✓ progression sauvegardée', offline: '⚠️ hors ligne : sauvegarde au prochain essai' }[state] || '';
    }
    refreshPilotSummary();
}

function showAccountMsg(text, good) {
    accountMsg = text;
    const el = accountBox && accountBox.querySelector('.acc-msg');
    if (el) { el.textContent = text; el.classList.toggle('good', !!good); }
}
const setFormDisabled = (off) => accountBox.querySelectorAll('button, input').forEach(el => { el.disabled = off; });

// --- Connexion / création ---
async function accountSubmit(action) {
    const nameEl = document.getElementById('acc-name');
    const passEl = document.getElementById('acc-pass');
    const pass2El = document.getElementById('acc-pass2');
    const name = cleanName(nameEl ? nameEl.value : '');
    const pass = passEl ? passEl.value : '';
    if (name.length < 2) return showAccountMsg('Écris ton pseudo (2 à 10 lettres).');
    if (pass.length < 4) return showAccountMsg('Le mot de passe doit faire au moins 4 caractères.');
    if (action === 'create' && pass2El && pass2El.value !== pass) return showAccountMsg('Les deux mots de passe ne sont pas pareils.');
    setFormDisabled(true);
    showAccountMsg(action === 'create' ? 'Création du compte…' : 'Connexion…', true);
    try {
        const r = action === 'create'
            ? await accountRpc('account_create', { p_name: name, p_password: pass, p_progress: cloudPayload() })
            : await accountRpc('account_login', { p_name: name, p_password: pass });
        if (r.error) {
            setFormDisabled(false);
            return showAccountMsg('⚠️ ' + r.error);
        }
        account = { name: r.name, token: r.token };
        writeStore(ACCOUNT_KEY, JSON.stringify(account));
        writeStore(ACCOUNT_KEY + '_seen', '1'); // cet appareil a déjà eu un compte → onglet "connexion" par défaut
        writeStore(LAST_NAME_KEY, cleanName(r.name)); // le pseudo sert aussi pour le classement
        accountMsg = action === 'create'
            ? '✅ Compte créé ! Ta progression est sauvegardée en ligne.'
            : '✅ Connecté ! Ta progression a été récupérée.';
        cloudState = 'saved';
        applyCloud(r.progress, true);
        renderAccount();
        if (action === 'login') cloudSync(true); // renvoie aussi ce qui avait été fait sur cet appareil
    } catch (e) {
        setFormDisabled(false);
        showAccountMsg(networkMessage(e));
    }
}

// --- Déconnexion : on sauvegarde, puis l'appareil repart de zéro (pratique sur un ordinateur partagé) ---
async function accountLogout() {
    const btn = accountBox.querySelector('[data-act="logout"]');
    if (btn) btn.disabled = true;
    const result = await cloudSync(false);
    if (result === 'offline') {
        if (btn) btn.disabled = false;
        return showAccountMsg('⚠️ Impossible de sauvegarder (pas d\'internet ?) : réessaie avant de te déconnecter.');
    }
    if (account) accountRpc('account_logout', { p_token: account.token }).catch(() => {});
    account = null;
    cloudState = '';
    accountTab = 'login';
    writeStore(ACCOUNT_KEY, '');
    progress = normalizeProgress({});
    writeStore(PROGRESS_KEY, JSON.stringify(progress));
    writeStore(LETTER_STATS_KEY, '');
    applyShip();
    refreshPilotSummary();
    if (typeof refreshModeUi === 'function') refreshModeUi();
    accountMsg = result === 'ok' ? 'Déconnecté. Ta progression t\'attend dans ton compte.' : accountMsg;
    renderAccount();
}

// ==========================================
// ☁️ ÉCRAN "MON COMPTE"
// ==========================================
const accountScreen = document.getElementById('account-screen');
let accountTab = readStore(ACCOUNT_KEY + '_seen') === '1' ? 'login' : 'create';

function renderAccount() {
    if (!accountBox) return;
    const good = accountMsg.startsWith('✅') || accountMsg.startsWith('Déconnecté');
    const msg = `<div class="acc-msg${good ? ' good' : ''}">${accountMsg}</div>`;

    if (account) {
        accountBox.innerHTML = `
            <div class="acc-logged">
                <div class="acc-avatar">☁️</div>
                <div class="acc-who">Connecté en tant que<br><b>${cleanName(account.name)}</b></div>
                <div class="acc-state"></div>
            </div>
            ${msg}
            <ul class="acc-perks">
                <li>💾 Ta progression est sauvegardée <b>automatiquement</b> après chaque partie.</li>
                <li>📱 Sur un autre ordinateur ou un téléphone : ouvre ☁️ et connecte-toi avec le même pseudo et mot de passe.</li>
            </ul>
            <div class="acc-actions">
                <button type="button" class="primary-btn acc-done" data-act="close">↩ RETOUR AU MENU</button>
                <button type="button" class="acc-btn small" data-act="logout">SE DÉCONNECTER</button>
            </div>
            <p class="acc-note">En te déconnectant, cet appareil repart de zéro. Ta progression reste dans ton compte.</p>`;
        setCloudState(cloudState || 'saved');
        accountBox.querySelector('[data-act="logout"]').addEventListener('click', accountLogout);
        accountBox.querySelector('[data-act="close"]').addEventListener('click', closeAccount);
        return;
    }

    const create = accountTab === 'create';
    accountBox.innerHTML = `
        <p class="acc-lead">Garde ta progression et retrouve-la sur <b>n'importe quel appareil</b> (ordinateur, tablette, téléphone).
            C'est gratuit et facultatif : tu peux aussi jouer sans compte.</p>
        <ul class="acc-perks grid">
            <li>⭐ ton niveau et ton XP</li><li>🏅 tes badges</li><li>🚀 tes vaisseaux</li><li>🔥 ta série de jours</li>
        </ul>
        <div class="acc-tabs" role="tablist">
            <button type="button" role="tab" class="acc-tab${create ? ' active' : ''}" data-tab="create" aria-selected="${create}">✨ CRÉER UN COMPTE</button>
            <button type="button" role="tab" class="acc-tab${create ? '' : ' active'}" data-tab="login" aria-selected="${!create}">🔑 J'AI DÉJÀ UN COMPTE</button>
        </div>
        <form class="acc-form" autocomplete="on">
            <label class="acc-field">PSEUDO
                <input id="acc-name" class="acc-input" name="username" autocomplete="username" maxlength="10"
                    placeholder="ex. PAUL" autocapitalize="characters" autocorrect="off" spellcheck="false">
            </label>
            <label class="acc-field">MOT DE PASSE
                <input id="acc-pass" class="acc-input" name="password" type="password" maxlength="72"
                    autocomplete="${create ? 'new-password' : 'current-password'}" placeholder="4 caractères minimum">
            </label>
            ${create ? `<label class="acc-field">RETAPE LE MOT DE PASSE
                <input id="acc-pass2" class="acc-input" name="password2" type="password" maxlength="72" autocomplete="new-password">
            </label>
            <p class="acc-note">🔑 Pas besoin d'e-mail. <b>Note bien ton mot de passe</b> : sans e-mail, on ne peut pas le retrouver tout seul.</p>` : ''}
            <button type="submit" class="primary-btn acc-submit">${create ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}</button>
        </form>
        ${msg}`;

    const nameEl = document.getElementById('acc-name');
    nameEl.value = cleanName(readStore(LAST_NAME_KEY));
    nameEl.addEventListener('input', () => {
        const v = nameEl.value.toUpperCase().replace(/[^A-Z0-9ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ _.\-]/g, '').slice(0, 10);
        if (v !== nameEl.value) nameEl.value = v;
    });
    accountBox.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); accountSubmit(accountTab); });
    accountBox.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
        if (accountTab === b.dataset.tab) return;
        const keepName = nameEl.value;
        accountTab = b.dataset.tab;
        accountMsg = '';
        renderAccount();
        document.getElementById('acc-name').value = keepName;
    }));
}

function openAccount() {
    if (!accountScreen || isPlaying || !onlineEnabled()) return;
    if (!account && !accountMsg.startsWith('Ta session')) accountMsg = '';
    renderAccount();
    accountScreen.classList.remove('hidden');
    if (!account && !isTouchDevice) setTimeout(() => { const el = document.getElementById(accountTab === 'login' && document.getElementById('acc-name').value ? 'acc-pass' : 'acc-name'); if (el) el.focus(); }, 50);
}
function closeAccount() {
    if (!accountScreen) return;
    accountScreen.classList.add('hidden');
    if (account) accountMsg = '';
}
const accountClose = document.getElementById('account-close');
if (accountClose) accountClose.addEventListener('click', closeAccount);
if (accountScreen) accountScreen.addEventListener('click', (e) => { if (e.target === accountScreen) closeAccount(); });
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && accountScreen && !accountScreen.classList.contains('hidden')) closeAccount();
});

// Au démarrage (et quand on revient sur l'onglet) : on récupère ce qui a été fait sur les autres appareils
if (account) cloudSync(true);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && account && !isPlaying) cloudSync(true);
});
refreshPilotSummary();
