import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      // Updated to match your actual filename
      entry: './ttc-card.js', 
      name: 'TTCCard',
      fileName: 'ttc-card',
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: [], 
    },
  },
});