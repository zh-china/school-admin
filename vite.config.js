import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:9000',
      '/system': 'http://127.0.0.1:9000',
      '/biz': 'http://127.0.0.1:9000'
    }
  }
})
