<template>
  <div class="content">
    <div class="preview" v-if="imgSrc">
      <el-image fit="contain" :src="imgSrc" alt=""></el-image>
      <div class="mask">
        <el-icon size="30" @click="handleClickTrigger">
          <Edit />
        </el-icon>
        <el-icon size="30" @click="handleClickDelete" v-if="cropBlobData">
          <Delete />
        </el-icon>
      </div>
    </div>

    <div class="trigger" v-if="!imgSrc" @click="handleClickTrigger">
      <slot name="trigger">
        <el-icon size="30">
          <Plus />
        </el-icon>
      </slot>
    </div>

    <el-dialog
      v-if="status.dialogCropperVisible"
      v-model="status.dialogCropperVisible"
      :close-on-click-modal="false"
      :append-to-body="false"
      width="88%"
    >
      <template #header> 图片裁剪</template>
      <div class="dialog-content">
        <vue-cropper
          class="cropper"
          ref="cropper"
          :img="localFileData"
          :auto-crop="cropperOptions.autoCrop"
          :auto-crop-height="cropSize.h"
          :auto-crop-width="cropSize.w"
          :outputSize="cropperOptions.size"
          :outputType="cropperOptions.outputType"
          :fixed="cropperOptions.fixed"
          :fixedNumber="cropperOptions.fixedNumber"
          :fixedBox="cropperOptions.fixedBox"
          :full="cropperOptions.full"
          :canMoveBox="cropperOptions.canMoveBox"
          :center-box="cropperOptions.centerBox"
          :info="cropperOptions.info"
          :info-true="cropperOptions.infoTrue"
          @realTime="onRealTime"
        ></vue-cropper>
        <div class="preview-area" v-if="cropPreviewObj">
          <div>预览</div>
          <div
            :style="{
              width: cropPreviewObj.w + 'px',
              height: cropPreviewObj.h + 'px',
              overflow: 'hidden',
            }"
          >
            <div :style="cropPreviewObj.div">
              <img :src="cropPreviewObj.url" :style="cropPreviewObj.img" alt="" />
            </div>
          </div>

          <div>宽：{{ cropPreviewObj.w }} 高：{{ cropPreviewObj.h }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存</el-button>
      </template>
    </el-dialog>

    <input
      type="file"
      ref="fileInput"
      class=""
      @change="handleFileChange"
      :accept="acceptedTypes"
      v-if="!status.dialogCropperVisible"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import { ElMessage } from 'element-plus'

import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

const { acceptedTypes, limitSize, cropWidthHeightRatio, cropSizeHeight, previewHeight, cropImgOriginalRatio, imgUrl } =
  defineProps({
    acceptedTypes: {
      type: String,
      default: 'image/*', // 默认接受所有图片类型
    },
    limitSize: {
      type: Number,
      default: 1024 * 1024 * 10, // 默认限制10M
    },
    previewHeight: {
      type: Number,
    },
    cropSizeHeight: {
      type: Number,
      default: 200,
    },
    cropWidthHeightRatio: {
      type: Number,
      default: 1,
    },
    cropImgOriginalRatio: {
      // 是否用原图比例
      type: Boolean,
      default: false,
    },
    imgUrl: {
      type: String,
    },
  })

const modelValue = defineModel()

const cropperOptions = reactive({
  size: 1,
  outputType: 'jpeg',
  autoCrop: true,

  fixed: true,
  fixedNumber: [cropWidthHeightRatio, 1],
  fixedBox: true,
  full: cropImgOriginalRatio, // 是否输出原图比例的截图
  canMoveBox: false, // 是否可以拖动裁剪框
  centerBox: true, // 截图框是否被限制在图片里面
  info: true,
  infoTrue: true,
})

const status = reactive({
  dialogCropperVisible: false,
})

const imgSrc = computed(() => {
  if (cropBlobData.value) {
    return URL.createObjectURL(cropBlobData.value)
  }
  return imgUrl
})

const cropSize = computed(() => {
  let h = cropSizeHeight
  let w = h * cropWidthHeightRatio
  console.log('cropSize', h, w)
  return { h, w }
})

const previewSize = computed(() => {
  let h = previewHeight || cropSizeHeight
  let w = h * cropWidthHeightRatio
  return { h: h + 'px', w: w + 'px' }
})

const localFile = ref()
const localFileData = ref()
const cropBlobData = ref()

const fileInput = useTemplateRef('fileInput')

watch(
  () => modelValue.value,
  (val) => {
    cropBlobData.value = val
  },
)

const handleClickDelete = () => {
  handleClearLocalFile()
}

const handleCancel = () => {
  handleClearLocalFile()
  status.dialogCropperVisible = false
}

const elCropper = useTemplateRef('cropper')

const handleConfirm = () => {
  elCropper.value.getCropBlob((data) => {
    console.log('handleConfirm', data)
    if (!data) {
      ElMessage.error('裁剪失败')
      return
    }
    if (data.size > limitSize) {
      ElMessage.error('文件大小超过限制')
      return
    }
    cropBlobData.value = data
    modelValue.value = data // 改变 v-model 的值
    status.dialogCropperVisible = false
  })
}

const handleClickTrigger = () => {
  fileInput.value.click()
}

const handleClearLocalFile = () => {
  localFile.value = null
  localFileData.value = null
  cropBlobData.value = null
  modelValue.value = null // 改变 v-model 的值
}

const handleFileChange = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    const file = files[0]
    // if (file.size > limitSize) {
    //   ElMessage.error('文件大小超过限制')
    //   return
    // }

    handleClearLocalFile() // 重新选择之后，清空之前的数据

    localFile.value = file
    makeDataUrl(file)
  }
}

const makeDataUrl = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    // console.log('e.target.result', e.target.result)
    localFileData.value = e.target.result
    status.dialogCropperVisible = true // 弹出裁剪框
  }
  reader.readAsDataURL(file)
}

const cropPreviewObj = ref()

const onRealTime = (data) => {
  // console.log('onRealTime', data)
  cropPreviewObj.value = data
}
</script>

<style lang="less" scoped>
.content {
  .preview {
    position: relative;
    height: v-bind('previewSize.h');
    width: v-bind('previewSize.w');

    .el-image {
      max-width: 100%;
      max-height: 100%;
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }

  .trigger {
    border: 1px dashed #d9d9d9;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}

.dialog-content {
  display: flex;

  .cropper {
    flex: 1;
    height: 400px;
  }

  .preview-area {
    position: relative;
    width: 42%;
    overflow: hidden;
    margin-left: 20px;

    :deep(img) {
      max-width: none;
    }
  }
}
</style>
