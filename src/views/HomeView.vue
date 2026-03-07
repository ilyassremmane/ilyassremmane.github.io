<template>
  <div class="gallery">
    <RouterLink to="/Expo-Nomade" class="photo-item">
      <img src="/photos/expo_nomade/Fantasia_1_top.jpg" alt="Couverture Expo Nomade" @contextmenu.prevent draggable="false" />
      <p class="caption">Expo Nomade — 2025</p>
    </RouterLink>

    <RouterLink to="/Rencontre" class="photo-item">
      <img src="/photos/rencontre/renc_top.jpg" alt="Couverture Expo Rencontre" @contextmenu.prevent draggable="false" />
      <p class="caption">"Rencontre" — 2026</p>
    </RouterLink>

    <RouterLink to="/MaSelection" class="photo-item">
      <img src="/photos/plus/playa.jpg" alt="Couverture Mes Photos" @contextmenu.prevent draggable="false" />
      <p class="caption">Sélection Libre — Photographies diverses</p>
    </RouterLink>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 3rem 2rem; /* Plus d'espace en bas (3rem) qu'entre les colonnes (2rem) */
}
.photo-item {
  text-decoration: none; /* Enlève le soulignement du lien */
  display: block;
  transition: opacity 0.3s ease;
}
.photo-item:hover {
  opacity: 0.7; /* Petit effet au survol */
}
.photo-item img {
  width: 100%;
  aspect-ratio: 4/3; /* Force toutes les photos de couverture à avoir le même format ! */
  object-fit: cover;
  display: block;
  user-select: none; 
}
.caption {
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>