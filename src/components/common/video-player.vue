<template>
  <div class="video-player">
    <!-- 视频元素 -->
    <video ref="video" :src="src" @timeupdate="updateProgress" @ended="resetPlayer" width="100%" class="video"></video>

    <!-- 控制面板 -->
    <div class="controls">
      <el-icon size="30" @click="togglePlayPause">
        <video-pause v-if="isPlaying"></video-pause>
        <video-play v-else></video-play>
      </el-icon>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

export default {
  name: 'VideoPlayer',
  components: { VideoPlay, VideoPause },
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  setup() {
    const video = ref(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const volume = ref(1)

    // 在视频加载时获取持续时间
    onMounted(() => {
      video.value.volume = volume.value
      video.value.onloadedmetadata = () => {
        duration.value = video.value.duration
      }
    })

    // 切换播放和暂停
    const togglePlayPause = () => {
      if (video.value.paused) {
        video.value.play()
        isPlaying.value = true
      } else {
        video.value.pause()
        isPlaying.value = false
      }
    }

    // 更新进度条
    const updateProgress = () => {}

    // 跳转到指定时间
    const seek = () => {
      video.value.currentTime = currentTime.value
    }

    // 设置音量
    const setVolume = () => {
      video.value.volume = volume.value
    }

    // 重置播放器
    const resetPlayer = () => {
      isPlaying.value = false
    }

    // 格式化时间显示
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, '0')
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, '0')
      return `${minutes}:${seconds}`
    }

    return {
      video,
      isPlaying,
      currentTime,
      duration,
      volume,
      togglePlayPause,
      updateProgress,
      seek,
      setVolume,
      formatTime,
      resetPlayer,
      VideoPlay,
      VideoPause,
    }
  },
}
</script>

<style lang="less" scoped>
.video-player {
  position: relative;
  width: 100%;
  //display: flex;
  //flex-direction: column;
  //align-items: center;
  //background-color: #72767b;
  border-radius: 8px;

  .video {
  }

  .controls {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .el-icon {
      cursor: pointer;
      color: #222222;
      //background-color: #333333;
    }
  }
}

input[type='range'] {
  cursor: pointer;
}
</style>
