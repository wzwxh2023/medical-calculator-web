import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/main.css'

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')

// 注册 Service Worker（PWA）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service Worker registered successfully')
    }).catch((err) => {
      console.error('Service Worker registration failed:', err)
    })
  })
}
