#!/usr/bin/env node
/**
 * photo-pipeline — Compression d'images + injection de copyright (Creative Commons)
 * ----------------------------------------------------------------------------------
 * - Redimensionne les images (côté max, défaut 2048 px) et les convertit en WebP
 * - Injecte le copyright choisi (EXIF + XMP) en conservant la date d'origine
 * - Ne JAMAIS écrase : ni les sources, ni les fichiers déjà présents en destination
 *
 * Utilisation interactive :  node optimize.mjs
 * Utilisation en ligne de commande :
 *   node optimize.mjs --src "/chemin/source" --dest "/chemin/destination" \
 *                     --licence by-nc-nd --max 2048 --qualite 78 --oui
 */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline/promises'

import sharp from 'sharp'
import { ExifTool } from 'exiftool-vendored'

// ---------------------------------------------------------------------------
// Licences proposées
// ---------------------------------------------------------------------------
const LICENCES = {
  'by-nc-nd': {
    nom: 'CC BY-NC-ND 4.0',
    complet: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  },
  'by-nc-sa': {
    nom: 'CC BY-NC-SA 4.0',
    complet: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  'by-nc': {
    nom: 'CC BY-NC 4.0',
    complet: 'Creative Commons Attribution-NonCommercial 4.0 International',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  },
  'by-sa': {
    nom: 'CC BY-SA 4.0',
    complet: 'Creative Commons Attribution-ShareAlike 4.0 International',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'by': {
    nom: 'CC BY 4.0',
    complet: 'Creative Commons Attribution 4.0 International',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'cc0': {
    nom: 'CC0 1.0',
    complet: 'CC0 1.0 Universal (domaine public)',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
}

const AUTEUR = 'Ilyass Remmane'
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.heic'])

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
const poids = (octets) => {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}
const pad = (n) => String(n).padStart(2, '0')

function afficherAide() {
  console.log(`
photo-pipeline — compresse des images en WebP et y injecte un copyright Creative Commons.

Options :
  --src <dossier>       Dossier source (récursif, images lisibles)
  --dest <dossier>      Dossier destination (créé s'il n'existe pas)
  --licence <clé>       by-nc-nd (défaut) | by-nc-sa | by-nc | by-sa | by | cc0
  --max <px>            Côté maximum (défaut : 2048)
  --qualite <0-100>     Qualité WebP (défaut : 78)
  --oui                 Pas de demande de confirmation
  --simulation          Analyse sans rien écrire (dry-run)
  --aide                Affiche cette aide

Sans option, un assistant interactif vous guide.
`)
}

function lireArguments(argv) {
  const opts = { licence: 'by-nc-nd', max: 2048, qualite: 78, oui: false, simulation: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--src') opts.src = argv[++i]
    else if (arg === '--dest') opts.dest = argv[++i]
    else if (arg === '--licence' || arg === '--license') opts.licence = argv[++i]
    else if (arg === '--max') opts.max = Number(argv[++i])
    else if (arg === '--qualite' || arg === '--quality') opts.qualite = Number(argv[++i])
    else if (arg === '--oui' || arg === '-y') opts.oui = true
    else if (arg === '--simulation' || arg === '--dry-run') opts.simulation = true
    else if (arg === '--aide' || arg === '--help' || arg === '-h') opts.aide = true
    else {
      console.error(`Option inconnue : ${arg}`)
      process.exit(1)
    }
  }
  if (opts.licence && !LICENCES[opts.licence]) {
    console.error(`Licence inconnue : ${opts.licence}. Clés possibles : ${Object.keys(LICENCES).join(', ')}`)
    process.exit(1)
  }
  if (Number.isNaN(opts.max) || opts.max < 100) opts.max = 2048
  if (Number.isNaN(opts.qualite) || opts.qualite < 1 || opts.qualite > 100) opts.qualite = 78
  return opts
}

// ---------------------------------------------------------------------------
// Traitement d'une image
// ---------------------------------------------------------------------------
async function traiterImage({ src, dest, licence, opts, exiftool }) {
  // Jamais d'écrasement : fichier déjà traité = ignoré
  if (fs.existsSync(dest)) return { statut: 'ignore', src }

  const avant = (await fsp.stat(src)).size

  // Métadonnées d'origine (date) avant transformation
  let dateOrigine = null
  try {
    const meta = await exiftool.read(src)
    dateOrigine = dateExifVersChaine(meta.DateTimeOriginal) ?? dateExifVersChaine(meta.CreateDate)
  } catch {
    /* pas d'EXIF : on continue quand même */
  }

  if (opts.simulation) return { statut: 'simule', src, dest, avant }

  await fsp.mkdir(path.dirname(dest), { recursive: true })

  // 1. Compression / redimensionnement
  await sharp(src)
    .rotate() // applique l'orientation EXIF
    .resize({ width: opts.max, height: opts.max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: opts.qualite, effort: 5 })
    .toFile(dest)

  // 2. Métadonnées : copyright + conservation de la date d'origine
  const annee = dateOrigine ? Number(dateOrigine.slice(0, 4)) : new Date().getFullYear()
  const tags = {
    Copyright: `© ${annee} ${AUTEUR} — ${licence.nom}`,
    Artist: AUTEUR,
    Rights: `${licence.complet} — ${AUTEUR}`,
    UsageTerms: licence.url,
    WebStatement: licence.url,
  }
  if (dateOrigine) tags.DateTimeOriginal = dateOrigine
  try {
    await exiftool.write(dest, tags)
  } catch (err) {
    // L'image est bonne, on signale seulement l'échec des métadonnées
    return { statut: 'ok-sans-exif', src, dest, avant, apres: (await fsp.stat(dest)).size, erreur: err.message }
  }
  // exiftool crée une sauvegarde ".webp_original" : on la supprime (inutile ici)
  const backup = `${dest}_original`
  if (fs.existsSync(backup)) await fsp.rm(backup)

  const apres = (await fsp.stat(dest)).size
  return { statut: 'ok', src, dest, avant, apres }
}

// ---------------------------------------------------------------------------
// Assistant interactif
// ---------------------------------------------------------------------------
async function assistant(opts) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const demander = async (question, defaut = '') => {
    const reponse = (await rl.question(question + (defaut ? ` [${defaut}]` : '') + ' : ')).trim()
    return reponse || defaut
  }

  console.log('\n=== photo-pipeline : compression + copyright Creative Commons ===\n')
  console.log('Les dossiers peuvent être saisis en tapant leur chemin (glisser-déposer possible).\n')

  // Dossier source : doit exister
  let source
  while (!source) {
    const brut = path.resolve(nettoyerChemin(await demander('Dossier SOURCE (vos photos brutes)')))
    if (fs.existsSync(brut) && fs.statSync(brut).isDirectory()) source = brut
    else console.log(`  ⚠️  "${brut}" n'est pas un dossier existant, réessayez.`)
  }
  opts.src = source

  // Dossier destination : demandé s'il n'existe pas encore
  let destination
  while (!destination) {
    const brut = path.resolve(nettoyerChemin(await demander('Dossier DESTINATION (ex : .../public/photos/series/ma-serie)')))
    if (brut === source || brut.startsWith(source + path.sep)) {
      console.log('  ⚠️  La destination ne peut pas être dans la source, réessayez.')
    } else if (fs.existsSync(brut)) {
      destination = brut
    } else {
      const confirme = (await demander(`Ce dossier n'existe pas, il sera créé. Créer ? (oui/non)`, 'oui')).toLowerCase()
      if (['oui', 'o', 'yes', 'y'].includes(confirme)) destination = brut
    }
  }
  opts.dest = destination

  // Choix de la licence
  console.log('\nLicences disponibles :')
  const cles = Object.keys(LICENCES)
  cles.forEach((cle, i) => console.log(`  ${i + 1}. ${LICENCES[cle].nom} — ${LICENCES[cle].complet}`))
  const choixLicence = await demander(`Votre choix (1-${cles.length})`, '1')
  const index = Number(choixLicence) - 1
  opts.licence = LICENCES[cles[index]] ? cles[index] : 'by-nc-nd'

  opts.max = Number(await demander('Côté maximum en px', String(opts.max))) || 2048
  opts.qualite = Number(await demander('Qualité WebP (1-100)', String(opts.qualite))) || 78

  rl.close()
  return opts
}

// ---------------------------------------------------------------------------
// Programme principal
// ---------------------------------------------------------------------------
async function main() {
  const opts = lireArguments(process.argv.slice(2))
  if (opts.aide) return afficherAide()

  const modeInteractif = !opts.src || !opts.dest
  if (modeInteractif) {
    if (!process.stdin.isTTY) {
      console.error('Mode interactif impossible (pas de terminal). Utilisez --src et --dest. Voir --aide.')
      process.exit(1)
    }
    await assistant(opts)
  }

  const src = path.resolve(nettoyerChemin(opts.src))
  const dest = path.resolve(nettoyerChemin(opts.dest))

  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    console.error(`Dossier source introuvable : ${src}`)
    process.exit(1)
  }
  if (dest === src || dest.startsWith(src + path.sep)) {
    console.error('Le dossier destination ne peut pas être à l\'intérieur du dossier source.')
    process.exit(1)
  }

  const licence = LICENCES[opts.licence]
  const images = await listerImages(src)

  console.log(`
--- Récapitulatif ---
  Source      : ${src}
  Destination : ${dest}
  Licence     : ${licence.nom} (${licence.url})
  Réglages    : côté max ${opts.max} px, WebP qualité ${opts.qualite}
  Images      : ${images.length}
  Mode        : ${opts.simulation ? 'SIMULATION (rien ne sera écrit)' : 'traitement réel'}`)

  if (!opts.oui && !opts.simulation) {
    if (!process.stdin.isTTY) {
      console.error('Ajoutez --oui pour confirmer en mode non-interactif.')
      process.exit(1)
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const reponse = (await rl.question('\nLancer le traitement ? (oui/n) : ')).trim().toLowerCase()
    rl.close()
    if (!['oui', 'o', 'yes', 'y'].includes(reponse)) {
      console.log('Annulé.')
      process.exit(0)
    }
  }

  const exiftool = new ExifTool()
  const bilan = { ok: 0, ignore: 0, sansExif: 0, erreurs: [], avant: 0, apres: 0 }
  const debut = Date.now()

  try {
    let compteur = 0
    for (const fichier of images) {
      compteur++
      const relatif = path.relative(src, fichier)
      const destFichier = path.join(dest, path.dirname(relatif), path.basename(fichier).replace(/\.[^.]+$/, '.webp'))
      try {
        const resultat = await traiterImage({ src: fichier, dest: destFichier, licence, opts, exiftool })
        if (resultat.statut === 'ignore') {
          bilan.ignore++
        } else if (resultat.statut === 'simule') {
          bilan.avant += resultat.avant
        } else {
          bilan.ok++
          if (resultat.statut === 'ok-sans-exif') bilan.sansExif++
          bilan.avant += resultat.avant
          bilan.apres += resultat.apres
          console.log(
            `  [${compteur}/${images.length}] ${relatif}  ${poids(resultat.avant)} → ${poids(resultat.apres)}` +
            ` (−${Math.round((1 - resultat.apres / resultat.avant) * 100)}%)`,
          )
        }
      } catch (err) {
        bilan.erreurs.push({ fichier: relatif, erreur: err.message })
        console.error(`  [${compteur}/${images.length}] ✗ ${relatif} : ${err.message}`)
      }
    }
  } finally {
    await exiftool.end()
  }

  const duree = ((Date.now() - debut) / 1000).toFixed(1)
  console.log(`\n=== Bilan (${duree} s) ===`)
  if (opts.simulation) {
    console.log(`  ${images.length} images repérées, poids source total : ${poids(bilan.avant)}`)
  } else {
    const gain = bilan.avant ? Math.round((1 - bilan.apres / bilan.avant) * 100) : 0
    console.log(`  Traitées        : ${bilan.ok}`)
    console.log(`  Déjà présentes  : ${bilan.ignore} (jamais écrasées)`)
    console.log(`  Poids source    : ${poids(bilan.avant)}`)
    console.log(`  Poids WebP      : ${poids(bilan.apres)} (−${gain}%)`)
    if (bilan.sansExif > 0) console.log(`  ⚠️ ${bilan.sansExif} fichier(s) : compression OK mais métadonnées non écrites`)
    if (bilan.erreurs.length > 0) {
      console.log(`  Erreurs :`)
      for (const e of bilan.erreurs) console.log(`    ✗ ${e.fichier} : ${e.erreur}`)
    }
  }
  if (bilan.erreurs.length > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})

// Collecte récursive des images du dossier source
async function listerImages(dossier) {
  const resultat = []
  const aExplorer = [dossier]
  while (aExplorer.length > 0) {
    const courant = aExplorer.pop()
    for (const entree of await fsp.readdir(courant, { withFileTypes: true })) {
      const complet = path.join(courant, entree.name)
      if (entree.isDirectory()) aExplorer.push(complet)
      else if (EXTENSIONS.has(path.extname(entree.name).toLowerCase())) resultat.push(complet)
    }
  }
  return resultat.sort()
}

// Date EXIF d'origine au format EXIF attendu par exiftool : YYYY:MM:DD HH:MM:SS
function dateExifVersChaine(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value.year === 'number' && typeof value.month === 'number') {
    const h = typeof value.hour === 'number' ? value.hour : 0
    const m = typeof value.minute === 'number' ? value.minute : 0
    const s = typeof value.second === 'number' ? value.second : 0
    return `${value.year}:${pad(value.month)}:${pad(value.day)} ${pad(h)}:${pad(m)}:${pad(s)}`
  }
  return String(value)
}

// Nettoie une saisie de chemin : le glisser-déposer macOS ajoute parfois des
// guillemets ('/mon/dossier') ou des échappements (/mon\ dossier), et un "~"
// en début de chemin doit être remplacé par le dossier personnel.
function nettoyerChemin(brut) {
  if (!brut) return ''
  let chemin = String(brut).trim()
  if (
    (chemin.startsWith("'") && chemin.endsWith("'")) ||
    (chemin.startsWith('"') && chemin.endsWith('"'))
  ) {
    chemin = chemin.slice(1, -1).trim()
  }
  chemin = chemin.replace(/\\ /g, ' ')
  if (chemin === '~') chemin = os.homedir()
  else if (chemin.startsWith('~/')) chemin = path.join(os.homedir(), chemin.slice(2))
  return chemin
}
