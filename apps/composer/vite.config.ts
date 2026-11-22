import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { withZephyr } from 'vite-plugin-zephyr';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    federation({
      name: 'composer',
      filename: 'remoteEntry.js',
      exposes: { './PostComposer': './src/PostComposer.tsx' },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        zustand: { singleton: true },
        '@repo/store': { singleton: true },
      },
    }),
    // Deploying is a build side effect; the dev server stays fully local.
    ...(command === 'build' ? [withZephyr()] : []),
  ],
  server: { cors: true, origin: 'http://localhost:5176' },
  build: { target: 'chrome89' },
}));
