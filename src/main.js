import Aegis from 'aegis-web-sdk'
const aegis = new Aegis({
  id: '4eog2C5DvxZjRW5pvn', // 上报 id
  uin: '', // 用户唯一 ID（可选）
  reportApiSpeed: true, // 接口测速
  reportAssetSpeed: true, // 静态资源测速
  spa: true, // spa 应用页面跳转的时候开启 pv 计算
  hostUrl: 'https://rumt-zh.com',
})

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
