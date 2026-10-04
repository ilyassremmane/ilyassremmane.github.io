# 📸 photo-pipeline

Outil **indépendant du site** pour préparer tes photos avant mise en ligne :

- **Compression** en WebP, redimensionnée (2048 px par défaut) : parfait pour le web,
  **volontairement trop petite pour l'impression** → protège ton travail.
- **Métadonnées** : injection automatique d'un **copyright Creative Commons** (EXIF + XMP)
  tout en **conservant la date d'origine** de la photo.
- **Jamais d'écrasement** : les originaux ne sont jamais touchés, et une photo déjà
  traitée en destination est simplement ignorée au prochain lancement.

---

## 1. Installation (une seule fois)

```bash
cd scripts/photo-pipeline
npm install
```

> Rien d'autre à installer : `exiftool-vendored` embarque automatiquement exiftool,
> et `sharp` gère la compression.

## 2. Utilisation

### Mode interactif (recommandé)

```bash
npm run optimize
```

L'assistant te demande, dans l'ordre :

1. **Le dossier SOURCE** — tes photos brutes (tu peux glisser-déposer le dossier dans le terminal)
2. **Le dossier DESTINATION** — par ex. `.../mon_site/public/photos/series/day-pic`
   (il est créé s'il n'existe pas)
3. **La licence Creative Commons** — `1` = CC BY-NC-ND 4.0 (défaut, la plus protectrice)
4. **Le côté maximum** (2048 px par défaut) et **la qualité WebP** (78 par défaut)
5. Confirmation → traitement avec affichage du gain photo par photo

### En ligne de commande (pour scripts / automatisation)

```bash
node optimize.mjs --src "/mes/photos/brutes" --dest "/chemin/vers/public/photos/series/ma-serie" \
                  --licence by-nc-nd --max 2048 --qualite 78 --oui
```

### Options

| Option | Rôle | Défaut |
|---|---|---|
| `--src <dossier>` | Dossier source (récursif) | — (interactif) |
| `--dest <dossier>` | Dossier destination | — (interactif) |
| `--licence <clé>` | `by-nc-nd`, `by-nc-sa`, `by-nc`, `by-sa`, `by`, `cc0` | `by-nc-nd` |
| `--max <px>` | Côté maximum en pixels | `2048` |
| `--qualite <0-100>` | Qualité WebP | `78` |
| `--oui` | Pas de confirmation | — |
| `--simulation` | Dry-run : analyse sans rien écrire | — |
| `--aide` | Affiche l'aide | — |

## 3. Exemple réel

```
$ npm run optimize -- --src ~/photos_web/day_pic --dest ~/mon_site/public/photos/series/day-pic --oui

  [1/99] day_pic_9.2.png   16.9 Mo → 103 Ko (−99%)
  ...
=== Bilan (87.3 s) ===
  Traitées        : 99
  Poids source    : 1700.7 Mo
  Poids WebP      : 36.2 Mo (−98%)
```

## 4. Ce qui est écrit dans les métadonnées

Sur chaque WebP produit :

| Tag | Valeur |
|---|---|
| `Copyright` | `© 2025 Ilyass Remmane — CC BY-NC-ND 4.0` |
| `Artist` | `Ilyass Remmane` |
| `Rights` | `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International — Ilyass Remmane` |
| `UsageTerms` / `WebStatement` | `https://creativecommons.org/licenses/by-nc-nd/4.0/` |
| `DateTimeOriginal` | **conservé** depuis ta photo d'origine |

Vérification rapide après traitement :

```bash
npx exiftool ton/fichier.webp | grep -i copyright
```

## 5. Bonnes pratiques

- ⚠️ **Ne mets jamais le dossier destination à l'intérieur du dossier source** (le script le refuse).
- Relance le script quand tu veux : les photos déjà traitées sont **ignorées**, jamais écrasées.
- Garde tes **originaux en sécurité** hors du site : ils ne servent plus une fois traités.
- La destination doit être dans `public/` du site Astro pour que les photos soient publiées
  (ex: `public/photos/series/day-pic/`).
- Les coordonnées GPS ne sont pas dans tes photos : elles se renseignent **à la main**
  dans le fichier JSON de la série (`src/data/series/...`).

## 6. Dépannage

| Problème | Solution |
|---|---|
| `Mode interactif impossible` | Tu n'es pas dans un terminal : ajoute `--src` et `--dest` |
| `Licence inconnue` | Vérifie la clé : `by-nc-nd` (avec des tirets) |
| `compression OK mais métadonnées non écrites` | L'image est utilisable ; relance en réécrivant le fichier à part (`--dest` vers un dossier vide puis re-copie) |
| Photos non reconnues | Formats acceptés : jpg, jpeg, png, tif, tiff, heic |
