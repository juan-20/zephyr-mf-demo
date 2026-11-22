import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { withZephyr } from 'vite-plugin-zephyr';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        // In Zephyr builds this entry is resolved to the deployed remote.
        auth: {
          type: 'module',
          name: 'auth',
          entry: 'http://localhost:5174/remoteEntry.js',
        },
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        zustand: { singleton: true },
        '@repo/store': { singleton: true },
      },
    }),
    withZephyr(),
  ],
  build: { target: 'chrome89' },
});
