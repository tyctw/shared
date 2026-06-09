import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: './', // 設定相對路徑，確保在 GitHub Pages 子目錄能正確運作
  define: {
    // 避免 process is not defined 錯誤 (如果程式碼中有用到 process.env)
    'process.env': {} 
  }
});
