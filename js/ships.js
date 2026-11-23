// ==========================================
// Alpha Strike — ships.js : les vaisseaux à débloquer (un dessin différent pour chacun)
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================
// Chaque vaisseau est dessiné dans un carré de 80 × 100 (le nez en haut, les réacteurs en bas).
// Classes utiles pour les animations (style.css) : "flame" / "flame-2" (flammes), "nav-light" (feux).

const SHIPS = [
    { id: 'cyan',    name: 'Faucon bleu',      level: 1,  glow: '56, 189, 248',  desc: 'Le chasseur des débutants' },
    { id: 'vert',    name: 'Comète verte',     level: 2,  glow: '74, 222, 128',  desc: 'Éclaireur léger et fin' },
    { id: 'rubis',   name: 'Fusée rubis',      level: 3,  glow: '248, 113, 113', desc: 'Fusée à l\'ancienne, gros réacteur' },
    { id: 'violet',  name: 'Ombre violette',   level: 5,  glow: '192, 132, 252', desc: 'Aile furtive en triangle' },
    { id: 'or',      name: 'Étoile d\'or',     level: 8,  glow: '251, 191, 36',  desc: 'Chasseur lourd à 3 réacteurs' },
    { id: 'rose',    name: 'Néon rose',        level: 12, glow: '244, 114, 182', desc: 'Intercepteur à anneau néon' },
    { id: 'argent',  name: 'Aigle d\'argent',  level: 16, glow: '147, 197, 253', desc: 'Grandes ailes, 3 réacteurs' },
    { id: 'rainbow', name: 'Star Cruiser',     level: 20, glow: '168, 85, 247',  desc: 'Le croiseur ultime : 4 réacteurs, noyau d\'énergie' }
];

// Petits morceaux réutilisés
const svgGrad = (id, stops, vertical = false) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">` +
    stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('') +
    '</linearGradient>';
const svgRadial = (id, stops) =>
    `<radialGradient id="${id}" cx="0.4" cy="0.35" r="0.7">` +
    stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('') +
    '</radialGradient>';
const flameGrad = (id, mid, end) => svgGrad(id, [[0, '#ffffff'], [0.25, mid], [0.6, end, 0.8], [1, end, 0]], true);

// Dessin d'un vaisseau. "suffix" rend les identifiants uniques (plusieurs dessins sur la même page).
function shipSvg(id, suffix) {
    const u = (name) => `${name}-${suffix}`;
    const url = (name) => `url(#${u(name)})`;
    let defs = '', body = '';

    switch (id) {
    case 'vert': // 🟢 Éclaireur : fin, ailes en flèche, 1 réacteur
        defs = svgGrad(u('hull'), [[0, '#14532d'], [0.45, '#86efac'], [0.55, '#f0fdf4'], [1, '#15803d']])
            + svgGrad(u('wing'), [[0, '#4ade80'], [1, '#14532d']], true)
            + svgRadial(u('cock'), [[0, '#f7fee7'], [0.35, '#a3e635'], [1, '#1a2e05']])
            + flameGrad(u('flame'), '#bef264', '#22c55e');
        body = `
            <path class="flame" d="M 35 80 Q 40 104 45 80 Z" fill="${url('flame')}"/>
            <path d="M 40 34 L 72 74 L 67 80 L 45 70 L 35 70 L 13 80 L 8 74 Z" fill="${url('wing')}" stroke="#86efac" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M 62 70 L 68 76 M 18 70 L 12 76" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
            <path d="M 34 62 L 25 86 L 35 80 Z M 46 62 L 55 86 L 45 80 Z" fill="#166534" stroke="#86efac" stroke-width="1"/>
            <path d="M 40 4 C 44 18 46 36 46 58 L 45 80 L 35 80 L 34 58 C 34 36 36 18 40 4 Z" fill="${url('hull')}" stroke="#bbf7d0" stroke-width="1.2"/>
            <path d="M 40 14 L 40 76" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>
            <rect x="35" y="77" width="10" height="5" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="40" cy="30" rx="4" ry="9" fill="${url('cock')}" stroke="#15803d" stroke-width="1"/>
            <circle class="nav-light" cx="10" cy="76" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="70" cy="76" r="1.8" fill="#4ade80"/>`;
        break;

    case 'rubis': // 🔴 Fusée à l'ancienne : ailerons arrondis, hublots, gros réacteur
        defs = svgGrad(u('hull'), [[0, '#7f1d1d'], [0.45, '#fecaca'], [0.55, '#fff1f2'], [1, '#991b1b']])
            + svgGrad(u('fin'), [[0, '#ef4444'], [1, '#7f1d1d']], true)
            + svgRadial(u('win'), [[0, '#ffffff'], [0.35, '#7dd3fc'], [1, '#0c4a6e']])
            + flameGrad(u('flame'), '#fde047', '#f97316');
        body = `
            <path class="flame" d="M 30 82 Q 40 108 50 82 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 35 82 Q 40 98 45 82 Z" fill="${url('flame')}"/>
            <path d="M 29 50 C 16 58 10 72 10 88 L 30 79 Z M 51 50 C 64 58 70 72 70 88 L 50 79 Z" fill="${url('fin')}" stroke="#fca5a5" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M 40 2 C 52 14 54 34 53 56 L 51 80 L 29 80 L 27 56 C 26 34 28 14 40 2 Z" fill="${url('hull')}" stroke="#fecaca" stroke-width="1.2"/>
            <path d="M 40 2 C 46 8 49 15 51 22 L 29 22 C 31 15 34 8 40 2 Z" fill="#dc2626"/>
            <path d="M 28 66 L 52 66" stroke="#dc2626" stroke-width="3"/>
            <circle cx="40" cy="36" r="6" fill="${url('win')}" stroke="#e5e7eb" stroke-width="2"/>
            <circle cx="40" cy="52" r="3.5" fill="${url('win')}" stroke="#e5e7eb" stroke-width="1.5"/>
            <path d="M 40 70 L 40 86" stroke="#b91c1c" stroke-width="4" stroke-linecap="round"/>
            <rect x="31" y="78" width="18" height="6" rx="2" fill="#1f2937" stroke="#6b7280" stroke-width="0.8"/>
            <circle class="nav-light" cx="12" cy="86" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="68" cy="86" r="1.8" fill="#4ade80"/>`;
        break;

    case 'violet': // 🟣 Aile furtive : grand triangle plat
        defs = svgGrad(u('hull'), [[0, '#a855f7'], [1, '#2e1065']], true)
            + svgRadial(u('cock'), [[0, '#f5f3ff'], [0.35, '#c084fc'], [1, '#3b0764']])
            + flameGrad(u('flame'), '#e879f9', '#7c3aed');
        body = `
            <path class="flame" d="M 30 78 Q 33 96 36 78 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 44 78 Q 47 96 50 78 Z" fill="${url('flame')}"/>
            <path d="M 40 4 L 77 80 L 58 76 L 50 82 L 40 76 L 30 82 L 22 76 L 3 80 Z" fill="${url('hull')}" stroke="#c4b5fd" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M 40 20 L 62 70 L 40 64 L 18 70 Z" fill="#1e1b4b" opacity="0.6" stroke="#8b5cf6" stroke-width="0.8"/>
            <path d="M 40 9 L 72 76 M 40 9 L 8 76" stroke="#e879f9" stroke-width="0.9" opacity="0.75"/>
            <path d="M 28 58 L 34 52 M 52 58 L 46 52" stroke="#e879f9" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
            <path d="M 40 22 L 45 40 L 40 47 L 35 40 Z" fill="${url('cock')}" stroke="#a78bfa" stroke-width="0.8"/>
            <rect x="29.5" y="74" width="7" height="5" rx="1.5" fill="#1e1b4b" stroke="#6d28d9" stroke-width="0.8"/>
            <rect x="43.5" y="74" width="7" height="5" rx="1.5" fill="#1e1b4b" stroke="#6d28d9" stroke-width="0.8"/>
            <circle class="nav-light" cx="6" cy="78" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="74" cy="78" r="1.8" fill="#4ade80"/>`;
        break;

    case 'or': // 🟡 Chasseur lourd : 2 nacelles + 1 réacteur central, canons
        defs = svgGrad(u('hull'), [[0, '#78350f'], [0.45, '#fcd34d'], [0.55, '#fffbeb'], [1, '#b45309']])
            + svgGrad(u('wing'), [[0, '#fbbf24'], [1, '#78350f']], true)
            + svgRadial(u('cock'), [[0, '#ecfeff'], [0.35, '#38bdf8'], [1, '#0c4a6e']])
            + flameGrad(u('flame'), '#fde047', '#f97316');
        body = `
            <path class="flame" d="M 12 86 Q 16 102 20 86 Z" fill="${url('flame')}"/>
            <path class="flame" d="M 60 86 Q 64 102 68 86 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 35 82 Q 40 100 45 82 Z" fill="${url('flame')}"/>
            <path d="M 40 26 L 78 50 L 76 64 L 50 66 L 40 72 L 30 66 L 4 64 L 2 50 Z" fill="${url('wing')}" stroke="#fde68a" stroke-width="1.2" stroke-linejoin="round"/>
            <rect x="14.5" y="28" width="3" height="14" fill="#334155" stroke="#94a3b8" stroke-width="0.6"/>
            <rect x="62.5" y="28" width="3" height="14" fill="#334155" stroke="#94a3b8" stroke-width="0.6"/>
            <rect x="10" y="38" width="12" height="48" rx="6" fill="${url('hull')}" stroke="#fde68a" stroke-width="1"/>
            <rect x="58" y="38" width="12" height="48" rx="6" fill="${url('hull')}" stroke="#fde68a" stroke-width="1"/>
            <path d="M 27 52 l 1.5 3.5 3.8 .3 -2.9 2.4 .9 3.7 -3.3 -2 -3.3 2 .9 -3.7 -2.9 -2.4 3.8 -.3 z M 53 52 l 1.5 3.5 3.8 .3 -2.9 2.4 .9 3.7 -3.3 -2 -3.3 2 .9 -3.7 -2.9 -2.4 3.8 -.3 z" fill="#fffbeb"/>
            <path d="M 40 4 C 47 16 50 34 50 54 L 47 82 L 33 82 L 30 54 C 30 34 33 16 40 4 Z" fill="${url('hull')}" stroke="#fef3c7" stroke-width="1.2"/>
            <path d="M 33 62 L 47 62 M 32.5 68 L 47.5 68" stroke="#78350f" stroke-width="1" opacity="0.6"/>
            <rect x="33" y="78" width="14" height="6" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <rect x="11" y="82" width="10" height="5" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <rect x="59" y="82" width="10" height="5" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="40" cy="32" rx="5.5" ry="11" fill="${url('cock')}" stroke="#0e7490" stroke-width="1"/>
            <ellipse cx="38.3" cy="27" rx="1.6" ry="4" fill="#ffffff" opacity="0.7"/>
            <circle class="nav-light" cx="3" cy="57" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="77" cy="57" r="1.8" fill="#4ade80"/>`;
        break;

    case 'rose': // 🩷 Intercepteur à anneau néon
        defs = svgGrad(u('hull'), [[0, '#831843'], [0.45, '#f9a8d4'], [0.55, '#fdf2f8'], [1, '#9d174d']])
            + svgRadial(u('cock'), [[0, '#ffffff'], [0.35, '#f0abfc'], [1, '#4a044e']])
            + flameGrad(u('flame'), '#f9a8d4', '#db2777');
        body = `
            <path class="flame" d="M 31 80 Q 34 98 37 80 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 43 80 Q 46 98 49 80 Z" fill="${url('flame')}"/>
            <path d="M 34 40 L 10 70 L 17 72 L 34 58 Z M 46 40 L 70 70 L 63 72 L 46 58 Z" fill="${url('hull')}" stroke="#fbcfe8" stroke-width="1"/>
            <ellipse cx="40" cy="56" rx="33" ry="24" fill="none" stroke="#ec4899" stroke-width="4.5"/>
            <ellipse cx="40" cy="56" rx="33" ry="24" fill="none" stroke="#fdf2f8" stroke-width="1.2" opacity="0.9"/>
            <path d="M 9 56 L 32 56 M 48 56 L 71 56" stroke="#f9a8d4" stroke-width="3"/>
            <path d="M 40 2 C 45 14 48 30 48 52 L 47 82 L 33 82 L 32 52 C 32 30 35 14 40 2 Z" fill="${url('hull')}" stroke="#fbcfe8" stroke-width="1.2"/>
            <path d="M 40 9 L 40 76" stroke="#f0abfc" stroke-width="1.2" opacity="0.8"/>
            <rect x="30" y="77" width="8" height="5" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <rect x="42" y="77" width="8" height="5" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="40" cy="30" rx="4.5" ry="10" fill="${url('cock')}" stroke="#be185d" stroke-width="1"/>
            <circle class="nav-light" cx="7" cy="56" r="2" fill="#f43f5e"/>
            <circle class="nav-light" cx="73" cy="56" r="2" fill="#4ade80"/>`;
        break;

    case 'argent': // ⚪ Grandes ailes "plumes", 3 réacteurs
        defs = svgGrad(u('hull'), [[0, '#334155'], [0.45, '#e2e8f0'], [0.55, '#ffffff'], [1, '#475569']])
            + svgGrad(u('wing'), [[0, '#cbd5e1'], [1, '#334155']], true)
            + svgRadial(u('cock'), [[0, '#ffffff'], [0.35, '#60a5fa'], [1, '#1e3a8a']])
            + flameGrad(u('flame'), '#93c5fd', '#3b82f6');
        body = `
            <path class="flame" d="M 35 84 Q 40 104 45 84 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 25 78 Q 28 94 31 78 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 49 78 Q 52 94 55 78 Z" fill="${url('flame')}"/>
            <path d="M 40 28 L 78 44 L 74 52 L 79 57 L 72 63 L 76 70 L 56 72 L 40 78 L 24 72 L 4 70 L 8 63 L 1 57 L 6 52 L 2 44 Z" fill="${url('wing')}" stroke="#f1f5f9" stroke-width="1.1" stroke-linejoin="round"/>
            <path d="M 48 42 L 74 50 M 50 50 L 74 60 M 52 58 L 70 67 M 32 42 L 6 50 M 30 50 L 6 60 M 28 58 L 10 67" stroke="#64748b" stroke-width="0.9"/>
            <rect x="24" y="56" width="8" height="24" rx="3" fill="${url('hull')}" stroke="#e2e8f0" stroke-width="0.8"/>
            <rect x="48" y="56" width="8" height="24" rx="3" fill="${url('hull')}" stroke="#e2e8f0" stroke-width="0.8"/>
            <path d="M 40 2 C 47 14 51 32 51 54 L 48 86 L 32 86 L 29 54 C 29 32 33 14 40 2 Z" fill="${url('hull')}" stroke="#ffffff" stroke-width="1.2"/>
            <path d="M 33 60 L 47 60 M 33.5 66 L 46.5 66" stroke="#3b82f6" stroke-width="2"/>
            <rect x="34" y="82" width="12" height="5" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="40" cy="30" rx="5" ry="11" fill="${url('cock')}" stroke="#1d4ed8" stroke-width="1"/>
            <ellipse cx="38.4" cy="25" rx="1.5" ry="4" fill="#ffffff" opacity="0.7"/>
            <circle class="nav-light" cx="3" cy="45" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="77" cy="45" r="1.8" fill="#4ade80"/>`;
        break;

    case 'rainbow': { // 🌈 STAR CRUISER : blindage, 4 réacteurs, canons longs, noyau d'énergie arc-en-ciel
        const rainbow = (attr) => `<animate attributeName="${attr}" values="#67e8f9;#a855f7;#f472b6;#facc15;#4ade80;#67e8f9" dur="3s" repeatCount="indefinite"/>`;
        defs = svgGrad(u('hull'), [[0, '#1e1b4b'], [0.45, '#a5b4fc'], [0.55, '#eef2ff'], [1, '#312e81']])
            + svgGrad(u('armor'), [[0, '#6366f1'], [1, '#1e1b4b']], true)
            + svgRadial(u('cock'), [[0, '#ffffff'], [0.35, '#67e8f9'], [1, '#164e63']])
            + flameGrad(u('flame'), '#67e8f9', '#a855f7');
        body = `
            <path class="flame" d="M 19 86 Q 22 103 25 86 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 30 88 Q 33 106 36 88 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 44 88 Q 47 106 50 88 Z" fill="${url('flame')}"/>
            <path class="flame" d="M 55 86 Q 58 103 61 86 Z" fill="${url('flame')}"/>
            <path d="M 40 34 L 79 62 L 78 76 L 62 80 L 40 84 L 18 80 L 2 76 L 1 62 Z" fill="${url('armor')}" stroke="#818cf8" stroke-width="1.1" stroke-linejoin="round"/>
            <path d="M 44 44 L 74 66 M 36 44 L 6 66" stroke="#67e8f9" stroke-width="1.2" opacity="0.9">${rainbow('stroke')}</path>
            <path d="M 40 16 L 60 34 L 58 40 L 40 36 L 22 40 L 20 34 Z" fill="${url('armor')}" stroke="#a5b4fc" stroke-width="1"/>
            <rect x="3" y="38" width="3.5" height="32" rx="1.2" fill="#334155" stroke="#94a3b8" stroke-width="0.6"/>
            <rect x="73.5" y="38" width="3.5" height="32" rx="1.2" fill="#334155" stroke="#94a3b8" stroke-width="0.6"/>
            <rect x="3.75" y="35" width="2" height="4" fill="#67e8f9">${rainbow('fill')}</rect>
            <rect x="74.25" y="35" width="2" height="4" fill="#67e8f9">${rainbow('fill')}</rect>
            <rect x="18" y="62" width="8" height="25" rx="3" fill="${url('hull')}" stroke="#c7d2fe" stroke-width="0.8"/>
            <rect x="54" y="62" width="8" height="25" rx="3" fill="${url('hull')}" stroke="#c7d2fe" stroke-width="0.8"/>
            <rect x="29" y="68" width="8" height="21" rx="2" fill="${url('hull')}" stroke="#c7d2fe" stroke-width="0.8"/>
            <rect x="43" y="68" width="8" height="21" rx="2" fill="${url('hull')}" stroke="#c7d2fe" stroke-width="0.8"/>
            <path d="M 40 1 C 48 12 53 30 53 52 L 51 72 L 46 84 L 34 84 L 29 72 L 27 52 C 27 30 32 12 40 1 Z" fill="${url('hull')}" stroke="#e0e7ff" stroke-width="1.2"/>
            <path d="M 31 46 L 49 46 M 30 66 L 50 66 M 32 72 L 48 72" stroke="#312e81" stroke-width="1" opacity="0.7"/>
            <circle cx="40" cy="56" r="7" fill="#1e1b4b" stroke="#a5b4fc" stroke-width="1"/>
            <circle cx="40" cy="56" r="4.5" fill="#67e8f9">${rainbow('fill')}</circle>
            <circle cx="40" cy="56" r="2" fill="#ffffff" opacity="0.9"/>
            <ellipse cx="40" cy="27" rx="4.5" ry="10" fill="${url('cock')}" stroke="#4338ca" stroke-width="1"/>
            <ellipse cx="38.6" cy="22" rx="1.4" ry="3.6" fill="#ffffff" opacity="0.75"/>
            <circle class="nav-light" cx="2" cy="70" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="78" cy="70" r="1.8" fill="#4ade80"/>`;
        break;
    }

    default: // 🔵 Faucon bleu (le vaisseau de départ)
        defs = svgGrad(u('hull'), [[0, '#0c4a6e'], [0.45, '#7dd3fc'], [0.55, '#e0f2fe'], [1, '#0369a1']])
            + svgGrad(u('wing'), [[0, '#38bdf8'], [1, '#0c4a6e']], true)
            + svgRadial(u('cock'), [[0, '#ecfeff'], [0.35, '#22d3ee'], [1, '#083344']])
            + flameGrad(u('flame'), '#67e8f9', '#a855f7');
        body = `
            <path class="flame" d="M 29 78 Q 32.5 100 36 78 Z" fill="${url('flame')}"/>
            <path class="flame flame-2" d="M 44 78 Q 47.5 100 51 78 Z" fill="${url('flame')}"/>
            <path d="M 40 30 L 73 66 L 74 78 L 54 72 L 40 75 L 26 72 L 6 78 L 7 66 Z" fill="${url('wing')}" stroke="#7dd3fc" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M 18 66 L 30 56 M 62 66 L 50 56" stroke="#bae6fd" stroke-width="1" opacity="0.5"/>
            <path d="M 12 72 L 24 68 M 68 72 L 56 68" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
            <rect x="4.5" y="50" width="4" height="22" rx="1.5" fill="#334155" stroke="#94a3b8" stroke-width="0.8"/>
            <rect x="71.5" y="50" width="4" height="22" rx="1.5" fill="#334155" stroke="#94a3b8" stroke-width="0.8"/>
            <rect x="5.5" y="47" width="2" height="4" fill="#f43f5e"/>
            <rect x="72.5" y="47" width="2" height="4" fill="#f43f5e"/>
            <path d="M 40 2 C 46 16 50 34 50 56 L 48 77 L 32 77 L 30 56 C 30 34 34 16 40 2 Z" fill="${url('hull')}" stroke="#bae6fd" stroke-width="1.2"/>
            <path d="M 40 10 L 40 72" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>
            <path d="M 33 60 L 47 60 M 32.5 66 L 47.5 66" stroke="#0c4a6e" stroke-width="1" opacity="0.6"/>
            <rect x="28.5" y="74" width="8" height="6" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <rect x="43.5" y="74" width="8" height="6" rx="1.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="40" cy="34" rx="5.5" ry="12" fill="${url('cock')}" stroke="#0e7490" stroke-width="1"/>
            <ellipse cx="38.3" cy="29" rx="1.6" ry="4" fill="#ffffff" opacity="0.7"/>
            <circle class="nav-light" cx="8" cy="78" r="1.8" fill="#f43f5e"/>
            <circle class="nav-light" cx="72" cy="78" r="1.8" fill="#4ade80"/>`;
    }
    return `<svg viewBox="0 0 80 100" width="100%" height="100%" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}
