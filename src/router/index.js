import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'




const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/Expo-Nomade', name: 'expo-nomade', component: () => import('../views/Expo-NomadeView.vue') },
    { path: '/Rencontre', name: 'rencontre', component: () => import('../views/RencontreView.vue') },
    // Le ":id" veut dire que ce morceau d'URL peut changer (ex: /expo-2/marie-dupont)
    { path: '/Rencontre/:id', name: 'rencontre-detail', component: () => import('../views/RencontreDetailView.vue') },
    { path: '/mes-photos', name: 'mes-photos', component: () => import('../views/MesPhotosView.vue') },
    { path: '/audiovisuel', name: 'audiovisuel', component: () => import('../views/AudioVisualView.vue') },
    { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
    { path: '/portfolio', name: 'portfolio', component: () => import('../views/PortfolioView.vue') },
    { path: '/mentions-legales', name: 'mentions-legales', component: () => import('../views/MentionsLegalesView.vue') }
  ]
})

export default router