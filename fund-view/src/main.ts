import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import mUI from 'air-element-components'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.use(mUI)
app.mount('#app')
