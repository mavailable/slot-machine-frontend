# Debug - Problème ligne du bas vide

## Problème identifié
- La ligne du bas des rouleaux est vide
- Les gains s'affichent sur la ligne du haut au lieu de la ligne centrale
- Cela suggère un problème de positionnement des symboles

## Actions correctives prises

### 1. Correction du positionnement initial
- Changé `translate3d(0, ${-1 * symbolH}px, 0)` vers `translate3d(0, 0px, 0)`
- Cela devrait afficher naturellement les 3 symboles sans décalage

### 2. Correction du positionnement final après animation
- Position finale également changée vers `translate3d(0, 0px, 0)`
- Cohérence entre position initiale et finale

### 3. Ajout d'outils de debug
- `debugReelPositions()` : Analyse les positions réelles des symboles
- `forceCorrectReelPositioning()` : Force un repositionnement correct
- Attributs `data-debug-index` pour identifier visuellement les symboles
- CSS de debug temporaire avec bordures colorées

### 4. Structure attendue avec position `translate3d(0, 0px, 0)`

```
┌─────────────┐ ← Top du conteneur .reel
│ Symbole 0   │ ← Index 0 (ligne du haut)
│   (haut)    │
├─────────────┤
│ Symbole 1   │ ← Index 1 (LIGNE DE GAINS) ⭐
│  (centre)   │
├─────────────┤
│ Symbole 2   │ ← Index 2 (ligne du bas)
│   (bas)     │
└─────────────┘ ← Bottom du conteneur .reel
```

### 5. CSS de debug activé
- Bordures jaunes sur les `.reel` 
- Bordures magenta sur les `.symbol`
- Bordures vertes sur les `.payline-symbol`
- Numéros d'index affichés en haut à gauche de chaque symbole

### 6. Indicateurs de ligne temporairement désactivés
- `.reel::after` mis en `display: none` pour éviter les interférences

## Boutons de test dans le panel Dev (Maj+D)
1. **Debug positions** : Affiche les positions réelles
2. **Forcer positions** : Force un repositionnement correct
3. **Valider structure** : Vérifie la cohérence
4. **Corriger structure** : Corrige les problèmes détectés

## Prochaines étapes
1. Tester avec le panel de debug
2. Analyser les logs de position
3. Ajuster si nécessaire
4. Retirer le CSS de debug une fois résolu
