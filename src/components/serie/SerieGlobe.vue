<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { geoOrthographic, geoPath, geoDistance } from 'd3-geo'
import { feature } from 'topojson-client'
import topo from 'world-atlas/land-110m.json'
import { lecture, abonner, setFiltre, resetFiltre, versGalerie } from './serieEtat.js'

const props = defineProps({
  photos: { type: Array, default: () => [] },
  lieux: { type: Object, default: () => ({}) },
  // 'plein' = globe interactif de la page | 'mini' = globe statique de la lightbox
  mode: { type: String, default: 'plein' },
  // mode mini : centre du globe { nom, lat, lon }
  centre: { type: Object, default: null },
})

const TAILLE = 360
const RAYON = 158
const DEFAUT = { lon: -2, lat: 34 } // haut du Maroc, orienté Méditerranée

// Côtes (terre/mer) uniquement — aucune frontière politique
const TERRE = feature(topo, topo.objects.land)
const projection = geoOrthographic().clipAngle(90).translate([TAILLE / 2, TAILLE / 2])
const tracer = geoPath(projection)

const rotation = ref([-DEFAUT.lon, -DEFAUT.lat]) // rotation = [-lon, -lat]
// La mini-carte de la lightbox est une version zoomée (régionale), pas le globe entier
const ZOOM_MINI = 2
// Zoom manuel : monte jusqu'à 8× pour séparer des positions proches
const MAX_ZOOM = 8
const zoom = ref(props.mode === 'mini' ? ZOOM_MINI : 1)
const filtre = ref({ date: null, lieu: null })

const centreGeo = computed(() => [-rotation.value[0], -rotation.value[1]])

const dessin = computed(() => {
  projection.rotate(rotation.value).scale(RAYON * zoom.value)
  return { sphere: tracer({ type: 'Sphere' }), terre: tracer(TERRE) }
})

// Lieux visités un jour donné (pins caméra) — affichés si une date est sélectionnée
const lieuxDuJour = computed(() => {
  if (!filtre.value.date) return null
  const m = new Map()
  for (const p of props.photos) {
    const l = props.lieux[p.lieu]
    if (p.date !== filtre.value.date || !l) continue
    if (!m.has(p.lieu)) m.set(p.lieu, { key: p.lieu, type: 'camera', nom: l.nom, lat: l.lat, lon: l.lon, n: 0 })
    m.get(p.lieu).n++
  }
  return [...m.values()]
})

// Clusters gris par lieu (toutes les photos) — affichés quand aucune date n'est active
const clusters = computed(() => {
  const m = new Map()
  for (const p of props.photos) {
    const l = props.lieux[p.lieu]
    if (!l) continue
    if (!m.has(p.lieu)) m.set(p.lieu, { key: p.lieu, type: 'cluster', nom: l.nom, lat: l.lat, lon: l.lon, n: 0 })
    m.get(p.lieu).n++
  }
  return [...m.values()]
})

const marqueurs = computed(() => {
  if (props.mode === 'mini') {
    if (!props.centre) return []
    // IMPORTANT : projeter le point, sinon x/y sont undefined et le pin n'apparaît pas
    projection.rotate(rotation.value).scale(RAYON * zoom.value)
    const pt = projection([props.centre.lon, props.centre.lat])
    if (!pt) return []
    return [{ key: 'point', type: 'point', nom: props.centre.nom, lat: props.centre.lat, lon: props.centre.lon, x: pt[0], y: pt[1] }]
  }
  const base = filtre.value.date ? lieuxDuJour.value : clusters.value
  const c = centreGeo.value
  projection.rotate(rotation.value).scale(RAYON * zoom.value)
  const sortie = []
  for (const m of base) {
    // Masque les points situés derrière le globe
    if (geoDistance([m.lon, m.lat], c) > Math.PI / 2 - 0.03) continue
    const pt = projection([m.lon, m.lat])
    if (!pt) continue
    sortie.push({ ...m, x: pt[0], y: pt[1], actif: filtre.value.lieu === m.key })
  }
  return sortie
})

// --- Animation vers une cible (rotation + zoom) ---
let raf = null
function animerVers(rotCible, zoomCible, duree = 700) {
  if (raf) cancelAnimationFrame(raf)
  const depart = [...rotation.value]
  const zDepart = zoom.value
  let cible0 = rotCible[0]
  while (cible0 - depart[0] > 180) cible0 -= 360 // chemin le plus court en longitude
  while (cible0 - depart[0] < -180) cible0 += 360
  const t0 = performance.now()
  const pas = (t) => {
    const p = Math.min(1, (t - t0) / duree)
    const e = 1 - Math.pow(1 - p, 3) // easeOutCubic
    rotation.value = [depart[0] + (cible0 - depart[0]) * e, depart[1] + (rotCible[1] - depart[1]) * e]
    zoom.value = Math.max(1, Math.min(MAX_ZOOM, zDepart + (zoomCible - zDepart) * e))
    raf = p < 1 ? requestAnimationFrame(pas) : null
  }
  raf = requestAnimationFrame(pas)
}

function centroidJour(date) {
  const pts = []
  for (const p of props.photos) {
    const l = props.lieux[p.lieu]
    if (p.date === date && l) pts.push(l)
  }
  if (!pts.length) return null
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lon: pts.reduce((s, p) => s + p.lon, 0) / pts.length,
  }
}

function cibleDuFiltre(e) {
  if (props.mode !== 'plein') return
  if (e.lieu && props.lieux[e.lieu]) {
    const l = props.lieux[e.lieu]
    animerVers([-l.lon, -l.lat], Math.max(zoom.value, e.date ? 1.6 : 2))
  } else if (e.date) {
    const c = centroidJour(e.date)
    if (c) animerVers([-c.lon, -c.lat], Math.max(zoom.value, 1.5))
    else animerVers([-DEFAUT.lon, -DEFAUT.lat], 1)
  } else {
    animerVers([-DEFAUT.lon, -DEFAUT.lat], 1) // retour à la vue initiale
  }
}

// --- Interactions (mode plein) ---
const pointeurs = new Map()
let dernier = null
let bouge = false
let pincee = null
let zoomPincee = 1

function enBas(e) {
  if (props.mode !== 'plein') return
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY })
  dernier = { x: e.clientX, y: e.clientY }
  bouge = false
  pincee = null
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function enDeplacement(e) {
  if (props.mode !== 'plein' || !pointeurs.has(e.pointerId)) return
  pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointeurs.size >= 2) {
    // Pincez pour zoomer (mobile)
    const pts = [...pointeurs.values()]
    const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    if (pincee) zoom.value = Math.max(1, Math.min(MAX_ZOOM, zoomPincee * (d / pincee)))
    else {
      pincee = d
      zoomPincee = zoom.value
    }
    bouge = true
    return
  }
  if (!dernier) return
  const dx = e.clientX - dernier.x
  const dy = e.clientY - dernier.y
  if (Math.abs(dx) + Math.abs(dy) > 3) bouge = true
  dernier = { x: e.clientX, y: e.clientY }
  // Vitesse proportionnelle au zoom : le globe suit le curseur même à 8×
  const sensib = (57.3 / (RAYON * zoom.value)) * 0.7
  rotation.value = [
    rotation.value[0] + dx * sensib,
    Math.max(-80, Math.min(80, rotation.value[1] - dy * sensib)),
  ]
}
function enHaut(e) {
  pointeurs.delete(e.pointerId)
  dernier = null
  pincee = null
}
function molette(e) {
  if (props.mode !== 'plein') return
  zoom.value = Math.max(1, Math.min(MAX_ZOOM, zoom.value * Math.exp(-e.deltaY * 0.0015)))
}

function clicMarqueur(m) {
  if (props.mode !== 'plein' || bouge) return
  if (m.type === 'cluster') {
    const meme = filtre.value.lieu === m.key && !filtre.value.date
    if (meme) resetFiltre()
    else setFiltre({ lieu: m.key, date: null })
    if (!meme) animerVers([-m.lon, -m.lat], Math.max(zoom.value, 2))
  } else if (m.type === 'camera') {
    const meme = filtre.value.lieu === m.key
    setFiltre({ lieu: meme ? null : m.key }) // la date reste active
    if (!meme) animerVers([-m.lon, -m.lat], Math.max(zoom.value, 1.6))
  }
  versGalerie()
}

// --- Abonnement au store partagé ---
let desabonner
onMounted(() => {
  if (props.mode === 'mini') return
  const e = lecture()
  filtre.value = { date: e.date, lieu: e.lieu }
  desabonner = abonner((nouveau) => {
    const avant = filtre.value
    filtre.value = { date: nouveau.date, lieu: nouveau.lieu }
    if (nouveau.date !== avant.date || nouveau.lieu !== avant.lieu) cibleDuFiltre(nouveau)
  })
})
onUnmounted(() => {
  desabonner?.()
  if (raf) cancelAnimationFrame(raf)
})

watch(() => props.centre, (c) => {
  if (props.mode === 'mini' && c) rotation.value = [-c.lon, -c.lat]
}, { immediate: true })
</script>

<template>
  <div class="globe" :class="mode === 'mini' ? 'globe--mini' : 'globe--plein'">
    <svg
      :viewBox="`0 0 ${TAILLE} ${TAILLE}`"
      class="globe-svg"
      :role="mode === 'plein' ? 'application' : 'img'"
      :aria-label="mode === 'mini' ? 'Position de la photo sur le globe' : 'Globe terrestre interactif — glissez pour tourner'"
      @pointerdown="enBas"
      @pointermove="enDeplacement"
      @pointerup="enHaut"
      @pointercancel="enHaut"
      @wheel.prevent="molette"
    >
      <path :d="dessin.sphere" class="globe-sphere" />
      <path :d="dessin.terre" class="globe-terre" />
      <g
        v-for="m in marqueurs"
        :key="m.key"
        class="globe-marqueur"
        :class="{ 'is-actif': m.actif, 'is-dim': mode === 'plein' && filtre.lieu && !m.actif }"
        :transform="`translate(${m.x}, ${m.y})`"
        :role="mode === 'plein' ? 'button' : undefined"
        :tabindex="mode === 'plein' ? 0 : undefined"
        :aria-label="m.type === 'point' ? `Position : ${m.nom}` : `${m.nom} — ${m.n} photo(s)`"
        @click="clicMarqueur(m)"
        @keydown.enter.prevent="clicMarqueur(m)"
      >
        <template v-if="m.type === 'point'">
          <g class="globe-pin">
            <path d="M0,0 C-9,-11 -13,-17 -13,-24 A13,13 0 1 1 13,-24 C13,-17 9,-11 0,0 Z" />
            <circle cx="0" cy="-24" r="5" class="globe-pin-trou" />
          </g>
        </template>
        <template v-else-if="m.type === 'cluster'">
          <circle r="13" class="globe-cluster" />
          <text y="4" class="globe-cluster-nombre">{{ m.n }}</text>
        </template>
        <template v-else>
          <g class="globe-camera">
            <rect x="-8" y="-4" width="16" height="11" rx="2" />
            <rect x="-3.5" y="-6.5" width="7" height="2.5" rx="1" />
            <circle cx="0" cy="1.5" r="3.4" class="globe-lentille" />
          </g>
        </template>
      </g>
    </svg>
    <p v-if="mode === 'plein'" class="globe-aide">Glissez pour tourner · molette ou pincez pour zoomer</p>
  </div>
</template>

<style scoped>
.globe {
  width: 100%;
}
.globe-svg {
  width: 100%;
  height: auto;
  display: block;
  background: #fff;
}
.globe--plein .globe-svg {
  cursor: grab;
  touch-action: pan-y; /* laisse défiler la page en vertical sur mobile */
  user-select: none;
}
.globe--plein .globe-svg:active {
  cursor: grabbing;
}
.globe-sphere {
  fill: #fff;
  stroke: #1a1a1a;
  stroke-width: 1.2;
}
.globe-terre {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 1;
  stroke-linejoin: round;
}
.globe-marqueur {
  cursor: pointer;
}
.globe-marqueur:focus {
  outline: none;
}
.globe-marqueur:focus-visible circle {
  stroke: #0057ff;
  stroke-width: 2.5;
}
.globe-cluster {
  fill: #d9d9d9;
  stroke: #8a8a8a;
  stroke-width: 1;
  transition: fill 0.2s;
}
.globe-marqueur.is-actif .globe-cluster {
  fill: #1a1a1a;
  stroke: #1a1a1a;
}
.globe-cluster-nombre {
  font-size: 12px;
  fill: #1a1a1a;
  text-anchor: middle;
  user-select: none;
  pointer-events: none;
}
.globe-marqueur.is-actif .globe-cluster-nombre {
  fill: #fff;
}
.globe-camera rect {
  fill: #1a1a1a;
}
.globe-lentille {
  fill: #fff;
}
.globe-point {
  fill: #1a1a1a;
  stroke: #fff;
  stroke-width: 2;
}
.globe-pin path {
  fill: #1a1a1a;
}
.globe-pin-trou {
  fill: #fff;
}
.globe-marqueur.is-dim {
  opacity: 0.3;
}
.globe-aide {
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
  text-align: center;
  margin-top: 0.5rem;
}
.globe--mini .globe-svg {
  pointer-events: none;
}
</style>
