<template>
  <el-scrollbar>
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="[]">
          <refresh-loading v-if="refreshing"></refresh-loading>
          <component v-else :is="Component" :key="key" class="page relative" />
        </keep-alive>
      </transition>
    </router-view>
    <el-backtop target=".layout-main-content>.el-scrollbar>.el-scrollbar__wrap" :bottom="15" :right="15">
      <div>
        <el-icon>
          <el-icon-caret-top />
        </el-icon>
      </div>
    </el-backtop>
  </el-scrollbar>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useGlobalStore } from '@/stores/global'
import RefreshLoading from '@/components/layout/components/refresh-loading.vue'

export default {
  name: 'LayoutContent',
  components: { RefreshLoading },
  setup() {
    const route = useRoute()
    const globalStore = useGlobalStore()

    const key = computed(() => route.path)

    const refreshing = ref(false)
    watch(
      () => globalStore.refreshTrigger,
      () => {
        refreshing.value = true
        setTimeout(() => {
          refreshing.value = false
        }, 50)
      },
    )

    return {
      key,
      refreshing,
    }
  },
}
</script>

<style lang="postcss" scoped></style>
