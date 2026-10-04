/**
 * État partagé de la page « Day Pic » (filtres calendrier/globe + lightbox).
 *
 * L'état vit sur globalThis pour être commun à TOUS les îlots Astro ET au
 * script statique de la page : chaque îlot a son propre bundle, mais un seul
 * et même objet d'état (créé une fois, puis référencé partout via globalThis).
 */
const CLE = '__dayPicSerie'

function etat() {
  if (!globalThis[CLE]) {
    globalThis[CLE] = {
      date: null, // '2025-07-16' — filtre calendrier
      lieu: null, // 'maroc-oriental' — filtre globe
      ouverte: null, // id de la photo affichée dans la lightbox
      affichees: [], // ids actuellement visibles dans la galerie
      abonnes: new Set(),
    }
  }
  return globalThis[CLE]
}

/** Instantané lisible de l'état (copie plain-object). */
export function lecture() {
  const e = etat()
  return { date: e.date, lieu: e.lieu, ouverte: e.ouverte, affichees: e.affichees }
}

/** S'abonne aux changements d'état. Retourne la fonction de désabonnement. */
export function abonner(fn) {
  const e = etat()
  e.abonnes.add(fn)
  return () => e.abonnes.delete(fn)
}

function notifier() {
  const e = etat()
  const instantane = lecture()
  for (const fn of [...e.abonnes]) fn(instantane)
}

/**
 * Change le filtre. Chaque clé n'est modifiée que si elle est fournie :
 *   setFiltre({ date: '2025-07-16' })        → date seule (lieu conservé tel quel)
 *   setFiltre({ date: '…', lieu: null })     → les deux clés explicitement
 */
export function setFiltre({ date, lieu } = {}) {
  const e = etat()
  if (date !== undefined) e.date = date
  if (lieu !== undefined) e.lieu = lieu
  notifier()
}

/** Efface les filtres (retour à la sélection initiale de la galerie). */
export function resetFiltre() {
  const e = etat()
  e.date = null
  e.lieu = null
  notifier()
}

/** Ouvre/ferme la lightbox sur une photo (id). */
export function ouvrirPhoto(id) {
  const e = etat()
  e.ouverte = id
  notifier()
}

export function fermerPhoto() {
  const e = etat()
  e.ouverte = null
  notifier()
}

/** Met à jour la liste des photos affichées dans la galerie (pagination). */
export function majAffichees(ids) {
  const e = etat()
  e.affichees = ids
  notifier()
}

/** Fait défiler jusqu'à la galerie si elle n'est pas à l'écran. */
export function versGalerie() {
  if (typeof document === 'undefined') return
  document.getElementById('galerie-serie')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
