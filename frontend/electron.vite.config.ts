import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

// 动态生成CSP头部
function generateCSPHeader() {
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  
  let connectSrc = "'self' http://127.0.0.1:8000"
  
  if (apiBaseUrl && apiBaseUrl !== 'auto') {
    try {
      const url = new URL(apiBaseUrl)
      const hostname = url.hostname
      const port = url.port || '8000'
      
      // 如果不是localhost，添加到CSP
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        connectSrc += ` http://${hostname}:${port}`
      }
    } catch (e) {
      console.warn('无法解析VITE_API_BASE_URL，使用默认CSP配置')
    }
  }
  
  return `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src ${connectSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data:`;
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      // 动态CSP插件
      {
        name: 'dynamic-csp-renderer',
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            const cspHeader = generateCSPHeader();
            res.setHeader('Content-Security-Policy', cspHeader);
            next();
          });
        }
      }
    ]
  }
})
