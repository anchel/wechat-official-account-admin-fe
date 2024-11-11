<template>
  <div>
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      :close-on-click-modal="false"
      :before-close="handleBeforeClose"
    >
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="素材文件">
          <file-selector :xdo="xdo" :accepted-types="acceptedTypes" @file-selected="handleFileSelected" />
        </el-form-item>
        <el-form-item label="标题" v-if="xdo.media_type === 'video'">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="描述" v-if="xdo.media_type === 'video'">
          <el-input v-model="form.description" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleBeforeCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="loading"> 确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import FileSelector from '@/components/common/file-selector.vue'
import { ElMessage } from 'element-plus'
import ajax from '@/utils/request'

const emit = defineEmits(['success'])

const { xdo } = defineProps({
  xdo: Object, // { media_cat: '', media_type: '' }
})

const dialogFormVisible = defineModel('dialogFormVisible', { type: Boolean })

const form = reactive({
  file: null,
  title: '',
  description: '',
})

const handleFileSelected = (params) => {
  // console.log('handleFileSelected', params.file.size)
  form.file = params.file
}

const handleBeforeClose = () => {
  console.log('handleBeforeClose')
  if (loading.value) {
    ElMessage.warning('正在上传中，请稍后')
    return false
  }
  dialogFormVisible.value = false
  return true
}
const handleBeforeCancel = () => {
  if (loading.value) {
    ElMessage.warning('正在上传中，请稍后')
    return
  }
  dialogFormVisible.value = false
}

const loading = ref(false)

const handleConfirm = async () => {
  console.log('handleConfirm')
  if (!form.file) {
    ElMessage.error('请选择文件')
    return
  }
  if (xdo.media_type === 'video') {
    if (!form.title || !form.description) {
      ElMessage.error('请填写标题和描述')
      return
    }
  }
  const formData = new FormData()
  formData.append('file', form.file) // 将文件添加到 FormData 对象
  formData.append('media_cat', xdo.media_cat)
  formData.append('media_type', xdo.media_type)
  formData.append('title', form.title)
  formData.append('description', form.description)
  loading.value = true
  let response
  try {
    response = await ajax.post('/api/material/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (e) {
    console.error(e)
    loading.value = false
  }
  loading.value = false
  if (!response) {
    ElMessage.error('上传异常')
    return
  }
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('上传成功')
  dialogFormVisible.value = false
  emit('success', data.data)
}

const acceptedTypes = computed(() => {
  let types = 'image/bmp,image/png,image/jpeg,image/jpg,image/gif'
  if (xdo.media_type === 'voice') {
    // types = 'audio/*'
    types = 'audio/mp3,audio/wma,audio/wav,audio/amr'
  } else if (xdo.media_type === 'video') {
    types = 'video/mp4'
  } else if (xdo.media_type === 'thumb') {
    types = 'image/jpeg,image/jpg'
  }
  return types
})

const dialogTitle = computed(() => {
  let title = '新增图片'
  if (xdo.media_type === 'voice') {
    title = '新增音频'
  } else if (xdo.media_type === 'video') {
    title = '新增视频'
  } else if (xdo.media_type === 'thumb') {
    title = '新增缩略图'
  }
  return title
})
</script>
