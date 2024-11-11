<template>
  <el-image
    :src="getMaterialUrl(media_type, media_id, media_cat)"
    fit="contain"
    :preview-src-list="makePreviewImageList(media_type, media_id, media_cat)"
  />
</template>

<script setup>
import { getMaterialUrl } from '@/utils/tools'

const { media_type, media_id, media_cat } = defineProps({
  media_cat: {
    type: String,
    required: true,
  },
  media_type: {
    type: String,
    required: true,
  },
  media_id: {
    type: String,
    required: true,
  },
  content: String,
})

const makePreviewImageList = (media_type, media_id, media_cat) => {
  return [getMaterialUrl(media_type, media_id, media_cat)]
}
</script>
