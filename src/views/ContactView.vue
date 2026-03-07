<template>
  <div class="contact-container">
    
    <div class="contact-content">
      <div class="portrait-photographe">
        <img src="/photos/ilyass_nb.jpg" alt="Portrait du photographe" @contextmenu.prevent draggable="false" />
      </div>

      <div class="infos-colonne">
        <h2>À propos</h2>
        <p class="bio">
          Je suis un jeune artiste né et grandi au Maroc, plus précisément à Oujda. 
          Installé en France depuis 2019 avec ma famille, j’y ai poursuivi mes études 
          tout en développant pleinement mes pratiques et mes passions artistiques.
          </p>

          <p class="bio">
          À travers mon travail, je m’intéresse aux réalités cachées, aux détails 
          souvent ignorés ou méconnus du quotidien. Mon approche artistique cherche 
          à documenter et révéler ces fragments invisibles du réel.
          </p>

          <p class="bio">
          Je suis actuellement étudiant en formation IMAC (Image, Multimédia, 
          Audiovisuel et Communication) à l’ESIEE Paris.
          </p>

        <div class="contact-details">
          <h3>Contact</h3>
          <a href="mailto:contact@monnom.com" class="email-link">ilyass.remmane@edu.esiee.fr</a>
        </div>

        <div class="social-links">
          <h3>Réseaux</h3>
          <a href="https://www.instagram.com/arts_bidaei/" target="_blank" rel="noopener noreferrer" class="social-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Instagram
          </a>
          
          <a href="https://www.youtube.com/@ilyassremmane2509" target="_blank" rel="noopener noreferrer" class="social-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M23.5 6.2a2.9 2.9 0 0 0-2-2C19.8 3.8 12 3.8 12 3.8s-7.8 0-9.5.4a2.9 2.9 0 0 0-2 2A30.5 30.5 0 0 0 0 12a30.5 30.5 0 0 0 .5 5.8 2.9 2.9 0 0 0 2 2c1.7.4 9.5.4 9.5.4s7.8 0 9.5-.4a2.9 2.9 0 0 0 2-2A30.5 30.5 0 0 0 24 12a30.5 30.5 0 0 0-.5-5.8zM9.7 15.5v-7l6.3 3.5-6.3 3.5z"/>
  </svg>
            YouTube
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.contact-container {
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 2rem;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

@media (min-width: 800px) {
  .contact-content {
    flex-direction: row;
    align-items: flex-start;
  }
  .portrait-photographe {
    flex: 1;
  }
  .infos-colonne {
    flex: 1.2;
    padding-left: 2rem;
  }
}

.portrait-photographe img {
  width: 100%;
  height: auto;
  display: block;
  filter: grayscale(20%); /* Petite astuce : désature légèrement la photo pour faire plus pro */
}

.infos-colonne h2 {
  font-size: 2.2rem;
  font-weight: normal;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.bio {
  line-height: 1.7;
  color: #444;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  text-align: justify;
}

.contact-details, .social-links {
  margin-top: 3rem;
}

h3 {
  font-size: 0.9rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.email-link {
  font-size: 1.2rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: opacity 0.3s;
}
.email-link:hover {
  opacity: 0.6;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s, transform 0.3s;
}
.social-btn:hover {
  color: #666;
  transform: translateX(5px); /* Petit effet de glissement vers la droite au survol */
}
</style>