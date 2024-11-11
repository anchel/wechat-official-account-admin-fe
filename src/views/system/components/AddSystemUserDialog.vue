<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false">
    <template #header>
      <div>{{ userInfo && userInfo.id ? '编辑用户' : '添加用户' }}</div>
    </template>
    <el-form v-model="form" class="form" label-position="left" label-width="120">
      <el-form-item label="类型" required>
        <el-radio-group v-model="form.user_type">
          <el-radio value="normal">普通用户</el-radio>
          <el-radio value="admin">管理员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="用户名" required>
        <el-input v-model="form.username" placeholder="用户的英文ID，只能是英文字符"></el-input>
      </el-form-item>

      <el-form-item label="密码" required>
        <el-input type="password" v-model="form.password" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="确认密码" required>
        <el-input type="password" v-model="form.password_confirm" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="邮箱" required>
        <el-input v-model="form.email" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="form.remark" placeholder=""></el-input>
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
import md5 from 'js-md5'

const emit = defineEmits(['add-success', 'update-success'])

const { userInfo } = defineProps({
  userInfo: Object,
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
  user_type: '', // 用户类型 normal-普通用户 admin-管理员
  username: '',
  password: '',
  password_confirm: '',
  email: '',
  remark: '',
})

const disabled = computed(() => {
  return !form.user_type || !form.username || !form.password || !form.password_confirm || !form.email
})

const status = reactive({
  loading: false,
})

onMounted(() => {
  assignInfo()
})

watch(
  () => userInfo,
  () => {
    assignInfo()
  },
)

const assignInfo = () => {
  if (userInfo) {
    form.id = userInfo.id
    form.user_type = userInfo.user_type
    form.username = userInfo.username
    form.password = userInfo.password
    form.password_confirm = userInfo.password
    form.email = userInfo.email
    form.remark = userInfo.remark
  } else {
    form.id = ''
    form.user_type = ''
    form.username = ''
    form.password = ''
    form.password_confirm = ''
    form.email = ''
    form.remark = ''
  }
}

// 检查表单
const checkForm = () => {
  if (!form.user_type) {
    ElMessage.error('请选择用户类型')
    return false
  }
  if (!form.username) {
    ElMessage.error('请输入用户名')
    return false
  }
  if (!form.password) {
    ElMessage.error('请输入密码')
    return false
  }
  if (!form.password_confirm) {
    ElMessage.error('请输入确认密码')
    return false
  }
  if (!form.email) {
    ElMessage.error('请输入邮箱')
    return false
  }
  if (form.password !== form.password_confirm) {
    ElMessage.error('两次输入的密码不一致')
    return false
  }
  return true
}

const handleConfirm = async () => {
  console.log('handleConfirm')

  if (!checkForm()) {
    return
  }

  status.loading = true
  let response = await ajax.post('/api/system/user/save', {
    id: form.id,
    user_type: form.user_type,
    username: form.username,
    password: md5(form.password),
    email: form.email,
    remark: form.remark,
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
  padding: 20px;
  background-color: v-bind('themeStyle.mainBg');

  h1 {
    font-size: 24px;
    text-align: center;
  }

  .form {
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
