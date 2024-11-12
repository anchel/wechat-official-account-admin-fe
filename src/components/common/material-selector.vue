<template>
  <div class="content" v-if="xdo.media_type === 'text'">
    <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 12 }" v-model="modelValue.content" />
  </div>
  <div class="content" v-else>
    <div class="preview" v-if="modelValue.media_id || (modelValue.articles && modelValue.articles.length)">
      <component
        :is="displayComponents[xdo.media_type]"
        :media_cat="xdo.media_cat"
        :media_type="xdo.media_type"
        :media_id="modelValue.media_id"
        :articles="modelValue.articles"
        :class="{ 'max-height-250': xdo.media_type !== 'news' }"
      />

      <div class="flex-row" style="margin-top: 20px">
        <component
          :is="selectorComponents[xdo.media_type]"
          @message-add="onAdd"
          :xdo="{ media_cat: 'perm', media_type: xdo.media_type, add_type: 'open' }"
          :media_id="modelValue.media_id"
          :articles="modelValue.articles"
        >
          <el-icon :size="20">
            <Edit />
          </el-icon>
        </component>

        <el-icon :size="20" @click="handleClear">
          <Delete />
        </el-icon>
      </div>
    </div>
    <div class="container" v-else>
      <div class="area">
        <component
          :is="selectorComponents[xdo.media_type]"
          @message-add="onAdd"
          :xdo="xdo"
          :media_id="modelValue.media_id"
          :articles="modelValue.articles"
        >
          <div class="icon-fit">
            <p>
              <el-icon size="40">
                <Plus />
              </el-icon>
            </p>
            <p v-if="xdo.media_type !== 'news'">从素材库中选择</p>
          </div>
        </component>
      </div>
      <div class="area" v-if="xdo.media_type !== 'news'">
        <material-uploader :xdo="xdo" @success="onAdd">
          <div class="icon-fit">
            <p>
              <el-icon size="40">
                <Plus />
              </el-icon>
            </p>
            <p>本地上传</p>
          </div>
        </material-uploader>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import MaterialUploader from '@/components/common/material-uploader.vue'
import ImageSelector from '@/components/reply-message/selectors/image-selector.vue'
import VoiceSelector from '@/components/reply-message/selectors/voice-selector.vue'
import VideoSelector from '@/components/reply-message/selectors/video-selector.vue'
import NewsSelector from '@/components/reply-message/selectors/news-selector.vue'

import DisplayImage from '@/components/common/materials/display-image.vue'
import DisplayVoice from '@/components/common/materials/display-voice.vue'
import DisplayVideo from '@/components/common/materials/display-video.vue'
import DisplayNews from '@/components/common/materials/display-news.vue'

import { onMounted } from 'vue'

const selectorComponents = {
  image: ImageSelector,
  voice: VoiceSelector,
  video: VideoSelector,
  news: NewsSelector,
}

const displayComponents = {
  image: DisplayImage,
  voice: DisplayVoice,
  video: DisplayVideo,
  news: DisplayNews,
}

const { xdo } = defineProps({
  xdo: {
    type: Object, // { media_cat: '', media_type: '', add_type: '' }
    required: true,
  },
})
const modelValue = defineModel({
  type: Object,
  required: true,
})

onMounted(() => {
  console.log('xdo', xdo.media_type)
})

const onAdd = (params) => {
  console.log('onAdd', xdo.media_type, JSON.stringify(params, null, 4))

  if (xdo.media_type === 'news') {
    modelValue.value.articles = params.articles
  } else if (xdo.media_type === 'text') {
    modelValue.value.content = params.content
  } else {
    modelValue.value.media_id = params.media_id
  }
}

const handleClear = () => {
  if (xdo.media_type === 'news') {
    modelValue.value.articles = []
  } else if (xdo.media_type === 'text') {
    modelValue.value.content = ''
  } else {
    modelValue.value.media_id = ''
  }
}
</script>

<style lang="less" scoped>
.content {
  .flex-row {
    display: flex;
    align-items: center;
    //justify-content: space-between;
    gap: 16px;

    :deep(.el-icon) {
      cursor: pointer;
    }
  }

  .preview {
    .max-height-250 {
      max-height: 300px;
      overflow: auto;
    }

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
}
</style>
