<template>
  <div
    class="chat-message"
    :class="{
      'user-message': message.role === 'user',
      'ai-message': message.role === 'assistant',
    }"
  >
    <div class="avatar">
      <el-avatar
        :size="40"
        :src="message.role === 'user' ? '/user-avatar.svg' : '/images/cart.jpeg'"
      ></el-avatar>
    </div>
    <div
      class="message-content"
      :class="message.role === 'assistant' ? 'ai-message' : 'user-message'"
    >
      <div v-if="message.type === 'video'">
        <!-- 视频生成进度消息 -->
        <VideoSteps
          :progress="videoProgressData.progress"
          :stage="videoProgressData.stage"
          :stageDesc="videoProgressData.stageDesc"
          :estimatedRemainingTime="videoProgressData.estimatedRemainingTime"
          :videoUrl="videoProgressData.videoUrl"
        />
      </div>
      <!-- 用户文本消息 -->
      <div v-else class="message-text" v-html="message.content"></div>
      <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'MessageItem',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import VideoSteps from './VideoSteps.vue'

interface Message {
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  taskId?: number
  type?: 'text' | 'video'
  videoData?: {
    progress: number
    stage: number
    stageDesc: string[]
    estimatedRemainingTime: number
    videoUrl: string
  }
  extra?: Record<string, unknown>
}

const props = defineProps<{
  message: Message
}>()

/**
 * 视频进度数据
 */
const videoProgressData = computed(() => {
  // 如果有videoData属性且消息类型为video，直接使用videoData
  if (props.message.type === 'video' && props.message.videoData) {
    const videoData = props.message.videoData
    return {
      progress: videoData.progress || 0,
      stage: videoData.stage || getStageFromProgress(videoData.progress || 0),
      stageDesc: Array.isArray(videoData.stageDesc) ? videoData.stageDesc : [],
      estimatedRemainingTime: videoData.estimatedRemainingTime,
      videoUrl: videoData.videoUrl || '',
      taskId: props.message.taskId,
    }
  }

  // 尝试从content解析（向后兼容旧格式）
  if (isLegacyVideoProgress(props.message.content)) {
    try {
      const data = JSON.parse(props.message.content)
      // 根据进度确定当前阶段
      const stage = getStageFromProgress(data.progress || 0)
      return {
        progress: data.progress || 0,
        stage: stage,
        stageDesc: Array.isArray(data.stageDesc)
          ? data.stageDesc
          : data.stageDesc
          ? [data.stageDesc]
          : [],
        estimatedRemainingTime: data.estimatedRemainingTime,
        videoUrl: data.videoUrl || '',
        taskId: data.taskId,
      }
    } catch (e) {
      console.error('解析视频进度数据失败:', e)
    }
  }

  // 默认返回空数据
  return {
    progress: 0,
    stage: 1,
    stageDesc: [],
    estimatedRemainingTime: undefined,
    videoUrl: '',
    taskId: undefined,
  }
})

/**
 * 根据进度值确定对应的阶段
 */
const getStageFromProgress = (progress: number): number => {
  if (progress <= 10) return 1 // 内容理解中
  if (progress <= 20) return 2 // 分镜头脚本生成中
  if (progress <= 50) return 3 // 视频生成中
  if (progress <= 70) return 4 // 语音合成中
  if (progress <= 90) return 5 // 视频合成中
  return 6 // 处理完成
}

/**
 * 检查是否为旧格式的视频进度消息（向后兼容）
 */
const isLegacyVideoProgress = (content: string): boolean => {
  if (!content) return false

  try {
    const data = JSON.parse(content)
    // 判断是否包含视频进度数据的关键字段
    return data && typeof data === 'object' && 'progress' in data && 'taskId' in data
  } catch {
    return false
  }
}

/**
 * 格式化消息时间
 */
const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped lang="scss">
.chat-message {
  display: flex;
  margin-bottom: 20px;
  padding: 0 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 100%;
  &.ai-message {
    width: calc(100% - 60px);
  }
}

.user-message .message-content {
  text-align: right;
}

.message-text {
  background-color: #fff;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 15px;
  word-break: break-word;
  line-height: 1.5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.user-message .message-text {
  background-color: #e3f2fd;
  color: #333;
  border-top-right-radius: 4px;
}

.ai-message .message-text {
  background-color: #f5f5f5;
  color: #333;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.message-video {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;

  .video-player {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .video-info {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .video-link {
      text-decoration: none;
    }
  }
}

.ai-message .message-video {
  background-color: #f5f5f5;
}

.user-message .message-video {
  background-color: #e3f2fd;
}
</style> 