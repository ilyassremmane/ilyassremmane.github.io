<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// -- VIDÉO --
const videoEnLecture = ref(null)

const lancerVideo = (idVideo) => {
  videoEnLecture.value = idVideo
}

// -- AFFICHE (LIGHTBOX) --
const afficheOuverte = ref(false)
const urlAffiche = "/photos/audiovisuel/affiche_la_prepa.jpg" // Défini ici pour l'utiliser à 2 endroits

const ouvrirAffiche = () => {
  afficheOuverte.value = true
}
const fermerAffiche = () => {
  afficheOuverte.value = false
}

// Fermer avec la touche Échap
const gererClavier = (e) => {
  if (afficheOuverte.value && e.key === 'Escape') fermerAffiche()
}

onMounted(() => window.addEventListener('keydown', gererClavier))
onUnmounted(() => window.removeEventListener('keydown', gererClavier))
</script>

<template>
  <div class="audiovisuel-container">
    
    <header class="page-header">
      <h2>Audiovisuel</h2>
      <p>Documentaires, interviews et expérimentations visuelles.</p>
    </header>

    <div class="videos-list">
      
      <article class="docu-phare">
        
        <header class="docu-header">
          <h3>La prépa de plus près</h3>
          <span class="annee">2025 — 18 min — filmé : 2024</span>
        </header>

        <div class="docu-content">
          <div class="affiche-col">
            <img 
              :src="urlAffiche" 
              alt="Affiche du film" 
              class="affiche-cliquable"
              @click="ouvrirAffiche"
              @contextmenu.prevent 
              draggable="false" 
            />
            <p class="indication-clic">Cliquez pour agrandir</p>
          </div>

          <div class="info-col">
            <p class="description">
              "La prépa de plus près" est un documentaire captivant qui plonge au cœur du quotidien des étudiants en classes préparatoires. 
              Réalisé par un étudiant de prépa lui-même, ce projet authentique et immersif a été filmé sur une année complète pour offrir 
              une vision aussi réaliste que possible de cette expérience exigeante.
            </p>

            <div class="video-wrapper mt-2">
              <div  v-if="videoEnLecture !== 'documentaire1'" class="miniature-custom" @click="lancerVideo('documentaire1')">
                <img src="/photos/audiovisuel/couverture_la_prepa.jpg" alt="Bande-annoce"/>
                <button class="play-btn">
                  <svg viewBox="0 0 24 24" width="60" height="60" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
              </div>
              
              <iframe 
                v-else
                src="https://www.youtube.com/embed/5gO8gFpdX8w?si=DRCX-kdUexXvI4oO&autoplay=1" 
                title="Bande annonce" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </div>
      </article>

      <hr class="separateur" />

      <article class="video-item">
        <header class="video-info-top">
          <h3>Noise of War</h3>
          <span class="annee">2025 — 4 min - vidéo collage</span>
        </header>

        <div class="video-wrapper">
          <div v-if="videoEnLecture !== 'interview1'" class="miniature-custom" @click="lancerVideo('interview1')">
            <img src="/photos/audiovisuel/couverture.jpg" alt="Miniature personnalisée" />
            <button class="play-btn">
              <svg viewBox="0 0 24 24" width="60" height="60" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          </div>
          
          <iframe 
            v-else
            src="https://www.youtube.com/embed/lOj8tc2txKg?si=7sZG1NbmbdGIfThF?autoplay=1" 
            title="Interview" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </article>

    </div>
    <div v-if="afficheOuverte" class="lightbox-affiche" @click.self="fermerAffiche">
      <button class="btn-fermer-affiche" @click="fermerAffiche" title="Fermer (Échap)">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="black" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      
      <img :src="urlAffiche" alt="Affiche en grand" class="affiche-agrandie" @contextmenu.prevent draggable="false" />
    </div>
  </div>
</template>

<style scoped>
.page-header { text-align: center; margin-bottom: 5rem; }
.page-header h2 { font-weight: normal; font-size: 2.5rem; margin-bottom: 0.5rem; }
.page-header p { color: #666; }

.videos-list {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* --- LE DOCUMENTAIRE PHARE --- */
.docu-phare {
  display: flex;
  flex-direction: column;
}

.docu-header {
  margin-bottom: 2rem; /* Espace entre le titre et le contenu en dessous */
}
.docu-header h3 { font-size: 2.2rem; font-weight: normal; margin-top: 0; margin-bottom: 0.5rem; }
.docu-header .annee { display: block; font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }

.docu-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
@media (min-width: 800px) {
  .docu-content { 
    flex-direction: row; 
    align-items: stretch; /* Force les deux colonnes à faire la même hauteur */
  }
  .affiche-col { flex: 1; }
  .info-col { 
    flex: 2; 
    display: flex; 
    flex-direction: column; /* Permet d'organiser l'intérieur de la colonne */
  }
}

.affiche-col img {
  width: 100%;
  height: auto;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  display: block;
}

.info-col .description { line-height: 1.6; color: #444; margin-top: 0; margin-bottom: 2rem; text-align: justify; }
.mt-2 { 
  margin-top: auto; /* C'est ce mot magique qui pousse la vidéo tout en bas ! */
}

/* --- LIGNE SÉPARATRICE --- */
.separateur { border: 0; height: 1px; background-color: #eee; margin: 2rem 0; }

/* --- LES VIDÉOS CLASSIQUES --- */
.video-info-top { margin-bottom: 1.5rem; }
.video-info-top h3 { font-size: 1.8rem; font-weight: normal; margin: 0 0 0.5rem 0; }
.video-info-top .annee { font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }

/* Wrapper 16:9 pour YouTube/Vimeo */
.video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; background-color: #111; overflow: hidden; }
.video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* --- LE SYSTÈME DE MINIATURE PERSONNALISÉE --- */
.miniature-custom {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  cursor: pointer; display: flex; justify-content: center; align-items: center;
}
.miniature-custom img {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: 0.7; transition: opacity 0.3s;
}
.miniature-custom:hover img { opacity: 0.9; }

.play-btn {
  position: relative; z-index: 10; background: rgba(0, 0, 0, 0.6);
  border: none; border-radius: 50%; width: 80px; height: 80px;
  display: flex; justify-content: center; align-items: center;
  cursor: pointer; transition: transform 0.2s, background 0.2s;
}
.miniature-custom:hover .play-btn { transform: scale(1.1); background: rgba(0, 0, 0, 0.8); }

/* --- STYLE AFFICHE CLIQUABLE --- */
.affiche-cliquable {
  cursor: zoom-in;
  transition: opacity 0.3s ease;
}
.affiche-cliquable:hover {
  opacity: 0.85;
}
.indication-clic {
  text-align: right;
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
  margin-top: 0.5rem;
}

/* --- LIGHTBOX AFFICHE --- */
.lightbox-affiche {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(255, 255, 255, 0.98); /* Fond blanc pur semi-transparent */
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: zoom-out; /* Curseur "-" pour indiquer qu'on peut cliquer pour fermer */
}

.affiche-agrandie {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1); /* Petite ombre pour détacher l'image du fond blanc */
  cursor: default;
}

.btn-fermer-affiche {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10001;
}

@media (max-width: 768px) {
  .btn-fermer-affiche { top: 1rem; right: 1rem; }
  .affiche-agrandie { max-width: 95vw; max-height: 95vh; }
}
</style>