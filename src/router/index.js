import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'




const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', 
      name: 'home', 
      component: HomeView ,
      meta: { title: 'Photographie'}
    },

    { path: '/Expo-Nomade', name: 'expo-nomade', component: () => import('../views/Expo-NomadeView.vue') },
    { path: '/Rencontre', name: 'rencontre', component: () => import('../views/RencontreView.vue') },
    // Le ":id" veut dire que ce morceau d'URL peut changer (ex: /expo-2/marie-dupont)
    { path: '/Rencontre/:id', name: 'rencontre-detail', component: () => import('../views/RencontreDetailView.vue') },
    { path: '/MaSelection', name: 'selection', component: () => import('../views/MaSelectionView.vue') },
    
    { path: '/audiovisuel',
       name: 'audiovisuel',
        component: () => import('../views/AudioVisualView.vue'),
        meta: { title: 'Audiovisuel' }
      },
    
    { path: '/contact', 
      name: 'contact', 
      component: () => import('../views/ContactView.vue') ,
      meta: { title: 'Contact' }
    },

    { path: '/portfolio', 
      name: 'portfolio', 
      component: () => import('../views/PortfolioView.vue'),
      meta: { title: 'Portfolio' }
    },

    { path: '/mentions-legales', name: 'mentions-legales', component: () => import('../views/MentionsLegalesView.vue') }
  ]
})

// Le code qui change le titre de l'onglet à chaque clic
router.beforeEach((to, from, next) => {
  // On récupère le titre qu'on a défini dans la route (ex: "Photographie")
  const titrePage = to.meta.title;
  
  // Si la page a un titre, on l'affiche avec ton nom
  if (titrePage) {
    document.title = `Ilyass Remmane - ${titrePage}`;
  } else {
    // Sinon, on met juste ton nom par défaut
    document.title = 'Ilyass Remmane';
  }
  
  // On laisse le visiteur continuer vers la page
  next();
});

export default router