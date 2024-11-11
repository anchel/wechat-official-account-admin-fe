<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshList">刷新列表</el-button>
      <el-button type="primary" @click="handleAdd" v-if="isAdmin">添加用户</el-button>
    </div>

    <div class="appid-list">
      <el-table stripe :data="listData.list" v-loading="status.loading">
        <el-table-column prop="username" label="用户名">
          <template #default="{ row }">
            <span>{{ row.username }}</span>
            <el-tag type="primary" size="small" style="margin-left: 6px" v-if="row.username === 'admin'"
              >超级管理员
            </el-tag>
            <el-tag
              type="info"
              size="small"
              style="margin-left: 6px"
              v-if="row.username === userInfoStore.userInfo.username"
              >(自己)
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column prop="user_type" label="用户类型">
          <template #default="{ row }">
            {{ row.user_type === 'admin' ? '管理员' : '普通用户' }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="140" v-if="isAdmin">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleClickDelete(row)"
              v-if="row.username !== 'admin' && row.username !== userInfoStore.userInfo.username"
              >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="bottom"></div>

    <AddSystemUserDialog
      v-if="status.dialogVisibleAdd"
      v-model:dialogVisible="status.dialogVisibleAdd"
      :user-info="currentUserItem"
      @add-success="onAddSuccess"
      @update-success="onUpdateSuccess"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLayoutStore } from '@/stores/global'
import theme from '@/config/theme'
import ajax from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import AddSystemUserDialog from '@/views/system/components/AddSystemUserDialog.vue'
import { useUserInfoStore } from '@/stores/global.js'

const { layoutSetting } = useLayoutStore()
const userInfoStore = useUserInfoStore()

const router = useRouter()
const route = useRoute()

// 重新获取主题色
const f = () => {
  let themeArray = theme()
  return layoutSetting.theme >= themeArray.length ? themeArray[0] : themeArray[layoutSetting.theme]
}

let themeStyle = ref(f())
watch(
  () => layoutSetting.theme,
  () => (themeStyle.value = f()),
)
watch(
  () => layoutSetting.color.primary,
  () => (themeStyle.value = f()),
)

const isAdmin = computed(() => {
  return userInfoStore.userInfo.user_type === 'admin'
})

const status = reactive({
  loading: false,
  dialogVisibleAdd: false,
})

const listData = reactive({
  list: [],
})

onMounted(() => {
  getList()
})

const refreshList = () => {
  getList()
}

const getList = async () => {
  status.loading = true
  let response = await ajax.get('/api/system/user/list')
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  listData.list = data.data.list
}

const currentUserItem = ref(null)

const handleAdd = () => {
  console.log('handleAdd')
  currentUserItem.value = null
  status.dialogVisibleAdd = true
}

const handleEdit = (item) => {
  console.log('handleEdit', item.appid)
  listData.list.forEach((i) => {
    i.selected = false
  })
  item.selected = true
  currentUserItem.value = item
  status.dialogVisibleAdd = true
}

const handleClickDelete = async (item) => {
  console.log('handleClickDelete', item.appid)
  // 弹出确认删除框
  ElMessageBox.confirm('确定删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      doDelete(item)
    })
    .catch(() => {})
}

const doDelete = async (item) => {
  let response = await ajax.post('/api/system/user/delete', { id: item.id })
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('删除成功')
  refreshList()
}

const onAddSuccess = () => {
  status.dialogVisibleAdd = false
  // refreshList()
  if (route.query.open) {
    router.back()
  } else {
    refreshList()
  }
}

const onUpdateSuccess = () => {
  status.dialogVisibleAdd = false
  refreshList()
}
</script>

<style lang="postcss" scoped>
.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: v-bind('themeStyle.mainBg');
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
