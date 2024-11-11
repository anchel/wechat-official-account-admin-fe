<template>
  <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="80%">
    <div class="material-list">
      <div
        class="list-item"
        :class="{ selected: !!item.selected }"
        v-for="item in listData.list"
        :key="item.media_id"
        @click="handleToggleListItem(item)"
      >
        <div class="media-content">
          <el-image
            v-if="xdo.media_type === 'image'"
            :src="getMaterialUrl(xdo.media_type, item.media_id, xdo.media_cat)"
            :preview-src-list="makePreviewImageList(item)"
            fit="contain"
          />
          <audio
            v-else-if="xdo.media_type === 'voice'"
            :src="getMaterialUrl(xdo.media_type, item.media_id, xdo.media_cat)"
            controls
          ></audio>
          <video-player
            v-else-if="xdo.media_type === 'video'"
            :src="getMaterialUrl(xdo.media_type, item.media_id, xdo.media_cat)"
          />
          <el-tag v-else>未知类型</el-tag>

          <div class="title">
            <el-text line-clamp="2" style="word-break: break-all; color: greenyellow">
              {{ item.name }}
            </el-text>
          </div>
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
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import { getMaterialUrl } from '@/utils/tools'
import VideoPlayer from '@/components/common/video-player.vue'

const emit = defineEmits(['confirm'])
const dialogFormVisible = defineModel('dialogFormVisible', { type: Boolean })
const { xdo } = defineProps({
  xdo: Object, // { media_type, media_cat }
})

const listData = reactive({
  total: 0,
  list: [],
})
const pagination = reactive({
  page: 1,
  size: 12,
})

const form = reactive({
  media_id: '',
})

const dialogTitle = computed(() => {
  let title = ''
  if (xdo.media_type === 'image') {
    title = '添加回复的图片'
  } else if (xdo.media_type === 'voice') {
    title = '添加回复的语音'
  } else if (xdo.media_type === 'video') {
    title = '添加回复的视频'
  } else {
    title = '添加回复的素材'
  }
  return title
})

onMounted(() => {
  getList((pagination.page - 1) * pagination.size, pagination.size)
})

const handlePageChange = (page) => {
  console.log('handlePageChange', page)
  pagination.page = page
  getList((pagination.page - 1) * pagination.size, pagination.size)
}

const handleToggleListItem = (item) => {
  listData.list
    .filter((i) => i !== item)
    .forEach((i) => {
      i.selected = false
    })
  item.selected = !item.selected
}

const handleConfirm = () => {
  let selectedItem = listData.list.find((i) => i.selected)
  if (!selectedItem) {
    ElMessage.error('请选择一个素材')
    return
  }
  form.media_id = selectedItem.media_id
  emit('confirm', form)
  dialogFormVisible.value = false
}

const getList = async (offset, count) => {
  let response = await ajax.get('/api/material/list', {
    params: {
      media_cat: xdo.media_cat,
      media_type: xdo.media_type,
      offset: offset,
      count: count,
    },
  })
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  listData.total = data.data.total
  listData.list = data.data.list
}

// eslint-disable-next-line no-unused-vars
const makePreviewImageList = (item) => {
  // console.log('makePreviewImageList', item)
  return []
}
</script>

<style lang="less" scoped>
.material-list {
  display: flex;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: flex-start;
  gap: 10px;

  .list-item {
    position: relative;
    cursor: pointer;
    width: calc(100% / 6.6);

    display: flex;
    flex-direction: column;

    border: 1px solid #ebeef5;
    padding: 10px;

    .media-content {
      //flex: 1;
      position: relative;
      background-color: #72767b;
      height: 130px;

      .el-image {
        height: 130px;
      }

      :deep(video) {
        height: 130px;
      }

      :deep(audio) {
        width: 100%;
      }

      .title {
        position: absolute;
        bottom: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }
    }

    &.selected:after {
      content: ''; /* 伪元素需要设置内容 */
      position: absolute; /* 绝对定位 */
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      //background-color: rgba(0, 0, 0, 0.2); /* 半透明黑色 */
      border: 4px solid #00a65a;
    }
  }
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
