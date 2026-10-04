<script setup>
import SerieCalendrier from './SerieCalendrier.vue'
import SerieGlobe from './SerieGlobe.vue'

defineProps({
  photos: { type: Array, required: true },
  lieux: { type: Object, required: true },
})
</script>

<template>
  <div class="selection-split">
    <div class="split-calendrier">
      <SerieCalendrier :photos="photos" />
    </div>
    <div class="split-globe">
      <SerieGlobe mode="plein" :photos="photos" :lieux="lieux" />
    </div>
  </div>
</template>

<style scoped>
.selection-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: center;
  margin-bottom: 3.5rem;
}
@media (min-width: 900px) {
  .selection-split {
    grid-template-columns: 1fr 1fr; /* globe à la même échelle que le calendrier */
  }
}
.split-globe {
  min-width: 0; /* évite le débordement de la grille sur mobile */
  width: 100%;
}
.split-globe .globe {
  max-width: 400px; /* même ordre de grandeur que le calendrier */
  margin: 0 auto;
}
</style>
