<template>
  <el-dialog v-model="dialogFormVisible" title="回复文字" width="500">
    <el-form :model="form">
      <el-form-item label="文字内容" :label-width="140">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="form.content" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['confirm'])
const dialogFormVisible = defineModel('dialogFormVisible', { type: Boolean })
const { content } = defineProps({
  content: String,
})

const form = reactive({
  content: '',
})

watch(
  () => content,
  (val) => {
    form.content = val
  },
)

onMounted(() => {
  form.content = content
})

const handleConfirm = () => {
  if (!form.content) {
    ElMessage.error('请输入文字内容')
    return
  }
  emit('confirm', form.content)
  dialogFormVisible.value = false
}
</script>
