// ==========================================
// Alpha Strike — effects.js : effets visuels
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 3. EFFETS VISUELS (JUICE)
// ==========================================
function triggerScreenShake() {
    if (!container) return;
    gameFrame.classList.remove('shake-active');
    void gameFrame.offsetWidth; 
    gameFrame.classList.add('shake-active');
    setTimeout(() => { gameFrame.classList.remove('shake-active'); }, 200);
}

function createExplosion(x, y, color = '#f43f5e') {
    if (!container) return;
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 8px ${color}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 20;
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        particle.style.setProperty('--mx', `${moveX}px`);
        particle.style.setProperty('--my', `${moveY}px`);
        container.appendChild(particle);

        setTimeout(() => {
            if (particle && container.contains(particle)) container.removeChild(particle);
        }, 400);
    }
}
