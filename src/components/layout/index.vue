<template>
  <div class="layout flex h-screen">
    <div
      class="layout-sidebar-mask fixed w-screen h-screen bg-black bg-opacity-25 z-20"
      :class="{ hidden: layoutSetting.menubar.status !== 2 }"
      @click="changeCollapsed"
    />
    <div
      v-if="layoutSetting.mode === 'vertical' || layoutSetting.menubar.isPhone"
      class="layout-sidebar flex flex-col h-screen transition-width duration-200 shadow"
      :class="{
        'w-48': layoutSetting.menubar.status === 0 || layoutSetting.menubar.status === 2,
        'w-0': layoutSetting.menubar.status === 3,
        'w-16': layoutSetting.menubar.status === 1,
        'absolute z-30': layoutSetting.menubar.status === 2 || layoutSetting.menubar.status === 3,
      }"
    >
      <div class="layout-sidebar-logo flex h-12 relative flex-center shadow-lg">
        <!--                <img class='w-8 h-8' :src='icon' alt="">-->
        <span v-if="layoutSetting.menubar.status === 0 || layoutSetting.menubar.status === 2" class="pl-2"
          >微信公众号管理系统</span
        >
      </div>
      <div class="layout-sidebar-menubar flex flex-1 overflow-hidden">
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <layout-menubar />
        </el-scrollbar>
      </div>
    </div>
    <div class="layout-main flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
      <div class="layout-main-navbar flex justify-between items-center h-12 shadow-sm overflow-hidden relative z-10">
        <layout-navbar />
      </div>
      <div class="layout-main-content flex-1 overflow-hidden">
        <layout-content />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import LayoutContent from '@/components/layout/components/content.vue'
import LayoutMenubar from '@/components/layout/components/menubar.vue'
import LayoutNavbar from '@/components/layout/components/navbar.vue'

import { throttle } from '@/utils/tools'
import { useLayoutStore } from '@/stores/global'

export default {
  name: 'Layout',
  components: {
    LayoutContent,
    LayoutMenubar,
    LayoutNavbar,
  },
  setup() {
    const { changeDeviceWidth, changeCollapsed, layoutSetting } = useLayoutStore()

    onMounted(async () => {
      changeDeviceWidth()
      const throttleFn = throttle(300)
      let throttleF = async function () {
        await throttleFn()
        changeDeviceWidth()
      }
      window.addEventListener('resize', throttleF, true)
    })

    return {
      layoutSetting,
      changeCollapsed,
      // icon
    }
  },
}
</script>

<style lang="postcss" scoped>
:deep(.layout-sidebar-sidesetting .el-drawer__header) {
  margin-bottom: 0;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  height: 48px;
}

:deep(.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}
</style>
