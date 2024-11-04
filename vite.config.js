import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'], // Add additional assets here if needed
      manifest: {
        name: 'Campus Icon',
        short_name: 'CampusIcon',
        description: 'A social competition platform for students.',
        theme_color: '#205e78',
        background_color: '#277AA4',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: './src/assets/logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './src/assets/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      manifestFilename: 'manifest.webmanifest', // Ensures manifest has a consistent filename
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Set to 5 MB to allow for larger files
      },
    })
  ],
  base: '/', // Set the base path to root for consistent URL resolution
});
