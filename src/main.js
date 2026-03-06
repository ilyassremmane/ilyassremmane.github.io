import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // C'est ça qui charge tes pages !

const app = createApp(App)

app.use(router)
app.mount('#app')