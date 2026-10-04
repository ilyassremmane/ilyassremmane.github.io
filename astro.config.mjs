import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'

// https://astro.build/config
export default defineConfig({
  // Utilisé pour générer les balises <link rel="canonical"> (SEO)
  site: 'https://ilyassremmane.github.io',
  integrations: [vue()],
  vite: {
    resolve: {
      // Même alias "@" que l'ancien vite.config.js (jsconfig.json : "@/*" -> "./src/*")
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
