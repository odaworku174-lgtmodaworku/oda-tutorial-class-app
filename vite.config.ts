import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['oda_logo.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'ODA EDUCATIONAL APP - Grade 9-12 & University',
          short_name: 'ODA EDU',
          description: 'Official curriculum-based educational learning platform for Grade 9 to 12 and Freshman University students by Mr. Oda Worku.',
          theme_color: '#0284c7',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['education', 'books'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Kutaalee & Barnoota',
              short_name: 'Barnoota',
              description: 'Open curriculum courses',
              url: '/?tab=catalog',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Kuusaa Fiidiyoo (Offline)',
              short_name: 'Offline Media',
              description: 'Open offline video storage',
              url: '/?tab=my-learning',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            // Workbox runtime caching for lesson videos (rangeRequests for audio/video partial seeking)
            {
              urlPattern: ({ request, url }) =>
                request.destination === 'video' ||
                /\.(?:mp4|webm|m4v|ogg)$/i.test(url.pathname) ||
                url.pathname.startsWith('/videos/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'oda-lesson-videos-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days retention
                },
                cacheableResponse: {
                  statuses: [0, 200, 206],
                },
                rangeRequests: true,
              },
            },
            // Workbox runtime caching for downloadable lesson notes, PDFs, presentations & JSON curriculum
            {
              urlPattern: ({ request, url }) =>
                request.destination === 'document' ||
                /\.(?:pdf|pptx|ppt|docx|doc|txt|json)$/i.test(url.pathname) ||
                url.pathname.startsWith('/docs/') ||
                url.pathname.startsWith('/notes/'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'oda-lesson-notes-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Workbox runtime caching for images and video posters
            {
              urlPattern: ({ request, url }) =>
                request.destination === 'image' ||
                /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'oda-images-cache',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Google Fonts Stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Google Fonts Webfonts
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
