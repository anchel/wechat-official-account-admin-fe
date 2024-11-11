import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

import '@/permission'

import '@/assets/css/index.css'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'nprogress/nprogress.css'

import * as ElIcons from '@element-plus/icons-vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

for (const iconName in ElIcons) {
  app.component(`ElIcon${iconName}`, ElIcons[iconName])
}

app.mount('#app')
