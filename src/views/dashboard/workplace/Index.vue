<template>
  <div class="content">
    <el-card class="mb-2" shadow="hover">
      <el-descriptions title="配置信息" :column="4" border>
        <el-descriptions-item label="配置地址" :span="4">
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
            <el-tooltip placement="bottom">
              <template #content>
                <div>
                  <div>
                    {{ tipForUrl }}
                  </div>
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
    </el-card>

    <el-card v-if="qrcodeInfo.ticket">
      <el-descriptions title="" :column="4" border>
        <el-descriptions-item label="公众号二维码">
          <el-image
            :src="`https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(qrcodeInfo.ticket)}`"
            fit="contain"
            alt=""
            style="width: 200px"
          ></el-image>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import mpConfigServerUrlPng from '@/assets/img/mp-config-server-url.png'
import { QuestionFilled, CopyDocument } from '@element-plus/icons-vue'
import ajax from '@/utils/request'
import { copyTextToClipboard } from '@/utils/tools'
import { useAppIdInfoStore } from '@/stores/global'
import { ElMessage } from 'element-plus'

const appidInfoStore = useAppIdInfoStore()

const tipForUrl = '配置地址是公众号的消息接收地址，用于接收微信服务器推送的消息。需要在微信公众号官方后台进行配置'

const publicInfo = reactive({
  ip: '',
  configUrl: '',
})
const getPublicInfo = async () => {
  let response = await ajax.get('/api/system/appid/get_config_info', {
    params: {
      appid: appidInfoStore.appidInfo.appid,
    },
  })
  let data = response.data
  if (data.code !== 0) {
    return
  }

  publicInfo.ip = data.data.ip
  publicInfo.configUrl = data.data.configUrl
}

const checkAppid = () => {
  if (!appidInfoStore.appidInfo.appid) {
    return
  }
  getPublicInfo()
}

watch(
  () => appidInfoStore.appidInfo,
  () => {
    // console.log('appidInfo.value.appid:', appidInfoStore.appidInfo)
    checkAppid()
  },
)

onMounted(() => {
  console.log('onMounted')
  appidInfoStore.fetchAppIdInfo()
  checkAppid()
})

const handleClickCopyUrl = () => {
  copyTextToClipboard(publicInfo.configUrl)
}

const handleClickCopyIP = () => {
  copyTextToClipboard(publicInfo.ip)
}

const status = reactive({
  loading: false,
})

const qrcodeInfo = reactive({
  ticket: '',
})

const getQrcodeInfo = async () => {
  status.loading = true
  let response = await ajax.get('/api/qrcode/list', {
    params: {
      offset: 0,
      count: 1,
      keyword: '',
      qrcode_type: 'limit',
    },
  })
  status.loading = false

  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }

  let list = data.data.list || []
  if (list.length > 0) {
    qrcodeInfo.ticket = list[0].ticket
  }
}

onMounted(() => {
  getQrcodeInfo()
})
</script>
