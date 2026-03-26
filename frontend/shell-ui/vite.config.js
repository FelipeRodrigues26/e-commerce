import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell_ui',
      remotes: {
        orders_ui: 'http://localhost:3001/assets/remoteEntry.js',
        catalog_ui: 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
