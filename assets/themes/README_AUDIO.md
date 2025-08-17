# Audio de thèmes — Spécification minimale

Objectif: permettre à chaque thème de définir des sons simples, tout en ayant un fallback intégré (bips synthétiques) si aucun fichier audio n’est fourni.

## Où placer les fichiers

Dans le dossier de votre thème `assets/themes/<id-du-theme>/audio/`.

Arborescence conseillée:
```
audio/
├─ ambient.mp3         # Musique de fond en boucle (optionnel)
├─ spin-start.wav      # Départ des rouleaux (optionnel)
├─ reel-stop.wav       # Arrêt d’un rouleau (optionnel)
├─ win-small.mp3       # Petite victoire (optionnel)
├─ win-big.mp3         # Grosse victoire (optionnel)
├─ jackpot.mp3         # Jackpot (optionnel)
└─ button-click.wav    # Clic UI (optionnel)
```

Tous les fichiers sont optionnels. Si un son manque, le jeu joue un bip synthétique intégré.

## Déclaration dans `theme.json`

Ajoutez une clé `audio` au niveau racine:
```json
{
  "audio": {
    "ambient": "audio/ambient.mp3",
    "effects": {
      "spin": "audio/spin-start.wav",
      "reelStop": "audio/reel-stop.wav",
      "win": "audio/win-small.mp3",
      "bigWin": "audio/win-big.mp3",
      "jackpot": "audio/jackpot.mp3",
      "buttonClick": "audio/button-click.wav"
    }
  }
}
```
Clés acceptées (alias):
- `spin` ou `spinStart`
- `buttonClick` ou `click`

## Spécifications recommandées
- Format: WAV (effets courts), MP3/OGG (musique)
- Taux: 44.1 kHz, 16 bits
- Durée effets: 80–500 ms
- Normalisation: pic à env. -6 dBFS
- Taille: < 200 Ko par effet, < 1 Mo pour l’ambiance

## Contrôles et raccourcis
- `M` coupe/réactive l’audio (mute)
- Les boutons UI jouent un `button-click` si fourni
- Les sons de victoire varient selon le multiplicateur (win/bigWin/jackpot)

## Exemple minimal (sons très simples)
Si vous ne livrez aucun fichier, rien à faire: les bips intégrés couvrent:
- départ de spin
- arrêt de chaque rouleau
- petite/grosse victoire et jackpot
- erreur et validation
- clic UI

Vous pourrez remplacer n’importe quel bip plus tard en ajoutant simplement le fichier et le chemin dans `theme.json`.
