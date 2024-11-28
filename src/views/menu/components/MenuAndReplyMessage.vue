<template>
  <div class="content">
    <wechat-menu-editor
      title="公众号"
      :buttons="buttons"
      :key-prefix="keyPrefix"
      :editable="editable"
      v-model:selected="selectedMenu"
      v-model:menus="menus"
      @remove-menu="handleRemoveMenu"
    ></wechat-menu-editor>

    <div class="right-side">
      <el-card style="max-width: 680px" v-if="!selectedMenu">
        <div>左侧添加菜单</div>
      </el-card>

      <el-card style="max-width: 680px" v-if="selectedMenu">
        <template #header>
          <div class="card-header">
            <span>菜单信息</span>
          </div>
        </template>

        <el-form :model="form">
          <el-form-item label="名称">
            <el-input v-model="selectedMenu.name" />
          </el-form-item>

          <el-form-item label="消息类型" v-show="showExt">
            <el-radio-group v-model="selectedMenu.type">
              <el-radio value="click">发送消息</el-radio>
              <el-radio value="view">跳转网页</el-radio>
              <!--              <el-radio value="miniprogram">跳转小程序</el-radio>-->
            </el-radio-group>
          </el-form-item>

          <el-form-item label="回复内容" v-show="showExt">
            <reply-message v-model:selected="selectedMenu" v-model:autoreply="selectedMenuAutoReply" :limit="3" />
          </el-form-item>

          <el-form-item
            label="回复方式"
            v-if="selectedMenuAutoReply.data && selectedMenuAutoReply.data.msg_list.length > 1"
          >
            <el-radio-group v-model="selectedMenuAutoReply.data.reply_all">
              <el-radio :value="true">回复全部</el-radio>
              <el-radio :value="false">随机回复一条</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <template #footer></template>
      </el-card>

      <div style="margin-top: 20px">
        <el-button type="info" @click="handleSave">保存为草稿</el-button>
        <el-button type="primary" @click="handleReleaseMenu">{{ releaseBtnTitle }}</el-button>
        <el-button type="danger" @click="handleDelete">删除菜单</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import WechatMenuEditor from '@/components/wechat-menu-editor/wechat-menu-editor.vue'
import ReplyMessage from '@/components/reply-message/reply-message.vue'
import { ElMessageBox } from 'element-plus'

const emit = defineEmits(['save-menu', 'release-menu', 'delete-menu'])

const selectedMenu = ref()
const menus = reactive({ list: [] })
const selectedMenuAutoReply = reactive({ data: null })

const { buttons, autoreplys, keyPrefix, editable } = defineProps({
  editable: {
    type: Boolean,
    required: true,
  },
  buttons: Array,
  autoreplys: Object,
  keyPrefix: {
    type: String,
    required: true,
  },
})

const autoReplayMap = ref(new Map())

const form = reactive({})

const showExt = computed(() => {
  if (!selectedMenu.value) {
    return false
  }
  return selectedMenu.value.type
})

const releaseBtnTitle = computed(() => {
  if (!editable) {
    return '正式发布'
  }
  return '正式发布'
})

watch(
  () => selectedMenuAutoReply.data,
  () => {
    console.log('watch selectedMenuAutoReply.data change', new Date().getMilliseconds())
    if (selectedMenu.value && selectedMenu.value.key) {
      if (selectedMenuAutoReply.data) {
        autoReplayMap.value.set(selectedMenu.value.key, selectedMenuAutoReply.data)
      } else {
        autoReplayMap.value.delete(selectedMenu.value.key)
      }
    }
  },
  { deep: true },
)

watch(selectedMenu, () => {
  console.log('watch selectedMenu change', new Date().getMilliseconds())
  let menu = selectedMenu.value
  let replyDataMap = autoReplayMap.value

  selectedMenuAutoReply.data = null
  if (menu && menu.type === 'click' && menu.key) {
    console.log('根据key，查找对应的回复数据')
    if (replyDataMap.has(menu.key)) {
      console.log('找到了对应的回复数据')
      selectedMenuAutoReply.data = replyDataMap.get(menu.key) || null
    }
  }
})

onMounted(() => {
  if (autoreplys) {
    autoReplayMap.value = new Map(Object.entries(autoreplys))
  } else {
    autoReplayMap.value = new Map()
  }
})

watch(
  () => autoreplys,
  () => {
    if (autoreplys) {
      autoReplayMap.value = new Map(Object.entries(autoreplys))
    } else {
      autoReplayMap.value = new Map()
    }
  },
  { deep: true },
)

const handleRemoveMenu = (parent, child) => {
  console.log('handleRemoveMenu', parent, child)
  if (child) {
    if (child.key) {
      autoReplayMap.value.delete(child.key)
    }
    return
  }
  if (parent) {
    if (parent.key) {
      autoReplayMap.value.delete(parent.key)
    }
  }
}

const handleReleaseMenu = () => {
  console.log('handleReleaseMenu')
  // 弹出确认框
  ElMessageBox.confirm('只有保存到草稿的内容，才会被发布，确认发布吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('release-menu', {
        buttons: menus.list,
        autoReplayMap: autoReplayMap.value,
      })
    })
    .catch(() => {
      console.log('取消发布')
    })
}

const handleSave = () => {
  console.log('handleSave')
  emit('save-menu', {
    buttons: menus.list,
    autoReplayMap: autoReplayMap.value,
  })
}

const handleDelete = () => {
  console.log('handleDelete')
  emit('delete-menu')
}
</script>

<style lang="less" scoped>
.content {
  display: flex;

  .right-side {
    flex: 1;
    padding-left: 20px;
  }
}
</style>
