import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import { allowRouter } from '@/router'
import routes from '@/stores/data/routes.json'
import { generatorDynamicRouter } from '@/router/asyncRouter.js'

const MenubarStatus = {
  PC_EXPAND: 0, // 电脑展开
  PC_FOLD: 1, // 电脑合并
  PHONE_EXPAND: 2, // 手机展开
  PHONE_FOLD: 3, // 手机合并
}

export const useLayoutStore = defineStore('layout', () => {
  const layoutSetting = reactive({
    menubar: {
      status: document.body.offsetWidth < 768 ? MenubarStatus.PHONE_FOLD : MenubarStatus.PC_EXPAND,
      menuList: [],
      isPhone: document.body.offsetWidth < 768,
    },
    theme: 0,
    color: {
      primary: '#00a65a',
    },
    mode: 'vertical',
  })

  function changeCollapsed() {
    layoutSetting.menubar.status = layoutSetting.menubar.isPhone
      ? layoutSetting.menubar.status === 3
        ? 2
        : 3
      : layoutSetting.menubar.status === 1
        ? 0
        : 1
  }

  function changeDeviceWidth() {
    layoutSetting.menubar.isPhone = document.body.offsetWidth < 768
    layoutSetting.menubar.status = layoutSetting.menubar.isPhone ? 3 : 0
  }

  function setRoutes(data) {
    layoutSetting.menubar.menuList = data
  }

  function concatAllowRoutes() {
    allowRouter.reverse().forEach((v) => layoutSetting.menubar.menuList.unshift(v))
  }

  function GenerateRoutes() {
    const { Data } = { Data: routes }
    generatorDynamicRouter(Data)
  }

  return { layoutSetting, changeCollapsed, changeDeviceWidth, setRoutes, concatAllowRoutes, GenerateRoutes }
})

// 刷新页面等全局状态
export const useGlobalStore = defineStore('global', () => {
  const refreshTrigger = ref(0)

  function refreshPage() {
    console.log('refreshing page', refreshTrigger.value)
    refreshTrigger.value++
  }

  return { refreshTrigger, refreshPage }
})

// 当前登录的用户信息
export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref({})
  let loaded = false

  // 异步获取用户信息的方法
  async function fetchUserInfo() {
    if (!loaded) {
      // 检查是否已经请求过数据
      try {
        const response = await ajax.get('/api/system/user/userinfo') // 请求服务器数据
        if (response.data.code !== 0) {
          console.error('Failed to fetch user info:', response.data.message)
          return
        }
        userInfo.value = response.data.data // 更新 userInfo 对象
        loaded = true
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }
    }
    return userInfo.value // 返回数据
  }

  return {
    userInfo,
    fetchUserInfo,
  }
})

// 当前选中的应用信息
export const useAppIdInfoStore = defineStore('appInfo', () => {
  const appidInfo = ref({})
  let loaded = false

  // 异步获取用户信息的方法
  async function fetchAppIdInfo() {
    if (!loaded) {
      // 检查是否已经请求过数据
      try {
        const response = await ajax.get('/api/appid/session_info') // 请求服务器数据
        if (response.data.code !== 0) {
          console.error('Failed to fetch user info:', response.data.message)
          return
        }
        appidInfo.value = response.data.data.appidInfo
        loaded = true
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }
    }
    return appidInfo.value // 返回数据
  }

  return {
    appidInfo,
    fetchAppIdInfo,
  }
})

export async function logout() {
  let response = await ajax.get('/api/system/user/logout')
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  location.href = '/login' //必须要刷新页面，清除缓存和组件状态
}
