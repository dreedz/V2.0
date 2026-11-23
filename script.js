// ==========================================
// 1. CONFIGURATION & VARIABLES GLOBALES
// ==========================================
// Le "monde" du jeu (zoomable) : mots, lasers, vaisseau, menus...
const container = document.getElementById('game-world') || document.getElementById('game-container');
// Le cadre extérieur (non zoomé) : c'est lui qui tremble lors des explosions
const gameFrame = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const streakElement = document.getElementById('streak');
const comboMultiplierElement = document.getElementById('combo-multiplier');
const highScoreElement = document.getElementById('high-score');
const playerShip = document.getElementById('player-ship');
const gameOverScreen = document.getElementById('game-over-screen');
const screenTitle = document.getElementById('screen-title');
const screenStats = document.getElementById('screen-stats');
const restartBtn = document.getElementById('restart-btn');
const levelProgressElement = document.getElementById('level-progress');
const comboProgressElement = document.getElementById('combo-progress');
const levelBanner = document.getElementById('level-banner');
const shieldLine = document.getElementById('shield-line');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const pauseScoreElement = document.getElementById('pause-score');
const pauseLevelElement = document.getElementById('pause-level');
const countdownElement = document.getElementById('countdown');
const modeBtn = document.getElementById('mode-btn');
const menuHint = document.getElementById('menu-hint');
const howTo = document.getElementById('how-to');
const virtualKeyboard = document.getElementById('virtual-keyboard');

// Contenu d'origine du menu (pour y revenir depuis la pause)
const initialTitle = screenTitle ? screenTitle.innerHTML : '';
const initialStats = screenStats ? screenStats.innerHTML : '';

// 📖 Dictionnaire (sans accents). Les doublons éventuels sont retirés automatiquement.
const wordList = [...new Set([
    // Animaux
    "RAT", "COQ", "RENARD", "FOURMI", "CHEVAL", "CHIEN", "GIRAFE", "REQUIN", "SOURIS", "OISEAU",
    "SINGE", "TIGRE", "LION", "OURS", "LAPIN", "MOUTON", "CANARD", "DAUPHIN", "BALEINE", "PANDA",
    "CHAT", "LOUP", "VACHE", "COCHON", "POULE", "ANE", "BICHE", "CERF", "ZEBRE", "HIBOU",
    "AIGLE", "CORBEAU", "MERLE", "PIGEON", "MOUCHE", "ABEILLE", "GUEPE", "ARAIGNEE", "ESCARGOT", "LIMACE",
    "CRABE", "HOMARD", "POULPE", "MEDUSE", "PHOQUE", "MORSE", "LOUTRE", "CASTOR", "HERISSON", "TAUPE",
    "ECUREUIL", "KOALA", "KANGOUROU", "GORILLE", "JAGUAR", "PANTHERE", "GUEPARD", "LEOPARD", "ELEPHANT", "RHINOCEROS",
    "HYENE", "CHAMEAU", "LAMA", "YACK", "BISON", "TORTUE", "LEZARD", "SERPENT", "CROCODILE", "IGUANE",
    "PERROQUET", "PINGOUIN", "MANCHOT", "FLAMANT", "CYGNE", "OIE", "DINDE", "AUTRUCHE", "PAON", "MOUETTE",
    "NARVAL", "ORQUE", "THON", "SAUMON", "TRUITE", "VAUTOUR", "WAPITI", "KETCHUP", "ZEBU",
    "KIWI", "OURSON", "CHATON", "POUSSIN", "VEAU", "AGNEAU", "GRENOUILLE", "TETARD", "PAPILLON", "CHENILLE",
    // Nature et météo
    "DESERT", "JUNGLE", "FLEUVE", "OCEAN", "NATURE", "ANIMAL", "PLANTE", "FORET", "MER", "LAC",
    "ILE", "RIVIERE", "CASCADE", "PLAGE", "SABLE", "ROCHER", "CAILLOU", "GROTTE", "COLLINE", "VALLEE",
    "PRAIRIE", "ARBRE", "FEUILLE", "BRANCHE", "RACINE", "FLEUR", "ROSE", "TULIPE", "HERBE", "MOUSSE",
    "SOLEIL", "LUNE", "NUAGE", "PLUIE", "NEIGE", "ORAGE", "ECLAIR", "TONNERRE", "VENT", "BRUME",
    "GLACE", "GIVRE", "ARC", "AUBE", "NUIT", "JOUR", "MATIN", "SOIR", "HIVER", "ETE",
    "AUTOMNE", "PRINTEMPS", "SAISON", "TEMPETE", "TORNADE", "OURAGAN", "VAGUE", "MAREE", "ICEBERG", "GLACIER",
    // Espace
    "ESPACE", "PLANETE", "ETOILE", "FUSEE", "MOTEUR", "VOLCAN", "MONTAGNE", "CAMPAGNE", "UNIVERS", "GALAXIE",
    "ASTEROIDE", "COMETE", "ORBITE", "SATELLITE", "COSMOS", "ASTRONAUTE", "NAVETTE", "CRATERE", "METEORE", "NEBULEUSE",
    "MARS", "VENUS", "JUPITER", "SATURNE", "URANUS", "NEPTUNE", "MERCURE", "TERRE", "PLUTON", "SIRIUS",
    "ALIEN", "OVNI", "RADAR", "SIGNAL", "LASER", "PLASMA", "ENERGIE", "BOUCLIER", "CAPSULE", "STATION",
    "PILOTE", "COCKPIT", "HUBLOT", "ANTENNE", "TELESCOPE", "GRAVITE", "ECLIPSE", "QUASAR", "PULSAR", "ZENITH",
    // École
    "LIVRE", "COURS", "TEXTE", "CODE", "ROBOT", "CLASSE", "ECOLE", "CAHIER", "CRAYON", "PAPIER",
    "DESSIN", "DICTEE", "REGLE", "BUREAU", "LECON", "CALCUL", "LOGIQUE", "SCIENCE", "HISTOIRE",
    "LECTURE", "ECRITURE", "FENETRE", "TABLEAU", "COMPTEUR", "EXERCICE", "GYMNASE", "JEUNESSE",
    "GOMME", "STYLO", "FEUTRE", "TROUSSE", "CARTABLE", "CISEAUX", "COLLE", "EQUERRE", "COMPAS", "ATLAS",
    "MOT", "LETTRE", "PHRASE", "VERBE", "NOM", "CHIFFRE", "NOMBRE", "ADDITION", "QUIZ", "QUESTION",
    "REPONSE", "DEVOIR", "RECREATION", "MAITRE", "ELEVE", "AMI", "COPAIN", "CANTINE", "SONNERIE", "DIPLOME",
    // Aventure et fantastique
    "JEU", "OR", "ROI", "PIRATE", "NAVIRE", "MAGIE", "DRAGON", "DONJON", "MONSTRE", "ZOMBIE",
    "FANTOME", "SORCIER", "TRESOR", "CHATEAU", "CHASSEUR", "BOUSSOLE", "SQUELETTE", "CHEVALIER",
    "LEGENDE", "MYSTERE", "VICTOIRE", "COMBAT", "DEFENSE", "MISSION", "TACTIQUE", "COURAGE",
    "REINE", "PRINCE", "PRINCESSE", "FEE", "ELFE", "NAIN", "GEANT", "TROLL", "OGRE", "GOBELIN",
    "EPEE", "ARMURE", "CASQUE", "LANCE", "ARC", "FLECHE", "POTION", "GRIMOIRE", "BAGUETTE", "SORT",
    "CARTE", "ILE", "CORSAIRE", "ANCRE", "VOILE", "CANON", "COFFRE", "BIJOU", "RUBIS", "SAPHIR",
    "EMERAUDE", "DIAMANT", "PERLE", "COURONNE", "SCEPTRE", "TRONE", "ROYAUME", "EMPIRE", "HEROS", "NINJA",
    "SAMOURAI", "VIKING", "MOMIE", "VAMPIRE", "YETI", "KRAKEN", "HYDRE", "PHENIX", "GRIFFON", "LICORNE",
    "QUETE", "EXPLORATEUR", "AVENTURE", "VOYAGE", "PIEGE", "INDICE", "ENIGME", "PORTAIL", "TUNNEL", "LABYRINTHE",
    // Objets et maison
    "PAIN", "EAU", "REPAS", "POMME", "TABLE", "CHAISE", "PORTE", "AVION", "BALLON", "BATEAU",
    "MONTRE", "PANIER", "VALISE", "JOURNAL", "MAISON", "VOITURE", "GUITARE", "MUSIQUE", "HORLOGE",
    "LAMPE", "VETEMENT", "TELEPHONE", "ORDINATEUR", "VELO", "TRAIN", "CAMION",
    "LIT", "SOFA", "TAPIS", "MIROIR", "ARMOIRE", "TIROIR", "PLACARD", "CUISINE", "SALON", "GARAGE",
    "JARDIN", "BALCON", "TOIT", "MUR", "CLE", "SERRURE", "BOUGIE", "COUSSIN", "OREILLER", "DOUCHE",
    "BOL", "VERRE", "TASSE", "ASSIETTE", "FOURCHETTE", "COUTEAU", "CUILLERE", "CASSEROLE", "FOUR", "FRIGO",
    "ECRAN", "CLAVIER", "SOURIS", "CONSOLE", "MANETTE", "TABLETTE", "CAMERA", "PHOTO", "RADIO", "PIANO",
    "VIOLON", "TAMBOUR", "TROMPETTE", "FLUTE", "XYLOPHONE", "JOUET", "POUPEE", "PUZZLE", "TOUPIE", "YOYO",
    "KAYAK", "SKI", "LUGE", "ROLLER", "TROTTINETTE", "MOTO", "BUS", "TAXI", "METRO", "TRACTEUR",
    "HELICOPTERE", "SOUSMARIN", "WAGON", "GARE", "ROUTE", "PONT", "PHARE", "PORT", "VILLE", "VILLAGE",
    // Nourriture
    "RIZ", "THE", "LAIT", "OEUF", "MIEL", "SUCRE", "SEL", "BEURRE", "FROMAGE", "YAOURT",
    "GATEAU", "BISCUIT", "BONBON", "CHOCOLAT", "CREPE", "GAUFRE", "TARTE", "GLACON", "SOUPE", "SALADE",
    "PIZZA", "PATES", "FRITES", "BURGER", "SANDWICH", "TOMATE", "CAROTTE", "OIGNON", "CITRON", "ORANGE",
    "BANANE", "FRAISE", "CERISE", "POIRE", "PECHE", "ABRICOT", "MANGUE", "ANANAS", "KIWI", "RAISIN",
    "OLIVE", "NOIX", "NOISETTE", "AMANDE", "VANILLE", "CARAMEL", "JUS", "SIROP", "QUICHE", "WIFI",
    // Corps et sport
    "MAIN", "PIED", "BRAS", "JAMBE", "TETE", "NEZ", "OEIL", "BOUCHE", "DENT", "OREILLE",
    "SPORT", "FOOT", "BASKET", "TENNIS", "JUDO", "KARATE", "BOXE", "RUGBY", "GOLF", "NATATION",
    "COURSE", "SAUT", "MATCH", "EQUIPE", "ARBITRE", "BUT", "PODIUM", "MEDAILLE", "TROPHEE", "CHAMPION",
    // Verbes
    "VOIR", "FAIRE", "DIRE", "LIRE", "JOUER", "TAPER", "PARLER", "MARCHER", "COURIR", "SAUTER",
    "NAGER", "VOLER", "AIMER", "AIDER", "REVER", "ECRIRE", "PENSER", "TROUVER", "GAGNER", "PERDRE",
    "CHOISIR", "GRANDIR", "REUSSIR", "PARTAGER", "COOPERER", "DECOUVRIR", "INVENTER",
    "ALLER", "VENIR", "PARTIR", "ARRIVER", "CHANTER", "DANSER", "RIRE", "SOURIRE", "DORMIR", "MANGER",
    "BOIRE", "CUIRE", "OUVRIR", "FERMER", "TIRER", "VISER", "LANCER", "ATTRAPER", "GRIMPER", "ROULER",
    "PLONGER", "GLISSER", "FILER", "FONCER", "TOURNER", "BRILLER", "EXPLORER", "CONSTRUIRE", "DESSINER", "COMPTER",
    "UNIR", "USER", "IMITER", "IGNORER", "JETER", "JONGLER", "KLAXONNER", "QUITTER", "YOUPI", "ZOOMER",
    // Adjectifs
    "BON", "BEAU", "FORT", "VITE", "GRAND", "PETIT", "RAPIDE", "SOLIDE", "CALME", "JOYEUX",
    "SOLAIRE", "SPATIAL", "SUPERBE", "VISIBLE", "BRILLANT", "MAGNIFIQUE", "AMUSANT",
    "GENIAL", "AGILE", "HABILE", "BRAVE", "FRANC", "FUTE", "PROPRE",
    "DOUX", "DUR", "FOU", "VRAI", "FAUX", "NEUF", "VIEUX", "JEUNE", "LOURD", "LEGER",
    "CHAUD", "FROID", "HAUT", "BAS", "LONG", "COURT", "LARGE", "ETROIT", "PROFOND", "IMMENSE",
    "ROUGE", "BLEU", "VERT", "JAUNE", "NOIR", "BLANC", "GRIS", "VIOLET", "ROSE", "DORE",
    "MALIN", "GENTIL", "CURIEUX", "PRUDENT", "TIMIDE", "HEUREUX", "INVINCIBLE", "UNIQUE", "ULTRA", "ZEN",
    "WESTERN", "WEEKEND", "YOGA", "ZIGZAG", "QUATRE", "QUINZE", "ONZE", "DOUZE", "MILLE"
].filter(w => /^[A-Z]+$/.test(w)))];

// 📖 Dictionnaire du mode AVANCÉ : les mêmes mots avec leur vraie orthographe + des mots à accents en plus.
// Seulement É et È (mode avancé = clavier physique uniquement, pas sur mobile).
// Les mots avec d'autres accents (Ê, À, Ç, Â...) sont retirés automatiquement par ce filtre.
const ACCENT_KEYS = 'ÉÈ';
const ADVANCED_WORD_REGEX = /^[A-ZÉÈ]+$/;

// Orthographe correcte des mots du mode simple
const ACCENTED_SPELLING = {
    ANE: "ÂNE", ZEBRE: "ZÈBRE", GUEPE: "GUÊPE", ARAIGNEE: "ARAIGNÉE", MEDUSE: "MÉDUSE", HERISSON: "HÉRISSON",
    ECUREUIL: "ÉCUREUIL", PANTHERE: "PANTHÈRE", GUEPARD: "GUÉPARD", LEOPARD: "LÉOPARD", ELEPHANT: "ÉLÉPHANT",
    RHINOCEROS: "RHINOCÉROS", HYENE: "HYÈNE", LEZARD: "LÉZARD", TETARD: "TÊTARD", ZEBU: "ZÉBU",
    DESERT: "DÉSERT", OCEAN: "OCÉAN", FORET: "FORÊT", ILE: "ÎLE", RIVIERE: "RIVIÈRE", VALLEE: "VALLÉE",
    ECLAIR: "ÉCLAIR", ETE: "ÉTÉ", TEMPETE: "TEMPÊTE", MAREE: "MARÉE",
    PLANETE: "PLANÈTE", ETOILE: "ÉTOILE", FUSEE: "FUSÉE", COMETE: "COMÈTE", CRATERE: "CRATÈRE", METEORE: "MÉTÉORE",
    NEBULEUSE: "NÉBULEUSE", VENUS: "VÉNUS", ENERGIE: "ÉNERGIE", TELESCOPE: "TÉLESCOPE", GRAVITE: "GRAVITÉ",
    ECLIPSE: "ÉCLIPSE", ZENITH: "ZÉNITH",
    ECOLE: "ÉCOLE", DICTEE: "DICTÉE", REGLE: "RÈGLE", LECON: "LEÇON", ECRITURE: "ÉCRITURE", FENETRE: "FENÊTRE",
    EQUERRE: "ÉQUERRE", REPONSE: "RÉPONSE", RECREATION: "RÉCRÉATION", MAITRE: "MAÎTRE", ELEVE: "ÉLÈVE", DIPLOME: "DIPLÔME",
    FANTOME: "FANTÔME", TRESOR: "TRÉSOR", CHATEAU: "CHÂTEAU", LEGENDE: "LÉGENDE", MYSTERE: "MYSTÈRE", DEFENSE: "DÉFENSE",
    FEE: "FÉE", GEANT: "GÉANT", EPEE: "ÉPÉE", FLECHE: "FLÈCHE", EMERAUDE: "ÉMERAUDE", TRONE: "TRÔNE", HEROS: "HÉROS",
    QUETE: "QUÊTE", PIEGE: "PIÈGE", ENIGME: "ÉNIGME", PHENIX: "PHÉNIX", YETI: "YÉTI",
    VETEMENT: "VÊTEMENT", TELEPHONE: "TÉLÉPHONE", VELO: "VÉLO", ECRAN: "ÉCRAN", CAMERA: "CAMÉRA", POUPEE: "POUPÉE",
    METRO: "MÉTRO", HELICOPTERE: "HÉLICOPTÈRE", CUILLERE: "CUILLÈRE", CLE: "CLÉ", FLUTE: "FLÛTE",
    THE: "THÉ", GATEAU: "GÂTEAU", CREPE: "CRÊPE", GLACON: "GLAÇON", PATES: "PÂTES", PECHE: "PÊCHE",
    TETE: "TÊTE", EQUIPE: "ÉQUIPE", MEDAILLE: "MÉDAILLE", TROPHEE: "TROPHÉE", KARATE: "KARATÉ",
    REVER: "RÊVER", REUSSIR: "RÉUSSIR", COOPERER: "COOPÉRER", DECOUVRIR: "DÉCOUVRIR", ECRIRE: "ÉCRIRE",
    GENIAL: "GÉNIAL", FUTE: "FUTÉ", LEGER: "LÉGER", ETROIT: "ÉTROIT", DORE: "DORÉ"
};
// Mots du mode simple qui demanderaient une lettre absente du clavier (Ï, Œ, trait d'union...)
const NOT_IN_ADVANCED = new Set(["ASTEROIDE", "SAMOURAI", "OEUF", "OEIL", "SOUSMARIN", "WEEKEND"]);

// Mots en plus, avec É ou È
const ADVANCED_EXTRA = [
    "ÉCOLIER", "ÉCURIE", "ÉPAULE", "ÉPINE", "ÉPOQUE", "ÉQUIPAGE", "ÉTOFFE", "ÉTUDE", "ÉVASION", "ÉLAN",
    "ÉTÉ", "ÉTAPE", "ÉTINCELLE", "ÉVÉNEMENT", "ÉMOTION", "ÉPISODE", "ÉPREUVE", "ÉLÈVE", "ÉLÉGANT", "ÉNERGIE",
    "BÉBÉ", "CAFÉ", "CLÉ", "DÉ", "BLÉ", "PRÉ", "NÉ", "THÉ", "FÉE", "ÉPI", "RÉ",
    "DÉPART", "DÉFI", "DÉLICE", "DÉSORDRE", "DÉTECTIVE", "DÉTOUR", "DÉCOR", "DÉGÂT", "DÉMON", "DÉTAIL",
    "MÉDECIN", "MÉLODIE", "MÉMOIRE", "MÉTAL", "MÉCANIQUE", "MÉTIER", "MÉNAGE", "MÉCHANT",
    "RÉCOLTE", "RÉGION", "RÉPONSE", "RÉVEIL", "RÉCIT", "RÉSEAU", "RÉSULTAT", "RÉCOMPENSE", "RÉGIME", "RÉPUBLIQUE",
    "TÉLÉ", "TÉLÉCOMMANDE", "VÉRITÉ", "VÉHICULE", "VÉGÉTAL", "SÉCURITÉ", "SÉRIE", "SÉANCE", "SÉJOUR",
    "PÉPITE", "PÉTALE", "PÉRIODE", "PÉDALE", "GÉNIE", "GÉOGRAPHIE", "GÉOMÉTRIE", "HÉLICE", "HÉRITAGE",
    "CÉLÈBRE", "FIDÈLE", "MODÈLE", "PROBLÈME", "SYSTÈME", "THÈME", "POÈME", "CRÈME", "LÈVRE", "FLÈCHE",
    "MÈRE", "PÈRE", "FRÈRE", "CHÈVRE", "LUMIÈRE", "SORCIÈRE", "SIÈCLE", "FIÈVRE", "PIÈCE", "COLÈRE",
    "RIVIÈRE", "BARRIÈRE", "CARRIÈRE", "FRONTIÈRE", "MATIÈRE", "PREMIÈRE", "DERNIÈRE", "CUISINIÈRE", "THÉIÈRE",
    "SECRÈTE", "COMPLÈTE", "ZÈBRE", "ESPÈCE", "PLANÈTE", "COMÈTE", "MYSTÈRE", "CRATÈRE", "ATMOSPHÈRE", "HÉMISPHÈRE",
    "CAFÉ", "BÉBÉ", "DÉ", "BLÉ", "PRÉ", "ÂGE", "ÂME", "MÛR", "SÛR", "OÙ", "LÀ", "ÇA", "DÉJÀ", "VOILÀ", "HOLÀ",
    "GÎTE", "CÔTE", "RÊVE", "FÊTE", "BÊTE", "PÔLE", "RÔLE", "ZÈLE", "GRÊLE", "CÔNE", "PÂTE", "PRÊT", "ZÉRO", "NÉON", "ÉPI",
    "ÉLAN", "ÉCHO", "ÉCLAT", "ÉCUME", "ÉTANG", "ÉVEIL", "ÉPICE", "CRÈME", "LÈVRE", "POÈTE", "MÈRE", "PÈRE", "FRÈRE",
    "FAÇADE", "GARÇON", "FRANÇAIS", "MAÇON", "REÇU", "HAMEÇON", "MÛRE", "BÛCHE", "CROÛTE", "AOÛT", "GOÛTER",
    "DÎNER", "BOÎTE", "HUÎTRE", "CHAÎNE", "HÔPITAL", "DRÔLE", "BIENTÔT", "CONTRÔLE", "BÂTON", "CRÂNE", "THÉÂTRE",
    "GRÂCE", "CHÈVRE", "LUMIÈRE", "SORCIÈRE", "SIÈCLE", "FIÈVRE", "PIÈCE", "ARRÊT", "HÊTRE", "CHÊNE", "COLÈRE",
    "ÉGLISE", "ÉPONGE", "ÉCHELLE", "ÉTAGE", "ÉNORME", "MÉTÉO", "CINÉMA", "ÉCAILLE", "ÉQUATEUR", "HÉLICE",
    "RÉACTEUR", "MOLÉCULE", "ÉLECTRON", "SYSTÈME", "PLANÉTAIRE", "MÉTÉORITE", "ÉCLAIREUR",
    "RÉPARER", "DÉCOLLER", "PRÉPARER", "TÉLÉPORTER", "ÉCOUTER", "ÉTUDIER", "ÉVITER", "ACCÉLÉRER", "PROTÉGER", "CÉLÉBRER",
    "FIDÈLE", "CÉLÈBRE", "SPÉCIAL", "PRÉCIS", "SÉRIEUX", "VÉRITÉ", "LIBERTÉ", "ÉGALITÉ", "SANTÉ", "BEAUTÉ", "AMITIÉ"
];

const wordListAdvanced = [...new Set(
    wordList.filter(w => !NOT_IN_ADVANCED.has(w)).map(w => ACCENTED_SPELLING[w] || w).concat(ADVANCED_EXTRA)
)].filter(w => ADVANCED_WORD_REGEX.test(w));

// 🎚️ Difficulté choisie dans le menu : 'simple' (sans accents) ou 'avance' (avec accents)
let difficulty = (() => {
    try { return localStorage.getItem('typing_shooter_difficulty') === 'avance' ? 'avance' : 'simple'; }
    catch (e) { return 'simple'; }
})();
const currentWordList = () => (difficulty === 'avance' ? wordListAdvanced : wordList);

// Enlève les accents (en mode simple, taper "é" compte comme "E")
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

let activeWords = [];
let targetedWord = null; 
let lasers = [];
let gameInterval = null;
let spawnTimer = 0;
let score = 0;
let level = 1;
let wordsDestroyedInLevel = 0;
let wordsDestroyedTotal = 0; // mots détruits dans la partie (vérifié par le serveur pour le classement en ligne)
let highScore = 0; // = 1er du Top 3 (voir section 4 BIS)
let isPlaying = false;
let currentCombo = 0;
let scoreMultiplier = 1;
let isPaused = false;
let isCountingDown = false;
let countdownTimer = null;

// 🎮 Mode de jeu : 'clavier' (PC) ou 'mobile' (clavier virtuel à l'écran)
// Sur un appareil tactile sans souris, on propose le mode mobile par défaut.
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
let gameMode = isTouchDevice ? 'mobile' : 'clavier';
const MOBILE_SPEED_FACTOR = 0.75; // en mode mobile les mots tombent 25 % moins vite
let currentZoom = 1; // réglage "VUE" (voir section 6 QUATER)

// Dimensions de la zone de jeu (plus petite que l'écran en mode mobile, à cause du clavier)
const gameW = () => (container ? container.clientWidth : window.innerWidth);
const gameH = () => (container ? container.clientHeight : window.innerHeight);

if (restartBtn) restartBtn.addEventListener('click', () => { restartBtn.blur(); startGame(gameMode); });
if (modeBtn) modeBtn.addEventListener('click', () => {
    modeBtn.blur();
    startGame(gameMode === 'mobile' ? 'clavier' : 'mobile');
});

// Met à jour les boutons du menu selon le mode choisi
function updateMenuButtons() {
    // Sur téléphone / tablette tactile : toujours le mode mobile, donc pas de bouton pour changer
    // (le clavier virtuel est indispensable, et un clavier physique branché fonctionne aussi dans ce mode)
    if (modeBtn) {
        modeBtn.style.display = isTouchDevice ? 'none' : '';
        modeBtn.innerText = gameMode === 'mobile' ? '⌨ MODE CLAVIER' : '📱 MODE MOBILE';
    }
    if (menuHint) {
        menuHint.innerHTML = gameMode === 'mobile'
            ? 'Mode mobile · clavier affiché à l\'écran'
            : 'Mode clavier · ou appuie sur <span class="keycap">Entrée</span>';
    }
}
updateMenuButtons();

// Touches spéciales : Entrée (lancer / reprendre) et Échap (pause)
window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return; // on est en train d'écrire son nom
    if (e.key === 'Enter') {
        if (!isPlaying) {
            e.preventDefault(); // évite un double lancement si un bouton a le focus
            startGame(gameMode);
        } else if (isPaused) {
            e.preventDefault();
            resumeGame();
        }
    } else if (e.key === 'Escape' && isPlaying) {
        e.preventDefault();
        if (isPaused) resumeGame(); else pauseGame();
    }
});

// Met à jour les barres de progression du HUD (niveau + combo)
function updateHudBars() {
    const settings = getDifficultySettings();
    if (levelProgressElement) {
        const pct = Math.min(100, (wordsDestroyedInLevel / settings.wordsToNextLevel) * 100);
        levelProgressElement.style.width = pct + '%';
    }
    if (comboProgressElement) {
        // Le multiplicateur monte tous les 10 coups réussis, jusqu'à x4 (30 coups)
        const pct = currentCombo >= 30 ? 100 : (currentCombo % 10) * 10;
        comboProgressElement.style.width = pct + '%';
    }
}

// Fait apparaître un texte qui s'envole (points, bonus, combo...)
function showFloatingText(x, y, html, className = '') {
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'float-text ' + className;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerHTML = html;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

// Position d'un élément dans le "monde" du jeu.
// (getBoundingClientRect donne la position à l'écran, déjà réduite par le zoom :
//  on la convertit pour qu'elle corresponde aux coordonnées des mots et des lasers)
function localRect(el) {
    const r = el.getBoundingClientRect();
    const o = container.getBoundingClientRect();
    const left = (r.left - o.left) / currentZoom;
    const top = (r.top - o.top) / currentZoom;
    const width = r.width / currentZoom;
    const height = r.height / currentZoom;
    return { left, top, width, height, right: left + width, bottom: top + height };
}

// Centre d'un élément dans le monde du jeu
function getCenter(element) {
    const r = localRect(element);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Affiche la grosse bannière "NIVEAU X" au centre de l'écran
function showLevelBanner(lvl) {
    if (!levelBanner) return;
    levelBanner.innerText = `NIVEAU ${lvl}`;
    levelBanner.classList.remove('show');
    void levelBanner.offsetWidth; // relance l'animation
    levelBanner.classList.add('show');
}

// ==========================================
// 1 BIS. 🎙️ VOIX DES NIVEAUX (dossier voix/)
// ==========================================
// Niveaux 2 à 20 : voix/nivX.mp3 (pas de voix au niveau 1 ni au-delà du 20)
const VOICE_MAX_LEVEL = 20;
const VOICE_VOLUME = 0.3; // volume des voix (0 à 1) : à ajuster selon tes goûts
let voiceGainNode = null; // réglage de volume via Web Audio (seul moyen qui marche sur iPhone)
const voicePlayer = new Audio(); // un seul lecteur réutilisé (indispensable sur iPhone)
voicePlayer.preload = 'auto';
let voiceTimer = null;
let voiceUnlockId = 0;

function voiceFile(lvl) {
    return lvl >= 2 && lvl <= VOICE_MAX_LEVEL ? `voix/niv${lvl}.mp3` : null;
}

// Joue la voix du niveau (après "delay" ms, pour ne pas couvrir le jingle de montée de niveau)
function playLevelVoice(lvl, delay = 0) {
    clearVoiceResume();
    stopVoice();
    const src = voiceFile(lvl);
    if (!src || !sfxEnabled) return;
    const go = () => {
        voiceTimer = null;
        if (!isPlaying || !sfxEnabled) return;
        connectVoiceToMixer();
        voiceUnlockId++;          // annule le déblocage silencieux s'il n'est pas fini
        voicePlayer.muted = false;
        voicePlayer.src = src;
        // Si la voix passe par le mixeur, c'est lui qui règle le volume ; sinon le lecteur lui-même
        voicePlayer.volume = voiceGainNode ? 1 : VOICE_VOLUME;
        const p = voicePlayer.play();
        if (p && p.catch) p.catch(() => duckMusic(false)); // fichier absent / lecture refusée : pas grave
        duckMusic(true);
    };
    if (delay > 0) voiceTimer = setTimeout(go, delay); else go();
}

// Fait passer la voix par le mixeur audio du jeu (une seule fois).
// Seulement quand le jeu est en ligne (http/https) : en fichier local, Chrome rendrait la voix muette.
function connectVoiceToMixer() {
    if (voiceGainNode || !audioCtx || !/^https?:$/.test(location.protocol)) return;
    try {
        const source = audioCtx.createMediaElementSource(voicePlayer);
        voiceGainNode = audioCtx.createGain();
        voiceGainNode.gain.value = VOICE_VOLUME;
        source.connect(voiceGainNode);
        voiceGainNode.connect(audioCtx.destination);
    } catch (e) { voiceGainNode = null; }
}

function stopVoice() {
    clearTimeout(voiceTimer);
    voiceTimer = null;
    if (!voicePlayer.paused) voicePlayer.pause();
    duckMusic(false);
}

// Baisse la musique pendant que la voix parle, pour bien l'entendre
function duckMusic(on) {
    if (!audioCtx || !musicGain || !isPlaying) return;
    const now = audioCtx.currentTime;
    const target = musicEnabled ? (on ? MUSIC_VOLUME * 0.7 : MUSIC_VOLUME) : 0;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.setTargetAtTime(target, now, on ? 0.08 : 0.4);
}
// Après une pause : on reprend la voix là où elle s'était arrêtée (ou on lance celle qui allait démarrer)
function resumeVoice() {
    const pending = parseInt(voicePlayer.dataset.pendingLevel, 10);
    const wasPlaying = voicePlayer.dataset.resume === '1';
    clearVoiceResume();
    if (!sfxEnabled) return;
    if (pending) { playLevelVoice(pending); return; }
    if (wasPlaying && !voicePlayer.ended) {
        const p = voicePlayer.play();
        if (p && p.catch) p.catch(() => duckMusic(false));
        duckMusic(true);
    }
}
function clearVoiceResume() {
    delete voicePlayer.dataset.pendingLevel;
    delete voicePlayer.dataset.resume;
}

voicePlayer.addEventListener('ended', () => duckMusic(false));
voicePlayer.addEventListener('error', () => duckMusic(false));

function getDifficultySettings() {
    return {
        maxWordsOnScreen: Math.min(1 + Math.floor(level / 2), 5), 
        spawnDelay: Math.max(180 - (level * 20), 70),             
        wordSpeed: 0.6 + (level * 0.15),                          
        wordsToNextLevel: 5 + (level * 2)                         
    };
}
// ==========================================
// 2. MOTEUR AUDIO (SYNTHÉTISEUR SPATIAL)
// ==========================================
// Volumes généraux (entre 0 et 1) : à ajuster selon tes goûts
const MUSIC_VOLUME = 0.32;
const SFX_VOLUME = 0.55;

let audioCtx = null;
let masterGain, musicGain, sfxGain;   // bus de volume
let musicBus, musicReverb, sfxReverb, arpDelay; // effets
let noiseBuffer = null;
let musicTimer = null;
let nextStepTime = 0;
let musicStep = 0;

function loadSetting(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1'; }
    catch (e) { return fallback; }
}
function saveSetting(key, value) {
    try { localStorage.setItem(key, value ? '1' : '0'); } catch (e) { /* stockage indisponible */ }
}
let musicEnabled = loadSetting('typing_shooter_music', true);
let sfxEnabled = loadSetting('typing_shooter_sfx', true);

const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12); // numéro de note -> fréquence

// Réverbération "spatiale" générée (bruit qui s'éteint doucement)
function makeImpulse(duration, decay) {
    const len = Math.floor(audioCtx.sampleRate * duration);
    const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
}

function initAudio() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();

    // Compresseur final : évite que les sons saturent quand tout joue en même temps
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.connect(audioCtx.destination);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(comp);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = sfxEnabled ? SFX_VOLUME : 0;
    sfxGain.connect(masterGain);

    // Bus musique + réverbération
    musicBus = audioCtx.createGain();
    musicBus.connect(musicGain);
    const musicConv = audioCtx.createConvolver();
    musicConv.buffer = makeImpulse(3, 2.5);
    musicReverb = audioCtx.createGain();
    musicReverb.gain.value = 0.6;
    musicReverb.connect(musicConv);
    musicConv.connect(musicGain);

    // Écho pour l'arpège
    arpDelay = audioCtx.createDelay(1);
    arpDelay.delayTime.value = 0.42;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.35;
    const fbFilter = audioCtx.createBiquadFilter();
    fbFilter.type = 'lowpass';
    fbFilter.frequency.value = 1800;
    arpDelay.connect(fbFilter);
    fbFilter.connect(feedback);
    feedback.connect(arpDelay);
    arpDelay.connect(musicGain);

    // Réverbération des effets sonores
    const sfxConv = audioCtx.createConvolver();
    sfxConv.buffer = makeImpulse(1.8, 3);
    sfxReverb = audioCtx.createGain();
    sfxReverb.gain.value = 0.5;
    sfxReverb.connect(sfxConv);
    sfxConv.connect(sfxGain);

    // Bruit blanc réutilisable (explosions, charleston)
    noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const nd = noiseBuffer.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
}

// --- Petites briques de synthé ---
// Joue une note avec une enveloppe douce. dest = où envoyer le son.
function tone({ freq, type = 'sine', t, attack = 0.005, dur = 0.2, vol = 0.1, endFreq = null,
                filterFreq = null, dest, reverb = null, reverbAmount = 0, detune = 0 }) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    osc.detune.value = detune;

    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur);

    let node = osc;
    if (filterFreq) {
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = filterFreq;
        osc.connect(f);
        node = f;
    }
    node.connect(g);
    g.connect(dest);
    if (reverb && reverbAmount > 0) {
        const s = audioCtx.createGain();
        s.gain.value = reverbAmount;
        g.connect(s);
        s.connect(reverb);
    }
    osc.start(t);
    osc.stop(t + attack + dur + 0.05);
}

// Joue un souffle de bruit filtré (explosions, charleston)
function noise({ t, dur = 0.3, vol = 0.2, type = 'lowpass', from = 1000, to = 100, dest, reverb = null, reverbAmount = 0 }) {
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = audioCtx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    if (reverb && reverbAmount > 0) {
        const s = audioCtx.createGain();
        s.gain.value = reverbAmount;
        g.connect(s);
        s.connect(reverb);
    }
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
}

// ------------------------------------------
// 🎵 MUSIQUE : ambiance spatiale qui s'enrichit avec les niveaux
//   Niveau 1 : nappes + basse douce
//   Niveau 2 : + arpège cristallin avec écho
//   Niveau 3 : + charleston léger
//   Niveau 4 : + grosse caisse douce
//   Le tempo accélère un peu à chaque niveau.
// ------------------------------------------
const progression = [
    { pad: [57, 60, 64], bass: 45 }, // La mineur
    { pad: [53, 57, 60], bass: 41 }, // Fa majeur
    { pad: [55, 60, 64], bass: 48 }, // Do majeur
    { pad: [55, 59, 62], bass: 43 }  // Sol majeur
];
const arpPattern = [0, 1, 2, 1, 0, 2, 1, 2];

function currentChord() {
    return progression[Math.floor(musicStep / 16) % progression.length];
}

function getStepDuration() {
    const bpm = 92 + Math.min(level - 1, 8) * 3;
    return 60 / bpm / 4; // une double-croche
}

function playMusicStep(step, t) {
    const chord = progression[Math.floor(step / 16)];
    const s = step % 16;
    const stepDur = getStepDuration();

    // Nappe d'accord (début de chaque mesure)
    if (s === 0) {
        chord.pad.forEach(n => {
            [-8, 8].forEach(det => tone({
                freq: mtof(n), type: 'sawtooth', t, attack: 0.8, dur: stepDur * 16 + 0.3, vol: 0.022,
                filterFreq: 900, detune: det, dest: musicBus, reverb: musicReverb, reverbAmount: 0.8
            }));
        });
    }

    // Basse ronde
    if (s === 0 || s === 8 || s === 11) {
        tone({ freq: mtof(chord.bass), type: 'triangle', t, attack: 0.01, dur: stepDur * (s === 11 ? 4 : 6),
               vol: 0.16, filterFreq: 500, dest: musicBus });
    }

    // Arpège (à partir du niveau 2)
    if (level >= 2 && s % 2 === 0) {
        const note = chord.pad[arpPattern[s / 2]] + 12;
        tone({ freq: mtof(note), type: 'triangle', t, attack: 0.005, dur: 0.22, vol: 0.05,
               filterFreq: 2500, dest: musicBus, reverb: arpDelay, reverbAmount: 0.6 });
    }

    // Charleston (à partir du niveau 3)
    if (level >= 3 && s % 4 === 2) {
        noise({ t, dur: 0.05, vol: 0.05, type: 'highpass', from: 8000, to: 6000, dest: musicBus });
    }
    if (level >= 6 && s % 2 === 1) {
        noise({ t, dur: 0.03, vol: 0.02, type: 'highpass', from: 9000, to: 7000, dest: musicBus });
    }

    // Grosse caisse douce (à partir du niveau 4)
    if (level >= 4 && (s === 0 || s === 8)) {
        tone({ freq: 110, endFreq: 42, type: 'sine', t, attack: 0.003, dur: 0.28, vol: 0.32, dest: musicBus });
    }
}

function scheduleMusic() {
    // On programme les notes un peu à l'avance pour un rythme parfaitement régulier
    while (nextStepTime < audioCtx.currentTime + 0.15) {
        playMusicStep(musicStep, nextStepTime);
        nextStepTime += getStepDuration();
        musicStep = (musicStep + 1) % (progression.length * 16);
    }
}

function startMusic() {
    initAudio();
    if (!audioCtx) return;
    if (musicTimer) clearInterval(musicTimer);
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(musicEnabled ? MUSIC_VOLUME : 0, now + 1.5); // fondu d'entrée
    musicStep = 0;
    nextStepTime = now + 0.1;
    musicTimer = setInterval(scheduleMusic, 25);
}

function stopMusic() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0, now + 1.5); // fondu de sortie
    setTimeout(() => {
        if (!isPlaying && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }, 1600);
}

// ------------------------------------------
// 🔊 EFFETS SONORES
// ------------------------------------------
function sfxReady() { return audioCtx && sfxEnabled; }

function playLaserSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    // Le tir monte légèrement dans les aigus quand le combo grimpe
    const base = 900 + Math.min(currentCombo, 30) * 12;
    const f = base * (0.96 + Math.random() * 0.08);
    tone({ freq: f, endFreq: f * 0.35, type: 'triangle', t, dur: 0.09, vol: 0.07, dest: sfxGain });
    tone({ freq: f * 2, endFreq: f * 0.7, type: 'sine', t, dur: 0.05, vol: 0.025, dest: sfxGain });
}

function playHitSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    tone({ freq: 1600, endFreq: 800, type: 'sine', t, dur: 0.05, vol: 0.04, dest: sfxGain });
}

function playExplosionSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    noise({ t, dur: 0.35, vol: 0.22, from: 1400, to: 120, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.4 });
    tone({ freq: 95, endFreq: 40, type: 'sine', t, attack: 0.003, dur: 0.22, vol: 0.28, dest: sfxGain });
    // Petite note cristalline accordée avec la musique
    const chord = currentChord();
    const note = chord.pad[Math.floor(Math.random() * chord.pad.length)] + 24;
    tone({ freq: mtof(note), type: 'sine', t: t + 0.02, dur: 0.5, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.8 });
}

function playBombSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    noise({ t, dur: 1.2, vol: 0.45, from: 2500, to: 50, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.7 });
    tone({ freq: 70, endFreq: 25, type: 'sine', t, attack: 0.005, dur: 0.9, vol: 0.5, dest: sfxGain });
    tone({ freq: 1200, endFreq: 150, type: 'triangle', t, dur: 0.5, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

function playLevelUpSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    [72, 76, 79, 84].forEach((n, i) => {
        tone({ freq: mtof(n), type: 'triangle', t: t + i * 0.08, dur: 0.35, vol: 0.09,
               dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.7 });
    });
    tone({ freq: mtof(88), type: 'sine', t: t + 0.32, dur: 0.8, vol: 0.06, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.9 });
}

function playComboSound(mult) {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    const base = 76 + mult * 2;
    tone({ freq: mtof(base), type: 'sine', t, dur: 0.15, vol: 0.08, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
    tone({ freq: mtof(base + 7), type: 'sine', t: t + 0.07, dur: 0.3, vol: 0.08, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

function playErrorSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    tone({ freq: 140, endFreq: 100, type: 'square', t, dur: 0.1, vol: 0.035, filterFreq: 700, dest: sfxGain });
}

function playGameOverSound() {
    if (!sfxReady()) return;
    const t = audioCtx.currentTime;
    [64, 60, 57, 52].forEach((n, i) => {
        tone({ freq: mtof(n), type: 'triangle', t: t + i * 0.22, attack: 0.02, dur: 0.6, vol: 0.09,
               filterFreq: 1500, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.8 });
    });
    noise({ t, dur: 1.5, vol: 0.2, from: 900, to: 40, dest: sfxGain, reverb: sfxReverb, reverbAmount: 0.6 });
}

// ------------------------------------------
// 🎚️ BOUTONS MUSIQUE / EFFETS
// ------------------------------------------
const musicBtn = document.getElementById('music-btn');
const sfxBtn = document.getElementById('sfx-btn');

function refreshSoundButtons() {
    if (musicBtn) musicBtn.classList.toggle('off', !musicEnabled);
    if (sfxBtn) sfxBtn.classList.toggle('off', !sfxEnabled);
}

if (musicBtn) musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    saveSetting('typing_shooter_music', musicEnabled);
    if (audioCtx && isPlaying) {
        musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
        musicGain.gain.setTargetAtTime(musicEnabled ? MUSIC_VOLUME : 0, audioCtx.currentTime, 0.15);
    }
    refreshSoundButtons();
    musicBtn.blur(); // évite que Espace/Entrée réactivent le bouton pendant la partie
});

if (sfxBtn) sfxBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    saveSetting('typing_shooter_sfx', sfxEnabled);
    if (audioCtx) sfxGain.gain.setTargetAtTime(sfxEnabled ? SFX_VOLUME : 0, audioCtx.currentTime, 0.05);
    if (!sfxEnabled) { clearVoiceResume(); stopVoice(); } // les voix suivent le bouton EFFETS
    refreshSoundButtons();
    sfxBtn.blur();
});

refreshSoundButtons();
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
// ==========================================
// 4. ÉTATS DU JEU & LOGIQUE DES BONUS
// ==========================================
// Retire tous les mots et lasers de l'écran
function clearField() {
    activeWords.forEach(w => { if (w.element && container && container.contains(w.element)) container.removeChild(w.element); });
    lasers.forEach(l => { if (l.element && container && container.contains(l.element)) container.removeChild(l.element); });
    activeWords = [];
    lasers = [];
    targetedWord = null;
}

// Applique (ou retire) la mise en page du mode mobile
function applyLayout(mobile) {
    document.body.classList.toggle('mobile-mode', mobile);
    refreshBackgroundSize(); // le fond s'adapte à la nouvelle taille de la zone de jeu
}

// ==========================================
// 4 BIS. 🏆 TOP 3 DES MEILLEURS SCORES
// ==========================================
// Un classement par difficulté (le mode avancé est plus dur : ce ne serait pas équitable de mélanger)
const leaderboardKey = () => (difficulty === 'avance' ? 'typing_shooter_top3_avance' : 'typing_shooter_top3');
const LAST_NAME_KEY = 'typing_shooter_lastname';
const LEADERBOARD_SIZE = 3;
const leaderboardElement = document.getElementById('leaderboard');
const nameEntryForm = document.getElementById('name-entry');
const nameInput = document.getElementById('name-input');
let leaderboard = [];
let pendingEntry = null; // score qui vient d'entrer dans le Top 3 (en attente du nom)

function readStore(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
}

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
    if (list.length === 0 && difficulty !== 'avance') {
        const old = parseInt(readStore('typing_shooter_highscore'), 10) || 0;
        if (old > 0) list.push({ name: 'PILOTE', score: old, level: null });
    }
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, LEADERBOARD_SIZE);
}

function storeLeaderboard() {
    writeStore(leaderboardKey(), JSON.stringify(leaderboard));
    if (difficulty !== 'avance') writeStore('typing_shooter_highscore', leaderboard.length ? leaderboard[0].score : 0); // compatibilité
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
const onlineTop = { simple: null, avance: null }; // null = pas (encore) chargé → classement local
const onlineRankElement = document.getElementById('online-rank');
let boardHighlight = null; // score mis en valeur dans le tableau (celui qu'on vient de faire)

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

// Télécharge le Top 3 mondial d'une difficulté
async function refreshOnline(diff = difficulty) {
    if (!onlineEnabled()) return;
    try {
        const r = await onlineFetch(`scores?select=name,score,level&difficulty=eq.${diff}&order=score.desc,created_at.asc&limit=${LEADERBOARD_SIZE}`);
        const rows = await r.json();
        onlineTop[diff] = rows.map(x => ({
            name: cleanName(x.name) || 'PILOTE', score: Math.floor(x.score) || 0, level: x.level || null, difficulty: diff
        }));
        if (diff === difficulty) renderLeaderboard();
    } catch (e) { /* hors ligne : on garde le classement de l'appareil */ }
}

// Compte les scores d'une difficulté (avec un filtre éventuel) sans les télécharger
async function onlineCount(diff, filter = '') {
    const r = await onlineFetch(`scores?select=id&difficulty=eq.${diff}${filter}`, {
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
    if (!onlineEnabled()) return;
    const ticket = { id: null, difficulty };
    onlineSession = ticket;
    try {
        const r = await onlineFetch('rpc/start_game', { method: 'POST', body: JSON.stringify({ p_difficulty: difficulty }) });
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
        await refreshOnline(entry.difficulty);
        const [better, total] = await Promise.all([
            onlineCount(entry.difficulty, `&score=gt.${entry.score}`),
            onlineCount(entry.difficulty)
        ]);
        if (boardHighlight !== entry) return; // le joueur est déjà passé à autre chose
        const rank = better + 1;
        showRankText(`🌍 Classement mondial : ${rank === 1 ? '1er' : rank + 'e'} sur ${total} partie${total > 1 ? 's' : ''}`);
    } catch (e) {
        if (boardHighlight === entry) showRankText('⚠️ Score non envoyé en ligne (pas de connexion)');
    }
}

// Liste affichée : le Top 3 mondial s'il est chargé, sinon celui de l'appareil.
// Le score qu'on vient de faire y est inséré (pour le voir tout de suite à sa place).
function displayedList() {
    const online = onlineTop[difficulty];
    const list = (online || leaderboard).slice();
    const h = boardHighlight;
    if (h && h.difficulty === difficulty && !list.some(r => sameEntry(r, h))) {
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

    const sub = document.createElement('div');
    sub.className = 'lb-title';
    const diffName = difficulty === 'avance' ? 'AVANCÉ' : 'SIMPLE';
    sub.innerText = onlineTop[difficulty] ? `🌍 Top 3 mondial · ${diffName}` : `🏆 Top 3 de cet appareil · ${diffName}`;
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
const difficultyBox = document.getElementById('difficulty-section'); // intitulé + boutons
if (difficultyBox && isTouchDevice) difficultyBox.style.display = 'none';
setDifficulty(isTouchDevice ? 'simple' : difficulty);

function startGame(mode) {
    if (mode === 'clavier' || mode === 'mobile') gameMode = mode;
    if (isTouchDevice) gameMode = 'mobile'; // sécurité : jamais de mode sans clavier à l'écran sur tactile
    // Si le joueur relance sans valider son nom, on l'enregistre tel qu'il est écrit
    confirmName(false);
    // Le mode mobile (clavier à l'écran) se joue toujours en SIMPLE
    if (gameMode === 'mobile' && difficulty !== 'simple') setDifficulty('simple');
    startOnlineSession(); // 🎫 ticket de partie pour le classement en ligne (anti-triche)
    updateMenuButtons();
    applyLayout(gameMode === 'mobile');

    clearTimeout(countdownTimer);
    isCountingDown = false;
    isPaused = false;
    isPlaying = true;
    document.body.classList.add('is-playing');
    document.body.classList.remove('is-paused');
    if (pauseScreen) pauseScreen.classList.add('hidden');

    currentCombo = 0;
    scoreMultiplier = 1;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    startMusic();

    clearField();
    activeWords = [];
    lasers = [];
    targetedWord = null;
    score = 0;
    level = 1;
    wordsDestroyedInLevel = 0;
    wordsDestroyedTotal = 0;
    spawnTimer = 0;

    if (scoreElement) scoreElement.innerText = score;
    if (levelElement) levelElement.innerText = level;
    
    const displayElement = comboMultiplierElement || streakElement;
    if (displayElement) {
        displayElement.innerText = "x1";
        displayElement.style.color = "#22d3ee";
    }

    const settings = getDifficultySettings();
    if (streakElement) streakElement.innerText = `0/${settings.wordsToNextLevel}`;
    
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (playerShip) {
        playerShip.style.transform = 'translateX(-50%) rotate(0deg)';
        playerShip.style.left = '50%';
    }

    updateHudBars();
    showLevelBanner(1);
    stopVoice();
    // Débloque le lecteur des voix pendant le clic sur COMMENCER (obligatoire sur iPhone),
    // sinon les voix des niveaux suivants seraient bloquées. Aucun son n'est joué.
    try {
        connectVoiceToMixer();
        const unlockId = ++voiceUnlockId;
        voicePlayer.muted = true;
        voicePlayer.src = voiceFile(2);
        const p = voicePlayer.play();
        const unmute = () => {
            if (unlockId !== voiceUnlockId) return; // une vraie voix a démarré entre-temps : on n'y touche pas
            voicePlayer.pause(); voicePlayer.currentTime = 0; voicePlayer.muted = false;
        };
        if (p && p.then) p.then(unmute, unmute); else unmute();
    } catch (e) { voicePlayer.muted = false; }

    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
}

function triggerGameOver() {
    isPlaying = false;
    isPaused = false;
    clearInterval(gameInterval);
    gameInterval = null;
    document.body.classList.remove('is-playing', 'is-paused');
    applyLayout(false); // le menu reprend tout l'écran
    stopVoice();
    stopMusic();
    playGameOverSound();

    // Classement de l'appareil (entrée créée seulement si le score y a sa place)
    let entry = addToLeaderboard(score, level);
    const newRecord = entry !== null && leaderboard[0] === entry;
    // En ligne, toutes les parties sont enregistrées (pour connaître sa place mondiale)
    if (!entry && onlineEnabled() && score > 0) {
        entry = { name: cleanName(readStore(LAST_NAME_KEY)) || 'PILOTE', score: score, level: level };
    }
    if (entry) {
        entry.difficulty = difficulty;
        entry.words = wordsDestroyedTotal;
        entry.ticket = onlineSession && onlineSession.difficulty === difficulty ? onlineSession : null;
    }
    onlineSession = null; // un ticket = une seule partie
    boardHighlight = entry;
    showRankText('');

    if (screenTitle) screenTitle.innerText = "GAME OVER";
    if (screenStats) screenStats.innerHTML = `
        <div class="stat-grid">
            <div class="stat"><div class="stat-label">NIVEAU</div><div class="stat-value">${level}</div></div>
            <div class="stat"><div class="stat-label">SCORE</div><div class="stat-value">${score}</div></div>
            <div class="stat"><div class="stat-label">RECORD</div><div class="stat-value">${highScore}</div></div>
        </div>
        ${newRecord ? '<div class="new-record">★ NOUVEAU RECORD ★</div>' : ''}`;
    renderLeaderboard();
    showNameEntry(entry);
    if (restartBtn) restartBtn.innerText = "REJOUER";
    if (gameOverScreen) {
        gameOverScreen.classList.add('is-game-over');
        gameOverScreen.classList.remove('hidden');
    }
}

function triggerBonusBomb(bonusWord) {
    triggerScreenShake();
    createExplosion(gameW() / 2, gameH() / 2, '#eab308');

    activeWords.forEach(w => {
        if (w === bonusWord) return; // le mot bonus est déjà compté par updateGame
        if (w.element) {
            const c = getCenter(w.element);
            createExplosion(c.x, c.y, '#eab308');
            showFloatingText(c.x, c.y, `+${5 * scoreMultiplier}`, 'type-bomb-hit');
        }

        score += 5 * scoreMultiplier;
        wordsDestroyedInLevel++; wordsDestroyedTotal++;
        if (w.element && container && container.contains(w.element)) container.removeChild(w.element);
    });
    
    if (scoreElement) scoreElement.innerText = score;
    activeWords = [];
    targetedWord = null;
    
    const settings = getDifficultySettings();
    const displayElement = streakElement || comboMultiplierElement;
    if (displayElement) displayElement.innerText = `${wordsDestroyedInLevel}/${settings.wordsToNextLevel}`;
    playBombSound();
}
// ==========================================
// 5. APPARITIONS & LOGIQUE CYCLIQUEMENT MISE À JOUR
// ==========================================
function spawnWord() {
    const settings = getDifficultySettings();
    if (activeWords.length >= settings.maxWordsOnScreen) return;

    let filteredList = [];
    const dict = currentWordList();
    if (level === 1) filteredList = dict.filter(word => word.length <= 4);
    else if (level === 2) filteredList = dict.filter(word => word.length <= 5);
    else if (level === 3) filteredList = dict.filter(word => word.length <= 6);
    else filteredList = dict;

    if (filteredList.length === 0) filteredList = dict;

    // 🎯 Jamais deux mots à l'écran qui commencent par la même lettre :
    // la première lettre tapée désigne toujours un seul mot.
    const usedFirstLetters = new Set(activeWords.map(w => w.text[0]));
    filteredList = filteredList.filter(word => !usedFirstLetters.has(word[0]));
    if (filteredList.length === 0) return; // (presque impossible) on réessaiera au prochain tour
    const text = filteredList[Math.floor(Math.random() * filteredList.length)];
    
    const element = document.createElement('div');
    element.className = 'word-container';
    let posX = Math.random() * (gameW() * 0.7) + (gameW() * 0.15);
    element.style.left = posX + 'px';
    element.style.top = '0px';
    
    let wordType = 'NORMAL';
    const rand = Math.random();
    if (rand > 0.7 && rand <= 0.9) {
        wordType = 'RAPIDE';
        element.style.textShadow = '0 0 10px #ef4444';
    } else if (rand > 0.9) {
        wordType = 'BONUS';
        element.style.textShadow = '0 0 10px #eab308';
    }
    
    let htmlContent = "";
    for (let i = 0; i < text.length; i++) {
        const helperClass = (i === 0 && !targetedWord) ? "targetable" : "";
        let extraColor = '';
        if (wordType === 'RAPIDE') extraColor = 'color: #f87171;';
        if (wordType === 'BONUS') extraColor = 'color: #fef08a;';
        htmlContent += `<span class="letter ${helperClass}" data-i="${i}" style="${extraColor}">${text[i]}</span>`;
    }
    element.innerHTML = htmlContent;
    if (container) container.appendChild(element);

    // On s'assure que le mot ne dépasse pas sur les bords (important sur téléphone)
    const half = element.offsetWidth / 2;
    const margin = 8;
    posX = half * 2 + margin * 2 > gameW()
        ? gameW() / 2
        : Math.min(Math.max(posX, half + margin), gameW() - half - margin);
    element.style.left = posX + 'px';

    activeWords.push({
        text: text, element: element, posX: posX, posY: 0, typedIndex: 0, validatedIndex: 0, type: wordType,
        hits: new Array(text.length).fill(false), height: element.offsetHeight
    });
}

// Récupère la lettre n°i d'un mot (sans utiliser d'id, qui seraient en double entre plusieurs mots)
function getLetter(word, i) {
    return word.element ? word.element.querySelector(`[data-i="${i}"]`) : null;
}

function createLaser(startX, startY, targetX, targetY, targetWordRef, targetLetterIndex) {
    playLaserSound();
    const laserElement = document.createElement('div');
    laserElement.className = 'laser';
    laserElement.style.left = startX + 'px';
    laserElement.style.top = startY + 'px';
    
    const angle = Math.atan2(targetY - startY, targetX - startX);
    laserElement.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI/2}rad)`;
    if (container) container.appendChild(laserElement);

    const angleDeg = (angle * 180 / Math.PI) + 90;
    if (playerShip) playerShip.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;

    lasers.push({
        element: laserElement, x: startX, y: startY,
        vx: Math.cos(angle) * 35, vy: Math.sin(angle) * 35,
        wordRef: targetWordRef, targetIndex: targetLetterIndex
    });
}

function updateGame() {
    const settings = getDifficultySettings();
    spawnTimer++;
    if (spawnTimer >= settings.spawnDelay) { spawnWord(); spawnTimer = 0; }

    // Limite du bouclier : c'est perdu quand le bas d'un mot touche la ligne
    const shieldTop = shieldLine ? shieldLine.offsetTop : gameH() - 80;
    const speedFactor = gameMode === 'mobile' ? MOBILE_SPEED_FACTOR : 1;

    for (let i = activeWords.length - 1; i >= 0; i--) {
        let w = activeWords[i];
        const currentSpeed = (w.type === 'RAPIDE' ? settings.wordSpeed * 2 : settings.wordSpeed) * speedFactor;
        w.posY += currentSpeed;
        if (w.element) w.element.style.top = w.posY + 'px';
        if (w.posY + w.height > shieldTop) { triggerGameOver(); return; }
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.x += l.vx; l.y += l.vy;
        if (l.element) { l.element.style.left = l.x + 'px'; l.element.style.top = l.y + 'px'; }

        if (activeWords.includes(l.wordRef)) {
            const targetLetterElement = getLetter(l.wordRef, l.targetIndex);
            if (targetLetterElement) {
                const letterRect = localRect(targetLetterElement);
                if (l.y <= letterRect.bottom && l.y >= letterRect.top - 20) {
                    if (!l.wordRef.hits[l.targetIndex]) {
                        // Les lasers peuvent arriver dans le désordre (angles différents) :
                        // on mémorise l'impact puis on valide toutes les lettres consécutives touchées.
                        l.wordRef.hits[l.targetIndex] = true;
                        createExplosion(l.x, l.y, l.wordRef.type === 'BONUS' ? '#eab308' : '#38bdf8');
                        targetLetterElement.className = 'letter destroyed';
                        playHitSound();
                        while (l.wordRef.validatedIndex < l.wordRef.text.length && l.wordRef.hits[l.wordRef.validatedIndex]) {
                            l.wordRef.validatedIndex++;
                        }
                        const nextLetterElement = getLetter(l.wordRef, l.wordRef.validatedIndex);
                        if (nextLetterElement && !l.wordRef.hits[l.wordRef.validatedIndex]) nextLetterElement.className = 'letter active';

                        if (l.wordRef.validatedIndex === l.wordRef.text.length) {
                            let pointsGagnes = 10;
                            if (l.wordRef.type === 'RAPIDE') { pointsGagnes = 20; triggerScreenShake(); }
                            else if (l.wordRef.type === 'BONUS') { pointsGagnes = 30; triggerBonusBomb(l.wordRef); }
                            
                            // ✨ Points qui s'envolent depuis le mot détruit
                            if (l.wordRef.element) {
                                const c = getCenter(l.wordRef.element);
                                const pts = pointsGagnes * scoreMultiplier;
                                let tag = '';
                                if (l.wordRef.type === 'RAPIDE') tag = '<div class="float-tag">RAPIDE !</div>';
                                else if (l.wordRef.type === 'BONUS') tag = '<div class="float-tag">BOMBE !</div>';
                                const multi = scoreMultiplier > 1 ? `<span class="float-multi">x${scoreMultiplier}</span>` : '';
                                showFloatingText(c.x, c.y, `${tag}+${pts}${multi}`, 'type-' + l.wordRef.type.toLowerCase());
                            }

                            score += pointsGagnes * scoreMultiplier;
                            wordsDestroyedInLevel++; wordsDestroyedTotal++;
                            if (scoreElement) scoreElement.innerText = score;
                            playExplosionSound();
                            
                            if (l.wordRef.element && container && container.contains(l.wordRef.element)) container.removeChild(l.wordRef.element);
                            activeWords = activeWords.filter(item => item !== l.wordRef);
                            if (targetedWord === l.wordRef) targetedWord = null;
                            
                            const displayElement = streakElement || comboMultiplierElement;
                            if (displayElement) displayElement.innerText = `${wordsDestroyedInLevel}/${settings.wordsToNextLevel}`;

                            if (wordsDestroyedInLevel >= settings.wordsToNextLevel) {
                                level++; wordsDestroyedInLevel = 0;
                                if (levelElement) {
                                    levelElement.innerText = level;
                                    levelElement.style.color = '#00ffcc';
                                    setTimeout(() => levelElement.style.color = '#ffffff', 500);
                                }
                                const newSettings = getDifficultySettings();
                                if (streakElement) streakElement.innerText = `0/${newSettings.wordsToNextLevel}`;
                                showLevelBanner(level);
                                playLevelUpSound();
                                playLevelVoice(level, 450);
                            }
                            refreshTargetableHelpers();
                        }
                    }
                    if (l.element && container && container.contains(l.element)) container.removeChild(l.element); 
                    lasers.splice(i, 1); continue;
                }
            }
        }
        if (l.y < 0 || l.x < 0 || l.x > gameW()) {
            if (l.element && container && container.contains(l.element)) container.removeChild(l.element);
            lasers.splice(i, 1);
        }
    }
    updateHudBars();
}

function refreshTargetableHelpers() {
    if (targetedWord) return; // Ne fait rien si un mot est verrouillé
    activeWords.forEach(w => {
        if (w.typedIndex > 0) return; // mot déjà entamé : on ne touche pas à ses couleurs
        const firstLetter = getLetter(w, 0);
        if(firstLetter && !firstLetter.classList.contains('destroyed')) {
            firstLetter.className = 'letter targetable';
        }
    });
}

// ==========================================
// 6. ÉVÉNEMENTS CLAVIER (CIBLAGE SANS CONFLIT DE LETTRES)
// ==========================================
// Clavier physique
window.addEventListener('keydown', (e) => {
    // (les accents ^ et ¨ sont des "touches mortes" : la lettre accentuée arrive à la touche suivante, ex. "ê")
    if (!isPlaying || isPaused || e.key.length !== 1) return;
    let key = e.key.toUpperCase();
    // mode simple : é = E · mode avancé : seuls É et È comptent comme accents (ê = E, à = A...)
    if (difficulty !== 'avance' || !ACCENT_KEYS.includes(key)) key = stripAccents(key);
    handleLetter(key);
});

// Traite une lettre tapée (clavier physique OU clavier virtuel).
// Renvoie true si la lettre était correcte.
function handleLetter(keyPressed) {
    if (!isPlaying || isPaused || !playerShip) return false;
    const shipRect = localRect(playerShip);
    const shipX = shipRect.left + shipRect.width / 2; 
    const shipY = shipRect.top + shipRect.height / 2;
    let toucheCorrecte = false;

    if (targetedWord) {
        // --- CAS 1 : UN MOT EST DÉJÀ STRICTEMENT VERROUILLÉ ---
        const expectedLetter = targetedWord.text[targetedWord.typedIndex];
        if (keyPressed === expectedLetter) {
            toucheCorrecte = true;
            const letterElement = getLetter(targetedWord, targetedWord.typedIndex);
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

// ==========================================
// 6 BIS. PAUSE
// ==========================================
function pauseGame() {
    if (!isPlaying || isPaused) return;
    isPaused = true;
    clearInterval(gameInterval);
    gameInterval = null;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend(); // fige musique et sons
    // La voix se met en pause aussi (elle reprendra après le compte à rebours)
    if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; voicePlayer.dataset.pendingLevel = level; }
    else if (!voicePlayer.paused) {
        voicePlayer.pause();
        if (!voicePlayer.muted) voicePlayer.dataset.resume = '1'; // (muet = simple déblocage, rien à reprendre)
    }
    document.body.classList.add('is-paused');
    if (pauseScoreElement) pauseScoreElement.innerText = score;
    if (pauseLevelElement) pauseLevelElement.innerText = level;
    if (pauseScreen) pauseScreen.classList.remove('hidden');
}

// Reprise avec un compte à rebours 3, 2, 1 pour avoir le temps de se replacer
function resumeGame() {
    if (!isPlaying || !isPaused || isCountingDown) return;
    if (pauseScreen) pauseScreen.classList.add('hidden');
    isCountingDown = true;
    let n = 3;

    const tick = () => {
        if (!isPlaying || !isCountingDown) return;
        if (n === 0) {
            if (countdownElement) countdownElement.classList.remove('show');
            isCountingDown = false;
            isPaused = false;
            document.body.classList.remove('is-paused');
            if (audioCtx) audioCtx.resume();
            resumeVoice();
            gameInterval = setInterval(updateGame, 1000 / 60);
            return;
        }
        if (countdownElement) {
            countdownElement.innerText = n;
            countdownElement.classList.remove('show');
            void countdownElement.offsetWidth; // relance l'animation
            countdownElement.classList.add('show');
        }
        n--;
        countdownTimer = setTimeout(tick, 600);
    };
    tick();
}

// Annule un compte à rebours en cours et réaffiche l'écran de pause
function cancelCountdown() {
    if (!isCountingDown) return;
    clearTimeout(countdownTimer);
    isCountingDown = false;
    if (countdownElement) countdownElement.classList.remove('show');
    if (pauseScreen) pauseScreen.classList.remove('hidden');
}

// Abandonne la partie et revient au menu principal
function quitToMenu() {
    clearTimeout(countdownTimer);
    isCountingDown = false;
    isPlaying = false;
    isPaused = false;
    clearInterval(gameInterval);
    gameInterval = null;
    clearVoiceResume();
    stopVoice();
    // Une partie abandonnée ne compte pas dans le Top 3 (seules les parties terminées comptent)
    clearField();

    document.body.classList.remove('is-playing', 'is-paused');
    if (pauseScreen) pauseScreen.classList.add('hidden');
    applyLayout(false);

    if (audioCtx) audioCtx.resume().then(() => stopMusic()).catch(() => {});

    if (screenTitle) screenTitle.innerHTML = initialTitle;
    if (screenStats) screenStats.innerHTML = initialStats;
    if (restartBtn) restartBtn.innerText = 'COMMENCER';
    showNameEntry(null);
    boardHighlight = null;
    showRankText('');
    renderLeaderboard();
    refreshOnline();
    if (gameOverScreen) {
        gameOverScreen.classList.remove('is-game-over');
        gameOverScreen.classList.remove('hidden');
    }
    updateMenuButtons();
}

if (pauseBtn) pauseBtn.addEventListener('click', () => {
    pauseBtn.blur();
    if (isCountingDown) return;
    if (isPaused) resumeGame(); else pauseGame();
});
if (resumeBtn) resumeBtn.addEventListener('click', () => { resumeBtn.blur(); resumeGame(); });
if (quitBtn) quitBtn.addEventListener('click', () => { quitBtn.blur(); quitToMenu(); });

// Pause automatique si on quitte l'onglet / l'application (appel, notification...)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (isCountingDown) cancelCountdown();
    else pauseGame();
});

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
