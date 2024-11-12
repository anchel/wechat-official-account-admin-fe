<template>
  <div class="content layout h-screen">
    <div class="header">
      <div>
        <h1>请选择公众号</h1>
      </div>
      <el-link type="primary" :underline="false" href="/system/appid/list" v-if="isAdmin">管理公众号</el-link>
    </div>

    <template v-if="status.requested && listData.list.length">
      <div class="appid-list">
        <el-card
          class="appid-item"
          v-for="item in listData.list"
          :key="item.id"
          :class="{ selected: !!item.selected }"
          @click="handleSelect(item)"
        >
          <div class="appid-content">
            <div class="logo">
              <el-image style="width: 100%; height: 100%" :src="item.thumbnail || logo" fit="contain"></el-image>
            </div>
            <div class="desc">
              <h3>{{ item.name }}</h3>
              <p>{{ item.appid }}</p>
            </div>
          </div>
        </el-card>
      </div>
      <div class="bottom">
        <el-button
          type="success"
          size="large"
          :disabled="!currentAppid"
          :loading="status.loading"
          @click="handleConfirm"
          >确定
        </el-button>
      </div>
    </template>

    <el-empty v-else description="暂无可管理的公众号，请联系管理员添加" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import logo from '@/assets/img/logo.png'
import { useLayoutStore } from '@/stores/global'
import theme from '@/config/theme'
import ajax from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useUserInfoStore } from '@/stores/global'

const { layoutSetting } = useLayoutStore()
const userInfoStore = useUserInfoStore()

const isAdmin = computed(() => {
  return userInfoStore.userInfo && userInfoStore.userInfo.user_type === 'admin'
})

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

const status = reactive({
  loading: false,
  requested: false,
})

const listData = reactive({
  list: [],
})

onMounted(() => {
  getList()
})

const getList = async () => {
  console.log('getAppidList')
  status.loading = true
  let response = await ajax.get('/api/system/appid/list')
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  status.requested = true

  listData.list = data.data.list
}

const currentAppid = ref('')

const handleSelect = (item) => {
  console.log('handleSelect')
  listData.list.forEach((i) => {
    i.selected = false
  })
  item.selected = true
  currentAppid.value = item.appid
}

const handleConfirm = async () => {
  console.log('handleConfirm', currentAppid.value)
  if (!currentAppid.value) {
    ElMessage.error('请选择公众号')
    return
  }
  status.loading = true
  let response = await ajax.post('/api/system/appid/select', {
    appid: currentAppid.value,
  })
  status.loading = false
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  location.href = '/'
}
</script>

<style lang="postcss" scoped>
.content {
  padding: 20px;
  background-color: v-bind('themeStyle.mainBg');

  .header {
    display: flex;

    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  h1 {
    font-size: 24px;
    text-align: center;
  }

  .appid-list {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    .appid-item {
      width: 300px;
      cursor: pointer;

      &.selected {
        border: 4px solid #00a65a;
      }

      .appid-content {
        display: flex;

        gap: 10px;

        .logo {
          width: 80px;
          height: 80px;
        }
      }
    }
  }

  .bottom {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
