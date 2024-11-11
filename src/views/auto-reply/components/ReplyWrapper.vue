<template>
  <div class="content">
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
      <div>
        <el-tabs v-model="formGlobal.media_type" type="border-card">
          <el-tab-pane label="文字" name="text" :lazy="true">
            <material-selector :xdo="xdoText" v-model="formText" style="max-width: 500px" />
          </el-tab-pane>
          <el-tab-pane label="图片" name="image" :lazy="true">
            <material-selector :xdo="xdoImage" v-model="formImage" />
          </el-tab-pane>
          <el-tab-pane label="音频" name="voice" :lazy="true">
            <material-selector :xdo="xdoVoice" v-model="formVoice" />
          </el-tab-pane>
          <el-tab-pane label="视频" name="video" :lazy="true">
            <material-selector :xdo="xdoVideo" v-model="formVideo" />
          </el-tab-pane>
          <el-tab-pane label="图文(外链)" name="news" :lazy="true">
            <material-selector :xdo="xdoNews" v-model="formNews" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="operations">
        <el-button type="primary" :loading="status.loading" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import MaterialSelector from '@/components/common/material-selector.vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'

const { xdo } = defineProps({
  xdo: Object, // { reply_type: '' }
})

const formGlobal = reactive({
  enabled: false,
  doc: null,
  media_type: 'text',
})

// 表单数据
const formText = reactive({
  msg_type: 'text',
  content: '',
})

const formImage = reactive({
  msg_type: 'image',
  media_id: '',
})

const formVoice = reactive({
  msg_type: 'voice',
  media_id: '',
})

const formVideo = reactive({
  msg_type: 'video',
  media_id: '',
})

const formNews = reactive({
  msg_type: 'news',
  articles: [],
})

//  属性传递数据
const xdoText = reactive({
  media_cat: 'perm',
  media_type: 'text',
})

const xdoImage = reactive({
  media_cat: 'perm',
  media_type: 'image',
  add_type: 'open',
})

const xdoVoice = reactive({
  media_cat: 'perm',
  media_type: 'voice',
  add_type: 'open',
})

const xdoVideo = reactive({
  media_cat: 'perm',
  media_type: 'video',
  add_type: 'open',
})

const xdoNews = reactive({
  media_cat: 'perm',
  media_type: 'news',
  add_type: 'open',
})

const status = reactive({
  loading: false,
  loadingSwitch: false,
})

onMounted(() => {
  getAppData()
  getData()
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

const getData = async () => {
  status.loading = true
  let response = await ajax.get('/api/autoreply/get', {
    params: {
      reply_type: xdo.reply_type,
    },
  })
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
  }

  let list = data.data.list || []
  if (list.length <= 0) {
    console.log('list.length <= 0')
    return
  }
  formGlobal.doc = list[0]
  let item = list[0]

  if (item.reply_data && item.reply_data.msg_list && item.reply_data.msg_list.length > 0) {
    // console.log('item.reply_data.msg_list[0]', item.reply_data.msg_list[0])
    assignData(item.reply_data.msg_list[0])
  }
}

const assignData = (msg) => {
  formGlobal.media_type = msg.msg_type

  if (msg.msg_type === 'text') {
    formText.content = msg.content
  } else if (msg.msg_type === 'image') {
    formImage.media_id = msg.media_id
  } else if (msg.msg_type === 'voice') {
    formVoice.media_id = msg.media_id
  } else if (msg.msg_type === 'video') {
    formVideo.media_id = msg.media_id
  } else if (msg.msg_type === 'news') {
    formNews.articles = msg.articles
  }
}

// 保存
const handleSave = async () => {
  console.log('xdo.reply_type', xdo.reply_type)
  if (!checkForm()) {
    ElMessage.error('请填写完整')
    return
  }
  status.loading = true
  let message = getMessage()
  let postData = {
    reply_type: xdo.reply_type,
    reply_data: {
      reply_all: false,
      msg_list: [message],
    },
  }
  if (formGlobal.doc) {
    postData.id = formGlobal.doc.id
  }
  let response = await ajax.post('/api/autoreply/save', postData)
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('保存成功')
}

const checkForm = () => {
  if (formGlobal.media_type === 'text') {
    if (!formText.content) {
      return false
    }
  } else if (formGlobal.media_type === 'image') {
    if (!formImage.media_id) {
      return false
    }
  } else if (formGlobal.media_type === 'voice') {
    if (!formVoice.media_id) {
      return false
    }
  } else if (formGlobal.media_type === 'video') {
    if (!formVideo.media_id) {
      return false
    }
  } else if (formGlobal.media_type === 'news') {
    if (formNews.articles.length <= 0) {
      return false
    }
  }
  return true
}

const getMessage = () => {
  let message = {
    msg_type: formGlobal.media_type,
  }
  if (formGlobal.media_type === 'text') {
    message.content = formText.content
  } else if (formGlobal.media_type === 'image') {
    message.media_id = formImage.media_id
  } else if (formGlobal.media_type === 'voice') {
    message.media_id = formVoice.media_id
  } else if (formGlobal.media_type === 'video') {
    message.media_id = formVideo.media_id
  } else if (formGlobal.media_type === 'news') {
    message.articles = formNews.articles
  }
  return message
}

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
</script>

<style lang="less" scoped>
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
    //justify-content: space-between;
  }

  .preview {
    .delete {
      margin-top: 10px;
      cursor: pointer;
    }
  }

  .container {
    display: flex;
    justify-content: space-between;
    gap: 6px;

    .area {
      border: 1px dashed #d9d9d9;
      height: 200px;
      //width: 200px;
      width: calc(100% / 2);
      display: flex;
      justify-content: center;
      align-items: center;

      .icon-fit {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
  }

  .operations {
    margin-top: 20px;
  }
}
</style>
