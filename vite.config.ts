import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 1. Zid hadi bach GitHub Pages i-lqa l-JS o CSS dyalk
    base: './', // هذا يجعل المسارات نسبية وتعمل في أي مكان
    
    plugins: [react(), tailwindcss()],
    
    // Removed process.env define - use server proxy instead
    
    resolve: {
      alias: {
        // 2. Sl7t l-alias bach i-pointing nichen l-folder src
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    
    // 3. Zid hadi bach t-thna mn ay mouchkil f l-build
    build: {
      outDir: 'dist',
    }
  };
});
