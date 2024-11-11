<template>
  <el-dialog title="设置备注" v-model="dialogVisible" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="备注" prop="name">
        <el-input v-model="form.remark" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ajax from '@/utils/request'

const emit = defineEmits(['refresh'])
const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const { tag } = defineProps({
  tag: Object,
})

const status = reactive({
  loading: false,
})

const form = reactive({
  openid: '',
  remark: '',
})

onMounted(() => {
  form.openid = tag.openid
  form.remark = tag.remark
})

watch(
  () => tag,
  (newVal) => {
    console.log('watch tag')
    form.openid = newVal.openid
    form.remark = newVal.remark
  },
  { deep: true },
)

const handleSave = async () => {
  console.log('handleSave')
  if (!form.remark) {
    ElMessage.error('备注不能为空')
    return
  }
  status.loading = true
  let response
  try {
    response = await ajax.post('/api/wxuser/set-remark', {
      openid: form.openid,
      remark: form.remark,
    })
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

const handleClose = () => {
  console.log('handleClose')
  dialogVisible.value = false
}
</script>

<style lang="less" scoped></style>
