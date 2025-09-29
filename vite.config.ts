import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://workflow-backend-2-1ki9.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
