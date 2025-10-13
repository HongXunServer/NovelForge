import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import { useAppStore } from './stores/useAppStore'
import { usePerCardAISettingsStore } from './stores/usePerCardAISettingsStore'
import { isWeb, getElectronAPI } from './utils/platform'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)

// 设置Web环境标识
if (typeof window !== 'undefined') {
  window.IS_WEB = isWeb
}

// 初始化主题（必须在挂载前）
const appStore = useAppStore()
appStore.initTheme()

// --- Load initial data ---
const perCardStore = usePerCardAISettingsStore()
perCardStore.loadFromLocal()

app.mount('#app')
