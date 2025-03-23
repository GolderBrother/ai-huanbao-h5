import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import './styles/index.scss'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'virtual:svg-icons-register'

// 创建 pinia 实例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')