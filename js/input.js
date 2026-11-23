// ==========================================
// Alpha Strike — input.js : clavier et ciblage des mots
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// ==========================================
// 6. ÉVÉNEMENTS CLAVIER (CIBLAGE SANS CONFLIT DE LETTRES)
// ==========================================
// Clavier physique
window.addEventListener('keydown', (e) => {
    // (les accents ^ et ¨ sont des "touches mortes" : la lettre accentuée arrive à la touche suivante, ex. "ê")
    if (!isPlaying || isPaused || e.key.length !== 1) return;
    let key = e.key.toUpperCase();
    // mode simple : é = E · mode avancé : seuls É et È comptent comme accents (ê = E, à = A...)
    if (effectiveDifficulty() !== 'avance' || !ACCENT_KEYS.includes(key)) key = stripAccents(key);
    handleLetter(key);
});

// Dictée : la lettre tapée apparaît à la place du "_"
function revealLetter(letterElement, word, index) {
    if (gameType === 'dictee' && letterElement) letterElement.textContent = word.text[index];
}

// Traite une lettre tapée (clavier physique OU clavier virtuel).
// Renvoie true si la lettre était correcte.
// auto = true : tir automatique du laser double (ne compte ni dans les stats ni dans le combo)
function handleLetter(keyPressed, auto = false) {
    if (!isPlaying || isPaused || !playerShip) return false;
    const shipRect = localRect(playerShip);
    const shipX = shipRect.left + shipRect.width / 2;
    const shipY = shipRect.top + shipRect.height / 2;
    let toucheCorrecte = false;
    // Lettre attendue (si un mot est déjà commencé) : sert à savoir quelle lettre a été ratée
    const expectedBefore = targetedWord ? targetedWord.text[targetedWord.typedIndex] : null;

    if (targetedWord) {
        // --- CAS 1 : UN MOT EST DÉJÀ STRICTEMENT VERROUILLÉ ---
        const expectedLetter = targetedWord.text[targetedWord.typedIndex];
        if (keyPressed === expectedLetter) {
            toucheCorrecte = true;
            const letterElement = getLetter(targetedWord, targetedWord.typedIndex);
            revealLetter(letterElement, targetedWord, targetedWord.typedIndex);
            if (letterElement) {
                letterElement.className = 'letter active';
                const letterRect = localRect(letterElement);
                createLaser(shipX, shipY, letterRect.left + letterRect.width / 2, letterRect.top + letterRect.height / 2, targetedWord, targetedWord.typedIndex);
            }
            targetedWord.typedIndex++;

            if (targetedWord.typedIndex === targetedWord.text.length) {
                targetedWord = null;
            }
        }
    } else {
        // --- CAS 2 : CHOIX LIBRE (AVEC GESTION DES DOUBLONS DE LETTRES) ---
        // Étape 1 : On cherche en priorité si on avait déjà commencé un mot qui attend CETTE lettre exacte
        for (let w of activeWords) {
            if (w.typedIndex > 0 && w.text[w.typedIndex] === keyPressed) {
                toucheCorrecte = true;
                targetedWord = w; // On reverrouille ce mot en cours
                break;
            }
        }

        // Étape 2 : Si aucun mot en cours ne correspond, on cherche un NOUVEAU mot qui commence par cette lettre
        if (!toucheCorrecte) {
            for (let w of activeWords) {
                if (w.typedIndex === 0 && w.text[0] === keyPressed) {
                    toucheCorrecte = true;
                    targetedWord = w; // On verrouille ce nouveau mot
                    break;
                }
            }
        }

        // Étape 3 : Si on a trouvé le bon mot (nouveau ou en cours), on applique les effets et le tir
        if (toucheCorrecte && targetedWord) {
            // Nettoyage visuel des indices d'aide des autres mots
            activeWords.forEach(word => { 
                if (word !== targetedWord) { 
                    const currentLetter = getLetter(word, word.typedIndex);
                    if (currentLetter) currentLetter.className = 'letter'; 
                } 
            });

            // On récupère la lettre qu'on vient de taper (à son indice actuel)
            const currentIndex = targetedWord.typedIndex;
            const letterElement = getLetter(targetedWord, currentIndex);
            revealLetter(letterElement, targetedWord, currentIndex);
            if (letterElement) {
                letterElement.className = 'letter active';
                const letterRect = localRect(letterElement);
                createLaser(shipX, shipY, letterRect.left + letterRect.width / 2, letterRect.top + letterRect.height / 2, targetedWord, currentIndex);
            }
            targetedWord.typedIndex++;

            // Si le mot est fini dès la première lettre (mots de 1 lettre)
            if (targetedWord.typedIndex === targetedWord.text.length) {
                targetedWord = null;
            }
        }
    }

    // 🔫 Laser double : la lettre suivante du mot part toute seule
    if (auto) return toucheCorrecte;
    if (toucheCorrecte && isDoubleLaser() && targetedWord) {
        handleLetter(targetedWord.text[targetedWord.typedIndex], true);
    }

    // 📊 Statistiques (précision, lettres ratées)
    if (toucheCorrecte) { stats.correct++; recordLetter(keyPressed, true); }
    else {
        stats.wrong++;
        recordLetter(expectedBefore, false);
        if (gameType === 'dictee' && targetedWord) speakWord(targetedWord.text); // on réécoute le mot
    }

    // --- GESTION DU MULTIPLICATEUR DE COMBO ---
    const previousMultiplier = scoreMultiplier;
    const previousCombo = currentCombo;

    if (toucheCorrecte) {
        currentCombo++;
        if (currentCombo >= 30) scoreMultiplier = 4;
        else if (currentCombo >= 20) scoreMultiplier = 3;
        else if (currentCombo >= 10) scoreMultiplier = 2;
        else scoreMultiplier = 1;
        
        const displayElement = comboMultiplierElement || streakElement;
        if (displayElement) {
            displayElement.innerText = `x${scoreMultiplier}`;
            if (scoreMultiplier === 4) displayElement.style.color = "#f43f5e";
            else if (scoreMultiplier === 3) displayElement.style.color = "#eab308";
            else if (scoreMultiplier === 2) displayElement.style.color = "#a855f7";
            else displayElement.style.color = "#22d3ee";
        }
        // 🔥 Le multiplicateur vient de monter
        if (scoreMultiplier > previousMultiplier) {
            showFloatingText(shipX, shipY - 90, `COMBO x${scoreMultiplier} !`, `combo-up combo-x${scoreMultiplier}`);
            playComboSound(scoreMultiplier);
        }
    } else {
        // 💔 Combo cassé (seulement si on avait un vrai combo en cours)
        if (previousCombo >= 10) showFloatingText(shipX, shipY - 90, 'COMBO PERDU', 'combo-lost');
        playErrorSound();
        currentCombo = 0; scoreMultiplier = 1;
        const displayElement = comboMultiplierElement || streakElement;
        if (displayElement) { displayElement.innerText = "x1"; displayElement.style.color = "#64748b"; }
    }
    updateHudBars();
    return toucheCorrecte;
}

