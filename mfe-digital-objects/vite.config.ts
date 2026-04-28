import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'mfe_digital_objects',
      exposes: {
        './Preview': './src/Preview.tsx',
        './Full': './src/Full.tsx',
      },
      remotes: {
        shell: 'http://localhost:3000/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-dom': { singleton: true, eager: false },
        zustand: { singleton: true, eager: false },
      },
    }),
  ],
  server: {
    port: 3004,
    cors: true,
  },
  preview: {
    port: 3004,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
});
