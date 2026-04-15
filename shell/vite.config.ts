import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'shell',
      // מה ה-Shell מחשיף ל-MFEs
      exposes: {
        './store': './src/store/appContext.ts',
      },
      // מגדירים את ה-remotes גם כאן כדי ש-Rollup יידע שהם חיצוניים
      remotes: {
        mfe_tasks: 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        zustand: { singleton: true, eager: true },
      },
    }),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
