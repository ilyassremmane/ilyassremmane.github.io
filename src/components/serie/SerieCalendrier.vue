<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { lecture, abonner, setFiltre, resetFiltre, versGalerie } from './serieEtat.js'

const props = defineProps({
  photos: { type: Array, required: true },
})

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Nombre de photos par jour (pour activer/étiqueter les jours)
const comptes = computed(() => {
  const m = {}
  for (const p of props.photos) m[p.date] = (m[p.date] || 0) + 1
  return m
})

// Les mois qui contiennent réellement des photos (ex: ['2025-07'])
const moisDisponibles = computed(() => [...new Set(props.photos.map((p) => p.date.slice(0, 7)))].sort())
const indexMois = ref(0)
const moisCourant = computed(() => moisDisponibles.value[indexMois.value] ?? moisDisponibles.value[0] ?? '2025-07')

const titreMois = computed(() => {
  const [a, m] = moisCourant.value.split('-')
  return `${MOIS[Number(m) - 1]} ${a}`
})

// Grille du mois : semaines lundi→dimanche, cases vides avant/après le mois
const cellules = computed(() => {
  const [a, m] = moisCourant.value.split('-').map(Number)
  const premierJour = new Date(Date.UTC(a, m - 1, 1))
  const decalage = (premierJour.getUTCDay() + 6) % 7 // lundi = 0
  const nbJours = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const out = Array(decalage).fill(null)
  for (let j = 1; j <= nbJours; j++) out.push(j)
  while (out.length % 7 !== 0) out.push(null)
  return out
})

const filtre = ref({ date: null, lieu: null })
let desabonner
onMounted(() => {
  const e = lecture()
  filtre.value = { date: e.date, lieu: e.lieu }
  desabonner = abonner((nouveau) => {
    filtre.value = { date: nouveau.date, lieu: nouveau.lieu }
    // Si le filtre vient du globe sur un autre mois, on y saute
    if (nouveau.date) {
      const mois = nouveau.date.slice(0, 7)
      const i = moisDisponibles.value.indexOf(mois)
      if (i >= 0 && i !== indexMois.value) indexMois.value = i
    }
  })
})
onUnmounted(() => desabonner?.())

const cleJour = (j) => `${moisCourant.value}-${String(j).padStart(2, '0')}`
const aPhotos = (j) => (comptes.value[cleJour(j)] ?? 0) > 0
const selectionne = (j) => filtre.value.date === cleJour(j)

function cliquerJour(j) {
  if (!aPhotos(j)) return
  if (selectionne(j)) resetFiltre() // re-clic = désélection
  else setFiltre({ date: cleJour(j), lieu: null })
  versGalerie()
}
</script>


<template>
  <div class="calendrier">
    <div class="cal-entete">
      <button
        v-if="moisDisponibles.length > 1"
        type="button"
        class="cal-nav"
        aria-label="Mois précédent"
        :disabled="indexMois === 0"
        @click="indexMois--"
      >‹</button>
      <p class="cal-mois">{{ titreMois }}</p>
      <button
        v-if="moisDisponibles.length > 1"
        type="button"
        class="cal-nav"
        aria-label="Mois suivant"
        :disabled="indexMois === moisDisponibles.length - 1"
        @click="indexMois++"
      >›</button>
    </div>

    <div class="cal-grille" role="grid" :aria-label="titreMois">
      <span v-for="(j, i) in JOURS" :key="'h' + i" class="cal-jour-semaine" role="columnheader">{{ j }}</span>
      <template v-for="(c, i) in cellules" :key="i">
        <span v-if="c === null" class="cal-case cal-case--vide" aria-hidden="true"></span>
        <button
          v-else
          type="button"
          class="cal-case"
          :class="{ 'a-photos': aPhotos(c), 'sans-photo': !aPhotos(c), selectionnee: selectionne(c) }"
          :disabled="!aPhotos(c)"
          :aria-pressed="selectionne(c)"
          :aria-label="`${cleJour(c)} — ${comptes[cleJour(c)] ?? 0} photo(s)`"
          :title="aPhotos(c) ? `${comptes[cleJour(c)]} photo(s)` : 'Aucune photo ce jour-là'"
          @click="cliquerJour(c)"
        >{{ c }}</button>
      </template>
    </div>

    <p class="cal-aide">Cliquez sur une date pour filtrer la galerie</p>
  </div>
</template>

<style scoped>
.calendrier {
  background: #fff;
  color: #1a1a1a;
}
.cal-entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.cal-mois {
  margin: 0;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.cal-nav {
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  color: #1a1a1a;
  padding: 0 0.4rem;
}
.cal-nav:disabled {
  color: #ccc;
  cursor: default;
}
.cal-grille {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-jour-semaine {
  font-size: 0.75rem;
  color: #888;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 0.4rem;
}
.cal-case {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  background: #fff;
  border: none;
  color: #1a1a1a;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.cal-case--vide {
  visibility: hidden;
}
.cal-case.a-photos {
  cursor: pointer;
}
.cal-case.a-photos:hover {
  background: #f0f0f0;
}
.cal-case.sans-photo {
  color: #ccc; /* grisés, non cliquables (disabled) */
  cursor: default;
}
.cal-case.selectionnee {
  background: #1a1a1a; /* jour sélectionné : fond noir, texte blanc */
  color: #fff;
}
.cal-case.selectionnee:hover {
  background: #1a1a1a;
}
.cal-aide {
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
  text-align: center;
  margin: 1rem 0 0;
}
</style>
