<template>
  <div class="content">
    <menu-and-reply-message-wrapper :menuobj="menuobj" @delete-menu="handelDeleteMenu" />
  </div>
</template>

<script setup>
import MenuAndReplyMessageWrapper from '@/views/menu/components/MenuAndReplyMessageWrapper.vue'
import { reactive } from 'vue'

import { useGlobalStore } from '@/stores/global'

const { refreshPage } = useGlobalStore()

const menuobj = reactive({
  menuType: 'normal',
  menu: {
    id: '',
  },
})

const handelDeleteMenu = () => {
  console.log('handelDeleteMenu')
  refreshPage()
}
</script>

<style lang="less" scoped>
.content {
  min-width: 1000px;
  padding: 20px;
}
</style>
