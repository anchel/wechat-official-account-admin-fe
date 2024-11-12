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
      <el-descriptions-item label="配置地址" :span="2">
        <div style="display: flex; align-items: center">
          {{ publicInfo.configUrl }}
          <el-icon
            size="20"
            style="cursor: pointer; margin-left: 10px"
            title="点击复制地址"
            @click="handleClickCopyUrl"
          >
            <CopyDocument />
          </el-icon>
          <el-tooltip placement="top">
            <template #content>
              <div>
                <div>{{ tipForUrl }}</div>
                <el-image :src="mpConfigServerUrlPng" fit="contain" alt="" style="width: 800px"></el-image>
              </div>
            </template>
            <el-icon size="20" style="margin-left: 10px">
              <question-filled />
            </el-icon>
          </el-tooltip>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="公网ip">
        <div style="display: flex; align-items: center">
          {{ publicInfo.ip }}
          <el-icon size="20" style="cursor: pointer; margin-left: 10px" title="点击复制ip" @click="handleClickCopyIP">
            <CopyDocument />
          </el-icon>
        </div>
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { CopyDocument, QuestionFilled } from '@element-plus/icons-vue'
import mpConfigServerUrlPng from '@/assets/img/mp-config-server-url.png'
import { onMounted, reactive } from 'vue'
import ajax from '@/utils/request'
import { copyTextToClipboard } from '@/utils/tools'

const { appidInfo } = defineProps({
  appidInfo: Object,
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })

const tipForUrl = '配置地址是公众号的消息接收地址，用于接收微信服务器推送的消息。需要在微信公众号官方后台进行配置'

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

const handleClickCopyUrl = () => {
  copyTextToClipboard(publicInfo.configUrl)
}

const handleClickCopyIP = () => {
  copyTextToClipboard(publicInfo.ip)
}
</script>

<style scoped lang="less"></style>
