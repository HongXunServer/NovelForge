/**
 * 平台检测工具
 * 用于区分Web环境和Electron环境
 */

// 检测是否为Web环境
export const isWeb = typeof window !== 'undefined' && !((window as any).electronAPI)

// 检测是否为Electron环境
export const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI

// 检测当前平台
export const getPlatform = (): 'web' | 'electron' => {
  if (isWeb) return 'web'
  if (isElectron) return 'electron'
  return 'web' // 默认返回web
}

// Web环境下的Electron API模拟
export const createElectronMock = () => {
  return {
    // 模拟Electron API方法
    minimizeWindow: () => console.log('[Web Mock] Minimize window'),
    maximizeWindow: () => console.log('[Web Mock] Maximize window'),
    closeWindow: () => console.log('[Web Mock] Close window'),
    openExternal: (url: string) => {
      console.log('[Web Mock] Open external:', url)
      window.open(url, '_blank')
    },
    showSaveDialog: async () => {
      console.log('[Web Mock] Show save dialog')
      // 创建隐藏的文件输入元素
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      document.body.appendChild(input)
      
      return new Promise((resolve) => {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.files && target.files[0]) {
            resolve(target.files[0].name)
          } else {
            resolve(null)
          }
          document.body.removeChild(input)
        })
        input.click()
      })
    },
    showOpenDialog: async () => {
      console.log('[Web Mock] Show open dialog')
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      document.body.appendChild(input)
      
      return new Promise((resolve) => {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.files && target.files[0]) {
            resolve([target.files[0].name])
          } else {
            resolve([])
          }
          document.body.removeChild(input)
        })
        input.click()
      })
    }
  }
}

// 获取Electron API（Web环境下返回模拟对象）
export const getElectronAPI = () => {
  if (isElectron) {
    return (window as any).electronAPI
  }
  return createElectronMock()
}