<template>
  <el-select v-model="modelValue" :clearable="true" :disabled="disabled" placeholder="请选择标签" style="width: 240px">
    <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ajax from '@/utils/request'

const modelValue = defineModel()
const { disabled } = defineProps({
  disabled: Boolean,
})

const options = ref([])

onMounted(() => {
  getList()
})

const getList = async () => {
  const { data } = await ajax.get('/api/wxuser/tag/list')
  if (data.code !== 0 || !data.data || !data.data.list) {
    return
  }
  options.value = [...data.data.list]
}
</script>

<style lang="less" scoped></style>
