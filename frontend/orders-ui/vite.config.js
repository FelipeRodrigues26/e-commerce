import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'orders_ui',
      filename: 'remoteEntry.js',
      exposes: {
        './OrdersApp': './src/OrdersApp.jsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 3001,
    host: true,
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 3001,
    host: true
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
