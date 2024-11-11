<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshList">刷新列表</el-button>
      <el-button type="primary" @click="handleAdd" v-if="isAdmin">添加公众号</el-button>
    </div>

    <div class="appid-list">
      <el-table stripe :data="listData.list" v-loading="status.loading" style="width: 100%">
        <el-table-column prop="name" label="公众号名称"></el-table-column>
        <el-table-column prop="app_type" label="类型">
          <template #default="{ row }">
            {{ row.app_type === 'fwh' ? '服务号' : '订阅号' }}
          </template>
        </el-table-column>
        <el-table-column prop="appid" label="Appid"></el-table-column>
        <!--        <el-table-column prop="appsecret" label="Appsecret"></el-table-column>-->
        <!--        <el-table-column prop="token" label="Token"></el-table-column>-->
        <!--        <el-table-column prop="encoding_aes_key" label="EncodingAESKey"></el-table-column>-->
        <el-table-column prop="name" label="缩略图">
          <template #default="{ row }">
            <el-image fit="contain" :src="row.thumbnail || defaultImgS" alt="" style="width: 50px; height: 50px" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="140" v-if="isAdmin">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleClickDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="bottom"></div>

    <AddAppidDialog
      v-if="status.dialogVisibleAdd"
      v-model:dialogVisible="status.dialogVisibleAdd"
      :appid-info="currentAppidItem"
      @add-success="onAddSuccess"
      @update-success="onUpdateSuccess"
    />

    <AppidInfo
      v-if="status.dialogVisibleView"
      v-model:dialogVisible="status.dialogVisibleView"
      :appid-info="currentAppidItem"
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
import AddAppidDialog from '@/views/appid/components/AddAppidDialog.vue'
import AppidInfo from '@/views/appid/components/AppidInfo.vue'
import { useUserInfoStore } from '@/stores/global'
import defaultImgS from '@/assets/img/default-s.png'

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
  dialogVisibleView: false,
})

const listData = reactive({
  list: [],
})

onMounted(() => {
  getList()

  if (route.query.open) {
    status.dialogVisibleAdd = true
  }
})

const refreshList = () => {
  getList()
}

const getList = async () => {
  console.log('getAppidList')
  status.loading = true
  let response = await ajax.get('/api/system/appid/list')
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  listData.list = data.data.list
}

const currentAppidItem = ref({})

const handleAdd = () => {
  console.log('handleAdd')
  currentAppidItem.value = {}
  status.dialogVisibleAdd = true
}

const handleView = (item) => {
  console.log('handleView', item.appid)
  currentAppidItem.value = item
  status.dialogVisibleView = true
}

const handleEdit = (item) => {
  console.log('handleEdit', item.appid)
  currentAppidItem.value = item
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
  let response = await ajax.post('/api/system/appid/delete', { id: item.id })
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
  overflow: auto;
  padding: 20px;
  background-color: v-bind('themeStyle.mainBg');
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 24px;
    text-align: center;
  }

  .bottom {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
