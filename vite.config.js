import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0', // 允许所有网络接口访问
    port: 5173,
    proxy: {
      '/api/webdav': {
        target: 'https://rebun.infini-cloud.net',
        changeOrigin: true,
        rewrite: (path) => {
          // 将/api/webdav转换为/dav/
          return path.replace(/^\/api\/webdav/, '/dav/')
        }
      },
    }
  },
})
