<script setup>
import { ref } from 'vue'

// Cette variable retient si le menu est ouvert (true) ou fermé (false)
const isMenuOpen = ref(false)

// Cette fonction inverse l'état du menu quand on clique sur l'icône
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Cette fonction ferme le menu quand on clique sur un lien (très pratique sur mobile !)
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="site-container">
    <header class="navigation">
      <h1>
      <RouterLink to="/" class="logo-link">ILYASS REMMANE</RouterLink>
      </h1>
      
      <button class="hamburger" @click="toggleMenu" aria-label="Menu">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <nav :class="{ 'nav-open': isMenuOpen }">
        <RouterLink to="/" @click="closeMenu">Photographie</RouterLink>
        <RouterLink to="/audiovisuel" @click="closeMenu">Audiovisuel</RouterLink>
        
        <a href="https://ilyassremmane.my.canva.site/portfolio" target="_blank" rel="noopener noreferrer" @click="closeMenu">Portfolio</a>
        <RouterLink to="/contact" @click="closeMenu">Info / Contact</RouterLink>
      </nav>
    </header>

    <main class="content-area">
      <RouterView />
    </main>

    <footer class="site-footer">
      <p class="copyright">&copy; 2026 ILYASS REMMANE. Tous droits réservés.</p>
      <div class="footer-links">
        <RouterLink to="/contact">Contact</RouterLink>
        <RouterLink to="/mentions-legales">Mentions Légales</RouterLink>
        <button class="cookie-btn">Gestion des cookies</button>
      </div>
    </footer>
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
/* --- Style global minimaliste --- */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
}
.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  /* --- LA MAGIE DU FOOTER EN BAS COMMENCE ICI --- */
  min-height: 100vh; /* Le conteneur fait au minimum 100% de la hauteur de l'écran */
  box-sizing: border-box; /* Empêche le "padding" de rajouter du scroll en trop */
  display: flex;
  flex-direction: column; /* Organise le site en colonne (Header, Main, Footer) */
}
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  position: relative; /* Important pour placer le menu mobile en dessous */
}
.navigation h1 {
  font-size: 1.5rem;
  font-weight: normal;
  margin: 0;
}

/* Le bouton hamburger est caché sur ordinateur */
.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a1a1a;
  padding: 0;
}

/* Style des liens sur ordinateur */
nav {
  display: flex;
}
nav a {
  margin-left: 1.5rem;
  text-decoration: none;
  color: #666;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}
nav a:hover, nav a.router-link-active {
  color: #000;
}
.logo-link {
  color: inherit;
  text-decoration: none;
}

/* --- Adaptation Mobile (écrans de 768px et moins) --- */
@media (max-width: 768px) {
  /* On affiche l'icône hamburger */
  .hamburger {
    display: block; 
  }
  
  /* On cache le menu par défaut et on le prépare à s'afficher en colonne */
  nav {
    display: none; 
    flex-direction: column;
    position: absolute;
    top: 100%; /* S'affiche juste en dessous du header */
    left: 0;
    right: 0;
    background-color: white;
    padding: 1rem 0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); /* Petite ombre légère */
    z-index: 50;
  }

  /* Cette classe est ajoutée par Vue.js quand on clique sur le bouton */
  nav.nav-open {
    display: flex; 
  }

  /* On centre les liens et on les espace un peu plus pour les gros doigts */
  nav a {
    margin: 0.8rem 0;
    margin-left: 0;
    text-align: center;
    font-size: 1.1rem;
  }
}

/* --- Style du Footer --- */
.content-area {
  flex: 1 0 auto; /* Le "1" dit de grandir au max, le "0 auto" empêche les bugs */
  width: 100%;
}

.site-footer {
  margin-top: 6rem;
  padding-top: 2rem;
  border-top: 1px solid #eee; /* Petite ligne séparatrice très discrète */
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a, .cookie-btn {
  color: #888;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-links a:hover, .cookie-btn:hover {
  color: #000;
}

/* Footer sur mobile */
@media (max-width: 768px) {
  .site-footer {
    flex-direction: column-reverse; /* Met le copyright tout en bas */
    gap: 1.5rem;
    text-align: center;
  }
  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
} 
</style>