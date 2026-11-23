// ==========================================
// Alpha Strike — background.js : fond spatial animé
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

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
