<template>
  <div class="content-reply-message">
    <div v-if="selectedMenu">
      <div v-if="selectedMenu.type === 'view'">
        <el-input v-model="selectedMenu.url" />
      </div>
      <div v-if="selectedMenu.type === 'miniprogram'">
        <el-input v-model="selectedMenu.appid" />
        <el-input v-model="selectedMenu.pagepath" />
      </div>
    </div>

    <div v-if="autoreply.data && selectedMenu.type === 'click'">
      <div class="list" v-if="autoreply.data.msg_list.length > 0">
        <div class="message-wrapper" :key="index" v-for="(message, index) in autoreply.data.msg_list">
          <Message :message="message" @remove="handleRemoveMessage(index)" :editable="true" />
        </div>
      </div>
    </div>

    <div class="add-message-select" v-if="selectedMenu.type === 'click'">
      <div class="select-list">
        <text-selector @message-add="handleAddMessageText" :xdo="xdoText"></text-selector>
        <image-selector @message-add="handleAddMessageImage" :xdo="xdoImage"></image-selector>
        <voice-selector @message-add="handleAddMessageVoice" :xdo="xdoVoice"></voice-selector>
        <video-selector @message-add="handleAddMessageVideo" :xdo="xdoVideo"></video-selector>
        <news-selector @message-add="handleAddMessageNews" :xdo="xdoNews"></news-selector>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'

import Message from './message.vue'

import TextSelector from '@/components/reply-message/selectors/text-selector.vue'
import ImageSelector from '@/components/reply-message/selectors/image-selector.vue'
import VoiceSelector from '@/components/reply-message/selectors/voice-selector.vue'
import VideoSelector from '@/components/reply-message/selectors/video-selector.vue'
import NewsSelector from '@/components/reply-message/selectors/news-selector.vue'

const selectedMenu = defineModel('selected', { type: Object }) // {type: "click | view", key: "", name: "", url: ""}
const autoreply = defineModel('autoreply', { type: Object }) // {reply_all: true, msg_list: []}

const { limit } = defineProps({
  limit: {
    type: Number,
    default: 1,
  },
})

const xdoText = reactive({
  media_cat: 'perm',
  media_type: 'text',
  add_type: 'open',
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

onMounted(() => {
  console.log('limit', limit)
})

const handleRemoveMessage = (index) => {
  console.log('handleRemoveMessage', index)
  autoreply.value.data.msg_list.splice(index, 1)
}

const handleAddMessageText = (newMessage) => {
  // console.log('handelAddMessageText', autoreply.value.data)
  if (!autoreply.value.data) {
    autoreply.value.data = { reply_all: true, msg_list: [] }
  }
  autoreply.value.data.msg_list.push({
    msg_type: 'text',
    content: newMessage.content,
  })
}

const handleAddMessageImage = (newMessage) => {
  console.log('handleAddMessageImage', JSON.stringify(newMessage, null, 4))
  if (!autoreply.value.data) {
    autoreply.value.data = { reply_all: true, msg_list: [] }
  }
  autoreply.value.data.msg_list.push({
    msg_type: 'image',
    media_id: newMessage.media_id,
  })
}

const handleAddMessageVoice = (newMessage) => {
  // console.log('handleAddMessageVoice', autoreply.value.data)
  if (!autoreply.value.data) {
    autoreply.value.data = { reply_all: true, msg_list: [] }
  }
  autoreply.value.data.msg_list.push({
    msg_type: 'voice',
    media_id: newMessage.media_id,
  })
}

const handleAddMessageVideo = (newMessage) => {
  // console.log('handleAddMessageVideo', autoreply.value.data)
  if (!autoreply.value.data) {
    autoreply.value.data = { reply_all: true, msg_list: [] }
  }
  autoreply.value.data.msg_list.push({
    msg_type: 'video',
    media_id: newMessage.media_id,
  })
}

const handleAddMessageNews = (newMessage) => {
  // console.log('handleAddMessageNews', autoreply.value.data)
  if (!autoreply.value.data) {
    autoreply.value.data = { reply_all: true, msg_list: [] }
  }
  autoreply.value.data.msg_list.push({
    msg_type: 'news',
    articles: newMessage.articles,
  })
}
</script>

<style lang="less" scoped>
.content-reply-message {
  flex: 1;

  .message-wrapper {
    :deep(.el-image) {
      max-height: 200px;
    }

    :deep(video) {
      max-height: 200px;
    }

    &:not(:first-child) {
      margin-top: 10px;
    }
  }

  .add-message-select {
    margin-top: 10px;

    .select-list {
      display: flex;
      gap: 0.8rem;
    }
  }
}
</style>
