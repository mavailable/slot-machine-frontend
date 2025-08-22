# Slot Machine Frontend

- Contrôles : S/D/F/G/H = HOLD · Espace = START · B = simuler badge RFID · M = mute · Shift+W = panneau dev
- HUD compact : Crédit / Mise / Gain en haut‑droite (thémable)
- Zone des rouleaux : effet verre (flou), 5 colonnes
- Thèmes inclus: voir `assets/themes/index.json` (thème actif par défaut: `island-fortune`)

## Lancer en local
```bash
python3 -m http.server 5173
# Ouvrir http://localhost:5173
```

## Console utilitaire
```js
UI.setTheme('island-fortune');
UI.toggleControls();
UI.immersiveToggle();
```

## Audio: priorités et emplacements

Le jeu supporte des sons par **thème** et des **sons globaux par défaut**.

Ordre de priorité des sons:
1) Fichier déclaré par le thème (`assets/themes/<id>/theme.json`)
2) Fichier global par défaut (`assets/audio/*.wav|*.mp3|*.ogg`)
3) Bip synthétique intégré (fallback ultime)

Sons reconnus (noms de fichiers côté global):
- button-click.wav | .mp3
- spin-start.wav | .mp3
- reel-stop.wav | .mp3
- win-small.mp3 | .wav
- win-big.mp3 | .wav
- jackpot.mp3 | .wav
- error.wav | .mp3
- ambient.mp3 | .ogg | .wav

Détails et recommandations: `assets/audio/README.md`.

Quand les sons sont joués:
- buttonClick: au pointerdown des boutons START/HOLD et sur les raccourcis clavier (Espace, S/D/F/G/H)
- spin: au démarrage d’un spin
- reelStop: à l’arrêt de chaque rouleau
- win/bigWin/jackpot: à la fin d’un spin selon le multiplicateur (≥3/4/5 symboles alignés)
- error: si badge RFID non détecté ou crédits insuffisants
- ambient (boucle): démarre après détection RFID (peut être désactivée si absente)
