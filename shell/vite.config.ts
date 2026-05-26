import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'string-replace',
      transform(code) {
        return code.replace(/dev-repo/g, 'env/repo');
      },
    },
    federation({
      name: 'shell',
      // מה ה-Shell מחשיף ל-MFEs
      exposes: {
        './store': './src/store/appContext.ts',
        './employeeStore': './src/store/employeeStore.ts',
        './personStore': './src/store/personStore.ts',
      },
      // מגדירים את ה-remotes גם כאן כדי ש-Rollup יידע שהם חיצוניים
      remotes: {
        mfe_tasks: 'http://localhost:3001/assets/remoteEntry.js',
        mfe_search_employee: 'http://localhost:3002/assets/remoteEntry.js',
        mfe_employee_portfolio: 'http://localhost:3003/assets/remoteEntry.js',
        mfe_digital_objects: 'http://localhost:3004/assets/remoteEntry.js',
        mfe_sherutim: 'http://localhost:3006/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        zustand: { singleton: true, eager: true },
        'react-router-dom': { singleton: true, eager: true },
      } as any,
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
  define: {
    __FONT_BASE_URL__: JSON.stringify(process.env.VITE_FONT_BASE_URL ?? './assets'),
  },
});
