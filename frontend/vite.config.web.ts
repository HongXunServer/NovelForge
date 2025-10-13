import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 动态CSP插件
function dynamicCSPPlugin() {
  return {
    name: 'dynamic-csp',
    transformIndexHtml(html) {
      // 从环境变量获取后端地址
      const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      
      // 解析IP地址
      let connectSrc = "'self' http://127.0.0.1:8000 ws://127.0.0.1:8000"
      
      if (apiBaseUrl && apiBaseUrl !== 'auto') {
        try {
          const url = new URL(apiBaseUrl)
          const hostname = url.hostname
          const port = url.port || '8000'
          
          // 如果不是localhost，添加到CSP
          if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            connectSrc += ` http://${hostname}:${port} ws://${hostname}:${port}`
          }
        } catch (e) {
          console.warn('无法解析VITE_API_BASE_URL，使用默认CSP配置')
        }
      }
      
      // 生成动态的CSP meta标签
      const cspMeta = `  <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline';
               connect-src ${connectSrc};
               img-src 'self' data: blob: https:;"
    />`
      
      // 替换现有的CSP meta标签
      return html.replace(
        /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/>/g,
        cspMeta
      )
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dynamicCSPPlugin()
  ],
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: '../../dist/web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  define: {
    'process.platform': JSON.stringify('web'),
    'process.env.IS_WEB': JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})