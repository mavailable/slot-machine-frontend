# Slot Machine Frontend — Banana Jackpot

- Contrôles : **A Z E R T** = HOLD · **Espace** = Lancer
- HUD compact : Crédit / Mise / Gain en **haut‑droite** (couleurs & police via thème)
- Zone des rouleaux : **floute** le background (verre), colonnes **transparentes**
- Thèmes inclus : `banana-jackpot` (par défaut), `tiki`, `west`, `egypt`

## Lancer en local
```bash
python3 -m http.server 5173
# Ouvrir http://localhost:5173
```

## Console utilitaire
```js
UI.setTheme('banana-jackpot'); // ou 'tiki' | 'west' | 'egypt'
UI.toggleControls();           // masque/affiche les boutons
UI.immersiveToggle();          // transparence générale
```

## Ajouter vos images réelles pour Banana Jackpot
Remplacez les placeholders PNG dans :
```
assets/themes/banana-jackpot/img/background/bg.png
assets/themes/banana-jackpot/img/symbols/*.png
```
Les chemins des symboles sont définis dans `assets/themes/banana-jackpot/theme.json`.
