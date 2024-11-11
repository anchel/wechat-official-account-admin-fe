<template>
  <div class="content">
    <div class="header">
      <el-button type="primary" @click="handleClickAdd">本地上传</el-button>
    </div>

    <div class="body" v-if="listData.list && listData.list.length > 0">
      <div class="material-list">
        <div class="list-item" v-for="item in listData.list" :key="item.media_id">
          <div class="media-content">
            <el-image
              v-if="listdef.media_type === 'image' || listdef.media_type === 'thumb'"
              :src="getMaterialUrl(listdef.media_type, item.media_id, listdef.media_cat)"
              :preview-src-list="makePreviewImageList(item)"
              fit="contain"
            />
            <audio controls style="width: 100%" v-if="listdef.media_type === 'voice'">
              <source :src="getMaterialUrl(listdef.media_type, item.media_id, listdef.media_cat)" type="audio/mpeg" />
            </audio>
            <video-player
              v-if="listdef.media_type === 'video'"
              :src="getMaterialUrl(listdef.media_type, item.media_id, listdef.media_cat)"
            />
            <div class="title">
              <el-text line-clamp="2" style="word-break: break-all; color: greenyellow">
                {{ listdef.media_cat === 'perm' ? item.name : formatDateTime('过期时间:', item.expires_at) }}
              </el-text>
            </div>
          </div>

          <div class="operations">
            <el-popconfirm title="确定删除吗?" @confirm="handleClickDelete(item)">
              <template #reference>
                <el-icon size="20">
                  <Delete></Delete>
                </el-icon>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
      <div class="footer">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="handlePageChange"
          :default-page-size="pagination.size"
          :total="listData.total"
        />
      </div>
    </div>

    <div class="empty" v-if="status.requested && listData.total === 0">
      <el-empty :image-size="200" />
    </div>
    <material-add-dialog
      v-if="dialogFormVisible"
      v-model:dialogFormVisible="dialogFormVisible"
      :xdo="listdef"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup>
import { formatDateTime, getMaterialUrl } from '@/utils/tools'
import { onMounted, reactive, ref } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/common/video-player.vue'
import MaterialAddDialog from '@/components/common/material-add-dialog.vue'

const { listdef } = defineProps({
  listdef: Object,
})

const status = reactive({
  loading: false,
  requested: false,
})

const listData = reactive({
  total: 0,
  list: [],
})
const pagination = reactive({
  page: 1,
  size: 12,
})

const dialogFormVisible = ref(false)

onMounted(() => {
  getList((pagination.page - 1) * pagination.size, pagination.size)
})

const handlePageChange = (page) => {
  console.log('handlePageChange', page)
  pagination.page = page
  getList((pagination.page - 1) * pagination.size, pagination.size)
}

const getList = async (offset, count) => {
  status.loading = true
  let response = await ajax.get('/api/material/list', {
    params: {
      media_cat: listdef.media_cat,
      media_type: listdef.media_type,
      offset: offset,
      count: count,
    },
  })
  status.loading = false

  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  listData.total = data.data.total
  listData.list = data.data.list
  status.requested = true
}

const handleClickAdd = () => {
  dialogFormVisible.value = true
}

// 删除素材
const handleClickDelete = async (item) => {
  let response = await ajax.post('/api/material/delete', {
    media_cat: listdef.media_cat,
    media_id: item.media_id,
  })
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  ElMessage.success('删除成功')
  await getList((pagination.page - 1) * pagination.size, pagination.size)
}

const handleUploadSuccess = () => {
  console.log('handleUploadSuccess')
  if (pagination.page === 1) {
    getList((pagination.page - 1) * pagination.size, pagination.size)
  }
}

const makePreviewImageList = (item) => {
  return [getMaterialUrl(item.media_type, item.media_id, listdef.media_cat)]
}
</script>

<style lang="less" scoped>
.material-list {
  display: flex;
  flex-wrap: wrap;
  //align-content: stretch;
  justify-content: flex-start;
  gap: 10px;

  .list-item {
    position: relative;
    width: calc(100% / 6.6);

    display: flex;
    flex-direction: column;

    .media-content {
      //flex: 1;
      position: relative;
      background-color: #999999;
      height: 130px;
      text-align: center;

      .el-image {
        height: 130px;
      }

      :deep(video) {
        height: 130px;
      }

      .title {
        position: absolute;
        bottom: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }
    }

    .operations {
      display: flex;
      padding: 4px 0;
      justify-content: flex-end;

      .el-icon {
        cursor: pointer;
      }
    }
  }
}

.content {
  .header {
    margin-bottom: 10px;
  }

  .footer {
    margin-top: 20px;
  }
}
</style>
