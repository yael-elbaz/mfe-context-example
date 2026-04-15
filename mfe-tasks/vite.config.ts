import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'mfe_tasks',
      // מה ה-MFE הזה מחשיף
      exposes: {
        './App': './src/App.tsx',
      },
      // מה הוא צורך מה-Shell
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
    port: 3001,
    cors: true,
  },
  preview: {
    port: 3001,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
});
