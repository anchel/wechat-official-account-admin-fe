<template>
  <el-card class="article-card">
    <div class="article-list">
      <div class="article-item" v-for="(article, index) in articles" :key="index">
        <div class="article-title">
          {{ article.title }}
        </div>
        <el-image fit="cover" :src="makeImageSrc(article.pic_url, index)" class="article-image"></el-image>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ElCard } from 'element-plus'
import defaultImgW from '@/assets/img/default-w.png'
import defaultImgS from '@/assets/img/default-s.png'

const { articles } = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const makeImageSrc = (src, idx) => {
  if (src) {
    return src
  }
  if (idx === 0) {
    return defaultImgW
  }
  return defaultImgS
}
</script>

<style scoped>
.article-card {
  width: 400px;

  .article-list {
    margin-top: 10px;
    margin-bottom: 10px;

    .article-item {
      position: relative;
      border-bottom: 1px solid #ebeef5;

      &.active:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0, 255, 0, 0.3);
      }

      &:first-child {
        .article-title {
          width: 100%;
          position: absolute;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          bottom: 0;
          height: 30px;
          z-index: 2;
        }

        .article-image {
          width: 100%;
        }
      }

      &:not(:first-child) {
        margin-top: 10px;

        display: flex;
        align-items: center;
        gap: 20px;

        .article-title {
          flex: 1;
          overflow: auto;
        }

        .article-image {
          width: 100px;
          height: 100px;
        }
      }
    }
  }
}
</style>
