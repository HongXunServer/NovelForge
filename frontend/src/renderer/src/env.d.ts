/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_WEB?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Web环境的全局变量声明
declare global {
  interface Window {
    IS_WEB: boolean
    electronAPI?: any
  }
  
  // Web环境下模拟的process对象
  var process: {
    env: {
      IS_WEB?: boolean
      NODE_ENV?: string
    }
    platform: string
  }
}

export {}