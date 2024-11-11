import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const ajax = axios.create({
  baseURL: '/',
  timeout: 600000,
  headers: {},
})

// Add a response interceptor
ajax.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response.data) {
      if (response.data.code !== 0 && response.data.message === 'no login') {
        router.push({
          name: 'Login',
        })
        // ElMessage.error(response.data.message)
      } else if (response.data.code !== 0 && response.data.message === 'no appid') {
        router.push({
          name: 'SelectAppid',
        })
        // ElMessage.error(response.data.message)
      }
    }

    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.log('ajax error', error)
    if (error.response && error.response.data) {
      let data = error.response.data
      if (data.code !== 0 && data.message === 'no login') {
        router.push({
          name: 'Login',
        })
        ElMessage.error(data.message)
      } else if (data.code !== 0 && data.message === 'no appid') {
        router.push({
          name: 'SelectAppid',
        })
        ElMessage.error(data.message)
      } else if (data.code !== 0) {
        ElMessage.error(data.message)
      }
    }
    return Promise.reject(error)
  },
)

export default ajax
