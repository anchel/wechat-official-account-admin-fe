<template>
  <div class="btn" @click="handleAdd">
    <slot>
      <el-button type="info" :icon="ChatLineSquare">图文(外链)</el-button>
    </slot>
  </div>

  <news-editor
    v-if="dialogFormVisible"
    v-model:dialogFormVisible="dialogFormVisible"
    @confirm="handleConfirm"
    :articles="articles"
  />
</template>

<script setup>
import NewsEditor from '@/components/reply-message/popups/news-editor.vue'
import { ChatLineSquare } from '@element-plus/icons-vue'
import { ref } from 'vue'

const emit = defineEmits(['message-add'])
const { xdo, articles } = defineProps({
  xdo: {
    type: Object, // { media_type, media_cat, add_type }
    required: true,
  },
  media_id: String,
  content: String,
  articles: Array,
})

const dialogFormVisible = ref(false)

const handleConfirm = (obj) => {
  emit('message-add', { articles: obj.articles })
  dialogFormVisible.value = false
}

const handleAdd = () => {
  if (xdo.add_type === 'open') {
    dialogFormVisible.value = true
    return
  }
  // console.log('handleAdd')
  emit('message-add', { articles: [] })
}
</script>

<style lang="less" scoped>
.btn {
  cursor: pointer;
  display: flex;
}
</style>
