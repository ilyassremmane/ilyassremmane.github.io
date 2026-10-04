#!/usr/bin/env node
/**
 * Script interne : extrait date/heure EXIF de chaque WebP d'un dossier
 * et affiche un récapitulatif par jour.
 * Usage : node extraire-dates.mjs <dossier>
 */
import fs from 'node:fs'
import path from 'node:path'
import { ExifTool } from 'exiftool-vendored'

const dossier = process.argv[2]
if (!dossier || !fs.existsSync(dossier)) {
  console.error('Usage : node extraire-dates.mjs <dossier-images>')
  process.exit(1)
}

const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.webp')).sort()
const exiftool = new ExifTool()
const resultats = []

try {
  for (const f of fichiers) {
    const nom = f.replace(/\.webp$/, '')
    let chaine = ''
    try {
      const meta = await exiftool.read(path.join(dossier, f))
      const d = meta.DateTimeOriginal || meta.CreateDate || null
      chaine = d ? String(d) : ''
    } catch {
      /* fichier illisible : on garde une entrée sans date */
    }
    resultats.push({
      f: nom,
      date: chaine ? chaine.slice(0, 10).replace(/:/g, '-') : null,
      heure: chaine ? chaine.slice(11, 16) : null,
    })
  }
} finally {
  await exiftool.end()
}

resultats.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || (a.heure ?? '').localeCompare(b.heure ?? ''))

fs.writeFileSync('/tmp/daypic_dates.json', JSON.stringify(resultats, null, 1))

const parJour = {}
for (const o of resultats) parJour[o.date ?? 'SANS DATE'] = (parJour[o.date ?? 'SANS DATE'] ?? 0) + 1
console.log(JSON.stringify(parJour, null, 1))
console.log('Total:', resultats.length, '| Sans date:', resultats.filter((o) => !o.date).length)
