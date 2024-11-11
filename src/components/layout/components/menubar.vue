<template>
  <el-menu
    :mode="layoutSetting.menubar.isPhone ? 'vertical' : layoutSetting.mode"
    :default-active="activeMenu"
    :collapse="layoutSetting.menubar.status === 1 || layoutSetting.menubar.status === 3"
    :class="{
      'el-menu-vertical-demo': true,
      'w-64': layoutSetting.menubar.status === 0 || layoutSetting.menubar.status === 2,
      'w-0': layoutSetting.menubar.status === 3,
      'w-16': layoutSetting.menubar.status === 1,
      'w-full': layoutSetting.mode === 'horizontal' && !layoutSetting.menubar.isPhone,
    }"
    :collapse-transition="false"
    :unique-opened="true"
    @select="onOpenChange"
  >
    <menubar-item v-for="v in filterMenubarData" :key="v.path" :index="v.path" :menu-list="v" />
  </el-menu>
</template>

<script>
import { computed } from 'vue'
import MenubarItem from '@/components/layout/components/menubarItem.vue'
import { useRoute, useRouter } from 'vue-router'

import { useLayoutStore } from '@/stores/global'

// 过滤隐藏的菜单，并提取单条的子菜单
const filterMenubar = (menuList) => {
  const f = (menuList) => {
    let arr = []
    menuList
      .filter((v) => !v.meta.hidden)
      .forEach((v) => {
        let child = v.children && v.children.filter((v) => !v.meta.hidden)
        let currentItem = v
        if (!v.meta.alwaysShow && child && child.length === 1) {
          ;[currentItem] = child
        }
        arr.push(currentItem)
        if (currentItem.children && currentItem.children.length > 0) {
          arr[arr.length - 1].children = f(currentItem.children)
        }
      })
    return arr
  }
  return f(menuList)
}

export default {
  name: 'LayoutMenubar',
  components: {
    MenubarItem,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { layoutSetting, setRoutes, changeCollapsed } = useLayoutStore()

    const filterMenubarData = filterMenubar(layoutSetting.menubar.menuList)
    setRoutes(filterMenubarData)

    const activeMenu = computed(() => {
      if (route.meta.activeMenu) return route.meta.activeMenu
      return route.path
    })
    const onOpenChange = (d) => {
      router.push({ path: d })
      layoutSetting.menubar.status === 2 && changeCollapsed()
    }
    return {
      filterMenubarData,
      activeMenu,
      onOpenChange,
      layoutSetting,
    }
  },
}
</script>
