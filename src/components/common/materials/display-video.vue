<template>
  <video
    ref="video"
    :src="getMaterialUrl(media_type, media_id, media_cat)"
    controls
    preload="auto"
    width="100%"
  ></video>
</template>

<script setup>
import { getMaterialUrl } from '@/utils/tools'

const { media_type, media_id } = defineProps({
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
</script>
