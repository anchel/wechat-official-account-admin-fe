<template>
  <div class="btn" @click="handleAdd">
    <slot>
      <el-button type="info" :icon="Headset">音频</el-button>
    </slot>
  </div>

  <material-list
    v-if="dialogFormVisible"
    v-model:dialogFormVisible="dialogFormVisible"
    :xdo="xdo"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import { Headset } from '@element-plus/icons-vue'
import MaterialList from '@/components/reply-message/popups/material-list.vue'
import { ref } from 'vue'

const emit = defineEmits(['message-add'])
const { xdo } = defineProps({
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
  emit('message-add', { media_id: obj.media_id })
  dialogFormVisible.value = false
}

const handleAdd = () => {
  if (xdo.add_type === 'open') {
    dialogFormVisible.value = true
    return
  }
  // console.log('handleAdd')
  const defaultMediaId = '2nG3qG0FnNnv11IiVJlgn8lPxSU4RWwYxrbITGK3TlV-7KCIQMV_DQTexPGeXSER'
  emit('message-add', { media_id: defaultMediaId })
}
</script>

<style lang="less" scoped>
.btn {
  cursor: pointer;
  display: flex;
}
</style>
