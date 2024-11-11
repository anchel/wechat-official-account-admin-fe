<template>
  <div class="message">
    <el-card class="message-card">
      <div class="content">
        <div class="flex-column btn" v-if="editable">
          <component
            :is="selectorComponents[message.msg_type]"
            @message-add="onAdd"
            :xdo="{ media_cat: 'perm', media_type: message.msg_type, add_type: 'open' }"
            :content="message.content"
            :articles="message.articles"
          >
            <el-icon :size="20">
              <Edit />
            </el-icon>
          </component>

          <el-icon :size="20" @click="handleRemoveMessage">
            <Delete />
          </el-icon>
        </div>

        <component
          :is="displayComponents[message.msg_type]"
          :media_cat="message.media_cat || 'perm'"
          :media_type="message.msg_type"
          :media_id="message.media_id"
          :content="message.content"
          :articles="message.articles"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'

import { Delete, Edit } from '@element-plus/icons-vue'

import DisplayText from '@/components/common/materials/display-text.vue'
import DisplayImage from '@/components/common/materials/display-image.vue'
import DisplayVoice from '@/components/common/materials/display-voice.vue'
import DisplayVideo from '@/components/common/materials/display-video.vue'
import DisplayNews from '@/components/common/materials/display-news.vue'

import TextSelector from '@/components/reply-message/selectors/text-selector.vue'
import ImageSelector from '@/components/reply-message/selectors/image-selector.vue'
import VoiceSelector from '@/components/reply-message/selectors/voice-selector.vue'
import VideoSelector from '@/components/reply-message/selectors/video-selector.vue'
import NewsSelector from '@/components/reply-message/selectors/news-selector.vue'

const emit = defineEmits(['remove'])
const { editable } = defineProps({ editable: Boolean })
const message = defineModel('message', { type: Object, required: true })

const displayComponents = {
  text: DisplayText,
  image: DisplayImage,
  voice: DisplayVoice,
  video: DisplayVideo,
  news: DisplayNews,
}

const selectorComponents = {
  text: TextSelector,
  image: ImageSelector,
  voice: VoiceSelector,
  video: VideoSelector,
  news: NewsSelector,
}

const onAdd = (data) => {
  if (message.value.msg_type === 'text') {
    message.value.content = data.content
  } else if (message.value.msg_type === 'news') {
    message.value.articles = data.articles
  } else {
    message.value.media_id = data.media_id
  }
}

const handleRemoveMessage = () => {
  emit('remove')
}
</script>

<style lang="less" scoped>
.message {
  .message-card {
    border-left: 1px solid #00a65a;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 20px;

    .flex-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn {
      visibility: hidden;

      :deep(.el-icon) {
        cursor: pointer;
      }
    }

    &:hover {
      .btn {
        visibility: visible;
      }
    }
  }
}
</style>
