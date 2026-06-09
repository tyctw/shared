import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/shared/',
  define: {
    // 避免 process is not defined 錯誤 (如果程式碼中有用到 process.env)
    'process.env': {} 
  }
});
