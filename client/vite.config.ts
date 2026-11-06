import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,        // mismo puerto que CRA: no hay que tocar las Redirect URLs de Supabase/Google
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001',   // reemplaza el "proxy" de CRA
    },
  },
});
