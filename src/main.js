import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import { createPinia } from 'pinia'

//导入持久化插件
import { createPersistedState } from 'pinia-persistedstate-plugin'
import locale from 'element-plus/dist/locale/zh-cn.js'


import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
const persist = createPersistedState()

app.use(ElementPlus, { locale })
pinia.use(persist)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')