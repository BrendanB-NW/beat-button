import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/main/typescript'),
      '@/components': resolve(__dirname, './src/main/typescript/components'),
      '@/services': resolve(__dirname, './src/main/typescript/services'),
      '@/types': resolve(__dirname, './src/main/typescript/types'),
      '@/hooks': resolve(__dirname, './src/main/typescript/hooks'),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['tone'],
  },
})