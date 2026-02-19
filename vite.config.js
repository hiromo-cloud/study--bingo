import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercelデプロイ時にビルドエラーを防ぐための設定（必要に応じて）
  build: {
    outDir: 'dist',
  }
})
