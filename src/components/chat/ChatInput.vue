<template>
  <div class="chat-input">
    <div class="chat-input-container">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题..."
        resize="none"
        @keydown.enter.prevent="handleEnter"
      />
      <div class="button-container">
        <el-button
          type="primary"
          :disabled="!inputMessage.trim() || loading"
          @click="sendMessage"
          :loading="loading"
          round
        >
          {{ loading ? '发送中...' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// 导出组件
export default {
  name: 'ChatInput',
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { videoGenerationService } from '../../services'

// 定义事件
const emit = defineEmits<{
  (e: 'send', message: string, taskId?: number): void
}>()

// 定义属性
const props = defineProps<{
  loading: boolean
}>()

// 输入消息
const inputMessage = ref('')

/**
 * 处理回车键事件
 */
const handleEnter = (e: KeyboardEvent) => {
  // 如果按下Shift+Enter，则允许换行
  if (e.shiftKey) return

  // 否则发送消息
  e.preventDefault()
  sendMessage()
}

/**
 * 发送消息
 */
const sendMessage = async () => {
  if (!inputMessage.value.trim() || props.loading) return

  const userMessage = inputMessage.value.trim()
  // 同时调用视频生成服务
  const taskId = await generateVideo(userMessage)
  console.log('视频生成结果:', taskId)
  // 发送消息事件
  emit('send', userMessage, taskId)
  // 清空输入
  inputMessage.value = ''
}

/**
 * 生成视频
 */
const generateVideo = async (inputText: string) => {
  try {
    // 确保WebSocket连接已建立（用于接收视频进度）
    // 注意：我们不通过WebSocket发送消息，只用它来接收视频生成进度

    // 调用视频生成API
    console.log('调用视频生成API:', inputText)
    const result = await videoGenerationService.generateVideo({
      inputText,
    })
    console.log('视频生成请求已发送，等待进度更新...')
    // 视频生成进度和完成通知会通过WebSocket消息接收
    return result
  } catch (error) {
    console.error('生成视频失败:', error)
  }
}
</script>

<style scoped lang="scss">
.chat-input {
  margin-top: auto;
}

.chat-input-container {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.button-container .el-button {
  background: linear-gradient(145deg, #4a90e2, #5c9ee6);
  border: none;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 40px;
  padding: 0 25px;
}

.button-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.button-container .el-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(74, 144, 226, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style> 