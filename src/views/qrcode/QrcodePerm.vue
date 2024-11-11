<template>
  <div>
    <qrcode-list :listdef="listdef" />
  </div>
</template>

<script setup>
import QrcodeList from '@/views/qrcode/components/QrcodeList.vue'

const listdef = {
  qrcode_type: 'limit',
}
</script>

<style scoped lang="less"></style>
