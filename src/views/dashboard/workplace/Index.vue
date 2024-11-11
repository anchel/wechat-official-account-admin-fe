<template>
  <div class="content">
    <el-card class="mb-2" shadow="hover">
      <div class="py-4 font-bold">工作台</div>
    </el-card>
    <el-card class="mb-2" shadow="hover">
      <div class="py-4 font-bold">图片裁剪</div>
      <image-cropper
        :preview-height="200"
        :crop-size-height="150"
        :crop-width-height-ratio="2"
        :img-url="option.img"
        v-model="cropImg"
      ></image-cropper>
    </el-card>
  </div>
</template>

<script setup>
import ImageCropper from '@/components/common/image-cropper.vue'
import { ref, watch } from 'vue'

const cropImg = ref(null)

const option = {
  img: '/api/material/source-local?media_type=image&media_id=2nG3qG0FnNnv11IiVJlgn-HdjPY9xMS-Zb7kd7_9sEj3XlmMZ0bKSJVwIZe4ygSA&media_cat=perm',
  size: 1,
  outputType: 'jpeg',
}

watch(cropImg, (newVal) => {
  console.log('watch cropImg')
})
</script>
