<template>
  <div>
    <el-form :model="form" label-width="90" label-position="left">
      <el-form-item label="规则名称">
        <el-input v-model="form.rule_title" />
      </el-form-item>

      <el-form-item label="关键词">
        <div class="keyword-list">
          <div class="keyword-item" v-for="(item, i) in form.keywords_def" :key="i">
            <el-input v-model="item.keyword" style="max-width: 600px" placeholder="">
              <template #prepend>
                <el-select v-model="item.exact" placeholder="" style="width: 115px">
                  <el-option label="半匹配" :value="false" />
                  <el-option label="全匹配" :value="true" />
                </el-select>
              </template>
            </el-input>
            <el-icon @click="handleRemoveKeyword(i)">
              <Delete />
            </el-icon>
          </div>
        </div>
        <div class="btn-add" :class="{ 'show-margin-left': form.keywords_def && form.keywords_def.length }">
          <el-button type="primary" @click="handleAddKeyword">添加关键词</el-button>
        </div>
      </el-form-item>

      <el-form-item label="回复内容">
        <div style="flex: 1">
          <div class="flex-list">
            <component
              v-for="selector in selectorList"
              :key="selector.type"
              :is="selector.component"
              @message-add="onAddMessage(selector.type, $event)"
              :xdo="{ media_cat: 'perm', media_type: selector.type, add_type: 'open' }"
            >
            </component>
          </div>
          <div class="message-list">
            <div class="message-wrapper" :key="index" v-for="(message, index) in form.reply_data.msg_list">
              <Message :message="message" @remove="handleRemoveMessage(index)" :editable="true" />
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="回复方式">
        <el-radio-group v-model="form.reply_data.reply_all">
          <el-radio :value="false">随机回复一条</el-radio>
          <el-radio :value="true">回复全部</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="status.loading" @click="onSubmit">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import Message from '@/components/reply-message/message.vue'

import TextSelector from '@/components/reply-message/selectors/text-selector.vue'
import ImageSelector from '@/components/reply-message/selectors/image-selector.vue'
import VoiceSelector from '@/components/reply-message/selectors/voice-selector.vue'
import VideoSelector from '@/components/reply-message/selectors/video-selector.vue'
import NewsSelector from '@/components/reply-message/selectors/news-selector.vue'

import { ElMessage } from 'element-plus'
import ajax from '@/utils/request'
import { Delete } from '@element-plus/icons-vue'

const { doc } = defineProps({
  doc: {
    type: Object,
  },
})

const status = reactive({
  loading: false,
})

watch(
  () => doc,
  () => {
    console.log('doc changed')
    assignDoc()
  },
  { deep: true },
)

const form = reactive({
  id: '',
  reply_type: 'keyword',
  rule_title: '',
  keywords: [],
  keywords_def: [],

  reply_data: {
    reply_all: false,
    msg_list: [],
  },
})

const selectorList = [
  {
    type: 'text',
    component: TextSelector,
  },
  {
    type: 'image',
    component: ImageSelector,
  },
  {
    type: 'voice',
    component: VoiceSelector,
  },
  {
    type: 'video',
    component: VideoSelector,
  },
  {
    type: 'news',
    component: NewsSelector,
  },
]

onMounted(() => {
  console.log('onMounted')
  assignDoc()
})

const assignDoc = () => {
  // console.log('assignDoc', JSON.stringify(doc, null, 2))
  if (!doc) {
    form.id = ''
    form.rule_title = ''
    form.keywords = []
    form.keywords_def = []
    form.reply_data = {
      reply_all: false,
      msg_list: [],
    }
    return
  }
  form.id = doc.id
  form.rule_title = doc.rule_title
  form.keywords = doc.keywords
  form.keywords_def = doc.keywords_def

  form.reply_data = doc.reply_data
}

const handleAddKeyword = () => {
  form.keywords_def.push({
    keyword: '',
    exact: true,
  })
}

const handleRemoveKeyword = (index) => {
  console.log('handleRemoveKeyword', index)
  form.keywords_def.splice(index, 1)
}

const onAddMessage = (type, data) => {
  // console.log('onAddMessage', type, data)
  form.reply_data.msg_list.push({
    msg_type: type,
    ...data,
  })
}

const handleRemoveMessage = (index) => {
  console.log('handleRemoveMessage', index)
  form.reply_data.msg_list.splice(index, 1)
}

const emit = defineEmits(['cancel', 'submit'])

const handleCancel = () => {
  console.log('cancel!')
  emit('cancel')
}

const onSubmit = async () => {
  console.log('submit!', JSON.stringify(form, null, 2))
  const errMsg = checkForm()
  if (errMsg) {
    ElMessage.error(errMsg)
    return
  }
  form.keywords = form.keywords_def.map((item) => item.keyword)

  status.loading = true
  let response = await ajax.post('/api/autoreply/save', form)
  status.loading = false

  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('保存成功')
  emit('submit')
}

// 检查表单
const checkForm = () => {
  if (!form.rule_title) {
    return '规则名称不能为空'
  }
  if (!form.keywords_def.length) {
    return '请添加关键词'
  }
  if (form.keywords_def.some((item) => !item.keyword)) {
    return '关键词不能为空'
  }
  if (!form.reply_data.msg_list.length) {
    return '回复内容不能为空'
  }
  return ''
}
</script>

<style lang="less" scoped>
.flex-list {
  display: flex;
  gap: 10px;
}

.show-margin-left {
  margin-left: 20px;
}

.keyword-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .keyword-item {
    display: flex;
    gap: 10px;
    align-items: center;

    :deep(.el-icon) {
      cursor: pointer;
    }
  }
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;

  .message-wrapper {
    max-width: 600px;

    :deep(.el-image) {
      max-height: 200px;
    }

    :deep(video) {
      max-height: 200px;
    }
  }
}
</style>
