<template>
  <div class="content">
    <div class="header"></div>
    <div class="body">
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="关键词回复" name="keyword" :lazy="true">
          <keyword-reply :xdo="xdoKeyword"></keyword-reply>
        </el-tab-pane>
        <el-tab-pane label="收到消息回复" name="message" :lazy="true">
          <reply-wrapper :xdo="xdoMessage"></reply-wrapper>
        </el-tab-pane>
        <el-tab-pane label="被关注回复" name="subscribe" :lazy="true">
          <reply-wrapper :xdo="xdoSubscribe"></reply-wrapper>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import ReplyWrapper from '@/views/auto-reply/components/ReplyWrapper.vue'
import KeywordReply from '@/views/auto-reply/components/KeywordReply.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeName = ref('keyword')

const xdoKeyword = reactive({
  reply_type: 'keyword',
})
const xdoMessage = reactive({
  reply_type: 'message',
})
const xdoSubscribe = reactive({
  reply_type: 'subscribe',
})

onMounted(() => {
  const { query } = route
  if (query.tab) {
    activeName.value = query.tab
  }
})

const handleTabClick = (tab) => {
  // console.log('tab', tab)
  router.push({ query: { tab: tab.paneName } })
}
</script>
