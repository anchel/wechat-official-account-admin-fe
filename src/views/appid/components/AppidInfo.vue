<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" width="88%">
    <template #header>
      <h1>公众号信息</h1>
    </template>
    <el-descriptions title="基础信息" :column="2" border>
      <el-descriptions-item label="名称">{{ appidInfo.name }}</el-descriptions-item>
      <el-descriptions-item label="类型" :span="1"
        >{{ appidInfo.app_type === 'fwh' ? '服务号' : '订阅号' }}
      </el-descriptions-item>

      <el-descriptions-item label="appid">{{ appidInfo.appid }}</el-descriptions-item>
      <el-descriptions-item label="appsecret">{{ appidInfo.appsecret }}</el-descriptions-item>
      <el-descriptions-item label="token">{{ appidInfo.token }}</el-descriptions-item>
      <el-descriptions-item label="encoding_aes_key">{{ appidInfo.encoding_aes_key }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="配置信息" :column="2" border>
      <el-descriptions-item label="配置url" :span="2">
        <div>
          {{ publicInfo.configUrl }}
          <el-tooltip placement="top">
            <template #content>
              <div>
                <div>{{ tipForUrl }}</div>
                <el-image :src="mpConfigServerUrlPng" fit="contain" alt="" style="width: 800px"></el-image>
              </div>
            </template>
            <el-icon style="margin-left: 20px">
              <question-filled />
            </el-icon>
          </el-tooltip>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="公网ip">{{ publicInfo.ip }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { QuestionFilled } from '@element-plus/icons-vue'
import mpConfigServerUrlPng from '@/assets/img/mp-config-server-url.png'
import { onMounted, reactive, ref } from 'vue'
import ajax from '@/utils/request'

const { appidInfo } = defineProps({
  appidInfo: Object,
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const tipForUrl = '配置url是公众号的消息处理地址，用于接收微信服务器推送的消息。需要在微信公众号官方后台进行配置'

const publicInfo = reactive({
  ip: '',
  configUrl: '',
})

const getPublicInfo = async () => {
  let response = await ajax.get('/api/system/appid/get_config_info', {
    params: {
      appid: appidInfo.appid,
    },
  })
  let data = response.data
  if (data.code !== 0) {
    return
  }

  publicInfo.ip = data.data.ip
  publicInfo.configUrl = data.data.configUrl
}

onMounted(() => {
  getPublicInfo()
})
</script>

<style scoped lang="less"></style>
