<template>
  <el-dialog
    v-model="dialogFormVisible"
    :close-on-click-modal="false"
    :append-to-body="true"
    title="编辑图文"
    width="88%"
  >
    <div class="content">
      <div class="list">
        <el-card class="article-card">
          <div v-if="!localArticles.length">暂无文章</div>
          <div class="article-list">
            <div
              class="article-item"
              v-for="(article, index) in localArticles"
              :key="index"
              :class="{ active: article === currentArticle }"
              @click="handleSelectArticle(article)"
            >
              <div class="article-title">
                {{ article.title }}
              </div>
              <el-image fit="cover" :src="makeImageSrc(article, index)" class="article-image"></el-image>
            </div>
          </div>
        </el-card>
        <el-button
          type="primary"
          :disabled="localArticles.length >= 5"
          @click="handleAddArticle"
          style="margin-top: 10px"
          >添加文章
        </el-button>
      </div>
      <div class="editor" v-if="currentArticle">
        <el-form size="small" v-model="currentArticle" style="min-width: 400px">
          <el-form-item label="标题">
            <el-input v-model="currentArticle.title" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="currentArticle.description" />
          </el-form-item>
          <el-form-item label="图片">
            <image-cropper
              :preview-height="100"
              :crop-size-height="200"
              :crop-width-height-ratio="1.778"
              :crop-img-original-ratio="false"
              :img-url="currentArticle.pic_url"
              :limit-size="1024 * 512"
              v-model="currentArticle.pic_url_data"
            ></image-cropper>
          </el-form-item>
          <el-form-item label="链接">
            <el-input v-model="currentArticle.url" />
          </el-form-item>
        </el-form>
        <div class="btn" title="移除该篇文章">
          <el-icon size="25" @click="handleRemoveArticle">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="status.loading" @click="handleConfirm"> 确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElCard, ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import defaultImgW from '@/assets/img/default-w.png'
import defaultImgS from '@/assets/img/default-s.png'
import ImageCropper from '@/components/common/image-cropper.vue'
import { uploadImage } from '@/utils/tools'

const emit = defineEmits(['confirm'])
const dialogFormVisible = defineModel('dialogFormVisible', { type: Boolean })
const { articles } = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const status = reactive({
  loading: false,
})

const currentArticle = ref(null)

const localArticles = ref([])

watch(
  () => articles,
  (val) => {
    assignLocalArticles(val)
  },
)

onMounted(() => {
  assignLocalArticles(articles)
})

const assignLocalArticles = (arr) => {
  arr.forEach((item) => {
    localArticles.value.push({
      title: item.title,
      description: item.description,
      pic_url: item.pic_url,
      pic_url_data: null,
      url: item.url,
    })
  })
}

const handleAddArticle = () => {
  localArticles.value.push({
    title: '',
    description: '',
    pic_url: '',
    pic_url_data: null,
    url: '',
  })
  currentArticle.value = localArticles.value[localArticles.value.length - 1]
}

const handleRemoveArticle = () => {
  const index = localArticles.value.findIndex((item) => item === currentArticle.value)
  localArticles.value.splice(index, 1)
  currentArticle.value = null
  if (localArticles.value.length) {
    if (index === 0) {
      currentArticle.value = localArticles.value[0]
    } else {
      currentArticle.value = localArticles.value[index - 1]
    }
  }
}

const handleSelectArticle = (article) => {
  currentArticle.value = article
}

const handleConfirm = async () => {
  if (!localArticles.value.length) {
    ElMessage.error('请添加文章')
    return
  }
  // 检查文章
  for (let i = 0; i < localArticles.value.length; i++) {
    if (!checkArticle(localArticles.value[i], i)) {
      return
    }
  }

  // 上传图片
  for (let article of localArticles.value) {
    if (article.pic_url_data) {
      status.loading = true
      article.pic_url = await uploadImage(article.pic_url_data, 'thumb.jpeg')
      article.pic_url_data = null
      status.loading = false
    }
  }

  emit('confirm', { articles: localArticles.value })
  dialogFormVisible.value = false
}

const checkArticle = (article, index) => {
  if (!article.title) {
    ElMessage.error(`请填写第${index + 1}篇文章的标题`)
    return false
  }
  if (!article.description) {
    ElMessage.error(`请填写第${index + 1}篇文章的描述`)
    return false
  }
  if (!article.pic_url_data && !article.pic_url) {
    ElMessage.error(`请上传第${index + 1}篇文章的图片`)
    return false
  }
  if (!article.url) {
    ElMessage.error(`请填写第${index + 1}篇文章的链接`)
    return false
  }
  return true
}

const makeImageSrc = (item, idx) => {
  if (item.pic_url_data) {
    return URL.createObjectURL(item.pic_url_data)
  }
  if (item.pic_url) {
    return item.pic_url
  }
  if (idx === 0) {
    return defaultImgW
  }
  return defaultImgS
}
</script>

<style lang="less" scoped>
.content {
  display: flex;

  .editor {
    padding: 20px;

    .btn {
      cursor: pointer;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
  }
}

.article-card {
  width: 300px;

  .article-list {
    margin-top: 10px;
    margin-bottom: 10px;

    .article-item {
      position: relative;
      border-bottom: 1px solid #ebeef5;
      cursor: pointer;

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
          width: 60px;
          height: 60px;
        }
      }
    }
  }
}
</style>
