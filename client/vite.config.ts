import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Puerto en el que se ejecutará
    open: true, // Abre automáticamente el navegador
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // URL de tu backend
        changeOrigin: true
      }
    }
  }
});