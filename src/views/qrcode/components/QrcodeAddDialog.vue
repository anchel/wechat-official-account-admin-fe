<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false">
    <template #header>
      <div>添加二维码</div>
    </template>

    <el-form>
      <el-form-item label="名称">
        <el-input v-model="form.title" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="场景类型">
        <el-radio-group v-model="scene_type">
          <el-radio value="str">字符串</el-radio>
          <el-radio value="num">数值型</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="场景值" v-if="scene_type === 'str'">
        <el-input v-model="form.scene_str" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="场景值" v-if="scene_type === 'num'">
        <el-input v-model.number="form.scene_id" type="number" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="过期时间" v-if="listdef.qrcode_type === 'temp'">
        <el-input v-model.number="form.expire_seconds" placeholder="多少秒后过期，最大2592000"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :disabled="status.loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['success'])

const { listdef } = defineProps({
  listdef: {
    type: Object, // {qrcode_type: 'temp'} or {qrcode_type: 'limit'}
    required: true,
  },
})
const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const scene_type = ref('str')

const form = reactive({
  title: '',
  scene_str: '',
  scene_id: '',
  expire_seconds: '',
})

const status = reactive({
  loading: false,
})

const handleCancel = () => {
  dialogVisible.value = false
}

const handleSave = async () => {
  if (!checkForm()) {
    return
  }

  let data = {
    qrcode_type: listdef.qrcode_type,
    title: form.title,
  }
  if (scene_type.value === 'str') {
    data.scene_str = form.scene_str
  } else {
    data.scene_id = form.scene_id
  }
  if (listdef.qrcode_type === 'temp') {
    data.expire_seconds = form.expire_seconds
  }
  status.loading = true
  let response = await ajax.post('/api/qrcode/add', data)
  status.loading = false
  if (response.data.code !== 0) {
    ElMessage.error(response.data.message)
    return
  }
  dialogVisible.value = false
  ElMessage.success('添加成功')
  emit('success')
}

// 检查表单
const checkForm = () => {
  if (!form.title) {
    ElMessage.error('请输入名称')
    return false
  }
  if (scene_type.value === 'str' && !form.scene_str) {
    ElMessage.error('请输入场景值')
    return false
  }
  if (scene_type.value === 'num' && !form.scene_id) {
    ElMessage.error('请输入场景值')
    return false
  }
  if (listdef.qrcode_type === 'temp' && !form.expire_seconds) {
    ElMessage.error('请输入过期时间')
    return false
  }
  return true
}
</script>

<style scoped lang="less"></style>
