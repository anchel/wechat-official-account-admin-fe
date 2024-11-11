<template>
  <div class="other">
    <h1>修改密码</h1>
    <el-form label-width="auto" style="max-width: 600px" :model="form">
      <el-form-item label="旧密码" required>
        <el-input type="password" autocomplete="off" v-model="form.old_password" />
      </el-form-item>
      <el-form-item label="新密码" required>
        <el-input type="password" autocomplete="off" v-model="form.new_password" />
      </el-form-item>
      <el-form-item label="重复新密码" required>
        <el-input type="password" autocomplete="off" v-model="password_confirm" />
      </el-form-item>
    </el-form>
    <div class="bottom">
      <div>
        <el-link type="info" @click="handleClickBack">回到首页</el-link>
      </div>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ajax from '@/utils/request'
import md5 from 'js-md5'
import { ElMessage } from 'element-plus'

const router = useRouter()
// eslint-disable-next-line no-unused-vars
const route = useRoute()

const form = reactive({
  old_password: '',
  new_password: '',
})

const password_confirm = ref('')

const onSubmit = async () => {
  console.log('onSubmit')
  if (!form.old_password || !form.new_password) {
    ElMessage.error('密码不能为空')
    return
  }
  if (form.new_password !== password_confirm.value) {
    ElMessage.error('两次密码不一致')
    return
  }

  let response = await ajax.post(
    '/api/system/user/change_password',
    {
      old_password: md5(form.old_password),
      new_password: md5(form.new_password),
    },
    {},
  )

  let data = response.data

  if (data.code !== 0) {
    ElMessage.error(data.message)
  } else {
    ElMessage.success('修改成功')
  }
}

const handleClickBack = () => {
  location.href = '/'
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

  .bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
}
</style>
