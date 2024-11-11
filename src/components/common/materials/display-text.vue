<template>
  <div class="content">{{ content }}</div>
</template>

<script setup>
const { content } = defineProps({
  media_cat: {
    type: String,
    required: true,
  },
  media_type: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
})
</script>

<style lang="less" scoped>
.content {
  //width: 100%;
  min-height: 50px;
  padding: 10px;
  //border: 1px solid var(--el-border-color);
}
</style>
