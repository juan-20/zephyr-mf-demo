import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { withZephyr } from 'vite-plugin-zephyr';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: { './Card': './src/Card.tsx' },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    withZephyr(),
  ],
  server: { cors: true, origin: 'http://localhost:5174' },
  build: { target: 'chrome89' },
});
