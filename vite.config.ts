import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // حل مشكلة "الصفحة البيضاء" في GitHub و Vercel
    base: './', 

    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        // تعريف الرمز @ ليشير لمجلد src لسهولة الـ Import
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // تحسين معالجة الملفات الكبيرة
      chunkSizeWarningLimit: 2000,
    },

    server: {
      port: 5173,
      strictPort: true,
    }
  };
});
