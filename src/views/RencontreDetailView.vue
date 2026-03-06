<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { listeRencontres } from '../data/rencontres.js'

const route = useRoute()

// 1. On utilise computed() pour que la page se mette à jour si on passe d'un profil à l'autre
const personne = computed(() => {
  return listeRencontres.find(p => p.id === route.params.id)
})

// 2. Navigation entre les profils
const indexCourant = computed(() => {
  return listeRencontres.findIndex(p => p.id === route.params.id)
})

const profilPrecedent = computed(() => {
  return indexCourant.value > 0 ? listeRencontres[indexCourant.value - 1] : null
})

const profilSuivant = computed(() => {
  return indexCourant.value < listeRencontres.length - 1 ? listeRencontres[indexCourant.value + 1] : null
})

// 3. Gestion de la visionneuse (Lightbox)
const lightboxOuverte = ref(false)
const indexActuel = ref(0)

const toutesLesPhotos = computed(() => {
  if (!personne.value) return []
  return [personne.value.photoCouverture, ...(personne.value.autresPhotos || [])]
})

const ouvrirPhoto = (index) => {
  indexActuel.value = index
  lightboxOuverte.value = true
}

const fermerPhoto = () => {
  lightboxOuverte.value = false
}

const photoSuivante = () => {
  if (indexActuel.value < toutesLesPhotos.value.length - 1) indexActuel.value++
  else indexActuel.value = 0
}

const photoPrecedente = () => {
  if (indexActuel.value > 0) indexActuel.value--
  else indexActuel.value = toutesLesPhotos.value.length - 1
}

// 4. On ferme la lightbox automatiquement si on change de profil via les liens
watch(() => route.params.id, () => {
  fermerPhoto()
})

// Gestion du clavier (Echap, Flèches)
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
  <div class="page-wrapper">
    
    <div class="rencontre-detail" v-if="personne">
      
      <RouterLink to="/Rencontre" class="btn-retour">
        &larr; Retour aux portraits
      </RouterLink>

      <div class="presentation-rencontre">
        <div class="texte-colonne">
          <h2>{{ personne.nom }}</h2>
          <p class="histoire">{{ personne.texte }}</p>
          
          <div class="miniatures-contexte" v-if="personne.autresPhotos && personne.autresPhotos.length > 0">
            <h4>Autres photos</h4>
            <div class="grille-miniatures">
              <img 
                v-for="(photo, index) in personne.autresPhotos" 
                :key="index" 
                :src="photo" 
                alt="Détail" 
                @click="ouvrirPhoto(index + 1)"
                @contextmenu.prevent 
                draggable="false"
              />
            </div>
          </div>
        </div>
        
        <div class="photo-colonne">
          <img 
            :src="personne.photoCouverture" 
            alt="Portrait" 
            @click="ouvrirPhoto(0)"
            @contextmenu.prevent 
            draggable="false" 
          />
          <p class="cliquez-pour-agrandir">Cliquez sur une photo pour l'agrandir</p>
        </div>
      </div>

      <nav class="nav-entre-profils">
        <RouterLink v-if="profilPrecedent" :to="`/Rencontre/${profilPrecedent.id}`" class="nav-lien nav-prev">
          &larr; {{ profilPrecedent.nom }}
        </RouterLink>
        <div v-else></div> <RouterLink v-if="profilSuivant" :to="`/Rencontre/${profilSuivant.id}`" class="nav-lien nav-next">
          {{ profilSuivant.nom }} &rarr;
        </RouterLink>
      </nav>

    </div>
    
    <div v-if="lightboxOuverte" class="lightbox" @click.self="fermerPhoto">
      <button class="btn-fermer" @click="fermerPhoto">Fermer &times;</button>
      <button class="nav-btn nav-gauche" @click="photoPrecedente">&larr;</button>
      
      <img :src="toutesLesPhotos[indexActuel]" class="photo-agrandie" @contextmenu.prevent draggable="false" />
      
      <button class="nav-btn nav-droite" @click="photoSuivante">&rarr;</button>
      <div class="compteur">{{ indexActuel + 1 }} / {{ toutesLesPhotos.length }}</div>
    </div>

  </div>
</template>

<style scoped>
.page-wrapper { padding-bottom: 4rem; }
.btn-retour {
  display: inline-block;
  margin-bottom: 3rem;
  color: #888;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.85rem;
}
.btn-retour:hover { color: #000; }

.presentation-rencontre {
  display: flex;
  flex-direction: column-reverse;
  gap: 3rem;
  margin-bottom: 4rem;
}
@media (min-width: 800px) {
  .presentation-rencontre { flex-direction: row; }
  .texte-colonne { flex: 1; padding-right: 3rem; }
  .photo-colonne { flex: 1.2; }
}

.texte-colonne h2 { font-size: 2.5rem; font-weight: normal; margin-top: 0; }
.histoire { font-size: 1.1rem; line-height: 1.7; color: #333; margin-bottom: 3rem; }

.miniatures-contexte h4 { font-weight: normal; color: #888; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
.grille-miniatures { display: flex; gap: 10px; flex-wrap: wrap; }
.grille-miniatures img { width: 80px; height: 80px; object-fit: cover; cursor: pointer; opacity: 0.8; transition: opacity 0.2s; }
.grille-miniatures img:hover { opacity: 1; }

.photo-colonne img { width: 100%; height: auto; display: block; cursor: pointer; }
.cliquez-pour-agrandir { text-align: right; font-size: 0.8rem; color: #aaa; font-style: italic; }

/* NAVIGATION ENTRE PROFILS */
.nav-entre-profils {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 2rem;
  margin-top: 4rem;
}
.nav-lien {
  text-decoration: none;
  color: #1a1a1a;
  font-size: 1.1rem;
  transition: opacity 0.3s;
}
.nav-lien:hover { opacity: 0.6; }
.nav-next { text-align: right; }

/* LIGHTBOX */
.lightbox { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(255, 255, 255, 0.98); z-index: 9999; display: flex; justify-content: center; align-items: center; }
.photo-agrandie { max-width: 85vw; max-height: 85vh; object-fit: contain; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.btn-fermer { position: absolute; top: 2rem; right: 2rem; background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 2rem; cursor: pointer; padding: 1rem; }
.nav-gauche { left: 2rem; }
.nav-droite { right: 2rem; }
.compteur { position: absolute; bottom: 2rem; color: #888; }
</style>