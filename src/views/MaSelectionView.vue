<script setup>
// CORRECTION 1 : Ajout de 'computed' ici
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 1. photos
const photoPrincipale = "/photos/plus/playa.jpg"
// On génère 17 photos (de Fantasia_2 à Fantasia_18)
const photos = ref(Array.from({ length: 7 }, (_, i) => `/photos/plus/maselc_${i + 1}.jpg`))

// 2. Gestion de la visionneuse (Lightbox)
const indexActuel = ref(0)
const lightboxOuverte = ref(false)

// On fusionne la photo principale et la grille pour que la visionneuse lise tout à la suite
const toutesLesPhotos = computed(() => {
  return [photoPrincipale, ...photos.value]
})

const ouvrirPhoto = (index) => {
  indexActuel.value = index
  lightboxOuverte.value = true
}

const fermerPhoto = () => {
  lightboxOuverte.value = false
}

// CORRECTION 2 : On utilise toutesLesPhotos.value.length pour la navigation
const photoSuivante = () => {
  if (indexActuel.value < toutesLesPhotos.value.length - 1) {
    indexActuel.value++
  } else {
    indexActuel.value = 0
  }
}

const photoPrecedente = () => {
  if (indexActuel.value > 0) {
    indexActuel.value--
  } else {
    indexActuel.value = toutesLesPhotos.value.length - 1
  }
}

// 3. Écoute des touches du clavier
const gererClavier = (evenement) => {
  if (!lightboxOuverte.value) return
  if (evenement.key === 'Escape') fermerPhoto()
  if (evenement.key === 'ArrowRight') photoSuivante()
  if (evenement.key === 'ArrowLeft') photoPrecedente()
}

onMounted(() => window.addEventListener('keydown', gererClavier))
onUnmounted(() => window.removeEventListener('keydown', gererClavier))
</script>

<template>
  <div class="expo-container">
    
    <header class="expo-header">
      <RouterLink to="/" class="btn-retour" title="Retour aux albums">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Retour
      </RouterLink>
      
      <div class="expo-titre">
        <h2>Ma séléction</h2>
        <span class="sous-titre">Photos diveerses</span>
        
        <!-- <div class="texte-presentation">
          <p>
            Cette exposition met à l'honneur une tradition maghrébine spectaculaire et profondément ancrée dans l’histoire et la culture arabo-amazighe : la Fantasia, aussi connue sous les noms de Tbourida, Waâda ou Moussem.
          </p>
          <p>
            Cette pratique équestre impressionnante prend la forme de parades militaires reconstituées, où des cavaliers armés de fusils à poudre noire exécutent des chorégraphies millimétrées au galop. Ces démonstrations sont bien plus que de simples performances : elles incarnent des rituels ancestraux transmis de génération en génération, dans une logique de transmission orale et communautaire.
          </p>
          <p>
            Les photographies présentées ici ont été capturées à l'été 2022 dans la région orientale du Maroc, entre Oujda et Jerrada.
          </p>
        </div> -->
      </div>
    </header>

    <div class="photo-hero">
      <img 
        :src="photoPrincipale" 
        alt="Photo d'ouverture" 
        class="img-entiere"
        @click="ouvrirPhoto(0)" 
        @contextmenu.prevent 
        draggable="false" 
      />
      <p class="cliquez-agrandir">Cliquez pour agrandir</p>
    </div>

    <div class="grille-photos">
      <div class="photo-item" v-for="(photo, index) in photos" :key="index" @click="ouvrirPhoto(index + 1)">
        <img :src="photo" alt="Photographie" @contextmenu.prevent draggable="false" />
      </div>
    </div>

    <div v-if="lightboxOuverte" class="lightbox" @click.self="fermerPhoto">
      <button class="btn-fermer" @click="fermerPhoto">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="white" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <button class="nav-btn nav-gauche" @click="photoPrecedente">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="white" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <img :src="toutesLesPhotos[indexActuel]" class="photo-agrandie" @contextmenu.prevent draggable="false" />

      <button class="nav-btn nav-droite" @click="photoSuivante">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="white" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

  </div>
</template>

<style scoped>
/* L'en-tête */
.btn-retour {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 2rem;
  transition: color 0.3s;
}
.btn-retour:hover { color: #000; }
.expo-titre {
  margin-bottom: 3rem; /* Espace avant la grande photo */
  text-align: center;
}

.expo-titre h2 { 
  font-weight: normal; 
  margin: 0 0 0.5rem 0; /* On réduit la marge du bas pour que le sous-titre soit proche du titre */
  font-size: 2.5rem; 
}
/* --- LE STYLE DU SOUS-TITRE --- */
.sous-titre {
  display: block; /* Oblige le sous-titre à se mettre sur sa propre ligne */
  font-size: 0.9rem;
  color: #888; /* Un gris élégant */
  text-transform: uppercase; /* Met le texte en majuscules */
  letter-spacing: 2px; /* Espace un peu les lettres pour le côté "Fine Art" */
  margin-bottom: 2.5rem; /* Crée l'espace avant de commencer les paragraphes */
}

/* --- Le nouveau style pour le texte --- */
.texte-presentation {
  max-width: 1000px; /* On autorise le texte à prendre beaucoup plus de place en largeur (avant c'était 600px) */
  margin: 0 auto;
}

.texte-presentation p { 
  color: #444; 
  line-height: 1.7; /* Aère les lignes pour faciliter la lecture */
  font-size: 1.1rem; 
  margin: 0 0 1.2rem 0; /* Espace entre chaque paragraphe */
  text-align: justify; /* Aligne le texte à gauche ET à droite, comme dans un livre */
}

/* CORRECTION 4 : Un seul bloc pour .photo-hero */
.photo-hero {
  margin-bottom: 4rem;
  text-align: right;
}

.img-entiere {
  width: 100%;
  max-height: 80vh; 
  object-fit: contain; 
  cursor: zoom-in;
  display: block;
  transition: opacity 0.3s;
  user-select: none;
}

.img-entiere:hover {
  opacity: 0.9;
}

.cliquez-agrandir {
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
  margin-top: 0.5rem;
}

/* Grille des miniatures */
.grille-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
.photo-item img {
  width: 100%;
  aspect-ratio: 3/2;
  object-fit: cover;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.3s;
}
.photo-item img:hover { opacity: 0.8; }

/* --- LIGHTBOX (Visionneuse Plein Écran) --- */
.lightbox {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* La photo en grand */
.photo-agrandie {
  max-width: 85vw;
  max-height: 85vh;
  object-fit: contain;
  user-select: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Boutons de la visionneuse */
.btn-fermer {
  position: absolute; top: 2rem; right: 2rem;
  background: none; border: none; cursor: pointer;
  z-index: 10000;
}
.btn-fermer svg { stroke: #000; } 

.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; padding: 1rem;
}
.nav-btn svg { stroke: #000; } 
.nav-gauche { left: 2rem; }
.nav-droite { right: 2rem; }

/* Adaptation Mobile pour la Lightbox */
@media (max-width: 768px) {
  .img-entiere { max-height: 50vh; }
  .photo-agrandie { max-width: 100vw; max-height: 100vh; }
  .btn-fermer { top: 1rem; right: 1rem; }
  .nav-gauche { left: 0; }
  .nav-droite { right: 0; }
} 
/* L'astuce magique : sur ordinateur, on divise le texte en 2 colonnes ! */
@media (min-width: 800px) {
  .texte-presentation {
    column-count: 2; /* 2 colonnes */
    column-gap: 3rem; /* Espace entre les deux colonnes */
  }
}
</style>
