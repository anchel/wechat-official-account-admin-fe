<template>
  <div>
    <div style="cursor: pointer" @click="handleClickAdd">
      <slot>
        <el-button type="primary">本地上传</el-button>
      </slot>
    </div>

    <material-add-dialog
      v-if="dialogFormVisible"
      v-model:dialogFormVisible="dialogFormVisible"
      :xdo="xdo"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MaterialAddDialog from '@/components/common/material-add-dialog.vue'

const emit = defineEmits(['success'])
const { xdo } = defineProps({
  xdo: {
    type: Object, // { media_cat: '', media_type: '' }
    required: true,
  },
})

const dialogFormVisible = ref(false)

const handleClickAdd = () => {
  dialogFormVisible.value = true
}

const handleUploadSuccess = (materialObj) => {
  // console.log('handleUploadSuccess', JSON.stringify(materialObj, null, 4))
  dialogFormVisible.value = false
  emit('success', materialObj)
}
</script>
