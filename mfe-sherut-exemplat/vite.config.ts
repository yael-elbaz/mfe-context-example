import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_sherut_exemplat',
      exposes: {
        './App': './src/App.tsx',
      },
      // נדרש עבור shell/mfeUsage — מנגנון דירוג השימוש ב-MFE
      remotes: {
        shell: 'http://localhost:3000/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-dom': { singleton: true, eager: false },
      },
    }),
  ],
  server: {
    port: 3005,
    cors: true,
  },
  preview: {
    port: 3005,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
});
