<template>
  <div class="h-screen other">
    <div class="login-container">
      <div class="login-box">
        <h2 class="login-title">微信公众号管理系统</h2>
        <el-form :model="form" :rules="rules" ref="loginForm" label-width="0">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" prefix-icon="el-icon-user" clearable></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <div class="bottom-btn">
              <el-button type="primary" @click="handleClickSubmit" round block>登录</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, useTemplateRef, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import theme from '@/config/theme'
import ajax from '@/utils/request'
import md5 from 'js-md5'
import { ElMessage } from 'element-plus'
import { useLayoutStore } from '@/stores/global'

// const router = useRouter()
// const route = useRoute()

const loginForm = useTemplateRef('loginForm')

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleClickSubmit = () => {
  loginForm.value.validate((valid) => {
    if (valid) {
      doSubmit()
    } else {
      ElMessage.error('请输入完整')
      return false
    }
  })
}

const doSubmit = async () => {
  console.log('doSubmit')
  const password = md5(form.password)
  let response = await ajax.post('/api/system/user/login', { username: form.username, password }, {})

  // console.log('ret', response.data)
  let data = response.data

  if (data.code !== 0) {
    ElMessage.error(data.message)
  } else {
    ElMessage.success('登录成功')
    location.href = '/appid/select' // 跳转到选择公众号页面
  }
}

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
</script>

<style lang="less" scoped>
.other {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to top, v-bind('themeStyle.mainBg'), #00a65a);
  }

  .login-box {
    width: 360px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .login-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
    font-weight: 600;
  }

  .bottom-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
