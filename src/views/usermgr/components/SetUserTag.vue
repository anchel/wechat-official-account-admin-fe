<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="选择标签" prop="name">
        <tag-selector v-model="form.tagid" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ajax from '@/utils/request'

import TagSelector from '@/components/common/tag-selector.vue'

const emit = defineEmits(['refresh'])
const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const { tag } = defineProps({
  tag: Object,
})

const dialogTitle = computed(() => {
  return tag.tagid_list && tag.tagid_list.length > 0 ? '编辑标签' : '设置标签'
})

const status = reactive({
  loading: false,
})

const form = reactive({
  openid: '',
  tagid: '',
})

onMounted(() => {
  form.openid = tag.openid
})

watch(
  () => tag,
  (newVal) => {
    console.log('watch tag')
    form.openid = newVal.openid
  },
  { deep: true },
)

const handleSave = async () => {
  console.log('handleSave')
  if (!form.tagid) {
    ElMessage.error('标签不能为空')
    return
  }
  status.loading = true
  let response
  try {
    response = await ajax.post('/api/wxuser/tag/batchtagging', {
      openid_list: [form.openid],
      tagid: form.tagid,
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
