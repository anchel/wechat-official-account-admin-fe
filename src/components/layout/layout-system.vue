<template>
  <div class="h-screen content">
    <div class="sidebar">
      <el-menu :default-active="defaultActive" mode="vertical" @select="onSelect">
        <el-menu-item :index="item.path" v-for="item in menuList" :key="item.index">
          <component :is="UseElIcon(item.icon || 'el-icon-location')" />
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <div class="logout">
        <el-tag>当前用户：{{ userInfoStore.userInfo.username }}</el-tag>
        <el-link type="info" @click="handleLogout">退出登录</el-link>
      </div>
    </div>
    <div class="body h-screen">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { UseElIcon } from '@/components/SvnIcon/elIcon'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserInfoStore, logout } from '@/stores/global'

const router = useRouter()
const route = useRoute()
const userInfoStore = useUserInfoStore()

const menuList = [
  { icon: 'el-icon-house', title: '首页', path: '/' },
  { icon: 'el-icon-user', title: '用户管理', path: '/system/user/list' },
  { icon: 'el-icon-grid', title: '公众号管理', path: '/system/appid/list' },
]

const defaultActive = ref('/system/user/list')
onMounted(() => {
  defaultActive.value = route.path
})

const onSelect = (p) => {
  console.log('onSelect', p)
  router.push({ path: p })
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {
    console.error(e)
    ElMessage.error('退出登录失败')
  }
}
</script>

<style lang="postcss" scoped>
.content {
  display: flex;

  .sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .logout {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  .body {
    flex: 1;
    display: flex;
    overflow: auto;
  }
}
</style>
