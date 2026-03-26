import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'catalog_ui',
      filename: 'remoteEntry.js',
      exposes: {
        './CatalogApp': './src/CatalogApp.jsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3003,
    host: '0.0.0.0',
    watch: {
      usePolling: true
    }
  }
})
