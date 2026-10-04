<template>
  <div class="portfolio-container">
    <h1 class="titre-page">Portfolio</h1>

    <div class="themes-grid">
      <button 
        v-for="theme in portfolioData" 
        :key="theme.id" 
        class="theme-btn"
        @click="ouvrirTheme(theme)"
      >
        {{ theme.titre }}
      </button>
    </div>

    <div class="modal-overlay" v-if="themeActif" @click.self="fermerTheme">
      <div class="modal-content">
        
        <button class="btn-fermer" @click="fermerTheme">✕</button>

        <h2 class="modal-titre">{{ themeActif.titre }}</h2>

        <div class="slide-content">
          
          <div class="image-container">
            <template v-if="slideActuelle.images && slideActuelle.images.length > 0">
              <img 
                v-for="(image, index) in slideActuelle.images" 
                :key="index" 
                :src="image" 
                class="slide-img" 
                alt="Photo du portfolio"
              />
            </template>
            <div class="placeholder-img" v-else>Aucune image trouvée</div>
          </div>
          <p class="slide-texte" v-html="slideActuelle.texte"></p>
        </div>

        <div class="modal-navigation" v-if="themeActif.slides.length > 1">
          <button class="nav-btn" @click="slidePrecedente" :disabled="indexSlide === 0">← Précédent</button>
          <span class="compteur">{{ indexSlide + 1 }} / {{ themeActif.slides.length }}</span>
          <button class="nav-btn" @click="slideSuivante" :disabled="indexSlide === themeActif.slides.length - 1">Suivant →</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// On importe le fichier JSON qu'on vient de créer
import portfolioData from '@/data/portfolio.json'

// Variables d'état
const themeActif = ref(null)
const indexSlide = ref(0)

// Fonction pour ouvrir la fenêtre avec le bon thème
const ouvrirTheme = (theme) => {
  themeActif.value = theme
  indexSlide.value = 0 // On commence toujours à la première slide
}

// Fonction pour fermer la fenêtre
const fermerTheme = () => {
  themeActif.value = null
}

// Fonctions pour naviguer (gauche/droite)
const slideSuivante = () => {
  if (indexSlide.value < themeActif.value.slides.length - 1) {
    indexSlide.value++
  }
}

const slidePrecedente = () => {
  if (indexSlide.value > 0) {
    indexSlide.value--
  }
}

// Propriété calculée pour afficher la slide actuelle rapidement
const slideActuelle = computed(() => {
  if (!themeActif.value) return null
  return themeActif.value.slides[indexSlide.value]
})

// Fonction qui s'active à chaque fois qu'on appuie sur une touche
const gererClavier = (event) => {
  if (!themeActif.value) return;
  if (event.key === 'ArrowRight') {
    slideSuivante();
  } 
  else if (event.key === 'ArrowLeft') {
    slidePrecedente();
  }
  else if (event.key === 'Escape') {
    fermerTheme();
  }
}

// On allume le radar quand la page s'affiche
onMounted(() => {
  window.addEventListener('keydown', gererClavier);
})

// On éteint le radar si on quitte la page Portfolio (pour éviter les bugs)
onUnmounted(() => {
  window.removeEventListener('keydown', gererClavier);
})
</script>

<style scoped>
/* STYLE GLOBAL MINIMALISTE */
.portfolio-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #000000;
  padding: 2rem;
  font-family: sans-serif;
}

.titre-page {
  font-size: 2.5rem;
  letter-spacing: 2px;
  margin-bottom: 3rem;
  text-transform: uppercase;
}

/* GRILLE DES BOUTONS */
.themes-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.theme-btn {
  background: transparent;
  border: 1px solid #cccccc;
  color: #333333;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

/* FENETRE MODAL (POP-UP) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95); /* Fond blanc transparent */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border: 2px solid #000000;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  box-shadow: 10px 10px 0px #e0e0e0;
}

.btn-fermer {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #000;
}

.modal-titre {
  text-transform: uppercase;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

/* CONTENU DE LA SLIDE */
.slide-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* LE CONTENEUR DE LA GALERIE */
.image-container {
  width: 100%;
  height: 450px; /* Hauteur généreuse pour bien voir les photos */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px; /* Bel espace entre les photos */
  
  /* Permet le défilement horizontal */
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 15px; /* Laisse de la place pour la barre de défilement */
  
  /* Fond neutre pour faire ressortir les photos */
  background: transparent; 
}

/* LE STYLE DES PHOTOS (Le secret est ici) */
.slide-img {
  height: 100%; /* L'image prend toute la hauteur disponible... */
  width: auto; /* ... et calcule sa largeur toute seule ! */
  
  /* LA REGLE D'OR : On ne coupe pas, on contient l'image */
  object-fit: contain; 
  
  /* L'AUTRE SECRET : Interdit à l'image de s'écraser si la galerie est pleine */
  flex: 0 0 auto; 
  
  /* Petit bonus esthétique : une ombre douce pour détacher la photo du fond */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff; /* Fond blanc derrière la photo si elle est transparente */
}

/* On personnalise un peu la barre de défilement pour que ça fasse plus "Pro" */
.image-container::-webkit-scrollbar {
  height: 8px;
}
.image-container::-webkit-scrollbar-track {
  background: #f1f1f1; 
  border-radius: 4px;
}
.image-container::-webkit-scrollbar-thumb {
  background: #888; 
  border-radius: 4px;
}
.image-container::-webkit-scrollbar-thumb:hover {
  background: #555; 
}

.placeholder-img {
  color: #999;
}

.slide-texte {
  line-height: 1.6;
  font-size: 1.1rem;
  text-align: justify;
  white-space: pre-line;
}

/* NAVIGATION GAUCHE/DROITE */
.modal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
}

.nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.compteur {
  font-size: 0.9rem;
  color: #666;
}

/* RESPONSIVE TELEPHONE */
@media (max-width: 600px) {
  .modal-content {
    padding: 1.5rem;
  }
  .image-container {
    height: 200px;
  }
  .slide-texte {
    font-size: 1rem;
  }
}
</style>