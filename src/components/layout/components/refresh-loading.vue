<script setup>
import { Loading } from '@element-plus/icons-vue'
</script>

<template>
  <div class="refresh-loading">
    <el-icon class="is-loading">
      <Loading />
    </el-icon>
  </div>
</template>

<style lang="less" scoped>
.refresh-loading {
  flex: 1;
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
