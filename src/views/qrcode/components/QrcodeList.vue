<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshPage">刷新列表</el-button>
      <el-button type="primary" @click="handleAdd">新增二维码</el-button>
    </div>
    <div class="list">
      <div class="filter">
        <el-input
          clearable
          v-model="search.keyword"
          placeholder="请输入关键字"
          @change="handleKeywordChange"
          style="width: 400px"
        >
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>
      <el-table stripe table-layout="auto" v-loading="status.loading" :data="listData.list">
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="title" label="场景值">
          <template #default="{ row }">
            <span>{{ row.scene_str || row.scene_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ticket" label="二维码">
          <template #default="{ row }">
            <el-image
              :src="qrcodeImg"
              :preview-src-list="makePreviewList(row)"
              alt=""
              style="width: 30px; height: 30px"
            />
            <el-icon size="25" style="margin-left: 6px; cursor: pointer" @click="handleDownloadQrcode(row)">
              <download />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="url"></el-table-column>
        <el-table-column prop="expire_seconds" label="过期时间">
          <template #default="{ row }">
            <span>{{ formatExpireSeconds(row.expire_seconds) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="handlePageChange"
          :default-page-size="search.size"
          :total="listData.total"
        />
      </div>
    </div>

    <qrcode-add-dialog :listdef="listdef" v-model:dialog-visible="status.dialogVisibleAdd" @success="refreshList" />
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import QrcodeAddDialog from '@/views/qrcode/components/QrcodeAddDialog.vue'
import qrcodeImg from '@/assets/img/qrcode.png'
import dayjs from 'dayjs'
import { Search, Download } from '@element-plus/icons-vue'

const { listdef } = defineProps({
  listdef: {
    type: Object, // qrcode_type
    required: true,
  },
})

const status = reactive({
  loading: false,
  dialogVisibleAdd: false,
})

const search = reactive({
  page: 1,
  size: 6,
  keyword: '',
})

const listData = reactive({
  total: 0,
  list: [],
})

onMounted(() => {
  getList()
})

const getList = async () => {
  let offset = (search.page - 1) * search.size
  let count = search.size

  status.loading = true
  let response = await ajax.get('/api/qrcode/list', {
    params: {
      offset,
      count,
      keyword: search.keyword,
      qrcode_type: listdef.qrcode_type,
    },
  })
  status.loading = false

  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  listData.total = data.data.total
  listData.list = data.data.list || []
}

const handleKeywordChange = () => {
  search.page = 1
  getList()
}

const handlePageChange = (page) => {
  search.page = page
  getList()
}

const refreshPage = () => {
  search.page = 1
  getList()
}

const refreshList = () => {
  getList()
}

const handleAdd = () => {
  console.log('handleAdd')
  status.dialogVisibleAdd = true
}

const makePreviewList = (item) => {
  return [`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(item.ticket)}`]
}

const handleDownloadQrcode = (item) => {
  let url = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(item.ticket)}`
  window.open(url)
}

const formatExpireSeconds = (expire_seconds) => {
  if (listdef.qrcode_type === 'limit') {
    return '永久有效'
  }
  let d = dayjs()
  d = d.add(expire_seconds, 'second')
  return d.format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style lang="less" scoped>
.content {
  padding: 20px;

  .list {
    margin-top: 20px;

    .filter {
      margin-bottom: 10px;
    }

    .footer {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style>
