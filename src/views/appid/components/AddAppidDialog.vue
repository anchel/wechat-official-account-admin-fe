<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" width="85%">
    <template #header>
      <h1>{{ appidInfo && appidInfo.id ? '编辑公众号' : '添加公众号' }}</h1>
    </template>
    <el-form v-model="form" class="form" label-position="left" label-width="120">
      <el-form-item label="类型" required>
        <el-radio-group v-model="form.app_type">
          <el-radio value="fwh">服务号</el-radio>
          <el-radio value="dyh">订阅号</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="名称" required>
        <el-input v-model="form.name" placeholder="公众号名称"></el-input>
      </el-form-item>

      <el-form-item label="Appid" required>
        <el-input v-model="form.appid" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="Appsecret" required>
        <el-input v-model="form.appsecret" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="Token">
        <el-input v-model="form.token" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="EncodingAESKey">
        <el-input v-model="form.encoding_aes_key" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="缩略图">
        <image-cropper
          :preview-height="100"
          :crop-size-height="100"
          :crop-width-height-ratio="1"
          :crop-img-original-ratio="true"
          :img-url="form.thumbnail"
          v-model="cropImg"
        ></image-cropper>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="success" size="large" :disabled="disabled" :loading="status.loading" @click="handleConfirm"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useLayoutStore } from '@/stores/global'
import theme from '@/config/theme'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import ImageCropper from '@/components/common/image-cropper.vue'
import { uploadImage } from '@/utils/tools.js'

const emit = defineEmits(['add-success', 'update-success'])

const { appidInfo } = defineProps({
  appidInfo: Object,
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const { layoutSetting } = useLayoutStore()

// 重新获取主题色
const f = () => {
  let themeArray = theme()
  return layoutSetting.theme >= themeArray.length ? themeArray[0] : themeArray[layoutSetting.theme]
}

let themeStyle = ref(f())
watch(
  () => layoutSetting.theme,
  () => (themeStyle.value = f()),
)
watch(
  () => layoutSetting.color.primary,
  () => (themeStyle.value = f()),
)

const form = reactive({
  id: '',
  app_type: 'gzh',
  name: '',
  appid: '',
  appsecret: '',
  token: '',
  encoding_aes_key: '',
  thumbnail: '',
})

const cropImg = ref(null)

const disabled = computed(() => {
  return !form.app_type || !form.name || !form.appid || !form.appsecret
})

const status = reactive({
  loading: false,
})

onMounted(() => {
  assignInfo()
})

watch(
  () => appidInfo,
  () => {
    assignInfo()
  },
)

const assignInfo = () => {
  form.id = appidInfo.id
  form.app_type = appidInfo.app_type
  form.name = appidInfo.name
  form.appid = appidInfo.appid
  form.appsecret = appidInfo.appsecret
  form.token = appidInfo.token
  form.encoding_aes_key = appidInfo.encoding_aes_key
  form.thumbnail = appidInfo.thumbnail
}

const handleConfirm = async () => {
  console.log('handleConfirm')

  status.loading = true

  // 先判断是否需要上传缩略图
  if (cropImg.value) {
    form.thumbnail = await uploadImage(cropImg.value, 'thumb.jpeg')
  }

  let response = await ajax.post('/api/system/appid/save', {
    ...form,
  })
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  ElMessage.success('保存成功')
  // await router.push({
  //   name: 'SelectAppid',
  // })
  if (form.id) {
    emit('update-success')
  } else {
    emit('add-success')
  }
}
</script>

<style lang="postcss" scoped>
.content {
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }

  .form {
    max-width: 400px;
    margin: 0 auto;
  }

  .bottom {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
