import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: specify a port number
  },
  build: {
    outDir: 'dist', // Output directory for build files
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: configure path aliases
    },
  },
});
