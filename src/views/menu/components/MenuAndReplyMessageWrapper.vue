<template>
  <div class="content-root">
    <div class="header" v-if="form.menuType === 'conditional'">
      <el-form size="small" :model="matchruleForm">
        <el-form-item label="状态">
          <div>
            <el-tag type="info" v-if="!form.menuid">未同步到微信</el-tag>
            <el-tag type="success" v-if="!!form.menuid">已同步到微信</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="用户标签">
          <tag-selector v-model="matchruleForm.tag_id" :disabled="!editable" />
        </el-form-item>
        <el-form-item label="客户端类型">
          <el-radio-group v-model="matchruleForm.client_platform_type" :disabled="!editable">
            <el-radio value="1">iOS</el-radio>
            <el-radio value="2">Android</el-radio>
            <el-radio value="3">其他</el-radio>
            <el-radio value="">空</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <menu-and-reply-message
      :editable="editable"
      :key-prefix="keyPrefix"
      :buttons="buttons"
      :autoreplys="autoreplys"
      @save-menu="handleSave"
      @release-menu="handleReleaseMenu"
      @delete-menu="handleDeleteMenu"
    />
  </div>
</template>

<script setup>
import ajax from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import TagSelector from '@/components/common/tag-selector.vue'
import MenuAndReplyMessage from '@/views/menu/components/MenuAndReplyMessage.vue'
import { computed, onMounted, reactive, ref } from 'vue'

const emit = defineEmits(['update-menu-id', 'delete-menu'])

const { menuobj } = defineProps({
  menuobj: Object,
})

const form = reactive({
  menuType: 'normal',
  id: '',
  menuid: '',
})

const buttons = ref([])
const autoreplys = ref(null)
// const autoreplys = reactive({
//   data: {},
// })

const matchruleForm = reactive({
  tag_id: '',
  client_platform_type: '',
})

const editable = computed(() => {
  let flag = true
  if (form.menuType === 'conditional' && form.menuid) {
    // 如果是个性化菜单，且已经同步到微信，则不允许编辑菜单，但是可以修改回复内容
    flag = false
  }
  return flag
})

const keyPrefix = computed(() => {
  let prefix = 'key_'
  if (form.menuType === 'conditional') {
    prefix = `key_${form.id || 'new'}_`
  }
  return prefix
})

onMounted(() => {
  form.menuType = menuobj.menuType
  if (menuobj.menu.id && menuobj.menu.id !== 'new') {
    form.id = menuobj.menu.id
  }
  getMenuData()
})

const getMenuData = async () => {
  let params = {
    menu_type: 'normal',
    menu_id: 'normal',
  }
  if (form.menuType === 'conditional') {
    params = {
      menu_type: 'conditional',
      id: form.id,
    }
    if (!form.id) {
      return
    }
  }
  let response = await ajax.get('/api/menu/get', {
    params: params,
  })
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
    return
  }
  let { button, autoreply, matchrule, menuid } = data.data
  if (!button) button = []
  if (!autoreply) autoreply = {}

  buttons.value = button.map((item, index) => {
    return {
      type: item.type,
      key: item.key,
      name: item.name,
      url: item.url,
      appid: item.appid,
      pagepath: item.pagepath,
      selected: index === 0,

      children:
        item.sub_button &&
        item.sub_button.map((child) => {
          return {
            type: child.type,
            key: child.key,
            name: child.name,
            url: child.url,
            appid: item.appid,
            pagepath: item.pagepath,
            selected: false,
          }
        }),
    }
  })

  autoreplys.value = autoreply
  if (matchrule) {
    matchruleForm.tag_id = matchrule.tag_id
    matchruleForm.client_platform_type = matchrule.client_platform_type
  }
  if (menuid) {
    form.menuid = menuid
  }
}

const handleSave = async (params) => {
  const list = params.buttons
  const autoReplayMap = params.autoReplayMap
  // console.log('autoReplayMap', autoReplayMap)

  const submitMenus = []
  const submitReplyMap = new Map()
  list
    .filter((item) => item.type !== 'add')
    .forEach((menu) => {
      const submitMenu = {
        name: menu.name,
        type: menu.type,
        key: menu.key,
        url: menu.url,
        appid: menu.appid,
        pagepath: menu.pagepath,
        sub_button: [],
      }

      if (menu.children) {
        menu.children
          .filter((item) => item.type !== 'add')
          .forEach((child) => {
            submitMenu.sub_button.push({
              name: child.name,
              type: child.type,
              key: child.key,
              url: child.url,
              appid: child.appid,
              pagepath: child.pagepath,
            })
            if (child.type === 'click' && child.key) {
              submitReplyMap.set(child.key, autoReplayMap.get(child.key))
            }
          })
      }

      submitMenus.push(submitMenu)
      if (menu.type === 'click' && menu.key) {
        submitReplyMap.set(menu.key, autoReplayMap.get(menu.key))
      }
    })

  // if (submitMenus.length === 0) {
  //   ElMessage.error('请添加菜单')
  //   return
  // }

  if (form.menuType === 'conditional') {
    if (matchruleForm.tag_id === '' && matchruleForm.client_platform_type === '') {
      ElMessage.error('请填写用户标签或客户端类型')
      return
    }
  }
  let postUrl = '/api/menu/save'
  let postData = {
    button: submitMenus,
    autoreply: Object.fromEntries(submitReplyMap),
  }
  if (form.menuType === 'conditional') {
    if (matchruleForm.tag_id) {
      matchruleForm.tag_id = `${matchruleForm.tag_id}` // 这里需要转成字符串
    }
    postData = {
      ...postData,
      matchrule: matchruleForm,
      id: form.id,
    }
    postUrl = '/api/menu/save-conditional'
  }
  let response = await ajax.post(postUrl, postData)
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
  } else {
    ElMessage.success('保存草稿成功')
    console.log('data.data', data.data)
    form.id = data.data.id
    emit('update-menu-id', data.data.id)
  }
}

const handleReleaseMenu = async () => {
  console.log('handleReleaseMenu')
  let response
  if (form.menuType === 'conditional') {
    if (!form.id) {
      ElMessage.error('请先保存当前个性化菜单')
      return
    }
    response = await ajax.post('/api/menu/release-conditional', {
      id: form.id,
    })
  } else {
    response = await ajax.post('/api/menu/release')
  }
  if (!response) {
    return
  }
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
  } else {
    form.menuid = data.data.menuid
    ElMessage.success('同步成功')
  }
}

const handleDeleteMenu = async () => {
  console.log('handleDeleteMenu')
  let message = '同时删除自定义菜单和所有个性化菜单，确定删除？'

  if (form.menuType === 'conditional') {
    if (!form.id) {
      emit('delete-menu')
      return
    }
    message = '删除个性化菜单，确定删除？'
  }

  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteMenu()
    })
    .catch(() => {})
}

const deleteMenu = async () => {
  let response
  if (form.menuType === 'conditional') {
    response = await ajax.post('/api/menu/delete-conditional', {
      id: form.id,
    })
  } else {
    response = await ajax.post('/api/menu/delete')
  }
  if (!response) {
    return
  }
  let data = response.data
  if (data.code !== 0) {
    ElMessage.error(data.message)
  } else {
    ElMessage.success('删除成功')
    emit('delete-menu', form.id)
  }
}
</script>

<style lang="less" scoped>
.content-root {
  min-width: 900px;

  .header {
    padding: 0 20px 0 20px;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
