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
        const simple = (theme === 'tous' || !WORD_THEMES[theme]) ? wordList : cleanSimple(WORD_THEMES[theme]);
        if (diff === 'avance') themeCache[key] = theme === 'tous' ? wordListAdvanced : toAdvanced(simple);
        else if (diff === 'baby') {
            // 🍼 Baby : seulement des mots courts (5 lettres maximum, 6 si le thème en a trop peu)
            const short = simple.filter(w => w.length <= 5);
            themeCache[key] = short.length >= 25 ? short : simple.filter(w => w.length <= 6);
        }
        else themeCache[key] = simple;
    }
    return themeCache[key];
}

// 🎚️ Difficulté choisie dans le menu : 'simple' (sans accents) ou 'avance' (avec accents)
let difficulty = (() => {
    try { const v = localStorage.getItem('typing_shooter_difficulty'); return ['baby', 'avance'].includes(v) ? v : 'simple'; }
    catch (e) { return 'simple'; }
})();

// 📝 Mode PHRASES : courtes phrases avec des espaces (aucun mot à accent, pour qu'elles soient justes partout)
const PHRASES = [
    "AU REVOIR", "ALLONS JOUER", "ATTENTION AU LASER", "AU LIT LES ROBOTS",
    "BONJOUR PILOTE", "BRAVO CAPITAINE", "BON VOYAGE", "BONNE NUIT", "BIENVENUE PILOTE",
    "CHAQUE JOUR COMPTE", "CAP SUR MARS", "CE ROBOT DANSE",
    "DEUX CHATS JOUENT", "DES ROBOTS PARTOUT", "DORS BIEN", "DIX FOIS BRAVO",
    "ELLE NAGE VITE", "EN AVANT TOUTE", "ENCORE UN TOUR", "ET HOP",
    "FONCE VERS LA LUNE", "FAIS UN SOURIRE", "FERME LA PORTE",
    "GARDE LE CAP", "GO GO GO", "GRAND BRAVO",
    "HOP UN SAUT", "HAUT LES MAINS", "HUIT CHIENS COURENT",
    "IL FAIT BEAU", "IL PLEUT ENCORE", "ICI LA BASE", "IL Y A UN OURS",
    "JE TAPE VITE", "JE SUIS UN PILOTE", "JOUONS ENSEMBLE", "JUPITER EST LOIN",
    "KIWI LE ROBOT", "KOALA DORT",
    "LE CHAT DORT", "LA LUNE BRILLE", "LE ROBOT DANSE", "LA PLUIE TOMBE", "LE CIEL EST BLEU",
    "LES OISEAUX CHANTENT", "LE LION RUGIT", "LA MER EST CALME",
    "MON CHIEN JOUE", "MAMAN CHANTE", "MARS EST ROUGE", "MERCI BEAUCOUP", "MON AMI RIT",
    "NOUS VOLONS HAUT", "NOUS GAGNONS", "NE BOUGE PAS", "NOIR COMME LA NUIT",
    "ON JOUE DEHORS", "OUVRE LA PORTE", "OUI CAPITAINE", "ON Y VA",
    "PAPA RIT", "PAUL LIT UN LIVRE", "PAS DE PANIQUE", "PRENDS TON TEMPS", "POUR LA VICTOIRE",
    "QUEL BEAU CIEL", "QUEL GRAND ROBOT", "QUI VA GAGNER",
    "ROBOT EN MISSION", "RESTE CALME", "RIEN NE VA PLUS", "RIONS ENSEMBLE",
    "SALUT LES AMIS", "SUPER MISSION", "SAUTE PLUS HAUT", "SOIS PRUDENT",
    "TOUT VA BIEN", "TOM COURT VITE", "TROIS DRAGONS VOLENT", "TAPE PLUS VITE", "TOM MANGE UNE POMME",
    "UN CHIEN JOUE", "UN DRAGON VOLE", "UNE SOURIS GRISE", "UN DEUX TROIS",
    "VITE AU VAISSEAU", "VOICI LA LUNE", "VIVE LES ROBOTS", "VOLE COMME UN OISEAU",
    "WAGON DE ROBOTS",
    "YOUPI ON GAGNE", "YOUPI LES VACANCES",
    "ZUT ALORS", "ZOOM SUR LA LUNE"
].filter(p => /^[A-Z ]+$/.test(p));

// 🎮 Type de partie : 'classique', 'defi' (défi du jour), 'entrainement', 'dictee', 'phrases'
const GAME_TYPES = ['classique', 'defi', 'entrainement', 'dictee', 'phrases'];
const GAME_TYPE_LABELS = { classique: 'Classique', defi: 'Défi du jour', entrainement: 'Entraînement', dictee: 'Dictée', phrases: 'Phrases' };
// Niveaux de difficulté : 'baby' (tout-petits), 'simple' (sans accents), 'avance' (é et è)
const DIFFICULTIES = ['baby', 'simple', 'avance'];
const DIFFICULTY_LABELS = { baby: 'BABY', simple: 'SIMPLE', avance: 'AVANCÉ' };
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
const effectiveTheme = () => (gameType === 'defi' || gameType === 'phrases' ? 'tous' : wordTheme);

// ==========================================
// 🗣️ MOTS DE LA DICTÉE
// ==========================================
// Thème de chaque mot (pour afficher un indice : 🐾, 🍕, 🚀...)
const THEME_OF_WORD = {};
Object.entries(WORD_THEMES).forEach(([theme, list]) => list.forEach(w => { if (!THEME_OF_WORD[w]) THEME_OF_WORD[w] = theme; }));
const themeOfWord = (w) => THEME_OF_WORD[w] || THEME_OF_WORD[stripAccentsWord(w)] || null;
const themeIcon = (theme) => (theme && THEME_LABELS[theme] ? THEME_LABELS[theme].split(' ')[0] : '');
function stripAccentsWord(w) { return w.normalize('NFD').replace(/[̀-ͯ]/g, ''); }

// Mots qui se prononcent comme d'autres (impossible de savoir lequel écrire en l'entendant seul)
const DICTATION_HOMOPHONES = new Set([
    "COURS", "COURT", "VERRE", "VERT", "MER", "MERE", "PERE", "PAIN", "SEL", "PORT", "SAUT", "CERF", "VENT",
    "MUR", "LIT", "NEZ", "LAIT", "RIZ", "THE", "ILE", "EAU", "OR", "COQ", "MAIN", "BAS", "HAUT", "FIN", "TOUR",
    "BOIS", "FOIS", "VOIX", "TEMPS", "SANG", "CENT", "VIN", "PEAU", "POT", "AMI", "COU", "COUP", "BOUT", "MAIS",
    "PATES", "FRITES", "CISEAUX", "ELEVE", "PECHE", "CHAMP", "CHANT", "BALLE", "BAL", "LAC", "ROUE", "SOL",
    "PLUTON", "MARS", "SIRIUS", "QUIZ", "WIFI", "MATCH", "DE", "RE", "NE", "DÉ", "RÉ", "NÉ", "LÀ", "OÙ", "ÇA"
]);
// Bon mot pour la dictée : un nom (pas de verbe ni d'adjectif), assez long, sans homophone connu
function isDictationWord(w) {
    const theme = themeOfWord(w);
    // (sans thème = mots ajoutés du mode avancé, mélange de verbes et d'adjectifs : on les écarte)
    if (!theme || theme === 'verbes' || theme === 'adjectifs') return false;
    if (w.length < 3) return false;
    return !DICTATION_HOMOPHONES.has(w) && !DICTATION_HOMOPHONES.has(stripAccentsWord(w));
}

function currentWordList() {
    if (gameType === 'phrases') {
        // Baby : seulement les phrases courtes
        return effectiveDifficulty() === 'baby' ? PHRASES.filter(p => p.length <= 13) : PHRASES;
    }
    const list = themeWords(effectiveTheme(), effectiveDifficulty());
    if (gameType !== 'dictee') return list;
    const nouns = list.filter(isDictationWord);
    return nouns.length >= 20 ? nouns : list; // (thème "Verbes" choisi : on garde ses mots quand même)
}

// Enlève les accents (en mode simple, taper "é" compte comme "E")
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
