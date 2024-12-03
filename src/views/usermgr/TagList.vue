<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshPage">刷新列表</el-button>
      <el-button type="primary" @click="handleClickAdd">新增</el-button>
    </div>
    <div class="list">
      <el-table :data="listData.list" stripe v-loading="status.loading">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="count" label="人数" />
        <el-table-column fixed="right" label="操作" min-width="120">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleClickView(scope.$index)"> 用户列表</el-button>
            <el-button link type="primary" size="small" @click="handleClickEdit(scope.$index)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleClickDelete(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer"></div>

    <TagEdit v-model:dialogVisible="status.dialogVisible" :tag="selectedTag" @refresh="refreshPage" />

    <TagUsers v-if="status.dialogVisibleUsers" v-model:dialogVisible="status.dialogVisibleUsers" :tag="selectedTag" />
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import ajax from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import TagEdit from '@/views/usermgr/components/TagEdit.vue'
import TagUsers from '@/views/usermgr/components/TagUsers.vue'

import { useGlobalStore } from '@/stores/global'

const { refreshPage } = useGlobalStore()

// const pagination = reactive({
//   page: 1,
//   size: 12,
// })

const listData = reactive({
  list: [],
  total: 0,
})

const status = reactive({
  loading: false,
  dialogVisible: false,
  dialogVisibleUsers: false,
})

const selectedTag = reactive({
  id: 0,
  name: '',
})

onMounted(() => {
  getListData()
})

const getListData = async () => {
  status.loading = true
  let response
  try {
    response = await ajax.get('/api/wxuser/tag/list')
  } catch (e) {
    console.error(e)
    ElMessage.error('获取标签列表失败')
    status.loading = false
    return
  }
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  listData.list = data.data.list
  listData.total = data.data.list.length
}

const handleClickView = (index) => {
  console.log('handleClickView')
  selectedTag.id = listData.list[index].id
  selectedTag.name = listData.list[index].name
  status.dialogVisibleUsers = true
}

const handleClickEdit = (index) => {
  console.log('handleClickEdit')
  selectedTag.id = listData.list[index].id
  selectedTag.name = listData.list[index].name
  status.dialogVisible = true
}

const handleClickDelete = (index) => {
  console.log('handleClickDelete')
  ElMessageBox.confirm('确定删除吗?', '提示', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      deleteTag(listData.list[index].id)
    })
    .catch(() => {})
}

const deleteTag = async (id) => {
  let response
  try {
    response = await ajax.post('/api/wxuser/tag/delete', { id })
  } catch (e) {
    console.error(e)
    ElMessage.error('删除标签失败')
    return
  }
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('删除成功')
  refreshPage() // 刷新页面
}

const handleClickAdd = () => {
  console.log('handleClickAdd')
  selectedTag.id = 0
  selectedTag.name = ''
  status.dialogVisible = true
}
</script>

<style lang="less" scoped>
.content {
  padding: 20px;

  .header {
    margin-bottom: 20px;
  }

  .footer {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
