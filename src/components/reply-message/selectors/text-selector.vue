<template>
  <div class="btn" @click="handleAdd">
    <slot>
      <el-button type="info" :icon="ChatLineSquare">文字</el-button>
    </slot>
  </div>

  <text-editor
    v-if="dialogFormVisible"
    v-model:dialogFormVisible="dialogFormVisible"
    :content="content"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import TextEditor from '@/components/reply-message/popups/text-editor.vue'
import { ChatLineSquare } from '@element-plus/icons-vue'
import { ref } from 'vue'

const emit = defineEmits(['message-add'])
const { xdo, content } = defineProps({
  xdo: {
    type: Object, // { media_type, media_cat, add_type }
    required: true,
  },
  articles: Array,
  content: {
    type: String,
    default: '',
  },
})

const dialogFormVisible = ref(false)

const handleConfirm = (c) => {
  emit('message-add', { content: c })
  dialogFormVisible.value = false
}

const handleAdd = () => {
  if (xdo.add_type === 'open') {
    dialogFormVisible.value = true
    return
  }
  // console.log('handleAdd')
  emit('message-add', { content: '' })
}
</script>

<style lang="less" scoped>
.btn {
  cursor: pointer;
  display: flex;
}
</style>
