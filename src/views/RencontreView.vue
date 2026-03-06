<script setup>
// On importe notre liste de rencontres
import { listeRencontres } from '../data/rencontres.js'
</script>

<template>
  <div class="expo-container">
   <header class="expo-header">
      <div class="header-top">
        <RouterLink to="/" class="btn-retour" title="Retour à l'accueil">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Retour
        </RouterLink>
      </div>

      <h2>Portraits & Rencontres</h2>
      <p>Une collection d'histoires et de visages croisés sur ma route.</p>
    </header>

    <div class="grille-portraits">
      <RouterLink 
        v-for="personne in listeRencontres" 
        :key="personne.id"
        :to="`/Rencontre/${personne.id}`" 
        class="portrait-card"
      >
        <img :src="personne.photoCouverture" :alt="personne.nom" @contextmenu.prevent draggable="false" />
        <h3>{{ personne.nom }}</h3>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.header-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
}
.btn-retour {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
  transition: color 0.3s;
}
.btn-retour:hover { color: #000; }
.expo-header { text-align: center; margin-bottom: 4rem; }
.expo-header h2 { font-weight: normal; font-size: 2rem; }
.grille-portraits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}
.portrait-card {
  text-decoration: none;
  color: #1a1a1a;
  transition: opacity 0.3s;
}
.portrait-card:hover { opacity: 0.7; }
.portrait-card img {
  width: 100%;
  aspect-ratio: 1/1; /* Portraits au format carré */
  object-fit: cover;
  margin-bottom: 1rem;
}
.portrait-card h3 {
  font-weight: normal;
  font-size: 1.2rem;
  margin: 0;
  text-align: center;
}
</style>