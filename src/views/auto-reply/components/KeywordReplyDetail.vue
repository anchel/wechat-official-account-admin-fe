<template>
  <el-dialog
    :title="!!doc ? doc.rule_title : '未知规则'"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    width="80%"
  >
    <el-form :model="form" label-width="90" label-position="left">
      <el-form-item label="关键词">
        <div class="keyword-item" v-for="item in form.keywords_def" :key="item.keyword">
          {{ item.keyword }}<span>({{ item.exact === true ? '全匹配' : '半匹配' }})</span>
        </div>
      </el-form-item>
      <el-form-item label="回复内容">
        <div class="message-list">
          <div class="message-wrapper" :key="index" v-for="(message, index) in form.reply_data.msg_list">
            <Message :message="message" :editable="false" />
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import Message from '@/components/reply-message/message.vue'

const { doc } = defineProps({
  doc: {
    type: Object,
  },
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const form = reactive({
  keywords_def: [],
  reply_data: {
    reply_all: true,
    msg_list: [],
  },
})

onMounted(() => {
  assignDoc()
})

watch(
  () => doc,
  () => {
    console.log('doc changed')
    assignDoc()
  },
  { deep: true },
)

const assignDoc = () => {
  if (!doc) return
  form.keywords_def = doc.keywords_def || []
  form.reply_data = doc.reply_data
}

const handleClose = () => {
  console.log('handleClose')
  dialogVisible.value = false
}

const makeKeywordsShow = (keywords) => {
  return keywords.map((item) => item.keyword).join('，')
}
</script>

<style lang="less" scoped>
.keyword-item {
  &:not(:first-child) {
    margin-left: 20px;
  }

  span {
    color: #999;
    margin-left: 6px;
  }
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;

  .message-wrapper {
    :deep(.el-image) {
      max-height: 150px;
    }

    :deep(video) {
      max-height: 150px;
    }
  }
}
</style>
