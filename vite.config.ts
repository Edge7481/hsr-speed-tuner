import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/hsr-speed-tuner/',
  build: {
    outDir: 'dist',
  },
  plugins: [react()]
});