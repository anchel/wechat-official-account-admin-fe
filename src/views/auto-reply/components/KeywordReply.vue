<template>
  <div v-if="status.showEdit">
    <el-breadcrumb separator=">">
      <el-breadcrumb-item>
        <a href="javascript:void(0)" @click="status.showEdit = false">关键词回复</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>添加回复</el-breadcrumb-item>
    </el-breadcrumb>

    <div style="margin-top: 20px">
      <keyword-reply-edit :doc="currentDoc" @cancel="onCancel" @submit="onSuccess" />
    </div>
  </div>
  <div v-else>
    <el-card>
      <div class="header">
        <div>启用开关</div>
        <div>
          <el-switch
            :loading="status.loadingSwitch"
            v-model="formGlobal.enabled"
            :before-change="onBeforeChangeSwitch"
          />
        </div>
      </div>
    </el-card>

    <el-card>
      <div class="flex-between">
        <el-input
          v-model="formGlobal.search"
          placeholder="输入规则名称或关键词"
          class=""
          style="width: 400px"
          clearable
          @change="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
        <div>
          <el-button type="primary" @click="handleClickAdd">添加回复</el-button>
        </div>
      </div>

      <el-table
        :data="listData.list"
        v-loading="status.loading"
        stripe
        :table-layout="'auto'"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="rule_title" label="规则名称" />
        <el-table-column prop="keywords" label="关键词">
          <template #default="{ row }">
            <div class="keyword-list">
              <div class="keyword-item" v-for="item in row.keywords_def" :key="item.keyword">
                {{ item.keyword }}<span>({{ item.exact === true ? '全匹配' : '半匹配' }})</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="回复内容">
          <template #default="{ row }">
            <span>{{ makeReplyDesc(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="回复方式">
          <template #default="{ row }">
            <span>{{ makeReplyCount(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleClickView(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleClickEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleClickDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <keyword-reply-detail :doc="currentDoc" v-model:dialogVisible="status.dialogVisibleDetail" />
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ajax from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

import KeywordReplyDetail from '@/views/auto-reply/components/KeywordReplyDetail.vue'
import KeywordReplyEdit from '@/views/auto-reply/components/KeywordReplyEdit.vue'

const { xdo } = defineProps({
  xdo: Object, // { reply_type: '' }
})

const formGlobal = reactive({
  enabled: false,
  search: '',
})

const currentDoc = ref(null)

watch(
  () => currentDoc.value,
  () => {
    console.log('currentDoc changed')
  },
)

const listData = reactive({
  list: [],
  total: 0,
})

const status = reactive({
  showEdit: false,
  loading: false,
  loadingSwitch: false,
  dialogVisibleDetail: false,
})

onMounted(() => {
  getAppData()
  getList()
})

const getAppData = async () => {
  let response = await ajax.get('/api/appid/get_enabled')
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  if (xdo.reply_type === 'message') {
    formGlobal.enabled = data.data.enabled_auto_reply_message
  } else if (xdo.reply_type === 'subscribe') {
    formGlobal.enabled = data.data.enabled_auto_reply_subscribe
  } else if (xdo.reply_type === 'keyword') {
    formGlobal.enabled = data.data.enabled_auto_reply_keyword
  }
}

const getList = async () => {
  status.loading = true

  let response = await ajax.get('/api/autoreply/get', {
    params: {
      reply_type: xdo.reply_type,
      search: formGlobal.search,
    },
  })
  status.loading = false

  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  listData.list = data.data.list || []
}

const refreshPage = () => {
  getList()
}

const handleSearch = () => {
  console.log('search:', formGlobal.search)
  getList()
}

const handleClickAdd = () => {
  currentDoc.value = null
  status.showEdit = true
}

const handleClickView = (item) => {
  console.log('click view')
  currentDoc.value = item
  status.dialogVisibleDetail = true
}

const handleClickEdit = (item) => {
  console.log('click edit')
  currentDoc.value = item
  status.showEdit = true
}

const handleClickDelete = (item) => {
  console.log('click delete')
  // 弹出确认框
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

// 执行删除
const doDelete = async (item) => {
  let response = await ajax.get('/api/autoreply/delete', {
    params: {
      id: item.id,
    },
  })
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('删除成功')
  refreshPage()
}

// 设置启用开关
const onBeforeChangeSwitch = async (v) => {
  console.log('onBeforeChangeSwitch', v)
  status.loadingSwitch = true

  let postData = {
    reply_type: xdo.reply_type,
    enabled: !formGlobal.enabled,
  }

  let response = await ajax.post('/api/appid/set_enabled', postData)
  status.loadingSwitch = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return false
  }
  ElMessage.success('设置成功')
  return true
}

const onSuccess = () => {
  status.showEdit = false
  refreshPage()
}

const onCancel = () => {
  status.showEdit = false
}

const makeReplyDesc = (item) => {
  let contentArr = []
  if (item && item.reply_data && item.reply_data.msg_list) {
    let msg_list = item.reply_data.msg_list
    let textList = msg_list.filter((msg) => msg.msg_type === 'text')
    let imageList = msg_list.filter((msg) => msg.msg_type === 'image')
    let voiceList = msg_list.filter((msg) => msg.msg_type === 'voice')
    let videoList = msg_list.filter((msg) => msg.msg_type === 'video')
    let newsList = msg_list.filter((msg) => msg.msg_type === 'news')

    if (textList.length > 0) {
      contentArr.push(textList.length + ' 文本')
    }
    if (imageList.length > 0) {
      contentArr.push(imageList.length + ' 图片')
    }
    if (voiceList.length > 0) {
      contentArr.push(voiceList.length + ' 音频')
    }
    if (videoList.length > 0) {
      contentArr.push(videoList.length + ' 视频')
    }
    if (newsList.length > 0) {
      contentArr.push(newsList.length + ' 图文')
    }
  }
  return contentArr.join(' , ')
}

const makeReplyCount = (item) => {
  let text = '随机回复一条'
  if (item && item.reply_data && item.reply_data.reply_all === true) {
    text = '全部回复'
  }
  return text
}
</script>

<style lang="less" scoped>
.keyword-list {
  display: flex;

  .keyword-item {
    &:not(:first-child) {
      margin-left: 10px;
    }

    span {
      color: #999;
      margin-left: 2px;
    }
  }
}

.content {
  .el-card {
    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .header {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .flex-between {
    display: flex;
    align-items: center;
    gap: 20px;
  }
}
</style>
