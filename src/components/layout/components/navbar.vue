<template>
  <div
    v-if="layoutSetting.mode === 'vertical' || layoutSetting.menubar.isPhone"
    class="flex items-center px-4 flex-wrap h-12 leading-12"
  >
    <el-icon class="text-2xl cursor-pointer h-12 leading-12" @click="changeCollapsed">
      <el-icon-expand v-if="layoutSetting.menubar.status" />
      <el-icon-fold v-else />
    </el-icon>
    <!-- 面包屑导航 -->
    <div class="px-4">
      <el-breadcrumb separator="/">
        <transition-group name="breadcrumb">
          <el-breadcrumb-item key="/" :to="{ path: '/' }">主页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="v in data.breadcrumbList" :key="v.path" :to="v.path"
            >{{ v.title }}
          </el-breadcrumb-item>
        </transition-group>
      </el-breadcrumb>
    </div>
  </div>

  <div class="flex items-center flex-row-reverse px-4 min-width-32">
    <!-- 用户下拉 -->
    <el-dropdown>
      <div class="el-dropdown-link flex flex-center px-2">
        <span class="ml-2">{{ userName }}</span>
        <el-icon>
          <el-icon-arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <router-link :to="{ name: 'SelectAppid' }" :underline="false">切换公众号</router-link>
          </el-dropdown-item>

          <el-dropdown-item divided>
            <router-link :to="{ name: 'ChangePassword' }" :underline="false">修改密码</router-link>
          </el-dropdown-item>

          <el-dropdown-item divided v-if="isAdmin">
            <router-link :to="{ name: 'SystemRoot' }" :underline="false">系统管理</router-link>
          </el-dropdown-item>

          <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div>
      <span style="font-size: 12px">当前公众号：</span>
      <el-tag type="success">{{ appidStore.appidInfo.name }}</el-tag>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, watch } from 'vue'
import { useLayoutStore } from '@/stores/global'
import { useRoute } from 'vue-router'

import { useAppIdInfoStore, useUserInfoStore, logout } from '@/stores/global'

// 面包屑导航
const breadcrumb = (route) => {
  const fn = () => {
    const breadcrumbList = []
    const notShowBreadcrumbList = ['Dashboard', 'RedirectPage'] // 不显示面包屑的导航
    if (route.matched[0] && notShowBreadcrumbList.includes(route.matched[0].name)) return breadcrumbList
    route.matched.forEach((v) => {
      const obj = {
        title: v.meta.title,
        path: v.path,
      }
      breadcrumbList.push(obj)
    })
    return breadcrumbList
  }
  let data = reactive({
    breadcrumbList: fn(),
  })
  watch(
    () => route.path,
    () => (data.breadcrumbList = fn()),
  )
  return { data }
}

export default {
  name: 'LayoutNavbar',
  components: {},
  setup() {
    const { layoutSetting, changeCollapsed } = useLayoutStore()

    const userInfoStore = useUserInfoStore()
    const appidStore = useAppIdInfoStore()

    onMounted(() => {
      appidStore.fetchAppIdInfo()
    })

    const userName = computed(() => {
      return userInfoStore.userInfo && userInfoStore.userInfo.username
    })

    const isAdmin = computed(() => {
      return userInfoStore.userInfo && userInfoStore.userInfo.user_type === 'admin'
    })

    const route = useRoute()
    return {
      userName: userName,
      appidStore: appidStore,
      changeCollapsed,
      ...breadcrumb(route),
      layoutSetting,
      isAdmin,
      logout,
    }
  },
}
</script>

<style lang="postcss" scoped>
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.5s;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
