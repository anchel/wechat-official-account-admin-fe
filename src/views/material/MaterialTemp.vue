<template>
  <div class="content">
    <div class="header"></div>
    <div class="body">
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="图片" name="image" :lazy="true">
          <MaterialList :listdef="listdef_image" />
        </el-tab-pane>
        <el-tab-pane label="音频" name="voice" :lazy="true">
          <MaterialList :listdef="listdef_voice" />
        </el-tab-pane>
        <el-tab-pane label="视频" name="video" :lazy="true">
          <MaterialList :listdef="listdef_video" />
        </el-tab-pane>
        <el-tab-pane label="缩略图" name="thumb" :lazy="true">
          <MaterialList :listdef="listdef_thumb" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import MaterialList from '@/views/material/components/MaterialList.vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeName = ref('image')

const listdef_image = reactive({
  media_cat: 'temp', // perm-永久素材 temp-临时素材
  media_type: 'image',
})
const listdef_voice = reactive({
  media_cat: 'temp', // perm-永久素材 temp-临时素材
  media_type: 'voice',
})
const listdef_video = reactive({
  media_cat: 'temp', // perm-永久素材 temp-临时素材
  media_type: 'video',
})

const listdef_thumb = reactive({
  media_cat: 'temp', // perm-永久素材 temp-临时素材
  media_type: 'thumb',
})

onMounted(() => {
  const { query } = route
  if (query.tab) {
    activeName.value = query.tab
  }
})

const handleClick = (tab) => {
  router.push({ query: { tab: tab.paneName } })
}
</script>

<style lang="less" scoped>
.content {
  padding: 20px;
}
</style>
