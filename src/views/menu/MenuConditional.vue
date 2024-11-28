<template>
  <div class="content">
    <div class="header">
      <el-button type="primary" @click="handleAdd">新增个性化菜单</el-button>
    </div>
    <el-tabs v-model="currentTab" type="">
      <el-tab-pane
        v-for="(item, index) in list"
        :key="item.id"
        :label="'个性化菜单' + (index + 1) + (item.id === 'new' ? ' (未保存)' : '')"
        :name="item.id"
        :lazy="true"
      >
        <menu-and-reply-message-wrapper
          :menuobj="{ menuType: 'conditional', menu: item }"
          @update-menu-id="handleUpdateID(item, $event)"
          @delete-menu="handleDeleteMenu"
        />
      </el-tab-pane>
    </el-tabs>

    <div class="empty" v-if="list.length === 0">
      <el-empty :image-size="200" />
    </div>
  </div>
</template>

<script setup>
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import MenuAndReplyMessageWrapper from '@/views/menu/components/MenuAndReplyMessageWrapper.vue'
import { onMounted, ref } from 'vue'

import { useGlobalStore } from '@/stores/global'

const { refreshPage } = useGlobalStore()

const currentTab = ref('')
const list = ref([])

const handleAdd = () => {
  console.log('handleAdd')
  let findItem = list.value.find((item) => item.id === 'new')
  if (findItem) {
    ElMessage.error('请先保存当前个性化菜单')
    currentTab.value = findItem.id
    return
  }

  console.log('handleAdd push')
  list.value.push({
    title: '新个性化菜单',
    id: 'new',
  })
  currentTab.value = 'new'
}

const handleUpdateID = (item, id) => {
  console.log('handleUpdateID', id)
  item.id = id
  currentTab.value = id
}

const handleDeleteMenu = (id = 'new') => {
  console.log('handleDeleteMenu', id)
  let index = list.value.findIndex((i) => i.id === id)
  list.value.splice(index, 1)

  if (list.value.length > 0) {
    let nextIndex = index - 1
    if (nextIndex < 0) {
      nextIndex = 0
    }
    currentTab.value = list.value[nextIndex].id
  } else {
    currentTab.value = ''
  }

  refreshPage()
}

onMounted(() => {
  getList()
})

const getList = async () => {
  let response = await ajax.get('/api/menu/get-conditional-list')
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  // console.log('data.data.list', data.data.list)
  for (let item of data.data.list) {
    list.value.push(item)
  }

  if (list.value.length > 0) {
    currentTab.value = list.value[0].id
  }
  // console.log('currentTab.value', currentTab.value)
}
</script>

<style lang="less" scoped>
.content {
  padding: 20px;

  .header {
    margin-bottom: 10px;
  }
}
</style>
