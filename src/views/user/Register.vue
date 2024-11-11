<template>
  <div class="other">
    <h1>注册</h1>
    <el-form label-width="auto" style="max-width: 600px" :model="form">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" />
      </el-form-item>
      <el-form-item label="重复密码">
        <el-input type="password" v-model="password_repeat" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
    <router-link :to="{ name: 'Login' }">
      <span>登录</span>
    </router-link>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ajax from '@/utils/request'
import md5 from 'js-md5'

const router = useRouter()
// eslint-disable-next-line no-unused-vars
const route = useRoute()

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const password_repeat = ref('')

const onSubmit = async () => {
  console.log('onSubmit')
  if (form.password !== password_repeat.value) {
    alert('两次密码不一致')
    return
  }
  const password = md5(form.password)
  let response = await ajax.post(
    '/api/system/user/register',
    { username: form.username, email: form.email, password },
    {},
  )

  // console.log('ret', response.data)
  let data = response.data

  if (data.code !== 0) {
    alert(data.message)
  } else {
    alert('注册成功')
    setTimeout(() => {
      router.push({
        name: 'login',
      })
    }, 1500)
  }
}
</script>

<style lang="less" scoped>
.other {
  padding: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
}
</style>
