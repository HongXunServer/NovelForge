// 局域网访问工具模块
export class LanAccess {
  private static instance: LanAccess
  private backendUrl: string = ''

  static getInstance(): LanAccess {
    if (!LanAccess.instance) {
      LanAccess.instance = new LanAccess()
    }
    return LanAccess.instance
  }

  // 自动检测后端地址
  async detectBackendUrl(): Promise<string> {
    // 如果已经配置了环境变量，直接使用
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL
    }

    // 尝试从当前页面URL推断
    const currentUrl = window.location.origin
    const currentHost = window.location.hostname

    // 如果当前页面不是localhost，尝试使用相同主机
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      const testUrl = `http://${currentHost}:8000`
      if (await this.testBackend(testUrl)) {
        return testUrl
      }
    }

    // 尝试常见的局域网地址模式
    const localIp = await this.getLocalIp()
    if (localIp) {
      const testUrl = `http://${localIp}:8000`
      if (await this.testBackend(testUrl)) {
        return testUrl
      }
    }

    // 默认回退到localhost
    return 'http://127.0.0.1:8000'
  }

  // 测试后端是否可访问
  private async testBackend(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        timeout: 3000
      } as RequestInit)
      return response.ok
    } catch {
      return false
    }
  }

  // 获取本地IP地址（简化版）
  private async getLocalIp(): Promise<string | null> {
    try {
      // 使用WebRTC获取本地IP
      const pc = new RTCPeerConnection({ iceServers: [] })
      pc.createDataChannel('')
      
      return new Promise((resolve) => {
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const ipMatch = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
            if (ipMatch && !ipMatch[1].startsWith('127.')) {
              pc.close()
              resolve(ipMatch[1])
            }
          } else {
            pc.close()
            resolve(null)
          }
        }
        
        pc.createOffer().then(offer => pc.setLocalDescription(offer))
        
        // 超时处理
        setTimeout(() => {
          pc.close()
          resolve(null)
        }, 2000)
      })
    } catch {
      return null
    }
  }

  // 获取后端URL
  async getBackendUrl(): Promise<string> {
    if (!this.backendUrl) {
      this.backendUrl = await this.detectBackendUrl()
      console.log('自动检测到的后端地址:', this.backendUrl)
    }
    return this.backendUrl
  }
}

// 创建全局实例
export const lanAccess = LanAccess.getInstance()