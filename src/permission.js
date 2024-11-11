import router from '@/router'
import { configure, start, done } from 'nprogress'

import { useLayoutStore } from '@/stores/global'
import { useUserInfoStore } from '@/stores/global.js'

configure({ showSpinner: false })

const loginRoutePath = '/login'

router.beforeEach(async (to, from) => {
  start()
  const { layoutSetting, GenerateRoutes, concatAllowRoutes } = useLayoutStore()

  // 修改页面title
  const reg = new RegExp(/^(.+)(\s\|\s.+)$/)
  const appTitle = import.meta.env.VITE_APP_TITLE
  document.title = !to.meta.title
    ? appTitle
    : appTitle.match(reg)
      ? appTitle.replace(reg, `${to.meta.title}$2`)
      : `${to.meta.title} | ${appTitle}`

  // 判断是否还没添加过路由
  if (layoutSetting.menubar.menuList.length === 0) {
    await GenerateRoutes()

    for (let i = 0; i < layoutSetting.menubar.menuList.length; i++) {
      router.addRoute(layoutSetting.menubar.menuList[i])
    }
    concatAllowRoutes()
    return to.fullPath
  }
})

router.afterEach(async (to) => {
  const { fetchUserInfo } = useUserInfoStore()
  if (to.fullPath !== loginRoutePath) {
    await fetchUserInfo()
  }
  done()
})
