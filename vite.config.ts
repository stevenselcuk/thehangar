import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import versionBumper from 'vite-plugin-version-bumper';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: true,
    },
    base: env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      tailwindcss(),
      versionBumper({
        // 1. Define files to scan (glob pattern)
        files: 'src/**/*.{ts,tsx,js,jsx}',

        // 2. (Optional) Custom pattern.
        // Default is /(_v)(\d+)/g which matches "_v1", "_v10", etc.
        // Group 1 must be the prefix, Group 2 must be the number.
        pattern: /(_build_)(\d+)/g,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'The Hangar',
          short_name: 'Hangar',
          description:
            '"An incremental mystery RPG where you play as a night-shift mechanic uncovering a terrifying conspiracy involving a lost flight and eldritch technology.',
          theme_color: '#262626',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-helmet-async'],
            'utils-vendor': ['immer', 'lz-string'],
            'sentry-vendor': ['@sentry/react'],
          },
        },
      },
    },
  };
});
