import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
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
  },
  preview: {
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
});
