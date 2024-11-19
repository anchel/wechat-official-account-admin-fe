<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshPage">刷新列表</el-button>
    </div>
    <div class="list">
      <div class="filter">
        <el-input
          clearable
          v-model="search.keyword"
          placeholder="请输入关键字"
          @change="handleKeywordChange"
          style="width: 400px; margin-bottom: 10px"
        >
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>

      <el-table stripe table-layout="auto" :data="listData.list" v-loading="status.loading">
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="status" label="返回码" />
        <el-table-column prop="latency" label="耗时" />
        <el-table-column prop="ip" label="IP" />
        <el-table-column prop="method" label="Method" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="query" label="参数" />

        <el-table-column prop="user-agent" label="user-agent" width="150" show-overflow-tooltip />
      </el-table>
    </div>
    <div class="footer">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pagination.size"
        :total="listData.total"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'

import { useGlobalStore } from '@/stores/global'
import { Search } from '@element-plus/icons-vue'

const { refreshPage } = useGlobalStore()

const search = reactive({
  keyword: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
})

const listData = reactive({
  list: [],
  total: 0,
})

const status = reactive({
  loading: false,

  dialogVisibleSetRemark: false,
  dialogVisibleSetTag: false,
})

onMounted(() => {
  getList()
})

const handleKeywordChange = () => {
  listData.total = 0
  listData.list = []
  pagination.page = 1
  getList()
}

const onPageChange = (page) => {
  console.log('onPageChange', page)
  pagination.page = page
  getList()
}

const getList = async () => {
  status.loading = true
  let response
  try {
    let offset = (pagination.page - 1) * pagination.size
    let count = pagination.size

    response = await ajax.get('/api/request-log/list', {
      params: {
        offset,
        count,
        keyword: search.keyword,
      },
    })
  } catch (e) {
    console.error(e)
    ElMessage.error('获取数据失败')
    status.loading = false
    return
  }
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  if (!data.data.list || data.data.list.length === 0) {
    listData.list = []
    return
  }

  listData.list = data.data.list
  listData.total = data.data.total
}
</script>

<style lang="less" scoped>
.content {
  .header {
    margin-bottom: 20px;
  }

  .footer {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
