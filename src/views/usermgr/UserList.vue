<template>
  <div class="content">
    <div class="header">
      <el-button type="info" @click="refreshPage">刷新列表</el-button>
    </div>
    <div class="list">
      <el-table stripe table-layout="auto" :data="listData.list" v-loading="status.loading">
        <el-table-column prop="openid" label="openid" />
        <el-table-column prop="unionid" label="unionid" />
        <el-table-column prop="tagid_list" label="标签">
          <template #default="scope">
            <div style="display: flex; gap: 6px">
              <el-tag v-for="tag in scope.row.tagid_list" :key="tag">{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" width="120" />
        <el-table-column prop="subscribe_scene" label="关注来源" width="170" />
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleClickSetRemark(scope.$index)">
              设置备注
            </el-button>
            <el-button link type="primary" size="small" @click="handleClickSetTag(scope.$index)">设置标签</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer">
      <!--      <el-pagination-->
      <!--        background-->
      <!--        layout="prev, pager, next"-->
      <!--        :page-size="pagination.size"-->
      <!--        :total="listData.total"-->
      <!--        @current-change="handlePageChange"-->
      <!--      />-->
      <el-button type="primary" link @click="handleLoadMore" v-if="status.hasMore">加载更多</el-button>
    </div>

    <set-user-tag v-model:dialogVisible="status.dialogVisibleSetTag" :tag="selectedTag" @refresh="refreshPage" />
    <set-user-remark v-model:dialogVisible="status.dialogVisibleSetRemark" :tag="selectedTag" @refresh="refreshPage" />
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import SetUserTag from '@/views/usermgr/components/SetUserTag.vue'
import SetUserRemark from '@/views/usermgr/components/SetUserRemark.vue'

import { useGlobalStore } from '@/stores/global'

const { refreshPage } = useGlobalStore()

// const pagination = reactive({
//   page: 1,
//   size: 12,
// })

const listData = reactive({
  list: [],
  total: 0,
  next_openid: '',
  loadedCount: 0,
})

const status = reactive({
  loading: false,
  hasMore: true,
  dialogVisibleSetRemark: false,
  dialogVisibleSetTag: false,
})

const selectedTag = reactive({
  openid: '',
  remark: '',
  tagid_list: [],
})

onMounted(() => {
  getList()
})

const handleLoadMore = () => {
  console.log('handleLoadMore')
  getList()
}

const getList = async () => {
  status.loading = true
  let response
  try {
    response = await ajax.get('/api/wxuser/list', {
      params: {
        next_openid: listData.next_openid,
      },
    })
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
  if (!data.data.list || data.data.list.length === 0) {
    status.hasMore = false
    return
  }

  listData.list = data.data.list
  listData.total = data.data.total
  listData.next_openid = data.data.next_openid

  listData.loadedCount += data.data.list.length
  if (listData.loadedCount >= listData.total) {
    status.hasMore = false
  }
}

// const handlePageChange = (page) => {
//   console.log('handlePageChange', page)
//   pagination.page = page
//   getList()
// }

const handleClickSetRemark = (index) => {
  console.log('handleClickView')
  selectedTag.openid = listData.list[index].openid
  selectedTag.remark = listData.list[index].remark
  status.dialogVisibleSetRemark = true
}

const handleClickSetTag = (index) => {
  console.log('handleClickSetTag')
  selectedTag.openid = listData.list[index].openid
  selectedTag.tagid_list = listData.list[index].tagid_list
  status.dialogVisibleSetTag = true
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
    text-align: center;
  }
}
</style>
