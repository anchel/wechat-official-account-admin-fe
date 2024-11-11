<template>
  <el-dialog v-model="dialogVisible" title="标签详情">
    <el-table :data="listData.list" stripe v-loading="status.loading">
      <el-table-column prop="openid" label="openid" />
    </el-table>
    <div style="margin-top: 20px">
      <el-button type="primary" link @click="handleLoadMore" v-if="status.hasMore">加载更多</el-button>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="handleSave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'

const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const { tag } = defineProps({
  tag: Object,
})

const listData = reactive({
  list: [],
  total: 0,
  next_openid: '',
})

const status = reactive({
  loading: false,
  hasMore: true,
})

const resetData = () => {
  listData.list = []
  listData.total = 0
  listData.next_openid = ''
}

onMounted(() => {
  getList()
})

watch(
  () => tag,
  (newVal) => {
    console.log('watch tag', newVal)
    resetData()
    getList()
  },
  { deep: true },
)

const handleLoadMore = () => {
  console.log('handleLoadMore')
  getList()
}

// 获取标签的用户列表
const getList = async () => {
  console.log('getList')
  if (!tag.id) {
    return
  }
  status.loading = true
  try {
    const response = await ajax.get('/api/wxuser/tag/users', {
      params: {
        tagid: tag.id,
        next_openid: listData.next_openid,
      },
    })
    status.loading = false

    let data = response.data
    if (data.code !== 0) {
      ElMessage.error(data.message)
    } else {
      if (data.data.count === 0 || !data.data.list) {
        status.hasMore = false
        return
      }
      listData.list = data.data.list.map((item) => {
        return {
          openid: item,
        }
      })
      listData.total = data.data.total
      listData.next_openid = data.data.next_openid
    }
  } catch (e) {
    status.loading = false
    console.error(e)
    ElMessage.error('获取标签用户列表失败')
  }
}

const handleSave = async () => {
  console.log('handleSave')
  dialogVisible.value = false
}
</script>

<style lang="less" scoped></style>
