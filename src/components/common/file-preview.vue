<template>
  <div v-if="file">
    <el-image
      v-if="xdo.media_type === 'image' || xdo.media_type === 'thumb'"
      :src="dataUrl"
      fit="contain"
      alt=""
      style="width: 150px"
    />
    <audio v-else-if="xdo.media_type === 'voice'" :src="dataUrl" controls></audio>
    <video
      v-else-if="xdo.media_type === 'video'"
      :src="dataUrl"
      controls
      preload="auto"
      width="100%"
      style="max-height: 400px"
    ></video>
    <div v-else>未知的素材类型</div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const { xdo, file } = defineProps({
  xdo: Object, // { media_type: '' }
  file: File,
})

const dataUrl = ref()

onMounted(() => {
  console.log('file-preview onMounted')
  makeDataUrl(file)
})

watch(
  () => file,
  (newFile) => {
    console.log('file-preview watch file')
    makeDataUrl(newFile)
  },
)

const makeDataUrl = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    // console.log('e.target.result', e.target.result)
    dataUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}
</script>
