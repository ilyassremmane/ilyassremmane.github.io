<template>
  <div class="contact-container">
    
    <div class="contact-content">
      <div class="portrait-photographe">
        <img src="https://picsum.photos/id/1011/800/1000" alt="Portrait du photographe" @contextmenu.prevent draggable="false" />
      </div>

      <div class="infos-colonne">
        <h2>À propos</h2>
        <p class="bio">
          Je suis un(e) photographe basé(e) en France, spécialisé(e) dans la photographie documentaire et le portrait. 
          Mon travail explore les liens entre les individus et leur environnement, avec une attention particulière 
          portée aux histoires oubliées et aux détails du quotidien.
        </p>
        <p class="bio">
          Diplômé(e) de [Nom de ton école/formation], je collabore régulièrement avec des associations 
          pour mettre en lumière leurs initiatives à travers l'image et l'audiovisuel.
        </p>

        <div class="contact-details">
          <h3>Me contacter</h3>
          <a href="mailto:contact@monnom.com" class="email-link">contact@monnom.com</a>
        </div>

        <div class="social-links">
          <h3>Réseaux</h3>
          <a href="https://instagram.com/ton_compte" target="_blank" rel="noopener noreferrer" class="social-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Instagram
          </a>
          
          <a href="https://linkedin.com/in/ton_compte" target="_blank" rel="noopener noreferrer" class="social-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
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