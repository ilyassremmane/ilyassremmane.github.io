<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SerieGlobe from './SerieGlobe.vue'
import { lecture, abonner, fermerPhoto, ouvrirPhoto } from './serieEtat.js'

const props = defineProps({
  photos: { type: Array, required: true },
  lieux: { type: Object, required: true },
})

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

const etat = ref({ date: null, lieu: null, ouverte: null, affichees: [] })

// Photo actuellement affichée
const photoCourante = computed(() => {
  if (!etat.value.ouverte) return null
  return props.photos.find((p) => p.id === etat.value.ouverte) ?? null
})

// Liste de navigation : le filtre actif, sinon les photos affichées dans la galerie
const listeNav = computed(() => {
  const { date, lieu, affichees } = etat.value
  if (date || lieu) {
    return props.photos.filter((p) => (!date || p.date === date) && (!lieu || p.lieu === lieu))
  }
  const visibles = new Set(affichees)
  return props.photos.filter((p) => visibles.has(p.id))
})

const position = computed(() => listeNav.value.findIndex((p) => p.id === etat.value.ouverte))

const lieu = computed(() => (photoCourante.value?.lieu ? props.lieux[photoCourante.value.lieu] : null))

function dateFR(iso) {
  const [a, m, j] = iso.split('-')
  return `${Number(j)} ${MOIS[Number(m) - 1]} ${a}`
}

// Coordonnées en degrés/minutes/secondes (faciles à retrouver sur une carte)
function dms(v, pos, neg) {
  const signe = v >= 0 ? pos : neg
  const a = Math.abs(v)
  const d = Math.floor(a)
  const mTotal = (a - d) * 60
  let m = Math.floor(mTotal)
  let s = Math.round((mTotal - m) * 60)
  let dd = d
  if (s === 60) { s = 0; m += 1 }
  if (m === 60) { m = 0; dd += 1 }
  return `${dd}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"${signe}`
}
const coordonnees = computed(() =>
  lieu.value ? `${dms(lieu.value.lat, 'N', 'S')} ${dms(lieu.value.lon, 'E', 'O')}` : null,
)

function altDe(p) {
  return `Photo ${p.id} — ${dateFR(p.date)}`
}

function precedente() {
  const n = listeNav.value.length
  if (!n || position.value < 0) return
  ouvrirPhoto(listeNav.value[(position.value - 1 + n) % n].id)
}
function suivante() {
  const n = listeNav.value.length
  if (!n || position.value < 0) return
  ouvrirPhoto(listeNav.value[(position.value + 1) % n].id)
}
function fermer() {
  fermerPhoto()
}

function clavier(e) {
  if (!photoCourante.value) return
  if (e.key === 'Escape') fermer()
  else if (e.key === 'ArrowLeft') precedente()
  else if (e.key === 'ArrowRight') suivante()
}

let desabonner
onMounted(() => {
  etat.value = lecture()
  desabonner = abonner((e) => { etat.value = e })
  window.addEventListener('keydown', clavier)
})
onUnmounted(() => {
  desabonner?.()
  window.removeEventListener('keydown', clavier)
})
</script>

<template>
  <div
    v-if="photoCourante"
    class="lightbox"
    role="dialog"
    aria-modal="true"
    :aria-label="photoCourante.id"
    @click.self="fermer"
  >
    <button type="button" class="btn-fermer" @click="fermer">Fermer &times;</button>
    <button type="button" class="nav-btn nav-gauche" aria-label="Photo précédente" @click="precedente">&larr;</button>

    <div class="lb-contenu">
      <div class="lb-photo">
        <img
          :src="photoCourante.src"
          :alt="altDe(photoCourante)"
          class="lb-img"
          @contextmenu.prevent
          draggable="false"
        />
      </div>

      <aside class="lb-infos">
        <h2 class="lb-titre">{{ photoCourante.id }}</h2>
        <p class="lb-meta">{{ dateFR(photoCourante.date) }} &middot; {{ photoCourante.heure }}</p>
        <p v-if="coordonnees" class="lb-coordonnees">{{ coordonnees }}</p>
        <p v-else class="lb-coordonnees lb-coordonnees--vide">Localisation non renseignée</p>

        <SerieGlobe
          v-if="lieu"
          mode="mini"
          :centre="lieu"
          class="lb-globe"
        />

        <p class="lb-compteur">
          <template v-if="position >= 0">{{ position + 1 }} / {{ listeNav.length }}</template>
        </p>
      </aside>
    </div>

    <button type="button" class="nav-btn nav-droite" aria-label="Photo suivante" @click="suivante">&rarr;</button>
  </div>
</template>

<style scoped>
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.98);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-contenu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 92%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 3.5rem 0.5rem 2rem;
}
@media (min-width: 800px) {
  .lb-contenu {
    flex-direction: row;
    align-items: flex-start;
    gap: 2.5rem;
  }
  .lb-photo {
    flex: 2;
    min-width: 0;
  }
  .lb-infos {
    flex: 0 0 250px;
  }
}
.lb-img {
  max-width: 100%;
  max-height: 68vh;
  display: block;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  user-select: none;
}
.lb-titre {
  font-size: 1.2rem;
  font-weight: normal;
  margin: 0 0 0.6rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  word-break: break-all;
}
.lb-meta {
  font-size: 0.95rem;
  color: #444;
  margin: 0 0 0.4rem;
}
.lb-coordonnees {
  font-size: 0.9rem;
  color: #666;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  margin: 0 0 1rem;
}
.lb-coordonnees--vide {
  color: #aaa;
  font-style: italic;
  font-family: inherit;
}
.lb-globe {
  max-width: 220px;
  margin-bottom: 1rem;
}
.lb-compteur {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}
.btn-fermer {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #1a1a1a;
  z-index: 10000;
}
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 1rem;
  color: #1a1a1a;
  z-index: 10000;
}
.nav-gauche {
  left: 0.5rem;
}
.nav-droite {
  right: 0.5rem;
}
@media (max-width: 768px) {
  .btn-fermer {
    top: 0.5rem;
    right: 1rem;
  }
  .nav-btn {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
  .nav-gauche {
    left: 0;
  }
  .nav-droite {
    right: 0;
  }
}
</style>
