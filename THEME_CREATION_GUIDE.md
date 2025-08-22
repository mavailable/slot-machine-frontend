# 🎨 Guide de Création de Thèmes - Slot Machine Frontend

Guide complet pour créer et intégrer vos propres thèmes dans la machine à sous.

## 📋 Table des matières
- [Structure de fichiers](#-structure-de-fichiers)
- [Configuration JSON](#-configuration-json)
- [Types de symboles](#-types-de-symboles)
- [Arrière-plans](#️-arrière-plans)
- [Interface utilisateur (HUD)](#-interface-utilisateur-hud)
- [Polices personnalisées](#-polices-personnalisées)
- [Sons et audio](#-sons-et-audio)
- [Recommandations techniques](#-recommandations-techniques)
- [Éléments obligatoires vs optionnels](#-éléments-obligatoires-vs-optionnels)
- [Installation et test](#-installation-et-test)

---

## 📁 Structure de fichiers

### Structure complète recommandée
```
assets/themes/mon-theme/
├─ theme.json          # ✅ OBLIGATOIRE - Configuration principale
├─ README.md          # ℹ️ Optionnel - Documentation du thème
├─ background/        # 🖼️ Optionnel - Images de fond
│  ├─ bg.png
│  ├─ bg.jpg
│  └─ bg.webp
├─ symbols/           # 🎲 Conditionnel - Si symbolsType = "image"
│  ├─ symbol-01.png
│  ├─ symbol-02.png
│  ├─ symbol-03.png
│  ├─ symbol-04.png
│  ├─ symbol-05.png
│  ├─ symbol-06.png
│  ├─ symbol-07.png
│  ├─ symbol-08.png
│  └─ symbol-09.png
├─ fonts/             # 🔤 Optionnel - Polices personnalisées
│  ├─ ma-police.woff2
│  └─ ma-police-bold.woff2
└─ audio/             # 🔊 Optionnel - Sons du thème
   ├─ ambient.mp3
   ├─ spin-start.wav
   ├─ win.mp3
   └─ reel-stop.wav
```

### Conventions de nommage
- **ID du thème** : `kebab-case` (ex: `pirate-treasure`, `neon-city`)
- **Fichiers images** : `kebab-case.extension` (ex: `treasure-chest.png`)
- **Sons** : descriptifs (`spin.wav`, `win.mp3`, `ambient.ogg`)

---

## ⚙️ Configuration JSON

### Structure du `theme.json`
```json
{
  "id": "mon-theme",                    // ✅ OBLIGATOIRE
  "name": "Mon Thème Magnifique",       // ✅ OBLIGATOIRE
  "symbolsType": "image",               // ✅ OBLIGATOIRE: "emoji" | "image"
  "symbols": [...],                     // ✅ OBLIGATOIRE: 7-9 symboles
  "ui": {                              // ✅ OBLIGATOIRE
    "background": {...},               // 🎨 Optionnel mais recommandé
    "hud": {...},                      // 🎨 Optionnel mais recommandé
    "glass": {...},                    // 🎨 Optionnel
    "accent": "#FF6B35",               // 🎨 Optionnel
    "accent2": "#F7931E"               // 🎨 Optionnel
  },
  "audio": {                           // 🔊 Optionnel — sons du thème
    "ambient": "audio/ambient.mp3",
    "effects": {
      "spin": "audio/spin-start.wav",     // alias: spinStart
      "reelStop": "audio/reel-stop.wav",
      "win": "audio/win-small.mp3",
      "bigWin": "audio/win-big.mp3",
      "jackpot": "audio/jackpot.mp3",
      "buttonClick": "audio/button-click.wav", // alias: click
      "error": "audio/error.wav"
    }
  }
}
```

### Propriétés principales

#### ✅ `id` (string) - OBLIGATOIRE
```json
"id": "pirate-treasure"
```
- Identifiant unique du thème
- Format : `kebab-case`
- Utilisé dans l'URL et les références

#### ✅ `name` (string) - OBLIGATOIRE
```json
"name": "Pirate's Treasure"
```
- Nom affiché dans l'interface
- Format libre, caractères spéciaux autorisés

#### ✅ `symbolsType` (string) - OBLIGATOIRE
```json
"symbolsType": "image"   // ou "emoji"
```
- **`"emoji"`** : Utilise des émojis Unicode
- **`"image"`** : Utilise des fichiers PNG dans `symbols/`

#### ✅ `symbols` (array) - OBLIGATOIRE
Pour les émojis :
```json
"symbols": ["🏴‍☠️", "💰", "⚓", "🗡️", "💎", "🦜", "🏴"]
```

Pour les images :
```json
"symbols": [
  "symbols/treasure-chest.png",
  "symbols/pirate-flag.png",
  "symbols/anchor.png",
  "symbols/sword.png",
  "symbols/diamond.png",
  "symbols/parrot.png",
  "symbols/skull.png"
]
```

**Nombre de symboles :**
- **Minimum** : 7 symboles
- **Recommandé** : 8-9 symboles
- **Maximum** : 12 symboles

---

## 🎲 Types de symboles

### Option 1: Émojis (`symbolsType: "emoji"`)
```json
{
  "symbolsType": "emoji",
  "symbols": [
    "🥥", "🌴", "🎸", "🐠", 
    "🍹", "🌸", "🪙"
  ]
}
```

**Avantages :**
- ✅ Pas de fichiers à créer
- ✅ Rendu uniforme
- ✅ Léger en taille

**Inconvénients :**
- ❌ Style limité
- ❌ Dépendant du système

### Option 2: Images (`symbolsType: "image"`)
```json
{
  "symbolsType": "image", 
  "symbols": [
    "symbols/coconut.png",
    "symbols/palm-tree.png",
    "symbols/guitar.png",
    "symbols/tropical-fish.png",
    "symbols/cocktail.png",
    "symbols/flower.png",
    "symbols/coin.png"
  ]
}
```

**Spécifications techniques :**
- **Format** : PNG avec transparence
- **Taille** : 200x200px (minimum 128x128px)
- **Résolution** : 72-96 DPI
- **Poids** : <50KB par fichier recommandé
- **Fond** : Transparent (alpha channel)

---

## 🖼️ Arrière-plans

### Image de fond
```json
"ui": {
  "background": {
    "image": "background/bg.png"
  }
}
```

**Spécifications :**
- **Résolution** : 1920x1080px (Full HD)
- **Format** : PNG, JPG, ou WebP
- **Ratio** : 16:9 recommandé
- **Poids** : <500KB recommandé
- **Design** : Prévoir les zones d'interface (HUD, boutons)

**Utilité :** Définit l'image de fond principale du jeu. L'image couvre tout l'écran et sert de toile de fond pour l'interface de jeu.

### Dégradé CSS
```json
"ui": {
  "background": {
    "gradient": "radial-gradient(1400px 900px at 20% 15%, #174a4a 0%, #0a2a2a 40%, #061a1a 100%)"
  }
}
```

**Utilité :** Crée un arrière-plan dégradé dynamique sans fichier image. Idéal pour des thèmes minimalistes ou pour réduire le temps de chargement.

### Couleur unie
```json
"ui": {
  "background": {
    "color": "#1a1a2e"
  }
}
```

**Utilité :** Définit une couleur de fond simple et uniforme. Solution la plus légère pour les thèmes épurés.

**Ordre de priorité :** `image` > `gradient` > `color`

---

## 🎮 Interface utilisateur (HUD)

### Configuration complète du HUD
```json
"ui": {
  "hud": {
    "bg": "rgba(11, 62, 74, 0.65)",      // Fond semi-transparent (60-70% opacité)
    "border": "rgba(26, 206, 199, 0.12)", // Bordure subtile
    "blur": 10,                          // Flou backdrop (px)
    "text": "#F4F9FF",                   // Couleur texte principal
    "label": "#F6D087",                  // Couleur des labels
    "accent": "#FFC04D",                 // Couleur d'accentuation
    "font": {                            // Police personnalisée
      "family": "Ma Police Custom",
      "files": [
        {
          "src": "fonts/ma-police.woff2",
          "weight": "400",
          "style": "normal"
        }
      ]
    }
  }
}
```

### Détail des paramètres HUD

#### `bg` - Arrière-plan du HUD
```json
"bg": "rgba(11, 62, 74, 0.65)"
```
- **Utilité** : Définit la couleur de fond du panneau d'informations (Crédit/Mise/Gain)
- **Format** : Couleur CSS (hex, rgba, hsl)
- **Recommandation** : Utiliser rgba avec opacité 0.6-0.7 (60-70%) pour une bonne lisibilité
- **Effet** : Crée un overlay semi-transparent sur l'arrière-plan du jeu
- **Zone d'application** : Panel HUD flottant en bas-gauche

#### `border` - Bordure du HUD
```json
"border": "rgba(26, 206, 199, 0.12)"
```
- **Utilité** : Couleur de la bordure subtile autour du HUD
- **Format** : Couleur CSS avec transparence recommandée
- **Effet** : Délimite visuellement le panel HUD du reste de l'interface
- **Recommandation** : Opacité faible (0.1-0.2) pour un effet discret

#### `blur` - Flou d'arrière-plan
```json
"blur": 10
```
- **Utilité** : Intensité du flou appliqué derrière le HUD (backdrop-filter)
- **Format** : Nombre en pixels (0-50)
- **Effet** : Floute l'arrière-plan visible sous le HUD pour améliorer la lisibilité
- **Recommandation** : 8-15px pour un effet moderne sans surcharge

#### `text` - Couleur du texte principal
```json
"text": "#F4F9FF"
```
- **Utilité** : Couleur des valeurs numériques (crédit, mise, gain)
- **Format** : Couleur CSS
- **Zone d'application** : Nombres affichés dans le HUD
- **Recommandation** : Contraste élevé avec le fond (ratio 4.5:1 minimum)

#### `label` - Couleur des étiquettes
```json
"label": "#F6D087"
```
- **Utilité** : Couleur des labels "Crédit", "Mise", "Gain"
- **Format** : Couleur CSS
- **Effet** : Différencie visuellement les étiquettes des valeurs
- **Recommandation** : Couleur complémentaire ou accent de votre thème

#### `accent` - Couleur d'accentuation
```json
"accent": "#FFC04D"
```
- **Utilité** : Couleur des boutons +/- de mise et éléments interactifs du HUD
- **Format** : Couleur CSS
- **Zone d'application** : Boutons de contrôle, états hover, focus
- **Recommandation** : Couleur vive et contrastée pour l'interactivité

### Effets de verre
```json
"ui": {
  "glass": {
    "blur": 26,      // Flou des rouleaux (px)
    "tint": 0.16     // Teinte overlay (0-1)
  }
}
```

### Détail des paramètres Glass

#### `blur` - Flou des rouleaux
```json
"blur": 26
```
- **Utilité** : Intensité du flou appliqué à la zone des rouleaux
- **Format** : Nombre en pixels (0-50)
- **Effet** : Crée un effet de verre dépoli sur l'arrière-plan visible sous les rouleaux
- **Zone d'application** : Conteneur des 5 rouleaux de jeu
- **Recommandation** : 20-30px pour un effet glass moderne

#### `tint` - Teinte d'overlay
```json
"tint": 0.16
```
- **Utilité** : Intensité de la teinte sombre appliquée sur les rouleaux
- **Format** : Nombre décimal entre 0 et 1
- **Effet** : Assombrit légèrement la zone pour améliorer le contraste des symboles
- **Recommandation** : 0.1-0.2 pour un effet subtil

### Couleurs d'accent globales
```json
"ui": {
  "accent": "#FFC04D",   // Accent principal
  "accent2": "#FF8A3D"   // Accent secondaire
}
```

### Détail des accents globaux

#### `accent` - Couleur principale
```json
"accent": "#FFC04D"
```
- **Utilité** : Couleur d'accent principale du thème
- **Zone d'application** : Boutons principaux, highlights, états actifs
- **Effet** : Définit l'identité visuelle du thème
- **Recommandation** : Couleur signature de votre thème

#### `accent2` - Couleur secondaire
```json
"accent2": "#FF8A3D"
```
- **Utilité** : Couleur d'accent secondaire pour la variété
- **Zone d'application** : Boutons secondaires, états hover, décorations
- **Effet** : Complète la palette de couleurs du thème
- **Recommandation** : Couleur harmonieuse avec l'accent principal

---

## 🔤 Polices personnalisées

### Configuration dans le JSON
```json
"ui": {
  "hud": {
    "font": {
      "family": "Laguna Grotesk",
      "files": [
        {
          "src": "fonts/laguna-grotesk-regular.woff2",
          "weight": "400",
          "style": "normal"
        },
        {
          "src": "fonts/laguna-grotesk-bold.woff2", 
          "weight": "700",
          "style": "normal"
        }
      ]
    }
  }
}
```

### Détail des paramètres de police

#### `family` - Nom de la famille de police
```json
"family": "Laguna Grotesk"
```
- **Utilité** : Nom CSS de la police à utiliser dans le HUD
- **Format** : String, exactement comme dans CSS font-family
- **Effet** : Définit la police pour tous les textes du HUD
- **Fallback** : Police système si non trouvée

#### `files` - Fichiers de police
```json
"files": [
  {
    "src": "fonts/laguna-grotesk-regular.woff2",
    "weight": "400", 
    "style": "normal"
  }
]
```

**Paramètres de chaque fichier :**

- **`src`** : Chemin relatif vers le fichier WOFF2
- **`weight`** : Poids de la police (100-900)
  - 400 = normal/regular
  - 700 = bold/gras
  - 300 = light
  - 600 = semi-bold
- **`style`** : Style de la police
  - "normal" = droit
  - "italic" = italique

**Utilité :** Permet de charger plusieurs variantes d'une même police (regular, bold, italic) pour enrichir la typographie du HUD.

### Spécifications techniques
- **Format supporté** : WOFF2 uniquement
- **Weights disponibles** : 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Styles supportés** : normal, italic
- **Taille recommandée** : <100KB par fichier
- **Fallback** : La police système sera utilisée si la police ne charge pas

### Licences
⚠️ **Important** : Vérifiez toujours les licences des polices
- Polices gratuites : Google Fonts, Font Squirrel
- Polices commerciales : Adobe Fonts, MyFonts
- Polices open source : GitHub, Open Font Library

---

## 🔊 Sons et audio

### Structure recommandée
```
audio/
├─ ambient.mp3        # Musique d'ambiance (boucle)
├─ spin-start.wav     # Son de démarrage des rouleaux
├─ reel-stop.wav      # Son d'arrêt d'un rouleau
├─ win-small.mp3      # Petite victoire
├─ win-big.mp3        # Grosse victoire
├─ jackpot.mp3        # Jackpot
└─ button-click.wav   # Clic de bouton
```

### Formats supportés
- **MP3** : Musique d'ambiance (bonne compression)
- **WAV** : Effets courts (qualité maximale)
- **OGG** : Alternative libre (bonne compatibilité)

### Spécifications audio
- **Durée ambiance** : 30s-2min (boucle sans coupure)
- **Durée effets** : 0.1-3s maximum
- **Qualité** : 44.1kHz, 16-bit minimum
- **Volume** : Normaliser à -6dB maximum
- **Taille** : <1MB par fichier

### Intégration
```json
"audio": {
  "ambient": "audio/ambient.mp3",
  "effects": {
    "spin": "audio/spin-start.wav",       // alias: spinStart
    "reelStop": "audio/reel-stop.wav",
    "win": "audio/win-small.mp3",
    "bigWin": "audio/win-big.mp3",
    "jackpot": "audio/jackpot.mp3",
    "buttonClick": "audio/button-click.wav", // alias: click
    "error": "audio/error.wav"
  }
}
```
- Toutes les clés sont optionnelles.
- Si une clé est absente, le moteur essaie d’abord un **son global par défaut** (voir `assets/audio/`), puis tombe sur un **bip synthétique** si rien n’est disponible.
- Une musique d’**ambiance** peut démarrer après déverrouillage (badge RFID).

### Priorité des sources et sons globaux
Ordre de recherche pour chaque événement audio:
1. Son déclaré par le thème (`assets/themes/<id>/theme.json`)
2. Son global par défaut (`assets/audio/...`)
3. Bip synthétique intégré

Noms de fichiers globaux reconnus (essayés dans cet ordre):
- button-click.wav, button-click.mp3
- spin-start.wav, spin-start.mp3
- reel-stop.wav, reel-stop.mp3
- win-small.mp3, win-small.wav
- win-big.mp3, win-big.wav
- jackpot.mp3, jackpot.wav
- error.wav, error.mp3
- ambient.mp3, ambient.ogg, ambient.wav

### Quand les sons sont joués
- buttonClick: au pointerdown des boutons START/HOLD et via raccourcis clavier (Espace, S/D/F/G/H)
- spin: au démarrage d’un spin
- reelStop: à l’arrêt de chaque rouleau (5 fois par spin)
- win / bigWin / jackpot: à la fin d’un spin selon le multiplicateur (≥3 / ≥4 / ≥5 symboles alignés)
- error: si badge RFID non détecté ou crédits insuffisants
- ambient (boucle): démarre après détection RFID si présent

---

## 💡 Recommandations techniques

### Performance
- **Images optimisées** : Utilisez des outils comme TinyPNG
- **Formats modernes** : WebP pour les backgrounds si supporté
- **Lazy loading** : Les assets sont chargés à la demande
- **Cache** : Les thèmes sont mis en cache côté navigateur

### Compatibilité
- **Navigateurs** : Chrome 80+, Firefox 75+, Safari 13+
- **Résolutions** : Responsive de 320px à 4K
- **Touch** : Compatible mobile et tablette
- **Accessibilité** : Contrastes suffisants pour les textes

### Optimisation des couleurs
```json
// Exemple de palette harmonieuse
"ui": {
  "hud": {
    "bg": "rgba(15, 23, 42, 0.8)",      // Fond sombre
    "text": "#f8fafc",                   // Texte clair
    "label": "#cbd5e1",                 // Labels neutres
    "accent": "#3b82f6"                 // Accent bleu
  },
  "accent": "#3b82f6",
  "accent2": "#1d4ed8"
}
```

### Test de contraste
- **Texte/fond** : Ratio minimum 4.5:1
- **Labels/fond** : Ratio minimum 3:1
- **Accents** : Visible sur tous les fonds

---

## ✅ Éléments obligatoires vs optionnels

### ✅ OBLIGATOIRES
```json
{
  "id": "mon-theme",           // Identifiant unique
  "name": "Mon Thème",         // Nom d'affichage  
  "symbolsType": "image",      // Type de symboles
  "symbols": [...],            // Liste des symboles (7-9)
  "ui": {}                     // Objet UI (peut être vide)
}
```

### 🎨 RECOMMANDÉS
```json
{
  "ui": {
    "background": {...},       // Fond personnalisé
    "hud": {
      "bg": "...",            // Couleurs HUD
      "text": "...",
      "accent": "..."
    }
  }
}
```

### ℹ️ OPTIONNELS
```json
{
  "ui": {
    "hud": {
      "font": {...}           // Police personnalisée
    },
    "glass": {...},           // Effets de flou
    "accent2": "..."          // Couleur secondaire
  },
  "audio": { ... }            // Sons du thème
}
```

### 🗂️ FICHIERS
- **Obligatoires** : `theme.json`
- **Conditionnels** : `symbols/*.png` (si `symbolsType: "image"`)
- **Optionnels** : `background/*`, `fonts/*`, `audio/*`, `README.md`

---

## 🚀 Installation et test

### 1. Créer la structure
```bash
mkdir -p assets/themes/mon-theme/{symbols,background,fonts,audio}
```

### 2. Configurer le thème
Créer `assets/themes/mon-theme/theme.json` avec la configuration minimale :
```json
{
  "id": "mon-theme",
  "name": "Mon Super Thème",
  "symbolsType": "emoji",
  "symbols": ["🎮", "🎯", "🎪", "🎨", "🎭", "🎸", "🎲"],
  "ui": {
    "hud": {
      "text": "#ffffff",
      "accent": "#ff6b35"
    }
  }
}
```

### 3. Ajouter au registre
Éditer `assets/themes/index.json` :
```json
{
  "themes": [
    // ... thèmes existants ...
    { "id": "mon-theme", "name": "Mon Super Thème" }
  ]
}
```

### 4. Tester le thème
```javascript
// Dans la console du navigateur
UI.setTheme('mon-theme');
```

### 5. Débugger
- **F12** : Ouvrir les DevTools
- **Shift+W** : Panel de développement intégré
- **Console** : Vérifier les erreurs de chargement

---

## 🔧 Dépannage courant

### Le thème ne se charge pas
1. Vérifier l'ID dans `index.json`
2. Vérifier la syntaxe JSON
3. Vérifier les chemins des fichiers
4. Consulter la console pour les erreurs

### Les images ne s'affichent pas
1. Vérifier les chemins relatifs dans `symbols`
2. Vérifier que les fichiers existent
3. Vérifier les permissions de fichiers
4. Tester avec des émojis d'abord

### Les couleurs ne s'appliquent pas
1. Vérifier la syntaxe des couleurs CSS
2. Tester avec des couleurs simples (`#ff0000`)
3. Vérifier la hiérarchie JSON
4. Forcer le rechargement (Ctrl+F5)

### La police ne charge pas
1. Vérifier le format WOFF2
2. Vérifier le chemin vers le fichier
3. Tester la police dans un autre contexte
4. Utiliser une police fallback temporaire

---

## 📚 Ressources utiles

### Outils de création
- **Images** : GIMP, Photoshop, Figma, Canva
- **Compression** : TinyPNG, ImageOptim
- **Polices** : Google Fonts, Font Squirrel
- **Couleurs** : Coolors.co, Adobe Color

### Exemples de thèmes
- **Island Fortune** : Thème complet avec images
- **Tiki** : Thème simple avec émojis
- **West** : Dégradés et palette terre
- **Egypt** : Couleurs dorées et mystique

### Documentation technique
- [CSS backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [WOFF2 format](https://developers.google.com/fonts/docs/webfont_loader)
- [JSON Schema](https://json-schema.org/)

---

*Guide créé pour Slot Machine Frontend v1.0 - Dernière mise à jour: 17 août 2025*
