<template>
  <audio controls>
    <source :src="getMaterialUrl(media_type, media_id, media_cat)" type="audio/mpeg" />
  </audio>
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
