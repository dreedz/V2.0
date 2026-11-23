// ==========================================
// Alpha Strike — sw.js : "service worker" de l'application installable
// ==========================================
// Rôle : garder une copie des fichiers du jeu pour pouvoir jouer SANS connexion.
// Stratégie "réseau d'abord" : avec internet, on prend toujours la dernière version
// (donc les mises à jour arrivent tout de suite) ; sans internet, on utilise la copie.
// Le classement en ligne (Supabase) n'est jamais mis en cache.

const CACHE = 'alpha-strike-v1';
const CORE_FILES = [
    './', 'index.html', 'style.css', 'manifest.webmanifest',
    'js/words.js', 'js/config.js', 'js/voice.js', 'js/audio.js', 'js/effects.js',
    'js/leaderboard.js', 'js/menu.js', 'js/game.js', 'js/input.js', 'js/pause.js',
    'js/mobile.js', 'js/background.js',
    'icons/icon-192.png', 'icons/icon-512.png'
];

// Installation : on met de côté les fichiers indispensables
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

// Activation : on supprime les anciennes copies
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET') return;
    const sameSite = url.origin === self.location.origin;
    const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
    if (!sameSite && !fonts) return; // ex. classement en ligne : toujours en direct

    event.respondWith(
        fetch(req)
            .then(res => {
                // On garde une copie à jour (sans le "?v=..." anti-cache, pour la retrouver hors ligne)
                // (seulement les réponses complètes : pas les morceaux de fichiers audio "206")
                if (res && (res.status === 200 || res.type === 'opaque')) {
                    const copy = res.clone();
                    const key = sameSite ? url.origin + url.pathname : req.url;
                    caches.open(CACHE).then(cache => cache.put(key, copy)).catch(() => {});
                }
                return res;
            })
            .catch(() =>
                caches.match(sameSite ? url.origin + url.pathname : req.url)
                    .then(hit => hit || caches.match(req, { ignoreSearch: true }))
                    .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
            )
    );
});
