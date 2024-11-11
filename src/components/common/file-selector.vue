<template>
  <div class="file-uploader" @click="triggerFileInput">
    <template v-if="file">
      <file-preview :xdo="xdo" :file="file" />
      <el-icon :size="20" @click.stop="handleRemoveFile">
        <Delete />
      </el-icon>
    </template>
    <slot name="trigger">
      <el-button type="primary" v-if="!file">{{ triggerText }}</el-button>
      <span v-if="!file" style="margin-left: 10px">{{ getLimitDescription() }}</span>
    </slot>
    <input
      v-if="!file"
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      :accept="acceptedTypes"
      style="display: none"
    />
  </div>
</template>

<script>
import FilePreview from '@/components/common/file-preview.vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  components: { Delete, FilePreview },
  props: {
    xdo: {
      type: Object, // { media_type: '' }
      required: true,
    },
    triggerText: {
      type: String,
      default: '选择文件',
    },
    acceptedTypes: {
      type: String,
      default: 'image/*', // 默认接受所有图片类型
    },
  },
  data() {
    return {
      file: null,
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const files = event.target.files
      if (files.length > 0) {
        const file = files[0]
        if (file.size > this.getFileLimitSize()) {
          ElMessage.error('文件大小超过限制')
          return
        }

        this.file = file
        this.$emit('file-selected', { file })
        console.log('file-selected')
      }
    },
    getFileLimitSize() {
      switch (this.xdo.media_type) {
        case 'image':
          return 10 * 1024 * 1024 // 10 MB
        case 'audio':
          return 2 * 1024 * 1024 // 2 MB
        case 'video':
          return 10 * 1024 * 1024 // 10 MB
        case 'thumb':
          return 64 * 1024 // 64 KB
        default:
          return 512 * 1024 * 1024 // 512 MB
      }
    },
    handleRemoveFile() {
      this.file = null
      this.$emit('file-selected', { file: null, fileType: '' })
    },

    getLimitDescription() {
      switch (this.xdo.media_type) {
        case 'image':
          return '图片大小不能超过 10MB'
        case 'voice':
          return '音频大小不能超过 2MB'
        case 'video':
          return '视频大小不能超过 10MB'
        case 'thumb':
          return '图片大小不能超过 64KB'
        default:
          return '文件大小不能超过 1GB'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.file-uploader {
  //border: 2px dashed #ccc;
  padding: 2px;
  text-align: center;
  cursor: pointer;
}

.file-uploader:hover {
  background-color: #f9f9f9;
}
</style>
