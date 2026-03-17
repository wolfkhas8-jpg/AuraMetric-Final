import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 1. استخدام المسارات النسبية لضمان عمل الملفات في أي بيئة (GitHub/Vercel)
    base: './', 

    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        // 2. تسهيل استيراد الملفات من مجلد src باستخدام الرمز @
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      // تعطيل الـ HMR فقط إذا دعت الضرورة، الوضع الطبيعي هو true
      hmr: true,
      port: 5173,
    },

    build: {
      outDir: 'dist',
      // تحسين أداء الملفات النهائية
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
    },
  };
});
