<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="标签名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ajax from '@/utils/request'

const emit = defineEmits(['refresh'])
const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const { tag } = defineProps({
  tag: Object,
})

const dialogTitle = computed(() => {
  return tag.id ? '编辑标签' : '新增标签'
})

const status = reactive({
  loading: false,
})

const form = reactive({
  id: 0,
  name: '',
})

onMounted(() => {
  form.id = tag.id
  form.name = tag.name
})

watch(
  () => tag,
  (newVal) => {
    console.log('watch tag', newVal)
    form.id = newVal.id
    form.name = newVal.name
  },
  { deep: true },
)

const handleClose = () => {
  return true
}

const handleSave = async () => {
  console.log('handleSave')
  if (!form.name) {
    ElMessage.error('标签名不能为空')
    return
  }
  status.loading = true
  let response
  try {
    if (form.id) {
      response = await ajax.post('/api/wxuser/tag/update', form)
    } else {
      response = await ajax.post('/api/wxuser/tag/create', form)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
  status.loading = false
  if (!response || response.data.code !== 0) {
    ElMessage.error('保存失败')
    return
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  emit('refresh')
}
</script>

<style lang="less" scoped></style>
