// ==========================================
// Alpha Strike — words.js : dictionnaires de mots
// (fichier chargé par index.html, dans l'ordre : voir la liste en bas de index.html)
// ==========================================

// 📖 Dictionnaire (sans accents). Les doublons éventuels sont retirés automatiquement.
// Mots rangés par thème (le joueur peut choisir un thème dans le menu)
const WORD_THEMES = {
    animaux: [
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
    ],
    nature: [
    "DESERT", "JUNGLE", "FLEUVE", "OCEAN", "NATURE", "ANIMAL", "PLANTE", "FORET", "MER", "LAC",
    "ILE", "RIVIERE", "CASCADE", "PLAGE", "SABLE", "ROCHER", "CAILLOU", "GROTTE", "COLLINE", "VALLEE",
    "PRAIRIE", "ARBRE", "FEUILLE", "BRANCHE", "RACINE", "FLEUR", "ROSE", "TULIPE", "HERBE", "MOUSSE",
    "SOLEIL", "LUNE", "NUAGE", "PLUIE", "NEIGE", "ORAGE", "ECLAIR", "TONNERRE", "VENT", "BRUME",
    "GLACE", "GIVRE", "ARC", "AUBE", "NUIT", "JOUR", "MATIN", "SOIR", "HIVER", "ETE",
    "AUTOMNE", "PRINTEMPS", "SAISON", "TEMPETE", "TORNADE", "OURAGAN", "VAGUE", "MAREE", "ICEBERG", "GLACIER",
    ],
    espace: [
    "ESPACE", "PLANETE", "ETOILE", "FUSEE", "MOTEUR", "VOLCAN", "MONTAGNE", "CAMPAGNE", "UNIVERS", "GALAXIE",
    "ASTEROIDE", "COMETE", "ORBITE", "SATELLITE", "COSMOS", "ASTRONAUTE", "NAVETTE", "CRATERE", "METEORE", "NEBULEUSE",
    "MARS", "VENUS", "JUPITER", "SATURNE", "URANUS", "NEPTUNE", "MERCURE", "TERRE", "PLUTON", "SIRIUS",
    "ALIEN", "OVNI", "RADAR", "SIGNAL", "LASER", "PLASMA", "ENERGIE", "BOUCLIER", "CAPSULE", "STATION",
    "PILOTE", "COCKPIT", "HUBLOT", "ANTENNE", "TELESCOPE", "GRAVITE", "ECLIPSE", "QUASAR", "PULSAR", "ZENITH",
    ],
    ecole: [
    "LIVRE", "COURS", "TEXTE", "CODE", "ROBOT", "CLASSE", "ECOLE", "CAHIER", "CRAYON", "PAPIER",
    "DESSIN", "DICTEE", "REGLE", "BUREAU", "LECON", "CALCUL", "LOGIQUE", "SCIENCE", "HISTOIRE",
    "LECTURE", "ECRITURE", "FENETRE", "TABLEAU", "COMPTEUR", "EXERCICE", "GYMNASE", "JEUNESSE",
    "GOMME", "STYLO", "FEUTRE", "TROUSSE", "CARTABLE", "CISEAUX", "COLLE", "EQUERRE", "COMPAS", "ATLAS",
    "MOT", "LETTRE", "PHRASE", "VERBE", "NOM", "CHIFFRE", "NOMBRE", "ADDITION", "QUIZ", "QUESTION",
    "REPONSE", "DEVOIR", "RECREATION", "MAITRE", "ELEVE", "AMI", "COPAIN", "CANTINE", "SONNERIE", "DIPLOME",
    ],
    aventure: [
    "JEU", "OR", "ROI", "PIRATE", "NAVIRE", "MAGIE", "DRAGON", "DONJON", "MONSTRE", "ZOMBIE",
    "FANTOME", "SORCIER", "TRESOR", "CHATEAU", "CHASSEUR", "BOUSSOLE", "SQUELETTE", "CHEVALIER",
    "LEGENDE", "MYSTERE", "VICTOIRE", "COMBAT", "DEFENSE", "MISSION", "TACTIQUE", "COURAGE",
    "REINE", "PRINCE", "PRINCESSE", "FEE", "ELFE", "NAIN", "GEANT", "TROLL", "OGRE", "GOBELIN",
    "EPEE", "ARMURE", "CASQUE", "LANCE", "ARC", "FLECHE", "POTION", "GRIMOIRE", "BAGUETTE", "SORT",
    "CARTE", "ILE", "CORSAIRE", "ANCRE", "VOILE", "CANON", "COFFRE", "BIJOU", "RUBIS", "SAPHIR",
    "EMERAUDE", "DIAMANT", "PERLE", "COURONNE", "SCEPTRE", "TRONE", "ROYAUME", "EMPIRE", "HEROS", "NINJA",
    "SAMOURAI", "VIKING", "MOMIE", "VAMPIRE", "YETI", "KRAKEN", "HYDRE", "PHENIX", "GRIFFON", "LICORNE",
    "QUETE", "EXPLORATEUR", "AVENTURE", "VOYAGE", "PIEGE", "INDICE", "ENIGME", "PORTAIL", "TUNNEL", "LABYRINTHE",
    ],
    maison: [
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
    ],
    nourriture: [
    "RIZ", "THE", "LAIT", "OEUF", "MIEL", "SUCRE", "SEL", "BEURRE", "FROMAGE", "YAOURT",
    "GATEAU", "BISCUIT", "BONBON", "CHOCOLAT", "CREPE", "GAUFRE", "TARTE", "GLACON", "SOUPE", "SALADE",
    "PIZZA", "PATES", "FRITES", "BURGER", "SANDWICH", "TOMATE", "CAROTTE", "OIGNON", "CITRON", "ORANGE",
    "BANANE", "FRAISE", "CERISE", "POIRE", "PECHE", "ABRICOT", "MANGUE", "ANANAS", "KIWI", "RAISIN",
    "OLIVE", "NOIX", "NOISETTE", "AMANDE", "VANILLE", "CARAMEL", "JUS", "SIROP", "QUICHE", "WIFI",
    ],
    sport: [
    "MAIN", "PIED", "BRAS", "JAMBE", "TETE", "NEZ", "OEIL", "BOUCHE", "DENT", "OREILLE",
    "SPORT", "FOOT", "BASKET", "TENNIS", "JUDO", "KARATE", "BOXE", "RUGBY", "GOLF", "NATATION",
    "COURSE", "SAUT", "MATCH", "EQUIPE", "ARBITRE", "BUT", "PODIUM", "MEDAILLE", "TROPHEE", "CHAMPION",
    ],
    verbes: [
    "VOIR", "FAIRE", "DIRE", "LIRE", "JOUER", "TAPER", "PARLER", "MARCHER", "COURIR", "SAUTER",
    "NAGER", "VOLER", "AIMER", "AIDER", "REVER", "ECRIRE", "PENSER", "TROUVER", "GAGNER", "PERDRE",
    "CHOISIR", "GRANDIR", "REUSSIR", "PARTAGER", "COOPERER", "DECOUVRIR", "INVENTER",
    "ALLER", "VENIR", "PARTIR", "ARRIVER", "CHANTER", "DANSER", "RIRE", "SOURIRE", "DORMIR", "MANGER",
    "BOIRE", "CUIRE", "OUVRIR", "FERMER", "TIRER", "VISER", "LANCER", "ATTRAPER", "GRIMPER", "ROULER",
    "PLONGER", "GLISSER", "FILER", "FONCER", "TOURNER", "BRILLER", "EXPLORER", "CONSTRUIRE", "DESSINER", "COMPTER",
    "UNIR", "USER", "IMITER", "IGNORER", "JETER", "JONGLER", "KLAXONNER", "QUITTER", "YOUPI", "ZOOMER",
    ],
    adjectifs: [
    "BON", "BEAU", "FORT", "VITE", "GRAND", "PETIT", "RAPIDE", "SOLIDE", "CALME", "JOYEUX",
    "SOLAIRE", "SPATIAL", "SUPERBE", "VISIBLE", "BRILLANT", "MAGNIFIQUE", "AMUSANT",
    "GENIAL", "AGILE", "HABILE", "BRAVE", "FRANC", "FUTE", "PROPRE",
    "DOUX", "DUR", "FOU", "VRAI", "FAUX", "NEUF", "VIEUX", "JEUNE", "LOURD", "LEGER",
    "CHAUD", "FROID", "HAUT", "BAS", "LONG", "COURT", "LARGE", "ETROIT", "PROFOND", "IMMENSE",
    "ROUGE", "BLEU", "VERT", "JAUNE", "NOIR", "BLANC", "GRIS", "VIOLET", "ROSE", "DORE",
    "MALIN", "GENTIL", "CURIEUX", "PRUDENT", "TIMIDE", "HEUREUX", "INVINCIBLE", "UNIQUE", "ULTRA", "ZEN",
    "WESTERN", "WEEKEND", "YOGA", "ZIGZAG", "QUATRE", "QUINZE", "ONZE", "DOUZE", "MILLE"
    ]
};

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

// Nettoie une liste du mode simple (majuscules A-Z, sans doublons)
const cleanSimple = (list) => [...new Set(list.filter(w => /^[A-Z]+$/.test(w)))];
// Version "avancée" d'une liste : vraie orthographe, seulement les accents é / è
const toAdvanced = (list, extra = []) => [...new Set(
    list.filter(w => !NOT_IN_ADVANCED.has(w)).map(w => ACCENTED_SPELLING[w] || w).concat(extra)
)].filter(w => ADVANCED_WORD_REGEX.test(w));

// Tous les mots (thème "Tous")
const wordList = cleanSimple(Object.values(WORD_THEMES).flat());
const wordListAdvanced = toAdvanced(wordList, ADVANCED_EXTRA);

// 🗂️ Thèmes proposés dans le menu
const THEME_LABELS = {
    tous: '🌌 Tous les mots', animaux: '🐾 Animaux', nature: '🌿 Nature & météo', espace: '🚀 Espace',
    ecole: '📚 École', aventure: '🐉 Aventure', maison: '🏠 Maison & objets', nourriture: '🍕 Nourriture',
    sport: '⚽ Corps & sport', verbes: '🏃 Verbes', adjectifs: '✨ Adjectifs'
};
const themeCache = {};
function themeWords(theme, diff) {
    const key = theme + '|' + diff;
    if (!themeCache[key]) {
        if (theme === 'tous' || !WORD_THEMES[theme]) themeCache[key] = diff === 'avance' ? wordListAdvanced : wordList;
        else {
            const simple = cleanSimple(WORD_THEMES[theme]);
            themeCache[key] = diff === 'avance' ? toAdvanced(simple) : simple;
        }
    }
    return themeCache[key];
}

// 🎚️ Difficulté choisie dans le menu : 'simple' (sans accents) ou 'avance' (avec accents)
let difficulty = (() => {
    try { return localStorage.getItem('typing_shooter_difficulty') === 'avance' ? 'avance' : 'simple'; }
    catch (e) { return 'simple'; }
})();

// 🎮 Type de partie : 'classique', 'defi' (défi du jour), 'entrainement', 'dictee'
const GAME_TYPES = ['classique', 'defi', 'entrainement', 'dictee'];
const GAME_TYPE_LABELS = { classique: 'Classique', defi: 'Défi du jour', entrainement: 'Entraînement', dictee: 'Dictée' };
let gameType = (() => {
    try { const v = localStorage.getItem('typing_shooter_mode'); return GAME_TYPES.includes(v) ? v : 'classique'; }
    catch (e) { return 'classique'; }
})();
let wordTheme = (() => {
    try { const v = localStorage.getItem('typing_shooter_theme'); return THEME_LABELS[v] ? v : 'tous'; }
    catch (e) { return 'tous'; }
})();

// Le défi du jour se joue toujours avec tous les mots, en mode simple (pour que tout le monde ait les mêmes)
const effectiveDifficulty = () => (gameType === 'defi' ? 'simple' : difficulty);
const effectiveTheme = () => (gameType === 'defi' ? 'tous' : wordTheme);
const currentWordList = () => themeWords(effectiveTheme(), effectiveDifficulty());

// Enlève les accents (en mode simple, taper "é" compte comme "E")
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
