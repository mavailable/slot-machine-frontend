# Island Fortune Theme

Thème tropical pour la machine à sous frontend. Ce thème fait partie d'un projet de machine à sous moderne développé avec Vite.

## 📁 Structure du thème
```
island-fortune/
├─ theme.json          # Configuration du thème
├─ README.md          # Ce fichier
├─ background/
│  └─ bg.png          # Image de fond (1920x1080 recommandé)
├─ symbols/           # 9 symboles du jeu
│  ├─ 87c23252-7cd5-4cc1-bc9b-d2f66ea7dde6.png
│  ├─ island-fortune_cocktail-avec-parasol.png
│  ├─ island-fortune_cocktail-tropical.png
│  ├─ island-fortune_collier-de-fleurs.png
│  ├─ island-fortune_noix-de-coco.png
│  ├─ island-fortune_palmier.png
│  ├─ island-fortune_poisson-tropical.png
│  ├─ island-fortune_tiki.png
│  └─ island-fortune_ukulele.png
├─ fonts/             # Polices personnalisées (WOFF2)
│  └─ README.txt      # Instructions pour les polices
└─ audio/             # Sons du thème (vide actuellement)
```

## 🎨 Caractéristiques visuelles

### Palette de couleurs
- **Arrière-plan HUD** : `rgba(11, 62, 74, 0.25)` (bleu-vert translucide)
- **Bordures** : `rgba(26, 206, 199, 0.12)` (cyan transparent)
- **Texte principal** : `#F4F9FF` (blanc cassé)
- **Labels** : `#F6D087` (doré clair)
- **Accents** : `#FFC04D` (orange doré)
- **Accent secondaire** : `#FF8A3D` (orange vif)

### Effets visuels
- **Flou HUD** : 10px
- **Flou glass** : 26px avec teinte 16%
- **Police** : Laguna Grotesk (à fournir en WOFF2)

## 🎮 Symboles inclus (9)
Les symboles représentent l'univers tropical et insulaire :
- 🥥 Noix de coco
- 🍹 Cocktails tropicaux (2 variantes)
- 🌺 Collier de fleurs
- 🌴 Palmier
- 🐠 Poisson tropical
- 🗿 Statue Tiki
- 🎸 Ukulélé
- 💎 Gemme (symbole wild/scatter)

## ⚙️ Installation et utilisation

### Dans le projet principal
Ce thème est automatiquement chargé si l'ID `island-fortune` est sélectionné dans la machine à sous.

### Activation via console
```javascript
// Basculer vers le thème Island Fortune
UI.setTheme('island-fortune');
```

### Modification du thème par défaut
Dans `script.js`, ligne ~20 :
```javascript
activeTheme: 'island-fortune',
```

## 🔧 Configuration technique

### Police personnalisée
1. Ajoutez votre fichier `laguna-grotesk.woff2` dans le dossier `fonts/`
2. Le `theme.json` référence automatiquement :
   ```json
   "font": {
     "family": "Laguna Grotesk",
     "files": [{"src": "fonts/laguna-grotesk.woff2", "weight": "400", "style": "normal"}]
   }
   ```

### Sons personnalisés
Le dossier `audio/` est prêt à recevoir :
- Musique d'ambiance
- Sons de rouleaux
- Sons de victoire
- Effets sonores spéciaux

### Images recommandées
- **Symboles** : 200x200px, PNG transparent
- **Arrière-plan** : 1920x1080px optimal
- **Format** : PNG pour la transparence

## 📋 Notes de développement
- Le thème est listé dans `assets/themes/index.json`
- Compatible avec le système de thèmes dynamique
- Effets de flou et transparence gérés automatiquement
- Support des polices web personnalisées